-- Queer Atlas: Live RLS Verification
-- Run this in Supabase SQL Editor (production project).
-- This file is read-only checks (no destructive writes).

-- 1) Ensure RLS is enabled for all public tables we care about
with target_tables as (
  select unnest(array[
    'places_with_stats',
    'places',
    'events',
    'global_events',
    'reviews',
    'member_profiles',
    'member_favorites',
    'member_plans',
    'community_stories',
    'community_guides',
    'community_topics',
    'community_messages',
    'community_ideas',
    'qa_world_news',
    'qa_world_news_hidden',
    'qa_atlas_rankings',
    'qa_reports',
    'qa_blocked_items',
    'qa_admin_users'
  ]) as table_name
)
select
  t.table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from target_tables t
left join pg_class c on c.relname = t.table_name
left join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
order by t.table_name;

-- 2) List policies so we can verify anon/authenticated/admin paths table-by-table
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'places_with_stats',
    'places',
    'events',
    'global_events',
    'reviews',
    'member_profiles',
    'member_favorites',
    'member_plans',
    'community_stories',
    'community_guides',
    'community_topics',
    'community_messages',
    'community_ideas',
    'qa_world_news',
    'qa_world_news_hidden',
    'qa_atlas_rankings',
    'qa_reports',
    'qa_blocked_items',
    'qa_admin_users'
  )
order by tablename, cmd, policyname;

-- 3) Check table-level grants (RLS still applies, but grants must also be sane)
select
  table_name,
  grantee,
  string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
  and table_name in (
    'places_with_stats',
    'places',
    'events',
    'global_events',
    'reviews',
    'member_profiles',
    'member_favorites',
    'member_plans',
    'community_stories',
    'community_guides',
    'community_topics',
    'community_messages',
    'community_ideas',
    'qa_world_news',
    'qa_world_news_hidden',
    'qa_atlas_rankings',
    'qa_reports',
    'qa_blocked_items',
    'qa_admin_users'
  )
group by table_name, grantee
order by table_name, grantee;

-- 4) Ensure admin helper exists and check caller context
select
  proname as function_name,
  pg_get_function_identity_arguments(p.oid) as args
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and proname in ('qa_is_admin');

select
  auth.uid() as current_uid,
  auth.role() as current_role;

-- 5) Optional: quick smoke check under anon/authenticated role context.
-- NOTE: may fail depending on SQL Editor privileges; that's okay.
do $$
begin
  begin
    execute 'set local role anon';
    raise notice 'anon role simulation ok';
  exception when others then
    raise notice 'anon role simulation unavailable in this environment';
  end;

  begin
    execute 'set local role authenticated';
    raise notice 'authenticated role simulation ok';
  exception when others then
    raise notice 'authenticated role simulation unavailable in this environment';
  end;
end $$;

-- 6) Manual acceptance checklist (copy to release notes)
-- [ ] anon cannot insert/update/delete in places_with_stats/events/global_events
-- [ ] authenticated non-admin cannot write admin/moderation/news management tables (qa_* tables)
-- [ ] authenticated user can only read/write own member-profile + own plans/items
-- [ ] admin email in qa_admin_users can perform admin-only operations
-- [ ] frontend member-gating aligns with backend policy outcomes
