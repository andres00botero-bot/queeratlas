-- Queer Atlas: Salvador Bahia city package
-- Verified 2026-06-20.
-- Safe to run multiple times.
--
-- Research sources were reviewed separately. App-facing links below are official
-- venue/hotel/organization sites or social pages; unverified venue links are blank.
--
-- Restaurants and cafes use type = 'cafe' as required by the app/database.
-- Saunas are inserted into public.places with type = 'sauna'.
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
      'Bar Ancora do Marujo',
      'salvador_bahia',
      'bar',
      'Long-running LGBTQ bar and drag/transformist performance hub on Rua Carlos Gomes, active since 2000 and one of Salvador''s most important local queer rooms.',
      'historic carlos gomes drag bar and community hub',
      array[]::text[],
      'Mon 23:00-03:00; Tue-Fri 20:00-03:00; Sat 23:00-03:00; Sun 23:00-00:00 according to TravelGay. Verify current programming before visiting.',
      'https://www.instagram.com/ancoradomarujo/',
      'R. Carlos Gomes, 809 - Dois de Julho, Salvador - BA, Brazil',
      -12.981900,
      -38.516200
    ),
    (
      'Carmen Lounge Bar',
      'salvador_bahia',
      'bar',
      'Gay bar on Rua Carlos Gomes with local drag shows, cocktails and Brazilian DJ programming in Salvador''s classic LGBTQ nightlife lane.',
      'red-painted drag lounge on carlos gomes',
      array[]::text[],
      'Wed 21:00-02:00; Thu 21:00-03:00; Fri-Sat 21:00-04:00; Sun 21:00-03:00; Mon-Tue closed according to TravelGay. Verify current hours before visiting.',
      'https://www.instagram.com/carmenlbsalvador/',
      'R. Carlos Gomes, 860 - Centro, Salvador - BA, Brazil',
      -12.981400,
      -38.516000
    ),
    (
      'San Sebastian Salvador',
      'salvador_bahia',
      'club',
      'Main gay club in Salvador and the city''s most tourist-friendly LGBTQ dance-floor reference, with weekend late nights and frequent drag performances.',
      'rio vermelho flagship gay club',
      array[]::text[],
      'Fri-Sat 23:00-06:00 according to TravelGay. Verify current event calendar before visiting.',
      '',
      'Rua Conselheiro Pedro Luiz, 488 - Rio Vermelho, Salvador - BA, 41950-610, Brazil',
      -13.009600,
      -38.488700
    ),
    (
      'Amsterdam Pop Club',
      'salvador_bahia',
      'club',
      'Gay-popular Rio Vermelho pop club that hosts queer events and attracts a younger dressed-up crowd on Thursday-to-Saturday nights.',
      'gay-popular rio vermelho pop club',
      array[]::text[],
      'Thu-Sat 22:30-06:00 according to TravelGay. Verify current event calendar before visiting.',
      '',
      'R. Joao Gomes, 249 - Rio Vermelho, Salvador - BA, Brazil',
      -13.010500,
      -38.489600
    ),
    (
      'Boate Tropical Club',
      'salvador_bahia',
      'club',
      'Weekend gay dance club with tribal house, drag shows and late-night party energy near central Salvador.',
      'weekend tribal-house and drag club',
      array[]::text[],
      'Fri-Sat 23:00-06:00 according to TravelGay. Verify current opening before visiting.',
      'https://www.instagram.com/boate_tropical/',
      'R. Gamboa de Cima, 24 - Centro, Salvador - BA, Brazil',
      -12.982700,
      -38.520600
    ),
    (
      'Maximus Bar',
      'salvador_bahia',
      'bar',
      'Bright lounge bar near Carmen Lounge Bar with drag shows, diva-themed drinks and local LGBTQ nightlife momentum.',
      'drag lounge near carlos gomes',
      array[]::text[],
      'Queer In The World notes Thu-Sat from about 22:00 until close. Verify current hours before visiting.',
      'https://www.facebook.com/maximus.bar.9',
      'Rua Carlos Gomes, Centro, Salvador - BA, Brazil',
      -12.981700,
      -38.516100
    ),
    (
      'Boteco do Paulista',
      'salvador_bahia',
      'cafe',
      'Gay-friendly food-and-drag spot known for pastel, informal floor-level performances and evening entertainment from Wednesday to Sunday.',
      'food-led drag boteco with local crowd',
      array[]::text[],
      'Evenings Wed-Sun according to Queer In The World; verify current schedule before visiting.',
      'https://www.instagram.com/botecodopaulista_ssa/',
      'Salvador - BA, Brazil',
      -12.982000,
      -38.516000
    ),
    (
      'Clube 11',
      'salvador_bahia',
      'sauna',
      'Gay sauna in Tororo with private rooms, cabins, dry and steam sauna, showers, bar, erotic videos and massage options.',
      'tororo gay sauna with cabins and massage',
      array[]::text[],
      'Tue-Sun 15:00-22:00; Mon closed according to TravelGay. Verify current hours before visiting.',
      '',
      'R. Jose Duarte, 11 - Tororo, Salvador - BA, Brazil',
      -12.978900,
      -38.508400
    ),
    (
      'Clube Rios',
      'salvador_bahia',
      'sauna',
      'Men''s sauna and club in Barris with dry and steam sauna, showers, bar, dark room, cinema and recurring parties.',
      'barris mens sauna and party club',
      array[]::text[],
      'Mon-Fri 15:00-20:30; Sat-Sun 15:00-21:00 according to TravelGay. Verify current events before visiting.',
      '',
      'R. Almeida Sande, 8 - Barris, Salvador - BA, Brazil',
      -12.978300,
      -38.513700
    ),
    (
      'Praia Porto da Barra',
      'salvador_bahia',
      'cruising_area',
      'Porto da Barra beach is widely referenced as Salvador''s unofficial LGBT+ beach, with sunset, swimming, coconut vendors and easy Barra access.',
      'unofficial lgbt beach and sunset cove',
      array[]::text[],
      'Daily daylight and sunset hours; avoid isolated beach movement after dark.',
      '',
      'Praia do Porto da Barra, Barra, Salvador - BA, Brazil',
      -13.002800,
      -38.532900
    ),
    (
      'Hotel Fasano Salvador',
      'salvador_bahia',
      'hotel',
      'Five-star city-centre luxury hotel in a historic building with bay views, pool, gym and easy access to Pelourinho, Mercado Modelo and central culture.',
      'luxury bay-view historic-centre hotel',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.fasano.com.br/hoteis/fasano-salvador',
      'Praca Castro Alves, 5 - Centro, Salvador - BA, 40020-160, Brazil',
      -12.974500,
      -38.515300
    ),
    (
      'Novotel Salvador Rio Vermelho',
      'salvador_bahia',
      'hotel',
      'Modern Rio Vermelho hotel with rooftop pool and strong nightlife access, useful for travelers prioritizing club routes and restaurants.',
      'rio vermelho hotel close to nightlife',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://all.accor.com/hotel/8185/index.en.shtml',
      'R. Monte Conselho, 505 - Rio Vermelho, Salvador - BA, Brazil',
      -13.013900,
      -38.493300
    ),
    (
      'Casa do Amarelindo',
      'salvador_bahia',
      'hotel',
      'Boutique hotel in Pelourinho with colorful rooms, bay views and rooftop pool, ideal for culture-first stays near historic Salvador.',
      'pelourinho boutique hotel with bay views',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.casadoamarelindo.com/',
      'Rua das Portas do Carmo, 6 - Pelourinho, Salvador - BA, Brazil',
      -12.972000,
      -38.508700
    ),
    (
      'Mercure Salvador Rio Vermelho',
      'salvador_bahia',
      'hotel',
      'Oceanfront Rio Vermelho hotel with pool and direct access to one of Salvador''s most useful nightlife and restaurant neighborhoods.',
      'oceanfront rio vermelho mainstream stay',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://all.accor.com/hotel/5173/index.en.shtml',
      'Rua Fonte do Boi, 215 - Rio Vermelho, Salvador - BA, Brazil',
      -13.014900,
      -38.488800
    ),
    (
      'Hotel Bahia do Sol',
      'salvador_bahia',
      'hotel',
      'Good-value central hotel near Barra, Campo Grande and cultural routes, useful for travelers who want practical access rather than a party hotel.',
      'central value hotel between barra and old town',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.hotelbahiadosol.com.br/',
      'Av. Sete de Setembro, 2009 - Vitoria, Salvador - BA, Brazil',
      -12.991600,
      -38.525900
    ),
    (
      'Casa di Vina Boutique Hotel',
      'salvador_bahia',
      'hotel',
      'Itapua boutique hotel connected with Vinicius de Moraes heritage, useful for beach-first travelers who prefer a calmer base away from central nightlife.',
      'itapua beach boutique hotel and cultural stay',
      array[]::text[],
      'Hotel open daily; reception and booking services operate continuously. Verify room availability directly.',
      'https://www.casadivinabahia.com.br/',
      'Rua Flamengo, 44 - Itapua, Salvador - BA, Brazil',
      -12.952300,
      -38.365000
    ),
    (
      'Blue Beach Bar',
      'salvador_bahia',
      'cafe',
      'Beachside gastropub and daytime bar recommended for seafood, caipirinhas and ocean-view social time before shifting into Salvador nightlife.',
      'beachside food and caipirinha daytime bar',
      array[]::text[],
      'Daily about 09:00-19:00 according to Queer In The World. Verify current hours before visiting.',
      'https://www.instagram.com/bluepraiabar/',
      'Salvador - BA, Brazil',
      -13.011000,
      -38.488000
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
      'Orgulho LGBT+ Bahia',
      'salvador_bahia',
      'Annual Bahia Pride / Orgulho LGBT+ visibility event connected with Salvador and Grupo Gay da Bahia; 2026 promotion is already listed by GGB. Verify exact date, route and edition details before planning.',
      'https://grupogaydabahia.com.br/',
      null::date,
      null::date,
      null::date,
      'Salvador - BA, Brazil',
      -12.991800,
      -38.490600,
      'bahia pride visibility and rights event',
      array[]::text[]
    ),
    (
      'Salvador Carnival LGBT+ Circuit',
      'salvador_bahia',
      'Carnival-season LGBTQ and drag visibility route in Salvador, including costume contests, Rainha LGBTrans programming and gay-popular circuits around Campo Grande, Barra/Ondina and central nightlife.',
      'https://grupogaydabahia.com.br/',
      null::date,
      null::date,
      null::date,
      'Multiple carnival circuits, Salvador - BA, Brazil',
      -12.991800,
      -38.490600,
      'carnival queer visibility and party circuit',
      array[]::text[]
    ),
    (
      'San Sebastian Weekend Nights',
      'salvador_bahia',
      'Recurring Friday and Saturday late gay club nights at San Sebastian, Salvador''s clearest tourist-friendly LGBTQ dance-floor reference.',
      '',
      null::date,
      null::date,
      null::date,
      'San Sebastian, Rua Conselheiro Pedro Luiz, 488 - Rio Vermelho, Salvador - BA, Brazil',
      -13.009600,
      -38.488700,
      'weekend gay club nights',
      array[]::text[]
    ),
    (
      'Bar Ancora do Marujo Drag Shows',
      'salvador_bahia',
      'Recurring drag and transformist shows at Bar Ancora do Marujo, one of Salvador''s longest-running LGBTQ performance spaces.',
      'https://www.instagram.com/ancoradomarujo/',
      null::date,
      null::date,
      null::date,
      'Bar Ancora do Marujo, R. Carlos Gomes, 809 - Dois de Julho, Salvador - BA, Brazil',
      -12.981900,
      -38.516200,
      'local drag and transformist performance nights',
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
      'Grupo Gay da Bahia',
      'salvador_bahia',
      'other',
      'Grupo Gay da Bahia',
      'Use official website and social channels for current contact details.',
      'https://grupogaydabahia.com.br/',
      'Historic LGBTQ rights organization founded in Salvador in 1980, widely referenced as Brazil''s oldest active LGBTQ association and a key source for Bahia Pride, safety and community context.',
      'Organization and event schedule vary; verify current access before visiting.',
      'https://grupogaydabahia.com.br/',
      array[]::text[],
      'Pelourinho, Salvador - BA, Brazil',
      -12.971900,
      -38.508600,
      '$',
      'historic lgbtq rights organization and bahia pride signal',
      array[]::text[],
      'Grupo Gay da Bahia official website',
      '2026-06-20'::date,
      true
    ),
    (
      'Centro de Referencia LGBT+ Vida Bruno',
      'salvador_bahia',
      'other',
      'Centro de Referencia LGBT+ Vida Bruno / Salvador municipal network',
      'Use GGB and Salvador municipal channels for current service access.',
      'https://grupogaydabahia.com.br/',
      'Local LGBTQ reference/service signal in Salvador, connected with community support, rights access and municipal diversity infrastructure.',
      'Service hours vary; verify directly before visiting.',
      'https://grupogaydabahia.com.br/',
      array[]::text[],
      'Salvador - BA, Brazil',
      -12.991800,
      -38.490600,
      '$',
      'lgbtq support and rights-reference service signal',
      array[]::text[],
      'Grupo Gay da Bahia official website',
      '2026-06-20'::date,
      true
    ),
    (
      'Afro-Brazilian History Tour Signal',
      'salvador_bahia',
      'tour',
      'Local Salvador cultural tour operators',
      'Book through verified tour operator channels and confirm guide credentials.',
      '',
      'Culture-first tour route recommended for understanding Salvador''s Afro-Brazilian history, slavery legacy, Pelourinho and community context around the city.',
      'Tour schedules vary by operator; verify current availability before booking.',
      '',
      array[]::text[],
      'Pelourinho, Salvador - BA, Brazil',
      -12.971900,
      -38.508600,
      '$$',
      'afro-brazilian culture and history tour signal',
      array[]::text[],
      'Queer In The World Salvador guide',
      '2026-06-20'::date,
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
where lower(trim(city)) = 'salvador_bahia'

union all

select 'events', count(*)
from public.events
where lower(trim(city)) = 'salvador_bahia'

union all

select 'services', count(*)
from public.services
where lower(trim(city)) = 'salvador_bahia';
