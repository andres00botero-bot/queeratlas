-- Add optional official link for venues (website/Instagram/Facebook)
-- Safe to run multiple times.

alter table if exists public.places
  add column if not exists link text;
