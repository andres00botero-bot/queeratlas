import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

if (!process.argv.includes("--apply")) {
  throw new Error("Refusing to write to Supabase without --apply. Run with --apply after reviewing the Stuttgart package.");
}

const source = await readFile(new URL("../supabase/city-stuttgart-curated-v1.sql", import.meta.url), "utf8");
const extract = (name) => {
  const match = source.match(new RegExp(`\\$${name}\\$\\s*([\\s\\S]*?)\\s*\\$${name}\\$`));
  if (!match) throw new Error(`Could not find $${name}$ JSON in the Stuttgart package.`);
  return JSON.parse(match[1]);
};
const [city] = extract("qa_cities");
const places = extract("qa_places");
const events = extract("qa_events");
const services = extract("qa_services");

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const fail = (label, error) => {
  if (error) throw new Error(`${label}: ${error.message}`);
};
const syncByName = async (table, rows, label) => {
  const { data: existing, error: existingError } = await supabase
    .from(table)
    .select("id,name")
    .eq("city", "stuttgart");
  fail(`Reading existing ${label}`, existingError);
  const idsByName = new Map((existing || []).map((row) => [row.name.toLowerCase(), row.id]));
  const inserts = rows.filter((row) => !idsByName.has(row.name.toLowerCase()));
  const updates = rows.filter((row) => idsByName.has(row.name.toLowerCase()));
  if (inserts.length) {
    const { error } = await supabase.from(table).insert(inserts);
    fail(`Creating ${label}`, error);
  }
  for (const row of updates) {
    const { error } = await supabase.from(table).update(row).eq("id", idsByName.get(row.name.toLowerCase()));
    fail(`Updating ${label}`, error);
  }
};

const { data: qariProfiles, error: qariError } = await supabase
  .from("qa_qari_profiles")
  .select("destination_key,qari_score,summary,confidence")
  .eq("destination_key", city.qari_key)
  .eq("scope_type", "country")
  .eq("is_published", true)
  .order("reviewed_at", { ascending: false })
  .limit(1);
fail("Loading Germany QARI profile", qariError);
const qari = qariProfiles?.[0];
if (!qari) throw new Error("A published Germany QARI profile is required before publishing Stuttgart.");

const { qari_key, ...cityRecord } = city;
const { error: cityError } = await supabase.from("qa_cities").upsert({
  ...cityRecord,
  map_confirmed: true,
  guide_checked_at: "2026-10-27",
  qari_destination_key: qari.destination_key,
  qari_score: qari.qari_score,
  qari_summary: qari.summary,
  qari_confidence: qari.confidence,
  status: "published",
}, { onConflict: "slug" });
fail("Publishing Stuttgart city", cityError);

await syncByName("places", places.map((place) => ({
  name: place.name, city: place.city, type: place.type, description: place.description,
  hours: place.hours, link: place.link, location: place.location, lat: place.lat, lng: place.lng,
  vibe: place.vibe, vibe_tags: [], seo_indexable: true, seo_quality_status: "approved",
  venue_intel: {
    entry_wait: place.q, best_nights: place.best, crowd_mix: place.crowd,
    dress_code: place.dress, staff_inclusivity: place.staff, source_urls: place.sources,
    research_status: "current_official_or_municipal_source", updated_at: "2026-10-27T00:00:00Z",
  },
})), "Stuttgart places");

await syncByName("events", events.map((event) => ({
  name: event.name, city: event.city, description: event.description, link: event.link,
  date: event.date, start_date: event.start_date, end_date: event.end_date, location: event.location,
  lat: event.lat, lng: event.lng, vibe: event.vibe, vibe_tags: [], seo_indexable: true,
  seo_quality_status: "approved",
  event_intel: {
    entry_wait: event.q, best_arrival: event.best, crowd_mix: event.crowd,
    dress_code: event.dress, host_inclusivity: event.host, source_urls: event.sources,
    research_status: "official_organiser_schedule", updated_at: "2026-10-27T00:00:00Z",
  },
})), "Stuttgart events");

await syncByName("services", services.map((service) => ({
  name: service.name, city: service.city, type: service.type, provider_name: service.provider,
  contact: service.contact, booking_link: service.booking, description: service.description,
  hours: service.hours, link: service.link, location: service.location, lat: service.lat, lng: service.lng,
  vibe: service.vibe, vibe_tags: [], source: "Official/provider sources; checked 2026-10-27",
  lastChecked: "2026-10-27", verified: true, seo_indexable: true, seo_quality_status: "approved",
  service_intel: {
    booking_lead_time: service.lead, best_time: service.best, client_mix: service.crowd,
    preparation: service.prep, provider_inclusivity: service.incl, source_urls: service.sources,
    research_status: "current_first_party_or_municipal_source", updated_at: "2026-10-27T00:00:00Z",
  },
})), "Stuttgart services");

const { error: refreshError } = await supabase.rpc("qa_refresh_city_seo_status", { city_slug: "stuttgart" });
if (refreshError && !/function|does not exist/i.test(refreshError.message)) fail("Refreshing Stuttgart SEO", refreshError);

const [cityResult, placesResult, eventsResult, servicesResult] = await Promise.all([
  supabase.from("qa_cities").select("slug,name,status,seo_indexable").eq("slug", "stuttgart").single(),
  supabase.from("places").select("id", { count: "exact", head: true }).eq("city", "stuttgart"),
  supabase.from("events").select("id", { count: "exact", head: true }).eq("city", "stuttgart"),
  supabase.from("services").select("id", { count: "exact", head: true }).eq("city", "stuttgart"),
]);
fail("Reading Stuttgart city", cityResult.error);
fail("Reading Stuttgart places", placesResult.error);
fail("Reading Stuttgart events", eventsResult.error);
fail("Reading Stuttgart services", servicesResult.error);
console.log(JSON.stringify({ city: cityResult.data, places: placesResult.count, events: eventsResult.count, services: servicesResult.count }));
