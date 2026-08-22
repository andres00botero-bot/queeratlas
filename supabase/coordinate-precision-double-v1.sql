begin;

-- `places_with_stats` depends on places.lat/lng. PostgreSQL blocks a column type
-- change while that view exists, so preserve and recreate the live definition,
-- owner, options, comment, and grants inside the same transaction.
do $migration$
declare
  stats_view_definition text;
  stats_view_owner text;
  stats_view_options text[];
  stats_view_comment text;
  stats_view_grants text[];
  grant_statement text;
begin
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'places_with_stats'
      and c.relkind = 'v'
  ) then
    select
      pg_get_viewdef(c.oid, true),
      pg_get_userbyid(c.relowner),
      c.reloptions,
      obj_description(c.oid, 'pg_class')
    into
      stats_view_definition,
      stats_view_owner,
      stats_view_options,
      stats_view_comment
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'places_with_stats'
      and c.relkind = 'v';

    select array_agg(
      format(
        'grant %s on public.places_with_stats to %s%s',
        privilege_type,
        case when grantee = 'PUBLIC' then 'public' else format('%I', grantee) end,
        case when is_grantable = 'YES' then ' with grant option' else '' end
      )
    )
    into stats_view_grants
    from information_schema.table_privileges
    where table_schema = 'public'
      and table_name = 'places_with_stats';

    drop view public.places_with_stats;
  end if;

  alter table if exists public.places
    alter column lat type double precision using lat::double precision,
    alter column lng type double precision using lng::double precision;

  if stats_view_definition is not null then
    execute format(
      'create view public.places_with_stats as %s',
      stats_view_definition
    );

    if coalesce(array_length(stats_view_options, 1), 0) > 0 then
      execute format(
        'alter view public.places_with_stats set (%s)',
        array_to_string(stats_view_options, ', ')
      );
    end if;

    execute format(
      'alter view public.places_with_stats owner to %I',
      stats_view_owner
    );

    if stats_view_comment is not null then
      execute format(
        'comment on view public.places_with_stats is %L',
        stats_view_comment
      );
    end if;

    if stats_view_grants is not null then
      foreach grant_statement in array stats_view_grants loop
        execute grant_statement;
      end loop;
    end if;
  end if;
end
$migration$;

alter table if exists public.events
  alter column lat type double precision using lat::double precision,
  alter column lng type double precision using lng::double precision;

alter table if exists public.services
  alter column lat type double precision using lat::double precision,
  alter column lng type double precision using lng::double precision;

commit;

notify pgrst, 'reload schema';

select
  table_name,
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in ('places', 'places_with_stats', 'events', 'services')
  and column_name in ('lat', 'lng')
order by table_name, column_name;
