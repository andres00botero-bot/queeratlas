-- Queer Atlas: Live vibe one-tap signals for venues
-- Safe to run multiple times.

begin;

create table if not exists public.qa_place_vibe_signals (
  id bigserial primary key,
  place_id bigint not null references public.places(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  signal_key text not null check (signal_key in ('packed', 'dancing', 'dead', 'off_vibe')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint qa_place_vibe_signals_place_user_key unique (place_id, user_id)
);

create index if not exists qa_place_vibe_signals_place_created_idx
  on public.qa_place_vibe_signals (place_id, created_at desc);

create index if not exists qa_place_vibe_signals_created_idx
  on public.qa_place_vibe_signals (created_at desc);

do $$
begin
  if exists (
    select 1
    from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname = 'qa_touch_updated_at'
  ) then
    if not exists (
      select 1
      from pg_trigger
      where tgname = 'qa_place_vibe_signals_touch_updated_at'
    ) then
      create trigger qa_place_vibe_signals_touch_updated_at
      before update on public.qa_place_vibe_signals
      for each row execute function public.qa_touch_updated_at();
    end if;
  end if;
end;
$$;

alter table public.qa_place_vibe_signals enable row level security;

drop policy if exists qa_place_vibe_signals_select_public on public.qa_place_vibe_signals;
create policy qa_place_vibe_signals_select_public
on public.qa_place_vibe_signals
for select
to anon, authenticated
using (true);

drop policy if exists qa_place_vibe_signals_insert_self on public.qa_place_vibe_signals;
create policy qa_place_vibe_signals_insert_self
on public.qa_place_vibe_signals
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists qa_place_vibe_signals_update_self on public.qa_place_vibe_signals;
create policy qa_place_vibe_signals_update_self
on public.qa_place_vibe_signals
for update
to authenticated
using (user_id = auth.uid() or public.qa_is_admin())
with check (user_id = auth.uid() or public.qa_is_admin());

drop policy if exists qa_place_vibe_signals_delete_admin on public.qa_place_vibe_signals;
create policy qa_place_vibe_signals_delete_admin
on public.qa_place_vibe_signals
for delete
to authenticated
using (public.qa_is_admin());

commit;
