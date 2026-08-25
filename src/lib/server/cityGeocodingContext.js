import "server-only";

import { buildCityGeocodeBounds } from "@/lib/entityGeocoding";
import { resolveCityGeocodingContext } from "@/lib/cityGeocodingContext";
import { getCityRegistryEntry } from "@/lib/server/cityRegistry";

export async function resolveServerCityGeocodingContext(value) {
  const fallback = resolveCityGeocodingContext(value);
  const registryEntry = await getCityRegistryEntry(value);
  const center = Array.isArray(registryEntry?.center)
    ? registryEntry.center.map(Number)
    : null;

  if (!center || center.length !== 2 || !center.every(Number.isFinite)) {
    return fallback;
  }

  return {
    city: String(registryEntry?.title || registryEntry?.name || fallback.city)
      .replace(/^Queer\s+/i, "")
      .trim(),
    country: String(registryEntry?.country || "").trim(),
    center,
    bounds: buildCityGeocodeBounds(center, 80),
  };
}
