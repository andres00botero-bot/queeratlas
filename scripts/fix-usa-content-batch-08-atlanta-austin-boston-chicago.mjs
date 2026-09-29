import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const checkedAt = "2026-09-29T00:00:00Z";
const fields = ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity"];
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const venue = (id, city, name, patch, sources, intel) => ({ id, city, name, patch, sources, intel });
const updates = [
  venue(3933, "atlanta", "Friends on Ponce", {
    hours: "Mon-Thu 14:00-02:00; Fri-Sat 14:00-03:00; Sun 14:00-00:00.",
    link: "https://www.friendsonponce.com/",
    description: "Friends on Ponce is the scruffy, easygoing gay neighbourhood bar on Ponce de Leon where pinball, pool and a covered patio matter more than spectacle. It is a place to land between plans, join karaoke or settle in with a heavy pour and a few regulars.",
    vibe: "no-frills Ponce gay bar with pool, pinball, karaoke and a covered patio",
    vibe_tags: ["cozy", "social", "chill"],
  }, ["https://www.friendsonponce.com/", "https://outxout.com/venue/friendsonponceatlanta"], {
    queue_wait: "There is normally no ticket queue or cover. The small room gets tight on karaoke, drag and late Friday or Saturday, so an early arrival is the move if pool space or a patio table matters.",
    best_nights: "Use the venue's current calendar for karaoke, Mixed Tape Sunday or New Faces; otherwise this is strongest as an unfussy after-work drink or a low-stakes stop before a bigger night.",
    crowd_mix: "Local gay men, longtime Ponce regulars, visitors and mixed friend groups share a deliberately divey room. It feels more conversational than the larger Midtown clubs.",
    dress_code: "Come as you are: jeans, tees and casual bar clothes fit. The useful etiquette is to keep the pool table and narrow patio circulating when the room fills.",
    staff_inclusivity: "Friends presents itself as a gay neighbourhood bar and has a long-running local LGBTQ+ role. Its public pages do not provide a detailed accessibility or safer-space policy, so ask directly about specific needs.",
  }),
  venue(4046, "atlanta", "Marquette Restaurant & Lounge", {
    hours: "Mon, Wed-Thu 22:00-04:00; Fri-Sat 22:00-06:00; Sun 22:00-04:00; closed Tue. Food service can use different hours.",
    link: "https://marquetteloungeatl.com/",
    description: "Marquette Restaurant & Lounge is an after-hours LGBTQ+ social club on Joseph E. Boone Boulevard, built for late sets, hookah, drinks and a crowd that is still arriving when most Atlanta kitchens have closed. The in-house 868 Cafe makes it more substantial than a pure dance stop.",
    vibe: "late-night LGBTQ+ social club with hookah, food and after-hours energy",
    vibe_tags: ["after", "social", "mixed"],
  }, ["https://marquetteloungeatl.com/", "https://marquetteloungeatl.com/contact-us", "https://toast.app/r/868-cafe-868-joseph-e-boone-blvd-nw/order"], {
    queue_wait: "Expect the door to be easiest close to opening and busiest after midnight, especially Friday and Saturday when service runs to 06:00. Check the event post before travelling: capacity, cover and food hours are not one fixed schedule.",
    best_nights: "Friday and Saturday are the full after-hours proposition. Go earlier only if the food, conversation and first rounds are the point rather than the late-night crowd.",
    crowd_mix: "The operator describes Marquette as an LGBTQ+ gathering place; the late schedule also draws social groups, celebrants and night-owl diners. The energy is more lounge-and-party than neighbourhood pub.",
    dress_code: "Night-out clothes fit naturally, but no standing formal or theme code is published. Comfortable shoes and a plan home are more useful than dressing for a hypothetical club rule.",
    staff_inclusivity: "Marquette explicitly identifies itself as an LGBTQ+ entertainment establishment. Specific physical-access, sobriety and event-boundary information is not published in detail, so confirm it with the team before a busy visit.",
  }),
  venue(4049, "atlanta", "Ria's Bluebird", {
    hours: "Thu-Tue 08:00-15:00; closed Wed. Ria's BABYBIRD pop-up has separate weekend hours.",
    link: "https://www.riasbluebird.com/find-us-1",
    description: "Ria's Bluebird is the Memorial Drive breakfast institution where the menu leans Southern, the line is part of the ritual and the room moves at brunch speed. It is a daytime food stop with real neighbourhood gravity, not a generic queer-nightlife recommendation.",
    vibe: "beloved Memorial Drive breakfast room with Southern plates and weekend-line energy",
    vibe_tags: ["cozy", "cultural", "social"],
  }, ["https://www.riasbluebird.com/find-us-1", "https://www.riasbluebird.com/contact/"], {
    queue_wait: "Ria's does not take reservations, and weekend brunch can mean a real wait. Call the restaurant for the best live estimate; complete parties are seated together, and the small lot fills quickly.",
    best_nights: "There are no nights here: go for a weekday breakfast or an early weekend table. The BABYBIRD pop-up is a separate, shorter weekend operation at Boggs Social & Supply.",
    crowd_mix: "Grant Park and eastside regulars, brunch groups, families, queer locals and food-minded visitors share the compact daytime room. This is a meal-first crowd rather than an event audience.",
    dress_code: "Relaxed daytime clothes are right. Expect a little weather exposure if the line is out, and do not treat the café as a late-night bar.",
    staff_inclusivity: "The restaurant's public FAQ gives useful, concrete service information but does not make a specific LGBTQ+ ownership or inclusion-policy claim. Ask directly about allergies, access or large parties.",
  }),
  venue(4047, "atlanta", "The T", {
    hours: "Mon-Sat 12:00-02:00; Sun 12:00-00:00. Verify event changes by phone before travelling.",
    link: "https://gaytravelr.com/usa/atlanta/bars-and-clubs/the-t",
    description: "The T is Grant Park's small, lived-in gay bar: pool, a jukebox, arcade games, karaoke and food give it the feel of a local hang rather than Midtown's polished club circuit. The narrow room rewards settling in, not rushing through.",
    vibe: "small Grant Park gay local with karaoke, pool, games and a jukebox",
    vibe_tags: ["cozy", "social", "chill"],
  }, ["https://gaytravelr.com/usa/atlanta/bars-and-clubs/the-t", "https://www.restaurantji.com/ga/atlanta/the-model-t-/", "https://www.gayellowpages.com/wholebook.pdf"], {
    queue_wait: "There are no reservations, and the compact space can develop a door wait when karaoke or a busy weekend crowd lands at once. Earlier afternoon and early evening are calmer; parking is limited.",
    best_nights: "Choose a listed karaoke or trivia night when you want activity. Otherwise, The T works best for an unhurried drink, a game of pool and a break from the volume of a large club.",
    crowd_mix: "Grant Park neighbours, LGBTQ+ regulars, an older mixed crowd and friends looking for a lower-key social bar shape the room. It is more local and intimate than a destination dance floor.",
    dress_code: "Plain casual is the house style. The practical constraint is space: travel light, expect a close room and wear shoes that work if you are standing or playing pool.",
    staff_inclusivity: "Current LGBTQ+ directories identify The T as a gay-friendly community bar. No first-party access or anti-harassment policy was found, so confirm specific access needs by phone before a peak night.",
  }),
  venue(4048, "atlanta", "Virgil's Gullah Kitchen & Bar", {
    hours: "Sun-Thu 11:00-23:00; Fri-Sat 11:00-00:00. Happy hour is 15:00-17:00; brunch and reservations have separate demand.",
    link: "https://virgilsgullahkitchen.com/west-midtown",
    description: "Virgil's West Midtown brings Gullah Geechee food, a full bar and high-volume social energy to Marietta Street. Come hungry for dishes such as gumbo, seafood and shrimp-and-grits, then expect the garage-door patio and brunch crowd to turn dinner into a scene.",
    vibe: "high-energy West Midtown Gullah Geechee restaurant with a full bar and patio",
    vibe_tags: ["cultural", "social", "mixed"],
  }, ["https://virgilsgullahkitchen.com/west-midtown", "https://virgilsgullahkitchen.com/", "https://www.opentable.com/r/virgils-gullah-kitchen-and-bar-west-midtown-atlanta"], {
    queue_wait: "Weekend brunch and large dinner groups are the pressure points; reserve when timing matters. The operator's 15:00-17:00 happy hour is a good lower-pressure window, but a day party can still change the pace.",
    best_nights: "Choose weekend brunch for the biggest social energy, happy hour for a shorter visit, or a regular dinner for food and cocktails. This is restaurant-led rather than a permanent queer-nightlife venue.",
    crowd_mix: "Gullah Geechee food fans, Georgia Tech and West Midtown groups, brunch celebrants and a broad social dining crowd mix here. The restaurant has documented Black LGBTQ+ roots, without being an LGBTQ+-only space.",
    dress_code: "Casual to smart-casual works. Patio seating and a full, lively room make comfortable clothes sensible; reservations and the meal matter more than nightclub styling.",
    staff_inclusivity: "Virgil's history includes Black LGBTQ+ founders and its current reservation profile lists gender-neutral restrooms and wheelchair access. That is useful venue-specific evidence, not a guarantee of any individual experience.",
  }),
  venue(3936, "austin", "Halcyon", {
    hours: "Sun-Wed 07:00-00:00; Thu-Sat 07:00-02:00. Weekend brunch is 08:00-16:00; libations begin at 14:00 Sat-Sun.",
    link: "https://www.halcyoncoffeebar.com/warehouse-district",
    description: "Halcyon is the all-day Warehouse District coffee bar that turns into an espresso-martini-and-s'mores hang after dark. Its Saturday drag brunch and long Thursday-to-Saturday hours make it a flexible warm-up spot, not a conventional gay bar.",
    vibe: "all-day Fourth Street coffee bar turning into cocktails, s'mores and drag brunch",
    vibe_tags: ["cozy", "social", "drag"],
  }, ["https://www.halcyoncoffeebar.com/warehouse-district", "https://austin.eater.com/2024/8/20/24224765/halcyon-mueller-closed-austin-cafe-bar"], {
    queue_wait: "The coffee counter moves quickly, but Saturday drag brunch and late weekend tables are the moments to plan around. The currently open location is downtown on Fourth Street; do not navigate to the closed Mueller branch.",
    best_nights: "Saturday is for drag brunch; Thursday through Saturday suit a coffee-to-cocktails drift. Weekday daytime is best for laptop time, a catch-up or a quiet s'mores break.",
    crowd_mix: "Downtown workers, students, visitors, queer brunch groups and late-night cocktail drinkers use the room in different shifts. It is mixed and programme-led rather than queer-exclusive.",
    dress_code: "Daytime Austin casual works, with a little extra polish if you are continuing into Fourth Street nightlife. No house code is published.",
    staff_inclusivity: "The recurring drag brunch is direct queer-programme evidence. Halcyon does not publish a detailed venue-wide LGBTQ+ policy or accessibility guide, so event-specific questions belong with the operator.",
  }),
  venue(3935, "austin", "The Liberty", {
    hours: "Mon-Thu 16:00-02:00; Fri-Sun 14:00-02:00. Confirm special-event hours directly.",
    link: "http://www.thelibertyaustin.com/",
    description: "The Liberty is an East Sixth dive with a long bar, a back patio and the sort of worn-in ease that makes one round turn into three. It is queer-friendly Austin nightlife, not a themed LGBTQ+ club, and works best when the goal is a loose, local night.",
    vibe: "East Sixth dive bar with a patio, cheap drinks and loose local energy",
    vibe_tags: ["chill", "social", "mixed"],
  }, ["http://www.thelibertyaustin.com/", "https://austin.eater.com/venue/95943/the-liberty-3"], {
    queue_wait: "There is rarely a formal line, but the patio and bar can pack in on Friday or Saturday. Arrive early if you want a seat rather than a shoulder-to-shoulder standing drink.",
    best_nights: "Weekend late hours bring the fullest East Sixth energy; a weekday visit is better for a slower patio drink. Check the current channel if a promoted event is the reason for your trip.",
    crowd_mix: "Eastside regulars, service-industry friends, queer locals, visitors and bar-hopping groups create a broad, uncurated mix. It reads as a neighbourhood dive, not a single-scene venue.",
    dress_code: "No code: casual, weather-ready clothes work. The patio and uneven late-night flow make comfortable shoes more useful than a dressy plan.",
    staff_inclusivity: "The Liberty is included for its queer-friendly local role, but no detailed first-party LGBTQ+ or accessibility policy was located. Treat it as a mixed bar and ask staff directly about a specific need.",
  }),
  venue(3938, "boston", "Blend", {
    hours: "Tue 17:00-22:00; Wed-Thu 17:00-23:00; Fri-Sat 17:00-02:00; Sun 11:00-22:00; closed Mon. Event times can differ.",
    link: "https://blenddorchester.com/",
    description: "Blend is Dorchester's dinner-and-dance hybrid: start with a full meal, then let the room tip toward Drag Race viewing, Friday Feels, Mayhem or a late Saturday crowd. Its queer programming is a real part of the calendar, but the restaurant remains more than one party format.",
    vibe: "Dorchester dinner bar that shifts into drag viewing and weekend dance energy",
    vibe_tags: ["drag", "social", "pop"],
  }, ["https://blenddorchester.com/", "https://blenddorchester.com/events", "https://blenddorchester.com/brunch-menu"], {
    queue_wait: "Reserve dinner when you want a guaranteed table; Friday and Saturday events can change the entry rhythm after food service. Sunday brunch is another high-demand window, not a walk-in certainty.",
    best_nights: "Friday's Drag Race viewing and Friday Feels, Saturday Mayhem, the monthly Supernature and the last-Saturday So Hot format serve different crowds. Choose the actual listing rather than treating every night as a club night.",
    crowd_mix: "Dorchester diners, LGBTQ+ locals, drag fans, dance groups and brunch parties overlap. Early service is meal-led; the late room is more social and music-forward.",
    dress_code: "Dinner casual is enough, while a drag night welcomes more expressive looks. No formal code is published, so the event listing sets the tone.",
    staff_inclusivity: "Blend's continuing queer event calendar is concrete programming evidence. It does not publish a full accessibility or safer-space guide, so contact the venue when that information affects a visit.",
  }),
  venue(3939, "boston", "FORGE bathhouse + group wellness", {
    hours: "Event-led; there are no standing drop-in hours while the sauna and wet-area build-out remains incomplete. Book the specific workshop and arrive on time.",
    link: "https://www.forge-boston.com/faq",
    description: "FORGE is a queer-centred Dorchester wellness project in the in-between: its current studio hosts naked bodywork, touch and group workshops while the future sauna-and-bathhouse build-out is still underway. It deserves to be chosen for a named, consent-led event—not mistaken for an open daily bathhouse.",
    vibe: "queer-centred, event-led wellness studio with workshops and an evolving bathhouse plan",
    vibe_tags: ["relax", "cultural", "social"],
  }, ["https://www.forge-boston.com/faq"], {
    queue_wait: "Buy a ticket for the exact workshop. Doors lock when an event starts and do not reopen, so arriving on time matters more than estimating a typical bathhouse queue.",
    best_nights: "The best visit is the listed session that matches your interest and comfort level. There is no reliable generic 'bath night' until the sauna and wet area are finished.",
    crowd_mix: "Queer people across gender identities attend bodywork, touch and wellness events; the specific workshop determines the group. Straight guests are welcome when they respect the queer-centred purpose.",
    dress_code: "Follow the named event's instructions. Some naked events expect full nudity, while binders, prosthetics and items needed for dysphoria are explicitly allowed; do not assume one rule covers every workshop.",
    staff_inclusivity: "FORGE states that all events are trans-inclusive and gives a route to raise concerns with staff. That is unusually concrete inclusion information; its future bathhouse amenities should not be presented as already operating.",
  }),
  venue(3937, "boston", "Trophy Room", {
    hours: "Mon-Thu 16:00-23:00; Fri 16:00-01:00; Sat 08:00-01:00; Sun 08:00-22:00. Kitchen closes earlier than the bar.",
    link: "https://trophyroomboston.com/information/",
    description: "Trophy Room is the colourful South End bar inside Staypineapple, serving breakfast on weekends, easy cocktails and comfort-food energy at the Berkeley–Chandler corner. It is a friendly neighbourhood stop with a visible queer welcome, not a separate hotel guest lounge.",
    vibe: "colourful South End neighbourhood bar for weekend breakfast, cocktails and comfort food",
    vibe_tags: ["cozy", "social", "mixed"],
  }, ["https://trophyroomboston.com/information/", "https://trophyroomboston.com/"], {
    queue_wait: "Weekend breakfast and the short Friday/Saturday late window are the likeliest pinch points. Kitchen hours end before drinks, so arrive with the meal timing in mind rather than assuming full service until close.",
    best_nights: "Go Saturday or Sunday morning for breakfast, weekday early evening for a calmer cocktail, or Friday for the latest bar close. It is a bar-and-restaurant rhythm, not an event-club schedule.",
    crowd_mix: "South End locals, hotel guests, brunch groups, queer patrons and casual diners share the room. The atmosphere is social without depending on a loud dance crowd.",
    dress_code: "Easy city casual works at breakfast and dinner. Nothing about the hotel setting requires formal clothes.",
    staff_inclusivity: "Trophy Room publicly says everyone is welcome and sits in a South End hotel with a queer-relevant location. It does not publish a detailed access or queer-programming policy, so confirm individual needs directly.",
  }),
  venue(3940, "chicago", "Lucky Horseshoe Lounge", {
    hours: "Mon-Fri 16:00-02:00; Sat 14:00-03:00; Sun 14:00-02:00. Current door hours can vary with events.",
    link: "https://luckyhorseshoelounge.com/",
    description: "The Lucky Horseshoe is Northalsted's long-running male-dancer bar, tucked just off Halsted's main drag with a darker, smaller-room feel than the big video bars nearby. It is an adult entertainment stop with a clear performance focus, not a one-size-fits-all queer lounge.",
    vibe: "long-running Northalsted male-dancer bar with late, compact adult energy",
    vibe_tags: ["after", "social", "men_only"],
  }, ["https://luckyhorseshoelounge.com/", "https://chicago.lakevieweast.com/list/member/the-lucky-horseshoe-lounge-223"], {
    queue_wait: "There is usually no advance-ticket routine, but the compact room can bottleneck at the door on weekend nights. The venue's own site and the local chamber currently differ on some hours, so verify before a time-sensitive visit.",
    best_nights: "Friday and Saturday deliver the fullest late-night dancer-bar format; weekday early evenings are the better fit for a shorter, less compressed stop.",
    crowd_mix: "Adult gay men, visitors to Northalsted and groups looking specifically for male-dancer entertainment form the core. It is not a general-purpose dance club or a quiet cocktail bar.",
    dress_code: "Casual nightlife clothes are normal. Bring physical ID and respect performers' boundaries; do not assume photography is welcome.",
    staff_inclusivity: "The LGBTQ+ venue category and its sustained male-dancer format are clearly documented. Detailed public accessibility, consent and admission policies are limited, so ask the venue before visiting with a specific need.",
  }),
  venue(3941, "chicago", "Meeting House Tavern", {
    hours: "Tue-Wed 17:00-00:00; Thu-Fri 17:00-02:00; Sat 14:00-02:00; Sun 14:00-00:00; closed Mon.",
    link: "https://meetinghousetavern.com/contact",
    description: "Meeting House Tavern is Andersonville's proudly LGBTQIA+ game-and-gathering bar: free pool, darts, Skee-Ball, shuffleboard and board games make it feel more like a communal living room than another Northalsted clone. Bring food in or have delivery sent to the bar, then stay for the night’s free entertainment.",
    vibe: "Andersonville LGBTQIA+ games bar with free entertainment and communal tables",
    vibe_tags: ["social", "cozy", "mixed"],
  }, ["https://meetinghousetavern.com/contact", "https://meetinghousetavern.com/news/we-open-tonight"], {
    queue_wait: "No reservations are needed, but the game tables and larger communal seating go first on karaoke or busy weekend nights. Arrive early if pool, Skee-Ball or a group table is the actual plan.",
    best_nights: "Thursday karaoke is the clearest recurring anchor; every night has free entertainment, so use the current programme for the exact format. Sunday is a shorter, softer landing than Friday or Saturday.",
    crowd_mix: "Andersonville neighbours, LGBTQIA+ regulars, board-game groups, sports viewers and friends with delivery bags share a genuinely mixed bar. It is built for hanging out rather than posing at a rope line.",
    dress_code: "Come casual and stay comfortable enough to play games. There is no restaurant dress code because outside food or delivery is part of the stated setup.",
    staff_inclusivity: "The operator explicitly calls Meeting House a proudly LGBTQIA+ gathering place and provides a direct contact for accessibility questions. That specificity is stronger than assuming inclusion from the neighbourhood alone.",
  }),
  venue(3942, "chicago", "The Guesthouse Hotel", {
    hours: "Front desk 24 hours; check-in 16:00, check-out 10:00. Parking is by reservation and availability is limited.",
    link: "https://www.theguesthousehotel.com/book-now",
    description: "The Guesthouse Hotel is an Andersonville base for travellers who want an actual apartment-shaped stay: one- to three-bedroom suites, kitchens, balconies and a roof deck rather than a standard single-room hotel experience. It suits a group trip, a longer city stay or anyone who wants to cook before heading out.",
    vibe: "Andersonville suite hotel with full kitchens, balconies and a residential feel",
    vibe_tags: ["cozy", "chill", "luxury"],
  }, ["https://www.theguesthousehotel.com/book-now", "https://www.theguesthousehotel.com/2-bedrooms", "https://www.choosechicago.com/listing/the-guesthouse-hotel/"], {
    queue_wait: "There is no nightlife queue, but parking must be reserved and suite check-in begins at 16:00. The reservation holder must be 21 or older and present with matching ID and card, so coordinate group arrivals before the desk.",
    best_nights: "Choose it for Andersonville's restaurants and neighbourhood bars, or for a low-key evening on a private balcony or the roof deck in season. It is not marketed as a queer hotel, but it is well placed for LGBTQ+ Andersonville.",
    crowd_mix: "Families, friend groups, longer-stay guests, business travellers and neighbourhood visitors share a small suite property. The multi-bedroom layout changes the feel from a typical couple-focused hotel.",
    dress_code: "There is none. Pack for a residential suite, rooftop weather and the neighbourhood venues you plan to visit separately.",
    staff_inclusivity: "The hotel publishes a specific accessible two-bedroom suite with roll-in shower, support bars, lowered fixtures and captioned TV. It does not claim a standing queer programme, so location should not be overstated as an identity guarantee.",
  }),
];

