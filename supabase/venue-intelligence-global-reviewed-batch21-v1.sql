-- Queer Atlas venue intelligence: global review-led editorial pass, batch 21.
-- Antwerp cafes, clubs, sauna, fetish venue and the temporary Pride route.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (1213::bigint, jsonb_build_object(
      'queue_wait', 'This is a walk-in cafe, not a velvet-rope door. The pinch point is finding a terrace seat: guests repeatedly describe the room as full at night, especially on weekends. Drop in before the late rush for a table; after that, expect a lively standing drink rather than a formal queue.',
      'best_nights', 'Friday and Saturday bring the loudest, most club-like version of DeLux, with pop music, singing bartenders and a strongly queer tilt. A weekday afternoon is better for Belgian beer and conversation. Drag appears in the programme, but check current socials rather than assuming a fixed weekly show.',
      'crowd_mix', 'The central location pulls tourists and casual city drinkers into a bar that becomes visibly gayer at weekends. Regulars, solo visitors, mixed LGBTQ+ groups and straight friends all fit. It feels more like a sociable queer-leaning cafe than a protected community room or specialist men''s venue.',
      'dress_code', 'Come as you would for a central Antwerp cafe: denim, trainers, a sharp shirt or a little weekend colour all work. There is no published door code and daytime clothes do not look out of place. Dress for terrace weather and a crowded room, not for a fashion test.',
      'staff_inclusivity', 'Recent guests often praise upbeat service, fair prices and bartenders who help animate the room. One detailed account describes harassment by a drunk patron despite otherwise kind staff, so the picture is warm but not spotless. No explicit safeguarding or trans-inclusion policy was found on the available pages.',
      'venue_classification', 'gay_friendly_central_cafe_bar_with_queer_weekend_skew',
      'source_urls', to_jsonb(array[
        'https://www.cafedelux.be/',
        'https://wanderlog.com/place/details/1368939/caf%C3%A9-delux',
        'https://antwerp.gaycities.com/bars/303297-caf%C3%A9-delux',
        'https://www.travelgay.com/venue/cafe-delux'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_review_capacity_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1368939/caf%C3%A9-delux','https://antwerp.gaycities.com/bars/303297-caf%C3%A9-delux']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_listing_and_review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1368939/caf%C3%A9-delux','https://www.travelgay.com/venue/cafe-delux','https://antwerp.gaycities.com/bars/303297-caf%C3%A9-delux']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','queer_listing_and_current_review_consensus','source_urls',to_jsonb(array['https://antwerp.gaycities.com/bars/303297-caf%C3%A9-delux','https://wanderlog.com/place/details/1368939/caf%C3%A9-delux','https://www.travelgay.com/venue/cafe-delux']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','venue_format_and_review_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1368939/caf%C3%A9-delux','https://antwerp.gaycities.com/bars/303297-caf%C3%A9-delux']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','positive_current_service_consensus_with_documented_caveat','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1368939/caf%C3%A9-delux','https://selfcity.be/koffiebar/antwerpen/cafe-delux/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1215::bigint, jsonb_build_object(
      'queue_wait', 'Most days you simply walk in or take a terrace table; conversation, not crowd control, is the rhythm. Friday, Saturday and Pride events can fill the bar and square, but there is no standing reputation for a hard door. Arrive earlier if you want a seat rather than joining the later social spillover.',
      'best_nights', 'Friday and Saturday run until 3 am and carry the fullest bar energy. Sunday from noon is the gentler choice for terrace drinks, while Pride week brings dedicated events and a much bigger pulse. For actually meeting locals, an ordinary midweek evening can be more rewarding than the annual spectacle.',
      'crowd_mix', 'Queer Antwerp has deep roots here: the cafe sits with the city''s LGBTQ+ community hub, yet calls itself straight-friendly and welcomes allies. Local regulars, activists, mixed-age queer groups and curious visitors mingle easily. The balance is community-led without becoming socially closed.',
      'dress_code', 'The practical brief is exactly the house message: come as you are. Everyday work clothes, relaxed terrace layers, date-night polish and Pride colour all belong. There is no fetish cue or clubwear test; comfortable shoes and a layer for the open square matter more than styling for approval.',
      'staff_inclusivity', 'Warm bartenders are a recurring theme: visitors describe patient beer recommendations, easy conversation and a room where strangers talk. Its link to the community centre adds substance to the welcome. Available evidence is strongly positive, though no detailed public incident protocol was located.',
      'venue_classification', 'community_anchored_straight_friendly_gay_cafe',
      'source_urls', to_jsonb(array[
        'https://www.dendraak.be/',
        'https://wanderlog.com/place/details/1357418/caf%C3%A9-den-draak',
        'https://nl.restaurantguru.com/Den-Draak-Antwerp',
        'https://www.reddit.com/r/Antwerpen/comments/1jsrfth/lgbt_social_life_in_antwerp/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_service_model_and_current_capacity_signal','source_urls',to_jsonb(array['https://www.dendraak.be/','https://wanderlog.com/place/details/1357418/caf%C3%A9-den-draak','https://nl.restaurantguru.com/Den-Draak-Antwerp']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_official_hours_and_pride_programme','source_urls',to_jsonb(array['https://www.dendraak.be/','https://nl.restaurantguru.com/Den-Draak-Antwerp']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_identity_and_local_community_consensus','source_urls',to_jsonb(array['https://www.dendraak.be/','https://www.reddit.com/r/Antwerpen/comments/1jsrfth/lgbt_social_life_in_antwerp/','https://wanderlog.com/place/details/10400752/the-pink-house-avaria-antwerp']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_come_as_you_are_positioning','source_urls',to_jsonb(array['https://www.dendraak.be/','https://wanderlog.com/place/details/1357418/caf%C3%A9-den-draak']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_service_consensus_and_community_context','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1357418/caf%C3%A9-den-draak','https://nl.restaurantguru.com/Den-Draak-Antwerp','https://wanderlog.com/place/details/10400752/the-pink-house-avaria-antwerp']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1220::bigint, jsonb_build_object(
      'queue_wait', 'Entry is event-led rather than one predictable Saturday routine. Tickets are sold online for selected nights; everyone is 18+, ID can be requested, searches are possible and coats or bags go into the paid cloakroom. Pride and major concepts justify early arrival, while an ordinary opening can be much softer.',
      'best_nights', 'Choose the concept, not just the building. Red & Blue and Woodpop carry the clearest gay legacy, LSBN.GRLS. changes the gender centre, and other Saturdays can be mainstream or Latin. The current calendar is the essential pre-visit check; this is not a queer club every night it opens.',
      'crowd_mix', 'The industrial room serves both gay and straight nightlife, so the audience can flip completely with the promoter. Gay-branded editions draw men from Antwerp and the wider Benelux; lesbian-led and Pride dates create another balance. On a generic Saturday, do not expect a queer-majority floor by default.',
      'dress_code', 'Aim for neat, intentional clubwear and proper shoes. The written rules allow refusal for an unkempt appearance or unsuitable clothing, and require coats, large bags and helmets in the cloakroom. There is no universal fetish brief; the event artwork should guide how playful or polished to go.',
      'staff_inclusivity', 'House rules reject racism, aggression and unwanted intimacy, but the text is dated and gives security broad discretion. Guest reports are split: friendly staff and memorable nights sit beside serious allegations of rough or discriminatory treatment. The fairest signal is mixed, not reassuringly generic.',
      'venue_classification', 'mixed_mainstream_event_club_with_recurring_queer_concepts',
      'source_urls', to_jsonb(array[
        'https://www.cargoclub.be/',
        'https://www.cargoclub.be/intern-reglement',
        'https://wanderlog.com/place/details/5238308/cargo-club',
        'https://restaurantguru.com/Cargo-Club-Antwerp'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_ticketing_entry_and_cloakroom_rules','source_urls',to_jsonb(array['https://www.cargoclub.be/','https://www.cargoclub.be/intern-reglement']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_current_concept_calendar','source_urls',to_jsonb(array['https://www.cargoclub.be/','https://wanderlog.com/place/details/5238308/cargo-club']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','event_specific_official_identity_and_review_consensus','source_urls',to_jsonb(array['https://www.cargoclub.be/','https://wanderlog.com/place/details/5238308/cargo-club','https://www.travelgay.com/venue/red-blue']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_official_appearance_and_cloakroom_rules','source_urls',to_jsonb(array['https://www.cargoclub.be/intern-reglement','https://www.cargoclub.be/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_but_dated_policy_with_materially_mixed_reviews','source_urls',to_jsonb(array['https://www.cargoclub.be/intern-reglement','https://wanderlog.com/place/details/5238308/cargo-club','https://restaurantguru.com/Cargo-Club-Antwerp']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1207::bigint, jsonb_build_object(
      'queue_wait', 'Do not mistake the 11 pm opening for peak time: guests say the room can still feel almost empty then and builds later. Friday and Saturday continue until at least 8 am, Sunday from 9 pm to 6 am. Bring ID; capacity, intoxication or prior conduct can still stop entry even without a long line.',
      'best_nights', 'Friday and Saturday deliver the full dance-plus-cruise format; Sunday starts earlier and suits anyone who wants the same energy without waiting for deep after-hours. Pride brings an extended non-stop weekend. DJ and theme quality varies, so match the programme to your music rather than relying on the club name.',
      'crowd_mix', 'Gay men remain the centre, but the bar and dance floor welcome women, trans women and other open-minded guests. The third-floor cruise area is explicitly men-only and excludes women, trans women and cross-dressers. Ages and nationalities mix; the sexual layer is separate enough to skip if you only want to dance.',
      'dress_code', 'There is no single uniform: casual clothes, sportswear, harnesses and jockstraps are all allowed. Nudity belongs only in the cruise area. Wear something comfortable for a small, warm dance floor and stairs; lockers exist, though guests note that they are compact and repeated access can cost extra.',
      'staff_inclusivity', 'Most current accounts describe friendly door staff, a clean layout and an easy, open-minded atmosphere; a smaller set reports rude service or discrimination. Published rules ban harassment and discriminatory behaviour, yet the men-only zone uses an exclusionary gender policy. The welcome is real but not universal.',
      'venue_classification', 'gay_dance_and_cruise_club_with_gender_restricted_play_zone',
      'source_urls', to_jsonb(array[
        'https://www.clubrandom.be/',
        'https://www.clubrandom.be/house-rules/',
        'https://wanderlog.com/place/details/4424165/club-random',
        'https://restaurantguru.com/Club-Random-Antwerp'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_entry_rules_and_current_arrival_consensus','source_urls',to_jsonb(array['https://www.clubrandom.be/','https://www.clubrandom.be/house-rules/','https://wanderlog.com/place/details/4424165/club-random']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_official_hours_and_pride_programme','source_urls',to_jsonb(array['https://www.clubrandom.be/','https://www.clubrandom.be/antwerp-pride/','https://wanderlog.com/place/details/4424165/club-random']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_official_access_rules_and_current_review_consensus','source_urls',to_jsonb(array['https://www.clubrandom.be/house-rules/','https://wanderlog.com/place/details/4424165/club-random','https://antwerp.gaycities.com/bars/304457-club-random?tag=naked']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_official_clothing_and_nudity_rules','source_urls',to_jsonb(array['https://www.clubrandom.be/house-rules/','https://wanderlog.com/place/details/4424165/club-random']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','published_conduct_rules_with_mixed_current_service_evidence','source_urls',to_jsonb(array['https://www.clubrandom.be/house-rules/','https://wanderlog.com/place/details/4424165/club-random','https://restaurantguru.com/Club-Random-Antwerp']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1206::bigint, jsonb_build_object(
      'queue_wait', 'This is a daily sauna check-in, not a nightclub door. Ordinary afternoons should be straightforward; Wednesday''s reduced price, Pride and later weekend hours can bring more bodies to the compact wet areas. Bring ID for age discounts, and ask for a re-entry ticket before leaving if you plan to return within four hours.',
      'best_nights', 'Wednesday is the value pick because every age receives a discount. Weekday afternoons favour quiet steam and space; Friday and Saturday stay open an hour later and feel more social. The venue also programs occasional events, so check the current page if you want a themed crowd rather than simple sauna time.',
      'crowd_mix', 'Local gay men and visitors form the base, with ages visibly mixed: the published under-25 and under-30 prices lower the barrier for younger guests, while many accounts describe a mature crowd. This is a men-centred sexual-wellness space, not a general spa; a detailed public trans-access policy was not found.',
      'dress_code', 'Fashion disappears at reception. Admission includes two towels; slippers cost extra, and condoms and lubricant are free. Bring simple clothes, your ID if claiming an age rate and perhaps your own pool-safe footwear. Inside, sauna etiquette, hygiene and consent matter far more than what you wore through the door.',
      'staff_inclusivity', 'Experiences vary more than the cheerful branding suggests. Several visitors describe a warm explanation, clean rooms and kind staff; others report hostile service or tired wet facilities. The honest signal is mixed-positive for welcome and mixed for maintenance, with no detailed inclusion protocol published.',
      'venue_classification', 'gay_mens_sauna_with_wellness_and_cruising_facilities',
      'source_urls', to_jsonb(array[
        'https://www.gaysaunaherenhuis.be/',
        'https://www.gaysaunaherenhuis.be/openingsuren',
        'https://wanderlog.com/place/details/1368983/t-herenhuis',
        'https://saunas4men.com/nl/belgie/antwerpen/herenhuis'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_entry_reentry_and_current_capacity_context','source_urls',to_jsonb(array['https://www.gaysaunaherenhuis.be/','https://wanderlog.com/place/details/1368983/t-herenhuis']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_official_hours_discounts_and_event_model','source_urls',to_jsonb(array['https://www.gaysaunaherenhuis.be/','https://www.gaysaunaherenhuis.be/openingsuren','https://saunas4men.com/nl/belgie/antwerpen/herenhuis']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_age_pricing_and_review_consensus_with_policy_gap','source_urls',to_jsonb(array['https://www.gaysaunaherenhuis.be/','https://wanderlog.com/place/details/1368983/t-herenhuis','https://saunas4men.com/nl/belgie/antwerpen/herenhuis']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_official_towel_slipper_and_supply_guidance','source_urls',to_jsonb(array['https://www.gaysaunaherenhuis.be/','https://www.gaysaunaherenhuis.be/openingsuren']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','materially_mixed_current_service_and_maintenance_reviews','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1368983/t-herenhuis','https://selfcity.be/sauna/antwerpen/t-herenhuis/','https://saunas4men.com/nl/belgie/antwerpen/herenhuis']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1222::bigint, jsonb_build_object(
      'queue_wait', 'A regular early evening can be quiet enough to walk straight in; one Pride account found the room empty at 9 pm and properly busy around 3 am. Friday and Saturday are the reliable crowd nights, with drag dates filling faster. The terrace adds breathing room, but peak celebrations can spill well past the doorway.',
      'best_nights', 'Friday or Saturday is the safest choice for music, dancing and a late crowd. Drag shows, Eurovision and Pride programming make selected Sundays or event nights much bigger than the ordinary calendar. Go early for a drink inside the historic building; arrive late when you want the two-level party version.',
      'crowd_mix', 'The venue began as an LGBTQ+ hotspot and now deliberately mixes queer regulars with non-LGBTQ+ guests. Gay men, lesbians, drag audiences, neighbours and tourists all appear, with the balance broader than a single-community bar. Weekends feel queer-led; quiet nights may read simply as a stylish local cafe.',
      'dress_code', 'There is no published fashion filter. Smart-casual basics, trainers, drag-night shine and Pride gear all sit comfortably in the eclectic room. Dress for stairs, dancing and the outdoor terrace; on the very busiest nights, closed shoes are a sensible choice in a bar where glasses and crowds share limited floor space.',
      'staff_inclusivity', 'The public promise is a place everyone can enjoy, and many guests describe warm hospitality, friendly staff and an easy mixed crowd. A recent tourist account reports markedly colder treatment than locals received. That minority signal matters: broadly welcoming, but not consistent enough to call universally effortless.',
      'venue_classification', 'historic_lgbtq_landmark_cafe_with_mixed_weekend_dance_crowd',
      'source_urls', to_jsonb(array[
        'https://www.hessenhuis.be/the-venue',
        'https://wanderlog.com/place/details/1357357/caf-hessenhuis',
        'https://www.reddit.com/r/Antwerpen/comments/1mq8ql8/hessenhuis_op_reguliere_avonden/',
        'https://restaurantguru.com/Hessenhuis-Antwerp'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_local_arrival_report_and_official_hours','source_urls',to_jsonb(array['https://www.reddit.com/r/Antwerpen/comments/1mq8ql8/hessenhuis_op_reguliere_avonden/','https://www.hessenhuis.be/the-venue','https://wanderlog.com/place/details/1357357/caf-hessenhuis']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','official_hours_and_current_event_review_consensus','source_urls',to_jsonb(array['https://www.hessenhuis.be/the-venue','https://www.travelgay.com/venue/hessenhuis','https://www.reddit.com/r/Antwerpen/comments/1mq8ql8/hessenhuis_op_reguliere_avonden/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_official_identity_and_current_review_consensus','source_urls',to_jsonb(array['https://www.hessenhuis.be/the-venue','https://wanderlog.com/place/details/1357357/caf-hessenhuis','https://restaurantguru.com/Hessenhuis-Antwerp']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','venue_format_and_peak_night_practical_signal','source_urls',to_jsonb(array['https://www.hessenhuis.be/the-venue','https://www.reddit.com/r/Antwerpen/comments/1mq8ql8/hessenhuis_op_reguliere_avonden/','https://wanderlog.com/place/details/1357357/caf-hessenhuis']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','official_welcome_with_materially_mixed_current_service_reviews','source_urls',to_jsonb(array['https://www.hessenhuis.be/the-venue','https://wanderlog.com/place/details/1357357/caf-hessenhuis']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1205::bigint, jsonb_build_object(
      'queue_wait', 'This record is a temporary public Pride corridor, not a venue with a normal door. The real waits are transport, security and crowd bottlenecks when more than 150,000 people converge for the parade. Walk, cycle or use transit, arrive well before the main flow and keep the official map open.',
      'best_nights', 'It only makes sense during Antwerp Pride, running 5-9 August in 2026; the parade is Saturday 8 August and the quays host major festival activity. Outside that programme, the waterfront is simply public space. Use the live schedule because the exact parade finish, stages and access points can change.',
      'crowd_mix', 'This is the broadest queer crowd in the city: LGBTQIA+ locals, families, activists, performers, international visitors, allies and curious residents share the quays. The scale creates joyful visibility but less intimacy than a community venue, and an open public route cannot guarantee a queer-only atmosphere.',
      'dress_code', 'Wear the fantasy, but build it on walking shoes. Add sun protection, a refillable water bottle and a layer for the wind off the Scheldt; glitter is optional, weather planning is not. The organisers provide a central change station, so travellers do not need to cross the city already dressed for the parade.',
      'staff_inclusivity', 'More than 350 volunteers support the event, with visible information points, first aid, water stations and a route for reporting harassment or discrimination. The formal safety plan is substantial, but this remains a huge public gathering. Keep a buddy plan and treat official support as available, not omnipresent.',
      'venue_classification', 'temporary_annual_public_pride_route_not_permanent_venue',
      'source_urls', to_jsonb(array[
        'https://antwerppride.com/bezoekersinfo',
        'https://antwerppride.com/veiligheid',
        'https://en.antwerppride.com/faq',
        'https://www.antwerpen.be/nieuws/5-908-or-antwerp-pride-stad-antwerpen'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_attendance_transport_and_site_guidance','source_urls',to_jsonb(array['https://antwerppride.com/bezoekersinfo','https://www.antwerpen.be/nieuws/5-908-or-antwerp-pride-stad-antwerpen','https://en.antwerppride.com/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','explicit_current_2026_dates_and_programme','source_urls',to_jsonb(array['https://en.antwerppride.com/faq','https://en.antwerppride.com/','https://www.antwerpen.be/nieuws/5-908-or-antwerp-pride-stad-antwerpen']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_scale_identity_and_public_access','source_urls',to_jsonb(array['https://antwerppride.com/about','https://en.antwerppride.com/faq','https://www.antwerpen.be/nieuws/5-908-or-antwerp-pride-stad-antwerpen']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','official_weather_hydration_and_change_station_guidance','source_urls',to_jsonb(array['https://antwerppride.com/veiligheid','https://antwerppride.com/bezoekersinfo','https://en.antwerppride.com/faq']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_official_safety_reporting_and_volunteer_structure','source_urls',to_jsonb(array['https://antwerppride.com/veiligheid','https://antwerppride.com/about','https://en.antwerppride.com/faq']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1203::bigint, jsonb_build_object(
      'queue_wait', 'There are no advance tickets, even for the busiest fetish dates, so a major weekend can mean a real line. Entry is men-only, 18+, with valid ID and compulsory membership. Arrive before the peak, allow time to register and change, and keep the purchase card safe: losing it carries a steep charge.',
      'best_nights', 'Follow the fetish calendar rather than choosing blindly. Leather, rubber, puppy, sportswear and larger ritual events each produce a different room; Darklands-related dates can be intense and international. A regular session suits first exploration, while signature weekends deliver the six-floor scale at full force.',
      'crowd_mix', 'Gay and bi men, leather veterans, pups, rubber fans and international fetish travellers share the six floors. Recent feedback describes a trans man feeling safe, but the formal rule is simply men 18+ and does not explain trans admission. Expect a sexual, participatory crowd rather than spectators.',
      'dress_code', 'The code is real: leather, rubber, skin, military, jeans, uniform, sportswear or nudity are accepted, while classic shoes and flip-flops are not. You can arrive in street clothes, change at the cloakroom and store your phone. Skip perfume, bring a towel if useful and make the chosen fetish look intentional.',
      'staff_inclusivity', 'Official rules require respect and provide free safer-sex supplies. Current experiences diverge: some guests praise welcoming registration, cleanliness and trans-male safety; others report unclear charges, rude handling or a poorly addressed racist incident. The community rating is mixed despite the strong legacy.',
      'venue_classification', 'men_only_membership_fetish_and_cruise_club',
      'source_urls', to_jsonb(array[
        'https://www.the-boots.com/',
        'https://www.the-boots.com/info-faq.php',
        'https://www.the-boots.com/info-regulation.php',
        'https://wanderlog.com/place/details/1368966/the-boots',
        'https://www.travelgay.com/venue/the-boots'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_official_ticket_membership_and_id_rules_with_current_queue_signal','source_urls',to_jsonb(array['https://www.the-boots.com/info-faq.php','https://www.the-boots.com/info-regulation.php','https://wanderlog.com/place/details/1368966/the-boots']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','official_fetish_programme_and_current_event_consensus','source_urls',to_jsonb(array['https://www.the-boots.com/','https://www.travelgay.com/venue/the-boots','https://wanderlog.com/place/details/1368966/the-boots']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_access_identity_and_current_trans_male_guest_signal','source_urls',to_jsonb(array['https://www.the-boots.com/','https://www.the-boots.com/info-regulation.php','https://wanderlog.com/place/details/1368966/the-boots']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_official_fetish_footwear_cloakroom_and_scent_rules','source_urls',to_jsonb(array['https://www.the-boots.com/info-regulation.php','https://www.the-boots.com/info-faq.php','https://www.the-boots.com/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','official_safety_rules_with_materially_mixed_current_reviews','source_urls',to_jsonb(array['https://www.the-boots.com/info-regulation.php','https://wanderlog.com/place/details/1368966/the-boots','https://www.travelgay.com/venue/the-boots']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (1213, 1215, 1220, 1207, 1206, 1222, 1205, 1203)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
