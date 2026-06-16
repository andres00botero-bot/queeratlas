-- Queer Atlas: Sarajevo city package
-- Verified 2026-06-16.
-- Safe to run multiple times.
--
-- Adds or refreshes:
-- - 14 venues
-- - 2 verified 2026 events
-- - 3 verified community services
-- - Duplicate cleanup restricted to Sarajevo records
--
-- Sarajevo has a small and partly underground queer scene. No active
-- dedicated gay sauna or cruise club could be verified for this package.

begin;

with new_places (
  name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng
) as (
  values
    (
      'The Loft Club Sarajevo',
      'sarajevo',
      'club',
      'One of the few Sarajevo nightlife venues repeatedly listed by LGBTQ+ travel guides as gay-popular. Expect a mixed late-night crowd, DJ-led weekends and a more discreet local scene than in larger European queer capitals.',
      'mixed late-night club with a gay-popular reputation',
      array['mixed','social','pop']::text[],
      'Nightclub hours vary by programme; verify the current night on social channels before going.',
      'https://www.travelgay.com/venue/the-loft-club-sarajevo',
      'Mula Mustafe Baseskije 6, Sarajevo 71000, Bosnia and Herzegovina',
      43.859300,
      18.426000
    ),
    (
      'The Bar Sarajevo',
      'sarajevo',
      'bar',
      'A low-key gay-friendly bar on Hamdije Kresevljakovica, useful for a drink before Sarajevo''s later club rhythm begins. It is best treated as queer-friendly rather than a dedicated gay bar.',
      'relaxed gay-friendly bar for early drinks',
      array['mixed','cozy','social']::text[],
      'Usually evening-led; verify current opening before visiting.',
      'https://www.travelgay.com/venue/the-bar-sarajevo',
      'Hamdije Kresevljakovica, Sarajevo 71000, Bosnia and Herzegovina',
      43.856700,
      18.423500
    ),
    (
      'City Pub Sarajevo',
      'sarajevo',
      'bar',
      'A central mixed bar and live-music stop listed in gay Sarajevo guides. It works well as an easy, social starting point when you want something public, casual and close to the old-town walking routes.',
      'central mixed pub with live music and easy social energy',
      array['mixed','social','cozy']::text[],
      'Daily bar hours vary; check the current programme before going.',
      'https://www.travelgay.com/venue/city-pub-sarajevo',
      'Hadziristica, Sarajevo 71000, Bosnia and Herzegovina',
      43.859300,
      18.429500
    ),
    (
      'Pink Houdini',
      'sarajevo',
      'bar',
      'A small jazz and cocktail bar listed by LGBTQ+ travel guides for Sarajevo. The mood is more cultured and conversational than scene-heavy, making it a useful option for a gentler night out.',
      'small mixed jazz bar with cocktails and conversation',
      array['mixed','cultural','cozy']::text[],
      'Evening hours and music programming vary; verify same-day listings.',
      'https://www.travelgay.com/venue/pink-houdini',
      'Branilaca Sarajeva, Sarajevo 71000, Bosnia and Herzegovina',
      43.858500,
      18.421600
    ),
    (
      'Cinemas Sloga',
      'sarajevo',
      'club',
      'A long-running Sarajevo club and concert venue with a mixed crowd, live music and DJ nights. It is not a gay club, but it is one of the city''s more visible late-night anchors for visitors who want a lively mainstream room.',
      'large mixed concert club with late-night DJ energy',
      array['mixed','massive','social']::text[],
      'Programme-led; check the current event calendar and door times before going.',
      'https://www.instagram.com/cinemas_sloga/',
      'Mehmeda Spahe 20, Sarajevo 71000, Bosnia and Herzegovina',
      43.860100,
      18.421300
    ),
    (
      'Silver & Smoke',
      'sarajevo',
      'club',
      'A central electronic and underground music club with a mixed, culture-first crowd. It is a practical Sarajevo pick when the night needs techno, bass and a darker club atmosphere rather than a conventional gay bar.',
      'underground electronic club with a mixed crowd',
      array['electronic','underground','mixed']::text[],
      'Programme-led late nights; verify event times before visiting.',
      'https://www.instagram.com/silverandsmoke/',
      'Zelenih beretki 12, Sarajevo 71000, Bosnia and Herzegovina',
      43.858300,
      18.425500
    ),
    (
      'Zlatna Ribica',
      'sarajevo',
      'bar',
      'A theatrical, antique-filled cocktail bar that appears in queer Sarajevo travel writing as a camp, memorable and welcoming stop. Come for the room as much as the drink.',
      'quirky mixed cocktail bar with theatrical decor',
      array['mixed','cozy','cultural']::text[],
      'Usually afternoon to late evening; verify current daily hours before visiting.',
      'https://zlatnaribica.ba/',
      'Kaptol 5, Sarajevo 71000, Bosnia and Herzegovina',
      43.860600,
      18.421900
    ),
    (
      'Klopa',
      'sarajevo',
      'cafe',
      'A central all-day restaurant and cafe close to Ferhadija, useful for a relaxed meal between old-town walking, museums and nightlife. Listed here as cafe because the app stores restaurants and cafes under the cafe type.',
      'central all-day cafe and restaurant for easy meals',
      array['cozy','mixed','social']::text[],
      'Daily service; verify current kitchen hours before visiting.',
      'https://klopa.ba/',
      'Ferhadija 5, Sarajevo 71000, Bosnia and Herzegovina',
      43.859300,
      18.424400
    ),
    (
      'Ministry of Cejf',
      'sarajevo',
      'cafe',
      'A specialty coffee stop in the old town, good for slow mornings and planning the day before Sarajevo turns steeper, denser and more emotional than the map suggested.',
      'old-town specialty coffee cafe',
      array['cozy','chill','mixed']::text[],
      'Daytime cafe hours vary seasonally; verify before visiting.',
      'https://www.instagram.com/ministry_of_ceif/',
      'Kovaci 26, Sarajevo 71000, Bosnia and Herzegovina',
      43.861900,
      18.431500
    ),
    (
      'Kawa',
      'sarajevo',
      'cafe',
      'A compact specialty coffee bar near Dzidzikovac, handy for a calmer pause outside the busiest Bascarsija flow. Good for solo travellers who want a simple, modern coffee stop.',
      'small specialty coffee bar with calm local energy',
      array['cozy','chill','mixed']::text[],
      'Daytime cafe hours vary; check current listings before going.',
      'https://www.instagram.com/kawa.sarajevo/',
      'Dzidzikovac 3, Sarajevo 71000, Bosnia and Herzegovina',
      43.861400,
      18.419200
    ),
    (
      'Barhana',
      'sarajevo',
      'cafe',
      'A courtyard restaurant in Bascarsija with Bosnian dishes and an easy mixed crowd. It is a practical dinner base before moving toward bars, clubs or festival events.',
      'old-town courtyard restaurant and cafe',
      array['cozy','mixed','social']::text[],
      'Lunch and dinner hours vary by season; verify current service before visiting.',
      'https://www.instagram.com/barhana_sarajevo/',
      'Dulagina cikma 8, Sarajevo 71000, Bosnia and Herzegovina',
      43.860600,
      18.430600
    ),
    (
      'Hotel Europe Sarajevo',
      'sarajevo',
      'hotel',
      'A historic central hotel between the Ottoman old town and Austro-Hungarian core, making it one of the easiest bases for first-time Sarajevo visitors who want walkable culture, cafes and nightlife.',
      'historic central hotel near the old town',
      array['luxury','cozy','mixed']::text[],
      'Hotel open daily; reception and booking services operate 24 hours.',
      'https://www.hoteleurope.ba/',
      'Vladislava Skarica 5, Sarajevo 71000, Bosnia and Herzegovina',
      43.858200,
      18.428200
    ),
    (
      'Swissotel Sarajevo',
      'sarajevo',
      'hotel',
      'A modern high-rise hotel attached to Sarajevo City Center, useful for travellers who prefer a polished international base with spa access, taxis and services close at hand.',
      'modern luxury hotel with spa and shopping-centre access',
      array['luxury','relax','mixed']::text[],
      'Hotel open daily; reception and booking services operate 24 hours.',
      'https://www.swissotel.com/hotels/sarajevo/',
      'Vrbanja 1, Sarajevo 71000, Bosnia and Herzegovina',
      43.855100,
      18.407900
    ),
    (
      'Residence Inn by Marriott Sarajevo',
      'sarajevo',
      'hotel',
      'A practical apartment-style hotel near Skenderija, useful for longer Sarajevo stays, work trips and travellers who want a kitchenette while staying close to the centre.',
      'apartment-style central hotel for longer stays',
      array['cozy','relax','mixed']::text[],
      'Hotel open daily; reception and booking services operate 24 hours.',
      'https://www.marriott.com/en-us/hotels/sjjri-residence-inn-sarajevo/overview/',
      'Skenderija 43, Sarajevo 71000, Bosnia and Herzegovina',
      43.855700,
      18.417300
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
      'Kvirhana Festival 2026',
      'sarajevo',
      'Sarajevo Open Centre''s queer arts, discussion and community festival returns under the slogan "Uprkos svemu", with several days of public LGBTQ+ cultural programming around the city.',
      'https://soc.ba/pod-sloganom-uprkos-svemu-sesto-izdanje-festivala-kvirhana-u-sarajevu-od-17-do-20-juna/',
      '2026-06-17'::date,
      '2026-06-17'::date,
      '2026-06-20'::date,
      'Multiple venues, Sarajevo 71000, Bosnia and Herzegovina',
      43.856300,
      18.413100,
      'queer arts, talks and community festival across Sarajevo',
      array['festival','cultural','social']::text[]
    ),
    (
      'Bosnia and Herzegovina Pride March 2026',
      'sarajevo',
      'The official Bosnia and Herzegovina Pride March is scheduled for 20 June 2026 in Sarajevo, with route and participation updates published by the Pride organizing team.',
      'https://povorkaponosa.ba/',
      '2026-06-20'::date,
      '2026-06-20'::date,
      '2026-06-20'::date,
      'Central Sarajevo, Bosnia and Herzegovina',
      43.856300,
      18.413100,
      'official Pride march and public LGBTQ+ visibility event',
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
      'Sarajevo Open Centre',
      'sarajevo',
      'other',
      'Sarajevski otvoreni centar',
      'office@soc.ba; +387 33 551 000',
      'https://soc.ba/kontakt/',
      'Sarajevo Open Centre is one of Bosnia and Herzegovina''s central LGBTIQ+ human-rights organizations, working across advocacy, legal and social support, education, publishing and public queer culture.',
      'Office availability varies by programme; contact SOC before visiting.',
      'https://soc.ba/',
      array[]::text[],
      'Podgaj 14, Sarajevo 71000, Bosnia and Herzegovina',
      43.856300,
      18.413100,
      '$',
      'LGBTIQ+ advocacy, support, publishing and queer culture',
      array['service','cultural','social']::text[],
      'Sarajevo Open Centre official website',
      '2026-06-16'::date,
      true
    ),
    (
      'Bosnia and Herzegovina Pride March',
      'sarajevo',
      'other',
      'Bh. povorka ponosa',
      'Official contact channels published on the Pride website and social media.',
      'https://povorkaponosa.ba/',
      'The organizing platform for Bosnia and Herzegovina''s Pride March, publishing official route, participation, volunteering and safety information for the annual Sarajevo Pride event.',
      'Organizer availability varies throughout the year; check the official site before attending or contacting.',
      'https://povorkaponosa.ba/',
      array[]::text[],
      'Sarajevo, Bosnia and Herzegovina',
      43.856300,
      18.413100,
      '$',
      'official Pride march information, volunteering and public visibility',
      array['festival','service','social']::text[],
      'Bh. povorka ponosa official website',
      '2026-06-16'::date,
      true
    ),
    (
      'Fondacija CURE',
      'sarajevo',
      'other',
      'Fondacija CURE',
      'fondacijacure@fondacijacure.org; +387 33 207 561',
      'https://fondacijacure.org/kontakt/',
      'Fondacija CURE is a Sarajevo-based feminist organization with programmes spanning activism, education, culture and support for women and LGBTIQ+ communities.',
      'Office and programme hours vary; contact the foundation before visiting.',
      'https://fondacijacure.org/',
      array[]::text[],
      'Cekalusa 16, Sarajevo 71000, Bosnia and Herzegovina',
      43.862000,
      18.419000,
      '$',
      'feminist organizing, education, culture and LGBTIQ+ support',
      array['service','cultural','social']::text[],
      'Fondacija CURE official website',
      '2026-06-16'::date,
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
-- each normalized Sarajevo name.
with ranked as (
  select
    id,
    row_number() over (
      partition by lower(trim(city)), lower(trim(name))
      order by id
    ) as duplicate_rank
  from public.places
  where lower(trim(city)) = 'sarajevo'
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
  where lower(trim(city)) = 'sarajevo'
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
  where lower(trim(city)) = 'sarajevo'
)
delete from public.services s
using ranked r
where s.id = r.id
  and r.duplicate_rank > 1;

commit;

select 'places' as category, count(*) as total
from public.places
where lower(trim(city)) = 'sarajevo'

union all

select 'events', count(*)
from public.events
where lower(trim(city)) = 'sarajevo'

union all

select 'services', count(*)
from public.services
where lower(trim(city)) = 'sarajevo';
