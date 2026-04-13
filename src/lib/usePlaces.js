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

    const { data, error } = await supabase
      .from("places_with_stats")
      .select("*");

    if (error) {
      console.error("Fetch places error:", error);
      setLoadError("Could not load places right now.");
      setIsLoading(false);
      return;
    }

    setPlaces(mergeSeedPlaces(data || []));
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

    const { data, error } = await supabase
      .from("places")
      .insert([
        {
          name: place.name,
          type: place.type,
          description: place.description,
          vibe: place.vibe,
          hours: place.hours,
          lat: place.lat,
          lng: place.lng,
          city: place.city,
        },
      ])
      .select("*")
      .single();

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
