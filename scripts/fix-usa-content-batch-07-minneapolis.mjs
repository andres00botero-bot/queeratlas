import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const checkedAt = "2026-09-10T00:00:00Z";
const CITY = "minneapolis";
const EXPECTED_ROWS = 14;
const FIELDS = ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity"];
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const manual = new Map(Object.entries({
  2838: {
    patch: {
      hours: "Mon-Fri 15:00-02:00; Sat-Sun 13:00-02:00.",
      description: "The 19 Bar is Minneapolis's cash-only gay neighbourhood bar near Loring Park, operating since the 1950s and reopened after fire restoration in February 2025. The compact room is built around pool, darts, jukebox, karaoke and patio conversation rather than a large dance floor.",
    },
    sources: [
      "https://www.minneapolis.org/lgbtq-community/bars-clubs/",
      "https://www.minneapolis.org/things-to-do/music-nightlife/food-entertainment/",
      "https://www.cbsnews.com/minnesota/news/minneapolis-19-bar-reopens-after-fire/",
    ],
    intel: {
      queue_wait: "There is normally no formal line, but the small room and patio can reach comfortable capacity around karaoke, Pride and weekend closing hours. Bring cash because the bar remains cash-only.",
      best_nights: "Use an early evening for pool, jukebox and conversation; choose a published karaoke or drag date when the programme matters more than the neighbourhood-bar atmosphere.",
      crowd_mix: "Long-time gay regulars, younger queer locals, pool and darts players, Loring Park neighbours and visitors share a deliberately low-key historic bar.",
      dress_code: "Everyday casual clothing suits the dim neighbourhood setting; this is not a dress-to-impress dance club.",
      staff_inclusivity: "Its continuous gay-bar identity, documented reopening and current placement in Minneapolis's LGBTQ nightlife guide support the listing; the record makes no broader ownership claim.",
    },
  },
  2826: {
    patch: {
      hours: "Wed-Thu 16:00-22:00; Fri 12:00-22:00; Sat 11:00-22:00; Sun 11:00-21:00; closed Mon-Tue except private groups.",
      description: "A Bar of Their Own is a family-friendly Seward sports bar devoted exclusively to women's sports. Owner Jillian Hiscock's team publishes the screen and event schedule, serves food with vegan and gluten-free choices, and does not take reservations during normal service.",
    },
    sources: [
      "https://www.abaroftheirown.com/",
      "https://www.abaroftheirown.com/events",
      "https://www.abaroftheirown.com/aboutus",
    ],
    intel: {
      queue_wait: "The bar does not take reservations during public service, so Lynx games, finals and named watch parties reward early arrival. Monday and Tuesday group use is arranged privately rather than walk-in service.",
      best_nights: "Pick the official screen schedule for the exact women's team or sport you want; Thursday trivia and community giveback events create a different visit from a high-demand Lynx watch party.",
      crowd_mix: "Women's-sports supporters, LGBTQ+ fans, families, teams, book-club participants and allies gather across ages in a sports-first room.",
      dress_code: "Team jerseys, supporter colours and ordinary casual clothing dominate; there is no nightclub-style dress expectation.",
      staff_inclusivity: "The owner describes the venue as an inclusive, family-friendly home for women's-sports fans, and the programme includes queer book-club and trans-athlete support events.",
    },
  },
  2833: {
    patch: {
      hours: "Mon-Thu 15:00-00:00; Fri 15:00-02:00; Sat 11:00-02:00; Sun 10:00-00:00. Kitchen hours are shorter.",
      description: "EAGLE MPLS is an East Town gay bar and grill with a heated dog-friendly patio, weekday food service, weekend brunch and Show Tunes Sundays. Its leather-bar lineage remains visible, while the operator explicitly welcomes all LGBTQIA+ identities.",
    },
    sources: ["https://www.eaglempls.com/", "https://www.minneapolis.org/lgbtq-community/bars-clubs/"],
    intel: {
      queue_wait: "Ordinary afternoons are straightforward; Sunday brunch, the 16:00 show-tunes programme, Pride and DJ dates can crowd the bar and heated patio. Kitchen service ends before the bar.",
      best_nights: "Sunday combines brunch with show tunes, warm-weather evenings favour the patio, and named DJ or leather-community programmes provide the more club-oriented experience.",
      crowd_mix: "Gay men, leather-community regulars, LGBTQIA+ neighbours, brunch diners and dog owners mix differently between patio daylight and late events.",
      dress_code: "Casual bar clothing works throughout; leather is culturally at home on relevant nights but is neither required nor an everyday entry condition.",
      staff_inclusivity: "The operator explicitly calls EAGLE MPLS a neighbourhood gay bar for all LGBTQIA+ people and states respect for every race, gender and identity.",
    },
  },
  2829: {
    patch: {
      hours: "Wed 16:00-02:00; Thu 18:00-02:00; Fri-Sat 16:00-03:00; Sun 20:00-02:00; closed Mon-Tue. Published nights are 18+ with age-tiered cover.",
      description: "Gay 90's is a large downtown nightclub at 408 Hennepin Avenue with multiple floors and bars, La Femme drag, burlesque, karaoke and rotating dance programmes. Its current door information publishes 18+ access on operating nights and different cover prices for ages 18-20 and 21+.",
    },
    sources: ["https://gay90s.com/contact-us/", "https://gay90s.com/specials/", "https://www.minneapolis.org/lgbtq-community/bars-clubs/"],
    intel: {
      queue_wait: "Weekend security, bag checks and cover payment create the main delay. Bags larger than 8 by 10 inches are prohibited, and bottle-service reservations do not replace the cover charge.",
      best_nights: "Choose the current calendar: La Femme and burlesque suit performance visits, while karaoke, Latin, foam and other named parties use different rooms and attract different audiences.",
      crowd_mix: "Queer dancers, drag and burlesque audiences, straight allies and eligible 18-20-year-old guests share a large club; individual rooms and programmes can feel substantially different.",
      dress_code: "Dance-club and expressive performance looks fit, but the practical fixed rule is the small-bag policy; check individual theme notices for anything more specific.",
      staff_inclusivity: "The venue presents itself as a gay-nightlife institution open across orientations, while its published age bands and covers give younger adult visitors unusually concrete access information.",
    },
  },
  2860: {
    patch: {
      description: "Hotel Emery is a downtown Autograph Collection hotel in a converted bank building, with a dramatic lobby, Spyhouse Coffee, Giulia restaurant and skyway access. Its completed June 2026 Travel with Pride campaign donated $10 per consumed room night to Minneapolis-based QUEERSPACE Collective.",
    },
    sources: ["https://www.hotelemery.com/", "https://www.hotelemery.com/offers/travel-with-pride/"],
    intel: {
      queue_wait: "Convention arrivals, weekday skyway traffic and valet demand can slow check-in; confirm parking and adapted-room details directly before a high-occupancy stay.",
      best_nights: "Choose it for bank-hall design, Giulia dining and covered downtown access; the QUEERSPACE donation was tied specifically to completed June 2026 stays and should not be presented as a permanent benefit.",
      crowd_mix: "Design travellers, business guests, restaurant diners and Pride visitors overlap in a polished downtown property rather than a queer-exclusive hotel.",
      dress_code: "Modern city casual fits the lobby and coffee shop; Giulia and evening functions tend toward understated smart-casual.",
      staff_inclusivity: "The concrete inclusion evidence is Hotel Emery's first-party June 2026 campaign supporting LGBTQ+ youth through QUEERSPACE; no queer ownership claim is made.",
    },
  },
  2817: {
    patch: {
      hours: "Thu 17:00-22:00; Fri 17:00-02:00; Sat 18:00-02:00.",
      description: "Jetset Underground is the revived Jetset at 205 East Hennepin Avenue: a compact gay-oriented lounge and basement dance club with cocktails and DJs. Current city tourism, a 2026 Minneapolis liquor-license renewal and current event use confirm that the Northeast location is active.",
    },
    sources: [
      "https://www.instagram.com/jetsetunderground/",
      "https://www.minneapolis.org/lgbtq-community/bars-clubs/",
      "https://lims.minneapolismn.gov/Download/CommitteeReport/4732/COW-04072026-CommitteeReport.pdf",
      "https://mspmag.com/travel-and-visitors-guide/one-city-five-ways-2026/",
    ],
    intel: {
      queue_wait: "The basement footprint is much smaller than the downtown mega-clubs, so Friday and Saturday DJ peaks can produce a capacity wait. Thursday's shorter lounge service is normally calmer.",
      best_nights: "Thursday suits cocktails and conversation; Friday and Saturday after the DJs begin are the reason to choose Jetset for dancing.",
      crowd_mix: "Gay men anchor the room alongside queer dancers, cocktail groups and allies; the smaller venue creates a tighter social mix than Gay 90's or The Saloon.",
      dress_code: "Neat nightlife casual and expressive clubwear both fit the New York-style lounge; no permanent costume or leather requirement is published.",
      staff_inclusivity: "Current official tourism describes Jetset as geared toward the gay community, while the 2026 city licence record verifies the exact East Hennepin operation.",
    },
  },
  2823: {
    patch: {
      hours: "Wed-Thu 16:00-22:00; Fri 16:00-00:00; Sat 11:00-00:00; Sun 11:00-22:00; closed Mon-Tue. Ticketed events can extend or alter access.",
      description: "LUSH Lounge & Theater is an LGBTQ+ restaurant, lounge and dedicated performance room at 990 Central Avenue NE. Its weekly mix includes drag brunch, bingo, cabaret, burlesque, trivia, queer craft gatherings and DJ programmes, so the named event matters more than a generic 'gay bar' label.",
    },
    sources: ["https://lushmpls.com/", "https://www.minneapolis.org/lgbtq-community/bars-clubs/"],
    intel: {
      queue_wait: "The lounge can take walk-ins, but ticketed drag brunches and theatre shows use reservations and may sell out. Private events can also shorten normal Friday service.",
      best_nights: "Use Wednesday or Thursday for bingo, crafts or trivia; reserve a Saturday drag brunch or a named evening cabaret when performance is the priority.",
      crowd_mix: "Queer and trans adults, drag and burlesque audiences, brunch groups, theatre patrons and allies vary sharply with the programme; some advertised brunches are all-ages.",
      dress_code: "Restaurant casual works in the lounge, while cabaret and drag audiences often dress celebratorily; the ticket listing, not a universal house code, governs themed attire.",
      staff_inclusivity: "LUSH's current calendar includes gender-inclusive drag, trans-centred work and community partnerships, providing venue-specific evidence beyond its LGBTQ+ identity.",
    },
  },
  2843: {
    patch: {
      type: "store",
      hours: "Mon-Thu 10:00-21:00; Fri-Sun 10:00-22:00. Confirm holiday changes directly.",
      description: "Rainbow Road is a specialist store at 109 West Grant Street near Loring Park, focused on men's underwear and swimwear alongside Pride merchandise, gifts, books and adult products. It is a practical daytime or pre-nightlife retail stop rather than a gallery or entertainment venue.",
    },
    sources: ["https://rainbowrd.com/", "https://www.waze.com/live-map/directions/rainbow-road-w-grant-st-109-minneapolis?to=place.w.174784962.1747980689.2652643"],
    intel: {
      queue_wait: "Normal retail entry is immediate; Pride weekend and pre-event shopping can make fitting and staff assistance slower in the compact store.",
      best_nights: "Visit in daytime or before an evening out when sizing advice, swimwear or a specific Pride item is useful; it is not an event-led destination.",
      crowd_mix: "Gay men form a core apparel audience alongside broader LGBTQ+ shoppers, Pride visitors, gift buyers and customers seeking adult products.",
      dress_code: "Ordinary shopping clothes are appropriate; handle fitting, sizing questions and other customers' privacy as in any specialist apparel store.",
      staff_inclusivity: "The sustained queer-focused product range and Loring Park context support inclusion in the guide, without asserting queer ownership that the official site does not document.",
    },
  },
  2859: {
    patch: {
      description: "Rand Tower Hotel is an Art Deco Tribute Portfolio property in a restored 1929 downtown tower, with Bar Rufus, skyway access and valet parking. Its first-party Pride & Joy package is bookable for stays through 30 September 2026 and includes champagne, a dining credit, valet and a possible upgrade.",
    },
    sources: [
      "https://www.marriott.com/en-us/hotels/msptr-rand-tower-hotel-minneapolis-a-tribute-portfolio-hotel/overview/",
      "https://www.marriott.com/offers/pride-and-joy-offer-OFF-223339/MSPTR-msptr-rand-tower-hotel-minneapolis-a-tribute-portfolio-hotel",
    ],
    intel: {
      queue_wait: "Valet and reception become busiest around downtown events; package upgrades remain availability-dependent, so request access needs and confirm inclusions before arrival.",
      best_nights: "Use it for architecture, Bar Rufus and central skyway access; the Pride & Joy rate is specifically valid for stays from 10 April through 30 September 2026.",
      crowd_mix: "Pride couples and LGBTQ+ city-break guests mix with architecture enthusiasts, business travellers and downtown event audiences.",
      dress_code: "Polished city casual fits the restored lobby; Bar Rufus and dinner lean smart-casual without a formal hotel dress code.",
      staff_inclusivity: "The hotel's own Pride & Joy package is current, concrete LGBTQ+ welcome evidence; it does not establish queer ownership or guarantee availability beyond its stated dates.",
    },
  },
  2836: {
    patch: {
      hours: "Programme-led: recurring drag shows Fri-Sat at 19:00 and drag brunch Sun at 12:00; use the ticket calendar for Tue-Thu and special-event doors.",
      description: "Roxy's Cabaret is a queer performance venue at 1333 Nicollet Mall with a scratch kitchen and a programme spanning drag, brunch, karaoke, film and game nights. Friday and Saturday drag shows recur at 19:00, Sunday brunch starts at noon, and many shows require timed reservations.",
    },
    sources: ["https://roxyscabaret.com/", "https://www.minneapolis.org/lgbtq-community/bars-clubs/"],
    intel: {
      queue_wait: "Timed reservations are used to stagger seating, and late arrivals are only accommodated before the show begins. Buy the exact performance rather than relying on walk-in cabaret seating.",
      best_nights: "Friday or Saturday at 19:00 provides the recurring evening drag format; Sunday noon is drag brunch, while karaoke, films and one-off guests appear on separate dated listings.",
      crowd_mix: "Drag fans, queer adults, brunch groups, theatre audiences and allies attend; accompanied under-18s are allowed when their adult considers the show's strong language appropriate.",
      dress_code: "Celebratory cabaret fashion is common but not compulsory; practical seated-show clothing works, and themed one-offs may invite a specific look.",
      staff_inclusivity: "Roxy's explicitly links its work to drag's LGBTQIA2+ advocacy tradition and publishes clear age, food and reservation information for guests.",
    },
  },
  2861: {
    patch: {
      description: "Sheraton Minneapolis Downtown Convention Center is a large full-service hotel at 1313 Nicollet Mall, a few blocks from Loring Park. Twin Cities Pride's current accommodation page names it, supplies festival-weekend market codes and links directly to booking.",
    },
    sources: [
      "https://www.marriott.com/en-us/hotels/mspdt-sheraton-minneapolis-downtown-convention-center/overview/",
      "https://tcpride.org/plan-your-visit/",
    ],
    intel: {
      queue_wait: "Pride and convention turnover can congest reception and parking; use the published Pride market code only for eligible dates and confirm accessible-room details before arrival.",
      best_nights: "The practical advantage is short access to Loring Park, the convention centre and Nicollet Mall rather than boutique nightlife atmosphere.",
      crowd_mix: "Pride festival guests share a high-capacity convention hotel with conference groups, families and business travellers.",
      dress_code: "General travel clothing is normal; conferences and hotel functions may set their own business or event attire.",
      staff_inclusivity: "The current Twin Cities Pride accommodation listing and festival codes provide specific partner evidence; the hotel is not described as queer-owned.",
    },
  },
  2862: {
    patch: {
      link: "https://www.hilton.com/en/hotels/mspupup-the-lofton-hotel/",
      description: "The Lofton is a 248-room Tapestry Collection hotel at 601 North First Avenue, opposite Target Center and steps from First Avenue. Twin Cities Pride currently links it as an accommodation option, while Hilton documents two restaurants, event parking and a 16:00 check-in.",
    },
    sources: ["https://www.hilton.com/en/hotels/mspupup-the-lofton-hotel/", "https://tcpride.org/plan-your-visit/"],
    intel: {
      queue_wait: "Target Center and First Avenue events can raise self-parking prices and slow arrival; standard check-in is 16:00, so coordinate early access rather than assuming it.",
      best_nights: "Choose The Lofton for arena, theatre and Hennepin nightlife access; the walk to The Saloon and Gay 90's is more relevant than a resort-style stay.",
      crowd_mix: "Pride and queer-nightlife visitors mix with concertgoers, sports fans, theatre audiences and business travellers in a busy downtown hotel.",
      dress_code: "Contemporary city casual fits the property; concerts, games and private functions determine most visible variation in clothing.",
      staff_inclusivity: "Twin Cities Pride's current accommodation page supplies the LGBTQ+ relevance, while Hilton confirms current operation and facilities; no ownership claim is made.",
    },
  },
  2841: {
    patch: {
      hours: "Sun-Thu 12:00-02:00; Fri-Sat 12:00-03:00. Sun-Thu becomes 18+ after 21:00; event rules may differ.",
      description: "The Saloon is a downtown LGBTQ+ institution at 830 Hennepin Avenue with several bars, a large dance floor, patio, grill and a programme of DJs, drag, karaoke and Pride block events. Its current hours page also gives the unusual detail that Sunday through Thursday becomes 18+ after 21:00.",
    },
    sources: ["https://www.saloonmn.com/drink-specials", "https://www.saloonmn.com/thegrill", "https://www.minneapolis.org/lgbtq-community/bars-clubs/"],
    intel: {
      queue_wait: "Multiple service bars reduce ordinary drink waits, but Pride, headline parties and late weekend security can still create a door line. Bring valid ID and verify the named event's age rule.",
      best_nights: "Early hours suit the grill and patio; Friday and Saturday bring the longest dance service, while drag, karaoke and DJ audiences should follow the exact programme.",
      crowd_mix: "Gay men remain central alongside a broad LGBTQ+ and ally audience; daytime bar guests, 18-20-year-old weeknight visitors and late dancers occupy different periods.",
      dress_code: "Daytime bar casual shifts toward expressive clubwear after dark; themed parties may encourage a look but the regular venue publishes no single formal code.",
      staff_inclusivity: "The Saloon's long-standing LGBTQ+ identity is supported by its operator and official tourism, while its published 18+ weeknight policy makes access expectations unusually transparent.",
    },
  },
  2821: {
    patch: {
      type: "store",
      hours: "Tue-Fri 13:00-20:00; Sat 11:00-20:00; Sun 11:00-17:00; closed Mon.",
      description: "The Smitten Kitten is a trans- and queer-owned, liberation-focused sex shop at 3010 Lyndale Avenue South. Its curated range emphasises body-safe products and gender affirmation, while education, consent, mutual aid and discreet fulfilment are part of the operating model rather than generic retail claims.",
    },
    sources: ["https://smittenkittenonline.com/", "https://www.minneapolis.org/lgbtq-community/businesses/"],
    intel: {
      queue_wait: "Normal shop entry is simple; workshops, fundraisers and mutual-aid activity can have separate capacity or registration. The store currently notes that its cash-assistance request list is closed.",
      best_nights: "Weekday afternoons favour unhurried product and sizing questions; choose a separately announced workshop or benefit only when that specific programme is relevant.",
      crowd_mix: "Queer and trans shoppers, couples, educators, kink communities and sex-positive customers use the store with different privacy and advice needs.",
      dress_code: "Everyday retail clothing is appropriate; consent, discreet conversation and respect for other shoppers' privacy are the meaningful etiquette.",
      staff_inclusivity: "The operator explicitly identifies the business as trans- and queer-owned and centres liberation, body-safe selection, sex education and mutual aid.",
    },
  },
}));

