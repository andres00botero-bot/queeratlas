-- Queer Atlas venue intelligence: global review-led editorial pass, batch 25.
-- Atlanta, Austin and Seminyak nightlife plus one Austin hotel. Includes an
-- explicitly closed Bali record. Checked 2026-08-05. Source names remain in
-- evidence metadata rather than reader-facing copy.

begin;

with reviewed(id, patch) as (
  values
    (1932::bigint, jsonb_build_object(
      'queue_wait', 'A regular country lesson or neighbourhood night can be easy, but guest DJs, Pride and fetish takeovers create covers and real lines. Major promoters explicitly say to arrive early. Bring physical ID, check the ticket page and remember that the step-free entrance requires alerting staff.',
      'best_nights', 'Thursday country night is the friendliest entry point: free lessons begin early and beginners are welcome. Friday and Saturday turn darker, louder and more event-specific, with bears, leather, pop or international DJs. Monday drag is another long-running tradition. Pick the programme, not just the weekend.',
      'crowd_mix', 'Gay men anchor the room, but ages run from new twenty-somethings to longtime regulars, with bears, leather folk, country dancers, drag fans and visiting club crowds crossing paths. Some themed promoters explicitly welcome every gender and orientation; the ordinary bar still reads more male than all-queer.',
      'dress_code', 'Jeans, boots, tees and trainers work on casual nights. Leather, rubber, harnesses, sports gear or underwear belong when the flyer invites them; one current kink event requires underwear while only encouraging gear. Read the exact policy, use clothes check when offered and wear shoes for a long dance floor.',
      'staff_inclusivity', 'Recent guests describe organised events, friendly bartenders and a safe, loving atmosphere across ages and identities. Promoters publish unusually direct bans on racism, transphobia, femmephobia and body shaming. Event teams vary, and pricing can jump on major nights, but the current welcome evidence is strong.',
      'venue_classification', 'long_running_gay_dance_club_with_country_drag_leather_and_fetish_programming',
      'source_urls', to_jsonb(array[
        'http://www.hereticatlanta.com/calendar.html',
        'https://www.davidatlanta.com/venue/heretic-atlanta/',
        'https://www.kinkdownsouth.com/events/l-o-a-d-atlanta/',
        'https://www.theinfatuation.com/atlanta/reviews/heretic',
        'https://www.gayout.com/usa-canada/united-states/atlanta/bars/the-heretic-atlanta',
        'https://www.corner.inc/place/ps9XKvD9S2DC?listId=4c5bd3d4-4732-41c0-8371-34fac4421f6f'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_event_specific_ticketing_line_and_access_evidence','source_urls',to_jsonb(array['https://www.kinkdownsouth.com/events/l-o-a-d-atlanta/','https://www.davidatlanta.com/venue/heretic-atlanta/','https://www.corner.inc/place/ps9XKvD9S2DC?listId=4c5bd3d4-4732-41c0-8371-34fac4421f6f']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_current_multi_night_programme_and_review_consensus','source_urls',to_jsonb(array['https://www.davidatlanta.com/venue/heretic-atlanta/','http://www.hereticatlanta.com/calendar.html','https://www.gayout.com/usa-canada/united-states/atlanta/bars/the-heretic-atlanta']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_multi_programme_and_multi_age_community_consensus','source_urls',to_jsonb(array['https://www.kinkdownsouth.com/events/l-o-a-d-atlanta/','https://www.gayout.com/usa-canada/united-states/atlanta/bars/the-heretic-atlanta','https://www.corner.inc/place/ps9XKvD9S2DC?listId=4c5bd3d4-4732-41c0-8371-34fac4421f6f']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_current_event_code_and_casual_night_consensus','source_urls',to_jsonb(array['https://www.kinkdownsouth.com/events/l-o-a-d-atlanta/','https://www.theinfatuation.com/atlanta/reviews/heretic','https://www.davidatlanta.com/venue/heretic-atlanta/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_service_and_explicit_anti_bigotry_policy_evidence','source_urls',to_jsonb(array['https://www.kinkdownsouth.com/events/l-o-a-d-atlanta/','https://www.gayout.com/usa-canada/united-states/atlanta/bars/the-heretic-atlanta','https://www.davidatlanta.com/venue/heretic-atlanta/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1936::bigint, jsonb_build_object(
      'queue_wait', 'Ordinary afternoons are easy walk-ins, while a beloved local band, fundraiser, Pride date or SXSW showcase can fill the rock-walled patio. Some events ticket separately. Check the live calendar and arrive around doors for the music; on a casual night, the bar line is the only real wait.',
      'best_nights', 'The right night is the queer storyteller, femme-led electronic bill, drag show or local band you actually want. Thursday through Sunday are the published operating days, with weekends livelier. Come early for patio conversation, later for dancing. During SXSW, every normal rhythm disappears.',
      'crowd_mix', 'Queer women, trans and nonbinary Austinites, artists, musicians, dogs-on-the-patio regulars, visitors and straight friends make one of the city''s broadest queer-forward mixes. It is not an identity checkpoint. The room feels less centred on shirtless gay men than the Warehouse District dance clubs.',
      'dress_code', 'Austin-casual with imagination: cutoffs, boots, vintage, band tees, bright makeup, cowboy camp or an easy sundress all belong. There is no status door. Dress for an outdoor patio, uneven rock edges and heat; bring a layer only when the forecast earns it, and follow any costume prompt on the event flyer.',
      'staff_inclusivity', 'Friendly staff and an inclusive atmosphere recur in current reviews, and the programme still gives queer, sapphic and femme artists rare space. The ownership has also faced community distrust over fundraising, labour claims and a proposed sale. The venue matters; accountability remains part of its story.',
      'venue_classification', 'queer_forward_live_music_bar_and_community_patio_with_sapphic_and_gender_expansive_programming',
      'source_urls', to_jsonb(array[
        'https://cheerupcharlies.com/',
        'https://wanderlog.com/place/details/109509',
        'https://www.restaurantji.com/tx/austin/cheer-up-charlies-/',
        'https://www.austinchronicle.com/music/rapid-fundraisers-and-rabid-comments-whats-going-on-at-cheer-up-charlies-13458496/',
        'https://www.austinchronicle.com/music/cheer-up-charlies-owners-locked-out-of-building-the-day-before-sxsw/',
        'https://www.kut.org/business/2026-03-11/cheer-up-charlies-austin-tx-maggie-lea-tamara-hoover-town-hall'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_operating_calendar_and_event_driven_capacity_consensus','source_urls',to_jsonb(array['https://cheerupcharlies.com/','https://wanderlog.com/place/details/109509','https://www.austinchronicle.com/music/cheer-up-charlies-owners-locked-out-of-building-the-day-before-sxsw/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_thursday_to_sunday_schedule_and_queer_event_programme','source_urls',to_jsonb(array['https://cheerupcharlies.com/','https://www.austinchronicle.com/music/rapid-fundraisers-and-rabid-comments-whats-going-on-at-cheer-up-charlies-13458496/','https://wanderlog.com/place/details/109509']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_queer_sapphic_programming_and_current_diverse_crowd_consensus','source_urls',to_jsonb(array['https://www.austinchronicle.com/music/rapid-fundraisers-and-rabid-comments-whats-going-on-at-cheer-up-charlies-13458496/','https://wanderlog.com/place/details/109509','https://www.restaurantji.com/tx/austin/cheer-up-charlies-/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','casual_live_music_patio_context_with_no_published_general_code','source_urls',to_jsonb(array['https://cheerupcharlies.com/','https://wanderlog.com/place/details/109509','https://www.restaurantji.com/tx/austin/cheer-up-charlies-/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','positive_current_hospitality_balanced_against_documented_ownership_and_community_trust_dispute','source_urls',to_jsonb(array['https://www.restaurantji.com/tx/austin/cheer-up-charlies-/','https://www.austinchronicle.com/music/rapid-fundraisers-and-rabid-comments-whats-going-on-at-cheer-up-charlies-13458496/','https://www.kut.org/business/2026-03-11/cheer-up-charlies-austin-tx-maggie-lea-tamara-hoover-town-hall']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1937::bigint, jsonb_build_object(
      'queue_wait', 'The main floor gets packed after 11 pm on Friday and Saturday, and covers can rise for special dates. Multiple bars reduce drink waits, but re-entry and bag rules are not consistently published. Arrive near 9:30-10:30, carry minimal valuables and confirm the event terms before paying.',
      'best_nights', 'Friday leans electronic and dance-forward; Saturday brings the broadest late-night crowd and mixed pop energy. Sunday community or silent-disco concepts can feel more social. The basement wakes up later with darker light and a different soundtrack, so explore before deciding the whole club is one room.',
      'crowd_mix', 'Gay men remain prominent, joined by drag fans, queer women, trans and nonbinary guests, straight friends and Warehouse District bar-hoppers. The three-level scale allows several scenes at once, though Pride weekends can pull in a less community-minded party crowd. Locals dominate, with visitors easy to spot downtown.',
      'dress_code', 'Standard dance-club looks work: trainers, tanks, denim, crop tops, a drag-night flourish or full Austin casual. No dependable formal code is published, but oversized bags are a bad fit in the crowd. Wear something breathable and keep phone, card and ID secured when the main floor compresses.',
      'staff_inclusivity', 'Many recent guests praise caring teams, inclusive events, quick bartenders and a clean atmosphere. Counter-signals include poor lost-property handling, alleged card irregularities, stolen-phone reports and older drink-tampering concerns. Enjoy the welcome while keeping your drink and valuables controlled.',
      'venue_classification', 'large_multi_level_lgbtq_dance_club_with_drag_and_community_events',
      'source_urls', to_jsonb(array[
        'https://wanderlog.com/place/details/1049251',
        'https://www.restaurantji.com/tx/austin/highland-lounge-/',
        'https://www.tripadvisor.com/Attraction_Review-g30196-d7131752-Reviews-Highland_Lounge-Austin_Texas.html',
        'https://austin.gaycities.com/bars/305891-highland-lounge',
        'https://www.corner.inc/place/pnCKnY7iWFNy?listId=40ff542e-1866-4828-914e-bcc032d5ba70',
        'https://www.austinmonthly.com/events/sunday-silent-disco-night-at-highland-lounge/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_peak_capacity_cover_and_multi_bar_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1049251','https://www.restaurantji.com/tx/austin/highland-lounge-/','https://www.corner.inc/place/pnCKnY7iWFNy?listId=40ff542e-1866-4828-914e-bcc032d5ba70']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_weekend_music_pattern_and_sunday_event_evidence','source_urls',to_jsonb(array['https://www.restaurantji.com/tx/austin/highland-lounge-/','https://www.austinmonthly.com/events/sunday-silent-disco-night-at-highland-lounge/','https://wanderlog.com/place/details/1049251']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_mixed_lgbtq_classification_and_local_community_context','source_urls',to_jsonb(array['https://austin.gaycities.com/bars/305891-highland-lounge','https://wanderlog.com/place/details/1049251','https://www.austinchronicle.com/wp-content/uploads/issues/2026-06-26/chronicle.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','dance_club_practical_consensus_with_no_published_general_code','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1049251','https://www.restaurantji.com/tx/austin/highland-lounge-/','https://www.reddit.com/r/OutInAustin/comments/1ug3xkt/highland_lounge_bag_policy/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','material_mixed_current_service_and_safety_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1049251','https://www.restaurantji.com/tx/austin/highland-lounge-/','https://www.reddit.com/r/Austin/comments/1922igu/3_separate_encounters_of_being_drugged_at_highland/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1935::bigint, jsonb_build_object(
      'queue_wait', 'Open from 11 am to 2 am, this is usually a walk-in bar and kitchen rather than a selective club door. Lunch and early happy-hour hours are easy; Friday and Saturday can make the large room busy and loud. It does not generally take reservations, so groups should arrive before the late crowd.',
      'best_nights', 'Start with a weekday meal, karaoke, trivia or the event that fits you; the bar is unusually useful before midnight. Friday and Saturday bring the biggest dance-floor energy, while a Thursday can balance conversation and nightlife. Check the current calendar because bear-owned does not mean every night feels the same.',
      'crowd_mix', 'Bears, cubs, otters, chasers and friends are the emotional centre, but the owners have built a relaxed room for all bodies and personalities. Gay men dominate late nights; lunch, food service and community events broaden the mix. It feels local and conversational before becoming a downtown dance bar.',
      'dress_code', 'Come as you are: bear tees, denim, shorts, boots, leather touches, office clothes at lunch or trainers for the back dance floor. There is no body audition and no need to perform a hypermasculine look. Dress for Austin heat and eating first; bring the gear only when a theme calls for it.',
      'staff_inclusivity', 'Current local coverage describes a chill, welcoming, body-positive hangout, and recent ratings praise service and an at-home feeling. A detailed 2024 solo review reports threatening regulars and dismissive staff, so the record is not spotless. The broad consensus is warm, with individual conflict handling less certain.',
      'venue_classification', 'bear_owned_gay_bar_kitchen_and_dance_space_open_to_all_body_types_and_friends',
      'source_urls', to_jsonb(array[
        'https://www.theironbear.com/',
        'https://www.theironbear.com/contact.html',
        'https://www.theinfatuation.com/austin/reviews/the-iron-bear',
        'https://www.restaurantji.com/tx/austin/the-iron-bear-/',
        'https://www.tripadvisor.com/Attraction_Review-g30196-d6772602-Reviews-The_Iron_Bear-Austin_Texas.html',
        'https://www.travelgay.com/austin-gay-bars'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_current_all_day_hours_no_reservation_and_peak_crowd_consensus','source_urls',to_jsonb(array['https://www.theironbear.com/','https://www.restaurantji.com/tx/austin/the-iron-bear-/','https://www.tripadvisor.com/Attraction_Review-g30196-d6772602-Reviews-The_Iron_Bear-Austin_Texas.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_all_day_bar_model_and_weekend_event_consensus','source_urls',to_jsonb(array['https://www.theironbear.com/','https://www.restaurantji.com/tx/austin/the-iron-bear-/','https://www.theinfatuation.com/austin/reviews/the-iron-bear']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_bear_ownership_and_current_all_body_welcome_consensus','source_urls',to_jsonb(array['https://www.theironbear.com/','https://www.theinfatuation.com/austin/reviews/the-iron-bear','https://www.travelgay.com/austin-gay-bars']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','casual_bar_kitchen_and_bear_scene_context_no_general_code','source_urls',to_jsonb(array['https://www.theinfatuation.com/austin/reviews/the-iron-bear','https://www.restaurantji.com/tx/austin/the-iron-bear-/','https://www.theironbear.com/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_welcome_consensus_balanced_against_specific_2024_conflict_report','source_urls',to_jsonb(array['https://www.theinfatuation.com/austin/reviews/the-iron-bear','https://www.restaurantji.com/tx/austin/the-iron-bear-/','https://www.tripadvisor.com/Attraction_Review-g30196-d6772602-Reviews-The_Iron_Bear-Austin_Texas.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1938::bigint, jsonb_build_object(
      'queue_wait', 'Hotel check-in is the main arrival; direct bookings can request flexible timing when available. The popular pool, lobby restaurants and rooftop can create weekend waits even for guests, and dining priority is a direct-booking perk. Reserve the rooftop and confirm pool access before planning around either.',
      'best_nights', 'Stay for Lady Bird Lake, downtown access and the pool-to-rooftop rhythm. A weekday gives the design hotel more calm; Friday and Saturday bring Austin energy, higher demand and more noise. Pride or festival weekends amplify everything, so choose them for atmosphere only if crowds and rates are part of the deal.',
      'crowd_mix', 'Design-conscious tourists, couples, business travellers, wedding groups and locals using the restaurants and rooftop create a stylish mainstream mix. Queer guests fit naturally into downtown Austin, but the hotel is not LGBTQ+-specific. Visitors dominate the rooms; the social spaces pull more locals after work.',
      'dress_code', 'Poolwear and relaxed city basics work by day; P6 rooftop leans polished casual without requiring formal clothes. Think linen, clean trainers, denim, a dress or easy tailoring. Keep a layer for hard air-conditioning and build the look for Texas heat, not for an imagined velvet rope.',
      'staff_inclusivity', 'Current guests often praise friendly, responsive teams and a strong lobby and pool welcome, while fees, noise and inconsistent follow-through recur in criticism. No current queer-specific policy or community programme was found. This is confident mainstream Austin hospitality rather than a dedicated queer stay.',
      'venue_classification', 'mainstream_design_hotel_with_pool_restaurants_and_rooftop_not_queer_specific',
      'source_urls', to_jsonb(array[
        'https://www.thelinehotel.com/austin/',
        'https://www.thelinehotel.com/austin/about-us/',
        'https://www.thelinehotel.com/austin/offers/summer2026/',
        'https://www.booking.com/reviews/us/hotel/the-line-austin.en-gb.html',
        'https://www.tripadvisor.com/Hotel_Review-g30196-d98457-Reviews-The_LINE_Austin-Austin_Texas.html',
        'https://www.reddit.com/r/askaustin/comments/1sh0lmy/hotel_pick_jw_marriot_or_the_line/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_direct_booking_arrival_and_priority_dining_terms_with_guest_flow_consensus','source_urls',to_jsonb(array['https://www.thelinehotel.com/austin/offers/summer2026/','https://www.booking.com/reviews/us/hotel/the-line-austin.en-gb.html','https://www.tripadvisor.com/Hotel_Review-g30196-d98457-Reviews-The_LINE_Austin-Austin_Texas.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_hotel_offer_and_weekend_atmosphere_noise_consensus','source_urls',to_jsonb(array['https://www.thelinehotel.com/austin/','https://www.thelinehotel.com/austin/offers/summer2026/','https://www.tripadvisor.com/Hotel_Review-g30196-d98457-Reviews-The_LINE_Austin-Austin_Texas.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','mainstream_design_hotel_classification_and_current_guest_consensus','source_urls',to_jsonb(array['https://www.thelinehotel.com/austin/about-us/','https://www.booking.com/reviews/us/hotel/the-line-austin.en-gb.html','https://www.reddit.com/r/askaustin/comments/1sh0lmy/hotel_pick_jw_marriot_or_the_line/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','pool_rooftop_and_design_hotel_context_no_published_formal_code','source_urls',to_jsonb(array['https://www.thelinehotel.com/austin/','https://www.thelinehotel.com/austin/about-us/','https://www.reddit.com/r/askaustin/comments/1sh0lmy/hotel_pick_jw_marriot_or_the_line/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','mixed_current_general_hospitality_consensus_limited_queer_specific_evidence','source_urls',to_jsonb(array['https://www.booking.com/reviews/us/hotel/the-line-austin.en-gb.html','https://www.tripadvisor.com/Hotel_Review-g30196-d98457-Reviews-The_LINE_Austin-Austin_Texas.html','https://www.thelinehotel.com/austin/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1151::bigint, jsonb_build_object(
      'queue_wait', 'Entry is commonly free and the small room fills fast rather than forming a formal queue. Weekends and drag sets can leave little standing space, so arrive around 9-10 pm for a seat and conversation. On a packed night, moving between the neighbouring bars is easier than guarding one stool all evening.',
      'best_nights', 'Friday and Saturday deliver the loudest, fullest drag-and-dance experience; a weekday keeps the same playful show with more breathing room. Performances roll through the late evening, so come after dinner and stay for more than one number. The whole Seminyak strip peaks toward midnight.',
      'crowd_mix', 'Gay men are the core, alongside Balinese regulars, international holidaymakers, drag fans, queer women and straight friends. Recent guests describe locals, repeat visitors and first-timers mixing easily. It is tourist-heavy, yet performers and staff keep the night rooted in Bali rather than a generic resort club.',
      'dress_code', 'Beach-holiday casual wins: tanks, shorts, a breezy shirt, sandals you can safely dance in or a little extra sparkle for the queens. There is no formal door code. Dress lightly for smoke and crowd heat, keep the bag small and secure, and bring respect rather than a costume of someone else''s culture.',
      'staff_inclusivity', 'Recent 2025-2026 reviews repeatedly praise attentive staff, interactive queens and a relaxed welcome across LGBTQ+ guests and allies. The recurring comfort caveats are indoor smoke and tight capacity, not identity-based hostility. Watch your drink and bill as anywhere busy, but the hospitality signal is notably warm.',
      'venue_classification', 'active_long_running_gay_bar_with_drag_dance_and_mixed_lgbtq_ally_crowd',
      'source_urls', to_jsonb(array[
        'https://wanderlog.com/place/details/436393/balijoe-bar',
        'https://www.travelgay.com/bali-gay-bars-and-dance-clubs',
        'https://www.reddit.com/r/BaliTravelTips/comments/1sq26b9/weird_question/',
        'https://www.reddit.com/r/BaliTravelTips/comments/1uly7yr/big_clubs/',
        'https://www.reddit.com/r/BaliTravelTips/comments/1o6cfof/any_warungbar_reccomendations_for_a_gay_woman/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_free_entry_small_capacity_and_peak_crowd_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/436393/balijoe-bar','https://www.travelgay.com/bali-gay-bars-and-dance-clubs','https://www.reddit.com/r/BaliTravelTips/comments/1sq26b9/weird_question/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_weekend_peak_and_drag_show_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/436393/balijoe-bar','https://www.travelgay.com/bali-gay-bars-and-dance-clubs','https://www.reddit.com/r/BaliTravelTips/comments/1uly7yr/big_clubs/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_local_tourist_lgbtq_and_ally_review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/436393/balijoe-bar','https://www.reddit.com/r/BaliTravelTips/comments/1o6cfof/any_warungbar_reccomendations_for_a_gay_woman/','https://www.reddit.com/r/indonesia/comments/1tnz2sk/straight_girl_here_di_bali_ternyata_ada_open_queer_club_ya/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','casual_tropical_bar_consensus_with_no_formal_code','source_urls',to_jsonb(array['https://wanderlog.com/place/details/436393/balijoe-bar','https://www.travelgay.com/bali-gay-bars-and-dance-clubs']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_welcome_and_service_consensus_with_smoke_capacity_caveats','source_urls',to_jsonb(array['https://wanderlog.com/place/details/436393/balijoe-bar','https://www.reddit.com/r/BaliTravelTips/comments/1uly7yr/big_clubs/','https://www.reddit.com/r/BaliTravelTips/comments/1o6cfof/any_warungbar_reccomendations_for_a_gay_woman/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1167::bigint, jsonb_build_object(
      'queue_wait', 'Do not plan a queue or bar hop around this listing: current map and specialist sources mark F Bar, formerly Face Bar, permanently closed. Some 2025-2026 guides still repeat its old hours, shows and phone number. Treat those as stale until a verified official channel announces a reopening.',
      'best_nights', 'There is no best night while the venue is closed. Historic advice placed the go-go and drag programme after 10 pm, but repeating that now would send people to a dead door. For the same Seminyak strip, choose an independently active neighbouring bar and verify its same-day post.',
      'crowd_mix', 'Historically this small gay bar mixed international visitors, local partygoers, drag fans and a male go-go audience. That is archival context, not a present crowd forecast. Current travellers consistently name two principal active gay bars on the strip, which further supports removing F Bar from live recommendations.',
      'dress_code', 'No current dress code exists because the business is not operating. Old descriptions suggest relaxed tropical clubwear, but they should not be presented as practical advice for tonight. Dress for the active venue you select instead and confirm its location before getting into Seminyak traffic.',
      'staff_inclusivity', 'There is no current team to rate. Older reviews praised the DJ and a lively crowd while raising concerns about change, drink substitutions, smoke and rough service. Those accounts explain the former experience but cannot establish present hospitality. The useful editorial action is to label the record closed.',
      'venue_classification', 'closed_former_gay_bar_with_drag_and_go_go_programming',
      'record_status', 'permanently_closed',
      'source_urls', to_jsonb(array[
        'https://wanderlog.com/place/details/4566223',
        'https://sv.travelgay.com/venue/facebar-bali',
        'https://wanderlog.com/list/geoCategory/1811900/best-gay-bars-in-seminyak',
        'https://www.reddit.com/r/BaliTravelTips/comments/1sq26b9/weird_question/',
        'https://www.reddit.com/r/gaytravel/comments/1swulpf/solo_gay_traveler_in_finns_baratlas_bali/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multiple_current_closed_signals_overriding_stale_guide_hours','source_urls',to_jsonb(array['https://wanderlog.com/place/details/4566223','https://sv.travelgay.com/venue/facebar-bali','https://wanderlog.com/list/geoCategory/1811900/best-gay-bars-in-seminyak']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','closed_status_with_historical_programme_only','source_urls',to_jsonb(array['https://sv.travelgay.com/venue/facebar-bali','https://wanderlog.com/place/details/4566223','https://www.reddit.com/r/BaliTravelTips/comments/1sq26b9/weird_question/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','historical_crowd_context_and_current_two_active_bar_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/4566223','https://www.reddit.com/r/gaytravel/comments/1swulpf/solo_gay_traveler_in_finns_baratlas_bali/','https://www.reddit.com/r/BaliTravelTips/comments/1sq26b9/weird_question/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','closed_status_no_current_code','source_urls',to_jsonb(array['https://sv.travelgay.com/venue/facebar-bali','https://wanderlog.com/place/details/4566223']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','no_current_staff_with_mixed_historical_service_evidence','source_urls',to_jsonb(array['https://wanderlog.com/place/details/4566223','https://app.wanderlog.com/list/geoCategory/1811900/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1159::bigint, jsonb_build_object(
      'queue_wait', 'The room can become almost immovable from midnight to 2 am, even on a low-season Saturday. There may be no formal line, but ordering a second drink or crossing the floor becomes the wait. Arrive before 10:30 for orientation and a place to stand, then expect the drag sets to pull everyone inward.',
      'best_nights', 'Friday and Saturday are the surest for peak club energy, drag and go-go dancers; a weekday gives more access to the bar and performers. Mixwell is the clubbier late stop on the strip, so build toward midnight rather than arriving at dinner time. Current social booking is active in 2026.',
      'crowd_mix', 'Gay men, Balinese locals, international tourists, drag devotees, older solo travellers and queer friends create a highly mixed holiday crowd. Some younger local men may be working or expect drinks, which should be approached without judgment or romantic assumptions. Clear boundaries keep flirtation honest.',
      'dress_code', 'Tropical clubwear is enough: tanks, shorts, a breathable shirt, trainers or secure sandals and whatever sparkle survives humidity. There is no prestige code. Keep bags zipped and in front, carry only needed cash, watch drinks being made and expect cigarette smoke in the packed room.',
      'staff_inclusivity', 'Many recent visitors praise wonderful staff, exceptional drag and a proud queer atmosphere. Serious accounts also allege cash theft, drink risk and drugs offered near the door; an older report describes poor security response to unwanted touching. Have fun, but keep control of drink, bag and ride home.',
      'venue_classification', 'active_gay_dance_bar_with_drag_go_go_and_high_tourist_local_mix',
      'source_urls', to_jsonb(array[
        'https://linktr.ee/mixwellbarbaliofficial',
        'https://wanderlog.com/place/details/753170',
        'https://www.tripadvisor.com/Attraction_Review-g469404-d2078717-Reviews-Mixwell_Bar-Seminyak_Kuta_District_Badung_Regency_Bali.html',
        'https://maps.apple.com/place?place-id=I36DDEA2C280FEC6E',
        'https://www.travelgay.com/bali-gay-bars-and-dance-clubs',
        'https://www.reddit.com/r/BaliTravelTips/comments/1uly7yr/big_clubs/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_current_midnight_to_two_peak_and_movement_constraint_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/753170','https://www.tripadvisor.com/Attraction_Review-g469404-d2078717-Reviews-Mixwell_Bar-Seminyak_Kuta_District_Badung_Regency_Bali.html','https://maps.apple.com/place?place-id=I36DDEA2C280FEC6E']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_active_social_booking_and_weekend_peak_consensus','source_urls',to_jsonb(array['https://linktr.ee/mixwellbarbaliofficial','https://wanderlog.com/place/details/753170','https://www.travelgay.com/bali-gay-bars-and-dance-clubs']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_local_tourist_age_and_transactional_social_context_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g469404-d2078717-Reviews-Mixwell_Bar-Seminyak_Kuta_District_Badung_Regency_Bali.html','https://wanderlog.com/place/details/753170','https://maps.apple.com/place?place-id=I36DDEA2C280FEC6E']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','tropical_club_context_and_current_security_practical_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/753170','https://www.tripadvisor.com/Attraction_Review-g469404-d2078717-Reviews-Mixwell_Bar-Seminyak_Kuta_District_Badung_Regency_Bali.html','https://www.travelgay.com/bali-gay-bars-and-dance-clubs']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_welcome_consensus_balanced_against_material_safety_allegations','source_urls',to_jsonb(array['https://wanderlog.com/place/details/753170','https://www.tripadvisor.com/Attraction_Review-g469404-d2078717-Reviews-Mixwell_Bar-Seminyak_Kuta_District_Badung_Regency_Bali.html','https://maps.apple.com/place?place-id=I36DDEA2C280FEC6E']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (1932, 1936, 1937, 1935, 1938, 1151, 1167, 1159)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
