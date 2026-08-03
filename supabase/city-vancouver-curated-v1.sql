-- Queer Atlas: Vancouver curated city package
-- Approved 2026-06-11.
-- Safe to run multiple times.
--
-- Actions:
-- - Updates 6 existing venues.
-- - Adds 6 venues.
-- - Updates 3 existing events.
-- - Removes 1 unverified event.
-- - Adds 4 verified events.
-- - Adds 5 verified services.

begin;

with updated_places (
  existing_id,
  old_name,
  name,
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
      532::bigint,
      'Numbers',
      'Numbers Cabaret',
      'bar',
      'Vancouver''s longest-running gay club spreads the fun across three rainbow-lit levels with a dance floor, pool, darts, drag, and the beloved FunBox karaoke room. It is the Davie Village institution for anyone who says they are only stopping in for one song and then mysteriously leaves at closing.',
      'three-floor rainbow karaoke institution',
      array['drag','pop','social']::text[],
      'Daily 21:00-03:00.',
      'https://numbers.ca/',
      '1042 Davie Street, Vancouver, BC V6E 1M3, Canada',
      49.2796989,
      -123.130399
    ),
    (
      533::bigint,
      'The PumpJack',
      'The PumpJack',
      'bar',
      'Davie Village gay pub with deep bear and leather roots, a busy patio, DJs, underwear parties, go-go nights, and the legendary Sunday kegger. Come for neighborhood-bar warmth; stay because Friday has become delightfully less dressed than expected.',
      'leather bears patio and gloriously messy Fridays',
      array['fetish','men_only','social']::text[],
      'Sun 13:00-03:00, Mon-Thu 13:00-04:00, Fri-Sat 13:00-03:00.',
      'https://www.pumpjackpub.com/',
      '1167 Davie Street, Vancouver, BC V6E 1N2, Canada',
      49.2814951,
      -123.132742
    ),
    (
      534::bigint,
      '1181',
      '1181 Bar + Lounge',
      'bar',
      'Low-key Davie Village gay cocktail lounge built around music, drinks, culture, community, and Sunday drag. The room is polished without becoming precious, making it a fine place to flirt elegantly before the evening forgets its manners.',
      'polished cocktails and Sunday drag flirtation',
      array['cozy','drag','social']::text[],
      'Evenings daily until around 03:00 according to the latest travel guide; verify before travel.',
      'https://www.facebook.com/eleven81',
      '1181 Davie Street, Vancouver, BC, Canada',
      49.281603,
      -123.132897
    ),
    (
      535::bigint,
      'The Junction',
      'The Junction',
      'club',
      'Welcoming Davie Village pub and club with food, patio drinks, trivia, drag, DJs, and a dance floor that grows steadily less theoretical as midnight approaches. It can begin as lunch and end as choreography, which is excellent urban planning.',
      'patio lunch that shapeshifts into drag and dancing',
      array['drag','pop','social']::text[],
      'Daily 13:30-03:00.',
      'https://www.junctionpub.com/',
      '1138 Davie Street, Vancouver, BC V6E 4L7, Canada',
      49.2807293,
      -123.132345
    ),
    (
      536::bigint,
      'F212 Steam',
      'F212 Steam',
      'sauna',
      'Davie Village men''s sauna with Vancouver''s largest hot tub, dark video room, cruiser shower, open-play areas, and recurring themed sessions. Open around the clock and next door to Numbers, it is remarkably convenient when karaoke did not provide sufficient closure.',
      'Davie Village hot-tub labyrinth after midnight',
      array['cruise','men_only','relax']::text[],
      'Open 24 hours daily according to the latest travel guides.',
      '',
      '1048 Davie Street, Vancouver, BC, Canada',
      49.2797986,
      -123.130533
    ),
    (
      537::bigint,
      'Wreck Beach',
      'Oasis at Wreck Beach',
      'cruising_area',
      'The queer-popular section of Vancouver''s vast clothing-optional Wreck Beach sits left of the main Trail 6 access after the stair descent. It is social, naturist, gloriously unbothered, and followed by a staircase that will personally audit every skipped leg day.',
      'clothing-optional queer summer legend with a staircase finale',
      array['cruise','chill','relax']::text[],
      'Public beach; daylight visits recommended, with the strongest queer crowd on warm summer afternoons and weekends.',
      'https://wreckbeach.org/',
      'Oasis section, Wreck Beach Trail 6, Vancouver, BC, Canada',
      49.2615914,
      -123.2617935
    )
)
update public.places p
set
  name = up.name,
  type = up.type,
  description = up.description,
  vibe = up.vibe,
  vibe_tags = up.vibe_tags,
  hours = up.hours,
  link = up.link,
  location = up.location,
  lat = up.lat,
  lng = up.lng
