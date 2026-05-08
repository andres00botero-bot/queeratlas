-- Queer Atlas: Friends & Trust Network avatar support v2
-- Safe to run multiple times.

begin;

create or replace function public.qa_following_feed_favorites(feed_limit integer default 30)
returns table (
  favorite_id text,
  created_at timestamptz,
  owner_user_id uuid,
  display_name text,
  title text,
  rank integer,
  avatar_url text
)
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select auth.uid() as uid
  ),
  following as (
    select mf.followed_user_id as user_id
    from public.member_following mf
    join me on me.uid is not null and mf.follower_user_id = me.uid
  ),
  safe_limit as (
    select greatest(1, least(coalesce(feed_limit, 30), 100)) as lim
  )
  select
    fav.favorite_id::text as favorite_id,
    fav.created_at as created_at,
    fav.user_id as owner_user_id,
    coalesce(nullif(mp.display_name, ''), split_part(coalesce(u.email, 'member'), '@', 1))::text as display_name,
    coalesce(lb.title, '')::text as title,
    lb.rank::integer as rank,
    nullif(mp.avatar_url, '')::text as avatar_url
  from public.member_favorites fav
  join following f on f.user_id = fav.user_id
  left join public.member_profiles mp on mp.user_id = fav.user_id
  left join auth.users u on u.id = fav.user_id
  left join public.qa_member_leaderboard lb on lb.user_id = fav.user_id
  order by fav.created_at desc
  limit (select lim from safe_limit);
$$;

grant execute on function public.qa_following_feed_favorites(integer) to authenticated;

commit;
