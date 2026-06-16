-- Queer Atlas: Albania country-as-city package
-- Verified 2026-06-16.
-- Safe to run multiple times.
--
-- Adds or refreshes:
-- - 15 venues across Tirana, Blloku and the Albanian coast
-- - 4 verified community / support services
-- - Albania legal information and legal breakdown
-- - Duplicate cleanup restricted to Albania records
--
-- Albania is intentionally modeled as the city slug "albania"
-- because the queer venue signal is country-wide and Tirana-led rather
-- than dense enough for several separate city pages.
-- No active dedicated gay sauna or permanent gay club could be verified.

begin;

with new_places (
  name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng
) as (
  values
    (
      'Radio Bar Tirana',
      'albania',
      'bar',
      'A stylish Blloku cocktail bar repeatedly recommended in gay Tirana travel guides as one of the easiest queer-friendly mixed rooms. It is useful as a soft-start anchor before deciding whether the night becomes social, cultural or louder.',
      'Blloku queer-friendly cocktail bar with retro local style',
      array['mixed','cozy','social']::text[],
      'Daily evening-led bar hours vary; verify current opening before visiting.',
      'https://www.instagram.com/radiobartirana/',
      'Rruga Ismail Qemali, Tirana 1001, Albania',
      41.321900,
      19.817900
    ),
    (
      'Komiteti Kafe Muzeum',
      'albania',
      'cafe',
      'A beloved Tirana cafe-bar with museum-like Albanian decor, raki, coffee and a mixed creative crowd. It works well for daytime orientation, early drinks and low-pressure social energy.',
      'museum-like cafe bar with mixed creative crowd',
      array['cultural','cozy','mixed']::text[],
      'Daily cafe and bar hours vary; verify current service before visiting.',
      'https://komiteti.al/',
      'Rruga Fatmir Haxhiu, Tirana 1001, Albania',
      41.323100,
      19.822500
    ),
    (
      'Nouvelle Vague Tirana',
      'albania',
      'bar',
      'A small, design-forward cocktail bar in Blloku with an international mixed crowd and easy queer-friendly signal in local guides. Best used for first drinks and conversation rather than a dedicated scene night.',
      'design-forward Blloku cocktail bar with mixed crowd',
      array['mixed','cozy','social']::text[],
      'Evening-led bar hours vary; verify same-day opening before going.',
      'https://www.instagram.com/nouvellevaguetirana/',
      'Rruga Pjeter Bogdani, Tirana 1001, Albania',
      41.320900,
      19.816800
    ),
    (
      'Bunker 1944 Lounge',
      'albania',
      'bar',
      'A Tirana lounge and bar with communist-era styling, cocktails and a mixed local-traveler crowd. It is useful for queer travelers who want atmosphere without needing a clearly gay-labeled venue.',
      'themed Tirana lounge bar with mixed social energy',
      array['mixed','cultural','cozy']::text[],
      'Evening-led bar hours vary; check current listings before visiting.',
      'https://www.instagram.com/bunker1944/',
      'Rruga Andon Zako Cajupi, Tirana 1001, Albania',
      41.320500,
      19.816500
    ),
    (
      'Colonial Cocktails Academy Tirana',
      'albania',
      'bar',
      'A cocktail-focused Blloku bar useful for polished drinks, dates and mixed international social flow. It is queer-friendly by context rather than an LGBTQ-only venue.',
      'polished Blloku cocktail bar for dates and mixed nights',
      array['mixed','social','cozy']::text[],
      'Evening-led cocktail hours vary; verify current opening before visiting.',
      'https://www.instagram.com/colonialcocktailsacademy/',
      'Rruga Pjeter Bogdani, Tirana 1001, Albania',
      41.320900,
      19.816700
    ),
    (
      'Hemingway Bar Tirana',
      'albania',
      'bar',
      'A relaxed Tirana bar known for cocktails, rum and an artsy mixed crowd. It is a practical lower-pressure stop when Blloku feels too glossy or when the night needs conversation first.',
      'artsy cocktail bar with relaxed mixed crowd',
      array['mixed','cozy','cultural']::text[],
      'Evening-led bar hours vary; verify current opening before visiting.',
      'https://www.instagram.com/hemingway_bar_tirana/',
      'Rruga Kont Urani, Tirana 1001, Albania',
      41.326500,
      19.817800
    ),
    (
      'Tulla Culture Center',
      'albania',
      'club',
      'A mixed cultural and music venue in Tirana used for concerts, DJ nights, talks and alternative programming. It is not a gay club, but it is one of the more useful culture-led rooms for queer-friendly nights.',
      'alternative culture and music venue with mixed crowd',
      array['mixed','cultural','underground']::text[],
      'Programme-led; verify event schedule before going.',
      'https://www.instagram.com/tullacenter/',
      'Tirana 1001, Albania',
      41.326000,
      19.811800
    ),
    (
      'Folie Terrace',
      'albania',
      'club',
      'A large mainstream Tirana club and event venue with high-volume mixed nightlife. It is useful when the plan requires a proper dance floor rather than a bar-led evening.',
      'large mixed Tirana club with commercial dance energy',
      array['mixed','massive','pop']::text[],
      'Event-led late nights; verify current programme and door times before going.',
      'https://www.instagram.com/folieterrace/',
      'Sheshi Italia, Tirana 1001, Albania',
      41.319800,
      19.823500
    ),
    (
      'Blloku Nightlife Route',
      'albania',
      'cruising_area',
      'Tirana''s most useful nightlife district for queer travelers, with dense mixed bars, cocktail rooms, cafes and late-night movement. Treat it as a social route, not a dedicated cruising area.',
      'central mixed nightlife route with the strongest queer-friendly signal',
      array['mixed','social','chill']::text[],
      'Evening route; strongest Thu-Sat from dinner through late bars.',
      'https://www.wolfyy.com/travel-guide-gay-tirana/',
      'Blloku, Tirana 1001, Albania',
      41.321200,
      19.816900
    ),
    (
      'Destil Creative Hub',
      'albania',
      'cafe',
      'A creative cafe, bar and cultural hub in Tirana that works well for laptop hours, exhibitions, talks and low-pressure mixed social energy before night plans.',
      'creative cafe and cultural hub with mixed daytime-to-evening flow',
      array['cultural','cozy','mixed']::text[],
      'Cafe, bar and event hours vary; verify current programme before visiting.',
      'https://www.instagram.com/destil.creative.hub/',
      'Rruga Qamil Guranjaku, Tirana 1001, Albania',
      41.322600,
      19.826000
    ),
    (
      'Mullixhiu',
      'albania',
      'cafe',
      'A contemporary Albanian restaurant near the Grand Park, useful as a higher-quality dinner base before Tirana drinks. Listed as cafe because the app stores restaurants and cafes under the cafe type.',
      'modern Albanian restaurant and cafe for dinner before bars',
      array['cozy','cultural','mixed']::text[],
      'Lunch and dinner hours vary; verify current reservations and service before visiting.',
      'https://www.instagram.com/mullixhiu/',
      'Shititorja Lasgush Poradeci, Tirana 1001, Albania',
      41.315600,
      19.821600
    ),
    (
      'Dhermi Beach Route',
      'albania',
      'cruising_area',
      'A Riviera beach route around Dhermi and Drymades for travelers pairing Albania with sun, swims and summer social energy. It is mixed and seasonal, not a dedicated gay beach.',
      'Albanian Riviera beach route with mixed summer signal',
      array['chill','relax','mixed']::text[],
      'Seasonal beach route; daytime and sunset hours are strongest.',
      'https://nomadicboys.com/gay-albania/',
      'Dhermi, Himare Municipality, Albania',
      40.151900,
      19.639700
    ),
    (
      'Ksamil Beach Route',
      'albania',
      'cruising_area',
      'A southern coast beach route useful for queer travelers who want bright water, resort stays and a slower Albania add-on after Tirana. It is scenic and mixed rather than gay-specific.',
      'southern coast beach route for low-pressure recovery',
      array['chill','relax','mixed']::text[],
      'Seasonal beach route; daytime visits are recommended.',
      'https://nomadicboys.com/gay-albania/',
      'Ksamil, Sarande Municipality, Albania',
      39.768400,
      20.000800
    ),
    (
      'Maritim Hotel Plaza Tirana',
      'albania',
      'hotel',
      'A polished central Tirana hotel close to Skanderbeg Square, government areas, museums and short transfers into Blloku nightlife.',
      'central upscale Tirana hotel for culture and nightlife access',
      array['luxury','cozy','mixed']::text[],
      'Hotel open daily; reception and booking services operate 24 hours.',
      'https://www.maritim.com/en/hotels/albania/hotel-plaza-tirana/hotel-overview',
      'Rruga 28 Nentori, Tirana 1001, Albania',
      41.328500,
      19.819700
    ),
    (
      'Rogner Hotel Tirana',
      'albania',
      'hotel',
      'A long-established central Tirana hotel on the main boulevard, practical for first-time visitors who want comfort, walkability and quick access to Blloku.',
      'central boulevard hotel with easy Blloku access',
      array['luxury','relax','mixed']::text[],
      'Hotel open daily; reception and booking services operate 24 hours.',
      'https://www.hotel-rogner.com/',
      'Bulevardi Deshmoret e Kombit, Tirana 1001, Albania',
      41.320300,
      19.819500
    )
),
updated as (
  update public.places p
  set
    type = np.type,
    description = np.description,
    vibe = np.vibe,
    vibe_tags = np.vibe_tags,
    hours = np.hours,
    link = np.link,
    location = np.location,
    lat = np.lat,
    lng = np.lng
  from new_places np
  where lower(trim(p.city)) = lower(trim(np.city))
    and lower(trim(p.name)) = lower(trim(np.name))
  returning p.id
)
insert into public.places (
  name, city, type, description, vibe, vibe_tags, hours, link, location, lat, lng
)
select
  np.name, np.city, np.type, np.description, np.vibe, np.vibe_tags,
  np.hours, np.link, np.location, np.lat, np.lng
