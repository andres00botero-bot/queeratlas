-- Queer Atlas: queer-friendly techno events batch 1
-- Source policy: event official pages (Resident Advisor listings for each event)
-- No TravelGay links used.
-- Idempotent: avoids duplicates by lower(city)+lower(name)

begin;

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
      'Queer Boat (Techno,Trance)',
      'berlin',
      'Inclusive queer-centered boat rave with techno and trance programming, designed as a high-energy safe-space format on the water.',
      'https://ra.co/events/2410103',
      '2026-05-24'::date,
      null::date,
      null::date,
      'Uber Arena Anlegestelle, Berlin, Germany',
      52.5052,
      13.4439,
      'techno queer rave',
      array['techno','electronic','social']::text[]
    ),
    (
      'Trance Baby Trance - Kinky Trance Party',
      'berlin',
      'Consent-driven kinky dancefloor concept with trance and techno crossover inside Berlins queer-positive nightlife circuit.',
      'https://ra.co/events/2379580',
      '2026-06-20'::date,
      null::date,
      null::date,
      'Insomnia, Alt-Tempelhof 17-19, Berlin, Germany',
      52.4624,
      13.3853,
      'kinky queer trance-techno night',
      array['techno','underground','after']::text[]
    ),
    (
      'Glitched 004',
      'london',
      'Trans-focused queer club night highlighting experimental dance music with a techno-forward core and community-safe dancefloor culture.',
      'https://ra.co/events/2325797',
      '2026-01-31'::date,
      null::date,
      null::date,
      'The Greyhound, 109 Peckham High Street, London, United Kingdom',
      51.4707,
      -0.0695,
      'trans-focused queer techno',
      array['techno','electronic','underground']::text[]
    ),
    (
      'Riposte - Queer Rave - 2 dancefloors + 50 artists',
      'london',
      'Large-scale queer rave format with techno and electro lanes, performance programming, and explicit trans-positive community policy.',
      'https://ra.co/events/2411896',
      '2026-05-29'::date,
      null::date,
      null::date,
      'The Cause, 60 Dock Road, London, United Kingdom',
      51.5082,
      0.0189,
      'queer rave techno-electro',
      array['techno','electronic','massive']::text[]
    ),
    (
      'Ambrosia Ecstatic Rave',
      'amsterdam',
      'Queer-friendly day-rave concept blending ecstatic dance with techno and trance textures in a low-judgement social setting.',
      'https://ra.co/events/2360333',
      '2026-02-28'::date,
      null::date,
      null::date,
      'Het Sieraad, Postjesweg 1, Amsterdam, Netherlands',
      52.3660,
      4.8558,
      'ecstatic queer-friendly techno',
      array['techno','electronic','social']::text[]
    ),
    (
      'BODYCLOCK TECHNO - VUHNNY + RESIDENTS',
      'toronto',
      'Queer and BIPOC-centric weekly techno night with Detroit/hardgroove leaning sets and inclusive dancefloor culture.',
      'https://ra.co/events/2382032',
      '2026-03-05'::date,
      null::date,
      null::date,
      'The Piston, 937 Bloor St W, Toronto, Canada',
      43.6618,
      -79.4274,
      'queer bipoc techno weekly',
      array['techno','underground','social']::text[]
    ),
    (
      'ELECTROGASM - Pure Camp x Exposure Ther4py',
      'toronto',
      'Super-queer club night with techno/electro programming and FLINTA-prioritized safety guidelines.',
      'https://ra.co/events/2326829',
      '2026-02-13'::date,
      null::date,
      null::date,
      'Cafeteria, 1650 Dupont St, Toronto, Canada',
      43.6673,
      -79.4460,
      'queer techno-electro pressure room',
      array['techno','electronic','social']::text[]
    ),
    (
      'PLAY ME TECHNO',
      'new_york',
      'Queer-utopian warehouse-style rave with techno/electro direction, performance layer, and body-liberation dancefloor focus.',
      'https://ra.co/events/2366495',
      '2026-02-28'::date,
      null::date,
      null::date,
      'Brooklyn (TBA to ticket holders), New York City, USA',
      40.6782,
      -73.9442,
      'queer techno warehouse format',
      array['techno','electronic','underground']::text[]
    ),
    (
      'M3NCLUB',
      'madrid',
      'Queer men-centered dark-room dance format with techno-first lineup and late-night intimacy around Madrids central nightlife corridor.',
      'https://ra.co/events/2359010',
      '2026-02-21'::date,
      null::date,
      null::date,
      'Araña Club, Calle Flor Baja 6, Madrid, Spain',
      40.4211,
      -3.7094,
      'queer men techno pressure',
      array['techno','after','underground']::text[]
    ),
    (
      '6HR GRUMBLE BOOGIE',
      'sydney',
      'Radically queer dance format with house-techno crossover, activist framing, and explicit support for trans and First Nations communities.',
      'https://ra.co/events/2393898',
      '2026-03-27'::date,
      null::date,
      null::date,
      'The Red Rattler, 6 Faversham St, Marrickville, Sydney, Australia',
      -33.9076,
      151.1604,
      'queer radical dance crossover',
      array['electronic','social','cultural']::text[]
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

commit;
