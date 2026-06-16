-- Queer Atlas: Montenegro country-as-city package
-- Verified 2026-06-16.
-- Safe to run multiple times.
--
-- Adds or refreshes:
-- - 15 venues across Budva, Ulcinj/Ada Bojana, Podgorica, Kotor and Tivat
-- - 4 verified community / travel services
-- - Montenegro legal information and legal breakdown
-- - Duplicate cleanup restricted to Montenegro records
--
-- Montenegro is intentionally modeled as the city slug "montenegro"
-- because the queer venue signal is country-wide rather than city-dense.
-- No active dedicated gay sauna or permanent gay club could be verified.
-- No future dated 2026 Montenegro Pride event could be verified at
-- package time, so Pride is included as a service/organizer record.

begin;

with new_places (
  name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng
) as (
  values
    (
      'Casper Bar Budva',
      'montenegro',
      'bar',
      'A long-running Budva Old Town bar repeatedly recommended in queer Montenegro travel writing as an easy mixed social stop. It is not a gay bar, but it is one of the more useful relaxed anchors before the louder Budva club circuit.',
      'old-town mixed bar with summer social flow',
      array['mixed','social','cozy']::text[],
      'Seasonal bar hours vary; verify current opening before visiting.',
      'https://www.instagram.com/casperbarbudva/',
      'Old Town, Budva 85310, Montenegro',
      42.278900,
      18.837600
    ),
    (
      'Top Hill Budva',
      'montenegro',
      'club',
      'A large open-air summer club above Budva, useful when Montenegro needs a full-scale dance-night option rather than a small bar. The crowd is mixed, international and highly seasonal.',
      'large seasonal Budva dance club with international crowd',
      array['mixed','massive','pop']::text[],
      'Seasonal summer club calendar; verify event nights and door times before going.',
      'https://www.tophill.me/',
      'Topliski put, Budva 85310, Montenegro',
      42.292600,
      18.829700
    ),
    (
      'Omnia Night Club',
      'montenegro',
      'club',
      'A central Budva nightlife room with a mixed tourist-local crowd and late-night commercial music energy. Best used as a mainstream dance-floor option during the summer season.',
      'central Budva mixed nightclub with late summer traffic',
      array['mixed','pop','social']::text[],
      'Seasonal and event-led; verify current programme and opening times before visiting.',
      'https://www.instagram.com/omniaclub/',
      'Mediteranska, Budva 85310, Montenegro',
      42.286000,
      18.840800
    ),
    (
      'Maximus Kotor',
      'montenegro',
      'club',
      'A major Kotor Old Town club in a converted stone setting, useful for visitors basing themselves around the bay. It is mixed rather than gay-specific, with strong event and summer-season dependence.',
      'Kotor old-town club with big mixed summer nights',
      array['mixed','massive','cultural']::text[],
      'Event-led and seasonal; verify current listings before going.',
      'https://www.instagram.com/maximuskotor/',
      'Old Town Kotor, Kotor 85330, Montenegro',
      42.425700,
      18.771200
    ),
    (
      'Propaganda Podgorica',
      'montenegro',
      'bar',
      'A central Podgorica alternative bar often used as a more relaxed, artsy and mixed social room. Useful for travelers who want city energy away from the coastal summer circuit.',
      'alternative Podgorica bar with mixed local energy',
      array['mixed','cultural','cozy']::text[],
      'Evening-led bar hours vary; check same-day social channels.',
      'https://www.instagram.com/propagandapg/',
      'Bokeska, Podgorica 81000, Montenegro',
      42.441300,
      19.263500
    ),
    (
      'Njivice Beach',
      'montenegro',
      'cruising_area',
      'A small beach area near Herceg Novi repeatedly mentioned by gay travel guides as one of Montenegro''s more gay-popular coastal spots. Treat it as a daytime beach signal, not a guaranteed cruising venue.',
      'gay-popular beach pocket near Herceg Novi',
      array['cruise','chill','mixed']::text[],
      'Public beach; visit in daylight and verify local access conditions seasonally.',
      'https://www.travelgay.com/destination/gay-montenegro',
      'Njivice, Herceg Novi Municipality, Montenegro',
      42.437900,
      18.543600
    ),
    (
      'Ada Bojana Naturist Beach',
      'montenegro',
      'cruising_area',
      'A long-established naturist beach area near Ulcinj and the Albanian border. Queer guides point to Ada Bojana as part of Montenegro''s most open beach culture, especially for low-key, body-comfortable daytime travel.',
      'naturist beach area with relaxed queer-friendly signal',
      array['relax','cruise','chill']::text[],
      'Public beach and resort access vary by season; daytime visits are recommended.',
      'https://www.wolfyy.com/travel-guide-gay-ulcinj/#nightlife',
      'Ada Bojana, Ulcinj Municipality, Montenegro',
      41.867500,
      19.342800
    ),
    (
      'Mogren Beach',
      'montenegro',
      'cruising_area',
      'A scenic Budva beach stop useful for queer travelers who want daytime swim-and-reset time near the main nightlife base. It is a mixed public beach, not a dedicated gay beach.',
      'Budva beach reset close to nightlife',
      array['chill','mixed','relax']::text[],
      'Public beach; daytime and sunset hours are strongest in season.',
      'https://www.wolfyy.com/travel-guide-gay-budva/',
      'Mogren Beach, Budva 85310, Montenegro',
      42.276900,
      18.832900
    ),
    (
      'Dukley Beach & Bar',
      'montenegro',
      'bar',
      'A polished Budva beach-bar option that works for a calmer, more design-forward coastal day before the heavier nightclubs start. Useful for couples and travelers who want comfort rather than scene density.',
      'polished Budva beach bar with luxury coastal mood',
      array['luxury','chill','mixed']::text[],
      'Seasonal beach and bar hours; verify current reservations and opening times.',
      'https://www.dukley.com/',
      'Zavala Peninsula, Budva 85310, Montenegro',
      42.285100,
      18.856400
    ),
    (
      'Buddha-Bar Beach Porto Montenegro',
      'montenegro',
      'bar',
      'A high-end Porto Montenegro beach-club and bar setting with a mixed international crowd. It is useful for a polished Tivat/Kotor Bay day-to-evening route rather than a gay-specific night out.',
      'luxury Tivat beach-club bar with international crowd',
      array['luxury','social','mixed']::text[],
      'Seasonal beach-club hours; book or verify current opening before visiting.',
      'https://www.portomontenegro.com/en/experience/buddha-bar-beach/',
      'Porto Montenegro, Tivat 85320, Montenegro',
      42.436600,
      18.693300
    ),
    (
      'Scala Santa Kotor',
      'montenegro',
      'cafe',
      'A Kotor Old Town restaurant useful as a calm dinner base before bay nightlife. Listed as cafe because the app stores restaurants and cafes under the cafe type.',
      'old-town Kotor restaurant and cafe stop',
      array['cozy','mixed','cultural']::text[],
      'Lunch and dinner hours vary seasonally; verify current service before visiting.',
      'https://www.instagram.com/scalasanta_kotor/',
      'Stari Grad, Kotor 85330, Montenegro',
      42.424700,
      18.771200
    ),
    (
      'Hotel Budva',
      'montenegro',
      'hotel',
      'A central Budva hotel on Slovenska Obala, useful for travelers who want walking access to the old town, beaches and the seasonal club circuit.',
      'central Budva hotel for beach and nightlife routing',
      array['cozy','social','mixed']::text[],
      'Hotel open daily; reception and booking services operate 24 hours.',
      'https://www.hotelbudva.me/',
      'Slovenska obala, Budva 85310, Montenegro',
      42.283300,
      18.839800
    ),
    (
      'Hilton Podgorica Crna Gora',
      'montenegro',
      'hotel',
      'A practical city-base hotel in central Podgorica, useful for access to services, Pride-related organizing, government areas and airport transfers before or after the coast.',
      'central Podgorica hotel for services and transit',
      array['luxury','cozy','mixed']::text[],
      'Hotel open daily; reception and booking services operate 24 hours.',
      'https://www.hilton.com/en/hotels/tgdpcqq-hilton-podgorica-crna-gora/',
      'Bulevar Svetog Petra Cetinjskog 2, Podgorica 81000, Montenegro',
      42.439900,
      19.263600
    ),
    (
      'Regent Porto Montenegro',
      'montenegro',
      'hotel',
      'A polished Tivat marina hotel for travelers who want luxury, bay views and easy access to Porto Montenegro''s restaurants, bars and coastal day plans.',
      'luxury marina hotel in Porto Montenegro',
      array['luxury','relax','mixed']::text[],
      'Hotel open daily; reception and booking services operate 24 hours.',
      'https://www.ihg.com/regent/hotels/us/en/tivat/tivpm/hoteldetail',
      'Obala bb, Porto Montenegro Village, Tivat 85320, Montenegro',
      42.434100,
      18.694600
    ),
    (
      'The Chedi Lustica Bay',
      'montenegro',
      'hotel',
      'A high-comfort coastal resort base in Lustica Bay, useful for a quieter Montenegro route where the priority is spa, beach, dining and privacy rather than active gay nightlife.',
      'quiet luxury resort base for coastal recovery',
      array['luxury','relax','chill']::text[],
      'Hotel open daily; reception and booking services operate 24 hours.',
      'https://www.chedilusticabay.com/',
      'Lustica Bay Marina, Tivat 85323, Montenegro',
      42.386900,
      18.658500
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

with new_services (
  name, city, type, provider_name, contact, booking_link, description,
  hours, link, image_urls, location, lat, lng, price_tier, vibe,
  vibe_tags, source, "lastChecked", verified
) as (
  values
    (
      'Queer Montenegro',
      'montenegro',
      'other',
      'Queer Montenegro',
      'Use official website and social channels for current contact details.',
      'https://queermontenegro.org/',
      'National LGBTIQ organization and Pride-linked community signal for Montenegro, useful for rights updates, participation information and local context before planning a visit.',
      'Organizer availability varies by campaign and event calendar; contact before visiting.',
      'https://queermontenegro.org/',
      array[]::text[],
      'Podgorica, Montenegro',
      42.430400,
      19.259400,
      '$',
      'LGBTIQ advocacy, Pride signal and community information',
      array['service','social','cultural']::text[],
      'Queer Montenegro official website',
      '2026-06-16'::date,
      true
    ),
    (
      'Montenegro Pride',
      'montenegro',
      'other',
      'Montenegro Pride',
      'Use official Pride and Queer Montenegro channels for current date, route and volunteering updates.',
      'https://queermontenegro.org/',
      'The main Pride visibility signal for Montenegro. No future dated 2026 Pride event could be verified for insertion at package time, so this record keeps the organizer/contact lane available without inventing a date.',
      'Event and organizer availability varies; verify current announcements before planning travel.',
      'https://queermontenegro.org/',
      array[]::text[],
      'Podgorica, Montenegro',
      42.430400,
      19.259400,
      '$',
      'Pride march information, visibility and community participation',
      array['festival','service','social']::text[],
      'Queer Montenegro / Montenegro Pride channels',
      '2026-06-16'::date,
      true
    ),
    (
      'Association Spectra',
      'montenegro',
      'other',
      'Asocijacija Spektra',
      'Use official website and social channels for current contact details.',
      'https://www.asocijacijaspektra.org/',
      'A Montenegro-based organization focused on trans, gender-diverse and intersex rights, community support, education and advocacy.',
      'Programme and office availability vary; contact before visiting.',
      'https://www.asocijacijaspektra.org/',
      array[]::text[],
      'Podgorica, Montenegro',
      42.430400,
      19.259400,
      '$',
      'trans, gender-diverse and intersex advocacy and support',
      array['service','social','cultural']::text[],
      'Association Spectra official website',
      '2026-06-16'::date,
      true
    ),
    (
      'Juventas Montenegro',
      'montenegro',
      'other',
      'Juventas',
      'Use official website and social channels for current contact details.',
      'https://juventas.me/',
      'A youth, health and human-rights organization in Montenegro with long-running work relevant to HIV prevention, harm reduction and LGBTIQ community health support.',
      'Programme and office availability vary; contact before visiting.',
      'https://juventas.me/',
      array[]::text[],
      'Podgorica, Montenegro',
      42.430400,
      19.259400,
      '$',
      'health, youth rights, HIV prevention and LGBTIQ support',
      array['service','social','relax']::text[],
      'Juventas official website',
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

insert into public.qa_country_rights_profiles (
  country,
  legal_level,
  rights_level,
  safety_level,
  same_sex_relations_status,
  union_status,
  legal_gender_recognition_status,
  anti_discrimination_status,
  what_this_means,
  confidence,
  source_legal_url,
  source_rights_url,
  source_safety_url,
  source_checked_at,
  needs_manual_review
)
values (
  'Montenegro',
  'good',
  'mixed',
  'mixed',
  'legal',
  'civil_union_or_partnership',
  'restricted',
  'full_coverage',
  'Same-sex relations are legal and same-sex life partnerships are recognized, but marriage equality and full family-rights parity are not in place. Anti-discrimination law covers sexual orientation and gender identity, while everyday comfort is strongest in tourist zones and community-led spaces.',
  'high',
  'https://rainbowmap.ilga-europe.org/',
  'https://www.equaldex.com/region/montenegro',
  'https://queermontenegro.org/',
  current_date,
  false
)
on conflict (country) do update set
  legal_level = excluded.legal_level,
  rights_level = excluded.rights_level,
  safety_level = excluded.safety_level,
  same_sex_relations_status = excluded.same_sex_relations_status,
  union_status = excluded.union_status,
  legal_gender_recognition_status = excluded.legal_gender_recognition_status,
  anti_discrimination_status = excluded.anti_discrimination_status,
  what_this_means = excluded.what_this_means,
  confidence = excluded.confidence,
  source_legal_url = excluded.source_legal_url,
  source_rights_url = excluded.source_rights_url,
  source_safety_url = excluded.source_safety_url,
  source_checked_at = excluded.source_checked_at,
  needs_manual_review = excluded.needs_manual_review,
  updated_at = now();

-- Remove accidental duplicate copies while retaining the oldest row for
-- each normalized Montenegro name.
with ranked as (
  select
    id,
    row_number() over (
      partition by lower(trim(city)), lower(trim(name))
      order by id
    ) as duplicate_rank
  from public.places
  where lower(trim(city)) = 'montenegro'
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
  where lower(trim(city)) = 'montenegro'
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
  where lower(trim(city)) = 'montenegro'
)
delete from public.services s
using ranked r
where s.id = r.id
  and r.duplicate_rank > 1;

commit;

select 'places' as category, count(*) as total
from public.places
where lower(trim(city)) = 'montenegro'

union all

select 'events', count(*)
from public.events
where lower(trim(city)) = 'montenegro'

union all

select 'services', count(*)
from public.services
where lower(trim(city)) = 'montenegro';
