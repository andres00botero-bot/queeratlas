-- Queer Atlas: editorial identity, sourcing, review and revision system.
-- Prerequisite: public.qa_is_admin() from core-rls-hardening.sql.
-- Safe to run more than once.

begin;

create extension if not exists pgcrypto;

-- Recreate the shared admin guard with explicit, fully qualified relations.
-- This also repairs older installations where qa_is_admin() may reference a stale alias.
create table if not exists public.qa_admin_users (
  email text primary key,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create or replace function public.qa_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.qa_admin_users as admin_user
    where lower(admin_user.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.qa_is_admin() to anon, authenticated;

create table if not exists public.qa_editorial_people (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  slug text not null unique,
  name text not null,
  person_type text not null default 'person'
    check (person_type in ('person', 'organization')),
  role text,
  bio text,
  city text,
  country text,
  languages text[] not null default '{}'::text[],
  expertise text[] not null default '{}'::text[],
  avatar_url text,
  profile_url text,
  user_id uuid references auth.users(id) on delete set null,
  is_public boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint qa_editorial_people_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.qa_editorial_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  content_key text not null unique,
  route text not null unique,
  content_type text not null
    check (content_type in ('guide', 'report', 'collection', 'city_discovery', 'policy', 'other')),
  title text not null,
  status text not null default 'draft'
    check (status in ('draft', 'in_review', 'published', 'archived')),
  author_id uuid references public.qa_editorial_people(id) on delete set null,
  reviewer_id uuid references public.qa_editorial_people(id) on delete set null,
  published_at date,
  last_updated_at date not null default current_date,
  reviewed_at date,
  research_scope text,
  methodology_note text,
  is_public boolean not null default true,
  version integer not null default 1 check (version > 0),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint qa_editorial_entries_content_key_format
    check (content_key ~ '^[a-z0-9:_-]+$'),
  constraint qa_editorial_entries_route_format
    check (route like '/%'),
  constraint qa_editorial_entries_reviewer_distinct
    check (reviewer_id is null or reviewer_id is distinct from author_id),
  constraint qa_editorial_entries_publish_date
    check (status <> 'published' or published_at is not null)
);

create table if not exists public.qa_editorial_sources (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  entry_id uuid not null references public.qa_editorial_entries(id) on delete cascade,
  url text not null,
  source_name text not null,
  source_type text not null default 'other'
    check (source_type in ('official', 'authority', 'local_media', 'specialist', 'review_platform', 'community', 'other')),
  confidence text not null default 'medium'
    check (confidence in ('high', 'medium', 'developing')),
  claim_scope text,
  checked_at date,
  is_public boolean not null default true,
  sort_order integer not null default 0,
  internal_note text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint qa_editorial_sources_http_url
    check (url ~* '^https?://'),
  constraint qa_editorial_sources_entry_url_unique unique (entry_id, url)
);

create table if not exists public.qa_editorial_revisions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  entry_id uuid not null references public.qa_editorial_entries(id) on delete cascade,
  changed_at date not null default current_date,
  summary text not null,
  change_type text not null default 'editorial'
    check (change_type in ('correction', 'source_update', 'fact_check', 'editorial', 'formatting')),
  is_material boolean not null default true,
  is_public boolean not null default true,
  changed_by uuid references auth.users(id) on delete set null,
  constraint qa_editorial_revisions_entry_change_unique unique (entry_id, changed_at, summary)
);

create index if not exists qa_editorial_people_public_idx
  on public.qa_editorial_people (is_public, is_active, name);
create index if not exists qa_editorial_entries_status_type_idx
  on public.qa_editorial_entries (status, content_type, last_updated_at desc);
create index if not exists qa_editorial_entries_author_idx
  on public.qa_editorial_entries (author_id, status);
create index if not exists qa_editorial_sources_entry_sort_idx
  on public.qa_editorial_sources (entry_id, sort_order, checked_at desc);
create index if not exists qa_editorial_revisions_entry_date_idx
  on public.qa_editorial_revisions (entry_id, changed_at desc, created_at desc);

create or replace function public.qa_editorial_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

create or replace function public.qa_editorial_version_entry()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  new.version := old.version + 1;
  if new.last_updated_at is not distinct from old.last_updated_at then
    new.last_updated_at := current_date;
  end if;
  return new;
end;
$$;

drop trigger if exists qa_editorial_people_touch on public.qa_editorial_people;
create trigger qa_editorial_people_touch
before update on public.qa_editorial_people
for each row execute function public.qa_editorial_touch_updated_at();

drop trigger if exists qa_editorial_entries_version on public.qa_editorial_entries;
create trigger qa_editorial_entries_version
before update on public.qa_editorial_entries
for each row execute function public.qa_editorial_version_entry();

drop trigger if exists qa_editorial_sources_touch on public.qa_editorial_sources;
create trigger qa_editorial_sources_touch
before update on public.qa_editorial_sources
for each row execute function public.qa_editorial_touch_updated_at();

alter table public.qa_editorial_people enable row level security;
alter table public.qa_editorial_entries enable row level security;
alter table public.qa_editorial_sources enable row level security;
alter table public.qa_editorial_revisions enable row level security;

drop policy if exists qa_editorial_people_public_read on public.qa_editorial_people;
create policy qa_editorial_people_public_read
on public.qa_editorial_people for select
to anon, authenticated
using (is_public and is_active);

drop policy if exists qa_editorial_people_admin_read on public.qa_editorial_people;
create policy qa_editorial_people_admin_read
on public.qa_editorial_people for select
to authenticated
using (public.qa_is_admin());

drop policy if exists qa_editorial_people_admin_insert on public.qa_editorial_people;
create policy qa_editorial_people_admin_insert
on public.qa_editorial_people for insert
to authenticated
with check (public.qa_is_admin());

drop policy if exists qa_editorial_people_admin_update on public.qa_editorial_people;
create policy qa_editorial_people_admin_update
on public.qa_editorial_people for update
to authenticated
using (public.qa_is_admin())
with check (public.qa_is_admin());

drop policy if exists qa_editorial_people_admin_delete on public.qa_editorial_people;
create policy qa_editorial_people_admin_delete
on public.qa_editorial_people for delete
to authenticated
using (public.qa_is_admin());

drop policy if exists qa_editorial_entries_public_read on public.qa_editorial_entries;
create policy qa_editorial_entries_public_read
on public.qa_editorial_entries for select
to anon, authenticated
using (is_public and status = 'published');

drop policy if exists qa_editorial_entries_admin_read on public.qa_editorial_entries;
create policy qa_editorial_entries_admin_read
on public.qa_editorial_entries for select
to authenticated
using (public.qa_is_admin());

drop policy if exists qa_editorial_entries_admin_insert on public.qa_editorial_entries;
create policy qa_editorial_entries_admin_insert
on public.qa_editorial_entries for insert
to authenticated
with check (public.qa_is_admin());

drop policy if exists qa_editorial_entries_admin_update on public.qa_editorial_entries;
create policy qa_editorial_entries_admin_update
on public.qa_editorial_entries for update
to authenticated
using (public.qa_is_admin())
with check (public.qa_is_admin());

drop policy if exists qa_editorial_entries_admin_delete on public.qa_editorial_entries;
create policy qa_editorial_entries_admin_delete
on public.qa_editorial_entries for delete
to authenticated
using (public.qa_is_admin());

drop policy if exists qa_editorial_sources_public_read on public.qa_editorial_sources;
create policy qa_editorial_sources_public_read
on public.qa_editorial_sources for select
to anon, authenticated
using (
  is_public
  and exists (
    select 1 from public.qa_editorial_entries entry
    where entry.id = qa_editorial_sources.entry_id
      and entry.is_public
      and entry.status = 'published'
  )
);

drop policy if exists qa_editorial_sources_admin_all on public.qa_editorial_sources;
create policy qa_editorial_sources_admin_all
on public.qa_editorial_sources for all
to authenticated
using (public.qa_is_admin())
with check (public.qa_is_admin());

drop policy if exists qa_editorial_revisions_public_read on public.qa_editorial_revisions;
create policy qa_editorial_revisions_public_read
on public.qa_editorial_revisions for select
to anon, authenticated
using (
  is_public
  and exists (
    select 1 from public.qa_editorial_entries entry
    where entry.id = qa_editorial_revisions.entry_id
      and entry.is_public
      and entry.status = 'published'
  )
);

drop policy if exists qa_editorial_revisions_admin_all on public.qa_editorial_revisions;
create policy qa_editorial_revisions_admin_all
on public.qa_editorial_revisions for all
to authenticated
using (public.qa_is_admin())
with check (public.qa_is_admin());

grant select on public.qa_editorial_people to anon, authenticated;
grant select on public.qa_editorial_entries to anon, authenticated;
grant select on public.qa_editorial_sources to anon, authenticated;
grant select on public.qa_editorial_revisions to anon, authenticated;
grant insert, update, delete on public.qa_editorial_people to authenticated;
grant insert, update, delete on public.qa_editorial_entries to authenticated;
grant insert, update, delete on public.qa_editorial_sources to authenticated;
grant insert, update, delete on public.qa_editorial_revisions to authenticated;

insert into public.qa_editorial_people (
  slug, name, person_type, role, bio, languages, expertise, is_public, is_active
)
values (
  'queer-atlas-editorial-team',
  'Queer Atlas Editorial Team',
  'organization',
  'Editorial desk',
  'The Queer Atlas editorial desk turns verified public information, local context, and moderated community signal into practical queer travel guidance.',
  array['English', 'Swedish'],
  array['Queer travel', 'Nightlife', 'Events', 'Editorial verification'],
  true,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  person_type = excluded.person_type,
  role = excluded.role,
  bio = excluded.bio,
  languages = excluded.languages,
  expertise = excluded.expertise,
  is_public = excluded.is_public,
  is_active = excluded.is_active;

with editorial_team as (
  select id from public.qa_editorial_people where slug = 'queer-atlas-editorial-team'
), seed_entries(content_key, route, content_type, title, published_at, research_scope) as (
  values
    ('guide:gay-guide', '/gay-guide', 'guide', 'Gay Travel Guide 2026', date '2026-04-12', 'Uses Queer Atlas city, venue, event, and route structures to explain a nightlife-focused travel workflow.'),
    ('guide:queer-guide', '/queer-guide', 'guide', 'Queer Travel Guide 2026', date '2026-04-12', 'Uses Queer Atlas city context, venue categories, events, and moderated community features to explain context-first queer travel planning.'),
    ('guide:hbtq-guide', '/hbtq-guide', 'guide', 'HBTQ Guide 2026', date '2026-04-12', 'Maps Queer Atlas city, venue, event, and community features into a Swedish-intent HBTQ travel workflow.'),
    ('report:queer-nightlife-index-2026', '/reports/queer-nightlife-index-2026', 'report', 'Queer Nightlife Index 2026', date '2026-05-01', 'Reviews route-quality patterns across Queer Atlas city, venue, event, and topic coverage.'),
    ('report:safest-queer-cities-2026', '/reports/safest-queer-cities-2026', 'report', 'Safest Queer Cities 2026', date '2026-05-01', 'Reviews movement confidence, moderation signal, route continuity, and fallback depth represented in Queer Atlas city coverage.'),
    ('report:global-queer-event-report-2026', '/reports/global-queer-event-report-2026', 'report', 'Global Queer Event Report 2026', date '2026-05-01', 'Reviews event timing, discoverability, and route execution patterns represented in Queer Atlas event and city-topic coverage.'),
    ('report:top-lgbtq-nightlife-destinations-2026', '/reports/top-lgbtq-nightlife-destinations-2026', 'report', 'Top LGBTQ Nightlife Destinations 2026', date '2026-05-01', 'Reviews nightlife depth, route breadth, and social-fit coverage across Queer Atlas destinations.'),
    ('collection:best-queer-techno-clubs-world', '/now/collections/best-queer-techno-clubs-world', 'collection', 'Best Queer Techno Clubs in the World', date '2026-06-25', 'Reviews six named club or city routes for queer relevance, programming depth, visitor usefulness, and current safety context.'),
    ('collection:best-queer-beaches-europe', '/now/collections/best-queer-beaches-europe', 'collection', 'Best Queer Beaches in Europe', date '2026-06-25', 'Reviews six beach destinations using queer visibility, daytime social flow, access, nearby nightlife, and safety context.'),
    ('collection:best-lesbian-bars-europe', '/now/collections/best-lesbian-bars-europe', 'collection', 'Best Lesbian Bars in Europe', date '2026-06-25', 'Reviews dedicated lesbian venues and recurring women-led nightlife routes for relevance, inclusion, and community consistency.'),
    ('collection:best-drag-venues', '/now/collections/best-drag-venues', 'collection', 'Best Drag Venues', date '2026-06-25', 'Reviews drag and performance-led venues for programming consistency, local reputation, atmosphere, and visitor usefulness.'),
    ('collection:hidden-queer-cafes', '/now/collections/hidden-queer-cafes', 'collection', 'Hidden Queer Cafes', date '2026-06-25', 'Reviews lower-pressure cafes, bookstores, terraces, and daytime routes for queer relevance and social usefulness.'),
    ('collection:best-first-night-bars-solo', '/now/collections/best-first-night-bars-solo', 'collection', 'Best First-Night Bars for Solo Queer Travelers', date '2026-06-25', 'Reviews approachable first-night routes for social fit, transit ease, safety context, and low-friction entry.')
)
insert into public.qa_editorial_entries (
  content_key, route, content_type, title, status, author_id,
  published_at, last_updated_at, research_scope, is_public
)
select
  seed.content_key,
  seed.route,
  seed.content_type,
  seed.title,
  'published',
  editorial_team.id,
  seed.published_at,
  date '2026-08-04',
  seed.research_scope,
  true
from seed_entries seed
cross join editorial_team
on conflict (content_key) do nothing;

insert into public.qa_editorial_revisions (
  entry_id, changed_at, summary, change_type, is_material, is_public
)
select
  entry.id,
  date '2026-08-04',
  'Added editorial ownership, research disclosure, and public change history.',
  'editorial',
  true,
  true
from public.qa_editorial_entries entry
where entry.content_key in (
  'guide:gay-guide',
  'guide:queer-guide',
  'guide:hbtq-guide',
  'report:queer-nightlife-index-2026',
  'report:safest-queer-cities-2026',
  'report:global-queer-event-report-2026',
  'report:top-lgbtq-nightlife-destinations-2026',
  'collection:best-queer-techno-clubs-world',
  'collection:best-queer-beaches-europe',
  'collection:best-lesbian-bars-europe',
  'collection:best-drag-venues',
  'collection:hidden-queer-cafes',
  'collection:best-first-night-bars-solo'
)
on conflict (entry_id, changed_at, summary) do nothing;

commit;
