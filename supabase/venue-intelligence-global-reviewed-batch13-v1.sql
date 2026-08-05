-- Queer Atlas venue intelligence: global review-led editorial pass, batch 13.
-- Berlin venues and accommodation records.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (48::bigint, jsonb_build_object(
      'queue_wait', 'There is no ticketed club line: you enter through the bar, buy a drink and gain access to the cruising area. Weekend traffic comes in waves and the compact room can turn busy quickly, but recent visits also report quiet Saturdays. Arrive without assuming a guaranteed peak.',
      'best_nights', 'Friday and Saturday offer the best chance of a lively late crowd, while Tuesday gives under-30s a two-for-one drinks offer. The venue opens every day and works as an easy afternoon drink as well as a night stop. Energy can change sharply within an hour, so flexibility helps.',
      'crowd_mix', 'Younger gay and bi men are the intended core, joined by local Schöneberg regulars and international visitors. The mood is more cruising bar than dance club: some come to play, others use the bar, table football or arcade while watching the room develop.',
      'dress_code', 'No strict fetish code is published. Street clothes work at the bar, with underwear, swim briefs or nudity appearing as the evening becomes more sexual. Wear what lets you move confidently between social and cruising spaces, and keep the firm no-photo rule in mind.',
      'staff_inclusivity', 'The public picture is mixed rather than glossy. Recent guests praise affordable drinks, a relaxed atmosphere and staff who looked after lost property; others describe a pushy first welcome or a distant room. The privacy policy is clear, and entry is strictly 18+.',
      'venue_classification', 'gay_male_cruising_bar',
      'source_urls', to_jsonb(array[
        'https://boyberry.com/en/berlin/faqs/',
        'https://berlin.gaycities.com/bars/311710-boyberry-berlin',
        'https://whereis.gay/boyberry-berlin',
        'https://whereis.gay/listing/boyberry-berlin/',
        'https://qlist.app/venues/Berlin/Boyberry-Berlin/SERPeVNnNUQ4NzRKODFtOWQ2SExYQQ'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://boyberry.com/en/berlin/faqs/','https://whereis.gay/boyberry-berlin','https://whereis.gay/listing/boyberry-berlin/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://boyberry.com/en/berlin/faqs/','https://whereis.gay/boyberry-berlin','https://berlin.gaycities.com/bars/311710-boyberry-berlin']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://boyberry.com/en/berlin/faqs/','https://berlin.gaycities.com/bars/311710-boyberry-berlin','https://qlist.app/venues/Berlin/Boyberry-Berlin/SERPeVNnNUQ4NzRKODFtOWQ2SExYQQ']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://boyberry.com/en/berlin/faqs/','https://berlin.gaycities.com/bars/311710-boyberry-berlin']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://whereis.gay/boyberry-berlin','https://whereis.gay/listing/boyberry-berlin/','https://boyberry.com/en/berlin/faqs/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (47::bigint, jsonb_build_object(
      'queue_wait', 'This is a 41-room boutique hotel, so the practical wait is reception at check-in rather than a door queue. Rooms can sell out around major Berlin weekends; reserve early and request a courtyard room if quiet matters. The public bar and concerts do not require a hotel booking.',
      'best_nights', 'Choose a night with live piano, jazz, soul or funk if you want the hotel at its most social; the programme normally clusters from Wednesday into the weekend and admission is free. Concerts pause seasonally, so check the current calendar rather than relying on a fixed weekly ritual.',
      'crowd_mix', 'Design-conscious international guests, couples and solo travellers share the building with Kreuzberg locals who come for dinner, drinks and music. It sits in a diverse queer-friendly neighbourhood, but it is a luxury boutique hotel with a mixed public, not an LGBTQ+-specific property.',
      'dress_code', 'Easygoing polish suits the room: smart trainers, relaxed tailoring, dresses and good casual layers all feel at home. There is no evidenced formal code for guests or the free concerts. The atmosphere is grown-up and considered without asking Berliners to dress like a grand hotel.',
      'staff_inclusivity', 'Hospitality is the standout. Verified 2026 stays repeatedly describe exceptionally kind, flexible and helpful staff, with a 9.8 service score. Breakfast and design also win love; the recurring cautions are premium pricing, small entry rooms and no spa rather than an unwelcoming team.',
      'venue_classification', 'mainstream_boutique_hotel_with_public_music_bar',
      'source_urls', to_jsonb(array[
        'https://orania.berlin/concerts/',
        'https://orania.berlin/team',
        'https://www.booking.com/reviews/de/hotel/orania-berlin.en-gb.html',
        'https://www.booking.com/hotel/de/orania-berlin.en-gb.html',
        'https://www.tripadvisor.com/Hotel_Review-g187323-d12793309-Reviews-Orania_Berlin-Berlin.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://orania.berlin/concerts/','https://www.booking.com/hotel/de/orania-berlin.en-gb.html','https://www.booking.com/reviews/de/hotel/orania-berlin.en-gb.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_schedule','source_urls',to_jsonb(array['https://orania.berlin/concerts/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://orania.berlin/concerts/','https://www.booking.com/reviews/de/hotel/orania-berlin.en-gb.html','https://www.tripadvisor.com/Hotel_Review-g187323-d12793309-Reviews-Orania_Berlin-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://orania.berlin/concerts/','https://www.booking.com/reviews/de/hotel/orania-berlin.en-gb.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.booking.com/reviews/de/hotel/orania-berlin.en-gb.html','https://www.tripadvisor.com/Hotel_Review-g187323-d12793309-Reviews-Orania_Berlin-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (45::bigint, jsonb_build_object(
      'queue_wait', 'Expect a conventional large-hotel check-in, not a nightlife queue. The privately run property serves business groups as well as leisure guests, so reception and breakfast can feel busiest around conference departures. Booking ahead matters more than choosing a door time.',
      'best_nights', 'Friday and Saturday make the City West location useful for shopping, theatre and nearby Schöneberg nightlife; a weekday stay is calmer and often better for business. The lobby and restaurants are hotel amenities, not a queer event programme, so choose dates around Berlin rather than an in-house party.',
      'crowd_mix', 'International tourists, business travellers, conference groups, couples and families create a broad mainstream hotel crowd. The property is well placed for the western city and within reach of the Rainbow Kiez, but there is no reliable evidence that its guests skew local, queer or nightlife-led.',
      'dress_code', 'There is no public hotel dress code. Everyday city clothes work at breakfast and reception, while smart casual feels natural in the lounge or dinner restaurant. Clubwear should not be a problem when returning to your room, but the shared lobby remains a mixed, all-ages space.',
      'staff_inclusivity', 'Recent stays praise attentive breakfast service, helpful staff and a broad, high-quality buffet. The central location and well-equipped rooms are strong practical assets. Some feedback mentions heat or ageing details, so a specific room request may matter more than any concern about the welcome.',
      'venue_classification', 'mainstream_business_and_leisure_hotel',
      'source_urls', to_jsonb(array[
        'https://www.palace.de/en/welcome',
        'https://www.palace.de/en/restaurants-bars',
        'https://palace.de/ueber-uns',
        'https://www.tripadvisor.com/Hotel_Review-g187323-d199395-Reviews-Hotel_Palace_Berlin-Berlin.html',
        'https://www.booking.com/hotel/de/hotelpalace.en-gb.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://www.palace.de/en/welcome','https://palace.de/ueber-uns','https://www.tripadvisor.com/Hotel_Review-g187323-d199395-Reviews-Hotel_Palace_Berlin-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://www.palace.de/en/welcome','https://www.palace.de/en/restaurants-bars']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://palace.de/ueber-uns','https://www.booking.com/hotel/de/hotelpalace.en-gb.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://www.palace.de/en/welcome','https://www.palace.de/en/restaurants-bars']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Hotel_Review-g187323-d199395-Reviews-Hotel_Palace_Berlin-Berlin.html','https://www.booking.com/hotel/de/hotelpalace.en-gb.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (87::bigint, jsonb_build_object(
      'queue_wait', 'With 78 rooms and check-in from 3 pm, this is a compact hotel arrival rather than a venue door. Reception may bunch around standard arrival time, but there is no public evidence of meaningful queues. The useful tactic is to leave luggage and explore if your room is not ready.',
      'best_nights', 'Friday and Saturday put the surrounding Schöneberg bars at their liveliest and make the quiet side-street base especially convenient. Midweek suits work and a calmer stay. There is no in-house queer night: the value is sleeping close to the scene, then choosing your own venue.',
      'crowd_mix', 'Solo travellers, couples and business guests form a small international hotel crowd. Its Fuggerstraße position sits close to the historic gay district, yet the property itself is a mainstream three-star hotel. Do not expect a resident queer community or a social party-hotel atmosphere.',
      'dress_code', 'Wear whatever works for Berlin: casual travel clothes at breakfast, workwear by day and nightlife gear when passing reception later. No guest dress policy is advertised. The bar and breakfast area are practical hotel spaces, so comfort and respectful shared-space behaviour are all that matter.',
      'staff_inclusivity', 'Fresh verified stays call the hotel calm, clean, comfortable and well run, with its quiet central location doing much of the work. The current overall rating is solid rather than luxurious. Public evidence supports dependable service, but not a special LGBTQ+ programme or community-host role.',
      'venue_classification', 'mainstream_hotel_near_queer_district',
      'source_urls', to_jsonb(array[
        'https://all.accor.com/hotel/9068/index.en.shtml',
        'https://all.accor.com/hotel/9068/index.de.shtml',
        'https://all.accor.com/hotel/9068/index.fr.shtml'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://all.accor.com/hotel/9068/index.en.shtml']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://all.accor.com/hotel/9068/index.en.shtml','https://all.accor.com/hotel/9068/index.de.shtml']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://all.accor.com/hotel/9068/index.en.shtml','https://all.accor.com/hotel/9068/index.fr.shtml']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://all.accor.com/hotel/9068/index.en.shtml']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','verified_guest_reviews','source_urls',to_jsonb(array['https://all.accor.com/hotel/9068/index.en.shtml','https://all.accor.com/hotel/9068/index.de.shtml']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (29::bigint, jsonb_build_object(
      'queue_wait', 'This bar is permanently closed, so there is no current queue or valid arrival advice. Its later Motzstraße address should not be used as a live nightlife destination. Keep the listing as queer-history context only and choose a currently operating fetish venue before setting out.',
      'best_nights', 'There is no best night now. Historically, major leather weekends such as Easter Berlin and Folsom Europe made the bar a key meeting point, while the weekly policy shifted between all-gender and men-only sessions. Those old patterns must not be presented as a current calendar.',
      'crowd_mix', 'Before closing, the room centred gay, bi and queer men with leather, rubber, sportswear and other fetish identities; some later nights welcomed all genders, while named sessions stayed men-only. That historical mix describes a former institution, not the people at the address today.',
      'dress_code', 'The old dress code varied by event, from relaxed midweek entry to strict leather, rubber, uniform or sportswear nights. Because the business is closed, no historic outfit grants access anywhere now. Check the rules of the replacement venue or event you actually plan to attend.',
      'staff_inclusivity', 'Past accounts describe both a valued leather-community anchor and a venue whose policy changed across its final years. There is no current staff team to assess and no responsible basis for carrying an old service rating forward. The honest community score is closed, not unreviewed.',
      'operating_status', 'permanently_closed',
      'venue_classification', 'closed_historic_gay_fetish_bar',
      'source_urls', to_jsonb(array[
        'https://berlin.gaycities.com/bars/2331-mutschmanns',
        'https://www.travelgay.com/venue/mutschmanns',
        'https://www.place2be.berlin/en/sexy-berlin/the-best-gay-fetish-bars-in-berlin/',
        'https://www.trustami.com/ervaring/mutschmanns-de-evaluatie',
        'https://www.companyhouse.de/Mutschmanns-GmbH-Berlin'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','closure_verified','source_urls',to_jsonb(array['https://berlin.gaycities.com/bars/2331-mutschmanns','https://www.companyhouse.de/Mutschmanns-GmbH-Berlin']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','historic_context_only','source_urls',to_jsonb(array['https://berlin.gaycities.com/bars/2331-mutschmanns','https://www.place2be.berlin/en/sexy-berlin/the-best-gay-fetish-bars-in-berlin/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','historic_context_only','source_urls',to_jsonb(array['https://berlin.gaycities.com/bars/2331-mutschmanns','https://www.place2be.berlin/en/sexy-berlin/the-best-gay-fetish-bars-in-berlin/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','historic_context_only','source_urls',to_jsonb(array['https://www.place2be.berlin/en/sexy-berlin/the-best-gay-fetish-bars-in-berlin/','https://www.trustami.com/ervaring/mutschmanns-de-evaluatie']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','insufficient_current_evidence_closed','source_urls',to_jsonb(array['https://berlin.gaycities.com/bars/2331-mutschmanns','https://www.travelgay.com/venue/mutschmanns']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (44::bigint, jsonb_build_object(
      'queue_wait', 'This is a large city hotel, so any wait is at reception, breakfast or the lifts rather than a club door. Check-in starts at 3 pm. Busy congress and family periods can concentrate arrivals; leaving bags early is more useful than timing a nightlife-style entrance.',
      'best_nights', 'A weekend stay combines the zoo, Tiergarten and City West with easy access to Schöneberg nightlife. Weekdays attract more business travel. The big pool and spa are the reason to spend time inside, but recent reports of temporary faults make a same-day facilities check worthwhile.',
      'crowd_mix', 'Business guests, conference delegates, couples, families and international city-break travellers create a broad mainstream crowd. The hotel is not queer-specific, even though its location works well for LGBTQ+ visitors. Expect polished anonymity rather than a resident community scene.',
      'dress_code', 'No hotel-wide dress code is advertised. Casual clothes are normal at breakfast and the pool; smart casual works in the bar, while clubwear can pass through reception on the way out. Pack swimwear for the wellness area and follow the posted spa etiquette rather than assuming a queer sauna culture.',
      'staff_inclusivity', 'Recent guests repeatedly praise warm, attentive reception and breakfast teams, including unusually thoughtful help during personal problems. The pool remains a favourite. Wi-Fi, air-conditioning, worn details and occasional spa outages produce the main criticism, so service is stronger than consistency.',
      'venue_classification', 'mainstream_business_and_leisure_hotel',
      'source_urls', to_jsonb(array[
        'https://all.accor.com/hotel/5347/index.en.shtml',
        'https://www.tripadvisor.com/Hotel_Review-g187323-d202450-Reviews-Pullmann_Berlin_Schweizerhof-Berlin.html',
        'https://www.booking.com/hotel/de/berlin-schweizerhof.html',
        'https://uk.hotels.com/ho186595/pullman-berlin-schweizerhof-berlin-germany/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://all.accor.com/hotel/5347/index.en.shtml','https://www.booking.com/hotel/de/berlin-schweizerhof.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://all.accor.com/hotel/5347/index.en.shtml','https://www.tripadvisor.com/Hotel_Review-g187323-d202450-Reviews-Pullmann_Berlin_Schweizerhof-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://all.accor.com/hotel/5347/index.en.shtml','https://www.booking.com/hotel/de/berlin-schweizerhof.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://all.accor.com/hotel/5347/index.en.shtml','https://www.tripadvisor.com/Hotel_Review-g187323-d202450-Reviews-Pullmann_Berlin_Schweizerhof-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://all.accor.com/hotel/5347/index.en.shtml','https://www.tripadvisor.com/Hotel_Review-g187323-d202450-Reviews-Pullmann_Berlin_Schweizerhof-Berlin.html','https://uk.hotels.com/ho186595/pullman-berlin-schweizerhof-berlin-germany/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (42::bigint, jsonb_build_object(
      'queue_wait', 'The dining room is small and popular, so the practical queue is a missing reservation rather than a rope outside. Book for dinner, especially Friday, Saturday or a warm terrace evening. Same-day tables sometimes appear, but arriving at the 5 pm opening is the safer walk-in move.',
      'best_nights', 'Friday and Saturday give Motzstraße its fullest see-and-be-seen energy and the kitchen runs later. A weekday dinner is better for lingering over schnitzel, wine and conversation. The terrace is the prize in warm weather; reserve indoors if the meal matters more than people-watching.',
      'crowd_mix', 'Schöneberg locals, queer couples and groups, theatre-of-the-street regulars and international diners share a cosy Austrian restaurant. Its terrace sits on one of Berlin’s busiest gay streets, yet the clientele is mixed and food-led rather than an identity-restricted nightlife crowd.',
      'dress_code', 'Casual dress is explicitly welcomed. Denim, trainers, summer shirts, dresses and easy date-night clothes all fit the intimate vintage rooms and terrace. There is no bouncer or fashion test; looking comfortable over a generous schnitzel matters more than performing Berlin club style.',
      'staff_inclusivity', 'Recent diners repeatedly describe warm, attentive, multilingual service and patient help with the menu. Large schnitzels, crisp breading and the cosy room drive strong loyalty. Prices feel high to some and the tiny space can be busy, but hospitality is one of the clearest strengths.',
      'venue_classification', 'mainstream_restaurant_in_queer_district',
      'source_urls', to_jsonb(array[
        'https://www.sissi-berlin.de/',
        'https://www.opentable.com/sissi-osterreichisches-restaurant',
        'https://www.tripadvisor.com/Restaurant_Review-g187323-d1346418-Reviews-Sissi-Berlin.html',
        'https://wanderlog.com/place/details/1309273/sissi-restaurant',
        'https://www.falstaff.com/en/restaurants/sissi-berlin'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.sissi-berlin.de/','https://www.opentable.com/sissi-osterreichisches-restaurant','https://www.tripadvisor.com/Restaurant_Review-g187323-d1346418-Reviews-Sissi-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.sissi-berlin.de/','https://www.opentable.com/sissi-osterreichisches-restaurant','https://www.tripadvisor.com/Restaurant_Review-g187323-d1346418-Reviews-Sissi-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://www.opentable.com/sissi-osterreichisches-restaurant','https://www.tripadvisor.com/Restaurant_Review-g187323-d1346418-Reviews-Sissi-Berlin.html','https://wanderlog.com/place/details/1309273/sissi-restaurant']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.opentable.com/sissi-osterreichisches-restaurant','https://www.sissi-berlin.de/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Restaurant_Review-g187323-d1346418-Reviews-Sissi-Berlin.html','https://wanderlog.com/place/details/1309273/sissi-restaurant','https://www.opentable.com/sissi-osterreichisches-restaurant']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (46::bigint, jsonb_build_object(
      'queue_wait', 'The Sofitel name is obsolete: this address has operated as Dorint Kurfürstendamm Berlin since late 2020. Expect standard hotel check-in, with occasional arrival peaks rather than a public venue line. Confirm your booking under the current name before travelling.',
      'best_nights', 'Stay Friday or Saturday for shopping, theatre and City West nightlife, or midweek for a quieter business base. The hotel bar is well reviewed but does not run a documented queer night. Its strongest evening feature is location, not a weekly party identity.',
      'crowd_mix', 'International leisure guests, business travellers, couples and families fill a mainstream upscale hotel. Spacious rooms and the Ku’damm position appeal broadly. It can work well for LGBTQ+ visitors, but there is no evidence for a queer-majority crowd or a local-versus-tourist nightlife ratio.',
      'dress_code', 'No general dress code is advertised. Casual travel clothes are normal at breakfast and reception, with smart casual a natural choice for the bar. Returning in nightlife clothes should be routine in Berlin, but this remains a shared hotel rather than a fetish or party property.',
      'staff_inclusivity', 'Current guests regularly praise friendly, helpful staff, easy check-in, large rooms and a strong breakfast and bar. Criticism focuses on peak pricing and occasional room-equipment or housekeeping details. The service signal is warm, though it is general hospitality rather than queer-specific hosting.',
      'current_name', 'Dorint Kurfürstendamm Berlin',
      'former_name', 'Sofitel Berlin Kurfürstendamm',
      'operating_status', 'rebranded_operating',
      'venue_classification', 'mainstream_upscale_hotel_rebranded',
      'source_urls', to_jsonb(array[
        'https://www.dorint-blog.de/2020/10/27/dorint-kurfuerstendamm-berlin/',
        'https://hotel-berlin.dorint.com/',
        'https://hotel-berlin.dorint.com/de/bewertungen',
        'https://www.tripadvisor.com/Hotel_Review-g187323-d582479-Reviews-Dorint_Kurfurstendamm_Berlin-Berlin.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','rebrand_verified','source_urls',to_jsonb(array['https://www.dorint-blog.de/2020/10/27/dorint-kurfuerstendamm-berlin/','https://hotel-berlin.dorint.com/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://hotel-berlin.dorint.com/','https://www.tripadvisor.com/Hotel_Review-g187323-d582479-Reviews-Dorint_Kurfurstendamm_Berlin-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://hotel-berlin.dorint.com/','https://www.tripadvisor.com/Hotel_Review-g187323-d582479-Reviews-Dorint_Kurfurstendamm_Berlin-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://hotel-berlin.dorint.com/','https://hotel-berlin.dorint.com/de/bewertungen']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://hotel-berlin.dorint.com/de/bewertungen','https://www.tripadvisor.com/Hotel_Review-g187323-d582479-Reviews-Dorint_Kurfurstendamm_Berlin-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    ))
)
update public.places as p
set venue_intel = coalesce(p.venue_intel, '{}'::jsonb) || reviewed.patch
from reviewed
where p.id = reviewed.id;

do $$
declare updated_count integer;
begin
  select count(*) into updated_count
  from public.places
  where id in (48, 47, 45, 87, 29, 44, 42, 46)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
