export function buildCityGeocodeBounds(center, radiusKm = 60) {
  const lng = Number(center?.[0]);
  const lat = Number(center?.[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const latDelta = radiusKm / 111.32;
  const lngScale = Math.max(Math.cos((lat * Math.PI) / 180), 0.2);
  const lngDelta = radiusKm / (111.32 * lngScale);
  return {
    east: lng + lngDelta,
    north: lat + latDelta,
    south: lat - latDelta,
    west: lng - lngDelta,
  };
}
