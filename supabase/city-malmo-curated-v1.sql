-- Queer Atlas: Malmö city package
-- Verified 2026-06-19.
-- Safe to run multiple times.
--
-- Restaurants and cafes use type = 'cafe' as required by the app/database.
-- Production-safe: vibe_tags are empty arrays to avoid stricter Supabase tag constraints.

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
      'Atemlos',
      'malmo',
      'bar',
      'Malmö''s dedicated queer bar: low lights, pop-heavy energy, karaoke, quiz nights, party nights and a strong safe-space policy.',
      'dedicated queer bar with late-night pop energy',
      array[]::text[],
      'Wed 18:00-00:00; Thu 18:00-00:00; Fri 18:00-03:00; Sat 18:00-03:00. 18+; weekend cover may apply after 23:00.',
      'https://www.atemlos.se/',
      'Bergsgatan 29, 214 22 Malmö, Sweden',
      55.596700,
      13.011500
    ),
    (
      'Sauvage',
      'malmo',
      'cafe',
      'Open-minded Möllan wine bar and restaurant with Parisian neobistro influence, natural-wine energy and a queer-friendly local crowd.',
      'open-minded wine bar and neobistro',
      array[]::text[],
      'Restaurant hours vary by day and season; verify current booking hours on the official site.',
      'https://restaurangsauvage.se/',
      'Spångatan 32A, 211 53 Malmö, Sweden',
      55.595800,
      13.006000
    ),
    (
      'Plan B',
      'malmo',
      'club',
      'Creative alternative nightclub and live-music venue that is not queer-only but is known for an open crowd, concerts, theme nights and dance-floor crossover.',
      'creative open-minded nightclub and live venue',
      array[]::text[],
      'Event-led; verify current programme and door times on the official site.',
      'https://www.planbmalmo.com/',
      'Norra Grängesbergsgatan 19, 214 50 Malmö, Sweden',
      55.587600,
      13.030500
    ),
    (
      'SLM Malmö',
      'malmo',
      'club',
      'Membership club for men who like men and masculine fetishes, with dress-code nights, pub evenings and cruising-oriented programming.',
      'men-only fetish membership club',
      array[]::text[],
      'Event-led membership club; check the official calendar and dress code before visiting.',
      'https://slmmalmo.se/',
      'Sallerupsvägen 30, 212 18 Malmö, Sweden',
      55.600900,
      13.034000
    ),
    (
      'Café Lajvet',
      'malmo',
      'cafe',
      'Safe community café and meeting place mainly for girls and women aged 15-30, with occasional Café Queer sessions for a wider LGBTQIA+ audience.',
      'safe community cafe and queer meeting point',
      array[]::text[],
      'Programme-led; check official channels for current Café Queer dates and opening times.',
      'https://cafelajvet.se/',
      'Kärleksgatan 5A, 211 45 Malmö, Sweden',
      55.604800,
      13.003500
    ),
    (
      'Hummusson',
      'malmo',
      'cafe',
      'Inclusive hummus bar and casual restaurant on Södra Förstadsgatan, known locally as a warm, welcoming food stop for LGBTQ+ people and allies.',
      'inclusive hummus bar and casual food stop',
      array[]::text[],
      'Food-service hours vary; verify current opening times on the official site.',
      'https://www.hummusson.se/',
      'Södra Förstadsgatan 43, 211 43 Malmö, Sweden',
      55.596600,
      13.000800
    ),
    (
      'Page 28',
      'malmo',
      'cafe',
      'Queer cultural association, bookshop and gathering space created as a cultural breathing room for LGBTQ+ people who want literature, community and discussion.',
      'queer cultural bookshop and community room',
      array[]::text[],
      'Programme-led; verify current opening hours and events on the official site.',
      'https://www.pagekulturscen.se/',
      'Karlskronaplan 11, 214 36 Malmö, Sweden',
      55.596000,
      13.018600
    ),
    (
      'Moriska Paviljongen',
      'malmo',
      'club',
      'Folkets Park culture, concert and club venue with recurring open, queer-friendly programming and a history of hosting Pride and LGBTQ+ nights.',
      'folkets park culture venue with queer programming',
      array[]::text[],
      'Event-led; verify current programme before visiting.',
      'https://www.moriskapaviljongen.se/',
      'Norra Parkgatan 2, 214 22 Malmö, Sweden',
      55.596100,
      13.014300
    ),
    (
      'Inkonst',
      'malmo',
      'club',
      'Contemporary culture, performance and club venue on Bergsgatan with experimental programming, electronic nights and a strong welcome for boundary-pushing queer culture.',
      'experimental culture and club venue',
      array[]::text[],
      'Event-led; verify current programme and door times on the official site.',
      'https://www.inkonst.com/',
      'Bergsgatan 29, 214 22 Malmö, Sweden',
      55.596700,
      13.011500
    ),
    (
      'MJ''s Malmö',
      'malmo',
      'hotel',
      'Stylish central boutique hotel with strong restaurant-bar energy, useful for travelers who want a polished base near Malmö C, Lilla Torg and central nightlife.',
      'stylish central boutique hotel with bar energy',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://mjs.life/',
      'Mäster Johansgatan 13, 211 21 Malmö, Sweden',
      55.606000,
      13.000100
    ),
    (
      'Clarion Hotel Malmö Live',
      'malmo',
      'hotel',
      'Large modern hotel beside Malmö Live and the central station, with skyline rooms, restaurants and easy walking access to central Malmö.',
      'modern central hotel by malmo live',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.strawberryhotels.com/hotels/sweden/malmo/clarion-hotel-malmo-live/',
      'Dag Hammarskjölds torg 2, 211 18 Malmö, Sweden',
      55.608700,
      12.994500
    ),
    (
      'Story Hotel Studio Malmö',
      'malmo',
      'hotel',
      'Design-forward waterfront hotel near Malmö C and Västra Hamnen, good for travelers who want a modern base with quick access to restaurants and transit.',
      'waterfront design hotel near central station',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.hyatt.com/story-hotels/en-US/mmaxl-story-hotel-studio-malmo',
      'Tyfongatan 1, 211 19 Malmö, Sweden',
      55.611000,
      12.998100
    ),
    (
      'Scandic Triangeln',
      'malmo',
      'hotel',
      'High-rise hotel at Triangeln with strong train access and easy walking routes to Möllan, Bergsgatan and central Malmö.',
      'triangeln hotel with easy queer-route access',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.scandichotels.com/hotels/sweden/malmo/scandic-triangeln',
      'Triangeln 2, 211 43 Malmö, Sweden',
      55.595500,
      13.002500
    ),
    (
      'Mayfair Hotel Tunneln',
      'malmo',
      'hotel',
      'Historic central hotel close to Malmö C, Lilla Torg and the old town, useful for a characterful stay with easy transit and short taxi rides to Möllan.',
      'historic central hotel close to malmo c',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://mayfairhotel.se/',
      'Adelgatan 4, 211 22 Malmö, Sweden',
      55.607300,
      13.001500
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
      'Malmö Pride',
      'malmo',
      'Annual Pride festival with parade, Pride Park, concerts, talks, youth programming and closing-party energy. The official site should be checked for the current year''s dates before planning.',
      'https://malmopride.com/',
      null::date,
      null::date,
      null::date,
      'Malmö city centre / Folkets Park, Malmö, Sweden',
      55.596100,
      13.014300,
      'annual pride festival and parade',
      array[]::text[]
    ),
    (
      'Le Queer',
      'malmo',
      'Recurring queer party concept active since 2023, usually built around queer DJs, drag, dance and themed monthly party editions around Malmö.',
      'https://www.instagram.com/lequeer_malmo/',
      null::date,
      null::date,
      null::date,
      'Rotating venues, Malmö, Sweden',
      55.605000,
      13.003800,
      'monthly queer party concept with drag and DJs',
      array[]::text[]
    ),
    (
      'Malmö Guerrilla Queer Bar',
      'malmo',
      'Recurring queer bar-takeover concept where LGBTQ+ people and allies meet at a pre-announced bar to make the room queer for one night.',
      'https://www.instagram.com/malmoguerrillaqueerbar/',
      null::date,
      null::date,
      null::date,
      'Rotating bars, Malmö, Sweden',
      55.605000,
      13.003800,
      'rotating queer bar takeover',
      array[]::text[]
    ),
    (
      'Malmö Queer Film Festival',
      'malmo',
      'Queer film festival usually hosted at Panora, with shorts, documentaries, talks, community screenings and regional queer film culture.',
      'https://malmoqueerfilmfestival.wordpress.com/',
      null::date,
      null::date,
      null::date,
      'Panora, Friisgatan 19D, 214 21 Malmö, Sweden',
      55.595900,
      13.007700,
      'queer film festival and community screenings',
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
      'RFSL Malmö / RFSL Skåne',
      'malmo',
      'other',
      'RFSL Malmö / RFSL Skåne',
      'Use official channels for contact, youth groups and counselling/service availability.',
      'https://malmo.rfsl.se/',
      'Local RFSL organization and community resource for LGBTQIA+ support, meeting groups, youth activities, rights information and local programming.',
      'Programme and office availability vary; verify current details on the official site.',
      'https://malmo.rfsl.se/',
      array[]::text[],
      'Malmö, Sweden',
      55.605000,
      13.003800,
      '$',
      'local LGBTQIA+ support and community programming',
      array[]::text[],
      'RFSL Malmö official website; Thatsup Malmö HBTQ guide',
      '2026-06-19'::date,
      true
    ),
    (
      'Lesbisk Makt Malmö',
      'malmo',
      'other',
      'Lesbisk Makt',
      'Use official website/social channels for current Malmö activities.',
      'https://lesbiskmakt.nu/',
      'Lesbian community organization with Malmö activities such as breakfasts, parties, workshops and conversations where lesbian life is centered.',
      'Programme-led; verify current Malmö events through official channels.',
      'https://lesbiskmakt.nu/',
      array[]::text[],
      'Malmö, Sweden',
      55.605000,
      13.003800,
      '$',
      'lesbian community events and social support',
      array[]::text[],
      'Thatsup Malmö HBTQ guide; Lesbisk Makt official website',
      '2026-06-19'::date,
      true
    ),
    (
      'Habitat Q',
      'malmo',
      'other',
      'RFSL Skåne',
      'Use current Linktree/RFSL channels for meeting times and youth-safety details.',
      'https://linktr.ee/habitatq',
      'Youth meeting place for LGBTQIA+ and questioning people aged 13-19, run by RFSL Skåne with LGBTQIA+ staff and a support-focused atmosphere.',
      'Programme-led youth meeting point; verify current schedule before attending.',
      'https://linktr.ee/habitatq',
      array[]::text[],
      'Malmö, Sweden',
      55.605000,
      13.003800,
      '$',
      'youth LGBTQIA+ meeting point and support',
      array[]::text[],
      'Thatsup Malmö HBTQ guide; Habitat Q Linktree',
      '2026-06-19'::date,
      true
    ),
    (
      'SpAce Malmö',
      'malmo',
      'other',
      'RFSL Malmö',
      'Use RFSL Malmö channels for current meeting dates.',
      'https://malmo.rfsl.se/',
      'Meeting format for aromantic and asexual people, and people exploring those identities, with recurring Saturday gatherings according to local listings.',
      'Programme-led; listed as every other Saturday but verify current schedule.',
      'https://malmo.rfsl.se/',
      array[]::text[],
      'Malmö, Sweden',
      55.605000,
      13.003800,
      '$',
      'aromantic and asexual community meetings',
      array[]::text[],
      'Thatsup Malmö HBTQ guide; RFSL Malmö official website',
      '2026-06-19'::date,
      true
    ),
    (
      'Malmö Pride Organization',
      'malmo',
      'other',
      'Malmö Pride',
      'Use official website and social channels for volunteering, membership, sponsor and programme contact.',
      'https://malmopride.com/',
      'Volunteer-driven Pride organization behind Malmö Pride, parade information, Pride Park, programming, membership and community participation.',
      'Seasonal festival organization; verify current year updates on the official site.',
      'https://malmopride.com/',
      array[]::text[],
      'Malmö, Sweden',
      55.596100,
      13.014300,
      '$',
      'pride organization and festival participation',
      array[]::text[],
      'Malmö Pride official website',
      '2026-06-19'::date,
      true
    ),
    (
      'Malmö Queer Film Festival Organization',
      'malmo',
      'other',
      'Malmö Queer Film Festival',
      'mqf@panora.se',
      'https://malmoqueerfilmfestival.wordpress.com/',
      'Queer film festival team connected with Panora, useful for programme updates, submissions, tickets and cultural community participation.',
      'Festival-led; verify current programme and contact details on official channels.',
      'https://malmoqueerfilmfestival.wordpress.com/',
      array[]::text[],
      'Panora, Friisgatan 19D, 214 21 Malmö, Sweden',
      55.595900,
      13.007700,
      '$',
      'queer film festival organization and screenings',
      array[]::text[],
      'Malmö Queer Film Festival official website',
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
where lower(trim(city)) = 'malmo'

union all

select 'events', count(*)
from public.events
where lower(trim(city)) = 'malmo'

union all

select 'services', count(*)
from public.services
where lower(trim(city)) = 'malmo';
