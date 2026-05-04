-- Queer Atlas city batch v1
-- Cities: bali, jakarta, kuala_lumpur
-- Includes: places + events + country rights updates (Indonesia, Malaysia)
-- Idempotent inserts (dedupe by lower(city)+lower(name))
-- Note: links intentionally limited to official websites / Instagram / Facebook / organization pages.

begin;

with new_places (
  name,
  city,
  type,
  description,
  vibe,
  vibe_tags,
  hours,
  link,
  location,
  lat,
  lng
) as (
  values
    (
      'Stonewall Bali',
      'bali',
      'club',
      'Seminyak LGBTQ+ flagship with drag performances, DJs, and a high-visibility social floor for locals and travelers.',
      'drag-led tropical main room',
      array['drag','mixed']::text[],
      'Daily 11:00-01:00.',
      'https://stonewallbali.com/',
      'Jl. Raya Seminyak No.504, Seminyak, Kec. Kuta, Kabupaten Badung, Bali 80361, Indonesia',
      -8.6928,
      115.1686
    ),
    (
      'BaliJoe Bar',
      'bali',
      'bar',
      'Long-running Seminyak queer bar known for nightly cabaret, drag, and dance-heavy social momentum.',
      'cabaret-and-go-go nightlife classic',
      array['drag','social']::text[],
      'Daily 16:00-03:00.',
      'https://www.balijoebar.com/',
      'Jl. Camplung Tanduk No.8, Seminyak, Kec. Kuta, Kabupaten Badung, Bali 80361, Indonesia',
      -8.6911,
      115.1670
    ),
    (
      'Mixwell Bar',
      'bali',
      'bar',
      'High-turnover gay bar in Seminyak with DJ-driven late nights and recurring drag showcase formats.',
      'late-night drag-pop engine',
      array['drag','pop']::text[],
      'Daily 19:00-03:00.',
      'https://www.facebook.com/mixwellbarbali/',
      'Jalan Camplung Tanduk, Seminyak, Kec. Kuta, Kabupaten Badung, Bali 80361, Indonesia',
      -8.6908,
      115.1666
    ),
    (
      'Seminyak Camplung Tanduk Night Corridor',
      'bali',
      'cafe',
      'Dense queer-social lane connecting Bali''s most active nightlife rooms in one short walkable sequence.',
      'walkable nightlife corridor',
      array['social','mixed']::text[],
      'Most active daily 20:00-03:00.',
      'https://linktr.ee/stonewallbali',
      'Jl. Camplung Tanduk, Seminyak, Kec. Kuta, Kabupaten Badung, Bali, Indonesia',
      -8.6904,
      115.1663
    ),
    (
      'The Yoga Barn (BaliSpirit Hub)',
      'bali',
      'cafe',
      'Ubud wellness-cultural anchor used for major global festival programming and queer-friendly community crossover.',
      'wellness festival social hub',
      array['cultural','festival']::text[],
      'Daily hours vary by program; festival periods run from daytime to late evening.',
      'https://www.balispiritfestival.com/',
      'The Yoga Barn, Ubud, Gianyar, Bali, Indonesia',
      -8.5073,
      115.2640
    ),
    (
      'De Hooi',
      'jakarta',
      'bar',
      'Long-running South Jakarta live-music bar with a mixed and queer-friendly social room that stays active late.',
      'late live-music social room',
      array['social','mixed']::text[],
      'Daily 14:00-02:00.',
      'https://dehooi.id/',
      'Plaza II Pondok Indah, Blok B4 No. 31, Jl. Metro Duta Niaga Raya, Pondok Pinang, Jakarta Selatan 12310, Indonesia',
      -6.2649,
      106.7822
    ),
    (
      'Rhythm Lounge & Bar',
      'jakarta',
      'bar',
      'South Jakarta lounge with live-music programming and community-friendly social atmosphere.',
      'lounge-forward social pregame',
      array['social','chill']::text[],
      'Daily 11:00-23:00 (check live schedule).',
      'https://linktr.ee/rhythmlounge',
      'Poins Mall, Jl. R.A. Kartini No.1, Lebak Bulus, Jakarta Selatan, Indonesia',
      -6.2890,
      106.7738
    ),
    (
      'MOA Bar & Resto',
      'jakarta',
      'bar',
      'South Jakarta cocktail-and-community room used for social nights and younger crowd crossover.',
      'younger social cocktail lane',
      array['mixed','social']::text[],
      'Daily evening service; check same-day updates.',
      'https://linktr.ee/moajakarta',
      'CASA Amaroossa Lounge 4th Floor, Jl. Pangeran Antasari No.9B, Cipete Selatan, Jakarta Selatan, Indonesia',
      -6.2640,
      106.8066
    ),
    (
      'Arus Pelangi Community Node',
      'jakarta',
      'cafe',
      'Rights-advocacy anchor supporting LGBTQ+ empowerment, legal awareness, and community visibility in Jakarta.',
      'community-rights infrastructure',
      array['social','cultural']::text[],
      'Mon-Fri 08:00-17:00, Sat-Sun closed (verify before visit).',
      'https://smeru.or.id/en/ngo-profile/arus-pelangi',
      'Jl. Tebet Timur Dalam 6G No.1, Tebet, Jakarta Selatan 12810, Indonesia',
      -6.2298,
      106.8524
    ),
    (
      'South Jakarta Nightlife Crossover Route',
      'jakarta',
      'cafe',
      'Practical route linking trusted bars, lounges, and social rooms in South Jakarta for safer late-night sequencing.',
      'route-first nightlife planning lane',
      array['social','mixed']::text[],
      'Most active Thu-Sat 20:00-late.',
      'https://linktr.ee/moa.jakarta',
      'Cipete - Antasari - Pondok Indah corridor, South Jakarta, Indonesia',
      -6.2584,
      106.8064
    ),
    (
      'BlueBoy Discotheque',
      'kuala_lumpur',
      'club',
      'Long-running Bukit Bintang nightlife institution with cabaret-format performance nights and late dance-floor momentum.',
      'legacy cabaret dance room',
      array['drag','mixed']::text[],
      'Tue-Thu 20:00-02:00, Fri-Sun 20:00-03:00, Mon closed.',
      'https://www.facebook.com/pages/Blueboy-Discotheque-Bukit-Bintang/167616639976407',
      '54 Jalan Sultan Ismail, Bukit Bintang, 50250 Kuala Lumpur, Malaysia',
      3.1518,
      101.7118
    ),
    (
      'Oops! Gym Steam and Sauna',
      'kuala_lumpur',
      'sauna',
      'Men-focused sauna and steam venue with gym, cabins, and evening-heavy social flow.',
      'sauna reset and late social lane',
      array['relax','cruise']::text[],
      'Daily 14:00-23:00.',
      'https://oops-kl.com/',
      'No 27-1 Jalan Kampung Pandan, 55100 Kuala Lumpur, Malaysia',
      3.1322,
      101.7308
    ),
    (
      'PT Foundation Community Center',
      'kuala_lumpur',
      'cafe',
      'Community-led sexual health and support infrastructure serving key populations and safer-city navigation.',
      'community care and support node',
      array['social','cultural']::text[],
      'Office and drop-in windows vary by program; check official updates.',
      'https://www.ptfmalaysia.org/',
      'Third Floor, 2, Jalan Haji Salleh, Sentul, 51100 Kuala Lumpur, Malaysia',
      3.1778,
      101.6947
    ),
    (
      'Lane 23 TRX',
      'kuala_lumpur',
      'club',
      'High-output TRX lounge-to-club format with late-night dance transitions and mixed crowd social momentum.',
      'TRX nightlife crossover room',
      array['electronic','mixed']::text[],
      'Club 22:00-late; restaurant/lounge daily schedule varies.',
      'https://www.lanetwentythree.com/',
      'Lane 23, The Exchange TRX, Persiaran Tun Razak Exchange, 55188 Kuala Lumpur, Malaysia',
      3.1425,
      101.7165
    ),
    (
      'Bukit Bintang Night Corridor',
      'kuala_lumpur',
      'cafe',
      'Core late-night route used for venue-hopping, social meetups, and short-transfer nightlife planning.',
      'central route-first nightlife lane',
      array['social','after']::text[],
      'Most active daily 20:00-late.',
      'https://www.lanetwentythree.com/',
      'Bukit Bintang, Kuala Lumpur, Malaysia',
      3.1478,
      101.7100
    )
)
insert into public.places (
  name,
  city,
  type,
  description,
  vibe,
  vibe_tags,
  hours,
  link,
  location,
  lat,
  lng
)
select
  np.name,
  np.city,
  np.type,
  np.description,
  np.vibe,
  np.vibe_tags,
  np.hours,
  np.link,
  np.location,
  np.lat,
  np.lng
