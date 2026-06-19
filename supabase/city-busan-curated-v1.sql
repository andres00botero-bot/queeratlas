-- Queer Atlas: Busan city package
-- Verified 2026-06-19.
-- Safe to run multiple times.
--
-- Sources:
-- - https://queerintheworld.com/gay-busan-south-korea-travel-guide/
-- - https://www.travelgay.com/destination/gay-south-korea/gay-busan
-- - https://www.travelgay.com/busan-gay-bars
-- - https://www.travelgay.com/venue/tool
-- - https://www.travelgay.com/venue/maru-soju-bar
-- - https://www.travelgay.com/venue/busan-bunker
-- - https://www.travelgay.com/venue/tighthall
-- - https://www.travelgay.com/venue/blue
-- - https://www.travelgay.com/busan-gay-massage-spas
-- - https://www.travelgay.com/gay-busan-hotels
--
-- Massage providers are inserted into public.services, not public.places.
-- No active dedicated gay sauna or cruising venue in Busan could be verified.
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
      'TOOL',
      'busan',
      'bar',
      'Friendly Beomil-dong gay bar with English-speaking staff, classic cocktails, WiFi, music and a quieter conversation-led atmosphere.',
      'foreigner-friendly beomil cocktail bar',
      array[]::text[],
      'Daily 20:00-03:00. Verify current hours before visiting.',
      'https://www.travelgay.com/venue/tool',
      '660-83 Beomil-dong, Dong-gu, Busan 48735, South Korea',
      35.139400,
      129.060200
    ),
    (
      'MARU - Soju Bar',
      'busan',
      'bar',
      'Gay soju bar near Beomil Station serving soju, beer and Korean side dishes, with a younger crowd and foreigner-friendly staff.',
      'beomil gay soju bar with korean snacks',
      array[]::text[],
      'Daily 19:00-05:00. Verify current hours before visiting.',
      'https://www.travelgay.com/venue/maru-soju-bar',
      '23 Beomil-ro 89beon-gil, Dong-gu, Busan 48735, South Korea',
      35.139800,
      129.059800
    ),
    (
      'Busan BUNKER',
      'busan',
      'bar',
      'Underground gay bar in Beomil-dong with an industrial-cyberpunk mood, electronic music during the week and K-pop on Friday and Saturday.',
      'underground cyberpunk gay bar and pregame room',
      array[]::text[],
      'Thu-Sat 20:00-06:00; Sun-Wed closed. Verify current schedule before visiting.',
      'https://www.travelgay.com/venue/busan-bunker',
      'B1, 53, Beomil-dong 830, Dong-gu, Busan, South Korea',
      35.138900,
      129.059500
    ),
    (
      'TightHall',
      'busan',
      'club',
      'Drag bar and nightclub in Busan, popular with LGBTQ locals and visitors, with weekend drag shows and monthly themed parties.',
      'foreigner-friendly drag bar and nightclub',
      array[]::text[],
      'Thu 23:00-03:00; Fri-Sat 23:00-04:00; Sun-Wed closed. Verify current show schedule before visiting.',
      'https://www.travelgay.com/venue/tighthall',
      '28 Jaseonggongwon-ro, Dong-gu, Busan, South Korea',
      35.138600,
      129.061800
    ),
    (
      'BLUE',
      'busan',
      'bar',
      'Men-only gay karaoke bar in Beomil-dong gay village, popular with local regulars and best approached with basic Korean or a local introduction.',
      'men-only beomil gay karaoke bar',
      array[]::text[],
      'Daily 20:00-03:00. Verify current hours before visiting.',
      'https://www.travelgay.com/venue/blue',
      'Beomil-dong, Dong-gu, Busan, South Korea',
      35.139600,
      129.059300
    ),
    (
      'The Back Room',
      'busan',
      'bar',
      'Haeundae speakeasy-style cocktail bar entered through a hidden passage inside Tap and Tapas, recommended as a polished gay-friendly mixed nightlife option.',
      'hidden haeundae cocktail speakeasy',
      array[]::text[],
      'Cocktail-bar hours vary; verify current opening before visiting.',
      'https://queerintheworld.com/gay-busan-south-korea-travel-guide/',
      'Inside Tap and Tapas, Haeundae, Busan, South Korea',
      35.160400,
      129.161000
    ),
    (
      'Terarosa Suyeong',
      'busan',
      'cafe',
      'Industrial-style coffee shop, bookstore and gallery in a converted factory space, recommended as a stylish daytime cafe stop for queer travelers in Busan.',
      'industrial design cafe and art-book stop',
      array[]::text[],
      'Cafe hours vary; verify current opening before visiting.',
      'https://queerintheworld.com/gay-busan-south-korea-travel-guide/',
      '20, Gurak-ro 123beon-gil, Suyeong-gu, Busan, South Korea',
      35.176300,
      129.115700
    ),
    (
      'Lamer Hotel',
      'busan',
      'hotel',
      'Central Beomil-area hotel near Busan gay bars, with gym and sauna facilities and practical access to Gwangalli Beach and the airport.',
      'beomil hotel near the gay nightlife cluster',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.travelgay.com/gay-busan-hotels',
      '30-171 Beomil2-dong, Dong-gu, Busan, South Korea',
      35.137200,
      129.059700
    ),
    (
      'Arban Hotel',
      'busan',
      'hotel',
      'Central Seomyeon hotel with large rooms, restaurant, bar and strong value, useful for travelers who want nightlife access without staying directly in Beomil.',
      'central seomyeon hotel with strong value',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.travelgay.com/gay-busan-hotels',
      '32, Jungang-daero 691beon-gil, Busanjin-gu, Busan, South Korea',
      35.154600,
      129.057800
    ),
    (
      'Hotel Angel',
      'busan',
      'hotel',
      'Budget-friendly central Busan hotel near subway, shopping and Beomil access, with coffee shop, bar and karaoke lounge.',
      'budget seomyeon hotel near subway and gay scene',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.travelgay.com/gay-busan-hotels',
      '46-7, Jungang-daero 692beon-gil, Busanjin-gu, Busan, South Korea',
      35.154300,
      129.060300
    ),
    (
      'Hotel Aventree Busan',
      'busan',
      'hotel',
      'Good-value Nampo-area hotel close to Yongdusan Park and sightseeing, better for culture and markets than direct gay-bar access.',
      'nampo sightseeing hotel with modern value rooms',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.travelgay.com/gay-busan-hotels',
      '12-1 Changseon-dong 1-ga, Jung-gu, Busan, South Korea',
      35.099200,
      129.031500
    ),
    (
      'ibis Ambassador Busan City Centre',
      'busan',
      'hotel',
      'Dependable city-centre hotel near Bujeon station, with restaurant, bar and quick subway access toward Beomil gay nightlife.',
      'city-centre value hotel with quick beomil access',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.travelgay.com/gay-busan-hotels',
      '777 Jungang-daero, Busanjin-gu, Busan, South Korea',
      35.162800,
      129.061200
    ),
    (
      'Paradise Hotel Busan',
      'busan',
      'hotel',
      'Luxury Haeundae beachfront hotel with sea views, restaurants, casino, pool, sauna and fitness facilities, useful for beach-first stays.',
      'haeundae luxury beachfront hotel',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.busanparadisehotel.co.kr/',
      '296 Haeundaehaebyeon-ro, Haeundae-gu, Busan, South Korea',
      35.160200,
      129.166800
    ),
    (
      'Park Hyatt Busan',
      'busan',
      'hotel',
      'High-end Marina City hotel with ocean views, polished rooms, indoor pool and strong Haeundae/Gwangalli comfort for a premium Busan base.',
      'premium marina city hotel with ocean views',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.hyatt.com/park-hyatt/en-US/pusph-park-hyatt-busan',
      '51 Marine City 1-ro, Haeundae-gu, Busan, South Korea',
      35.156600,
      129.143400
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
      'Busan Queer Culture Festival',
      'busan',
      'Busan Pride and queer visibility event first held in 2017, historically connected with October programming. Verify current-year details through local LGBTQ channels before planning.',
      'https://queerintheworld.com/gay-busan-south-korea-travel-guide/',
      null::date,
      null::date,
      null::date,
      'Busan, South Korea',
      35.179600,
      129.075600,
      'pride visibility and local queer culture event',
      array[]::text[]
    ),
    (
      'TightHall Weekend Drag Shows',
      'busan',
      'Recurring weekend drag shows and monthly themed parties at TightHall, one of Busans most visible LGBTQ nightlife rooms.',
      'https://www.travelgay.com/venue/tighthall',
      null::date,
      null::date,
      null::date,
      'TightHall, 28 Jaseonggongwon-ro, Dong-gu, Busan, South Korea',
      35.138600,
      129.061800,
      'weekend drag shows and themed parties',
      array[]::text[]
    ),
    (
      'Busan BUNKER Weekend Nights',
      'busan',
      'Recurring Thursday-to-Saturday late nights at Busan BUNKER, with electronic music and K-pop weekend programming in an underground gay-bar setting.',
      'https://www.travelgay.com/venue/busan-bunker',
      null::date,
      null::date,
      null::date,
      'Busan BUNKER, B1, 53, Beomil-dong 830, Dong-gu, Busan, South Korea',
      35.138900,
      129.059500,
      'underground gay-bar weekend nights',
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
      'M Massage Busan',
      'busan',
      'massage',
      'M Massage',
      '+82 010 5676 5686; LINE hoya.co.kr',
      'https://busanm.imweb.me/',
      'TravelGay-approved man-to-man massage and skincare provider near Busan International Finance Center / Busan Bank station, with professional massage, skincare, foot care and scalp care.',
      'Appointment-led; verify current availability before booking.',
      'https://www.travelgay.com/busan-gay-massage-spas',
      array[]::text[],
      'Busan International Finance Center Busan Bank station Exit 4, Busan, South Korea',
      35.146400,
      129.066600,
      '$$',
      'gay-welcoming male massage and skincare provider',
      array[]::text[],
      'TravelGay Busan massage listing',
      '2026-06-19'::date,
      true
    ),
    (
      'Gram, Korean Gay Masseur',
      'busan',
      'massage',
      'Gram',
      '+82 10 8482 0119; LINE @1picogram; WeChat/WhatsApp via listed phone',
      'https://www.bigassboyz.net/',
      'Experienced Busan-based gay masseur offering Thai, aroma, mixed massage and tour-guide services by appointment.',
      'Open 24 hours by appointment according to TravelGay listing; verify directly before booking.',
      'https://www.travelgay.com/busan-gay-massage-spas',
      array[]::text[],
      'Near Beomnaegol Station, Busan, South Korea',
      35.147700,
      129.059100,
      '$$',
      'appointment-based gay massage and tour-guide service',
      array[]::text[],
      'TravelGay Busan massage listing',
      '2026-06-19'::date,
      true
    ),
    (
      'Busan Queer Culture Festival Signal',
      'busan',
      'other',
      'Busan Queer Culture Festival / local LGBTQ organizers',
      'Use current local social channels before planning; public details can change year to year.',
      'https://queerintheworld.com/gay-busan-south-korea-travel-guide/',
      'Local Pride and queer visibility signal for Busan. Useful for understanding event timing, public visibility and South Korea-specific safety context.',
      'Event-led; verify current-year details before attending.',
      'https://queerintheworld.com/gay-busan-south-korea-travel-guide/',
      array[]::text[],
      'Busan, South Korea',
      35.179600,
      129.075600,
      '$',
      'local pride visibility and queer community signal',
      array[]::text[],
      'Queer In The World Busan guide',
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
where lower(trim(city)) = 'busan'

union all

select 'events', count(*)
from public.events
where lower(trim(city)) = 'busan'

union all

select 'services', count(*)
from public.services
where lower(trim(city)) = 'busan';
