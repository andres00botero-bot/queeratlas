-- Queer Atlas venue intelligence: Berlin generic-copy repair.
-- Research rechecked 2026-08-29. Restores venue-specific operational guidance for
-- the 43 Berlin profiles overwritten by a later generic editorial batch.

begin;

with researched(id, profile) as (
  values
  (3, $qa${
  "queue_wait": "This is usually a bar arrival rather than a club-door ordeal. Sunday coffee and cake and warm-weather terrace hours create the real pinch points; the spacious main room absorbs the evening crowd well.",
  "best_nights": "Sunday afternoon is the signature visit, built around the long-running coffee-and-cake tradition. Friday and Saturday bring more bar-crawl energy, but Sunday shows the venue’s social character best.",
  "crowd_mix": "The centre of gravity is grown-up gay men, Schöneberg regulars and bear or leather-adjacent guests, with plenty of visiting men dropping in because of the location. Sunday is especially conversational.",
  "dress_code": "Everyday menswear, denim, leather and smart-casual bar clothes all fit. It is masculine without being a costume door, so comfort and confidence matter more than dressing for a theme.",
  "staff_inclusivity": "Prinzknecht is an established gay men’s bar whose official programme includes community Sundays and fetish-adjacent gatherings. Reviews commonly describe easy solo entry and sociable bartenders; service slows in the Sunday coffee-and-cake and weekend peaks.",
  "source_urls": [
    "https://www.prinzknecht-berlin.de/",
    "https://www.tripadvisor.com/Attraction_Review-g187323-d196260-Reviews-Prinzknecht-Berlin.html",
    "https://www.travelgay.com/venue/prinzknecht"
  ]
}$qa$::jsonb),
  (7, $qa${
  "queue_wait": "There is rarely a formal door line; the challenge is finding room once the bar fills. Thursday is repeatedly described as sardine-tight, with slower movement and service rather than a velvet-rope wait.",
  "best_nights": "Thursday is the famous crush and the strongest gay-bar night. Choose an earlier hour for conversation, or accept the shoulder-to-shoulder version if you want Möbel-Olfe at maximum Kreuzberg intensity.",
  "crowd_mix": "Kreuzberg regulars, queer locals and a hipster-leaning crowd mix with travelers who know the bar’s reputation. It feels local in attitude even when Thursday pulls a noticeable international contingent.",
  "dress_code": "The room is resolutely casual: denim, trainers, workwear and expressive everyday queer style make more sense than polished clubwear. There is no themed door to dress for.",
  "staff_inclusivity": "Möbel-Olfe has operated as an explicitly queer Kreuzberg bar since 2002 and its weekly programme centres a gay Thursday and FLINTA* Tuesday. The inclusion is built into who gets centred on those nights; packed-room service is direct and slower at peak.",
  "source_urls": [
    "https://www.moebel-olfe.de/",
    "https://unilocal.de/deutschland/berlin/mobel-olfe-60669"
  ]
}$qa$::jsonb),
  (8, $qa${
  "queue_wait": "Roses is tiny, so the pressure shows up inside more than in a managed queue. Late weekend arrivals can meet a packed, smoky room; quieter Sundays are repeatedly described as easier.",
  "best_nights": "Friday and Saturday deliver the loud, compressed late-night version. Sunday is the better choice for the décor, music and conversation without the same squeeze.",
  "crowd_mix": "A deliberately eclectic queer crowd mixes Kreuzberg locals with international visitors drawn by the pink-fur mythology. The room is intimate enough that one group can change the whole atmosphere.",
  "dress_code": "No formal code: casual Berlin black, vintage pieces, colour and camp all work against the maximalist interior. Dress for heat and smoke rather than for door approval.",
  "staff_inclusivity": "Reports are genuinely divided. Some guests remember friendly barmen and a playful welcome; others describe rude or aggressive exchanges, particularly around photos and house rules. Expect the tone to vary by shift.",
  "source_urls": [
    "https://www.instagram.com/roses.bar.berlin36.gaybar/",
    "https://wanderlog.com/place/details/1953063/roses",
    "https://www.travelgay.com/venue/roses"
  ]
}$qa$::jsonb),
  (27, $qa${
  "queue_wait": "Entry is handled at reception rather than a club door. The practical bottleneck is lockers and changing space during the busiest sessions, not a long outdoor line.",
  "best_nights": "Sunday afternoon into evening is the most consistently recommended busy window; Friday after work is another regular favourite. Weekday afternoons suit a calmer first visit.",
  "crowd_mix": "Gay and bisexual men across ages and body types share the facilities, with Berlin regulars and visitors both strongly represented. Reviews repeatedly note that the atmosphere is broader than a single body ideal.",
  "dress_code": "Street clothes go into the locker. Inside, the practical uniform is the venue towel and shower footwear; phones stay locked away, and using one in the facilities can end the visit immediately.",
  "staff_inclusivity": "BOILER explicitly welcomes trans men and genderqueer guests read at the door within its male-spectrum policy; entry is not based on anatomy or legal gender. Staff are trained on body diversity, provide free condoms and lubricant, and enforce consent and privacy rules.",
  "source_urls": [
    "https://boiler-berlin.de/",
    "https://www.tripadvisor.ca/Attraction_Review-g187323-d2477933-Reviews-Der_Boiler-Berlin.html",
    "https://www.reddit.com/r/askberliners/comments/1qkmnov/der_boiler/"
  ]
}$qa$::jsonb),
  (29, $qa${
  "queue_wait": "This bar is permanently closed, so there is no current queue or valid arrival advice. Its later Motzstraße address should not be used as a live nightlife destination. Keep the listing as queer-history context only and choose a currently operating fetish venue before setting out.",
  "best_nights": "There is no best night now. Historically, major leather weekends such as Easter Berlin and Folsom Europe made the bar a key meeting point, while the weekly policy shifted between all-gender and men-only sessions. Those old patterns must not be presented as a current calendar.",
  "crowd_mix": "Before closing, the room centred gay, bi and queer men with leather, rubber, sportswear and other fetish identities; some later nights welcomed all genders, while named sessions stayed men-only. That historical mix describes a former institution, not the people at the address today.",
  "dress_code": "The old dress code varied by event, from relaxed midweek entry to strict leather, rubber, uniform or sportswear nights. Because the business is closed, no historic outfit grants access anywhere now. Check the rules of the replacement venue or event you actually plan to attend.",
  "staff_inclusivity": "Past accounts describe both a valued leather-community anchor and a venue whose policy changed across its final years. There is no current staff team to assess and no responsible basis for carrying an old service rating forward. The honest community score is closed, not unreviewed.",
  "source_urls": [
    "https://berlin.gaycities.com/bars/2331-mutschmanns",
    "https://www.travelgay.com/venue/mutschmanns",
    "https://www.place2be.berlin/en/sexy-berlin/the-best-gay-fetish-bars-in-berlin/",
    "https://www.trustami.com/ervaring/mutschmanns-de-evaluatie",
    "https://www.companyhouse.de/Mutschmanns-GmbH-Berlin"
  ]
}$qa$::jsonb),
  (31, $qa${
  "queue_wait": "This is reservation-led spa entry, not nightlife queuing. Busy weekends can slow reception and locker access; pre-booking a timed admission is the safer plan than arriving speculatively.",
  "best_nights": "A weekday morning gives the calmest version of the complex. Weekend afternoons are livelier but also more crowded; this is a mainstream wellness visit, not a queer nightlife peak.",
  "crowd_mix": "The audience is a broad, mixed-gender wellness crowd of Berlin residents and tourists. Vabali is not an LGBTQ-specific sauna, and its popularity with queer guests should not be mistaken for a queer venue identity.",
  "dress_code": "The sauna and pool areas are textile-free. Bring a robe, towels and suitable sandals, then follow the house rules on seating towels, phones, photography and quiet zones.",
  "staff_inclusivity": "Vabali is a mixed-gender mainstream spa, not a queer venue. Staff actively enforce textile-free, no-camera, quiet-zone and minimal-affection rules; recent front-desk and complaint-handling reports are mixed, so couples should expect the same restrained conduct standard.",
  "source_urls": [
    "https://www.vabali.de/en/berlin/",
    "https://www.vabali.de/en/house-rules/",
    "https://www.trustpilot.com/review/vabali.de"
  ]
}$qa$::jsonb),
  (32, $qa${
  "queue_wait": "HAFEN normally works as a walk-in. The terrace and compact bar can become dense on warm evenings and event nights, but reviews describe crowd pressure rather than a formal door queue.",
  "best_nights": "The recurring quiz is the clearest community night; confirm its current weekday because older guides disagree. Summer terrace evenings and weekend parties show the bar at its busiest.",
  "crowd_mix": "Schöneberg regulars and gay men across a wide age range mix with visitors working through the Motzstraße circuit. The terrace feels especially local, while later parties broaden the room.",
  "dress_code": "Casual bar clothes are exactly right—denim, T-shirts, leather details or a smarter date-night layer all sit comfortably. There is no specialist door code.",
  "staff_inclusivity": "Many descriptions call the team relaxed or friendly, but review history also contains criticism of how a theft report was handled. The fairest reading is generally easygoing service with an important dissenting account.",
  "source_urls": [
    "https://hafen-berlin.de/",
    "https://www.travelgay.com/venue/hafen",
    "https://www.gayplaces.co/city/berlin/bar/hafen"
  ]
}$qa$::jsonb),
  (33, $qa${
  "queue_wait": "Blond is usually an easy walk-in, though the small interior gets tight after the evening crowd arrives. Outdoor tables absorb some of the pressure; expect slower drinks rather than a club-style line.",
  "best_nights": "Tuesday karaoke is the most consistently loved night and the easiest way into the room’s social rhythm. Other themed evenings work well, but Tuesday has the clearest repeat-review consensus.",
  "crowd_mix": "A mostly gay but mixed crowd spans younger guests, older regulars, Berlin locals and international visitors. Reviews repeatedly describe it as unusually easy for solo guests to start talking to people.",
  "dress_code": "Colourful casual clothes fit the retro cocktail setting; everyday Schöneberg barwear is enough. Dress for karaoke, terrace weather and a smoky room rather than for door selection.",
  "staff_inclusivity": "Friendly, attentive staff are one of Blond’s strongest and most repeated review themes, including positive accounts from older, international and neurodivergent visitors. A few service complaints exist, but they are not the dominant pattern.",
  "source_urls": [
    "https://www.blond.berlin/en/",
    "https://www.travelgay.com/venue/blond",
    "https://www.tripadvisor.co.uk/Restaurant_Review-g187323-d4746139-Reviews-Blond-Berlin.html",
    "https://berlin.gaycities.com/bars/1956-blond"
  ]
}$qa$::jsonb),
  (34, $qa${
  "queue_wait": "The pressure is mostly inside, not behind a formal club rope. Friday and Saturday can turn this little lounge shoulder-to-shoulder, so come earlier if you want a seat and actual conversation.",
  "best_nights": "Friday and Saturday give Heile Welt its fullest glow: cocktails, close conversation and a room that gets deliciously snug. Earlier evenings are better for the lounge; later is for the social crush.",
  "crowd_mix": "Schöneberg regulars anchor the room, joined by gay visitors working the Motzstraße circuit and a genuinely mixed queer-friendly crowd. It feels grown-up, sociable and more cocktail den than pickup factory.",
  "dress_code": "Polished casual is the natural fit—good denim, a sharp shirt, something quietly fabulous. There is no costume door; the room rewards personal style that still works in a compact, busy bar.",
  "staff_inclusivity": "Warm service is one of the clearest repeating themes: guests remember attentive bartenders, proper cocktail care and easy conversation. At peak hours that personal rhythm can slow, but the welcome reads consistently positive.",
  "source_urls": [
    "https://www.facebook.com/heileweltbar/",
    "https://berlin.gaycities.com/bars/1520-heile-welt?tag=mixed-gaystraight"
  ]
}$qa$::jsonb),
  (36, $qa${
  "queue_wait": "This tiny bar is more about claiming a favourite corner than surviving a door line. Come early for the generous happy-hour window; later, the compact room naturally shifts from quiet chat to a snug local buzz.",
  "best_nights": "Dreizehn works best as an early-evening slow burn: happy hour from 2–5 pm, then drinks and conversation without club theatrics. Pick it when the people matter more than a headline event.",
  "crowd_mix": "The mix changes with the hour, but the recurring character is local, varied and conversational. Regulars give it a family-bar feeling; visitors fit best when they arrive ready to talk rather than just tick off a gay-bar stop.",
  "dress_code": "Neighbourhood casual is exactly right—denim, trainers, a relaxed shirt, no performance required. The room is intimate and lived-in, so dressing like yourself lands better than bringing a full club look.",
  "staff_inclusivity": "The family-run warmth is central to the positive reviews. Guests describe a small place where relaxed service and actual conversation shape the night, with the welcome feeling personal rather than processed.",
  "source_urls": [
    "https://www.gayout.com/europe/germany/berlin/bars/dreizehn-1894"
  ]
}$qa$::jsonb),
  (37, $qa${
  "queue_wait": "K6 behaves like a neighbourhood bar, not a door-theatre club. The garden and karaoke can fill the place, but the practical squeeze is finding a good spot rather than losing hours in a line.",
  "best_nights": "Sunday karaoke is the sweetest K6 ritual: regulars, sing-alongs and zero need to play it cool. Saturday theme parties run livelier; choose Sunday for personality and Saturday for more party in the room.",
  "crowd_mix": "This is mature, local gay Berlin with a soft spot for regulars, silver foxes and solo drinkers who actually want to chat. Visitors are welcome, but the energy feels lived-in rather than tourist-staged.",
  "dress_code": "Keep it easy: jeans, trainers, a favourite shirt and enough comfort for the beer garden or a karaoke detour. Nothing in the room suggests a fashion test; unpretentious is part of the charm.",
  "staff_inclusivity": "Friendly, attentive bartenders are the review signature here. Guests repeatedly describe being drawn into conversation, remembered by the team and made comfortable even when arriving alone.",
  "source_urls": [
    "https://www.mann-o-meter.de/datenbank/bars-cafes/k6-bar",
    "http://k6-berlin.de/home.php",
    "https://wanderlog.com/place/details/2452415",
    "https://restaurantguru.com/K6-Berlin",
    "https://rainbowindex.com/venue/k6"
  ]
}$qa$::jsonb),
  (38, $qa${
  "queue_wait": "A formal line is not the Tramp’s story; reviews describe anything from a quiet room to an easy local buzz. The useful friction is practical instead: bring cash, then walk in and find your corner.",
  "best_nights": "Its superpower is the after-hours slot, when other plans are winding down and you still want one more drink. Go off-peak for conversation; let the late-night crowd provide the livelier version.",
  "crowd_mix": "Schöneberg locals and gay regulars form the backbone, with late-night visitors drifting in from nearby bars. It reads as a real local hangout—mixed in age, unshowy and better for chatting than posing.",
  "dress_code": "Come as you are. Everyday bar clothes, denim and trainers match the cosy, no-fuss room; there is no review pattern suggesting a themed look or selective fashion door.",
  "staff_inclusivity": "Friendly staff and clientele repeat across guest accounts, including visitors who appreciated being met in English. The welcome is casual and direct, with cash-only service being the more common practical complaint.",
  "source_urls": [
    "https://wanderlog.com/place/details/8810884/tramps"
  ]
}$qa$::jsonb),
  (40, $qa${
  "queue_wait": "Think café rhythm, not nightclub queue. Breakfast, cake and sunny terrace hours create the real pinch points, so arrive before the obvious brunch rush if choosing your table matters.",
  "best_nights": "The best Romeo und Romeo visit is often daylight: breakfast, coffee and cake with Motzstraße moving around you. Early evening works for a gentle first drink, but this place shines as a queer café before it does as nightlife.",
  "crowd_mix": "Gay neighbourhood regulars, couples, solo coffee drinkers and visitors share the tables. The location brings tourists, yet repeat local reviews and all-day use keep it from feeling like a scene-only stop.",
  "dress_code": "Café casual all the way—streetwear, workday clothes, brunch looks and a little terrace polish all belong. There is no threshold performance; dress for sitting comfortably and being seen on Motzstraße.",
  "staff_inclusivity": "The service picture is sharply mixed. Many guests describe kind, personable staff and a lovely host; others report rude or confrontational encounters with individual team members. Warmth is common, not guaranteed.",
  "source_urls": [
    "https://www.tripadvisor.co.uk/Restaurant_Review-g187323-d6999551-Reviews-Romeo_und_Romeo-Berlin.html",
    "https://wanderlog.com/de/place/details/1308514/romeo-und-romeo",
    "https://www.gayout.com/europe/germany/berlin/restaurants/romeo-and-romeo-2010"
  ]
}$qa$::jsonb),
  (41, $qa${
  "queue_wait": "Two dining rooms hold about 70 people, and the unreservable Boxhagener Platz terrace disappears quickly in good weather. Book online for up to eight; larger groups should call. Weekend lunch and dinner fill fastest, so walk-ins should arrive near the 1 pm opening or accept an indoor table.",
  "best_nights": "Dinner receives more consistent praise than the busy brunch-style weekend service. Friday and Saturday take last food orders later, at 10:30 pm; Sunday closes the kitchen at 9. Choose a warm terrace afternoon for neighbourhood theatre, or a weekday evening for calmer regional cooking.",
  "crowd_mix": "Friedrichshain residents, couples, families, arena visitors and tourists form a mainstream neighbourhood-restaurant crowd. The surrounding district is queer-friendly, but this is not a dedicated LGBTQ+ venue and there is no evidenced gay event night. Come for food and Boxi life, not community programming.",
  "dress_code": "Berlin restaurant casual is enough: trainers, denim, work clothes and relaxed date-night layers all fit. There is no fashion door. Dress for terrace weather and the walk from Warschauer Straße rather than nightlife performance; the room is rustic and comfortable, not formal.",
  "staff_inclusivity": "Regulars praise years of steady food quality and attentive, very kind service, including fresh 2026 accounts. Weekend brunch reviews are less reliable, with occasional slow or disappointing visits. Booking, stating dietary needs clearly and choosing dinner give the team the best chance to deliver.",
  "source_urls": [
    "https://www.kurhaus-korsakow.de/en/opening-hours-location",
    "https://www.kurhaus-korsakow.de/reservierung",
    "https://www.kurhaus-korsakow.de/fileadmin/user_upload/galerie/Speisekarte_Website_-_englisch.pdf",
    "https://www.tripadvisor.de/Restaurant_Review-g187323-d1776050-Reviews-Kurhaus_Korsakow-Berlin.html",
    "https://wanderlog.com/place/details/421009/kurhaus-korsakow",
    "https://www.gayout.com/he/europe/germany/berlin/restaurants/kurhaus-korsakow-3424"
  ]
}$qa$::jsonb),
  (42, $qa${
  "queue_wait": "The dining room is small and popular, so the practical queue is a missing reservation rather than a rope outside. Book for dinner, especially Friday, Saturday or a warm terrace evening. Same-day tables sometimes appear, but arriving at the 5 pm opening is the safer walk-in move.",
  "best_nights": "Friday and Saturday give Motzstraße its fullest see-and-be-seen energy and the kitchen runs later. A weekday dinner is better for lingering over schnitzel, wine and conversation. The terrace is the prize in warm weather; reserve indoors if the meal matters more than people-watching.",
  "crowd_mix": "Schöneberg locals, queer couples and groups, theatre-of-the-street regulars and international diners share a cosy Austrian restaurant. Its terrace sits on one of Berlin’s busiest gay streets, yet the clientele is mixed and food-led rather than an identity-restricted nightlife crowd.",
  "dress_code": "Casual dress is explicitly welcomed. Denim, trainers, summer shirts, dresses and easy date-night clothes all fit the intimate vintage rooms and terrace. There is no bouncer or fashion test; looking comfortable over a generous schnitzel matters more than performing Berlin club style.",
  "staff_inclusivity": "Recent diners repeatedly describe warm, attentive, multilingual service and patient help with the menu. Large schnitzels, crisp breading and the cosy room drive strong loyalty. Prices feel high to some and the tiny space can be busy, but hospitality is one of the clearest strengths.",
  "source_urls": [
    "https://www.sissi-berlin.de/",
    "https://www.opentable.com/sissi-osterreichisches-restaurant",
    "https://www.tripadvisor.com/Restaurant_Review-g187323-d1346418-Reviews-Sissi-Berlin.html",
    "https://wanderlog.com/place/details/1309273/sissi-restaurant",
    "https://www.falstaff.com/en/restaurants/sissi-berlin"
  ]
}$qa$::jsonb),
  (43, $qa${
  "queue_wait": "Nightlife entry is usually relaxed; Sunday brunch is the real timing game. In warm weather, guest reports recommend arriving around opening if you want a terrace table rather than a long hunt for space.",
  "best_nights": "Friday works when a named dance party lands; Sunday brunch shows the softer community side. Südblock changes shape across the week, so pick the programme—rock, karaoke, queer party or brunch—not a generic weekend rule.",
  "crowd_mix": "Kreuzberg locals lead the mix, with many queer women, trans guests and an international crowd sharing space with neighbours and friends. It is politically rooted, mixed and noticeably less male-only than much of gay Berlin.",
  "dress_code": "Everyday Kreuzberg style wins: relaxed layers, trainers, workwear, colour, whatever feels like you. The venue is socially expressive rather than fashion-policed; only a named event should change the brief.",
  "staff_inclusivity": "The community mission is clear, but service reviews are genuinely mixed. Some guests describe laughter and warmth; others report impatient or dismissive treatment. The space can feel safer than the service feels consistent.",
  "source_urls": [
    "https://www.suedblock.org/wp/kontakt-zu-uns/",
    "https://www.timeout.com/berlin/lgbt/suedblock",
    "https://www.ellgeebe.com/en/destinations/europe/germany/berlin/nightlife/sudblock",
    "https://unilocal.de/deutschland/berlin/sudblock-85581"
  ]
}$qa$::jsonb),
  (44, $qa${
  "queue_wait": "This is a large city hotel, so any wait is at reception, breakfast or the lifts rather than a club door. Check-in starts at 3 pm. Busy congress and family periods can concentrate arrivals; leaving bags early is more useful than timing a nightlife-style entrance.",
  "best_nights": "A weekend stay combines the zoo, Tiergarten and City West with easy access to Schöneberg nightlife. Weekdays attract more business travel. The big pool and spa are the reason to spend time inside, but recent reports of temporary faults make a same-day facilities check worthwhile.",
  "crowd_mix": "Business guests, conference delegates, couples, families and international city-break travellers create a broad mainstream crowd. The hotel is not queer-specific, even though its location works well for LGBTQ+ visitors. Expect polished anonymity rather than a resident community scene.",
  "dress_code": "No hotel-wide dress code is advertised. Casual clothes are normal at breakfast and the pool; smart casual works in the bar, while clubwear can pass through reception on the way out. Pack swimwear for the wellness area and follow the posted spa etiquette rather than assuming a queer sauna culture.",
  "staff_inclusivity": "Hotel Palace is a Pink Pillow Berlin Collection member. That signed charter commits its team to respectful treatment of LGBTQ+ guests, active community support and a secure, diverse workplace; recent hotel reviews also repeatedly praise breakfast and reception service.",
  "source_urls": [
    "https://all.accor.com/hotel/5347/index.en.shtml",
    "https://www.tripadvisor.com/Hotel_Review-g187323-d202450-Reviews-Pullmann_Berlin_Schweizerhof-Berlin.html",
    "https://www.booking.com/hotel/de/berlin-schweizerhof.html",
    "https://uk.hotels.com/ho186595/pullman-berlin-schweizerhof-berlin-germany/"
  ]
}$qa$::jsonb),
  (45, $qa${
  "queue_wait": "Expect a conventional large-hotel check-in, not a nightlife queue. The privately run property serves business groups as well as leisure guests, so reception and breakfast can feel busiest around conference departures. Booking ahead matters more than choosing a door time.",
  "best_nights": "Friday and Saturday make the City West location useful for shopping, theatre and nearby Schöneberg nightlife; a weekday stay is calmer and often better for business. The lobby and restaurants are hotel amenities, not a queer event programme, so choose dates around Berlin rather than an in-house party.",
  "crowd_mix": "International tourists, business travellers, conference groups, couples and families create a broad mainstream hotel crowd. The property is well placed for the western city and within reach of the Rainbow Kiez, but there is no reliable evidence that its guests skew local, queer or nightlife-led.",
  "dress_code": "There is no public hotel dress code. Everyday city clothes work at breakfast and reception, while smart casual feels natural in the lounge or dinner restaurant. Clubwear should not be a problem when returning to your room, but the shared lobby remains a mixed, all-ages space.",
  "staff_inclusivity": "Recent stays praise attentive breakfast service, helpful staff and a broad, high-quality buffet. The central location and well-equipped rooms are strong practical assets. Some feedback mentions heat or ageing details, so a specific room request may matter more than any concern about the welcome.",
  "source_urls": [
    "https://www.palace.de/en/welcome",
    "https://www.palace.de/en/restaurants-bars",
    "https://palace.de/ueber-uns",
    "https://www.tripadvisor.com/Hotel_Review-g187323-d199395-Reviews-Hotel_Palace_Berlin-Berlin.html",
    "https://www.booking.com/hotel/de/hotelpalace.en-gb.html"
  ]
}$qa$::jsonb),
  (46, $qa${
  "queue_wait": "Book and arrive under the current name, Dorint Kurfürstendamm Berlin; the Sofitel branding ended in 2020. Check-in is from 15:00 and reception is staffed 24 hours, with the main pressure around standard afternoon arrival rather than a venue queue.",
  "best_nights": "Stay Friday or Saturday for shopping, theatre and City West nightlife, or midweek for a quieter business base. The hotel bar is well reviewed but does not run a documented queer night. Its strongest evening feature is location, not a weekly party identity.",
  "crowd_mix": "International leisure guests, business travellers, couples and families fill a mainstream upscale hotel. Spacious rooms and the Ku’damm position appeal broadly. It can work well for LGBTQ+ visitors, but there is no evidence for a queer-majority crowd or a local-versus-tourist nightlife ratio.",
  "dress_code": "No general dress code is advertised. Casual travel clothes are normal at breakfast and reception, with smart casual a natural choice for the bar. Returning in nightlife clothes should be routine in Berlin, but this remains a shared hotel rather than a fetish or party property.",
  "staff_inclusivity": "Current guests regularly praise friendly, helpful staff, easy check-in, large rooms and a strong breakfast and bar. Criticism focuses on peak pricing and occasional room-equipment or housekeeping details. The service signal is warm, though it is general hospitality rather than queer-specific hosting.",
  "source_urls": [
    "https://www.dorint-blog.de/2020/10/27/dorint-kurfuerstendamm-berlin/",
    "https://hotel-berlin.dorint.com/",
    "https://hotel-berlin.dorint.com/de/bewertungen",
    "https://www.tripadvisor.com/Hotel_Review-g187323-d582479-Reviews-Dorint_Kurfurstendamm_Berlin-Berlin.html"
  ]
}$qa$::jsonb),
  (47, $qa${
  "queue_wait": "This is a 41-room boutique hotel, so the practical wait is reception at check-in rather than a door queue. Rooms can sell out around major Berlin weekends; reserve early and request a courtyard room if quiet matters. The public bar and concerts do not require a hotel booking.",
  "best_nights": "Choose a night with live piano, jazz, soul or funk if you want the hotel at its most social; the programme normally clusters from Wednesday into the weekend and admission is free. Concerts pause seasonally, so check the current calendar rather than relying on a fixed weekly ritual.",
  "crowd_mix": "Design-conscious international guests, couples and solo travellers share the building with Kreuzberg locals who come for dinner, drinks and music. It sits in a diverse queer-friendly neighbourhood, but it is a luxury boutique hotel with a mixed public, not an LGBTQ+-specific property.",
  "dress_code": "Easygoing polish suits the room: smart trainers, relaxed tailoring, dresses and good casual layers all feel at home. There is no evidenced formal code for guests or the free concerts. The atmosphere is grown-up and considered without asking Berliners to dress like a grand hotel.",
  "staff_inclusivity": "Hospitality is the standout. Verified 2026 stays repeatedly describe exceptionally kind, flexible and helpful staff, with a 9.8 service score. Breakfast and design also win love; the recurring cautions are premium pricing, small entry rooms and no spa rather than an unwelcoming team.",
  "source_urls": [
    "https://orania.berlin/concerts/",
    "https://orania.berlin/team",
    "https://www.booking.com/reviews/de/hotel/orania-berlin.en-gb.html",
    "https://www.booking.com/hotel/de/orania-berlin.en-gb.html",
    "https://www.tripadvisor.com/Hotel_Review-g187323-d12793309-Reviews-Orania_Berlin-Berlin.html"
  ]
}$qa$::jsonb),
  (48, $qa${
  "queue_wait": "There is no ticketed club line: you enter through the bar, buy a drink and gain access to the cruising area. Weekend traffic comes in waves and the compact room can turn busy quickly, but recent visits also report quiet Saturdays. Arrive without assuming a guaranteed peak.",
  "best_nights": "Friday and Saturday offer the best chance of a lively late crowd, while Tuesday gives under-30s a two-for-one drinks offer. The venue opens every day and works as an easy afternoon drink as well as a night stop. Energy can change sharply within an hour, so flexibility helps.",
  "crowd_mix": "Younger gay and bi men are the intended core, joined by local Schöneberg regulars and international visitors. The mood is more cruising bar than dance club: some come to play, others use the bar, table football or arcade while watching the room develop.",
  "dress_code": "No strict fetish code is published. Street clothes work at the bar, with underwear, swim briefs or nudity appearing as the evening becomes more sexual. Wear what lets you move confidently between social and cruising spaces, and keep the firm no-photo rule in mind.",
  "staff_inclusivity": "Boyberry is explicitly an adults-only gay cruising bar. Its staff enforce 18+ entry and a permanent ban for non-consensual photography; inclusion is specific to its young gay-male audience and should not be presented as an all-gender community policy.",
  "source_urls": [
    "https://boyberry.com/en/berlin/faqs/",
    "https://berlin.gaycities.com/bars/311710-boyberry-berlin",
    "https://whereis.gay/boyberry-berlin",
    "https://whereis.gay/listing/boyberry-berlin/",
    "https://qlist.app/venues/Berlin/Boyberry-Berlin/SERPeVNnNUQ4NzRKODFtOWQ2SExYQQ"
  ]
}$qa$::jsonb),
  (49, $qa${
  "queue_wait": "Ordinary evenings are easy walk-ins from 8 pm, but the little Kreuzberg room runs out of seats for drag cabaret and its popular karaoke contest. Ticketed shows advise punctual arrival, and high-demand karaoke encourages table reservations. Pride after-parties are the true squeeze.",
  "best_nights": "Follow the programme rather than a weekday formula. Drag cabaret gives the sharpest performance night, the recurring karaoke contest turns the audience into the show, and Pride or Eurovision editions carry the most Berlin-community energy. A blank-calendar evening works as a cosy late bar.",
  "crowd_mix": "Kreuzberg queer regulars, drag performers, karaoke loyalists and visitors from the nearby nightlife strip share a compact, mixed-gender room. Specific takeovers can centre FLINTA guests, while ordinary nights are broadly LGBTQ+ and friend-friendly rather than aimed only at gay men.",
  "dress_code": "There is no selective club uniform: denim, trainers, post-work clothes, drag glamour and full Pride colour all belong. Match the event if you want to participate, but the bar's living-room identity matters more than fashion. Some nights are cashless at the bar while artist donations may be cash.",
  "staff_inclusivity": "Warm staff, relaxed queer company and good drinks are recurring strengths, and the venue explicitly welcomes everyone. The clearest practical issue is scale, not hostility: packed shows can strain seating and service. Event-specific audience rules should still be respected when a takeover names its community.",
  "source_urls": [
    "https://www.rauschgold.berlin/",
    "https://www.rauschgold.berlin/veranstaltungen/",
    "https://rauschgold.berlin/events/la-cage-aux-holes/",
    "https://rauschgold.berlin/events/after-work-karaoke-20-00-0-00-uhr-duplicate-1-4/",
    "https://rauschgold.berlin/events/%F0%9F%92%98-l-rush-valentines-warm-up-edition-%F0%9F%92%98-20-00-uhr/",
    "https://wanderlog.com/place/details/2277913"
  ]
}$qa$::jsonb),
  (84, $qa${
  "queue_wait": "Reception works like a large hotel, not a club door; the real pressure is room inventory around Pride and fetish weekends. Early arrivals can leave bags. Check renovation notices before paying: the rooftop wellness area is officially out of service during current improvement works.",
  "best_nights": "A weekend stay puts Schöneberg bars at full energy and makes the hotel more social, while Sunday-to-Thursday suits sightseeing and quieter sleep. Do not choose dates solely for the famous spa atmosphere until reopening is confirmed; current construction changes a central part of the experience.",
  "crowd_mix": "International gay men, couples and solo travellers remain the visible core, with other LGBTQ+ guests and heterosexual allies also welcomed. It is more social and male-led than a generic city hotel, yet individual stays range from private sightseeing base to active guest-to-guest mingling.",
  "dress_code": "No clothing code applies in rooms or public hotel areas; polished city clothes, clubwear and casual breakfast looks are normal. If the wellness floor reopens, verify its current etiquette directly rather than relying on old stories about nudity or cruising. Hotel consent and privacy still apply everywhere.",
  "staff_inclusivity": "Friendly, chatty reception teams and thoughtful birthday care earn strong recent praise. The physical product is less consistent: reviews report dark or worn rooms, broken features and spa closures not disclosed early enough. Human hospitality often outperforms the maintenance standard.",
  "source_urls": [
    "https://www.axelhotels.com/en/axel-hotel-berlin/hotel",
    "https://www.tripadvisor.com/Hotel_Review-g187323-d1230204-Reviews-Axel_Hotel_Berlin-Berlin.html",
    "https://www.holidaycheck.de/hr/bewertungen-axel-hotel-berlin/7fd6a175-c99d-32e9-befa-692ffdd76edd",
    "https://www.reddit.com/r/askgaybros/comments/1qcuep7/axel_hotel_berlin_review/",
    "https://www.reddit.com/r/AskGaybrosOver30/comments/1fefkt0"
  ]
}$qa$::jsonb),
  (85, $qa${
  "queue_wait": "This intimate third-floor hotel has normal check-in rather than a public queue. Send your arrival time, especially if reaching Berlin late, and use the historic lift for luggage. Pride and major Schöneberg weekends are a room-availability problem, so book early rather than planning around lobby wait.",
  "best_nights": "Friday and Saturday put the surrounding Rainbow Kiez at its liveliest, with major gay bars downstairs and nearby; midweek offers the same walkability with quieter sleep. Breakfast runs until noon, a genuinely useful detail after Berlin nightlife. Choose dates by the city event calendar.",
  "crowd_mix": "Gay solo travellers and couples form the heart of the small hotel, joined by returning international guests and heterosexual visitors explicitly welcomed by the property. It feels personal and home-like rather than like a party resort, with neighbourhood knowledge as part of the stay.",
  "dress_code": "There is no hotel dress code: street clothes, nightlife gear and a slow breakfast look all coexist. The adjacent bar and club are separate businesses with their own atmosphere, so do not treat the stairwell as a continuation of the bedroom or assume hotel access overrides venue rules.",
  "staff_inclusivity": "Current reviews are exceptionally consistent: warm owners, friendly staff, queer comfort, useful local advice and a willingness to solve small problems. Guests also praise cleanliness and made-to-order breakfast. The old building and vintage lift add character, but accessibility deserves checking before booking.",
  "source_urls": [
    "https://www.arthotel-connection.de/",
    "https://www.tripadvisor.com/Hotel_Review-g187323-d196258-Reviews-ArtHotel_Connection-Berlin.html",
    "https://www.booking.com/reviews/de/hotel/arthotel-connection-gay.de.html",
    "https://www.booking.com/hotel/de/arthotel-connection-gay.en-gb.html",
    "https://wanderlog.com/place/details/2465848/arthotel-connection"
  ]
}$qa$::jsonb),
  (87, $qa${
  "queue_wait": "With 78 rooms and check-in from 3 pm, this is a compact hotel arrival rather than a venue door. Reception may bunch around standard arrival time, but there is no public evidence of meaningful queues. The useful tactic is to leave luggage and explore if your room is not ready.",
  "best_nights": "Friday and Saturday put the surrounding Schöneberg bars at their liveliest and make the quiet side-street base especially convenient. Midweek suits work and a calmer stay. There is no in-house queer night: the value is sleeping close to the scene, then choosing your own venue.",
  "crowd_mix": "Solo travellers, couples and business guests form a small international hotel crowd. Its Fuggerstraße position sits close to the historic gay district, yet the property itself is a mainstream three-star hotel. Do not expect a resident queer community or a social party-hotel atmosphere.",
  "dress_code": "Wear whatever works for Berlin: casual travel clothes at breakfast, workwear by day and nightlife gear when passing reception later. No guest dress policy is advertised. The bar and breakfast area are practical hotel spaces, so comfort and respectful shared-space behaviour are all that matter.",
  "staff_inclusivity": "Fresh verified stays call the hotel calm, clean, comfortable and well run, with its quiet central location doing much of the work. The current overall rating is solid rather than luxurious. Public evidence supports dependable service, but not a special LGBTQ+ programme or community-host role.",
  "source_urls": [
    "https://all.accor.com/hotel/9068/index.en.shtml",
    "https://all.accor.com/hotel/9068/index.de.shtml",
    "https://all.accor.com/hotel/9068/index.fr.shtml"
  ]
}$qa$::jsonb),
  (821, $qa${
  "queue_wait": "There is no queue or door: this is an unstaffed public cruising zone around Bremer Weg and the Lion Bridge, not a venue. Activity builds after dusk and can be weather-dependent. Never wait alone for a promised crowd; keep a clear route back to a lit path and tell someone where you are.",
  "best_nights": "Warm dry evenings bring the most movement, with later hours feeling more explicitly sexual. Daylight is calmer for learning the paths; darkness offers anonymity but raises navigation and robbery risk. After the July 2026 Pride attack near Tiergarten, follow current police guidance and avoid any restricted area.",
  "crowd_mix": "Mostly gay, bi and curious adult men—Berliners, commuters and visitors—circulate rather than settle into one social crowd. Ages and body types vary, and nobody can promise a local-to-tourist ratio in an anonymous park. Presence is not consent: interest should be reciprocal, readable and easy to withdraw.",
  "dress_code": "Ordinary weather-ready clothes and shoes with grip are smarter than a costume. Carry little, keep your phone and wallet secure, use protection and take anything you bring away again. Stay on routes you can identify, respect the public park and never photograph or expose another person without consent.",
  "staff_inclusivity": "There is no host, door team or awareness crew to protect you. The space’s queer history does not equal supervised safety, and past robbery reports matter. Go sober enough to choose, set boundaries clearly, leave with a trusted person when possible and call emergency services rather than confronting aggression.",
  "source_urls": [
    "https://dertiergarten.de/cruising-area/",
    "https://www.gaymapper.com/gay-cruising-spot/berlin/tiergarten",
    "https://gay-szene.net/tiergarten-in-berlin/11561/eintrag.html",
    "https://www.iwwit.de/wp-content/uploads/cruising-guide-IWWIT-2026.pdf",
    "https://apnews.com/article/8b3c8ded8033ab246cb55f7bd1c47e2f"
  ]
}$qa$::jsonb),
  (962, $qa${
  "queue_wait": "For the 21 August 2026 edition, doors run 8pm–9am at KitKatClub. Advance entry removes ticket uncertainty, not door judgment: the organiser reserves admission and checks the night’s strict fetish brief. Arrive close to opening for a calmer line; festival and Pride-adjacent editions draw much heavier traffic.",
  "best_nights": "Revolver is the night—it is a dated monthly-style party, not a daily venue. The August 2026 return to KitKat is the verified next reference point, with a full overnight arc. Choose it for muscular house, dancers and sexual energy; choose another queer party if you want a balanced-gender dance floor.",
  "crowd_mix": "The organiser intentionally builds a strongly male gay crowd: Berlin regulars, international circuit travellers, fetish guests and younger dance-floor energy. Women are admitted only in limited numbers and larger groups may be refused. That makes the audience clear, but it is not an all-genders queer default.",
  "dress_code": "The current ticket says strict fetish dress code. Harnesses, leather, rubber, fetish sportswear, underwear-led looks and deliberate body styling fit; ordinary night-out clothes may not. Build the outfit for this exact edition, travel covered if needed, and treat no-photo, consent and host-club rules as non-negotiable.",
  "staff_inclusivity": "The party promises a queer male space but openly limits women and leaves final admission to the door. Reviews split between euphoric nights and frustration after venue changes. Inclusion here means respect within a deliberately male-majority format, not universal access; judge the current host team separately.",
  "source_urls": [
    "https://shop.eventjet.at/de/43697f24-a94c-45cd-b186-a4bc9ab6786b/event/6089020f-7700-482b-b380-56c046658290",
    "https://revolverparty2024.live-website.com/about/",
    "https://t.me/s/kitkatberlin?before=894",
    "https://wanderlog.com/place/details/4706782/revolver-party-events-berlin",
    "https://wanderlog.com/place/details/453625/kitkatclub"
  ]
}$qa$::jsonb),
  (963, $qa${
  "queue_wait": "Do not assume the historic Sunday tea dance is running. Current queer guides still describe it, but the official 2026 ticket calendar shows many other events and no dated Café Fatal edition. Until the venue publishes a fresh ticket or programme entry, there is no honest queue, door time or admission price to give.",
  "best_nights": "Historically Sunday began with an hour of ballroom instruction, then standard, Latin, rock, pop and Schlager for gays, lesbians and friends. That format is distinctive, but not a current recommendation without a new date. Use the official calendar and choose another named queer event if it stays absent.",
  "crowd_mix": "The long-running concept brought gay men, lesbians, queer couples, straight friends, beginners and experienced ballroom dancers into one intergenerational room. There is no verified present-day crowd. Do not convert a beloved history dating to 1995 into a promise that the same community still meets this Sunday.",
  "dress_code": "The old format called for shoes you can turn in, breathable layers and a little Sunday sparkle—not fetishwear or techno camouflage. If a revival is announced, check floor rules and bring proper dance shoes if requested. For now, no outfit advice should imply that an unlisted event is operating.",
  "staff_inclusivity": "The concept has a strong inclusive legacy and its host remains an active queer and political cultural venue, but current staff practice for Café Fatal cannot be scored while no 2026 date is published. A revival should be reassessed for access, teaching language, partner rotation and door handling before endorsement.",
  "source_urls": [
    "https://www.so36.com/tickets",
    "https://www.so36.com/produkte",
    "https://www.travelgay.com/venue/cafe-fatal",
    "https://pinksider.com/en/berlin/clubs-bars/b786/cafe-fatal-so36/",
    "https://de.wikipedia.org/wiki/SO36"
  ]
}$qa$::jsonb),
  (964, $qa${
  "queue_wait": "The line changes radically by theme. A recent Saturday guest reported about 15 minutes, while a popular Thursday nude night meant roughly 50 minutes even before doors. Special weekends can be far longer. Read the exact programme, arrive before opening and keep the entrance instructions handy.",
  "best_nights": "Choose by fantasy, not by a generic “best” weekday: naked, sportswear, rubber and other fetish formats attract different men. Friday is usually the broadest dress-code entry; major SNAX editions are destination nights with much heavier demand. First-timers often find a regular night easier to read than a festival peak.",
  "crowd_mix": "This is an adult space centred on gay and bisexual men, from Berlin regulars to international fetish travellers. Busy nights can feel overwhelmingly male, white and body-conscious; several men describe electric freedom, while others—especially men of colour—report a cold in-group dynamic. Chemistry varies by edition.",
  "dress_code": "The event listing is law. Some nights require nudity, rubber, leather, uniform or exact sportswear; a regular Friday may be open dress. Do not improvise around a strict theme. Bring the minimum, protect your wristband and receipt, consider earplugs, and remember that eye contact and consent matter everywhere.",
  "staff_inclusivity": "Lab.oratory is a men-focused sex club with event-specific audience boundaries. Door staff check that guests understand the named party and its rules; privacy, consent and the advertised men-only scope are central, but this is not an all-LGBTQ+ venue.",
  "source_urls": [
    "https://www.lab-oratory.de/",
    "https://www.berghain.berlin/en/program/",
    "https://wanderlog.com/place/details/2129363/laboratory",
    "https://www.gayplaces.co/guides/what-snax-at-berghain-is-actually-like",
    "https://www.nighttours.com/berlin/gayguide/lab-oratory.html"
  ]
}$qa$::jsonb),
  (965, $qa${
  "queue_wait": "Entry depends on the specific party and its audience, not a generic club night. Published base charges run from €15–€28 plus a €7–€10 minimum bar spend; weekends vary. Bring cash only, read the gender icons and arrive within the listed window. The door checks whether you fit that night’s safer-space brief.",
  "best_nights": "Monday is naked men-only, Tuesday centres trans guests while remaining open to all, Wednesday rotates men’s themes, Thursday is mixed, and later-week events vary. Pick the exact sexual format you want, not merely the weekday. The programme matters more than DJ prestige; this is a play club with light electronic music.",
  "crowd_mix": "The calendar moves between gay men, trans guests, lesbians, straight and flexible visitors, mixed kink communities, newcomers and experienced players. Some nights exclude by design to protect a specific encounter. Read the icon as the kind of contact the event supports, not a simplistic label imposed on your identity.",
  "dress_code": "Street clothes go into the cloakroom; arrive in the announced fetish, naked or theme look, or bring it and change inside. Cash is essential. Free condoms, lubricant and gloves are available, and valuables can be left at the bar. Fantasy is welcome, but the individual event description outranks improvisation.",
  "staff_inclusivity": "Club Culture Houze publishes that its queer, trans, lesbian, gay and mixed team has an awareness role. Bartenders are named contacts, exclusionary or judgemental conduct is not tolerated, and trans men seeking MSM contact are explicitly included in gay-labelled events.",
  "source_urls": [
    "https://www.club-culture-houze.de/der-club/",
    "https://www.club-culture-houze.de/programm/",
    "https://www.club-culture-houze.de/preise/",
    "https://www.club-culture-houze.de/Veranstaltung/naked-together/",
    "https://www.gayout.com/europe/germany/berlin/bars/club-culture-houze-1954",
    "https://www.joyclub.de/club/veranstaltungen/1710896.club_culture_houze.html"
  ]
}$qa$::jsonb),
  (966, $qa${
  "queue_wait": "Current 2026 reports confirm the Urbanstraße bar still operates despite older lease rumours. Entry varies by event, with guests quoting roughly €10–€15; late nights can pack bar and basement. Check the same-day post, bring cash and arrive before the downstairs dance floor and darkroom fill.",
  "best_nights": "Follow the rotating theme or DJ. A busy Friday or Saturday gives the notorious upstairs-bar, downstairs-dance-and-cruise blend; a quieter weeknight is easier for a drink and looking around. Choose an audience that fits you, because the balance can swing from gay cruising to broadly mixed queer.",
  "crowd_mix": "Gay men remain central, joined by queer friends, sex-positive straight guests, locals, expats and tourists. Some enjoy the diversity; others resent straight spectators mocking queer people in the darkroom. It is no longer a sealed male enclave, and respect for cruising culture matters more than labels.",
  "dress_code": "No single fetish uniform applies every night. Dark streetwear, mesh, leather, underwear layers and solid dancing shoes all work, but read the theme before stripping down. Pack light, expect smoke and close quarters, protect valuables and never treat the darkroom as a spectacle. Consent outranks costume.",
  "staff_inclusivity": "Friendly bartenders and an open atmosphere still earn praise, including a returned lost wallet. Against that sit complaints about rude staff, dirt, ventilation and straight guests ridiculing queer play. The venue remains culturally queer, but staff must protect the darkroom from spectators more consistently.",
  "source_urls": [
    "https://wanderlog.com/place/details/2222549/ficken-3000",
    "https://qlist.app/venues/Berlin/FUCK-3000/eGE4UFVZSVcwZkMyYnJRTk1rNm0xZw",
    "https://www.gayplaces.co/city/berlin/bar/ficken-3000",
    "https://www.corner.inc/place/p6SADShR6Jvu",
    "https://speisekarte.menu/restaurants/berlin/ficken-3000/reviews",
    "https://www.reddit.com/r/AskGaybrosOver30/comments/1nf50bm/single_gay_american_i_know_i_know_were_cooked/"
  ]
}$qa$::jsonb),
  (1063, $qa${
  "queue_wait": "There is no longer a nightly Rollbergstraße queue. The fixed club closed on 1 November 2025; SchwuZ returned in May 2026 as a roaming event series. Its Metropol comeback sold out weeks ahead, so buy the exact event early and use only that ticket’s address, door time and accessibility details.",
  "best_nights": "Follow the new chapter event by event: drag, pop, queer club culture and community programming now move between host venues. The sold-out May comeback proved the appetite, but no weekday is automatically “SchwuZ night” anymore. Pick by lineup, host room and access information rather than the former club calendar.",
  "crowd_mix": "The name still gathers a broad, intergenerational LGBTQ+ crowd—drag lovers, pop dancers, activists, locals and visitors—with deep Berlin memory. Each borrowed venue will tilt that mix differently. Expect emotional reunion energy at headline editions, but never promise the old Rollberg crowd at a new address.",
  "dress_code": "Queer self-expression remains the cue: sequins, denim, drag, soft masc tailoring, camp merch or comfortable dancewear. There is no permanent-house uniform now. Check the named host’s bag, accessibility and door rules every time, because a look welcomed at one SchwuZ edition does not override another venue’s policy.",
  "staff_inclusivity": "SchwuZ remains an explicitly queer cultural organisation, but its 2026 programme uses changing host venues. Its own team and each host now share responsibility, so verify the event’s awareness contact, step-free route, toilets and door policy rather than relying on the former club building.",
  "source_urls": [
    "https://www.visitberlin.de/de/schwuz-berlin",
    "https://www.schwuz.de/",
    "https://www.berliner-zeitung.de/article/mit-viel-musik-tanz-und-grosser-party-startet-das-schwuz-in-eine-neue-zukunft-10036353",
    "https://www.berlin.de/en/clubs/8871999-4469452-schwuz.en.html"
  ]
}$qa$::jsonb),
  (1064, $qa${
  "queue_wait": "B:EAST is a monthly-scale ticketed rave rather than a walk-in bar. Current 2026 guides place it at Club Ost; buy the dated edition first and arrive near the published door because the large gay-and-friends crowd, security and cloakroom can compress after midnight.",
  "best_nights": "Choose the announced B:EAST edition at Club Ost: its working format is an overnight multisexual techno rave across two dance floors with an XXL play area. The line-up and exact ticket date matter more than a generic Saturday recommendation.",
  "crowd_mix": "LGBTQ+ techno ravers, gay men, queer women and open-minded friends share a younger, body-positive crowd. Unlike Revolver’s deliberately male-majority format, B:EAST is marketed as multisexual; the play area still requires consent-aware behaviour from every guest.",
  "dress_code": "Expressive ravewear, mesh, harnesses, sportswear and comfortable dance shoes fit the body-positive concept; no single uniform is published. Read the exact Club Ost ticket before travel because door, bag and play-space rules can change by edition.",
  "staff_inclusivity": "Revolver Events markets B:EAST specifically as a multisexual LGBTQ+ rave where the community and open friends celebrate together. That is direct audience-inclusion evidence; the event team and Club Ost security jointly control the door and play-space conduct.",
  "source_urls": [
    "https://pinksider.com/en/berlin/clubs-bars/b65/beast-party-berlin/",
    "https://www.misterbandb.com/gay-guide/germany/berlin/parties",
    "https://revolverparty.com/"
  ]
}$qa$::jsonb),
  (1099, $qa${
  "queue_wait": "This is a compact local pub, not a velvet-rope club. Early evening usually means immediate service; the room tightens when regulars gather, especially at weekends. There is no reliable minute-based queue pattern. If every stool is taken, patience and a friendly hello work better than hovering.",
  "best_nights": "Wednesday has historically carried the half-price-until-midnight pull, while Friday and Saturday bring the fuller bear-bar atmosphere. Go earlier for conversation and later for louder 1970s-to-now pop. Sunday is commonly listed closed, so confirm hours before travelling across Berlin for a quiet neighbourhood nightcap.",
  "crowd_mix": "Bears, cubs, otters, admirers and older gay regulars form the centre, with all ages and body sizes explicitly welcomed. The Prenzlauer Berg location keeps it more local and less tourist-saturated than Schöneberg. Visitors who enjoy conversation can fold in; this is a bar for people, not posing.",
  "dress_code": "Come comfortable and recognisably yourself: jeans, plaid, leather, a bear tee, workwear or ordinary street clothes all belong. There is no fetish mandate or beauty standard, and the room explicitly welcomes varied ages and sizes. Indoor smoke may matter more than style, so choose washable layers.",
  "staff_inclusivity": "Long-running accounts emphasise kind bartenders, cheap drinks, easy conversation and welcome across body types. Evidence is thinner than for tourist-heavy bars, so avoid turning warmth into perfection. Its strongest inclusion signal is a durable bear-community identity since 1999.",
  "source_urls": [
    "https://de.travelgay.com/berlin-gay-bars",
    "https://berlin.gaycities.com/bars/1472-b%C3%A4renh%C3%B6hle",
    "https://whereis.gay/barenhohle-2",
    "https://www.pankow-weissensee-prenzlauerberg.berlin/system/files/document/Pocket%20Guide%20Queeres%20Leben_ENG%20WEB.pdf"
  ]
}$qa$::jsonb),
  (1100, $qa${
  "queue_wait": "There is no current queue: the bar served its final night on 15 March 2026 after almost 70 years. Old maps and review pages may still show daily evening hours, but they are obsolete. Keep the address as queer history, not as a nightlife recommendation or a place to wait outside.",
  "best_nights": "No future night can be recommended. Tabasco was a dark, intimate gay meeting and cruising bar near Nollendorfplatz, known for late hours and an old-school Schöneberg rhythm. That atmosphere belongs in the archive now; choose an operating bar and verify its current programme before travelling.",
  "crowd_mix": "Historically it drew gay men across ages, neighbourhood regulars, visitors and attentive male company in a compact room. Reviews swung between affectionate welcome and discomfort or harassment. There is no present-day locals-to-tourists ratio because the business is permanently closed.",
  "dress_code": "Not applicable after closure. The former room favoured ordinary gay-bar clothes—jeans, leather, a fitted tee or whatever felt comfortable in a dark, close setting—rather than a formal fetish code. Do not use archived style advice as evidence that the Fuggerstraße door still opens.",
  "staff_inclusivity": "Past guests described both exceptionally warm bartenders and nights that felt unsafe or overly probing, so even the historical service record was mixed. No active team remains to rate. The honest inclusive action is to label the closure clearly and stop sending queer travellers to a dead pin.",
  "source_urls": [
    "https://www.queer.de/detail.php?article_id=57217",
    "https://www.tagesspiegel.de/berlin/bezirke/tempelhof-schoeneberg/tabasco-bar-schliesst-nach-fast-70-jahren-mietstreit-kostet-queere-institution-in-berlin-schoneberg-die-existenz-15393794.html",
    "https://www.tabascobar.de/",
    "https://wanderlog.com/place/details/5038863/tabasco"
  ]
}$qa$::jsonb),
  (1101, $qa${
  "queue_wait": "Early drinks usually mean quick service and the leafy terrace adds space in warm weather. Later, the compact smoking bar can tighten around karaoke or regulars, but current accounts do not support a long formal line. Go before 9 pm for a seat; expect smoke indoors once the outside becomes too cold.",
  "best_nights": "Karaoke is the social catalyst, while a summer evening on the tucked-away terrace gives the bar its gentlest charm. Visit late for one last Schöneberg drink or earlier if you want to meet the neighbourhood. It opens daily into the small hours, so the right night depends more on weather and event than weekday hype.",
  "crowd_mix": "Older gay men and Schöneberg regulars anchor the room, joined by couples, neighbours and visitors from the hotel opposite. The audience is more mature and conversational than a dance club, but not closed to younger guests or women. Local familiarity is visible without making every tourist feel like an intruder.",
  "dress_code": "Neighbourhood-bar comfort is enough: jeans, a polo, leather jacket, knitwear or everyday street clothes. Karaoke welcomes a little flourish, but there is no fetish or fashion demand. Choose washable layers if smoke bothers you and a warmer outer layer if the terrace is the only breathable seat on a cold night.",
  "staff_inclusivity": "Recent reports often praise trained, friendly staff and a living-room welcome for locals and city visitors. A smaller group describes rude service, especially toward non-German guests. The overall tone is warm but not flawless; basic German helps, and the terrace offers an easy reset if the indoor shift feels brusque.",
  "source_urls": [
    "https://www.tripadvisor.de/Attraction_Review-g187323-d5947257-Reviews-Der_Neue_Oldtimer-Berlin.html",
    "https://www.tripadvisor.com/Attraction_Review-g187323-d5947257-Reviews-Der_Neue_Oldtimer-Berlin.html",
    "https://www.travelgay.com/venue/der-neue-oldtimer",
    "https://oldergay.men/places/der-neue-oldtimer"
  ]
}$qa$::jsonb),
  (1102, $qa${
  "queue_wait": "This is a small Neukölln bar, so the pressure point is finding a perch rather than passing a door test. Before 9pm is kinder for conversation; event nights can fill the Weserstraße room fast. There is no dependable timed queue pattern. Check the programme and expect the smoking room to be busier than the entrance.",
  "best_nights": "Go for a named night—drag roulette, queer music bingo, performance or a Pride-month special—when the neighbourhood bar turns communal. A plain weekday is better for an unhurried drink and wall art. The 2026 programme is active, so let the event character choose your night rather than generic weekend hype.",
  "crowd_mix": "Queer and trans locals, femmes, non-binary guests, friends, artists and international Neukölln regulars make this broader than a traditional gay-men’s bar. Tourists arrive, but the room still reads neighbourhood-led. Music bingo and drag nights are especially easy entry points for newcomers.",
  "dress_code": "Wear your own version of Neukölln: vintage, soft butch, glitter, workwear, a political tee or ordinary jeans. There is no published door uniform. Layer for a warm small room and indoor smoke; the fixed ramp reaches the smoking room, but that access detail is more useful than any fashion instruction.",
  "staff_inclusivity": "Its long queer-feminist identity and current community programme are strong signals, and many guests describe a cosy, accepting room. Reviews are not unanimous about service or smoke. The venue publishes a fixed ramp to the smoking room; confirm the entrance and toilet route directly if step-free access is essential.",
  "source_urls": [
    "https://www.silverfuture.net/",
    "https://www.silverfuture.net/events-1/",
    "https://www.silverfuture.net/kontakt/",
    "https://wanderlog.com/place/details/2202814/silverfuture",
    "https://www.tripadvisor.com.au/Attraction_Review-g187323-d2559428-Reviews-Silver_Future-Berlin.html"
  ]
}$qa$::jsonb),
  (1103, $qa${
  "queue_wait": "This is a compact performance bar, so a show night fills from the stage outward rather than forming a famous club queue. Arrive before the act for a clear sightline and easier service; later arrivals may stand shoulder-to-shoulder and wait longer at the bar. Big pageants move to larger host venues.",
  "best_nights": "Weekend drag is the full sparkle; weekly karaoke turns the room into a communal singalong, while Tuesday bingo is a gentler way to meet people. The calendar changes constantly, so choose the performer or format that speaks to you. An ordinary early evening works best for a beer and actual conversation.",
  "crowd_mix": "Performers, trans and non-binary guests, queer women, gay men, expats, locals and visitors make this one of Berlin’s genuinely broad small rooms. The crowd follows each host, but newcomers are part of the culture rather than visual clutter. The name is playful; this is not a men-only bear bar.",
  "dress_code": "No published uniform: sequins beside sweatshirts, drag beside denim, soft masc tailoring beside a tourist’s clean tee. Dress for the event, heat and a room that may become standing-only. A playful detail lands well, but participation matters more than arriving in a fully produced look.",
  "staff_inclusivity": "The bar asks guests to report unsafe or disrespectful behaviour to staff, door or event hosts, and reviews describe a warm, safe community. Service slows when packed. The venue has also faced queerphobic threats outside, so stay aware on arrival without confusing an attack on the bar with its welcome inside.",
  "source_urls": [
    "https://tipsybearberlin.com/about",
    "https://www.tipsybearberlin.com/events",
    "https://tipsybearberlin.com/events-archive/tipsy-gay-tuesdays",
    "https://qlist.app/venues/Berlin/Tipsy-Bear/QlVOY2cwOXpDNU5NdkhTbmlmbXNFUQ",
    "https://www.the-berliner.com/events/tipsy-bear-pageant-berlin/",
    "https://www.tagesspiegel.de/berlin/mit-baseballschlager-gedroht-tipsy-bear-bar-in-berlin-abermals-queerfeindlich-angegriffen-13933639.html"
  ]
}$qa$::jsonb),
  (1104, $qa${
  "queue_wait": "This is a cocktail-led Mitte bar, not a notorious selector door. Weeknights are easier for a seat; Friday and Saturday can turn the compact room into a standing, dancing crowd. Arrive before 10pm for conversation, later for pulse. Current listings disagree slightly on opening time, so verify same-day.",
  "best_nights": "Friday and Saturday deliver the fullest version: accurate cocktails, driving beats and a room that often dances late. A midweek visit keeps the industrial-dark interior intimate and lets the bar craft show. It works as a polished first drink near Hackescher Markt or a stylish final stop after Museum Island.",
  "crowd_mix": "Gay men are prominent, joined by a visibly mixed LGBTQ+ crowd, straight friends, Mitte after-work guests and travellers. It is urban and queer without demanding one scene identity. The central address brings more visitors than a deep neighbourhood bar, while returning regulars and the bar team keep it personal.",
  "dress_code": "Aim casual but considered: black tailoring, a crisp tee, jewellery, leather accents or a sharp date-night look all suit the dark industrial room. There is no published door code and no need for techno cosplay. The bar rewards polish more than costume; comfortable shoes help once weekend DJ energy rises.",
  "staff_inclusivity": "Current editorial and guide coverage praises charming, warm service, accurate drinks and welcome across genders and orientations. Public reviews include older material and no venue is friction-free, but the recent professional consensus is unusually aligned: sophisticated without becoming icy or exclusionary.",
  "source_urls": [
    "https://www.thecovenberlin.com/",
    "https://www.top10berlin.de/location/coven-3989/",
    "https://www.falstaff.com/de/bars/the-coven",
    "https://www.tripadvisor.com.au/Attraction_Review-g187323-d12690245-Reviews-The_Coven_Bar-Berlin.html",
    "https://berlin.gaycities.com/bars/306114-thecoven"
  ]
}$qa$::jsonb),
  (1105, $qa${
  "queue_wait": "This is a roomy cocktail bar with reservable tables, not a hard-door club. Early evening should be straightforward; Friday and Saturday can tighten once the DJ and small dance floor take over. The official schedule is Thursday to Saturday only, so ignore directory pages promising drinks every night.",
  "best_nights": "Thursday suits a polished drink and conversation; Friday or Saturday brings the later, more dance-led version and stays open until 4am. Recent guests praise the cocktails, Georgian wine and attentive hosting. Pick a weekend night for movement, but book a table if your group wants a dependable base.",
  "crowd_mix": "A mixed queer room rather than a men-only bar: LGBTQ+ locals, international guests, dates and open-minded friends share the glossy Motzstraße space. The venue calls itself Berlin’s largest queer bar, while the small pool of recent reviews describes an easy blend of audiences rather than a tourist takeover.",
  "dress_code": "Smart-casual works beautifully here: a sharp shirt, polished streetwear, a little glamour or whatever makes cocktails feel like an occasion. There is no published fetish code. Dress for an elegant bar that may become a compact dance floor, and avoid carrying more than you want beside a crowded table.",
  "staff_inclusivity": "ILOsBAR explicitly operates as a queer bar for a mixed LGBTQ+ audience at Motzstraße 30. The small pool of current guest reports describes attentive hosting and a comfortable mixed room; that is promising venue-specific evidence, though not yet a large review consensus.",
  "source_urls": [
    "https://ilosbar.de/",
    "https://www.tripadvisor.co.uk/Restaurant_Review-g187323-d32638504-Reviews-Ilosbar-Berlin.html",
    "https://www.gayplaces.co/city/berlin/bar/ilosbar",
    "https://www.siegessaeule.de/termine/ilosbar/"
  ]
}$qa$::jsonb),
  (1106, $qa${
  "queue_wait": "The room is easy early and compressed late, especially when Thursday’s weekly show or a Pride special lands. There is no reliable minute count. Arrive near doors for breathing room and a locker; later, the bar and dance area can clog. Be aware that current reviews describe intrusive identity questions at the door.",
  "best_nights": "Thursday’s recurring camp TV-and-show ritual is the clearest current anchor; ticketed KLUM BUM and Pride specials bring the bigger theatrical version. Friday has long been the loose pop-dance night, but verify the live calendar. Come early for kitsch and conversation, late for glittery, smoky chaos.",
  "crowd_mix": "Drag artists, gay men, lesbians, bi and trans guests, straight friends, RAW-area night owls, Berlin regulars and tourists have historically mixed here. That breadth is part of the appeal, but 2026 door reports suggest some bisexual and straight-presenting guests are now challenged inconsistently.",
  "dress_code": "Camp beats polish: glitter, pop-star references, vintage chaos, jeans or an everyday queer look all fit the scruffy sofas and late dancing. No formal costume is published. Expect indoor smoke, heat and close contact; wear washable layers and shoes that survive a crowded floor rather than precious clubwear.",
  "staff_inclusivity": "Older accounts praise quick bartenders and staff stepping in against homophobia. Several detailed 2026 reviews, however, report biphobic questioning and rejection based on presumed sexuality. That is a material inclusion failure, not ordinary selectivity; the venue needs a written admission policy and retraining.",
  "source_urls": [
    "https://www.zumschmutzigenhobby.de/",
    "https://www.gaesteliste030.de/de/berlin/locations/bar-zum-schmutzigen-hobby",
    "https://unilocal.de/deutschland/berlin/zum-schmutzigen-hobby",
    "https://www.barconvent.com/berlin/en-gb/blog/barculture/7-queer-bar-tips-for-berlin.html",
    "https://kulturforumberlin.at/101/wp-content/uploads/2026/05/Kosmos_82.pdf"
  ]
}$qa$::jsonb),
  (1107, $qa${
  "queue_wait": "Do not head to Wühlischstraße expecting an open bar. One current specialist listing shows every day closed, while the readable profiles and reviews describe the 2019–20 launch rather than a 2026 operation. No recent official schedule or reopening notice was found, so there is no defensible current wait estimate.",
  "best_nights": "There is no verified active night. The former bar was built for relaxed conversation that could turn into a small DJ dance floor, with occasional art and mixed-queer events. Keep that history in the archive, but choose a venue with a dated current programme rather than relying on an old “weekend” recommendation.",
  "crowd_mix": "At launch, gay men, Turkish and migrant queer guests, alternative LGBTQ+ groups and friends were intentionally invited into a diverse Friedrichshain room. That ambition mattered, but it cannot describe a crowd today. An inactive or unverified listing has no locals-versus-tourists ratio to report.",
  "dress_code": "Not applicable while operation is unverified. The old mood was easy neighbourhood barwear—denim, tees, colour and whatever let you move if a DJ started—but no outfit turns an outdated listing into an open door. Any successor at the address needs a fresh identity and policy check.",
  "staff_inclusivity": "The founder explicitly wanted a broad welcome, including more Turkish gay men and lesbians, and early coverage praised unusually friendly staff. Those are valuable historical signals, not evidence about a 2026 team. Do not publish a current inclusion score until an operator, hours and staffed event are confirmed.",
  "source_urls": [
    "https://de.travelgay.com/venue/capture-bar",
    "https://www.the-berliner.com/politics/capture-bar/",
    "https://www.siegessaeule.de/magazin/4470-ich-w%C3%BCrde-mich-freuen-wenn-vermehrt-t%C3%BCrkische-schwule-und-lesben-vorbei-kommen/",
    "https://www.tagesspiegel.de/gesellschaft/queerspiegel/friedrichshain-hat-noch-queeres-potenzial-5024938.html",
    "https://pinksider.com/en/berlin/clubs-bars/b527/capture-bar/"
  ]
}$qa$::jsonb),
  (1108, $qa${
  "queue_wait": "The basement is tiny, so the practical wait is for bar space and a drink rather than a long formal queue. Arrive before midnight if you want a seat or a real conversation; weekend DJ nights compress quickly. Current reports are split between fast, affectionate service and visitors being passed over at the bar.",
  "best_nights": "Friday or Saturday gives the disco-ball version: DJs, packed bodies and a useful launch into a longer Mitte night. Choose a weekday for strawberry daiquiris and actual flirting across the room. This is best as a first or last stop, not an all-night mega-club; check the current event post before crossing town.",
  "crowd_mix": "Mitte queer regulars, gay men, mixed LGBTQ+ friend groups, expats and tourists fill a room small enough to change character with ten arrivals. It feels intimate and visibly queer, with more neighbourhood warmth than circuit scale. Visitors are common, though regulars can receive attention faster on a busy shift.",
  "dress_code": "There is no published gatekeeping uniform. Black denim, a tiny top, office clothes loosened after work, vintage sparkle or polished trainers all fit under the oversized disco ball. Dress for a close, warm basement and bring little baggage; individuality matters more than performing a standard Berlin-techno costume.",
  "staff_inclusivity": "Many 2026 guests call the team lovely, personal and genuinely welcoming, while one visitor of colour felt selectively ignored as others were served first. That specific account matters beside the praise. Most nights sound warm, but the service record is not universal; speak up or leave if the bar pattern feels wrong.",
  "source_urls": [
    "https://www.gayout.com/europe/germany/berlin/bars/betty-f-bar-1915",
    "https://wanderlog.com/place/details/2452281/betty-f-bar",
    "https://whereis.gay/listing/betty-f/",
    "https://www.theinfatuation.com/berlin/reviews/betty-f",
    "https://www.reddit.com/r/berlinsocialclub/comments/1rvzbb2/lgbtqia_bars/"
  ]
}$qa$::jsonb)
), prepared as (
  select id, profile
  || case
       when id in (29,1100) then jsonb_build_object('operating_status','permanently_closed')
       when id in (963,1107) then jsonb_build_object('operating_status','current_operation_unverified')
       when id=1063 then jsonb_build_object('operating_status','active_roaming_event_series')
       else jsonb_build_object('operating_status','active_verified_2026')
     end
  || jsonb_build_object(
    'topic_evidence', jsonb_build_object(
      'queue_wait', jsonb_build_object('status',case when jsonb_array_length(profile->'source_urls')>1 then 'multi_source_summary' else 'source_summary' end,'source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z'),
      'best_nights', jsonb_build_object('status',case when jsonb_array_length(profile->'source_urls')>1 then 'multi_source_summary' else 'source_summary' end,'source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z'),
      'crowd_mix', jsonb_build_object('status',case when jsonb_array_length(profile->'source_urls')>1 then 'multi_source_summary' else 'source_summary' end,'source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z'),
      'dress_code', jsonb_build_object('status',case when jsonb_array_length(profile->'source_urls')>1 then 'multi_source_summary' else 'source_summary' end,'source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z'),
      'staff_inclusivity', jsonb_build_object('status',case when jsonb_array_length(profile->'source_urls')>1 then 'multi_source_summary' else 'source_summary' end,'source_urls',profile->'source_urls','checked_at','2026-08-29T00:00:00Z')
    ),
    'research_status','venue_specific_sources_reviewed_2026_08_29',
    'updated_at','2026-08-29T00:00:00Z'
  ) as patch from researched
)
update public.places p
set venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||prepared.patch, updated_at=timezone('utc',now())
from prepared where p.id=prepared.id;

