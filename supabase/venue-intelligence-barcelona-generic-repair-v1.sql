-- Venue Intelligence repair: barcelona, 20 individually researched places.
-- Idempotent and intentionally uses no temporary tables, staging tables or cross-statement aliases.

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable typical wait in minutes is published. The entrance is most pressured around the late Friday and Saturday arrival peak.','best_nights','Saturday Reinas del Océano is the clearest flagship night; Friday rotates urban, pop and house concepts, while weekday themes are lighter.','crowd_mix','A broad LGBTQIA+ dance crowd, including gay men, lesbians, younger visitors and mixed queer friendship groups.',
    'dress_code','Expressive clubwear and ordinary going-out clothes both fit; no theme-wide costume rule is published for regular nights.','staff_inclusivity','Drag artists and LGBTQIA+ programming are embedded in the nightly product. Arena publishes no staff-training standard or named welfare lead.',
    'source_urls','["https://arenadisco.com/","https://tickets.grupoarena.com/en/arena-experience/stars/"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=107
  and lower(trim(p.name))='arena madre'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No dependable minute estimate is published. The room fills progressively and entrance pressure is most plausible when the weekend dance floor peaks late.','best_nights','Tuesday to Thursday suit conversation; Friday and Saturday are the strongest choices for the later, louder dance-bar format.','crowd_mix','Long-time gay regulars mix with younger queer dancers, local friendship groups and visitors to Gaixample.',
    'dress_code','Relaxed bar clothes work early and casual dancewear later; the venue publishes no formal appearance requirement.','staff_inclusivity','Its long-running gay-bar identity is verified, but no concrete public policy on staff training or handling discrimination was located.',
    'source_urls','["https://www.patroc.com/guiagay/barcelona/d/puntobcn.html","https://www.corner.inc/place/pvSE8YUbFH43"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=108
  and lower(trim(p.name))='punto bcn'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No measured typical wait is available. Limited seating, rather than a managed club queue, is the main capacity constraint in this compact bar.','best_nights','Friday and Saturday bring the fullest social atmosphere; an early weekday evening is better for a seat and conversation.','crowd_mix','Predominantly gay men over 30, alongside tourists, regulars and respectful mixed LGBTQ+ friends.',
    'dress_code','Everyday casual bar clothing suits the small, informal room; no door-led fashion code is published.','staff_inclusivity','Current guides describe friendly service, but no verifiable staff training, reporting route or inclusion protocol is publicly documented.',
    'source_urls','["https://www.patroc.com/gay/barcelona/d/lachapelle.html","https://www.gaymap.live/la-chapelle"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=179
  and lower(trim(p.name))='la chapelle'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable typical wait is published. The late-night entrance can become busiest on Friday and Saturday, but a minute range cannot be supported.','best_nights','Friday and Saturday deliver the fullest drag-and-dance format; weeknights retain the show-led club concept with a smaller crowd.','crowd_mix','Gay and queer clubgoers, drag audiences, tourists and mixed friendship groups share a performance-focused room.',
    'dress_code','Polished casual clubwear is appropriate; third-party door guidance discourages sportswear, but the venue publishes no detailed formal code.','staff_inclusivity','Drag performers are part of Believe’s regular operation. The available material does not document employee inclusion training or a safeguarding contact.',
    'source_urls','["https://thebelieve.club/en/about-us/","https://www.patroc.com/gay/barcelona/gayguide.html"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=180
  and lower(trim(p.name))='believe club'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','Not applicable: no current Black Hole entrance or queue can be verified because that venue name was retired in 2022.','best_nights','No current best night exists for Black Hole. A separate successor venue must be assessed under its own current listing.','crowd_mix','Historically it served adult gay and bisexual men seeking a cruise and fetish environment; this is not a current crowd report.',
    'dress_code','No current Black Hole dress code exists. Historic requirements must not be presented as rules for a different successor venue.','staff_inclusivity','No current Black Hole staff team or inclusion practice can be verified; the retired record should not imply active support.',
    'source_urls','["https://thegaypassport.com/venue/the-basement-club/","https://fr.travelgay.com/venue/club-black-hole"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','rebranded_closed',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status=p.seo_quality_status,
  updated_at=timezone('utc',now())
