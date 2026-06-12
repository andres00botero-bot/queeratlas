-- Queer Atlas: Marseille city package
-- Approved 2026-06-12.
-- Safe to run multiple times.
--
-- Adds or refreshes:
-- - 8 verified venues
-- - 5 verified 2026 events
-- - 3 verified community and wellness services
-- - Duplicate cleanup restricted to these Marseille records

begin;

with new_places (
  name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng
) as (
  values
    (
      'Le Pulse',
      'marseille',
      'bar',
      'Cours Julien''s rainbow living room, where terrace drinks have a habit of becoming a full evening. Expect cocktails, DJs, a social local crowd, and an easy first stop for reading Marseille''s queer pulse.',
      'Cours Julien terrace drinks and friendly queer pop energy',
      array['social','pop','cozy']::text[],
      'Wed-Sat 17:00-02:00; check the official Instagram for programme changes.',
      'https://www.instagram.com/lepulsebar_/',
      '94 Cours Julien, 13006 Marseille, France',
      43.2930821,
      5.3831577
    ),
    (
      'Le Poli (formerly Polikarpov)',
      'marseille',
      'bar',
      'Harbour-side cocktails, disco confidence, and enough Mediterranean flirting to delay dinner indefinitely. The former Polikarpov now trades as Le Poli, with an open-to-all crowd and electronic weekend energy.',
      'harbour-side cocktails, disco confidence and mixed DJ nights',
      array['social','electronic','mixed']::text[],
      'Open daily, generally late afternoon to 02:00; verify the same-day schedule on Instagram.',
      'https://www.instagram.com/lepolibar_/',
      '24 Cours Honore d''Estienne d''Orves, 13001 Marseille, France',
      43.2930308,
      5.3740330
    ),
    (
      'BOUM',
      'marseille',
      'club',
      'A proudly inclusive queer playground serving drag, DJs, cocktails, and chosen-family chaos. Programme-led nights can move from early happy hour to a considerably louder dance floor.',
      'inclusive drag, DJs and chosen-family dance-floor chaos',
      array['drag','electronic','social']::text[],
      'Programme nights from 18:00; club programming often starts around 23:00. Check Instagram.',
      'https://www.instagram.com/boum_marseille/',
      '21 Rue Andre Poggioli, 13006 Marseille, France',
      43.2934672,
      5.3852497
    ),
    (
      'L''Annexe Bar made in Marseille',
      'marseille',
      'bar',
      'A compact gay bar that starts with terrace gossip and ends with shirts mysteriously unbuttoned. It is men-focused, sociable, and louder once the programmed club hours begin.',
      'gay terrace gossip, pop and late men-focused club energy',
      array['men_only','pop','social']::text[],
      'Programme nights from 19:00; clubbing often runs 22:00-04:00. Check the weekly programme.',
      'https://www.instagram.com/annex_marseille/',
      '7 Rue Saint-Bazile, 13001 Marseille, France',
      43.2993834,
      5.3846734
    ),
    (
      'Les Thermes',
      'marseille',
      'sauna',
      'A classic men''s sauna where steam, themed sessions, and Marseille confidence share the same towel. Facilities include a pool, hammam, bar, cabins, and social cruising areas.',
      'classic men-only steam, themed sessions and social cruising',
      array['men_only','relax','social']::text[],
      'Open daily from around 12:00; verify current closing time before visiting.',
      'https://qlist.app/venues/Marseille/Les-Thermes-No-1-Gay-Sauna-in-Marseille/UzJDOWg3NU1zeHM3TDZFLytXbi9FQQ',
      '22 Rue Mazagran, 13001 Marseille, France',
      43.2972957,
      5.3831556
    ),
    (
      'Cargo Sauna',
      'marseille',
      'sauna',
      'A modern men''s sauna mixing pool, jacuzzi, hammam, cabins, and spa relaxation with a distinctly less innocent lower deck. Weekend hours run later for visitors who treat recovery as nightlife.',
      'modern men-only spa facilities with a cruising undercurrent',
      array['men_only','relax','cruise']::text[],
      'Mon-Thu and Sun 14:00-21:00; Fri-Sat 14:00-02:00.',
      'https://qlist.app/venues/Marseille/Cargo-Sauna-Marseille/TUhZWjYzUEcvbS9yN25ZUGpjcm0rUQ',
      '7 Rue Jean-Pierre-Moustier, 13001 Marseille, France',
      43.2940692,
      5.3800257
    ),
    (
      'The Trash Bar',
      'marseille',
      'cruising_area',
      'Marseille''s leather-and-fetish basement for men who packed fewer inhibitions than outfits. DJs, cabins, showers, dark spaces, and themed nights make the concept refreshingly unambiguous.',
      'men-only leather, fetish and late-night cruising',
      array['men_only','fetish','cruise']::text[],
      'Mon and Wed 20:30-02:00; Fri 21:30-02:00; Sat 21:30-03:00; Sun 15:00-00:00; Tue and Thu closed.',
      'https://qlist.app/venues/Marseille/The-Trash-Bar/UW50YzMwUjlyRTRQVVRmYktsM1RrQQ',
      '28 Rue du Berceau, 13005 Marseille, France',
      43.2877646,
      5.3953417
    ),
    (
      'Sauna Club Salvator',
      'marseille',
      'sauna',
      'Three floors of steam, cruising, and unapologetically old-school gay sauna energy. It is a central daytime-to-evening option for men who prefer their Marseille sightseeing with considerably fewer layers.',
      'three floors of old-school men-only sauna and cruising',
      array['men_only','relax','cruise']::text[],
      'Open daily around 12:00-20:00; verify current hours before visiting.',
      'https://qlist.app/venues/Marseille/Sauna-Club-Salvator/akh6bndJbW5LbFdsWTA0L2hYTU5OZw',
      '20 Boulevard Louis Salvator, 13006 Marseille, France',
      43.2909970,
      5.3821944
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
      'Atelier d''auto-hypnose - 25 June 2026',
      'marseille',
      'A free LGBTQIA+ community self-hypnosis workshop from 18:30 to 20:00. This session explores meeting the different parts of yourself, with less pressure than a group chat and considerably better breathing.',
      'https://centrelgbtqiamarseille.org/agenda/atelier-dauto-hypnose-6/',
      '2026-06-25'::date,
      '2026-06-25'::date,
      '2026-06-25'::date,
      'Centre LGBTQIA+ Marseille, 17 Rue du Chevalier Roze, 13002 Marseille, France',
      43.2980130,
      5.3717676,
      'free queer community self-hypnosis workshop',
      array['relax','social']::text[]
    ),
    (
      'Les Etoiles du Drag 2026',
      'marseille',
      'Two days of drag competition, showcases, meet-and-greets, and cabaret spectacle. Marseille puts the stars on stage and politely asks subtlety to wait outside.',
      'https://billetterie.cabaretletoilebleue.fr/',
      '2026-06-26'::date,
      '2026-06-26'::date,
      '2026-06-27'::date,
      'Cabaret L''Etoile Bleue, 107 bis Boulevard Jeanne d''Arc, 13005 Marseille, France',
      43.2942156,
      5.3980995,
      'two-day drag competition and cabaret festival',
      array['drag','cultural','festival']::text[]
    ),
    (
      'Marseille Pride March and Village 2026',
      'marseille',
      'Pride village from 12:00, march from Place Castellane at 16:30, and a free evening concert near the Vieux-Port from 19:00. Protest, celebration, Mediterranean volume, and demonstratively excellent outfits share the route.',
      'https://www.pride-marseille.com/',
      '2026-07-04'::date,
      '2026-07-04'::date,
      '2026-07-04'::date,
      'Place Castellane, 13006 Marseille, France',
      43.2859177,
      5.3837376,
      'Pride village, protest march and free concert',
      array['festival','cultural','social']::text[]
    ),
    (
      'Marseille Pride Official Party 2026',
      'marseille',
      'The official Pride party runs from 22:00 to 05:00 across two rooms at La Plateforme. DJs, drag, queer performance, and a city that has absolutely no intention of going quietly home.',
      'https://www.pride-marseille.com/soiree-officielle-2026/',
      '2026-07-04'::date,
      '2026-07-04'::date,
      '2026-07-05'::date,
      'La Plateforme, 155 Rue Peyssonnel, 13002 Marseille, France',
      43.3146893,
      5.3677456,
      'official two-room Marseille Pride afterparty',
      array['festival','electronic','drag']::text[]
    ),
    (
      'Permanence Trans and Handi.e.s - 9 July 2026',
      'marseille',
      'A free drop-in peer space from 18:30 to 22:00 for trans and non-binary disabled or neurodivergent people. Come as you are; nobody needs to compress an identity into one tidy checkbox.',
      'https://centrelgbtqiamarseille.org/agenda/permanence-trans-handi-e-s/',
      '2026-07-09'::date,
      '2026-07-09'::date,
      '2026-07-09'::date,
      'Centre LGBTQIA+ Marseille, 17 Rue du Chevalier Roze, 13002 Marseille, France',
      43.2980130,
      5.3717676,
      'accessible trans and non-binary peer support evening',
      array['social','relax','cultural']::text[]
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
      'Centre LGBTQIA+ Marseille Community and Rights Support',
      'marseille',
      'other',
      'Centre LGBTQIA+ Marseille',
      '+33 4 65 58 09 52',
      'https://centrelgbtqiamarseille.org/',
      'Community, rights, social, asylum, administrative, and queer-life support under one local roof. It is the place for questions that deserve more than a search result and considerably more humanity than a generic tourist desk.',
      'Community bar Tue-Sat 18:00-23:00; support sessions and activities follow the official programme.',
      'https://centrelgbtqiamarseille.org/',
      array[]::text[],
      '17-21 Rue du Chevalier Roze, 13002 Marseille, France',
      43.2980130,
      5.3717676,
      '$',
      'community rights support, social connection and queer organizing',
      array['cultural','social']::text[],
      'Centre LGBTQIA+ Marseille official website',
      '2026-06-12'::date,
      true
    ),
    (
      'Le Spot Longchamp Sexual Health and Wellness',
      'marseille',
      'wellness',
      'Le Spot Longchamp',
      '+33 4 91 14 05 15',
      'https://longchamp.lespot.org/en/le-spot',
      'LGBTQI+-inclusive sexual-health centre offering screening, PrEP and PEP guidance, transition-pathway support, chemsex support, nursing, and social consultations. Calm expertise for questions that should never require shame or an increasingly anxious browser history.',
      'Mon 16:00-19:30; Tue and Thu 10:00-13:30 and 16:00-19:30; Wed 10:00-17:00; Fri 12:30-19:30; Sat 13:30-17:00.',
      'https://longchamp.lespot.org/en/le-spot',
      array[]::text[],
      '3 Boulevard Longchamp, 13001 Marseille, France',
      43.3009053,
      5.3870204,
      '$',
      'inclusive sexual health, screening and practical wellness support',
      array['relax','social']::text[],
      'Le Spot Longchamp official website',
      '2026-06-12'::date,
      true
    ),
    (
      'Transat Trans and Non-Binary Peer Support',
      'marseille',
      'other',
      'Transat',
      '+33 6 47 53 84 75; contact@transat-asso.fr',
      'https://transat-asso.fr/',
      'Trans-led peer support, advocacy, practical transition information, and community connection for trans, non-binary, and questioning people. Nobody needs to defend, translate, or simplify their identity before entering the conversation.',
      'By appointment and during programmed community events; check the official calendar.',
      'https://transat-asso.fr/',
      array[]::text[],
      '15 Rue des Muettes, 13002 Marseille, France',
      43.2988077,
      5.3681227,
      '$',
      'trans-led peer support, advocacy and community connection',
      array['cultural','social']::text[],
      'Transat official website',
      '2026-06-12'::date,
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

-- Remove accidental duplicate copies of this package while retaining the
-- oldest row for each normalized Marseille name.
with ranked as (
  select
    id,
    row_number() over (
      partition by lower(trim(city)), lower(trim(name))
      order by id
    ) as duplicate_rank
  from public.places
  where lower(trim(city)) = 'marseille'
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
  where lower(trim(city)) = 'marseille'
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
  where lower(trim(city)) = 'marseille'
)
delete from public.services s
using ranked r
where s.id = r.id
  and r.duplicate_rank > 1;

commit;

select 'places' as category, count(*) as total
from public.places
where lower(trim(city)) = 'marseille'

union all

select 'events', count(*)
from public.events
where lower(trim(city)) = 'marseille'

union all

select 'services', count(*)
from public.services
where lower(trim(city)) = 'marseille';
