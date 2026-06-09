-- Queer Atlas SEO telemetry (persistent web vitals + crawler daily counters)
-- Run in Supabase SQL editor.

create table if not exists public.qa_seo_web_vitals (
  id uuid primary key default gen_random_uuid(),
  metric_id text not null,
  metric_name text not null check (metric_name in ('LCP', 'INP', 'CLS', 'TTFB', 'FCP')),
  metric_value double precision not null check (metric_value >= 0),
  metric_rating text not null default '' check (metric_rating in ('', 'good', 'needs-improvement', 'poor')),
  route text not null default '/',
  href text not null default '',
  source text not null default 'web',
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists qa_seo_web_vitals_recorded_at_idx
  on public.qa_seo_web_vitals (recorded_at desc);

create index if not exists qa_seo_web_vitals_route_idx
  on public.qa_seo_web_vitals (route);

create index if not exists qa_seo_web_vitals_metric_idx
  on public.qa_seo_web_vitals (metric_name);

create unique index if not exists qa_seo_web_vitals_metric_id_unique_idx
  on public.qa_seo_web_vitals (metric_id)
  where metric_id <> '';

create table if not exists public.qa_seo_web_vitals_daily (
  day date not null,
  route text not null,
  metric_name text not null check (metric_name in ('LCP', 'INP', 'CLS', 'TTFB', 'FCP')),
  samples integer not null default 0 check (samples >= 0),
  p50 double precision,
  p75 double precision,
  p95 double precision,
  updated_at timestamptz not null default now(),
  primary key (day, route, metric_name)
);

create index if not exists qa_seo_web_vitals_daily_day_idx
  on public.qa_seo_web_vitals_daily (day desc);

create table if not exists public.qa_seo_crawler_hits_daily (
  day date not null,
  crawler_key text not null,
  path text not null,
  hits integer not null default 0 check (hits >= 0),
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (day, crawler_key, path)
);

create index if not exists qa_seo_crawler_hits_daily_day_idx
  on public.qa_seo_crawler_hits_daily (day desc);

create index if not exists qa_seo_crawler_hits_daily_crawler_idx
  on public.qa_seo_crawler_hits_daily (crawler_key);

create or replace function public.qa_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_qa_seo_web_vitals_daily_updated_at on public.qa_seo_web_vitals_daily;
create trigger trg_qa_seo_web_vitals_daily_updated_at
before update on public.qa_seo_web_vitals_daily
for each row
execute function public.qa_touch_updated_at();

drop trigger if exists trg_qa_seo_crawler_hits_daily_updated_at on public.qa_seo_crawler_hits_daily;
create trigger trg_qa_seo_crawler_hits_daily_updated_at
before update on public.qa_seo_crawler_hits_daily
for each row
execute function public.qa_touch_updated_at();

create or replace function public.qa_record_web_vital(
  p_metric_id text,
  p_metric_name text,
  p_metric_value double precision,
  p_metric_rating text default '',
  p_route text default '/',
  p_href text default '',
  p_recorded_at timestamptz default now(),
  p_source text default 'web'
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
  v_name text := upper(trim(coalesce(p_metric_name, '')));
  v_rating text := lower(trim(coalesce(p_metric_rating, '')));
  v_route text := left(coalesce(nullif(trim(p_route), ''), '/'), 512);
  v_href text := left(coalesce(p_href, ''), 1024);
  v_metric_id text := left(coalesce(p_metric_id, ''), 128);
  v_source text := left(coalesce(nullif(trim(p_source), ''), 'web'), 32);
  v_recorded_at timestamptz := coalesce(p_recorded_at, now());
  v_day date := (coalesce(p_recorded_at, now()) at time zone 'utc')::date;
begin
  if v_name not in ('LCP', 'INP', 'CLS', 'TTFB', 'FCP') then
    raise exception 'Invalid metric_name: %', v_name using errcode = '22023';
  end if;

  if v_rating not in ('', 'good', 'needs-improvement', 'poor') then
    v_rating := '';
  end if;

  if v_metric_id = '' then
    raise exception 'metric_id is required' using errcode = '22023';
  end if;

  if p_metric_value is null or p_metric_value < 0 or p_metric_value > (
    case v_name
      when 'CLS' then 10
      when 'INP' then 60000
      else 120000
    end
  ) then
    raise exception 'Invalid metric_value for %', v_name using errcode = '22023';
  end if;

  if v_recorded_at < now() - interval '1 day' or v_recorded_at > now() + interval '5 minutes' then
    v_recorded_at := now();
    v_day := (v_recorded_at at time zone 'utc')::date;
  end if;

  insert into public.qa_seo_web_vitals (
    metric_id, metric_name, metric_value, metric_rating, route, href, source, recorded_at
  ) values (
    v_metric_id, v_name, p_metric_value, v_rating, v_route, v_href, v_source, v_recorded_at
  )
  on conflict do nothing
  returning id into v_id;

  if v_id is null then
    select id
    into v_id
    from public.qa_seo_web_vitals
    where metric_id = v_metric_id
    limit 1;
    return v_id;
  end if;

  with stats as (
    select
      count(*)::int as samples,
      percentile_cont(0.5) within group (order by metric_value) as p50,
      percentile_cont(0.75) within group (order by metric_value) as p75,
      percentile_cont(0.95) within group (order by metric_value) as p95
    from public.qa_seo_web_vitals
    where metric_name = v_name
      and route = v_route
      and (recorded_at at time zone 'utc')::date = v_day
  )
  insert into public.qa_seo_web_vitals_daily (
    day, route, metric_name, samples, p50, p75, p95
  )
  select
    v_day,
    v_route,
    v_name,
    stats.samples,
    stats.p50,
    stats.p75,
    stats.p95
  from stats
  on conflict (day, route, metric_name) do update
  set
    samples = excluded.samples,
    p50 = excluded.p50,
    p75 = excluded.p75,
    p95 = excluded.p95,
    updated_at = now();

  return v_id;
end;
$$;

create or replace function public.qa_record_crawler_hit(
  p_crawler_key text,
  p_path text,
  p_seen_at timestamptz default now()
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_day date := (coalesce(p_seen_at, now()) at time zone 'utc')::date;
  v_crawler text := lower(left(coalesce(nullif(trim(p_crawler_key), ''), 'unknown'), 64));
  v_path text := left(coalesce(nullif(trim(p_path), ''), '/'), 512);
begin
  if v_crawler not in (
    'googlebot',
    'google-extended',
    'oai-searchbot',
    'gptbot',
    'chatgpt-user',
    'claude-searchbot',
    'claudebot',
    'claude-user',
    'perplexitybot',
    'bingbot',
    'duckassistbot'
  ) then
    raise exception 'Invalid crawler_key: %', v_crawler using errcode = '22023';
  end if;

  if p_seen_at < now() - interval '1 day' or p_seen_at > now() + interval '5 minutes' then
    p_seen_at := now();
    v_day := (p_seen_at at time zone 'utc')::date;
  end if;

  insert into public.qa_seo_crawler_hits_daily (
    day, crawler_key, path, hits, last_seen_at
  )
  values (
    v_day, v_crawler, v_path, 1, coalesce(p_seen_at, now())
  )
  on conflict (day, crawler_key, path) do update
  set
    hits = public.qa_seo_crawler_hits_daily.hits + 1,
    last_seen_at = excluded.last_seen_at,
    updated_at = now();
end;
$$;

revoke all on function public.qa_record_web_vital(text, text, double precision, text, text, text, timestamptz, text)
  from public, anon, authenticated;
revoke all on function public.qa_record_crawler_hit(text, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.qa_record_web_vital(text, text, double precision, text, text, text, timestamptz, text)
  to service_role;
grant execute on function public.qa_record_crawler_hit(text, text, timestamptz)
  to service_role;

alter table public.qa_seo_web_vitals enable row level security;
alter table public.qa_seo_web_vitals_daily enable row level security;
alter table public.qa_seo_crawler_hits_daily enable row level security;

drop policy if exists qa_seo_web_vitals_insert_public on public.qa_seo_web_vitals;

drop policy if exists qa_seo_web_vitals_select_admin on public.qa_seo_web_vitals;
create policy qa_seo_web_vitals_select_admin
on public.qa_seo_web_vitals
for select
to authenticated
using (public.qa_is_admin());

drop policy if exists qa_seo_web_vitals_daily_select_admin on public.qa_seo_web_vitals_daily;
create policy qa_seo_web_vitals_daily_select_admin
on public.qa_seo_web_vitals_daily
for select
to authenticated
using (public.qa_is_admin());

drop policy if exists qa_seo_crawler_hits_daily_select_admin on public.qa_seo_crawler_hits_daily;
create policy qa_seo_crawler_hits_daily_select_admin
on public.qa_seo_crawler_hits_daily
for select
to authenticated
using (public.qa_is_admin());

revoke all on table public.qa_seo_web_vitals from anon;
revoke all on table public.qa_seo_web_vitals_daily from anon;
revoke all on table public.qa_seo_crawler_hits_daily from anon;
revoke insert, update, delete on table public.qa_seo_web_vitals from authenticated;
revoke insert, update, delete on table public.qa_seo_web_vitals_daily from authenticated;
revoke insert, update, delete on table public.qa_seo_crawler_hits_daily from authenticated;
grant select on table public.qa_seo_web_vitals to authenticated;
grant select on table public.qa_seo_web_vitals_daily to authenticated;
grant select on table public.qa_seo_crawler_hits_daily to authenticated;
grant all on table public.qa_seo_web_vitals to service_role;
grant all on table public.qa_seo_web_vitals_daily to service_role;
grant all on table public.qa_seo_crawler_hits_daily to service_role;
