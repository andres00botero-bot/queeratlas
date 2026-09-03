begin;

create table if not exists public.member_calendar_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null,
  source_type text not null check (source_type in ('event', 'trip', 'personal')),
  source_id text,
  status text not null default 'saved' check (status in ('saved', 'going', 'cancelled')),
  title text not null,
  city text,
  date_key date not null,
  time_value time,
  notes text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create table if not exists public.member_calendar_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_client_id text not null,
  mode text not null check (mode in ('day_before', 'day_of', 'hour_before')),
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'cancelled', 'failed')),
  attempt_count integer not null default 0,
  delivered_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_client_id, mode)
);

create table if not exists public.member_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  user_agent text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create index if not exists member_calendar_entries_user_date_idx on public.member_calendar_entries (user_id, date_key);
create index if not exists member_calendar_reminders_due_idx on public.member_calendar_reminders (status, scheduled_for) where status = 'pending';
create index if not exists member_push_subscriptions_user_active_idx on public.member_push_subscriptions (user_id, active);

alter table public.member_calendar_entries enable row level security;
alter table public.member_calendar_reminders enable row level security;
alter table public.member_push_subscriptions enable row level security;

drop policy if exists member_calendar_entries_owner_all on public.member_calendar_entries;
create policy member_calendar_entries_owner_all on public.member_calendar_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists member_calendar_reminders_owner_all on public.member_calendar_reminders;
create policy member_calendar_reminders_owner_all on public.member_calendar_reminders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists member_push_subscriptions_owner_all on public.member_push_subscriptions;
create policy member_push_subscriptions_owner_all on public.member_push_subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

revoke all on public.member_push_subscriptions from anon;
grant select, insert, update, delete on public.member_calendar_entries to authenticated;
grant select, insert, update, delete on public.member_calendar_reminders to authenticated;
grant select, insert, update, delete on public.member_push_subscriptions to authenticated;

commit;
