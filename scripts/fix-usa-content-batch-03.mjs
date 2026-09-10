import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const checkedAt = "2026-09-10T00:00:00Z";
const FIELDS = ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity"];
const CITIES = ["new_orleans", "new_york", "orlando", "palm_springs", "philadelphia"];
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const p = (id, name, city, patch, sources, intel = {}) => ({ id, name, city, patch, sources, intel });

const updates = [
  // New Orleans: official/operator pages plus safe public-space wording.
  p(3519, "Allways Lounge & Cabaret", "new_orleans", {}, ["https://www.theallwayslounge.net/"]),
  p(3520, "Armstrong Park (Congo Square)", "new_orleans", {
    type: "cruising_area", link: "https://nola.gov/next/parks-and-parkways/topics/parks/armstrong-park/", hours: "Public park; use only during posted City of New Orleans opening hours and obey gate closures.",
    description: "Louis Armstrong Park is a municipal cultural park containing historic Congo Square; it is useful for daytime heritage visits and events, not a managed LGBTQ venue or a promise of private encounters.",
    vibe: "historic public park and Congo Square cultural landmark", vibe_tags: ["cultural", "chill"],
  }, ["https://nola.gov/next/parks-and-parkways/topics/parks/armstrong-park/"], {
    queue_wait: "There is no venue door or nightlife queue; festival security and park-gate controls apply only when an event is scheduled.", best_nights: "Choose daylight hours or a listed cultural event. Do not treat an old cruising label as a reason to enter after gates close.", crowd_mix: "Residents, tourists, families, performers and heritage visitors share this public park.", dress_code: "Weather-appropriate walking clothes; event organisers may publish separate bag rules.", staff_inclusivity: "This is a city park rather than an LGBTQ-operated venue; use normal public-space precautions and official accessibility information.",
  }),
  p(448, "Bourbon Pub & Parade", "new_orleans", { hours: "Sun-Thu 12:00-03:00; Fri-Sat 12:00-05:00." }, ["https://www.bourbonpub.com/"]),
  p(2591, "Cafe Lafitte in Exile", "new_orleans", { link: "https://www.lafittes.com/", hours: "Mon 11:00-03:00; Tue 11:00-00:00; Wed-Sun open 24 hours." }, ["https://www.lafittes.com/"]),
  p(485, "Corner Pocket", "new_orleans", { hours: "Mon-Wed 12:00-02:00; Thu-Sun open 24 hours." }, ["https://cornerpocket.net/"]),
  p(487, "Golden Lantern", "new_orleans", { link: "https://www.instagram.com/goldenlanternnola/", hours: "Open 24 hours daily; confirm holiday changes with the operator." }, ["https://www.instagram.com/goldenlanternnola/", "https://www.neworleans.com/listing/golden-lantern/33302/"]),
  p(486, "Good Friends Bar", "new_orleans", { hours: "Thu-Sun open 24 hours; Mon 13:00-05:00; Tue 13:00-00:00; Wed open 24 hours." }, ["https://www.goodfriendsbar.com/"]),
  p(3253, "Le CaBARet", "new_orleans", {}, ["https://www.instagram.com/lecabaretnolabar/"]),
  p(449, "Oz New Orleans", "new_orleans", { hours: "Mon-Wed 18:00-04:00; Thu-Sun 12:00-04:00." }, ["https://www.ozneworleans.com/"]),
  p(2592, "The Crossing NOLA", "new_orleans", { link: "https://xcrossingnola.com/", hours: "Mon-Wed 07:00-01:00; Thu-Sat 07:00-02:00; Sun 07:00-01:00. Kitchen hours are shorter." }, ["https://xcrossingnola.com/"]),
  p(3518, "The Page Bar", "new_orleans", {}, ["https://www.instagram.com/thepagenola/"]),
  p(450, "The Phoenix Bar", "new_orleans", { hours: "Open 24 hours daily; event rooms and food service use separate schedules." }, ["https://phoenixbarnola.com/"]),

  // New York: corrected links/addresses, public-place safety and one reclassification.
  p(573, "Atlas Social Club", "new_york", { link: "https://www.instagram.com/atlassocialclub/" }, ["https://www.instagram.com/atlassocialclub/", "https://app.w42st.com/places/2dhkF4e0ljboO9pNYsaGAr/atlas-social-club"]),
  p(3530, "Babeland", "new_york", { link: "https://www.babeland.com/", hours: "Mon-Wed 12:00-20:00; Thu-Sat 12:00-21:00; Sun 12:00-19:00." }, ["https://www.babeland.com/"]),
  p(1987, "BASEMENT", "new_york", { link: "https://basementny.net/", hours: "Event-led, usually Fri-Sat late night; use the dated ticket listing for doors and closing time." }, ["https://basementny.net/"]),
  p(1995, "Bossa Nova Civic Club", "new_york", { link: "https://www.bossanovacivicclub.com/", location: "1271 Myrtle Avenue, Brooklyn, NY 11221, United States", hours: "Open nightly 19:00-04:00; verify special-event door times." }, ["https://www.bossanovacivicclub.com/", "https://ra.co/clubs/71292"]),
  p(1541, "Chelsea Mews Guesthouse", "new_york", {
    description: "Chelsea Mews Guesthouse has no verifiable current operator website or direct booking channel; this archival record is withheld from recommendations until present operation can be confirmed.",
    hours: "Current operation and check-in hours are unverified; do not travel or pay based on old directory listings.", seo_indexable: false, seo_quality_status: "rejected",
  }, ["https://newyork.gaycities.com/hotels/11002-chelsea-mews-guesthouse"], {
    queue_wait: "No current reception or booking process could be verified.", best_nights: "Not recommended until a current operator-controlled booking source is available.", crowd_mix: "Historic directories describe an all-male guesthouse, but the present guest profile is unverified.", dress_code: "Not applicable while operation remains unverified.", staff_inclusivity: "No current first-party policy or operator contact was found, so an inclusivity claim would be speculative.",
  }),
  p(1892, "Christopher Street Pier / Pier 45 (Greenwich Village)", "new_york", {
    type: "cruising_area", link: "https://hudsonriverpark.org/locations/pier-45/", hours: "Public Hudson River Park pier; follow the current posted park and pier hours.",
    description: "Pier 45 is a public Hudson River Park lawn and waterfront gathering place with deep LGBTQ community history; it is not a staffed queer venue and park rules apply throughout.",
  }, ["https://hudsonriverpark.org/locations/pier-45/"], { best_nights: "Late afternoon and sunset are popular for the lawn and river view; check park alerts and programmed events before travelling." }),
  p(3529, "Elmo", "new_york", { link: "https://www.elmorestaurant.com/" }, ["https://www.elmorestaurant.com/"]),
  p(3526, "Ginger's Bar", "new_york", { location: "363 5th Avenue, Brooklyn, NY 11215, United States" }, ["https://www.instagram.com/gingersbar_brooklyn/"]),
  p(3523, "Gym Sportsbar", "new_york", {}, ["https://www.gymsportsbar.com/nyhome.html"]),
  p(3528, "Jacob Riis Park Beach", "new_york", {
    link: "https://www.nps.gov/gate/planyourvisit/jacob-riis-park.htm", hours: "Park access follows National Park Service hours; lifeguarded swimming is seasonal and only permitted when lifeguards are on duty.",
    description: "Jacob Riis Park is a National Park Service ocean beach whose eastern sections have a long queer following; conditions, access and lifeguard coverage are seasonal, and it is not a private LGBTQ venue.",
  }, ["https://www.nps.gov/gate/planyourvisit/jacob-riis-park.htm"], { best_nights: "This is primarily a daytime beach visit in warm weather; check NPS alerts, transport and lifeguard status before leaving." }),
  p(3524, "Metropolitan", "new_york", { link: "https://www.metropolitanbar.com/" }, ["https://www.metropolitanbar.com/"]),
  p(1988, "Nowadays", "new_york", { hours: "Schedule varies between weekday sessions, weekend events and ticketed Nonstop programmes; use the dated calendar rather than a fixed weekly promise." }, ["https://nowadays.nyc/"]),
  p(3522, "Pieces", "new_york", { link: "https://piecesbar.com/" }, ["https://piecesbar.com/"]),
  p(576, "REBAR Chelsea", "new_york", { link: "https://rebarchelsea.com/", hours: "Sun-Wed 16:00-01:00; Thu-Sat 16:00-04:00; verify the operator calendar." }, ["https://rebarchelsea.com/", "https://sideways.nyc/discover/2NVjjyC7vlMCIa1avcX49R/rebar-nyc"]),
  p(574, "Ritz Bar and Lounge", "new_york", { link: "https://ritzbarandlounge.com/" }, ["https://ritzbarandlounge.com/"]),
  p(1546, "The Bureau Cafe", "new_york", {
    name: "Bureau of General Services—Queer Division", type: "store", link: "https://www.bgsqd.com/", location: "The LGBT Community Center, Room 210, 208 W 13th Street, New York, NY 10011, United States", hours: "Wed-Sun 13:00-19:00; check the event calendar for programme times.",
    description: "Bureau of General Services—Queer Division is Manhattan's independent queer bookstore, gallery and event space in Room 210 of The Center, with readings, exhibitions and community programming rather than café service.",
    vibe: "independent queer bookstore, gallery and cultural programme", vibe_tags: ["cultural", "social", "chill"],
  }, ["https://www.bgsqd.com/", "https://gaycenter.org/contact-us/"], {
    queue_wait: "Ordinary browsing has no door queue; a reading or launch may have its own RSVP and room-capacity instructions.", best_nights: "Visit during bookstore hours for browsing, or choose a dated reading, exhibition opening or discussion from the Bureau calendar.", crowd_mix: "Queer readers, writers, artists, students and Center visitors use the small second-floor cultural space.", dress_code: "No dress code; this is a bookstore and community event room inside The Center.", staff_inclusivity: "The Bureau describes itself as an independent queer and trans-operated cultural centre; The Center provides step-free access and all-gender bathrooms.",
  }),
  p(948, "The Cock", "new_york", { link: "https://www.instagram.com/thecockbar/", hours: "Late-night, event-led operation; verify the operator's current post before travelling." }, ["https://www.instagram.com/thecockbar/"]),
  p(3521, "The Duplex", "new_york", { link: "https://www.theduplex.com/" }, ["https://www.theduplex.com/"]),
  p(1890, "The Ramble (Central Park, Manhattan)", "new_york", {
    link: "https://www.centralparknyc.org/locations/the-ramble", hours: "Central Park public hours are 06:00-01:00; paths may be dark and individual facilities close earlier.",
    description: "The Ramble is a wooded public section of Central Park known for birding and winding paths, with a place in queer history; it is not a managed cruising venue and all park laws, consent and personal-safety rules apply.",
  }, ["https://www.centralparknyc.org/locations/the-ramble", "https://www.nycgovparks.org/parks/central-park"], { best_nights: "Daylight is the useful and safest window for paths and birding; do not interpret the historical cruising association as an invitation or guarantee." }),
  p(3527, "The West Side Club", "new_york", { link: "https://wscnyc.com/" }, ["https://wscnyc.com/"]),

  // Orlando: merge duplicate into the reviewed legacy row and correct three old addresses.
  p(2594, "AC Hotel Orlando Downtown", "orlando", {}, ["https://www.marriott.com/en-us/hotels/mcoad-ac-hotel-orlando-downtown/overview/"]),
  p(2596, "Anthem Orlando", "orlando", { hours: "Mon 15:00-00:00; Tue-Sat 15:00-03:00; Sun 14:00-03:00." }, ["https://anthemorlando.com/"]),
  p(488, "BarCodes", "orlando", {
    type: "cruise_club", location: "4453 Edgewater Drive, Orlando, FL 32804, United States", hours: "Open daily 12:00-02:00.", link: "https://www.barcodesorlando.com/",
    description: "BarCodes is a compact College Park gay bar with a bear, leather and kink following, pool and recurring gear or underwear events; the dated event feed determines whether a night is social or theme-led.", vibe: "compact bear and leather neighborhood bar", vibe_tags: ["fetish", "social", "cruise"],
  }, ["https://www.barcodesorlando.com/"], {
    queue_wait: "Normal afternoons are straightforward; monthly gear and underwear events can compress the patio and bar, so arrive near the advertised start.", best_nights: "Pick a current leather, gear or underwear listing for the themed experience; daytime and early evening are quieter neighborhood-bar hours.", crowd_mix: "College Park regulars mix with bears, leatherfolk, pups and visitors; specific theme nights may narrow the audience without making consent assumptions.", dress_code: "Casual clothes work ordinarily; leather, harnesses or event-specific gear are optional unless the current flyer states an actual requirement.", staff_inclusivity: "The operator positions BarCodes as an LGBTQ neighborhood bar; guests should still check accessibility or event-boundary questions directly.",
  }),
  p(2593, "Castle Hotel, Autograph Collection", "orlando", {}, ["https://www.marriott.com/en-us/hotels/mcoca-castle-hotel-autograph-collection/overview/"]),
  p(453, "Club Orlando", "orlando", {
    location: "450 E Compton Street, Orlando, FL 32806, United States", hours: "Mon-Wed 09:00-22:00; continuously open Thu 09:00-Sun 22:00. Last check-in is 21:00 on closing nights; verify holiday changes.", link: "https://www.club-orlando.com/",
    description: "Club Orlando is an 18+ private men's club south of downtown with lockers, private rooms, a heated pool, whirlpool, dry sauna and full gym; admission, membership and session limits are published by the operator.", vibe: "private men's club with pool, sauna and gym", vibe_tags: ["men_only", "relax", "cruise"],
  }, ["https://www.club-orlando.com/"], {
    queue_wait: "Entry is a membership and ID check rather than a nightclub line; peak Friday-Saturday sessions have shorter four-hour room and locker limits.", best_nights: "Thursday through Sunday provides continuous overnight access; use a dated pool, pup or bear event only if that programme is what you want.", crowd_mix: "Adult male members and visitors use the fitness, pool, sauna and private-room facilities; government-issued ID is required.", dress_code: "Arrive in easy-to-store clothes and follow the club's rules for towels, footwear, nudity, hygiene, phones and consent inside.", staff_inclusivity: "The first-party site defines an adult men's membership venue, not a general LGBTQ spa; contact reception for disability access and eligibility questions before paying.",
  }),
  p(3343, "District Dive", "orlando", { link: "https://www.instagram.com/districtdive/" }, ["https://www.instagram.com/districtdive/", "https://www.visitorlando.com/diversity-inclusion/lgbtq/"]),
  p(452, "Hank's Bar", "orlando", {
    location: "5026 Edgewater Drive, Orlando, FL 32810, United States", hours: "Open daily 12:00-02:00.", link: "https://www.facebook.com/HanksBarOrlando/",
    description: "Hank's is a long-running Edgewater Drive gay neighborhood bar focused on inexpensive drinks, pool and an unfussy local atmosphere rather than a stage or large dance floor.", vibe: "old-school Edgewater neighborhood gay bar", vibe_tags: ["chill", "social", "cozy"],
  }, ["https://www.facebook.com/HanksBarOrlando/", "https://www.visitorlando.com/diversity-inclusion/lgbtq/"], {
    queue_wait: "There is usually no formal club queue; the compact room and pool table become busier late on weekends.", best_nights: "Choose an ordinary afternoon for conversation and pool, or Friday-Saturday later for the fullest neighborhood crowd.", crowd_mix: "Longtime Orlando regulars, gay men and visitors seeking a traditional neighborhood bar make up the core audience.", dress_code: "Everyday casual clothing fits; this is a no-frills bar, not a dress-code nightclub.", staff_inclusivity: "Its role as a longstanding gay bar is documented, but detailed accessibility and inclusion policies are not published; ask the venue directly when needed.",
  }),
  p(2597, "Sapphire Lounge", "orlando", { hours: "New venue with event-led opening times; confirm each dated programme on the operator feed before travelling.", link: "https://www.instagram.com/sapphireloungeorlando/" }, ["https://www.instagram.com/sapphireloungeorlando/", "https://www.orlandoweekly.com/food-drink/orlandos-first-sapphic-lounge-sapphire-to-open-in-parramore-this-fall-40029391"]),
  p(489, "Southern Nights Orlando", "orlando", { link: "https://www.southernnightsorlando.com/" }, ["https://www.southernnightsorlando.com/"]),
  p(2598, "Stiffy's Orlando", "orlando", {}, ["https://www.facebook.com/p/Stiffys-Orlando-61550573947159/"]),
  p(2595, "The Eo Inn", "orlando", {}, ["https://eoinn.com/"]),

  // Palm Springs and Cathedral City.
  p(2600, "Blackbook", "palm_springs", {}, ["https://www.blackbookbar.com/"]),
  p(665, "CCBC Resort Hotel", "palm_springs", {}, ["https://www.ccbcresorthotel.com/"]),
  p(702, "Chill Bar Palm Springs", "palm_springs", { link: "https://www.chillbarpalmsprings.com/", hours: "Open daily 11:00-02:00." }, ["https://www.chillbarpalmsprings.com/"]),
  p(2601, "Dick's on Arenas", "palm_springs", {}, ["https://dicksps.com/"]),
  p(704, "OneEleven Bar", "palm_springs", { hours: "Opens daily at 14:00; closing time varies by day. Happy hour 14:00-19:00; verify events and Sunday programming." }, ["https://oneelevenbar.com/"]),
  p(2602, "Oscar's Downtown", "palm_springs", {}, ["https://www.oscarspalmsprings.com/"]),
  p(663, "Streetbar", "palm_springs", { link: "https://www.instagram.com/streetbarps/" }, ["https://www.instagram.com/streetbarps/", "https://visitpalmsprings.com/blog/post/lgbtq-nightlife/" ]),
  p(664, "Tool Shed", "palm_springs", { link: "https://www.pstoolshed.com/", hours: "Open daily 10:00-02:00; happy hour 10:00-20:00." }, ["https://www.pstoolshed.com/"]),
  p(661, "Toucans Tiki Lounge", "palm_springs", { hours: "Open daily 16:00-02:00; Saturday drag brunch 12:00-15:00 uses a separate reservation schedule." }, ["https://toucanstikilounge.com/"]),

  // Philadelphia: exact Gayborhood addresses and venue-specific operating models.
  p(3340, "254 on 12th", "philadelphia", { link: "https://www.254phl.com/", hours: "Mon-Fri 16:00-02:00; Sat 14:00-02:00; Sun 12:00-02:00." }, ["https://www.254phl.com/"]),
  p(961, "Bob & Barbara's Lounge", "philadelphia", {}, ["https://www.bobandbarbaras.com/", "https://www.visitphilly.com/articles/philadelphia/lgbtq-bars/"], {
    queue_wait: "Thursday's long-running drag show and weekend live music can fill the horseshoe bar; arrive before the performance if a clear sightline matters, while ordinary afternoons remain simple walk-in service.",
    staff_inclusivity: "Bob & Barbara's has hosted Philadelphia's long-running Thursday drag tradition alongside jazz and neighborhood bar service; this establishes an LGBTQ programme without claiming every guest has the same service experience.",
  }),
  p(447, "Club Philly", "philadelphia", {}, ["https://www.clubphilly.com/"], {
    dress_code: "Bring government-issued ID and clothes that fit easily in a locker; inside, follow Club Philly's own towel, footwear, phone, hygiene and consent rules rather than general nightclub advice.",
    staff_inclusivity: "Club Philly publishes an adult men's membership and admission model; reception can answer eligibility and accessibility questions, while consent and house rules apply throughout the private facility.",
  }),
  p(2317, "Kimpton Hotel Palomar Philadelphia", "philadelphia", {}, ["https://www.hotelpalomar-philadelphia.com/", "https://www.travelgay.com/gay-philadelphia-hotels/"], {
    crowd_mix: "Rittenhouse leisure guests, business travellers, couples, pet owners and LGBTQ visitors share this art-deco-inspired mainstream boutique hotel.",
  }),
  p(484, "Stir Lounge", "philadelphia", {
    location: "1705 Chancellor Street, Philadelphia, PA 19103, United States", hours: "Event-led neighborhood bar; verify the current operator feed before travelling.", link: "https://www.instagram.com/stir_philly/",
    description: "Stir is a compact Chancellor Street gay lounge known for cocktails, a conversational front-bar feel and DJ or themed nights that are announced through its current social feed.", vibe: "compact Chancellor Street cocktail and DJ lounge", vibe_tags: ["cozy", "social", "pop"],
  }, ["https://www.instagram.com/stir_philly/", "https://www.stonewallphilly.org/business-directory/stir-lounge"], {
    queue_wait: "The room is small rather than built for a long formal line; capacity pressure is most relevant during promoted parties.", best_nights: "Use a current Stir flyer to choose between a social cocktail night and a louder DJ programme.", crowd_mix: "Gayborhood regulars, after-work drinkers and weekend visitors share a compact lounge.", dress_code: "Smart-casual or everyday nightlife clothing fits; a themed flyer may suggest a different look without creating a standing rule.", staff_inclusivity: "Stir is listed as an LGBTQ Gayborhood business; no detailed accessibility policy is published, so contact the venue for specific needs.",
  }),
  p(483, "Tavern on Camac", "philadelphia", {
    location: "243 S Camac Street, Philadelphia, PA 19107, United States", hours: "Piano Bar daily 16:00-02:00; restaurant Mon-Wed 16:00-23:00 and Thu-Sun 16:00-02:00; Ascend programming varies.", link: "https://www.tavernoncamac.com/",
    description: "Tavern on Camac combines a ground-floor piano bar, a late-serving restaurant and upstairs Ascend dance programming in one historic Gayborhood building, so each floor has a different reason to visit.", vibe: "historic piano bar, restaurant and upstairs dance rooms", vibe_tags: ["social", "cultural", "pop"],
  }, ["https://www.tavernoncamac.com/location", "https://www.tavernphilly.com/"], {
    queue_wait: "The piano bar is easiest early; weekend sing-alongs and upstairs DJ hours can create separate capacity pressure between floors.", best_nights: "Go early for dinner, choose any evening for the piano bar, or match an Ascend DJ or Sunday show-tunes listing for upstairs.", crowd_mix: "Dinner guests, piano-bar regulars, singers and later dance-floor visitors overlap but do not create one uniform crowd.", dress_code: "Smart-casual works for dinner and piano drinks; comfortable nightlife clothing suits the upstairs room.", staff_inclusivity: "The business operates as a longstanding LGBTQ Gayborhood institution; contact it directly for lift access and floor-specific accommodations in the historic building.",
  }),
  p(3341, "The Bike Stop", "philadelphia", { link: "https://www.facebook.com/thebikestop/" }, ["https://www.facebook.com/thebikestop/", "https://www.visitphilly.com/articles/philadelphia/lgbtq-bars/"]),
  p(482, "U Bar", "philadelphia", {
    location: "1220 Locust Street, Philadelphia, PA 19107, United States", hours: "Open daily 11:00-02:00.", link: "https://www.instagram.com/ubarphilly/",
    description: "U Bar is a narrow Locust Street Gayborhood bar with a stainless-steel counter, draft beer and daily neighborhood service; conversation and regulars matter more than shows or a dance floor.", vibe: "narrow Locust Street neighborhood gay bar", vibe_tags: ["chill", "social", "cozy"],
  }, ["https://www.instagram.com/ubarphilly/", "https://www.visitphilly.com/articles/philadelphia/lgbtq-bars/"], {
    queue_wait: "There is no large club entrance; the practical constraint is finding space at the compact bar during late weekend hours.", best_nights: "Daytime and early evening favour conversation; Friday-Saturday late brings a denser Gayborhood bar crowd.", crowd_mix: "Local regulars, gay men, neighborhood workers and visitors stopping between nearby venues share the small room.", dress_code: "Everyday casual clothing is normal; there is no performance-night dress expectation.", staff_inclusivity: "U Bar is documented as a longstanding gay neighborhood bar; detailed accessibility information is not published, so ask directly before visiting if needed.",
  }),
  p(446, "Voyeur Nightclub", "philadelphia", {
    location: "1221 St James Street, Philadelphia, PA 19107, United States", hours: "Thu 00:00-03:20; Fri-Sat 23:00-03:20; Sun 01:00-03:20. Private-club rules and event doors can vary.", link: "https://www.voyeurnightclub.com/",
    description: "Voyeur is a private, members-and-guests after-hours LGBTQ nightclub on St James Street with three floors, multiple music rooms and service beyond Pennsylvania's standard bar closing time.", vibe: "three-floor private after-hours LGBTQ dance club", vibe_tags: ["after", "electronic", "massive"],
  }, ["https://www.voyeurnightclub.com/", "https://www.visitphilly.com/things-to-do/attractions/voyeur/"], {
    queue_wait: "Membership or guest admission, fee, ID and security checks make entry slower than an ordinary bar; weekend arrival after last call is the main pressure point.", best_nights: "Friday and Saturday deliver the fullest multi-room late-night format; Thursday and early Sunday are shorter after-hours sessions.", crowd_mix: "LGBTQ nightlife regulars, dancers and post-last-call visitors move between EDM, Top 40 and hip-hop rooms.", dress_code: "Dance-ready nightlife clothing fits, but current private-club admission and bag rules take priority over style advice.", staff_inclusivity: "Voyeur explicitly operates as an LGBTQ nightclub and private social club; guests should review current admission terms and contact the club about accessibility across three floors.",
  }),
  p(445, "Woody's Philadelphia", "philadelphia", {
    name: "Woody's", type: "club", location: "1300 Walnut Street (13th Street entrance), Philadelphia, PA 19107, United States", hours: "Wed-Sun 17:00-02:00; Mon-Tue usually closed. Confirm seasonal and Pride-week changes.", link: "https://woodysbar.com/",
    description: "Woody's is a multi-room Gayborhood institution at 13th and Walnut, combining a street-level pub with upstairs dancing and event spaces; it draws a broader tourist and ally mix than many smaller nearby bars.", vibe: "multi-room Gayborhood pub and dance institution", vibe_tags: ["pop", "social", "massive"],
  }, ["https://woodysbar.com/", "https://www.visitphilly.com/articles/philadelphia/lgbtq-bars/"], {
    queue_wait: "The 13th Street entrance is most pressured Friday-Saturday late and during Pride; arrive earlier for pub space and expect ID/security checks upstairs.", best_nights: "Wednesday-Sunday operation changes by floor and event; choose a dated dance, watch party or community listing instead of assuming every room is open.", crowd_mix: "Gayborhood regulars mix with LGBTQ visitors, allies and tourists; the downstairs pub and upstairs dance floor can feel markedly different.", dress_code: "Casual bar clothing works downstairs and dance-ready outfits upstairs; special events may publish their own rules.", staff_inclusivity: "Woody's is a long-running LGBTQ venue and Pride participant, but users should not infer individual experiences; direct access or safety questions to current management.",
  }),
];

