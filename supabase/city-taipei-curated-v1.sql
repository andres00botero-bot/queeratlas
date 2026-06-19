-- Queer Atlas: Taipei new content only
-- Verified 2026-06-19.
-- Safe to run multiple times.
--
-- Checked existing app seed before writing this package.
-- Existing Taipei venues/events are intentionally excluded from this insert package.
--
-- Taiwan is country only. This package inserts content for city = 'taipei'.
-- Restaurants and cafes use type = 'cafe' as required by the app/database.

begin;

insert into public.places (
  name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng
)
select
  v.name, v.city, v.type, v.description, v.vibe, v.vibe_tags,
  v.hours, v.link, v.location, v.lat, v.lng
from (
  values
    (
      'G.Star',
      'taipei',
      'club',
      'A packed two-floor gay dance club with young local energy, chart music, K-pop, themed nights, dancers and private karaoke rooms upstairs.',
      'young local gay dance club with k-pop and karaoke',
      array[]::text[],
      'Mon-Tue closed; Wed-Sun 22:00-05:00. Verify current schedule before visiting.',
      'https://www.travelgay.com/taipei-gay-dance-clubs-parties',
      'B1F, No. 23, Longjiang Road, Zhongshan District, Taipei City, Taiwan',
      25.047900,
      121.540300
    ),
    (
      'HERO Bar',
      'taipei',
      'bar',
      'A multi-floor gay bar near Ximen and the Red House, with live DJ energy, dancing, food and an upstairs cruise area.',
      'multi-floor Ximen gay bar with dancing and cruise edge',
      array[]::text[],
      'Mon closed; Tue-Thu 20:00-02:00; Fri-Sat 20:00-04:00; Sun 20:00-02:00. Verify before visiting.',
      'https://www.travelgay.com/venue/hero-bar',
      '2F-4F, No. 15-2, Kunming Street, Wanhua District, Taipei City, Taiwan',
      25.045850,
      121.505650
    ),
    (
      'Casa Cafe & Bar',
      'taipei',
      'cafe',
      'A laid-back Red House cafe-bar formerly known as G-Mixi, with industrial styling, friendly service and easy movement between drinks, people-watching and Ximending bar-hopping.',
      'red house cafe bar for relaxed terrace drinks',
      array[]::text[],
      'Daily 18:00-02:00. Verify current hours before visiting.',
      'https://www.travelgay.com/taipei-gay-bars',
      'No. 57-59, Lane 10, Chengdu Road, Wanhua District, Taipei City, Taiwan',
      25.042100,
      121.508050
    ),
    (
      'Matt Bar',
      'taipei',
      'bar',
      'A Zhongshan gay karaoke bar with bear-cartoon art, multilingual song choices and a social late-night room outside the Red House cluster.',
      'zhongshan gay karaoke bar with bear-friendly signal',
      array[]::text[],
      'Daily 21:00-03:00. Verify current hours before visiting.',
      'https://www.travelgay.com/venue/matt-bar',
      'No. 11, Lane 121, Section 1, Zhongshan North Road, Zhongshan District, Taipei City, Taiwan',
      25.050450,
      121.522650
    ),
    (
      'Chez Nous Bar',
      'taipei',
      'bar',
      'A polished gay-friendly hotel bar inside Chez Nous, useful for cocktails, date energy and occasional gay parties on the Daan side.',
      'sophisticated gay-friendly cocktail bar with occasional parties',
      array[]::text[],
      'Daily 20:00-01:00. Verify current programme before visiting.',
      'https://www.travelgay.com/venue/chez-nous-bar',
      'No. 18, Lane 147, Section 3, Xinyi Road, Daan District, Taipei City, Taiwan',
      25.033450,
      121.542650
    ),
    (
      'WAY Bar',
      'taipei',
      'bar',
      'A Zhongshan gay karaoke bar with late hours, darts and a social singing crowd.',
      'late zhongshan gay karaoke and darts bar',
      array[]::text[],
      'Sun-Thu 22:00-05:00; Fri-Sat 22:00-06:00. Minimum spend may apply; verify current rules.',
      'https://www.travelgay.com/taipei-gay-bars',
      'No. 60, Lane 85, Linsen North Road, Zhongshan District, Taipei City, Taiwan',
      25.050250,
      121.525950
    ),
    (
      'Wonder Bar & Lounge',
      'taipei',
      'bar',
      'A women, fem and they/them-friendly lounge-bar with colourful nightlife energy, dancing on the right nights and a softer alternative to the male-heavy Ximen circuit.',
      'women-centered queer lounge with dancing and colour',
      array[]::text[],
      'Mon closed; Tue 19:00-01:00; Wed 18:30-01:00; Thu 19:00-01:00; Fri-Sat 19:00-02:00; Sun 19:00-01:00.',
      'https://www.travelgay.com/taipei-gay-bars',
      'No. 183, Fuxing North Road, Songshan District, Taipei City 105, Taiwan',
      25.054950,
      121.544250
    ),
    (
      'Al Reves',
      'taipei',
      'cafe',
      'A gay-owned, gay-friendly Ximen restaurant-cafe serving Taiwanese and international comfort food, brunch-style plates, risotto, pasta, cocktails and relaxed recharge energy near the gay district.',
      'gay-owned ximen cafe restaurant and cocktail stop',
      array[]::text[],
      'Mon closed; Tue-Sun 12:00-20:30. Verify current kitchen hours before visiting.',
      'https://www.travelgay.com/taipei-restaurants',
      'No. 131, Kunming Street, Wanhua District, Taipei City, Taiwan',
      25.042300,
      121.503900
    ),
    (
      'Abrazo Bistro',
      'taipei',
      'cafe',
      'A stylish gay-popular Daan bistro known for modern European dishes, wine, cocktails and late-night food energy.',
      'modern european bistro with pre-club queer crowd',
      array[]::text[],
      'Mon closed; Tue-Thu 20:00-02:00; Fri-Sat 21:30-03:30; Sun 20:00-02:00. Verify current kitchen hours.',
      'https://www.travelgay.com/taipei-restaurants',
      'No. 198, Section 1, Dunhua South Road, Daan District, Taipei City 106, Taiwan',
      25.042050,
      121.548350
    ),
    (
      'Taipei I/O',
      'taipei',
      'sauna',
      'A modern gay sauna and cruise club in Zhongshan with lockers, lounge, gym, showers, steam room, KTV, dark room and weekly themed events.',
      'three-floor gay sauna cruise club with weekly themes',
      array[]::text[],
      'Mon-Thu 12:00-22:00; Fri 12:00-23:00; Sat-Sun 00:00-23:00. Verify current events.',
      'https://www.travelgay.com/taipei-gay-saunas',
      'No. 49, Lane 12, Shuangcheng Street, Zhongshan District, Taipei City, Taiwan',
      25.064750,
      121.523950
    ),
    (
      'Soi 13in Sauna',
      'taipei',
      'sauna',
      'A 24-hour Zhongshan gay sauna, formerly associated with Rainbow Sauna, with jacuzzi, steam room, sauna, lounge, dark-room maze energy and private cabins.',
      '24-hour zhongshan gay sauna with maze and cabins',
      array[]::text[],
      'Open 24 hours daily. Verify current entry rules before visiting.',
      'https://www.travelgay.com/taipei-gay-saunas',
      'No. 13, Section 1, Minsheng East Road, Zhongshan District, Taipei City, Taiwan',
      25.057950,
      121.523350
    ),
    (
      'Hans Men''s Sauna',
      'taipei',
      'sauna',
      'A long-running Wanhua men''s sauna with dry sauna, steam room, TV lounge, showers, video station, dark room, cabins and a mature local crowd.',
      'old-school 24-hour wanhua men-only sauna',
      array[]::text[],
      'Open 24 hours daily. Verify current entry rules before visiting.',
      'https://www.travelgay.com/taipei-gay-saunas',
      '2F, No. 120, Xining South Road, Wanhua District, Taipei City, Taiwan',
      25.043900,
      121.506250
    ),
    (
      'Huang Chi Spa',
      'taipei',
      'sauna',
      'A Beitou hot-spring spa and bathhouse option with massage, spa and steam-room facilities, known in gay travel listings as a relaxed option.',
      'beitou hot-spring spa with gay travel signal',
      array[]::text[],
      'Open 24 hours daily. Verify current access and transport before visiting.',
      'https://www.travelgay.com/taipei-gay-saunas',
      'No. 42-1, Lane 401, Xingyi Road, Beitou District, Taipei City, Taiwan',
      25.140500,
      121.514050
    ),
    (
      'OMNI Nightclub',
      'taipei',
      'club',
      'A large, high-production Taipei nightclub with global crowd pull, strong lighting and sound, mixed nights and occasional gay or queer-styled parties.',
      'big-room mixed nightclub with occasional gay nights',
      array[]::text[],
      'Mon-Tue closed; Wed-Sun 22:30-04:30. Verify event programming before visiting.',
      'https://www.travelgay.com/taipei-gay-dance-clubs-parties',
      '5F, No. 201, Section 4, Zhongxiao East Road, Daan District, Taipei City 106, Taiwan',
      25.041600,
      121.551650
    ),
    (
      'Pawnshop',
      'taipei',
      'club',
      'An alternative queer-friendly underground club with techno, house and live-music crossover across multiple spaces.',
      'queer-friendly techno and house basement club',
      array[]::text[],
      'Fri-Sat 23:00-05:00; other days closed or event-led. Verify current listings.',
      'https://www.travelgay.com/taipei-gay-dance-clubs-parties',
      'B1, No. 279, Section 4, Xinyi Road, Daan District, Taipei City 106, Taiwan',
      25.033450,
      121.554000
    ),
    (
      '23 Music Room',
      'taipei',
      'club',
      'A record-shop-to-club style music room at Taipei Expo Park with indie, techno and live DJ sets plus queer takeovers.',
      'indie electronic room with queer takeover potential',
      array[]::text[],
      'Mon-Thu 19:00-01:00; Fri 19:00-02:00; Sat 15:00-02:00; Sun 15:00-00:00. Verify event lineup.',
      'https://www.travelgay.com/taipei-gay-dance-clubs-parties',
      'Taipei Expo Park, No. 1, Yumen Street, Zhongshan District, Taipei City 104, Taiwan',
      25.070450,
      121.520150
    ),
    (
      'Grey Area',
      'taipei',
      'club',
      'A multi-floor queer nightlife space with bar, lounge, dance floor and Funktion-One sound, positioned toward underground Taipei party culture.',
      'multi-floor queer underground club with serious sound',
      array[]::text[],
      'Event-led; verify current club-night schedule before visiting.',
      'https://www.travelgay.com/taipei-gay-dance-clubs-parties',
      'No. 57-3, Section 1, Zhongshan North Road, Zhongshan District, Taipei City 104, Taiwan',
      25.048700,
      121.521850
    ),
    (
      '228 Peace Memorial Park',
      'taipei',
      'cruising_area',
      'A historically important queer meeting and cruising landmark in central Taipei. Today it should be treated as a public, respectful, low-key historical signal rather than a guaranteed cruising destination.',
      'historic central park queer meeting point',
      array[]::text[],
      'Public park; daylight and respectful visits recommended. Do not treat public areas as private venues.',
      'https://www.travelgay.com/editorial/best-gay-cruising-spots-in-taipei',
      '228 Peace Memorial Park, Zhongzheng District, Taipei City, Taiwan',
      25.040650,
      121.515050
    ),
    (
      'WESTGATE Hotel',
      'taipei',
      'hotel',
      'A modern Ximen hotel with one of the strongest locations for Taipei nightlife: one minute from Ximen MRT and an easy walk to the Red House gay bars.',
      'ximen hotel steps from mrt and red house nightlife',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.westgatehotel.com.tw/',
      'No. 150, Section 1, Zhonghua Road, Wanhua District, Taipei City, Taiwan',
      25.042700,
      121.508850
    ),
    (
      'Inhouse Hotel',
      'taipei',
      'hotel',
      'A design-forward Ximending hotel near Ximen MRT, night markets and the Red House gay quarter, with larger rooms and a cafe-restaurant base.',
      'design hotel in the heart of ximen gay district',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.inhousehotel.com/',
      'No. 107, Xining South Road, Wanhua District, Taipei City, Taiwan',
      25.043900,
      121.506850
    ),
    (
      'amba Taipei Ximending',
      'taipei',
      'hotel',
      'A modern, good-value Ximending hotel about five minutes from Ximen MRT and around ten minutes from the Red House nightlife cluster.',
      'modern ximending hotel for red house nightlife access',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.amba-hotels.com/en/ximending/',
      'No. 77, Section 2, Wuchang Street, Wanhua District, Taipei City, Taiwan',
      25.045950,
      121.505400
    ),
    (
      'The Okura Prestige Taipei',
      'taipei',
      'hotel',
      'A luxury Zhongshan hotel with rooftop pool, gym, spa and strong access to Zhongshan nightlife, shopping and restaurants.',
      'luxury zhongshan hotel with rooftop pool and spa',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.okurataipei.com.tw/en/',
      'No. 9, Section 1, Nanjing East Road, Zhongshan District, Taipei City, Taiwan',
      25.052300,
      121.523350
    ),
    (
      'PALAIS de Chine Hotel',
      'taipei',
      'hotel',
      'A central luxury hotel beside Taipei Main Station, with strong transport access to both the Red House and Zhongshan gay nightlife zones.',
      'central luxury hotel beside taipei main station',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.palaisdechinehotel.com/',
      'No. 3, Section 1, Chengde Road, Datong District, Taipei City, Taiwan',
      25.049200,
      121.516950
    ),
    (
      'The Landis Taipei',
      'taipei',
      'hotel',
      'A gay-popular luxury option with restaurants, sauna/gym facilities and easy taxi access to Red House nightlife and Zhongshan sauna options.',
      'classic luxury hotel with strong dining and sauna access',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://taipei.landishotelsresorts.com/',
      'No. 41, Section 2, Minquan East Road, Zhongshan District, Taipei City, Taiwan',
      25.062700,
      121.529650
    ),
    (
      'Hotel Midtown Richardson',
      'taipei',
      'hotel',
      'A value-focused hotel beside Ximen Station and across from Ximending, useful for travelers who want immediate access to the Red House gay scene.',
      'value ximen hotel steps from station and nightlife',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.richardson.com.tw/',
      'No. 4, Xiushan Street, Zhongzheng District, Taipei City, Taiwan',
      25.043050,
      121.509550
    ),
    (
      'Green World Hotel Zhonghua',
      'taipei',
      'hotel',
      'A practical Ximending hotel near Taipei Main Station and the Red House bar area, with modern rooms, breakfast and easy public-transport positioning.',
      'practical ximending hotel near red house and main station',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.greenworldhotels.com/',
      '13F, No. 41, Section 1, Zhonghua Road, Zhongzheng District, Taipei City 10042, Taiwan',
      25.045200,
      121.509750
    ),
    (
      'Riverview Suites Taipei',
      'taipei',
      'hotel',
      'A Ximen-area hotel with spacious modern rooms, useful for travelers who want a quieter edge-of-Ximending base still within walking distance of Red House bars.',
      'spacious ximen-edge hotel for nightlife access',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.riverview.com.tw/',
      'No. 173-1, Chengdu Road, Wanhua District, Taipei City, Taiwan',
      25.043150,
      121.500650
    ),
    (
      'Roaders Hotel Taipei',
      'taipei',
      'hotel',
      'A playful budget-friendly hotel close to Ximending, Taipei Main Station and the Red House gay bars, with a relaxed lounge setup for low-cost city stays.',
      'playful budget hotel near ximen and red house',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.roadershotel.com/',
      'No. 68, Yanping South Road, Zhongzheng District, Taipei City, Taiwan',
      25.044850,
      121.510850
    )
) as v(name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng)
where not exists (
  select 1
  from public.places p
  where lower(trim(p.city)) = lower(trim(v.city))
    and lower(trim(p.name)) = lower(trim(v.name))
);

