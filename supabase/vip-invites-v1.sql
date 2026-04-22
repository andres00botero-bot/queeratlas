-- Queer Atlas: VIP Invites + Private City Events V1
-- Safe to run multiple times.
-- Requires:
-- - public.qa_is_admin() to exist for admin guard clauses.

begin;

create table if not exists public.qa_private_events (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  host_user_id uuid not null references auth.users(id) on delete cascade,
  host_alias text,
  title text not null,
  event_type text not null check (event_type in ('afterparty', 'chill', 'private_party')),
  visibility text not null default 'invite_only' check (visibility in ('invite_only')),
  approx_area text not null,
  exact_location text,
  notes text,
  vibe_tags text[] not null default '{}',
  capacity integer,
  start_at timestamptz not null,
  end_at timestamptz,
  expires_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint qa_private_events_title_not_blank check (length(trim(title)) > 0),
  constraint qa_private_events_area_not_blank check (length(trim(approx_area)) > 0),
  constraint qa_private_events_time_window check (end_at is null or end_at >= start_at),
  constraint qa_private_events_expiry_window check (expires_at >= start_at and expires_at <= (start_at + interval '24 hours'))
);

create table if not exists public.qa_private_event_invites (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.qa_private_events(id) on delete cascade,
  requester_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested', 'accepted', 'declined', 'cancelled')),
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint qa_private_event_invites_unique_request unique (event_id, requester_user_id)
);

create index if not exists qa_private_events_city_status_idx
  on public.qa_private_events (city, status, start_at desc);

create index if not exists qa_private_events_host_idx
  on public.qa_private_events (host_user_id, created_at desc);

create index if not exists qa_private_events_expiry_idx
  on public.qa_private_events (expires_at asc);

create index if not exists qa_private_event_invites_requester_idx
  on public.qa_private_event_invites (requester_user_id, created_at desc);

create index if not exists qa_private_event_invites_event_idx
  on public.qa_private_event_invites (event_id, status);

do $$
begin
  if exists (
    select 1
    from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname = 'qa_touch_updated_at'
  ) then
    if not exists (
      select 1
      from pg_trigger
      where tgname = 'qa_private_events_touch_updated_at'
    ) then
      create trigger qa_private_events_touch_updated_at
      before update on public.qa_private_events
      for each row execute function public.qa_touch_updated_at();
    end if;

    if not exists (
      select 1
      from pg_trigger
      where tgname = 'qa_private_event_invites_touch_updated_at'
    ) then
      create trigger qa_private_event_invites_touch_updated_at
      before update on public.qa_private_event_invites
      for each row execute function public.qa_touch_updated_at();
    end if;
  end if;
end;
$$;

create or replace function public.qa_can_view_private_event_details(event_row public.qa_private_events)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return false;
  end if;

  if event_row.host_user_id = uid then
    return true;
  end if;

  if exists (
    select 1
    from public.qa_private_event_invites i
    where i.event_id = event_row.id
      and i.requester_user_id = uid
      and i.status = 'accepted'
  ) then
    return true;
  end if;

  return false;
end;
$$;

create or replace function public.qa_cleanup_private_events()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer := 0;
begin
  update public.qa_private_events
  set status = 'expired',
      updated_at = now()
  where status = 'active'
    and expires_at <= now();

  get diagnostics affected = row_count;
  return affected;
end;
$$;

grant execute on function public.qa_cleanup_private_events() to authenticated;

alter table public.qa_private_events enable row level security;
alter table public.qa_private_event_invites enable row level security;

drop policy if exists qa_private_events_select_member on public.qa_private_events;
create policy qa_private_events_select_member
on public.qa_private_events
for select
to authenticated
using (status = 'active' or host_user_id = auth.uid() or public.qa_is_admin());

drop policy if exists qa_private_events_insert_host on public.qa_private_events;
create policy qa_private_events_insert_host
on public.qa_private_events
for insert
to authenticated
with check (
  host_user_id = auth.uid()
  and visibility = 'invite_only'
);

drop policy if exists qa_private_events_update_host on public.qa_private_events;
create policy qa_private_events_update_host
on public.qa_private_events
for update
to authenticated
using (host_user_id = auth.uid() or public.qa_is_admin())
with check (host_user_id = auth.uid() or public.qa_is_admin());

drop policy if exists qa_private_events_delete_host on public.qa_private_events;
create policy qa_private_events_delete_host
on public.qa_private_events
for delete
to authenticated
using (host_user_id = auth.uid() or public.qa_is_admin());

drop policy if exists qa_private_event_invites_select_member on public.qa_private_event_invites;
create policy qa_private_event_invites_select_member
on public.qa_private_event_invites
for select
to authenticated
using (
  requester_user_id = auth.uid()
  or exists (
    select 1
    from public.qa_private_events e
    where e.id = qa_private_event_invites.event_id
      and e.host_user_id = auth.uid()
  )
  or public.qa_is_admin()
);

drop policy if exists qa_private_event_invites_insert_requester on public.qa_private_event_invites;
create policy qa_private_event_invites_insert_requester
on public.qa_private_event_invites
for insert
to authenticated
with check (
  requester_user_id = auth.uid()
  and exists (
    select 1
    from public.qa_private_events e
    where e.id = qa_private_event_invites.event_id
      and e.status = 'active'
      and e.host_user_id <> auth.uid()
  )
);

drop policy if exists qa_private_event_invites_update_participants on public.qa_private_event_invites;
create policy qa_private_event_invites_update_participants
on public.qa_private_event_invites
for update
to authenticated
using (
  requester_user_id = auth.uid()
  or exists (
    select 1
    from public.qa_private_events e
    where e.id = qa_private_event_invites.event_id
      and e.host_user_id = auth.uid()
  )
  or public.qa_is_admin()
)
with check (
  requester_user_id = auth.uid()
  or exists (
    select 1
    from public.qa_private_events e
    where e.id = qa_private_event_invites.event_id
      and e.host_user_id = auth.uid()
  )
  or public.qa_is_admin()
);

drop policy if exists qa_private_event_invites_delete_participants on public.qa_private_event_invites;
create policy qa_private_event_invites_delete_participants
on public.qa_private_event_invites
for delete
to authenticated
using (
  requester_user_id = auth.uid()
  or exists (
    select 1
    from public.qa_private_events e
    where e.id = qa_private_event_invites.event_id
      and e.host_user_id = auth.uid()
  )
  or public.qa_is_admin()
);

commit;