from new_places np
where not exists (
  select 1
  from public.places p
  where lower(trim(p.city)) = lower(trim(np.city))
    and lower(trim(p.name)) = lower(trim(np.name))
);

with new_services (
  name, city, type, provider_name, contact, booking_link, description,
  hours, link, image_urls, location, lat, lng, price_tier, vibe,
  vibe_tags, source, "lastChecked", verified
) as (
  values
    (
      'Aleanca LGBT',
      'albania',
      'other',
      'Aleanca kunder Diskriminimit LGBT',
      'Use official website and social channels for current contact details.',
      'https://www.aleancalgbt.org/',
      'One of Albania''s key LGBTQ organizations, working on community support, advocacy, visibility, education and equality in Tirana and nationally.',
      'Office and programme availability vary; contact before visiting.',
      'https://www.aleancalgbt.org/',
      array[]::text[],
      'Tirana, Albania',
      41.327500,
      19.818900,
      '$',
      'LGBTQ advocacy, community support and Tirana Pride signal',
      array['service','social','cultural']::text[],
      'Aleanca LGBT official website',
      '2026-06-16'::date,
      true
    ),
    (
      'Streha LGBT',
      'albania',
      'other',
      'Streha',
      'Use official website and social channels for current contact details.',
      'https://strehalgbt.al/',
      'Streha is Albania''s LGBTQ shelter and support service, focused on safe housing, social support and protection for LGBTQ young people facing family or social exclusion.',
      'Shelter access and support are referral/contact based; do not visit without contacting first.',
      'https://strehalgbt.al/',
      array[]::text[],
      'Tirana, Albania',
      41.327500,
      19.818900,
      '$',
      'LGBTQ shelter, safety support and youth protection',
      array['service','relax','social']::text[],
      'Streha official website',
      '2026-06-16'::date,
      true
    ),
    (
      'Pro LGBT Albania',
      'albania',
      'other',
      'Pro LGBT',
      'Use official website and Historia Ime channels for current contact details.',
      'https://historia-ime.com/',
      'Pro LGBT is linked to Albania''s LGBTQ media and rights work through Historia Ime, useful for current community news, rights context, culture and visibility updates.',
      'Programme and media availability vary; verify current contact channels before visiting.',
      'https://historia-ime.com/',
      array[]::text[],
      'Tirana, Albania',
      41.327500,
      19.818900,
      '$',
      'LGBTQ media, rights updates and community visibility',
      array['service','cultural','social']::text[],
      'Historia Ime / Pro LGBT channels',
      '2026-06-16'::date,
      true
    ),
    (
      'Pink Embassy Albania',
      'albania',
      'other',
      'Pink Embassy',
      'Use official website and social channels for current contact details.',
      'https://www.pinkembassy.al/',
      'A Tirana-based LGBTQ rights organization connected with advocacy, public campaigns, community visibility and institutional equality work in Albania.',
      'Programme and office availability vary; contact before visiting.',
      'https://www.pinkembassy.al/',
      array[]::text[],
      'Tirana, Albania',
      41.327500,
      19.818900,
      '$',
      'LGBTQ rights advocacy, public campaigns and equality work',
      array['service','social','cultural']::text[],
      'Pink Embassy official website',
      '2026-06-16'::date,
      true
    )
),
updated as (
  update public.services s
  set
    type = ns.type,
    provider_name = ns.provider_name,
    contact = ns.contact,
    booking_link = ns.booking_link,
    description = ns.description,
    hours = ns.hours,
    link = ns.link,
    image_urls = ns.image_urls,
    location = ns.location,
    lat = ns.lat,
    lng = ns.lng,
    price_tier = ns.price_tier,
    vibe = ns.vibe,
    vibe_tags = ns.vibe_tags,
    source = ns.source,
    "lastChecked" = ns."lastChecked",
    verified = ns.verified
  from new_services ns
  where lower(trim(s.city)) = lower(trim(ns.city))
    and lower(trim(s.name)) = lower(trim(ns.name))
  returning s.id
)
insert into public.services (
  name, city, type, provider_name, contact, booking_link, description,
  hours, link, image_urls, location, lat, lng, price_tier, vibe,
  vibe_tags, source, "lastChecked", verified
)
select
  ns.name, ns.city, ns.type, ns.provider_name, ns.contact, ns.booking_link,
  ns.description, ns.hours, ns.link, ns.image_urls, ns.location, ns.lat,
  ns.lng, ns.price_tier, ns.vibe, ns.vibe_tags, ns.source,
  ns."lastChecked", ns.verified
