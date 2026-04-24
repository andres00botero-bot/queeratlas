-- Queer Atlas: KPI event tracking (cloud-first analytics)
-- Safe to run multiple times.

begin;

create table if not exists public.qa_kpi_events (
  id bigserial primary key,
  name text not null,
  city text,
  target_type text,
  target_id text,
  member_key text,
  meta jsonb not null default '{}'::jsonb,
  client_created_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists qa_kpi_events_created_at_idx
  on public.qa_kpi_events (created_at desc);

create index if not exists qa_kpi_events_name_idx
  on public.qa_kpi_events (name);

create index if not exists qa_kpi_events_city_idx
  on public.qa_kpi_events (city);

alter table public.qa_kpi_events enable row level security;

drop policy if exists qa_kpi_events_insert_client on public.qa_kpi_events;
create policy qa_kpi_events_insert_client
on public.qa_kpi_events
for insert
to anon, authenticated
with check (true);

drop policy if exists qa_kpi_events_select_admin_only on public.qa_kpi_events;
create policy qa_kpi_events_select_admin_only
on public.qa_kpi_events
for select
to authenticated
using (public.qa_is_admin());

commit;
