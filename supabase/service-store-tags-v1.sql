-- Queer Atlas: entity-reserved tags and Stores venue category.
-- Safe to run repeatedly.

do $qa_add_store_place_type$
declare
  existing_expression text;
begin
  select pg_get_expr(c.conbin, c.conrelid)
    into existing_expression
  from pg_constraint c
  where c.conrelid = 'public.places'::regclass
    and c.conname = 'places_type_check'
    and c.contype = 'c';

  if existing_expression is null then
    alter table public.places
      add constraint places_type_check
      check (type in ('club','bar','restaurant','sauna','cruise_club','cruising_area','cafe','hotel','cinema','gallery','store'));
  elsif existing_expression not ilike '%store%' then
    execute 'alter table public.places drop constraint places_type_check';
    execute format(
      'alter table public.places add constraint places_type_check check ((%s) or type = ''store'')',
      existing_expression
    );
  end if;
end
$qa_add_store_place_type$;

alter table public.places
  drop constraint if exists qa_places_vibe_tags_allowed;

update public.places
set
  vibe = coalesce(nullif(btrim(vibe), ''), 'Store'),
  vibe_tags = array['store']::text[]
where type = 'store';

update public.places
set vibe_tags = array_remove(array_remove(vibe_tags, 'service'), 'store')
where type <> 'store'
  and ('service' = any(vibe_tags) or 'store' = any(vibe_tags));

alter table public.places
  add constraint qa_places_vibe_tags_allowed
  check (
    (type = 'store' and vibe_tags = array['store']::text[])
    or
    (
      type <> 'store'
      and vibe_tags <@ array[
        'techno','pop','mixed','electronic','men_only','after','chill','cultural',
        'fetish','social','cozy','massive','luxury','festival','underground',
        'cruise','relax','drag','industrial'
      ]::text[]
    )
  );

create or replace function public.qa_enforce_place_reserved_tag()
returns trigger
language plpgsql
as $qa_place_tag_trigger$
begin
  if new.type = 'store' then
    new.vibe_tags := array['store']::text[];
    new.vibe := coalesce(nullif(btrim(new.vibe), ''), 'Store');
  else
    new.vibe_tags := array_remove(array_remove(coalesce(new.vibe_tags, '{}'::text[]), 'service'), 'store');
  end if;
  return new;
end
$qa_place_tag_trigger$;

drop trigger if exists qa_enforce_place_reserved_tag on public.places;
create trigger qa_enforce_place_reserved_tag
before insert or update of type, vibe, vibe_tags on public.places
for each row execute function public.qa_enforce_place_reserved_tag();

update public.services
set
  vibe = coalesce(nullif(btrim(vibe), ''), 'Service'),
  vibe_tags = array['service']::text[];

alter table public.services
  alter column vibe_tags set default array['service']::text[];

alter table public.services
  drop constraint if exists qa_services_vibe_tags_allowed;
alter table public.services
  add constraint qa_services_vibe_tags_allowed
  check (vibe_tags = array['service']::text[]);

create or replace function public.qa_enforce_service_tag()
returns trigger
language plpgsql
as $qa_service_tag_trigger$
begin
  new.vibe_tags := array['service']::text[];
  new.vibe := coalesce(nullif(btrim(new.vibe), ''), 'Service');
  return new;
end
$qa_service_tag_trigger$;

drop trigger if exists qa_enforce_service_tag on public.services;
create trigger qa_enforce_service_tag
before insert or update of vibe, vibe_tags on public.services
for each row execute function public.qa_enforce_service_tag();
