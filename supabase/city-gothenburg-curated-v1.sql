-- Queer Atlas: Gothenburg city package
-- Editorially checked 2026-08-10.
-- Safe to run more than once: matching city/name rows are updated, not duplicated.
--
-- Primary research:
-- https://www.goteborg.com/en/guides/lgbtqi-gothenburg
-- https://www.westpride.se/
-- https://goteborg.se/wps/portal/enheter/regnbagshuset
-- https://goteborg.rfsl.se/
-- https://www.gbgqueerlindy.com/
-- Official venue, service and museum pages are stored on each record below.
-- Protected youth spaces and member clubs intentionally do not expose a street address.

begin;

-- Some production databases still have the original services constraint,
-- which predates the gay_store category. Keep this city package self-contained.
alter table public.services
  drop constraint if exists qa_services_type_allowed;

alter table public.services
  add constraint qa_services_type_allowed
  check (
    type = any (
      array[
        'massage',
        'tour',
        'wellness',
        'gay_store',
        'escort',
        'styling',
        'concierge',
        'transport',
        'other'
      ]::text[]
    )
  );

with qa_gothenburg_places as (
select * from jsonb_to_recordset($places$
[
  {
    "name": "Bee Kök & Bar",
    "city": "gothenburg",
    "type": "bar",
    "description": "Gothenburg's easiest queer all-day address: lunch and dinner inside the market hall slide naturally into drinks, conversation and late dancing. Bee calls itself straight-friendly, and the room usually feels more social than scene-policed — useful for a first drink alone as well as a mixed group.",
    "vibe": "warm market-hall meeting point with late queer energy",
    "hours": "Monday–Thursday 11:30–00:00; Friday–Saturday 11:30–03:00; Sunday 11:30–00:00. Kitchen until 23:00.",
    "link": "https://beebar.se/",
    "location": "Stora Saluhallen, Kungstorget 13–15, 411 17 Göteborg, Sweden",
    "lat": 57.7037669,
    "lng": 11.9686644,
    "seo_quality_status": "approved"
  },
  {
    "name": "Gretas",
    "city": "gothenburg",
    "type": "club",
    "description": "The city's long-running dedicated gay club and the obvious choice when the brief is pop, schlager, house and a full dance floor rather than a quiet cocktail. Two floors create different moods; the crowd is broad, celebratory and often includes allies, so it reads as an LGBTQ+ institution without feeling closed to newcomers.",
    "vibe": "two-floor gay club for pop, house and uninhibited dancing",
    "hours": "Friday–Saturday late night; the current venue listing gives 22:00–05:00. Check the same-day programme and door information before going.",
    "link": "https://www.goteborg.com/en/places/gretas-2",
    "location": "Drottninggatan 35, 411 14 Göteborg, Sweden",
    "lat": 57.7055348,
    "lng": 11.9673136,
    "seo_quality_status": "approved"
  },
  {
    "name": "Haket",
    "city": "gothenburg",
    "type": "bar",
    "description": "An LGBTQ-friendly pub for people who would rather talk over a serious beer list than queue for a glossy club. The mixed crowd, unforced welcome and Masthugget location make it a strong bridge between central drinks and the more alternative Majorna route.",
    "vibe": "unpretentious queer-friendly beer pub with a mixed local crowd",
    "hours": "Monday–Thursday 16:00–late; Friday 15:00–late; Saturday 14:00–late; Sunday closed.",
    "link": "https://www.haketpub.se/",
    "location": "Masthuggstorget 5, 413 27 Göteborg, Sweden",
    "lat": 57.6989433,
    "lng": 11.9438588,
    "seo_quality_status": "approved"
  },
  {
    "name": "Crippas Café",
    "city": "gothenburg",
    "type": "cafe",
    "description": "A small vegan café-pub where Majorna's inclusive everyday culture matters as much as the food. Live music, quizzes, stand-up and community nights give it a scruffier, more personal rhythm than the central bars; check the current programme because the best reason to visit is often what is happening that evening.",
    "vibe": "vegan neighbourhood café with intimate culture-night energy",
    "hours": "Programme and kitchen-led hours vary; check the venue's current listing before travelling.",
    "link": "https://www.goteborg.com/en/places/crippas-cafe",
    "location": "Kusttorget 1, 414 55 Göteborg, Sweden",
    "lat": 57.6944656,
    "lng": 11.9188408,
    "seo_quality_status": "approved"
  },
  {
    "name": "Oceanen",
    "city": "gothenburg",
    "type": "bar",
    "description": "A culture house, vegetarian restaurant and bar near Stigbergstorget whose queer value comes through programming rather than a permanent rainbow label. Concerts, talks and the acclaimed Queer Gaze literary series draw an alternative crowd and make Oceanen one of the city's most useful culture-first evening checks.",
    "vibe": "alternative culture house with queer literature and live music",
    "hours": "Restaurant, bar and event hours follow the live programme; verify the calendar for the day of your visit.",
    "link": "https://www.oceanen.com/",
    "location": "Stigbergstorget 8, 414 63 Göteborg, Sweden",
    "lat": 57.6984071,
    "lng": 11.9336353,
    "seo_quality_status": "approved"
  },
  {
    "name": "Park Lane",
    "city": "gothenburg",
    "type": "club",
    "description": "A polished Avenyn nightclub that becomes genuinely relevant to the queer map when Club Queer takes over. Expect a larger, glossier room, pop-forward spectacle and a dressier crowd than at Majorna's venues; on ordinary nights Park Lane is a mainstream club, so confirm the exact Club Queer date before building a route around it.",
    "vibe": "glamorous large-room club with recurring Club Queer nights",
    "hours": "Event-led. Club Queer is normally programmed on selected last Fridays; current door time, age limit and tickets must be checked for each edition.",
    "link": "https://www.parklane.se/park-lane-club",
    "location": "Kungsportsavenyen 38, 411 36 Göteborg, Sweden",
    "lat": 57.7006591,
    "lng": 11.9744379,
    "seo_quality_status": "approved"
  },
  {
    "name": "Pustervik",
    "city": "gothenburg",
    "type": "bar",
    "description": "A central independent music venue where the queer signal arrives through concerts, club nights and Pride programming rather than a fixed identity. It works best as an event pick: check who is playing, then use nearby Järntorget and Haket to turn it into a fuller night.",
    "vibe": "independent live room with event-led queer and alternative nights",
    "hours": "Wednesday–Thursday 17:00–23:00; Friday–Saturday 17:00–03:00, with concert and club access varying by event.",
    "link": "https://pustervik.nu/",
    "location": "Järntorgsgatan 12–14, 413 01 Göteborg, Sweden",
    "lat": 57.700447,
    "lng": 11.954223,
    "seo_quality_status": "approved"
  },
  {
    "name": "Club Deluxe",
    "city": "gothenburg",
    "type": "cruise_club",
    "description": "A sex-positive club and shop in Hisings Backa with themed spaces, explicit consent rules and a calendar that includes Gay/Bi and Trans/Crossdress sessions. It is not a casual bar drop-in: read the night's audience, house rules and dress guidance before travelling, and choose the programme that actually fits you.",
    "vibe": "sex-positive themed club with consent-led community nights",
    "hours": "Monday–Thursday 11:00–20:00; Friday–Saturday 11:00–23:30; Sunday 11:00–20:00. Individual club sessions follow the event calendar.",
    "link": "https://clubdeluxe.se/",
    "location": "Backa Bergögata 2, 422 46 Hisings Backa, Sweden",
    "lat": 57.7483964,
    "lng": 11.996694,
    "seo_quality_status": "approved"
  },
  {
    "name": "Vuxenkul Backaplan",
    "city": "gothenburg",
    "type": "cruising_area",
    "description": "An adult store with cinema and private-booth facilities rather than a conventional gay venue. The audience is mixed and the atmosphere is practical, anonymous and explicitly adult; it suits people looking for a cruise-oriented stop, not travellers searching for drinks or a community bar.",
    "vibe": "adult cinema and booths with a mixed cruise-oriented audience",
    "hours": "Monday–Thursday 10:00–23:00; Friday 10:00–23:30; Saturday 11:00–23:30; Sunday 11:00–23:00. Recheck branch hours before visiting.",
    "link": "https://vuxenkul.se/vuxenkul/",
    "location": "Färgfabriksgatan 3, 417 05 Göteborg, Sweden",
    "lat": 57.7237567,
    "lng": 11.9500287,
    "seo_quality_status": "approved"
  },
  {
    "name": "SLM Göteborg",
    "city": "gothenburg",
    "type": "cruise_club",
    "description": "A member-led leather and fetish club for gay, bisexual and pansexual men. Entry depends on membership, the individual event and its dress code; the Kortedala address is deliberately shared only with eligible members, so contact the club before attempting the journey.",
    "vibe": "private men-only leather and fetish community club",
    "hours": "Event-led and members-only. Consult the official calendar, membership rules and dress code for each night.",
    "link": "https://slmgbg.nu/wordpress/sv/",
    "location": "Kortedala, Göteborg, Sweden — map pin shows the district only; exact address is supplied by the club after membership contact",
    "lat": 57.74911,
    "lng": 12.03356,
    "seo_quality_status": "approved"
  },
  {
    "name": "Avalon Hotel",
    "city": "gothenburg",
    "type": "hotel",
    "description": "A design-led premium base at Kungstorget, close enough to walk to Bee, Gretas and the old city without turning the stay into a nightlife hotel. The city's official LGBTQI guide highlights its inclusive atmosphere and popularity with LGBTQ+ travellers; the rooftop pool and terrace add a quieter reward in season.",
    "vibe": "inclusive design hotel beside the central queer route",
    "hours": "Hotel reception operates around the clock. Check-in from 15:00; check-out by 11:00.",
    "link": "https://www.avalonhotel.se/en/",
    "location": "Kungstorget 9, 411 17 Göteborg, Sweden",
    "lat": 57.7040686,
    "lng": 11.96852,
    "seo_quality_status": "approved"
  },
  {
    "name": "Scandic Rubinen",
    "city": "gothenburg",
    "type": "hotel",
    "description": "A lively Avenyn hotel with a visible LGBTQ-friendly reputation and direct access to Park Lane, restaurants and central trams. It is a practical choice for travellers who prefer a busy city corridor and rooftop drinks over the boutique quiet of the old town.",
    "vibe": "welcoming Avenyn hotel with rooftop social energy",
    "hours": "Hotel reception operates around the clock. Rooftop bar hours are seasonal; verify the current schedule directly.",
    "link": "https://www.scandichotels.com/en/hotels/scandic-rubinen",
    "location": "Kungsportsavenyen 24, 400 14 Göteborg, Sweden",
    "lat": 57.6992273,
    "lng": 11.9765002,
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
from qa_gothenburg_places s
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
from qa_gothenburg_places s
where not exists (
  select 1 from public.places p
  where lower(trim(p.city)) = lower(trim(s.city))
    and lower(trim(p.name)) = lower(trim(s.name))
);

with qa_gothenburg_events as (
select * from jsonb_to_recordset($events$
[
  {
    "name": "Gothenburg Queer Lindy Festival 2026",
    "city": "gothenburg",
    "description": "Three days of queer-centred lindy hop and blues without fixed heteronormative dance roles. Classes, parties, taster sessions and conversations share the same social core; the organisers use solidarity pricing and welcome both queer dancers and allies. Runs 18–20 September 2026, with Forum as the main venue.",
    "link": "https://www.gbgqueerlindy.com/",
    "date": "2026-09-18",
    "start_date": "2026-09-18",
    "end_date": "2026-09-20",
    "location": "Forum, Doktor Fries Torg 7, 413 23 Göteborg, Sweden",
    "lat": 57.6838035,
    "lng": 11.9716835,
    "vibe": "queer swing, live bands, workshops and three social dance nights"
  },
  {
    "name": "Queer Wednesday: Farliga ord och fria röster",
    "city": "gothenburg",
    "description": "A museum evening about the twentieth-century press, from hate propaganda to queer liberation, combining a talk, objects from the collection and a creative workshop. Wednesday 7 October 2026, 18:00–19:30; included in museum admission and free for visitors under 20. Capacity is limited, so book through the official page.",
    "link": "https://goteborgsstadsmuseum.se/aktivitet/queer-onsdag-farliga-ord-och-fria-roster/?date=202610071800",
    "date": "2026-10-07",
    "start_date": "2026-10-07",
    "end_date": "2026-10-07",
    "location": "Göteborgs stadsmuseum, Norra Hamngatan 12, 411 14 Göteborg, Sweden",
    "lat": 57.7063149,
    "lng": 11.9634562,
    "vibe": "queer history, free speech and hands-on museum workshop"
  },
  {
    "name": "Queer Wednesday: Skriv queert",
    "city": "gothenburg",
    "description": "A welcoming writing workshop that uses the museum's rooms and collections to explore queer text, identity and alternative ways of telling stories. Wednesday 4 November 2026, 18:00–19:30; no previous writing experience is required. Included in museum admission and free for visitors under 20, with limited bookable places.",
    "link": "https://goteborgsstadsmuseum.se/aktivitet/queer-onsdag-och-queer-text/?date=202611041800",
    "date": "2026-11-04",
    "start_date": "2026-11-04",
    "end_date": "2026-11-04",
    "location": "Göteborgs stadsmuseum, Norra Hamngatan 12, 411 14 Göteborg, Sweden",
    "lat": 57.7063149,
    "lng": 11.9634562,
    "vibe": "intimate queer writing workshop inside the city museum"
  },
  {
    "name": "Queer Wednesday: Vem var Kai Roger Idhem?",
    "city": "gothenburg",
    "description": "Michael Schröder traces the life of Kai Roger Idhem, whose registered sex was changed in 1947, and asks how queer and trans lives can be understood through historical records. Wednesday 2 December 2026, 18:00–19:00; included in museum admission and free for visitors under 20. Booking is recommended because capacity is limited.",
    "link": "https://goteborgsstadsmuseum.se/aktivitet/queer-onsdag-vem-var-kai-roger-idhem/",
    "date": "2026-12-02",
    "start_date": "2026-12-02",
    "end_date": "2026-12-02",
    "location": "Göteborgs stadsmuseum, Norra Hamngatan 12, 411 14 Göteborg, Sweden",
    "lat": 57.7063149,
    "lng": 11.9634562,
    "vibe": "queer and trans history told through one recovered life"
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
from qa_gothenburg_events s
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
from qa_gothenburg_events s
where not exists (
  select 1 from public.events e
  where lower(trim(e.city)) = lower(trim(s.city))
    and lower(trim(e.name)) = lower(trim(s.name))
);

with qa_gothenburg_services as (
select * from jsonb_to_recordset($services$
[
  {
    "name": "RFSL Göteborg",
    "city": "gothenburg",
    "type": "other",
    "provider_name": "RFSL Göteborg",
    "contact": "info@goteborg.rfsl.se · +46 (0)31 788 25 10",
    "booking_link": "https://goteborg.rfsl.se/kontakt/",
    "description": "The city's central LGBTQI rights and community organisation, connecting support, social groups, advocacy and specialist networks. It is the most useful first contact when a traveller or new resident needs a real local route rather than another nightlife list.",
    "hours": "Visits by appointment; contact the office before arriving.",
    "link": "https://goteborg.rfsl.se/",
    "location": "Skeppsbron 4, 411 21 Göteborg, Sweden",
    "lat": 57.7041432,
    "lng": 11.9554077,
    "price_tier": "$",
    "vibe": "rights, support and community connection under one roof",
    "source": "RFSL Göteborg official website; checked 2026-08-10"
  },
  {
    "name": "Regnbågshuset",
    "city": "gothenburg",
    "type": "other",
    "provider_name": "City of Gothenburg",
    "contact": "regnbagshuset@demokratimedborgarservice.goteborg.se · 031-365 00 48",
    "booking_link": "https://goteborg.se/wps/portal/enheter/regnbagshuset",
    "description": "A free 600-square-metre municipal meeting house created with and for Gothenburg's LGBTQI community. Drop in to connect, create or find groups, or follow the programme for workshops, conversations and community-led activity in a space that does not require buying a drink.",
    "hours": "Open house Tuesday and Wednesday 15:00–18:00; Thursday 13:30–16:30; first Saturday and Sunday of each month 10:00–18:00. Other times are used for booked activities.",
    "link": "https://goteborg.se/wps/portal/enheter/regnbagshuset",
    "location": "Barlastgatan 2, 414 63 Göteborg, Sweden",
    "lat": 57.700007,
    "lng": 11.9388031,
    "price_tier": "$",
    "vibe": "free municipal queer meeting house with room to linger",
    "source": "City of Gothenburg official Regnbågshuset pages; checked 2026-08-10"
  },
  {
    "name": "Checkpoint Göteborg",
    "city": "gothenburg",
    "type": "wellness",
    "provider_name": "RFSL Göteborg",
    "contact": "info@checkpointgoteborg.org",
    "booking_link": "https://checkpointgoteborg.org/",
    "description": "Anonymous, free rapid HIV testing for men who have sex with men and for trans people. The service is low-threshold and community-based, with results during the visit and no need to turn a health check into a clinical maze.",
    "hours": "Drop-in Tuesdays 18:00–20:00. Check the official site for holiday or temporary changes.",
    "link": "https://checkpointgoteborg.org/",
    "location": "RFSL Göteborg, Skeppsbron 4, 411 21 Göteborg, Sweden",
    "lat": 57.7041432,
    "lng": 11.9554077,
    "price_tier": "$",
    "vibe": "anonymous and community-led sexual-health support",
    "source": "Checkpoint Göteborg official website; checked 2026-08-10"
  },
  {
    "name": "Positiva Gruppen Väst",
    "city": "gothenburg",
    "type": "wellness",
    "provider_name": "Positiva Gruppen Väst",
    "contact": "kontoret@pgvast.se · 031-14 35 30",
    "booking_link": "https://www.levamedhiv.org/kontakt",
    "description": "Peer support, rights information and a meeting place for people living with or affected by HIV in western Sweden. The tone is community-to-community rather than abstract advice, making it a valuable local service for conversation and practical connection.",
    "hours": "Thursday drop-in and telephone peer support 13:00–15:00; contact ahead for other visits and activities.",
    "link": "https://www.levamedhiv.org/",
    "location": "Nordhemsgatan 50, 413 06 Göteborg, Sweden",
    "lat": 57.695432,
    "lng": 11.9508264,
    "price_tier": "$",
    "vibe": "warm peer support and practical HIV community knowledge",
    "source": "Positiva Gruppen Väst official website; checked 2026-08-10"
  },
  {
    "name": "GIA – Gays in Angered",
    "city": "gothenburg",
    "type": "other",
    "provider_name": "City of Gothenburg",
    "contact": "gia@socialnordost.goteborg.se",
    "booking_link": "https://goteborg.se/",
    "description": "A safe, protected meeting place for LGBTQIA+ young people aged 13–25 in north-east Gothenburg. The location is intentionally provided only after contact; that privacy is part of the service, not missing data.",
    "hours": "Contact the team for the current programme, registration and meeting details.",
    "link": "https://www.goteborg.com/en/guides/lgbtqi-gothenburg",
    "location": "Angered, Göteborg, Sweden — protected address supplied after direct contact",
    "lat": null,
    "lng": null,
    "price_tier": "$",
    "vibe": "protected youth space with local LGBTQIA+ support",
    "source": "City of Gothenburg and official Göteborg visitor guide; checked 2026-08-10"
  },
  {
    "name": "House of Colors",
    "city": "gothenburg",
    "type": "other",
    "provider_name": "City of Gothenburg",
    "contact": "houseofcolors@socialhisingen.goteborg.se",
    "booking_link": "https://goteborg.se/",
    "description": "A protected Hisingen meeting place for LGBTQI+ young people aged 13–20. Registration is required and the exact location is shared directly, allowing the room to remain genuinely safe rather than merely described as safe online.",
    "hours": "Thursday activities; registration required. Contact the team for the current time and protected address.",
    "link": "https://www.goteborg.com/en/guides/lgbtqi-gothenburg",
    "location": "Hisingen, Göteborg, Sweden — protected address supplied after registration",
    "lat": null,
    "lng": null,
    "price_tier": "$",
    "vibe": "registered youth community space with privacy built in",
    "source": "City of Gothenburg and official Göteborg visitor guide; checked 2026-08-10"
  },
  {
    "name": "Transammans Väst",
    "city": "gothenburg",
    "type": "other",
    "provider_name": "Transammans",
    "contact": "vast@transammans.se",
    "booking_link": "https://transammans.se/om_transammans/kontakt/",
    "description": "The western regional branch of Transammans, offering social connection and support for trans people and their close ones. Meetings are programme-led and can move, so the email contact is more useful than an assumed permanent office door.",
    "hours": "Activity-led; request the current Gothenburg and regional meeting calendar by email.",
    "link": "https://transammans.se/",
    "location": "Göteborg and Västra Götaland, Sweden — meeting locations vary by activity",
    "lat": null,
    "lng": null,
    "price_tier": "$",
    "vibe": "trans-led regional support and low-pressure social connection",
    "source": "Transammans official contact page; checked 2026-08-10"
  },
  {
    "name": "West Pride",
    "city": "gothenburg",
    "type": "other",
    "provider_name": "West Pride",
    "contact": "Use the official contact page for festival, education and partnership enquiries.",
    "booking_link": "https://www.westpride.se/",
    "description": "Gothenburg's annual Pride organisation and a year-round platform for LGBTQI education, certification, dialogue and visibility. The 2026 festival ran 8–14 June; use the organisation between festival editions for current programmes and the next confirmed dates.",
    "hours": "Year-round organisation with programme-led events; festival dates are announced on the official site.",
    "link": "https://www.westpride.se/",
    "location": "Göteborg, Sweden — festival venues vary across the city",
    "lat": 57.7089,
    "lng": 11.9746,
    "price_tier": "$",
    "vibe": "citywide Pride visibility with work continuing beyond festival week",
    "source": "West Pride official website; checked 2026-08-10"
  },
  {
    "name": "Vuxenkul Göteborg",
    "city": "gothenburg",
    "type": "gay_store",
    "provider_name": "Vuxenkul",
    "contact": "Use the official website for current branch and product enquiries.",
    "booking_link": "https://vuxenkul.se/",
    "description": "A long-running adult store with a physical Backaplan branch and online shop. The range is for mixed orientations and identities; it is included as a practical local adult retail service rather than being presented as a gay-only business.",
    "hours": "Backaplan: Monday–Thursday 10:00–23:00; Friday 10:00–23:30; Saturday 11:00–23:30; Sunday 11:00–23:00. Recheck before visiting.",
    "link": "https://vuxenkul.se/vuxenkul/",
    "location": "Färgfabriksgatan 3, 417 05 Göteborg, Sweden",
    "lat": 57.7237567,
    "lng": 11.9500287,
    "price_tier": "$$",
    "vibe": "inclusive adult retail with a late-opening physical branch",
    "source": "Vuxenkul official website and current branch listing; checked 2026-08-10"
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
from qa_gothenburg_services q
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
from qa_gothenburg_services q
where not exists (
  select 1 from public.services s
  where lower(trim(s.city)) = lower(trim(q.city))
    and lower(trim(s.name)) = lower(trim(q.name))
);

commit;

select 'places' as category, count(*) as total
from public.places where lower(trim(city)) = 'gothenburg'
union all
select 'events', count(*)
from public.events where lower(trim(city)) = 'gothenburg'
union all
select 'services', count(*)
from public.services where lower(trim(city)) = 'gothenburg'
order by category;
