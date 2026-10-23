-- Member privacy v1. Apply AFTER existing profile, following and messaging schemas.
-- Review docs/member-privacy-rollout.md before applying. Never reapply legacy
-- permissive migrations afterwards. All writes are transactional and fail closed.
begin;

create table if not exists public.qa_privacy_rollout (
  id boolean primary key default true check (id),
  directory_open boolean not null default false
);
insert into public.qa_privacy_rollout(id) values(true) on conflict do nothing;
alter table public.qa_privacy_rollout enable row level security;
revoke all on public.qa_privacy_rollout from public, anon, authenticated;

create table if not exists public.qa_member_privacy (
  user_id uuid primary key references auth.users(id) on delete cascade,
  audience text not null default 'hidden' check(audience in ('hidden','contacts','community')),
  alias text not null default '' check(length(alias) <= 40),
  bio text not null default '' check(length(bio) <= 160),
  discovery_city text not null default '' check(length(discovery_city) <= 80),
  shared_pronouns text not null default '' check(length(shared_pronouns) <= 40),
  share_city boolean not null default false,
  share_pronouns boolean not null default false,
  share_avatar boolean not null default false,
  rules_version integer not null default 0,
  adult_confirmed_at timestamptz,
  joined_at timestamptz,
  published_at timestamptz,
  deletion_requested_at timestamptz,
  updated_at timestamptz not null default now()
);
create table if not exists public.qa_member_contacts (
  id uuid primary key default gen_random_uuid(),
  requester uuid not null references auth.users(id) on delete cascade,
  recipient uuid not null references auth.users(id) on delete cascade,
  state text not null default 'pending' check(state in ('pending','accepted','declined','revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(requester <> recipient)
);
create unique index if not exists qa_member_contacts_pair on public.qa_member_contacts
  (least(requester,recipient), greatest(requester,recipient));
create table if not exists public.qa_member_blocks (
  owner_id uuid not null references auth.users(id) on delete cascade,
  target_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(owner_id,target_id), check(owner_id <> target_id)
);
create table if not exists public.qa_member_privacy_reports (
  id uuid primary key default gen_random_uuid(),
  reporter uuid references auth.users(id) on delete set null,
  target_id uuid references auth.users(id) on delete set null,
  reason text not null check(reason in ('stalking','outing','impersonation','unwanted_contact','other')),
  details text not null default '' check(length(details) <= 1000),
  status text not null default 'new' check(status in ('new','reviewing','closed')),
  created_at timestamptz not null default now()
);
insert into public.qa_member_blocks(owner_id,target_id)
select s.user_id,case when t.user_a=s.user_id then t.user_b else t.user_a end
from public.qa_dm_thread_state s join public.qa_dm_threads t on t.id=s.thread_id
where s.blocked and s.user_id in(t.user_a,t.user_b) and t.user_a<>t.user_b
on conflict do nothing;
create table if not exists public.qa_privacy_request_budget (
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null, window_start timestamptz not null, requests integer not null default 1,
  primary key(user_id,action,window_start)
);
create table if not exists public.qa_member_privacy_audit (
  id bigint generated always as identity primary key,
  actor uuid references auth.users(id) on delete set null,
  report_id uuid references public.qa_member_privacy_reports(id) on delete cascade,
  action text not null,
  created_at timestamptz not null default now()
);

-- No direct client writes, including consent, approval, or rate-limit counters.
do $$ declare t text; begin
  foreach t in array array['qa_member_privacy','qa_member_contacts','qa_member_blocks',
    'qa_member_privacy_reports','qa_privacy_request_budget','qa_member_privacy_audit'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from public, anon, authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
end $$;

create or replace function public.qa_privacy_review_report(report uuid,new_status text,operator_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  if new_status not in('new','reviewing','closed') then raise exception 'invalid_status'; end if;
  update qa_member_privacy_reports set status=new_status where id=report;
  if not found then raise exception 'unavailable'; end if;
  insert into qa_member_privacy_audit(actor,report_id,action) values(operator_id,report,'status:'||new_status);
end $$;
create or replace function public.qa_privacy_prune()
returns void language plpgsql security definer set search_path=public as $$
begin
  delete from qa_privacy_request_budget where window_start<now()-interval '7 days';
  delete from qa_member_privacy_reports where created_at<now()-interval '180 days';
  delete from qa_member_privacy_audit where created_at<now()-interval '180 days';
end $$;

-- Explicit private-Atlas cleanup does not rely on legacy foreign-key cascades.
-- Only the verified server deletion flow may call this after hiding the account.
create or replace function public.qa_privacy_erase_private_atlas(target uuid)
returns void language plpgsql security definer set search_path=public as $$
declare t text;
begin
  if not exists(select 1 from qa_member_privacy where user_id=target and deletion_requested_at is not null)
    then raise exception 'deletion_not_requested'; end if;
  foreach t in array array['member_calendar_reminders','member_calendar_entries',
    'member_push_subscriptions','member_favorites','member_plans',
    'qa_member_checkins','qa_member_profile_memories','qa_presence'] loop
    if to_regclass('public.'||t) is not null then
      execute format('delete from public.%I where user_id=$1',t) using target;
    end if;
  end loop;
  delete from member_following where follower_user_id=target or followed_user_id=target;
end $$;

create or replace function public.qa_privacy_blocked(a uuid,b uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from qa_member_blocks where
    (owner_id=a and target_id=b) or (owner_id=b and target_id=a))
  or exists(select 1 from qa_dm_threads t join qa_dm_thread_state s on s.thread_id=t.id
    where least(t.user_a,t.user_b)=least(a,b) and greatest(t.user_a,t.user_b)=greatest(a,b) and s.blocked);
$$;
create or replace function public.qa_privacy_eligible(uid uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from qa_member_privacy p join auth.users u on u.id=p.user_id
    where p.user_id=uid and p.rules_version=1 and p.adult_confirmed_at is not null
    and p.joined_at is not null and p.deletion_requested_at is null and u.email_confirmed_at is not null
    and (u.banned_until is null or u.banned_until<=now()))
    and coalesce((select directory_open from qa_privacy_rollout where id),false);
$$;
create or replace function public.qa_privacy_contacts(a uuid,b uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from qa_member_contacts where state='accepted'
    and least(requester,recipient)=least(a,b) and greatest(requester,recipient)=greatest(a,b));
$$;
create or replace function public.qa_privacy_can_view(target uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select auth.uid() is not null and exists(select 1 from qa_member_privacy p
    where p.user_id=target and p.deletion_requested_at is null and (
      target=auth.uid() or (qa_privacy_eligible(auth.uid()) and qa_privacy_eligible(target)
      and not qa_privacy_blocked(auth.uid(),target)
      and (p.audience='community' or (p.audience='contacts' and qa_privacy_contacts(auth.uid(),target))))));
$$;
create or replace function public.qa_privacy_budget(kind text, maximum integer)
returns void language plpgsql security definer set search_path=public as $$
declare n integer;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  insert into qa_privacy_request_budget(user_id,action,window_start)
    values(auth.uid(),kind,date_trunc('hour',now()))
    on conflict(user_id,action,window_start) do update set requests=qa_privacy_request_budget.requests+1
    returning requests into n;
  if n>maximum then raise exception 'rate_limited'; end if;
end $$;

create or replace function public.qa_privacy_state()
returns jsonb language plpgsql security definer set search_path=public as $$
declare p qa_member_privacy;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  insert into qa_member_privacy(user_id) values(auth.uid()) on conflict do nothing;
  select * into p from qa_member_privacy where user_id=auth.uid();
  return jsonb_build_object('version',1,'profile',to_jsonb(p),'eligible',qa_privacy_eligible(auth.uid()),
    'directory_open',coalesce((select directory_open from qa_privacy_rollout where id),false),
    'contacts',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'user_id',
      case when c.requester=auth.uid() then c.recipient else c.requester end,
      'alias',other.alias,'incoming',c.recipient=auth.uid(),'state',c.state))
      from qa_member_contacts c join qa_member_privacy other on other.user_id=
      case when c.requester=auth.uid() then c.recipient else c.requester end
      where auth.uid() in(c.requester,c.recipient) and c.state in('pending','accepted')
      and other.deletion_requested_at is null and not qa_privacy_blocked(c.requester,c.recipient)),'[]'::jsonb),
    'blocks',coalesce((select jsonb_agg(target_id) from qa_member_blocks where owner_id=auth.uid()),'[]'::jsonb));
end $$;

create or replace function public.qa_privacy_save(settings jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare a text:=coalesce(settings->>'audience','hidden'); n text:=trim(coalesce(settings->>'alias',''));
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if a not in('hidden','contacts','community') then raise exception 'invalid_audience'; end if;
  if length(n)>40 or (a<>'hidden' and (length(n)<2 or n ~ '[@[:cntrl:]]')) then raise exception 'invalid_alias'; end if;
  if a<>'hidden' and not qa_privacy_eligible(auth.uid()) then raise exception 'community_unavailable'; end if;
  if exists(select 1 from qa_member_privacy where user_id=auth.uid() and deletion_requested_at is not null)
    then raise exception 'deletion_pending'; end if;
  insert into qa_member_privacy(user_id) values(auth.uid()) on conflict do nothing;
  update qa_member_privacy set audience=a, alias=n, bio=left(coalesce(settings->>'bio',''),160),
    discovery_city=left(coalesce(settings->>'discovery_city',''),80),
    shared_pronouns=left(coalesce(settings->>'shared_pronouns',''),40),
    share_city=coalesce((settings->>'share_city')::boolean,false),
    share_pronouns=coalesce((settings->>'share_pronouns')::boolean,false),
    share_avatar=coalesce((settings->>'share_avatar')::boolean,false),
    published_at=case when a='hidden' then null else now() end, updated_at=now()
    where user_id=auth.uid();
  return qa_privacy_state();
end $$;
create or replace function public.qa_privacy_join(adult_confirmed boolean, rules_accepted boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null or adult_confirmed is not true or rules_accepted is not true then raise exception 'consent_required'; end if;
  if not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null)
    then raise exception 'confirmed_email_required'; end if;
  insert into qa_member_privacy(user_id) values(auth.uid()) on conflict do nothing;
  if exists(select 1 from qa_member_privacy where user_id=auth.uid() and deletion_requested_at is not null)
    then raise exception 'deletion_pending'; end if;
  update qa_member_privacy set adult_confirmed_at=now(),rules_version=1,joined_at=coalesce(joined_at,now()) where user_id=auth.uid();
  return qa_privacy_state();
end $$;

-- Explicit projection: never return private profile rows or home location.
create or replace function public.qa_privacy_profile(target uuid)
returns jsonb language sql stable security definer set search_path=public as $$
  select jsonb_build_object('user_id',p.user_id,'alias',p.alias,'bio',p.bio,
    'discovery_city',case when p.share_city then p.discovery_city else '' end,
    'shared_pronouns',case when p.share_pronouns then p.shared_pronouns else '' end,
    'avatar_path',case when p.share_avatar then coalesce(mp.avatar_path,'') else '' end,
    'contact',qa_privacy_contacts(auth.uid(),p.user_id))
  from qa_member_privacy p left join member_profiles mp on mp.user_id=p.user_id
  where p.user_id=target and qa_privacy_can_view(target);
$$;
create or replace function public.qa_privacy_search(query_text text default '', city text default '', page integer default 0)
returns setof jsonb language plpgsql security definer set search_path=public as $$
begin
  if not qa_privacy_eligible(auth.uid()) then raise exception 'community_unavailable'; end if;
  if page<0 or page>4 or length(query_text)>80 or length(city)>80 then raise exception 'invalid_search'; end if;
  perform qa_privacy_budget('search',60);
  return query select qa_privacy_profile(p.user_id) from qa_member_privacy p
    where p.audience='community' and p.user_id<>auth.uid() and qa_privacy_can_view(p.user_id)
    and (trim(query_text)='' or position(lower(trim(query_text)) in lower(p.alias))>0)
    and (trim(city)='' or (p.share_city and lower(p.discovery_city)=lower(trim(city))))
    order by p.user_id limit 20 offset page*20;
end $$;
create or replace function public.qa_privacy_refresh(targets uuid[])
returns setof jsonb language plpgsql security definer set search_path=public as $$
begin
  if not qa_privacy_eligible(auth.uid()) or coalesce(array_length(targets,1),0)>20 then raise exception 'unavailable'; end if;
  return query select qa_privacy_profile(p.user_id) from qa_member_privacy p
    where p.user_id=any(targets) and p.audience='community' and p.user_id<>auth.uid() and qa_privacy_can_view(p.user_id)
    order by p.user_id;
end $$;
create or replace function public.qa_privacy_contact(target uuid, action text)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if not qa_privacy_eligible(auth.uid()) or target=auth.uid() or qa_privacy_blocked(auth.uid(),target)
    then raise exception 'unavailable'; end if;
  if action='request' then
    if not qa_privacy_can_view(target) or not exists(select 1 from qa_member_privacy where user_id=auth.uid()
      and length(trim(alias))>=2 and alias !~ '[@[:cntrl:]]') then raise exception 'unavailable'; end if;
    perform qa_privacy_budget('contact',10);
    insert into qa_member_contacts(requester,recipient) values(auth.uid(),target) on conflict do nothing;
  elsif action='accept' then
    update qa_member_contacts set state='accepted',updated_at=now()
      where requester=target and recipient=auth.uid() and state='pending' and qa_privacy_eligible(target);
  elsif action in('decline','revoke') then
    update qa_member_contacts set state=case when action='decline' then 'declined' else 'revoked' end,updated_at=now()
      where auth.uid() in(requester,recipient) and target in(requester,recipient)
      and (action='revoke' or recipient=auth.uid());
  else raise exception 'invalid_action'; end if;
  return qa_privacy_state();
end $$;
create or replace function public.qa_privacy_block(target uuid, blocked boolean default true)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null or target is null or target=auth.uid() then raise exception 'invalid_target'; end if;
  if blocked then
    insert into qa_member_blocks(owner_id,target_id) values(auth.uid(),target) on conflict do nothing;
    update qa_member_contacts set state='revoked',updated_at=now()
      where auth.uid() in(requester,recipient) and target in(requester,recipient);
  else
    delete from qa_member_blocks where owner_id=auth.uid() and target_id=target;
    update qa_dm_thread_state s set blocked=false where s.user_id=auth.uid()
      and exists(select 1 from qa_dm_threads t where t.id=s.thread_id and auth.uid() in(t.user_a,t.user_b) and target in(t.user_a,t.user_b));
  end if;
  return qa_privacy_state();
end $$;
create or replace function public.qa_privacy_report(target uuid, reason text, details text default '')
returns uuid language plpgsql security definer set search_path=public as $$
declare report_id uuid;
begin
  if auth.uid() is null or target=auth.uid() or target is null then raise exception 'invalid_target'; end if;
  perform qa_privacy_budget('report',10);
  insert into qa_member_privacy_reports(reporter,target_id,reason,details)
    values(auth.uid(),target,reason,left(details,1000)) returning id into report_id;
  return report_id;
end $$;
create or replace function public.qa_privacy_request_deletion()
returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  insert into qa_member_privacy(user_id) values(auth.uid()) on conflict do nothing;
  update qa_member_privacy set audience='hidden',share_avatar=false,deletion_requested_at=now(),published_at=null
    where user_id=auth.uid();
  update qa_member_contacts set state='revoked',updated_at=now() where auth.uid() in(requester,recipient);
end $$;

create or replace function public.qa_privacy_threads()
returns setof jsonb language sql stable security definer set search_path=public as $$
  select jsonb_build_object('id',t.id,'user_id',p.user_id,'alias',p.alias)
  from qa_dm_threads t join qa_member_privacy p on p.user_id=case when t.user_a=auth.uid() then t.user_b else t.user_a end
  where auth.uid() in(t.user_a,t.user_b) and qa_privacy_eligible(auth.uid())
    and qa_privacy_eligible(p.user_id) and qa_privacy_contacts(auth.uid(),p.user_id)
    and not qa_privacy_blocked(auth.uid(),p.user_id)
  order by t.updated_at desc limit 50;
$$;
create or replace function public.qa_privacy_messages(target uuid)
returns setof jsonb language plpgsql security definer set search_path=public as $$
begin
  if not qa_privacy_eligible(auth.uid()) or not qa_privacy_eligible(target)
    or not qa_privacy_contacts(auth.uid(),target) or qa_privacy_blocked(auth.uid(),target) then raise exception 'unavailable'; end if;
  return query select jsonb_build_object('id',m.id,'sender_id',m.sender_id,'body',m.body,'created_at',m.created_at)
    from qa_dm_messages m join qa_dm_threads t on t.id=m.thread_id
    where least(t.user_a,t.user_b)=least(auth.uid(),target) and greatest(t.user_a,t.user_b)=greatest(auth.uid(),target)
    order by m.created_at desc,m.id desc limit 50;
end $$;
create or replace function public.qa_privacy_send(target uuid,message_body text)
returns void language plpgsql security definer set search_path=public as $$
declare thread uuid;
begin
  if not qa_privacy_eligible(auth.uid()) or not qa_privacy_eligible(target) or target=auth.uid()
    or not qa_privacy_contacts(auth.uid(),target) or qa_privacy_blocked(auth.uid(),target)
    then raise exception 'unavailable'; end if;
  if length(trim(message_body))<1 or length(message_body)>2000 then raise exception 'invalid_message'; end if;
  perform qa_privacy_budget('message',120);
  insert into qa_dm_threads(user_a,user_b) values(least(auth.uid(),target),greatest(auth.uid(),target))
    on conflict(user_a,user_b) do update set updated_at=now() returning id into thread;
  insert into qa_dm_messages(thread_id,sender_id,body) values(thread,auth.uid(),trim(message_body));
end $$;

-- Every old permissive SELECT policy is removed, not merely supplemented:
-- permissive policies are OR-ed. Private raw rows remain owner-only.
do $$ declare t text; pol record; begin
  foreach t in array array['member_profiles','qa_member_profile_memories','qa_presence','member_following','member_favorites','member_plans','qa_member_checkins'] loop
    if to_regclass('public.'||t) is not null then
      for pol in select policyname from pg_policies where schemaname='public' and tablename=t and cmd in('SELECT','ALL') loop
        execute format('drop policy %I on public.%I',pol.policyname,t);
      end loop;
      execute format('alter table public.%I enable row level security',t);
      execute format('revoke select on public.%I from anon, public',t);
      if t='member_following' then
        execute format('create policy qa_privacy_owner_read on public.%I for select to authenticated using(follower_user_id=auth.uid())',t);
      else
        execute format('create policy qa_privacy_owner_read on public.%I for select to authenticated using(user_id=auth.uid())',t);
      end if;
    end if;
  end loop;
end $$;

-- Restrictive policies also constrain any legacy broad write/read policies.
drop policy if exists qa_privacy_profile_owner_gate on public.member_profiles;
create policy qa_privacy_profile_owner_gate on public.member_profiles as restrictive for all to authenticated
using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists qa_privacy_profile_insert on public.member_profiles;
create policy qa_privacy_profile_insert on public.member_profiles for insert to authenticated with check(user_id=auth.uid());
drop policy if exists qa_privacy_profile_update on public.member_profiles;
create policy qa_privacy_profile_update on public.member_profiles for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
do $$ declare t text; begin
  foreach t in array array['member_favorites','member_plans','qa_member_checkins','qa_member_profile_memories'] loop
    if to_regclass('public.'||t) is not null then
      execute format('drop policy if exists qa_privacy_atlas_owner on public.%I',t);
      execute format('create policy qa_privacy_atlas_owner on public.%I for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid())',t);
      execute format('drop policy if exists qa_privacy_atlas_gate on public.%I',t);
      execute format('create policy qa_privacy_atlas_gate on public.%I as restrictive for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid())',t);
    end if;
  end loop;
end $$;
drop policy if exists qa_privacy_dm_read_gate on public.qa_dm_threads;
create policy qa_privacy_dm_read_gate on public.qa_dm_threads as restrictive for select to authenticated
using(auth.uid() in(user_a,user_b) and public.qa_can_open_dm(case when user_a=auth.uid() then user_b else user_a end));
drop policy if exists qa_privacy_messages_read_gate on public.qa_dm_messages;
create policy qa_privacy_messages_read_gate on public.qa_dm_messages as restrictive for select to authenticated
using(exists(select 1 from public.qa_dm_threads t where t.id=thread_id and auth.uid() in(t.user_a,t.user_b)
  and public.qa_can_open_dm(case when t.user_a=auth.uid() then t.user_b else t.user_a end)));

-- Legacy visibility can no longer claim public/friends access.
alter table public.member_profiles drop constraint if exists member_profiles_visibility_allowed;
alter table public.member_profiles add constraint member_profiles_visibility_allowed check(visibility in('hidden','friends','members','public'));
alter table public.member_profiles alter column visibility set default 'hidden';
update public.member_profiles set visibility='hidden';

-- Revoke legacy projections, including SECURITY DEFINER RPCs that bypass RLS.
-- An inventory is required before launch for functions outside public schema.
do $$ declare f record; v record; begin
  for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.prokind='f' and p.prosecdef
    and p.proname not like 'qa_privacy_%' and p.proname not in('qa_is_admin','qa_dm_can_send','qa_can_open_dm')
    and (p.prosrc ~ '(member_profiles|member_following|qa_member_leaderboard|qa_presence|qa_member_profile_memories|member_favorites|member_plans|qa_member_checkins|qa_dm_)'
      or p.proname like 'qa_apply_%')
  loop execute format('revoke execute on function %s from public, anon, authenticated',f.signature); end loop;
  for v in select table_name from information_schema.views where table_schema='public'
    and view_definition ~ '(member_profiles|qa_member_leaderboard|qa_presence)'
  loop execute format('revoke select on public.%I from public, anon, authenticated',v.table_name); end loop;
end $$;

-- Messaging requires a mutual accepted relationship and denies either block.
-- Clients cannot rewrite thread participants or move messages between threads.
revoke insert,update,delete on public.qa_dm_threads,public.qa_dm_messages from public,anon,authenticated;
create or replace function public.qa_can_open_dm(target_user_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select qa_privacy_eligible(auth.uid()) and qa_privacy_eligible(target_user_id)
    and qa_privacy_contacts(auth.uid(),target_user_id) and not qa_privacy_blocked(auth.uid(),target_user_id);
$$;
create or replace function public.qa_dm_can_send(thread_uuid uuid,sender uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select sender=auth.uid() and exists(select 1 from qa_dm_threads t where t.id=thread_uuid
    and sender in(t.user_a,t.user_b) and qa_can_open_dm(case when sender=t.user_a then t.user_b else t.user_a end));
$$;

create or replace function public.qa_privacy_avatar_read(object_name text)
returns boolean language sql stable security definer set search_path=public as $$
  select auth.uid() is not null and (
    split_part(object_name,'/',1)=auth.uid()::text or exists(
      select 1 from qa_member_privacy p join member_profiles mp on mp.user_id=p.user_id
      where mp.avatar_path=object_name and p.share_avatar and qa_privacy_can_view(p.user_id)));
$$;
grant execute on function public.qa_privacy_avatar_read(text) to authenticated;

create or replace function public.qa_privacy_event_visible(host uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select auth.uid() is not null and not qa_privacy_blocked(auth.uid(),host);
$$;

-- Public contributions keep their public audience. Within an authenticated
-- account, blocking also suppresses the other account's community contributions.
create or replace function public.qa_privacy_public_author_visible(author uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select author is null or auth.uid() is null or not qa_privacy_blocked(auth.uid(),author);
$$;
do $$ declare t text; begin
  if to_regclass('public.community_messages') is not null then
    execute 'alter table public.community_messages add column if not exists user_id uuid references auth.users(id) on delete set null';
    execute 'alter table public.community_messages alter column user_id set default auth.uid()';
    execute 'drop policy if exists qa_privacy_message_author_insert on public.community_messages';
    execute 'create policy qa_privacy_message_author_insert on public.community_messages as restrictive for insert to authenticated with check(user_id=auth.uid())';
    execute 'drop policy if exists qa_privacy_message_author_update on public.community_messages';
    execute 'create policy qa_privacy_message_author_update on public.community_messages as restrictive for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid())';
    execute 'drop policy if exists qa_privacy_message_author_delete on public.community_messages';
    execute 'create policy qa_privacy_message_author_delete on public.community_messages as restrictive for delete to authenticated using(user_id=auth.uid() or public.qa_is_admin())';
  end if;
  foreach t in array array['community_stories','community_guides','community_jobs',
    'community_topics','community_messages','community_ideas'] loop
    if exists(select 1 from information_schema.columns where table_schema='public' and table_name=t and column_name='user_id') then
      execute format('alter table public.%I enable row level security',t);
      execute format('drop policy if exists qa_privacy_author_block_gate on public.%I',t);
      execute format('create policy qa_privacy_author_block_gate on public.%I as restrictive for select to authenticated using(public.qa_privacy_public_author_visible(user_id))',t);
    end if;
  end loop;
  if to_regclass('public.community_messages') is not null and to_regclass('public.community_topics') is not null then
    execute 'drop policy if exists qa_privacy_topic_reply_gate on public.community_messages';
    execute 'create policy qa_privacy_topic_reply_gate on public.community_messages as restrictive for insert to authenticated with check(exists(select 1 from public.community_topics t where t.id=topic_id))';
  end if;
end $$;
do $$ begin
  if to_regclass('public.qa_private_events') is not null then
    execute 'drop policy if exists qa_privacy_event_block_gate on public.qa_private_events';
    execute 'create policy qa_privacy_event_block_gate on public.qa_private_events as restrictive for all to authenticated using(public.qa_privacy_event_visible(host_user_id)) with check(public.qa_privacy_event_visible(host_user_id))';
  end if;
  if to_regclass('public.qa_private_event_invites') is not null then
    execute 'drop policy if exists qa_privacy_invite_block_gate on public.qa_private_event_invites';
    execute 'create policy qa_privacy_invite_block_gate on public.qa_private_event_invites as restrictive for all to authenticated using(public.qa_privacy_event_visible(requester_user_id) and exists(select 1 from public.qa_private_events e where e.id=event_id and public.qa_privacy_event_visible(e.host_user_id) and (requester_user_id=auth.uid() or e.host_user_id=auth.uid()))) with check(public.qa_privacy_event_visible(requester_user_id) and exists(select 1 from public.qa_private_events e where e.id=event_id and public.qa_privacy_event_visible(e.host_user_id) and (requester_user_id=auth.uid() or e.host_user_id=auth.uid())))';
  end if;
end $$;

-- Restrict existing broad storage policies too; all member memories stay owner-only.
update storage.buckets set public=false where id in('member-avatars','member-memories');
drop policy if exists qa_privacy_images_gate on storage.objects;
create policy qa_privacy_images_gate on storage.objects as restrictive for select to anon,authenticated
using(bucket_id not in('member-avatars','member-memories') or (
  auth.uid() is not null and (
    (storage.foldername(name))[1]=auth.uid()::text
    or (bucket_id='member-avatars' and public.qa_privacy_avatar_read(name))
  )
));
drop policy if exists qa_privacy_images_read on storage.objects;
create policy qa_privacy_images_read on storage.objects for select to authenticated
using(bucket_id='member-avatars' and public.qa_privacy_avatar_read(name));

-- Existing broad write policies must not allow replacing another member's image.
drop policy if exists qa_privacy_images_insert_gate on storage.objects;
create policy qa_privacy_images_insert_gate on storage.objects as restrictive for insert to anon,authenticated
with check(bucket_id not in('member-avatars','member-memories') or
  (auth.uid() is not null and (storage.foldername(name))[1]=auth.uid()::text));
drop policy if exists qa_privacy_images_update_gate on storage.objects;
create policy qa_privacy_images_update_gate on storage.objects as restrictive for update to anon,authenticated
using(bucket_id not in('member-avatars','member-memories') or
  (auth.uid() is not null and (storage.foldername(name))[1]=auth.uid()::text))
with check(bucket_id not in('member-avatars','member-memories') or
  (auth.uid() is not null and (storage.foldername(name))[1]=auth.uid()::text));
drop policy if exists qa_privacy_images_delete_gate on storage.objects;
create policy qa_privacy_images_delete_gate on storage.objects as restrictive for delete to anon,authenticated
using(bucket_id not in('member-avatars','member-memories') or
  (auth.uid() is not null and (storage.foldername(name))[1]=auth.uid()::text));

-- Private helpers cannot be invoked with attacker-chosen identifiers.
do $$ declare f record; begin
  for f in select p.oid::regprocedure as signature,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname like 'qa_privacy_%' loop
    execute format('revoke all on function %s from public,anon,authenticated',f.signature);
    if f.proname in('qa_privacy_state','qa_privacy_save','qa_privacy_join','qa_privacy_profile',
      'qa_privacy_search','qa_privacy_contact','qa_privacy_block','qa_privacy_report','qa_privacy_request_deletion','qa_privacy_can_view','qa_privacy_avatar_read',
      'qa_privacy_threads','qa_privacy_messages','qa_privacy_send','qa_privacy_refresh','qa_privacy_event_visible','qa_privacy_public_author_visible') then
      execute format('grant execute on function %s to authenticated',f.signature);
    end if;
  end loop;
end $$;
-- An anonymous storage read evaluates this policy helper too. It returns false
-- before any identity lookup when auth.uid() is null.
grant execute on function public.qa_privacy_avatar_read(text) to anon;
grant execute on function public.qa_privacy_review_report(uuid,text,uuid) to service_role;
grant execute on function public.qa_privacy_prune() to service_role;
grant execute on function public.qa_privacy_erase_private_atlas(uuid) to service_role;
grant usage,select on sequence public.qa_member_privacy_audit_id_seq to service_role;
commit;
