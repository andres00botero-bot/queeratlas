-- Queer Atlas venue intelligence: global review-led editorial pass, batch 22.
-- Asuncion community, adult venues and route context; Athens rooftop, Pride
-- network and queer nightlife. Checked 2026-08-05. Source names remain in
-- evidence metadata rather than reader-facing copy.

begin;

with reviewed(id, patch) as (
  values
    (929::bigint, jsonb_build_object(
      'queue_wait', 'There is no single door or queue: this record describes several downtown streets. Waiting only matters at a chosen event venue. The centre can empty quickly between addresses, so decide the destination first, use a ride for late transfers and never treat an unlit block as nightlife simply because it is on the route.',
      'best_nights', 'Use Centro only when a named bar, cultural space, community event or Pride programme gives the evening an anchor. Friday and Saturday offer the best chance of activity, but random bar-hopping is unreliable and much nightlife has shifted elsewhere. A confirmed event beats an improvised wander every time.',
      'crowd_mix', 'Downtown audiences change block by block: students, artists, local queer groups, bar regulars and visitors appear around specific cultural venues. There is no stable gay village or guaranteed LGBTQ+ majority. Queer visibility is strongest inside programmed spaces, not across the whole historic grid.',
      'dress_code', 'No corridor-wide code exists. Dress for heat, uneven pavements and direct car-to-door movement, then follow the actual event policy. Expressive looks suit queer cultural nights; a public street offers neither a door host nor club privacy, so plan comfort and transport as carefully as style.',
      'staff_inclusivity', 'A route has no staff, awareness team or shared complaints process. Safety depends on the host venue, and local accounts combine beloved inclusive cultural rooms with real caution about deserted downtown streets after dark. Save the organiser''s contact, travel with company when possible and judge each stop separately.',
      'venue_classification', 'downtown_route_context_not_a_physical_venue_or_gay_district',
      'record_status', 'misclassified_non_venue_route',
      'source_urls', to_jsonb(array[
        'https://qlist.app/cities/Paraguay/Asuncion/341',
        'https://www.gayout.com/south-america/paraguay/asuncion',
        'https://www.reddit.com/r/Paraguay/comments/1lnr5z5/alguien_me_puede_explicar_asunci%C3%B3n/',
        'https://www.reddit.com/r/Paraguay/comments/1c36nnh/existen_lugares_seguros_para_la_comunidad_lgbt_en/',
        'https://asunciontimes.com/lifestyle/bars-nightlife/club-constitucion-from-family-home-to-nightlife-hub-in-asuncion/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','route_classification_and_current_local_night_mobility_consensus','source_urls',to_jsonb(array['https://www.reddit.com/r/Paraguay/comments/1lnr5z5/alguien_me_puede_explicar_asunci%C3%B3n/','https://www.gayout.com/south-america/paraguay/asuncion','https://qlist.app/cities/Paraguay/Asuncion/341']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_event_led_nightlife_consensus','source_urls',to_jsonb(array['https://asunciontimes.com/lifestyle/bars-nightlife/club-constitucion-from-family-home-to-nightlife-hub-in-asuncion/','https://www.reddit.com/r/Paraguay/comments/1lnr5z5/alguien_me_puede_explicar_asunci%C3%B3n/','https://www.gayout.com/south-america/paraguay/asuncion']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_city_guide_and_local_community_consensus','source_urls',to_jsonb(array['https://qlist.app/cities/Paraguay/Asuncion/341','https://www.reddit.com/r/Paraguay/comments/1c36nnh/existen_lugares_seguros_para_la_comunidad_lgbt_en/','https://www.gayout.com/south-america/paraguay/asuncion']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','public_space_and_event_specific_practical_guidance','source_urls',to_jsonb(array['https://www.gayout.com/south-america/paraguay/asuncion','https://www.reddit.com/r/Paraguay/comments/1lnr5z5/alguien_me_puede_explicar_asunci%C3%B3n/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','no_shared_staff_with_current_local_safety_context','source_urls',to_jsonb(array['https://www.reddit.com/r/Paraguay/comments/1c36nnh/existen_lugares_seguros_para_la_comunidad_lgbt_en/','https://www.reddit.com/r/Paraguay/comments/1j7kefp/que_paso_en_el_centro_historico_de_asuncion/','https://qlist.app/cities/Paraguay/Asuncion/341']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (926::bigint, jsonb_build_object(
      'queue_wait', 'Menstetic works more like a walk-in sauna than a club door. Current listings place opening in mid-afternoon, with longer themed sessions on selected nights; no reliable queue pattern was found. Check the same-day social post before travelling, bring cash flexibility and allow a few minutes for entry.',
      'best_nights', 'Recent activity promotes nude Fridays and social Sundays; ordinary afternoons suit a quieter first look. The calendar changes through direct social posts rather than a dependable timetable. Pick a themed night for more bodies and energy, or daylight hours when facilities and orientation matter more than cruising.',
      'crowd_mix', 'This is a men''s desire space drawing gay and bisexual locals, discreet visitors and a mix of openly queer and closeted guests. A recent art project documented that emotional range rather than presenting one body type as the norm. Tourism is light; the room is primarily local and Spanish-speaking.',
      'dress_code', 'Arrive in simple clothes: the venue revolves around towels, nudity, wet areas, dark rooms and cabins rather than fashion. Nude events are advertised when they apply. Bring shower sandals and toiletries if that improves comfort, and never treat someone else''s discretion as permission to photograph.',
      'staff_inclusivity', 'The venue hosted a 2025 exhibition about male intimacy, but dependable recent service reviews are scarce. Older accounts range from acceptable to sharp criticism of hygiene, maintenance and impatient communication. Expect a Spanish-first, men-focused environment and inspect the facilities for yourself.',
      'venue_classification', 'active_mens_sauna_and_cruising_space_with_social_event_programming',
      'source_urls', to_jsonb(array[
        'https://x.com/menstetic_sauna',
        'https://twstalker.com/menstetic_sauna',
        'https://elnacional.com.py/agenda-cultural/se-inaugura-rojos-zepelines-sergio-ozuna-menstetic-sauna-n95733',
        'https://py.todosnegocios.com/menstetic-sauna-spa-0986-466701',
        'https://py.near-place.com/menstetic-sauna-spa-14-de-mayo-865-asuncion/en'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_listing_and_social_activity_with_no_stable_queue_evidence','source_urls',to_jsonb(array['https://x.com/menstetic_sauna','https://twstalker.com/menstetic_sauna','https://py.todosnegocios.com/menstetic-sauna-spa-0986-466701']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_social_event_signal','source_urls',to_jsonb(array['https://x.com/menstetic_sauna','https://twstalker.com/menstetic_sauna','https://py.todosnegocios.com/menstetic-sauna-spa-0986-466701']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_cultural_reporting_and_venue_classification','source_urls',to_jsonb(array['https://elnacional.com.py/agenda-cultural/se-inaugura-rojos-zepelines-sergio-ozuna-menstetic-sauna-n95733','https://www.youtube.com/watch?v=ALdpUwbQLUY','https://spartacus.gayguide.travel/saunas/southamerica/paraguay/asuncion']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','current_nude_event_signal_and_facility_listing','source_urls',to_jsonb(array['https://twstalker.com/menstetic_sauna','https://paraguay.worldplaces.me/es/review/93784113-menstetic-sauna.html','https://spartacus.gayguide.travel/saunas/southamerica/paraguay/asuncion']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','limited_current_service_evidence_with_older_mixed_reviews','source_urls',to_jsonb(array['https://elnacional.com.py/agenda-cultural/se-inaugura-rojos-zepelines-sergio-ozuna-menstetic-sauna-n95733','https://py.near-place.com/menstetic-sauna-spa-14-de-mayo-865-asuncion/en','https://www.tripadvisor.com.mx/Attraction_Review-g294080-d26732501-Reviews-Menstetic-Asuncion.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (928::bigint, jsonb_build_object(
      'queue_wait', 'This is a permanent community organisation, not a bar with nightly walk-ins. Contact the centre before visiting for health care, referrals, volunteering or an event; an appointment matters more than arrival time. Public programmes may be open, but office access should not be assumed from an old hours listing.',
      'best_nights', 'Choose the announced workshop, discussion, cultural event or Pride action that matches your needs. Daytime suits information and health referrals; special programmes can extend later. Treat the calendar as community infrastructure, not entertainment, and contact the team for the current format.',
      'crowd_mix', 'The house serves Paraguay''s wider LGBTI+ community, activists, volunteers and people seeking support. Its medical programme is designed for gay and bisexual men and other men who have sex with men, while advocacy is broader. Most visitors are local, and some arrive for help rather than socialising.',
      'dress_code', 'Everyday clothes are right. There is no nightlife costume or status test, and the centre serves people who may not be publicly out. Choose whatever lets you travel safely and speak comfortably. Follow the programme for a public Pride event; for a private consultation, discretion and ease come first.',
      'staff_inclusivity', 'This is a core Paraguayan LGBTI+ rights and health organisation, with a permanent home since 2013 and documented referral work. A current first-person account describes guidance through medical and psychological steps. That is meaningful evidence, though appointment availability still needs confirmation.',
      'venue_classification', 'permanent_lgbti_community_advocacy_and_health_center_not_nightlife',
      'source_urls', to_jsonb(array[
        'https://somosgay.org/',
        'https://somosgay.org/documents/SOMOSGAY%20Informe%20Anual%202020.pdf',
        'https://www.globalgiving.org/projects/defend-lgbti-rights-democracy-paraguay/reports/',
        'https://www.reddit.com/r/Paraguay/comments/1k91vni/deleted_by_user/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_community_center_model_with_schedule_confirmation_required','source_urls',to_jsonb(array['https://somosgay.org/','https://somosgay.org/documents/SOMOSGAY%20Informe%20Anual%202020.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','official_programme_and_service_model','source_urls',to_jsonb(array['https://somosgay.org/','https://www.globalgiving.org/projects/defend-lgbti-rights-democracy-paraguay/reports/','https://somosgay.org/documents/SOMOSGAY%20Informe%20Anual%202020.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_official_mission_and_clinic_scope','source_urls',to_jsonb(array['https://somosgay.org/','https://somosgay.org/documents/SOMOSGAY%20Informe%20Anual%202020.pdf','https://www.globalgiving.org/projects/defend-lgbti-rights-democracy-paraguay/reports/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_and_health_service_specific_guidance','source_urls',to_jsonb(array['https://somosgay.org/','https://www.reddit.com/r/Paraguay/comments/1k91vni/deleted_by_user/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','official_mission_with_independent_current_referral_signal','source_urls',to_jsonb(array['https://somosgay.org/','https://www.reddit.com/r/Paraguay/comments/1k91vni/deleted_by_user/','https://www.globalgiving.org/projects/defend-lgbti-rights-democracy-paraguay/reports/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (927::bigint, jsonb_build_object(
      'queue_wait', 'Historic listings describe a low-cost, walk-in erotic cinema rather than a ticketed club. No trustworthy current queue evidence or active official channel was found. If you still intend to visit, confirm the address and opening by phone on the same day; do not cross the city because a directory says it opens daily.',
      'best_nights', 'The surviving schedule suggests afternoon-to-late-night operation, with weekends slightly later. It is not current enough to name a best night. Go only after direct confirmation; if the line is inactive, choose an established sauna or advertised event instead of searching the block.',
      'crowd_mix', 'The documented format is adult and men-oriented: gay and bisexual locals use film rooms, cabins, a maze and dark areas for anonymous cruising. It is not a social LGBTQ+ bar or a mixed-group stop. Current crowd size and age balance cannot be responsibly inferred from old listings.',
      'dress_code', 'No formal code is documented. Discreet everyday clothes and shoes suited to dark corridors are the practical choice; bring only valuables you can keep controlled. Consent and privacy are the real rules in cabins and dark areas. Never photograph, and do not assume a private room changes another person''s boundaries.',
      'staff_inclusivity', 'There is too little recent evidence to rate the team warmly or negatively. Older descriptions cover the sexual layout, not care, consent enforcement or trans access. Treat the venue as unverified until direct contact confirms it operates, and leave if privacy, cleanliness or communication feels wrong.',
      'venue_classification', 'historically_listed_mens_erotic_cinema_and_cruise_space',
      'record_status', 'current_operation_not_independently_verified',
      'source_urls', to_jsonb(array[
        'https://paraguay.worldplaces.me/es/review/100271215-tom-cine.html',
        'https://py.todosnegocios.com/tom-cinegay-cruising-bar-0986-466701',
        'https://www.gays-cruising.com/es/cruising/cine_tom_cruising_bar_nuestra_senora_santa_maria_de_la_asuncion_paraguay_8413',
        'https://angelloveron.blogspot.com/2015/02/lugares-para-gays-en-paraguay.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','historical_walk_in_model_with_current_verification_gap','source_urls',to_jsonb(array['https://paraguay.worldplaces.me/es/review/100271215-tom-cine.html','https://py.todosnegocios.com/tom-cinegay-cruising-bar-0986-466701']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','conflicting_directory_hours_without_current_official_confirmation','source_urls',to_jsonb(array['https://paraguay.worldplaces.me/es/review/100271215-tom-cine.html','https://py.todosnegocios.com/tom-cinegay-cruising-bar-0986-466701','https://www.gays-cruising.com/es/cruising/cine_tom_cruising_bar_nuestra_senora_santa_maria_de_la_asuncion_paraguay_8413']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','historical_venue_format_no_current_demographic_evidence','source_urls',to_jsonb(array['https://www.gays-cruising.com/es/cruising/cine_tom_cruising_bar_nuestra_senora_santa_maria_de_la_asuncion_paraguay_8413','https://angelloveron.blogspot.com/2015/02/lugares-para-gays-en-paraguay.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','historical_layout_based_practical_guidance_no_published_code','source_urls',to_jsonb(array['https://www.gays-cruising.com/es/cruising/cine_tom_cruising_bar_nuestra_senora_santa_maria_de_la_asuncion_paraguay_8413','https://angelloveron.blogspot.com/2015/02/lugares-para-gays-en-paraguay.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','insufficient_recent_independent_service_or_policy_evidence','source_urls',to_jsonb(array['https://paraguay.worldplaces.me/es/review/100271215-tom-cine.html','https://py.todosnegocios.com/tom-cinegay-cruising-bar-0986-466701']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (855::bigint, jsonb_build_object(
      'queue_wait', 'The rooftop''s Acropolis view creates the wait, especially at sunset. Without a reservation, weekday afternoons or early evenings offer the best chance of a window table; peak guests may share tables or move with weather changes. Hotel guests can receive priority help, but the bar remains busy and visitor-heavy.',
      'best_nights', 'Go before sunset for the full shift from Monastiraki rooftops to the illuminated Acropolis. A weekday is calmer and better for conversation; Friday and Saturday bring more buzz but less control over the view. Breakfast or coffee gives you the panorama without turning the visit into an expensive nightlife mission.',
      'crowd_mix', 'International hotel guests and rooftop-seeking tourists dominate, joined by dates and young Athenians who still value the view. LGBTQ+ couples are part of a broad mainstream audience, not the programmed centre. This works as a polished scenic stop before queer Gazi, not as evidence of a queer community venue.',
      'dress_code', 'Smart-casual is the safest read: clean trainers or sandals, good jeans, a shirt, dress or relaxed tailoring. Athens rooftops rarely demand formalwear, but beach clothes can feel underdressed at dinner. Add a light layer for the terrace and let the view do the theatre; there is no queer or fetish cue here.',
      'staff_inclusivity', 'Current guests often praise kind, proactive staff, including thoughtful honeymoon help and efforts to find tables when crowded. Slower service and occasional brusqueness also appear. No meaningful queer-specific policy or review base was found, so this is strong mainstream hospitality, not community expertise.',
      'venue_classification', 'mainstream_boutique_hotel_rooftop_bar_not_queer_specific',
      'source_urls', to_jsonb(array[
        'https://www.aforathens.com/',
        'https://wanderlog.com/place/details/378642/a-for-athens',
        'https://www.tripadvisor.com/Attraction_Review-g189400-d2665318-Reviews-A_for_Athens_Cocktail_Bar-Athens_Attica.html',
        'https://www.booking.com/hotel/gr/a-for-athens.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_reservation_and_peak_seating_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/378642/a-for-athens','https://www.tripadvisor.com/Attraction_Review-g189400-d2665318-Reviews-A_for_Athens_Cocktail_Bar-Athens_Attica.html','https://www.tripadvisor.co.uk/FAQ-g189400-d2665318-A_For_Athens.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_visit_pattern_and_review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/378642/a-for-athens','https://www.tripadvisor.com/Attraction_Review-g189400-d2665318-Reviews-A_for_Athens_Cocktail_Bar-Athens_Attica.html','https://www.thehotelguru.com/en-us/hotel/a-for-athens-athens']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','mainstream_hotel_classification_and_current_guest_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/378642/a-for-athens','https://www.booking.com/hotel/gr/a-for-athens.html','https://www.thehotelguru.com/en-us/hotel/a-for-athens-athens']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','rooftop_category_and_local_practical_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/FAQ-g189400-d2665318-A_For_Athens.html','https://www.reddit.com/r/GreeceTravel/comments/15z3xur/mirame_athens_dresscode/','https://www.enprimeurclub.com/bars/a-for-athens-athens-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_general_hospitality_with_limited_queer_specific_evidence','source_urls',to_jsonb(array['https://wanderlog.com/place/details/378642/a-for-athens','https://www.booking.com/hotel/gr/a-for-athens.html','https://www.reddit.com/r/GreeceTravel/comments/1mq2yiv/hotel_in_athens_with_acropolis_view/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (327::bigint, jsonb_build_object(
      'queue_wait', 'Athens Pride Hub is not one building or one door. It describes partner venues and events distributed across the city, each with its own capacity, tickets and access. Check the individual listing before leaving; a gallery talk may be walk-in while a headline party can sell out or hold a late queue.',
      'best_nights', 'Follow the live festival programme rather than this map pin. In 2026, events spread across the city before the 13 June parade and also appear in spring and autumn windows. Pick a workshop, screening, talk or party by host and audience; the Hub label alone does not tell you what kind of evening it will be.',
      'crowd_mix', 'The network connects many rooms, so no single crowd profile is honest. One event may centre trans artists, another families, refugees, intersex voices, club kids or the general public. The shared thread is LGBTQI+ visibility and advocacy, while the balance of locals, tourists and allies belongs to each host.',
      'dress_code', 'There is no network-wide look. Wear everyday clothes to a discussion, movement-friendly shoes to a march and whatever the party flyer invites. Some themes reward full imagination; others are civic or educational. Official activities may be photographed, so plan visibility with care if you are not publicly out.',
      'staff_inclusivity', 'The organiser centres safety, dignity and marginalised groups, and recruits volunteers to build open spaces. Partner venues still control their own door and response. Use the named organiser for concerns, but do not assume every Hub-branded location has identical training or access standards.',
      'venue_classification', 'distributed_pride_partner_event_network_not_a_physical_venue',
      'record_status', 'misclassified_non_venue_network',
      'source_urls', to_jsonb(array[
        'https://athenspride.eu/en/',
        'https://athenspride.eu/anoichto-kalesma-ekdiloseon-2026/',
        'https://athenspride.eu/ela-opos-eisai/',
        'https://www.oneman.gr/onecity/urban/ston-pireto-tou-athens-pride-ligo-prin-ti-megali-parelasi-perifanias/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','distributed_network_classification_and_event_specific_access','source_urls',to_jsonb(array['https://athenspride.eu/anoichto-kalesma-ekdiloseon-2026/','https://www.oneman.gr/onecity/urban/ston-pireto-tou-athens-pride-ligo-prin-ti-megali-parelasi-perifanias/','https://athenspride.eu/en/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_current_2026_distributed_programme','source_urls',to_jsonb(array['https://athenspride.eu/en/','https://athenspride.eu/anoichto-kalesma-ekdiloseon-2026/','https://yourathensguide.gr/?a=detail&functionid=7&m=about']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_identity_scope_and_multi_format_programme','source_urls',to_jsonb(array['https://athenspride.eu/en/','https://athenspride.eu/anoichto-kalesma-ekdiloseon-2026/','https://www.visitgreece.gr/events/festival/athens-pride-2025/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','event_specific_guidance_with_explicit_media_policy','source_urls',to_jsonb(array['https://athenspride.eu/en/','https://athenspride.eu/anoichto-kalesma-ekdiloseon-2026/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_official_mission_and_volunteer_structure_with_partner_variance','source_urls',to_jsonb(array['https://athenspride.eu/en/','https://athenspride.eu/ela-opos-eisai/','https://athenspride.eu/en/poioi-eimaste/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (320::bigint, jsonb_build_object(
      'queue_wait', 'The room is small and has long been known to fill, so the pressure comes after midnight rather than at the 11:55 pm opening. Friday and Saturday run until roughly 6 am in season. Arrive near opening for an easier door and some floor space; later entry trades the wait for the club at full queer temperature.',
      'best_nights', 'Friday is the clearest drag night; Saturday shifts toward changing DJs and themes. The season usually runs September through July and pauses in August, so summer visitors must check socials. One-off concepts can be the highlight: choose the performer or theme that speaks to you, not simply the busiest date.',
      'crowd_mix', 'Young queer Athenians, drag fans, gay men, gender-fluid club kids, international visitors and straight friends create a mixed but unmistakably LGBTQ+ room. Some nights skew heavily male; others broaden around performance and theme. It is more alternative and expressive than a conventional gay pop club.',
      'dress_code', 'Self-expression wins, but read the flyer: some parties set a playful theme while regular weekends accept casual clubwear. Trainers, mesh, vintage drama, makeup and an ordinary tee can all work when worn with intent. The space gets tight and sweaty, so build the look for dancing rather than a rooftop photo.',
      'staff_inclusivity', 'Community accounts frame the club as safe, welcoming and protective, with an attentive door that takes the room seriously. The city guide also treats it as a core queer venue. Detailed consent and incident procedures are hard to find, so the strong rating rests on lived experience rather than transparent policy.',
      'venue_classification', 'queer_nightclub_with_drag_and_theme_led_weekends',
      'source_urls', to_jsonb(array[
        'https://www.facebook.com/bequeerathens/',
        'https://www.thisisathens.org/nightlife/bequeer',
        'https://www.travelgay.com/venue/bequeer',
        'https://www.corner.inc/place/pfktcLoPssvA',
        'https://www.reddit.com/r/Athens_Greece/comments/1qsbhnb/gayqueer_club_recommendations_for_2025_year_olds/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_schedule_and_small_capacity_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/bequeer','https://www.corner.inc/place/pfktcLoPssvA','https://www.thisisathens.org/nightlife/bequeer']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_current_weekly_and_seasonal_programme','source_urls',to_jsonb(array['https://www.travelgay.com/venue/bequeer','https://events.musicofourdesire.com/event/0jcp-nesiotiko-pisoglenti-party-athens-greece','https://www.facebook.com/bequeerathens/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_city_classification_and_current_community_consensus','source_urls',to_jsonb(array['https://www.thisisathens.org/nightlife/bequeer','https://www.reddit.com/r/Athens_Greece/comments/1qsbhnb/gayqueer_club_recommendations_for_2025_year_olds/','https://www.reddit.com/r/Athens_Greece/comments/1t9yogl/any_queer_friendly_clubs_recommended/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','theme_led_programme_and_current_cultural_reporting','source_urls',to_jsonb(array['https://www.facebook.com/bequeerathens/','https://www.athensvoice.gr/life/life-in-athens/877278/femmeland-ekei-pou-kuvernoun-oi-thilukotites/','https://www.travelgay.com/venue/bequeer']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_community_safety_consensus_limited_published_policy','source_urls',to_jsonb(array['https://www.corner.inc/place/pfktcLoPssvA','https://www.thisisathens.org/nightlife/bequeer','https://www.travelgay.com/venue/bequeer']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (323::bigint, jsonb_build_object(
      'queue_wait', 'BIG opens earlier than most of gay Athens and is usually an easy walk-in before midnight. Its small room can become packed and warm on Saturday or a drag night, but the constraint is space rather than a selective door. Come around 8-10 pm to claim a bar conversation; arrive later for the full bear huddle.',
      'best_nights', 'Saturday is the busiest and best for a lively bear crowd, with weekend drag or karaoke worth checking before you go. A Tuesday-to-Thursday visit is quieter and unusually good for talking to the bartender or meeting one table at a time. Use it as the warm first stop before Gazi turns properly late.',
      'crowd_mix', 'Bears, cubs, chasers and their friends are the heart of the room, with locals and international visitors mixing across a wider age range than youth clubs. The bear identity is clear without making the bar menacing or exclusive. Drag and karaoke nights broaden the audience while keeping the neighbourhood-bar intimacy.',
      'dress_code', 'Casual is the point: jeans, shorts, trainers, a bear tee, leather accents or ordinary holiday clothes all land naturally. There is no body-standard audition and no need to perform masculinity. Dress lightly in summer because the compact room can run warm; smoke and ventilation are more practical concerns than fashion.',
      'staff_inclusivity', 'Friendly, chatty bartenders dominate current accounts, often helping solo visitors feel at home and sharing local tips without attitude. Guests also note an improved atmosphere. The recurring caveats are indoor smoke or weak ventilation and occasional price complaints, not a pattern of exclusion.',
      'venue_classification', 'long_running_gay_bear_bar_open_to_bears_and_friends',
      'source_urls', to_jsonb(array[
        'https://www.bigbar.gr/',
        'https://whereis.gay/big-bar-athens',
        'https://www.travelgay.com/venue/big',
        'https://athens.gaycities.com/bars/303571-big-bar',
        'https://www.gayplaces.co/city/athens/bar/big-bar'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_hours_and_small_capacity_consensus','source_urls',to_jsonb(array['https://whereis.gay/big-bar-athens','https://www.travelgay.com/venue/big','https://www.gayplaces.co/city/athens/bar/big-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_weekly_pattern_and_programme_consensus','source_urls',to_jsonb(array['https://whereis.gay/big-bar-athens','https://www.travelgay.com/venue/big','https://www.gayplaces.co/city/athens/bar/big-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_bear_identity_and_current_review_consensus','source_urls',to_jsonb(array['https://whereis.gay/big-bar-athens','https://athens.gaycities.com/bars/303571-big-bar','https://www.travelgay.com/venue/big']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_casual_positioning_and_current_practical_reviews','source_urls',to_jsonb(array['https://athens.gaycities.com/bars/303571-big-bar','https://whereis.gay/big-bar-athens','https://www.travelgay.com/venue/big']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_service_consensus_with_ventilation_caveat','source_urls',to_jsonb(array['https://whereis.gay/big-bar-athens','https://www.travelgay.com/venue/big','https://athens.gaycities.com/bars/303571-big-bar']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (929, 926, 928, 927, 855, 327, 320, 323)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
