-- Queer Atlas venue intelligence: global review-led editorial pass, batch 5.
-- Seoul, Hong Kong, Buenos Aires, Chicago, Manchester and Brussels.
-- Checked 2026-08-05. Reader copy synthesises official facts and recurring
-- review themes; source names live only in the evidence metadata.

begin;

with reviewed(id, patch) as (
  values
    (671::bigint, jsonb_build_object(
      'queue_wait', 'Early Homo Hill is more lounge than line; the small room only finds its fever pitch around 2 am. Weekdays can be almost empty, so arrive late Friday or Saturday if you want people rather than a perfectly immediate door.',
      'best_nights', 'Friday and Saturday after midnight are the reliable choice, with the dance floor peaking closer to 2 am and carrying on toward dawn. Earlier hours suit a drink and people-watching before the hill starts moving.',
      'crowd_mix', 'Young Korean gay men, expats and international visitors share a noticeably global Itaewon room. It is more foreigner-friendly than many Seoul gay spaces, though the wider hill remains male-led and weekend-dependent.',
      'dress_code', 'Modern casual clubwear is enough: trainers, dark streetwear, fitted basics or a sharper Seoul look. There is no credible SOHO-specific strict code; the practical choice is something comfortable in a tiny, late and increasingly packed dance bar.',
      'staff_inclusivity', 'Foreigner-friendly positioning and long-standing traveller recommendations are the clearest signals. Recent independent staff detail is thin, so it is safer to promise an accessible international setting than universally attentive service.',
      'source_urls', to_jsonb(array[
        'https://www.timeout.com/seoul/nightlife/soho',
        'https://it.travelgay.com/venue/soho-2',
        'https://restaurantguru.com/Since2015-Itaewon-SOHO-bar-Seoul',
        'https://www.travelgay.com/seoul-gay-bars',
        'https://www.reddit.com/r/gaysian/comments/dx3u5u/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.timeout.com/seoul/nightlife/soho','https://www.reddit.com/r/gaysian/comments/dx3u5u/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.timeout.com/seoul/nightlife/soho','https://www.travelgay.com/seoul-gay-bars']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.timeout.com/seoul/nightlife/soho','https://www.travelgay.com/seoul-gay-bars','https://www.reddit.com/r/gaysian/comments/dx3u5u/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.timeout.com/seoul/nightlife/soho','https://www.reddit.com/r/seoul/comments/12b1xp3/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.timeout.com/seoul/nightlife/soho','https://restaurantguru.com/Since2015-Itaewon-SOHO-bar-Seoul']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (1334::bigint, jsonb_build_object(
      'queue_wait', 'This is a tucked-away cocktail arrival, not a nightclub queue. The semi-outdoor space can fill on Friday and Saturday, but the usual decision is where to stand with your drink rather than how long security will hold you outside.',
      'best_nights', 'Friday and Saturday bring the most social energy; a weekday is better for a low-fuss cocktail and actual conversation. Start here before a louder Central night instead of expecting a full dance-club finale.',
      'crowd_mix', 'Hong Kong gay regulars, expats, business travellers and Asian visitors share a small, internationally legible room. Japanese-speaking staff have helped build a noticeable Japanese guest following without making it tourist-only.',
      'dress_code', 'Central after-work casual fits perfectly: a clean tee, office-to-drinks layers or understated date-night polish. The open-air feel is relaxed and no repeated review signal points to a strict fashion door.',
      'staff_inclusivity', 'Friendly, no-fuss bartenders are the most consistent reason guests return, with Japanese language support adding practical welcome. The mood is intimate and easy rather than performatively inclusive or heavily programmed.',
      'source_urls', to_jsonb(array[
        'https://www.tripadvisor.com.sg/Attraction_Review-g294217-d10177722-Reviews-Time_Bar-Hong_Kong.html',
        'https://www.travelgay.com/venue/time-bar-hong-kong/',
        'https://www.travelgay.com/hong-kong-gay-bars-and-dance-clubs',
        'https://www.timeout.com/hong-kong/bars-and-pubs/time-bar'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com.sg/Attraction_Review-g294217-d10177722-Reviews-Time_Bar-Hong_Kong.html','https://www.timeout.com/hong-kong/bars-and-pubs/time-bar']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.timeout.com/hong-kong/bars-and-pubs/time-bar','https://www.travelgay.com/venue/time-bar-hong-kong/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.travelgay.com/hong-kong-gay-bars-and-dance-clubs','https://www.tripadvisor.com.sg/Attraction_Review-g294217-d10177722-Reviews-Time_Bar-Hong_Kong.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.timeout.com/hong-kong/bars-and-pubs/time-bar','https://www.travelgay.com/venue/time-bar-hong-kong/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com.sg/Attraction_Review-g294217-d10177722-Reviews-Time_Bar-Hong_Kong.html','https://www.travelgay.com/hong-kong-gay-bars-and-dance-clubs','https://www.travelgay.com/venue/time-bar-hong-kong/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (416::bigint, jsonb_build_object(
      'queue_wait', 'It begins as a Palermo drinks bar and grows into a packed late dance room, with a short line possible as the night deepens. Go during early happy-hour energy for easy service, or after midnight if a friendly squeeze is the point.',
      'best_nights', 'Wednesday’s recurring party offers a strong midweek social entry; Friday and Saturday run later and busier with live DJs. Early evening is for cocktails and meeting people, late night for pop-video dancing.',
      'crowd_mix', 'Queer Porteños in their twenties, thirties and beyond mix with Latin American and international visitors. The atmosphere is gay-led but hetero-friendly, and reviews repeatedly frame it as open-minded enough for solo newcomers.',
      'dress_code', 'Palermo casual with a little flirt works: tees, denim, fitted night-out pieces or brighter queer styling. No reliable strict code appears; dress for a small room that shifts from drinks to dancing and keep an eye on belongings.',
      'staff_inclusivity', 'Friendly, fast bartenders and a safe crowd dominate current feedback. A smaller set of 2025 reviews complains about poor service and very high drink prices, so confirm the menu before turning a warm welcome into an expensive surprise.',
      'source_urls', to_jsonb(array[
        'https://www.tripadvisor.com/Restaurant_Review-g312741-d8069677-Reviews-Peuteo-Buenos_Aires_Capital_Federal_District.html',
        'https://restaurantguru.com/Peuteo-Buenos-Aires-2',
        'https://es.travelgay.com/venue/peuteo-buenos-aires',
        'https://whereis.gay/listing/peuteo/',
        'https://nomadicboys.com/gay-bars-in-buenos-aires/'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.com/Restaurant_Review-g312741-d8069677-Reviews-Peuteo-Buenos_Aires_Capital_Federal_District.html','https://restaurantguru.com/Peuteo-Buenos-Aires-2']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://whereis.gay/listing/peuteo/','https://restaurantguru.com/Peuteo-Buenos-Aires-2']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://nomadicboys.com/gay-bars-in-buenos-aires/','https://www.tripadvisor.com/Restaurant_Review-g312741-d8069677-Reviews-Peuteo-Buenos_Aires_Capital_Federal_District.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://es.travelgay.com/venue/peuteo-buenos-aires','https://restaurantguru.com/Peuteo-Buenos-Aires-2']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://restaurantguru.com/Peuteo-Buenos-Aires-2','https://www.tripadvisor.com.br/Restaurant_Review-g312741-d8069677-Reviews-Peuteo-Buenos_Aires_Capital_Federal_District.html','https://nomadicboys.com/gay-bars-in-buenos-aires/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (436::bigint, jsonb_build_object(
      'queue_wait', 'There are no reservations or cover for regular programming, but major viewing parties and summer weekends fill the many rooms fast. Arrive early for a screen sightline or rooftop space; bag and coat inspection is standard at entry.',
      'best_nights', 'Monday, Friday and Sunday each carry show-tune rituals, while Friday and Saturday turn into full dance parties. Sunday Funday is the maximal communal sing-along; a themed Wednesday or Thursday is sharper for a specific pop obsession.',
      'crowd_mix', 'Chicago gay regulars anchor six rooms and the roof, joined by lesbians, trans guests, allies, neighbourhood groups and out-of-town pilgrims. Different bars let the crowd self-sort without losing the big shared-video moment.',
      'dress_code', 'Chicago dresses this down: casual bar clothes, sportswear, rooftop layers and themed pop looks all belong. The formal policy focuses on inspecting bags and coats, not policing a fashion uniform; it is strictly 21+.',
      'staff_inclusivity', 'Friendly, efficient service and a broad welcome lead most reviews, backed by visible trans-equality and sapphic programming. Some guests report being ignored at crowded bars, so scale can weaken individual service even when the institution is community-minded.',
      'source_urls', to_jsonb(array[
        'https://www.sidetrackchicago.com/',
        'https://www.sidetrackchicago.com/faq/',
        'https://www.sidetrackchicago.com/about/',
        'https://wanderlog.com/place/details/437916/sidetrack',
        'https://www.gayout.com/usa-canada/united-states/chicago/bars/sidetrack-chicago'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.sidetrackchicago.com/faq/','https://www.sidetrackchicago.com/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.sidetrackchicago.com/','https://www.sidetrackchicago.com/faq/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.sidetrackchicago.com/','https://wanderlog.com/place/details/437916/sidetrack']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.sidetrackchicago.com/faq/','https://www.reddit.com/r/AskChicago/comments/1rsdxve/removed/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/437916/sidetrack','https://www.gayout.com/usa-canada/united-states/chicago/bars/sidetrack-chicago','https://www.sidetrackchicago.com/']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (406::bigint, jsonb_build_object(
      'queue_wait', 'This is a cosy table-and-tapas arrival, not a club line. Reservations help for dinner because the rooms are intimate; afternoon drinks and later bar visits are easier when you are happy to take whichever corner opens up.',
      'best_nights', 'Come early for Spanish small plates and conversation, then follow any cabaret, spoken-word or alternative drag listing upstairs. Friday and Saturday stay later, but a relaxed weekday meal may show the house’s queer warmth more clearly than peak Canal Street.',
      'crowd_mix', 'Manchester queer locals, trans and non-binary guests, lesbians, gay men and allies share a broader constituency than the pop-heavy Village mainstream. Diners and craft-drink regulars give it a mixed-age, conversation-first rhythm.',
      'dress_code', 'Rustic pub and date-night casual both work: denim, knitwear, queer creative styling or an easy dinner look. There is no fashion door; the room rewards feeling comfortable enough to eat, read, play a game or stay for another glass.',
      'staff_inclusivity', 'Fresh 2025–26 reviews repeatedly praise warm, attentive and relaxed staff, including vegan-friendly guidance. The queer welcome feels embedded in how the small room is run rather than added as nightclub branding.',
      'source_urls', to_jsonb(array[
        'https://themollyhouse.com/',
        'https://www.tripadvisor.co.uk/Restaurant_Review-g187069-d3685518-Reviews-The_Molly_House-Manchester_Greater_Manchester_England.html',
        'https://www.gayout.com/europe/united-kingdom/manchester/bars/molly-house-manchester',
        'https://www.quandoo.co.uk/place/the-molly-house-28981/reviews?locale=en_GB',
        'https://www.happycow.net/reviews/the-molly-house-manchester-73308'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Restaurant_Review-g187069-d3685518-Reviews-The_Molly_House-Manchester_Greater_Manchester_England.html','https://www.quandoo.co.uk/place/the-molly-house-28981/reviews?locale=en_GB']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.gayout.com/europe/united-kingdom/manchester/bars/molly-house-manchester','https://www.tripadvisor.co.uk/Restaurant_Review-g187069-d3685518-Reviews-The_Molly_House-Manchester_Greater_Manchester_England.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.gayout.com/europe/united-kingdom/manchester/bars/molly-house-manchester','https://www.tripadvisor.co.uk/Restaurant_Review-g187069-d3685518-Reviews-The_Molly_House-Manchester_Greater_Manchester_England.html']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://themollyhouse.com/','https://wanderlog.com/place/details/119720']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://www.tripadvisor.co.uk/Restaurant_Review-g187069-d3685518-Reviews-The_Molly_House-Manchester_Greater_Manchester_England.html','https://www.quandoo.co.uk/place/the-molly-house-28981/reviews?locale=en_GB','https://www.happycow.net/reviews/the-molly-house-manchester-73308']::text[]),'checked_at','2026-08-05T00:00:00Z')
      ),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-05T00:00:00Z'
    )),
    (201::bigint, jsonb_build_object(
      'queue_wait', 'The bar itself becomes the stage, so capacity and sightlines are genuinely tight. Friday and Saturday admirers can fill the tiny room; arrive well before the first number if you want to see more than sequins above other people’s heads.',
      'best_nights', 'Friday and Saturday are the institution: a full night of drag led by the current artistic house. Friday’s live-singing slot is a smart choice for cabaret focus; Saturday feels more like the classic crowded Brussels pilgrimage.',
      'crowd_mix', 'Brussels LGBTQ+ regulars, drag devotees, curious visitors and mixed friend groups gather around the marble bar. The show is often French-led, but the visual comedy and international audience make the room more accessible than a language label suggests.',
      'dress_code', 'Come festive, not formal: queer colour, a night-out look or everyday clothes that can handle a tight standing cabaret. There is no documented fashion test; respect the performers, protect their working space and expect close quarters.',
      'staff_inclusivity', 'Welcoming staff and spectacular performers lead most guest summaries. A smaller but serious review thread raises emergency-safety concerns around locked doors, so the emotional welcome should be considered separately from physical crowd management.',
      'source_urls', to_jsonb(array[
        'https://www.visit.brussels/en/visitors/venue-details.Chez-Maman.242585',
        'https://wanderlog.com/place/details/1357134',
        'https://www.reddit.com/r/brussels/comments/td61an/',
        'https://www.reddit.com/r/DragRaceBelgique/comments/125r4sp'
      ]::text[]),
      'topic_evidence', jsonb_build_object(
        'queue_wait', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.visit.brussels/en/visitors/venue-details.Chez-Maman.242585','https://wanderlog.com/place/details/1357134']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'best_nights', jsonb_build_object('status','verified_policy','source_urls',to_jsonb(array['https://www.visit.brussels/en/visitors/venue-details.Chez-Maman.242585','https://www.reddit.com/r/DragRaceBelgique/comments/125r4sp']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'crowd_mix', jsonb_build_object('status','multi_source_summary','source_urls',to_jsonb(array['https://www.visit.brussels/en/visitors/venue-details.Chez-Maman.242585','https://www.reddit.com/r/brussels/comments/td61an/']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'dress_code', jsonb_build_object('status','community_signal','source_urls',to_jsonb(array['https://www.visit.brussels/en/visitors/venue-details.Chez-Maman.242585','https://wanderlog.com/place/details/1357134']::text[]),'checked_at','2026-08-05T00:00:00Z'),
        'staff_inclusivity', jsonb_build_object('status','review_consensus','source_urls',to_jsonb(array['https://wanderlog.com/place/details/1357134','https://www.visit.brussels/en/visitors/venue-details.Chez-Maman.242585']::text[]),'checked_at','2026-08-05T00:00:00Z')
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
  where id in (671, 1334, 416, 436, 406, 201)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-05T00:00:00Z';

  if updated_count <> 6 then
    raise exception 'Expected 6 globally reviewed venue rows, found %', updated_count;
  end if;
end $$;

commit;
