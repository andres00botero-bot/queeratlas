-- Queer Atlas: vibe_tags backfill for existing rows.
-- Run after supabase/vibe-tags-v1.sql.
-- Safe to run multiple times.

create or replace function public.qa_push_vibe_tag(
  current_tags text[],
  candidate text,
  max_count integer default 3
)
returns text[]
language plpgsql
immutable
as $$
declare
  tags text[] := coalesce(current_tags, '{}'::text[]);
  value text := lower(trim(coalesce(candidate, '')));
begin
  if value = '' then
    return tags;
  end if;

  if value = any(tags) then
    return tags;
  end if;

  if coalesce(cardinality(tags), 0) >= greatest(max_count, 1) then
    return tags;
  end if;

  return array_append(tags, value);
end;
$$;

create or replace function public.qa_infer_vibe_tags(
  input_text text,
  fallback_kind text default null
)
returns text[]
language plpgsql
immutable
as $$
declare
  normalized text := lower(
    regexp_replace(
      regexp_replace(coalesce(input_text, ''), '[_-]+', ' ', 'g'),
      '\s+',
      ' ',
      'g'
    )
  );
  token text;
  tags text[] := '{}'::text[];
  kind text := lower(trim(coalesce(fallback_kind, '')));
begin
  -- Alias-driven normalization from explicit tokens.
  for token in
    select trim(value)
    from regexp_split_to_table(normalized, '[|,;/]+') as value
  loop
    if token = '' then
      continue;
    end if;

    case token
      when 'techno' then tags := public.qa_push_vibe_tag(tags, 'techno');
      when 'electro' then tags := public.qa_push_vibe_tag(tags, 'electronic');
      when 'electronic' then tags := public.qa_push_vibe_tag(tags, 'electronic');
      when 'edm' then tags := public.qa_push_vibe_tag(tags, 'electronic');
      when 'house' then tags := public.qa_push_vibe_tag(tags, 'electronic');
      when 'pop' then tags := public.qa_push_vibe_tag(tags, 'pop');
      when 'mainstream' then tags := public.qa_push_vibe_tag(tags, 'pop');
      when 'mixed' then tags := public.qa_push_vibe_tag(tags, 'mixed');
      when 'open format' then tags := public.qa_push_vibe_tag(tags, 'mixed');
      when 'men only' then tags := public.qa_push_vibe_tag(tags, 'men_only');
      when 'men-only' then tags := public.qa_push_vibe_tag(tags, 'men_only');
      when 'male only' then tags := public.qa_push_vibe_tag(tags, 'men_only');
      when 'after' then tags := public.qa_push_vibe_tag(tags, 'after');
      when 'afterhours' then tags := public.qa_push_vibe_tag(tags, 'after');
      when 'after hours' then tags := public.qa_push_vibe_tag(tags, 'after');
      when 'day party' then tags := public.qa_push_vibe_tag(tags, 'after');
      when 'dagsfester' then tags := public.qa_push_vibe_tag(tags, 'after');
      when 'chill' then tags := public.qa_push_vibe_tag(tags, 'chill');
      when 'chilled' then tags := public.qa_push_vibe_tag(tags, 'chill');
      when 'cultural' then tags := public.qa_push_vibe_tag(tags, 'cultural');
      when 'culture' then tags := public.qa_push_vibe_tag(tags, 'cultural');
      when 'fetish' then tags := public.qa_push_vibe_tag(tags, 'fetish');
      when 'kink' then tags := public.qa_push_vibe_tag(tags, 'fetish');
      when 'social' then tags := public.qa_push_vibe_tag(tags, 'social');
      when 'cozy' then tags := public.qa_push_vibe_tag(tags, 'cozy');
      when 'cosy' then tags := public.qa_push_vibe_tag(tags, 'cozy');
      when 'massive' then tags := public.qa_push_vibe_tag(tags, 'massive');
      when 'big room' then tags := public.qa_push_vibe_tag(tags, 'massive');
      when 'luxury' then tags := public.qa_push_vibe_tag(tags, 'luxury');
      when 'premium' then tags := public.qa_push_vibe_tag(tags, 'luxury');
      when 'festival' then tags := public.qa_push_vibe_tag(tags, 'festival');
      when 'fest' then tags := public.qa_push_vibe_tag(tags, 'festival');
      when 'underground' then tags := public.qa_push_vibe_tag(tags, 'underground');
      when 'raw' then tags := public.qa_push_vibe_tag(tags, 'underground');
      when 'cruise' then tags := public.qa_push_vibe_tag(tags, 'cruise');
      when 'cruising' then tags := public.qa_push_vibe_tag(tags, 'cruise');
      when 'men-only cruise' then tags := public.qa_push_vibe_tag(tags, 'cruise');
      when 'relax' then tags := public.qa_push_vibe_tag(tags, 'relax');
      when 'relaxed' then tags := public.qa_push_vibe_tag(tags, 'relax');
      when 'sauna' then tags := public.qa_push_vibe_tag(tags, 'relax');
      when 'drag' then tags := public.qa_push_vibe_tag(tags, 'drag');
      when 'industrial' then tags := public.qa_push_vibe_tag(tags, 'industrial');
      when 'warehouse' then tags := public.qa_push_vibe_tag(tags, 'industrial');
      when 'service' then tags := public.qa_push_vibe_tag(tags, 'service');
      when 'services' then tags := public.qa_push_vibe_tag(tags, 'service');
      when 'massage' then tags := public.qa_push_vibe_tag(tags, 'service');
      when 'tour' then tags := public.qa_push_vibe_tag(tags, 'service');
      when 'concierge' then tags := public.qa_push_vibe_tag(tags, 'service');
      else null;
    end case;
  end loop;

  -- Keyword inference from free text.
  if coalesce(cardinality(tags), 0) < 3 and (normalized like '%drag%' or normalized like '%cabaret%' or normalized like '%queen%') then
    tags := public.qa_push_vibe_tag(tags, 'drag');
  end if;
  if coalesce(cardinality(tags), 0) < 3 and (normalized like '%fetish%' or normalized like '%leather%' or normalized like '%gear%' or normalized like '%kink%') then
    tags := public.qa_push_vibe_tag(tags, 'fetish');
  end if;
  if coalesce(cardinality(tags), 0) < 3 and (normalized like '%cruise%' or normalized like '%cruising%' or normalized like '%darkroom%') then
    tags := public.qa_push_vibe_tag(tags, 'cruise');
  end if;
  if coalesce(cardinality(tags), 0) < 3 and (normalized like '%sauna%' or normalized like '%steam%' or normalized like '%spa%' or normalized like '%wellness%' or normalized like '%relax%') then
    tags := public.qa_push_vibe_tag(tags, 'relax');
  end if;
  if coalesce(cardinality(tags), 0) < 3 and normalized like '%techno%' then
    tags := public.qa_push_vibe_tag(tags, 'techno');
  end if;
  if coalesce(cardinality(tags), 0) < 3 and (normalized like '%electronic%' or normalized like '%electro%' or normalized like '%edm%' or normalized like '%house%') then
    tags := public.qa_push_vibe_tag(tags, 'electronic');
  end if;
  if coalesce(cardinality(tags), 0) < 3 and (normalized like '%pop%' or normalized like '%mainstream%') then
    tags := public.qa_push_vibe_tag(tags, 'pop');
  end if;
  if coalesce(cardinality(tags), 0) < 3 and (normalized like '%after%' or normalized like '%afterhours%' or normalized like '%day party%' or normalized like '%dagsfester%') then
    tags := public.qa_push_vibe_tag(tags, 'after');
  end if;
  if coalesce(cardinality(tags), 0) < 3 and (normalized like '%industrial%' or normalized like '%warehouse%') then
    tags := public.qa_push_vibe_tag(tags, 'industrial');
  end if;
  if coalesce(cardinality(tags), 0) < 3 and (normalized like '%underground%' or normalized like '%renegade%' or normalized like '%raw%') then
    tags := public.qa_push_vibe_tag(tags, 'underground');
  end if;
  if coalesce(cardinality(tags), 0) < 3 and (normalized like '%massive%' or normalized like '%superclub%' or normalized like '%large-scale%' or normalized like '%big room%') then
    tags := public.qa_push_vibe_tag(tags, 'massive');
  end if;
  if coalesce(cardinality(tags), 0) < 3 and (normalized like '%luxury%' or normalized like '%premium%' or normalized like '%upscale%') then
    tags := public.qa_push_vibe_tag(tags, 'luxury');
  end if;
  if coalesce(cardinality(tags), 0) < 3 and (normalized like '%festival%' or normalized like '%pride%') then
    tags := public.qa_push_vibe_tag(tags, 'festival');
  end if;
  if coalesce(cardinality(tags), 0) < 3 and (normalized like '%cozy%' or normalized like '%cosy%' or normalized like '%intimate%') then
    tags := public.qa_push_vibe_tag(tags, 'cozy');
  end if;
  if coalesce(cardinality(tags), 0) < 3 and (normalized like '%social%' or normalized like '%community%' or normalized like '%meetup%' or normalized like '%conversation%') then
    tags := public.qa_push_vibe_tag(tags, 'social');
  end if;
  if coalesce(cardinality(tags), 0) < 3 and (normalized like '%culture%' or normalized like '%cultural%' or normalized like '%arts%' or normalized like '%screening%') then
    tags := public.qa_push_vibe_tag(tags, 'cultural');
  end if;
  if coalesce(cardinality(tags), 0) < 3 and (normalized like '%chill%' or normalized like '%laid back%' or normalized like '%calm%' or normalized like '%soft%') then
    tags := public.qa_push_vibe_tag(tags, 'chill');
  end if;
  if coalesce(cardinality(tags), 0) < 3 and (normalized like '%service%' or normalized like '%massage%' or normalized like '%tour%' or normalized like '%concierge%' or normalized like '%provider%') then
    tags := public.qa_push_vibe_tag(tags, 'service');
  end if;

  -- Type fallback for places and generic fallback for all entities.
  if coalesce(cardinality(tags), 0) = 0 then
    if kind in ('sauna', 'spa') then
      tags := array['relax'];
    elsif kind in ('cruise_club', 'cruising_area') then
      tags := array['cruise'];
    elsif kind in ('cafe', 'restaurant') then
      tags := array['social'];
    else
      tags := array['mixed'];
    end if;
  end if;

  return tags[1:3];
