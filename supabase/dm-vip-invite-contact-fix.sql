begin;

create or replace function public.qa_can_open_dm(target_user_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  has_vip_tables boolean := (
    to_regclass('public.qa_private_events') is not null
    and to_regclass('public.qa_private_event_invites') is not null
  );
begin
  if uid is null or target_user_id is null or uid = target_user_id then
    return false;
  end if;

  if public.qa_is_admin() then
    return true;
  end if;

  if has_vip_tables and exists (
    select 1
    from public.qa_private_event_invites i
    join public.qa_private_events e on e.id = i.event_id
    where i.status = 'accepted'
      and (
        (i.requester_user_id = uid and e.host_user_id = target_user_id)
        or (i.requester_user_id = target_user_id and e.host_user_id = uid)
      )
  ) then
    return true;
  end if;

  return exists (
    select 1
    from public.member_following mf
    where
      (mf.follower_user_id = uid and mf.followed_user_id = target_user_id)
      or (mf.follower_user_id = target_user_id and mf.followed_user_id = uid)
  );
end;
$$;

commit;

