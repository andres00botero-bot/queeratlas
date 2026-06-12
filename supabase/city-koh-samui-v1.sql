-- Queer Atlas: Koh Samui city package
-- Approved 2026-06-12.
-- Safe to run multiple times.
--
-- Adds or refreshes:
-- - 4 verified venues
-- - 2 verified services
-- - No events without a verified future date
-- - Duplicate cleanup restricted to Koh Samui records

begin;

with new_places (
  name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng
) as (
  values
    (
      'Pride Bar Samui',
      'koh_samui',
      'bar',
      'Samui''s queer living room serves cocktails, quick bites, karaoke, retro music, and regular cabaret appearances. Come as a visitor, leave with three new friends and a completely revised plan for Wednesday night.',
      'social cocktails, pop singalongs and regular drag sparkle',
      array['social','pop','drag']::text[],
      'Daily approximately 18:00-02:00. Wednesday karaoke from 21:00; Thursday Latin Vibes; Saturday Divas Cabaret mini show at 23:40; Sunday retro music.',
      'https://www.pridebarsamui.com/',
      '166/15 Moo 2, Chaweng Beach Road, Bophut, Koh Samui, Surat Thani 84320, Thailand',
      9.5327506,
      100.0648189
    ),
    (
      'Whisper Gay Bar & Lounge',
      'koh_samui',
      'bar',
      'A stylish and unapologetically queer lounge inside Alpha Gay Resort, built for cocktails, dating, dancing, and a little well-lit drama. Monday brings Cruising Night, Friday belongs to the pop divas, and subtlety has wisely taken the evening off.',
      'neon cocktails, pop-diva dancing and playful cruising',
      array['pop','social','cruise']::text[],
      'Mon-Sat 18:00-late; Sunday closed. Cruising Night on Monday and pop-diva dance parties on Friday.',
      'https://www.alphagayresort.com/whisper-bar',
      'Inside Alpha Gay Resort, 9/34 Moo 2, Bophut, Koh Samui, Surat Thani 84320, Thailand',
      9.53478,
      100.05775
    ),
    (
      'Alpha Gay Resort & Spa',
      'koh_samui',
      'hotel',
      'An adult gay men''s tropical retreat with private rooms, a dorm, pools, bar, steam facilities, and a clothing-optional social scene. Swimwear is available for the cautious, optional for the confident, and rarely the most interesting part of the conversation.',
      'men-only tropical privacy with clothing-optional pool calm',
      array['men_only','relax','social']::text[],
      'Hotel operates daily. Pool is available 24 hours for registered guests; resort bar and social facilities usually close around 21:00.',
      'https://www.alphagayresort.com/',
      '9/34 Moo 2, Bophut, Koh Samui, Surat Thani 84320, Thailand',
      9.53478,
      100.05775
    ),
    (
      'ARKbar Beach Club & Resort',
      'koh_samui',
      'club',
      'A mixed but gay-popular Chaweng beach club with oceanfront pools, live DJs, nightly fire shows, and enough party momentum to turn sunset into a scheduling suggestion. The crowd is broad, the music is loud, and the beach has excellent lighting.',
      'gay-popular beachfront pool parties and nightly fire-show spectacle',
      array['mixed','electronic','massive']::text[],
      'Daily 10:00-02:00. Pool party 14:00-19:00; beach party 20:00-02:00; fire show 20:00-00:00.',
      'https://www.ark-bar.com/',
      '159/89 Moo 2, Chaweng Beach, Bophut, Koh Samui, Surat Thani 84320, Thailand',
      9.5322,
      100.0651
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
      'Alpha Professional Massage',
      'koh_samui',
      'massage',
      'Alpha Gay Resort & Spa',
      '+66 62 167 1216; alphagayresort@gmail.com',
      'https://www.alphagayresort.com/services/massages',
      'Professional massage by certified male therapists, with Thai, deep-tissue, aromatherapy, Swedish, sport, scrub, stone, and recovery treatments. It is a serious restoration plan for bodies that have confused beach holiday with competitive nightlife.',
      'Daily 12:00-20:00; schedule may change and advance confirmation is recommended.',
      'https://www.alphagayresort.com/services/massages',
      array[]::text[],
      'Alpha Gay Resort, 9/34 Moo 2, Bophut, Koh Samui, Surat Thani 84320, Thailand',
      9.53478,
      100.05775,
      '$$',
      'professional male massage in a private gay-resort setting',
      array['men_only','relax','cozy']::text[],
      'Alpha Gay Resort official massage page',
      '2026-06-12'::date,
      true
    ),
    (
      'Alpha Tours & Taxi',
      'koh_samui',
      'tour',
      'Alpha Gay Resort & Spa',
      'WhatsApp +66 62 167 1216',
      'https://www.alphagayresort.com/services/tours',
      'Queer-friendly booking help for Ang Thong Marine Park, Koh Tao, Pig Island, snorkeling, ATV trips, island activities, and transport. It replaces six uncertain negotiations with one message and leaves more energy for choosing the correct boat-day sunglasses.',
      'Tours run according to provider schedules, weather, and availability; book in advance by WhatsApp. Ang Thong Marine Park closes annually from 1 November to 15 December.',
      'https://www.alphagayresort.com/services/tours',
      array[]::text[],
      'Alpha Gay Resort, 9/34 Moo 2, Bophut, Koh Samui, Surat Thani 84320, Thailand',
      9.53478,
      100.05775,
      '$$',
      'queer-friendly island tours and practical transport coordination',
      array['social','relax','cultural']::text[],
      'Alpha Gay Resort official tours and taxi page',
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

with ranked as (
  select
    id,
    row_number() over (
      partition by lower(trim(city)), lower(trim(name))
      order by id
    ) as duplicate_rank
  from public.places
  where lower(trim(city)) = 'koh_samui'
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
  from public.services
  where lower(trim(city)) = 'koh_samui'
)
delete from public.services s
using ranked r
where s.id = r.id
  and r.duplicate_rank > 1;

commit;

select 'places' as category, count(*) as total
from public.places
where lower(trim(city)) = 'koh_samui'

union all

select 'events', count(*)
from public.events
where lower(trim(city)) = 'koh_samui'

union all

select 'services', count(*)
from public.services
where lower(trim(city)) = 'koh_samui';