insert into public.events (
  name, city, description, link, date, start_date, end_date,
  location, lat, lng, vibe, vibe_tags
)
select
  v.name, v.city, v.description, v.link, v.date, v.start_date, v.end_date,
  v.location, v.lat, v.lng, v.vibe, v.vibe_tags
from (
  values
    (
      'Taiwan International Queer Film Festival 2026',
      'taipei',
      'Taiwan International Queer Film Festival is Taiwan''s LGBTQ film platform, historically held in fall and commonly connected with October Pride season. Exact 2026 screening dates and venues should be verified against the current programme.',
      'https://www.facebook.com/tiqff/',
      '2026-10-01'::date,
      '2026-10-01'::date,
      '2026-10-31'::date,
      'Taipei screening venues, Taipei City, Taiwan',
      25.047800,
      121.517000,
      'queer cinema festival and pride-season culture',
      array[]::text[]
    ),
    (
      'Taipei Mega Dragon Boat Circuit Festival 2026',
      'taipei',
      'A gay circuit-party style festival associated with Dragon Boat Festival season, described in LGBTQ travel guides as multiple party events across a long weekend. Verify the official 2026 organiser programme before booking.',
      'https://nomadicboys.com/gay-taiwan/',
      '2026-06-19'::date,
      '2026-06-19'::date,
      '2026-06-21'::date,
      'Taipei City, Taiwan',
      25.033000,
      121.565400,
      'dragon boat weekend circuit party sequence',
      array[]::text[]
    )
) as v(name, city, description, link, date, start_date, end_date, location, lat, lng, vibe, vibe_tags)
where not exists (
  select 1
  from public.events e
  where lower(trim(e.city)) = lower(trim(v.city))
    and lower(trim(e.name)) = lower(trim(v.name))
);

