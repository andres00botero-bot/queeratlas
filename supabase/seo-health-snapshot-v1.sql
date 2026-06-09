-- Queer Atlas SEO health snapshots (pass/warn/fail checks with history)
-- Run in Supabase SQL editor.

create table if not exists public.qa_seo_health_snapshots (
  id uuid primary key default gen_random_uuid(),
  status_summary text not null check (status_summary in ('pass', 'warn', 'fail')),
  checks_passed integer not null default 0 check (checks_passed >= 0),
  checks_warn integer not null default 0 check (checks_warn >= 0),
  checks_failed integer not null default 0 check (checks_failed >= 0),
  snapshot_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists qa_seo_health_snapshots_created_at_idx
  on public.qa_seo_health_snapshots (created_at desc);

create table if not exists public.qa_seo_health_snapshot_checks (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.qa_seo_health_snapshots(id) on delete cascade,
  check_key text not null,
  status text not null check (status in ('pass', 'warn', 'fail')),
  score integer not null default 0 check (score >= 0 and score <= 100),
  evidence jsonb not null default '{}'::jsonb,
  recommendation text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists qa_seo_health_snapshot_checks_snapshot_idx
  on public.qa_seo_health_snapshot_checks (snapshot_id);

create index if not exists qa_seo_health_snapshot_checks_key_idx
  on public.qa_seo_health_snapshot_checks (check_key);

alter table public.qa_seo_health_snapshots enable row level security;
alter table public.qa_seo_health_snapshot_checks enable row level security;

drop policy if exists qa_seo_health_snapshots_select_admin on public.qa_seo_health_snapshots;
create policy qa_seo_health_snapshots_select_admin
on public.qa_seo_health_snapshots
for select
to authenticated
using (public.qa_is_admin());

drop policy if exists qa_seo_health_snapshot_checks_select_admin on public.qa_seo_health_snapshot_checks;
create policy qa_seo_health_snapshot_checks_select_admin
on public.qa_seo_health_snapshot_checks
for select
to authenticated
using (
  exists (
    select 1
    from public.qa_seo_health_snapshots s
    where s.id = snapshot_id
  )
  and public.qa_is_admin()
);

drop policy if exists qa_seo_health_snapshots_insert_admin on public.qa_seo_health_snapshots;
drop policy if exists qa_seo_health_snapshot_checks_insert_admin on public.qa_seo_health_snapshot_checks;

revoke all on table public.qa_seo_health_snapshots from anon;
revoke all on table public.qa_seo_health_snapshot_checks from anon;
revoke insert, update, delete on table public.qa_seo_health_snapshots from authenticated;
revoke insert, update, delete on table public.qa_seo_health_snapshot_checks from authenticated;
grant select on table public.qa_seo_health_snapshots to authenticated;
grant select on table public.qa_seo_health_snapshot_checks to authenticated;
grant all on table public.qa_seo_health_snapshots to service_role;
grant all on table public.qa_seo_health_snapshot_checks to service_role;
