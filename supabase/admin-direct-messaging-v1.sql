-- Queer Atlas: Admin direct messaging v1
-- Apply after direct-messaging-v1.sql and member-privacy-v1.sql.
--
-- Admin can exchange messages with every active member without a contact request.
-- Ordinary member-to-member messages still require an accepted mutual contact.
-- Explicit blocks remain respected in both directions.

begin;

create or replace function public.qa_is_admin_user(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from auth.users u
    join public.qa_admin_users a on lower(a.email) = lower(u.email)
    where u.id = target_user_id
  );
$$;

-- A confirmed account is an active member for the Admin support channel even when
-- that person has not opted into the community directory.
create or replace function public.qa_admin_message_member_active(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from auth.users u
    left join public.qa_member_privacy p on p.user_id = u.id
    where u.id = target_user_id
      and u.email_confirmed_at is not null
      and coalesce(p.deletion_requested_at is null, true)
  );
$$;

create or replace function public.qa_privacy_message_pair_allowed(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select a is not null
    and b is not null
    and a <> b
    and not public.qa_privacy_blocked(a, b)
    and (
      (public.qa_is_admin_user(a) and public.qa_admin_message_member_active(b))
      or (public.qa_is_admin_user(b) and public.qa_admin_message_member_active(a))
      or (public.qa_privacy_eligible(a) and public.qa_privacy_eligible(b) and public.qa_privacy_contacts(a, b))
    );
$$;

-- This is deliberately a minimal projection. Non-admins receive Admin accounts only;
-- an Admin receives active members so it can choose a recipient in the protected inbox.
create or replace function public.qa_privacy_message_peers(query_text text default '')
returns setof jsonb
language sql
stable
security definer
set search_path = public
as $$
  with viewer as (select auth.uid() as id),
  candidates as (
    select u.id as user_id,
      coalesce(nullif(trim(p.alias), ''), nullif(trim(mp.display_name), ''), 'Member') as alias,
      nullif(trim(mp.display_name), '') as member_name,
      u.email as member_email,
      nullif(trim(mp.home_city), '') as member_city,
      public.qa_is_admin_user(u.id) as is_admin
    from auth.users u
    left join public.qa_member_privacy p on p.user_id = u.id
    left join public.member_profiles mp on mp.user_id = u.id
    where u.id <> (select id from viewer)
      and public.qa_admin_message_member_active(u.id)
  )
  select jsonb_build_object('user_id', c.user_id, 'alias', case when c.is_admin then 'Admin' else c.alias end, 'is_admin', c.is_admin)
    || case when public.qa_is_admin() and not c.is_admin then jsonb_build_object(
      'member_name', c.member_name, 'member_email', c.member_email, 'member_city', c.member_city
    ) else '{}'::jsonb end
  from candidates c
  where (
      public.qa_is_admin()
      or c.is_admin
    )
    and (coalesce(query_text, '') = '' or c.alias ilike '%' || left(query_text, 80) || '%')
  order by c.is_admin desc, c.alias asc
  limit case when public.qa_is_admin() then 2000 else 10 end;
$$;

create or replace function public.qa_privacy_threads()
returns setof jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', t.id,
    'user_id', u.id,
    'alias', case when public.qa_is_admin_user(u.id) then 'Admin' else coalesce(nullif(trim(p.alias), ''), nullif(trim(mp.display_name), ''), 'Member') end,
    'member_name', case when public.qa_is_admin() and not public.qa_is_admin_user(u.id) then nullif(trim(mp.display_name), '') else null end,
    'member_email', case when public.qa_is_admin() and not public.qa_is_admin_user(u.id) then u.email else null end,
    'member_city', case when public.qa_is_admin() and not public.qa_is_admin_user(u.id) then nullif(trim(mp.home_city), '') else null end,
    'is_admin', public.qa_is_admin_user(u.id)
  )
  from public.qa_dm_threads t
  join auth.users u on u.id = case when t.user_a = auth.uid() then t.user_b else t.user_a end
  left join public.qa_member_privacy p on p.user_id = u.id
  left join public.member_profiles mp on mp.user_id = u.id
  where auth.uid() in (t.user_a, t.user_b)
    and public.qa_privacy_message_pair_allowed(auth.uid(), u.id)
  order by t.updated_at desc
  limit 2000;
$$;

create or replace function public.qa_privacy_messages(target uuid)
returns setof jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.qa_privacy_message_pair_allowed(auth.uid(), target) then
    raise exception 'unavailable';
  end if;
  return query
    select jsonb_build_object('id', m.id, 'sender_id', m.sender_id, 'body', m.body, 'created_at', m.created_at)
    from public.qa_dm_messages m
    join public.qa_dm_threads t on t.id = m.thread_id
    where least(t.user_a, t.user_b) = least(auth.uid(), target)
      and greatest(t.user_a, t.user_b) = greatest(auth.uid(), target)
    order by m.created_at desc, m.id desc
    limit 50;
end;
$$;

create or replace function public.qa_privacy_send(target uuid, message_body text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare thread uuid;
begin
  if not public.qa_privacy_message_pair_allowed(auth.uid(), target) then
    raise exception 'unavailable';
  end if;
  if length(trim(message_body)) < 1 or length(message_body) > 2000 then
    raise exception 'invalid_message';
  end if;
  perform public.qa_privacy_budget('message', 120);
  insert into public.qa_dm_threads(user_a, user_b)
    values(least(auth.uid(), target), greatest(auth.uid(), target))
    on conflict(user_a, user_b) do update set updated_at = now()
    returning id into thread;
  insert into public.qa_dm_messages(thread_id, sender_id, body)
    values(thread, auth.uid(), trim(message_body));
end;
$$;

-- Restrictive policies from member-privacy-v1.sql must recognise the Admin exception.
drop policy if exists qa_privacy_dm_read_gate on public.qa_dm_threads;
create policy qa_privacy_dm_read_gate on public.qa_dm_threads as restrictive for select to authenticated
using (
  auth.uid() in (user_a, user_b)
  and public.qa_privacy_message_pair_allowed(auth.uid(), case when user_a = auth.uid() then user_b else user_a end)
);

drop policy if exists qa_privacy_messages_read_gate on public.qa_dm_messages;
create policy qa_privacy_messages_read_gate on public.qa_dm_messages as restrictive for select to authenticated
using (
  exists (
    select 1 from public.qa_dm_threads t
    where t.id = thread_id
      and auth.uid() in (t.user_a, t.user_b)
      and public.qa_privacy_message_pair_allowed(auth.uid(), case when t.user_a = auth.uid() then t.user_b else t.user_a end)
  )
);

grant execute on function public.qa_is_admin_user(uuid) to authenticated;
grant execute on function public.qa_admin_message_member_active(uuid) to authenticated;
grant execute on function public.qa_privacy_message_pair_allowed(uuid, uuid) to authenticated;
grant execute on function public.qa_privacy_message_peers(text) to authenticated;
grant execute on function public.qa_privacy_threads() to authenticated;
grant execute on function public.qa_privacy_messages(uuid) to authenticated;
grant execute on function public.qa_privacy_send(uuid, text) to authenticated;

commit;
