-- Queer Atlas: Leipzig city package
-- Editorially checked 2026-08-10.
-- Safe to run more than once: matching city/name rows are updated, not duplicated.
--
-- Core research:
-- https://csd-leipzig.de/csd-2026/
-- https://www.rosalinde-leipzig.de/
-- https://www.leipzig.aidshilfe.de/
-- https://www.frauenkultur-leipzig.de/angebote/aktuelle-projekte/leletre-leipziger-lesbentreffen/
-- https://www.leipzig-baeren.de/party/
-- https://www.passage-kinos.de/queerblick
-- Official venue and service links are stored on every record below.

begin;

with qa_leipzig_places as (
select * from jsonb_to_recordset($places$
[
  {
    "name": "Havanna Club Leipzig",
    "city": "leipzig",
    "type": "bar",
    "description": "A tiny, long-running scene bar tucked into the Theaterpassage, best for an unhurried first drink rather than a full-scale club night. The room mixes LGBTQIA+ regulars, friends and curious visitors without much ceremony; two daily happy hours keep it lively before dinner and again around midnight.",
    "vibe": "old-school pocket bar with local conversation and late-night warmth",
    "hours": "Daily from 19:00. Happy hour 19:00–20:00 and 00:00–01:00; closing time can vary.",
    "link": "https://havanna-club-leipzig.de/",
    "location": "Theaterpassage, Goethestraße 2, 04109 Leipzig, Germany",
    "lat": 51.3399293,
    "lng": 12.3798802,
    "seo_quality_status": "approved"
  },
  {
    "name": "APART Bar",
    "city": "leipzig",
    "type": "bar",
    "description": "A central gay lounge with more breathing room than Havanna, a broad cocktail list and karaoke on selected nights. It works well for mixed groups and first-time visitors: polished enough for a date, relaxed enough to arrive alone, and close to the station and the rest of the centre route.",
    "vibe": "easy central gay lounge for cocktails, karaoke and low-pressure meeting",
    "hours": "Monday–Thursday 18:00–23:00; Friday–Saturday 18:00–02:00; Sunday closed.",
    "link": "https://www.apart.bar/",
    "location": "Reichsstraße 16, 04109 Leipzig, Germany",
    "lat": 51.341797,
    "lng": 12.3770508,
    "seo_quality_status": "approved"
  },
  {
    "name": "Pixi Kollektivbar",
    "city": "leipzig",
    "type": "bar",
    "description": "Leipzig's queer neighbourhood living room: collectively run, feminist in practice and more interested in belonging than bottle-service theatre. Karaoke, drag, bingo, games and community fundraisers rotate through the calendar; the small courtyard and affordable drinks make ordinary evenings feel just as useful. The room can get loud, and smoking rules vary by day, so Wednesday is the gentler choice for smoke-sensitive visitors.",
    "vibe": "collective queer Kiez bar with a scruffy, affectionate west-Leipzig pulse",
    "hours": "Wednesday–Thursday 18:00–00:00; Friday–Saturday 18:00–02:00; Monday, Tuesday and Sunday closed. Check Instagram for event and smoke-free updates.",
    "link": "https://www.instagram.com/pixi_kollektivbar/",
    "location": "Georg-Schwarz-Straße 3, 04177 Leipzig, Germany",
    "lat": 51.3381713,
    "lng": 12.3271271,
    "seo_quality_status": "approved"
  },
  {
    "name": "Café Ocka",
    "city": "leipzig",
    "type": "cafe",
    "description": "A self-organised FLINTA* collective café where vegan-friendly food, cake and coffee share space with flea markets, community kitchens, concerts and workshops. It is a daytime doorway into Altlindenau's queer-feminist network, especially for travellers who want connection without building the day around alcohol.",
    "vibe": "FLINTA-led neighbourhood café with soft daytime energy and collective politics",
    "hours": "Tuesday–Sunday 12:00–18:00 according to the current official notice; special events may run later.",
    "link": "https://www.cafeocka.de/",
    "location": "Merseburger Straße 88, 04177 Leipzig, Germany",
    "lat": 51.3371777,
    "lng": 12.3281453,
    "seo_quality_status": "approved"
  },
  {
    "name": "Secondhand & Café Gold",
    "city": "leipzig",
    "type": "cafe",
    "description": "Part vegan bistro, part second-hand shop and openly queer-friendly social stop in Südvorstadt. Pelmeni, vareniki, tea and vintage rails make it more idiosyncratic than a standard coffee break, while workshops and small events give the room a local, creative rhythm.",
    "vibe": "queer-friendly vintage café with vegan comfort food and south-side character",
    "hours": "Monday 11:30–19:30; Tuesday–Thursday 11:30–20:00; Friday–Saturday 11:00–20:00; Sunday 12:00–18:00. Recheck before travelling.",
    "link": "https://prinz.de/leipzig/locations/cafe-gold/",
    "location": "Kantstraße 65, 04275 Leipzig, Germany",
    "lat": 51.3157981,
    "lng": 12.382153,
    "seo_quality_status": "approved"
  },
  {
    "name": "Cocks Bar Leipzig",
    "city": "leipzig",
    "type": "cruise_club",
    "description": "A men-only cruise bar built for explicit encounters rather than conventional nightlife. Dark areas, themed mask, underwear and lights-out sessions shape the week; the door is 18+, smoking is permitted and the mood changes with the format, so read the event description before arriving instead of treating every night as interchangeable.",
    "vibe": "direct men-only cruising with themed dress-down and dark-room nights",
    "hours": "Thursday 19:00–01:00; Friday–Saturday 22:00–05:00; closed Sunday–Wednesday. Event schedules can override regular hours.",
    "link": "https://cocks-bar.com/",
    "location": "Otto-Schill-Straße 10, 04109 Leipzig, Germany",
    "lat": 51.3382459,
    "lng": 12.3692264,
    "seo_quality_status": "approved"
  },
  {
    "name": "Stargayte Sauna",
    "city": "leipzig",
    "type": "sauna",
    "description": "A large gay bathhouse with a real stay-all-afternoon scale: steam and Finnish saunas, whirlpool, cabins, play rooms, slings and labyrinth areas sit under one roof, with direct access to Cocks on relevant nights. Monday is the value day, Tuesday and Friday are open to all genders, Saturday runs very late and Sunday skews younger without excluding older guests.",
    "vibe": "expansive gay bathhouse balancing sauna ritual, social time and play",
    "hours": "Monday 13:00–22:00; Tuesday 13:00–00:00; Wednesday–Thursday closed; Friday 15:00–03:00; Saturday 13:00–06:00; Sunday 13:00–23:00.",
    "link": "https://www.stargayte.de/",
    "location": "Otto-Schill-Straße 10, 04109 Leipzig, Germany",
    "lat": 51.3382459,
    "lng": 12.3692264,
    "seo_quality_status": "approved"
  },
  {
    "name": "Twenty One Leipzig",
    "city": "leipzig",
    "type": "club",
    "description": "A large mainstream electronic club that becomes part of the queer map when KissKissBangBang takes over. On those programmed nights the crowd opens across the rainbow and the policy explicitly leaves homophobia, sexism, racism and ageism outside; on ordinary dates it is not a gay club. The door is 18+, sportswear and football shirts are poor choices, and early arrival helps when the city is busy.",
    "vibe": "big-room electronic club transformed by recurring all-rainbow party nights",
    "hours": "Event-led. KissKissBangBang is normally scheduled on the second Friday of the month; verify the live calendar and ticket link before going.",
    "link": "https://www.kisskiss-bangbang.de/",
    "location": "Gottschedstraße 2, 04109 Leipzig, Germany",
    "lat": 51.340184,
    "lng": 12.3707625,
    "seo_quality_status": "approved"
  },
  {
    "name": "WUEST at Pittlerwerke",
    "city": "leipzig",
    "type": "club",
    "description": "A raw industrial event hall in Leipzig-Wahren rather than a permanent queer club. It earns a place on the map through major community productions such as the 2026 Leipzig Bear Party: warehouse scale, uneven outdoor terrain and a destination journey that should be planned before the final tram. Visit for the named event, not on speculation.",
    "vibe": "industrial destination room for large queer community productions",
    "hours": "Event-only; opening, access and ticket rules are set by each organiser.",
    "link": "https://www.leipzig-baeren.de/party/",
    "location": "Pittlerwerke, Polyphonstraße 8, 04159 Leipzig, Germany",
    "lat": 51.3783533,
    "lng": 12.316949,
    "seo_quality_status": "approved"
  },
  {
    "name": "Motel One Leipzig-Nikolaikirche",
    "city": "leipzig",
    "type": "hotel",
    "description": "A practical design-led base beside Nikolaikirche, close enough to walk to Havanna, APART, QueerBLICK and the main station. Current guest feedback consistently praises the staff, cleanliness and location while noting compact rooms and a busy breakfast area; choose it for an efficient centre route, not resort-style facilities.",
    "vibe": "compact central design hotel with the queer centre route on foot",
    "hours": "Hotel operates daily with staffed reception; confirm current check-in and check-out times on the booking page.",
    "link": "https://www.motel-one.com/en/hotels/leipzig/hotel-leipzig-nikolaikirche/",
    "location": "Nikolaistraße 23, 04109 Leipzig, Germany",
    "lat": 51.3408515,
    "lng": 12.3778555,
    "seo_quality_status": "approved"
  }
]
$places$) as p(
  name text, city text, type text, description text, vibe text, hours text,
  link text, location text, lat double precision, lng double precision,
  seo_quality_status text
)
), updated_places as (
update public.places p
set
  type = s.type,
  description = s.description,
  vibe = s.vibe,
  hours = s.hours,
  link = s.link,
  location = s.location,
  lat = s.lat,
  lng = s.lng,
  seo_indexable = true,
  seo_quality_status = s.seo_quality_status,
  updated_at = timezone('utc', now())
from qa_leipzig_places s
where lower(trim(p.city)) = lower(trim(s.city))
  and lower(trim(p.name)) = lower(trim(s.name))
returning p.id
)
insert into public.places (
  name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng,
  seo_indexable, seo_quality_status, updated_at
)
select
  s.name, s.city, s.type, s.description, s.vibe, array[]::text[], s.hours,
  s.link, s.location, s.lat, s.lng, true, s.seo_quality_status, timezone('utc', now())
