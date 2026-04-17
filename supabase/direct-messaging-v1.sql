-- Queer Atlas: Direct Messaging + Presence V1
-- Safe to run multiple times.
-- Prerequisites:
-- 1) public.member_following exists (friends-trust-network-v1.sql)
-- 2) public.qa_is_admin() exists (core-rls-hardening.sql or equivalent)

begin;

do $$
begin
  if to_regclass('public.member_following') is null then
    raise exception 'member_following is missing. Run friends-trust-network-v1.sql first.';
  end if;
end;
$$;

create table if not exists public.qa_presence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  is_online boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.qa_dm_threads (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  constraint qa_dm_threads_not_self check (user_a <> user_b),
  constraint qa_dm_threads_sorted_pair check (user_a < user_b),
  constraint qa_dm_threads_pair_unique unique (user_a, user_b)
);

create table if not exists public.qa_dm_messages (
  id bigserial primary key,
  thread_id uuid not null references public.qa_dm_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  reported_at timestamptz,
  constraint qa_dm_messages_body_not_blank check (length(trim(body)) > 0),
  constraint qa_dm_messages_body_len check (length(body) <= 2000)
);

create table if not exists public.qa_dm_thread_state (
  thread_id uuid not null references public.qa_dm_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_read_at timestamptz,
  muted_until timestamptz,
  blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create index if not exists qa_presence_last_seen_idx
  on public.qa_presence (last_seen_at desc);

create index if not exists qa_dm_threads_last_message_idx
  on public.qa_dm_threads (last_message_at desc);

create index if not exists qa_dm_threads_user_a_idx
  on public.qa_dm_threads (user_a);

create index if not exists qa_dm_threads_user_b_idx
  on public.qa_dm_threads (user_b);

create index if not exists qa_dm_messages_thread_created_idx
  on public.qa_dm_messages (thread_id, created_at desc);

create index if not exists qa_dm_messages_sender_idx
  on public.qa_dm_messages (sender_id);

create index if not exists qa_dm_messages_unread_idx
  on public.qa_dm_messages (thread_id, read_at)
  where read_at is null;

create index if not exists qa_dm_thread_state_user_idx
  on public.qa_dm_thread_state (user_id, updated_at desc);

create or replace function public.qa_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_qa_presence_touch_updated_at on public.qa_presence;
create trigger trg_qa_presence_touch_updated_at
before update on public.qa_presence
for each row
execute function public.qa_touch_updated_at();

drop trigger if exists trg_qa_dm_threads_touch_updated_at on public.qa_dm_threads;
create trigger trg_qa_dm_threads_touch_updated_at
before update on public.qa_dm_threads
for each row
execute function public.qa_touch_updated_at();

drop trigger if exists trg_qa_dm_thread_state_touch_updated_at on public.qa_dm_thread_state;
create trigger trg_qa_dm_thread_state_touch_updated_at
before update on public.qa_dm_thread_state
for each row
execute function public.qa_touch_updated_at();

create or replace function public.qa_dm_other_user(thread_row public.qa_dm_threads, viewer uuid)
returns uuid
language sql
stable
as $$
  select case
    when thread_row.user_a = viewer then thread_row.user_b
    else thread_row.user_a
  end;
$$;

create or replace function public.qa_can_open_dm(target_user_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null or target_user_id is null or uid = target_user_id then
    return false;
  end if;

  if public.qa_is_admin() then
    return true;
  end if;

  return exists (
    select 1
    from public.member_following mf
    where
      (mf.follower_user_id = uid and mf.followed_user_id = target_user_id)
      or (mf.follower_user_id = target_user_id and mf.followed_user_id = uid)
  );
end;
$$;

create or replace function public.qa_dm_can_send(thread_uuid uuid, sender uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  t public.qa_dm_threads%rowtype;
  recipient uuid;
begin
  if thread_uuid is null or sender is null then
    return false;
  end if;

  select *
  into t
  from public.qa_dm_threads
  where id = thread_uuid;

  if not found then
    return false;
  end if;

  if sender <> t.user_a and sender <> t.user_b then
    return false;
  end if;

  recipient := public.qa_dm_other_user(t, sender);

  return not exists (
    select 1
    from public.qa_dm_thread_state st
    where st.thread_id = thread_uuid
      and st.user_id = recipient
      and st.blocked = true
  );
end;
$$;

create or replace function public.qa_get_or_create_dm_thread(target_user_id uuid)
returns table (
  thread_id uuid,
  created boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  a uuid;
  b uuid;
begin
  if not public.qa_can_open_dm(target_user_id) then
    raise exception 'Not allowed to open DM thread with this user.';
  end if;

  a := least(uid, target_user_id);
  b := greatest(uid, target_user_id);

  insert into public.qa_dm_threads (user_a, user_b)
  values (a, b)
  on conflict (user_a, user_b) do nothing;

  -- Keep V1 resilient with RLS: ensure caller has thread_state row.
  -- Recipient row can be created later on first interaction.
  insert into public.qa_dm_thread_state (thread_id, user_id)
  select t.id, uid
  from public.qa_dm_threads t
  where t.user_a = a and t.user_b = b
  on conflict on constraint qa_dm_thread_state_pkey do nothing;

  return query
  select
    t.id,
    (t.created_at >= now() - interval '5 seconds') as created
  from public.qa_dm_threads t
  where t.user_a = a and t.user_b = b;
end;
$$;

create or replace function public.qa_upsert_presence()
returns public.qa_presence
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  row_out public.qa_presence;
begin
  if uid is null then
    raise exception 'Not authenticated.';
  end if;

  insert into public.qa_presence (user_id, last_seen_at, is_online)
  values (uid, now(), true)
  on conflict (user_id) do update
    set last_seen_at = excluded.last_seen_at,
        is_online = true;

  select *
  into row_out
  from public.qa_presence
  where user_id = uid;

  return row_out;
end;
$$;

create or replace function public.qa_mark_thread_read(target_thread_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated.';
  end if;

  if not exists (
    select 1
    from public.qa_dm_threads t
    where t.id = target_thread_id
      and (t.user_a = uid or t.user_b = uid)
  ) then
    raise exception 'Thread not accessible.';
  end if;

  insert into public.qa_dm_thread_state (thread_id, user_id, last_read_at)
  values (target_thread_id, uid, now())
  on conflict on constraint qa_dm_thread_state_pkey do update
    set last_read_at = excluded.last_read_at;

  update public.qa_dm_messages m
  set read_at = now()
  where m.thread_id = target_thread_id
    and m.sender_id <> uid
    and m.read_at is null;
end;
$$;

create or replace function public.qa_get_unread_dm_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select auth.uid() as uid
  ),
  my_threads as (
    select t.id as thread_id
    from public.qa_dm_threads t
    join me on me.uid is not null and (t.user_a = me.uid or t.user_b = me.uid)
  )
  select coalesce(count(*), 0)::integer
  from public.qa_dm_messages m
  join my_threads mt on mt.thread_id = m.thread_id
  join me on true
  where m.sender_id <> me.uid
    and m.read_at is null;
$$;

create or replace function public.qa_get_friend_momentum(friend_limit integer default 25)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  last_seen_at timestamptz,
  is_online boolean,
  active_now boolean,
  latest_message_at timestamptz,
  unread_count integer
)
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select auth.uid() as uid
  ),
  safe_limit as (
    select greatest(1, least(coalesce(friend_limit, 25), 100)) as lim
  ),
  following as (
    select mf.followed_user_id as user_id
    from public.member_following mf
    join me on me.uid is not null and mf.follower_user_id = me.uid
  ),
  friend_threads as (
    select
      f.user_id,
      t.id as thread_id,
      t.last_message_at
    from following f
    left join public.qa_dm_threads t
      on (t.user_a = least((select uid from me), f.user_id) and t.user_b = greatest((select uid from me), f.user_id))
  ),
  unread_by_friend as (
    select
      ft.user_id,
      count(m.id)::int as unread_count
    from friend_threads ft
    join me on true
    left join public.qa_dm_messages m
      on m.thread_id = ft.thread_id
      and m.sender_id = ft.user_id
      and m.read_at is null
    group by ft.user_id
  )
  select
    f.user_id,
    coalesce(nullif(mp.display_name, ''), split_part(coalesce(u.email, 'member'), '@', 1))::text as display_name,
    (to_jsonb(mp)->>'avatar_url')::text as avatar_url,
    p.last_seen_at,
    coalesce(p.is_online, false) as is_online,
    (coalesce(p.is_online, false) and p.last_seen_at >= now() - interval '2 minutes') as active_now,
    ft.last_message_at as latest_message_at,
    coalesce(ubf.unread_count, 0)::int as unread_count
  from following f
  left join public.member_profiles mp on mp.user_id = f.user_id
  left join auth.users u on u.id = f.user_id
  left join public.qa_presence p on p.user_id = f.user_id
  left join friend_threads ft on ft.user_id = f.user_id
  left join unread_by_friend ubf on ubf.user_id = f.user_id
  order by
    active_now desc,
    coalesce(ft.last_message_at, p.last_seen_at, '-infinity'::timestamptz) desc,
    display_name asc
  limit (select lim from safe_limit);
$$;

create or replace function public.qa_dm_touch_thread_last_message()
returns trigger
language plpgsql
as $$
begin
  update public.qa_dm_threads
  set last_message_at = new.created_at
  where id = new.thread_id;
  return new;
end;
$$;

create or replace function public.qa_dm_threads_guard_immutable()
returns trigger
language plpgsql
as $$
begin
  if new.user_a <> old.user_a or new.user_b <> old.user_b then
    raise exception 'Thread participants are immutable.';
  end if;
  return new;
end;
$$;

create or replace function public.qa_dm_messages_guard_immutable()
returns trigger
language plpgsql
as $$
begin
  if new.thread_id <> old.thread_id
     or new.sender_id <> old.sender_id
     or new.body <> old.body
     or new.created_at <> old.created_at then
    raise exception 'Message identity fields are immutable.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_qa_dm_messages_touch_thread on public.qa_dm_messages;
create trigger trg_qa_dm_messages_touch_thread
after insert on public.qa_dm_messages
for each row
execute function public.qa_dm_touch_thread_last_message();

drop trigger if exists trg_qa_dm_threads_guard_immutable on public.qa_dm_threads;
create trigger trg_qa_dm_threads_guard_immutable
before update on public.qa_dm_threads
for each row
execute function public.qa_dm_threads_guard_immutable();

drop trigger if exists trg_qa_dm_messages_guard_immutable on public.qa_dm_messages;
create trigger trg_qa_dm_messages_guard_immutable
before update on public.qa_dm_messages
for each row
execute function public.qa_dm_messages_guard_immutable();

alter table public.qa_presence enable row level security;
alter table public.qa_dm_threads enable row level security;
alter table public.qa_dm_messages enable row level security;
alter table public.qa_dm_thread_state enable row level security;

drop policy if exists qa_presence_select_friends_or_self on public.qa_presence;
create policy qa_presence_select_friends_or_self
on public.qa_presence
for select
to authenticated
using (
  user_id = auth.uid()
  or public.qa_is_admin()
  or exists (
    select 1
    from public.member_following mf
    where mf.follower_user_id = auth.uid()
      and mf.followed_user_id = qa_presence.user_id
  )
);

drop policy if exists qa_presence_insert_self on public.qa_presence;
create policy qa_presence_insert_self
on public.qa_presence
for insert
to authenticated
with check (user_id = auth.uid() or public.qa_is_admin());

drop policy if exists qa_presence_update_self on public.qa_presence;
create policy qa_presence_update_self
on public.qa_presence
for update
to authenticated
using (user_id = auth.uid() or public.qa_is_admin())
with check (user_id = auth.uid() or public.qa_is_admin());

drop policy if exists qa_presence_delete_none on public.qa_presence;
create policy qa_presence_delete_none
on public.qa_presence
for delete
to authenticated
using (public.qa_is_admin());

drop policy if exists qa_dm_threads_select_participant on public.qa_dm_threads;
create policy qa_dm_threads_select_participant
on public.qa_dm_threads
for select
to authenticated
using (
  user_a = auth.uid()
  or user_b = auth.uid()
  or public.qa_is_admin()
);

drop policy if exists qa_dm_threads_insert_participant on public.qa_dm_threads;
create policy qa_dm_threads_insert_participant
on public.qa_dm_threads
for insert
to authenticated
with check (
  (
    user_a = auth.uid()
    and public.qa_can_open_dm(user_b)
  )
  or (
    user_b = auth.uid()
    and public.qa_can_open_dm(user_a)
  )
  or public.qa_is_admin()
);

drop policy if exists qa_dm_threads_update_participant on public.qa_dm_threads;
create policy qa_dm_threads_update_participant
on public.qa_dm_threads
for update
to authenticated
using (
  user_a = auth.uid()
  or user_b = auth.uid()
  or public.qa_is_admin()
)
with check (
  user_a = auth.uid()
  or user_b = auth.uid()
  or public.qa_is_admin()
);

drop policy if exists qa_dm_threads_delete_admin on public.qa_dm_threads;
create policy qa_dm_threads_delete_admin
on public.qa_dm_threads
for delete
to authenticated
using (public.qa_is_admin());

drop policy if exists qa_dm_messages_select_participant on public.qa_dm_messages;
create policy qa_dm_messages_select_participant
on public.qa_dm_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.qa_dm_threads t
    where t.id = qa_dm_messages.thread_id
      and (t.user_a = auth.uid() or t.user_b = auth.uid() or public.qa_is_admin())
  )
);

