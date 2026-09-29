import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const checkedAt = "2026-09-29T00:00:00Z";
const fields = ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity"];
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const updates = [
  {
    id: 4050, name: "Ty's Bar", city: "new_york",
    patch: {
      hours: "Sun-Wed 14:00-02:00; Thu 14:00-03:00; Fri-Sat 14:00-04:00.",
      link: "https://tys.nyc/",
      description: "Ty's is Christopher Street without the velvet rope: a 1972 West Village gay bar with a jukebox, a close room and the particular pleasure of finding regulars already mid-conversation at 2pm. It runs late on weekends, but its real currency is continuity—not spectacle.",
      vibe: "long-running Christopher Street gay bar with a jukebox, regulars and late weekends",
      vibe_tags: ["cozy", "social", "cultural"],
    },
    sources: ["https://tys.nyc/", "https://tys.nyc/contact-2/"],
    intel: {
      queue_wait: "There is no ticket routine; the small room is the constraint. Friday and Saturday late can compress quickly, while weekday afternoons are the better bet for a stool and an actual conversation.",
      best_nights: "Go late Friday or Saturday for the fullest buzz, or in the early afternoon when the bar's old-school local rhythm is more visible. Ty's works as a destination in itself, not just a pregame stop.",
      crowd_mix: "Long-time gay regulars, West Village neighbours, visitors who know the history and friends meeting after nearby plans share the bar. It is more intergenerational and conversational than a large Chelsea club.",
      dress_code: "There is no dress code—comfortable city clothes are right. Travel light, bring ID and expect a close bar rather than a lounge built around table service.",
      staff_inclusivity: "Ty's identifies itself as serving the gay community since 1972. The operator does not publish a detailed access or safer-space policy, so direct questions are the right route for specific needs.",
    },
  },
  {
    id: 4052, name: "The Maritime Hotel", city: "new_york",
    patch: {
      hours: "Front desk operates 24 hours; check-in and restaurant hours should be confirmed with the hotel for the reservation date.",
      link: "https://themaritimehotel.com/",
      description: "The Maritime Hotel is Chelsea in portholes: a former sailors' hotel on West 16th Street whose round windows and nautical bones make it feel more characterful than a generic Meatpacking stay. It is a polished base for Chelsea, the High Line and queer downtown plans—not a queer-only hotel.",
      vibe: "nautical Chelsea boutique hotel with porthole windows and easy High Line access",
      vibe_tags: ["luxury", "cultural", "chill"],
    },
    sources: ["https://themaritimehotel.com/", "https://themaritimehotel.com/accessible/"],
    intel: {
      queue_wait: "There is no nightlife queue, but coordinate arrival timing with reception on busy city weekends. Restaurant bookings and hotel check-in are separate, so do not assume a room guarantees an immediate table.",
      best_nights: "Choose Maritime for a Chelsea or Meatpacking base: the High Line, galleries and downtown nightlife are the draw. The building itself suits a slower return after a night out more than it promises an in-house queer programme.",
      crowd_mix: "Design-minded travellers, Chelsea visitors, couples, business guests and restaurant patrons share the hotel. Queer travellers may appreciate the location, but the property is not represented as a queer-exclusive stay.",
      dress_code: "Normal city travel clothes work; pack separately for the restaurants, galleries or clubs on your agenda. The maritime design is ambience, not an invitation to dress thematically.",
      staff_inclusivity: "The hotel documents ADA rooms, roll-in showers, TTY/TTD support, accessible common areas and an elevator route to reception. It does not make a specific queer-programming claim, so inclusion should be described accurately and narrowly.",
    },
  },
];
const removal = { id: 4051, name: "Big Gay Ice Cream", city: "new_york" };
const ids = [...updates.map(({ id }) => id), removal.id];
const { data: rows, error } = await supabase.from("places").select("id,name,city,venue_intel").in("id", ids);
if (error) throw error;
if (rows.length !== ids.length) throw new Error(`Expected ${ids.length} targets, found ${rows.length}`);
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
const closed = rows.find(({ id }) => id === removal.id);
if (!closed || closed.name !== removal.name || closed.city !== removal.city) throw new Error(`Removal target changed: ${removal.id}`);
async function assertSafeRemoval() {
  for (const table of ["reviews", "qa_place_vibe_signals"]) {
    const { count, error: countError } = await supabase.from(table).select("id", { count: "exact", head: true }).eq("place_id", removal.id);
    if (countError) throw countError;
    if (count) throw new Error(`Refusing removal: ${table} has ${count} references`);
  }
}
await assertSafeRemoval();
if (!APPLY) {
  console.log(JSON.stringify({ mode: "dry-run", city: "new_york", updates: updates.length, removal }, null, 2));
} else {
  for (const update of updates) {
    const { data, error: updateError } = await supabase.from("places").update(update.patch).eq("id", update.id).eq("city", update.city).select("id");
    if (updateError) throw updateError;
    if (data.length !== 1) throw new Error(`Update affected ${data.length}: ${update.id}/${update.name}`);
  }
  const { data, error: removeError } = await supabase.from("places").delete().eq("id", removal.id).eq("city", removal.city).select("id");
  if (removeError) throw removeError;
  if (data.length !== 1) throw new Error(`Removal affected ${data.length}: ${removal.id}/${removal.name}`);
  console.log(JSON.stringify({ mode: "applied", updates: updates.length, removal }, null, 2));
}
