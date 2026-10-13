import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

const supabase = createClient(url, key, { auth: { persistSession: false } });
const apply = process.argv.includes("--apply");

const events = [
  { name: "Queer Trash Trivia", city: "toronto", date: "2026-11-07", link: "https://comedybar.ca/shows/queer-trash-trivia", vibe: "queer comedy and trivia night", vibe_tags: ["social", "cultural"] },
  { name: "Queer Trash Trivia", city: "toronto", date: "2026-12-05", link: "https://comedybar.ca/shows/queer-trash-trivia", vibe: "queer comedy and trivia night", vibe_tags: ["social", "cultural"] },
  { name: "Toronto Burlesque Festival 2026", city: "toronto", date: "2026-11-12", end_date: "2026-11-15", link: "https://www.showpass.com/the-toronto-burlesque-festival-daily-2/", vibe: "queer-led burlesque, cabaret and drag festival", vibe_tags: ["drag", "cultural", "festival"] },
  { name: "Science Is a Drag: All Stars", city: "toronto", date: "2026-11-25", link: "https://www.ticketmaster.ca/science-is-a-drag-all-stars-toronto-ontario-11-25-2026/event/100065415056954A", vibe: "science-themed drag performance", vibe_tags: ["drag", "cultural"] },
  { name: "The Jinkx & DeLa Holiday Show", city: "toronto", date: "2026-11-19", link: "https://www.ticketmaster.ca/jinkx-monsoon-billets/artist/2042992", vibe: "holiday drag and comedy show", vibe_tags: ["drag", "cultural"] },
  { name: "The Jinkx & DeLa Holiday Show", city: "montreal", date: "2026-11-18", link: "https://www.ticketmaster.ca/jinkx-monsoon-billets/artist/2042992", vibe: "holiday drag and comedy show", vibe_tags: ["drag", "cultural"] },
  { name: "The Jinkx & DeLa Holiday Show", city: "ottawa", date: "2026-11-20", link: "https://www.ticketmaster.ca/jinkx-monsoon-billets/artist/2042992", vibe: "holiday drag and comedy show", vibe_tags: ["drag", "cultural"] },
  { name: "Jimbo Ruins XXXMas", city: "montreal", date: "2026-12-04", link: "https://www.ticketmaster.ca/search?page=1&q=the+drag", vibe: "holiday drag performance", vibe_tags: ["drag", "cultural"] },
  { name: "That's Gay! Comedy", city: "vancouver", date: "2026-11-13", link: "https://www.showpass.com/thats-gay/", vibe: "queer comedy showcase", vibe_tags: ["cultural", "social"] },
  { name: "GachaPOP! Street Fighter", city: "vancouver", date: "2026-11-13", link: "https://www.eventbrite.ca/e/gachapop-street-fighter-tickets-2002833159896", vibe: "queer Asian drag performance", vibe_tags: ["drag", "cultural"] },
  { name: "Jimbo Ruins XXXMas", city: "vancouver", date: "2026-12-06", link: "https://www.ticketmaster.ca/search?page=1&q=the+drag", vibe: "holiday drag performance", vibe_tags: ["drag", "cultural"] },
  { name: "Aye Aye Captain! Pirate Pageant", city: "vancouver", date: "2027-01-23", link: "https://www.eventbrite.ca/e/aye-aye-captain-pirate-pageant-tickets-2000520801570", vibe: "queer drag pageant and fundraiser", vibe_tags: ["drag", "social", "cultural"] },
  { name: "Vancouver Taboo Show 2027", city: "vancouver", date: "2027-02-05", end_date: "2027-02-07", link: "https://tabooshows.com/events/taboo-vancouver-2027", vibe: "LGBTQ-friendly adult lifestyle and wellness expo", vibe_tags: ["fetish", "festival"] },
  { name: "Alberta Burlesque Rodeo 2026", city: "calgary", date: "2026-11-20", end_date: "2026-11-21", link: "https://www.showpass.com/abr2026/", vibe: "trans and gender-nonconforming burlesque competition", vibe_tags: ["drag", "cultural"] },
  { name: "Jimbo Ruins XXXMas", city: "calgary", date: "2026-12-17", link: "https://www.ticketmaster.ca/search?page=1&q=the+drag", vibe: "holiday drag performance", vibe_tags: ["drag", "cultural"] },
  { name: "RuPaul's Drag Race Werq The World Tour", city: "calgary", date: "2027-03-21", link: "https://www.ticketmaster.ca/search?q=rupauls+drag+race+werq+world+tour", vibe: "large-scale drag tour", vibe_tags: ["drag", "massive", "cultural"] },
  { name: "Canada Pride 2027: melaNATION QTBIPOC Showcase", city: "halifax", date: "2027-07-15", link: "https://www.canadapride.ca/home", vibe: "QTBIPOC music, performance and culture showcase", vibe_tags: ["cultural", "festival", "social"] },
  { name: "Canada Pride 2027: Opening Ceremony", city: "halifax", date: "2027-07-15", link: "https://www.canadapride.ca/home", vibe: "opening ceremony with community performances", vibe_tags: ["festival", "social", "cultural"] },
  { name: "Canada Pride 2027: The Bump", city: "halifax", date: "2027-07-16", link: "https://www.canadapride.ca/home", vibe: "large-scale drag show", vibe_tags: ["drag", "massive", "festival"] },
  { name: "Canada Pride 2027: Parade", city: "halifax", date: "2027-07-17", link: "https://www.canadapride.ca/home", vibe: "national Pride parade", vibe_tags: ["massive", "festival", "social"] },
  { name: "Canada Pride 2027: Drag on the MainStage", city: "halifax", date: "2027-07-17", link: "https://www.canadapride.ca/home", vibe: "all-ages drag performance", vibe_tags: ["drag", "festival", "massive"] },
  { name: "Canada Pride 2027: The Grind", city: "halifax", date: "2027-07-17", link: "https://www.canadapride.ca/home", vibe: "high-energy Pride dance party", vibe_tags: ["electronic", "festival", "massive"] },
  { name: "Canada Pride 2027: Human Rights Conference", city: "halifax", date: "2027-07-20", end_date: "2027-07-22", link: "https://www.canadapride.ca/home", vibe: "2SLGBTQIA+ leadership and human-rights conference", vibe_tags: ["cultural", "social", "festival"] },
  { name: "Canada Pride 2027: Pride Live", city: "halifax", date: "2027-07-23", link: "https://www.canadapride.ca/home", vibe: "large-scale outdoor Pride concert", vibe_tags: ["massive", "festival", "cultural"] },
  { name: "Canada Pride 2027: Closing Ceremony & Show", city: "halifax", date: "2027-07-24", link: "https://www.canadapride.ca/home", vibe: "Pride closing performances", vibe_tags: ["festival", "cultural", "social"] },
  { name: "Canada Pride 2027: Dykes vs Divas Ball Game", city: "halifax", date: "2027-07-25", link: "https://www.canadapride.ca/home", vibe: "community softball game and Pride celebration", vibe_tags: ["social", "festival"] },
];

const { data: existing, error: readError } = await supabase
  .from("events")
  .select("name,city,date");
if (readError) throw readError;
const keys = new Set(existing.map((event) => `${event.city}::${event.name}::${event.date}`.toLowerCase()));
const additions = events.filter((event) => !keys.has(`${event.city}::${event.name}::${event.date}`.toLowerCase()));
const requiredFields = ["name", "city", "date", "description", "location", "link", "vibe"];
const incomplete = additions.filter((event) => requiredFields.some((field) => !String(event[field] || "").trim()));

if (incomplete.length) {
  throw new Error(`Refusing to publish incomplete events: ${incomplete.map((event) => event.name).join(", ")}`);
}

console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", additions: additions.length, events: additions }, null, 2));

if (apply && additions.length) {
  const payload = additions.map((event) => ({
    ...event,
    start_date: event.date,
    end_date: event.end_date || event.date,
    event_status: "scheduled",
  }));
  const { error } = await supabase.from("events").insert(payload);
  if (error) throw error;
  console.log(JSON.stringify({ inserted: payload.length }));
}
