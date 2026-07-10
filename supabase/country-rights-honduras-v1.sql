-- Queer Atlas: Honduras country rights and safety profile
-- Scope: make the Cities country safety layer recognize Honduras for Tegucigalpa.
-- Sources checked 2026-07-10:
-- - Equaldex Honduras: https://www.equaldex.com/region/honduras
-- - Cattrachas Honduras: https://www.cattrachas.org/
-- - U.S. Department of State Honduras travel information:
--   https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Honduras.html

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
  'Honduras',
  'good',
  'risk',
  'risk',
  'legal',
  'no_protection',
  'impossible',
  'partial_coverage',
  'Same-sex relations are legal, but same-sex marriage and civil unions are not recognized, legal gender recognition is not available, and practical safety requires strong caution. Crimes against LGBTI people, impunity concerns, and reports of police harassment mean travelers should keep public affection measured, use direct rides after dark, and rely on trusted community sources.',
  'high',
  'https://www.equaldex.com/region/honduras',
  'https://www.cattrachas.org/',
  'https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Honduras.html',
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
