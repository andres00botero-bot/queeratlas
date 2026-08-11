-- Queer Atlas first-party traffic analytics v2
-- Prerequisite: public.qa_is_admin() from core-rls-hardening.sql.
-- Safe to run more than once in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.qa_traffic_pageviews (
  event_id uuid primary key,
  occurred_at timestamptz not null default now(),
  route text not null,
  city text,
  visitor_id uuid not null,
  session_id uuid not null,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_type text not null default 'unknown',
  country_code text,
  region_code text,
  browser_language text,
  created_at timestamptz not null default now(),
  constraint qa_traffic_pageviews_route_check
    check (route like '/%' and char_length(route) between 1 and 500),
  constraint qa_traffic_pageviews_device_check
    check (device_type in ('desktop', 'mobile', 'tablet', 'unknown')),
  constraint qa_traffic_pageviews_country_check
    check (country_code is null or country_code ~ '^[A-Z]{2}$')
);

create index if not exists qa_traffic_pageviews_occurred_idx
  on public.qa_traffic_pageviews (occurred_at desc);
create index if not exists qa_traffic_pageviews_visitor_idx
  on public.qa_traffic_pageviews (visitor_id, occurred_at desc);
create index if not exists qa_traffic_pageviews_session_idx
  on public.qa_traffic_pageviews (session_id, occurred_at desc);
create index if not exists qa_traffic_pageviews_route_idx
  on public.qa_traffic_pageviews (route, occurred_at desc);
create index if not exists qa_traffic_pageviews_city_idx
  on public.qa_traffic_pageviews (city, occurred_at desc)
  where city is not null;

alter table public.qa_traffic_pageviews enable row level security;
revoke all on table public.qa_traffic_pageviews from anon, authenticated;

