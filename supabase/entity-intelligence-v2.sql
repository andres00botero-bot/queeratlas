-- Practical intelligence fields for venue, event and service templates.
-- Safe to run more than once. Existing rows receive an empty JSON object.

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

alter table if exists public.events
  add column if not exists event_intel jsonb not null default '{}'::jsonb;

alter table if exists public.services
  add column if not exists service_intel jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'places_venue_intel_object_check') then
    alter table public.places
      add constraint places_venue_intel_object_check check (jsonb_typeof(venue_intel) = 'object');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'events_event_intel_object_check') then
    alter table public.events
      add constraint events_event_intel_object_check check (jsonb_typeof(event_intel) = 'object');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'services_service_intel_object_check') then
    alter table public.services
      add constraint services_service_intel_object_check check (jsonb_typeof(service_intel) = 'object');
  end if;
end $$;

comment on column public.places.venue_intel is 'Practical venue context such as queues, best times, crowd mix, dress code and inclusion.';
comment on column public.events.event_intel is 'Practical event context such as entry wait, arrival time, attendee mix, dress code and host inclusion.';
comment on column public.services.service_intel is 'Practical service context such as booking lead time, best time, client mix, preparation and provider inclusion.';
