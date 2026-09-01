const EARTH_RADIUS_KM = 6371;

export const NEARBY_RADIUS_KM = 50;
export const NEARBY_RESULT_LIMIT = 60;

export function toNearbyCoordinate(value, minimum, maximum) {
  const coordinate = Number(value);
  if (!Number.isFinite(coordinate) || coordinate < minimum || coordinate > maximum) return null;
  return coordinate;
}

export function distanceKmBetween(origin, destination) {
  const lat1 = toNearbyCoordinate(origin?.lat, -90, 90);
  const lng1 = toNearbyCoordinate(origin?.lng, -180, 180);
  const lat2 = toNearbyCoordinate(destination?.lat, -90, 90);
  const lng2 = toNearbyCoordinate(destination?.lng, -180, 180);
  if (lat1 === null || lng1 === null || lat2 === null || lng2 === null) return null;

  const radians = (degrees) => (degrees * Math.PI) / 180;
  const deltaLat = radians(lat2 - lat1);
  const deltaLng = radians(lng2 - lng1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(deltaLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function buildNearbyBounds({ lat, lng }, radiusKm = NEARBY_RADIUS_KM) {
  const latitude = toNearbyCoordinate(lat, -90, 90);
  const longitude = toNearbyCoordinate(lng, -180, 180);
  const radius = Math.min(Math.max(Number(radiusKm) || NEARBY_RADIUS_KM, 1), NEARBY_RADIUS_KM);
  if (latitude === null || longitude === null) return null;

  const latDelta = radius / 111.32;
  const lngScale = Math.max(Math.cos((latitude * Math.PI) / 180), 0.15);
  const lngDelta = radius / (111.32 * lngScale);
  return {
    minLat: Math.max(-90, latitude - latDelta),
    maxLat: Math.min(90, latitude + latDelta),
    minLng: Math.max(-180, longitude - lngDelta),
    maxLng: Math.min(180, longitude + lngDelta),
  };
}

export function isCurrentOrUpcomingEvent(event = {}, today = new Date().toISOString().slice(0, 10)) {
  const endDate = String(event?.end_date || event?.endDate || event?.date || "").slice(0, 10);
  return Boolean(endDate && endDate >= today);
}

export function formatNearbyDistance(distanceKm) {
  const distance = Number(distanceKm);
  if (!Number.isFinite(distance)) return "";
  if (distance < 1) return `${Math.max(50, Math.round((distance * 1000) / 50) * 50)} m`;
  return `${distance < 10 ? distance.toFixed(1) : Math.round(distance)} km`;
}
