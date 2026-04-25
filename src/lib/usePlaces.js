import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { mergeSeedPlacesAsync } from "./seedMerge";
import { captureOperationalError } from "./monitoring";
import { logDevError } from "./devLogger";
import { fetchPlacesQueryWithFallback } from "./placesDataApi";
import {
  buildVibeDualWriteFields,
  inferVibeTagsFromLegacyVibe,
  isMissingVibeTagsColumnError,
  normalizeVibeTags,
} from "./vibeTaxonomy";

const PLACE_SELECT_FIELDS =
  "id, name, type, city, lat, lng, description, vibe, vibe_tags, hours, link, location";
const PLACE_SELECT_FIELDS_LEGACY =
  "id, name, type, city, lat, lng, description, vibe, hours, link, location";

async function fetchPlacesRows(client) {
  let response = await client.from("places").select(PLACE_SELECT_FIELDS);
  if (response?.error && isMissingVibeTagsColumnError(response.error)) {
    response = await client.from("places").select(PLACE_SELECT_FIELDS_LEGACY);
  }
  return response;
}

function formatSupabaseError(error) {
  if (!error) return "Unknown error";
  const details = {
    message: error.message || "",
    code: error.code || "",
    details: error.details || "",
    hint: error.hint || "",
  };
  return JSON.stringify(details);
}

function toOperationalError(error) {
  if (error instanceof Error) return error;
  if (!error) return new Error("Unknown error");
  return new Error(formatSupabaseError(error));
}

