-- Queer Atlas: Ottawa city package
-- Verified 2026-06-14.
-- Safe to run multiple times.
--
-- Adds or refreshes:
-- - 12 verified venues
-- - 5 verified 2026 events
-- - 4 verified community, health, and library services
-- - Duplicate cleanup restricted to Ottawa records

begin;

with new_places (
  name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng
) as (
  values
    (
      'The Lookout Bar',
      'ottawa',
      'club',
      'Ottawa''s best-known LGBTQ+ nightclub combines recurring drag, karaoke, drinks, and a lively dance floor above York Street. It is the clearest first stop when the plan calls for a recognizably queer night rather than a subtle hint.',
      'ByWard drag, dancing and all-welcoming queer nightlife',
      array['drag','pop','social']::text[],
      'Mon closed; Tue 19:00-00:00; Wed-Fri 19:00-02:00; Sat 15:00-02:00; Sun 15:00-23:00.',
      'https://www.thelookoutbar.com/',
      '41 York Street, 2nd Floor, Ottawa, ON K1N 5S7, Canada',
      45.428191,
      -75.693734
    ),
    (
      'Swizzles Bar & Grill',
      'ottawa',
      'bar',
      'A proudly bias-free downtown bar built around community rather than velvet-rope theatre. Karaoke, drag, comedy, and regulars give Swizzles the useful feeling of somewhere you can arrive alone and still acquire a night.',
      'bias-free community bar with karaoke, drag and comedy',
      array['drag','cozy','social']::text[],
      'Mon 19:00-00:00; Tue closed; Wed-Fri 16:00-02:00; Sat 19:00-02:00; Sun 17:00-02:00. Verify same-day hours.',
      'https://www.swizzles.ca/',
      '246 Queen Street, Ottawa, ON, Canada',
      45.420170,
      -75.701396
    ),
    (
      'T''s Pub',
      'ottawa',
      'bar',
      'A relaxed LGBTQ+ pub in the heart of the Village with a patio, karaoke, drag, sports, and community meetups. T''s is useful as both an easy first drink and the place where an allegedly quiet afternoon changes its mind.',
      'Village pub, patio drinks and recurring queer socials',
      array['cozy','social','drag']::text[],
      'Mon-Wed 15:00-02:00; Thu-Sun 11:00-02:00. Check socials for event-led changes.',
      'https://ottawa.gaycities.com/',
      '323 Somerset Street West, Ottawa, ON K2P 0J8, Canada',
      45.416157,
      -75.695107
    ),
    (
      'Pour Boy Pub',
      'ottawa',
      'bar',
      'An inclusive Centretown neighborhood pub with affordable food, trivia, open mic, comedy, and a crowd that does not require a costume change. It is a useful low-pressure bridge between daytime wandering and louder queer plans.',
      'inclusive Centretown pub with trivia, comedy and open mic',
      array['mixed','cozy','social']::text[],
      'Event programme includes Tue trivia, Wed open mic, Thu comedy and Fri Blingo; verify current opening hours directly.',
      'https://pourboypub.com/',
      '495 Somerset Street West, Ottawa, ON K1R 5J7, Canada',
      45.413863,
      -75.700468
    ),
    (
      'Atomic Rooster',
      'ottawa',
      'cafe',
      'An art-lined Bank Street bar and bistro serving brunch, late food, karaoke, and live music in an easy mixed setting. The Rooster is a reliable Village-adjacent option when one person wants dinner and another has already emotionally committed to nightlife.',
      'art-lined Bank Street bistro with brunch and live music',
      array['mixed','cultural','social']::text[],
      'Mon-Tue 16:00-02:00; Wed-Fri 12:00-02:00; Sat-Sun 10:00-02:00; kitchen open until 01:00.',
      'https://www.atomicrooster.ca/',
      '303 Bank Street, Ottawa, ON K2P 1X7, Canada',
      45.415094,
      -75.695721
    ),
    (
      'House of TARG',
      'ottawa',
      'club',
      'Part live-music venue, part vintage arcade, part perogy bunker, House of TARG is one of Ottawa''s most entertaining mixed-night detours. Inclusive policies, dance parties, free-play sessions, and a crowd comfortable with joyful oddness do the rest.',
      'pinball, perogies, punk shows and playful mixed dance nights',
      array['mixed','cultural','electronic']::text[],
      'Mon closed; Tue-Thu 17:00-23:00; Fri 17:00-01:00; Sat 12:00-01:00; Sun 12:00-00:00. Shows may alter access.',
      'https://www.houseoftarg.com/',
      '1077 Bank Street, Ottawa, ON K1S 3W9, Canada',
      45.394531,
      -75.683277
    ),
    (
      'Club Ottawa',
      'ottawa',
      'sauna',
      'Ottawa''s dedicated gay bathhouse and men''s sauna offers lockers, private rooms, steam, showers, and themed specials. The concept is direct, the Wellington West location is easy to reach, and the weekend schedule permits unusually ambitious relaxation.',
      'men-only sauna, private rooms and continuous weekend hours',
      array['men_only','relax','cruise']::text[],
      'Mon-Wed 10:00-00:00; open continuously Thu 10:00-Sun 23:00.',
      'https://www.clubottawa.com/',
      '1069 Wellington Street West, Ottawa, ON K1Y 2Y2, Canada',
      45.403633,
      -75.724977
    ),
    (
      'Bridgehead Roastery and Coffeehouse',
      'ottawa',
      'cafe',
      'The working roastery of Ottawa''s homegrown fair-trade coffee chain is a practical daytime reset near Chinatown and Little Italy. Come for coffee, lunch, Wi-Fi, and the radical vacation concept of hearing your own thoughts before the next event.',
      'local fair-trade coffee, daytime reset and casual conversation',
      array['chill','cozy','social']::text[],
      'Daily daytime coffeehouse hours vary; check the official location listing before visiting.',
      'https://www.bridgehead.ca/',
      '130 Anderson Street, Ottawa, ON K1R 6T7, Canada',
      45.407218,
      -75.712987
    ),
    (
      'Alt Hotel Ottawa Downtown',
      'ottawa',
      'hotel',
      'A modern 148-room downtown hotel within walking distance of Parliament, Centretown, and the Village. The design is clean, the location is efficient, and the lobby lounge is useful when the weather has opinions.',
      'modern downtown base with walkable access to the queer core',
      array['cozy','chill','social']::text[],
      'Hotel open daily; reception and booking services operate 24 hours.',
      'https://www.germainhotels.com/en/alt-hotel/ottawa',
      '185 Slater Street, Ottawa, ON K1P 0C8, Canada',
      45.419930,
      -75.698991
    ),
    (
      'Andaz Ottawa ByWard Market',
      'ottawa',
      'hotel',
      'A contemporary boutique hotel in ByWard Market with locally designed rooms and Ottawa''s highest rooftop lounge. It is the polished choice for travelers who want The Lookout nearby and Parliament views waiting upstairs.',
      'boutique luxury beside The Lookout with a rooftop bar',
      array['luxury','chill','social']::text[],
      'Hotel open daily; reception and booking services operate 24 hours.',
      'https://www.hyatt.com/andaz/en-US/yowaz-andaz-ottawa-byward-market',
      '325 Dalhousie Street, Ottawa, ON K1N 7G1, Canada',
      45.428756,
      -75.690719
    ),
    (
      'Lord Elgin Hotel',
      'ottawa',
      'hotel',
      'A locally owned heritage hotel opposite Confederation Park, positioned between Parliament, Elgin Street, and the Village. It offers classic capital-city atmosphere without making queer nightlife a cross-city expedition.',
      'locally owned heritage hotel between Parliament and Centretown',
      array['cozy','chill','cultural']::text[],
      'Hotel open daily; reception and booking services operate 24 hours.',
      'https://lordelginhotel.ca/',
      '100 Elgin Street, Ottawa, ON K1P 5K8, Canada',
      45.421324,
      -75.693741
    ),
    (
      'Fairmont Chateau Laurier',
      'ottawa',
      'hotel',
      'Ottawa''s castle delivers landmark grandeur, an art-deco pool, dining, and immediate access to Parliament and ByWard Market. It is not the budget answer, but it understands the value of making an entrance.',
      'landmark luxury, art-deco pool and central grand-hotel drama',
      array['luxury','chill','cultural']::text[],
      'Hotel open daily; check-in from 16:00 and check-out by 12:00.',
      'https://www.fairmont.com/en/hotels/ottawa/fairmont-chateau-laurier.html',
      '1 Rideau Street, Ottawa, ON K1N 8S7, Canada',
      45.425665,
      -75.695291
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
      'Youth Pride Prom 2026',
      'ottawa',
      'A free, ticketed Pride prom for queer and trans youth at the Horticulture Building from 19:00 to 23:00. Drag, DJs, dancing, and an accessible venue make room for the formal-night memories everyone deserved the first time.',
      'https://capitalpride.ca/signature-events/',
      '2026-06-19'::date,
      '2026-06-19'::date,
      '2026-06-19'::date,
      'Horticulture Building, 1525 Princess Patricia Way, Ottawa, ON, Canada',
      45.400780,
      -75.682362,
      'free queer youth prom with drag, DJs and dancing',
      array['drag','social','festival']::text[]
    ),
    (
      'Capital Pride Festival 2026',
      'ottawa',
      'Nine days of community events, advocacy, performance, parties, and public queer visibility across Ottawa from 22 to 30 August. The full programme turns the compact capital scene into something considerably less compact.',
      'https://capitalpride.ca/2026-festival-applications/',
      '2026-08-22'::date,
      '2026-08-22'::date,
      '2026-08-30'::date,
      'Ottawa Village and multiple central venues, Ottawa, ON, Canada',
      45.413140,
      -75.693502,
      'nine-day capital Pride season across the city',
      array['festival','cultural','social']::text[]
    ),
    (
      'Capital Pride Street Festival 2026',
      'ottawa',
      'Bank Street becomes a two-day Pride village from 12:00 to 20:00 on 29 and 30 August, with community organizations, a craft fair, partner activations, and live programming.',
      'https://capitalpride.ca/2026-street-festival/',
      '2026-08-29'::date,
      '2026-08-29'::date,
      '2026-08-30'::date,
      'Bank Street in Ottawa''s Village, Ottawa, ON, Canada',
      45.413140,
      -75.693502,
      'two-day Bank Street Pride village and community fair',
      array['festival','cultural','social']::text[]
    ),
    (
      'Happy 200th Birthday, Ottawa! Drag Talent Showcase',
      'ottawa',
      'Capital Pride''s main-stage drag talent showcase runs from 17:00 to 19:00 on 29 August. Ottawa marks its bicentennial with the only proportionate response: wigs, talent, and absolutely no administrative beige.',
      'https://capitalpride.ca/signature-events/',
      '2026-08-29'::date,
      '2026-08-29'::date,
      '2026-08-29'::date,
      'TD Main Stage, Capital Pride Street Festival, Bank Street, Ottawa, ON, Canada',
      45.413140,
      -75.693502,
      'Capital Pride main-stage drag talent showcase',
      array['drag','festival','pop']::text[]
    ),
    (
      'Capital Pride Parade 2026',
      'ottawa',
      'More than 225 groups and over 11,000 community members take central Ottawa from 13:00 to 16:00. The parade is the festival''s loud public heart, mixing celebration, advocacy, music, and drag.',
      'https://capitalpride.ca/2026-pride-parade/',
      '2026-08-30'::date,
      '2026-08-30'::date,
      '2026-08-30'::date,
      'Central Ottawa and Centretown, Ottawa, ON, Canada',
      45.421324,
      -75.693741,
      'large central Ottawa Pride parade and public celebration',
      array['festival','drag','cultural']::text[]
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
      'Kind Space Community Centre',
      'ottawa',
      'other',
      'Kind Space',
      '+1 613-563-4818; programming@kindspace.ca',
      'https://www.kindspace.ca/programs',
      'Ottawa''s 2SLGBTQIA+ community centre offers peer-led groups, social programming, mental-wellness activities, education, resources, and a welcoming drop-in environment. It is the practical answer when a visitor needs community rather than another recommendation algorithm.',
      'Drop-in and programme hours vary; check the official programme before visiting.',
      'https://www.kindspace.ca/',
      array[]::text[],
      '400 Cooper Street, Suite 9001, Ottawa, ON K2P 2N1, Canada',
      45.415288,
      -75.697755,
      '$',
      'peer-led community support, rest, learning and social connection',
      array['social','cultural','relax']::text[],
      'Kind Space official website',
      '2026-06-14'::date,
      true
    ),
    (
      'MAX Ottawa Health and Wellness',
      'ottawa',
      'wellness',
      'MAX Ottawa',
      '+1 613-701-6555; info@maxottawa.ca',
      'https://maxottawa.ca/programs-and-services/',
      'Queer, trans, and non-binary health and wellness support including free safer-sex and harm-reduction supplies, STI testing pathways, mental-health information, gender-affirming care resources, and a comprehensive local events calendar.',
      'Mon 10:00-17:00; Tue-Fri 12:00-19:00.',
      'https://maxottawa.ca/',
      array[]::text[],
      '400 Cooper Street, Suite 9004, Ottawa, ON K2P 2H8, Canada',
      45.415288,
      -75.697755,
      '$',
      'queer health, sexual wellness, harm reduction and practical support',
      array['chill','social','relax']::text[],
      'MAX Ottawa official website',
      '2026-06-14'::date,
      true
    ),
    (
      'Bruce House HIV Housing and Support',
      'ottawa',
      'wellness',
      'Bruce House',
      '+1 613-729-0911',
      'https://brucehouse.ca/programs-and-services/',
      'Housing-first support, outreach, holistic care, and practical resources for individuals and families living with HIV in Ottawa. Bruce House has served the community since 1988 and connects people to stable, dignity-centered support.',
      'Mon-Thu 10:00-12:15 and 13:00-17:00; closed statutory holidays.',
      'https://brucehouse.ca/',
      array[]::text[],
      'Suite 402, 251 Bank Street, Ottawa, ON K2P 1X3, Canada',
      45.416304,
      -75.696786,
      '$',
      'HIV housing, outreach, holistic care and support',
      array['chill','social','relax']::text[],
      'Bruce House official website',
      '2026-06-14'::date,
      true
    ),
    (
      'Ottawa Trans Library',
      'ottawa',
      'other',
      'Ottawa Trans Library',
      'Use the contact form on the official website',
      'https://ottawatranslibrary.ca/events-calendar/',
      'A free trans-focused lending library, resource centre, and social space with books, board games, Wi-Fi, tea, and recurring community events. The only house rule is essentially to be respectful, which remains an excellent operating system.',
      'Mon 15:00-19:00; Tue 12:00-17:00; Wed-Thu 15:00-19:00; Fri closed; Sat 12:00-17:00; Sun closed.',
      'https://ottawatranslibrary.ca/',
      array[]::text[],
      '1104 Somerset Street West, Ottawa, ON K1Y 3C8, Canada',
      45.405880,
      -75.721948,
      '$',
      'trans library, community space, peer connection and events',
      array['cultural','social','cozy']::text[],
      'Ottawa Trans Library official website',
      '2026-06-14'::date,
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
-- each normalized Ottawa name.
with ranked as (
  select
    id,
    row_number() over (
      partition by lower(trim(city)), lower(trim(name))
      order by id
    ) as duplicate_rank
  from public.places
  where lower(trim(city)) = 'ottawa'
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
  where lower(trim(city)) = 'ottawa'
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
  where lower(trim(city)) = 'ottawa'
)
delete from public.services s
using ranked r
where s.id = r.id
  and r.duplicate_rank > 1;

commit;

select 'places' as category, count(*) as total
from public.places
where lower(trim(city)) = 'ottawa'

union all

select 'events', count(*)
from public.events
where lower(trim(city)) = 'ottawa'

union all

select 'services', count(*)
from public.services
where lower(trim(city)) = 'ottawa';
