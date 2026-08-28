-- Queer Atlas: route member guides through the shared editorial moderation queue.
-- Run after content-submissions-v3-atlas-collections.sql.

begin;

alter table if exists public.qa_content_submissions
  drop constraint if exists qa_content_submissions_entity_type_check;

alter table if exists public.qa_content_submissions
  add constraint qa_content_submissions_entity_type_check
  check (entity_type in ('place', 'event', 'service', 'community_story', 'community_guide', 'collection_nomination'));

create index if not exists qa_content_submissions_community_guide_idx
  on public.qa_content_submissions (status, created_at desc)
  where entity_type = 'community_guide';

commit;
