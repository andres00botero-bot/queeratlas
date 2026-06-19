-- Queer Atlas: Algarve region-as-city package
-- Verified 2026-06-19.
-- Safe to run multiple times.
--
-- Sources:
-- - https://www.gayout.com/europe/portugal/algarve
-- - https://www.travelgay.com/destination/gay-portugal/gay-algarve
-- - https://www.travelgay.com/algarve-gay-bars-clubs
-- - https://www.travelgay.com/gay-algarve-beaches
-- - https://www.travelgay.com/algarve-gay-guesthouses-and-bbs
-- - https://www.travelgay.com/gay-algarve-hotels
-- - https://www.travelgay.com/algarve-gay-massage
-- - https://www.travelgay.com/gay-algarve-services
-- - https://www.gaytravel4u.com/gay-algarve-guide/
--
-- Algarve is intentionally modeled as the city slug "algarve"
-- because the queer travel signal is region-wide across Albufeira,
-- Portimao, Lagos, Faro, Vilamoura and beach towns.
-- Restaurants and cafes use type = 'cafe' as required by the app/database.
-- Production-safe: vibe_tags are empty arrays to avoid stricter Supabase tag constraints.

begin;

insert into public.places (
  name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng
)
select
  v.name, v.city, v.type, v.description, v.vibe, v.vibe_tags,
  v.hours, v.link, v.location, v.lat, v.lng
from (
  values
    (
      'CONNECTION Bar',
      'algarve',
      'bar',
      'Main gay bar and dance-club hangout for the Algarve local LGBTQ community, set on The Strip in Albufeira with drinks, dancing, music and themed nights.',
      'main albufeira gay bar and dance-club anchor',
      array[]::text[],
      'Mon-Tue 21:30-04:00; Wed-Sun 18:00-04:00. Verify current seasonal hours before visiting.',
      'https://connectiongaybar.com/',
      'Avenida Sa Carneiro, Lote 1B, Vilanova Resort, Albufeira, Algarve, Portugal',
      37.090800,
      -8.226700
    ),
    (
      'The Loft Portimao',
      'algarve',
      'club',
      'Gay dance club in Portimao with dance floor, VIP room, lounge area, DJs, karaoke, live performances and themed party nights.',
      'portimao gay dance club with shows and karaoke',
      array[]::text[],
      'Fri-Sat 22:00-04:00; other days usually closed or event-led. Verify current programme before visiting.',
      'https://www.facebook.com/loftportimao/',
      'Rua de Olivenca 5, 8500-611 Portimao, Algarve, Portugal',
      37.136200,
      -8.536800
    ),
    (
      'Dona Benta - Tasca Chique',
      'algarve',
      'cafe',
      'Gay-friendly Portuguese cafe, bar and restaurant in Portimao serving regional food, sandwiches, seafood, tapas and drinks with a local relaxed feel.',
      'gay-friendly portimao cafe bar and tasca',
      array[]::text[],
      'Daily 12:00-14:30 and 18:30-21:30. Verify current kitchen hours before visiting.',
      'https://www.travelgay.com/venue/dona-benta-tasca-chique',
      'Rua da Barca 1, Portimao, Algarve, Portugal',
      37.136900,
      -8.535300
    ),
    (
      'Espelho',
      'algarve',
      'bar',
      'Camp gay-friendly bar in Albufeira with bold decor, late-night drinks and a playful social atmosphere near the main resort nightlife route.',
      'camp albufeira gay-friendly late bar',
      array[]::text[],
      'Daily 22:00-03:00. Verify current seasonal hours before visiting.',
      'https://www.travelgay.com/algarve-gay-bars-clubs',
      'Avenida Sa Carneiro 81, Albufeira, Algarve, Portugal',
      37.090600,
      -8.227900
    ),
    (
      'Praia Maria Luisa Gay-Popular Area',
      'algarve',
      'cruising_area',
      'Gay-popular and nudist beach pocket near Albufeira, reached by walking west from the main beach area toward the quieter end.',
      'albufeira gay-popular nudist beach pocket',
      array[]::text[],
      'Public beach; daytime visits recommended and conditions vary by tide and season.',
      'https://www.travelgay.com/gay-algarve-beaches',
      'Praia Maria Luisa, Albufeira, Algarve, Portugal',
      37.091000,
      -8.191000
    ),
    (
      'Praia do Submarino',
      'algarve',
      'cruising_area',
      'Hidden nudist-optional gay-popular cove near Portimao and Alvor, known for cliffs, low-tide access and a relaxed open-minded beach atmosphere.',
      'hidden nudist gay-popular beach cove near alvor',
      array[]::text[],
      'Public beach with difficult access; visit in daylight and check low tide before going.',
      'https://www.gaytravel4u.com/gay-algarve-guide/',
      'Praia do Submarino, Alvor, Faro 8500-451, Algarve, Portugal',
      37.119200,
      -8.581200
    ),
    (
      'Praia Joao de Arens',
      'algarve',
      'cruising_area',
      'Secluded gay-friendly and naturist-friendly beach near Praia do Submarino, valued for rocky scenery, privacy and low-key beach culture.',
      'secluded gay-friendly naturist beach near alvor',
      array[]::text[],
      'Public beach with rocky access; daytime visits recommended and tide awareness is important.',
      'https://www.gaytravel4u.com/gay-algarve-guide/',
      'Praia Joao de Arens, Alvor, Faro 8500-046, Algarve, Portugal',
      37.119400,
      -8.574700
    ),
    (
      'Casa Marhaba',
      'algarve',
      'hotel',
      'Gay-only private guesthouse near Carvoeiro with poolside garden setting, breakfast terrace, jacuzzi and a quiet base close to beaches and restaurants.',
      'gay-only guesthouse near carvoeiro',
      array[]::text[],
      'Guesthouse open seasonally/by booking; verify current availability directly.',
      'https://www.casamarhaba.com/',
      'Rua de Benagil, Alfanzina, near Carvoeiro, Algarve, Portugal',
      37.089600,
      -8.450500
    ),
    (
      'Vilamoura Garden Hotel',
      'algarve',
      'hotel',
      'Gay-friendly Vilamoura hotel close to beaches and golf, with pool, spa, bar and a polished resort feel for couples or relaxed stays.',
      'polished vilamoura gay-friendly resort hotel',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.vilamouragardenhotel.com/',
      'Rua de Franca, Lote 3.5.11, Vilamoura, Algarve, Portugal',
      37.092700,
      -8.116700
    ),
    (
      'Hotel Sol e Mar Albufeira - Adults Only',
      'algarve',
      'hotel',
      'Adults-only beachfront hotel on the edge of Albufeira Old Town, useful for beach access, sea-view rooms and easy movement to restaurants and nightlife.',
      'adults-only albufeira beachfront hotel',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.hotelsolemaralbufeira.com/',
      'Rua Jose Bernardino de Sousa, 8200-146 Albufeira, Algarve, Portugal',
      37.087900,
      -8.253300
    ),
    (
      'Aqua Pedra Dos Bicos Hotel',
      'algarve',
      'hotel',
      'Adults-oriented Albufeira hotel near Praia dos Bicos and The Strip, useful for travelers who want beach access plus easy nightlife reach.',
      'albufeira beach-and-nightlife hotel near the strip',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.aquapedradosbicos.com/',
      'Urbanizacao Quinta Pedra Dos Bicos, Lote 24, 8200-381 Albufeira, Algarve, Portugal',
      37.088200,
      -8.220100
    ),
    (
      'Hotel Da Rocha',
      'algarve',
      'hotel',
      'Praia da Rocha beachfront hotel in Portimao with suites, pool, restaurant and strong access to restaurants, beach walks and The Loft by short taxi.',
      'praia da rocha hotel near portimao nightlife',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.hotel-da-rocha.com/',
      'Avenida Tomas Cabreira, Praia da Rocha, 8500-802 Portimao, Algarve, Portugal',
      37.119100,
      -8.537700
    ),
    (
      'Dunas Douradas Beach Club',
      'algarve',
      'hotel',
      'Beachfront apartment-style resort in Vale do Lobo with private beach access, pools, gym, sauna, spa, restaurant and a relaxed upscale Algarve base.',
      'upscale vale do lobo beachfront resort',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.dunasdouradasbeachclub.com/',
      'Sitio do Garrao, Vale do Lobo, Algarve, Portugal',
      37.053500,
      -8.057800
    )
) as v(name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng)
where not exists (
  select 1
  from public.places p
  where lower(trim(p.city)) = lower(trim(v.city))
    and lower(trim(p.name)) = lower(trim(v.name))
);

