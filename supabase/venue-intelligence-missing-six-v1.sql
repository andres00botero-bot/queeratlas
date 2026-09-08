-- Queer Atlas · source-backed completion of six partial Venue Intelligence profiles
-- Research checked 2026-08-27. Safe to run again.

begin;

update public.places
set venue_intel = coalesce(venue_intel, '{}'::jsonb) || jsonb_build_object(
  'best_nights', 'Friday is the anchor: Aireana publishes free cultural programming every Friday from 20:00 to 02:00. Check the week''s announced performance or workshop before travelling, because the format changes.',
  'source_urls', jsonb_build_array('https://www.aireana.org.py/la-serafina/'),
  'research_status', 'source_checked_2026_08_27'
)
where id = 2500 and name = 'La Serafina (Espacio Cultural Feminista)';

update public.places
set venue_intel = coalesce(venue_intel, '{}'::jsonb) || jsonb_build_object(
  'queue_wait', 'Entry is generally walk-in rather than reservation-led. Arrive near the 15:00–15:30 opening for the quietest access; allow extra time on the extended Friday night and monthly Red Night dates.',
  'source_urls', jsonb_build_array(
    'https://www.waze.com/live-map/directions/py/asuncion/asuncion/menstetic-sauna-and-spa?to=place.ChIJQy2Sl_anXZQRC9COU8zJ4Mc',
    'https://afetishleatherlatam.com/leather-%26-fetish-club-pry'
  ),
  'research_status', 'source_checked_2026_08_27'
)
where id = 2501 and name = 'Menstetic';

update public.places
set venue_intel = coalesce(venue_intel, '{}'::jsonb) || jsonb_build_object(
  'dress_code', 'No general guest dress code is published. Casual contemporary clothes suit the hotel, coworking and bar; bring dedicated swimwear for the seasonal pool and follow any event-specific instructions.',
  'source_urls', jsonb_build_array(
    'https://www.thesocialhub.co/bologna/',
    'https://www.thesocialhub.co/496eb7/globalassets/09.-downloads--video/downloads/house-rules/tsh-houserules_bologna_final.pdf'
  ),
  'research_status', 'source_checked_2026_08_27'
)
where id = 2211 and name = 'The Social Hub Bologna';

update public.places
set venue_intel = coalesce(venue_intel, '{}'::jsonb) || jsonb_build_object(
  'dress_code', 'No current written dress code is published by the club. Choose comfortable dance-ready clubwear and check Kaliente''s official Facebook before themed nights, as event-specific looks may differ.',
  'source_urls', jsonb_build_array(
    'https://www.facebook.com/kalienteclub',
    'https://maps.apple.com/place?place-id=IC6A1B54F413E0A9F'
  ),
  'research_status', 'source_checked_2026_08_27'
)
where id = 2561 and name = 'Kaliente';

update public.places
set venue_intel = coalesce(venue_intel, '{}'::jsonb) || jsonb_build_object(
  'best_nights', 'Verify the property''s current operator before booking: Hyatt no longer lists Hyatt Place Panama City/Downtown in its current portfolio after reporting the property sold in 2023. Historically, its location worked for nights around Calle Uruguay dining and clubs.',
  'source_urls', jsonb_build_array(
    'https://investors.hyatt.com/files/doc_financials/2024/q1/Final-Q1-2024-Earnings-Release-Full.pdf',
    'https://newsroom.hyatt.com/102914First-Hyatt-Place-Hotel-Opens-In-Panama'
  ),
  'research_status', 'source_checked_2026_08_27'
)
where id = 2504 and name = 'Hyatt Place Panama City/Downtown';

update public.places
set venue_intel = coalesce(venue_intel, '{}'::jsonb) || jsonb_build_object(
  'dress_code', 'Casual techno-ready clothing is appropriate, but sandals are explicitly refused. Bring government-issued photo ID; admission is restricted to guests aged 20 or older.',
  'source_urls', jsonb_build_array('https://vent-tokyo.net/'),
  'research_status', 'source_checked_2026_08_27'
)
where id = 2053 and name = 'Vent';

commit;

select
  id,
  city,
  name,
  venue_intel ->> 'queue_wait' as queue_wait,
  venue_intel ->> 'best_nights' as best_nights,
  venue_intel ->> 'dress_code' as dress_code,
  venue_intel -> 'source_urls' as source_urls
from public.places
where id in (2053, 2211, 2500, 2501, 2504, 2561)
order by city, name;
