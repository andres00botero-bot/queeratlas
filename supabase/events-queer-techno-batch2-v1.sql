-- Queer Atlas: queer-friendly techno events batch 2
-- Cities covered: barcelona, paris, lisbon, mexico_city, madrid, sao_paulo
-- Source policy: official event pages (Resident Advisor listings)
-- Idempotent: no duplicates by lower(city)+lower(name)

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
      'LASTER CLUB - OFFBCN 26 (indoor)',
      'barcelona',
      'Techno-heavy OFFBCN session with explicit no-discrimination floor policy and long-form warehouse energy.',
      'https://ra.co/events/2351863',
      '2026-06-21'::date,
      null::date,
      null::date,
      'Seaseaclub Barcelona, Carrer Port Esportiu 14P, Barcelona, Spain',
      41.4145,
      2.2244,
      'offweek techno warehouse pressure',
      array['techno','underground','massive']::text[]
    ),
    (
      'Planet Venus Off Week: Melina Serser, Naone, Super Venus, KARNE KULTURE',
      'barcelona',
      'Queer-forward OFF Week journey blending techno, trance, and experimental sounds across day-to-night stages.',
      'https://es.ra.co/events/2430825',
      '2026-06-20'::date,
      null::date,
      null::date,
      'Village Underground Barcelona, Carrer Cobalt 12, LHospitalet, Spain',
      41.3619,
      2.1282,
      'queer offweek techno-trance journey',
      array['techno','electronic','social']::text[]
    ),
    (
      '01366 OFFBCN 26',
      'barcelona',
      'All-night OFF Week format with techno-house crossover and high-capacity dancefloor pull.',
      'https://ra.co/events/2427125',
      '2026-06-18'::date,
      null::date,
      null::date,
      'Village Underground Barcelona, Carrer Cobalt 12, LHospitalet, Spain',
      41.3619,
      2.1282,
      'offweek techno crossover night',
      array['techno','electronic','massive']::text[]
    ),
    (
      'Spectrum Waves: Multi-collective (Nord + Sud)',
      'paris',
      'Queer-centered multi-collective techno night focused on connection, consent, and surprise-driven curation.',
      'https://ra.co/events/2285181',
      '2026-02-13'::date,
      null::date,
      null::date,
      'La Station - Gare des Mines, 29 Avenue de la Porte d Aubervilliers, Paris, France',
      48.8984,
      2.3662,
      'queer collective techno ritual',
      array['techno','underground','social']::text[]
    ),
    (
      'LA SCARLETTE',
      'paris',
      'Queer and FLINTA-centered club session with techno and trance lanes and explicit inclusion rules.',
      'https://ra.co/events/2400263',
      '2026-04-24'::date,
      null::date,
      null::date,
      'Panic Room, 101 Rue Amelot, Paris, France',
      48.8625,
      2.3677,
      'flinta queer techno-trance room',
      array['techno','electronic','social']::text[]
    ),
    (
      'BODYDOXY#1',
      'lisbon',
      'Community-first queer dancefloor centering POC and female artists with techno and club-focused selectors.',
      'https://ra.co/events/2403052',
      '2026-04-17'::date,
      null::date,
      null::date,
      'Casa Independente, Largo do Intendente 45, Lisbon, Portugal',
      38.7208,
      -9.1359,
      'queer poc-fem techno floor',
      array['techno','social','cultural']::text[]
    ),
    (
      'Sunday Squirt w/ AAguilAA, Angel D''lite, tINI, and Tottie',
      'lisbon',
      'Queer FLINTA-prioritized Sunday dance format with techno-house energy and strict safer-space etiquette.',
      'https://ra.co/events/2381059',
      '2026-03-15'::date,
      null::date,
      null::date,
      'Rumu, Rua Nova da Trindade 5G, Lisbon, Portugal',
      38.7113,
      -9.1408,
      'queer sunday techno-house flow',
      array['techno','social','chill']::text[]
    ),
    (
      'SPFDJ',
      'mexico_city',
      'Hard-edged techno booking tied to queer Berlin club lineage and high-intensity CDMX underground energy.',
      'https://ra.co/events/2369848',
      '2026-02-28'::date,
      null::date,
      null::date,
      'Loo Loo, Londres 195, Cuauhtemoc, Mexico City, Mexico',
      19.4237,
      -99.1657,
      'hard queer-techno cdmx pressure',
      array['techno','underground','electronic']::text[]
    ),
    (
      'KINYXX Madrid Fet!sh Pride Party',
      'madrid',
      'Queer-fetish Pride-week party with house-techno direction and explicit identity-safe floor culture.',
      'https://ra.co/events/2423093',
      '2026-06-26'::date,
      null::date,
      null::date,
      'Strong the Club, Calle de Trujillos 7, Madrid, Spain',
      40.4202,
      -3.7068,
      'pride-week queer fetish techno',
      array['techno','fetish','social']::text[]
    ),
    (
      'Horsegiirl (Ao Vivo) @ Zigstudio 20/3',
      'sao_paulo',
      'Queer-club flagship booking in Sao Paulo with high-tempo hard-dance and techno crossover under anti-discrimination policy.',
      'https://ra.co/events/2394076',
      '2026-03-20'::date,
      null::date,
      null::date,
      'Zig Studio, Av. Pacaembu 33, Sao Paulo, Brazil',
      -23.5338,
      -46.6649,
      'queer-club high-tempo crossover',
      array['techno','electronic','social']::text[]
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
