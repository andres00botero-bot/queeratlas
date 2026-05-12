-- Queer Atlas: profile memories (public profile gallery)
-- Safe to run multiple times.

begin;

create table if not exists public.qa_member_profile_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  storage_path text,
  created_at timestamptz not null default now()
);

create index if not exists qa_member_profile_memories_user_created_idx
  on public.qa_member_profile_memories (user_id, created_at desc);

alter table public.qa_member_profile_memories enable row level security;

-- Read own rows.
drop policy if exists "qa_member_profile_memories_select_own" on public.qa_member_profile_memories;
create policy "qa_member_profile_memories_select_own"
  on public.qa_member_profile_memories
  for select
  using (auth.uid() = user_id);

-- Insert own rows.
drop policy if exists "qa_member_profile_memories_insert_own" on public.qa_member_profile_memories;
create policy "qa_member_profile_memories_insert_own"
  on public.qa_member_profile_memories
  for insert
  with check (auth.uid() = user_id);

-- Delete own rows.
drop policy if exists "qa_member_profile_memories_delete_own" on public.qa_member_profile_memories;
create policy "qa_member_profile_memories_delete_own"
  on public.qa_member_profile_memories
  for delete
  using (auth.uid() = user_id);

commit;
