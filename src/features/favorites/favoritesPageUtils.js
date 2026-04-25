import { formatDateShort, formatDateTime } from "../../lib/dateDisplay.js";

export function timeAgo(value) {
  if (!value) return "Recently";
  const diffHours = Math.round((new Date() - new Date(value)) / 3600000);
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

export function formatDate(value) {
  return formatDateShort(value);
}

export function formatSavedTime(value) {
  return formatDateTime(value, { fallback: "Not saved yet" });
}

export function formatCheckinTime(value) {
  return formatDateTime(value, { fallback: "Unknown time" });
}

export function isWithinDays(value, days) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = Date.now();
  const diff = date.getTime() - now;
  const windowMs = days * 24 * 60 * 60 * 1000;
  return diff >= 0 && diff <= windowMs;
}

export function formatWeekRange(reference = new Date()) {
  const current = new Date(reference);
  const day = current.getDay();
  const diffToMonday = (day + 6) % 7;
  const start = new Date(current);
  start.setDate(current.getDate() - diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return `${start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${end.toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short" }
  )}`;
}

export function stopQuickContext(stop) {
  const explicitReason = String(stop?.reason || "").trim();
  if (explicitReason) return explicitReason;

  const slot = String(stop?.slotLabel || "").trim();
  const kind = String(stop?.type || stop?.itemType || "").trim().toLowerCase();
  const kindLabel = kind ? kind.replaceAll("_", " ") : "spot";

  if (slot) return `${slot} energy in the flow.`;
  return `Selected as a ${kindLabel} stop for this plan arc.`;
}

export function normalizeCityKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\s+/g, " ");
}

export function formatCityLabel(value) {
  const compact = String(value || "")
    .trim()
    .replaceAll("_", " ")
    .replaceAll("-", " ");
  if (!compact) return "";
  return compact.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function isMissingTableError(error) {
  if (!error) return false;
  const code = String(error.code || "");
  const message = String(error.message || "").toLowerCase();
  return code === "42P01" || code === "PGRST205" || message.includes("does not exist");
}

export const PLAN_STORAGE_KEY = "qa_trip_plans";
export const FAVORITES_STORAGE_KEY = "qa_favorites";
export const ADDED_STORAGE_KEY = "qa_added";
export const CHECKINS_STORAGE_KEY = "qa_member_checkins";
export const CHECKIN_VIBE_COOLDOWN_MS = 30 * 1000;
export const INITIAL_NOW_TS = Date.now();

export function mapPlanRow(row) {
  return {
    id: row.client_id || String(row.id),
    title: row.title || "",
    city: row.city || "",
    date: row.date || null,
    placeIds: Array.isArray(row.place_ids) ? row.place_ids : [],
    eventIds: Array.isArray(row.event_ids) ? row.event_ids : [],
    stops: Array.isArray(row.stops) ? row.stops : [],
    note: row.note || "",
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapCheckinRow(row) {
  return {
    id: String(row.id || `${row.user_id || "local"}-${row.checked_in_at || row.created_at || Date.now()}`),
    mode: String(row.mode || "trip"),
    privacy: String(row.privacy || "private"),
    country: String(row.country || "").trim(),
    city: String(row.city || "").trim(),
    label: String(row.label || "").trim(),
    address: String(row.address || "").trim(),
    note: String(row.note || "").trim(),
    placeId: row.place_id ? String(row.place_id) : "",
    eventId: row.event_id ? String(row.event_id) : "",
    lat: Number.isFinite(Number(row.lat)) ? Number(row.lat) : null,
    lng: Number.isFinite(Number(row.lng)) ? Number(row.lng) : null,
    checkedInAt: row.checked_in_at || row.created_at || new Date().toISOString(),
    createdAt: row.created_at || row.checked_in_at || new Date().toISOString(),
  };
}

export function isPresenceActiveNow(presence) {
  if (!presence?.lastSeenAt) return false;
  return new Date(presence.lastSeenAt).getTime() >= Date.now() - 5 * 60 * 1000;
}

export function normalizeLooseText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\s+/g, " ");
}

export async function geocodeCheckinFromCityAndLabel({ city, country, label, address, token }) {
  const cityValue = String(city || "").trim();
  const countryValue = String(country || "").trim();
  const labelValue = String(label || "").trim();
  const addressValue = String(address || "").trim();
  if (!cityValue || !labelValue || !token) return null;

  const query = [labelValue, addressValue, cityValue, countryValue].filter(Boolean).join(", ");
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
    `?limit=1&types=poi,address,neighborhood,locality,place&language=en&access_token=${encodeURIComponent(token)}`;

  const response = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
  if (!response.ok) return null;
  const data = await response.json();
  const first = Array.isArray(data?.features) ? data.features[0] : null;
  const center = Array.isArray(first?.center) ? first.center : null;
  const lng = Number(center?.[0]);
  const lat = Number(center?.[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}
