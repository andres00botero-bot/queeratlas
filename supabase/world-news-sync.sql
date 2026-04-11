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

alter table public.qa_world_news enable row level security;
alter table public.qa_world_news_hidden enable row level security;
alter table public.qa_atlas_rankings enable row level security;

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
using (true)
with check (true);

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
using (true)
with check (true);

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
using (true)
with check (true);
