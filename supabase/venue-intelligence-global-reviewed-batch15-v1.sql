-- Queer Atlas venue intelligence: global review-led editorial pass, batch 15.
-- Albania and first Algarve accommodation record.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (1636::bigint, jsonb_build_object(
      'queue_wait', 'Ksamil Beach Route is a resort circuit, not one venue. In July and August, expect traffic, scarce parking, boat movement and competition for private loungers rather than a club queue. Reach your chosen beach early; sunset bars are easier once day visitors begin to leave.',
      'best_nights', 'High summer brings the only dependable beach-party rhythm, with sunset drinks, themed events and occasional international DJs. Ksamil is softer and more beach-led than Sarandë’s big clubs. May, June and September suit calm water and dinner better than a promised late-night scene.',
      'crowd_mix', 'Peak season is heavily visitor-led: Albanian and Kosovan holidaymakers, European couples, families and young beach groups all arrive in volume. Locals run much of the tourism economy but are not necessarily the night’s majority. This is mass summer travel, not a queer enclave.',
      'dress_code', 'Swimwear and a cover-up work by day; add clean sandals or trainers and a light evening layer for sunset bars. Individual premium clubs can be more polished, but the route has no shared code. Secure valuables and choose footwear for boats, wet steps and crowded beach paths.',
      'staff_inclusivity', '“Welcoming” describes the destination’s tourism offer, not a verified queer policy across every operator. Service and prices vary sharply between leased beaches. Outside Tirana, visible LGBTQ+ travellers may meet more conservative attitudes, so choose busy places and read the room.',
      'venue_classification', 'editorial_beach_and_nightlife_route',
      'source_urls', to_jsonb(array[
        'https://akt.gov.al/en/tourist_areas/Ksamil-beach/',
        'https://ksamilalbania.com/ksamil-nightlife-guide-from-sunset-cocktails-to-beach-parties/',
        'https://www.tripadvisor.co.uk/Attraction_Review-g4505725-d15325232-Reviews-Ksamil_al-Ksamil_Saranda_Vlore_County.html',
        'https://www.reddit.com/r/AlbaniaTravel/comments/1v8osw2/please_please_help_with_riviera_choice/',
        'https://www.reddit.com/r/travel/comments/1qp0p32/albania_trip/',
        'https://www.nederlandwereldwijd.nl/reisadvies/albanie'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','route_consensus','source_urls',to_jsonb(array['https://akt.gov.al/en/tourist_areas/Ksamil-beach/','https://www.tripadvisor.co.uk/Attraction_Review-g4505725-d15325232-Reviews-Ksamil_al-Ksamil_Saranda_Vlore_County.html','https://www.reddit.com/r/travel/comments/1qp0p32/albania_trip/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','seasonal_route_consensus','source_urls',to_jsonb(array['https://ksamilalbania.com/ksamil-nightlife-guide-from-sunset-cocktails-to-beach-parties/','https://www.reddit.com/r/AlbaniaTravel/comments/1v8osw2/please_please_help_with_riviera_choice/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://akt.gov.al/en/tourist_areas/Ksamil-beach/','https://www.tripadvisor.co.uk/Attraction_Review-g4505725-d15325232-Reviews-Ksamil_al-Ksamil_Saranda_Vlore_County.html','https://www.reddit.com/r/AlbaniaTravel/comments/1v8osw2/please_please_help_with_riviera_choice/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','route_consensus','source_urls',to_jsonb(array['https://ksamilalbania.com/ksamil-nightlife-guide-from-sunset-cocktails-to-beach-parties/','https://akt.gov.al/en/tourist_areas/Ksamil-beach/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','country_context_route','source_urls',to_jsonb(array['https://www.nederlandwereldwijd.nl/reisadvies/albanie','https://www.gov.uk/foreign-travel-advice/albania/safety-and-security','https://rainbowmap.ilga-europe.org/countries/albania/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1642::bigint, jsonb_build_object(
      'queue_wait', 'This is a central five-star hotel, so the practical wait is reception rather than a venue door. Large groups and sports teams can bunch arrivals, yet recent guests still report quick, professional check-in. Ask about early arrival or late departure instead of timing a queue.',
      'best_nights', 'A Friday or Saturday stay puts central restaurants and bars on the doorstep, while the 23rd-floor bar gives an easy pre-dinner drink with a view. Weekdays bring more business traffic. The hotel has no documented queer night, so choose dates around Tirana’s events.',
      'crowd_mix', 'International leisure guests, business travellers, official delegations and occasional teams create an upscale mainstream mix. Visitors dominate more than locals in the bedrooms; Tirana residents also use the bars, spa and meeting spaces. It is not an LGBTQ+-specific hotel.',
      'dress_code', 'Smart casual feels natural in the rooftop bar and public rooms, while ordinary travel clothes are fine at breakfast and reception. There is no advertised guest dress code. Nightlife outfits should pass without drama, but the lobby is a polished, mixed-purpose environment.',
      'staff_inclusivity', 'Service is a consistent strength: current stays praise polite reception, useful concierge advice, flexibility, fast check-in and kind breakfast teams. Location, large rooms and cleanliness score even higher. That is strong general hospitality, though no public queer-specific training claim was found.',
      'venue_classification', 'mainstream_luxury_city_hotel',
      'source_urls', to_jsonb(array[
        'https://www.tripadvisor.com/Hotel_Review-g294446-d10384289-Reviews-Maritim_Hotel_Plaza_Tirana-Tirana_Tirana_County.html',
        'https://www.booking.com/hotel/al/the-plaza-tirana.html',
        'https://www.expedia.co.uk/Tirana-Hotels-Maritim-Hotel-Plaza-Tirana.h12580932.Hotel-Information',
        'https://press.maritim.com/pressreleases/positive-business-development-in-2023-strich-leading-topics-sustainability-and-digitalization-3307804.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Hotel_Review-g294446-d10384289-Reviews-Maritim_Hotel_Plaza_Tirana-Tirana_Tirana_County.html','https://www.booking.com/hotel/al/the-plaza-tirana.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://www.tripadvisor.com/Hotel_Review-g294446-d10384289-Reviews-Maritim_Hotel_Plaza_Tirana-Tirana_Tirana_County.html','https://www.booking.com/hotel/al/the-plaza-tirana.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://press.maritim.com/pressreleases/positive-business-development-in-2023-strich-leading-topics-sustainability-and-digitalization-3307804.pdf','https://www.tripadvisor.com/Hotel_Review-g294446-d10384289-Reviews-Maritim_Hotel_Plaza_Tirana-Tirana_Tirana_County.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://www.tripadvisor.com/Hotel_Review-g294446-d10384289-Reviews-Maritim_Hotel_Plaza_Tirana-Tirana_Tirana_County.html','https://www.booking.com/hotel/al/the-plaza-tirana.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Hotel_Review-g294446-d10384289-Reviews-Maritim_Hotel_Plaza_Tirana-Tirana_Tirana_County.html','https://www.booking.com/hotel/al/the-plaza-tirana.html','https://www.expedia.co.uk/Tirana-Hotels-Maritim-Hotel-Plaza-Tirana.h12580932.Hotel-Information']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1638::bigint, jsonb_build_object(
      'queue_wait', 'Book the tasting menu in advance, especially for Friday, Saturday or a large table. Lunch runs noon–4 pm and dinner 6–10 pm; arriving on time lets the team pace the multi-course story properly. Walk-ins may join a waiting list, but this is not the place to gamble a special meal.',
      'best_nights', 'A weekday dinner gives the room and servers more breathing space, while weekend evenings feel celebratory and sell first. Lunch is a good alternative for the same rural-Albanian ideas beside the park. Seasonal menu language can lag the weather, so ask what is freshest now.',
      'crowd_mix', 'Food-focused Tirana residents, visiting chefs, couples, families and international travellers fill a destination restaurant rather than a nightlife room. Tourists are prominent because of its reputation, but local traditions anchor the experience. There is no evidenced queer-majority crowd.',
      'dress_code', 'The website requests formal dress, yet current guests report everything from shorts and T-shirts to business casual. The practical answer is neat smart casual: polished enough for the tasting menu, breathable enough for Tirana heat. There is no sign of a theatrical door test.',
      'staff_inclusivity', 'Attentive storytelling is the signature: recent diners praise servers and the chef for explaining each regional dish with warmth. Not every course lands equally, and a hot room drew criticism, but hospitality often becomes the meal’s strongest memory. Queer-specific feedback remains limited.',
      'venue_classification', 'mainstream_destination_restaurant',
      'source_urls', to_jsonb(array[
        'https://www.mullixhiu.al/contact',
        'https://www.tripadvisor.co.uk/Restaurant_Review-g294446-d10080738-Reviews-Mullixhiu-Tirana_Tirana_County.html',
        'https://www.gov.uk/foreign-travel-advice/albania/safety-and-security'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.mullixhiu.al/contact','https://www.tripadvisor.co.uk/Restaurant_Review-g294446-d10080738-Reviews-Mullixhiu-Tirana_Tirana_County.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.mullixhiu.al/contact','https://www.tripadvisor.co.uk/Restaurant_Review-g294446-d10080738-Reviews-Mullixhiu-Tirana_Tirana_County.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://www.mullixhiu.al/contact','https://www.tripadvisor.co.uk/Restaurant_Review-g294446-d10080738-Reviews-Mullixhiu-Tirana_Tirana_County.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.mullixhiu.al/contact','https://www.tripadvisor.co.uk/Restaurant_Review-g294446-d10080738-Reviews-Mullixhiu-Tirana_Tirana_County.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Restaurant_Review-g294446-d10080738-Reviews-Mullixhiu-Tirana_Tirana_County.html','https://www.gov.uk/foreign-travel-advice/albania/safety-and-security']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1644::bigint, jsonb_build_object(
      'queue_wait', 'The award-minded cocktail bar is intimate, so weekend pressure is about seats and bartender attention rather than a long club line. Go before 9 pm for an unhurried first drink; later arrivals may stand or wait. Guest shifts and special nights deserve an advance reservation.',
      'best_nights', 'Friday and Saturday carry the most kinetic Blloku mood, while a weekday reveals the bar’s real strength: a conversation-led cocktail built around Albanian ingredients. Follow the current programme for guest bartenders and collaborations rather than assuming a fixed DJ night.',
      'crowd_mix', 'Tirana’s cocktail community, hospitality workers and creative locals mix with expats and international drinks travellers. It is one of the central spaces queer residents mention as comfortable, yet the room remains broadly mixed. Locals provide the identity; visitors amplify its reputation.',
      'dress_code', 'Creative smart casual fits: clean trainers, a good shirt, bold jewellery, a dress or an individual Blloku look. There is no evidenced strict code, and cocktail curiosity carries more weight than luxury branding. Dress to stand comfortably if every stool is taken.',
      'staff_inclusivity', 'Hospitality is central to the venue’s story, and current reviews single out bartenders for warm guidance, memory and technical skill. Queer locals also name it among spaces where identity does not cause friction. Busy service can slow the conversation, so earlier is better for personal attention.',
      'venue_classification', 'mainstream_queer_friendly_cocktail_bar',
      'source_urls', to_jsonb(array[
        'https://nouvellevaguetirana.com/',
        'https://wanderlog.com/place/details/393157/nouvelle-vague-tirana',
        'https://www.reddit.com/r/tirana/comments/1rct9e6/queer_spaces_in_tirana/',
        'https://www.hodolist.com/tirana-tourism/where-to-party-in-tirana/lgbtq-friendly-pubs-to-party-in-tirana'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://nouvellevaguetirana.com/','https://wanderlog.com/place/details/393157/nouvelle-vague-tirana']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','programme_and_review_summary','source_urls',to_jsonb(array['https://nouvellevaguetirana.com/','https://wanderlog.com/place/details/393157/nouvelle-vague-tirana']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://wanderlog.com/place/details/393157/nouvelle-vague-tirana','https://www.reddit.com/r/tirana/comments/1rct9e6/queer_spaces_in_tirana/','https://www.hodolist.com/tirana-tourism/where-to-party-in-tirana/lgbtq-friendly-pubs-to-party-in-tirana']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://nouvellevaguetirana.com/','https://wanderlog.com/place/details/393157/nouvelle-vague-tirana']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_and_local_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/393157/nouvelle-vague-tirana','https://www.reddit.com/r/tirana/comments/1rct9e6/queer_spaces_in_tirana/','https://www.hodolist.com/tirana-tourism/where-to-party-in-tirana/lgbtq-friendly-pubs-to-party-in-tirana']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1647::bigint, jsonb_build_object(
      'queue_wait', 'Earlier drinks are normally easy, but the courtyard and retro rooms can hit capacity on busy weekends. A May 2026 group was turned away despite seeing space, so entry is not always predictable. Reserve for a group or arrive before the late Blloku wave.',
      'best_nights', 'Friday and Saturday deliver the fullest social atmosphere; a weekday makes the vintage radios, Albanian cocktails and conversation easier to enjoy. This is a bar night rather than a guaranteed dance event. Check its current channel for DJs or special programming.',
      'crowd_mix', 'Young Tirana locals, creatives, couples and visitor groups create a mixed, stylish crowd. It has a long gay-friendly reputation and queer residents still recommend it, but it is not exclusively LGBTQ+. Expect more local social texture than at a tourist-only cocktail stop.',
      'dress_code', 'Relaxed Blloku style works: denim, trainers, a sharp top, colour or retro detail. No formal code is published, though a busy host may control capacity. Dress like you belong in a lively cocktail bar, not as if you are auditioning for a bottle-service club.',
      'staff_inclusivity', 'Many guests describe friendly, welcoming people, excellent Albanian-inspired drinks and a room that feels immediately easy. The counterpoint is a fresh complaint about abrupt refusal at the door. Its queer-friendly reputation is meaningful, but no venue deserves a friction-free guarantee.',
      'venue_classification', 'mainstream_queer_friendly_retro_cocktail_bar',
      'source_urls', to_jsonb(array[
        'https://radiobar.al/',
        'https://www.tripadvisor.co.uk/Attraction_Review-g294446-d4701606-Reviews-Radio_Bar_Tirana-Tirana_Tirana_County.html',
        'https://qlist.app/venues/Tirana/Radio-bar-Tirana/R0ZpOW5RRU9pMTJ5Rm9sOU0rMDZyUQ',
        'https://www.spottedbylocals.com/tirana/radio-bar/',
        'https://www.reddit.com/r/tirana/comments/1rct9e6/queer_spaces_in_tirana/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Attraction_Review-g294446-d4701606-Reviews-Radio_Bar_Tirana-Tirana_Tirana_County.html','https://radiobar.al/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://radiobar.al/','https://www.tripadvisor.co.uk/Attraction_Review-g294446-d4701606-Reviews-Radio_Bar_Tirana-Tirana_Tirana_County.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','local_and_review_consensus','source_urls',to_jsonb(array['https://www.spottedbylocals.com/tirana/radio-bar/','https://qlist.app/venues/Tirana/Radio-bar-Tirana/R0ZpOW5RRU9pMTJ5Rm9sOU0rMDZyUQ','https://www.reddit.com/r/tirana/comments/1rct9e6/queer_spaces_in_tirana/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://radiobar.al/','https://www.tripadvisor.co.uk/Attraction_Review-g294446-d4701606-Reviews-Radio_Bar_Tirana-Tirana_Tirana_County.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_and_local_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Attraction_Review-g294446-d4701606-Reviews-Radio_Bar_Tirana-Tirana_Tirana_County.html','https://www.spottedbylocals.com/tirana/radio-bar/','https://qlist.app/venues/Tirana/Radio-bar-Tirana/R0ZpOW5RRU9pMTJ5Rm9sOU0rMDZyUQ']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1639::bigint, jsonb_build_object(
      'queue_wait', 'This established city hotel has normal reception flow rather than a venue queue. Congresses and official events can make the lobby busier, but current stays praise professional check-in. The garden and pool create the real capacity pressure in warm weather, not the front door.',
      'best_nights', 'Weekends suit a slower pool-and-garden stay near the Pyramid and Blloku; weekdays bring a business and diplomatic rhythm. There is no documented queer party inside. Use the hotel as a calm base, then walk to central bars whose current programme matches your night.',
      'crowd_mix', 'Diplomatic, business and conference guests mix with international couples and city-break travellers. Tirana residents also use events and the green courtyard. It is a mainstream upscale hotel with a more institutional local presence than a resort, not an LGBTQ+ social hotel.',
      'dress_code', 'Travel casual works at breakfast and the pool; smart casual fits meetings and public lounges. No guest-wide code is advertised. Clubwear on return should be ordinary city-hotel behaviour, but the shared lobby can include formal functions, delegations and families.',
      'staff_inclusivity', 'Guests consistently value the professional team, central position, expansive breakfast and unusually spacious garden and pool. That creates a reassuring general service signal. Public material does not establish queer-specific training, so the rating should reflect hospitality rather than inferred identity expertise.',
      'venue_classification', 'mainstream_business_and_leisure_hotel',
      'source_urls', to_jsonb(array[
        'https://www.booking.com/hotel/al/rogner-europark.en-gb.html',
        'https://www.tripadvisor.com/Hotel_Review-g294446-d305945-Reviews-Rogner_Hotel_Tirana-Tirana_Tirana_County.html',
        'https://www.ripe.net/media/documents/Tirana_Travel_Guide.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.booking.com/hotel/al/rogner-europark.en-gb.html','https://www.tripadvisor.com/Hotel_Review-g294446-d305945-Reviews-Rogner_Hotel_Tirana-Tirana_Tirana_County.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://www.booking.com/hotel/al/rogner-europark.en-gb.html','https://www.ripe.net/media/documents/Tirana_Travel_Guide.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://www.booking.com/hotel/al/rogner-europark.en-gb.html','https://www.ripe.net/media/documents/Tirana_Travel_Guide.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://www.booking.com/hotel/al/rogner-europark.en-gb.html','https://www.tripadvisor.com/Hotel_Review-g294446-d305945-Reviews-Rogner_Hotel_Tirana-Tirana_Tirana_County.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.booking.com/hotel/al/rogner-europark.en-gb.html','https://www.tripadvisor.com/Hotel_Review-g294446-d305945-Reviews-Rogner_Hotel_Tirana-Tirana_Tirana_County.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1645::bigint, jsonb_build_object(
      'queue_wait', 'Gallery visits during published hours rarely involve a line; ticketed concerts, talks and openings can fill the independent space. The calendar, not the weekday, controls arrival. For a named event, go early enough to meet people in the courtyard rather than rushing in at start time.',
      'best_nights', 'Exhibition openings, alternative concerts and socially engaged programmes are the nights worth choosing. Ordinary Monday-to-Saturday hours are short and split between morning and early evening, so this is not a spontaneous late club. Read the current event page before travelling.',
      'crowd_mix', 'Young Tirana artists, students, families in visual-arts programmes, cultural workers and international creatives make up a locally rooted audience. Queer people appear within that alternative ecosystem, but each event shapes its own crowd. Tourists are guests rather than the main engine.',
      'dress_code', 'Art-space freedom rules: denim, trainers, experimental looks, work clothes and understated black all belong. There is no published dress test. Wear something comfortable for standing through an opening or courtyard event, and let the programme—not luxury nightlife—set the tone.',
      'staff_inclusivity', 'The centre defines itself through alternative culture, public dialogue and work on identity and social questions. Current visitors call it authentic and inspiring, while queer guides include it among welcoming choices. That is a strong inclusion signal, though event-specific safeguarding should still be checked.',
      'venue_classification', 'independent_queer_friendly_culture_center',
      'source_urls', to_jsonb(array[
        'https://tulla.tv/',
        'https://akt.gov.al/en/art-gallery/brick-cultural-center/',
        'https://wanderlog.com/place/details/4457623/tulla-culture-center',
        'https://www.hodolist.com/tirana-tourism/where-to-party-in-tirana/lgbtq-friendly-pubs-to-party-in-tirana',
        'https://unaalbania.org/wp-content/uploads/2023/10/UNAA-Annual-Report-2022.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','programme_specific_guidance','source_urls',to_jsonb(array['https://tulla.tv/','https://akt.gov.al/en/art-gallery/brick-cultural-center/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_programme','source_urls',to_jsonb(array['https://tulla.tv/','https://wanderlog.com/place/details/4457623/tulla-culture-center']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://akt.gov.al/en/art-gallery/brick-cultural-center/','https://tulla.tv/','https://unaalbania.org/wp-content/uploads/2023/10/UNAA-Annual-Report-2022.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://tulla.tv/','https://wanderlog.com/place/details/4457623/tulla-culture-center']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','mission_and_community_consensus','source_urls',to_jsonb(array['https://akt.gov.al/en/art-gallery/brick-cultural-center/','https://www.hodolist.com/tirana-tourism/where-to-party-in-tirana/lgbtq-friendly-pubs-to-party-in-tirana','https://wanderlog.com/place/details/4457623/tulla-culture-center']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1761::bigint, jsonb_build_object(
      'queue_wait', 'This adults-only design hotel has conventional reception, not a club entrance. The real competition is for loungers around the compact pool: rules limit unattended reservations, but guests say enforcement varies. Check in, then claim space by actually using it rather than leaving a towel.',
      'best_nights', 'Tuesday and Saturday have recently carried limited live entertainment, while the nearby Strip supplies louder nightlife any evening. The hotel works best as a quiet return point after going out. Choose shoulder season or weekdays if calm matters more than stag-and-hen energy.',
      'crowd_mix', 'Adult couples, friends and package travellers from across Europe dominate, with occasional hen and stag groups changing the pool mood. This is international holiday accommodation rather than a local scene. “Adults friendly” means 18+, not an LGBTQ+ identity or a queer-majority crowd.',
      'dress_code', 'Swimwear belongs at the pool; add a cover-up and footwear indoors, with resort-casual clothing at breakfast and the bar. There is no formal hotel code. Pack nightlife clothes for Albufeira separately—the relaxed property is designed as a retreat from the Strip, not an extension of it.',
      'staff_inclusivity', 'Fresh 2026 stays repeatedly praise smiling reception, meticulous housekeeping and friendly pool-bar teams. Cleanliness and calm are major strengths. Lounger disputes, limited room storage, expensive drinks and rowdy groups are the recurring cautions, not a pattern of hostile service.',
      'venue_classification', 'mainstream_adults_only_design_hotel',
      'source_urls', to_jsonb(array[
        'https://aquapedradosbicoshotel.com/',
        'https://www.tripadvisor.com/Hotel_Review-g189112-d1191947-Reviews-Aqua_Pedra_dos_Bicos_Design_Beach_Hotel-Albufeira_Faro_District_Algarve.html',
        'https://www.booking.com/hotel/pt/aqua-pedra-dos-bicos.pt-br.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://aquapedradosbicoshotel.com/','https://www.tripadvisor.com/Hotel_Review-g189112-d1191947-Reviews-Aqua_Pedra_dos_Bicos_Design_Beach_Hotel-Albufeira_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Hotel_Review-g189112-d1191947-Reviews-Aqua_Pedra_dos_Bicos_Design_Beach_Hotel-Albufeira_Faro_District_Algarve.html','https://aquapedradosbicoshotel.com/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://aquapedradosbicoshotel.com/','https://www.tripadvisor.com/Hotel_Review-g189112-d1191947-Reviews-Aqua_Pedra_dos_Bicos_Design_Beach_Hotel-Albufeira_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://aquapedradosbicoshotel.com/','https://www.booking.com/hotel/pt/aqua-pedra-dos-bicos.pt-br.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Hotel_Review-g189112-d1191947-Reviews-Aqua_Pedra_dos_Bicos_Design_Beach_Hotel-Albufeira_Faro_District_Algarve.html','https://www.booking.com/hotel/pt/aqua-pedra-dos-bicos.pt-br.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (1636, 1642, 1638, 1644, 1647, 1639, 1645, 1761)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
