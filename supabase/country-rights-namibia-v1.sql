-- Queer Atlas: Namibia country rights and practical safety profile
-- Scope: supplies the Queer safety panel for Namibia on /cities.
-- Sources checked 2026-08-15:
-- - Dausab v Minister of Justice, decision summary:
--   https://www.humandignitytrust.org/resources/dausab-v-the-minister-of-justice/
-- - Namibia Marriage Act 2024:
--   https://namiblii.org/akn/na/act/2024/14/eng@2024-12-30
-- - Legal Assistance Centre LGBTQI+ legal resources:
--   https://www.lac.org.na/index.php/projects/gender-research-advocacy-grap/lgbti/
-- - Current Namibia travel and LGBTQI+ context:
--   https://travel.state.gov/en/international-travel/travel-advisories/namibia.html

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
  'Namibia',
  'good',
  'risk',
  'risk',
  'legal',
  'no_protection',
  'restricted',
  'limited_or_none',
  'Consensual same-sex intimacy is legal after the High Court struck down Namibia''s colonial-era offences in June 2024. Same-sex marriages are not recognized under the Marriage Act 2024, legal gender recognition is restricted, and explicit nationwide LGBTQI+ anti-discrimination protection remains limited. Windhoek has visible organisers and verified welcoming spaces, but public comfort varies: follow trusted local hosts, keep affection measured when the setting is unclear, meet app contacts in public, and arrange a direct ride after late events.',
  'high',
  'https://www.humandignitytrust.org/resources/dausab-v-the-minister-of-justice/',
  'https://namiblii.org/akn/na/act/2024/14/eng@2024-12-30',
  'https://travel.state.gov/en/international-travel/travel-advisories/namibia.html',
  '2026-08-15'::date,
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

select
  country,
  legal_level,
  rights_level,
  safety_level,
  same_sex_relations_status,
  union_status,
  legal_gender_recognition_status,
  anti_discrimination_status,
  confidence,
  source_checked_at
from public.qa_country_rights_profiles
where country = 'Namibia';
