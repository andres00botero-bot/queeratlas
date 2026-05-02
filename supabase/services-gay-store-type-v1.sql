-- Queer Atlas: extend services type taxonomy with gay_store
-- Safe to run multiple times.

begin;

alter table if exists public.services
  drop constraint if exists qa_services_type_allowed;

alter table if exists public.services
  add constraint qa_services_type_allowed
  check (
    type = any (
      array[
        'massage',
        'tour',
        'wellness',
        'gay_store',
        'escort',
        'styling',
        'concierge',
        'transport',
        'other'
      ]::text[]
    )
  );

commit;