function normalizeLookupToken(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toFiniteNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function resolveBestPlaceCandidate(candidates = [], place = {}) {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;

  const targetCity = normalizeLookupToken(place?.city || "");
  const targetName = normalizeLookupToken(place?.name || "");
  const targetType = normalizeLookupToken(place?.type || "");
  const targetLat = toFiniteNumber(place?.lat);
  const targetLng = toFiniteNumber(place?.lng);

  if (!targetCity || !targetName) return null;

  let best = null;
  for (const candidate of candidates) {
    const candidateCity = normalizeLookupToken(candidate?.city || "");
    const candidateName = normalizeLookupToken(candidate?.name || "");
    if (candidateCity !== targetCity || candidateName !== targetName) continue;

    let score = 2;
    const candidateType = normalizeLookupToken(candidate?.type || "");
    if (targetType && candidateType === targetType) score += 2;

    const candidateLat = toFiniteNumber(candidate?.lat);
    const candidateLng = toFiniteNumber(candidate?.lng);
    if (
      targetLat !== null &&
      targetLng !== null &&
      candidateLat !== null &&
      candidateLng !== null &&
      Math.abs(candidateLat - targetLat) < 0.0002 &&
      Math.abs(candidateLng - targetLng) < 0.0002
    ) {
      score += 1;
    }

    if (
      !best ||
      score > best.score ||
      (score === best.score && String(candidate?.id || "").localeCompare(String(best.id || "")) < 0)
    ) {
      best = { id: candidate?.id, score };
    }
  }

  return best?.id || null;
}

export function usePlaces(city) {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  /* ---------------- FETCH PLACES ---------------- */
  const fetchPlaces = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    let placeRows = [];
    let reviewRows = [];
    let statsRows = null;
    let statsError = null;

    try {
      const [{ data: placesData, error: placesError }, { data: reviewsData, error: reviewsError }] = await Promise.all([
        fetchPlacesRows(supabase),
        supabase
          .from("reviews")
          .select("place_id, rating"),
      ]);

      if (placesError) {
        logDevError("Places query error:", formatSupabaseError(placesError));
        captureOperationalError("places_query_fail", toOperationalError(placesError), {
          city: String(city || ""),
        });
        setLoadError("Could not load places right now.");
        setIsLoading(false);
        return;
      }

      if (reviewsError) {
        logDevError("Reviews query error:", formatSupabaseError(reviewsError));
        captureOperationalError("reviews_query_fail", toOperationalError(reviewsError), {
          city: String(city || ""),
        });
      }

      placeRows = Array.isArray(placesData) ? placesData : [];
      reviewRows = Array.isArray(reviewsData) ? reviewsData : [];
    } catch (networkError) {
      logDevError("Network error while loading places:", networkError);
      captureOperationalError("places_network_fail", toOperationalError(networkError), {
        city: String(city || ""),
      });
      setLoadError("Could not load places right now. Check connection and try again.");
      setIsLoading(false);
      return;
    }

    {
      const statsRes = await fetchPlacesQueryWithFallback({
        select: "*",
      });
      statsRows =
        statsRes?.source === "places_with_stats" && Array.isArray(statsRes?.data)
          ? statsRes.data
          : null;
      statsError = statsRes?.error ?? null;

      if (statsError) {
        logDevError("Fetch places_with_stats error:", formatSupabaseError(statsError));
        captureOperationalError("places_view_fail", toOperationalError(statsError), {
          city: String(city || ""),
        });
        setLoadError("Live stats view is unavailable. Showing direct place data.");
      }
    }

    const placeLinkById = new Map(
      placeRows
        .filter((row) => row?.id && row?.link)
        .map((row) => [String(row.id), String(row.link)]),
    );
    const placeLinkByCityName = new Map(
      placeRows
        .filter((row) => row?.name && row?.city && row?.link)
        .map((row) => [
          `${String(row.city).toLowerCase()}::${String(row.name).trim().toLowerCase()}`,
          String(row.link),
        ]),
    );
    const placeLocationById = new Map(
      placeRows
        .filter((row) => row?.id && row?.location)
        .map((row) => [String(row.id), String(row.location)]),
    );
    const placeLocationByCityName = new Map(
      placeRows
        .filter((row) => row?.name && row?.city && row?.location)
        .map((row) => [
          `${String(row.city).toLowerCase()}::${String(row.name).trim().toLowerCase()}`,
          String(row.location),
        ]),
    );
    const placeVibeTagsById = new Map(
      placeRows
        .filter((row) => row?.id)
        .map((row) => [
          String(row.id),
          normalizeVibeTags(
            Array.isArray(row?.vibe_tags) && row.vibe_tags.length > 0
              ? row.vibe_tags
              : inferVibeTagsFromLegacyVibe(String(row?.vibe || "")),
            { max: 3 }
          ),
        ]),
    );
    const placeVibeTagsByCityName = new Map(
      placeRows
        .filter((row) => row?.name && row?.city)
        .map((row) => [
          `${String(row.city).toLowerCase()}::${String(row.name).trim().toLowerCase()}`,
          normalizeVibeTags(
            Array.isArray(row?.vibe_tags) && row.vibe_tags.length > 0
              ? row.vibe_tags
              : inferVibeTagsFromLegacyVibe(String(row?.vibe || "")),
            { max: 3 }
          ),
        ]),
    );

    const statsByPlaceId = reviewRows.reduce((acc, row) => {
      const placeId = String(row?.place_id || "");
      if (!placeId) return acc;
      if (!acc[placeId]) {
        acc[placeId] = { total: 0, count: 0 };
      }
      const numericRating = Number(row?.rating);
      if (Number.isFinite(numericRating) && numericRating > 0) {
        acc[placeId].total += numericRating;
        acc[placeId].count += 1;
      }
      return acc;
    }, {});

    const fallbackRows = placeRows.map((place) => {
      const stat = statsByPlaceId[String(place.id)] || { total: 0, count: 0 };
      const avgRating = stat.count > 0 ? Number((stat.total / stat.count).toFixed(1)) : null;
      return {
        ...place,
        avgRating,
        reviewCount: stat.count,
      };
    });

    const sourceRows = Array.isArray(statsRows) && statsRows.length > 0 ? statsRows : fallbackRows;
    const mergedRows = sourceRows.map((row) => {
      const byId = placeLinkById.get(String(row.id || ""));
      const byCityName = placeLinkByCityName.get(
        `${String(row.city || "").toLowerCase()}::${String(row.name || "").trim().toLowerCase()}`,
      );
      const locationById = placeLocationById.get(String(row.id || ""));
      const locationByCityName = placeLocationByCityName.get(
        `${String(row.city || "").toLowerCase()}::${String(row.name || "").trim().toLowerCase()}`,
      );
      const vibeTagsById = placeVibeTagsById.get(String(row.id || ""));
      const vibeTagsByCityName = placeVibeTagsByCityName.get(
        `${String(row.city || "").toLowerCase()}::${String(row.name || "").trim().toLowerCase()}`,
      );
      return {
        ...row,
        hours: String(row.hours || "").trim(),
        location: String(row.location || locationById || locationByCityName || "").trim(),
        link: String(row.link || byId || byCityName || "").trim(),
        vibe_tags: normalizeVibeTags(
          Array.isArray(row?.vibe_tags) && row.vibe_tags.length > 0
            ? row.vibe_tags
            : vibeTagsById || vibeTagsByCityName || inferVibeTagsFromLegacyVibe(String(row?.vibe || "")),
          { max: 3 }
        ),
      };
    });

    const mergedWithSeed = await mergeSeedPlacesAsync(mergedRows);
    setPlaces(mergedWithSeed);
    setIsLoading(false);
  }, [city]);

  /* ---------------- INIT + REALTIME ---------------- */
  useEffect(() => {
    queueMicrotask(() => {
      fetchPlaces();
    });

    const channel = supabase
      .channel("realtime-places")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "places" },
        () => fetchPlaces()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reviews" },
        () => fetchPlaces()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPlaces]);

  /* ---------------- ADD PLACE ---------------- */
  const addPlace = useCallback(async (place) => {
    const vibeFields = buildVibeDualWriteFields({
      vibe: place.vibe,
      vibeTags: place.vibe_tags,
    });
    const basePayload = {
      name: place.name,
      type: place.type,
      description: place.description,
      ...vibeFields,
      hours: place.hours,
      link: place.link,
      location: String(place.location || place.address || "").trim() || null,
      lat: place.lat,
      lng: place.lng,
      city: place.city,
    };
    let insertResult = await supabase
      .from("places")
      .insert([basePayload])
      .select("*")
      .single();

    if (insertResult.error && isMissingVibeTagsColumnError(insertResult.error)) {
      const legacyPayload = { ...basePayload };
      delete legacyPayload.vibe_tags;
      insertResult = await supabase
        .from("places")
        .insert([legacyPayload])
        .select("*")
        .single();
    }

    const { data, error } = insertResult;

    if (error) {
      logDevError("Add place error:", error);
      captureOperationalError("add_place_fail", toOperationalError(error), {
        city: String(place?.city || ""),
        place: String(place?.name || ""),
      });
      return null;
    }

    await fetchPlaces();
    return data;
  }, [fetchPlaces]);

  /* ---------------- ADD REVIEW ---------------- */
  const resolvePlaceIdForReview = useCallback(
    async ({ placeId, place, createIfMissing = true }) => {
      if (!placeId) return null;
      const placeIdStr = String(placeId);

      if (!placeIdStr.startsWith("seed-place-")) {
        return placeId;
      }

      const cityName = String(place?.city || "").trim();
      const placeName = String(place?.name || "").trim();
      if (!cityName || !placeName) return null;

      const exactExisting = await supabase
        .from("places")
        .select("id, name, city, type, lat, lng")
        .eq("city", cityName)
        .eq("name", placeName)
        .limit(1)
        .maybeSingle();

      if (exactExisting?.data?.id) {
        return exactExisting.data.id;
      }

      const broadCandidates = await supabase
        .from("places")
        .select("id, name, city, type, lat, lng");

      if (!broadCandidates?.error) {
        const candidateId = resolveBestPlaceCandidate(
          Array.isArray(broadCandidates?.data) ? broadCandidates.data : [],
          place
        );
        if (candidateId) return candidateId;
      }

      if (!createIfMissing) return null;

      const insertPayload = {
        name: placeName,
        type: String(place?.type || "bar"),
        description: String(place?.description || "").trim(),
        ...buildVibeDualWriteFields({
          vibe: String(place?.vibe || "").trim(),
          vibeTags: place?.vibe_tags,
        }),
        hours: String(place?.hours || "").trim(),
        link: String(place?.link || "").trim(),
        location: String(place?.location || place?.address || "").trim() || null,
        lat: place?.lat ?? null,
        lng: place?.lng ?? null,
        city: cityName,
      };

      let inserted = await supabase
        .from("places")
        .insert([insertPayload])
        .select("id")
        .single();

      if (inserted?.error && isMissingVibeTagsColumnError(inserted.error)) {
        const legacyPayload = { ...insertPayload };
        delete legacyPayload.vibe_tags;
        inserted = await supabase
          .from("places")
          .insert([legacyPayload])
          .select("id")
          .single();
      }

      if (inserted?.data?.id) {
        return inserted.data.id;
      }

      return null;
    },
    []
  );

  const addReview = useCallback(async ({ placeId, place, rating, comment, safety }) => {
    const resolvedPlaceId = await resolvePlaceIdForReview({
      placeId,
      place,
      createIfMissing: true,
    });
    if (!resolvedPlaceId) {
      captureOperationalError("save_review_fail", new Error("Could not resolve place for review."), {
        placeId: String(placeId || ""),
        city: String(place?.city || ""),
      });
      return { ok: false, error: { message: "Could not resolve place for review." } };
    }

    const { error } = await supabase.from("reviews").insert([
      {
        place_id: resolvedPlaceId,
        rating,
        comment,
        safety,
      },
    ]);

    if (error) {
      logDevError("Add review error:", error);
      captureOperationalError("save_review_fail", error, {
        placeId: String(resolvedPlaceId || ""),
        city: String(place?.city || ""),
      });
      return { ok: false, error };
    }

    await fetchPlaces();
    return { ok: true };
  }, [fetchPlaces, resolvePlaceIdForReview]);

  /* ---------------- FETCH REVIEWS (OPTIONAL) ---------------- */
  const getReviews = useCallback(async (placeId, place = null) => {
    if (!placeId) {
      return [];
    }

    let resolvedPlaceId = placeId;
    if (String(placeId).startsWith("seed-place-")) {
      resolvedPlaceId = await resolvePlaceIdForReview({
        placeId,
        place,
        createIfMissing: false,
      });
      if (!resolvedPlaceId) return [];
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("place_id", resolvedPlaceId)
      .order("created_at", { ascending: false });

    if (error) {
      logDevError("Get reviews error:", error);
      captureOperationalError("get_reviews_fail", toOperationalError(error), {
        placeId: String(resolvedPlaceId || ""),
        city: String(place?.city || ""),
      });
      return [];
    }

    const rows = Array.isArray(data) ? data : [];
    const userIds = [...new Set(rows.map((row) => row?.created_by).filter(Boolean))];

    if (userIds.length === 0) {
      return rows.map((row) => ({
        ...row,
        authorName: "Member",
        memberTitle: "",
      }));
    }

    const [profilesRes, leaderboardRes] = await Promise.all([
      supabase
        .from("member_profiles")
        .select("user_id, display_name")
        .in("user_id", userIds),
      supabase
        .from("qa_member_leaderboard")
        .select("user_id, title")
        .in("user_id", userIds),
    ]);

    const displayNameByUserId = new Map(
      (profilesRes?.data || [])
        .filter((row) => row?.user_id)
        .map((row) => [String(row.user_id), String(row.display_name || "").trim()])
    );

    const titleByUserId = new Map(
      (leaderboardRes?.data || [])
        .filter((row) => row?.user_id)
        .map((row) => [String(row.user_id), String(row.title || "").trim()])
    );

    return rows.map((row) => {
      const userId = String(row?.created_by || "");
      return {
        ...row,
        authorName: displayNameByUserId.get(userId) || "Member",
        memberTitle: titleByUserId.get(userId) || "",
      };
    });
  }, [resolvePlaceIdForReview]);

  return { places, addPlace, addReview, getReviews, isLoading, loadError, reloadPlaces: fetchPlaces };
}
