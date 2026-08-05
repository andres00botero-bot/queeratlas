-- Queer Atlas venue intelligence: global review-led editorial pass, batch 6.
-- Cologne, Dublin, Edinburgh, Helsinki, Oslo and Zurich.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (102::bigint, jsonb_build_object(
      'queue_wait', 'This is more corner bar than velvet-rope club. On ordinary nights the wait is usually at the bar, while warm weekends, Pride and Carnival push the Schaafenstrasse crowd onto the pavement and make the compact room feel full fast.',
      'best_nights', 'Use the daily 9-10 pm happy hour for an easy social start. Friday and Saturday bring the fullest pop-and-house buzz; Carnival, Pride and Halloween are the high-camp versions, with more spectacle and far less breathing room.',
      'crowd_mix', 'Cologne gay regulars anchor the room, joined by friends, younger bar-hoppers and visitors working their way along the city''s queer strip. It feels local and unpretentious, but its central location makes meeting travellers entirely normal.',
      'dress_code', 'Relaxed really means relaxed here: denim, tees, trainers or whatever survived a day of sightseeing. There is no credible formal code; add costume or colour for Carnival, Pride or Halloween because the crowd enjoys participation.',
      'staff_inclusivity', 'Friendly, attentive service is the strongest recurring review theme, matching the bar''s easy neighbourhood mood. Peak street-party nights can turn service brisk, but the overall signal is welcoming rather than selective or scene-policed.',
      'source_urls', to_jsonb(array[
        'https://www.travelgay.com/venue/excorner',
        'https://www.gayout.com/europe/germany/cologne/bars/excorner-cologne-1733',
        'https://www.gayplaces.co/city/cologne/bar/excorner'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.travelgay.com/venue/excorner','https://www.gayplaces.co/city/cologne/bar/excorner']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.gayplaces.co/city/cologne/bar/excorner','https://www.travelgay.com/venue/excorner']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.gayout.com/europe/germany/cologne/bars/excorner-cologne-1733','https://www.gayplaces.co/city/cologne/bar/excorner']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.gayout.com/europe/germany/cologne/bars/excorner-cologne-1733','https://www.gayplaces.co/city/cologne/bar/excorner']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.gayout.com/europe/germany/cologne/bars/excorner-cologne-1733','https://www.travelgay.com/venue/excorner']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (128::bigint, jsonb_build_object(
      'queue_wait', 'The pinch point is often space, not just the door: seating is scarce and popular drag nights become a standing-room crowd. Arrive before the headline show on Friday or Sunday if you want a clear view; late weekend entry can mean a proper city-centre queue.',
      'best_nights', 'Sunday bingo is the warmest all-round pick, especially solo, because the show gives the room an instant shared focus. Thursday is strong for featured queens; Friday and Saturday deliver the biggest dancefloor but also the most crowd pressure.',
      'crowd_mix', 'Dublin queer regulars, first-timers, tourists and allies all meet in this long-running institution. The mix is broader and straighter than it once was; that can feel lively, though some queer guests say badly behaved non-queer groups occasionally dilute the safe-space feeling.',
      'dress_code', 'There is no reliable formal fashion test. Everyday pub-to-club clothes, trainers, drag-night sparkle and full going-out looks all appear; prioritise shoes for standing and dancing, plus a layer you will not mind carrying in a packed room.',
      'staff_inclusivity', 'Many guests describe warm bartenders, performers and a crowd that makes strangers feel part of the show. Feedback is not spotless: recent community discussion raises concerns about how disruptive or homophobic patrons are handled, so inclusion can depend on the night.',
      'source_urls', to_jsonb(array[
        'https://thegeorge.ie/real-stories-from-dublins-best-gay-bar/',
        'https://mercantilegroup.ie/wp-content/uploads/2024/11/Mercantile-Brochure.pdf',
        'https://www.reddit.com/r/LGBTireland/comments/1rfhrw3/the_george_is_dead_on_a_tuesday/',
        'https://www.reddit.com/r/LGBTireland/comments/1rs38o1/considering_a_first_time_visit_to_the_george_many/',
        'https://www.reddit.com/r/LGBTireland/comments/1v7iq7g/going_to_the_george_alone/',
        'https://www.reddit.com/r/LGBTireland/comments/1s0bhbx/homophobia_in_the_george/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.reddit.com/r/LGBTireland/comments/1tackrw/drag_suggestions/','https://www.reddit.com/r/LGBTireland/comments/1v7iq7g/going_to_the_george_alone/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.reddit.com/r/LGBTireland/comments/1rfhrw3/the_george_is_dead_on_a_tuesday/','https://www.reddit.com/r/LGBTireland/comments/1rs38o1/considering_a_first_time_visit_to_the_george_many/','https://www.reddit.com/r/LGBTireland/comments/1v7iq7g/going_to_the_george_alone/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://mercantilegroup.ie/wp-content/uploads/2024/11/Mercantile-Brochure.pdf','https://www.reddit.com/r/LGBTireland/comments/1s0bhbx/homophobia_in_the_george/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://thegeorge.ie/real-stories-from-dublins-best-gay-bar/','https://www.reddit.com/r/LGBTireland/comments/1tackrw/drag_suggestions/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://thegeorge.ie/real-stories-from-dublins-best-gay-bar/','https://www.reddit.com/r/LGBTireland/comments/1s0bhbx/homophobia_in_the_george/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (772::bigint, jsonb_build_object(
      'queue_wait', 'Regular admission is free most nights, but weekend drag, Pride and ticketed guests can turn the entrance and lower club into a squeeze. Arrive before the show if you need a good sightline; later on, overcrowding inside is the more common complaint than a precise wait time.',
      'best_nights', 'Sunday''s 8 pm cabaret gives the clearest signature night without waiting for 1 am. Friday and Saturday pair drag with the fullest dancefloor; a weekday is easier for drinks and conversation, although some recent Thursdays have felt genuinely quiet.',
      'crowd_mix', 'Edinburgh LGBTQ+ regulars, students, allies and visitors share the room, with tourists and Fringe traffic especially visible in season. Late weekends skew young and party-led; brunch and early cabaret draw a broader mix of ages and identities.',
      'dress_code', 'No formal code is published: casual layers, trainers, glitter and full drag-night looks all make sense. A few newcomers describe the late crowd as image-conscious, but that is social atmosphere rather than an official door rule.',
      'staff_inclusivity', 'The venue explicitly promises a safe space across gender, race and orientation, and brunch guests often find the team warm and helpful. Recent nightlife reviews are sharply mixed, citing ignored customers, brusque door interactions and tip pressure, so service depends on shift and crowd load.',
      'source_urls', to_jsonb(array[
        'https://www.ccblooms.co.uk/',
        'https://www.ccblooms.co.uk/nightlife',
        'https://www.tripadvisor.com/Attraction_Review-g186525-d607084-Reviews-CC_Blooms-Edinburgh_Scotland.html',
        'https://www.tripadvisor.co.uk/Restaurant_Review-g186525-d3668629-Reviews-CC_Blooms-Edinburgh_Scotland.html',
        'https://wanderlog.com/place/details/1474580/cc-blooms'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.ccblooms.co.uk/nightlife','https://www.tripadvisor.co.uk/Restaurant_Review-g186525-d3668629-Reviews-CC_Blooms-Edinburgh_Scotland.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.ccblooms.co.uk/nightlife','https://www.tripadvisor.com/Attraction_Review-g186525-d607084-Reviews-CC_Blooms-Edinburgh_Scotland.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.ccblooms.co.uk/','https://wanderlog.com/place/details/1474580/cc-blooms']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.ccblooms.co.uk/','https://wanderlog.com/place/details/1474580/cc-blooms']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.ccblooms.co.uk/','https://www.tripadvisor.com/Attraction_Review-g186525-d607084-Reviews-CC_Blooms-Edinburgh_Scotland.html','https://www.tripadvisor.co.uk/Restaurant_Review-g186525-d3668629-Reviews-CC_Blooms-Edinburgh_Scotland.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (758::bigint, jsonb_build_object(
      'queue_wait', 'The new Citycenter club is spacious and has several bars, so ordering is often faster than the room''s scale suggests. It can feel thin before midnight, then change quickly on Friday and Saturday; arriving around 11:30 pm usually avoids both an empty floor and peak entry pressure.',
      'best_nights', 'Friday and Saturday are the dependable full-production choice, with both dancefloors, themed programming and occasional midnight drag. Wednesday or Thursday can still work for a less frantic night, but the energy is less predictable and starts later.',
      'crowd_mix', 'Finnish gay and queer regulars lead the room, joined by Nordic weekenders and visitors stepping off the railway connection opposite. The current older-than-student positioning gives it a more grown club feel, while reviews still describe a broad, internationally approachable mix.',
      'dress_code', 'There is no formal code: smart-casual clubwear, dark Nordic basics, trainers or a sharper night-out look all pass naturally. Dress for a long dance session rather than a fashion inspection; themed nights are the obvious invitation to push it further.',
      'staff_inclusivity', 'Friendly staff, a safe feeling and multiple efficient bars recur in positive feedback. The picture is not flawless: isolated reviews mention a disputed cash return, broken glass and cleanliness, so the welcome reads strong while floor management can vary on busy nights.',
      'source_urls', to_jsonb(array[
        'https://citycenter.fi/liikkeet/hercules/',
        'https://eurogaytravel.com/en/venues/hercules',
        'https://wanderlog.com/place/details/9708428/hercules-gay-nightclub',
        'https://www.tripadvisor.co.uk/Attraction_Review-g189934-d7062421-Reviews-Hercules-Helsinki_Uusimaa.html',
        'https://restaurantguru.com/Hercules-Helsinki-3'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/9708428/hercules-gay-nightclub','https://www.tripadvisor.co.uk/Attraction_Review-g189934-d7062421-Reviews-Hercules-Helsinki_Uusimaa.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://citycenter.fi/liikkeet/hercules/','https://eurogaytravel.com/en/venues/hercules','https://www.tripadvisor.co.uk/Attraction_Review-g189934-d7062421-Reviews-Hercules-Helsinki_Uusimaa.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://citycenter.fi/liikkeet/hercules/','https://eurogaytravel.com/en/venues/hercules','https://www.tripadvisor.co.uk/Attraction_Review-g189934-d7062421-Reviews-Hercules-Helsinki_Uusimaa.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://eurogaytravel.com/en/venues/hercules','https://wanderlog.com/place/details/9708428/hercules-gay-nightclub']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://eurogaytravel.com/en/venues/hercules','https://wanderlog.com/place/details/9708428/hercules-gay-nightclub','https://restaurantguru.com/Hercules-Helsinki-3']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (126::bigint, jsonb_build_object(
      'queue_wait', 'Early pub hours are usually straightforward; the pressure comes when the upstairs club opens and on Pride weekends. For Tuesday karaoke, arrive before the 8 pm start if you want a comfortable base. On Friday and Saturday, earlier beats negotiating a packed stair-and-bar flow.',
      'best_nights', 'Tuesday karaoke from 8 pm to midnight is the easiest night for joining in rather than just observing. Friday and Saturday suit late dancing upstairs; a quieter weekday drink is better if you want the old living-room quality and a chance to speak with locals.',
      'crowd_mix', 'Longtime Oslo gay regulars remain the backbone, now joined by queer women, trans guests, younger groups, allies and international visitors. Since another major queer club closed, the dance crowd has broadened further, while the daytime-pub rhythm still feels strongly local.',
      'dress_code', 'Come as you are: pub casual downstairs, trainers and practical layers for the club, or something louder for karaoke and Pride. No credible strict fashion policy appears; comfort matters more than polish when you may move between billiards, bars and the dancefloor.',
      'staff_inclusivity', 'Visitors often describe lovely bartenders and an unusually easy welcome for foreigners, while local voices treat the pub as queer communal ground. Some recent reviews feel the growing straight crowd is not always managed firmly enough, so the sense of safety can shift at peak hours.',
      'source_urls', to_jsonb(array[
        'https://www.londonpub.no/',
        'https://www.visitoslo.com/en/your-oslo/queer-oslo/',
        'https://www.tripadvisor.com/Attraction_Review-g190479-d607758-Reviews-London_Pub-Oslo_Eastern_Norway.html',
        'https://no.tripadvisor.com/Attraction_Review-g190479-d607758-Reviews-London_Pub-Oslo_Eastern_Norway.html',
        'https://www.reddit.com/r/oslo/comments/1qa26tv/solo_travel_to_oslo_for_queer_woman/',
        'https://www.vg.no/nyheter/i/pBr4nX/mer-stuerent-aa-vaere-homofob-naa'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.londonpub.no/','https://no.tripadvisor.com/Attraction_Review-g190479-d607758-Reviews-London_Pub-Oslo_Eastern_Norway.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.londonpub.no/','https://no.tripadvisor.com/Attraction_Review-g190479-d607758-Reviews-London_Pub-Oslo_Eastern_Norway.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.visitoslo.com/en/your-oslo/queer-oslo/','https://www.reddit.com/r/oslo/comments/1qa26tv/solo_travel_to_oslo_for_queer_woman/','https://www.vg.no/nyheter/i/pBr4nX/mer-stuerent-aa-vaere-homofob-naa']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.londonpub.no/','https://no.tripadvisor.com/Attraction_Review-g190479-d607758-Reviews-London_Pub-Oslo_Eastern_Norway.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g190479-d607758-Reviews-London_Pub-Oslo_Eastern_Norway.html','https://no.tripadvisor.com/Attraction_Review-g190479-d607758-Reviews-London_Pub-Oslo_Eastern_Norway.html','https://www.vg.no/nyheter/i/pBr4nX/mer-stuerent-aa-vaere-homofob-naa']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (611::bigint, jsonb_build_object(
      'queue_wait', 'The two narrow floors feel busy before they produce a dramatic door line. Friday and Saturday can become a shoulder-to-shoulder cocktail squeeze, so come near opening for a seat or after-work conversation; later arrival is for bustle, not personal space.',
      'best_nights', 'Weekday after-work hours are best for precise cocktails and actually meeting the room. Friday and Saturday run until 2 am and carry the livelier social mix; choose them for energy, not for a quiet first date.',
      'crowd_mix', 'Zurich gay men form the core, with mixed ages, queer friends, allies, business travellers and tourists folding in easily. The room can read polished and male-led without being locals-only; multilingual conversation is part of its everyday character.',
      'dress_code', 'Polished-casual fits the cocktail setting: clean basics, office-to-evening layers or a sharper date-night look. There is no documented strict code, and regulars also arrive casually; neat and comfortable is more useful than trying to perform luxury.',
      'staff_inclusivity', 'Warm, multilingual bartenders who remember regulars and tailor drinks are the dominant story. A small minority reports brusque management or weak intervention around an offensive group, so the service reputation is strong but should not be romanticised as universal.',
      'source_urls', to_jsonb(array[
        'https://www.zuerich.com/en/eat-drink/bars-and-pubs/lgbtq-bars-und-cafes',
        'https://www.zuerich.com/de/besuchen/bars-lounges/cranberry-bar',
        'https://www.hellozurich.ch/en/location/lieblingsort-cranberry-bar.html',
        'https://www.timeout.com/switzerland/bars-and-pubs/cranberry',
        'https://wanderlog.com/place/details/1623396/cranberry-bar',
        'https://www.gayout.com/europe/switzerland/zurich/bars/cranberry-bar'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.timeout.com/switzerland/bars-and-pubs/cranberry','https://wanderlog.com/place/details/1623396/cranberry-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.zuerich.com/de/besuchen/bars-lounges/cranberry-bar','https://www.hellozurich.ch/en/location/lieblingsort-cranberry-bar.html','https://www.timeout.com/switzerland/bars-and-pubs/cranberry']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.zuerich.com/en/eat-drink/bars-and-pubs/lgbtq-bars-und-cafes','https://www.hellozurich.ch/en/location/lieblingsort-cranberry-bar.html','https://wanderlog.com/place/details/1623396/cranberry-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.timeout.com/switzerland/bars-and-pubs/cranberry','https://wanderlog.com/place/details/1623396/cranberry-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.hellozurich.ch/en/location/lieblingsort-cranberry-bar.html','https://wanderlog.com/place/details/1623396/cranberry-bar','https://www.gayout.com/europe/switzerland/zurich/bars/cranberry-bar']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (125::bigint, jsonb_build_object(
      'queue_wait', 'There is no current queue: Elsker closed after nearly twenty years when the operating company entered bankruptcy in January 2026. Any listing that still offers live entry advice is out of date; the former Kristian IVs gate space has moved on.',
      'best_nights', 'There is no current best night. Historically, Elsker was known for weekend drag, go-go energy and three floors of dancing, but those memories should not be mistaken for a 2026 programme or a reopening announcement.',
      'crowd_mix', 'Before closing, Elsker drew a younger, rowdier mix than Oslo''s traditional gay pubs, with lesbians and trans guests especially visible alongside gay men and visitors. That is historical context only, not a description of a present crowd.',
      'dress_code', 'No live dress policy applies because the venue is closed. Its former mood rewarded expressive, dance-ready clothes rather than formal polish; use that only as scene history, not practical door guidance.',
      'staff_inclusivity', 'The venue once held real community affection, but there is no current team to assess. Archived reviews contain both loyalty and criticism of security decisions; current inclusion advice should point readers to active Oslo spaces instead.',
      'source_urls', to_jsonb(array[
        'https://www.abcnyheter.no/livsstil/utestedet-elsker-i-oslo-konkurs/1367167',
        'https://www.lysloypa.no/pages/elsker-er-med-i-lysloypa-oslo-2026',
        'https://no.tripadvisor.com/Restaurant_Review-g190479-d3385297-Reviews-Elsker-Oslo_Eastern_Norway.html',
        'https://www.reddit.com/r/oslo/comments/1k0alzi/solo_travel_to_oslo/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','verified_closed','source_urls',to_jsonb(array['https://www.abcnyheter.no/livsstil/utestedet-elsker-i-oslo-konkurs/1367167','https://www.lysloypa.no/pages/elsker-er-med-i-lysloypa-oslo-2026']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_closed','source_urls',to_jsonb(array['https://www.abcnyheter.no/livsstil/utestedet-elsker-i-oslo-konkurs/1367167','https://www.lysloypa.no/pages/elsker-er-med-i-lysloypa-oslo-2026']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','historical_context','source_urls',to_jsonb(array['https://www.reddit.com/r/oslo/comments/1k0alzi/solo_travel_to_oslo/','https://no.tripadvisor.com/Restaurant_Review-g190479-d3385297-Reviews-Elsker-Oslo_Eastern_Norway.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','historical_context','source_urls',to_jsonb(array['https://no.tripadvisor.com/Restaurant_Review-g190479-d3385297-Reviews-Elsker-Oslo_Eastern_Norway.html','https://www.abcnyheter.no/livsstil/utestedet-elsker-i-oslo-konkurs/1367167']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','historical_context','source_urls',to_jsonb(array['https://no.tripadvisor.com/Restaurant_Review-g190479-d3385297-Reviews-Elsker-Oslo_Eastern_Norway.html','https://www.abcnyheter.no/livsstil/utestedet-elsker-i-oslo-konkurs/1367167']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'operating_status', 'permanently_closed',
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
  where id in (102, 128, 772, 758, 126, 611, 125)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 7 then
    raise exception 'Expected 7 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
