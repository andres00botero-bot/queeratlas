-- Step 2 verification queries (read-only)

-- A) Check columns are present
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'member_profiles'
  and column_name in ('avatar_url', 'avatar_path', 'avatar_version', 'avatar_updated_at', 'display_name')
order by column_name;

-- B) Check admin row + avatar metadata
select
  u.email,
  mp.user_id,
  mp.display_name,
  mp.avatar_url,
  mp.avatar_path,
  mp.avatar_version,
  mp.avatar_updated_at,
  mp.updated_at
from public.member_profiles mp
join auth.users u on u.id = mp.user_id
where lower(coalesce(u.email, '')) = 'andres00botero@gmail.com';

-- C) Check all profile rows basic avatar state
select
  count(*) as profiles_total,
  count(*) filter (where coalesce(trim(avatar_url), '') <> '') as profiles_with_avatar_url,
  count(*) filter (where coalesce(trim(avatar_path), '') <> '') as profiles_with_avatar_path,
  count(*) filter (where avatar_updated_at is not null) as profiles_with_avatar_updated_at
from public.member_profiles;

-- D) Spot rows where url exists but path missing (for manual follow-up)
select
  u.email,
  mp.user_id,
  mp.display_name,
  mp.avatar_url,
  mp.avatar_path
from public.member_profiles mp
join auth.users u on u.id = mp.user_id
where coalesce(trim(mp.avatar_url), '') <> ''
  and coalesce(trim(mp.avatar_path), '') = ''
order by mp.updated_at desc nulls last
limit 50;

-- E) Trigger presence check
select trigger_name, event_manipulation, action_timing
from information_schema.triggers
where event_object_schema = 'public'
  and event_object_table = 'member_profiles'
  and trigger_name = 'qa_member_profiles_avatar_sync';
