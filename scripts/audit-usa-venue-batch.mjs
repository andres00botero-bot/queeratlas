import { createClient } from "@supabase/supabase-js";

const cities = process.argv.slice(2);
if (!cities.length) {
  throw new Error("Usage: node scripts/audit-usa-venue-batch.mjs <city_slug> [...]");
}

const requiredIntel = ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity"];
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const { data: places, error } = await supabase
  .from("places")
  .select("id,name,city,type,description,hours,link,seo_quality_status,venue_intel")
  .in("city", cities)
  .order("city")
  .order("name");
if (error) throw error;

const findings = places.map((place) => {
  const intel = place.venue_intel || {};
  // Rejected rows are deliberately retained as de-indexed archival/deduplication
  // records. They are not live venue listings and must not create a repair task.
  if (place.seo_quality_status === "rejected") {
    return { id: place.id, name: place.name, city: place.city, type: place.type, issues: [], updated_at: intel.updated_at || null };
  }
  const issues = [
    ...requiredIntel.filter((field) => !String(intel[field] || "").trim()).map((field) => `missing_${field}`),
    !String(place.description || "").trim() ? "missing_description" : null,
    !String(place.hours || "").trim() ? "missing_hours" : null,
    !/^https?:\/\//.test(String(place.link || "")) ? "missing_or_invalid_link" : null,
    !Array.isArray(intel.source_urls) || !intel.source_urls.some((url) => /^https?:\/\//.test(url)) ? "missing_verified_source" : null,
    !String(intel.updated_at || "").trim() ? "missing_research_date" : null,
    place.seo_quality_status !== "approved" ? "not_reviewed" : null,
  ].filter(Boolean);
  return { id: place.id, name: place.name, city: place.city, type: place.type, issues, updated_at: intel.updated_at || null };
});

console.log(JSON.stringify({
  cities,
  total: places.length,
  needs_rework: findings.filter((item) => item.issues.length),
  current: findings.filter((item) => !item.issues.length),
}, null, 2));
