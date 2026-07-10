-- Queer Atlas: Tegucigalpa curated city package
-- Researched and prepared 2026-07-10.
-- Safe to run multiple times.
--
-- Important curation note:
-- Publicly verifiable dedicated LGBTQ bars, clubs, saunas and cruising clubs in
-- Tegucigalpa are not stable enough to list as active fixed venues. This package
-- therefore prioritizes verified community resources, safer visitor bases,
-- cultural/social anchors, and event-led queer signals.
--
-- Per project requirement, lat/lng are never null in this SQL. When a public
-- exact address is not verified, coordinates use a conservative city-center or
-- district-level signal point rather than a false exact venue pin.

begin;

with source_places as (
  select *
  from jsonb_to_recordset($qa_places$
[
  {
    "name": "Hyatt Place Tegucigalpa",
    "city": "tegucigalpa",
    "type": "hotel",
    "description": "International hotel base useful for LGBTQ travelers who want predictable logistics, rideshare-friendly access and a safer-feeling business-district stay while checking same-week community events.",
    "vibe": "polished business-hotel base for careful city routing",
    "hours": "Hotel open daily; reception and guest services follow the booking confirmation.",
    "link": "https://www.hyatt.com/hyatt-place/en-US/tguzt-hyatt-place-tegucigalpa",
    "location": "Blvd. San Juan Bosco, Tegucigalpa, Honduras",
    "lat": 14.0959,
    "lng": -87.1874
  },
  {
    "name": "Real InterContinental Tegucigalpa",
    "city": "tegucigalpa",
    "type": "hotel",
    "description": "Premium Multiplaza-area hotel option with stronger visitor logistics, restaurants nearby and easier direct transport for travelers prioritizing comfort and safety over cheap late-night movement.",
    "vibe": "premium Multiplaza hotel anchor with easy rides",
    "hours": "Hotel open daily; reception and guest services follow the booking confirmation.",
    "link": "https://www.ihg.com/intercontinental/hotels/us/en/tegucigalpa/tguha/hoteldetail",
    "location": "Avenida Roble, frente a Mall Multiplaza, Tegucigalpa, Honduras",
    "lat": 14.0878,
    "lng": -87.1882
  },
  {
    "name": "Holiday Inn Express Tegucigalpa",
    "city": "tegucigalpa",
    "type": "hotel",
    "description": "Practical international hotel base near the main business and shopping corridors, useful for queer travelers who want straightforward transport, predictable rooms and a calmer return plan after events.",
    "vibe": "practical business-corridor stay with direct transport",
    "hours": "Hotel open daily; reception and guest services follow the booking confirmation.",
    "link": "https://www.ihg.com/holidayinnexpress/hotels/us/en/tegucigalpa/tguhe/hoteldetail",
    "location": "Colonia Lomas del Mayab, Tegucigalpa, Honduras",
    "lat": 14.0906,
    "lng": -87.1849
  },
  {
    "name": "Hotel Plaza Juan Carlos",
    "city": "tegucigalpa",
    "type": "hotel",
    "description": "Colonia Palmira hotel base close to embassies, cafes and cultural movement, useful for travelers who want central access while keeping late-night routes simple and direct.",
    "vibe": "Palmira hotel base for culture and careful routing",
    "hours": "Hotel open daily; reception and guest services follow the booking confirmation.",
    "link": "",
    "location": "Colonia Palmira, Tegucigalpa, Honduras",
    "lat": 14.1002,
    "lng": -87.2034
  },
  {
    "name": "Cafe Paradiso Tegucigalpa",
    "city": "tegucigalpa",
    "type": "cafe",
    "description": "Cultural cafe and restaurant signal in the Palmira orbit, useful as a low-pressure daytime or early-evening meeting point before checking current queer event flyers.",
    "vibe": "Palmira cultural cafe and soft social start",
    "hours": "Cafe and restaurant hours vary; verify same-day before visiting.",
    "link": "",
    "location": "Colonia Palmira, Tegucigalpa, Honduras",
    "lat": 14.1006,
    "lng": -87.2042
  },
  {
    "name": "Centro Cultural de Espana en Tegucigalpa",
    "city": "tegucigalpa",
    "type": "cafe",
    "description": "Public cultural anchor in Colonia Palmira with exhibitions, talks and arts programming; useful for visitors looking for safer daytime context and occasional diversity-adjacent cultural programming.",
    "vibe": "Palmira arts-and-culture daytime anchor",
    "hours": "Cultural programming hours vary; verify the current calendar before visiting.",
    "link": "https://ccetegucigalpa.org/",
    "location": "Colonia Palmira, Tegucigalpa, Honduras",
    "lat": 14.1011,
    "lng": -87.2045
  },
  {
    "name": "Tegucigalpa Community Nightlife Signal",
    "city": "tegucigalpa",
    "type": "bar",
    "description": "Event-led queer nightlife signal for Tegucigalpa. Current dedicated gay bars and clubs are not reliably verifiable as fixed active venues, so use this as a reminder to check trusted same-week flyers before going out.",
    "vibe": "event-led nightlife rather than fixed gay strip",
    "hours": "No fixed public hours; verify same-week event flyers and trusted local channels.",
    "link": "",
    "location": "Tegucigalpa, Honduras",
    "lat": 14.0723,
    "lng": -87.2068
  },
  {
    "name": "Tegucigalpa Cruising Safety Note",
    "city": "tegucigalpa",
    "type": "cruising_area",
    "description": "Safety-first placeholder: public cruising areas are not recommended for travelers in Tegucigalpa without trusted local guidance. Prefer verified community events, private trusted networks and direct transport.",
    "vibe": "do-not-improvise public cruising safety signal",
    "hours": "No recommended public cruising hours; avoid unknown late-night meeting points.",
    "link": "",
    "location": "Tegucigalpa, Honduras",
    "lat": 14.0723,
    "lng": -87.2068
  }
]
$qa_places$::jsonb) as p(
    name text,
    city text,
    type text,
    description text,
    vibe text,
    hours text,
    link text,
    location text,
    lat double precision,
    lng double precision
  )
)
insert into public.places (
  name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng
)
select
  p.name,
  p.city,
  p.type,
  p.description,
  p.vibe,
  array[]::text[],
  p.hours,
  p.link,
  p.location,
  p.lat,
  p.lng
