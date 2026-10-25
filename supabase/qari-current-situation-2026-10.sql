-- QARI current-situation review · 25 October 2026
-- Apply after qari-phase0-phase1-v1.sql and qari-country-profiles-2026.sql.

begin;

insert into public.qa_qari_profiles (
  destination_key, scope_type, country, city_key,
  legal_risk, social_risk, digital_risk, risk_floor,
  confidence, summary, methodology_version, reviewed_by, reviewed_at, is_published
)
values
  ('country:russia', 'country', 'Russia', null, 92, 90, 96, 80, 'high', 'Extremism and so-called propaganda rules create extreme legal, public-expression and digital exposure. Recent raids and reported plans for an LGBTI registry make venue, organisational and personal-data exposure especially dangerous.', '1.1-editorial-current', 'Queer Atlas editorial review', date '2026-10-25', true),
  ('country:egypt', 'country', 'Egypt', null, 86, 85, 92, 72, 'high', 'De facto criminalisation, morality-law prosecutions and documented digital entrapment make identity exposure and digital traces serious practical risks.', '1.1-editorial-current', 'Queer Atlas editorial review', date '2026-10-25', true),
  ('country:kazakhstan', 'country', 'Kazakhstan', null, 65, 88, 85, 80, 'high', 'Same-sex relations are legal, but the 2026 law restricting information on so-called non-traditional sexual orientations, absent protections and very low reported acceptance make public, organisational and digital visibility high-risk.', '1.1-editorial-current', 'Queer Atlas editorial review', date '2026-10-25', true),
  ('country:turkey', 'country', 'Turkey', null, 68, 78, 85, 0, 'high', 'Same-sex relations remain legal, but the September 2026 nationwide raids, detentions and online blocking targeting LGBTI groups sharply increase current public, organisational and digital exposure.', '1.1-editorial-current', 'Queer Atlas editorial review', date '2026-10-25', true),
  ('country:china', 'country', 'China', null, 62, 48, 92, 0, 'high', 'Same-sex relations are legal, but nationwide restrictions on LGBTI expression and association, alongside acute online censorship and surveillance, make public queer venue and community data high-risk.', '1.1-editorial-current', 'Queer Atlas editorial review', date '2026-10-25', true),
  ('country:malaysia', 'country', 'Malaysia', null, 90, 66, 68, 80, 'high', 'Criminalisation and state-sponsored discrimination remain severe. Recent raids, including against a Kuala Lumpur gym and sauna, make venue, identity and digital exposure high-risk despite the legal-risk floor already setting the score at 80.', '1.1-editorial-current', 'Queer Atlas editorial review', date '2026-10-25', true)
on conflict (destination_key) do update set
  legal_risk = excluded.legal_risk,
  social_risk = excluded.social_risk,
  digital_risk = excluded.digital_risk,
  risk_floor = excluded.risk_floor,
  confidence = excluded.confidence,
  summary = excluded.summary,
  methodology_version = excluded.methodology_version,
  reviewed_by = excluded.reviewed_by,
  reviewed_at = excluded.reviewed_at,
  is_published = excluded.is_published;

delete from public.qa_qari_sources
where destination_key in ('country:russia', 'country:egypt', 'country:kazakhstan', 'country:turkey', 'country:china', 'country:malaysia');

