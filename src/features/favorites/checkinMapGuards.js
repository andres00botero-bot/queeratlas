import { normalizeLooseText } from "./favoritesPageUtils.js";

function hasCoords(item) {
  return Number.isFinite(Number(item?.lat)) && Number.isFinite(Number(item?.lng));
}

function buildLookupById(rows = []) {
  return new Map(rows.map((row) => [String(row.id), row]));
}

function buildLookupByCityName(rows = []) {
  const lookup = new Map();
  rows.forEach((row) => {
    const key = `${normalizeLooseText(row.city)}::${normalizeLooseText(row.name)}`;
    if (!key || key === "::") return;
    const current = lookup.get(key) || [];
    current.push(row);
    lookup.set(key, current);
  });
  return lookup;
}

function resolveByNameMatch(entry, placeByCityName, eventByCityName) {
  const key = `${normalizeLooseText(entry.city)}::${normalizeLooseText(entry.label)}`;
  const candidates = [...(placeByCityName.get(key) || []), ...(eventByCityName.get(key) || [])]
    .filter((candidate) => hasCoords(candidate));

  if (candidates.length === 1) return candidates[0];
  if (candidates.length < 2) return null;

  const addressKey = normalizeLooseText(entry.address);
  if (!addressKey) return null;

  const addressMatches = candidates.filter((candidate) => (
    normalizeLooseText(candidate.location || candidate.address) === addressKey
  ));
  return addressMatches.length === 1 ? addressMatches[0] : null;
}

export function buildCheckinMarkers({ checkins = [], savedPlaces = [], savedEvents = [] }) {
  const placeById = buildLookupById(savedPlaces);
  const eventById = buildLookupById(savedEvents);
  const placeByCityName = buildLookupByCityName(savedPlaces);
  const eventByCityName = buildLookupByCityName(savedEvents);

  return checkins
    .map((entry) => {
      if (Number.isFinite(entry.lat) && Number.isFinite(entry.lng)) {
        return { ...entry, markerLat: Number(entry.lat), markerLng: Number(entry.lng) };
      }

      const placeMatch = entry.placeId ? placeById.get(String(entry.placeId)) : null;
      const eventMatch = entry.eventId ? eventById.get(String(entry.eventId)) : null;
      const explicitMatch = [placeMatch, eventMatch].find((item) => hasCoords(item)) || null;
      const byNameMatch = resolveByNameMatch(entry, placeByCityName, eventByCityName);
      const match = explicitMatch || byNameMatch;

      if (match && hasCoords(match)) {
        return { ...entry, markerLat: Number(match.lat), markerLng: Number(match.lng) };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.checkedInAt || 0) - new Date(a.checkedInAt || 0));
}

export function buildCheckinMarkerById(markers = []) {
  return new Map(markers.map((item) => [String(item.id), item]));
}

export function resolveCheckinFocusCoordinates(entry, markerById) {
  if (!entry?.id) return null;
  const markerEntry = markerById.get(String(entry.id));
  const lat = Number(markerEntry?.markerLat ?? entry.markerLat ?? entry.lat);
  const lng = Number(markerEntry?.markerLng ?? entry.markerLng ?? entry.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}
