-- Queer Atlas venue intelligence: global review-led editorial pass, batch 29.
-- Eight Barcelona candidates, individually researched and rewritten.
-- The legacy HBB label is identified as Honey Furry at Diputacio 203, not the newer HBB venue.
-- Checked 2026-08-05. Source names remain in evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (1663::bigint, jsonb_build_object(
      'queue_wait', 'This is an intimate 250-capacity uptown club, and Friday or Saturday entry becomes less forgiving as the room fills. Buy the event ticket or join the valid list before leaving home; a VIP table brings priority access. Thursday is the softer arrival, while midnight onward is the weekend pressure point.',
      'best_nights', 'Friday and Saturday carry the fullest adult-club atmosphere and strongest guest-DJ pull; Thursday suits a less compressed introduction. The music moves through techno, house, melodic and afro-house, so let the named lineup decide. This is a programme-led electronic club, not a reliable queer-night default.',
      'crowd_mix', 'Expect style-conscious Barcelona groups, affluent uptown regulars, international electronic-music visitors and table-booking parties, generally in their mid-twenties and above. Both locals and travellers attend, but this is a selective mainstream club rather than an LGBTQ+-centred room.',
      'dress_code', 'The door explicitly expects elegant, polished clothing. Sportswear, beachwear, tank tops, flip-flops and an overly casual look are poor bets; weekend age guidance is usually 25+. Think sharp night-out tailoring or elevated clubwear, carry physical ID and treat entry as selective even with a ticket.',
      'staff_inclusivity', 'The operation promises personalised table service and a managed premium room, but independent evidence about queer guests is thin. Approach it as mainstream luxury nightlife: LGBTQ+ people may attend, yet neither the programming nor its published hospitality position establishes a queer-specific safe space.',
      'venue_classification', 'active_selective_mainstream_uptown_electronic_club_with_vip_tables_not_queer_specific',
      'source_urls', to_jsonb(array[
        'https://borisbcn.com/faqs-en/',
        'https://borisbcn.com/',
        'https://grupocostaeste.com/en/creating-a-brand-the-creative-process-behind-boris/',
        'https://ra.co/clubs/2489764',
        'https://www.corner.inc/place/pcTv6u8yqybL',
        'https://youbarcelona.com/es/p/opiniones-boris-barcelona'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_small_capacity_weekend_peak_ticket_list_and_priority_table_evidence','source_urls',to_jsonb(array['https://borisbcn.com/faqs-en/','https://youbarcelona.com/es/p/opiniones-boris-barcelona','https://www.corner.inc/place/pcTv6u8yqybL']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_friday_saturday_peak_thursday_activity_and_current_electronic_lineup_evidence','source_urls',to_jsonb(array['https://borisbcn.com/faqs-en/','https://ra.co/clubs/2489764','https://www.corner.inc/place/pcTv6u8yqybL']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_adult_local_international_selective_mainstream_crowd_positioning','source_urls',to_jsonb(array['https://borisbcn.com/faqs-en/','https://grupocostaeste.com/en/creating-a-brand-the-creative-process-behind-boris/','https://youbarcelona.com/es/p/opiniones-boris-barcelona']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_current_elegant_code_prohibited_items_age_and_id_context','source_urls',to_jsonb(array['https://borisbcn.com/faqs-en/','https://youbarcelona.com/es/p/opiniones-boris-barcelona']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','premium_service_claims_but_insufficient_independent_queer_specific_hospitality_evidence','source_urls',to_jsonb(array['https://borisbcn.com/faqs-en/','https://grupocostaeste.com/en/creating-a-brand-the-creative-process-behind-boris/','https://youbarcelona.com/es/p/opiniones-boris-barcelona']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1294::bigint, jsonb_build_object(
      'queue_wait', 'The narrow front opens into a small dance area, so it can feel lively long before a club would. Early happy hour through 11:30 pm is the easiest walk-in window; around midnight on Friday and Saturday, standing room and bar access tighten. There is no prestige door ritual—space is the real limit.',
      'best_nights', 'Wednesday brings the recurring Latin night, while Friday and Saturday make the most of house, pop, go-go dancers and the back dance floor. Go before midnight for cocktails and conversation, later for bodies and shows. It closes Sunday and Monday, so do not build a weekend farewell around either night.',
      'crowd_mix', 'Gay men are the clear centre, ranging across ages and arriving from Barcelona, elsewhere in Spain and abroad. Regulars meeting the owner sit beside first-time Gayxample visitors, while dancers pull a more flirtatious late crowd. It is sociable and international, but not designed as a balanced all-genders queer bar.',
      'dress_code', 'Casual going-out clothes fit the room: tee or shirt, jeans, shorts, trainers and a little body-conscious sparkle all work. No formal code is published. Dress for a warm, narrow bar and possible dancing rather than a velvet-rope test; compact layers make more sense than a coat or oversized bag.',
      'staff_inclusivity', 'Friendly bartenders, attention from the owner, good music and clean surroundings recur in current review summaries. The welcome is aimed at gay men and their friends; people of other genders may feel less centred. For its intended crowd, the service reputation is unusually warm and familiar.',
      'venue_classification', 'active_small_gay_mens_bar_with_house_pop_go_go_shows_and_back_dance_area',
      'source_urls', to_jsonb(array[
        'https://www.travelgay.com/venue/boysbar-bcn',
        'https://pos.do/en/barcelona/restaurant/boys-bar-bcn-barcelona',
        'https://www.cambralgtbiq.org/es/portfolio_page/boys-bar-bcn/',
        'https://www.thegayagenda.fyi/barcelona/businesses/boys-bar-bcn/',
        'https://qlist.app/venues/Barcelona/BOYS-BAR-BCN/cU1Ea1ZIQnU2c0dySDhTMit4ckV1QQ'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_small_narrow_room_happy_hour_and_late_weekend_capacity_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/boysbar-bcn','https://pos.do/en/barcelona/restaurant/boys-bar-bcn-barcelona','https://www.thegayagenda.fyi/barcelona/businesses/boys-bar-bcn/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_wednesday_latin_night_weekend_go_go_house_pop_and_closure_schedule','source_urls',to_jsonb(array['https://www.travelgay.com/venue/boysbar-bcn','https://pos.do/en/barcelona/restaurant/boys-bar-bcn-barcelona','https://qlist.app/venues/Barcelona/BOYS-BAR-BCN/cU1Ea1ZIQnU2c0dySDhTMit4ckV1QQ']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','gay_male_all_age_local_spanish_and_international_review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/boysbar-bcn','https://pos.do/en/barcelona/restaurant/boys-bar-bcn-barcelona','https://www.cambralgtbiq.org/es/portfolio_page/boys-bar-bcn/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','casual_small_dance_bar_context_with_no_published_formal_code','source_urls',to_jsonb(array['https://www.travelgay.com/venue/boysbar-bcn','https://pos.do/en/barcelona/restaurant/boys-bar-bcn-barcelona']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_friendly_owner_bartender_cleanliness_and_service_consensus_with_male_focus','source_urls',to_jsonb(array['https://pos.do/en/barcelona/restaurant/boys-bar-bcn-barcelona','https://www.travelgay.com/venue/boysbar-bcn','https://www.thegayagenda.fyi/barcelona/businesses/boys-bar-bcn/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1295::bigint, jsonb_build_object(
      'queue_wait', 'Multiple rooms absorb more people than the doorway suggests, and opening at 7 pm makes early drinks easy. Friday, Saturday and a popular performance can crowd the bar and pocket dance room later, but this is usually a flowing social arrival rather than a punishing club queue. Check the event post before setting a time.',
      'best_nights', 'Monday belongs to a recurring FLINTA community programme; other dates rotate drag, queer flamenco, poetry, markets, comedy, bingo, burlesque and DJs. Friday is the safest pick for a lively general night, but the best visit matches your identity or mood to the actual bill. The calendar matters more than habit.',
      'crowd_mix', 'This is one of central Barcelona''s broader queer rooms: younger LGBTQ+ locals, queer women, trans and nonbinary people, gay men, artists, visitors and friends all appear. Men remain visible, yet recurring FLINTA gatherings make the mix notably less male-dominated than Gayxample standards.',
      'dress_code', 'There is no uniform beyond self-expression. Relaxed streetwear, art-school layers, femme looks, masc looks, drag flourishes and practical dance shoes all sit naturally among the queer art. Wear something that can move between sofa, performance and the small Wild Room; the vibe rewards personality, not expensive polish.',
      'staff_inclusivity', 'Most current guests describe kind service and freedom to be themselves, backed by years of queer and FLINTA programming. A smaller strand reports inconsistent attitudes, so no shift gets a perfect guarantee. The evidence still supports a broad welcome rather than a gay-male bar borrowing inclusive language.',
      'venue_classification', 'active_large_multi_room_queer_bar_with_art_performance_dance_and_flinta_programming',
      'source_urls', to_jsonb(array[
        'https://www.timeout.es/barcelona/es/gay-y-lesbico/candy-darling',
        'https://www.timeout.com/barcelona/gay-lesbian/the-top-gay-bars-in-barcelona',
        'https://www.thegayagenda.fyi/barcelona/businesses/candy-darling/',
        'https://wanderlog.com/es/place/details/466176/candy-darling',
        'https://qlist.app/venues/Barcelona/Candy-Darling/ejN2ckpBaHptYzdLNkNWaUswK0VBZw',
        'https://www.barcelona.cat/barcelonacultura/en/recomanat/me-siento-extrana',
        'https://www.reddit.com/r/AskBarcelonaTourism/comments/1ta6hqy/lesbiangay_bar_in_barcelona/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_multi_room_opening_time_weekend_and_programme_dependent_capacity_consensus','source_urls',to_jsonb(array['https://www.thegayagenda.fyi/barcelona/businesses/candy-darling/','https://wanderlog.com/es/place/details/466176/candy-darling','https://www.timeout.com/barcelona/gay-lesbian/the-top-gay-bars-in-barcelona']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_flinta_monday_and_rotating_current_drag_flamenco_art_bingo_burlesque_dj_programme','source_urls',to_jsonb(array['https://www.barcelona.cat/barcelonacultura/en/recomanat/me-siento-extrana','https://www.timeout.es/barcelona/es/gay-y-lesbico/candy-darling','https://wanderlog.com/es/place/details/466176/candy-darling']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','broad_younger_queer_women_trans_nonbinary_gay_men_local_visitor_consensus','source_urls',to_jsonb(array['https://www.timeout.es/barcelona/es/gay-y-lesbico/candy-darling','https://www.barcelona.cat/barcelonacultura/en/recomanat/me-siento-extrana','https://www.reddit.com/r/AskBarcelonaTourism/comments/1ta6hqy/lesbiangay_bar_in_barcelona/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','informal_underground_art_performance_and_pocket_disco_context_without_formal_code','source_urls',to_jsonb(array['https://www.timeout.es/barcelona/es/gay-y-lesbico/candy-darling','https://www.timeout.com/barcelona/gay-lesbian/the-top-gay-bars-in-barcelona','https://wanderlog.com/es/place/details/466176/candy-darling']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_welcoming_queer_flinta_consensus_balanced_against_some_inconsistent_staff_reports','source_urls',to_jsonb(array['https://www.thegayagenda.fyi/barcelona/businesses/candy-darling/','https://wanderlog.com/es/place/details/466176/candy-darling','https://qlist.app/venues/Barcelona/Candy-Darling/ejN2ckpBaHptYzdLNkNWaUswK0VBZw']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1296::bigint, jsonb_build_object(
      'queue_wait', 'The late Raval room is tiny, and Friday or Saturday drag can turn “walk in” into shoulder-to-shoulder soon after the 11 pm opening. Arrive near doors for a sightline and easier drink; after midnight, expect a squeeze rather than an organised queue. Current listings disagree on Thursday, so verify it first.',
      'best_nights', 'Friday and Saturday are the dependable nights for drag, Spanish divas, retro pop and joyous group singing; some current calendars also show Thursday. This is not sleek all-week clubbing. Go when you want a few hours of camp continuity with Barcelona''s old Raval, then let the performance lead the night.',
      'crowd_mix', 'Local gay men and long-time Raval followers give the room its roots, with international visitors, women, queer friends and mixed weekend groups joining the chorus. It feels more locally inherited than many Gayxample stops, yet the crowd broadens when the show lands. Small size makes every mix visible and immediate.',
      'dress_code', 'Wear whatever can survive a close bar, a drag show and an unapologetic Spanish-pop singalong: relaxed clothes, vintage camp, colour, denim and danceable shoes all belong. There is no selective fashion code. Leave bulky layers behind and bring enough ease to laugh, sing and give performers their space.',
      'staff_inclusivity', 'Most recent accounts praise energetic staff, lively performers and a welcoming queer atmosphere; its trans and drag history runs deep. Experiences vary: a recent woman''s account alleges misogynistic treatment. Come for the legacy and warmth, recognising that broader inclusion is not reported consistently.',
      'venue_classification', 'active_historic_small_raval_gay_bar_with_drag_spanish_divas_and_retro_pop',
      'source_urls', to_jsonb(array[
        'https://www.facebook.com/elcangrejodelraval',
        'https://wanderlog.com/place/details/1997290/el-cangrejo',
        'https://restaurantguru.com/El-Cangrejo-Barcelona',
        'https://www.gayplaces.co/city/barcelona/bar/el-cangrejo',
        'https://www.petitfute.co.uk/v42286-barcelone/c1169-s-amuser-sortir/c1048-spectacles/c226-cabaret-revue/346121-el-cangrejo-raval.html',
        'https://www.timeout.com/barcelona/clubs/el-cangrejo-raval',
        'https://elpais.com/espana/catalunya/barcelona-se-sale/2026-03-22/barcelona-rinde-homenaje-a-la-artista-carmen-de-mairena-con-una-placa-en-el-raval.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_tiny_room_late_opening_weekend_drag_capacity_and_thursday_schedule_variance','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1997290/el-cangrejo','https://restaurantguru.com/El-Cangrejo-Barcelona','https://www.petitfute.co.uk/v42286-barcelone/c1169-s-amuser-sortir/c1048-spectacles/c226-cabaret-revue/346121-el-cangrejo-raval.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_friday_saturday_drag_retro_spanish_pop_and_possible_thursday_evidence','source_urls',to_jsonb(array['https://www.gayplaces.co/city/barcelona/bar/el-cangrejo','https://wanderlog.com/place/details/1997290/el-cangrejo','https://www.petitfute.co.uk/v42286-barcelone/c1169-s-amuser-sortir/c1048-spectacles/c226-cabaret-revue/346121-el-cangrejo-raval.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','local_gay_male_raval_core_with_broader_international_women_queer_weekend_mix','source_urls',to_jsonb(array['https://www.gayplaces.co/city/barcelona/bar/el-cangrejo','https://restaurantguru.com/El-Cangrejo-Barcelona','https://www.petitfute.co.uk/v42286-barcelone/c1169-s-amuser-sortir/c1048-spectacles/c226-cabaret-revue/346121-el-cangrejo-raval.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','historic_camp_drag_small_dance_bar_context_with_no_selective_code','source_urls',to_jsonb(array['https://www.timeout.com/barcelona/clubs/el-cangrejo-raval','https://www.gayplaces.co/city/barcelona/bar/el-cangrejo','https://wanderlog.com/place/details/1997290/el-cangrejo']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_queer_drag_trans_legacy_and_positive_current_service_consensus_with_serious_misogyny_counter_report','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1997290/el-cangrejo','https://restaurantguru.com/El-Cangrejo-Barcelona','https://elpais.com/espana/catalunya/barcelona-se-sale/2026-03-22/barcelona-rinde-homenaje-a-la-artista-carmen-de-mairena-con-una-placa-en-el-raval.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1662::bigint, jsonb_build_object(
      'queue_wait', 'This record points to Honey Furry at Diputació 203, a roomy bear bar usually entered without a formal queue. It opens from 6 pm daily; Thursday''s 9–11 pm happy hour and late weekend drinks create the strongest bar pressure. Walk in earlier for a sofa or football view, later for the denser social hum.',
      'best_nights', 'Thursday pairs happy-hour value with a useful meet-people window, Sunday is remembered for 80s and 90s music, and Friday or Saturday brings the broadest bear-night energy. Regular opening makes it flexible, but special OSADA collaborations can redirect the community elsewhere, so check the live social feed.',
      'crowd_mix', 'Bears, furry men, daddies, cubs and admirers lead, with Barcelona regulars beside visiting Europeans and curious friends. The official tone is cosmopolitan and home-like rather than hard-edged. It remains a male bear-community bar at heart, even when women and mixed friend groups are welcomed at the counter.',
      'dress_code', 'Come in bear-bar casual: tee, plaid, denim, shorts, trainers, leather touches or simply the clothes you wore to dinner. No body type, beard or fetish kit is required. Comfortable seating and food make this softer than a coded cruise space; an event collaboration may invite something sexier, but the daily bar does not.',
      'staff_inclusivity', 'Friendly bartenders, strong pours, good music and an easy welcome recur; people who entered without knowing the bear identity also report a good time. The space explicitly offers belonging within LGBTQ+ Barcelona. Service evidence is positive, though occasional closure reports make checking the day prudent.',
      'venue_classification', 'active_honey_furry_bear_bar_at_diputacio_203_not_the_newer_hbb_on_consell_de_cent',
      'identity_note', 'Legacy app label HBB (Honey Bears Barcelona) resolves to Honey Furry Bar, Carrer de la Diputació 203. Do not merge with HBB Barcelona, Carrer del Consell de Cent 247, opened in December 2025.',
      'source_urls', to_jsonb(array[
        'https://honeybearsbcn.com/',
        'https://wanderlog.com/list/geoCategory/1526285/gay-bars',
        'https://www.navigaytor.com/docs/pdfs/GayMap_Barcelona.pdf',
        'https://twobadtourists.com/gay-barcelona-a-gay-travel-guide-to-one-of-europes-top-cities/',
        'https://www.tomaticket.es/es-es/entradas-osada-stripclub-edition-bear-friends-party-en-barcelona',
        'https://hbb-barcelona.com/',
        'https://www.patroc.com/guiagay/barcelona/d/hbb-bar.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_explicit_daily_hours_roomy_layout_thursday_promotion_and_weekend_flow_consensus','source_urls',to_jsonb(array['https://honeybearsbcn.com/','https://wanderlog.com/list/geoCategory/1526285/gay-bars','https://twobadtourists.com/gay-barcelona-a-gay-travel-guide-to-one-of-europes-top-cities/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_thursday_happy_hour_sunday_retro_weekend_and_event_collaboration_evidence','source_urls',to_jsonb(array['https://honeybearsbcn.com/','https://wanderlog.com/list/geoCategory/1526285/gay-bars','https://www.tomaticket.es/es-es/entradas-osada-stripclub-edition-bear-friends-party-en-barcelona']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_bear_furry_admirer_cosmopolitan_local_visitor_and_friend_mix','source_urls',to_jsonb(array['https://honeybearsbcn.com/','https://www.navigaytor.com/docs/pdfs/GayMap_Barcelona.pdf','https://twobadtourists.com/gay-barcelona-a-gay-travel-guide-to-one-of-europes-top-cities/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','relaxed_food_seating_bear_bar_context_without_published_fetish_or_formal_code','source_urls',to_jsonb(array['https://honeybearsbcn.com/','https://wanderlog.com/list/geoCategory/1526285/gay-bars','https://twobadtourists.com/gay-barcelona-a-gay-travel-guide-to-one-of-europes-top-cities/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_friendly_staff_unknown_guest_and_belonging_consensus_with_some_closure_variance','source_urls',to_jsonb(array['https://honeybearsbcn.com/','https://wanderlog.com/list/geoCategory/1526285/gay-bars','https://hbb-barcelona.com/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1664::bigint, jsonb_build_object(
      'queue_wait', 'Human is a Saturday session inside Razzmatazz Rooms 2 and 3, not a separate nightly venue. Advance tickets are the cleanest route because door sales stop when capacity is gone and there is no weekend guest list. Use the Pamplona 88 entrance, carry valid ID and allow time for scan and security.',
      'best_nights', 'Saturday is the answer, but the artist is the reason: lineups move through high-intensity techno, house, electro, breaks, acid, industrial and experimental edges. Arrive for the full arc or later for peak pressure. Check the dated programme; “Human” does not mean every Razzmatazz night.',
      'crowd_mix', 'Barcelona electronic heads, visiting club travellers, dedicated followers of the booked producer and the wider multi-room Razzmatazz crowd converge. Queer and gender-diverse dancers are visible, especially around aligned collaborations, but Human is an underground electronic session—not a permanent LGBTQ+-only party.',
      'dress_code', 'There is no strict code: dark clubwear, expressive layers, denim and sturdy trainers all make sense. Avoid sports-team shirts, political-message clothing and flip-flops. Bring little, use a locker if needed and keep your phone down; privacy and direct attention to the room are part of the concept.',
      'staff_inclusivity', 'The session centres privacy, presence and respect, while the venue offers coordinated access and priority entry for disabled guests who contact it first. That is meaningful care, but not a queer-specific safeguarding promise. Expect a large mainstream club team serving a diverse electronic crowd.',
      'venue_classification', 'active_recurring_saturday_electronic_session_inside_razzmatazz_rooms_2_and_3_not_standalone_queer_club',
      'source_urls', to_jsonb(array[
        'https://www.salarazzmatazz.com/clubs/human/',
        'https://www.salarazzmatazz.com/info/',
        'https://www.salarazzmatazz.com/agenda/clubs/?club=Human',
        'https://ra.co/events/2375174',
        'https://www.reddit.com/r/Techno/comments/1usoqpm/berlintype_techno_clubs_in_barcelona/',
        'https://www.reddit.com/r/AskBarcelona/comments/1kxpv2g/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_saturday_rooms_2_3_advance_ticket_door_capacity_no_guest_list_id_and_entrance_evidence','source_urls',to_jsonb(array['https://www.salarazzmatazz.com/clubs/human/','https://www.salarazzmatazz.com/info/','https://www.salarazzmatazz.com/agenda/clubs/?club=Human']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_saturday_artist_led_multi_genre_electronic_programme','source_urls',to_jsonb(array['https://www.salarazzmatazz.com/clubs/human/','https://www.salarazzmatazz.com/agenda/clubs/?club=Human','https://ra.co/events/2375174']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','electronic_local_visitor_artist_follower_and_diverse_but_not_exclusively_queer_crowd_consensus','source_urls',to_jsonb(array['https://www.salarazzmatazz.com/clubs/human/','https://ra.co/events/2375174','https://www.reddit.com/r/AskBarcelona/comments/1kxpv2g/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_no_strict_code_three_prohibited_categories_lockers_and_phone_privacy_context','source_urls',to_jsonb(array['https://www.salarazzmatazz.com/info/','https://www.salarazzmatazz.com/clubs/human/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_privacy_respect_and_coordinated_disability_access_evidence_without_queer_specific_policy','source_urls',to_jsonb(array['https://www.salarazzmatazz.com/clubs/human/','https://www.salarazzmatazz.com/info/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1661::bigint, jsonb_build_object(
      'queue_wait', 'This neon music bar normally works as a walk-in from 6 pm, with no evidence of a ritualised door. The compact room becomes more animated as DJs and weekend drinkers arrive; Friday and Saturday run later to 3:30 am. For a seat and a proper cocktail, start early. For dancing, follow the night toward midnight.',
      'best_nights', 'Friday and Saturday are the easy DJ-and-drinks choice, while vinyl sets, live voices, Eurovision watch parties and Sunday daytime 80s events can remake the room. Pick the advertised music rather than a generic “gay Saturday”; this young bar is building its identity through those communal moments.',
      'crowd_mix', 'Gay men are the stated core, joined by neighbourhood friends, queer group meetups and visitors exploring the newer Villarroel circuit. The crowd feels more music-social than cruise-led, with pop and house drinkers sharing space with vinyl or live-performance followers. It is LGBTQ+-oriented, but still male-centred.',
      'dress_code', 'No formal code is published. Fresh casual clubwear, denim, a fitted tee, colour, trainers or a sharper shirt all fit the neon interior. Dress to stand, talk and move when the DJ lifts the room; there is no evidence that a prescribed masculine look is required, despite the bar''s explicit focus on men.',
      'staff_inclusivity', 'Current reviews repeatedly praise charismatic, friendly bartenders, an inviting atmosphere, strong cocktails and detailed sound. Queer groups also choose it for shared viewing events. The signal is strong for a venue opened in 2025, though its shorter operating history means the consensus is still developing.',
      'venue_classification', 'active_new_lgbtq_oriented_gay_mens_music_bar_with_djs_vinyl_live_sets_and_watch_events',
      'source_urls', to_jsonb(array[
        'https://www.instagram.com/kenbar.celona/',
        'https://qlist.app/venues/Barcelona/KEN-BAR-BARCELONA/czZsekZUNlVEM00vNFVwQVZwR2dOQQ',
        'https://www.patroc.com/gay/barcelona/bars.html',
        'https://www.navigaytor.com/docs/pdfs/GayMap_Barcelona.pdf',
        'https://ticketrona.com/evento/mananeo-de-los-80-vermut-buen-rollo-cantar-o-bailar-en-barcelona',
        'https://www.meetup.com/es-ES/bcn-queer-squad/events/314069043/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_walk_in_music_bar_hours_weekend_late_close_and_compact_room_context','source_urls',to_jsonb(array['https://www.patroc.com/gay/barcelona/bars.html','https://qlist.app/venues/Barcelona/KEN-BAR-BARCELONA/czZsekZUNlVEM00vNFVwQVZwR2dOQQ','https://www.navigaytor.com/docs/pdfs/GayMap_Barcelona.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_weekend_dj_vinyl_live_eurovision_and_daytime_80s_event_evidence','source_urls',to_jsonb(array['https://qlist.app/venues/Barcelona/KEN-BAR-BARCELONA/czZsekZUNlVEM00vNFVwQVZwR2dOQQ','https://ticketrona.com/evento/mananeo-de-los-80-vermut-buen-rollo-cantar-o-bailar-en-barcelona','https://www.meetup.com/es-ES/bcn-queer-squad/events/314069043/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_gay_mens_core_lgbtq_orientation_neighbourhood_group_and_music_follower_mix','source_urls',to_jsonb(array['https://qlist.app/venues/Barcelona/KEN-BAR-BARCELONA/czZsekZUNlVEM00vNFVwQVZwR2dOQQ','https://www.patroc.com/gay/barcelona/bars.html','https://www.meetup.com/es-ES/bcn-queer-squad/events/314069043/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','neon_music_bar_dj_and_live_set_context_with_no_published_formal_code','source_urls',to_jsonb(array['https://qlist.app/venues/Barcelona/KEN-BAR-BARCELONA/czZsekZUNlVEM00vNFVwQVZwR2dOQQ','https://www.instagram.com/kenbar.celona/','https://www.patroc.com/gay/barcelona/bars.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_friendly_charismatic_staff_service_cocktail_and_queer_group_event_consensus','source_urls',to_jsonb(array['https://qlist.app/venues/Barcelona/KEN-BAR-BARCELONA/czZsekZUNlVEM00vNFVwQVZwR2dOQQ','https://www.meetup.com/es-ES/bcn-queer-squad/events/314069043/','https://www.instagram.com/kenbar.celona/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (179::bigint, jsonb_build_object(
      'queue_wait', 'The “queue” is usually the narrow room itself: this small bar can be full by 11 pm and is famously busy even on some Sundays. Open from 4 pm, it rewards an early terrace drink or pre-club stop; later, expect to squeeze past the devotional walls and order standing. There is no formal door spectacle.',
      'best_nights', 'Sunday early drinks can already deliver a strong 30–50s crowd, while Friday and Saturday build the loudest pre-club energy before closing at 3 am. A weekday from late afternoon shows its café-bar side and makes conversation easier. Come early for camp detail, late for the shoulder-to-shoulder Gayxample ritual.',
      'crowd_mix', 'Gay and bisexual men in their thirties, forties and beyond form the core, mixing Barcelona regulars with repeat visitors and first-night tourists. Friends and other LGBTQ+ guests are welcomed, but mature men remain the visual centre. The terrace adds passers-by; the narrow room turns strangers into conversation.',
      'dress_code', 'Easy Gayxample casual is enough: tee or open shirt, jeans, shorts, trainers and a playful camp touch if you feel it. No formal code exists, and the place has never depended on perfect bodies. Keep the outfit compact for the tight corridor and dress for whichever club may follow that strong first drink.',
      'staff_inclusivity', 'Friendly, quick bartenders, strong drinks and fair prices dominate current feedback; one bartender is noted for using sign language. The mood is relaxed and welcoming beyond its mature male core. Physical narrowness is the bigger access limit, so disabled guests should confirm practical entry needs first.',
      'venue_classification', 'active_small_gayxample_gay_bar_with_catholic_camp_decor_terrace_and_mature_social_crowd',
      'source_urls', to_jsonb(array[
        'https://barcelona.gaycities.com/bars/3547-la-chapelle',
        'https://www.travelgay.com/venue/la-chapelle',
        'https://gaycation.eu/spain/barcelona/bars/la-chapelle',
        'https://www.thegayagenda.fyi/barcelona/businesses/la-chapelle/',
        'https://www.patroc.com/guiagay/barcelona/d/lachapelle.html',
        'https://www.cruisinggays.com/barcelona/bars/51862-la-chapelle-cafe-bar/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_small_narrow_room_early_opening_late_peak_and_busy_sunday_consensus','source_urls',to_jsonb(array['https://barcelona.gaycities.com/bars/3547-la-chapelle','https://gaycation.eu/spain/barcelona/bars/la-chapelle','https://www.travelgay.com/venue/la-chapelle']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_sunday_30_50_crowd_weekend_late_close_and_weekday_cafe_bar_evidence','source_urls',to_jsonb(array['https://barcelona.gaycities.com/bars/3547-la-chapelle','https://www.patroc.com/guiagay/barcelona/d/lachapelle.html','https://www.travelgay.com/venue/la-chapelle']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','gay_bisexual_mature_male_local_repeat_visitor_tourist_and_friend_consensus','source_urls',to_jsonb(array['https://gaycation.eu/spain/barcelona/bars/la-chapelle','https://www.patroc.com/guiagay/barcelona/d/lachapelle.html','https://www.cruisinggays.com/barcelona/bars/51862-la-chapelle-cafe-bar/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','relaxed_camp_cafe_bar_and_pre_club_context_with_no_formal_code','source_urls',to_jsonb(array['https://barcelona.gaycities.com/bars/3547-la-chapelle','https://www.travelgay.com/venue/la-chapelle','https://www.patroc.com/guiagay/barcelona/d/lachapelle.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_friendly_quick_service_price_and_sign_language_access_consensus_with_physical_limit','source_urls',to_jsonb(array['https://gaycation.eu/spain/barcelona/bars/la-chapelle','https://www.thegayagenda.fyi/barcelona/businesses/la-chapelle/','https://www.cruisinggays.com/barcelona/bars/51862-la-chapelle-cafe-bar/']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (1663, 1294, 1295, 1296, 1662, 1664, 1661, 179)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
