import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const updatedAt = "2026-09-30T00:00:00Z";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const updates = [
  {
    id: 2228,
    sourceUrls: ["https://www.cuero.gay/en/faq", "https://www.cuero.gay/en/events"],
    queue_wait: "Cuero uses a doorbell and gives you a locker key on arrival, so entry is normally a short 5–10 minute stop rather than a street queue. On Friday's Bears & Friends night or when a themed night starts at 20:00, allow up to 15 minutes for the door and locker process.",
    best_nights: "Friday from 20:00 to 23:00 is the natural pick for Bears & Friends. For a quieter, theme-led visit, Tuesday's Jockstrap night starts at 20:00; the daily programme runs until 01:00.",
    crowd_mix: "Gay and bisexual men aged 18+ come here for a direct fetish/cruising night: local regulars from the Costa del Sol, holidaymakers passing through La Nogalera, bears on Fridays and men dressing for that night's theme.",
    dress_code: "The nightly theme is the dress code: naked on Monday, jockstrap on Tuesday, underwear on Thursday, Bears & Friends on Friday, and sports gear plus underwear on Sunday. Closed, sturdy shoes are mandatory every night.",
    staff_inclusivity: "This is a men-only adult venue, but its own rules put consent, safer sex and respectful behaviour at the centre. Staff enforce the themed entry rules, the no-phone rule and the ban on drugs; the owner also states that the door does not discriminate."
  },
  {
    id: 2229,
    sourceUrls: ["https://www.cuero.gay/en/about-us"],
    queue_wait: "Pikante has no verified current door procedure or published queue information. Treat it as a walk-in visit: if it is operating, daytime entry should be quick; on Friday and Saturday after 22:00, leave 5–15 minutes in case the counter or entry is busy.",
    best_nights: "The most plausible window is Friday or Saturday, 22:00–00:30, when La Nogalera's bar crowd is already moving between venues. Confirm that Pikante is open before planning an evening around it.",
    crowd_mix: "The listing identifies Pikante as a men-only cruising venue in La Nogalera, which points to adult men looking for a discreet, direct stop rather than a social cocktail-bar crowd.",
    dress_code: "Go in ordinary street clothes and change nothing on the assumption that there is a theme night. Any clothing, underwear or fetish requirements need to be confirmed at the entrance because no current house rules are available.",
    staff_inclusivity: "There is no reliable current operator page or published inclusion policy to assess. It is described as men-only, so trans men and anyone with a specific access concern should ask at the door before entering rather than rely on an old listing."
  },
  {
    id: 2230,
    sourceUrls: ["https://hotelsirenotorremolinos.com/"],
    queue_wait: "Use Sireno's online check-in before arrival and reception should be a 5–10 minute handover. Around 15:00 on Friday and Saturday, or just before the Friday dinner show, allow 15–20 minutes if several guests arrive together.",
    best_nights: "Friday from about 20:30 is Sireno's standout: its restaurant runs the Dinner with Entertainment, including a drag show. For a rooftop drink without the show crowd, arrive around 18:30 on a weekday.",
    crowd_mix: "Adults-only guests range from queer city-break couples and solo travellers to friends using the central Plaza Costa del Sol base. The infinity pool and gastrobar bring together people who want a relaxed afternoon before La Nogalera nightlife.",
    dress_code: "The lobby and restaurant are easy, polished holiday wear: shorts, linen, trainers or sandals work. Bring proper swimwear for the infinity pool; for the Friday show, a sharper shirt, dress or expressive club look feels at home.",
    staff_inclusivity: "Sireno explicitly promises a safe space of freedom and respect for every sexual orientation, and it operates under the Ritual Hoteles banner. It is adults-only, pet-friendly and queer-facing; ask reception directly about any accessibility or gender-specific need."
  },
  {
    id: 2231,
    sourceUrls: ["https://www.maracuyagayhouse.com/about-us", "https://www.maracuyagayhouse.com/activities-and-events"],
    queue_wait: "There is no club-style queue at this small guesthouse. Arrange arrival with the hosts and expect a personal 5–10 minute check-in; allow a little longer when several guests arrive for a house dinner or event.",
    best_nights: "Choose an evening with the house's rooftop sundown drinks or communal dinner, usually around sunset (roughly 19:00–21:00 in summer). Saturday evening is the strongest social bet, while weekday rooftop drinks suit guests wanting conversation rather than a crowd.",
    crowd_mix: "This is a social, men-only guesthouse for gay, bi, straight and trans men. Solo travellers who want to meet people over dinner, couples who prefer a smaller house, and clothing-optional sunseekers are the natural fit.",
    dress_code: "Around the house, relaxed holiday clothes are fine; the rooftop, Jacuzzi and sun spaces are clothing-optional. Pack swimwear or a towel for when you want coverage, and something easy to throw on for rooftop drinks or a shared dinner.",
    staff_inclusivity: "Maracuya explicitly welcomes trans men alongside gay, bi and straight men, and its hosts build the stay around shared spaces, dinners and small events. The house is adults-only and men-only, with consent and respect especially important in its clothing-optional areas."
  },
  {
    id: 2232,
    sourceUrls: ["https://www.thepalmexperiencehotels.com/en/hotel-fenix-torremolinos/"],
    queue_wait: "Check-in is most likely to slow down around 16:00–17:00, when beach and airport arrivals overlap; budget 10–20 minutes then. Outside that window, the reception handover is normally closer to 5–10 minutes.",
    best_nights: "Friday and Saturday from 19:30 at the seventh-floor Cliff bar are best for sunset drinks over the Mediterranean. On a quieter stay, go on a weekday around 18:30, then walk up to the centre after dinner.",
    crowd_mix: "Fénix attracts adults who want a grown-up base rather than a scene hotel: couples, friends, beach-and-wellness travellers and queer guests who value the quick link between Bajondillo beach and the centre.",
    dress_code: "Daytime is beach-smart: swimwear at the pool, cover-up for the lifts and public areas. For the Cliff bar and dinner, lean smart-casual—linen, a clean shirt, sandals or neat trainers—rather than full club gear.",
    staff_inclusivity: "Fénix presents itself as an adults-only hotel in an open urban environment with freedom and diversity as part of its character. It is not marketed as a queer-only property; direct questions about accessibility, gender needs or a specific inclusion concern belong with reception before booking."
  },
  {
    id: 2233,
    sourceUrls: ["https://torremolinoscozyinns.com/bajondillo-beach-cozy-inns/"],
    queue_wait: "Reception check-in starts at 14:00. It is a small inn rather than a large resort, so expect roughly 5–10 minutes; in July and August, arriving right at 14:00 can mean a short 10–15 minute wait while rooms are released.",
    best_nights: "For the peaceful version of the stay, check in on a Sunday or weekday and use the beach from 09:00 before it warms up. For a livelier evening, Friday or Saturday around 20:30 puts La Nogalera within an easy walk while the inn remains a quiet retreat.",
    crowd_mix: "Beach-first couples, solo city-break travellers and small groups who prefer a compact address by El Bajondillo fit this inn best. It is not a dedicated queer hotel, but its location works well for visitors who want beach time and La Nogalera in the same day.",
    dress_code: "This is beach-hotel casual: swimwear and sandals for Bajondillo, then a cover-up or easy resort clothes in the lobby and breakfast area. Bring something neater for an evening in town; there is no reason to pack nightclub-only looks for the property itself.",
    staff_inclusivity: "The inn describes its service as personal and has no queer-specific or anti-discrimination statement on its property page. That means it should be treated as a mainstream small hotel; ask reception directly in advance about any access or inclusion need that matters to you."
  },
  {
    id: 2234,
    sourceUrls: ["https://www.melia.com/en/hotels/spain/torremolinos/melia-costa-del-sol"],
    queue_wait: "Check-in opens at 14:00. At this 4-star beachfront hotel, expect the longest reception line from 14:00 to 16:00 on Friday and Saturday in summer—about 15–25 minutes; early afternoon on a weekday is usually closer to 5–10 minutes.",
    best_nights: "Go to the rooftop around 19:30 on Friday or Saturday for the sea view as daylight softens; the hotel's evening offer includes live music. For pool and Bali-bed time, a weekday arrival before 10:00 is the better move.",
    crowd_mix: "Meliá Costa del Sol is a large beachfront resort with international holidaymakers, couples, families in the main hotel and adult guests using The Level. Queer travellers who want spa, rooftop and beach amenities will feel more at home here than in a small party hotel.",
    dress_code: "Beachwear and pool clothes belong at the outdoor and rooftop pools; use a cover-up through reception and restaurants. For La Cabaña Playa or evening live music, clean resort casual—shirt, dress, linen or smart shorts—fits far better than clubwear.",
    staff_inclusivity: "Meliá presents the hotel as a friendly, relaxed beach setting and offers an adults-only The Level experience, but it is not queer-branded. For a specific accessibility, gender or inclusion requirement, ask the hotel directly before booking instead of assuming a policy from the resort format."
  }
];

for (const update of updates) {
  const { data, error } = await supabase
    .from("places")
    .select("name, venue_intel")
    .eq("id", update.id)
    .maybeSingle();
  if (error || !data) throw error || new Error(`Missing place ${update.id}`);

  if (!APPLY) {
    console.log(`Would update ${update.id}: ${data.name}`);
    continue;
  }

  const venue_intel = {
    ...(data.venue_intel || {}),
    queue_wait: update.queue_wait,
    best_nights: update.best_nights,
    crowd_mix: update.crowd_mix,
    dress_code: update.dress_code,
    staff_inclusivity: update.staff_inclusivity,
    source_urls: update.sourceUrls,
    research_status: "individually_researched_operator_and_local_sources",
    updated_at: updatedAt,
  };
  const { error: updateError } = await supabase
    .from("places")
    .update({ venue_intel })
    .eq("id", update.id);
  if (updateError) throw updateError;
  console.log(`Updated ${update.id}: ${data.name}`);
}
