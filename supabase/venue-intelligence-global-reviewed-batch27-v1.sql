-- Queer Atlas venue intelligence: global review-led editorial pass, batch 27.
-- Bangkok clubs, accommodation, sauna, drag bars, hotel, massage and pub.
-- Checked 2026-08-05. Source names remain in evidence metadata rather than
-- reader-facing copy.

begin;

with reviewed(id, patch) as (
  values
    (544::bigint, jsonb_build_object(
      'queue_wait', 'Reservations are not normally the story; tables are. The cavernous room can fill even on a weekday once the live acts start, and a prime stage position may carry a minimum bottle or drink spend. Arrive before midnight to understand the system, ask the table terms clearly and photograph the opening bill.',
      'best_nights', 'Friday and Saturday bring the fullest, flashiest version, with live Thai pop, comedians, drag and male dance sets giving way to club music. A weekday can still land at full-house energy with more locals than visitors. Check the current programme: the performance bill matters more here than a generic DJ night.',
      'crowd_mix', 'Fashionable young Thai and Asian gay men dominate, joined by women, straight friends, regional visitors and comparatively few Western tourists. Groups and bottle tables shape the room more than solo mingling. It is one of the better choices for seeing Bangkok queer nightlife through a local pop-culture lens.',
      'dress_code', 'Dress like you meant to go out: polished casual, clean trainers, trousers or a sharp short, styled hair and a little nightlife confidence. Formalwear is unnecessary, but beach basics feel out of step with the fashionable table crowd. Keep valuables close and understand any minimum spend before settling in.',
      'staff_inclusivity', 'Many guests praise the performers, music and lively welcome, while others report rude service or billing disputes; a February 2026 regular specifically warned guests to watch the bill. The club welcomes a mixed audience around a gay core, but table economics can affect treatment. Confirm every charge as it lands.',
      'venue_classification', 'active_large_thai_led_gay_mixed_live_show_and_dance_club',
      'source_urls', to_jsonb(array[
        'https://www.facebook.com/FAKECLUBBANGKOKTH',
        'https://wanderlog.com/place/details/2104063/fake-club-bangkok',
        'https://www.travelgay.com/venue/fake-club',
        'https://partybangkok.com/ratchada/',
        'https://you.ctrip.com/food/bangkok191/79150856.html',
        'https://www.reddit.com/r/ThailandTourism/comments/1sp8aix/is_reservation_mandatory_at_fake_club_and_route66/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_large_capacity_table_minimum_spend_and_peak_arrival_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2104063/fake-club-bangkok','https://www.reddit.com/r/ThailandTourism/comments/1sp8aix/is_reservation_mandatory_at_fake_club_and_route66/','https://www.travelgay.com/venue/fake-club']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_weekend_peak_live_band_drag_dancer_and_dj_programme_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2104063/fake-club-bangkok','https://partybangkok.com/ratchada/','https://www.facebook.com/FAKECLUBBANGKOKTH']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_young_thai_asian_gay_mixed_group_and_low_western_tourist_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/fake-club','https://partybangkok.com/ratchada/','https://you.ctrip.com/food/bangkok191/79150856.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','fashionable_local_table_club_context_with_no_published_formal_code','source_urls',to_jsonb(array['https://www.travelgay.com/venue/fake-club','https://partybangkok.com/ratchada/','https://wanderlog.com/place/details/2104063/fake-club-bangkok']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','mixed_current_performance_welcome_service_and_material_billing_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2104063/fake-club-bangkok','https://you.ctrip.com/food/bangkok191/79150856.html','https://www.travelgay.com/venue/fake-club']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (539::bigint, jsonb_build_object(
      'queue_wait', 'The narrow entrance and three-floor layout can compress badly after the other Silom clubs turn out. Friday and Saturday are the real queue risk; midweek is looser. Carry exact cash for the cover, ask what it includes and keep the receipt, as current reports warn that change at the front desk can become an argument.',
      'best_nights', 'Friday and Saturday deliver the sweaty, shirtless circuit version; a weekday offers more room but can feel thin. This is the late chapter after Soi 2, not an early aperitif. Pride, Songkran and New Year can transform the calendar, so verify hours and tickets instead of relying on the venue''s shifting 3-6 am claims.',
      'crowd_mix', 'Thai and visiting gay men in their thirties and forties are strongly visible, alongside younger circuit dancers and international party travellers. The crowd becomes more male, muscular and sexually charged as the night deepens. It is less broad-tent queer social than a high-energy gay men''s after-hours club.',
      'dress_code', 'Clean closed shoes are the one practical rule repeated in current guides; open toes are a bad bet. Start in a fitted tee, tank or club shirt and expect many men to lose the top later. Keep layers minimal, pockets secure and the look dance-ready: three floors of heat make polished comfort smarter than costume.',
      'staff_inclusivity', 'The gay purpose is clear and many visitors love the sound, lights and uninhibited floor. Service confidence is weaker: accounts mention poor nights, intimidating security or missing change. Treat the door transaction carefully and keep friends in sight. Identity welcome does not guarantee gentle crowd management.',
      'venue_classification', 'active_multi_level_late_night_gay_male_circuit_dance_club',
      'source_urls', to_jsonb(array[
        'https://www.facebook.com/gbangkok',
        'https://www.pridethailand.com/news/g-bangkok-god-177',
        'https://thegaypassport.com/venue/g-bangkok-god/',
        'https://www.corner.inc/place/p3ArtLGbLjot',
        'https://maps.apple.com/place?place-id=IAD996E930D55C1F9',
        'https://www.splashd.app/cities/bangkok',
        'https://www.reddit.com/r/phlgbt/comments/1k7ndum'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_weekend_peak_cover_exact_change_and_front_desk_consensus','source_urls',to_jsonb(array['https://www.corner.inc/place/p3ArtLGbLjot','https://thegaypassport.com/venue/g-bangkok-god/','https://maps.apple.com/place?place-id=IAD996E930D55C1F9']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_late_night_weekend_circuit_and_major_event_consensus_with_hours_variance','source_urls',to_jsonb(array['https://www.pridethailand.com/news/g-bangkok-god-177','https://thegaypassport.com/venue/g-bangkok-god/','https://www.corner.inc/place/p3ArtLGbLjot']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_thai_tourist_thirties_forties_and_circuit_male_consensus','source_urls',to_jsonb(array['https://www.pridethailand.com/news/g-bangkok-god-177','https://www.corner.inc/place/p3ArtLGbLjot','https://www.splashd.app/cities/bangkok']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_closed_shoe_guidance_and_current_shirtless_circuit_context','source_urls',to_jsonb(array['https://thegaypassport.com/venue/g-bangkok-god/','https://www.corner.inc/place/p3ArtLGbLjot','https://www.pridethailand.com/news/g-bangkok-god-177']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','clear_gay_welcome_balanced_against_current_door_security_and_service_concerns','source_urls',to_jsonb(array['https://www.corner.inc/place/p3ArtLGbLjot','https://www.reddit.com/r/phlgbt/comments/1k7ndum','https://www.pridethailand.com/news/g-bangkok-god-177']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1954::bigint, jsonb_build_object(
      'queue_wait', 'Current check-in is unusually short, listed from 2-6 pm, so message ahead if Bangkok traffic threatens the window. Reception is small rather than queue-heavy. Luggage storage, an elevator and full-day security help, but dorm check-in still goes more smoothly when passport, booking and age eligibility are ready.',
      'best_nights', 'Pick Kinnon for calm sleep and coworking, then choose the city night outside. Friday and Saturday put Silom''s queer scene at full volume nearby; weekdays suit remote work and a quieter dorm. The common spaces can be busy with laptops yet socially subdued, so do not book expecting a programmed party hostel.',
      'crowd_mix', 'International solo travellers, digital workers and couples share mixed and women-only dorms, with Thai repeat guests also visible in current reviews. It is mainstream, not LGBTQ+-specific, despite easy access to Silom nightlife. One booking channel currently states an 18-45 age rule, which should be confirmed directly.',
      'dress_code', 'Hostel comfort beats nightlife styling: light clothes, quiet sleepwear and shower sandals. The wide pod beds feel more private than classic bunks, while coworking areas reward a presentable daytime layer. Lock valuables yourself and keep a separate going-out look ready so the dorm remains a place to decompress.',
      'staff_inclusivity', 'Current verified reviews strongly praise kind, helpful staff, cleanliness, security and practical care; one injured guest was moved to a lower bed. A contrary stay reports staff opening and relocating locker contents without notice. No queer-specific policy was found, but the general hospitality signal is excellent.',
      'venue_classification', 'active_mainstream_quiet_hostel_and_coworking_cafe_near_silom_not_queer_specific',
      'source_urls', to_jsonb(array[
        'https://www.hostelworld.com/hostels/p/276851/kinnon-deluxe-hostel-coworking-cafe/',
        'https://www.booking.com/reviews/th/hotel/kinnon-hostel.html',
        'https://www.agoda.com/kinnon-deluxe-hostel-coworking-cafe/hotel/bangkok-th.html',
        'https://www.tripadvisor.co.uk/Hotel_Review-g293916-d12988263-Reviews-Kinnon_Hostel-Bangkok.html',
        'https://www.expedia.com/Bangkok-Hotels-Kinnon-Deluxe-Hostel-Coworking-Cafe.h18273920.Hotel-Information'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_short_checkin_window_luggage_elevator_security_and_reception_consensus','source_urls',to_jsonb(array['https://www.hostelworld.com/hostels/p/276851/kinnon-deluxe-hostel-coworking-cafe/','https://www.booking.com/reviews/th/hotel/kinnon-hostel.html','https://www.agoda.com/kinnon-deluxe-hostel-coworking-cafe/hotel/bangkok-th.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','quiet_coworking_hostel_classification_and_inconsistent_social_atmosphere_consensus','source_urls',to_jsonb(array['https://www.hostelworld.com/hostels/p/276851/kinnon-deluxe-hostel-coworking-cafe/','https://www.booking.com/reviews/th/hotel/kinnon-hostel.html','https://www.agoda.com/kinnon-deluxe-hostel-coworking-cafe/hotel/bangkok-th.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','mainstream_solo_couple_digital_worker_mixed_dorm_and_explicit_age_rule_evidence','source_urls',to_jsonb(array['https://www.agoda.com/kinnon-deluxe-hostel-coworking-cafe/hotel/bangkok-th.html','https://www.booking.com/reviews/th/hotel/kinnon-hostel.html','https://www.hostelworld.com/hostels/p/276851/kinnon-deluxe-hostel-coworking-cafe/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','pod_dorm_coworking_locker_and_shared_facility_practical_context','source_urls',to_jsonb(array['https://www.booking.com/reviews/th/hotel/kinnon-hostel.html','https://www.hostelworld.com/hostels/p/276851/kinnon-deluxe-hostel-coworking-cafe/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_service_accessibility_cleanliness_and_security_consensus_with_locker_exception','source_urls',to_jsonb(array['https://www.hostelworld.com/hostels/p/276851/kinnon-deluxe-hostel-coworking-cafe/','https://www.booking.com/reviews/th/hotel/kinnon-hostel.html','https://www.agoda.com/kinnon-deluxe-hostel-coworking-cafe/hotel/bangkok-th.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (546::bigint, jsonb_build_object(
      'queue_wait', 'Reception and locker issue are usually smoother before the evening peak. Current guests place the build around 6 pm, with organised group activity near 8. The six-floor scale absorbs people better than a tiny sauna, but weekends and event nights can still slow check-in. Walk from Phra Khanong BTS in 5-7 minutes.',
      'best_nights', 'Friday through Sunday evenings offer the strongest social current; regular themed activities give every night more structure than random cruising alone. Arrive around 6, explore the sento and rooftop, then decide whether the 8 pm event fits. A weekday afternoon is better for calm water, café time and the facilities.',
      'crowd_mix', 'Thai and Asian gay men are central, with international visitors, expats and a visible younger, gym-oriented crowd. Reviews still describe enough age and body range for the space to feel social rather than invitation-only. It remains a men''s sexual-wellness venue, not a mixed-gender LGBTQ+ community centre.',
      'dress_code', 'Check street clothes into the locker and use the robe or towel system; themed nights may switch to underwear or nudity at a stated time. Shower sandals help across six wet floors. Condoms and lubricant are officially free, so practical preparation and explicit consent matter more than body display.',
      'staff_inclusivity', 'The polished facilities, harm-reduction certification and free safer-sex supplies give Krubb substance beyond branding. Visitors praise the build and social design, though individual nights can feel less active than expected. Staff welcome men into a sex-positive space; chemistry is never guaranteed.',
      'venue_classification', 'active_premium_multi_level_gay_male_social_club_sauna_and_harm_reduction_space',
      'source_urls', to_jsonb(array[
        'https://www.gaysaunabangkok.com/',
        'https://www.gaysaunabangkok.com/contact-10',
        'https://www.pridethailand.com/news/krubb-bangkok-social-club-sauna-118',
        'https://gayandasia.com/en/venue/review/krubbbangkok',
        'https://www.tripadvisor.com.sg/Attraction_Review-g293916-d26889078-Reviews-Krubb_Bangkok_Sauna_Onsen-Bangkok.html',
        'https://www.reddit.com/r/gaysian/comments/1sc3stu/i_visited_all_15_gay_saunas_in_bangkok_here_is/',
        'https://www.reddit.com/r/Spa_Bathhouse_Review/comments/1qh2fdp/krubb_spa_bangkoks_steamy_gay_sauna_scene/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_evening_peak_group_event_multi_floor_and_bts_access_consensus','source_urls',to_jsonb(array['https://www.reddit.com/r/gaysian/comments/1sc3stu/i_visited_all_15_gay_saunas_in_bangkok_here_is/','https://www.pridethailand.com/news/krubb-bangkok-social-club-sauna-118','https://www.gaysaunabangkok.com/contact-10']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_regular_event_weekend_evening_and_quieter_facility_use_consensus','source_urls',to_jsonb(array['https://www.gaysaunabangkok.com/','https://www.pridethailand.com/news/krubb-bangkok-social-club-sauna-118','https://www.reddit.com/r/gaysian/comments/1sc3stu/i_visited_all_15_gay_saunas_in_bangkok_here_is/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_thai_asian_tourist_younger_gym_and_age_body_range_consensus','source_urls',to_jsonb(array['https://www.reddit.com/r/gaysian/comments/1sc3stu/i_visited_all_15_gay_saunas_in_bangkok_here_is/','https://www.reddit.com/r/ThailandTourism/comments/1dy461j/recommendations_on_bangkok_gay_saunas_and_bars/','https://www.pridethailand.com/news/krubb-bangkok-social-club-sauna-118']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_current_theme_attire_and_official_free_safer_sex_supply_evidence','source_urls',to_jsonb(array['https://gayandasia.com/en/venue/review/krubbbangkok','https://www.gaysaunabangkok.com/ja','https://www.gaysaunabangkok.com/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','official_harm_reduction_community_work_and_current_polished_social_design_consensus','source_urls',to_jsonb(array['https://www.gaysaunabangkok.com/ja','https://www.pridethailand.com/news/krubb-bangkok-social-club-sauna-118','https://www.reddit.com/r/Spa_Bathhouse_Review/comments/1qh2fdp/krubb_spa_bangkoks_steamy_gay_sauna_scene/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1948::bigint, jsonb_build_object(
      'queue_wait', 'This listing covers sister venues rather than one room: Pride handles dinner and pre-drinks, while Circus carries the drag show. Outdoor tables go first, and front-row show positions benefit from arriving before 9 pm. Staff can continue the tab across the pairing, but confirm that arrangement and each price yourself.',
      'best_nights', 'Wednesday through Sunday is the useful window for the published 9 pm shows. Start with Thai food at Pride, cross into Circus for drag and male dancers, then return to the terrace if the music is too loud. Friday and Saturday feel fullest; a Wednesday or Thursday gives the performers more breathing room.',
      'crowd_mix', 'Gay men, Thai regulars, international visitors, couples, queer women and straight friends share the tables. The paired food-and-show format is more mixed and accessible than a male-only club. Locals and tourists both appear, but Soi 4''s visitor traffic remains impossible to miss from the pavement seats.',
      'dress_code', 'Soi 4 casual with permission to sparkle: a light dinner shirt, shorts or trousers, dress, trainers or comfortable sandals all work. No formal door policy is published. Choose a look that can handle food, a close drag stage and humid pavement seating, and carry small notes if you plan to tip performers.',
      'staff_inclusivity', 'Recent guests, including a woman visiting with her girlfriend, describe kind staff, easy cross-service between the sister bars and a genuinely inclusive mood. Reviews also mention occasional slow service and a split between loud interior and relaxed terrace. The present welcome signal is broad and unusually warm.',
      'venue_classification', 'active_paired_gay_bar_restaurant_and_drag_show_venue_with_shared_service',
      'source_urls', to_jsonb(array[
        'https://www.grindr.com/blog',
        'https://wanderlog.com/place/details/4543634/circus-silom-soi-4',
        'https://www.reddit.com/r/ThailandTourism/comments/191lno8',
        'https://www.reddit.com/r/DragRaceThailand/comments/1cuv8ys',
        'https://www.reddit.com/r/ThailandTourism/comments/ylriet'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_sister_venue_shared_service_table_and_show_arrival_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/4543634/circus-silom-soi-4','https://www.grindr.com/blog','https://www.reddit.com/r/ThailandTourism/comments/191lno8']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_wednesday_sunday_nine_pm_show_and_weekend_atmosphere_evidence','source_urls',to_jsonb(array['https://wanderlog.com/place/details/4543634/circus-silom-soi-4','https://www.reddit.com/r/DragRaceThailand/comments/1cuv8ys','https://www.grindr.com/blog']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_local_foreign_gay_male_couple_queer_woman_and_ally_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/4543634/circus-silom-soi-4','https://www.grindr.com/blog','https://www.reddit.com/r/DragRaceThailand/comments/1cuv8ys']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','casual_dinner_drag_terrace_context_with_no_published_formal_code','source_urls',to_jsonb(array['https://wanderlog.com/place/details/4543634/circus-silom-soi-4','https://www.grindr.com/blog']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_cross_service_couple_queer_woman_and_general_welcome_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/4543634/circus-silom-soi-4','https://www.reddit.com/r/ThailandTourism/comments/191lno8','https://www.reddit.com/r/DragRaceThailand/comments/1cuv8ys']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1951::bigint, jsonb_build_object(
      'queue_wait', 'Arrival follows five-star hotel rhythms: check-in peaks when tour groups and flights converge, while the large lobby usually absorbs it. Direct booking and loyalty status can change benefits. The pool is spacious but may close for weather or maintenance, so confirm access before building a recovery day around it.',
      'best_nights', 'Use it as a calm resort-style reset between Bangkok nights. Weekdays generally keep the pool and breakfast room gentler; major Pride, Songkran and circuit weekends bring more gay guests and stronger rates. Silom is a BTS or taxi trip away, so this suits travellers who want nightlife access without sleeping inside it.',
      'crowd_mix', 'International leisure guests, business travellers, families, airline and tour groups share a mainstream luxury hotel. Gay couples and party visitors are actively courted, especially around major events, but they are one visible segment rather than the whole house. The pool and gym create the most social overlap.',
      'dress_code', 'Relaxed five-star polish is enough: resort wear at the pool, smart casual for restaurants and normal city clothes elsewhere. There is no queer-scene dress expectation. A balcony room adds private outdoor space; bring a cover-up between room and pool, and save the harness or club look for the actual party venue.',
      'staff_inclusivity', 'The hotel explicitly welcomes gay travellers and sells same-sex wedding services, while guests repeatedly praise attentive teams and personalised care. That is stronger evidence than a rainbow logo alone. It remains a large chain, so report any mismatch between the written welcome and an individual interaction.',
      'venue_classification', 'active_mainstream_five_star_hotel_with_explicit_gay_travel_and_same_sex_wedding_positioning',
      'source_urls', to_jsonb(array[
        'https://www.pullmanbangkokkingpower.com/gay-hotel-in-bangkok/',
        'https://all.accor.com/hotel/6323/index.en.shtml',
        'https://www.tripadvisor.com/Hotel_Review-g293916-d729376-Reviews-Pullman_Bangkok_King_Power-Bangkok.html',
        'https://www.booking.com/hotel/th/pullman-bangkok-king-power.en-gb.html',
        'https://www.expedia.co.uk/Bangkok-Hotels-Pullman-Bangkok-King-Power.h1781323.Hotel-Information',
        'https://www.pullmanbangkokkingpower.com/offers/mid-year-sale/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_large_hotel_arrival_pool_access_and_loyalty_booking_context','source_urls',to_jsonb(array['https://all.accor.com/hotel/6323/index.en.shtml','https://www.tripadvisor.com/Hotel_Review-g293916-d729376-Reviews-Pullman_Bangkok_King_Power-Bangkok.html','https://www.booking.com/hotel/th/pullman-bangkok-king-power.en-gb.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_current_gay_event_base_positioning_and_quiet_resort_style_consensus','source_urls',to_jsonb(array['https://www.pullmanbangkokkingpower.com/gay-hotel-in-bangkok/','https://www.tripadvisor.com/Hotel_Review-g293916-d729376-Reviews-Pullman_Bangkok_King_Power-Bangkok.html','https://www.pullmanbangkokkingpower.com/offers/mid-year-sale/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','mainstream_multi_segment_hotel_with_explicit_gay_couple_and_party_marketing','source_urls',to_jsonb(array['https://www.pullmanbangkokkingpower.com/gay-hotel-in-bangkok/','https://all.accor.com/hotel/6323/index.en.shtml','https://www.booking.com/hotel/th/pullman-bangkok-king-power.en-gb.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','pool_restaurant_and_five_star_hotel_context_with_no_queer_specific_code','source_urls',to_jsonb(array['https://www.pullmanbangkokkingpower.com/gay-hotel-in-bangkok/','https://all.accor.com/hotel/6323/index.en.shtml','https://www.tripadvisor.com/Hotel_Review-g293916-d729376-Reviews-Pullman_Bangkok_King_Power-Bangkok.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_gay_travel_same_sex_wedding_and_strong_current_hospitality_evidence','source_urls',to_jsonb(array['https://www.pullmanbangkokkingpower.com/gay-hotel-in-bangkok/','https://www.tripadvisor.com/Hotel_Review-g293916-d729376-Reviews-Pullman_Bangkok_King_Power-Bangkok.html','https://www.expedia.co.uk/Bangkok-Hotels-Pullman-Bangkok-King-Power.h1781323.Hotel-Information']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (547::bigint, jsonb_build_object(
      'queue_wait', 'Open daily from early afternoon to 11 pm, Senso works by therapist availability rather than a nightlife line. Walk-ins can choose from the men present, but booking gives more control over timing and profile. Ask the manager to state the treatment, total price, included tip and duration before anyone leaves reception.',
      'best_nights', 'Go in the afternoon for the widest choice and a calmer arrival; later appointments fit naturally before Silom bars but may narrow availability. Day of week matters less than the therapist roster. This is a one-to-one erotic massage purchase, so communication and skill beat chasing a busy Friday mood.',
      'crowd_mix', 'The service is explicitly men massaging men, drawing gay male tourists, local clients and visitors using the Silom scene. Guests choose among different male body types and presentation. It is private and transactional rather than a community hangout, not a mixed LGBTQ+ wellness space.',
      'dress_code', 'Arrive in ordinary clean street clothes; each treatment room has its own shower and the venue supplies the practical transition. There is no fashion code. Bring only the money and valuables you can manage, state boundaries before the massage and remember that paying for intimacy never replaces mutual consent.',
      'staff_inclusivity', 'Guests praise a clean space, clear reception explanation and some skilled, kind therapists. Others report expensive sessions, weak technique and pressure for extra tips despite an inclusive-price promise. The men-for-men welcome is clear; write down the agreed total and boundaries first.',
      'venue_classification', 'active_gay_male_erotic_massage_club_with_private_shower_rooms',
      'source_urls', to_jsonb(array[
        'https://sensomenclub.com/menu/',
        'https://wanderlog.com/place/details/5100579/senso-man-club',
        'https://gaytabi.com/bangkok/venue/show/sensomensclub',
        'https://www.gay-travel.net/hotspots/bangkok/bars',
        'https://es.travelgay.com/venue/senso-mens-club'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_current_daily_hours_reservation_therapist_choice_and_price_consensus','source_urls',to_jsonb(array['https://sensomenclub.com/menu/','https://wanderlog.com/place/details/5100579/senso-man-club','https://gaytabi.com/bangkok/venue/show/sensomensclub']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_daily_roster_based_private_service_model_not_event_driven','source_urls',to_jsonb(array['https://sensomenclub.com/menu/','https://wanderlog.com/place/details/5100579/senso-man-club','https://www.gay-travel.net/hotspots/bangkok/bars']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_men_for_men_private_transactional_service_and_silom_client_context','source_urls',to_jsonb(array['https://sensomenclub.com/menu/','https://www.gay-travel.net/hotspots/bangkok/bars','https://gaytabi.com/bangkok/venue/show/sensomensclub']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','private_room_shower_and_erotic_service_consent_practical_context','source_urls',to_jsonb(array['https://sensomenclub.com/menu/','https://wanderlog.com/place/details/5100579/senso-man-club']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','material_mixed_current_cleanliness_manager_skill_price_and_tip_pressure_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/5100579/senso-man-club','https://sensomenclub.com/menu/','https://es.travelgay.com/venue/senso-mens-club']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (542::bigint, jsonb_build_object(
      'queue_wait', 'The venue opens around 5:30 pm and the two street-facing terraces are the prize. They are easy early, then fill as Soi 4 becomes its own theatre; food and indoor seating remain useful when the front is packed. Large groups should arrive before the Friday-Saturday rush rather than expecting one long table late.',
      'best_nights', 'Come early any day for dinner and conversation, or Friday and Saturday for maximum people-watching. Karaoke, live music and rotating events add reasons beyond the terrace; the current monthly programme is worth checking. This is a starting-and-staying bar, not only a holding pen before the clubs.',
      'crowd_mix', 'Gay men form the core, with longtime Thai and expat regulars, international tourists, couples and friends passing through one of Silom''s most visible rooms. The crowd skews more conversational and age-mixed than a circuit floor. Visitors are abundant, but 27 years of operation gives the pub genuine local memory.',
      'dress_code', 'Casual and comfortable wins: a clean tee or short-sleeve shirt, shorts or trousers and walkable shoes. There is no selective door code. Dress for dinner, pavement heat and maybe karaoke rather than a fashion audition. Keep a small bag tucked in at the busy terrace and a light layer for air-conditioning inside.',
      'staff_inclusivity', 'Friendly, dependable service and good food recur across current and long-term guest accounts, and the business openly identifies as a gay pub. Its scale can mean slower moments when every terrace table orders together. The broad evidence supports a welcoming stop for solo travellers, couples and returning regulars.',
      'venue_classification', 'active_long_running_gay_pub_restaurant_with_twin_terraces_karaoke_and_live_music',
      'source_urls', to_jsonb(array[
        'https://balconypub.com/',
        'https://www.tripadvisor.co.uk/Restaurant_Review-g293916-d1034371-Reviews-Balcony-Bangkok.html',
        'https://www.travelgay.com/venue/the-balcony',
        'https://whereis.gay/listing/balcony/',
        'https://www.gay-travel.net/hotspots/bangkok/bars',
        'https://www.gayout.com/asia-aus/thailand/bangkok/gay-heritage/silom-soi-4'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_current_opening_twin_terrace_and_peak_table_consensus','source_urls',to_jsonb(array['https://balconypub.com/','https://whereis.gay/listing/balcony/','https://www.travelgay.com/venue/the-balcony']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_monthly_programme_karaoke_live_music_food_and_weekend_consensus','source_urls',to_jsonb(array['https://balconypub.com/','https://www.tripadvisor.co.uk/Restaurant_Review-g293916-d1034371-Reviews-Balcony-Bangkok.html','https://www.travelgay.com/venue/the-balcony']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_gay_male_thai_expat_tourist_age_mixed_and_long_running_community_consensus','source_urls',to_jsonb(array['https://balconypub.com/','https://www.tripadvisor.co.uk/Restaurant_Review-g293916-d1034371-Reviews-Balcony-Bangkok.html','https://www.gayout.com/asia-aus/thailand/bangkok/gay-heritage/silom-soi-4']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','casual_pub_restaurant_terrace_context_with_no_selective_code','source_urls',to_jsonb(array['https://balconypub.com/','https://whereis.gay/listing/balcony/','https://www.gay-travel.net/hotspots/bangkok/bars']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_and_long_term_service_food_solo_couple_and_regular_welcome_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Restaurant_Review-g293916-d1034371-Reviews-Balcony-Bangkok.html','https://www.travelgay.com/venue/the-balcony','https://balconypub.com/']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (544, 539, 1954, 546, 1948, 1951, 547, 542)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
