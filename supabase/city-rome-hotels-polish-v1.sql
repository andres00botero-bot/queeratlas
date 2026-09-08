-- Queer Atlas: researched Rome hotel refresh.
-- Corrects the former Hotel Capo d'Africa after its 2025 relaunch, replaces
-- generic copy with property-specific intelligence and adds two useful stays.
-- Sources checked 2026-09-08. Idempotent; aliases prevent duplicate hotels.

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

with raw_hotels as (
  select * from jsonb_to_recordset($qa_rome_hotels$
[
  {
    "name":"1st & 2nd Floor – Hotel Colosseo",
    "aliases":"1st & 2nd Floor – Hotel Colosseo|1st & 2nd Floor - Hotel Colosseo|First Floor|First Floor Colosseo|Second Floor|B&B Second Floor",
    "city":"rome",
    "description":"A tiny, scene-connected stay directly on Rome's Gay Street, steps from the Colosseum. Its strongest feature is not a grand lobby but the address itself: Coming Out Bar & Restaurant operates at street level, so breakfast, aperitivo and queer nightlife sit inside the same compact orbit.",
    "vibe":"intimate gay hotel directly above Rome's Colosseum-side queer social strip",
    "tags":"social,cozy,cultural",
    "hours":"Hotel arrival by reservation; Coming Out Bar & Restaurant at the address operates daily 08:00–02:00.",
    "link":"https://www.1floor.it/",
    "location":"Via di San Giovanni in Laterano 10, 00184 Roma, Italy",
    "lat":41.889965,
    "lng":12.494495,
    "arrival":"Room inventory is small, so Pride and busy weekends warrant early booking. Confirm the exact floor, luggage handling and arrival time directly before travel.",
    "best":"Choose it when Gay Street is the centre of the trip: coffee or breakfast downstairs, Colosseum sightseeing by day and Coming Out's social terrace after dark.",
    "crowd":"Predominantly LGBTQ+ city-break guests, especially gay men and couples, mixed with international Colosseum visitors at the street-level bar.",
    "dress":"There is no hotel dress code. Rome streetwear works by day; guests often shift to relaxed night-out looks for Gay Street downstairs.",
    "inclusion":"The property directly presents itself as a gay hotel in the heart of Roman queer life; this is an explicit identity, not an inference from its neighbourhood.",
    "basis":"Current first-party gay-hotel positioning, current operating site and Turismo Roma address record.",
    "class":"Small gay-focused boutique hotel",
    "coords":"Turismo Roma exact-address coordinates for Via di San Giovanni in Laterano 10.",
    "sources":["https://www.1floor.it/","https://www.1floor.it/contatti/","https://www.turismoroma.it/en/hospitality/first-floor-colosseo"]
  },
  {
    "name":"Room Mate Collection Mia",
    "aliases":"Room Mate Collection Mia|Room Mate Mia|Mia Room Mate Collection|Hotel Capo d'Africa|Hotel Capo d’Africa|Capo d'Africa - Colosseo",
    "city":"rome",
    "description":"The former Hotel Capo d'Africa reopened as Room Mate Collection Mia with a sharper boutique identity: spacious contemporary rooms, high ceilings and an all-season roof terrace looking toward the Colosseum. Breakfast runs until noon, making this a polished slow-morning base within a short walk of Gay Street.",
    "vibe":"quiet contemporary design hotel with a year-round Colosseum-view roof terrace",
    "tags":"luxury,cultural,relax",
    "hours":"Concierge 24/7; rooftop breakfast 07:00–12:00; terrace open year-round with outdoor dinner service until 23:00.",
    "link":"https://room-matehotels.com/gb/hotel-mia-rome/",
    "location":"Via Capo d'Africa 54, 00184 Roma, Italy",
    "lat":41.888275,
    "lng":12.497651,
    "arrival":"The reception offers 24/7 concierge support. Reserve the limited-capacity terrace separately when dinner or a sunset table is important.",
    "best":"Best for travellers who want Gay Street and ancient Rome nearby but prefer a calm design hotel. Use the rooftop for a late breakfast or aperitivo before going out.",
    "crowd":"International couples, design-minded leisure guests and business travellers, with LGBTQ+ crossover from the Colosseum and Gay Street location.",
    "dress":"Contemporary hotel casual throughout; polished smart-casual feels natural for terrace dinner without becoming formal.",
    "inclusion":"Room Mate's current brand promise centres individuality and being yourself. The hotel does not publish a property-specific LGBTQ+ programme, so no queer ownership or specialist training is claimed.",
    "basis":"Current operator relaunch and service information, backed by the exact Turismo Roma address of the former property.",
    "class":"Four-star superior design hotel",
    "coords":"Turismo Roma exact-address coordinates retained through the verified 2025 rebrand.",
    "sources":["https://room-matehotels.com/gb/hotel-mia-rome/","https://room-matehotels.com/gb/discover-mia/","https://room-matehotels.com/gb/about-roommate/","https://www.turismoroma.it/en/hospitality/hotel-capo-dafrica"]
  },
  {
    "name":"Roma Luxus Hotel",
    "aliases":"Roma Luxus Hotel|Roma Luxus",
    "city":"rome",
    "description":"A cinematic five-star conversion inside an 18th-century former convent near the Forum, pairing vaulted historic bones with saturated contemporary rooms. Its private couples' spa, garden lounge and destination restaurant make it the most indulgent option here for a romantic stay rather than a nightlife-first weekend.",
    "vibe":"dramatic former-convent luxury with private spa rituals and Monti evenings",
    "tags":"luxury,cultural,relax",
    "hours":"Reception and room service 24 hours; check-in from 14:00 and check-out by 12:00; spa and dining require separate reservations.",
    "link":"https://www.romaluxushotel.com/en/homepage",
    "location":"Largo Angelicum 4, 00184 Roma, Italy",
    "lat":41.895833,
    "lng":12.487114,
    "arrival":"Book the private spa and restaurant independently from the room. The historic building has varied room layouts, so confirm the exact category and access route before arrival.",
    "best":"Best for an anniversary, design-led city break or a private spa pause after the Forum. Monti dining is close; Gay Street is better treated as a planned walk or short ride.",
    "crowd":"Upscale international couples, design travellers and special-occasion guests; queer visitors share a fully mainstream five-star environment.",
    "dress":"Expressive luxury-casual suits the hotel; the restaurant and evening garden lounge lean smart-casual without a published formal code.",
    "inclusion":"Current LGBTQ+ specialist coverage identifies the hotel as gay-friendly. The property does not publish queer ownership or a hotel-specific training standard, so those are not asserted.",
    "basis":"Current first-party property facts plus current LGBTQ+ specialist hotel coverage.",
    "class":"Five-star independent boutique hotel",
    "coords":"Turismo Roma exact-address point for Largo Angelicum 4, cross-checked against the official hotel address.",
    "sources":["https://www.romaluxushotel.com/en/homepage","https://www.romaluxushotel.com/en/history","https://www.travelgay.com/hotels/roma-luxus-hotel-rome"]
  },
  {
    "name":"The Fifteen Keys Hotel",
    "aliases":"The Fifteen Keys Hotel|Fifteen Keys Hotel|The Fifteen Keys",
    "city":"rome",
    "description":"A 15-room townhouse in Monti that feels residential rather than corporate: individually designed rooms, a leafy internal courtyard and local neighbourhood recommendations delivered by a 24-hour team. It is the quiet, design-conscious choice for travellers who want character and walkability without sleeping directly over the scene.",
    "vibe":"colourful 15-room Monti townhouse with courtyard calm and local-host energy",
    "tags":"cozy,cultural,relax",
    "hours":"Reception 24 hours; breakfast and bar service follow the hotel's daily schedule; bikes are subject to availability.",
    "link":"https://fifteenkeys.com/",
    "location":"Via Urbana 6/7, 00184 Roma, Italy",
    "lat":41.897696,
    "lng":12.495469,
    "arrival":"With only 15 rooms, desirable dates disappear quickly. Confirm late arrival and mobility needs directly; the entrance step and narrow lift deserve discussion before booking.",
    "best":"Best for slow Monti mornings, courtyard downtime and walking to both the Forum and neighbourhood restaurants. Gay Street remains close enough for a deliberate night out.",
    "crowd":"Independent-travel couples, design lovers and culture-led city breakers, with queer guests mixed naturally into a small international house.",
    "dress":"Unforced boutique casual; there is no scene or restaurant dress code inside the hotel.",
    "inclusion":"Current LGBTQ+ travel coverage recommends the hotel for queer visitors and its central location. No queer ownership or formal inclusion certification is claimed.",
    "basis":"Current official property details plus current LGBTQ+ specialist recommendation.",
    "class":"Independent 15-room boutique hotel",
    "coords":"Turismo Roma address points for Via Urbana 6 and 7, represented by their midpoint.",
    "sources":["https://fifteenkeys.com/","https://www.turismoroma.it/en/hospitality/fifteen-keys-hotel","https://www.travelgay.com/hotels/the-fifteen-keys-hotel-rome"]
  },
  {
    "name":"Hotel Artemide",
    "aliases":"Hotel Artemide|Artemide Hotel Rome|Artemide Roma",
    "city":"rome",
    "description":"A polished Via Nazionale hotel that earns its place through unusually complete downtime: the Ambrosia rooftop, a reservation-only spa and an art-filled historic interior, all within an easy walk of Termini and central monuments. Choose it when recovery and reliable full-service comfort matter as much as going out.",
    "vibe":"art-rich city hotel pairing rooftop dining with a calm reservation-only spa",
    "tags":"luxury,relax,cultural",
    "hours":"Reception 24 hours; Artemis Spa daily 11:00–20:00; Ambrosia rooftop restaurant daily 11:00–23:30 and bar 10:30–00:00, subject to capacity.",
    "link":"https://www.hotelartemide.it/",
    "location":"Via Nazionale 22, 00184 Roma, Italy",
    "lat":41.900828,
    "lng":12.493607,
    "arrival":"Reserve the spa's 90-minute sessions and rooftop dinner before arrival. Spa access is for guests aged 16+; confirm adapted-room details directly.",
    "best":"Best for a wellness-led city break: sightseeing by day, a timed spa session, then dinner above Via Nazionale. Gay Street requires a walk or short ride rather than being outside the door.",
    "crowd":"International leisure couples, wellness guests and cultural city breakers in a mainstream four-star setting, with LGBTQ+ travellers represented through specialist recommendations.",
    "dress":"Hotel casual by day; smart-casual works for Ambrosia. Spa attire and booking rules apply within the wellness area.",
    "inclusion":"Current LGBTQ+ specialist coverage recommends the property, but the hotel does not publish a queer-specific programme or ownership statement.",
    "basis":"Current official hotel, spa and rooftop schedules plus current LGBTQ+ specialist hotel coverage.",
    "class":"Four-star independent spa hotel",
    "coords":"Official address position for Via Nazionale 22, cross-checked with the existing Rome hotel dataset.",
    "sources":["https://www.hotelartemide.it/","https://www.hotelartemide.it/en/artemis-spa/","https://www.hotelartemide.it/en/ambrosia-rooftop-restaurant-bar/","https://www.travelgay.com/rome-gay-rated-hotels"]
  },
  {
    "name":"Hotel Santa Maria",
    "aliases":"Hotel Santa Maria|Santa Maria Hotel Roma|Santa Maria Trastevere",
    "city":"rome",
    "description":"Nineteen rooms arranged around an orange-tree garden inside a restored 17th-century cloister make this a genuine Trastevere refuge. Breakfast in the courtyard, free bikes and a guest bar create an intimate rhythm; the hotel also publishes one of Rome's clearest first-party promises of respectful LGBTQIA+ hospitality.",
    "vibe":"romantic orange-garden hideaway with explicit LGBTQIA+ welcome in Trastevere",
    "tags":"cozy,relax,cultural",
    "hours":"Reception 24 hours; breakfast daily 07:30–10:30; guest bar and courtyard services follow the hotel's current schedule.",
    "link":"https://www.hotelsantamariatrastevere.it/en/",
    "location":"Vicolo del Piede 2, 00153 Roma, Italy",
    "lat":41.890238,
    "lng":12.469998,
    "arrival":"Only 19 rooms surround the courtyard, so reserve early for Pride, anniversaries and spring weekends. Ask directly about the best accessible route and room configuration.",
    "best":"Best for couples and quieter stays centred on Trastevere's lanes, cafés and evening piazzas. Use the garden for breakfast or decompression rather than expecting an in-house party scene.",
    "crowd":"Queer couples and solo travellers mix with romantic city-break guests and repeat visitors who value personal, owner-present hospitality.",
    "dress":"Relaxed Roman neighbourhood clothing; the courtyard and guest bar are intimate rather than formal.",
    "inclusion":"The hotel explicitly promises a safe, respectful environment for LGBTQIA+ guests, hospitality without judgement and equal treatment for couples, families and solo travellers.",
    "basis":"Direct, current and property-specific LGBTQIA+ inclusion statement supported by official hotel and Turismo Roma records.",
    "class":"Independent 19-room three-star courtyard hotel",
    "coords":"Turismo Roma exact-address point for Vicolo del Piede 2.",
    "sources":["https://www.hotelsantamariatrastevere.it/en/lgbtq-friendly-hotel-rome.php","https://www.hotelsantamariatrastevere.it/en/","https://www.hotelsantamariatrastevere.it/en/services.php","https://www.turismoroma.it/en/hospitality/santa-maria-0"]
  },
  {
    "name":"Mercure Roma Centro Colosseo",
    "aliases":"Mercure Roma Centro Colosseo|Mercure Rome Colosseum Centre|Mercure Rome Center Colosseum|Mercure Roma Colosseo",
    "city":"rome",
    "description":"A practical four-star stay with one spectacular advantage: a seasonal rooftop pool and bar facing the Colosseum. Via Labicana places it close to Gay Street while retaining the predictable ease of a full-service hotel, making it especially useful for warm-weather visitors who want scene access and a real daytime reset.",
    "vibe":"scene-near full-service hotel with a summer rooftop pool above the Colosseum",
    "tags":"social,relax,mixed",
    "hours":"Reception 24 hours; check-in from 14:00 and check-out by 12:00; panoramic outdoor pool and RoofBar operate seasonally, normally May–September.",
    "link":"https://all.accor.com/hotel/2909/index.en.shtml",
    "location":"Via Labicana 144, 00184 Roma, Italy",
    "lat":41.890007,
    "lng":12.498120,
    "arrival":"Summer pool weather and major events increase demand; confirm the seasonal rooftop opening, parking and adapted-room configuration before booking.",
    "best":"Strongest from May to September when the rooftop pool is scheduled to operate. Year-round, it remains useful for walking to the Colosseum, Coming Out and Gay Street.",
    "crowd":"LGBTQ+ couples and solo travellers mix with families, international sightseers and ALL loyalty guests; the rooftop broadens the daytime social mix in summer.",
    "dress":"Poolwear on the seasonal roof and relaxed city clothing elsewhere; the bars are casual rather than club-coded.",
    "inclusion":"TravelGay currently marks the property as actively working with its team and providing a welcoming LGBTQ+ environment; Accor supplies the current hotel and accessibility details.",
    "basis":"Current LGBTQ+ specialist partnership claim paired with live first-party Accor property information.",
    "class":"Four-star full-service Accor hotel",
    "coords":"Exact GPS coordinates published by Accor for Via Labicana 144.",
    "sources":["https://all.accor.com/hotel/2909/index.en.shtml","https://www.travelgay.com/hotels/mercure-roma-centro-colosseo"]
  }
]
$qa_rome_hotels$) h(
    name text, aliases text, city text, description text, vibe text, tags text,
    hours text, link text, location text, lat double precision, lng double precision,
    arrival text, best text, crowd text, dress text, inclusion text, basis text,
    class text, coords text, sources jsonb
  )
), hotels as (
  select
    h.*,
    string_to_array(h.tags, ',')::text[] as approved_tags,
    jsonb_build_object(
      'record_status', 'verified_current_hotel',
      'queue_wait', h.arrival,
      'best_nights', h.best,
      'crowd_mix', h.crowd,
      'dress_code', h.dress,
      'staff_inclusivity', h.inclusion,
      'inclusion_basis', h.basis,
      'hotel_class', h.class,
      'coordinate_source', h.coords,
      'source_urls', h.sources,
      'research_status', 'current_first_party_property_and_lgbtq_relevance_sources',
      'updated_at', '2026-09-08T00:00:00Z'
    ) as intel
  from raw_hotels h
), updated as (
  update public.places p
  set
    name = h.name,
    type = 'hotel',
    description = h.description,
    vibe = h.vibe,
    vibe_tags = h.approved_tags,
    hours = h.hours,
    link = h.link,
    location = h.location,
    lat = h.lat,
    lng = h.lng,
    venue_intel = coalesce(p.venue_intel, '{}'::jsonb) || h.intel,
    seo_indexable = true,
    seo_quality_status = 'approved',
    updated_at = timezone('utc', now())
  from hotels h
  where lower(trim(p.city)) = h.city
    and lower(trim(p.name)) in (
      select lower(trim(alias_name))
      from unnest(string_to_array(h.aliases, '|')) alias_name
    )
  returning p.id
)
insert into public.places (
  name, city, type, description, vibe, vibe_tags, hours, link, location,
  lat, lng, venue_intel, seo_indexable, seo_quality_status, updated_at
)
select
  h.name, h.city, 'hotel', h.description, h.vibe, h.approved_tags, h.hours,
  h.link, h.location, h.lat, h.lng, h.intel, true, 'approved', timezone('utc', now())
from hotels h
where not exists (
  select 1
  from public.places p
  where lower(trim(p.city)) = h.city
    and lower(trim(p.name)) in (
      select lower(trim(alias_name))
      from unnest(string_to_array(h.aliases, '|')) alias_name
    )
);

select public.qa_refresh_city_seo_status('rome')
where to_regprocedure('public.qa_refresh_city_seo_status(text)') is not null;

commit;

select
  name, location, link, seo_quality_status,
  venue_intel->>'research_status' as research_status
from public.places
where lower(trim(city)) = 'rome' and type = 'hotel'
order by name;
