import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { buildEventIntelFallback } from "../src/lib/intelFallbacks.js";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

const supabase = createClient(url, key, { auth: { persistSession: false } });
const apply = process.argv.includes("--apply");

const source = {
  queerTrash: "https://comedybar.ca/shows/queer-trash-trivia",
  burlesque: "https://www.showpass.com/the-toronto-burlesque-festival-daily-2/",
  science: "https://www.ticketmaster.ca/science-is-a-drag-all-stars-toronto-ontario-11-25-2026/event/100065415056954A",
  jinkx: "https://www.jinkxanddela.com/",
  jimboVan: "https://www.axs.com/events/1612251/jimbo-ruins-xxxmas-19-event-tickets",
  jimboCalgary: "https://www.livenation.com/event/1778v0G6CU5w7u8/jimbo-ruins-xxxmas",
  thatsGay: "https://www.showpass.com/thats-gay/",
  gacha: "https://www.eventbrite.ca/e/gachapop-street-fighter-tickets-2002833159896",
  pirate: "https://www.eventbrite.ca/e/aye-aye-captain-pirate-pageant-tickets-2000520801570",
  taboo: "https://tabooshows.com/events/taboo-vancouver-2027",
  rodeo: "https://www.showpass.com/abr2026/",
  werq: "https://www.ticketmaster.ca/rupaul-s-drag-race-werq-the-world-tour-tickets/artist/2679678",
  canadaPride: "https://www.canadapride.ca/home",
};

function entry({ name, source_name = name, city, date, end_date = date, location, description, link, vibe, vibe_tags }) {
  const event = { name, city, date, end_date, location, description, link, vibe, vibe_tags };
  const intel = buildEventIntelFallback(event);
  return {
    ...event,
    source_name,
    start_date: date,
    ticket_url: link,
    event_status: "scheduled",
    event_intel: {
      ...intel,
      research_status: "verified_source",
      source_urls: [link],
      updated_at: new Date().toISOString(),
    },
  };
}

