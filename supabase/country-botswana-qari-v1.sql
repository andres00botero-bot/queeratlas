-- Queer Atlas: Botswana country rights + QARI profile.
-- Sources reviewed 2026-08-28. Run before city-batch-gaborone-v1.sql.

begin;

insert into public.qa_country_rights_profiles (
  country,legal_level,rights_level,safety_level,
  same_sex_relations_status,union_status,legal_gender_recognition_status,
  anti_discrimination_status,what_this_means,confidence,
  source_legal_url,source_rights_url,source_safety_url,source_checked_at,
  needs_manual_review
) values (
  'Botswana','mixed','risk','risk',
  'legal','no_protection','available','partial_coverage',
  'Consensual same-sex intimacy is legal: the High Court decriminalised it in 2019, the Court of Appeal upheld that result in 2021, and Botswana formally removed the offending Penal Code text in March 2026. A 2017 High Court judgment established a route to legal gender-marker correction, and employment law includes sexual-orientation protection, but same-sex marriage and civil unions are not recognised and comprehensive protection across housing, services and public life remains incomplete. Gaborone has an established LGBTQ+ organisation and some welcoming mixed venues, yet visible queer and especially trans travellers can still meet stigma. Keep public affection measured outside trusted settings, use direct transport after late nightlife, avoid isolated cruising, and arrange app meetings first in a staffed public venue.',
  'high',
  'https://www.unaids.org/en/resources/presscentre/pressreleaseandstatementarchive/2026/april/20260430_PS_Botswana_repealing_anti-LGBTQ_law',
  'https://legabibo.org.bw/wp-content/uploads/2025/10/SWS-Report_Print-Ready-Version-1.pdf',
  'https://www.gov.uk/foreign-travel-advice/botswana/safety-and-security',
  date '2026-08-28',false
)
on conflict(country) do update set
  legal_level=excluded.legal_level,
  rights_level=excluded.rights_level,
  safety_level=excluded.safety_level,
  same_sex_relations_status=excluded.same_sex_relations_status,
  union_status=excluded.union_status,
  legal_gender_recognition_status=excluded.legal_gender_recognition_status,
  anti_discrimination_status=excluded.anti_discrimination_status,
  what_this_means=excluded.what_this_means,
  confidence=excluded.confidence,
  source_legal_url=excluded.source_legal_url,
  source_rights_url=excluded.source_rights_url,
  source_safety_url=excluded.source_safety_url,
  source_checked_at=excluded.source_checked_at,
  needs_manual_review=excluded.needs_manual_review,
  updated_at=now();

insert into public.qa_qari_profiles (
  destination_key,scope_type,country,city_key,
  legal_risk,social_risk,digital_risk,risk_floor,
  confidence,summary,methodology_version,reviewed_by,reviewed_at,is_published
) values (
  'country:botswana','country','Botswana',null,
  44,58,40,0,
  'medium',
  'Botswana now has a clear legal baseline for consensual same-sex intimacy and a court-backed gender-recognition route, but no same-sex union recognition and incomplete nationwide protection. Gaborone is the country''s strongest community base; social stigma, uneven treatment of visibly queer or trans people, late-night transport and new digital-law privacy concerns still require deliberate planning.',
  '1.1','Queer Atlas multi-source editorial review',date '2026-08-28',true
)
on conflict(destination_key) do update set
  scope_type=excluded.scope_type,
  country=excluded.country,
  city_key=excluded.city_key,
  legal_risk=excluded.legal_risk,
  social_risk=excluded.social_risk,
  digital_risk=excluded.digital_risk,
  risk_floor=excluded.risk_floor,
  confidence=excluded.confidence,
  summary=excluded.summary,
  methodology_version=excluded.methodology_version,
  reviewed_by=excluded.reviewed_by,
  reviewed_at=excluded.reviewed_at,
  is_published=excluded.is_published,
  updated_at=now();

delete from public.qa_qari_sources where destination_key='country:botswana';

insert into public.qa_qari_sources (
  destination_key,axis,source_type,label,url,supports_claim,published_at,checked_at
) values
('country:botswana','legal','ngo_report','UNAIDS: Botswana formally repeals anti-LGBTQ+ provisions','https://www.unaids.org/en/resources/presscentre/pressreleaseandstatementarchive/2026/april/20260430_PS_Botswana_repealing_anti-LGBTQ_law','Confirms the March 2026 formal Penal Code amendment after the 2019 and 2021 judgments.',date '2026-05-04',date '2026-08-28'),
('country:botswana','legal','government','Botswana government statement on same-sex law and marriage review','https://dailynews.gov.bw/news-detail/90873','Confirms consensual same-sex intimacy is not an offence and that marriage-law review remains unresolved.',date '2026-04-06',date '2026-08-28'),
('country:botswana','social','official_statistics','Afrobarometer public opinion and tolerance of homosexuality','https://www.afrobarometer.org/articles/public-opinion-and-tolerance-of-homosexuality/','Reports Botswana at 50 percent tolerance in the 2019-2021 cross-country neighbour measure.',date '2023-05-19',date '2026-08-28'),
('country:botswana','social','ngo_report','LEGABIBO Sexuality and Wellbeing Study','https://legabibo.org.bw/wp-content/uploads/2025/10/SWS-Report_Print-Ready-Version-1.pdf','Documents lived wellbeing, discrimination and service-access conditions for LGBTQI+ people in Botswana.',null,date '2026-08-28'),
('country:botswana','digital','ngo_report','Amnesty International Botswana 2025 report','https://www.amnesty.org/en/location/africa/southern-africa/botswana/report-botswana/','Finds that the Digital Services and Cybersecurity Acts centralise control without robust privacy safeguards.',null,date '2026-08-28'),
('country:botswana','methodology','ngo_report','Freedom House: Botswana Freedom in the World 2026','https://freedomhouse.org/country/botswana/freedom-world/2026','Provides the disclosed civic-freedom proxy and records continuing discrimination affecting LGBT+ people.',null,date '2026-08-28');

commit;

select p.destination_key,p.country,p.legal_risk,p.social_risk,p.digital_risk,
       p.qari_score,p.confidence,p.reviewed_at,p.is_published,
       (select count(*) from public.qa_qari_sources s where s.destination_key=p.destination_key) as source_count
from public.qa_qari_profiles p
where p.destination_key='country:botswana';