insert into public.services (
  name, city, type, provider_name, contact, booking_link, description,
  hours, link, image_urls, location, lat, lng, price_tier, vibe,
  vibe_tags, source, "lastChecked", verified
)
select
  v.name, v.city, v.type, v.provider_name, v.contact, v.booking_link,
  v.description, v.hours, v.link, v.image_urls, v.location, v.lat, v.lng,
  v.price_tier, v.vibe, v.vibe_tags, v.source, v."lastChecked", v.verified
from (
  values
    (
      'Taiwan Tongzhi Hotline Association',
      'taipei',
      'other',
      'Taiwan Tongzhi Hotline Association',
      'Use official website and current social channels for contact details.',
      'https://hotline.org.tw/',
      'Taiwan''s major LGBTQ community and rights organization, offering peer support, education, family resources, HIV/STI prevention, advocacy and community programming.',
      'Office and programme availability vary; contact before visiting.',
      'https://hotline.org.tw/',
      array[]::text[],
      '12F, No. 70, Section 2, Roosevelt Road, Zhongzheng District, Taipei City, Taiwan',
      25.026650,
      121.522750,
      '$',
      'LGBTQ community support, rights advocacy and peer resources',
      array[]::text[],
      'Taiwan Tongzhi Hotline official website',
      '2026-06-19'::date,
      true
    ),
    (
      'Taiwan LGBT Pride Community',
      'taipei',
      'other',
      'Taiwan LGBT Pride Community',
      'Use official website and social channels for current Pride information.',
      'http://twpride.org/',
      'The organizing ecosystem behind Taiwan Pride, useful for official parade dates, routes, themes, participation information and community updates.',
      'Pride programme availability varies by season; verify current official updates.',
      'http://twpride.org/',
      array[]::text[],
      'Taipei City, Taiwan',
      25.033400,
      121.564500,
      '$',
      'official Taiwan Pride information and community participation',
      array[]::text[],
      'Taiwan LGBT Pride official website',
      '2026-06-19'::date,
      true
    ),
    (
      'Taiwan International Queer Film Festival',
      'taipei',
      'other',
      'Taiwan International Queer Film Festival',
      'Use official social channels for annual screening details.',
      'https://www.facebook.com/tiqff/',
      'Taiwan''s queer film festival platform, useful for culture-focused travelers who want LGBTQ cinema, talks and Pride-season screen culture around Taipei.',
      'Festival dates and venues vary by year; verify the current programme before planning.',
      'https://www.facebook.com/tiqff/',
      array[]::text[],
      'Taipei City, Taiwan',
      25.047800,
      121.517000,
      '$$',
      'queer cinema, cultural programming and festival screenings',
      array[]::text[],
      'Taiwan International Queer Film Festival social channel',
      '2026-06-19'::date,
      true
    ),
    (
      'Yen Spa',
      'taipei',
      'massage',
      'Yen Spa',
      'Use official website and current LINE / WhatsApp channels.',
      'https://menq.idv.tw/',
      'Gay massage spa formerly known as MenQ, offering aromatherapy massage, oil blends, wraps and scrubs in a privacy-focused setting near Shuanglian.',
      'Daily 13:00-23:00. Verify current booking availability.',
      'https://menq.idv.tw/',
      array[]::text[],
      '3F, No. 26, Lane 39, Shuanglian Street, Datong District, Taipei City, Taiwan',
      25.057300,
      121.519550,
      '$$',
      'privacy-focused gay aromatherapy massage and body scrubs',
      array[]::text[],
      'TravelGay Taipei massage guide; Yen Spa official website',
      '2026-06-19'::date,
      true
    ),
    (
      'City Mu Spa',
      'taipei',
      'massage',
      'City Mu Spa',
      'Use official site and current messaging channels for booking.',
      'https://muspatpe.wixsite.com/',
      'Massage and aromatherapy studio near Taipei Main Station, with bespoke treatments, massage and hair-removal services in an accessible central location.',
      'Daily 10:00-00:00. Verify current booking availability.',
      'https://muspatpe.wixsite.com/',
      array[]::text[],
      'No. 50, Section 1, Zhongxiao West Road, Zhongzheng District, Taipei City, Taiwan',
      25.046350,
      121.516900,
      '$$',
      'central massage, aromatherapy and grooming service',
      array[]::text[],
      'TravelGay Taipei massage guide; City Mu Spa official website',
      '2026-06-19'::date,
      true
    ),
    (
      'Vila Spa Taipei',
      'taipei',
      'massage',
      'Vila Spa Taipei',
      'Use official website and current messaging channels for booking.',
      'https://www.travelgay.com/taipei-gay-massage-spas',
      'Professional gay massage provider near Ximending offering private-suite dry massage, oil massage, Thai body massage and four-hand massage options with appointment-led access.',
      'By appointment; verify masseur schedule and private-suite address before visiting.',
      'https://www.travelgay.com/taipei-gay-massage-spas',
      array[]::text[],
      'No. 107, Section 2, Hankou Street, Wanhua District, Taipei City 106, Taiwan',
      25.045650,
      121.504650,
      '$$$',
      'private-suite gay massage and appointment-led wellness',
      array[]::text[],
      'TravelGay Taipei massage guide',
      '2026-06-19'::date,
      true
    ),
    (
      'Fun House Taipei',
      'taipei',
      'massage',
      'Fun House',
      'Use current booking channel listed by the provider/source.',
      'https://www.travelgay.com/taipei-gay-massage-spas',
      'Gay massage service listed for Taipei with private treatment-room energy and appointment-led access; verify the current masseur roster before booking.',
      'By appointment; verify current booking availability.',
      'https://www.travelgay.com/taipei-gay-massage-spas',
      array[]::text[],
      'Taipei City, Taiwan',
      25.045500,
      121.507200,
      '$$',
      'private gay massage service with appointment-led access',
      array[]::text[],
      'TravelGay Taipei massage guide',
      '2026-06-19'::date,
      true
    ),
    (
      'Blue Men Taipei',
      'taipei',
      'massage',
      'Blue Men',
      'Use current booking channel listed by the provider/source.',
      'https://www.travelgay.com/taipei-gay-massage-spas',
      'Male massage provider in Taipei with appointment-style bodywork and adult wellness positioning; check current address and therapist availability before visiting.',
      'By appointment; verify current booking availability.',
      'https://www.travelgay.com/taipei-gay-massage-spas',
      array[]::text[],
      'Taipei City, Taiwan',
      25.047800,
      121.517000,
      '$$',
      'male massage and private bodywork booking',
      array[]::text[],
      'TravelGay Taipei massage guide',
      '2026-06-19'::date,
      true
    ),
    (
      'Tang Spa Taipei',
      'taipei',
      'massage',
      'Tang Spa',
      'Use current booking channel listed by the provider/source.',
      'https://www.travelgay.com/taipei-gay-massage-spas',
      'Taipei male massage listing for visitors who want private relaxation and bodywork; verify current booking instructions before planning around it.',
      'By appointment; verify current booking availability.',
      'https://www.travelgay.com/taipei-gay-massage-spas',
      array[]::text[],
      'Taipei City, Taiwan',
      25.041900,
      121.508000,
      '$$',
      'private male massage and relaxation booking',
      array[]::text[],
      'TravelGay Taipei massage guide',
      '2026-06-19'::date,
      true
    ),
    (
      'Eli Spa Taipei',
      'taipei',
      'massage',
      'Eli Spa',
      'Use current booking channel listed by the provider/source.',
      'https://www.travelgay.com/taipei-gay-massage-spas',
      'Gay massage service in Taipei with private appointment-led access and relaxation/bodywork focus; verify current therapist schedule before booking.',
      'By appointment; verify current booking availability.',
      'https://www.travelgay.com/taipei-gay-massage-spas',
      array[]::text[],
      'Taipei City, Taiwan',
      25.050400,
      121.520000,
      '$$',
      'gay massage and private relaxation booking',
      array[]::text[],
      'TravelGay Taipei massage guide',
      '2026-06-19'::date,
      true
    ),
    (
      'Like Spa Taipei',
      'taipei',
      'massage',
      'Like Spa',
      'Use current booking channel listed by the provider/source.',
      'https://www.travelgay.com/taipei-gay-massage-spas',
      'Taipei gay massage listing for private bodywork and appointment-led relaxation; verify current booking channel and address before visiting.',
      'By appointment; verify current booking availability.',
      'https://www.travelgay.com/taipei-gay-massage-spas',
      array[]::text[],
      'Taipei City, Taiwan',
      25.033000,
      121.543000,
      '$$',
      'private gay massage and bodywork booking',
      array[]::text[],
      'TravelGay Taipei massage guide',
      '2026-06-19'::date,
      true
    ),
    (
      'Ohio Men''s Spa',
      'taipei',
      'massage',
      'Ohio Men''s Spa',
      'Use current booking channel listed by the provider/source.',
      'https://www.travelgay.com/taipei-gay-massage-spas',
      'Men''s massage and spa service listed for Taipei with private treatment-room positioning; verify current hours, address and booking channel before visiting.',
      'By appointment; verify current booking availability.',
      'https://www.travelgay.com/taipei-gay-massage-spas',
      array[]::text[],
      'Taipei City, Taiwan',
      25.055000,
      121.516000,
      '$$',
      'men-only massage and private spa booking',
      array[]::text[],
      'TravelGay Taipei massage guide',
      '2026-06-19'::date,
      true
    )
) as v(
  name, city, type, provider_name, contact, booking_link, description,
  hours, link, image_urls, location, lat, lng, price_tier, vibe,
  vibe_tags, source, "lastChecked", verified
)
where not exists (
  select 1
  from public.services s
  where lower(trim(s.city)) = lower(trim(v.city))
    and lower(trim(s.name)) = lower(trim(v.name))
);

commit;

select 'places' as category, count(*) as total
from public.places
where lower(trim(city)) = 'taipei'

union all

select 'events', count(*)
from public.events
where lower(trim(city)) = 'taipei'

union all

select 'services', count(*)
from public.services
where lower(trim(city)) = 'taipei';
