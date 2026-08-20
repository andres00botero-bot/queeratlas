import { cityCoreConfig as cityConfig } from "./cityCore.js";

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupeSuggestions(suggestions = []) {
  const seen = new Set();
  return suggestions.filter((item) => {
    const key = `${item.href || normalizeText(item.query)}::${item.typeFilter || "all"}::${item.cityFilter || "all"}::${
      item.qualityFilter || "all"
    }`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getCityNames() {
  return Object.values(cityConfig || {})
    .map((city) => String(city?.title || "").replace(/^queer\s+/i, "").trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

const CITY_NAMES = getCityNames();

const PLACE_TYPE_LABELS = Object.freeze({
  bar: "bars",
  cafe: "cafes",
  club: "clubs",
  cinema: "cinemas",
  cruise: "cruise venues",
  gallery: "galleries",
  hotel: "hotels",
  restaurant: "restaurants",
  sauna: "saunas",
});

function detectCityPrefixMatches(query = "", max = 4) {
  const normalized = normalizeText(query);
  if (!normalized) return [];
  return CITY_NAMES.filter((name) => normalizeText(name).startsWith(normalized)).slice(0, max);
}

function buildCityTemplateSuggestions(city = "") {
  if (!city) return [];
  return [
    {
      id: `${city}-city-guide`,
      label: `${city} city guide`,
      query: city,
      typeFilter: "city",
      cityFilter: city,
      qualityFilter: "all",
      tone: "cyan",
    },
    {
      id: `${city}-nightlife-tonight`,
      label: `${city} nightlife tonight`,
      query: `${city} nightlife tonight`,
      typeFilter: "event",
      cityFilter: city,
      qualityFilter: "all",
      tone: "violet",
    },
    {
      id: `${city}-queer-cafes`,
      label: `${city} queer cafés`,
      query: `${city} queer cafés`,
      typeFilter: "place",
      cityFilter: city,
      qualityFilter: "all",
      tone: "rose",
    },
    {
      id: `${city}-inclusive-hotels`,
      label: `${city} queer-friendly hotels`,
      query: `${city} queer-friendly hotels`,
      typeFilter: "place",
      cityFilter: city,
      qualityFilter: "all",
      tone: "emerald",
    },
    {
      id: `${city}-underground-clubs`,
      label: `${city} underground clubs`,
      query: `${city} underground clubs`,
      typeFilter: "place",
      cityFilter: city,
      qualityFilter: "all",
      tone: "fuchsia",
    },
    {
      id: `${city}-trending`,
      label: `Trending in ${city}`,
      query: `trending in ${city}`,
      typeFilter: "all",
      cityFilter: city,
      qualityFilter: "all",
      tone: "cyan",
    },
  ];
}

function buildEntitySuggestions(entityResults = [], max = 4) {
  return (Array.isArray(entityResults) ? entityResults : [])
    .filter((item) => item?.href && (item?.title || item?.name))
    .slice(0, max)
    .map((item) => {
      const type = String(item.type || "all");
      const title = String(item.title || item.name || "").replace(/^Queer\s+/i, "").trim();
      const context =
        type === "city"
          ? String(item.country || "City guide")
          : type === "guide"
            ? String(item.kind || "Guide")
            : [item.city, type === "place" ? item.placeType || "Venue" : type].filter(Boolean).join(" · ");
      return {
        id: `entity-${type}-${item.id}`,
        label: title,
        description: context,
        query: title,
        href: item.href,
        typeFilter: type,
        cityFilter: "all",
        qualityFilter: "all",
        tone: type,
        direct: true,
      };
    });
}

export function buildLiveSearchSuggestions({
  query = "",
  intentProfile = null,
  entityResults = [],
  max = 8,
} = {}) {
  const normalized = normalizeText(query);
  if (normalized.length < 2) return [];

  const suggestions = buildEntitySuggestions(entityResults, 4);
  const firstPrefixCity = detectCityPrefixMatches(normalized, 1)[0] || "";
  const intentCity = String(intentProfile?.detectedCity || "").trim();
  const cityForTemplates = firstPrefixCity || intentCity;
  const placeTypeLabel = String(intentProfile?.placeTypeLabels?.[0] || "").trim();

  if (cityForTemplates && placeTypeLabel) {
    const pluralLabel = PLACE_TYPE_LABELS[placeTypeLabel] || `${placeTypeLabel}s`;
    suggestions.push({
      id: `${cityForTemplates}-${placeTypeLabel}-intent`,
      label: `${cityForTemplates} ${pluralLabel}`,
      query: `${cityForTemplates} ${placeTypeLabel}`,
      typeFilter: "place",
      cityFilter: cityForTemplates,
      qualityFilter: "all",
      tone: "rose",
    });
  }

  if (cityForTemplates) {
    suggestions.push(...buildCityTemplateSuggestions(cityForTemplates));
  }

  if (intentProfile?.flags?.drag) {
    suggestions.push({
      id: "intent-drag-tonight",
      label: "Drag shows tonight",
      query: "drag shows tonight",
      typeFilter: "event",
      cityFilter: cityForTemplates || "all",
      qualityFilter: "all",
      tone: "violet",
    });
  }

  if (intentProfile?.flags?.safe || intentProfile?.flags?.transFriendly) {
    suggestions.push({
      id: "intent-safety-context",
      label: "Places with current safety context",
      query: "queer safety context",
      typeFilter: "place",
      cityFilter: cityForTemplates || "all",
      qualityFilter: "all",
      tone: "emerald",
    });
  }

  if (intentProfile?.flags?.quiet) {
    suggestions.push({
      id: "intent-quiet-places",
      label: "Quiet queer places",
      query: "quiet queer places",
      typeFilter: "place",
      cityFilter: cityForTemplates || "all",
      qualityFilter: "all",
      tone: "cyan",
    });
  }

  if (intentProfile?.flags?.community) {
    suggestions.push({
      id: "intent-community-meetups",
      label: "Community meetups this week",
      query: "community meetups",
      typeFilter: "event",
      cityFilter: cityForTemplates || "all",
      qualityFilter: "all",
      tone: "rose",
    });
  }

  if (!cityForTemplates) {
    suggestions.push(
      {
        id: "generic-events-tonight",
        label: "Events tonight",
        query: "events tonight",
        typeFilter: "event",
        cityFilter: "all",
        qualityFilter: "all",
        tone: "violet",
      },
      {
        id: "generic-queer-bars",
        label: "Queer bars",
        query: "queer bars",
        typeFilter: "place",
        cityFilter: "all",
        qualityFilter: "all",
        tone: "rose",
      },
      {
        id: "generic-safety-context",
        label: "Queer travel safety context",
        query: "queer travel safety",
        typeFilter: "place",
        cityFilter: "all",
        qualityFilter: "all",
        tone: "emerald",
      }
    );
  }

  return dedupeSuggestions(suggestions).slice(0, max);
}