from updated_places up
where lower(p.city) = 'vancouver'
  and (
    p.id = up.existing_id
    or lower(p.name) = lower(up.old_name)
    or lower(p.name) = lower(up.name)
  );

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
      'The Fountainhead Pub',
      'vancouver',
      'bar',
      'Classic Davie Village gay gastropub with brunch, generous pub food, 17 draft lines, daily specials, and one of the neighborhood''s best people-watching patios. It is where a quiet afternoon beer can acquire a cast, a subplot, and several opinions.',
      'big gay patio, brunch, beer and Olympic-level people-watching',
      array['social','chill','mixed']::text[],
      'Sun-Thu 11:00-00:00, Fri-Sat 11:00-01:00.',
      'https://thefountainheadpub.com/',
      '1025 Davie Street, Vancouver, BC, Canada',
      49.279654,
      -123.12973
    ),
    (
      'Celebrities Nightclub',
      'vancouver',
      'club',
      'Historic Davie Street nightclub with a huge dance floor, high-production lighting, touring artists, house anthems, club hits, hip-hop, and EDM crossover nights. The crowd is now mixed, but the building still carries enough gay history and lasers to qualify as a public utility.',
      'historic gay superclub with lasers and pop-star delusions',
      array['electronic','pop','massive']::text[],
      'Tue, Thu-Sat 22:00-03:00, plus selected special events.',
      'https://www.celebritiesnightclub.com/',
      '1022 Davie Street, Vancouver, BC V6E 1M3, Canada',
      49.2793851,
      -123.129915
    ),
    (
      'Score on Davie',
      'vancouver',
      'cafe',
      'Queer-friendly West End sports pub known for brunch, neighborhood regulars, screens, comfort food, and Caesars so dramatically garnished they appear to have arrived with carry-on luggage. Social, silly, and very Davie.',
      'queer sports-bar brunch with outrageous Caesars',
      array['social','mixed','cozy']::text[],
      'Mon-Fri 11:00-late, Sat-Sun 10:00-late; weekend brunch 10:00-14:00.',
      'https://scoredavie.com/',
      '1262 Davie Street, Vancouver, BC V6E 1N3, Canada',
      49.2823322,
      -123.134561
    ),
    (
      'Steamworks Baths Vancouver',
      'vancouver',
      'sauna',
      'Long-running men''s bathhouse near Gastown with round-the-clock access, private rooms, lockers, steam, cruising areas, recurring promotions, and more than four decades of experience helping Vancouver avoid an unnecessarily early bedtime.',
      'forty-year bathhouse institution with round-the-clock possibilities',
      array['cruise','men_only','relax']::text[],
      'Open 24 hours daily.',
      'https://www.facebook.com/steamworksvancouver/',
      '123 West Pender Street, Vancouver, BC, Canada',
      49.2813559,
      -123.108216
    ),
    (
      'OPUS Vancouver',
      'vancouver',
      'hotel',
      'Proudly queer-welcoming Yaletown boutique hotel with bold rooms, spa-style bathrooms, complimentary bicycles, lively dining nearby, and quick access to Davie Village. It dresses like a design magazine but still knows where the party is.',
      'Yaletown boutique glamour with proudly queer hospitality',
      array['luxury','cozy','social']::text[],
      'Hotel operates daily; reception and guest-service hours follow the booking confirmation.',
      'https://opushotel.com/',
      '322 Davie Street, Vancouver, BC V6B 5Z6, Canada',
      49.27458,
      -123.122482
    ),
    (
      'The Burrard',
      'vancouver',
      'hotel',
      'Retro-modern downtown motel with a leafy courtyard, playful design, complimentary cruiser bikes, and an easy walk to Davie Village. It offers the rare Vancouver luxury of looking cute without requiring your credit card to enter witness protection.',
      'retro courtyard motel serving affordable downtown camp',
      array['cozy','mixed','social']::text[],
      'Hotel operates daily; reception and guest-service hours follow the booking confirmation.',
      'https://theburrard.com/',
      '1100 Burrard Street, Vancouver, BC, Canada',
      49.2797579,
      -123.1277323
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

with updated_events (
  existing_id,
  old_name,
  name,
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
      42::bigint,
      'Vancouver Gay Pride 2026',
      'Vancouver Pride 2026',
      'Vancouver Pride 2026 runs from July 25 through August 2 under the theme Unapologetically Queer, filling Davie Village and the wider city with community events, culture, nightlife, public visibility, and a grand-finale parade and street festival.',
      'https://www.vancouverpride.ca/pride2026',
      '2026-07-25'::date,
      '2026-07-25'::date,
      '2026-08-02'::date,
      'Davie Village and central Vancouver, BC, Canada',
      49.282,
      -123.132,
      'Unapologetically Queer citywide Pride season',
      array['festival','massive','social']::text[]
    ),
    (
      328::bigint,
      'Vancouver Pride Parade 2026',
      'Vancouver Pride Parade 2026',
      'Vancouver Pride Society''s signature parade returns on August 2 with more than 100,000 spectators expected, Host Nations leadership, community groups, floats, marching bands, art, music, and four accessible viewing zones. Final route and start time should be checked on the official Pride page.',
      'https://www.vancouverpride.ca/pride2026',
      '2026-08-02'::date,
      '2026-08-02'::date,
      '2026-08-02'::date,
      'Central Vancouver, BC, Canada; final route to be confirmed',
      49.2767,
      -123.1216,
      'mass public parade and queer visibility',
      array['festival','massive','cultural']::text[]
    ),
    (
      329::bigint,
      'VAN Pride Fest 2026',
      'Davie Village Pride Fest 2026',
      'Vancouver Pride''s grand-finale street festival takes over Davie Street and Nelson Park with live music, drag, DJs, roaming performers, community vendors, and all-ages queer joy. Davie Street runs 14:00-22:00 and Nelson Park 14:00-21:00.',
      'https://www.vancouverpride.ca/pride2026',
      '2026-08-02'::date,
      '2026-08-02'::date,
      '2026-08-02'::date,
      'Davie Street from Burrard to Jervis and Nelson Park, Vancouver, BC, Canada',
      49.2828539,
      -123.1296435,
      'Davie street festival with drag and chosen-family glow',
      array['drag','festival','social']::text[]
    )
)
update public.events e
set
  name = ue.name,
  description = ue.description,
  link = ue.link,
  date = ue.date,
  start_date = ue.start_date,
  end_date = ue.end_date,
  location = ue.location,
  lat = ue.lat,
  lng = ue.lng,
  vibe = ue.vibe,
  vibe_tags = ue.vibe_tags
