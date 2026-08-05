-- Queer Atlas venue intelligence: global review-led editorial pass, batch 26.
-- Bali and Bangkok nightlife, wellness, accommodation and sauna records.
-- Checked 2026-08-05. Source names remain in evidence metadata rather than
-- reader-facing copy.

begin;

with reviewed(id, patch) as (
  values
    (1156::bigint, jsonb_build_object(
      'queue_wait', 'This is a nightlife strip, not one venue, so there is no shared queue. BaliJoe and Mixwell are the two consistently active gay-bar anchors; each has its own door and crowd. Walk the block before choosing, and expect bar space rather than the pavement to become the bottleneck near midnight.',
      'best_nights', 'Friday and Saturday bring the surest late-night pulse, while a weekday makes the drag shows and bar-hopping easier to navigate. Begin around 9:30-10:30 pm and let the street build toward midnight. Check same-day posts: older guides still list businesses here that have already closed.',
      'crowd_mix', 'International holidaymakers are highly visible, with Balinese and other Indonesian regulars, expats and returning visitors in the mix. Gay men remain the centre of gravity; queer women and straight friends do come, but this is not an evenly balanced all-identities district. Each doorway feels slightly different.',
      'dress_code', 'There is no street-wide dress code. Light shirts, tanks, shorts, trainers or secure sandals fit the tropical bar scene, with extra sparkle welcome for drag. Keep the bag compact, protect phone and cash in the late crowd, and book a safe ride rather than treating the whole road as one managed venue.',
      'staff_inclusivity', 'The corridor has no single owner, security team or inclusion policy. Current visitors speak warmly about the active drag bars, but service and safety belong to the business you enter. Judge each door separately, keep control of drink and bill, and do not mistake the street''s queer reputation for shared accountability.',
      'venue_classification', 'lgbtq_nightlife_corridor_not_a_physical_venue',
      'record_status', 'misclassified_non_venue_corridor',
      'source_urls', to_jsonb(array[
        'https://www.reddit.com/r/gaytravel/comments/1uv2gzn/gay_friendly_bars_sanur_bali/',
        'https://www.reddit.com/r/BaliTravelTips/comments/1sq26b9/weird_question/',
        'https://www.reddit.com/r/indonesia/comments/1tnz2sk/straight_girl_here_di_bali_ternyata_ada_open_queer_club_ya/',
        'https://www.reddit.com/r/BaliTravelTips/comments/1uly7yr/big_clubs/',
        'https://www.travelgay.com/bali-gay-bars-and-dance-clubs',
        'https://finnsbeachclub.com/wp-content/uploads/2025/10/The-Ultimate-Bali-Travel-Guide_-Everything-You-Need-To-Know-To-Visit-Bali-With-Confidence.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','non_venue_corridor_with_current_two_anchor_bar_consensus','source_urls',to_jsonb(array['https://www.reddit.com/r/gaytravel/comments/1uv2gzn/gay_friendly_bars_sanur_bali/','https://www.reddit.com/r/BaliTravelTips/comments/1sq26b9/weird_question/','https://www.travelgay.com/bali-gay-bars-and-dance-clubs']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_weekend_nightlife_pattern_and_stale_listing_caveat','source_urls',to_jsonb(array['https://www.reddit.com/r/BaliTravelTips/comments/1uly7yr/big_clubs/','https://www.reddit.com/r/BaliTravelTips/comments/1sq26b9/weird_question/','https://www.travelgay.com/bali-gay-bars-and-dance-clubs']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_gay_male_local_tourist_ally_corridor_consensus','source_urls',to_jsonb(array['https://www.reddit.com/r/indonesia/comments/1tnz2sk/straight_girl_here_di_bali_ternyata_ada_open_queer_club_ya/','https://www.reddit.com/r/gaytravel/comments/1uv2gzn/gay_friendly_bars_sanur_bali/','https://finnsbeachclub.com/wp-content/uploads/2025/10/The-Ultimate-Bali-Travel-Guide_-Everything-You-Need-To-Know-To-Visit-Bali-With-Confidence.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','multi_venue_tropical_nightlife_context_no_shared_code','source_urls',to_jsonb(array['https://www.travelgay.com/bali-gay-bars-and-dance-clubs','https://www.reddit.com/r/BaliTravelTips/comments/1uly7yr/big_clubs/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','no_shared_management_with_positive_active_bar_and_general_safety_consensus','source_urls',to_jsonb(array['https://www.reddit.com/r/BaliTravelTips/comments/1uly7yr/big_clubs/','https://www.reddit.com/r/indonesia/comments/1tnz2sk/straight_girl_here_di_bali_ternyata_ada_open_queer_club_ya/','https://www.travelgay.com/bali-gay-bars-and-dance-clubs']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1155::bigint, jsonb_build_object(
      'queue_wait', 'This all-day bar and restaurant is usually an easy arrival before the show. Daily drag starts at 6:30 pm, so claim a table around 6 if the performance matters; weekends naturally tighten the room. Later visitors can still drop in for cocktails, but dinner seating gives the cleanest first look.',
      'best_nights', 'There is a drag show every evening, making the right night more about mood than availability. Try an early weekday for food, cocktails and close-up comedy; Friday or Saturday adds a louder holiday crowd and more dancing. Arriving for the 6:30 show also leaves the Seminyak strip open afterward.',
      'crowd_mix', 'Local performers and hospitality staff meet LGBTQ+ travellers, Bali residents, couples and allies in a deliberately broad Pride-branded room. Gay men are prominent without owning the entire atmosphere. Compared with the tiny late bars nearby, the restaurant format makes an easier first stop for mixed groups.',
      'dress_code', 'Resort-casual works from lunch through drag: linen, shorts, a bright shirt, dress, trainers or polished sandals. No formal door code is published, and individuality is part of the pitch. Choose something cool enough for Bali and camera-ready enough for a show table if that makes the evening more fun.',
      'staff_inclusivity', 'Recent guests describe friendly staff, entertaining queens, strong cocktails and a spacious welcome, matching the venue''s explicit LGBTQ+ and ally positioning. That is a promising current signal rather than a guarantee for every shift. Respect the performers, tip well and raise any problem directly with management.',
      'venue_classification', 'active_lgbtq_entertainment_bar_restaurant_with_daily_drag',
      'source_urls', to_jsonb(array[
        'https://stonewallbali.com/',
        'https://www.tripadvisor.com.au/Restaurant_Review-g297697-d27409274-Reviews-Stonewall_Bali-Kuta_Kuta_District_Badung_Regency_Bali.html',
        'https://wanderlog.com/place/details/12553922/stonewall-bali',
        'https://www.instagram.com/stonewall_bali/',
        'https://www.reddit.com/r/indonesia/comments/1tnz2sk/straight_girl_here_di_bali_ternyata_ada_open/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_current_all_day_hours_and_daily_show_start_with_capacity_consensus','source_urls',to_jsonb(array['https://stonewallbali.com/','https://www.tripadvisor.com.au/Restaurant_Review-g297697-d27409274-Reviews-Stonewall_Bali-Kuta_Kuta_District_Badung_Regency_Bali.html','https://wanderlog.com/place/details/12553922/stonewall-bali']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_daily_drag_programme_and_weekend_atmosphere_consensus','source_urls',to_jsonb(array['https://stonewallbali.com/','https://www.instagram.com/stonewall_bali/','https://www.tripadvisor.com.au/Restaurant_Review-g297697-d27409274-Reviews-Stonewall_Bali-Kuta_Kuta_District_Badung_Regency_Bali.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_lgbtq_local_traveller_ally_positioning_and_current_review_consensus','source_urls',to_jsonb(array['https://stonewallbali.com/','https://wanderlog.com/place/details/12553922/stonewall-bali','https://www.reddit.com/r/indonesia/comments/1tnz2sk/straight_girl_here_di_bali_ternyata_ada_open/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','all_day_restaurant_and_drag_context_with_no_published_formal_code','source_urls',to_jsonb(array['https://stonewallbali.com/','https://www.instagram.com/stonewall_bali/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_hospitality_and_explicit_lgbtq_ally_welcome_evidence','source_urls',to_jsonb(array['https://stonewallbali.com/','https://www.tripadvisor.com.au/Restaurant_Review-g297697-d27409274-Reviews-Stonewall_Bali-Kuta_Kuta_District_Badung_Regency_Bali.html','https://wanderlog.com/place/details/12553922/stonewall-bali']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1162::bigint, jsonb_build_object(
      'queue_wait', 'Popular drop-in classes can fill, and the campus takes a first visit longer to understand than a small studio. Arrive early enough to register and find the shala, but know that staff may hold people downstairs while the previous class is cleaned. Festival workshops are explicitly first come, first served.',
      'best_nights', 'This is better chosen by teacher and practice than by nightlife logic. A normal morning class gives the green campus at its calmest; sound healing, ecstatic dance or festival dates feel far more social and crowded. Read the level and format carefully, then choose quiet practice or community energy on purpose.',
      'crowd_mix', 'International wellness travellers, teacher trainees, solo visitors and long-stay Ubud regulars dominate, with beginners and experienced practitioners sharing a huge programme. It is welcoming in a broad wellness sense, but it is not an LGBTQ+-specific hub and no current queer programme or crowd balance is established.',
      'dress_code', 'Wear practical yoga clothing that stays secure through the movement, and bring a cover-up for the walk through Ubud. Shoes come off for practice; a bottle and minimal belongings keep arrival simple. This is not a fashion door, though the social-media crowd can make the campus feel more styled than a local studio.',
      'staff_inclusivity', 'Many visitors praise attentive teachers, friendly teams and options for different bodies, including lower-key choices. Others report impatient front-desk service and an overly commercial mood. No queer-specific inclusion or safeguarding policy was found, so describe it as broadly open, not queer-verified.',
      'venue_classification', 'mainstream_large_yoga_wellness_and_festival_campus_not_queer_specific',
      'source_urls', to_jsonb(array[
        'https://theyogabarn.com/about/',
        'https://theyogabarn.com/wp-content/uploads/2025/12/Studio-Guidelines-A4-1.pdf',
        'https://www.tripadvisor.com/Attraction_Review-g297701-d1506742-Reviews-The_Yoga_Barn-Ubud_Gianyar_Regency_Bali.html',
        'https://www.balispiritfestival.com/faqs',
        'https://www.balispiritfestival.com/about-us/vision-and-mission/',
        'https://www.reddit.com/r/yoga/comments/1c26lme',
        'https://www.reddit.com/r/BaliTravelTips/comments/1izusjr',
        'https://www.reddit.com/r/bali/comments/1tp4teh/is_ubud_actually_social_for_solo_travelers/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_popularity_cleaning_flow_and_first_come_festival_evidence','source_urls',to_jsonb(array['https://www.balispiritfestival.com/faqs','https://www.reddit.com/r/yoga/comments/1c26lme','https://www.tripadvisor.com/Attraction_Review-g297701-d1506742-Reviews-The_Yoga_Barn-Ubud_Gianyar_Regency_Bali.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_multi_format_class_event_and_festival_programme_evidence','source_urls',to_jsonb(array['https://theyogabarn.com/about/','https://www.balispiritfestival.com/faqs','https://www.tripadvisor.com/Attraction_Review-g297701-d1506742-Reviews-The_Yoga_Barn-Ubud_Gianyar_Regency_Bali.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','mainstream_international_wellness_audience_with_no_queer_specific_programme_found','source_urls',to_jsonb(array['https://theyogabarn.com/about/','https://www.balispiritfestival.com/about-us/vision-and-mission/','https://www.reddit.com/r/bali/comments/1tp4teh/is_ubud_actually_social_for_solo_travelers/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','official_studio_guidelines_and_practical_yoga_context','source_urls',to_jsonb(array['https://theyogabarn.com/wp-content/uploads/2025/12/Studio-Guidelines-A4-1.pdf','https://theyogabarn.com/about/','https://www.reddit.com/r/yoga/comments/1c26lme']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','mixed_current_teacher_front_desk_and_accessibility_consensus_limited_queer_evidence','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g297701-d1506742-Reviews-The_Yoga_Barn-Ubud_Gianyar_Regency_Bali.html','https://www.reddit.com/r/BaliTravelTips/comments/1izusjr','https://theyogabarn.com/about/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (543::bigint, jsonb_build_object(
      'queue_wait', 'The show room is intimate, with roughly 50 seats in one recent account, so the practical wait is finding a good table rather than clearing a velvet rope. Standard admission has recently been around 380 baht with one drink. Special circuit nights can use a separate late door, cover and ticket-at-door system.',
      'best_nights', 'Come in the evening for drag and erotic stage numbers; stay much later only when the club advertises a circuit takeover. One 2026 special opened at 1 am with the main DJ at 3. A normal weekday can be easier for the show, while Friday and Saturday deliver the fuller, louder Silom experience.',
      'crowd_mix', 'Gay male tourists and regional visitors form much of the audience, joined by Thai regulars, drag fans and friends exploring Soi 4. The performers span drag artists and male dancers, so the room moves between cabaret and adult nightlife. It feels visitor-facing rather than like a quiet neighbourhood local.',
      'dress_code', 'Casual Bangkok clubwear is enough: a light shirt or tank, shorts or trousers and shoes that survive a late walk through Silom. There is no published general dress code. Bring small notes for performers, understand what the first drink covers, and keep phone and valuables with you in the compact room.',
      'staff_inclusivity', 'Current reviews split sharply: some call the team warm and the performers talented, while others find the show tired, drinks expensive or lost-property handling troubling. The venue is explicitly gay and trans-performer-forward, but identity welcome does not erase service concerns. Confirm prices before ordering.',
      'venue_classification', 'active_gay_show_bar_and_late_night_club_with_drag_and_male_dancers',
      'source_urls', to_jsonb(array[
        'https://banana-roomclub.com/',
        'https://wanderlog.com/place/details/4639745/banana-room-club',
        'https://www.pridethailand.com/news/banana-room-club-108',
        'https://bangkok.gaycities.com/bars/309399-banana-bar-on',
        'https://whereis.gay/listing/banana-bar/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_small_capacity_entry_price_and_special_event_door_evidence','source_urls',to_jsonb(array['https://banana-roomclub.com/','https://wanderlog.com/place/details/4639745/banana-room-club','https://www.pridethailand.com/news/banana-room-club-108']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_show_programme_and_explicit_2026_late_circuit_schedule','source_urls',to_jsonb(array['https://banana-roomclub.com/','https://wanderlog.com/place/details/4639745/banana-room-club','https://www.pridethailand.com/news/banana-room-club-108']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_gay_show_bar_drag_male_dancer_and_visitor_facing_consensus','source_urls',to_jsonb(array['https://banana-roomclub.com/','https://wanderlog.com/place/details/4639745/banana-room-club','https://bangkok.gaycities.com/bars/309399-banana-bar-on']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','casual_show_bar_context_with_no_published_general_code_and_tipping_evidence','source_urls',to_jsonb(array['https://banana-roomclub.com/','https://wanderlog.com/place/details/4639745/banana-room-club']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','material_mixed_current_performer_service_price_and_lost_property_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/4639745/banana-room-club','https://whereis.gay/listing/banana-bar/','https://banana-roomclub.com/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1952::bigint, jsonb_build_object(
      'queue_wait', 'Plan around hotel procedure, not a club line: check-in begins after 2 pm, luggage storage may not be available and the main gate closes after midnight, when guests use a back route. Sauna visitors tend to arrive from mid-afternoon, so shared showers, pool and reception feel busier later in the day.',
      'best_nights', 'Choose this for a social gay stay with sauna access, not a polished city hotel. One or two nights work well if meeting other men is the point; weekdays are calmer, while weekend afternoons and evenings bring more outside bathhouse energy. Ari cafés are the reset when the complex feels too enclosed.',
      'crowd_mix', 'Solo gay male travellers are the clearest guest group, with couples and repeat visitors alongside Thai and international men using the connected sauna. The dorm can be genuinely social and flirtatious; it is an adults-only, male-oriented environment rather than a broadly mixed LGBTQ+ hostel.',
      'dress_code', 'There is no fashion code. Pack easy hostel clothes, swimwear for the pool, secure sandals and a small robe or cover-up if preferred between wet areas. Rooms and lockers can be tight, so travel light and keep valuables controlled. For Ari streets and breakfast, ordinary Bangkok-casual is perfect.',
      'staff_inclusivity', 'Verified guests often praise friendly, helpful staff, generous breakfast and the ease of gay socialising. Others report unanswered messages, unattended checkout, tired bathrooms and uneven cleaning, including a bedbug allegation. The identity fit is strong; service and maintenance depend more on the day and room.',
      'venue_classification', 'active_adults_only_gay_poshtel_integrated_with_male_sauna_and_pool',
      'source_urls', to_jsonb(array[
        'https://www.booking.com/hotel/th/blu-cabin-ari-poshtel.html',
        'https://www.booking.com/reviews/th/hotel/blu-cabin-ari-poshtel.en-gb.html',
        'https://www.agoda.com/blu-cabin-gay-poshtel/reviews/bangkok-th.html',
        'https://www.expedia.co.uk/Bangkok-Hotels-Blu-Cabin-Ari-Stylish-Gay-Poshtel.h32488825.Hotel-Information',
        'https://ph.trip.com/hotels/bangkok-hotel-detail-28082114/blu-cabin-ari-stylish-gay-poshtel/review.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_verified_checkin_gate_luggage_and_shared_facility_flow_evidence','source_urls',to_jsonb(array['https://www.booking.com/reviews/th/hotel/blu-cabin-ari-poshtel.en-gb.html','https://www.agoda.com/blu-cabin-gay-poshtel/reviews/bangkok-th.html','https://www.booking.com/hotel/th/blu-cabin-ari-poshtel.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_sauna_integrated_social_stay_and_guest_use_consensus','source_urls',to_jsonb(array['https://www.agoda.com/blu-cabin-gay-poshtel/reviews/bangkok-th.html','https://www.booking.com/reviews/th/hotel/blu-cabin-ari-poshtel.en-gb.html','https://www.expedia.co.uk/Bangkok-Hotels-Blu-Cabin-Ari-Stylish-Gay-Poshtel.h32488825.Hotel-Information']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_gay_male_adult_property_and_current_solo_couple_sauna_guest_consensus','source_urls',to_jsonb(array['https://www.booking.com/hotel/th/blu-cabin-ari-poshtel.html','https://www.agoda.com/blu-cabin-gay-poshtel/reviews/bangkok-th.html','https://www.booking.com/reviews/th/hotel/blu-cabin-ari-poshtel.en-gb.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','hostel_pool_sauna_practical_context_with_tight_storage_evidence','source_urls',to_jsonb(array['https://www.agoda.com/blu-cabin-gay-poshtel/reviews/bangkok-th.html','https://www.booking.com/hotel/th/blu-cabin-ari-poshtel.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_gay_social_fit_with_mixed_current_service_cleanliness_and_maintenance_consensus','source_urls',to_jsonb(array['https://www.booking.com/reviews/th/hotel/blu-cabin-ari-poshtel.en-gb.html','https://www.agoda.com/blu-cabin-gay-poshtel/reviews/bangkok-th.html','https://ph.trip.com/hotels/bangkok-hotel-detail-28082114/blu-cabin-ari-stylish-gay-poshtel/review.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1953::bigint, jsonb_build_object(
      'queue_wait', 'Check-in is the only planned wait, currently listed from 2-11 pm. The property is hidden in a small lane and has no lift, so finding it and carrying bags upstairs matter more than reception queues. Keep the access card handy and choose a bathroom on your floor if stairs or late-night movement are concerns.',
      'best_nights', 'Stay here for a low-cost Silom base, not a hostel party in its own right. Friday and Saturday put the district''s queer bars and clubs at their busiest; a weekday gives easier sleep and transport. The common-area atmosphere is inconsistent, so plan your social night outside and use the hostel to reset.',
      'crowd_mix', 'The beds draw international budget travellers, solo backpackers and couples of different genders. Its Silom address is convenient for LGBTQ+ nightlife, but the hostel is not queer-specific and current evidence does not show a queer-majority crowd. Treat location and community identity as separate things.',
      'dress_code', 'Anything clean and hostel-practical works. Carry shower clothes between shared bathrooms, leave shoes where the property instructs and keep valuables in the provided locker. With no lift and Bangkok humidity, light luggage beats a styled arrival. Pack earplugs and your own preferred toiletries for the dorm.',
      'staff_inclusivity', 'Recent verified stays often call staff kind and cooperative, but experiences of cleanliness, communication and security are uneven. One woman reported men using bathrooms signed for women, which weakens the gender-comfort signal. No LGBTQ+-specific training or policy was found; this is mainstream budget hospitality.',
      'venue_classification', 'active_mainstream_budget_hostel_near_silom_lgbtq_nightlife_not_queer_specific',
      'source_urls', to_jsonb(array[
        'https://www.booking.com/hotel/th/brb-hostel-bangkok-silom.html',
        'https://www.booking.com/reviews/th/hotel/brb-hostel-bangkok-silom.html',
        'https://www.hostelworld.com/hostels/p/272887/brb-hostel-bangkok-silom/',
        'https://www.expedia.com.sg/Bangkok-Hotels-BRB-Hostel-Bangkok-Silom.h17091266.Hotel-Information',
        'https://www.tripadvisor.co.uk/Hotel_Review-g293916-d12089588-Reviews-BRB_Hostel_Bangkok_Silom-Bangkok.html',
        'https://www.makemytrip.global/hotels-international/en-bd/thailand/bangkok-hotels/review-of-brb_hostel_bangkok_silom-details.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_checkin_wayfinding_no_lift_and_access_card_evidence','source_urls',to_jsonb(array['https://www.booking.com/hotel/th/brb-hostel-bangkok-silom.html','https://www.tripadvisor.co.uk/Hotel_Review-g293916-d12089588-Reviews-BRB_Hostel_Bangkok_Silom-Bangkok.html','https://www.hostelworld.com/hostels/p/272887/brb-hostel-bangkok-silom/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','mainstream_accommodation_with_silom_weekend_access_and_inconsistent_social_atmosphere','source_urls',to_jsonb(array['https://www.hostelworld.com/hostels/p/272887/brb-hostel-bangkok-silom/','https://www.booking.com/reviews/th/hotel/brb-hostel-bangkok-silom.html','https://www.booking.com/hotel/th/brb-hostel-bangkok-silom.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','mainstream_mixed_budget_traveller_property_with_no_queer_specific_positioning','source_urls',to_jsonb(array['https://www.booking.com/hotel/th/brb-hostel-bangkok-silom.html','https://www.hostelworld.com/hostels/p/272887/brb-hostel-bangkok-silom/','https://www.expedia.com.sg/Bangkok-Hotels-BRB-Hostel-Bangkok-Silom.h17091266.Hotel-Information']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','shared_hostel_facility_locker_shoe_and_no_lift_practical_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Hotel_Review-g293916-d12089588-Reviews-BRB_Hostel_Bangkok_Silom-Bangkok.html','https://www.booking.com/hotel/th/brb-hostel-bangkok-silom.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','mixed_current_verified_service_cleanliness_security_and_gender_comfort_evidence','source_urls',to_jsonb(array['https://www.booking.com/reviews/th/hotel/brb-hostel-bangkok-silom.html','https://www.expedia.com.sg/Bangkok-Hotels-BRB-Hostel-Bangkok-Silom.h17091266.Hotel-Information','https://www.makemytrip.global/hotels-international/en-bd/thailand/bangkok-hotels/review-of-brb_hostel_bangkok_silom-details.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (545::bigint, jsonb_build_object(
      'queue_wait', 'Published hours start at 3 pm Monday-Thursday and 2 pm Friday-Sunday, with closing at midnight. Entry is typically handled at reception with a locker and drink rather than a club queue. The maze-like six-floor layout is the real delay: arrive before the evening rush and learn the stairs while lights are clearer.',
      'best_nights', 'Late Friday through Sunday afternoon and evening gives the broadest chance of a lively crowd; after-work hours around 6-9 pm are a sensible target. Activity nights can shift energy to one floor, so check the current feed. Choose a quieter weekday if rooftop soaking and exploring matter more than numbers.',
      'crowd_mix', 'Thai and other Asian gay men form the core, with international sauna travellers, younger men, older regulars and a real range of bodies in the building. Some current accounts also perceive commercial encounters. It is male and sexually social rather than a broad all-genders queer wellness space.',
      'dress_code', 'Street clothes go into the locker; towel, shower sandals and little else are the practical uniform inside. Wet stairs and very dark areas make secure footing more important than looks. Bring only essentials, follow consent every time, use the safer-sex supplies you trust and keep track of the locker key.',
      'staff_inclusivity', 'Recent experiences are unusually divided. Some older visitors felt warmly received by polite, helpful staff and found age no barrier when boundaries were respected; others report rude reception, poor English support, dirt and overdue maintenance. Queer purpose is clear, but service and hygiene are not reliably premium.',
      'venue_classification', 'active_multi_level_gay_male_sauna_with_rooftop_pool_onsen_and_cruise_areas',
      'source_urls', to_jsonb(array[
        'https://www.vckcoolspace.com/',
        'https://www.thegayagenda.fyi/bangkok/businesses/chakran-sauna/',
        'https://gayandasia.com/en/v/chakran',
        'https://www.tripadvisor.com/Attraction_Review-g293916-d2557384-Reviews-Chakran_Sauna-Bangkok.html',
        'https://www.reddit.com/r/ThailandTourism/comments/1dy461j/recommendations_on_bangkok_gay_saunas_and_bars/',
        'https://www.reddit.com/r/gaysian/comments/1gxa75n/bangkok_gay_saunabathhouse_for_small_twinks/',
        'https://www.reddit.com/r/gaysian/comments/1sc3stu/i_visited_all_15_gay_saunas_in_bangkok_here_is/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_published_hours_reception_model_and_multi_floor_navigation_consensus','source_urls',to_jsonb(array['https://www.thegayagenda.fyi/bangkok/businesses/chakran-sauna/','https://gayandasia.com/en/v/chakran','https://www.tripadvisor.com/Attraction_Review-g293916-d2557384-Reviews-Chakran_Sauna-Bangkok.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_weekend_hours_event_pattern_and_evening_crowd_consensus','source_urls',to_jsonb(array['https://www.thegayagenda.fyi/bangkok/businesses/chakran-sauna/','https://www.reddit.com/r/gaysian/comments/1sc3stu/i_visited_all_15_gay_saunas_in_bangkok_here_is/','https://www.reddit.com/r/gaysian/comments/1kv04m4']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_local_asian_tourist_age_body_and_commercial_encounter_consensus','source_urls',to_jsonb(array['https://www.reddit.com/r/gaysian/comments/1gxa75n/bangkok_gay_saunabathhouse_for_small_twinks/','https://www.reddit.com/r/AskGaybrosOver30/comments/1njxipz/gay_sauna_recommendations_for_bangkok_in_2025/','https://www.tripadvisor.com/Attraction_Review-g293916-d2557384-Reviews-Chakran_Sauna-Bangkok.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','sauna_cruise_wet_area_and_dark_stair_practical_safety_consensus','source_urls',to_jsonb(array['https://gayandasia.com/en/v/chakran','https://www.tripadvisor.com/Attraction_Review-g293916-d2557384-Reviews-Chakran_Sauna-Bangkok.html','https://www.thegayagenda.fyi/bangkok/businesses/chakran-sauna/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','material_mixed_current_age_welcome_staff_language_cleanliness_and_maintenance_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g293916-d2557384-Reviews-Chakran_Sauna-Bangkok.html','https://www.thegayagenda.fyi/bangkok/businesses/chakran-sauna/','https://www.reddit.com/r/ThailandTourism/comments/1dy461j/recommendations_on_bangkok_gay_saunas_and_bars/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (541::bigint, jsonb_build_object(
      'queue_wait', 'This is a small seated bar and restaurant, not a club door. Early evening is usually a straightforward walk-in; the outside people-watching tables are what fill first as Soi 4 wakes up. If every chair is taken, have one drink elsewhere and circle back rather than standing in a formal line.',
      'best_nights', 'Come around happy hour or after dinner for conversation, Thai food and the passing parade; Friday and Saturday add the fullest street theatre. It also works as a gentler first stop for solo visitors before the louder bars. Karaoke is sometimes available inside, but the terrace is the signature experience.',
      'crowd_mix', 'Expat regulars and international gay travellers are especially visible, mixed with Thai friends, couples and solo bar-hoppers. The crowd tends to be conversational and older than a late circuit floor. Tourists are numerous, yet familiar faces and owners greeting regulars give the tiny room a neighbourhood-bar quality.',
      'dress_code', 'Bangkok bar casual is exactly right: a breathable shirt, shorts or trousers and comfortable shoes for walking Soi 4. There is no selective dress policy and no reason to overproduce the look. A compact bag helps at the pavement tables, where people and drinks pass close by all evening.',
      'staff_inclusivity', 'The strongest theme is personal hospitality: guests praise friendly owners, attentive staff, easy solo conversation and a welcome shared by expats and tourists. The evidence is smaller than for Bangkok''s giant bars, but unusually consistent. Check the bill as normal; no material identity concern surfaced.',
      'venue_classification', 'active_small_gay_bar_restaurant_with_pavement_seating_and_expat_regulars',
      'source_urls', to_jsonb(array[
        'https://www.travelgay.com/venue/connections-bars',
        'https://www.tripadvisor.co.uk/Restaurant_Review-g293916-d4752339-Reviews-Connections_Bar_Bangkok-Bangkok.html',
        'https://www.thegayagenda.fyi/bangkok/businesses/connections-bar/',
        'https://thegaypassport.com/explore/gay-bars-bangkok/',
        'https://www.gothaibefree.com/whats-hot-in-silom-bangkoks-gay-hub/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_small_seated_bar_outdoor_table_and_operating_hour_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/connections-bars','https://www.tripadvisor.co.uk/Restaurant_Review-g293916-d4752339-Reviews-Connections_Bar_Bangkok-Bangkok.html','https://www.thegayagenda.fyi/bangkok/businesses/connections-bar/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_happy_hour_food_people_watching_and_weekend_street_context','source_urls',to_jsonb(array['https://www.travelgay.com/venue/connections-bars','https://www.tripadvisor.co.uk/Restaurant_Review-g293916-d4752339-Reviews-Connections_Bar_Bangkok-Bangkok.html','https://thegaypassport.com/explore/gay-bars-bangkok/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_expat_tourist_thai_regular_and_solo_guest_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/connections-bars','https://www.tripadvisor.co.uk/Restaurant_Review-g293916-d4752339-Reviews-Connections_Bar_Bangkok-Bangkok.html','https://www.gothaibefree.com/whats-hot-in-silom-bangkoks-gay-hub/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','casual_pavement_bar_restaurant_context_with_no_selective_code','source_urls',to_jsonb(array['https://www.travelgay.com/venue/connections-bars','https://www.tripadvisor.co.uk/Restaurant_Review-g293916-d4752339-Reviews-Connections_Bar_Bangkok-Bangkok.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_consistent_owner_staff_solo_expat_and_tourist_welcome_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/connections-bars','https://www.tripadvisor.co.uk/Restaurant_Review-g293916-d4752339-Reviews-Connections_Bar_Bangkok-Bangkok.html','https://www.thegayagenda.fyi/bangkok/businesses/connections-bar/']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (1156, 1155, 1162, 543, 1952, 1953, 545, 541)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
