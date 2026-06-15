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
    const key = `${normalizeText(item.query)}::${item.typeFilter || "all"}::${item.cityFilter || "all"}::${
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
  cruise: "cruise venues",
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
      id: `${city}-safe-hotels`,
      label: `${city} safe hotels`,
      query: `${city} safe hotels`,
      typeFilter: "place",
      cityFilter: city,
      qualityFilter: "verified",
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

export function buildLiveSearchSuggestions({ query = "", intentProfile = null, max = 7 } = {}) {
  const normalized = normalizeText(query);
  if (normalized.length < 2) return [];

  const suggestions = [];
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
      id: "intent-safe-verified",
      label: "Verified safe queer spaces",
      query: "safe queer spaces",
      typeFilter: "place",
      cityFilter: cityForTemplates || "all",
      qualityFilter: "verified",
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
        id: "generic-safe-spaces",
        label: "Safe queer spaces",
        query: "safe queer spaces",
        typeFilter: "place",
        cityFilter: "all",
        qualityFilter: "verified",
        tone: "emerald",
      }
    );
  }

  return dedupeSuggestions(suggestions).slice(0, max);
}
