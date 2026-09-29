import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const reviewedAt = "2026-09-29T00:00:00Z";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const city = {
  slug: "chengdu",
  name: "Chengdu",
  title: "Queer Chengdu",
  country: "China",
  country_code: "CN",
  latitude: 30.5728,
  longitude: 104.0668,
  map_confirmed: true,
  timezone: "Asia/Shanghai",
  vibe: "late, sociable and shaped by tea-house patience",
  local_mood: "Chengdu's queer nightlife is commercial, late and concentrated rather than publicly branded. The useful rhythm is a flexible plan: check a current venue post, start after 22:00 and let the evening move between Dongdajie and Future Center.",
  queer_status: "Same-sex relations are legal in China, but relationship recognition and nationwide anti-discrimination protections are absent. Chengdu can feel more socially relaxed than other mainland cities, yet discretion, consent and respect for local privacy remain essential.",
  crowd_profile: "Local LGBTQIA+ residents, students, nightlife regulars and domestic visitors make up the core; Mandarin-language venue channels and local apps carry much of the practical information.",
  introduction: "Chengdu is not a rainbow-district city; its queer life is more venue-led and more fluid than that. The strongest current cluster sits around Dongdajie in Jinjiang, where The Butterfly and Monster House give a big-night option, while Pose Club at Future Center in Chenghua offers a more social, dance-led room. Choose a confirmed event, leave room for a late start and do not treat old listings as guarantees.",
  safety_context: "Use current venue channels, keep photography of other people off your plan, and avoid publishing or seeking private meet-up details. Carry the identification and payment access you need, arrange late transport through a trusted method, and remember that public visibility and online openness are not the same thing.",
  guide_items: [
    { title: "About", text: "Chengdu's current queer nightlife is centred on a handful of commercial venues, not a public Pride corridor or permanent gay district." },
    { title: "Districts", text: "Dongdajie/Jinjiang holds the big-club cluster; Future Center in Chenghua has Pose Club. Treat the two as a short ride apart, not one walkable strip." },
    { title: "Nightlife", text: "Check a venue's current Chinese-language channel or trusted current listing on the day. The night generally starts late and a named event is more reliable than a generic weekday claim." },
    { title: "Safety", text: "Prioritise consent, discretion and privacy. Do not photograph strangers, do not rely on informal public-space references and use staffed venues for social plans." },
    { title: "Practical", text: "Digital payments and local ride-hailing are useful to set up before a late night. Confirm address, floor and door conditions directly when possible." },
  ],
  guide_sources: [
    { label: "Unveil China: Chengdu city guide, checked June 2026", url: "https://unveilchina.com/chengdu" },
    { label: "Unveil China: detailed Chengdu guide, checked July 2026", url: "https://unveilchina.com/gay-chengdu-guide" },
    { label: "ILGA World maps", url: "https://ilga.org/ilga-world-maps/" },
  ],
  guide_checked_at: "2026-09-29",
  qari_destination_key: "country:china",
  qari_score: 62,
  qari_summary: "China combines a mixed or restrictive lived-experience climate with severe civic, enforcement and online constraints. Local conditions can still vary by city and identity.",
  qari_confidence: "medium",
  status: "published",
};

