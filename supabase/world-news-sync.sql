-- Queer Atlas: world news + ranking persistence
-- Run this once in Supabase SQL Editor.

create table if not exists public.qa_world_news (
  id text primary key,
  title text not null,
  city text,
  category text not null default 'culture_tip',
  date date not null default current_date,
  summary text not null,
  why_it_matters text not null,
  source_name text,
  created_by_email text,
  created_at timestamptz not null default now()
);

create table if not exists public.qa_world_news_hidden (
  feed_id text primary key,
  hidden_by_email text,
  hidden_at timestamptz not null default now()
);

create table if not exists public.qa_atlas_rankings (
  year int not null,
  rank int not null,
  city text not null,
  country text,
  signal text,
  updated_by_email text,
  updated_at timestamptz not null default now(),
  primary key (year, rank)
);

create index if not exists qa_world_news_date_idx on public.qa_world_news (date desc);
create index if not exists qa_atlas_rankings_year_idx on public.qa_atlas_rankings (year desc, rank asc);

create table if not exists public.qa_admin_users (
  email text primary key,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- Add your own Google account email as the first admin.
-- Example:
-- insert into public.qa_admin_users (email) values ('you@gmail.com')
-- on conflict (email) do nothing;

create or replace function public.qa_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.qa_admin_users admin
    where lower(admin.email) = lower(coalesce(auth.jwt()->>'email', ''))
  );
$$;

grant execute on function public.qa_is_admin() to anon, authenticated;

alter table public.qa_world_news enable row level security;
alter table public.qa_world_news_hidden enable row level security;
alter table public.qa_atlas_rankings enable row level security;
alter table public.qa_admin_users enable row level security;

drop policy if exists qa_admin_users_read_self on public.qa_admin_users;
create policy qa_admin_users_read_self
on public.qa_admin_users
for select
to authenticated
using (lower(email) = lower(coalesce(auth.jwt()->>'email', '')));

drop policy if exists qa_admin_users_manage_by_admin on public.qa_admin_users;
create policy qa_admin_users_manage_by_admin
on public.qa_admin_users
for all
to authenticated
using (public.qa_is_admin())
with check (public.qa_is_admin());

drop policy if exists qa_world_news_read on public.qa_world_news;
create policy qa_world_news_read
on public.qa_world_news
for select
using (true);

drop policy if exists qa_world_news_write on public.qa_world_news;
create policy qa_world_news_write
on public.qa_world_news
for all
to authenticated
using (public.qa_is_admin())
with check (
  public.qa_is_admin()
  and (
    created_by_email is null
    or lower(created_by_email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);

drop policy if exists qa_world_news_hidden_read on public.qa_world_news_hidden;
create policy qa_world_news_hidden_read
on public.qa_world_news_hidden
for select
using (true);

drop policy if exists qa_world_news_hidden_write on public.qa_world_news_hidden;
create policy qa_world_news_hidden_write
on public.qa_world_news_hidden
for all
to authenticated
using (public.qa_is_admin())
with check (
  public.qa_is_admin()
  and (
    hidden_by_email is null
    or lower(hidden_by_email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);

drop policy if exists qa_atlas_rankings_read on public.qa_atlas_rankings;
create policy qa_atlas_rankings_read
on public.qa_atlas_rankings
for select
using (true);

drop policy if exists qa_atlas_rankings_write on public.qa_atlas_rankings;
create policy qa_atlas_rankings_write
on public.qa_atlas_rankings
for all
to authenticated
using (public.qa_is_admin())
with check (
  public.qa_is_admin()
  and (
    updated_by_email is null
    or lower(updated_by_email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
);