-- Current operational corrections discovered during the Berlin review.
update public.places set seo_indexable=false,seo_quality_status='rejected',updated_at=timezone('utc',now())
where id in (29,963,1100,1107); -- Mutschmann's/Tabasco closed; Café Fatal/Capture lack a verified 2026 operation.

update public.places set name='Dorint Kurfürstendamm Berlin',location='Augsburger Straße 41, 10789 Berlin, Germany',link='https://hotel-berlin.dorint.com/en/',updated_at=timezone('utc',now()) where id=46;
update public.places set location='Kleiststraße 6, 10787 Berlin, Germany',hours='Mon-Sat approximately 14:00/15:00-01:00; Sun 12:00-01:00; verify event changes.',link='https://www.mann-o-meter.de/datenbank/bars-cafes/k6-bar',updated_at=timezone('utc',now()) where id=37;
update public.places set link='https://www.suedblock.org/',updated_at=timezone('utc',now()) where id=43;
update public.places set location='Event-specific; KitKatClub and Club Ost are both used in 2026.',hours='Dated editions only; use the current ticket for doors and closing time.',updated_at=timezone('utc',now()) where id=962;
update public.places set location='Am Wriezener Bahnhof, 10243 Berlin, Germany',hours='Event-specific; use the named Lab.oratory programme entry and arrival window.',link='https://www.lab-oratory.de/',updated_at=timezone('utc',now()) where id=964;
update public.places set hours='Daily approximately 22:00-05:00; verify the same-day official post.',link='https://www.instagram.com/ficken3000official/',updated_at=timezone('utc',now()) where id=966;
update public.places set location='Various venues across Berlin; use the address on the individual event ticket.',hours='Event-specific; check the official SchwuZ calendar and host-venue rules.',seo_indexable=true,seo_quality_status='approved',updated_at=timezone('utc',now()) where id=1063;
update public.places set location='Club Ost, Alt-Stralau 1-2, 10245 Berlin, Germany; verify the exact edition.',hours='Monthly-scale ticketed editions; verify the current date and door time.',link='https://pinksider.com/en/berlin/clubs-bars/b65/beast-party-berlin/',updated_at=timezone('utc',now()) where id=1064;
update public.places set hours='Thu 19:00-02:00; Fri-Sat 19:00-04:00; Sun-Wed closed.',updated_at=timezone('utc',now()) where id=1105;

