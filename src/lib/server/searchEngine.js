import "server-only";

import { supabase } from "../supabase.js";
import { fetchPlacesForAtlas } from "../placesDataApi.js";
import { fetchServicesQuery } from "../servicesDataApi.js";
import { mergeSeedPlaces } from "../seedPlacesContent.js";
import { mergeSeedEvents } from "../seedEventsContent.js";
import { buildAtlasSearchResults } from "../search.js";
import { inferSearchIntent } from "../searchIntent.js";
import { getSearchGuides } from "../searchGuides.js";
import { resolveSearchTimeZone } from "../searchTimeZones.js";
import { cityCoreConfig } from "../cityCore.js";

const EMPTY_RESPONSE = Object.freeze({ data: [], error: null });

function cleanQuery(value = "") {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}

function normalizeScope(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function resolveCityScope(value = "") {
  const normalized = normalizeScope(value);
  if (!normalized) return "";
  const match = Object.entries(cityCoreConfig).find(([key, city]) => {
    const title = String(city?.title || "").replace(/^Queer\s+/i, "");
    return normalizeScope(key) === normalized || normalizeScope(title) === normalized;
  });
  return match ? String(match[0]) : String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
}

function filterCity(rows = [], cityScope = "") {
  if (!cityScope) return Array.isArray(rows) ? rows : [];
  const normalizedCity = normalizeScope(cityScope);
  return (Array.isArray(rows) ? rows : []).filter(
    (row) => normalizeScope(row?.city) === normalizedCity
  );
}

function buildCorpusFromRpcRows(rows = [], cityScope = "") {
  const places = [];
  const events = [];
  const services = [];
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const entity = row?.entity && typeof row.entity === "object" ? row.entity : null;
    if (!entity) return;
    const rankedEntity = { ...entity, database_search_rank: Number(row?.search_rank || 0) };
    if (row?.entity_type === "place") places.push(rankedEntity);
    if (row?.entity_type === "event") events.push(rankedEntity);
    if (row?.entity_type === "service") services.push(rankedEntity);
  });

  return {
    places: filterCity(mergeSeedPlaces(places), cityScope),
    events: filterCity(mergeSeedEvents(events), cityScope),
    services: filterCity(services, cityScope),
    guides: getSearchGuides(),
    partialData: false,
    source: "postgres-search-v2",
  };
}

async function loadRpcSearchCorpus({ query, cityScope, typeScope, placeTypes, compactMode }) {
  if (typeScope === "city" || typeScope === "guide") return null;
  const { data, error } = await supabase.rpc("qa_search_catalog_v2", {
    search_text: query,
    city_filter: cityScope || null,
    entity_filter: typeScope === "all" ? null : typeScope,
    place_types: Array.isArray(placeTypes) && placeTypes.length > 0 ? placeTypes : null,
    result_limit: compactMode ? 24 : cityScope && placeTypes?.length > 0 ? 5000 : 500,
    result_offset: 0,
  });
  if (error) return null;
  return buildCorpusFromRpcRows(data, cityScope);
}

async function loadSearchCorpus({ cityScope = "", typeScope = "all" } = {}) {
  const needsPlaces = typeScope === "all" || typeScope === "place";
  const needsEvents = typeScope === "all" || typeScope === "event";
  const needsServices = typeScope === "all" || typeScope === "service";
  const databaseCity = resolveCityScope(cityScope);

  const placesPromise = needsPlaces
    ? fetchPlacesForAtlas({
        filters: databaseCity ? { city: databaseCity } : undefined,
        mergeSeed: false,
      })
    : Promise.resolve(EMPTY_RESPONSE);

  const eventsPromise = needsEvents
    ? (() => {
        let request = supabase.from("events").select("*").order("date", { ascending: true });
        if (databaseCity) request = request.eq("city", databaseCity);
        return request;
      })()
    : Promise.resolve(EMPTY_RESPONSE);

  const servicesPromise = needsServices ? fetchServicesQuery() : Promise.resolve(EMPTY_RESPONSE);
  const [placesResponse, eventsResponse, servicesResponse] = await Promise.all([
    placesPromise,
    eventsPromise,
    servicesPromise,
  ]);

  return {
    places: filterCity(
      mergeSeedPlaces(Array.isArray(placesResponse?.data) ? placesResponse.data : []),
      databaseCity
    ),
    events: filterCity(mergeSeedEvents(eventsResponse?.data || []), databaseCity),
    services: filterCity(
      Array.isArray(servicesResponse?.data) ? servicesResponse.data : [],
      databaseCity
    ),
    guides: getSearchGuides(),
    partialData: Boolean(
      placesResponse?.error || eventsResponse?.error || servicesResponse?.error
    ),
    source: "direct-catalog-v2",
  };
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
  const compactMode = mode === "suggestions";
  const explicitTypeScope = ["city", "place", "event", "service", "guide"].includes(requestedType)
    ? requestedType
    : "all";
  const typeScope =
    explicitTypeScope === "all" && intent.suggestedTypeFilter !== "all"
      ? intent.suggestedTypeFilter
      : explicitTypeScope;
  const cityScope = resolveCityScope(requestedCity || intent.detectedCity);
  const rpcCorpus = await loadRpcSearchCorpus({
    query: safeQuery,
    cityScope,
    typeScope,
    placeTypes: intent.placeTypes,
    compactMode,
  });
  const corpus = rpcCorpus || (await loadSearchCorpus({ cityScope, typeScope }));
  const exhaustivePlaceCategory = Boolean(
    !compactMode &&
      intent.placeTypes?.length > 0 &&
      (requestedCity || intent.detectedCity)
  );
  const results = buildAtlasSearchResults({
    query: safeQuery,
    places: typeScope === "all" || typeScope === "place" ? corpus.places : [],
    events: typeScope === "all" || typeScope === "event" ? corpus.events : [],
    services: typeScope === "all" || typeScope === "service" ? corpus.services : [],
    guides: typeScope === "all" || typeScope === "guide" ? corpus.guides : [],
    cityLimit: typeScope === "all" || typeScope === "city" ? (compactMode ? 4 : 24) : 0,
    placeLimit: compactMode ? 6 : exhaustivePlaceCategory ? corpus.places.length : 80,
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
      engine: corpus.source || "catalog-v2",
      timeZone,
      city: intent.detectedCity || "",
      cityMatch: intent.cityMatch || "none",
      intentTags: intent.tags.slice(0, 8),
      resultCount: results.all.length,
      partialData: corpus.partialData,
      requestedCity: requestedCity || "",
      requestedType: typeScope,
      exhaustiveCategory: exhaustivePlaceCategory,
    },
  };
}