insert into public.events (
  name, city, description, link, date, start_date, end_date,
  location, lat, lng, vibe, vibe_tags
)
select
  v.name, v.city, v.description, v.link, v.date, v.start_date, v.end_date,
  v.location, v.lat, v.lng, v.vibe, v.vibe_tags
from (
  values
    (
      'Algarve Pride',
      'algarve',
      'Annual Algarve Pride celebration usually centered around June and the Lagos-Albufeira visitor corridor, with parties, drag, music, beach energy and regional visibility.',
      'https://www.gayout.com/europe/portugal/algarve',
      null::date,
      null::date,
      null::date,
      'Albufeira and Lagos, Algarve, Portugal',
      37.102800,
      -8.434400,
      'annual regional pride and beach celebration',
      array[]::text[]
    ),
    (
      'CONNECTION Bar Themed Nights',
      'algarve',
      'Recurring themed nights, parties, music and dance programming at the main Albufeira gay bar on The Strip.',
      'https://connectiongaybar.com/',
      null::date,
      null::date,
      null::date,
      'CONNECTION Bar, Avenida Sa Carneiro, Lote 1B, Vilanova Resort, Albufeira, Algarve, Portugal',
      37.090800,
      -8.226700,
      'recurring albufeira gay-bar party nights',
      array[]::text[]
    ),
    (
      'The Loft Portimao Shows and Karaoke',
      'algarve',
      'Recurring Portimao gay-club programming with DJs, karaoke, live performances, themed parties and weekend dance-floor energy.',
      'https://www.facebook.com/loftportimao/',
      null::date,
      null::date,
      null::date,
      'The Loft Portimao, Rua de Olivenca 5, Portimao, Algarve, Portugal',
      37.136200,
      -8.536800,
      'weekend gay-club shows karaoke and themed nights',
      array[]::text[]
    )
) as v(name, city, description, link, date, start_date, end_date, location, lat, lng, vibe, vibe_tags)
where not exists (
  select 1
  from public.events e
  where lower(trim(e.city)) = lower(trim(v.city))
    and lower(trim(e.name)) = lower(trim(v.name))
);

