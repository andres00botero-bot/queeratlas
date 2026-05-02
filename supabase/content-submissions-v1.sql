-- Queer Atlas: content submissions moderation lane + trusted contributor flag
-- Safe to run multiple times.

begin;

create table if not exists public.qa_content_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'needs_changes')),
  entity_type text not null
    check (entity_type in ('place', 'event', 'service')),
  action_type text not null default 'create'
    check (action_type in ('create', 'update', 'delete_request')),
  city text,
  title text,
  payload jsonb not null default '{}'::jsonb,
  submitted_by uuid not null references auth.users(id) on delete cascade,
  submitted_by_email text,
  submitted_by_name text,
  is_trusted_contributor boolean not null default false,
  admin_note text,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_by_email text
);

create index if not exists qa_content_submissions_status_created_idx
  on public.qa_content_submissions (status, created_at desc);
create index if not exists qa_content_submissions_entity_city_idx
  on public.qa_content_submissions (entity_type, city);
create index if not exists qa_content_submissions_submitted_by_idx
  on public.qa_content_submissions (submitted_by, created_at desc);

create or replace function public.qa_content_submissions_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists qa_content_submissions_set_updated_at on public.qa_content_submissions;
create trigger qa_content_submissions_set_updated_at
before update on public.qa_content_submissions
for each row
execute function public.qa_content_submissions_set_updated_at();

alter table if exists public.member_profiles
  add column if not exists trusted_contributor boolean not null default false;

create index if not exists member_profiles_trusted_contributor_idx
  on public.member_profiles (trusted_contributor);

alter table if exists public.qa_content_submissions enable row level security;

drop policy if exists qa_content_submissions_select_own_or_admin on public.qa_content_submissions;
create policy qa_content_submissions_select_own_or_admin
on public.qa_content_submissions
for select
to authenticated
using (submitted_by = auth.uid() or public.qa_is_admin());

drop policy if exists qa_content_submissions_insert_own on public.qa_content_submissions;
create policy qa_content_submissions_insert_own
on public.qa_content_submissions
for insert
to authenticated
with check (submitted_by = auth.uid());

drop policy if exists qa_content_submissions_update_admin_only on public.qa_content_submissions;
create policy qa_content_submissions_update_admin_only
on public.qa_content_submissions
for update
to authenticated
using (public.qa_is_admin())
with check (public.qa_is_admin());

drop policy if exists qa_content_submissions_delete_admin_only on public.qa_content_submissions;
create policy qa_content_submissions_delete_admin_only
on public.qa_content_submissions
for delete
to authenticated
using (public.qa_is_admin());

commit;
