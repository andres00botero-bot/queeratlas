import { supabase } from "./supabase";
import { shouldFallbackFromPlacesWithStats } from "./supabaseErrorGuards";

const PLACES_FALLBACK_SELECT_WITH_LEGACY_ID =
  "id, legacy_seed_id, name, type, city, lat, lng, description, vibe, hours, link, location, venue_intel, vibe_tags, updated_at, seo_indexable, seo_quality_status";
const PLACES_FALLBACK_SELECT_WITH_INTEL =
  "id, name, type, city, lat, lng, description, vibe, hours, link, location, venue_intel, vibe_tags, updated_at, seo_indexable, seo_quality_status";
const PLACES_FALLBACK_SELECT =
  "id, name, type, city, lat, lng, description, vibe, hours, link, location";
const SUPABASE_PAGE_SIZE = 1000;
let skipPlacesWithStatsView = false;

function applyPlacesFilters(query, filters = {}) {
  let nextQuery = query;
  const city = String(filters?.city || "").trim();
  const id = String(filters?.id || "").trim();
  if (city) {
    nextQuery = nextQuery.eq("city", city);
  }
  if (id) {
    nextQuery = nextQuery.eq("id", id);
  }
  return nextQuery;
}

function selectPlaces(client, table, select, options, filters) {
  const selectedQuery = options
    ? client.from(table).select(select, options)
    : client.from(table).select(select);
  return applyPlacesFilters(selectedQuery, filters);
}

function shouldFetchAllPages(options) {
  return !Boolean(options?.head);
}

async function selectPlaceRows(client, table, select, options, filters) {
  if (!shouldFetchAllPages(options)) {
    return selectPlaces(client, table, select, options, filters);
  }

  return fetchAllPages(() => selectPlaces(client, table, select, options, filters));
}

function normalizeRows(data) {
  return Array.isArray(data) ? data : [];
}

async function fetchAllPages(buildQuery) {
  const rows = [];

  for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
    const to = from + SUPABASE_PAGE_SIZE - 1;
    const response = await buildQuery().range(from, to);
    if (response?.error) {
      return { data: rows, error: response.error, count: response.count ?? null };
    }

    const pageRows = normalizeRows(response?.data);
    rows.push(...pageRows);

    if (pageRows.length < SUPABASE_PAGE_SIZE) {
      return { data: rows, error: null, count: response.count ?? rows.length };
    }
  }
}

function isMissingColumnSelectionError(error) {
  const code = String(error?.code || "").toUpperCase();
  const message = String(error?.message || "").toLowerCase();
  const details = String(error?.details || "").toLowerCase();
  const hint = String(error?.hint || "").toLowerCase();
  const text = `${message} ${details} ${hint}`;
  const referencesPlacesProjection =
    text.includes("places.") ||
    text.includes("places_with_stats") ||
    text.includes("schema cache");
  return (
    (code === "42703" || code === "PGRST204") &&
    referencesPlacesProjection &&
    (text.includes("column") || text.includes("schema cache") || text.includes("could not find"))
  );
}

function toFiniteNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeReviewCount(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.round(numeric);
}

async function fetchReviewStatsByPlaceId(client, placeIds = []) {
  const uniquePlaceIds = [...new Set((placeIds || []).map((id) => String(id || "").trim()).filter(Boolean))];
  if (uniquePlaceIds.length === 0) return new Map();

  try {
    const rows = [];
    for (let i = 0; i < uniquePlaceIds.length; i += SUPABASE_PAGE_SIZE) {
      const chunk = uniquePlaceIds.slice(i, i + SUPABASE_PAGE_SIZE);
      const { data, error } = await client
        .from("reviews")
        .select("place_id, rating")
        .in("place_id", chunk);
      if (error || !Array.isArray(data)) {
        return new Map();
      }
      rows.push(...data);
    }

    return rows.reduce((acc, row) => {
      const placeId = String(row?.place_id || "");
      if (!placeId) return acc;
      const rating = Number(row?.rating);
      if (!Number.isFinite(rating) || rating <= 0) return acc;
      const current = acc.get(placeId) || { total: 0, count: 0 };
      current.total += rating;
      current.count += 1;
      acc.set(placeId, current);
      return acc;
    }, new Map());
  } catch {
    return new Map();
  }
}