do $$
declare updated_count integer; overlong_fields integer; generic_duplicates integer;
begin
  select count(*) into updated_count from public.places where id in (3,7,8,27,29,31,32,33,34,36,37,38,40,41,42,43,44,45,46,47,48,49,84,85,87,821,962,963,964,965,966,1063,1064,1099,1100,1101,1102,1103,1104,1105,1106,1107,1108) and venue_intel->>'updated_at'='2026-08-29T00:00:00Z';
  if updated_count<>43 then raise exception 'Expected 43 repaired Berlin profiles, found %',updated_count; end if;
  select count(*) into overlong_fields from public.places p cross join lateral jsonb_each_text(jsonb_build_object('queue_wait',p.venue_intel->>'queue_wait','best_nights',p.venue_intel->>'best_nights','crowd_mix',p.venue_intel->>'crowd_mix','dress_code',p.venue_intel->>'dress_code','staff_inclusivity',p.venue_intel->>'staff_inclusivity')) f where p.id in (3,7,8,27,29,31,32,33,34,36,37,38,40,41,42,43,44,45,46,47,48,49,84,85,87,821,962,963,964,965,966,1063,1064,1099,1100,1101,1102,1103,1104,1105,1106,1107,1108) and length(f.value)>320;
  if overlong_fields<>0 then raise exception 'Expected all Berlin Venue Intelligence fields <=320 chars, found %',overlong_fields; end if;
  select count(*) into generic_duplicates from (select f.key,f.value,count(*) from public.places p cross join lateral jsonb_each_text(jsonb_build_object('queue_wait',p.venue_intel->>'queue_wait','best_nights',p.venue_intel->>'best_nights','crowd_mix',p.venue_intel->>'crowd_mix','dress_code',p.venue_intel->>'dress_code','staff_inclusivity',p.venue_intel->>'staff_inclusivity')) f where p.id in (3,7,8,27,29,31,32,33,34,36,37,38,40,41,42,43,44,45,46,47,48,49,84,85,87,821,962,963,964,965,966,1063,1064,1099,1100,1101,1102,1103,1104,1105,1106,1107,1108) group by f.key,f.value having count(*)>1) d;
  if generic_duplicates<>0 then raise exception 'Expected no exact duplicate Berlin intelligence fields, found %',generic_duplicates; end if;
end $$;

commit;
