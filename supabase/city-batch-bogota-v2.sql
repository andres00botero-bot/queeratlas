-- Queer Atlas city batch v2
-- City: bogota
-- Includes: new places + events discovered from multi-source research
-- Idempotent inserts (dedupe by lower(city)+lower(name))
-- Links: official websites / Instagram / Facebook / organization pages only.

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
      'Disco Jaguar',
      'bogota',
      'club',
      'High-friction Chapinero night room with dual-floor energy and a playful camp edge. Strong Friday/Saturday acceleration point when your plan is loud music and full late-night motion.',
      'kitsch-electro chapinero rush',
      array['mixed','electronic']::text[],
      'Fri-Sat 21:00-04:30, Sun-Thu closed.',
      'https://www.instagram.com/discojaguar.bta/',
      'Ak 7 #59-30, Chapinero, Bogota, Colombia',
      4.6489,
      -74.0628
    ),
    (
      'Video Club',
      'bogota',
      'club',
      'Industrial multi-floor format split between underground electronic pressure and reggaeton-heavy social floors.',
      'warehouse techno-reggaeton crossover',
      array['electronic','mixed']::text[],
      'Fri-Sat 21:00-05:00, Sun-Thu closed.',
      'https://www.instagram.com/videoclubx/',
      'Cl. 64 #13-09, Chapinero, Bogota, Colombia',
      4.6551,
      -74.0621
    ),
    (
      'Bar Chiquita Bogota',
      'bogota',
      'club',
      'Compact queer party room with strong drag cadence and heavy 90s/2000s pop nostalgia.',
      'drag-pop singalong pressure',
      array['drag','pop']::text[],
      'Wed-Thu 21:00-02:00, Fri-Sat 21:00-04:00, Sun 21:00-03:00, Mon-Tue closed.',
      'https://www.barchiquita.com/en/bar-chiquita-bogota/',
      'Carrera 12a #79-25, Chapinero, Bogota, Colombia',
      4.6661,
      -74.0582
    ),
    (
      'Leos Bar Mistica',
      'bogota',
      'bar',
      'Multi-floor queer marathon lane with drag sets, reggaeton lift, and a mixed-age crowd that arrives early and leaves late.',
      'multi-floor drag-reggaeton marathon',
      array['drag','mixed']::text[],
      'Mon 13:00-05:00, Tue-Thu 14:00-05:00, Fri-Sat 13:00-05:00, Sun 14:00-05:00.',
      'https://www.instagram.com/leosbar_mistica/',
      'Cl. 59 #9-36, Chapinero, Bogota, Colombia',
      4.6485,
      -74.0617
    ),
    (
      'El Perro y La Calandria',
      'bogota',
      'bar',
      'Lower-pressure pop-led Chapinero bar used as a pre-club social step before bigger rooms.',
      'kitsch pre-club social room',
      array['social','pop']::text[],
      'Mon 17:00-03:00, Tue closed, Wed/Fri 17:00-23:59, Thu/Sat/Sun 17:00-03:00.',
      'https://www.instagram.com/elperroylacalandria/',
      'Cra. 9 #59-16, Chapinero, Bogota, Colombia',
      4.6487,
      -74.0620
    ),
    (
      'Brokeback Mountain LGBT Bar',
      'bogota',
      'cruise_club',
      'Camp-forward karaoke and dance room with strong local pull and late-night adult rhythm.',
      'karaoke-camp late lane',
      array['cruise','after']::text[],
      'Mon-Wed/Fri-Sun 15:00-04:00, Thu closed.',
      'https://www.instagram.com/brokebackmountainbar/',
      'Cl. 59 #9-34, Chapinero, Bogota, Colombia',
      4.6485,
      -74.0619
    ),
    (
      'La Estacion Cafe Chapinero',
      'bogota',
      'cafe',
      'Softer pregame room with bar-food comfort and easier conversation before denser nightlife spaces.',
      'cozy pregame cocktails',
      array['social','chill']::text[],
      'Evening-to-late service; verify same-day schedule on social channels.',
      'https://www.instagram.com/laestacionchapinero/',
      'Cl. 62 #7-13, Chapinero, Bogota, Colombia',
      4.6519,
      -74.0610
    ),
    (
      'Complices SPA',
      'bogota',
      'sauna',
      'Long-running men-focused sauna institution with steady local traffic and structured afternoon/evening windows.',
      'legacy local sauna institution',
      array['relax','cruise']::text[],
      'Daily 14:00-21:00.',
      'https://complicesspa.com/',
      'Cra. 13a #38-60, Santa Fe, Bogota, Colombia',
      4.6286,
      -74.0704
    ),
    (
      'Sauna Saint Moritz',
      'bogota',
      'sauna',
      'Known Chapinero sauna with mixed-age audience and regular themed windows.',
      'mature-crowd chapinero sauna',
      array['relax','cruise']::text[],
      'Mon-Thu/Sun 13:00-21:00, Fri 13:00-22:00, Sat 13:00-23:00.',
      'https://www.instagram.com/saintmoritzsauna/',
      'Cl. 65 #13-30 piso 2, Chapinero, Bogota, Colombia',
      4.6558,
      -74.0608
    ),
    (
      'Sofitel Bogota Victoria Regia',
      'bogota',
      'hotel',
      'High-comfort queer-friendly stay base with quick transfer access to Chapinero nightlife.',
      'luxury queer-friendly stay base',
      array['luxury','mixed']::text[],
      '24-hour hotel operation; check-in/out windows vary by booking policy.',
      'https://sofitel.accor.com/en/hotels/0561.html',
      'Carrera 13 #85-80, Bogota, Colombia',
      4.6692,
      -74.0524
    ),
    (
      'HAB Hotel',
      'bogota',
      'hotel',
      'Gay-friendly boutique stay in Chapinero with fast access to bars, clubs, and dining corridors.',
      'design-forward chapinero boutique base',
      array['mixed','social']::text[],
      '24-hour hotel operation; front desk and check-in windows vary by booking policy.',
      'https://www.habhotel.com/',
      'Cra. 5 #58-07, Chapinero, Bogota, Colombia',
      4.6454,
      -74.0635
    ),
    (
      'Chapinero Night Route',
      'bogota',
      'cruising_area',
      'The corridor connecting Calle 58-65 and Carrera 7-13 is a practical nightlife movement lane between bars, clubs, and adult venues.',
      'venue-to-venue social/cruise corridor',
      array['cruise','mixed']::text[],
      'Most active Thu-Sun 20:00-04:00.',
      'https://bogotivo.com/en/queer-in-bogota/',
      'Chapinero corridor (Calle 58-65 / Carrera 7-13), Bogota, Colombia',
      4.6510,
      -74.0620
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
      'Festival por la Igualdad (Bogota)',
      'bogota',
      'City rights-and-culture program under Bogota public institutions, combining community events, visibility, and LGBTI-focused activity windows.',
      'https://www.sdp.gov.co/eventos-palabras-clave/festival-la-igualdad',
      null::date,
      null::date,
      null::date,
      'Bogota, Colombia',
      4.6296,
      -74.0892,
      'social cultural',
      array['social','cultural']::text[]
    ),
    (
      'Marcha Distrital LGBTI de Bogota',
      'bogota',
      'Major public visibility march route in Bogota with broad community participation and citywide momentum.',
      'https://bogota.gov.co/que-hacer/cultura/marcha-distrital-lgbti',
      null::date,
      null::date,
      null::date,
      'Parque Nacional to Plaza de Bolivar, Bogota, Colombia',
      4.6226,
      -74.0662,
      'festival social',
      array['festival','social']::text[]
    ),
    (
      'Kuir Bogota Queer Arts & Film Festival',
      'bogota',
      'International queer arts-and-cinema platform with screenings, performance, ballroom culture, and multidisciplinary programming.',
      'https://www.kuirbogota.com/',
      null::date,
      null::date,
      null::date,
      'Bogota, Colombia',
      4.6486,
      -74.0705,
      'cultural festival',
      array['cultural','festival']::text[]
    ),
    (
      'Ciclo Rosa (Cinemateca Distrital)',
      'bogota',
      'Long-running LGBTIQ cinema program in Bogota focused on queer film, public discussion, and cultural memory.',
      'https://bogota.gov.co/que-hacer/cultura/ciclo-rosa-en-la-cinemateca-distrital',
      null::date,
      null::date,
      null::date,
      'Cinemateca de Bogota, Colombia',
      4.6091,
      -74.0717,
      'cultural social',
      array['cultural','social']::text[]
    ),
    (
      'Groseros Party (Sunday Circuit)',
      'bogota',
      'Sunday men-focused party circuit with rotating venues and private-channel access flow.',
      'https://www.instagram.com/groserosparty/',
      null::date,
      null::date,
      null::date,
      'Rotating venues, Bogota, Colombia',
      4.6488,
      -74.0625,
      'after cruise',
      array['after','cruise']::text[]
    ),
    (
      'Angel''s Naked Party (MegaOrgy Series)',
      'bogota',
      'Rotating themed men-focused party format known for high-volume editions and strict entry rules shared via social channels.',
      'https://www.instagram.com/angelsnakedparty/',
      null::date,
      null::date,
      null::date,
      'Rotating venues, Bogota, Colombia',
      4.6488,
      -74.0625,
      'after cruise',
      array['after','cruise']::text[]
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
