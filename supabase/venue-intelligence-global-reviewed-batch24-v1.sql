-- Queer Atlas venue intelligence: global review-led editorial pass, batch 24.
-- Final Athens nightlife, culture, hotel and public-park records; first Atlanta
-- hotel records. Checked 2026-08-05. Source names remain in evidence metadata
-- rather than reader-facing copy.

begin;

with reviewed(id, patch) as (
  values
    (330::bigint, jsonb_build_object(
      'queue_wait', 'Doors open at midnight and the line can be short on ordinary nights, but recent visitors describe waits exceeding an hour and people being admitted out of order. Bottle reservations use direct messages. Keep a backup venue, watch the card terminal and do not mistake a long wait for a promise of entry.',
      'best_nights', 'Wednesday has the clearest identity with a drag show; Friday and Saturday build toward the busiest pop-club energy and run latest. Thursday or Sunday can be easier if dancing matters more than spectacle. Arrive after midnight, confirm the current programme and never rely on an old weekly listing alone.',
      'crowd_mix', 'Young gay men and local pop regulars dominate, with tourists, queer friends and drag fans joining around themed nights. The club presents itself as broadly LGBTQ+, but current accounts repeatedly call the room more local and male than the label suggests. Expect Eurodance, Greek hits, cages and a party-first mood.',
      'dress_code', 'No published uniform is required. Fitted clubwear, a good tee, trainers, mesh or a touch of drag-night glamour all make sense; build for heat, smoke and small dance zones. A respectful outfit does not guarantee entry, so avoid carrying anything bulky and have another Gazi address saved.',
      'staff_inclusivity', 'Experiences split sharply. Some guests find a friendly crowd, lively security and a warm welcome; several 2025 accounts allege racial profiling, condescending door treatment, skipped queues and confusing card charges. Those repeated reports are too serious to soften: queer branding is not the same as equitable access.',
      'venue_classification', 'active_lgbtq_pop_nightclub_with_drag_and_serious_recent_door_equity_concerns',
      'source_urls', to_jsonb(array[
        'https://s-capeclub.gr/',
        'https://wanderlog.com/place/details/2033125/s-cape',
        'https://www.gayplaces.co/city/athens/club/s-cape',
        'https://www.tripadvisor.com.tr/Attraction_Review-g189400-d14180722-Reviews-S_cape-Athens_Attica.html',
        'https://qlist.app/venues/Athina/S-Cape/MUVrQVVvVWc3OU1JQlhDQVZEVFNudw'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_official_door_model_with_repeated_recent_queue_and_payment_reports','source_urls',to_jsonb(array['https://s-capeclub.gr/','https://wanderlog.com/place/details/2033125/s-cape','https://www.tripadvisor.com.tr/Attraction_Review-g189400-d14180722-Reviews-S_cape-Athens_Attica.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_current_official_schedule_and_independent_listing_consensus','source_urls',to_jsonb(array['https://s-capeclub.gr/','https://www.gayplaces.co/city/athens/club/s-cape','https://qlist.app/venues/Athina/S-Cape/MUVrQVVvVWc3OU1JQlhDQVZEVFNudw']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_review_and_guide_consensus_with_local_male_skew','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2033125/s-cape','https://www.gayplaces.co/city/athens/club/s-cape','https://www.tripadvisor.com.tr/Attraction_Review-g189400-d14180722-Reviews-S_cape-Athens_Attica.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','club_format_and_current_practical_review_consensus_no_published_code','source_urls',to_jsonb(array['https://s-capeclub.gr/','https://wanderlog.com/place/details/2033125/s-cape','https://www.gayplaces.co/city/athens/club/s-cape']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','material_mixed_current_consensus_with_multiple_specific_equity_allegations','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2033125/s-cape','https://www.tripadvisor.com.tr/Attraction_Review-g189400-d14180722-Reviews-S_cape-Athens_Attica.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (325::bigint, jsonb_build_object(
      'queue_wait', 'The garden, café and bar usually work as walk-ins; the gig space and club programme can require a ticket and form a post-midnight line. Buy ahead when the calendar offers it and arrive at doors for a concert. On ordinary days, finding a courtyard table is the only real wait.',
      'best_nights', 'Pick the artist, label night or exhibition—not a generic weekday. Coffee and the planted courtyard carry daytime into drinks; Friday and Saturday club sessions run later, while one-off concerts can make any date the standout. This is a cultural calendar with a bar attached, not a fixed queer night.',
      'crowd_mix', 'Athens creatives, students, music obsessives, international visitors and mixed friend groups move between the courtyard and stage. Queer people are comfortable within that broad alternative crowd, but the venue is not LGBTQ+-specific. Age and local-tourist balance change markedly between brunch, a live set and techno.',
      'dress_code', 'Relaxed creative-city clothes fit from coffee to the dancefloor: vintage, black tees, loose tailoring and trainers all look at home. There is no general velvet-rope uniform. Check the event page for anything themed and choose shoes for stairs, standing and the dark side-street approach.',
      'staff_inclusivity', 'Recent feedback praises a welcoming atmosphere and a crowd spanning ages, while complaints focus more on slow service, prices or busy-night logistics than identity. No clear queer safeguarding policy was found. Treat it as generally open-minded hospitality, with the promoter responsible for each event''s culture.',
      'venue_classification', 'mainstream_independent_cultural_complex_and_nightlife_space_not_queer_specific',
      'source_urls', to_jsonb(array[
        'https://sixdogs.gr/',
        'https://sixdogs.gr/event/3602',
        'https://www.tripadvisor.co.uk/Restaurant_Review-g189400-d3935963-Reviews-Six_d_o_g_s-Athens_Attica.html',
        'https://mesprestiges.com/en/athens/places/six-dogs-athens',
        'https://develop.thisisathens.org/pdf/LGBTQ_Athens_8.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_multi_space_model_and_event_ticketing_consensus','source_urls',to_jsonb(array['https://sixdogs.gr/','https://sixdogs.gr/event/3602','https://www.tripadvisor.co.uk/Restaurant_Review-g189400-d3935963-Reviews-Six_d_o_g_s-Athens_Attica.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_current_calendar_and_day_to_night_operating_model','source_urls',to_jsonb(array['https://sixdogs.gr/','https://sixdogs.gr/event/3602','https://mesprestiges.com/en/athens/places/six-dogs-athens']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_cultural_complex_classification_and_review_consensus','source_urls',to_jsonb(array['https://sixdogs.gr/','https://www.tripadvisor.co.uk/Restaurant_Review-g189400-d3935963-Reviews-Six_d_o_g_s-Athens_Attica.html','https://mesprestiges.com/en/athens/places/six-dogs-athens']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','casual_cultural_venue_consensus_with_event_specific_variance','source_urls',to_jsonb(array['https://sixdogs.gr/','https://www.tripadvisor.co.uk/Restaurant_Review-g189400-d3935963-Reviews-Six_d_o_g_s-Athens_Attica.html','https://mesprestiges.com/en/athens/places/six-dogs-athens']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','general_current_hospitality_consensus_with_no_explicit_queer_policy','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Restaurant_Review-g189400-d3935963-Reviews-Six_d_o_g_s-Athens_Attica.html','https://sixdogs.gr/','https://develop.thisisathens.org/pdf/LGBTQ_Athens_8.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (426::bigint, jsonb_build_object(
      'queue_wait', 'Tickets are event-specific and the curated door can still refuse entry. Recent guests often report a brief line and a concise ethics briefing, but the club advises arriving for the music and accepting a plan B. Big international bills can run all night, so presale plus an early arrival is the cleanest move.',
      'best_nights', 'Follow the lineup: this is a queer techno programme, not a nightly pop bar. Friday and Saturday carry most dates, with Pride editions and collaborations running from late evening into morning. Choose the DJ and party statement you genuinely understand; weekday visitors may find no event at all.',
      'crowd_mix', 'Queer ravers, techno heads, gender-expansive dressers and international club tourists share the floor. Women and mixed-gender couples report feeling welcome, though local accounts say some nights still skew heavily toward gay men. The crowd is music-led, younger overall and less conventional than Gazi pop clubs.',
      'dress_code', 'Expressive, dark, sexy or experimental looks fit, but costume alone is not the key: know the night and come for the music. The door gives guidance on ethics and privacy, and cameras are restricted. Build for hours of dancing, intense heat and a cloakroom rather than for photographing the outfit inside.',
      'staff_inclusivity', 'Many recent guests praise a polite door, clear safety briefing, sweet staff and a no-camera space where women and queer visitors can dance unbothered. The overall rating remains mixed, with past accounts raising touch, organisation and cleanliness concerns. Strong intent is visible; experiences are not uniform.',
      'venue_classification', 'queer_led_techno_club_with_curated_door_and_explicit_space_ethics',
      'source_urls', to_jsonb(array[
        'https://www.smutathens.com/',
        'https://smutix.sumupstore.com/category/early-bird-ticket',
        'https://wanderlog.com/place/details/7057849/smut-athens',
        'https://qlist.app/events/Athens/SMUT-PRIDE-LOVE-SMUT-Athens/23702',
        'https://www.reddit.com/r/Athens_Greece/comments/1t9yogl/any_queer_friendly_clubs_recommended/',
        'https://www.reddit.com/r/Athens_Greece/comments/1su32w7/11th14th_may_visit_from_berlin/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_ticketing_and_curated_door_review_consensus','source_urls',to_jsonb(array['https://www.smutathens.com/','https://smutix.sumupstore.com/category/early-bird-ticket','https://wanderlog.com/place/details/7057849/smut-athens']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_current_event_led_calendar_and_overnight_format','source_urls',to_jsonb(array['https://smutix.sumupstore.com/category/early-bird-ticket','https://qlist.app/events/Athens/SMUT-PRIDE-LOVE-SMUT-Athens/23702','https://www.reddit.com/r/Athens_Greece/comments/1su32w7/11th14th_may_visit_from_berlin/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_review_and_local_community_consensus_with_male_skew_caveat','source_urls',to_jsonb(array['https://wanderlog.com/place/details/7057849/smut-athens','https://www.reddit.com/r/Athens_Greece/comments/1t9yogl/any_queer_friendly_clubs_recommended/','https://qlist.app/events/Athens/SMUT-PRIDE-LOVE-SMUT-Athens/23702']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_current_ethics_briefing_no_camera_and_expression_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/7057849/smut-athens','https://qlist.app/events/Athens/SMUT-PRIDE-LOVE-SMUT-Athens/23702','https://www.smutathens.com/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_recent_positive_safety_consensus_balanced_against_mixed_historical_reports','source_urls',to_jsonb(array['https://wanderlog.com/place/details/7057849/smut-athens','https://qlist.app/events/Athens/SMUT-PRIDE-LOVE-SMUT-Athens/23702']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (321::bigint, jsonb_build_object(
      'queue_wait', 'Weekends can pack the compact two-floor club, so arrive around midnight before the main crush. Recent visitors also report being told that a night was reservation-only after travelling there, with inconsistent explanations at the door. Check directly the same day and keep another Gazi option ready.',
      'best_nights', 'Friday and Saturday bring the fullest institution-level energy and run latest; Thursday or Sunday is better for more room. Performance nights add spectacle, while the two floors separate pop and Greek anthems from a house or techno mood. Athens starts late, so do not judge the room before 1 am.',
      'crowd_mix', 'Gay men are the core, spanning longtime Athens regulars, younger dancers and solo international visitors. Current guests describe many body types and a welcoming mix, though it is less gender-expansive than the city''s alternative queer rooms. The front floor is social pop; the second draws electronic-music loyalists.',
      'dress_code', 'Casual clubwear is enough: jeans, fitted tees, trainers, a bright pop look or simple black all pass naturally. There is no reliable evidence of a formal code. Dress lightly because weekend crowding and indoor cigarette smoke can make the room feel heavy, and use the outdoor area for cleaner air.',
      'staff_inclusivity', 'Many recent solo visitors, including an Asian guest, praise inviting bartenders, cloakroom care and a safe, familiar atmosphere. One 2026 traveller reports unexplained reservation claims and discriminatory door treatment on consecutive nights. Indoor smoking remains the most repeated practical complaint.',
      'venue_classification', 'long_running_gay_mens_two_floor_pop_and_electronic_nightclub',
      'source_urls', to_jsonb(array[
        'https://www.instagram.com/sodade2/',
        'https://app.wanderlog.com/place/details/2033124/sodade2',
        'https://www.tripadvisor.ca/Attraction_Review-g189400-d12688920-Reviews-Sodade2-Athens_Attica.html',
        'https://www.tripadvisor.es/Attraction_Review-g189400-d12688920-Reviews-Sodade2-Athens_Attica.html',
        'https://eurogaytravel.com/en/venues/sodade2',
        'https://develop.thisisathens.org/pdf/LGBTQ_Athens_8.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_capacity_consensus_with_specific_reservation_only_door_reports','source_urls',to_jsonb(array['https://app.wanderlog.com/place/details/2033124/sodade2','https://www.tripadvisor.ca/Attraction_Review-g189400-d12688920-Reviews-Sodade2-Athens_Attica.html','https://www.tripadvisor.es/Attraction_Review-g189400-d12688920-Reviews-Sodade2-Athens_Attica.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_hours_performance_and_two_floor_music_consensus','source_urls',to_jsonb(array['https://app.wanderlog.com/place/details/2033124/sodade2','https://eurogaytravel.com/en/venues/sodade2','https://www.tripadvisor.ca/Attraction_Review-g189400-d12688920-Reviews-Sodade2-Athens_Attica.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_gay_male_core_and_multi_age_local_tourist_review_consensus','source_urls',to_jsonb(array['https://app.wanderlog.com/place/details/2033124/sodade2','https://www.tripadvisor.ca/Attraction_Review-g189400-d12688920-Reviews-Sodade2-Athens_Attica.html','https://develop.thisisathens.org/pdf/LGBTQ_Athens_8.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','casual_club_consensus_with_repeated_smoke_and_crowding_caveat','source_urls',to_jsonb(array['https://app.wanderlog.com/place/details/2033124/sodade2','https://www.tripadvisor.ca/Attraction_Review-g189400-d12688920-Reviews-Sodade2-Athens_Attica.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','mostly_positive_current_service_consensus_with_material_door_discrimination_report','source_urls',to_jsonb(array['https://www.tripadvisor.ca/Attraction_Review-g189400-d12688920-Reviews-Sodade2-Athens_Attica.html','https://www.tripadvisor.es/Attraction_Review-g189400-d12688920-Reviews-Sodade2-Athens_Attica.html','https://app.wanderlog.com/place/details/2033124/sodade2']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1883::bigint, jsonb_build_object(
      'queue_wait', 'With only 12 apartment-style suites, this is a personalised hotel arrival rather than a lobby queue. Recent guests describe smooth check-in and a warm welcome. Tell reception your time, order the picnic-basket breakfast the night before and ask whether a selected rooftop event changes guest access.',
      'best_nights', 'Stay for walkable Psyrri and a quiet Acropolis-view breakfast, not for an in-house queer programme. A weekday reduces sound from the neighbouring bar; Friday and Saturday suit travellers who want nightlife outside the door and do not mind some early-evening noise. The rooftop shines at breakfast and sunset.',
      'crowd_mix', 'Design-minded couples, families, solo travellers and small international groups fill the spacious suites. The tiny scale feels residential rather than scene-driven, and guests use it as a base for the historic centre. There is no evidence of a queer-majority crowd or a meaningful local-versus-tourist ratio.',
      'dress_code', 'There is no hotel dress code. Good walking shoes and heat-friendly Athens clothes matter by day; a polished casual layer suits the rooftop garden or nearby dinner. The industrial interiors are photogenic without demanding performance, and full kitchens make this easier than a formal boutique stay.',
      'staff_inclusivity', 'Current 2026 reviews consistently praise kind, attentive staff, smooth arrivals and useful local recommendations. Couples and solo guests report feeling cared for. No explicit queer policy or specialist training was found, so this supports excellent general hospitality rather than a community-specific claim.',
      'venue_classification', 'mainstream_small_design_aparthotel_with_rooftop_not_queer_specific',
      'source_urls', to_jsonb(array[
        'https://thefoundrysuitesathens.com/',
        'https://thefoundrysuitesathens.com/roof-garden/',
        'https://www.booking.com/hotel/gr/the-foundry.en-gb.html',
        'https://www.booking.com/reviews/gr/hotel/the-foundry.en-gb.html',
        'https://www.tripadvisor.com/Hotel_Review-g189400-d15242452-Reviews-The_Foundry_Suites_Athens-Athens_Attica.html',
        'https://www.kimkim.com/h/the-foundry-suites-athens-greece'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_small_hotel_arrival_and_breakfast_order_consensus','source_urls',to_jsonb(array['https://www.booking.com/hotel/gr/the-foundry.en-gb.html','https://www.booking.com/reviews/gr/hotel/the-foundry.en-gb.html','https://www.tripadvisor.com/Hotel_Review-g189400-d15242452-Reviews-The_Foundry_Suites_Athens-Athens_Attica.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_rooftop_and_neighbouring_weekend_noise_consensus','source_urls',to_jsonb(array['https://thefoundrysuitesathens.com/roof-garden/','https://www.booking.com/reviews/gr/hotel/the-foundry.en-gb.html','https://www.tripadvisor.com/Hotel_Review-g189400-d15242452-Reviews-The_Foundry_Suites_Athens-Athens_Attica.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','mainstream_twelve_suite_hotel_classification_and_current_guest_consensus','source_urls',to_jsonb(array['https://www.booking.com/hotel/gr/the-foundry.en-gb.html','https://www.kimkim.com/h/the-foundry-suites-athens-greece','https://www.booking.com/reviews/gr/hotel/the-foundry.en-gb.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','aparthotel_and_rooftop_context_with_no_published_code','source_urls',to_jsonb(array['https://thefoundrysuitesathens.com/','https://thefoundrysuitesathens.com/roof-garden/','https://www.kimkim.com/h/the-foundry-suites-athens-greece']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_general_hospitality_consensus_limited_queer_specific_evidence','source_urls',to_jsonb(array['https://www.booking.com/reviews/gr/hotel/the-foundry.en-gb.html','https://www.tripadvisor.com/Hotel_Review-g189400-d15242452-Reviews-The_Foundry_Suites_Athens-Athens_Attica.html','https://www.kimkim.com/h/the-foundry-suites-athens-greece']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1882::bigint, jsonb_build_object(
      'queue_wait', 'There is no entry line: Zappeion is a public garden beside a civic hall. Daytime paths belong to walkers and visitors; the historic cruising layer appears around darker sections later. Do not expect a marked zone, lockers or anyone controlling capacity, and never follow a stranger somewhere you cannot exit easily.',
      'best_nights', 'For architecture and gardens, go by day. Cruising guides point to dusk and late night, but a June 2026 homophobic threat against three people inside the park makes it irresponsible to call that the best time. Choose a staffed queer venue for connection; if you enter after dark, stay alert and near lit routes.',
      'crowd_mix', 'Tourists, runners, families and central-Athens pedestrians form the visible daytime crowd. Informal night cruising has long drawn men of varied ages, locals and visitors, but it is only one hidden use of a much larger public garden. Interest is never implied by someone''s presence, route or eye contact.',
      'dress_code', 'Ordinary city clothes and comfortable walking shoes are right. There is no cruising uniform, and public nudity is not permitted. Carry little, secure your phone and wallet, avoid photographing strangers and keep anything intimate private, legal and unmistakably consensual.',
      'staff_inclusivity', 'There is no queer host or venue team. Police responded quickly after the June 2026 anti-LGBTQ+ threats, and Greece''s 11414 line handles racist, sexist and homophobic abuse around the clock. That response matters, but it does not turn an unstaffed dark garden into a protected community space.',
      'venue_classification', 'public_civic_gardens_with_historical_informal_male_cruising_signal_not_a_venue',
      'record_status', 'misclassified_non_venue_public_park',
      'source_urls', to_jsonb(array[
        'https://www.cruisinggays.com/athens/areas/48357-zappeion-gardens/',
        'https://www.cruisinggays.com/athens/areas/7827-park-in-front-of-zappeion/',
        'https://www.gays-cruising.com/en/cruising/zappion_gardens_athens_grece_29879',
        'https://www.ekathimerini.com/news/1306139/teenagers-held-over-alleged-gender-based-abuse-in-park/',
        'https://www.thisisathens.org/sites/default/files/2021-10/accessible_it_national_garden_movement.pdf',
        'https://theses.gla.ac.uk/2653/1/2008DendrinosPhD.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','public_garden_classification_and_informal_cruising_context','source_urls',to_jsonb(array['https://www.thisisathens.org/sites/default/files/2021-10/accessible_it_national_garden_movement.pdf','https://www.cruisinggays.com/athens/areas/48357-zappeion-gardens/','https://www.cruisinggays.com/athens/areas/7827-park-in-front-of-zappeion/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','historical_night_cruising_signal_balanced_against_current_reported_homophobic_incident','source_urls',to_jsonb(array['https://www.cruisinggays.com/athens/areas/48357-zappeion-gardens/','https://www.gays-cruising.com/en/cruising/zappion_gardens_athens_grece_29879','https://www.ekathimerini.com/news/1306139/teenagers-held-over-alleged-gender-based-abuse-in-park/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','public_garden_context_with_historical_male_cruising_evidence','source_urls',to_jsonb(array['https://www.thisisathens.org/sites/default/files/2021-10/accessible_it_national_garden_movement.pdf','https://www.cruisinggays.com/athens/areas/7827-park-in-front-of-zappeion/','https://theses.gla.ac.uk/2653/1/2008DendrinosPhD.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','public_space_rules_and_consent_privacy_guidance','source_urls',to_jsonb(array['https://www.cruisinggays.com/athens/areas/48357-zappeion-gardens/','https://www.thisisathens.org/sites/default/files/2021-10/accessible_it_national_garden_movement.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','no_queer_staff_with_current_police_response_and_helpline_evidence','source_urls',to_jsonb(array['https://www.ekathimerini.com/news/1306139/teenagers-held-over-alleged-gender-based-abuse-in-park/','https://www.cruisinggays.com/athens/areas/48357-zappeion-gardens/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1934::bigint, jsonb_build_object(
      'queue_wait', 'Self check-in is designed to move hotel guests quickly, but stadium events can crowd the lobby, lifts and rooftop. The bar has limited operating days and may draw its own line. If a game or concert brings you here, check in before doors and confirm rooftop access rather than assuming it is open.',
      'best_nights', 'The hotel comes alive around a Mercedes-Benz Stadium concert, match or convention; on a quiet night, the music theme can feel more set than scene. Sunset at the rooftop works when open, but event weekends also bring higher rates, lift traffic and late bass. Choose energy or sleep deliberately.',
      'crowd_mix', 'Sports fans, concert travellers, convention groups and weekend visitors dominate, with locals joining the rooftop. The audience can swing completely with the stadium calendar. LGBTQ+ guests are part of a broad Atlanta mix, but this is neither a queer hotel nor a dependable community meeting place.',
      'dress_code', 'Casual music-hotel style rules: team colours, concert merch, trainers, denim or a sharper rooftop look all fit. Security rules at the stadium—not the hotel—may limit bags. Pack for the event you booked and ask for a room away from rooftop bass if sleep matters more than staying inside the afterglow.',
      'staff_inclusivity', 'Recent guests often praise upbeat check-in, bar and transport help, while others report housekeeping, billing and peak-time follow-through failures. No meaningful queer-specific policy or review pattern was found. Expect friendly mainstream hospitality, but document requests during a hectic event weekend.',
      'venue_classification', 'mainstream_music_branded_stadium_hotel_and_rooftop_not_queer_specific',
      'source_urls', to_jsonb(array[
        'https://reverb.hardrock.com/atlanta',
        'https://reverb.hardrock.com/files/5866/20230519-Reverb-Fact-Sheet.pdf',
        'https://wanderlog.com/place/details/807401/reverb-downtown-atlanta',
        'https://www.tripadvisor.com/Hotel_Review-g60898-d20969630-Reviews-REVERB_by_Hard_Rock_Downtown_Atlanta-Atlanta_Georgia.html',
        'https://www.kayak.com/Atlanta-Hotels-Reverb-by-Hard-Rock-Downtown-Atlanta.6277071.ksp',
        'https://www.hotels.com/ho1560883296/reverb-by-hard-rock-atlanta-downtown-atlanta-united-states-of-america/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_self_check_in_model_with_current_event_and_elevator_crowding_consensus','source_urls',to_jsonb(array['https://reverb.hardrock.com/files/5866/20230519-Reverb-Fact-Sheet.pdf','https://wanderlog.com/place/details/807401/reverb-downtown-atlanta','https://www.kayak.com/Atlanta-Hotels-Reverb-by-Hard-Rock-Downtown-Atlanta.6277071.ksp']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','official_stadium_hotel_positioning_and_current_noise_consensus','source_urls',to_jsonb(array['https://reverb.hardrock.com/atlanta','https://www.tripadvisor.com/Hotel_Review-g60898-d20969630-Reviews-Reverb_Downtown_Atlanta-Atlanta_Georgia.html','https://wanderlog.com/place/details/807401/reverb-downtown-atlanta']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','mainstream_stadium_hotel_classification_and_event_driven_crowd_consensus','source_urls',to_jsonb(array['https://reverb.hardrock.com/atlanta','https://www.tripadvisor.com/Hotel_Review-g60898-d20969630-Reviews-REVERB_by_Hard_Rock_Downtown_Atlanta-Atlanta_Georgia.html','https://wanderlog.com/place/details/807401/reverb-downtown-atlanta']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','music_hotel_and_stadium_context_with_no_published_hotel_code','source_urls',to_jsonb(array['https://reverb.hardrock.com/atlanta','https://reverb.hardrock.com/files/5866/20230519-Reverb-Fact-Sheet.pdf','https://wanderlog.com/place/details/807401/reverb-downtown-atlanta']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','mixed_current_general_hospitality_consensus_limited_queer_specific_evidence','source_urls',to_jsonb(array['https://wanderlog.com/place/details/807401/reverb-downtown-atlanta','https://www.tripadvisor.com/Hotel_Review-g60898-d20969630-Reviews-REVERB_by_Hard_Rock_Downtown_Atlanta-Atlanta_Georgia.html','https://www.kayak.com/Atlanta-Hotels-Reverb-by-Hard-Rock-Downtown-Atlanta.6277071.ksp']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1933::bigint, jsonb_build_object(
      'queue_wait', 'This intimate 1896 inn requires a reservation and offers personalised check-in from 4-6:30 pm, with self check-in arranged later. There is no nightlife line. Same-day online bookings close after 2 pm, so call if plans change; early or late arrival can carry an hourly fee.',
      'best_nights', 'Choose Stonehurst for a quiet Midtown retreat and a slow breakfast, not for an in-house party. Weekdays are calm; Friday and Saturday may require a two-night stay but put you close to restaurants, Piedmont Park and the gay heart of Midtown. Atlanta Pride weekends need very early booking.',
      'crowd_mix', 'Couples, anniversary travellers, design lovers and small adult groups fill a handful of rooms in the historic house and carriage house. Guests are overwhelmingly visitors rather than neighbourhood regulars. The Midtown location is strongly queer-friendly, but the inn itself is a private lodging, not a social venue.',
      'dress_code', 'There is no formal code. Comfortable city clothes suit breakfast and the garden; elegant casual fits the art-filled parlours and a romantic evening out. Treat the restored house with the ease of a home and the care of a small luxury property—this is polished intimacy, not a see-and-be-seen lobby.',
      'staff_inclusivity', 'Recent couples consistently praise personal attention, thoughtful amenities and a peaceful welcome, including women travelling together. No explicit LGBTQ+ programme or detailed identity policy was found. Its Midtown setting and strong couple hospitality are reassuring, but the claim remains excellent general care.',
      'venue_classification', 'mainstream_luxury_historic_bed_and_breakfast_in_queer_midtown_not_a_queer_venue',
      'source_urls', to_jsonb(array[
        'https://stonehurstplace.com/stay',
        'https://www.stonehurstplace.com/faqs',
        'https://stonehurstplaces.com/policies',
        'https://stonehurstplaces.com/stay/breakfast',
        'https://www.booking.com/hotel/us/stonehurst-place.html',
        'https://www.tripadvisor.com/Hotel_Review-g60898-d226793-Reviews-Stonehurst_Place-Atlanta_Georgia.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_current_personalised_check_in_and_reservation_policy','source_urls',to_jsonb(array['https://www.stonehurstplace.com/faqs','https://stonehurstplaces.com/policies','https://stonehurstplace.com/stay']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_weekend_minimum_policy_and_midtown_lodging_context','source_urls',to_jsonb(array['https://www.stonehurstplace.com/faqs','https://stonehurstplaces.com/policies','https://www.booking.com/hotel/us/stonehurst-place.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','small_mainstream_bed_and_breakfast_classification_and_current_guest_consensus','source_urls',to_jsonb(array['https://stonehurstplace.com/stay','https://www.booking.com/hotel/us/stonehurst-place.html','https://www.tripadvisor.com/Hotel_Review-g60898-d226793-Reviews-Stonehurst_Place-Atlanta_Georgia.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','historic_luxury_inn_context_with_no_published_code','source_urls',to_jsonb(array['https://stonehurstplace.com/stay','https://stonehurstplaces.com/our-place/history','https://stonehurstplaces.com/stay/breakfast']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_couple_hospitality_consensus_limited_explicit_queer_policy','source_urls',to_jsonb(array['https://www.tripadvisor.com/Hotel_Review-g60898-d226793-Reviews-Stonehurst_Place-Atlanta_Georgia.html','https://www.booking.com/hotel/us/stonehurst-place.html','https://stonehurstplace.com/stay']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (330, 325, 426, 321, 1883, 1882, 1934, 1933)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
