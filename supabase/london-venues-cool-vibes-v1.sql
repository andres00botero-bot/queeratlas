-- Queer Atlas: London venue enrichment (cool queer vibe)
-- Safe behavior:
-- 1) Updates existing rows by lower(city)+lower(name)
-- 2) Inserts only if missing

begin;

with payload (
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
      'Admiral Duncan',
      'london',
      'bar',
      'Admiral Duncan is one of Soho''s most storied gay pubs, where camp singalongs, drag spillover, and old-London pub DNA still create real community charge. It is not polished-for-camera nightlife. It is lived queer heritage with a loud, warm, very London heartbeat.',
      'soho drag-karaoke pub classic',
      array['drag','social']::text[],
      'Mon-Thu 13:00-23:30; Fri-Sat 12:00-24:00; Sun 12:00-22:30.',
      'https://www.admiral-duncan.co.uk/',
      '54 Old Compton Street, London W1D 4UD, UK',
      51.5132,
      -0.1310
    ),
    (
      'Rupert Street Bar',
      'london',
      'bar',
      'Rupert Street Bar is classic Soho social architecture: terrace eye-contact early, then DJ-driven crowd density later. It is one of the cleanest ways to start London queer nightlife with style before the city shifts into harder club tempo.',
      'soho terrace-to-dj social runway',
      array['social','mixed']::text[],
      'Mon-Tue 15:00-23:00; Wed-Thu 15:00-23:30; Fri 15:00-24:00; Sat 12:00-24:00; Sun 12:00-22:30.',
      'https://www.rupert-street.com/',
      '50 Rupert Street, London W1D 6DR, UK',
      51.5126,
      -0.1332
    ),
    (
      'The Yard',
      'london',
      'bar',
      'The Yard nails that intimate Soho fantasy: tucked entrance, beautiful courtyard, and a crowd that can turn from chill flirt to proper nightlife pressure by nightfall. It''s one of London''s best date-to-chaos transitions in one venue.',
      'hidden courtyard queer magnet',
      array['social','cozy']::text[],
      'Mon-Thu 15:00/16:00-23:30; Fri 14:00-24:00; Sat 13:00-24:00; Sun 14:00-22:30.',
      'https://www.yardbar.co.uk/',
      '57 Rupert Street, London W1D 7PL, UK',
      51.5127,
      -0.1335
    ),
    (
      'KU Bar',
      'london',
      'bar',
      'KU Bar runs on central-London velocity: sharp service, attractive crowd flow, and a constant pre-club pulse around Leicester Square. Strong option when you want night momentum early and zero logistical friction.',
      'leicester-square pre-club current',
      array['social','mixed']::text[],
      'Daily from afternoon to late; strongest Fri-Sat after 21:00.',
      'https://www.ku-bar.co.uk/',
      '30 Lisle Street, London WC2H 7BA, UK',
      51.5105,
      -0.1299
    ),
    (
      'Comptons of Soho',
      'london',
      'bar',
      'Comptons is old-school Soho gay pub gravity at full strength: pints, shoulder-to-shoulder energy, and generations of queer London nightlife memory in one room. Great when you want atmosphere over aesthetics.',
      'old-school soho pub gravity',
      array['social','cozy']::text[],
      'Daily from midday to late evening.',
      'https://www.comptonsofsoho.co.uk/',
      '51-53 Old Compton Street, London W1D 6HN, UK',
      51.5137,
      -0.1318
    ),
    (
      'Halfway to Heaven',
      'london',
      'bar',
      'Halfway to Heaven is camp-central for many London nights: cabaret DNA, mixed theatre crowd, and that cozy-chaotic social compression Soho does better than almost anywhere.',
      'cabaret basement with west-end spill',
      array['drag','social']::text[],
      'Daily 12:00-late (show/night schedule varies).',
      'https://www.halfway2heaven.co.uk/',
      '7 Duncannon Street, London WC2N 4JF, UK',
      51.5087,
      -0.1278
    ),
    (
      'Two Brewers',
      'london',
      'club',
      'Two Brewers is South London''s drag-and-dance workhorse: big personality hosts, packed weekend floors, and a crowd that commits hard to fun. If Soho is full, this is often where the night properly explodes.',
      'clapham drag-to-dance powerhouse',
      array['drag','mixed']::text[],
      'Wed-Thu 17:00-24:00; Fri 17:00-04:00; Sat 15:00-04:00; Sun 15:00-24:00.',
      'https://www.the2brewers.com/',
      '114 Clapham High Street, London SW4 7UJ, UK',
      51.4629,
      -0.1393
    ),
    (
      'RVT – Royal Vauxhall Tavern',
      'london',
      'club',
      'RVT is a cornerstone of UK queer nightlife history: cabaret, comedy, drag, activism, and dance-floor culture under one iconic roof. It feels both legendary and still very alive, especially on peak event nights.',
      'historic queer cabaret institution',
      array['drag','social']::text[],
      'Thu 19:00-24:00; Fri 18:00-late; Sat 21:00-04:00; Sun 16:00-22:30.',
      'https://www.vauxhalltavern.com/',
      '372 Kennington Lane, London SE11 5HY, UK',
      51.4846,
      -0.1225
    ),
    (
      'Heaven',
      'london',
      'club',
      'Heaven is still one of London''s highest-impact queer dance rooms: large capacity, hard weekend pressure, and a crowd mix that ranges from students to veterans. When it hits, it hits at full metropolitan scale.',
      'big-room queer nightlife benchmark',
      array['mixed','electronic']::text[],
      'Event-led, typically late-night Thu-Sat.',
      'https://g-a-yandheaven.co.uk/',
      'Villiers Street, London WC2N 6NG, UK',
      51.5076,
      -0.1238
    ),
    (
      'Eagle London',
      'london',
      'cruise_club',
      'Eagle London channels Vauxhall''s darker masculine nightlife with dance-floor crossover and fetish-coded crowd gravity. Ideal for travelers who want London''s nightlife to move from social into more deliberate after-dark intent.',
      'vauxhall leather-afterhours signal',
      array['fetish','cruise']::text[],
      'Thu-Sat late, with event-led Sundays.',
      'https://www.eaglelondon.com/',
      '349 Kennington Lane, London SE11 5QY, UK',
      51.4859,
      -0.1240
    ),
    (
      'Sweatbox Soho',
      'london',
      'sauna',
      'Sweatbox is central London adult infrastructure done efficiently: gym, sauna, steam, cabins, and nonstop traffic in the heart of Soho. Useful as both planned destination and spontaneous late-night reset.',
      '24h central sauna-gym engine',
      array['relax','cruise']::text[],
      'Daily 24h.',
      'https://www.sweatboxsoho.com/',
      '1-2 Ramillies Street, London W1F 7LN, UK',
      51.5141,
      -0.1370
    ),
    (
      'Pleasuredrome',
      'london',
      'sauna',
      'Pleasuredrome is one of London''s most recognized gay bathhouse addresses: under-arch setting, full adult facilities, and a broad crowd mix that keeps movement steady day and night.',
      'waterloo 24h bathhouse maze',
      array['relax','cruise']::text[],
      'Daily 24h.',
      'https://www.pleasuredrome.com/',
      '124 Cornwall Road, London SE1 8XE, UK',
      51.5038,
      -0.1108
    ),
    (
      'Covent Garden Health Spa',
      'london',
      'sauna',
      'Covent Garden Health Spa is a long-running central option with a practical location and dependable evening flow for men who want a straightforward West End sauna lane.',
      'west-end sauna classic',
      array['relax']::text[],
      'Mon-Fri 12:00-23:30; Sat 12:00-02:00; Sun 12:00-22:30.',
      'https://www.cghspa.uk/',
      '29 Endell Street, London WC2H 9BA, UK',
      51.5130,
      -0.1239
    ),
    (
      'Sailors Sauna',
      'london',
      'sauna',
      'Sailors Sauna serves London''s East End with a mature-skewing social mix and straightforward adult setup. A practical pick when your night logic sits outside Soho/Vauxhall.',
      'east-london mature crowd lane',
      array['relax']::text[],
      'Mon 13:00-21:00/24:00; Tue-Fri 12:00-21:00/24:00; Sat-Sun 13:00-21:00/24:00.',
      'https://www.sailorssauna.com/',
      '574 Commercial Road, London E14 7JD, UK',
      51.5130,
      -0.0236
    ),
    (
      'Locker Room',
      'london',
      'sauna',
      'Locker Room is a friendlier, lower-friction sauna option in Kennington with steady repeat local traffic and less Soho intensity. Strong if you want a calmer adult reset channel.',
      'kennington social sauna reset',
      array['relax']::text[],
      'Daily 11:00-24:00.',
      'https://www.lockerroomsauna.co.uk/',
      '6 Cleaver Street, London SE11 4DP, UK',
      51.4889,
      -0.1112
    )
),
updated as (
  update public.places p
  set
    type = s.type,
    description = s.description,
    vibe = s.vibe,
    vibe_tags = s.vibe_tags,
    hours = s.hours,
    link = s.link,
    location = s.location,
    lat = s.lat,
    lng = s.lng
  from payload s
  where lower(p.city) = lower(s.city)
    and lower(p.name) = lower(s.name)
  returning p.id
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
  s.name,
  s.city,
  s.type,
  s.description,
  s.vibe,
  s.vibe_tags,
  s.hours,
  s.link,
  s.location,
  s.lat,
  s.lng
from payload s
where not exists (
  select 1
  from public.places p
  where lower(p.city) = lower(s.city)
    and lower(p.name) = lower(s.name)
);

commit;

