-- Queer Atlas: community contribution identity columns
-- Safe to run multiple times.
--
-- Purpose:
-- - Ensure community stories, guides, topics and ideas can be tied to auth.users.
-- - Let Favorites / member profiles show real Atlas Creed contribution stats.
-- - Keep legacy author text for old rows and display fallback.

begin;

alter table if exists public.community_stories
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists created_by_email text;

alter table if exists public.community_guides
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists created_by_email text;

alter table if exists public.community_topics
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists created_by_email text;

alter table if exists public.community_ideas
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists created_by_email text;

alter table if exists public.community_stories
  alter column user_id set default auth.uid();

alter table if exists public.community_guides
  alter column user_id set default auth.uid();

alter table if exists public.community_topics
  alter column user_id set default auth.uid();

alter table if exists public.community_ideas
  alter column user_id set default auth.uid();

do $$
begin
  if to_regclass('public.community_stories') is not null then
    create index if not exists community_stories_user_id_idx
      on public.community_stories (user_id, created_at desc);
    create index if not exists community_stories_author_idx
      on public.community_stories (lower(trim(author)));
  end if;

  if to_regclass('public.community_guides') is not null then
    create index if not exists community_guides_user_id_idx
      on public.community_guides (user_id, created_at desc);
    create index if not exists community_guides_author_idx
      on public.community_guides (lower(trim(author)));
  end if;

  if to_regclass('public.community_topics') is not null then
    create index if not exists community_topics_user_id_idx
      on public.community_topics (user_id, created_at desc);
    create index if not exists community_topics_author_idx
      on public.community_topics (lower(trim(author)));
  end if;

  if to_regclass('public.community_ideas') is not null then
    create index if not exists community_ideas_user_id_idx
      on public.community_ideas (user_id, created_at desc);
    create index if not exists community_ideas_author_idx
      on public.community_ideas (lower(trim(author)));
  end if;
end $$;

commit;
