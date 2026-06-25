-- Queer Atlas: extend moderation queue for Atlas Collection suggestions
-- Run after content-submissions-v2-community-story.sql

begin;

alter table if exists public.qa_content_submissions
  drop constraint if exists qa_content_submissions_entity_type_check;

alter table if exists public.qa_content_submissions
  add constraint qa_content_submissions_entity_type_check
  check (entity_type in ('place', 'event', 'service', 'community_story', 'collection_nomination'));

create index if not exists qa_content_submissions_collection_nomination_idx
  on public.qa_content_submissions (status, created_at desc)
  where entity_type = 'collection_nomination';

commit;
