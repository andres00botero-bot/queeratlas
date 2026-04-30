-- Legacy vibe should only be displayed when explicitly set by a member in the venue form.
-- Safe to run multiple times.

begin;

alter table if exists public.places
  add column if not exists legacy_vibe_user_set boolean not null default false;

update public.places
set legacy_vibe_user_set = false
where legacy_vibe_user_set is null;

create index if not exists idx_places_legacy_vibe_user_set
  on public.places (legacy_vibe_user_set);

commit;

