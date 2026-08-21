-- Queer Atlas: member comments on admin-published news articles
-- Comments publish immediately. Admin review is informational, not an approval gate.
-- Safe to run multiple times.

begin;

create table if not exists public.qa_news_comments (
  id uuid primary key default gen_random_uuid(),
  article_id text not null references public.qa_world_news(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_display_name text not null default 'Member',
  author_avatar_url text,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  status text not null default 'published' check (status in ('published', 'removed')),
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  removed_at timestamptz,
  removed_by uuid references auth.users(id),
  admin_seen_at timestamptz,
  admin_seen_by uuid references auth.users(id)
);

create index if not exists qa_news_comments_article_created_idx
  on public.qa_news_comments (article_id, created_at desc);
create index if not exists qa_news_comments_admin_inbox_idx
  on public.qa_news_comments (admin_seen_at, created_at desc);

create or replace function public.qa_news_comment_set_author()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_row record;
begin
  new.author_id := auth.uid();
  select display_name, avatar_url
    into profile_row
  from public.member_profiles
  where user_id = auth.uid();

  new.author_display_name := coalesce(nullif(btrim(profile_row.display_name), ''), 'Member');
  new.author_avatar_url := nullif(btrim(coalesce(profile_row.avatar_url, '')), '');
  new.status := 'published';
  new.admin_seen_at := null;
  new.admin_seen_by := null;
  new.removed_at := null;
  new.removed_by := null;
  return new;
end;
$$;

drop trigger if exists qa_news_comment_set_author_trigger on public.qa_news_comments;
create trigger qa_news_comment_set_author_trigger
before insert on public.qa_news_comments
for each row execute function public.qa_news_comment_set_author();

alter table public.qa_news_comments enable row level security;

drop policy if exists qa_news_comments_public_read on public.qa_news_comments;
create policy qa_news_comments_public_read
on public.qa_news_comments
for select
using (true);

drop policy if exists qa_news_comments_member_insert on public.qa_news_comments;
create policy qa_news_comments_member_insert
on public.qa_news_comments
for insert
to authenticated
with check (
  auth.uid() is not null
  and auth.uid() = author_id
  and status = 'published'
);

drop policy if exists qa_news_comments_admin_update on public.qa_news_comments;
create policy qa_news_comments_admin_update
on public.qa_news_comments
for update
to authenticated
using (public.qa_is_admin())
with check (public.qa_is_admin());

grant select on public.qa_news_comments to anon, authenticated;
grant insert on public.qa_news_comments to authenticated;
grant update on public.qa_news_comments to authenticated;

select pg_notify('pgrst', 'reload schema');

commit;

-- End of migration.
