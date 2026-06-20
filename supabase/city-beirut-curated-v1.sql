-- Queer Atlas: Beirut city package
-- Verified 2026-06-20.
-- Safe to run multiple times.
--
-- Sources:
-- - https://nomadicboys.com/beirut-gay-travel-guide/
-- - https://www.travelgay.com/destination/gay-lebanon/gay-beirut
-- - https://www.travelgay.com/beirut-gay-bars
-- - https://www.travelgay.com/beirut-gay-dance-clubs
-- - https://www.travelgay.com/gay-beirut-services
-- - https://www.travelgay.com/gay-beirut-hotels
-- - https://travel.state.gov/en/international-travel/travel-advisories/lebanon.html
--
-- No active dedicated gay sauna or cruising venue in Beirut could be safely verified.
-- Bardo and Kahwet Al Franj are not inserted because current guide material flags them as closed.
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
      'Om Bar Room',
      'beirut',
      'bar',
      'Discreet gay-friendly bar and lounge in Mar Mikhael, formerly known as Madame Om, with Arabic pop, R&B, dancing and a diversity-forward crowd.',
      'mar mikhael gay-friendly lounge and dance bar',
      array[]::text[],
      'Daily from about 16:00 or 17:00 until late according to Nomadic Boys; verify current hours before visiting.',
      'https://nomadicboys.com/beirut-gay-travel-guide/',
      'Armenia Street, Mar Mikhael, Beirut, Lebanon',
      33.896700,
      35.524900
    ),
    (
      'Cafe Younes Hamra',
      'beirut',
      'cafe',
      'Long-running bohemian Beirut coffee house and gay-friendly cafe, useful for a relaxed Hamra daytime stop and people-watching.',
      'bohemian gay-friendly hamra coffee stop',
      array[]::text[],
      'Mon-Sat 08:00-23:00; Sun 10:00-23:00 according to TravelGay. Verify current hours before visiting.',
      'https://www.cafeyounes.com/',
      'Baalbeck Street, Hamra, Beirut, Lebanon',
      33.895400,
      35.482900
    ),
    (
      'POSH Beirut',
      'beirut',
      'club',
      'Large Beirut gay club reference in Bourj Hammoud with Arabic and Western pop nights, strict security and a discreet no-photos/no-public-affection culture.',
      'large discreet gay club in bourj hammoud',
      array[]::text[],
      'Fri 23:00-04:30; Sat 23:00-05:00; Sun 23:00-04:00; Mon-Thu closed according to TravelGay. Verify before visiting.',
      'https://www.travelgay.com/beirut-gay-dance-clubs',
      'Bourj Hammoud Seaside Road, behind Gallery Vanlian, Beirut, Lebanon',
      33.897300,
      35.545900
    ),
    (
      'B 018',
      'beirut',
      'club',
      'Iconic Karantina nightclub with a liberal mixed crowd, internationally known design and strong gay-popular reputation, though not officially a gay club.',
      'legendary karantina mixed club with queer crowd',
      array[]::text[],
      'Thu 20:00-04:00; Fri-Sat 22:00-06:00; Sun-Wed closed according to TravelGay. Verify current programming before visiting.',
      'https://www.travelgay.com/beirut-gay-dance-clubs',
      'Karantina, Beirut, Lebanon',
      33.901300,
      35.535900
    ),
    (
      'Ego Beirut at Projekt',
      'beirut',
      'club',
      'Gay after-party connected with the POSH nightlife route, usually starting very late at Projekt Beirut in Jal El Dib.',
      'late gay after-party at projekt jal el dib',
      array[]::text[],
      'After-party timing varies; Nomadic Boys notes Friday and Saturday late nights until around 06:00. Verify current event before going.',
      'https://www.travelgay.com/beirut-gay-dance-clubs',
      'Projekt Jal El Dib, Seaside Road, Beirut, Lebanon',
      33.918400,
      35.589400
    ),
    (
      'Hotel Albergo Relais & Chateaux',
      'beirut',
      'hotel',
      'Luxury Achrafieh boutique hotel in a historic mansion with rooftop pool, bars, spa, gym and TravelGay-approved LGBTQ-friendly positioning.',
      'luxury achrafieh boutique hotel with rooftop pool',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.albergobeirut.com/',
      'Abdel Wahab El Inglizi Street, 137, Achrafieh, Beirut, Lebanon',
      33.887900,
      35.515600
    ),
    (
      'Le Vendome Beirut',
      'beirut',
      'hotel',
      'Gay-friendly boutique hotel on the Corniche with Mediterranean views and a rooftop bar, listed by TravelGay as a luxury Beirut option.',
      'corniche boutique hotel with sea views',
      array[]::text[],
      'Hotel schedule and reopening status can change; verify current booking availability directly before planning.',
      'https://www.travelgay.com/hotels/le-vendome-beirut',
      'Rafic El Hariri Avenue, Ain El Mreisseh, Beirut, Lebanon',
      33.901200,
      35.489800
    ),
    (
      'Hilton Beirut Habtoor Grand',
      'beirut',
      'hotel',
      'Large luxury hotel recommended by Nomadic Boys as gay-friendly, with spa, pools, restaurants and a polished full-service base outside the densest nightlife lanes.',
      'large luxury hotel with spa and pool facilities',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.hilton.com/en/hotels/beyhghi-hilton-beirut-habtoor-grand/',
      'Charles De Gaulle Street, Horsh Tabet, Sin El Fil, Beirut, Lebanon',
      33.868600,
      35.538300
    ),
    (
      'Grand Meshmosh Hotel',
      'beirut',
      'hotel',
      'Friendly budget hotel/hostel hybrid by the Saint Nicolas Stairs, useful for Gemmayzeh and Mar Mikhael culture, galleries and low-friction daytime exploring.',
      'budget gemmayzeh hotel-hostel with local feel',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.grandmeshmosh.com/',
      'Saint Nicolas Stairs, Gemmayzeh, Beirut, Lebanon',
      33.894200,
      35.514600
    ),
    (
      'The Smallville Hotel',
      'beirut',
      'hotel',
      'Design-led Badaro hotel with rooftop pool, restaurants and easy access to central Beirut, useful for travelers who want a polished boutique base.',
      'design-forward badaro boutique hotel',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.thesmallville.com/',
      'Damascus Road, Museum District, Badaro, Beirut, Lebanon',
      33.879500,
      35.515600
    ),
    (
      'Basterma Mano',
      'beirut',
      'cafe',
      'Beloved Bourj Hammoud Armenian sandwich and shawarma stop recommended by Nomadic Boys for quick, friendly food before or after exploring the area.',
      'bourj hammoud armenian sandwich institution',
      array[]::text[],
      'Restaurant hours vary by branch and day; verify current opening before visiting.',
      'https://nomadicboys.com/beirut-gay-travel-guide/',
      'Bourj Hammoud, Beirut, Lebanon',
      33.893700,
      35.543500
    ),
    (
      'L Abeille D Or',
      'beirut',
      'cafe',
      'Lebanese bakery and cafe chain recommended for kanafeh, baklawa and traditional sweets, useful as a daytime food stop across Beirut.',
      'classic lebanese bakery and sweets stop',
      array[]::text[],
      'Branch hours vary; verify current opening before visiting.',
      'https://nomadicboys.com/beirut-gay-travel-guide/',
      'Beirut, Lebanon',
      33.893800,
      35.501800
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
      'Beirut Pride',
      'beirut',
      'Lebanon and Arab-world Pride visibility initiative launched in 2017, with programming historically shaped by legal pressure, security conditions and changing local circumstances. Verify current-year details before planning.',
      'http://www.beirutpride.org/',
      null::date,
      null::date,
      null::date,
      'Multiple venues, Beirut, Lebanon',
      33.893800,
      35.501800,
      'pride visibility and rights programming',
      array[]::text[]
    ),
    (
      'Helem Community Events',
      'beirut',
      'Recurring community programming connected with Helem, including cultural, social, support and rights-focused events for Lebanons LGBTQ community. Public details can change for safety reasons.',
      'https://www.travelgay.com/gay-beirut-services',
      null::date,
      null::date,
      null::date,
      'Helem Community Centre, Beirut, Lebanon',
      33.893800,
      35.501800,
      'community events and queer support programming',
      array[]::text[]
    ),
    (
      'POSH Weekend Nights',
      'beirut',
      'Friday-to-Sunday late club nights at POSH, one of Beiruts clearest gay club references. Verify current access, security rules and opening before attending.',
      'https://www.travelgay.com/beirut-gay-dance-clubs',
      null::date,
      null::date,
      null::date,
      'POSH, Bourj Hammoud Seaside Road, Beirut, Lebanon',
      33.897300,
      35.545900,
      'weekend gay club nights',
      array[]::text[]
    ),
    (
      'Ego Beirut After Party',
      'beirut',
      'Very late gay after-party route at Projekt Jal El Dib, usually treated as the post-POSH stop when active.',
      'https://www.travelgay.com/beirut-gay-dance-clubs',
      null::date,
      null::date,
      null::date,
      'Projekt Jal El Dib, Seaside Road, Beirut, Lebanon',
      33.918400,
      35.589400,
      'late gay after-party',
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
      'Helem Community Centre',
      'beirut',
      'other',
      'Helem',
      'Contact through official Helem website or social channels; public contact details can change for safety reasons.',
      'http://www.helem.net/',
      'Lebanese LGBTIQ+ NGO and community centre active since the early 2000s, offering advocacy, community programming and rights support for LGBTQ people in Lebanon.',
      'Community programming is event-led; verify current access and safety guidance before visiting.',
      'https://www.travelgay.com/gay-beirut-services',
      array[]::text[],
      'Beirut, Lebanon',
      33.893800,
      35.501800,
      '$',
      'lgbtiq rights organization and community centre',
      array[]::text[],
      'TravelGay Beirut services and Helem official profile',
      '2026-06-20'::date,
      true
    ),
    (
      'Beirut Pride Signal',
      'beirut',
      'other',
      'Beirut Pride',
      'Use official Beirut Pride web and social channels for current-year details; public programming can change quickly.',
      'http://www.beirutpride.org/',
      'Pride and LGBTQ visibility initiative for Beirut and Lebanon, important for legal context, public visibility and event-led community signals.',
      'Event-led; verify current-year dates and safety context before attending.',
      'http://www.beirutpride.org/',
      array[]::text[],
      'Beirut, Lebanon',
      33.893800,
      35.501800,
      '$',
      'pride visibility and legal-context signal',
      array[]::text[],
      'Beirut Pride official website and Nomadic Boys guide',
      '2026-06-20'::date,
      true
    ),
    (
      'Gay-Friendly Beirut Tour Signal',
      'beirut',
      'tour',
      'Private Beirut guide referrals',
      'Nomadic Boys recommends private email referral for safety; verify independently before booking.',
      'https://nomadicboys.com/beirut-gay-travel-guide/',
      'Discreet gay-friendly tour-guide referral signal for Beirut and Lebanon. Use only after direct verification because public queer-facing tour details are intentionally limited.',
      'Appointment-led; verify availability and safety context directly.',
      'https://nomadicboys.com/beirut-gay-travel-guide/',
      array[]::text[],
      'Beirut, Lebanon',
      33.893800,
      35.501800,
      '$$',
      'discreet private gay-friendly tour referral',
      array[]::text[],
      'Nomadic Boys Beirut guide',
      '2026-06-20'::date,
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
where lower(trim(city)) = 'beirut'

union all

select 'events', count(*)
from public.events
where lower(trim(city)) = 'beirut'

union all

select 'services', count(*)
from public.services
where lower(trim(city)) = 'beirut';
