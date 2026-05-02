-- Queer Atlas city batch v1
-- Cities: fireisland, bilbao, krakow
-- Idempotent insert script (no duplicates by lower(city)+lower(name))

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
      'Ice Palace',
      'fireisland',
      'club',
      'Legendary Cherry Grove club room and one of Fire Island''s most iconic queer nightlife anchors.',
      'historic drag-and-dance island institution',
      array['drag','mixed']::text[],
      'Seasonal (summer). Typical active window Thu-Sun with late-night programming; check official schedule before travel.',
      'https://www.icepalace.club/',
      '1 Main Walk, Cherry Grove, Fire Island, NY 11782, USA',
      40.6601,
      -73.0896
    ),
    (
      'The Grove Hotel',
      'fireisland',
      'hotel',
      'Historic LGBTQ+ hotel base in Cherry Grove with direct connection to island nightlife flow.',
      'cherry grove queer social basecamp',
      array['mixed','social']::text[],
      'Seasonal stay operations. Front-desk and booking windows vary by season.',
      'https://www.grovehotel.com/',
      '1 Ocean Walk, Cherry Grove, Fire Island, NY 11782, USA',
      40.6603,
      -73.0894
    ),
    (
      'Sip n Twirl',
      'fireisland',
      'club',
      'One of Fire Island Pines'' highest-output dance and social venues with strong late-night crowd turnover.',
      'pines all-night social dance engine',
      array['mixed','massive']::text[],
      'Seasonal. Most active Fri-Sun evenings through late night; check in-season program updates.',
      'https://fireislandpines.us/',
      '36 Fire Island Blvd, Fire Island Pines, NY 11782, USA',
      40.6446,
      -73.0691
    ),
    (
      'Blue Whale',
      'fireisland',
      'bar',
      'Harborfront Pines venue known for Low Tea and sunset social flow.',
      'iconic tea-dance waterfront ritual',
      array['social','mixed']::text[],
      'Seasonal. In-season daily programming with tea-dance windows and late bar service.',
      'https://fireislandpines.us/bluewhale/',
      'Harbor Walk, Fire Island Pines, NY 11782, USA',
      40.6442,
      -73.0694
    ),
    (
      'The Pavilion',
      'fireisland',
      'club',
      'Signature Fire Island Pines dancefloor and event room tied to major summer weekends.',
      'high-tea to after-dark circuit pressure',
      array['massive','electronic']::text[],
      'Seasonal and event-led. Check current lineup and entry windows before going.',
      'https://fireislandpines.us/',
      'Harbor Walk, Fire Island Pines, NY 11782, USA',
      40.6440,
      -73.0692
    ),
    (
      'Meat Rack Boardwalk Route',
      'fireisland',
      'cruising_area',
      'Community-known wooded and dune-adjacent route between Cherry Grove and Fire Island Pines.',
      'historic dunes cruising corridor',
      array['cruise']::text[],
      'Open-access boardwalk route; strongest late-evening and night movement in peak season.',
      '',
      'Boardwalk corridor between Cherry Grove and Fire Island Pines, Fire Island, NY, USA',
      40.6527,
      -73.0799
    ),
    (
      'Badulake',
      'bilbao',
      'club',
      'Long-running LGBTQ-oriented disco room in Bilbao''s old-town orbit with drag-show crossover.',
      'old-town drag-pop dance room',
      array['drag','pop']::text[],
      'Fri 23:00-06:00, Sat 23:00-06:00.',
      'https://www.instagram.com/badulake.bilbao/',
      'Hernani Kalea 10, 48003 Bilbao, Spain',
      43.2588,
      -2.9298
    ),
    (
      'Balcon de la Lola',
      'bilbao',
      'club',
      'Compact late-night LGTBIQ+ club with house/techno-to-pop programming and younger crowd profile.',
      'younger house-pop crossover lane',
      array['mixed','electronic']::text[],
      'Fri-Sat 24:00-06:00.',
      'https://www.instagram.com/elbalcondelalolabilbao/',
      'Bailen Kalea 10, 48003 Bilbao, Spain',
      43.2591,
      -2.9287
    ),
    (
      'Manolita La Primera',
      'bilbao',
      'bar',
      'LGBT-friendly old-town bar with social-first flow and dance-energy crossover.',
      'casco viejo social dance warmup',
      array['social','mixed']::text[],
      'Fri-Sat 20:00-03:00.',
      'https://www.facebook.com/people/Manolita-La-Primera/',
      'Barrenkale Kalea 4, 48005 Bilbao, Spain',
      43.2597,
      -2.9247
    ),
    (
      'Paquita la de Barrenka',
      'bilbao',
      'bar',
      'Large music-and-dance bar with LGBTQ-friendly visibility and strong weekend crowd density.',
      'crowded weekend mixed queer pulse',
      array['mixed','social']::text[],
      'Thu-Sat 22:00-03:30; Sun-Wed schedule varies.',
      'https://www.instagram.com/paquitaladebarrenka/',
      'Barrenkale Kalea 11, 48005 Bilbao, Spain',
      43.2595,
      -2.9249
    ),
    (
      'Sauna Ego',
      'bilbao',
      'sauna',
      'Established men-focused Bilbao sauna with darkroom and social zones in the city center.',
      'central men-only sauna infrastructure',
      array['relax','cruise']::text[],
      'Thu-Fri 16:00-23:00, Sat 16:00-24:00, Sun 16:00-23:00.',
      'https://saunaego.com/',
      'Nicolas Alcorta Kalea 3, 48003 Bilbao, Spain',
      43.2561,
      -2.9343
    ),
    (
      'Zinegoak Community Hub',
      'bilbao',
      'cafe',
      'Operational and cultural anchor linked to Bilbao''s international LGBTQIA+ film and arts ecosystem.',
      'queer culture and festival backbone',
      array['cultural','social']::text[],
      'Weekday office and program windows; event schedule varies.',
      'https://zinegoak.com/',
      'Maiatzaren Biko 7, 48003 Bilbao, Spain',
      43.2596,
      -2.9309
    ),
    (
      'Lindo Bar',
      'krakow',
      'bar',
      'Central queer-friendly cafe-bar near the Main Square with social-first evenings and themed nights.',
      'old-town queer lounge with late pop-up energy',
      array['social','mixed']::text[],
      'Mon-Thu 16:00-01:00, Fri-Sat 16:00-03:00, Sun 16:00-01:00.',
      'https://www.facebook.com/LindoKrakow/',
      'Slawkowska 23, 31-016 Krakow, Poland',
      50.0642,
      19.9388
    ),
    (
      'Diva Club Krakow',
      'krakow',
      'club',
      'Large LGBTQ+ dance club near the Main Square with stage programming and late after-party momentum.',
      'big-floor lgbtq+ weekend pressure',
      array['massive','drag']::text[],
      'Thu-Sat 22:00-06:00 (event nights can run later).',
      'https://www.instagram.com/divakrakow/',
      'Slawkowska 6, 31-014 Krakow, Poland',
      50.0644,
      19.9369
    ),
    (
      'GUAPO Club',
      'krakow',
      'club',
      'Inclusive LGBTQ+ nightclub in central Krakow with broad queer programming and recurring community-led nights.',
      'queer-inclusive dance room with sapphic focus',
      array['mixed','social']::text[],
      'Fri-Sat 19:00-05:00.',
      'https://www.instagram.com/guapoklub/',
      'Bracka 4, 31-005 Krakow, Poland',
      50.0608,
      19.9357
    ),
    (
      'Blue XL',
      'krakow',
      'cruise_club',
      'Popular Krakow men-focused cruise and fetish venue with maze and darkroom setup.',
      'darkroom maze and fetish-coded late lane',
      array['cruise','fetish']::text[],
      'Thu 21:00-03:00, Fri-Sat 21:00-06:00, Sun 21:00-03:00.',
      'https://www.bluexl.pl/',
      'Jozefa Dietla 85, 31-050 Krakow, Poland',
      50.0518,
      19.9458
    ),
    (
      'Spartakus Sauna',
      'krakow',
      'sauna',
      'Long-running men''s sauna and fitness venue in Krakow with dry/steam formats and rooftop terrace.',
      'classic men-only spa and sauna institution',
      array['relax','cruise']::text[],
      'Mon-Sat 12:00-23:00, Sun 14:00-21:00.',
      'https://www.saunaspartakuskrakow.pl/',
      'Marii Konopnickiej 20, 30-302 Krakow, Poland',
      50.0482,
      19.9313
    ),
    (
      'Queerowy Maj / Equality Hub',
      'krakow',
      'cafe',
      'City-linked equality programming node that hosts or coordinates Pride-month and inclusion events.',
      'pride-month civic and community node',
      array['social','festival']::text[],
      'Program-led schedule around May Pride month windows.',
      'https://rownosc.krakow.pl/',
      'Plac Wszystkich Swietych 3-4, 31-004 Krakow, Poland',
      50.0606,
      19.9373
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
      'Fire Island Invasion 2026',
      'fireisland',
      'Historic July drag flotilla and parade ritual from Cherry Grove to Fire Island Pines.',
      'https://invasionfireisland.com/',
      '2026-07-04'::date,
      '2026-07-04'::date,
      '2026-07-04'::date,
      'Cherry Grove and Fire Island Pines Harbor, Fire Island, NY, USA',
      40.6601,
      -73.0896,
      'drag festival',
      array['drag','festival']::text[]
    ),
    (
      'Pines Party 2026',
      'fireisland',
      'Major Fire Island summer fundraiser weekend with beach-party scale production and multi-event programming.',
      'https://www.pinesparty.com/',
      '2026-07-31'::date,
      '2026-07-31'::date,
      '2026-08-02'::date,
      'Fire Island Pines, NY, USA',
      40.6446,
      -73.0691,
      'massive after',
      array['massive','after']::text[]
    ),
    (
      'Fire Island Dance Festival',
      'fireisland',
      'Annual dance and fundraising weekend on Fire Island with performance-led programming and strong community visibility.',
      'https://www.dradance.org/',
      null::date,
      null::date,
      null::date,
      'Fire Island Pines, NY, USA',
      40.6453,
      -73.0695,
      'festival cultural',
      array['festival','cultural']::text[]
    ),
    (
      'Bilbao Bizkaia HARRO Pride',
      'bilbao',
      'Bilbao''s flagship Pride framework with community events, nightlife programming, and citywide LGBTQIA+ visibility moments.',
      'https://bilbaobizkaiapride.com/',
      null::date,
      null::date,
      null::date,
      'Bilbao, Spain',
      43.2630,
      -2.9350,
      'festival social',
      array['festival','social']::text[]
    ),
    (
      'Zinegoak 2026',
      'bilbao',
      'International LGBTQIA+ film and performing arts festival in Bilbao with screenings, talks, and culture programming.',
      'https://zinegoak.com/',
      '2026-06-22'::date,
      '2026-06-22'::date,
      '2026-06-29'::date,
      'Bilbao, Spain',
      43.2630,
      -2.9350,
      'cultural festival',
      array['cultural','festival']::text[]
    ),
    (
      'Maj Rownosci Krakow 2026',
      'krakow',
      'Month-long equality and queer-inclusive civic program in Krakow with talks, exhibitions, workshops, and community events.',
      'https://rownosc.krakow.pl/',
      '2026-04-27'::date,
      '2026-04-27'::date,
      '2026-05-24'::date,
      'Krakow, Poland',
      50.0606,
      19.9373,
      'festival social',
      array['festival','social']::text[]
    ),
    (
      'XXII Marsz Rownosci w Krakowie',
      'krakow',
      'Krakow''s annual Equality March and flagship public visibility moment during Queerowy Maj.',
      'https://rownosc.krakow.pl/aktualnosci/318948%2C2295%2Ckomunikat%2Cprogram_maja_rownosci_2026.html',
      '2026-05-23'::date,
      '2026-05-23'::date,
      '2026-05-23'::date,
      'Plac przed Muzeum Narodowym, Krakow, Poland',
      50.0606,
      19.9236,
      'festival social',
      array['festival','social']::text[]
    ),
    (
      'Queerowy Maj Festival',
      'krakow',
      'Community-led queer culture and rights festival in Krakow featuring screenings, parties, conversations, and solidarity events.',
      'https://www.facebook.com/queerowymaj',
      null::date,
      null::date,
      null::date,
      'Krakow, Poland',
      50.0647,
      19.9450,
      'cultural festival',
      array['cultural','festival']::text[]
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

commit;

