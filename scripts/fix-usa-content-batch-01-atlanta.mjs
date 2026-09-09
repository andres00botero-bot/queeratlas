import { createClient } from "@supabase/supabase-js";
import { SEED_VENUE_INTEL } from "../src/lib/seedVenueIntel.js";

const APPLY = process.argv.includes("--apply");
const CHECKED_AT = "2026-09-09T00:00:00Z";
const REQUIRED_INTEL = ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity"];

const buildIntel = (fields, sourceUrls, status = "official_current_operation_verified") => ({
  ...fields,
  source_urls: sourceUrls,
  topic_evidence: Object.fromEntries(REQUIRED_INTEL.map((field) => [field, {
    status,
    source_urls: sourceUrls,
    checked_at: CHECKED_AT,
  }])),
  research_status: status,
  updated_at: CHECKED_AT,
});

const curatedIntel = (seedId) => {
  const source = SEED_VENUE_INTEL[seedId];
  if (!source) throw new Error(`Missing curated intelligence for ${seedId}`);
  const fields = Object.fromEntries(REQUIRED_INTEL.map((field) => [field, source[field]]));
  return buildIntel(fields, source.source_urls, source.research_status);
};

const updates = [
  {
    id: 3170, name: "Atlanta Eagle", type: "bar",
    location: "1492 Piedmont Ave NE, Atlanta, GA 30309, United States",
    hours: "Mon-Fri 15:00-03:00; Sat 13:00-03:00; Sun 13:00-00:00.",
    link: "https://atlantaeagle.com/",
    description: "Atlanta Eagle is a long-running leather and levi bar at Ansley Square, with community events, DJs and themed nights while explicitly welcoming the wider LGBTQ+ community.",
    vibe: "leather-rooted Ansley Square bar with community nights and late DJs",
    vibe_tags: ["fetish", "social", "electronic"],
    venue_intel: curatedIntel("seed-place-atlanta-eagle"),
  },
  {
    id: 3174, name: "BJ Roosters", type: "bar",
    location: "2043 Cheshire Bridge Rd NE, Unit 1, Atlanta, GA 30324, United States",
    hours: "Mon-Sat 19:00-02:45; Sun 19:00-00:00. Check the current Facebook page before travelling.",
    link: "https://www.facebook.com/bjroostersatlanta/",
    description: "BJ Roosters is a Cheshire Bridge gay bar centred on male go-go dancers, pool tables, a dance floor and an outdoor patio; photography inside is restricted.",
    vibe: "compact adult gay bar with go-go dancers, pool and patio",
    vibe_tags: ["after", "social", "industrial"],
    venue_intel: buildIntel({
      queue_wait: "The bar does not take reservations. Ordinary weeknights are usually direct entry; weekend performances may add a cover and a short ID check. Confirm the latest door post before leaving.",
      best_nights: "Choose Friday or Saturday for the fullest dancer programme and DJ atmosphere. An earlier weekday visit is better if pool, patio space and conversation matter more than the show.",
      crowd_mix: "Gay and bisexual men form the main audience, joined by adult-nightlife visitors and local Cheshire Bridge regulars. The venue is entertainment-led rather than a general mixed-community bar.",
      dress_code: "Casual bar clothing is usual. Bring physical ID, small bills for performers and respect the venue's no-photography rule; do not assume consent to film dancers or guests.",
      staff_inclusivity: "Its LGBTQ-bar identity is current, but no detailed accessibility or inclusion policy is published. Ask the venue directly about mobility access or admission questions before a busy night.",
    }, ["https://www.facebook.com/bjroostersatlanta/", "https://www.restaurantji.com/ga/atlanta/bj-roosters-/"], "current_operator_channel_plus_current_listing_verified"),
  },
  {
    id: 2542, name: "Blake's On The Park", type: "bar",
    location: "227 10th St NE, Atlanta, GA 30309, United States",
    hours: "Mon-Fri 17:00-03:00; Sat 14:00-03:00; Sun 14:00-00:30. Kitchen hours differ.",
    link: "https://blakesontheparkatl.com/",
    description: "Blake's is a 21+ Midtown gay video and dance bar with DJs, dancers, drag shows, food and a central position beside the 10th Street nightlife cluster.",
    vibe: "busy Midtown video bar moving from food and drinks into drag and dancing",
    vibe_tags: ["drag", "pop", "social"],
    venue_intel: buildIntel({
      queue_wait: "Early food and bar service is the easiest arrival. Weekend entertainment can compress the 10th Street entrance; bring valid government photo ID and check the official schedule for cover or ticket details.",
      best_nights: "Use the entertainment calendar: drag, dancers and DJs are the main reasons to visit, while weekday early evening keeps the neighborhood-bar side more visible.",
      crowd_mix: "Midtown gay regulars, drag audiences, LGBTQ+ visitors and mixed groups use the bar. Food hours broaden the room before the later dance crowd arrives.",
      dress_code: "No formal code is published, but the venue is strictly 21+. Casual barwear works earlier; expressive nightlife looks are common for shows and DJs.",
      staff_inclusivity: "Blake's publicly identifies as a gay neighborhood bar and books queer performers. The accessible pages do not publish detailed accessibility or trans-admission guidance, so specific needs should be confirmed directly.",
    }, ["https://blakesontheparkatl.com/"]),
  },
  {
    id: 3168, name: "Bulldogs", type: "bar",
    location: "893 Peachtree St NE, Atlanta, GA 30309, United States",
    hours: "Mon-Sat 16:00-03:00; Sun 16:00-00:00. Verify holiday changes on the current Instagram channel.",
    link: "https://www.instagram.com/bulldogsbaratl/",
    description: "Bulldogs is a long-running Midtown gay bar with a particularly important place in Atlanta's Black LGBTQ+ nightlife, combining drinks, music, dancing and an outdoor area.",
    vibe: "historic Black gay Midtown bar with music, dancing and local regulars",
    vibe_tags: ["cultural", "social", "electronic"],
    venue_intel: buildIntel({
      queue_wait: "Regular afternoons and early evenings are generally straightforward; late weekend entry depends on the current event and capacity. Use the venue's Instagram for any cover or special-door notice.",
      best_nights: "Visit for a posted DJ, drag or community night if you want the bar at full energy. Earlier hours better reveal its neighborhood role and make conversation easier.",
      crowd_mix: "Black gay men and long-time Atlanta regulars are central, with a broader LGBTQ+ crowd also present. Its history and audience differ materially from nearby hotel and cocktail venues.",
      dress_code: "Everyday bar clothes and nightlife casual fit; no reliable formal code is published. Bring physical ID and dress for both dancing and time in the outdoor area.",
      staff_inclusivity: "The bar's decades-long Black LGBTQ+ community role is documented. No detailed current accessibility policy is published, so guests with specific access questions should contact the operator.",
    }, ["https://www.instagram.com/bulldogsbaratl/", "https://goatlantalocal.com/businesses/atlanta/dining/bulldogs/"], "current_operator_channel_plus_local_destination_identity_verified"),
  },
  {
    id: 3172, name: "Felix's Atlanta", type: "bar",
    location: "1510 Piedmont Ave NE, Atlanta, GA 30324, United States",
    hours: "Mon-Thu 15:00-03:00; Fri 13:00-03:00; Sat 12:00-03:00; Sun 12:00-00:00.",
    link: "https://www.felixsatlanta.com/",
    description: "Felix's is an LGBTQ neighborhood bar at Ansley Square, open since 2001, with drinks, zero-proof options and a weekly programme built around social games and watch parties.",
    vibe: "unpretentious Ansley Square neighborhood bar for games, drinks and regulars",
    vibe_tags: ["social", "chill"],
    venue_intel: buildIntel({
      queue_wait: "This is usually a walk-in neighborhood bar rather than a ticketed club. Trivia, karaoke and major watch parties can fill seats, so arrive before the posted start when a table matters.",
      best_nights: "Pick the weekly activity you actually want—trivia, karaoke or a sports watch party—because each changes the room more than the weekday itself.",
      crowd_mix: "Local LGBTQ+ regulars, friends, sports viewers and Ansley Square visitors share the bar. The official message is everyone welcome and come as you are.",
      dress_code: "No fashion code is published; ordinary casual clothing fits the neighborhood-bar format.",
      staff_inclusivity: "Felix's explicitly calls itself an LGBTQ bar, says everyone is welcome and offers both alcoholic and zero-proof drinks. Detailed mobility information is not published on its contact page.",
    }, ["https://www.felixsatlanta.com/", "https://www.felixsatlanta.com/contact"]),
  },
  {
    id: 3177, name: "FLEXSpas Atlanta", type: "sauna",
    location: "76 4th St NW, Atlanta, GA 30308, United States",
    hours: "Open 24 hours daily; memberships, lockers and rooms use separate current prices.",
    link: "https://www.flexspas.com/atlanta",
    description: "FLEXSpas Atlanta is a private men's membership facility with lockers and rooms, spa and gym amenities and an eight-hour rental model; a day pass alone does not include a locker or room.",
    vibe: "24-hour private men's spa with membership, gym and timed rentals",
    vibe_tags: ["men_only", "relax", "cruise"],
    venue_intel: curatedIntel("seed-place-atlanta-flex"),
  },
  {
    id: 3399, name: "Hotel Clermont", type: "hotel",
    location: "789 Ponce De Leon Ave NE, Atlanta, GA 30306, United States",
    hours: "Hotel reception operates 24 hours. Rooftop: Mon-Thu 16:00-00:00; Fri 16:00-01:00; Sat 12:00-01:00; Sun 12:00-22:00.",
    link: "https://www.hotelclermont.com/",
    description: "Hotel Clermont is a restored 1924 Poncey-Highland hotel with 93 rooms, Tiny Lou's, a lobby café and a first-come rooftop; the separately operated Clermont Lounge has its own rules and entrance.",
    vibe: "historic Poncey-Highland hotel with rooftop, restaurant and distinct nightlife neighbors",
    vibe_tags: ["luxury", "social", "chill"],
    venue_intel: curatedIntel("seed-place-atlanta-clermont"),
  },
  {
    id: 3181, name: "Lips Atlanta", type: "restaurant",
    location: "3011 Buford Hwy NE, Atlanta, GA 30329, United States",
    hours: "Shows Wed-Sun by seating time; closed Mon-Tue. Reservations are strongly recommended and walk-ins are limited to available bar seating.",
    link: "https://www.lipsatl.com/",
    description: "Lips Atlanta is a drag dinner-and-show restaurant with bingo, variety shows, weekend evening productions and Saturday and Sunday brunch seatings rather than ordinary open-ended bar service.",
    vibe: "reservation-led drag dining with fixed seatings, brunch and celebration shows",
    vibe_tags: ["drag", "cultural", "social"],
    venue_intel: buildIntel({
      queue_wait: "Reserve the exact seating; walk-in tables are not guaranteed and reservations are held only 15 minutes. Parties above eight must call, while groups of 15 or more use a contract and deposit.",
      best_nights: "Wednesday bingo, Thursday variety, Friday and Saturday evening glamour, and weekend brunch are different products. Choose by show format and published seating time.",
      crowd_mix: "Drag fans, birthday and celebration groups, LGBTQ+ diners, tourists and mixed adult parties attend. Most listed shows admit 18+ guests, while alcohol service remains 21+ with valid ID.",
      dress_code: "No general fashion requirement is stated. A wrap or light layer is practical because the showroom is kept cool; performers are tipped separately.",
      staff_inclusivity: "The venue is built around working drag performers and publishes detailed age, reservation and payment rules. Accessibility details are not prominent on the reservation page, so seating needs should be discussed when booking.",
    }, ["https://www.lipsatl.com/shows", "https://www.lipsatl.com/reservations"]),
  },
  {
    id: 3175, name: "Lore", type: "bar",
    location: "466B Edgewood Ave NE, Atlanta, GA 30312, United States",
    hours: "Mon closed; Tue-Thu 19:00-02:00; Fri-Sat 19:00-03:00; Sun 11:00-15:00 and 19:00-00:00.",
    link: "https://loreatl.com/",
    description: "Lore is an explicitly queer two-level Edgewood bar and live-events venue with dinner, cocktails and mocktails, a downstairs patio, upstairs ticketed programming and Sunday drag brunch.",
    vibe: "two-level queer third space joining dinner, patio drinks, drag and dance events",
    vibe_tags: ["drag", "pop", "social"],
    venue_intel: buildIntel({
      queue_wait: "The downstairs room is open to the public, while upstairs events may require separate tickets. Use the event link for the exact night and arrive before showtime when upstairs access matters.",
      best_nights: "Tuesday karaoke, Friday's recurring show and Sunday's brunch plus late programme each serve a different visit. The event calendar is more useful than treating every late night alike.",
      crowd_mix: "The venue centres the LGBTQIA+ community across genders and also welcomes guests for food, drinks and performances. Brunch, karaoke and dance events produce notably different audiences.",
      dress_code: "No venue-wide code is published; casual dinner clothing and expressive event looks both fit. Follow any theme or ticket rule for the upstairs programme.",
      staff_inclusivity: "Lore calls itself a queer third space and provides gender-neutral bathrooms on both levels. Guests needing mobility details for upstairs events should contact the venue in advance.",
    }, ["https://loreatl.com/"]),
  },
  {
    id: 2544, name: "Mary's", type: "bar",
    location: "1287 Glenwood Ave SE, Suite B, Atlanta, GA 30316, United States",
    hours: "Mon-Tue 16:00-00:00; Wed-Thu 16:00-01:00; Fri-Sat 16:00-02:00; Sun closed.",
    link: "https://web.marysatlanta.com/home",
    description: "Mary's is a 21+ East Atlanta gay bar with a compact weekly programme: Wednesday karaoke, Thursday drag, Friday video night and rotating Saturday DJs.",
    vibe: "small East Atlanta gay bar with karaoke, drag and rotating video-DJ nights",
    vibe_tags: ["drag", "pop", "chill"],
    venue_intel: buildIntel({
      queue_wait: "Capacity is deliberately limited and a $5 cover applies after 21:00. Arrive before the programmed event if entry and sightlines matter, and bring valid ID.",
      best_nights: "Wednesday is the large-songbook karaoke night; Thursday is drag; Friday uses the Queer Bait video format; Saturday DJs rotate. Choose the programme instead of defaulting to one peak night.",
      crowd_mix: "East Atlanta LGBTQ+ regulars, karaoke singers, drag audiences, DJs and visitors use a smaller room than Midtown's large clubs.",
      dress_code: "No dress code is published. Casual neighborhood-bar clothes work; valid ID and the indoor no-smoking/no-vaping rule are the practical requirements.",
      staff_inclusivity: "Mary's publicly identifies as a gay bar and has recurring queer drag, karaoke and DJ programming. The official page does not publish detailed accessibility information.",
    }, ["https://web.marysatlanta.com/home"]),
  },
  {
    id: 3398, name: "Midtown Rainbow Crosswalk Corridor", type: "cruising_area",
    location: "10th St NE & Piedmont Ave NE, Atlanta, GA 30309, United States",
    hours: "Public streets and crosswalk; individual businesses and events set their own hours.",
    link: "https://discoveratlanta.com/stories/things-to-do/a-travelers-lgbtq-guide-to-midtown-atlanta/",
    description: "The rainbow crosswalk at 10th and Piedmont marks a walkable concentration of Atlanta LGBTQ+ history, bars and restaurants; it is a public intersection, not a venue or guaranteed cruising area.",
    vibe: "public Midtown landmark connecting distinct LGBTQ+ businesses around 10th and Piedmont",
    vibe_tags: ["cultural", "social"],
    venue_intel: curatedIntel("seed-place-atlanta-midtown-corridor"),
  },
  {
    id: 3171, name: "Mixx Atlanta", type: "bar",
    location: "1492 Piedmont Ave NE, Suite B, Atlanta, GA 30309, United States",
    hours: "Mon-Tue private rentals; Wed-Thu 16:00-02:00; Fri-Sat 16:00-03:00; Sun 16:00-00:00.",
    link: "https://mixxatlanta.com/",
    description: "Mixx is a separate Suite B operation at 1492 Piedmont, combining a lounge, casual dining and late entertainment; it should not be confused with Atlanta Eagle at the same street number.",
    vibe: "Ansley Square lounge shifting from casual food and cocktails to late entertainment",
    vibe_tags: ["social", "pop", "after"],
    venue_intel: buildIntel({
      queue_wait: "Wednesday through Sunday are public operating days; Monday and Tuesday are rental-only. Check the event page for any ticketed entertainment rather than assuming general admission conditions.",
      best_nights: "Wednesday and Thursday offer an earlier lounge-and-dining visit; Friday and Saturday run an hour later and carry the stronger late-night format. Sunday finishes at midnight.",
      crowd_mix: "LGBTQ+ Ansley Square patrons, lounge visitors, diners and late-event guests mix here. The audience and format are distinct from the leather-focused Eagle next door.",
      dress_code: "No blanket dress code is published. Smart casual fits the lounge and dining side; event-specific looks may change on promoted nights.",
      staff_inclusivity: "The operator presents Mixx as LGBTQ+ Atlanta nightlife, but does not publish a detailed accessibility or inclusion protocol on the main page. Contact the venue for event-specific access needs.",
    }, ["https://mixxatlanta.com/"]),
  },
  {
    id: 3182, name: "Moxy Atlanta Midtown", type: "hotel",
    location: "48 13th St NE, Atlanta, GA 30309, United States",
    hours: "Hotel reception operates 24 hours; check-in 15:00 and check-out 12:00.",
    link: "https://www.marriott.com/en-us/hotels/atlox-moxy-atlanta-midtown/overview/",
    description: "Moxy Atlanta Midtown is a 21+ check-in hotel where reception doubles as Bar Moxy, with compact rooms, an outdoor pool and access to High Note rooftop at the connected complex.",
    vibe: "social Midtown hotel with bar check-in, compact rooms and a shared rooftop",
    vibe_tags: ["social", "luxury"],
    venue_intel: buildIntel({
      queue_wait: "There is no club door; hotel arrivals use the bar-style reception. Mobile key can simplify check-in, while rooftop and restaurant spaces have their own capacity and schedules.",
      best_nights: "Stay here for Midtown access and the social lobby rather than a dedicated queer programme. High Note is most useful around sunset, subject to its separate hours and events.",
      crowd_mix: "Hotel guests, business travellers, Midtown visitors and rooftop patrons mix in a mainstream property. No dedicated LGBTQ+ audience is claimed by the hotel page.",
      dress_code: "Ordinary hotel clothing works; casual-to-smart casual suits Bar Moxy and High Note. The property is smoke-free and requires guests to be 21 to check in.",
      staff_inclusivity: "Marriott publishes concrete accessible entrances, routes, rooms and hearing/mobility features for this property. The page does not document venue-specific LGBTQ+ programming, so inclusion should not be overstated.",
    }, ["https://www.marriott.com/en-us/hotels/atlox-moxy-atlanta-midtown/overview/"]),
  },
  {
    id: 3167, name: "My Sister's Room", type: "bar",
    location: "1104 Crescent Ave NE, Atlanta, GA 30309, United States",
    hours: "Mon-Tue closed; Wed 20:00-02:00; Thu 20:00-03:00; Fri 19:00-03:00; Sat 20:00-03:00; Sun 18:00-00:00. Special-event times vary.",
    link: "https://www.mysistersroom.com/",
    description: "My Sister's Room is a lesbian-owned Midtown bar, founded in 1996, with drag, burlesque, comedy, karaoke and dance programming centred on queer women while welcoming the wider community.",
    vibe: "women-centred lesbian bar with nightly performance and late weekend dancing",
    vibe_tags: ["drag", "pop", "cultural"],
    venue_intel: curatedIntel("seed-place-atlanta-msr"),
  },
  {
    id: 3173, name: "Oscar's Bar", type: "bar",
    location: "1510 Piedmont Ave NE, Suite C, Atlanta, GA 30324, United States",
    hours: "Mon-Sat 14:00-03:00; Sun 12:00-00:00. Verify current hours on the venue's social channel before travel.",
    link: "https://www.instagram.com/explore/locations/229510418/oscars-atlanta/",
    description: "Oscar's is an Ansley Square gay video and martini bar sharing 1510 Piedmont with other businesses; use the Suite C identity and current social listing because its former standalone website has expired.",
    vibe: "small Ansley Square video bar focused on martinis, music and conversation",
    vibe_tags: ["social", "chill"],
    venue_intel: buildIntel({
      queue_wait: "The room is normally walk-in rather than reservation-led. Its small size matters more than an outdoor queue, so arrive earlier for a seat and verify special-event cover on social media.",
      best_nights: "Use current posts for karaoke, video or event programming. Earlier afternoon and evening hours suit conversation; late weekend hours shift attention toward music and the busier Ansley Square circuit.",
      crowd_mix: "Gay neighborhood regulars, martini and video-bar patrons and people moving between Ansley Square venues make up the core audience.",
      dress_code: "Casual barwear is appropriate; no verified formal code is published. Bring physical ID and remember that this is Suite C, not Felix's elsewhere at the same street number.",
      staff_inclusivity: "The business is listed as a gay bar, but its former official domain is no longer controlled by the venue and no detailed current policy is available. Treat the social channel as the operational source and confirm access needs directly.",
    }, ["https://www.instagram.com/explore/locations/229510418/oscars-atlanta/", "https://atlanta.eater.com/venue/88243/oscar-s-bar"], "current_social_and_local_editorial_identity_verified_official_domain_expired"),
  },
  {
    id: 3179, name: "Piedmont Park", type: "cruising_area",
    location: "400 Park Dr NE, Atlanta, GA 30306, United States",
    hours: "Daily 06:00-23:00; restrooms generally 08:00-18:00.",
    link: "https://piedmontpark.org/faq/",
    description: "Piedmont Park is a public city park and major Pride gathering space with trails, lawns, sports facilities and seasonal events; it is not an adult venue and should not be presented as a cruising recommendation.",
    vibe: "large public green space used for Pride, recreation and daytime community events",
    vibe_tags: ["chill", "cultural", "festival"],
    venue_intel: buildIntel({
      queue_wait: "There is no general entrance queue or admission fee. Festivals create transit, parking and security delays; the shared Botanical Garden garage is limited, so MARTA, walking or rideshare is often simpler.",
      best_nights: "Daylight is best for normal recreation; named festivals and Pride events follow their own published schedules. Leave by the official 23:00 closing time.",
      crowd_mix: "Residents, families, runners, dog walkers, sports users, tourists and festival audiences share the public park. LGBTQ+ visibility is strongest during Pride and community events, not every ordinary visit.",
      dress_code: "Use weather-appropriate park clothing, sun protection and walking shoes. Smoking, illegal substances, glass containers and alcohol outside permitted events are prohibited.",
      staff_inclusivity: "The park is a public civic space and the Conservancy states it is ADA accessible. That is not equivalent to specialist LGBTQ+ staff support; event organisers control their own access services.",
    }, ["https://piedmontpark.org/faq/", "https://piedmontpark.org/alerts-closures/"], "official_public_park_operation_and_rules_verified"),
  },
  {
    id: 1934, name: "REVERB Downtown Atlanta", type: "hotel",
    location: "89 Centennial Olympic Park Dr NW, Atlanta, GA 30313, United States",
    hours: "Hotel reception operates 24 hours. RT60 rooftop: Thu-Sun 17:00-23:00; private events may change access.",
    link: "https://reverb.hardrock.com/atlanta",
    description: "REVERB is a music-themed downtown hotel beside Mercedes-Benz Stadium, with self-check-in, co-working space, Constant Grind café-bar and the walk-in-only RT60 rooftop.",
    vibe: "stadium-side music hotel with self check-in and a walk-in rooftop",
    vibe_tags: ["luxury", "social", "pop"],
    venue_intel: buildIntel({
      queue_wait: "Hotel guests can use mobile or kiosk self-check-in. RT60 does not take table reservations and can close for private or local events, so check its live hours before planning a rooftop visit.",
      best_nights: "Stay for stadium and downtown access; choose Thursday through Sunday for scheduled RT60 service. Major games and concerts change parking, rates and lobby pressure more than a normal weekend.",
      crowd_mix: "Music fans, stadium attendees, convention visitors and hotel guests dominate. The property is mainstream and does not publish a dedicated LGBTQ+ programme.",
      dress_code: "No hotel-wide code is stated. Casual travel clothing works at check-in; smart casual is practical for RT60, with weather layers for the indoor-outdoor rooftop.",
      staff_inclusivity: "REVERB publishes staffed, mobile and self-service check-in options, but no property-specific LGBTQ+ policy on the reviewed pages. Accessibility needs should be confirmed with the hotel crew before arrival.",
    }, ["https://reverb.hardrock.com/atlanta", "https://reverb.hardrock.com/atlanta/menus-hours-atlanta"]),
  },
  {
    id: 2547, name: "San Francisco Coffee Roasting Co", type: "cafe",
    location: "1192 N Highland Ave NE, Atlanta, GA 30306, United States",
    hours: "Mon-Fri 07:00-17:00; Sat-Sun 08:00-17:00.",
    link: "https://www.sanfranciscocoffeeroastingco.com/pages/our-locations",
    description: "The Virginia-Highland branch of this Atlanta roaster has served the neighborhood since 1992, offering small-batch coffee and a daytime café stop distinct from its newer Midtown and Candler Park locations.",
    vibe: "long-running Virginia-Highland coffeehouse for daytime work and neighborhood meetings",
    vibe_tags: ["chill", "cozy", "social"],
    venue_intel: buildIntel({
      queue_wait: "There is no admission line; ordering pressure follows the morning coffee rush and weekend seating demand. This branch closes at 17:00 and should not be planned as an evening venue.",
      best_nights: "It is a daytime café: weekday mornings work for a quieter stop, while weekend late mornings are more social. The value is the Virginia-Highland location, not nightlife programming.",
      crowd_mix: "Neighborhood residents, remote workers, dog walkers, coffee regulars and visitors use the café. The operator does not identify it as an LGBTQ-specific business.",
      dress_code: "Everyday café clothing is suitable; no code is published.",
      staff_inclusivity: "The café provides a general neighborhood service but publishes no dedicated LGBTQ+ mission or accessibility detail on its locations page. Its inclusion should therefore be described without unsupported staff claims.",
    }, ["https://www.sanfranciscocoffeeroastingco.com/pages/our-locations", "https://www.virginiahighlanddistrict.com/business-directory/san-francisco-coffee-roasting-co"], "official_operator_hours_plus_neighborhood_identity_verified"),
  },
  {
    id: 1933, name: "Stonehurst Place Bed & Breakfast", type: "hotel",
    location: "923 Piedmont Ave NE, Atlanta, GA 30309, United States",
    hours: "Guest accommodation by reservation; confirm current check-in window directly with the inn.",
    link: "https://www.stonehurstplace.com/",
    description: "Stonehurst Place is a small 1896 Midtown mansion and carriage-house bed-and-breakfast with individually styled suites, breakfast and shared indoor and outdoor guest spaces.",
    vibe: "quiet historic Midtown inn with breakfast and intimate shared spaces",
    vibe_tags: ["luxury", "cozy", "relax"],
    venue_intel: buildIntel({
      queue_wait: "This is reservation lodging, not a nightlife door. Coordinate the arrival window with the inn and book early for Pride or major Midtown weekends because the property has few rooms.",
      best_nights: "Choose Stonehurst for a quiet, residential-feeling stay near Midtown rather than an on-site party. Weekends suit leisure trips; event dates require earlier booking.",
      crowd_mix: "Couples, leisure travellers and business guests share a very small inn. The property is mainstream lodging and no current official page identifies a nightly LGBTQ+ programme.",
      dress_code: "No dress code applies; comfortable guesthouse clothing is appropriate, with a smarter option only if your off-site plans require it.",
      staff_inclusivity: "The official site emphasizes an approachable atmosphere and publishes contact details, but the current reviewed page does not make specific LGBTQ+ service claims. Contact the team for accessibility and room-layout needs.",
    }, ["https://www.stonehurstplace.com/"]),
  },
  {
    id: 3451, name: "The Heretic", type: "club",
    location: "2069 Cheshire Bridge Rd NE, Atlanta, GA 30324, United States",
    hours: "Event-led late-night schedule; Thursday country programming and weekend circuit, leather or fetish events vary. Check the official calendar.",
    link: "https://hereticatlanta.com/",
    description: "The Heretic is a Cheshire Bridge gay club whose programme ranges from Thursday country dancing to circuit DJs, leather and fetish events and community fundraisers.",
    vibe: "event-led gay club spanning country dancing, circuit music and leather nights",
    vibe_tags: ["fetish", "electronic", "cruise"],
    venue_intel: curatedIntel("seed-place-atlanta-heretic"),
  },
  {
    id: 3178, name: "Tokyo Valentino (Cheshire Bridge)", type: "store",
    location: "1739 Cheshire Bridge Rd NE, Atlanta, GA 30324, United States",
    hours: "Adult retail and Lifestyle Club schedules may differ; verify the current Cheshire Bridge hours directly before travel.",
    link: "https://www.tokyovalentino.com/",
    description: "Tokyo Valentino's Cheshire Bridge site combines a large adult retail store with a separately accessed Lifestyle Club at the same address; it is not an LGBTQ-only venue or a public cruising area.",
    vibe: "adult retail store with a separate membership-style lifestyle space",
    vibe_tags: ["store"],
    venue_intel: buildIntel({
      queue_wait: "Retail entry and Lifestyle Club admission are separate processes. Call the listed store or club number for current ID, fee and access requirements instead of relying on an old directory schedule.",
      best_nights: "There is no verified weekly queer peak. Choose daylight for straightforward retail shopping; use only a currently advertised club event if the Lifestyle Club is your destination.",
      crowd_mix: "Adult-product shoppers and Lifestyle Club guests can include people of different genders and orientations. The operator does not define the entire property as a gay men's venue.",
      dress_code: "Street clothing is appropriate in retail. Any club-specific clothing or conduct rules should be confirmed directly; privacy and consent apply throughout adult spaces.",
      staff_inclusivity: "The operator says customers should not be approached while shopping and presents the store as embarrassment-free, but publishes no detailed LGBTQ+ or trans-access policy. Call ahead for specific admission questions.",
    }, ["https://www.tokyovalentino.com/"], "official_identity_address_and_contact_verified_schedule_requires_direct_confirmation"),
  },
  {
    id: 3169, name: "Woofs Atlanta", type: "bar",
    location: "494 Plasters Ave NE, Suite 200, Atlanta, GA 30324, United States",
    hours: "Mon 11:30-23:00; Tue closed; Wed-Thu 11:30-23:00; Fri-Sat 11:30-01:00; Sun 11:30-00:00.",
    link: "https://woofsatlanta.com/",
    description: "Woofs is an LGBTQ sports bar with 28 screens, a full food menu and direct ties to local gay sports teams and nonprofits; the match schedule is more important than a generic weekend label.",
    vibe: "LGBTQ sports bar where televised fixtures, food and queer leagues set the rhythm",
    vibe_tags: ["social", "cultural", "chill"],
    venue_intel: curatedIntel("seed-place-atlanta-woofs"),
  },
  {
    id: 3180, name: "X Midtown", type: "club",
    location: "990 Piedmont Ave NE, Atlanta, GA 30309, United States",
    hours: "Mon closed; Tue 22:00-03:00; Wed hours/event vary; Thu-Sat 20:00-03:00; Sun 16:00-00:00. Check the live event page for Wednesday and special dates.",
    link: "https://xmidtown.com/",
    description: "X Midtown is a bar and dance venue at 10th and Piedmont with a large patio, a living plant wall, an in-house chicken counter and programming that includes pop dance parties, drag and Pride events.",
    vibe: "patio-led Midtown club with pop parties, drag and an in-house food counter",
    vibe_tags: ["pop", "drag", "electronic"],
    venue_intel: buildIntel({
      queue_wait: "Regular early entry is simpler; major Pride and ticketed dates can use expedited passes and separate door times. Check the exact event listing rather than relying only on standing hours.",
      best_nights: "Tuesday is a pop-remix dance party, Saturday carries Dirty POP, and Sunday uses an afternoon-to-evening format. Wednesday service is promoted inconsistently, so confirm it on the live calendar.",
      crowd_mix: "Midtown LGBTQ+ clubgoers, drag audiences, pop fans, patio groups and Pride visitors mix here. The food counter makes early visits different from the later dance floor.",
      dress_code: "No general code is published. Expressive clubwear and casual patio clothes both appear, but valid ID and any ticket-specific rule control entry.",
      staff_inclusivity: "The venue's LGBTQ+ programming and Pride calendar are explicit. Its reviewed pages do not publish detailed accessibility or trans-admission procedures, so event-specific access questions should go to the venue.",
    }, ["https://xmidtown.com/", "https://xmidtown.com/events/", "https://xmidtown.com/contact/"]),
  },
];

