-- Queer Atlas venue intelligence: global review-led editorial pass, batch 9.
-- Brighton, Brussels, Copenhagen, Madrid, Manchester, Milan, Mykonos and Paris.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (88::bigint, jsonb_build_object(
      'queue_wait', 'This tiny Chueca bar fills by compression, not by a formal club queue. Friday and Saturday bring the tightest standing squeeze, so arrive around 8 pm if you want breathing room. Keep a close eye on your phone and wallet once the room becomes shoulder-to-shoulder.',
      'best_nights', 'Friday and Saturday deliver the fullest Latin-pop party, while Monday and Tuesday can still produce a surprisingly social room without the weekend crush. Wednesday is closed. Start here rather than saving it for the very end of the night.',
      'crowd_mix', 'Younger gay men in their twenties and thirties set the tone, with Madrid regulars, Latin American residents and Chueca visitors mixing easily. It is friendly to tourists and straight friends, but the compact room still reads clearly as a gay men''s bar.',
      'dress_code', 'There is no serious fashion test: fitted tees, jeans, trainers and a little holiday flirtation all work. The shirtless-bar-team energy is sexy rather than formal, so choose something comfortable enough for a hot, crowded room instead of dressing for a velvet rope.',
      'staff_inclusivity', 'Many guests love the playful bartenders, music and easy welcome, especially when the room is flowing. Other reviews describe brusque service and theft in the crowd. The social signal is warm overall, but friendliness and practical safety should not be treated as the same thing.',
      'source_urls', to_jsonb(array[
        'https://www.travelgay.com/venue/baranoa',
        'https://www.gayout.com/europe/spain/madrid/bars/baranoa-1224',
        'https://es.restaurantguru.com/Baranoa-Madrid',
        'https://wanderlog.com/place/details/1681612/baranoa-bar',
        'https://www.corner.inc/place/p4G5n3aevqcD',
        'https://thegaypassport.com/venue/baranoa/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1681612/baranoa-bar','https://www.corner.inc/place/p4G5n3aevqcD','https://www.travelgay.com/venue/baranoa']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.travelgay.com/venue/baranoa','https://www.gayout.com/europe/spain/madrid/bars/baranoa-1224','https://thegaypassport.com/venue/baranoa/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://thegaypassport.com/venue/baranoa/','https://wanderlog.com/place/details/1681612/baranoa-bar','https://www.corner.inc/place/p4G5n3aevqcD']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.travelgay.com/venue/baranoa','https://wanderlog.com/place/details/1681612/baranoa-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1681612/baranoa-bar','https://es.restaurantguru.com/Baranoa-Madrid','https://www.corner.inc/place/p4G5n3aevqcD']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (122::bigint, jsonb_build_object(
      'queue_wait', 'There is no current queue: Plastic''s final night was 28 June 2025 and the club is permanently closed. Historically, waiting never guaranteed entry; guest-list status, the group and the door''s reading of your look could matter more than how early you arrived.',
      'best_nights', 'There is no current best night. In its final era, Saturday carried the classic Plastic collision of electronic music, 1980s Italian pop, drag performance and fashion theatre. Treat old listings as cultural history, not as an invitation to travel to the venue.',
      'crowd_mix', 'Historically, Milan''s queer underground shared the room with designers, artists, celebrities and devoted local night people. Its fame attracted visitors, but belonging came from cultural fluency more than tourist curiosity. That crowd description ended with the 2025 closure.',
      'dress_code', 'No present dress code applies. The old door was famously subjective: an expressive, intentional look and the right list could help, while expensive clothes alone promised nothing. The performance of identity was part of Plastic''s mythology, along with the frustration of being refused.',
      'staff_inclusivity', 'Plastic is not operating, so no current staff welcome can be assessed. Historical accounts celebrate freedom and queer self-invention once inside, but reviews also remember a rejecting, sometimes humiliating door. Both sides belong in an honest account of its legacy.',
      'operating_status', 'permanently_closed',
      'source_urls', to_jsonb(array[
        'https://www.tripadvisor.com/Attraction_Review-g187849-d4437060-Reviews-Plastic-Milan_Lombardy.html',
        'https://static.vogue.it/article/plastic-milano-chiusura',
        'https://milano.corriere.it/notizie/cronaca/25_settembre_04/milano-addio-al-plastic-chiude-lo-storico-club-dove-freddie-mercury-giocava-al-flipper-e-i-pink-floyd-restavano-anonimi-a1c118b3-ac61-4aae-81a8-37b8413f8xlk.shtml',
        'https://www.vanityfair.it/article/plastic-dj-stryxia',
        'https://d.repubblica.it/culture/musica/2025/09/04/news/chiude_il_plastic_il_piu_leggendario_club_di_milano-424825647/',
        'https://wanderlog.com/place/details/453321/plastic'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','verified_closed','source_urls',to_jsonb(array['https://milano.corriere.it/notizie/cronaca/25_settembre_04/milano-addio-al-plastic-chiude-lo-storico-club-dove-freddie-mercury-giocava-al-flipper-e-i-pink-floyd-restavano-anonimi-a1c118b3-ac61-4aae-81a8-37b8413f8xlk.shtml','https://www.tripadvisor.com/Attraction_Review-g187849-d4437060-Reviews-Plastic-Milan_Lombardy.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_closed','source_urls',to_jsonb(array['https://static.vogue.it/article/plastic-milano-chiusura','https://www.vanityfair.it/article/plastic-dj-stryxia','https://milano.corriere.it/notizie/cronaca/25_settembre_04/milano-addio-al-plastic-chiude-lo-storico-club-dove-freddie-mercury-giocava-al-flipper-e-i-pink-floyd-restavano-anonimi-a1c118b3-ac61-4aae-81a8-37b8413f8xlk.shtml']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','historical_context','source_urls',to_jsonb(array['https://static.vogue.it/article/plastic-milano-chiusura','https://d.repubblica.it/culture/musica/2025/09/04/news/chiude_il_plastic_il_piu_leggendario_club_di_milano-424825647/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','historical_context','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g187849-d4437060-Reviews-Plastic-Milan_Lombardy.html','https://wanderlog.com/place/details/453321/plastic']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','historical_context','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g187849-d4437060-Reviews-Plastic-Milan_Lombardy.html','https://wanderlog.com/place/details/453321/plastic','https://static.vogue.it/article/plastic-milano-chiusura']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (115::bigint, jsonb_build_object(
      'queue_wait', 'The sea-view bar and terrace are easygoing by day; the Basement becomes the pressure point on Friday, Saturday and Pride weekends. Arrive before the downstairs club shift if you want a relaxed drink and smoother entry rather than meeting the late-night crowd at the door.',
      'best_nights', 'Sunday is the house ritual: afternoon cabaret from 3:30 pm, then a singalong-heavy Basement night. Friday leans toward dance anthems and chart remixes, Saturday mixes current hits with camp classics, and the last Thursday of the month brings disco, soul and funk.',
      'crowd_mix', 'Brighton LGBTQ+ locals, hotel guests, weekend visitors and straight friends share the upstairs bar across a broad age range. The Basement turns younger and more dance-focused after dark, while Sunday cabaret creates the most intergenerational version of Legends.',
      'dress_code', 'Seafront casual works through the day: denim, trainers, holiday layers and whatever survives the terrace breeze. Evening guests sharpen it or add camp without facing a documented formal code. Dress for the version you wantâ€”cabaret table, cocktail bar or downstairs dance floor.',
      'staff_inclusivity', 'Many hotel and bar guests describe attentive, polite service and an easy LGBTQ+ welcome. Recent reports about hostile door handling and combative management responses are too serious to ignore, so upstairs hospitality and late-night security should be judged separately.',
      'source_urls', to_jsonb(array[
        'https://legendsresortbrighton.com/',
        'https://uk.trustpilot.com/review/www.legendsbrighton.com',
        'https://www.tripadvisor.co.uk/Attraction_Review-g186273-d2284850-Reviews-Legends_Bar-Brighton_East_Sussex_England.html',
        'https://www.tripadvisor.com/Hotel_Review-g186273-d214788-Reviews-Legends_Hotel-Brighton_East_Sussex_England.html',
        'https://www.dragmynight.co.uk/aVenue.aspx?ID=31'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://legendsresortbrighton.com/','https://www.dragmynight.co.uk/aVenue.aspx?ID=31','https://www.tripadvisor.co.uk/Attraction_Review-g186273-d2284850-Reviews-Legends_Bar-Brighton_East_Sussex_England.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://legendsresortbrighton.com/','https://www.dragmynight.co.uk/aVenue.aspx?ID=31']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://legendsresortbrighton.com/','https://www.tripadvisor.com/Hotel_Review-g186273-d214788-Reviews-Legends_Hotel-Brighton_East_Sussex_England.html','https://www.dragmynight.co.uk/aVenue.aspx?ID=31']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://legendsresortbrighton.com/','https://www.tripadvisor.co.uk/Attraction_Review-g186273-d2284850-Reviews-Legends_Bar-Brighton_East_Sussex_England.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://uk.trustpilot.com/review/www.legendsbrighton.com','https://www.tripadvisor.com/Hotel_Review-g186273-d214788-Reviews-Legends_Hotel-Brighton_East_Sussex_England.html','https://www.tripadvisor.co.uk/Attraction_Review-g186273-d2284850-Reviews-Legends_Bar-Brighton_East_Sussex_England.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (96::bigint, jsonb_build_object(
      'queue_wait', 'The roomy terrace absorbs much of the after-work crowd, so there is rarely a dramatic velvet-rope wait. Friday and Saturday tighten indoors once the DJ starts; come between 5 and 7 pm for a table, or accept a livelier standing bar later.',
      'best_nights', 'Friday and Saturday bring DJs and a 3 am finish, making them the obvious dance-bar choice. Thursday often produces a sociable mixed crowd without the weekend peak. Tuesday, Wednesday and Sunday suit conversation, screens and a slower drink.',
      'crowd_mix', 'Brussels gay men form the centre, joined naturally by queer friends, women, expats and city-break visitors. The official gay-bar-and-friends identity feels accurate: recognisably gay-led but broader and more conversational than a men-only venue.',
      'dress_code', 'Wear ordinary Brussels going-out clothes: trainers, denim, a clean tee or office-to-drinks layers. There is no evidenced selective fashion door. Terrace weather and several hours on your feet deserve more thought than trying to perform a particular queer uniform.',
      'staff_inclusivity', 'A large share of recent guests call the team welcoming and the service excellent. Others report being served out of order, uneven attention and one serious dispute over staff responsibility. The baseline appears friendly, but the negative experiences are substantial enough to keep the verdict qualified.',
      'source_urls', to_jsonb(array[
        'https://stationbxl.be/en/bienvenue-english/',
        'https://wanderlog.com/place/details/2563675',
        'https://restaurantguru.com/Station-Bxl-Brussels',
        'https://selfcity.be/discotheek/brussel/station-bxl/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://stationbxl.be/en/bienvenue-english/','https://wanderlog.com/place/details/2563675','https://restaurantguru.com/Station-Bxl-Brussels']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://stationbxl.be/en/bienvenue-english/','https://wanderlog.com/place/details/2563675']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://stationbxl.be/en/bienvenue-english/','https://wanderlog.com/place/details/2563675','https://selfcity.be/discotheek/brussel/station-bxl/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://stationbxl.be/en/bienvenue-english/','https://wanderlog.com/place/details/2563675']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2563675','https://restaurantguru.com/Station-Bxl-Brussels','https://selfcity.be/discotheek/brussel/station-bxl/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (79::bigint, jsonb_build_object(
      'queue_wait', 'The door conversation matters more than a predicted number of minutes. Every event labels selection soft, normal or strict; read the listing, know the lineup and arrive coherent. Even a ticket may not guarantee admission, and the team can decline without explaining why.',
      'best_nights', 'Choose by lineup and selection level, not by weekday alone. Weekend sessions can run until 6 am, but a musically specific house or techno bill usually gives a clearer crowd than a generic big night. Read the event page again before leaving home because the rules can change.',
      'crowd_mix', 'Queer and minoritised Copenhagen dancers are the intended centre, joined by music-literate visitors rather than casual sightseeing groups. The balance shifts with each promoter and selection level, but the room is designed to protect a diverse queer dance floor, not recreate a mainstream club.',
      'dress_code', 'There is no universal costume. Expressive clubwear and functional dance clothes both fit, while strict events may publish mandatory requirements. Once inside, the clearest rule is behavioural: no photos or video, minimal phone use and no loud conversation on the dance floor.',
      'staff_inclusivity', 'A visible awareness team, consent rules, harm reduction and a restorative reporting process show unusually concrete care inside. Community reports value the no-phone safer space, while door reviews describe opaque or dismissive refusals. Support inside and uncertainty outside coexist.',
      'source_urls', to_jsonb(array[
        'https://www.denandenside.com/club-policy',
        'https://www.denandenside.com/contact',
        'https://www.corner.inc/place/pwPtcNa9Dh64',
        'https://de.restaurantguru.com/Den-Anden-Side-Copenhagen',
        'https://gastroranking.dk/r/den-anden-side_18602/',
        'https://www.reddit.com/r/NewToDenmark/comments/1tp1beq/first_time_exploring_copenhagens_techno_scene_as/',
        'https://www.reddit.com/r/copenhagen/comments/1uni912/how_is_the_rave_crowd_in_copenhagen/',
        'https://www.reddit.com/r/Berghain_Community/comments/1aq1qsd'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.denandenside.com/club-policy','https://de.restaurantguru.com/Den-Anden-Side-Copenhagen','https://www.reddit.com/r/NewToDenmark/comments/1tp1beq/first_time_exploring_copenhagens_techno_scene_as/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.denandenside.com/club-policy','https://www.corner.inc/place/pwPtcNa9Dh64','https://gastroranking.dk/r/den-anden-side_18602/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.denandenside.com/club-policy','https://www.reddit.com/r/copenhagen/comments/1uni912/how_is_the_rave_crowd_in_copenhagen/','https://www.reddit.com/r/Berghain_Community/comments/1aq1qsd']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.denandenside.com/club-policy','https://www.reddit.com/r/NewToDenmark/comments/1tp1beq/first_time_exploring_copenhagens_techno_scene_as/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.denandenside.com/club-policy','https://www.denandenside.com/contact','https://de.restaurantguru.com/Den-Anden-Side-Copenhagen','https://www.reddit.com/r/NewToDenmark/comments/1tp1beq/first_time_exploring_copenhagens_techno_scene_as/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (117::bigint, jsonb_build_object(
      'queue_wait', 'Canal Street weekends and Pride bring the greatest entry pressure, though the harder issue in reviews is an unpredictable door rather than a reliably long line. Carry valid ID, stay with friends and keep valuables on your body; late opening does not guarantee a smooth admission or exit.',
      'best_nights', 'Friday and Saturday give the fullest pop-club atmosphere, while a named drag or show night can be more memorable than a generic weekend visit. Weekdays reduce the crush and make the bar easier to read. Check the current programme locally, as reliable official listings are limited.',
      'crowd_mix', 'A young, pop-loving LGBTQ+ crowd shares the room with drag fans, straight friends and Canal Street tourists. The atmosphere can feel exuberant and accessible rather than underground, but popularity with visitors should not be confused with unanimous community trust.',
      'dress_code', 'Casual pop-club clothes, trainers, denim, going-out tops and drag-night sparkle are all natural here. No dependable strict dress code is published. Bring valid ID and choose secure pockets or a zipped bag, since practical preparation matters more than performing a particular look.',
      'staff_inclusivity', 'Experiences are sharply divided. Some recent guests describe joyful drag, a happy crowd and a fun night; many others allege hostile security, discriminatory treatment, unsafe ejections or mishandled belongings. The pattern is too persistent for an unqualified safety recommendation.',
      'source_urls', to_jsonb(array[
        'https://www.tripadvisor.co.uk/Attraction_Review-g187069-d11797072-Reviews-G_A_Y_Manchester-Manchester_Greater_Manchester_England.html',
        'https://www.gayplaces.co/city/manchester/club/g-a-y-manchester'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Attraction_Review-g187069-d11797072-Reviews-G_A_Y_Manchester-Manchester_Greater_Manchester_England.html','https://www.gayplaces.co/city/manchester/club/g-a-y-manchester']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','limited_current_evidence','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Attraction_Review-g187069-d11797072-Reviews-G_A_Y_Manchester-Manchester_Greater_Manchester_England.html','https://www.gayplaces.co/city/manchester/club/g-a-y-manchester']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Attraction_Review-g187069-d11797072-Reviews-G_A_Y_Manchester-Manchester_Greater_Manchester_England.html','https://www.gayplaces.co/city/manchester/club/g-a-y-manchester']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Attraction_Review-g187069-d11797072-Reviews-G_A_Y_Manchester-Manchester_Greater_Manchester_England.html','https://www.gayplaces.co/city/manchester/club/g-a-y-manchester']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Attraction_Review-g187069-d11797072-Reviews-G_A_Y_Manchester-Manchester_Greater_Manchester_England.html','https://www.gayplaces.co/city/manchester/club/g-a-y-manchester']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (129::bigint, jsonb_build_object(
      'queue_wait', 'This is a reservations problem more than a nightclub queue. Peak-summer sunbeds, lunch tables and show-time seats can disappear, so book before travelling to Super Paradise. Walk-ins fare better early; afternoon arrivals may wait for a table even when beach access remains possible.',
      'best_nights', 'The signature arc is afternoon into sunset: beach or pool first, lunch and cocktails, then the daily drag performance and DJ energy. Choose a bright-weather day and stay through the show. It is an all-day resort spectacle, not the island''s 2 am-to-sunrise club experience.',
      'crowd_mix', 'Queer and gay travellers form the emotional core, joined by straight friends, international couples, luxury holiday groups and day visitors from across Mykonos. Almost everyone is visiting rather than local; summer seasonality shapes the mix more than any single nationality or age.',
      'dress_code', 'Stylish swimwear, sunglasses and expressive beach looks belong by the pool. Add a cover-up, shirt or resort-casual layer for the restaurant and show. The mood welcomes glamour and drag without requiring costume; dress for sun, photos and a polished lunch rather than a hard club door.',
      'staff_inclusivity', 'Many guests describe a warm LGBTQ+ welcome, attentive service and staff who make the performance feel celebratory. Price, pacing and occasional rude or slow encounters temper that praise. Book clearly, confirm minimum-spend terms and judge the hospitality separately from the famous setting.',
      'source_urls', to_jsonb(array[
        'https://www.jackieomykonos.com/beach-club',
        'https://wanderlog.com/place/details/498419/jackieo',
        'https://www.tripadvisor.com.au/Restaurant_Review-g6581364-d4813583-Reviews-Jackie_O_Mykonos-Plintri_Mykonos_Cyclades_South_Aegean.html',
        'https://www.thetraveler.org/is-jackie-o-beach-club-in-mykonos-worth-the-hype/',
        'https://www.reddit.com/r/GreeceTravel/comments/1urlnfa/whats_the_beach_club_scene_like_in_mykonos_during/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.jackieomykonos.com/beach-club','https://wanderlog.com/place/details/498419/jackieo','https://www.tripadvisor.com.au/Restaurant_Review-g6581364-d4813583-Reviews-Jackie_O_Mykonos-Plintri_Mykonos_Cyclades_South_Aegean.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.jackieomykonos.com/beach-club','https://www.tripadvisor.com.au/Restaurant_Review-g6581364-d4813583-Reviews-Jackie_O_Mykonos-Plintri_Mykonos_Cyclades_South_Aegean.html','https://www.thetraveler.org/is-jackie-o-beach-club-in-mykonos-worth-the-hype/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.jackieomykonos.com/beach-club','https://wanderlog.com/place/details/498419/jackieo','https://www.thetraveler.org/is-jackie-o-beach-club-in-mykonos-worth-the-hype/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.jackieomykonos.com/beach-club','https://wanderlog.com/place/details/498419/jackieo']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/498419/jackieo','https://www.tripadvisor.com.au/Restaurant_Review-g6581364-d4813583-Reviews-Jackie_O_Mykonos-Plintri_Mykonos_Cyclades_South_Aegean.html','https://www.thetraveler.org/is-jackie-o-beach-club-in-mykonos-worth-the-hype/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1865::bigint, jsonb_build_object(
      'queue_wait', 'Think small-Marais-restaurant wait, not club queue. The compact terrace and tables can fill at dinner and on weekends, so reserve online or arrive before the neighbourhood''s main evening rush. A wait here is for a burger and a seat, not a door-selection ritual.',
      'best_nights', 'Any dinner can work; Friday and Saturday run later and suit a casual meal before Marais bars, while Sunday opens earlier for a slower daytime stop. Choose this for playful food and conversation rather than expecting a show, DJ or late-night dance floor.',
      'crowd_mix', 'Marais LGBTQ+ locals and gay visitors share the colourful room with friends, couples, families and work groups. The identity is proudly gay-friendly without being exclusive, and the recognisable pink facade attracts tourists alongside neighbourhood regulars.',
      'dress_code', 'There is no dress code beyond being comfortable at a casual burger restaurant. Streetwear, trainers, sightseeing clothes and an outfit headed to the bars afterwards all fit. Save the elaborate look for your next stop unless it simply makes dinner more fun.',
      'staff_inclusivity', 'Recent guests repeatedly describe quick, funny and attentive service, with individual servers giving the room much of its personality. One returning customer felt the old sense of inclusion had weakened, so the current picture is strongly positive but not completely unanimous.',
      'source_urls', to_jsonb(array[
        'https://tata-burger.fr/fr/',
        'https://www.petitfute.com/v17231-17299-paris-75004/c1165-restaurants/c1031-cuisines-du-monde/c1034-cuisine-ameriques-caraibes/c47-restaurant-americain/1465081-tata-burger.html',
        'https://www.tripadvisor.co.uk/Restaurant_Review-g187147-d4282127-Reviews-Tata_Burger-Paris_Ile_de_France.html',
        'https://fr.restaurantguru.com/TATA-Burger-Paris',
        'https://fr.travelgay.com/venue/tata-burger'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://tata-burger.fr/fr/','https://www.tripadvisor.co.uk/Restaurant_Review-g187147-d4282127-Reviews-Tata_Burger-Paris_Ile_de_France.html','https://fr.restaurantguru.com/TATA-Burger-Paris']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://tata-burger.fr/fr/','https://fr.travelgay.com/venue/tata-burger']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://tata-burger.fr/fr/','https://www.petitfute.com/v17231-17299-paris-75004/c1165-restaurants/c1031-cuisines-du-monde/c1034-cuisine-ameriques-caraibes/c47-restaurant-americain/1465081-tata-burger.html','https://fr.travelgay.com/venue/tata-burger']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://tata-burger.fr/fr/','https://www.tripadvisor.co.uk/Restaurant_Review-g187147-d4282127-Reviews-Tata_Burger-Paris_Ile_de_France.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://tata-burger.fr/fr/','https://www.petitfute.com/v17231-17299-paris-75004/c1165-restaurants/c1031-cuisines-du-monde/c1034-cuisine-ameriques-caraibes/c47-restaurant-americain/1465081-tata-burger.html','https://www.tripadvisor.co.uk/Restaurant_Review-g187147-d4282127-Reviews-Tata_Burger-Paris_Ile_de_France.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (88, 122, 115, 96, 79, 117, 129, 1865)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