where p.id=181
  and lower(trim(p.name))='black hole'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable reception-wait estimate is published. As a continuously operating sauna, it uses direct reception processing rather than a scheduled club queue.','best_nights','Current themed sessions and weekend afternoons are the most socially active choices; there is no verified single best weekday.','crowd_mix','Adult gay and bisexual men, with bears and bear admirers especially visible in the venue’s current positioning.',
    'dress_code','Towel or nudity is normal inside the wet and cruise areas; ordinary street clothes are left in the assigned locker.','staff_inclusivity','The operator serves gay and bisexual men and publishes house information, but no detailed staff inclusion or complaint protocol was found.',
    'source_urls','["https://www.saunaspases.com/saunacondal/wp-content/uploads/2026/01/Revista-Enero-2026.pdf","https://www.saunaspases.com/saunacondal/"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=183
  and lower(trim(p.name))='sauna condal'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No stable wait in minutes can be stated because each promoter controls demand. Sold-out club sessions create the greatest door pressure.','best_nights','Choose a named queer programme such as Churros con Chocolate; ordinary Nitsa and weekday sessions are mixed music events, not automatically queer nights.','crowd_mix','The audience changes by promoter: queer communities centre named LGBTQ+ parties, while regular concerts and electronic nights are broadly mixed.',
    'dress_code','There is no venue-wide fashion code; wear for the named event, with expressive queer looks common at dedicated parties.','staff_inclusivity','A permanent Purple Point, Equality Officer and trained venue teams can activate confidential support for harassment, violence or LGTBI-phobia.',
    'source_urls','["https://www.sala-apolo.com/en/news/the-purple-point-at-sala-apolo-three-years-working-towards-safer-nights-162","https://sala-apolo.com/es/apolo-rules"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=185
  and lower(trim(p.name))='apolo'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No dependable wait in minutes is published. The compact room can reach comfortable capacity during its named bear socials.','best_nights','Thursday Happy Bacon and the Sunday special are the clearest recurring bear-community sessions; Friday and Saturday are the livelier general bar nights.','crowd_mix','Bears, cubs, admirers and gay friends form the core, with respectful visitors outside those labels also present.',
    'dress_code','Casual bear-bar clothing, denim and harness accents all fit; regular nights have no mandatory fetish or body-type dress rule.','staff_inclusivity','The bar is bear-community-led and explicitly welcomes bears and admirers; no separate public staff training or incident protocol was located.',
    'source_urls','["https://baconbearbar.com/inicio","https://www.patroc.com/gay/barcelona/gayguide.html"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1291
  and lower(trim(p.name))='bacon bear bar'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable typical reception wait is published. Private-event capacity can affect entry, but no defensible minute range is available.','best_nights','Use the current operator calendar: mixed and identity-specific private events can differ sharply, so no single weekday represents the venue.','crowd_mix','The operator describes an all-LGBTQIA+ audience; private events may target a narrower identity group and should be checked individually.',
    'dress_code','Towel, swimwear or nudity depends on the booked session; each private organiser may impose a separate theme-specific rule.','staff_inclusivity','The operator states an all-LGBTQIA+ policy, but a May 2026 private-event exclusion prompted a police investigation; management condemned the incident and separated itself from the organiser.',
    'source_urls','["https://www.saunaspases.com/saunathermas/wp-content/uploads/2026/01/Revista-Enero-2026.pdf","https://elpais.com/espana/catalunya/2026-06-01/los-mossos-investigan-la-denuncia-de-dos-mujeres-judias-a-las-que-denegaron-el-acceso-a-una-sauna-por-lucir-una-estrella-de-david.html"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1292
  and lower(trim(p.name))='sauna thermas'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No verified typical wait in minutes is published. The small bar is most likely to develop entrance pressure during Saturday shows.','best_nights','Saturday Saturgay is the strongest recurring choice for house music and go-go performances; Friday supplies the other main late bar night.','crowd_mix','Predominantly gay men, including tourists and local regulars, with a lively audience around the dancers and shows.',
    'dress_code','Casual going-out clothes and body-confident club looks fit; no mandatory fetish garment or formal code is published.','staff_inclusivity','Its performers and intended audience are gay men. Sources do not identify an inclusion-trained team, equality contact or complaints channel.',
    'source_urls','["https://es.travelgay.com/venue/boysbar-bcn","https://www.pridebarcelona.org/pdf/PRIDE_BCN_Programa_Digital.pdf"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1294
  and lower(trim(p.name))='boysbar bcn'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No typical wait in minutes is published. Free, capacity-limited performances may create a short exterior hold once the compact room is full.','best_nights','Pick a listed drag, burlesque, bingo, reading or live-music date; without a named programme, Friday and Saturday are the busiest general nights.','crowd_mix','Queer women, trans and non-binary people, drag audiences, artists and mixed LGBTQ+ friends form a deliberately broad crowd.',
    'dress_code','Creative, camp and everyday clothing are equally at home; individual performance themes may invite a look but impose no general code.','staff_inclusivity','Queer and feminist programming is operationally central, yet no detailed public staff training or named safeguarding procedure was found.',
    'source_urls','["https://www.timeout.com/barcelona/lgbtq/candy-darling","https://www.timeout.cat/barcelona/ca/que-fer/festa-monstruosa"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1295
  and lower(trim(p.name))='candy darling'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No measured queue time is available. The small room reaches its densest point after 01:00 on Friday and Saturday.','best_nights','Friday and Saturday after 01:00 provide the fullest singalong and dancing atmosphere; earlier hours remain more conversational.','crowd_mix','Mostly gay men across several age groups, with local regulars, visitors and mixed LGBTQ+ friends around the dance floor.',
    'dress_code','Unpretentious casual barwear and playful going-out looks both fit; no formal door dress standard is published.','staff_inclusivity','Its gay-bar identity is established, but no current evidence was found for staff inclusion training, a welfare lead or complaint protocol.',
    'source_urls','["https://www.patroc.com/guiagay/barcelona/d/elcangrejo.html","https://www.patroc.com/gay/barcelona/gayguide.html"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1296
  and lower(trim(p.name))='el cangrejo'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable minute estimate is published. It functions as a social drinks bar, with capacity pressure more relevant than a formal queue.','best_nights','Friday and Saturday are the most animated; an advertised pre-dinner meet-up is better for conversation and meeting new people.','crowd_mix','Gay men, local friends and visitors to Gaixample make up the core social crowd, with no verified age-exclusive audience.',
    'dress_code','Neat everyday separates or understated evening style suit Ken; neither fetish equipment nor a prescribed theme is required.','staff_inclusivity','The current operation is LGBTQ-oriented, but no venue-specific evidence of staff training, pronoun practice or an incident protocol was found.',
    'source_urls','["https://www.patroc.com/gay/barcelona/gayguide.html","https://www.gayout.com/es/europe/spain/barcelona/events/copa-precena-en-ken-gay-bar-2026-08-29"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1661
  and lower(trim(p.name))='ken barcelona'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No published minute range is available. Seating and terrace capacity, rather than a controlled nightclub line, govern busy periods.','best_nights','Friday and Saturday nights bring the strongest bear-bar energy; daytime café service offers a calmer way to meet the same community.','crowd_mix','Bears and admirers are central at night, while daytime adds neighbourhood café guests and a more mixed LGBTQ+ crowd.',
    'dress_code','HBB explicitly invites guests to come as they are. Ordinary café clothes work by day, and bear-coded style remains optional after dark.','staff_inclusivity','HBB explicitly says everyone is welcome and positions itself as a safe, mixed gay bear space; no detailed staff-response protocol is published.',
    'source_urls','["https://hbb-barcelona.com/","https://www.patroc.com/gay/barcelona/gayguide.html"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1662
  and lower(trim(p.name))='hbb (honey bears barcelona)'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No reliable typical wait is published. Friday and Saturday concentrate arrivals, and selective capacity control can slow the door.','best_nights','Friday and Saturday deliver the main late club format; Thursday runs only when the current programme advertises its younger session.','crowd_mix','A polished, predominantly straight and mixed adult nightlife crowd; it is LGBTQ-friendly but not a dedicated queer club.',
    'dress_code','Elegant or smart-casual nightlife clothing is expected; sportswear and visibly casual athletic looks risk refusal at the door.','staff_inclusivity','No venue-specific LGBTQ+ staff training or support protocol was found, so inclusion should not be inferred from its mixed clientele alone.',
    'source_urls','["https://borisbcn.com/","https://linktr.ee/boris.club"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1663
  and lower(trim(p.name))='boris club barcelona'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No consistent minute estimate is published. Saturday ticket demand varies by lineup, with sold-out dates creating the main entrance delay.','best_nights','Saturday is the fixed Human session; choose lineups centred on techno, electro, industrial or house according to the published bill.','crowd_mix','Electronic-music regulars, queer clubbers and a mixed alternative audience share the room; Human is not exclusively LGBTQ+.',
    'dress_code','Dark clubwear, expressive looks and practical dance clothing fit; phones and light-emitting devices are discouraged on the dance floor.','staff_inclusivity','Any staff member can activate Razzmatazz’s confidential response protocol, involving an Equality Officer and a private support space.',
    'source_urls','["https://www.salarazzmatazz.com/clubs/human/","https://www.salarazzmatazz.com/en/respect/"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1664
  and lower(trim(p.name))='human club (sala razzmatazz)'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','No verified typical wait is published. Daily drag shows can fill the small bar, but there is no evidence for a stable minute range.','best_nights','Any night includes drag; Friday and Saturday provide the fullest audience, while weekdays offer the same format with less density.','crowd_mix','A mixed LGBTQ+ bar crowd gathers around the drag performers, with gay men, tourists and local queer regulars all visible.',
    'dress_code','Casual barwear, drag-inspired glamour and expressive queer looks all fit; no mandatory theme or formal code is published.','staff_inclusivity','Daily employment of drag artists confirms queer cultural participation, but no separate public staff training or incident process was located.',
    'source_urls','["https://www.patroc.com/guiagay/barcelona/d/strass-bar.html","https://www.patroc.com/gay/barcelona/gayguide.html"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=1667
  and lower(trim(p.name))='strass barcelona'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','Published sources do not quantify reception delays. Arrival processing varies with occupancy, so a defensible usual duration cannot be stated.','best_nights','Friday through Sunday in summer are the most social rooftop periods; there is no verified queer party every night.','crowd_mix','Adult queer city-break travellers use this calmer Axel property, with gay men prominent and allies sharing the hotel spaces.',
    'dress_code','No hotel-wide fashion code applies; everyday citywear is normal, with swimwear reserved for the rooftop pool area.','staff_inclusivity','Axel’s LGBTQIA+-centred brand and published Good Vibes rules require respect, diversity and safety, with removal possible for discriminatory conduct.',
    'source_urls','["https://www.axelhotels.com/en/axel-two-barcelona/hotel","https://www.axelhotels.com/en/home"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=2387
  and lower(trim(p.name))='two hotel barcelona by axel'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','Vividora publishes no usual reception duration. Any delay is arrival-specific, and the property has no public club-admission line.','best_nights','Daily Social Hour is the clearest recurring social moment; Friday and Saturday sunset service animate the rooftop, without making it a queer-specific night.','crowd_mix','International luxury guests mix with locals at Social Hour and the rooftop; the property is mainstream rather than LGBTQ-exclusive.',
    'dress_code','The hotel is casual; the official rooftop guidance also permits casual dress and pool or beach attire.','staff_inclusivity','Kimpton and IHG publish LGBTQ+ inclusion commitments, but no property-specific staff training or incident-response evidence was found for Vividora.',
    'source_urls','["https://www.kimptonhotels.com/hotels/us/en/vividora-hotel-barcelona-spain/bcnki/hoteldetail","https://www.ihg.com/kimptonhotels/hotels/gb/en/vividora-hotel-barcelona-spain/bcnki/hoteldetail/dining/terrazadevivi"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=2423
  and lower(trim(p.name))='kimpton vividora barcelona'
  and lower(trim(p.city))='barcelona';

