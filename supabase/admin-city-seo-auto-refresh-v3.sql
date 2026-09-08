-- Queer Atlas city registry · include services in automatic SEO promotion
-- Run once in Supabase SQL Editor after admin-city-seo-auto-refresh-v2.sql.
-- Safe to run again. Recalculates every registered city immediately.

begin;

create or replace function public.qa_service_qualifies_for_city_index(service_row public.services)
returns boolean
language sql
stable
set search_path = public
as $$
  select
    nullif(btrim(service_row.name), '') is not null
    and nullif(btrim(service_row.city), '') is not null
    and nullif(btrim(service_row.type), '') is not null
    and char_length(btrim(coalesce(service_row.description, ''))) >= 90
    and btrim(coalesce(nullif(service_row.link, ''), service_row.booking_link, '')) ~* '^https?://'
    and (
      char_length(btrim(coalesce(service_row.location, ''))) >= 4
      or char_length(btrim(coalesce(service_row.provider_name, ''))) >= 2
      or (
        service_row.lat between -90 and 90
        and service_row.lng between -180 and 180
      )
    )
    and coalesce(service_row.seo_indexable, true) = true
    and lower(coalesce(service_row.seo_quality_status, 'pending')) not in ('hold', 'rejected', 'blocked', 'draft')
    and jsonb_typeof(coalesce(service_row.service_intel, '{}'::jsonb)) = 'object'
    and char_length(btrim(coalesce(service_row.service_intel ->> 'booking_lead_time', service_row.service_intel ->> 'bookingLeadTime', ''))) >= 24
    and char_length(btrim(coalesce(service_row.service_intel ->> 'best_time', service_row.service_intel ->> 'bestTime', ''))) >= 24
    and char_length(btrim(coalesce(service_row.service_intel ->> 'client_mix', service_row.service_intel ->> 'clientMix', ''))) >= 24
    and char_length(btrim(coalesce(service_row.service_intel ->> 'preparation', ''))) >= 24
    and char_length(btrim(coalesce(service_row.service_intel ->> 'provider_inclusivity', service_row.service_intel ->> 'providerInclusivity', ''))) >= 24;
$$;

create or replace function public.qa_event_qualifies_for_city_index(event_row public.events)
returns boolean
language sql
stable
set search_path = public
as $$
  select
    nullif(btrim(event_row.name), '') is not null
    and nullif(btrim(event_row.city), '') is not null
    and char_length(btrim(coalesce(event_row.description, ''))) >= 80
    and btrim(coalesce(nullif(event_row.link, ''), event_row.ticket_url, '')) ~* '^https?://'
    and (
      char_length(btrim(coalesce(event_row.location, ''))) >= 4
      or (
        event_row.lat between -90 and 90
        and event_row.lng between -180 and 180
      )
    )
    and coalesce(nullif(event_row.start_date::text, ''), nullif(event_row.date::text, '')) is not null
    and coalesce(event_row.seo_indexable, true) = true
    and lower(coalesce(event_row.seo_quality_status, 'pending')) not in ('hold', 'rejected', 'blocked', 'draft')
    and jsonb_typeof(coalesce(event_row.event_intel, '{}'::jsonb)) = 'object'
    and char_length(btrim(coalesce(event_row.event_intel ->> 'entry_wait', event_row.event_intel ->> 'entryWait', ''))) >= 24
    and char_length(btrim(coalesce(event_row.event_intel ->> 'best_arrival', event_row.event_intel ->> 'bestArrival', ''))) >= 24
    and char_length(btrim(coalesce(event_row.event_intel ->> 'crowd_mix', event_row.event_intel ->> 'crowdMix', ''))) >= 24
    and char_length(btrim(coalesce(event_row.event_intel ->> 'dress_code', event_row.event_intel ->> 'dressCode', ''))) >= 24
    and char_length(btrim(coalesce(event_row.event_intel ->> 'host_inclusivity', event_row.event_intel ->> 'hostInclusivity', ''))) >= 24;
$$;

create or replace function public.qa_refresh_city_seo_status(target_slug text)
returns public.qa_cities
language plpgsql
security definer
set search_path = public
as $$
declare
  city_row public.qa_cities;
  qualified_place_count integer := 0;
  qualified_event_count integer := 0;
  qualified_service_count integer := 0;
  qualified_count integer := 0;
  has_identity boolean;
  has_map boolean;
  has_intro boolean;
  has_hero boolean;
  has_guide boolean;
  has_safety boolean;
  has_qari boolean;
  ready boolean;
