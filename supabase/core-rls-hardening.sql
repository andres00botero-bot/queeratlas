-- Queer Atlas: Core security hardening (RLS + ownership policies + key constraints)
-- Safe to run multiple times.
-- Run in Supabase SQL Editor.

begin;

create table if not exists public.qa_admin_users (
  email text primary key,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create or replace function public.qa_is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  has_admin_table boolean := false;
  is_admin boolean := false;
begin
  has_admin_table := to_regclass('public.qa_admin_users') is not null;
  if not has_admin_table then
    return false;
  end if;

  select exists (
    select 1
    from public.qa_admin_users admin
    where lower(admin.email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
  into is_admin;

  return is_admin;
end;
$$;

grant execute on function public.qa_is_admin() to anon, authenticated;

create or replace function public.qa_apply_content_policies(
  target_table text,
  allow_member_updates boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  t text := target_table;
begin
  execute format('alter table %s enable row level security', t);

  execute format('drop policy if exists qa_read_all on %s', t);
  execute format('create policy qa_read_all on %s for select using (true)', t);

  execute format('drop policy if exists qa_insert_authenticated on %s', t);
  execute format(
    'create policy qa_insert_authenticated on %s for insert to authenticated with check (auth.uid() is not null)',
    t
  );

  execute format('drop policy if exists qa_update_authenticated on %s', t);
  execute format('drop policy if exists qa_update_admin_only on %s', t);

  if allow_member_updates then
    execute format(
      'create policy qa_update_authenticated on %s for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null)',
      t
    );
  else
    execute format(
      'create policy qa_update_admin_only on %s for update to authenticated using (public.qa_is_admin()) with check (public.qa_is_admin())',
      t
    );
  end if;

  execute format('drop policy if exists qa_delete_admin_only on %s', t);
  execute format(
    'create policy qa_delete_admin_only on %s for delete to authenticated using (public.qa_is_admin())',
    t
  );
end;
$$;

create or replace function public.qa_apply_owner_policies(
  target_table text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  t text := target_table;
begin
  execute format('alter table %s enable row level security', t);

  execute format('drop policy if exists qa_select_own_or_admin on %s', t);
  execute format(
    'create policy qa_select_own_or_admin on %s for select to authenticated using (user_id = auth.uid() or public.qa_is_admin())',
    t
  );

  execute format('drop policy if exists qa_insert_own_or_admin on %s', t);
  execute format(
    'create policy qa_insert_own_or_admin on %s for insert to authenticated with check (user_id = auth.uid() or public.qa_is_admin())',
    t
  );

  execute format('drop policy if exists qa_update_own_or_admin on %s', t);
  execute format(
    'create policy qa_update_own_or_admin on %s for update to authenticated using (user_id = auth.uid() or public.qa_is_admin()) with check (user_id = auth.uid() or public.qa_is_admin())',
    t
  );

  execute format('drop policy if exists qa_delete_own_or_admin on %s', t);
  execute format(
    'create policy qa_delete_own_or_admin on %s for delete to authenticated using (user_id = auth.uid() or public.qa_is_admin())',
    t
  );
end;
$$;

do $$
begin
  if to_regclass('public.member_profiles') is not null then
    perform public.qa_apply_owner_policies('public.member_profiles');
  end if;

  if to_regclass('public.member_favorites') is not null then
    -- Remove duplicate rows before adding/ensuring unique key.
    execute '
      delete from public.member_favorites a
      using public.member_favorites b
      where a.ctid < b.ctid
        and a.user_id = b.user_id
        and a.favorite_id = b.favorite_id
    ';

    if not exists (
      select 1
      from pg_constraint
      where conname = 'member_favorites_user_favorite_key'
    ) then
      execute '
        alter table public.member_favorites
        add constraint member_favorites_user_favorite_key unique (user_id, favorite_id)
      ';
    end if;

    if not exists (
      select 1
      from pg_indexes
      where schemaname = 'public'
        and tablename = 'member_favorites'
        and indexname = 'member_favorites_user_id_idx'
    ) then
      execute 'create index member_favorites_user_id_idx on public.member_favorites (user_id)';
    end if;

    perform public.qa_apply_owner_policies('public.member_favorites');
  end if;

  if to_regclass('public.member_plans') is not null then
    -- Remove duplicate rows before adding/ensuring unique key.
    execute '
      delete from public.member_plans a
      using public.member_plans b
      where a.ctid < b.ctid
        and a.user_id = b.user_id
        and a.client_id = b.client_id
    ';

    if not exists (
      select 1
      from pg_constraint
      where conname = 'member_plans_user_client_key'
    ) then
      execute '
        alter table public.member_plans
        add constraint member_plans_user_client_key unique (user_id, client_id)
      ';
    end if;

    if not exists (
      select 1
      from pg_indexes
      where schemaname = 'public'
        and tablename = 'member_plans'
        and indexname = 'member_plans_user_id_idx'
    ) then
      execute 'create index member_plans_user_id_idx on public.member_plans (user_id)';
    end if;

    perform public.qa_apply_owner_policies('public.member_plans');
  end if;

  if to_regclass('public.places') is not null then
    perform public.qa_apply_content_policies('public.places', false);
  end if;

  if to_regclass('public.events') is not null then
    perform public.qa_apply_content_policies('public.events', false);
  end if;

  if to_regclass('public.reviews') is not null then
    perform public.qa_apply_content_policies('public.reviews', false);
  end if;

  if to_regclass('public.global_events') is not null then
    -- Members can update quality metadata from the Events page.
    perform public.qa_apply_content_policies('public.global_events', true);
  end if;

  if to_regclass('public.community_stories') is not null then
    perform public.qa_apply_content_policies('public.community_stories', false);
  end if;

  if to_regclass('public.community_guides') is not null then
    perform public.qa_apply_content_policies('public.community_guides', false);
  end if;

  if to_regclass('public.community_topics') is not null then
    perform public.qa_apply_content_policies('public.community_topics', false);
  end if;

  if to_regclass('public.community_messages') is not null then
    perform public.qa_apply_content_policies('public.community_messages', false);
  end if;

  if to_regclass('public.community_ideas') is not null then
    -- Members can upvote ideas, which updates rows.
    perform public.qa_apply_content_policies('public.community_ideas', true);
  end if;
end;
$$;

commit;