function normalizePlaceStats(rows, statsByPlaceId) {
  return rows.map((row) => {
    const placeId = String(row?.id || "");
    const stats = statsByPlaceId.get(placeId) || { total: 0, count: 0 };
    const rowReviewCount = normalizeReviewCount(row?.reviewCount ?? row?.review_count);
    const reviewCount = rowReviewCount > 0 ? rowReviewCount : stats.count;

    const rowAvgRatingRaw = toFiniteNumber(row?.avgRating ?? row?.avg_rating);
    const rowAvgRating = rowAvgRatingRaw && rowAvgRatingRaw > 0 ? rowAvgRatingRaw : null;
    const computedAvgRating =
      stats.count > 0 ? Number((stats.total / stats.count).toFixed(1)) : null;
    const avgRating = rowAvgRating ?? computedAvgRating;

    return {
      ...row,
      reviewCount,
      avgRating,
      review_count: reviewCount,
      avg_rating: avgRating,
    };
  });
}

export async function fetchPlacesQueryWithFallback({
  client = supabase,
  select = "*",
  options,
  filters,
} = {}) {
  if (skipPlacesWithStatsView) {
    let placesRes = await selectPlaceRows(client, "places", select, options, filters);
    if (placesRes?.error && select !== "*" && isMissingColumnSelectionError(placesRes.error)) {
      placesRes = await selectPlaceRows(client, "places", "*", options, filters);
    }
    const rows = normalizeRows(placesRes?.data);
    return {
      data: rows,
      error: placesRes?.error ?? null,
      count: placesRes?.count ?? null,
      source: "places",
    };
  }

  const statsRes = await selectPlaceRows(client, "places_with_stats", select, options, filters);
  const statsError = statsRes?.error ?? null;

  if (!statsError) {
    const rows = normalizeRows(statsRes?.data);
    return {
      data: rows,
      error: null,
      count: statsRes?.count ?? null,
      source: "places_with_stats",
    };
  }

  if (!shouldFallbackFromPlacesWithStats(statsError)) {
    const rows = normalizeRows(statsRes?.data);
    return {
      data: rows,
      error: statsError,
      count: statsRes?.count ?? null,
      source: "places_with_stats",
    };
  }

  skipPlacesWithStatsView = true;
  let placesRes = await selectPlaceRows(client, "places", select, options, filters);
  if (placesRes?.error && select !== "*" && isMissingColumnSelectionError(placesRes.error)) {
    placesRes = await selectPlaceRows(client, "places", "*", options, filters);
  }
  const rows = normalizeRows(placesRes?.data);
  return {
    data: rows,
    error: placesRes?.error ?? null,
    count: placesRes?.count ?? null,
    source: "places",
  };
}

export async function fetchPlacesForAtlas({ client = supabase, filters } = {}) {
  let placesRes = await fetchAllPages(() =>
    selectPlaces(client, "places", PLACES_FALLBACK_SELECT_WITH_LEGACY_ID, undefined, filters)
  );
  if (placesRes?.error && isMissingColumnSelectionError(placesRes.error)) {
    placesRes = await fetchAllPages(() =>
      selectPlaces(client, "places", PLACES_FALLBACK_SELECT_WITH_INTEL, undefined, filters)
    );
  }
  if (placesRes?.error && isMissingColumnSelectionError(placesRes.error)) {
    placesRes = await fetchAllPages(() =>
      selectPlaces(client, "places", PLACES_FALLBACK_SELECT, undefined, filters)
    );
  }

  const baseRows = normalizeRows(placesRes?.data);
  const basePlaceIds = baseRows.map((row) => row?.id);
  const reviewStatsByPlaceId = await fetchReviewStatsByPlaceId(client, basePlaceIds);
  const normalizedRows = normalizePlaceStats(baseRows, reviewStatsByPlaceId);
  return {
    data: normalizedRows,
    error: placesRes?.error ?? null,
    count: placesRes?.count ?? null,
    source: "places",
  };
}
