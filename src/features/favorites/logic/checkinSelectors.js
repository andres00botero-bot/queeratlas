export function filterRecentCheckins(recentCheckins = [], checkinViewFilter = "all") {
  const base = [...(recentCheckins || [])];
  if (checkinViewFilter === "places") {
    return base.filter((item) => Boolean(String(item.placeId || "").trim()));
  }
  if (checkinViewFilter === "events") {
    return base.filter((item) => Boolean(String(item.eventId || "").trim()));
  }
  if (checkinViewFilter === "manual") {
    return base.filter(
      (item) => !String(item.placeId || "").trim() && !String(item.eventId || "").trim()
    );
  }
  return base;
}

export function sortRecentFollowingCheckins(followingCheckins = []) {
  return [...(followingCheckins || [])]
    .sort((a, b) => new Date(b.checkedInAt || 0) - new Date(a.checkedInAt || 0))
    .slice(0, 12);
}

export function getCheckinCities(checkins = []) {
  return [...new Set((checkins || []).map((item) => String(item.city || "").trim()).filter(Boolean))];
}

export function getSelectedCityPlaces({ places = [], selectedCheckinCityKey = "", normalizeCityKey }) {
  return (places || [])
    .filter((place) => normalizeCityKey(place.city) === selectedCheckinCityKey)
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
}

export function getSelectedCityEvents({ events = [], selectedCheckinCityKey = "", normalizeCityKey }) {
  return (events || [])
    .filter((event) => normalizeCityKey(event.city) === selectedCheckinCityKey)
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
}

export function buildFollowingCheckinMarkers(recentFollowingCheckins = []) {
  return (recentFollowingCheckins || [])
    .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng))
    .map((item) => ({ ...item, markerLat: Number(item.lat), markerLng: Number(item.lng) }))
    .slice(0, 18);
}

export function buildInteractiveCheckinPoints({
  checkinMarkers = [],
  followingCheckinMarkers = [],
}) {
  const mine = (checkinMarkers || []).map((item) => ({
    ...item,
    markerId: `mine-${String(item.id)}`,
    markerKind: "mine",
  }));
  const friends = (followingCheckinMarkers || []).map((item) => ({
    ...item,
    markerId: `friend-${String(item.id)}`,
    markerKind: "friend",
  }));
  return [...mine, ...friends];
}

export function getSelectedCheckin(checkinMarkers = [], selectedCheckinId = "") {
  if (!selectedCheckinId) return null;
  return (checkinMarkers || []).find((item) => String(item.id) === String(selectedCheckinId)) || null;
}

export function resolveCheckinMapCenter({
  checkinMarkers = [],
  followingCheckinMarkers = [],
  savedPlaces = [],
  savedEvents = [],
}) {
  const centerSource =
    checkinMarkers[0] ||
    followingCheckinMarkers[0] ||
    (savedPlaces || []).find((item) => Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lng))) ||
    (savedEvents || []).find((item) => Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lng))) ||
    null;

  if (!centerSource) return null;
  const centerLng = Number(centerSource.markerLng ?? centerSource.lng);
  const centerLat = Number(centerSource.markerLat ?? centerSource.lat);
  if (!Number.isFinite(centerLat) || !Number.isFinite(centerLng)) return null;
  return { lat: centerLat, lng: centerLng };
}

export function buildStaticMapUrl({
  checkinMapCenter = null,
  checkinMarkers = [],
  followingCheckinMarkers = [],
  token = "",
}) {
  if (!token) return "";
  const myMarkers = (checkinMarkers || [])
    .map((item) => `pin-s+f472b6(${item.markerLng},${item.markerLat})`)
    .join(",");
  const friendMarkers = (followingCheckinMarkers || [])
    .map((item) => `pin-s+22d3ee(${item.markerLng},${item.markerLat})`)
    .join(",");
  const markerString = [myMarkers, friendMarkers].filter(Boolean).join(",");
  if (!checkinMapCenter) return "";
  const centerLng = Number(checkinMapCenter.lng);
  const centerLat = Number(checkinMapCenter.lat);
  const zoom = 11;
  if (!markerString) {
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${centerLng},${centerLat},${zoom}/1200x620?padding=36&access_token=${token}`;
  }
  const encoded = markerString.replaceAll("|", "%7C");
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${encoded}/${centerLng},${centerLat},${zoom}/1200x620?padding=36&access_token=${token}`;
}

export function buildCheckinMapEmbedUrl(checkinMapCenter = null) {
  if (!checkinMapCenter) return "";
  const lat = Number(checkinMapCenter.lat);
  const lng = Number(checkinMapCenter.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";

  const delta = 0.06;
  const left = (lng - delta).toFixed(6);
  const right = (lng + delta).toFixed(6);
  const top = (lat + delta).toFixed(6);
  const bottom = (lat - delta).toFixed(6);
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat.toFixed(6)}%2C${lng.toFixed(6)}`;
}

export function buildOpenStreetMapStaticUrl(checkinMapCenter = null) {
  if (!checkinMapCenter) return "";
  const lat = Number(checkinMapCenter.lat);
  const lng = Number(checkinMapCenter.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";
  const zoom = 11;
  const marker = `${lat.toFixed(6)},${lng.toFixed(6)},red-pushpin`;
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat.toFixed(6)},${lng.toFixed(6)}&zoom=${zoom}&size=1200x620&markers=${marker}`;
}

export function pickDefaultCheckinCountry({
  currentCountry = "",
  residentCountry = "",
  homeCity = "",
  cityCountryLookup = new Map(),
  normalizeCityKey,
  checkinCountryOptions = [],
}) {
  if (String(currentCountry || "").trim()) return null;
  const resident = String(residentCountry || "").trim();
  if (resident) return resident;

  const homeCityKey = normalizeCityKey(homeCity);
  const homeCountry = homeCityKey ? cityCountryLookup.get(homeCityKey) : "";
  if (homeCountry) return String(homeCountry);

  if ((checkinCountryOptions || []).length > 0) {
    return String(checkinCountryOptions[0]);
  }
  return "";
}

export function pickDefaultCheckinCity({
  currentCity = "",
  homeCity = "",
  checkinCityOptions = [],
  formatCityLabel,
}) {
  if (String(currentCity || "").trim()) return null;
  if (homeCity) return formatCityLabel(homeCity);
  if ((checkinCityOptions || []).length > 0) return String(checkinCityOptions[0]);
  return "";
}

export function normalizeInvalidCheckinCity({
  currentCity = "",
  checkinCityOptions = [],
}) {
  if (!currentCity) return null;
  if ((checkinCityOptions || []).includes(currentCity)) return null;
  return checkinCityOptions[0] || "";
}
