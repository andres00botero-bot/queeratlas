-- Queer Atlas city registry · admin creation + automatic SEO readiness
-- Run once in Supabase SQL Editor. Safe to run again.

begin;

create table if not exists public.qa_cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  name text not null check (char_length(btrim(name)) >= 2),
  title text not null check (char_length(btrim(title)) >= 4),
  country text not null check (char_length(btrim(country)) >= 2),
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  map_confirmed boolean not null default false,
  timezone text not null check (timezone ~ '^[A-Za-z_+-]+(?:/[A-Za-z0-9_+-]+)+$'),
  vibe text not null check (char_length(btrim(vibe)) >= 3),
  introduction text not null check (char_length(btrim(introduction)) >= 120),
  safety_context text not null check (char_length(btrim(safety_context)) >= 80),
  qari_destination_key text not null,
  qari_score smallint not null check (qari_score between 0 and 100),
  qari_summary text not null check (char_length(btrim(qari_summary)) >= 40),
  qari_confidence text not null check (qari_confidence in ('low', 'medium', 'high')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  verified_place_count integer not null default 0 check (verified_place_count >= 0),
  seo_indexable boolean not null default false,
  seo_requirements jsonb not null default '{}'::jsonb,
  indexable_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists qa_cities_country_idx on public.qa_cities (lower(country));
create index if not exists qa_cities_public_idx on public.qa_cities (status, seo_indexable);

create or replace function public.qa_city_slug(value text)
returns text
language sql
immutable
strict
set search_path = public
as $$
  select trim(both '_' from regexp_replace(lower(btrim(value)), '[^a-z0-9]+', '_', 'g'));
$$;

create or replace function public.qa_refresh_city_seo_status(target_slug text)
returns public.qa_cities
language plpgsql
security definer
set search_path = public
as $$
declare
  city_row public.qa_cities;
  approved_count integer := 0;
  has_identity boolean;
  has_map boolean;
  has_intro boolean;
  has_safety boolean;
  has_qari boolean;
  ready boolean;
begin
  select * into city_row
  from public.qa_cities
  where slug = public.qa_city_slug(target_slug)
  for update;

  if not found then return null; end if;

  select count(*)::integer into approved_count
  from public.places p
  where public.qa_city_slug(p.city) = city_row.slug
    and coalesce(p.seo_indexable, false) = true
    and lower(coalesce(p.seo_quality_status, '')) = 'approved';

  has_identity := nullif(btrim(city_row.name), '') is not null
    and nullif(btrim(city_row.country), '') is not null
    and city_row.country_code ~ '^[A-Z]{2}$';
  has_map := city_row.map_confirmed
    and city_row.latitude between -90 and 90
    and city_row.longitude between -180 and 180;
  has_intro := char_length(btrim(city_row.introduction)) >= 120;
  has_safety := char_length(btrim(city_row.safety_context)) >= 80;
  has_qari := nullif(btrim(city_row.qari_destination_key), '') is not null
    and char_length(btrim(city_row.qari_summary)) >= 40;
  ready := city_row.status = 'published'
    and approved_count >= 3
    and has_identity and has_map and has_intro and has_safety and has_qari;

  update public.qa_cities
  set verified_place_count = approved_count,
      seo_indexable = ready,
      seo_requirements = jsonb_build_object(
        'published', status = 'published',
        'identity', has_identity,
        'mapConfirmed', has_map,
        'introduction', has_intro,
        'safetyContext', has_safety,
        'qariProfile', has_qari,
        'verifiedPlaces', approved_count,
        'minimumVerifiedPlaces', 3
      ),
      indexable_at = case
        when ready and indexable_at is null then now()
        when not ready then null
        else indexable_at
      end,
      updated_at = now()
  where slug = city_row.slug
  returning * into city_row;

  return city_row;
end;
$$;

create or replace function public.qa_city_before_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  qari_row public.qa_qari_profiles;
begin
  new.slug := public.qa_city_slug(new.slug);
  new.name := btrim(new.name);
  new.title := coalesce(nullif(btrim(new.title), ''), 'Queer ' || new.name);
  new.country := btrim(new.country);
  new.country_code := upper(btrim(new.country_code));
  new.updated_at := now();

  select * into qari_row
  from public.qa_qari_profiles
  where destination_key = new.qari_destination_key
    and scope_type = 'country'
    and is_published = true
    and lower(btrim(country)) = lower(btrim(new.country));

  if not found then
    raise exception 'A published country QARI profile matching % is required.', new.country;
  end if;

  new.qari_score := qari_row.qari_score;
  new.qari_summary := qari_row.summary;
  new.qari_confidence := qari_row.confidence;
  return new;
end;
$$;

drop trigger if exists qa_cities_before_write on public.qa_cities;
create trigger qa_cities_before_write
before insert or update on public.qa_cities
for each row execute function public.qa_city_before_write();

create or replace function public.qa_city_after_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.qa_refresh_city_seo_status(new.slug);
  return new;
end;
$$;

drop trigger if exists qa_cities_after_write on public.qa_cities;
create trigger qa_cities_after_write
after insert or update of status, map_confirmed, introduction, safety_context, qari_destination_key
on public.qa_cities
for each row execute function public.qa_city_after_write();

create or replace function public.qa_places_refresh_city()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op <> 'DELETE' then
    perform public.qa_refresh_city_seo_status(new.city);
  end if;
  if tg_op <> 'INSERT' and (tg_op = 'DELETE' or old.city is distinct from new.city) then
    perform public.qa_refresh_city_seo_status(old.city);
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists qa_places_refresh_city on public.places;
create trigger qa_places_refresh_city
after insert or delete or update of city, seo_indexable, seo_quality_status
on public.places
for each row execute function public.qa_places_refresh_city();

alter table public.qa_cities enable row level security;

drop policy if exists qa_cities_public_read on public.qa_cities;
create policy qa_cities_public_read on public.qa_cities
for select to anon, authenticated
using (status = 'published');

drop policy if exists qa_cities_admin_insert on public.qa_cities;
create policy qa_cities_admin_insert on public.qa_cities
for insert to authenticated with check (public.qa_is_admin());

drop policy if exists qa_cities_admin_update on public.qa_cities;
create policy qa_cities_admin_update on public.qa_cities
for update to authenticated using (public.qa_is_admin()) with check (public.qa_is_admin());

drop policy if exists qa_cities_admin_delete on public.qa_cities;
create policy qa_cities_admin_delete on public.qa_cities
for delete to authenticated using (public.qa_is_admin());

grant select on public.qa_cities to anon, authenticated;
grant insert, update, delete on public.qa_cities to authenticated;
grant execute on function public.qa_city_slug(text) to anon, authenticated;
grant execute on function public.qa_refresh_city_seo_status(text) to authenticated;

commit;

notify pgrst, 'reload schema';
