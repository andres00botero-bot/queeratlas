-- Queer Atlas venue intelligence: global review-led editorial pass, batch 8.
-- Brussels, Manchester, Milan, Mykonos, Rome, Stockholm, Torremolinos and Vienna.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (123::bigint, jsonb_build_object(
      'queue_wait', 'The little Via Lecco room and pavement tables fill during aperitivo, so coming near 6 pm gives you a better chance to sit and hear yourself think. Later arrivals usually face a lively standing squeeze rather than a nightclub-style door queue.',
      'best_nights', 'Aperitivo is the signature window, especially Wednesday through Saturday when DJs, karaoke or live programming may follow. Come early for food and conversation, then let Porta Venezia decide the second stop; this works better as a social launch than a dawn finale.',
      'crowd_mix', 'Milan gay men and neighbourhood regulars form the core, joined by straight friends, international residents and visitors exploring Via Lecco. The talkative street-side energy is more mixed than a men-only bar, although the room still reads clearly gay-led.',
      'dress_code', 'Milan style is visible but not enforced: clean casual clothes, office-to-aperitivo layers and a sharper evening look all fit. There is no evidenced formal code, and the bar is deliberately more unpretentious than the city''s fashion mythology suggests.',
      'staff_inclusivity', 'Many recent guests find the team kind, the cocktails strong and tourists genuinely welcomed. Several 2025 reviews report the opposite—aggressive treatment of foreigners and poor help with vegan ingredients—so hospitality is too inconsistent to promise without qualification.',
      'source_urls', to_jsonb(array[
        'https://www.thegayagenda.fyi/milan/businesses/leccomilano/',
        'https://www.gayplaces.co/city/milan/bar/leccomilano',
        'https://www.travelgay.com/venue/leccomilano',
        'https://wanderlog.com/place/details/1105091/leccomilano',
        'https://www.tripadvisor.com/Restaurant_Review-g187849-d6771471-Reviews-LeccoMilano_Un_Buco_di_Bar-Milan_Lombardy.html',
        'https://www.tripadvisor.it/Restaurant_Review-g187849-d6771471-Reviews-LeccoMilano_Un_Buco_di_Bar-Milan_Lombardy.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1105091/leccomilano','https://www.tripadvisor.com/Restaurant_Review-g187849-d6771471-Reviews-LeccoMilano_Un_Buco_di_Bar-Milan_Lombardy.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.thegayagenda.fyi/milan/businesses/leccomilano/','https://www.travelgay.com/venue/leccomilano','https://wanderlog.com/place/details/1105091/leccomilano']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.gayplaces.co/city/milan/bar/leccomilano','https://wanderlog.com/place/details/1105091/leccomilano','https://www.tripadvisor.com/Restaurant_Review-g187849-d6771471-Reviews-LeccoMilano_Un_Buco_di_Bar-Milan_Lombardy.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.gayplaces.co/city/milan/bar/leccomilano','https://www.tripadvisor.com/Restaurant_Review-g187849-d6771471-Reviews-LeccoMilano_Un_Buco_di_Bar-Milan_Lombardy.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1105091/leccomilano','https://www.tripadvisor.com/Restaurant_Review-g187849-d6771471-Reviews-LeccoMilano_Un_Buco_di_Bar-Milan_Lombardy.html','https://www.tripadvisor.it/Restaurant_Review-g187849-d6771471-Reviews-LeccoMilano_Un_Buco_di_Bar-Milan_Lombardy.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (120::bigint, jsonb_build_object(
      'queue_wait', 'Friday lists are nominal and limited, and the organiser explicitly recommends coming early. Big openings, Pride editions and guest nights build queues at Qube; once inside, the cloakroom can become a second bottleneck, so buy presale and travel light.',
      'best_nights', 'This is a Friday ritual rather than an everyday club. The main season runs 11 pm-5 am at Qube with three distinct floors; summer dates can move outdoors and change format. Pick by theme, but arrive early enough to catch the staged show before the rooms peak.',
      'crowd_mix', 'Young Roman LGBTQ+ clubbers lead a huge, theatrical mix with gay men, lesbians, trans guests, straight friends and international visitors. The techno floor is currently designated men-only, while the pop and main rooms carry the broader community crowd.',
      'dress_code', 'The general door is flexible: harnesses, sportswear, club-kid drama, glitter and simple tourist clothes all appear. Dress for hours of dancing and check the exact poster, since special themes and the men-only techno room can carry more specific expectations.',
      'staff_inclusivity', 'The party''s community mission and freedom-of-expression message are explicit, but operational reviews are uneven. Guests praise the spectacle and music while others report rude bouncers, rough security and chaotic coat retrieval; institutional queer history does not erase those concerns.',
      'source_urls', to_jsonb(array[
        'https://www.muccassassina.com/',
        'https://www.muccassassina.com/events/',
        'https://wanderlog.com/place/details/1384367/muccassassina',
        'https://www.gayout.com/europe/italy/rome/bars/muccassassina-rome',
        'https://www.nighttours.com/rome/gayguide/muccassassina.html',
        'https://www.travelgay.com/venue/muccassassina'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.muccassassina.com/events/','https://wanderlog.com/place/details/1384367/muccassassina','https://www.nighttours.com/rome/gayguide/muccassassina.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.muccassassina.com/','https://www.muccassassina.com/events/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.muccassassina.com/events/','https://www.travelgay.com/venue/muccassassina','https://www.nighttours.com/rome/gayguide/muccassassina.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.muccassassina.com/events/','https://www.nighttours.com/rome/gayguide/muccassassina.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.muccassassina.com/','https://wanderlog.com/place/details/1384367/muccassassina','https://www.gayout.com/europe/italy/rome/bars/muccassassina-rome']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (109::bigint, jsonb_build_object(
      'queue_wait', 'Saturday is the dependable club night, with selected Friday events and festival weekends adding heavier entry pressure. Cover has recently landed around €18-30 with a drink on some nights. Buy for the named party and arrive before the guest DJ if you dislike queues.',
      'best_nights', 'Saturday delivers the regular big-room formula: international DJs, go-go dancers, themed production and late dancing. Friday is worth choosing only when the calendar names a specific event; Pride and circuit-festival weekends create the most international, maximal version.',
      'crowd_mix', 'Gay men from Torremolinos and the wider Costa del Sol mix with Spanish weekenders, retired local residents and international circuit visitors. The room skews polished and male, but it is built for dancing rather than cruising and becomes especially global during festivals.',
      'dress_code', 'Smart, fitted clubwear and a little holiday glamour suit the crowd, though no reliable strict code is published. Trainers can work; beach flip-flops and just-came-from-the-pool energy are less natural. Festival themes may reward harnesses or bolder circuit looks.',
      'staff_inclusivity', 'Friendly, helpful staff and strong music lead positive recent reports. Others flag weak ventilation, maintenance, inconsistent security checks and expensive low-quality drinks, so the social welcome can be better than the physical comfort or operational polish.',
      'source_urls', to_jsonb(array[
        'https://wanderlog.com/place/details/1790830/centuryon',
        'https://nl.travelgay.com/venue/centuryon',
        'https://www.patroc.com/gay/torremolinos/gayguide.html',
        'https://xceed.me/ca/torremolinos/event/infinity-festival-10th-edition/205581'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1790830/centuryon','https://nl.travelgay.com/venue/centuryon']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://nl.travelgay.com/venue/centuryon','https://xceed.me/ca/torremolinos/event/infinity-festival-10th-edition/205581']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1790830/centuryon','https://www.patroc.com/gay/torremolinos/gayguide.html','https://xceed.me/ca/torremolinos/event/infinity-festival-10th-edition/205581']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1790830/centuryon','https://nl.travelgay.com/venue/centuryon']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1790830/centuryon','https://nl.travelgay.com/venue/centuryon']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (94::bigint, jsonb_build_object(
      'queue_wait', 'Village is genuinely small, and a busy evening can feel full with no dramatic door line at all. Arrive close to 8 pm for a stool and easier introductions; Friday and Saturday become a narrow standing cocktail bar where personal space disappears before service necessarily does.',
      'best_nights', 'Friday and Saturday stay open later and offer the liveliest music-video-bar mood. Tuesday through Thursday are better for conversation and meeting regulars without shouting. For a solo visit, early evening gives the friendly little room time to adopt you.',
      'crowd_mix', 'Vienna gay men and Naschmarkt-area regulars form the base, with visitors and English-speaking newcomers readily folded in. The room is mixed in age but still male-led; its scale feels like a local pub with polished cocktails rather than a tourist circuit stop.',
      'dress_code', 'Smart-casual Vienna basics work perfectly: jeans, a clean tee or shirt, trainers and easy date-night layers. There is no documented fashion door. Choose something comfortable in a close room rather than trying to match the trendier label found in older listings.',
      'staff_inclusivity', 'Friendly bartenders are the most consistent reason guests praise this place, and recent community notes describe visitors being welcomed into the regulars'' orbit. The evidence base is smaller than for major clubs, so the warm signal is strong but not broad enough to call universal.',
      'source_urls', to_jsonb(array[
        'https://www.tripadvisor.at/Attraction_Review-g190454-d19859333-Reviews-Village_Bar-Vienna.html',
        'https://www.travelgay.com/venue/village-bar',
        'https://whereis.gay/village-bar',
        'https://www.corner.inc/place/p4ZaHq6qj7UR',
        'https://www.gayout.com/europe/austria/vienna/bars/village-bar-1745'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.at/Attraction_Review-g190454-d19859333-Reviews-Village_Bar-Vienna.html','https://www.corner.inc/place/p4ZaHq6qj7UR']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.travelgay.com/venue/village-bar','https://www.gayout.com/europe/austria/vienna/bars/village-bar-1745']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.at/Attraction_Review-g190454-d19859333-Reviews-Village_Bar-Vienna.html','https://www.corner.inc/place/p4ZaHq6qj7UR','https://whereis.gay/village-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.travelgay.com/venue/village-bar','https://www.tripadvisor.at/Attraction_Review-g190454-d19859333-Reviews-Village_Bar-Vienna.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.at/Attraction_Review-g190454-d19859333-Reviews-Village_Bar-Vienna.html','https://www.corner.inc/place/p4ZaHq6qj7UR','https://www.gayout.com/europe/austria/vienna/bars/village-bar-1745']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (118::bigint, jsonb_build_object(
      'queue_wait', 'This is a private members club, so membership—not a casual walk-up queue—is the first practical hurdle. Have it arranged before arrival and expect it to be checked at the door or bar. Fetish events may also set last-entry times; late weekend hours do not mean unrestricted access.',
      'best_nights', 'Friday and Saturday run latest, but the right night depends on the men''s event calendar. The third-Friday bondage social offers a defined fetish community window with earlier last entry; Wednesday or Thursday is better for a less programmed drink among members.',
      'crowd_mix', 'The venue explicitly operates as a men-only members bar, drawing gay, bi and queer men from Manchester and beyond, including leather and fetish communities. That narrow policy is central to the experience and means it is not an all-genders LGBTQ+ space.',
      'dress_code', 'Ordinary nights permit casual men''s clothes, jeans, shorts, leather, rubber, denim and kilts. Event rules can be much tighter, so check before packing fetish gear. Membership conduct and presenting within the venue''s men-only policy matter as much as the outfit itself.',
      'staff_inclusivity', 'Regular staff receive warm praise from some guests, but the inclusion boundary is explicit and consequential. A trans woman reported being removed after being questioned about her identity, while a 2025 review describes one bar manager as hostile; this is not a safe universal recommendation.',
      'source_urls', to_jsonb(array[
        'https://www.eaglemanchester.com/',
        'https://www.eaglemanchester.com/contact',
        'https://fd97201c-3490-4b45-8107-2a93872e84a4.filesusr.com/ugd/c305a5_e034a03843cf4d5385fdcea4871b6983.pdf',
        'https://mancsbound.co.uk/faqs',
        'https://www.tripadvisor.co.uk/Attraction_Review-g187069-d20480920-Reviews-The_Eagle_Manchester-Manchester_Greater_Manchester_England.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.eaglemanchester.com/','https://fd97201c-3490-4b45-8107-2a93872e84a4.filesusr.com/ugd/c305a5_e034a03843cf4d5385fdcea4871b6983.pdf','https://mancsbound.co.uk/faqs']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.eaglemanchester.com/contact','https://mancsbound.co.uk/faqs']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.eaglemanchester.com/','https://fd97201c-3490-4b45-8107-2a93872e84a4.filesusr.com/ugd/c305a5_e034a03843cf4d5385fdcea4871b6983.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://fd97201c-3490-4b45-8107-2a93872e84a4.filesusr.com/ugd/c305a5_e034a03843cf4d5385fdcea4871b6983.pdf','https://mancsbound.co.uk/faqs']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.eaglemanchester.com/','https://www.tripadvisor.co.uk/Attraction_Review-g187069-d20480920-Reviews-The_Eagle_Manchester-Manchester_Greater_Manchester_England.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (130::bigint, jsonb_build_object(
      'queue_wait', 'For a major headliner, buy ahead and expect the entrance to move with the island''s 2 am rhythm. A fresh July 2026 report found almost no line at 1 am and roughly 15-20 minutes closer to 2; three large bars kept drink waits short even as the crowd built.',
      'best_nights', 'The DJ is the night. Check the 2026 lineup and choose the artist rather than assuming Saturday is automatically best. Headliners commonly arrive around 2:30 am, and staying until the Aegean sunrise is the defining experience; early 11 pm entry can feel premature.',
      'crowd_mix', 'This is a mainstream international electronic club, not a dedicated queer venue. Stylish Greek and global holiday crowds, music travellers, VIP groups and selfie-ready Mykonos visitors share the cliff; queer guests are common on the island but not the programming centre.',
      'dress_code', 'The official rule is chic, comfortable and evening-appropriate. Jeans, jumpsuits, dresses, polished shirts and Birkenstocks can work; swimwear, beachwear and flip-flops do not. Bring a physical or clear digital ID and something that survives dancing until 7 am.',
      'staff_inclusivity', 'Professional, warm bar and VIP service earns strong recent praise, and accessibility support is explicitly offered. Reviews also include rude or arbitrary security encounters, including women denied after a confrontation, so smooth hospitality is common without being guaranteed at the door.',
      'source_urls', to_jsonb(array[
        'https://www.cavoparadiso.gr/',
        'https://www.cavoparadiso.gr/faq.asp',
        'https://wanderlog.com/place/details/66113/cavo-paradiso',
        'https://www.tripadvisor.com/Attraction_Review-g189430-d8389491-Reviews-Cavo_Paradiso_Club_Mykonos-Mykonos_Cyclades_South_Aegean.html',
        'https://www.reddit.com/r/Mykonos/comments/1upjokg/cavo_paradiso_question/',
        'https://thediscreetgentleman.com/countries/greece/mykonos/mykonos-town/cavo-paradiso'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.cavoparadiso.gr/','https://www.reddit.com/r/Mykonos/comments/1upjokg/cavo_paradiso_question/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.cavoparadiso.gr/','https://wanderlog.com/place/details/66113/cavo-paradiso','https://www.reddit.com/r/Mykonos/comments/1upjokg/cavo_paradiso_question/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.cavoparadiso.gr/','https://wanderlog.com/place/details/66113/cavo-paradiso','https://thediscreetgentleman.com/countries/greece/mykonos/mykonos-town/cavo-paradiso']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.cavoparadiso.gr/faq.asp','https://www.cavoparadiso.gr/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.cavoparadiso.gr/','https://wanderlog.com/place/details/66113/cavo-paradiso','https://www.tripadvisor.com/Attraction_Review-g189430-d8389491-Reviews-Cavo_Paradiso_Club_Mykonos-Mykonos_Cyclades_South_Aegean.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (95::bigint, jsonb_build_object(
      'queue_wait', 'Most of the social life spills onto Rue du Marché au Charbon, so a packed evening feels like a pavement gathering before it feels like a formal queue. Wednesday is easier; Thursday happy hour and Friday-Saturday bring the tightest bar and smallest dance space.',
      'best_nights', 'Thursday''s 8-10 pm happy hour is the best-value social start. Friday and Saturday keep the DJ energy later and work well before a bigger club; Sunday offers the same central gay-street connection with an earlier finish and less weekend crush.',
      'crowd_mix', 'Brussels gay men and city regulars anchor the bar, joined by friends, women, expats and visitors following the queer street. It is diverse but still recognisably male-led, with much of the mixing happening outside where the whole block becomes the room.',
      'dress_code', 'Central Brussels bar clothes are enough: denim, trainers, office-to-drinks layers or a sharper weekend look. There is no credible strict fashion code, and the compact, street-facing setup rewards comfort more than nightclub theatre.',
      'staff_inclusivity', 'Friendly staff, good music and easy LGBTQ+ mixing dominate current summaries. A smaller set of reviews reports unhelpful service and poor handling of an outside group, so the overall welcome is positive while crowd management remains a real caveat.',
      'source_urls', to_jsonb(array[
        'https://www.travelgay.com/venue/le-belgica',
        'https://www.thegayagenda.fyi/brussels/businesses/le-belgica/',
        'https://www.gayout.com/europe/belgium/brussels/bars/le-belgica-brussels',
        'https://restaurantguru.com/Le-Belgica-Brussels',
        'https://www.reddit.com/r/belgium/comments/1l02cn0/gay_bar_recommendations/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/le-belgica','https://www.thegayagenda.fyi/brussels/businesses/le-belgica/','https://restaurantguru.com/Le-Belgica-Brussels']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.travelgay.com/venue/le-belgica','https://www.thegayagenda.fyi/brussels/businesses/le-belgica/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.thegayagenda.fyi/brussels/businesses/le-belgica/','https://restaurantguru.com/Le-Belgica-Brussels','https://www.reddit.com/r/belgium/comments/1l02cn0/gay_bar_recommendations/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.travelgay.com/venue/le-belgica','https://restaurantguru.com/Le-Belgica-Brussels']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.thegayagenda.fyi/brussels/businesses/le-belgica/','https://www.gayout.com/europe/belgium/brussels/bars/le-belgica-brussels','https://www.reddit.com/r/belgium/comments/1l02cn0/gay_bar_recommendations/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (89::bigint, jsonb_build_object(
      'queue_wait', 'Theme and Pride nights can move slowly even with presale, and the cloakroom has historically added another wait. The club says staffing and wardrobe flow improved after older complaints. Arrive before midnight when early entry is offered, but confirm the exact event first.',
      'best_nights', 'Friday and Saturday run until 5 am, yet the named concept matters more than the weekday. Drag Friday, a pop or schlager Saturday and a visiting electronic party can feel like different clubs. Pride finale sells hard; an unthemed night may be unexpectedly sparse.',
      'crowd_mix', 'Stockholm LGBTQ+ clubbers, drag and schlager fans, younger queer groups and Nordic visitors form the intended crowd. Music rooms can split pop loyalists from electronic dancers. Current reviews range from genuinely inclusive clientele to nearly empty weekend floors.',
      'dress_code', 'There is no single uniform across its rotating nights: Swedish club basics, trainers, drag sparkle, festival looks and Pride colour all appear. Follow the event poster and bring a card because the venue is cashless; attitude at the door may matter more than fashion.',
      'staff_inclusivity', 'Friendly queer guests and enjoyable music still earn praise, but security is the dominant warning. Numerous reviews describe rude, aggressive or discriminatory treatment and arbitrary removals; management says it has added training and staff, yet fresh 2025-26 complaints remain.',
      'source_urls', to_jsonb(array[
        'https://tolvstockholm.se/en/at-tolv/club-backdoor/',
        'https://www.nortic.se/ticket/event/84109?expanded=true',
        'https://www.tripadvisor.co.uk/Attraction_Review-g189852-d23808047-Reviews-Club_Backdoor-Stockholm.html',
        'https://wanderlog.com/place/details/463608/club-backdoor',
        'https://restaurantguru.com/Club-Backdoor-Stockholm',
        'https://thatsup.se/stockholm/article/framling-pa-backdoor/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Attraction_Review-g189852-d23808047-Reviews-Club_Backdoor-Stockholm.html','https://wanderlog.com/place/details/463608/club-backdoor']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://tolvstockholm.se/en/at-tolv/club-backdoor/','https://www.nortic.se/ticket/event/84109?expanded=true','https://thatsup.se/stockholm/article/framling-pa-backdoor/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.nortic.se/ticket/event/84109?expanded=true','https://wanderlog.com/place/details/463608/club-backdoor','https://www.tripadvisor.co.uk/Attraction_Review-g189852-d23808047-Reviews-Club_Backdoor-Stockholm.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.nortic.se/ticket/event/84109?expanded=true','https://thatsup.se/stockholm/article/framling-pa-backdoor/','https://tolvstockholm.se/en/at-tolv/club-backdoor/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Attraction_Review-g189852-d23808047-Reviews-Club_Backdoor-Stockholm.html','https://wanderlog.com/place/details/463608/club-backdoor','https://restaurantguru.com/Club-Backdoor-Stockholm']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (123, 120, 109, 94, 118, 130, 95, 89)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
