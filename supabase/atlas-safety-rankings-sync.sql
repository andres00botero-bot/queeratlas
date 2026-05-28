-- Safety ranking table (same model as qa_atlas_rankings)
-- Run in Supabase SQL editor.

create table if not exists public.qa_atlas_safety_rankings (
  year int not null,
  rank int not null,
  city text not null,
  country text,
  signal text,
  updated_by_email text,
  updated_at timestamptz not null default now(),
  primary key (year, rank)
);

create index if not exists qa_atlas_safety_rankings_year_idx
  on public.qa_atlas_safety_rankings (year desc, rank asc);

alter table public.qa_atlas_safety_rankings enable row level security;

drop policy if exists qa_atlas_safety_rankings_read on public.qa_atlas_safety_rankings;
create policy qa_atlas_safety_rankings_read
on public.qa_atlas_safety_rankings
for select
using (true);

drop policy if exists qa_atlas_safety_rankings_write on public.qa_atlas_safety_rankings;
create policy qa_atlas_safety_rankings_write
on public.qa_atlas_safety_rankings
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
