import { createClient } from "@supabase/supabase-js";
const APPLY = process.argv.includes("--apply");
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const updates = [
  [371, "Studio 54 Madrid", {
    queue_wait: "Most ordinary nights use door sales, so arrive at 22:00–22:30 and expect 5–10 minutes. A themed night or drag show can create a 15–25 minute line after 23:30; buy ahead only when the event page has actually opened ticket sales.",
    best_nights: "Friday or Saturday from 23:30–02:00 is when Studio 54 feels like the club it promises to be: DJ, light show and a full 300-person room. Sunday from 20:30 is the gentler option; Wednesday or Thursday works for drinks and a show without the weekend wall of bodies.",
    crowd_mix: "The room attracts Chueca regulars, queer visitors, pop-and-disco dancers, drag-show fans and groups who want a polished but not underground night. The illuminated entrance, projection-heavy main room and white iPod room make it a visual party rather than a quiet bar.",
    dress_code: "Dress as if you are going to be photographed under LEDs: clean trainers or boots, a sharp top, denim, colour or a little sparkle. It is a disco-pop club, so comfortable dancing clothes win over either beachwear or hard-fetish gear.",
    staff_inclusivity: "Studio 54 presents itself as an inclusive Chueca meeting point and its drag, DJ and special-event format brings a visibly broad queer crowd through the door. It does not set out a separate public anti-transphobia procedure; let security or the bar know immediately if anyone crosses a boundary.",
    source_urls: ["https://www.studio54madrid.com/", "https://www.esmadrid.com/en/nightlife/studio-54-madrid"], research_status: "web_researched_individual_venue_profile", updated_at: "2026-09-30T00:00:00Z"
  }],
  [372, "Attack Club", {
    queue_wait: "Pre-register as a member 24–48 hours before your first visit; that is what prevents the slow first-time sign-up at the door. Wednesday and Thursday at 19:00 are fastest—only the first ten members get the €1 early entry—while Friday and Saturday after 22:00 can mean a 15–25 minute membership-and-entry wait.",
    best_nights: "Wednesday or Thursday, 19:00–21:00, is the low-pressure way to learn the room. Friday and Saturday after 23:00 are for the more intense party atmosphere; Sunday from 20:00 is a useful alternative when you want a long night without Saturday's peak.",
    crowd_mix: "Attack is a members-only adult men's cruising club: regulars, kink-curious men, solo visitors and groups who have chosen a specific party. It is not a general bar and it is not a mixed-gender venue; people come knowing that the social language is adult, sexual and direct.",
    dress_code: "Use the event page: nude Wednesdays and free-dress-code Fridays are different nights. For a themed party, dress to the listed idea and bring photo ID; turning up in generic nightlife clothes when the party asks for a look is the easiest way to lose time at the door.",
    staff_inclusivity: "The membership system and event-specific door rules make the boundaries of this adult men-only space clear. That can make entry predictable for the intended crowd, but it is not a venue for every gender identity. Consent, privacy and asking before touching are the baseline; bring concerns straight to staff.",
    source_urls: ["https://www.attack-club.com/madrid/contacto", "https://www.attack-club.com/en/fiestas/gay-madrid/71519/miercoles-desnudos"], research_status: "web_researched_individual_venue_profile", updated_at: "2026-09-30T00:00:00Z"
  }],
  [373, "Sauna Paraíso", {
    queue_wait: "Reception is normally a 3–5 minute stop for the locker, two towels, sandals and condom. The Saturday/Sunday continuous opening is busiest; arrive 17:00–19:00 and allow 10–15 minutes at the desk instead of showing up in a post-club rush.",
    best_nights: "Saturday from 18:00 into the evening is the strongest social window, with the 24-hour weekend run making it an easy after-party continuation. Tuesday–Thursday at 16:00–19:00 is better for pool, steam and a quieter first visit. Wednesday is a good bet for the younger 18–35 core.",
    crowd_mix: "Paraíso is the young, central sauna: a lot of men in their twenties and early thirties, solo travellers, couples and locals coming off a Chueca night, with enough range that no one needs to fit a single body type. The 1,400 m² layout spreads people between pool, jacuzzi, cabins, dark rooms and the BDSM area.",
    dress_code: "Leave street clothes and shoes in the locker. Inside, use the towels and sandals provided, or wear swimwear if you prefer; that is the whole dress code. Bring nothing more than ID, your phone/payment and your own lube if you have a preference.",
    staff_inclusivity: "The house actively supplies condoms and lubricant at reception and ejects anyone smoking or using drugs, which gives staff a concrete welfare role beyond selling entry. It is an adult gay men's sauna, not a mixed wellness centre. Consent still belongs to every guest: a towel-only setting is never an invitation to touch or follow someone.",
    source_urls: ["https://saunaparaiso.com/"], research_status: "web_researched_individual_venue_profile", updated_at: "2026-09-30T00:00:00Z"
  }],
  [374, "Sauna Octopus", {
    queue_wait: "Buy the ticket at the entrance machine, then hand it to reception for towels and slippers; on a normal afternoon this takes 3–7 minutes. Sunday around 17:00 is the reported peak and can mean 10–15 minutes. Do not rely on old 24-hour listings for late Friday entry—recent visitors have found the posted hours unreliable.",
    best_nights: "Sunday at about 17:00 is the clearest social peak for the bear-and-mature crowd. Thursday around 15:00 is a strong quieter alternative; weekday evenings after 21:00 are more hit-or-miss. Call before a late-night trip, especially on the weekend.",
    crowd_mix: "Octopus leans older and bearier than Paraíso: mature men, bears, admirers, local regulars and a few younger visitors. The pool, steam room and bar create more space to chat than a pure dark-room venue, so it works for a solo visitor who wants to ease in slowly.",
    dress_code: "Arrive in ordinary clothes, use the locker, towels and slippers supplied at reception, and bring your own lube if that matters to you. This is a sauna environment, so do not plan a club outfit; practical sandals and a towel are all you need inside.",
    staff_inclusivity: "Service reports are uneven: many visitors describe helpful reception and kind staff, while others report rude handling, language difficulties and a serious recent allegation of discriminatory treatment of a trans man. There is no visible public anti-transphobia policy to point to. Trans visitors should treat that unresolved signal seriously and choose another venue if a reliably trans-affirming space is essential.",
    source_urls: ["https://whereis.gay/sauna-octopus", "https://www.gayout.com/europe/spain/madrid/saunas/sauna-octopus-1298", "https://peluqueriamunoz.es/sauna-octopus/"], research_status: "web_researched_individual_venue_profile", updated_at: "2026-09-30T00:00:00Z"
  }],
  [375, "Chueca District", {
    queue_wait: "Chueca has no gate and no district-wide queue. On Friday and Saturday, 22:30–01:00 is when individual bars and club doors get busy; allow 10–30 minutes per popular venue rather than trying to cross the neighbourhood on a timetable.",
    best_nights: "Thursday from 21:00 is lively without Pride-week compression. Friday and Saturday are the big social nights: start with terraces or cocktail bars around 20:30–22:00, then choose a show bar or club after midnight. Daytime Sunday is the better moment for cafés, shopping and the neighbourhood's cultural side.",
    crowd_mix: "The streets mix LGBTQIA+ residents, queer travellers, date-night couples, drag fans, bar staff, shoppers, museum visitors and allies. It is a real central neighbourhood with homes, cafés and history—not an open-air club or a single gay venue.",
    dress_code: "Wear normal city clothes for the district and change the plan venue by venue. A relaxed daytime look suits cafés and galleries; a sharper, comfortable outfit makes sense for a late bar or club. Chueca itself has no dress code.",
    staff_inclusivity: "Chueca's strongest inclusion signal is collective: it is Madrid's visible LGBTQIA+ centre and its venues trade on openness and respect. There is no single district staff team or universal anti-transphobia policy. Choose venues with their own clear values, and use venue security or emergency services for any immediate problem.",
    source_urls: ["https://www.esmadrid.com/barrios-de-madrid/chueca", "https://www.visitchueca.com/descubre/salir", "https://getmadrid.com/guides/madrid-chueca-guide/"], research_status: "web_researched_individual_venue_profile", updated_at: "2026-09-30T00:00:00Z"
  }]
];
for (const [id, name, venue_intel] of updates) {
  if (!APPLY) { console.log(`Would update ${id}: ${name}`); continue; }
  const { data, error } = await client.from("places").select("venue_intel").eq("id", id).single(); if (error) throw error;
  const { error: updateError } = await client.from("places").update({ venue_intel: { ...(data.venue_intel || {}), ...venue_intel } }).eq("id", id); if (updateError) throw updateError;
  console.log(`Updated ${id}: ${name}`);
}
