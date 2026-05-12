-- Queer Atlas: queer-friendly techno events batch 3 (JUNE+ ONLY, PROOF-FIRST)
-- This script does:
-- 1) PREVIEW: shows which candidates are duplicates by name+city or link
-- 2) INSERT: inserts only candidates that are truly new

begin;

with candidates (
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
      'PiepShow - PridePiep',
      'berlin',
      'Large queer techno Pride-week rave with multi-floor programming and strict tolerance policy.',
      'https://ra.co/events/2277044',
      '2026-07-24'::date,
      null::date,
      null::date,
      'KitKatClub, Koepenicker Strasse 76, 10179 Berlin, Germany',
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
      'KitKatClub, Koepenicker Strasse 76, 10179 Berlin, Germany',
      52.5105,
      13.4204,
      'csd closing queer techno',
      array['techno','after','social']::text[]
    )
),
classified as (
  select
    c.*,
    exists (
      select 1
      from public.events e
      where lower(e.city) = lower(c.city)
        and lower(e.name) = lower(c.name)
    ) as dup_name_city,
    exists (
      select 1
      from public.events e
      where coalesce(lower(e.link), '') <> ''
        and lower(e.link) = lower(c.link)
    ) as dup_link
  from candidates c
)
-- Preview result for you in Supabase output table:
select
  name,
  city,
  link,
  date,
  case
    when dup_name_city or dup_link then 'DUPLICATE'
    else 'NEW'
  end as status,
  dup_name_city,
  dup_link
from classified
order by city, date, name;

with candidates (
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
      'PiepShow - PridePiep',
      'berlin',
      'Large queer techno Pride-week rave with multi-floor programming and strict tolerance policy.',
      'https://ra.co/events/2277044',
      '2026-07-24'::date,
      null::date,
      null::date,
      'KitKatClub, Koepenicker Strasse 76, 10179 Berlin, Germany',
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
      'KitKatClub, Koepenicker Strasse 76, 10179 Berlin, Germany',
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
  c.name,
  c.city,
  c.description,
  c.link,
  c.date,
  c.start_date,
  c.end_date,
  c.location,
  c.lat,
  c.lng,
  c.vibe,
  c.vibe_tags
from candidates c
where c.date >= '2026-06-01'::date
  and not exists (
    select 1
    from public.events e
    where lower(e.city) = lower(c.city)
      and lower(e.name) = lower(c.name)
  )
  and not exists (
    select 1
    from public.events e2
    where coalesce(lower(e2.link), '') <> ''
      and lower(e2.link) = lower(c.link)
  );

commit;
