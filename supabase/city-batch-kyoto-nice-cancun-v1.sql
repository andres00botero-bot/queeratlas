-- Queer Atlas city batch v1
-- Cities: kyoto, nice, cancun
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
      'Apple',
      'kyoto',
      'bar',
      'Long-running Kyoto gay bar with compact social flow, karaoke energy, and steady local/visitor crossover.',
      'intimate men-only karaoke lane',
      array['social','cozy']::text[],
      'Tue-Sun 20:00-04:00, Mon closed.',
      'http://apple1985.web.fc2.com/',
      '455 Shincho, Shimogyo Ward, Kyoto 600-8001, Japan',
      35.0037,
      135.7683
    ),
    (
      'Bell Kyoto',
      'kyoto',
      'bar',
      'Small Kyoto gay bar with cocktail-and-karaoke social rhythm in the Kiyamachi area.',
      'cozy cocktail-and-karaoke social room',
      array['social','cozy']::text[],
      'Mon 20:00-04:00, Wed-Sun 20:00-04:00, Tue closed.',
      '',
      '105 Nakajimacho, Nakagyo Ward, Kyoto 604-8004, Japan',
      35.0094,
      135.7712
    ),
    (
      'AZURE',
      'kyoto',
      'bar',
      'Established men-only gay bar in central Kyoto with compact seating and late social flow.',
      'men-only kiyamachi classic',
      array['social']::text[],
      'Nightly from around 20:00; verify same-day schedule before going.',
      'https://www.azure-kyoto.info/',
      '3F Ito Building, 219-2 Nabeyacho, Nakagyo Ward, Kyoto 604-8015, Japan',
      35.0072,
      135.7707
    ),
    (
      'Masa-Masa',
      'kyoto',
      'bar',
      'Traditional Kyoto-style gay bar with local regulars and a quieter social rhythm.',
      'traditional kyoto-style gay bar',
      array['cozy','social']::text[],
      'Daily 18:00-24:00 (irregular closure days).',
      'https://sites.google.com/site/kyotomasamasa/',
      '225 Sendomachi, Shimogyo Ward, Kyoto 600-8019, Japan',
      35.0038,
      135.7686
    ),
    (
      'CLUB METRO',
      'kyoto',
      'club',
      'Kyoto nightlife institution used for recurring LGBTQ-oriented party formats and queer crossover nights.',
      'underground queer-crossover dance engine',
      array['electronic','mixed']::text[],
      'Event-led. Typical doors from 21:00; schedule varies by program.',
      'http://www.metro.ne.jp/',
      'B1F Ebisu Building, 82 Shimotsutsumicho, Sakyo Ward, Kyoto 606-8396, Japan',
      35.0139,
      135.7725
    ),
    (
      'Umekoji Park Pride Hub',
      'kyoto',
      'cafe',
      'Core assembly area used for Kyoto Rainbow Pride community booths and stage programming.',
      'grassroots pride assembly point',
      array['social','festival']::text[],
      'Public park access daily; Pride programming is event-scheduled.',
      'https://kyotorainbowpride.studio.site/',
      '56-3 Kankijicho, Shimogyo Ward, Kyoto 600-8835, Japan',
      34.9876,
      135.7487
    ),
    (
      '11:11 Club Cancun',
      'cancun',
      'club',
      'One of Cancun''s most visible LGBTQ+ nightlife rooms with drag-focused programming and dense weekend crowd turnover.',
      'drag-show downtown anchor',
      array['drag','mixed']::text[],
      'Wed-Sun 21:00-03:00, Mon-Tue closed.',
      'https://www.facebook.com/1111club/',
      'Av Tulum SM 22 MZ 5 LT 33, Centro, 77500 Cancun, Quintana Roo, Mexico',
      21.1615,
      -86.8261
    ),
    (
      'Laser Hot Bar',
      'cancun',
      'bar',
      'High-turnover downtown gay bar with drag and go-go performance nights.',
      'compact drag-and-go-go pressure room',
      array['drag','social']::text[],
      'Wed-Sun 20:00-02:30, Mon-Tue closed.',
      'https://www.facebook.com/LaserHotBar',
      'Av Tulum 45, 77500 Cancun, Quintana Roo, Mexico',
      21.1608,
      -86.8257
    ),
    (
      'Bar Noa TuCancun',
      'cancun',
      'club',
      'Younger-skewing queer nightlife room with drag-stage emphasis and high-energy weekend dance flow.',
      'younger drag-and-dance lane',
      array['drag','pop']::text[],
      'Nightly schedule varies; strongest late-night activity Thu-Sun.',
      'https://www.facebook.com/BarNoaTuCancun',
      'Blvd Kukulcan LT 3, Cancun, Quintana Roo 77500, Mexico',
      21.1326,
      -86.7454
    ),
    (
      'The Back Door',
      'cancun',
      'club',
      'Small late-night queer venue with darkroom-adjacent energy and weekend-heavy social cycle.',
      'late-hours cruise-adjacent social room',
      array['mixed','after']::text[],
      'Thu-Sat 22:00-03:00, Sun 21:00-02:00, Mon-Wed closed.',
      'https://www.instagram.com/thebackdoorcancun/',
      'Av Xcaret 21, Plaza Las Palmas, 77505 Cancun, Quintana Roo, Mexico',
      21.1522,
      -86.8310
    ),
    (
      'Dark Room Cancun',
      'cancun',
      'cruise_club',
      'Adult-coded downtown stop used for darker late-night social flow near the Avenida Tulum cluster.',
      'downtown coded after-hours lane',
      array['cruise']::text[],
      'Late-night schedule varies by night.',
      '',
      'Calle Margaritas, SM 22, Cancun, Quintana Roo, Mexico',
      21.1624,
      -86.8269
    ),
    (
      'Playa Delfines',
      'cancun',
      'cruising_area',
      'Public beach in Zona Hotelera with strong queer-tourist visibility and sunset social movement.',
      'hotel-zone beach social drift',
      array['cruise','chill']::text[],
      'Daily daytime through sunset.',
      'https://www.turismocancun.mx/el-ni%C3%B1o-1-1-1-1',
      'Blvd Kukulcan Km 19.5, Zona Hotelera, Cancun, Quintana Roo, Mexico',
      21.0445,
      -86.7828
    ),
    (
      'Parque de las Palapas Night Corridor',
      'cancun',
      'cafe',
      'Community-heavy downtown plaza used as social endpoint for Pride routes and nightlife spillover.',
      'post-march community gathering zone',
      array['social']::text[],
      'Daily public square; nightlife strongest evenings.',
      '',
      'Parque de las Palapas, Centro, Cancun, Quintana Roo, Mexico',
      21.1587,
      -86.8288
    ),
    (
      'Klubber',
      'nice',
      'club',
      'After-hours LGBTQ-oriented club in Old Nice with strong post-05:00 crowd handoff.',
      'after-hours vieux-nice surge',
      array['mixed','after']::text[],
      'Fri-Mon 05:00-10:00/11:00.',
      'https://www.facebook.com/Klubber-gay-club-Nice',
      '14 Rue Benoit Bunico, 06300 Nice, France',
      43.6968,
      7.2781
    ),
    (
      'L''Omega Club',
      'nice',
      'club',
      'LGBTQ-oriented Nice dance club near Place Massena with drag-forward party nights.',
      'massena late-night drag-energy room',
      array['drag','mixed']::text[],
      'Thu-Sun 24:00-05:00/06:00.',
      'https://www.facebook.com/lomegaclub',
      '8 Passage Emile Negrin, 06000 Nice, France',
      43.6973,
      7.2714
    ),
    (
      'Sauna Les Bains Douches',
      'nice',
      'sauna',
      'Long-running gay sauna in central Nice with afternoon-to-evening social rhythm.',
      'central sauna reset lane',
      array['relax','cruise']::text[],
      'Daily 13:00-21:00.',
      'https://www.instagram.com/lesbainsdouchesnice/',
      '7 Rue Gubernatis, 06000 Nice, France',
      43.7034,
      7.2672
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
      'Kyoto Rainbow Pride 2026',
      'kyoto',
      'Community-led Pride day in Kyoto with parade visibility, stage programming, and local organization booths.',
      'https://kyotorainbowpride.studio.site/',
      '2026-04-18'::date,
      '2026-04-18'::date,
      '2026-04-18'::date,
      'Umekoji Park, Kyoto, Japan',
      34.9876,
      135.7487,
      'festival social',
      array['festival','social']::text[]
    ),
    (
      'Pride in Kyoto',
      'kyoto',
      'Independent Kyoto queer culture event series with talks, performances, and community organizing format.',
      'https://prideinkyoto.com/',
      null::date,
      null::date,
      null::date,
      'Kyoto, Japan',
      35.0116,
      135.7681,
      'cultural social',
      array['cultural','social']::text[]
    ),
    (
      'Diamond Night @ CLUB METRO',
      'kyoto',
      'Recurring LGBTQ-oriented club night in Kyoto with drag-adjacent performances and mixed dance-floor momentum.',
      'http://www.metro.ne.jp/',
      null::date,
      null::date,
      null::date,
      'CLUB METRO, Kyoto, Japan',
      35.0139,
      135.7725,
      'after mixed',
      array['after','mixed']::text[]
    ),
    (
      'Cancun Pride March 2026',
      'cancun',
      'Annual Cancun Pride march and city-center visibility action with linked nightlife activations.',
      'https://quintanaroo.quadratin.com.mx/alistan-marcha-cancun-pride-2025/',
      '2026-06-06'::date,
      '2026-06-06'::date,
      '2026-06-06'::date,
      'Parque de las Palapas, Cancun, Quintana Roo, Mexico',
      21.1587,
      -86.8288,
      'festival social',
      array['festival','social']::text[]
    ),
    (
      'Festival Vive con Orgullo Cancun',
      'cancun',
      'Pride-week cultural format in Cancun with community art, public programming, and visibility activities.',
      'https://quintanaroo.quadratin.com.mx/alistan-marcha-cancun-pride-2025/',
      null::date,
      null::date,
      null::date,
      'Cancun, Quintana Roo, Mexico',
      21.1619,
      -86.8515,
      'festival cultural',
      array['festival','cultural']::text[]
    ),
    (
      'Cancun Pride Weekend Club Series',
      'cancun',
      'Cluster of drag and dance nights across Cancun LGBTQ+ clubs during Pride window.',
      'https://www.facebook.com/1111club/',
      null::date,
      null::date,
      null::date,
      'Cancun Centro club district, Quintana Roo, Mexico',
      21.1615,
      -86.8261,
      'drag after',
      array['drag','after']::text[]
    ),
    (
      'Pink Parade Nice 2026',
      'nice',
      'Nice''s annual Pride march and seaside celebration format with parade route and Pink Drink after-program.',
      'https://www.facebook.com/AglaeLGBT',
      '2026-07-11'::date,
      '2026-07-11'::date,
      '2026-07-11'::date,
      'Port Lympia to Theatre de Verdure, Nice, France',
      43.6961,
      7.2858,
      'festival social',
      array['festival','social']::text[]
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
