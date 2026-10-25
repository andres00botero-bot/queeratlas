const RESTRICTED_VENUE_CITY_KEYS = new Set([
  "moscow",
  "saint_petersburg",
  "cairo",
  "marrakech",
  "kuala_lumpur",
  "almaty",
]);

export function isVenueAccessRestricted(cityKey) {
  return RESTRICTED_VENUE_CITY_KEYS.has(String(cityKey || "").trim().toLowerCase());
}
