-- Queer Atlas: Spain hotel batch 1
-- Bilbao, Seville, Mallorca, Malaga and Valencia: three hotels per destination.
-- Editorial and source check: 2026-08-23.
--
-- Inclusion language is deliberately evidence-based:
--   * "LGBTQ+-focused/friendly" only when stated by the hotel itself; or
--   * "Travel Gay Approved" when the current directory documents a working
--     relationship and an LGBTQ+-welcoming standard.
-- Coordinates were resolved from the exact official street address with the
-- app's Mapbox address workflow. Official registry/hotel GPS wins where noted.
-- Safe to run more than once; existing rows are updated by city + name.

begin;

alter table if exists public.places
  add column if not exists venue_intel jsonb not null default '{}'::jsonb;

with source_hotels as (
  select *
  from jsonb_to_recordset($hotels$
[
  {
    "name":"Axel Hotel Bilbao",
    "city":"bilbao",
    "description":"A four-star, adults-only hotel from the LGBTQIA+-focused Axel brand, set on the estuary at the edge of Bilbao's Old Town. The rooftop pool and bar add a social layer while the central address keeps Casco Viejo, Bilbao La Vieja and the main sights walkable.",
    "vibe":"LGBTQIA+-focused design stay with an estuary-facing social rooftop",
    "tags_csv":"social,luxury,mixed",
    "hours":"Hotel reception operates 24 hours; rooftop, pool, wellness and visitor access follow the hotel's current schedule.",
    "link":"https://www.axelhotels.com/en/axel-hotel-bilbao/hotel",
    "location":"Muelle de La Merced 3, 48003 Bilbao, Biscay, Spain",
    "lat":43.25690319,
    "lng":-2.92693766,
    "intel":{"queue_wait":"This is a normal hotel check-in rather than a nightlife door. Build extra time around Pride, summer weekends and major city events; rooftop capacity and guest access are managed separately from room check-in.","best_nights":"Choose this address when being close to both the Old Town and Bilbao La Vieja matters. Check the live rooftop programme before booking if its social atmosphere is central to the stay.","crowd_mix":"Axel describes itself as a hotel chain for the LGBTQIA+ community while welcoming allies. Expect queer couples, solo travellers, friends and a mixed adult city-break crowd.","dress_code":"There is no hotel-wide appearance code. Everyday city clothing works throughout; swimwear, gym and wellness areas have their own practical rules.","staff_inclusivity":"LGBTQIA+ inclusion is the property's core brand proposition rather than a directory inference. Axel's published house rules emphasise diversity, respect, freedom of expression and safety.","inclusion_basis":"LGBTQIA+-focused hotel: Axel Hotels official brand and property pages.","hotel_class":"4-star, adults only; Basque tourism registration HBI01331.","coordinate_source":"Basque tourism registry coordinates for Kaia/Muelle La Merced 3.","source_urls":["https://www.axelhotels.com/en/home","https://tourism.euskadi.eus/en/accomodation/axel-hotel-bilbao/webtur00-content/en/","https://www.euskadi.eus/ab63aAppWar/actividad/datos/HBI01331"],"research_status":"official_inclusion_plus_official_registry","updated_at":"2026-08-23T00:00:00Z"}
  },
  {
    "name":"The Artist Grand Hotel of Art",
    "city":"bilbao",
    "description":"A five-star design hotel directly opposite the Guggenheim, with an art-led interior, rooftop views, wellness facilities and a formal LGBTQ+ commitment in its corporate responsibility policy. This is the polished choice for travellers prioritising museums and high-service calm over an explicitly social gay-hotel scene.",
    "vibe":"art-led five-star calm with a documented LGBTQ+ equality commitment",
    "tags_csv":"luxury,cultural,relax",
    "hours":"Hotel reception operates 24 hours; rooftop, restaurant and wellness schedules should be checked with the hotel.",
    "link":"https://hoteltheartist.com/",
    "location":"Alameda de Mazarredo 61, 48009 Bilbao, Biscay, Spain",
    "lat":43.267514,
    "lng":-2.933798,
    "intel":{"queue_wait":"Arrival is concierge-led hotel check-in. Museum weekends, congresses and summer demand can make the lobby and rooftop busier, so share arrival time and accessibility needs before travel.","best_nights":"Best for a museum-centred Bilbao stay: the Guggenheim is opposite and the Fine Arts Museum is nearby. Reserve rooftop or dining experiences separately when they are a priority.","crowd_mix":"International art travellers, couples, business guests and luxury city-break visitors. It is LGBTQ+ friendly rather than an LGBTQ+-exclusive or nightlife-led property.","dress_code":"No identity or appearance code is published. Smart-casual clothing suits the restaurants and rooftop, while ordinary city wear is appropriate elsewhere.","staff_inclusivity":"The hotel's own equality programme explicitly says it is LGBTQ+ friendly, recognises trans people and commits to anti-discrimination principles and staff policy.","inclusion_basis":"Hotel-published LGBTQ+ equality and anti-discrimination policy.","hotel_class":"5-star; Basque tourism registration HBI01154.","coordinate_source":"Mapbox exact-address result checked against the official hotel and Basque tourism address.","source_urls":["https://hoteltheartist.com/sustainability/","https://hoteltheartist.com/es/5-estrellas-bilbao/","https://www.euskadi.eus/gobierno-vasco/-/es/alojamientos/the-artist-grand-hotel-of-arts/"],"research_status":"official_inclusion_plus_official_address","updated_at":"2026-08-23T00:00:00Z"}
  },
  {
    "name":"Petit Palace Arana",
    "city":"bilbao",
    "description":"A historic boutique hotel opposite Teatro Arriaga at the entrance to Bilbao's Seven Streets. Its central position gives quick walking access to Old Town dining and the wider queer circuit, while free bicycles, family-size rooms and 24-hour reception make it a flexible base.",
    "vibe":"historic Old Town base with easy access to Bilbao's queer circuit",
    "tags_csv":"cozy,cultural,mixed",
    "hours":"Reception is open 24 hours; check-in begins at 14:00 and check-out is by 12:00 according to the official hotel page.",
    "link":"https://www.petitpalace.com/en/petit-palace-arana/",
    "location":"Calle Bidebarrieta 2, 48005 Bilbao, Biscay, Spain",
    "lat":43.259093,
    "lng":-2.924633,
    "intel":{"queue_wait":"Standard 24-hour hotel reception, not a club door. Tell the hotel about late arrival, mobility needs or bicycle plans in advance; central festival weekends can produce a busier arrival window.","best_nights":"Useful when Old Town sightseeing and walking to central queer venues should share one route. The building is historic, so ask about room position and accessibility rather than assuming every room has the same layout.","crowd_mix":"Couples, families, solo visitors, pet travellers and international city-break guests. Travel Gay currently lists the property as Approved for LGBTQ+ customers; it is not an LGBTQ+-only hotel.","dress_code":"No dress code is published. Everyday city clothing is appropriate; respect the shared character of a compact historic hotel.","staff_inclusivity":"Current Travel Gay Approved status states that LGBTQ+ customers are accepted and that the property works with its team to provide a welcoming experience. The hotel itself presents broad, all-traveller hospitality.","inclusion_basis":"Current Travel Gay Approved listing, paired with the hotel's official operational information.","hotel_class":"Historic boutique hotel with 24-hour reception.","coordinate_source":"Mapbox exact-address result checked against the official hotel address.","source_urls":["https://www.travelgay.com/bilbao-gay-hotels","https://www.petitpalace.com/en/petit-palace-arana/location/"],"research_status":"current_lgbtq_directory_approval_plus_official_address","updated_at":"2026-08-23T00:00:00Z"}
  },
  {
    "name":"Hotel Casa Palacio Don Pedro",
    "city":"seville",
    "description":"A small hotel in a restored eighteenth-century palace house in Seville's historic centre. The property explicitly identifies as LGBTQ+ Friendly, and its 22 rooms, central patio and free round-the-clock coffee point offer an intimate alternative to a large chain stay.",
    "vibe":"small LGBTQ+-friendly palace-house stay in the historic centre",
    "tags_csv":"cozy,cultural,mixed",
    "hours":"Hotel accommodation with 24-hour coffee service; confirm current reception, check-in and check-out times directly.",
    "link":"https://www.hoteldonpedro.net/en/",
    "location":"Calle Gerona 24, 41003 Seville, Seville, Spain",
    "lat":37.393766,
    "lng":-5.988765,
    "intel":{"queue_wait":"A 22-room property normally uses a simple reception arrival. Share late-arrival details directly, especially during Semana Santa, Feria and Pride when central access and room turnover are under pressure.","best_nights":"Choose it for a quieter historic-centre base within walking distance of the Alameda and major sights. Event weeks require early booking; everyday stays suit travellers who prefer a small property over a scene hotel.","crowd_mix":"Couples, solo visitors, families and culture-led city-break guests. The hotel is explicitly LGBTQ+ friendly but not LGBTQ+-exclusive.","dress_code":"No dress code is published. Casual city clothing is appropriate; the heritage-house scale calls for normal respect around shared patios and corridors.","staff_inclusivity":"The hotel's own room and booking pages explicitly state that it is LGBTQ+ Friendly. This is direct first-party positioning, not inferred from neighbourhood alone.","inclusion_basis":"Hotel-published LGBTQ+ Friendly statement.","hotel_class":"2-star city hotel; registration H/SE01001; 22 rooms.","coordinate_source":"Mapbox exact-address result checked against the official hotel address.","source_urls":["https://www.hoteldonpedro.net/habitaciones.html","https://www.hoteldonpedro.net/en/"],"research_status":"official_inclusion_plus_official_address","updated_at":"2026-08-23T00:00:00Z"}
  },
  {
    "name":"Hotel Boutique Casas de Santa Cruz",
    "city":"seville",
    "description":"A compact Andalusian-style boutique hotel in the Santa Cruz quarter, two minutes from the cathedral, Alcázar and Giralda. The hotel's own website displays a Gay Friendly designation, while the rooftop terrace and old-city setting make it strongest for culture-first stays.",
    "vibe":"gay-friendly Andalusian boutique stay beneath the Giralda",
    "tags_csv":"cozy,cultural,mixed",
    "hours":"Hotel accommodation; confirm live reception, check-in, breakfast and rooftop access times with the property.",
    "link":"https://www.casasdesantacruz.com/en/",
    "location":"Calle Pimienta 4, 41004 Seville, Seville, Spain",
    "lat":37.384718,
    "lng":-5.990083,
    "intel":{"queue_wait":"This is a very small historic property rather than a large full-service lobby. Confirm arrival instructions and luggage handling before travel, particularly when traffic restrictions affect the Santa Cruz lanes.","best_nights":"Best for cathedral, Alcázar and old-quarter access rather than immediate proximity to the Alameda nightlife cluster. Book well ahead for major festivals and ask whether the terrace is operating for the stay dates.","crowd_mix":"International couples, solo cultural travellers and small leisure groups. The hotel is gay friendly rather than a dedicated queer social hotel.","dress_code":"No dress code is published. Light, practical city wear works; the historic lanes and stairs make comfortable footwear useful.","staff_inclusivity":"The official hotel website visibly labels the property Gay Friendly. No narrower audience restriction is published.","inclusion_basis":"Hotel-published Gay Friendly designation.","hotel_class":"Boutique hotel in a restored Andalusian house; registration H/SE/01097.","coordinate_source":"Mapbox exact-address result checked against the official hotel address.","source_urls":["https://www.casasdesantacruz.com/en/contact.html","https://www.casasdesantacruz.com/en/"],"research_status":"official_inclusion_plus_official_address","updated_at":"2026-08-23T00:00:00Z"}
  },
  {
    "name":"Sacristia de Santa Ana",
    "city":"seville",
    "description":"A 23-room boutique hotel inside an eighteenth-century building directly on Alameda de Hércules, the long-standing social heart of queer Seville. Its current Travel Gay Approved listing and doorstep access to bars and Pride activity make location the decisive strength.",
    "vibe":"historic Alameda boutique stay at the centre of queer Seville",
    "tags_csv":"social,cultural,mixed",
    "hours":"Hotel reception operates 24 hours according to the current hotel listing; confirm check-in, check-out and breakfast times directly.",
    "link":"https://www.hotelsacristia.com/EN/home.html",
    "location":"Alameda de Hércules 22, 41002 Seville, Seville, Spain",
    "lat":37.401002,
    "lng":-5.993899,
    "intel":{"queue_wait":"Standard hotel check-in, but Alameda nightlife and Pride can make the street outside much busier than the reception. Request a quieter room before arrival if sleep matters more than immediate social access.","best_nights":"Strongest when the Alameda's terraces, queer bars and public Pride programme are the priority. Weekends bring the most street energy; midweek better suits a calmer heritage stay.","crowd_mix":"Queer travellers, couples and general city visitors choosing Alameda access. Travel Gay lists it as Approved; the hotel remains open to a broad guest mix.","dress_code":"No hotel dress code is published. Everyday clothes and expressive night-out looks are both normal around Alameda; individual nightlife venues set their own rules.","staff_inclusivity":"Travel Gay's current Approved listing states that LGBTQ+ guests are accepted and welcomed. The city tourism guide independently identifies Alameda as Seville's queer social heart.","inclusion_basis":"Current Travel Gay Approved listing plus official city LGBTQ+ neighbourhood context.","hotel_class":"23-room historic boutique hotel.","coordinate_source":"Mapbox exact-address result checked against the hotel and directory address.","source_urls":["https://www.travelgay.com/gay-seville-hotels","https://www.hotelsacristia.com/EN/magnificent-location.html","https://visitasevilla.es/en/lgtbiq/"],"research_status":"current_lgbtq_directory_approval_plus_official_context","updated_at":"2026-08-23T00:00:00Z"}
  },
  {
    "name":"Iberostar Selection Playa de Palma",
    "city":"mallorca",
    "description":"A five-star beachfront resort at Playa de Palma with pools, spa, gym, restaurants and an adults-only Star Prestige rooftop area. Travel Gay currently marks the property Approved for LGBTQ+ guests; it suits travellers prioritising resort facilities and the beach over sleeping in central Palma.",
    "vibe":"LGBTQ+-welcoming beachfront luxury with full resort facilities",
    "tags_csv":"luxury,relax,mixed",
    "hours":"Reception and room service operate 24 hours; pools, rooftop, spa, restaurants and visitor access follow seasonal schedules.",
    "link":"https://www.iberostar.com/eu/hotels/majorca/iberostar-selection-playa-de-palma/",
    "location":"Carrer de Marbella 36, 07610 Palma, Balearic Islands, Spain",
    "lat":39.522676,
    "lng":2.738325,
    "intel":{"queue_wait":"A large resort with conventional hotel check-in. Peak beach season and group arrivals can slow the lobby; Star Prestige, spa and dining access may require separate reservations or eligible room categories.","best_nights":"Choose it for beach days and resort infrastructure. Central Palma's queer bars require transport, so it works best when nightlife is one part of the trip rather than the only priority.","crowd_mix":"International couples, adults, families and leisure groups across a broad resort audience. Travel Gay currently documents an LGBTQ+-welcoming standard; this is not a queer-exclusive hotel.","dress_code":"No identity-based code is published. Resort casual works by day; restaurants, rooftop and spa areas can apply their own clothing and access rules.","staff_inclusivity":"Travel Gay's current Approved listing states that the property works with its team and welcomes LGBTQ+ customers. Iberostar's official page provides the operational and address record.","inclusion_basis":"Current Travel Gay Approved listing, paired with official Iberostar property information.","hotel_class":"5-star beachfront resort; official registration H/2520.","coordinate_source":"Mapbox exact-address result checked against Iberostar's official address.","source_urls":["https://www.travelgay.com/gay-mallorca-hotels","https://www.iberostar.com/eu/hotels/majorca/iberostar-selection-playa-de-palma/"],"research_status":"current_lgbtq_directory_approval_plus_official_address","updated_at":"2026-08-23T00:00:00Z"}
  },
  {
    "name":"AC Hotel Ciutat de Palma",
    "city":"mallorca",
    "description":"A modern city hotel close to Santa Catalina, the marina and Palma's seafront. Travel Gay currently marks it Approved and highlights its practical access to gay-popular venues; the gym, restaurant and central position suit an urban stay more than a beach resort holiday.",
    "vibe":"LGBTQ+-welcoming city base between Santa Catalina and the marina",
    "tags_csv":"social,mixed,relax",
    "hours":"Hotel reception operates 24 hours; restaurant, gym and other facilities follow the current Marriott schedule.",
    "link":"https://www.marriott.com/en-us/hotels/pmiac-ac-hotel-ciutat-de-palma/overview/",
    "location":"Plaça del Pont 3, 07014 Palma, Balearic Islands, Spain",
    "lat":39.570394,
    "lng":2.633177,
    "intel":{"queue_wait":"Conventional hotel reception rather than a social-resort entrance. Let the hotel know about late arrival and confirm parking before driving into central Palma.","best_nights":"Useful for Santa Catalina dining, the marina and walking into central Palma. It is a better fit for city nightlife than Playa de Palma, while beaches still require a transfer.","crowd_mix":"Business travellers, couples, solo visitors and mixed international city-break guests. Travel Gay currently lists the hotel as Approved for LGBTQ+ customers.","dress_code":"No hotel-wide dress code is published. Smart-casual is useful for dining; normal city and leisure clothing works elsewhere.","staff_inclusivity":"Current Travel Gay Approved status documents LGBTQ+ acceptance and a welcoming standard. The hotel does not present itself as queer-exclusive.","inclusion_basis":"Current Travel Gay Approved listing, paired with official Marriott and Palma tourism information.","hotel_class":"Urban AC by Marriott hotel; 85 rooms in the official Palma meetings guide.","coordinate_source":"Mapbox exact-address result checked against official Palma tourism information.","source_urls":["https://www.travelgay.com/gay-mallorca-hotels","https://www.visit-palma.com/files/palma-urban-meetings.pdf","https://www.marriott.com/en-us/hotels/pmiac-ac-hotel-ciutat-de-palma/overview/"],"research_status":"current_lgbtq_directory_approval_plus_official_address","updated_at":"2026-08-23T00:00:00Z"}
  },
  {
    "name":"HM Jaime III",
    "city":"mallorca",
    "description":"A four-star urban boutique hotel on Passeig Mallorca, close to Santa Catalina, Es Baluard and central Palma. Travel Gay includes it among its current gay-friendly Mallorca choices, while the hotel's spa and terrace give the stay a relaxed city rhythm.",
    "vibe":"queer-popular Palma boutique stay with terrace and spa calm",
    "tags_csv":"relax,cultural,mixed",
    "hours":"Hotel accommodation; confirm current reception, check-in, terrace and spa schedules with HM Hotels.",
    "link":"https://www.hmhotels.com/en/hm-jaime-iii/",
    "location":"Paseo de Mallorca 14B, 07012 Palma, Balearic Islands, Spain",
    "lat":39.572983,
    "lng":2.642698,
    "intel":{"queue_wait":"Normal city-hotel check-in. Contact the property ahead for spa timing, late arrival, accessibility or parking because these are separate practical questions from room availability.","best_nights":"Best when Palma's old centre, Santa Catalina and museums should remain walkable. Event and high-summer dates sell differently from ordinary city weekends, so book those periods early.","crowd_mix":"Couples, solo travellers, business visitors and a mixed cosmopolitan audience. The property is queer-popular and directory-listed, not a dedicated LGBTQ+ hotel.","dress_code":"No dress code is published. Palma city casual works; use appropriate swimwear and footwear for spa and terrace areas.","staff_inclusivity":"Travel Gay currently includes HM Jaime III within its gay-friendly Mallorca hotel selection. HM's official pages verify the live property, address and facilities but do not claim an LGBTQ+-exclusive concept.","inclusion_basis":"Current specialist LGBTQ+ travel listing, with official hotel verification.","hotel_class":"4-star urban boutique hotel.","coordinate_source":"Mapbox exact-address result checked against the official HM Hotels contact page.","source_urls":["https://www.travelgay.com/gay-mallorca-hotels","https://www.hmhotels.com/en/hm-jaime-iii/contact-jaime-iii/","https://www.hmhotels.com/en/hm-jaime-iii/"],"research_status":"current_lgbtq_directory_listing_plus_official_address","updated_at":"2026-08-23T00:00:00Z"}
  },
  {
    "name":"ibis Malaga Centro Ciudad",
    "city":"malaga",
    "description":"A practical two-star hotel beside the Guadalmedina and a short walk from Málaga's historic centre. Travel Gay currently marks it Approved for LGBTQ+ customers; 24-hour snacks, accessible rooms and straightforward pricing make it the value-led option in this batch.",
    "vibe":"LGBTQ+-welcoming value stay within walking distance of central Málaga",
    "tags_csv":"social,mixed,cozy",
    "hours":"Reception and snacks operate 24 hours; official check-in is from 14:00 and check-out by 12:00.",
    "link":"https://all.accor.com/hotel/5585/index.en.shtml",
    "location":"Calle Cerrojo 1, 29007 Málaga, Málaga, Spain",
    "lat":36.720999,
    "lng":-4.42587,
    "intel":{"queue_wait":"Fast conventional hotel check-in, with the greatest pressure at standard afternoon arrival time. The official property supports 24-hour service, but share late arrival and accessibility needs before travel.","best_nights":"Choose it for budget, old-town walking access and simple logistics. It is not a scene hotel; use the central location as a base and check live queer venue schedules separately.","crowd_mix":"Budget travellers, couples, families, solo guests and short-stay visitors. Travel Gay currently documents an LGBTQ+-welcoming Approved standard.","dress_code":"No dress code is published. Everyday travel clothing is appropriate throughout the hotel.","staff_inclusivity":"Travel Gay's Approved listing states that LGBTQ+ customers are accepted and welcomed. Accor describes the hotel as open to everyone and provides accessible-room information.","inclusion_basis":"Current Travel Gay Approved listing plus Accor's all-traveller property statement.","hotel_class":"2-star city hotel; tourism registration H/MA/01981.","coordinate_source":"Official Accor GPS coordinates for the property.","source_urls":["https://stgp.travelgay.com/malaga-gay-hotels","https://all.accor.com/hotel/5585/index.en.shtml"],"research_status":"current_lgbtq_directory_approval_plus_official_gps","updated_at":"2026-08-23T00:00:00Z"}
  },
  {
    "name":"Hotel Molina Lario",
    "city":"malaga",
    "description":"A four-star superior hotel beside Málaga Cathedral and close to the port, with a rooftop pool and restaurant. Its current Travel Gay Approved status and very central position make it a polished base for walking to culture, dining and the city's compact queer nightlife.",
    "vibe":"LGBTQ+-welcoming cathedral-side stay with a polished rooftop",
    "tags_csv":"luxury,cultural,mixed",
    "hours":"Hotel reception operates 24 hours; rooftop pool, restaurant and terrace hours vary seasonally and should be checked directly.",
    "link":"https://www.hotelmolinalario.com/en/",
    "location":"Calle Molina Lario 20, 29015 Málaga, Málaga, Spain",
    "lat":36.719194,
    "lng":-4.420028,
    "intel":{"queue_wait":"Standard full-service hotel reception. Cathedral-area traffic, cruise arrivals and high-season weekends can make drop-off and the rooftop busier; confirm parking and rooftop access separately.","best_nights":"Best for travellers who want the cathedral, port, museums and central nightlife on foot. Reserve the rooftop or restaurant if it is a key part of the stay rather than assuming walk-in space.","crowd_mix":"International leisure travellers, couples, business guests and mixed city-break visitors. Travel Gay currently lists the hotel as Approved for LGBTQ+ customers.","dress_code":"No hotel-wide code is published. Smart-casual works for the restaurant and rooftop; ordinary city clothing is appropriate elsewhere.","staff_inclusivity":"Travel Gay's current Approved listing documents LGBTQ+ acceptance and a welcoming environment. The property itself operates as a broad-audience hotel, not an LGBTQ+-exclusive stay.","inclusion_basis":"Current Travel Gay Approved listing, paired with official and regional hotel records.","hotel_class":"4-star superior city hotel.","coordinate_source":"Mapbox exact-address result checked against the official/regional hotel address.","source_urls":["https://stgp.travelgay.com/malaga-gay-hotels","https://www.hotelmolinalario.com/en/","https://static.costadelsolmalaga.org/visita/subidas/archivos/6/7/arc_25376.pdf"],"research_status":"current_lgbtq_directory_approval_plus_official_address","updated_at":"2026-08-23T00:00:00Z"}
  },
  {
    "name":"AC Hotel Malaga Palacio",
    "city":"malaga",
    "description":"A four-star hotel between Málaga Cathedral and the port, known for its rooftop pool and city views. Beyond its current Travel Gay Approved status, the property hosted an official Málaga Pride 2026 discussion, giving it a concrete local inclusion signal rather than location alone.",
    "vibe":"central LGBTQ+-welcoming landmark with rooftop views and a Pride link",
    "tags_csv":"luxury,social,mixed",
    "hours":"Reception operates 24 hours; rooftop, pool, dining and event spaces follow current hotel schedules.",
    "link":"https://www.marriott.com/en-us/hotels/agpmg-ac-hotel-malaga-palacio/overview/",
    "location":"Calle Cortina del Muelle 1, 29015 Málaga, Málaga, Spain",
    "lat":36.719152,
    "lng":-4.41957,
    "intel":{"queue_wait":"Conventional 24-hour hotel reception. Central drop-off and rooftop demand can peak around cruise calls, conferences and summer evenings; dining and public events may use separate capacity controls.","best_nights":"Strong for port, cathedral and museum access, with central queer venues reachable on foot. Check both the rooftop calendar and Málaga's current Pride/cultural programme when choosing dates.","crowd_mix":"International couples, business guests, conference visitors and general city-break travellers, with LGBTQ+ guests documented through Travel Gay approval and Pride programming.","dress_code":"No hotel-wide dress code is published. Smart-casual suits rooftop dining and events; specific programmed functions may set their own guidance.","staff_inclusivity":"Travel Gay currently marks the property Approved, and Málaga City Council's 2026 Pride programme used the hotel for an LGBTQ+ public discussion. That is a stronger local signal than proximity alone.","inclusion_basis":"Current Travel Gay Approved listing plus documented hosting in Málaga's official Pride 2026 programme.","hotel_class":"4-star AC by Marriott hotel.","coordinate_source":"Mapbox exact-address result checked against Marriott and Málaga city records.","source_urls":["https://stgp.travelgay.com/malaga-gay-hotels","https://www.marriott.com/es/hotels/agpmg-ac-hotel-malaga-palacio/overview/","https://www.malaga.eu/el-ayuntamiento/notas-de-prensa/detalle-de-la-nota-de-prensa/index.html?id=178080"],"research_status":"directory_approval_plus_official_pride_programme","updated_at":"2026-08-23T00:00:00Z"}
  },
  {
    "name":"Axel Hotel Valencia",
    "city":"valencia",
    "description":"An adults-only hotel from the LGBTQIA+-focused Axel brand inside a seventeenth-century building in El Carmen. Its 72 rooms, rooftop and wellness club place a clearly queer hotel concept within walking distance of Valencia's old-town nightlife and cultural core.",
    "vibe":"LGBTQIA+-focused El Carmen stay with rooftop and wellness energy",
    "tags_csv":"social,luxury,mixed",
    "hours":"Gym operates 24 hours; sauna and jacuzzi are published as 09:00-21:00. Confirm reception, rooftop and seasonal schedules directly.",
    "link":"https://www.axelhotels.com/en/axel-hotel-valencia/hotel",
    "location":"Calle de Roteros 25, 46003 Valencia, Valencia, Spain",
    "lat":39.478965,
    "lng":-0.378136,
    "intel":{"queue_wait":"Hotel check-in is separate from rooftop or wellness capacity. Fallas, Pride, Gay Games and summer weekends can sharply increase demand, so reserve early and confirm any public-event access.","best_nights":"Best when El Carmen nightlife and old-town sightseeing should be walkable. Check the live rooftop programme and city event calendar rather than assuming every evening has the same social intensity.","crowd_mix":"Queer couples, solo travellers, friends and allies across a mixed adult audience. Axel positions the chain specifically for the LGBTQIA+ community while welcoming others.","dress_code":"No hotel-wide appearance code is published. Expressive looks and everyday city wear are both welcome; gym, sauna, jacuzzi and rooftop areas have practical rules.","staff_inclusivity":"The hotel belongs to Axel's LGBTQIA+-focused chain. Its official Valencia page publishes explicit rules around diversity, non-judgement, respect and safety.","inclusion_basis":"LGBTQIA+-focused hotel: Axel official brand and Valencia property pages.","hotel_class":"Adults-only boutique hotel; 72 rooms; tourism registration BV1043.","coordinate_source":"Mapbox exact-address result checked against Axel's official property page.","source_urls":["https://www.axelhotels.com/en/home","https://www.axelhotels.com/en/axel-hotel-valencia/hotel"],"research_status":"official_inclusion_plus_official_address","updated_at":"2026-08-23T00:00:00Z"}
  },
  {
    "name":"Venecia Plaza Centro",
    "city":"valencia",
    "description":"A central hotel directly on Plaça de l'Ajuntament, with simple rooms and immediate access to Xàtiva transport, the old town and city events. Travel Gay currently marks it Approved for LGBTQ+ guests; its strongest asset is straightforward location rather than a dedicated queer social programme.",
    "vibe":"LGBTQ+-welcoming central base overlooking Valencia's main square",
    "tags_csv":"cultural,mixed,cozy",
    "hours":"Hotel accommodation with reception service; confirm live check-in, check-out, breakfast and room-service times directly.",
    "link":"https://hotelvenecia.com/en/",
    "location":"Plaza del Ayuntamiento 3, 46002 Valencia, Valencia, Spain",
    "lat":39.469305,
    "lng":-0.37703,
    "intel":{"queue_wait":"Standard hotel arrival in one of Valencia's busiest central squares. Fallas and major civic events can alter vehicle access and make reception periods denser, so confirm the arrival route in advance.","best_nights":"Useful for a first visit, railway access and central event dates. It is not a scene hotel; use the transport position to reach both El Carmen and Ruzafa queer venues.","crowd_mix":"Solo visitors, couples, families and mixed short-stay city travellers. Travel Gay currently documents an LGBTQ+-welcoming Approved standard.","dress_code":"No dress code is published. Everyday city clothing is appropriate; the hotel has no identity-based door policy.","staff_inclusivity":"Travel Gay's current Approved listing states that LGBTQ+ customers are accepted and welcomed. The hotel's official page verifies the live property and central address.","inclusion_basis":"Current Travel Gay Approved listing, paired with the hotel's official operational record.","hotel_class":"Central city hotel with multiple room categories.","coordinate_source":"Mapbox exact-address result checked against the official hotel address.","source_urls":["https://www.travelgay.com/gay-valencia-hotels","https://hotelvenecia.com/es/motor/"],"research_status":"current_lgbtq_directory_approval_plus_official_address","updated_at":"2026-08-23T00:00:00Z"}
  },
  {
    "name":"Hospes Palau de la Mar",
    "city":"valencia",
    "description":"A five-star hotel in a nineteenth-century mansion beside the Turia Gardens, with spa, relaxation pool, restaurant and accessible facilities. Travel Gay currently marks it Approved for LGBTQ+ guests, making it the high-service, quiet-luxury option in Valencia's batch.",
    "vibe":"LGBTQ+-welcoming mansion stay with spa-led quiet luxury",
    "tags_csv":"luxury,relax,mixed",
    "hours":"Official check-in is 15:00 and check-out 12:00; reception, spa, restaurant and treatment times should be confirmed directly.",
    "link":"https://www.hospes.com/en/palau-mar/",
    "location":"Avenida de Navarro Reverter 14, 46004 Valencia, Valencia, Spain",
    "lat":39.470949,
    "lng":-0.366601,
    "intel":{"queue_wait":"Concierge-led hotel arrival rather than a nightlife entrance. Book treatments and restaurant tables separately, and share mobility needs before arrival because spa and heritage-building routes are distinct practical questions.","best_nights":"Best for a calm, high-service stay beside the Turia Gardens with central access. Choose another property if an explicitly queer social lobby is more important than spa and mansion atmosphere.","crowd_mix":"Luxury couples, international leisure guests, business visitors and a broad mixed audience. Travel Gay currently lists the hotel as Approved for LGBTQ+ customers.","dress_code":"No hotel-wide dress code is published. Smart-casual suits dining; spa, pool and treatment spaces apply their own practical clothing rules.","staff_inclusivity":"Travel Gay's current Approved listing documents LGBTQ+ acceptance and a welcoming standard. Official tourism information also documents mobility access, guide-dog access and written guest information.","inclusion_basis":"Current Travel Gay Approved listing, paired with official hotel and destination accessibility records.","hotel_class":"5-star; 66 rooms; regional registration CV H01214 V.","coordinate_source":"Mapbox exact-address result checked against Hospes and official Valencia tourism addresses.","source_urls":["https://www.travelgay.com/gay-valencia-hotels","https://www.hospes.com/en/palau-mar/valencia/","https://www.visitvalencia.com/en/valencia-accesible/hospes-palau-de-la-mar"],"research_status":"current_lgbtq_directory_approval_plus_official_accessibility","updated_at":"2026-08-23T00:00:00Z"}
  }
]
$hotels$) h(
    name text,
    city text,
    description text,
    vibe text,
    tags_csv text,
    hours text,
    link text,
    location text,
    lat double precision,
    lng double precision,
    intel jsonb
  )
), updated as (
  update public.places p
  set type = 'hotel',
      description = h.description,
      vibe = h.vibe,
      vibe_tags = string_to_array(h.tags_csv, ','),
      hours = h.hours,
      link = h.link,
      location = h.location,
      lat = h.lat,
      lng = h.lng,
      venue_intel = coalesce(p.venue_intel, '{}'::jsonb) || h.intel,
      seo_indexable = true,
      seo_quality_status = 'approved',
      updated_at = timezone('utc', now())
  from source_hotels h
  where lower(trim(p.city)) = h.city
    and lower(trim(p.name)) = lower(trim(h.name))
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
  lng,
  venue_intel,
  seo_indexable,
  seo_quality_status,
  updated_at
)
select
  h.name,
  h.city,
  'hotel',
  h.description,
  h.vibe,
  string_to_array(h.tags_csv, ','),
  h.hours,
  h.link,
  h.location,
  h.lat,
  h.lng,
  h.intel,
  true,
  'approved',
  timezone('utc', now())