from new_services ns
where not exists (
  select 1
  from public.services s
  where lower(trim(s.city)) = lower(trim(ns.city))
    and lower(trim(s.name)) = lower(trim(ns.name))
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
values (
  'Albania',
  'good',
  'risk',
  'mixed',
  'legal',
  'no_protection',
  'restricted',
  'full_coverage',
  'Same-sex relations are legal and anti-discrimination law covers sexual orientation and gender identity, but Albania has no same-sex marriage, partnership or family-law recognition. Tirana has visible Pride and community organizations, while everyday comfort and public visibility remain context-dependent.',
  'high',
  'https://rainbowmap.ilga-europe.org/',
  'https://www.equaldex.com/region/albania',
  'https://www.aleancalgbt.org/',
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

-- Remove accidental duplicate copies while retaining the oldest row for
-- each normalized Albania name.
with ranked as (
  select
    id,
    row_number() over (
      partition by lower(trim(city)), lower(trim(name))
      order by id
    ) as duplicate_rank
  from public.places
  where lower(trim(city)) = 'albania'
)
delete from public.places p
using ranked r
where p.id = r.id
  and r.duplicate_rank > 1;

with ranked as (
  select
    id,
    row_number() over (
      partition by lower(trim(city)), lower(trim(name))
      order by id
    ) as duplicate_rank
  from public.events
  where lower(trim(city)) = 'albania'
)
delete from public.events e
using ranked r
where e.id = r.id
  and r.duplicate_rank > 1;

with ranked as (
  select
    id,
    row_number() over (
      partition by lower(trim(city)), lower(trim(name))
      order by id
    ) as duplicate_rank
  from public.services
  where lower(trim(city)) = 'albania'
)
delete from public.services s
using ranked r
where s.id = r.id
  and r.duplicate_rank > 1;

commit;

select 'places' as category, count(*) as total
from public.places
where lower(trim(city)) = 'albania'

union all

select 'events', count(*)
from public.events
where lower(trim(city)) = 'albania'

union all

select 'services', count(*)
from public.services
where lower(trim(city)) = 'albania';
