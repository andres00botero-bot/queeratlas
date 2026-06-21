-- Queer Atlas: Mumbai city package
-- Verified 2026-06-21.
-- Safe to run multiple times.
--
-- Research sources:
-- - https://www.travelgay.com/gay-mumbai
-- - https://www.wolfyy.com/travel-guide-gay-mumbai/#bars
-- - https://www.myguidemumbai.com/nightlife/the-voodoo-club
-- - https://homegrown.co.in/homegrown-explore/homegrown-s-queer-guide-to-mumbai-pride-parties-karaoke-more
-- - Official/community sources used for app-facing links where available:
--   The LaLiT / Kitty Su, KASHISH Mumbai Queer Film Festival, Humsafar Trust,
--   Gay Bombay, Gaysi Family, No Footprints, hotel/venue official websites.
--
-- App-facing links below are official venue/hotel/organization/social links when verified.
-- Competitor guide links are not used as official venue links.
-- Restaurants and cafes use type = 'cafe' as required by the app/database.
-- No active dedicated gay sauna in Mumbai could be verified for this package.
-- Production-safe: vibe_tags are empty arrays to avoid stricter Supabase tag constraints.

begin;

with source_places as (
  select *
  from jsonb_to_recordset($qa_places$
[
  {
    "name": "Kitty Su Mumbai",
    "city": "mumbai",
    "type": "club",
    "description": "LGBTQ-forward luxury club night anchor inside The LaLiT Mumbai network, known for drag, pop, dance and high-production queer party programming when active.",
    "vibe": "luxury hotel club and queer party anchor",
    "hours": "Event-led late-night hours vary; verify current Kitty Su / The LaLiT Mumbai programming before visiting.",
    "link": "https://www.kittysu.com/",
    "location": "The LaLiT Mumbai, Sahar Airport Road, Andheri East, Mumbai, Maharashtra 400059, India",
    "lat": 19.1076,
    "lng": 72.8742
  },
  {
    "name": "The Voodoo Club",
    "city": "mumbai",
    "type": "club",
    "description": "Legacy Colaba nightlife listing historically associated with Mumbai gay nights and mixed late dancing. Treat as verify-first because current programming can change.",
    "vibe": "legacy colaba gay-night club reference",
    "hours": "Late-night schedule uncertain; verify current opening and programming before visiting.",
    "link": "",
    "location": "Kamal Mansion, Arthur Bunder Road, Colaba, Mumbai, Maharashtra, India",
    "lat": 18.9192,
    "lng": 72.8318
  },
  {
    "name": "TAP Andheri",
    "city": "mumbai",
    "type": "bar",
    "description": "Large Andheri bar and lounge used for Gay Bombay party nights and mixed social events, useful as a north Mumbai queer-event venue rather than a full-time gay bar.",
    "vibe": "andheri party lounge with queer-event nights",
    "hours": "Bar hours and event timings vary; check the organizer and venue calendar before going.",
    "link": "",
    "location": "TAP Andheri, Royal Plaza, New Link Road, Andheri West, Mumbai, Maharashtra, India",
    "lat": 19.1356,
    "lng": 72.8339
  },
  {
    "name": "Gokul Bar and Restaurant",
    "city": "mumbai",
    "type": "bar",
    "description": "Old-school Colaba bar and restaurant with a long queer social memory in Mumbai, especially as a low-key meet-up reference near the south Mumbai nightlife trail.",
    "vibe": "old-school colaba social bar",
    "hours": "Daily restaurant/bar hours vary; verify current opening before visiting.",
    "link": "",
    "location": "Tulloch Road, Apollo Bandar, Colaba, Mumbai, Maharashtra, India",
    "lat": 18.9224,
    "lng": 72.8328
  },
  {
    "name": "Doolally Taproom Bandra",
    "city": "mumbai",
    "type": "cafe",
    "description": "Relaxed craft-beer taproom and casual food stop with an inclusive mixed crowd, useful for lower-pressure queer-friendly meetups before bigger Bandra or Andheri plans.",
    "vibe": "inclusive bandra taproom and casual meetup",
    "hours": "Taproom hours vary by outlet; verify current Bandra timings before visiting.",
    "link": "https://doolally.in/",
    "location": "Bandra West, Mumbai, Maharashtra, India",
    "lat": 19.0544,
    "lng": 72.8400
  },
  {
    "name": "Cafe Mondegar",
    "city": "mumbai",
    "type": "cafe",
    "description": "Classic Colaba cafe-bar close to south Mumbai hotels and culture stops, useful as an easy daytime or early-evening mixed meeting point.",
    "vibe": "classic colaba cafe-bar meeting point",
    "hours": "Daily cafe/bar hours vary; verify current opening before visiting.",
    "link": "https://cafemondegar.com/",
    "location": "Metro House, 5A Shahid Bhagat Singh Road, Colaba, Mumbai, Maharashtra 400001, India",
    "lat": 18.9240,
    "lng": 72.8322
  },
  {
    "name": "Olive Bar and Kitchen Bandra",
    "city": "mumbai",
    "type": "cafe",
    "description": "Stylish Bandra restaurant-bar with social dinner energy, useful for softer queer-friendly meetups before moving into event-led nightlife.",
    "vibe": "stylish bandra dinner and cocktail stop",
    "hours": "Restaurant and bar hours vary; reserve and verify current timings before visiting.",
    "link": "https://olivebarandkitchen.com/",
    "location": "14, Nargis Dutt Road, Union Park, Khar West, Mumbai, Maharashtra 400052, India",
    "lat": 19.0707,
    "lng": 72.8260
  },
  {
    "name": "The LaLiT Mumbai",
    "city": "mumbai",
    "type": "hotel",
    "description": "Major LGBTQ-supportive luxury hotel near the airport, connected with the Kitty Su brand and useful for travelers who want a visible queer-friendly hospitality anchor.",
    "vibe": "airport luxury hotel with queer hospitality signal",
    "hours": "Hotel open daily; reception and booking services operate continuously. Verify room availability directly.",
    "link": "https://www.thelalit.com/the-lalit-mumbai/",
    "location": "Sahar Airport Road, Andheri East, Mumbai, Maharashtra 400059, India",
    "lat": 19.1076,
    "lng": 72.8742
  },
  {
    "name": "Le Sutra Hotel",
    "city": "mumbai",
    "type": "hotel",
    "description": "Boutique art hotel in Khar/Bandra with restaurant and nightlife access, useful for travelers who want a softer north-west Mumbai base near social venues.",
    "vibe": "boutique bandra-khar art hotel",
    "hours": "Hotel open daily; reception and booking services operate continuously. Verify room availability directly.",
    "link": "https://www.lesutra.in/",
    "location": "14, Nargis Dutt Road, Union Park, Khar West, Mumbai, Maharashtra 400052, India",
    "lat": 19.0707,
    "lng": 72.8260
  },
  {
    "name": "The Gordon House Hotel",
    "city": "mumbai",
    "type": "hotel",
    "description": "Boutique Colaba hotel close to Gateway of India, Cafe Mondegar, Kala Ghoda and south Mumbai culture routes, practical for a walkable first Mumbai base.",
    "vibe": "boutique colaba base near culture and cafes",
    "hours": "Hotel open daily; reception and booking services operate continuously. Verify room availability directly.",
    "link": "https://www.ghhotel.com/",
    "location": "5 Battery Street, Apollo Bandar, Colaba, Mumbai, Maharashtra 400039, India",
    "lat": 18.9221,
    "lng": 72.8327
  },
  {
    "name": "The Taj Mahal Palace Mumbai",
    "city": "mumbai",
    "type": "hotel",
    "description": "Iconic luxury hotel at the Gateway of India, useful for premium south Mumbai stays with easy access to Colaba, Kala Ghoda and waterfront routes.",
    "vibe": "iconic colaba luxury landmark",
    "hours": "Hotel open daily; reception and booking services operate continuously. Verify room availability directly.",
    "link": "https://www.tajhotels.com/en-in/hotels/taj-mahal-palace-mumbai",
    "location": "Apollo Bunder, Colaba, Mumbai, Maharashtra 400001, India",
    "lat": 18.9217,
    "lng": 72.8332
  },
  {
    "name": "Sofitel Mumbai BKC",
    "city": "mumbai",
    "type": "hotel",
    "description": "Polished Bandra Kurla Complex hotel with strong airport, BKC and Bandra access, useful for travelers planning event-led nights across north and central Mumbai.",
    "vibe": "premium bkc hotel with airport access",
    "hours": "Hotel open daily; reception and booking services operate continuously. Verify room availability directly.",
    "link": "https://all.accor.com/hotel/6451/index.en.shtml",
    "location": "C-57, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051, India",
    "lat": 19.0675,
    "lng": 72.8697
  },
  {
    "name": "Abode Bombay",
    "city": "mumbai",
    "type": "hotel",
    "description": "Design-led boutique hotel in Colaba with a warm independent feel, useful for culture-first travelers who want south Mumbai walkability.",
    "vibe": "design boutique colaba stay",
    "hours": "Hotel open daily; reception and booking services operate continuously. Verify room availability directly.",
    "link": "https://www.abodeboutiquehotels.com/",
    "location": "18 Lansdowne House, M.B. Marg, Apollo Bandar, Colaba, Mumbai, Maharashtra 400001, India",
    "lat": 18.9231,
    "lng": 72.8316
  },
  {
    "name": "Soho House Mumbai",
    "city": "mumbai",
    "type": "hotel",
    "description": "Members-club hotel and social base on Juhu Beach with creative-industry energy, useful for premium travelers who want a softer coastal stay.",
    "vibe": "creative juhu members-club hotel",
    "hours": "Hotel and house access rules vary; verify room availability and entry requirements directly.",
    "link": "https://www.sohohouse.com/houses/soho-house-mumbai",
    "location": "16 Juhu Tara Road, Juhu, Mumbai, Maharashtra 400049, India",
    "lat": 19.1071,
    "lng": 72.8258
  }
]
$qa_places$) as p(
    name text, city text, type text, description text, vibe text,
    hours text, link text, location text, lat numeric, lng numeric
  )
)
insert into public.places (
  name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng
)
select
  name, city, type, description, vibe, array[]::text[], hours, nullif(link, ''), location, lat, lng