from source_places p
where not exists (
  select 1
  from public.places existing
  where lower(existing.city) = lower(p.city)
    and lower(existing.name) = lower(p.name)
);

with source_events as (
  select *
  from jsonb_to_recordset($qa_events$
[
  {
    "name": "Tegucigalpa Pride and Diversity March Signal",
    "city": "tegucigalpa",
    "description": "Annual LGBTQ visibility and diversity-march signal in Tegucigalpa. Dates can shift by organizer and year, so confirm the current Pride calendar through local organizations before travel.",
    "link": "",
    "date": null,
    "start_date": null,
    "end_date": null,
    "location": "Tegucigalpa, Honduras",
    "lat": 14.0723,
    "lng": -87.2068,
    "vibe": "annual pride visibility and rights march"
  },
  {
    "name": "Cattrachas Advocacy and Memory Calendar",
    "city": "tegucigalpa",
    "description": "Community calendar signal for LGBTI human-rights documentation, visibility, memory and advocacy work connected to Cattrachas. Check the official website and current channels for active programming.",
    "link": "https://www.cattrachas.org/",
    "date": null,
    "start_date": null,
    "end_date": null,
    "location": "Tegucigalpa, Honduras",
    "lat": 14.0723,
    "lng": -87.2068,
    "vibe": "rights documentation and community memory"
  },
  {
    "name": "Transformismo and Drag Event Signal",
    "city": "tegucigalpa",
    "description": "Tegucigalpa has a transformismo and drag-event history, but public fixed schedules are not stable. Use this signal to check hotel, club and organizer flyers during the week of travel.",
    "link": "",
    "date": null,
    "start_date": null,
    "end_date": null,
    "location": "Tegucigalpa, Honduras",
    "lat": 14.0723,
    "lng": -87.2068,
    "vibe": "event-led drag and transformismo nights"
  },
  {
    "name": "World AIDS Day Community Actions",
    "city": "tegucigalpa",
    "description": "Annual HIV-awareness and community-health action date. Local programming varies by organization; verify active Tegucigalpa events with health and community groups before attending.",
    "link": "",
    "date": "2026-12-01",
    "start_date": "2026-12-01",
    "end_date": "2026-12-01",
    "location": "Tegucigalpa, Honduras",
    "lat": 14.0723,
    "lng": -87.2068,
    "vibe": "hiv awareness and community health day"
  }
]
$qa_events$::jsonb) as e(
    name text,
    city text,
    description text,
    link text,
    date date,
    start_date date,
    end_date date,
    location text,
    lat double precision,
    lng double precision,
    vibe text
  )
)
insert into public.events (
  name, city, description, link, date, start_date, end_date, location, lat, lng, vibe, vibe_tags
)
select
  e.name,
  e.city,
  e.description,
  e.link,
  e.date,
  e.start_date,
  e.end_date,
  e.location,
  e.lat,
  e.lng,
  e.vibe,
  array[]::text[]
from source_events e
where not exists (
  select 1
  from public.events existing
  where lower(existing.city) = lower(e.city)
    and lower(existing.name) = lower(e.name)
);

