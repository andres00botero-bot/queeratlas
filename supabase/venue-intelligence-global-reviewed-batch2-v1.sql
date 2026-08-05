-- Queer Atlas venue intelligence: global review-led editorial pass, batch 2.
-- San Francisco, Barcelona, Torremolinos, Copenhagen, Paris, Warsaw,
-- Lisbon, Glasgow and Athens.
-- Checked 2026-08-05. Reader copy synthesises recurring review themes;
-- source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (556::bigint, jsonb_build_object(
      'queue_wait', 'A sold-out show can turn arrival into part of the performance. For cabaret, doors open an hour ahead and seats within each section are first-come; for club nights, arriving at doors is the calmest way to beat the late rush.',
      'best_nights', 'Saturday is the signature move: Princess folds a weekly drag spectacular into a disco-pop dance party. Second Saturdays add Reparations, an all-Black drag and dance celebration; quieter cabaret dates suit people who want the stage without the club crush.',
      'crowd_mix', 'San Francisco drag regulars, queer nightlife loyalists and curious visitors meet across genders and generations. The crowd shifts with the production: cabaret feels theatre-led, while weekend dance parties pull a louder, later and more celebratory room.',
      'dress_code', 'There is no formal fashion test. Camp, colour, clubwear and an understated night-out look all work; the practical requirements are valid 21+ ID and an outfit that can handle standing room when the dance floor opens.',
      'staff_inclusivity', 'The house policy is unusually explicit: no bigotry, accessible seating, service animals and help for guests who need accommodations. Earlier reviews often describe a warm welcome; the rebuilt venue is new enough that its post-reopening service record is still forming.',
      'source_urls', to_jsonb(array[
        'https://www.sfoasis.com/',
        'https://www.sfoasis.com/venue-info-1',
        'https://www.sfoasis.com/princess',
        'https://www.sfoasis.com/reparations',
        'https://wanderlog.com/place/details/421463/oasis',
        'https://sfstandard.com/2026/07/17/oasis-drag-cabaret-returns-sf/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.sfoasis.com/venue-info-1','https://sfstandard.com/2026/07/17/oasis-drag-cabaret-returns-sf/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.sfoasis.com/princess','https://www.sfoasis.com/reparations']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.sfoasis.com/','https://wanderlog.com/place/details/421463/oasis']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.sfoasis.com/venue-info-1','https://www.sfoasis.com/princess']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.sfoasis.com/venue-info-1','https://wanderlog.com/place/details/421463/oasis']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (107::bigint, jsonb_build_object(
      'queue_wait', 'This is a compact room with genuine peak-night friction: reviews describe a long entrance line, an overfilled floor and toilet waits around twenty minutes. Going close to opening is the best defence against spending the night in queues.',
      'best_nights', 'Friday and Saturday deliver the fullest pop-club version, while the current calendar rotates drag, striptease and themed sessions across the week. Pick the event by music first—pop, house, remixes and urban sets can change the room completely.',
      'crowd_mix', 'The centre is LGBTQI+ and gay-led, with Barcelona regulars, international weekenders and mixed queer groups. Some nights lean more male and mature than the branding suggests, but the overall atmosphere is broader than a men-only club.',
      'dress_code', 'Dress for a hot, busy pop floor: light clubwear, trainers and something you can actually dance in. Event themes invite extra colour, but there is no published fashion code beyond bringing official ID and arriving ready for the night.',
      'staff_inclusivity', 'Inside, guests praise individual bartenders and the inclusive dance-floor mood. Door and security feedback is rougher, with reports of brusque treatment and poor crowd management; the welcome may depend too much on which interaction you get.',
      'source_urls', to_jsonb(array[
        'https://grupoarena.com/',
        'https://tickets.grupoarena.com/en/',
        'https://wanderlog.com/place/details/1782496/arena-madre',
        'https://www.salir.com/arena-sala-madre-barcelona-neg-1176.html',
        'https://barcelona.gaycities.com/bars/1554-arena-madre'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1782496/arena-madre','https://www.salir.com/arena-sala-madre-barcelona-neg-1176.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://grupoarena.com/','https://tickets.grupoarena.com/en/','https://barcelona.gaycities.com/bars/1554-arena-madre']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://grupoarena.com/','https://wanderlog.com/place/details/1782496/arena-madre']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://tickets.grupoarena.com/en/','https://wanderlog.com/place/details/1782496/arena-madre']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1782496/arena-madre','https://www.salir.com/arena-sala-madre-barcelona-neg-1176.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (347::bigint, jsonb_build_object(
      'queue_wait', 'Think popular beachfront table, not nightclub rope. The pressure comes around sunset and dinner when the terrace fills for sea views and people-watching; book or arrive before golden hour if the front-row promenade seat matters.',
      'best_nights', 'The sweet spot is sunset rolling into dinner, especially in warm weather when the promenade is alive. Come earlier for a lazy drink and coastal light, later for cocktails, food and a more sociable evening buzz.',
      'crowd_mix', 'Torremolinos residents share the terrace with international holidaymakers, gay couples and mixed groups coming off the beach. It is queer-rooted and openly welcoming without feeling sealed off from the wider seaside crowd.',
      'dress_code', 'Beach-to-dinner is the practical brief: linen, shorts, sandals or easy smart-casual all land naturally. There is no velvet-rope aesthetic; just bring the layer you will want after the sun drops.',
      'staff_inclusivity', 'Warm, professional service is one of the clearest recurring review themes. Guests repeatedly describe a friendly welcome across queer and mixed groups, with the occasional busy-period delay reading as terrace pressure rather than attitude.',
      'source_urls', to_jsonb(array[
        'https://www.elgatolounge.com/',
        'https://www.tripadvisor.com/Attraction_Review-g187440-d6199444-Reviews-El_Gato_Lounge-Torremolinos_Costa_del_Sol_Province_of_Malaga_Andalucia.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.elgatolounge.com/','https://www.tripadvisor.com/Attraction_Review-g187440-d6199444-Reviews-El_Gato_Lounge-Torremolinos_Costa_del_Sol_Province_of_Malaga_Andalucia.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.elgatolounge.com/','https://www.tripadvisor.com/Attraction_Review-g187440-d6199444-Reviews-El_Gato_Lounge-Torremolinos_Costa_del_Sol_Province_of_Malaga_Andalucia.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.elgatolounge.com/','https://www.tripadvisor.com/Attraction_Review-g187440-d6199444-Reviews-El_Gato_Lounge-Torremolinos_Costa_del_Sol_Province_of_Malaga_Andalucia.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.elgatolounge.com/','https://www.tripadvisor.com/Attraction_Review-g187440-d6199444-Reviews-El_Gato_Lounge-Torremolinos_Costa_del_Sol_Province_of_Malaga_Andalucia.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g187440-d6199444-Reviews-El_Gato_Lounge-Torremolinos_Costa_del_Sol_Province_of_Malaga_Andalucia.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (75::bigint, jsonb_build_object(
      'queue_wait', 'Early and weekday visits are usually easy walk-ins. Friday and Saturday bring the real bottleneck inside—a narrow prison-themed room that can feel densely packed—so come before the late wave if conversation matters.',
      'best_nights', 'Bear and themed nights give the bar its strongest community character; weekends are loudest and busiest. A weeknight is better for meeting regulars, hearing yourself think and taking in the playful jailhouse details.',
      'crowd_mix', 'Copenhagen gay regulars, bears and chasers mingle with international visitors, broadly across adult ages. It remains male-leaning but reviews describe a varied, approachable room rather than a single body type or uniform scene.',
      'dress_code', 'Guest style is casual—jeans, tees and everyday layers are completely normal. The prison uniforms belong to the concept and staff; visitors do not need a costume unless a particular event explicitly asks for one.',
      'staff_inclusivity', 'Experiences split sharply. Many solo and English-speaking visitors describe easy conversation and kind bartenders; recent reviews also allege hostile treatment, discriminatory remarks and rough removal. That serious minority cannot be polished away.',
      'source_urls', to_jsonb(array[
        'https://jailhousecph.dk/',
        'https://wanderlog.com/place/details/433433/jailhouse-cph',
        'https://eurogaytravel.com/en/venues/jailhouse-cph',
        'https://www.travelgay.com/venue/jailhouse-cph',
        'https://www.dresscodefinder.com/kobenhavn/jailhouse-cph'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/433433/jailhouse-cph','https://eurogaytravel.com/en/venues/jailhouse-cph']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://wanderlog.com/place/details/433433/jailhouse-cph','https://www.travelgay.com/venue/jailhouse-cph']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://eurogaytravel.com/en/venues/jailhouse-cph','https://www.travelgay.com/venue/jailhouse-cph']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.dresscodefinder.com/kobenhavn/jailhouse-cph','https://jailhousecph.dk/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/433433/jailhouse-cph','https://www.travelgay.com/venue/jailhouse-cph']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (99::bigint, jsonb_build_object(
      'queue_wait', 'There is rarely a ceremonial door line; the famous queue is the pavement crowd itself. Warm evenings and happy hour can leave the small interior shoulder-to-shoulder, so arrive early for bar space or embrace the Marais spill-out.',
      'best_nights', 'Thursday DJs add the clearest weekly lift, while Sunday stretches happy hour into a long, social finish. Early evening is ideal as a first stop; later weekend hours work when you want the busy sidewalk scene at full volume.',
      'crowd_mix', 'A mature gay-male base anchors the bar, joined by younger Marais regulars, Paris visitors and tourists passing through the district. The sidewalk makes the mix more visible and social than the compact room alone would suggest.',
      'dress_code', 'Casual Marais bar clothes are enough: denim, tees, work-to-drinks layers or a sharper date-night look. No consistent review pattern points to a strict door code; comfort in a tightly packed room matters more.',
      'staff_inclusivity', 'Low attitude and friendly service appear often, especially from guests who like a classic neighbourhood gay bar. Other accounts describe curt or uncomfortable interactions, so expect brisk peak-hour service rather than universal charm.',
      'source_urls', to_jsonb(array[
        'https://cox.fr/',
        'https://www.timeout.com/paris/en/bars-pubs/cafe-cox',
        'https://fr.travelgay.com/venue/cox',
        'https://paris.gaycities.com/bars/1629-cox-bar',
        'https://www.tripadvisor.com/Attraction_Review-g187147-d267705-Reviews-Le_Cox-Paris_Ile_de_France.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.timeout.com/paris/en/bars-pubs/cafe-cox','https://fr.travelgay.com/venue/cox','https://paris.gaycities.com/bars/1629-cox-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://cox.fr/','https://www.timeout.com/paris/en/bars-pubs/cafe-cox']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://fr.travelgay.com/venue/cox','https://paris.gaycities.com/bars/1629-cox-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.timeout.com/paris/en/bars-pubs/cafe-cox','https://paris.gaycities.com/bars/1629-cox-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://paris.gaycities.com/bars/1629-cox-bar','https://www.tripadvisor.com/Attraction_Review-g187147-d267705-Reviews-Le_Cox-Paris_Ile_de_France.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (131::bigint, jsonb_build_object(
      'queue_wait', 'Three floors absorb people better than a tiny club, but Pride dates and late weekend parties still create entry and cloakroom pressure. Earlier arrival gives you time to map the brasserie, stage and dance spaces before the 6 am crowd settles in.',
      'best_nights', 'Wednesday drag bingo is a smart midweek ritual; Friday and Saturday unlock the full multi-floor party. Karaoke, ballroom, burlesque and drag rotate through the calendar, so the best night is the format that feels most like your queer language.',
      'crowd_mix', 'Queer Varsovians across genders and ages lead the room, alongside allies and international guests. Reviews repeatedly call out the visible mix of identities and nationalities—this feels like a broad queer house, not one narrowly coded sub-scene.',
      'dress_code', 'The mood is expressive but unforced. Everyday clothes, full drag, dance-floor sparkle and a polished dinner look can all travel through the three floors; the venue’s stated rule is mutual respect, not visual conformity.',
      'staff_inclusivity', 'Most guests describe caring, energetic teams and a space designed by queer people for queer people. A smaller review thread mentions unfriendly moments and karaoke favouritism, but openness and respect are both explicit policy and the dominant experience.',
      'source_urls', to_jsonb(array[
        'https://lapose.pl/',
        'https://www.bars10.com/PL/Warsaw/105521495250197/La-Pose',
        'https://wanderlog.com/place/details/6484755/la-pose-varsovie',
        'https://wanderlog.com/pl/place/details/6484755/la-pose-varsovie',
        'https://www.reddit.com/r/warsaw/comments/14y1dvw/gay_scene/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/6484755/la-pose-varsovie','https://www.bars10.com/PL/Warsaw/105521495250197/La-Pose']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://lapose.pl/','https://www.bars10.com/PL/Warsaw/105521495250197/La-Pose']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://lapose.pl/','https://wanderlog.com/place/details/6484755/la-pose-varsovie']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://lapose.pl/','https://wanderlog.com/pl/place/details/6484755/la-pose-varsovie']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://lapose.pl/','https://wanderlog.com/place/details/6484755/la-pose-varsovie']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (105::bigint, jsonb_build_object(
      'queue_wait', 'Lisbon arrives late and Trumps often peaks after 2 am. The line can become messy around guest-list or free-entry cut-offs, so go before the rush, screenshot the offer and ask for its exact terms rather than trusting hearsay in the queue.',
      'best_nights', 'Friday and Saturday give you the full two-room institution, with pop, house, tribal sounds, dancers and drag. Summer foam parties and themed dates are the bigger spectacle; regular Fridays are easier when you want the music without a special-event crush.',
      'crowd_mix', 'Portuguese LGBTQ+ regulars meet international visitors in a crowd that runs from young twenty-somethings into middle age. One floor can feel pop and sing-along, the other more house-led, so the social mix shifts as people move between rooms.',
      'dress_code', 'Wear dancewear that can survive a late, hot night; themed and foam events deserve their own practical outfit. There is no clearly published general fashion code, but valid ID and a composed arrival matter more than expensive clothes.',
      'staff_inclusivity', 'Feedback is genuinely divided. Many guests praise kind bar staff, helpful security and a safe queer room; others report troubling bouncer behaviour and poor explanation of entry rules. Treat the inside welcome and the door experience as separate signals.',
      'source_urls', to_jsonb(array[
        'https://trumps.pt/shop/',
        'https://www.travelgay.com/venue/trumps/',
        'https://whereis.gay/trumps',
        'https://www.thegayagenda.fyi/lisbon/businesses/trumps/',
        'https://www.timeout.com/lisbon/nightlife/trumps',
        'https://www.reddit.com/r/lisboa/comments/1uvi774/queer_bars_nightclubs_that_go_up_all_night/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/trumps/','https://whereis.gay/trumps','https://www.reddit.com/r/lisboa/comments/1uvi774/queer_bars_nightclubs_that_go_up_all_night/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://trumps.pt/shop/','https://www.timeout.com/lisbon/nightlife/trumps']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://whereis.gay/trumps','https://www.thegayagenda.fyi/lisbon/businesses/trumps/','https://www.reddit.com/r/lisboa/comments/1uvi774/queer_bars_nightclubs_that_go_up_all_night/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://trumps.pt/shop/','https://www.travelgay.com/venue/trumps/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/trumps/','https://whereis.gay/trumps','https://www.thegayagenda.fyi/lisbon/businesses/trumps/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1349::bigint, jsonb_build_object(
      'queue_wait', 'Entry is often straightforward; the Saturday bottleneck is the bar itself. Reviews mention slow, lengthy drink lines once drag or karaoke is underway, and late arrivals may struggle for a clear view of the small performance area.',
      'best_nights', 'Saturday drag and karaoke produces the buzzing Katie’s people remember. Check the bill rather than assuming every night lands the same: quieter tribute or midweek sessions suit conversation, while a known host or sing-along date fills the room.',
      'crowd_mix', 'Glasgow queer regulars, students, older locals, visitors and solo guests all show up in the review mix. The crowd is broad rather than fashionable, with karaoke giving strangers an easy reason to cheer each other on.',
      'dress_code', 'Casual, fun and performance-ready wins: jeans, a going-out top, a little glitter or full karaoke-main-character energy. Nothing in the review pattern suggests a strict fashion door; dress for a crowded bar and a spontaneous chorus.',
      'staff_inclusivity', 'Many guests—especially solo visitors—describe reassuring staff and friendly punters. Peak-night service can slow badly and a minority report dismissive interactions, so the social welcome scores better than the consistency of bar operations.',
      'source_urls', to_jsonb(array[
        'https://www.tripadvisor.co.uk/Attraction_Review-g186534-d4878457-Reviews-Katie_s_Bar_Glasgow-Glasgow_Scotland.html',
        'https://wanderlog.com/place/details/4000369',
        'https://www.quandoo.co.uk/place/katies-bar-70645/reviews',
        'https://glasgow.cylex-uk.co.uk/company/katie%27s-bar-26341574.html',
        'https://www.reddit.com/r/glasgow/comments/1c25put/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Attraction_Review-g186534-d4878457-Reviews-Katie_s_Bar_Glasgow-Glasgow_Scotland.html','https://wanderlog.com/place/details/4000369']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Attraction_Review-g186534-d4878457-Reviews-Katie_s_Bar_Glasgow-Glasgow_Scotland.html','https://wanderlog.com/place/details/4000369']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://glasgow.cylex-uk.co.uk/company/katie%27s-bar-26341574.html','https://www.reddit.com/r/glasgow/comments/1c25put/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/4000369','https://glasgow.cylex-uk.co.uk/company/katie%27s-bar-26341574.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Attraction_Review-g186534-d4878457-Reviews-Katie_s_Bar_Glasgow-Glasgow_Scotland.html','https://www.quandoo.co.uk/place/katies-bar-70645/reviews','https://www.reddit.com/r/glasgow/comments/1c25put/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (319::bigint, jsonb_build_object(
      'queue_wait', 'The room is compact, but reports describe bathroom lines moving quickly and enough floor space outside the biggest moments. Athens starts late: arriving around midnight lets you settle in before the crowd and shows properly ignite.',
      'best_nights', 'Follow the drag and live-show calendar, then stay for the turn into Greek pop and Eurovision sing-alongs. Weekend energy builds after midnight; an event-led visit is a stronger bet than choosing a random early hour.',
      'crowd_mix', 'A younger gay and queer crowd leads the dance floor, with friendly Athens locals beside international visitors. As the night deepens and Greek pop lands, the local sing-along energy becomes more visible than a generic tourist-club mood.',
      'dress_code', 'Relaxed, expressive clubwear fits the room: trainers, a fitted night-out look, colour or something show-ready. No reliable source points to a strict fashion test, so prioritise heat, movement and a long post-midnight stretch.',
      'staff_inclusivity', 'The clearest positive signal is the friendly atmosphere among guests, plus efficient practical touches such as ventilation and fast bathroom flow. Staff-specific evidence is thinner and older feedback is mixed, so a sweeping service promise would not be honest.',
      'source_urls', to_jsonb(array[
        'https://www.shamone.gr/',
        'https://wanderlog.com/place/details/13987700/shamone-club',
        'https://www.tripadvisor.co.uk/Restaurant_Review-g189400-d3709125-Reviews-Shamone-Athens_Attica.html',
        'https://www.reddit.com/r/GreeceTravel/comments/1fn06j3/',
        'https://www.reddit.com/r/AskGaybrosOver30/comments/1qwmoiz/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/13987700/shamone-club','https://www.reddit.com/r/AskGaybrosOver30/comments/1qwmoiz/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.shamone.gr/','https://wanderlog.com/place/details/13987700/shamone-club','https://www.reddit.com/r/GreeceTravel/comments/1fn06j3/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Restaurant_Review-g189400-d3709125-Reviews-Shamone-Athens_Attica.html','https://www.reddit.com/r/AskGaybrosOver30/comments/1qwmoiz/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/13987700/shamone-club','https://www.shamone.gr/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/13987700/shamone-club','https://www.tripadvisor.co.uk/Restaurant_Review-g189400-d3709125-Reviews-Shamone-Athens_Attica.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (556, 107, 347, 75, 99, 131, 105, 1349, 319)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 9 then
    raise exception 'Expected 9 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
