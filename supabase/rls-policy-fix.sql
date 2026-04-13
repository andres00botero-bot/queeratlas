-- Queer Atlas: Policy cleanup and hardening
-- Safe to run multiple times.

begin;

-- Ensure key tables have RLS enabled
alter table if exists public.places_with_stats enable row level security;
alter table if exists public.places enable row level security;
alter table if exists public.events enable row level security;
alter table if exists public.global_events enable row level security;
alter table if exists public.reviews enable row level security;
alter table if exists public.qa_admin_users enable row level security;

-- Remove legacy broad/open policies
drop policy if exists "allow insert" on public.events;
drop policy if exists "allow select" on public.events;
drop policy if exists "Allow insert reviews" on public.reviews;
drop policy if exists "Allow read reviews" on public.reviews;
drop policy if exists global_events_insert_all on public.global_events;
drop policy if exists global_events_select_all on public.global_events;
drop policy if exists global_events_update_all on public.global_events;

-- places_with_stats (read open, write authenticated/admin only)
drop policy if exists qa_read_all on public.places_with_stats;
create policy qa_read_all
on public.places_with_stats
for select
using (true);

drop policy if exists qa_insert_authenticated on public.places_with_stats;
create policy qa_insert_authenticated
on public.places_with_stats
for insert
to authenticated
with check (auth.uid() is not null);

drop policy if exists qa_update_admin_only on public.places_with_stats;
create policy qa_update_admin_only
on public.places_with_stats
for update
to authenticated
using (public.qa_is_admin())
with check (public.qa_is_admin());

drop policy if exists qa_delete_admin_only on public.places_with_stats;
create policy qa_delete_admin_only
on public.places_with_stats
for delete
to authenticated
using (public.qa_is_admin());

-- events (read open, insert authenticated, update/delete admin)
drop policy if exists qa_read_all on public.events;
create policy qa_read_all
on public.events
for select
using (true);

drop policy if exists qa_insert_authenticated on public.events;
create policy qa_insert_authenticated
on public.events
for insert
to authenticated
with check (auth.uid() is not null);

drop policy if exists qa_update_admin_only on public.events;
create policy qa_update_admin_only
on public.events
for update
to authenticated
using (public.qa_is_admin())
with check (public.qa_is_admin());

drop policy if exists qa_delete_admin_only on public.events;
create policy qa_delete_admin_only
on public.events
for delete
to authenticated
using (public.qa_is_admin());

-- global_events (read open, insert/update authenticated, delete admin)
drop policy if exists qa_read_all on public.global_events;
create policy qa_read_all
on public.global_events
for select
using (true);

drop policy if exists qa_insert_authenticated on public.global_events;
create policy qa_insert_authenticated
on public.global_events
for insert
to authenticated
with check (auth.uid() is not null);

drop policy if exists qa_update_authenticated on public.global_events;
create policy qa_update_authenticated
on public.global_events
for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists qa_delete_admin_only on public.global_events;
create policy qa_delete_admin_only
on public.global_events
for delete
to authenticated
using (public.qa_is_admin());

-- reviews (read open, insert authenticated, update/delete admin)
drop policy if exists qa_read_all on public.reviews;
create policy qa_read_all
on public.reviews
for select
using (true);

drop policy if exists qa_insert_authenticated on public.reviews;
create policy qa_insert_authenticated
on public.reviews
for insert
to authenticated
with check (auth.uid() is not null);

drop policy if exists qa_update_admin_only on public.reviews;
create policy qa_update_admin_only
on public.reviews
for update
to authenticated
using (public.qa_is_admin())
with check (public.qa_is_admin());

drop policy if exists qa_delete_admin_only on public.reviews;
create policy qa_delete_admin_only
on public.reviews
for delete
to authenticated
using (public.qa_is_admin());

-- admin table (self-read + admin manage)
drop policy if exists qa_admin_users_read_self on public.qa_admin_users;
create policy qa_admin_users_read_self
on public.qa_admin_users
for select
to authenticated
using (lower(email) = lower(coalesce(auth.jwt()->>'email', '')));

drop policy if exists qa_admin_users_manage_by_admin on public.qa_admin_users;
create policy qa_admin_users_manage_by_admin
on public.qa_admin_users
for all
to authenticated
using (public.qa_is_admin())
with check (public.qa_is_admin());

commit;