const duplicatesToRemove = [
  { id: 1932, name: "The Heretic Atlanta", canonicalId: 3451 },
  { id: 2546, name: "Ansley Square Venues", canonicalId: null },
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const expectedIds = [...updates.map(({ id }) => id), ...duplicatesToRemove.map(({ id }) => id)];
const { data: before, error: beforeError } = await supabase
  .from("places")
  .select("id,name,city")
  .in("id", expectedIds)
  .order("id");
if (beforeError) throw beforeError;

for (const expected of [...updates, ...duplicatesToRemove]) {
  const actual = before.find(({ id }) => id === expected.id);
  if (!actual || actual.city !== "atlanta" || actual.name !== expected.name) {
    throw new Error(`Guard failed for ${expected.id}: expected Atlanta/${expected.name}, got ${JSON.stringify(actual)}`);
  }
}

for (const update of updates) {
  for (const field of REQUIRED_INTEL) {
    if (!update.venue_intel[field]?.trim()) throw new Error(`Missing ${field} for ${update.name}`);
  }
  if (update.venue_intel.source_urls.length === 0) throw new Error(`Missing sources for ${update.name}`);
}

if (!APPLY) {
  console.log(JSON.stringify({ mode: "dry-run", guardedRows: before.length, updates: updates.length, removals: duplicatesToRemove }, null, 2));
} else {
for (const update of updates) {
  const { id, name, ...patch } = update;
  const { data, error } = await supabase
    .from("places")
    .update({ ...patch, seo_indexable: true, seo_quality_status: "approved" })
    .eq("id", id)
    .eq("city", "atlanta")
    .eq("name", name)
    .select("id");
  if (error) throw error;
  if (data.length !== 1) throw new Error(`Update affected ${data.length} rows for ${id}/${name}`);
}

for (const duplicate of duplicatesToRemove) {
  if (duplicate.canonicalId) {
    const { error: reviewError } = await supabase
      .from("reviews")
      .update({ place_id: duplicate.canonicalId })
      .eq("place_id", duplicate.id);
    if (reviewError) throw reviewError;
  }
  const { data: signals, error: signalError } = await supabase
    .from("qa_place_vibe_signals")
    .select("place_id")
    .eq("place_id", duplicate.id);
  if (signalError) throw signalError;
  if (signals.length) throw new Error(`Refusing to remove ${duplicate.id}; it has ${signals.length} vibe signals`);
  const { data, error } = await supabase
    .from("places")
    .delete()
    .eq("id", duplicate.id)
    .eq("city", "atlanta")
    .eq("name", duplicate.name)
    .select("id");
  if (error) throw error;
  if (data.length !== 1) throw new Error(`Delete affected ${data.length} rows for ${duplicate.id}/${duplicate.name}`);
}

const { data: after, error: afterError } = await supabase
  .from("places")
  .select("id,name,city,location,hours,description,vibe,venue_intel,seo_indexable,seo_quality_status")
  .eq("city", "atlanta")
  .order("name");
if (afterError) throw afterError;

const bad = after.filter((row) =>
  !row.description?.trim()
  || !row.location?.trim()
  || !row.hours?.trim()
  || !row.venue_intel?.source_urls?.length
  || REQUIRED_INTEL.some((field) => !row.venue_intel?.[field]?.trim())
);
if (after.length !== 23 || bad.length) {
  throw new Error(`Post-check failed: ${after.length} Atlanta rows, ${bad.length} incomplete rows`);
}

console.log(JSON.stringify({ mode: "applied", updated: updates.length, removed: duplicatesToRemove.length, finalRows: after.length }, null, 2));
}
