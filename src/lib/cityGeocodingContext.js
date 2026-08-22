import { cityCoreConfig } from "@/lib/cityCore";
import { buildCityGeocodeBounds } from "@/lib/entityGeocoding";

export function resolveCityGeocodingContext(value) {
  const input = String(value || "").trim();
  const key = input.toLowerCase();
  const entry = cityCoreConfig[key] || Object.values(cityCoreConfig).find((item) => {
    const title = String(item?.title || "").replace(/^Queer\s+/i, "").trim();
    return title.toLowerCase() === key;
  });
  const center = Array.isArray(entry?.center) ? entry.center.map(Number) : null;

  return {
    city: String(entry?.title || input).replace(/^Queer\s+/i, "").trim(),
    country: String(entry?.country || "").trim(),
    center,
    bounds: buildCityGeocodeBounds(center, 80),
  };
}

export function isCoordinateInsideBounds({ lat, lng }, bounds) {
  if (!bounds) return false;
  const latitude = Number(lat);
  const longitude = Number(lng);
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    longitude >= bounds.west &&
    longitude <= bounds.east &&
    latitude >= bounds.south &&
    latitude <= bounds.north
  );
}
