-- Queer Atlas venue intelligence: global review-led editorial pass, batch 14.
-- Albania and Tirana. Routes are explicitly separated from operating venues.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (1637::bigint, jsonb_build_object(
      'queue_wait', 'Blloku is a walkable nightlife district, not one door. Cocktail bars are usually easy early; fashionable clubs become reservation- and table-led after midnight, and groups of men can face stricter entry. Start with a bar around 9–10 pm, then judge each doorway in person.',
      'best_nights', 'Friday and Saturday carry the strongest bar-to-club flow, while Thursday works for cocktails with less door pressure. Sunday is notably quieter. The neighbourhood stays active late, but the useful move is to follow the busy rooms rather than commit to one club before seeing the night.',
      'crowd_mix', 'Young Tirana locals set the style, joined by Albanian diaspora, expats and a growing visitor crowd. Bars feel more local than the city’s tourism numbers suggest; premium clubs tilt image-conscious. Queer people are present, but Blloku is mixed nightlife, not a gay district.',
      'dress_code', 'Smart casual is the safest bridge across the route: clean trainers, a considered shirt or top and confident evening layers. Cocktail bars are relaxed; high-status clubs may favour reservations, mixed groups and a polished look. There is no single district dress code.',
      'staff_inclusivity', 'Many central bars are described as open-minded, but inclusion varies door by door and Tirana has few permanent LGBTQ+ venues. Same-sex relationships are legal; visible queer travellers may still meet social conservatism. Keep affection situational and favour busy, well-reviewed rooms.',
      'venue_classification', 'editorial_neighbourhood_nightlife_route',
      'source_urls', to_jsonb(array[
        'https://akt.gov.al/en/atraksionet/blloku/',
        'https://www.directoryalbania.com/article-blloku.html',
        'https://www.reddit.com/r/tirana/comments/1td5y79/nightlife_in_tirana/',
        'https://www.reddit.com/r/tirana/comments/1tpknk8/good_nightlife_areas_in_tirana/',
        'https://www.gov.uk/foreign-travel-advice/albania/safety-and-security',
        'https://www.hodolist.com/tirana-tourism/where-to-party-in-tirana/lgbtq-friendly-pubs-to-party-in-tirana'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','route_consensus','source_urls',to_jsonb(array['https://akt.gov.al/en/atraksionet/blloku/','https://www.reddit.com/r/tirana/comments/1tpknk8/good_nightlife_areas_in_tirana/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','route_consensus','source_urls',to_jsonb(array['https://www.reddit.com/r/tirana/comments/1td5y79/nightlife_in_tirana/','https://www.reddit.com/r/tirana/comments/1uubrd9/whats_going_on_in_tirana/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://akt.gov.al/en/atraksionet/blloku/','https://www.directoryalbania.com/article-blloku.html','https://www.reddit.com/r/tirana/comments/1nh6ogh/is_there_any_bar_or_club_in_tirana_with_lgtbq/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','route_consensus','source_urls',to_jsonb(array['https://www.reddit.com/r/tirana/comments/1sg9qsg/full_nightclub_on_thursday_night/','https://www.reddit.com/r/tirana/comments/1tpknk8/good_nightlife_areas_in_tirana/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','country_and_city_context','source_urls',to_jsonb(array['https://www.gov.uk/foreign-travel-advice/albania/safety-and-security','https://www.hodolist.com/tirana-tourism/where-to-party-in-tirana/lgbtq-friendly-pubs-to-party-in-tirana','https://rainbowmap.ilga-europe.org/countries/albania/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1649::bigint, jsonb_build_object(
      'queue_wait', 'This is an intimate bunker-themed lounge rather than a large club. There is normally no formal line, but the enclosed room and terrace can fill on Friday and Saturday. Arrive near the 6 pm opening for a table; later walk-ins depend more on seats than a selective door.',
      'best_nights', 'Friday and Saturday give the lounge its fullest late-night atmosphere, with Sunday closing earlier. An early evening shows the carefully collected 1940s decor; later hours make more sense for cocktails and music. Check the current programme before expecting a live performance.',
      'crowd_mix', 'Tirana couples and friend groups mix with visitors drawn by the unusual communist-era setting. It is a mainstream bistro-lounge, not a queer bar, and the public evidence does not support a reliable local-versus-tourist percentage. Conversation matters more here than a packed dance floor.',
      'dress_code', 'Relaxed evening clothes fit the small historical room: denim, trainers, shirts, dresses and light layers all work. There is no evidenced fetish or fashion code. Choose something comfortable for a low-ceilinged interior and possible terrace time rather than dressing for a prestige nightclub.',
      'staff_inclusivity', 'The long-running review signal is warm, with the atmosphere and distinctive setting earning especially strong scores. There is not enough venue-specific LGBTQ+ feedback for a queer guarantee, so treat it as a friendly mainstream lounge and use the same situational awareness as elsewhere in Tirana.',
      'venue_classification', 'mainstream_bistro_lounge',
      'source_urls', to_jsonb(array[
        'https://www.tripadvisor.com/Attraction_Review-g294446-d8310988-Reviews-Bunker_1944_Bistro_Lounge-Tirana_Tirana_County.html',
        'https://www.gov.uk/foreign-travel-advice/albania/safety-and-security',
        'https://www.hodolist.com/tirana-tourism/where-to-party-in-tirana/lgbtq-friendly-pubs-to-party-in-tirana'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g294446-d8310988-Reviews-Bunker_1944_Bistro_Lounge-Tirana_Tirana_County.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_hours','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g294446-d8310988-Reviews-Bunker_1944_Bistro_Lounge-Tirana_Tirana_County.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g294446-d8310988-Reviews-Bunker_1944_Bistro_Lounge-Tirana_Tirana_County.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g294446-d8310988-Reviews-Bunker_1944_Bistro_Lounge-Tirana_Tirana_County.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','limited_venue_evidence_with_city_context','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g294446-d8310988-Reviews-Bunker_1944_Bistro_Lounge-Tirana_Tirana_County.html','https://www.gov.uk/foreign-travel-advice/albania/safety-and-security']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1650::bigint, jsonb_build_object(
      'queue_wait', 'This established Blloku cocktail bar accepts reservations, and that is the smart move for Friday or Saturday groups. Earlier visits are usually about finding a seat, not passing a club door. The room runs from morning into late night, so cocktail-hour arrival avoids the tightest tables.',
      'best_nights', 'Friday and Saturday bring DJs or live musicians and the most animated late crowd. A weekday evening is better if you want bartenders to guide you through the deep spirits list. Sunday starts later, making it a deliberate evening stop rather than a daytime café visit.',
      'crowd_mix', 'Tirana cocktail regulars, dates and stylish local groups share the bar with visitors following its drinks reputation. Locals give it continuity; international guests are clearly visible but not the whole room. It is inclusive-leaning mixed nightlife, not a dedicated LGBTQ+ venue.',
      'dress_code', 'Polished casual suits the space: clean trainers, a good shirt, a dress or a sharper holiday look. There is no published strict code, but the carefully made drinks and Blloku setting feel more considered than a beer stop. Comfort still wins because nights run until 2 am.',
      'staff_inclusivity', 'Cocktail craft and personal service are the recurring strengths across a large review base, with fresh 2026 guests praising thoughtful glasses, atmosphere and confident recommendations. Busy nights can test any small bar, but the dominant signal is hospitable rather than gatekeeping.',
      'venue_classification', 'mainstream_queer_friendly_cocktail_bar',
      'source_urls', to_jsonb(array[
        'https://colonialtirana.com/',
        'https://www.top-rated.online/cities/Tirana/place/p/1174287/Colonial%2BCocktails%2BAcademy%2BTirana',
        'https://restaurantguru.com/Colonial-Cocktails-Academy-Tirana-Tirana',
        'https://www.spottedbylocals.com/tirana/colonial-cocktails-academy/',
        'https://wanderlog.com/it/place/details/476650/colonial-cocktails-academy-tirana'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://colonialtirana.com/','https://www.top-rated.online/cities/Tirana/place/p/1174287/Colonial%2BCocktails%2BAcademy%2BTirana']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_programme','source_urls',to_jsonb(array['https://colonialtirana.com/','https://restaurantguru.com/Colonial-Cocktails-Academy-Tirana-Tirana']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.spottedbylocals.com/tirana/colonial-cocktails-academy/','https://www.top-rated.online/cities/Tirana/place/p/1174287/Colonial%2BCocktails%2BAcademy%2BTirana','https://colonialtirana.com/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://colonialtirana.com/','https://wanderlog.com/it/place/details/476650/colonial-cocktails-academy-tirana']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://restaurantguru.com/Colonial-Cocktails-Academy-Tirana-Tirana','https://www.spottedbylocals.com/tirana/colonial-cocktails-academy/','https://wanderlog.com/it/place/details/476650/colonial-cocktails-academy-tirana']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1643::bigint, jsonb_build_object(
      'queue_wait', 'The creative hub works as a café, brunch room and coworking space, so there is no nightlife door. Popular work tables can disappear through late morning and lunch. Arrive early with a laptop, order as you settle in and ask how table service works rather than waiting uncertainly.',
      'best_nights', 'Daytime is the honest sweet spot: breakfast, coffee, meetings and a few hours of work show the venue better than a late bar crawl. Event evenings can change the rhythm, but they need a current listing. Choose another stop if dancing or a midnight queer crowd is the main goal.',
      'crowd_mix', 'Tirana creatives, students, remote workers and local brunch groups mix with digital nomads and curious visitors. Laptops are part of the landscape, though house policies can change. The crowd feels progressive and international without becoming a permanent LGBTQ+ gathering place.',
      'dress_code', 'Come café-casual: comfortable work clothes, trainers and whatever carries you from breakfast into an afternoon meeting. There is no style gate. A useful bag, charger and a layer for air-conditioning matter more than a nightlife look, while event nights may justify a sharper outfit.',
      'staff_inclusivity', 'Guests love the greenery, books, coffee, vegetarian options and authentic creative atmosphere. Service is less consistent: several reviews praise attentive care, while others report slow starts, blunt communication or laptop-policy friction. Ask clearly before settling in for a long work session.',
      'venue_classification', 'mainstream_creative_hub_cafe_coworking',
      'source_urls', to_jsonb(array[
        'https://www.top-rated.online/cities/Tirana/place/p/2609114/Destil%2BCreative%2BHub%2BTirana',
        'https://www.reddit.com/r/digitalnomad/comments/u26gdj',
        'https://creativehubs.net/images/upload/Participants_Precious_Textile_.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.top-rated.online/cities/Tirana/place/p/2609114/Destil%2BCreative%2BHub%2BTirana','https://www.reddit.com/r/digitalnomad/comments/u26gdj']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://www.top-rated.online/cities/Tirana/place/p/2609114/Destil%2BCreative%2BHub%2BTirana']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.top-rated.online/cities/Tirana/place/p/2609114/Destil%2BCreative%2BHub%2BTirana','https://www.reddit.com/r/digitalnomad/comments/u26gdj','https://creativehubs.net/images/upload/Participants_Precious_Textile_.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.top-rated.online/cities/Tirana/place/p/2609114/Destil%2BCreative%2BHub%2BTirana']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.top-rated.online/cities/Tirana/place/p/2609114/Destil%2BCreative%2BHub%2BTirana']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1646::bigint, jsonb_build_object(
      'queue_wait', 'Dhërmi Beach Route is a coastal circuit, not one entrance. In July and August the friction is traffic, parking, sunbed inventory and festival access; individual beach clubs may ticket headline nights. Arrive before sunset, park once and walk between nearby stops where practical.',
      'best_nights', 'Peak summer is the only reliable nightlife season, with sundowners sliding into DJ sets and festival weeks drawing the biggest international crowd. June and early September can feel sweeter and less crushed; outside the season, come for landscape and tavernas rather than promised dancing.',
      'crowd_mix', 'Albanian holidaymakers and seasonal workers meet young European visitors, festival travellers and regional weekend groups. The ratio swings wildly with the calendar: festivals feel international, ordinary summer nights more mixed. This is stylish beach tourism, not a defined queer scene.',
      'dress_code', 'Swimwear, a cover-up, sandals and a clean evening layer carry most of the route. Named parties may expect a ticketed festival look, but there is no coast-wide code. Wear shoes that handle pebbles and uneven paths, and bring sun protection before worrying about beach-club polish.',
      'staff_inclusivity', 'Service belongs to many independent clubs, hotels and tavernas, so one community rating would mislead. Queer travellers report a more conservative climate outside Tirana; same-sex relationships are legal, but public affection is best judged venue by venue. Favour busy, established stops.',
      'venue_classification', 'editorial_coastal_nightlife_route',
      'source_urls', to_jsonb(array[
        'https://akt.gov.al/en/atraksionet/dhermi/',
        'https://dhermi.net/nightlife',
        'https://dhermi.net/blog/nightlife-in-dhermi',
        'https://www.tripadvisor.com/Attraction_Review-g1915293-d5541312-Reviews-Dhermi_Beach-Dhermi_Vlore_County.html',
        'https://www.nederlandwereldwijd.nl/reisadvies/albanie',
        'https://www.gov.uk/foreign-travel-advice/albania/safety-and-security'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','route_consensus','source_urls',to_jsonb(array['https://dhermi.net/nightlife','https://www.tripadvisor.com/Attraction_Review-g1915293-d5541312-Reviews-Dhermi_Beach-Dhermi_Vlore_County.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','seasonal_route_consensus','source_urls',to_jsonb(array['https://dhermi.net/blog/nightlife-in-dhermi','https://dhermi.net/nightlife','https://akt.gov.al/en/atraksionet/dhermi/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://dhermi.net/nightlife','https://www.tripadvisor.com/Attraction_Review-g1915293-d5541312-Reviews-Dhermi_Beach-Dhermi_Vlore_County.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','route_consensus','source_urls',to_jsonb(array['https://dhermi.net/blog/nightlife-in-dhermi','https://akt.gov.al/en/atraksionet/dhermi/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','country_context_route','source_urls',to_jsonb(array['https://www.nederlandwereldwijd.nl/reisadvies/albanie','https://www.gov.uk/foreign-travel-advice/albania/safety-and-security','https://rainbowmap.ilga-europe.org/countries/albania/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1640::bigint, jsonb_build_object(
      'queue_wait', 'Folie Terrace is permanently closed, so old advice about reservations, tables or advance tickets is no longer actionable. Do not travel to Murat Toptani expecting the former 1,500-capacity club. Use current Tirana listings and verify the operating venue before paying anyone.',
      'best_nights', 'There is no current best night. Historically, Thursday through Saturday brought house, pop and visiting DJs to the open-air terrace, but those schedules are archive material. A recent page or social repost does not outweigh multiple live listings marking the business closed.',
      'crowd_mix', 'The former club drew fashionable Tirana groups, Balkan visitors and tourists, with VIP tables and a mainstream dance crowd rather than a queer-led community. That description belongs to its operating years only and should not be projected onto any later business using the address.',
      'dress_code', 'Historic reports describe a polished door, reservations and stricter clubwear expectations, but there is no valid dress code for a closed venue. Choose clothes only after selecting a currently operating event; Tirana’s cocktail bars are usually easier than its status-led clubs.',
      'staff_inclusivity', 'Past reviews were mixed: the sound, lights and open-air scale earned praise, while smoke, pricing, table culture and unfriendly service drew criticism. There is no current team to rate. The most inclusive editorial choice is to stop presenting an obsolete door as a live recommendation.',
      'operating_status', 'permanently_closed',
      'venue_classification', 'closed_mainstream_nightclub',
      'source_urls', to_jsonb(array[
        'https://wanderlog.com/place/details/386078/folie-terrace',
        'https://www.visit-tirana.com/locations/folie-terrace-club/',
        'https://www.novacircle.com/spots/europe/albania/tirana-county/tirana-municipality/tirana/folie-terrace-9cafe2/about',
        'https://www.gjithebiznesi.com/folie-terrace_1f',
        'https://www.mondodr.com/prosound-refurbishes-folie-terrace-nightclub-with-complete-lighting-video-and-audio-solution-by-harman/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','closure_verified','source_urls',to_jsonb(array['https://wanderlog.com/place/details/386078/folie-terrace','https://www.visit-tirana.com/locations/folie-terrace-club/','https://www.gjithebiznesi.com/folie-terrace_1f']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','historic_context_only','source_urls',to_jsonb(array['https://wanderlog.com/place/details/386078/folie-terrace','https://www.visit-tirana.com/locations/folie-terrace-club/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','historic_context_only','source_urls',to_jsonb(array['https://wanderlog.com/place/details/386078/folie-terrace','https://www.novacircle.com/spots/europe/albania/tirana-county/tirana-municipality/tirana/folie-terrace-9cafe2/about']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','historic_context_only','source_urls',to_jsonb(array['https://www.novacircle.com/spots/europe/albania/tirana-county/tirana-municipality/tirana/folie-terrace-9cafe2/about','https://wanderlog.com/place/details/386078/folie-terrace']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','historic_review_consensus_closed','source_urls',to_jsonb(array['https://wanderlog.com/place/details/386078/folie-terrace','https://www.visit-tirana.com/locations/folie-terrace-club/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1641::bigint, jsonb_build_object(
      'queue_wait', 'This small rum-and-jazz bar has no formal club line, but Saturday tables become scarce and service slows when the room is full. Weekdays are easier for walking in and talking to the bartender. Bring cash as backup: recent guests still describe cash-only moments.',
      'best_nights', 'Saturday carries the warmest crowded buzz; a weekday is better for rum guidance, jazz and unhurried cocktails. Concerts and cultural events are part of the identity but not a fixed nightly promise, so check the current programme. Sunday is normally closed.',
      'crowd_mix', 'Tirana artists, jazz listeners and cocktail regulars mix with expats and travellers who seek it out beyond the obvious Blloku circuit. The atmosphere is bohemian, mixed-age and socially open. It is cited as queer-friendly, though it is not a dedicated LGBTQ+ bar.',
      'dress_code', 'Come as yourself: casual black, vintage pieces, denim, trainers and art-school colour all fit the bookish Cuban-inspired room. There is no door-fashion ritual. The bar rewards personality and curiosity more than polish, with outdoor seating useful for smokers.',
      'staff_inclusivity', 'Cocktails, rum knowledge, music and the resident-cat warmth inspire unusually affectionate reviews. The counter-signal is real: a minority describe long waits or feeling ignored when busy. Queer-friendly recommendations are encouraging, but the strongest evidence is an open creative culture, not a formal policy.',
      'venue_classification', 'mainstream_queer_friendly_rum_and_jazz_bar',
      'source_urls', to_jsonb(array[
        'https://hemingway.al/about/?lang=en',
        'https://wanderlog.com/place/details/2601704',
        'https://www.hodolist.com/tirana-tourism/where-to-party-in-tirana/lgbtq-friendly-pubs-to-party-in-tirana',
        'https://www.reddit.com/r/tirana/comments/1g19p1p',
        'https://www.reddit.com/r/tirana/comments/1so79md/tirana_party_and_chess/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2601704','https://hemingway.al/about/?lang=en']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2601704','https://hemingway.al/about/?lang=en','https://www.reddit.com/r/tirana/comments/1g19p1p']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://hemingway.al/about/?lang=en','https://www.hodolist.com/tirana-tourism/where-to-party-in-tirana/lgbtq-friendly-pubs-to-party-in-tirana','https://wanderlog.com/place/details/2601704']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://hemingway.al/about/?lang=en','https://wanderlog.com/place/details/2601704']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2601704','https://www.hodolist.com/tirana-tourism/where-to-party-in-tirana/lgbtq-friendly-pubs-to-party-in-tirana']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1648::bigint, jsonb_build_object(
      'queue_wait', 'The museum-café is popular but works through tables rather than a nightlife door. Late afternoon and early evening can fill with visitors tasting raki; groups should reserve or arrive before the dinner wave. The useful wait is time spent looking at the rooms, not standing behind a velvet rope.',
      'best_nights', 'Go in late afternoon to see the communist-era collection clearly, then stay into evening for raki and conversation. Friday and Saturday are livelier, but a weekday gives staff more space to explain the drinks and objects. It is a cultural café-bar, not a dance-floor finish.',
      'crowd_mix', 'Tirana residents bringing friends, progressive creatives, couples and families sit beside a substantial international visitor crowd. Its visual history makes it tourist-facing, while the local drinks keep it from feeling like a museum gift shop. The audience is mixed, not specifically queer.',
      'dress_code', 'Everyday city clothes are right: trainers, denim, dresses and comfortable sightseeing layers all blend into the colourful rooms. There is no known dress code. Bring curiosity and a measured appetite for raki; the experience is more cabinet-of-curiosities salon than formal cocktail temple.',
      'staff_inclusivity', 'Visitors repeatedly praise the memorable interior, broad raki selection and staff who turn a drink into a story; fresh 2026 reviews still call it a Tirana jewel. Busy service can feel touristic, but the overall welcome is strong. It is progressive-coded rather than formally LGBTQ+ programmed.',
      'venue_classification', 'mainstream_progressive_cafe_museum',
      'source_urls', to_jsonb(array[
        'https://www.tripadvisor.com/Restaurant_Review-g294446-d7912633-Reviews-Komiteti_Kafe_Muzeum-Tirana_Tirana_County.html',
        'https://menuweb.menu/restaurants/tirana-1/komiteti',
        'https://restaurantguru.com/Komiteti-Kafe-Muzeum-Albania',
        'https://truequeer.com/posts/lgbtq-travel-guide-tirana-albania/',
        'https://www.reddit.com/r/tirana/comments/1fi7xp8/hidden_gems_in_tirana/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Restaurant_Review-g294446-d7912633-Reviews-Komiteti_Kafe_Muzeum-Tirana_Tirana_County.html','https://menuweb.menu/restaurants/tirana-1/komiteti']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.tripadvisor.com/Restaurant_Review-g294446-d7912633-Reviews-Komiteti_Kafe_Muzeum-Tirana_Tirana_County.html','https://restaurantguru.com/Komiteti-Kafe-Muzeum-Albania']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.tripadvisor.com/Restaurant_Review-g294446-d7912633-Reviews-Komiteti_Kafe_Muzeum-Tirana_Tirana_County.html','https://truequeer.com/posts/lgbtq-travel-guide-tirana-albania/','https://menuweb.menu/restaurants/tirana-1/komiteti']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.tripadvisor.com/Restaurant_Review-g294446-d7912633-Reviews-Komiteti_Kafe_Muzeum-Tirana_Tirana_County.html','https://restaurantguru.com/Komiteti-Kafe-Muzeum-Albania']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Restaurant_Review-g294446-d7912633-Reviews-Komiteti_Kafe_Muzeum-Tirana_Tirana_County.html','https://restaurantguru.com/Komiteti-Kafe-Muzeum-Albania','https://truequeer.com/posts/lgbtq-travel-guide-tirana-albania/']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (1637, 1649, 1650, 1643, 1646, 1640, 1641, 1648)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
