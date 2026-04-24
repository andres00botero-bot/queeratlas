import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { mergeSeedPlacesAsync } from "./seedMerge";
import { captureOperationalError } from "./monitoring";
import { logDevError } from "./devLogger";

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

export function usePlaces(city) {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  /* ---------------- FETCH PLACES ---------------- */
  const fetchPlaces = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    let data = null;
    let error = null;
    let placesRes = null;

    try {
      const cityKey = String(city || "").trim();
      let statsQuery = supabase
        .from("places_with_stats")
        .select("*");
      let rawPlacesQuery = supabase
        .from("places")
        .select("id, name, city, link, location");

      if (cityKey) {
        statsQuery = statsQuery.eq("city", cityKey);
        rawPlacesQuery = rawPlacesQuery.eq("city", cityKey);
      }

      const [statsRes, rawPlacesRes] = await Promise.all([statsQuery, rawPlacesQuery]);
      data = statsRes?.data ?? null;
      error = statsRes?.error ?? null;
      placesRes = rawPlacesRes ?? null;
    } catch (networkError) {
      logDevError("Network error while loading places:", networkError);
      captureOperationalError("places_network_fail", toOperationalError(networkError), {
        city: String(city || ""),
      });
      setLoadError("Could not load places right now. Check connection and try again.");
      setIsLoading(false);
      return;
    }

    if (error) {
      logDevError("Fetch places_with_stats error:", formatSupabaseError(error));
      captureOperationalError("places_view_fail", toOperationalError(error), {
        city: String(city || ""),
      });

      const cityKey = String(city || "").trim();
      let fallbackPlacesQuery = supabase
        .from("places")
        .select("id, name, type, city, lat, lng, description, vibe, hours, link, location");
      if (cityKey) {
        fallbackPlacesQuery = fallbackPlacesQuery.eq("city", cityKey);
      }

      const [{ data: fallbackPlaces, error: fallbackPlacesError }, { data: fallbackReviews, error: fallbackReviewsError }] = await Promise.all([
        fallbackPlacesQuery,
        supabase
          .from("reviews")
          .select("place_id, rating"),
      ]);

      if (fallbackPlacesError) {
        logDevError("Fallback places query error:", formatSupabaseError(fallbackPlacesError));
        captureOperationalError("places_fallback_fail", toOperationalError(fallbackPlacesError), {
          city: String(city || ""),
        });
        setLoadError("Could not load places right now.");
        setIsLoading(false);
        return;
      }

      if (fallbackReviewsError) {
        logDevError("Fallback reviews query error:", formatSupabaseError(fallbackReviewsError));
        captureOperationalError("reviews_fallback_fail", toOperationalError(fallbackReviewsError), {
          city: String(city || ""),
        });
      }

      const reviewRows = Array.isArray(fallbackReviews) ? fallbackReviews : [];
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

      const fallbackRows = (Array.isArray(fallbackPlaces) ? fallbackPlaces : []).map((place) => {
        const stat = statsByPlaceId[String(place.id)] || { total: 0, count: 0 };
        const avgRating = stat.count > 0 ? Number((stat.total / stat.count).toFixed(1)) : null;
        return {
          ...place,
          avgRating,
          reviewCount: stat.count,
        };
      });

      const mergedWithSeedFallback = await mergeSeedPlacesAsync(fallbackRows);
      setPlaces(mergedWithSeedFallback);
      setLoadError("Live stats view is unavailable. Showing direct place data.");
      setIsLoading(false);
      return;
    }

    const placeRows = Array.isArray(placesRes?.data) ? placesRes.data : [];
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

    const mergedViewRows = (data || []).map((row) => {
      const byId = placeLinkById.get(String(row.id || ""));
      const byCityName = placeLinkByCityName.get(
        `${String(row.city || "").toLowerCase()}::${String(row.name || "").trim().toLowerCase()}`,
      );
      const locationById = placeLocationById.get(String(row.id || ""));
      const locationByCityName = placeLocationByCityName.get(
        `${String(row.city || "").toLowerCase()}::${String(row.name || "").trim().toLowerCase()}`,
      );
      return {
        ...row,
        hours: String(row.hours || "").trim(),
        location: String(row.location || locationById || locationByCityName || "").trim(),
        link: String(row.link || byId || byCityName || "").trim(),
      };
    });

    const mergedWithSeed = await mergeSeedPlacesAsync(mergedViewRows);
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
    const basePayload = {
      name: place.name,
      type: place.type,
      description: place.description,
      vibe: place.vibe,
      hours: place.hours,
      link: place.link,
      location: String(place.location || place.address || "").trim() || null,
      lat: place.lat,
      lng: place.lng,
      city: place.city,
    };
    const { data, error } = await supabase
      .from("places")
      .insert([basePayload])
      .select("*")
      .single();

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

      const existing = await supabase
        .from("places")
        .select("id")
        .ilike("city", cityName)
        .ilike("name", placeName)
        .limit(1)
        .maybeSingle();

      if (existing?.data?.id) {
        return existing.data.id;
      }

      if (!createIfMissing) return null;

      const insertPayload = {
        name: placeName,
        type: String(place?.type || "bar"),
        description: String(place?.description || "").trim(),
        vibe: String(place?.vibe || "").trim(),
        hours: String(place?.hours || "").trim(),
        link: String(place?.link || "").trim(),
        location: String(place?.location || place?.address || "").trim() || null,
        lat: place?.lat ?? null,
        lng: place?.lng ?? null,
        city: cityName,
      };

      const inserted = await supabase
        .from("places")
        .insert([insertPayload])
        .select("id")
        .single();

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