insert into public.qa_qari_sources (destination_key, axis, source_type, label, url, supports_claim, published_at, checked_at)
values
  ('country:russia', 'legal', 'legal_database', 'ILGA World legal database', 'https://database.ilga.org/', 'Documents the current legal restrictions affecting LGBTI people in Russia.', null, date '2026-10-25'),
  ('country:russia', 'social', 'ngo_report', 'ILGA-Europe · Russia annual review 2026', 'https://rainbowmap.ilga-europe.org/countries/russia/', 'Documents raids and the current social and enforcement environment.', date '2026-02-01', date '2026-10-25'),
  ('country:russia', 'digital', 'ngo_report', 'ILGA-Europe · Russia annual review 2026', 'https://rainbowmap.ilga-europe.org/countries/russia/', 'Documents reported registry and digital exposure risks.', date '2026-02-01', date '2026-10-25'),
  ('country:egypt', 'legal', 'legal_database', 'ILGA World · Laws on Us', 'https://ilga.org/laws-on-us-report/', 'Documents de facto criminalisation and morality-law enforcement.', date '2024-05-30', date '2026-10-25'),
  ('country:egypt', 'social', 'ngo_report', 'Human Rights Watch · Digital Targeting', 'https://www.hrw.org/report/2023/02/21/all-terror-because-photo/digital-targeting-and-its-offline-consequences-lgbt', 'Documents persecution and offline harm connected to identity exposure.', date '2023-02-21', date '2026-10-25'),
  ('country:egypt', 'digital', 'ngo_report', 'Human Rights Watch · Digital Targeting', 'https://www.hrw.org/report/2023/02/21/all-terror-because-photo/digital-targeting-and-its-offline-consequences-lgbt', 'Documents online entrapment and digital evidence used in prosecutions.', date '2023-02-21', date '2026-10-25'),
  ('country:kazakhstan', 'legal', 'legal_database', 'ILGA World · Kazakhstan legal database', 'https://database.ilga.org/kazakhstan-lgbti', 'Documents the 2026 restrictions on LGBTI expression and media.', null, date '2026-10-25'),
  ('country:kazakhstan', 'social', 'ngo_report', 'Equaldex · Kazakhstan public opinion', 'https://www.equaldex.com/region/kazakhstan', 'Provides the available public-attitude context for Kazakhstan.', null, date '2026-10-25'),
  ('country:kazakhstan', 'digital', 'ngo_report', 'Human Rights Watch · World Report 2026', 'https://www.hrw.org/world-report/2026/country-chapters/kazakhstan', 'Documents the current civic and digital enforcement environment.', date '2026-01-15', date '2026-10-25'),
  ('country:turkey', 'legal', 'legal_database', 'ILGA World · Turkey legal barriers', 'https://database.ilga.org/legal-barriers-freedom-of-expression', 'Documents current legal barriers to LGBTI expression in Turkey.', null, date '2026-10-25'),
  ('country:turkey', 'social', 'ngo_report', 'Amnesty International · Türkiye crackdown, September 2026', 'https://www.amnesty.org/en/latest/news/2026/09/turkiye-authorities-must-end-escalating-crackdown-on-lgbti-rights-groups-and-immediately-release-detained-activists/', 'Documents nationwide raids, detentions and targeting of LGBTI groups.', date '2026-09-15', date '2026-10-25'),
  ('country:turkey', 'digital', 'ngo_report', 'Amnesty International · Türkiye crackdown, September 2026', 'https://www.amnesty.org/en/latest/news/2026/09/turkiye-authorities-must-end-escalating-crackdown-on-lgbti-rights-groups-and-immediately-release-detained-activists/', 'Documents blocking and restriction of LGBTI accounts and websites.', date '2026-09-15', date '2026-10-25'),
  ('country:china', 'legal', 'legal_database', 'ILGA World · China legal database', 'https://database.ilga.org/china-lgbti', 'Documents nationwide restrictions on LGBTI expression and association.', null, date '2026-10-25'),
  ('country:china', 'social', 'ngo_report', 'Human Rights Watch · China, June 2026', 'https://www.hrw.org/news/2026/06/25/china-social-media-films-censored-around-pride-month', 'Documents current restrictions on LGBTI events and community activity.', date '2026-06-25', date '2026-10-25'),
  ('country:china', 'digital', 'ngo_report', 'Human Rights Watch · China, June 2026', 'https://www.hrw.org/news/2026/06/25/china-social-media-films-censored-around-pride-month', 'Documents censorship of LGBTI accounts and online expression.', date '2026-06-25', date '2026-10-25'),
  ('country:malaysia', 'legal', 'legal_database', 'ILGA World · Criminalisation database', 'https://database.ilga.org/criminalisation-consensual-same-sex-sexual-acts', 'Documents active criminalisation creating the legal risk floor.', date '2026-07-01', date '2026-10-25'),
  ('country:malaysia', 'social', 'ngo_report', 'Human Rights Watch · Malaysia World Report 2026', 'https://www.hrw.org/world-report/2026/country-chapters/malaysia', 'Documents discrimination and enforcement against LGBTI people.', date '2026-01-15', date '2026-10-25'),
  ('country:malaysia', 'digital', 'ngo_report', 'Human Rights Watch · Malaysia World Report 2026', 'https://www.hrw.org/world-report/2026/country-chapters/malaysia', 'Documents raids and related practical exposure risks in Kuala Lumpur.', date '2026-01-15', date '2026-10-25');

update public.qa_cities city
set qari_score = profile.qari_score,
    qari_summary = profile.summary,
    qari_confidence = profile.confidence,
    updated_at = timezone('utc', now())
from public.qa_qari_profiles profile
where city.qari_destination_key = profile.destination_key
  and profile.destination_key in ('country:russia', 'country:egypt', 'country:kazakhstan', 'country:turkey', 'country:china', 'country:malaysia');

commit;
