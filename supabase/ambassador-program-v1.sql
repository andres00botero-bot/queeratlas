-- Queer Atlas scoped city and venue publishing. Apply after core-rls-hardening,
-- content-submissions-v1, and the existing city event/venue schema.
begin;

alter table public.events
  add column if not exists ambassador_venue_id bigint references public.places(id) on delete set null,
  add column if not exists ambassador_revision bigint not null default 0,
  add column if not exists ambassador_protected boolean not null default false;
alter table public.places
  add column if not exists ambassador_revision bigint not null default 0,
  add column if not exists ambassador_protected boolean not null default false;
create index if not exists qa_event_ambassador_venue on public.events(ambassador_venue_id)
  where ambassador_venue_id is not null;

create table if not exists public.qa_ambassador_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('city','venue')),
  city text not null check (city ~ '^[a-z0-9]+(_[a-z0-9]+)*$'),
  venue_id bigint references public.places(id) on delete cascade,
  status text not null check (status in ('active','paused')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  terms text not null check (terms in ('pilot','founding','annual')),
  created_at timestamptz not null default now(),
  check ((role = 'venue') = (venue_id is not null)),
  check (ends_at is null or ends_at > starts_at),
  check (terms <> 'annual' or ends_at is not null)
);
create unique index if not exists qa_ambassador_scope_key on public.qa_ambassador_assignments
  (user_id,city,role,coalesce(venue_id,0));

