-- Queer Atlas venue SEO quality pass, researched batch 1.
-- Ten records checked against current official pages, destination authorities,
-- event programmes and public review consensus on 2026-08-20.
-- Reader-facing descriptions do not name sources; provenance stays in venue_intel.

begin;

with reviewed(
  id,
  expected_name,
  description,
  location,
  lat,
  lng,
  hours,
  link,
  source_urls
) as (
  values
    (
      89::bigint,
      'Club Backdoor',
      'Stockholm''s large-format LGBTQ+ club sits beside the arena district, with three bars and dance floors that move between pop, disco, house and techno. Friday and Saturday run late; the scale and music win loyal fans, while mixed door and security reviews make arriving early and reading the room worthwhile.',
      'Arenavägen 75, 121 77 Johanneshov, Stockholm, Sweden',
      59.2940447::double precision,
      18.0793855::double precision,
      'Friday–Saturday 23:00–05:00; check the current programme and entry terms.',
      'https://www.instagram.com/clubbackdoor/',
      array[
        'https://www.visitstockholm.com/o/club-backdoor/',
        'https://www.visitstockholm.com/eat-drink/nightlife/mathias-janson-my-5-favourite-lgbtqi-spots/',
        'https://www.tripadvisor.co.uk/Attraction_Review-g189852-d23808047-Reviews-Club_Backdoor-Stockholm.html',
        'https://thatsup.se/stockholm/nattklubb/club-backdoor/'
      ]::text[]
    ),
    (
      90::bigint,
      'The Secret Garden',
      'A gay bar, restaurant and late-night meeting point tucked into Gamla Stan, with several rooms, a sheltered courtyard and DJs on busier nights. It shifts easily from after-work drinks to dancing; reviews praise its social energy but are divided on service and the door, especially at peak hours.',
      'Kornhamnstorg 59, 111 27 Stockholm, Sweden',
      59.3225226::double precision,
      18.0720262::double precision,
      'Daily 11:00–03:00; weekend DJ and party details vary.',
      'https://www.secretgardensthlm.se/',
      array[
        'https://www.secretgardensthlm.se/',
        'https://uploads-media.qx.se/QXQueerMap2026.pdf',
        'https://www.tripadvisor.com/Restaurant_Review-g189852-d7171645-Reviews-The_Secret_Garden-Stockholm.html',
        'https://thatsup.se/stockholm/nattklubb/the-secret-garden/reviews/'
      ]::text[]
    ),
    (
      91::bigint,
      'Patricia',
      'A moored party boat where the night can move between mainstream hits, Afrobeat, nostalgic favourites and karaoke without leaving the deck. Friday through Sunday brings the full multi-room experience and waterfront sunrise finish; the entrance level also has a ramp and accessible toilet.',
      'Kajplats 19, Söder Mälarstrand, 118 25 Stockholm, Sweden',
      59.3213969::double precision,
      18.0527645::double precision,
      'Friday–Sunday 20:00–05:00 for the nightclub; some areas may open earlier.',
      'https://www.patriciastockholm.se/nightclub/',
      array[
        'https://www.patriciastockholm.se/nightclub/',
        'https://uploads-media.qx.se/QXQueerMap2026.pdf'
      ]::text[]
    ),
    (
      92::bigint,
      'SLM Stockholm',
      'A member-led leather and fetish clubhouse for gay, bisexual and pansexual men, built around event-specific codes rather than ordinary bar drop-ins. Membership must be arranged before opening on the day of a visit, and each calendar listing explains the exact clothing, access and consent expectations.',
      'Wollmar Yxkullsgatan 18, 118 50 Stockholm, Sweden',
      59.3167320::double precision,
      18.0615606::double precision,
      'Event-led and members-only; consult the official calendar and apply before opening on the day of your visit.',
      'https://slmstockholm.se/?lang=en',
      array[
        'https://members.slmstockholm.se/application/',
        'https://slmstockholm.se/events/2026-05-29-cruising-night/?lang=en',
        'https://slmstockholm.se/?lang=en'
      ]::text[]
    ),
    (
      103::bigint,
      'Club NYX',
      'Three floors of queer Amsterdam energy in the heart of Reguliersdwarsstraat, with different rooms moving through pop, house, R&B and themed performances. NYX welcomes an open-minded mixed crowd rather than policing identity at the door, while its scale makes checking the night''s lineup useful before committing.',
      'Reguliersdwarsstraat 42, 1017 BM Amsterdam, Netherlands',
      52.3662696::double precision,
      4.8913243::double precision,
      'Thursday 23:00–04:00; Friday–Saturday 23:00–05:00.',
      'https://clubnyx.nl/',
      array[
        'https://clubnyx.nl/contact/',
        'https://clubnyx.nl/about/',
        'https://clubnyx.nl/venue/',
        'https://www.iamsterdam.com/en/whats-on/calendar/eating-and-drinking/cafes-and-bars/club-nyx',
        'https://www.timeout.com/amsterdam/clubs/club-nyx'
      ]::text[]
    ),
    (
      382::bigint,
      'Side Track',
      'A small, long-running gay bar and restaurant on Södermalm where conversation matters as much as the soundtrack. The intimate room, familiar pop and old hits, approachable food and regular-led atmosphere make it a gentler first stop than Stockholm''s larger late-night clubs.',
      'Wollmar Yxkullsgatan 7, 118 50 Stockholm, Sweden',
      59.3167790::double precision,
      18.0632050::double precision,
      null::text,
      'https://www.sidetrack.nu/',
      array[
        'https://www.sidetrack.nu/om-oss/',
        'https://www.visitstockholm.com/o/side-track/',
        'https://wanderlog.com/place/details/4762858/side-track'
      ]::text[]
    ),
    (
      385::bigint,
      'Under Bron',
      'The colder-season half of Stockholm''s club beneath Skanstull''s bridges, pairing a raw industrial setting with electronic music, live culture and a crowd drawn by the programme rather than one fixed scene. It is mixed rather than exclusively queer, and the exact room, music and entry pressure change by night.',
      'Hammarby Slussväg 2, 118 60 Stockholm, Sweden',
      59.3044382::double precision,
      18.0737881::double precision,
      'September–April; Friday–Saturday nights are typical, but exact hours follow the programme.',
      'https://tradgarden.com/',
      array[
        'https://tradgarden.com/?view=faq',
        'https://event.husetunderbron.se/index.php'
      ]::text[]
    ),
    (
      386::bigint,
      'Trädgården',
      'Stockholm''s sprawling summer club under the bridges, filling 2,000 square metres with outdoor hangouts, concerts and four weekend dance floors spanning techno, house, hip-hop, Afrobeats, indie and pop. The crowd is broad and expressive; entry is 23+, there is no dress code, and arriving early helps on major nights.',
      'Hammarby Slussväg 2, 118 60 Stockholm, Sweden',
      59.3044382::double precision,
      18.0737881::double precision,
      'May–September; opening hours and cover vary by programme.',
      'https://tradgarden.com/',
      array[
        'https://tradgarden.com/?view=faq',
        'https://event.husetunderbron.se/index.php'
      ]::text[]
    ),
    (
      389::bigint,
      'Debaser',
      'An established Hornstull concert and club complex where the calendar can pivot from indie and international live acts to drag, trans-led culture and exuberant queer party concepts. It is not a dedicated LGBTQ+ venue, so the named organiser and event page—not the building alone—tell you who the night is for.',
      'Hornstulls Strand 4, 117 39 Stockholm, Sweden',
      59.3150962::double precision,
      18.0309054::double precision,
      'Event-led; doors, age limits and closing times are listed for each programme.',
      'https://www.debaser.se/',
      array[
        'https://www.debaser.se/',
        'https://www.debaser.se/om-oss',
        'https://www.debaser.se/faq',
        'https://www.debaser.se/events/underkladesfesten-3cf87',
        'https://www.debaser.se/events/allt-du-skulle-vilja-veta-om-trans'
      ]::text[]
    ),
    (
      390::bigint,
      'Mälarpaviljongen',
      'A leafy summer-only restaurant and bar spread across the Kungsholmen waterfront, pier and floating pavilion, loved for long light, Riddarfjärden views and an easy gay-mixed crowd. Come for an afternoon drink that can become a lively evening; weather and season matter more than a fixed nightlife timetable.',
      'Norr Mälarstrand 64, 112 35 Stockholm, Sweden',
      59.3279881::double precision,
      18.0341899::double precision,
      'Summer season only; daily hours vary with the season and weather.',
      'https://malarpaviljongen.se/',
      array[
        'https://www.visitstockholm.com/o/malarpaviljongen/',
        'https://visitsweden.com/where-to-go/middle-sweden/stockholm/over-rainbow/',
        'https://uploads-media.qx.se/QXQueerMap2026.pdf',
        'https://maps.apple.com/place?place-id=ID0D32D2DD6364882'
      ]::text[]
    )
), updated as (
  update public.places as p
  set
    description = reviewed.description,
    location = reviewed.location,
    lat = reviewed.lat,
    lng = reviewed.lng,
    hours = coalesce(reviewed.hours, p.hours),
    link = reviewed.link,
    venue_intel = coalesce(p.venue_intel, '{}'::jsonb) || jsonb_build_object(
      'source_urls', to_jsonb(reviewed.source_urls),
      'research_status', 'editorial_review_consensus',
      'updated_at', '2026-08-20T00:00:00Z'
    ),
    seo_indexable = true,
    seo_quality_status = 'approved',
    updated_at = timezone('utc', now())
  from reviewed
  where p.id = reviewed.id
    and p.name = reviewed.expected_name
  returning p.id
)
select count(*) as updated_rows from updated;

