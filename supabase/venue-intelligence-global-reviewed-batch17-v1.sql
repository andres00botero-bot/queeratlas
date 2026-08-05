-- Queer Atlas venue intelligence: global review-led editorial pass, batch 17.
-- Algarve beaches, nightlife and accommodation; Amsterdam hotels and bars.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (1759::bigint, jsonb_build_object(
      'queue_wait', 'No ticket line here—the journey is the filter. The final approach is rough and steep, and the pocket of sand shrinks dramatically at high tide. Wear proper shoes, pack light and arrive in daylight; on busy summer days, the calmest corners disappear first.',
      'best_nights', 'Make this a daytime plan between late spring and early autumn. A falling or low tide creates the most usable beach and an easier swim; mid-morning leaves time to enjoy it without racing the water back. After dark, the unlit path and cliffs make it a poor idea.',
      'crowd_mix', 'Gay men are a visible part of the scene, alongside naturists, couples, solo sunseekers and occasional families. The mood is more secluded beach community than party. It can feel distinctly queer one day and broadly mixed the next, especially outside peak summer.',
      'dress_code', 'Nudity is normal and locally signposted, but nobody needs to perform it. Bring reef-friendly sun protection, water and shoes that grip; leave speakers and cameras packed unless everyone affected agrees. The unwritten look is practical, body-positive and low-key.',
      'staff_inclusivity', 'There is no bar team or host curating the mood. Respect does that work: no covert photos, no staring, no litter and a clear yes before approaching someone. Regulars value the freedom and beauty, while the isolated setting means looking out for yourself and each other.',
      'venue_classification', 'mixed_naturist_beach_with_strong_gay_presence',
      'source_urls', to_jsonb(array[
        'https://www.tripadvisor.com/Attraction_Review-g189120-d10474678-Reviews-Joao_de_Arens_Beach-Portimao_Faro_District_Algarve.html',
        'https://www.algarveportugaltourism.com/turismo/alvor/praia-de-joao-de-arens.html',
        'https://www.reddit.com/r/gaytravel/comments/1thtkka/gay_beach_algarve_portugal/',
        'https://www.reddit.com/r/Algarve/comments/1u8xqsi/couple_visiting_algarve_in_september_questions/',
        'https://cdnc.heyzine.com/flip-book/pdf/f6351ffa61d1c6bf09e3335ae7e7f0950b535841-16.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','access_and_review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g189120-d10474678-Reviews-Joao_de_Arens_Beach-Portimao_Faro_District_Algarve.html','https://www.algarveportugaltourism.com/turismo/alvor/praia-de-joao-de-arens.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','seasonal_safety_guidance','source_urls',to_jsonb(array['https://www.algarveportugaltourism.com/turismo/alvor/praia-de-joao-de-arens.html','https://www.tripadvisor.com/Attraction_Review-g189120-d10474678-Reviews-Joao_de_Arens_Beach-Portimao_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','community_and_review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g189120-d10474678-Reviews-Joao_de_Arens_Beach-Portimao_Faro_District_Algarve.html','https://www.reddit.com/r/gaytravel/comments/1thtkka/gay_beach_algarve_portugal/','https://www.reddit.com/r/Algarve/comments/1u8xqsi/couple_visiting_algarve_in_september_questions/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','posted_and_community_guidance','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g189120-d10474678-Reviews-Joao_de_Arens_Beach-Portimao_Faro_District_Algarve.html','https://www.algarveportugaltourism.com/turismo/alvor/praia-de-joao-de-arens.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','public_beach_no_staff','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g189120-d10474678-Reviews-Joao_de_Arens_Beach-Portimao_Faro_District_Algarve.html','https://cdnc.heyzine.com/flip-book/pdf/f6351ffa61d1c6bf09e3335ae7e7f0950b535841-16.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1750::bigint, jsonb_build_object(
      'queue_wait', 'There is no entrance queue, but getting to the unofficial cove west of the main beach takes timing. At high tide the shoreline route can vanish; the alternative is a steep path between hotel grounds. If access looks doubtful, stay on the public main beach rather than forcing it.',
      'best_nights', 'Go in full daylight, ideally on a falling tide. Late morning gives the cove time to gather a little life, though it may still be nearly empty outside summer. This is not a reliable queer event: treat any sociable crowd as a bonus and plan your return before the tide turns.',
      'crowd_mix', 'The main beach is a conventional family-and-holiday strip. The smaller western cove has a long gay-popular and naturist reputation, yet reports are inconsistent and some visitors find no queer scene at all. Expect tourists first, with a possible cluster of gay men rather than a guaranteed crowd.',
      'dress_code', 'Swimwear is standard on the main beach; discreet naturism is associated with the separated western cove. Bring shoes for the path, water and sun cover. Keep phones pointed away from nude bathers and remember that an unofficial reputation never removes anyone''s right to privacy.',
      'staff_inclusivity', 'Beach staff serve the mainstream public area, not the remote cove, and there is no queer host on duty. Your experience depends on ordinary coastal services and the people present that day. Keep the mood easy, ask before interacting and leave if access or atmosphere feels wrong.',
      'venue_classification', 'mainstream_beach_with_unofficial_gay_popular_naturist_cove',
      'source_urls', to_jsonb(array[
        'https://www.travelgay.com/venue/praia-maria-luisa',
        'https://wanderlog.com/place/details/173300/praia-maria-lu%C3%ADsa',
        'https://www.booking.com/reviews/pt/hotel/clubemarialuisa.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','access_and_tide_guidance','source_urls',to_jsonb(array['https://www.travelgay.com/venue/praia-maria-luisa','https://wanderlog.com/place/details/173300/praia-maria-lu%C3%ADsa']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','limited_community_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/praia-maria-luisa','https://wanderlog.com/place/details/173300/praia-maria-lu%C3%ADsa']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','mixed_and_inconsistent_reports','source_urls',to_jsonb(array['https://www.travelgay.com/venue/praia-maria-luisa','https://www.booking.com/reviews/pt/hotel/clubemarialuisa.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','location_specific_guidance','source_urls',to_jsonb(array['https://www.travelgay.com/venue/praia-maria-luisa','https://wanderlog.com/place/details/173300/praia-maria-lu%C3%ADsa']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','public_beach_no_queer_host','source_urls',to_jsonb(array['https://wanderlog.com/place/details/173300/praia-maria-lu%C3%ADsa','https://www.booking.com/reviews/pt/hotel/clubemarialuisa.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1752::bigint, jsonb_build_object(
      'queue_wait', 'This 150-capacity club can feel almost empty before midnight, then switch gears quickly. Recent listings show Friday and Saturday nights; event terms, cover and guest-list rules can change, so check the night''s post before leaving. Limited nearby parking rewards an early plan.',
      'best_nights', 'Friday and Saturday after midnight are the real window. Karaoke, themed parties and retro-pop nights rotate, while the two bars and separate zones make more sense once the room fills. Come earlier for cocktails and conversation; come late if dancing is the whole point.',
      'crowd_mix', 'The Algarve''s LGBTQ+ community mixes with holiday visitors, straight friends and curious first-timers. Gay men are visible without owning the room. It feels more like a regional queer reunion than a giant tourist superclub, and the balance shifts sharply with season and event.',
      'dress_code', 'There is no well-evidenced hard door code. Holiday clubwear, trainers, a sharp shirt, glitter or something playfully themed all work. Dress for a warm, active room—the air conditioning has drawn complaints—and keep one layer handy for the trip home after 4 am.',
      'staff_inclusivity', 'Recent guests often describe friendly bartenders, good cocktails and an easy welcome, including for mixed groups. Older accounts mention a confusing charge or guest-list exchange at the door, so confirm event details rather than arguing from an old listing. The current signal is upbeat, not spotless.',
      'venue_classification', 'inclusive_lgbtq_dance_club',
      'source_urls', to_jsonb(array[
        'https://restaurantguru.com/The-Loft-Portimao',
        'https://wanderlog.com/place/details/4399897/the-loft',
        'https://www.allaboutportugal.pt/en/portimao/bars/the-loft',
        'https://stg.travelgay.com/venue/the-loft-2',
        'https://www.tripadvisor.com/Attraction_Review-g189120-d4226805-Reviews-The_Loft-Portimao_Faro_District_Algarve.html',
        'https://qlist.app/venues/Faro/The-Loft/RFZSK1ArNzZWUjVseTlJYnVySm01dw',
        'https://www.reddit.com/r/lgbtportugal/comments/1n6q59h/birthday_in_algarve_best_lgbt_spots/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_listing_and_review_consensus','source_urls',to_jsonb(array['https://qlist.app/venues/Faro/The-Loft/RFZSK1ArNzZWUjVseTlJYnVySm01dw','https://www.tripadvisor.com/Attraction_Review-g189120-d4226805-Reviews-The_Loft-Portimao_Faro_District_Algarve.html','https://www.allaboutportugal.pt/en/portimao/bars/the-loft']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.allaboutportugal.pt/en/portimao/bars/the-loft','https://qlist.app/venues/Faro/The-Loft/RFZSK1ArNzZWUjVseTlJYnVySm01dw','https://wanderlog.com/place/details/4399897/the-loft']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','community_and_listing_consensus','source_urls',to_jsonb(array['https://stg.travelgay.com/venue/the-loft-2','https://www.reddit.com/r/lgbtportugal/comments/1n6q59h/birthday_in_algarve_best_lgbt_spots/','https://qlist.app/venues/Faro/The-Loft/RFZSK1ArNzZWUjVseTlJYnVySm01dw']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','review_based_practical_guidance','source_urls',to_jsonb(array['https://wanderlog.com/place/details/4399897/the-loft','https://restaurantguru.com/The-Loft-Portimao']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','mixed_review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/4399897/the-loft','https://restaurantguru.com/The-Loft-Portimao','https://www.tripadvisor.com/Attraction_Review-g189120-d4226805-Reviews-The_Loft-Portimao_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1751::bigint, jsonb_build_object(
      'queue_wait', 'This is a small hotel, so the pressure is on room availability rather than reception. Book popular golf and school-holiday dates early; check-in itself is usually personal and unhurried. If you arrive before the room is ready, the pool and quiet garden make an easy holding pattern.',
      'best_nights', 'Choose a weekend when you want Vilamoura''s marina restaurants and nightlife nearby, or midweek for a softer pool-and-breakfast rhythm. The hotel is a calm base, not the party. Couples tend to get the most from shoulder season, when the area feels polished without being packed.',
      'crowd_mix', 'International couples, families and golfers form the everyday mix. Queer guests are explicitly invited, but this is not an LGBTQ+-only hotel and there is no reason to expect a queer majority. Think discreet boutique resort energy with the marina crowd a short ride away.',
      'dress_code', 'Poolwear and relaxed resort clothes carry the day; smart casual fits dinner or drinks around the marina. Nothing suggests a stricter house code. Golfers will need course-appropriate clothing, while queer couples can simply dress as they would at any contemporary four-star hotel.',
      'staff_inclusivity', 'The hotel explicitly welcomes LGBTQI+ travellers and states that all sexual orientations and gender identities belong. Recent guests add a strong human signal: warm, attentive staff, useful local help and a peaceful atmosphere. That makes the inclusion more than a directory badge.',
      'venue_classification', 'explicitly_lgbtq_welcoming_mainstream_boutique_hotel',
      'source_urls', to_jsonb(array[
        'https://www.vilamouragardenhotel.com/amp/en/services',
        'https://www.expedia.com/Vilamoura-Hotels-Vilamoura-Garden-Hotel.h15368528.Hotel-Information',
        'https://www.booking.com/hotel/pt/vilamoura-garden.html',
        'https://www.tripadvisor.com/Hotel_Review-g227947-d10322472-Reviews-Vilamoura_Garden_Hotel-Vilamoura_Quarteira_Faro_District_Algarve.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','service_and_review_consensus','source_urls',to_jsonb(array['https://www.booking.com/hotel/pt/vilamoura-garden.html','https://www.tripadvisor.com/Hotel_Review-g227947-d10322472-Reviews-Vilamoura_Garden_Hotel-Vilamoura_Quarteira_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_led_stay_guidance','source_urls',to_jsonb(array['https://www.booking.com/hotel/pt/vilamoura-garden.html','https://www.tripadvisor.com/Hotel_Review-g227947-d10322472-Reviews-Vilamoura_Garden_Hotel-Vilamoura_Quarteira_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_and_review_summary','source_urls',to_jsonb(array['https://www.vilamouragardenhotel.com/amp/en/services','https://www.booking.com/hotel/pt/vilamoura-garden.html','https://www.expedia.com/Vilamoura-Hotels-Vilamoura-Garden-Hotel.h15368528.Hotel-Information']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://www.vilamouragardenhotel.com/amp/en/services','https://www.booking.com/hotel/pt/vilamoura-garden.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_policy_and_review_consensus','source_urls',to_jsonb(array['https://www.vilamouragardenhotel.com/amp/en/services','https://www.expedia.com/Vilamoura-Hotels-Vilamoura-Garden-Hotel.h15368528.Hotel-Information','https://www.tripadvisor.com/Hotel_Review-g227947-d10322472-Reviews-Vilamoura_Garden_Hotel-Vilamoura_Quarteira_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1924::bigint, jsonb_build_object(
      'queue_wait', 'With only nine rooms, sold-out dates are the real queue. Reserve well ahead for Pride and summer weekends, and arrive ready for Amsterdam''s famously steep stairs—there is no lift. The compact reception style is personal, so share your arrival time instead of expecting a large lobby.',
      'best_nights', 'A weekend puts Leidseplein and the centre''s queer nightlife on your doorstep; a midweek stay makes the narrow house feel calmer. Do not skip breakfast: guests repeatedly remember the cooked food, conversation and local tips as part of the hotel rather than a generic add-on.',
      'crowd_mix', 'The little house draws international LGBTQ+ travellers, couples, solo guests and allies who prefer character over chain-hotel anonymity. Its identity is openly inclusive rather than men-only. Because there are just nine rooms, the social mix changes completely with each set of arrivals.',
      'dress_code', 'There is no code beyond being dressed in shared areas. City layers, comfortable shoes and something for a night out are the useful choices; pack light for the stairs and small rooms. Couples can be openly themselves—the house presents queer belonging as ordinary hospitality.',
      'staff_inclusivity', 'Most recent stays describe attentive hosts, remembered preferences, generous breakfasts and genuinely useful city advice. A rare account found one interaction gruff, so perfection is not promised. The overall pattern is intimate, queer-aware care that makes solo and repeat guests feel known.',
      'venue_classification', 'small_explicitly_inclusive_lgbtq_hotel',
      'source_urls', to_jsonb(array[
        'https://www.amistad.nl/',
        'https://www.booking.com/reviews/nl/hotel/amistad-amsterdam.en-gb.html',
        'https://www.booking.com/hotel/nl/amistad-amsterdam.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_facts_and_review_consensus','source_urls',to_jsonb(array['https://www.amistad.nl/','https://www.booking.com/hotel/nl/amistad-amsterdam.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.booking.com/reviews/nl/hotel/amistad-amsterdam.en-gb.html','https://www.booking.com/hotel/nl/amistad-amsterdam.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_inclusion_and_review_summary','source_urls',to_jsonb(array['https://www.amistad.nl/','https://www.booking.com/reviews/nl/hotel/amistad-amsterdam.en-gb.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://www.amistad.nl/','https://www.booking.com/hotel/nl/amistad-amsterdam.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_review_consensus','source_urls',to_jsonb(array['https://www.amistad.nl/','https://www.booking.com/reviews/nl/hotel/amistad-amsterdam.en-gb.html','https://www.booking.com/hotel/nl/amistad-amsterdam.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1928::bigint, jsonb_build_object(
      'queue_wait', 'This is an intimate bar, so a themed night can fill the room without producing a grand club queue. Arrive early if you want a seat or feel shy about walking in solo. For karaoke, DJs and Pride dates, check the current programme and expect the energy to build later.',
      'best_nights', 'Choose the night by format, not habit: karaoke is playful and chatty, DJs turn the room more dance-forward, and an ordinary early evening is best for actually meeting people. Event listings change, so the strongest night is the one whose host or theme feels like your crowd.',
      'crowd_mix', 'Women make up roughly 95% of the crowd by the bar''s own description, spanning ages and mixing Amsterdam regulars with international visitors. Trans and non-binary guests, men and respectful allies are also welcome. The centre of gravity is unmistakably lesbian and queer-women-led.',
      'dress_code', 'No costume is required: denim, trainers, dresses, masc looks, femme glamour and gender-play all sit easily together. A themed or Pride night invites more sparkle, but comfort reads better than trying to pass a door test. Come as yourself and leave room to dance.',
      'staff_inclusivity', 'The bar explicitly names women, trans and non-binary people, men and allies in its welcome, while community recommendations repeatedly frame it as an easy first stop. Solo visitors are encouraged rather than treated as awkward. Respect for the women-centred space is the social contract.',
      'venue_classification', 'lesbian_and_queer_women_led_inclusive_bar',
      'source_urls', to_jsonb(array[
        'https://barbuka.nl/',
        'https://pride.amsterdam/en/boats/bar-buka/',
        'https://www.iamsterdam.com/en/see-and-do/restaurant-and-bars/lgbtqi-bars-and-cafes-in-amsterdam',
        'https://www.reddit.com/r/actuallesbianseurope/comments/1vg07on/anyone_in_amsterdam_today/',
        'https://www.reddit.com/r/LHBTI/comments/1ulcura/aanbevelingen_voor_queer_en_trans_locaties_bars/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_event_model_and_community_signal','source_urls',to_jsonb(array['https://barbuka.nl/','https://pride.amsterdam/en/boats/bar-buka/','https://www.reddit.com/r/actuallesbianseurope/comments/1vg07on/anyone_in_amsterdam_today/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','official_programme_summary','source_urls',to_jsonb(array['https://barbuka.nl/','https://pride.amsterdam/en/boats/bar-buka/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_crowd_description','source_urls',to_jsonb(array['https://barbuka.nl/','https://www.iamsterdam.com/en/see-and-do/restaurant-and-bars/lgbtqi-bars-and-cafes-in-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_and_event_guidance','source_urls',to_jsonb(array['https://barbuka.nl/','https://pride.amsterdam/en/boats/bar-buka/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_policy_and_community_consensus','source_urls',to_jsonb(array['https://barbuka.nl/','https://www.reddit.com/r/LHBTI/comments/1ulcura/aanbevelingen_voor_queer_en_trans_locaties_bars/','https://www.reddit.com/r/actuallesbianseurope/comments/1vg07on/anyone_in_amsterdam_today/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1122::bigint, jsonb_build_object(
      'queue_wait', 'Entry is normally free after buying a drink, so the practical delay is coat check or a locker, not a velvet-rope line. Event afternoons and weekend nights can bunch arrivals. Bring cash or card for small storage charges and a refundable locker deposit if you plan to use the play level.',
      'best_nights', 'Sunday''s bear social and the rotating fetish, uniform and community events give the place its clearest character; Friday and Saturday work for a later mixed bar night. Check the calendar because upstairs rules and the crowd can shift with the event. Daytime drinks are much gentler.',
      'crowd_mix', 'Bears, cubs, chubs, daddies and admirers are the core, with trans men explicitly included. Women, non-binary guests and allies are welcome in the ground-floor bar; the upstairs play area is generally for cis and trans men unless a specific event says otherwise.',
      'dress_code', 'The bar has no narrow look test: everyday clothes, leather, sportswear and fetish gear all appear. Nudity is accepted in the play zone, but shoes stay on. If an event names a theme, follow that brief; otherwise choose what lets you move comfortably between a social drink and something cruisier.',
      'staff_inclusivity', 'The venue spells out consent, safer sex, trans inclusion and a no-photos-without-permission culture. That clarity is a real strength. Reviews of individual staff vary, but the published boundaries are unusually useful: the bar is broadly inclusive, while the men''s play space is honestly labelled.',
      'venue_classification', 'bear_bar_with_men_only_play_area_and_inclusive_ground_floor',
      'source_urls', to_jsonb(array[
        'https://bearsamsterdam.com/en_gb/',
        'https://www.cruisingamsterdam.com/venues/bears-amsterdam',
        'https://www.qmeet.nl/place/amsterdam/bears-amsterdam',
        'https://amsterdam.gaycities.com/bars/312467-bears-amsterdam?tag=32',
        'https://www.lgbtour.amsterdam/post/amsterdam-gay-bars',
        'https://wanderlog.com/place/details/2318552/bears-amsterdam'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_entry_and_storage_rules','source_urls',to_jsonb(array['https://bearsamsterdam.com/en_gb/','https://www.cruisingamsterdam.com/venues/bears-amsterdam','https://www.qmeet.nl/place/amsterdam/bears-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_programme_summary','source_urls',to_jsonb(array['https://bearsamsterdam.com/en_gb/','https://www.cruisingamsterdam.com/venues/bears-amsterdam','https://www.qmeet.nl/place/amsterdam/bears-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_access_policy','source_urls',to_jsonb(array['https://bearsamsterdam.com/en_gb/','https://www.lgbtour.amsterdam/post/amsterdam-gay-bars','https://www.cruisingamsterdam.com/venues/bears-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','official_and_event_guidance','source_urls',to_jsonb(array['https://bearsamsterdam.com/en_gb/','https://www.cruisingamsterdam.com/venues/bears-amsterdam','https://www.qmeet.nl/place/amsterdam/bears-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_policy_with_mixed_review_signal','source_urls',to_jsonb(array['https://bearsamsterdam.com/en_gb/','https://www.cruisingamsterdam.com/venues/bears-amsterdam','https://wanderlog.com/place/details/2318552/bears-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1123::bigint, jsonb_build_object(
      'queue_wait', 'The original Blend is compact, so weekend drag and DJ sets can turn a walk-in bar into a full little room. Smaller groups simply arrive; parties of eight or more can reserve. Come before the late rush for terrace space and conversation, or embrace standing close once the music lifts.',
      'best_nights', 'Weekdays lean toward cocktails and easy bar chat; Friday and Saturday add DJs, drag and dancers and run later. Start here if you want a colourful first drink, then decide whether to stay or cross the street to the group''s larger dance venue. Check the current line-up for the exact show.',
      'crowd_mix', 'Amsterdam queer regulars, gay men, mixed LGBTQIA+ groups, allies and tourists all pass through this famous nightlife street. The small room encourages mingling rather than separate tribes. It is openly queer but broad in gender and orientation, especially earlier in the evening.',
      'dress_code', 'Colour, polished casualwear and a flash of glitter feel at home, yet there is no strict door uniform. Trainers and a T-shirt work beside a full drag look. Dress for a narrow, lively cocktail bar rather than a cavernous club, and add a layer if you plan to claim the terrace.',
      'staff_inclusivity', 'The house publishes zero tolerance for racism, transphobia and harassment, and reviews repeatedly mention warm bartenders who remember faces and drinks. A minority report weaker service, so the community signal is strongly positive rather than airbrushed. Respectful friends of the community are welcome.',
      'venue_classification', 'inclusive_lgbtq_cocktail_and_entertainment_bar',
      'source_urls', to_jsonb(array[
        'https://barblend.nl/bar-blend',
        'https://barblend.nl/faq',
        'https://barblend.nl/contact',
        'https://wanderlog.com/place/details/1931151/bar-blend-amsterdam',
        'https://www.bars10.com/NL/Amsterdam/658642844562159/Bar-BLEND'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_capacity_model_and_review_signal','source_urls',to_jsonb(array['https://barblend.nl/faq','https://barblend.nl/contact','https://wanderlog.com/place/details/1931151/bar-blend-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','official_programme_summary','source_urls',to_jsonb(array['https://barblend.nl/bar-blend','https://barblend.nl/faq','https://barblend.nl/contact']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_inclusion_and_review_consensus','source_urls',to_jsonb(array['https://barblend.nl/faq','https://wanderlog.com/place/details/1931151/bar-blend-amsterdam','https://www.bars10.com/NL/Amsterdam/658642844562159/Bar-BLEND']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','event_and_community_guidance','source_urls',to_jsonb(array['https://barblend.nl/bar-blend','https://wanderlog.com/place/details/1931151/bar-blend-amsterdam']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_policy_and_review_consensus','source_urls',to_jsonb(array['https://barblend.nl/faq','https://wanderlog.com/place/details/1931151/bar-blend-amsterdam','https://barblend.nl/bar-blend']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (1759, 1750, 1752, 1751, 1924, 1928, 1122, 1123)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