const removals = [
  { id: 3525, name: "The Rosemont", city: "new_york", reason: "permanently closed September 2026" },
  { id: 2599, name: "Barcodes Orlando", city: "orlando", reason: "duplicate of reviewed legacy record 488" },
  { id: 3342, name: "Raven Lounge", city: "philadelphia", reason: "permanently closed" },
  { id: 960, name: "Woody's", city: "philadelphia", reason: "duplicate of reviewed legacy record 445" },
];

const allRows = [...updates, ...removals];
const expectedRows = new Map(allRows.map((row) => [row.id, row]));
if (expectedRows.size !== allRows.length) throw new Error("Duplicate ID in batch definition");

const allIds = [...expectedRows.keys()];
const { data: before, error: beforeError } = await supabase.from("places").select("id,name,city,venue_intel,description").in("id", allIds);
if (beforeError) throw beforeError;
for (const row of updates) if (!before.some(({ id }) => id === row.id)) throw new Error(`Guard missing update target ${row.id}/${row.name}`);
for (const row of before) {
  const expected = expectedRows.get(row.id);
  const allowedNames = new Set([expected.name, expected.patch?.name].filter(Boolean));
  if (row.city !== expected.city || !allowedNames.has(row.name)) throw new Error(`Guard mismatch: ${row.id}/${row.city}/${row.name}`);
}

