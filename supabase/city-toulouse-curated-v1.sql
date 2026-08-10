-- Queer Atlas: Toulouse city package
-- Editorially checked 2026-08-10.
-- Safe to run more than once: matching city/name rows are updated, not duplicated.
-- Every mapped record has non-null coordinates and every service uses the current allowed taxonomy.

begin;

with qa_toulouse_places as (
select * from jsonb_to_recordset($places$
[
  {
    "name": "Chez les Jumeaux",
    "city": "toulouse",
    "type": "bar",
    "description": "Toulouse's freshest dedicated gay-bar arrival, opened in 2026 with a warm Iberian streak and an uncomplicated promise: affordable drinks, quick service and a room that becomes properly festive without pretending to be a giant club. Early reports from locals focus on the welcome; weekends and themed Pride-style nights are the moment to come for dancing rather than conversation.",
    "vibe": "new-school gay bar with Spanish warmth and a lively late shift",
    "hours": "Daily 16:00–02:00; Saturday until 03:00. Check Instagram for special-night changes.",
    "link": "https://www.instagram.com/chezlesjumeaux/",
    "location": "1 Rue André Mercadier, 31000 Toulouse, France",
    "lat": 43.6049236,
    "lng": 1.4547444,
    "seo_quality_status": "approved"
  },
  {
    "name": "La Gougnotte",
    "city": "toulouse",
    "type": "bar",
    "description": "A compact queer-feminist bar where the small stage matters as much as the drinks. Drag, karaoke, concerts, exhibitions and community nights turn a Saint-Cyprien local into one of the city's clearest lesbian and broader queer meeting points; an ordinary early evening is gentler, while a programmed night feels communal and close-up.",
    "vibe": "queer-feminist neighbourhood room for drag, art and low-pressure connection",
    "hours": "Monday–Wednesday 17:00–00:00; Thursday–Sunday 17:00–01:30 according to the current business listing. Verify the day's programme on Instagram.",
    "link": "https://www.instagram.com/lagougnotte/",
    "location": "18 Avenue Étienne Billières, 31300 Toulouse, France",
    "lat": 43.5974895,
    "lng": 1.4281339,
    "seo_quality_status": "approved"
  },
  {
    "name": "Le Bear's Bar",
    "city": "toulouse",
    "type": "bar",
    "description": "A late, masculine gay bar for bears, admirers and friends, with a much stronger pulse on Friday and Saturday than on an exploratory midweek visit. It is more retro and direct than polished: regulars, music and long opening hours do the work, with no cover on ordinary nights and a crowd that often settles in for several hours.",
    "vibe": "late bear-led gay bar with a friendly, unvarnished weekend crowd",
    "hours": "Thursday 21:00–04:00; Friday–Saturday 21:00–05:00; Sunday 19:00–02:00. Confirm holiday and special-event hours directly.",
    "link": "https://bears-toulouse.club/",
    "location": "44 Boulevard de la Gare, 31500 Toulouse, France",
    "lat": 43.6071666,
    "lng": 1.4562634,
    "seo_quality_status": "approved"
  },
  {
    "name": "Le Quinquina",
    "city": "toulouse",
    "type": "bar",
    "description": "The city's enduring gay aperitif address, open since 1985 and still shaped more by people than décor. The little terrace is the prize: mainly local gay regulars, occasional visitors and easy street-watching over a beer or Armagnac. Downstairs music dates add energy, but its real strength is an unhurried early drink and the possibility of actual conversation.",
    "vibe": "old Toulouse gay-bar intimacy with a tiny terrace and regulars-first warmth",
    "hours": "Wednesday–Saturday 17:00–00:00; closed Sunday–Tuesday. Special DJ or live-music nights may differ.",
    "link": "https://www.instagram.com/quinquinabar/",
    "location": "26 Rue Peyras, 31000 Toulouse, France",
    "lat": 43.6014155,
    "lng": 1.4449212,
    "seo_quality_status": "approved"
  },
  {
    "name": "KS Sauna",
    "city": "toulouse",
    "type": "sauna",
    "description": "A central gay sauna built for a long afternoon or a later, cheaper visit rather than nightclub theatre. The published pricing makes timing meaningful: evenings cost less, students and under-26s have reduced admission, and Wednesday is especially accessible for younger guests. Come for a men-focused adult sauna environment and read house rules before entering.",
    "vibe": "central men-focused sauna with clear pricing and an easy evening entry point",
    "hours": "Sunday–Thursday 12:00–00:00; Friday–Saturday and holiday eves 12:00–02:00.",
    "link": "https://www.kssauna.fr/fr/horaires-tarifs/",
    "location": "6 Rue Saint-Ferréol, 31000 Toulouse, France",
    "lat": 43.6065841,
    "lng": 1.4546953,
    "seo_quality_status": "approved"
  },
  {
    "name": "Le Kalinka",
    "city": "toulouse",
    "type": "club",
    "description": "A 110-seat independent cabaret where transformism, burlesque, circus, dance, singing and sharp theatrical comedy share the same close room. Dinner-show structure makes it a full evening rather than a casual drop-in, and the intimacy is part of the effect: costumes change at speed, performers work near the tables and booking ahead is the sensible move.",
    "vibe": "intimate Toulouse cabaret mixing transformism, circus and generous camp",
    "hours": "Usually Thursday 20:00–00:00 and Friday–Saturday 20:30–02:00; the live show calendar takes precedence.",
    "link": "https://www.lekalinka.com/",
    "location": "10–10 bis Rue des Teinturiers, 31300 Toulouse, France",
    "lat": 43.596824,
    "lng": 1.4343887,
    "seo_quality_status": "approved"
  },
  {
    "name": "Folles Saisons",
    "city": "toulouse",
    "type": "restaurant",
    "description": "A garden-set cultural restaurant that has spent almost two decades pairing fresh, home-cooked food with women-led art and lesbian social life. Most lunches feel like a relaxed neighbourhood restaurant; selected Bagdam dinners, screenings and parties turn it into a rare intergenerational lesbian destination. Check the cultural calendar and reserve food on event nights.",
    "vibe": "women-led cultural restaurant with garden warmth and lesbian programme nights",
    "hours": "Monday–Wednesday 12:00–14:00; Thursday–Friday 12:00–14:00 and 19:30–00:00; Saturday–Sunday closed except announced cultural events.",
    "link": "https://www.follessaisons.fr/",
    "location": "197 Route de Saint-Simon, 31100 Toulouse, France",
    "lat": 43.5784172,
    "lng": 1.3911921,
    "seo_quality_status": "approved"
  },
  {
    "name": "La Cabane",
    "city": "toulouse",
    "type": "club",
    "description": "A three-level concert room at the Halles de la Cartoucherie that becomes distinctly queer when La Petite and aligned organisers take over. It is not a permanent gay club; its value is serious programmed culture, from Girls Don't Cry to feminist and gender-expansive performance, backed by an explicit inclusion policy and unusually detailed mobility access.",
    "vibe": "inclusive concert hall transformed by ambitious queer and feminist takeovers",
    "hours": "Event-only. Doors open at the time printed on each ticket; the physical box office and bar open with the event.",
    "link": "https://halles-cartoucherie.fr/cabane-infos-pratiques/",
    "location": "16 ter Avenue Raymond Badiou, 31300 Toulouse, France",
    "lat": 43.5996742,
    "lng": 1.4073154,
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
set type = s.type, description = s.description, vibe = s.vibe, hours = s.hours,
    link = s.link, location = s.location, lat = s.lat, lng = s.lng,
    seo_indexable = true, seo_quality_status = s.seo_quality_status,
    updated_at = timezone('utc', now())
from qa_toulouse_places s
where lower(trim(p.city)) = lower(trim(s.city))
  and lower(trim(p.name)) = lower(trim(s.name))
returning p.id
)
insert into public.places (
  name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng,
  seo_indexable, seo_quality_status, updated_at
)
select s.name, s.city, s.type, s.description, s.vibe, array[]::text[], s.hours,
       s.link, s.location, s.lat, s.lng, true, s.seo_quality_status, timezone('utc', now())
from qa_toulouse_places s
where not exists (
  select 1 from public.places p
  where lower(trim(p.city)) = lower(trim(s.city))
    and lower(trim(p.name)) = lower(trim(s.name))
);

with qa_toulouse_events as (
select * from jsonb_to_recordset($events$
[
  {
    "name": "CONTACT Toulouse Listening Group — September 2026",
    "city": "toulouse",
    "description": "A confidential, facilitated conversation on accepting sexual orientation and gender identity in family life, on Saturday 19 September 2026 at 14:00. LGBTQ+ people, parents, relatives and relevant professionals can listen, ask and speak without having to perform certainty; registration is required and the central address is shared privately.",
    "link": "https://www.asso-contact.org/asso/31/actualites/2026/07/09/groupes-decoute-parole-programme-automne-2026",
    "date": "2026-09-19",
    "start_date": "2026-09-19",
    "end_date": "2026-09-19",
    "location": "Central Toulouse, France — exact accessible meeting address supplied after registration",
    "lat": 43.6047,
    "lng": 1.4442,
    "vibe": "private, intergenerational listening space for LGBTQ+ people and families"
  },
  {
    "name": "Festival Sans Pression 2026",
    "city": "toulouse",
    "description": "Toulouse's first alcohol-free queer FLINTA festival runs 3–4 October 2026, combining workshops, an escape game, safer-sex conversation, food, music, visual art and dance. Saturday runs 11:00–23:00 and Sunday 09:30–15:30. The event is reserved for FLINTA people and is not open to cis men; read the programme before booking.",
    "link": "https://www.festivalsanspression.com/en/",
    "date": "2026-10-03",
    "start_date": "2026-10-03",
    "end_date": "2026-10-04",
    "location": "Salle Limayrac, 22 Rue Xavier Darasse, 31500 Toulouse, France",
    "lat": 43.5894975,
    "lng": 1.4795188,
    "vibe": "alcohol-free FLINTA weekend centred on softness, solidarity and real participation"
  },
  {
    "name": "CONTACT Online Gender Identity Group — October 2026",
    "city": "toulouse",
    "description": "An online family dialogue on gender identity on Thursday 15 October 2026 at 20:00. Trans people, parents, relatives and professionals can exchange experiences in a moderated setting without travelling across the region; advance registration is required and the private connection link is sent directly.",
    "link": "https://www.asso-contact.org/asso/31/actualites/2026/07/09/groupes-decoute-parole-programme-automne-2026",
    "date": "2026-10-15",
    "start_date": "2026-10-15",
    "end_date": "2026-10-15",
    "location": "Online — hosted from Toulouse by CONTACT Occitanie",
    "lat": 43.6047,
    "lng": 1.4442,
    "vibe": "moderated trans and family dialogue accessible across Occitanie"
  },
  {
    "name": "Journées du Soin Communautaire #3",
    "city": "toulouse",
    "description": "Five days of trans, queer, antiracist, decolonial, disability and child-rights community care from 18–22 November 2026, built around Trans Day of Remembrance and CLAR-T's tenth anniversary. Workshops, talks, shared food and festive moments prioritise collective survival over polished conference distance; detailed venues and session times are published closer to the dates.",
    "link": "https://www.helloasso.com/associations/clar-t/collectes/journees-du-soin-communautaire-3-18-22-nov-2026-toulouse",
    "date": "2026-11-18",
    "start_date": "2026-11-18",
    "end_date": "2026-11-22",
    "location": "Toulouse, France — detailed partner venues to be published by CLAR-T",
    "lat": 43.6047,
    "lng": 1.4442,
    "vibe": "trans-led community care, political learning and shared resilience"
  },
  {
    "name": "CONTACT Toulouse Listening Group — November 2026",
    "city": "toulouse",
    "description": "The autumn's second in-person CONTACT group meets Saturday 21 November 2026 at 14:00 around sexual orientation, gender identity and family acceptance. It is a listening space rather than a lecture; registration protects the room and the exact central Toulouse address is disclosed to participants.",
    "link": "https://www.asso-contact.org/asso/31/actualites/2026/07/09/groupes-decoute-parole-programme-automne-2026",
    "date": "2026-11-21",
    "start_date": "2026-11-21",
    "end_date": "2026-11-21",
    "location": "Central Toulouse, France — exact accessible meeting address supplied after registration",
    "lat": 43.6047,
    "lng": 1.4442,
    "vibe": "confidential late-autumn support for LGBTQ+ people, relatives and allies"
  },
  {
    "name": "Girls Don't Cry Festival 2026",
    "city": "toulouse",
    "description": "La Petite's two-night queer and feminist music ritual returns to La Cabane on 27–28 November 2026, 19:00–01:00 each night. Music, performance, scenography and local creative work fill the building; Main Forte's trained team supports safety, and published access includes step-free routes, seating, vibrating vests and sign-language-aware bar staff.",
    "link": "https://www.lapetite.fr/girlsdontcry/girls-dont-cry-festival-2026/",
    "date": "2026-11-27",
    "start_date": "2026-11-27",
    "end_date": "2026-11-28",
    "location": "La Cabane, 16 ter Avenue Raymond Badiou, 31300 Toulouse, France",
    "lat": 43.5996742,
    "lng": 1.4073154,
    "vibe": "expansive queer music, performance and collective joy across two nights"
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
from qa_toulouse_events s
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
from qa_toulouse_events s
where not exists (
  select 1 from public.events e
  where lower(trim(e.city)) = lower(trim(s.city))
    and lower(trim(e.name)) = lower(trim(s.name))
);

with qa_toulouse_services as (
select * from jsonb_to_recordset($services$
[
  {
    "name": "Espace diversités laïcité — Centre LGBT+",
    "city": "toulouse",
    "type": "other",
    "provider_name": "Mairie de Toulouse",
    "contact": "+33 5 81 91 79 60",
    "booking_link": "https://metropole.toulouse.fr/kiosque/guide-des-permanences-lespace-diversites-laicite",
    "description": "Toulouse's municipal front door for discrimination support and LGBTQ+ community infrastructure. You can ask for information, find specialist association drop-ins, attend debates and exhibitions or connect with the Centre LGBT+ without needing to decode the full local network first.",
    "hours": "Monday–Saturday 08:30–12:30 and 14:00–22:00. Individual association drop-ins follow their own schedule.",
    "link": "https://metropole.toulouse.fr/annuaire/espace-diversites-laicite",
    "location": "38 Rue d'Aubuisson, 31000 Toulouse, France",
    "lat": 43.603173,
    "lng": 1.4531205,
    "price_tier": "$",
    "vibe": "municipal LGBTQ+ information, rights access and community connection under one roof",
    "source": "Toulouse Métropole official venue page and 2026 permanences guide; checked 2026-08-10"
  },
  {
    "name": "Jules & Julies",
    "city": "toulouse",
    "type": "other",
    "provider_name": "Jules & Julies",
    "contact": "+33 6 52 28 03 58 · julesetjulies31@gmail.com",
    "booking_link": "https://www.julesetjulies.lgbt/",
    "description": "A young and student LGBTQIAP+ association built around social connection, listening and practical health information. Saturday drop-ins mix conversation, games, orientation and low-pressure community; the team also organises outings and testing sessions, making this a useful first local contact rather than a formal appointment room.",
    "hours": "Saturday 14:00–18:00 without appointment at the Espace diversités laïcité; check the current calendar for activities and testing.",
    "link": "https://metropole.toulouse.fr/associations/annuaire/jules-et-julies",
    "location": "Espace diversités laïcité, 38 Rue d'Aubuisson, 31000 Toulouse, France",
    "lat": 43.603173,
    "lng": 1.4531205,
    "price_tier": "$",
    "vibe": "warm young-queer drop-in mixing friendship, listening and sexual-health support",
    "source": "Toulouse Métropole 2026 permanences guide and official association directory; checked 2026-08-10"
  },
  {
    "name": "CLAR-T",
    "city": "toulouse",
    "type": "other",
    "provider_name": "CLAR-T",
    "contact": "clar.t.contact@gmail.com",
    "booking_link": "https://www.helloasso.com/associations/clar-t",
    "description": "Trans-led mutual aid for trans, non-binary, intersex and questioning people, grounded in depathologised community knowledge. The association offers peer groups, individual administrative or legal support by appointment, shared resources and political organising; interpreters may be arranged for non-French speakers or French Sign Language.",
    "hours": "Third Tuesday of the month 18:00–20:00 for the published group; individual support by appointment. Confirm exceptions directly.",
    "link": "https://www.helloasso.com/associations/clar-t",
    "location": "Centre LGBT+, 2nd floor, 38 Rue d'Aubuisson, 31000 Toulouse, France",
    "lat": 43.603173,
    "lng": 1.4531205,
    "price_tier": "$",
    "vibe": "trans self-support joining practical transition knowledge with collective care",
    "source": "CLAR-T official association page and Toulouse municipal support guide; checked 2026-08-10"
  },
  {
    "name": "AIDES Le Lounge Toulouse",
    "city": "toulouse",
    "type": "wellness",
    "provider_name": "AIDES",
    "contact": "+33 5 67 63 06 18",
    "booking_link": "https://www.aides.org/",
    "description": "Free, confidential, judgement-free sexual-health and harm-reduction support with community knowledge of gay and bi men, people living with HIV or hepatitis, sex workers and chemsex. The team combines rapid testing, prevention materials, medical or addiction sessions and honest conversation without turning the visit into a moral lesson.",
    "hours": "Monday, Tuesday and Thursday 14:00–19:00 medical sessions; Friday 09:00–13:00 addiction doctor; community and thematic sessions vary. Call before travelling.",
    "link": "https://www.drogues-info-service.fr/Adresses-utiles/102303",
    "location": "14–16 Place Charles Laganne, 31300 Toulouse, France",
    "lat": 43.5981064,
    "lng": 1.4364823,
    "price_tier": "$",
    "vibe": "straight-talking community sexual health, testing and chemsex support",
    "source": "French public health service listing and Toulouse 2026 emergency-social guide; checked 2026-08-10"
  },
  {
    "name": "CeGIDD Toulouse — Hôpital La Grave",
    "city": "toulouse",
    "type": "wellness",
    "provider_name": "CHU de Toulouse",
    "contact": "+33 5 61 77 80 32 for appointments · +33 5 61 77 78 88 reception",
    "booking_link": "https://www.chu-toulouse.fr/centre-gratuit-d-information-de-depistage-et-de-diagnostic-cegidd",
    "description": "Free confidential medical testing and advice for HIV, hepatitis and other STIs inside the Cité de la santé. This is the clinical option when you need a doctor, diagnosis or follow-up rather than peer support; appointments can be made by phone or at La Grave reception.",
    "hours": "Monday, Wednesday and Thursday 09:00–18:00; Tuesday 09:00–21:00; Friday 09:00–15:00. Appointment desk Monday–Thursday 09:00–12:30 and 13:30–17:00; Friday 09:00–12:30.",
    "link": "https://jem.metropole.toulouse.fr/fr/prestation/515-centre-gratuit-d-information-de-depistage-et-de-diagnostic-cegidd",
    "location": "Cité de la santé, Hôpital La Grave, Place Lange, 31059 Toulouse, France",
    "lat": 43.6008928,
    "lng": 1.4340834,
    "price_tier": "$",
    "vibe": "confidential hospital-based STI testing with long Tuesday access",
    "source": "Toulouse Métropole health directory and CHU Toulouse CeGIDD page; checked 2026-08-10"
  },
  {
    "name": "CONTACT Occitanie Ouest et Pyrénées",
    "city": "toulouse",
    "type": "other",
    "provider_name": "CONTACT HG",
    "contact": "+33 5 61 55 43 86 · associationcontactmp@gmail.com",
    "booking_link": "https://www.asso-contact.org/asso/31/",
    "description": "Family-centred listening for LGBTQ+ people, parents, relatives and professionals who need room to understand orientation or gender identity together. Support moves between individual contact, online dialogue and registered in-person groups; the discreet meeting-address policy protects participants rather than indicating a missing service.",
    "hours": "Telephone and individual support by arrangement; dated in-person and online listening groups require registration.",
    "link": "https://www.asso-contact.org/asso/31/coordonnees-occitanie-ouest-pyrenees",
    "location": "24 bis Rue Sainte-Anne, 31000 Toulouse, France — postal address only; no public drop-in",
    "lat": 43.6009,
    "lng": 1.4496,
    "price_tier": "$",
    "vibe": "patient family dialogue with privacy built into the meeting process",
    "source": "CONTACT official regional contact and autumn 2026 programme pages; checked 2026-08-10"
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
    "lastChecked" = '2026-08-10'::date, verified = true, seo_indexable = true,
    seo_quality_status = 'approved', updated_at = timezone('utc', now())
from qa_toulouse_services q
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
       q.price_tier, q.vibe, array[]::text[], q.source, '2026-08-10'::date,
       true, true, 'approved', timezone('utc', now())
from qa_toulouse_services q
where not exists (
  select 1 from public.services s
  where lower(trim(s.city)) = lower(trim(q.city))
    and lower(trim(s.name)) = lower(trim(q.name))
);

commit;

select 'places' as category, count(*) as total
from public.places where lower(trim(city)) = 'toulouse'
union all
select 'events', count(*) from public.events where lower(trim(city)) = 'toulouse'
union all
select 'services', count(*) from public.services where lower(trim(city)) = 'toulouse'
order by category;