from source_places sp
where not exists (
  select 1
  from public.places p
  where lower(trim(p.city)) = lower(trim(sp.city))
    and lower(trim(p.name)) = lower(trim(sp.name))
);

with source_events as (
  select *
  from jsonb_to_recordset($qa_events$
[
  {
    "name": "KASHISH Mumbai International Queer Film Festival",
    "city": "mumbai",
    "description": "Mumbai's flagship LGBTQIA+ film festival and one of South Asia's major queer cultural events. The 2026 edition ran 3-7 June; verify the next edition before planning.",
    "link": "https://mumbaiqueerfest.com/",
    "date": null,
    "start_date": null,
    "end_date": null,
    "location": "Mumbai, Maharashtra, India",
    "lat": 19.0760,
    "lng": 72.8777,
    "vibe": "flagship queer film festival and culture week"
  },
  {
    "name": "Mumbai Queer Pride March",
    "city": "mumbai",
    "description": "Annual Mumbai Pride visibility march and community gathering, historically connected with the Azaadi Mumbai Pride network. Dates and permissions can shift; verify current-year details.",
    "link": "https://mumbaipride.in/",
    "date": null,
    "start_date": null,
    "end_date": null,
    "location": "Mumbai, Maharashtra, India",
    "lat": 18.9647,
    "lng": 72.8258,
    "vibe": "annual pride march and public visibility"
  },
  {
    "name": "Gay Bombay Parties",
    "city": "mumbai",
    "description": "Recurring Gay Bombay social and party events at changing Mumbai venues, including large lounge nights, community meetups and social-first queer gatherings.",
    "link": "https://gaybombay.in/",
    "date": null,
    "start_date": null,
    "end_date": null,
    "location": "Mumbai, Maharashtra, India",
    "lat": 19.0760,
    "lng": 72.8777,
    "vibe": "recurring community party and social nights"
  },
  {
    "name": "Gaysi Family Culture Events",
    "city": "mumbai",
    "description": "Queer culture, storytelling, zine, community and nightlife-adjacent events from Gaysi Family, with Mumbai as a key home base.",
    "link": "https://gaysifamily.com/",
    "date": null,
    "start_date": null,
    "end_date": null,
    "location": "Mumbai, Maharashtra, India",
    "lat": 19.0760,
    "lng": 72.8777,
    "vibe": "queer culture zine and community programming"
  },
  {
    "name": "Salvation Star Pop-Up Parties",
    "city": "mumbai",
    "description": "Mumbai queer pop-up party series known for dance, drag and themed club nights at changing venues. Check the official social feed for current dates.",
    "link": "https://www.instagram.com/salvationstar.in/",
    "date": null,
    "start_date": null,
    "end_date": null,
    "location": "Mumbai, Maharashtra, India",
    "lat": 19.0760,
    "lng": 72.8777,
    "vibe": "queer pop-up dance and drag parties"
  },
  {
    "name": "The Gay Gaze Bombay Nights",
    "city": "mumbai",
    "description": "Queer nightlife and social events in Mumbai, including party, drag and mixer formats at rotating venues. Verify the current calendar through the organizer.",
    "link": "https://www.instagram.com/thegaygazebombay/",
    "date": null,
    "start_date": null,
    "end_date": null,
    "location": "Mumbai, Maharashtra, India",
    "lat": 19.0760,
    "lng": 72.8777,
    "vibe": "rotating queer nightlife and social events"
  }
]
$qa_events$) as e(
    name text, city text, description text, link text,
    date date, start_date date, end_date date,
    location text, lat numeric, lng numeric, vibe text
  )
)
insert into public.events (
  name, city, description, link, date, start_date, end_date,
  location, lat, lng, vibe, vibe_tags
)
select
  name, city, description, nullif(link, ''), date, start_date, end_date,
  location, lat, lng, vibe, array[]::text[]
