import "server-only";

import { unstable_cache } from "next/cache";
import { fetchPlacesForAtlas } from "@/lib/placesDataApi";
import { isPublishedEntity } from "@/lib/publicInventory";
import { normalizeCitySlug } from "@/lib/seo/entitySlug";
import { listCityRegistry } from "@/lib/server/cityRegistry";

export const ATLAS_METRICS_CACHE_TAG = "atlas-metrics";

async function loadAtlasMetrics() {
  const [cities, placesResult] = await Promise.all([listCityRegistry(), fetchPlacesForAtlas()]);
  const cityKeys = new Set(cities.map((city) => normalizeCitySlug(city?.key)).filter(Boolean));
  const places = (placesResult?.data || []).filter((place) =>
    isPublishedEntity(place) && cityKeys.has(normalizeCitySlug(place?.city)),
  );

  return {
    cities,
    metrics: {
      countries: new Set(cities.map((city) => String(city?.country || "").trim()).filter(Boolean)).size,
      cities: cities.length,
      places: places.length,
      generatedAt: new Date().toISOString(),
    },
  };
}

const getCachedAtlasMetrics = unstable_cache(
  loadAtlasMetrics,
  ["atlas-metrics-v2"],
  { revalidate: 300, tags: [ATLAS_METRICS_CACHE_TAG] },
);

export async function getAtlasInventory() {
  return getCachedAtlasMetrics();
}
