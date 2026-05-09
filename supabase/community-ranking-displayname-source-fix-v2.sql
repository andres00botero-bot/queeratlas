-- Community ranking display-name source fix (v2)
-- Purpose:
-- 1) Keep member aliases stable in source (Supabase) without exposing email aliases
-- 2) Rebuild qa_member_leaderboard with robust display_name resolution
-- 3) Ensure admin alias is always "Admin"
--
-- Safe to run multiple times.

begin;

-- Ensure every auth user has a profile row.
insert into public.member_profiles (user_id, display_name, updated_at)
select
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data->>'preferred_username'), ''),
    nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(u.raw_user_meta_data->>'name'), ''),
    'Member'
  ) as display_name,
  now()
from auth.users u
left join public.member_profiles mp
  on mp.user_id = u.id
where mp.user_id is null;

-- Fill only generic/blank aliases from safe auth metadata (never from email local-part).
update public.member_profiles mp
set
  display_name = src.safe_name,
  updated_at = now()
from (
  select
    u.id as user_id,
    coalesce(
      nullif(trim(u.raw_user_meta_data->>'preferred_username'), ''),
      nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
      nullif(trim(u.raw_user_meta_data->>'name'), ''),
      'Member'
    ) as safe_name
  from auth.users u
) src
where mp.user_id = src.user_id
  and (
    coalesce(trim(mp.display_name), '') = ''
    or lower(trim(mp.display_name)) = 'member'
  )
  and src.safe_name <> 'Member';

-- Force admin alias.
update public.member_profiles mp
set
  display_name = 'Admin',
  updated_at = now()
where mp.user_id in (
  select u.id
  from auth.users u
  where lower(coalesce(u.email, '')) = 'andres00botero@gmail.com'
);

drop view if exists public.qa_member_leaderboard;

create view public.qa_member_leaderboard as
with place_counts as (
  select created_by as user_id, count(*)::int as places_added
  from public.places
  where created_by is not null
  group by created_by
),
event_counts as (
  select created_by as user_id, count(*)::int as events_added
  from (
    select created_by from public.events
    union all
    select created_by from public.global_events
  ) e
  where created_by is not null
  group by created_by
),
review_counts as (
  select created_by as user_id, count(*)::int as reviews_written
  from public.reviews
  where created_by is not null
  group by created_by
),
city_footprint as (
  select user_id, count(distinct city_key)::int as city_count
  from (
    select created_by as user_id, lower(trim(city)) as city_key
    from public.places
    where created_by is not null and city is not null and trim(city) <> ''
    union
    select created_by as user_id, lower(trim(city)) as city_key
    from public.events
    where created_by is not null and city is not null and trim(city) <> ''
  ) all_cities
  group by user_id
),
users_base as (
  select
    u.id as user_id,
    coalesce(
      nullif(trim(mp.display_name), ''),
      nullif(trim(u.raw_user_meta_data->>'preferred_username'), ''),
      nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
      nullif(trim(u.raw_user_meta_data->>'name'), ''),
      'Member'
    ) as display_name,
    u.email
  from auth.users u
  left join public.member_profiles mp on mp.user_id = u.id
),
scored as (
  select
    ub.user_id,
    ub.display_name,
    ub.email,
    coalesce(pc.places_added, 0) as places_added,
    coalesce(ec.events_added, 0) as events_added,
    coalesce(rc.reviews_written, 0) as reviews_written,
    coalesce(cf.city_count, 0) as city_count,
    (coalesce(pc.places_added, 0) * 5)
      + (coalesce(ec.events_added, 0) * 4)
      + (coalesce(rc.reviews_written, 0) * 2) as score
  from users_base ub
  left join place_counts pc on pc.user_id = ub.user_id
  left join event_counts ec on ec.user_id = ub.user_id
  left join review_counts rc on rc.user_id = ub.user_id
  left join city_footprint cf on cf.user_id = ub.user_id
),
ranked as (
  select
    s.*,
    dense_rank() over (order by s.score desc, s.reviews_written desc, s.places_added desc, s.user_id) as rank
  from scored s
  where s.score > 0
)
select
  rank,
  user_id,
  display_name,
  email,
  places_added,
  events_added,
  reviews_written,
  city_count,
  score,
  case
    when score >= 160 then 'Global Explorer'
    when score >= 80 then 'City Architect'
    when score >= 40 then 'Local Legend'
    when reviews_written >= 20 then 'Review Oracle'
    when places_added >= 10 then 'Venue Scout'
    else 'Rising Contributor'
  end as title
from ranked
order by rank asc, user_id asc;

grant select on public.qa_member_leaderboard to anon, authenticated;

commit;
