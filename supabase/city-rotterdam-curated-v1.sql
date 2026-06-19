-- Queer Atlas: Rotterdam city package
-- Verified 2026-06-19.
-- Safe to run multiple times.
--
-- Sources:
-- - https://www.nighttours.com/rotterdam/
-- - https://www.gayrotterdam.com/
-- - https://spartacus.gayguide.travel/goingout/europe/netherlands/rotterdam
-- - https://www.rotterdam-pride.nl/
-- - https://cocrotterdam.nl/
--
-- Restaurants and cafes use type = 'cafe' as required by the app/database.
-- Stores/adult shops are intentionally excluded.
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
      'FERRY Rotterdam',
      'rotterdam',
      'bar',
      'Large LGBTQ bar and restaurant on Westblaak, useful for coffee, dinner, cocktails, special events and a softer early-evening start before the later Rotterdam bars.',
      'lgbtq bar restaurant and social start point',
      array[]::text[],
      'Thu 17:00-01:00; Fri-Sat 17:00-03:00. Hours are indicative and may vary; verify before visiting.',
      'https://www.ferryrotterdam.com/',
      'Westblaak 127, 3012 KJ Rotterdam, Netherlands',
      51.917600,
      4.475600
    ),
    (
      'KeerWeer',
      'rotterdam',
      'bar',
      'Small but busy late-night gay party bar on Keerweer, known as one of the friendliest very-late options in Rotterdam.',
      'small late-night gay party bar',
      array[]::text[],
      'Mon-Thu 17:00-06:00; Fri-Sat 17:00-07:00; Sun 17:00-06:00. Hours are indicative and may vary.',
      'https://www.keerweer.nl/',
      'Keerweer 14, 3012 KB Rotterdam, Netherlands',
      51.917900,
      4.481100
    ),
    (
      'Loge 90',
      'rotterdam',
      'bar',
      'Long-running Schiedamsedijk gay bar with classic local atmosphere, regulars, drinks and a relaxed old-school Rotterdam feeling.',
      'classic local gay bar with regulars',
      array[]::text[],
      'Mon-Thu 15:00-01:00; Fri-Sat 15:00-02:00; Sun 15:00-01:00. Hours are indicative and may vary.',
      'https://loge90.nl/',
      'Schiedamsedijk 4A, 3011 EB Rotterdam, Netherlands',
      51.916700,
      4.482100
    ),
    (
      'Strano',
      'rotterdam',
      'bar',
      'Popular central gay bar with a younger crowd, late hours and an easy location near the main Rotterdam nightlife cluster.',
      'popular young-crowd gay bar',
      array[]::text[],
      'Mon-Wed 17:00-03:00; Thu 17:00-04:00; Fri-Sat 17:00-06:00; Sun 17:00-04:00. Hours are indicative and may vary.',
      'https://www.cafestrano.nl/',
      'Van Oldenbarneveltstraat 154, 3012 GX Rotterdam, Netherlands',
      51.919700,
      4.475900
    ),
    (
      'De Regenboog',
      'rotterdam',
      'bar',
      'Friendly gay bar on Van Oldenbarneveltstraat, listed for karaoke nights, mixed LGBTQ crowd and reliable party energy.',
      'karaoke-friendly gay bar and party room',
      array[]::text[],
      'Wed-Sun 16:00-02:00. Hours are indicative and may vary.',
      'https://m.facebook.com/Regenboogrotterdam',
      'Van Oldenbarneveltstraat 148A, 3012 GX Rotterdam, Netherlands',
      51.919600,
      4.476100
    ),
    (
      'LOUD Rotterdam',
      'rotterdam',
      'cafe',
      'Queer-friendly bar and cafe with food, terrace, live music, WiFi and a mixed social crowd near the central nightlife route.',
      'queer-friendly cafe bar with terrace and live music',
      array[]::text[],
      'Wed 16:00-23:00; Thu 12:00-23:00; Fri-Sun 12:00-02:00. Hours are indicative and may vary.',
      'https://www.loudrotterdam.com/',
      'Posthoornstraat 9, 3011 WD Rotterdam, Netherlands',
      51.918000,
      4.479600
    ),
    (
      'New Bonaparte',
      'rotterdam',
      'cafe',
      'Gay bar/cafe with a mixed clientele on Nieuwe Binnenweg, listed as a late-night stop rather than a daytime cafe.',
      'late-night gay cafe bar with mixed clientele',
      array[]::text[],
      'Daily 22:00-06:00. Hours are indicative and may vary.',
      'https://tinyurl.com/q4xmmhm',
      'Nieuwe Binnenweg 117, 3014 GH Rotterdam, Netherlands',
      51.913900,
      4.465000
    ),
    (
      'Hilton Rotterdam',
      'rotterdam',
      'hotel',
      'Large central hotel near Rotterdam Central Station, useful for travelers who want a polished base close to museums, transit and short rides to the queer nightlife cluster.',
      'central luxury hotel near station and nightlife',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.hilton.com/en/hotels/rtmhitw-hilton-rotterdam/',
      'Weena 10, 3012 CM Rotterdam, Netherlands',
      51.922500,
      4.477100
    ),
    (
      'Leonardo Hotel Rotterdam Savoy',
      'rotterdam',
      'hotel',
      'Comfortable central hotel in the Hoogstraat area, a practical base for Blaak, Markthal, Oude Haven and short trips toward Rotterdam nightlife.',
      'central practical hotel near blaak',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.leonardo-hotels.com/rotterdam/leonardo-hotel-rotterdam-savoy',
      'Hoogstraat 81, 3011 PJ Rotterdam, Netherlands',
      51.922600,
      4.490200
    ),
    (
      'Thon Hotel Rotterdam City Centre',
      'rotterdam',
      'hotel',
      'Good-value hotel by Willemsplein and the Erasmus Bridge, useful for waterfront views and quick tram/taxi access back to central nightlife.',
      'waterfront hotel by erasmus bridge',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.thonhotels.com/our-hotels/netherlands/rotterdam/thon-hotel-rotterdam/',
      'Willemsplein 1, 3016 DN Rotterdam, Netherlands',
      51.909200,
      4.483300
    ),
    (
      'Hotel Emma',
      'rotterdam',
      'hotel',
      'Small central hotel on Nieuwe Binnenweg, close to cultural stops and easy walking distance from parts of the Rotterdam queer bar route.',
      'small central hotel near nieuwe binnenweg',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.hotelemma.nl/',
      'Nieuwe Binnenweg 6, 3015 BA Rotterdam, Netherlands',
      51.916400,
      4.471500
    ),
    (
      'H2OTEL Rotterdam',
      'rotterdam',
      'hotel',
      'Floating hotel in Wijnhaven, useful for travelers who want a different Rotterdam stay with quick access to Blaak, Markthal and central nightlife.',
      'floating hotel in wijnhaven',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.h2otel.nl/',
      'Wijnhaven 20A, 3011 WR Rotterdam, Netherlands',
      51.918100,
      4.489900
    ),
    (
      'Holiday Inn Express Rotterdam - Central Station',
      'rotterdam',
      'hotel',
      'Large station-area hotel with straightforward rooms and easy transport, useful for a practical Rotterdam base near trains and trams.',
      'practical central station hotel',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.ihg.com/holidayinnexpress/hotels/us/en/rotterdam/rtmcs/hoteldetail',
      'Weena 121, 3013 CK Rotterdam, Netherlands',
      51.923900,
      4.474900
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
      'Rotterdam Pride Festival 2026',
      'rotterdam',
      'Annual Rotterdam Pride festival date announced for 26 September 2026, with community, culture, visibility and city-wide Pride programming.',
      'https://www.rotterdam-pride.nl/',
      '2026-09-26'::date,
      '2026-09-26'::date,
      '2026-09-26'::date,
      'Rotterdam city centre, Rotterdam, Netherlands',
      51.924400,
      4.477700,
      'annual pride festival and city visibility',
      array[]::text[]
    ),
    (
      'TransCafe COC Rotterdam',
      'rotterdam',
      'Community TransCafe meeting at COC Rotterdam, listed by Nighttours for 21 June 2026 with afternoon social/support programming.',
      'https://cocrotterdam.nl/',
      '2026-06-21'::date,
      '2026-06-21'::date,
      '2026-06-21'::date,
      'COC Rotterdam, Schiedamsesingel 173, 3012 BB Rotterdam, Netherlands',
      51.916300,
      4.477400,
      'trans community meeting and support',
      array[]::text[]
    ),
    (
      'Roze Salon COC Rotterdam',
      'rotterdam',
      'Afternoon community salon at COC Rotterdam, listed for 22 June 2026 and useful for a softer social/community entry into local queer life.',
      'https://cocrotterdam.nl/',
      '2026-06-22'::date,
      '2026-06-22'::date,
      '2026-06-22'::date,
      'COC Rotterdam, Schiedamsesingel 173, 3012 BB Rotterdam, Netherlands',
      51.916300,
      4.477400,
      'community salon and social gathering',
      array[]::text[]
    ),
    (
      'Jong&Out Rotterdam',
      'rotterdam',
      'Youth-focused LGBTQ+ meeting listed by COC Rotterdam for 20 June 2026; verify eligibility, timing and access through official COC channels.',
      'https://cocrotterdam.nl/agenda/',
      '2026-06-20'::date,
      '2026-06-20'::date,
      '2026-06-20'::date,
      'COC Rotterdam, Schiedamsesingel 173, 3012 BB Rotterdam, Netherlands',
      51.916300,
      4.477400,
      'youth lgbtq meeting and community support',
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
      'COC Rotterdam',
      'rotterdam',
      'other',
      'COC Rotterdam',
      '010-41 41 555; secretariaat@cocrotterdam.nl; info@cocrotterdam.nl',
      'https://cocrotterdam.nl/contact/',
      'Regional LGBTQ+ organization for Rotterdam and South Holland South, with information, meetings, advocacy, education and support referrals.',
      'Secretariat listed Thu 13:30-16:00; programme and advice meetings vary. Verify current availability before visiting.',
      'https://cocrotterdam.nl/',
      array[]::text[],
      'Schiedamsesingel 173, 3012 BB Rotterdam, Netherlands',
      51.916300,
      4.477400,
      '$',
      'regional lgbtq community organization and support',
      array[]::text[],
      'COC Rotterdam official website',
      '2026-06-19'::date,
      true
    ),
    (
      'COC Switchboard / Advice Contact',
      'rotterdam',
      'other',
      'COC Rotterdam / Switchboard',
      'Switchboard 020 623 65 65; advice meetings via advies@cocrotterdam.nl',
      'https://cocrotterdam.nl/contact/',
      'Anonymous information and support route for questions around coming out, identity, sexuality, health, relationships, safety, faith, asylum and local LGBTQ+ life.',
      'Switchboard availability and in-person advice meetings vary; COC Rotterdam asks visitors to contact by email for appointments.',
      'https://cocrotterdam.nl/contact/',
      array[]::text[],
      'Schiedamsesingel 173, 3012 BB Rotterdam, Netherlands',
      51.916300,
      4.477400,
      '$',
      'lgbtq advice listening ear and referral support',
      array[]::text[],
      'COC Rotterdam contact page',
      '2026-06-19'::date,
      true
    ),
    (
      'Rotterdam Pride Organization',
      'rotterdam',
      'other',
      'Rotterdam Pride',
      'Use official contact and participation channels for volunteering, ideas, partners and current programme updates.',
      'https://www.rotterdam-pride.nl/contact/',
      'Organization behind Rotterdam Pride, Pride Festival, ambassadors, volunteering, partner routes and city-wide Pride participation.',
      'Seasonal festival organization; verify current programme and participation windows on the official website.',
      'https://www.rotterdam-pride.nl/',
      array[]::text[],
      'Rotterdam, Netherlands',
      51.924400,
      4.477700,
      '$',
      'pride organization festival participation and volunteering',
      array[]::text[],
      'Rotterdam Pride official website',
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
where lower(trim(city)) = 'rotterdam'

union all

select 'events', count(*)
from public.events
where lower(trim(city)) = 'rotterdam'

union all

select 'services', count(*)
from public.services
where lower(trim(city)) = 'rotterdam';