insert into public.services (
  name, city, type, provider_name, contact, booking_link, description,
  hours, link, image_urls, location, lat, lng, price_tier, vibe,
  vibe_tags, source, "lastChecked", verified
)
select
  v.name, v.city, v.type, v.provider_name, v.contact, v.booking_link,
  v.description, v.hours, v.link, v.image_urls, v.location, v.lat, v.lng,
  v.price_tier, v.vibe, v.vibe_tags, v.source, v."lastChecked", v.verified
from (
  values
    (
      'Swan Day Spa',
      'algarve',
      'massage',
      'Swan Day Spa',
      'Use official website, Facebook or phone channel for current appointments.',
      'https://swandayspa.pt/',
      'Gay-welcoming massage and day spa in Alvor with massages, facial treatments, body scrubs, spa services, private showers and WiFi.',
      'Closed Sun-Mon; other hours vary by booking. Verify current appointments on the official site.',
      'https://swandayspa.pt/',
      array[]::text[],
      'Urbanizacao Marachique Lote 1, Loja B, Alvor, Algarve, Portugal',
      37.129500,
      -8.582300,
      '$$',
      'gay-welcoming massage and day spa in alvor',
      array[]::text[],
      'TravelGay Algarve massage listing',
      '2026-06-19'::date,
      true
    ),
    (
      'Nauti Girl Lagos',
      'algarve',
      'other',
      'Nauti Girl Lagos',
      'Use official website or Instagram for booking and direct contact.',
      'https://nautigirl-pt.com/',
      'LGBTQIA+ friendly boat rental and private cruise operator from Lagos Marina, offering half-day, full-day, sunset and Benagil cave trips with refreshments and water gear.',
      'Daily 10:00-20:00 according to TravelGay listing; verify current trip slots before booking.',
      'https://nautigirl-pt.com/',
      array[]::text[],
      'Berth C31, Marina de Lagos, Lagos, Algarve, Portugal',
      37.108900,
      -8.673600,
      '$$$',
      'lgbtq-friendly private boat trips and coastal cruises',
      array[]::text[],
      'TravelGay Algarve services listing',
      '2026-06-19'::date,
      true
    ),
    (
      'High Class Algarve Chauffeurs',
      'algarve',
      'other',
      'High Class Algarve Chauffeurs',
      'Use official website, Instagram, Facebook or WhatsApp for current bookings.',
      'https://www.highclassalgarvechauffeurs.com/',
      'LGBT+ friendly chauffeur and VIP transport service covering the Algarve, airport transfers, tours, golf transport, corporate travel and luxury transfers.',
      '24 hours according to TravelGay listing; verify availability and booking terms directly.',
      'https://www.highclassalgarvechauffeurs.com/',
      array[]::text[],
      'Algarve, Portugal',
      37.244500,
      -8.306800,
      '$$$',
      'lgbtq-friendly chauffeur transfers and private transport',
      array[]::text[],
      'TravelGay Algarve services listing',
      '2026-06-19'::date,
      true
    ),
    (
      'ILGA Portugal',
      'algarve',
      'other',
      'ILGA Portugal',
      'Use official website for national support, advocacy, helpline and current contact channels.',
      'https://ilga-portugal.pt/',
      'National LGBTQI+ rights and support organization for Portugal, useful for legal context, support routes and current country-level community information before an Algarve trip.',
      'Office, helpline and programme hours vary; verify current channels on the official site.',
      'https://ilga-portugal.pt/',
      array[]::text[],
      'Portugal',
      38.722300,
      -9.139300,
      '$',
      'national lgbtqi rights support and information',
      array[]::text[],
      'ILGA Portugal official website',
      '2026-06-19'::date,
      true
    )
) as v(
  name, city, type, provider_name, contact, booking_link, description,
  hours, link, image_urls, location, lat, lng, price_tier, vibe,
  vibe_tags, source, "lastChecked", verified
)
where not exists (
  select 1
  from public.services s
  where lower(trim(s.city)) = lower(trim(v.city))
    and lower(trim(s.name)) = lower(trim(v.name))
);

commit;

select 'places' as category, count(*) as total
from public.places
where lower(trim(city)) = 'algarve'

union all

select 'events', count(*)
from public.events
where lower(trim(city)) = 'algarve'

union all

select 'services', count(*)
from public.services
where lower(trim(city)) = 'algarve';
