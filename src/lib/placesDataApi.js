import { supabase } from "./supabase";
import { mergeSeedPlacesAsync } from "./seedMerge";
import { shouldFallbackFromPlacesWithStats } from "./supabaseErrorGuards";

const PLACES_FALLBACK_SELECT =
  "id, name, type, city, lat, lng, description, vibe, hours, link, location";

export async function fetchPlacesForAtlas({ client = supabase } = {}) {
  const statsRes = await client.from("places_with_stats").select("*");
  const statsError = statsRes?.error ?? null;

  if (!statsError) {
    return {
      data: await mergeSeedPlacesAsync(statsRes?.data || []),
      error: null,
      source: "places_with_stats",
    };
  }

  if (!shouldFallbackFromPlacesWithStats(statsError)) {
    return {
      data: await mergeSeedPlacesAsync(statsRes?.data || []),
      error: statsError,
      source: "places_with_stats",
    };
  }

  const placesRes = await client.from("places").select(PLACES_FALLBACK_SELECT);
  const placesError = placesRes?.error ?? null;

  return {
    data: await mergeSeedPlacesAsync(placesRes?.data || []),
    error: placesError,
    source: "places",
  };
}
