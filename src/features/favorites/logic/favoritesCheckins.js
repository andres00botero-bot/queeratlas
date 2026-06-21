function normalizeLookupValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\s+/g, " ");
}

function normalizeCheckinPrivacy(value) {
  const normalized = String(value || "private");
  return normalized === "friends" ? "private" : normalized;
}

export function resolveDirectPlaceDbId(placeId) {
  const rawPlaceId = String(placeId || "").trim();
  if (rawPlaceId && !rawPlaceId.startsWith("seed-place-") && /^\d+$/.test(rawPlaceId)) {
    return Number(rawPlaceId);
  }
  return null;
}

export function resolvePlaceDbIdFromLookupRows({
  rows = [],
  city = "",
}) {
  const cityValue = String(city || "").trim();
  if (!cityValue) return null;
  const matched = (rows || []).find(
    (row) => normalizeLookupValue(row?.city) === normalizeLookupValue(cityValue)
  );
  const numericId = Number(matched?.id);
  return Number.isFinite(numericId) ? numericId : null;
}

export function buildNextCheckin({
  payload = {},
  resolvedCoords = null,
  isEditing = false,
  editingId = "",
  nowIso = "",
}) {
  const baseNow = nowIso || new Date().toISOString();
  const countryValue = String(payload?.country || "").trim();
  const cityValue = String(payload?.city || "").trim();
  const labelValue = String(payload?.label || "").trim();
  const addressValue = String(payload?.address || "").trim();
  const modeValue = String(payload?.mode || "trip");
  const privacyValue = normalizeCheckinPrivacy(payload?.privacy);

  return {
    id: isEditing ? editingId : `local-${Date.now()}`,
    mode: modeValue,
    privacy: privacyValue,
    country: countryValue,
    city: cityValue,
    label: labelValue,
    address: addressValue,
    note: String(payload?.note || "").trim(),
    placeId: String(payload?.placeId || ""),
    eventId: String(payload?.eventId || ""),
    lat: Number.isFinite(Number(resolvedCoords?.lat)) ? Number(resolvedCoords.lat) : null,
    lng: Number.isFinite(Number(resolvedCoords?.lng)) ? Number(resolvedCoords.lng) : null,
    checkedInAt: String(payload?.checkedInAt || baseNow),
    createdAt: String(payload?.createdAt || baseNow),
  };
}

export function mergeSavedCheckinIntoList({
  current = [],
  savedRow,
  isEditing = false,
  limit = 300,
}) {
  const rows = current || [];
  if (isEditing) {
    return rows.map((entry) => (String(entry.id) === String(savedRow.id) ? savedRow : entry));
  }
  return [savedRow, ...rows].slice(0, limit);
}

export function buildEditCheckinFormPatch({
  entry,
  currentCountry = "",
  cityCountryLookup = new Map(),
  normalizeCityKey,
  formatCityLabel,
}) {
  const cityValue = String(entry?.city || "");
  const countryFallback = cityCountryLookup.get(normalizeCityKey(cityValue)) || currentCountry || "";
  return {
    mode: String(entry?.mode || "trip"),
    privacy: normalizeCheckinPrivacy(entry?.privacy),
    country: String(entry?.country || countryFallback),
    city: formatCityLabel(String(cityValue || "")),
    sourceType: "manual",
    sourceId: "",
    label: String(entry?.label || ""),
    address: String(entry?.address || ""),
    note: String(entry?.note || ""),
  };
}
