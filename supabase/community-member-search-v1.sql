-- Queer Atlas: community member discovery search
-- Safe to run multiple times.

begin;

create or replace function public.qa_search_members(
  search_query text default '',
  city_filter text default '',
  sort_mode text default 'best',
  friends_only boolean default false,
  result_limit integer default 24,
  result_offset integer default 0
)
returns table (
  user_id uuid,
  display_name text,
  home_city text,
  resident_country text,
  pronouns text,
  title text,
  rank integer,
  score integer,
  city_count integer,
  is_following boolean,
  follows_you boolean,
  mutual_count integer,
  is_online boolean,
  last_seen_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select auth.uid() as uid
  ),
  lim as (
    select greatest(1, least(coalesce(result_limit, 24), 60)) as value
  ),
  offs as (
    select greatest(0, coalesce(result_offset, 0)) as value
  ),
  query as (
    select lower(trim(coalesce(search_query, ''))) as q
  ),
  city_q as (
    select lower(trim(coalesce(city_filter, ''))) as city
  ),
  sorting as (
    select lower(trim(coalesce(sort_mode, 'best'))) as mode
  ),
  candidates as (
    select distinct mp.user_id
    from public.member_profiles mp
    where mp.user_id is not null
    union
    select distinct lb.user_id
    from public.qa_member_leaderboard lb
    where lb.user_id is not null
    union
    select distinct mf.followed_user_id
    from public.member_following mf
    where mf.followed_user_id is not null
    union
    select distinct mf.follower_user_id
    from public.member_following mf
    where mf.follower_user_id is not null
  ),
  base as (
    select
      c.user_id,
      coalesce(
        nullif(trim(mp.display_name), ''),
        nullif(trim(lb.display_name), ''),
        'Member'
      ) as display_name,
      nullif(trim(mp.home_city), '') as home_city,
      nullif(trim(mp.resident_country), '') as resident_country,
      nullif(trim(mp.pronouns), '') as pronouns,
      coalesce(nullif(trim(lb.title), ''), '') as title,
      coalesce(lb.rank, 999999)::integer as rank,
      coalesce(lb.score, 0)::integer as score,
      coalesce(lb.city_count, 0)::integer as city_count,
      coalesce(p.is_online, false) as is_online,
      p.last_seen_at
    from candidates c
    left join public.member_profiles mp on mp.user_id = c.user_id
    left join public.qa_member_leaderboard lb on lb.user_id = c.user_id
    left join public.qa_presence p on p.user_id = c.user_id
    left join auth.users u on u.id = c.user_id
    join me on me.uid is not null
    where c.user_id <> me.uid
  ),
  relationships as (
    select
      b.user_id,
      exists (
        select 1
        from public.member_following mf
        join me on me.uid is not null
        where mf.follower_user_id = me.uid and mf.followed_user_id = b.user_id
      ) as is_following,
      exists (
        select 1
        from public.member_following mf
        join me on me.uid is not null
        where mf.follower_user_id = b.user_id and mf.followed_user_id = me.uid
      ) as follows_you,
      coalesce((
        select count(*)::integer
        from public.member_following mine
        join public.member_following theirs
          on theirs.followed_user_id = mine.followed_user_id
        join me on me.uid is not null
        where mine.follower_user_id = me.uid
          and theirs.follower_user_id = b.user_id
      ), 0) as mutual_count
    from base b
  ),
  merged as (
    select
      b.user_id,
      b.display_name,
      b.home_city,
      b.resident_country,
      b.pronouns,
      b.title,
      b.rank,
      b.score,
      b.city_count,
      r.is_following,
      r.follows_you,
      r.mutual_count,
      b.is_online,
      b.last_seen_at
    from base b
    join relationships r on r.user_id = b.user_id
  )
  select
    m.user_id,
    m.display_name,
    m.home_city,
    m.resident_country,
    m.pronouns,
    m.title,
    m.rank,
    m.score,
    m.city_count,
    m.is_following,
    m.follows_you,
    m.mutual_count,
    m.is_online,
    m.last_seen_at
  from merged m
  cross join query q
  cross join city_q cq
  where
    (
      q.q = ''
      or lower(coalesce(m.display_name, '')) like ('%' || q.q || '%')
      or lower(coalesce(m.home_city, '')) like ('%' || q.q || '%')
      or lower(coalesce(m.resident_country, '')) like ('%' || q.q || '%')
      or lower(coalesce(m.pronouns, '')) like ('%' || q.q || '%')
      or lower(coalesce(m.title, '')) like ('%' || q.q || '%')
    )
    and (
      cq.city = ''
      or lower(coalesce(m.home_city, '')) = cq.city
    )
    and (
      not coalesce(friends_only, false)
      or m.is_following
    )
    and m.user_id is not null
  order by
    case when (select mode from sorting) = 'active' then 0 else 1 end,
    case when (select mode from sorting) = 'active' then m.is_online end desc nulls last,
    case when (select mode from sorting) = 'active' then m.last_seen_at end desc nulls last,
    case when (select mode from sorting) = 'mutual' then 0 else 1 end,
    case when (select mode from sorting) = 'mutual' then m.mutual_count end desc nulls last,
    case when (select mode from sorting) = 'best' then 0 else 1 end,
    m.is_following desc,
    m.is_online desc,
    m.mutual_count desc,
    m.score desc,
    m.last_seen_at desc nulls last,
    m.display_name asc,
    m.user_id asc
  limit (select value from lim)
  offset (select value from offs);
$$;

grant execute on function public.qa_search_members(text, text, text, boolean, integer, integer) to authenticated;

create index if not exists idx_member_profiles_display_name_lower
  on public.member_profiles (lower(display_name));

create index if not exists idx_member_profiles_home_city_lower
  on public.member_profiles (lower(home_city));

create index if not exists idx_member_following_follower_followed
  on public.member_following (follower_user_id, followed_user_id);

create index if not exists idx_member_following_followed_follower
  on public.member_following (followed_user_id, follower_user_id);

commit;
