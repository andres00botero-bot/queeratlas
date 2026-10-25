const RESTRICTED_VENUE_CITY_KEYS = new Set([
  "moscow",
  "saint_petersburg",
]);

export function isVenueAccessRestricted(cityKey) {
  return RESTRICTED_VENUE_CITY_KEYS.has(String(cityKey || "").trim().toLowerCase());
}
