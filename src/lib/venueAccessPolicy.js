const RESTRICTED_VENUE_CITY_KEYS = new Set([
  "moscow",
  "saint_petersburg",
  "cairo",
  "marrakech",
  "kuala_lumpur",
  "almaty",
  "istanbul",
  "beijing",
  "chengdu",
  "shanghai",
]);

const HIGH_SURVEILLANCE_VENUE_CITY_KEYS = new Set([
  "beijing",
  "chengdu",
  "shanghai",
]);

export function isVenueAccessRestricted(cityKey) {
  return RESTRICTED_VENUE_CITY_KEYS.has(String(cityKey || "").trim().toLowerCase());
}

export function hasHighSurveillanceVenueRisk(cityKey) {
  return HIGH_SURVEILLANCE_VENUE_CITY_KEYS.has(String(cityKey || "").trim().toLowerCase());
}
