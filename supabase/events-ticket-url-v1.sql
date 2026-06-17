-- Queer Atlas: optional ticket purchase URL for events.

alter table if exists public.events
  add column if not exists ticket_url text;

alter table if exists public.global_events
  add column if not exists ticket_url text;
