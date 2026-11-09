-- Durable per-member read state for direct-message threads.
-- Run once in the Supabase SQL Editor after direct-messaging-v1.sql and admin-direct-messaging-v1.sql.
begin;

create or replace function public.qa_mark_thread_read(target_thread_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Not authenticated.'; end if;
  if not exists (
    select 1 from public.qa_dm_threads t
    where t.id = target_thread_id and (t.user_a = uid or t.user_b = uid)
  ) then raise exception 'Thread not accessible.'; end if;

  insert into public.qa_dm_thread_state (thread_id, user_id, last_read_at)
  values (target_thread_id, uid, now())
  on conflict on constraint qa_dm_thread_state_pkey do update
    set last_read_at = excluded.last_read_at;
end;
$$;

create or replace function public.qa_get_unread_dm_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(count(*), 0)::integer
  from public.qa_dm_messages m
  join public.qa_dm_threads t on t.id = m.thread_id
  left join public.qa_dm_thread_state state
    on state.thread_id = m.thread_id and state.user_id = auth.uid()
  where auth.uid() in (t.user_a, t.user_b)
    and m.sender_id <> auth.uid()
    and m.created_at > coalesce(state.last_read_at, '-infinity'::timestamptz);
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
    'is_admin', public.qa_is_admin_user(u.id),
    'last_message_at', t.last_message_at,
    'last_message_body', (select m.body from public.qa_dm_messages m where m.thread_id = t.id order by m.created_at desc, m.id desc limit 1),
    'unread_count', (
      select count(m.id)::integer from public.qa_dm_messages m
      left join public.qa_dm_thread_state state on state.thread_id = m.thread_id and state.user_id = auth.uid()
      where m.thread_id = t.id and m.sender_id <> auth.uid()
        and m.created_at > coalesce(state.last_read_at, '-infinity'::timestamptz)
    )
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

revoke all on function public.qa_mark_thread_read(uuid) from public, anon;
grant execute on function public.qa_mark_thread_read(uuid) to authenticated;
revoke all on function public.qa_get_unread_dm_count() from public, anon;
grant execute on function public.qa_get_unread_dm_count() to authenticated;
revoke all on function public.qa_privacy_threads() from public, anon;
grant execute on function public.qa_privacy_threads() to authenticated;

commit;
