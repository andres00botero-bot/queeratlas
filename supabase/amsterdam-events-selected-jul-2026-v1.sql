-- Queer Atlas: Amsterdam selected events batch (user-selected ids: 1,6,7,8,9,10,12,13)
-- Date window: July 2026 onwards
-- Rule applied: skip events without secure dates in Event Dates field.
-- Skipped: #11 Sweetie Darling (Event Dates = "Awaiting dates")

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
      'Furball Amsterdam',
      'amsterdam',
      'Men-only night energy with a bear-forward crowd, darkroom flow, and a social-first dance floor at one of Amsterdam''s iconic queer venues.',
      'https://www.furball.nl',
      '2026-07-18'::date,
      '2026-07-18'::date,
      '2026-07-18'::date,
      'Club Church, Kerkstraat 52, 1017 GM Amsterdam, Netherlands',
      null::double precision,
      null::double precision,
      'bear night men-only social flow',
      array['men_only','fetish','social']::text[]
    ),
    (
      'Hustlaball Amsterdam',
      'amsterdam',
      'Global fetish-circuit intensity with heavyweight DJs, late-hours momentum, and an unapologetically high-heat dance-and-play atmosphere.',
      'https://www.gaytravel4u.com/event/hustlaball-amsterdam/',
      '2026-07-30'::date,
      '2026-07-30'::date,
      '2026-07-30'::date,
      'The Other Side, Rigakade 10, 1013 BC Amsterdam, Netherlands',
      null::double precision,
      null::double precision,
      'worldpride fetish circuit night',
      array['fetish','men_only','massive']::text[]
    ),
    (
      'Crash Amsterdam Fetish Pride Edition',
      'amsterdam',
      'Open-air kink-forward Pride heat with heavy beats, leather signal, and a high-contact street-party atmosphere built for fetish lovers.',
      'https://www.gaytravel4u.com/event/crash-amsterdam-fetish-pride/',
      '2026-07-31'::date,
      '2026-07-31'::date,
      '2026-08-01'::date,
      'Beursplein (between De Bijenkorf and Beurs van Berlage), Amsterdam, Netherlands',
      null::double precision,
      null::double precision,
      'open-air fetish pride street party',
      array['fetish','social','industrial']::text[]
    ),
    (
      'FunHouse XL WorldPride Amsterdam Edition',
      'amsterdam',
      'Big-room Pride marathon with all-star DJs, staged production, and international queer-circuit crowd flow across Amsterdam WorldPride week.',
      'https://www.clubrapido.com',
      '2026-07-31'::date,
      '2026-07-31'::date,
      '2026-08-08'::date,
      'WestWeelde / WesterUnie complex, Klonneplein 4-6, 1014 DD Amsterdam, Netherlands',
      null::double precision,
      null::double precision,
      'worldpride marathon circuit production',
      array['massive','electronic','social']::text[]
    ),
    (
      'WorldPride Music Festival - Global Dance Party Amsterdam',
      'amsterdam',
      'Two-night global LGBTQ dance festival format with multi-stage programming, crossover sound, and large-scale celebratory WorldPride energy.',
      'https://www.gaytravel4u.com/event/worldpride-music-festival-global-dance-party-amsterdam/',
      '2026-07-31'::date,
      '2026-07-31'::date,
      '2026-08-01'::date,
      'AFAS Live, Amsterdam Southeast (near Johan Cruijff ArenA), Netherlands',
      null::double precision,
      null::double precision,
      'global dance worldpride festival',
      array['festival','electronic','massive']::text[]
    ),
    (
      'Bear Necessity Amsterdam Pride Edition',
      'amsterdam',
      'Attitude-free bear-weekend pulse with international DJs, dance-floor warmth, and a community-heavy Pride edition vibe.',
      'https://www.gaytravel4u.com/event/bear-necessity-amsterdam-pride-edition/',
      '2026-08-01'::date,
      '2026-08-01'::date,
      '2026-08-02'::date,
      'Panama, Oostelijke Handelskade 4, 1019 BM Amsterdam, Netherlands',
      null::double precision,
      null::double precision,
      'bear pride dance social',
      array['social','fetish','men_only']::text[]
    ),
    (
      'Damage Party Amsterdam WorldPride Edition',
      'amsterdam',
      'Peak fetish-club pressure with progressive house, cruise-and-play architecture, and high-voltage Amsterdam WorldPride night mechanics.',
      'https://www.damageparty.com',
      '2026-08-01'::date,
      '2026-08-01'::date,
      '2026-08-01'::date,
      'The Other Side, Rigakade 10, 1013 BC Amsterdam, Netherlands',
      null::double precision,
      null::double precision,
      'fetish club dance play',
      array['fetish','industrial','men_only']::text[]
    ),
    (
      'Rapido Amsterdam WorldPride Party',
      'amsterdam',
      'Signature Sunday WorldPride crescendo with theatrical production, hard-lift dance energy, and classic Rapido crowd pull.',
      'https://www.clubrapido.com',
      '2026-08-02'::date,
      '2026-08-02'::date,
      '2026-08-02'::date,
      'Paradiso, Weteringschans 6-8, 1017 SG Amsterdam, Netherlands',
      null::double precision,
      null::double precision,
      'worldpride sunday peak party',
      array['massive','electronic','social']::text[]
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
    and coalesce(e.start_date, e.date) = ne.start_date
)
and not exists (
  select 1
  from public.events e2
  where coalesce(lower(e2.link), '') <> ''
    and lower(e2.link) = lower(ne.link)
    and coalesce(e2.start_date, e2.date) = ne.start_date
);

commit;

