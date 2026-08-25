import { cityCoreConfig } from "@/lib/cityCore";
import { buildCityGeocodeBounds } from "@/lib/entityGeocoding";

const runtimeCityConfig = new Map();

export function registerRuntimeCityGeocodingContext(key, entry) {
  const normalizedKey = String(key || "").trim().toLowerCase();
  if (!normalizedKey || !entry || !Array.isArray(entry.center)) return;
  runtimeCityConfig.set(normalizedKey, entry);
  const titleKey = String(entry.title || "").replace(/^Queer\s+/i, "").trim().toLowerCase();
  if (titleKey) runtimeCityConfig.set(titleKey, entry);
}

export function resolveCityGeocodingContext(value) {
  const input = String(value || "").trim();
  const key = input.toLowerCase();
  const entry = cityCoreConfig[key] || runtimeCityConfig.get(key) || Object.values(cityCoreConfig).find((item) => {
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

export function normalizeConfirmedCoordinates(location) {
  if (!location || typeof location !== "object") return null;
  if (location.lat === null || location.lat === undefined || location.lat === "") return null;
  if (location.lng === null || location.lng === undefined || location.lng === "") return null;
  const lat = Number(location.lat);
  const lng = Number(location.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}
