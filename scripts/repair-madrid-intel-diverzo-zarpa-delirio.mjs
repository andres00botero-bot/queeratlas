import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Web research completed 2026-09-30. Queue durations are stated as planning
// buffers where the venue does not publish measured waiting times.
const updates = [
  {
    id: 56,
    name: "Diverzo Cocktail Bar",
    venue_intel: {
      queue_wait: "Diverzo does not operate a ticketed club door and no regular queue duration is published. On Friday or Saturday after 23:00 the small room can fill; allow a 10–15 minute walk-in buffer, but do not treat that as a venue-guaranteed wait.",
      best_nights: "Friday or Saturday between 20:30 and 22:30 is the strongest window for cocktails before the Chueca crowd compresses the room. Sunday–Thursday from 20:00 suits a quieter drink; Monday opens at 21:00.",
      crowd_mix: "Expect LGBTQ+ Chueca regulars, friends meeting before a later venue, and visitors ordering cocktails or coffee. It is a compact social bar rather than a destination dance floor; recent reviews specifically mention meet-ups and its sound system.",
      dress_code: "No published dress code. Smart-casual bar clothes work—jeans, a shirt or a styled top and comfortable shoes. This is a cocktail stop, so beachwear or a large backpack will feel less practical than an intentionally relaxed night-out look.",
      staff_inclusivity: "The bar is listed as LGBTQ-friendly and recent customer reviews repeatedly praise named staff for warm cocktail advice and service. No public anti-transphobia or anti-harassment policy was located, so that positive service signal should not be represented as a formal safeguarding rule.",
      source_urls: ["https://www.patroc.com/gay/madrid/d/diverzo-bar.html", "https://restaurantguru.com/LaKama-Cafe-Madrid"],
      research_status: "web_researched_individual_venue_profile",
      updated_at: "2026-09-30T00:00:00Z",
    },
  },
  {
    id: 57,
    name: "ZARPA",
    venue_intel: {
      queue_wait: "ZARPA can develop an outside line on Friday and Saturday after roughly 00:30; visitors have reported a large lane queue. The bar does not publish a measured wait, so use a 20–30 minute planning buffer rather than relying on a promised entry time; arriving by 22:30 usually avoids the squeeze.",
      best_nights: "Friday or Saturday, 21:30–23:00, is best for the full bear-bar atmosphere while still leaving room to talk at the bar. Wednesday or Thursday at about 21:00 is better for a lower-volume drink; the venue is closed Monday and Tuesday.",
      crowd_mix: "The core visitor is a bear, cub or admirer having drinks before a club, alongside kink-friendly gay men, friends and Chueca visitors. Reviews describe a broad age range, fluorescent bear décor, music and a medium-sized room—not a women-centred or mixed mainstream cocktail bar.",
      dress_code: "No formal code is published. Jeans, T-shirts, boots, leather details or a harness worn as a personal choice all fit the bear-bar setting; full fetish gear is not required. Dress for warmth outside if arriving late, since the busiest period can mean waiting on Calle de las Infantas.",
      staff_inclusivity: "Reviewers consistently describe the hosts and bar staff as friendly and welcoming, and the venue is explicitly oriented to the bear and cub community. I found no published anti-transphobia, consent or complaint policy, so staff friendliness is documented but no wider formal inclusion guarantee is claimed.",
      source_urls: ["https://wanderlog.com/place/details/2550997/zarpa-bear-de-copas", "https://www.esmadrid.com/en/nightlife-chueca"],
      research_status: "web_researched_individual_venue_profile",
      updated_at: "2026-09-30T00:00:00Z",
    },
  },
  {
    id: 59,
    name: "Delirio",
    venue_intel: {
      queue_wait: "Delirio/DLRO opens at midnight, and there is no published average queue time. For Friday or Saturday, arrive at 00:00–00:30; this gives a realistic 10–20 minute door-and-coat-check buffer before the busier 01:00 onward period, not a guaranteed wait estimate.",
      best_nights: "Friday or Saturday from 01:00 to 03:00 gives the fullest late pop, drag and DJ energy; the club stays open until 06:00. Sunday–Thursday from 00:00 to 01:30 is the better choice for an earlier performance-led visit, with closing at 05:30.",
      crowd_mix: "A typical room includes Chueca LGBTQI+ regulars, drag fans, pop sing-along groups, visitors and emerging performers connected to the venue's talent contests. The venue programmes drag artists, DJs, singers and dancers, so the audience is more show-focused than at a simple drinks bar.",
      dress_code: "DLRO publishes no mandatory dress code. Expressive clubwear, colour, sparkle, drag-adjacent styling or clean casual clothes all suit the room; choose shoes you can stand and dance in rather than treating it as a formal door-policy club.",
      staff_inclusivity: "This is the strongest formal inclusion signal of the three: DLRO says it accepts no discrimination by sex, race, sexual orientation, religion or political beliefs, frames respect and diversity as its principle, and works with ARCÓPOLI, Fundación Triángulo and other diversity organisations. Its page does not separately name transphobia, so the published policy should be quoted accurately rather than expanded beyond its wording.",
      source_urls: ["https://deliriochueca.com/con%C3%B3cenos/compromiso", "https://www.esmadrid.com/en/nightlife/delirio-live"],
      research_status: "web_researched_individual_venue_profile",
      updated_at: "2026-09-30T00:00:00Z",
    },
  },
];

for (const update of updates) {
  if (!APPLY) {
    console.log(`Would update ${update.id}: ${update.name}`);
    continue;
  }
  const { data, error } = await client.from("places").select("venue_intel").eq("id", update.id).single();
  if (error) throw error;
  const { error: updateError } = await client
    .from("places")
    .update({ venue_intel: { ...(data.venue_intel || {}), ...update.venue_intel } })
    .eq("id", update.id);
  if (updateError) throw updateError;
  console.log(`Updated ${update.id}: ${update.name}`);
}
