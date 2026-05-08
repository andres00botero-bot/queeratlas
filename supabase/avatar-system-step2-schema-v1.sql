-- Avatar system Step 2 (schema only, no app code)
-- Safe to run multiple times.

begin;

-- Guard: member_profiles must exist.
do $$
begin
  if to_regclass('public.member_profiles') is null then
    raise exception 'public.member_profiles does not exist. Run base member profile migration first.';
  end if;
end $$;

-- 1) Add canonical avatar tracking columns.
alter table public.member_profiles
  add column if not exists avatar_path text,
  add column if not exists avatar_version integer not null default 1,
  add column if not exists avatar_updated_at timestamptz;

-- 2) Backfill timestamp for existing avatar rows.
update public.member_profiles
set avatar_updated_at = coalesce(updated_at, now())
where avatar_updated_at is null
  and (
    coalesce(trim(avatar_url), '') <> ''
    or coalesce(trim(avatar_path), '') <> ''
  );

-- 3) Backfill avatar_path from known Supabase public URL format.
-- Expected format:
-- https://<project>.supabase.co/storage/v1/object/public/member-avatars/<path>
update public.member_profiles
set avatar_path = regexp_replace(
  avatar_url,
  '^https?://[^/]+/storage/v1/object/public/member-avatars/',
  ''
)
where coalesce(trim(avatar_path), '') = ''
  and avatar_url ~* '^https?://[^/]+/storage/v1/object/public/member-avatars/.+';

-- 4) Keep avatar_version and avatar_updated_at consistent on avatar updates.
create or replace function public.qa_member_profiles_avatar_sync()
returns trigger
language plpgsql
as $$
declare
  old_url text := coalesce(trim(old.avatar_url), '');
  new_url text := coalesce(trim(new.avatar_url), '');
  old_path text := coalesce(trim(old.avatar_path), '');
  new_path text := coalesce(trim(new.avatar_path), '');
begin
  if tg_op = 'INSERT' then
    if coalesce(new.avatar_version, 0) < 1 then
      new.avatar_version := 1;
    end if;
    if coalesce(new.avatar_updated_at, 'epoch'::timestamptz) = 'epoch'::timestamptz
      and (new_url <> '' or new_path <> '') then
      new.avatar_updated_at := coalesce(new.updated_at, now());
    end if;
    return new;
  end if;

  if old_url is distinct from new_url or old_path is distinct from new_path then
    new.avatar_version := greatest(coalesce(old.avatar_version, 1) + 1, 1);
    new.avatar_updated_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists qa_member_profiles_avatar_sync on public.member_profiles;
create trigger qa_member_profiles_avatar_sync
before insert or update on public.member_profiles
for each row
execute function public.qa_member_profiles_avatar_sync();

-- 5) Ensure admin alias is stable.
update public.member_profiles mp
set
  display_name = 'Admin',
  updated_at = now()
where mp.user_id in (
  select u.id
  from auth.users u
  where lower(coalesce(u.email, '')) = 'andres00botero@gmail.com'
);

-- 6) Helpful index for recency/debug lists.
create index if not exists member_profiles_avatar_updated_at_idx
  on public.member_profiles (avatar_updated_at desc nulls last);

commit;
