-- Queer Atlas: Crete city package
-- Verified 2026-06-11 against official venue/operator pages and current travel guides.
-- Safe to run multiple times.
--
-- Intentionally excluded:
-- - YOLO Crete: reported temporarily closed while seeking a new venue.
-- - Dedicated gay sauna: none could be verified as active on Crete.

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
      'Apollo Party Crete',
      'crete',
      'club',
      'Crete''s dedicated LGBTQ+ club-night series, rotating between announced venues in Chania and Heraklion. Tickets are sold online in advance and the exact venue is published with each event.',
      'ticketed queer island party',
      array['pop','festival','social']::text[],
      'Event-led, mainly summer Thursdays and Saturdays. Check the official calendar before travel.',
      'https://www.apollopartycrete.com/',
      'Changing ticketed venues in Chania and Heraklion, Crete, Greece',
      35.5161,
      24.0180
    ),
    (
      'La Brasserie',
      'crete',
      'bar',
      'Long-running Heraklion cafe-bar with a mixed but strongly LGBTQ+ crowd later in the evening, plus cocktails, food, DJs, live music, and themed nights.',
      'gay-popular cafe-bar and late social anchor',
      array['social','mixed']::text[],
      'Tue-Sat 16:00-03:00, Sun-Mon closed.',
      'https://www.facebook.com/labrasserie/',
      'Korai 15, Heraklion 712 02, Crete, Greece',
      35.338795,
      25.134961
    ),
    (
      'Take Five',
      'crete',
      'cafe',
      'Gay-friendly Heraklion cafe-bar serving coffee, food, vegetarian and vegan options by day before shifting toward cocktails and music at night.',
      'all-day gay-friendly cafe-bar',
      array['social','cozy','mixed']::text[],
      'Sun-Thu 10:00-01:00, Fri-Sat 10:00-02:00.',
      'https://www.facebook.com/takefiveheraklion/',
      'Korai 24-26, Heraklion 712 02, Crete, Greece',
      35.3388176,
      25.1353302
    ),
    (
      'Ababa Bar',
      'crete',
      'bar',
      'Welcoming Chania Old Town cocktail bar and gallery with eclectic decor, Latin-leaning music, and a relaxed mixed crowd.',
      'art-led gay-friendly old-town bar',
      array['social','cultural','mixed']::text[],
      'Daily 10:00-03:00.',
      'https://www.facebook.com/ababa.bar/',
      'Isodion 12, Chania 731 00, Crete, Greece',
      35.516178,
      24.018141
    ),
    (
      'Avli',
      'crete',
      'cafe',
      'Refined Cretan restaurant in a restored Venetian property, recommended as a stylish and welcoming dinner stop for couples and small groups in Rethymno Old Town.',
      'romantic courtyard dining in old Rethymno',
      array['cozy','cultural','luxury']::text[],
      'Daily 08:30-00:00; call ahead for same-day dinner reservations.',
      'https://www.avli.gr/',
      'Xanthoudidou 22 & Radamanthios, Rethymno 741 00, Crete, Greece',
      35.3692,
      24.47443
    ),
    (
      'Axel Beach Crete',
      'crete',
      'hotel',
      'LGBTQIA+ Axel Hotels property in Ano Hersonissos with 40 rooms, a social pool, rooftop Skybar, Mediterranean restaurant, fitness facilities, and massage services.',
      'lgbtq-focused pool and skybar stay',
      array['social','luxury','relax']::text[],
      'Hotel operation daily in season; reception and guest-service hours follow the booking confirmation.',
      'https://www.axelhotels.com/en/axel-beach-crete/hotel/',
      'Ano Hersonissos 700 14, Crete, Greece',
      35.3059658,
      25.3723404
    ),
    (
      'Asterion Suites & Spa',
      'crete',
      'hotel',
      'Five-star beachfront resort west of Chania with a welcoming international profile, renovated rooms and suites, farm-to-table dining, and the Orion spa.',
      'adults-oriented beachfront wellness retreat',
      array['luxury','relax','mixed']::text[],
      'Hotel operation daily in season; reception and guest-service hours follow the booking confirmation.',
      'https://www.asterionsuitesandspa.com/',
      'Pyrgos Psilonerou, Platanias 730 14, Chania, Crete, Greece',
      35.516976,
      23.908437
    ),
    (
      'Domes Noruz Chania',
      'crete',
      'hotel',
      'Adults-only, LGBTQ-friendly beachfront resort at Agioi Apostoli with contemporary suites, pools, spa facilities, cocktail bars, and quick road access to Chania Old Town.',
      'adults-only beachfront design stay',
      array['luxury','relax','social']::text[],
      'Hotel operates daily; reception is available 24/7.',
      'https://www.marriott.com/en-us/hotels/herdo-domes-noruz-chania-autograph-collection/overview/',
      '5 Strati Pantelaki, Agioi Apostoli, Chania 731 00, Crete, Greece',
      35.5121402,
      23.9772992
    ),
    (
      'Esperides Resort Crete',
      'crete',
      'hotel',
      'Gay-friendly five-star resort in Koutouloufari with pools, spa and fitness facilities, restaurants, concierge support, and a seasonal private beach shuttle.',
      'gay-friendly hillside resort and spa',
      array['luxury','relax','social']::text[],
      'Hotel operation daily in season; reception and concierge hours follow the booking confirmation.',
      'https://www.esperidesresortcrete.gr/',
      'Costa Varnali Street, Koutouloufari 700 14, Hersonissos, Crete, Greece',
      35.306095,
      25.394545
    ),
    (
      'Kommos Beach',
      'crete',
      'cruising_area',
      'Long, exposed beach north of Matala with a well-established naturist section and recurring queer visibility. Respect turtle nesting areas, local signs, and other beach users.',
      'queer-popular naturist south-coast beach',
      array['chill','cruise','relax']::text[],
      'Public beach; visit in daylight. Facilities are seasonal and the shore can be windy.',
      'https://www.kommosconservancy.org/',
      'Kommos Beach access road, Pitsidia 702 00, Crete, Greece',
      35.01472,
      24.75977
    ),
    (
      'Sarantari Beach',
      'crete',
      'cruising_area',
      'Compact cove north of Hersonissos, also called Saradari in some guides, known for gay sunbathers from nearby resorts. It is a daytime beach, not a managed LGBTQ venue.',
      'small gay-popular Hersonissos cove',
      array['chill','cruise','relax']::text[],
      'Public beach; daylight use recommended. Seasonal facilities vary.',
      'https://nomadicboys.com/crete-gay-guide/',
      'Sarantari Beach, Hersonissos 700 14, Crete, Greece',
      35.33124,
      25.3852
    ),
    (
      'Kavros Beach',
      'crete',
      'cruising_area',
      'Broad north-coast beach between Kavros and Georgioupolis with a quieter dune-backed section used by LGBTQ sunbathers. Keep to public access and protect the dunes.',
      'dune-backed queer beach section',
      array['chill','cruise','relax']::text[],
      'Public beach; daylight use recommended. Facilities are concentrated near the main resort section.',
      'https://nomadicboys.com/crete-gay-guide/',
      'Kavros Beach, Paralia Kourna 730 07, Crete, Greece',
      35.34928,
      24.30533
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
      'Apollo Party Chania - 18 June 2026',
      'crete',
      'Official ticketed Apollo Party queer club night in Chania Old Town. Advance online tickets are required and the organizer releases the final venue details to attendees.',
      'https://www.apollopartycrete.com/chania',
      '2026-06-18'::date,
      '2026-06-18'::date,
      '2026-06-18'::date,
      'Old Town Venue, Chania, Crete, Greece',
      35.5161,
      24.0180,
      'queer club night',
      array['pop','festival','social']::text[]
    ),
    (
      'Apollo Party Chania - 20 June 2026',
      'crete',
      'Official Saturday Apollo Party queer club night in Chania Old Town. Advance online tickets are required and the organizer releases the final venue details to attendees.',
      'https://www.apollopartycrete.com/chania',
      '2026-06-20'::date,
      '2026-06-20'::date,
      '2026-06-20'::date,
      'Old Town Venue, Chania, Crete, Greece',
      35.5161,
      24.0180,
      'queer club night',
      array['pop','festival','social']::text[]
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
      'Axel Beach Crete Wellness & Massage',
      'crete',
      'wellness',
      'Axel Beach Crete',
      null::text,
      'https://www.axelhotels.com/en/axel-beach-crete/hotel/',
      'Hotel wellness area with fitness and bookable massage services inside Crete''s LGBTQIA+ Axel property.',
      'By appointment during the hotel operating season; confirm availability with the property.',
      'https://www.axelhotels.com/en/axel-beach-crete/hotel/',
      array[]::text[],
      'Ano Hersonissos 700 14, Crete, Greece',
      35.3059658,
      25.3723404,
      '$$$',
      'lgbtq-focused hotel wellness',
      array['relax','social']::text[],
      'Axel Hotels official property page; Travel Gay Crete hotel guide',
      '2026-06-11'::date,
      true
    ),
    (
      'Orion Spa at Asterion Suites',
      'crete',
      'wellness',
      'Asterion Suites & Spa',
      '+30 28210 20945',
      'https://www.asterionsuitesandspa.com/',
      'Hotel spa offering body and face treatments and massage therapies at the adults-oriented beachfront resort.',
      'By appointment during the hotel operating season; confirm treatment hours before arrival.',
      'https://www.asterionsuitesandspa.com/',
      array[]::text[],
      'Pyrgos Psilonerou, Platanias 730 14, Chania, Crete, Greece',
      35.516976,
      23.908437,
      '$$$',
      'beachfront spa and massage',
      array['luxury','relax']::text[],
      'Asterion Suites & Spa official website',
      '2026-06-11'::date,
      true
    ),
    (
      'Esperides Resort Concierge & Transfers',
      'crete',
      'concierge',
      'Esperides Resort Crete',
      '+30 28970 22322',
      'https://www.esperidesresortcrete.gr/contact/',
      'Guest concierge for tours, transfers, in-room arrangements, and the resort''s seasonal private-beach shuttle.',
      'Available to hotel guests; hours and seasonal services should be confirmed with guest relations.',
      'https://www.esperidesresortcrete.gr/contact/',
      array[]::text[],
      'Costa Varnali Street, Koutouloufari 700 14, Hersonissos, Crete, Greece',
      35.306095,
      25.394545,
      '$$$',
      'resort concierge and island logistics',
      array['luxury','social']::text[],
      'Esperides Resort Crete official contact page',
      '2026-06-11'::date,
      true
    ),
    (
      'Avli Cretan Cooking Masterclass',
      'crete',
      'tour',
      'Avli',
      '+30 28310 58250',
      'https://www.avli.gr/',
      'Hands-on Cretan cooking masterclass using local artisan produce and traditional and contemporary techniques in Rethymno Old Town.',
      'Reservation required; dates and start times vary.',
      'https://www.avli.gr/',
      array[]::text[],
      'Xanthoudidou 22 & Radamanthios, Rethymno 741 00, Crete, Greece',
      35.3692,
      24.47443,
      '$$$',
      'small-group Cretan food experience',
      array['cultural','cozy']::text[],
      'Avli official website',
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
