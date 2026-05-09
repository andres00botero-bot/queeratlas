-- Queer Atlas: member profile extras synced across devices
-- Safe to run multiple times.

alter table if exists public.member_profiles
  add column if not exists about text,
  add column if not exists visibility text not null default 'members',
  add column if not exists birthday text,
  add column if not exists vibe text,
  add column if not exists phone text,
  add column if not exists contact_email text;

alter table if exists public.member_profiles
  drop constraint if exists member_profiles_visibility_allowed;

alter table if exists public.member_profiles
  add constraint member_profiles_visibility_allowed
  check (visibility in ('friends', 'members', 'public'));

update public.member_profiles
set visibility = 'members'
where visibility is null
   or visibility not in ('friends', 'members', 'public');
