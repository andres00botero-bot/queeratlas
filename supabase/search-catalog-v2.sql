begin;

create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;
set local search_path = public, extensions;

create index if not exists qa_places_city_type_idx
  on public.places (city, type);
create index if not exists qa_places_name_trgm_idx
  on public.places using gin (lower(name) gin_trgm_ops);
create index if not exists qa_places_search_fts_idx
  on public.places using gin ((
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(city, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(type, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(vibe, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(location, '')), 'D')
  ));

create index if not exists qa_events_city_date_idx
  on public.events (city, date);
create index if not exists qa_events_name_trgm_idx
  on public.events using gin (lower(name) gin_trgm_ops);
create index if not exists qa_events_search_fts_idx
  on public.events using gin ((
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(city, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(vibe, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(location, '')), 'D')
  ));

create index if not exists qa_services_city_type_idx
  on public.services (city, type);
create index if not exists qa_services_name_trgm_idx
  on public.services using gin (lower(name) gin_trgm_ops);
create index if not exists qa_services_search_fts_idx
  on public.services using gin ((
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(city, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(type, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(provider_name, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(vibe, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(location, '')), 'D')
  ));

create or replace function public.qa_search_catalog_v2(
  search_text text,
  city_filter text default null,
  entity_filter text default null,
  place_types text[] default null,
  result_limit integer default 100,
  result_offset integer default 0
)
returns table (
  entity_type text,
  entity jsonb,
  search_rank real
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with search_input as (
    select
      nullif(trim(search_text), '') as query_text,
      websearch_to_tsquery('simple', coalesce(nullif(trim(search_text), ''), '')) as query_value,
      nullif(replace(replace(lower(trim(city_filter)), '-', ' '), '_', ' '), '') as city_value,
      nullif(lower(trim(entity_filter)), '') as entity_value,
      case when coalesce(array_length(place_types, 1), 0) > 0 then place_types else null end as venue_types,
      greatest(1, least(coalesce(result_limit, 100), 5000)) as safe_limit,
      greatest(0, coalesce(result_offset, 0)) as safe_offset
  ),
  place_matches as (
    select
      'place'::text as entity_type,
      to_jsonb(p) as entity,
      (
        case when lower(p.name) = lower(i.query_text) then 12 else 0 end +
        case when i.venue_types is not null and p.type = any(i.venue_types) then 8 else 0 end +
        ts_rank(
          setweight(to_tsvector('simple', coalesce(p.name, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(p.city, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(p.type, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(p.vibe, '')), 'B') ||
          setweight(to_tsvector('simple', coalesce(p.description, '')), 'C') ||
          setweight(to_tsvector('simple', coalesce(p.location, '')), 'D'),
          i.query_value,
          32
        ) * 10 +
        similarity(lower(p.name), lower(i.query_text)) * 4
      )::real as search_rank
    from public.places p
    cross join search_input i
    where (i.entity_value is null or i.entity_value = 'place')
      and coalesce(p.seo_indexable, true)
      and coalesce(p.seo_quality_status, '') not in ('blocked', 'rejected', 'noindex')
      and (
        i.city_value is null or
        replace(replace(lower(p.city), '-', ' '), '_', ' ') = i.city_value
      )
      and (i.venue_types is null or p.type = any(i.venue_types))
      and (
        (i.city_value is not null and i.venue_types is not null) or
        (
          setweight(to_tsvector('simple', coalesce(p.name, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(p.city, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(p.type, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(p.vibe, '')), 'B') ||
          setweight(to_tsvector('simple', coalesce(p.description, '')), 'C') ||
          setweight(to_tsvector('simple', coalesce(p.location, '')), 'D')
        ) @@ i.query_value or
        similarity(lower(p.name), lower(i.query_text)) >= 0.24
      )
  ),
  event_matches as (
    select
      'event'::text as entity_type,
      to_jsonb(e) as entity,
      (
        case when lower(e.name) = lower(i.query_text) then 12 else 0 end +
        ts_rank(
          setweight(to_tsvector('simple', coalesce(e.name, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(e.city, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(e.vibe, '')), 'B') ||
          setweight(to_tsvector('simple', coalesce(e.description, '')), 'C') ||
          setweight(to_tsvector('simple', coalesce(e.location, '')), 'D'),
          i.query_value,
          32
        ) * 10 +
        similarity(lower(e.name), lower(i.query_text)) * 4
      )::real as search_rank
    from public.events e
    cross join search_input i
    where (i.entity_value is null or i.entity_value = 'event')
      and coalesce(e.seo_indexable, true)
      and coalesce(e.seo_quality_status, '') not in ('blocked', 'rejected', 'noindex')
      and coalesce(e.end_date, e.start_date, e.date) >= current_date
      and (
        i.city_value is null or
        replace(replace(lower(e.city), '-', ' '), '_', ' ') = i.city_value
      )
      and (
        (
          setweight(to_tsvector('simple', coalesce(e.name, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(e.city, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(e.vibe, '')), 'B') ||
          setweight(to_tsvector('simple', coalesce(e.description, '')), 'C') ||
          setweight(to_tsvector('simple', coalesce(e.location, '')), 'D')
        ) @@ i.query_value or
        similarity(lower(e.name), lower(i.query_text)) >= 0.24
      )
  ),
  service_matches as (
    select
      'service'::text as entity_type,
      to_jsonb(s) as entity,
      (
        case when lower(s.name) = lower(i.query_text) then 12 else 0 end +
        ts_rank(
          setweight(to_tsvector('simple', coalesce(s.name, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(s.city, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(s.type, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(s.provider_name, '')), 'B') ||
          setweight(to_tsvector('simple', coalesce(s.vibe, '')), 'B') ||
          setweight(to_tsvector('simple', coalesce(s.description, '')), 'C') ||
          setweight(to_tsvector('simple', coalesce(s.location, '')), 'D'),
          i.query_value,
          32
        ) * 10 +
        similarity(lower(s.name), lower(i.query_text)) * 4
      )::real as search_rank
    from public.services s
    cross join search_input i
    where (i.entity_value is null or i.entity_value = 'service')
      and coalesce(s.seo_indexable, true)
      and coalesce(s.seo_quality_status, '') not in ('blocked', 'rejected', 'noindex')
      and (
        i.city_value is null or
        replace(replace(lower(s.city), '-', ' '), '_', ' ') = i.city_value
      )
      and (
        (
          setweight(to_tsvector('simple', coalesce(s.name, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(s.city, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(s.type, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(s.provider_name, '')), 'B') ||
          setweight(to_tsvector('simple', coalesce(s.vibe, '')), 'B') ||
          setweight(to_tsvector('simple', coalesce(s.description, '')), 'C') ||
          setweight(to_tsvector('simple', coalesce(s.location, '')), 'D')
        ) @@ i.query_value or
        similarity(lower(s.name), lower(i.query_text)) >= 0.24
      )
  ),
  combined as (
    select * from place_matches
    union all
    select * from event_matches
    union all
    select * from service_matches
  )
  select c.entity_type, c.entity, c.search_rank
  from combined c
  cross join search_input i
  order by c.search_rank desc, lower(c.entity ->> 'name') asc
  limit (select safe_limit from search_input)
  offset (select safe_offset from search_input);
$$;

revoke all on function public.qa_search_catalog_v2(text, text, text, text[], integer, integer) from public;
grant execute on function public.qa_search_catalog_v2(text, text, text, text[], integer, integer)
  to anon, authenticated;

commit;
