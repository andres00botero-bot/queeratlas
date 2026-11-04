-- Queer Atlas: allow designated admins to permanently remove contact spam.
-- Run after contact-us-v1.sql. Thread replies and events are deleted by their
-- existing foreign-key cascades, so no orphaned support data remains.

begin;

alter table public.contact_threads enable row level security;

drop policy if exists "contact_threads_delete_admin" on public.contact_threads;
create policy "contact_threads_delete_admin"
on public.contact_threads
for delete
to authenticated
using (
  exists (
    select 1
    from public.qa_admin_users a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  )
);

commit;
