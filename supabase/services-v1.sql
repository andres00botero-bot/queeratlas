-- Queer Atlas: city services index (monetization-ready foundation)
-- Adds a first-class services table for massage, tours, concierge, and related private support.

create table if not exists public.services (
  id bigserial primary key,
  created_at timestamptz not null default timezone('utc', now()),
  name text not null,
  city text not null,
  type text not null default 'other',
  provider_name text,
  contact text,
  booking_link text,
  description text not null default '',
  hours text,
  link text,
  image_urls text[] not null default '{}',
  location text,
  lat double precision,
  lng double precision,
  price_tier text,
  vibe text,
  vibe_tags text[] not null default '{}',
  source text,
  "lastChecked" date,
  verified boolean not null default false,
  created_by uuid references auth.users (id) on delete set null
);

alter table if exists public.services
  add column if not exists image_urls text[] not null default '{}';

alter table if exists public.services
  alter column created_by set default auth.uid();

alter table if exists public.services
  drop constraint if exists qa_services_type_allowed;
alter table if exists public.services
  add constraint qa_services_type_allowed
  check (
    type = any (array[
      'massage',
      'tour',
      'wellness',
      'escort',
      'styling',
      'concierge',
      'transport',
      'other'
    ]::text[])
  );

alter table if exists public.services
  drop constraint if exists qa_services_price_tier_allowed;
alter table if exists public.services
  add constraint qa_services_price_tier_allowed
  check (
    price_tier is null
    or price_tier = ''
    or price_tier = any (array['$', '$$', '$$$', '$$$$']::text[])
  );

alter table if exists public.services
  drop constraint if exists qa_services_vibe_tags_max_3;
alter table if exists public.services
  add constraint qa_services_vibe_tags_max_3
  check (cardinality(vibe_tags) <= 3);

alter table if exists public.services
  drop constraint if exists qa_services_vibe_tags_allowed;
alter table if exists public.services
  add constraint qa_services_vibe_tags_allowed
  check (
    vibe_tags <@ array[
      'techno',
      'pop',
      'mixed',
      'electronic',
      'men_only',
      'after',
      'chill',
      'cultural',
      'fetish',
      'social',
      'cozy',
      'massive',
      'luxury',
      'festival',
      'underground',
      'cruise',
      'relax',
      'drag',
      'industrial',
      'service'
    ]::text[]
  );

alter table if exists public.services
  drop constraint if exists qa_services_image_urls_max_8;
alter table if exists public.services
  add constraint qa_services_image_urls_max_8
  check (cardinality(image_urls) <= 8);

create index if not exists qa_services_city_idx on public.services (city);
create index if not exists qa_services_type_idx on public.services (type);
create index if not exists qa_services_city_type_idx on public.services (city, type);
create index if not exists qa_services_vibe_tags_gin_idx on public.services using gin (vibe_tags);
create index if not exists qa_services_created_by_idx on public.services (created_by);

alter table if exists public.services enable row level security;

drop policy if exists qa_read_all on public.services;
create policy qa_read_all
on public.services
for select
using (true);

drop policy if exists qa_insert_authenticated on public.services;
create policy qa_insert_authenticated
on public.services
for insert
to authenticated
with check (auth.uid() is not null and created_by = auth.uid());

drop policy if exists qa_update_admin_only on public.services;
drop policy if exists qa_update_owner_or_admin on public.services;
create policy qa_update_owner_or_admin
on public.services
for update
to authenticated
using (public.qa_is_admin() or created_by = auth.uid())
with check (public.qa_is_admin() or created_by = auth.uid());

drop policy if exists qa_delete_admin_only on public.services;
drop policy if exists qa_delete_owner_or_admin on public.services;
create policy qa_delete_owner_or_admin
on public.services
for delete
to authenticated
using (public.qa_is_admin() or created_by = auth.uid());

-- Optional media bucket for service photos (used by Contribute -> Services uploader)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'service-media',
  'service-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists qa_service_media_read on storage.objects;
create policy qa_service_media_read
on storage.objects
for select
using (bucket_id = 'service-media');

drop policy if exists qa_service_media_insert_authenticated on storage.objects;
create policy qa_service_media_insert_authenticated
on storage.objects
for insert
to authenticated
with check (bucket_id = 'service-media' and auth.uid() is not null);