from new_places np
where not exists (
  select 1
  from public.places p
  where lower(p.city) = lower(np.city)
    and lower(p.name) = lower(np.name)
);

with new_events (
  name,
  city,
  description,
  link,
  date,
  start_date,
  end_date,
  location,
  lat,
  lng,
  vibe,
  vibe_tags
) as (
  values
    (
      'BaliSpirit Festival 2026',
      'bali',
      'Large-scale Ubud festival blending yoga, music, healing, and inclusive community programming with global participation.',
      'https://www.balispiritfestival.com/',
      '2026-04-15'::date,
      '2026-04-15'::date,
      '2026-04-19'::date,
      'The Yoga Barn and Puri Padi, Ubud, Bali, Indonesia',
      -8.5073,
      115.2640,
      'festival cultural',
      array['festival','cultural']::text[]
    ),
    (
      'Stonewall Bali Drag Showcase Series',
      'bali',
      'Recurring drag-and-DJ performance sequence in Seminyak with mixed local-traveler social momentum.',
      'https://stonewallbali.com/',
      null::date,
      null::date,
      null::date,
      'Stonewall Bali, Seminyak, Bali, Indonesia',
      -8.6928,
      115.1686,
      'drag after',
      array['drag','after']::text[]
    ),
    (
      'Seminyak Queer Night Crawl',
      'bali',
      'Weekly venue-hopping format across the Camplung Tanduk lane with drag bars and dance-floor handoffs.',
      'https://linktr.ee/stonewallbali',
      null::date,
      null::date,
      null::date,
      'Camplung Tanduk nightlife lane, Seminyak, Bali, Indonesia',
      -8.6904,
      115.1663,
      'social mixed',
      array['social','mixed']::text[]
    ),
    (
      'IDAHOBIT Community Forum Jakarta',
      'jakarta',
      'Community rights and visibility forum held around IDAHOBIT with advocacy and support-network programming.',
      'https://smeru.or.id/en/ngo-profile/arus-pelangi',
      '2026-05-17'::date,
      '2026-05-17'::date,
      '2026-05-17'::date,
      'South Jakarta community venues (rotating), Jakarta, Indonesia',
      -6.2298,
      106.8524,
      'social cultural',
      array['social','cultural']::text[]
    ),
    (
      'ARKIPEL 2026 (Jakarta Intl Documentary & Experimental Film Festival)',
      'jakarta',
      'Major Jakarta film festival with inclusive arts participation and strong intersection with queer and rights-led storytelling.',
      'https://arkipel.id/',
      null::date,
      null::date,
      null::date,
      'Jakarta, Indonesia',
      -6.2088,
      106.8456,
      'cultural festival',
      array['cultural','festival']::text[]
    ),
    (
      'South Jakarta Queer Social Nights',
      'jakarta',
      'Recurring social-night format across trusted bars and lounges with curated crowd and low-friction route design.',
      'https://linktr.ee/moajakarta',
      null::date,
      null::date,
      null::date,
      'South Jakarta nightlife corridor, Jakarta, Indonesia',
      -6.2584,
      106.8064,
      'social after',
      array['social','after']::text[]
    ),
    (
      'KL Festival 2026',
      'kuala_lumpur',
      'Citywide cultural program activating downtown KL with community-oriented arts and public-space events.',
      'https://thinkcity.com.my/about/media-centre/press-releases/kl-festival-returns-to-reimagine-downtown-kuala-lumpur',
      '2026-05-06'::date,
      '2026-05-06'::date,
      '2026-05-31'::date,
      'Downtown Kuala Lumpur, Malaysia',
      3.1452,
      101.6958,
      'festival cultural',
      array['festival','cultural']::text[]
    ),
    (
      'World AIDS Day Community Program Kuala Lumpur',
      'kuala_lumpur',
      'Community-led HIV awareness and support programming coordinated across local NGOs and health advocates.',
      'https://maf.org.my/V2/world-aids-day-a-celebration-of-resilience-courage-and-partnership/',
      '2026-12-01'::date,
      '2026-12-01'::date,
      '2026-12-01'::date,
      'Kuala Lumpur, Malaysia',
      3.1390,
      101.6869,
      'social cultural',
      array['social','cultural']::text[]
    ),
    (
      'PT Foundation Community Health & Inclusion Day',
      'kuala_lumpur',
      'Recurring community support format focused on sexual health literacy, peer support, and safer-city navigation.',
      'https://www.ptfmalaysia.org/',
      null::date,
      null::date,
      null::date,
      'PT Foundation, Kuala Lumpur, Malaysia',
      3.1778,
      101.6947,
      'social community',
      array['social','cultural']::text[]
    )
)
insert into public.events (
  name,
  city,
  description,
  link,
  date,
  start_date,
  end_date,
  location,
  lat,
  lng,
  vibe,
  vibe_tags
)
select
  ne.name,
  ne.city,
  ne.description,
  ne.link,
  ne.date,
  ne.start_date,
  ne.end_date,
  ne.location,
  ne.lat,
  ne.lng,
  ne.vibe,
  ne.vibe_tags
from new_events ne
where not exists (
  select 1
  from public.events e
  where lower(e.city) = lower(ne.city)
    and lower(e.name) = lower(ne.name)
);

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
) values
  (
    'Indonesia',
    'mixed',
    'risk',
    'risk',
    'restricted',
    'no_protection',
    'restricted',
    'limited_or_none',
    'Same-sex relations are not uniformly treated across Indonesia: legal status varies by region, with restrictive enforcement risk in some provinces. National legal recognition and anti-discrimination protection remain limited.',
    'medium',
    'https://ilga.org/ilga-world-maps/',
    'https://www.equaldex.com/region/indonesia',
    'https://www.humandignitytrust.org/country-profile/indonesia/',
    current_date,
    false
  ),
  (
    'Malaysia',
    'risk',
    'risk',
    'risk',
    'criminalized',
    'no_protection',
    'impossible',
    'limited_or_none',
    'Malaysia maintains criminalization frameworks for same-sex activity and has no legal recognition for same-sex unions. Community spaces exist, but rights and public-safety context require caution-aware planning.',
    'medium',
    'https://ilga.org/ilga-world-maps/',
    'https://www.equaldex.com/region/malaysia',
    'https://www.humandignitytrust.org/country-profile/malaysia/',
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

commit;
