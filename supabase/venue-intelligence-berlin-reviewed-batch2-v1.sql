-- Queer Atlas venue intelligence: Berlin review-led editorial pass, batch 2.
-- Checked 2026-08-05. Reader copy paraphrases recurring review themes; source
-- names remain in evidence metadata only. Existing unrelated JSON keys survive.

begin;

with reviewed(id, patch) as (
  values
    (34::bigint, jsonb_build_object(
      'queue_wait', 'The pressure is mostly inside, not behind a formal club rope. Friday and Saturday can turn this little lounge shoulder-to-shoulder, so come earlier if you want a seat and actual conversation.',
      'best_nights', 'Friday and Saturday give Heile Welt its fullest glow: cocktails, close conversation and a room that gets deliciously snug. Earlier evenings are better for the lounge; later is for the social crush.',
      'crowd_mix', 'Schöneberg regulars anchor the room, joined by gay visitors working the Motzstraße circuit and a genuinely mixed queer-friendly crowd. It feels grown-up, sociable and more cocktail den than pickup factory.',
      'dress_code', 'Polished casual is the natural fit—good denim, a sharp shirt, something quietly fabulous. There is no costume door; the room rewards personal style that still works in a compact, busy bar.',
      'staff_inclusivity', 'Warm service is one of the clearest repeating themes: guests remember attentive bartenders, proper cocktail care and easy conversation. At peak hours that personal rhythm can slow, but the welcome reads consistently positive.',
      'source_urls', to_jsonb(array[
        'https://www.facebook.com/heileweltbar/',
        'https://berlin.gaycities.com/bars/1520-heile-welt?tag=mixed-gaystraight'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://berlin.gaycities.com/bars/1520-heile-welt?tag=mixed-gaystraight']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://berlin.gaycities.com/bars/1520-heile-welt?tag=mixed-gaystraight']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://berlin.gaycities.com/bars/1520-heile-welt?tag=mixed-gaystraight']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://berlin.gaycities.com/bars/1520-heile-welt?tag=mixed-gaystraight']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://berlin.gaycities.com/bars/1520-heile-welt?tag=mixed-gaystraight']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (37::bigint, jsonb_build_object(
      'queue_wait', 'K6 behaves like a neighbourhood bar, not a door-theatre club. The garden and karaoke can fill the place, but the practical squeeze is finding a good spot rather than losing hours in a line.',
      'best_nights', 'Sunday karaoke is the sweetest K6 ritual: regulars, sing-alongs and zero need to play it cool. Saturday theme parties run livelier; choose Sunday for personality and Saturday for more party in the room.',
      'crowd_mix', 'This is mature, local gay Berlin with a soft spot for regulars, silver foxes and solo drinkers who actually want to chat. Visitors are welcome, but the energy feels lived-in rather than tourist-staged.',
      'dress_code', 'Keep it easy: jeans, trainers, a favourite shirt and enough comfort for the beer garden or a karaoke detour. Nothing in the room suggests a fashion test; unpretentious is part of the charm.',
      'staff_inclusivity', 'Friendly, attentive bartenders are the review signature here. Guests repeatedly describe being drawn into conversation, remembered by the team and made comfortable even when arriving alone.',
      'source_urls', to_jsonb(array[
        'http://k6-berlin.de/home.php',
        'https://wanderlog.com/place/details/2452415',
        'https://restaurantguru.com/K6-Berlin',
        'https://rainbowindex.com/venue/k6'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2452415','https://restaurantguru.com/K6-Berlin']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://restaurantguru.com/K6-Berlin','https://rainbowindex.com/venue/k6']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2452415','https://rainbowindex.com/venue/k6']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2452415','https://rainbowindex.com/venue/k6']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/2452415','https://restaurantguru.com/K6-Berlin']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (43::bigint, jsonb_build_object(
      'queue_wait', 'Nightlife entry is usually relaxed; Sunday brunch is the real timing game. In warm weather, guest reports recommend arriving around opening if you want a terrace table rather than a long hunt for space.',
      'best_nights', 'Friday works when a named dance party lands; Sunday brunch shows the softer community side. Südblock changes shape across the week, so pick the programme—rock, karaoke, queer party or brunch—not a generic weekend rule.',
      'crowd_mix', 'Kreuzberg locals lead the mix, with many queer women, trans guests and an international crowd sharing space with neighbours and friends. It is politically rooted, mixed and noticeably less male-only than much of gay Berlin.',
      'dress_code', 'Everyday Kreuzberg style wins: relaxed layers, trainers, workwear, colour, whatever feels like you. The venue is socially expressive rather than fashion-policed; only a named event should change the brief.',
      'staff_inclusivity', 'The community mission is clear, but service reviews are genuinely mixed. Some guests describe laughter and warmth; others report impatient or dismissive treatment. The space can feel safer than the service feels consistent.',
      'source_urls', to_jsonb(array[
        'https://www.suedblock.org/wp/kontakt-zu-uns/',
        'https://www.timeout.com/berlin/lgbt/suedblock',
        'https://www.ellgeebe.com/en/destinations/europe/germany/berlin/nightlife/sudblock',
        'https://unilocal.de/deutschland/berlin/sudblock-85581'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.suedblock.org/wp/kontakt-zu-uns/','https://unilocal.de/deutschland/berlin/sudblock-85581']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.timeout.com/berlin/lgbt/suedblock','https://www.ellgeebe.com/en/destinations/europe/germany/berlin/nightlife/sudblock','https://unilocal.de/deutschland/berlin/sudblock-85581']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.timeout.com/berlin/lgbt/suedblock','https://www.ellgeebe.com/en/destinations/europe/germany/berlin/nightlife/sudblock']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.suedblock.org/wp/kontakt-zu-uns/','https://www.ellgeebe.com/en/destinations/europe/germany/berlin/nightlife/sudblock']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.suedblock.org/wp/kontakt-zu-uns/','https://unilocal.de/deutschland/berlin/sudblock-85581']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (34, 37, 43)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 3 then
    raise exception 'Expected 3 reviewed Berlin venue rows, found %', updated_count;
  end if;
end $$;

commit;
