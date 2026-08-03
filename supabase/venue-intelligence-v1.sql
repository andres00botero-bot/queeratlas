-- Queer Atlas venue intelligence V1
-- Stores practical, human-readable venue guidance without inventing defaults.
-- Safe to run multiple times.

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

alter table if exists public.places
  drop constraint if exists places_venue_intel_object;

alter table if exists public.places
  add constraint places_venue_intel_object
  check (jsonb_typeof(venue_intel) = 'object');

comment on column public.places.venue_intel is
  'Practical venue guidance: queue_wait, best_nights, crowd_mix, dress_code, staff_inclusivity, updated_at.';

commit;
