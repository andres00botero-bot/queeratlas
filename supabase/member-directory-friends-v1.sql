-- People directory and friend-request gate.
-- Apply after member-privacy-v1.sql and admin-direct-messaging-v1.sql.
begin;

alter table public.qa_member_privacy
  add column if not exists directory_listed boolean not null default true;

-- A confirmed, non-banned account is an active member. Privacy preferences control
-- fields, never whether the person can accept a friend request or receive a DM.
create or replace function public.qa_privacy_eligible(uid uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select exists(
    select 1 from auth.users u left join public.qa_member_privacy p on p.user_id = u.id
    where u.id = uid and u.email_confirmed_at is not null
      and (u.banned_until is null or u.banned_until <= now())
      and coalesce(p.deletion_requested_at, 'infinity'::timestamptz) > now()
  ) and coalesce((select directory_open from public.qa_privacy_rollout where id), false);
$$;

-- Profile details are visible only to the member and accepted friends.
create or replace function public.qa_privacy_profile(target uuid)
returns jsonb language sql stable security definer set search_path='' as $$
  select jsonb_build_object('user_id', u.id, 'alias', coalesce(nullif(p.alias, ''), nullif(mp.display_name, ''), 'Member'),
    'bio', coalesce(p.bio, ''), 'discovery_city', case when p.share_city then p.discovery_city else '' end,
    'shared_pronouns', case when p.share_pronouns then p.shared_pronouns else '' end,
    'avatar_path', case when p.share_avatar then coalesce(mp.avatar_path, '') else '' end,
    'contact', public.qa_privacy_contacts(auth.uid(), u.id))
  from auth.users u
  left join public.qa_member_privacy p on p.user_id = u.id
  left join public.member_profiles mp on mp.user_id = u.id
  where u.id = target and public.qa_privacy_eligible(u.id)
    and (u.id = auth.uid() or public.qa_privacy_contacts(auth.uid(), u.id))
    and not public.qa_privacy_blocked(auth.uid(), u.id);
$$;

create or replace function public.qa_privacy_state()
returns jsonb language plpgsql security definer set search_path='' as $$
declare p public.qa_member_privacy;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  insert into public.qa_member_privacy(user_id) values(auth.uid()) on conflict do nothing;
  select * into p from public.qa_member_privacy where user_id = auth.uid();
  return jsonb_build_object('version', 1, 'profile', to_jsonb(p), 'eligible', public.qa_privacy_eligible(auth.uid()),
    'directory_open', coalesce((select directory_open from public.qa_privacy_rollout where id), false),
    'contacts', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'user_id', other_user.id,
      'alias', coalesce(nullif(other.alias, ''), nullif(mp.display_name, ''), 'Member'),
      'incoming', c.recipient = auth.uid(), 'state', c.state))
      from public.qa_member_contacts c
      join auth.users other_user on other_user.id = case when c.requester = auth.uid() then c.recipient else c.requester end
      left join public.qa_member_privacy other on other.user_id = other_user.id
      left join public.member_profiles mp on mp.user_id = other_user.id
      where auth.uid() in(c.requester, c.recipient) and c.state in('pending', 'accepted')
        and public.qa_privacy_eligible(other_user.id)
        and not public.qa_privacy_blocked(c.requester, c.recipient)), '[]'::jsonb),
    'blocks', coalesce((select jsonb_agg(target_id) from public.qa_member_blocks where owner_id = auth.uid()), '[]'::jsonb));
end;
$$;

