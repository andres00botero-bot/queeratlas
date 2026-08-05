-- Queer Atlas venue intelligence: global review-led editorial pass, batch 16.
-- Algarve accommodation, food, nightlife and beach records.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (1762::bigint, jsonb_build_object(
      'queue_wait', 'Do not treat this as a presently bookable guesthouse. Older guides describe five rooms and a three-night minimum, but the former official domain is no longer controlled by the business and no current booking channel could be verified. Confirm a named host and address before sending money.',
      'best_nights', 'Historic information places the season from April to September, with breakfast, pool, garden, jacuzzi and pre-dinner cocktails shaping a quiet stay rather than a nightlife calendar. Those details are useful context only until the owners publish fresh availability through a verifiable channel.',
      'crowd_mix', 'The original concept was a private gay-men-only guesthouse near Carvoeiro, with five en-suite rooms and a deliberately social pool-and-breakfast rhythm. There is no credible current guest mix because recent stays and active management have not been independently established.',
      'dress_code', 'The former house was resort-casual, with swimwear around the pool and ordinary holiday clothes elsewhere; it was not a fetish property. If it reopens under confirmed management, ask directly about clothing, guests and shared-space etiquette rather than inheriting rules from old directory copy.',
      'staff_inclusivity', 'The name promised welcome and older listings describe LGBTQ+ ownership or management, but there is no recent review body from which to judge today’s hosts. The safest community rating is status unverified: verify the operator, cancellation terms and payment recipient before booking.',
      'operating_status', 'current_status_unverified_official_domain_expired',
      'venue_classification', 'historically_gay_male_guesthouse_status_unverified',
      'source_urls', to_jsonb(array[
        'https://pt.travelgay.com/hotels/casa-marhaba-algarve',
        'https://www.gayvoyageur.com/etablissement/casa-marhaba/',
        'https://spartacus.gayguide.travel/hotels/europe/portugal/carvoeiro-algarve/19518_Casa%2BMarhaba',
        'https://com.all-url.info/com/casamarhaba.com/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','current_status_unverified','source_urls',to_jsonb(array['https://pt.travelgay.com/hotels/casa-marhaba-algarve','https://com.all-url.info/com/casamarhaba.com/','https://spartacus.gayguide.travel/hotels/europe/portugal/carvoeiro-algarve/19518_Casa%2BMarhaba']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','historic_context_only','source_urls',to_jsonb(array['https://spartacus.gayguide.travel/hotels/europe/portugal/carvoeiro-algarve/19518_Casa%2BMarhaba','https://pt.travelgay.com/hotels/casa-marhaba-algarve']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','historic_context_only','source_urls',to_jsonb(array['https://pt.travelgay.com/hotels/casa-marhaba-algarve','https://www.gayvoyageur.com/etablissement/casa-marhaba/','https://spartacus.gayguide.travel/hotels/europe/portugal/carvoeiro-algarve/19518_Casa%2BMarhaba']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','historic_service_context','source_urls',to_jsonb(array['https://pt.travelgay.com/hotels/casa-marhaba-algarve','https://spartacus.gayguide.travel/hotels/europe/portugal/carvoeiro-algarve/19518_Casa%2BMarhaba']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','insufficient_current_evidence','source_urls',to_jsonb(array['https://pt.travelgay.com/hotels/casa-marhaba-algarve','https://www.gayvoyageur.com/etablissement/casa-marhaba/','https://com.all-url.info/com/casamarhaba.com/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1754::bigint, jsonb_build_object(
      'queue_wait', 'The upstairs terrace is easy to miss—look above the Strip and follow the stairs. There is rarely a formal queue; the surprise is often how quiet it feels around 9 pm or even midnight. Later weekend energy is possible, but come for a drink first rather than expecting instant club density.',
      'best_nights', 'Friday and Saturday give the best chance of dancing and a fuller terrace, while an earlier weekday visit works for conversation with the hosts. Current hours run into the early morning on operating nights. Seasonal resort traffic matters more than a fixed weekly party ritual.',
      'crowd_mix', 'Gay men and visiting male couples remain the visible core, joined by lesbians, trans guests, mixed queer friends and allies. Summer tourists outweigh local regulars in peak weeks, though the bar also functions as a regional LGBTQ+ meeting point. It is inclusive, not men-only.',
      'dress_code', 'Holiday casual is right: shorts, trainers, sandals, bright shirts, dresses and a little dance-floor sparkle all fit. There is no evidenced strict code. Bring a light layer for the elevated outdoor terrace after midnight and footwear comfortable enough for stairs and standing.',
      'staff_inclusivity', 'Fresh 2026 reviews repeatedly praise warm hosts, good-value drinks and feeling safe when arriving solo or as a couple. One recent account found the manager dismissive over non-English music, so the picture is strongly positive rather than flawless. The small team shapes the entire night.',
      'venue_classification', 'inclusive_lgbtq_bar_and_small_dance_terrace',
      'source_urls', to_jsonb(array[
        'https://www.gayout.com/europe/portugal/albufeira/bars/connection-bar',
        'https://www.tripadvisor.com/Attraction_Review-g189112-d11918536-Reviews-Connection_Bar-Albufeira_Faro_District_Algarve.html',
        'https://pt.restaurantguru.com/Connection-Bar-Albufeira',
        'https://www.travelgay.com/venue/connection-bar',
        'https://pinkuk.com/countries/europe/portugal/algarve/albufeira/connection-bar',
        'https://www.reddit.com/r/Albufeira/comments/1usn4im/gay_scenery_in_albufeira/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.gayout.com/europe/portugal/albufeira/bars/connection-bar','https://www.tripadvisor.com/Attraction_Review-g189112-d11918536-Reviews-Connection_Bar-Albufeira_Faro_District_Algarve.html','https://pt.restaurantguru.com/Connection-Bar-Albufeira']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g189112-d11918536-Reviews-Connection_Bar-Albufeira_Faro_District_Algarve.html','https://pt.restaurantguru.com/Connection-Bar-Albufeira','https://www.travelgay.com/venue/connection-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_and_community_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g189112-d11918536-Reviews-Connection_Bar-Albufeira_Faro_District_Algarve.html','https://www.gayout.com/europe/portugal/albufeira/bars/connection-bar','https://www.reddit.com/r/Albufeira/comments/1usn4im/gay_scenery_in_albufeira/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g189112-d11918536-Reviews-Connection_Bar-Albufeira_Faro_District_Algarve.html','https://pinkuk.com/countries/europe/portugal/algarve/albufeira/connection-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.gayout.com/europe/portugal/albufeira/bars/connection-bar','https://www.tripadvisor.com/Attraction_Review-g189112-d11918536-Reviews-Connection_Bar-Albufeira_Faro_District_Algarve.html','https://pt.restaurantguru.com/Connection-Bar-Albufeira']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1756::bigint, jsonb_build_object(
      'queue_wait', 'This is a tiny tasca, so a full room matters more than a formal waitlist. Reserve for dinner or arrive at the start of the 6:30 pm service, particularly Friday through Sunday. Lunch is the calmer alternative. Wednesday is closed, and published weekend hours vary slightly by source.',
      'best_nights', 'A weekday lunch gives the kitchen and owner more room for personal recommendations; Friday or Saturday dinner feels cosier and more celebratory. Come for Portuguese petiscos, cod and the famously rich francesinha, not for nightlife after the plates are cleared.',
      'crowd_mix', 'Portimão couples and families mix with repeat Algarve visitors and food-focused tourists. The memorabilia-filled room feels local despite its online popularity. A regional LGBTQ+ guide includes it, but the restaurant is mainstream and no reliable queer-versus-straight ratio exists.',
      'dress_code', 'Unfussy restaurant clothes are perfect: shorts, denim, trainers, summer dresses and a clean shirt all suit the modern-tasca room. There is no door code. Dress for a generous, saucy meal in a compact space rather than a formal tasting menu or late-night club.',
      'staff_inclusivity', 'Personal warmth is the recurring story: attentive service, quick made-to-order food and an owner-chef who takes pride in explaining portions and dishes. Reviews also flag occasional menu inconsistency, so ask before sharing. The welcome appears genuine, though queer-specific accounts are limited.',
      'venue_classification', 'mainstream_queer_friendly_portuguese_tasca',
      'source_urls', to_jsonb(array[
        'https://algarve.org/listing/dona-benta-tasca-chique/',
        'https://wanderlog.com/place/details/1264712/dona-benta-tasca-chique',
        'https://bellaciao.pt/restaurante/dona-benta-tasca-chique/',
        'https://www.tripadvisor.pt/Restaurant_Review-g189120-d3847292-Reviews-Dona_Benta_Tasca_Chique-Portimao_Faro_District_Algarve.html',
        'https://lifecooler.com/artigo/comer/dona-benta-tasca-chique/451272',
        'https://cdnc.heyzine.com/flip-book/pdf/f6351ffa61d1c6bf09e3335ae7e7f0950b535841-14.pdf'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://algarve.org/listing/dona-benta-tasca-chique/','https://wanderlog.com/place/details/1264712/dona-benta-tasca-chique','https://www.tripadvisor.pt/Restaurant_Review-g189120-d3847292-Reviews-Dona_Benta_Tasca_Chique-Portimao_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://algarve.org/listing/dona-benta-tasca-chique/','https://wanderlog.com/place/details/1264712/dona-benta-tasca-chique','https://lifecooler.com/artigo/comer/dona-benta-tasca-chique/451272']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1264712/dona-benta-tasca-chique','https://www.tripadvisor.pt/Restaurant_Review-g189120-d3847292-Reviews-Dona_Benta_Tasca_Chique-Portimao_Faro_District_Algarve.html','https://cdnc.heyzine.com/flip-book/pdf/f6351ffa61d1c6bf09e3335ae7e7f0950b535841-14.pdf']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://algarve.org/listing/dona-benta-tasca-chique/','https://wanderlog.com/place/details/1264712/dona-benta-tasca-chique']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://algarve.org/listing/dona-benta-tasca-chique/','https://wanderlog.com/place/details/1264712/dona-benta-tasca-chique','https://bellaciao.pt/restaurante/dona-benta-tasca-chique/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1757::bigint, jsonb_build_object(
      'queue_wait', 'This is a gated five-star apartment-and-villa resort, not a public beach-club door. Reception handles booked guests; golf buggies help with the spread-out site. In school holidays, reserve accommodation and children’s activities early. The adjacent beach itself remains the easy arrival.',
      'best_nights', 'The resort is strongest by day: pools, beach access, spa and long family lunches. Dinner on site suits a quiet evening, while Vale do Lobo or Vilamoura provide more nightlife. Couples seeking calm should favour shoulder season; school holidays make the children’s programme central.',
      'crowd_mix', 'Affluent international families, couples, golfers and multi-generational groups dominate the spacious residences. Guests are overwhelmingly visitors, while local residents appear mainly through staff and nearby restaurants. This is a mainstream luxury resort, not a queer social beach club.',
      'dress_code', 'Resort casual covers most spaces: swimwear at the pool, a cover-up and shoes indoors, golf attire where required and smart casual for dinner. There is no LGBTQ+ or nightlife dress ritual. Pack for family facilities, sand and polished restaurants rather than a single club look.',
      'staff_inclusivity', 'Verified 2026 stays praise exceptionally kind staff, daily housekeeping, large homes, beach access and attentive help for families. Older criticism targets an uninviting pool setup, Wi-Fi and reception tone. Current scores are strong, but the welcome is general luxury service rather than queer programming.',
      'venue_classification', 'mainstream_five_star_family_resort',
      'source_urls', to_jsonb(array[
        'https://www.ddbc.pt/en/',
        'https://www.tripadvisor.com/Hotel_Review-g4242473-d1381060-Reviews-Dunas_Douradas_Beach_Club-Vale_do_Garrao_Almancil_Loule_Faro_District_Algarve.html',
        'https://www.booking.com/reviews/pt/hotel/dunas-douradas-beach-club.en-gb.html',
        'https://www.booking.com/hotel/pt/dunas-douradas-beach-club.en-gb.html',
        'https://wanderlog.com/place/details/770033/dunas-douradas-beach-club',
        'https://www.hotels.com/ho572136/dunas-douradas-beach-club-almancil-portugal/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','verified_service_model','source_urls',to_jsonb(array['https://www.ddbc.pt/en/','https://www.booking.com/hotel/pt/dunas-douradas-beach-club.en-gb.html','https://www.tripadvisor.com/Hotel_Review-g4242473-d1381060-Reviews-Dunas_Douradas_Beach_Club-Vale_do_Garrao_Almancil_Loule_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.ddbc.pt/en/','https://www.booking.com/reviews/pt/hotel/dunas-douradas-beach-club.en-gb.html','https://wanderlog.com/place/details/770033/dunas-douradas-beach-club']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://www.ddbc.pt/en/','https://www.booking.com/reviews/pt/hotel/dunas-douradas-beach-club.en-gb.html','https://www.tripadvisor.com/Hotel_Review-g4242473-d1381060-Reviews-Dunas_Douradas_Beach_Club-Vale_do_Garrao_Almancil_Loule_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://www.ddbc.pt/en/','https://www.booking.com/hotel/pt/dunas-douradas-beach-club.en-gb.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.booking.com/reviews/pt/hotel/dunas-douradas-beach-club.en-gb.html','https://www.tripadvisor.com/Hotel_Review-g4242473-d1381060-Reviews-Dunas_Douradas_Beach_Club-Vale_do_Garrao_Almancil_Loule_Faro_District_Algarve.html','https://wanderlog.com/place/details/770033/dunas-douradas-beach-club']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1755::bigint, jsonb_build_object(
      'queue_wait', 'This is a compact street bar, not a ticketed club. There is normally no line, though tables become limited when the Strip is active. Arrive for an early beer if you want to sit; later the practical choice is standing inside or continuing the bar crawl rather than waiting outside.',
      'best_nights', 'Friday and Saturday bring the strongest passing crowd from the Strip, while a weekday gives the camp decor and host-led atmosphere more space. It works as a friendly drinks stop, not a guaranteed all-night dance destination. Let the room’s energy decide how long you stay.',
      'crowd_mix', 'Gay travellers and mixed LGBTQ+ friends are drawn by its gay-friendly reputation, alongside mainstream Strip visitors and repeat holidaymakers. It is not evidenced as an exclusively queer bar. Tourist traffic dominates the area, with the host and returning guests providing continuity.',
      'dress_code', 'Anything cheerful and holiday-casual fits: shorts, trainers, sandals, bright tops and a little camp flourish. There is no published door code. Dress for heat, pavement and an informal bar crawl rather than bottle service; personality suits the mirrors better than formality.',
      'staff_inclusivity', 'Warmth is the clearest surviving theme, with guests describing kindness, easy conversation and a good vibe that kept them for another round. The available review base is smaller and less fresh than the main gay bar nearby, so treat it as encouraging rather than a fully current community guarantee.',
      'venue_classification', 'mainstream_gay_friendly_camp_bar',
      'source_urls', to_jsonb(array[
        'https://tr.travelgay.com/venue/espelho',
        'https://restaurantguru.com/Bar-Espelho-Albufeira',
        'https://www.tripadvisor.com/Restaurant_Review-g189112-d12951865-Reviews-Espelho-Albufeira_Faro_District_Algarve.html',
        'https://www.allaboutportugal.pt/en/albufeira/bars/bar-espelho'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://restaurantguru.com/Bar-Espelho-Albufeira','https://www.tripadvisor.com/Restaurant_Review-g189112-d12951865-Reviews-Espelho-Albufeira_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.tripadvisor.com/Restaurant_Review-g189112-d12951865-Reviews-Espelho-Albufeira_Faro_District_Algarve.html','https://www.allaboutportugal.pt/en/albufeira/bars/bar-espelho']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://tr.travelgay.com/venue/espelho','https://www.tripadvisor.com/Restaurant_Review-g189112-d12951865-Reviews-Espelho-Albufeira_Faro_District_Algarve.html','https://restaurantguru.com/Bar-Espelho-Albufeira']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://tr.travelgay.com/venue/espelho','https://www.tripadvisor.com/Restaurant_Review-g189112-d12951865-Reviews-Espelho-Albufeira_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','limited_review_consensus','source_urls',to_jsonb(array['https://restaurantguru.com/Bar-Espelho-Albufeira','https://www.tripadvisor.com/Restaurant_Review-g189112-d12951865-Reviews-Espelho-Albufeira_Faro_District_Algarve.html','https://tr.travelgay.com/venue/espelho']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1758::bigint, jsonb_build_object(
      'queue_wait', 'This large beachfront hotel has conventional reception rather than a nightlife door. Peak package arrivals can bunch check-in, but luggage storage turns that into beach time. The real rush is breakfast and the promenade outside; book a sea-view category early if the balcony matters.',
      'best_nights', 'Friday and Saturday animate Praia da Rocha’s bars outside, while the hotel itself is best for sunrise, beach access and a comfortable return. A weekday or shoulder-season stay reduces promenade noise. There is no in-house queer night to plan around.',
      'crowd_mix', 'International couples, families, tour groups and repeat beach-holiday guests dominate this mainstream resort hotel. Visitors greatly outnumber locals in the rooms, while Portimão residents animate the surrounding promenade. It is gay-friendly by destination context, not LGBTQ+-specific.',
      'dress_code', 'Beachwear belongs outside and at the pool; add a cover-up and shoes in hotel public areas. Resort casual works at breakfast, with smart casual for dinner or nearby bars. There is no formal guest code, and returning in nightlife clothes should be ordinary coastal-hotel behaviour.',
      'staff_inclusivity', 'Current guests praise kind, helpful staff, generous room size, cleanliness, varied breakfast and direct beach access. Location and views lead the ratings. Busy-season noise and occasional facility details create the usual caveats, but the service signal is consistently welcoming.',
      'venue_classification', 'mainstream_beachfront_resort_hotel',
      'source_urls', to_jsonb(array[
        'https://www.booking.com/hotel/pt/da-rocha.html',
        'https://www.tripadvisor.com/Hotel_Review-g652081-d499067-Reviews-RR_Hotel_da_Rocha-Praia_da_Rocha_Portimao_Faro_District_Algarve.html',
        'https://www.tripadvisor.com/Hotel_Review-g189120-d499067-Reviews-RR_Hotel_da_Rocha-Portimao_Faro_District_Algarve.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.booking.com/hotel/pt/da-rocha.html','https://www.tripadvisor.com/Hotel_Review-g652081-d499067-Reviews-RR_Hotel_da_Rocha-Praia_da_Rocha_Portimao_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://www.booking.com/hotel/pt/da-rocha.html','https://www.tripadvisor.com/Hotel_Review-g652081-d499067-Reviews-RR_Hotel_da_Rocha-Praia_da_Rocha_Portimao_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://www.booking.com/hotel/pt/da-rocha.html','https://www.tripadvisor.com/Hotel_Review-g189120-d499067-Reviews-RR_Hotel_da_Rocha-Portimao_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://www.booking.com/hotel/pt/da-rocha.html','https://www.tripadvisor.com/Hotel_Review-g652081-d499067-Reviews-RR_Hotel_da_Rocha-Praia_da_Rocha_Portimao_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.booking.com/hotel/pt/da-rocha.html','https://www.tripadvisor.com/Hotel_Review-g652081-d499067-Reviews-RR_Hotel_da_Rocha-Praia_da_Rocha_Portimao_Faro_District_Algarve.html','https://www.tripadvisor.com/Hotel_Review-g189120-d499067-Reviews-RR_Hotel_da_Rocha-Portimao_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1760::bigint, jsonb_build_object(
      'queue_wait', 'This adults-only old-town hotel has standard reception, not a club queue. Every room faces the sea, so the booking pressure is dates and floor choice rather than view category. There is no on-site parking; allow time for the public option roughly 400 metres away and the walk with luggage.',
      'best_nights', 'A weekend puts old-town restaurants and music at their busiest, while the beachfront position keeps the room focused on sea rather than the Strip. In-house entertainment skews gentle and mature. Choose weekdays if sleep matters, and request a higher floor away from evening noise.',
      'crowd_mix', 'Adult couples, friends and older repeat visitors form a strongly international holiday crowd. The 18+ policy removes children but does not create a queer or party hotel. Public rooms are calmer and more traditional than Albufeira’s LGBTQ+ bar scene a short ride away.',
      'dress_code', 'Resort casual is enough: beach clothes with a cover-up by day, ordinary summer wear at breakfast and a smarter layer for dinner. There is no dress code. Pack for steps, sand and old-town streets; the hotel’s adult atmosphere is relaxed rather than seductive or nightlife-led.',
      'staff_inclusivity', 'Recent accounts describe staff going far beyond routine help—recovering a lost phone, supporting an injured guest and creating a family-like restaurant welcome. Location and breakfast also shine. Noise, hard beds, dated common areas and isolated cleaning misses keep the picture balanced.',
      'venue_classification', 'mainstream_adults_only_beachfront_hotel',
      'source_urls', to_jsonb(array[
        'https://www.tripadvisor.com/Hotel_Review-g189112-d253394-Reviews-Hotel_Sol_e_Mar-Albufeira_Faro_District_Algarve.html',
        'https://www.expedia.com/Albufeira-Hotels-Hotel-Sol-E-Mar.h1515517.Hotel-Information',
        'https://www.booking.com/hotel/pt/solemaralbufeira.en-gb.html',
        'https://www.tui.com/hotels/sol-e-mar-adults-only-2082/hotelinformation/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.tripadvisor.com/Hotel_Review-g189112-d253394-Reviews-Hotel_Sol_e_Mar-Albufeira_Faro_District_Algarve.html','https://www.booking.com/hotel/pt/solemaralbufeira.en-gb.html','https://www.tui.com/hotels/sol-e-mar-adults-only-2082/hotelinformation/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Hotel_Review-g189112-d253394-Reviews-Hotel_Sol_e_Mar-Albufeira_Faro_District_Algarve.html','https://www.expedia.com/Albufeira-Hotels-Hotel-Sol-E-Mar.h1515517.Hotel-Information']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','classification_correction','source_urls',to_jsonb(array['https://www.booking.com/hotel/pt/solemaralbufeira.en-gb.html','https://www.tripadvisor.com/Hotel_Review-g189112-d253394-Reviews-Hotel_Sol_e_Mar-Albufeira_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','service_specific_guidance','source_urls',to_jsonb(array['https://www.booking.com/hotel/pt/solemaralbufeira.en-gb.html','https://www.tui.com/hotels/sol-e-mar-adults-only-2082/hotelinformation/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Hotel_Review-g189112-d253394-Reviews-Hotel_Sol_e_Mar-Albufeira_Faro_District_Algarve.html','https://www.expedia.com/Albufeira-Hotels-Hotel-Sol-E-Mar.h1515517.Hotel-Information','https://www.tui.com/hotels/sol-e-mar-adults-only-2082/hotelinformation/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1753::bigint, jsonb_build_object(
      'queue_wait', 'There is no entrance line: access is the challenge. The tiny cove is reachable safely only around low tide, and high summer weekends can leave almost no usable sand. Check the tide table, arrive in daylight and turn back early rather than letting rising water trap the route.',
      'best_nights', 'This is a daytime beach, not a night venue. May, June, September and October offer the best balance of warmth and space; July–August weekends can overwhelm the cove. Mid-morning after the tide begins to fall gives time to settle and leave well before access closes.',
      'crowd_mix', 'Naturists, gay men, gay and straight couples and foreign visitors share the secluded sand. The queer presence is noticeable but not exclusive, and crowd size changes with tide and season. Respect people seeking privacy: this is a mixed unofficial nude beach, not a consent-free cruising zone.',
      'dress_code', 'Swimwear is optional in practice, not compulsory either way. Bring sturdy footwear for the approach, water, food, sun protection and a bag that leaves no litter. Stay well back from unstable cliffs and do not place towels where a rising tide can remove your exit.',
      'staff_inclusivity', 'There are no venue staff, lifeguards or facilities to provide a welcome or solve a problem. Community etiquette is the safety system: ask before photographing, keep distance, take rubbish out and treat nudity as ordinary. The beauty is real, but self-reliance is non-negotiable.',
      'venue_classification', 'unofficial_mixed_naturist_and_gay_popular_beach',
      'source_urls', to_jsonb(array[
        'https://www.tripadvisor.com.br/Attraction_Review-g642199-d12936588-Reviews-Praia_Do_Submarino-Alvor_Portimao_Faro_District_Algarve.html',
        'https://www.algarveportugaltourism.com/alvor/beaches/praia-do-submarino.html',
        'https://www.cruisinggays.com/algarve/areas/48855-submarine-beach/',
        'https://www.reddit.com/r/gaytravel/comments/1thtkka/gay_beach_algarve_portugal/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','safety_and_review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com.br/Attraction_Review-g642199-d12936588-Reviews-Praia_Do_Submarino-Alvor_Portimao_Faro_District_Algarve.html','https://www.algarveportugaltourism.com/alvor/beaches/praia-do-submarino.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','seasonal_safety_guidance','source_urls',to_jsonb(array['https://www.tripadvisor.com.br/Attraction_Review-g642199-d12936588-Reviews-Praia_Do_Submarino-Alvor_Portimao_Faro_District_Algarve.html','https://www.algarveportugaltourism.com/alvor/beaches/praia-do-submarino.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','community_and_review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com.br/Attraction_Review-g642199-d12936588-Reviews-Praia_Do_Submarino-Alvor_Portimao_Faro_District_Algarve.html','https://www.algarveportugaltourism.com/alvor/beaches/praia-do-submarino.html','https://www.cruisinggays.com/algarve/areas/48855-submarine-beach/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','safety_and_community_guidance','source_urls',to_jsonb(array['https://www.tripadvisor.com.br/Attraction_Review-g642199-d12936588-Reviews-Praia_Do_Submarino-Alvor_Portimao_Faro_District_Algarve.html','https://www.algarveportugaltourism.com/alvor/beaches/praia-do-submarino.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','public_beach_no_staff','source_urls',to_jsonb(array['https://www.algarveportugaltourism.com/alvor/beaches/praia-do-submarino.html','https://www.tripadvisor.com.br/Attraction_Review-g642199-d12936588-Reviews-Praia_Do_Submarino-Alvor_Portimao_Faro_District_Algarve.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (1762, 1754, 1756, 1757, 1755, 1758, 1760, 1753)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 8 then
    raise exception 'Expected 8 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