const events = [
  entry({ name: "Queer Trash Trivia", city: "toronto", date: "2026-11-07", location: "Comedy Bar Bloor, 945 Bloor Street W, Toronto, ON M6H 1L5, Canada", link: source.queerTrash, vibe: "queer comedy and trivia night", vibe_tags: ["social", "cultural"], description: "A queer comedy-and-trivia night hosted by Bee Bertrand and Cleo Vaillancourt, with guest comics, audience questions and prizes. Doors and ticket details are published by Comedy Bar." }),
  entry({ name: "Queer Trash Trivia", city: "toronto", date: "2026-12-05", location: "Comedy Bar Bloor, 945 Bloor Street W, Toronto, ON M6H 1L5, Canada", link: source.queerTrash, vibe: "queer comedy and trivia night", vibe_tags: ["social", "cultural"], description: "A queer comedy-and-trivia night hosted by Bee Bertrand and Cleo Vaillancourt, with guest comics, audience questions and prizes. Doors and ticket details are published by Comedy Bar." }),
  entry({ name: "Toronto Burlesque Festival 2026", city: "toronto", date: "2026-11-12", end_date: "2026-11-15", location: "Tallulah's Cabaret, Buddies in Bad Times Theatre, 12 Alexander Street, Toronto, ON M4Y 1B4, Canada", link: source.burlesque, vibe: "queer-led burlesque, cabaret and drag festival", vibe_tags: ["drag", "cultural", "festival"], description: "REVERIE brings four days of burlesque, cabaret and drag to Buddies in Bad Times Theatre. The official programme lists four distinct shows with artists from Toronto, across Canada and internationally." }),
  entry({ name: "Science Is a Drag: All Stars", city: "toronto", date: "2026-11-25", location: "The Opera House, 735 Queen Street East, Toronto, ON M4M 1H1, Canada", link: source.science, vibe: "science-themed drag performance", vibe_tags: ["drag", "cultural"], description: "A 19+ drag performance that turns scientific topics into stage art. The official listing names host Dr. Rawbyn Diamonds and performers including Kyne, Dr. Memica Conplex, Big Mike and Ms. Medisin." }),
  entry({ name: "The Jinkx & DeLa Holiday Show", city: "toronto", date: "2026-11-19", location: "Meridian Hall, 1 Front Street East, Toronto, ON M5E 1B2, Canada", link: source.jinkx, vibe: "holiday drag and comedy show", vibe_tags: ["drag", "cultural"], description: "Jinkx Monsoon and BenDeLaCreme bring their annual original holiday production to Toronto: a camp stage show with new songs, comedy, costumes, dance and seasonal storytelling." }),
  entry({ name: "The Jinkx & DeLa Holiday Show", city: "montreal", date: "2026-11-18", location: "L'Olympia, 1004 Sainte-Catherine Street East, Montréal, QC H2L 2G2, Canada", link: source.jinkx, vibe: "holiday drag and comedy show", vibe_tags: ["drag", "cultural"], description: "Jinkx Monsoon and BenDeLaCreme's annual original holiday production arrives at L'Olympia with camp comedy, new music, costumes, dance and theatrical seasonal storytelling." }),
  entry({ name: "The Jinkx & DeLa Holiday Show", city: "ottawa", date: "2026-11-20", location: "Hard Rock LIVE, Hard Rock Hotel & Casino Ottawa, 4837 Albion Road, Ottawa, ON K1X 1A3, Canada", link: source.jinkx, vibe: "holiday drag and comedy show", vibe_tags: ["drag", "cultural"], description: "Jinkx Monsoon and BenDeLaCreme bring their annual original holiday production to Hard Rock LIVE. The official venue listing states doors at 18:00, showtime at 19:00 and a 19+ admission policy." }),
  entry({ name: "Jimbo Ruins XXXMas", city: "montreal", date: "2026-12-04", location: "Théâtre Beanfield, 2490 Notre-Dame Street West, Montréal, QC H3J 1N5, Canada", link: "https://www.ticketmaster.ca/discover/montreal?categoryId=KZFzniwnSyZfZ7v7na&classificationId=KnvZfZ7v7l6", vibe: "holiday drag performance", vibe_tags: ["drag", "cultural"], description: "Jimbo the Drag Clown brings a 19+ holiday drag show to Montréal. The Ticketmaster city programme lists the performance at Théâtre Beanfield on 4 December." }),
  entry({ name: "That's Gay! Comedy", city: "vancouver", date: "2026-11-13", location: "Little Mountain Gallery, 110 Water Street, Vancouver, BC V6B 1B8, Canada", link: source.thatsGay, vibe: "queer comedy showcase", vibe_tags: ["cultural", "social"], description: "A queer comedy night hosted by Erin Purghart and featuring Vancouver comics. The show is presented on Little Mountain Gallery's accessible Salazar Stage; doors are at 20:30 and the show starts at 21:00." }),
  entry({ name: "GachaPOP! Street Fighter", city: "vancouver", date: "2026-11-13", location: "The Birdhouse, 44 West 4th Avenue, Vancouver, BC V5Y 1G3, Canada", link: source.gacha, vibe: "queer Asian drag performance", vibe_tags: ["drag", "cultural"], description: "Ricecake's queer Asian drag tribute to Street Fighter features Acacia, Bliss, Cataleya, Diamonte, Mx. Bukuru, Shay Dior, SKIM and Son of a Butch. Doors open at 18:00 and the drag show begins at 19:00." }),
  entry({ name: "Jimbo Ruins XXXMas", city: "vancouver", date: "2026-12-06", location: "Rio Theatre, 1660 East Broadway, Vancouver, BC V5N 1W1, Canada", link: source.jimboVan, vibe: "holiday drag performance", vibe_tags: ["drag", "cultural"], description: "A 19+ holiday drag show starring Jimbo the Drag Clown. The official ticket listing gives 18:30 doors and a 19:30 showtime at the Rio Theatre." }),
  entry({ name: "Aye Aye Captain! Pirate Pageant", city: "vancouver", date: "2027-01-23", location: "Tiki Bar, Hotel at the Waldorf, 1489 East Hastings Street, Vancouver, BC V5L 5B6, Canada", link: source.pirate, vibe: "queer drag pageant and fundraiser", vibe_tags: ["drag", "social", "cultural"], description: "What The Frock Productions presents a pirate-themed drag pageant with runways, challenges and high-seas glamour. The event supports local LGBTQ2+ charities; doors are at 19:30 and the show starts at 20:00." }),
  entry({ name: "Vancouver Taboo Show 2027", city: "vancouver", date: "2027-02-05", end_date: "2027-02-07", location: "Vancouver Convention Centre, 1055 Canada Place, Vancouver, BC V6C 0C3, Canada", link: source.taboo, vibe: "LGBTQ-friendly adult lifestyle and wellness expo", vibe_tags: ["fetish", "festival"], description: "A three-day adults-only lifestyle and wellness expo with education, entertainment, vendors and community programming. Confirm the current schedule, age policy and accessibility details directly with Taboo Show before attending." }),
  entry({ name: "Alberta Burlesque Rodeo: Trans & GNC Competition", source_name: "Alberta Burlesque Rodeo 2026", city: "calgary", date: "2026-11-20", location: "The Attic, 1413 9 Avenue SE, Calgary, AB T2G 0T4, Canada", link: source.rodeo, vibe: "trans and gender-nonconforming burlesque competition", vibe_tags: ["drag", "cultural"], description: "The opening night of Alberta Burlesque Rodeo is a trans and gender-nonconforming burlesque competition. Doors open at 18:00 and the show begins at 19:30; the official listing notes that this second-floor venue has no elevator." }),
  entry({ name: "Jimbo Ruins XXXMas", city: "calgary", date: "2026-12-17", location: "Bella Concert Hall, Mount Royal University, 4825 Mount Royal Gate SW, Calgary, AB T3E 6K6, Canada", link: source.jimboCalgary, vibe: "holiday drag performance", vibe_tags: ["drag", "cultural"], description: "Jimbo the Drag Clown brings the 19+ XXXMas holiday drag show to Bella Concert Hall at Mount Royal University. The official event page lists a 19:30 performance time." }),
  entry({ name: "RuPaul's Drag Race Werq The World 2027 Tour", source_name: "RuPaul's Drag Race Werq The World Tour", city: "calgary", date: "2027-03-21", location: "Grey Eagle Event Centre, 3777 Grey Eagle Drive, Calgary, AB T3E 3X8, Canada", link: source.werq, vibe: "large-scale drag tour", vibe_tags: ["drag", "massive", "cultural"], description: "The official 2027 Werq The World tour brings the RuPaul's Drag Race stage production to Calgary's Grey Eagle Event Centre. Ticketmaster lists an 20:00 start on 21 March." }),
  entry({ name: "Canada Pride 2027: melaNATION QTBIPOC Showcase", city: "halifax", date: "2027-07-15", location: "Halifax, Nova Scotia, Canada — venue to be announced by Canada Pride", link: source.canadaPride, vibe: "QTBIPOC music, performance and culture showcase", vibe_tags: ["cultural", "festival", "social"], description: "Canada Pride's official preview describes melaNATION as a celebration of Black, Indigenous and racialized 2SLGBTQIA+ communities through music, performance and culture. The organiser has not yet announced the venue address." }),
  entry({ name: "Canada Pride 2027: Opening Ceremony", city: "halifax", date: "2027-07-15", location: "Halifax, Nova Scotia, Canada — venue to be announced by Canada Pride", link: source.canadaPride, vibe: "opening ceremony with community performances", vibe_tags: ["festival", "social", "cultural"], description: "The official Canada Pride preview schedules an opening ceremony with welcomes, performances and community on 15 July 2027. The organiser has not yet announced the venue address." }),
  entry({ name: "Canada Pride 2027: The Bump", city: "halifax", date: "2027-07-16", location: "Halifax, Nova Scotia, Canada — venue to be announced by Canada Pride", link: source.canadaPride, vibe: "large-scale drag show", vibe_tags: ["drag", "massive", "festival"], description: "Canada Pride describes The Bump as Halifax Pride's biggest drag show and Atlantic Canada's largest drag event, with performers from Canada and beyond. The organiser has not yet announced the venue address." }),
  entry({ name: "Canada Pride 2027: Parade", city: "halifax", date: "2027-07-17", location: "Halifax, Nova Scotia, Canada — parade route to be announced by Canada Pride", link: source.canadaPride, vibe: "national Pride parade", vibe_tags: ["massive", "festival", "social"], description: "Canada Pride's official preview invites marchers, performers and community groups to a city parade celebrating 2SLGBTQIA+ communities. The organiser has not yet announced the assembly point or route." }),
  entry({ name: "Canada Pride 2027: Drag on the MainStage", city: "halifax", date: "2027-07-17", location: "Halifax, Nova Scotia, Canada — mainstage venue to be announced by Canada Pride", link: source.canadaPride, vibe: "all-ages drag performance", vibe_tags: ["drag", "festival", "massive"], description: "An all-ages mainstage drag programme featuring performers from across Canada and beyond. The official Canada Pride page confirms the date; its venue address is not yet announced." }),
  entry({ name: "Canada Pride 2027: The Grind", city: "halifax", date: "2027-07-17", location: "Halifax, Nova Scotia, Canada — venue to be announced by Canada Pride", link: source.canadaPride, vibe: "high-energy Pride dance party", vibe_tags: ["electronic", "festival", "massive"], description: "A Canada Pride dance party with DJs, performances and a packed dance floor. The organiser has announced the date but not the venue address." }),
  entry({ name: "Canada Pride 2027: Human Rights Conference", city: "halifax", date: "2027-07-20", end_date: "2027-07-22", location: "Halifax Convention Centre, 1650 Argyle Street, Halifax, NS B3J 0E6, Canada", link: source.canadaPride, vibe: "2SLGBTQIA+ leadership and human-rights conference", vibe_tags: ["cultural", "social", "festival"], description: "A three-day Canada Pride conference for community leaders, advocates and changemakers discussing issues shaping the future of 2SLGBTQIA+ communities. The official programme identifies Halifax Convention Centre as the venue." }),
  entry({ name: "Canada Pride 2027: Pride Live", city: "halifax", date: "2027-07-23", location: "Halifax, Nova Scotia, Canada — outdoor concert venue to be announced by Canada Pride", link: source.canadaPride, vibe: "large-scale outdoor Pride concert", vibe_tags: ["massive", "festival", "cultural"], description: "A large outdoor Canada Pride concert with internationally acclaimed artists alongside Canadian and local performers. The organiser has announced the date but not the venue address." }),
  entry({ name: "Canada Pride 2027: Closing Ceremony & Show", city: "halifax", date: "2027-07-24", location: "Halifax, Nova Scotia, Canada — venue to be announced by Canada Pride", link: source.canadaPride, vibe: "Pride closing performances", vibe_tags: ["festival", "cultural", "social"], description: "Canada Pride's closing celebration is billed as an evening of performances, special guests and a final community gathering. The official programme has not yet published the venue address." }),
  entry({ name: "Canada Pride 2027: Dykes vs Divas Ball Game", city: "halifax", date: "2027-07-25", location: "Halifax, Nova Scotia, Canada — ball-field location to be announced by Canada Pride", link: source.canadaPride, vibe: "community softball game and Pride celebration", vibe_tags: ["social", "festival"], description: "A community softball game with friendly competition, entertainment and Pride celebration. Canada Pride confirms the date; the official venue address has not yet been published." }),
];

for (const event of events) {
  const { data: match, error: lookupError } = await supabase
    .from("events")
    .select("id")
    .in("name", [...new Set([event.source_name, event.name])])
    .eq("city", event.city)
    .eq("date", event.date)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (!match) throw new Error(`Missing event to complete: ${event.city} / ${event.name} / ${event.date}`);

  if (apply) {
    const { source_name, ...payload } = event;
    const { error } = await supabase.from("events").update(payload).eq("id", match.id);
    if (error) throw error;
  }
}

console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", completed: events.length }, null, 2));