-- People lists every eligible member without exposing a closed member's identity.
-- A closed row has no user_id and cannot be used to send a request.
create or replace function public.qa_privacy_search(query_text text default '', city text default '', page integer default 0)
returns setof jsonb language plpgsql security definer set search_path='' as $$
begin
  if not public.qa_privacy_eligible(auth.uid()) then raise exception 'community_unavailable'; end if;
  if page < 0 or page > 49 or length(query_text) > 80 or length(city) > 80 then raise exception 'invalid_search'; end if;
  perform public.qa_privacy_budget('search', 60);
  return query
    select jsonb_build_object(
      'user_id', case when coalesce(p.directory_listed, true) and length(trim(coalesce(nullif(p.alias, ''), mp.display_name, ''))) >= 2 and coalesce(nullif(p.alias, ''), mp.display_name, '') !~ '[@[:cntrl:]]' then u.id else null end,
      'alias', case when coalesce(p.directory_listed, true) and length(trim(coalesce(nullif(p.alias, ''), mp.display_name, ''))) >= 2 and coalesce(nullif(p.alias, ''), mp.display_name, '') !~ '[@[:cntrl:]]' then coalesce(nullif(p.alias, ''), mp.display_name) else null end,
      'relationship', case when not (coalesce(p.directory_listed, true) and length(trim(coalesce(nullif(p.alias, ''), mp.display_name, ''))) >= 2 and coalesce(nullif(p.alias, ''), mp.display_name, '') !~ '[@[:cntrl:]]') then 'private' else coalesce((select case
        when c.state = 'accepted' then 'friend'
        when c.state = 'pending' and c.requester = auth.uid() then 'pending_sent'
        when c.state = 'pending' then 'pending_received'
        else 'none' end
        from public.qa_member_contacts c
        where (c.requester = auth.uid() and c.recipient = u.id)
           or (c.recipient = auth.uid() and c.requester = u.id)
        order by c.updated_at desc limit 1), 'none') end
    )
    from auth.users u
    left join public.qa_member_privacy p on p.user_id = u.id
    left join public.member_profiles mp on mp.user_id = u.id
    where u.id <> auth.uid()
      and u.email_confirmed_at is not null
      and (u.banned_until is null or u.banned_until <= now())
      and coalesce(p.deletion_requested_at, 'infinity'::timestamptz) > now()
      and not public.qa_privacy_blocked(auth.uid(), u.id)
      and (trim(query_text) = '' or (coalesce(p.directory_listed, true) and position(lower(trim(query_text)) in lower(coalesce(nullif(p.alias, ''), mp.display_name, ''))) > 0))
    order by case when coalesce(p.directory_listed, true) then lower(coalesce(nullif(p.alias, ''), mp.display_name)) else null end nulls last, u.id
    limit 50 offset page * 50;
end;
$$;

create or replace function public.qa_privacy_refresh(targets uuid[])
returns setof jsonb language sql stable security definer set search_path='' as $$
  select jsonb_build_object(
    'user_id', u.id,
    'alias', coalesce(nullif(p.alias, ''), mp.display_name),
    'relationship', coalesce((select case
      when c.state = 'accepted' then 'friend'
      when c.state = 'pending' and c.requester = auth.uid() then 'pending_sent'
      when c.state = 'pending' then 'pending_received'
      else 'none' end
      from public.qa_member_contacts c
      where (c.requester = auth.uid() and c.recipient = u.id)
         or (c.recipient = auth.uid() and c.requester = u.id)
      order by c.updated_at desc limit 1), 'none')
  )
  from auth.users u
  left join public.qa_member_privacy p on p.user_id = u.id
  left join public.member_profiles mp on mp.user_id = u.id
  where u.id = any(targets)
    and coalesce(p.directory_listed, true)
    and public.qa_privacy_eligible(u.id)
    and length(trim(coalesce(nullif(p.alias, ''), mp.display_name, ''))) >= 2
    and not public.qa_privacy_blocked(auth.uid(), u.id);
$$;

