-- Queer Atlas: extend moderation queue for Voices from members
-- Run after content-submissions-v1.sql

begin;

alter table if exists public.qa_content_submissions
  drop constraint if exists qa_content_submissions_entity_type_check;

alter table if exists public.qa_content_submissions
  add constraint qa_content_submissions_entity_type_check
  check (entity_type in ('place', 'event', 'service', 'community_story'));

create index if not exists qa_content_submissions_entity_status_idx
  on public.qa_content_submissions (entity_type, status, created_at desc);

commit;
