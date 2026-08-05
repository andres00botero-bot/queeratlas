-- Queer Atlas venue intelligence: global review-led editorial pass, batch 3.
-- Rio de Janeiro, Bangkok, Cape Town, Hanoi, Gran Canaria, Sao Paulo,
-- Quito, Salvador and Malmo.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (802::bigint, jsonb_build_object(
      'queue_wait', 'The club does not truly wake up until after midnight, yet big guest nights can produce a huge line before then. Recent guests accuse the door of holding entry even while the floor is quiet, so a ticket does not always mean a quick arrival.',
      'best_nights', 'Choose by the guest: drag stars, live pop acts, watch parties and themed Fridays or Saturdays are the real engine. A major booking brings the fullest Rio spectacle; a regular date gives you more space to enjoy the resident hosts.',
      'crowd_mix', 'Young Carioca queer nightlife leads the room, joined by Brazilian visitors and international drag fans. The audience is broad across LGBTQ+ identities, with headline bookings pulling a more tourist-visible crowd than an ordinary local party.',
      'dress_code', 'This is a stage-conscious pop club, so colour, body, sparkle and camera-ready looks all make sense—but uncomplicated clubwear is welcome too. There is no dependable published fashion code; bring valid ID and dress for Rio heat.',
      'staff_inclusivity', 'The drag hosts at the entrance and performers receive genuine praise. Bar service and crowd management draw much rougher recent feedback, including rudeness and poorly handled VIP lines; the artistic welcome is stronger than the operational consistency.',
      'source_urls', to_jsonb(array[
        'https://linktr.ee/pinkflamingorio',
        'https://www.tripadvisor.com.br/Attraction_Review-g303506-d20053802-Reviews-Pink_Flamingo-Rio_de_Janeiro_State_of_Rio_de_Janeiro.html',
        'https://www.reddit.com/r/riodejaneiro/comments/1d269lh/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com.br/Attraction_Review-g303506-d20053802-Reviews-Pink_Flamingo-Rio_de_Janeiro_State_of_Rio_de_Janeiro.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://linktr.ee/pinkflamingorio','https://www.tripadvisor.com.br/Attraction_Review-g303506-d20053802-Reviews-Pink_Flamingo-Rio_de_Janeiro_State_of_Rio_de_Janeiro.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://linktr.ee/pinkflamingorio','https://www.reddit.com/r/riodejaneiro/comments/1d269lh/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://linktr.ee/pinkflamingorio','https://www.tripadvisor.com.br/Attraction_Review-g303506-d20053802-Reviews-Pink_Flamingo-Rio_de_Janeiro_State_of_Rio_de_Janeiro.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com.br/Attraction_Review-g303506-d20053802-Reviews-Pink_Flamingo-Rio_de_Janeiro_State_of_Rio_de_Janeiro.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (538::bigint, jsonb_build_object(
      'queue_wait', 'Weeknights can mean only a few people ahead; Friday and Saturday become packed enough that movement inside is the bigger problem. Arrive before the midnight drag show, carry original photo ID and use the bag check rather than fighting the crowd with luggage.',
      'best_nights', 'The midnight drag show is the nightly hinge, after which all three levels heat up. A weekday still feels alive and gives you room to explore; Friday and Saturday are the landmark experience if you can handle a shoulder-to-shoulder floor.',
      'crowd_mix', 'Young Thai gay men form the core, with Asian regional travellers, expats and Western visitors folded in. It is internationally famous without becoming a tourist-only room; different music zones make the mix feel less uniform.',
      'dress_code', 'Tank tops and shorts are accepted, but flip-flops are not. Keep it neat, light and dance-ready, bring valid 20+ ID and remember that stairs and level changes make secure footwear more than a fashion detail.',
      'staff_inclusivity', 'Bar and floor teams are often called friendly and professional, while door staff receive colder reviews. The crowd itself is widely described as open and easy to join; strict ID checks and weekend pressure can make the entrance feel less warm.',
      'source_urls', to_jsonb(array[
        'https://www.travelgay.com/venue/dj-station',
        'https://bangkok.gaycities.com/bars/303075-dj-station',
        'https://wanderlog.com/place/details/872681',
        'https://gayandasia.com/en/venue/review/djstation',
        'https://www.tripadvisor.com.au/Attraction_Review-g293916-d2619760-Reviews-DJ_Station-Bangkok.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/dj-station','https://gayandasia.com/en/venue/review/djstation','https://wanderlog.com/place/details/872681']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.travelgay.com/venue/dj-station','https://wanderlog.com/place/details/872681']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/dj-station','https://bangkok.gaycities.com/bars/303075-dj-station']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.travelgay.com/venue/dj-station']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/dj-station','https://www.tripadvisor.com.au/Attraction_Review-g293916-d2619760-Reviews-DJ_Station-Bangkok.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1317::bigint, jsonb_build_object(
      'queue_wait', 'Walk-ins are welcome, but the window booth and weekend terrace go fast. Book if a particular table matters; otherwise arrive before the dinner-to-drinks turn and let the evening build around you rather than waiting for a late club door.',
      'best_nights', 'Thursday brings a house DJ and cheap shots; drag, disco and karaoke dates add the bigger queer spark. Daytime or early evening is best for food and conversation, while the weekend terrace gives this historic corner its most social face.',
      'crowd_mix', 'Cape Town LGBTQI+ regulars share the tables with South African visitors and international travellers staying around De Waterkant. All genders and orientations are welcome, and the room reads as a genuine local meeting place rather than a tourist exhibit.',
      'dress_code', 'There is officially no dress code: come as you are. Day-to-night casual, dinner polish and a more expressive drag-event look all belong; after 9 pm the actual door requirement is being 18+ with valid ID.',
      'staff_inclusivity', 'Queer ownership and an explicit open-door policy give the welcome real substance. Most reviews praise warm, fun service, though recent criticism asks for more attentive hospitality; inclusion is clear, service execution not flawless.',
      'source_urls', to_jsonb(array[
        'https://cafemanhattan.co.za/',
        'https://www.tripadvisor.com/Restaurant_Review-g312659-d2305572-Reviews-Cafe_Manhattan-Cape_Town_Central_Western_Cape.html',
        'https://wanderlog.com/place/details/878966/cafe-manhattan',
        'https://grow.google/intl/ssa-en/story/cafe-manhattan/',
        'https://www.reddit.com/r/capetown/comments/1u7lls3/any_lgbtq_places_to_visit_in_cape_town/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://cafemanhattan.co.za/','https://www.tripadvisor.com/Restaurant_Review-g312659-d2305572-Reviews-Cafe_Manhattan-Cape_Town_Central_Western_Cape.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://cafemanhattan.co.za/','https://wanderlog.com/place/details/878966/cafe-manhattan']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Restaurant_Review-g312659-d2305572-Reviews-Cafe_Manhattan-Cape_Town_Central_Western_Cape.html','https://grow.google/intl/ssa-en/story/cafe-manhattan/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://cafemanhattan.co.za/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://cafemanhattan.co.za/','https://www.tripadvisor.com/Restaurant_Review-g312659-d2305572-Reviews-Cafe_Manhattan-Cape_Town_Central_Western_Cape.html','https://wanderlog.com/place/details/878966/cafe-manhattan']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1383::bigint, jsonb_build_object(
      'queue_wait', 'A quiet early room can turn into barely-any-standing-space on the right weekend. Friday and Saturday near 11 pm bring the pressure; recent Saturday reviews also describe reserved tables and bottle expectations, so ask before settling in.',
      'best_nights', 'Friday and Saturday remain the best chance of seeing the bar in full social mode, but they can be smoky, loud and uneven. Earlier or Sunday hours work better for cocktails and conversation when the goal is meeting people rather than chasing a packed room.',
      'crowd_mix', 'Hanoian gay men, expats and foreign visitors make up the historic core, with women and mixed queer-friendly groups also appearing. The balance swings dramatically: one night can feel like a local institution, the next like a sparse neighbourhood bar.',
      'dress_code', 'Everyday nightlife clothes are enough—there is no reliable fashion-door pattern. Wear something you do not mind carrying or taking home smoky, because indoor smoking and limited coat space are recurring practical complaints.',
      'staff_inclusivity', 'This is the most divided topic. Friendly bartenders, strong cocktails and fast busy-night service appear beside recent reports of being ignored, pushed toward bottle spend or treated coldly. Queer history does not guarantee a warm shift.',
      'source_urls', to_jsonb(array[
        'https://www.travelgay.com/venue/gc-bar-golden-cock',
        'https://wanderlog.com/place/details/2452407/bar-gc',
        'https://www.tripadvisor.com.au/Attraction_Review-g293924-d12078873-Reviews-GC_Bar-Hanoi.html',
        'https://gayandasia.com/en/venue/review/goldencock',
        'https://www.foody.vn/ha-noi/gc-bar/binh-luan'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2452407/bar-gc','https://gayandasia.com/en/venue/review/goldencock','https://www.foody.vn/ha-noi/gc-bar/binh-luan']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/gc-bar-golden-cock','https://www.tripadvisor.com.au/Attraction_Review-g293924-d12078873-Reviews-GC_Bar-Hanoi.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/gc-bar-golden-cock','https://www.foody.vn/ha-noi/gc-bar/binh-luan']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2452407/bar-gc','https://www.tripadvisor.com.au/Attraction_Review-g293924-d12078873-Reviews-GC_Bar-Hanoi.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2452407/bar-gc','https://www.tripadvisor.com.au/Attraction_Review-g293924-d12078873-Reviews-GC_Bar-Hanoi.html','https://www.travelgay.com/venue/gc-bar-golden-cock']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (112::bigint, jsonb_build_object(
      'queue_wait', 'The club runs late enough that 2 am is the beginning, not the finale. Reports praise efficient queues, but recent complaints describe being held outside and unclear admission charges. Ask what the ticket includes before paying and keep the answer specific.',
      'best_nights', 'It opens nightly from 2 to 6 am, making it the natural final stop after the Yumbo bars. A busy Friday or Saturday gives the full international-house floor; a weekday is the better test if dancing matters more than peak-season density.',
      'crowd_mix', 'Gay men from the island mix deliberately with holidaymakers, and the venue openly presents both groups as its community. Residents anchor the room year-round; European visitors become especially visible in winter sun, Pride and major holiday periods.',
      'dress_code', 'Late-night dancewear is the norm, with a dark room and cabins adding a more sexual edge without creating a published fetish requirement. Secure shoes and a light layer make sense; clarify any event-specific door rule before joining the line.',
      'staff_inclusivity', 'The club is gay-managed and frames itself as a safe meeting point; many guests report friendly staff. Serious recent reviews allege rude selection and misleading prices, so verify the entry deal and do not confuse queer ownership with guaranteed fair treatment.',
      'source_urls', to_jsonb(array[
        'https://www.mantrixyumbo.com/en/disco.html',
        'https://www.tripadvisor.com/Attraction_Review-g187471-d20249057-Reviews-Mantrix-Gran_Canaria_Canary_Islands.html',
        'https://whereis.gay/mantrix'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g187471-d20249057-Reviews-Mantrix-Gran_Canaria_Canary_Islands.html','https://whereis.gay/mantrix']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.mantrixyumbo.com/en/disco.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.mantrixyumbo.com/en/disco.html','https://whereis.gay/mantrix']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.mantrixyumbo.com/en/disco.html','https://whereis.gay/mantrix']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.mantrixyumbo.com/en/disco.html','https://www.tripadvisor.com/Attraction_Review-g187471-d20249057-Reviews-Mantrix-Gran_Canaria_Canary_Islands.html','https://whereis.gay/mantrix']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (858::bigint, jsonb_build_object(
      'queue_wait', 'After midnight, a real entrance line is common. Earlier arrival makes the paper-tab payment system and multi-level layout easier to understand before the headline show; closing the tab can be its own bottleneck, so check every mark as you go.',
      'best_nights', 'Saturday is the classic drag-production night, with occasional Sunday matinees offering a different, earlier rhythm. Go for a named queen or themed party rather than only the DJ: the stage, not generic electronic music, is what makes this institution singular.',
      'crowd_mix', 'LGBTQIA+ Paulistanos across ages fill the house alongside allies and visitors from elsewhere in Brazil. Multiple floors and a long reputation create a broader crowd than a niche club, though drag devotees are the emotional centre.',
      'dress_code', 'Expressive São Paulo clubwear fits naturally, but there is no documented runway test. Bring official photo ID, choose shoes that can manage many stairs and keep enough comfort for performances that run deep into the night.',
      'staff_inclusivity', 'Guests often praise reception, security and an all-welcome atmosphere; individual bartenders receive more mixed reports. Accessibility is the clearer weakness: repeated stairs make the otherwise inclusive multi-level space difficult for some bodies.',
      'source_urls', to_jsonb(array[
        'https://www.locaisdobrasil.com.br/encontre/casa-noturna/sao-paulo-sp/blue-space/646766c06f16b70535a5efbe',
        'https://www.gayout.com/south-america/brazil/avenida-sao-joao-555-center/bars/blue-space',
        'https://www.benditoguia.com.br/empresa/blue-space-barra-funda-sao-paulo',
        'https://avaliacoesbrasil.com/casa-noturna/sao-paulo/blue-space/',
        'https://www.tripadvisor.com.br/FAQ-g303631-d10063957-Blue_Space.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.gayout.com/south-america/brazil/avenida-sao-joao-555-center/bars/blue-space','https://www.locaisdobrasil.com.br/encontre/casa-noturna/sao-paulo-sp/blue-space/646766c06f16b70535a5efbe']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.gayout.com/south-america/brazil/avenida-sao-joao-555-center/bars/blue-space','https://www.locaisdobrasil.com.br/encontre/casa-noturna/sao-paulo-sp/blue-space/646766c06f16b70535a5efbe']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.locaisdobrasil.com.br/encontre/casa-noturna/sao-paulo-sp/blue-space/646766c06f16b70535a5efbe','https://www.benditoguia.com.br/empresa/blue-space-barra-funda-sao-paulo']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.tripadvisor.com.br/FAQ-g303631-d10063957-Blue_Space.html','https://www.locaisdobrasil.com.br/encontre/casa-noturna/sao-paulo-sp/blue-space/646766c06f16b70535a5efbe']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.locaisdobrasil.com.br/encontre/casa-noturna/sao-paulo-sp/blue-space/646766c06f16b70535a5efbe','https://www.benditoguia.com.br/empresa/blue-space-barra-funda-sao-paulo','https://avaliacoesbrasil.com/casa-noturna/sao-paulo/blue-space/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (722::bigint, jsonb_build_object(
      'queue_wait', 'Friday gets busy enough that early entry helps, especially if you want easy bar access or a place to sit in the small outdoor area. The narrow, sometimes slippery stairs are a more consistent practical issue than a documented marathon queue.',
      'best_nights', 'Friday is the strongest recurring signal, with Saturday also carrying live-show and open-bar energy. Arrive for the advertised early offer, then stay for the mix of current hits, 80s and 90s throwbacks and Latino pop.',
      'crowd_mix', 'Young LGBTQ+ Quiteños lead a lively, friend-group atmosphere, with some regional and international visitors. The music travels across eras rather than subcultures, creating a social gay-friendly club instead of an underground or men-only room.',
      'dress_code', 'Relaxed, youthful clubwear works: denim, trainers, a sharper date-night look or bright pop styling. No reliable source establishes a strict clothing door, but stable shoes are smart for the venue’s narrow stairs.',
      'staff_inclusivity', 'Friendly staff and an easygoing atmosphere recur across the available review set. The evidence base is smaller than for major world clubs, so treat that as a strong current community signal—not a guarantee about every door or shift.',
      'source_urls', to_jsonb(array[
        'https://wanderlog.com/place/details/10403761/la-disco-bitch',
        'https://www.tripadvisor.com.mx/Attraction_Review-g294308-d33101698-Reviews-La_Disco_Bitch-Quito_Pichincha_Province.html',
        'https://www.instagram.com/discobtch1/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/10403761/la-disco-bitch','https://www.tripadvisor.com.mx/Attraction_Review-g294308-d33101698-Reviews-La_Disco_Bitch-Quito_Pichincha_Province.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/10403761/la-disco-bitch','https://www.instagram.com/discobtch1/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/10403761/la-disco-bitch','https://www.tripadvisor.com.mx/Attraction_Review-g294308-d33101698-Reviews-La_Disco_Bitch-Quito_Pichincha_Province.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/10403761/la-disco-bitch','https://www.instagram.com/discobtch1/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/10403761/la-disco-bitch']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1801::bigint, jsonb_build_object(
      'queue_wait', 'A hot Saturday can leave the upper floor over capacity and movement nearly impossible. Different tickets and wristbands may control access between the main club and open-bar area, so confirm the zones before entry rather than discovering the rule at security.',
      'best_nights', 'Friday and Saturday are the reliable late-night choices; drag, electronic sets and go-go performances supply the destination energy. Choose the announced party and its music rooms carefully, because the event format changes more than the address suggests.',
      'crowd_mix', 'Gay men from Salvador are the main current, joined by local queer friends, straight allies and Brazilian travellers. Some historic reviews put men at an overwhelming majority on Saturdays, but event and room can broaden the mix considerably.',
      'dress_code', 'Polished but breathable clubwear suits the two-floor setup: fitted looks, colour and dance-ready shoes all work. No stable formal code is published; the more important preparation is knowing your ticket zone and carrying valid ID.',
      'staff_inclusivity', 'Many guests describe respectful treatment and a well-run queer party, while others report rude security, weak bar service and unclear wristband rules. Inclusion on the dance floor is stronger than the consistency of operational communication.',
      'source_urls', to_jsonb(array[
        'https://restaurantguru.com.br/San-Sebastian-Salvador',
        'https://www.tripadvisor.com.br/Attraction_Review-g303272-d7374103-Reviews-San_Sebastian_Salvador-Salvador_State_of_Bahia.html',
        'https://www.reclameaqui.com.br/san-sebastian-salvador/descaso-no-atendimento_YDk0ye2gfS59WT9/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com.br/Attraction_Review-g303272-d7374103-Reviews-San_Sebastian_Salvador-Salvador_State_of_Bahia.html','https://www.reclameaqui.com.br/san-sebastian-salvador/descaso-no-atendimento_YDk0ye2gfS59WT9/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://restaurantguru.com.br/San-Sebastian-Salvador','https://www.tripadvisor.com.br/Attraction_Review-g303272-d7374103-Reviews-San_Sebastian_Salvador-Salvador_State_of_Bahia.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com.br/Attraction_Review-g303272-d7374103-Reviews-San_Sebastian_Salvador-Salvador_State_of_Bahia.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://restaurantguru.com.br/San-Sebastian-Salvador','https://www.tripadvisor.com.br/Attraction_Review-g303272-d7374103-Reviews-San_Sebastian_Salvador-Salvador_State_of_Bahia.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com.br/Attraction_Review-g303272-d7374103-Reviews-San_Sebastian_Salvador-Salvador_State_of_Bahia.html','https://www.reclameaqui.com.br/san-sebastian-salvador/descaso-no-atendimento_YDk0ye2gfS59WT9/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1718::bigint, jsonb_build_object(
      'queue_wait', 'Winter nights can funnel everyone through one indoor bar and create a long line; summer opens more outdoor breathing space. Ticketed concerts and major club editions deserve early arrival, especially if a clear sightline matters.',
      'best_nights', 'Choose the programme, not the venue name. Queer highlights include Pride collaborations and MENA-centred club nights; other dates can be metal, hip-hop, indie or nostalgic pop, each producing a completely different Plan B.',
      'crowd_mix', 'Malmö music regulars and a notably young alternative crowd form the base, with queer communities becoming the centre on dedicated nights. Regional visitors and Copenhagen-connected audiences appear for bigger artists, but this is not queer-only every weekend.',
      'dress_code', 'Rough-edged gig clothes, club looks and full Pride fantasy can all fit—match the event and wear shoes made for concrete and standing. The published queer programme explicitly welcomes both come-as-you-are and dressed-to-impress energy.',
      'staff_inclusivity', 'Queer event partnerships and a broad booking policy create strong programme-level inclusion. Staff reviews themselves are mixed—some call the team friendly and well organised, others stand-offish—while sound, ventilation and sightlines vary sharply by stage.',
      'source_urls', to_jsonb(array[
        'https://www.planbmalmo.com/',
        'https://www.planbmalmo.com/faq',
        'https://www.malmopride.com/program2026',
        'https://www.planbmalmo.com/events/habibi-klubb-x-malm-pride/bnVkBeloip',
        'https://wanderlog.com/place/details/1822394/plan-b',
        'https://www.reddit.com/r/Malmoe/comments/1g5krcs/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1822394/plan-b','https://www.reddit.com/r/Malmoe/comments/1g5krcs/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.planbmalmo.com/','https://www.malmopride.com/program2026','https://www.planbmalmo.com/events/habibi-klubb-x-malm-pride/bnVkBeloip']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1822394/plan-b','https://www.reddit.com/r/Malmoe/comments/1g5krcs/','https://www.malmopride.com/program2026']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.malmopride.com/program2026','https://www.planbmalmo.com/events/habibi-klubb-x-malm-pride/bnVkBeloip']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.malmopride.com/program2026','https://wanderlog.com/place/details/1822394/plan-b','https://www.reddit.com/r/Malmoe/comments/1g5krcs/']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (802, 538, 1317, 1383, 112, 858, 722, 1801, 1718)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 9 then
    raise exception 'Expected 9 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