from qa_leipzig_places s
where not exists (
  select 1 from public.places p
  where lower(trim(p.city)) = lower(trim(s.city))
    and lower(trim(p.name)) = lower(trim(s.name))
);

with qa_leipzig_events as (
select * from jsonb_to_recordset($events$
[
  {
    "name": "Bears & Friends at Pixi — August 2026",
    "city": "leipzig",
    "description": "A low-pressure monthly bar evening where Leipzig's bear community meets in Pixi's queer neighbourhood setting. Bears, cubs, chasers and friends are welcome; this edition starts Thursday 13 August 2026 at 19:00 and is better for conversation and new connections than a hard club launch.",
    "link": "https://www.leipzig-baeren.de/",
    "date": "2026-08-13",
    "start_date": "2026-08-13",
    "end_date": "2026-08-13",
    "location": "Pixi Kollektivbar, Georg-Schwarz-Straße 3, 04177 Leipzig, Germany",
    "lat": 51.3381713,
    "lng": 12.3271271,
    "vibe": "friendly bear-community bar night inside Leipzig's queer west"
  },
  {
    "name": "Aidshilfe Leipzig Counselling & Rapid Testing — August 2026",
    "city": "leipzig",
    "description": "A practical HIV/STI counselling and rapid-test session on Thursday 13 August 2026 from 15:00. Telephone registration is required through the Aidshilfe office; appointments are not issued by email, and English is spoken.",
    "link": "https://www.leipzig.aidshilfe.de/veranstaltungen",
    "date": "2026-08-13",
    "start_date": "2026-08-13",
    "end_date": "2026-08-13",
    "location": "Aidshilfe Leipzig, Ossietzkystraße 18, 04347 Leipzig, Germany",
    "lat": 51.3594907,
    "lng": 12.4159174,
    "vibe": "confidential community health support with appointment-based rapid testing"
  },
  {
    "name": "Bärensauna at Stargayte — August 2026",
    "city": "leipzig",
    "description": "Leipzig Bären's dedicated sauna day starts Saturday 22 August 2026 at 13:00 inside the full Stargayte complex. It is built for bears, cubs, chasers and friends, with advance registration linked by the organiser and a reduced full-price entry for registered guests arriving within the stated window.",
    "link": "https://www.leipzig-baeren.de/sauna/",
    "date": "2026-08-22",
    "start_date": "2026-08-22",
    "end_date": "2026-08-22",
    "location": "Stargayte Sauna, Otto-Schill-Straße 10, 04109 Leipzig, Germany",
    "lat": 51.3382459,
    "lng": 12.3692264,
    "vibe": "social bear sauna afternoon with the full bathhouse and play areas open"
  },
  {
    "name": "QueerBLICK: Strange River",
    "city": "leipzig",
    "description": "QueerBLICK's August screening follows a sixteen-year-old cycling the Danube with his family while a mysterious boy keeps reappearing along the route. The poetic queer coming-of-age film screens in its original version with subtitles on Wednesday 26 August 2026 at 20:30; the ticket includes a drink from 20:00.",
    "link": "https://www.passage-kinos.de/strange-river",
    "date": "2026-08-26",
    "start_date": "2026-08-26",
    "end_date": "2026-08-26",
    "location": "Passage Kinos, Hainstraße 19a, 04109 Leipzig, Germany",
    "lat": 51.3421442,
    "lng": 12.3727308,
    "vibe": "poetic queer cinema with a pre-film drink and an easy social opening"
  },
  {
    "name": "QueerBLICK: Something You Said Last Night",
    "city": "leipzig",
    "description": "The September QueerBLICK centres Ren, a trans woman caught between unemployment, family friction and an unexpectedly tender holiday. It screens in the original version with subtitles on Wednesday 30 September 2026 at 20:30, with a drink included from 20:00.",
    "link": "https://www.passage-kinos.de/queerblick",
    "date": "2026-09-30",
    "start_date": "2026-09-30",
    "end_date": "2026-09-30",
    "location": "Passage Kinos, Hainstraße 19a, 04109 Leipzig, Germany",
    "lat": 51.3421442,
    "lng": 12.3727308,
    "vibe": "warm trans-centred arthouse cinema and a monthly queer meeting point"
  },
  {
    "name": "Ballroom Showcase & Queer Performance Night",
    "city": "leipzig",
    "description": "TrueColours brings Leipzig's ballroom culture onto the Schauspiel stage through runway categories, voguing and performance built around queer self-definition. The premiere is Friday 2 October 2026 at the Residenz in the Spinnerei; confirm the exact curtain time and access details when booking.",
    "link": "https://www.leipzig.travel/event/premiere-ballroom-showcase-queer-performance-night",
    "date": "2026-10-02",
    "start_date": "2026-10-02",
    "end_date": "2026-10-02",
    "location": "Residenz in der Baumwollspinnerei, Spinnereistraße 7, Halle 18, 04179 Leipzig, Germany",
    "lat": 51.3262188,
    "lng": 12.3179526,
    "vibe": "voguing, runway and queer performance inside a west-Leipzig industrial stage"
  },
  {
    "name": "Leipzig Bear Weekend 2026",
    "city": "leipzig",
    "description": "Three community-heavy days for bears, cubs, chasers, leather men and friends, running 9–11 October 2026. The route moves from APART and Cocks to tram tours, Stargayte, coffee, the Saturday WUEST party and Sunday brunch; the flagship party begins Saturday at 20:00. Some programme parts require separate tickets or registration.",
    "link": "https://www.leipzig-baeren.de/party/",
    "date": "2026-10-09",
    "start_date": "2026-10-09",
    "end_date": "2026-10-11",
    "location": "Multiple Leipzig venues; main party at WUEST, Pittlerwerke, Polyphonstraße 8, 04159 Leipzig, Germany",
    "lat": 51.3783533,
    "lng": 12.316949,
    "vibe": "welcoming bear-community city weekend with bars, culture, sauna and warehouse dancing"
  },
  {
    "name": "33rd LeLe*Tre — Leipzig Queer Lesbian Meeting",
    "city": "leipzig",
    "description": "Four days of queer-lesbian perspectives, conversation, culture and community from Thursday 15 to Sunday 18 October 2026. The long-running gathering is thoughtful without becoming solemn, creating room for debate, laughter and different lived experiences; the detailed programme is published closer to the date.",
    "link": "https://www.frauenkultur-leipzig.de/angebote/aktuelle-projekte/leletre-leipziger-lesbentreffen/",
    "date": "2026-10-15",
    "start_date": "2026-10-15",
    "end_date": "2026-10-18",
    "location": "Frauenkultur and partner venues around Connewitzer Kreuz, Windscheidstraße 51, 04277 Leipzig, Germany",
    "lat": 51.310058,
    "lng": 12.370628,
    "vibe": "queer-lesbian gathering blending politics, culture, pleasure and intergenerational community"
  },
  {
    "name": "Bärensauna at Stargayte — December 2026",
    "city": "leipzig",
    "description": "The final Leipzig Bären sauna date of 2026 begins Saturday 19 December at 13:00. It is an easy winter social for bears, cubs, chasers and friends inside Stargayte's sauna, steam, whirlpool and play spaces; register through the organiser for the stated community rate.",
    "link": "https://www.leipzig-baeren.de/sauna/",
    "date": "2026-12-19",
    "start_date": "2026-12-19",
    "end_date": "2026-12-19",
    "location": "Stargayte Sauna, Otto-Schill-Straße 10, 04109 Leipzig, Germany",
    "lat": 51.3382459,
    "lng": 12.3692264,
    "vibe": "warm end-of-year bear sauna gathering with community pricing"
  }
]
$events$) as e(
  name text, city text, description text, link text, date date,
  start_date date, end_date date, location text, lat double precision,
  lng double precision, vibe text
)
), updated_events as (
update public.events e
set
  description = s.description,
  link = s.link,
  date = s.date,
  start_date = s.start_date,
  end_date = s.end_date,
  location = s.location,
  lat = s.lat,
  lng = s.lng,
  vibe = s.vibe,
  seo_indexable = true,
  seo_quality_status = 'approved',
  updated_at = timezone('utc', now())
from qa_leipzig_events s
where lower(trim(e.city)) = lower(trim(s.city))
  and lower(trim(e.name)) = lower(trim(s.name))
returning e.id
)
insert into public.events (
  name, city, description, link, date, start_date, end_date, location, lat, lng,
  vibe, vibe_tags, seo_indexable, seo_quality_status, updated_at
)
select
  s.name, s.city, s.description, s.link, s.date, s.start_date, s.end_date,
  s.location, s.lat, s.lng, s.vibe, array[]::text[], true, 'approved', timezone('utc', now())
