-- Queer Atlas venue intelligence: Berlin review-led editorial pass, batch 1.
-- Checked 2026-08-05. Public review themes are paraphrased; source links stay
-- separate from the reader-facing copy. Existing unrelated JSON keys survive.

begin;

with reviewed(id, patch) as (
  values
    (1::bigint, jsonb_build_object(
      'queue_wait', 'The Saturday-night line can stretch past three hours, while Sunday daytime reports range from a short wait to several hours. The door stays selective at every hour, so waiting never guarantees entry.',
      'best_nights', 'Klubnacht comes into its own on Sunday morning and afternoon: the room is fully awake, the crowd is more settled and the queer roots feel clearest. Choose the lineup first, then your arrival window.',
      'crowd_mix', 'Berlin regulars, serious techno dancers and a strong queer and gay contingent share the floors with international visitors. Saturday can feel more destination-heavy; Sunday usually brings more familiar faces.',
      'dress_code', 'There is no official all-black uniform. A personal, dance-ready look that feels natural on you works better than costume-copying; specialist nights such as Snax publish their own stricter brief.',
      'staff_inclusivity', 'Experiences split sharply at the threshold: the door is terse and unpredictable, while reports from inside more often describe privacy rules and staff intervention as protective. Neither signal is universal.',
      'source_urls', to_jsonb(array[
        'https://www.berghain.berlin/en/program/',
        'https://www.tripadvisor.com/Attraction_Review-g187323-d2038917-Reviews-Berghain-Berlin.html',
        'https://www.cntraveler.com/bars/berlin/berghain-and-panorama-bar',
        'https://www.reddit.com/r/Berghain_Community/comments/1mro1ts'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g187323-d2038917-Reviews-Berghain-Berlin.html','https://www.reddit.com/r/Berghain_Community/comments/1mro1ts']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.berghain.berlin/en/program/','https://www.tripadvisor.com/Attraction_Review-g187323-d2038917-Reviews-Berghain-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g187323-d2038917-Reviews-Berghain-Berlin.html','https://www.cntraveler.com/bars/berlin/berghain-and-panorama-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g187323-d2038917-Reviews-Berghain-Berlin.html','https://www.berghain.berlin/en/program/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g187323-d2038917-Reviews-Berghain-Berlin.html','https://www.reddit.com/r/Berghain_Community/comments/1mro1ts']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (2::bigint, jsonb_build_object(
      'queue_wait', 'Arrival just after opening can mean only a few minutes; after the main rush, accounts regularly describe one to two hours or more. Online entry does not override the door, so early still matters.',
      'best_nights', 'Saturday is the full-scale reference night, with more rooms and the strongest fetish-club identity. Wednesday also has a loyal following; the named party matters more than the weekday alone.',
      'crowd_mix', 'The room mixes Berlin regulars with a large international audience across ages, races, genders and sexualities. Each promoter shifts the balance, from queer rave crowd to explicitly sex-positive regulars.',
      'dress_code', 'Main nights expect a deliberate fetish or expressive look—latex, leather, harnesses, lingerie and creative skin-forward styling all appear. Some formats relax the rule, so read that party’s brief and change inside if needed.',
      'staff_inclusivity', 'Feedback is mixed but specific: many guests praise the awareness, medic and floor teams for calm support, while others describe abrupt door or bar interactions. The strongest positive reports concern help once inside.',
      'source_urls', to_jsonb(array[
        'https://www.kitkatclub.org/Home/Club/Index.en.html',
        'https://www.visitberlin.de/en/kitkatclub',
        'https://www.tripadvisor.com/Attraction_Review-g187323-d254729-Reviews-KitKatClub-Berlin.html',
        'https://wanderlog.com/place/details/453625/kitkatclub'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/453625/kitkatclub','https://www.tripadvisor.com/Attraction_Review-g187323-d254729-Reviews-KitKatClub-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.kitkatclub.org/Home/Club/Index.en.html','https://www.tripadvisor.com/Attraction_Review-g187323-d254729-Reviews-KitKatClub-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g187323-d254729-Reviews-KitKatClub-Berlin.html','https://wanderlog.com/place/details/453625/kitkatclub']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.visitberlin.de/en/kitkatclub','https://www.kitkatclub.org/Home/Club/Index.en.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/453625/kitkatclub','https://www.tripadvisor.com/Attraction_Review-g187323-d254729-Reviews-KitKatClub-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (3::bigint, jsonb_build_object(
      'queue_wait', 'This is usually a bar arrival rather than a club-door ordeal. Sunday coffee and cake and warm-weather terrace hours create the real pinch points; the spacious main room absorbs the evening crowd well.',
      'best_nights', 'Sunday afternoon is the signature visit, built around the long-running coffee-and-cake tradition. Friday and Saturday bring more bar-crawl energy, but Sunday shows the venue’s social character best.',
      'crowd_mix', 'The centre of gravity is grown-up gay men, Schöneberg regulars and bear or leather-adjacent guests, with plenty of visiting men dropping in because of the location. Sunday is especially conversational.',
      'dress_code', 'Everyday menswear, denim, leather and smart-casual bar clothes all fit. It is masculine without being a costume door, so comfort and confidence matter more than dressing for a theme.',
      'staff_inclusivity', 'Reviews focus more on atmosphere and value than on identity problems. The practical signal is a venue comfortable with solo visitors and repeat guests, although service can slow when the bar is packed.',
      'source_urls', to_jsonb(array[
        'https://www.prinzknecht-berlin.de/',
        'https://www.tripadvisor.com/Attraction_Review-g187323-d196260-Reviews-Prinzknecht-Berlin.html',
        'https://www.travelgay.com/venue/prinzknecht'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.prinzknecht-berlin.de/','https://www.tripadvisor.com/Attraction_Review-g187323-d196260-Reviews-Prinzknecht-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.prinzknecht-berlin.de/','https://www.tripadvisor.com/Attraction_Review-g187323-d196260-Reviews-Prinzknecht-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.travelgay.com/venue/prinzknecht','https://www.tripadvisor.com/Attraction_Review-g187323-d196260-Reviews-Prinzknecht-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g187323-d196260-Reviews-Prinzknecht-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Attraction_Review-g187323-d196260-Reviews-Prinzknecht-Berlin.html','https://www.travelgay.com/venue/prinzknecht']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (7::bigint, jsonb_build_object(
      'queue_wait', 'There is rarely a formal door line; the challenge is finding room once the bar fills. Thursday is repeatedly described as sardine-tight, with slower movement and service rather than a velvet-rope wait.',
      'best_nights', 'Thursday is the famous crush and the strongest gay-bar night. Choose an earlier hour for conversation, or accept the shoulder-to-shoulder version if you want Möbel-Olfe at maximum Kreuzberg intensity.',
      'crowd_mix', 'Kreuzberg regulars, queer locals and a hipster-leaning crowd mix with travelers who know the bar’s reputation. It feels local in attitude even when Thursday pulls a noticeable international contingent.',
      'dress_code', 'The room is resolutely casual: denim, trainers, workwear and expressive everyday queer style make more sense than polished clubwear. There is no themed door to dress for.',
      'staff_inclusivity', 'The review conversation centres on the crowd, smoke and packed room more than staff conduct. Treat the welcome as busy-bar directness; no stable review consensus supports a stronger claim either way.',
      'source_urls', to_jsonb(array[
        'https://www.moebel-olfe.de/',
        'https://unilocal.de/deutschland/berlin/mobel-olfe-60669'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://unilocal.de/deutschland/berlin/mobel-olfe-60669']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://unilocal.de/deutschland/berlin/mobel-olfe-60669']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://unilocal.de/deutschland/berlin/mobel-olfe-60669']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.moebel-olfe.de/','https://unilocal.de/deutschland/berlin/mobel-olfe-60669']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','not_published','source_urls',to_jsonb(array['https://unilocal.de/deutschland/berlin/mobel-olfe-60669']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (8::bigint, jsonb_build_object(
      'queue_wait', 'Roses is tiny, so the pressure shows up inside more than in a managed queue. Late weekend arrivals can meet a packed, smoky room; quieter Sundays are repeatedly described as easier.',
      'best_nights', 'Friday and Saturday deliver the loud, compressed late-night version. Sunday is the better choice for the décor, music and conversation without the same squeeze.',
      'crowd_mix', 'A deliberately eclectic queer crowd mixes Kreuzberg locals with international visitors drawn by the pink-fur mythology. The room is intimate enough that one group can change the whole atmosphere.',
      'dress_code', 'No formal code: casual Berlin black, vintage pieces, colour and camp all work against the maximalist interior. Dress for heat and smoke rather than for door approval.',
      'staff_inclusivity', 'Reports are genuinely divided. Some guests remember friendly barmen and a playful welcome; others describe rude or aggressive exchanges, particularly around photos and house rules. Expect the tone to vary by shift.',
      'source_urls', to_jsonb(array[
        'https://www.instagram.com/roses.bar.berlin36.gaybar/',
        'https://wanderlog.com/place/details/1953063/roses',
        'https://www.travelgay.com/venue/roses'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1953063/roses','https://www.travelgay.com/venue/roses']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1953063/roses']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1953063/roses','https://www.travelgay.com/venue/roses']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.instagram.com/roses.bar.berlin36.gaybar/','https://wanderlog.com/place/details/1953063/roses']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1953063/roses','https://www.travelgay.com/venue/roses']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (27::bigint, jsonb_build_object(
      'queue_wait', 'Entry is handled at reception rather than a club door. The practical bottleneck is lockers and changing space during the busiest sessions, not a long outdoor line.',
      'best_nights', 'Sunday afternoon into evening is the most consistently recommended busy window; Friday after work is another regular favourite. Weekday afternoons suit a calmer first visit.',
      'crowd_mix', 'Gay and bisexual men across ages and body types share the facilities, with Berlin regulars and visitors both strongly represented. Reviews repeatedly note that the atmosphere is broader than a single body ideal.',
      'dress_code', 'Street clothes go into the locker. Inside, the practical uniform is the venue towel and shower footwear; phones stay locked away, and using one in the facilities can end the visit immediately.',
      'staff_inclusivity', 'The stronger review theme is professional rule enforcement and a space where different ages and bodies can settle in. Strict phone and conduct rules can feel abrupt, but they are central to privacy.',
      'source_urls', to_jsonb(array[
        'https://boiler-berlin.de/',
        'https://www.tripadvisor.ca/Attraction_Review-g187323-d2477933-Reviews-Der_Boiler-Berlin.html',
        'https://www.reddit.com/r/askberliners/comments/1qkmnov/der_boiler/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://boiler-berlin.de/','https://www.tripadvisor.ca/Attraction_Review-g187323-d2477933-Reviews-Der_Boiler-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.reddit.com/r/askberliners/comments/1qkmnov/der_boiler/','https://www.tripadvisor.ca/Attraction_Review-g187323-d2477933-Reviews-Der_Boiler-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.ca/Attraction_Review-g187323-d2477933-Reviews-Der_Boiler-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://boiler-berlin.de/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.ca/Attraction_Review-g187323-d2477933-Reviews-Der_Boiler-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (31::bigint, jsonb_build_object(
      'queue_wait', 'This is reservation-led spa entry, not nightlife queuing. Busy weekends can slow reception and locker access; pre-booking a timed admission is the safer plan than arriving speculatively.',
      'best_nights', 'A weekday morning gives the calmest version of the complex. Weekend afternoons are livelier but also more crowded; this is a mainstream wellness visit, not a queer nightlife peak.',
      'crowd_mix', 'The audience is a broad, mixed-gender wellness crowd of Berlin residents and tourists. Vabali is not an LGBTQ-specific sauna, and its popularity with queer guests should not be mistaken for a queer venue identity.',
      'dress_code', 'The sauna and pool areas are textile-free. Bring a robe, towels and suitable sandals, then follow the house rules on seating towels, phones, photography and quiet zones.',
      'staff_inclusivity', 'Recent feedback is sharply mixed and includes serious criticism of front-desk tone and complaint handling alongside positive spa experiences. The evidence does not support presenting the welcome as consistently inclusive.',
      'source_urls', to_jsonb(array[
        'https://www.vabali.de/en/berlin/',
        'https://www.vabali.de/en/house-rules/',
        'https://www.trustpilot.com/review/vabali.de'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.vabali.de/en/berlin/','https://www.trustpilot.com/review/vabali.de']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.vabali.de/en/berlin/','https://www.trustpilot.com/review/vabali.de']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.vabali.de/en/berlin/','https://www.trustpilot.com/review/vabali.de']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.vabali.de/en/house-rules/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.trustpilot.com/review/vabali.de']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (32::bigint, jsonb_build_object(
      'queue_wait', 'HAFEN normally works as a walk-in. The terrace and compact bar can become dense on warm evenings and event nights, but reviews describe crowd pressure rather than a formal door queue.',
      'best_nights', 'The recurring quiz is the clearest community night; confirm its current weekday because older guides disagree. Summer terrace evenings and weekend parties show the bar at its busiest.',
      'crowd_mix', 'Schöneberg regulars and gay men across a wide age range mix with visitors working through the Motzstraße circuit. The terrace feels especially local, while later parties broaden the room.',
      'dress_code', 'Casual bar clothes are exactly right—denim, T-shirts, leather details or a smarter date-night layer all sit comfortably. There is no specialist door code.',
      'staff_inclusivity', 'Many descriptions call the team relaxed or friendly, but review history also contains criticism of how a theft report was handled. The fairest reading is generally easygoing service with an important dissenting account.',
      'source_urls', to_jsonb(array[
        'https://hafen-berlin.de/',
        'https://www.travelgay.com/venue/hafen',
        'https://www.gayplaces.co/city/berlin/bar/hafen'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/hafen','https://www.gayplaces.co/city/berlin/bar/hafen']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://hafen-berlin.de/','https://www.gayplaces.co/city/berlin/bar/hafen']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/hafen','https://www.gayplaces.co/city/berlin/bar/hafen']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://hafen-berlin.de/','https://www.travelgay.com/venue/hafen']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/hafen']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (33::bigint, jsonb_build_object(
      'queue_wait', 'Blond is usually an easy walk-in, though the small interior gets tight after the evening crowd arrives. Outdoor tables absorb some of the pressure; expect slower drinks rather than a club-style line.',
      'best_nights', 'Tuesday karaoke is the most consistently loved night and the easiest way into the room’s social rhythm. Other themed evenings work well, but Tuesday has the clearest repeat-review consensus.',
      'crowd_mix', 'A mostly gay but mixed crowd spans younger guests, older regulars, Berlin locals and international visitors. Reviews repeatedly describe it as unusually easy for solo guests to start talking to people.',
      'dress_code', 'Colourful casual clothes fit the retro cocktail setting; everyday Schöneberg barwear is enough. Dress for karaoke, terrace weather and a smoky room rather than for door selection.',
      'staff_inclusivity', 'Friendly, attentive staff are one of Blond’s strongest and most repeated review themes, including positive accounts from older, international and neurodivergent visitors. A few service complaints exist, but they are not the dominant pattern.',
      'source_urls', to_jsonb(array[
        'https://www.blond.berlin/en/',
        'https://www.travelgay.com/venue/blond',
        'https://www.tripadvisor.co.uk/Restaurant_Review-g187323-d4746139-Reviews-Blond-Berlin.html',
        'https://berlin.gaycities.com/bars/1956-blond'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/blond','https://www.tripadvisor.co.uk/Restaurant_Review-g187323-d4746139-Reviews-Blond-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/blond','https://www.tripadvisor.co.uk/Restaurant_Review-g187323-d4746139-Reviews-Blond-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.travelgay.com/venue/blond','https://berlin.gaycities.com/bars/1956-blond']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.blond.berlin/en/','https://www.tripadvisor.co.uk/Restaurant_Review-g187323-d4746139-Reviews-Blond-Berlin.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Restaurant_Review-g187323-d4746139-Reviews-Blond-Berlin.html','https://berlin.gaycities.com/bars/1956-blond']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
declare
  updated_count integer;
begin
  select count(*) into updated_count
  from public.places
  where id in (1, 2, 3, 7, 8, 27, 31, 32, 33)
    and venue_intel->>'research_status' = 'editorial_review_consensus';

  if updated_count <> 9 then
    raise exception 'Expected 9 reviewed Berlin venues, found %', updated_count;
  end if;
end $$;

commit;
