-- Queer Atlas SEO phase 1: accurate content timestamps and editorial index controls.
-- Safe to run more than once.

begin;

create or replace function public.qa_touch_search_entity_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

alter table if exists public.places
  add column if not exists updated_at timestamptz,
  add column if not exists seo_indexable boolean,
  add column if not exists seo_quality_status text not null default 'pending';

alter table if exists public.events
  add column if not exists updated_at timestamptz,
  add column if not exists seo_indexable boolean,
  add column if not exists seo_quality_status text not null default 'pending';

alter table if exists public.services
  add column if not exists updated_at timestamptz,
  add column if not exists seo_indexable boolean,
  add column if not exists seo_quality_status text not null default 'pending';

alter table if exists public.places drop constraint if exists places_seo_quality_status_check;
alter table if exists public.places
  add constraint places_seo_quality_status_check
  check (seo_quality_status = any (array['pending', 'approved', 'hold', 'rejected']::text[]));

alter table if exists public.events drop constraint if exists events_seo_quality_status_check;
alter table if exists public.events
  add constraint events_seo_quality_status_check
  check (seo_quality_status = any (array['pending', 'approved', 'hold', 'rejected']::text[]));

alter table if exists public.services drop constraint if exists services_seo_quality_status_check;
alter table if exists public.services
  add constraint services_seo_quality_status_check
  check (seo_quality_status = any (array['pending', 'approved', 'hold', 'rejected']::text[]));

do $$
begin
  if to_regclass('public.places') is not null then
    update public.places p
    set updated_at = coalesce(
      p.updated_at,
      nullif(to_jsonb(p) ->> 'lastChecked', '')::timestamptz,
      nullif(to_jsonb(p) ->> 'last_checked', '')::timestamptz,
      nullif(to_jsonb(p) ->> 'created_at', '')::timestamptz,
      timezone('utc', now())
    )
    where p.updated_at is null;
  end if;

  if to_regclass('public.events') is not null then
    update public.events e
    set updated_at = coalesce(
      e.updated_at,
      nullif(to_jsonb(e) ->> 'lastChecked', '')::timestamptz,
      nullif(to_jsonb(e) ->> 'last_checked', '')::timestamptz,
      nullif(to_jsonb(e) ->> 'created_at', '')::timestamptz,
      timezone('utc', now())
    )
    where e.updated_at is null;
  end if;

  if to_regclass('public.services') is not null then
    update public.services s
    set updated_at = coalesce(
      s.updated_at,
      nullif(to_jsonb(s) ->> 'lastChecked', '')::timestamptz,
      nullif(to_jsonb(s) ->> 'last_checked', '')::timestamptz,
      nullif(to_jsonb(s) ->> 'created_at', '')::timestamptz,
      timezone('utc', now())
    )
    where s.updated_at is null;
  end if;
end;
$$;

drop trigger if exists qa_places_touch_search_updated_at on public.places;
create trigger qa_places_touch_search_updated_at
before update on public.places
for each row execute function public.qa_touch_search_entity_updated_at();

drop trigger if exists qa_events_touch_search_updated_at on public.events;
create trigger qa_events_touch_search_updated_at
before update on public.events
for each row execute function public.qa_touch_search_entity_updated_at();

drop trigger if exists qa_services_touch_search_updated_at on public.services;
create trigger qa_services_touch_search_updated_at
before update on public.services
for each row execute function public.qa_touch_search_entity_updated_at();

create index if not exists places_seo_indexable_idx
  on public.places (seo_indexable, seo_quality_status, updated_at desc);
create index if not exists events_seo_indexable_idx
  on public.events (seo_indexable, seo_quality_status, updated_at desc);
create index if not exists services_seo_indexable_idx
  on public.services (seo_indexable, seo_quality_status, updated_at desc);

comment on column public.places.seo_indexable is 'Optional editorial override. False blocks indexing; true still requires the application quality baseline.';
comment on column public.events.seo_indexable is 'Optional editorial override. False blocks indexing; true still requires the application quality baseline.';
comment on column public.services.seo_indexable is 'Optional editorial override. False blocks indexing; true still requires the application quality baseline.';

commit;
