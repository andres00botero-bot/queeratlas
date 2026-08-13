-- Queer Atlas: Palermo city package
-- Editorially checked 2026-08-13.
-- Idempotent: matching city/name rows are updated, not duplicated.
-- All place, event and service records have non-null coordinates and approved taxonomy values.

begin;

with qa_palermo_places as (
select * from jsonb_to_recordset($places$
[
  {
    "name": "Exit Drinks",
    "city": "palermo",
    "type": "bar",
    "description": "Palermo's enduring LGBTQ+ meeting point, open since 1996 and still more neighbourhood bar than rainbow spectacle. Tables spill into Piazza San Francesco di Paola, cocktails arrive with conversation, and weekend energy often continues at the Exit10&Love party. It is the clearest first stop for reading the city and asking what is genuinely happening that night.",
    "vibe": "historic community bar with pavement tables and a late local pulse",
    "hours": "Usually Wednesday–Sunday from around 22:00; weekend and holiday hours change. Confirm the current opening post before travelling.",
    "link": "https://www.instagram.com/exit_drinks/",
    "location": "Piazza San Francesco di Paola 40, 90138 Palermo, Italy",
    "lat": 38.1215580,
    "lng": 13.3528637
  },
  {
    "name": "Bunker Men's Club",
    "city": "palermo",
    "type": "cruise_club",
    "description": "A compact men-only cruise club inside Vucciria's Via Argenteria Gay Street. The 200-square-metre layout combines video bar, dance music, labyrinth and adult play areas, while each night changes the rules: naturist, underwear, blackout or macho themes are not interchangeable. Read the current flyer, membership and consent policy before joining the queue.",
    "vibe": "discreet men-only cruise nights with a different code for each theme",
    "hours": "July–September 2026: Friday–Saturday only, except announced specials; closed after 15 August and reopening 4 September. The official weekly post takes precedence.",
    "link": "https://bunkerpalermo.altervista.org/",
    "location": "Via Argenteria 3, 90133 Palermo, Italy",
    "lat": 38.1176379,
    "lng": 13.3642878
  },
  {
    "name": "Maxximum Time",
    "city": "palermo",
    "type": "sauna",
    "description": "A central men-only gay sauna beside Via Maqueda, built around Finnish sauna, steam room, salt-water hydro pool, cinema, lounge bar and adult relaxation areas. It works better as an unhurried afternoon or early-evening stop than a substitute for a nightclub; crowd level changes sharply by day, so give the facilities enough time to be worth the admission.",
    "vibe": "central men-only sauna for slow afternoons, steam and social downtime",
    "hours": "Generally Tuesday–Sunday 14:00–22:00; Monday closed. Confirm same-day closing and massage availability directly.",
    "link": "https://www.maxximumtime.com/home1",
    "location": "Via Alessandro Scarlatti 1/3, 90134 Palermo, Italy",
    "lat": 38.1191529,
    "lng": 13.3574112
  },
  {
    "name": "Fabric — Exit10&Love",
    "city": "palermo",
    "type": "club",
    "description": "A large mixed club that becomes one of Palermo's main queer dance floors when Exit10&Love takes over on an announced Saturday. Drag, pop, commercial dance music and go-go performance carry the night well beyond bar hours. Fabric itself is not a permanent gay club: only travel here when the branded queer edition is confirmed.",
    "vibe": "big Saturday queer takeover with drag, pop and an until-dawn finish",
    "hours": "Event-only for queer visitors, usually selected Saturdays from late evening until dawn. Check Exit Drinks or Exit10&Love before making the out-of-centre journey.",
    "link": "https://www.instagram.com/exit_drinks/",
    "location": "Fabric, Via Ugo La Malfa 91, 90146 Palermo, Italy",
    "lat": 38.1678445,
    "lng": 13.3036578
  },
  {
    "name": "Prospero Enoteca Letteraria",
    "city": "palermo",
    "type": "restaurant",
    "description": "A book-lined natural-wine room that describes itself plainly as queer and open to everyone. Come for an aperitivo that can become dinner, browse the shelves and settle into a calmer social pace than the late gay bars. Weekend breakfast hours add a rare daytime option, though the address sits north of the historic centre and deserves its own route.",
    "vibe": "queer literary enoteca pairing books, natural wine and low-pressure conversation",
    "hours": "Daily 17:00–00:00; Saturday–Sunday also 09:00–13:00. Check the cultural programme for readings and special service.",
    "link": "https://www.prosperopalermo.com/",
    "location": "Via Marche 8, 90144 Palermo, Italy",
    "lat": 38.1438577,
    "lng": 13.3336807
  },
  {
    "name": "EPYC — European Palermo Youth Centre",
    "city": "palermo",
    "type": "cafe",
    "description": "A busy ARCI cultural centre where food, study, organising and nightlife share the same building. LGBTQIA+ talks, mutual-aid activity, games and occasional queer parties sit inside a wider youth and social-justice programme. It is a community hub rather than a dedicated gay café, so check the calendar when queer-specific programming matters.",
    "vibe": "youth-led cultural house where queer organising meets everyday city life",
    "hours": "Monday–Thursday 09:00–00:00; Friday 09:00–01:00; Saturday 11:00–01:00; Sunday 17:00–00:00 according to the city community map.",
    "link": "https://linktr.ee/epyc_palermo",
    "location": "Via Pignatelli Aragona 42, 90141 Palermo, Italy",
    "lat": 38.1210818,
    "lng": 13.3553392
  },
  {
    "name": "Cinema De Seta — Cantieri Culturali alla Zisa",
    "city": "palermo",
    "type": "club",
    "description": "The municipal cinema and cultural complex that becomes Palermo's international queer screen during Sicilia Queer. More than eighty films, conversations, emerging Italian work and late events occupied the Cantieri in 2026. Outside the festival it is a mixed cultural venue, so follow the film programme rather than expecting a permanent LGBTQ+ social room.",
    "vibe": "industrial arts campus transformed by ambitious queer cinema and debate",
    "hours": "Programme-led. Cantieri exhibition access is generally Monday–Saturday 09:00–18:30; cinema and festival sessions follow ticketed times.",
    "link": "https://www.siciliaqueerfilmfest.it/",
    "location": "Cantieri Culturali alla Zisa, Via Paolo Gili 4, 90138 Palermo, Italy",
    "lat": 38.1181012,
    "lng": 13.3385163
  },
  {
    "name": "Palazzo Cutelli LGBTQ House",
    "city": "palermo",
    "type": "hotel",
    "description": "A five-room LGBTQ-focused Bed&Book between Politeama and the Capo, hosted on a deliberately personal scale. Guests consistently highlight immaculate rooms, substantial breakfast and unusually warm help from the hosts; the trade-off is a short walk to the deepest historic-centre sights and occasional street noise. It is a community-minded base, not a scene hotel with a party lobby.",
    "vibe": "intimate LGBTQ home base with generous hosts, books and proper breakfast",
    "hours": "Accommodation by reservation; published check-in 12:00–00:00 and check-out by 10:00. Confirm arrival time and optional breakfast directly.",
    "link": "https://www.palazzocutelli.com/en/",
    "location": "Via Mario Cutelli 29, 90138 Palermo, Italy",
    "lat": 38.1204780,
    "lng": 13.3497679
  },
  {
    "name": "Barcarello Rocks",
    "city": "palermo",
    "type": "cruising_area",
    "description": "A rocky coastal stretch beyond Sferracavallo with a long gay and naturist association, reached by a rough footpath rather than a serviced beach entrance. Daylight swimming, sea views and social sunbathing are the better reasons to go; footwear, water and a planned return matter. Respect the reserve, consent and local public-decency rules, and never assume everyone on the coast is cruising.",
    "vibe": "wild rocky coast with a discreet gay-naturist tradition and no urban polish",
    "hours": "Daylight only is the sensible visitor window. There are no venue hours, staff or guaranteed facilities; avoid the trail in poor weather or after dark.",
    "link": "https://www.gays-cruising.com/it/cruising/barcarello_palermo_italia_111958",
    "location": "Punta di Barcarello, 90147 Palermo, Italy",
    "lat": 38.2112446,
    "lng": 13.2812358
  }
]
$places$) as p(
  name text, city text, type text, description text, vibe text, hours text,
  link text, location text, lat double precision, lng double precision
)
), updated_places as (
update public.places p
set type = s.type, description = s.description, vibe = s.vibe, hours = s.hours,
    link = s.link, location = s.location, lat = s.lat, lng = s.lng,
    seo_indexable = true, seo_quality_status = 'approved',
    updated_at = timezone('utc', now())
from qa_palermo_places s
where lower(trim(p.city)) = lower(trim(s.city))
  and lower(trim(p.name)) = lower(trim(s.name))
returning p.id
)
insert into public.places (
  name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng,
  seo_indexable, seo_quality_status, updated_at
)
select s.name, s.city, s.type, s.description, s.vibe, array[]::text[], s.hours,
       s.link, s.location, s.lat, s.lng, true, 'approved', timezone('utc', now())
