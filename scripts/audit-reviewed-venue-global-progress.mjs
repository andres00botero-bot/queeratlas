import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "node:fs/promises";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

async function fetchPlaces() {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from("places").select("id,name,city").order("id").range(offset, offset + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

const migrationFiles = (await readdir("supabase"))
  .filter((file) => /^venue-intelligence-(?:global-|berlin-)?reviewed-batch\d+-v\d+\.sql$/i.test(file));
const reviewedIds = new Set();
for (const file of migrationFiles) {
  const sql = await readFile(`supabase/${file}`, "utf8");
  for (const match of sql.matchAll(/\((\d+)::bigint,\s*jsonb_build_object\(/g)) reviewedIds.add(Number(match[1]));
}

const places = await fetchPlaces();
const cities = new Map();
for (const place of places) {
  const current = cities.get(place.city) || { total: 0, reviewed: 0 };
  current.total += 1;
  if (reviewedIds.has(Number(place.id))) current.reviewed += 1;
  cities.set(place.city, current);
}

const cityProgress = [...cities.entries()].map(([city, counts]) => ({
  city,
  ...counts,
  pending: counts.total - counts.reviewed,
})).sort((a, b) => b.pending - a.pending || a.city.localeCompare(b.city));

console.log(JSON.stringify({
  total_venues: places.length,
  total_cities: cityProgress.length,
  editorially_reviewed_in_local_migrations: reviewedIds.size,
  pending_editorial_review: places.length - reviewedIds.size,
  cities_started: cityProgress.filter((city) => city.reviewed > 0).length,
  cities_complete: cityProgress.filter((city) => city.pending === 0).length,
  migration_files: migrationFiles.sort(),
  city_progress: cityProgress,
}, null, 2));
