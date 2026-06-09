-- Queer Atlas IndexNow submission history and durable duplicate protection.
-- Run in Supabase SQL editor.

create table if not exists public.qa_indexnow_submissions (
  id uuid primary key default gen_random_uuid(),
  url text not null check (length(url) between 1 and 2048),
  source text not null default 'admin' check (length(source) between 1 and 64),
  status_code integer check (status_code is null or status_code between 100 and 599),
  accepted boolean not null default false,
  response_excerpt text not null default '' check (length(response_excerpt) <= 500),
  submitted_at timestamptz not null default now()
);

create index if not exists qa_indexnow_submissions_submitted_at_idx
  on public.qa_indexnow_submissions (submitted_at desc);

create index if not exists qa_indexnow_submissions_url_submitted_at_idx
  on public.qa_indexnow_submissions (url, submitted_at desc);

alter table public.qa_indexnow_submissions enable row level security;

drop policy if exists qa_indexnow_submissions_select_admin
  on public.qa_indexnow_submissions;
create policy qa_indexnow_submissions_select_admin
on public.qa_indexnow_submissions
for select
to authenticated
using (public.qa_is_admin());

revoke all on table public.qa_indexnow_submissions from anon;
revoke insert, update, delete on table public.qa_indexnow_submissions from authenticated;
grant select on table public.qa_indexnow_submissions to authenticated;
grant all on table public.qa_indexnow_submissions to service_role;
