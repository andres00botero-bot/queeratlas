-- Queer Atlas: Cyprus destination package
-- Verified 2026-06-11 against current official operator pages and the supplied travel guides.
-- Safe to run multiple times.
--
-- Coverage: Nicosia, Larnaca, Limassol, Paphos, Protaras, Ayia Napa, and south-coast beaches.
-- Intentionally excluded: Vinci Sauna, reported inactive since the Covid-19 period.

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
      'Ithaki',
      'cyprus',
      'bar',
      'Nicosia queer favorite where sugary cocktails, loud pop, cheeky hosts, and burgers from next door turn a small bar into a Friday-night personality test. Come ready to sing along and leave your serious face at home.',
      'camp pop nights with burgers on the side',
      array['pop','social','cozy']::text[],
      'Wed-Thu 19:00-02:00, Fri-Sat 19:00-03:00, Sun-Tue closed. Verify before travel.',
      'https://www.facebook.com/Ithaki33/',
      'Nikiforou Foka 33, Nicosia 1017, Cyprus',
      35.1742,
      33.37085
    ),
    (
      'Lube Bar',
      'cyprus',
      'bar',
      'Larnaca''s LGBTQ bar keeps things delightfully unsubtle with neon light, karaoke Fridays, DJ Saturdays, and a dance floor that understands the assignment. The name makes a promise; the weekend crowd supplies the sparkle.',
      'neon karaoke and sweaty weekend dancing',
      array['pop','social','mixed']::text[],
      'Wed-Fri and Sun 20:00-02:00, Sat 20:00-03:30, Mon-Tue closed. Verify before travel.',
      'https://www.facebook.com/lubebar/',
      'Stavrou Poskoti 19, Larnaca 6058, Cyprus',
      34.9310058,
      33.6380261
    ),
    (
      'Diamonds Showbar',
      'cyprus',
      'bar',
      'Protaras showbar serving cocktails, food, live music, and a nightly drag spectacle with enough lashes and costume changes to make sunset feel underdressed. It is proudly mixed, tourist-friendly, and gloriously theatrical.',
      'full-volume drag cabaret by the coast',
      array['drag','pop','social']::text[],
      '2026 season: Mon-Sat from 18:00, showtime 21:30; also Sun June-Sep. Seasonal.',
      'https://diamondsshowbar.com/',
      '342 Leoforos Protara-Cavo Greco, Protaras 5296, Cyprus',
      35.0183858,
      34.0446722
    ),
    (
      'Different Bar',
      'cyprus',
      'bar',
      'A compact Paphos gay bar where Madonna, Gaga, Cyndi, and the Pet Shop Boys share custody of the playlist. Order the strawberry daiquiri, embrace the Bar Street holiday energy, and let chronology become someone else''s problem.',
      'retro-pop daiquiri camp in Paphos',
      array['pop','social','cozy']::text[],
      'Daily 19:00-03:00 according to the latest travel guide; verify on the official page before going.',
      'https://www.facebook.com/Differentbar/',
      'Agias Napas, Bar Street, Paphos 8041, Cyprus',
      34.7578768,
      32.4159066
    ),
    (
      'DownTown Live',
      'cyprus',
      'club',
      'Nicosia live-music venue that periodically swaps the usual stage energy for a ticketed drag night. It is not a permanent queer club, but when the queens arrive the room gets a welcome dose of jokes, glitter, and affectionate public humiliation.',
      'live-music room with monthly drag sparkle',
      array['drag','mixed','social']::text[],
      'Venue schedule varies; drag programming has run on selected Sundays 20:00-00:00. Check the official calendar.',
      'https://www.facebook.com/downtownlivenicosia/',
      'Emanouil Roidi 2, Agioi Omologites, Nicosia 1095, Cyprus',
      35.1650029,
      33.3498425
    ),
    (
      'Zester Bar',
      'cyprus',
      'bar',
      'Gay-friendly Limassol bar with cocktails, dance music, and a plant-filled beer garden built for warm-night flirting. Mostly mixed, pleasantly liberated, and ideal when you want queer signal without committing to a full glitter emergency.',
      'leafy mixed garden with a camp little wink',
      array['mixed','social','chill']::text[],
      'Wed-Sun until around 23:00, Mon-Tue closed. Verify before travel.',
      'https://www.facebook.com/zester.bar/',
      'Eleftherias 108, Limassol, Cyprus',
      34.6740,
      33.0402
    ),
    (
      'Kermia Gay Beach',
      'cyprus',
      'cruising_area',
      'Unofficial queer and naturist stretch near Limnara Beach, reached across rocky ground from the Kermia area. The water is cinematic, the access is not: bring proper shoes, daylight, water, and respect for everyone sharing the cove.',
      'rocky naturist hideaway near Ayia Napa',
      array['cruise','chill','relax']::text[],
      'Public coast; daylight visits only. No managed facilities at the queer section.',
      'https://nomadicboys.com/gay-cyprus/',
      'Kermia/Limnara coastal access, Ayia Napa 5330, Cyprus',
      34.973,
      34.033167
    ),
    (
      'Pissouri Gay Beach',
      'cyprus',
      'cruising_area',
      'The unofficial gay end of Pissouri Bay sits beyond the general naturist stretch and rewards the extra walk with privacy and big Mediterranean drama. Wear shoes for the rocks and pack like your beach bag has common sense.',
      'secluded naturist cove beyond the rocks',
      array['cruise','chill','relax']::text[],
      'Public beach; daylight visits recommended. Access and sea conditions vary.',
      'https://nomadicboys.com/gay-cyprus/',
      'East end of Pissouri Bay, Pissouri 4607, Cyprus',
      34.648263,
      32.73526
    ),
    (
      'Governor''s Gay Beach',
      'cyprus',
      'cruising_area',
      'Unofficial queer cove in the white-rock Governor''s Beach area between Limassol and Larnaca. The scenery is pure editorial fantasy; the cliff and rock access are a practical reminder to wear shoes and arrive before the light starts fading.',
      'white-rock coves and low-key queer sun',
      array['cruise','chill','relax']::text[],
      'Public coast; daylight visits only. Facilities are near the main beach, not the secluded section.',
      'https://nomadicboys.com/gay-cyprus/',
      'White Rocks, Governor''s Beach, Pentakomo 4528, Cyprus',
      34.7182236,
      33.2755541
    ),
    (
      'Annabelle',
      'cyprus',
      'hotel',
      'Gay-welcoming Paphos grande dame with layered pools, sea-facing rooms, a serious wellness program, and the Ouranos rooftop bar for couples who believe nightcaps deserve a horizon. Polished, romantic, and very good at making doing nothing feel important.',
      'five-star palms, spa calm, and rooftop romance',
      array['luxury','relax','cozy']::text[],
      'Hotel operates daily; reception and guest services follow the booking confirmation.',
      'https://www.annabelle.com.cy/',
      '10 Poseidonos Avenue, Paphos 8125, Cyprus',
      34.7552807,
      32.4174452
    ),
    (
      'Leonardo Plaza Cypria Maris Beach Hotel & Spa',
      'cyprus',
      'hotel',
      'Adults-only Paphos beachfront resort with pools, spa treatments, restaurants, and an easy welcome for same-sex couples. It is the sort of place where a double-bed request is boring in the best possible way and the fish spa becomes the strangest member of your group chat.',
      'adults-only honeymoon energy without the side-eye',
      array['luxury','relax','social']::text[],
      'Hotel operates daily; reception is available 24/7.',
      'https://www.leonardo-hotels-cyprus.com/hotels-in-paphos/leonardo-plaza-cypria-maris-beach',
      '10 Theas Afroditis Avenue, Geroskipou 8204, Paphos, Cyprus',
      34.7415984,
      32.4316015
    ),
    (
      'Hotel Napa Suites',
      'cyprus',
      'hotel',
      'Gay-friendly adults-only stay with a rooftop infinity pool, Asian dining, and the kind of breakfast view that makes sunglasses feel ceremonial. Close enough to Ayia Napa''s chaos for fun, elevated enough to pretend you are above it.',
      'adults-only rooftop glamour above Ayia Napa',
      array['luxury','relax','social']::text[],
      'Hotel operates daily in season; reception and guest services follow the booking confirmation.',
      'https://napasuites.com/',
      '29-31 Demokratias Street, Ayia Napa 5330, Cyprus',
      34.9938483,
      34.0005544
    ),
    (
      'Melissi Beach Hotel & Spa',
      'cyprus',
      'hotel',
      'Gay-friendly four-star beach hotel with pools, restaurants, sports facilities, and Apis Spa''s sauna-and-steam recovery circuit. It gives you blue-flag beach calm by day and keeps Ayia Napa''s louder decisions within walking distance.',
      'beachfront wellness with Ayia Napa in reserve',
      array['relax','luxury','social']::text[],
      'Hotel operates daily in season; reception and guest services follow the booking confirmation.',
      'https://melissi.com/',
      '30 Kryou Nerou, Ayia Napa 5330, Cyprus',
      34.9855554,
      34.0095031
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
  where lower(p.city) = lower(np.city)
    and lower(p.name) = lower(np.name)
);

