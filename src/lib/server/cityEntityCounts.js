import "server-only";
import { supabase } from "@/lib/supabase";
import { mergeSeedEventsAsync } from "@/lib/seedMerge";
import { normalizeCityKey } from "@/features/city/checkinFeature";
import { isUpcomingPublishedEvent, uniquePublishedEntities } from "@/lib/publicInventory";

const PAGE_SIZE = 1000;
const MAX_PAGES = 50;
const TTL_MS = 5 * 60 * 1000;
const PROJECTIONS = {
  places: "id,name,city,type,seo_indexable,seo_quality_status",
  events: "id,name,city,date,start_date,end_date,event_status,seo_indexable,seo_quality_status",
  services: "id,name,city,type",
};

let cached = null;
let cachedAt = 0;
let pending = null;

async function fetchRows(table, fields) {
  const rows = [];
  try {
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const from = page * PAGE_SIZE;
      const { data, error } = await supabase.from(table).select(fields).order("id", { ascending: true }).range(from, from + PAGE_SIZE - 1);
      if (error) return { rows, error };
      rows.push(...(data || []));
      if (!data || data.length < PAGE_SIZE) break;
    }
    return { rows, error: null };
  } catch (error) {
    return { rows, error };
  }
}

async function loadRows(table) {
  const result = await fetchRows(table, PROJECTIONS[table]);
  const code = String(result.error?.code || "");
  if (code === "42703" || code === "PGRST204") return fetchRows(table, "*");
  return result;
}

function dedupeByIdentity(rows) {
  const seen = new Set();
  return rows.filter((row) => {
    const city = normalizeCityKey(row?.city);
    const id = String(row?.id || "").trim();
    const key = `${city}::${id}`;
    if (!city || !id || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function buildCounts() {
  const [places, events, services] = await Promise.all([
    loadRows("places"), loadRows("events"), loadRows("services"),
  ]);
  const sets = [
    uniquePublishedEntities(dedupeByIdentity(places.rows)),
    uniquePublishedEntities(dedupeByIdentity(await mergeSeedEventsAsync(events.rows))).filter((event) => isUpcomingPublishedEvent(event)),
    dedupeByIdentity(services.rows),
  ];
  const counts = new Map();
  sets.forEach((rows, index) => rows.forEach((row) => {
    const city = normalizeCityKey(row.city);
    const cityCounts = counts.get(city) || [0, 0, 0];
    cityCounts[index] += 1;
    counts.set(city, cityCounts);
  }));
  return { counts, available: [!places.error, !events.error, !services.error] };
}

export async function getCityEntityCounts(city) {
  const now = Date.now();
  if (!cached || now - cachedAt >= TTL_MS) {
    if (!pending) pending = buildCounts().then((value) => {
      cached = value;
      cachedAt = Date.now();
      return value;
    }).finally(() => { pending = null; });
    await pending;
  }
  const values = cached.counts.get(normalizeCityKey(city)) || [0, 0, 0];
  const count = (index) => cached.available[index] || values[index] > 0 ? values[index] : null;
  return { venues: count(0), events: count(1), services: count(2) };
}
