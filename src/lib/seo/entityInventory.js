import { cityCoreConfig } from "@/lib/cityCore";
import { mergeSeedEventsAsync } from "@/lib/seedMerge";
import { listCityRegistry } from "@/lib/server/cityRegistry";
import { supabase } from "@/lib/supabase";
import { normalizeCitySlug } from "@/lib/seo/entitySlug";
import {
  evaluateEventSeoQuality,
  evaluateServiceSeoQuality,
  evaluateVenueSeoQuality,
  excludeDuplicateEntityCopy,
} from "@/lib/seo/entityIndexing";

const PAGE_SIZE = 1000;
const MAX_PAGES = 50;
const CACHE_TTL_MS = 5 * 60 * 1000;
const staticCityKeys = new Set(Object.keys(cityCoreConfig));

let cachedInventory = null;
let cachedAt = 0;
let pendingInventory = null;

function rowsOnly(value) {
  return Array.isArray(value) ? value : [];
}

async function fetchAllRows(table) {
  const rows = [];
  try {
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const from = page * PAGE_SIZE;
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("id", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (error) return { rows, error };
      const pageRows = rowsOnly(data);
      rows.push(...pageRows);
      if (pageRows.length < PAGE_SIZE) break;
    }
    return { rows, error: null };
  } catch (error) {
    return { rows, error };
  }
}

function inSupportedCity(entity = {}, supportedCityKeys = staticCityKeys) {
  return supportedCityKeys.has(normalizeCitySlug(entity?.city));
}

async function loadSupportedCityKeys() {
  try {
    const registry = await listCityRegistry();
    return new Set([
      ...staticCityKeys,
      ...registry.map((city) => normalizeCitySlug(city?.key)).filter(Boolean),
    ]);
  } catch {
    return staticCityKeys;
  }
}

function dedupeByPathIdentity(rows = []) {
  const seen = new Set();
  return rows.filter((row) => {
    const city = normalizeCitySlug(row?.city);
    const id = String(row?.id || "").trim();
    const key = `${city}::${id}`;
    if (!city || !id || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function buildInventory() {
  const [placesResult, eventsResult, servicesResult, supportedCityKeys] = await Promise.all([
    fetchAllRows("places"),
    fetchAllRows("events"),
    fetchAllRows("services"),
    loadSupportedCityKeys(),
  ]);

  const allVenues = dedupeByPathIdentity(
    placesResult.rows.filter((row) => inSupportedCity(row, supportedCityKeys)),
  );
  const allEvents = dedupeByPathIdentity(
    (await mergeSeedEventsAsync(eventsResult.rows)).filter((row) =>
      inSupportedCity(row, supportedCityKeys),
    ),
  );
  const allServices = dedupeByPathIdentity(
    servicesResult.rows.filter((row) => inSupportedCity(row, supportedCityKeys)),
  );

  const venues = excludeDuplicateEntityCopy(allVenues).filter(
    (row) => evaluateVenueSeoQuality(row).indexable,
  );
  const events = excludeDuplicateEntityCopy(allEvents).filter(
    (row) => evaluateEventSeoQuality(row).indexable,
  );
  const services = excludeDuplicateEntityCopy(allServices).filter(
    (row) => evaluateServiceSeoQuality(row).indexable,
  );

  return {
    venues,
    events,
    services,
    allVenues,
    allEvents,
    allServices,
    availability: {
      places: !placesResult.error,
      events: !eventsResult.error,
      services: !servicesResult.error,
    },
    partial: Boolean(placesResult.error || eventsResult.error || servicesResult.error),
  };
}

export async function loadSeoEntityInventory({ fresh = false } = {}) {
  const now = Date.now();
  if (!fresh && cachedInventory && now - cachedAt < CACHE_TTL_MS) return cachedInventory;
  if (!fresh && pendingInventory) return pendingInventory;

  pendingInventory = buildInventory()
    .then((inventory) => {
      cachedInventory = inventory;
      cachedAt = Date.now();
      return inventory;
    })
    .finally(() => {
      pendingInventory = null;
    });

  return pendingInventory;
}
