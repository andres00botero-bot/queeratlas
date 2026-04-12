-- Queer Atlas: moderation cloud sync tables + RLS
-- Safe to run multiple times.
-- Run in Supabase SQL Editor.

begin;

create table if not exists public.qa_admin_users (
  email text primary key,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create or replace function public.qa_is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  has_admin_table boolean := false;
  is_admin boolean := false;
begin
  has_admin_table := to_regclass('public.qa_admin_users') is not null;
  if not has_admin_table then
    return false;
  end if;

  select exists (
    select 1
    from public.qa_admin_users admin
    where lower(admin.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
  into is_admin;

  return is_admin;
end;
$$;

grant execute on function public.qa_is_admin() to anon, authenticated;

create table if not exists public.qa_reports (
  id text primary key,
  target_type text not null,
  target_id text not null,
  city text,
  title text,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_by_email text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.qa_blocked_items (
  id text primary key,
  target_type text not null,
  target_id text not null,
  title text,
  city text,
  blocked_at timestamptz not null default now()
);

create index if not exists qa_reports_created_at_idx on public.qa_reports (created_at desc);
create index if not exists qa_reports_status_idx on public.qa_reports (status);
create index if not exists qa_reports_target_idx on public.qa_reports (target_type, target_id);

create index if not exists qa_blocked_items_blocked_at_idx on public.qa_blocked_items (blocked_at desc);
create index if not exists qa_blocked_items_target_idx on public.qa_blocked_items (target_type, target_id);

alter table public.qa_reports enable row level security;
alter table public.qa_blocked_items enable row level security;

drop policy if exists qa_reports_insert_authenticated on public.qa_reports;
create policy qa_reports_insert_authenticated
on public.qa_reports
for insert
to authenticated
with check (auth.uid() is not null);

drop policy if exists qa_reports_select_admin_only on public.qa_reports;
create policy qa_reports_select_admin_only
on public.qa_reports
for select
to authenticated
using (public.qa_is_admin());

drop policy if exists qa_reports_update_admin_only on public.qa_reports;
create policy qa_reports_update_admin_only
on public.qa_reports
for update
to authenticated
using (public.qa_is_admin())
with check (public.qa_is_admin());

drop policy if exists qa_reports_delete_admin_only on public.qa_reports;
create policy qa_reports_delete_admin_only
on public.qa_reports
for delete
to authenticated
using (public.qa_is_admin());

drop policy if exists qa_blocked_items_read_all on public.qa_blocked_items;
create policy qa_blocked_items_read_all
on public.qa_blocked_items
for select
using (true);

drop policy if exists qa_blocked_items_insert_admin_only on public.qa_blocked_items;
create policy qa_blocked_items_insert_admin_only
on public.qa_blocked_items
for insert
to authenticated
with check (public.qa_is_admin());

drop policy if exists qa_blocked_items_update_admin_only on public.qa_blocked_items;
create policy qa_blocked_items_update_admin_only
on public.qa_blocked_items
for update
to authenticated
using (public.qa_is_admin())
with check (public.qa_is_admin());

drop policy if exists qa_blocked_items_delete_admin_only on public.qa_blocked_items;
create policy qa_blocked_items_delete_admin_only
on public.qa_blocked_items
for delete
to authenticated
using (public.qa_is_admin());

commit;
