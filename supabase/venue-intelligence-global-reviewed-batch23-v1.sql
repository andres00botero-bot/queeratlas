-- Queer Atlas venue intelligence: global review-led editorial pass, batch 23.
-- Athens hotels, nightlife, sauna, cultural venue and correctly classified
-- district, beach and public-park context. Checked 2026-08-05. Source names
-- remain in evidence metadata rather than reader-facing copy.

begin;

with reviewed(id, patch) as (
  values
    (1884::bigint, jsonb_build_object(
      'queue_wait', 'This is a 164-room hotel, not a nightlife door. Any wait is more likely at reception, breakfast or the compact lifts than outside. The 24-hour desk makes late arrival practical, but send your arrival time and reserve rooftop dining ahead if the view is part of the plan.',
      'best_nights', 'Choose the stay for Omonia transport and the rooftop, not a queer programme. Sunset drinks give the retro hotel its most cinematic moment; weekdays feel calmer, while a weekend suits guests who enjoy central-city energy. For LGBTQ+ nightlife, travel onward to a named event or Gazi venue.',
      'crowd_mix', 'International city-break guests, couples, families and work travellers make up the house. The design and rooftop attract a style-aware crowd, but this is a mainstream hotel rather than a queer social hub. Recent reviews mix many nationalities; no dependable local-versus-tourist ratio is published.',
      'dress_code', 'The sixties-inspired interiors invite a polished look, yet practical smart-casual is plenty: clean trainers, relaxed tailoring, a dress or good holiday basics. Rooftop dinner feels sharper than breakfast or the gym. Pack for Athens heat and add one camera-ready layer instead of treating it like a club door.',
      'staff_inclusivity', 'Recent guests repeatedly describe warm, helpful reception and quick problem-solving, with occasional service lapses in a busy city hotel. Booking channels state that all sexual orientations and gender identities are welcome. That supports couple-friendly confidence, though no specialist queer programme was found.',
      'venue_classification', 'mainstream_retro_design_hotel_not_a_queer_venue',
      'source_urls', to_jsonb(array[
        'https://brownhotels.com/brown-acropol-hotel',
        'https://brownhotels.com/brown-acropol-hotel-rooftop',
        'https://www.booking.com/hotel/gr/brown-acropol.en-gb.html',
        'https://www.booking.com/reviews/gr/hotel/brown-acropol.en-gb.html?page=1',
        'https://www.tripadvisor.com/Hotel_Review-g189400-d19525668-Reviews-Brown_Acropol-Athens_Attica.html',
        'https://www.hotels.com/ho1820800/brown-acropol-a-member-of-brown-hotels-athens-greece/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_official_hotel_model_and_guest_flow_consensus','source_urls',to_jsonb(array['https://brownhotels.com/brown-acropol-hotel','https://www.booking.com/hotel/gr/brown-acropol.en-gb.html','https://www.tripadvisor.com/Hotel_Review-g189400-d19525668-Reviews-Brown_Acropol-Athens_Attica.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_official_rooftop_offer_and_hotel_classification','source_urls',to_jsonb(array['https://brownhotels.com/brown-acropol-hotel-rooftop','https://brownhotels.com/brown-acropol-hotel','https://www.booking.com/reviews/gr/hotel/brown-acropol.en-gb.html?page=1']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','mainstream_hotel_classification_and_current_guest_consensus','source_urls',to_jsonb(array['https://www.booking.com/hotel/gr/brown-acropol.en-gb.html','https://www.tripadvisor.com/Hotel_Review-g189400-d19525668-Reviews-Brown_Acropol-Athens_Attica.html','https://guide.michelin.com/at/en/hotels-stays/athens/brown-acropol-by-brown-hotels-12009']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','design_hotel_and_rooftop_context_no_published_code','source_urls',to_jsonb(array['https://brownhotels.com/brown-acropol-hotel','https://brownhotels.com/brown-acropol-hotel-rooftop','https://guide.michelin.com/at/en/hotels-stays/athens/brown-acropol-by-brown-hotels-12009']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_general_hospitality_plus_explicit_booking_platform_welcome','source_urls',to_jsonb(array['https://www.booking.com/reviews/gr/hotel/brown-acropol.en-gb.html?page=1','https://www.tripadvisor.com/Hotel_Review-g189400-d19525668-Reviews-Brown_Acropol-Athens_Attica.html','https://www.hotels.com/ho1820800/brown-acropol-a-member-of-brown-hotels-athens-greece/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (328::bigint, jsonb_build_object(
      'queue_wait', 'Entry is usually walk-in, but the official pattern puts the real rush between 4 and 9 pm. A recent Sunday visitor waited about five minutes for a locker when the building was full. Go at 3-4 pm or after 10 pm for breathing room; Tuesday is closed and under-18s are not admitted.',
      'best_nights', 'Sunday afternoon is the strongest all-round bet. Wednesday is Bear Day, with the first Wednesday often reaching Sunday energy; Monday targets men under 30. Friday can still be quiet, and very hot summer days pull locals toward beaches. Aim for 5-8 pm and check the current theme before leaving.',
      'crowd_mix', 'This is a men-only sauna with locals, business visitors and tourists spread across four floors. The house says most guests are 25-65, especially 35-55; bear nights lean older and hairier, while Monday courts under-30s. Recent visits describe a mixed-age crowd rather than one narrow body type.',
      'dress_code', 'Street clothes disappear into the locker: towel, shower sandals and comfort in wet and dark areas matter more than an outfit. Bring preferred condoms, lube and toiletries because recent accounts say supplies can be inconsistent. Phones and cameras stay away from every play and changing space.',
      'staff_inclusivity', 'Most recent visitors describe a welcoming desk, constant cleaning and respectful guests, including reassuring first-timer experiences. Others report a cool atmosphere, weak steam or jacuzzi heat and poor access to safer-sex supplies; older complaints about rude or ageist treatment also remain on record.',
      'venue_classification', 'active_men_only_gay_sauna_with_age_and_bear_theme_days',
      'source_urls', to_jsonb(array[
        'https://www.flexsauna.com.gr/',
        'https://wanderlog.com/place/details/8189765/flex-sauna',
        'https://whereis.gay/flex-sauna',
        'https://athens.gaycities.com/bathhouses/303600-flex-sauna',
        'https://www.travelgay.com/venue/flex-sauna?replytocom=52902',
        'https://www.reddit.com/r/AskGaybrosOver30/comments/1qwmoiz/whats_the_gay_scene_like_in_athensgreece_in/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_current_official_peak_hours_with_recent_locker_wait_report','source_urls',to_jsonb(array['https://www.flexsauna.com.gr/','https://wanderlog.com/place/details/8189765/flex-sauna','https://whereis.gay/flex-sauna']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_current_official_weekly_pattern_supported_by_recent_reviews','source_urls',to_jsonb(array['https://www.flexsauna.com.gr/','https://wanderlog.com/place/details/8189765/flex-sauna','https://whereis.gay/flex-sauna']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_official_age_profile_and_current_mixed_crowd_consensus','source_urls',to_jsonb(array['https://www.flexsauna.com.gr/','https://wanderlog.com/place/details/8189765/flex-sauna','https://www.reddit.com/r/askgaybros/comments/1q3kq06/bearolder_men_sauna_in_europe/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','sauna_format_and_current_facility_supply_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/8189765/flex-sauna','https://whereis.gay/flex-sauna','https://www.flexsauna.com.gr/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','mixed_current_and_historical_service_consensus_with_facility_caveats','source_urls',to_jsonb(array['https://wanderlog.com/place/details/8189765/flex-sauna','https://whereis.gay/flex-sauna','https://athens.gaycities.com/bathhouses/303600-flex-sauna']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (329::bigint, jsonb_build_object(
      'queue_wait', 'Gazi is a neighbourhood, so there is no shared queue or entrance. Door pressure begins only at the bar, club or sauna you choose, often well after midnight. Save a specific address before arriving: walking the district without a destination can mean quiet blocks between genuinely busy rooms.',
      'best_nights', 'Friday and Saturday offer the widest choice, but Athens runs late: drinks first, dancing after midnight and full rooms closer to 1-2 am. A listed queer event can make another night better. Check the venue calendar and the last metro; late transport planning matters more than being first in the district.',
      'crowd_mix', 'Gazi is the recognised centre of Athens LGBTQ+ clubbing, but it is also a broad nightlife and restaurant district. Gay men are highly visible around specific bars; queer club nights, straight groups, local students and tourists overlap elsewhere. No single crowd ratio applies across its streets.',
      'dress_code', 'The pavement has no code. Casual Athens nightwear works for most bars, while a themed queer party, fetish room or glossy mainstream club may ask for a clearer look. Wear shoes for uneven streets and heat, then dress to the actual door policy—not to the idea that an entire district shares one mood.',
      'staff_inclusivity', 'A neighbourhood has no common staff, security team or complaints route. Many established LGBTQ+ venues sit here, yet standards differ at every door and can change with an event promoter. Use venue-level reviews, keep your group connected after dark and report concerns to the place that actually hosted you.',
      'venue_classification', 'lgbtq_nightlife_district_not_a_physical_venue',
      'record_status', 'misclassified_non_venue_district',
      'source_urls', to_jsonb(array[
        'https://www.thisisathens.org/nightlife/clubs/lgbt-gay-friendly-bars-clubs',
        'https://mygreecetours.org/gazi-athens/',
        'https://www.athens24.com/guide/nightlife-in-gazi.html',
        'https://www.reddit.com/r/GreeceTravel/comments/1sudjoj/solo_travel_to_athens/',
        'https://www.reddit.com/r/GreeceTravel/comments/1s52drg/how_is_athens_safe_for_a_young_male_gay_couple/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','district_classification_and_venue_specific_access_consensus','source_urls',to_jsonb(array['https://www.thisisathens.org/nightlife/clubs/lgbt-gay-friendly-bars-clubs','https://mygreecetours.org/gazi-athens/','https://www.athens24.com/guide/nightlife-in-gazi.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_local_late_night_pattern_and_event_specific_guidance','source_urls',to_jsonb(array['https://www.athens24.com/guide/nightlife-in-gazi.html','https://www.thisisathens.org/nightlife/clubs/lgbt-gay-friendly-bars-clubs','https://www.reddit.com/r/GreeceTravel/comments/1sudjoj/solo_travel_to_athens/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_city_guide_and_current_district_consensus','source_urls',to_jsonb(array['https://www.thisisathens.org/nightlife/clubs/lgbt-gay-friendly-bars-clubs','https://mygreecetours.org/gazi-athens/','https://www.reddit.com/r/GreeceTravel/comments/1sudjoj/solo_travel_to_athens/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','district_level_practical_guidance_with_venue_variance','source_urls',to_jsonb(array['https://www.thisisathens.org/nightlife/clubs/lgbt-gay-friendly-bars-clubs','https://www.athens24.com/guide/nightlife-in-gazi.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','no_shared_staff_or_policy_across_multi_venue_district','source_urls',to_jsonb(array['https://www.thisisathens.org/nightlife/clubs/lgbt-gay-friendly-bars-clubs','https://mygreecetours.org/gazi-athens/','https://www.reddit.com/r/GreeceTravel/comments/1s52drg/how_is_athens_safe_for_a_young_male_gay_couple/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (322::bigint, jsonb_build_object(
      'queue_wait', 'The tiny room can be oversold and sightlines disappear behind the central booth. Friday and Saturday shows start late, commonly around 1 am; arrive near the 11 pm opening and ask where you can actually see. A table improves comfort, but premium table terms should be confirmed before paying.',
      'best_nights', 'Friday or Saturday is the choice because the club currently operates as a two-night drag cabaret. Saturday brings maximum theatre and crowd heat; Friday can feel a shade easier. Plan for a full late show rather than one quick drink—recent guests stayed through long, high-energy sets into the small hours.',
      'crowd_mix', 'Local regulars, queer couples, gay men, tourists and friends across generations pack the room. The stage gives queens of different ages a place to perform, and the crowd is broader than a youth-only club. Much of the comedy is Greek, yet visitors say the lip-sync, emotion and camp still travel.',
      'dress_code', 'There is no formal code: colourful, camp, glamorous or plain black all fit. What matters is standing comfortably in a tight, warm room and keeping bags small enough not to block the aisle. Dress for old-school Athenian cabaret, not velvet-rope judgment, and leave the queens their spotlight.',
      'staff_inclusivity', 'Warm welcomes, polite door staff and attentive table service appear often in recent accounts, alongside a strong sense of trans-led queer history. The weak point is crowd management: some guests felt packed behind poor sightlines or pressured toward costly tables. Hospitality is loved; capacity deserves scrutiny.',
      'venue_classification', 'long_running_trans_led_lgbtq_drag_cabaret_club',
      'source_urls', to_jsonb(array[
        'https://www.facebook.com/Kouklesclubathens/',
        'https://wanderlog.com/place/details/1641215/koukles-club-drag-queen-show',
        'https://www.tripadvisor.com/Attraction_Review-g189400-d15739760-Reviews-Koukles_Club-Athens_Attica.html',
        'https://develop.thisisathens.org/pdf/LGBTQ_Athens_8.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_hours_capacity_and_sightline_review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1641215/koukles-club-drag-queen-show','https://www.tripadvisor.com/Attraction_Review-g189400-d15739760-Reviews-Koukles_Club-Athens_Attica.html','https://www.facebook.com/Kouklesclubathens/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_two_night_schedule_and_late_show_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1641215/koukles-club-drag-queen-show','https://www.tripadvisor.com/Attraction_Review-g189400-d15739760-Reviews-Koukles_Club-Athens_Attica.html','https://www.facebook.com/Kouklesclubathens/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_multi_source_review_consensus_and_official_city_context','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1641215/koukles-club-drag-queen-show','https://www.tripadvisor.com/Attraction_Review-g189400-d15739760-Reviews-Koukles_Club-Athens_Attica.html','https://develop.thisisathens.org/pdf/LGBTQ_Athens_8.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_no_code_review_consensus_and_room_practicality','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1641215/koukles-club-drag-queen-show','https://www.tripadvisor.com/Attraction_Review-g189400-d15739760-Reviews-Koukles_Club-Athens_Attica.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_welcome_consensus_with_capacity_management_caveat','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1641215/koukles-club-drag-queen-show','https://www.tripadvisor.com/Attraction_Review-g189400-d15739760-Reviews-Koukles_Club-Athens_Attica.html','https://www.facebook.com/Kouklesclubathens/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1881::bigint, jsonb_build_object(
      'queue_wait', 'There is no ticket line: Limanakia is a chain of rocky public coves. The real competition is for a flat ledge and a safe route into the water. Reach the gay-popular second cove earlier on hot summer days, allow time to find the unsigned path and do not attempt the descent in flimsy sandals.',
      'best_nights', 'This is a daytime summer ritual, not a night venue. Late morning through afternoon brings swimming and the strongest social crowd; sunset turns the farther coves cruisier but makes rock access harder. Choose clear weather and daylight for a first visit, especially if you are travelling alone.',
      'crowd_mix', 'The second cove is predominantly gay men, with Athens regulars, island-bound visitors and expats sharing the rocks; naturists and other swimmers also appear. Farther sections can feel more sexual and male-dominated. It is socially mixed by passport, but not equally comfortable for every gender or group.',
      'dress_code', 'Swimwear is optional in the established naturist areas, but water shoes are close to essential. Bring water, sunscreen, shade, a towel and a small bag you can watch while swimming; snack service is too inconsistent to rely on. Consent still applies when nudity and cruising share the same coastline.',
      'staff_inclusivity', 'There are no venue staff, lifeguard team or queer hosts to solve a problem. The atmosphere is long-established and accepting for gay men, yet access is steep, amenities are minimal and some visitors feel exposed in the cruisier coves. Go with someone you trust and keep control of valuables.',
      'venue_classification', 'public_rocky_naturist_cove_with_established_gay_male_gathering_area',
      'record_status', 'misclassified_non_venue_public_beach',
      'source_urls', to_jsonb(array[
        'https://www.travelgay.com/athens-gay-beach-guide',
        'https://wanderlog.com/place/details/4293062/limanakia-beach',
        'https://www.timeout.com/athens/things-to-do/best-beaches-near-athens',
        'https://www.gaycities.com/articles/101633/what-to-expect-at-greeces-most-famous-gay-clothing-optional-beaches/',
        'https://develop.thisisathens.org/pdf/LGBTQ_Athens_8.pdf',
        'https://www.thisisathens.org/sites/default/files/2020-07/athens-riviera.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','public_cove_classification_and_current_access_capacity_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/athens-gay-beach-guide','https://wanderlog.com/place/details/4293062/limanakia-beach','https://www.thisisathens.org/sites/default/files/2020-07/athens-riviera.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','daytime_beach_pattern_and_after_sunset_cruising_context','source_urls',to_jsonb(array['https://www.travelgay.com/athens-gay-beach-guide','https://www.gaycities.com/articles/101633/what-to-expect-at-greeces-most-famous-gay-clothing-optional-beaches/','https://www.timeout.com/athens/things-to-do/best-beaches-near-athens']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_guide_and_review_consensus_with_gender_comfort_caveat','source_urls',to_jsonb(array['https://www.travelgay.com/athens-gay-beach-guide','https://wanderlog.com/place/details/4293062/limanakia-beach','https://www.timeout.com/athens/things-to-do/best-beaches-near-athens']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','naturist_custom_and_current_access_amenity_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/4293062/limanakia-beach','https://www.travelgay.com/athens-gay-beach-guide','https://develop.thisisathens.org/pdf/LGBTQ_Athens_8.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','unstaffed_public_space_with_current_safety_and_comfort_context','source_urls',to_jsonb(array['https://wanderlog.com/place/details/4293062/limanakia-beach','https://www.timeout.com/athens/things-to-do/best-beaches-near-athens','https://www.reddit.com/r/GreeceTravel/comments/1tqagbp/not_safe_for_women/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (856::bigint, jsonb_build_object(
      'queue_wait', 'There is no door or queue: this record points to a large public park with a historic, informal cruising signal. Do not expect a marked LGBTQ+ area, host or reliable gathering. Daylight paths can be busy with ordinary park life; after dark, visibility and help thin out quickly.',
      'best_nights', 'For the park itself, daytime is the only responsible first-visit recommendation. Cruising listings mention men meeting day and night, but that is not a staffed programme or safety guarantee. If connection is the goal, choose a current queer venue instead of building an evening around an isolated park path.',
      'crowd_mix', 'Most people here are walkers, neighbours, families and park users—not a queer crowd. Historic cruising accounts describe men of varied ages finding one another discreetly in limited areas. That layer is informal and may shift; never read every lone visitor, glance or quiet path as sexual interest.',
      'dress_code', 'Wear ordinary park clothes and shoes for long paths, with a small secure bag. There is no fetish code or permission implied by how anyone is dressed. Avoid displaying valuables, keep your phone available for navigation rather than photography and treat every interaction as requiring clear, mutual consent.',
      'staff_inclusivity', 'No queer staff or safeguarding team oversees informal encounters. Recent local accounts find the park pleasant by day but still advise more caution toward Victoria and nearby blocks after dark; a 2025 neighbourhood report also records renewed disorder in parts of the park. Trust conditions, not an old listing.',
      'venue_classification', 'public_city_park_with_historical_informal_male_cruising_signal_not_a_venue',
      'record_status', 'misclassified_non_venue_public_park',
      'source_urls', to_jsonb(array[
        'https://pediontouareostoparkomas.gr/en/about/',
        'https://pediontouareostoparkomas.gr/magazine-article/paravatikotita-sto-pedion-tou-areos/',
        'https://www.cruisinggays.com/athens/areas/11649-pedion-areos-park/',
        'https://www.reddit.com/r/Athens_Greece/comments/1v5i7qj/victory_inn_near_pedion_areos/',
        'https://www.reddit.com/r/GreeceTravel/comments/1ixyu39/is_pedion_tou_areos_park_athens_still_dangerous/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','public_park_classification_and_informal_cruising_listing','source_urls',to_jsonb(array['https://pediontouareostoparkomas.gr/en/about/','https://www.cruisinggays.com/athens/areas/11649-pedion-areos-park/','https://www.reddit.com/r/Athens_Greece/comments/1v5i7qj/victory_inn_near_pedion_areos/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','informal_day_and_night_signal_overridden_by_current_safety_context','source_urls',to_jsonb(array['https://www.cruisinggays.com/athens/areas/11649-pedion-areos-park/','https://www.reddit.com/r/Athens_Greece/comments/1v5i7qj/victory_inn_near_pedion_areos/','https://pediontouareostoparkomas.gr/magazine-article/paravatikotita-sto-pedion-tou-areos/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_public_park_context_with_historical_cruising_layer','source_urls',to_jsonb(array['https://pediontouareostoparkomas.gr/en/about/','https://www.cruisinggays.com/athens/areas/11649-pedion-areos-park/','https://theses.gla.ac.uk/2653/1/2008DendrinosPhD.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','unstaffed_public_space_practical_and_consent_guidance','source_urls',to_jsonb(array['https://pediontouareostoparkomas.gr/en/about/','https://www.cruisinggays.com/athens/areas/11649-pedion-areos-park/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','no_queer_staff_with_current_local_and_neighbourhood_safety_reports','source_urls',to_jsonb(array['https://pediontouareostoparkomas.gr/magazine-article/paravatikotita-sto-pedion-tou-areos/','https://www.reddit.com/r/Athens_Greece/comments/1v5i7qj/victory_inn_near_pedion_areos/','https://www.reddit.com/r/GreeceTravel/comments/1ixyu39/is_pedion_tou_areos_park_athens_still_dangerous/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (326::bigint, jsonb_build_object(
      'queue_wait', 'Romantso changes shape with its programme: daytime café and exhibitions can be easy walk-ins, while a concert or queer club night has doors, tickets and real capacity. Recent events sell advance and door tickets separately. Book the event you want and arrive near doors for a clean first look at the building.',
      'best_nights', 'There is no honest fixed best night. Follow the calendar: the former printworks hosts concerts, comedy, workshops, raves and recurring queer concepts, with many strong dates toward the weekend. A named queer night is the reason to go; an ordinary event should not be assumed LGBTQ+-centred.',
      'crowd_mix', 'Artists, creative workers, music heads and international visitors use the building by day and night. Queer comedy and club programmes bring an openly LGBTQ+ audience; a general concert can be much more mixed. Expect a younger cultural crowd overall, with the exact gender and tourist balance set by the bill.',
      'dress_code', 'Most events suit expressive but practical creative-city clothes. Queer parties can invite fantasy, kink or a theme—one recent carnival explicitly encouraged cosmic glamour—while talks and concerts stay casual. Check the flyer, wear danceable shoes and remember the surrounding Omonia streets on the journey home.',
      'staff_inclusivity', 'The venue repeatedly hosts events that explicitly call themselves queer spaces, and recent visitors praise the atmosphere, bar and staff. That is strong programme-level evidence, not proof that every booking has the same care team. Use the named promoter for consent or access questions on a particular night.',
      'venue_classification', 'independent_cultural_hub_with_recurring_explicit_queer_programming',
      'source_urls', to_jsonb(array[
        'https://www.romantso.gr/?Lang=En',
        'https://www.romantso.gr/event.php?id=307',
        'https://romantso.gr/event.php?id=242',
        'https://www.romantso.gr/event.php?id=284',
        'https://romantso.gr.new.bios.gr/event.php?id=263',
        'https://wanderlog.com/place/details/1306633/romantso',
        'https://www.reddit.com/r/Athens_Greece/comments/1t9yogl/any_queer_friendly_clubs_recommended/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_event_specific_ticketing_and_multi_format_venue_consensus','source_urls',to_jsonb(array['https://www.romantso.gr/?Lang=En','https://romantso.gr.new.bios.gr/event.php?id=322','https://romantso.gr.new.bios.gr/event.php?id=263']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_current_calendar_with_recurring_queer_and_general_programming','source_urls',to_jsonb(array['https://www.romantso.gr/?Lang=En','https://www.romantso.gr/event.php?id=307','https://romantso.gr/event.php?id=242','https://www.romantso.gr/event.php?id=284']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','creative_hub_classification_and_event_dependent_review_consensus','source_urls',to_jsonb(array['https://www.romantso.gr/?Lang=En','https://wanderlog.com/place/details/1306633/romantso','https://www.romantso.gr/event.php?id=284']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_current_theme_example_and_programme_specific_variance','source_urls',to_jsonb(array['https://romantso.gr.new.bios.gr/event.php?id=263','https://www.romantso.gr/event.php?id=307','https://wanderlog.com/place/details/1306633/romantso']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','repeated_explicit_queer_space_programming_and_positive_current_reviews','source_urls',to_jsonb(array['https://www.romantso.gr/event.php?id=307','https://romantso.gr/event.php?id=242','https://www.romantso.gr/event.php?id=284','https://wanderlog.com/place/details/1306633/romantso']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (324::bigint, jsonb_build_object(
      'queue_wait', 'Rooster is an all-day café-bar, so the usual wait is for a terrace table or someone to take the order—not a club queue. The square-facing seats are the prize and can be busy at brunch or evening drinks. Go before the rush, catch a server''s eye and reserve if a group needs one table.',
      'best_nights', 'Daylight coffee, lunch and early evening people-watching show Rooster at its most distinct. Friday and Saturday add music and a livelier square, but it closes around 1 am and works better as a first drink than an all-night destination. A sunny weekday afternoon is ideal for solo visitors who want conversation.',
      'crowd_mix', 'Gay men remain highly visible, joined by queer friends, local regulars, tourists, couples and the general Monastiraki crowd. The central terrace is more mixed than a dedicated club and especially visitor-friendly. It feels like a queer anchor in public view, not a sealed room with an LGBTQ+-only audience.',
      'dress_code', 'Come exactly as you would for a central Athens café: shorts, linen, trainers, sunglasses, office clothes or a sharper pre-club look all work. There is no door test. Choose for heat and terrace comfort, then add personality if Rooster is the opening scene of a longer queer night.',
      'staff_inclusivity', 'Recent guests still call the room friendly, chatty and genuinely LGBTQ+-welcoming, including positive solo and couple visits. Service is the uneven part: multiple accounts describe being overlooked or waiting too long even when quiet. The welcome feels real, but gentle persistence may be needed to order.',
      'venue_classification', 'long_running_lgbtq_identified_all_day_cafe_bar_with_mixed_public_crowd',
      'source_urls', to_jsonb(array[
        'https://roostercafe.gr/',
        'https://www.tripadvisor.com.au/Restaurant_Review-g189400-d3983454-Reviews-Rooster-Athens_Attica.html',
        'https://wanderlog.com/es/place/details/2157320/rooster',
        'https://maps.apple.com/place?place-id=I87DCD215A1D81C91',
        'https://www.thisisathens.org/nightlife/clubs/lgbt-gay-friendly-bars-clubs',
        'https://www.reddit.com/r/GreeceTravel/comments/1s52drg/how_is_athens_safe_for_a_young_male_gay_couple/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_official_table_service_model_and_mixed_wait_consensus','source_urls',to_jsonb(array['https://roostercafe.gr/','https://www.tripadvisor.com.au/Restaurant_Review-g189400-d3983454-Reviews-Rooster-Athens_Attica.html','https://maps.apple.com/place?place-id=I87DCD215A1D81C91']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_official_all_day_hours_and_review_led_visit_pattern','source_urls',to_jsonb(array['https://roostercafe.gr/','https://www.tripadvisor.com.au/Restaurant_Review-g189400-d3983454-Reviews-Rooster-Athens_Attica.html','https://wanderlog.com/es/place/details/2157320/rooster']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_lgbtq_identity_with_current_mixed_local_and_tourist_consensus','source_urls',to_jsonb(array['https://roostercafe.gr/','https://www.thisisathens.org/nightlife/clubs/lgbt-gay-friendly-bars-clubs','https://www.tripadvisor.com.au/Restaurant_Review-g189400-d3983454-Reviews-Rooster-Athens_Attica.html','https://www.reddit.com/r/GreeceTravel/comments/1s52drg/how_is_athens_safe_for_a_young_male_gay_couple/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','all_day_cafe_bar_context_with_no_published_door_code','source_urls',to_jsonb(array['https://roostercafe.gr/','https://wanderlog.com/es/place/details/2157320/rooster','https://www.thisisathens.org/nightlife/clubs/lgbt-gay-friendly-bars-clubs']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','current_lgbtq_welcome_consensus_with_repeated_slow_service_caveat','source_urls',to_jsonb(array['https://www.tripadvisor.com.au/Restaurant_Review-g189400-d3983454-Reviews-Rooster-Athens_Attica.html','https://maps.apple.com/place?place-id=I87DCD215A1D81C91','https://www.reddit.com/r/GreeceTravel/comments/1s52drg/how_is_athens_safe_for_a_young_male_gay_couple/']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (1884, 328, 329, 322, 1881, 856, 326, 324)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
