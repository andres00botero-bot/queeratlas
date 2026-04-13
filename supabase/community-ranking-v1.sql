-- QueerAtlas Community Ranking V1
-- Safe to run multiple times.
-- Purpose:
-- 1) Ensure created_by tracking exists on contribution tables
-- 2) Create a reusable leaderboard view with score + title

begin;

-- -----------------------------
-- Contribution identity columns
-- -----------------------------
alter table if exists public.places
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table if exists public.events
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table if exists public.reviews
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table if exists public.global_events
  add column if not exists created_by uuid references auth.users(id) on delete set null;

-- Default writer identity for new rows created by authenticated users.
alter table if exists public.places
  alter column created_by set default auth.uid();

alter table if exists public.events
  alter column created_by set default auth.uid();

alter table if exists public.reviews
  alter column created_by set default auth.uid();

alter table if exists public.global_events
  alter column created_by set default auth.uid();

-- Helpful indexes for leaderboard queries.
create index if not exists idx_places_created_by on public.places(created_by);
create index if not exists idx_events_created_by on public.events(created_by);
create index if not exists idx_reviews_created_by on public.reviews(created_by);
create index if not exists idx_global_events_created_by on public.global_events(created_by);

-- -------------------------------------------------
-- Leaderboard view
-- Score model:
--   place   = 5 points
--   event   = 4 points (city + global)
--   review  = 2 points
-- -------------------------------------------------
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
    coalesce(mp.display_name, split_part(u.email, '@', 1), 'Member') as display_name,
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

-- Public read access for client-side leaderboard widgets.
grant select on public.qa_member_leaderboard to anon, authenticated;

commit;