from updated_events ue
where lower(e.city) = 'vancouver'
  and (
    e.id = ue.existing_id
    or lower(e.name) = lower(ue.old_name)
    or lower(e.name) = lower(ue.name)
  );

delete from public.events
where lower(city) = 'vancouver'
  and (
    id = 331
    or lower(name) = 'parade festival after party 2026'
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
      'East Side Pride 2026',
      'vancouver',
      'Two-day grassroots Pride program rooted in East Vancouver community care. The June 27 Grandview Park festival runs 11:00-17:00 with drag, live music, artists, food, vendors, and community organizations, followed by additional performances and an all-ages drag brunch on June 28.',
      'https://www.vancouverpride.ca/east-side-pride',
      '2026-06-27'::date,
      '2026-06-27'::date,
      '2026-06-28'::date,
      'Grandview Park and Howe Sound Taphouse, East Vancouver, BC, Canada',
      49.2734981,
      -123.0705411,
      'grassroots park Pride with drag, music and chosen family',
      array['drag','cultural','social']::text[]
    ),
    (
      'Vancouver Pride Run & Walk 2026',
      'vancouver',
      'Vancouver Frontrunners'' annual 5K run or walk and 10K run for 2SLGBTQIA+ communities, friends, and allies. The 43rd edition begins Sunday morning in Stanley Park and combines movement, fundraising, community visibility, and the very queer pleasure of earning brunch.',
      'https://www.vancouverfrontrunners.org/pride-run-walk',
      '2026-07-26'::date,
      '2026-07-26'::date,
      '2026-07-26'::date,
      'Brockton Oval, Stanley Park, Vancouver, BC, Canada',
      49.2995532,
      -123.1252342,
      '5K and 10K rainbow run with community breakfast energy',
      array['festival','social','chill']::text[]
    ),
    (
      'Queer Arts Festival 2026: On the Edge',
      'vancouver',
      'Month-long multidisciplinary festival examining danger, possibility, queer resistance, and reinvention through exhibitions, performance, storytelling, workshops, boxing, printmaking, and nightlife across Vancouver arts venues.',
      'https://queerartsfestival.com/on-the-edge/',
      '2026-06-05'::date,
      '2026-06-05'::date,
      '2026-06-30'::date,
      'SUM Gallery and multiple Vancouver arts venues; hub at 268 Keefer Street, Vancouver, BC, Canada',
      49.2791834,
      -123.0980287,
      'month-long queer art at the beautiful edge of trouble',
      array['cultural','festival','underground']::text[]
    ),
    (
      'Vancouver Queer Film Festival 2026',
      'vancouver',
      'The 38th annual Vancouver Queer Film Festival presents international and local 2SLGBTQIA+ cinema, artist conversations, industry programming, workshops, parties, and awards across a multi-venue September program.',
      'https://outonscreen.com/',
      '2026-09-10'::date,
      '2026-09-10'::date,
      '2026-09-27'::date,
      'Multiple venues in Vancouver, BC, Canada',
      49.2827,
      -123.1207,
      'Western Canada queer cinema season with screenings and galas',
      array['cultural','festival','social']::text[]
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
      'The Really Gay History Tour',
      'vancouver',
      'tour',
      'Forbidden Vancouver Walking Tours',
      null::text,
      'https://forbiddenvancouver.ca/really-gay-history-tour/',
      'Wheelchair-accessible two-hour walking tour through Vancouver''s queer history, from drag kings and Two-Spirit warriors to early Pride, censorship battles, AIDS activism, and the people who made Davie Village possible. Guide Glenn''s pink outfit is both branding and public service.',
      'Every Sun 10:00; approximately 2 hours. Private tours are also available.',
      'https://forbiddenvancouver.ca/really-gay-history-tour/',
      array[]::text[],
      'Starts outside Trees Organic Coffee, 930 Burrard Street, Vancouver, BC, Canada',
      49.2818796,
      -123.124522,
      '$$',
      'pink-clad queer history with jokes and righteous anger',
      array['cultural','social','service']::text[],
      'Forbidden Vancouver official tour page; Nomadic Boys Vancouver guide',
      '2026-06-11'::date,
      true
    ),
    (
      'Vancouver Frontrunners Drop-in Runs',
      'vancouver',
      'wellness',
      'Vancouver Frontrunners',
      null::text,
      'https://www.vancouverfrontrunners.org/check-us-out',
      'Visitor-friendly queer running and walking group with paced routes, newcomer pairing, showers, lockers, and a post-run meal. Wednesdays use the Yaletown seawall; Saturdays move through Stanley Park, proving cardio is more persuasive when followed by chosen-family breakfast.',
      'Wed 18:30 at Roundhouse Community Centre; Sat 09:00 at Brockton Oval Fieldhouse. Runs every week, rain or shine.',
      'https://www.vancouverfrontrunners.org/check-us-out',
      array[]::text[],
      'Roundhouse Community Centre, 181 Roundhouse Mews, Vancouver, BC; Saturday group at Brockton Oval Fieldhouse, Stanley Park',
      49.2734008,
      -123.1219386,
      '$',
      'social running group where nobody gets left fabulous and alone',
      array['social','relax','service']::text[],
      'Vancouver Frontrunners official website; Nomadic Boys Vancouver guide',
      '2026-06-11'::date,
      true
    ),
    (
      'Little Sister''s Book & Art Emporium',
      'vancouver',
      'other',
      'Little Sister''s Book & Art Emporium',
      '+1 604-669-1753; info@littlesisters.ca',
      'https://www.littlesisters.ca/',
      'Historic LGBTQ+ bookstore and adult shop selling queer literature, local-interest titles, Pride goods, trans gear, sexual-wellness products, and enough cultural legacy to make a shopping trip feel like a tiny freedom-of-expression pilgrimage.',
      'Daily 10:00-21:00.',
      'https://www.littlesisters.ca/pages/contact-us',
      array[]::text[],
      'Unit 1, 1238 Davie Street, Vancouver, BC V6E 1N3, Canada',
      49.2820575,
      -123.1344462,
      '$$',
      'historic queer bookstore, adult shop and censorship-fighting icon',
      array['cultural','social','service']::text[],
      'Little Sister''s official contact page',
      '2026-06-11'::date,
      true
    ),
    (
      'QMUNITY Counselling & Referral',
      'vancouver',
      'wellness',
      'QMUNITY',
      '+1 604-684-5307; reception@qmunity.ca',
      'https://www.qmunity.ca/counselling',
      'Reduced-cost counselling, information, referrals, peer support, and community connection for queer, trans, and Two-Spirit people. Free counselling may be available in some circumstances; this is not a crisis or same-day service.',
      'Appointments Mon-Fri 10:00-18:00. Office hours Mon-Fri 10:00-18:00.',
      'https://www.qmunity.ca/counselling',
      array[]::text[],
      '1170 Bute Street, Vancouver, BC V6E 1Z6, Canada',
      49.281865,
      -123.1329789,
      '$',
      'queer, trans and Two-Spirit care without corporate coldness',
      array['cozy','social','service']::text[],
      'QMUNITY official counselling and contact pages',
      '2026-06-11'::date,
      true
    ),
    (
      'HIM on Davie Health Centre',
      'vancouver',
      'wellness',
      'Health Initiative for Men',
      '+1 604-675-2767',
      'https://checkhimout.ca/programs-and-services/sexual/appointment/',
      'Low-barrier sexual-health centre serving queer men and gender-diverse people with testing, treatment, PrEP and PEP navigation, DoxyPEP information, vaccinations, counselling pathways, and nurse-supported care.',
      'Mon-Thu 14:00-20:30, Fri-Sat 09:30-16:00; holidays closed.',
      'https://checkhimout.ca/programs-and-services/sexual/appointment/',
      array[]::text[],
      'Suite 416, 1033 Davie Street, Vancouver, BC, Canada',
      49.2798176,
      -123.1297728,
      '$',
      'low-barrier sexual health care for queer men and gender-diverse people',
      array['relax','social','service']::text[],
      'Health Initiative for Men official booking page',
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
