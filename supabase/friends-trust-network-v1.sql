-- Queer Atlas: Friends & Trust Network V1
-- Safe to run multiple times.
-- Adds:
-- 1) member_following (follow/unfollow graph)
-- 2) qa_following_feed_favorites() (trusted favorites feed for current member)
-- 3) qa_following_favorite_count() (count how many followed members saved a specific item)

begin;

create table if not exists public.member_following (
  id bigserial primary key,
  follower_user_id uuid not null references auth.users(id) on delete cascade,
  followed_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint member_following_not_self check (follower_user_id <> followed_user_id),
  constraint member_following_unique unique (follower_user_id, followed_user_id)
);

create index if not exists member_following_follower_idx
  on public.member_following (follower_user_id);

create index if not exists member_following_followed_idx
  on public.member_following (followed_user_id);

alter table public.member_following enable row level security;

drop policy if exists member_following_read_own on public.member_following;
create policy member_following_read_own
on public.member_following
for select
to authenticated
using (
  follower_user_id = auth.uid()
  or followed_user_id = auth.uid()
  or public.qa_is_admin()
);

drop policy if exists member_following_insert_own on public.member_following;
create policy member_following_insert_own
on public.member_following
for insert
to authenticated
with check (
  follower_user_id = auth.uid()
  and followed_user_id <> auth.uid()
);

drop policy if exists member_following_delete_own on public.member_following;
create policy member_following_delete_own
on public.member_following
for delete
to authenticated
using (
  follower_user_id = auth.uid()
  or public.qa_is_admin()
);

drop policy if exists member_following_update_none on public.member_following;
create policy member_following_update_none
on public.member_following
for update
to authenticated
using (false)
with check (false);

create or replace function public.qa_following_feed_favorites(feed_limit integer default 30)
returns table (
  favorite_id text,
  created_at timestamptz,
  owner_user_id uuid,
  display_name text,
  title text,
  rank integer
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
    coalesce(nullif(mp.display_name, ''), 'Member')::text as display_name,
    coalesce(lb.title, '')::text as title,
    lb.rank::integer as rank
  from public.member_favorites fav
  join following f on f.user_id = fav.user_id
  left join public.member_profiles mp on mp.user_id = fav.user_id
  left join auth.users u on u.id = fav.user_id
  left join public.qa_member_leaderboard lb on lb.user_id = fav.user_id
  order by fav.created_at desc
  limit (select lim from safe_limit);
$$;

grant execute on function public.qa_following_feed_favorites(integer) to authenticated;

create or replace function public.qa_following_favorite_count(target_favorite_id text)
returns integer
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
  )
  select coalesce(count(*), 0)::integer
  from public.member_favorites fav
  join following f on f.user_id = fav.user_id
  where fav.favorite_id = coalesce(target_favorite_id, '');
$$;

grant execute on function public.qa_following_favorite_count(text) to authenticated;

commit;
