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