const { data: rows, error } = await supabase
  .from("places")
  .select("id,name,city,link,venue_intel")
  .eq("city", CITY)
  .order("id");
if (error) throw error;
if (rows.length !== EXPECTED_ROWS) throw new Error(`Guard expected ${EXPECTED_ROWS} Minneapolis rows, found ${rows.length}`);
if (manual.size !== EXPECTED_ROWS) throw new Error(`Guard expected ${EXPECTED_ROWS} manual reviews, found ${manual.size}`);

for (const row of rows) {
  const entry = manual.get(String(row.id));
  if (!entry) throw new Error(`Unreviewed Minneapolis row: ${row.id}/${row.name}`);
  const sources = [...new Set(entry.sources.filter((url) => /^https?:\/\//.test(url)))];
  if (!sources.length) throw new Error(`No verified source: ${row.id}/${row.name}`);
  const details = { ...row.venue_intel, ...entry.intel };
  for (const field of FIELDS) if (!String(details[field] || "").trim()) throw new Error(`Missing ${field}: ${row.id}/${row.name}`);
  entry.patch = {
    ...entry.patch,
    seo_indexable: true,
    seo_quality_status: "approved",
    venue_intel: {
      ...details,
      source_urls: sources,
      research_status: "current_operator_or_authoritative_local_source_verified",
      updated_at: checkedAt,
      topic_evidence: Object.fromEntries(FIELDS.map((field) => [field, {
        status: "current_operator_or_authoritative_local_source_verified",
        checked_at: checkedAt,
        source_urls: sources,
      }])),
    },
  };
}

if (!APPLY) {
  console.log(JSON.stringify({ mode: "dry-run", city: CITY, reviewed: rows.length }, null, 2));
} else {
  for (const row of rows) {
    const { data, error: updateError } = await supabase
      .from("places")
      .update(manual.get(String(row.id)).patch)
      .eq("id", row.id)
      .eq("city", CITY)
      .select("id");
    if (updateError) throw updateError;
    if (data.length !== 1) throw new Error(`Update affected ${data.length}: ${row.id}/${row.name}`);
  }
  console.log(JSON.stringify({ mode: "applied", city: CITY, reviewed: rows.length }, null, 2));
}
