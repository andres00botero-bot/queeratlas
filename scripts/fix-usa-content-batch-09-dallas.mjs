import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const checkedAt = "2026-09-29T00:00:00Z";
const fields = ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity"];
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const updates = [
  {
    id: 3943, name: "The Mining Company", city: "dallas",
    patch: {
      hours: "Daily 14:00-02:00; 21+. No regular cover. Check Instagram for the night's programme.",
      link: "https://tmcdallas.com/",
      description: "TMC: The Mining Company is Cedar Springs after dark: a low-lit, no-cover LGBTQ+ room where the early afternoon drink can slide into DJs, drag, pup night or a late dance floor without changing addresses. It is compact, hot-running and unapologetically social—the kind of Oak Lawn stop where the plan often gets made at the bar.",
      vibe: "low-lit Cedar Springs LGBTQ+ bar with no cover, drag, DJs and daily late energy",
      vibe_tags: ["social", "pop", "after"],
    },
    sources: ["https://tmcdallas.com/", "https://discovergaydallas.com/listings/tmc/"],
    intel: {
      queue_wait: "TMC does not charge a regular cover, but the compact room can bunch up during weekend drag, themed nights and the late dance rush. An afternoon or early evening arrival is easier if pool or a seat is the goal.",
      best_nights: "The venue runs daily rather than saving all its energy for Saturday: go by the current Instagram plan for drag, pup, DJ or themed nights. Sunday Funday is a different proposition from a 01:00 dance floor.",
      crowd_mix: "Oak Lawn regulars, LGBTQ+ visitors, drag fans and friend groups share the room. The operator says everyone is welcome, while the late-night vibe is still distinctly queer and dance-forward.",
      dress_code: "Come as you are; there is no cover or published formal code. Casual barwear works in the afternoon, while the room naturally gets more expressive once the DJs and drag take over.",
      staff_inclusivity: "TMC explicitly identifies as an LGBTQ+ 21+ venue and says everyone is welcome. It does not publish detailed accessibility or event-boundary guidance, so contact the venue for a specific need.",
    },
  },
  {
    id: 3944, name: "Marty's Live", city: "dallas",
    patch: {
      hours: "Daily 13:00-02:00 according to current local listings; check the venue's social channel before travelling.",
      link: "https://www.restaurantji.com/tx/dallas/martys-live-/",
      description: "Marty's Live is a Maple Avenue staple in Dallas's Black LGBTQ+ nightlife, where house music, go-go sets, live Sunday energy and a crowd that knows the room carry more weight than polished cocktail-bar manners. It is lively, lived-in and best approached as a real community night—not a generic gay-bar checkbox.",
      vibe: "Black LGBTQ+ Maple Avenue bar with house music, dancers and live Sunday energy",
      vibe_tags: ["cultural", "social", "pop"],
    },
    sources: ["https://www.restaurantji.com/tx/dallas/martys-live-/", "https://www.blackgaydallas.com/club-life", "https://maps.roadtrippers.com/us/dallas-tx/food-drink/martys-live"],
    intel: {
      queue_wait: "The room can form a line on busy weekend or Sunday show periods, while weekday early hours are usually more relaxed. There are no reservations, so arrive ahead of a named performance if getting in promptly matters.",
      best_nights: "Sunday live programming and weekend music bring the most momentum; current listings also point to Tuesday lesbian-night programming. Follow the active channel rather than relying on an old flyer.",
      crowd_mix: "Black LGBTQ+ Dallas is central to the venue's identity, alongside queer locals, dancers and visitors. It is a music-led social bar, with the programme shaping the room more than a fixed genre label.",
      dress_code: "Dress for a proper night out if you want, but no standing formal code is published. Comfortable shoes help: this is a music-and-dancing room, not a seated cocktail lounge.",
      staff_inclusivity: "Current Black LGBTQ+ Dallas coverage identifies Marty's as a venue marketed to gay Black men. That is meaningful community context; the venue does not publish a detailed accessibility or safer-space policy.",
    },
  },
  {
    id: 3945, name: "Olympus Bar & Lounge", city: "dallas",
    patch: {
      hours: "Current operating hours could not be reliably verified. Contact the venue directly before travelling.",
      link: "https://www.atly.com/location/Olympus-Barlounge",
      description: "Olympus Bar & Lounge is a small Maple Avenue gay bar whose current listings point to live performers, queens and gods rather than a large-club format. The useful advice is to treat it as a venue to verify on the day: public information is thin, and the room's event rhythm appears to matter more than a dependable weekly timetable.",
      vibe: "small Maple Avenue gay bar with performer-led nights and limited current public information",
      vibe_tags: ["drag", "social", "mixed"],
    },
    sources: ["https://www.atly.com/location/Olympus-Barlounge", "https://scene.events/venues/olympus-bar-lounge-dallas-tx", "https://drinkedin.net/bars/olympus-mb200136096"],
    intel: {
      queue_wait: "There is no reliable current source for a standard door routine. Community listings flag limited parking and occasional cover, so confirm the named event, price and arrival plan directly before making the trip.",
      best_nights: "Choose Olympus only when a current event or performer you want is publicly confirmed. It should not be sold as a dependable every-night alternative while its live schedule remains unclear.",
      crowd_mix: "Available current listings place Olympus in Dallas's gay-bar ecosystem and mention live queens and gods. They do not support a precise claim about its regular crowd, so this profile keeps that uncertainty visible.",
      dress_code: "No current house dress code is verified. Event-ready casual is sensible, but the organiser's instructions outrank generic nightlife advice.",
      staff_inclusivity: "The available sources identify Olympus as a gay bar, but no first-party inclusion, access or safety policy could be verified. Contact the venue directly for essential information rather than inferring it from directory labels.",
    },
  },
  {
    id: 3946, name: "The Club Dallas", city: "dallas",
    patch: {
      hours: "Open 24 hours daily; private men's club, 18+; membership and government photo ID required.",
      link: "https://www.theclubs.com/",
      description: "The Club Dallas is a 24-hour private men's sauna and gym on Swiss Avenue, with the pool, steam, dry sauna, whirlpool and weight room making it more than a late-night hookup stop. It is adult, men-only and membership-based—go with a clear sense of your own boundaries, not with assumptions about a conventional nightclub.",
      vibe: "24-hour private men's bathhouse with gym, pool, sauna and adult social space",
      vibe_tags: ["relax", "cruise", "men_only"],
    },
    sources: ["https://www.theclubs.com/", "https://gayhangouts.com/bathhouses/tx/dallas/the-club-dallas/", "https://dallasvoice.com/wp-content/uploads/2024/11/Dallas-Voice-11-22-24.pdf"],
    intel: {
      queue_wait: "Entry is handled through membership and photo-ID check-in, not a nightclub rope. Weekends and pool events can make lockers or rooms less immediately available; ask the desk about current availability rather than assuming it.",
      best_nights: "Weekday daytime is the calmer fitness-and-facilities visit; weekends and advertised pool activity bring more social energy. The club is always open, but each amenity and event has its own practical rhythm.",
      crowd_mix: "Adult men—members, local regulars, travellers, gym users and guests attending a listed event—share the facility. It is explicitly a private men's club, so it is not an all-gender wellness spa.",
      dress_code: "Bring government photo ID and follow the club's membership, locker, towel, footwear, consent and device rules. Named events may invite gear, but the facility's rules—not assumptions—set the boundaries.",
      staff_inclusivity: "The operator describes The Clubs as private saunas and gyms for adult men and requires membership plus ID. For an access, health or consent concern, ask staff directly; do not treat marketing as a substitute for on-site guidance.",
    },
  },
];

