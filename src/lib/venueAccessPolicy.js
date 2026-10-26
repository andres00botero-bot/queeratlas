const RESTRICTED_VENUE_CITY_KEYS = new Set([
  "moscow",
  "saint_petersburg",
  "cairo",
  "beirut",
  "marrakech",
  "kuala_lumpur",
  "almaty",
  "istanbul",
  "beijing",
  "chengdu",
  "shanghai",
  "jakarta",
  "bali",
  "colombo",
  "yerevan",
  "guatemala_city",
  "tegucigalpa",
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
