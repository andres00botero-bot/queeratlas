-- Queer Atlas: optional opening-hours text for city and off-grid events.
-- Safe to run multiple times.

begin;

alter table if exists public.events
  add column if not exists hours text;

alter table if exists public.global_events
  add column if not exists hours text;

commit;
