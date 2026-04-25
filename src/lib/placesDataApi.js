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
    const { data, error } = await client
      .from("reviews")
      .select("place_id, rating")
      .in("place_id", uniquePlaceIds);
    if (error || !Array.isArray(data)) {
      return new Map();
    }

    return data.reduce((acc, row) => {
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
  const placesRes = await fetchPlacesQueryWithFallback({
    client,
    select: PLACES_FALLBACK_SELECT,
    mergeSeed: false,
  });

  const baseRows = normalizeRows(placesRes?.data);
  const basePlaceIds = baseRows.map((row) => row?.id);
  const reviewStatsByPlaceId = await fetchReviewStatsByPlaceId(client, basePlaceIds);
  const normalizedRows = normalizePlaceStats(baseRows, reviewStatsByPlaceId);
  const mergedRows = await maybeMergeSeedRows(normalizedRows, true);
  const normalizedMergedRows = normalizePlaceStats(mergedRows, reviewStatsByPlaceId);

  return {
    data: normalizedMergedRows,
    error: placesRes?.error ?? null,
    count: placesRes?.count ?? null,
    source: placesRes?.source || "places",
  };
}