const venues = [
  {
    name: "The Butterfly (蝴蝶)", type: "club", vibe: "Drag & Dance", vibe_tags: [],
    lat: 30.6571, lng: 104.0837,
    location: "3F, Tower C, Ruidong Centre, 199 Xia Dongdajie Section, Jinjiang District, Chengdu, Sichuan, China (成都市锦江区东大街下东大街段199号睿东中心C座3楼)",
    hours: "Late evening to after midnight; current show times, entry and closing time must be confirmed directly.",
    link: "https://unveilchina.com/read-inside-the-butterfly-one-night-in-chengdu-s-most-legendary-g",
    description: "The Butterfly is Chengdu's flagship queer club: a multi-hall late-night room at Ruidong Centre where drag, pop and dancefloor energy share the bill. It is best approached as an actual event venue, not a generic 'gay bar' pin—check the current programme, come later than you think and respect the room's privacy culture. For a visitor, it is the clearest current big-night option in the city, but the live listing should always have the final word.",
    venue_intel: {
      crowd_mix: "A predominantly local queer crowd with domestic visitors; headline drag and weekend nights draw the fullest room.",
      dress_code: "Expressive clubwear fits, but wear what works for a late, busy dancefloor rather than chasing a costume rule.",
      queue_wait: "Walk-ins may be possible, while popular weekend tables and show nights can need advance confirmation. Check the current channel before travelling.",
      best_nights: "A confirmed drag or stage-show night, especially Friday through Sunday, is more useful than a blanket weekly promise.",
      staff_inclusivity: "A queer-focused club, but present-day entry, privacy and photography rules must be followed exactly.",
      source_urls: ["https://unveilchina.com/read-inside-the-butterfly-one-night-in-chengdu-s-most-legendary-g", "https://www.gayout.com/asia-aus/china/chengdu"],
      research_status: "multi_source_current_listing",
      research_note: "Address and venue role cross-checked against current 2026 guide and listing sources; confirm live hours and event details directly.",
      updated_at: reviewedAt,
    },
  },
  {
    name: "Monster House (怪兽酒吧)", type: "club", vibe: "Visual Club", vibe_tags: [],
    lat: 30.6574, lng: 104.0831,
    location: "4F, Jinronghui complex, 169 Xia Dongdajie Section, Jinjiang District, Chengdu, Sichuan, China (成都市锦江区东大街下东大街段169号晶融汇4楼)",
    hours: "Reported approximately 21:00–04:30; confirm the current programme, entry and closing time directly.",
    link: "https://unveilchina.com/chengdu",
    description: "Monster House is a newer Chengdu queer club close to The Butterfly, built around a high-production visual room and scheduled stage performance rather than an old-school pub format. It is the choice when you want spectacle, a late start and a properly programmed club night. Because it is new and the scene moves quickly, treat its official/current listings as decisive for the exact floor, event, door and opening time.",
    venue_intel: {
      crowd_mix: "A queer club crowd drawn by stage shows, DJs and late-night visual production; the exact mix follows the event.",
      dress_code: "Dance-ready, expressive clothes work well; use the current event notice if it sets a specific theme.",
      queue_wait: "Popular performance nights can concentrate arrivals near opening. Arrive with time and confirm table or door arrangements ahead if offered.",
      best_nights: "Choose a currently advertised show or guest-host night rather than assuming the same programme every day.",
      staff_inclusivity: "Reported as queer-focused; follow current venue, privacy and consent rules without relying on older guide text.",
      source_urls: ["https://unveilchina.com/chengdu", "https://unveilchina.com/gay-chengdu-guide", "https://afterora.com/en/chengdu"],
      research_status: "multi_source_current_listing",
      research_note: "Opened in 2026 according to multiple current guide sources; operational details require direct same-day confirmation.",
      updated_at: reviewedAt,
    },
  },
  {
    name: "Pose Club", type: "club", vibe: "K-pop & Drag", vibe_tags: [],
    lat: 30.650684, lng: 104.095223,
    location: "Room 401, 4F, Future Center, 26 Dongfeng Road, Chenghua District, Chengdu, Sichuan, China (成华区东风路26号未来中心4楼401)",
    hours: "Late evening; current listings report the strongest activity after 23:00, especially Friday–Sunday. Confirm exact hours and event details directly.",
    link: "https://www.gayout.com/asia-aus/china/chengdu/bars/pose-bar-chengdu",
    description: "Pose Club is Future Center's social, dance-led queer room: a more approachable counterpoint to Chengdu's large spectacle clubs, with K-pop, drag and nights that only really lift after midnight. Its compact layout makes it a solid option when you want to meet people through the energy of a party rather than simply watch a show. Read the current listing first—floor, door practice and themed nights matter here.",
    venue_intel: {
      crowd_mix: "A young, predominantly local queer crowd; K-pop and drag programming bring the room together later in the night.",
      dress_code: "Wear something comfortable enough to dance in. A themed notice matters more than a presumed door code.",
      queue_wait: "The room is often quieter before 23:00 and busier after midnight on Friday–Sunday. Confirm current door practice directly.",
      best_nights: "Look for K-pop random-dance, drag or other named programming, with weekends generally carrying the strongest late energy.",
      staff_inclusivity: "A queer-focused venue according to current specialist listings; direct confirmation is best for specific access or language needs.",
      source_urls: ["https://www.gayout.com/asia-aus/china/chengdu/bars/pose-bar-chengdu", "https://www.travelgay.com/chengdu-gay-bars/", "https://unveilchina.com/gay-chengdu-guide"],
      research_status: "multi_source_current_listing",
      research_note: "Address cross-checked against current map/listing sources; confirm live hours and event details directly.",
      updated_at: reviewedAt,
    },
  },
];

if (!APPLY) {
  console.log(`Would upsert city ${city.slug} and add/check ${venues.length} venues.`);
  process.exit(0);
}

const { error: cityError } = await supabase.from("qa_cities").upsert(city, { onConflict: "slug" });
if (cityError) throw cityError;

for (const venue of venues) {
  const { data: existing, error: lookupError } = await supabase
    .from("places")
    .select("id")
    .eq("city", city.slug)
    .eq("name", venue.name)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) {
    const { error } = await supabase.from("places").update({ ...venue, seo_indexable: true, seo_quality_status: "approved" }).eq("id", existing.id);
    if (error) throw error;
    console.log(`Updated ${venue.name}`);
  } else {
    const { error } = await supabase.from("places").insert({ ...venue, city: city.slug, seo_indexable: true, seo_quality_status: "approved" });
    if (error) throw error;
    console.log(`Added ${venue.name}`);
  }
}

const { error: refreshError } = await supabase.from("qa_cities").update({ updated_at: new Date().toISOString() }).eq("slug", city.slug);
if (refreshError) throw refreshError;
console.log("Chengdu city profile refreshed");
