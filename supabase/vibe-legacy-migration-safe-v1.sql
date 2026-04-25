-- Queer Atlas: safe legacy vibe migration toolkit (v1)
-- Goal:
-- 1) Snapshot before edits
-- 2) Stage proposed vibe_tags for review
-- 3) Apply in controlled batches
-- 4) Keep rollback path by run_id
--
-- Prerequisite:
-- - Run supabase/vibe-tags-v1.sql first (vibe_tags columns + constraints)
-- - Run supabase/vibe-tags-backfill-v1.sql first (qa_infer_vibe_tags function)

create table if not exists public.qa_vibe_migration_runs (
  run_id text primary key,
  note text,
  created_by text,
  status text not null default 'created',
  created_at timestamptz not null default now(),
  staged_at timestamptz,
  applied_at timestamptz,
  reverted_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.qa_vibe_migration_snapshot (
  run_id text not null references public.qa_vibe_migration_runs(run_id) on delete cascade,
  table_name text not null check (table_name in ('places', 'events', 'global_events')),
  entity_id text not null,
  old_vibe text,
  old_vibe_tags text[] not null default '{}'::text[],
  snapshot_at timestamptz not null default now(),
  primary key (run_id, table_name, entity_id)
);

create table if not exists public.qa_vibe_migration_stage (
  run_id text not null references public.qa_vibe_migration_runs(run_id) on delete cascade,
  table_name text not null check (table_name in ('places', 'events', 'global_events')),
  entity_id text not null,
  city text,
  entity_type text,
  name text,
  old_vibe text,
  old_vibe_tags text[] not null default '{}'::text[],
  proposed_vibe_tags text[] not null default '{}'::text[],
  source_rule text not null default 'mixed_fallback',
  confidence text not null default 'low' check (confidence in ('high', 'medium', 'low')),
  selected boolean not null default false,
  reviewed_by text,
  reviewed_at timestamptz,
  applied_at timestamptz,
  apply_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (run_id, table_name, entity_id)
);

create index if not exists qa_vibe_stage_run_confidence_idx
  on public.qa_vibe_migration_stage(run_id, confidence, selected, applied_at);

create index if not exists qa_vibe_stage_run_table_city_idx
  on public.qa_vibe_migration_stage(run_id, table_name, city);

create or replace function public.qa_normalize_vibe_token(input_text text)
returns text
language sql
immutable
as $$
  select lower(
    regexp_replace(
      regexp_replace(trim(coalesce(input_text, '')), '[_-]+', ' ', 'g'),
      '\s+',
      ' ',
      'g'
    )
  );
$$;

create or replace function public.qa_is_explicit_vibe_alias(input_text text)
returns boolean
language sql
immutable
as $$
  select public.qa_normalize_vibe_token(input_text) = any (array[
    'techno',
    'electro',
    'electronic',
    'edm',
    'house',
    'pop',
    'mainstream',
    'mixed',
    'open format',
    'men only',
    'men-only',
    'male only',
    'after',
    'afterhours',
    'after hours',
    'day party',
    'dagsfester',
    'chill',
    'chilled',
    'cultural',
    'culture',
    'fetish',
    'kink',
    'social',
    'cozy',
    'cosy',
    'massive',
    'big room',
    'luxury',
    'premium',
    'festival',
    'fest',
    'underground',
    'raw',
    'cruise',
    'cruising',
    'men-only cruise',
    'relax',
    'relaxed',
    'sauna',
    'drag',
    'industrial',
    'warehouse'
  ]);
$$;

create or replace function public.qa_has_vibe_keywords(input_text text)
returns boolean
language sql
immutable
as $$
  select public.qa_normalize_vibe_token(input_text) ~
    '(techno|electro|electronic|edm|house|pop|mainstream|mixed|men only|men-only|after|afterhours|day party|chill|cultural|fetish|kink|social|cozy|cosy|massive|luxury|festival|underground|cruise|relax|drag|industrial|warehouse)';
$$;

create or replace function public.qa_vibe_tag_label(input_tag text)
returns text
language sql
immutable
as $$
  select case lower(trim(coalesce(input_tag, '')))
    when 'techno' then 'Techno'
    when 'pop' then 'Pop'
    when 'mixed' then 'Mixed'
    when 'electronic' then 'Electronic'
    when 'men_only' then 'Men-only'
    when 'after' then 'After'
    when 'chill' then 'Chill'
    when 'cultural' then 'Cultural'
    when 'fetish' then 'Fetish'
    when 'social' then 'Social'
    when 'cozy' then 'Cozy'
    when 'massive' then 'Massive'
    when 'luxury' then 'Luxury'
    when 'festival' then 'Festival'
    when 'underground' then 'Underground'
    when 'cruise' then 'Cruise'
    when 'relax' then 'Relax'
    when 'drag' then 'Drag'
    when 'industrial' then 'Industrial'
    else null
  end;
$$;

create or replace function public.qa_create_vibe_migration_run(
  p_run_id text,
  p_note text default null,
  p_created_by text default null
)
returns text
language plpgsql
as $$
declare
  v_run_id text := trim(coalesce(p_run_id, ''));
begin
  if v_run_id = '' then
    raise exception 'run_id is required';
  end if;

  insert into public.qa_vibe_migration_runs (run_id, note, created_by, status)
  values (v_run_id, p_note, p_created_by, 'created')
  on conflict (run_id) do update
    set note = excluded.note,
        created_by = excluded.created_by,
        updated_at = now();

  return v_run_id;
end;
$$;

create or replace function public.qa_stage_vibe_migration(
  p_run_id text,
  p_only_missing boolean default true,
  p_replace_stage boolean default true
)
returns table (table_name text, staged_count bigint)
language plpgsql
as $$
declare
  v_run_id text := trim(coalesce(p_run_id, ''));
begin
  if v_run_id = '' then
    raise exception 'run_id is required';
  end if;

  insert into public.qa_vibe_migration_runs (run_id, status)
  values (v_run_id, 'created')
  on conflict (run_id) do nothing;

  if p_replace_stage then
    delete from public.qa_vibe_migration_stage where run_id = v_run_id;
    delete from public.qa_vibe_migration_snapshot where run_id = v_run_id;
  end if;

  with place_candidates as (
    select
      'places'::text as table_name,
      p.id::text as entity_id,
      p.city::text as city,
      p.type::text as entity_type,
      p.name::text as name,
      p.vibe::text as old_vibe,
      coalesce(p.vibe_tags, '{}'::text[]) as old_vibe_tags,
      public.qa_infer_vibe_tags(
        concat_ws(' ', coalesce(p.vibe, ''), coalesce(p.description, ''), coalesce(p.name, '')),
        p.type
      ) as proposed_vibe_tags
    from public.places p
    where
      (p_only_missing and coalesce(cardinality(p.vibe_tags), 0) = 0)
      or
      (not p_only_missing and (coalesce(cardinality(p.vibe_tags), 0) = 0 or trim(coalesce(p.vibe, '')) <> ''))
  ),
  event_candidates as (
    select
      'events'::text as table_name,
      e.id::text as entity_id,
      e.city::text as city,
      'event'::text as entity_type,
      e.name::text as name,
      e.vibe::text as old_vibe,
      coalesce(e.vibe_tags, '{}'::text[]) as old_vibe_tags,
      public.qa_infer_vibe_tags(
        concat_ws(' ', coalesce(e.vibe, ''), coalesce(e.description, ''), coalesce(e.name, ''), coalesce(e.location, '')),
        null
      ) as proposed_vibe_tags
    from public.events e
    where
      (p_only_missing and coalesce(cardinality(e.vibe_tags), 0) = 0)
      or
      (not p_only_missing and (coalesce(cardinality(e.vibe_tags), 0) = 0 or trim(coalesce(e.vibe, '')) <> ''))
  ),
  global_event_candidates as (
    select
      'global_events'::text as table_name,
      g.id::text as entity_id,
      nullif(trim(coalesce(to_jsonb(g)->>'city', '')), '')::text as city,
      'off-grid event'::text as entity_type,
      g.name::text as name,
      g.vibe::text as old_vibe,
      coalesce(g.vibe_tags, '{}'::text[]) as old_vibe_tags,
      public.qa_infer_vibe_tags(
        concat_ws(' ', coalesce(g.vibe, ''), coalesce(g.description, ''), coalesce(g.name, ''), coalesce(to_jsonb(g)->>'location', '')),
        null
      ) as proposed_vibe_tags
    from public.global_events g
    where
      (p_only_missing and coalesce(cardinality(g.vibe_tags), 0) = 0)
      or
      (not p_only_missing and (coalesce(cardinality(g.vibe_tags), 0) = 0 or trim(coalesce(g.vibe, '')) <> ''))
  ),
  all_candidates as (
    select * from place_candidates
    union all
    select * from event_candidates
    union all
    select * from global_event_candidates
  )
  insert into public.qa_vibe_migration_snapshot (
    run_id, table_name, entity_id, old_vibe, old_vibe_tags
  )
  select
    v_run_id,
    c.table_name,
    c.entity_id,
    c.old_vibe,
    c.old_vibe_tags
  from all_candidates c
  on conflict (run_id, table_name, entity_id) do nothing;

  with place_candidates as (
    select
      'places'::text as table_name,
      p.id::text as entity_id,
      p.city::text as city,
      p.type::text as entity_type,
      p.name::text as name,
      p.vibe::text as old_vibe,
      coalesce(p.vibe_tags, '{}'::text[]) as old_vibe_tags,
      public.qa_infer_vibe_tags(
        concat_ws(' ', coalesce(p.vibe, ''), coalesce(p.description, ''), coalesce(p.name, '')),
        p.type
      ) as proposed_vibe_tags
    from public.places p
    where
      (p_only_missing and coalesce(cardinality(p.vibe_tags), 0) = 0)
      or
      (not p_only_missing and (coalesce(cardinality(p.vibe_tags), 0) = 0 or trim(coalesce(p.vibe, '')) <> ''))
  ),
  event_candidates as (
    select
      'events'::text as table_name,
      e.id::text as entity_id,
      e.city::text as city,
      'event'::text as entity_type,
      e.name::text as name,
      e.vibe::text as old_vibe,
      coalesce(e.vibe_tags, '{}'::text[]) as old_vibe_tags,
      public.qa_infer_vibe_tags(
        concat_ws(' ', coalesce(e.vibe, ''), coalesce(e.description, ''), coalesce(e.name, ''), coalesce(e.location, '')),
        null
      ) as proposed_vibe_tags
    from public.events e
    where
      (p_only_missing and coalesce(cardinality(e.vibe_tags), 0) = 0)
      or
      (not p_only_missing and (coalesce(cardinality(e.vibe_tags), 0) = 0 or trim(coalesce(e.vibe, '')) <> ''))
  ),
  global_event_candidates as (
    select
      'global_events'::text as table_name,
      g.id::text as entity_id,
      nullif(trim(coalesce(to_jsonb(g)->>'city', '')), '')::text as city,
      'off-grid event'::text as entity_type,
      g.name::text as name,
      g.vibe::text as old_vibe,
      coalesce(g.vibe_tags, '{}'::text[]) as old_vibe_tags,
      public.qa_infer_vibe_tags(
        concat_ws(' ', coalesce(g.vibe, ''), coalesce(g.description, ''), coalesce(g.name, ''), coalesce(to_jsonb(g)->>'location', '')),
        null
      ) as proposed_vibe_tags
    from public.global_events g
    where
      (p_only_missing and coalesce(cardinality(g.vibe_tags), 0) = 0)
      or
      (not p_only_missing and (coalesce(cardinality(g.vibe_tags), 0) = 0 or trim(coalesce(g.vibe, '')) <> ''))
  ),
  all_candidates as (
    select * from place_candidates
    union all
    select * from event_candidates
    union all
    select * from global_event_candidates
  ),
  prepared as (
    select
      v_run_id as run_id,
      c.table_name,
      c.entity_id,
      c.city,
      c.entity_type,
      c.name,
      c.old_vibe,
      c.old_vibe_tags,
      c.proposed_vibe_tags,
      case
        when public.qa_is_explicit_vibe_alias(c.old_vibe) then 'explicit_alias'
        when trim(coalesce(c.old_vibe, '')) <> '' then 'legacy_text_inference'
        when c.table_name = 'places' and lower(coalesce(c.entity_type, '')) in ('sauna', 'spa', 'cruise_club', 'cruising_area', 'cafe', 'restaurant') then 'type_fallback'
        else 'mixed_fallback'
      end as source_rule,
      case
        when public.qa_is_explicit_vibe_alias(c.old_vibe) then 'high'
        when public.qa_has_vibe_keywords(c.old_vibe) then 'medium'
        when trim(coalesce(c.old_vibe, '')) <> '' then 'medium'
        else 'low'
      end as confidence
    from all_candidates c
  )
  insert into public.qa_vibe_migration_stage (
    run_id, table_name, entity_id, city, entity_type, name, old_vibe, old_vibe_tags, proposed_vibe_tags,
    source_rule, confidence, selected, created_at, updated_at
  )
  select
    p.run_id, p.table_name, p.entity_id, p.city, p.entity_type, p.name, p.old_vibe, p.old_vibe_tags, p.proposed_vibe_tags,
    p.source_rule, p.confidence, false, now(), now()
  from prepared p
  on conflict (run_id, table_name, entity_id) do update
    set city = excluded.city,
        entity_type = excluded.entity_type,
        name = excluded.name,
        old_vibe = excluded.old_vibe,
        old_vibe_tags = excluded.old_vibe_tags,
        proposed_vibe_tags = excluded.proposed_vibe_tags,
        source_rule = excluded.source_rule,
        confidence = excluded.confidence,
        apply_error = null,
        updated_at = now();

  update public.qa_vibe_migration_runs
  set status = 'staged',
      staged_at = now(),
      updated_at = now()
  where run_id = v_run_id;

  return query
  select
    s.table_name,
    count(*)::bigint as staged_count
  from public.qa_vibe_migration_stage s
  where s.run_id = v_run_id
  group by s.table_name
  order by s.table_name;
end;
$$;

create or replace function public.qa_apply_vibe_migration_batch(
  p_run_id text,
  p_limit integer default 200,
  p_confidence text[] default array['high', 'medium']::text[],
  p_only_selected boolean default true,
  p_update_legacy_vibe boolean default false
)
returns table (table_name text, updated_count integer, failed_count integer)
language plpgsql
as $$
declare
  v_run_id text := trim(coalesce(p_run_id, ''));
  v_limit integer := greatest(coalesce(p_limit, 200), 1);
  rec record;
  v_label text;
  v_place_updated integer := 0;
  v_event_updated integer := 0;
  v_global_updated integer := 0;
  v_place_failed integer := 0;
  v_event_failed integer := 0;
  v_global_failed integer := 0;
begin
  if v_run_id = '' then
    raise exception 'run_id is required';
  end if;

  for rec in
    select s.*
    from public.qa_vibe_migration_stage s
    where s.run_id = v_run_id
      and s.applied_at is null
      and coalesce(cardinality(s.proposed_vibe_tags), 0) > 0
      and (
        p_confidence is null
        or cardinality(p_confidence) = 0
        or s.confidence = any(p_confidence)
      )
      and (not p_only_selected or s.selected = true)
    order by
      case s.confidence when 'high' then 1 when 'medium' then 2 else 3 end,
      s.table_name,
      s.city nulls last,
      s.name
    limit v_limit
  loop
    begin
      v_label := public.qa_vibe_tag_label(rec.proposed_vibe_tags[1]);

      if rec.table_name = 'places' then
        update public.places p
        set
          vibe_tags = rec.proposed_vibe_tags,
          vibe = case
            when p_update_legacy_vibe and trim(coalesce(p.vibe, '')) = '' then coalesce(v_label, p.vibe)
            else p.vibe
          end
        where p.id::text = rec.entity_id;

        if found then
          v_place_updated := v_place_updated + 1;
          update public.qa_vibe_migration_stage as s
          set applied_at = now(), apply_error = null, updated_at = now()
          where s.run_id = v_run_id and s.table_name = rec.table_name and s.entity_id = rec.entity_id;
        else
          v_place_failed := v_place_failed + 1;
          update public.qa_vibe_migration_stage as s
          set apply_error = 'row not found', updated_at = now()
          where s.run_id = v_run_id and s.table_name = rec.table_name and s.entity_id = rec.entity_id;
        end if;

      elsif rec.table_name = 'events' then
        update public.events e
        set
          vibe_tags = rec.proposed_vibe_tags,
          vibe = case
            when p_update_legacy_vibe and trim(coalesce(e.vibe, '')) = '' then coalesce(v_label, e.vibe)
            else e.vibe
          end
        where e.id::text = rec.entity_id;

        if found then
          v_event_updated := v_event_updated + 1;
          update public.qa_vibe_migration_stage as s
          set applied_at = now(), apply_error = null, updated_at = now()
          where s.run_id = v_run_id and s.table_name = rec.table_name and s.entity_id = rec.entity_id;
        else
          v_event_failed := v_event_failed + 1;
          update public.qa_vibe_migration_stage as s
          set apply_error = 'row not found', updated_at = now()
          where s.run_id = v_run_id and s.table_name = rec.table_name and s.entity_id = rec.entity_id;
        end if;

      elsif rec.table_name = 'global_events' then
        update public.global_events g
        set
          vibe_tags = rec.proposed_vibe_tags,
          vibe = case
            when p_update_legacy_vibe and trim(coalesce(g.vibe, '')) = '' then coalesce(v_label, g.vibe)
            else g.vibe
          end
        where g.id::text = rec.entity_id;

        if found then
          v_global_updated := v_global_updated + 1;
          update public.qa_vibe_migration_stage as s
          set applied_at = now(), apply_error = null, updated_at = now()
          where s.run_id = v_run_id and s.table_name = rec.table_name and s.entity_id = rec.entity_id;
        else
          v_global_failed := v_global_failed + 1;
          update public.qa_vibe_migration_stage as s
          set apply_error = 'row not found', updated_at = now()
          where s.run_id = v_run_id and s.table_name = rec.table_name and s.entity_id = rec.entity_id;
        end if;
      end if;

    exception when others then
      if rec.table_name = 'places' then
        v_place_failed := v_place_failed + 1;
      elsif rec.table_name = 'events' then
        v_event_failed := v_event_failed + 1;
      else
        v_global_failed := v_global_failed + 1;
      end if;

      update public.qa_vibe_migration_stage as s
      set apply_error = concat(sqlstate, ' ', sqlerrm), updated_at = now()
      where s.run_id = v_run_id and s.table_name = rec.table_name and s.entity_id = rec.entity_id;
    end;
  end loop;

  if (v_place_updated + v_event_updated + v_global_updated) > 0 then
    update public.qa_vibe_migration_runs
    set status = 'applied',
        applied_at = coalesce(applied_at, now()),
        updated_at = now()
    where run_id = v_run_id;
  else
    update public.qa_vibe_migration_runs
    set updated_at = now()
    where run_id = v_run_id;
  end if;

  return query
  select 'places'::text, v_place_updated, v_place_failed
  union all
  select 'events'::text, v_event_updated, v_event_failed
  union all
  select 'global_events'::text, v_global_updated, v_global_failed;
end;
$$;

-- Suggested execution flow in SQL editor:
-- 1) Create run id and stage:
--    select public.qa_create_vibe_migration_run('vibe-run-2026-04-25-a', 'legacy cleanup', 'admin@email');
--    select * from public.qa_stage_vibe_migration('vibe-run-2026-04-25-a', true, true);
--
-- 2) Review staged rows:
--    select table_name, confidence, count(*) from public.qa_vibe_migration_stage
--    where run_id = 'vibe-run-2026-04-25-a'
--    group by table_name, confidence
--    order by table_name, confidence;
--
--    select table_name, entity_id, name, city, old_vibe, old_vibe_tags, proposed_vibe_tags, confidence, source_rule
--    from public.qa_vibe_migration_stage
--    where run_id = 'vibe-run-2026-04-25-a'
--    order by confidence, table_name, city, name
--    limit 200;
--
-- 3) Select what to apply (high confidence first):
--    update public.qa_vibe_migration_stage
--    set selected = true, reviewed_by = 'admin@email', reviewed_at = now(), updated_at = now()
--    where run_id = 'vibe-run-2026-04-25-a' and confidence = 'high';
--
-- 4) Apply in batches:
--    select * from public.qa_apply_vibe_migration_batch(
--      'vibe-run-2026-04-25-a',
--      200,
--      array['high', 'medium']::text[],
--      true,
--      false
--    );
--
-- 5) Verify:
--    select table_name, count(*) as still_missing
--    from (
--      select 'places' as table_name, id::text as entity_id from public.places where coalesce(cardinality(vibe_tags), 0) = 0
--      union all
--      select 'events', id::text from public.events where coalesce(cardinality(vibe_tags), 0) = 0
--      union all
--      select 'global_events', id::text from public.global_events where coalesce(cardinality(vibe_tags), 0) = 0
--    ) t
--    group by table_name;