do $$
declare
  updated_count integer;
  bad_count integer;
begin
  select count(*) into updated_count
  from public.places
  where id in (89, 90, 91, 92, 103, 382, 385, 386, 389, 390)
    and venue_intel->>'research_status' = 'editorial_review_consensus'
    and venue_intel->>'updated_at' = '2026-08-20T00:00:00Z';

  if updated_count <> 10 then
    raise exception 'Expected 10 researched venue rows, found %', updated_count;
  end if;

  select count(*) into bad_count
  from public.places
  where id in (89, 90, 91, 92, 103, 382, 385, 386, 389, 390)
    and (
      coalesce(length(trim(description)), 0) < 180
      or location is null
      or lat is null
      or lng is null
      or link is null
      or jsonb_typeof(venue_intel->'source_urls') <> 'array'
      or jsonb_array_length(venue_intel->'source_urls') < 2
    );

  if bad_count <> 0 then
    raise exception 'Quality verification failed for % researched venue rows', bad_count;
  end if;
end $$;

commit;

select
  id,
  name,
  city,
  length(description) as description_chars,
  location,
  seo_indexable,
  seo_quality_status,
  jsonb_array_length(venue_intel->'source_urls') as source_count
from public.places
where id in (89, 90, 91, 92, 103, 382, 385, 386, 389, 390)
order by city, name;
