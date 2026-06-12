-- Queer Atlas: Ljubljana city package
-- Approved 2026-06-12.
-- Safe to run multiple times.
--
-- Actions:
-- - Adds 5 verified venues.
-- - Adds 4 verified future events.
-- - Adds 4 verified community and wellness services.
-- - Uses only currently allowed place and service types.

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
      'Klub Tiffany',
      'ljubljana',
      'club',
      'Ljubljana''s queer living room swaps the soft sofa for a dance floor, drag, and enough pop to wake the whole of Metelkova. The club also hosts performances, discussions, and community programming through Cultural Centre Q.',
      'Metelkova drag, pop and activist chosen-family energy',
      array['drag','pop','social']::text[],
      'Event-led, usually selected Thu-Sat 23:00-05:00; check the official programme.',
      'https://www.kulturnicenterq.org/klub-tiffany/',
      'Masarykova cesta 24, 1000 Ljubljana, Slovenia',
      46.0573193,
      14.5172985
    ),
    (
      'Klub Monokel',
      'ljubljana',
      'club',
      'Lesbian and queer-feminist club culture with electronic beats, art, and a very low tolerance for dull heteronormativity. Its event-led programme makes checking the current calendar part of the ritual.',
      'lesbian and queer-feminist underground club',
      array['electronic','underground','social']::text[],
      'Event-led, mainly selected Fri-Sat around 23:00-05:00; verify on the official social page.',
      'https://www.instagram.com/klubmonokel/',
      'Masarykova cesta 24, 1000 Ljubljana, Slovenia',
      46.0573193,
      14.5172985
    ),
    (
      'Klub K4 / K4 Roza',
      'ljubljana',
      'club',
      'K4 is a mixed underground electronic club, but recurring K4 Roza nights bring a distinctly queer charge to the basement. When Roza takes over, the bass drops, the wardrobe opens, and the dance floor becomes considerably more fluent.',
      'underground electronic club with a recurring queer takeover',
      array['electronic','underground','social']::text[],
      'Event-led, commonly around 23:00-05:00; check the official programme.',
      'https://www.klub-k4.si/',
      'Kersnikova ulica 4, 1000 Ljubljana, Slovenia',
      46.0556079,
      14.5039882
    ),
    (
      'Pritličje',
      'ljubljana',
      'cafe',
      'Coffee, cocktails, comics, exhibitions, and political conversation share the room as if they have always belonged to the same queer group chat. This central cultural cafe regularly participates in LGBTQ+ and Pride programming.',
      'queer-friendly coffee, comics, art and civic culture',
      array['cultural','cozy','social']::text[],
      'Open daily; cafe, bar, and event hours vary. Check the official programme before visiting.',
      'https://www.pritlicje.si/',
      'Mestni trg 2, 1000 Ljubljana, Slovenia',
      46.0497195,
      14.5068235
    ),
    (
      'District35',
      'ljubljana',
      'sauna',
      'Men-focused gay sauna and cruise club with lockers, showers, sauna facilities, dark areas, a bar, terrace, and recurring themed sessions. Towels, steam, and social chemistry provide considerably more possibilities than the average changing room.',
      'gay sauna, cruising and relaxed themed sessions',
      array['cruise','men_only','relax']::text[],
      'Mon 18:00-00:00, Tue-Thu 17:00-00:00, Fri 17:00-01:00, Sat 15:00-01:00, Sun 15:00-00:00.',
      'https://www.district35.si/',
      'Stegne 35, 1000 Ljubljana, Slovenia',
      46.0877287,
      14.4801775
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
      'Ljubljana Pride Parade 2026',
      'ljubljana',
      'Ljubljana''s rainbow heart takes to the city centre with community, protest, music, and demonstratively excellent outfits. Confirm the final assembly point and time through the official Pride channels.',
      'https://ljubljanapride.org/',
      '2026-06-13'::date,
      '2026-06-13'::date,
      '2026-06-13'::date,
      'Central Ljubljana; confirm the final assembly point through the official Pride channels',
      46.0513764,
      14.5059895,
      'community protest, music and city-centre Pride',
      array['festival','cultural','social']::text[]
    ),
    (
      'PRIDEn_a - Ljubljana Pride Parade Afterparty',
      'ljubljana',
      'Official Pride afterparty across Klub Tiffany and Klub Monokel from 23:00 to 05:00. The parade ends, but Ljubljana''s queer battery politely refuses to do the same.',
      'https://www.kulturnicenterq.org/pridena-ljubljana-pride-parade-afterparty-13-6-2026-klub-tiffany-in-monokel/',
      '2026-06-13'::date,
      '2026-06-13'::date,
      '2026-06-14'::date,
      'Klub Tiffany and Klub Monokel, Masarykova cesta 24, 1000 Ljubljana, Slovenia',
      46.0573193,
      14.5172985,
      'official Pride afterparty across two Metelkova clubs',
      array['festival','electronic','social']::text[]
    ),
    (
      'District35 All Gender Monday - 15 June 2026',
      'ljubljana',
      'Inclusive all-gender sauna session from 18:00 to midnight. The doors open to every gender while clothing remains regarded as highly optional.',
      'https://www.district35.si/',
      '2026-06-15'::date,
      '2026-06-15'::date,
      '2026-06-15'::date,
      'District35, Stegne 35, 1000 Ljubljana, Slovenia',
      46.0877287,
      14.4801775,
      'inclusive all-gender sauna evening',
      array['relax','social','mixed']::text[]
    ),
    (
      'District35 Naked Friday - 19 June 2026',
      'ljubljana',
      'Friday sauna theme from 17:00 to 01:00 with a refreshingly unambiguous concept: less fabric, more steam, and no anxiety about the dress code.',
      'https://www.district35.si/',
      '2026-06-19'::date,
      '2026-06-19'::date,
      '2026-06-20'::date,
      'District35, Stegne 35, 1000 Ljubljana, Slovenia',
      46.0877287,
      14.4801775,
      'clothing-optional Friday sauna session',
      array['cruise','men_only','relax']::text[]
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
  where lower(trim(e.city)) = lower(trim(ne.city))
    and lower(trim(e.name)) = lower(trim(ne.name))
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
      'DIH LGBTQI+ Community Support',
      'ljubljana',
      'other',
      'DIH - Enakopravni pod mavrico',
      '+386 41 562 375; info@dih.si',
      'https://www.dih.si/kontakt',
      'LGBTQI+ community centre providing information, workshops, social programming, support, HIV and STI prevention education, and connections to Ljubljana''s queer community. It is the useful local door when you need more than another generic tourist brochure.',
      'Office Mon-Fri 10:00-16:00; in-person and telephone contact Mon-Fri 12:00-16:00.',
      'https://www.dih.si/',
      array[]::text[],
      'Slomškova ulica 25, 1000 Ljubljana, Slovenia',
      46.0602665,
      14.5036980,
      '$',
      'community information, support and queer organizing',
      array['service','cultural','social']::text[],
      'DIH official website and Ljubljana Queer Map 2026',
      '2026-06-12'::date,
      true
    ),
    (
      'Legebitra Psychosocial Counselling',
      'ljubljana',
      'wellness',
      'Legebitra',
      '030 361 281; svetovalnica@legebitra.si; info@legebitra.si',
      'https://legebitra.si/o-nas/kontakti-in-lokacija/',
      'Free psychosocial counselling for LGBTQ+ people in a confidential setting. This is a supportive conversation space for the matters that cannot be resolved by one more drink, a dance floor, or a dramatic voice message; it is not a crisis service.',
      'Wed 12:00-16:00 or by appointment.',
      'https://legebitra.si/o-nas/kontakti-in-lokacija/',
      array[]::text[],
      'Trg prekomorskih brigad 1, 1000 Ljubljana, Slovenia',
      46.0693856,
      14.4892291,
      '$',
      'free queer psychosocial support in a confidential setting',
      array['relax','service','cozy']::text[],
      'Legebitra official contact page',
      '2026-06-12'::date,
      true
    ),
    (
      'Legebitra HIV/STI Testing',
      'ljubljana',
      'wellness',
      'Legebitra',
      '030 361 280; info@legebitra.si',
      'https://kajisces.si/lokacije-testiranja',
      'Appointment-based HIV and STI testing with sexual-health information and support in an LGBTQ+ community context. It is faster, wiser, and considerably less dramatic than attempting a diagnosis through an increasingly anxious browser history.',
      'Thu 17:00-20:00; appointment required.',
      'https://kajisces.si/lokacije-testiranja',
      array[]::text[],
      'Trubarjeva cesta 76A, 1000 Ljubljana, Slovenia',
      46.0518419,
      14.5161165,
      '$',
      'discreet community sexual health and testing',
      array['relax','service','social']::text[],
      'Legebitra official contact page and Kaj iščeš testing directory',
      '2026-06-12'::date,
      true
    ),
    (
      'TransAkcija Trans+ Support',
      'ljubljana',
      'wellness',
      'TransAkcija',
      '+386 40 814 304',
      'https://transakcija.si/',
      'Trans-led individual psychosocial counselling, peer support, information, advocacy, and community connection by appointment. Identity does not need to be defended, translated, or reduced to an awkward form field here.',
      'By prior appointment.',
      'https://transakcija.si/',
      array[]::text[],
      'Trg prekomorskih brigad 1, 1000 Ljubljana, Slovenia',
      46.0693856,
      14.4892291,
      '$',
      'trans-led counselling, peer support and community',
      array['cozy','service','social']::text[],
      'TransAkcija official website and DIH Ljubljana Queer Map 2026',
      '2026-06-12'::date,
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

select 'places' as category, count(*) as total
from public.places
where lower(trim(city)) = 'ljubljana'

union all

select 'events', count(*)
from public.events
where lower(trim(city)) = 'ljubljana'

union all

select 'services', count(*)
from public.services
where lower(trim(city)) = 'ljubljana';
