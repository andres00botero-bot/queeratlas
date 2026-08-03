import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const required = ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity", "source_urls", "research_status", "updated_at"];
const rows = [];

for (let start = 0; ; start += 1000) {
  const { data, error } = await supabase
    .from("places")
    .select("id,name,city,venue_intel")
    .order("city", { ascending: true })
    .order("name", { ascending: true })
    .range(start, start + 999);
  if (error) throw error;
  rows.push(...data);
  if (data.length < 1000) break;
}

const populated = rows.filter((row) => row.venue_intel && Object.keys(row.venue_intel).length > 0);
const complete = populated.filter((row) => required.every((key) => {
  const value = row.venue_intel?.[key];
  return value != null && value !== "" && (!Array.isArray(value) || value.length > 0);
}));
const invalidSources = populated.filter((row) => !Array.isArray(row.venue_intel?.source_urls) || row.venue_intel.source_urls.some((url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol !== "http:" && parsed.protocol !== "https:";
  } catch {
    return true;
  }
}));
const overLength = populated.filter((row) => ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity"]
  .some((key) => (row.venue_intel?.[key] || "").length > 320));
const first900Missing = rows.slice(0, 900).filter((row) => !complete.some((item) => item.id === row.id));
const after900Populated = rows.slice(900).filter((row) => row.venue_intel && Object.keys(row.venue_intel).length > 0);
const remainingByCity = rows.slice(900).reduce((acc, row) => {
  acc[row.city] = (acc[row.city] || 0) + 1;
  return acc;
}, {});
const remainingByType = rows.slice(900).reduce((acc, row) => {
  const key = row.type || "unknown";
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});
const statuses = populated.reduce((acc, row) => {
  const key = row.venue_intel?.research_status || "missing";
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({
  total_places: rows.length,
  populated: populated.length,
  complete: complete.length,
  invalid_sources: invalidSources.length,
  over_320_chars: overLength.length,
  first_900_missing: first900Missing.length,
  after_900_populated: after900Populated.length,
  remaining_by_city: remainingByCity,
  remaining_by_type: remainingByType,
  boundary: {
    first: rows[0] && { id: rows[0].id, name: rows[0].name },
    position_900: rows[899] && { id: rows[899].id, name: rows[899].name },
    position_901: rows[900] && { id: rows[900].id, name: rows[900].name },
    last: rows.at(-1) && { id: rows.at(-1).id, name: rows.at(-1).name },
  },
  statuses,
}, null, 2));
