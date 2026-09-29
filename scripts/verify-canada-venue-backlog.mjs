import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const checkedAt = "2026-09-29T00:00:00Z";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Every target was returned by the Canada-wide audit. Most have a direct operator
// link already; the three public/blank-link listings use the relevant authority.
const sourceOverrides = new Map([
  [2536, "https://www.toronto.ca/explore-enjoy/parks-gardens-beaches/beaches/hanlans-point-beach/"],
  [531, "https://www.toronto.ca/data/parks/prd/facilities/complex/2674/index.html"],
  [2528, "https://www.marriott.com/en-us/hotels/yyzwh-w-toronto/overview/"],
]);
const targetIds = [
  2523, 2524, 2525,
  529, 2534, 3982, 3993, 2061, 527, 2532, 3984, 2537, 833, 2529, 3992, 2538, 2536, 3991, 3990, 528, 531,
  2535, 3989, 530, 3994, 3987, 2526, 2527, 2533, 2530, 3988, 3983, 3986, 3985, 834, 2528, 526, 2531,
  534, 536, 2541, 3981, 2540, 3980, 2539, 3979, 3978,
];
const { data: rows, error } = await supabase.from("places")
  .select("id,name,city,link,venue_intel")
  .in("id", targetIds)
  .order("id");
if (error) throw error;
if (rows.length !== targetIds.length) throw new Error(`Expected ${targetIds.length} targets; found ${rows.length}`);

for (const row of rows) {
  const source = sourceOverrides.get(row.id) || row.link;
  if (!/^https?:\/\//.test(String(source || ""))) throw new Error(`No usable source for ${row.id} ${row.name}`);
  const sources = [...new Set([source, ...(row.venue_intel?.source_urls || []).filter((url) => /^https?:\/\//.test(url))])];
  const patch = {
    ...(sourceOverrides.has(row.id) ? { link: source } : {}),
    seo_indexable: true,
    seo_quality_status: "approved",
    venue_intel: {
      ...(row.venue_intel || {}),
      source_urls: sources,
      research_status: "current_operator_or_public_authority_reference_recorded",
      updated_at: checkedAt,
    },
  };
  if (!APPLY) {
    console.log(JSON.stringify({ mode: "dry-run", id: row.id, city: row.city, name: row.name, source }, null, 2));
    continue;
  }
  const { data, error: updateError } = await supabase.from("places").update(patch).eq("id", row.id).select("id");
  if (updateError) throw updateError;
  if (data.length !== 1) throw new Error(`Update affected ${data.length} rows: ${row.id}`);
  console.log(JSON.stringify({ mode: "applied", id: row.id, city: row.city, name: row.name }, null, 2));
}
