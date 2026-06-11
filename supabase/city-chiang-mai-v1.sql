-- Queer Atlas: Chiang Mai city package
-- Approved 2026-06-11.
-- Safe to run multiple times.
--
-- Actions:
-- - Adds 8 venues.
-- - Adds 3 services.
-- - Adds no events because Chiang Mai Pride 2026 occurred on 2026-05-24
--   and no future official date has been published.

begin;

with new_places (
  name,
  city,
  type,
  description,
  vibe,
  vibe_tags,
  hours,
  link,
  location,
  lat,
  lng
) as (
  values
    (
      'Ram Bar',
      'chiang_mai',
      'bar',
      'Chiang Mai''s best-known gay show bar serves cocktails, snacks, handsome hosting, and a free cabaret every night. Arrive early, because the feathers have excellent timing and absolutely no intention of saving you a seat.',
      'free drag, feathers and gloriously friendly chaos',
      array['drag','pop','social']::text[],
      'Daily 18:00-01:30. May close on selected Buddhist, election, or royal observance dates.',
      'https://ram-bar.gay-in-chiangmai.com/',
      '48 Charoen Prathet Soi 6, Chang Khlan, Chiang Mai 50100, Thailand',
      18.786329,
      98.998212
    ),
    (
      'Adam''s Apple Club',
      'chiang_mai',
      'bar',
      'Long-running gay host and show bar with male dancers, drag, cocktails, plush seating, and a nightly 22:00 production. The drinks cost more than at a street bar, but even the lighting arrives with better posture than most of us.',
      'polished host-bar fantasy with nightly male cabaret',
      array['men_only','pop','social']::text[],
      'Daily 21:00-01:00; main show around 22:00.',
      'https://www.adamsappleclub.com/',
      '1/21-22 Wiengbua Road, Chang Phueak, Chiang Mai 50300, Thailand',
      18.806628,
      98.978439
    ),
    (
      'New Circle Club Chiangmai',
      'chiang_mai',
      'bar',
      'Established gay host bar with male dancers, music, and two compact shows each evening. It is a small room with very large confidence and enough choreographed eye contact to reorganize your itinerary.',
      'intimate host-bar theatre with two nightly shows',
      array['men_only','pop','social']::text[],
      'Daily 20:00-01:00.',
      'https://www.facebook.com/new.circle.club',
      '161/7-8 Soi Erawan, Chang Phueak Road, Chiang Mai 50300, Thailand',
      18.808837,
      98.9828
    ),
    (
      'Orion Bar',
      'chiang_mai',
      'bar',
      'Small Night Bazaar gay bar with outdoor seating, a pool table, friendly staff, and easy cocktails. It is ideal for the first drink before the evening grows taller hair, louder music, and considerably worse impulse control.',
      'tiny outdoor warm-up bar with Night Bazaar charm',
      array['chill','social','cozy']::text[],
      'Mon-Fri 17:00-01:00, Sat-Sun 17:00-02:00.',
      'https://www.travelgay.com/venue/orion-bar',
      'Night Bazaar, Charoen Prathet Soi 6, Chang Khlan, Chiang Mai 50100, Thailand',
      18.785543,
      98.998471
    ),
    (
      'Chiang Mai 19 Bar',
      'chiang_mai',
      'bar',
      'Relaxed gay bar behind the Night Bazaar with outdoor tables, affordable cocktails, barbecue, and an inclusive neighborhood mood. More garden gathering than giant club, which is excellent when your liver has requested a planning meeting.',
      'affordable cocktails, outdoor tables and queer neighborhood warmth',
      array['chill','cozy','social']::text[],
      'Tue-Sat 18:00-01:00, Sun 18:00-00:00; Monday hours should be confirmed before visiting.',
      'https://www.facebook.com/ChiangMai19Bar/',
      'QXPX+3R8, Chang Moi, Chiang Mai 50300, Thailand',
      18.786891,
      99.001509
    ),
    (
      'Warm Up Cafe',
      'chiang_mai',
      'club',
      'Long-running Nimman nightlife institution with live bands, EDM, outdoor space, several rooms, and a young mixed crowd with noticeable LGBTQ+ crossover. It is not a dedicated gay club, but the dance floor remains convincingly fluent.',
      'student-heavy mixed megaclub with strong queer crossover',
      array['electronic','mixed','massive']::text[],
      'Daily 19:00-02:00.',
      'https://www.travelgay.com/venue/warm-up',
      '40 Nimmanhaemin Road, Suthep, Chiang Mai 50200, Thailand',
      18.798689,
      98.968033
    ),
    (
      'Club One Seven Sauna',
      'chiang_mai',
      'sauna',
      'Gay men''s sauna beside the Ping River with a pool, gym, sauna, herbal steam room, relaxation areas, massage, cafe, and sun terrace. It is wellness with considerably more flexible wardrobe expectations.',
      'riverside pool, herbal steam and clothing-optional possibilities',
      array['cruise','men_only','relax']::text[],
      'Daily 15:00-23:00.',
      'https://cluboneseven.net/facilities/',
      '385/2 Charoen Prathet Road, Chang Khlan, Chiang Mai 50100, Thailand',
      18.766218,
      99.003067
    ),
    (
      'Club One Seven Gay Men Guesthouse',
      'chiang_mai',
      'hotel',
      'Gay men''s guesthouse in an antique riverside teak house with rooms, cafe, gym, sauna, and a memorably shaped swimming pool. The architecture is charming, the atmosphere is social, and the pool refuses to explain itself.',
      'teak-house gay retreat with a famously suggestive pool',
      array['men_only','chill','social']::text[],
      'Hotel operates daily; reception is available 24 hours.',
      'https://cluboneseven.net/',
      '385/2 Charoen Prathet Road, Chang Khlan, Chiang Mai 50100, Thailand',
      18.766218,
      99.003067
    )
)
insert into public.places (
  name,
  city,
  type,
  description,
  vibe,
  vibe_tags,
  hours,
  link,
  location,
  lat,
  lng
)
select
  np.name,
  np.city,
  np.type,
  np.description,
  np.vibe,
  np.vibe_tags,
  np.hours,
  np.link,
  np.location,
  np.lat,
  np.lng
