-- Queer Atlas city batch v1
-- Cities: santo_domingo, managua, la_paz
-- Includes: places + events + country rights updates (Dominican Republic, Nicaragua, Bolivia)
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
      'REVASA Pride Hub',
      'santo_domingo',
      'cafe',
      'Community-led LGBTIQ hub connected to Orgullo LGBTIQ Dominicano programming and rights-focused organizing.',
      'pride infrastructure and social signal',
      array['social','cultural']::text[],
      'Program schedule varies by campaign and event season.',
      'https://www.revasa.org.do/',
      'Calle Sanchez 122, Zona Colonial, Santo Domingo, Dominican Republic',
      18.4702,
      -69.8837
    ),
    (
      'Platinum Disco Club',
      'santo_domingo',
      'club',
      'Late-night dance room in Santo Domingo with large weekend throughput and crossover crowd energy.',
      'weekend dance-floor pressure',
      array['massive','mixed']::text[],
      'Fri-Sat 21:00-04:00, Sun-Thu closed.',
      'https://www.platinumdiscoclub.com/',
      'Av. Independencia 2, Santo Domingo 10103, Dominican Republic',
      18.4586,
      -69.9000
    ),
    (
      'Zona Colonial Night Corridor',
      'santo_domingo',
      'cafe',
      'Walkable social route linking community-forward bars, cultural spaces, and Pride-season nightlife flow.',
      'route-first social sequencing',
      array['social','after']::text[],
      'Most active Thu-Sun evenings and Pride weeks.',
      'https://www.revasa.org.do/orgullo',
      'Zona Colonial, Distrito Nacional, Santo Domingo, Dominican Republic',
      18.4708,
      -69.8844
    ),
    (
      'Grupo SAFO Community Node',
      'managua',
      'cafe',
      'Lesbian-led rights organization and support infrastructure focused on legal, health, and community advocacy.',
      'community care and rights defense',
      array['social','cultural']::text[],
      'Support windows vary by program and safety conditions.',
      'http://gruposafo.doblementemujer.org/',
      'Monseñor Lezcano, Managua, Nicaragua',
      12.1329,
      -86.2714
    ),
    (
      'ANIT Trans Support Node',
      'managua',
      'cafe',
      'Trans community support and rights visibility node connected to Asociacion Nicaraguense de Transgeneras.',
      'trans-led support infrastructure',
      array['social','cultural']::text[],
      'Program schedule varies; verify via organization channels.',
      'https://wiconnect.iadb.org/en/osc/asociacion-nicaraguense-de-transgeneras-anit/',
      'Managua, Nicaragua',
      12.1364,
      -86.2514
    ),
    (
      'Bar Deja Vu Managua',
      'managua',
      'bar',
      'Late social bar lane known for inclusive no-prejudice messaging and mixed-crowd evening flow.',
      'inclusive local social room',
      array['social','mixed']::text[],
      'Daily evening schedule varies; confirm same-day.',
      'https://www.facebook.com/498748683560732',
      'Casa del Obrero area, Managua, Nicaragua',
      12.1515,
      -86.2751
    ),
    (
      'Colectivo TLGB Bolivia Hub',
      'la_paz',
      'cafe',
      'National TLGB rights network node with legal, social, and community empowerment activity linked to La Paz.',
      'rights and advocacy backbone',
      array['social','cultural']::text[],
      'Program windows vary by campaign and calendar.',
      'https://colectivotlgbbolivia.org.bo/',
      'La Paz, Bolivia',
      -16.4897,
      -68.1193
    ),
    (
      'Manodiversa Community Center',
      'la_paz',
      'cafe',
      'Diversity-rights organization hub supporting LGBTQ+ populations through inclusion, education, and legal-social pathways.',
      'community resilience platform',
      array['social','cultural']::text[],
      'Program schedule varies; check official updates.',
      'https://www.manodiversa.org/',
      'La Paz, Bolivia',
      -16.5000,
      -68.1500
    ),
    (
      'La Luna Pub Music Bar',
      'la_paz',
      'bar',
      'Long-running La Paz nightlife room with music-first bar energy and a mixed late social floor.',
      'late mixed local nightlife',
      array['mixed','after']::text[],
      'Mon-Wed 18:00-02:00, Thu-Sat 18:00-03:00, Sun closed.',
      'https://www.facebook.com/lalunapubmusicbar',
      'Calle Oruro No. 197 esq. Murillo, La Paz, Bolivia',
      -16.4995,
      -68.1362
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
      'Orgullo LGBTIQ Dominicano (Caravana)',
      'santo_domingo',
      'Flagship annual Dominican Pride mobilization and cultural rights event coordinated with community organizations.',
      'https://www.revasard.org/orgullo',
      null::date,
      null::date,
      null::date,
      'Santo Domingo, Dominican Republic',
      18.4861,
      -69.9312,
      'festival social',
      array['festival','social']::text[]
    ),
    (
      'Obsesion Festival del Orgullo RD',
      'santo_domingo',
      'Large Pride-season cultural festival that closes Orgullo LGBTIQ programming with artists and community performances.',
      'https://www.revasa.org.do/obsesion',
      null::date,
      null::date,
      null::date,
      'Santo Domingo, Dominican Republic',
      18.4861,
      -69.9312,
      'festival cultural',
      array['festival','cultural']::text[]
    ),
    (
      'IDAHOBIT Rights Forum Santo Domingo',
      'santo_domingo',
      'Community discussion and rights-awareness program around the International Day Against Homophobia, Biphobia and Transphobia.',
      'https://coin.org.do/',
      '2026-05-17'::date,
      '2026-05-17'::date,
      '2026-05-17'::date,
      'Santo Domingo, Dominican Republic',
      18.4861,
      -69.9312,
      'social cultural',
      array['social','cultural']::text[]
    ),
    (
      'Nicaragua Pride Community Memory Day',
      'managua',
      'Community-led remembrance and rights dialogue marking Pride history in Nicaragua under constrained civic conditions.',
      'http://gruposafo.doblementemujer.org/',
      '2026-06-28'::date,
      '2026-06-28'::date,
      '2026-06-28'::date,
      'Managua, Nicaragua',
      12.1364,
      -86.2514,
      'social cultural',
      array['social','cultural']::text[]
    ),
    (
      'Grupo SAFO Rights and Health Meetup Series',
      'managua',
      'Recurring community sessions on rights access, sexual health literacy, and local support pathways.',
      'http://gruposafo.doblementemujer.org/',
      null::date,
      null::date,
      null::date,
      'Managua, Nicaragua',
      12.1364,
      -86.2514,
      'social cultural',
      array['social','cultural']::text[]
    ),
    (
      'ANIT Trans Rights Community Session',
      'managua',
      'Trans-focused support and rights community session anchored in local advocacy networks.',
      'https://wiconnect.iadb.org/en/osc/asociacion-nicaraguense-de-transgeneras-anit/',
      null::date,
      null::date,
      null::date,
      'Managua, Nicaragua',
      12.1364,
      -86.2514,
      'social cultural',
      array['social','cultural']::text[]
    ),
    (
      'Marcha de las Diversidades La Paz 2026',
      'la_paz',
      'Annual diversity march and public rights visibility event in central La Paz with community participation.',
      'https://colectivotlgbbolivia.org.bo/',
      '2026-06-27'::date,
      '2026-06-27'::date,
      '2026-06-27'::date,
      'La Paz, Bolivia',
      -16.4897,
      -68.1193,
      'festival social',
      array['festival','social']::text[]
    ),
    (
      'Colectivo TLGB Rights Forum La Paz',
      'la_paz',
      'Community rights forum covering legal inclusion, social protection, and policy visibility for TLGB populations.',
      'https://colectivotlgbbolivia.org.bo/',
      null::date,
      null::date,
      null::date,
      'La Paz, Bolivia',
      -16.4897,
      -68.1193,
      'social cultural',
      array['social','cultural']::text[]
    ),
    (
      'D''Power Youth Leadership Session',
      'la_paz',
      'Youth-focused diversity leadership and civic participation program connected to local LGBTI+ organizing.',
      'https://www.dpowerlgbti.com/',
      null::date,
      null::date,
      null::date,
      'La Paz, Bolivia',
      -16.4897,
      -68.1193,
      'cultural social',
      array['cultural','social']::text[]
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
    'Dominican Republic',
    'good',
    'risk',
    'mixed',
    'legal',
    'no_protection',
    'restricted',
    'limited_or_none',
    'Same-sex relations are legal, but marriage equality and comprehensive anti-discrimination protections remain limited; practical safety varies by context.',
    'medium',
    'https://ilga.org/ilga-world-maps/',
    'https://www.equaldex.com/region/dominican-republic',
    'https://www.revasa.org.do/',
    current_date,
    false
  ),
  (
    'Nicaragua',
    'mixed',
    'risk',
    'risk',
    'legal',
    'no_protection',
    'restricted',
    'limited_or_none',
    'Same-sex relations are legal, but broad legal protections and civic conditions remain constrained, requiring higher caution for public visibility.',
    'medium',
    'https://ilga.org/ilga-world-maps/',
    'https://www.equaldex.com/region/nicaragua',
    'http://gruposafo.doblementemujer.org/',
    current_date,
    false
  ),
  (
    'Bolivia',
    'good',
    'mixed',
    'mixed',
    'legal',
    'no_protection',
    'available',
    'partial_coverage',
    'Same-sex relations are legal and gender identity procedures exist, while relationship recognition and full rights coverage remain incomplete.',
    'medium',
    'https://ilga.org/ilga-world-maps/',
    'https://www.equaldex.com/region/bolivia',
    'https://colectivotlgbbolivia.org.bo/',
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
