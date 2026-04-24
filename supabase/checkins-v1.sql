-- Queer Atlas: Check-ins V1
-- Safe to run multiple times.
-- Adds/normalizes:
-- 1) public.qa_member_checkins schema
-- 2) indexes + updated_at trigger
-- 3) RLS policies for owner CRUD + visibility select
--
-- Note:
-- - If public.member_following exists, "friends" visibility is enabled in SELECT policy.
-- - If it does not exist yet, SELECT falls back to owner/public visibility.

begin;

create extension if not exists pgcrypto;

create table if not exists public.qa_member_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null default 'trip',
  privacy text not null default 'friends',
  country text,
  city text not null default '',
  label text not null default '',
  address text,
  note text,
  place_id text,
  event_id text,
  lat double precision,
  lng double precision,
  checked_in_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.qa_member_checkins add column if not exists mode text;
alter table public.qa_member_checkins add column if not exists privacy text;
alter table public.qa_member_checkins add column if not exists country text;
alter table public.qa_member_checkins add column if not exists city text;
alter table public.qa_member_checkins add column if not exists label text;
alter table public.qa_member_checkins add column if not exists address text;
alter table public.qa_member_checkins add column if not exists note text;
alter table public.qa_member_checkins add column if not exists place_id text;
alter table public.qa_member_checkins add column if not exists event_id text;
alter table public.qa_member_checkins add column if not exists lat double precision;
alter table public.qa_member_checkins add column if not exists lng double precision;
alter table public.qa_member_checkins add column if not exists checked_in_at timestamptz;
alter table public.qa_member_checkins add column if not exists created_at timestamptz;
alter table public.qa_member_checkins add column if not exists updated_at timestamptz;

update public.qa_member_checkins
set mode = 'trip'
where mode is null or btrim(mode) = '';

update public.qa_member_checkins
set privacy = 'friends'
where privacy is null or btrim(privacy) = '' or privacy not in ('private', 'friends', 'public');

update public.qa_member_checkins
set checked_in_at = coalesce(checked_in_at, created_at, now())
where checked_in_at is null;

update public.qa_member_checkins
set created_at = coalesce(created_at, checked_in_at, now())
where created_at is null;

update public.qa_member_checkins
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

alter table public.qa_member_checkins alter column mode set default 'trip';
alter table public.qa_member_checkins alter column privacy set default 'friends';
alter table public.qa_member_checkins alter column checked_in_at set default now();
alter table public.qa_member_checkins alter column created_at set default now();
alter table public.qa_member_checkins alter column updated_at set default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'qa_member_checkins_privacy_check'
      and conrelid = 'public.qa_member_checkins'::regclass
  ) then
    alter table public.qa_member_checkins
      add constraint qa_member_checkins_privacy_check
      check (privacy in ('private', 'friends', 'public'));
  end if;
end
$$;

create index if not exists qa_member_checkins_user_checked_idx
  on public.qa_member_checkins (user_id, checked_in_at desc);

create index if not exists qa_member_checkins_checked_idx
  on public.qa_member_checkins (checked_in_at desc);

create index if not exists qa_member_checkins_user_privacy_idx
  on public.qa_member_checkins (user_id, privacy);

create or replace function public.qa_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_qa_member_checkins_touch_updated_at on public.qa_member_checkins;
create trigger trg_qa_member_checkins_touch_updated_at
before update on public.qa_member_checkins
for each row
execute function public.qa_touch_updated_at();

alter table public.qa_member_checkins enable row level security;

grant select, insert, update, delete on public.qa_member_checkins to authenticated;

drop policy if exists qa_member_checkins_select on public.qa_member_checkins;
drop policy if exists qa_member_checkins_select_visibility on public.qa_member_checkins;
drop policy if exists qa_member_checkins_insert_owner on public.qa_member_checkins;
drop policy if exists qa_member_checkins_insert_own on public.qa_member_checkins;
drop policy if exists qa_member_checkins_update_owner on public.qa_member_checkins;
drop policy if exists qa_member_checkins_update_own on public.qa_member_checkins;
drop policy if exists qa_member_checkins_delete_owner on public.qa_member_checkins;
drop policy if exists qa_member_checkins_delete_own on public.qa_member_checkins;

do $$
begin
  if to_regclass('public.member_following') is not null then
    execute $policy$
      create policy qa_member_checkins_select_visibility
      on public.qa_member_checkins
      for select
      to authenticated
      using (
        auth.uid() = user_id
        or privacy = 'public'
        or (
          privacy = 'friends'
          and exists (
            select 1
            from public.member_following mf
            where mf.follower_user_id = auth.uid()
              and mf.followed_user_id = qa_member_checkins.user_id
          )
        )
      )
    $policy$;
  else
    execute $policy$
      create policy qa_member_checkins_select_visibility
      on public.qa_member_checkins
      for select
      to authenticated
      using (
        auth.uid() = user_id
        or privacy = 'public'
      )
    $policy$;
  end if;
end
$$;

create policy qa_member_checkins_insert_owner
on public.qa_member_checkins
for insert
to authenticated
with check (auth.uid() = user_id);

create policy qa_member_checkins_update_owner
on public.qa_member_checkins
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy qa_member_checkins_delete_owner
on public.qa_member_checkins
for delete
to authenticated
using (auth.uid() = user_id);

commit;
