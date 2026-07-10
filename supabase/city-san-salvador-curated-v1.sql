-- Queer Atlas: San Salvador curated city package
-- Researched and prepared 2026-07-10.
-- Safe to run multiple times.
--
-- Important curation note:
-- San Salvador has a small and changeable LGBTQ scene. Publicly verifiable
-- fixed gay nightlife is limited, and active saunas / cruising clubs are not
-- stable enough to list as normal venues. This package uses verified guide
-- references, practical visitor anchors, community resources and safety notes.
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
    "name": "Nomada",
    "city": "san_salvador",
    "type": "bar",
    "description": "GayCities-listed San Salvador bar and cocktail lounge reference. Use it as a current queer-nightlife signal, but verify same-day hours and social channels before going because the local scene changes quickly.",
    "vibe": "small-scene cocktail lounge and queer nightlife signal",
    "hours": "Nightlife hours vary; verify current schedule before visiting.",
    "link": "https://sansalvador.gaycities.com/bars",
    "location": "Poligono G #23 Finca, San Salvador, El Salvador",
    "lat": 13.7019,
    "lng": -89.2186
  },
  {
    "name": "Scape",
    "city": "san_salvador",
    "type": "club",
    "description": "GayCities-listed San Salvador dance-club reference with a nightlife / go-go energy profile. Confirm active hours and event flyers before making it the main stop of the night.",
    "vibe": "late dance-room and queer club signal",
    "hours": "Nightlife hours vary; verify same-day before visiting.",
    "link": "https://sansalvador.gaycities.com/bars",
    "location": "61 Avenida Norte 61, San Salvador, El Salvador",
    "lat": 13.7042,
    "lng": -89.2268
  },
  {
    "name": "Zona Rosa / San Benito Social Base",
    "city": "san_salvador",
    "type": "bar",
    "description": "Visitor-friendly restaurant, hotel and nightlife corridor around Zona Rosa and Colonia San Benito. It is not a gay district, but it is the easiest base for curated queer nights, direct rides and safer returns.",
    "vibe": "polished visitor corridor for curated queer nights",
    "hours": "Area venues vary; plan around confirmed bookings and current hours.",
    "link": "https://sansalvador.gaycities.com/",
    "location": "Zona Rosa / Colonia San Benito, San Salvador, El Salvador",
    "lat": 13.6921,
    "lng": -89.2422
  },
  {
    "name": "San Salvador Sauna Safety Note",
    "city": "san_salvador",
    "type": "sauna",
    "description": "Safety-first placeholder: no stable, publicly verifiable active gay sauna was confirmed for San Salvador during curation. Prefer verified venues, private trusted networks and same-week community guidance.",
    "vibe": "no verified active sauna; check trusted local channels",
    "hours": "No verified public sauna hours.",
    "link": "",
    "location": "San Salvador, El Salvador",
    "lat": 13.6929,
    "lng": -89.2182
  },
  {
    "name": "San Salvador Cruising Safety Note",
    "city": "san_salvador",
    "type": "cruising_area",
    "description": "Safety-first placeholder: public cruising areas are not recommended for travelers without trusted local guidance. Use known venues, direct transport and safer private networks instead of improvising unknown late-night meeting points.",
    "vibe": "do-not-improvise public cruising signal",
    "hours": "No recommended public cruising hours.",
    "link": "",
    "location": "San Salvador, El Salvador",
    "lat": 13.6929,
    "lng": -89.2182
  },
  {
    "name": "Museo de Arte de El Salvador (MARTE)",
    "city": "san_salvador",
    "type": "cafe",
    "description": "Major San Salvador art museum and daytime culture anchor in the San Benito orbit. Useful for a calmer queer city day before an evening around Zona Rosa.",
    "vibe": "polished art-and-culture daytime anchor",
    "hours": "Museum hours vary; verify the official calendar before visiting.",
    "link": "https://www.marte.org.sv/",
    "location": "Final Avenida La Revolucion, Colonia San Benito, San Salvador, El Salvador",
    "lat": 13.6928,
    "lng": -89.2419
  },
  {
    "name": "Museo de la Palabra y la Imagen (MUPI)",
    "city": "san_salvador",
    "type": "cafe",
    "description": "Memory and human-rights museum signal for travelers who want historical context beyond nightlife. Best used as a daytime cultural stop with direct transport.",
    "vibe": "memory, rights and culture stop",
    "hours": "Museum hours vary; verify the official calendar before visiting.",
    "link": "https://museo.com.sv/",
    "location": "27 Avenida Norte, San Salvador, El Salvador",
    "lat": 13.7114,
    "lng": -89.2075
  },
  {
    "name": "Nico Urban Hotel",
    "city": "san_salvador",
    "type": "hotel",
    "description": "Boutique San Benito hotel base useful for LGBTQ travelers who want calmer logistics, walkable restaurants nearby and easier direct rides to verified nightlife.",
    "vibe": "boutique San Benito base with low-friction rides",
    "hours": "Hotel open daily; reception and guest services follow the booking confirmation.",
    "link": "https://www.nicourbanhotel.com/",
    "location": "Bulevar del Hipodromo 605, San Salvador, El Salvador",
    "lat": 13.6926,
    "lng": -89.2414
  },
  {
    "name": "Suites Las Palmas",
    "city": "san_salvador",
    "type": "hotel",
    "description": "Zona Rosa / San Benito hotel option with useful visitor logistics, restaurants nearby and a practical base for short curated queer nights.",
    "vibe": "Zona Rosa hotel base for simple night routing",
    "hours": "Hotel open daily; reception and guest services follow the booking confirmation.",
    "link": "https://www.suiteslaspalmas.com/",
    "location": "Bulevar del Hipodromo, Colonia San Benito, San Salvador, El Salvador",
    "lat": 13.6929,
    "lng": -89.2411
  },
  {
    "name": "Arbol de Fuego Eco-Hotel",
    "city": "san_salvador",
    "type": "hotel",
    "description": "Small eco-hotel base in Antiguo Cuscatlan / La Sultana orbit, useful for travelers who prefer quieter nights and direct transport over staying in the densest nightlife zone.",
    "vibe": "quiet eco-hotel base near Antiguo Cuscatlan",
    "hours": "Hotel open daily; reception and guest services follow the booking confirmation.",
    "link": "https://www.arboldefuego.com/",
    "location": "Avenida Antiguo Cuscatlan, San Salvador / Antiguo Cuscatlan, El Salvador",
    "lat": 13.6739,
    "lng": -89.2417
  },
  {
    "name": "Cadejo Brewing Company Zona Rosa Signal",
    "city": "san_salvador",
    "type": "cafe",
    "description": "Mixed craft-beer and restaurant signal near the visitor corridor. Not a gay venue, but useful as a safer pre-night meeting point before moving by direct ride.",
    "vibe": "mixed craft-beer meet point before curated nightlife",
    "hours": "Restaurant and bar hours vary; verify same-day before visiting.",
    "link": "https://cadejobrewing.com/",
    "location": "Zona Rosa, San Salvador, El Salvador",
    "lat": 13.6921,
    "lng": -89.2422
  },
  {
    "name": "Il Bongustaio San Benito Signal",
    "city": "san_salvador",
    "type": "cafe",
    "description": "GayCities-listed restaurant signal in the San Benito visitor zone. Useful for a polished dinner base before a small-scene queer night.",
    "vibe": "San Benito dinner anchor before nightlife",
    "hours": "Restaurant hours vary; verify same-day before visiting.",
    "link": "https://sansalvador.gaycities.com/restaurants",
    "location": "Colonia San Benito, San Salvador, El Salvador",
    "lat": 13.6927,
    "lng": -89.2416
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
    "name": "San Salvador Pride March Signal",
    "city": "san_salvador",
    "description": "Annual San Salvador LGBTQ pride and visibility march signal. Confirm the current route, date and organizer guidance before travel because Pride scheduling can shift by year.",
    "link": "",
    "date": null,
    "start_date": null,
    "end_date": null,
    "location": "San Salvador, El Salvador",
    "lat": 13.6929,
    "lng": -89.2182,
    "vibe": "annual pride visibility and rights march"
  },
  {
    "name": "IDAHOBIT San Salvador Community Signal",
    "city": "san_salvador",
    "description": "Annual May 17 anti-homophobia and anti-transphobia community-action date. Programming varies by organization and year; verify current local events before attending.",
    "link": "",
    "date": "2027-05-17",
    "start_date": "2027-05-17",
    "end_date": "2027-05-17",
    "location": "San Salvador, El Salvador",
    "lat": 13.6929,
    "lng": -89.2182,
    "vibe": "rights visibility and community action day"
  },
  {
    "name": "World AIDS Day San Salvador Community Actions",
    "city": "san_salvador",
    "description": "Annual HIV-awareness and community-health action date. Local programming varies by health and LGBTQ organizations; verify active events before attending.",
    "link": "",
    "date": "2026-12-01",
    "start_date": "2026-12-01",
    "end_date": "2026-12-01",
    "location": "San Salvador, El Salvador",
    "lat": 13.6929,
    "lng": -89.2182,
    "vibe": "hiv awareness and community health day"
  },
  {
    "name": "San Salvador Drag and Queer Nightlife Signal",
    "city": "san_salvador",
    "description": "Event-led queer nightlife signal for San Salvador. Check venue social channels and local flyers the week of travel rather than assuming fixed weekly programming.",
    "link": "https://sansalvador.gaycities.com/bars",
    "date": null,
    "start_date": null,
    "end_date": null,
    "location": "San Salvador, El Salvador",
    "lat": 13.6929,
    "lng": -89.2182,
    "vibe": "event-led drag, dancing and small-scene nightlife"
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
    "name": "Asociacion Entre Amigos Signal",
    "city": "san_salvador",
    "type": "other",
    "provider_name": "Asociacion Entre Amigos",
    "contact": "",
    "booking_link": "",
    "description": "Long-running LGBTQ rights and HIV/community-health signal in El Salvador. Verify current contact channels and safety context before referring travelers or planning a visit.",
    "hours": "Hours and contact channels vary; verify current status before visiting or referring.",
    "link": "",
    "image_urls": [],
    "location": "San Salvador, El Salvador",
    "lat": 13.6929,
    "lng": -89.2182,
    "price_tier": "",
    "vibe": "lgbtq rights, hiv prevention and community support signal",
    "source": "Curated El Salvador LGBTQ community research",
    "lastChecked": "2026-07-10",
    "verified": false
  },
  {
    "name": "COMCAVIS TRANS Signal",
    "city": "san_salvador",
    "type": "wellness",
    "provider_name": "COMCAVIS TRANS",
    "contact": "",
    "booking_link": "",
    "description": "Trans and LGBTI rights / support organization signal for El Salvador. Use as a trusted-community-source pointer, then confirm active services and safe contact process directly.",
    "hours": "Program and contact hours vary; verify current status before visiting or referring.",
    "link": "https://www.comcavis.org.sv/",
    "image_urls": [],
    "location": "San Salvador, El Salvador",
    "lat": 13.6929,
    "lng": -89.2182,
    "price_tier": "",
    "vibe": "trans rights, protection and community support signal",
    "source": "COMCAVIS TRANS official website",
    "lastChecked": "2026-07-10",
    "verified": true
  },
  {
    "name": "ASPIDH Arcoiris Trans Signal",
    "city": "san_salvador",
    "type": "other",
    "provider_name": "ASPIDH Arcoiris Trans",
    "contact": "",
    "booking_link": "",
    "description": "Trans community and advocacy signal in El Salvador. Verify current contact channels, location and referral process before sending travelers.",
    "hours": "Hours and contact channels vary; verify current status before visiting or referring.",
    "link": "",
    "image_urls": [],
    "location": "San Salvador, El Salvador",
    "lat": 13.6929,
    "lng": -89.2182,
    "price_tier": "",
    "vibe": "trans community advocacy and support signal",
    "source": "Curated El Salvador trans community research",
    "lastChecked": "2026-07-10",
    "verified": false
  },
  {
    "name": "San Salvador HIV and Sexual Health Referral Signal",
    "city": "san_salvador",
    "type": "wellness",
    "provider_name": "Community health referral signal",
    "contact": "",
    "booking_link": "",
    "description": "Safety-first health-service pointer for LGBTQ travelers. Confirm current HIV testing, PrEP, sexual-health and referral options through trusted local organizations before visiting.",
    "hours": "Service hours vary by provider; verify current eligibility and booking process.",
    "link": "",
    "image_urls": [],
    "location": "San Salvador, El Salvador",
    "lat": 13.6929,
    "lng": -89.2182,
    "price_tier": "",
    "vibe": "hiv prevention and sexual-health referral signal",
    "source": "Curated El Salvador LGBTQ health-service research",
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

select 'places' as table_name, count(*) as rows_for_san_salvador
from public.places
where city = 'san_salvador'
union all
select 'events' as table_name, count(*) as rows_for_san_salvador
from public.events
where city = 'san_salvador'
union all
select 'services' as table_name, count(*) as rows_for_san_salvador
from public.services
where city = 'san_salvador';
