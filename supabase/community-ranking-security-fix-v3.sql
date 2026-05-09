-- Community ranking security hardening v3
-- Fixes Supabase linter errors:
-- - auth_users_exposed
-- - security_definer_view
--
-- Safe to run multiple times.

begin;

drop view if exists public.qa_member_leaderboard;

create view public.qa_member_leaderboard
with (security_invoker = true) as
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
    union
    select created_by as user_id, lower(trim(city)) as city_key
    from public.global_events
    where created_by is not null and city is not null and trim(city) <> ''
  ) all_cities
  group by user_id
),
users_base as (
  select
    up.user_id,
    coalesce(nullif(trim(up.display_name), ''), 'Member') as display_name,
    nullif(trim(up.avatar_url), '') as avatar_url,
    nullif(trim(up.avatar_path), '') as avatar_path
  from (
    select distinct mp.user_id, mp.display_name, mp.avatar_url, mp.avatar_path
    from public.member_profiles mp
    where mp.user_id is not null

    union all

    select distinct pc.user_id, null::text as display_name, null::text as avatar_url, null::text as avatar_path
    from place_counts pc

    union all

    select distinct ec.user_id, null::text as display_name, null::text as avatar_url, null::text as avatar_path
    from event_counts ec

    union all

    select distinct rc.user_id, null::text as display_name, null::text as avatar_url, null::text as avatar_path
    from review_counts rc
  ) up
),
dedup_users as (
  select
    user_id,
    max(display_name) as display_name,
    max(avatar_url) as avatar_url,
    max(avatar_path) as avatar_path
  from users_base
  group by user_id
),
scored as (
  select
    ub.user_id,
    ub.display_name,
    ub.avatar_url,
    ub.avatar_path,
    coalesce(pc.places_added, 0) as places_added,
    coalesce(ec.events_added, 0) as events_added,
    coalesce(rc.reviews_written, 0) as reviews_written,
    coalesce(cf.city_count, 0) as city_count,
    (coalesce(pc.places_added, 0) * 5)
      + (coalesce(ec.events_added, 0) * 4)
      + (coalesce(rc.reviews_written, 0) * 2) as score
  from dedup_users ub
  left join place_counts pc on pc.user_id = ub.user_id
  left join event_counts ec on ec.user_id = ub.user_id
  left join review_counts rc on rc.user_id = ub.user_id
  left join city_footprint cf on cf.user_id = ub.user_id
),
ranked as (
  select
    s.*,
    dense_rank() over (
      order by s.score desc, s.reviews_written desc, s.places_added desc, s.user_id
    ) as rank
  from scored s
  where s.score > 0
)
select
  rank,
  user_id,
  display_name,
  avatar_url,
  avatar_path,
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
