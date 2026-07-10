-- Queer Atlas: El Salvador country rights and safety profile
-- Scope: make the Cities country safety layer recognize El Salvador for San Salvador.
-- Sources checked 2026-07-10:
-- - Equaldex El Salvador: https://www.equaldex.com/region/el-salvador
-- - Human Rights Watch on trans rights in El Salvador:
--   https://www.hrw.org/news/2022/07/18/el-salvador-transgender-people-denied-equal-rights
-- - U.S. Department of State El Salvador country information:
--   https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/ElSalvador.html

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
  'El Salvador',
  'good',
  'risk',
  'mixed',
  'legal',
  'no_protection',
  'restricted',
  'partial_coverage',
  'Same-sex relations are legal and LGBTQ events are not legally restricted, but same-sex unions are not recognized, LGBTQ topics face state-enforced education censorship, legal gender recognition remains limited, and protections are uneven. San Salvador is the main practical base, but travelers should use direct rides, avoid public buses, keep public affection measured, and follow trusted local community updates.',
  'high',
  'https://www.equaldex.com/region/el-salvador',
  'https://www.hrw.org/news/2022/07/18/el-salvador-transgender-people-denied-equal-rights',
  'https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/ElSalvador.html',
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
