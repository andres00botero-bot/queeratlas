-- Queer Atlas venue intelligence: Berlin review-led editorial pass, batch 3.
-- Checked 2026-08-05. Source names stay in evidence metadata, not reader copy.

begin;

with reviewed(id, patch) as (
  values
    (36::bigint, jsonb_build_object(
      'queue_wait', 'This tiny bar is more about claiming a favourite corner than surviving a door line. Come early for the generous happy-hour window; later, the compact room naturally shifts from quiet chat to a snug local buzz.',
      'best_nights', 'Dreizehn works best as an early-evening slow burn: happy hour from 2–5 pm, then drinks and conversation without club theatrics. Pick it when the people matter more than a headline event.',
      'crowd_mix', 'The mix changes with the hour, but the recurring character is local, varied and conversational. Regulars give it a family-bar feeling; visitors fit best when they arrive ready to talk rather than just tick off a gay-bar stop.',
      'dress_code', 'Neighbourhood casual is exactly right—denim, trainers, a relaxed shirt, no performance required. The room is intimate and lived-in, so dressing like yourself lands better than bringing a full club look.',
      'staff_inclusivity', 'The family-run warmth is central to the positive reviews. Guests describe a small place where relaxed service and actual conversation shape the night, with the welcome feeling personal rather than processed.',
      'source_urls', to_jsonb(array[
        'https://www.gayout.com/europe/germany/berlin/bars/dreizehn-1894'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.gayout.com/europe/germany/berlin/bars/dreizehn-1894']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','source_summary','source_urls',to_jsonb(array['https://www.gayout.com/europe/germany/berlin/bars/dreizehn-1894']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.gayout.com/europe/germany/berlin/bars/dreizehn-1894']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.gayout.com/europe/germany/berlin/bars/dreizehn-1894']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.gayout.com/europe/germany/berlin/bars/dreizehn-1894']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (38::bigint, jsonb_build_object(
      'queue_wait', 'A formal line is not the Tramp’s story; reviews describe anything from a quiet room to an easy local buzz. The useful friction is practical instead: bring cash, then walk in and find your corner.',
      'best_nights', 'Its superpower is the after-hours slot, when other plans are winding down and you still want one more drink. Go off-peak for conversation; let the late-night crowd provide the livelier version.',
      'crowd_mix', 'Schöneberg locals and gay regulars form the backbone, with late-night visitors drifting in from nearby bars. It reads as a real local hangout—mixed in age, unshowy and better for chatting than posing.',
      'dress_code', 'Come as you are. Everyday bar clothes, denim and trainers match the cosy, no-fuss room; there is no review pattern suggesting a themed look or selective fashion door.',
      'staff_inclusivity', 'Friendly staff and clientele repeat across guest accounts, including visitors who appreciated being met in English. The welcome is casual and direct, with cash-only service being the more common practical complaint.',
      'source_urls', to_jsonb(array[
        'https://wanderlog.com/place/details/8810884/tramps'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/8810884/tramps']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/8810884/tramps']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/8810884/tramps']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://wanderlog.com/place/details/8810884/tramps']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/8810884/tramps']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (40::bigint, jsonb_build_object(
      'queue_wait', 'Think café rhythm, not nightclub queue. Breakfast, cake and sunny terrace hours create the real pinch points, so arrive before the obvious brunch rush if choosing your table matters.',
      'best_nights', 'The best Romeo und Romeo visit is often daylight: breakfast, coffee and cake with Motzstraße moving around you. Early evening works for a gentle first drink, but this place shines as a queer café before it does as nightlife.',
      'crowd_mix', 'Gay neighbourhood regulars, couples, solo coffee drinkers and visitors share the tables. The location brings tourists, yet repeat local reviews and all-day use keep it from feeling like a scene-only stop.',
      'dress_code', 'Café casual all the way—streetwear, workday clothes, brunch looks and a little terrace polish all belong. There is no threshold performance; dress for sitting comfortably and being seen on Motzstraße.',
      'staff_inclusivity', 'The service picture is sharply mixed. Many guests describe kind, personable staff and a lovely host; others report rude or confrontational encounters with individual team members. Warmth is common, not guaranteed.',
      'source_urls', to_jsonb(array[
        'https://www.tripadvisor.co.uk/Restaurant_Review-g187323-d6999551-Reviews-Romeo_und_Romeo-Berlin.html',
        'https://wanderlog.com/de/place/details/1308514/romeo-und-romeo',
        'https://www.gayout.com/europe/germany/berlin/restaurants/romeo-and-romeo-2010'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Restaurant_Review-g187323-d6999551-Reviews-Romeo_und_Romeo-Berlin.html','https://wanderlog.com/de/place/details/1308514/romeo-und-romeo']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Restaurant_Review-g187323-d6999551-Reviews-Romeo_und_Romeo-Berlin.html','https://www.gayout.com/europe/germany/berlin/restaurants/romeo-and-romeo-2010']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Restaurant_Review-g187323-d6999551-Reviews-Romeo_und_Romeo-Berlin.html','https://www.gayout.com/europe/germany/berlin/restaurants/romeo-and-romeo-2010']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Restaurant_Review-g187323-d6999551-Reviews-Romeo_und_Romeo-Berlin.html','https://www.gayout.com/europe/germany/berlin/restaurants/romeo-and-romeo-2010']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Restaurant_Review-g187323-d6999551-Reviews-Romeo_und_Romeo-Berlin.html','https://wanderlog.com/de/place/details/1308514/romeo-und-romeo']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (36, 38, 40)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 3 then
    raise exception 'Expected 3 reviewed Berlin venue rows, found %', updated_count;
  end if;
end $$;

commit;
