import { cityConfig } from "@/lib/cities";
import {
  formatVibeTagLabel,
  inferVibeTagsFromLegacyVibe,
  normalizeVibeTag,
  normalizeVibeTags,
} from "@/lib/vibeTaxonomy";

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

function resolveEntityVibeTags(entity = {}, fallbackText = "") {
  const directTags = Array.isArray(entity?.vibe_tags) ? entity.vibe_tags : [];
  if (directTags.length > 0) {
    return normalizeVibeTags(directTags, { max: 3 });
  }

  const fallbackTags = inferVibeTagsFromLegacyVibe(String(fallbackText || entity?.vibe || ""), { max: 3 });
  return normalizeVibeTags(fallbackTags, { max: 3 });
}

function buildVibeSearchTerms(tags = [], legacyVibe = "") {
  const normalizedTags = normalizeVibeTags(tags, { max: 3 });
  const tagLabels = normalizedTags.map((tag) => formatVibeTagLabel(tag)).filter(Boolean);
  const legacyValue = String(legacyVibe || "").trim();
  return [...normalizedTags, ...tagLabels, legacyValue].filter(Boolean);
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

function namePriorityBoost(name, query) {
  const value = normalizeValue(name);
  if (!value || !query) return 0;
  if (value === query) return 220;
  if (value.startsWith(query)) return 150;
  if (value.includes(` ${query}`)) return 95;
  if (value.includes(query)) return 60;
  return 0;
}

function queryIntentBoost(targetType, query) {
  const value = normalizeValue(query);
  if (!value) return 0;

  const eventHints = ["festival", "pride", "party", "weekend", "parade", "march", "event"];
  const placeHints = ["bar", "club", "sauna", "hotel", "cafe", "café", "beach", "cruise", "massage", "store", "service"];

  const eventSignal = eventHints.some((hint) => value.includes(hint));
  const placeSignal = placeHints.some((hint) => value.includes(hint));

  if (eventSignal && !placeSignal) {
    if (targetType === "event") return 28;
    if (targetType === "place") return -10;
  }

  if (placeSignal && !eventSignal) {
    if (targetType === "place") return 24;
    if (targetType === "event") return -8;
  }

  return 0;
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
      const cityVibeKey = normalizeVibeTag(city.vibe || "");
      const cityVibeTags = cityVibeKey ? [cityVibeKey] : [];
      const cityVibeTerms = buildVibeSearchTerms(cityVibeTags, city.vibe);
      const baseScore = aggregateScore(
        [key, city.title, city.country, ...cityVibeTerms],
        normalized
      );
      const cityName = city.title.replace("Queer ", "");
      const cityKey = normalizeValue(cityName);
      const cityAffinity = preferredCityKey && cityKey === preferredCityKey ? 18 : 0;
      const nameBoost = namePriorityBoost(cityName, normalized);
      return {
        id: key,
        key,
        name: cityName,
        title: city.title,
        country: city.country || "",
        vibe: city.vibe || "",
        vibe_tags: cityVibeTags,
        type: "city",
        score: baseScore + cityAffinity + nameBoost,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, cityLimit);

  const placeResults = places
    .map((place) => {
      const placeVibeTags = resolveEntityVibeTags(place, place.vibe);
      const placeVibeTerms = buildVibeSearchTerms(placeVibeTags, place.vibe);
      const baseScore = aggregateScore(
        [place.name, place.city, place.type, ...placeVibeTerms],
        normalized
      );
      const cityAffinity =
        preferredCityKey && normalizeValue(place.city) === preferredCityKey ? 20 : 0;
      const socialProof = Math.min(Number(place.reviewCount || 0), 40) * 0.55;
      const ratingBoost = Math.max(0, Number(place.avgRating || 0) - 3) * 7;
      const qualityScore = qualityBoost("place", place.id, qualityMap);
      const noveltyPenalty = favoriteSet.has(String(place.id)) ? -18 : 0;
      const nameBoost = namePriorityBoost(place.name, normalized);
      const intentBoost = queryIntentBoost("place", normalized);
      const score = Math.round(
        baseScore + cityAffinity + socialProof + ratingBoost + qualityScore + noveltyPenalty + nameBoost + intentBoost
      );
      return { ...place, type: "place", vibe_tags: placeVibeTags, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, placeLimit);

  const eventResults = events
    .map((event) => {
      const eventVibeTags = resolveEntityVibeTags(event, event.vibe);
      const eventVibeTerms = buildVibeSearchTerms(eventVibeTags, event.vibe);
      const baseScore = aggregateScore(
        [event.name, event.city, event.description, ...eventVibeTerms],
        normalized
      );
      const cityAffinity =
        preferredCityKey && normalizeValue(event.city) === preferredCityKey ? 18 : 0;
      const freshness = eventFreshnessBoost(event.start_date || event.startDate || event.date, nowTs);
      const qualityScore = qualityBoost("event", event.id, qualityMap);
      const noveltyPenalty = favoriteSet.has(`event-${event.id}`) ? -15 : 0;
      const nameBoost = namePriorityBoost(event.name, normalized);
      const intentBoost = queryIntentBoost("event", normalized);
      const safeFreshness = nameBoost >= 150 ? Math.max(freshness, 0) : freshness;
      const score = Math.round(
        baseScore + cityAffinity + safeFreshness + qualityScore + noveltyPenalty + nameBoost + intentBoost
      );
      return { ...event, type: "event", vibe_tags: eventVibeTags, score };
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
