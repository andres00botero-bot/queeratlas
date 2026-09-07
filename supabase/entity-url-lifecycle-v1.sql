-- Queer Atlas canonical URL lifecycle: redirects for renamed/merged entities and
-- intentional 404 tombstones for entities that are no longer publishable.

create table if not exists public.qa_entity_url_lifecycle (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique check (source_path ~ '^/[^?]*$'),
  destination_path text check (destination_path is null or destination_path ~ '^/[^?]*$'),
  lifecycle_status text not null check (lifecycle_status in ('redirected', 'gone')),
  entity_kind text not null default 'page' check (entity_kind in ('venue', 'event', 'service', 'page')),
  entity_id text,
  entity_name text,
  reason text,
  verified_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (lifecycle_status = 'redirected' and destination_path is not null and destination_path <> source_path)
    or (lifecycle_status = 'gone' and destination_path is null)
  )
);

create index if not exists qa_entity_url_lifecycle_status_idx
  on public.qa_entity_url_lifecycle (lifecycle_status, entity_kind);

alter table public.qa_entity_url_lifecycle enable row level security;

drop policy if exists qa_entity_url_lifecycle_public_read on public.qa_entity_url_lifecycle;
create policy qa_entity_url_lifecycle_public_read
on public.qa_entity_url_lifecycle
for select
to anon, authenticated
using (true);

drop policy if exists qa_entity_url_lifecycle_admin_insert on public.qa_entity_url_lifecycle;
create policy qa_entity_url_lifecycle_admin_insert
on public.qa_entity_url_lifecycle
for insert
to authenticated
with check (public.qa_is_admin());

drop policy if exists qa_entity_url_lifecycle_admin_update on public.qa_entity_url_lifecycle;
create policy qa_entity_url_lifecycle_admin_update
on public.qa_entity_url_lifecycle
for update
to authenticated
using (public.qa_is_admin())
with check (public.qa_is_admin());

drop policy if exists qa_entity_url_lifecycle_admin_delete on public.qa_entity_url_lifecycle;
create policy qa_entity_url_lifecycle_admin_delete
on public.qa_entity_url_lifecycle
for delete
to authenticated
using (public.qa_is_admin());

grant select on public.qa_entity_url_lifecycle to anon, authenticated;
grant insert, update, delete on public.qa_entity_url_lifecycle to authenticated;

-- Known retired URL: keep it as an intentional 404 tombstone rather than
-- redirecting people to an unrelated venue.
insert into public.qa_entity_url_lifecycle (
  source_path, lifecycle_status, entity_kind, entity_name, reason
) values (
  '/berlin/venues/schwuz--1063',
  'gone',
  'venue',
  'SchwuZ',
  'The former entity URL is no longer an active Queer Atlas listing.'
)
on conflict (source_path) do update
set
  lifecycle_status = excluded.lifecycle_status,
  destination_path = excluded.destination_path,
  entity_kind = excluded.entity_kind,
  entity_name = excluded.entity_name,
  reason = excluded.reason,
  verified_at = now(),
  updated_at = now();
