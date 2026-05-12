-- Queer Atlas: queer-friendly techno events batch 2 (JUNE+ ONLY)
-- Rule: only events on or after 2026-06-01
-- Includes cleanup for pre-June rows from batch2-v1 if they were inserted.

begin;

-- Cleanup previously proposed pre-June rows (safe no-op if not present)
delete from public.events
where link in (
  'https://ra.co/events/2285181', -- Spectrum Waves (Feb)
  'https://ra.co/events/2400263', -- LA SCARLETTE (Apr)
  'https://ra.co/events/2403052', -- BODYDOXY#1 (Apr)
  'https://ra.co/events/2381059', -- Sunday Squirt (Mar)
  'https://ra.co/events/2369848', -- SPFDJ (Feb)
  'https://ra.co/events/2394076'  -- Horsegiirl (Mar)
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
      'Rebel Union: FOLD - STEAM ROOM',
      'london',
      'Queer-friendly acid-techno night with explicit anti-discrimination and consent-centered floor culture at FOLD.',
      'https://ra.co/events/2418597',
      '2026-06-06'::date,
      null::date,
      null::date,
      'FOLD, Gillian House, Stephenson St, London E16 4SA, United Kingdom',
      51.5154,
      0.0128,
      'acid-techno queer-friendly pressure room',
      array['techno','underground','electronic']::text[]
    ),
    (
      'BLACKHOLE',
      'london',
      'Underground electronic night with techno focus and strict no-discrimination policy.',
      'https://ra.co/events/2429628',
      '2026-06-12'::date,
      null::date,
      null::date,
      'Egg London, 5-13 Vale Royal, London N7 9AP, United Kingdom',
      51.5538,
      -0.1207,
      'underground techno night',
      array['techno','electronic','massive']::text[]
    ),
    (
      'HEDONIST - Queer Dance Festival',
      'london',
      'Queer dance festival format with techno/electro axis, creative floor expression, and safer-space framing.',
      'https://ra.co/events/2422192',
      '2026-06-20'::date,
      null::date,
      null::date,
      'Bureau of Silly Ideas, 18 Valentia Place, London SW9 8PJ, United Kingdom',
      51.4670,
      -0.1160,
      'queer techno festival day-night',
      array['techno','festival','social']::text[]
    ),
    (
      'Gegen x Skin',
      'madrid',
      'Queer techno collaboration with body-positive and anti-discrimination framework during Madrid Pride season.',
      'https://ra.co/events/2416950',
      '2026-06-06'::date,
      null::date,
      null::date,
      'Skin, C. de la Aduana 21, 28013 Madrid, Spain',
      40.4198,
      -3.6999,
      'queer pride-season techno',
      array['techno','underground','social']::text[]
    ),
    (
      'KINYXX Madrid Fet!sh Pride Party',
      'madrid',
      'Queer-fetish Pride-week party with house-techno direction and explicit identity-safe floor culture.',
      'https://ra.co/events/2423093',
      '2026-06-26'::date,
      null::date,
      null::date,
      'Strong the Club, Calle de Trujillos 7, Madrid, Spain',
      40.4202,
      -3.7068,
      'pride-week queer fetish techno',
      array['techno','fetish','social']::text[]
    ),
    (
      '01366 OFFBCN 26',
      'barcelona',
      'All-night OFF Week format with techno-house crossover and high-capacity dancefloor pull.',
      'https://ra.co/events/2427125',
      '2026-06-18'::date,
      null::date,
      null::date,
      'Village Underground Barcelona, Carrer Cobalt 12, LHospitalet de Llobregat, Spain',
      41.3619,
      2.1282,
      'offweek techno crossover night',
      array['techno','electronic','massive']::text[]
    ),
    (
      'Planet Venus Off Week: Melina Serser, Naone, Super Venus, KARNE KULTURE',
      'barcelona',
      'Queer-forward OFF Week journey blending techno, trance, and experimental sounds across day-to-night stages.',
      'https://es.ra.co/events/2430825',
      '2026-06-20'::date,
      null::date,
      null::date,
      'Village Underground Barcelona, Carrer Cobalt 12, LHospitalet de Llobregat, Spain',
      41.3619,
      2.1282,
      'queer offweek techno-trance journey',
      array['techno','electronic','social']::text[]
    ),
    (
      'LASTER CLUB - OFFBCN 26 (indoor)',
      'barcelona',
      'Techno-heavy OFFBCN session with explicit no-discrimination floor policy and long-form warehouse energy.',
      'https://ra.co/events/2351863',
      '2026-06-21'::date,
      null::date,
      null::date,
      'Seaseaclub Barcelona, Carrer Port Esportiu 14P, Barcelona, Spain',
      41.4145,
      2.2244,
      'offweek techno warehouse pressure',
      array['techno','underground','massive']::text[]
    ),
    (
      'PiepShow - PridePiep',
      'berlin',
      'Large queer techno Pride-week rave with multi-floor programming and strict tolerance policy.',
      'https://ra.co/events/2277044',
      '2026-07-24'::date,
      null::date,
      null::date,
      'KitKatClub, Köpenicker Strasse 76, 10179 Berlin, Germany',
      52.5105,
      13.4204,
      'pride-week queer techno rave',
      array['techno','massive','social']::text[]
    ),
    (
      'Nacktfleisch - Berlin Pride / CSD Closing Party 2026',
      'berlin',
      'Queer-centered CSD closing party with techno/tech-house, consent-first framework, and anti-harassment zero tolerance.',
      'https://ra.co/events/2420492',
      '2026-07-26'::date,
      null::date,
      null::date,
      'KitKatClub, Köpenicker Strasse 76, 10179 Berlin, Germany',
      52.5105,
      13.4204,
      'csd closing queer techno',
      array['techno','after','social']::text[]
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
where ne.date >= '2026-06-01'::date
  and not exists (
    select 1
    from public.events e
    where lower(e.city) = lower(ne.city)
      and lower(e.name) = lower(ne.name)
  );

commit;
