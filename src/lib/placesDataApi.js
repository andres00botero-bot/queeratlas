import { supabase } from "./supabase";
import { mergeSeedPlacesAsync } from "./seedMerge";
import { shouldFallbackFromPlacesWithStats } from "./supabaseErrorGuards";

const PLACES_FALLBACK_SELECT =
  "id, name, type, city, lat, lng, description, vibe, hours, link, location";
let skipPlacesWithStatsView = false;

function selectPlaces(client, table, select, options) {
  const query = client.from(table);
  return options ? query.select(select, options) : query.select(select);
}

function normalizeRows(data) {
  return Array.isArray(data) ? data : [];
}

async function maybeMergeSeedRows(rows, mergeSeed) {
  if (!mergeSeed) return rows;
  return mergeSeedPlacesAsync(rows);
}

export async function fetchPlacesQueryWithFallback({
  client = supabase,
  select = "*",
  options,
  mergeSeed = false,
} = {}) {
  if (skipPlacesWithStatsView) {
    const placesRes = await selectPlaces(client, "places", select, options);
    const rows = normalizeRows(placesRes?.data);
    return {
      data: await maybeMergeSeedRows(rows, mergeSeed),
      error: placesRes?.error ?? null,
      count: placesRes?.count ?? null,
      source: "places",
    };
  }

  const statsRes = await selectPlaces(client, "places_with_stats", select, options);
  const statsError = statsRes?.error ?? null;

  if (!statsError) {
    const rows = normalizeRows(statsRes?.data);
    return {
      data: await maybeMergeSeedRows(rows, mergeSeed),
      error: null,
      count: statsRes?.count ?? null,
      source: "places_with_stats",
    };
  }

  if (!shouldFallbackFromPlacesWithStats(statsError)) {
    const rows = normalizeRows(statsRes?.data);
    return {
      data: await maybeMergeSeedRows(rows, mergeSeed),
      error: statsError,
      count: statsRes?.count ?? null,
      source: "places_with_stats",
    };
  }

  skipPlacesWithStatsView = true;
  const placesRes = await selectPlaces(client, "places", select, options);
  const rows = normalizeRows(placesRes?.data);
  return {
    data: await maybeMergeSeedRows(rows, mergeSeed),
    error: placesRes?.error ?? null,
    count: placesRes?.count ?? null,
    source: "places",
  };
}

export async function fetchPlacesForAtlas({ client = supabase } = {}) {
  return fetchPlacesQueryWithFallback({
    client,
    select: PLACES_FALLBACK_SELECT,
    mergeSeed: true,
  });
}