create or replace function public.qa_record_page_view(
  p_event_id uuid,
  p_route text,
  p_city text default null,
  p_visitor_id uuid default null,
  p_session_id uuid default null,
  p_referrer_host text default null,
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null,
  p_device_type text default 'unknown',
  p_country_code text default null,
  p_region_code text default null,
  p_browser_language text default null
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  normalized_route text := left(trim(coalesce(p_route, '')), 500);
  normalized_device text := lower(trim(coalesce(p_device_type, 'unknown')));
  inserted_count integer := 0;
begin
  if p_event_id is null or p_visitor_id is null or p_session_id is null then
    return false;
  end if;

  if normalized_route = '' or normalized_route not like '/%' then
    return false;
  end if;

  if normalized_route ~ '^/(admin|api|contribute|favorites|messages)(/|$)'
     or normalized_route ~ '^/(_next|monitoring|icons)(/|$)'
     or normalized_route ~ '^/(robots\.txt|manifest\.webmanifest|favicon\.ico|sitemap[^/]*\.xml)$' then
    return false;
  end if;

  if normalized_device not in ('desktop', 'mobile', 'tablet', 'unknown') then
    normalized_device := 'unknown';
  end if;

  insert into public.qa_traffic_pageviews (
    event_id,
    route,
    city,
    visitor_id,
    session_id,
    referrer_host,
    utm_source,
    utm_medium,
    utm_campaign,
    device_type,
    country_code,
    region_code,
    browser_language
  ) values (
    p_event_id,
    normalized_route,
    nullif(left(trim(coalesce(p_city, '')), 100), ''),
    p_visitor_id,
    p_session_id,
    nullif(left(lower(trim(coalesce(p_referrer_host, ''))), 160), ''),
    nullif(left(trim(coalesce(p_utm_source, '')), 160), ''),
    nullif(left(trim(coalesce(p_utm_medium, '')), 160), ''),
    nullif(left(trim(coalesce(p_utm_campaign, '')), 200), ''),
    normalized_device,
    case
      when upper(trim(coalesce(p_country_code, ''))) ~ '^[A-Z]{2}$'
        then upper(trim(p_country_code))
      else null
    end,
    nullif(left(trim(coalesce(p_region_code, '')), 100), ''),
    nullif(left(trim(coalesce(p_browser_language, '')), 40), '')
  )
  on conflict (event_id) do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count = 1;
end;
$$;

revoke all on function public.qa_record_page_view(
  uuid, text, text, uuid, uuid, text, text, text, text, text, text, text, text
) from public;
grant execute on function public.qa_record_page_view(
  uuid, text, text, uuid, uuid, text, text, text, text, text, text, text, text
) to anon, authenticated;

create or replace function public.qa_admin_traffic_summary(p_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  safe_days integer := greatest(1, least(coalesce(p_days, 30), 90));
  range_start timestamptz;
  previous_start timestamptz;
  result jsonb;
begin
  if not public.qa_is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  range_start := date_trunc('day', now() at time zone 'UTC') at time zone 'UTC'
    - make_interval(days => safe_days - 1);
  previous_start := range_start - make_interval(days => safe_days);

  with
  current_rows as (
    select *
    from public.qa_traffic_pageviews
    where occurred_at >= range_start
  ),
  previous_rows as (
    select *
    from public.qa_traffic_pageviews
    where occurred_at >= previous_start and occurred_at < range_start
  ),
  current_sessions as (
    select session_id, count(*)::integer as pageviews
    from current_rows
    group by session_id
  ),
  session_entries as (
    select distinct on (session_id)
      session_id,
      visitor_id,
      referrer_host,
      utm_source,
      occurred_at
    from current_rows
    order by session_id, occurred_at asc
  ),
  previous_sessions as (
    select session_id, count(*)::integer as pageviews
    from previous_rows
    group by session_id
  ),
  current_totals as (
    select
      count(*)::integer as pageviews,
      count(distinct visitor_id)::integer as visitors,
      count(distinct session_id)::integer as sessions,
      count(*) filter (where occurred_at >= date_trunc('day', now() at time zone 'UTC') at time zone 'UTC')::integer as today_pageviews,
      count(distinct visitor_id) filter (where occurred_at >= date_trunc('day', now() at time zone 'UTC') at time zone 'UTC')::integer as today_visitors,
      count(distinct visitor_id) filter (where occurred_at >= now() - interval '5 minutes')::integer as live_visitors
    from current_rows
  ),
  previous_totals as (
    select
      count(*)::integer as pageviews,
      count(distinct visitor_id)::integer as visitors,
      count(distinct session_id)::integer as sessions
    from previous_rows
  ),
  current_session_stats as (
    select
      coalesce(round(avg(pageviews)::numeric, 2), 0) as pages_per_session,
      coalesce(round(100.0 * count(*) filter (where pageviews = 1) / nullif(count(*), 0), 1), 0) as bounce_rate
    from current_sessions
  ),
  previous_session_stats as (
    select
      coalesce(round(avg(pageviews)::numeric, 2), 0) as pages_per_session,
      coalesce(round(100.0 * count(*) filter (where pageviews = 1) / nullif(count(*), 0), 1), 0) as bounce_rate
    from previous_sessions
  )
  select jsonb_build_object(
    'ok', true,
    'model', 'v2',
    'dataQuality', 'exact-first-party-events',
    'days', safe_days,
    'timezone', 'UTC',
    'generatedAt', now(),
    'coverage', jsonb_build_object(
      'firstEventAt', (select min(occurred_at) from public.qa_traffic_pageviews),
      'lastEventAt', (select max(occurred_at) from public.qa_traffic_pageviews),
      'storedPageviews', (select count(*) from public.qa_traffic_pageviews)
    ),
    'totals', jsonb_build_object(
      'pageviews', ct.pageviews,
      'visitors', ct.visitors,
      'sessions', ct.sessions,
      'todayPageviews', ct.today_pageviews,
      'todayVisitors', ct.today_visitors,
      'liveVisitors', ct.live_visitors,
      'pagesPerSession', css.pages_per_session,
      'bounceRate', css.bounce_rate,
      'previousPageviews', pt.pageviews,
      'previousVisitors', pt.visitors,
      'previousSessions', pt.sessions,
      'previousPagesPerSession', pss.pages_per_session,
      'previousBounceRate', pss.bounce_rate
    ),
    'daily', coalesce((
      select jsonb_agg(to_jsonb(day_row) order by day_row.day)
      from (
        select
          series.day::date as day,
          count(cr.event_id)::integer as pageviews,
          count(distinct cr.visitor_id)::integer as visitors,
          count(distinct cr.session_id)::integer as sessions
        from generate_series(
          range_start,
          date_trunc('day', now() at time zone 'UTC') at time zone 'UTC',
          interval '1 day'
        ) as series(day)
        left join current_rows cr
          on cr.occurred_at >= series.day and cr.occurred_at < series.day + interval '1 day'
        group by series.day
      ) day_row
    ), '[]'::jsonb),
    'topRoutes', coalesce((
      select jsonb_agg(to_jsonb(route_row) order by route_row.pageviews desc, route_row.route)
      from (
        select route, count(*)::integer as pageviews, count(distinct visitor_id)::integer as visitors
        from current_rows
        group by route
        order by pageviews desc, route
        limit 12
      ) route_row
    ), '[]'::jsonb),
    'topCities', coalesce((
      select jsonb_agg(to_jsonb(city_row) order by city_row.pageviews desc, city_row.city)
      from (
        select city, count(*)::integer as pageviews, count(distinct visitor_id)::integer as visitors
        from current_rows
        where city is not null and city <> ''
        group by city
        order by pageviews desc, city
        limit 10
      ) city_row
    ), '[]'::jsonb),
    'topReferrers', coalesce((
      select jsonb_agg(to_jsonb(referrer_row) order by referrer_row.sessions desc, referrer_row.referrer)
      from (
        select
          case
            when coalesce(referrer_host, '') = '' then 'Direct / unknown'
            when referrer_host = 'internal' then 'Internal navigation'
            else referrer_host
          end as referrer,
          count(*)::integer as sessions,
          count(distinct visitor_id)::integer as visitors
        from session_entries
        group by 1
        order by sessions desc, referrer
        limit 10
      ) referrer_row
    ), '[]'::jsonb),
    'topSources', coalesce((
      select jsonb_agg(to_jsonb(source_row) order by source_row.sessions desc, source_row.source)
      from (
        select
          coalesce(
            nullif(utm_source, ''),
            case
              when coalesce(referrer_host, '') = '' then 'direct'
              when referrer_host = 'internal' then 'internal'
              else referrer_host
            end
          ) as source,
          count(*)::integer as sessions,
          count(distinct visitor_id)::integer as visitors
        from session_entries
        group by 1
        order by sessions desc, source
        limit 10
      ) source_row
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_agg(to_jsonb(device_row) order by device_row.pageviews desc, device_row.device)
      from (
        select device_type as device, count(*)::integer as pageviews, count(distinct visitor_id)::integer as visitors
        from current_rows
        group by device_type
        order by pageviews desc, device
      ) device_row
    ), '[]'::jsonb),
    'countries', coalesce((
      select jsonb_agg(to_jsonb(country_row) order by country_row.pageviews desc, country_row.country)
      from (
        select coalesce(country_code, 'Unknown') as country, count(*)::integer as pageviews, count(distinct visitor_id)::integer as visitors
        from current_rows
        group by coalesce(country_code, 'Unknown')
        order by pageviews desc, country
        limit 10
      ) country_row
    ), '[]'::jsonb)
  ) into result
  from current_totals ct
  cross join previous_totals pt
  cross join current_session_stats css
  cross join previous_session_stats pss;

  return result;
end;
$$;

revoke all on function public.qa_admin_traffic_summary(integer) from public;
grant execute on function public.qa_admin_traffic_summary(integer) to authenticated;

comment on table public.qa_traffic_pageviews is
  'First-party pageview events. One deduplicated event per rendered route change; private/admin routes are rejected.';
comment on function public.qa_admin_traffic_summary(integer) is
  'Admin-only aggregated traffic dashboard data for 1-90 days.';
