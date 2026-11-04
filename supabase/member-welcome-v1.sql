-- Queer Atlas: one-time welcome after a member has completed privacy onboarding.
-- Run after member-privacy-v1.sql and member-profile-onboarding-v1.sql.
-- The status lives with the account, never only in browser storage.

begin;

alter table public.qa_member_privacy
  add column if not exists welcome_seen_at timestamptz;

-- This feature welcomes new members, not every person who joined before it
-- existed. Their existing membership remains untouched.
update public.qa_member_privacy
  set welcome_seen_at=now(),updated_at=now()
  where joined_at is not null and welcome_seen_at is null;

create or replace function public.qa_privacy_dismiss_welcome()
returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if not exists(
    select 1 from qa_member_privacy
    where user_id=auth.uid() and joined_at is not null and deletion_requested_at is null
  ) then raise exception 'onboarding_incomplete'; end if;
  update qa_member_privacy
    set welcome_seen_at=coalesce(welcome_seen_at,now()),updated_at=now()
    where user_id=auth.uid();
  return qa_privacy_state();
end $$;

revoke all on function public.qa_privacy_dismiss_welcome() from public, anon;
grant execute on function public.qa_privacy_dismiss_welcome() to authenticated;

commit;
