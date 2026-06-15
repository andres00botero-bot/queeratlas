-- Queer Atlas: Belfast city package
-- Verified 2026-06-15.
-- Safe to run multiple times.
--
-- Adds or refreshes:
-- - 14 active venues
-- - 3 verified 2026 events
-- - 3 verified community and health services
-- - Duplicate cleanup restricted to Belfast records
--
-- OUTSIDE Sauna is intentionally excluded because it was reported closed
-- on 2026-01-28. No active dedicated gay sauna could be verified.

begin;

with new_places (
  name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng
) as (
  values
    (
      'Union Street Bar',
      'belfast',
      'bar',
      'One of Belfast''s main LGBTQ+ anchors, set in a converted Victorian shoe factory with food, cocktails, a relaxed Green Room and the event-led Shoe Factory space. It works as an early drink, a full evening, or the place where a sensible plan quietly stops being sensible.',
      'large Rainbow Quarter bar with food, drag and cabaret',
      array['drag','social','cozy']::text[],
      'Mon-Tue closed; Wed 17:00-01:00; Thu-Fri 17:00-01:30; Sat 12:00-01:30; Sun 13:00-01:00. Verify same-day programming.',
      'https://www.unionstreetbar.com/',
      '8-14 Union Street, Belfast BT1, United Kingdom',
      54.603920,
      -5.931580
    ),
    (
      'The Maverick',
      'belfast',
      'bar',
      'A central Rainbow Quarter bar known for approachable staff, drag, karaoke, DJs and recurring entertainment. Maverick is one of the easiest Belfast venues to enter alone because the room feels social before it feels performative.',
      'friendly seven-night queer lounge with drag and karaoke',
      array['drag','social','pop']::text[],
      'Mon-Fri 17:00-01:00; Sat 14:00-01:00; Sun 14:00-00:00.',
      'https://www.themaverickbelfast.com/',
      '1 Union Street, Belfast BT1 2JK, United Kingdom',
      54.604100,
      -5.931400
    ),
    (
      'Kremlin',
      'belfast',
      'club',
      'Belfast''s best-known LGBTQ+ nightclub spreads the night across three themed rooms with DJs, cabaret, drag and commercial dance energy. It is the clearest choice when the plan requires a proper club rather than another beautifully intentioned pint.',
      'multi-room queer nightclub with drag, pop and late DJs',
      array['pop','drag','massive']::text[],
      'Mon 22:00-02:30; Tue 21:00-02:30; Wed closed; Thu 22:00-02:30; Fri-Sat 21:00-03:00; Sun 21:00-02:30.',
      'https://www.kremlin-belfast.com/',
      '96 Donegall Street, Belfast BT1 2GW, United Kingdom',
      54.601522,
      -5.928345
    ),
    (
      'Boombox Belfast',
      'belfast',
      'club',
      'A compact queer dance club on Donegall Street with rotating themed nights, drag guests, pop, DJs and a crowd that gets livelier as the weekend advances. Boombox is useful when you want the night direct, bright and unapologetically dance-led.',
      'busy queer dance club with themed pop and drag nights',
      array['pop','drag','social']::text[],
      'Mon 22:00-02:30; Tue closed; Wed-Thu 22:00-02:30; Fri-Sat 22:00-03:00; Sun 22:00-02:30.',
      'https://www.instagram.com/boomboxbelfast/',
      '108 Donegall Street, Belfast BT1, United Kingdom',
      54.601523,
      -5.928346
    ),
    (
      'Muriel''s Cafe Bar',
      'belfast',
      'bar',
      'An inclusive Cathedral Quarter bar known for gin, cocktails, playful ceiling decor and an easy local-tourist mix. Muriel''s is less explicitly clubby than Union Street, which makes it a useful queer-friendly bridge between dinner and the louder Rainbow Quarter.',
      'quirky inclusive gin bar with cocktails and all-day food',
      array['mixed','cozy','social']::text[],
      'Mon-Sat 12:00-01:00; Sun 12:00-00:00.',
      'https://www.murielscafebar.co.uk/',
      '12-14 Church Lane, Belfast BT1, United Kingdom',
      54.600070,
      -5.925350
    ),
    (
      'The Spaniard',
      'belfast',
      'bar',
      'A small, eccentric and welcoming Cathedral Quarter bar with a strong rum list and enough personality to make one drink feel like a location choice rather than an administrative task. It is a mixed venue, but consistently useful for queer travelers building a wider Belfast night.',
      'tiny welcoming Cathedral Quarter rum and cocktail bar',
      array['mixed','cozy','social']::text[],
      'Mon-Sat 12:00-01:00; Sun 12:00-00:00.',
      'https://www.instagram.com/thespaniardbar/',
      '3 Skipper Street, Belfast BT1, United Kingdom',
      54.600990,
      -5.925620
    ),
    (
      'Paperxclips Books',
      'belfast',
      'cafe',
      'A queer-owned North Street hybrid combining coffee, books, barbering, gifts and community activity. Paperxclips gives Belfast an important daytime queer address where the point is connection and culture rather than waiting for nightlife to begin.',
      'queer-owned coffee, books, barbering and community culture',
      array['cultural','cozy','social']::text[],
      'Daytime opening hours vary; verify on the official social channels before visiting.',
      'https://www.instagram.com/paperxclipsbooks/',
      '162 North Street, Belfast BT1, United Kingdom',
      54.602700,
      -5.933927
    ),
    (
      'Spaghetti Arms',
      'belfast',
      'cafe',
      'An LGBTQ-owned food spot at the Union Street complex serving a flexible mix of Italian comfort food and more casual late-day options. Its location makes it especially practical when the group needs dinner without abandoning the queer quarter''s orbit.',
      'LGBTQ-owned Italian kitchen beside Union Street nightlife',
      array['mixed','cozy','social']::text[],
      'Food service and hatch hours vary with the Union Street programme; check current listings.',
      'https://www.unionstreetbar.com/',
      '8 Union Street, Belfast BT1, United Kingdom',
      54.603920,
      -5.931580
    ),
    (
      'Queen''s Cafe Bar',
      'belfast',
      'cafe',
      'A polished daytime cafe-bar in Queen''s Arcade with local produce, wine and cocktails. It is a softer mixed-space option for lunch or an early drink when a full Rainbow Quarter launch would be emotionally premature.',
      'gay-popular Victorian arcade cafe with wine and cocktails',
      array['mixed','cozy','chill']::text[],
      'Mon-Sat 11:30-17:00; Sun closed. Verify current hours.',
      'https://www.travelgay.com/belfast-gay-bars',
      '4 Queen''s Arcade, Belfast BT1, United Kingdom',
      54.599350,
      -5.929830
    ),
    (
      'The Flint',
      'belfast',
      'hotel',
      'A central suite-style hotel with king beds, kitchen options and enough living space to make a short stay feel less compressed. The Flint is well placed for City Hall, the Linen Quarter and a walk to Belfast''s queer nightlife.',
      'central aparthotel suites with independent city-base energy',
      array['cozy','chill','social']::text[],
      'Hotel open daily; reception and booking services operate every day.',
      'https://theflinthotel.com/',
      '48 Howard Street, Belfast BT1 6PG, United Kingdom',
      54.595640,
      -5.933440
    ),
    (
      'Grand Central Hotel Belfast',
      'belfast',
      'hotel',
      'A polished city-centre hotel in the Linen Quarter, best known for the Observatory cocktail bar high above Belfast. It suits travelers who want full-service comfort, strong views and nightlife within a manageable walk or short ride.',
      'high-rise city luxury with a panoramic cocktail bar',
      array['luxury','chill','social']::text[],
      'Hotel open daily; reception operates 24 hours.',
      'https://www.hastingshotels.com/grand-central/',
      '9-15 Bedford Street, Belfast BT2 7FF, United Kingdom',
      54.595170,
      -5.932100
    ),
    (
      'The Merchant Hotel',
      'belfast',
      'hotel',
      'A five-star landmark in a former bank, combining Victorian drama, Art Deco rooms, dining and polished service in the Cathedral Quarter. The Merchant is the maximalist choice for travelers who prefer their Belfast base with architecture and a proper entrance.',
      'opulent Cathedral Quarter landmark with historic glamour',
      array['luxury','cultural','chill']::text[],
      'Hotel open daily; reception operates 24 hours.',
      'https://www.themerchanthotel.com/',
      '16 Skipper Street, Belfast BT1 2DZ, United Kingdom',
      54.600990,
      -5.925620
    ),
    (
      'Bullitt Hotel',
      'belfast',
      'hotel',
      'A lively design hotel near Church Lane with a courtyard, bars and rooftop dining. Bullitt is a strong middle ground between boutique style and practical access to both the Cathedral Quarter and Belfast''s core queer venues.',
      'design-forward Cathedral Quarter base with rooftop energy',
      array['cozy','social','chill']::text[],
      'Hotel open daily; reception operates 24 hours.',
      'https://bullitthotel.com/',
      '40a Church Lane, Belfast BT1 4QN, United Kingdom',
      54.599720,
      -5.924720
    ),
    (
      'The Fitzwilliam Hotel Belfast',
      'belfast',
      'hotel',
      'A welcoming five-star hotel beside the Grand Opera House with stylish rooms, a restaurant, cocktail bar and a 24-hour front desk. It is central enough for sightseeing and close enough to the Rainbow Quarter to keep late-night logistics simple.',
      'five-star city-centre comfort near theatre and nightlife',
      array['luxury','chill','cultural']::text[],
      'Hotel open daily; reception operates 24 hours.',
      'https://www.fitzwilliamhotelbelfast.com/',
      '1 Great Victoria Street, Belfast BT2 7BQ, United Kingdom',
      54.593201,
      -5.934232
    )
),
updated as (
  update public.places p
  set
    type = np.type,
    description = np.description,
    vibe = np.vibe,
    vibe_tags = np.vibe_tags,
    hours = np.hours,
    link = np.link,
    location = np.location,
    lat = np.lat,
    lng = np.lng
  from new_places np
  where lower(trim(p.city)) = lower(trim(np.city))
    and lower(trim(p.name)) = lower(trim(np.name))
  returning p.id
)
insert into public.places (
  name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng
)
select
  np.name, np.city, np.type, np.description, np.vibe, np.vibe_tags,
  np.hours, np.link, np.location, np.lat, np.lng