create table if not exists public.qa_ambassador_history (
  id bigint generated always as identity primary key,
  assignment_id uuid references public.qa_ambassador_assignments(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  entity_type text not null check (entity_type in ('event','venue')),
  entity_id bigint not null,
  before_data jsonb,
  after_data jsonb not null,
  created_at timestamptz not null default now(),
  restored_from bigint references public.qa_ambassador_history(id),
  request_id uuid,
  request_payload jsonb,
  unique(assignment_id,request_id)
);
create index if not exists qa_ambassador_history_assignment on public.qa_ambassador_history(assignment_id,id desc);

alter table public.qa_ambassador_assignments enable row level security;
alter table public.qa_ambassador_history enable row level security;
revoke all on public.qa_ambassador_assignments, public.qa_ambassador_history from public, anon, authenticated;
grant select on public.qa_ambassador_assignments, public.qa_ambassador_history to authenticated;
drop policy if exists assignment_visibility on public.qa_ambassador_assignments;
create policy assignment_visibility on public.qa_ambassador_assignments for select to authenticated
using (user_id = auth.uid() or public.qa_is_admin());
drop policy if exists history_visibility on public.qa_ambassador_history;
create policy history_visibility on public.qa_ambassador_history for select to authenticated using (public.qa_is_admin());

create or replace function public.qa_ambassador_revision_bump()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.ambassador_revision := old.ambassador_revision + 1;
  return new;
end $$;

-- Only an admin may authorise the existing independent trusted-contributor flow.
create or replace function public.qa_guard_trusted_contributor()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user in ('anon','authenticated') and not public.qa_is_admin() then
    if tg_op='INSERT' then
      if new.trusted_contributor then raise insufficient_privilege; end if;
    elsif new.trusted_contributor is distinct from old.trusted_contributor then
      raise insufficient_privilege;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists qa_guard_trusted_contributor on public.member_profiles;
create trigger qa_guard_trusted_contributor before insert or update on public.member_profiles
  for each row execute function public.qa_guard_trusted_contributor();

create or replace function public.qa_legacy_city_publisher()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.qa_is_admin() or (
    exists(select from public.member_profiles where user_id=auth.uid() and trusted_contributor)
    and not exists(select from public.qa_ambassador_assignments where user_id=auth.uid())
  )
$$;
revoke all on function public.qa_legacy_city_publisher() from public;
grant execute on function public.qa_legacy_city_publisher() to anon,authenticated;

-- Member submissions live in content_submissions. Direct publication of city
-- inventory requires a verified publisher even with a legacy permissive policy.
do $$
declare
  t text;
  kind "char";
  fn regprocedure;
begin
  foreach t in array array['places','events','places_with_stats'] loop
    select relkind into kind from pg_catalog.pg_class where oid=to_regclass('public.' || t);
    if kind in ('r','p') then
      execute format('alter table public.%I enable row level security',t);
      execute format('drop policy if exists qa_editor_insert on public.%I',t);
      execute format('create policy qa_editor_insert on public.%I as restrictive for insert to anon,authenticated with check (public.qa_legacy_city_publisher())',t);
      execute format('drop policy if exists qa_editor_update on public.%I',t);
      execute format('create policy qa_editor_update on public.%I as restrictive for update to anon,authenticated using (public.qa_is_admin()) with check (public.qa_is_admin())',t);
      execute format('drop policy if exists qa_editor_delete on public.%I',t);
      execute format('create policy qa_editor_delete on public.%I as restrictive for delete to anon,authenticated using (public.qa_is_admin())',t);
      execute format('revoke truncate, trigger, references on public.%I from public, anon, authenticated',t);
    elsif kind='v' then
      -- This statistics view is read-only in the app. Keep its existing read
      -- semantics: some installations derive counts from protected tables.
      execute format('revoke insert,update,delete on public.%I from public,anon,authenticated',t);
    end if;
    if t in ('places','events') then
      execute format('drop trigger if exists qa_ambassador_bump on public.%I',t);
      execute format('create trigger qa_ambassador_bump before update on public.%I for each row execute function public.qa_ambassador_revision_bump()',t);
    end if;
  end loop;
  foreach fn in array array[to_regprocedure('public.qa_apply_content_policies(text,boolean)'),to_regprocedure('public.qa_apply_owner_policies(text)')] loop
    if fn is not null then
      execute format('revoke execute on function %s from public,anon,authenticated',fn);
    end if;
  end loop;
end $$;

-- Keep this list aligned with src/lib/venueAccessPolicy.js.
create or replace function public.qa_ambassador_city_allowed(p_city text)
returns boolean language sql immutable set search_path = '' as $$
  select p_city not in ('moscow','saint_petersburg','cairo','beirut','marrakech','kuala_lumpur',
    'almaty','istanbul','beijing','chengdu','shanghai','jakarta','bali','colombo','yerevan','guatemala_city','tegucigalpa')
$$;

create or replace function public.qa_ambassador_public_row(r jsonb)
returns boolean language sql immutable set search_path = '' as $$
  select r is not null and coalesce(r->>'ambassador_protected','false') <> 'true'
    and coalesce(r->>'seo_indexable','true') <> 'false'
    and lower(coalesce(r->>'seo_quality_status','')) not in ('hold','draft','rejected','blocked','not_published')
    and lower(coalesce(r->>'status','')) not in ('hold','draft','rejected','blocked','not_published')
$$;

alter table public.qa_ambassador_assignments
  add column if not exists paid_eur_cents integer,
  add column if not exists received_on date;

drop function if exists public.qa_admin_set_ambassador(uuid,text,text,bigint,timestamptz,timestamptz,text,text);
create or replace function public.qa_admin_set_ambassador(
  p_user_id uuid,p_role text,p_city text,p_venue_id bigint,p_starts_at timestamptz,p_ends_at timestamptz,p_status text,p_terms text default 'pilot', p_paid_eur_cents integer default null, p_received_on date default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  result_id uuid;
begin
  if auth.uid() is null or not public.qa_is_admin() then raise insufficient_privilege; end if;
  if p_status='active' and p_terms='annual' and
     (coalesce(p_paid_eur_cents,0)<1000 or p_received_on is null or p_received_on>current_date) then
    raise exception 'Record the annual payment of at least EUR 10 and the date received';
  end if;
  if p_terms<>'annual' then p_paid_eur_cents:=null; p_received_on:=null; end if;
  if p_status='active' and not public.qa_ambassador_city_allowed(p_city) then raise exception 'This city needs editorial review'; end if;
  if p_status='active' and p_role='venue' then
    perform 1 from public.places v where v.id=p_venue_id and v.city=p_city and public.qa_ambassador_public_row(to_jsonb(v)) for share;
    if not found then raise exception 'Choose a public venue in this city'; end if;
  end if;
  insert into public.qa_ambassador_assignments(user_id,role,city,venue_id,starts_at,ends_at,status,terms,paid_eur_cents,received_on)
  values(p_user_id,p_role,p_city,p_venue_id,p_starts_at,p_ends_at,p_status,p_terms,p_paid_eur_cents,p_received_on)
  on conflict(user_id,city,role,(coalesce(venue_id,0))) do update
  set starts_at=excluded.starts_at, ends_at=excluded.ends_at,status=excluded.status,terms=excluded.terms,
      paid_eur_cents=excluded.paid_eur_cents, received_on=excluded.received_on
  returning id into result_id;
  return result_id;
end $$;

create or replace function public.qa_admin_link_ambassador_event(p_event_id bigint,p_venue_id bigint)
returns void language plpgsql security definer set search_path = '' as $$
declare
  venue_city text;
begin
  if auth.uid() is null or not public.qa_is_admin() then raise insufficient_privilege; end if;
  select city into strict venue_city from public.places where id=p_venue_id for share;
  update public.events set ambassador_venue_id=p_venue_id
    where id=p_event_id and city=venue_city and ambassador_venue_id is null;
  if not found then raise exception 'Event and venue must share a city and event must be unlinked'; end if;
end $$;

-- Identifiers here are produced solely from the editorial allowlists in the
-- callers. jsonb_populate_record performs PostgreSQL's native column casting.
-- This private helper is never callable through a client role.
create or replace function public.qa_ambassador_apply(p_table regclass,p_id bigint,p_values jsonb)
returns jsonb language plpgsql set search_path = '' as $$
declare
  cols text;
  vals text;
  assignments text;
  result jsonb;
begin
  select string_agg(format('%I',k),',' order by k),
    string_agg(format('r.%I',k),',' order by k),
    string_agg(format('%1$I=r.%1$I',k),',' order by k)
    into cols,vals,assignments from jsonb_object_keys(p_values) k;
  if p_id is null then
    execute format('insert into %1$s as t (%2$s) select %3$s from jsonb_populate_record(null::%1$s,$1) r returning to_jsonb(t)',p_table,cols,vals)
      into strict result using p_values;
  else
    execute format('update %1$s as t set %2$s from jsonb_populate_record(null::%1$s,$1) r where t.id=$2 returning to_jsonb(t)',p_table,assignments)
      into strict result using p_values,p_id;
  end if;
  return result;
end $$;
revoke all on function public.qa_ambassador_apply(regclass,bigint,jsonb) from public, anon, authenticated;

create or replace function public.qa_ambassador_save(
  p_assignment_id uuid,p_entity_type text,p_entity_id bigint,p_expected_revision bigint,p_payload jsonb
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  scope public.qa_ambassador_assignments%rowtype;
  history public.qa_ambassador_history%rowtype;
  target regclass;
  before_row jsonb;
  after_row jsonb;
  candidate jsonb;
  patch jsonb;
  assigned_venue bigint;
  request_key uuid;
  allowed text[] := array['name','description','location','lat','lng','link','hours','vibe_tags'];
  key text;
  intel_keys text[] := array['queue_wait','best_nights','crowd_mix','dress_code','staff_inclusivity'];
  intel_column text := case when p_entity_type='event' then 'event_intel' else 'venue_intel' end;
  intel jsonb;
  evidence jsonb;
begin
  select * into scope from public.qa_ambassador_assignments
    where id=p_assignment_id and user_id=auth.uid() and status='active'
      and starts_at<=statement_timestamp() and (ends_at is null or ends_at>statement_timestamp())
    for share;
  if not found or not public.qa_ambassador_city_allowed(scope.city) then raise insufficient_privilege; end if;

  if p_entity_type='event' then
    target := 'public.events'::regclass;
    intel_keys := array['entry_wait','best_arrival','crowd_mix','dress_code','host_inclusivity'];
    allowed := allowed || intel_keys || array['ambassador_venue_id','date','start_date','end_date','event_status','ticket_url'];
  elsif p_entity_type='venue' then
    target := 'public.places'::regclass;
    allowed := array_append(allowed,'type') || intel_keys;
    if scope.role='venue' and p_entity_id is distinct from scope.venue_id then raise insufficient_privilege; end if;
  else
    raise exception 'Unknown entity type';
  end if;

  if jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>40000 then
    raise exception 'Invalid editorial fields';
  end if;
  request_key := (p_payload->>'request_id')::uuid;
  patch := p_payload-'request_id';
  if patch='{}' or exists(select from jsonb_each(patch) f
      where not f.key=any(allowed) or (f.key<>'vibe_tags' and jsonb_typeof(f.value) not in ('null','string','number'))) then
    raise exception 'Unsupported editorial fields';
  end if;

  -- A retried request is identified by the same assignment, key AND payload.
  if request_key is not null then
    perform pg_advisory_xact_lock(hashtextextended(scope.id::text || request_key::text,0));
    select * into history from public.qa_ambassador_history
      where assignment_id=scope.id and request_id=request_key;
    if found then
      if history.request_payload<>p_payload or history.entity_type<>p_entity_type
          or (history.before_data->>'id')::bigint is distinct from p_entity_id then
        raise exception 'This request has already been used';
      end if;
      return history.after_data;
    end if;
  end if;

  if p_entity_id is not null then
    execute format('select to_jsonb(t) from %s t where t.id=$1 and t.city=$2 for update',target)
      into before_row using p_entity_id,scope.city;
    if not public.qa_ambassador_public_row(before_row) then raise insufficient_privilege; end if;
    if scope.role='venue' and p_entity_type='event' and
        (before_row->>'ambassador_venue_id')::bigint is distinct from scope.venue_id then raise insufficient_privilege; end if;
    if (before_row->>'ambassador_revision')::bigint is distinct from p_expected_revision then
      raise exception 'This listing changed. Reload before saving.' using errcode='40001';
    end if;
    if patch ? 'ambassador_venue_id' and
        (patch->>'ambassador_venue_id')::bigint is distinct from (before_row->>'ambassador_venue_id')::bigint then
      raise exception 'Only an editor can change the linked venue';
    end if;
    -- Empty/undisclosed locations and unstaffed cruising listings need
    -- editorial review before a member can publish their precise address.
    if before_row->>'type'='cruising_area' or (
      (nullif(btrim(before_row->>'location'),'') is null or
        lower(before_row->>'location') ~ '(undisclosed|withheld|private (address|location|venue)|secret (location|address|venue)|tba|tbd|to be announced|on request|upon (request|registration)|after (registration|booking)|dm for)')
      and ((patch ? 'location' and patch->'location' is distinct from before_row->'location')
        or (patch ? 'lat' and patch->'lat' is distinct from before_row->'lat')
        or (patch ? 'lng' and patch->'lng' is distinct from before_row->'lng'))
    ) then raise exception 'This location needs editorial review'; end if;
  else
    if p_expected_revision is not null then raise exception 'Unexpected revision for new listing'; end if;
    patch := patch || jsonb_build_object('city',scope.city);
  end if;

  if patch ? 'vibe_tags' then
    if jsonb_typeof(patch->'vibe_tags') <> 'array' then raise exception 'Invalid vibe tags'; end if;
    if jsonb_array_length(patch->'vibe_tags')>3 or exists (
      select from jsonb_array_elements_text(patch->'vibe_tags') tag
      where tag is null or tag not in ('techno','pop','mixed','electronic','men_only','after','chill','cultural','fetish','social','cozy','massive','luxury','festival','underground','cruise','relax','drag','industrial','store','service')
      group by tag
    ) then raise exception 'Choose up to three standard vibe tags'; end if;
    if p_entity_type='venue' and coalesce(patch->>'type',before_row->>'type')='store' then
      patch := patch || '{"vibe_tags":["store"]}'::jsonb;
    elsif p_entity_type='venue' and (patch->'vibe_tags') ?| array['store','service'] then
      raise exception 'Invalid venue vibe tags';
    end if;
    patch := patch || jsonb_build_object('vibe',initcap(replace(patch->'vibe_tags'->>0,'_',' ')));
  end if;
  if patch ?| intel_keys then
    intel := coalesce(nullif(before_row->intel_column,'null'::jsonb),'{}');
    evidence := coalesce(nullif(intel->'topic_evidence','null'::jsonb),nullif(intel->'topicEvidence','null'::jsonb),'{}');
    foreach key in array intel_keys loop
      if patch ? key then
        if jsonb_typeof(patch->key)<>'string' or length(patch->>key)>320 then raise exception 'Invalid intelligence text'; end if;
        intel := jsonb_set(intel,array[key],to_jsonb(btrim(patch->>key)));
        evidence := jsonb_set(evidence,array[key],jsonb_build_object('status','community_signal','checked_at',current_date));
        patch := patch-key;
      end if;
    end loop;
    patch := patch || jsonb_build_object(intel_column,intel || jsonb_build_object('topic_evidence',evidence));
  end if;
  candidate := coalesce(before_row,'{}'::jsonb) || patch;
  assigned_venue := (candidate->>'ambassador_venue_id')::bigint;
  if scope.role='venue' and p_entity_type='event' and assigned_venue is distinct from scope.venue_id then
    raise insufficient_privilege;
  end if;
  if assigned_venue is not null then
    perform 1 from public.places v where v.id=assigned_venue and v.city=scope.city and v.type<>'cruising_area'
      and public.qa_ambassador_public_row(to_jsonb(v)) for share;
    if not found then raise exception 'Choose a public venue in the assigned city'; end if;
  end if;
  if nullif(btrim(candidate->>'name'),'') is null or length(candidate->>'name')>200 then
    raise exception 'Enter a listing name of up to 200 characters';
  end if;
  if p_entity_id is null and (nullif(btrim(candidate->>'location'),'') is null
      or candidate->>'lat' is null or candidate->>'lng' is null) then
    raise exception 'Enter a public address and coordinates';
  end if;
  if patch ? 'lat' and (patch->>'lat' is null or (patch->>'lat')::numeric not between -90 and 90)
      or patch ? 'lng' and (patch->>'lng' is null or (patch->>'lng')::numeric not between -180 and 180) then
    raise exception 'Invalid map coordinates';
  end if;
  foreach key in array array['link','ticket_url'] loop
    if patch->>key <> '' and patch->>key !~* '^https?://[^[:space:]/]+([/?#][^[:space:]]*)?$' then
      raise exception 'Enter an http or https link';
    end if;
  end loop;
  if p_entity_type='venue' and (p_entity_id is null or patch ? 'type') and (
      candidate->>'type' is null or candidate->>'type' not in
      ('bar','club','restaurant','sauna','cruise_club','cafe','hotel','cinema','gallery','store')) then
    raise exception 'Choose a supported public venue type';
  end if;
  if p_entity_type='event' then
    if patch ? 'event_status' and (patch->>'event_status' is null or patch->>'event_status' not in
      ('scheduled','rescheduled','postponed','cancelled','moved_online','date_tba')) then raise exception 'Invalid event status'; end if;
    if p_entity_id is null or patch ?| array['date','start_date','end_date'] then
      if patch ? 'start_date' then patch := patch || jsonb_build_object('date',patch->'start_date');
      elsif patch ? 'date' then patch := patch || jsonb_build_object('start_date',patch->'date'); end if;
      candidate := candidate || patch;
      if coalesce(candidate->>'start_date',candidate->>'date') is null or
        (candidate->>'end_date')::date < coalesce(candidate->>'start_date',candidate->>'date')::date then
        raise exception 'Check the event start and end dates';
      end if;
    end if;
  end if;
  after_row := public.qa_ambassador_apply(target,p_entity_id,patch);
  insert into public.qa_ambassador_history(assignment_id,actor_id,entity_type,entity_id,before_data,after_data,request_id,request_payload)
    values(scope.id,auth.uid(),p_entity_type,(after_row->>'id')::bigint,before_row,after_row,request_key,p_payload);
  return after_row;
end $$;

create or replace function public.qa_admin_restore_ambassador(p_history_id bigint)
returns void language plpgsql security definer set search_path = '' as $$
declare
  h public.qa_ambassador_history%rowtype;
  target regclass;
  current_row jsonb;
  restore_data jsonb;
  restored jsonb;
begin
  if auth.uid() is null or not public.qa_is_admin() then raise insufficient_privilege; end if;
  select * into strict h from public.qa_ambassador_history where id=p_history_id;
  if h.before_data is null then raise exception 'New listings have no earlier version'; end if;
  target := case h.entity_type when 'event' then 'public.events'::regclass else 'public.places'::regclass end;
  execute format('select to_jsonb(t) from %s t where id=$1 for update',target) into strict current_row using h.entity_id;
  if current_row->'ambassador_revision' is distinct from h.after_data->'ambassador_revision' then
    raise exception 'A newer change exists. Review the current listing first.' using errcode='40001';
  end if;
  select jsonb_object_agg(key,value) into restore_data from jsonb_each(h.before_data) f
    where key = any(array['name','description','hours','link','location','lat','lng','type',
      'date','start_date','end_date','ticket_url','event_status','ambassador_venue_id','venue_intel','event_intel','vibe','vibe_tags'])
    and value is distinct from h.after_data->key;
  if restore_data is null then raise exception 'No changed editorial fields to restore'; end if;
  restored := public.qa_ambassador_apply(target,h.entity_id,restore_data);
  insert into public.qa_ambassador_history(assignment_id,actor_id,entity_type,entity_id,before_data,after_data,restored_from)
    values(h.assignment_id,auth.uid(),h.entity_type,h.entity_id,current_row,restored,h.id);
end $$;

revoke all on function public.qa_admin_set_ambassador(uuid,text,text,bigint,timestamptz,timestamptz,text,text,integer,date),
  public.qa_admin_link_ambassador_event(bigint,bigint), public.qa_admin_restore_ambassador(bigint),
  public.qa_ambassador_save(uuid,text,bigint,bigint,jsonb) from public,anon,authenticated;
grant execute on function public.qa_admin_set_ambassador(uuid,text,text,bigint,timestamptz,timestamptz,text,text,integer,date),
  public.qa_admin_link_ambassador_event(bigint,bigint), public.qa_admin_restore_ambassador(bigint),
  public.qa_ambassador_save(uuid,text,bigint,bigint,jsonb) to authenticated;
notify pgrst, 'reload schema';
commit;