update public.places p set
  venue_intel=coalesce(p.venue_intel,'{}'::jsonb)||jsonb_build_object(
    'queue_wait','Axel gives no evidence-based reception timing. Arrival flow changes with occupancy, and this property does not have a conventional nightlife line.','best_nights','Summer rooftop sessions and listed Sky Bar events provide the strongest social atmosphere; no single weekday is always the best.','crowd_mix','The original Axel draws a social, adult gay-male majority plus other LGBTQIA+ guests and respectful non-queer companions.',
    'dress_code','City clothes suit the lobby and bars; pool attire is limited to leisure areas, and the property imposes no overall style standard.','staff_inclusivity','Axel’s core mission serves LGBTQIA+ guests, and its Good Vibes rules explicitly protect diversity, expression and safety against disrespectful conduct.',
    'source_urls','["https://www.axelhotels.com/en/axel-hotel-barcelona/hotel","https://www.axelhotels.com/en/home"]'::jsonb,'research_status','venue_specific_sources_reviewed_2026_08_30',
    'operating_status','active',
    'topic_evidence',jsonb_build_object(
      'queue_wait','queue_only','best_nights','timing_only','crowd_mix','audience_only',
      'dress_code','clothing_only','staff_inclusivity','inclusion_practice_only'),
    'updated_at','2026-08-30T00:00:00Z'),
  seo_quality_status='approved',
  updated_at=timezone('utc',now())
