-- Queer Atlas: Guatemala City city package
-- Verified 2026-06-20.
-- Safe to run multiple times.
--
-- App-facing links below are official venue/hotel/organization sites when verified.
-- Unverified nightlife and sauna social links are intentionally blank.
--
-- Restaurants and cafes use type = 'cafe' as required by the app/database.
-- Production-safe: vibe_tags are empty arrays to avoid stricter Supabase tag constraints.

begin;

with source_places as (
  select *
  from jsonb_to_recordset($qa_places$
[
  {
    "name": "G Bistro & Lounge Guatemala",
    "city": "guatemala_city",
    "type": "club",
    "description": "Central Zona 4 LGBTQ nightlife lounge and dance spot with karaoke, pop nights, drag-coded programming and a local after-work-to-late crowd.",
    "vibe": "zona 4 karaoke lounge and dance room",
    "hours": "Hours vary by event; verify current programming before visiting.",
    "link": "",
    "location": "Ruta 7 71, Zona 4, Guatemala City 01004, Guatemala",
    "lat": 14.6205,
    "lng": -90.5149
  },
  {
    "name": "Genetic Majestic Club",
    "city": "guatemala_city",
    "type": "club",
    "description": "Historic gay club reference in Zona 4 with late dance nights, drag shows and a local crowd connected to Guatemala City's long-running queer nightlife circuit.",
    "vibe": "historic zona 4 gay club",
    "hours": "Late-night event hours vary; verify current calendar before visiting.",
    "link": "",
    "location": "Ruta 3, Zona 4, Guatemala City 01004, Guatemala",
    "lat": 14.6208,
    "lng": -90.5157
  },
  {
    "name": "Black Club",
    "city": "guatemala_city",
    "type": "club",
    "description": "Zone 1 LGBTQ dance club with a darker late-night mood, DJ sets and weekend queer crowd energy.",
    "vibe": "zone 1 dark-room dance club",
    "hours": "Weekend late-night hours vary; check current listings before going.",
    "link": "",
    "location": "11 Calle 2-54, Zona 1, Guatemala City, Guatemala",
    "lat": 14.6372,
    "lng": -90.5131
  },
  {
    "name": "Glam Garden Bistro",
    "city": "guatemala_city",
    "type": "bar",
    "description": "Zone 1 queer-friendly bistro and bar with drag shows, cocktails and social local nightlife energy.",
    "vibe": "drag-friendly garden bistro bar",
    "hours": "Event-led hours vary; verify current schedule before visiting.",
    "link": "",
    "location": "4A Calle 5-30, Zona 1, Guatemala City, Guatemala",
    "lat": 14.6436,
    "lng": -90.5109
  },
  {
    "name": "Casa Vintage Lounge and Bar",
    "city": "guatemala_city",
    "type": "bar",
    "description": "Local lounge-bar option in central Guatemala City with mixed queer-friendly nights and casual drinks.",
    "vibe": "local vintage lounge bar",
    "hours": "Hours vary; verify current schedule before visiting.",
    "link": "",
    "location": "11 Calle 11-81, Guatemala City, Guatemala",
    "lat": 14.6362,
    "lng": -90.5221
  },
  {
    "name": "SO36 Bar",
    "city": "guatemala_city",
    "type": "cruise_club",
    "description": "Men-focused cruise-coded bar reference in Zone 1 with late social energy and a more adult nightlife feel.",
    "vibe": "men-focused zone 1 cruise bar",
    "hours": "Late-night hours vary; verify current status before visiting.",
    "link": "",
    "location": "5A Calle, Zona 1, Guatemala City, Guatemala",
    "lat": 14.6441,
    "lng": -90.5138
  },
  {
    "name": "The Box Lounge Groove",
    "city": "guatemala_city",
    "type": "club",
    "description": "Zona 10 nightlife lounge and dance venue with electronic, pop and queer-friendly event energy.",
    "vibe": "zona 10 lounge groove dance floor",
    "hours": "Event-led hours vary; verify current schedule before visiting.",
    "link": "",
    "location": "15 Calle 2-53 Zona 10, Guatemala City 01010, Guatemala",
    "lat": 14.5969,
    "lng": -90.5144
  },
  {
    "name": "Dansei Sauna",
    "city": "guatemala_city",
    "type": "sauna",
    "description": "Men-only sauna reference in central Guatemala City with steam, cabins and social cruising facilities.",
    "vibe": "central men-only sauna",
    "hours": "Hours vary; verify current opening times before visiting.",
    "link": "",
    "location": "3A Av 10-14, Guatemala City, Guatemala",
    "lat": 14.6380,
    "lng": -90.5124
  },
  {
    "name": "Greco Sauna",
    "city": "guatemala_city",
    "type": "sauna",
    "description": "Men-only sauna and cruising venue reference in Guatemala City with a local regular crowd.",
    "vibe": "local men-only sauna",
    "hours": "Hours vary; verify current opening times before visiting.",
    "link": "",
    "location": "20 Calle 9-49, Guatemala City, Guatemala",
    "lat": 14.6194,
    "lng": -90.5255
  },
  {
    "name": "G Wet Sauna",
    "city": "guatemala_city",
    "type": "sauna",
    "description": "Men-only sauna reference for Guatemala City's gay scene, useful to verify directly before visiting because listings can change quickly.",
    "vibe": "gay sauna and cruising stop",
    "hours": "Hours vary; verify current opening times before visiting.",
    "link": "",
    "location": "Guatemala City 01009, Guatemala",
    "lat": 14.6018,
    "lng": -90.5169
  },
  {
    "name": "Rojo Cerezo Coffee",
    "city": "guatemala_city",
    "type": "cafe",
    "description": "Zona 4 specialty coffee stop near the creative district, useful as a low-pressure queer-friendly daytime meeting point.",
    "vibe": "zona 4 coffee meet-up spot",
    "hours": "Cafe hours vary; verify current hours before visiting.",
    "link": "",
    "location": "Campus Tecnologico, Via 4, Guatemala City 01004, Guatemala",
    "lat": 14.6209,
    "lng": -90.5150
  },
  {
    "name": "San Martin Centro Historico",
    "city": "guatemala_city",
    "type": "cafe",
    "description": "Reliable Guatemalan bakery, cafe and restaurant branch in the historic center, useful for daytime planning around Zone 1.",
    "vibe": "historic-center bakery cafe",
    "hours": "Daily cafe and restaurant hours vary by branch; verify current hours on the official site.",
    "link": "https://sanmartinbakery.com/",
    "location": "6A Avenida 10-00, Zona 1, Guatemala City 01001, Guatemala",
    "lat": 14.6394,
    "lng": -90.5135
  },
  {
    "name": "La Cocina de la Senora Pu",
    "city": "guatemala_city",
    "type": "cafe",
    "description": "Acclaimed Guatemalan restaurant in Zone 1 with traditional flavors and a strong cultural stop for queer travelers planning a central-city day.",
    "vibe": "traditional guatemalan kitchen",
    "hours": "Restaurant hours vary; verify current hours before visiting.",
    "link": "",
    "location": "6A Avenida A 10-16, Zona 1, Guatemala City 01001, Guatemala",
    "lat": 14.6389,
    "lng": -90.5132
  },
  {
    "name": "Diaca",
    "city": "guatemala_city",
    "type": "cafe",
    "description": "High-end contemporary Guatemalan restaurant in Zona 4, good for a more polished dinner before nightlife.",
    "vibe": "zona 4 contemporary guatemalan dining",
    "hours": "Dining hours vary by reservation; verify current availability on the official site.",
    "link": "https://www.diaca.gt/",
    "location": "Via 6, 3-56 Edificio OEG, Nivel Atelier, Guatemala City, Guatemala",
    "lat": 14.6218,
    "lng": -90.5145
  },
  {
    "name": "Good Hotel Guatemala City",
    "city": "guatemala_city",
    "type": "hotel",
    "description": "Design-forward hotel in Zona 4 with a social-impact model, walkable access to cafes and easier ride connections to central nightlife.",
    "vibe": "zona 4 design hotel base",
    "hours": "Hotel open daily; reception and booking services operate continuously.",
    "link": "https://www.goodhotel.com/guatemala-city",
    "location": "Ruta 4 6-32, Zona 4, Guatemala City, Guatemala",
    "lat": 14.6222,
    "lng": -90.5137
  },
  {
    "name": "Tikal Futura Hotel & Convention Center",
    "city": "guatemala_city",
    "type": "hotel",
    "description": "Large full-service hotel in Zona 11 with convention facilities, useful for travelers who want a western-side base near Miraflores and Roosevelt corridor.",
    "vibe": "zona 11 full-service hotel",
    "hours": "Hotel open daily; reception and booking services operate continuously.",
    "link": "https://www.tfhotel.com/",
    "location": "Calzada Roosevelt 22-43, Zona 11, Guatemala City, Guatemala",
    "lat": 14.6226,
    "lng": -90.5538
  },
  {
    "name": "La Inmaculada Hotel",
    "city": "guatemala_city",
    "type": "hotel",
    "description": "Boutique hotel option in Zona 10, useful for travelers who want restaurants, safer evening logistics and short rides to nightlife.",
    "vibe": "zona 10 boutique hotel base",
    "hours": "Hotel open daily; reception and booking services operate continuously.",
    "link": "",
    "location": "14 Calle 7, Zona 10, Guatemala City, Guatemala",
    "lat": 14.5952,
    "lng": -90.5145
  },
  {
    "name": "Hotel Casa Veranda",
    "city": "guatemala_city",
    "type": "hotel",
    "description": "Zona 10 aparthotel-style base with practical rooms and easy access to restaurants, bars and ride routes.",
    "vibe": "zona 10 practical aparthotel",
    "hours": "Hotel open daily; reception and booking services operate continuously.",
    "link": "https://www.hotelcasaveranda.com/",
    "location": "12 Calle 1-24, Zona 10, Guatemala City, Guatemala",
    "lat": 14.5981,
    "lng": -90.5130
  },
  {
    "name": "Hotel San Carlos",
    "city": "guatemala_city",
    "type": "hotel",
    "description": "Classic Avenida La Reforma hotel option with a calmer stay profile between Zona 9 and Zona 10.",
    "vibe": "classic reforma hotel base",
    "hours": "Hotel open daily; reception and booking services operate continuously.",
    "link": "",
    "location": "Avenida La Reforma 7-89, Zona 10, Guatemala City, Guatemala",
    "lat": 14.6082,
    "lng": -90.5141
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
    "name": "Desfile de la Diversidad Sexual e Identidad de Genero de Guatemala",
    "city": "guatemala_city",
    "description": "Guatemala City's annual Pride march and diversity visibility moment, usually centered on community organizations and public advocacy.",
    "link": "https://visibles.gt/",
    "date": null,
    "start_date": null,
    "end_date": null,
    "location": "Guatemala City, Guatemala",
    "lat": 14.6349,
    "lng": -90.5069,
    "vibe": "annual pride march and visibility day"
  },
  {
    "name": "Genetic Majestic Drag Nights",
    "city": "guatemala_city",
    "description": "Recurring drag and dance programming signal at Genetic Majestic Club; verify the current weekly flyer before going.",
    "link": "",
    "date": null,
    "start_date": null,
    "end_date": null,
    "location": "Ruta 3, Zona 4, Guatemala City 01004, Guatemala",
    "lat": 14.6208,
    "lng": -90.5157,
    "vibe": "drag and late dance night"
  },
  {
    "name": "G Bistro Karaoke and Reggaeton Nights",
    "city": "guatemala_city",
    "description": "Karaoke, pop and reggaeton-led queer nightlife nights at G Bistro & Lounge; check same-week programming before visiting.",
    "link": "",
    "date": null,
    "start_date": null,
    "end_date": null,
    "location": "Ruta 7 71, Zona 4, Guatemala City 01004, Guatemala",
    "lat": 14.6205,
    "lng": -90.5149,
    "vibe": "karaoke pop and reggaeton night"
  },
  {
    "name": "Glam Garden Drag Shows",
    "city": "guatemala_city",
    "description": "Drag-show and social bar programming signal at Glam Garden Bistro; verify current dates before visiting.",
    "link": "",
    "date": null,
    "start_date": null,
    "end_date": null,
    "location": "4A Calle 5-30, Zona 1, Guatemala City, Guatemala",
    "lat": 14.6436,
    "lng": -90.5109,
    "vibe": "drag show social night"
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
    "name": "Visibles Guatemala",
    "city": "guatemala_city",
    "type": "other",
    "provider_name": "Visibles Guatemala",
    "contact": "",
    "booking_link": "https://visibles.gt/",
    "description": "Guatemalan LGBTQ rights and visibility organization, useful for community context, advocacy signals and local inclusion resources.",
    "hours": "Organization hours and programming vary; check the official website or social channels.",
    "link": "https://visibles.gt/",
    "image_urls": [],
    "location": "Guatemala City, Guatemala",
    "lat": 14.6349,
    "lng": -90.5069,
    "price_tier": "",
    "vibe": "lgbtq advocacy and visibility resource",
    "source": "Visibles Guatemala official website",
    "lastChecked": "2026-06-20",
    "verified": true
  },
  {
    "name": "Asociacion Lambda Guatemala Signal",
    "city": "guatemala_city",
    "type": "other",
    "provider_name": "Asociacion Lambda Guatemala",
    "contact": "",
    "booking_link": "",
    "description": "Community-resource signal for LGBTQ support and advocacy in Guatemala City. Verify the current contact channel before referring travelers.",
    "hours": "Hours and contact channels vary; verify current status before visiting or referring.",
    "link": "",
    "image_urls": [],
    "location": "Guatemala City, Guatemala",
    "lat": 14.6349,
    "lng": -90.5069,
    "price_tier": "",
    "vibe": "community support and advocacy signal",
    "source": "Curated Guatemala LGBTQ community research",
    "lastChecked": "2026-06-20",
    "verified": false
  },
  {
    "name": "OTRANS Reinas de la Noche Signal",
    "city": "guatemala_city",
    "type": "other",
    "provider_name": "OTRANS Reinas de la Noche",
    "contact": "",
    "booking_link": "",
    "description": "Trans community and human-rights resource signal for Guatemala. Verify the current contact channel before referring travelers.",
    "hours": "Hours and contact channels vary; verify current status before visiting or referring.",
    "link": "",
    "image_urls": [],
    "location": "Guatemala City, Guatemala",
    "lat": 14.6349,
    "lng": -90.5069,
    "price_tier": "",
    "vibe": "trans rights and community resource signal",
    "source": "Curated Guatemala LGBTQ community research",
    "lastChecked": "2026-06-20",
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

select 'places' as table_name, count(*) as rows_for_guatemala_city
from public.places
where city = 'guatemala_city'
union all
select 'events' as table_name, count(*) as rows_for_guatemala_city
from public.events
where city = 'guatemala_city'
union all
select 'services' as table_name, count(*) as rows_for_guatemala_city
from public.services
where city = 'guatemala_city';