from new_places np
where not exists (
  select 1
  from public.places p
  where lower(trim(p.city)) = lower(trim(np.city))
    and lower(trim(p.name)) = lower(trim(np.name))
);

with new_events (
  name, city, description, link, date, start_date, end_date,
  location, lat, lng, vibe, vibe_tags
) as (
  values
    (
      'Belfast Pride Festival 2026',
      'belfast',
      'Belfast Pride''s 35th anniversary season runs for ten days from 17 to 26 July, bringing more than 150 community, culture, nightlife and advocacy events across the city.',
      'https://belfastpride.com/',
      '2026-07-17'::date,
      '2026-07-17'::date,
      '2026-07-26'::date,
      'Belfast Pride Centre, 109-113 Royal Avenue, Belfast BT1 1FF, United Kingdom',
      54.602360,
      -5.931010,
      'ten-day citywide Pride season and 35th anniversary',
      array['festival','cultural','social']::text[]
    ),
    (
      'Trans Dudes with Lady Cancer Screening and Q&A',
      'belfast',
      'A Pride-season screening at Queen''s Film Theatre on 18 July at 18:00, followed by an in-person filmmaker Q&A about trans masculine experiences and the need for inclusive cancer care.',
      'https://www.rainbow-project.org/event/trans-dudes-with-lady-cancer-film-screening-filmmaker-qa/',
      '2026-07-18'::date,
      '2026-07-18'::date,
      '2026-07-18'::date,
      'Queen''s Film Theatre, 20 University Square, Belfast BT7 1PA, United Kingdom',
      54.585480,
      -5.933860,
      'trans film, healthcare conversation and filmmaker Q&A',
      array['cultural','social','chill']::text[]
    ),
    (
      'Belfast Pride Parade 2026',
      'belfast',
      'The centrepiece Pride parade leaves at 13:00 on 25 July after an 11:30 build-up. The city''s largest cross-community parade combines public celebration, protest, solidarity and a major display of LGBTQIA+ life.',
      'https://belfastpride.com/parade-route/',
      '2026-07-25'::date,
      '2026-07-25'::date,
      '2026-07-25'::date,
      'Central Belfast, Belfast, United Kingdom',
      54.597266,
      -5.930559,
      'major cross-community Pride parade and public protest',
      array['festival','cultural','social']::text[]
    )
),
updated as (
  update public.events e
  set
    description = ne.description,
    link = ne.link,
    date = ne.date,
    start_date = ne.start_date,
    end_date = ne.end_date,
    location = ne.location,
    lat = ne.lat,
    lng = ne.lng,
    vibe = ne.vibe,
    vibe_tags = ne.vibe_tags
  from new_events ne
  where lower(trim(e.city)) = lower(trim(ne.city))
    and lower(trim(e.name)) = lower(trim(ne.name))
  returning e.id
)
insert into public.events (
  name, city, description, link, date, start_date, end_date,
  location, lat, lng, vibe, vibe_tags
)
select
  ne.name, ne.city, ne.description, ne.link, ne.date, ne.start_date,
  ne.end_date, ne.location, ne.lat, ne.lng, ne.vibe, ne.vibe_tags