begin
  select * into city_row
  from public.qa_cities
  where slug = public.qa_city_slug(target_slug)
  for update;

  if not found then return null; end if;

  select count(*)::integer into qualified_place_count
  from public.places p
  where public.qa_city_slug(p.city) = city_row.slug
    and public.qa_place_qualifies_for_city_index(p);

  select count(*)::integer into qualified_service_count
  from public.services s
  where public.qa_city_slug(s.city) = city_row.slug
    and public.qa_service_qualifies_for_city_index(s);

  select count(*)::integer into qualified_event_count
  from public.events e
  where public.qa_city_slug(e.city) = city_row.slug
    and public.qa_event_qualifies_for_city_index(e);

  qualified_count := qualified_place_count + qualified_event_count + qualified_service_count;

  has_identity := nullif(btrim(city_row.name), '') is not null
    and nullif(btrim(city_row.country), '') is not null
    and city_row.country_code ~ '^[A-Z]{2}$';
  has_map := city_row.map_confirmed
    and city_row.latitude between -90 and 90
    and city_row.longitude between -180 and 180;
  has_intro := char_length(btrim(city_row.introduction)) >= 120;
  has_hero := char_length(btrim(coalesce(city_row.local_mood, ''))) >= 30
    and char_length(btrim(coalesce(city_row.queer_status, ''))) >= 30
    and char_length(btrim(coalesce(city_row.crowd_profile, ''))) >= 30;
  has_guide := false;
  if jsonb_typeof(city_row.guide_items) = 'array'
    and jsonb_array_length(city_row.guide_items) >= 5
    and jsonb_typeof(city_row.guide_sources) = 'array'
    and jsonb_array_length(city_row.guide_sources) >= 2
    and city_row.guide_checked_at is not null then
    select not exists (
      select 1
      from jsonb_array_elements(city_row.guide_items) item
      where char_length(btrim(coalesce(item ->> 'title', ''))) < 2
        or char_length(btrim(coalesce(item ->> 'text', ''))) < 80
    ) into has_guide;
  end if;
  has_safety := char_length(btrim(city_row.safety_context)) >= 80;
  has_qari := nullif(btrim(city_row.qari_destination_key), '') is not null
    and char_length(btrim(city_row.qari_summary)) >= 40;
  ready := city_row.status = 'published'
    and qualified_count >= 3
    and has_identity and has_map and has_intro and has_hero and has_guide and has_safety and has_qari;

  update public.qa_cities
  set verified_place_count = qualified_count,
      seo_indexable = ready,
      seo_requirements = jsonb_build_object(
        'published', status = 'published',
        'identity', has_identity,
        'mapConfirmed', has_map,
        'introduction', has_intro,
        'cityHero', has_hero,
        'essentialGuide', has_guide,
        'safetyContext', has_safety,
        'qariProfile', has_qari,
        'verifiedPlaces', qualified_count,
        'qualifiedVenues', qualified_place_count,
        'qualifiedEvents', qualified_event_count,
        'qualifiedServices', qualified_service_count,
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

drop trigger if exists qa_services_refresh_city on public.services;
create trigger qa_services_refresh_city
after insert or delete or update of city, name, type, provider_name, description, link, booking_link, location, lat, lng, service_intel, verified, seo_indexable, seo_quality_status
on public.services
for each row execute function public.qa_places_refresh_city();

drop trigger if exists qa_events_refresh_city on public.events;
create trigger qa_events_refresh_city
after insert or delete or update of city, name, description, link, ticket_url, location, lat, lng, date, start_date, end_date, event_intel, seo_indexable, seo_quality_status
on public.events
for each row execute function public.qa_places_refresh_city();

do $$
declare
  city_record record;
begin
  for city_record in select slug from public.qa_cities loop
    perform public.qa_refresh_city_seo_status(city_record.slug);
  end loop;
end;
$$;

grant execute on function public.qa_service_qualifies_for_city_index(public.services) to authenticated;
grant execute on function public.qa_event_qualifies_for_city_index(public.events) to authenticated;
grant execute on function public.qa_refresh_city_seo_status(text) to authenticated;

commit;

notify pgrst, 'reload schema';

select
  slug,
  name,
  verified_place_count,
  seo_indexable,
  seo_requirements
from public.qa_cities
where slug = 'odense';
