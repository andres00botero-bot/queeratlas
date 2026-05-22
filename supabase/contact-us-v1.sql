-- Queer Atlas: Contact Us (home) v1
-- Creates contact thread storage for community support + business inquiries.

create extension if not exists pgcrypto;

create table if not exists public.contact_threads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'in_review', 'resolved', 'closed')),
  priority text not null default 'normal' check (priority in ('normal', 'high', 'urgent')),
  category text not null check (category in ('bug_report', 'safety_concern', 'venue_event_correction', 'general_feedback', 'business_inquiry')),
  subject text not null,
  message text not null,
  is_anonymous boolean not null default false,
  user_id uuid null references auth.users(id) on delete set null,
  sender_name text null,
  sender_email text null,
  city_context text null,
  page_context text not null default '/home',
  meta jsonb not null default '{}'::jsonb
);

create table if not exists public.contact_thread_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.contact_threads(id) on delete cascade,
  created_at timestamptz not null default now(),
  author_role text not null check (author_role in ('user', 'admin', 'system')),
  author_user_id uuid null references auth.users(id) on delete set null,
  body text not null,
  is_internal_note boolean not null default false
);

create table if not exists public.contact_thread_events (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.contact_threads(id) on delete cascade,
  created_at timestamptz not null default now(),
  event_type text not null check (event_type in ('created', 'status_changed', 'priority_changed', 'assigned')),
  payload jsonb not null default '{}'::jsonb
);

create index if not exists contact_threads_created_at_idx
  on public.contact_threads (created_at desc);

create index if not exists contact_threads_status_priority_idx
  on public.contact_threads (status, priority, created_at desc);

create index if not exists contact_threads_category_idx
  on public.contact_threads (category, created_at desc);

create index if not exists contact_threads_user_id_idx
  on public.contact_threads (user_id, created_at desc);

create or replace function public.qa_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contact_threads_set_updated_at on public.contact_threads;
create trigger contact_threads_set_updated_at
before update on public.contact_threads
for each row execute function public.qa_set_updated_at();

alter table public.contact_threads enable row level security;
alter table public.contact_thread_replies enable row level security;
alter table public.contact_thread_events enable row level security;

-- Anyone can create a contact thread from home page (anon or authenticated).
drop policy if exists "contact_threads_insert_public" on public.contact_threads;
create policy "contact_threads_insert_public"
on public.contact_threads
for insert
to anon, authenticated
with check (true);

-- Thread owner can read their own threads (if user_id is present).
drop policy if exists "contact_threads_select_owner" on public.contact_threads;
create policy "contact_threads_select_owner"
on public.contact_threads
for select
to authenticated
using (user_id = auth.uid());

-- Admin users can read/update all contact threads.
drop policy if exists "contact_threads_select_admin" on public.contact_threads;
create policy "contact_threads_select_admin"
on public.contact_threads
for select
to authenticated
using (
  exists (
    select 1
    from public.qa_admin_users a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  )
);

drop policy if exists "contact_threads_update_admin" on public.contact_threads;
create policy "contact_threads_update_admin"
on public.contact_threads
for update
to authenticated
using (
  exists (
    select 1
    from public.qa_admin_users a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  )
)
with check (
  exists (
    select 1
    from public.qa_admin_users a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  )
);

-- Replies/events are admin-managed for now.
drop policy if exists "contact_replies_select_admin" on public.contact_thread_replies;
create policy "contact_replies_select_admin"
on public.contact_thread_replies
for select
to authenticated
using (
  exists (
    select 1
    from public.qa_admin_users a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  )
);

drop policy if exists "contact_replies_write_admin" on public.contact_thread_replies;
create policy "contact_replies_write_admin"
on public.contact_thread_replies
for all
to authenticated
using (
  exists (
    select 1
    from public.qa_admin_users a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  )
)
with check (
  exists (
    select 1
    from public.qa_admin_users a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  )
);

drop policy if exists "contact_events_select_admin" on public.contact_thread_events;
create policy "contact_events_select_admin"
on public.contact_thread_events
for select
to authenticated
using (
  exists (
    select 1
    from public.qa_admin_users a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  )
);

drop policy if exists "contact_events_write_admin" on public.contact_thread_events;
create policy "contact_events_write_admin"
on public.contact_thread_events
for all
to authenticated
using (
  exists (
    select 1
    from public.qa_admin_users a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  )
)
with check (
  exists (
    select 1
    from public.qa_admin_users a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  )
);
