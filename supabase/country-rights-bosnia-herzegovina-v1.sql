-- Queer Atlas: country rights profile for Bosnia and Herzegovina
-- Verified 2026-06-16.
-- Safe to run multiple times.

insert into public.qa_country_rights_profiles (
  country,
  legal_level,
  rights_level,
  safety_level,
  same_sex_relations_status,
  union_status,
  legal_gender_recognition_status,
  anti_discrimination_status,
  what_this_means,
  confidence,
  source_legal_url,
  source_rights_url,
  source_safety_url,
  source_checked_at,
  needs_manual_review
)
values (
  'Bosnia and Herzegovina',
  'good',
  'risk',
  'mixed',
  'legal',
  'no_protection',
  'restricted',
  'full_coverage',
  'Same-sex relations are legal and anti-discrimination law includes sexual orientation, gender identity and sex characteristics, but same-sex couples still have no marriage, partnership or family-law recognition. Sarajevo has visible Pride and community infrastructure, while public comfort and late-night safety remain context-dependent.',
  'high',
  'https://rainbowmap.ilga-europe.org/',
  'https://rainbowmap.ilga-europe.org/',
  'https://soc.ba/',
  current_date,
  false
)
on conflict (country) do update set
  legal_level = excluded.legal_level,
  rights_level = excluded.rights_level,
  safety_level = excluded.safety_level,
  same_sex_relations_status = excluded.same_sex_relations_status,
  union_status = excluded.union_status,
  legal_gender_recognition_status = excluded.legal_gender_recognition_status,
  anti_discrimination_status = excluded.anti_discrimination_status,
  what_this_means = excluded.what_this_means,
  confidence = excluded.confidence,
  source_legal_url = excluded.source_legal_url,
  source_rights_url = excluded.source_rights_url,
  source_safety_url = excluded.source_safety_url,
  source_checked_at = excluded.source_checked_at,
  needs_manual_review = excluded.needs_manual_review,
  updated_at = now();
