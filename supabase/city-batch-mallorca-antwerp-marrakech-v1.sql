-- Queer Atlas city batch v1
-- Cities: mallorca, antwerp, marrakech
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
      'Bar Flexas',
      'mallorca',
      'bar',
      'Long-running Palma social landmark with cabaret energy, mixed queer crowd, and a local-first vibe that turns warm and loud as the night builds.',
      'historic old-town queer-social icon',
      array[''social'',''chill'']::text[],
      'Tue-Thu 18:30-01:00, Fri-Sat 12:00-02:00, Sun-Mon closed.',
      'https://barflexas.com/',
      'Carrer de la Llotgeta, 12, 07002 Palma, Illes Balears, Spain',
      39.5697,
      2.6494
    ),
    (
      'Dark Cruising Bar',
      'mallorca',
      'cruise_club',
      'Palma cruise-club format with darkroom infrastructure, themed adult nights, and a steady late-hours social loop.',
      'late-night men-only cruise pressure room',
      array[''cruise'',''after'']::text[],
      'Sun-Thu 20:00-03:00, Fri-Sat 21:00-04:00.',
      'https://www.darkcruisingmallorca.com/',
      'Carrer de Ticia, 22, 07003 Palma, Illes Balears, Spain',
      39.5724,
      2.6476
    ),
    (
      'Wave Club Mallorca',
      'mallorca',
      'club',
      'Weekend-heavy dance room used for pop-forward queer crossover nights and event-led party spikes.',
      'post-midnight dancefloor release',
      array[''mixed'',''pop'']::text[],
      'Thu-Sat 23:59-06:00, Sun-Wed closed.',
      'https://www.instagram.com/wave.club.mallorca/',
      'Carrer Poima, 24A, Ponent, 07011 Palma, Illes Balears, Spain',
      39.5882,
      2.6228
    ),
    (
      'Fucktory Mallorca',
      'mallorca',
      'club',
      'Queer party format known for harder dance pressure, nightlife edge, and rotating late-night programming.',
      'queer-techno and body-positive after lane',
      array[''electronic'',''after'',''underground'']::text[],
      'Event-led late schedule, strongest Fri-Sat nights.',
      'https://www.instagram.com/fucktory.mallorca/',
      'Poligon Son Castello area, Palma, Spain',
      39.6032,
      2.6642
    ),
    (
      'Ben Amics Community Hub',
      'mallorca',
      'cafe',
      'Core LGTBI+ organization anchor in Mallorca used for rights support, community updates, and local advocacy programming.',
      'rights-led lgbti+ support and culture node',
      array[''social'',''cultural'']::text[],
      'Community-office schedule varies by program and campaign windows.',
      'https://benamics.com/',
      'Carrer General Riera, 3, 07003 Palma, Illes Balears, Spain',
      39.5765,
      2.6506
    ),
    (
      'ELLA Community House',
      'mallorca',
      'cafe',
      'Community-facing base used by ELLA networks for festival coordination, social meetups, and visibility projects in Palma.',
      'queer-women and non-binary community base',
      array[''social'',''festival'']::text[],
      'Programming schedule varies by season and festival cycle.',
      'https://www.ellafestival.com/',
      'Carrer de la Fabrica, 41B, 07013 Palma, Illes Balears, Spain',
      39.5701,
      2.6367
    ),
    (
      'Palma Old Town Night Route',
      'mallorca',
      'cruising_area',
      'Practical evening route linking social bars, dance rooms, and late-night movement through central Palma.',
      'old-town social-to-club transition route',
      array[''social'',''chill'']::text[],
      'Nightly social flow, strongest Thu-Sat 20:00-03:00.',
      '',
      'Old Town Palma, around Llotgeta and Placa Mercat, 07002 Palma, Spain',
      39.5702,
      2.6499
    ),
    (
      'Cafe DeLux',
      'antwerp',
      'bar',
      'LGBTQ-popular Antwerp bar with broad mixed crowd, easy drop-in flow, and strong pre-club momentum.',
      'city-center pregame and terrace social',
      array[''social'']::text[],
      'Sun-Thu 15:00-01:00, Fri-Sat 15:00-03:00.',
      'https://www.cafedelux.be/',
      'Melkmarkt 14, 2000 Antwerpen, Belgium',
      51.2203,
      4.4002
    ),
    (
      'Cafe den Draak',
      'antwerp',
      'bar',
      'Long-standing queer-friendly Antwerp address with classic bar cadence and local regular visibility.',
      'local queer-neighborhood bar rhythm',
      array[''social'',''cozy'']::text[],
      'Tue-Thu 16:00-01:00, Fri-Sat 16:00-03:00, Sun 16:00-24:00, Mon closed.',
      'https://www.facebook.com/dendraakantwerp/',
      'Draakplaats 1, 2018 Antwerpen, Belgium',
      51.2064,
      4.4217
    ),
    (
      'Hessenhuis Cafe',
      'antwerp',
      'bar',
      'Historic-center bar with regular queer crossover and event-night crowd density around Hessenplein.',
      'historic square queer-crossover energy',
      array[''mixed'',''social'']::text[],
      'Mon-Thu 16:00-01:00, Fri-Sat 14:00-03:00, Sun 14:00-01:00.',
      'https://www.instagram.com/hessenhuiscafe/',
      'Falconrui 53, 2000 Antwerpen, Belgium',
      51.2233,
      4.4043
    ),
    (
      'Club Random',
      'antwerp',
      'club',
      'High-output Antwerp queer club with dancefloor, social lounges, and cruise-adjacent late-night programming.',
      'queer dance-and-cruise afterhours engine',
      array[''mixed'',''after'']::text[],
      'Event-led. Darklands and Pride weekends run extended hours.',
      'https://www.clubrandom.be/',
      'Verversrui 15, 2000 Antwerpen, Belgium',
      51.2238,
      4.4019
    ),
    (
      'Cargo Club',
      'antwerp',
      'club',
      'Large Antwerp club venue hosting recurring queer events, Pride-linked nights, and peak-weekend dance formats.',
      'big-room pride-week and queer-crossover pressure',
      array[''mixed'',''electronic'']::text[],
      'Sat 23:00-07:00 plus event nights.',
      'https://www.cargoclub.be/',
      'Lange Schipperskapelstraat 11-13, 2000 Antwerpen, Belgium',
      51.2219,
      4.4009
    ),
    (
      'The Boots',
      'antwerp',
      'cruise_club',
      'Men-focused Antwerp cruise venue known for themed dress-code nights and darker social infrastructure.',
      'men-focused cruise maze with themed nights',
      array[''cruise'',''fetish'']::text[],
      'Tue-Thu 20:00-02:00, Fri-Sat 20:00-05:00, Sun 16:00-22:00, Mon closed.',
      'https://www.the-boots.com/',
      'Van Schoonbekeplein 17, 2000 Antwerpen, Belgium',
      51.2286,
      4.4122
    ),
    (
      'Gay Sauna ''t Herenhuis',
      'antwerp',
      'sauna',
      'Men-focused Antwerp sauna with steam, cabins, and late social tempo used as both reset and nightlife extension point.',
      'daily sauna reset with local male crowd',
      array[''relax'',''cruise'']::text[],
      'Sun-Thu 12:00-24:00, Fri-Sat 12:00-01:00.',
      'https://www.gaysaunaherenhuis.be/',
      'De Lescluzestraat 63, 2600 Antwerpen, Belgium',
      51.1976,
      4.4324
    ),
    (
      'Scheldekaaien Pride Route',
      'antwerp',
      'cruising_area',
      'Large-scale social route linking Antwerp Pride parade close, Love United festival grounds, and nearby late venues.',
      'parade-to-festival queer mass flow',
      array[''festival'',''social'']::text[],
      'Event-led with strongest movement during Pride week evenings.',
      'https://www.antwerppride.com/',
      'Scheldekaaien Zuid, 2000 Antwerpen, Belgium',
      51.2155,
      4.3991
    ),
    (
      'Comptoir Darna',
      'marrakech',
      'club',
      'Marrakech nightlife institution blending dinner, live performance, and late-party energy in one route-stable format.',
      'hivernage dinner-show and late-club institution',
      array[''mixed'',''cultural'']::text[],
      'Daily 19:00-03:00 (restaurant 19:00-01:00, patio/club until 03:00).',
      'https://www.comptoirmarrakech.com/',
      'Avenue Echouhada, Hivernage, 40000 Marrakech, Morocco',
      31.6241,
      -8.0105
    ),
    (
      'Kabana Rooftop',
      'marrakech',
      'bar',
      'High-visibility rooftop social venue near Koutoubia with long hours, DJ evenings, and mixed local-international flow.',
      'medina-view rooftop with dj-led social surge',
      array[''social'',''mixed'']::text[],
      'Daily 11:00-02:00.',
      'https://www.kabana-marrakech.com/',
      'Kissariat Ben Khaled, 1 Rue Fatima Zahra, Marrakech 40000, Morocco',
      31.6231,
      -7.9922
    ),
    (
      'Montecristo Marrakech',
      'marrakech',
      'club',
      'Established Gueliz nightlife complex with live-bar, club, and sky-lounge layers that run deep into early morning.',
      'gueliz four-room nightlife machine',
      array[''mixed'',''after'']::text[],
      'Daily 19:30-05:00.',
      'https://www.montecristo-marrakech.com/en/',
      '20 Rue Ibn Aicha, Gueliz, Marrakech 40000, Morocco',
      31.6368,
      -8.0087
    ),
    (
      'Theatro Nightclub',
      'marrakech',
      'club',
      'Large-format Marrakech nightclub with stage shows, international DJs, and high-output late-hour dance pressure.',
      'high-production show club until dawn',
      array[''pop'',''mixed'']::text[],
      'Daily 23:30-05:00.',
      'https://www.essaadi.com/en/theatro-night-club/',
      'Es Saadi Resort, Rue Ibrahim El Mazini, Hivernage, Marrakech 40000, Morocco',
      31.6227,
      -8.0143
    ),
    (
      'L''Envers',
      'marrakech',
      'bar',
      'Gueliz bar with mixed crowd, live music patterns, and social afterwork tempo that stretches into nightlife mode.',
      'gueliz art-bar afterwork-to-night transition',
      array[''social'',''chill'']::text[],
      'Daily 17:00-02:00.',
      'https://www.facebook.com/lenversmarrakech/',
      '29 Rue Ibn Aicha, Gueliz, Marrakech 40000, Morocco',
      31.6365,
      -8.0083
    ),
    (
      'Le 68',
      'marrakech',
      'bar',
      'Compact wine-bar format in Gueliz popular for social starts, date-night pacing, and small-group queer crossover.',
      'wine-and-social lounge with mixed queer crossover',
      array[''chill'',''social'']::text[],
      'Tue-Sun 18:00-01:00, Mon closed.',
      'https://www.instagram.com/68baravinmarrakech/',
      '68 Rue de la Liberte, Gueliz, Marrakech 40000, Morocco',
      31.6362,
      -8.0094
    ),
    (
      'Gueliz Night Route',
      'marrakech',
      'cafe',
      'Practical nightlife route through Gueliz linking bars, club rooms, and mixed social points with a discretion-first approach.',
      'route-based social movement under local caution',
      array[''social'',''cultural'']::text[],
      'Evening-to-late social flow, strongest Thu-Sat 21:00-02:00.',
      '',
      'Rue Ibn Aicha and adjacent Gueliz lanes, Marrakech, Morocco',
      31.6367,
      -8.0082
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
      'ELLA Festival Mallorca 2026',
      'mallorca',
      'International lesbian, queer-women, and non-binary summer festival in Palma with parties, talks, beach programming, and community sessions.',
      'https://www.ellafestival.com/',
      '2026-08-27'::date,
      '2026-08-27'::date,
      '2026-09-04'::date,
      'Palma de Mallorca, Spain',
      39.5696,
      2.6502,
      'festival social',
      array[''festival'',''social'']::text[]
    ),
    (
      'ELLA Main Party 2026',
      'mallorca',
      'ELLA Festival flagship party night with international DJs, performance programming, and high-volume queer dancefloor energy.',
      'https://www.ellafestival.com/mallorca',
      '2026-08-29'::date,
      '2026-08-29'::date,
      '2026-08-29'::date,
      'Poligon Son Castello, Palma, Spain',
      39.6032,
      2.6642,
      'festival electronic',
      array[''festival'',''electronic'']::text[]
    ),
    (
      'Orgull Mallorca Community Week',
      'mallorca',
      'Ben Amics community-led Pride programming window with social events, rights visibility, and local LGTBI+ organizing in Palma.',
      'https://benamics.com/',
      '2026-06-28'::date,
      '2026-06-22'::date,
      '2026-06-28'::date,
      'Palma de Mallorca, Spain',
      39.5765,
      2.6506,
      'festival social',
      array[''festival'',''social'']::text[]
    ),
    (
      'Antwerp Pride 2026',
      'antwerp',
      'Five-day Pride program in Antwerp with official events, parade week programming, and citywide LGBTQIA+ cultural visibility.',
      'https://www.antwerppride.com/',
      '2026-08-05'::date,
      '2026-08-05'::date,
      '2026-08-09'::date,
      'Antwerp, Belgium',
      51.2204,
      4.4025,
      'festival social',
      array[''festival'',''social'']::text[]
    ),
    (
      'Antwerp Pride Parade 2026',
      'antwerp',
      'Main Antwerp Pride parade crossing central city lanes before festival close on the Scheldt riverside.',
      'https://antwerppride.com/programma',
      '2026-08-08'::date,
      '2026-08-08'::date,
      '2026-08-08'::date,
      'Antwerp city center, Belgium',
      51.2182,
      4.4076,
      'festival social',
      array[''festival'',''social'']::text[]
    ),
    (
      'Love United Festival 2026',
      'antwerp',
      'Official Antwerp Pride festival block on the Scheldekaaien with multi-stage music programming and high-density community turnout.',
      'https://antwerppride.com/calendar/love-united',
      '2026-08-08'::date,
      '2026-08-08'::date,
      '2026-08-08'::date,
      'Scheldekaaien Zuid, Antwerpen, Belgium',
      51.2155,
      4.3991,
      'festival electronic',
      array[''festival'',''electronic'']::text[]
    ),
    (
      'Darklands Festival 2026',
      'antwerp',
      'Major leather and fetish festival week in Antwerp with market, workshops, nightlife events, and international crowd volume.',
      'https://darklands.be/',
      '2026-03-03'::date,
      '2026-03-03'::date,
      '2026-03-09'::date,
      'Waagnatie Expo & Events, Rijnkaai 150, Antwerpen, Belgium',
      51.2317,
      4.4032,
      'fetish festival',
      array[''fetish'',''festival'']::text[]
    ),
    (
      'Marrakech International Film Festival 2026',
      'marrakech',
      'Major international film festival in Marrakech featuring global cinema, Arab and African focus, and large cultural turnout.',
      'https://marrakech-festival.com/en/the-festival/',
      '2026-11-20'::date,
      '2026-11-20'::date,
      '2026-11-28'::date,
      'Marrakech, Morocco',
      31.6295,
      -8.0093,
      'cultural festival',
      array[''cultural'',''festival'']::text[]
    ),
    (
      'Atlas Workshops 2026',
      'marrakech',
      'Industry and talent-development program hosted by the Marrakech film festival, supporting emerging Moroccan, Arab, and African filmmakers.',
      'https://atlasateliers.marrakech-festival.com/',
      '2026-11-22'::date,
      '2026-11-22'::date,
      '2026-11-26'::date,
      'Marrakech, Morocco',
      31.6295,
      -8.0093,
      'cultural social',
      array[''cultural'',''social'']::text[]
    ),
    (
      '1-54 Marrakech Contemporary Art Fair 2026',
      'marrakech',
      'Annual contemporary African art fair edition in Marrakech with strong international cultural attendance and queer-curious creative crossover.',
      'https://www.1-54.com/',
      '2026-02-05'::date,
      '2026-02-05'::date,
      '2026-02-08'::date,
      'La Mamounia, Marrakech, Morocco',
      31.6253,
      -8.0108,
      'cultural social',
      array[''cultural'',''social'']::text[]
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