drop policy if exists qa_dm_messages_insert_sender on public.qa_dm_messages;
create policy qa_dm_messages_insert_sender
on public.qa_dm_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and public.qa_dm_can_send(thread_id, auth.uid())
);

drop policy if exists qa_dm_messages_update_participant on public.qa_dm_messages;
create policy qa_dm_messages_update_participant
on public.qa_dm_messages
for update
to authenticated
using (
  exists (
    select 1
    from public.qa_dm_threads t
    where t.id = qa_dm_messages.thread_id
      and (t.user_a = auth.uid() or t.user_b = auth.uid() or public.qa_is_admin())
  )
)
with check (
  exists (
    select 1
    from public.qa_dm_threads t
    where t.id = qa_dm_messages.thread_id
      and (t.user_a = auth.uid() or t.user_b = auth.uid() or public.qa_is_admin())
  )
);

drop policy if exists qa_dm_messages_delete_admin on public.qa_dm_messages;
create policy qa_dm_messages_delete_admin
on public.qa_dm_messages
for delete
to authenticated
using (public.qa_is_admin());

drop policy if exists qa_dm_thread_state_select_participant on public.qa_dm_thread_state;
create policy qa_dm_thread_state_select_participant
on public.qa_dm_thread_state
for select
to authenticated
using (
  user_id = auth.uid()
  or public.qa_is_admin()
  or exists (
    select 1
    from public.qa_dm_threads t
    where t.id = qa_dm_thread_state.thread_id
      and (t.user_a = auth.uid() or t.user_b = auth.uid())
  )
);

