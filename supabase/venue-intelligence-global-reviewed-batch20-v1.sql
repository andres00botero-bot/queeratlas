-- Queer Atlas venue intelligence: global review-led editorial pass, batch 20.
-- Amsterdam techno, queer-run nightlife, hotels and long-running gay bars.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (173::bigint, jsonb_build_object(
      'queue_wait', 'The line usually peaks around 1–2 am, though a major booking can produce a half-hour wait from opening. Door hosts may ask what event you chose and why. Bring physical ID, know the line-up and arrive sober; a ticket does not override capacity, age rules or unsafe behaviour.',
      'best_nights', 'Pick the promoter, not the building. Queer, sex-positive editions bring the warmest and most expressive crowd; hard-techno brands can feel younger or more mainstream. The concrete rooms reward a line-up you genuinely want to hear, so research the whole bill instead of defaulting to Saturday.',
      'crowd_mix', 'Amsterdam techno regulars, international ravers and a growing tourist contingent share the venue. On queer-led nights, LGBTQ+ guests and femme expression move to the centre; another event may skew straight and male. Crowd chemistry changes more with programming than with season.',
      'dress_code', 'There is no permanent fetish uniform. Wear durable dance shoes and something aligned with the event—minimal techno black, playful queer styling or the stated sex-positive brief. Knowing the culture matters more than costume. Physical ID is essential, and camera use may be restricted inside.',
      'staff_inclusivity', 'Published rules reject racism, sexism, homophobia, transphobia, harassment and intimidation. Recent ravers often praise organised, friendly staff and careful questioning at queer events, while crowd quality remains uneven by promoter. The venue supplies a framework; the night must still live up to it.',
      'venue_classification', 'mainstream_techno_club_with_recurring_queer_and_sex_positive_events',
      'source_urls', to_jsonb(array[
        'https://radion.amsterdam/',
        'https://radion.amsterdam/our-policies',
        'https://www.reddit.com/r/amsterdam_rave/comments/1u6oe0e/is_radion_still_as_good_as_it_used_to_still_worth/',
        'https://www.reddit.com/r/amsterdam_rave/comments/1rb0kz7/radion_queues/',
        'https://ra.co/events/2433222',
        'https://www.reddit.com/r/amsterdam_rave/comments/1rimbcc/the_afters_27_feb_1_march_2026/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_policy_and_current_community_consensus','source_urls',to_jsonb(array['https://radion.amsterdam/our-policies','https://www.reddit.com/r/amsterdam_rave/comments/1rb0kz7/radion_queues/','https://www.reddit.com/r/amsterdam_rave/comments/1rimbcc/the_afters_27_feb_1_march_2026/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','event_specific_community_consensus','source_urls',to_jsonb(array['https://radion.amsterdam/','https://www.reddit.com/r/amsterdam_rave/comments/1u6oe0e/is_radion_still_as_good_as_it_used_to_still_worth/','https://ra.co/events/2433222']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','event_dependent_current_consensus','source_urls',to_jsonb(array['https://www.reddit.com/r/amsterdam_rave/comments/1u6oe0e/is_radion_still_as_good_as_it_used_to_still_worth/','https://www.reddit.com/r/amsterdam_rave/comments/1s7lhuc/the_afters_2729_march_2026/','https://ra.co/events/2433222']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','official_policy_and_event_guidance','source_urls',to_jsonb(array['https://radion.amsterdam/our-policies','https://ra.co/events/2433222','https://www.reddit.com/r/amsterdam_rave/comments/1mbtjzy']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_policy_with_positive_current_staff_signal','source_urls',to_jsonb(array['https://radion.amsterdam/our-policies','https://www.reddit.com/r/amsterdam_rave/comments/1u6oe0e/is_radion_still_as_good_as_it_used_to_still_worth/','https://www.reddit.com/r/amsterdam_rave/comments/1qzx30e/the_afters_68_february_2026/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1929::bigint, jsonb_build_object(
      'queue_wait', 'A ticket is not automatic entry. The 21+ door may ask whether you know the line-up, rules and queer purpose; groups are capped at three. Time-slot tickets can carry a late fee, and popular nights produce long waits. Arrive within your slot, with physical ID and a calm, informed answer.',
      'best_nights', 'The strongest night is the artist-led programme that actually speaks to you, not simply the busiest weekend. Long queer weekenders can transform across morning and afternoon, while a focused all-night set rewards music heads. Read the full bill, set times and re-entry terms before committing.',
      'crowd_mix', 'Queer Amsterdam is intentionally prioritised, alongside international LGBTQIA+ visitors and respectful straight guests who understand they are entering someone else''s cultural home. The balance shifts by booking, and regulars openly resist nights where gym-bro tourism crowds queer people out.',
      'dress_code', 'Self-expression is encouraged, but business dress, formal uniforms, team merchandise and unsafe footwear can fail the door. Think intentional rather than theatrical: sturdy shoes, movement and a look that belongs to the night. Cameras are stickered and photography inside is strictly prohibited.',
      'staff_inclusivity', 'The queer-run club publishes affirmative-consent standards, named anti-racism and anti-ableism commitments, an identifiable awareness team and confidential feedback route. Many guests call the care exceptional; others report opaque or mishandled door interactions. The structure is serious, not infallible.',
      'venue_classification', 'queer_run_techno_and_cultural_club',
      'source_urls', to_jsonb(array[
        'https://www.clubraum.nl/',
        'https://www.clubraum.nl/about',
        'https://www.clubraum.nl/house-rules',
        'https://www.clubraum.nl/code',
        'https://www.reddit.com/r/amsterdam_rave/comments/1vel7dy/spielraum_and_nexus_opening/',
        'https://www.reddit.com/r/amsterdam_rave/comments/1s1asbp/about_the_late_fee_at_raum/',
        'https://restaurantguru.com/Club-Raum-Amsterdam'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_rules_and_current_queue_consensus','source_urls',to_jsonb(array['https://www.clubraum.nl/house-rules','https://www.reddit.com/r/amsterdam_rave/comments/1s1asbp/about_the_late_fee_at_raum/','https://www.reddit.com/r/amsterdam_rave/comments/1vel7dy/spielraum_and_nexus_opening/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','programme_and_current_community_consensus','source_urls',to_jsonb(array['https://www.clubraum.nl/','https://www.reddit.com/r/amsterdam_rave/comments/1qn99pn/the_afters_23_25_january_2026/','https://www.reddit.com/r/amsterdam_rave/comments/1vel7dy/spielraum_and_nexus_opening/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_identity_and_current_community_consensus','source_urls',to_jsonb(array['https://www.clubraum.nl/about','https://www.clubraum.nl/house-rules','https://www.reddit.com/r/amsterdam_rave/comments/1qn99pn/the_afters_23_25_january_2026/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_official_dress_and_camera_rules','source_urls',to_jsonb(array['https://www.clubraum.nl/house-rules','https://www.reddit.com/r/amsterdam_rave/comments/1u9a1ug/club_raum/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_awareness_structure_with_mixed_current_reviews','source_urls',to_jsonb(array['https://www.clubraum.nl/code','https://www.clubraum.nl/house-rules','https://restaurantguru.com/Club-Raum-Amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1926::bigint, jsonb_build_object(
      'queue_wait', 'This large modern hotel runs a conventional reception; busy summer arrivals can crowd the lobby, but check-in is not a nightlife queue. Reserve upper-floor views and family rooms early. Central Station is roughly a 10–14 minute walk, close enough for luggage without inheriting its noise.',
      'best_nights', 'Weekend stays make late city plans easy while the IJ dock remains calmer than the old centre; midweek favours business, museums and steadier rates. Breakfast runs late enough to forgive a night out. The waterfront bar is pleasant for a return drink, not a substitute for Amsterdam''s queer scene.',
      'crowd_mix', 'International couples, families, groups, conference guests and solo travellers create a broad mainstream mix. LGBTQ+ guests are ordinary participants rather than a programmed audience. The hotel''s size and station access produce more visitors than locals, with a polished rather than intimate social rhythm.',
      'dress_code', 'No formal code applies. City casual, business wear and post-club clothes all move through the bright lobby without fuss. Pack for wind on the IJ and walking into town. The spacious rooms tolerate more luggage than a canal house, though style here is clean design rather than nightlife theatre.',
      'staff_inclusivity', 'July 2026 reviews repeatedly praise polite, proactive staff, clean spacious rooms and couples being helped without drama. Breakfast organisation and bar consistency receive occasional criticism. No deep queer-specific review base was found, so the fair rating is strong general hospitality, not specialist expertise.',
      'venue_classification', 'mainstream_design_led_four_star_hotel',
      'source_urls', to_jsonb(array[
        'https://room-matehotels.com/gb/hotel-aitana-amsterdam/',
        'https://www.booking.com/hotel/nl/room-mate-aitana.en-gb.html',
        'https://www.booking.com/reviews/nl/hotel/room-mate-aitana.en-gb.html',
        'https://www.expedia.co.uk/Amsterdam-Hotels-Room-Mate-Aitana.h6325959.Hotel-Information'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_location_and_current_review_consensus','source_urls',to_jsonb(array['https://room-matehotels.com/gb/hotel-aitana-amsterdam/','https://www.booking.com/hotel/nl/room-mate-aitana.en-gb.html','https://www.booking.com/reviews/nl/hotel/room-mate-aitana.en-gb.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_stay_pattern_summary','source_urls',to_jsonb(array['https://room-matehotels.com/gb/hotel-aitana-amsterdam/','https://www.booking.com/reviews/nl/hotel/room-mate-aitana.en-gb.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_and_guest_profile_summary','source_urls',to_jsonb(array['https://www.booking.com/hotel/nl/room-mate-aitana.en-gb.html','https://www.booking.com/reviews/nl/hotel/room-mate-aitana.en-gb.html','https://room-matehotels.com/gb/hotel-aitana-amsterdam/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://room-matehotels.com/gb/hotel-aitana-amsterdam/','https://www.booking.com/hotel/nl/room-mate-aitana.en-gb.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_general_review_consensus_limited_queer_specific_evidence','source_urls',to_jsonb(array['https://www.booking.com/reviews/nl/hotel/room-mate-aitana.en-gb.html','https://www.expedia.co.uk/Amsterdam-Hotels-Room-Mate-Aitana.h6325959.Hotel-Information']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (169::bigint, jsonb_build_object(
      'queue_wait', 'The second app record points to the same small Jordaan café, where the real constraint is seats rather than a rope line. By 9 or 10 pm on a busy Friday, the room and pool area can feel full. Come near the 4 pm opening for a slow drink; expect event nights to compress quickly.',
      'best_nights', 'Use Wednesday for open mics or a quieter catch-up, Thursday for recurring community drinks, and Friday or Saturday for the fullest queer-women-led pub atmosphere. The programme includes screenings and singalongs, so check the calendar. This duplicate record does not represent a second branch.',
      'crowd_mix', 'Queer women, FLINTA locals and non-binary guests are the social centre, with trans people, gay men, partners and respectful visitors also present. Ages mix easily around free pool and affordable drinks. Its newer all-queer welcome still protects the importance of the original lesbian space.',
      'dress_code', 'Arrive as you are after work, on a date or between galleries: denim, soft tailoring, boots, femme colour and masc comfort all sit naturally in the dark-wood room. There is no door uniform. A practical layer for terrace weather is more valuable than dressing for spectacle.',
      'staff_inclusivity', 'The foundation names the café as a safe, visible queer meeting place, and recent guests describe bartenders who care for both people and room. House rules explicitly reject transphobia, racism, sexism and queer hate. Peak-event entry can feel firmer, but day-to-day warmth is the dominant pattern.',
      'venue_classification', 'lesbian_rooted_inclusive_queer_brown_cafe',
      'duplicate_record_group', 'saarein_amsterdam',
      'source_urls', to_jsonb(array[
        'https://cafesaarein.nl/',
        'https://cafesaarein.nl/huisregels/',
        'https://queer-kalender.nl/nl/page/358/caf%C3%A9-saarein',
        'https://wanderlog.com/place/details/912223/saarein',
        'https://www.reddit.com/r/actuallesbianseurope/comments/1vg07on/anyone_in_amsterdam_today/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_review_and_capacity_consensus','source_urls',to_jsonb(array['https://cafesaarein.nl/','https://wanderlog.com/place/details/912223/saarein']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_official_and_community_calendar','source_urls',to_jsonb(array['https://cafesaarein.nl/','https://queer-kalender.nl/nl/page/358/caf%C3%A9-saarein','https://wanderlog.com/place/details/912223/saarein']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_review_and_community_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/912223/saarein','https://www.reddit.com/r/actuallesbianseurope/comments/1vg07on/anyone_in_amsterdam_today/','https://cafesaarein.nl/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/912223/saarein','https://queer-kalender.nl/nl/page/358/caf%C3%A9-saarein']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_rules_and_strong_current_review_consensus','source_urls',to_jsonb(array['https://cafesaarein.nl/huisregels/','https://cafesaarein.nl/','https://wanderlog.com/place/details/912223/saarein']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (166::bigint, jsonb_build_object(
      'queue_wait', 'Friday, Saturday and special events sell door tickets and can create a proper late queue. Entry switches from 18+ to 21+ after midnight, so carry physical ID and do not leave the age question to chance. Coats must go to the cloakroom, and security may search bags and pockets.',
      'best_nights', 'Friday and Saturday are the full two-floor pop-club experience; Thursday offers food and drinks before the room turns louder, while Sunday carries its own weekly party. Arrive before midnight for a softer door and conversation. Come late for a young, high-energy gay-street crowd.',
      'crowd_mix', 'Young gay men are the visible core, joined by mixed queer groups, straight friends and heavy weekend tourism. Earlier hours feel broader; after midnight the room becomes more male and dance-led. It is a gay club, but not a protected queer-only space, and crowd behaviour varies with peak traffic.',
      'dress_code', 'Polished casual works best. Sweatpants, sports kit, caps, slippers, sandals or an outfit staff considers inappropriate can be refused. You do not need designer labels—just look intentionally ready for a city-centre club. Wear proper shoes and expect to hand over your coat.',
      'staff_inclusivity', 'Written rules ban discrimination, sexual harassment, threatening conduct and excessive intoxication, with staff asked to intervene. Reviews split sharply: many enjoy the music and team, while serious security complaints also exist. Treat the policy as a promise to test, not proof that every shift feels safe.',
      'venue_classification', 'young_gay_bar_and_nightclub_with_mixed_allies',
      'source_urls', to_jsonb(array[
        'https://www.soho-amsterdam.com/info/faq',
        'https://www.soho-amsterdam.com/info/house-rules',
        'https://amsterdam.gaycities.com/bars/1817-soho-amsterdam',
        'https://www.aiprofile.com/en/netherlands/amsterdam/soho-amsterdam'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_official_entry_rules','source_urls',to_jsonb(array['https://www.soho-amsterdam.com/info/faq','https://www.soho-amsterdam.com/info/house-rules']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','official_schedule_and_review_summary','source_urls',to_jsonb(array['https://www.soho-amsterdam.com/info/faq','https://www.aiprofile.com/en/netherlands/amsterdam/soho-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_identity_and_review_consensus','source_urls',to_jsonb(array['https://amsterdam.gaycities.com/bars/1817-soho-amsterdam','https://www.aiprofile.com/en/netherlands/amsterdam/soho-amsterdam','https://www.soho-amsterdam.com/info/faq']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_official_dress_rules','source_urls',to_jsonb(array['https://www.soho-amsterdam.com/info/house-rules','https://www.soho-amsterdam.com/info/faq']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_policy_with_materially_mixed_reviews','source_urls',to_jsonb(array['https://www.soho-amsterdam.com/info/house-rules','https://amsterdam.gaycities.com/bars/1817-soho-amsterdam','https://www.aiprofile.com/en/netherlands/amsterdam/soho-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1126::bigint, jsonb_build_object(
      'queue_wait', 'Ordinary afternoons and evenings are walk-in and free; Tuesday''s naked bar can become genuinely busy. Lockers are free when stripping, and the compact room fills faster than a club. Arrive near 7 pm if naked pool matters, or later if a sociable crowd is worth trading for space.',
      'best_nights', 'Tuesday is the signature men-only naked night; Saturday begins with drag bingo before the weekend stretches later. Wednesday and Thursday happy hour suit a local beer and pool, while any night can include cruising upstairs. Choose how social, camp or exposed you actually want to feel.',
      'crowd_mix', 'Gay men of mixed ages, leather-era regulars, newcomers and international visitors anchor the bar. Tuesday is explicitly men-only; other days retain a male centre without the same published event restriction. The pool table and conversation make the crowd more intergenerational than a pure cruise club.',
      'dress_code', 'Street clothes are normal most days, and nudity is welcome daily rather than required. Tuesday strips the brief down: free lockers, naked bartenders and bare pool, with men-only access. Whatever you wear, the darkroom needs consent and situational awareness, not a fetish credential.',
      'staff_inclusivity', 'Current reviews are unusually affectionate about bartenders who talk, joke and make solo visitors feel at home; a rare hostile interaction keeps the picture human. The welcome is warm within a clearly gay-men-centred, sex-positive format. It is inclusive across age and body, not across every event''s gender access.',
      'venue_classification', 'gay_mens_social_bar_with_pool_nudity_and_darkroom',
      'source_urls', to_jsonb(array[
        'https://www.spijkerbar.nl/events/',
        'https://wanderlog.com/place/details/1931119/spijker-bar-amsterdam',
        'https://amsterdam.gaycities.com/bars/1803-spijker-bar'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_event_model_and_current_review_consensus','source_urls',to_jsonb(array['https://www.spijkerbar.nl/events/','https://wanderlog.com/place/details/1931119/spijker-bar-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_official_weekly_programme','source_urls',to_jsonb(array['https://www.spijkerbar.nl/events/','https://wanderlog.com/place/details/1931119/spijker-bar-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_access_and_review_consensus','source_urls',to_jsonb(array['https://www.spijkerbar.nl/events/','https://wanderlog.com/place/details/1931119/spijker-bar-amsterdam','https://amsterdam.gaycities.com/bars/1803-spijker-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_event_and_venue_guidance','source_urls',to_jsonb(array['https://www.spijkerbar.nl/events/','https://amsterdam.gaycities.com/bars/1803-spijker-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_review_consensus_with_event_access_limits','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1931119/spijker-bar-amsterdam','https://amsterdam.gaycities.com/bars/1803-spijker-bar']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1127::bigint, jsonb_build_object(
      'queue_wait', 'The terrace makes afternoon entry effortless, while Friday and Saturday can leave the small interior permanently buzzing. Online reservations are not taken; staff find a spot when you arrive. Come early for people-watching, or accept a standing drink once the street''s evening wave lands.',
      'best_nights', 'Wednesday cocktail night is easy and playful; Sunday''s 10 pm drag show supplies the clearest weekly event. Friday and Saturday are best for an all-night gay-bar pulse. Start on the terrace, add comfort food across the paired spaces, then let the crowd decide whether you dance or keep talking.',
      'crowd_mix', 'Gay men remain the core, alongside queer friends, tourists and an increasing number of straight couples. Recent regulars notice the shift and sometimes miss the older sense of belonging. It stays recognisably gay, but the main-street location produces a broader mix than a community-only pub.',
      'dress_code', 'Bright shirts, smart-casual basics, trainers and drag-night sparkle all fit. This is a camp cocktail bar, not a cruise or fetish venue, despite the name. Dress for terrace weather and a tight interior. Ease and sociability matter more than looking expensive or sexually coded.',
      'staff_inclusivity', 'Friendly bartenders, strong cocktails and fun service recur across current reviews, with particular praise for individual kindness. The tension is not usually the staff but whether heavy ally and tourist traffic dilutes the queer centre. Community sentiment is positive, with a real note of cultural change.',
      'venue_classification', 'gay_cocktail_bar_and_terrace_with_drag_programming',
      'source_urls', to_jsonb(array[
        'https://taboo-bar-amsterdam.jimdosite.com/',
        'https://wanderlog.com/place/details/1994821/taboo-bar-amsterdam',
        'https://www.thegayagenda.fyi/amsterdam/businesses/taboo/',
        'https://www.travelgay.com/venue/taboo',
        'https://amsterdam.gaycities.com/bars/303801-taboo?tag=mostly-men'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_service_model_and_review_consensus','source_urls',to_jsonb(array['https://taboo-bar-amsterdam.jimdosite.com/','https://wanderlog.com/place/details/1994821/taboo-bar-amsterdam','https://www.travelgay.com/venue/taboo']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_official_programme','source_urls',to_jsonb(array['https://taboo-bar-amsterdam.jimdosite.com/','https://www.thegayagenda.fyi/amsterdam/businesses/taboo/','https://wanderlog.com/place/details/1994821/taboo-bar-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','current_review_and_community_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1994821/taboo-bar-amsterdam','https://amsterdam.gaycities.com/bars/303801-taboo?tag=mostly-men','https://www.travelgay.com/venue/taboo']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','venue_and_event_signal','source_urls',to_jsonb(array['https://taboo-bar-amsterdam.jimdosite.com/','https://wanderlog.com/place/details/1994821/taboo-bar-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','positive_current_reviews_with_crowd_shift_context','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1994821/taboo-bar-amsterdam','https://www.thegayagenda.fyi/amsterdam/businesses/taboo/','https://amsterdam.gaycities.com/bars/303801-taboo?tag=mostly-men']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1128::bigint, jsonb_build_object(
      'queue_wait', 'The pub opens at 4 pm and usually absorbs walk-ins, but Tuesday bingo and the compact weekend dance floor can fill early. Arrive before the 8:30 bingo start if you need a seat; Friday karaoke and late DJs reward a looser plan. The canal-view room feels busy before a line becomes necessary.',
      'best_nights', 'Tuesday drag bingo is the institution, Thursday adds stage drag, Friday alternates karaoke and weekends bring DJs. A quiet Monday or Wednesday gives the canal view and regulars more room. Choose a programmed night for camp spectacle, or an ordinary one for actual pub conversation.',
      'crowd_mix', 'Loyal gay regulars, drag fans, mixed LGBTQ+ groups, neighbours and tourists share the Zeedijk room. The bar is proudly gay and openly welcomes everyone, with age and nationality mixed more broadly than in a young club. Locals give the room continuity even at peak visitor times.',
      'dress_code', 'Pub clothes are enough: denim, a good shirt, trainers, drag-night glamour or whatever survived sightseeing. There is no formal code. Dress for a close room and possible karaoke rather than a door test; the most convincing accessory is willingness to laugh at yourself.',
      'staff_inclusivity', 'The house describes diversity as part of its identity, and its long drag-led programme makes queer culture visible rather than decorative. Community recommendations frame it as an easy all-round gay bar. Independent service detail is thinner than the calendar, so the rating is warmly positive, not absolute.',
      'venue_classification', 'inclusive_gay_pub_with_drag_bingo_karaoke_and_djs',
      'source_urls', to_jsonb(array[
        'https://queenshead.nl/',
        'https://www.amsterdamlocalgems.com/places/the-queens-head/',
        'https://www.travelgay.com/venue/queens-head',
        'https://www.reddit.com/r/AskGaybrosOver30/comments/1n4z2k6/amsterdam_gay_barpubs_for_socializing/',
        'https://en.wikipedia.org/wiki/The_Queen%27s_Head_%28Amsterdam%29'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_schedule_and_capacity_guidance','source_urls',to_jsonb(array['https://queenshead.nl/','https://www.amsterdamlocalgems.com/places/the-queens-head/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_current_official_programme','source_urls',to_jsonb(array['https://queenshead.nl/','https://www.amsterdamlocalgems.com/places/the-queens-head/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_identity_and_community_consensus','source_urls',to_jsonb(array['https://queenshead.nl/','https://www.travelgay.com/venue/queens-head','https://www.reddit.com/r/AskGaybrosOver30/comments/1n4z2k6/amsterdam_gay_barpubs_for_socializing/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','programme_and_community_signal','source_urls',to_jsonb(array['https://queenshead.nl/','https://www.amsterdamlocalgems.com/places/the-queens-head/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','official_inclusion_with_limited_independent_current_service_detail','source_urls',to_jsonb(array['https://queenshead.nl/','https://www.travelgay.com/venue/queens-head','https://www.reddit.com/r/AskGaybrosOver30/comments/1n4z2k6/amsterdam_gay_barpubs_for_socializing/']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (173, 1929, 1926, 169, 166, 1126, 1127, 1128)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