from new_events ne
where not exists (
  select 1
  from public.events e
  where lower(trim(e.city)) = lower(trim(ne.city))
    and lower(trim(e.name)) = lower(trim(ne.name))
);

with new_services (
  name, city, type, provider_name, contact, booking_link, description,
  hours, link, image_urls, location, lat, lng, price_tier, vibe,
  vibe_tags, source, "lastChecked", verified
) as (
  values
    (
      'The Rainbow Project Belfast',
      'belfast',
      'wellness',
      'The Rainbow Project',
      '028 9031 9030; info@rainbow-project.org',
      'https://www.rainbow-project.org/contact-us/',
      'Northern Ireland''s major LGBTQIA+ health and equality charity provides counselling, sexual-health support and testing pathways, family support, youth services, hate-crime support, trans and non-binary resources, group work and advocacy.',
      'Office, appointment and programme hours vary; contact the Belfast office before visiting.',
      'https://www.rainbow-project.org/',
      array[]::text[],
      '23-31 Waring Street, Belfast BT1 2DX, United Kingdom',
      54.601410,
      -5.925701,
      '$',
      'LGBTQIA+ health, counselling, sexual health and advocacy',
      array['chill','social','relax']::text[],
      'The Rainbow Project official website',
      '2026-06-15'::date,
      true
    ),
    (
      'Belfast Pride Centre',
      'belfast',
      'other',
      'Belfast Pride',
      '028 9023 2447; info@belfastpride.com',
      'https://belfastpride.com/contact-us/',
      'The operational home of Belfast Pride coordinates the annual festival, parade, Pride Village, awards, volunteering and community participation. It is the clearest official contact point for accessibility, event and festival information.',
      'Centre and festival-team availability varies; email is recommended, especially during July.',
      'https://belfastpride.com/',
      array[]::text[],
      '109-113 Royal Avenue, Belfast BT1 1FF, United Kingdom',
      54.602360,
      -5.931010,
      '$',
      'Pride information, community events, volunteering and accessibility',
      array['festival','social','cultural']::text[],
      'Belfast Pride official website',
      '2026-06-15'::date,
      true
    ),
    (
      'Cara-Friend LGBTQIA+ Support',
      'belfast',
      'other',
      'Cara-Friend',
      '028 9089 0202; admin@cara-friend.org.uk',
      'https://www.cara-friend.org.uk/contact/',
      'A long-running Northern Ireland LGBTQIA+ charity offering youth support, community development, education, training and practical information. Its Belfast work includes dedicated support for young people and stronger inclusion across schools and community settings.',
      'Office and programme hours vary; contact the team before visiting. Lifeline provides separate 24-hour crisis support on 0808 808 8000.',
      'https://www.cara-friend.org.uk/',
      array[]::text[],
      'Belfast LGBTQI+ Centre, 23-31 Waring Street, Belfast BT1 2DX, United Kingdom',
      54.601410,
      -5.925701,
      '$',
      'youth support, community development, education and inclusion',
      array['social','cultural','relax']::text[],
      'Cara-Friend official website',
      '2026-06-15'::date,
      true
    )
),
updated as (
  update public.services s
  set
    type = ns.type,
    provider_name = ns.provider_name,
    contact = ns.contact,
    booking_link = ns.booking_link,
    description = ns.description,
    hours = ns.hours,
    link = ns.link,
    image_urls = ns.image_urls,
    location = ns.location,
    lat = ns.lat,
    lng = ns.lng,
    price_tier = ns.price_tier,
    vibe = ns.vibe,
    vibe_tags = ns.vibe_tags,
    source = ns.source,
    "lastChecked" = ns."lastChecked",
    verified = ns.verified
  from new_services ns
  where lower(trim(s.city)) = lower(trim(ns.city))
    and lower(trim(s.name)) = lower(trim(ns.name))
  returning s.id
)
insert into public.services (
  name, city, type, provider_name, contact, booking_link, description,
  hours, link, image_urls, location, lat, lng, price_tier, vibe,
  vibe_tags, source, "lastChecked", verified
)
select
  ns.name, ns.city, ns.type, ns.provider_name, ns.contact, ns.booking_link,
  ns.description, ns.hours, ns.link, ns.image_urls, ns.location, ns.lat,
  ns.lng, ns.price_tier, ns.vibe, ns.vibe_tags, ns.source,
  ns."lastChecked", ns.verified
