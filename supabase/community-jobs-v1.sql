-- Queer Atlas: community jobs board
-- Safe to run multiple times.
-- Run in Supabase SQL Editor.

begin;

create table if not exists public.community_jobs (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  organization_name text not null,
  organization_url text,
  city text,
  country text,
  location_mode text not null default 'On-site',
  employment_type text not null default 'Part-time',
  category text not null default 'Other',
  compensation text,
  description text not null,
  requirements text,
  apply_url text,
  apply_email text,
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected', 'expired', 'removed')),
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'member_verified', 'admin_verified')),
  author text not null default 'Member',
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  created_by_email text,
  published_at timestamptz,
  expires_at timestamptz not null default (now() + interval '45 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_jobs_apply_target_chk check (
    nullif(trim(coalesce(apply_url, '')), '') is not null
    or nullif(trim(coalesce(apply_email, '')), '') is not null
  )
);

create index if not exists community_jobs_status_expires_idx
  on public.community_jobs (status, expires_at desc, created_at desc);

create index if not exists community_jobs_city_idx
  on public.community_jobs (lower(trim(city)));

create index if not exists community_jobs_country_idx
  on public.community_jobs (lower(trim(country)));

create index if not exists community_jobs_location_mode_idx
  on public.community_jobs (lower(trim(location_mode)));

create index if not exists community_jobs_user_id_idx
  on public.community_jobs (user_id, created_at desc);

create or replace function public.qa_touch_community_jobs_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists community_jobs_touch_updated_at on public.community_jobs;
create trigger community_jobs_touch_updated_at
before update on public.community_jobs
for each row
execute function public.qa_touch_community_jobs_updated_at();

alter table public.community_jobs enable row level security;

grant select, insert, update, delete on public.community_jobs to authenticated;

drop policy if exists community_jobs_select_visible on public.community_jobs;
create policy community_jobs_select_visible
on public.community_jobs
for select
to authenticated
using (
  (
    status = 'published'
    and expires_at > now()
  )
  or (select auth.uid()) = user_id
  or public.qa_is_admin()
);

drop policy if exists community_jobs_insert_members on public.community_jobs;
create policy community_jobs_insert_members
on public.community_jobs
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and (
    (select auth.uid()) = user_id
    or public.qa_is_admin()
  )
  and (
    status = 'pending'
    or public.qa_is_admin()
  )
);

drop policy if exists community_jobs_update_own_pending on public.community_jobs;
create policy community_jobs_update_own_pending
on public.community_jobs
for update
to authenticated
using (
  (select auth.uid()) = user_id
  and status = 'pending'
)
with check (
  (select auth.uid()) = user_id
  and status = 'pending'
);

drop policy if exists community_jobs_update_admin on public.community_jobs;
create policy community_jobs_update_admin
on public.community_jobs
for update
to authenticated
using (public.qa_is_admin())
with check (public.qa_is_admin());

drop policy if exists community_jobs_delete_admin on public.community_jobs;
create policy community_jobs_delete_admin
on public.community_jobs
for delete
to authenticated
using (public.qa_is_admin());

commit;
