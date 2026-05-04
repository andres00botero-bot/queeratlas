-- Queer Atlas city batch v1
-- Cities: vilnius, riga, tbilisi
-- Includes: places + events + country rights updates (Lithuania, Latvia, Georgia)
-- Idempotent inserts (dedupe by lower(city)+lower(name))
-- Links: official websites / Instagram / Facebook / organization pages only.

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
      'SOHO Club Vilnius',
      'vilnius',
      'club',
      'Longest-running queer nightclub in Lithuania with drag showcases, themed party nights, and dual dancefloor momentum.',
      'flagship baltic queer dancefloor',
      array['drag','massive']::text[],
      'Fri-Sat 22:00-07:00.',
      'https://www.sohoclub.lt/',
      'Svitrigailos g. 7, Vilnius 03110, Lithuania',
      54.6787,
      25.2668
    ),
    (
      'Gay Bar Vilnius',
      'vilnius',
      'bar',
      'Late social pre-club bar format linked to Soho programming and weekend crowd build-up.',
      'social-to-club crossover lane',
      array['social','mixed']::text[],
      'Thu-Sat evenings; check official updates before visit.',
      'https://www.gaybar.lt/',
      'Svitrigailos g. 7 area, Vilnius, Lithuania',
      54.6786,
      25.2669
    ),
    (
      'LGL LGBT Centre',
      'vilnius',
      'cafe',
      'Rights-first community infrastructure run by the national LGBT rights organization LGL, with support, information, and advocacy programming.',
      'community-rights support infrastructure',
      array['social','cultural']::text[],
      'Program schedule varies; verify via official LGL channels.',
      'https://www.lgl.lt/en/',
      'Vilnius, Lithuania',
      54.6872,
      25.2797
    ),
    (
      'TOP Club Riga',
      'riga',
      'club',
      'Core LGBTQ+ nightclub in Riga with drag, karaoke, and late-night show format across multiple rooms.',
      'main riga queer nightclub engine',
      array['drag','massive']::text[],
      'Tue-Thu 20:00-02:00, Fri-Sat 21:00-07:00, Sun 20:00-02:00, Mon closed.',
      'https://www.topclub.lv/',
      'Alfreda Kalnina iela 4, Riga, LV-1050, Latvia',
      56.9496,
      24.1242
    ),
    (
      'Skapis',
      'riga',
      'bar',
      'Iconic Riga queer bar-and-club lane with intimate dance energy and strong local regular crowd.',
      'cozy late queer room',
      array['cozy','mixed']::text[],
      'Thu 19:00-00:00, Fri 19:00-06:00, Sat 22:00-06:00, Sun-Wed closed.',
      'https://www.instagram.com/skapis.riga/',
      'Aristida Briana iela 9a, Riga, Latvia',
      56.9639,
      24.1226
    ),
    (
      'LGBT House Riga',
      'riga',
      'cafe',
      'Community safe-space hub with support services, events, and rights infrastructure connected to Mozaika.',
      'community care and organizing node',
      array['social','cultural']::text[],
      'Service windows vary by program; check official channels.',
      'https://www.mozaika.lv/en/',
      'Stabu iela 19-2, Riga, LV-1011, Latvia',
      56.9576,
      24.1258
    ),
    (
      'Success Bar Tbilisi',
      'tbilisi',
      'bar',
      'Historic queer bar anchor in central Tbilisi with drag-friendly nights and community-protected social floor.',
      'core queer safe-night anchor',
      array['drag','social']::text[],
      'Tue-Sun 20:00-03:00, Mon closed (verify same-day updates).',
      'https://www.instagram.com/success_bar/',
      '3 Vashlovani St, Tbilisi, Georgia',
      41.7002,
      44.7982
    ),
    (
      'KHIDI Club',
      'tbilisi',
      'club',
      'Leading underground techno institution with inclusive door policy and anti-harassment house rules.',
      'underground techno pressure room',
      array['techno','underground','electronic']::text[],
      'Fri-Sat late-night schedule; check upcoming nights before visit.',
      'https://khidi.ge/',
      'President Heydar Aliyev Embankment, Tbilisi, Georgia',
      41.7210,
      44.7838
    ),
    (
      'Equality Movement Community Node',
      'tbilisi',
      'cafe',
      'Community rights organization providing legal and psychosocial support for LGBTQ+ people in Georgia.',
      'rights-defense support infrastructure',
      array['social','cultural']::text[],
      'Support schedule varies by program and safety context.',
      'https://equality.ge/en/',
      'Tbilisi, Georgia',
      41.7151,
      44.8015
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
      'Lithuanian Pride 2026',
      'vilnius',
      'National Pride week in Vilnius with community, rights, and culture programming.',
      'https://www.lgl.lt/en/',
      '2026-06-02'::date,
      '2026-06-02'::date,
      '2026-06-06'::date,
      'Vilnius, Lithuania',
      54.6872,
      25.2797,
      'festival social',
      array['festival','social']::text[]
    ),
    (
      'March For Equality! Vilnius 2026',
      'vilnius',
      'Main Lithuanian Pride march in Vilnius as the peak public visibility moment of the week.',
      'https://www.lgl.lt/en/',
      '2026-06-06'::date,
      '2026-06-06'::date,
      '2026-06-06'::date,
      'Vilnius city center, Lithuania',
      54.6872,
      25.2797,
      'social festival',
      array['social','festival']::text[]
    ),
    (
      'Lithuanian Pride International Conference 2026',
      'vilnius',
      'International conference focused on rainbow families, legal equality, and institutional inclusion.',
      'https://www.lgl.lt/en/',
      '2026-06-05'::date,
      '2026-06-05'::date,
      '2026-06-05'::date,
      'Vilnius City Municipality Conference Hall, Vilnius, Lithuania',
      54.6837,
      25.2796,
      'cultural social',
      array['cultural','social']::text[]
    ),
    (
      'Riga Pride 2026',
      'riga',
      'Riga Pride march and week-peak rights visibility event.',
      'https://www.rigapride.lv/',
      '2026-06-13'::date,
      '2026-06-13'::date,
      '2026-06-13'::date,
      'Riga city center, Latvia',
      56.9496,
      24.1052,
      'festival social',
      array['festival','social']::text[]
    ),
    (
      'Riga Pride House Community Program',
      'riga',
      'Community meetups, culture talks, and inclusive programming around Riga Pride week.',
      'https://www.rigapride.lv/',
      null::date,
      null::date,
      null::date,
      'Riga Pride House, Riga, Latvia',
      56.9496,
      24.1052,
      'cultural social',
      array['cultural','social']::text[]
    ),
    (
      'Mozaika Community Rights Events',
      'riga',
      'Rolling community events and rights-focused activities hosted by Mozaika and partner spaces.',
      'https://www.mozaika.lv/en/',
      null::date,
      null::date,
      null::date,
      'Stabu iela 19-2, Riga, Latvia',
      56.9576,
      24.1258,
      'social cultural',
      array['social','cultural']::text[]
    ),
    (
      'Tbilisi Pride Community Program',
      'tbilisi',
      'Community-led pride and solidarity programming coordinated through local LGBTQ+ networks in Tbilisi.',
      'https://www.instagram.com/tbilisipride/',
      null::date,
      null::date,
      null::date,
      'Tbilisi, Georgia',
      41.7151,
      44.8015,
      'social cultural',
      array['social','cultural']::text[]
    ),
    (
      'Equality Movement Annual Rights Briefing',
      'tbilisi',
      'Public rights briefing and community update format centered on legal and safety context in Georgia.',
      'https://equality.ge/en/',
      null::date,
      null::date,
      null::date,
      'Tbilisi, Georgia',
      41.7151,
      44.8015,
      'cultural social',
      array['cultural','social']::text[]
    ),
    (
      'IDAHOBIT Solidarity Day Tbilisi',
      'tbilisi',
      'Community solidarity programming for the International Day Against Homophobia, Biphobia and Transphobia.',
      'https://equality.ge/en/',
      '2026-05-17'::date,
      '2026-05-17'::date,
      '2026-05-17'::date,
      'Tbilisi, Georgia',
      41.7151,
      44.8015,
      'social cultural',
      array['social','cultural']::text[]
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
    'Lithuania',
    'good',
    'mixed',
    'mixed',
    'legal',
    'civil_union_or_partnership',
    'restricted',
    'partial_coverage',
    'Same-sex relations are legal and civil union framework is evolving, but protections are still uneven across employment, housing, and gender-identity coverage.',
    'medium',
    'https://ilga.org/ilga-world-maps/',
    'https://www.equaldex.com/region/lithuania',
    'https://www.lgl.lt/en/',
    current_date,
    false
  ),
  (
    'Latvia',
    'good',
    'mixed',
    'mixed',
    'legal',
    'civil_union_or_partnership',
    'restricted',
    'partial_coverage',
    'Same-sex relations are legal and civil unions are in force, while broader anti-discrimination and hate-crime protections remain incomplete.',
    'medium',
    'https://ilga.org/ilga-world-maps/',
    'https://www.equaldex.com/region/latvia',
    'https://www.mozaika.lv/en/',
    current_date,
    false
  ),
  (
    'Georgia',
    'mixed',
    'risk',
    'risk',
    'legal',
    'no_protection',
    'impossible',
    'limited_or_none',
    'Same-sex relations are legal, but recent anti-LGBT restrictions, censorship, and weak structural protections create a high-caution rights and safety context.',
    'medium',
    'https://ilga.org/ilga-world-maps/',
    'https://www.equaldex.com/region/georgia',
    'https://equality.ge/en/',
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
