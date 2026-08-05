-- Queer Atlas venue intelligence: global review-led editorial pass, batch 11.
-- Berlin, Copenhagen, Madrid and Paris.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (49::bigint, jsonb_build_object(
      'queue_wait', 'Ordinary evenings are easy walk-ins from 8 pm, but the little Kreuzberg room runs out of seats for drag cabaret and its popular karaoke contest. Ticketed shows advise punctual arrival, and high-demand karaoke encourages table reservations. Pride after-parties are the true squeeze.',
      'best_nights', 'Follow the programme rather than a weekday formula. Drag cabaret gives the sharpest performance night, the recurring karaoke contest turns the audience into the show, and Pride or Eurovision editions carry the most Berlin-community energy. A blank-calendar evening works as a cosy late bar.',
      'crowd_mix', 'Kreuzberg queer regulars, drag performers, karaoke loyalists and visitors from the nearby nightlife strip share a compact, mixed-gender room. Specific takeovers can centre FLINTA guests, while ordinary nights are broadly LGBTQ+ and friend-friendly rather than aimed only at gay men.',
      'dress_code', 'There is no selective club uniform: denim, trainers, post-work clothes, drag glamour and full Pride colour all belong. Match the event if you want to participate, but the bar''s living-room identity matters more than fashion. Some nights are cashless at the bar while artist donations may be cash.',
      'staff_inclusivity', 'Warm staff, relaxed queer company and good drinks are recurring strengths, and the venue explicitly welcomes everyone. The clearest practical issue is scale, not hostility: packed shows can strain seating and service. Event-specific audience rules should still be respected when a takeover names its community.',
      'source_urls', to_jsonb(array[
        'https://www.rauschgold.berlin/',
        'https://www.rauschgold.berlin/veranstaltungen/',
        'https://rauschgold.berlin/events/la-cage-aux-holes/',
        'https://rauschgold.berlin/events/after-work-karaoke-20-00-0-00-uhr-duplicate-1-4/',
        'https://rauschgold.berlin/events/%F0%9F%92%98-l-rush-valentines-warm-up-edition-%F0%9F%92%98-20-00-uhr/',
        'https://wanderlog.com/place/details/2277913',
        'https://www.gayplaces.co/city/berlin/bar/rauschgold',
        'https://www.visitberlin.de/en/rauschgold'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://rauschgold.berlin/events/la-cage-aux-holes/','https://www.rauschgold.berlin/veranstaltungen/','https://rauschgold.berlin/events/after-work-karaoke-20-00-0-00-uhr-duplicate-1-4/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.rauschgold.berlin/','https://www.rauschgold.berlin/veranstaltungen/','https://rauschgold.berlin/events/la-cage-aux-holes/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.rauschgold.berlin/','https://rauschgold.berlin/events/%F0%9F%92%98-l-rush-valentines-warm-up-edition-%F0%9F%92%98-20-00-uhr/','https://wanderlog.com/place/details/2277913']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.rauschgold.berlin/','https://rauschgold.berlin/events/%F0%9F%92%98-l-rush-valentines-warm-up-edition-%F0%9F%92%98-20-00-uhr/','https://wanderlog.com/place/details/2277913']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.rauschgold.berlin/','https://wanderlog.com/place/details/2277913','https://www.gayplaces.co/city/berlin/bar/rauschgold']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (60::bigint, jsonb_build_object(
      'queue_wait', 'There is usually more space than demand, so check-in and locker handover are the practical wait. Even Sunday evening, traditionally a stronger sauna window, has recently been reported with only a handful of guests. Special parties may change that, but do not assume a guaranteed crowd.',
      'best_nights', 'Tuesday and Friday are advertised as nude days, Wednesday carries a younger-person discount and Monday is the reduced-price customer day. Sunday late afternoon is the best conventional bet for company, yet recent reports remain quiet. Pick the theme or price that suits you, not hype.',
      'crowd_mix', 'The current crowd skews toward Madrid men over forty, with some tourists and younger guests depending on discounts and timing. Three floors make six people feel very different from sixty. It is a gay men''s adult sauna, not a mixed wellness spa, and the social temperature varies sharply by hour.',
      'dress_code', 'Street clothes go into the locker; towel or nudity fits the sauna and cruising areas, with nude rules on designated days. Bring non-slip shower sandals because recent guests flag cold lower rooms and slippery stairs. No fetish outfit is needed unless a special party says otherwise.',
      'staff_inclusivity', 'Cleanliness earns genuine praise, including a fresh 2026 review, but staff treatment is a recurring weak point. Several guests describe rude or indifferent service, while others find the place functional and orderly. Quiet rooms, reported drug use and stair safety add concerns beyond friendliness alone.',
      'source_urls', to_jsonb(array[
        'https://saunalavapies.com/',
        'https://saunalavapies.com/services/',
        'https://saunalavapies.com/contact-2/',
        'https://wanderlog.com/es/place/details/4972969/sauna-lavapies',
        'https://www.nighttours.com/madrid/gayguide/sauna-lavapies.html',
        'https://es.travelgay.com/madrid-gay-saunas',
        'https://restaurantguru.com/Sauna-Lavapies-Madrid',
        'https://www.reddit.com/r/gaytravel/comments/1sugvm2/solo_trip_to_madrid_may_49/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/es/place/details/4972969/sauna-lavapies','https://restaurantguru.com/Sauna-Lavapies-Madrid','https://www.reddit.com/r/gaytravel/comments/1sugvm2/solo_trip_to_madrid_may_49/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://saunalavapies.com/services/','https://wanderlog.com/es/place/details/4972969/sauna-lavapies','https://restaurantguru.com/Sauna-Lavapies-Madrid']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/es/place/details/4972969/sauna-lavapies','https://www.nighttours.com/madrid/gayguide/sauna-lavapies.html','https://www.reddit.com/r/gaytravel/comments/1sugvm2/solo_trip_to_madrid_may_49/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://saunalavapies.com/services/','https://wanderlog.com/es/place/details/4972969/sauna-lavapies']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/es/place/details/4972969/sauna-lavapies','https://restaurantguru.com/Sauna-Lavapies-Madrid','https://www.nighttours.com/madrid/gayguide/sauna-lavapies.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (63::bigint, jsonb_build_object(
      'queue_wait', 'Online tickets are the cleanest route for major fetish weekends, when the central club runs 11 pm-6 am and entry pressure rises. The door checks the event''s outfit, not merely your ticket. On ordinary midweek sessions, arriving before midnight can mean free entry and less scrutiny from a crowd.',
      'best_nights', 'Wednesday strips down to jockstraps, underwear, sports gear or nudity. Thursday is cruising-led, Friday and Saturday foreground electronic DJs, and Sunday rotates queer or play concepts. Choose the named format: the music, gender policy and clothing expectations can change night by night.',
      'crowd_mix', 'Gay men and international fetish travellers dominate the historic cruising club, especially during festival weeks. Some nights explicitly operate men-only; other current concepts use a broader queer visual language, including drag and cross-dressing. Read the event terms rather than assuming one permanent audience.',
      'dress_code', 'The code is mandatory and unusually broad: all-black, leather, latex, harnesses, mesh, lingerie, uniforms, drag, cosplay, body paint or event-approved nudity can work. A casual colourful tourist outfit may not. The aim is visible participation in the fantasy, not one expensive leather uniform.',
      'staff_inclusivity', 'Clearer programming and published clothing options help newcomers understand the intent, and positive reviews value freedom inside. Negative accounts focus on inconsistent door interpretation and rejected outfits. Inclusion is conditional on the event frame, so a ticket should never be read as guaranteed entry.',
      'source_urls', to_jsonb(array[
        'https://strong.madrid/',
        'https://wanderlog.com/place/details/12384611',
        'https://www.reddit.com/r/MadridTravelGuide/comments/1utnnnk/strong_club_in_madrid_not_in_pride/',
        'https://www.reddit.com/r/askgaybros/comments/1qlpwx7/madrid_night_out_recommendations/',
        'https://www.reddit.com/r/AskGaybrosOver30/comments/1kh6a4a'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://strong.madrid/','https://wanderlog.com/place/details/12384611','https://www.reddit.com/r/MadridTravelGuide/comments/1utnnnk/strong_club_in_madrid_not_in_pride/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://strong.madrid/','https://www.reddit.com/r/askgaybros/comments/1qlpwx7/madrid_night_out_recommendations/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','event_specific_policy','source_urls',to_jsonb(array['https://strong.madrid/','https://wanderlog.com/place/details/12384611']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://strong.madrid/','https://wanderlog.com/place/details/12384611','https://www.reddit.com/r/askgaybros/comments/1qlpwx7/madrid_night_out_recommendations/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','limited_current_evidence','source_urls',to_jsonb(array['https://strong.madrid/','https://wanderlog.com/place/details/12384611','https://www.reddit.com/r/AskGaybrosOver30/comments/1kh6a4a']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (57::bigint, jsonb_build_object(
      'queue_wait', 'This is a dark little bear bar, so a busy Friday or Saturday creates a standing squeeze rather than a serious door line. Arrive near 9 pm for easier conversation and a place at the bar. Current listings show it closed Sunday through Tuesday; verify before making a special trip.',
      'best_nights', 'Friday and Saturday run latest and bring the strongest bears-and-friends crowd. Wednesday or Thursday is better for chatting with the hosts and regulars without weekend noise. Use it as an intimate Chueca first stop, not as a full dance-club finale.',
      'crowd_mix', 'Madrid bears, cubs and admirers form the core, joined by kink-friendly friends and queer visitors who know what kind of room they are entering. The bar is gay male-led but describes everyone as welcome. Locals give it its personality; tourists fit best when they engage rather than observe.',
      'dress_code', 'Jeans, tees, leather accents, harnesses and relaxed bear-bar clothes all feel natural. There is no evidenced strict fashion rule, and you do not need fetish gear or a particular body type. Dress for a small, neon-lit drinking bar rather than a selective dance floor.',
      'staff_inclusivity', 'Friendly hosts, fair drinks and an easy welcome are the consistent published signal, including from international guests. However, the recent independent review pool is small, so this should be read as a promising community impression rather than a universal service verdict.',
      'source_urls', to_jsonb(array[
        'https://www.gayout.com/europe/spain/madrid/bars/zarpa-1271',
        'https://www.travelgay.com/venue/zarpa',
        'https://www.reddit.com/r/askgaybros/comments/1qlpwx7/madrid_night_out_recommendations/',
        'https://www.esmadrid.com/sites/default/files/guia_lgtbi_madrid_2022.pdf',
        'https://mytripnavi.com/gay/madrid.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','limited_current_evidence','source_urls',to_jsonb(array['https://www.travelgay.com/venue/zarpa','https://www.gayout.com/europe/spain/madrid/bars/zarpa-1271']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.travelgay.com/venue/zarpa','https://www.reddit.com/r/askgaybros/comments/1qlpwx7/madrid_night_out_recommendations/','https://mytripnavi.com/gay/madrid.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.travelgay.com/venue/zarpa','https://www.gayout.com/europe/spain/madrid/bars/zarpa-1271','https://www.esmadrid.com/sites/default/files/guia_lgtbi_madrid_2022.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.travelgay.com/venue/zarpa','https://mytripnavi.com/gay/madrid.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','limited_current_evidence','source_urls',to_jsonb(array['https://www.travelgay.com/venue/zarpa','https://www.gayout.com/europe/spain/madrid/bars/zarpa-1271']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (83::bigint, jsonb_build_object(
      'queue_wait', 'A low-key basement check-in leads straight to lockers and screens; there is rarely a conventional queue. Thursday afternoon has recently surprised visitors by being active, while other hours can be empty. The entrance is easy to miss, so save the exact Kingosgade basement address.',
      'best_nights', 'Wednesday after 8 pm is the official nude night. Daytime can already be active, and a recent Thursday afternoon report found a good crowd. This is open daily rather than event-led, so timing is experimental: go when cruising suits you, not for a guaranteed weekend peak.',
      'crowd_mix', 'Adults of varied ages use the cinema, cabins and small sauna, with gay and bisexual men forming the practical cruising core. Some listings describe a broader welcome, but the experience remains male-oriented and sexual rather than a mixed social bar. People come for anonymity, not dating.',
      'dress_code', 'There is no streetwear code: choose the cheaper cinema entry or pay more for a locker, towel, shower and sauna access. Nudity is the Wednesday theme, while underwear or towel works otherwise. Keep the key deposit receipt and bring as little as possible into the play areas.',
      'staff_inclusivity', 'Experiences split hard. Some 2025 guests found a friendly welcome, good value and unexpectedly lively action; many 2025-26 reviews describe smoke, musty air, sticky surfaces, weak heat and neglected facilities. The human welcome can be pleasant while the hygiene signal remains poor.',
      'source_urls', to_jsonb(array[
        'https://www.bodybio.dk/',
        'https://www.gayout.com/europe/denmark/copenhagen/bars/body-bio-5623',
        'https://wanderlog.com/nb/place/details/1373046/body-bio',
        'https://www.reddit.com/r/askgaybros/comments/1srm8v3/sauna_in_copenhagen/',
        'https://www.reddit.com/r/gaytravel/comments/1up2et9/copenhagen_end_of_august/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.bodybio.dk/','https://wanderlog.com/nb/place/details/1373046/body-bio','https://www.gayout.com/europe/denmark/copenhagen/bars/body-bio-5623']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.bodybio.dk/','https://wanderlog.com/nb/place/details/1373046/body-bio']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.bodybio.dk/','https://www.gayout.com/europe/denmark/copenhagen/bars/body-bio-5623','https://www.reddit.com/r/gaytravel/comments/1up2et9/copenhagen_end_of_august/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.bodybio.dk/','https://wanderlog.com/nb/place/details/1373046/body-bio']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.gayout.com/europe/denmark/copenhagen/bars/body-bio-5623','https://wanderlog.com/nb/place/details/1373046/body-bio','https://www.reddit.com/r/askgaybros/comments/1srm8v3/sauna_in_copenhagen/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (74::bigint, jsonb_build_object(
      'queue_wait', 'The room is small enough to feel busy quickly, but it behaves like a neighbourhood bar rather than a guarded club. Weekend peaks mean standing and close conversation, not a long exterior line. Arrive during 6-8 pm happy hour for a nook; later visits trade seating for energy.',
      'best_nights', 'Friday and Saturday are busiest, while the first Sunday brunch offers a more communal daytime ritual. Bear Night can become shirtless, playful and far less ordinary. For a quiet first drink and local advice, an early weekday happy hour is arguably more useful than the weekend crush.',
      'crowd_mix', 'Leather men, bears and mature Copenhagen gay regulars set the tone, with younger men and international visitors readily folded in. It remains a men''s gay bar rather than a mixed queer venue, but no particular body, age or expensive fetish wardrobe is required to belong.',
      'dress_code', 'Leather is part of the heritage, not an entry test. Jeans, a tee, trainers and full gear are all accepted, and themed nights may invite going shirtless. Come as a man who wants to share the room; there is no need to manufacture a leather identity for the door.',
      'staff_inclusivity', 'Recent visitors repeatedly call the bartenders friendly, generous with local recommendations and welcoming whether the bar is busy or subdued. The close, male-only focus will not suit everyone, but within that remit the community signal is unusually warm and consistent.',
      'source_urls', to_jsonb(array[
        'https://www.visitcopenhagen.com/copenhagen/planning/mens-bar-gdk655907',
        'https://www.travelgay.com/copenhagen-gay-bars',
        'https://www.tripadvisor.co.uk/Attraction_Review-g189541-d605609-Reviews-The_Men_s_Bar-Copenhagen_Zealand.html',
        'https://wanderlog.com/el/place/details/1373011/mens-bar'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Attraction_Review-g189541-d605609-Reviews-The_Men_s_Bar-Copenhagen_Zealand.html','https://wanderlog.com/el/place/details/1373011/mens-bar','https://www.travelgay.com/copenhagen-gay-bars']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.travelgay.com/copenhagen-gay-bars','https://www.tripadvisor.co.uk/Attraction_Review-g189541-d605609-Reviews-The_Men_s_Bar-Copenhagen_Zealand.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.visitcopenhagen.com/copenhagen/planning/mens-bar-gdk655907','https://www.travelgay.com/copenhagen-gay-bars','https://www.tripadvisor.co.uk/Attraction_Review-g189541-d605609-Reviews-The_Men_s_Bar-Copenhagen_Zealand.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.visitcopenhagen.com/copenhagen/planning/mens-bar-gdk655907','https://www.travelgay.com/copenhagen-gay-bars']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Attraction_Review-g189541-d605609-Reviews-The_Men_s_Bar-Copenhagen_Zealand.html','https://wanderlog.com/el/place/details/1373011/mens-bar']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (80::bigint, jsonb_build_object(
      'queue_wait', 'Saturday club nights open at 11 pm, yet a 2025 visitor waited over 30 minutes after 1 am and found the room nearly empty. Door tickets and coat check can add cost after the wait. Buy the named concert in advance; for the nightclub, arriving early is lower risk but may feel quiet.',
      'best_nights', 'Choose by concert or club programme, not because it is listed in a queer guide. Current Saturday nightlife is hip-hop, R&B, edits and classics until 4 am, with concerts across rock, indie and experimental music on other dates. A specific artist is a better reason to go than generic weekend faith.',
      'crowd_mix', 'Nørrebro music fans, students and mainstream Copenhagen clubbers make up the audience, shifting dramatically with each live act. This is not a dedicated LGBTQ+ venue. Queer guests are protected by the published safer-space standard, but queer community is not the organising identity of every night.',
      'dress_code', 'Normal concert or urban clubwear works: trainers, denim, streetwear and practical layers. The published rules focus on conduct, age and the event, not fashion performance. Check whether the date is a seated concert, standing show or 21-plus club night before choosing the outfit.',
      'staff_inclusivity', 'The written safer-space policy explicitly rejects homophobia, transphobia, racism and sexism and asks guests to seek staff help. That is a useful standard, not proof of flawless delivery: one 2025 account describes miserable, unhelpful staff, a misleading door and an empty room after a long wait.',
      'source_urls', to_jsonb(array[
        'https://rust.dk/',
        'https://rust.dk/wp-content/uploads/2026/05/Production-Specs-RUST-updated-May-2026.pdf',
        'https://nz.trustpilot.com/review/www.rust.dk'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','limited_current_evidence','source_urls',to_jsonb(array['https://rust.dk/','https://nz.trustpilot.com/review/www.rust.dk']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://rust.dk/','https://rust.dk/wp-content/uploads/2026/05/Production-Specs-RUST-updated-May-2026.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','event_specific_policy','source_urls',to_jsonb(array['https://rust.dk/','https://rust.dk/wp-content/uploads/2026/05/Production-Specs-RUST-updated-May-2026.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://rust.dk/','https://rust.dk/wp-content/uploads/2026/05/Production-Specs-RUST-updated-May-2026.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','limited_current_evidence','source_urls',to_jsonb(array['https://rust.dk/','https://nz.trustpilot.com/review/www.rust.dk']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1866::bigint, jsonb_build_object(
      'queue_wait', 'The terrace is the prize, so sunny lunch, Sunday brunch and sunset can fill its roughly 150 places. Reserve if the Eiffel Tower view is non-negotiable; walk-ins do better outside the golden-hour rush. Large groups report long order waits even after booking.',
      'best_nights', 'This is strongest in daylight and at sunset, not after midnight. Choose a clear evening for drinks over Paris or Sunday for the house brunch. Warm weather matters more than the weekday, and an early table lets the neighbourhood view unfold without making the entire visit a fight for terrace space.',
      'crowd_mix', 'Belleville locals, couples, families and international visitors share a broad restaurant crowd. The surrounding district feels more lived-in than central tourist Paris, but the skyline terrace is a destination in its own right. This is queer-friendly by context, not a dedicated LGBTQ+ venue.',
      'dress_code', 'Casual Paris terrace clothes are enough: trainers, denim, summer layers or a relaxed date-night look. There is no door code. Bring something for wind after sunset, and prioritise comfort on the steep Belleville approach over dressing as though the panoramic view were a rooftop nightclub.',
      'staff_inclusivity', 'Recent individual diners praise smiling, quick and genuinely warm service even during a lunch rush. Large booked groups report the opposite: understaffing, lost reserved space and waits beyond 40 minutes. The welcome appears strongest for ordinary tables and least reliable for complex group events.',
      'source_urls', to_jsonb(array[
        'https://www.moncoeurbelleville.com/en',
        'https://www.moncoeurbelleville.com/',
        'https://www.tripadvisor.fr/Restaurant_Review-g187147-d8519353-Reviews-Monceour_Belleville-Paris_Ile_de_France.html',
        'https://wanderlog.com/fr/place/details/481988/monc%C5%93ur-belleville',
        'https://www.petitfute.com/v17231-17296-paris-75020/c1169-s-amuser-sortir/c182-bar-cafe/c194-bar-de-quartier/1190764-moncoeur-belleville/tous-les-avis.html',
        'https://www.privateaser.com/lieu/3179-moncoeur-belleville',
        'https://www.reddit.com/r/ParisTravelGuide/comments/1ufd01z/trip_report_15th18th_june_2026_as_the_heat_set_in/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.moncoeurbelleville.com/en','https://www.tripadvisor.fr/Restaurant_Review-g187147-d8519353-Reviews-Monceour_Belleville-Paris_Ile_de_France.html','https://www.privateaser.com/lieu/3179-moncoeur-belleville']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.moncoeurbelleville.com/','https://wanderlog.com/fr/place/details/481988/monc%C5%93ur-belleville','https://www.petitfute.com/v17231-17296-paris-75020/c1169-s-amuser-sortir/c182-bar-cafe/c194-bar-de-quartier/1190764-moncoeur-belleville/tous-les-avis.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://wanderlog.com/fr/place/details/481988/monc%C5%93ur-belleville','https://www.reddit.com/r/ParisTravelGuide/comments/1ufd01z/trip_report_15th18th_june_2026_as_the_heat_set_in/','https://www.moncoeurbelleville.com/en']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.moncoeurbelleville.com/en','https://wanderlog.com/fr/place/details/481988/monc%C5%93ur-belleville']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.petitfute.com/v17231-17296-paris-75020/c1169-s-amuser-sortir/c182-bar-cafe/c194-bar-de-quartier/1190764-moncoeur-belleville/tous-les-avis.html','https://www.privateaser.com/lieu/3179-moncoeur-belleville','https://wanderlog.com/fr/place/details/481988/monc%C5%93ur-belleville']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (49, 60, 63, 57, 83, 74, 80, 1866)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