from qa_palermo_places s
where not exists (
  select 1 from public.places p
  where lower(trim(p.city)) = lower(trim(s.city))
    and lower(trim(p.name)) = lower(trim(s.name))
);

with qa_palermo_events as (
select * from jsonb_to_recordset($events$
[
  {
    "name": "Bunker Ferragosto Surprise Party — 14 August 2026",
    "city": "palermo",
    "description": "The third night of Bunker's confirmed 12–15 August Ferragosto run, with a surprise party and underwear, jockstrap, naked or normal dress suggested rather than imposed. A 01:00 draw and discounted club store are part of the published programme; membership and adult consent rules still apply.",
    "link": "https://bunkerpalermo.altervista.org/",
    "date": "2026-08-14",
    "start_date": "2026-08-14",
    "end_date": "2026-08-15",
    "location": "Bunker Men's Club, Via Argenteria 3, 90133 Palermo, Italy",
    "lat": 38.1176379,
    "lng": 13.3642878,
    "vibe": "playful men-only Ferragosto special with flexible dress and late-night surprises"
  },
  {
    "name": "Bunker Ferragosto Closing Party — 15 August 2026",
    "city": "palermo",
    "description": "Bunker's confirmed Ferragosto closing party ends the club's summer run on Saturday 15 August before a holiday closure through 3 September. The published special allows underwear, jockstrap, naked or normal dress and adds a 01:00 draw; new Freedom Circuit membership begins when the club reopens.",
    "link": "https://bunkerpalermo.altervista.org/ferragosto-al-bunker-12-13-14-15-agosto/",
    "date": "2026-08-15",
    "start_date": "2026-08-15",
    "end_date": "2026-08-16",
    "location": "Bunker Men's Club, Via Argenteria 3, 90133 Palermo, Italy",
    "lat": 38.1176379,
    "lng": 13.3642878,
    "vibe": "men-only holiday closing party before the club's late-summer pause"
  },
  {
    "name": "Bunker Reopen Party — 4 September 2026",
    "city": "palermo",
    "description": "Bunker returns on Friday 4 September after its post-Ferragosto closure. This is also the first weekend under the club's new international Freedom Circuit membership, so returning and first-time guests should check registration requirements before the door rather than relying on an older card.",
    "link": "https://bunkerpalermo.altervista.org/closed-party-reopen-party-2/",
    "date": "2026-09-04",
    "start_date": "2026-09-04",
    "end_date": "2026-09-05",
    "location": "Bunker Men's Club, Via Argenteria 3, 90133 Palermo, Italy",
    "lat": 38.1176379,
    "lng": 13.3642878,
    "vibe": "men-only reopening night with a new membership year and fresh local momentum"
  },
  {
    "name": "Palermo Pride 2026",
    "city": "palermo",
    "description": "Palermo's city Pride gathered at Via Roma and Vittorio Emanuele at 16:00 on 20 June, moved at 17:00 through Teatro Massimo and past Exit, then reached the Cantieri Culturali alla Zisa. A free live and DJ programme continued from 20:00 to 01:00 before the final Exit10&Love party at Fabric.",
    "link": "https://turismo.comune.palermo.it/palermo-welcome-new-dettaglio.php?id=43266",
    "date": "2026-06-20",
    "start_date": "2026-06-20",
    "end_date": "2026-06-21",
    "location": "Start: Via Roma at Via Vittorio Emanuele; finale: Cantieri Culturali alla Zisa, Palermo",
    "lat": 38.115708,
    "lng": 13.361267,
    "vibe": "political city march opening into a free cultural and dance celebration"
  },
  {
    "name": "Sicilia Queer Filmfest 2026",
    "city": "palermo",
    "description": "The sixteenth Sicilia Queer filled the Cantieri Culturali alla Zisa from 25–31 May 2026 with more than eighty films, international new visions, retrospectives, conversations and a free closing party. Under Queer preceded the main festival on 23–24 May, giving emerging Italian filmmakers a dedicated platform.",
    "link": "https://www.siciliaqueerfilmfest.it/edizioni/sicilia-queer-2026",
    "date": "2026-05-25",
    "start_date": "2026-05-25",
    "end_date": "2026-05-31",
    "location": "Cantieri Culturali alla Zisa, Via Paolo Gili 4, 90138 Palermo, Italy",
    "lat": 38.1181012,
    "lng": 13.3385163,
    "vibe": "serious international queer cinema with Palermo warmth and late cultural spillover"
  }
]
$events$) as e(
  name text, city text, description text, link text, date date,
  start_date date, end_date date, location text, lat double precision,
  lng double precision, vibe text
)
), updated_events as (
update public.events e
set description = s.description, link = s.link, date = s.date,
    start_date = s.start_date, end_date = s.end_date, location = s.location,
    lat = s.lat, lng = s.lng, vibe = s.vibe, seo_indexable = true,
    seo_quality_status = 'approved', updated_at = timezone('utc', now())
from qa_palermo_events s
where lower(trim(e.city)) = lower(trim(s.city))
  and lower(trim(e.name)) = lower(trim(s.name))
returning e.id
)
insert into public.events (
  name, city, description, link, date, start_date, end_date, location, lat, lng,
  vibe, vibe_tags, seo_indexable, seo_quality_status, updated_at
)
select s.name, s.city, s.description, s.link, s.date, s.start_date, s.end_date,
       s.location, s.lat, s.lng, s.vibe, array[]::text[], true, 'approved', timezone('utc', now())
