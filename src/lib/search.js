import { cityConfig } from "@/lib/cities";

function scoreMatch(text, query) {
  if (!text) return 0;
  const value = text.toLowerCase();
  if (value === query) return 140;
  if (value.startsWith(query)) return 100;
  if (value.includes(` ${query}`)) return 80;
  if (value.includes(query)) return 55;
  return 0;
}

function aggregateScore(parts, query) {
  return parts.reduce((sum, part) => sum + scoreMatch(part, query), 0);
}

function normalizeValue(value = "") {
  return String(value || "").trim().toLowerCase();
}

function qualityBoost(targetType, targetId, qualityMap = {}) {
  const key = `${targetType}:${String(targetId)}`;
  const quality = qualityMap?.[key];
  if (!quality) return 0;

  const verified = Boolean(quality.verified);
  const checkedAt = quality.lastChecked ? new Date(quality.lastChecked).getTime() : NaN;
  const staleCutoff = Date.now() - 120 * 24 * 60 * 60 * 1000;
  const isStale = !Number.isFinite(checkedAt) || checkedAt < staleCutoff;

  if (verified && !isStale) return 16;
  if (isStale) return -8;
  return 4;
}

function eventFreshnessBoost(dateValue, nowTs) {
  if (!dateValue) return 0;
  const eventTs = new Date(dateValue).getTime();
  if (!Number.isFinite(eventTs)) return 0;
  const days = Math.round((eventTs - nowTs) / 86400000);
  if (days < -2) return -12;
  if (days <= 3) return 22;
  if (days <= 14) return 14;
  if (days <= 45) return 7;
  return 1;
}

export function buildAtlasSearchResults({
  query,
  places,
  events,
  cityLimit = 5,
  placeLimit = 6,
  eventLimit = 6,
  favoriteIds = [],
  qualityMap = {},
  preferredCity = "",
  nowTs = Date.now(),
}) {
  const normalized = query?.trim().toLowerCase();

  if (!normalized) {
    return { cities: [], places: [], events: [], all: [] };
  }

  const favoriteSet = new Set((favoriteIds || []).map((item) => String(item)));
  const preferredCityKey = normalizeValue(preferredCity);

  const cityResults = Object.entries(cityConfig)
    .map(([key, city]) => {
      const baseScore = aggregateScore(
        [key, city.title, city.country, city.vibe],
        normalized
      );
      const cityName = city.title.replace("Queer ", "");
      const cityKey = normalizeValue(cityName);
      const cityAffinity = preferredCityKey && cityKey === preferredCityKey ? 18 : 0;
      return {
        id: key,
        key,
        name: cityName,
        title: city.title,
        country: city.country || "",
        vibe: city.vibe || "",
        type: "city",
        score: baseScore + cityAffinity,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, cityLimit);

  const placeResults = places
    .map((place) => {
      const baseScore = aggregateScore(
        [place.name, place.city, place.vibe, place.type],
        normalized
      );
      const cityAffinity =
        preferredCityKey && normalizeValue(place.city) === preferredCityKey ? 20 : 0;
      const socialProof = Math.min(Number(place.reviewCount || 0), 40) * 0.55;
      const ratingBoost = Math.max(0, Number(place.avgRating || 0) - 3) * 7;
      const qualityScore = qualityBoost("place", place.id, qualityMap);
      const noveltyPenalty = favoriteSet.has(String(place.id)) ? -18 : 0;
      const score = Math.round(
        baseScore + cityAffinity + socialProof + ratingBoost + qualityScore + noveltyPenalty
      );
      return { ...place, type: "place", score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, placeLimit);

  const eventResults = events
    .map((event) => {
      const baseScore = aggregateScore(
        [event.name, event.city, event.description],
        normalized
      );
      const cityAffinity =
        preferredCityKey && normalizeValue(event.city) === preferredCityKey ? 18 : 0;
      const freshness = eventFreshnessBoost(event.date, nowTs);
      const qualityScore = qualityBoost("event", event.id, qualityMap);
      const noveltyPenalty = favoriteSet.has(`event-${event.id}`) ? -15 : 0;
      const score = Math.round(baseScore + cityAffinity + freshness + qualityScore + noveltyPenalty);
      return { ...event, type: "event", score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, eventLimit);

  return {
    cities: cityResults,
    places: placeResults,
    events: eventResults,
    all: [...cityResults, ...placeResults, ...eventResults].sort((a, b) => b.score - a.score),
  };
}
