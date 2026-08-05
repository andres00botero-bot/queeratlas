-- Queer Atlas venue intelligence: global review-led editorial pass, batch 18.
-- Amsterdam queer heritage, community nightlife, event venues and fetish clubs.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (1927::bigint, jsonb_build_object(
      'queue_wait', 'The room is tiny, not exclusive. A quiet late afternoon can mean a choice of tables; weekend singalongs and Pride dates can fill every corner quickly. If it looks packed, ask before giving up—the bar''s scale makes five arrivals look like a rush, and turnover is usually informal.',
      'best_nights', 'Saturday brings the liveliest mix of old songs, dancing and spontaneous camp; an earlier weekday visit leaves space to study the wild ceiling and hear the stories. Come for a living piece of queer Amsterdam, not a polished club schedule. The mood matters more than the clock.',
      'crowd_mix', 'Long-time Amsterdam regulars share the bar with queer pilgrims, curious tourists, lesbians, gay men and straight neighbours. The crowd is genuinely mixed, just as its openly lesbian founder intended. Earlier hours skew sightseeing; later drinks feel more like a local pub with global guests.',
      'dress_code', 'There is no door look. Denim, leather, tourist layers and Saturday sparkle all fit beneath the ties, shoes and old souvenirs. Historically, neckties sometimes became part of the decor; today the practical advice is simply to dress for a warm, crowded brown café and arrive with a sense of humour.',
      'staff_inclusivity', 'Recent visitors repeatedly describe kind staff, good stories and an atmosphere where a soft drink is as welcome as a beer. The sale of the business created understandable concern, yet the bar remains active and its queer heritage is still the point. Warmth here feels personal, not corporate.',
      'venue_classification', 'historic_inclusive_lgbtq_brown_cafe',
      'source_urls', to_jsonb(array[
        'https://www.cafetmandje.amsterdam/',
        'https://www.cafetmandje.amsterdam/geschiedenis/',
        'https://www.gayout.com/europe/netherlands/amsterdam/bars/cafe-t-mandje-amsterdam',
        'https://restaurantguru.com/Cafe-t-Mandje-Amsterdam',
        'https://www.amsterdamredlightdistricttour.com/entertainment/cafe-t-mandje/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_review_and_capacity_consensus','source_urls',to_jsonb(array['https://www.gayout.com/europe/netherlands/amsterdam/bars/cafe-t-mandje-amsterdam','https://restaurantguru.com/Cafe-t-Mandje-Amsterdam','https://www.cafetmandje.amsterdam/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','history_and_current_review_summary','source_urls',to_jsonb(array['https://www.cafetmandje.amsterdam/geschiedenis/','https://www.gayout.com/europe/netherlands/amsterdam/bars/cafe-t-mandje-amsterdam','https://restaurantguru.com/Cafe-t-Mandje-Amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_history_and_review_consensus','source_urls',to_jsonb(array['https://www.cafetmandje.amsterdam/geschiedenis/','https://www.amsterdamredlightdistricttour.com/entertainment/cafe-t-mandje/','https://www.gayout.com/europe/netherlands/amsterdam/bars/cafe-t-mandje-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','heritage_and_practical_guidance','source_urls',to_jsonb(array['https://www.cafetmandje.amsterdam/geschiedenis/','https://restaurantguru.com/Cafe-t-Mandje-Amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','current_review_consensus_with_ownership_context','source_urls',to_jsonb(array['https://www.cafetmandje.amsterdam/','https://www.gayout.com/europe/netherlands/amsterdam/bars/cafe-t-mandje-amsterdam','https://restaurantguru.com/Cafe-t-Mandje-Amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1931::bigint, jsonb_build_object(
      'queue_wait', 'This cosy brown café can go from calm at 6 pm to shoulder-to-shoulder around 9 or 10. There is seldom a formal line on an ordinary night, but Pride and special events may create one. Arrive early for a table or the pool cue; later, expect to make friends by sharing space.',
      'best_nights', 'Friday and Saturday give the fullest lesbian-and-queer pub energy, while Wednesday or Thursday suit a first drink, pool and actual conversation. Screenings, open mics and singalongs change the texture, so check the current programme. This is community time, not a 2 am spectacle.',
      'crowd_mix', 'Queer women and FLINTA guests remain the heart of the room, joined by non-binary people, trans guests, gay men and respectful friends. Recent nights show a wide age range and a real local base, with visitors folding in easily. It is inclusive without erasing its lesbian history.',
      'dress_code', 'No polish required: jeans, workday layers, boots, soft masc looks, femme colour and whatever feels like home all belong. The brown-café setting rewards comfort over performance. Dress for pool, a close table and possibly a chilly pavement seat rather than a nightclub door check.',
      'staff_inclusivity', 'Fresh accounts praise casual, caring bartenders who chat, remember the room and make queer couples feel immediately at ease. Published rules reject racism, sexism, transphobia, queer hate and harassment. A few door complaints exist around peak events, but the current community signal is unusually warm.',
      'venue_classification', 'lesbian_rooted_inclusive_queer_brown_cafe',
      'source_urls', to_jsonb(array[
        'https://cafesaarein.nl/',
        'https://cafesaarein.nl/huisregels/',
        'https://wanderlog.com/place/details/912223/saarein',
        'https://menukaart.menu/restaurants/amsterdam-2/saarein/reviews',
        'https://www.thegayagenda.fyi/amsterdam/businesses/cafe-saarein/',
        'https://www.iamsterdam.com/en/see-and-do/restaurant-and-bars/lgbtqi-bars-and-cafes-in-amsterdam'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_review_and_event_consensus','source_urls',to_jsonb(array['https://cafesaarein.nl/','https://wanderlog.com/place/details/912223/saarein','https://www.thegayagenda.fyi/amsterdam/businesses/cafe-saarein/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_schedule_and_review_summary','source_urls',to_jsonb(array['https://cafesaarein.nl/','https://wanderlog.com/place/details/912223/saarein','https://www.thegayagenda.fyi/amsterdam/businesses/cafe-saarein/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','community_and_review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/912223/saarein','https://menukaart.menu/restaurants/amsterdam-2/saarein/reviews','https://www.iamsterdam.com/en/see-and-do/restaurant-and-bars/lgbtqi-bars-and-cafes-in-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/912223/saarein','https://www.thegayagenda.fyi/amsterdam/businesses/cafe-saarein/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_rules_and_strong_review_consensus','source_urls',to_jsonb(array['https://cafesaarein.nl/huisregels/','https://wanderlog.com/place/details/912223/saarein','https://menukaart.menu/restaurants/amsterdam-2/saarein/reviews']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (164::bigint, jsonb_build_object(
      'queue_wait', 'The line follows the party. Pride and popular underwear nights can mean a serious wait, while a midweek fetish session may be straight in. Arrive near opening for a must-do event, budget for the advertised cover and use the coat check; each night has its own entry rules.',
      'best_nights', 'Thursday pairs a wonderfully queer dance crowd with late drag; Friday and the first-Saturday underwear editions are busier, sexier and more cruise-led. Wednesday is niche and can be quieter. Read the calendar before choosing—here the event name changes the audience, clothes and entire social contract.',
      'crowd_mix', 'Gay and bi men dominate the men-only parties, including trans men where the policy says men. Other editions explicitly welcome all genders and sexualities. Ages and bodies mix more broadly than a circuit poster suggests, but never assume tonight''s access from another night''s reputation.',
      'dress_code', 'Some nights say come as you are; others require underwear, nudity, rubber or a real fetish ensemble and will reject streetwear. Follow the exact event brief. In the cruise areas, less clothing never means less consent. Coat check is usually part of the experience, not an optional afterthought.',
      'staff_inclusivity', 'Most guests praise a sex-positive team and unusually relaxed room; recent reports also describe stressed cloak staff, weak cabin boundaries and one severe security incident. The venue can feel liberating, but it is not beyond criticism. Tell staff early if touch, a lock or door interaction feels unsafe.',
      'venue_classification', 'sex_positive_queer_fetish_and_cruise_club_with_event_specific_access',
      'source_urls', to_jsonb(array[
        'https://www.clubchurch.nl/',
        'https://www.clubchurch.nl/parties/prideParty',
        'https://www.clubchurch.nl/parties/biZonderbroek',
        'https://www.clubchurch.nl/parties/zonderbroekExtra',
        'https://wanderlog.com/place/details/516575/club-church',
        'https://www.reddit.com/r/askgaybros/comments/1rkship/club_church_amsterdam_on_a_wednesday/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','event_specific_review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/516575/club-church','https://www.clubchurch.nl/parties/prideParty','https://www.reddit.com/r/askgaybros/comments/1rkship/club_church_amsterdam_on_a_wednesday/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_programme_and_review_consensus','source_urls',to_jsonb(array['https://www.clubchurch.nl/','https://www.clubchurch.nl/parties/biZonderbroek','https://wanderlog.com/place/details/516575/club-church']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','event_specific_access_policy','source_urls',to_jsonb(array['https://www.clubchurch.nl/parties/prideParty','https://www.clubchurch.nl/parties/biZonderbroek','https://www.clubchurch.nl/parties/zonderbroekExtra']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_event_rules','source_urls',to_jsonb(array['https://www.clubchurch.nl/parties/prideParty','https://www.clubchurch.nl/parties/biZonderbroek','https://www.clubchurch.nl/parties/zonderbroekExtra']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','mixed_current_review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/516575/club-church','https://whereis.gay/club-church','https://www.reddit.com/r/askgaybros/comments/1rkship/club_church_amsterdam_on_a_wednesday/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (172::bigint, jsonb_build_object(
      'queue_wait', 'This is an event hall, so entry depends on the promoter, ticket tier and last-entry rule. Some nights protect priority admission only until 1 am; likely sell-outs reward advance booking. Reports of awkward logistics recur, so arrive early, carry photo ID and read the organiser''s terms.',
      'best_nights', 'There is no universal best Saturday. Choose the event: queer bear and circuit takeovers can be excellent, while other dates run house, R&B, reggaeton, nostalgia or concerts for a mainstream crowd. The calendar—not the building—tells you whether the night belongs in your queer itinerary.',
      'crowd_mix', 'On queer takeovers, expect international gay men, bears or a polished circuit crowd shaped by the promoter. On ordinary dates, the audience may be largely straight and music-led. Locals and visitors both come, but the ratio and sense of safety can flip completely from one booking to the next.',
      'dress_code', 'Follow the event page. A bear party might welcome harnesses and rugby shorts; a glossy circuit edition rewards expressive clubwear; a mainstream house night may ask guests to dress sharp. The venue has no single queer uniform, and an outfit that fits Friday may miss Saturday''s brief.',
      'staff_inclusivity', 'Queer promoters can create a celebratory room here, but the building is not a permanent queer safe space. General reviews are mixed on logistics, value and security, with some praising visible staff. Judge inclusion by the organiser''s policy and awareness plan, then keep normal big-event boundaries.',
      'venue_classification', 'mainstream_event_venue_with_recurring_lgbtq_party_takeovers',
      'source_urls', to_jsonb(array[
        'https://panama.nl/',
        'https://panama.nl/events/',
        'https://www.iamsterdam.com/en/whats-on/clubbing-and-nightlife/lgbtqi-clubbing-and-nightlife-in-amsterdam',
        'https://www.iamsterdam.com/en/whats-on/calendar/nightlife/clubbing/xlsior-mykonos-amsterdam-edition',
        'https://wanderlog.com/place/details/757070/panama',
        'https://www.reddit.com/r/amsterdam_rave/comments/1ruqjz5/hows_panamas_vibe_is_it_safe_to_party_solo_as_a/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','event_terms_and_review_consensus','source_urls',to_jsonb(array['https://panama.nl/events/','https://panama.nl/event/old-school-vibes-4/','https://wanderlog.com/place/details/757070/panama']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','programme_based_classification','source_urls',to_jsonb(array['https://panama.nl/events/','https://www.iamsterdam.com/en/whats-on/clubbing-and-nightlife/lgbtqi-clubbing-and-nightlife-in-amsterdam','https://www.iamsterdam.com/en/whats-on/calendar/nightlife/clubbing/xlsior-mykonos-amsterdam-edition']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','event_specific_crowd_summary','source_urls',to_jsonb(array['https://panama.nl/events/','https://www.iamsterdam.com/en/whats-on/calendar/nightlife/clubbing/xlsior-mykonos-amsterdam-edition','https://www.reddit.com/r/amsterdam_rave/comments/1ruqjz5/hows_panamas_vibe_is_it_safe_to_party_solo_as_a/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','event_specific_guidance','source_urls',to_jsonb(array['https://www.iamsterdam.com/en/whats-on/clubbing-and-nightlife/lgbtqi-clubbing-and-nightlife-in-amsterdam','https://panama.nl/event/house-of-silk-2/','https://panama.nl/events/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','mixed_venue_reviews_and_promoter_dependency','source_urls',to_jsonb(array['https://wanderlog.com/place/details/757070/panama','https://www.reddit.com/r/amsterdam_rave/comments/1ruqjz5/hows_panamas_vibe_is_it_safe_to_party_solo_as_a/','https://panama.nl/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (853::bigint, jsonb_build_object(
      'queue_wait', 'This is a small lounge, not a club door. Seats can disappear when the street is busy, but regulars say people often shuffle over rather than form a formal line. It opens daily from morning to midnight. Bring valid ID and expect the house to prioritise customers buying from its regulated menu.',
      'best_nights', 'Late morning or afternoon shows off the light, old-school living-room feel; early evening works as a mellow pause before the surrounding bars. It is not a nightlife event and has no queer theme night to chase. Visit when conversation, music and the resident cat sound better than a dance floor.',
      'crowd_mix', 'Locals, repeat cannabis enthusiasts, LGBTQ+ visitors from the surrounding district and mainstream tourists share the compact room. Its gay-friendly history and address matter, but it is not a queer-only social club. Gender mix appears broad, with the product and relaxed setting as the common ground.',
      'dress_code', 'Whatever you wore for the city is fine. Comfortable layers suit the window seats and lingering pace; there is no door aesthetic. The real etiquette is behavioural: keep the room calm, respect staff instructions, do not treat the cat as a prop and never pressure anyone to consume.',
      'staff_inclusivity', 'Many current guests praise an old-school welcome, friendly conversation, fair guidance and the cat-assisted charm. A smaller but clear group reports curt treatment, especially when trying to buy only a drink or use outside products. Queer-friendly is credible; uniformly gentle service is not guaranteed.',
      'venue_classification', 'gay_friendly_mainstream_coffeeshop_in_lgbtq_nightlife_district',
      'source_urls', to_jsonb(array[
        'https://theotherside.nl/',
        'https://dutchcoffeeshops.com/in/amsterdam/coffeeshop-the-otherside',
        'https://qlist.app/venues/Amsterdam/Coffeeshop-The-Otherside/bmtlS05zalB1ZlBiT1BHc3d3NllFZw',
        'https://restaurantguru.com/The-Other-Club-Amsterdam',
        'https://www.reddit.com/r/AmsterdamEnts/comments/1tgjxij/what_coffeeshops_am_i_missing/',
        'https://www.reddit.com/r/AmsterdamEnts/comments/1upqfcg/high_everyone/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_service_model_and_review_consensus','source_urls',to_jsonb(array['https://theotherside.nl/','https://dutchcoffeeshops.com/in/amsterdam/coffeeshop-the-otherside','https://qlist.app/venues/Amsterdam/Coffeeshop-The-Otherside/bmtlS05zalB1ZlBiT1BHc3d3NllFZw']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','classification_and_community_summary','source_urls',to_jsonb(array['https://theotherside.nl/','https://restaurantguru.com/The-Other-Club-Amsterdam','https://www.reddit.com/r/AmsterdamEnts/comments/1tgjxij/what_coffeeshops_am_i_missing/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_and_community_consensus','source_urls',to_jsonb(array['https://theotherside.nl/','https://qlist.app/venues/Amsterdam/Coffeeshop-The-Otherside/bmtlS05zalB1ZlBiT1BHc3d3NllFZw','https://dutchcoffeeshops.com/in/amsterdam/coffeeshop-the-otherside']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_etiquette','source_urls',to_jsonb(array['https://theotherside.nl/','https://restaurantguru.com/The-Other-Club-Amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','mixed_current_review_consensus','source_urls',to_jsonb(array['https://dutchcoffeeshops.com/in/amsterdam/coffeeshop-the-otherside','https://restaurantguru.com/The-Other-Club-Amsterdam','https://www.reddit.com/r/AmsterdamEnts/comments/1upqfcg/high_everyone/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (168::bigint, jsonb_build_object(
      'queue_wait', 'Sunday''s basement party is famous for its queue, and there is no VIP trick that changes the collective logic. Go before the 10 pm opening if getting in matters, with a physical bank card or cash ready. Your phone must be switched fully off at the door, so save practical details beforehand.',
      'best_nights', 'There is only one regular night: Sunday, 10 pm to 3 am. The weekly DJs and occasional themes change, but the no-phone, volunteer-run intimacy is the constant. The first Sunday of the month avoids strobe and flash effects, making it the considered choice for photosensitive guests.',
      'crowd_mix', 'This is a locally rooted queer room with dykes, trans people, fags and everyone between explicitly named in its safety language. Tourists do get in, but the culture is not built around them. Expect a mix of generations, politics, flirtation and friends who value participation over consumption.',
      'dress_code', 'Most Sundays are expressive and unfussy; a theme may add its own brief, so read the weekly notice. The non-negotiable accessory is an off phone—no photos, video or scrolling. Leave expensive coats and bags at home because the basement has hooks, not a guarded wardrobe.',
      'staff_inclusivity', 'Every shift is volunteer-run and all net profit funds small LGBTQIA+ projects. Reviews celebrate the warm, affordable, genuinely communal room. Volunteers will also enforce the phone and safety rules directly. Inclusion here is active and political, not customer-service theatre.',
      'venue_classification', 'volunteer_run_noncommercial_queer_sunday_club_and_fundraiser',
      'duplicate_record_group', 'de_trut_amsterdam',
      'source_urls', to_jsonb(array[
        'https://www.trutfonds.nl/en/index.html',
        'https://www.trutfonds.nl/en/party/index.html',
        'https://www.corner.inc/place/p8atVfPRPdLR',
        'https://wanderlog.com/place/details/912226/vereniging-de-trut',
        'https://dedocupdate.com/2026/07/09/de-trut/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_rules_and_current_review_consensus','source_urls',to_jsonb(array['https://www.trutfonds.nl/en/party/index.html','https://www.corner.inc/place/p8atVfPRPdLR','https://wanderlog.com/place/details/912226/vereniging-de-trut']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','official_schedule_and_accessibility_guidance','source_urls',to_jsonb(array['https://www.trutfonds.nl/en/party/index.html','https://www.trutfonds.nl/en/index.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_community_identity','source_urls',to_jsonb(array['https://www.trutfonds.nl/en/index.html','https://www.trutfonds.nl/en/party/index.html','https://dedocupdate.com/2026/07/09/de-trut/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','official_house_rules','source_urls',to_jsonb(array['https://www.trutfonds.nl/en/party/index.html','https://wanderlog.com/place/details/912226/vereniging-de-trut']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','official_structure_and_strong_review_consensus','source_urls',to_jsonb(array['https://www.trutfonds.nl/en/index.html','https://www.trutfonds.nl/en/party/index.html','https://wanderlog.com/place/details/912226/vereniging-de-trut']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1121::bigint, jsonb_build_object(
      'queue_wait', 'Treat the pavement wait as part of Sunday rather than a service failure: the small basement protects its scale and does not sell fast-track status. Earlier is kinder. Have cash or a physical card, because phone payments are impossible once volunteers watch you power the device completely down.',
      'best_nights', 'The ritual happens every Sunday from 22:00 to 03:00; choose by the posted DJs or theme. For a lower-sensory version, the first Sunday each month has no strobe or flash. This is the night for cheap drinks, human conversation and dancing without an audience in your pocket.',
      'crowd_mix', 'Amsterdam queer regulars give the party its backbone, with trans, lesbian, gay, bi, non-binary and politically engaged guests sharing the floor. Visitors are welcome when they respect the culture. The crowd feels less like a tourist sample and more like a weekly community assembly with better music.',
      'dress_code', 'Wear something you can dance in and check the weekly post for rare theme instructions. Cameras and active phones are the true fashion violation. There is no secure coat check, only unguarded hooks, so bring little, keep valuables on you and skip the beloved jacket you cannot afford to lose.',
      'staff_inclusivity', 'The people at the door, decks and bar are volunteers, not a commercial hospitality crew, and the proceeds travel back into queer projects. Guests value the safety, prices and absence of filming. Expect firm rule-setting alongside warmth: protecting the room matters more than flattering the customer.',
      'venue_classification', 'volunteer_run_noncommercial_queer_sunday_club_and_fundraiser',
      'duplicate_record_group', 'de_trut_amsterdam',
      'source_urls', to_jsonb(array[
        'https://www.trutfonds.nl/en/index.html',
        'https://www.trutfonds.nl/en/party/index.html',
        'https://www.corner.inc/place/p8atVfPRPdLR',
        'https://wanderlog.com/place/details/912226/vereniging-de-trut',
        'https://dedocupdate.com/2026/07/09/de-trut/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_rules_and_current_review_consensus','source_urls',to_jsonb(array['https://www.trutfonds.nl/en/party/index.html','https://www.corner.inc/place/p8atVfPRPdLR','https://wanderlog.com/place/details/912226/vereniging-de-trut']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','official_schedule_and_accessibility_guidance','source_urls',to_jsonb(array['https://www.trutfonds.nl/en/party/index.html','https://www.trutfonds.nl/en/index.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_community_identity','source_urls',to_jsonb(array['https://www.trutfonds.nl/en/index.html','https://www.trutfonds.nl/en/party/index.html','https://dedocupdate.com/2026/07/09/de-trut/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','official_house_rules','source_urls',to_jsonb(array['https://www.trutfonds.nl/en/party/index.html','https://wanderlog.com/place/details/912226/vereniging-de-trut']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','official_structure_and_strong_review_consensus','source_urls',to_jsonb(array['https://www.trutfonds.nl/en/index.html','https://www.trutfonds.nl/en/party/index.html','https://wanderlog.com/place/details/912226/vereniging-de-trut']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1930::bigint, jsonb_build_object(
      'queue_wait', 'Regular Thursday-to-Sunday nights have no cover, so delays are usually coat check and a busy doorway rather than ticket scanning. Special events may charge, sell out or be door-only; arrive early for those. Bags must be checked, suitcases cannot be stored and there are no lockers.',
      'best_nights', 'Friday and Saturday bring live DJs, more dancing and the fullest late-night cruise energy. Thursday is a softer entry; Sunday varies with bear, pup and other community events. Always read the programme: a daytime BDSM edition and a normal 10 pm opening are completely different propositions.',
      'crowd_mix', 'Regular hours are for men, explicitly including trans men and non-binary people who identify as men. Gay and bi tourists mix with leather, bear, pup and fetish regulars; other programmed events may be all-gender or women-only. The published access rule belongs to the date, not the brand name.',
      'dress_code', 'Ordinary nights have no required fetish look: street clothes, leather, underwear, jocks and nudity all work. Shoes or boots stay on everywhere; flip-flops do not count. Themed events can be strict, so read every yes-and-no list. Dressing down can earn free coat check, never automatic consent.',
      'staff_inclusivity', 'The written trans and non-binary inclusion policy is unusually precise, and guarded coat check adds practical care. Reviews praise the maze and freedom but are mixed on individual bartenders, including a fresh complaint about being policed for noise. Clear rules are a strength; service can still vary by shift.',
      'venue_classification', 'men_focused_gay_fetish_cruise_club_with_event_specific_inclusion',
      'source_urls', to_jsonb(array[
        'https://www.eagleamsterdam.com/',
        'https://wanderlog.com/place/details/912236/eagle-amsterdam',
        'https://amsterdam.gaycities.com/bars/1628-eagle-amsterdam',
        'https://www.gaytravel4u.com/event/eagle-amsterdam-events/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','explicit_official_entry_and_storage_rules','source_urls',to_jsonb(array['https://www.eagleamsterdam.com/','https://wanderlog.com/place/details/912236/eagle-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','official_schedule_and_event_summary','source_urls',to_jsonb(array['https://www.eagleamsterdam.com/','https://www.gaytravel4u.com/event/eagle-amsterdam-events/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','explicit_official_access_policy','source_urls',to_jsonb(array['https://www.eagleamsterdam.com/','https://amsterdam.gaycities.com/bars/1628-eagle-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_official_safety_and_event_rules','source_urls',to_jsonb(array['https://www.eagleamsterdam.com/','https://www.gaytravel4u.com/event/eagle-amsterdam-events/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_policy_with_mixed_current_reviews','source_urls',to_jsonb(array['https://www.eagleamsterdam.com/','https://wanderlog.com/place/details/912236/eagle-amsterdam','https://amsterdam.gaycities.com/bars/1628-eagle-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (1927, 1931, 164, 172, 853, 168, 1121, 1930)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
