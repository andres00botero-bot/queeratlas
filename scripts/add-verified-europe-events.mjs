import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

const supabase = createClient(url, key, { auth: { persistSession: false } });
const apply = process.argv.includes("--apply");

function event({ name, city, date, endDate = date, location, description, link, vibe, vibe_tags, intel }) {
  return {
    name, city, date, start_date: date, end_date: endDate, location, description, link, ticket_url: link,
    vibe, vibe_tags, event_status: "scheduled",
    event_intel: { ...intel, source_urls: [link], research_status: "verified_source", updated_at: new Date().toISOString() },
  };
}

const events = [
  event({
    name: "69/96: The Final Descent", city: "copenhagen", date: "2026-10-24",
    location: "Basement, Enghavevej 42, 1674 Copenhagen V, Denmark",
    link: "https://www.copenhagenpride.dk/events/",
    vibe: "queer pre-Halloween underground party", vibe_tags: ["electronic", "underground", "social"],
    description: "Copenhagen Pride marks the final dark chapter of its 30-year anniversary with 69/96: The Final Descent at Basement. The queer pre-Halloween party runs from 22:00 on 24 October until 05:00 the following morning and is listed at DKK 100.",
    intel: { entry_wait: "The event runs 22:00–05:00. Arrive close to opening if you want to avoid the late-night entry peak at Basement.", best_arrival: "Come before 23:00 to settle in before the Halloween crowd fills the underground room; the official listing gives a DKK 100 ticket price.", crowd_mix: "A Copenhagen Pride anniversary crowd of queer nightlife regulars, Halloween stylists, allies and people drawn to Basement's underground setting.", dress_code: "No rule is published, but the event is explicitly a dark queer pre-Halloween party; costume, clubwear and practical dance shoes all fit.", host_inclusivity: "Copenhagen Pride is the host and frames the night as part of its anniversary programme, rooted in the city's queer community and Stonewall history." },
  }),
  event({
    name: "Queer Café – November 2026", city: "odense", date: "2026-11-12",
    location: "Studenterhus Odense, Amfipladsen 6, 5000 Odense C, Denmark",
    link: "https://odensepride.dk/vaer-med/arrangementer/",
    vibe: "queer community café and social gathering", vibe_tags: ["social", "cozy", "cultural"],
    description: "Odense Pride's Queer Café takes place at Studenterhus Odense on 12 November from 16:00 to 20:00. It is part of the organisation's year-round programme for gathering the local LGBTQ+ community beyond the annual Pride day.",
    intel: { entry_wait: "This is an early-evening community event running 16:00–20:00, so entry is likely calmer than a late-night club queue.", best_arrival: "Arrive shortly after 16:00 if you want the most time to meet people before the four-hour café session ends.", crowd_mix: "A local Odense LGBTQ+ community gathering, likely mixing students, regular Pride volunteers, newcomers and allies in a social setting.", dress_code: "Casual, comfortable daytime clothes suit a Studenterhus community café; no special dress requirement is published.", host_inclusivity: "Odense Pride explicitly runs year-round activities to strengthen the queer community in Odense, making this a low-pressure social entry point." },
  }),
  event({
    name: "Queer Café – December 2026", city: "odense", date: "2026-12-10",
    location: "Studenterhus Odense, Amfipladsen 6, 5000 Odense C, Denmark",
    link: "https://odensepride.dk/vaer-med/arrangementer/",
    vibe: "queer community café and social gathering", vibe_tags: ["social", "cozy", "cultural"],
    description: "Odense Pride hosts its December Queer Café at Studenterhus Odense on 10 December from 16:00 to 20:00. The recurring café is part of the local Pride organisation's programme of activities throughout the year.",
    intel: { entry_wait: "The published session is 16:00–20:00. This is a scheduled café gathering, not a ticketed late-night event.", best_arrival: "Start early if you are visiting for the first time: arriving near 16:00 gives the longest window for conversation before the event closes.", crowd_mix: "An Odense queer-community mix of students, residents, Pride supporters, newcomers and allies meeting in an informal early-evening environment.", dress_code: "Wear whatever feels comfortable for a community café. Winter layers are useful for travel, but no dress code is listed.", host_inclusivity: "The host is Odense Pride, whose stated purpose is strengthening the LGBTQ+ community in Odense and beyond through year-round activities." },
  }),
  event({
    name: "Aarhus Pride 2027", city: "aarhus", date: "2027-05-29",
    location: "Rådhusparken, 8000 Aarhus C, Denmark",
    link: "https://www.visitdenmark.com/denmark/plan-your-trip/aarhus-pride-gdk763771",
    vibe: "family-friendly LGBTQ+ Pride parade and festival", vibe_tags: ["festival", "cultural", "social"],
    description: "Aarhus Pride takes place on Saturday 29 May 2027 from 12:00. The city-wide celebration combines a colourful parade with music at the Pride stage, picnics in the Pride area and events hosted by local organisations around Aarhus.",
    intel: { entry_wait: "The official start time is 12:00. Arrive before noon if you want to join the parade atmosphere rather than meeting it after the route is underway.", best_arrival: "Use the early afternoon for the parade and Pride stage, then stay into the afternoon to explore local-organisation events across the city.", crowd_mix: "A broad, family-friendly Aarhus mix of LGBTQ+ people, children, friends, colleagues, local organisations and visitors from the surrounding region.", dress_code: "Rainbow, costume and casual picnic-ready clothing are all fitting; choose shoes suitable for a parade route and time outdoors in Rådhusparken.", host_inclusivity: "The organiser describes Aarhus Pride as welcoming everyone regardless of gender, age, ethnicity, religion or political belief, with a particular family-friendly emphasis." },
  }),
  event({
    name: "LGBTIQA Winterdays and Christmas Avenue 2026", city: "berlin", date: "2026-11-04", endDate: "2026-12-23",
    location: "Nollendorfplatz, 10777 Berlin, Germany",
    link: "https://www.berlin.de/en/events/queer/",
    vibe: "LGBTQIA+ winter market, stage programme and community gathering", vibe_tags: ["festival", "cultural", "cozy"],
    description: "Berlin's LGBTQIA Winterdays and Christmas Avenue run from 4 November to 23 December at Nollendorfplatz. The queer winter market combines seasonal lighting, a varied stage programme, food and drinks in the heart of Schöneberg.",
    intel: { entry_wait: "This is a multi-week outdoor market rather than a single-ticket show. Visit earlier on weekdays for a calmer arrival than the busiest Friday and Saturday evening periods.", best_arrival: "Go after dusk for the lighting and stage atmosphere, but arrive earlier in the evening if you want time to explore food stalls before the crowd peaks.", crowd_mix: "A Schöneberg mix of Berlin LGBTQIA+ locals, visitors, neighbours, allies and people looking for a queer seasonal alternative to a conventional Christmas market.", dress_code: "Warm layers and weatherproof shoes matter most for an outdoor Berlin winter market; festive styling is welcome but no dress code is published.", host_inclusivity: "The event is explicitly LGBTQIA+-focused and takes place at Nollendorfplatz, a longstanding centre of Berlin's queer community." },
  }),
  event({
    name: "Viennese Rainbow Ball 2027", city: "vienna", date: "2027-01-23",
    location: "Austria Trend Parkhotel Schönbrunn, Hietzinger Hauptstraße 14-16, 1130 Vienna, Austria",
    link: "https://regenbogenball.at/en/",
    vibe: "formal LGBTIQ+ charity ball and queer community celebration", vibe_tags: ["cultural", "luxury", "social"],
    description: "The 29th Vienna Rainbow Ball takes place on 23 January 2027 at the Austria Trend Parkhotel Schönbrunn. The formal queer ball celebrates diversity and visibility while supporting HOSI Vienna's community work, Rainbow Parade and Das Gugg community centre.",
    intel: { entry_wait: "Advance tickets go on sale 1 November 2026 at 12:00. This is a formal seated ball, so arrive early enough for ticket checks, cloakroom and finding your booked table or loge.", best_arrival: "Plan to arrive before the ball programme starts rather than treating it as a late club entry; table categories and seating areas are sold separately.", crowd_mix: "A dressed-up Vienna LGBTIQ+ community, allies, ballroom regulars, supporters of HOSI Vienna and international guests drawn to the Schönbrunn setting.", dress_code: "This is a formal Viennese ball. Check the organiser's published dress-code guidance before booking, and plan attire appropriate for a gala ballroom evening.", host_inclusivity: "The Rainbow Ball explicitly welcomes people of every sexual orientation and gender identity, and directs net proceeds to HOSI Vienna's LGBTIQ community work." },
  }),
  event({
    name: "WASt LGBTIQ Conference 2026: Queer intersektional gelesen", city: "vienna", date: "2026-11-20",
    location: "Vienna City Hall, Wappensaal, Friedrich-Schmidt-Platz 1, 1010 Vienna, Austria",
    link: "https://www.wien.gv.at/veranstaltungen/lqbtiq",
    vibe: "free LGBTIQ+ intersectionality conference", vibe_tags: ["cultural", "social", "chill"],
    description: "Vienna's Anti-Discrimination Office for LGBTIQ Affairs hosts its 2026 conference, Queer intersektional gelesen, at City Hall's Wappensaal on 20 November from 09:00 to 17:00. The City of Vienna lists the event as free.",
    intel: { entry_wait: "The event runs 09:00–17:00 and is free. Arrive before the morning opening to allow for City Hall entry and registration procedures.", best_arrival: "Come for the 09:00 opening if you want the full conference arc; it is a daytime learning and discussion programme rather than an evening social event.", crowd_mix: "A Vienna mix of LGBTIQ+ community members, advocates, public-sector staff, researchers, allies and people interested in intersectional anti-discrimination work.", dress_code: "Business-casual or comfortable daytime conference clothing fits the venue; no formal dress code is listed by the City of Vienna.", host_inclusivity: "The event is hosted by Vienna's official Anti-Discrimination Office for LGBTIQ Affairs and is structured around queer intersectionality and public access." },
  }),
  event({
    name: "HEAT by UNDR – Kinky House & Techno Party", city: "berlin", date: "2026-11-21",
    location: "Insomnia, Alt-Tempelhof 17-19, 12099 Berlin, Germany",
    link: "https://ra.co/events/2379555",
    vibe: "sex-positive LGBTQIA+ house and techno club night", vibe_tags: ["techno", "fetish", "underground"],
    description: "HEAT by UNDR brings a sex-positive house-and-techno night to Insomnia Berlin on 21 November from 22:00 to 06:00. PyjamaMama, SIKAE and ZLATOMIRA play the House main floor, while Epicx and Mia Mangata lead the Techno dungeon; the event is presented as LGBTQIA+-friendly and a safe space.",
    intel: { entry_wait: "The event runs 22:00–06:00. A presale ticket gives priority-queue access, but arrive with enough time for Insomnia's door process and dress-code assessment.", best_arrival: "Arrive near 22:00 if you want time on both the House main room and the Techno dungeon before the late-night peak.", crowd_mix: "A sex-positive, LGBTQIA+-friendly Berlin club crowd drawn to house, techno, fetish fashion and a consent-conscious nightlife environment.", dress_code: "The stated code is sexy, kinky, fetish or futuristic; streetwear is not accepted, so prepare an intentional outfit rather than standard club basics.", host_inclusivity: "UNDR explicitly describes HEAT as a safe, LGBTQIA+-friendly experience. The event's format centres consent-aware, sex-positive club culture." },
  }),
  event({
    name: "RE:CODED – Gay Techno Fetish Party", city: "berlin", date: "2026-11-13",
    location: "PKH Warehouse, Dorotheenstraße 30, 10117 Berlin, Germany",
    link: "https://recodedparty.com/",
    vibe: "gay techno and fetish party", vibe_tags: ["techno", "fetish", "men_only"],
    description: "RE:CODED is a gay techno fetish party at PKH Warehouse on 13 November, with doors at 22:00. The programme splits dark techno and house across two floors and lists Ben Manson among the techno artists; tickets are sold via Eventjet and valid ID is required.",
    intel: { entry_wait: "Doors open at 22:00. Bring valid ID and your Eventjet ticket; ticket releases close on their stated dates or when sold out.", best_arrival: "Arrive early for the lower early-bird price window and to enter before the warehouse's main late-night rush.", crowd_mix: "A men-focused gay fetish and techno crowd looking for darker sound, a dress-code-led environment and a sex-positive warehouse night.", dress_code: "The organiser states that the dress code counts. Treat fetish, leather, harness, sportswear or intentional club styling as part of the event rather than an optional extra.", host_inclusivity: "RE:CODED presents itself as a space for men to let go, be seen and be respected; its entry framing is specifically gay and fetish-oriented." },
  }),
  event({
    name: "NEST with Mood II Swing, Gallegos, Sherø + more", city: "berlin", date: "2026-11-27",
    location: "Kater, Holzmarktstraße 25, 10243 Berlin, Germany",
    link: "https://ra.co/events/2543968",
    vibe: "queer pro-trans acid house, techno and ballroom rave", vibe_tags: ["techno", "underground", "social"],
    description: "NEST returns to Kater Berlin on 27 November from 22:00 to 08:00 with Mood II Swing, Gallegos, Sherø, Bézier, Esther Dune, Qualia Trax and more. The queer, fiercely pro-trans night spans acid house, techno, deep house and ballroom across Kater's rooms.",
    intel: { entry_wait: "The night starts at 22:00 and has limited RA presale plus more tickets at the club. A presale ticket does not guarantee door entry, though refusal is refunded by RA excluding fees.", best_arrival: "Arrive early if you want the full multi-room programme and to avoid relying on a later door decision after the limited presale allocation is exhausted.", crowd_mix: "A queer, pro-trans dance-floor crowd for acid house, techno, deep house and ballroom, with organisers asking guests to make space for the community's safety.", dress_code: "No fixed outfit rule is published. Wear clothes you can dance in for ten hours and respect the organisers' request to use space considerately.", host_inclusivity: "NEST explicitly states zero tolerance for homophobia, transphobia, racism and discrimination, and identifies community comfort and safety as its priority." },
  }),
];

const intelFields = ["entry_wait", "best_arrival", "crowd_mix", "dress_code", "host_inclusivity"];
for (const row of events) {
  const missing = ["name", "city", "date", "location", "description", "link", "ticket_url", "vibe"].filter((field) => !row[field]);
  const incompleteIntel = intelFields.filter((field) => !row.event_intel?.[field] || row.event_intel[field].length < 24);
  if (missing.length || !row.vibe_tags?.length || incompleteIntel.length || !row.event_intel?.source_urls?.length) {
    throw new Error(`Incomplete event data for ${row.name}: ${[...missing, ...incompleteIntel].join(", ")}`);
  }
}

for (const row of events) {
  const { data: existing, error: readError } = await supabase.from("events").select("id").eq("name", row.name).eq("city", row.city).eq("date", row.date).maybeSingle();
  if (readError) throw readError;
  if (!existing && apply) {
    const { error } = await supabase.from("events").insert(row);
    if (error) throw error;
  }
}

console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", checked: events.length }, null, 2));
