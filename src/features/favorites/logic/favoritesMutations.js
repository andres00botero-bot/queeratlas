export function removeFavoriteLocalState({
  favorites = [],
  added = [],
  favoriteId = "",
}) {
  const normalized = String(favoriteId || "");
  return {
    favorites: (favorites || []).filter((entry) => String(entry) !== normalized),
    added: (added || []).filter((item) => String(item.id) !== normalized),
  };
}

export function addFavoriteLocalState({
  favorites = [],
  added = [],
  favoriteId = "",
  nowIso = "",
}) {
  const normalized = String(favoriteId || "");
  if (!normalized) {
    return {
      isValid: false,
      alreadySaved: false,
      favorites: favorites || [],
      added: added || [],
    };
  }
  if ((favorites || []).includes(normalized)) {
    return {
      isValid: true,
      alreadySaved: true,
      favorites: favorites || [],
      added: added || [],
    };
  }
  return {
    isValid: true,
    alreadySaved: false,
    favorites: [...(favorites || []), normalized],
    added: [{ id: normalized, date: nowIso || new Date().toISOString() }, ...(added || [])],
  };
}

export function buildQuickCheckinPayload({
  item,
  itemType = "place",
  cityCountryLookup = new Map(),
  normalizeCityKey,
}) {
  if (!item) return null;
  const cityValue = String(item.city || "");
  const countryValue = cityCountryLookup.get(normalizeCityKey(cityValue)) || "";
  return {
    mode: "trip",
    privacy: "private",
    country: countryValue,
    city: cityValue,
    label: String(item.name || item.title || "Unknown stop"),
    address: String(item.location || item.address || ""),
    note: "",
    lat: item.lat,
    lng: item.lng,
    placeId: itemType === "place" ? String(item.id || "") : "",
    eventId: itemType === "event" ? String(item.id || "") : "",
  };
}

export function removeFollowingLocalState({
  followingUserIds = [],
  followingFeedRows = [],
  targetUserId = "",
}) {
  const normalized = String(targetUserId || "");
  return {
    followingUserIds: (followingUserIds || []).filter((id) => String(id) !== normalized),
    followingFeedRows: (followingFeedRows || []).filter(
      (row) => String(row.owner_user_id || "") !== normalized
    ),
  };
}

export function addFollowingUserIdLocalState(followingUserIds = [], targetUserId = "") {
  const normalized = String(targetUserId || "");
  if (!normalized) return followingUserIds || [];
  return [...new Set([...(followingUserIds || []), normalized])];
}

export function removePlanLocalState({
  plans = [],
  expandedPlanId = null,
  planId = "",
}) {
  const normalized = String(planId || "");
  return {
    plans: (plans || []).filter((entry) => String(entry.id) !== normalized),
    expandedPlanId: String(expandedPlanId) === normalized ? null : expandedPlanId,
  };
}

export function normalizeFavoriteIds(favorites = []) {
  return (favorites || []).map((id) => String(id));
}

export function buildAddedEntriesFromFavoriteRows(rows = []) {
  return (rows || []).map((row) => ({
    id: String(row.favorite_id),
    date: row.created_at,
  }));
}

export function buildFavoriteIdsFromRows(rows = []) {
  return (rows || []).map((row) => String(row.favorite_id));
}

export function buildLocalAddedEntries(favorites = [], nowIso = "") {
  return (favorites || []).map((id) => ({
    id: String(id),
    date: nowIso || new Date().toISOString(),
  }));
}

export function computeMissingFavorites({ localFavoriteIds = [], remoteFavoriteIds = [] }) {
  return (localFavoriteIds || []).filter((id) => !(remoteFavoriteIds || []).includes(id));
}

export function mergeFavoriteIds(remoteFavoriteIds = [], localFavoriteIds = []) {
  return [...new Set([...(remoteFavoriteIds || []), ...(localFavoriteIds || [])])];
}