where p.id=2441
  and lower(trim(p.name))='axel hotel barcelona'
  and lower(trim(p.city))='barcelona';

-- Operational corrections stay outside venue_intel.
update public.places set location='Ronda de Sant Pere 19-21, 08010 Barcelona, Spain',hours='Daily from 00:30; closing varies by night and regulation.',link='https://arenadisco.com/' where id=107 and lower(trim(name))='arena madre';
update public.places set location='Carrer de Muntaner 65, 08011 Barcelona, Spain' where id=108 and lower(trim(name))='punto bcn';
update public.places set location='Carrer de Muntaner 67, 08011 Barcelona, Spain' where id=179 and lower(trim(name))='la chapelle';
update public.places set location='Carrer de Balmes 56, 08007 Barcelona, Spain' where id=180 and lower(trim(name))='believe club';
update public.places set location='Carrer d''Espolsa-sacs 1, 08002 Barcelona, Spain' where id=183 and lower(trim(name))='sauna condal';
update public.places set location='Carrer del Consell de Cent 275, 08011 Barcelona, Spain' where id=1661 and lower(trim(name))='ken barcelona';
update public.places set location='Carrer del Consell de Cent 247, 08011 Barcelona, Spain',link='https://hbb-barcelona.com/' where id=1662 and lower(trim(name))='hbb (honey bears barcelona)';
update public.places set seo_indexable=false,seo_quality_status='pending' where id=181 and lower(trim(name))='black hole';

do $$
begin
  if (select count(*) from public.places p where p.id in (107,108,179,180,181,183,185,1291,1292,1294,1295,1296,1661,1662,1663,1664,1667,2387,2423,2441) and lower(trim(p.city))='barcelona' and p.venue_intel->>'research_status'='venue_specific_sources_reviewed_2026_08_30')<>20 then
    raise exception 'Barcelona post-update count is not 20';
  end if;
end $$;
