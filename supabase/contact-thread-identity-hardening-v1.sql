-- Apply before deploying the contact API update. Keep public contact submissions
-- available, but prevent clients from attributing them to another account.
begin;

drop policy if exists "contact_threads_insert_public" on public.contact_threads;
create policy "contact_threads_insert_public"
on public.contact_threads
for insert
to anon, authenticated
with check (
  (user_id is null or user_id = auth.uid())
  and (not is_anonymous or user_id is null)
);

commit;
