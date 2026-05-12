-- Queer Atlas: public/member profile read policies for cross-member profile view
-- Safe to run multiple times.

begin;

-- 1) member_profiles visibility-based read policy
alter table if exists public.member_profiles enable row level security;

drop policy if exists "member_profiles_select_visible_to_members" on public.member_profiles;
create policy "member_profiles_select_visible_to_members"
  on public.member_profiles
  for select
  using (
    auth.uid() is not null
    and (
      auth.uid() = user_id
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
    )
  );

-- 2) qa_member_profile_memories visibility-based read policy
alter table if exists public.qa_member_profile_memories enable row level security;

drop policy if exists "qa_member_profile_memories_select_own" on public.qa_member_profile_memories;
drop policy if exists "qa_member_profile_memories_select_visible_to_members" on public.qa_member_profile_memories;
create policy "qa_member_profile_memories_select_visible_to_members"
  on public.qa_member_profile_memories
  for select
  using (
    auth.uid() is not null
    and (
      auth.uid() = user_id
      or exists (
        select 1
        from public.member_profiles mp
        where mp.user_id = qa_member_profile_memories.user_id
          and (
            coalesce(mp.visibility, 'members') in ('members', 'public')
            or (
              coalesce(mp.visibility, 'members') = 'friends'
              and exists (
                select 1
                from public.member_following mf
                where mf.follower_user_id = auth.uid()
                  and mf.followed_user_id = mp.user_id
              )
            )
          )
      )
    )
  );

commit;
