-- Queer Atlas: consolidate member_profiles SELECT policies
-- Goal: reduce overlapping PERMISSIVE policies while preserving behavior.
-- Safe to run multiple times.

begin;

alter table if exists public.member_profiles enable row level security;

drop policy if exists "member_profiles_select_own" on public.member_profiles;
drop policy if exists "qa_member_profiles_select_own_or_admin" on public.member_profiles;
drop policy if exists "qa_member_profiles_select_own_v1" on public.member_profiles;
drop policy if exists "qa_select_own_or_admin" on public.member_profiles;
drop policy if exists "member_profiles_select_visible_to_members" on public.member_profiles;
drop policy if exists "member_profiles_select_visible_v2" on public.member_profiles;

create policy "member_profiles_select_visible_v2"
  on public.member_profiles
  for select
  to authenticated
  using (
    qa_is_admin()
    or auth.uid() = user_id
    or coalesce(visibility, 'members') in ('members', 'public')
    or (
      coalesce(visibility, 'members') = 'friends'
      and exists (
        select 1
        from public.member_following mf
        where mf.follower_user_id = auth.uid()
          and mf.followed_user_id = member_profiles.user_id
      )
    )
  );

commit;
