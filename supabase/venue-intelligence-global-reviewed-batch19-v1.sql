-- Queer Atlas venue intelligence: global review-led editorial pass, batch 19.
-- Amsterdam nightlife, hotels, sauna, queer hospitality and public-space record.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (167::bigint, jsonb_build_object(
      'queue_wait', 'This compact late bar rarely feels like a formal club door, but the room can be full long before the 4 or 5 am close. Earlier hours are easy; after midnight, expect a squeeze and quick turnover at the bar. Pride and street events are the moments to arrive before the rush.',
      'best_nights', 'Wednesday breaks the week with a programmed party, while Friday and Saturday carry the biggest late-night charge. Start with a quieter beer, or use it as the final pop-and-house stop after neighbouring bars. The personality is cheeky, loud and immediate rather than musically underground.',
      'crowd_mix', 'Young gay men, queer friends, international visitors and Amsterdam regulars make up the visible mix. Straight friends are common, and the door is not men-only. Tourist energy rises on weekends, but local staff and repeat guests stop it feeling like a generic party strip.',
      'dress_code', 'There is no serious look test. Trainers, denim, fitted shirts, going-out basics and a flash of camp all work around the pole and confetti. Dress for heat and close dancing, not a fashion tribunal. If you arrive straight from sightseeing, confidence matters more than a wardrobe change.',
      'staff_inclusivity', 'Fresh reviews describe hardworking staff who actively lift the room with music, shots and playful energy, and solo guests often make friends quickly. This is high-volume hospitality, so warmth may arrive as banter rather than a long conversation. The overall community signal is lively and welcoming.',
      'venue_classification', 'inclusive_gay_led_late_night_dance_bar',
      'source_urls', to_jsonb(array[
        'https://www.exitamsterdam.nl/',
        'https://www.gayout.com/europe/netherlands/amsterdam/bars/exit-cafe',
        'https://www.travelgay.com/venue/exit-cafe-apres-chic'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_hours_and_review_consensus','source_urls',to_jsonb(array['https://www.exitamsterdam.nl/','https://www.gayout.com/europe/netherlands/amsterdam/bars/exit-cafe','https://www.travelgay.com/venue/exit-cafe-apres-chic']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','official_programme_and_review_summary','source_urls',to_jsonb(array['https://www.exitamsterdam.nl/','https://www.gayout.com/europe/netherlands/amsterdam/bars/exit-cafe']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_identity_and_review_consensus','source_urls',to_jsonb(array['https://www.exitamsterdam.nl/','https://www.gayout.com/europe/netherlands/amsterdam/bars/exit-cafe','https://www.travelgay.com/venue/exit-cafe-apres-chic']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_and_venue_signal','source_urls',to_jsonb(array['https://www.exitamsterdam.nl/','https://www.gayout.com/europe/netherlands/amsterdam/bars/exit-cafe']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','current_review_consensus','source_urls',to_jsonb(array['https://www.gayout.com/europe/netherlands/amsterdam/bars/exit-cafe','https://www.exitamsterdam.nl/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1925::bigint, jsonb_build_object(
      'queue_wait', 'This canal-house hotel has a normal reception, but its central location makes affordable rooms sell early. Check-in pressure rises with train arrivals. Some rooms require both lift and stairs, so request step-free routing before paying if mobility matters; the historic layout cannot promise it by default.',
      'best_nights', 'Stay Friday or Saturday to walk home from Warmoesstraat and Zeedijk nightlife; choose midweek if sleep and price matter more. The neighbourhood is busy around the clock, so a room away from the street is worth requesting. This is a practical base, not a social hotel programme.',
      'crowd_mix', 'International city-break couples, friends and solo travellers dominate, with LGBTQ+ guests drawn by the nearby gay bars rather than an in-house scene. The hotel is mainstream and compact. Expect tourists far more than locals, plus a constant flow of guests using Central Station.',
      'dress_code', 'There is no hotel code. Sightseeing layers, club clothes and luggage-light basics all pass through reception without drama. Comfortable shoes matter more than polish because old-building stairs and cobbles are part of the stay. Keep a quieter layer ready for the walk back after late bars.',
      'staff_inclusivity', 'Recent guests repeatedly praise friendly, helpful reception and clean, comfortable rooms, including couples. No substantial queer-specific service record was found, so inclusion should be described as ordinary central-city hospitality, not specialist training. Small rooms and uneven access are the clearer caveats.',
      'venue_classification', 'mainstream_gay_friendly_central_boutique_hotel',
      'source_urls', to_jsonb(array[
        'https://www.hotelcc.nl/',
        'https://www.booking.com/hotel/nl/cc.en-gb.html',
        'https://www.travelgay.com/hotels/hotel-cc'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_access_facts_and_review_consensus','source_urls',to_jsonb(array['https://www.hotelcc.nl/','https://www.booking.com/hotel/nl/cc.en-gb.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','location_based_stay_guidance','source_urls',to_jsonb(array['https://www.hotelcc.nl/','https://www.booking.com/hotel/nl/cc.en-gb.html','https://www.travelgay.com/hotels/hotel-cc']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://www.hotelcc.nl/','https://www.booking.com/hotel/nl/cc.en-gb.html','https://www.travelgay.com/hotels/hotel-cc']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://www.hotelcc.nl/','https://www.booking.com/hotel/nl/cc.en-gb.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','general_review_consensus_limited_queer_specific_evidence','source_urls',to_jsonb(array['https://www.booking.com/hotel/nl/cc.en-gb.html','https://www.hotelcc.nl/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (852::bigint, jsonb_build_object(
      'queue_wait', 'Check-in begins at 3 pm, and fresh reviews show rooms can occasionally run late at busy turnover. Leave luggage and head out rather than hovering in reception. The hotel is cashless, so bring a physical bank or credit card. Request a canal or courtyard room early if quiet matters.',
      'best_nights', 'A weekend works for the 13-minute walk to Rembrandtplein; weekdays make this quieter eastern edge better value for museums and sleep. The lobby bar is for a pizza, match or last drink, not queer nightlife. Choose the hotel for reliable transport and return to the city for the scene.',
      'crowd_mix', 'Couples and families make up most stays, followed by business and solo travellers. Queer guests blend into an international mainstream hotel with no dedicated LGBTQ+ programme. Visitors overwhelmingly define the lobby; local life appears outside around Waterlooplein and the Stopera.',
      'dress_code', 'Anything clean and city-casual works, from museum-day trainers to the clothes you wore out on Rembrandtplein. There is no door code or formal restaurant. The 17-square-metre rooms reward compact luggage, and a rain layer is more useful than dressing up for reception.',
      'staff_inclusivity', 'Current couples and solo guests regularly praise kind, efficient staff and easy room requests. Reviews are less consistent on value, room size and housekeeping details. The service evidence is strong but general: queer couples should expect ordinary professional welcome, not a specialised community hotel.',
      'venue_classification', 'mainstream_international_economy_hotel',
      'source_urls', to_jsonb(array[
        'https://all.accor.com/hotel/3044/index.en.shtml',
        'https://www.booking.com/hotel/nl/ibisstopera.html',
        'https://www.expedia.co.uk/Amsterdam-Hotels-Ibis-Amsterdam-Centre-Stopera.h483011.Hotel-Information',
        'https://wanderlog.com/place/details/780136/ibis-amsterdam-centre-stopera'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_verified_review_and_payment_facts','source_urls',to_jsonb(array['https://all.accor.com/hotel/3044/index.en.shtml','https://www.booking.com/hotel/nl/ibisstopera.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','official_location_and_service_summary','source_urls',to_jsonb(array['https://all.accor.com/hotel/3044/index.en.shtml','https://www.booking.com/hotel/nl/ibisstopera.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_guest_profile_classification','source_urls',to_jsonb(array['https://all.accor.com/hotel/3044/index.en.shtml','https://www.expedia.co.uk/Amsterdam-Hotels-Ibis-Amsterdam-Centre-Stopera.h483011.Hotel-Information']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://all.accor.com/hotel/3044/index.en.shtml','https://wanderlog.com/place/details/780136/ibis-amsterdam-centre-stopera']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_general_review_consensus_limited_queer_specific_evidence','source_urls',to_jsonb(array['https://all.accor.com/hotel/3044/index.en.shtml','https://wanderlog.com/place/details/780136/ibis-amsterdam-centre-stopera','https://www.expedia.co.uk/Amsterdam-Hotels-Ibis-Amsterdam-Centre-Stopera.h483011.Hotel-Information']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (174::bigint, jsonb_build_object(
      'queue_wait', 'The bar is wonderfully small, so karaoke or a show can fill it with only a few groups. There is usually no grand queue; arriving before the entertainment gives you a seat and time with the host. Late arrivals may miss the act but often find the best conversation afterwards.',
      'best_nights', 'Choose karaoke for brave, affectionate chaos, or a drag and performance night for the full tiny-stage magic. An ordinary evening can be even better if you want stories, rock and actual connection. The calendar changes, so check before travelling rather than assuming every night is a show.',
      'crowd_mix', 'Trans people, queer women, non-binary guests, gay men, first-time visitors and allies share an unusually intergenerational room. It is not a tourist-only drag bar, even though travellers are warmly absorbed. The alternative-rock identity draws people who feel unseen in glossy gay venues.',
      'dress_code', 'Alt, indie, grunge, full drag, everyday denim or tentative first-night-out clothes all make sense. There is no demand to look finished. Experimentation is part of the atmosphere, and several guests describe finding the nerve to sing or try a new presentation here for the first time.',
      'staff_inclusivity', 'This trans and queer-women-owned bar earns unusually personal reviews: guests describe long talks with the owner, chosen-family warmth and a safe first queer night. Small-team service can be idiosyncratic, but the repeated signal is care with real queer knowledge rather than a rainbow marketing layer.',
      'venue_classification', 'trans_and_queer_women_owned_inclusive_alt_queer_bar',
      'source_urls', to_jsonb(array[
        'https://www.lellebel.nl/',
        'https://www.lellebel.nl/google-reviews/',
        'https://www.iamsterdam.com/en/see-and-do/restaurant-and-bars/lgbtqi-bars-and-cafes-in-amsterdam',
        'https://de.wikipedia.org/wiki/De_Lellebel'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_capacity_context_and_review_consensus','source_urls',to_jsonb(array['https://www.lellebel.nl/','https://www.lellebel.nl/google-reviews/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','official_programme_and_review_summary','source_urls',to_jsonb(array['https://www.lellebel.nl/','https://www.lellebel.nl/google-reviews/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_identity_and_review_consensus','source_urls',to_jsonb(array['https://www.lellebel.nl/','https://www.iamsterdam.com/en/see-and-do/restaurant-and-bars/lgbtqi-bars-and-cafes-in-amsterdam','https://www.lellebel.nl/google-reviews/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_and_brand_identity','source_urls',to_jsonb(array['https://www.lellebel.nl/','https://www.lellebel.nl/google-reviews/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','ownership_facts_and_strong_review_consensus','source_urls',to_jsonb(array['https://www.lellebel.nl/','https://www.lellebel.nl/google-reviews/','https://de.wikipedia.org/wiki/De_Lellebel']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1124::bigint, jsonb_build_object(
      'queue_wait', 'This reborn singalong bar opens early enough to claim a stool, but Friday and Saturday choruses can pack the room. There is rarely a formal club line; the useful move is arriving before a birthday group owns the floor. Bring ID—the whole three-bar group operates an 18+ policy.',
      'best_nights', 'Friday and Saturday deliver the longest run of Dutch camp, disco, Eurovision and 80s–90s favourites; Sunday suits one last communal chorus before the week. Wednesday and Thursday are easier for conversation. Pick this when knowing every lyric matters more than discovering a new DJ.',
      'crowd_mix', 'Gay men and long-time fans of the original café mix with younger LGBTQIA+ groups, birthday crews, allies and tourists exploring the street. The nostalgia gives locals a visible role. It is broad and friendly, but the musical language and camp references remain proudly Dutch.',
      'dress_code', 'Glitter, a sharp shirt, casual denim and accidental Eurovision cosplay are all equally believable. There is no strict code. The room rewards willingness to sing, not a body type or label. Wear shoes that survive a small dance floor and a voice you do not mind losing.',
      'staff_inclusivity', 'The current venue presents itself as LGBTQIA+ and friends, backed by a group-wide zero-tolerance stance on racism, transphobia and harassment. The concept is new at this address but carries more than 40 years of community memory. Published warmth is strong; independent fresh reviews remain thinner.',
      'venue_classification', 'inclusive_lgbtq_singalong_and_nostalgia_bar',
      'source_urls', to_jsonb(array[
        'https://barblend.nl/montmartre-xl',
        'https://barblend.nl/faq',
        'https://barblend.nl/contact',
        'https://files.eshkolot.ru/Amsterdam.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_hours_and_group_policy','source_urls',to_jsonb(array['https://barblend.nl/montmartre-xl','https://barblend.nl/faq','https://barblend.nl/contact']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','official_programme_summary','source_urls',to_jsonb(array['https://barblend.nl/montmartre-xl','https://barblend.nl/faq','https://files.eshkolot.ru/Amsterdam.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','heritage_and_official_identity_summary','source_urls',to_jsonb(array['https://barblend.nl/montmartre-xl','https://barblend.nl/faq','https://files.eshkolot.ru/Amsterdam.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','programme_based_guidance','source_urls',to_jsonb(array['https://barblend.nl/montmartre-xl','https://barblend.nl/faq']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_group_policy_limited_independent_current_reviews','source_urls',to_jsonb(array['https://barblend.nl/faq','https://barblend.nl/montmartre-xl']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (171::bigint, jsonb_build_object(
      'queue_wait', 'Bear Day, Pride and peak weekend hours can fill every seat and create an entrance wait; an ordinary weekday afternoon is gentler. Current Pride tickets are time-limited, and event conditions vary. Bring photo ID, follow locker instructions and never arrive visibly intoxicated.',
      'best_nights', 'Wednesday can be surprisingly lively with a mixed age range; Bear Day brings bears, chubs and admirers; Sunday evening often skews more mature. Daytime is calmer and more spa-like, late hours more social and sexual. Check maintenance notices if a specific pool or room matters to you.',
      'crowd_mix', 'Cis and trans men form the regular audience, spanning twinks, bears, bigger bodies, daddies, locals and international visitors. Some special queer editions broaden access, but do not assume all genders on an ordinary day. The mix changes by theme and hour more than by tourist season.',
      'dress_code', 'Regular areas are nude: underwear, caps and swimwear are barred, except swimwear on the named Thursday session. Phones stay in the lounge or locker zone and photos are forbidden. Pack clean footwear only if instructed, then let towels and house rules replace the usual club wardrobe.',
      'staff_inclusivity', 'Recent guests often praise kind staff, cleanliness and body-diverse ease, including strong experiences from bears and international visitors. A smaller group reports rude or discriminatory door treatment. Explicit anti-discrimination rules matter, but the live service record is positive with real exceptions.',
      'venue_classification', 'gay_and_trans_men_focused_cruise_sauna_with_selected_queer_events',
      'source_urls', to_jsonb(array[
        'https://www.saunanieuwezijds.nl/',
        'https://www.saunanieuwezijds.nl/info/our-house-rules',
        'https://wanderlog.com/place/details/1133719/sauna-nieuwezijds',
        'https://qlist.app/venues/Amsterdam/Sauna-Nieuwezijds/QVFTT24yVWZOcHBhb3crOVM3ZXBxdw',
        'https://www.reddit.com/r/LHBTI/comments/1rv8k41/visiting_nieuwezijds_as_a_queer_woman/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','official_rules_and_current_review_consensus','source_urls',to_jsonb(array['https://www.saunanieuwezijds.nl/','https://www.saunanieuwezijds.nl/info/our-house-rules','https://wanderlog.com/place/details/1133719/sauna-nieuwezijds']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_review_and_event_summary','source_urls',to_jsonb(array['https://www.saunanieuwezijds.nl/','https://wanderlog.com/place/details/1133719/sauna-nieuwezijds','https://qlist.app/venues/Amsterdam/Sauna-Nieuwezijds/QVFTT24yVWZOcHBhb3crOVM3ZXBxdw']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','official_access_and_review_consensus','source_urls',to_jsonb(array['https://www.saunanieuwezijds.nl/','https://wanderlog.com/place/details/1133719/sauna-nieuwezijds','https://www.reddit.com/r/LHBTI/comments/1rv8k41/visiting_nieuwezijds_as_a_queer_woman/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','explicit_house_rules','source_urls',to_jsonb(array['https://www.saunanieuwezijds.nl/info/our-house-rules','https://www.saunanieuwezijds.nl/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','explicit_rules_with_mixed_current_review_consensus','source_urls',to_jsonb(array['https://www.saunanieuwezijds.nl/info/our-house-rules','https://wanderlog.com/place/details/1133719/sauna-nieuwezijds','https://qlist.app/venues/Amsterdam/Sauna-Nieuwezijds/QVFTT24yVWZOcHBhb3crOVM3ZXBxdw']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (854::bigint, jsonb_build_object(
      'queue_wait', 'There is no entrance or queue: this is a public city park. Daytime paths serve walkers, families, sport and picnics; any cruising is informal and reported mainly after the general crowd thins. Do not travel across town expecting an organised scene or guaranteed company.',
      'best_nights', 'Older and current guides point to evening activity, sometimes later around the pond, but darkness also removes visibility and help. Daylight is the wiser first visit. If connection is the goal, a staffed venue offers clearer consent, facilities and safety than an isolated park encounter.',
      'crowd_mix', 'The park is overwhelmingly a mainstream neighbourhood space by day. Informal cruising reports describe local men and a culturally mixed crowd after dark, but there is no reliable ratio, attendance count or community host. People using the same path may have no connection to cruising at all.',
      'dress_code', 'Ordinary park clothes and shoes are the only sensible recommendation. Public nudity and sexual activity are not an invitation to ignore other park users or local law. Keep valuables minimal, do not photograph anyone and remember that eye contact is not consent to follow or touch.',
      'staff_inclusivity', 'No venue team, door or awareness crew exists. Municipal park services maintain the public space, not a queer event. Meet in visible areas, tell someone your plan, keep your own route home and leave at the first sign of harassment. The correct community rating is unhosted and variable.',
      'venue_classification', 'public_park_with_informal_unhosted_cruising_reputation',
      'source_urls', to_jsonb(array[
        'https://www.amsterdam.nl/leefomgeving/parken-recreatiegebieden/oosterpark/',
        'https://www.cruisinggays.com/amsterdam/areas/14938-oosterpark/',
        'https://www.loadededit.com/amsterdam-outdoor-cruising-parks/',
        'https://www.loadededit.com/amsterdam-gay-cruising-guide/',
        'https://guidesamsterdam.com/neighbourhoods/oost/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','public_space_classification','source_urls',to_jsonb(array['https://www.amsterdam.nl/leefomgeving/parken-recreatiegebieden/oosterpark/','https://www.cruisinggays.com/amsterdam/areas/14938-oosterpark/','https://www.loadededit.com/amsterdam-outdoor-cruising-parks/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','limited_current_reports_with_safety_caution','source_urls',to_jsonb(array['https://www.cruisinggays.com/amsterdam/areas/14938-oosterpark/','https://www.loadededit.com/amsterdam-gay-cruising-guide/','https://guidesamsterdam.com/neighbourhoods/oost/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','unverified_informal_crowd_reports','source_urls',to_jsonb(array['https://www.cruisinggays.com/amsterdam/areas/14938-oosterpark/','https://www.loadededit.com/amsterdam-outdoor-cruising-parks/','https://www.amsterdam.nl/leefomgeving/parken-recreatiegebieden/oosterpark/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','public_space_safety_and_consent_guidance','source_urls',to_jsonb(array['https://www.amsterdam.nl/leefomgeving/parken-recreatiegebieden/oosterpark/','https://www.loadededit.com/amsterdam-outdoor-cruising-parks/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','public_space_no_venue_staff','source_urls',to_jsonb(array['https://www.amsterdam.nl/leefomgeving/parken-recreatiegebieden/oosterpark/','https://guidesamsterdam.com/neighbourhoods/oost/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1125::bigint, jsonb_build_object(
      'queue_wait', 'The terrace and dining tables make early evening easy; the downstairs room can tighten once a Saturday DJ starts. There is not usually a club-style line, but booking dinner is smart for a group. Payment is card-only, and stairs to the lower bar or toilets may affect accessibility.',
      'best_nights', 'Come early for food, cocktails and conversation; stay into Saturday if the basement DJ is your mood. A weekday feels like a colourful queer neighbourhood bar, while weekend programming pushes it toward dancing. Check the current listings because the venue shifts naturally between restaurant, terrace and party.',
      'crowd_mix', 'Queer locals, artists, couples, mixed friend groups and visitors share the space, with women and non-binary guests visibly more central than in the city''s gay-male strip. It is not a lesbian-only bar. The food and terrace also attract allies who understand they are entering a queer room.',
      'dress_code', 'Playful city casual fits: vintage, colour, workday denim, soft glamour and a dance-ready layer all work among the quirky furniture and art. There is no narrow door code. Dress for dinner upstairs and movement downstairs, with shoes that handle stairs if you plan to use the full space.',
      'staff_inclusivity', 'Recent accounts consistently praise warm welcomes, attentive servers, strong cocktails and an atmosphere that feels openly LGBTQ+ without becoming cliquey. Food reviews are also a real part of the affection. Accessibility and card-only payment are practical limits, not signs of an unfriendly team.',
      'venue_classification', 'inclusive_queer_bar_restaurant_and_event_space',
      'source_urls', to_jsonb(array[
        'https://www.pamela.amsterdam/',
        'https://wanderlog.com/place/details/4508494/pamela',
        'https://www.reddit.com/r/Amsterdam/comments/1qwxgsn/new_in_amsterdam_where_to_find_altqueer/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_review_and_service_consensus','source_urls',to_jsonb(array['https://www.pamela.amsterdam/','https://wanderlog.com/place/details/4508494/pamela']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','current_programme_and_review_summary','source_urls',to_jsonb(array['https://www.pamela.amsterdam/','https://wanderlog.com/place/details/4508494/pamela']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','community_and_review_consensus','source_urls',to_jsonb(array['https://www.pamela.amsterdam/','https://wanderlog.com/place/details/4508494/pamela','https://www.reddit.com/r/Amsterdam/comments/1qwxgsn/new_in_amsterdam_where_to_find_altqueer/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_and_venue_signal','source_urls',to_jsonb(array['https://www.pamela.amsterdam/','https://wanderlog.com/place/details/4508494/pamela']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','strong_current_review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/4508494/pamela','https://www.pamela.amsterdam/']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (167, 1925, 852, 174, 1124, 171, 854, 1125)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
