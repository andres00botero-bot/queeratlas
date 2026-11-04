-- Queer Atlas: guaranteed private profile and consent-led member onboarding.
-- Run once in Supabase SQL Editor after member-privacy-v1.sql.
-- Safe to re-run. New accounts always receive private profile rows. Existing
-- accounts are backfilled without deriving an alias from their email address.

begin;

do $$
begin
  if to_regclass('public.member_profiles') is null then
    raise exception 'public.member_profiles is required before member-profile-onboarding-v1.sql';
  end if;
  if to_regclass('public.qa_member_privacy') is null then
    raise exception 'public.qa_member_privacy is required; run member-privacy-v1.sql first';
  end if;
end $$;

create or replace function public.qa_create_private_member_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  requested_alias text := left(trim(coalesce(new.raw_user_meta_data ->> 'qa_alias', new.raw_user_meta_data ->> 'display_name', '')), 40);
begin
  -- An email address is never a fallback alias and aliases cannot contain a
  -- control character or @ sign.
  if requested_alias ~ '[@[:cntrl:]]' then
    requested_alias := '';
  end if;

  insert into public.member_profiles (user_id, display_name, visibility)
  values (new.id, nullif(requested_alias, ''), 'hidden')
  on conflict (user_id) do nothing;

  insert into public.qa_member_privacy (user_id, audience, alias)
  values (new.id, 'hidden', requested_alias)
  on conflict (user_id) do update
    set alias = case
      when length(trim(public.qa_member_privacy.alias)) = 0 and excluded.alias <> '' then excluded.alias
      else public.qa_member_privacy.alias
    end,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists qa_create_private_member_profile_on_auth_user on auth.users;
create trigger qa_create_private_member_profile_on_auth_user
  after insert on auth.users
  for each row execute function public.qa_create_private_member_profile();

-- Repair older accounts. The profile remains hidden, and accounts with no
-- existing alias are deliberately marked as incomplete rather than exposing
-- their email or inventing an identity.
insert into public.member_profiles (user_id, display_name, visibility)
select u.id, nullif(left(trim(coalesce(u.raw_user_meta_data ->> 'qa_alias', u.raw_user_meta_data ->> 'display_name', '')), 40), ''), 'hidden'
from auth.users u
on conflict (user_id) do nothing;

insert into public.qa_member_privacy (user_id, audience, alias)
select
  u.id,
  'hidden',
  case
    when coalesce(u.raw_user_meta_data ->> 'qa_alias', u.raw_user_meta_data ->> 'display_name', '') ~ '[@[:cntrl:]]' then ''
    else left(trim(coalesce(u.raw_user_meta_data ->> 'qa_alias', u.raw_user_meta_data ->> 'display_name', '')), 40)
  end
from auth.users u
on conflict (user_id) do nothing;

update public.qa_member_privacy privacy
set alias = left(trim(profile.display_name), 40), updated_at = now()
from public.member_profiles profile
where privacy.user_id = profile.user_id
  and length(trim(privacy.alias)) = 0
  and length(trim(coalesce(profile.display_name, ''))) >= 2
  and profile.display_name !~ '[@[:cntrl:]]';

-- A contactable/community member must have deliberately supplied a safe alias.
create or replace function public.qa_privacy_join(adult_confirmed boolean, rules_accepted boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null or adult_confirmed is not true or rules_accepted is not true then raise exception 'consent_required'; end if;
  if not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null)
    then raise exception 'confirmed_email_required'; end if;
  insert into qa_member_privacy(user_id) values(auth.uid()) on conflict do nothing;
  if exists(select 1 from qa_member_privacy where user_id=auth.uid() and deletion_requested_at is not null)
    then raise exception 'deletion_pending'; end if;
  if not exists(select 1 from qa_member_privacy where user_id=auth.uid()
    and length(trim(alias)) >= 2 and alias !~ '[@[:cntrl:]]') then raise exception 'alias_required'; end if;
  update qa_member_privacy set adult_confirmed_at=now(),rules_version=1,joined_at=coalesce(joined_at,now()) where user_id=auth.uid();
  return qa_privacy_state();
end $$;

revoke all on function public.qa_create_private_member_profile() from public, anon, authenticated;
grant execute on function public.qa_privacy_join(boolean, boolean) to authenticated;

commit;
