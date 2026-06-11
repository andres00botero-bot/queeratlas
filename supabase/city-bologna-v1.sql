-- Queer Atlas: Bologna city package
-- Verified 2026-06-11 against official venue, organizer, and community pages.
-- Safe to run multiple times.
--
-- Notes:
-- - Bologna Pride is included in the guide but not inserted as an event until
--   its organizer publishes a confirmed 2026 date.
-- - Restaurant-style venues use the live-compatible places type "cafe".

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
      'Il Barattolo',
      'bologna',
      'bar',
      'Compact LGBTQ+ bar and community meeting point near the university quarter, known for affordable drinks, themed evenings, karaoke, and a friendly local crowd.',
      'small community-led queer bar',
      array['social','cozy','mixed']::text[],
      'Evening opening varies by program; check the official social page before visiting.',
      'https://www.facebook.com/barattolo.bo/',
      'Via del Borgo di San Pietro 26/A, 40126 Bologna BO, Italy',
      44.5014,
      11.3502
    ),
    (
      'Cassero LGBTQIA+ Center',
      'bologna',
      'club',
      'Bologna''s landmark LGBTQIA+ association and cultural center, hosting club nights, talks, exhibitions, performances, support projects, and community programming.',
      'historic community culture and party hub',
      array['cultural','social','drag']::text[],
      'Event-led schedule. Check the official calendar for doors, tickets, and venue details.',
      'https://cassero.it/',
      'Via Don Giovanni Minzoni 18, 40121 Bologna BO, Italy',
      44.5027,
      11.3344
    ),
    (
      'Red Club',
      'bologna',
      'club',
      'Long-running LGBTQ+ Saturday club outside the historic center with dance floors, themed parties, drag, pop, commercial music, and late-night shuttle information published for selected events.',
      'large Saturday queer dance club',
      array['pop','drag','social']::text[],
      'Primarily Saturday nights, usually from late evening until early morning. Check the current event listing.',
      'https://www.redbologna.it/',
      'Via del Tipografo 2, 40138 Bologna BO, Italy',
      44.4898,
      11.4048
    ),
    (
      'Styx Club',
      'bologna',
      'cruise_club',
      'Men-only Arco-affiliated cruise club close to Bologna Centrale, with themed dress-code nights and a late weekend schedule.',
      'men-only cruise and fetish club',
      array['men_only','fetish','cruise']::text[],
      'Tue-Thu 21:00-02:00, Fri-Sat 21:00-04:00, Sun 15:00-20:00; verify holiday changes.',
      'https://www.styxclub.it/',
      'Viale Pietro Pietramellara 3, 40121 Bologna BO, Italy',
      44.5046,
      11.3379
    ),
    (
      'Steam Sauna Bologna',
      'bologna',
      'sauna',
      'Established men-only gay sauna north of the center with Finnish sauna, Turkish bath, whirlpool, pool, relaxation areas, cabins, bar, massage options, and seasonal outdoor space.',
      'men-only sauna with pool and garden',
      array['men_only','relax','cruise']::text[],
      'Mon-Fri 12:00-23:00, Sat 12:00-24:00, Sun 12:00-23:00; verify special-event hours.',
      'https://www.steamsauna.it/',
      'Via Ferrarese 22/I, 40128 Bologna BO, Italy',
      44.5130,
      11.3505
    ),
    (
      'Cosmos Club',
      'bologna',
      'sauna',
      'Men-only sauna near Bologna Centrale offering sauna and steam facilities, whirlpool, cabins, cruising areas, bar service, and rotating themed days.',
      'central men-only wellness and cruise sauna',
      array['men_only','relax','cruise']::text[],
      'Daily 13:00-23:00; Friday and Saturday commonly extend to midnight. Confirm the current timetable.',
      'https://www.cosmosclub.eu/',
      'Via Cesare Boldrini 16, 40121 Bologna BO, Italy',
      44.5049,
      11.3370
    ),
    (
      'Sfoglia Rina',
      'bologna',
      'cafe',
      'Popular central fresh-pasta kitchen and cafe with handmade regional dishes, a relaxed daytime format, and a location that works well before exploring Bologna''s historic core.',
      'welcoming fresh-pasta lunch stop',
      array['cozy','cultural','social']::text[],
      'Daily 09:00-21:00; kitchen and holiday hours can vary.',
      'https://www.sfogliarina.it/',
      'Via Castiglione 5/B, 40124 Bologna BO, Italy',
      44.4927,
      11.3460
    ),
    (
      'Aemilia Hotel Bologna',
      'bologna',
      'hotel',
      'Modern gay-friendly hotel east of the university quarter with contemporary rooms, restaurant, fitness room, private parking, and a seasonal rooftop terrace overlooking Bologna.',
      'inclusive central design stay with rooftop views',
      array['luxury','relax','mixed']::text[],
      'Hotel reception operates daily; restaurant and rooftop hours vary by season.',
      'https://www.aemiliahotel.it/en/',
      'Via Giovanna Zaccherini Alvisi 16, 40138 Bologna BO, Italy',
      44.4949366,
      11.3599435
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
      'Il Cinema Ritrovato 2026',
      'bologna',
      'International restored-film festival with screenings across central Bologna and major open-air evenings in Piazza Maggiore.',
      'https://festival.ilcinemaritrovato.it/en/',
      '2026-06-20'::date,
      '2026-06-20'::date,
      '2026-06-28'::date,
      'Piazza Maggiore and partner cinemas, Bologna, Italy',
      44.4939,
      11.3430,
      'open-air cinema and city culture',
      array['cultural','festival','social']::text[]
    ),
    (
      'Festa di San Petronio 2026',
      'bologna',
      'Bologna''s city-patron celebration centered on Piazza Maggiore, with civic, cultural, and public programming across the historic center.',
      'https://www.bolognawelcome.com/en/events/celebrations-anniversaries/saint-petronius-feast-day',
      '2026-10-04'::date,
      '2026-10-04'::date,
      '2026-10-04'::date,
      'Piazza Maggiore, 40124 Bologna BO, Italy',
      44.4939,
      11.3430,
      'historic-center public celebration',
      array['cultural','festival','social']::text[]
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

with new_services (
  name,
  city,
  type,
  provider_name,
  contact,
  booking_link,
  description,
  hours,
  link,
  image_urls,
  location,
  lat,
  lng,
  price_tier,
  vibe,
  vibe_tags,
  source,
  "lastChecked",
  verified
) as (
  values
    (
      'Cassero Community and Cultural Support',
      'bologna',
      'other',
      'Cassero LGBTQIA+ Center',
      null::text,
      'https://cassero.it/',
      'LGBTQIA+ community center providing cultural programming, information, advocacy projects, social activities, and connections to local support initiatives.',
      'Office, project, and event hours vary; use the official website for the relevant service.',
      'https://cassero.it/',
      array[]::text[],
      'Via Don Giovanni Minzoni 18, 40121 Bologna BO, Italy',
      44.5027,
      11.3344,
      '$',
      'community information and support',
      array['cultural','social']::text[],
      'Cassero LGBTQIA+ Center official website',
      '2026-06-11'::date,
      true
    ),
    (
      'BLQ Checkpoint',
      'bologna',
      'wellness',
      'PLUS APS / BLQ Checkpoint',
      null::text,
      'https://www.blqcheckpoint.it/',
      'Community-based sexual-health service offering rapid HIV and STI testing, prevention information, counseling, and referral support in a non-judgmental setting.',
      'Testing sessions are appointment-led and vary by week; consult the official booking calendar.',
      'https://www.blqcheckpoint.it/',
      array[]::text[],
      'Via San Carlo 42/C, 40121 Bologna BO, Italy',
      44.5004,
      11.3377,
      '$',
      'confidential community sexual health',
      array['relax','social']::text[],
      'BLQ Checkpoint official website',
      '2026-06-11'::date,
      true
    ),
    (
      'IGOR Libreria',
      'bologna',
      'other',
      'IGOR Libreria',
      null::text,
      'https://www.instagram.com/igor.libreria/',
      'Independent LGBTQIA+ and feminist bookshop carrying queer literature, essays, comics, and small-press work while hosting readings and community events.',
      'Retail and event hours vary; check the official social page before visiting.',
      'https://www.instagram.com/igor.libreria/',
      array[]::text[],
      'Via Santa Croce 10, 40122 Bologna BO, Italy',
      44.4960,
      11.3297,
      '$$',
      'queer books and community culture',
      array['cultural','cozy','social']::text[],
      'IGOR Libreria official social page; Patroc Bologna guide',
      '2026-06-11'::date,
      true
    ),
    (
      'MIT Trans Support and Advocacy',
      'bologna',
      'other',
      'Movimento Identita Trans',
      '+39 051 271666',
      'https://mit-italia.it/',
      'Bologna-based trans organization providing information, advocacy, social and legal orientation, health pathways, and community support.',
      'Office and consultation hours vary; contact MIT directly before visiting.',
      'https://mit-italia.it/',
      array[]::text[],
      'Via Polese 22, 40122 Bologna BO, Italy',
      44.5010,
      11.3350,
      '$',
      'trans-led support and rights advocacy',
      array['social','cultural']::text[],
      'Movimento Identita Trans official website',
      '2026-06-11'::date,
      true
    )
)
insert into public.services (
  name,
  city,
  type,
  provider_name,
  contact,
  booking_link,
  description,
  hours,
  link,
  image_urls,
  location,
  lat,
  lng,
  price_tier,
  vibe,
  vibe_tags,
  source,
  "lastChecked",
  verified
)
select
  ns.name,
  ns.city,
  ns.type,
  ns.provider_name,
  ns.contact,
  ns.booking_link,
  ns.description,
  ns.hours,
  ns.link,
  ns.image_urls,
  ns.location,
  ns.lat,
  ns.lng,
  ns.price_tier,
  ns.vibe,
  ns.vibe_tags,
  ns.source,
  ns."lastChecked",
  ns.verified
from new_services ns
where not exists (
  select 1
  from public.services s
  where lower(s.city) = lower(ns.city)
    and lower(s.name) = lower(ns.name)
);

commit;

select 'places' as category, count(*) as total
from public.places
where lower(city) = 'bologna'

union all

select 'events', count(*)
from public.events
where lower(city) = 'bologna'

union all

select 'services', count(*)
from public.services
where lower(city) = 'bologna';
