-- Community chat retention policy
-- Goal:
-- 1) Keep only the latest 100 messages per topic in community_messages
-- 2) Archive older messages safely in community_messages_archive
-- Safe to run multiple times.

begin;

-- Archive table for old chat messages.
create table if not exists public.community_messages_archive (
  like public.community_messages including all
);

alter table public.community_messages_archive
  add column if not exists archived_at timestamptz not null default now();

alter table public.community_messages_archive
  add column if not exists archived_reason text not null default 'retention_limit_100';

create index if not exists idx_community_messages_archive_topic_created
  on public.community_messages_archive (topic_id, created_at desc);

create index if not exists idx_community_messages_archive_archived_at
  on public.community_messages_archive (archived_at desc);

-- Trigger function: after each insert, archive overflow for the topic.
create or replace function public.qa_archive_community_messages_overflow()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  with overflow as (
    select m.*
    from public.community_messages m
    where m.topic_id = new.topic_id
    order by m.created_at desc, m.id desc
    offset 100
  ),
  archived as (
    insert into public.community_messages_archive
    select o.*, now() as archived_at, 'retention_limit_100'::text as archived_reason
    from overflow o
    on conflict (id) do nothing
    returning id
  )
  delete from public.community_messages live
  where live.id in (select id from archived);

  return new;
end;
$$;

drop trigger if exists trg_qa_archive_community_messages_overflow on public.community_messages;

create trigger trg_qa_archive_community_messages_overflow
after insert on public.community_messages
for each row
execute function public.qa_archive_community_messages_overflow();

-- One-time backfill: enforce limit for existing data now.
with ranked as (
  select
    m.*,
    row_number() over (
      partition by m.topic_id
      order by m.created_at desc, m.id desc
    ) as rn
  from public.community_messages m
),
overflow as (
  select *
  from ranked
  where rn > 100
),
archived as (
  insert into public.community_messages_archive
  select
    o.id,
    o.topic_id,
    o.author,
    o.text,
    o.created_at,
    now() as archived_at,
    'retention_backfill_100'::text as archived_reason
  from overflow o
  on conflict (id) do nothing
  returning id
)
delete from public.community_messages live
where live.id in (select id from archived);

commit;

