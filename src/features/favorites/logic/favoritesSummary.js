export function computeAllCities({
  savedPlaces = [],
  savedEvents = [],
  normalizeCityKey,
  cityLabelLookup,
  formatCityLabel,
}) {
  return [...new Set((savedPlaces || []).concat(savedEvents || []).map((item) => normalizeCityKey(item.city)).filter(Boolean))]
    .map((cityKey) => cityLabelLookup.get(cityKey) || formatCityLabel(cityKey))
    .filter(Boolean);
}

export function computeCheckinCountryOptions({
  cityCountryLookup,
  residentCountry = "",
}) {
  return [...new Set([...(cityCountryLookup?.values?.() || []), String(residentCountry || "").trim()].filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
}

export function computeCheckinCityOptions({
  cityCountryLookup,
  cityLabelLookup,
  selectedCountry = "",
  formatCityLabel,
}) {
  const normalizedCountry = String(selectedCountry || "").trim().toLowerCase();
  const entries = [...(cityCountryLookup?.entries?.() || [])].filter(([, country]) => {
    if (!normalizedCountry) return true;
    return String(country).toLowerCase() === normalizedCountry;
  });
  return entries
    .map(([cityKey]) => cityLabelLookup.get(cityKey) || formatCityLabel(cityKey))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export function computeTopVibe({
  savedPlaces = [],
  resolvePrimaryVibeKey,
  resolvePrimaryVibeLabel,
}) {
  const vibeCount = (savedPlaces || []).reduce((acc, place) => {
    const vibeKey = resolvePrimaryVibeKey(place, { includeTypeFallback: true }) || "mixed";
    acc[vibeKey] = (acc[vibeKey] || 0) + 1;
    return acc;
  }, {});

  const topVibeKey = Object.entries(vibeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "mixed";
  const topVibe = resolvePrimaryVibeLabel({ vibe_tags: [topVibeKey] }, { fallback: "Mixed" });
  return { topVibeKey, topVibe };
}

export function computeRecentSaves({
  added = [],
  events = [],
  places = [],
}) {
  return [...(added || [])]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
    .map((item) => {
      const id = String(item?.id || "");
      if (!id) return null;
      const isEvent = id.startsWith("event-");
      if (isEvent) {
        const eventId = id.replace("event-", "");
        const event = (events || []).find((entry) => String(entry.id) === eventId);
        return event
          ? { type: "event", id: event.id, city: event.city, name: event.name, date: item.date }
          : null;
      }

      const place = (places || []).find((entry) => String(entry.id) === id);
      return place
        ? { type: "place", id: place.id, city: place.city, name: place.name, date: item.date }
        : null;
    })
    .filter(Boolean);
}

export function computeThisWeekAdds(added = [], now = new Date()) {
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  return (added || []).filter((item) => {
    const date = new Date(item.date);
    return date >= weekAgo;
  }).length;
}

export function computeRecentCheckins(checkins = [], limit = 10) {
  return [...(checkins || [])]
    .sort((a, b) => new Date(b.checkedInAt || 0) - new Date(a.checkedInAt || 0))
    .slice(0, limit);
}

export function computeSavedPlaces({
  places = [],
  favoriteIdSet = new Set(),
  blockedPlaceIds = new Set(),
}) {
  return (places || [])
    .filter((place) => favoriteIdSet.has(String(place.id)) && !blockedPlaceIds.has(String(place.id)))
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
}

export function computeSavedEvents({
  events = [],
  favoriteIdSet = new Set(),
  blockedEventIds = new Set(),
}) {
  return (events || [])
    .filter((event) => favoriteIdSet.has(`event-${event.id}`) && !blockedEventIds.has(String(event.id)))
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
}

export function buildCityCountryLookup({
  cityConfig = {},
  places = [],
  events = [],
  normalizeCityKey,
}) {
  const map = new Map();

  Object.entries(cityConfig || {}).forEach(([cityKey, config]) => {
    const normalized = normalizeCityKey(cityKey);
    const country = String(config?.country || "").trim();
    if (normalized && country) {
      map.set(normalized, country);
    }
  });

  (places || []).forEach((place) => {
    const normalized = normalizeCityKey(place.city);
    const country = String(cityConfig?.[String(place.city || "").toLowerCase()]?.country || "").trim();
    if (!normalized || !country || map.has(normalized)) return;
    map.set(normalized, country);
  });

  (events || []).forEach((event) => {
    const normalized = normalizeCityKey(event.city);
    const country = String(cityConfig?.[String(event.city || "").toLowerCase()]?.country || "").trim();
    if (!normalized || !country || map.has(normalized)) return;
    map.set(normalized, country);
  });

  return map;
}

export function buildCityLabelLookup({
  cityConfig = {},
  places = [],
  events = [],
  normalizeCityKey,
  formatCityLabel,
}) {
  const map = new Map();
  Object.keys(cityConfig || {}).forEach((cityKey) => {
    map.set(normalizeCityKey(cityKey), formatCityLabel(cityKey));
  });
  (places || []).forEach((place) => {
    const key = normalizeCityKey(place.city);
    if (key && !map.has(key)) {
      map.set(key, formatCityLabel(place.city));
    }
  });
  (events || []).forEach((event) => {
    const key = normalizeCityKey(event.city);
    if (key && !map.has(key)) {
      map.set(key, formatCityLabel(event.city));
    }
  });
  return map;
}
