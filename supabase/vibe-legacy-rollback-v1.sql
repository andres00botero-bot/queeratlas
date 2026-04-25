-- Queer Atlas: rollback for safe legacy vibe migration (v1)
-- Uses snapshot rows created by supabase/vibe-legacy-migration-safe-v1.sql

create or replace function public.qa_rollback_vibe_migration_run(
  p_run_id text
)
returns table (table_name text, restored_count integer)
language plpgsql
as $$
declare
  v_run_id text := trim(coalesce(p_run_id, ''));
  v_places integer := 0;
  v_events integer := 0;
  v_global integer := 0;
begin
  if v_run_id = '' then
    raise exception 'run_id is required';
  end if;

  update public.places p
  set
    vibe = s.old_vibe,
    vibe_tags = s.old_vibe_tags
  from public.qa_vibe_migration_snapshot s
  where s.run_id = v_run_id
    and s.table_name = 'places'
    and p.id::text = s.entity_id;
  get diagnostics v_places = row_count;

  update public.events e
  set
    vibe = s.old_vibe,
    vibe_tags = s.old_vibe_tags
  from public.qa_vibe_migration_snapshot s
  where s.run_id = v_run_id
    and s.table_name = 'events'
    and e.id::text = s.entity_id;
  get diagnostics v_events = row_count;

  update public.global_events g
  set
    vibe = s.old_vibe,
    vibe_tags = s.old_vibe_tags
  from public.qa_vibe_migration_snapshot s
  where s.run_id = v_run_id
    and s.table_name = 'global_events'
    and g.id::text = s.entity_id;
  get diagnostics v_global = row_count;

  update public.qa_vibe_migration_stage
  set
    applied_at = null,
    apply_error = null,
    updated_at = now()
  where run_id = v_run_id;

  update public.qa_vibe_migration_runs
  set
    status = 'reverted',
    reverted_at = now(),
    updated_at = now()
  where run_id = v_run_id;

  return query
  select 'places'::text, v_places
  union all
  select 'events'::text, v_events
  union all
  select 'global_events'::text, v_global;
end;
$$;

-- Example usage:
-- select * from public.qa_rollback_vibe_migration_run('vibe-run-2026-04-25-a');

