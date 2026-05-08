-- member-displayname-privacy-hotfix-v1.sql
-- Purpose: prevent email-derived public aliases.

begin;

-- 1) Ensure every auth user has a member_profiles row.
insert into public.member_profiles (user_id, display_name, updated_at)
select
  u.id,
  coalesce(
    nullif(trim((u.raw_user_meta_data->>'full_name')), ''),
    nullif(trim((u.raw_user_meta_data->>'name')), ''),
    'Member'
  ) as display_name,
  now()
from auth.users u
left join public.member_profiles mp
  on mp.user_id = u.id
where mp.user_id is null;

-- 2) Replace blank/null display names with privacy-safe fallback.
update public.member_profiles
set
  display_name = 'Member',
  updated_at = now()
where coalesce(trim(display_name), '') = '';

-- 3) Force admin alias for your admin account.
update public.member_profiles mp
set
  display_name = 'Admin',
  updated_at = now()
where mp.user_id in (
  select u.id
  from auth.users u
  where lower(coalesce(u.email, '')) = 'andres00botero@gmail.com'
);

commit;