from source_events se
where not exists (
  select 1
  from public.events e
  where lower(trim(e.city)) = lower(trim(se.city))
    and lower(trim(e.name)) = lower(trim(se.name))
);

with source_services as (
  select *
  from jsonb_to_recordset($qa_services$
[
  {
    "name": "The Humsafar Trust",
    "city": "mumbai",
    "type": "wellness",
    "provider_name": "The Humsafar Trust",
    "contact": "Use official website contact channels for current clinic, testing, counselling and support access.",
    "booking_link": "https://humsafar.org/",
    "description": "Long-running Mumbai-based LGBTQIA+ health, HIV prevention, counselling, advocacy and community support organization.",
    "hours": "Office and program hours vary; verify current service availability directly.",
    "link": "https://humsafar.org/",
    "location": "Manthan Plaza, Nehru Road, Vakola, Santacruz East, Mumbai, Maharashtra, India",
    "lat": 19.0817,
    "lng": 72.8525,
    "price_tier": "$",
    "vibe": "lgbtq health counselling advocacy and community support",
    "source": "The Humsafar Trust official website"
  },
  {
    "name": "Gay Bombay",
    "city": "mumbai",
    "type": "other",
    "provider_name": "Gay Bombay",
    "contact": "Use official website and event posts for current contact and booking details.",
    "booking_link": "https://gaybombay.in/",
    "description": "Mumbai LGBTQ community collective organizing social events, parties, meetups and community-led programming.",
    "hours": "Event-led; verify current event listings before attending.",
    "link": "https://gaybombay.in/",
    "location": "Mumbai, Maharashtra, India",
    "lat": 19.0760,
    "lng": 72.8777,
    "price_tier": "$$",
    "vibe": "community parties social meetups and local signal",
    "source": "Gay Bombay official website"
  },
  {
    "name": "Gaysi Family",
    "city": "mumbai",
    "type": "other",
    "provider_name": "Gaysi Family",
    "contact": "Use official website and social channels for current event and collaboration details.",
    "booking_link": "https://gaysifamily.com/",
    "description": "Queer media, culture and community platform with Mumbai-rooted events, storytelling, zines and cultural programming.",
    "hours": "Event and publication-led; verify current programming directly.",
    "link": "https://gaysifamily.com/",
    "location": "Mumbai, Maharashtra, India",
    "lat": 19.0760,
    "lng": 72.8777,
    "price_tier": "$",
    "vibe": "queer culture media events and storytelling",
    "source": "Gaysi Family official website"
  },
  {
    "name": "No Footprints Queer Day Out",
    "city": "mumbai",
    "type": "tour",
    "provider_name": "No Footprints",
    "contact": "Use official No Footprints booking channels for dates, private tours and current availability.",
    "booking_link": "https://www.nfpexplore.com/",
    "description": "Queer Mumbai walking-tour signal from No Footprints, useful for history, culture and city context beyond nightlife.",
    "hours": "Tour-led; dates and timings vary by booking.",
    "link": "https://www.nfpexplore.com/",
    "location": "Mumbai, Maharashtra, India",
    "lat": 18.9322,
    "lng": 72.8311,
    "price_tier": "$$",
    "vibe": "queer history and city storytelling tour",
    "source": "No Footprints official website"
  },
  {
    "name": "KASHISH Arts Foundation",
    "city": "mumbai",
    "type": "other",
    "provider_name": "KASHISH Arts Foundation",
    "contact": "Use official festival website for current submissions, passes, venues and volunteer information.",
    "booking_link": "https://mumbaiqueerfest.com/",
    "description": "Organization behind KASHISH Mumbai International Queer Film Festival and queer cinema programming.",
    "hours": "Festival-led; verify annual schedule directly.",
    "link": "https://mumbaiqueerfest.com/",
    "location": "Mumbai, Maharashtra, India",
    "lat": 19.0760,
    "lng": 72.8777,
    "price_tier": "$$",
    "vibe": "queer film festival and arts programming",
    "source": "KASHISH Mumbai Queer Film Festival official website"
  },
  {
    "name": "Salvation Star",
    "city": "mumbai",
    "type": "other",
    "provider_name": "Salvation Star",
    "contact": "Use official social channels for current party announcements and ticket links.",
    "booking_link": "https://www.instagram.com/salvationstar.in/",
    "description": "Mumbai queer party organizer connected with rotating pop-up dance, drag and themed nights.",
    "hours": "Event-led; check current social posts before planning.",
    "link": "https://www.instagram.com/salvationstar.in/",
    "location": "Mumbai, Maharashtra, India",
    "lat": 19.0760,
    "lng": 72.8777,
    "price_tier": "$$",
    "vibe": "queer pop-up parties and drag nightlife",
    "source": "Salvation Star official social channel"
  },
  {
    "name": "The Gay Gaze Bombay",
    "city": "mumbai",
    "type": "other",
    "provider_name": "The Gay Gaze Bombay",
    "contact": "Use official social channels for current events and ticket details.",
    "booking_link": "https://www.instagram.com/thegaygazebombay/",
    "description": "Mumbai queer event organizer with rotating nightlife, drag, mixer and community-social formats.",
    "hours": "Event-led; check current social posts before planning.",
    "link": "https://www.instagram.com/thegaygazebombay/",
    "location": "Mumbai, Maharashtra, India",
    "lat": 19.0760,
    "lng": 72.8777,
    "price_tier": "$$",
    "vibe": "rotating queer nightlife and social events",
    "source": "The Gay Gaze Bombay official social channel"
  }
]
$qa_services$) as s(
    name text, city text, type text, provider_name text, contact text,
    booking_link text, description text, hours text, link text,
    location text, lat numeric, lng numeric, price_tier text,
    vibe text, source text
  )
)
insert into public.services (
  name, city, type, provider_name, contact, booking_link, description,
  hours, link, image_urls, location, lat, lng, price_tier, vibe,
  vibe_tags, source, "lastChecked", verified
)
select
  name, city, type, provider_name, contact, nullif(booking_link, ''),
  description, hours, nullif(link, ''), array[]::text[], location, lat, lng,
  price_tier, vibe, array[]::text[], source, '2026-06-21'::date, true
from source_services ss
where not exists (
  select 1
  from public.services s
  where lower(trim(s.city)) = lower(trim(ss.city))
    and lower(trim(s.name)) = lower(trim(ss.name))
);

commit;

select 'places' as category, count(*) as total
from public.places
where lower(trim(city)) = 'mumbai'

union all

select 'events', count(*)
from public.events
where lower(trim(city)) = 'mumbai'

union all

select 'services', count(*)
from public.services
where lower(trim(city)) = 'mumbai';
