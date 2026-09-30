import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const rows = [
  {
    id: 109,
    source_urls: [
      "https://www.gayout.com/europe/spain/torremolinos/clubs/centuryon-torremolinos",
      "https://www.instagram.com/centuryontorremolinos/",
    ],
    queue_wait: "Centuryon starts late and Saturday is the night to plan around. Arrive at 01:00 for a quick door; after 02:00, a busy after-hours night can mean 15–25 minutes outside while the room turns over.",
    best_nights: "Saturday from 02:00 to 04:00 is Centuryon at its best. That is when the techno, themed party crowd and after-hours energy finally lock together; going at opening is for people who want room to breathe.",
    crowd_mix: "Expect a predominantly gay male crowd alongside queer friends, late-night visitors and people who came specifically for a darker, more electronic finish than the pop rooms in La Nogalera.",
    dress_code: "Wear a confident late-club look: black, mesh, a sharp tee, boots or clean trainers all fit. Theme nights can be sexier and more experimental, but dress for hours of dancing rather than a polished dinner-club entrance.",
    staff_inclusivity: "The door and bar team keep a polite, efficient rhythm in a very late room. Ask about entry and any drink package before paying, then you can settle in without the wristband-and-offer confusion that can spoil an otherwise easy arrival.",
  },
  {
    id: 346,
    source_urls: [
      "https://www.gayout.com/europe/spain/torremolinos/clubs/parthenon-club-torremolinos",
      "https://www.facebook.com/ParthenonClubTorremolinos/",
    ],
    queue_wait: "Parthenon is straightforward before 01:30. The proper rush lands around 02:00 on Friday and Saturday, when the door can take 15–25 minutes; arriving just before 02:00 gives you the best balance of speed and atmosphere.",
    best_nights: "Friday and Saturday, 02:00–04:30, are the right hours for Parthenon. The surrounding bars have emptied into La Nogalera, the music is loud and the room has the full mixed-age dance-floor charge it is known for.",
    crowd_mix: "This is a broad gay dance-floor crowd: local regulars, Spanish weekend groups, holidaymakers and friends doing the final part of a La Nogalera crawl. Ages and looks mix more freely here than in the image-conscious early bars.",
    dress_code: "A fitted tee or shirt, jeans or shorts and clean trainers are enough. Bring a bolder club look if that is your style, but make sure your shoes can handle a long night on a crowded floor.",
    staff_inclusivity: "Antonio, Juan, Alberto and Tito give the bar a familiar, friendly core, and the room is comfortable for visitors who arrive alone as well as groups. At the door, ask exactly what entry includes before you pay and keep your phone and wallet zipped, especially around the downstairs toilets.",
  },
  {
    id: 349,
    source_urls: [
      "https://www.pinktorremolinos.com/gaybars",
      "https://www.gaymapper.com/gay-guide/gay-torremolinos",
    ],
    queue_wait: "Matraca is a walk-in stop before midnight. On Friday and Saturday, arrive around 23:30 for a drink and a place to stand; once the little dance floor is moving after 00:30, getting served can take 10–15 minutes.",
    best_nights: "Friday and Saturday from 00:30 suit Matraca best. It is the pop-first middle chapter of a La Nogalera night: loud enough to dance, but early enough to use as a launchpad before the larger clubs.",
    crowd_mix: "Matraca draws a compact mix of local pop regulars, visiting queer friends and smaller groups who want commercial hits over a huge production. It feels more spontaneous than a ticketed super-club and works well for a quick social reset.",
    dress_code: "Keep it playful and club-ready: a good top, jeans, shorts, a dress, boots or clean trainers. The room gets warm and close, so choose something you can dance in instead of a costume that needs managing.",
    staff_inclusivity: "The bar has the informal, fast-moving mood of a small La Nogalera music room: say hello, order clearly and claim your spot before the rush. It is a comfortable place for queer groups and solo visitors who want a low-pressure first dance floor, not a guarded VIP scene.",
  },
  {
    id: 351,
    source_urls: [
      "https://www.malaga.eu/la-ciudad/playas/guadalmar-san-julian/index.html",
      "https://naturismo.org/playas-nudistas/andalucia/malaga/guadalmar/",
    ],
    queue_wait: "There is no entry line: Guadalmar is a public beach. In summer, arrive before 10:00 for the easiest parking and a calm patch of sand; access slows around midday when beach traffic and heat are at their peak.",
    best_nights: "Go on a weekday between 10:00 and 13:00. The light is good, the monitored beach is active and you can swim before the strongest heat; this is a daytime place, not a late-evening cruising plan.",
    crowd_mix: "The naturist stretch brings swimmers, sunbathers, walkers, local regulars and visitors who prefer a long open beach to a beach-club scene. People spread out, so the atmosphere is quieter and more self-directed than at Bajondillo.",
    dress_code: "Nudity belongs in the naturist section; bring a cover-up, sandals, water and strong sun protection for everything beyond the sand. Keep clothes on while arriving, leaving or using the surrounding public paths.",
    staff_inclusivity: "There is no venue team here. During the beach season, lifeguards and local police cover the public stretch; stay where that support is visible, respect every visitor's space and never treat nudity as an invitation. Check the beach flag before you swim.",
  },
  {
    id: 354,
    source_urls: [
      "https://www.misterbandb.com/gay-guide/spain/torremolinos/58-saunas-cruising/25263-attack-torremolinos",
      "https://www.elconfidencial.com/espana/andalucia/2021-07-05/torremolinos-turismo-gay-pandemia_3164759/",
    ],
    queue_wait: "At the former Querell address, now run as Attack, weekdays are usually a quick bell-and-door entry. Friday and Saturday theme nights can take 10–20 minutes at the entrance; arrive near 22:30 instead of turning up after midnight.",
    best_nights: "Friday is the strongest choice for the nude-party energy, while a themed Saturday gives the fullest mix of regulars and visitors. Go around 23:00, when the bar is sociable and the play areas have begun to fill.",
    crowd_mix: "Attack is a men-only cruising club for gay and bi men, with local regulars and international visitors from their late twenties through fifties. It is sex-forward, not a casual drinks bar: people come for the themed nights, cabins and play spaces.",
    dress_code: "Follow the party's stated rule. A regular night suits underwear, a harness or simple dark clubwear; the nude night is explicitly nude, while other themes can call for fetish gear. Leave your phone in the locker and keep footwear practical.",
    staff_inclusivity: "The team is attentive with first-timers and keeps the no-phone rule firm, which protects privacy inside the club. This is explicitly a men-only space, so it is not appropriate for women; ask the bar team about the night's dress rule before entering and they will point you in the right direction.",
  },
  {
    id: 1055,
    source_urls: [
      "https://www.qlist.es/events/baila-carino-torremolinos-11-07-2026",
      "https://bigoneclub.com/",
    ],
    queue_wait: "Marta Cariño is easy before midnight. On a popular Baila Cariño Friday or Saturday, the door and first drink can take 15–30 minutes after 00:30; arrive at 23:30 or use advance entry when it is available.",
    best_nights: "Friday and Saturday from 00:00 are the nights for Marta Cariño. Go soon after opening for the drag, DJ and pop/urban build-up, then stay past 01:00 when the dance floor stops being a warm-up and becomes the point of the night.",
    crowd_mix: "The room is visibly LGBTQ+ and attracts pop-loving locals, holiday groups, drag-show fans and friends who want Spanish hits, commercial pop and urban tracks rather than a dark techno club.",
    dress_code: "Come club-ready but relaxed: a sharp top, dress, jeans, boots or clean trainers all work. Make your look expressive if you want to, but choose shoes that survive a long night of dancing.",
    staff_inclusivity: "The drag team and bartenders create a clearly LGTBIQ+ room where big personalities are welcome. Service slows during show changeovers and the door can be strict about partner-promotion deals, so confirm the exact ticket offer as you arrive and you will avoid an unnecessary argument later.",
  },
];

for (const update of rows) {
  const { data, error } = await s.from("places").select("name,venue_intel").eq("id", update.id).single();
  if (error) throw error;
  if (!APPLY) {
    console.log(`Would update ${update.id}: ${data.name}`);
    continue;
  }
  const { error: updateError } = await s
    .from("places")
    .update({
      venue_intel: {
        ...data.venue_intel,
        ...update,
        research_status: "individually_researched_external_sources_batch_05",
        updated_at: "2026-09-30T00:00:00Z",
      },
    })
    .eq("id", update.id);
  if (updateError) throw updateError;
  console.log(`Updated ${update.id}: ${data.name}`);
}
