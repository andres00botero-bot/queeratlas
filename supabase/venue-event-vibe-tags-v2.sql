begin;

alter table public.places
  drop constraint if exists qa_places_vibe_tags_max_3,
  drop constraint if exists qa_places_vibe_tags_max_4,
  drop constraint if exists qa_places_vibe_tags_allowed,
  add constraint qa_places_vibe_tags_max_4 check (cardinality(vibe_tags) <= 4),
  add constraint qa_places_vibe_tags_allowed check ((type = 'store' and vibe_tags = array['store']::text[]) or (type <> 'store' and vibe_tags <@ array['techno','pop','mixed','electronic','men_only','after','chill','cultural','fetish','social','cozy','massive','luxury','festival','underground','cruise','relax','drag','industrial','queer_friendly','sapphic']::text[]));

alter table public.events
  drop constraint if exists qa_events_vibe_tags_max_3,
  drop constraint if exists qa_events_vibe_tags_max_4,
  drop constraint if exists qa_events_vibe_tags_allowed,
  add constraint qa_events_vibe_tags_max_4 check (cardinality(vibe_tags) <= 4),
  add constraint qa_events_vibe_tags_allowed check (vibe_tags <@ array['techno','pop','mixed','electronic','men_only','after','chill','cultural','fetish','social','cozy','massive','luxury','festival','underground','cruise','relax','drag','industrial','queer_friendly','sapphic','service']::text[]);

alter table public.global_events
  drop constraint if exists qa_global_events_vibe_tags_max_3,
  drop constraint if exists qa_global_events_vibe_tags_max_4,
  drop constraint if exists qa_global_events_vibe_tags_allowed,
  add constraint qa_global_events_vibe_tags_max_4 check (cardinality(vibe_tags) <= 4),
  add constraint qa_global_events_vibe_tags_allowed check (vibe_tags <@ array['techno','pop','mixed','electronic','men_only','after','chill','cultural','fetish','social','cozy','massive','luxury','festival','underground','cruise','relax','drag','industrial','queer_friendly','sapphic','service']::text[]);

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
    if jsonb_array_length(patch->'vibe_tags')>4 or exists (
      select from jsonb_array_elements_text(patch->'vibe_tags') tag
      where tag is null or tag not in ('techno','pop','mixed','electronic','men_only','after','chill','cultural','fetish','social','cozy','massive','luxury','festival','underground','cruise','relax','drag','industrial','store','service','queer_friendly','sapphic')
      group by tag
    ) then raise exception 'Choose up to four standard vibe tags'; end if;
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

commit;
