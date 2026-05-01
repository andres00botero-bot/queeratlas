-- Queer Atlas city batch v1
-- Cities: malaga, santorini, naples, tenerife
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
      'El Carmen',
      'malaga',
      'bar',
      'Compact Malaga old-town queer bar with a mixed local-and-traveler crowd and social-first flow.',
      'social old-town queer local',
      array['social']::text[],
      'Wed-Sun 22:00-03:00.',
      '',
      'C. Comedias, 15, Distrito Centro, Malaga, Spain',
      36.7222,
      -4.4218
    ),
    (
      'Kipfer & Lover',
      'malaga',
      'cafe',
      'Queer-friendly specialty coffee and brunch room in central Malaga with polished interiors.',
      'design-led social brunch lane',
      array['social','cozy']::text[],
      'Mon-Sun 09:00-17:00.',
      'https://www.kipferandlover.com/',
      'C. San Juan de Letran, 21, Distrito Centro, Malaga, Spain',
      36.7253,
      -4.4173
    ),
    (
      'Pikante',
      'malaga',
      'cruise_club',
      'Late-night adult-coded queer stop used for cruise-adjacent social movement in Malaga center.',
      'night-coded cruise and shop crossover',
      array['cruise']::text[],
      'Mon-Sat 11:00-14:00, 17:00-21:00; Sun closed.',
      '',
      'C. de Don Rodrigo, 2, Distrito Centro, Malaga, Spain',
      36.7256,
      -4.4211
    ),
    (
      'Malaga Pride Collective Hub',
      'malaga',
      'cafe',
      'Community coordination point used for local Pride programming and organizer-led social activity.',
      'community-rights and visibility node',
      array['social','festival']::text[],
      'Program-led schedule. Check official channels before going.',
      'https://www.instagram.com/pridemalaga/',
      'Plaza de la Constitucion, Distrito Centro, Malaga, Spain',
      36.7219,
      -4.4213
    ),
    (
      'Naoussa Tavern',
      'santorini',
      'restaurant',
      'Queer-friendly Fira dining stop with terrace seating and evening social crossover.',
      'queer-friendly fira dining social',
      array['social','chill']::text[],
      'Daily 12:00-24:00.',
      'https://www.naoussa-restaurant.com/',
      'Fira Town, Santorini, Greece',
      36.4190,
      25.4314
    ),
    (
      'Koo Club Santorini',
      'santorini',
      'club',
      'Open-air summer club in Fira with queer-traveler crossover and late dance-floor sessions.',
      'summer dance-floor pressure',
      array['mixed','massive']::text[],
      'May-Sep daily 23:00-05:00.',
      'https://www.instagram.com/kooclub_official/',
      'Fira Town, Santorini, Greece',
      36.4203,
      25.4316
    ),
    (
      'Tropical Bar Santorini',
      'santorini',
      'bar',
      'Caldera-view cocktail terrace with queer-friendly social energy and sunset-to-late flow.',
      'sunset cocktails and queer-friendly terrace',
      array['social','chill']::text[],
      'Daily 18:00-02:00.',
      'https://www.instagram.com/tropicalbarsantorini/',
      'Mitropoleos, Fira, Santorini, Greece',
      36.4185,
      25.4307
    ),
    (
      'Murphy''s Bar Santorini',
      'santorini',
      'bar',
      'Lively nightlife bar with queer-traveler crossover and holiday-night energy.',
      'late-night mixed crowd singalong lane',
      array['mixed','pop']::text[],
      'Daily 20:00-03:00.',
      'https://www.instagram.com/murphysbarsantorini/',
      'Fira Town, Santorini, Greece',
      36.4194,
      25.4318
    ),
    (
      'Vlychada Beach Route',
      'santorini',
      'cruising_area',
      'South Santorini beach route known for queer-friendly daytime relaxation and sunset social drift.',
      'queer-friendly beach drift and sunset reset',
      array['cruise','chill']::text[],
      'Daily all day; highest social activity from afternoon to sunset.',
      '',
      'Vlychada Beach, Santorini, Greece',
      36.3397,
      25.4305
    ),
    (
      'Cactus',
      'naples',
      'cruise_club',
      'Friendly central Naples cruise club with bar, labyrinth, and cabin setup.',
      'compact centro cruise momentum',
      array['cruise']::text[],
      'Thu 22:00-02:00, Fri-Sat 22:00-04:00.',
      'https://cactusnapoli.it/',
      'Via Leopoldo Rodino 8, Piazza Portanova, Naples, Italy',
      40.8495,
      14.2626
    ),
    (
      'Depot Napoli',
      'naples',
      'cruise_club',
      'Popular Naples cruise venue with bar and labyrinth sections.',
      'labyrinth club with younger pull',
      array['cruise','mixed']::text[],
      'Tue-Thu 22:00-03:00, Fri 22:00-04:00, Sat 22:00-05:00, Sun 16:00/22:00-03:00.',
      'https://www.facebook.com/DPTNA',
      'Via della Veterinaria 72, Naples, Italy',
      40.8669,
      14.2728
    ),
    (
      'MenXtreme',
      'naples',
      'club',
      'Monthly men-only party format centered on fetish-coded dress themes and dance-floor pressure.',
      'dresscode-driven men-only party pressure',
      array['fetish','men_only']::text[],
      'Event-led Saturdays, typically from 23:00.',
      'https://www.instagram.com/menxtremenapoli/',
      'City Under The Wall, Centro Direzionale Isola E1, Naples, Italy',
      40.8530,
      14.2860
    ),
    (
      'Vault 21',
      'naples',
      'club',
      'Naples queer party platform with electronic tilt and community nightlife crossover.',
      'queer party crossover with electronic edge',
      array['electronic','mixed']::text[],
      'Event-led schedule. Check official channels before going.',
      'https://www.instagram.com/vault21_napoli/',
      'Naples, Italy',
      40.8518,
      14.2681
    ),
    (
      'Le Streghe',
      'naples',
      'bar',
      'Queer-friendly social bar with aperitivo start and denser late-night weekend flow.',
      'social aperitivo-to-late queer lane',
      array['social','mixed']::text[],
      'Wed-Sun 20:00-03:00.',
      'https://www.instagram.com/le_streghe_napoli/',
      'Centro Storico, Naples, Italy',
      40.8499,
      14.2541
    ),
    (
      'KCarre',
      'naples',
      'club',
      'Pop-led nightlife room used for queer crossover nights with younger social momentum.',
      'pop-night dance room with mixed queer signal',
      array['pop','mixed']::text[],
      'Fri-Sat 23:00-04:00.',
      'https://www.instagram.com/kcarre_napoli/',
      'Naples, Italy',
      40.8429,
      14.2488
    ),
    (
      'Blu Angels',
      'naples',
      'sauna',
      'Long-running gay sauna and wellness hub in Naples.',
      'south-italy sauna infrastructure anchor',
      array['relax','cruise']::text[],
      'Daily 13:00-21:00.',
      'https://www.arco.lgbt/en/club/blu-angels/',
      'Centro Direzionale Isola A7, Via Taddeo da Sessa, Naples, Italy',
      40.8547,
      14.2854
    ),
    (
      'Stonewall Sauna',
      'tenerife',
      'sauna',
      'Men-focused Tenerife sauna in Adeje with steam, jacuzzi, and darkroom energy.',
      'adeje cruise-sauna pressure room',
      array['relax','cruise']::text[],
      'Mon, Wed-Sat 16:00-23:30, Sun 16:00-21:00, Tue closed.',
      'https://www.saunastonewall.com/',
      'Adeje, Tenerife, Spain',
      28.1220,
      -16.7263
    ),
    (
      'Habasko',
      'tenerife',
      'bar',
      'Puerto de la Cruz gay bar with terrace spillover and darkroom-coded late social flow.',
      'puerto local gay bar with darkroom edge',
      array['social','cruise']::text[],
      'Daily 22:00-02:00.',
      'https://www.facebook.com/BarHabasko',
      'Avenida Familia Bethencourt y Molina 15, Puerto de la Cruz, Tenerife, Spain',
      28.4133,
      -16.5487
    ),
    (
      'Jet Lag',
      'tenerife',
      'bar',
      'Compact nightlife bar with queer-coded social traffic and dance crossover in the evening run.',
      'late social dance crossover',
      array['mixed','social']::text[],
      'Thu-Sun 22:00-03:00.',
      'https://www.instagram.com/jetlagtenerife/',
      'Santa Cruz de Tenerife, Spain',
      28.4636,
      -16.2518
    ),
    (
      'Villa Maspalmeras',
      'tenerife',
      'hotel',
      'Gay guesthouse with pool and low-noise social comfort for longer stays in Tenerife north.',
      'gay guesthouse with pool-reset calm',
      array['relax','cozy']::text[],
      'Open all year.',
      'https://www.villamaspalmeras.co.uk/',
      'Vista Panoramica 20, Santa Ursula, Tenerife, Spain',
      28.4311,
      -16.4912
    ),
    (
      'Playa de la Tejita Route',
      'tenerife',
      'cruising_area',
      'Community-known beach route with daytime nudist sections and sunset social movement.',
      'nude beach social drift and sunset cruising',
      array['cruise','chill']::text[],
      'Daily all day; strongest social flow in late afternoon and evening.',
      '',
      'Playa de la Tejita, El Medano, Tenerife, Spain',
      28.0450,
      -16.5545
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
      'Malaga Pride Community March',
      'malaga',
      'Annual city Pride visibility march format in Malaga with community programming and nightlife continuation.',
      'https://www.instagram.com/pridemalaga/',
      null::date,
      null::date,
      null::date,
      'Plaza de la Constitucion, Malaga, Spain',
      36.7219,
      -4.4213,
      'festival social',
      array['festival','social']::text[]
    ),
    (
      'Napoli Pride 2026',
      'naples',
      'Naples flagship Pride calendar with public march, rights programming, and citywide queer nightlife momentum.',
      'https://napolipride.org/',
      '2026-06-27'::date,
      '2026-06-27'::date,
      '2026-06-27'::date,
      'Piazza Municipio, Naples, Italy',
      40.8389,
      14.2545,
      'festival massive',
      array['festival','massive']::text[]
    ),
    (
      'MenXtreme Party Series',
      'naples',
      'Recurring men-only dresscode party in Naples with fetish-coded dance-floor energy.',
      'https://www.instagram.com/menxtremenapoli/',
      null::date,
      null::date,
      null::date,
      'Centro Direzionale Isola E1, Naples, Italy',
      40.8530,
      14.2860,
      'fetish after',
      array['fetish','after']::text[]
    ),
    (
      'Santorini Summer Queer Nights',
      'santorini',
      'Seasonal queer-friendly nightlife wave across Fira bars and clubs, strongest in high summer.',
      'https://www.instagram.com/kooclub_official/',
      null::date,
      null::date,
      null::date,
      'Fira, Santorini, Greece',
      36.4198,
      25.4315,
      'social mixed',
      array['social','mixed']::text[]
    ),
    (
      'ARN Culture & Business Pride Tenerife',
      'tenerife',
      'Tenerife Pride framework combining culture, business networking, and nightlife-linked visibility programming.',
      'https://www.arnculturebusinesspride.com/',
      null::date,
      null::date,
      null::date,
      'Santa Cruz de Tenerife, Spain',
      28.4636,
      -16.2518,
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
