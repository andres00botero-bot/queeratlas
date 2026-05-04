-- Rights layer v3: remove residual "unknown" where we already have country levels
-- Run after:
-- 1) supabase/country-rights-layer-v1.sql
-- 2) supabase/country-rights-layer-v2-non-europe.sql
--
-- Goal:
-- - Reduce unknown values safely using existing legal_level/rights_level signals.
-- - Apply specific verified overrides for selected countries.

-- Step 1: heuristic fill based on existing levels
update public.qa_country_rights_profiles
set
  same_sex_relations_status = case
    when same_sex_relations_status = 'unknown' and legal_level in ('good', 'mixed') then 'legal'
    when same_sex_relations_status = 'unknown' and legal_level = 'risk' then 'restricted'
    else same_sex_relations_status
  end,
  union_status = case
    when union_status = 'unknown' and rights_level = 'good' then 'marriage'
    when union_status = 'unknown' and rights_level = 'mixed' then 'civil_union_or_partnership'
    when union_status = 'unknown' and rights_level = 'risk' then 'no_protection'
    else union_status
  end,
  legal_gender_recognition_status = case
    when legal_gender_recognition_status = 'unknown' and rights_level = 'good' then 'available'
    when legal_gender_recognition_status = 'unknown' and rights_level in ('mixed', 'risk') then 'restricted'
    else legal_gender_recognition_status
  end,
  anti_discrimination_status = case
    when anti_discrimination_status = 'unknown' and rights_level = 'good' then 'full_coverage'
    when anti_discrimination_status = 'unknown' and rights_level = 'mixed' then 'partial_coverage'
    when anti_discrimination_status = 'unknown' and rights_level = 'risk' then 'limited_or_none'
    else anti_discrimination_status
  end,
  updated_at = now()
where
  same_sex_relations_status = 'unknown'
  or union_status = 'unknown'
  or legal_gender_recognition_status = 'unknown'
  or anti_discrimination_status = 'unknown';

-- Step 2: verified country overrides
update public.qa_country_rights_profiles
set
  same_sex_relations_status = 'legal',
  union_status = 'marriage',
  legal_gender_recognition_status = 'restricted',
  anti_discrimination_status = 'partial_coverage',
  confidence = 'high',
  source_legal_url = 'https://thailand.un.org/en/288067-un-human-rights-office-welcomes-enactment-historic-marriage-equality-law-thailand-legalising',
  source_rights_url = 'https://ilga.org/resources/ilga-world-database-resource/',
  source_safety_url = 'https://ilga.org/ilga-world-maps/',
  source_checked_at = current_date,
  needs_manual_review = false,
  updated_at = now()
where country = 'Thailand';

update public.qa_country_rights_profiles
set
  same_sex_relations_status = 'legal',
  union_status = 'no_protection',
  legal_gender_recognition_status = 'restricted',
  anti_discrimination_status = 'limited_or_none',
  confidence = 'medium',
  source_legal_url = 'https://www.humandignitytrust.org/lgbt-the-law/map-of-criminalisation/',
  source_rights_url = 'https://www.amnesty.org/en/latest/news/2025/09/rejection-of-hong-kong-same-sex-partnerships-bill-blow-for-lgbti-rights/',
  source_safety_url = 'https://www.gmanetwork.com/news/topstories/world/958752/hong-kong-lawmakers-veto-bill-on-same-sex-partnerships/story/',
  source_checked_at = current_date,
  needs_manual_review = false,
  updated_at = now()
where country = 'Hong Kong';

update public.qa_country_rights_profiles
set
  same_sex_relations_status = 'legal',
  union_status = 'no_protection',
  legal_gender_recognition_status = 'restricted',
  anti_discrimination_status = 'limited_or_none',
  confidence = 'medium',
  source_legal_url = 'https://ilga.org/ilga-world-maps/',
  source_rights_url = 'https://ilga.org/resources/ilga-world-database-resource/',
  source_safety_url = 'https://ilga.org/ilga-world-maps/',
  source_checked_at = current_date,
  needs_manual_review = false,
  updated_at = now()
where country = 'Singapore';

update public.qa_country_rights_profiles
set
  same_sex_relations_status = 'legal',
  union_status = 'no_protection',
  legal_gender_recognition_status = 'restricted',
  anti_discrimination_status = 'limited_or_none',
  confidence = 'medium',
  source_legal_url = 'https://ilga.org/ilga-world-maps/',
  source_rights_url = 'https://www.loc.gov/item/global-legal-monitor/2023-10-31/japan-supreme-court-rules-conditioning-change-of-legal-gender-on-surgical-removal-of-reproductive-organs-unconstitutional/',
  source_safety_url = 'https://ilga.org/resources/ilga-world-database-resource/',
  source_checked_at = current_date,
  needs_manual_review = false,
  updated_at = now()
where country = 'Japan';

-- Optional check:
-- select country, same_sex_relations_status, union_status, legal_gender_recognition_status, anti_discrimination_status
-- from public.qa_country_rights_profiles
-- where same_sex_relations_status = 'unknown'
--    or union_status = 'unknown'
--    or legal_gender_recognition_status = 'unknown'
--    or anti_discrimination_status = 'unknown'
-- order by country;