from qa_palermo_events s
where not exists (
  select 1 from public.events e
  where lower(trim(e.city)) = lower(trim(s.city))
    and lower(trim(e.name)) = lower(trim(s.name))
);

with qa_palermo_services as (
select * from jsonb_to_recordset($services$
[
  {
    "name": "Arcigay Palermo — Protego",
    "city": "palermo",
    "type": "other",
    "provider_name": "Arcigay Palermo",
    "contact": "+39 375 519 0167 via WhatsApp, SMS or Telegram",
    "booking_link": "https://www.arcigay.it/palermo/",
    "description": "Palermo's long-rooted LGBTQ+ community organisation, offering listening, psychological and legal orientation, social activity, sexual-health information and rapid HIV or syphilis testing. Contact first: individual desks and groups follow their own schedule, and a protected appointment is more useful than arriving without knowing which service is running.",
    "hours": "Services and rapid-test sessions by published calendar or appointment; contact before visiting.",
    "link": "https://www.arcigay.it/palermo/",
    "location": "Via della Rosa alla Gioiamia 2/4, 90134 Palermo, Italy",
    "lat": 38.1156919,
    "lng": 13.3550082,
    "price_tier": "$",
    "vibe": "historic community infrastructure joining welcome, rights and sexual health",
    "source": "Arcigay Palermo and City of Palermo LGBTQIA+ welfare map; checked 2026-08-13"
  },
  {
    "name": "La Migration — Arcigay Palermo",
    "city": "palermo",
    "type": "other",
    "provider_name": "Arcigay Palermo",
    "contact": "+39 375 651 0944 via WhatsApp, SMS or Telegram",
    "booking_link": "https://palermoconcilia.it/welfare-di-prossimita",
    "description": "A dedicated contact for LGBTQ+ migrants, refugees and people navigating documents, services or isolation in Palermo. The team connects queer welcome with migration-aware support rather than treating identity and legal status as separate problems. Use the private messaging number first and share only the information needed to arrange safe help.",
    "hours": "Private contact and support by arrangement; no fixed public walk-in hours are published.",
    "link": "https://palermoconcilia.it/welfare-di-prossimita",
    "location": "Arcigay Palermo, Via della Rosa alla Gioiamia 2/4, 90134 Palermo, Italy",
    "lat": 38.1156919,
    "lng": 13.3550082,
    "price_tier": "$",
    "vibe": "migration-aware queer welcome with privacy built into first contact",
    "source": "City of Palermo LGBTQIA+ welfare map; checked 2026-08-13"
  },
  {
    "name": "Palermo Policlinico HIV Clinic",
    "city": "palermo",
    "type": "wellness",
    "provider_name": "Azienda Ospedaliera Universitaria Policlinico Palermo",
    "contact": "+39 337 143 8783",
    "booking_link": "https://salutegay.it/contatti/",
    "description": "The hospital-based infectious-disease and HIV clinic for testing, clinical advice and follow-up when a medical setting is needed. The published contact routes patients to the Via del Vespro service; call before travelling to confirm whether your visit needs an appointment, referral or specific fasting and document instructions.",
    "hours": "Tuesday–Thursday 09:00–11:30 according to the current service contact listing; telephone confirmation recommended.",
    "link": "https://salutegay.it/contatti/",
    "location": "Via del Vespro 129, 90127 Palermo, Italy",
    "lat": 38.1060834,
    "lng": 13.3599596,
    "price_tier": "$",
    "vibe": "clinical HIV and infectious-disease care inside Palermo's university hospital",
    "source": "Salute Gay national service contact directory; checked 2026-08-13"
  },
  {
    "name": "Associazione Culturale Sicilia Queer",
    "city": "palermo",
    "type": "other",
    "provider_name": "Sicilia Queer Filmfest",
    "contact": "+39 328 421 9198 · info@siciliaqueerfilmfest.it",
    "booking_link": "https://www.siciliaqueerfilmfest.it/",
    "description": "The association behind Palermo's international queer film festival and year-round screenings, cultural research and emerging-filmmaker work. Contact the operational office for programme, access, volunteering, press or industry questions; it is an organising address, not a daily public cinema or casual drop-in centre.",
    "hours": "Office contact by arrangement; public access follows each screening, festival or call schedule.",
    "link": "https://www.siciliaqueerfilmfest.it/",
    "location": "Operational office: Via Catania 73, 90141 Palermo, Italy",
    "lat": 38.1266700,
    "lng": 13.3461678,
    "price_tier": "$",
    "vibe": "independent queer cinema network with deep local and international reach",
    "source": "Sicilia Queer official 2026 programme and contact page; checked 2026-08-13"
  },
  {
    "name": "RE.A.DY Palermo Anti-Discrimination Contact",
    "city": "palermo",
    "type": "other",
    "provider_name": "City of Palermo",
    "contact": "+39 091 740 8543 · +39 091 740 5637",
    "booking_link": "https://www.comune.palermo.it/vivere-il-comune/eventi/giornata-nazionale-contro-lomolesbobitransafobia/",
    "description": "The municipal contact connected to Palermo's participation in Italy's RE.A.DY network against discrimination based on sexual orientation and gender identity. It is the public-administration route when an issue belongs with city services rather than a bar or community organiser; call first so the correct office can receive it.",
    "hours": "Municipal office hours; telephone contact before an in-person visit is recommended.",
    "link": "https://www.comune.palermo.it/vivere-il-comune/eventi/giornata-nazionale-contro-lomolesbobitransafobia/",
    "location": "Vicolo Palagonia all'Alloro 12, 90133 Palermo, Italy",
    "lat": 38.1171468,
    "lng": 13.3694099,
    "price_tier": "$",
    "vibe": "municipal anti-discrimination route linked to the national RE.A.DY network",
    "source": "City of Palermo official RE.A.DY page, updated 2026-05-13; checked 2026-08-13"
  }
]
$services$) as s(
  name text, city text, type text, provider_name text, contact text,
  booking_link text, description text, hours text, link text, location text,
  lat double precision, lng double precision, price_tier text, vibe text, source text
)
), updated_services as (
update public.services s
set type = q.type, provider_name = q.provider_name, contact = q.contact,
    booking_link = q.booking_link, description = q.description, hours = q.hours,
    link = q.link, location = q.location, lat = q.lat, lng = q.lng,
    price_tier = q.price_tier, vibe = q.vibe, source = q.source,
    "lastChecked" = '2026-08-13'::date, verified = true, seo_indexable = true,
    seo_quality_status = 'approved', updated_at = timezone('utc', now())
from qa_palermo_services q
where lower(trim(s.city)) = lower(trim(q.city))
  and lower(trim(s.name)) = lower(trim(q.name))
returning s.id
)
insert into public.services (
  name, city, type, provider_name, contact, booking_link, description, hours,
  link, image_urls, location, lat, lng, price_tier, vibe, vibe_tags, source,
  "lastChecked", verified, seo_indexable, seo_quality_status, updated_at
)
select q.name, q.city, q.type, q.provider_name, q.contact, q.booking_link,
       q.description, q.hours, q.link, array[]::text[], q.location, q.lat, q.lng,
       q.price_tier, q.vibe, array[]::text[], q.source, '2026-08-13'::date,
       true, true, 'approved', timezone('utc', now())
from qa_palermo_services q
where not exists (
  select 1 from public.services s
  where lower(trim(s.city)) = lower(trim(q.city))
    and lower(trim(s.name)) = lower(trim(q.name))
);

commit;

select 'places' as category, count(*) as total
from public.places where lower(trim(city)) = 'palermo'
union all
select 'events', count(*) from public.events where lower(trim(city)) = 'palermo'
union all
select 'services', count(*) from public.services where lower(trim(city)) = 'palermo'
order by category;