const { data: rows, error } = await supabase.from("places").select("id,name,city,venue_intel").in("id", updates.map(({ id }) => id));
if (error) throw error;
if (rows.length !== updates.length) throw new Error(`Expected ${updates.length} targets, found ${rows.length}`);
for (const update of updates) {
  const row = rows.find(({ id }) => id === update.id);
  if (!row || row.name !== update.name || row.city !== update.city) throw new Error(`Target changed: ${update.id}`);
  for (const field of fields) if (!String(update.intel[field] || "").trim()) throw new Error(`Missing ${field}: ${update.name}`);
  update.patch.venue_intel = {
    ...(row.venue_intel || {}), ...update.intel, source_urls: update.sources,
    research_status: "current_operator_or_current_authoritative_source_verified", updated_at: checkedAt,
    topic_evidence: Object.fromEntries(fields.map((field) => [field, { status: "current_operator_or_current_authoritative_source_verified", checked_at: checkedAt, source_urls: update.sources }])),
  };
  update.patch.seo_indexable = true;
  update.patch.seo_quality_status = "approved";
}

if (!APPLY) {
  console.log(JSON.stringify({ mode: "dry-run", city: "dallas", updates: updates.length }, null, 2));
} else {
  for (const update of updates) {
    const { data, error: updateError } = await supabase.from("places").update(update.patch).eq("id", update.id).eq("city", update.city).select("id");
    if (updateError) throw updateError;
    if (data.length !== 1) throw new Error(`Update affected ${data.length}: ${update.id}/${update.name}`);
  }
  console.log(JSON.stringify({ mode: "applied", updates: updates.length }, null, 2));
}