create or replace function public.qa_privacy_save(settings jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  a text := coalesce(settings->>'audience', 'hidden');
  n text := trim(coalesce(settings->>'alias', ''));
  listed boolean := coalesce((settings->>'directory_listed')::boolean, true);
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if a not in ('hidden', 'contacts', 'community') then raise exception 'invalid_audience'; end if;
  if length(n) > 40 or (listed and (length(n) < 2 or n ~ '[@[:cntrl:]]')) then raise exception 'invalid_alias'; end if;
  if (a <> 'hidden' or listed) and not public.qa_privacy_eligible(auth.uid()) then raise exception 'community_unavailable'; end if;
  if exists(select 1 from public.qa_member_privacy where user_id = auth.uid() and deletion_requested_at is not null) then raise exception 'deletion_pending'; end if;
  insert into public.qa_member_privacy(user_id) values(auth.uid()) on conflict do nothing;
  update public.qa_member_privacy set audience = a, alias = n, directory_listed = listed,
    bio = left(coalesce(settings->>'bio', ''), 160), discovery_city = left(coalesce(settings->>'discovery_city', ''), 80),
    shared_pronouns = left(coalesce(settings->>'shared_pronouns', ''), 40),
    share_city = coalesce((settings->>'share_city')::boolean, false), share_pronouns = coalesce((settings->>'share_pronouns')::boolean, false),
    share_avatar = coalesce((settings->>'share_avatar')::boolean, false),
    published_at = case when a = 'hidden' then null else now() end, updated_at = now()
  where user_id = auth.uid();
  return public.qa_privacy_state();
end;
$$;

-- A request is allowed from one listed, eligible alias to another. Acceptance is
-- the only transition that unlocks profile details and ordinary member DM.
create or replace function public.qa_privacy_contact(target uuid, action text)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
  if not public.qa_privacy_eligible(auth.uid()) or target = auth.uid()
    or public.qa_privacy_blocked(auth.uid(), target) then raise exception 'unavailable'; end if;
  if action = 'request' then
    if not exists (
      select 1 from auth.users u left join public.qa_member_privacy p on p.user_id = u.id
      left join public.member_profiles mp on mp.user_id = u.id
      where u.id = auth.uid() and coalesce(p.directory_listed, true)
        and length(trim(coalesce(nullif(p.alias, ''), mp.display_name, ''))) >= 2
        and coalesce(nullif(p.alias, ''), mp.display_name, '') !~ '[@[:cntrl:]]'
    ) or not exists (
      select 1 from auth.users u left join public.qa_member_privacy p on p.user_id = u.id
      left join public.member_profiles mp on mp.user_id = u.id
      where u.id = target and coalesce(p.directory_listed, true)
        and coalesce(p.deletion_requested_at, 'infinity'::timestamptz) > now()
        and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until <= now())
        and length(trim(coalesce(nullif(p.alias, ''), mp.display_name, ''))) >= 2
        and coalesce(nullif(p.alias, ''), mp.display_name, '') !~ '[@[:cntrl:]]'
    ) then raise exception 'unavailable'; end if;
    perform public.qa_privacy_budget('contact', 10);
    insert into public.qa_member_contacts(requester, recipient) values(auth.uid(), target) on conflict do nothing;
  elsif action = 'accept' then
    update public.qa_member_contacts set state = 'accepted', updated_at = now()
      where requester = target and recipient = auth.uid() and state = 'pending' and public.qa_privacy_eligible(target);
  elsif action in ('decline', 'revoke') then
    update public.qa_member_contacts set state = case when action = 'decline' then 'declined' else 'revoked' end, updated_at = now()
      where auth.uid() in (requester, recipient) and target in (requester, recipient)
        and (action = 'revoke' or recipient = auth.uid());
  else raise exception 'invalid_action'; end if;
  return public.qa_privacy_state();
end;
$$;

revoke execute on function public.qa_privacy_profile(uuid) from public, anon;
revoke execute on function public.qa_privacy_search(text, text, integer) from public, anon;
revoke execute on function public.qa_privacy_contact(uuid, text) from public, anon;
grant execute on function public.qa_privacy_profile(uuid) to authenticated;
grant execute on function public.qa_privacy_search(text, text, integer) to authenticated;
grant execute on function public.qa_privacy_refresh(uuid[]) to authenticated;
grant execute on function public.qa_privacy_contact(uuid, text) to authenticated;
grant execute on function public.qa_privacy_save(jsonb) to authenticated;
commit;