from new_places np
where not exists (
  select 1
  from public.places p
  where lower(trim(p.city)) = lower(trim(np.city))
    and lower(trim(p.name)) = lower(trim(np.name))
);

with new_services (
  name,
  city,
  type,
  provider_name,
  contact,
  booking_link,
  description,
  hours,
  link,
  image_urls,
  location,
  lat,
  lng,
  price_tier,
  vibe,
  vibe_tags,
  source,
  "lastChecked",
  verified
) as (
  values
    (
      'Ziam Spa and Thai Massage',
      'chiang_mai',
      'massage',
      'Ziam Spa and Thai Massage',
      null::text,
      'https://www.travelgay.com/venue/ziam-spa-and-thai-massage',
      'Gay-exclusive massage spa for men in a Lanna-style building with trained male therapists, private treatment rooms, hot showers, and Jacuzzi-equipped rooms. A more graceful recovery plan than lying face-down and negotiating with yesterday''s dance floor.',
      'Daily 10:00-22:00; advance reservation required.',
      'https://www.travelgay.com/venue/ziam-spa-and-thai-massage',
      array[]::text[],
      '80/1 Ratchadamnoen Road, Si Phum, Chiang Mai 50200, Thailand',
      18.788809,
      98.985506,
      '$$',
      'Lanna-style male massage without rushed spa-factory energy',
      array['men_only','relax','service']::text[],
      'Travel Gay Chiang Mai massage guide',
      '2026-06-11'::date,
      true
    ),
    (
      'Classic House Massage',
      'chiang_mai',
      'massage',
      'Classic House Massage',
      '+66 53 904 582',
      'https://www.classichousemassage.net/',
      'Centrally located male massage house near Thapae Road with long evening hours and private treatments. Useful when five temples and three bars have inspired your body to submit a formal complaint.',
      'Daily 12:00-00:00.',
      'https://www.classichousemassage.net/',
      array[]::text[],
      '27/2 Thapae Road Soi 4, Chang Khlan, Chiang Mai 50100, Thailand',
      18.787327,
      98.995872,
      '$$',
      'central male massage house for late-evening recovery',
      array['men_only','relax','service']::text[],
      'Gay in Chiang Mai massage guide and official website',
      '2026-06-11'::date,
      true
    ),
    (
      'The Gentle Massage and Spa',
      'chiang_mai',
      'massage',
      'The Gentle Massage and Spa',
      '+66 62 425 5262; gentle.massage2019@gmail.com',
      'https://www.thegentlemassageandspa.com/',
      'LGBTQ-friendly Nimman wellness spa offering Thai, oil, and foot massage, warm baths, herbal steam, body scrubs, and facial treatments. Awarded Thai World Class Spa Gold and ideal when the holiday version of you needs professional restoration.',
      'Daily 11:00-23:00.',
      'https://www.thegentlemassageandspa.com/',
      array[]::text[],
      '26/5 Nimmanhaemin Road Soi 5, Suthep, Chiang Mai 50200, Thailand',
      18.7966,
      98.9682,
      '$$',
      'award-winning Nimman wellness with polished Lanna calm',
      array['mixed','relax','service']::text[],
      'The Gentle Massage and Spa official website',
      '2026-06-11'::date,
      true
    )
)
insert into public.services (
  name,
  city,
  type,
  provider_name,
  contact,
  booking_link,
  description,
  hours,
  link,
  image_urls,
  location,
  lat,
  lng,
  price_tier,
  vibe,
  vibe_tags,
  source,
  "lastChecked",
  verified
)
select
  ns.name,
  ns.city,
  ns.type,
  ns.provider_name,
  ns.contact,
  ns.booking_link,
  ns.description,
  ns.hours,
  ns.link,
  ns.image_urls,
  ns.location,
  ns.lat,
  ns.lng,
  ns.price_tier,
  ns.vibe,
  ns.vibe_tags,
  ns.source,
  ns."lastChecked",
  ns.verified
from new_services ns
where not exists (
  select 1
  from public.services s
  where lower(trim(s.city)) = lower(trim(ns.city))
    and lower(trim(s.name)) = lower(trim(ns.name))
);

commit;
