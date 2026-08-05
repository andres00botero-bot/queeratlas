-- Queer Atlas venue intelligence: global review-led editorial pass, batch 7.
-- Amsterdam, Barcelona, Brighton, Cologne, Copenhagen, Lisbon, London and Madrid.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (103::bigint, jsonb_build_object(
      'queue_wait', 'Friday and Saturday presale helps, but the door host still makes the final call and priority windows can expire at midnight. Pride and headline parties produce real queues, so arrive within your ticket window, sober enough for the door conversation and with physical ID.',
      'best_nights', 'Saturday is the signature queer-pop blowout across several floors; Friday offers a broader open-minded party mix. Thursday is shorter and easier if you want the colourful NYX world without full weekend intensity. Always choose by the listed concept, not the club name alone.',
      'crowd_mix', 'Young Amsterdam queer clubbers, internationals and tourists share the floors with straight friends who understand whose space they are entering. It is proudly queer but intentionally mixed, with pop lovers downstairs and different sounds creating smaller tribes upstairs.',
      'dress_code', 'There is no standing costume uniform. Expressive clubwear, casual Amsterdam layers, trainers and drag-ready looks all work; knowing the night and respecting its queer purpose matter more than dressing expensive. Entry is 18+ and proper identification is required.',
      'staff_inclusivity', 'The published code explicitly rejects homophobia, racism, transphobia, ableism and body shaming, and the venue builds its identity around equality. The door is discretionary, however, and guests can be questioned about the party, so a warm internal policy does not guarantee automatic entry.',
      'source_urls', to_jsonb(array[
        'https://clubnyx.nl/about/',
        'https://clubnyx.nl/contact/',
        'https://clubnyx.nl/faqs/',
        'https://clubnyx.nl/wp-content/uploads/2023/07/NYXHOUSERULES.pdf',
        'https://www.iamsterdam.com/en/whats-on/calendar/eating-and-drinking/cafes-and-bars/club-nyx',
        'https://ra.co/events/2487475',
        'https://ra.co/events/2487503'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://clubnyx.nl/faqs/','https://clubnyx.nl/wp-content/uploads/2023/07/NYXHOUSERULES.pdf','https://ra.co/events/2487475']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://clubnyx.nl/contact/','https://clubnyx.nl/agenda/3x-nyx/','https://www.iamsterdam.com/en/whats-on/calendar/eating-and-drinking/cafes-and-bars/club-nyx']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://clubnyx.nl/about/','https://www.iamsterdam.com/en/whats-on/calendar/eating-and-drinking/cafes-and-bars/club-nyx','https://www.reddit.com/r/gay/comments/1c4vf3e/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://clubnyx.nl/wp-content/uploads/2023/07/NYXHOUSERULES.pdf','https://www.iamsterdam.com/en/whats-on/clubbing-and-nightlife/the-definitive-locals-guide-to-going-out-in-amsterdam','https://www.reddit.com/r/amsterdam_rave/comments/1ulzfc8/dress_code_casual_and_gimme_bass/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://clubnyx.nl/faqs/','https://ra.co/events/2487503','https://clubnyx.nl/wp-content/uploads/2023/07/NYXHOUSERULES.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (108::bigint, jsonb_build_object(
      'queue_wait', 'Punto works best as an early Eixample bar, and entry is normally easier than at a full nightclub. It grows busier before the surrounding clubs wake up; Friday and Saturday can make the bar and pool-table area tight, but a long formal queue is not the recurring pattern.',
      'best_nights', 'Friday or Saturday evening brings the strongest mix of drinks, music and occasional live performance before a later club. Tuesday to Thursday suits pool, conversation and cheaper-flowing early hours. Treat it as the social first chapter, not Barcelona''s final dancefloor.',
      'crowd_mix', 'Gay men from Barcelona mix with tourists, repeat visitors and friends beginning a Gaixample circuit. The room is casual enough for solo arrivals and more conversational than a megaclub, though its central location keeps the local-to-visitor ratio fluid through the week.',
      'dress_code', 'Everyday Gaixample nightwear is enough: tees, denim, trainers or a cleaner bar-hop look. There is no evidenced formal dress code; bring valid ID and dress for pool, standing drinks and the possibility of continuing somewhere louder afterward.',
      'staff_inclusivity', 'Plenty of guests praise friendly bartenders and an easy atmosphere, but recent feedback is meaningfully mixed. Complaints include slow or rude service and a serious report of disrespect toward trans women at the door, so Queer Atlas cannot describe the welcome as consistently inclusive.',
      'source_urls', to_jsonb(array[
        'https://wanderlog.com/place/details/2203031/punto-bcn',
        'https://www.tripadvisor.es/Restaurant_Review-g187497-d25193353-Reviews-Punto_Bcn-Barcelona_Catalonia.html',
        'https://www.reddit.com/r/AskBarcelonaTourism/comments/1ta6hqy/lesbiangay_bar_in_barcelona/',
        'https://www.barcelonaturisme.com/files/11316-36-arxiuCAST/LGBTIQ_Barcelona_web_2020.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2203031/punto-bcn','https://www.tripadvisor.es/Restaurant_Review-g187497-d25193353-Reviews-Punto_Bcn-Barcelona_Catalonia.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2203031/punto-bcn','https://www.reddit.com/r/AskBarcelonaTourism/comments/1ta6hqy/lesbiangay_bar_in_barcelona/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2203031/punto-bcn','https://www.reddit.com/r/AskBarcelonaTourism/comments/1ta6hqy/lesbiangay_bar_in_barcelona/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2203031/punto-bcn','https://www.tripadvisor.es/Restaurant_Review-g187497-d25193353-Reviews-Punto_Bcn-Barcelona_Catalonia.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2203031/punto-bcn','https://www.tripadvisor.es/Restaurant_Review-g187497-d25193353-Reviews-Punto_Bcn-Barcelona_Catalonia.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (116::bigint, jsonb_build_object(
      'queue_wait', 'By day this is a traditional Kemptown pub with little ceremony at the door. Karaoke, cabaret and bear-party nights can pack the room and bar, but reviewers more often describe fast-working staff than a long outside line. Arrive before the entertainment for an easy base.',
      'best_nights', 'Choose the listing: karaoke is the most immediately social option, while cabaret and live-DJ nights take the old pub into a later, louder gear. A bear event brings the most specific community crowd; an afternoon pint shows its unfussy neighbourhood side.',
      'crowd_mix', 'Brighton gay regulars and older pub loyalists meet visiting men, bear-party guests, karaoke singers and mixed LGBTQ+ friends. Its working-pub character feels less polished than the seafront circuit, which is exactly why some guests love it and others do not.',
      'dress_code', 'No fashion theatre is required: jeans, tees, trainers, bear gear or a cheerful karaoke look all fit. Dress for a traditional boozer that may become a dance bar later, and bring layers for moving between St James''s Street and a warm, crowded room.',
      'staff_inclusivity', 'Recent karaoke and party reviews praise a supportive crowd, friendly DJ and bar team who keep drinks moving. The record is mixed, including negative local sentiment and one serious 2025 allegation about a staff member; treat the warm reports as common, not universal proof.',
      'source_urls', to_jsonb(array[
        'https://www.bulldogbrighton.co.uk/',
        'https://thatsup.co.uk/brighton/bar/the-bulldog-brighton/',
        'https://www.travelgay.com/venue/bulldog',
        'https://www.gayout.com/europe/united-kingdom/brighton/bars/bulldog-brighton',
        'https://www.tripadvisor.co.uk/Restaurant_Review-g186273-d6678750-Reviews-Bulldog_Bar-Brighton_East_Sussex_England.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/bulldog','https://www.tripadvisor.co.uk/Restaurant_Review-g186273-d6678750-Reviews-Bulldog_Bar-Brighton_East_Sussex_England.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.bulldogbrighton.co.uk/','https://www.travelgay.com/venue/bulldog','https://thatsup.co.uk/brighton/bar/the-bulldog-brighton/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.gayout.com/europe/united-kingdom/brighton/bars/bulldog-brighton','https://www.travelgay.com/venue/bulldog','https://www.tripadvisor.co.uk/Restaurant_Review-g186273-d6678750-Reviews-Bulldog_Bar-Brighton_East_Sussex_England.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://thatsup.co.uk/brighton/bar/the-bulldog-brighton/','https://www.gayout.com/europe/united-kingdom/brighton/bars/bulldog-brighton']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Restaurant_Review-g186273-d6678750-Reviews-Bulldog_Bar-Brighton_East_Sussex_England.html','https://www.travelgay.com/venue/bulldog']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (101::bigint, jsonb_build_object(
      'queue_wait', 'Entry can be quick on a well-run night, but the cloakroom is the wild card: recent guests report long bottlenecks and one two-hour wait when lockers failed. Buy for the exact event, carry official ID and travel light if you want to protect your first and last hour.',
      'best_nights', 'Follow the DJ rather than a weekday formula. International headliners, Loonyland and large bass or techno concepts are the reason to cross the river; the room often needs time to build, and locals warn that midnight can still feel early before the main set.',
      'crowd_mix', 'This is a mainstream electronic destination, not an everyday queer club. Younger Cologne ravers mix with festival-minded visitors and fans travelling for specific DJs; queer guests are part of that crowd, while LGBTQ+ focus depends entirely on the named event.',
      'dress_code', 'The official answer is simple: no general dress code. Comfortable ravewear, trainers and ear protection make more sense than performing a door look, although individual promoters can set a theme. The sound is famously intense, so practical preparation matters.',
      'staff_inclusivity', 'Fast, friendly bar teams and efficient entry appear alongside sharp complaints about security, crowd control and cloakroom organisation. The venue can deliver spectacular production without delivering equally reliable care, especially at oversold or technically disrupted events.',
      'source_urls', to_jsonb(array[
        'https://bootshaus.tv/faq/',
        'https://wanderlog.com/place/details/464335',
        'https://www.tripadvisor.co.uk/Attraction_Review-g187371-d8126228-Reviews-Bootshaus_Koln-Cologne_North_Rhine_Westphalia.html',
        'https://www.reddit.com/r/cologne/comments/17u7c67/anybody_else_disappointed_by_alle_kussen_alle_in/',
        'https://www.reddit.com/r/hardstyle/comments/1c9f8ra/lets_talk_about_bootshaus/',
        'https://www.reddit.com/r/cologne/comments/15b4y9j/where_to_go_before_boosthaus_and_any_other_must/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/464335','https://bootshaus.tv/faq/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/464335','https://www.reddit.com/r/cologne/comments/15b4y9j/where_to_go_before_boosthaus_and_any_other_must/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.reddit.com/r/Techno/comments/cz79z8/bootshaus/','https://www.reddit.com/r/hardstyle/comments/1c9f8ra/lets_talk_about_bootshaus/','https://wanderlog.com/place/details/464335']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://bootshaus.tv/faq/','https://www.reddit.com/r/cologne/comments/14cje8q/good_clubs_with_no_dress_code/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/464335','https://www.reddit.com/r/cologne/comments/17u7c67/anybody_else_disappointed_by_alle_kussen_alle_in/','https://www.reddit.com/r/hardstyle/comments/1c9f8ra/lets_talk_about_bootshaus/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (73::bigint, jsonb_build_object(
      'queue_wait', 'The challenge is finding a corner, not passing a club door. This historic pub has few seats and becomes cheerfully cramped for Sunday entertainment and its extravagant Christmas season. Late afternoon is easiest; arrive before the act if sitting matters.',
      'best_nights', 'Sunday entertainment is the classic communal choice, while occasional midweek live music can turn the whole room into a singalong. December is peak camp, with legendary decorations and glogg; choose an ordinary afternoon for quieter local conversation.',
      'crowd_mix', 'Older Copenhagen gay regulars give the bar its memory, joined by younger queer guests, straight friends and visitors making a historic pilgrimage. The mix is deliberately straight-friendly and often warm across ages, though some locals feel the gay centre of gravity has softened.',
      'dress_code', 'This is a worn-in pub, so everyday clothes are completely at home; festive knitwear becomes practically ceremonial in December. There is no fashion door. More important: indoor smoking is repeatedly reported, so wear something you will not mind airing afterward.',
      'staff_inclusivity', 'Friendly, funny and genuinely hospitable staff dominate recent accounts, including guests whose lost belongings were kept safe. A small set of criticism concerns privacy and hurried service when packed, but the recurring experience is personal hygge rather than anonymous processing.',
      'source_urls', to_jsonb(array[
        'https://www.centralhjornet.dk/',
        'https://www.visitcopenhagen.com/copenhagen/planning/centralhjornet-gdk497020',
        'https://www.tripadvisor.dk/Attraction_Review-g189541-d7151116-Reviews-Centralhjornet-Copenhagen_Zealand.html',
        'https://wanderlog.com/place/details/1372896/centralhj%C3%B8rnet',
        'https://dk.trustpilot.com/review/www.centralhjornet.dk',
        'https://www.reddit.com/r/copenhagen/comments/1po74u7/i_just_accidentally_walked_into_the_most/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.nl/Attraction_Review-g189541-d7151116-Reviews-Centralhjornet-Copenhagen_Zealand.html','https://wanderlog.com/place/details/1372896/centralhj%C3%B8rnet']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.tripadvisor.nl/Attraction_Review-g189541-d7151116-Reviews-Centralhjornet-Copenhagen_Zealand.html','https://wanderlog.com/place/details/1372896/centralhj%C3%B8rnet','https://www.reddit.com/r/copenhagen/comments/1po74u7/i_just_accidentally_walked_into_the_most/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.centralhjornet.dk/','https://www.tripadvisor.dk/Attraction_Review-g189541-d7151116-Reviews-Centralhjornet-Copenhagen_Zealand.html','https://wanderlog.com/place/details/1372896/centralhj%C3%B8rnet']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.tripadvisor.dk/Attraction_Review-g189541-d7151116-Reviews-Centralhjornet-Copenhagen_Zealand.html','https://wanderlog.com/place/details/1372896/centralhj%C3%B8rnet']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://dk.trustpilot.com/review/www.centralhjornet.dk','https://www.tripadvisor.dk/Attraction_Review-g189541-d7151116-Reviews-Centralhjornet-Copenhagen_Zealand.html','https://wanderlog.com/place/details/1372896/centralhj%C3%B8rnet']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (106::bigint, jsonb_build_object(
      'queue_wait', 'The room is tiny and the main drag show lands around 3 am, so the practical wait is often for space and sightline after a very late arrival. Go around 1:30-2 am if seeing the stage matters. Door disputes can leave guests outside much longer than expected.',
      'best_nights', 'Monday through Saturday centre on the 3 am house show; Sunday''s 3:30 am new-talent format is looser and more unpredictable. For the performance without the dawn finish, the connected cafe-concert offers an earlier 10:30 pm show.',
      'crowd_mix', 'Lisbon queer regulars, drag devotees, Brazilian and other Lusophone visitors, tourists and curious mixed groups share a notably diverse room. Portuguese helps with the jokes, but the visual performance travels easily and solo visitors regularly report finding their way in.',
      'dress_code', 'Come expressive or come simple: nightlife basics, glitter, heels and comfortable tourist clothes all coexist. There is no reliable formal dress code, but the compact room and late finish reward breathable clothes and shoes you can stand in until sunrise.',
      'staff_inclusivity', 'Recent guests often call the bartenders warm and the club small but welcoming. Door and security feedback is rougher, including unfriendly treatment and a serious complaint about being kept outside while trying to register an issue, so front-door care is inconsistent.',
      'source_urls', to_jsonb(array[
        'https://www.finalmenteclub.com/discoteca/',
        'https://www.tripadvisor.com/Attraction_Review-g189158-d606552-Reviews-Finalmente_Club-Lisbon_Lisbon_District_Central_Portugal.html',
        'https://www.tripadvisor.pt/Attraction_Review-g189158-d606552-Reviews-Finalmente_Club-Lisbon_Lisbon_District_Central_Portugal.html',
        'https://maps.apple.com/place?place-id=IE2DB89BBADDCB220',
        'https://finalmenteclub.wixsite.com/site'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.finalmenteclub.com/discoteca/','https://www.tripadvisor.com/Attraction_Review-g189158-d606552-Reviews-Finalmente_Club-Lisbon_Lisbon_District_Central_Portugal.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.finalmenteclub.com/discoteca/','https://finalmenteclub.wixsite.com/site']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://finalmenteclub.wixsite.com/site','https://www.tripadvisor.com/Attraction_Review-g189158-d606552-Reviews-Finalmente_Club-Lisbon_Lisbon_District_Central_Portugal.html','https://maps.apple.com/place?place-id=IE2DB89BBADDCB220']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g189158-d606552-Reviews-Finalmente_Club-Lisbon_Lisbon_District_Central_Portugal.html','https://maps.apple.com/place?place-id=IE2DB89BBADDCB220']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g189158-d606552-Reviews-Finalmente_Club-Lisbon_Lisbon_District_Central_Portugal.html','https://www.tripadvisor.pt/Attraction_Review-g189158-d606552-Reviews-Finalmente_Club-Lisbon_Lisbon_District_Central_Portugal.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (114::bigint, jsonb_build_object(
      'queue_wait', 'Ticketed weekend concepts and Sunday''s famous disco can create a real Vauxhall line, while the first happy-hour window is much easier. Arrive near opening for garden space and a softer landing; late entry trades waiting risk for a dancefloor already in motion.',
      'best_nights', 'Sunday is the institution: an open-hearted disco crowd from 8 pm into the small hours. Friday and Saturday rotate distinct queer concepts, so check the music and audience before buying. Thursday is the low-pressure choice for drinks, pool and the garden.',
      'crowd_mix', 'Gay men and Vauxhall regulars remain the foundation, but the old leather identity has widened to bears, club kids, drag queens, fashion crowds, other LGBTQ+ guests, allies and international visitors. The exact balance changes dramatically with each named party.',
      'dress_code', 'There is no universal Eagle uniform now. Leather, sportswear, disco glamour, everyday club clothes and themed looks all appear; read the event page because a bear night and a pop night are different rooms socially, even at the same address.',
      'staff_inclusivity', 'Warm reception, friendly staff and a genuinely fun garden recur in positive reviews. Other guests describe cold bartending or an unfriendly security interaction, so the venue''s inclusive mission is credible without making every shift equally welcoming.',
      'source_urls', to_jsonb(array[
        'https://www.eaglelondon.com/about-us',
        'https://www.eaglelondon.com/',
        'https://www.tripadvisor.com/Attraction_Review-g186338-d27481303-Reviews-Eagle_London-London_England.html',
        'https://whereis.gay/listing/eagle-london/',
        'https://www.travelgay.com/venue/eagle-london',
        'https://www.reddit.com/r/londonlgbt/comments/1sxh0lu/030526_horse_meat_disco_at_eagle_vauxhall/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.eaglelondon.com/','https://www.tripadvisor.com/Attraction_Review-g186338-d27481303-Reviews-Eagle_London-London_England.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.eaglelondon.com/about-us','https://www.eaglelondon.com/','https://www.travelgay.com/venue/eagle-london']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.eaglelondon.com/about-us','https://www.travelgay.com/venue/eagle-london','https://www.reddit.com/r/londonlgbt/comments/1sxh0lu/030526_horse_meat_disco_at_eagle_vauxhall/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.eaglelondon.com/about-us','https://www.eaglelondon.com/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g186338-d27481303-Reviews-Eagle_London-London_England.html','https://www.tripadvisor.fr/Attraction_Review-g186338-d27481303-Reviews-Eagle_London-London_England.html','https://whereis.gay/listing/eagle-london/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (67::bigint, jsonb_build_object(
      'queue_wait', 'This is a small Chueca bar, so the usual issue is a cosy squeeze rather than a nightclub queue. Early evening is simple and the daily two-for-one window runs until midnight. Check social posts before Sunday: private gatherings have occasionally surprised walk-ins at the door.',
      'best_nights', 'Friday and Saturday bring the fullest bear-bar energy and stay open later. An early weekday is better for conversation and actually joining the regulars; arrive before midnight for the drink promotion. Monthly special nights can change both clothing and crowd expectations.',
      'crowd_mix', 'Bears, cubs, chubs, mature gay men and admirers form the clear centre, with locals and visiting bear travellers mixing easily. It is male-led and specific rather than a general LGBTQ+ bar, but friendly reviews suggest newcomers who enjoy the culture are readily folded into conversation.',
      'dress_code', 'Casual and comfortably masculine is the everyday mood: tees, denim, trainers, bear gear or whatever feels natural. No standard formal code is reported, but check the calendar because an occasional themed or clothes-off event is a different proposition from a normal drink.',
      'staff_inclusivity', 'Many guests describe a warm welcome, friendly bears and staff who draw solo visitors into conversation. A minority reports an aloof owner or an unexplained private-night refusal, so the personal small-bar charm can also become selective when communication fails.',
      'source_urls', to_jsonb(array[
        'https://wanderlog.com/place/details/2550889/bears-bar',
        'https://es.travelgay.com/venue/bears-bar-madrid',
        'https://maps.apple.com/place?place-id=IF41850B2CC7AA7FD',
        'https://www.reddit.com/r/askgaybros/comments/124lvxq/best_gay_cruising_cruising_club_in_madrid/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2550889/bears-bar','https://es.travelgay.com/venue/bears-bar-madrid']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://es.travelgay.com/venue/bears-bar-madrid','https://wanderlog.com/place/details/2550889/bears-bar','https://www.reddit.com/r/askgaybros/comments/124lvxq/best_gay_cruising_cruising_club_in_madrid/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://es.travelgay.com/venue/bears-bar-madrid','https://wanderlog.com/place/details/2550889/bears-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2550889/bears-bar','https://www.reddit.com/r/askgaybros/comments/124lvxq/best_gay_cruising_cruising_club_in_madrid/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2550889/bears-bar','https://es.travelgay.com/venue/bears-bar-madrid','https://maps.apple.com/place?place-id=IF41850B2CC7AA7FD']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (103, 108, 116, 101, 73, 106, 114, 67)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
