-- Queer Atlas: verified Nordic queer and queer-friendly electronic events, Batch 1.
-- Countries: Denmark, Finland, Norway and Sweden. Researched 2026-08-28.
--
-- Classification rule:
--   * queer-led / queer-centred events are described as such;
--   * broader electronic events are included only where the organiser or venue
--     publishes meaningful inclusion, safer-space, consent or anti-harassment context;
--   * no unpublished annual dates, rumours or past events are imported.
--
-- VIBE-TAG SAFETY: both UPDATE and INSERT write ARRAY[]::text[] directly. This
-- intentionally bypasses taxonomy guessing and cannot introduce `service` or any
-- other value rejected by qa_events_vibe_tags_allowed.

begin;

alter table if exists public.events
  add column if not exists event_intel jsonb not null default '{}'::jsonb;

alter table if exists public.events
  add column if not exists ticket_url text;

with src as (
  select * from jsonb_to_recordset($qa_nordics_batch1_events$
[
  {
    "name":"Copenhagen Winter Pride 2027","aliases":["Winter Pride 2027","Copenhagen Winter Pride"],
    "city":"copenhagen","date":"2027-02-22","start_date":"2027-02-22","end_date":"2027-02-28",
    "description":"Copenhagen Pride's official winter programme returns 22–28 February 2027 with queer culture, debate, community activity and nightlife across the city. This corrects the older 15–21 February database dates.",
    "link":"https://www.copenhagenpride.dk/en/events/list/","ticket_url":"https://www.copenhagenpride.dk/en/events/list/","location":"Multiple venues, Copenhagen, Denmark","lat":55.6761,"lng":12.5683,
    "vibe":"citywide winter Pride week mixing community, culture, politics and nightlife",
    "intel":{"entry_wait":"Each programme item will have its own capacity and ticket terms; reserve limited sessions after the final programme is published.","best_arrival":"Build a venue-by-venue plan from the organiser calendar and arrive before each published start rather than treating the week as one gate.","crowd_mix":"Copenhagen's LGBTQIA+ communities, activists, artists, visitors, families and allies meet across daytime and evening formats.","dress_code":"There is no festival-wide dress code; use practical winter layers and follow any event-specific club, workshop or venue rules.","host_inclusivity":"Copenhagen Pride is the official queer organiser and combines celebration with rights, community and cultural programming.","source_urls":["https://www.copenhagenpride.dk/en/events/list/","https://www.copenhagenpride.dk/en/copenhagen-pride-anniversary-shows-solid-support-for-queer-rights/"],"research_status":"official_2027_dates_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Copenhagen Pride Week 2027","aliases":["Copenhagen Pride 2027","Copenhagen Pride Week"],
    "city":"copenhagen","date":"2027-08-14","start_date":"2027-08-14","end_date":"2027-08-22",
    "description":"Copenhagen Pride has officially announced Pride Week for 14–22 August 2027, with the parade on 21 August and Pride Square at Rådhuspladsen anchoring the citywide programme.",
    "link":"https://www.copenhagenpride.dk/en/events/list/","ticket_url":"https://www.copenhagenpride.dk/en/events/list/","location":"Pride Square, Rådhuspladsen and multiple venues, Copenhagen, Denmark","lat":55.6763,"lng":12.5681,
    "vibe":"major Nordic Pride week of visibility, protest, culture and late-night celebration",
    "intel":{"entry_wait":"Pride Square and parade viewing are public, while official parties and indoor sessions may require separate advance tickets and security checks.","best_arrival":"For the 21 August parade choose a route position early; for other events use the final organiser schedule and exact venue doors.","crowd_mix":"Local and visiting LGBTQIA+ people, community organisations, performers, families, activists and allies create a very broad audience.","dress_code":"Expressive Pride looks are welcome, but weather-ready layers, water and comfortable footwear matter most for outdoor programming.","host_inclusivity":"The week is produced by Copenhagen Pride with explicit LGBTQIA+ community, human-rights and safer-event priorities.","source_urls":["https://www.copenhagenpride.dk/en/events/list/","https://www.copenhagenpride.dk/en/copenhagen-pride-anniversary-shows-solid-support-for-queer-rights/"],"research_status":"official_2027_dates_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"MIX COPENHAGEN LGBTQIA+ Film Festival","aliases":["MIX COPENHAGEN LGBTQIA+ Film Festival ","MIX Copenhagen 2026","MIX CPH 2026"],
    "city":"copenhagen","date":"2026-10-30","start_date":"2026-10-30","end_date":"2026-11-08",
    "description":"MIX Copenhagen's 2026 LGBTQIA+ film festival runs 30 October–8 November, continuing one of the world's longest-running queer film festivals with screenings and community programming.",
    "link":"https://mixcopenhagen.dk/","ticket_url":"https://mixcopenhagen.dk/","location":"Festival cinemas and cultural venues, Copenhagen, Denmark","lat":55.6761,"lng":12.5683,
    "vibe":"established queer cinema festival with international stories and community conversation",
    "intel":{"entry_wait":"Screenings and special events use their own tickets and capacities; reserve opening, closing and limited-seat programmes once sales open.","best_arrival":"Reach each named cinema before the published seating time and allow extra travel between venues on multi-screening days.","crowd_mix":"Queer film audiences, filmmakers, activists, students, international visitors and Copenhagen culture-goers share the programme.","dress_code":"Everyday cinema clothing is appropriate; opening and closing events may invite a polished look without a mandatory code.","host_inclusivity":"MIX is explicitly dedicated to lesbian, gay, bi, trans, queer, intersex and asexual cinema and community visibility.","source_urls":["https://mixcopenhagen.dk/","https://www.europeanfilmacademy.org/activities/pride-month-film-festivals-europe/"],"research_status":"organiser_and_film_academy_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"ØMEN Dark Room","aliases":["OMEN Dark Room","ØMEN Darkroom Edition"],
    "city":"copenhagen","date":"2026-09-04","start_date":"2026-09-04","end_date":"2026-09-05",
    "description":"ØMEN's community-led club night for gay men takes over Basement from 22:00–03:00 with heavy pop beats, high energy and a dedicated darkroom edition.",
    "link":"https://basement.kk.dk/program/oemen-dark-room","ticket_url":"https://basement.kk.dk/program/oemen-dark-room","location":"Basement, Enghavevej 42, 1674 Copenhagen V, Denmark","lat":55.6676,"lng":12.5444,
    "vibe":"gay men's club night with darkroom intensity and community-first energy",
    "intel":{"entry_wait":"Advance tickets range by release and a higher-priced door allocation is listed; bring valid ID and allow time for the 22:00 entry wave.","best_arrival":"Arrive close to doors for the smoothest entry and time to understand the room layout before the dance floor and darkroom peak.","crowd_mix":"Gay men are the specifically centred audience, with the organiser describing the night as a community-built queer club space.","dress_code":"No mandatory outfit is published on the venue page; intentional night-out or expressive queer clubwear fits the format.","host_inclusivity":"ØMEN is created by gay men to preserve targeted queer nightlife and describes safety, community and inclusion as core aims.","source_urls":["https://basement.kk.dk/program/oemen-dark-room"],"research_status":"municipal_venue_listing_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Order Of Magnitude: Quake","aliases":["Order of Magnitude Quake","Quake at Den Anden Side"],
    "city":"copenhagen","date":"2026-09-26","start_date":"2026-09-26","end_date":"2026-09-27",
    "description":"Quake brings techno and psytrance to Den Anden Side from 23:59–08:00, inside a queer-led alternative electronic-music venue with a detailed consent and awareness policy.",
    "link":"https://ra.co/events/2521204","ticket_url":"https://ra.co/events/2521204","location":"Den Anden Side, Axeltorv 5, 1609 Copenhagen, Denmark","lat":55.6752,"lng":12.5622,
    "vibe":"deep overnight techno and psytrance in a queer-centred underground club",
    "intel":{"entry_wait":"Presale is 160 DKK, door is 170 DKK, two-for-one applies before 00:30 and admission still follows the club's normal selection.","best_arrival":"Arrive before 00:30 for the published early offer and time for the door conversation; late entry after 05:30 has a reduced price.","crowd_mix":"Queer and marginalised club communities are prioritised alongside respectful electronic-music dancers who understand the venue's values.","dress_code":"No event-specific costume is required, but the club discourages business, sports-uniform and careless everyday presentation at selection.","host_inclusivity":"Den Anden Side publishes consent, no-photo, awareness-team and darkroom rules and explicitly prioritises queer and marginalised guests.","source_urls":["https://ra.co/events/2521204","https://www.denandenside.com/about","https://www.denandenside.com/club-policy"],"research_status":"ticketing_and_venue_policy_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"ESCAPISM presents: MALUGI 3h set & More","aliases":["ESCAPISM MALUGI","Malugi 3h set at Den Anden Side"],
    "city":"copenhagen","date":"2026-10-02","start_date":"2026-10-02","end_date":"2026-10-03",
    "description":"ESCAPISM presents a three-hour MALUGI set and supporting programme at Den Anden Side from 23:30–08:30, moving through house and techno in the queer-led club.",
    "link":"https://ra.co/events/2502627","ticket_url":"https://ra.co/events/2502627","location":"Den Anden Side, Axeltorv 5, 1609 Copenhagen, Denmark","lat":55.6752,"lng":12.5622,
    "vibe":"long-form house and techno session with euphoric queer-friendly club energy",
    "intel":{"entry_wait":"A Resident Advisor ticket does not replace the venue's selection process; carry valid ID and leave time for the door conversation.","best_arrival":"Arrive during the opening hour for a calmer entrance and the full musical arc rather than relying on admission at peak time.","crowd_mix":"Electronic-music regulars mix with the queer and marginalised communities whom Den Anden Side explicitly asks guests to respect and prioritise.","dress_code":"There is no published event costume; wear an intentional club look and avoid the business or sports-uniform styles discouraged by venue policy.","host_inclusivity":"The venue uses an awareness team, unisex toilets, no-photo rules and consent standards, with queer and marginalised safety central to its mission.","source_urls":["https://ra.co/events/2502627","https://www.denandenside.com/about","https://www.denandenside.com/club-policy"],"research_status":"ticketing_and_venue_policy_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Sapphic Prom","aliases":["Amentes Sapphic Prom 2026"],
    "city":"copenhagen","date":"2026-10-09","start_date":"2026-10-09","end_date":"2026-10-10",
    "description":"Amentes hosts a 21:00–02:00 prom at Basement for Copenhagen's WLW and FLINTA communities, with DJs, dancing and a Sapphic Prom Royalty crowning; all are welcome.",
    "link":"https://basement.kk.dk/program/sapphic-prom","ticket_url":"https://basement.kk.dk/program/sapphic-prom","location":"Basement, Enghavevej 42, 1674 Copenhagen V, Denmark","lat":55.6676,"lng":12.5444,
    "vibe":"dress-up sapphic prom built around FLINTA connection, dancing and representation",
    "intel":{"entry_wait":"The municipal venue lists 120 DKK tickets; advance purchase is sensible for a community event with finite Basement capacity.","best_arrival":"Arrive near 21:00 to settle in, meet others and enjoy the full prom arc before the late dancing and royalty crowning.","crowd_mix":"WLW and FLINTA people are centred, especially guests seeking community and BIPOC visibility, while respectful allies are welcome.","dress_code":"Guests are encouraged to wear their finest interpretation of prom, including dresses, suits, ties or an entirely personal alternative.","host_inclusivity":"Amentes is a queer event organisation focused on FLINTA connection and explicitly seeks better space and visibility for BIPOC guests.","source_urls":["https://basement.kk.dk/program/sapphic-prom"],"research_status":"municipal_venue_listing_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"ManiFest Fetish Fashion Party 2026","aliases":["ManiFest - FETISH FASHION PARTY 2026","Manifest Fetish Fashion Party"],
    "city":"copenhagen","date":"2026-09-26","start_date":"2026-09-26","end_date":"2026-09-27",
    "description":"Copenhagen's long-running ManiFest fetish club stages its Fetish Fashion Party on 26 September with dance floors, social areas and consensual play spaces under a strict code of conduct.",
    "link":"https://manifest.dk/","ticket_url":"https://manifest.dk/","location":"Venue disclosed by ManiFest, Copenhagen, Denmark","lat":55.6761,"lng":12.5683,
    "vibe":"large Scandinavian fetish night combining fashion, dance and consensual exploration",
    "intel":{"entry_wait":"Tickets and exact venue instructions come through the organiser; expect ID, ticket and strict outfit checks before admission.","best_arrival":"Follow the ticket communication and arrive within the stated entry window, allowing time for wardrobe and code-of-conduct orientation.","crowd_mix":"Adult fetish and kink communities, including many LGBTQ+ guests, attend; this is a specialised sex-positive event rather than a general club.","dress_code":"A strict full fetish or intentionally themed fashion look is required; ordinary streetwear is not suitable for this organiser's door.","host_inclusivity":"ManiFest publishes a code of conduct and frames the club around liberated, consensual exploration, but guests must assess the specialised format themselves.","source_urls":["https://manifest.dk/"],"research_status":"official_event_calendar_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Krop og Kærlighed 2026","aliases":["Krop og Kærlighed Festival 2026"],
    "city":"aarhus","date":"2026-09-05","start_date":"2026-09-05","end_date":"2026-09-05",
    "description":"Aarhus Municipality and Festuge gather generations for a free festival celebrating bodies, gender, sexuality, identity, movement, love and sexual wellbeing on 5 September.",
    "link":"https://krop.aarhus.dk/om-festivalen","ticket_url":"https://krop.aarhus.dk/om-festivalen","location":"Festugeparken, Frederiks Allé, 8000 Aarhus, Denmark","lat":56.1510,"lng":10.2028,
    "vibe":"welcoming civic festival of body diversity, queer identity, wellbeing and love",
    "intel":{"entry_wait":"The festival programme is free, so the practical wait is crowd flow around popular talks and activities rather than a ticket queue.","best_arrival":"Arrive before the activities you value and use the official programme, as different talks and workshops run to their own schedules.","crowd_mix":"Queer communities, young people, families, educators, health organisations and curious residents meet across generations.","dress_code":"Comfortable weather-ready festival clothing works; there is no appearance requirement for the public civic programme.","host_inclusivity":"Aarhus Municipality, Festuge and youth sexuality partners explicitly frame the event around diversity, identity and inclusive sexual wellbeing.","source_urls":["https://krop.aarhus.dk/om-festivalen","https://www.aarhusfestuge.dk/2026/arrangementer/ungeseksualraadet-sex-og-tabuer"],"research_status":"municipal_and_festival_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Nattens Dronning 2026","aliases":["Nattens Dronning Dragshow 2026"],
    "city":"odense","date":"2026-10-10","start_date":"2026-10-10","end_date":"2026-10-11",
    "description":"Denmark's long-running drag competition returns to Magasinet in Odense from 19:00–05:00 with queens and kings competing through costume, performance and stage spectacle.",
    "link":"https://www.nattensdronning.dk/events/nattens-dronning-2026","ticket_url":"https://www.nattensdronning.dk/events/nattens-dronning-2026","location":"Magasinet, Farvergården 19, 5000 Odense, Denmark","lat":55.3976,"lng":10.3862,
    "vibe":"large all-night drag competition full of glamour, performance and queer celebration",
    "intel":{"entry_wait":"Use the organiser's ticket route and allow time for ID, coat check and seating or standing allocation before the 19:00 start.","best_arrival":"Arrive before showtime for a calm entrance and the complete competition; the event continues into the club-style night until 05:00.","crowd_mix":"Drag fans, LGBTQ+ communities, performers' supporters, local nightlife guests and visitors form a broad celebratory audience.","dress_code":"Glamour and expressive looks suit the occasion, but the official page does not impose a mandatory audience costume.","host_inclusivity":"The established drag competition centres queer performance by queens and kings and has operated from Odense since 1994.","source_urls":["https://www.nattensdronning.dk/events/nattens-dronning-2026"],"research_status":"official_organiser_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"IBNE x QUEERHEL","aliases":["IBNE x QueerHEL Stockholm"],
    "city":"stockholm","date":"2026-09-19","start_date":"2026-09-19","end_date":"2026-09-20",
    "description":"IBNE and Helsinki collective QueerHEL unite at Slakthuset from 21:00–03:00 for two techno floors, an ambient chillout and a members-only queer party with no cameras.",
    "link":"https://ra.co/events/2512232","ticket_url":"https://ra.co/events/2512232","location":"Slakthuset, Slakthusgatan 6, 121 62 Johanneshov, Sweden","lat":59.2914,"lng":18.0810,
    "vibe":"members-only queer techno night with two floors, playfulness and a no-camera focus",
    "intel":{"entry_wait":"Both free membership registration and a paid ticket are required; complete both before travel and bring valid ID for the 20+ door.","best_arrival":"Arrive close to 21:00 to clear membership checks and orient yourself before the two techno rooms reach peak density.","crowd_mix":"Queer and trans Stockholmers, Finnish QueerHEL guests, kink-positive dancers and respectful allies are intentionally gathered.","dress_code":"Looks are not policed, but queer, fetish, kinky or bare expression is encouraged; guests may dress up or down.","host_inclusivity":"The organisers publish no-phone rules, ChemSafe and play-area awareness, anti-discrimination expectations and freedom of expression.","source_urls":["https://ra.co/events/2512232"],"research_status":"organiser_ticketing_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"EXIT! – Hard Techno + Darkroom","aliases":["Exit - Hard Techno + Darkroom","EXIT Hard Techno September 26"],
    "city":"stockholm","date":"2026-09-26","start_date":"2026-09-26","end_date":"2026-09-27",
    "description":"Black Planet brings six hours of hard, dark techno to queer cultural hub House of Q from 23:00–05:00, with a consent-managed darkroom, quiet lounge and taped phone cameras.",
    "link":"https://blackplanet.se/event/exit-hard-dark-techno-september-26/","ticket_url":"https://blackplanet.se/event/exit-hard-dark-techno-september-26/","location":"House of Q, Malmvägen 1, 115 41 Stockholm, Sweden","lat":59.3427,"lng":18.1152,
    "vibe":"brutal hard techno with queer authorship, consent-led darkroom and decompression space",
    "intel":{"entry_wait":"Free Black Planet membership must be completed before arrival and is unavailable at the door; buy a ticket and bring ID for checks.","best_arrival":"Arrive near 23:00 because the prior edition drew 900 guests; Gärdet metro is about a ten-minute walk from the venue.","crowd_mix":"The night is made by queer organisers for every identity, drawing hard-techno dancers, kink-positive guests and queer community regulars.","dress_code":"There is no mandatory code, although alternative, fetish, rave, kinky or otherwise intentional looks are encouraged.","host_inclusivity":"An orange or green-vest awareness team, taped cameras, consent rules, wheelchair assistance and lower-stimulation areas are explicitly published.","source_urls":["https://blackplanet.se/event/exit-hard-dark-techno-september-26/","https://houseofq.se/"],"research_status":"organiser_and_venue_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Cinema Queer International Film Festival 2026","aliases":["Cinema Queer 2026","Cinema Queer Int Film Festival 2026"],
    "city":"stockholm","date":"2026-09-28","start_date":"2026-09-28","end_date":"2026-10-04",
    "description":"Cinema Queer's 2026 international festival runs 28 September–4 October with queer film, performance, art and social programming across inventive Stockholm settings.",
    "link":"https://cinemaqueer.se/","ticket_url":"https://cinemaqueer.se/","location":"Festival venues, Stockholm, Sweden","lat":59.3293,"lng":18.0686,
    "vibe":"adventurous queer film and art festival with conversation, performance and parties",
    "intel":{"entry_wait":"Individual screenings and special events will have separate ticket and capacity rules; reserve headline sessions after the programme release.","best_arrival":"Use the final venue schedule and arrive before each seating time because the festival deliberately moves between unusual locations.","crowd_mix":"Queer cinema audiences, filmmakers, artists, performers, students and culture visitors share a community-led festival week.","dress_code":"Everyday creative clothing fits most screenings; parties and performances may inspire stronger looks without a festival-wide requirement.","host_inclusivity":"Cinema Queer has curated LGBTQ+ film and culture in Stockholm since 2012 and makes queer authorship central to every edition.","source_urls":["https://cinemaqueer.se/","https://www.europeanfilmacademy.org/activities/pride-month-film-festivals-europe/"],"research_status":"official_and_film_academy_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Baltic Battle #48","aliases":["Baltic Battle Stockholm","Baltic Battle Stockholm 2026"],
    "city":"stockholm","date":"2026-10-07","start_date":"2026-10-07","end_date":"2026-10-11",
    "description":"SLM Stockholm's five-day Baltic Battle runs 7–11 October across SLM and A75, combining pub and market nights with Friday warmup, Saturday main party and Sunday cooldown for men who have sex with men.",
    "link":"https://balticbattle.se/","ticket_url":"https://balticbattle.se/tickets/","location":"SLM Stockholm and A75, Stockholm, Sweden","lat":59.3065,"lng":18.0729,
    "vibe":"large Nordic leather and fetish gathering with parties, community and queer history",
    "intel":{"entry_wait":"The event is exclusively for men 18+; some nights require SLM or affiliated membership, tickets are online-only at A75 and capacity can be strict.","best_arrival":"Check the daily programme: A75 is near Globen for Friday and Saturday, while SLM near Mariatorget hosts Wednesday, Thursday and Sunday.","crowd_mix":"Men who have sex with men are the explicitly exclusive audience, including leather, rubber, uniform, bear and wider fetish communities.","dress_code":"Rules vary by day: basic masculine wear works on lighter nights, while Saturday requires a complete accepted fetish look decided by wardrobe staff.","host_inclusivity":"This is a protected MSM space with zero tolerance for hate symbols; its gender and presentation boundaries are intentionally narrower than general Pride.","source_urls":["https://balticbattle.se/","https://balticbattle.se/program/","https://balticbattle.se/tickets/","https://balticbattle.se/dress-code/","https://balticbattle.se/location/"],"research_status":"official_full_program_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"That 90s Night – Three Floors of Techno, Trance and Eurodance","aliases":["That 90s night - 90s techno, trance, eurodance in 3 floors","That 90s Night 2026"],
    "city":"stockholm","date":"2026-10-10","start_date":"2026-10-10","end_date":"2026-10-11",
    "description":"Queer-produced Black Planet takes over Slakthuset from 22:00–03:00 with 90s techno, acid, hardcore, eurodance and trance across three floors plus a screen-free social lounge.",
    "link":"https://ra.co/events/2521960","ticket_url":"https://ra.co/events/2521960","location":"Slakthuset, Slakthusgatan 6, 121 62 Johanneshov, Sweden","lat":59.2914,"lng":18.0810,
    "vibe":"queer-produced 90s rave revival with three floors, PLUR and strict no-phone dancing",
    "intel":{"entry_wait":"The last two editions reached about 1,000 guests and sold out, so advance ticketing and early ID checks are strongly recommended.","best_arrival":"Arrive near 22:00 for reliable entry and time to explore all three floors before the strongest late crowd.","crowd_mix":"All identities are welcome at a night produced by queer organisers for ravers who value 90s underground culture over celebrity lineups.","dress_code":"No formal code is published; 90s, rave or expressive queer looks fit, while the important behavioural rule is keeping phones off the floor.","host_inclusivity":"The organiser explicitly says the event is by queer people for every identity and enforces no phones, no ego and PLUR values.","source_urls":["https://ra.co/events/2521960","https://blackplanet.se/"],"research_status":"organiser_ticketing_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Stockholm Pride 2027","aliases":["Stockholm Pride Week 2027"],
    "city":"stockholm","date":"2027-08-02","start_date":"2027-08-02","end_date":"2027-08-08",
    "description":"Stockholm Pride has officially announced its 2027 festival for 2–8 August, returning with Pride House, public celebration, cultural programming and the parade week.",
    "link":"https://news.stockholmpride.org/","ticket_url":"https://news.stockholmpride.org/","location":"Multiple venues, Stockholm, Sweden","lat":59.3293,"lng":18.0686,
    "vibe":"major Scandinavian Pride week combining rights, culture, park celebration and parade",
    "intel":{"entry_wait":"Public and ticketed parts use different access systems; wait for the official 2027 programme before buying passes or choosing parade positions.","best_arrival":"Plan Pride House, park and parade separately and use the final organiser maps because each has distinct transport and security conditions.","crowd_mix":"LGBTQ+ communities, activists, organisations, families, performers, international visitors and allies form a large citywide gathering.","dress_code":"There is no week-wide code; expressive Pride clothing is welcome, with comfortable shoes and weather layers best for outdoor days.","host_inclusivity":"Stockholm Pride is the official LGBTQ+ organiser and frames the festival around visibility, rights, community and safer participation.","source_urls":["https://news.stockholmpride.org/"],"research_status":"official_2027_dates_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"MALMÖTXT 59: Queer Muslim","aliases":["MALMOTXT 59 Queer Muslim"],
    "city":"malmo","date":"2026-09-24","start_date":"2026-09-24","end_date":"2026-09-24",
    "description":"Grand Malmö hosts a 19:00–23:00 literary evening on 24 September exploring queer Muslim life, stereotypes, poetry and the possibilities of writing identities beyond assigned roles.",
    "link":"https://www.grandmalmo.se/calendar/malmotxt59","ticket_url":"https://www.grandmalmo.se/calendar/malmotxt59","location":"Grand Malmö, Monbijougatan 17, 211 53 Malmö, Sweden","lat":55.5969,"lng":13.0024,
    "vibe":"thoughtful queer literary night centring Muslim identity, poetry and conversation",
    "intel":{"entry_wait":"Check the Grand Malmö listing for reservation or ticket release details; arrive before 19:00 for seating in the discussion format.","best_arrival":"Reach the venue during the opening window so you can settle before the literary programme begins and stay for the social close.","crowd_mix":"Queer Muslims, writers, readers, students, cultural workers and thoughtful allies are the most relevant audience for the theme.","dress_code":"Casual cultural-event clothing is appropriate and no appearance requirement is published by the venue or series.","host_inclusivity":"The programme directly centres queer Muslim experience and seeks nuanced conversation beyond stereotypes in a public Malmö cultural venue.","source_urls":["https://www.grandmalmo.se/calendar/malmotxt59"],"research_status":"official_venue_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"QueerHEL x After Fortuna","aliases":["QUEERHEL x AFTER FORTUNA","QueerHEL 3rd Birthday"],
    "city":"helsinki","date":"2026-09-12","start_date":"2026-09-12","end_date":"2026-09-13",
    "description":"QueerHEL celebrates its third birthday with Milan's After Fortuna at Ääniwalli from 22:00–04:30, creating a techno-forward safer space for queer people, friends and allies.",
    "link":"https://www.eventu.al/en/event/9728/finland/helsinki/queerhel-x-after-fortuna","ticket_url":"https://www.eventu.al/en/event/9728/finland/helsinki/queerhel-x-after-fortuna","location":"Ääniwalli, Pälkäneentie 13, 00510 Helsinki, Finland","lat":60.1908,"lng":24.9632,
    "vibe":"international queer techno birthday with expressive safer-space club energy",
    "intel":{"entry_wait":"Tickets move through several price releases and Ääniwalli adds a 3.90 euro security fee; bring ID for the 20+ door.","best_arrival":"Arrive near 22:00 to clear cloakroom and security before the room peaks and to experience the full resident-and-guest programme.","crowd_mix":"Queer people are centred alongside friends and allies, with Helsinki regulars meeting visiting Milan DJs and community guests.","dress_code":"The published category is sexy red, with guests challenged to include some red in an otherwise personal and expressive outfit.","host_inclusivity":"QueerHEL explicitly defines the club as a safer space for queer people and allies to party, socialise and express their uniqueness.","source_urls":["https://www.eventu.al/en/event/9728/finland/helsinki/queerhel-x-after-fortuna","https://ra.co/events/fi/helsinki?startDate=2026-09-09"],"research_status":"ticketing_and_ra_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Queer Circus Club Night","aliases":["Helsinki Circus Festival Queer Club Night"],
    "city":"helsinki","date":"2026-09-12","start_date":"2026-09-12","end_date":"2026-09-13",
    "description":"Helsinki Circus Festival closes with a queer club night at Kuudes Linja from 23:00–04:30, blending contemporary circus with DJs, VJs and queer club culture.",
    "link":"https://ra.co/events/2513511","ticket_url":"https://ra.co/events/2513511","location":"Kuudes Linja, Hämeentie 13, 00530 Helsinki, Finland","lat":60.1838,"lng":24.9538,
    "vibe":"late queer circus and club collision with performance, DJs and visual art",
    "intel":{"entry_wait":"The listing shows tiered 12–25 euro tickets and an 18+ age limit; advance purchase avoids relying on remaining door capacity.","best_arrival":"Arrive shortly before 23:00 to see the complete closing-night performance flow before the room turns fully club-focused.","crowd_mix":"Queer club audiences, circus artists, festival visitors, dancers and visual-performance fans meet in a deliberately hybrid night.","dress_code":"No mandatory code is published; creative, movement-friendly queer clubwear is a natural fit for the circus-and-DJ format.","host_inclusivity":"The night is explicitly framed around queer club culture and is co-produced by Recover Laboratory and Bergen's After School Special.","source_urls":["https://ra.co/events/2513511"],"research_status":"organiser_ticketing_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Jungle Unit – 1 Year Anniversary","aliases":["Jungle Unit 1year anniversary","Jungle Unit Techno Ritual"],
    "city":"helsinki","date":"2026-09-12","start_date":"2026-09-12","end_date":"2026-09-13",
    "description":"Jungle Unit marks one year at DelGallet Vallila from 21:00–06:00 with tribal, hypnotic and groove-driven techno, immersive visuals, a stated safe space and no phones on the dance floor.",
    "link":"https://ra.co/events/2498334","ticket_url":"https://ra.co/events/2498334","location":"DelGallet Vallila, Nokiantie 2, Helsinki, Finland","lat":60.1968,"lng":24.9497,
    "vibe":"intimate all-night techno ritual with organic rhythms, visuals and no-phone focus",
    "intel":{"entry_wait":"The 20+ event uses advance tickets linked by the organiser; it is BYOB with a self-service cloakroom, so carry only what you can manage.","best_arrival":"Arrive during the opening hour to understand the renovated venue, self-service storage and BYOB setup before the floor fills.","crowd_mix":"Helsinki underground techno dancers and visually creative guests attend; it is queer-friendly through published safe-space conduct, not queer-exclusive.","dress_code":"Guests are invited to dress wild and a jungle-inspired outfit can win a reward, but respectful behaviour matters more than appearance.","host_inclusivity":"The organiser publishes a safe-space instruction, asks guests to respect one another and bans phones from the dance floor.","source_urls":["https://ra.co/events/2498334"],"research_status":"organiser_ticketing_verified_queer_friendly","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Sin Sistema — Reptant, Sansibar and Miscmeg","aliases":["Sin Sistema Reptant Sansibar Miscmeg"],
    "city":"helsinki","date":"2026-09-05","start_date":"2026-09-05","end_date":"2026-09-06",
    "description":"Sin Sistema brings electro and techno to Post Bar from 22:00–05:00 with Reptant, Sansibar and Miscmeg under the venue's published anti-harassment and privacy rules.",
    "link":"https://ra.co/events/2521438","ticket_url":"https://ra.co/events/2521438","location":"Post Bar, Kaikukatu 2, Helsinki, Finland","lat":60.1872,"lng":24.9638,
    "vibe":"focused underground electro and techno in a compact respect-led club",
    "intel":{"entry_wait":"Advance RA tickets are available; Post Bar sits inside the courtyard, so allow time to locate the entrance and complete the 20+ ID check.","best_arrival":"Arrive near 22:00 for easier entry and the full warmup; the venue warns that dance-floor haze and flashing lights are used.","crowd_mix":"Electro and techno listeners, local producers and international-scene followers attend; it is queer-friendly, not advertised as queer-exclusive.","dress_code":"No formal dress code is published; compact, dance-ready clothing and respectful camera behaviour suit the intimate venue.","host_inclusivity":"Post Bar states that everyone is welcome if they respect others, removes harassment or aggression and requires consent before photographing people.","source_urls":["https://ra.co/events/2521438"],"research_status":"ticketing_and_venue_policy_verified_queer_friendly","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Oslo Pride 2027","aliases":["Oslo Pride Festival 2027"],
    "city":"oslo","date":"2027-06-16","start_date":"2027-06-16","end_date":"2027-06-26",
    "description":"Oslo Pride has officially announced 16–26 June 2027; Pride House and Mini Pride begin 20 June, Pride Park opens 23 June and the parade runs from Grønland to Kontraskjæret on 26 June.",
    "link":"https://www.oslopride.no/","ticket_url":"https://www.oslopride.no/","location":"Multiple venues and Kontraskjæret, Oslo, Norway","lat":59.9078,"lng":10.7366,
    "vibe":"Norway's largest queer festival spanning rights, family activity, culture, park and parade",
    "intel":{"entry_wait":"The festival mixes public and ticketed events; parade viewing is open, while indoor sessions and headline parties may require advance booking.","best_arrival":"Use the final daily programme; for the 26 June parade arrive well before the 12:00 start and account for central road closures.","crowd_mix":"LGBTQ+ Norwegians, visitors, activists, families, organisations, artists, youth, elders and allies meet across eleven days.","dress_code":"There is no festival-wide requirement; use weather-ready Pride clothing and comfortable footwear for park and parade days.","host_inclusivity":"Oslo Pride is the official community organiser and publishes dedicated Pride House, Mini Pride, Pride Park and parade safety structures.","source_urls":["https://www.oslopride.no/","https://www.oslopride.no/p/prideparade"],"research_status":"official_2027_full_dates_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Miss Drag Evolution Royalty 2026","aliases":["Miss Drag Evolution Royalty"],
    "city":"oslo","date":"2026-09-05","start_date":"2026-09-05","end_date":"2026-09-05",
    "description":"Kulturhuset hosts Miss Drag Evolution Royalty at 20:00 on 5 September, a drag competition and LGBTQIA+ show highlighted in VisitOSLO's official queer events guide.",
    "link":"https://www.visitoslo.com/event/miss-drag-evolution-royalty-2026","ticket_url":"https://billetto.no/e/miss-drag-evolution-royalty-2026-billetter-1967562","location":"Kulturhuset, Youngs gate 6, 0181 Oslo, Norway","lat":59.9143,"lng":10.7500,
    "vibe":"high-energy Oslo drag competition celebrating transformation, stage craft and queer talent",
    "intel":{"entry_wait":"Use the linked Billetto sale and arrive before the 20:00 show for ID, ticket scanning and a viable view inside Kulturhuset.","best_arrival":"Plan to be inside at least thirty minutes before showtime rather than joining the strongest single arrival wave at 20:00.","crowd_mix":"Drag performers, LGBTQIA+ audiences, friends, nightlife guests and visitors seeking a clearly queer Oslo stage event attend.","dress_code":"Audience glamour and expressive looks fit the show, while no compulsory costume is stated in the official tourism listing.","host_inclusivity":"VisitOSLO categorises the competition as an LGBTQIA+ event and includes it in the city's dedicated queer programme guide.","source_urls":["https://www.visitoslo.com/your-oslo/queer-oslo","https://www.billetto.no/e/miss-drag-evolution-royalty-2026-billetter-1765650"],"research_status":"official_dmo_and_ticketing_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"DragLesque – Beauty in the Dark","aliases":["DragLesque - Beauty in the Dark"],
    "city":"oslo","date":"2026-09-18","start_date":"2026-09-18","end_date":"2026-09-18",
    "description":"Oslo Nye Teaterkjelleren presents the LGBTQIA+ drag-and-burlesque show Beauty in the Dark from 21:00–22:00 on 18 September.",
    "link":"https://www.visitoslo.com/event/draglesque-beauty-in-the-dark","ticket_url":"https://www.ticketmaster.no/event/draglesque-beauty-in-the-dark-billetter/1004001844","location":"Oslo Nye Teaterkjelleren, Akersgata 38, 0102 Oslo, Norway","lat":59.9141,"lng":10.7413,
    "vibe":"intimate dark-toned drag and burlesque hour in a central theatre cellar",
    "intel":{"entry_wait":"Reserve through the linked theatre ticket channel and arrive before 21:00 because a one-hour performance leaves little room for late seating.","best_arrival":"Reach the theatre cellar around thirty minutes early for ticket control, bar service and seating before the punctual stage start.","crowd_mix":"Queer performance audiences, drag and burlesque fans, couples, friend groups and central Oslo culture visitors attend.","dress_code":"Smart casual or expressive evening wear works, with no mandatory audience costume published by the official city guide.","host_inclusivity":"VisitOSLO explicitly categorises the show as LGBTQIA+ programming inside its curated queer Oslo event guide.","source_urls":["https://www.visitoslo.com/your-oslo/queer-oslo"],"research_status":"official_dmo_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Big Daddy Karsten's Ten Year Queer Party: 2016–2026","aliases":["Big Daddy Karsten Ten Year Queer Party"],
    "city":"oslo","date":"2026-11-26","start_date":"2026-11-26","end_date":"2026-11-26",
    "description":"Queer Norwegian rapper Big Daddy Karsten marks ten years with a 19:00 anniversary concert and queer party at Parkteatret on 26 November.",
    "link":"https://www.visitoslo.com/event/big-daddy-karsten-s-ten-year-queer-party-2016-2026","ticket_url":"https://www.ticketmaster.no/event/big-daddy-karstens-ten-year-queer-party-2016--2026-billetter/1270802551","location":"Parkteatret, Olaf Ryes plass 11, 0552 Oslo, Norway","lat":59.9234,"lng":10.7582,
    "vibe":"queer hip-hop anniversary show joining live music, pride and Oslo community",
    "intel":{"entry_wait":"Use the official ticket link and arrive ahead of the 19:00 concert for ID, security and coat check at Parkteatret.","best_arrival":"Plan for the opening window rather than showtime itself so you can secure a good position and experience the complete anniversary set.","crowd_mix":"Queer hip-hop listeners, LGBTQIA+ community members, Norwegian music fans, friends and long-time supporters make up the room.","dress_code":"Concert-ready or expressive queer looks both fit; no formal code is published in the official Oslo event listing.","host_inclusivity":"The event explicitly celebrates a decade of a queer artist's work and is highlighted by VisitOSLO as LGBTQIA+ programming.","source_urls":["https://www.visitoslo.com/your-oslo/queer-oslo"],"research_status":"official_dmo_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Frædag x MUD x SSO: Kevin Saunderson, Waajeed and R-ZO","aliases":["Frædag x MUD X SSO Kevin Sanderson Waajeed R-ZO","Kevin Saunderson at Jaeger Oslo"],
    "city":"oslo","date":"2026-10-02","start_date":"2026-10-02","end_date":"2026-10-03",
    "description":"Jæger's Frædag, MUD and SSO unite from 22:00–03:00 for Detroit techno and house with Kevin Saunderson, Waajeed and a wide Oslo lineup celebrating Black and Latinx musical heritage.",
    "link":"https://ra.co/events/2519811","ticket_url":"https://ra.co/events/2519811","location":"Jæger, Grensen 9, 0159 Oslo, Norway","lat":59.9147,"lng":10.7424,
    "vibe":"Detroit-rooted techno and house celebrating Black heritage in an intimate Oslo club",
    "intel":{"entry_wait":"The 20+ club uses advance tickets and ID checks; the special collaboration is likely busier than a regular Frædag, so do not rely on late capacity.","best_arrival":"Arrive close to 22:00 for a smoother door and to hear the residents establish the musical arc before the headline sets.","crowd_mix":"Techno and house devotees, Black and Latinx music communities, Oslo club regulars and queer-friendly dance-floor guests mix here.","dress_code":"No formal code is listed; intentional, dance-ready clubwear fits an underground music night focused on the floor rather than spectacle.","host_inclusivity":"Jæger explicitly acknowledges dance music's LGBTQI+, Black and Latinx roots and says it seeks to carry the culture's original ideals.","source_urls":["https://ra.co/events/2519811","https://jaegeroslo.no/we-are-jaeger/"],"research_status":"ticketing_and_venue_values_verified_queer_friendly","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"HOT!HOT!HOT! 2026","aliases":["HOT HOT HOT Bergen 2026","Hot!Hot!Hot! Club Festival"],
    "city":"bergen","date":"2026-09-04","start_date":"2026-09-04","end_date":"2026-09-06",
    "description":"Bergen's two-night electronic club festival fills USF Verftet on 4–5 September with house, techno, electro, bass and live electronics across several rooms and stages.",
    "link":"https://www.usf.no/events/hothothot-2026/BSXU1IstTO","ticket_url":"https://www.usf.no/events/hothothot-2026/BSXU1IstTO","location":"USF Verftet, Georgernes Verft 12, 5011 Bergen, Norway","lat":60.3972,"lng":5.3084,
    "vibe":"multi-room Bergen electronic festival moving from film and live sets into deep club hours",
    "intel":{"entry_wait":"The festival is 18+ with day and weekend tickets; large bags, umbrellas, bottles and cans cannot enter or be stored, so travel light.","best_arrival":"Check the Friday and Saturday timetables separately and arrive before your first priority set; central Bergen is roughly a nine-minute walk away.","crowd_mix":"Electronic-music fans, local scene regulars, visiting DJs and queer-friendly dance-floor audiences mix; the event is not queer-exclusive.","dress_code":"There is no formal code; wear practical club clothing and note the venue's standing-only format, strobe lighting and stage smoke.","host_inclusivity":"The venue provides companion-ticket pricing, wheelchair access, disabled parking and quieter areas, while the programme welcomes a broad club audience.","source_urls":["https://www.usf.no/events/hothothot-2026/BSXU1IstTO","https://hothothot.no/om","https://bitteater.no/en/arenas/usf-verftet/"],"research_status":"official_venue_and_accessibility_verified_queer_friendly","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Ekkofestivalen 2026 – EKKO XXIII","aliases":["Ekkofestivalen 2026","Ekko Festival 2026","EKKO XXIII"],
    "city":"bergen","date":"2026-10-29","start_date":"2026-10-29","end_date":"2026-11-01",
    "description":"The 23rd Ekkofestival runs 29 October–1 November across Bergen with experimental electronic music, sound art and late club programmes, including Polygonia, Roza Terenzi and Mr Ho at Østre.",
    "link":"https://ekko.no/festival/ekko-xxiii","ticket_url":"https://ekko.ticketco.events/no/nb/e/ekkofestivalen_2026","location":"Østre and multiple Bergen cultural venues, Bergen, Norway","lat":60.3944,"lng":5.3280,
    "vibe":"adventurous citywide electronic and sound-art festival with focused late-night club sets",
    "intel":{"entry_wait":"Festival, day and concert tickets differ; most events are all-ages but some late venues become 18+ after 23:00, so check each listing.","best_arrival":"Build a route from the official timetable because venues are spread across Bergen and overlapping concerts make spontaneous transfers difficult.","crowd_mix":"Experimental-music listeners, artists, students, electronic club audiences and queer-friendly cultural communities attend; it is not queer-exclusive.","dress_code":"There is no appearance rule; weather layers and comfortable walking shoes are useful for moving between churches, galleries and clubs.","host_inclusivity":"The organiser publishes wheelchair access, companion-ticket and guardian arrangements and presents a broad experimental programme across civic venues.","source_urls":["https://ekko.no/festival/ekko-xxiii","https://ekko.ticketco.events/no/nb/e/ekkofestivalen_2026"],"research_status":"official_program_and_ticketing_verified_queer_friendly","updated_at":"2026-08-28T00:00:00Z"}
  }
]
$qa_nordics_batch1_events$) e(
    name text, aliases jsonb, city text, date date, start_date date, end_date date,
    description text, link text, ticket_url text, location text,
    lat double precision, lng double precision, vibe text, intel jsonb
  )
), matched as (
  select s.*, existing.id as existing_id
  from src s
  left join lateral (
    select candidate.id
    from public.events candidate
    where lower(trim(candidate.city)) = lower(trim(s.city))
      and (
        lower(regexp_replace(trim(candidate.name), '[^a-z0-9]+', '', 'gi')) =
          lower(regexp_replace(trim(s.name), '[^a-z0-9]+', '', 'gi'))
        or exists (
          select 1 from jsonb_array_elements_text(coalesce(s.aliases, '[]'::jsonb)) alias_name
          where lower(regexp_replace(trim(candidate.name), '[^a-z0-9]+', '', 'gi')) =
            lower(regexp_replace(trim(alias_name), '[^a-z0-9]+', '', 'gi'))
        )
        or (
          candidate.start_date = s.start_date
          and nullif(trim(candidate.link), '') is not null
          and lower(trim(candidate.link)) in (
            lower(trim(s.link)),
            lower(trim(coalesce(s.ticket_url, s.link)))
          )
        )
      )
    order by
      case when lower(trim(candidate.name)) = lower(trim(s.name)) then 0 else 1 end,
      candidate.updated_at desc nulls last
    limit 1
  ) existing on true
), updated as (
  update public.events target
  set name = m.name,
      description = m.description,
      link = m.link,
      ticket_url = m.ticket_url,
      date = m.date,
      start_date = m.start_date,
      end_date = m.end_date,
      location = m.location,
      lat = m.lat,
      lng = m.lng,
      vibe = m.vibe,
      vibe_tags = array[]::text[],
      event_intel = m.intel,
      seo_indexable = true,
      seo_quality_status = 'approved',
      updated_at = timezone('utc', now())
  from matched m
  where target.id = m.existing_id
  returning target.id
)
insert into public.events(
  name, city, description, link, ticket_url, date, start_date, end_date,
  location, lat, lng, vibe, vibe_tags, event_intel,
  seo_indexable, seo_quality_status, updated_at
)
select
  name, city, description, link, ticket_url, date, start_date, end_date,
  location, lat, lng, vibe, array[]::text[], intel,
  true, 'approved', timezone('utc', now())
from matched
where existing_id is null;

-- Fail closed if this migration creates a duplicate canonical event.
do $qa_no_nordic_event_duplicates$
begin
  if exists (
    select 1
    from public.events
    where start_date >= date '2026-08-28'
      and event_intel->>'updated_at' = '2026-08-28T00:00:00Z'
    group by
      lower(trim(city)),
      lower(regexp_replace(trim(name), '[^a-z0-9]+', '', 'gi')),
      start_date
    having count(*) > 1
  ) then
    raise exception 'Nordic future-event duplicate detected; transaction rolled back.';
  end if;
end;
$qa_no_nordic_event_duplicates$;

commit;