drop policy if exists qa_dm_thread_state_insert_self on public.qa_dm_thread_state;
create policy qa_dm_thread_state_insert_self
on public.qa_dm_thread_state
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.qa_dm_threads t
    where t.id = qa_dm_thread_state.thread_id
      and (t.user_a = auth.uid() or t.user_b = auth.uid())
  )
);

drop policy if exists qa_dm_thread_state_update_self on public.qa_dm_thread_state;
create policy qa_dm_thread_state_update_self
on public.qa_dm_thread_state
for update
to authenticated
using (user_id = auth.uid() or public.qa_is_admin())
with check (user_id = auth.uid() or public.qa_is_admin());

drop policy if exists qa_dm_thread_state_delete_admin on public.qa_dm_thread_state;
create policy qa_dm_thread_state_delete_admin
on public.qa_dm_thread_state
for delete
to authenticated
using (public.qa_is_admin());

grant execute on function public.qa_can_open_dm(uuid) to authenticated;
grant execute on function public.qa_get_or_create_dm_thread(uuid) to authenticated;
grant execute on function public.qa_upsert_presence() to authenticated;
grant execute on function public.qa_mark_thread_read(uuid) to authenticated;
grant execute on function public.qa_get_unread_dm_count() to authenticated;
grant execute on function public.qa_get_friend_momentum(integer) to authenticated;

commit;