from new_services ns
where not exists (
  select 1
  from public.services s
  where lower(trim(s.city)) = lower(trim(ns.city))
    and lower(trim(s.name)) = lower(trim(ns.name))
);

with ranked as (
  select
    id,
    row_number() over (
      partition by lower(trim(city)), lower(trim(name))
      order by id
    ) as duplicate_rank
  from public.places
  where lower(trim(city)) = 'belfast'
)
delete from public.places p
using ranked r
where p.id = r.id
  and r.duplicate_rank > 1;

with ranked as (
  select
    id,
    row_number() over (
      partition by lower(trim(city)), lower(trim(name))
      order by id
    ) as duplicate_rank
  from public.events
  where lower(trim(city)) = 'belfast'
)
delete from public.events e
using ranked r
where e.id = r.id
  and r.duplicate_rank > 1;

with ranked as (
  select
    id,
    row_number() over (
      partition by lower(trim(city)), lower(trim(name))
      order by id
    ) as duplicate_rank
  from public.services
  where lower(trim(city)) = 'belfast'
)
delete from public.services s
using ranked r
where s.id = r.id
  and r.duplicate_rank > 1;

commit;

select 'places' as category, count(*) as total
from public.places
where lower(trim(city)) = 'belfast'

union all

select 'events', count(*)
from public.events
where lower(trim(city)) = 'belfast'

union all

select 'services', count(*)
from public.services
where lower(trim(city)) = 'belfast';
