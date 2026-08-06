-- Queer Atlas venue intelligence: global review-led editorial pass, batch 31.
-- Three Barcelona and five Beijing records, individually researched and rewritten.
-- Beijing Power Spa is corrected from sauna to private massage service.
-- Chaoyang Park Night Route is placed on editorial hold: no reliable queer-route evidence was found.
-- BJQFF is identified as a festival collective with changing venues, not a walk-in community hub.
-- Checked 2026-08-06. Source names remain in evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (183::bigint, jsonb_build_object(
      'queue_wait', 'Condal is open around the clock, and entry is normally a quick reception check rather than a queue. The real variable is how many cabins are occupied once you enter. Sunday afternoon can swing from quiet to lively, so arrive without expecting a guaranteed crowd and check the weekly programme first.',
      'best_nights', 'Sunday from mid-afternoon remains the classic bet for a mature, masculine crowd, while late weekend hours bring a more party-led atmosphere. Recent Sundays have varied sharply, from barely a dozen guests to easy connection. Choose daytime for social cruising; choose overnight only if the heavier mood suits you.',
      'crowd_mix', 'Older men, bears and masculine regulars give Condal its long-standing character, joined by visitors and a wider age spread after weekend nightlife. Current accounts also describe groups occupying cabins for long stretches. It feels more locally rooted than glossy, but the exact balance changes hour by hour.',
      'dress_code', 'Inside, the uniform is towel or nudity, with shower shoes strongly recommended across four floors. Keep the towel under you in dry heat, rinse between wet areas and secure valuables in the locker. No body type is required; the practical code is hygiene, clear consent and patience around occupied cabins.',
      'staff_inclusivity', 'Helpful reception and active cleaning receive real praise, including from recent visitors, but English support and maintenance are inconsistent. Reports mention broken showers, a cold or dirty jacuzzi and drug use in cabins. The welcome is male and gay-focused; inspect the facilities and trust your comfort level.',
      'venue_classification', 'active_24_7_multi_level_gay_mens_sauna_with_mature_bear_sunday_history_and_mixed_current_maintenance',
      'source_urls', to_jsonb(array[
        'https://www.saunaspases.com/saunacondal/',
        'https://wanderlog.com/place/details/2192479/sauna-gay-condal',
        'https://www.gayout.com/es/europe/spain/barcelona/cruising/sauna-condal-barcelona',
        'https://qlist.app/venues/Barcelona/Gay-Sauna-Condal/VzZWNEdVY01SSDRPWnJ0M3hOaVV2Zw',
        'https://www.saunaspases.com/saunacasanova/wp-content/uploads/2026/01/Revista-Enero-2026.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_24_7_reception_entry_sunday_variability_and_weekly_programme_evidence','source_urls',to_jsonb(array['https://www.saunaspases.com/saunacondal/','https://wanderlog.com/place/details/2192479/sauna-gay-condal','https://www.gayout.com/es/europe/spain/barcelona/cruising/sauna-condal-barcelona']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_sunday_afternoon_mature_history_variable_attendance_and_weekend_party_context','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2192479/sauna-gay-condal','https://www.gayout.com/es/europe/spain/barcelona/cruising/sauna-condal-barcelona','https://qlist.app/venues/Barcelona/Gay-Sauna-Condal/VzZWNEdVY01SSDRPWnJ0M3hOaVV2Zw']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','mature_masculine_bear_local_visitor_and_late_weekend_group_mix_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2192479/sauna-gay-condal','https://www.gayout.com/es/europe/spain/barcelona/cruising/sauna-condal-barcelona']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','four_level_male_sauna_towel_locker_wet_area_hygiene_and_consent_context','source_urls',to_jsonb(array['https://www.saunaspases.com/saunacondal/','https://wanderlog.com/place/details/2192479/sauna-gay-condal']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','mixed_current_helpful_cleaning_and_language_maintenance_drug_use_reports_with_male_scope','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2192479/sauna-gay-condal','https://www.gayout.com/es/europe/spain/barcelona/cruising/sauna-condal-barcelona','https://qlist.app/venues/Barcelona/Gay-Sauna-Condal/VzZWNEdVY01SSDRPWnJ0M3hOaVV2Zw']::text[]),'checked_at','2026-08-06T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-06T00:00:00Z'
    )),
    (1292::bigint, jsonb_build_object(
      'queue_wait', 'Thermas is built for continuous weekend flow, so entry is usually reception rather than a club queue. Friday through Sunday are currently advertised as 24-hour periods; other hours can change. A special community event may use its own ticket or door, so check the dated post instead of assuming normal sauna access.',
      'best_nights', 'Weekend late nights and after-club mornings bring the strongest activity, with a younger international male crowd than several Barcelona saunas. Daytime is easier for the pools and wet areas. Paid companionship is repeatedly reported as part of the mix, so decide in advance whether that atmosphere is right for you.',
      'crowd_mix', 'Gay and bisexual men lead the regular operation: Barcelona visitors, younger Latino men, older admirers and a visible number of escorts or rent boys. Occasional externally produced women’s events change the room completely. This is not one stable crowd, and the advertised event must be read before arrival.',
      'dress_code', 'For ordinary sauna hours, expect towel or nudity, locker use and shower shoes rather than nightlife clothing. Keep boundaries explicit and agree on money before any paid interaction. A separately ticketed community event can set different clothing or admission rules, so its own notice takes priority.',
      'staff_inclusivity', 'A May 2026 women’s event led to a police hate-crime investigation after two Jewish guests said a Star of David prompted their exclusion. The venue condemned antisemitism and barred the outside organisers, but the incident remains material. Regular reviews also split on service, cleanliness and upkeep.',
      'venue_classification', 'active_large_gay_mens_sauna_with_24_hour_weekend_flow_paid_companionship_and_occasional_external_community_events',
      'source_urls', to_jsonb(array[
        'https://www.saunaspases.com/saunathermas/',
        'https://www.saunaspases.com/',
        'https://www.travelgay.com/venue/sauna-thermas?replytocom=53094',
        'https://saunas4men.com/en/spain/barcelona/sauna-thermas',
        'https://www.thegayagenda.fyi/barcelona/businesses/sauna-thermas/',
        'https://www.reddit.com/r/gaytravel/comments/1ruoj88/gay_saunas_in_barcelona_recommendations/',
        'https://elpais.com/espana/catalunya/2026-06-01/los-mossos-investigan-la-denuncia-de-dos-mujeres-judias-a-las-que-denegaron-el-acceso-a-una-sauna-por-lucir-una-estrella-de-david.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_official_friday_sunday_24_hour_flow_and_event_specific_entry_context','source_urls',to_jsonb(array['https://www.saunaspases.com/','https://www.saunaspases.com/saunathermas/','https://saunas4men.com/en/spain/barcelona/sauna-thermas']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_weekend_late_after_club_young_international_and_paid_companionship_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/sauna-thermas?replytocom=53094','https://www.reddit.com/r/gaytravel/comments/1ruoj88/gay_saunas_in_barcelona_recommendations/','https://www.thegayagenda.fyi/barcelona/businesses/sauna-thermas/']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','gay_bisexual_male_local_visitor_latino_escort_admirer_and_external_womens_event_evidence','source_urls',to_jsonb(array['https://www.travelgay.com/venue/sauna-thermas?replytocom=53094','https://saunas4men.com/en/spain/barcelona/sauna-thermas','https://elpais.com/espana/catalunya/2026-06-01/los-mossos-investigan-la-denuncia-de-dos-mujeres-judias-a-las-que-denegaron-el-acceso-a-una-sauna-por-lucir-una-estrella-de-david.html']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','male_sauna_towel_locker_wet_area_paid_interaction_and_external_event_rule_context','source_urls',to_jsonb(array['https://www.saunaspases.com/saunathermas/','https://saunas4men.com/en/spain/barcelona/sauna-thermas','https://www.travelgay.com/venue/sauna-thermas?replytocom=53094']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','current_police_hate_crime_investigation_venue_condemnation_organiser_ban_and_mixed_service_reviews','source_urls',to_jsonb(array['https://elpais.com/espana/catalunya/2026-06-01/los-mossos-investigan-la-denuncia-de-dos-mujeres-judias-a-las-que-denegaron-el-acceso-a-una-sauna-por-lucir-una-estrella-de-david.html','https://www.travelgay.com/venue/sauna-thermas?replytocom=53094','https://www.thegayagenda.fyi/barcelona/businesses/sauna-thermas/']::text[]),'checked_at','2026-08-06T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-06T00:00:00Z'
    )),
    (1667::bigint, jsonb_build_object(
      'queue_wait', 'Strass is a compact walk-in bar, so there is usually no formal queue; the pinch comes inside as the midnight drag show approaches. It opens from early evening and runs late. Arrive before 11:30 pm for a stool and clear sightline, or accept a tighter standing crowd when the performers take over.',
      'best_nights', 'Drag is advertised every night, which makes the show time more important than the weekday. Friday and Saturday carry the fullest pre-club energy; a weekday gives the queens more room to work the audience. Go for camp interaction and drinks, then move on if you want a full dance floor.',
      'crowd_mix', 'Gay men form the core, with local Gayxample regulars, international visitors and mixed friend groups pulled in by the show. The narrow room feels more like shared cabaret than separate social pockets. It is visibly queer and tourist-friendly, though not designed around queer women or a balanced all-genders crowd.',
      'dress_code', 'There is no velvet-rope uniform. A tee or shirt, denim, trainers, colour, sparkle or a full camp flourish can all belong. Keep layers and bags small for the narrow bar, and wear whatever lets you laugh at close range without blocking the show. Personality matters more here than labels or luxury.',
      'staff_inclusivity', 'Performers earn enthusiastic praise and the overall rating is strong, but recent service reports are uneven. Some guests describe rude waiters; another criticised jokes as xenophobic, ageist and classist. The bar is proudly gay, yet that does not guarantee every show or shift will feel broadly inclusive.',
      'venue_classification', 'active_compact_gayxample_gay_bar_with_nightly_drag_camp_audience_interaction_and_mixed_service_reports',
      'source_urls', to_jsonb(array[
        'https://www.instagram.com/strass_bcn/',
        'https://whereis.gay/strass',
        'https://thegaypassport.com/venue/strass-barcelona/',
        'https://www.travelgay.com/venue/strass-barcelona',
        'https://www.thegayagenda.fyi/barcelona/businesses/strass/',
        'https://www.gayplaces.co/city/barcelona/bar/strass-barcelona',
        'https://www.tripadvisor.com/Restaurant_Review-g187497-d27892685-Reviews-Strass-Barcelona_Catalonia.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_compact_walk_in_early_opening_midnight_show_and_late_close_consensus','source_urls',to_jsonb(array['https://whereis.gay/strass','https://thegaypassport.com/venue/strass-barcelona/','https://www.thegayagenda.fyi/barcelona/businesses/strass/']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_nightly_drag_with_weekend_pre_club_and_weekday_room_context','source_urls',to_jsonb(array['https://thegaypassport.com/venue/strass-barcelona/','https://www.travelgay.com/venue/strass-barcelona','https://whereis.gay/strass']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','predominantly_gay_male_local_visitor_and_mixed_friend_show_crowd_consensus','source_urls',to_jsonb(array['https://www.gayplaces.co/city/barcelona/bar/strass-barcelona','https://thegaypassport.com/venue/strass-barcelona/','https://whereis.gay/strass']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','compact_camp_drag_bar_context_without_published_formal_code','source_urls',to_jsonb(array['https://thegaypassport.com/venue/strass-barcelona/','https://www.travelgay.com/venue/strass-barcelona','https://whereis.gay/strass']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_performer_and_overall_rating_consensus_balanced_against_current_rude_service_and_offensive_comedy_reports','source_urls',to_jsonb(array['https://whereis.gay/strass','https://www.tripadvisor.com/Restaurant_Review-g187497-d27892685-Reviews-Strass-Barcelona_Catalonia.html']::text[]),'checked_at','2026-08-06T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-06T00:00:00Z'
    )),
    (1033::bigint, jsonb_build_object(
      'queue_wait', 'This is a private men’s massage studio, not a bathhouse with a crowd or entrance queue. Book ahead and follow the current Hujialou pickup or access instructions; a recent visitor found the station pickup easy. Daily appointments run roughly 10 am–2 am, with 24-hour outcall advertised separately.',
      'best_nights', 'There is no best party night because the experience is one-to-one. A daytime or early-evening booking leaves more room to choose a therapist and discuss pressure; late appointments suit travellers after sightseeing. Reserve in advance, especially if you want a named therapist or station pickup.',
      'crowd_mix', 'You will not meet a crowd here. The service is gay-owned, men-only and used by local and visiting male clients who want a private massage, scrub or facial from a male therapist. Treat it as an appointment-led wellness service, not a social sauna, cruising room or shortcut into Beijing nightlife.',
      'dress_code', 'Arrive clean in ordinary street clothes; the therapist will explain what to remove and how you will be draped for the booked treatment. State pressure, boundaries, price, duration and any extras before starting. The older building is discreet, while the treatment room itself is reported clean and comfortable.',
      'staff_inclusivity', 'The business explicitly welcomes gay men and uses male therapists. A detailed 2026 visit praised professional technique, cleanliness, comfort and station pickup, while an old review described an aggressive tip dispute. Confirm the complete price first, then speak up if pressure or boundaries need adjusting.',
      'venue_classification', 'active_gay_owned_men_only_private_massage_studio_with_incall_station_pickup_and_24_hour_outcall_not_sauna',
      'identity_note', 'The legacy app type sauna is inaccurate. Current official and independent sources describe a private men-only massage studio without shared sauna or bathhouse facilities.',
      'source_urls', to_jsonb(array[
        'https://www.bjpowerspa.com/en/about.asp',
        'https://www.bjpowerspa.com/contact.asp',
        'https://www.travelgay.com/venue/beijing-power-spa',
        'https://thegaypassport.com/venue/beijing-power-spa/',
        'https://gay-travelnavi.com/beijing/power-spa/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_private_appointment_daily_hours_hujialou_pickup_and_separate_outcall_evidence','source_urls',to_jsonb(array['https://www.travelgay.com/venue/beijing-power-spa','https://www.bjpowerspa.com/contact.asp','https://www.bjpowerspa.com/en/about.asp']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','appointment_led_named_therapist_pressure_choice_and_advance_booking_context','source_urls',to_jsonb(array['https://www.travelgay.com/venue/beijing-power-spa','https://www.bjpowerspa.com/en/about.asp']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_gay_owned_men_only_private_local_visitor_massage_client_scope_not_social_sauna','source_urls',to_jsonb(array['https://www.bjpowerspa.com/en/about.asp','https://www.travelgay.com/venue/beijing-power-spa','https://thegaypassport.com/venue/beijing-power-spa/']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','private_professional_massage_draping_cleanliness_price_pressure_and_boundary_context','source_urls',to_jsonb(array['https://www.bjpowerspa.com/en/about.asp','https://www.travelgay.com/venue/beijing-power-spa']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_gay_owned_male_therapist_welcome_and_strong_2026_professional_review_balanced_against_old_tip_dispute','source_urls',to_jsonb(array['https://www.travelgay.com/venue/beijing-power-spa','https://www.bjpowerspa.com/en/about.asp']::text[]),'checked_at','2026-08-06T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-06T00:00:00Z'
    )),
    (1007::bigint, jsonb_build_object(
      'queue_wait', 'BJQFF is a festival collective, not a café or permanent walk-in hub. Entry follows each screening’s registration and location message; never rely on the map pin alone. For the 2026 edition, the published festival window is 30 October–8 November, with final programme and access instructions still decisive.',
      'best_nights', 'Choose by film, forum or filmmaker conversation rather than nightlife rhythm. The 2026 edition runs across ten days, so opening and closing sessions may carry ceremony while smaller weekday screenings allow deeper exchange. Wait for the official programme: dates can hold while venues or access details move.',
      'crowd_mix', 'Independent filmmakers, programmers, students, local queer audiences, artists and international guests meet around politically alert cinema. Past forums have drawn more than a hundred participants, while individual screenings can feel intimate. The mix is community-led and cross-generational rather than a bar crowd.',
      'dress_code', 'Wear relaxed cinema or discussion clothes and bring only what the invitation requests. The important etiquette is privacy: do not photograph, tag or publish another attendee or a last-minute location without consent. In Beijing’s current climate, a low-key arrival protects the room better than visible event branding.',
      'staff_inclusivity', 'Filmmakers repeatedly describe thoughtful hospitality, adventurous programming and genuine love for cinema. The organisers have kept queer work visible under sustained regulatory pressure. Their care is real, but no team can remove external risk; follow privacy guidance and accept last-minute format or venue changes.',
      'venue_classification', 'active_annual_queer_film_festival_collective_with_rotating_screening_venues_and_2026_october_november_edition_not_cafe',
      'identity_note', 'The legacy Community Hub name and cafe type are misleading. BJQFF is an active festival collective whose screenings, forums and access points can rotate; the listing must not be treated as a permanent public venue.',
      'source_urls', to_jsonb(array[
        'https://www.bjqff.com/',
        'https://www.bjqff.com/about/',
        'https://filmfreeway.com/BJQFF',
        'https://www.chinaindiefilm.org/report-on-the-16th-beijing-queer-film-festival/',
        'https://madeinchinajournal.com/2026/02/12/queer-festival-troubles/',
        'https://www.bjqff.com/latest-news/cicosi-call-for-papers-chinese-queer-film-festivals/',
        'https://www.lemonde.fr/en/international/article/2026/06/11/chinese-authorities-pressure-beijing-s-institut-francais-to-halt-screenings-of-films-featuring-same-sex-relationships_6754326_4.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_2026_dates_registration_led_entry_and_non_permanent_moving_venue_evidence','source_urls',to_jsonb(array['https://filmfreeway.com/BJQFF','https://www.bjqff.com/','https://madeinchinajournal.com/2026/02/12/queer-festival-troubles/']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_ten_day_film_forum_programme_and_changeable_venue_access_context','source_urls',to_jsonb(array['https://filmfreeway.com/BJQFF','https://www.bjqff.com/','https://www.chinaindiefilm.org/report-on-the-16th-beijing-queer-film-festival/']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','independent_filmmaker_programmer_student_local_queer_artist_international_and_forum_attendance_evidence','source_urls',to_jsonb(array['https://www.chinaindiefilm.org/report-on-the-16th-beijing-queer-film-festival/','https://filmfreeway.com/BJQFF','https://www.bjqff.com/about/']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_screening_privacy_location_protection_and_current_external_pressure_context','source_urls',to_jsonb(array['https://madeinchinajournal.com/2026/02/12/queer-festival-troubles/','https://www.lemonde.fr/en/international/article/2026/06/11/chinese-authorities-pressure-beijing-s-institut-francais-to-halt-screenings-of-films-featuring-same-sex-relationships_6754326_4.html','https://www.bjqff.com/']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_filmmaker_hospitality_programming_and_community_care_consensus_under_current_regulatory_pressure','source_urls',to_jsonb(array['https://filmfreeway.com/BJQFF','https://www.chinaindiefilm.org/report-on-the-16th-beijing-queer-film-festival/','https://madeinchinajournal.com/2026/02/12/queer-festival-troubles/']::text[]),'checked_at','2026-08-06T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-06T00:00:00Z'
    )),
    (1009::bigint, jsonb_build_object(
      'queue_wait', 'Chaoyang Park is a large public park, not a nightlife door. Official information describes free entry with possible reservation requirements and non-24-hour access. Use the current park notice or gate instructions; there is no verified queer route, host or queue attached to this app record.',
      'best_nights', 'Treat this as a daytime or early-evening park walk, not a recommended cruising night. The park’s live closing time matters, and after-hours access should never be assumed. For queer social plans, choose a verified venue or a meeting arranged with someone you trust rather than searching secluded paths.',
      'crowd_mix', 'Families, runners, walkers, visitors and recreation groups use Beijing’s largest inner-ring public park. There is no reliable basis for labelling its crowd queer or estimating locals versus tourists for a supposed night route. Anyone you meet there is simply another park user unless they tell you otherwise.',
      'dress_code', 'Wear weather-ready layers and proper walking shoes for a park stretching nearly three kilometres north to south. Keep your phone charged, carry water and use active, lit paths. This is public space: ordinary park clothing and discreet behaviour are safer and more respectful than treating the landscape as a coded venue.',
      'staff_inclusivity', 'Park staff operate a general municipal recreation space, not an LGBTQ+ venue or consent-managed event. No queer-specific hospitality policy could be verified. Stay within official hours, protect your location and identity, meet strangers only in visible areas and leave immediately if an interaction feels pressured.',
      'venue_classification', 'unverified_queer_route_general_public_park_record_on_editorial_hold_not_recommended_as_cruising_destination',
      'record_status', 'editorial_hold_unverified_queer_route_requires_correction_or_removal',
      'identity_note', 'No reliable current source connects Chaoyang Park to the named queer night route. Research instead identifies Beijing park cruising history at other parks. This record must not be promoted as a verified LGBTQ+ venue.',
      'source_urls', to_jsonb(array[
        'https://english.beijing.gov.cn/travellinginbeijing/parks/202006/t20200630_1937393.html',
        'https://yllhj.beijing.gov.cn/ggfw/bjsggml/zhgy/cyq/202206/t20220614_2740316.shtml',
        'https://german.beijing.gov.cn/latest/news/202602/t20260215_4519461.html',
        'https://journals.openedition.org/chinaperspectives/19767'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_public_park_free_reservation_possible_non_full_time_access_and_no_verified_queer_route','source_urls',to_jsonb(array['https://english.beijing.gov.cn/travellinginbeijing/parks/202006/t20200630_1937393.html','https://yllhj.beijing.gov.cn/ggfw/bjsggml/zhgy/cyq/202206/t20220614_2740316.shtml']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','official_non_24_hour_park_access_and_absence_of_current_chaoyang_specific_queer_route_evidence','source_urls',to_jsonb(array['https://german.beijing.gov.cn/latest/news/202602/t20260215_4519461.html','https://yllhj.beijing.gov.cn/ggfw/bjsggml/zhgy/cyq/202206/t20220614_2740316.shtml','https://journals.openedition.org/chinaperspectives/19767']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_general_public_recreation_identity_without_queer_or_tourist_mix_evidence','source_urls',to_jsonb(array['https://yllhj.beijing.gov.cn/ggfw/bjsggml/zhgy/cyq/202206/t20220614_2740316.shtml','https://english.beijing.gov.cn/travellinginbeijing/parks/202006/t20200630_1937393.html']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','official_large_public_park_scale_and_safety_led_walking_context','source_urls',to_jsonb(array['https://yllhj.beijing.gov.cn/ggfw/bjsggml/zhgy/cyq/202206/t20220614_2740316.shtml']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','municipal_public_park_without_verified_queer_hospitality_or_consent_protocol','source_urls',to_jsonb(array['https://yllhj.beijing.gov.cn/ggfw/bjsggml/zhgy/cyq/202206/t20220614_2740316.shtml','https://journals.openedition.org/chinaperspectives/19767']::text[]),'checked_at','2026-08-06T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-06T00:00:00Z'
    )),
    (1005::bigint, jsonb_build_object(
      'queue_wait', 'Destination opens at 9 pm and normally wakes after 11. Friday and Saturday can move from eerily spacious to packed, while a holiday visitor recently reported waiting about an hour. Arrive by 10:30 for an easier security check and coat drop; later gives more energy but less room across the corridors.',
      'best_nights', 'Saturday is the strongest default, with Friday close behind, but the current theme should make the final call. K-pop, pop-idol, bear, body and international-DJ programmes activate different rooms. A quiet Friday is possible in such a huge complex, so check the live feed and do not mistake size for a guaranteed crowd.',
      'crowd_mix', 'Gay men are the clear centre: Beijing regulars, bears, younger dancers, closeted newcomers and visitors from elsewhere in China. Women and the wider LGBTQ+ spectrum are welcomed, while foreign travellers remain a visible minority. The crowd is much more local than tourist-led, especially outside major holidays.',
      'dress_code', 'No strict style code is published. Clean casual clubwear, a fitted tee, denim, trainers, colour or a theme-led look all work across its many rooms. Bring minimal valuables, use the coat check and keep your phone secure in the packed dance spaces. The practical door test is security and admission, not fashion status.',
      'staff_inclusivity', 'This gay-founded institution remains one of Beijing’s clearest queer nightlife anchors, and friendly bar staff with some English support are often noted. The broader LGBTQ+ spectrum can enter, though gay men dominate. Smoke, density and reports of unwanted attention mean you should hold boundaries and watch belongings.',
      'venue_classification', 'active_large_multi_room_beijing_gay_club_with_weekend_peak_rotating_theme_parties_and_predominantly_local_male_crowd',
      'source_urls', to_jsonb(array[
        'https://www.bjdestination.com.cn/',
        'https://www.bjdestination.com.cn/pages/contact/',
        'https://www.tripadvisor.com/Attraction_Review-g294212-d21248468-Reviews-Destination-Beijing.html',
        'https://www.travelgay.com/venue/destination',
        'https://www.beijingcitybreaks.com/city/beijing/destination',
        'https://maps.apple.com/place?_provider=57879&address=Gongren+Tiyuchang+West+Road+No.7%2C+Chaoyang%2C+Beijing+China&coordinate=39.928622%2C116.443529&name=Destinations+%28Beijing+Workers%27+Sports+Complex+Night+Shop+Yitiao+Street+Shop%29&place-id=H2710I3F80D1D5DCCFE',
        'https://www.reddit.com/r/gaysian/comments/1oard6m/gay_bar_and_clubs_in_beijing/',
        'https://www.reddit.com/r/beijing/comments/1h5edxi'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_official_opening_late_build_weekend_holiday_hour_queue_and_coat_check_evidence','source_urls',to_jsonb(array['https://www.bjdestination.com.cn/pages/contact/','https://www.tripadvisor.com/Attraction_Review-g294212-d21248468-Reviews-Destination-Beijing.html','https://www.reddit.com/r/gaysian/comments/1oard6m/gay_bar_and_clubs_in_beijing/','https://www.travelgay.com/venue/destination']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_saturday_friday_peak_and_live_kpop_pop_bear_body_dj_theme_programme','source_urls',to_jsonb(array['https://www.bjdestination.com.cn/','https://www.reddit.com/r/beijing/comments/1h5edxi','https://www.tripadvisor.com/Attraction_Review-g294212-d21248468-Reviews-Destination-Beijing.html']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','predominantly_local_gay_male_bear_younger_closeted_domestic_visitor_women_and_foreign_minority_consensus','source_urls',to_jsonb(array['https://www.reddit.com/r/gaysian/comments/1oard6m/gay_bar_and_clubs_in_beijing/','https://www.beijingcitybreaks.com/city/beijing/destination','https://www.travelgay.com/venue/destination']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','multi_room_theme_club_security_coat_check_and_belongings_context_without_published_strict_code','source_urls',to_jsonb(array['https://www.bjdestination.com.cn/','https://www.travelgay.com/venue/destination','https://maps.apple.com/place?_provider=57879&address=Gongren+Tiyuchang+West+Road+No.7%2C+Chaoyang%2C+Beijing+China&coordinate=39.928622%2C116.443529&name=Destinations+%28Beijing+Workers%27+Sports+Complex+Night+Shop+Yitiao+Street+Shop%29&place-id=H2710I3F80D1D5DCCFE']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','gay_founded_anchor_friendly_some_english_broader_lgbtq_welcome_with_smoke_density_attention_and_theft_cautions','source_urls',to_jsonb(array['https://www.bjdestination.com.cn/','https://www.travelgay.com/venue/destination','https://www.beijingcitybreaks.com/city/beijing/destination','https://maps.apple.com/place?_provider=57879&address=Gongren+Tiyuchang+West+Road+No.7%2C+Chaoyang%2C+Beijing+China&coordinate=39.928622%2C116.443529&name=Destinations+%28Beijing+Workers%27+Sports+Complex+Night+Shop+Yitiao+Street+Shop%29&place-id=H2710I3F80D1D5DCCFE']::text[]),'checked_at','2026-08-06T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-06T00:00:00Z'
    )),
    (1006::bigint, jsonb_build_object(
      'queue_wait', 'The bistro is the softer food-and-drink lane inside the Destination complex, not a second club with its own famous queue. Daytime and dinner visits should be simple walk-ins; later, compound security and a major party can add friction. The published bistro span is 11 am–4 am, but confirm it live.',
      'best_nights', 'Come between dinner and 10:30 pm when you want food, cocktails and conversation before the main club fills. Friday or Saturday makes the handoff into dancing effortless; a weekday better suits a quiet meal. The bistro is useful precisely because it lets the evening warm gradually instead of starting at peak volume.',
      'crowd_mix', 'Expect Destination regulars, friends meeting before the club, staff, local LGBTQ+ diners and a smaller stream of international visitors. Gay men remain central, but the food setting is easier for mixed groups than the packed dance floor. This is a transition space, not a separate community with a distinct crowd.',
      'dress_code', 'Smart-casual street clothes work from meal to club: shirt or tee, denim, trainers and one light layer. There is no separate bistro dress code published. Keep bags compact if you plan to cross into the night rooms later, and choose an outfit comfortable enough for noodles or pizza before hours of dancing.',
      'staff_inclusivity', 'Its clearest welcome comes from being part of Beijing’s long-running gay-founded Destination complex. The daytime format can feel gentler than the club, but independent current service evidence for the bistro alone is limited. Treat it as the same queer household and confirm any access or language needs when booking.',
      'venue_classification', 'active_destination_complex_bistro_and_pre_club_food_cocktail_lane_not_independent_nightlife_venue',
      'identity_note', 'Destination Bistro is the restaurant-bar operation within the Destination complex. It shares the official address and contact system and should not be represented as a separately verified standalone venue.',
      'source_urls', to_jsonb(array[
        'https://www.bjdestination.com.cn/',
        'https://www.bjdestination.com.cn/pages/contact/',
        'https://you.ctrip.com/food/chaoyang143885/4938640.html',
        'https://gs.ctrip.com/html5/you/foods/fooddetail/1/4938640.html',
        'https://my.trip.com/restaurant/china/beijing/detail/destination-11087299/',
        'https://www.travelgay.com/venue/destination'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_in_complex_bistro_hours_daytime_walk_in_and_later_shared_security_context','source_urls',to_jsonb(array['https://www.bjdestination.com.cn/pages/contact/','https://www.bjdestination.com.cn/','https://my.trip.com/restaurant/china/beijing/detail/destination-11087299/']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'best_nights', jsonb_build_object('status','official_bistro_to_club_hours_food_cocktail_and_weekend_warmup_context','source_urls',to_jsonb(array['https://www.bjdestination.com.cn/pages/contact/','https://you.ctrip.com/food/chaoyang143885/4938640.html','https://gs.ctrip.com/html5/you/foods/fooddetail/1/4938640.html']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','shared_destination_regular_friend_local_lgbtq_diner_and_international_visitor_context','source_urls',to_jsonb(array['https://www.bjdestination.com.cn/','https://www.travelgay.com/venue/destination','https://you.ctrip.com/food/chaoyang143885/4938640.html']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'dress_code', jsonb_build_object('status','food_cocktail_to_club_transition_context_without_separate_published_code','source_urls',to_jsonb(array['https://www.bjdestination.com.cn/pages/contact/','https://gs.ctrip.com/html5/you/foods/fooddetail/1/4938640.html','https://www.travelgay.com/venue/destination']::text[]),'checked_at','2026-08-06T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','gay_founded_shared_complex_welcome_with_insufficient_independent_current_bistro_only_service_consensus','source_urls',to_jsonb(array['https://www.bjdestination.com.cn/','https://www.bjdestination.com.cn/pages/contact/','https://www.travelgay.com/venue/destination']::text[]),'checked_at','2026-08-06T00:00:00Z')
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
  where id in (183, 1292, 1667, 1033, 1007, 1009, 1005, 1006)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-06T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
