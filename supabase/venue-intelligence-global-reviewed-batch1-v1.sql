-- Queer Atlas venue intelligence: global review-led editorial pass, batch 1.
-- Madrid, Taipei, Montreal, New York, Bogota, Amsterdam and London.
-- Checked 2026-08-05. Reader copy paraphrases recurring review themes while
-- source names remain in topic evidence metadata only.

begin;

with reviewed(id, patch) as (
  values
    (59::bigint, jsonb_build_object(
      'queue_wait', 'The two floors are compact, so the real squeeze happens around showtime rather than in a grand velvet-rope line. Arrive before the headline drag set if you want breathing room and an easy first drink.',
      'best_nights', 'There is performance energy every night, but Friday and Saturday give DLRO its loudest pop-and-drag personality. A weekday is the sweeter move when you want the show without quite as much Chueca crush.',
      'crowd_mix', 'The room is openly LGBTQI+, gay-led and broad in style, with Madrid regulars beside Chueca visitors and mixed groups. It leans joyful and mainstream-pop rather than niche, fetish or underground.',
      'dress_code', 'Wear the version of you that wants to sing along: casual clubwear, colour, a little sparkle or simple jeans all make sense. The stated spirit is plural and non-judgmental, not a fashion exam.',
      'staff_inclusivity', 'The review split is real. Many guests praise attentive, honest service and a welcoming show team; a recent account describes rough security handling and a badly managed entry dispute. Warm inside does not erase door concerns.',
      'source_urls', to_jsonb(array[
        'https://www.esmadrid.com/en/nightlife/delirio-live',
        'https://wanderlog.com/es/place/details/1906941/delirio-dance-club',
        'https://www.todobares.com/bar/delirio-dance-club-madrid/',
        'https://www.timeout.com/madrid/clubs/delirio'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/es/place/details/1906941/delirio-dance-club','https://www.timeout.com/madrid/clubs/delirio']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.esmadrid.com/en/nightlife/delirio-live','https://www.todobares.com/bar/delirio-dance-club-madrid/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.esmadrid.com/en/nightlife/delirio-live','https://www.timeout.com/madrid/clubs/delirio']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.esmadrid.com/en/nightlife/delirio-live','https://pridechueca.com/negocios/dlro-live/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/es/place/details/1906941/delirio-dance-club','https://www.todobares.com/bar/delirio-dance-club-madrid/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (602::bigint, jsonb_build_object(
      'queue_wait', 'Most evenings feel like finding a terrace table, not clearing a club door. Pride weekend is the exception—the Red House strip gets packed—so arrive early if outdoor crowd-watching is part of the plan.',
      'best_nights', 'Weekend evenings bring the live-DJ and drag sparkle, while ordinary weeknights are better for cocktails and conversation. During Taipei Pride, Dalida becomes a full-throttle anchor rather than a casual first stop.',
      'crowd_mix', 'Taipei regulars, international visitors and queer guests across genders share the terrace. It is gay-rooted but notably easy for mixed groups, with English-speaking visitors appearing throughout the review mix.',
      'dress_code', 'Red House terrace style is relaxed and expressive: summer layers, streetwear, date-night polish or drag-ready colour all belong. There is no review pattern of a strict clothing door.',
      'staff_inclusivity', 'Friendly, attentive and English-capable staff are the dominant theme, especially for first-time visitors. A smaller set of reviews reports slow service or an uncomfortable interaction, so the positive signal is strong rather than spotless.',
      'source_urls', to_jsonb(array[
        'https://wanderlog.com/place/details/1497296/caf%C3%A9-dalida',
        'https://www.travelgay.com/venue/cafe-dalida',
        'https://www.fodors.com/world/asia/taiwan/experiences/news/this-is-possibly-taiwans-most-fun-and-exciting-cafe',
        'https://www.tripadvisor.com/Restaurant_Review-g13806951-d2617036-Reviews-or15-Cafe_Dalida-Wanhua_Taipei.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/cafe-dalida','https://wanderlog.com/place/details/1497296/caf%C3%A9-dalida']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.travelgay.com/venue/cafe-dalida','https://www.fodors.com/world/asia/taiwan/experiences/news/this-is-possibly-taiwans-most-fun-and-exciting-cafe']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/cafe-dalida','https://www.tripadvisor.com/Restaurant_Review-g13806951-d2617036-Reviews-or15-Cafe_Dalida-Wanhua_Taipei.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1497296/caf%C3%A9-dalida','https://www.travelgay.com/venue/cafe-dalida']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1497296/caf%C3%A9-dalida','https://www.tripadvisor.com/Restaurant_Review-g13806951-d2617036-Reviews-or15-Cafe_Dalida-Wanhua_Taipei.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (518::bigint, jsonb_build_object(
      'queue_wait', 'Weekend history includes a line outside, but current reports swing between busy and surprisingly quiet. The more predictable wait is the cash machine or coat check, so arrive funded and keep the claim ticket safe.',
      'best_nights', 'After midnight on Friday or Saturday is the dance-floor bet; a sunny summer 5–7 on the roof is the more relaxed Sky experience. The venue has lost some of its old multi-floor momentum, so expectations matter.',
      'crowd_mix', 'The base is LGBTQ+ Montréal with locals and Village visitors sharing the floors. Rooftop hours feel broader and social; late dancing skews younger and more tourist-visible without losing the queer centre.',
      'dress_code', 'Dance-ready casual works better than overthinking a formal code. The practical wardrobe issue is coat check—reviews say even outfit layers may be checked—so wear something simple and easy to manage.',
      'staff_inclusivity', 'Feedback is sharply inconsistent. Some guests call the bartenders fantastic; others describe rude security, poor conflict handling and little empathy at coat check. The queer setting does not guarantee a consistently inclusive interaction.',
      'source_urls', to_jsonb(array[
        'https://www.complexesky.ca/',
        'https://www.tripadvisor.com/Attraction_Review-g155032-d292612-Reviews-Complexe_Sky-Montreal_Quebec.html',
        'https://www.tripadvisor.com/Attraction_Review-g155032-d292612-Reviews-or10-Complexe_Sky-Montreal_Quebec.html',
        'https://www.restomontreal.ca/resto/complexe-sky-village-centre-sud/11041/fr/vote/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g155032-d292612-Reviews-or10-Complexe_Sky-Montreal_Quebec.html','https://www.restomontreal.ca/resto/complexe-sky-village-centre-sud/11041/fr/vote/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g155032-d292612-Reviews-or10-Complexe_Sky-Montreal_Quebec.html','https://www.restomontreal.ca/resto/complexe-sky-village-centre-sud/11041/fr/vote/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://nightspotters.com/complexe-sky-montreal/','https://www.tripadvisor.com/Attraction_Review-g155032-d292612-Reviews-or10-Complexe_Sky-Montreal_Quebec.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://nightspotters.com/complexe-sky-montreal/','https://www.tripadvisor.com/Attraction_Review-g155032-d292612-Reviews-or10-Complexe_Sky-Montreal_Quebec.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g155032-d292612-Reviews-Complexe_Sky-Montreal_Quebec.html','https://www.restomontreal.ca/resto/complexe-sky-village-centre-sud/11041/fr/vote/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (568::bigint, jsonb_build_object(
      'queue_wait', 'Julius’ is usually a walk-in tavern, though the room gets crowded later and around celebrations. Off-peak is best for a stool, burger and proper bar chat; bring cash so the ATM is not your first queue.',
      'best_nights', 'After work shows the bar at its most local and conversational; Friday and Saturday run later and fuller. Choose early evening for history and regulars, late weekend for a denser, more social room.',
      'crowd_mix', 'West Village regulars and a mature gay crowd anchor the bar, with queer-history pilgrims and curious visitors joining them. It stays working-class in spirit: mixed ages, low attitude and conversation across the room.',
      'dress_code', 'This is a historic dive, not a runway. Denim, tees, work clothes and whatever carried you through the day fit perfectly; looking comfortable belongs more than looking curated.',
      'staff_inclusivity', 'The strongest pattern is warm, quick-witted bartenders who make solo visitors and regulars feel equally at home. There are occasional rude-service reports, but welcoming staff remain the clear community consensus.',
      'source_urls', to_jsonb(array[
        'https://juliusbarnyc.com/',
        'https://wanderlog.com/place/details/1915559/julius',
        'https://www.tripadvisor.com/Restaurant_Review-g60763-d534220-Reviews-Julius_Restaurant-New_York_City_New_York.html'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1915559/julius','https://www.tripadvisor.com/Restaurant_Review-g60763-d534220-Reviews-Julius_Restaurant-New_York_City_New_York.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1915559/julius','https://www.tripadvisor.com/Restaurant_Review-g60763-d534220-Reviews-Julius_Restaurant-New_York_City_New_York.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1915559/julius','https://www.tripadvisor.com/Restaurant_Review-g60763-d534220-Reviews-Julius_Restaurant-New_York_City_New_York.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1915559/julius']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1915559/julius','https://www.tripadvisor.com/Restaurant_Review-g60763-d534220-Reviews-Julius_Restaurant-New_York_City_New_York.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (586::bigint, jsonb_build_object(
      'queue_wait', 'The line starts becoming a real part of the night around 11 pm on big dates. Earlier entry saves time and lets you learn the maze before peak; a major holiday or themed event deserves even more buffer.',
      'best_nights', 'The full Theatron spectacle is a weekend mission: more rooms, drag, salsa, pop, reggaetón and electronic floors running at once. Thursday can still be excellent, but Saturday delivers the megaclub version people travel for.',
      'crowd_mix', 'Young LGBTQ+ Bogotanos lead the energy, joined by allies, domestic visitors and international club tourists. Twenty rooms prevent one uniform crowd: each floor develops its own age, music and flirtation pattern.',
      'dress_code', 'There is no single circuit uniform. Comfortable, expressive dancewear works across the rooms, and reviews specifically celebrate leaving rigid dress codes behind. Shoes and layers should survive a very long night.',
      'staff_inclusivity', 'The room itself earns strong inclusion praise; staff feedback is less tidy. Helpful teams appear beside complaints about security tone, coordination and bar handling. The community welcome can be warmer than the operational one.',
      'source_urls', to_jsonb(array[
        'https://www.tripadvisor.com/Attraction_Review-g294074-d3849793-Reviews-Theatron-Bogota.html',
        'https://wanderlog.com/place/details/42460/theatron',
        'https://thediscreetgentleman.com/countries/colombia/bogota/chapinero/theatron',
        'https://restaurantguru.com/Theatron-Bogota'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://thediscreetgentleman.com/countries/colombia/bogota/chapinero/theatron','https://www.tripadvisor.com/Attraction_Review-g294074-d3849793-Reviews-Theatron-Bogota.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://thediscreetgentleman.com/countries/colombia/bogota/chapinero/theatron','https://wanderlog.com/place/details/42460/theatron']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g294074-d3849793-Reviews-Theatron-Bogota.html','https://thediscreetgentleman.com/countries/colombia/bogota/chapinero/theatron']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g294074-d3849793-Reviews-Theatron-Bogota.html','https://thediscreetgentleman.com/countries/colombia/bogota/chapinero']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g294074-d3849793-Reviews-Theatron-Bogota.html','https://wanderlog.com/place/details/42460/theatron','https://restaurantguru.com/Theatron-Bogota']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (104::bigint, jsonb_build_object(
      'queue_wait', 'PRIK is usually a bar arrival rather than a club queue. The terrace and Sunday karaoke create the real crowd pressure, so arrive before 8 pm if a good seat and an unhurried first spritz matter.',
      'best_nights', 'Sunday karaoke after 8 pm is the clearest weekly ritual; themed Latin nights bring a different, dance-forward crowd. Pick Sunday for sing-along camp or follow the calendar when you want more party than cocktail bar.',
      'crowd_mix', 'Locals, expats, tourists, party monsters and chill queens all appear in the venue’s own description—and reviews support the mix. It is openly queer without demanding insider credentials from first-time visitors.',
      'dress_code', 'There is officially no dress code and no pretension. Streetwear, date-night colour, travel-day clothes and full sparkle can share the same terrace; come as yourself and dress for the weather.',
      'staff_inclusivity', 'Friendly staff and an easy welcome repeat strongly across reviews. The tone is playful rather than ceremonial, with first-timers and international guests regularly describing the room as comfortable to enter.',
      'source_urls', to_jsonb(array[
        'https://www.prikamsterdam.nl/copy-of-home',
        'https://wanderlog.com/place/details/477356',
        'https://www.corner.inc/place/pWYdWYWdUwNo'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.corner.inc/place/pWYdWYWdUwNo','https://wanderlog.com/place/details/477356']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.corner.inc/place/pWYdWYWdUwNo','https://www.prikamsterdam.nl/copy-of-home']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.prikamsterdam.nl/copy-of-home','https://wanderlog.com/place/details/477356']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.prikamsterdam.nl/copy-of-home']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/477356','https://www.prikamsterdam.nl/copy-of-home']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (113::bigint, jsonb_build_object(
      'queue_wait', 'On a big Saturday the line starts forming around 10 pm and can be very long by 11. Entry still feels unpredictable after the wait, so bring photo ID, arrive early and keep a second plan within easy reach.',
      'best_nights', 'Thursday brings a more mixed crowd; Saturday is the large-scale pop-club version with the heaviest pressure. Choose Thursday for easier social energy and Saturday when you actively want the full central-London spectacle.',
      'crowd_mix', 'Young queer Londoners, gay men, lesbians, students and international visitors all pass through this central landmark. The exact night changes the balance, with weekends feeling bigger and more destination-led.',
      'dress_code', 'There is no formal fashion code, but the door still makes judgments. Wear practical pop-club clothes, carry valid ID and avoid arriving visibly drunk; looking “gay enough” should not be a rule, despite troubling guest reports.',
      'staff_inclusivity', 'Recent feedback raises serious inclusion concerns at the door, including accounts of discriminatory or mocking treatment. Other guests praise cloakroom and bar teams inside, making the split between security and floor staff important.',
      'source_urls', to_jsonb(array[
        'https://g-a-yandheaven.co.uk/',
        'https://www.tripadvisor.com/Attraction_Review-g186338-d187574-Reviews-Heaven-London_England.html',
        'https://wanderlog.com/place/details/452936/heaven',
        'https://www.reddit.com/r/londonlgbt/comments/1undcz5/heaven_tonight/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g186338-d187574-Reviews-Heaven-London_England.html','https://www.reddit.com/r/londonlgbt/comments/1undcz5/heaven_tonight/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/452936/heaven','https://www.reddit.com/r/londonlgbt/comments/1ttvxcv/anyone_going_heaven_tonight_010626/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://wanderlog.com/place/details/452936/heaven','https://www.reddit.com/r/londonlgbt/comments/1ttvxcv/anyone_going_heaven_tonight_010626/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g186338-d187574-Reviews-Heaven-London_England.html','https://www.nightflow.com/heaven-london/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g186338-d187574-Reviews-Heaven-London_England.html','https://wanderlog.com/place/details/452936/heaven','https://www.reddit.com/r/londonlgbt/comments/1sfb157/bad_experience_at_heaven/']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (59, 602, 518, 568, 586, 104, 113)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 7 then
    raise exception 'Expected 7 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
