import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const updates = [
  {
    id: 60,
    name: "Sauna Lavapiés",
    venue_intel: {
      queue_wait: "You walk straight into reception most afternoons; the practical pause is the 3–5 minutes for payment, towel and locker key. On a Friday nude night or after midnight, give yourself 10–15 minutes instead. It is not a Chueca velvet-rope queue, but arriving at the same time as a group can slow the desk.",
      best_nights: "Friday after 22:00 is the liveliest choice, especially if the nude-day atmosphere is your thing. Tuesday has the same nude format with a quieter local rhythm; Wednesday afternoon is the value pick for visitors aged 18–25. Sunday from 18:00 is the sensible social window before the late-night tariff begins at midnight.",
      crowd_mix: "Lavapiés draws a more neighbourhood-led, mixed-age gay and bi male crowd than the polished Chueca circuit: solo visitors, regulars coming off work, travellers staying nearby and younger men on the Wednesday offer. The room feels like a sauna first, not a nightclub with steam rooms attached.",
      dress_code: "Come in ordinary street clothes, change at the locker and use the towel and sandals provided. Tuesday and Friday are nude days, so do not arrive expecting to keep underwear on in every area. Shower sandals are the useful extra if you prefer your own pair.",
      staff_inclusivity: "The door is strictly 18+ and the house rules give staff discretion over admission. The place is built for adult gay and bi men, so it is not a mixed-gender wellness space. Treat privacy, consent and a clear no as part of the room's social code; ask at reception before entering if you need a specific accessibility or welfare accommodation.",
      source_urls: ["https://saunalavapies.com/precios/", "https://saunalavapies.com/inicio-2/"],
      research_status: "web_researched_individual_venue_profile",
      updated_at: "2026-09-30T00:00:00Z",
    },
  },
  {
    id: 63,
    name: "STRONG Club",
    venue_intel: {
      queue_wait: "Wednesday's RAW STRAP entry is free from 23:00 to 00:00, so arrive at 22:50 and expect a quick 5–15 minute outfit check. Friday and Saturday theme nights can build a 20–30 minute line from 00:30; a pre-bought ticket and arriving before midnight are the cleanest way through the door.",
      best_nights: "Wednesday at 23:00 is the easy introduction: RAW STRAP is built around jockstraps, harnesses, underwear and sport gear. For the full international fetish-club charge, choose Friday or Saturday and arrive 23:00–00:00; Sunday S3XDANCE runs to 06:00 for a later, more dance-led finish.",
      crowd_mix: "This is a men-only room for fetish-minded dancers, leather regulars, pups, bears, gym-kit guys, travellers in Madrid for a themed night and men who come specifically for cruising. You will find people in full looks beside those in underwear or a harness; the shared point is participation, not watching from the edge.",
      dress_code: "At STRONG the dress code is part of the ticket: leather, rubber, harnesses, jockstraps, sportswear, industrial or hi-vis, uniforms, puppy/furry looks, boots, clubwear and nudity all belong. Some events, including S3XDANCE, require a fetish look at the door—plain colourful tourist clothes are the wrong move.",
      staff_inclusivity: "The club makes its boundaries unusually clear: it is men-only, adult and theme-led, with door staff checking that the outfit matches the event. That creates a legible space for its own crowd, but it is not an all-identities venue. Inside, its whole format relies on consent and respect for bodies, privacy and a refusal; do not treat a sexual dress code as permission to touch anyone.",
      source_urls: ["https://strong.madrid/", "https://strong.madrid/comunicado-djs/"],
      research_status: "web_researched_individual_venue_profile",
      updated_at: "2026-09-30T00:00:00Z",
    },
  },
  {
    id: 64,
    name: "FIREWOOD Madrid",
    venue_intel: {
      queue_wait: "Firewood is a small fetish bar rather than a large club door. On a regular Friday or Saturday, plan on 5–10 minutes for entry and changing; when a special party is announced, allow 15–20 minutes because the door checks the required look before letting people in.",
      best_nights: "Friday or Saturday from 22:00 is when the bar has the strongest late-night momentum. Sunday around 17:00–20:00 works for a slower afternoon-to-evening visit; it is the right choice if you want the room before the Friday/Saturday intensity.",
      crowd_mix: "Firewood is for adult men who have deliberately chosen a cruising and fetish bar: underwear regulars, jockstrap and nude-night visitors, men in town for a kink event and curious first-timers who understand the format. It is intimate and direct, not a general-purpose gay pub.",
      dress_code: "The house look is deliberately minimal: nude, underwear or a jockstrap. Bring only what you need to get there, then change into the room's dress code. Jeans and a standard going-out shirt are for the journey, not the floor.",
      staff_inclusivity: "Staff create a very specific adult male fetish space rather than a broad mixed club. The clear outfit rule makes the expectation easy to read at the door; inside, consent and discretion matter more than bravado. It is not presented as a trans-inclusive all-genders venue, so choose it only if its men-only format is right for you.",
      source_urls: ["https://firewoodbarmadrid.com/"],
      research_status: "web_researched_individual_venue_profile",
      updated_at: "2026-09-30T00:00:00Z",
    },
  },
  {
    id: 67,
    name: "Bears Bar",
    venue_intel: {
      queue_wait: "At Bears Bar, the wait is normally only the time it takes to get a drink. Friday and Saturday after 23:30 can mean 10–15 minutes at the bar or a short wait for a standing spot; arriving around 20:30 gives you a calmer room and a proper conversation with the regulars.",
      best_nights: "Friday or Saturday, 21:00–23:00, is the sweet spot: the bear crowd is arriving, music is up and the room still lets you talk. Tuesday–Thursday at 20:00 is better for a quieter, more local drink. The bar's Mad Bear connection makes festival dates especially busy.",
      crowd_mix: "You meet bears, cubs, chasers, older regulars, first-time visitors and friends who have come for the easy Chueca bear community. The bar is small enough that a solo visitor can join a conversation without having to conquer a huge dance floor.",
      dress_code: "Keep it comfortable and recognisably you: jeans, boots, a good T-shirt, flannel, leather accents or a harness under a layer all fit naturally. There is no need to perform a costume or have a particular body type; this is a neighbourhood bear bar, not a strict fetish door.",
      staff_inclusivity: "Bears Bar has spent years functioning as a social home for Madrid's bear scene and the service is part of that low-pressure feel. It welcomes the people who come respectfully for that community, including friends and newcomers. It does not advertise a detailed anti-transphobia policy, so report any problem directly to the bar team rather than assuming a written protocol exists.",
      source_urls: ["https://www.esmadrid.com/noche/bears-bar", "https://www.timeout.es/madrid/es/bares-y-pubs/bears-bar", "https://whereis.gay/bears-bar-madrid"],
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
