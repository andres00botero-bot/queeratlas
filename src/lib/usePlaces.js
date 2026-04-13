import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { mergeSeedPlaces } from "./seedContent";

export function usePlaces(city) {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  /* ---------------- FETCH PLACES ---------------- */
  const fetchPlaces = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    const [{ data, error }, placesRes] = await Promise.all([
      supabase
        .from("places_with_stats")
        .select("*"),
      supabase
        .from("places")
        .select("id, name, city, link"),
    ]);

    if (error) {
      console.error("Fetch places error:", error);
      setLoadError("Could not load places right now.");
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

    const mergedViewRows = (data || []).map((row) => {
      const byId = placeLinkById.get(String(row.id || ""));
      const byCityName = placeLinkByCityName.get(
        `${String(row.city || "").toLowerCase()}::${String(row.name || "").trim().toLowerCase()}`,
      );
      return {
        ...row,
        link: String(row.link || byId || byCityName || "").trim(),
      };
    });

    setPlaces(mergeSeedPlaces(mergedViewRows));
    setIsLoading(false);
  }, []);

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
    console.log("PLACE PAYLOAD:", place);
    const basePayload = {
      name: place.name,
      type: place.type,
      description: place.description,
      vibe: place.vibe,
      hours: place.hours,
      link: place.link,
      lat: place.lat,
      lng: place.lng,
      city: place.city,
    };
    let { data, error } = await supabase
      .from("places")
      .insert([basePayload])
      .select("*")
      .single();

    const canRetryWithoutLink =
      error &&
      String(error.message || "").toLowerCase().includes("link");

    if (canRetryWithoutLink) {
      const retry = await supabase
        .from("places")
        .insert([
          {
            ...basePayload,
            link: undefined,
          },
        ])
        .select("*")
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("Add place error:", error);
      return null;
    }

    await fetchPlaces();
    return data;
  }, [fetchPlaces]);

  /* ---------------- ADD REVIEW ---------------- */
  const addReview = useCallback(async ({ placeId, rating, comment, safety }) => {
    const { error } = await supabase.from("reviews").insert([
      {
        place_id: placeId,
        rating,
        comment,
        safety,
      },
    ]);

    if (error) {
      console.error("Add review error:", error);
      return { ok: false, error };
    }

    await fetchPlaces();
    return { ok: true };
  }, [fetchPlaces]);

  /* ---------------- FETCH REVIEWS (OPTIONAL) ---------------- */
  const getReviews = useCallback(async (placeId) => {
    if (!placeId || String(placeId).startsWith("seed-place-")) {
      return [];
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("place_id", placeId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get reviews error:", error);
      return [];
    }

    return data;
  }, []);

  return { places, addPlace, addReview, getReviews, isLoading, loadError, reloadPlaces: fetchPlaces };
}
