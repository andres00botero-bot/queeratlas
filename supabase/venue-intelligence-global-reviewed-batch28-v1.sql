-- Queer Atlas venue intelligence: global review-led editorial pass, batch 28.
-- Final Bangkok candidates in this sequence and first Barcelona venues.
-- Includes one confirmed duplicate and one closed/rebranded record.
-- Checked 2026-08-05. Source names remain in evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (1950::bigint, jsonb_build_object(
      'queue_wait', 'Hotel check-in is polished, but the rooftop, signature restaurants and terrace pool each have their own reservation rhythm. Popular dining slots and Sky Beach sunsets can sell before a room does. Book the specific experience, confirm whether it is included, and do not assume a hotel key bypasses public queues.',
      'best_nights', 'A weekday gives the design, pool and breakfast room more space; Friday and Saturday turn the restaurants and rooftop into Bangkok''s social circuit. Pride and branded pool events add queer energy when scheduled. Stay for a stylish city break, then check the calendar rather than expecting a gay party nightly.',
      'crowd_mix', 'Design travellers, affluent Thai staycationers, international couples, food obsessives and business guests create a cosmopolitan mainstream crowd. LGBTQ+ guests and events are visibly welcomed, but this is not a gay-only hotel. Locals are strongest in the restaurants and rooftop; visitors dominate the rooms.',
      'dress_code', 'Bold, fashion-aware casual fits the playful interiors, with swimwear and a cover-up at the pool and smart casual for destination dining or the rooftop. There is room for gender expression without a prescribed queer look. Check the exact restaurant policy and plan for heat, height and serious air-conditioning.',
      'staff_inclusivity', 'Current guests frequently praise kind, attentive teams, and the property has hosted LGBTQ+-friendly parties and Pride activity. Other 2026 stays describe operational inconsistency between stylish departments. The welcome appears real, but it is luxury-hotel inclusion rather than a dedicated queer community service.',
      'venue_classification', 'active_mainstream_luxury_design_hotel_with_visible_lgbtq_events_and_welcome',
      'source_urls', to_jsonb(array[
        'https://www.hyatt.com/the-standard/en-US/bkksb-the-standard-bangkok',
        'https://www.tripadvisor.com/Hotel_Review-g293916-d23913056-Reviews-The_Standard_Bangkok_Mahanakhon-Bangkok.html',
        'https://www.agoda.com/the-standard-bangkok-mahanakhon/hotel/bangkok-th.html',
        'https://www.thestandardevents.com/parties',
        'https://www.tripseed.com/wp-content/uploads/2025/06/Tripseed-Thailand-Travel-Trade-Companion-Single-Page.pdf',
        'https://www.worldrainbowhotels.com/wp-content/uploads/2022/02/LGBT-activities-in-Bangkok.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_hotel_restaurant_rooftop_pool_and_reservation_context','source_urls',to_jsonb(array['https://www.hyatt.com/the-standard/en-US/bkksb-the-standard-bangkok','https://www.tripadvisor.com/Hotel_Review-g293916-d23913056-Reviews-The_Standard_Bangkok_Mahanakhon-Bangkok.html','https://www.agoda.com/the-standard-bangkok-mahanakhon/hotel/bangkok-th.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_weekend_social_use_and_documented_lgbtq_event_positioning','source_urls',to_jsonb(array['https://www.thestandardevents.com/parties','https://www.tripseed.com/wp-content/uploads/2025/06/Tripseed-Thailand-Travel-Trade-Companion-Single-Page.pdf','https://www.tripadvisor.com/Hotel_Review-g293916-d23913056-Reviews-The_Standard_Bangkok_Mahanakhon-Bangkok.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','mainstream_design_hotel_local_staycation_and_international_guest_consensus','source_urls',to_jsonb(array['https://www.hyatt.com/the-standard/en-US/bkksb-the-standard-bangkok','https://www.agoda.com/the-standard-bangkok-mahanakhon/hotel/bangkok-th.html','https://www.tripseed.com/wp-content/uploads/2025/06/Tripseed-Thailand-Travel-Trade-Companion-Single-Page.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','design_hotel_pool_rooftop_and_destination_dining_context','source_urls',to_jsonb(array['https://www.hyatt.com/the-standard/en-US/bkksb-the-standard-bangkok','https://www.thestandardevents.com/parties','https://www.tripadvisor.com/Hotel_Review-g293916-d23913056-Reviews-The_Standard_Bangkok_Mahanakhon-Bangkok.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_general_service_and_lgbtq_event_evidence_with_operational_variance','source_urls',to_jsonb(array['https://www.hyatt.com/the-standard/en-US/bkksb-the-standard-bangkok','https://www.tripadvisor.com/Hotel_Review-g293916-d23913056-Reviews-The_Standard_Bangkok_Mahanakhon-Bangkok.html','https://www.tripseed.com/wp-content/uploads/2025/06/Tripseed-Thailand-Travel-Trade-Companion-Single-Page.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1947::bigint, jsonb_build_object(
      'queue_wait', 'This tiny room can feel full before the first queen takes the floor. Doors open at 7 pm and current showtimes run at 9:30, 10:30, 11:50 and 1, with table reservations available. Arrive by 8:30 for a seat and breathing room; later visitors may watch from the doorway or pavement crowd.',
      'best_nights', 'Drag runs every night, so choose early-week intimacy or weekend electricity. The 9:30 set is the easiest entry point; later shows become louder, looser and more adult. Guest queens and televised-franchise nights change the stakes, making the current programme more useful than a simple Friday-versus-Saturday rule.',
      'crowd_mix', 'International gay travellers are highly visible, alongside Thai fans, Drag Race devotees, queer couples, women and straight friends. Performers and repeat local supporters keep it from becoming pure tourist cabaret. The audience is broader than a men-only club, though Silom visitors still dominate many tables.',
      'dress_code', 'Come camera-ready if that delights you, but there is no formal door code: club casual, a bright shirt, drag-inspired glam or easy holiday clothes all work. Keep the outfit compact for the small room, carry tipping notes and never touch a performer without invitation. Glitter is welcome; entitlement is not.',
      'staff_inclusivity', 'The bar was built around drag community and describes strangers becoming family; guests also praise friendly service. Tight capacity, strong drinks and a performance-led tab can make communication brisk. Evidence supports a broad queer welcome, with respect for queens and staff expected in return.',
      'venue_classification', 'active_small_queer_drag_bar_with_four_nightly_shows_and_guest_queen_events',
      'source_urls', to_jsonb(array[
        'https://thestrangerbar.com/',
        'https://thestrangerbar.com/sample-page/',
        'https://restaurantguru.com/The-Stranger-Bar-Bangkok',
        'https://www.instagram.com/thestrangerbar/',
        'https://www.facebook.com/TheStrangerBarBangkok/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_current_door_showtime_reservation_and_small_capacity_evidence','source_urls',to_jsonb(array['https://thestrangerbar.com/','https://thestrangerbar.com/sample-page/','https://restaurantguru.com/The-Stranger-Bar-Bangkok']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_every_night_four_show_schedule_and_current_guest_event_calendar','source_urls',to_jsonb(array['https://thestrangerbar.com/','https://www.instagram.com/thestrangerbar/','https://www.facebook.com/TheStrangerBarBangkok/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_tourist_thai_drag_fan_queer_couple_woman_and_ally_consensus','source_urls',to_jsonb(array['https://thestrangerbar.com/','https://restaurantguru.com/The-Stranger-Bar-Bangkok','https://www.instagram.com/thestrangerbar/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','drag_show_small_room_context_with_no_published_formal_code','source_urls',to_jsonb(array['https://thestrangerbar.com/','https://www.instagram.com/thestrangerbar/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_drag_community_family_positioning_and_positive_current_service_consensus','source_urls',to_jsonb(array['https://thestrangerbar.com/sample-page/','https://restaurantguru.com/The-Stranger-Bar-Bangkok','https://www.facebook.com/TheStrangerBarBangkok/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (540::bigint, jsonb_build_object(
      'queue_wait', 'This record is not a second White Rabbit: the name, 12/3 Silom Road address and lounge description resolve to the same active business listed elsewhere in Queer Atlas. There is no separate queue to forecast. Use the canonical White Rabbit Lounge Bar entry for current arrival advice and future updates.',
      'best_nights', 'Do not plan two stops from the two database names. They point to one café-bar near Sala Daeng, with live singers, food and a small upstairs lounge. Choose the canonical record''s evening guidance, then spend the saved time on a genuinely different Silom venue rather than walking back to the same door.',
      'crowd_mix', 'Any crowd described here belongs to the same White Rabbit Lounge Bar audience: gay friends, Silom regulars, visitors, diners and pre-club drinkers. Treating this older short-name record as another venue would inflate Bangkok''s scene and mislead users. Its useful identity is a confirmed duplicate, not an extra crowd.',
      'dress_code', 'There cannot be a separate dress code for a duplicate address. The underlying venue is casual enough for dinner, live music and a pre-club drink, but practical guidance should live on one maintained profile. Until records are merged, follow the canonical entry and ignore any conflicting legacy fields here.',
      'staff_inclusivity', 'There is no second team to assess. Reviews praising attentive service or criticising price belong to the same staff at 12/3 Silom Road. Consolidating that evidence prevents false consensus created by counting one business twice. This record should be merged or hidden, with the canonical profile preserved.',
      'venue_classification', 'duplicate_record_same_physical_venue_as_white_rabbit_lounge_bar_1949',
      'record_status', 'duplicate_of_1949',
      'source_urls', to_jsonb(array[
        'https://www.tripadvisor.com/Attraction_Review-g293916-d10714337-Reviews-White_Rabbit_Lounge_Bar-Bangkok.html',
        'https://www.travelgay.com/venue/silom-society',
        'https://wanderlog.com/place/details/2103880',
        'https://www.gayout.com/asia-aus/thailand/bangkok/bars/white-rabbit-2526',
        'https://restaurantguru.com/White-Rabbit-Bangkok-5'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','confirmed_duplicate_same_name_address_and_business_profile','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g293916-d10714337-Reviews-White_Rabbit_Lounge_Bar-Bangkok.html','https://www.travelgay.com/venue/silom-society','https://wanderlog.com/place/details/2103880']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','duplicate_not_a_second_stop_with_same_live_music_food_and_lounge_evidence','source_urls',to_jsonb(array['https://www.travelgay.com/venue/silom-society','https://wanderlog.com/place/details/2103880','https://restaurantguru.com/White-Rabbit-Bangkok-5']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','duplicate_record_same_underlying_audience_and_address','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g293916-d10714337-Reviews-White_Rabbit_Lounge_Bar-Bangkok.html','https://wanderlog.com/place/details/2103880','https://www.gayout.com/asia-aus/thailand/bangkok/bars/white-rabbit-2526']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','duplicate_record_no_independent_dress_policy','source_urls',to_jsonb(array['https://www.travelgay.com/venue/silom-society','https://www.tripadvisor.com/Attraction_Review-g293916-d10714337-Reviews-White_Rabbit_Lounge_Bar-Bangkok.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','duplicate_record_no_independent_staff_team','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2103880','https://www.tripadvisor.com/Attraction_Review-g293916-d10714337-Reviews-White_Rabbit_Lounge_Bar-Bangkok.html','https://restaurantguru.com/White-Rabbit-Bangkok-5']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1949::bigint, jsonb_build_object(
      'queue_wait', 'This compact café-bar is usually a walk-in, though the best live-music seats and the small upstairs lounge can fill later. Arrive around dinner or early drinks for a table; after the nearby clubs open, turnover becomes easier. There is no prestige queue, just limited room and a busy Silom pavement.',
      'best_nights', 'Use it for dinner, a live singer and pre-club conversation rather than a destination dance floor. Friday and Saturday bring more pass-through energy; a weekday is better for hearing friends. Event nights upstairs can change the character, so check the current feed before counting on a specific performance.',
      'crowd_mix', 'Gay friends, local regulars, tourists staying around Silom, couples and mixed groups stop for food or drinks before Soi 2. The location creates a visitor-heavy flow, while live music draws some repeat Bangkok faces. It feels more like an LGBTQ+-centred café lounge than a tightly defined men-only bar.',
      'dress_code', 'Smart-casual is effortless here: a light shirt, tee, shorts or trousers and comfortable city shoes. There is no published selective code. Dress for dinner and the club you may visit next, remembering that the lounge is small and Bangkok stays humid. A neat, compact look travels best between both moods.',
      'staff_inclusivity', 'Recent guests mention accommodating service, good-value drinks and a pleasant live-music atmosphere, while some find food and drinks pricier than expected. The gay-lounge identity is established, but current review volume is modest. Confirm the price, enjoy the low-pressure setting and judge the shift in front of you.',
      'venue_classification', 'active_small_gay_cafe_lounge_bar_with_food_live_music_and_pre_club_role',
      'source_urls', to_jsonb(array[
        'https://www.tripadvisor.com/Attraction_Review-g293916-d10714337-Reviews-White_Rabbit_Lounge_Bar-Bangkok.html',
        'https://www.travelgay.com/venue/silom-society',
        'https://wanderlog.com/place/details/2103880',
        'https://www.gayout.com/asia-aus/thailand/bangkok/bars/white-rabbit-2526',
        'https://restaurantguru.com/White-Rabbit-Bangkok-5'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_small_room_live_music_table_and_silom_flow_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2103880','https://www.tripadvisor.com/Attraction_Review-g293916-d10714337-Reviews-White_Rabbit_Lounge_Bar-Bangkok.html','https://www.travelgay.com/venue/silom-society']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_food_live_singer_pre_club_and_upstairs_event_context','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2103880','https://www.travelgay.com/venue/silom-society','https://restaurantguru.com/White-Rabbit-Bangkok-5']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_gay_cafe_local_tourist_couple_and_mixed_group_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/silom-society','https://www.tripadvisor.com/Attraction_Review-g293916-d10714337-Reviews-White_Rabbit_Lounge_Bar-Bangkok.html','https://www.gayout.com/asia-aus/thailand/bangkok/bars/white-rabbit-2526']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','casual_cafe_lounge_and_pre_club_context_with_no_selective_code','source_urls',to_jsonb(array['https://www.travelgay.com/venue/silom-society','https://wanderlog.com/place/details/2103880']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','positive_current_service_value_and_atmosphere_consensus_with_limited_volume','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2103880','https://www.tripadvisor.com/Attraction_Review-g293916-d10714337-Reviews-White_Rabbit_Lounge_Bar-Bangkok.html','https://restaurantguru.com/White-Rabbit-Bangkok-5']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (185::bigint, jsonb_build_object(
      'queue_wait', 'Apolo is a multi-room institution where the event controls the line. A current club review reports about 30 minutes from 00:30 and a €28 door, while major Churros dates can sell out. Buy from the official calendar, arrive near doors and allow separate time for ticket scan, security and cloakroom.',
      'best_nights', 'Choose the brand, not the building. Churros con Chocolate brings queer pop, drag, contests and a broad Sunday or special-date crowd; Nitsa owns Friday and Saturday electronic nights, while concerts change everything. For queer energy, book Churros or Pride rather than assuming every Apolo session is LGBTQ+.',
      'crowd_mix', 'The audience can swing from indie concert fans to international techno crowds. Churros is overtly LGBTIQ+, age-mixed and playful, with drag fans, gay men, queer women, trans and nonbinary guests and allies; one 2026 club night was perceived as overwhelmingly LGBTQ+. Ordinary gigs remain fully mainstream.',
      'dress_code', 'There is no single house look: trainers, denim, mesh, crop tops, clubwear and drag flourish all appear, while concert clothes fit live shows. The official FAQ should settle any event rule. Prioritise secure shoes and breathable layers, then use the cloakroom; the packed main hall punishes bulky coats and bags.',
      'staff_inclusivity', 'Apolo publishes a strong anti-discrimination policy, city anti-harassment protocol and professionally staffed feminist/LGBTIQ+ Safe Space point Wednesday-Sunday. Serious 2025-2026 accounts nevertheless allege aggressive security, misogyny and poor handling. Written safeguards are substantial; execution is disputed.',
      'venue_classification', 'active_mainstream_multi_room_music_venue_with_recurring_major_queer_party_programming',
      'source_urls', to_jsonb(array[
        'https://sala-apolo.com/en/clubs/churros-con-chocolate',
        'https://sala-apolo.com/en/apolo-rules',
        'https://sala-apolo.com/en/faqs',
        'https://www.tripadvisor.com/Attraction_Review-g187497-d571827-Reviews-Sala_Apolo-Barcelona_Catalonia.html',
        'https://www.timeout.com/barcelona/music/sala-apolo',
        'https://elpais.com/espana/catalunya/barcelona-se-sale/2026-07-17/planes-para-un-fin-de-semana-de-orgullo-queer-y-de-barrio-en-barcelona.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_explicit_line_price_sold_out_and_official_ticketing_evidence','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g187497-d571827-Reviews-Sala_Apolo-Barcelona_Catalonia.html','https://sala-apolo.com/en/clubs/churros-con-chocolate','https://elpais.com/espana/catalunya/barcelona-se-sale/2026-07-17/planes-para-un-fin-de-semana-de-orgullo-queer-y-de-barrio-en-barcelona.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_event_dependent_churros_nitsa_concert_and_pride_programming','source_urls',to_jsonb(array['https://sala-apolo.com/en/clubs/churros-con-chocolate','https://www.timeout.com/barcelona/music/sala-apolo','https://elpais.com/espana/catalunya/barcelona-se-sale/2026-07-17/planes-para-un-fin-de-semana-de-orgullo-queer-y-de-barrio-en-barcelona.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','mainstream_venue_with_explicit_broad_lgbtiq_churros_and_current_queer_crowd_evidence','source_urls',to_jsonb(array['https://sala-apolo.com/en/clubs/churros-con-chocolate','https://www.tripadvisor.com/Attraction_Review-g187497-d571827-Reviews-Sala_Apolo-Barcelona_Catalonia.html','https://www.reddit.com/r/AskBarcelona/comments/1poegpm/lesbians_where_to_party_on_new_years/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','official_faq_and_multi_format_concert_queer_club_practical_context','source_urls',to_jsonb(array['https://sala-apolo.com/en/faqs','https://sala-apolo.com/en/clubs/churros-con-chocolate','https://www.tripadvisor.com/Attraction_Review-g187497-d571827-Reviews-Sala_Apolo-Barcelona_Catalonia.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_official_safe_space_protocol_balanced_against_serious_current_security_allegations','source_urls',to_jsonb(array['https://sala-apolo.com/en/apolo-rules','https://www.tripadvisor.com/Attraction_Review-g187497-d571827-Reviews-Sala_Apolo-Barcelona_Catalonia.html','https://sala-apolo.com/en/faqs']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1291::bigint, jsonb_build_object(
      'queue_wait', 'This is a roomy neighbourhood bar, normally entered without a club line. Thursday''s 7-10 pm snack promotion and Saturday''s bear crowd create the strongest table pressure, while early weekdays can be almost quiet. Walk in, order at the bar and give the room time; its appeal is conversation, not a dramatic door.',
      'best_nights', 'Thursday Happy Bacon is the social sweet spot, adding a snack to the 7-10 pm promotion. Saturday brings the densest bear-and-admirer crowd; Sunday''s early drinks are gentler, and Monday-Wednesday offers low-cost tardeo. Choose Thursday to meet people, Saturday for volume or a weekday to actually talk.',
      'crowd_mix', 'Bears, cubs, daddies, chubby men, admirers and friends are the centre, mostly male and split between Barcelona regulars and global visitors. Ages run older than a pop club, with leather and pup crossover on weekends. Everyone is welcome, but bear community is unmistakably the home language.',
      'dress_code', 'No costume is required: beard or no beard, flannel or tee, jeans, shorts, leather touches and pup gear can all belong. Come as yourself and dress for a warm, social bar rather than a fetish checkpoint. Comfortable shoes help if the room fills; the only convincing uniform is low attitude and friendly body language.',
      'staff_inclusivity', 'The official welcome celebrates different bodies and styles, while guests praise funny, attentive staff, fair prices and a respectful room. A quiet-night visitor can find established circles hard to enter. The hospitality signal is strong; arriving for a programmed social hour improves connection.',
      'venue_classification', 'active_bear_community_bar_for_bears_daddies_chubby_men_admirers_and_friends',
      'source_urls', to_jsonb(array[
        'https://baconbearbar.com/inicio',
        'https://www.timeout.es/barcelona/es/locales-de-noche/bacon-bear-bar',
        'https://whereis.gay/bacon-bear-bar',
        'https://maps.apple.com/place?place-id=IAC5FF84CC2DD8AB3',
        'https://www.patroc.com/gay/barcelona/d/baconbearbar.html',
        'https://restaurantguru.com/Bacon-Bear-Bar-Barcelona'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_roomy_walk_in_and_explicit_thursday_saturday_peak_consensus','source_urls',to_jsonb(array['https://baconbearbar.com/inicio','https://whereis.gay/bacon-bear-bar','https://maps.apple.com/place?place-id=IAC5FF84CC2DD8AB3']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_current_thursday_sunday_weekday_promotions_and_saturday_crowd_consensus','source_urls',to_jsonb(array['https://baconbearbar.com/inicio','https://whereis.gay/bacon-bear-bar','https://www.patroc.com/gay/barcelona/d/baconbearbar.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_bear_daddy_chubby_admirer_local_global_and_weekend_fetish_consensus','source_urls',to_jsonb(array['https://baconbearbar.com/inicio','https://whereis.gay/bacon-bear-bar','https://www.timeout.es/barcelona/es/locales-de-noche/bacon-bear-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_no_single_bear_look_and_current_leather_pup_casual_context','source_urls',to_jsonb(array['https://baconbearbar.com/inicio','https://whereis.gay/bacon-bear-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_body_style_welcome_service_price_and_social_consensus','source_urls',to_jsonb(array['https://baconbearbar.com/inicio','https://whereis.gay/bacon-bear-bar','https://restaurantguru.com/Bacon-Bear-Bar-Barcelona']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (180::bigint, jsonb_build_object(
      'queue_wait', 'The club runs from 11 pm to 6 am and the Balmes entrance can build after midnight, especially Friday and Saturday. Buying or confirming the current ticket before leaving helps, but capacity and door judgment still matter. Arrive for the first drag set if you want space; the dance-floor crush comes later.',
      'best_nights', 'Friday and Saturday are the full-strength choice for drag, pole dancers, pop and dancing until dawn. An earlier weekday can make the show easier to see and bartenders easier to reach, provided the night is programmed. Check the current calendar: a specific guest artist is a better reason to go than the club name alone.',
      'crowd_mix', 'Gay men form the largest group, joined by queer women, trans and nonbinary guests, tourists, locals and straight friends in a consciously broad Gayxample club. The room skews younger and more pop-facing than a bear or fetish bar. Reviews describe real diversity, though not every night balances identities equally.',
      'dress_code', 'Night-out casual with sparkle works: fitted tees, crop tops, denim, dresses, makeup, trainers or boots made for hours of pop. There is no published formal code, but avoid beachwear and anything too bulky for the floor. Dress for the queen you want to cheer, not for an imagined luxury-club audition.',
      'staff_inclusivity', 'The venue explicitly calls itself gay and queer, and current guests often praise friendly bartenders, energetic queens and an inclusive atmosphere. Counter-reports mention uneven sound, door or service experiences. The identity welcome is strong on paper and in much of the consensus, while execution varies by night.',
      'venue_classification', 'active_gay_and_queer_pop_dance_club_with_drag_artists_and_pole_dancers',
      'source_urls', to_jsonb(array[
        'https://thebelieve.club/en/about-us/',
        'https://www.tripadvisor.com/Attraction_Review-g187497-d13294404-Reviews-Believe_Club-Barcelona_Catalonia.html',
        'https://wanderlog.com/place/details/2537858',
        'https://maps.apple.com/place?place-id=IA4AC0FEEDE10B8D6',
        'https://www.patroc.com/gay/barcelona/d/believe.html',
        'https://www.reddit.com/r/gaybros/comments/1tunmss/barcelona/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_current_hours_weekend_capacity_and_early_show_arrival_consensus','source_urls',to_jsonb(array['https://thebelieve.club/en/about-us/','https://maps.apple.com/place?place-id=IA4AC0FEEDE10B8D6','https://wanderlog.com/place/details/2537858']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_weekend_drag_pole_pop_and_guest_artist_programme_consensus','source_urls',to_jsonb(array['https://thebelieve.club/en/about-us/','https://wanderlog.com/place/details/2537858','https://www.tripadvisor.com/Attraction_Review-g187497-d13294404-Reviews-Believe_Club-Barcelona_Catalonia.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_broad_gay_queer_local_tourist_and_ally_positioning_with_current_consensus','source_urls',to_jsonb(array['https://thebelieve.club/en/about-us/','https://wanderlog.com/place/details/2537858','https://www.reddit.com/r/gaybros/comments/1tunmss/barcelona/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','pop_drag_dance_context_with_no_published_formal_code','source_urls',to_jsonb(array['https://thebelieve.club/en/about-us/','https://wanderlog.com/place/details/2537858','https://maps.apple.com/place?place-id=IA4AC0FEEDE10B8D6']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_gay_queer_identity_and_mixed_current_bar_drag_sound_door_service_consensus','source_urls',to_jsonb(array['https://thebelieve.club/en/about-us/','https://wanderlog.com/place/details/2537858','https://www.tripadvisor.com/Attraction_Review-g187497-d13294404-Reviews-Believe_Club-Barcelona_Catalonia.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (181::bigint, jsonb_build_object(
      'queue_wait', 'Do not queue at Sepúlveda 81: the original Club Black Hole is closed. Its successor opened as The Basement in 2022 at Carrer de Lluís el Piadós 4, near Arc de Triomf, with different days and earlier hours. Verify that separate listing before travel rather than following legacy maps to Sant Antoni.',
      'best_nights', 'There is no current night at the old address. Historic Black Hole advice about late Friday-Saturday sessions is obsolete. The successor currently advertises selected Tuesday, Thursday, Saturday and Sunday early-evening openings, but it is a different record and location. Plan from its live schedule only.',
      'crowd_mix', 'Black Hole historically centred gay men, bears, leather, rubber, sportswear and fetish crowds, with a mixed LGBTQ+ Tuesday. That describes a closed venue, not tonight''s room. The successor is reported to attract a mature gay male cruise crowd, but its current audience must not be backfilled onto this old address.',
      'dress_code', 'The former club used leather, sport, jeans, military, worker, rubber or underwear codes and rejected flip-flops. Those rules are archival. Do not dress for them and arrive at a dead door. Check the successor''s exact theme, membership and footwear terms; fetish codes can change the permitted entry each session.',
      'staff_inclusivity', 'No current team operates this record. Historic descriptions advertised a large men''s fetish space and some mixed nights, while old ratings were uneven. The responsible update is closure, not a recycled hospitality score. Assess The Basement on its own profile, staff, address and present consent practices.',
      'venue_classification', 'closed_former_gay_fetish_cruise_club_rebranded_successor_at_different_address',
      'record_status', 'permanently_closed_rebranded_successor_elsewhere',
      'source_urls', to_jsonb(array[
        'https://www.travelgay.com/venue/club-black-hole',
        'https://www.gaymap.live/the-basement',
        'https://www.timeout.com/barcelona/lgbt/black-hole',
        'https://stg.travelgay.com/barcelona-gay-cruise-clubs',
        'https://gaymap.info/-download-maps/Gay_Barcelona.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_old_venue_closed_and_successor_different_name_address_evidence','source_urls',to_jsonb(array['https://www.travelgay.com/venue/club-black-hole','https://www.gaymap.live/the-basement','https://www.timeout.com/barcelona/lgbt/black-hole']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','closed_status_with_historical_hours_and_separate_successor_current_schedule','source_urls',to_jsonb(array['https://www.travelgay.com/venue/club-black-hole','https://www.gaymap.live/the-basement','https://stg.travelgay.com/barcelona-gay-cruise-clubs']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','historical_gay_male_fetish_and_mixed_tuesday_context_not_current_crowd','source_urls',to_jsonb(array['https://stg.travelgay.com/barcelona-gay-cruise-clubs','https://www.timeout.com/barcelona/lgbt/black-hole','https://www.travelgay.com/venue/club-black-hole']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','historical_explicit_fetish_codes_invalid_for_closed_record','source_urls',to_jsonb(array['https://stg.travelgay.com/barcelona-gay-cruise-clubs','https://www.timeout.com/barcelona/lgbt/black-hole','https://gaymap.info/-download-maps/Gay_Barcelona.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','no_current_staff_at_closed_record_and_successor_requires_separate_review','source_urls',to_jsonb(array['https://www.travelgay.com/venue/club-black-hole','https://www.gaymap.live/the-basement','https://www.timeout.com/barcelona/lgbt/black-hole']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (1950, 1947, 540, 1949, 185, 1291, 180, 181)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