const { data: rows, error } = await supabase.from("places").select("id,name,city,venue_intel").in("id", updates.map(({ id }) => id));
if (error) throw error;
if (rows.length !== updates.length) throw new Error(`Expected ${updates.length} targets, found ${rows.length}`);

for (const update of updates) {
  const row = rows.find(({ id }) => id === update.id);
  if (!row || row.name !== update.name || row.city !== update.city) throw new Error(`Target changed: ${update.id}`);
  for (const field of fields) if (!String(update.intel[field] || "").trim()) throw new Error(`Missing ${field}: ${update.name}`);
  update.patch.venue_intel = {
    ...(row.venue_intel || {}),
    ...update.intel,
    source_urls: update.sources,
    research_status: "current_operator_or_current_authoritative_source_verified",
    updated_at: checkedAt,
    topic_evidence: Object.fromEntries(fields.map((field) => [field, {
      status: "current_operator_or_current_authoritative_source_verified",
      checked_at: checkedAt,
      source_urls: update.sources,
    }])),
  };
  update.patch.seo_indexable = true;
  update.patch.seo_quality_status = "approved";
}

if (!APPLY) {
  console.log(JSON.stringify({ mode: "dry-run", cities: [...new Set(updates.map(({ city }) => city))], updates: updates.length }, null, 2));
} else {
  for (const update of updates) {
    const { data, error: updateError } = await supabase.from("places").update(update.patch).eq("id", update.id).eq("city", update.city).select("id");
    if (updateError) throw updateError;
    if (data.length !== 1) throw new Error(`Update affected ${data.length}: ${update.id}/${update.name}`);
  }
  console.log(JSON.stringify({ mode: "applied", updates: updates.length }, null, 2));
}
