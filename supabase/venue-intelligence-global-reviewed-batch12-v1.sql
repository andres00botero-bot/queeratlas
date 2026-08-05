-- Queer Atlas venue intelligence: global review-led editorial pass, batch 12.
-- Berlin, Crete, Madrid and Montreal.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (56::bigint, jsonb_build_object(
      'queue_wait', 'There is normally no cover or formal door queue; the tiny Gravina room simply becomes a shoulder-to-shoulder bar. Friday and Saturday are tightest after midnight. Arrive around 9 pm for space and an easy first drink, or later if singing and standing matter more than conversation.',
      'best_nights', 'Friday and Saturday bring the loudest pop, salsa and reggaeton singalongs, while a weekday visit keeps the cocktail-bar side visible. Televised football can occasionally replace the music, so check the mood at the door if dancing is your only plan.',
      'crowd_mix', 'Chueca LGBTQ+ regulars, gay men, mixed queer groups and international visitors share a friendly little room. Locals give it the social rhythm, but newcomers are often drawn straight into conversation. It is more mixed and open than a men-only cruise bar.',
      'dress_code', 'Everyday Chueca clothes work: jeans, trainers, fitted tees, dresses and a brighter holiday look all fit. There is no evidenced fashion test. Choose something comfortable for a hot compact bar with no true dance floor, where people eventually dance wherever they are standing.',
      'staff_inclusivity', 'A warm welcome, strong generously sized cocktails and small arrival shots recur across hundreds of reviews. The public signal is notably positive, although a popular tiny room can slow ordering at peak. Its strength is personal bar service, not polished big-club logistics.',
      'source_urls', to_jsonb(array[
        'https://wanderlog.com/place/details/1141826/la-kama-bar',
        'https://revolutionrockbar.es/bar/diverzo-cocktail-bar/',
        'https://www.todosbiz.es/la-kama-915-22-32-26',
        'https://www.patroc.com/gay/madrid/bars.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1141826/la-kama-bar','https://revolutionrockbar.es/bar/diverzo-cocktail-bar/','https://www.patroc.com/gay/madrid/bars.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1141826/la-kama-bar','https://www.patroc.com/gay/madrid/bars.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1141826/la-kama-bar','https://revolutionrockbar.es/bar/diverzo-cocktail-bar/','https://www.patroc.com/gay/madrid/bars.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1141826/la-kama-bar','https://revolutionrockbar.es/bar/diverzo-cocktail-bar/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1141826/la-kama-bar','https://revolutionrockbar.es/bar/diverzo-cocktail-bar/','https://www.todosbiz.es/la-kama-915-22-32-26']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (64::bigint, jsonb_build_object(
      'queue_wait', 'Check-in, ID and changing create the practical wait; free coat check and lockers keep the doorway moving. Sunday afternoon is the established peak and can feel packed inside the 250-square-metre club. Friday and Saturday nights vary more, so a ticket or early arrival reduces uncertainty.',
      'best_nights', 'Sunday afternoon is the signature, with nudity and the most consistently active crowd. Friday and Saturday run later for fetish and cruise themes. Current public schedules disagree about Wednesday and Thursday, so confirm the official channel before travelling outside the dependable weekend.',
      'crowd_mix', 'Madrid gay men of varied ages and body types share the rooms with visitors seeking an explicit sex-positive space. Sunday attracts the strongest local ritual; weekend nights can be more theme-led. This is exclusively gay male by policy, not a mixed LGBTQ+ bar.',
      'dress_code', 'The official baseline is nude, underwear or a jockstrap; fetish clothing is accepted at management''s discretion. Sportswear and leather appear on themed nights, but ordinary street clothes are not the intended inside look. Free condoms are available at the bar, and privacy rules matter throughout.',
      'staff_inclusivity', 'Many guests praise a respectful, playful team, clean facilities and an unusually relaxed atmosphere. Others describe an intimidating or hostile welcome from a manager at the entrance. The evidence is more positive than negative, but the repeated door criticism is too specific to hide.',
      'source_urls', to_jsonb(array[
        'https://firewoodbarmadrid.com/',
        'https://www.travelgay.com/venue/firewood-madrid',
        'https://pridepoint.es/firewood-gay-bar/',
        'https://thegaypassport.com/venue/firewood-madrid/',
        'https://qlist.app/venues/Madrid/Firewood-Gay-Bar/MW4wTU9rb0kwUU82dmJIQjkyZjZDdw',
        'https://www.todobares.com/bar/firewood-gay-bar-madrid-madrid/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.travelgay.com/venue/firewood-madrid','https://thegaypassport.com/venue/firewood-madrid/','https://pridepoint.es/firewood-gay-bar/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.travelgay.com/venue/firewood-madrid','https://thegaypassport.com/venue/firewood-madrid/','https://www.todobares.com/bar/firewood-gay-bar-madrid-madrid/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://firewoodbarmadrid.com/','https://pridepoint.es/firewood-gay-bar/','https://qlist.app/venues/Madrid/Firewood-Gay-Bar/MW4wTU9rb0kwUU82dmJIQjkyZjZDdw']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://firewoodbarmadrid.com/','https://www.travelgay.com/venue/firewood-madrid','https://thegaypassport.com/venue/firewood-madrid/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://pridepoint.es/firewood-gay-bar/','https://qlist.app/venues/Madrid/Firewood-Gay-Bar/MW4wTU9rb0kwUU82dmJIQjkyZjZDdw','https://www.travelgay.com/venue/firewood-madrid']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (68::bigint, jsonb_build_object(
      'queue_wait', 'Friday and Saturday lines can become huge after 1 am. A regular''s useful tactic is to buy the entry when doors open around 11 pm, leave, then return without the main wait. Recent entry has been about €12 with two beers or one mixed drink, but disputed surcharges make confirmation essential.',
      'best_nights', 'Friday and Saturday are strongest from roughly 1 to 3 am, before the small room becomes uncomfortably full. Thursday is the calmer pre-club option. Come for retro, commercial and camp Spanish music, a pool table and conversation; this is not an underground electronic night.',
      'crowd_mix', 'Gay men across a notably broad age range mix with Chueca regulars and international visitors. Long-time patrons give it an older, traditional-bar backbone, while weekend tourists add movement. It remains a gay male-led room, though friends and mixed groups are not unusual.',
      'dress_code', 'There is no reliable strict code: jeans, shirts, trainers and ordinary late-night Madrid clothes work. Bring a secure bag or use the cloakroom, valid ID and a light layer because peak heat and crowding draw complaints. Looking polished matters less than arriving before capacity pressure.',
      'staff_inclusivity', 'Reports are sharply polarised. Some regulars praise respectful bouncers, playful bartenders and a wonderful cloakroom team; numerous 2026 reviews describe rude, sectarian or threatening service, ignored smoking and weak capacity control. The current pattern does not support an unqualified welcome.',
      'source_urls', to_jsonb(array[
        'https://www.travelgay.com/venue/ricks-madrid',
        'https://www.gayout.com/europe/spain/madrid/bars/rick-s-1233',
        'https://www.todobares.com/bar/disco-rick-s-madrid/',
        'https://qlist.app/venues/Madrid/Disco-Ricks-/TVJUZG9scVNwbzYycHJUcTBIenJ6QQ/es',
        'https://wanderlog.com/ru/place/details/4025621/disco-ricks'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.gayout.com/europe/spain/madrid/bars/rick-s-1233','https://wanderlog.com/ru/place/details/4025621/disco-ricks','https://www.todobares.com/bar/disco-rick-s-madrid/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/ricks-madrid','https://www.gayout.com/europe/spain/madrid/bars/rick-s-1233','https://wanderlog.com/ru/place/details/4025621/disco-ricks']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.travelgay.com/venue/ricks-madrid','https://qlist.app/venues/Madrid/Disco-Ricks-/TVJUZG9scVNwbzYycHJUcTBIenJ6QQ/es','https://www.todobares.com/bar/disco-rick-s-madrid/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/ru/place/details/4025621/disco-ricks','https://qlist.app/venues/Madrid/Disco-Ricks-/TVJUZG9scVNwbzYycHJUcTBIenJ6QQ/es']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.gayout.com/europe/spain/madrid/bars/rick-s-1233','https://wanderlog.com/ru/place/details/4025621/disco-ricks','https://www.todobares.com/bar/disco-rick-s-madrid/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1438::bigint, jsonb_build_object(
      'queue_wait', 'This is a free municipal pool, not a nightlife venue. Entry follows fixed open-swim blocks, and lane numbers change by session; family periods can be busier than adult-only hours. Check the city schedule immediately before travelling because programmes and temporary closures change seasonally.',
      'best_nights', 'For lap swimming, adult-only evening blocks on Tuesday through Thursday offer up to six lanes in the spring schedule. Summer shifts toward midday and late afternoon. Choose by the live municipal timetable, not a queer crowd prediction: there is no LGBTQ+ event night attached to the pool.',
      'crowd_mix', 'Hochelaga residents, lap swimmers, families and aquatic-program participants make up a general public crowd. The facility is not evidenced as a gay venue, despite old directory pages presenting it that way. Queer visitors use the same community sessions as everyone else.',
      'dress_code', 'Proper swimwear is mandatory, and goggles are recommended for lanes. Bring a strong lock and carry as few valuables as possible. Multiple May-July 2026 reports describe forced lockers and stolen phones; the pleasant pool itself does not make the changing area secure.',
      'staff_inclusivity', 'Fresh reviews call the facility clean, the music good and staff friendly. During repeated 2026 locker thefts, workers were described as sympathetic but unable to prevent or resolve losses. The welcome appears kind; physical security is the urgent weakness users need to know.',
      'current_name', 'Piscine Pierre-Lorange',
      'venue_classification', 'public_pool_not_queer_venue',
      'source_urls', to_jsonb(array[
        'https://montreal.ca/en/places/piscine-pierre-lorange',
        'https://montreal.ca/lieux/piscine-pierre-lorange',
        'https://reviews.birdeye.com/piscine-pierre-lorange-170428636830757',
        'https://www.reddit.com/r/montreal/comments/1tdxl15/warning_theft_at_a_local_community_pool/',
        'https://ville.montreal.qc.ca/documents/Adi_Public/CA_Mhm/CA_Mhm_ODJP_ORDI_2026-06-29_18h00_FR.pdf',
        'https://ville.montreal.qc.ca/documents/Adi_Public/CE/CE_PV_ORDI_2013-06-19_08h30_FR.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://montreal.ca/en/places/piscine-pierre-lorange','https://montreal.ca/lieux/piscine-pierre-lorange']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://montreal.ca/en/places/piscine-pierre-lorange','https://montreal.ca/lieux/piscine-pierre-lorange']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://montreal.ca/en/places/piscine-pierre-lorange','https://ville.montreal.qc.ca/documents/Adi_Public/CE/CE_PV_ORDI_2013-06-19_08h30_FR.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://montreal.ca/lieux/piscine-pierre-lorange','https://reviews.birdeye.com/piscine-pierre-lorange-170428636830757','https://www.reddit.com/r/montreal/comments/1tdxl15/warning_theft_at_a_local_community_pool/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://reviews.birdeye.com/piscine-pierre-lorange-170428636830757','https://www.reddit.com/r/montreal/comments/1tdxl15/warning_theft_at_a_local_community_pool/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1453::bigint, jsonb_build_object(
      'queue_wait', 'The colourful Korai Street room can look quiet early, and regulars explicitly advise not walking past for that reason. Dinner tables and the later bar share the same space; reserve for a group, while couples and solo visitors are usually seated without nightclub-style waiting.',
      'best_nights', 'Friday and Saturday are the established gay-led late nights, while Tuesday karaoke adds the clearest participatory event. Come earlier for homemade food and cocktails, then let the room turn social. In a small island-city scene, the named programme matters more than saving everything for 2 am.',
      'crowd_mix', 'Heraklion LGBTQ+ locals become the core later at night, joined by queer travellers, mixed friends and ordinary restaurant guests. It is openly gay-friendly and sometimes almost entirely gay after dinner, but remains a multicultural cafe-bar rather than an exclusive identity-specific club.',
      'dress_code', 'Crete-casual is right: summer shirts, dresses, denim, trainers and a more colourful queer look all fit the playful decor. There is no evidenced door code. Dress for dinner, karaoke and perhaps dancing in one continuous visit, with climate comfort ahead of nightlife theatre.',
      'staff_inclusivity', 'Warmth is the most consistent current theme. Queer groups, couples and solo diners describe smiling multilingual hosts, personal recommendations, spotless surroundings and feeling safe. A June 2026 review still found that same personal care, giving the hospitality unusually fresh support.',
      'source_urls', to_jsonb(array[
        'https://labrasserie.gr/',
        'https://www.facebook.com/labrasserie/',
        'https://www.tripadvisor.com/Restaurant_Review-g189417-d4464033-Reviews-La_Brasserie-Heraklion_Crete.html',
        'https://wanderlog.com/place/details/1449656',
        'https://www.diversityguide.at/wp-content/uploads/DG_26-1_web.pdf',
        'https://www.reddit.com/r/cretetravel/comments/1unxt4p/lesbianqueer_spaces_in_heraklion_or_crete/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Restaurant_Review-g189417-d4464033-Reviews-La_Brasserie-Heraklion_Crete.html','https://wanderlog.com/place/details/1449656']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.tripadvisor.com/Restaurant_Review-g189417-d4464033-Reviews-La_Brasserie-Heraklion_Crete.html','https://wanderlog.com/place/details/1449656','https://labrasserie.gr/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Restaurant_Review-g189417-d4464033-Reviews-La_Brasserie-Heraklion_Crete.html','https://www.diversityguide.at/wp-content/uploads/DG_26-1_web.pdf','https://www.reddit.com/r/cretetravel/comments/1unxt4p/lesbianqueer_spaces_in_heraklion_or_crete/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1449656','https://www.tripadvisor.com/Restaurant_Review-g189417-d4464033-Reviews-La_Brasserie-Heraklion_Crete.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Restaurant_Review-g189417-d4464033-Reviews-La_Brasserie-Heraklion_Crete.html','https://wanderlog.com/place/details/1449656']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (85::bigint, jsonb_build_object(
      'queue_wait', 'This intimate third-floor hotel has normal check-in rather than a public queue. Send your arrival time, especially if reaching Berlin late, and use the historic lift for luggage. Pride and major Schöneberg weekends are a room-availability problem, so book early rather than planning around lobby wait.',
      'best_nights', 'Friday and Saturday put the surrounding Rainbow Kiez at its liveliest, with major gay bars downstairs and nearby; midweek offers the same walkability with quieter sleep. Breakfast runs until noon, a genuinely useful detail after Berlin nightlife. Choose dates by the city event calendar.',
      'crowd_mix', 'Gay solo travellers and couples form the heart of the small hotel, joined by returning international guests and heterosexual visitors explicitly welcomed by the property. It feels personal and home-like rather than like a party resort, with neighbourhood knowledge as part of the stay.',
      'dress_code', 'There is no hotel dress code: street clothes, nightlife gear and a slow breakfast look all coexist. The adjacent bar and club are separate businesses with their own atmosphere, so do not treat the stairwell as a continuation of the bedroom or assume hotel access overrides venue rules.',
      'staff_inclusivity', 'Current reviews are exceptionally consistent: warm owners, friendly staff, queer comfort, useful local advice and a willingness to solve small problems. Guests also praise cleanliness and made-to-order breakfast. The old building and vintage lift add character, but accessibility deserves checking before booking.',
      'source_urls', to_jsonb(array[
        'https://www.arthotel-connection.de/',
        'https://www.tripadvisor.com/Hotel_Review-g187323-d196258-Reviews-ArtHotel_Connection-Berlin.html',
        'https://www.booking.com/reviews/de/hotel/arthotel-connection-gay.de.html',
        'https://www.booking.com/hotel/de/arthotel-connection-gay.en-gb.html',
        'https://wanderlog.com/place/details/2465848/arthotel-connection'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://www.arthotel-connection.de/','https://www.booking.com/reviews/de/hotel/arthotel-connection-gay.de.html','https://www.tripadvisor.com/Hotel_Review-g187323-d196258-Reviews-ArtHotel_Connection-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.arthotel-connection.de/','https://www.tripadvisor.com/Hotel_Review-g187323-d196258-Reviews-ArtHotel_Connection-Berlin.html','https://www.booking.com/hotel/de/arthotel-connection-gay.en-gb.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.arthotel-connection.de/','https://www.tripadvisor.com/Hotel_Review-g187323-d196258-Reviews-ArtHotel_Connection-Berlin.html','https://www.booking.com/reviews/de/hotel/arthotel-connection-gay.de.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://www.arthotel-connection.de/','https://www.booking.com/reviews/de/hotel/arthotel-connection-gay.de.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Hotel_Review-g187323-d196258-Reviews-ArtHotel_Connection-Berlin.html','https://www.booking.com/reviews/de/hotel/arthotel-connection-gay.de.html','https://wanderlog.com/place/details/2465848/arthotel-connection']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (84::bigint, jsonb_build_object(
      'queue_wait', 'Reception works like a large hotel, not a club door; the real pressure is room inventory around Pride and fetish weekends. Early arrivals can leave bags. Check renovation notices before paying: the rooftop wellness area is officially out of service during current improvement works.',
      'best_nights', 'A weekend stay puts Schöneberg bars at full energy and makes the hotel more social, while Sunday-to-Thursday suits sightseeing and quieter sleep. Do not choose dates solely for the famous spa atmosphere until reopening is confirmed; current construction changes a central part of the experience.',
      'crowd_mix', 'International gay men, couples and solo travellers remain the visible core, with other LGBTQ+ guests and heterosexual allies also welcomed. It is more social and male-led than a generic city hotel, yet individual stays range from private sightseeing base to active guest-to-guest mingling.',
      'dress_code', 'No clothing code applies in rooms or public hotel areas; polished city clothes, clubwear and casual breakfast looks are normal. If the wellness floor reopens, verify its current etiquette directly rather than relying on old stories about nudity or cruising. Hotel consent and privacy still apply everywhere.',
      'staff_inclusivity', 'Friendly, chatty reception teams and thoughtful birthday care earn strong recent praise. The physical product is less consistent: reviews report dark or worn rooms, broken features and spa closures not disclosed early enough. Human hospitality often outperforms the maintenance standard.',
      'source_urls', to_jsonb(array[
        'https://www.axelhotels.com/en/axel-hotel-berlin/hotel',
        'https://www.tripadvisor.com/Hotel_Review-g187323-d1230204-Reviews-Axel_Hotel_Berlin-Berlin.html',
        'https://www.holidaycheck.de/hr/bewertungen-axel-hotel-berlin/7fd6a175-c99d-32e9-befa-692ffdd76edd',
        'https://www.reddit.com/r/askgaybros/comments/1qcuep7/axel_hotel_berlin_review/',
        'https://www.reddit.com/r/AskGaybrosOver30/comments/1fefkt0'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.axelhotels.com/en/axel-hotel-berlin/hotel','https://www.tripadvisor.com/Hotel_Review-g187323-d1230204-Reviews-Axel_Hotel_Berlin-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.axelhotels.com/en/axel-hotel-berlin/hotel','https://www.tripadvisor.com/Hotel_Review-g187323-d1230204-Reviews-Axel_Hotel_Berlin-Berlin.html','https://www.reddit.com/r/AskGaybrosOver30/comments/1fefkt0']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.axelhotels.com/en/axel-hotel-berlin/hotel','https://www.tripadvisor.com/Hotel_Review-g187323-d1230204-Reviews-Axel_Hotel_Berlin-Berlin.html','https://www.holidaycheck.de/hr/bewertungen-axel-hotel-berlin/7fd6a175-c99d-32e9-befa-692ffdd76edd']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://www.axelhotels.com/en/axel-hotel-berlin/hotel','https://www.tripadvisor.com/Hotel_Review-g187323-d1230204-Reviews-Axel_Hotel_Berlin-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Hotel_Review-g187323-d1230204-Reviews-Axel_Hotel_Berlin-Berlin.html','https://www.holidaycheck.de/hr/bewertungen-axel-hotel-berlin/7fd6a175-c99d-32e9-befa-692ffdd76edd','https://www.reddit.com/r/AskGaybrosOver30/comments/1fefkt0']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (41::bigint, jsonb_build_object(
      'queue_wait', 'Two dining rooms hold about 70 people, and the unreservable Boxhagener Platz terrace disappears quickly in good weather. Book online for up to eight; larger groups should call. Weekend lunch and dinner fill fastest, so walk-ins should arrive near the 1 pm opening or accept an indoor table.',
      'best_nights', 'Dinner receives more consistent praise than the busy brunch-style weekend service. Friday and Saturday take last food orders later, at 10:30 pm; Sunday closes the kitchen at 9. Choose a warm terrace afternoon for neighbourhood theatre, or a weekday evening for calmer regional cooking.',
      'crowd_mix', 'Friedrichshain residents, couples, families, arena visitors and tourists form a mainstream neighbourhood-restaurant crowd. The surrounding district is queer-friendly, but this is not a dedicated LGBTQ+ venue and there is no evidenced gay event night. Come for food and Boxi life, not community programming.',
      'dress_code', 'Berlin restaurant casual is enough: trainers, denim, work clothes and relaxed date-night layers all fit. There is no fashion door. Dress for terrace weather and the walk from Warschauer Straße rather than nightlife performance; the room is rustic and comfortable, not formal.',
      'staff_inclusivity', 'Regulars praise years of steady food quality and attentive, very kind service, including fresh 2026 accounts. Weekend brunch reviews are less reliable, with occasional slow or disappointing visits. Booking, stating dietary needs clearly and choosing dinner give the team the best chance to deliver.',
      'venue_classification', 'mainstream_restaurant_queer_friendly_context',
      'source_urls', to_jsonb(array[
        'https://www.kurhaus-korsakow.de/en/opening-hours-location',
        'https://www.kurhaus-korsakow.de/reservierung',
        'https://www.kurhaus-korsakow.de/fileadmin/user_upload/galerie/Speisekarte_Website_-_englisch.pdf',
        'https://www.tripadvisor.de/Restaurant_Review-g187323-d1776050-Reviews-Kurhaus_Korsakow-Berlin.html',
        'https://wanderlog.com/place/details/421009/kurhaus-korsakow',
        'https://www.gayout.com/he/europe/germany/berlin/restaurants/kurhaus-korsakow-3424',
        'https://www.quandoo.de/place/kurhaus-korsakow-12532/bewertungen?locale=de_DE&reviewPage=4'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.kurhaus-korsakow.de/reservierung','https://www.kurhaus-korsakow.de/en/opening-hours-location','https://www.quandoo.de/place/kurhaus-korsakow-12532/bewertungen?locale=de_DE&reviewPage=4']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.kurhaus-korsakow.de/en/opening-hours-location','https://wanderlog.com/place/details/421009/kurhaus-korsakow','https://www.tripadvisor.de/Restaurant_Review-g187323-d1776050-Reviews-Kurhaus_Korsakow-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://www.kurhaus-korsakow.de/en/opening-hours-location','https://wanderlog.com/place/details/421009/kurhaus-korsakow','https://www.tripadvisor.de/Restaurant_Review-g187323-d1776050-Reviews-Kurhaus_Korsakow-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.kurhaus-korsakow.de/en/opening-hours-location','https://wanderlog.com/place/details/421009/kurhaus-korsakow']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.de/Restaurant_Review-g187323-d1776050-Reviews-Kurhaus_Korsakow-Berlin.html','https://wanderlog.com/place/details/421009/kurhaus-korsakow','https://www.gayout.com/he/europe/germany/berlin/restaurants/kurhaus-korsakow-3424']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (56, 64, 68, 1438, 1453, 85, 84, 41)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