end;
$$;

with candidates as (
  select
    p.id,
    public.qa_infer_vibe_tags(
      concat_ws(' ', coalesce(p.vibe, ''), coalesce(p.description, ''), coalesce(p.name, '')),
      p.type
    ) as inferred_tags
  from public.places p
  where coalesce(cardinality(p.vibe_tags), 0) = 0
)
update public.places p
set
  vibe_tags = c.inferred_tags,
  vibe = coalesce(
    nullif(trim(coalesce(p.vibe, '')), ''),
    initcap(replace(c.inferred_tags[1], '_', '-'))
  )
from candidates c
where p.id = c.id;

with candidates as (
  select
    e.id,
    public.qa_infer_vibe_tags(
      concat_ws(' ', coalesce(e.vibe, ''), coalesce(e.description, ''), coalesce(e.name, ''), coalesce(e.location, '')),
      null
    ) as inferred_tags
  from public.events e
  where coalesce(cardinality(e.vibe_tags), 0) = 0
)
update public.events e
set
  vibe_tags = c.inferred_tags,
  vibe = coalesce(
    nullif(trim(coalesce(e.vibe, '')), ''),
    initcap(replace(c.inferred_tags[1], '_', '-'))
  )
from candidates c
where e.id = c.id;

with candidates as (
  select
    g.id,
    public.qa_infer_vibe_tags(
      concat_ws(' ', coalesce(g.vibe, ''), coalesce(g.description, ''), coalesce(g.name, ''), coalesce(g.location, '')),
      null
    ) as inferred_tags
  from public.global_events g
  where coalesce(cardinality(g.vibe_tags), 0) = 0
)
update public.global_events g
set
  vibe_tags = c.inferred_tags,
  vibe = coalesce(
    nullif(trim(coalesce(g.vibe, '')), ''),
    initcap(replace(c.inferred_tags[1], '_', '-'))
  )
from candidates c
where g.id = c.id;

-- Optional verification queries:
-- select 'places' as table_name, count(*) as rows_without_tags from public.places where cardinality(vibe_tags) = 0;
-- select 'events' as table_name, count(*) as rows_without_tags from public.events where cardinality(vibe_tags) = 0;
-- select 'global_events' as table_name, count(*) as rows_without_tags from public.global_events where cardinality(vibe_tags) = 0;
