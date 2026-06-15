-- Queer Atlas: Johannesburg city package
-- Verified 2026-06-15.
-- Safe to run multiple times.
--
-- Adds or refreshes:
-- - 14 active venues
-- - 5 official 2026 Pride of Africa events
-- - 3 verified community, archive, and Pride services
-- - Duplicate cleanup restricted to Johannesburg records
--
-- Restaurants and food venues intentionally use the database type "cafe".
-- Closed venues such as Beefcakes, Great Dane, People Like Us,
-- The Gay Club SA, and The Third Place are intentionally excluded.

begin;

with new_places (
  name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng
) as (
  values
    (
      'Ratz Bar',
      'johannesburg',
      'bar',
      'An established gay bar on Melville''s 7th Street with pop-heavy music, themed cocktails and an easy pre-club atmosphere. It is compact, friendly and one of Johannesburg''s clearest starting points for a recognizably queer night.',
      'compact Melville gay bar with pop, cocktails and pre-drink energy',
      array['drag','pop','social']::text[],
      'Daily 16:00-02:00.',
      'https://www.ratzbar.co.za/',
      '9 7th Street, Melville, Johannesburg, Gauteng 2092, South Africa',
      -26.194193,
      28.015783
    ),
    (
      'Liquid Blue',
      'johannesburg',
      'bar',
      'An LGBTQ-popular mixed bar with especially strong support from Johannesburg''s queer POC community. Thursdays draw students, weekends build queues and the late schedule makes it a practical continuation after an earlier Melville drink.',
      'POC-popular Melville bar with late crowds and student Thursdays',
      array['mixed','pop','social']::text[],
      'Daily until approximately 03:00; arrive before 23:00 on busy weekends and verify same-day hours.',
      'https://www.facebook.com/profile.php?id=100069415140884',
      '8 7th Street, Melville, Johannesburg, Gauteng 2092, South Africa',
      -26.194430,
      28.015620
    ),
    (
      'Kitchener''s Carvery Bar',
      'johannesburg',
      'bar',
      'One of Johannesburg''s oldest bars and an important mixed queer-friendly room in Braamfontein, known for recurring parties, women-focused nights, DJs and student Wednesdays. Programming changes, but the crowd regularly includes the city''s queer creative community.',
      'historic Braamfontein bar with queer parties and student nights',
      array['cultural','social','underground']::text[],
      'Mon-Tue and Thu-Sat 11:00-04:00; Wed 11:00-02:00; Sun 11:00-00:00. Event access may vary.',
      'https://kitcheners.co.za/',
      'Corner Juta and De Beer Streets, Braamfontein, Johannesburg, Gauteng 2001, South Africa',
      -26.193203,
      28.034691
    ),
    (
      'Babylon The Joburg Bar',
      'johannesburg',
      'club',
      'Johannesburg''s leading large LGBTQ+ nightclub combines commercial pop, drag performers, dancers, VIP booths and an inclusive crowd. The Illovo location and very late weekend finish make it the city''s most direct full-scale gay club option.',
      'large Illovo gay club with commercial pop, drag and dancers',
      array['pop','drag','massive']::text[],
      'Fri-Sat 20:00-06:00; closed Sun-Thu except announced events.',
      'https://babylonbar.co.za/',
      '198 Oxford Road, Illovo, Sandton, Johannesburg, Gauteng 2196, South Africa',
      -26.130588,
      28.049882
    ),
    (
      'The Tennis Club',
      'johannesburg',
      'club',
      'A mixed event venue in the Ellis Park complex that regularly attracts a visible queer crowd for drag balls, electronic parties and special event nights. It is event-led rather than a conventional seven-night club, so checking the programme is essential.',
      'event-led New Doornfontein club with a queer creative crowd',
      array['electronic','underground','social']::text[],
      'Usually Fri 20:00-03:00; special events may use different days and times.',
      'https://www.facebook.com/thetennisclubjhb/',
      'Corner Bertram and Miller Streets, New Doornfontein, Johannesburg, Gauteng 2094, South Africa',
      -26.198107,
      28.063083
    ),
    (
      'The Rec Room',
      'johannesburg',
      'sauna',
      'Johannesburg''s dedicated gay sauna offers steam, Jacuzzi, showers, a bar, video lounge, private cabins and maze areas for men. The Randburg venue stays open particularly late on Friday and Saturday nights.',
      'men-only Randburg sauna with steam, Jacuzzi, cabins and maze areas',
      array['men_only','relax','cruise']::text[],
      'Sun-Thu 12:00-00:00; Fri-Sat 12:00-07:00. Verify current hours before travel.',
      'https://nomadicboys.com/gay-johannesburg/',
      'Shop 1, Phoenix Centre, Malibongwe Drive and Tungsten Drive, Ferndale, Randburg, Gauteng 2194, South Africa',
      -26.098706,
      27.986757
    ),
    (
      'The Factory',
      'johannesburg',
      'cruise_club',
      'A men-only indoor cruise venue in New Doornfontein with themed masked, boot, fetish and incognito nights. The focus is explicitly adults-only and event information is published through the venue''s social channel.',
      'men-only Doornfontein cruise club with themed fetish nights',
      array['men_only','fetish','cruise']::text[],
      'Mon-Wed 12:00-03:00; Thu-Sun 12:00-06:00. Check the current event schedule.',
      'https://x.com/The_Factory_Bar',
      '6 6th Street, New Doornfontein, Johannesburg, Gauteng, South Africa',
      -26.193175,
      28.061311
    ),
    (
      'Marble Restaurant',
      'johannesburg',
      'cafe',
      'A polished queer-friendly Rosebank restaurant built around open-fire cooking, a dramatic bar and broad Johannesburg skyline views. It works equally well for a destination dinner or an elevated cocktail before nightlife in Illovo.',
      'Rosebank open-fire dining with skyline cocktails',
      array['luxury','social','chill']::text[],
      'Open for lunch and dinner daily; check the official site for current sitting times.',
      'https://marble.restaurant/',
      'Trumpet on Keyes, Corner Keyes and Jellicoe Avenue, Rosebank, Johannesburg, Gauteng, South Africa',
      -26.143337,
      28.036461
    ),
    (
      'Pablo Dos Manos',
      'johannesburg',
      'cafe',
      'The restaurant at Pablo House combines breakfast, coffee, pizza, cocktails and wide northern views close to Melville''s gay bars. Its relaxed ridge setting makes it useful for both a slow daytime meal and dinner before Ratz or Liquid Blue.',
      'Melville ridge restaurant with breakfast, pizza and views',
      array['cozy','chill','social']::text[],
      'Daily hotel restaurant service; verify current meal sittings and reservation availability.',
      'https://pablohouse.co.za/',
      '3 4th Avenue, Melville, Johannesburg, Gauteng 2109, South Africa',
      -26.175702,
      28.004924
    ),
    (
      'The Grillhouse Rosebank',
      'johannesburg',
      'cafe',
      'A long-running queer-friendly Rosebank steakhouse with dependable service, a classic dining room and Katzy''s live-music bar attached. It is a practical group-dinner choice with cocktails and entertainment available in the same complex.',
      'classic Rosebank steakhouse with cocktails and live music',
      array['cozy','social','cultural']::text[],
      'Daily 12:00-21:00; Katzy''s Live opens Thu-Sat from 19:00. Verify holiday hours.',
      'https://thegrillhouse.co.za/',
      'The Firs Centre, Corner Oxford and Biermann Avenue, Rosebank, Johannesburg, Gauteng, South Africa',
      -26.143274,
      28.042307
    ),
    (
      'Yeoville Dinner Club',
      'johannesburg',
      'cafe',
      'Chef Sanza Sandile''s reservation-only communal table combines Pan-African food, migration stories and Johannesburg neighborhood culture. This is a hosted cultural dinner experience rather than a conventional walk-in restaurant.',
      'reservation-only Pan-African communal table',
      array['cultural','cozy','social']::text[],
      'Reservation-only dinner experiences; dates and times are confirmed during booking.',
      'https://www.yeovilledinnerclub.com/',
      '24 Rockey Street, Yeoville, Johannesburg, Gauteng 2198, South Africa',
      -26.181472,
      28.067635
    ),
    (
      'Home Suite Hotels Rosebank',
      'johannesburg',
      'hotel',
      'A welcoming boutique hotel with a rooftop pool, breakfast, coworking-friendly common areas and 24-hour security. Its position near Oxford Road gives straightforward access to Rosebank, Illovo, Sandton and Babylon.',
      'warm boutique Rosebank base with rooftop pool',
      array['cozy','chill','social']::text[],
      'Hotel open daily; reception and security operate 24 hours.',
      'https://homesuitehotels.com/rosebank/',
      '50 Bristol Road, Corner Oxford Road, Rosebank, Johannesburg, Gauteng, South Africa',
      -26.153567,
      28.044790
    ),
    (
      'Pablo House',
      'johannesburg',
      'hotel',
      'A small art-led boutique hotel overlooking the Melville Koppies with a restaurant, pool and quick access to Ratz Bar and Liquid Blue. It is the most convenient characterful base for travelers prioritizing Melville nightlife.',
      'bohemian Melville boutique hotel near the gay bars',
      array['cozy','cultural','chill']::text[],
      'Hotel open daily; confirm current check-in arrangements directly.',
      'https://pablohouse.co.za/',
      '3 4th Avenue, Melville, Johannesburg, Gauteng 2109, South Africa',
      -26.175702,
      28.004924
    ),
    (
      'Radisson RED Johannesburg Rosebank',
      'johannesburg',
      'hotel',
      'A contemporary Oxford Parks hotel with bright design, a rooftop pool, gym, restaurant and social public spaces. The location is useful for Rosebank, Illovo and Sandton while retaining the predictable services of a full hotel.',
      'modern Oxford Parks hotel with rooftop social energy',
      array['luxury','social','chill']::text[],
      'Hotel open daily; reception operates 24 hours.',
      'https://www.radissonhotels.com/en-us/hotels/radisson-red-johannesburg-rosebank',
      '4 Parks Boulevard, Oxford Parks, Dunkeld, Johannesburg, Gauteng 2196, South Africa',
      -26.141686,
      28.043050
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
      'Pride of Africa Month Kick-Off Pool Party 2026',
      'johannesburg',
      'Pride of Africa opens its October programme with an official social pool-party launch on 3 October. The organizer publishes the final Johannesburg venue and access details through its official channels.',
      'https://prideofafrica.org/',
      '2026-10-03'::date,
      '2026-10-03'::date,
      '2026-10-03'::date,
      'Johannesburg, venue announced by Pride of Africa, South Africa',
      -26.144650,
      28.041000,
      'official Pride month opening pool party',
      array['festival','social','cultural']::text[]
    ),
    (
      'Pride of Africa Drag Brunch 2026',
      'johannesburg',
      'An official Pride of Africa drag brunch on 10 October bringing food, performance and daytime queer celebration into Johannesburg''s Pride month programme. Check the organizer for final venue and booking details.',
      'https://prideofafrica.org/',
      '2026-10-10'::date,
      '2026-10-10'::date,
      '2026-10-10'::date,
      'Johannesburg, venue announced by Pride of Africa, South Africa',
      -26.144650,
      28.041000,
      'daytime Pride drag, food and performance',
      array['drag','festival','social']::text[]
    ),
    (
      'SCRT Venue ft Jagermeister 2026',
      'johannesburg',
      'Pride of Africa''s secret-venue event on 16 October combines art, music, fashion and queer self-expression at a Johannesburg address released to attendees by the organizer.',
      'https://prideofafrica.org/',
      '2026-10-16'::date,
      '2026-10-16'::date,
      '2026-10-16'::date,
      'Secret venue, Johannesburg, Gauteng, South Africa',
      -26.204100,
      28.047300,
      'secret-location queer art, fashion and music night',
      array['underground','electronic','social']::text[]
    ),
    (
      'Pride of Africa Queer Met Gala 2026',
      'johannesburg',
      'The seventh Queer Met Gala on 24 October celebrates African queer excellence through high fashion, bold identity and unapologetic glamour as part of the official Pride of Africa programme.',
      'https://prideofafrica.org/',
      '2026-10-24'::date,
      '2026-10-24'::date,
      '2026-10-24'::date,
      'Johannesburg, venue announced by Pride of Africa, South Africa',
      -26.144650,
      28.041000,
      'African queer fashion, identity and gala glamour',
      array['cultural','luxury','social']::text[]
    ),
    (
      'Johannesburg Pride 2026',
      'johannesburg',
      'One of Africa''s oldest and largest Pride celebrations marks 37 years with a major Sandton gathering on 31 October. Pride of Africa brings public visibility, community, performance and celebration to Katherine Street.',
      'https://prideofafrica.org/',
      '2026-10-31'::date,
      '2026-10-31'::date,
      '2026-10-31'::date,
      'Katherine Street, Sandton CBD, Johannesburg, Gauteng, South Africa',
      -26.110804,
      28.057193,
      'major African Pride gathering in Sandton',
      array['festival','social','cultural']::text[]
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
      'GALA Queer Archive',
      'johannesburg',
      'other',
      'GALA Queer Archive',
      '+27 11 717 4239; shaun.nzanzana@wits.ac.za',
      'https://gala.co.za/about/contact-us/',
      'GALA preserves and makes accessible a major archive of LGBTQIA+ histories from South Africa and the wider African continent. Its collections, exhibitions, education and research work make it an essential cultural resource for understanding Johannesburg beyond nightlife.',
      'Archive visits and research access are by appointment; contact GALA before visiting.',
      'https://gala.co.za/',
      array[]::text[],
      '7th Floor, Es''kia Mphahlele Building, Wits University, Corner Jorissen and Bertha Streets, Braamfontein, Johannesburg, Gauteng, South Africa',
      -26.192000,
      28.030000,
      '$',
      'African LGBTQIA+ archive, research, exhibitions and education',
      array['cultural','social','cozy']::text[],
      'GALA Queer Archive official website',
      '2026-06-15'::date,
      true
    ),
    (
      'Forum for Empowerment of Women',
      'johannesburg',
      'other',
      'Forum for Empowerment of Women',
      '+27 11 403 1906; +27 11 403 1907',
      'http://few.org.za/',
      'A Johannesburg-based organization focused on the safety, dignity and empowerment of Black lesbian women. FEW''s work has included advocacy, community development, sport, public education and the organization of Soweto Pride.',
      'Office and programme hours are not reliably published; contact the organization and verify availability before visiting.',
      'http://few.org.za/',
      array[]::text[],
      '87 De Korte Street, Braamfontein, Johannesburg, Gauteng 2001, South Africa',
      -26.193540,
      28.035922,
      '$',
      'Black lesbian advocacy, empowerment, community and Soweto Pride',
      array['cultural','social','relax']::text[],
      'Forum for Empowerment of Women official website',
      '2026-06-15'::date,
      true
    ),
    (
      'Pride of Africa LGBTQ+ Foundation',
      'johannesburg',
      'other',
      'Pride of Africa LGBTQ+ Foundation',
      '+27 69 695 4671; official Facebook and Instagram channels',
      'https://prideofafrica.org/',
      'The organization behind Johannesburg Pride coordinates the annual October programme, public celebration, community partnerships, volunteering and event communication. It is the primary official contact for Johannesburg Pride dates, venue announcements and participation.',
      'Organizer availability varies throughout the year; use the official site and social channels before visiting or attending.',
      'https://prideofafrica.org/',
      array[]::text[],
      'Katherine Street, Sandton CBD, Johannesburg, Gauteng, South Africa',
      -26.110804,
      28.057193,
      '$',
      'Johannesburg Pride information, events, partnerships and community',
      array['festival','social','cultural']::text[],
      'Pride of Africa official website',
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

-- Remove accidental duplicate copies while retaining the oldest row for
-- each normalized Johannesburg name.
with ranked as (
  select
    id,
    row_number() over (
      partition by lower(trim(city)), lower(trim(name))
      order by id
    ) as duplicate_rank
  from public.places
  where lower(trim(city)) = 'johannesburg'
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
  where lower(trim(city)) = 'johannesburg'
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
  where lower(trim(city)) = 'johannesburg'
)
delete from public.services s
using ranked r
where s.id = r.id
  and r.duplicate_rank > 1;

commit;

select 'places' as category, count(*) as total
from public.places
where lower(trim(city)) = 'johannesburg'

union all

select 'events', count(*)
from public.events
where lower(trim(city)) = 'johannesburg'

union all

select 'services', count(*)
from public.services
where lower(trim(city)) = 'johannesburg';
