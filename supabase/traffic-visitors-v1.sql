-- Queer Atlas traffic telemetry (visitors + page visits)
-- Run in Supabase SQL editor.

create table if not exists public.qa_page_visits (
  id uuid primary key default gen_random_uuid(),
  visit_date date not null default (now() at time zone 'utc')::date,
  route text not null,
  city text,
  visitor_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.qa_page_visits
  add constraint qa_page_visits_unique_daily_visitor_route
  unique (visit_date, route, visitor_id);

create index if not exists qa_page_visits_visit_date_idx
  on public.qa_page_visits (visit_date desc);

create index if not exists qa_page_visits_route_idx
  on public.qa_page_visits (route);

create index if not exists qa_page_visits_city_idx
  on public.qa_page_visits (city);

create index if not exists qa_page_visits_visitor_idx
  on public.qa_page_visits (visitor_id);

create or replace function public.qa_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_qa_page_visits_updated_at on public.qa_page_visits;
create trigger trg_qa_page_visits_updated_at
before update on public.qa_page_visits
for each row
execute function public.qa_touch_updated_at();

alter table public.qa_page_visits enable row level security;

drop policy if exists "qa_page_visits_insert_public" on public.qa_page_visits;
create policy "qa_page_visits_insert_public"
on public.qa_page_visits
for insert
to anon, authenticated
with check (true);

drop policy if exists "qa_page_visits_update_own_visitor" on public.qa_page_visits;
create policy "qa_page_visits_update_own_visitor"
on public.qa_page_visits
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "qa_page_visits_select_authenticated" on public.qa_page_visits;
create policy "qa_page_visits_select_authenticated"
on public.qa_page_visits
for select
to authenticated
using (true);
