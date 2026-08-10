-- Queer Atlas: Gothenburg venue and event intelligence
-- Researched 2026-08-10 from official pages, current programmes and review consensus.
-- Safe to run repeatedly. No temporary tables are used.
-- Source names remain in metadata; visitor-facing topic copy reads as direct local guidance.

begin;

with researched(name, patch) as (
  values
    ('Bee Kök & Bar', jsonb_build_object(
      'queue_wait', 'This is a restaurant-bar before it is a nightclub, so the usual friction is finding a table rather than passing a door. Dinner, drag and Eurovision evenings can fill the room; reserve for food or arrive before the late Friday-Saturday lift. Bar drop-ins are normally straightforward.',
      'best_nights', 'Choose a weekday lunch or early drink when you want conversation and the market-hall setting. Friday and Saturday are the stronger late choices: dinner energy gradually turns into louder music and dancing until 03:00. For drag or Eurovision, follow the dated programme rather than assuming every weekend.',
      'crowd_mix', 'The room belongs first to queer Gothenburg regulars, but straight friends, families, after-work groups and visitors are woven in rather than separated. Reviews repeatedly describe mixed ages and a blend of locals and travellers; it feels like a social living room, not a tourist-only gay stop.',
      'dress_code', 'Come as you would to an easy central restaurant or drinks with friends: denim, trainers, knitwear and smart-casual looks all fit. There is no reliable evidence of fashion-based face control. Bring ID for late drinking, and add personality for a themed night without treating it as compulsory costume.',
      'staff_inclusivity', 'The strongest review pattern is warm, personal and explicitly welcoming service, matching the venue’s all-genders, all-sexualities positioning. A few 2025 diners found staff stretched when busy and had to chase orders, so inclusion reads stronger than service speed at peak dinner time.',
      'review_signal', 'Thatsup 4.3/5 from 8 ratings; Tripadvisor Traveller’s Choice with recent praise for welcome alongside some 2025 food and slow-service criticism; GayCities and aggregated reviews describe a friendly mixed LGBTQ+ room.',
      'source_urls', to_jsonb(array[
        'https://beebar.se/',
        'https://www.goteborg.com/en/guides/lgbtqi-gothenburg',
        'https://thatsup.co.uk/gothenburg/restaurant/bee-kok-bar/',
        'https://www.tripadvisor.com/Restaurant_Review-g189894-d2172904-Reviews-Bee_Kok_Bar-Gothenburg_Vastra_Gotaland_County_West_Coast.html',
        'https://gothenburg.gaycities.com/bars/303648-bee-kok-bar',
        'https://wanderlog.com/place/details/1426264/bee-k%C3%B6k--bar'
      ]::text[]),
      'evidence_scope', 'official_identity_hours_and_programme_plus_multi_platform_guest_consensus',
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Gretas', jsonb_build_object(
      'queue_wait', 'Expect a real nightclub arrival: ID check, cover and wardrobe rather than a casual bar walk-in. No defensible average wait is published, but weekends build late. Arriving around opening is the lower-friction move; after midnight, leave room for a line and do not assume entry is instant.',
      'best_nights', 'Friday and Saturday are the actual club nights, with two floors separating broad pop, throwbacks and schlager from house-leaning energy. Go later for the fullest dance-floor feeling, earlier for easier entry and space to orient yourself. Check the current post if a drag set or special theme matters.',
      'crowd_mix', 'The LGBTQ+ core is unmistakable, yet straight friends, international weekenders and mixed groups also come. Recent reviews describe a broad social crowd rather than one age or gender lane; some queer regulars dislike groups treating the club as a spectacle, so arrive to participate, not observe.',
      'dress_code', 'Everyday going-out clothes work: jeans, trainers, a fitted top, sequins or full party colour all appear at home. No current official strict fashion code was found. Valid ID matters more than a designer look, and the wardrobe is part of the normal entry flow, so budget for coat handling.',
      'staff_inclusivity', 'Experiences are mixed. Recent guests praise kind bartenders, an open dance floor and feeling especially welcomed across race; others report disputes at entry, high charges and the refusal of free bar tap water. Treat the queer identity as real, but not as proof that every service interaction lands well.',
      'review_signal', 'Google aggregate reported at 3.3/5 from 455 reviews in 2026; current reviews range from powerful inclusion praise to complaints about prices, water and door or wardrobe handling. The official city guide still treats Gretas as a core inclusive gay club.',
      'source_urls', to_jsonb(array[
        'https://www.goteborg.com/en/places/gretas-2',
        'https://www.goteborg.com/en/guides/lgbtqi-gothenburg',
        'https://wanderlog.com/place/details/1822019/gretas',
        'https://www.tripadvisor.com/Attraction_Review-g189894-d607808-Reviews-Greta_s-Gothenburg_Vastra_Gotaland_County_West_Coast.html',
        'https://gothenburg.gaycities.com/bars/303647-gretas?tag=mixed-lgbtq',
        'https://www.reddit.com/r/Gothenburg/comments/1rycupw/lgbt_community_here/'
      ]::text[]),
      'evidence_scope', 'official_queer_identity_and_two_floor_format_plus_current_mixed_door_service_and_value_reviews',
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Haket', jsonb_build_object(
      'queue_wait', 'Haket behaves like a neighbourhood beer pub, not a velvet-rope club. There is no recurring door queue in the evidence; the practical constraint is a good table when Friday, Saturday or a small live session gets busy. Come earlier if you are a group or want food with your first beer.',
      'best_nights', 'Early weekday evenings are best for talking through the deep beer list with staff. Friday and Saturday bring more buzz without changing the place into a glossy club. Synth, folk and other small programme nights add character, so the sweetest choice is often the event that matches your music taste.',
      'crowd_mix', 'This is a local-heavy blend of craft-beer people, queer and alternative regulars, neighbours and a smaller stream of informed visitors. Reviews repeatedly call the crowd varied and easy to talk to. It is LGBTQ-friendly rather than exclusively queer, which is exactly why mixed friend groups settle in easily.',
      'dress_code', 'Wear the clothes you actually relax in: denim, band shirts, boots, trainers and weatherproof layers all make sense. The room leans pub, punk and retro rather than polished. No dress code or face control is reported; curiosity about beer will take you further than dressing for Avenyn.',
      'staff_inclusivity', 'The service consensus is unusually strong: knowledgeable, chatty and willing to guide people through unfamiliar beer, with repeated descriptions of guests feeling welcome alone or in mixed groups. The official LGBTQ listing and local reviews align; no current pattern of exclusion surfaced in this review pass.',
      'review_signal', 'Aggregated Google score 4.3/5 from 1,362 reviews and Tripadvisor 4.0/5 from 25; recent reviews consistently praise staff knowledge, relaxed atmosphere and a diverse crowd. Local recommendations regularly place it among Gothenburg’s best beer pubs.',
      'source_urls', to_jsonb(array[
        'https://www.haketpub.se/',
        'https://www.goteborg.com/en/guides/lgbtqi-gothenburg',
        'https://wanderlog.com/place/details/1412077/haket',
        'https://www.tripadvisor.se/Restaurant_Review-g189894-d5936487-Reviews-Haket_Bar-Gothenburg_Vastra_Gotaland_County_West_Coast.html',
        'https://www.reddit.com/r/Gothenburg/comments/1pnbyqm/first_time_visiting_g%C3%B6teborg/',
        'https://www.reddit.com/r/Gothenburg/comments/1duk086/chillalternativequeer_bars/'
      ]::text[]),
      'evidence_scope', 'official_hours_and_lgbtq_positioning_plus_large_current_beer_pub_review_consensus',
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Crippas Café', jsonb_build_object(
      'queue_wait', 'The room is small enough that popularity becomes visible quickly. Reviews mention busy early afternoons, full bookings and occasional live nights that draw a crowd. Walk-ins are easy when calm, but reserve or arrive near opening for a programme you care about rather than counting on a late table.',
      'best_nights', 'Use the live calendar as your compass: concerts, DJs, quizzes and stand-up are what turn a friendly vegan pub into a proper night. A quiet fika or early beer shows the living-room side; music nights bring the full punky Majorna character. Summer adds a tiny outdoor section rather than huge capacity.',
      'crowd_mix', 'Expect Majorna regulars, vegans, musicians, queer and alternative locals, dogs and curious visitors squeezed into one family-like room. The crowd is local-first and values the place as a neighbourhood hangout; tourists who like punk texture and plant-based food fold in without changing its centre of gravity.',
      'dress_code', 'Nothing here asks for polish. Band tees, patched jackets, practical rainwear, denim and trainers match the room, but ordinary casual clothes are equally fine. There is no door code; the only useful preparation is checking whether the evening is seated, amplified or already booked.',
      'staff_inclusivity', 'Most reviews describe kind, funny staff and a warm, inclusive atmosphere, including solo visitors. A 2025 review reported rude, unclear service during a pizza offer, and an older guest was served despite no seat being available. The honest read is caring and personal, but not perfectly consistent under pressure.',
      'review_signal', 'Google aggregate 4.6/5 from 601 reviews, Tripadvisor 4.8/5 from 13 and Thatsup 4.9/5 from 14; HappyCow’s 48 reviews are strongly positive on atmosphere and staff but include isolated recent service criticism and reports of peak crowding.',
      'source_urls', to_jsonb(array[
        'https://www.goteborg.com/en/places/crippas-cafe',
        'https://thatsup.se/goteborg/restaurang/crippas-cafe/',
        'https://www.tripadvisor.com/Restaurant_Review-g189894-d15672959-Reviews-Crippas_Cafe-Gothenburg_Vastra_Gotaland_County_West_Coast.html',
        'https://www.happycow.net/reviews/crippas-cafe-gothenburg-59543?page=1',
        'https://restaurantguru.com/Crippas-Cafe-Gothenburg',
        'https://www.reddit.com/r/Gothenburg/comments/1d2tn53/visiting_for_a_few_days_need_reccs/'
      ]::text[]),
      'evidence_scope', 'official_cultural_identity_plus_current_vegan_local_and_travel_review_consensus_with_service_caveat',
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Oceanen', jsonb_build_object(
      'queue_wait', 'Ordinary restaurant-bar visits do not carry a club-style queue. Ticketed concerts, stand-up and literary evenings are the moments when capacity matters, so buy ahead when offered and arrive before the listed start. The compact performance room can feel full even when the garden remains relaxed.',
      'best_nights', 'There is no single weekly winner: choose Oceanen by programme. The Queer Gaze, a boundary-pushing concert or a small performance delivers far more than turning up on a random night expecting a gay bar. For conversation and vegetarian food, arrive before the performance crowd takes over.',
      'crowd_mix', 'The centre of gravity is artsy and local: musicians, writers, Majorna neighbours, queer culture audiences and friends of the act. International visitors appear when a touring artist lands, but this does not feel engineered for tourists. Each programme changes the mix more than the day of the week.',
      'dress_code', 'Creative-casual is the natural language: denim, knitwear, trainers, vintage pieces and whatever survived Gothenburg rain. There is no known dress policy or face control. Wear shoes you can stand in and layers that work between the garden, restaurant and a warmer concert room.',
      'staff_inclusivity', 'Guest summaries lean friendly, relaxed and service-minded, while the venue repeatedly gives queer work a serious cultural platform rather than a token theme. That is a strong inclusion signal. Detailed queer-specific door reviews are limited, so the evidence supports warmth and programming, not perfection claims.',
      'review_signal', 'Current restaurant aggregates repeatedly surface friendly staff, cosy atmosphere and live music; local recommendations call the crowd mixed and artsy. The official city guide highlights the Queer Gaze programme. No robust queer-only service rating exists.',
      'source_urls', to_jsonb(array[
        'https://www.oceanen.com/',
        'https://www.oceanen.com/en/contact/',
        'https://www.goteborg.com/en/guides/lgbtqi-gothenburg',
        'https://restaurantguru.com/OCEANEN-Gothenburg',
        'https://www.postcard.inc/places/kulturhuset-oceanen-gothenburg?userId=google',
        'https://www.reddit.com/r/Gothenburg/comments/12em1tu/hello_my_husband_and_i_are_visiting_for_a_long/'
      ]::text[]),
      'evidence_scope', 'official_programme_and_queer_culture_role_plus_current_general_guest_atmosphere_consensus',
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Park Lane', jsonb_build_object(
      'queue_wait', 'This is the Göteborg venue where a line can be part of the night. Reviews describe one-hour waits and even a stalled VIP lane; other guests say queuing was maintained while the room looked quiet. For Club Queer, secure the current ticket or list and arrive early rather than gambling after midnight.',
      'best_nights', 'For a queer reason to go, choose a confirmed Club Queer edition, traditionally the last Friday of the month. Those nights bring the glitter, pop and community takeover; a normal Saturday is mainstream Avenyn nightlife and should not be sold as the same experience.',
      'crowd_mix', 'Club Queer pulls LGBTQ+ locals, allies and regional visitors into a large polished room. Outside that takeover, Park Lane attracts a mainstream, mixed-age Avenyn crowd. Do not infer the audience from the building alone: promoter and date determine whether the night feels queer, cabaret-led or conventional.',
      'dress_code', 'Club Queer rewards expressive partywear but does not publish one fixed costume. Park Lane’s general door is more appearance-conscious, and guests report inconsistent face control around casual or winter clothes. Bring ID, avoid sportswear if uncertain, and check that edition’s door and age rules before leaving.',
      'staff_inclusivity', 'The record needs candour: multiple guests allege racist or xenophobic treatment, arbitrary refusal and poor wardrobe handling at the general venue. Those reports are not proven to describe Club Queer’s own hosts, but the same building and door make them relevant. A queer brand cannot erase that warning.',
      'review_signal', 'General-venue reviews are sharply polarised: show diners praise performers and table service, while nightclub reviews repeatedly allege long queues, inconsistent entry and racial bias. Club Queer is officially recognised, but no separate current door-service rating was found.',
      'source_urls', to_jsonb(array[
        'https://www.parklane.se/park-lane-club',
        'https://www.goteborg.com/en/guides/lgbtqi-gothenburg',
        'https://www.tripadvisor.ie/Attraction_Review-g189894-d17442485-Reviews-Park_Lane-Gothenburg_Vastra_Gotaland_County_West_Coast.html',
        'https://www.top-rated.online/cities/Gothenburg/place/p/2634105/Park%2BLane',
        'https://thatsup.se/goteborg/nattklubb/park-lane/',
        'https://www.reddit.com/r/Gothenburg/comments/uvipvf/klubbrasism/'
      ]::text[]),
      'evidence_scope', 'official_recurring_club_queer_identity_plus_serious_repeated_general_venue_queue_and_discrimination_allegations',
      'research_status', 'editorial_review_consensus_with_material_door_risk',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Pustervik', jsonb_build_object(
      'queue_wait', 'A normal pre-ticketed concert is mostly a door-check rhythm, but high-demand club nights and Way Out West aftershows are different animals. Local 2026 accounts describe the room filling fast, midnight arrivals missing out and exceptional festival queues exceeding two hours. Follow the specific event, not an average.',
      'best_nights', 'Go for the artist or promoter, never merely because it is Friday. Pustervik can be an intimate concert hall, soul club or Pride afterparty on different dates. Arrive for doors when the act matters; the room’s scale makes a strong booking feel electric and a weak generic club night feel empty.',
      'crowd_mix', 'The audience follows the bill: Gothenburg music regulars, touring-band fans, students, older soul crowds or queer Pride audiences can each own a night. International visitors rise around festivals and touring acts, but the venue is fundamentally local cultural infrastructure rather than a permanent queer club.',
      'dress_code', 'There is no fashion door code in the programme evidence. Dress for a standing concert: comfortable shoes, layers for a room that can run hot and as little baggage as the current event permits. Sightlines can be affected by pillars and seating is limited, so clothes you can move in matter more than polish.',
      'staff_inclusivity', 'Many guests praise crowd control, bartenders and staff responding when the room overheats. That sits beside serious 2026 allegations of racist security and arbitrary sober-entry refusals. The consensus is therefore mixed: production can be attentive, but the door cannot be presented as uniformly inclusive.',
      'review_signal', 'Google aggregate reported at 4.3/5 from 2,232 reviews, with strong music and production praise. Tripadvisor contains recent negative security allegations, while current local festival discussion confirms extreme queues for exceptional aftershows.',
      'source_urls', to_jsonb(array[
        'https://pustervik.nu/',
        'https://wanderlog.com/place/details/1822089/pustervik',
        'https://www.tripadvisor.co.uk/Restaurant_Review-g189894-d1059036-Reviews-Pustervik-Gothenburg_Vastra_Gotaland_County_West_Coast.html',
        'https://www.reddit.com/r/Gothenburg/comments/1v6cbzf/question_about_pustervik_during_way_out_west/',
        'https://restaurantguru.com/Pustervik-Gothenburg'
      ]::text[]),
      'evidence_scope', 'official_event_led_identity_plus_large_review_consensus_and_current_exceptional_aftershow_queue_reports',
      'research_status', 'editorial_review_consensus_with_material_security_caveat',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Club Deluxe', jsonb_build_object(
      'queue_wait', 'Regular sessions need no membership or advance booking: pay 260 SEK at reception and re-entry is included. Special couple nights do require a prepaid ticket and cap attendance. The venue says Friday and Saturday are generally busier, but crowd levels vary and personal ads can create sudden peaks.',
      'best_nights', 'Pick the calendar, not just the weekend. Gay/Bi Night is normally the last Saturday of the month; Trans & Crossdress Night deliberately centres another community; Extended Nights are mixed and run later. Ordinary daytime entry is quieter, while Friday and Saturday offer the best chance of company.',
      'crowd_mix', 'The everyday club is deliberately mixed across genders, orientations, bodies, couples and solo guests. Gay/Bi and Trans & Crossdress editions shift the centre without excluding everyone else. This is an adult sex-positive room, so choose the audience description before assuming who will be there.',
      'dress_code', 'Regular entry has free dress, but clean clothes and good hygiene are explicit requirements. There is no alcohol, drugs, smoking, photography or filming. Special events may set their own audience or booking rules. Use the free lockers, bring a lock or rent one, and let consent—not costume—set the pace.',
      'staff_inclusivity', 'The policy is unusually direct: no discrimination by identity, sexuality, ethnicity or body, explicit consent, and staff help if something feels wrong. Independent feedback is thinner; one 2026 visitor criticised reception while another praised the facilities. Policy is strong, delivery less fully evidenced.',
      'review_signal', 'TravelGay audience score 3.9/5 from 26 votes with only two written reviews—one highly positive, one sharply negative about reception. Official rules and event descriptions provide far deeper evidence than the small independent review sample.',
      'source_urls', to_jsonb(array[
        'https://clubdeluxe.se/',
        'https://clubdeluxe.se/om-vara-event/',
        'https://clubdeluxe.se/swingers/',
        'https://sv.travelgay.com/venue/club-deluxe',
        'https://swingersnest.com/en/listings/club-deluxe'
      ]::text[]),
      'evidence_scope', 'detailed_current_official_rules_prices_and_event_audiences_plus_small_mixed_independent_review_sample',
      'research_status', 'officially_verified_with_limited_review_consensus',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Vuxenkul Backaplan', jsonb_build_object(
      'queue_wait', 'The retail counter is a normal walk-in shop, not a ticketed attraction, and no recurring entrance queue is documented. The cinema and booths sit behind the same adult-business context, but there is not enough current branch-specific review evidence to promise a crowd or wait at any particular hour.',
      'best_nights', 'Visit on a weekday if your priority is browsing products and asking questions without late-weekend energy. The branch stays open late, but no trustworthy source establishes when the cinema is busiest. Go when discretion and transport work for you rather than chasing an invented cruising peak.',
      'crowd_mix', 'Customers are adults across orientations and identities; neither the shop nor the cinema can responsibly be described as gay-only. The company presents a broad adult range. No reliable local-versus-tourist ratio or demographic breakdown exists, and anonymity makes that uncertainty appropriate.',
      'dress_code', 'Ordinary street clothes are right for the shop and there is no published fashion code. Keep the visit discreet if that feels better, bring valid ID if requested for adult areas and read onsite cinema or booth rules before entering. Do not assume retail opening means every facility follows identical access rules.',
      'staff_inclusivity', 'Company reviews lean positive on fast, discreet service and products, but are dominated by online orders rather than this cinema. Branch-specific reports are sparse, so treat the broad adult positioning as a business signal—not proven consensus about every in-person shift.',
      'review_signal', 'Trustpilot reports 3.8/5 from 537 company-wide reviews, 81% five-star and 6% one-star; most visible comments concern delivery, products and online support. That score must not be misrepresented as a rating of the Backaplan cinema or cruising experience.',
      'source_urls', to_jsonb(array[
        'https://vuxenkul.se/vuxenkul/',
        'https://vuxenkul.se/',
        'https://www.trustpilot.com/review/www.vuxenkul.se'
      ]::text[]),
      'evidence_scope', 'official_branch_facilities_and_hours_plus_company_wide_retail_reviews_without_branch_specific_cinema_consensus',
      'research_status', 'officially_verified_limited_branch_review_evidence',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('SLM Göteborg', jsonb_build_object(
      'queue_wait', 'The real wait happens before the night: membership must be applied for or renewed at least 24 hours before opening. Club evenings usually begin at 21:00 and the door closes at midnight, with membership card and dress check at entry. Do not arrive late hoping to negotiate either rule.',
      'best_nights', 'Choose the monthly theme that matches what you want to wear and do. A general all-codes night is easiest for a first visit; Sport, Nude or Sauna nights create a tighter shared mood. Pride and Nordic federation weekends bring more long-distance guests, while regular editions lean closer to the member base.',
      'crowd_mix', 'This is a volunteer-run association for men who like men and are interested in leather, BDSM or fetish: gay, bi and pan members form the core. Gothenburg regulars meet visitors carrying eligible SLM, ECMC or Top of Europe membership, especially during Pride and federation weekends.',
      'dress_code', 'The door enforces the announced code. Standard lanes include leather, rubber, uniform, sport, workwear, skin/punk, nude and jocks; themed nights may allow only one. The beginner minimum is plain black or white top, basic black or blue jeans and heavy black boots. No bare feet.',
      'staff_inclusivity', 'Membership requires respect for other members and rejects association with racist or neo-Nazi organisations; racist symbols and weapons are banned. The club is run by member volunteers, not hospitality staff. These are meaningful safeguards, but there is too little fresh independent review evidence to grade execution.',
      'review_signal', 'No robust current independent rating was found. The reliable evidence is first-party and unusually specific: member duties, anti-racist eligibility, entry authority, theme dress codes, door times and reciprocal Nordic-European club access.',
      'source_urls', to_jsonb(array[
        'https://slmgbg.nu/wordpress/sv/evenemang/',
        'https://slmgbg.nu/wordpress/sv/dresscode/',
        'https://slmgbg.nu/wordpress/sv/bli-medlem/',
        'https://slmgbg.nu/wordpress/sv/kontakt/',
        'https://slmgbg.nu/wordpress/en/about-us/'
      ]::text[]),
      'evidence_scope', 'detailed_current_membership_door_dress_and_anti_racist_rules_without_independent_service_consensus',
      'research_status', 'officially_verified_no_independent_rating',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Avalon Hotel', jsonb_build_object(
      'queue_wait', 'Check-in starts at 15:00 and requires photo ID plus a credit card; the booking card is required for non-refundable rates. Recent reviews generally describe quick, smiling help rather than a chronic reception queue. At summer and weekend peaks, luggage drop is still smarter than demanding an early room.',
      'best_nights', 'May through September unlocks the rooftop pool and terrace for hotel guests from 10:00 to 18:00. A weekend stay puts Bee and Gretas within an easy walk, but the central street can be noisy; ask for a quieter room if sleep matters more than being closest to the night.',
      'crowd_mix', 'Design-minded couples, leisure visitors, business guests and international city-break travellers share the hotel. Göteborg’s official LGBTQI guide marks it as inclusive and popular with queer travellers, but this is not an exclusively queer property and the pool is for all staying guests.',
      'dress_code', 'There is no hotel fashion code. Smart-casual fits the restaurant and terrace; everyday travel clothes are normal at reception. Bring swimwear for the seasonal rooftop, and keep the valid photo ID and payment card used for booking available. Guests under 20 can check in only with family.',
      'staff_inclusivity', 'The current consensus is notably warm: 2026 guests repeatedly describe friendly, professional staff and fast help from check-in to departure. The city’s LGBTQI guide adds a credible inclusion signal. No detailed trans-specific policy or substantial queer complaint pattern surfaced, so keep the claim grounded.',
      'review_signal', 'Tripadvisor and Booking.com carry large, strongly positive collections focused on location, breakfast and staff, with occasional service inconsistency and central noise noted. The official visitor guide independently identifies the hotel as LGBTQI-friendly.',
      'source_urls', to_jsonb(array[
        'https://www.avalonhotel.se/en/',
        'https://www.avalonhotel.se/en/faq/',
        'https://www.goteborg.com/en/guides/lgbtqi-gothenburg',
        'https://www.tripadvisor.com/Hotel_Review-g189894-d656551-Reviews-Avalon_Hotel-Gothenburg_Vastra_Gotaland_County_West_Coast.html',
        'https://www.booking.com/reviews/se/hotel/avalon.en-gb.html'
      ]::text[]),
      'evidence_scope', 'official_checkin_pool_and_city_lgbtq_signal_plus_current_large_hotel_review_consensus',
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Scandic Rubinen', jsonb_build_object(
      'queue_wait', 'Most stays describe ordinary reception flow, and luggage can be left before the room is ready. One detailed 2026 review found a very long, disorganised check-in queue in a crowded lobby, so build in time on major weekends rather than assuming instant access at the standard arrival rush.',
      'best_nights', 'Choose Rubinen when Avenyn, Park Lane and a walkable central weekend matter more than silence. The rooftop bar is the social bonus in season; ask the hotel for its live hours. If you are sensitive to nightlife noise or breakfast crowds, request a quieter room and use the calmer of the breakfast areas.',
      'crowd_mix', 'Families, business travellers, couples, city-break visitors and rooftop locals create a broader mix than a boutique hotel. The official LGBTQI guide describes an established welcoming reputation, yet the property is mainstream rather than a queer hotel. Pride weekends naturally shift the balance.',
      'dress_code', 'Reception and breakfast are completely casual; the rooftop suits relaxed smart-casual clothes without requiring a club look. Bring ID and booking details, and dress for the weather because the appeal is the terrace. Park Lane’s separate door policy does not become the hotel’s dress code.',
      'staff_inclusivity', 'Many recent guests praise helpful reception and exceptionally kind breakfast staff, including good allergen support. A smaller set reports stressed front-desk communication or rude late bar service. The LGBTQ-friendly city listing is meaningful, but the real service record is positive with visible inconsistencies.',
      'review_signal', 'Google aggregate reported at 4.0/5 from 3,189 reviews; Tripadvisor lists more than 2,100 and summarises friendly staff and breakfast alongside mixed cleanliness, noise and value. One current review documents a long check-in queue; another praises easy luggage drop.',
      'source_urls', to_jsonb(array[
        'https://www.scandichotels.com/en/hotels/scandic-rubinen',
        'https://www.goteborg.com/en/guides/lgbtqi-gothenburg',
        'https://www.tripadvisor.com/Hotel_Review-g189894-d229384-Reviews-Scandic_Rubinen-Gothenburg_Vastra_Gotaland_County_West_Coast.html',
        'https://wanderlog.com/place/details/1732783/scandic-rubinen',
        'https://www.scandichotels.com/contentassets/a2327cec7ae4488ca8da1e8c223669bf/accesibility-at-scandic_eng.pdf'
      ]::text[]),
      'evidence_scope', 'official_hotel_and_lgbtq_positioning_plus_large_current_review_consensus_with_peak_checkin_caveat',
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-10T00:00:00Z'
    ))
)
update public.places p
set
  venue_intel = coalesce(p.venue_intel, '{}'::jsonb) || r.patch,
  updated_at = timezone('utc', now())
from researched r
where lower(trim(p.city)) = 'gothenburg'
  and lower(trim(p.name)) = lower(trim(r.name));

with researched(name, patch) as (
  values
    ('Gothenburg Queer Lindy Festival 2026', jsonb_build_object(
      'entry_wait', 'Classes and party passes are registration-led and can sell out; a waiting list replaces a walk-up guarantee. Single-night tickets are sold online only if capacity remains, until 23:00. Build a 20-30 minute arrival buffer for registration and changing shoes rather than treating this like a bar queue.',
      'best_arrival', 'Friday is party-focused; classes run Saturday and Sunday. Arrive before your first listed session and early enough to settle at Forum, fill water and change into indoor shoes. If you only hold a party pass, use the final emailed schedule—not a guessed nightlife hour—to catch tasters and the social opening.',
      'crowd_mix', 'Queer lindy and blues dancers are the centre, from complete beginners to international teachers and experienced social dancers. Allies who support the festival’s purpose are welcome. Local West Coast Jitterbugs mix with travelling dancers, and the hosting scheme deliberately connects the two.',
      'dress_code', 'There is no glamour requirement. Bring sliding indoor dance shoes, a water bottle and a spare top; Forum has no changing rooms or showers. People dress for movement, sweat and self-expression. Alcohol is bring-your-own at parties, but the organisers explicitly ask guests not to get drunk.',
      'host_inclusivity', 'The structure is unusually explicit: de-gendered roles, a code of conduct, named organisers to approach if unsafe, solidarity pricing, volunteer discounts and a stated goal that queer people and people of colour feel wanted. Inclusion is operational, not just a rainbow headline.',
      'review_signal', 'Future 2026 edition; no attendee rating exists yet. Confidence comes from the sixth-edition programme, detailed practical guide, code of conduct, solidarity model and returning international teaching team rather than invented post-event reviews.',
      'source_urls', to_jsonb(array[
        'https://www.gbgqueerlindy.com/',
        'https://www.gbgqueerlindy.com/levels-and-registration/',
        'https://www.gbgqueerlindy.com/practical/',
        'https://www.gbgqueerlindy.com/code-of-conduct/',
        'https://www.gbgqueerlindy.com/volunteering/',
        'https://www.gbgqueerlindy.com/line-up/'
      ]::text[]),
      'evidence_scope', 'future_event_official_registration_practical_code_of_conduct_access_and_audience_material',
      'research_status', 'officially_verified_future_event',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Queer Wednesday: Farliga ord och fria röster', jsonb_build_object(
      'entry_wait', 'Capacity is limited and advance booking is the safest route. The museum releases reserved seats if the holder is not present five minutes before the programme; unbooked visitors may receive those places. This is a small cultural-event arrival, not an open-ended nightclub line.',
      'best_arrival', 'Aim for 17:40-17:45 for the 18:00 start. That leaves time to enter the museum, find the programme room and protect your reservation before the five-minute release point. The workshop and talk run to 19:30, so arrive ready to stay for the full sequence rather than dropping in late.',
      'crowd_mix', 'The subject draws queer community members, students, history and media readers, museum regulars and allies interested in censorship and liberation. It is likely local-heavy and Swedish-language in feel; there is no evidence for a tourist percentage, so do not market it as an international mixer.',
      'dress_code', 'No dress code is announced. Everyday museum clothes and a layer for October are enough; wear something comfortable for sitting, looking at an object and joining the creative workshop. Bring the booking confirmation and anything you personally like for notes, not a themed costume.',
      'host_inclusivity', 'The event puts queer press history and RFSL material at the centre, welcomes booked and standby visitors and is free for under-20s. Sign-language interpretation can be arranged when requested at least 14 days ahead. Contact the museum early for that support or other access needs.',
      'review_signal', 'Future one-off programme with no attendee rating. The intelligence is based on the museum’s exact booking, seat-release, price, interpretation and content information rather than a generic event fallback.',
      'source_urls', to_jsonb(array[
        'https://goteborgsstadsmuseum.se/aktivitet/queer-onsdag-farliga-ord-och-fria-roster/?date=202610071800',
        'https://goteborgsstadsmuseum.se/aktiviteter/digitala-foredrag/queer-onsdag/'
      ]::text[]),
      'evidence_scope', 'future_event_official_booking_capacity_arrival_interpretation_and_content_information',
      'research_status', 'officially_verified_future_event',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Queer Wednesday: Skriv queert', jsonb_build_object(
      'entry_wait', 'Places are limited, so book rather than relying on the standby release. A reserved place is given away if you are not present five minutes before 18:00, while unbooked guests may take released seats. The only sensible “queue strategy” is protecting the booking you already made.',
      'best_arrival', 'Be inside around 17:40-17:45 for the 18:00 workshop. You need enough time to find the room and arrive before the five-minute seat-release rule. The exercises continue to 19:30 and use the museum itself as material, so punctuality matters more here than at a lecture you can quietly enter late.',
      'crowd_mix', 'Regular writers and absolute beginners are both explicitly welcome, alongside queer literature readers, museum visitors and curious allies. Expect a participatory, mostly local cultural crowd rather than spectators. The format is built for people willing to write and reflect, not only listen.',
      'dress_code', 'No dress code applies. Wear comfortable indoor layers and bring a notebook or preferred writing tool if that helps, although the organiser provides the exercises. The useful preparation is emotional and practical: arrive open to sharing space, but you do not need to disclose personal experience.',
      'host_inclusivity', 'The workshop states that no previous experience is required and welcomes anyone curious about queer literature and writing. Under-20s enter free. Sign-language interpretation can be arranged with at least 14 days’ notice; contact the museum early rather than assuming same-day provision.',
      'review_signal', 'Future workshop with no attendee rating. Confidence rests on the named facilitator, explicit beginner welcome, exact capacity rules, booking system and interpretation process published by the museum.',
      'source_urls', to_jsonb(array[
        'https://goteborgsstadsmuseum.se/aktivitet/queer-onsdag-och-queer-text/?date=202611041800',
        'https://goteborgsstadsmuseum.se/aktiviteter/digitala-foredrag/queer-onsdag/'
      ]::text[]),
      'evidence_scope', 'future_workshop_official_booking_beginner_access_arrival_interpretation_and_participation_information',
      'research_status', 'officially_verified_future_event',
      'updated_at', '2026-08-10T00:00:00Z'
    )),
    ('Queer Wednesday: Vem var Kai Roger Idhem?', jsonb_build_object(
      'entry_wait', 'The talk has limited capacity and a bookable place. Reserved seats are released five minutes before the start if the holder has not arrived, and standby guests may take them. Do not read that as a predictable long queue: book first, then arrive in time to keep the seat.',
      'best_arrival', 'Plan to reach the museum by 17:40-17:45 for the 18:00 start. That gives a calm route through the building and protects the reservation before the release point. The talk ends at 19:00, so a punctual arrival preserves a compact one-hour programme without missing its historical setup.',
      'crowd_mix', 'The life-history focus should bring trans and wider queer community members, genealogists, museum regulars, students and allies interested in how gender is recorded. It is a seated local cultural event, not a social party; no evidence supports a claimed local-tourist ratio.',
      'dress_code', 'There is no dress requirement. Dress for a seated December museum hour and the journey home. A booking confirmation and a quiet phone are more relevant than appearance. The subject is personal and historical, so bring curiosity without assuming any attendee owes the room their own identity story.',
      'host_inclusivity', 'The event treats historical trans life as serious research rather than novelty, is free for under-20s and offers a route to request sign-language interpretation at least 14 days ahead. The practical page also provides direct booking contacts, giving visitors a real way to flag access needs.',
      'review_signal', 'Future lecture with no attendee rating. The assessment uses the museum’s named speaker, precise historical focus, limited-place policy, under-20 access and interpreter-request process; no artificial crowd or satisfaction score has been added.',
      'source_urls', to_jsonb(array[
        'https://goteborgsstadsmuseum.se/aktivitet/queer-onsdag-vem-var-kai-roger-idhem/',
        'https://goteborgsstadsmuseum.se/aktiviteter/digitala-foredrag/queer-onsdag/'
      ]::text[]),
      'evidence_scope', 'future_lecture_official_booking_arrival_content_price_and_interpretation_information',
      'research_status', 'officially_verified_future_event',
      'updated_at', '2026-08-10T00:00:00Z'
    ))
)
update public.events e
set
  event_intel = coalesce(e.event_intel, '{}'::jsonb) || r.patch,
  updated_at = timezone('utc', now())
from researched r
where lower(trim(e.city)) = 'gothenburg'
  and lower(trim(e.name)) = lower(trim(r.name));

commit;

select 'places_with_complete_intel' as check_name, count(*)::bigint as result
from public.places
where lower(trim(city)) = 'gothenburg'
  and coalesce(venue_intel->>'queue_wait', '') <> ''
  and coalesce(venue_intel->>'best_nights', '') <> ''
  and coalesce(venue_intel->>'crowd_mix', '') <> ''
  and coalesce(venue_intel->>'dress_code', '') <> ''
  and coalesce(venue_intel->>'staff_inclusivity', '') <> ''
union all
select 'events_with_complete_intel', count(*)::bigint
from public.events
where lower(trim(city)) = 'gothenburg'
  and coalesce(event_intel->>'entry_wait', '') <> ''
  and coalesce(event_intel->>'best_arrival', '') <> ''
  and coalesce(event_intel->>'crowd_mix', '') <> ''
  and coalesce(event_intel->>'dress_code', '') <> ''
  and coalesce(event_intel->>'host_inclusivity', '') <> ''
order by check_name;
