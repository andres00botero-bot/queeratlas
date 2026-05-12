-- Queer Atlas: queer-friendly techno events batch 3 (JUNE+ ONLY, NO DUPES)
-- Strict dedupe:
-- 1) lower(city)+lower(name)
-- 2) lower(link)
-- WHOLE removed (already exists in your dataset).

begin;

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
      'Folsom Europe Street Fair 2026',
      'berlin',
      'Queer fetish week anchor with strong nightlife ecosystem and techno-adjacent official party circuit across Berlin.',
      'https://folsomeurope.berlin/',
      '2026-09-11'::date,
      '2026-09-10'::date,
      '2026-09-13'::date,
      'Fuggerstrasse, 10777 Berlin, Germany',
      52.4991,
      13.3448,
      'queer fetish week with club spillover',
      array['fetish','social','festival']::text[]
    ),
    (
      'Milkshake Festival 2026',
      'amsterdam',
      'Open-minded queer-inclusive electronic festival with multiple stages including techno and house programming.',
      'https://www.milkshakefestival.com/events/milkshake2026',
      '2026-07-25'::date,
      '2026-07-25'::date,
      '2026-07-26'::date,
      'Westerpark, 1014 DA Amsterdam, Netherlands',
      52.3872,
      4.8686,
      'queer-inclusive electronic festival',
      array['festival','electronic','techno']::text[]
    ),
    (
      'Sónar 2026',
      'barcelona',
      'Flagship advanced-music festival with strong techno/electronic programming and diverse international dancefloor culture.',
      'https://www.barcelonaturisme.cat/wv3/en/agenda/15723/sonar-2026.html',
      '2026-06-18'::date,
      '2026-06-18'::date,
      '2026-06-20'::date,
      'Fira Gran Via, Av. Joan Carles I 64, L Hospitalet de Llobregat, Barcelona, Spain',
      41.3548,
      2.1280,
      'major electronic-week techno signal',
      array['festival','electronic','techno']::text[]
    ),
    (
      'Winter Pride Maspalomas 2026',
      'gran_canaria',
      'Large LGBTQ week in Maspalomas with open-air parties, club nights, and strong queer traveler dancefloor momentum.',
      'https://www.winterpride.com/',
      '2026-11-02'::date,
      '2026-11-02'::date,
      '2026-11-08'::date,
      'Yumbo Centrum area, Playa del Ingles, Gran Canaria, Spain',
      27.7579,
      -15.5799,
      'queer pride week with nightlife pull',
      array['festival','social','mixed']::text[]
    ),
    (
      'Moby Dick: A Pride Odyssey',
      'new_york',
      'Pride-week queer techno night at House of Yes with explicit LGBTQ producer leadership and safer-space door policy.',
      'https://ra.co/events/2419739',
      '2026-06-27'::date,
      null::date,
      null::date,
      'House of Yes, 2 Wyckoff Ave, Brooklyn, NY 11237, USA',
      40.7065,
      -73.9237,
      'pride-week queer techno night',
      array['techno','social','festival']::text[]
    ),
    (
      'XOXA Pride',
      'new_york',
      'Queer-forward Pride club night with inclusion-first floor culture and techno/electronic party energy.',
      'https://ra.co/events/2435713',
      '2026-06-26'::date,
      null::date,
      null::date,
      'Good Room, 98 Meserole Ave, Brooklyn, NY 11222, USA',
      40.7272,
      -73.9525,
      'queer-forward pride club format',
      array['techno','electronic','social']::text[]
    ),
    (
      'Market Hotel PRIDE: ALPHABET MAFIA',
      'new_york',
      'All-night queer Pride format with techno and club programming hosted by Brooklyn queer collectives.',
      'https://ra.co/events/2430874',
      '2026-06-27'::date,
      null::date,
      null::date,
      'Market Hotel, 1140 Myrtle Ave, Brooklyn, NY 11206, USA',
      40.6976,
      -73.9333,
      'brooklyn queer pride all-nighter',
      array['techno','electronic','social']::text[]
    ),
    (
      'for the lovers - pride friday',
      'toronto',
      'Queer Pride Friday dance with techno-house direction and guest selectors from Brooklyn and Montreal scenes.',
      'https://ra.co/events/2419698',
      '2026-06-26'::date,
      null::date,
      null::date,
      'TBA, Toronto, Canada',
      43.6532,
      -79.3832,
      'pride friday queer techno-house',
      array['techno','social','mixed']::text[]
    ),
    (
      'Spectrum Waves: Pride edition (Nord + Sud)',
      'paris',
      'Queer-centered Pride edition at La Station with techno focus and explicit anti-discrimination door and floor policy.',
      'https://ra.co/events/2297275',
      '2026-06-27'::date,
      null::date,
      null::date,
      'La Station - Gare des Mines, 29 Avenue de la Porte d Aubervilliers, 75018 Paris, France',
      48.8984,
      2.3662,
      'paris pride queer techno assembly',
      array['techno','social','underground']::text[]
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
  )
  and not exists (
    select 1
    from public.events e2
    where coalesce(lower(e2.link), '') <> ''
      and lower(e2.link) = lower(ne.link)
  );

commit;