from source_hotels h
where not exists (
  select 1
  from public.places p
  where lower(trim(p.city)) = h.city
    and lower(trim(p.name)) = lower(trim(h.name))
);

commit;

-- Expected result: exactly 3 researched hotel rows for every batch destination.
select
  city,
  count(*) filter (
    where type = 'hotel'
      and venue_intel->>'updated_at' = '2026-08-23T00:00:00Z'
  ) as batch_hotels,
  count(*) filter (
    where type = 'hotel'
      and venue_intel->>'updated_at' = '2026-08-23T00:00:00Z'
      and coalesce(venue_intel->>'queue_wait', '') <> ''
      and coalesce(venue_intel->>'best_nights', '') <> ''
      and coalesce(venue_intel->>'crowd_mix', '') <> ''
      and coalesce(venue_intel->>'dress_code', '') <> ''
      and coalesce(venue_intel->>'staff_inclusivity', '') <> ''
      and lat between -90 and 90
      and lng between -180 and 180
      and coalesce(location, '') <> ''
      and coalesce(link, '') <> ''
  ) as complete_rows
from public.places
where lower(trim(city)) in ('bilbao', 'seville', 'mallorca', 'malaga', 'valencia')
group by city
order by city;

select
  name,
  city,
  location,
  round(lat::numeric, 6) as lat,
  round(lng::numeric, 6) as lng,
  venue_intel->>'inclusion_basis' as inclusion_basis
from public.places
where type = 'hotel'
  and venue_intel->>'updated_at' = '2026-08-23T00:00:00Z'
order by city, name;