with source_services as (
  select *
  from jsonb_to_recordset($qa_services$
[
  {
    "name": "Cattrachas",
    "city": "tegucigalpa",
    "type": "other",
    "provider_name": "Cattrachas",
    "contact": "",
    "booking_link": "https://www.cattrachas.org/",
    "description": "Lesbian feminist and LGBTI human-rights organization documenting violence, rights conditions and public memory in Honduras. Best used as a rights-context and trusted community-source signal, not a walk-in tourist office.",
    "hours": "Organization programming and contact hours vary; use the official website or current channels.",
    "link": "https://www.cattrachas.org/",
    "image_urls": [],
    "location": "Tegucigalpa, Honduras",
    "lat": 14.0723,
    "lng": -87.2068,
    "price_tier": "",
    "vibe": "lgbti rights documentation and memory resource",
    "source": "Cattrachas official website",
    "lastChecked": "2026-07-10",
    "verified": true
  },
  {
    "name": "Asociacion Arcoiris Honduras Signal",
    "city": "tegucigalpa",
    "type": "other",
    "provider_name": "Asociacion Arcoiris Honduras",
    "contact": "",
    "booking_link": "",
    "description": "Long-running Tegucigalpa LGBTI rights and community-support signal. Verify current contact and safety context before referring travelers or planning a visit.",
    "hours": "Hours and contact channels vary; verify current status before visiting or referring.",
    "link": "",
    "image_urls": [],
    "location": "Tegucigalpa, Honduras",
    "lat": 14.0723,
    "lng": -87.2068,
    "price_tier": "",
    "vibe": "lgbti rights and community support signal",
    "source": "Curated Honduras LGBTI community research",
    "lastChecked": "2026-07-10",
    "verified": false
  },
  {
    "name": "Asociacion Kukulcan / SOMOS CDC Honduras Signal",
    "city": "tegucigalpa",
    "type": "wellness",
    "provider_name": "Asociacion Kukulcan / SOMOS CDC Honduras",
    "contact": "",
    "booking_link": "",
    "description": "HIV, community health and LGBTI support signal associated with Tegucigalpa networks. Verify current services, location and referral process before sending a traveler.",
    "hours": "Health-service hours and referral channels vary; verify current status before visiting.",
    "link": "",
    "image_urls": [],
    "location": "Tegucigalpa, Honduras",
    "lat": 14.0723,
    "lng": -87.2068,
    "price_tier": "",
    "vibe": "hiv prevention and lgbti community health signal",
    "source": "Curated Honduras LGBTI health-service research",
    "lastChecked": "2026-07-10",
    "verified": false
  },
  {
    "name": "APUVIMEH Honduras Signal",
    "city": "tegucigalpa",
    "type": "wellness",
    "provider_name": "APUVIMEH",
    "contact": "",
    "booking_link": "",
    "description": "Community health and support signal connected to people living with HIV and affected communities in Honduras. Confirm active contact channels and eligibility before referral.",
    "hours": "Hours and service availability vary; verify current status before visiting or referring.",
    "link": "",
    "image_urls": [],
    "location": "Tegucigalpa, Honduras",
    "lat": 14.0723,
    "lng": -87.2068,
    "price_tier": "",
    "vibe": "hiv community support and referral signal",
    "source": "Curated Honduras HIV and community-service research",
    "lastChecked": "2026-07-10",
    "verified": false
  }
]
$qa_services$::jsonb) as s(
    name text,
    city text,
    type text,
    provider_name text,
    contact text,
    booking_link text,
    description text,
    hours text,
    link text,
    image_urls text[],
    location text,
    lat double precision,
    lng double precision,
    price_tier text,
    vibe text,
    source text,
    "lastChecked" date,
    verified boolean
  )
)
insert into public.services (
  name, city, type, provider_name, contact, booking_link, description, hours, link,
  image_urls, location, lat, lng, price_tier, vibe, vibe_tags, source, "lastChecked", verified
)
select
  s.name,
  s.city,
  s.type,
  s.provider_name,
  s.contact,
  s.booking_link,
  s.description,
  s.hours,
  s.link,
  coalesce(s.image_urls, array[]::text[]),
  s.location,
  s.lat,
  s.lng,
  s.price_tier,
  s.vibe,
  array[]::text[],
  s.source,
  s."lastChecked",
  s.verified
from source_services s
where not exists (
  select 1
  from public.services existing
  where lower(existing.city) = lower(s.city)
    and lower(existing.name) = lower(s.name)
);

commit;

select 'places' as table_name, count(*) as rows_for_tegucigalpa
from public.places
where city = 'tegucigalpa'
union all
select 'events' as table_name, count(*) as rows_for_tegucigalpa
from public.events
where city = 'tegucigalpa'
union all
select 'services' as table_name, count(*) as rows_for_tegucigalpa
from public.services
where city = 'tegucigalpa';
