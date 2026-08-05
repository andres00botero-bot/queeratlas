-- Queer Atlas venue intelligence: global review-led editorial pass, batch 30.
-- Eight Barcelona candidates, individually researched and rewritten.
-- Metro Disco is retained as a status-conflict record and not presented as open.
-- Checked 2026-08-05. Source names remain in evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (1665::bigint, jsonb_build_object(
      'queue_wait', 'This intimate club can feel full quickly on Friday and Saturday, especially once the headline set begins. A ticket is the safer plan; arriving near midnight gives you more room than pushing in at peak time. Thursday can be calmer when programmed, but always check the dated event rather than assuming it opens.',
      'best_nights', 'Friday and Saturday carry the main underground house and techno programme, with the booked DJ shaping the room more than the weekday label. A selected Thursday can offer the same high-fidelity system with less compression. Go for a lineup you actually want—the club is too focused to work as a generic tourist stop.',
      'crowd_mix', 'Electronic-music regulars, visiting club travellers and small groups from central Barcelona share a close, serious dance floor. The room is international without feeling built around tourism. Queer dancers are part of the mix, but this is not a permanent LGBTQ+-only night and the artist can noticeably change the crowd.',
      'dress_code', 'There is no strict fashion code: expressive clubwear, dark layers, denim and sturdy shoes all work. Football shirts and offensive or discriminatory prints are explicitly unwelcome. Leave the fragile footwear at home, carry physical ID if you are 21+, and dress for heat rather than for a velvet-rope performance.',
      'staff_inclusivity', 'The published policy rejects harassment, discrimination and violence, and staff invite guests to ask for help. Current experiences are mixed: many praise the sound and DJs, while others describe a cold or rude door and overcrowding. The stated values are inclusive; their delivery is not reported as warm every night.',
      'venue_classification', 'active_small_21_plus_high_fidelity_electronic_club_with_phone_free_dancefloor_and_selective_door',
      'source_urls', to_jsonb(array[
        'https://www.lesenfantsclub.com/contact/',
        'https://www.lesenfantsclub.com/about/',
        'https://www.lesenfantsclub.com/',
        'https://wanderlog.com/es/place/details/2453781/les-enfants-brillants-barcelona'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_intimate_capacity_ticket_weekend_peak_and_selected_thursday_consensus','source_urls',to_jsonb(array['https://www.lesenfantsclub.com/contact/','https://www.lesenfantsclub.com/','https://wanderlog.com/es/place/details/2453781/les-enfants-brillants-barcelona']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_friday_saturday_and_selected_thursday_lineup_led_electronic_programme','source_urls',to_jsonb(array['https://www.lesenfantsclub.com/','https://www.lesenfantsclub.com/about/','https://wanderlog.com/es/place/details/2453781/les-enfants-brillants-barcelona']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','underground_electronic_local_visitor_and_artist_dependent_not_queer_specific_consensus','source_urls',to_jsonb(array['https://www.lesenfantsclub.com/about/','https://wanderlog.com/es/place/details/2453781/les-enfants-brillants-barcelona']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_no_strict_code_prohibited_prints_sturdy_shoes_and_21_plus_id_policy','source_urls',to_jsonb(array['https://www.lesenfantsclub.com/contact/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_anti_discrimination_help_policy_balanced_against_current_mixed_door_staff_reports','source_urls',to_jsonb(array['https://www.lesenfantsclub.com/contact/','https://wanderlog.com/es/place/details/2453781/les-enfants-brillants-barcelona']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (176::bigint, jsonb_build_object(
      'queue_wait', 'Do not plan a queue here: several current venue platforms mark Metro Disco permanently closed, while a handful of directories still recycle its old hours. With the official site unavailable and no convincing current programme, treat the door as closed unless the operator publishes a reopening from a verifiable channel.',
      'best_nights', 'There is no responsible “best night” recommendation while its status conflicts. Historically, the club peaked very late on weekends, with pop and Latin in one room and house or techno in another. That memory explains its reputation, but it is not proof of a current Saturday—confirm a dated event before travelling.',
      'crowd_mix', 'Historically this was a gay-men-led Barcelona institution, mixing local regulars, mature clubbers and international visitors across two floors. It could feel more male and established than an all-genders queer party. That crowd description belongs to the former operation; no reliable current crowd can be verified.',
      'dress_code', 'Past accounts describe ordinary gay-club clothing rather than a strict dress ritual, but an old door policy should not be treated as current guidance. If a verified reopening appears, use that event’s published rules and carry physical ID. Until then, there is no meaningful practical dress code to recommend.',
      'staff_inclusivity', 'The former club served Barcelona’s gay community for years, yet historic reports about the door, service and safety were mixed. There is no current team or safeguarding practice that can be verified. The honest inclusion note is therefore status-first: do not present its reputation as evidence about current staff.',
      'venue_classification', 'status_conflict_probably_closed_historic_two_room_gay_club_requires_manual_verification',
      'record_status', 'status_conflict_probably_closed_needs_manual_verification',
      'source_urls', to_jsonb(array[
        'https://barcelona.gaycities.com/bars/2042-metro-disco',
        'https://wanderlog.com/es/place/details/3982858/metro-disco-bcn',
        'https://www.misterbandb.com/es/guia-gay/espana/barcelona/50-bars-clubs/11797-metro-disco',
        'https://www.gayout.com/es/europe/spain/barcelona/bars/metro-disco-81',
        'https://www.salir.com/metro-disco-barcelona-neg-18443.html',
        'https://xceed.me/barcelona/venue/metro-disco-bcn',
        'https://www.thegayagenda.fyi/barcelona/businesses/metro-disco/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multiple_current_permanently_closed_markers_official_channel_unavailable_and_stale_directory_conflict','source_urls',to_jsonb(array['https://barcelona.gaycities.com/bars/2042-metro-disco','https://wanderlog.com/es/place/details/3982858/metro-disco-bcn','https://www.misterbandb.com/es/guia-gay/espana/barcelona/50-bars-clubs/11797-metro-disco','https://www.gayout.com/es/europe/spain/barcelona/bars/metro-disco-81']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','no_current_night_verifiable_historic_late_weekend_two_room_context_only','source_urls',to_jsonb(array['https://barcelona.gaycities.com/bars/2042-metro-disco','https://www.salir.com/metro-disco-barcelona-neg-18443.html','https://xceed.me/barcelona/venue/metro-disco-bcn']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','historic_gay_male_local_mature_and_international_mix_not_currently_verifiable','source_urls',to_jsonb(array['https://www.salir.com/metro-disco-barcelona-neg-18443.html','https://www.thegayagenda.fyi/barcelona/businesses/metro-disco/','https://barcelona.gaycities.com/bars/2042-metro-disco']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','historic_casual_club_context_only_no_current_door_policy_verifiable','source_urls',to_jsonb(array['https://www.salir.com/metro-disco-barcelona-neg-18443.html','https://xceed.me/barcelona/venue/metro-disco-bcn']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','historic_gay_community_role_and_mixed_service_reports_without_verifiable_current_team','source_urls',to_jsonb(array['https://barcelona.gaycities.com/bars/2042-metro-disco','https://www.thegayagenda.fyi/barcelona/businesses/metro-disco/','https://wanderlog.com/es/place/details/3982858/metro-disco-bcn']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (186::bigint, jsonb_build_object(
      'queue_wait', 'Moeem is a small bar rather than a formal club door, so the issue is space, not selection. It can already feel busy around 9 pm and becomes tightly packed on a good Saturday. Arrive during the after-work window for an easy drink and conversation; come later if you want the tiny dance floor at full voice.',
      'best_nights', 'Friday and Saturday bring the liveliest pop, reggaeton, requests and dancing, while an early evening visit suits snacks and a more neighbourhood pace. The current official schedule changes seasonally and even contains conflicting weekday details, so check the live page before choosing anything beyond the weekend.',
      'crowd_mix', 'Gay men anchor the room, but recent nights draw a cheerful spread of Barcelona regulars, international visitors, younger dancers and older neighbours. The mix feels social rather than tribal, with strangers talking to the DJ and each other. It is clearly LGBTQ+ territory without demanding one age, body or scene.',
      'dress_code', 'Casual, colourful night-out clothes are enough: tee, shirt, jeans, shorts, trainers or something a little flirtier all fit. There is no published formal code, and the room is too small for cumbersome layers. Dress to stand close, dance to pop and reggaeton, and move easily between bar and pavement.',
      'staff_inclusivity', 'Recent guests repeatedly describe sweet bartenders, a friendly DJ who takes requests and a genuinely welcoming neighbourhood mood. That warmth is the venue’s strongest practical signal. As in any busy one-room bar, service can slow when it packs out, but current reports lean distinctly kind rather than intimidating.',
      'venue_classification', 'active_small_gay_neighbourhood_video_and_dance_bar_with_pop_reggaeton_djs_and_afterwork',
      'source_urls', to_jsonb(array[
        'https://www.moeembarcelona.com/',
        'https://wanderlog.com/place/details/2145417/moeem-barcelona',
        'https://www.tripadvisor.com/Attraction_Review-g187497-d5918902-Reviews-Moeem_Barcelona-Barcelona_Catalonia.html',
        'https://www.travelgay.com/venue/moeem-barcelona',
        'https://barcelona.gaycities.com/bars/305621-moeem-barcelona',
        'https://qlist.app/cities/Spain/Barcelona/88'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_small_room_nine_pm_activity_saturday_density_and_afterwork_consensus','source_urls',to_jsonb(array['https://www.moeembarcelona.com/','https://wanderlog.com/place/details/2145417/moeem-barcelona','https://www.tripadvisor.com/Attraction_Review-g187497-d5918902-Reviews-Moeem_Barcelona-Barcelona_Catalonia.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_weekend_pop_reggaeton_dj_afterwork_and_schedule_variance_evidence','source_urls',to_jsonb(array['https://www.moeembarcelona.com/','https://www.travelgay.com/venue/moeem-barcelona','https://wanderlog.com/place/details/2145417/moeem-barcelona']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','gay_male_local_international_younger_older_and_neighbourhood_mix_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2145417/moeem-barcelona','https://barcelona.gaycities.com/bars/305621-moeem-barcelona','https://qlist.app/cities/Spain/Barcelona/88']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','casual_small_pop_reggaeton_dance_bar_context_without_published_formal_code','source_urls',to_jsonb(array['https://www.moeembarcelona.com/','https://www.travelgay.com/venue/moeem-barcelona','https://barcelona.gaycities.com/bars/305621-moeem-barcelona']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_friendly_bartender_dj_requests_and_welcoming_crowd_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2145417/moeem-barcelona','https://www.tripadvisor.com/Attraction_Review-g187497-d5918902-Reviews-Moeem_Barcelona-Barcelona_Catalonia.html','https://barcelona.gaycities.com/bars/305621-moeem-barcelona']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1666::bigint, jsonb_build_object(
      'queue_wait', 'Nitsa runs Friday and Saturday inside Sala Apolo, and a major lineup can sell out before the night. Buy the dated ticket; it secures entry but not a queue-free arrival. Doors open around 12:30 am, so arriving early reduces scanning and cloakroom pressure, while the post-2 am window carries the densest flow.',
      'best_nights', 'Friday and Saturday both work, but the bill should choose for you: Nitsa moves through techno, house, electro and disco while the second room can take a different route. Friday often feels like the cleaner music-first choice; Saturday has the broadest late-night pull. Read both rooms before booking.',
      'crowd_mix', 'Barcelona electronic regulars, students, clubbers and artist followers circulate between the two rooms. The crowd is diverse and visibly queer-friendly, but Nitsa itself is not a permanent queer-only session. A specifically queer promoter elsewhere in Apolo will produce a different balance from an ordinary weekend.',
      'dress_code', 'Club-casual and expressive clothes work; there is no polished-door requirement. Sports-team shirts and costumes are refused unless the night is themed. Wear durable shoes for two rooms and stairs, keep physical photo ID with you, and plan light layers—the practical test is dancing until six, not looking expensive.',
      'staff_inclusivity', 'Apolo backs the night with a staffed feminist and LGBTQ+ support point, an anti-aggression protocol, trained teams and first aid. That is stronger infrastructure than most clubs publish. Current guests still mention crowding and variable security encounters, so seek the support point early if a situation feels wrong.',
      'venue_classification', 'active_friday_saturday_electronic_club_session_inside_sala_apolo_with_two_rooms_and_safe_space_protocol',
      'source_urls', to_jsonb(array[
        'https://www.sala-apolo.com/en/clubs/nitsa',
        'https://sala-apolo.com/en/apolo-rules',
        'https://www.sala-apolo.com/en/faqs',
        'https://qlist.app/venues/Barcelona/Nitsa-Barcelona/alhtZGlnUVE0OGNVSVEzbEJIUkdQUQ',
        'https://www.tripadvisor.com/Attraction_Review-g187497-d571827-Reviews-Sala_Apolo-Barcelona_Catalonia.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_friday_saturday_hours_sellout_ticket_not_line_skip_and_late_peak_evidence','source_urls',to_jsonb(array['https://www.sala-apolo.com/en/clubs/nitsa','https://www.sala-apolo.com/en/faqs','https://qlist.app/venues/Barcelona/Nitsa-Barcelona/alhtZGlnUVE0OGNVSVEzbEJIUkdQUQ']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_friday_saturday_two_room_artist_led_techno_house_electro_disco_programme','source_urls',to_jsonb(array['https://www.sala-apolo.com/en/clubs/nitsa','https://qlist.app/venues/Barcelona/Nitsa-Barcelona/alhtZGlnUVE0OGNVSVEzbEJIUkdQUQ']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','electronic_local_student_visitor_artist_follower_diverse_and_not_permanently_queer_only_consensus','source_urls',to_jsonb(array['https://www.sala-apolo.com/en/clubs/nitsa','https://qlist.app/venues/Barcelona/Nitsa-Barcelona/alhtZGlnUVE0OGNVSVEzbEJIUkdQUQ','https://www.tripadvisor.com/Attraction_Review-g187497-d571827-Reviews-Sala_Apolo-Barcelona_Catalonia.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_sports_team_shirt_costume_id_rules_and_practical_two_room_context','source_urls',to_jsonb(array['https://sala-apolo.com/en/apolo-rules','https://www.sala-apolo.com/en/faqs']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_feminist_lgtbiq_support_point_no_callem_protocol_trained_team_and_first_aid','source_urls',to_jsonb(array['https://sala-apolo.com/en/apolo-rules','https://www.sala-apolo.com/en/faqs','https://www.sala-apolo.com/en/clubs/nitsa']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (184::bigint, jsonb_build_object(
      'queue_wait', 'A club ticket guarantees admission, not a fast lane, and the five-room complex creates several queues inside as well as at the door. Buy only through the official channel, carry physical ID and arrive before the 2–3 am surge. Sold-out lineups, cloakrooms, stairs and the smoking area can all add friction.',
      'best_nights', 'There is no single Razzmatazz night: the complex changes with each concert, club brand and room. Friday and Saturday offer the widest multi-room choice, but the best visit is the one whose actual lineup matches your music. A queer takeover, techno session and indie-pop night can feel like different venues.',
      'crowd_mix', 'The scale pulls Barcelona locals, students, tourists, concert audiences and international electronic or pop followers into one building. Queer guests are common and dedicated LGBTQ+ events recur, but an ordinary club night is broadly mainstream. Room and promoter predict the mix better than the Razzmatazz name.',
      'dress_code', 'No strict fashion code is published. Clubwear, streetwear, denim and trainers are standard; sports-team shirts, political-message clothing and flip-flops are poor choices. Use the paid lockers if needed, keep your bag small and wear shoes that can handle stairs, crowds and hours of moving between rooms.',
      'staff_inclusivity', 'The venue publishes zero tolerance for violence and discrimination, with response protocols, an equality lead and trained help. Many guests describe feeling safe; serious recent accounts also allege rude, aggressive or xenophobic security and weak assistance. Strong policy exists, but lived delivery is uneven.',
      'venue_classification', 'active_large_mainstream_multi_room_concert_and_club_complex_with_recurring_queer_events_and_formal_safety_protocol',
      'source_urls', to_jsonb(array[
        'https://www.salarazzmatazz.com/en/info/',
        'https://www.salarazzmatazz.com/en/respect/',
        'https://www.salarazzmatazz.com/en/the-venue/',
        'https://www.salarazzmatazz.com/en/',
        'https://www.tripadvisor.com/Attraction_Review-g187497-d244953-Reviews-Razzmatazz-Barcelona_Catalonia.html',
        'https://wanderlog.com/place/details/82378/razzmatazz',
        'https://www.reddit.com/r/AskBarcelona/comments/1qq2a0h/techno_clubs/',
        'https://www.reddit.com/r/AskBarcelona/comments/1t46kmy/clubbing_in_barcelona_for_the_first_time/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_ticket_not_line_skip_physical_id_multi_room_internal_queue_and_two_three_am_peak_consensus','source_urls',to_jsonb(array['https://www.salarazzmatazz.com/en/info/','https://wanderlog.com/place/details/82378/razzmatazz','https://www.reddit.com/r/AskBarcelona/comments/1t46kmy/clubbing_in_barcelona_for_the_first_time/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_multi_room_concert_club_brand_and_lineup_dependent_programme','source_urls',to_jsonb(array['https://www.salarazzmatazz.com/en/the-venue/','https://www.salarazzmatazz.com/en/','https://www.reddit.com/r/AskBarcelona/comments/1qq2a0h/techno_clubs/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','broad_local_student_tourist_concert_electronic_pop_and_recurring_queer_event_mix','source_urls',to_jsonb(array['https://www.salarazzmatazz.com/en/the-venue/','https://wanderlog.com/place/details/82378/razzmatazz','https://www.tripadvisor.com/Attraction_Review-g187497-d244953-Reviews-Razzmatazz-Barcelona_Catalonia.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_no_strict_code_prohibited_clothing_categories_and_locker_evidence','source_urls',to_jsonb(array['https://www.salarazzmatazz.com/en/info/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_anti_discrimination_protocol_and_equality_lead_balanced_against_serious_current_security_reports','source_urls',to_jsonb(array['https://www.salarazzmatazz.com/en/respect/','https://www.tripadvisor.com/Attraction_Review-g187497-d244953-Reviews-Razzmatazz-Barcelona_Catalonia.html','https://wanderlog.com/place/details/82378/razzmatazz']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (177::bigint, jsonb_build_object(
      'queue_wait', 'With two rooms and crowds around a thousand on major nights, Safari can process volume but still builds pressure after 2 am. An advance event ticket and arrival near the 12:30 am opening are the smoothest combination. Later entry depends on the branded party, so never treat every Friday or Saturday as identical.',
      'best_nights', 'Friday’s Bananas leans gay, pop, hits and reggaeton; Saturday’s YASS opens the room to a broader LGBTQ+ crowd with pop and house. POPAir is the sharper pick for bears, admirers and furry energy, while special festival dates draw international visitors. Choose the party name, not simply the weekday.',
      'crowd_mix', 'The crowd changes on purpose: Bananas centres gay men, YASS welcomes the wider LGBTQ+ spectrum, POPAir gathers bears and admirers, and festival dates turn international. Local regulars remain visible across them. This is a large queer club platform rather than one fixed demographic repeated every weekend.',
      'dress_code', 'Saturday explicitly invites you to come as you are, and relaxed dancewear, colour, trainers, mesh or a party-specific look all fit. POPAir and special themes can reward more body-positive or playful styling without making it compulsory. Bring physical ID, secure valuables and dress for six hours across two warm rooms.',
      'staff_inclusivity', 'The programme uses explicit LGBTQ+ and safe-space language, especially for YASS, and many guests enjoy the scale, music and easy crowd. Service reports are mixed, including a serious recent allegation that security escalated a conflict. The concept is inclusive; ask for a manager early if staff handling feels unsafe.',
      'venue_classification', 'active_large_two_room_lgbtq_club_hosting_bananas_yass_popair_and_special_events',
      'source_urls', to_jsonb(array[
        'https://www.safaridiscoclub.com/',
        'https://www.thegayagenda.fyi/barcelona/businesses/safari-disco-club/',
        'https://wanderlog.com/place/details/1973137/safari-disco-club',
        'https://es.travelgay.com/venue/safari-disco-club',
        'https://los40.com/2026/06/30/circuit-festival-2026-quien-actua-y-fechas-del-evento-lgtbiq-mas-importante-de-barcelona/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_two_room_thousand_person_event_advance_ticket_opening_and_post_two_am_pressure_evidence','source_urls',to_jsonb(array['https://www.safaridiscoclub.com/','https://wanderlog.com/place/details/1973137/safari-disco-club','https://es.travelgay.com/venue/safari-disco-club']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_current_bananas_friday_yass_saturday_popair_and_special_festival_programme','source_urls',to_jsonb(array['https://www.safaridiscoclub.com/','https://www.thegayagenda.fyi/barcelona/businesses/safari-disco-club/','https://los40.com/2026/06/30/circuit-festival-2026-quien-actua-y-fechas-del-evento-lgtbiq-mas-importante-de-barcelona/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','event_specific_gay_male_broad_lgbtq_bear_admirer_local_and_international_mix','source_urls',to_jsonb(array['https://www.safaridiscoclub.com/','https://www.thegayagenda.fyi/barcelona/businesses/safari-disco-club/','https://es.travelgay.com/venue/safari-disco-club']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_come_as_you_are_saturday_and_event_theme_context_without_formal_daily_code','source_urls',to_jsonb(array['https://www.safaridiscoclub.com/','https://www.thegayagenda.fyi/barcelona/businesses/safari-disco-club/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_lgbtq_safe_space_positioning_balanced_against_serious_current_security_counter_report','source_urls',to_jsonb(array['https://www.safaridiscoclub.com/','https://wanderlog.com/place/details/1973137/safari-disco-club']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1293::bigint, jsonb_build_object(
      'queue_wait', 'This daytime sauna is normally a reception check-in, not a nightclub queue. Saturday afternoon is the most consistently busy window, and current visitors also find a healthy crowd from roughly 3–6 pm on weekdays. No reservation is needed; arrive earlier if you want quieter facilities rather than more bodies.',
      'best_nights', 'Think afternoon, not night. Saturday after lunch brings the strongest social and cruising energy, while a weekday from mid-afternoon can still be lively without feeling maxed out. It closes around 10 pm, so this is the pre-dinner or pre-club sauna; late-night and after-hours plans belong elsewhere.',
      'crowd_mix', 'Mature men, daddies, chubby men and bears are the heart of the room, joined by younger chasers and admirers. Barcelona regulars mix with visitors, but the crowd feels more locally grounded than a festival-week circuit sauna. Everyone respectful is welcomed, while the male cruising identity remains explicit.',
      'dress_code', 'Reception gives you the sauna setup; inside, a towel rather than clubwear is the norm. Use shower footwear, rinse between facilities and keep the towel under you in the dry sauna. There is no body ideal to dress for—the practical code is hygiene, consent and comfort across pool, steam rooms and cruising areas.',
      'staff_inclusivity', 'Current guests often praise the cleanliness, friendly reception and staff who can help in English. The venue explicitly welcomes respectful visitors and asks people to report problems. Its strongest inclusion is age and body diversity among men; this remains a male gay sauna, not an all-genders wellness space.',
      'venue_classification', 'active_daytime_mens_gay_sauna_for_mature_daddy_chubby_bear_and_chaser_crowd',
      'source_urls', to_jsonb(array[
        'https://saunabruc.com/',
        'https://saunabruc.com/servicios/',
        'https://wanderlog.com/place/details/2550726/sauna-bruc',
        'https://www.top-rated.online/cities/Barcelona/place/p/11736914/Sauna%2BBruc',
        'https://www.reddit.com/r/gaytravel/comments/1u9loro/are_any_barcelona_bathhouses_actually_good/',
        'https://www.reddit.com/r/GayCruiseVacations/comments/1l8wv8f'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_no_reservation_reception_check_in_saturday_afternoon_and_three_six_pm_consensus','source_urls',to_jsonb(array['https://saunabruc.com/','https://wanderlog.com/place/details/2550726/sauna-bruc','https://www.reddit.com/r/GayCruiseVacations/comments/1l8wv8f']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_daily_daytime_hours_and_current_saturday_weekday_afternoon_peak_consensus','source_urls',to_jsonb(array['https://saunabruc.com/','https://wanderlog.com/place/details/2550726/sauna-bruc','https://www.reddit.com/r/gaytravel/comments/1u9loro/are_any_barcelona_bathhouses_actually_good/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_mature_daddy_chubby_bear_younger_chaser_admirer_local_visitor_mix','source_urls',to_jsonb(array['https://saunabruc.com/','https://www.top-rated.online/cities/Barcelona/place/p/11736914/Sauna%2BBruc','https://www.reddit.com/r/gaytravel/comments/1u9loro/are_any_barcelona_bathhouses_actually_good/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','male_sauna_towel_wet_facility_hygiene_and_consent_context','source_urls',to_jsonb(array['https://saunabruc.com/servicios/','https://wanderlog.com/place/details/2550726/sauna-bruc']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_clean_friendly_english_help_and_explicit_respect_reporting_consensus_with_male_scope','source_urls',to_jsonb(array['https://saunabruc.com/','https://wanderlog.com/place/details/2550726/sauna-bruc','https://www.top-rated.online/cities/Barcelona/place/p/11736914/Sauna%2BBruc']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (182::bigint, jsonb_build_object(
      'queue_wait', 'The 24-hour entrance is usually a quick reception check rather than a queue. Timing changes everything: Thursday around 2 am can be nearly empty, while Friday and Saturday after-club hours build toward 5–6 am. You may enter fast and still find the venue crowded upstairs, so reception speed is not a crowd gauge.',
      'best_nights', 'Friday and Saturday after the clubs—roughly midnight through early morning—bring the largest and often younger crowd. Lunch and early evening can work for a less intense visit; a random midweek night may be very quiet. The busiest dawn hours are also reported as more drug-heavy, which may decide your timing.',
      'crowd_mix', 'Gay and bisexual men from Barcelona mix with international visitors, with a younger and more sexual crowd after weekend clubs and a broader age range by day. Recent guests describe meeting locals as a real strength. The mix is male, direct and time-sensitive rather than a general LGBTQ+ social space.',
      'dress_code', 'Inside, expect towel or nudity rather than clothing; use shower shoes and keep locker instructions clear before leaving reception. Recent larger-bodied guests report that the standard towel can be too small, so ask about an extra or larger option before paying. Hygiene and consent matter far more than appearance.',
      'staff_inclusivity', 'Experiences split: some guests find reception and other visitors friendly, while others report rude service, language barriers and poor response to facility problems. Current complaints about mould smells, insects, cold or broken wet areas and maintenance are serious. Inspect conditions and leave if they feel unsafe.',
      'venue_classification', 'active_24_7_gay_mens_sauna_with_late_weekend_after_club_peak_and_serious_current_maintenance_concerns',
      'source_urls', to_jsonb(array[
        'https://www.saunaspases.com/saunacasanova/',
        'https://www.saunaspases.com/saunacasanova/wp-content/uploads/2026/01/Revista-Enero-2026.pdf',
        'https://wanderlog.com/place/details/2312404/sauna-gay-casanova',
        'https://www.tripadvisor.com/Attraction_Review-g187497-d28321108-Reviews-Sauna_Gay_Casanova-Barcelona_Catalonia.html',
        'https://www.reddit.com/r/gaytravel/comments/1ruoj88/gay_saunas_in_barcelona_recommendations/',
        'https://www.reddit.com/r/gaytravel/comments/1u9loro/are_any_barcelona_bathhouses_actually_good/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_24_7_access_quiet_midweek_and_friday_saturday_five_six_am_peak_consensus','source_urls',to_jsonb(array['https://www.saunaspases.com/saunacasanova/','https://www.reddit.com/r/gaytravel/comments/1ruoj88/gay_saunas_in_barcelona_recommendations/','https://wanderlog.com/place/details/2312404/sauna-gay-casanova']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_weekend_after_club_younger_peak_daytime_alternative_and_dawn_drug_context_consensus','source_urls',to_jsonb(array['https://www.reddit.com/r/gaytravel/comments/1ruoj88/gay_saunas_in_barcelona_recommendations/','https://www.reddit.com/r/gaytravel/comments/1u9loro/are_any_barcelona_bathhouses_actually_good/','https://wanderlog.com/place/details/2312404/sauna-gay-casanova']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','gay_bisexual_male_local_international_younger_after_club_and_broader_daytime_mix','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g187497-d28321108-Reviews-Sauna_Gay_Casanova-Barcelona_Catalonia.html','https://www.reddit.com/r/gaytravel/comments/1ruoj88/gay_saunas_in_barcelona_recommendations/','https://wanderlog.com/place/details/2312404/sauna-gay-casanova']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','towel_nudity_locker_shower_footwear_and_current_body_size_towel_access_context','source_urls',to_jsonb(array['https://www.saunaspases.com/saunacasanova/','https://wanderlog.com/place/details/2312404/sauna-gay-casanova']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','mixed_current_reception_service_and_serious_hygiene_maintenance_facility_failure_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2312404/sauna-gay-casanova','https://www.tripadvisor.com/Attraction_Review-g187497-d28321108-Reviews-Sauna_Gay_Casanova-Barcelona_Catalonia.html','https://www.reddit.com/r/gaytravel/comments/1u9loro/are_any_barcelona_bathhouses_actually_good/']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (1665, 176, 186, 1666, 184, 177, 1293, 182)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
