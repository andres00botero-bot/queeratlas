-- Queer Atlas city batch v1
-- Cities: bali, moscow, saint_petersburg
-- Includes: places + events + country rights update (Russia)
-- Idempotent inserts (dedupe by lower(city)+lower(name))
-- Note: links limited to official websites / Instagram / Facebook / organization pages.

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
      'F Bar Bali',
      'bali',
      'bar',
      'Compact Seminyak dance-and-cocktail room with drag-adjacent party flow and strong late social energy.',
      'late seminyak crossover room',
      array['mixed','drag']::text[],
      'Tue-Sun 22:00-03:00, Mon closed.',
      'https://www.facebook.com/bali.facebar',
      'Seminyak, Kec. Kuta, Kabupaten Badung, Bali 80361, Indonesia',
      -8.6910,
      115.1667
    ),
    (
      'Central Station Moscow',
      'moscow',
      'club',
      'Major late-night club format in Moscow with cabaret segments, karaoke windows, and event-programmed weekly lineup.',
      'high-output central club engine',
      array['massive','after']::text[],
      'Wed-Sun 22:00-07:00.',
      'https://www.mcentralstation.com/en/untitled-c1z3x',
      'Leninskaya Sloboda st. 19, building 2, Moscow, Russia',
      55.7088,
      37.6635
    ),
    (
      'Mono Bar Moscow',
      'moscow',
      'bar',
      'Long-running Moscow nightlife bar-and-club lane with karaoke, dance floor, and weekend-heavy social momentum.',
      'karaoke dance social staple',
      array['social','mixed']::text[],
      'Daily 18:00-06:00.',
      'https://www.instagram.com/mono.msk',
      'Pokrovskiy boulevard 6/20, Moscow, Russia',
      55.7576,
      37.6492
    ),
    (
      'OPEN ART Moscow Hub',
      'moscow',
      'cafe',
      'Queer-arts and self-expression platform space linked to independent festival programming and community culture work.',
      'cultural resistance and art node',
      array['cultural','social']::text[],
      'Event-based schedule; check program updates before visit.',
      'https://openartmoscow.org/home-ru/home-eng/',
      'Basmanny Dvor, Spartakovskaya Square 16/15 building 6, Moscow, Russia',
      55.7787,
      37.6792
    ),
    (
      'Stimul Group Moscow',
      'moscow',
      'cafe',
      'LGBT support initiative focused on legal, psychological, and rights-centered assistance in Moscow and the region.',
      'support-first community infrastructure',
      array['social','cultural']::text[],
      'Support program schedule varies; verify via official updates.',
      'https://www.msk-stimul.eu/',
      'Moscow, Russia',
      55.7558,
      37.6173
    ),
    (
      'Cabaret Club Saint Petersburg',
      'saint_petersburg',
      'club',
      'Historic St Petersburg club format with cabaret stage programming, karaoke, and late-weekend dance-floor cycle.',
      'legacy cabaret weekend pressure',
      array['drag','mixed']::text[],
      'Fri-Sat 23:00-08:00.',
      'https://www.instagram.com/cabaret_club_spb/',
      'Razyezzhaya 43, Saint Petersburg, Russia, 191119',
      59.9190,
      30.3495
    ),
    (
      'Coming Out Support Node',
      'saint_petersburg',
      'cafe',
      'Community support and counseling infrastructure for LGBTQ+ people and close ones with legal and psychological guidance.',
      'care and legal support node',
      array['social','relax']::text[],
      'Program/webinar schedule varies; verify via official channels.',
      'https://comingoutspb.org/en/',
      'Saint Petersburg, Russia (community support network)',
      59.9343,
      30.3351
    ),
    (
      'Bok o Bok Cultural Node',
      'saint_petersburg',
      'cafe',
      'Cultural platform linked to LGBTQ+ film and arts programming with discussion-led community events.',
      'film-and-culture community lane',
      array['cultural','social']::text[],
      'Festival and screening schedule varies.',
      'https://www.bok-o-bok.com/',
      'Saint Petersburg, Russia',
      59.9360,
      30.3150
    ),
    (
      'Ligovsky Night Corridor',
      'saint_petersburg',
      'cafe',
      'Compact central nightlife route used for safer short-hop sequencing between selected late-night venues.',
      'route-first nightlife sequencing zone',
      array['social','after']::text[],
      'Most active Fri-Sat late-night.',
      'https://2gis.ru/spb/firm/5348552839179180',
      'Ligovsky/Vladimirsky central corridor, Saint Petersburg, Russia',
      59.9240,
      30.3470
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
      'BaliSpirit Festival 2026',
      'bali',
      'Large-scale Ubud festival blending music, movement, and inclusive cultural programming with global participation.',
      'https://www.balispiritfestival.com/',
      '2026-04-15'::date,
      '2026-04-15'::date,
      '2026-04-19'::date,
      'Ubud, Bali, Indonesia',
      -8.5073,
      115.2640,
      'festival cultural',
      array['festival','cultural']::text[]
    ),
    (
      'Seminyak Drag Circuit Weekend',
      'bali',
      'Weekend drag-and-dance nightlife sequence across Seminyak''s core queer bars and club rooms.',
      'https://stonewallbali.com/',
      null::date,
      null::date,
      null::date,
      'Seminyak nightlife lane, Bali, Indonesia',
      -8.6904,
      115.1663,
      'drag after',
      array['drag','after']::text[]
    ),
    (
      'Central Station Weekly Program',
      'moscow',
      'Recurring Wed-Sun event cycle with karaoke, cabaret, and DJ-led dance-floor programming.',
      'https://www.mcentralstation.com/en/untitled-c1z3x',
      null::date,
      null::date,
      null::date,
      'Central Station, Moscow, Russia',
      55.7088,
      37.6635,
      'after mixed',
      array['after','mixed']::text[]
    ),
    (
      'OPEN ART Festival Moscow',
      'moscow',
      'Queer arts and freedom-of-expression festival format with performances, lectures, and community discussion.',
      'https://openartmoscow.org/home-ru/home-eng/',
      null::date,
      null::date,
      null::date,
      'Moscow, Russia',
      55.7787,
      37.6792,
      'cultural festival',
      array['cultural','festival']::text[]
    ),
    (
      'IDAHOBIT Support Day Moscow',
      'moscow',
      'Community support and visibility programming around International Day Against Homophobia, Biphobia and Transphobia.',
      'https://www.msk-stimul.eu/',
      '2026-05-17'::date,
      '2026-05-17'::date,
      '2026-05-17'::date,
      'Moscow, Russia',
      55.7558,
      37.6173,
      'social cultural',
      array['social','cultural']::text[]
    ),
    (
      'Side by Side Film Festival 2026',
      'saint_petersburg',
      'International LGBTQ+ cinema and dialogue platform with screenings, talks, and community cultural programming.',
      'https://www.bok-o-bok.com/',
      null::date,
      null::date,
      null::date,
      'Saint Petersburg, Russia',
      59.9360,
      30.3150,
      'cultural festival',
      array['cultural','festival']::text[]
    ),
    (
      'Coming Out Support Webinar Series',
      'saint_petersburg',
      'Rolling support webinars and counseling-led sessions for LGBTQ+ people and close ones.',
      'https://comingoutspb.org/en/',
      null::date,
      null::date,
      null::date,
      'Saint Petersburg (online and support-network format), Russia',
      59.9343,
      30.3351,
      'social relax',
      array['social','relax']::text[]
    ),
    (
      'Cabaret Weekend Show Program',
      'saint_petersburg',
      'Recurring late-weekend stage and dance sequence in central Saint Petersburg.',
      'https://www.instagram.com/cabaret_club_spb/',
      null::date,
      null::date,
      null::date,
      'Razyezzhaya 43, Saint Petersburg, Russia',
      59.9190,
      30.3495,
      'drag after',
      array['drag','after']::text[]
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

insert into public.qa_country_rights_profiles (
  country,
  legal_level,
  rights_level,
  safety_level,
  same_sex_relations_status,
  union_status,
  legal_gender_recognition_status,
  anti_discrimination_status,
  what_this_means,
  confidence,
  source_legal_url,
  source_rights_url,
  source_safety_url,
  source_checked_at,
  needs_manual_review
) values
  (
    'Russia',
    'mixed',
    'risk',
    'risk',
    'restricted',
    'no_protection',
    'restricted',
    'limited_or_none',
    'Legal and safety context is high-risk for LGBTQ+ people. Same-sex intimacy status and enforcement can vary by region, while censorship/extremism frameworks and limited protections significantly increase practical risk.',
    'medium',
    'https://ilga.org/ilga-world-maps/',
    'https://www.equaldex.com/region/russia',
    'https://www.humandignitytrust.org/',
    current_date,
    false
  )
on conflict (country) do update set
  legal_level = excluded.legal_level,
  rights_level = excluded.rights_level,
  safety_level = excluded.safety_level,
  same_sex_relations_status = excluded.same_sex_relations_status,
  union_status = excluded.union_status,
  legal_gender_recognition_status = excluded.legal_gender_recognition_status,
  anti_discrimination_status = excluded.anti_discrimination_status,
  what_this_means = excluded.what_this_means,
  confidence = excluded.confidence,
  source_legal_url = excluded.source_legal_url,
  source_rights_url = excluded.source_rights_url,
  source_safety_url = excluded.source_safety_url,
  source_checked_at = excluded.source_checked_at,
  needs_manual_review = excluded.needs_manual_review,
  updated_at = now();

commit;
