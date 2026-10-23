-- Synthetic identities only. The inner exception block rolls back every fixture,
-- role change and temporary gate change before this statement completes.
-- Never replace the deliberate ZQ001 exception with COMMIT.
do $$
declare a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); c uuid:=gen_random_uuid(); p jsonb;
begin
  if (select directory_open from public.qa_privacy_rollout where id) then
    raise exception 'Run this verification with rollout closed';
  end if;
  begin
    insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data)
    values(a,'privacy-a-'||a||'@example.invalid',now(),'{}'),
      (b,'privacy-b-'||b||'@example.invalid',now(),'{}'),
      (c,'privacy-c-'||c||'@example.invalid',now(),'{}');
    insert into public.member_profiles(user_id,display_name,avatar_path)
    values(a,'Synthetic A',a||'/avatar.webp'),(b,'Synthetic B',b||'/avatar.webp'),(c,'Synthetic C',c||'/avatar.webp')
    on conflict(user_id) do update set avatar_path=excluded.avatar_path;
    execute 'set local role authenticated';
    perform set_config('request.jwt.claim.sub',a::text,true);
    p:=public.qa_privacy_state();
    if p->'profile'->>'audience'<>'hidden' or (p->>'eligible')::boolean then raise exception 'Hidden default / closed rollout failed'; end if;
    if (select count(*) from public.member_profiles where user_id in(a,b,c))<>1 then raise exception 'Raw profile RLS failed'; end if;
    perform public.qa_privacy_join(true,true);
    execute 'reset role';
    update public.qa_privacy_rollout set directory_open=true where id=true;
    execute 'set local role authenticated';
    perform set_config('request.jwt.claim.sub',b::text,true);
    perform public.qa_privacy_join(true,true);
    perform public.qa_privacy_save('{"audience":"community","alias":"PrivacySQLFixture B","share_avatar":true}'::jsonb);
    perform set_config('request.jwt.claim.sub',c::text,true);
    perform public.qa_privacy_join(true,true);
    perform set_config('request.jwt.claim.sub',a::text,true);
    perform public.qa_privacy_save('{"audience":"hidden","alias":"PrivacySQLFixture A"}'::jsonb);
    p:=public.qa_privacy_profile(b);
    if p->>'alias'<>'PrivacySQLFixture B' or p ? 'phone' or p ? 'home_city' then raise exception 'Projection failed'; end if;
    if not public.qa_privacy_avatar_read(b||'/avatar.webp') or public.qa_privacy_avatar_read(b||'/memories/private.webp') then raise exception 'Image isolation failed'; end if;
    perform public.qa_privacy_contact(b,'request');
    perform set_config('request.jwt.claim.sub',b::text,true);
    perform public.qa_privacy_contact(a,'accept');
    perform public.qa_privacy_save('{"audience":"contacts","alias":"PrivacySQLFixture B","share_avatar":true}'::jsonb);
    perform set_config('request.jwt.claim.sub',c::text,true);
    if public.qa_privacy_profile(b) is not null then raise exception 'Unapproved profile access'; end if;
    perform set_config('request.jwt.claim.sub',a::text,true);
    if public.qa_privacy_profile(b) is null then raise exception 'Approved profile denied'; end if;
    perform public.qa_privacy_send(b,'Synthetic transaction test');
    if (select count(*) from public.qa_privacy_messages(b))<>1 then raise exception 'Approved message failed'; end if;
    perform public.qa_privacy_block(b,true);
    if public.qa_privacy_profile(b) is not null or public.qa_privacy_avatar_read(b||'/avatar.webp') then raise exception 'Blocking failed'; end if;
    perform set_config('request.jwt.claim.sub',b::text,true);
    if public.qa_privacy_profile(a) is not null then raise exception 'Reverse blocking failed'; end if;
    if exists(select 1 from public.qa_dm_messages where sender_id in(a,b)) then raise exception 'Blocked raw message access'; end if;
    perform public.qa_privacy_request_deletion();
    perform set_config('request.jwt.claim.sub',c::text,true);
    if public.qa_privacy_profile(b) is not null then raise exception 'Deletion visibility failed'; end if;
    raise exception using errcode='ZQ001',message='Fixtures passed; roll them back';
  exception when sqlstate 'ZQ001' then null;
  end;
end $$;
select 'PASS: synthetic profiles, RLS, contacts, messages, images, blocking and deletion visibility; fixtures rolled back' as verification,
  not directory_open as rollout_still_closed from public.qa_privacy_rollout where id;
