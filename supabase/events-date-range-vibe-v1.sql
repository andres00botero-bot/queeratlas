-- Queer Atlas: Event date-range + vibe support (backward compatible)
-- Safe to run multiple times.

begin;

alter table if exists public.events
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists vibe text;

alter table if exists public.global_events
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists vibe text;

-- Backfill start/end from legacy single date field.
update public.events
set
  start_date = coalesce(start_date, date),
  end_date = coalesce(end_date, coalesce(start_date, date))
where date is not null;

update public.global_events
set
  start_date = coalesce(start_date, date),
  end_date = coalesce(end_date, coalesce(start_date, date))
where date is not null;

create index if not exists idx_events_start_date on public.events(start_date);
create index if not exists idx_events_end_date on public.events(end_date);
create index if not exists idx_global_events_start_date on public.global_events(start_date);
create index if not exists idx_global_events_end_date on public.global_events(end_date);

commit;
