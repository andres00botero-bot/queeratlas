-- Queer Atlas venue intelligence: global review-led editorial pass, batch 10.
-- Copenhagen, Paris, Rome, Stockholm and Taipei.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (100::bigint, jsonb_build_object(
      'queue_wait', 'Early evening usually behaves like a Châtelet cocktail bar with terrace seating, not a selective club door. The late session can add entry and coat-check friction on busy weekends. Come during happy hour for an easy start; after midnight, expect a denser standing crowd.',
      'best_nights', 'Daily happy hour from 6 to 11 pm is the low-pressure window. For the full extravagant version, choose a themed night and stay after midnight for DJs, go-go performance or cabaret energy; the venue runs until 7 am on most late-night listings.',
      'crowd_mix', 'Paris gay regulars, queer groups and international visitors mix with Châtelet passers-by and straight friends. The yellow-fronted landmark feels openly gay-led but commercially broad, with the terrace more mixed and the downstairs late crowd more nightlife-focused.',
      'dress_code', 'The mood is extravagant but relaxed, so everyday Paris bar clothes, trainers, glitter and a bolder party look can all coexist. No credible strict fashion code is published. Dress for a terrace drink that may turn into dancing until morning.',
      'staff_inclusivity', 'Recent guests describe both a genuinely welcoming, safe-feeling team and deeply disappointing service. Complaints include billing confusion, poor cleanliness and serious security conduct. Its participation in a nightlife-welfare network is meaningful, but does not cancel those reported experiences.',
      'source_urls', to_jsonb(array[
        'https://banana-cafe-paris.com/?lang=en',
        'https://parisjetaime.com/restaurant/banana-cafe-p684',
        'https://wanderlog.com/place/details/478165/banana-caf%C3%A9-paris',
        'https://www.tripadvisor.co.uk/Attraction_Review-g187147-d195134-Reviews-Club_Banana_Cafe-Paris_Ile_de_France.html',
        'https://fr.restaurantguru.com/Banana-Cafe-Paris',
        'https://www.privateaser.com/lieu/1066-banana-cafe'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://banana-cafe-paris.com/?lang=en','https://wanderlog.com/place/details/478165/banana-caf%C3%A9-paris','https://www.tripadvisor.co.uk/Attraction_Review-g187147-d195134-Reviews-Club_Banana_Cafe-Paris_Ile_de_France.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://banana-cafe-paris.com/?lang=en','https://parisjetaime.com/restaurant/banana-cafe-p684','https://fr.restaurantguru.com/Banana-Cafe-Paris']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://parisjetaime.com/restaurant/banana-cafe-p684','https://wanderlog.com/place/details/478165/banana-caf%C3%A9-paris','https://www.privateaser.com/lieu/1066-banana-cafe']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://parisjetaime.com/restaurant/banana-cafe-p684','https://www.tripadvisor.co.uk/Attraction_Review-g187147-d195134-Reviews-Club_Banana_Cafe-Paris_Ile_de_France.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://parisjetaime.com/restaurant/banana-cafe-p684','https://wanderlog.com/place/details/478165/banana-caf%C3%A9-paris','https://www.tripadvisor.co.uk/Attraction_Review-g187147-d195134-Reviews-Club_Banana_Cafe-Paris_Ile_de_France.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (121::bigint, jsonb_build_object(
      'queue_wait', 'An ARCO membership is required, so register online or allow time to create it with ID at the entrance. Pride and major bear events can pack the compact basement. Ask how the drink card and minimum purchase work before entering; unclear explanations have caused disputes at exit.',
      'best_nights', 'Thursday karaoke is the playful social option, Friday centres the bear community and Saturday runs latest and fullest. A named naked, leather or Pride event changes the experience completely, so the calendar matters more than a generic recommendation. Happy hour is 9-10 pm.',
      'crowd_mix', 'Roman bears and their admirers form the unmistakable core, joined by leather and fetish men, international visitors and men who do not fit the bear label. The club describes itself as body-positive and welcoming, but it remains a male cruise-oriented space rather than an all-genders queer party.',
      'dress_code', 'Regular bear and karaoke nights accept casual masculine clothes, while fetish editions may strongly request leather, rubber, uniform, sports gear, skin or a specific costume. Never assume one outfit covers every event: check the current poster before leaving.',
      'staff_inclusivity', 'Warm, hospitable volunteers and a family-like welcome dominate many reviews, including from non-bears and visitors. A recent complaint describes poor communication about compulsory drink payment and an upsetting exit dispute. The social welcome is strong; entry procedures need clearer explanation.',
      'source_urls', to_jsonb(array[
        'https://www.companyclubroma.it/en',
        'https://www.companyclubroma.it/event-details/roma-bear-pride-1',
        'https://www.travelgay.com/venue/company-roma',
        'https://whereis.gay/company-roma',
        'https://wanderlog.com/it/place/details/1384361/company-roma',
        'https://www.top-rated.online/cities/Rome/place/p/13606324/Company%2BRoma',
        'https://www.lcroma.com/en/multiverse-feb26-2/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.companyclubroma.it/en','https://whereis.gay/company-roma','https://www.top-rated.online/cities/Rome/place/p/13606324/Company%2BRoma']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.companyclubroma.it/en','https://www.companyclubroma.it/event-details/roma-bear-pride-1','https://wanderlog.com/it/place/details/1384361/company-roma']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.companyclubroma.it/en','https://www.travelgay.com/venue/company-roma','https://whereis.gay/company-roma']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','event_specific_policy','source_urls',to_jsonb(array['https://www.companyclubroma.it/en','https://www.lcroma.com/en/multiverse-feb26-2/','https://www.travelgay.com/venue/company-roma']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/company-roma','https://wanderlog.com/it/place/details/1384361/company-roma','https://www.top-rated.online/cities/Rome/place/p/13606324/Company%2BRoma']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (91::bigint, jsonb_build_object(
      'queue_wait', 'Late arrivals can meet a long gangway queue and mandatory cloakroom handling, especially on Sunday and major weekends. Arrive before 10 pm for the easiest boarding and confirm admission, age limit and payment options that day; recent visitors report surprises at the door.',
      'best_nights', 'Sunday is the queer tradition, built around glitter, costumes, dancing and a broad gay-mixed crowd until 5 am. Friday and Saturday are mainstream boat-club nights across three floors, with nostalgia and Afrobeat alongside current hits. Choose Sunday if queer atmosphere is the reason you are going.',
      'crowd_mix', 'Sunday draws Stockholm LGBTQ+ regulars across several generations, international students, tourists and straight friends. Friday and Saturday are much more mainstream. The boat''s fame and multiple dance floors create a broader, more commercial mix than a small community bar.',
      'dress_code', 'No special style code is reliably published: Swedish going-out basics, trainers, shirts, dresses and Sunday sparkle all appear. Age limits vary by night and matter more than fashion. Bring accepted payment, valid ID and a layer you are willing to leave in the cloakroom.',
      'staff_inclusivity', 'The long-running Sunday identity still matters, but recent service evidence is troubling. Guests report arbitrary ejections, language-related friction, compulsory cloakroom charges and payment confusion. A queer brand and a safe, respectful door experience cannot be assumed to be identical.',
      'source_urls', to_jsonb(array[
        'https://www.patriciastockholm.se/',
        'https://www.patriciastockholm.se/about-us/',
        'https://uploads-media.qx.se/QXQueerMap2026.pdf',
        'https://www.travelgay.com/venue/patricia',
        'https://www.tripadvisor.co.uk/Restaurant_Review-g189852-d9585812-Reviews-Patricia-Stockholm.html',
        'https://thatsup.co.uk/stockholm/nightclub/patricia/',
        'https://partyprep.se/clubs/patricia-stockholm'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://thatsup.co.uk/stockholm/nightclub/patricia/','https://www.tripadvisor.co.uk/Restaurant_Review-g189852-d9585812-Reviews-Patricia-Stockholm.html','https://partyprep.se/clubs/patricia-stockholm']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.patriciastockholm.se/','https://uploads-media.qx.se/QXQueerMap2026.pdf','https://www.travelgay.com/venue/patricia']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://uploads-media.qx.se/QXQueerMap2026.pdf','https://www.travelgay.com/venue/patricia','https://thatsup.co.uk/stockholm/nightclub/patricia/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://partyprep.se/clubs/patricia-stockholm','https://www.tripadvisor.co.uk/Restaurant_Review-g189852-d9585812-Reviews-Patricia-Stockholm.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Restaurant_Review-g189852-d9585812-Reviews-Patricia-Stockholm.html','https://thatsup.co.uk/stockholm/nightclub/patricia/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (603::bigint, jsonb_build_object(
      'queue_wait', 'The basement holds only around forty people comfortably, so Saturday can become packed without producing a huge street queue. A recent cover was NT$300. Come near opening for space to understand the setup; later entry trades breathing room for a livelier room and shows.',
      'best_nights', 'Tuesday bondage practice gives the clearest shibari and technique-focused experience, while Friday and Saturday bring the busiest mix and more spontaneous play. Check the event calendar: a themed night feels far more fetish-led than an ordinary evening of drinks, games and dance music.',
      'crowd_mix', 'Younger Taipei gay men lead the crowd, alongside local fetish regulars, international residents, tourists and some straight couples or women curious about the shows. It is gay and BDSM-rooted, but current reviews describe a more mixed, sociable bar than a strict leather-only enclave.',
      'dress_code', 'Leather, harnesses, shirtless looks and kink gear make sense, but ordinary dark bar clothes are common and no universal strict code is evidenced. Dress to participate at your own level, not to impersonate a scene. Consent and curiosity matter more than owning expensive gear.',
      'staff_inclusivity', 'Friendly, attentive service is the strongest recurring praise, with several visitors feeling personally welcomed. A smaller set describes an unfriendly cashier or difficulty joining established groups. Tourists generally fare well, but solo socialising can depend heavily on the night''s crowd.',
      'source_urls', to_jsonb(array[
        'https://www.travelgay.com/venue/commander-d',
        'https://wanderlog.com/place/details/1827388/commander-d',
        'https://www.thegayagenda.fyi/taipei/businesses/commander-d/',
        'https://www.gtaiwan.com/en/venues/e8d37d93-7d15-4d2b-81ff-533e459af523/commander-d',
        'https://taipei.gaycities.com/bars/304019-commander-d',
        'https://www.corner.inc/place/pRoSp5KYTvCC',
        'https://menuweb.menu/restaurants/taipei/commander-d'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1827388/commander-d','https://www.travelgay.com/venue/commander-d','https://www.corner.inc/place/pRoSp5KYTvCC']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1827388/commander-d','https://www.gtaiwan.com/en/venues/e8d37d93-7d15-4d2b-81ff-533e459af523/commander-d','https://menuweb.menu/restaurants/taipei/commander-d']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1827388/commander-d','https://www.corner.inc/place/pRoSp5KYTvCC','https://www.travelgay.com/venue/commander-d']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://taipei.gaycities.com/bars/304019-commander-d','https://wanderlog.com/place/details/1827388/commander-d','https://www.gtaiwan.com/en/venues/e8d37d93-7d15-4d2b-81ff-533e459af523/commander-d']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1827388/commander-d','https://www.thegayagenda.fyi/taipei/businesses/commander-d/','https://menuweb.menu/restaurants/taipei/commander-d']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (610::bigint, jsonb_build_object(
      'queue_wait', 'This is appointment-only service, not a walk-in social spa. Use the live roster to choose a therapist and book by the official messaging channel; same-day slots exist, but a specific person or four-hand treatment needs more planning. Arrive on time for your private session.',
      'best_nights', 'There is no party night: the spa operates daily from 1 pm to midnight, with booking handled from late morning. Pick the therapist and treatment rather than the weekday. Afternoon offers the calmest reset; evening suits a private wind-down after sightseeing or work.',
      'crowd_mix', 'The service is built around male therapists and a gay male clientele, while explicitly welcoming every race, age and body type. Locals, business travellers and LGBTQ+ visitors use separate booked sessions, so there is no shared crowd or public cruising room to read.',
      'dress_code', 'No public-facing dress code applies. Arrive in ordinary clothes, shower facilities and fresh linens are provided, and privacy is part of the format. What matters is choosing the correct treatment, discussing boundaries and understanding the stated price before the session starts.',
      'staff_inclusivity', 'The strongest evidence is transparency: a large therapist roster, visible availability, stated treatments and published prices. Independent mystery-shopper coverage rated the experience highly, while the public review pool is still limited. Confirm boundaries directly rather than inferring them from photos.',
      'source_urls', to_jsonb(array[
        'https://www.primemanspa.tw/',
        'https://www.primemanspa.tw/cht/module/pageinfo/81.html',
        'https://www.travelgay.com/taipei-gay-massage-spas',
        'https://www.travelgay.com/venue/prime-spa-2',
        'https://www.twosevenths.com/en/therapy/massage-taipei-gayspa/',
        'https://travelm.de/en-US/place/chijowqpcnerqjqrulyw5gmgfoe-en-prime-spa'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.primemanspa.tw/','https://www.travelgay.com/taipei-gay-massage-spas','https://www.twosevenths.com/en/therapy/massage-taipei-gayspa/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.primemanspa.tw/','https://www.travelgay.com/taipei-gay-massage-spas']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.primemanspa.tw/','https://www.travelgay.com/venue/prime-spa-2','https://www.travelgay.com/taipei-gay-massage-spas']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://www.primemanspa.tw/','https://www.travelgay.com/taipei-gay-massage-spas']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','limited_current_evidence','source_urls',to_jsonb(array['https://www.primemanspa.tw/','https://www.twosevenths.com/en/therapy/massage-taipei-gayspa/','https://www.travelgay.com/taipei-gay-massage-spas']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (92::bigint, jsonb_build_object(
      'queue_wait', 'Membership must be approved online before the club opens; do not expect to create it at the door. Popular naked and Pride-period nights can queue at both entry and clothes check, with reports of roughly 30 minutes. Apply early, arrive near opening and avoid bulky bags.',
      'best_nights', 'Wednesday pub evenings are the social, low-pressure introduction. Friday cruising and Saturday fetish themes bring the full club, but every event publishes its own clothing rules. Choose the fetish you actually enjoy; a naked night and a strict leather-and-rubber night are not interchangeable.',
      'crowd_mix', 'Gay and bisexual men from Stockholm''s leather, rubber, sportswear and wider fetish communities form the membership, joined by visiting members from partner clubs. It is intentionally men-focused and community-run, not a general LGBTQ+ nightclub or a sightseeing attraction.',
      'dress_code', 'The posted event code is real. One night may require only nudity with shoes; another accepts only leather or rubber, while pub formats can be broader. Apply the exact rules, not a generic black outfit. The club values evident fetish interest more than how expensive your gear is.',
      'staff_inclusivity', 'Member volunteers receive unusually consistent praise for friendliness, cleanliness and creating a safe social space. The small venue and slow wardrobe can frustrate, but the rules include consent, sanctions and a review route after suspension. Its welcome is strong within a deliberately narrow membership remit.',
      'source_urls', to_jsonb(array[
        'https://slmstockholm.se/en/',
        'https://slmstockholm.se/en/about-us/',
        'https://slmstockholm.se/house-rules/',
        'https://slmstockholm.se/events/2025-07-26-full-frontal-night/?lang=en',
        'https://slmstockholm.se/events/2026-06-13-club-berlin/?lang=en',
        'https://wanderlog.com/place/details/4825756',
        'https://www.travelgay.com/venue/slm-stockholm',
        'https://qlist.app/venues/Sweden/SLM-Stockholm/dDVkajB0b3huYW42NDUzMVRTM2xrZw'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://slmstockholm.se/en/','https://slmstockholm.se/events/2025-07-26-full-frontal-night/?lang=en','https://wanderlog.com/place/details/4825756']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://slmstockholm.se/en/','https://www.travelgay.com/venue/slm-stockholm','https://wanderlog.com/place/details/4825756']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://slmstockholm.se/en/','https://slmstockholm.se/en/about-us/','https://www.travelgay.com/venue/slm-stockholm']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://slmstockholm.se/events/2025-07-26-full-frontal-night/?lang=en','https://slmstockholm.se/events/2026-06-13-club-berlin/?lang=en','https://slmstockholm.se/house-rules/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://slmstockholm.se/house-rules/','https://wanderlog.com/place/details/4825756','https://qlist.app/venues/Sweden/SLM-Stockholm/dDVkajB0b3huYW42NDUzMVRTM2xrZw']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (82::bigint, jsonb_build_object(
      'queue_wait', 'Membership can be bought online or at the entrance, but renewals and new cards can slow the cashier. Buy ahead and upload a photo if you want the smoothest arrival. Friday starts at 9 pm and Saturday at 10; strict outfit interpretation, not raw queue length, is the main entry risk.',
      'best_nights', 'Friday Bar and Cruising is the most accessible introduction because its masculine code permits restrained everyday menswear. Saturday themes go deeper into fetish and play, while special weekends add workshops or lounges. Read the calendar: this volunteer club opens around events, not every night.',
      'crowd_mix', 'The membership is for gay men and other men who have sex with men, centred on leather, rubber, uniforms and BDSM. Copenhagen regulars share the two levels with international fetish visitors. Camaraderie at the upstairs bar matters as much as the cruising and play areas below.',
      'dress_code', 'Friday''s masculine code accepts dark jeans, a plain dark or white tee and boots or trainers, alongside fetish gear. Bright or feminine clothing, sandals and underwear alone are excluded. Other events can be stricter, and the cashier''s interpretation is final; minimum-effort compliance may fail.',
      'staff_inclusivity', 'Most guests praise friendly volunteers, clean play areas and a rare sense of community; current reviews also include rude or aggressive door encounters. Consent, free condoms, phone-free rooms and a zero-drug policy are concrete safeguards, but respectful delivery at the entrance is not universal.',
      'source_urls', to_jsonb(array[
        'https://slm-cph.dk/',
        'https://slm-cph.dk/information',
        'https://slm-cph.dk/dresscode',
        'https://slm-cph.dk/blivmedlem',
        'https://members.slm-cph.dk/',
        'https://wanderlog.com/place/details/1373027',
        'https://www.reddit.com/r/askgaybros/comments/1srm8v3/sauna_in_copenhagen/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://slm-cph.dk/information','https://slm-cph.dk/blivmedlem','https://slm-cph.dk/dresscode']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://slm-cph.dk/','https://members.slm-cph.dk/','https://www.reddit.com/r/askgaybros/comments/1srm8v3/sauna_in_copenhagen/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://slm-cph.dk/','https://slm-cph.dk/blivmedlem','https://wanderlog.com/place/details/1373027']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://slm-cph.dk/dresscode','https://slm-cph.dk/information']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://slm-cph.dk/information','https://wanderlog.com/place/details/1373027','https://slm-cph.dk/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (81::bigint, jsonb_build_object(
      'queue_wait', 'Check-in and lockers replace a nightclub queue, and the three-floor layout absorbs a fair number of guests. Friday and Saturday after the bars close are the busiest. The entrance is set back behind the glass door at Studiestræde 31A, so finding it can take longer than getting in.',
      'best_nights', 'Friday and Saturday run until 7 am and offer the strongest late-night crowd; Tuesday through Thursday and Sunday close at 4. Summer brings more tourists. If you want the rooms active rather than simply available, arrive after nearby bars build momentum instead of at the 2 pm opening.',
      'crowd_mix', 'Local men share the club with gay travellers, particularly in summer, across a broad adult age range. The venue explicitly welcomes men and transgender guests. It is a direct cruising venue with private cabins and play rooms, not a wellness sauna or a general mixed-gender spa.',
      'dress_code', 'Street clothes go into one of the many lockers; inside, towel, underwear or nudity fits the adult-sauna format. There is no fetish dress requirement. Bring shower footwear and only what you need, and approach the building discreetly because the entrance is deliberately not mapped like a normal storefront.',
      'staff_inclusivity', 'The explicit transgender-welcome policy is unusually clear. Facility quality is much less reassuring: recent visitors describe musty air, sticky floors, weak sauna heat and neglect. The large play layout may still suit some guests, but inclusion on paper does not resolve hygiene and maintenance concerns.',
      'source_urls', to_jsonb(array[
        'https://amigosauna.dk/home/about-us/',
        'https://www.gayout.com/europe/denmark/copenhagen/saunas/sauna-club-amigo-copenhagen',
        'https://www.gayplaces.co/city/copenhagen/sauna/amigo-sauna',
        'https://www.reddit.com/r/gaytravel/comments/1up2et9/copenhagen_end_of_august/',
        'https://www.reddit.com/r/askgaybros/comments/1srm8v3/sauna_in_copenhagen/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://amigosauna.dk/home/about-us/','https://www.gayplaces.co/city/copenhagen/sauna/amigo-sauna']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://amigosauna.dk/home/about-us/','https://www.gayplaces.co/city/copenhagen/sauna/amigo-sauna','https://www.reddit.com/r/askgaybros/comments/1srm8v3/sauna_in_copenhagen/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://amigosauna.dk/home/about-us/','https://www.gayplaces.co/city/copenhagen/sauna/amigo-sauna','https://www.reddit.com/r/gaytravel/comments/1up2et9/copenhagen_end_of_august/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://amigosauna.dk/home/about-us/','https://www.gayplaces.co/city/copenhagen/sauna/amigo-sauna']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://amigosauna.dk/home/about-us/','https://www.gayout.com/europe/denmark/copenhagen/saunas/sauna-club-amigo-copenhagen','https://www.reddit.com/r/askgaybros/comments/1srm8v3/sauna_in_copenhagen/']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (100, 121, 91, 603, 610, 92, 82, 81)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