from qa_leipzig_events s
where not exists (
  select 1 from public.events e
  where lower(trim(e.city)) = lower(trim(s.city))
    and lower(trim(e.name)) = lower(trim(s.name))
);

with qa_leipzig_services as (
select * from jsonb_to_recordset($services$
[
  {
    "name": "RosaLinde Leipzig",
    "city": "leipzig",
    "type": "other",
    "provider_name": "RosaLinde Leipzig e.V.",
    "contact": "Use the official contact page for counselling, groups and accessibility questions.",
    "booking_link": "https://www.rosalinde-leipzig.de/beratung/beratung-in-leipzig/",
    "description": "A central piece of Leipzig's queer infrastructure, offering free and anonymous counselling in German and English alongside social groups, education and community connection. The first-floor rooms and WC are accessible by lift; Tuesday's short open consultations are useful for a first approach, while longer visits are arranged directly.",
    "hours": "Counselling Monday–Thursday 12:00–18:00 by appointment. Tuesday open consultation 15:00–17:00, booked through the official appointment link from 24 hours before.",
    "link": "https://www.rosalinde-leipzig.de/",
    "location": "Demmeringstraße 32, 04177 Leipzig, Germany",
    "lat": 51.3378827,
    "lng": 12.3320836,
    "price_tier": "$",
    "vibe": "warm, anonymous queer counselling with real routes into local community",
    "source": "RosaLinde Leipzig official counselling and community pages; checked 2026-08-10"
  },
  {
    "name": "Aidshilfe Leipzig",
    "city": "leipzig",
    "type": "wellness",
    "provider_name": "Aidshilfe Leipzig e.V.",
    "contact": "+49 341 23 23 126 · English spoken · testing appointments by phone only",
    "booking_link": "https://www.leipzig.aidshilfe.de/",
    "description": "Straight-talking support around HIV, other STIs, PrEP, PEP, sexual health and living with HIV. Counselling and rapid tests are handled without moralising; phone booking keeps the visit clear, and the team explicitly offers English-language help.",
    "hours": "Phone office Monday–Tuesday 09:00–12:30; Wednesday 13:30–16:30; Thursday 13:30–18:30. Testing by telephone appointment; no email appointments.",
    "link": "https://www.leipzig.aidshilfe.de/",
    "location": "Ossietzkystraße 18, 04347 Leipzig, Germany",
    "lat": 51.3594907,
    "lng": 12.4159174,
    "price_tier": "$",
    "vibe": "confidential sexual-health advice with low-threshold testing and English support",
    "source": "Aidshilfe Leipzig official home, counselling and event pages; checked 2026-08-10"
  },
  {
    "name": "RAAinbow",
    "city": "leipzig",
    "type": "other",
    "provider_name": "RAA Leipzig e.V.",
    "contact": "queer@raa-leipzig.de · +49 176 21280504",
    "booking_link": "https://raa-leipzig.de/fachbereiche/raainbow/",
    "description": "Specialist counselling and accompaniment for LGBTQIA+ refugees and asylum seekers living in Leipzig. The service understands that queer safety, residence questions and daily bureaucracy overlap; meetings are arranged directly so support can be adapted rather than forced into a generic drop-in format.",
    "hours": "Appointments by arrangement.",
    "link": "https://raa-leipzig.de/fachbereiche/raainbow/",
    "location": "Kochstraße 10, 04275 Leipzig, Germany",
    "lat": 51.3235625,
    "lng": 12.3725046,
    "price_tier": "$",
    "vibe": "migration-aware queer counselling with practical accompaniment",
    "source": "RAA Leipzig official RAAinbow service and contact pages; checked 2026-08-10"
  },
  {
    "name": "Frauenkultur Leipzig",
    "city": "leipzig",
    "type": "other",
    "provider_name": "Frauenkultur Leipzig e.V.",
    "contact": "+49 341 213 00 30",
    "booking_link": "https://www.frauenkultur-leipzig.de/",
    "description": "A Connewitz cultural home for feminist and FLINTA* perspectives, hosting exhibitions, talks, music, regular meetings and queer programmes including the long-running LeLe*Tre. It is a useful non-nightlife anchor: political but convivial, with room for culture, organising and ordinary social contact.",
    "hours": "Programme-led; consult the current calendar before visiting.",
    "link": "https://www.frauenkultur-leipzig.de/",
    "location": "Windscheidstraße 51, 04277 Leipzig, Germany",
    "lat": 51.310058,
    "lng": 12.370628,
    "price_tier": "$",
    "vibe": "feminist culture house connecting FLINTA life, art and queer-lesbian community",
    "source": "Frauenkultur Leipzig official programme and LeLe*Tre pages; checked 2026-08-10"
  },
  {
    "name": "CSD Leipzig",
    "city": "leipzig",
    "type": "other",
    "provider_name": "CSD Leipzig e.V.",
    "contact": "orga@csd-leipzig.de · mitmachen@csd-leipzig.de",
    "booking_link": "https://csd-leipzig.de/mitmachen/",
    "description": "The organisation behind Leipzig's Pride week, demonstration and street festival, with open organising structures and year-round political work. The 2026 programme ran 10–18 July; between editions the site remains the reliable route to working groups, accessibility contacts, volunteer roles and the next confirmed dates.",
    "hours": "Year-round volunteer organisation; meetings and festival programme follow the current calendar.",
    "link": "https://csd-leipzig.de/",
    "location": "Leipzig, Germany — Pride venues and organising meetings vary",
    "lat": 51.3397,
    "lng": 12.3731,
    "price_tier": "$",
    "vibe": "large, political east-German Pride with open community organising",
    "source": "CSD Leipzig official 2026 programme, association and participation pages; checked 2026-08-10"
  },
  {
    "name": "Leipzig Bären",
    "city": "leipzig",
    "type": "other",
    "provider_name": "Leipzig Bären",
    "contact": "info@leipzig-baeren.de",
    "booking_link": "https://www.leipzig-baeren.de/",
    "description": "An active social network for bears, cubs, chasers, leather men and friends, with monthly bar evenings, coffee, regular meet-ups, sauna dates and a substantial October city weekend. The calendar is unusually practical and makes it easy for a newcomer to choose between conversation, culture, sauna or a full party.",
    "hours": "Event-led. Consult the dated official calendar and register where indicated.",
    "link": "https://www.leipzig-baeren.de/",
    "location": "Leipzig, Germany — regular meetings rotate between Pixi, Stargayte and partner venues",
    "lat": 51.3397,
    "lng": 12.3731,
    "price_tier": "$",
    "vibe": "welcoming bear community with more social texture than a single party brand",
    "source": "Leipzig Bären official 2026 calendar, sauna and Bear Weekend pages; checked 2026-08-10"
  }
]
$services$) as s(
  name text, city text, type text, provider_name text, contact text,
  booking_link text, description text, hours text, link text, location text,
  lat double precision, lng double precision, price_tier text, vibe text, source text
)
), updated_services as (
update public.services s
set
  type = q.type,
  provider_name = q.provider_name,
  contact = q.contact,
  booking_link = q.booking_link,
  description = q.description,
  hours = q.hours,
  link = q.link,
  location = q.location,
  lat = q.lat,
  lng = q.lng,
  price_tier = q.price_tier,
  vibe = q.vibe,
  source = q.source,
  "lastChecked" = '2026-08-10'::date,
  verified = true,
  seo_indexable = true,
  seo_quality_status = 'approved',
  updated_at = timezone('utc', now())
from qa_leipzig_services q
where lower(trim(s.city)) = lower(trim(q.city))
  and lower(trim(s.name)) = lower(trim(q.name))
returning s.id
)
insert into public.services (
  name, city, type, provider_name, contact, booking_link, description, hours,
  link, image_urls, location, lat, lng, price_tier, vibe, vibe_tags, source,
  "lastChecked", verified, seo_indexable, seo_quality_status, updated_at
)
select
  q.name, q.city, q.type, q.provider_name, q.contact, q.booking_link,
  q.description, q.hours, q.link, array[]::text[], q.location, q.lat, q.lng,
  q.price_tier, q.vibe, array[]::text[], q.source, '2026-08-10'::date,
  true, true, 'approved', timezone('utc', now())
from qa_leipzig_services q
where not exists (
  select 1 from public.services s
  where lower(trim(s.city)) = lower(trim(q.city))
    and lower(trim(s.name)) = lower(trim(q.name))
);

commit;

select 'places' as category, count(*) as total
from public.places where lower(trim(city)) = 'leipzig'
union all
select 'events', count(*)
from public.events where lower(trim(city)) = 'leipzig'
union all
select 'services', count(*)
from public.services where lower(trim(city)) = 'leipzig'
order by category;
