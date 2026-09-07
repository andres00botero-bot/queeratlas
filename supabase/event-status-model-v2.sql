-- Canonical public event lifecycle shared by city and off-grid events.
-- V2 deliberately avoids COALESCE between date and text columns.

begin;

alter table if exists public.events
  add column if not exists event_status text not null default 'scheduled';

alter table if exists public.global_events
  add column if not exists event_status text not null default 'scheduled';

update public.events
set event_status = case
  when nullif(btrim(start_date::text), '') is null
    and nullif(btrim(date::text), '') is null then 'date_tba'
  when lower(coalesce(event_status, '')) in ('canceled', 'cancelled') then 'cancelled'
  when lower(coalesce(event_status, '')) in ('rescheduled', 'postponed', 'moved_online', 'date_tba') then lower(event_status)
  else 'scheduled'
end;

update public.global_events
set event_status = case
  when nullif(btrim(start_date::text), '') is null
    and nullif(btrim(date::text), '') is null then 'date_tba'
  when lower(coalesce(event_status, '')) in ('canceled', 'cancelled') then 'cancelled'
  when lower(coalesce(event_status, '')) in ('rescheduled', 'postponed', 'moved_online', 'date_tba') then lower(event_status)
  else 'scheduled'
end;

alter table if exists public.events
  drop constraint if exists events_event_status_check;
alter table if exists public.events
  add constraint events_event_status_check
  check (event_status in ('scheduled', 'rescheduled', 'postponed', 'cancelled', 'moved_online', 'date_tba'));

alter table if exists public.global_events
  drop constraint if exists global_events_event_status_check;
alter table if exists public.global_events
  add constraint global_events_event_status_check
  check (event_status in ('scheduled', 'rescheduled', 'postponed', 'cancelled', 'moved_online', 'date_tba'));

create index if not exists events_status_date_idx
  on public.events (event_status, start_date, end_date);

create index if not exists global_events_status_date_idx
  on public.global_events (event_status, start_date, end_date);

comment on column public.events.event_status is
  'Canonical event lifecycle: scheduled, rescheduled, postponed, cancelled, moved_online, or date_tba.';

comment on column public.global_events.event_status is
  'Canonical event lifecycle: scheduled, rescheduled, postponed, cancelled, moved_online, or date_tba.';

commit;

