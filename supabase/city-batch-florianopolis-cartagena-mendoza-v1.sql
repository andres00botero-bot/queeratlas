-- Queer Atlas city batch v1
-- Cities: florianopolis, cartagena, mendoza
-- Idempotent insert script (no duplicates by lower(city)+lower(name))
-- Sources blended from official venue/hotel/community channels and local city/event references.
-- Note: only official websites or official social pages are linked.

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
      'Conca Club',
      'florianopolis',
      'club',
      'Long-running Florianopolis LGBTQIA+ club with multi-floor structure, high-output electronic programming, and major weekend momentum.',
      'legendary floripa queer electronic engine',
      array['electronic','after']::text[],
      'Fri 23:59-05:00, Sat 23:59-07:00, Sun-Thu closed.',
      'https://conca.com.br/',
      'Av. Rio Branco, 729 - Centro, Florianopolis - SC, 88015-203, Brazil',
      -27.5949,
      -48.5482
    ),
    (
      'Jivago Social Club',
      'florianopolis',
      'club',
      'Central Floripa social club with pop, funk, and electronic crossover, focused on inclusive queer-heavy weekend nights.',
      'inclusive weekend dance room with mixed sounds',
      array['mixed','pop','electronic']::text[],
      'Fri-Sat 23:00-06:00, Sun-Thu closed.',
      'https://www.jivagosocialclub.com/',
      'R. Dep. Leoberto Leal, 116 - Centro, Florianopolis - SC, 88015-080, Brazil',
      -27.5969,
      -48.5488
    ),
    (
      'RAPASHH Men''s Club',
      'florianopolis',
      'cruise_club',
      'Male-focused cruise bar with event programming, dark social infrastructure, and consistent weekday movement in downtown Floripa.',
      'male-focused cruise-and-bar lane',
      array['cruise','after']::text[],
      'Mon-Fri 16:00-23:00, Sat-Sun 16:00-22:00.',
      'https://www.rapashh.com.br/',
      'R. Fernando Machado, 187 - Centro, Florianopolis - SC, 88020-130, Brazil',
      -27.5974,
      -48.5482
    ),
    (
      'SELVA Bar Floripa',
      'florianopolis',
      'bar',
      'Queer-friendly central bar with open-air energy, affordable drinks, and pre-club social rhythm.',
      'tree-canopy social warmup with queer crossover',
      array['social','chill']::text[],
      'Tue 15:00-00:00, Wed-Sun 15:00-02:00/04:00, Mon closed.',
      'https://www.instagram.com/selvafloripa',
      'Av. Hercilio Luz, 449 - Centro, Florianopolis - SC, 88020-060, Brazil',
      -27.5948,
      -48.5538
    ),
    (
      'Praia Mole',
      'florianopolis',
      'cruising_area',
      'Major LGBTQ-popular beach zone in Florianopolis, strongest around carnival periods and weekend sunset windows.',
      'gay-popular beach corridor with high season energy',
      array['social','chill']::text[],
      'Daily daytime to sunset; strongest social flow Fri-Sun.',
      'https://www.pmf.sc.gov.br/entidades/turismo/index.php?cms=praia+mole&menu=0',
      'Praia Mole, Florianopolis - SC, Brazil',
      -27.6013,
      -48.4374
    ),
    (
      'Praia da Galheta Route',
      'florianopolis',
      'cruising_area',
      'Trail-linked naturist beach route adjacent to Praia Mole, frequently used as a discreet queer cruising and social zone.',
      'naturist trail route with queer-coded cruising flow',
      array['chill','cruise']::text[],
      'Daily daylight hours; most active afternoons and warm-season weekends.',
      'https://www.pmf.sc.gov.br/entidades/turismo/index.php?cms=praia+da+galheta&menu=0',
      'Trilha da Galheta, Florianopolis - SC, Brazil',
      -27.6038,
      -48.4309
    ),
    (
      'LK Design Hotel',
      'florianopolis',
      'hotel',
      'Design-forward upscale hotel used by LGBTQ travelers as a high-comfort base near central nightlife routing.',
      'premium queer-friendly bayfront stay',
      array['luxury','mixed']::text[],
      '24/7 hotel operation.',
      'https://lkdesignhotel.com.br/',
      'R. Bocaiuva, 1755 - Centro, Florianopolis - SC, 88015-530, Brazil',
      -27.5896,
      -48.5485
    ),
    (
      'Novotel Florianopolis',
      'florianopolis',
      'hotel',
      'Reliable bayfront hotel option with strong walkability and direct rideshare access into Centro queer nightlife lanes.',
      'seafront mainstream comfort with easy nightlife access',
      array['mixed','social']::text[],
      '24/7 hotel operation.',
      'https://all.accor.com/hotel/5633/index.en.shtml',
      'Av. Rubens de Arruda Ramos, 2034 - Centro, Florianopolis - SC, 88015-701, Brazil',
      -27.5828,
      -48.5454
    ),
    (
      'Avatar Disco Bar',
      'cartagena',
      'club',
      'One of Cartagena''s best-known LGBTQ nightlife rooms with high-energy dance programming and weekend drag-heavy momentum.',
      'cartagena drag-and-pop dance pressure room',
      array['drag','pop']::text[],
      'Thu-Sun 19:00-03:00, Mon-Wed closed.',
      '',
      'La Heroica, Centro Historico, Cartagena, Colombia',
      10.4232,
      -75.5486
    ),
    (
      'Gabanna Bar Club Cartagena',
      'cartagena',
      'club',
      'Three-level queer nightlife venue with dance floors, dark-room infrastructure, and strong local-weekend turnout.',
      'multi-floor local queer party machine',
      array['mixed','after']::text[],
      'Tue-Sun 19:30-03:00, Mon closed.',
      '',
      'Cl. 32 #18B-108 Local 1A, Pie del Cerro, Cartagena, Colombia',
      10.4145,
      -75.5285
    ),
    (
      'ROMA CLUB VIDEO BAR',
      'cartagena',
      'cruise_club',
      'Male-focused queer venue with social bar, video-room and dark-room formats, especially active on late-week nights.',
      'male-focused video-bar with dark-room lane',
      array['cruise','after']::text[],
      'Mon-Wed 11:00-23:00, Thu-Sat 11:00-03:00, Sun 11:00-23:00.',
      'https://video-bar-geminis.negocio.site/',
      'Cl. 31 #44-54, Barrio Espana, Cartagena, Colombia',
      10.4109,
      -75.5152
    ),
    (
      'Patio Bonito Cartagena',
      'cartagena',
      'bar',
      'Friendly LGBTQ bar format with strong crossover music lane and high-energy social flow in evening windows.',
      'rumba-heavy social opener with crossover tracks',
      array['social','mixed']::text[],
      'Daily 19:00-03:00 (often later on peak nights).',
      '',
      'Cl. 31A, diagonal a KR 47-21, Cartagena, Colombia',
      10.4104,
      -75.5122
    ),
    (
      'Le Petit Cartagena',
      'cartagena',
      'bar',
      'Long-running Old City queer bar/disco format with crossover, electronic, and tropical lanes under one roof.',
      'historic-center queer classic with three music rooms',
      array['social','electronic','mixed']::text[],
      'Daily cafe-to-night operation; club peak Thu-Sun late.',
      'https://www.facebook.com/LePetitRestaurantectg/',
      'Calle del Candilejo 32-34, Centro Historico, Cartagena, Colombia',
      10.4228,
      -75.5499
    ),
    (
      'Caribe Afirmativo Casa Afirmativa',
      'cartagena',
      'cafe',
      'Community-rights infrastructure linked to Caribbean LGBTQ advocacy, psychosocial support, and legal guidance programs.',
      'rights-led lgbtiq support and advocacy node',
      array['social','cultural']::text[],
      'Programmed community schedules; verify event calendar before visiting.',
      'https://caribeafirmativo.lgbt/',
      'Cartagena, Bolivar, Colombia',
      10.3997,
      -75.5144
    ),
    (
      'Sofitel Legend Santa Clara',
      'cartagena',
      'hotel',
      'Flagship luxury hotel inside Cartagena''s walled city, commonly used as a high-comfort LGBTQ-friendly base.',
      'luxury old-city stay with premium queer comfort',
      array['luxury','mixed']::text[],
      '24/7 hotel operation.',
      'https://www.sofitellegendsantaclara.com/',
      'Cl. del Torno 39-29, Cartagena, Colombia',
      10.4277,
      -75.5469
    ),
    (
      'Hyatt Regency Cartagena',
      'cartagena',
      'hotel',
      'Modern high-rise hotel with easy access to Centro and Getsemani nightlife circuits.',
      'bayfront modern hotel with direct nightlife routing',
      array['mixed','social']::text[],
      '24/7 hotel operation.',
      'https://www.hyatt.com/hyatt-regency/en-US/ctgrc-hyatt-regency-cartagena',
      'Cra. 1 #12-118, Bocagrande, Cartagena, Colombia',
      10.4117,
      -75.5532
    ),
    (
      'Hotel Charleston Santa Teresa',
      'cartagena',
      'hotel',
      'Historic luxury hotel frequently used by international LGBTQ travelers in central Cartagena.',
      'heritage-luxury queer-friendly old-city base',
      array['luxury','mixed']::text[],
      '24/7 hotel operation.',
      'https://www.hotelcharlestonsantateresa.com/',
      'Cra. 3 #31-23, Centro, Cartagena, Colombia',
      10.4237,
      -75.5515
    ),
    (
      'Queen Disco',
      'mendoza',
      'club',
      'One of Mendoza''s best-known queer club rooms with weekend-only operation, drag-adjacent shows, and late-night momentum.',
      'mendoza flagship gay dance floor',
      array['drag','pop']::text[],
      'Sat 23:00-06:30, Sun-Fri closed.',
      '',
      '25 de Mayo 318, Mendoza, Argentina',
      -32.8866,
      -68.8433
    ),
    (
      'La Reserva',
      'mendoza',
      'bar',
      'Central Mendoza queer-friendly nightlife room known for drag shows, social density, and a strong local crowd.',
      'late-night drag and social bar institution',
      array['drag','social']::text[],
      'Wed-Sat 22:30-05:00, Sun-Tue closed.',
      'https://www.instagram.com/lareservabar',
      'Rivadavia 32, M5502 Mendoza, Argentina',
      -32.8888,
      -68.8453
    ),
    (
      'Foxy Live Bar',
      'mendoza',
      'bar',
      'Night bar format with live-show programming and crossover music in the Mendoza center corridor.',
      'city-center queer-pop and live-night lane',
      array['pop','social']::text[],
      'Wed-Sun 19:00-03:00, Mon-Tue closed.',
      'https://www.instagram.com/foxybar_mza/',
      'Av. San Martin 2289, Mendoza, Argentina',
      -32.8776,
      -68.8364
    ),
    (
      'Vendimia Para Todos Hub',
      'mendoza',
      'cafe',
      'Core production and audience anchor point for Mendoza''s major LGBTQ diversity celebration tied to Vendimia season.',
      'nationally recognized diversity festival anchor',
      array['festival','social']::text[],
      'Event-led festival windows (mainly March cycle).',
      'https://www.mendoza.gov.ar/prensa/llega-la-28-edicion-de-vendimia-para-todos/',
      'Arena Maipu Stadium, Maipu, Mendoza, Argentina',
      -32.9824,
      -68.7875
    ),
    (
      'Plaza Independencia Pride Route',
      'mendoza',
      'cruising_area',
      'Historic civic route endpoint used for Pride marches, diversity festivals, and visibility programming in central Mendoza.',
      'marcha-and-festival civic gathering point',
      array['social','festival']::text[],
      'Public space daily; strongest on march and event dates.',
      'https://www.mendoza.gov.ar/prensa/marcha-del-orgullo-en-mendoza/',
      'Plaza Independencia, Mendoza, Argentina',
      -32.8895,
      -68.8458
    ),
    (
      'Park Hyatt Mendoza',
      'mendoza',
      'hotel',
      'High-comfort central hotel option with easy access to nightlife lanes and event areas around Plaza Independencia.',
      'premium casino-district base with queer comfort',
      array['luxury','mixed']::text[],
      '24/7 hotel operation.',
      'https://www.hyatt.com/park-hyatt/en-US/mdzph-park-hyatt-mendoza',
      'Chile 1124, M5500 Mendoza, Argentina',
      -32.8929,
      -68.8443
    ),
    (
      'Diplomatic Hotel',
      'mendoza',
      'hotel',
      'Upscale city hotel near Mendoza nightlife corridors and dining routes, commonly used by international queer travelers.',
      'upscale aristides-adjacent queer-friendly stay',
      array['luxury','mixed']::text[],
      '24/7 hotel operation.',
      'https://www.diplomatichotel.com/',
      'Av. Belgrano 1041, M5500 Mendoza, Argentina',
      -32.8943,
      -68.8495
    ),
    (
      'Huentala Hotel Mendoza',
      'mendoza',
      'hotel',
      'Central hotel with good access to city bars, cultural venues, and event-night movement.',
      'wine-route central stay with strong urban access',
      array['mixed','social']::text[],
      '24/7 hotel operation.',
      'https://www.huentala.com/',
      'Primitivo de la Reta 1007, M5500 Mendoza, Argentina',
      -32.8867,
      -68.8396
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
      'Parada do Orgulho LGBTI+ Florianopolis 2026',
      'florianopolis',
      'Major annual Pride parade and rights visibility event on Beira-Mar Continental, one of Southern Brazil''s largest queer public gatherings.',
      'https://floripa.lgbt/parada/',
      '2026-11-28'::date,
      null::date,
      null::date,
      'Beira-Mar Continental, Florianopolis, Brazil',
      -27.5848,
      -48.5781,
      'festival social',
      array['festival','social']::text[]
    ),
    (
      'Bloco Pop Gay Carnaval 2026',
      'florianopolis',
      'High-energy carnival LGBTQ stage and pageant format in central Florianopolis with national guest performers and dense crowd turnout.',
      'https://floripa.com/eventos/carnaval-de-rua-de-florianopolis-bloco-pop-gay-com-gloria-groove/',
      '2026-02-16'::date,
      null::date,
      null::date,
      'Centro, Florianopolis, Brazil',
      -27.5962,
      -48.5488,
      'festival drag',
      array['festival','drag']::text[]
    ),
    (
      'Semana da Diversidade Floripa',
      'florianopolis',
      'Community programming week around Pride and public-rights messaging, with cultural activations and nightlife spikes across Florianopolis.',
      'https://floripa.lgbt/',
      '2026-11-23'::date,
      null::date,
      null::date,
      'Florianopolis, Brazil',
      -27.5949,
      -48.5482,
      'social cultural',
      array['social','cultural']::text[]
    ),
    (
      'Cartagena Pride Community March 2026',
      'cartagena',
      'Annual Pride-period community march and visibility programming in Cartagena led by local LGBTQ collectives and rights networks.',
      'https://caribeafirmativo.lgbt/marica-diverso-y-va-palante-primera-marcha-del-orgullo-lgbt-en-cartagena/',
      '2026-06-27'::date,
      null::date,
      null::date,
      'Cartagena, Colombia',
      10.3997,
      -75.5144,
      'festival social',
      array['festival','social']::text[]
    ),
    (
      'Desfile de Independencia y Diversidades 2026',
      'cartagena',
      'Cultural and rights-centered diversity parade integrated with Cartagena''s independence festivities and public arts program.',
      'https://www.cartagena.gov.co/index.php/noticias/colorido-multicultural-fue-el-desfile-independencia-diversidades-cartagena',
      '2026-11-11'::date,
      null::date,
      null::date,
      'Centro Historico, Cartagena, Colombia',
      10.4242,
      -75.5473,
      'cultural festival',
      array['cultural','festival']::text[]
    ),
    (
      'Cartagena Diversity Rights Forum',
      'cartagena',
      'Community-rights dialogue format connecting local activists, institutions, and public-health inclusion work in Cartagena.',
      'https://caribeafirmativo.lgbt/',
      '2026-06-25'::date,
      null::date,
      null::date,
      'Cartagena, Colombia',
      10.3997,
      -75.5144,
      'social cultural',
      array['social','cultural']::text[]
    ),
    (
      'Marcha del Orgullo Mendoza 2026',
      'mendoza',
      'Annual city Pride march and festival format with rights advocacy, cultural performances, and central-plaza gathering.',
      'https://www.mendoza.gov.ar/prensa/marcha-del-orgullo-en-mendoza/',
      '2026-12-05'::date,
      null::date,
      null::date,
      'Plaza Independencia, Mendoza, Argentina',
      -32.8895,
      -68.8458,
      'festival social',
      array['festival','social']::text[]
    ),
    (
      'Vendimia Para Todos 2026',
      'mendoza',
      'Flagship diversity celebration tied to Vendimia season, with large-scale show production and national LGBTQ tourism pull.',
      'https://www.mendoza.gov.ar/prensa/llega-la-28-edicion-de-vendimia-para-todos/',
      '2026-03-29'::date,
      null::date,
      null::date,
      'Mendoza, Argentina',
      -32.9824,
      -68.7875,
      'festival drag',
      array['festival','drag']::text[]
    ),
    (
      'Promotores de la Diversidad Week',
      'mendoza',
      'Training and organizing cycle linked to local diversity offices ahead of Mendoza Pride programming.',
      'https://prensa.ciudaddemendoza.gob.ar/2025/10/21/previo-a-la-marcha-del-orgullo-se-realizo-la-1o-capacitacion-de-promotores-de-la-diversidad/',
      '2026-10-20'::date,
      null::date,
      null::date,
      'Mendoza, Argentina',
      -32.8892,
      -68.8443,
      'social community',
      array['social']::text[]
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
)
values
  (
    'Brazil',
    'good',
    'mixed',
    'mixed',
    'legal',
    'civil_union_or_partnership',
    'available',
    'partial_coverage',
    'Same-sex relations are legal and marriage equality is recognized. Rights framework is comparatively strong in law, while practical safety still varies by local context and time.',
    'medium',
    'https://www.equaldex.com/region/brazil',
    'https://www.equaldex.com/region/brazil',
    'https://ilga.org/ilga-world-maps/',
    current_date,
    false
  ),
  (
    'Colombia',
    'good',
    'good',
    'mixed',
    'legal',
    'marriage',
    'available',
    'full_coverage',
    'Colombia has broad legal recognition including marriage equality and anti-discrimination protections, but real-world safety can still vary across neighborhoods and nightlife contexts.',
    'medium',
    'https://www.equaldex.com/region/colombia',
    'https://www.equaldex.com/region/colombia',
    'https://caribeafirmativo.lgbt/',
    current_date,
    false
  ),
  (
    'Argentina',
    'good',
    'good',
    'good',
    'legal',
    'marriage',
    'available',
    'full_coverage',
    'Argentina has one of the strongest legal-rights baselines in Latin America, with marriage equality and robust gender-identity protections in force nationwide.',
    'high',
    'https://www.argentina.gob.ar/justicia/derechofacil/leysimple/matrimonio-igualitario',
    'https://www.argentina.gob.ar/justicia/derechofacil/leysimple/identidad-de-genero',
    'https://www.equaldex.com/region/argentina',
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
