import "server-only";

import { unstable_cache } from "next/cache";
import { supabase } from "../supabase.js";
import { fetchPlacesForAtlas } from "../placesDataApi.js";
import { fetchServicesQuery } from "../servicesDataApi.js";
import { mergeSeedEventsAsync } from "../seedMerge.js";
import { buildAtlasSearchResults } from "../search.js";
import { inferSearchIntent } from "../searchIntent.js";
import { getSearchGuides } from "../searchGuides.js";
import { resolveSearchTimeZone } from "../searchTimeZones.js";

const SEARCH_CORPUS_REVALIDATE_SECONDS = 120;

const loadSearchCorpus = unstable_cache(
  async () => {
    const [placesResponse, eventsResponse, servicesResponse] = await Promise.all([
      fetchPlacesForAtlas({ mergeSeed: true }),
      supabase.from("events").select("*").order("date", { ascending: true }),
      fetchServicesQuery(),
    ]);

    return {
      places: Array.isArray(placesResponse?.data) ? placesResponse.data : [],
      events: await mergeSeedEventsAsync(eventsResponse?.data || []),
      services: Array.isArray(servicesResponse?.data) ? servicesResponse.data : [],
      guides: getSearchGuides(),
      partialData: Boolean(placesResponse?.error || eventsResponse?.error || servicesResponse?.error),
    };
  },
  ["qa-server-search-corpus-v1"],
  { revalidate: SEARCH_CORPUS_REVALIDATE_SECONDS }
);

function cleanQuery(value = "") {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}

function normalizeScope(value = "") {
  return String(value || "").trim().toLowerCase();
}

function buildEditorialSuggestions(results = {}, intent = {}) {
  const suggestions = [];
  const topCity = results.cities?.[0]?.name || intent.detectedCity || results.all?.find((item) => item.city)?.city || "";
  const topPlace = results.places?.[0];
  const topEvent = results.events?.[0];
  const safetyGuide = results.guides?.find((guide) => String(guide.intent || "").toLowerCase() === "safety");

  if (topPlace?.placeType && topCity) {
    suggestions.push({
      id: "actual-place-route",
      label: `${topPlace.placeType} venues in ${topCity}`,
      query: `${topPlace.placeType} in ${topCity}`,
      typeFilter: "place",
      cityFilter: topCity,
    });
  }
  if (topEvent?.city) {
    suggestions.push({
      id: "actual-event-route",
      label: `Upcoming queer events in ${topEvent.city}`,
      query: `queer events in ${topEvent.city}`,
      typeFilter: "event",
      cityFilter: topEvent.city,
    });
  }
  if (safetyGuide) {
    suggestions.push({
      id: "actual-safety-guide",
      label: safetyGuide.title,
      query: safetyGuide.title,
      href: safetyGuide.href,
      typeFilter: "guide",
      cityFilter: "all",
    });
  }
  return suggestions.slice(0, 3);
}

export async function runServerSearch({
  query = "",
  clientTimeZone = "UTC",
  mode = "results",
  requestedCity = "",
  requestedType = "all",
} = {}) {
  const safeQuery = cleanQuery(query);
  const intent = inferSearchIntent(safeQuery);
  const timeZone = resolveSearchTimeZone({ detectedCity: requestedCity || intent.detectedCity, clientTimeZone });
  const corpus = await loadSearchCorpus();
  const compactMode = mode === "suggestions";
  const cityScope = normalizeScope(requestedCity);
  const typeScope = ["city", "place", "event", "service", "guide"].includes(requestedType) ? requestedType : "all";
  const inRequestedCity = (entity) => !cityScope || normalizeScope(entity?.city) === cityScope;
  const results = buildAtlasSearchResults({
    query: safeQuery,
    places: typeScope === "all" || typeScope === "place" ? corpus.places.filter(inRequestedCity) : [],
    events: typeScope === "all" || typeScope === "event" ? corpus.events.filter(inRequestedCity) : [],
    services: typeScope === "all" || typeScope === "service" ? corpus.services.filter(inRequestedCity) : [],
    guides: typeScope === "all" || typeScope === "guide" ? corpus.guides : [],
    cityLimit: typeScope === "all" || typeScope === "city" ? (compactMode ? 4 : 24) : 0,
    placeLimit: compactMode ? 6 : 80,
    eventLimit: compactMode ? 6 : 80,
    serviceLimit: compactMode ? 6 : 60,
    guideLimit: compactMode ? 4 : 24,
    preferredCity: requestedCity || intent.detectedCity,
    intentProfile: intent,
    timeZone,
  });

  return {
    results,
    suggestions: buildEditorialSuggestions(results, intent),
    meta: {
      engine: "server-v1",
      timeZone,
      city: intent.detectedCity || "",
      cityMatch: intent.cityMatch || "none",
      intentTags: intent.tags.slice(0, 8),
      resultCount: results.all.length,
      partialData: corpus.partialData,
      requestedCity: requestedCity || "",
      requestedType: typeScope,
    },
  };
}
