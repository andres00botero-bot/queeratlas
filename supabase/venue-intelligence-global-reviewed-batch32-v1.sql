-- Queer Atlas venue intelligence: global review-led editorial pass, batch 32.
-- Four Beijing and four Beirut records, individually researched and rewritten.
-- Heaven Beer Bar is placed on hold because current sources conflict on identity, address and status.
-- Ritan Park Night Route is placed on hold because no reliable current queer-route evidence was found.
-- Sanlitun Mark Jacobs Boutique Hotel is treated as a defunct or renamed historic listing, not bookable lodging.
-- B018 is corrected from closed to reopened on 20 July 2026 after a two-year hiatus.
-- Checked 2026-08-06. Source names remain in evidence metadata, not reader-facing topic copy.

begin;

with reviewed(id, patch) as (
  values
    (1031::bigint, jsonb_build_object(
      'queue_wait', 'Do not follow the old basement pin without a same-day confirmation. Current directories still publish opening hours, but a December 2025 visitor reported this gay-bar address closed for two years, while an active mainstream business with the same Heaven name appears elsewhere near Gongti.',
      'best_nights', 'There is no responsible best-night call until the exact room is verified. If a dated post confirms the old beer-bar concept, early evening should suit fridge-browsing and conversation, with Friday or Saturday livelier. A current Heaven Supermarket listing alone does not confirm a queer venue.',
      'crowd_mix', 'The earlier bar was described as a relaxed young-local hangout where queer guests and beer lovers mixed. Today that picture is blurred by several addresses and a larger mainstream Heaven Supermarket brand. No current evidence supports a local-tourist split or even one continuous crowd under this record.',
      'dress_code', 'The remembered format was casual: tee, denim and trainers made more sense than dressed-up clubwear. Bring ID and travel light if a live listing confirms entry, but do not infer a door policy from the old bar. The similarly named mainstream venue may operate a completely different room and security setup.',
      'staff_inclusivity', 'Older guides frame the basement bar as queer-friendly, yet there is no fresh, reliable service consensus tied to that exact address. Current listings may be recycling historic copy or describing a moved mainstream chain. Inclusion cannot be promised until the operator, door and location are independently matched.',
      'venue_classification', 'identity_and_status_conflict_between_reported_closed_gay_beer_bar_and_active_moved_mainstream_heaven_supermarket',
      'record_status', 'editorial_hold_address_identity_and_current_operation_require_manual_verification',
      'identity_note', 'Sources conflict across at least three Gongti-area addresses. A December 2025 review says the old gay-bar record had been closed for two years, while current map data points to a large mainstream Heaven Supermarket at another address. Do not merge these identities automatically.',
      'source_urls', to_jsonb(array[
        'https://wanderlog.com/place/details/12107770/heaven-beer-bar',
        'https://thegaypassport.com/venue/heaven-beer-bar/',
        'https://rainbowindex.com/venue/heaven-beer-bar',
        'https://maps.apple.com/place?auid=1118368780152117&lsp=57879',
        'https://www.reddit.com/r/beijing/comments/1k5389d',
        'https://www.reddit.com/r/beijing/comments/1mx0bnh',
        'https://m.bjnews.com.cn/detail/165475239814479.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','direct_2025_closed_report_conflicts_with_current_directory_hours_and_different_active_heaven_address','source_urls',to_jsonb(array['https://wanderlog.com/place/details/12107770/heaven-beer-bar','https://thegaypassport.com/venue/heaven-beer-bar/','https://maps.apple.com/place?auid=1118368780152117&lsp=57879']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','historic_early_evening_weekend_beer_bar_pattern_with_no_verified_current_exact_venue_programme','source_urls',to_jsonb(array['https://thegaypassport.com/venue/heaven-beer-bar/','https://rainbowindex.com/venue/heaven-beer-bar','https://wanderlog.com/place/details/12107770/heaven-beer-bar']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','historic_young_local_queer_friendly_beer_crowd_confounded_by_mainstream_chain_and_multiple_addresses','source_urls',to_jsonb(array['https://wanderlog.com/place/details/12107770/heaven-beer-bar','https://rainbowindex.com/venue/heaven-beer-bar','https://maps.apple.com/place?auid=1118368780152117&lsp=57879']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','historic_casual_self_service_bar_context_without_verified_current_door_policy','source_urls',to_jsonb(array['https://thegaypassport.com/venue/heaven-beer-bar/','https://wanderlog.com/place/details/12107770/heaven-beer-bar','https://www.reddit.com/r/beijing/comments/1k5389d']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','historic_queer_friendly_positioning_without_current_exact_address_operator_or_service_consensus','source_urls',to_jsonb(array['https://rainbowindex.com/venue/heaven-beer-bar','https://thegaypassport.com/venue/heaven-beer-bar/','https://wanderlog.com/place/details/12107770/heaven-beer-bar']::text[]),'checked_at','2026-08-06T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-06T00:00:00Z'
    )),
    (1008::bigint, jsonb_build_object(
      'queue_wait', 'Ritan is a free municipal park, so there is no club-style line or host. Official hours are roughly 6 am to 9 or 10 pm by season. Use the staffed gates and current notice; this app record has no verified organiser, meeting point or queer night route attached to it.',
      'best_nights', 'Visit in daylight for the Sun Altar, old cypresses, gardens and the everyday rhythm of tai chi and walkers. It is not responsible to recommend a cruising hour here, and the gates close at night. If you want queer company, arrange a meeting at a verified public business instead.',
      'crowd_mix', 'Morning exercisers, families, embassy-district residents, walkers and visitors share this historic garden. Recent local discussion points to another Beijing park, not Ritan, for gay encounters. There is no sound basis for calling this crowd queer or inventing a locals-versus-tourists percentage.',
      'dress_code', 'Wear ordinary park clothes, comfortable shoes and seasonal layers; spring blossom visits and a one-to-two-hour walk are the natural fit. Keep your phone charged and stay on open paths. Treat every person as a park user, not as part of a coded scene, unless they clearly say otherwise.',
      'staff_inclusivity', 'Staff manage a protected public garden and heritage site, not an LGBTQ+ venue. No queer-specific welcome, moderation or safety policy could be verified. Respect closing time, avoid photographing strangers, keep meetings visible and leave if attention feels intrusive or an interaction becomes pressured.',
      'venue_classification', 'unverified_queer_night_route_in_general_public_heritage_park_not_recommended_as_cruising_destination',
      'record_status', 'editorial_hold_unverified_queer_route_requires_correction_or_removal',
      'identity_note', 'Reliable current sources identify Ritan as a daytime municipal heritage park. Research did not substantiate the named queer night route; recent local discussion instead references Dongdan Park for gay encounters. This record must not be promoted as a verified LGBTQ+ venue.',
      'source_urls', to_jsonb(array[
        'https://english.beijing.gov.cn/travellinginbeijing/focus/202005/t20200515_1898554.html',
        'https://r.visitbeijing.com.cn/attraction/93',
        'https://gygl.beijing.gov.cn/mlgy/mlgy_lsmy/201911/t20191129_733233.html',
        'https://yllhj.beijing.gov.cn/ztxx/jcyyshj/djsh/202603/t20260330_4569559.shtml',
        'https://www.reddit.com/r/beijing/comments/1s42lwp/whats_a_not_so_obvious_public_park_everyone/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_free_public_park_seasonal_gate_hours_and_no_verified_route_or_host','source_urls',to_jsonb(array['https://english.beijing.gov.cn/travellinginbeijing/focus/202005/t20200515_1898554.html','https://r.visitbeijing.com.cn/attraction/93','https://gygl.beijing.gov.cn/mlgy/mlgy_lsmy/201911/t20191129_733233.html']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','official_daytime_heritage_garden_use_and_night_closing_without_current_queer_route_evidence','source_urls',to_jsonb(array['https://english.beijing.gov.cn/travellinginbeijing/focus/202005/t20200515_1898554.html','https://r.visitbeijing.com.cn/attraction/93','https://www.reddit.com/r/beijing/comments/1s42lwp/whats_a_not_so_obvious_public_park_everyone/']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','general_exerciser_family_resident_embassy_district_and_visitor_mix_without_queer_percentage_evidence','source_urls',to_jsonb(array['https://english.visitbeijing.com.cn/article/47OMYQhI4ZU','https://yllhj.beijing.gov.cn/ztxx/jcyyshj/djsh/202603/t20260330_4569559.shtml','https://www.reddit.com/r/beijing/comments/1s42lwp/whats_a_not_so_obvious_public_park_everyone/']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','one_to_two_hour_historic_garden_walk_blossom_and_open_path_context','source_urls',to_jsonb(array['https://r.visitbeijing.com.cn/attraction/93','https://yllhj.beijing.gov.cn/ztxx/jcyyshj/djsh/202603/t20260330_4569559.shtml']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','municipal_heritage_park_scope_without_verified_lgbtq_hospitality_or_consent_management','source_urls',to_jsonb(array['https://gygl.beijing.gov.cn/mlgy/mlgy_lsmy/201911/t20191129_733233.html','https://english.beijing.gov.cn/travellinginbeijing/focus/202005/t20200515_1898554.html']::text[]),'checked_at','2026-08-06T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-06T00:00:00Z'
    )),
    (1034::bigint, jsonb_build_object(
      'queue_wait', 'Do not attempt check-in from this legacy listing. A verified guest paid in full and arrived to find the hotel closed in July 2021; earlier guests said the property had already changed its name to R-Kiss and was difficult to locate on the fifth floor of a Sanlitun SOHO office building.',
      'best_nights', 'There is no current best night because active lodging under this name cannot be verified. Historic praise focused on the central restaurant-and-shopping location, while noise, windowless rooms and hard-to-find access were recurring drawbacks. Book only a hotel with live inventory and direct confirmation.',
      'crowd_mix', 'Historic accounts describe a compact short-stay or love-hotel format used by couples, solo travellers and business visitors, not a documented queer hotel community. No current guests or staff can be tied safely to this name, so a local-tourist ratio would be fiction.',
      'dress_code', 'Not applicable while the record is inactive. If another operator now occupies the floor, its own check-in rules, government ID requirements and deposit policy apply. Do not arrive carrying assumptions from an old fashion-themed listing, and never pay a non-refundable rate without confirming the legal property name.',
      'staff_inclusivity', 'The last detailed guest reports are poor: hard-to-find entry, weak English support, disputed charges, unhelpful service and, finally, a paid booking at a closed hotel. There is no current team or LGBTQ+ policy to assess. Queer-friendly status should be removed unless a verified successor claims it.',
      'venue_classification', 'defunct_or_renamed_historic_short_stay_hotel_listing_without_verified_current_operator',
      'record_status', 'editorial_hold_historic_closed_or_rebranded_hotel_requires_removal_or_reverification',
      'identity_note', 'Verified reviews say the property was operating as R-Kiss by 2018 and was closed when a prepaid guest arrived in July 2021. Current booking aggregators still reproduce the older name and inventory shell, which is not sufficient proof of an active hotel.',
      'source_urls', to_jsonb(array[
        'https://uk.hotels.com/ho624695840/sanlitun-mark-jacobs-boutique-hotel-beijing-china/',
        'https://www.kayak.ie/Beijing-Hotels-Sanlitun-Mark-Jacobs-Boutique-Hotel.3057331.ksp',
        'https://cn.tripadvisor.com/Hotel_Review-g294212-d12263571-Reviews-Marc_Jacobs_Designer_Boutique_Hotel-Beijing.html',
        'https://www.expedia.com.hk/cn/Beijing-Hotels-Sanlitun-Mark-Jacobs-Boutique-Hotel.h19490495.Hotel-Information'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','verified_2021_paid_arrival_found_closed_after_2018_name_change_and_hidden_office_floor_access_reports','source_urls',to_jsonb(array['https://uk.hotels.com/ho624695840/sanlitun-mark-jacobs-boutique-hotel-beijing-china/','https://cn.tripadvisor.com/Hotel_Review-g294212-d12263571-Reviews-Marc_Jacobs_Designer_Boutique_Hotel-Beijing.html']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','historic_central_location_benefit_balanced_against_noise_windowless_room_and_inactive_identity_evidence','source_urls',to_jsonb(array['https://uk.hotels.com/ho624695840/sanlitun-mark-jacobs-boutique-hotel-beijing-china/','https://www.kayak.ie/Beijing-Hotels-Sanlitun-Mark-Jacobs-Boutique-Hotel.3057331.ksp']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','historic_short_stay_love_hotel_business_couple_and_solo_use_without_lgbtq_hotel_evidence','source_urls',to_jsonb(array['https://uk.hotels.com/ho624695840/sanlitun-mark-jacobs-boutique-hotel-beijing-china/','https://www.kayak.ie/Beijing-Hotels-Sanlitun-Mark-Jacobs-Boutique-Hotel.3057331.ksp']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','inactive_property_with_legacy_checkin_id_deposit_and_operator_identity_risk','source_urls',to_jsonb(array['https://www.expedia.com.hk/cn/Beijing-Hotels-Sanlitun-Mark-Jacobs-Boutique-Hotel.h19490495.Hotel-Information','https://uk.hotels.com/ho624695840/sanlitun-mark-jacobs-boutique-hotel-beijing-china/']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','historic_verified_poor_service_charge_language_and_closed_arrival_reports_without_current_lgbtq_policy','source_urls',to_jsonb(array['https://uk.hotels.com/ho624695840/sanlitun-mark-jacobs-boutique-hotel-beijing-china/','https://cn.tripadvisor.com/Hotel_Review-g294212-d12263571-Reviews-Marc_Jacobs_Designer_Boutique_Hotel-Beijing.html']::text[]),'checked_at','2026-08-06T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-06T00:00:00Z'
    )),
    (1032::bigint, jsonb_build_object(
      'queue_wait', 'This is appointment-led men-only treatment, not a sauna entrance line. The current booking page lists noon to midnight daily and asks for date, time, duration and therapist preference. Confirm the appointment and building-access instructions first; an older guest found the private complex difficult to enter.',
      'best_nights', 'Choose a weekday afternoon or early evening when you can discuss the treatment without rushing; there is no party night or social peak. Massage, scrubs, facials, waxing and hand or foot care are the core. Off-hours treatment has historically carried a surcharge, so agree on the total before arrival.',
      'crowd_mix', 'There is no shared crowd to browse. Men book private rooms for grooming or bodywork, with gay travellers included in the venue’s long-standing audience. Treat it as one-to-one wellness rather than a bathhouse, cruising space or way to meet local people.',
      'dress_code', 'Arrive clean in normal street clothes and ask how the chosen treatment is draped. For waxing or massage, state sensitive areas, pain tolerance, pressure, duration and boundaries before work begins. Keep valuables together in the private suite and clarify whether any requested service changes the price.',
      'staff_inclusivity', 'The men-only positioning is explicit. One older client praised an unhurried, courteous outcall massage and another valued the waxing skill; a separate report described poor hygiene, unfriendly service and high prices. With no fresh detailed review consensus, inspect the room and confirm every charge.',
      'venue_classification', 'currently_listed_men_only_private_day_spa_with_active_booking_page_but_stale_mixed_customer_reviews_not_social_sauna',
      'identity_note', 'The service is a private men-only day spa offering treatments in individual rooms. It should not be described as a social gay sauna or bathhouse. Current directory and booking pages remain live, but the detailed customer reviews found are old.',
      'source_urls', to_jsonb(array[
        'https://www.bj.spadefeng.com/eng/contactE.php',
        'https://www.travelgay.com/venue/spa-de-feng-for-men-only',
        'https://www.tripadvisor.com/Attraction_Review-g294212-d6781117-Reviews-Spa_de_Feng-Beijing.html',
        'https://www.waxingsociety.com/contactus.html',
        'https://spartacus.gayguide.travel/goingout/beijing/70022_SPA%2Bde%2BFeng%2Bfor%2BMen%2Bonly',
        'https://thegaypassport.com/venue/spa-de-feng-for-men-only/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','live_appointment_form_daily_noon_midnight_hours_and_old_private_complex_access_difficulty','source_urls',to_jsonb(array['https://www.bj.spadefeng.com/eng/contactE.php','https://www.travelgay.com/venue/spa-de-feng-for-men-only','https://www.tripadvisor.com/Attraction_Review-g294212-d6781117-Reviews-Spa_de_Feng-Beijing.html']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','private_treatment_menu_off_hours_surcharge_and_non_social_appointment_context','source_urls',to_jsonb(array['https://www.bj.spadefeng.com/eng/contactE.php','https://www.travelgay.com/venue/spa-de-feng-for-men-only','https://www.waxingsociety.com/contactus.html']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_men_only_private_room_gay_traveller_wellness_scope_without_shared_sauna_crowd','source_urls',to_jsonb(array['https://www.travelgay.com/venue/spa-de-feng-for-men-only','https://spartacus.gayguide.travel/goingout/beijing/70022_SPA%2Bde%2BFeng%2Bfor%2BMen%2Bonly','https://www.bj.spadefeng.com/eng/contactE.php']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','private_massage_waxing_grooming_draping_price_and_boundary_context','source_urls',to_jsonb(array['https://www.travelgay.com/venue/spa-de-feng-for-men-only','https://www.tripadvisor.com/Attraction_Review-g294212-d6781117-Reviews-Spa_de_Feng-Beijing.html','https://www.waxingsociety.com/contactus.html']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_men_only_scope_with_old_positive_courtesy_and_skill_reports_balanced_against_hygiene_service_price_complaint','source_urls',to_jsonb(array['https://www.travelgay.com/venue/spa-de-feng-for-men-only','https://www.tripadvisor.com/Attraction_Review-g294212-d6781117-Reviews-Spa_de_Feng-Beijing.html']::text[]),'checked_at','2026-08-06T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-06T00:00:00Z'
    )),
    (1782::bigint, jsonb_build_object(
      'queue_wait', 'The bunker reopened on 20 July 2026 after two silent years, so no stable new-era wait average exists yet. Its membership list is open and the venue publishes 7 pm until late. Apply or follow the dated event instructions before travelling; the club’s old fame included genuinely long, selective doors.',
      'best_nights', 'Pick the programme, not inherited folklore. The rebuilt room keeps the retractable roof and DJ-in-the-crowd layout, now with a fully analogue sound system. Historic Thursday nostalgia was legendary, but only the new calendar can tell you which night carries that spirit after the relaunch.',
      'crowd_mix', 'Beirut electronic-music regulars, returning alumni, younger dancers, diaspora visitors and international club travellers all have reasons to test the rebirth. The venue is mixed rather than gay-only, yet LGBTQ+ people were part of its earliest cross-community dance floor and remain woven into its story.',
      'dress_code', 'Think intentional underground clubwear, not gala polish: dark layers, a sharp tee, breathable trousers and shoes built for hours on concrete. The new membership process matters more than labels. Carry valid ID, keep bags minimal and check the event notice for any age, ticket or door condition.',
      'staff_inclusivity', 'Its founding idea brought communities together when the city was divided, including queer guests rarely visible elsewhere. That legacy is powerful, but the 2026 team and door need fresh evaluation after a two-year reset. Historic reviews split between respectful entry and unexplained rejection.',
      'venue_classification', 'active_reopened_july_2026_membership_led_underground_electronic_club_with_mixed_queer_inclusive_history',
      'record_status', 'active_reopened_2026_monitor_new_reviews_and_programme',
      'identity_note', 'The club closed in March 2024 during a management and land dispute, then reopened in the original Karantina bunker on 20 July 2026. Earlier closed-status copy is obsolete; new-era queue, door and service patterns still need time to form.',
      'source_urls', to_jsonb(array[
        'https://today.lorientlejour.com/article/1541682/as-b018-reopens-can-beiruts-famous-underground-club-live-up-to-its-golden-days.html',
        'https://www.beirut.com/fr/778373/liconique-b018-de-beyrouth-rouvre-ses-portes-en-juillet/',
        'https://platinumlist.net/guide/b018-is-back-whats-new-inside-the-beiruts-iconic-underground-club/',
        'https://www.b018members.com/',
        'https://www.lemonde.fr/series-d-ete/article/2024/08/07/le-b018-temple-disparu-des-nuits-beyrouthines-cette-boite-de-nuit-a-aide-a-la-coexistence-entre-les-musulmans-et-les-chretiens_6270923_3451060.html',
        'https://www.tripadvisor.com/Attraction_Review-g294005-d555752-Reviews-B018-Beirut.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','confirmed_20_july_2026_reopening_open_membership_application_hours_and_historic_selective_queue_evidence','source_urls',to_jsonb(array['https://today.lorientlejour.com/article/1541682/as-b018-reopens-can-beiruts-famous-underground-club-live-up-to-its-golden-days.html','https://www.b018members.com/','https://www.tripadvisor.com/Attraction_Review-g294005-d555752-Reviews-B018-Beirut.html']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','new_retractable_roof_dj_in_crowd_analogue_sound_system_and_historic_thursday_context_without_mature_new_calendar_consensus','source_urls',to_jsonb(array['https://platinumlist.net/guide/b018-is-back-whats-new-inside-the-beiruts-iconic-underground-club/','https://www.lemonde.fr/series-d-ete/article/2024/08/07/le-b018-temple-disparu-des-nuits-beyrouthines-cette-boite-de-nuit-a-aide-a-la-coexistence-entre-les-musulmans-et-les-chretiens_6270923_3451060.html']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','historic_local_cross_community_lgbtq_diaspora_and_international_crowd_with_relaunch_generation_change','source_urls',to_jsonb(array['https://www.lemonde.fr/series-d-ete/article/2024/08/07/le-b018-temple-disparu-des-nuits-beyrouthines-cette-boite-de-nuit-a-aide-a-la-coexistence-entre-les-musulmans-et-les-chretiens_6270923_3451060.html','https://today.lorientlejour.com/article/1541682/as-b018-reopens-can-beiruts-famous-underground-club-live-up-to-its-golden-days.html']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','membership_led_underground_dance_room_id_ticket_age_and_event_specific_door_context','source_urls',to_jsonb(array['https://www.b018members.com/','https://platinumlist.net/guide/b018-is-back-whats-new-inside-the-beiruts-iconic-underground-club/','https://www.tripadvisor.com/Attraction_Review-g294005-d555752-Reviews-B018-Beirut.html']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','historic_cross_community_and_lgbtq_inclusion_balanced_against_old_mixed_door_reports_and_new_team_evidence_gap','source_urls',to_jsonb(array['https://www.lemonde.fr/series-d-ete/article/2024/08/07/le-b018-temple-disparu-des-nuits-beyrouthines-cette-boite-de-nuit-a-aide-a-la-coexistence-entre-les-musulmans-et-les-chretiens_6270923_3451060.html','https://www.tripadvisor.com/Attraction_Review-g294005-d555752-Reviews-B018-Beirut.html','https://today.lorientlejour.com/article/1541682/as-b018-reopens-can-beiruts-famous-underground-club-live-up-to-its-golden-days.html']::text[]),'checked_at','2026-08-06T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-06T00:00:00Z'
    )),
    (1786::bigint, jsonb_build_object(
      'queue_wait', 'This is fast-moving counter food, but the line can thicken at lunch, dinner and late-night hunger peaks. Most people stay about fifteen minutes and take the sandwich away. Parking is the bigger headache in Bourj Hammoud, so leave the car where you can and walk the final stretch.',
      'best_nights', 'Go before the dinner rush for the cleanest rhythm, or late after drinks when hot soujouk, basterma or beef shawarma makes perfect sense. It is open deep into the night on many days, but hours split around midnight online. The experience is the same great griddle, not a special queer evening.',
      'crowd_mix', 'Bourj Hammoud regulars, Armenian-Lebanese families, workers, food obsessives and visitors hunting a Beirut classic all meet at the counter. Queer travellers are simply part of that broad stream. It feels emphatically local and mainstream, with tourists present but never running the room.',
      'dress_code', 'Come exactly as you are: jeans, trainers, work clothes or post-club layers. This is a stand-and-order sandwich institution, not a styled restaurant. Keep your outfit practical around hot sauces, carry cash or a backup payment method and plan to eat on the move if the small space is full.',
      'staff_inclusivity', 'Recent guests repeatedly call the team fast, respectful and proud of the food, while cleanliness and consistency earn strong marks across thousands of ratings. The shop appears in queer travel routes, but it is not an LGBTQ+ safe-space project and publishes no identity-specific policy.',
      'venue_classification', 'active_mainstream_bourj_hammoud_armenian_lebanese_takeaway_included_in_queer_travel_routes_not_dedicated_lgbtq_venue',
      'source_urls', to_jsonb(array[
        'https://wanderlog.com/place/details/1738340/basterma-mano',
        'https://restaurantguru.com/Basterma-Mano-Bourj-Hammoud',
        'https://www.zomato.com/widgets/restaurant_widget_reviews_frame.php?height=615&language_id=1&res_id=16504138&show_menu=0&show_reviews=1',
        'https://nomadicboys.com/beirut-gay-travel-guide/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_fast_takeaway_fifteen_minute_visit_peak_line_and_parking_walk_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1738340/basterma-mano','https://restaurantguru.com/Basterma-Mano-Bourj-Hammoud']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_late_hours_shawarma_soujouk_basterma_food_focus_without_event_night','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1738340/basterma-mano','https://restaurantguru.com/Basterma-Mano-Bourj-Hammoud','https://nomadicboys.com/beirut-gay-travel-guide/']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','broad_local_armenian_lebanese_worker_family_food_visitor_and_queer_traveller_stream','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1738340/basterma-mano','https://nomadicboys.com/beirut-gay-travel-guide/']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','counter_takeaway_small_space_hot_food_and_on_the_move_eating_context','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1738340/basterma-mano','https://www.zomato.com/widgets/restaurant_widget_reviews_frame.php?height=615&language_id=1&res_id=16504138&show_menu=0&show_reviews=1']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_fast_respectful_clean_consistency_review_pattern_without_published_lgbtq_policy','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1738340/basterma-mano','https://restaurantguru.com/Basterma-Mano-Bourj-Hammoud','https://nomadicboys.com/beirut-gay-travel-guide/']::text[]),'checked_at','2026-08-06T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-06T00:00:00Z'
    )),
    (1789::bigint, jsonb_build_object(
      'queue_wait', 'The Hamra roaster is usually an easy café arrival, though the leafy back courtyard and laptop tables fill at breakfast, lunch and study hours. Parking nearby is notoriously awkward. Walk in before 10 am for choice, and check the official branch hours because third-party listings currently disagree.',
      'best_nights', 'This place shines by day, not as nightlife. Choose a weekday morning for coffee and work, or late afternoon for a low-pressure first date under the trees. The roaster closes earlier than some directories claim, especially on weekends, so let the official daily hours shape your plan.',
      'crowd_mix', 'Hamra students, academics, remote workers, neighbourhood regulars, first dates and travellers settle in with books and laptops. Queer locals use it as one of several discreet social cafés, but the room is broadly mixed and mainstream. The energy is more Beirut daily life than visitor spectacle.',
      'dress_code', 'Soft everyday café clothes fit: denim, trainers, linen, workwear or whatever carries you through Hamra. Bring a layer for the shaded courtyard in winter and headphones if you plan to work. Nothing asks for visible queer signalling; you can be low-key, stay for a while and still feel part of the room.',
      'staff_inclusivity', 'Recent guests describe kind, attentive service, including a team that replaced a coffee dropped on the way out. Other accounts note occasional distracted service and high prices. The atmosphere is repeatedly called accepting and gay-friendly, but this remains a public café, not a protected community space.',
      'venue_classification', 'active_hamra_specialty_coffee_roaster_with_leafy_courtyard_mixed_local_crowd_and_repeated_queer_friendly_signal',
      'source_urls', to_jsonb(array[
        'https://cafeyounes.com/pages/locations',
        'https://wanderlog.com/place/details/1415969/caf%C3%A9-younes',
        'https://www.tripadvisor.co.uk/Restaurant_Review-g294005-d2659853-Reviews-Cafe_Younes-Beirut.html',
        'https://www.travelgay.com/venue/cafe-younes',
        'https://nomadicboys.com/beirut-gay-travel-guide/',
        'https://www.reddit.com/r/lebanon/comments/1jvulmj',
        'https://www.reddit.com/r/lebanon/comments/1vf47va/cool_local_and_peaceful_coffee_shops_to_study_in/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_courtyard_laptop_peak_parking_difficulty_and_official_vs_directory_hours_conflict','source_urls',to_jsonb(array['https://cafeyounes.com/pages/locations','https://wanderlog.com/place/details/1415969/caf%C3%A9-younes','https://www.reddit.com/r/lebanon/comments/1u6hjyp/removed/']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_morning_work_afternoon_date_courtyard_and_earlier_official_weekend_close_pattern','source_urls',to_jsonb(array['https://cafeyounes.com/pages/locations','https://wanderlog.com/place/details/1415969/caf%C3%A9-younes','https://www.reddit.com/r/lebanon/comments/1u5kyy3/places_for_studying_in_beirut/']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','student_academic_remote_worker_local_date_traveller_and_discreet_queer_social_mix','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Restaurant_Review-g294005-d2659853-Reviews-Cafe_Younes-Beirut.html','https://www.travelgay.com/venue/cafe-younes','https://www.reddit.com/r/lebanon/comments/1g3ryj6/dating/']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','casual_hamra_work_study_courtyard_and_discreet_social_context','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1415969/caf%C3%A9-younes','https://www.tripadvisor.co.uk/Restaurant_Review-g294005-d2659853-Reviews-Cafe_Younes-Beirut.html','https://www.travelgay.com/venue/cafe-younes']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','current_kind_accommodating_staff_consensus_balanced_against_service_price_variation_and_repeated_gay_friendly_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1415969/caf%C3%A9-younes','https://www.tripadvisor.co.uk/Restaurant_Review-g294005-d2659853-Reviews-Cafe_Younes-Beirut.html','https://www.travelgay.com/venue/cafe-younes']::text[]),'checked_at','2026-08-06T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-06T00:00:00Z'
    )),
    (1787::bigint, jsonb_build_object(
      'queue_wait', 'Ego works as a very-late queer afterparty, not an early club arrival. The classic flow is to move over around 3 am, and weekend nights can become busy. Check the promoter’s dated post and host venue before leaving: Beirut parties can shift rooms, and the old Projekt pin is not enough on its own.',
      'best_nights', 'Friday and Saturday are the established window, with electro and house carrying the room toward roughly 6 am. A live theme or collaboration should make the final choice; this brand has also appeared with Arab-pop and drag-led formats. Arrive rested, because its best hour begins after most bars peak.',
      'crowd_mix', 'Local and regional gay men form a strong core, joined by queer women, trans guests, drag artists, DJs and allies drawn to an explicitly non-normative dance floor. Visitors are visible but do not set the tone. It feels like a Beirut community afterparty first and an international gay stop second.',
      'dress_code', 'Wear expressive but stamina-ready club clothes: a fitted tee, mesh, denim, trainers, colour or full after-hours drama can all land. Bring original ID and check the event’s age rule; past collaborations used 19+. Keep your phone discreet, travel directly and avoid photographing anyone without consent.',
      'staff_inclusivity', 'The project was founded by a queer team to create the welcome missing from mainstream clubs and has helped drag and marginalised artists grow. That history carries real weight. One current travel account found the crowd less friendly than at the earlier club, so community intent does not erase every rough night.',
      'venue_classification', 'active_event_led_queer_afterparty_brand_associated_with_projekt_and_other_host_rooms_with_friday_saturday_late_peak',
      'identity_note', 'Ego is best understood as a queer party brand and after-hours programme, historically associated with Projekt. Verify the current dated event and venue rather than treating the legacy map pin as a permanently open standalone club.',
      'source_urls', to_jsonb(array[
        'https://www.travelgay.com/venue/ego-beirut',
        'https://nomadicboys.com/beirut-gay-travel-guide/',
        'https://www.dazed.me/life-culture/rave-against-the-machine',
        'https://ihjoz.com/events/7753',
        'https://www.wolfyy.com/travel-guide-gay-beirut/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_very_late_three_am_busy_weekend_flow_with_event_led_host_location_verification_need','source_urls',to_jsonb(array['https://nomadicboys.com/beirut-gay-travel-guide/','https://www.travelgay.com/venue/ego-beirut','https://www.dazed.me/life-culture/rave-against-the-machine']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_friday_saturday_to_six_am_electro_house_pattern_with_arab_pop_drag_collaboration_variants','source_urls',to_jsonb(array['https://nomadicboys.com/beirut-gay-travel-guide/','https://ihjoz.com/events/7753','https://www.wolfyy.com/travel-guide-gay-beirut/']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','local_regional_gay_queer_women_trans_drag_artist_dj_ally_and_visitor_afterparty_mix','source_urls',to_jsonb(array['https://www.dazed.me/life-culture/rave-against-the-machine','https://nomadicboys.com/beirut-gay-travel-guide/','https://ihjoz.com/events/7753']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','expressive_late_clubwear_original_id_past_19_plus_rule_privacy_and_direct_transport_context','source_urls',to_jsonb(array['https://ihjoz.com/events/7753','https://www.dazed.me/life-culture/rave-against-the-machine','https://www.travelgay.com/venue/ego-beirut']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','queer_founded_safe_space_drag_and_marginalised_artist_support_balanced_against_less_friendly_crowd_report','source_urls',to_jsonb(array['https://www.dazed.me/life-culture/rave-against-the-machine','https://nomadicboys.com/beirut-gay-travel-guide/']::text[]),'checked_at','2026-08-06T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-06T00:00:00Z'
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
  where id in (1031, 1008, 1034, 1032, 1782, 1786, 1789, 1787)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-06T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