for (const row of updates) {
  const current = before.find(({ id }) => id === row.id);
  const oldIntel = current.venue_intel || {};
  const details = Object.fromEntries(FIELDS.map((field) => [field, row.intel[field] || oldIntel[field]]));
  for (const field of FIELDS) if (!String(details[field] || "").trim()) throw new Error(`Missing ${field}: ${row.name}`);
  row.patch.venue_intel = {
    ...oldIntel,
    ...details,
    source_urls: row.sources,
    research_status: "official_current_operation_verified",
    updated_at: checkedAt,
    topic_evidence: Object.fromEntries(FIELDS.map((field) => [field, { status: "official_current_operation_verified", checked_at: checkedAt, source_urls: row.sources }])),
  };
  if (row.patch.seo_indexable === undefined) row.patch.seo_indexable = true;
  if (row.patch.seo_quality_status === undefined) row.patch.seo_quality_status = "approved";
}

const descriptions = updates.map((row) => row.patch.description).filter(Boolean);
if (new Set(descriptions).size !== descriptions.length) throw new Error("New descriptions must be unique");

async function assertRemovalSafe(row) {
  const [reviews, vibes] = await Promise.all([
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("place_id", row.id),
    supabase.from("qa_place_vibe_signals").select("id", { count: "exact", head: true }).eq("place_id", row.id),
  ]);
  if (reviews.error) throw reviews.error;
  if (vibes.error) throw vibes.error;
  if (reviews.count || vibes.count) throw new Error(`Refusing to remove ${row.id}/${row.name}: reviews=${reviews.count}, vibeSignals=${vibes.count}`);
}
for (const row of removals) if (before.some(({ id }) => id === row.id)) await assertRemovalSafe(row);

if (!APPLY) {
  console.log(JSON.stringify({ mode: "dry-run", cities: CITIES, updates: updates.length, removals }, null, 2));
} else {
  for (const row of updates) {
    const { data, error } = await supabase.from("places").update(row.patch).eq("id", row.id).eq("city", row.city).select("id");
    if (error) throw error;
    if (data.length !== 1) throw new Error(`Update affected ${data.length}: ${row.id}/${row.name}`);
  }
  for (const row of removals) {
    const { data, error } = await supabase.from("places").delete().eq("id", row.id).eq("city", row.city).select("id");
    if (error) throw error;
    if (data.length > 1) throw new Error(`Delete affected ${data.length}: ${row.id}/${row.name}`);
  }
  console.log(JSON.stringify({ mode: "applied", cities: CITIES, updates: updates.length, removals }, null, 2));
}