with new_events (
  name,
  city,
  description,
  link,
  date,
  start_date,
  end_date,
  location,
  lat,
  lng,
  vibe,
  vibe_tags
) as (
  values
    (
      'Cyprus Pride 2026',
      'cyprus',
      'Accept-LGBTI Cyprus''s annual Nicosia Pride program, combining a public march, rights visibility, community gathering, and the kind of stage energy that makes a divided capital briefly feel beautifully united. The 2026 public date was not confirmed in the checked official material; verify before travel.',
      'https://accept.cy/',
      null::date,
      null::date,
      null::date,
      'Eleftheria Square, Nicosia 1011, Cyprus',
      35.1694388,
      33.3618491,
      'rights-first capital Pride',
      array['festival','social','massive']::text[]
    ),
    (
      'Queer Cyprus Pride 2026',
      'cyprus',
      'North Nicosia Pride march and culture program organized by Queer Cyprus Association, pairing public visibility with performances, community solidarity, and a proudly border-defying queer pulse.',
      'https://www.queercyprus.org/',
      '2026-05-17'::date,
      '2026-05-17'::date,
      '2026-05-17'::date,
      'Avenue Cinemax area, North Nicosia, Cyprus',
      35.1856,
      33.3645,
      'community Pride and queer culture',
      array['festival','cultural','social']::text[]
    ),
    (
      'Diamonds Drag Show Season 2026',
      'cyprus',
      'Season-long Protaras drag cabaret with live vocals, comedy, costumes, cocktails, and a 21:30 showtime that turns an ordinary resort evening into a full production number. Runs Monday-Saturday from May, with Sundays added June-September.',
      'https://diamondsshowbar.com/',
      null::date,
      null::date,
      null::date,
      '342 Leoforos Protara-Cavo Greco, Protaras 5296, Cyprus',
      35.0183858,
      34.0446722,
      'nightly coastal drag cabaret',
      array['drag','pop','social']::text[]
    ),
    (
      'Lube Bar Summer Boat Party',
      'cyprus',
      'Occasional summer queer boat party promoted through Lube Bar in Larnaca. Dates move and details travel through official social channels, so consider this your reminder to check before packing the tiny swimwear.',
      'https://www.facebook.com/lubebar/',
      null::date,
      null::date,
      null::date,
      'Larnaca Marina, Athinon Avenue, Larnaca 6023, Cyprus',
      34.9167,
      33.6369,
      'summer queer boat party',
      array['festival','social','pop']::text[]
    )
)
insert into public.events (
  name,
  city,
  description,
  link,
  date,
  start_date,
  end_date,
  location,
  lat,
  lng,
  vibe,
  vibe_tags
)
select
  ne.name,
  ne.city,
  ne.description,
  ne.link,
  ne.date,
  ne.start_date,
  ne.end_date,
  ne.location,
  ne.lat,
  ne.lng,
  ne.vibe,
  ne.vibe_tags
