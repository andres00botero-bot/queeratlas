-- Queer Atlas: standardized vibe tags (dual-write rollout, backward compatible)
-- Release B: add vibe_tags arrays for places/events/global_events.

alter table if exists public.places
  add column if not exists vibe_tags text[] not null default '{}';

alter table if exists public.events
  add column if not exists vibe_tags text[] not null default '{}';

alter table if exists public.global_events
  add column if not exists vibe_tags text[] not null default '{}';

alter table if exists public.places
  drop constraint if exists qa_places_vibe_tags_max_3;
alter table if exists public.events
  drop constraint if exists qa_events_vibe_tags_max_3;
alter table if exists public.global_events
  drop constraint if exists qa_global_events_vibe_tags_max_3;

alter table if exists public.places
  add constraint qa_places_vibe_tags_max_3
  check (cardinality(vibe_tags) <= 3);

alter table if exists public.events
  add constraint qa_events_vibe_tags_max_3
  check (cardinality(vibe_tags) <= 3);

alter table if exists public.global_events
  add constraint qa_global_events_vibe_tags_max_3
  check (cardinality(vibe_tags) <= 3);

alter table if exists public.places
  drop constraint if exists qa_places_vibe_tags_allowed;
alter table if exists public.events
  drop constraint if exists qa_events_vibe_tags_allowed;
alter table if exists public.global_events
  drop constraint if exists qa_global_events_vibe_tags_allowed;

alter table if exists public.places
  add constraint qa_places_vibe_tags_allowed
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

alter table if exists public.events
  add constraint qa_events_vibe_tags_allowed
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

alter table if exists public.global_events
  add constraint qa_global_events_vibe_tags_allowed
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

create index if not exists qa_places_vibe_tags_gin_idx
  on public.places using gin (vibe_tags);

create index if not exists qa_events_vibe_tags_gin_idx
  on public.events using gin (vibe_tags);

create index if not exists qa_global_events_vibe_tags_gin_idx
  on public.global_events using gin (vibe_tags);
