-- Queer Atlas: saved news stories and followed news desks.
-- Safe to run repeatedly.

begin;

create table if not exists public.member_news_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  preference_type text not null check (preference_type in ('story', 'city', 'topic')),
  target_id text not null check (char_length(btrim(target_id)) between 1 and 240),
  metadata jsonb not null default '{}'::jsonb check (octet_length(metadata::text) <= 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, preference_type, target_id)
);

create index if not exists member_news_preferences_user_created_idx
  on public.member_news_preferences (user_id, created_at desc);

alter table public.member_news_preferences enable row level security;

drop policy if exists member_news_preferences_owner_select on public.member_news_preferences;
create policy member_news_preferences_owner_select
on public.member_news_preferences for select to authenticated
using (auth.uid() = user_id);

drop policy if exists member_news_preferences_owner_insert on public.member_news_preferences;
create policy member_news_preferences_owner_insert
on public.member_news_preferences for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists member_news_preferences_owner_update on public.member_news_preferences;
create policy member_news_preferences_owner_update
on public.member_news_preferences for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists member_news_preferences_owner_delete on public.member_news_preferences;
create policy member_news_preferences_owner_delete
on public.member_news_preferences for delete to authenticated
using (auth.uid() = user_id);

grant select, insert, update, delete on public.member_news_preferences to authenticated;

select pg_notify('pgrst', 'reload schema');

commit;