from new_events ne
where not exists (
  select 1
  from public.events e
  where lower(e.city) = lower(ne.city)
    and lower(e.name) = lower(ne.name)
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
      'Queer Cyprus Psychological Counselling',
      'cyprus',
      'other',
      'Queer Cyprus Association',
      '+90 542 858 5847; info@queercyprus.org',
      'https://www.queercyprus.org/2019/05/06/psikolojik-danismanlik-hizmeti/',
      'LGBTQI+-focused psychological counselling and referral support from Queer Cyprus Association in North Nicosia.',
      'Contact-first service; sessions are arranged directly with the association.',
      'https://www.queercyprus.org/2019/05/06/psikolojik-danismanlik-hizmeti/',
      array[]::text[],
      'Ahmet Sadik Sokak, Temel Apartments No. 5/6, North Nicosia, Cyprus',
      35.1799174,
      33.3506038,
      null::text,
      'confidential queer-affirming support',
      array['service','cozy']::text[],
      'Queer Cyprus Association official service page',
      '2026-06-11'::date,
      true
    ),
    (
      'Queer Cyprus Legal Counselling',
      'cyprus',
      'other',
      'Queer Cyprus Association',
      '+90 542 858 5847; info@queercyprus.org',
      'https://www.queercyprus.org/2019/05/06/hukuki-danismanlik-hizmeti/',
      'Legal information, counselling, and referral support for LGBTQI+ people dealing with discrimination, rights questions, or access barriers.',
      'Contact-first service; appointments are arranged directly with the association.',
      'https://www.queercyprus.org/2019/05/06/hukuki-danismanlik-hizmeti/',
      array[]::text[],
      'Ahmet Sadik Sokak, Temel Apartments No. 5/6, North Nicosia, Cyprus',
      35.1799174,
      33.3506038,
      null::text,
      'rights support without the courtroom fog',
      array['service','cultural']::text[],
      'Queer Cyprus Association official service page',
      '2026-06-11'::date,
      true
    ),
    (
      'Queer Cyprus Social Service',
      'cyprus',
      'other',
      'Queer Cyprus Association',
      '+90 542 858 5847; info@queercyprus.org',
      'https://www.queercyprus.org/2023/04/11/kuir-kibris-dernegi-sosyal-hizmet-servisi/',
      'LGBTQI+-focused social support, practical guidance, and referrals delivered through Queer Cyprus Association.',
      'Contact-first service; support hours are confirmed directly by the association.',
      'https://www.queercyprus.org/2023/04/11/kuir-kibris-dernegi-sosyal-hizmet-servisi/',
      array[]::text[],
      'Ahmet Sadik Sokak, Temel Apartments No. 5/6, North Nicosia, Cyprus',
      35.1799174,
      33.3506038,
      null::text,
      'community care with practical next steps',
      array['service','social']::text[],
      'Queer Cyprus Association official service page',
      '2026-06-11'::date,
      true
    ),
    (
      'Apis Spa at Melissi Beach',
      'cyprus',
      'wellness',
      'Melissi Beach Hotel & Spa',
      '+357 23 724800; info@melissi.com',
      'https://melissi.com/',
      'Hotel spa with massage and beauty treatments plus sauna, steam bath, ice fountain, and heated-lounger recovery facilities near Ayia Napa.',
      'By appointment during the hotel operating season; confirm treatment and facility hours directly.',
      'https://melissi.com/',
      array[]::text[],
      '30 Kryou Nerou, Ayia Napa 5330, Cyprus',
      34.9855554,
      34.0095031,
      '$$$',
      'sauna-steam reset after Ayia Napa decisions',
      array['relax','luxury','service']::text[],
      'Melissi Beach Hotel official website; Nomadic Boys Cyprus guide',
      '2026-06-11'::date,
      true
    ),
    (
      'Ouranos Wellbeing Spa at Annabelle',
      'cyprus',
      'wellness',
      'Annabelle',
      '+357 26 885000; info@annabelle.com.cy',
      'https://www.annabelle.com.cy/wellness/overview',
      'Paphos hotel wellness program with spa and beauty treatments, fitness facilities, pools, and a polished Mediterranean setting.',
      'Treatments by appointment; confirm daily spa and facility hours with the hotel.',
      'https://www.annabelle.com.cy/wellness/overview',
      array[]::text[],
      '10 Poseidonos Avenue, Paphos 8125, Cyprus',
      34.7552807,
      32.4174452,
      '$$$$',
      'five-star rooftop-to-spa exhale',
      array['luxury','relax','service']::text[],
      'Annabelle official website; Nomadic Boys Cyprus guide',
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
  where lower(s.city) = lower(ns.city)
    and lower(s.name) = lower(ns.name)
);

commit;
