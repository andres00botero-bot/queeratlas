-- Queer Atlas: verified upcoming United States queer events, 2026-2027. V2.
-- V2 SAFETY: event vibe_tags are always written as ARRAY[]::text[].
-- Researched 2026-08-28 from organiser, venue, ticketing and official DMO sources.
--
-- Intentionally excluded:
--   * undated/TBA editions and dates inferred from previous years;
--   * mainstream events without a meaningful queer programme;
--   * listings whose only evidence was an aggregator or social-media rumour.
--
-- Idempotency is stronger than name-only matching. Existing rows are matched by
-- city plus canonical name, a declared alias, or the same source URL and date.

begin;

alter table if exists public.events
  add column if not exists event_intel jsonb not null default '{}'::jsonb;

alter table if exists public.events
  add column if not exists ticket_url text;

with src as (
  select * from jsonb_to_recordset($qa_us_future_events$
[
  {
    "name":"Atlanta Black Pride Weekend",
    "aliases":["Atlanta Black Pride Weekend 2026","Atlanta Black Pride Weekend – Labor Day Weekend"],
    "city":"atlanta","date":"2026-09-03","start_date":"2026-09-03","end_date":"2026-09-07",
    "description":"Atlanta Black Pride's verified Labor Day programme runs 3–7 September across several Atlanta venues, combining nightlife, community programming and Black LGBTQ+ visibility. This updates the older one-day seed into the organiser's full published weekend.",
    "link":"https://www.atlblackpride.com/","ticket_url":"https://www.atlblackpride.com/","location":"Multiple venues, Atlanta, GA, United States","lat":33.74900,"lng":-84.38800,
    "vibe":"major Black LGBTQ+ destination weekend spanning community, culture and late-night parties","vibe_tags":["black queer","pride","festival","nightlife","community"],
    "intel":{"entry_wait":"Each programme item has its own ticket and door conditions; headline club nights need advance purchase and extra ID/security time.","best_arrival":"Choose the exact official event before travelling and arrive ahead of its published doors; this is a multi-venue weekend, not one continuous gate.","crowd_mix":"Black LGBTQ+ Atlantans and visitors are centred, with trans, lesbian, gay, bi, non-binary, faith, professional and nightlife communities represented.","dress_code":"No weekend-wide code applies. Use the individual event rule: daytime community clothing differs from upscale, swim or expressive club looks.","host_inclusivity":"Atlanta Black Pride explicitly centres Black LGBTQ+ life and publishes a varied programme rather than treating the weekend as a single circuit party.","source_urls":["https://www.atlblackpride.com/","https://discoveratlanta.com/explore/lgbt/events/"],"research_status":"official_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Atlanta Pride Festival","aliases":["Atlanta Pride Festival 2026","Atlanta Pride Festival & Parade 2026"],
    "city":"atlanta","date":"2026-10-10","start_date":"2026-10-10","end_date":"2026-10-11",
    "description":"Atlanta Pride's official festival returns to Piedmont Park on 10–11 October, with community organisations, stages and the city's large public Pride gathering. The two-day date replaces any older single-day seed value.",
    "link":"https://atlantapride.org/","ticket_url":"https://atlantapride.org/","location":"Piedmont Park, 1320 Monroe Drive NE, Atlanta, GA 30306, United States","lat":33.78510,"lng":-84.37380,
    "vibe":"large free park Pride balancing celebration, visibility and community resources","vibe_tags":["pride","festival","outdoor","community","all ages"],
    "intel":{"entry_wait":"General festival access is public, but security, transit and road closures can create long arrival friction at peak hours.","best_arrival":"Arrive near opening for easier park entry and community booths; consult the final organiser map before choosing a parade-viewing or stage location.","crowd_mix":"LGBTQ+ residents, families, youth, elders, activists, performers, visitors, community groups and allies form a broad citywide audience.","dress_code":"Weather-ready Pride clothing, water and comfortable shoes are most useful; expressive looks are welcome without a formal festival code.","host_inclusivity":"Atlanta Pride is the official LGBTQ+ organiser and combines celebration with public visibility, community services and accessibility information.","source_urls":["https://atlantapride.org/events-page/category/official-atlanta-pride-event/","https://www.atlantaga.gov/Home/Components/Calendar/Event/25187/658"],"research_status":"organiser_and_city_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Atlanta Pride Aquarium Kickoff 2026","aliases":["Atlanta Pride Official Kickoff","Atlanta Pride Kickoff at Georgia Aquarium"],
    "city":"atlanta","date":"2026-10-09","start_date":"2026-10-09","end_date":"2026-10-09",
    "description":"The official Atlanta Pride weekend kickoff brings an adults-focused evening to Georgia Aquarium from 19:00 to 23:00 before the public park festival.",
    "link":"https://atlantapride.org/events-page/category/official-atlanta-pride-event/","ticket_url":"https://atlantapride.org/events-page/category/official-atlanta-pride-event/","location":"Georgia Aquarium, 246 Ivan Allen Jr Boulevard NW, Atlanta, GA 30313, United States","lat":33.76340,"lng":-84.39510,
    "vibe":"polished aquarium Pride opener with music, spectacle and destination-night energy","vibe_tags":["pride","kickoff","aquarium","nightlife"],
    "intel":{"entry_wait":"This is a ticketed venue event with bag screening and timed doors; buy through the official Pride listing and allow security time.","best_arrival":"Reach the aquarium shortly before the 19:00 opening to explore before the main crowd and avoid confusing it with Saturday's park festival.","crowd_mix":"Pride visitors, Atlanta professionals, couples, friend groups, sponsors and nightlife guests create a broad adult social audience.","dress_code":"Smart night-out or expressive Pride clothing works; aquarium bag, footwear and prohibited-item rules still apply.","host_inclusivity":"It is an official Atlanta Pride event inside a major civic attraction, with the organiser's LGBTQ+ mission governing the programme.","source_urls":["https://atlantapride.org/events-page/category/official-atlanta-pride-event/"],"research_status":"official_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"The Front Festival 2026","aliases":["The Front Fest 2026"],
    "city":"austin","date":"2026-09-05","start_date":"2026-09-05","end_date":"2026-09-07",
    "description":"Future Front Texas presents a three-day Austin festival of music, film, performance and creative work led by women and LGBTQ+ artists at several city venues.",
    "link":"https://futurefronttexas.org/the-front-fest","ticket_url":"https://futurefronttexas.org/the-front-fest","location":"Multiple venues, Austin, TX, United States","lat":30.26720,"lng":-97.74310,
    "vibe":"artist-led queer and feminist culture weekend with concerts, film and community","vibe_tags":["queer arts","music","film","community","festival"],
    "intel":{"entry_wait":"Passes and capacity vary by programme and venue; reserve the exact session rather than assuming one ticket opens every room.","best_arrival":"Build a venue-by-venue plan from the final schedule and arrive before each session, allowing Austin travel time between locations.","crowd_mix":"Women, LGBTQ+ artists, creatives, filmmakers, musicians, local supporters and culturally curious visitors are explicitly centred.","dress_code":"Creative casual clothing works; use weather-ready layers and follow any host venue's bag or age restrictions.","host_inclusivity":"Future Front Texas explicitly platforms women and LGBTQ+ creatives and publishes a multi-disciplinary rather than token Pride programme.","source_urls":["https://futurefronttexas.org/the-front-fest","https://www.austintexas.org/events/august-and-september/"],"research_status":"official_plus_dmo_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Splash Days Pride Pool Party 2026","aliases":["Splash Days 2026","Splash Days Austin 2026"],
    "city":"austin","date":"2026-09-06","start_date":"2026-09-06","end_date":"2026-09-06",
    "description":"Splash Days' published Pride Pool Party runs 09:00–19:00 at East Austin Hotel on 6 September, continuing Austin's LGBTQ+ Labor Day tradition.",
    "link":"https://www.splashdays.com/","ticket_url":"https://www.splashdays.com/","location":"East Austin Hotel, 1108 E 6th Street, Austin, TX 78702, United States","lat":30.26430,"lng":-97.73020,
    "vibe":"long-form LGBTQ+ Labor Day pool celebration with social daytime energy","vibe_tags":["pool party","pride","labor day","day party","gay"],
    "intel":{"entry_wait":"Advance ticketing and hotel capacity matter; expect ID, bag and pool-safety checks during the strongest midday arrival wave.","best_arrival":"Arrive in the morning for easier entry and shade before the pool reaches peak density; plan a sober route home before drinking.","crowd_mix":"Gay men are highly visible alongside wider LGBTQ+ friend groups, Austin locals and Labor Day visitors.","dress_code":"Swimwear, sun protection and secure footwear are appropriate; follow hotel coverage, bag and pool conduct rules outside the water.","host_inclusivity":"Splash Days is an established LGBTQ+ event, but this specific pool format and venue policy should be checked for access and audience fit.","source_urls":["https://www.splashdays.com/"],"research_status":"official_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"aGLIFF 39 Prism Film Festival","aliases":["aGLIFF 2026","Prism 39","Austin LGBTQ+ International Film Festival 2026"],
    "city":"austin","date":"2026-09-24","start_date":"2026-09-24","end_date":"2026-09-27",
    "description":"Austin's LGBTQ+ film organisation presents its 39th Prism Film Festival from 24–27 September, combining screenings with filmmaker and community programming.",
    "link":"https://www.agliff.org/","ticket_url":"https://www.agliff.org/","location":"Austin festival venues, Austin, TX, United States","lat":30.26720,"lng":-97.74310,
    "vibe":"queer cinema festival mixing premieres, conversation and social programming","vibe_tags":["queer film","festival","culture","community"],
    "intel":{"entry_wait":"Individual screenings and festival passes have different capacity; reserve high-interest films and opening or closing events early.","best_arrival":"Use the final screening schedule and reach each venue before published seating; late admission can depend on standby policy.","crowd_mix":"LGBTQ+ film audiences, filmmakers, artists, students, industry guests and Austin community members share the programme.","dress_code":"Everyday cinema clothing suits screenings; opening-night and social events may invite a more polished but non-mandatory look.","host_inclusivity":"aGLIFF is an LGBTQ+ film organisation with sustained queer curation, making community authorship central rather than incidental.","source_urls":["https://www.agliff.org/"],"research_status":"official_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Xtasy: Candy Flip – Love Sex Dance","aliases":["Xtasy Candy Flip","Candy Flip – Love Sex Dance (LSD)"],
    "city":"chicago","date":"2026-09-06","start_date":"2026-09-06","end_date":"2026-09-07",
    "description":"A passworded queer kink and fetish night at The Jackhammer runs 21:00–04:00 with acid and techno, a no-phone rule, consent monitors and an enforced appearance policy.",
    "link":"https://ra.co/events/2509841","ticket_url":"https://ra.co/events/2509841","location":"The Jackhammer, 6406 N Clark Street, Chicago, IL 60626, United States","lat":41.99800,"lng":-87.67020,
    "vibe":"high-intensity queer acid and techno in a consent-led fetish environment","vibe_tags":["queer techno","acid","fetish","kink","late night","21+"],
    "intel":{"entry_wait":"Presale does not guarantee admission: bring the published password, valid ID and time for the organiser's security and vibe check.","best_arrival":"Arrive near 21:00 if entry certainty matters; the programme continues to 04:00 but late arrival increases door discretion and wait.","crowd_mix":"Queer, trans, fetish, leather, rave and kink communities are centred; this is deliberately not a general streetwear club night.","dress_code":"Enforced leather, fetish, harness, latex, lace, lingerie, mesh, ravewear or gender-bending looks; ordinary jeans and streetwear are refused.","host_inclusivity":"The listing publishes consent monitors, no-phone rules and zero tolerance for harassment; inclusion does not remove the event-specific dress threshold.","source_urls":["https://ra.co/events/2509841","https://jackhammerchicago.com/"],"research_status":"ticketing_and_venue_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Official Sexistential Robyn Afterparty","aliases":["Sexistential Robyn Afterparty Chicago"],
    "city":"chicago","date":"2026-09-12","start_date":"2026-09-12","end_date":"2026-09-13",
    "description":"Chicago Eagle hosts the official Robyn afterparty from 22:30–05:00 with queer DJs moving through club and techno after the arena show.",
    "link":"https://ra.co/events/2520229","ticket_url":"https://ra.co/events/2520229","location":"Chicago Eagle, 4713 N Broadway, Chicago, IL 60640, United States","lat":41.96730,"lng":-87.65930,
    "vibe":"late queer club release connecting pop fandom with harder electronic energy","vibe_tags":["queer club","techno","afterparty","gay","21+"],
    "intel":{"entry_wait":"Advance tickets are recommended and the post-concert wave can concentrate ID and security checks after 22:30.","best_arrival":"Go directly after the concert or arrive close to doors; waiting until peak after midnight increases queue and capacity risk.","crowd_mix":"Robyn fans, gay men, queer club regulars, pop audiences and electronic-music dancers form a celebratory adult crowd.","dress_code":"Expressive concert-to-club looks are welcome; no special mandatory code is published, but valid ID and secure belongings matter.","host_inclusivity":"The programme is explicitly queer and hosted at a long-running gay leather venue; event rules still define access on the night.","source_urls":["https://ra.co/events/2520229","https://chicago-eagle.com/"],"research_status":"ticketing_and_venue_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Sinners Sanctuary: Satan's Slutty Sleepover","aliases":["Sinners Sanctuary Chicago September 2026"],
    "city":"chicago","date":"2026-09-26","start_date":"2026-09-26","end_date":"2026-09-27",
    "description":"A bi, pan and queer kink party runs 21:00–04:00 at a private Wicker Park location with techno, ghetto tech, enforced dress, consent monitors and no public door sales.",
    "link":"https://ra.co/events/2512882","ticket_url":"https://ra.co/events/2512882","location":"Private Wicker Park venue; address shared with ticketholders, Chicago, IL, United States","lat":41.90880,"lng":-87.67960,
    "vibe":"private queer kink rave with hard dance, playfulness and strict consent boundaries","vibe_tags":["queer techno","kink","fetish","private venue","21+"],
    "intel":{"entry_wait":"There are no door tickets; purchase in advance, follow address-release instructions and expect password, ID, dress and vibe checks.","best_arrival":"Arrive during the opening hour so private-location instructions and consent orientation are clear before the room peaks.","crowd_mix":"Bi, pansexual, queer, trans, kink and fetish participants are explicitly centred rather than a generic nightlife audience.","dress_code":"The organiser enforces fetish, sleepover, lingerie, leather or similarly intentional looks and rejects ordinary street clothes.","host_inclusivity":"Consent monitors, a no-phone policy and anti-harassment rules are published; guests must also respect the privacy of the undisclosed address.","source_urls":["https://ra.co/events/2512882"],"research_status":"ticketing_verified_private_location","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Chicago Pride Parade 2027","aliases":["2027 Chicago Pride Parade"],
    "city":"chicago","date":"2027-06-27","start_date":"2027-06-27","end_date":"2027-06-27",
    "description":"The official Chicago Pride Parade has published Sunday 27 June 2027 at 11:00, providing a rare confirmed next-year Pride date rather than an inferred annual placeholder.",
    "link":"https://pridechicago.org/events/list/","ticket_url":"https://pridechicago.org/events/list/","location":"North Side parade route, Chicago, IL, United States","lat":41.94300,"lng":-87.64900,
    "vibe":"large public Pride procession combining celebration, history and civic visibility","vibe_tags":["pride","parade","outdoor","2027","all ages"],
    "intel":{"entry_wait":"Spectator viewing is public, but transit crowding, street closures and controlled crossings create the practical wait.","best_arrival":"Choose a route section from the final organiser map and arrive well before the 11:00 step-off for a viable viewing position.","crowd_mix":"LGBTQ+ Chicagoans, families, organisations, performers, visitors and allies create one of the city's largest queer gatherings.","dress_code":"Weather-ready Pride clothing, water and walking shoes are more important than appearance; expressive outfits are welcome.","host_inclusivity":"The official parade is built around LGBTQ+ visibility and participation, with final access and safety guidance expected closer to June.","source_urls":["https://pridechicago.org/events/list/"],"research_status":"official_2027_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Grove & Pines Film Festival 2026","aliases":["Fire Island Grove & Pines Film Festival 2026"],
    "city":"fireisland","date":"2026-09-18","start_date":"2026-09-18","end_date":"2026-09-20",
    "description":"The Fire Island Grove & Pines Film Festival presents queer film across Cherry Grove and Fire Island Pines from 18–20 September.",
    "link":"https://www.groveandpinesfilmfestival.com/","ticket_url":"https://www.groveandpinesfilmfestival.com/","location":"Whyte Hall and Cherry Grove Community House, Fire Island, NY, United States","lat":40.66500,"lng":-73.08200,
    "vibe":"intimate island queer cinema weekend linking the Grove and the Pines","vibe_tags":["queer film","festival","fire island","culture"],
    "intel":{"entry_wait":"Screenings have separate capacities and ferry timing constrains arrival; reserve sessions and lodging before travelling.","best_arrival":"Plan each screening around the correct hamlet and ferry, allowing walking time because there is no ordinary road transfer.","crowd_mix":"Queer filmmakers, residents, seasonal visitors, arts supporters and multigenerational Fire Island audiences share the programme.","dress_code":"Relaxed island layers and weather-safe footwear suit screenings; evening events may invite polished resort casual without a formal code.","host_inclusivity":"The festival is explicitly built around queer film and uses two historic LGBTQ+ community venues across the island.","source_urls":["https://www.groveandpinesfilmfestival.com/"],"research_status":"official_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"FIT Fest at the Ice Palace 2026","aliases":["Fire Island Time Fest 2026","FIT Fest 2026"],
    "city":"fireisland","date":"2026-09-24","start_date":"2026-09-24","end_date":"2026-09-24",
    "description":"ChangeArts brings its queer theatre, history and community festival programme to the Ice Palace in Cherry Grove on 24 September.",
    "link":"https://www.changearts.org/fit-fest","ticket_url":"https://www.changearts.org/fit-fest","location":"Ice Palace, 1 Ocean Walk, Cherry Grove, NY 11782, United States","lat":40.66090,"lng":-73.08900,
    "vibe":"queer theatre and island history inside a landmark Cherry Grove venue","vibe_tags":["queer theatre","history","community","fire island"],
    "intel":{"entry_wait":"Use the official FIT Fest ticket or registration route and build ferry time into arrival; island lateness is difficult to recover.","best_arrival":"Reach Cherry Grove before the published programme begins and allow time to walk from the ferry to the Ice Palace.","crowd_mix":"Queer theatre audiences, artists, Fire Island residents, historians and seasonal visitors form an arts-led community room.","dress_code":"Resort casual and practical island footwear fit; no mandatory fashion code is published for the theatre programme.","host_inclusivity":"ChangeArts explicitly connects queer performance with Fire Island history and community rather than using the venue as generic nightlife scenery.","source_urls":["https://www.changearts.org/fit-fest","https://icepalace.club/"],"research_status":"official_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Honolulu Pride Kick-Off Pau Hana 2026","aliases":["Honolulu Pride Kick-Off Pau Hana"],
    "city":"honolulu","date":"2026-10-14","start_date":"2026-10-14","end_date":"2026-10-14",
    "description":"Honolulu Pride opens its five-day official programme with a Pau Hana at International Market Place from 17:00–19:30 on 14 October.",
    "link":"https://www.honolulupride.com/","ticket_url":"https://www.honolulupride.com/","location":"International Market Place, 2330 Kalākaua Avenue, Honolulu, HI 96815, United States","lat":21.27970,"lng":-157.82720,
    "vibe":"welcoming early-evening Pride kickoff with Waikīkī community and hosted hospitality","vibe_tags":["pride","kickoff","community","honolulu"],
    "intel":{"entry_wait":"VIP access is included in the official pass; general access and capacity should be confirmed on the Pride event page.","best_arrival":"Reach International Market Place before 17:00 to use the complete 17:00–19:30 programme and avoid the post-work surge.","crowd_mix":"Local LGBTQIA+ and MVPFAFF+ community, Pride partners, visitors, professionals and allies begin the week together.","dress_code":"Polished tropical casual and comfortable footwear suit an outdoor Waikīkī centre; no formal appearance code is published.","host_inclusivity":"Hawaiʻi LGBT Legacy Foundation explicitly centres LGBTQIA+ and MVPFAFF+ resilience throughout the official Pride programme.","source_urls":["https://www.honolulupride.com/"],"research_status":"official_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Hawaiʻi Theatre Pride Concert 2026","aliases":["Hawaii Theatre Pride Concert 2026"],
    "city":"honolulu","date":"2026-10-15","start_date":"2026-10-15","end_date":"2026-10-15",
    "description":"Hawaiʻi Theatre Center hosts the official Pride Concert on 15 October, a live entertainment night setting the cultural tone before parade weekend.",
    "link":"https://www.honolulupride.com/","ticket_url":"https://www.honolulupride.com/","location":"Hawaiʻi Theatre Center, 1130 Bethel Street, Honolulu, HI 96813, United States","lat":21.31110,"lng":-157.86020,
    "vibe":"historic-theatre Pride concert combining live performance and island community energy","vibe_tags":["pride","concert","live music","culture"],
    "intel":{"entry_wait":"Use the official Pride or theatre ticket release and allow time for assigned seating, ticket scan and venue security.","best_arrival":"Reach the theatre before the published curtain to navigate Downtown parking and enjoy any pre-show community programme.","crowd_mix":"LGBTQIA+ and MVPFAFF+ residents, music audiences, Pride visitors, artists and supporters form a seated cultural crowd.","dress_code":"Smart tropical casual or expressive Pride evening clothing works; theatre bag and seating rules remain in force.","host_inclusivity":"The concert is an official Honolulu Pride event produced around queer resilience in partnership with a major local cultural venue.","source_urls":["https://www.honolulupride.com/","https://www.hawaiitheatre.com/"],"research_status":"official_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Serving Pride Drag Brunch 2026","aliases":["Honolulu Pride Drag Brunch 2026"],
    "city":"honolulu","date":"2026-10-18","start_date":"2026-10-18","end_date":"2026-10-18",
    "description":"Honolulu Pride's official Serving Pride Drag Brunch brings performance, humour and brunch to ʻAlohilani Resort on Sunday 18 October.",
    "link":"https://www.honolulupride.com/","ticket_url":"https://www.honolulupride.com/","location":"ʻAlohilani Resort Waikīkī Beach, 2490 Kalākaua Avenue, Honolulu, HI 96815, United States","lat":21.27400,"lng":-157.82320,
    "vibe":"bright resort drag brunch closing Pride weekend with performance and food","vibe_tags":["drag","brunch","pride","resort"],
    "intel":{"entry_wait":"This is separately ticketed through the official listing; reserve seating because brunch capacity is not included automatically with festival entry.","best_arrival":"Arrive before the assigned seating or show time for resort check-in and table placement, especially with a group.","crowd_mix":"Drag audiences, LGBTQIA+ visitors, local friend groups, resort guests and Pride supporters create a celebratory mixed crowd.","dress_code":"Colourful resort brunch looks fit without a formal code; bring performer tips and follow restaurant seating requirements.","host_inclusivity":"The event is directly programmed by Honolulu Pride with airline partners and queer performers, not a generic hotel brunch.","source_urls":["https://www.honolulupride.com/"],"research_status":"official_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Honolulu Pride Lei Pool Party 2026","aliases":["Lei Pool Party 2026","Lei Over Day Club Pride Pool Party"],
    "city":"honolulu","date":"2026-10-18","start_date":"2026-10-18","end_date":"2026-10-18",
    "description":"The annual official Lei Pool Party brings DJs and Pride-weekend day-club energy to ʻAlohilani Resort on 18 October.",
    "link":"https://www.honolulupride.com/","ticket_url":"https://www.honolulupride.com/","location":"ʻAlohilani Resort Waikīkī Beach, 2490 Kalākaua Avenue, Honolulu, HI 96815, United States","lat":21.27400,"lng":-157.82320,
    "vibe":"tropical Pride day club with DJs, poolside social energy and resort polish","vibe_tags":["pool party","pride","day party","honolulu"],
    "intel":{"entry_wait":"Pool capacity and separate event access matter; confirm ticket, hotel-guest, bag and wristband rules before arrival.","best_arrival":"Arrive near opening for easier entry, shade and seating before the strongest mid-afternoon pool crowd.","crowd_mix":"LGBTQIA+ locals, visitors, gay and queer friend groups, DJs and Pride-weekend resort guests share the day club.","dress_code":"Swimwear, sun protection and secure pool footwear are appropriate; cover up when moving through non-pool hotel areas.","host_inclusivity":"The pool party is part of Honolulu Pride's official community weekend, with the resort operating the practical access rules.","source_urls":["https://www.honolulupride.com/"],"research_status":"official_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"The Hangover: Honolulu Pride Closing Party 2026","aliases":["Honolulu Pride Official Closing Party 2026","The Hangover Official Closing Party"],
    "city":"honolulu","date":"2026-10-18","start_date":"2026-10-18","end_date":"2026-10-18",
    "description":"Honolulu Pride closes its official programme at ADEZ Steakhouse & Lounge on 18 October with queer DJs, cocktails and a final community send-off.",
    "link":"https://www.honolulupride.com/","ticket_url":"https://www.honolulupride.com/","location":"ADEZ Steakhouse & Lounge, Honolulu, HI, United States","lat":21.29680,"lng":-157.85600,
    "vibe":"cocktail-led queer Pride finale with DJs and lower-pressure closing-night connection","vibe_tags":["pride","closing party","queer DJs","cocktails"],
    "intel":{"entry_wait":"VIP pass access is confirmed; verify general admission, exact time and venue policy on the official Pride page before attending.","best_arrival":"Use the final official time rather than assuming ordinary restaurant hours and arrive before the final Sunday crowd consolidates.","crowd_mix":"Pride organisers, local LGBTQIA+ guests, visitors, queer DJ audiences and weekend regulars close the programme together.","dress_code":"Resort night-out clothing fits a steakhouse lounge; no compulsory fashion code is published, but valid ID may govern alcohol areas.","host_inclusivity":"It is the designated official Honolulu Pride closing event and part of the Foundation's LGBTQIA+/MVPFAFF+ programme.","source_urls":["https://www.honolulupride.com/"],"research_status":"official_date_verified_time_pending","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Las Vegas Pride Party – September 2026","aliases":["Las Vegas PRIDE Party September 2026"],
    "city":"las_vegas","date":"2026-09-05","start_date":"2026-09-05","end_date":"2026-09-05",
    "description":"Las Vegas Pride's monthly mix-and-mingle returns to The Phoenix from 20:00–22:00 on 5 September with entertainment and community social time.",
    "link":"https://lasvegaspride.org/event/las-vegas-pride-party-4/2026-09-05/","ticket_url":"https://lasvegaspride.org/event/las-vegas-pride-party-4/2026-09-05/","location":"The Phoenix Bar & Lounge, 4213 W Sahara Avenue, Las Vegas, NV 89102, United States","lat":36.14310,"lng":-115.19650,
    "vibe":"easy monthly LGBTQ+ mixer with entertainment inside a local queer bar","vibe_tags":["pride","mixer","bar","community"],
    "intel":{"entry_wait":"The official listing does not describe a complex gate; bring valid ID and verify any cover or age rule with The Phoenix.","best_arrival":"Arrive close to 20:00 for the full two-hour mixer before ordinary Saturday nightlife becomes busier.","crowd_mix":"LGBTQ+ Las Vegas locals, Pride volunteers, newcomers, bar regulars and visitors form a social rather than festival-scale crowd.","dress_code":"Casual night-out clothing works and no event-specific fashion code is published; venue ID rules still apply.","host_inclusivity":"Las Vegas Pride organises the recurring gathering at an LGBTQ+ bar as year-round community programming.","source_urls":["https://lasvegaspride.org/event/las-vegas-pride-party-4/2026-09-05/","https://thephoenixlv.com/"],"research_status":"official_schedule_and_venue_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Las Vegas Pride Party – October 2026","aliases":["Las Vegas PRIDE Party October 2026"],
    "city":"las_vegas","date":"2026-10-03","start_date":"2026-10-03","end_date":"2026-10-03",
    "description":"The official monthly Las Vegas Pride mixer meets at The Phoenix from 20:00–22:00 on 3 October, one week before the Pride night parade.",
    "link":"https://lasvegaspride.org/series/las-vegas-pride-party-2/","ticket_url":"https://lasvegaspride.org/series/las-vegas-pride-party-2/","location":"The Phoenix Bar & Lounge, 4213 W Sahara Avenue, Las Vegas, NV 89102, United States","lat":36.14310,"lng":-115.19650,
    "vibe":"pre-Pride-month community mixer with bar entertainment and local connection","vibe_tags":["pride","mixer","bar","community"],
    "intel":{"entry_wait":"The recurring listing publishes no complicated entry process; verify current cover and age rules and bring valid ID.","best_arrival":"Reach The Phoenix near 20:00 for the complete mixer and easier conversation before the later Saturday bar crowd.","crowd_mix":"Pride volunteers, LGBTQ+ locals, first-time attendees, visitors and Phoenix regulars gather in a low-pressure social format.","dress_code":"Casual or Pride-season night-out clothing fits, with no mandatory event dress theme published.","host_inclusivity":"The event is directly organised by Las Vegas Pride as part of its year-round community calendar.","source_urls":["https://lasvegaspride.org/series/las-vegas-pride-party-2/","https://thephoenixlv.com/"],"research_status":"official_series_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Las Vegas Pride Party – November 2026","aliases":["Las Vegas PRIDE Party November 2026"],
    "city":"las_vegas","date":"2026-11-07","start_date":"2026-11-07","end_date":"2026-11-07",
    "description":"Las Vegas Pride continues its first-Saturday community mixer at The Phoenix from 20:00–22:00 on 7 November.",
    "link":"https://lasvegaspride.org/series/las-vegas-pride-party-2/","ticket_url":"https://lasvegaspride.org/series/las-vegas-pride-party-2/","location":"The Phoenix Bar & Lounge, 4213 W Sahara Avenue, Las Vegas, NV 89102, United States","lat":36.14310,"lng":-115.19650,
    "vibe":"post-festival LGBTQ+ community social keeping Pride active year-round","vibe_tags":["pride","mixer","bar","community"],
    "intel":{"entry_wait":"Confirm any current cover and age requirement with The Phoenix; the organiser lists a 20:00–22:00 social rather than a ticketed festival gate.","best_arrival":"Arrive at 20:00 for introductions and entertainment before the venue shifts toward its later Saturday-night rhythm.","crowd_mix":"LGBTQ+ residents, Pride supporters, volunteers, newcomers and queer-bar regulars form an approachable local audience.","dress_code":"Everyday night-out clothing is appropriate; no event-specific appearance threshold is published.","host_inclusivity":"Las Vegas Pride uses the monthly event to maintain community contact beyond October's parade and festival.","source_urls":["https://lasvegaspride.org/series/las-vegas-pride-party-2/","https://thephoenixlv.com/"],"research_status":"official_series_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Las Vegas Pride Party – December 2026","aliases":["Las Vegas PRIDE Party December 2026"],
    "city":"las_vegas","date":"2026-12-05","start_date":"2026-12-05","end_date":"2026-12-05",
    "description":"The Pride community's final monthly Phoenix mixer of 2026 runs 20:00–22:00 on 5 December with entertainment, surprises and social time.",
    "link":"https://lasvegaspride.org/series/las-vegas-pride-party-2/","ticket_url":"https://lasvegaspride.org/series/las-vegas-pride-party-2/","location":"The Phoenix Bar & Lounge, 4213 W Sahara Avenue, Las Vegas, NV 89102, United States","lat":36.14310,"lng":-115.19650,
    "vibe":"friendly year-end queer mixer with Pride community continuity","vibe_tags":["pride","mixer","holiday","community"],
    "intel":{"entry_wait":"Check venue cover, ID and holiday capacity before travelling; the official series lists a simple 20:00 start.","best_arrival":"Reach The Phoenix near opening for easier seating and conversation before the later holiday-night crowd.","crowd_mix":"Pride supporters, LGBTQ+ locals, holiday visitors, volunteers and venue regulars gather across generations.","dress_code":"Casual or festive clothing works without a compulsory holiday theme; standard bar requirements remain.","host_inclusivity":"The organiser is Las Vegas Pride and the recurring venue is a dedicated local LGBTQ+ bar and lounge.","source_urls":["https://lasvegaspride.org/series/las-vegas-pride-party-2/","https://thephoenixlv.com/"],"research_status":"official_series_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Las Vegas Pride Party – January 2027","aliases":["Las Vegas PRIDE Party January 2027"],
    "city":"las_vegas","date":"2027-01-02","start_date":"2027-01-02","end_date":"2027-01-02",
    "description":"Las Vegas Pride has already published its first 2027 monthly community party for 2 January from 20:00–22:00 at The Phoenix.",
    "link":"https://lasvegaspride.org/series/las-vegas-pride-party-2/","ticket_url":"https://lasvegaspride.org/series/las-vegas-pride-party-2/","location":"The Phoenix Bar & Lounge, 4213 W Sahara Avenue, Las Vegas, NV 89102, United States","lat":36.14310,"lng":-115.19650,
    "vibe":"new-year LGBTQ+ mixer with entertainment and an easy local-community focus","vibe_tags":["pride","mixer","new year","2027"],
    "intel":{"entry_wait":"Verify current cover and ID rules closer to January; the official series confirms the 20:00–22:00 date and venue pattern.","best_arrival":"Arrive at 20:00 for the full published mixer and less friction than the later Saturday-night bar period.","crowd_mix":"LGBTQ+ locals, Pride organisers and supporters, New Year visitors and Phoenix regulars form a conversational crowd.","dress_code":"Relaxed night-out clothing fits and no formal New Year costume rule is published for this 2 January event.","host_inclusivity":"The official Pride organiser publishes this genuinely dated 2027 gathering as year-round community programming.","source_urls":["https://lasvegaspride.org/series/las-vegas-pride-party-2/","https://thephoenixlv.com/"],"research_status":"official_2027_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Las Vegas Pride Festival 2026","aliases":["Las Vegas PRIDE Festival","Las Vegas Pride Festival"],
    "city":"las_vegas","date":"2026-10-17","start_date":"2026-10-17","end_date":"2026-10-17",
    "description":"Las Vegas Pride's official festival runs noon–22:00 on 17 October at Desert Breeze Events Center, one week after the 9 October night parade.",
    "link":"https://lasvegaspride.org/2026/04/02/festival-guide-2026/","ticket_url":"https://lasvegaspride.org/2026/04/02/festival-guide-2026/","location":"Desert Breeze Events Center, 8455 Kids Zone Parkway, Las Vegas, NV 89147, United States","lat":36.12900,"lng":-115.28000,
    "vibe":"full-day desert Pride festival with community booths, entertainment and night energy","vibe_tags":["pride","festival","outdoor","community"],
    "intel":{"entry_wait":"Ticketing and security are separate from the prior week's parade; afternoon and headline arrivals can create gate queues.","best_arrival":"Arrive near noon for easier entry and community programming, or before the exact evening act rather than at headline peak.","crowd_mix":"LGBTQ+ locals, families, performers, community organisations, Strip visitors and allies gather across a long festival day.","dress_code":"Sun-safe Pride clothing, water and comfortable shoes suit daytime; bring a layer for the cooler desert evening.","host_inclusivity":"Las Vegas Pride publishes a dedicated community festival and separates family/public programming from its nightlife calendar.","source_urls":["https://lasvegaspride.org/2026/04/02/festival-guide-2026/","https://lasvegaspride.org/"],"research_status":"official_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"FERAL Los Angeles – September 2026","aliases":["FERAL at Coyote Studios"],
    "city":"los_angeles","date":"2026-09-04","start_date":"2026-09-04","end_date":"2026-09-05",
    "description":"FERAL gathers queer people, furries and self-described freaks at Coyote Studios from 21:00–02:00 with electronic music, drag, live acts and vendors.",
    "link":"https://ra.co/events/2506773","ticket_url":"https://ra.co/events/2506773","location":"Coyote Studios, 3501 Union Pacific Avenue, Los Angeles, CA 90023, United States","lat":34.01650,"lng":-118.20080,
    "vibe":"DIY queer rave-cabaret mixing bass music, drag, vendors and playful subculture","vibe_tags":["queer rave","electronic","drag","furry","21+"],
    "intel":{"entry_wait":"Low-cost advance entry is available; bring valid ID and allow time for warehouse-style security and parking or rideshare access.","best_arrival":"Arrive close to 21:00 to see live and drag programming before the later DJ peak and to orient yourself inside the studio.","crowd_mix":"Queer, trans, furry, alternative, drag and bass-music communities are explicitly welcomed in a deliberately eclectic room.","dress_code":"Expressive, creature, rave and club looks fit, but no compulsory costume is published; prioritize movement, consent and secure belongings.","host_inclusivity":"The organiser explicitly welcomes queer outsiders and uses a mixed performance format; respect artist, vendor and attendee boundaries.","source_urls":["https://ra.co/events/2506773"],"research_status":"ticketing_and_venue_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"A Club Called Rhonda – September 2026","aliases":["A Club Called Rhonda at Los Globos"],
    "city":"los_angeles","date":"2026-09-25","start_date":"2026-09-25","end_date":"2026-09-26",
    "description":"Los Angeles' long-running pansexual party A Club Called Rhonda returns to Los Globos from 21:30–04:00 with house and techno across a flamboyant queer dance floor.",
    "link":"https://ra.co/events/2506362","ticket_url":"https://ra.co/events/2506362","location":"Los Globos, 3040 W Sunset Boulevard, Los Angeles, CA 90026, United States","lat":34.08480,"lng":-118.27500,
    "vibe":"glamorous pansexual house and techno with theatrical Los Angeles nightlife energy","vibe_tags":["queer club","house","techno","pansexual","21+"],
    "intel":{"entry_wait":"Tiered advance tickets and the late headline wave can produce a significant ID and security line at Los Globos.","best_arrival":"Arrive before midnight to experience the room building and reduce capacity risk; plan a sober ride after the 04:00 finish.","crowd_mix":"Queer and straight nightlife creatives, fashion-led dancers, house and techno fans and long-time Rhonda regulars mix intentionally.","dress_code":"Flamboyant and expressive night-out looks suit Rhonda's identity, although the ticket listing does not publish a mandatory code.","host_inclusivity":"Rhonda has a specifically pansexual party identity; inclusion depends on respectful dance-floor behaviour rather than attendee labels alone.","source_urls":["https://ra.co/events/2506362","https://losglobosla.com/"],"research_status":"ticketing_and_venue_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"IGLTA Global Convention Miami 2027","aliases":["2027 IGLTA Global Convention"],
    "city":"miami","date":"2027-09-27","start_date":"2027-09-27","end_date":"2027-09-30",
    "description":"IGLTA has selected Greater Miami and Miami Beach for its 2027 Global Convention from 27–30 September, a confirmed international LGBTQ+ travel-industry gathering.",
    "link":"https://www.iglta.org/articles/post/greater-miami-and-miami-beach-selected-host-iglta-global-convention-2027/","ticket_url":"https://www.iglta.org/","location":"Greater Miami and Miami Beach, FL, United States","lat":25.79070,"lng":-80.13000,
    "vibe":"international LGBTQ+ travel convention combining business, advocacy and destination networking","vibe_tags":["conference","lgbtq travel","networking","2027"],
    "intel":{"entry_wait":"Convention registration and credentials will govern access; wait for the official delegate portal before booking programme-specific attendance.","best_arrival":"Plan for the full 27–30 September window and use the later host-hotel announcement before choosing accommodation.","crowd_mix":"LGBTQ+ tourism professionals, destinations, media, advocates, travel businesses and international delegates form a specialist audience.","dress_code":"Business casual usually fits conference sessions, with polished resort or event wear for receptions; follow the final programme.","host_inclusivity":"IGLTA is the global LGBTQ+ travel association and selected the destination through an official convention process.","source_urls":["https://www.iglta.org/articles/post/greater-miami-and-miami-beach-selected-host-iglta-global-convention-2027/"],"research_status":"official_2027_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Twin Cities Pride Festival 2027","aliases":["2027 Twin Cities Pride Festival"],
    "city":"minneapolis","date":"2027-06-26","start_date":"2027-06-26","end_date":"2027-06-27",
    "description":"Twin Cities Pride has officially published its 2027 festival for 26–27 June at Loring Park, with three stages, more than 650 vendors and community resources.",
    "link":"https://tcpride.org/festival/","ticket_url":"https://tcpride.org/festival/","location":"Loring Park, 1382 Willow Street, Minneapolis, MN 55403, United States","lat":44.96960,"lng":-93.28300,
    "vibe":"large free community Pride with performance, resources and multigenerational park energy","vibe_tags":["pride","festival","free","community","2027"],
    "intel":{"entry_wait":"The festival is free, but park entry, security, transit and popular stage zones can become congested at midday.","best_arrival":"Arrive near the 10:00 opening for easier navigation; Saturday runs to 19:00 and Sunday to 18:00.","crowd_mix":"LGBTQIA2S+ families, youth, elders, BIPOC organisations, artists, vendors, visitors and allies fill the park.","dress_code":"Weather-ready Pride clothing, sun or rain protection and walking shoes are practical; no formal appearance code applies.","host_inclusivity":"Twin Cities Pride states a mission to empower every LGBTQIA2S+ person and builds community and BIPOC resources into the festival.","source_urls":["https://tcpride.org/festival/"],"research_status":"official_2027_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Twin Cities Pride Parade 2027","aliases":["2027 Twin Cities Pride Parade"],
    "city":"minneapolis","date":"2027-06-27","start_date":"2027-06-27","end_date":"2027-06-27",
    "description":"The 2027 Twin Cities Pride Parade steps off at 11:00 on 27 June, travelling from 3rd and Hennepin down Hennepin Avenue to Spruce.",
    "link":"https://tcpride.org/parade/","ticket_url":"https://tcpride.org/parade/","location":"Hennepin Avenue from 3rd Street to Spruce Place, Minneapolis, MN, United States","lat":44.98000,"lng":-93.27300,
    "vibe":"mass public Pride procession rooted in protest, visibility and celebration","vibe_tags":["pride","parade","free","outdoor","2027"],
    "intel":{"entry_wait":"Spectating is free; road closures and more than 200,000 expected viewers make transit and viewing space the real constraints.","best_arrival":"Choose a Hennepin viewing section early and be in place well before the 11:00 start; the published run is 11:00–14:00.","crowd_mix":"LGBTQIA2S+ organisations, families, activists, performers, local institutions, visitors and allies line and travel the route.","dress_code":"Weather-ready Pride clothing and walking shoes work best; keep water, hearing protection and accessibility needs in mind.","host_inclusivity":"Twin Cities Pride frames the parade as both celebration and continuation of a grassroots liberation tradition.","source_urls":["https://tcpride.org/parade/"],"research_status":"official_2027_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Halloween New Orleans 2026","aliases":["HNO 2026","Halloween New Orleans"],
    "city":"new_orleans","date":"2026-10-30","start_date":"2026-10-30","end_date":"2026-11-01",
    "description":"Halloween New Orleans' LGBTQ+ benefit weekend begins 30 October, combining costumed nightlife and fundraising within the city's long-running queer Halloween tradition.",
    "link":"https://www.neworleans.com/event/halloween-new-orleans/","ticket_url":"https://www.neworleans.com/event/halloween-new-orleans/","location":"French Quarter and event venues, New Orleans, LA, United States","lat":29.95840,"lng":-90.06440,
    "vibe":"elaborate queer costume weekend mixing nightlife, spectacle and HIV-community fundraising","vibe_tags":["halloween","gay","costume","fundraiser","nightlife"],
    "intel":{"entry_wait":"Weekend parties use separate tickets and can sell out; check the organiser's final venue and wristband instructions before arrival.","best_arrival":"Treat each night as a distinct event and arrive before headline hours, allowing for French Quarter street closures and crowds.","crowd_mix":"Gay men, wider LGBTQ+ visitors, costume artists, local regulars, performers and fundraising supporters dominate the weekend.","dress_code":"Costume and expressive nightlife presentation are central, but exact theme, venue coverage and prohibited-item rules vary by party.","host_inclusivity":"The weekend has a long LGBTQ+ charitable identity; community purpose is stronger evidence than generic Halloween marketing.","source_urls":["https://www.neworleans.com/event/halloween-new-orleans/","https://www.neworleans.com/things-to-do/festivals/lgbt/"],"research_status":"official_dmo_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Gay Easter Parade New Orleans 2027","aliases":["Official Gay Easter Parade 2027"],
    "city":"new_orleans","date":"2027-03-28","start_date":"2027-03-28","end_date":"2027-03-28",
    "description":"New Orleans' official LGBTQ+ event calendar confirms the Gay Easter Parade for 28 March 2027, bringing festive dress and charitable visibility through the French Quarter.",
    "link":"https://www.neworleans.com/events/lgbt-events/","ticket_url":"https://www.neworleans.com/events/lgbt-events/","location":"French Quarter, New Orleans, LA, United States","lat":29.95840,"lng":-90.06440,
    "vibe":"camp spring procession blending queer tradition, finery and French Quarter visibility","vibe_tags":["parade","gay","easter","community","2027"],
    "intel":{"entry_wait":"Public viewing does not require a ticket, but route access and street closures should be checked once the final map is published.","best_arrival":"Select a route location before the start and arrive early enough to avoid holiday traffic and constrained Quarter crossings.","crowd_mix":"LGBTQ+ locals, visitors, costumed participants, community supporters and French Quarter spectators share the public route.","dress_code":"Easter finery, hats and camp presentation are traditional but optional; weather-ready footwear remains practical.","host_inclusivity":"The parade is an established LGBTQ+ community tradition and appears on the city's dedicated official LGBTQ+ calendar.","source_urls":["https://www.neworleans.com/events/lgbt-events/","https://www.neworleans.com/things-to-do/festivals/lgbt/"],"research_status":"official_2027_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"SKIN2SKIN Two-Year Anniversary","aliases":["SKIN2SKIN 2 Year Anniversary"],
    "city":"new_york","date":"2026-09-05","start_date":"2026-09-05","end_date":"2026-09-06",
    "description":"SKIN2SKIN marks two years at Bossa Nova Civic Club from 22:00–04:00, centring Black and brown queer and trans dancers across techno and club music.",
    "link":"https://ra.co/events/2511909","ticket_url":"https://ra.co/events/2511909","location":"Bossa Nova Civic Club, 1271 Myrtle Avenue, Brooklyn, NY 11221, United States","lat":40.69790,"lng":-73.92730,
    "vibe":"community-centred Black and brown queer techno in an intimate Brooklyn club","vibe_tags":["queer techno","black queer","trans","brooklyn","21+"],
    "intel":{"entry_wait":"Admission is listed at ten dollars before midnight and fifteen after; compact capacity can still produce a late queue.","best_arrival":"Arrive before midnight for lower entry cost and better capacity odds, with a late-night transport plan already arranged.","crowd_mix":"Black and brown queer and trans people are intentionally centred, joined by respectful club and techno dancers.","dress_code":"Dance-ready expressive clothing works; no mandatory fashion code is published, and respectful behaviour matters more than appearance.","host_inclusivity":"The organiser explicitly centres QTBIPOC community and publishes zero tolerance for discrimination or harassment.","source_urls":["https://ra.co/events/2511909","https://www.bossanovacivicclub.com/"],"research_status":"ticketing_and_venue_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"TOSSD at telos.haus – September 2026","aliases":["TOSSD September 2026"],
    "city":"new_york","date":"2026-09-06","start_date":"2026-09-06","end_date":"2026-09-06",
    "description":"TOSSD presents a twelve-hour queer DIY party from 05:00–17:00 at telos.haus in Brooklyn, built for the after-hours-to-daylight transition.",
    "link":"https://ra.co/events/2519387","ticket_url":"https://ra.co/events/2519387","location":"telos.haus, 303 Ten Eyck Street, Brooklyn, NY 11206, United States","lat":40.71120,"lng":-73.93700,
    "vibe":"queer DIY after-hours moving from early morning intensity into daylight community","vibe_tags":["queer club","afterhours","brooklyn","day party","21+"],
    "intel":{"entry_wait":"The listing states forty dollars at the door; capacity and a 05:00 opening make arrival planning more important than presale convenience.","best_arrival":"Choose intentionally between the opening after-hours wave and later daylight stretch, and do not drive after an overnight party.","crowd_mix":"Queer DIY dancers, nightlife workers, after-hours regulars and experimental club audiences form an adult community crowd.","dress_code":"Comfortable dance and daylight-transition layers are sensible; no mandatory dress rule is published by the ticket listing.","host_inclusivity":"The event explicitly identifies as queer and DIY; guests should preserve the low-surveillance, consent-led community character.","source_urls":["https://ra.co/events/2519387"],"research_status":"ticketing_and_venue_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"WRECKED at BASEMENT – September 2026","aliases":["WRECKED Boris Alinka September 2026"],
    "city":"new_york","date":"2026-09-12","start_date":"2026-09-12","end_date":"2026-09-13",
    "description":"WRECKED brings a queer techno bill to BASEMENT from 22:30–07:00 with strict door discretion, no photography and explicit dance-floor conduct rules.",
    "link":"https://ra.co/events/2502899","ticket_url":"https://ra.co/events/2502899","location":"BASEMENT, 52-19 Flushing Avenue, Maspeth, NY 11378, United States","lat":40.71680,"lng":-73.91460,
    "vibe":"serious queer techno in a dark, high-intensity no-phone dance environment","vibe_tags":["queer techno","brooklyn","no phones","late night","21+"],
    "intel":{"entry_wait":"One ticket per person and a ticket does not guarantee entry; expect ID, security and door selection even with presale.","best_arrival":"Arrive near opening for the clearest capacity odds and plan transport for the 07:00 finish; do not rely on late re-entry.","crowd_mix":"Queer techno dancers, gay club regulars and serious electronic-music audiences share a focused rather than conversational floor.","dress_code":"No costume code is listed, but purposeful dancewear suits the room; phones stay away and conversation belongs off the floor.","host_inclusivity":"Consent is mandatory and discrimination is prohibited; strict door policy and behavioural rules coexist with the queer programme.","source_urls":["https://ra.co/events/2502899","https://basementny.net/"],"research_status":"ticketing_and_venue_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"MERGE Five-Year Anniversary","aliases":["MERGE 5 YEAR ANNIVERSARY","Merge 5 Year Anniversary NYC"],
    "city":"new_york","date":"2026-09-18","start_date":"2026-09-18","end_date":"2026-09-19",
    "description":"MERGE celebrates five years with a fourteen-hour queer techno event from 23:00–13:00 at a private East Williamsburg location disclosed to ticket holders.",
    "link":"https://ra.co/events/2493731","ticket_url":"https://ra.co/events/2493731","location":"Private East Williamsburg venue; address shared with ticketholders, Brooklyn, NY, United States","lat":40.71400,"lng":-73.93200,
    "vibe":"marathon queer techno with privacy, safety and dance-floor focus at its core","vibe_tags":["queer techno","private venue","marathon","brooklyn","21+"],
    "intel":{"entry_wait":"A ticket does not guarantee admission; follow the private-address message and expect ID, security and door discretion.","best_arrival":"Arrive close to 23:00 for entry certainty or plan consciously for the daylight stretch; secure safe transport and rest for a fourteen-hour programme.","crowd_mix":"Queer techno heads, trans and non-binary dancers, artists and underground Brooklyn regulars form a committed music-first crowd.","dress_code":"No formal fashion code is published; functional dancewear fits, phones remain pocketed and conversation should move off the floor.","host_inclusivity":"MERGE publishes anti-harassment, consent, privacy and dance-floor rules; the undisclosed address must never be converted into a public precise pin.","source_urls":["https://ra.co/events/2493731"],"research_status":"ticketing_verified_private_location","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Jingle Ball at Anthem Orlando 2026","aliases":["Anthem Orlando Jingle Ball 2026"],
    "city":"orlando","date":"2026-12-12","start_date":"2026-12-12","end_date":"2026-12-13",
    "description":"Anthem Orlando's LGBTQ+ holiday calendar confirms its Jingle Ball for Saturday 12 December, a dedicated queer club celebration rather than a generic seasonal listing.",
    "link":"https://anthemorlando.com/orlando-lgbtq-holiday-party-guide-2026/","ticket_url":"https://anthemorlando.com/orlando-lgbtq-holiday-party-guide-2026/","location":"Anthem Orlando, Orlando, FL, United States","lat":28.53830,"lng":-81.37920,
    "vibe":"festive LGBTQ+ holiday club night with playful seasonal glamour","vibe_tags":["gay club","holiday","dance","orlando"],
    "intel":{"entry_wait":"Use Anthem's final ticket and doors announcement; holiday groups can concentrate ID and security lines around peak club hours.","best_arrival":"Check the final start time and arrive before the main show or DJ peak rather than relying on ordinary weekly venue hours.","crowd_mix":"LGBTQ+ Orlando locals, holiday visitors, drag and dance audiences and mixed queer friend groups form the room.","dress_code":"Festive, glamorous or playful holiday looks fit, but no mandatory costume rule is currently published.","host_inclusivity":"Anthem identifies as an LGBTQ+ nightclub and publishes the event within a dedicated queer holiday programme.","source_urls":["https://anthemorlando.com/orlando-lgbtq-holiday-party-guide-2026/"],"research_status":"official_venue_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"The Dinah Weekend","aliases":["The Dinah 2026","Club Skirts Dinah Shore Weekend 2026"],
    "city":"palm_springs","date":"2026-09-30","start_date":"2026-09-30","end_date":"2026-10-04",
    "description":"The Dinah's official 2026 edition runs 30 September–4 October across Hilton Palm Springs and Hotel Zoso, with pool parties, concerts and lesbian/queer nightlife.",
    "link":"https://thedinah.com/","ticket_url":"https://thedinah.com/","location":"Hilton Palm Springs and Hotel Zoso, Palm Springs, CA, United States","lat":33.82300,"lng":-116.54200,
    "vibe":"large destination lesbian and queer-women festival with pool, music and nightlife","vibe_tags":["lesbian","queer women","pool party","festival","music"],
    "intel":{"entry_wait":"Weekend passes and individual events have different access; headline concerts and pool gates create the longest wristband and security waits.","best_arrival":"Collect credentials early and plan the Hilton-to-Zoso movement before each event; do not treat the five days as one continuous venue.","crowd_mix":"Lesbian, bisexual, queer and trans women, non-binary guests, performers and international destination visitors are centred.","dress_code":"Poolwear, expressive club looks and desert layers all apply at different times; follow each hotel's coverage and bag rules.","host_inclusivity":"The Dinah is built specifically around lesbian and queer-women community, while exact event access and audience language should be read before purchase.","source_urls":["https://thedinah.com/","https://www.visitgreaterpalmsprings.com/events/events-and-festivals/club-skirts-dinah-shore-weekend/"],"research_status":"official_plus_dmo_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Palm Springs Leather Pride 2026","aliases":["PS Leather Pride 2026","Palm Springs Leather Pride"],
    "city":"palm_springs","date":"2026-10-29","start_date":"2026-10-29","end_date":"2026-11-01",
    "description":"Palm Springs Leather Order of the Desert confirms Leather Pride from 29 October–1 November, with host-hotel and event-specific programming across the weekend.",
    "link":"https://www.pslod.org/leather-pride-host-hotel","ticket_url":"https://www.pslod.org/leather-pride-host-hotel","location":"Palm Springs, CA, United States","lat":33.83030,"lng":-116.54530,
    "vibe":"destination leather weekend mixing community ritual, social events and adult nightlife","vibe_tags":["leather","fetish","gay","community","21+"],
    "intel":{"entry_wait":"Packages and individual events differ; buy through PSLOD and verify host-hotel credentials, ID and private-party access.","best_arrival":"Arrive Thursday if collecting a full-weekend package and use the final schedule before moving between hotel and nightlife venues.","crowd_mix":"Leather community, gay and bi men, kink participants, titleholders, bears, trans attendees and respectful supporters gather across varied formats.","dress_code":"Leather and fetish gear are central at many events, but requirements vary; read each listing instead of assuming every daytime activity is gear-only.","host_inclusivity":"PSLOD is a community leather organisation; consent, event boundaries and accurate audience labels matter more than generic Pride branding.","source_urls":["https://www.pslod.org/leather-pride-host-hotel"],"research_status":"official_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Women's Week Provincetown 2026","aliases":["Provincetown Women's Week 2026","Women’s Week 2026"],
    "city":"provincetown","date":"2026-10-12","start_date":"2026-10-12","end_date":"2026-10-18",
    "description":"Provincetown for Women confirms Women's Week for 12–18 October, with some opening events beginning 9 October and a townwide programme of performance, culture and connection.",
    "link":"https://www.provincetownforwomen.com/","ticket_url":"https://www.provincetownforwomen.com/","location":"Multiple venues, Provincetown, MA, United States","lat":42.05290,"lng":-70.18640,
    "vibe":"multigenerational lesbian and queer-women town takeover built around culture and connection","vibe_tags":["lesbian","queer women","festival","culture","community"],
    "intel":{"entry_wait":"Townwide events ticket separately and popular shows sell out; lodging and transport are often a greater constraint than any single door.","best_arrival":"Use the event-by-event schedule and note that some opening programming begins before the core 12 October date.","crowd_mix":"Lesbian, bisexual and queer women, non-binary guests, artists, writers, couples, solo travellers and long-time regulars are centred.","dress_code":"Cape-weather layers and comfortable walking shoes fit daytime; performance and dance events may invite more expressive looks.","host_inclusivity":"Provincetown for Women explicitly curates programming for queer women and publishes multiple formats rather than a single nightlife stereotype.","source_urls":["https://www.provincetownforwomen.com/","https://ptown.org/calendars/annual-events-theme-weeks/"],"research_status":"official_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Lesbian Visibility Week Provincetown 2027","aliases":["Provincetown Lesbian Visibility Week 2027"],
    "city":"provincetown","date":"2027-04-26","start_date":"2027-04-26","end_date":"2027-05-02",
    "description":"Provincetown for Women has published Lesbian Visibility Week for 26 April–2 May 2027, creating an official shoulder-season queer-women programme.",
    "link":"https://www.provincetownforwomen.com/","ticket_url":"https://www.provincetownforwomen.com/","location":"Multiple venues, Provincetown, MA, United States","lat":42.05290,"lng":-70.18640,
    "vibe":"shoulder-season lesbian visibility, culture and community across Provincetown","vibe_tags":["lesbian","queer women","visibility","community","2027"],
    "intel":{"entry_wait":"Programme items and accommodation book separately; wait for the final session schedule before assuming open admission.","best_arrival":"Plan for variable spring ferry and weather conditions and select the specific 26 April–2 May programme days that suit.","crowd_mix":"Lesbian and queer women, non-binary participants, community organisers, artists and shoulder-season visitors are centred.","dress_code":"Warm, rain-ready Cape layers and walking shoes are practical; individual evening events may have their own theme.","host_inclusivity":"The event is explicitly produced for lesbian visibility by Provincetown for Women, with the next-year dates already published.","source_urls":["https://www.provincetownforwomen.com/"],"research_status":"official_2027_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Single Women's Weekend Provincetown 2027","aliases":["Provincetown Single Women's Weekend 2027"],
    "city":"provincetown","date":"2027-05-21","start_date":"2027-05-21","end_date":"2027-05-23",
    "description":"Provincetown for Women confirms Single Women's Weekend for 21–23 May 2027, with queer-women social programming designed for connection rather than a generic townwide party.",
    "link":"https://www.provincetownforwomen.com/","ticket_url":"https://www.provincetownforwomen.com/","location":"Multiple venues, Provincetown, MA, United States","lat":42.05290,"lng":-70.18640,
    "vibe":"low-pressure queer-women weekend centred on meeting, conversation and Cape community","vibe_tags":["lesbian","queer women","social","community","2027"],
    "intel":{"entry_wait":"Individual socials and activities may require registration; lodging and ferry reservations remain separate from event access.","best_arrival":"Plan transport for the full 21–23 May window and use the final activity schedule before selecting arrival time.","crowd_mix":"Single lesbian, bisexual and queer women, non-binary guests, solo travellers and community hosts are deliberately centred.","dress_code":"Comfortable Cape layers and social casual clothing work; specific dinners or dances may later publish their own theme.","host_inclusivity":"The organiser clearly defines an identity- and relationship-status-specific community purpose that visitors should respect.","source_urls":["https://www.provincetownforwomen.com/"],"research_status":"official_2027_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"MemDay Ptown 2027","aliases":["Memorial Day Provincetown for Women 2027","MemDay Provincetown 2027"],
    "city":"provincetown","date":"2027-05-27","start_date":"2027-05-27","end_date":"2027-05-31",
    "description":"The official Provincetown for Women calendar dates MemDay Ptown for 27–31 May 2027, opening the summer season with lesbian and queer-women events.",
    "link":"https://www.provincetownforwomen.com/","ticket_url":"https://www.provincetownforwomen.com/","location":"Multiple venues, Provincetown, MA, United States","lat":42.05290,"lng":-70.18640,
    "vibe":"summer-opening queer-women destination weekend with town, beach and nightlife energy","vibe_tags":["lesbian","queer women","memorial day","festival","2027"],
    "intel":{"entry_wait":"Holiday lodging, ferry and individual party capacity all tighten; book through official event and transport channels early.","best_arrival":"Reach town before the first selected 27 May programme and allow extra holiday-weekend transit time.","crowd_mix":"Lesbian and queer women, non-binary guests, couples, solo travellers and returning Memorial Day visitors are centred.","dress_code":"Variable Cape weather needs layers; daytime casual, beach and expressive evening looks apply to different programme items.","host_inclusivity":"Provincetown for Women publishes this as a dedicated queer-women weekend with confirmed next-year dates.","source_urls":["https://www.provincetownforwomen.com/"],"research_status":"official_2027_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Womxn of Color Weekend Provincetown 2027","aliases":["Provincetown Womxn of Color Weekend 2027"],
    "city":"provincetown","date":"2027-06-02","start_date":"2027-06-02","end_date":"2027-06-07",
    "description":"The official Provincetown for Women calendar confirms Womxn of Color Weekend from 2–7 June 2027.",
    "link":"https://www.provincetownforwomen.com/","ticket_url":"https://www.provincetownforwomen.com/","location":"Multiple venues, Provincetown, MA, United States","lat":42.05290,"lng":-70.18640,
    "vibe":"identity-centred Cape gathering for queer women and non-binary people of color","vibe_tags":["queer women","BIPOC","community","festival","2027"],
    "intel":{"entry_wait":"Events and town lodging use separate reservations; wait for the official programme before purchasing through any third party.","best_arrival":"Book transport and accommodation early for the 2–7 June window, then build attendance around the final session schedule.","crowd_mix":"Queer women and non-binary people of color are centred, with artists, organisers, friends and respectful community participants.","dress_code":"Cape-weather layers and expressive social looks both fit; follow each workshop, beach or evening event's practical rules.","host_inclusivity":"The event's identity-specific focus should be respected rather than reframed as a general tourist party.","source_urls":["https://www.provincetownforwomen.com/"],"research_status":"official_2027_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Girl Splash Provincetown 2027","aliases":["Provincetown Girl Splash 2027"],
    "city":"provincetown","date":"2027-07-21","start_date":"2027-07-21","end_date":"2027-07-24",
    "description":"Girl Splash is officially dated for 21–24 July 2027, bringing a summer programme for lesbian and queer women to Provincetown.",
    "link":"https://www.provincetownforwomen.com/","ticket_url":"https://www.provincetownforwomen.com/","location":"Multiple venues, Provincetown, MA, United States","lat":42.05290,"lng":-70.18640,
    "vibe":"summer queer-women escape balancing beach time, social events and nightlife","vibe_tags":["lesbian","queer women","summer","beach","2027"],
    "intel":{"entry_wait":"Programme events and lodging sell independently; summer capacity makes early accommodation more important than walk-up assumptions.","best_arrival":"Reach town before the first selected event and account for ferry demand, traffic and walking between venues.","crowd_mix":"Lesbian, bisexual and queer women, non-binary guests, solo travellers, couples and summer regulars are centred.","dress_code":"Beachwear, sun protection and evening resort looks all have a place; individual venues still set footwear and coverage rules.","host_inclusivity":"Provincetown for Women publishes the event specifically for queer women, with confirmed 2027 dates and townwide programming.","source_urls":["https://www.provincetownforwomen.com/"],"research_status":"official_2027_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Utah Queer Film Festival 2026","aliases":["UQFF 2026"],
    "city":"salt_lake_city","date":"2026-11-06","start_date":"2026-11-06","end_date":"2026-11-08",
    "description":"Utah Film Center confirms the Utah Queer Film Festival for 6–8 November, presenting LGBTQ+ cinema and community programming in Salt Lake City.",
    "link":"https://utahfilmcenter.org/film/utah-queer-film-festival-2026/","ticket_url":"https://utahfilmcenter.org/film/utah-queer-film-festival-2026/","location":"Salt Lake City festival venues, Salt Lake City, UT, United States","lat":40.76080,"lng":-111.89100,
    "vibe":"queer cinema weekend creating public culture and connection in Utah","vibe_tags":["queer film","festival","culture","community"],
    "intel":{"entry_wait":"Screenings and special events may use separate reservations; book through Utah Film Center once the complete programme opens.","best_arrival":"Use the final venue and screening schedule and arrive before seating; do not assume all films share one location.","crowd_mix":"LGBTQ+ Utahns, filmmakers, students, arts audiences, advocates and community supporters form a mixed-age cinema crowd.","dress_code":"Comfortable cinema clothing is appropriate; opening or closing events may invite polished casual looks without a formal code.","host_inclusivity":"The festival is explicitly queer-curated within Utah Film Center, providing a sustained cultural platform rather than one-off branding.","source_urls":["https://utahfilmcenter.org/film/utah-queer-film-festival-2026/"],"research_status":"official_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Salt Lake City Leather Pride 2026","aliases":["SLC Leather Pride 2026"],
    "city":"salt_lake_city","date":"2026-10-18","start_date":"2026-10-18","end_date":"2026-10-18",
    "description":"Utah Pride Center's statewide local-Pride calendar lists Salt Lake City Leather Pride for 18 October 2026.",
    "link":"https://utahpride.org/local-prides","ticket_url":"https://utahpride.org/local-prides","location":"Salt Lake City, UT, United States","lat":40.76080,"lng":-111.89100,
    "vibe":"local leather-community Pride focused on visibility, connection and specialist culture","vibe_tags":["leather","fetish","community","pride"],
    "intel":{"entry_wait":"Final venue, ticket and age conditions belong to the organiser; verify them before travel because the statewide calendar is a date index.","best_arrival":"Use the eventual organiser schedule rather than guessing ordinary bar hours from the 18 October calendar entry.","crowd_mix":"Leather and fetish community, gay and bi men, trans participants, titleholders and respectful supporters are likely centred.","dress_code":"Do not assume compulsory gear until the specific event publishes it; leather expression is welcome and consent rules are essential.","host_inclusivity":"Utah Pride Center recognises the event on its official local-Pride calendar, but final host policy must supply the operational detail.","source_urls":["https://utahpride.org/local-prides"],"research_status":"official_date_verified_details_pending","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Folsom Street Fair 2026","aliases":["Folsom Street Fair","Folsom 2026"],
    "city":"san_francisco","date":"2026-09-27","start_date":"2026-09-27","end_date":"2026-09-27",
    "description":"Folsom Street confirms its flagship leather, kink and alternative-sexuality street fair for 27 September in San Francisco's South of Market district.",
    "link":"https://www.folsomstreet.org/","ticket_url":"https://www.folsomstreet.org/","location":"Folsom Street, South of Market, San Francisco, CA, United States","lat":37.77550,"lng":-122.40850,
    "vibe":"mass outdoor leather and kink fair combining queer history, performance and adult expression","vibe_tags":["leather","kink","fetish","street fair","queer"],
    "intel":{"entry_wait":"Public street access still involves perimeter controls, donations and dense transit; official afterparties ticket separately.","best_arrival":"Arrive earlier for easier circulation and vendor access; later afternoon is denser and more performance-focused.","crowd_mix":"Leather, kink, LGBTQ+, sex-positive, fetish, bear, trans, local and international communities mix with curious visitors.","dress_code":"Street clothes are allowed while leather and fetish expression are central; public-nudity law, consent and no-unasked-photo etiquette apply.","host_inclusivity":"Folsom Street is a queer-rooted nonprofit event organiser; inclusion requires respecting consent, community history and adult boundaries.","source_urls":["https://www.folsomstreet.org/"],"research_status":"official_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"End of Summer Blue Weekend 2026","aliases":["Blue Weekend Saugatuck 2026"],
    "city":"saugatuck","date":"2026-08-28","start_date":"2026-08-28","end_date":"2026-08-30",
    "description":"Saugatuck's official LGBTQ+ destination guide confirms the Dunes Resort's End of Summer Blue Weekend for 28–30 August.",
    "link":"https://saugatuck.com/lgbtq/","ticket_url":"https://www.dunesresort.com/","location":"The Dunes Resort, 333 Blue Star Highway, Douglas, MI 49406, United States","lat":42.63870,"lng":-86.21100,
    "vibe":"resort-closing queer weekend with pool, dancing and Great Lakes summer energy","vibe_tags":["gay resort","dance","pool","weekend"],
    "intel":{"entry_wait":"Hotel guests and day visitors can have different access; check Dunes wristband, cover, ID and pool policies before arrival.","best_arrival":"Arrive before the main evening surge and secure lodging or a sober ride because regional transport is limited late at night.","crowd_mix":"Gay men are prominent alongside wider LGBTQ+ couples, friend groups, resort regulars and Midwest weekend visitors.","dress_code":"Poolwear by day and casual expressive club clothing at night; venue coverage, footwear and age rules still apply.","host_inclusivity":"The Dunes is a long-running LGBTQ+ resort and the event is recognised by Saugatuck's official destination guide.","source_urls":["https://saugatuck.com/lgbtq/","https://www.dunesresort.com/"],"research_status":"official_dmo_and_venue_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"KremFest 2026","aliases":["Krem Fest 2026"],
    "city":"seattle","date":"2026-09-25","start_date":"2026-09-25","end_date":"2026-09-27",
    "description":"Kremwerk's multi-room electronic festival runs from Friday night through Sunday morning, showcasing Pacific Northwest techno and club music inside Seattle's queer nightlife complex.",
    "link":"https://ra.co/events/2476459","ticket_url":"https://ra.co/events/2476459","location":"Kremwerk, 1809 Minor Avenue #10, Seattle, WA 98101, United States","lat":47.61760,"lng":-122.33100,
    "vibe":"multi-room queer-rooted techno and club festival with Pacific Northwest underground focus","vibe_tags":["queer techno","electronic","festival","seattle","21+"],
    "intel":{"entry_wait":"Festival tiers and multi-night credentials vary; headline arrival creates the longest ID, bag and wristband queues.","best_arrival":"Study the room timetable and arrive before the specific artist rather than at the transition peak; plan safe transport after late sets.","crowd_mix":"Queer and trans club communities, techno dancers, artists, PNW electronic fans and visiting nightlife audiences overlap.","dress_code":"Expressive dancewear and practical layers fit; no festival-wide mandatory fashion code is published, and consent remains essential.","host_inclusivity":"Kremwerk is identified by Seattle's official tourism material as a queer venue and programs community-rooted electronic nightlife year-round.","source_urls":["https://ra.co/events/2476459","https://visitseattle.org/things-to-do/nightlife/kremwerk/"],"research_status":"ticketing_plus_dmo_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Pride Night: A Chorus Line","aliases":["A Chorus Line Pride Night Seattle 2026"],
    "city":"seattle","date":"2026-09-20","start_date":"2026-09-20","end_date":"2026-09-20",
    "description":"The 5th Avenue Theatre's official Pride Night programme presents A Chorus Line on 20 September with a dedicated LGBTQ+ community gathering around the performance.",
    "link":"https://www.5thavenue.org/education/community/pride-night/","ticket_url":"https://www.5thavenue.org/education/community/pride-night/","location":"The 5th Avenue Theatre, 1308 5th Avenue, Seattle, WA 98101, United States","lat":47.60900,"lng":-122.33400,
    "vibe":"theatre-led queer social night connecting Broadway performance with community","vibe_tags":["theatre","pride night","culture","community"],
    "intel":{"entry_wait":"Purchase the designated Pride Night performance and allow ordinary theatre ticket and bag-check time; other dates lack the same programme.","best_arrival":"Reach the theatre before the published Pride gathering and curtain so community elements are not missed.","crowd_mix":"LGBTQ+ theatre audiences, performers, subscribers, younger arts fans and allies create a broad seated crowd.","dress_code":"Smart casual or expressive theatre clothing works, with no formal dress requirement; follow theatre bag and accessibility rules.","host_inclusivity":"The 5th Avenue publishes Pride Night as a recurring LGBTQ+ community programme rather than relabelling every performance.","source_urls":["https://www.5thavenue.org/education/community/pride-night/"],"research_status":"official_venue_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Pride Night: The Wizard of Oz","aliases":["Wizard of Oz Pride Night Seattle 2026"],
    "city":"seattle","date":"2026-12-06","start_date":"2026-12-06","end_date":"2026-12-06",
    "description":"The 5th Avenue Theatre's LGBTQ+ Pride Night returns on 6 December for The Wizard of Oz with a dedicated community component around the performance.",
    "link":"https://www.5thavenue.org/education/community/pride-night/","ticket_url":"https://www.5thavenue.org/education/community/pride-night/","location":"The 5th Avenue Theatre, 1308 5th Avenue, Seattle, WA 98101, United States","lat":47.60900,"lng":-122.33400,
    "vibe":"warm queer holiday theatre night with an intergenerational community audience","vibe_tags":["theatre","pride night","holiday","community"],
    "intel":{"entry_wait":"Select the 6 December Pride Night ticket and allow time for theatre entry; regular performances are not interchangeable.","best_arrival":"Arrive before the community gathering and curtain, accounting for downtown holiday traffic and weather.","crowd_mix":"LGBTQ+ theatre lovers, families where permitted by the production, subscribers, performers and allies form a mixed-age audience.","dress_code":"Comfortable theatre or festive clothing works; no formal code is published and winter weather layers are practical.","host_inclusivity":"The theatre's recurring Pride Night series gives the date a specific LGBTQ+ community context backed by the venue.","source_urls":["https://www.5thavenue.org/education/community/pride-night/"],"research_status":"official_venue_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Pride Night: Maybe Happy Ending","aliases":["Maybe Happy Ending Pride Night Seattle 2027"],
    "city":"seattle","date":"2027-07-25","start_date":"2027-07-25","end_date":"2027-07-25",
    "description":"The 5th Avenue Theatre has already scheduled its Pride Night for Maybe Happy Ending on 25 July 2027.",
    "link":"https://www.5thavenue.org/education/community/pride-night/","ticket_url":"https://www.5thavenue.org/education/community/pride-night/","location":"The 5th Avenue Theatre, 1308 5th Avenue, Seattle, WA 98101, United States","lat":47.60900,"lng":-122.33400,
    "vibe":"next-year queer theatre gathering pairing a new musical with community connection","vibe_tags":["theatre","pride night","culture","2027"],
    "intel":{"entry_wait":"Book the designated 25 July Pride Night rather than a regular performance and follow the theatre's later ticket-release details.","best_arrival":"Reach the venue before the published Pride reception and curtain; final times should be reconfirmed closer to July.","crowd_mix":"LGBTQ+ musical-theatre audiences, community guests, subscribers, artists and allies will form a broad seated crowd.","dress_code":"Smart casual or expressive theatre looks work without a formal requirement; summer comfort and venue rules come first.","host_inclusivity":"The date is part of the theatre's official recurring Pride Night programme and is genuinely confirmed for 2027.","source_urls":["https://www.5thavenue.org/education/community/pride-night/"],"research_status":"official_2027_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Werq the World 10 Boston","aliases":["RuPaul's Drag Race Werq The World Boston 2026"],
    "city":"boston","date":"2026-09-18","start_date":"2026-09-18","end_date":"2026-09-18",
    "description":"The tenth-anniversary Werq the World tour brings its large-format RuPaul's Drag Race production to Boston's Orpheum Theatre at 19:00 on 18 September.",
    "link":"https://www.orpheumtheatreboston.com/pages/orpheum-theatre","ticket_url":"https://www.orpheumtheatreboston.com/pages/orpheum-theatre","location":"Orpheum Theatre, 1 Hamilton Place, Boston, MA 02108, United States","lat":42.35660,"lng":-71.06140,
    "vibe":"high-camp arena-scale drag production with polished touring spectacle","vibe_tags":["drag","theatre","tour","queer culture"],
    "intel":{"entry_wait":"Use official venue ticketing and allow time for theatre scanning, bag rules and the concentrated pre-19:00 arrival.","best_arrival":"Reach the Orpheum before 18:30 so Downtown transport and security do not cut into the 19:00 performance.","crowd_mix":"Drag Race fans, LGBTQ+ audiences, younger adults, theatre visitors and allies form a large enthusiastic seated crowd.","dress_code":"Expressive drag-inspired or everyday theatre clothing works; no compulsory look is published and venue bag rules apply.","host_inclusivity":"The production features queer drag artists and a sustained LGBTQ+ audience, while the Orpheum controls physical access and ticketing.","source_urls":["https://www.orpheumtheatreboston.com/pages/orpheum-theatre"],"research_status":"official_venue_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Tracks First Friday: September 2026","aliases":["First Friday September at Tracks"],
    "city":"denver","date":"2026-09-04","start_date":"2026-09-04","end_date":"2026-09-05",
    "description":"Tracks presents its September First Friday as Denver's premier monthly lesbian night on 4 September, with 21+ club programming into Saturday morning.",
    "link":"https://tracksdenver.com/home/","ticket_url":"https://tracksdenver.com/home/","location":"Tracks Denver, 3500 Walnut Street, Denver, CO 80205, United States","lat":39.76680,"lng":-104.97620,
    "vibe":"large sapphic club night with dancing, drag-adjacent energy and established local ritual","vibe_tags":["lesbian","sapphic","dance","lgbtq club","21+"],
    "intel":{"entry_wait":"Bring valid ID and use the venue's official ticket link; monthly First Friday demand can create a stronger line than ordinary nights.","best_arrival":"Arrive near doors for easier entry and space before the main dance-floor wave builds later in the evening.","crowd_mix":"Lesbian, bisexual and queer women, non-binary guests, sapphic friend groups and respectful LGBTQ+ clubgoers are centred.","dress_code":"Expressive dance-ready clothing fits and no mandatory theme is published; practical shoes and secure belongings help in a large club.","host_inclusivity":"Tracks explicitly identifies the programme as Denver's monthly lesbian night inside a longstanding LGBTQ+ nightclub.","source_urls":["https://tracksdenver.com/home/"],"research_status":"official_venue_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Mile High Babe2Babe 2026","aliases":["Babe2Babe at The Black Box Denver"],
    "city":"denver","date":"2026-09-10","start_date":"2026-09-10","end_date":"2026-09-11",
    "description":"Bass n Babes and Spella & Friends bring an all-women bass lineup to The Black Box from 21:00–01:00, explicitly amplifying queer, femme and underrepresented electronic artists.",
    "link":"https://www.bassnbabes.com/bassnbabesevents","ticket_url":"https://www.bassnbabes.com/bassnbabesevents","location":"The Black Box, 314 E 13th Avenue, Denver, CO 80203, United States","lat":39.73670,"lng":-104.98260,
    "vibe":"queer and femme bass night spanning dubstep, UKG, drum and bass and experimental low end","vibe_tags":["queer electronic","bass","femme","dnb","18+"],
    "intel":{"entry_wait":"Presale uses the organiser's access code and the event is 18+; bring valid ID and allow standard venue security time.","best_arrival":"Arrive before 21:00 for the complete back-to-back lineup and easier entry before the midnight bass crowd peaks.","crowd_mix":"Queer and femme DJs, women producers, LGBTQ+ bass fans and underrepresented electronic-music communities are centred.","dress_code":"Comfortable rave and dance clothing works without a published costume threshold; hearing protection is strongly practical.","host_inclusivity":"Bass n Babes explicitly creates safer queer spaces and uplifts femme and underrepresented DJs and producers.","source_urls":["https://www.bassnbabes.com/bassnbabesevents","https://www.blackboxdenver.co/"],"research_status":"official_organiser_and_venue_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"OURfest Philadelphia 2026","aliases":["OURfest 2026","Philadelphia National Coming Out Day Festival 2026","OutFest Philadelphia 2026"],
    "city":"philadelphia","date":"2026-10-09","start_date":"2026-10-09","end_date":"2026-10-11",
    "description":"Philadelphia's National Coming Out Day festival runs 9–11 October, culminating in a free 11 October parade, festival and resource fair across the Gayborhood.",
    "link":"https://phillygaycalendar.com/ourfest/","ticket_url":"https://phillygaycalendar.com/ourfest/","location":"Gayborhood, Washington Square West, Philadelphia, PA, United States","lat":39.94790,"lng":-75.16180,
    "vibe":"three-day Coming Out celebration joining protest, parade, parties and community resources","vibe_tags":["pride","coming out day","parade","festival","community"],
    "intel":{"entry_wait":"The Sunday public festival is free while independent parties ticket separately; street closures and security create the main friction.","best_arrival":"Choose Friday, Saturday or Sunday's distinct format and arrive before the parade or specific party rather than treating the weekend as one gate.","crowd_mix":"LGBTQ+ Philadelphians, families, activists, Gayborhood businesses, performers, visitors and allies gather across multiple formats.","dress_code":"Weather-ready Pride clothing fits the street festival; independent nightlife events may publish their own theme or age rule.","host_inclusivity":"OURfest commemorates National Coming Out Day through an explicitly LGBTQ+ parade, festival and resource programme.","source_urls":["https://phillygaycalendar.com/ourfest/"],"research_status":"official_community_calendar_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"LOLGBT+ #STFU Series – Fall 2026","aliases":["LOLGBT Presents STFU 2026"],
    "city":"sacramento","date":"2026-08-28","start_date":"2026-08-28","end_date":"2026-10-02",
    "description":"Visit Sacramento's official LGBTQ+ event feed lists LOLGBT+'s drag lip-sync and stand-up comedy series at STAB! Comedy Theater from 28 August through 2 October.",
    "link":"https://www.visitsacramento.com/plan/lgbtq/events/","ticket_url":"https://www.visitsacramento.com/plan/lgbtq/events/","location":"STAB! Comedy Theater, 1710 Broadway, Sacramento, CA 95818, United States","lat":38.56080,"lng":-121.48940,
    "vibe":"compact queer comedy series mixing stand-up, drag lip-sync and local performance","vibe_tags":["queer comedy","drag","series","local"],
    "intel":{"entry_wait":"Each performance date may ticket separately; use the live venue listing instead of assuming one series ticket covers the full range.","best_arrival":"Select the exact show date and arrive before seating because a small comedy room has limited late-entry flexibility.","crowd_mix":"Queer comedians, drag artists, LGBTQ+ locals, comedy audiences and supportive friends form an intimate performance crowd.","dress_code":"Casual audience clothing works and no formal code is published; performers may use more expressive stage presentation.","host_inclusivity":"The programme is queer-produced and appears in Visit Sacramento's dedicated LGBTQ+ calendar, with the venue hosting the series.","source_urls":["https://www.visitsacramento.com/plan/lgbtq/events/"],"research_status":"official_dmo_series_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Out at the Museum San Diego 2026","aliases":["San Diego Pride Out at the Museum 2026"],
    "city":"san_diego","date":"2026-10-16","start_date":"2026-10-16","end_date":"2026-10-16",
    "description":"San Diego Pride's Art of Pride programme brings queer art, live music, performance and a silent auction to MCASD La Jolla at 18:00 on 16 October.",
    "link":"https://sdpride.org/event/out-at-the-museum/","ticket_url":"https://sdpride.org/event/out-at-the-museum/","location":"Museum of Contemporary Art San Diego, 700 Prospect Street, La Jolla, CA 92037, United States","lat":32.84440,"lng":-117.27840,
    "vibe":"premium queer museum night blending art, performance, community and fundraising","vibe_tags":["queer art","museum","pride","fundraiser","21+"],
    "intel":{"entry_wait":"Tickets start at thirty dollars and the event is 21+; bring valid ID and allow time for museum entry and check-in.","best_arrival":"Reach MCASD before the 18:00 start to experience installations and performances before the evening audience consolidates.","crowd_mix":"Queer artists, advocates, museum audiences, LGBTQ+ donors, performers and San Diego community members share the event.","dress_code":"The published theme is 'Inspire or Be Inspired' and guests are invited to be the muse; expressive art-led looks are encouraged.","host_inclusivity":"Art of Pride is a San Diego Pride programme that explicitly centres queer expression and directs fundraising back to community arts.","source_urls":["https://sdpride.org/event/out-at-the-museum/"],"research_status":"official_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"San Diego Latine Pride 2026","aliases":["Latine Pride 2026"],
    "city":"san_diego","date":"2026-10-24","start_date":"2026-10-24","end_date":"2026-10-24",
    "description":"The San Diego LGBTQ+ Latine Coalition presents its sixth official Queer Latine Pride from 14:00–19:00 at Liberty Station on 24 October.",
    "link":"https://sdpride.org/event/latine-pride-2026/","ticket_url":"https://sdpride.org/event/latine-pride-2026/","location":"Liberty Station Central Promenade, 2641 Truxtun Road, San Diego, CA 92106, United States","lat":32.73520,"lng":-117.21420,
    "vibe":"joyful all-ages Queer Latine Pride with music, food, vendors and resources","vibe_tags":["latine queer","pride","community","all ages","outdoor"],
    "intel":{"entry_wait":"The official listing presents an all-ages community event; parking and midday arrivals are likely larger constraints than a club-style queue.","best_arrival":"Arrive near 14:00 for the complete five-hour programme and easier access to community resources before performances peak.","crowd_mix":"Queer Latine people and families are centred, alongside LGBTQ+ community organisations, performers, vendors and respectful allies.","dress_code":"Weather-ready Pride clothing and comfortable shoes fit the promenade; no formal appearance code applies.","host_inclusivity":"The LGBTQ+ Latine Coalition explicitly creates the event for Queer Latinidad with San Diego Pride's official support.","source_urls":["https://sdpride.org/event/latine-pride-2026/"],"research_status":"official_schedule_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Haus of Codec Drag Trivia at Moniker – September 2026","aliases":["Drag Trivia with Ladda Nurv at Moniker September 2026"],
    "city":"providence","date":"2026-09-02","start_date":"2026-09-02","end_date":"2026-09-02",
    "description":"Ladda Nurv hosts four rounds of drag trivia at Moniker Brewery from 19:00–21:00 on 2 September, raising funds for Haus of Codec's LGBTQIA+ youth housing mission.",
    "link":"https://www.goprovidence.com/event/drag-trivia-with-host-ladda-nurv-at-moniker-brewery/53413/","ticket_url":"https://www.hausofcodec.org/events","location":"Moniker Brewery, 432 W Fountain Street, Providence, RI 02903, United States","lat":41.81780,"lng":-71.42160,
    "vibe":"friendly queer fundraiser mixing drag, trivia, dancing and community purpose","vibe_tags":["drag","trivia","fundraiser","community"],
    "intel":{"entry_wait":"Registration is ten dollars and strongly encouraged; doors open at 18:30 before trivia begins at 19:00.","best_arrival":"Arrive between 18:30 and 18:45 to register, form a team and order before the first round.","crowd_mix":"LGBTQ+ locals, drag fans, trivia teams, Haus of Codec supporters and brewery guests form a social mixed crowd.","dress_code":"Casual brewery clothing works and no theme is required; expressive drag-fan looks are welcome.","host_inclusivity":"Proceeds support Haus of Codec's work ending homelessness among LGBTQIA+ people aged 18–24.","source_urls":["https://www.goprovidence.com/event/drag-trivia-with-host-ladda-nurv-at-moniker-brewery/53413/","https://www.hausofcodec.org/events"],"research_status":"organiser_and_dmo_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Haus of Codec Drag Trivia at Black Sheep – September 2026","aliases":["Drag Trivia with Ladda Nurv at Black Sheep September 2026"],
    "city":"providence","date":"2026-09-16","start_date":"2026-09-16","end_date":"2026-09-16",
    "description":"Black Sheep hosts Ladda Nurv's drag trivia from 19:00–21:00 on 16 September, with music, lip-sync and a fundraiser for Haus of Codec.",
    "link":"https://www.visitrhodeisland.com/event/drag-trivia-with-host-ladda-nurv-at-black-sheep-providence/108134/","ticket_url":"https://www.hausofcodec.org/events","location":"Black Sheep Providence, 397 Westminster Street, Providence, RI 02903, United States","lat":41.82140,"lng":-71.41670,
    "vibe":"downtown queer drag trivia combining play, performance and youth-housing support","vibe_tags":["drag","trivia","fundraiser","community"],
    "intel":{"entry_wait":"Ten-dollar preregistration is strongly encouraged; doors open at 18:30 and trivia starts at 19:00.","best_arrival":"Reach Black Sheep shortly after 18:30 for registration, food and team setup before four rounds begin.","crowd_mix":"Queer Providence locals, drag audiences, trivia groups, youth-housing supporters and restaurant guests mix.","dress_code":"Everyday restaurant and bar clothing fits; no compulsory drag or trivia theme is published.","host_inclusivity":"Haus of Codec presents the night to fund its explicit LGBTQIA+ youth homelessness mission.","source_urls":["https://www.visitrhodeisland.com/event/drag-trivia-with-host-ladda-nurv-at-black-sheep-providence/108134/","https://www.hausofcodec.org/events"],"research_status":"organiser_and_dmo_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Haus of Codec Drag Trivia at Moniker – October 2026","aliases":["Drag Trivia with Ladda Nurv at Moniker October 2026"],
    "city":"providence","date":"2026-10-07","start_date":"2026-10-07","end_date":"2026-10-07",
    "description":"Haus of Codec's first-Wednesday drag trivia returns to Moniker Brewery from 19:00–21:00 on 7 October with Ladda Nurv.",
    "link":"https://www.goprovidence.com/event/drag-trivia-with-host-ladda-nurv-at-moniker-brewery/53413/","ticket_url":"https://www.hausofcodec.org/events","location":"Moniker Brewery, 432 W Fountain Street, Providence, RI 02903, United States","lat":41.81780,"lng":-71.42160,
    "vibe":"recurring queer fundraiser with drag performance, trivia and brewery conversation","vibe_tags":["drag","trivia","fundraiser","community"],
    "intel":{"entry_wait":"Preregistration costs ten dollars and is encouraged; doors open thirty minutes before the 19:00 start.","best_arrival":"Arrive by 18:45 to register and settle with a team before the first round begins.","crowd_mix":"LGBTQ+ community members, drag fans, trivia regulars, brewery visitors and Haus of Codec supporters attend.","dress_code":"Casual autumn brewery clothing works; there is no formal appearance or costume requirement.","host_inclusivity":"The recurring event directly benefits affirming housing work for LGBTQIA+ young adults through Haus of Codec.","source_urls":["https://www.goprovidence.com/event/drag-trivia-with-host-ladda-nurv-at-moniker-brewery/53413/","https://www.hausofcodec.org/events"],"research_status":"organiser_and_dmo_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Haus of Codec Drag Trivia at Black Sheep – October 2026","aliases":["Drag Trivia with Ladda Nurv at Black Sheep October 2026"],
    "city":"providence","date":"2026-10-21","start_date":"2026-10-21","end_date":"2026-10-21",
    "description":"The Black Sheep edition of Haus of Codec's drag trivia runs 19:00–21:00 on 21 October with Ladda Nurv and a cash prize.",
    "link":"https://www.visitrhodeisland.com/event/drag-trivia-with-host-ladda-nurv-at-black-sheep-providence/108134/","ticket_url":"https://www.hausofcodec.org/events","location":"Black Sheep Providence, 397 Westminster Street, Providence, RI 02903, United States","lat":41.82140,"lng":-71.41670,
    "vibe":"playful downtown drag trivia supporting queer young adults in Providence","vibe_tags":["drag","trivia","fundraiser","community"],
    "intel":{"entry_wait":"Ten-dollar advance registration is recommended, with doors at 18:30 for the 19:00 competition.","best_arrival":"Arrive during the half-hour door window to organise a team and avoid interrupting the opening round.","crowd_mix":"Queer locals, trivia groups, drag audiences, restaurant visitors and Haus of Codec donors create a welcoming room.","dress_code":"Casual night-out clothing suits the restaurant-bar setting and no event costume is mandatory.","host_inclusivity":"The organiser is an LGBTQIA+ youth housing nonprofit and the event's proceeds support that mission.","source_urls":["https://www.visitrhodeisland.com/event/drag-trivia-with-host-ladda-nurv-at-black-sheep-providence/108134/","https://www.hausofcodec.org/events"],"research_status":"organiser_and_dmo_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Haus of Codec Drag Trivia at Moniker – November 2026","aliases":["Drag Trivia with Ladda Nurv at Moniker November 2026"],
    "city":"providence","date":"2026-11-04","start_date":"2026-11-04","end_date":"2026-11-04",
    "description":"Ladda Nurv's first-Wednesday Moniker Brewery fundraiser returns from 19:00–21:00 on 4 November for Haus of Codec.",
    "link":"https://www.goprovidence.com/event/drag-trivia-with-host-ladda-nurv-at-moniker-brewery/53413/","ticket_url":"https://www.hausofcodec.org/events","location":"Moniker Brewery, 432 W Fountain Street, Providence, RI 02903, United States","lat":41.81780,"lng":-71.42160,
    "vibe":"community-minded drag trivia with prizes, music and queer nonprofit support","vibe_tags":["drag","trivia","fundraiser","community"],
    "intel":{"entry_wait":"Register in advance for ten dollars where possible; doors open at 18:30 and trivia begins at 19:00.","best_arrival":"Be seated by 18:45 to form a team and order before the timed rounds start.","crowd_mix":"LGBTQ+ Providence residents, drag fans, trivia teams, brewery regulars and nonprofit supporters attend.","dress_code":"Comfortable casual layers suit the brewery and there is no event-specific dress threshold.","host_inclusivity":"All editions raise funds for Haus of Codec's housing and stability work with LGBTQIA+ young adults.","source_urls":["https://www.goprovidence.com/event/drag-trivia-with-host-ladda-nurv-at-moniker-brewery/53413/","https://www.hausofcodec.org/events"],"research_status":"organiser_and_dmo_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Haus of Codec Drag Trivia at Black Sheep – November 2026","aliases":["Drag Trivia with Ladda Nurv at Black Sheep November 2026"],
    "city":"providence","date":"2026-11-18","start_date":"2026-11-18","end_date":"2026-11-18",
    "description":"Haus of Codec and Ladda Nurv return to Black Sheep for drag trivia from 19:00–21:00 on 18 November.",
    "link":"https://www.visitrhodeisland.com/event/drag-trivia-with-host-ladda-nurv-at-black-sheep-providence/108134/","ticket_url":"https://www.hausofcodec.org/events","location":"Black Sheep Providence, 397 Westminster Street, Providence, RI 02903, United States","lat":41.82140,"lng":-71.41670,
    "vibe":"midweek queer entertainment with drag, competition and a direct community benefit","vibe_tags":["drag","trivia","fundraiser","community"],
    "intel":{"entry_wait":"The ten-dollar event recommends preregistration; use the 18:30 doors before the 19:00 first round.","best_arrival":"Arrive between 18:30 and 18:45 for team organisation and smoother restaurant service.","crowd_mix":"Drag supporters, queer locals, trivia competitors, allies and Haus of Codec donors share the downtown venue.","dress_code":"Relaxed bar and restaurant attire works with no published theme or compulsory drag presentation.","host_inclusivity":"The event's financial purpose is supporting an LGBTQIA+ youth homelessness organisation based in Providence.","source_urls":["https://www.visitrhodeisland.com/event/drag-trivia-with-host-ladda-nurv-at-black-sheep-providence/108134/","https://www.hausofcodec.org/events"],"research_status":"organiser_and_dmo_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Haus of Codec Drag Trivia at Moniker – December 2026","aliases":["Drag Trivia with Ladda Nurv at Moniker December 2026"],
    "city":"providence","date":"2026-12-02","start_date":"2026-12-02","end_date":"2026-12-02",
    "description":"The final published 2026 Moniker Brewery drag trivia meets from 19:00–21:00 on 2 December in support of Haus of Codec.",
    "link":"https://www.goprovidence.com/event/drag-trivia-with-host-ladda-nurv-at-moniker-brewery/53413/","ticket_url":"https://www.hausofcodec.org/events","location":"Moniker Brewery, 432 W Fountain Street, Providence, RI 02903, United States","lat":41.81780,"lng":-71.42160,
    "vibe":"warm year-end queer trivia fundraiser with drag hosting and brewery sociability","vibe_tags":["drag","trivia","fundraiser","holiday"],
    "intel":{"entry_wait":"Ten-dollar preregistration is encouraged and doors open at 18:30 ahead of the 19:00 round.","best_arrival":"Reach Moniker by 18:45 for team setup and service before the timed competition begins.","crowd_mix":"Queer locals, holiday friend groups, drag and trivia fans, brewery guests and youth-housing supporters gather.","dress_code":"Casual or festive winter clothing works; no compulsory holiday or drag costume is published.","host_inclusivity":"Haus of Codec uses the recurring event to fund affirming housing support for LGBTQIA+ people aged 18–24.","source_urls":["https://www.goprovidence.com/event/drag-trivia-with-host-ladda-nurv-at-moniker-brewery/53413/","https://www.hausofcodec.org/events"],"research_status":"organiser_and_dmo_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"Haus of Codec Drag Trivia at Black Sheep – December 2026","aliases":["Drag Trivia with Ladda Nurv at Black Sheep December 2026"],
    "city":"providence","date":"2026-12-16","start_date":"2026-12-16","end_date":"2026-12-16",
    "description":"Black Sheep hosts the final listed 2026 Ladda Nurv drag trivia fundraiser from 19:00–21:00 on 16 December.",
    "link":"https://www.visitrhodeisland.com/event/drag-trivia-with-host-ladda-nurv-at-black-sheep-providence/108134/","ticket_url":"https://www.hausofcodec.org/events","location":"Black Sheep Providence, 397 Westminster Street, Providence, RI 02903, United States","lat":41.82140,"lng":-71.41670,
    "vibe":"festive downtown drag trivia closing the fundraiser series with queer community warmth","vibe_tags":["drag","trivia","fundraiser","holiday"],
    "intel":{"entry_wait":"Advance ten-dollar registration is advised; doors open at 18:30 before the 19:00 event.","best_arrival":"Arrive early in the door window for team setup, food and a smooth start to four rounds.","crowd_mix":"LGBTQ+ community members, holiday groups, drag audiences, trivia players and Haus of Codec supporters attend.","dress_code":"Casual or festive bar clothing fits; there is no mandatory theme in the official listing.","host_inclusivity":"The night supports Haus of Codec's explicit mission to end homelessness among LGBTQIA+ young adults.","source_urls":["https://www.visitrhodeisland.com/event/drag-trivia-with-host-ladda-nurv-at-black-sheep-providence/108134/","https://www.hausofcodec.org/events"],"research_status":"organiser_and_dmo_verified","updated_at":"2026-08-28T00:00:00Z"}
  },
  {
    "name":"PRIDEtoberfest DC 2026","aliases":["DC PRIDEtoberfest 2026"],
    "city":"washington_dc","date":"2026-10-03","start_date":"2026-10-03","end_date":"2026-10-03",
    "description":"PRIDEtoberfest brings an LGBTQ+ Oktoberfest celebration to Wunder Garten on 3 October, confirmed by Washington's official destination calendar.",
    "link":"https://washington.org/event/pridetoberfest","ticket_url":"https://washington.org/event/pridetoberfest","location":"Wunder Garten, 1101 First Street NE, Washington, DC 20002, United States","lat":38.90450,"lng":-77.00580,
    "vibe":"open-air queer autumn social mixing beer-garden ease with Pride performance","vibe_tags":["pride","oktoberfest","outdoor","community"],
    "intel":{"entry_wait":"Check the official event listing for registration, age and drink-service rules; the beer garden can fill during headline periods.","best_arrival":"Arrive near the published opening for easier seating and community programming before the strongest evening crowd.","crowd_mix":"LGBTQ+ Washingtonians, friend groups, performers, beer-garden regulars, visitors and allies form a casual social audience.","dress_code":"Casual autumn layers or playful Oktoberfest and Pride looks work; no compulsory costume is published.","host_inclusivity":"The event is explicitly LGBTQ+ and independently confirmed on Destination DC's official event calendar.","source_urls":["https://washington.org/event/pridetoberfest"],"research_status":"official_dmo_date_verified","updated_at":"2026-08-28T00:00:00Z"}
  }
]
$qa_us_future_events$) e(
    name text, aliases jsonb, city text, date date, start_date date, end_date date,
    description text, link text, ticket_url text, location text,
    lat double precision, lng double precision, vibe text, vibe_tags text[], intel jsonb
  )
), matched as (
  select s.*, e.id as existing_id
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
  ) e on true
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
      -- Event tags are deliberately left empty in this import. The production
      -- constraint is older than the repository taxonomy, and empty arrays are
      -- valid under every version of the subset/max-three constraints. A later
      -- schema-aligned backfill can classify them without risking this import.
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

-- Guardrail: fail and roll back if this migration itself produced more than one
-- future row for the same city, canonicalised name and start date.
do $qa_no_new_event_duplicates$
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
    raise exception 'Future event duplicate detected; transaction rolled back.';
  end if;
end;
$qa_no_new_event_duplicates$;

commit;
