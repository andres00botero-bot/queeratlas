"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, List, LocateFixed, Map, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { inferSearchIntent } from "@/lib/searchIntent";
import { buildLiveSearchSuggestions } from "@/lib/searchSuggestions";
import { cityCoreConfig as cityConfig } from "@/lib/cityCore";
import { useMapboxStylesheet } from "@/lib/useMapboxStylesheet";
import { evaluateMapInitReadiness } from "@/lib/mapInitGuard";
import { loadMapboxGl } from "@/lib/mapboxGlLoader";
import { getEntityQuality, getQualityMap, getQualityStatus } from "@/lib/quality";
import { cityPath } from "@/lib/cityRouting";
import { buildEventPath, buildServicePath, buildVenuePath } from "@/lib/seo/entitySlug";
import { trackKpiEvent } from "@/lib/analytics";
import { readLocalJson, writeLocalJson } from "@/lib/storage";
import { formatVibeTagLabel, normalizeVibeTag } from "@/lib/vibeTaxonomy";
import { resolveVibeTagsForEntity } from "@/lib/vibeDisplay";
import VibeTagChips from "@/components/ui/VibeTagChips";
import EmptyState from "@/components/ui/EmptyState";

const TYPE_FILTERS = ["all", "city", "place", "event", "service", "guide"];
const QUALITY_FILTERS = ["all", "verified", "unverified"];
const SEARCH_MAP_SOURCE_ID = "qa-search-source";
const SEARCH_MAP_CLUSTER_LAYER_ID = "qa-search-clusters";
const SEARCH_MAP_CLUSTER_COUNT_LAYER_ID = "qa-search-cluster-count";
const SEARCH_MAP_POINT_LAYER_ID = "qa-search-points";
const SEARCH_MAP_MAX_POINTS = 96;
const EMPTY_SEARCH_RESULTS = Object.freeze({
  cities: [],
  places: [],
  events: [],
  services: [],
  guides: [],
  all: [],
});
const QUICK_SEARCHES = [
  { label: "Tonight", query: "events tonight", type: "event" },
  { label: "Guides", query: "queer travel guides and reports", type: "guide" },
];
const SEARCH_INPUT_ID = "global-search-input";
const SEARCH_SUGGESTIONS_LIST_ID = "global-search-suggestions-list";
const SEARCH_SUMMARY_STATUS_ID = "global-search-summary-status";
const RECENT_SEARCHES_STORAGE_KEY = "qa_recent_searches_v1";
const MAX_RECENT_SEARCHES = 5;
const PLAN_ACTION_CLASS =
  "rounded-full border border-white/16 bg-white/[0.065] px-3 py-1 text-[11px] font-semibold text-white/76 transition hover:border-violet-200/34 hover:bg-violet-200/12 hover:text-white";
const TYPE_FILTER_TONES = Object.freeze({
  all: "border-fuchsia-200/42 bg-[linear-gradient(135deg,rgba(232,121,249,0.24),rgba(244,114,182,0.16))] text-fuchsia-50 shadow-[0_8px_24px_rgba(217,70,239,0.12)]",
  city: "border-cyan-200/38 bg-cyan-200/14 text-cyan-50",
  place: "border-rose-200/38 bg-rose-200/14 text-rose-50",
  event: "border-violet-200/38 bg-violet-200/14 text-violet-50",
  service: "border-emerald-200/38 bg-emerald-200/14 text-emerald-50",
  guide: "border-amber-200/38 bg-amber-200/14 text-amber-50",
});
const TYPE_FILTER_IDLE_TONES = Object.freeze({
  all: "border-fuchsia-200/16 bg-fuchsia-200/[0.055] hover:border-fuchsia-200/34 hover:bg-fuchsia-200/10",
  city: "border-cyan-200/16 bg-cyan-200/[0.05] hover:border-cyan-200/34 hover:bg-cyan-200/10",
  place: "border-rose-200/16 bg-rose-200/[0.05] hover:border-rose-200/34 hover:bg-rose-200/10",
  event: "border-violet-200/16 bg-violet-200/[0.05] hover:border-violet-200/34 hover:bg-violet-200/10",
  service: "border-emerald-200/16 bg-emerald-200/[0.05] hover:border-emerald-200/34 hover:bg-emerald-200/10",
  guide: "border-amber-200/16 bg-amber-200/[0.05] hover:border-amber-200/34 hover:bg-amber-200/10",
});
const CARD_ACCENT_TONES = [
  "from-pink-200 via-fuchsia-200 to-transparent",
  "from-cyan-200 via-violet-200 to-transparent",
  "from-amber-200 via-rose-200 to-transparent",
  "from-violet-200 via-cyan-200 to-transparent",
];
const CARD_GLOW_TONES = ["bg-pink-300/16", "bg-cyan-300/14", "bg-amber-200/12", "bg-violet-300/14"];
const EMPTY_FEATURE_COLLECTION = { type: "FeatureCollection", features: [] };
function normalizeValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveItemVibeTags(item = {}) {
  if (item?.type === "city") {
    const cityKey = normalizeVibeTag(item?.vibe || "");
    return cityKey ? [cityKey] : [];
  }
  return resolveVibeTagsForEntity(item, { max: 3 });
}

function getItemDisplayName(item = {}) {
  return item?.type === "city" ? String(item?.title || item?.name || "").trim() : String(item?.name || "").trim();
}

function getTypeLabel(type = "", { plural = false } = {}) {
  const labels = {
    city: plural ? "Cities" : "City",
    place: plural ? "Venues" : "Venue",
    event: plural ? "Events" : "Event",
    service: plural ? "Services" : "Service",
    guide: plural ? "Guides" : "Guide",
  };
  return labels[type] || (plural ? "Results" : "Result");
}

function getResultHref(item = {}) {
  if (item.type === "city") return cityPath(item.key || item.id || item.name);
  if (item.type === "place") return buildVenuePath(item.city, item);
  if (item.type === "event") return buildEventPath(item.city, item);
  if (item.type === "service") return buildServicePath(item.city, item);
  if (item.type === "guide") return item.href || "/now";
  return "/search";
}

function getMatchReason(item = {}, query = "") {
  if (Number.isFinite(Number(item?.distanceKm))) return formatDistance(item.distanceKm);
  if (item?.searchSignals?.matchedCity && item?.searchSignals?.matchedPlaceType) {
    return `Matches city + ${item.searchSignals.matchedPlaceTypeLabel || "venue type"}`;
  }
  const needle = normalizeValue(query);
  const name = normalizeValue(getItemDisplayName(item));
  if (!needle || !name) return "A strong match for this search";
  if (name === needle) return "Exact name match";
  if (name.startsWith(needle)) return "Name starts with your query";
  if (name.includes(` ${needle}`)) return "Strong word-level match";
  if (name.includes(needle)) return "Name contains your query";
  return "A strong match for this search";
}

function getQualityPillClass(label = "") {
  if (label === "Verified recently") return "border-emerald-200/24 bg-emerald-200/12 text-emerald-100";
  return "border-white/14 bg-white/6 text-white/65";
}

function getTypeTheme(type = "") {
  if (type === "event") {
    return {
      shell: "border-violet-300/18 bg-[linear-gradient(155deg,rgba(72,38,122,0.34),rgba(10,10,10,0.98))] hover:border-violet-200/40",
      label: "border-violet-200/34 bg-violet-200/14 text-violet-50",
      accent: "bg-gradient-to-r from-violet-200 via-fuchsia-200 to-transparent",
      text: "text-violet-100/82",
      action: "border-violet-200/38 bg-violet-200/16 text-violet-50 hover:border-violet-100/58 hover:bg-violet-200/24",
      chipTone: "violet",
    };
  }
  if (type === "place") {
    return {
      shell: "border-rose-300/18 bg-[linear-gradient(155deg,rgba(104,32,72,0.34),rgba(10,10,10,0.98))] hover:border-rose-200/40",
      label: "border-rose-200/34 bg-rose-200/14 text-rose-50",
      accent: "bg-gradient-to-r from-rose-200 via-fuchsia-200 to-transparent",
      text: "text-rose-100/82",
      action: "border-rose-200/38 bg-rose-200/16 text-rose-50 hover:border-rose-100/58 hover:bg-rose-200/24",
      chipTone: "rose",
    };
  }
  if (type === "service") {
    return {
      shell: "border-emerald-300/18 bg-[linear-gradient(155deg,rgba(20,86,68,0.30),rgba(10,10,10,0.98))] hover:border-emerald-200/40",
      label: "border-emerald-200/34 bg-emerald-200/14 text-emerald-50",
      accent: "bg-gradient-to-r from-emerald-200 via-cyan-200 to-transparent",
      text: "text-emerald-100/82",
      action: "border-emerald-200/38 bg-emerald-200/16 text-emerald-50 hover:border-emerald-100/58 hover:bg-emerald-200/24",
      chipTone: "emerald",
    };
  }
  if (type === "guide") {
    return {
      shell: "border-amber-300/18 bg-[linear-gradient(155deg,rgba(94,58,18,0.30),rgba(10,10,10,0.98))] hover:border-amber-200/40",
      label: "border-amber-200/34 bg-amber-200/14 text-amber-50",
      accent: "bg-gradient-to-r from-amber-200 via-orange-200 to-transparent",
      text: "text-amber-100/82",
      action: "border-amber-200/38 bg-amber-200/16 text-amber-50 hover:border-amber-100/58 hover:bg-amber-200/24",
      chipTone: "amber",
    };
  }
  return {
    shell: "border-cyan-300/18 bg-[linear-gradient(155deg,rgba(24,74,104,0.34),rgba(10,10,10,0.98))] hover:border-cyan-200/40",
    label: "border-cyan-200/34 bg-cyan-200/14 text-cyan-50",
    accent: "bg-gradient-to-r from-cyan-200 via-sky-200 to-transparent",
    text: "text-cyan-100/82",
    action: "border-cyan-200/38 bg-cyan-200/16 text-cyan-50 hover:border-cyan-100/58 hover:bg-cyan-200/24",
    chipTone: "cyan",
  };
}

function toFiniteNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function distanceInKm(origin = null, item = {}) {
  const lat1 = toFiniteNumber(origin?.lat);
  const lng1 = toFiniteNumber(origin?.lng);
  const lat2 = toFiniteNumber(item?.lat);
  const lng2 = toFiniteNumber(item?.lng);
  if (lat1 === null || lng1 === null || lat2 === null || lng2 === null) return null;
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const deltaLat = radians(lat2 - lat1);
  const deltaLng = radians(lng2 - lng1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(deltaLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(distanceKm) {
  const distance = Number(distanceKm);
  if (!Number.isFinite(distance)) return "";
  if (distance < 1) return `${Math.max(50, Math.round((distance * 1000) / 50) * 50)} m away`;
  return `${distance < 10 ? distance.toFixed(1) : Math.round(distance)} km away`;
}

function resolveCityCenter(cityName = "") {
  const target = normalizeValue(cityName);
  if (!target) return null;
  const city = Object.values(cityConfig).find((entry) => {
    const title = String(entry?.title || "").replace(/^Queer\s+/i, "").trim();
    return normalizeValue(title) === target;
  });
  const center = Array.isArray(city?.center) ? city.center : null;
  if (!center || center.length < 2) return null;
  const lng = toFiniteNumber(center[0]);
  const lat = toFiniteNumber(center[1]);
  if (lng === null || lat === null) return null;
  return { lng, lat };
}

function syncSearchMapResults(map, mapboxgl, featureCollection, points = []) {
  if (!map || !mapboxgl) return;
  const source = map.getSource(SEARCH_MAP_SOURCE_ID);
  if (!source) return;

  source.setData(featureCollection || EMPTY_FEATURE_COLLECTION);
  if (!Array.isArray(points) || points.length === 0) return;

  if (points.length === 1) {
    const point = points[0];
    map.easeTo({ center: [point.lng, point.lat], zoom: 10, duration: 700 });
    return;
  }

  const bounds = new mapboxgl.LngLatBounds();
  points.forEach((point) => {
    bounds.extend([point.lng, point.lat]);
  });
  map.fitBounds(bounds, { padding: 48, maxZoom: 11.8, duration: 750 });
}

function SearchResultSkeleton({ tone = "rose" }) {
  const toneClass =
    tone === "violet"
      ? "border-violet-200/14 bg-[linear-gradient(180deg,rgba(167,139,250,0.10),rgba(10,10,10,0.94))]"
      : tone === "cyan"
        ? "border-cyan-200/14 bg-[linear-gradient(180deg,rgba(34,211,238,0.10),rgba(10,10,10,0.94))]"
        : "border-rose-200/14 bg-[linear-gradient(180deg,rgba(244,114,182,0.10),rgba(10,10,10,0.94))]";

  return (
    <div className={`qa-skeleton-card rounded-2xl border p-4 ${toneClass}`} aria-hidden="true">
      <div className="qa-skeleton-card h-4 w-2/3 rounded-full" />
      <div className="qa-skeleton-card mt-3 h-3 w-1/2 rounded-full" />
      <div className="qa-skeleton-card mt-4 h-3 w-full rounded-full" />
    </div>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const hasHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [query, setQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const [results, setResults] = useState(EMPTY_SEARCH_RESULTS);
  const [suggestionResults, setSuggestionResults] = useState(EMPTY_SEARCH_RESULTS);
  const [draftEditorialSuggestions, setDraftEditorialSuggestions] = useState([]);
  const [searchMeta, setSearchMeta] = useState({});
  const [searchRetryNonce, setSearchRetryNonce] = useState(0);
  const [typeFilter, setTypeFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [vibeFilter, setVibeFilter] = useState("all");
  const [qualityFilter, setQualityFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isSuggestionsDismissed, setIsSuggestionsDismissed] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [searchMapError, setSearchMapError] = useState("");
  const [isDesktopSplit, setIsDesktopSplit] = useState(false);
  const [mobileView, setMobileView] = useState("list");
  const [recentSearches, setRecentSearches] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const isMapboxStylesReady = useMapboxStylesheet();
  const searchMapContainerRef = useRef(null);
  const mobileSearchMapContainerRef = useRef(null);
  const searchMapRef = useRef(null);
  const searchMapboxRef = useRef(null);
  const searchMapLoadedRef = useRef(false);
  const searchMapFeatureCollectionRef = useRef(EMPTY_FEATURE_COLLECTION);
  const searchMapPointsRef = useRef([]);
  const resultsSectionRef = useRef(null);
  const pendingResultsScrollRef = useRef(false);
  const lastTrackedSearchRef = useRef("");
  const activeQuery = hasHydrated ? committedQuery : "";
  const deferredQuery = useDeferredValue(activeQuery);

  useEffect(() => {
    if (!hasHydrated) return;
    queueMicrotask(() => {
      const stored = readLocalJson(RECENT_SEARCHES_STORAGE_KEY, []);
      setRecentSearches(
        Array.isArray(stored)
          ? stored.map((item) => String(item || "").trim()).filter(Boolean).slice(0, MAX_RECENT_SEARCHES)
          : []
      );
    });
  }, [hasHydrated]);

  const rememberSearch = useCallback((value) => {
    const cleanValue = String(value || "").trim();
    if (!cleanValue) return;
    setRecentSearches((current) => {
      const next = [cleanValue, ...current.filter((item) => normalizeValue(item) !== normalizeValue(cleanValue))].slice(
        0,
        MAX_RECENT_SEARCHES
      );
      writeLocalJson(RECENT_SEARCHES_STORAGE_KEY, next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search || "");
      const nextQuery = String(params.get("q") || "").trim();
      setQuery(nextQuery);
      setCommittedQuery(nextQuery);
      setIsSuggestionsDismissed(Boolean(nextQuery));
      setActiveSuggestionIndex(-1);
    };
    queueMicrotask(syncFromUrl);
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [hasHydrated]);

  useEffect(() => {
    const cleanQuery = deferredQuery.trim();
    if (!cleanQuery) {
      queueMicrotask(() => {
        setResults(EMPTY_SEARCH_RESULTS);
        setSearchMeta({});
        setLoadError("");
        setIsLoading(false);
      });
      return undefined;
    }

    const controller = new AbortController();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const loadResults = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const params = new URLSearchParams({ q: cleanQuery, tz: timeZone });
        if (cityFilter !== "all") params.set("city", cityFilter);
        if (typeFilter !== "all") params.set("type", typeFilter);
        const response = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("search unavailable");
        const payload = await response.json();
        if (controller.signal.aborted) return;
        const nextResults = payload?.results?.all ? payload.results : EMPTY_SEARCH_RESULTS;
        const nextMeta = payload?.meta || {};
        setResults(nextResults);
        setSearchMeta(nextMeta);
        if (nextMeta.partialData) setLoadError("Some live listings could not be loaded. The available matches are shown.");

        const queryLength = cleanQuery.length;
        const lengthBucket = queryLength < 8 ? "short" : queryLength < 24 ? "medium" : "long";
        const trackingKey = `${normalizeValue(cleanQuery)}:${nextMeta.resultCount ?? nextResults.all.length}`;
        if (lastTrackedSearchRef.current !== trackingKey) {
          lastTrackedSearchRef.current = trackingKey;
          trackKpiEvent("atlas_search_completed", {
            targetType: "search",
            meta: {
              result_count: Number(nextMeta.resultCount ?? nextResults.all.length),
              query_length: lengthBucket,
              intent: Array.isArray(nextMeta.intentTags) ? nextMeta.intentTags.slice(0, 4).join(",") : "",
              city_detected: Boolean(nextMeta.city),
              corrected_city: nextMeta.cityMatch === "corrected",
              engine: nextMeta.engine || "server",
            },
          });
        }
      } catch (error) {
        if (error?.name === "AbortError") return;
        setResults(EMPTY_SEARCH_RESULTS);
        setLoadError("Search is temporarily unavailable.");
        trackKpiEvent("atlas_search_failed", {
          targetType: "search",
          meta: {
            query_length: cleanQuery.length < 8 ? "short" : cleanQuery.length < 24 ? "medium" : "long",
          },
        });
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadResults();
    return () => controller.abort();
  }, [cityFilter, deferredQuery, searchRetryNonce, typeFilter]);

  useEffect(() => {
    const cleanQuery = query.trim();
    if (cleanQuery.length < 2) {
      queueMicrotask(() => {
        setSuggestionResults(EMPTY_SEARCH_RESULTS);
        setDraftEditorialSuggestions([]);
      });
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const params = new URLSearchParams({ q: cleanQuery, tz: timeZone, mode: "suggestions" });
        const response = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) return;
        const payload = await response.json();
        if (controller.signal.aborted) return;
        setSuggestionResults(payload?.results?.all ? payload.results : EMPTY_SEARCH_RESULTS);
        setDraftEditorialSuggestions(Array.isArray(payload?.suggestions) ? payload.suggestions : []);
      } catch (error) {
        if (error?.name !== "AbortError") {
          setSuggestionResults(EMPTY_SEARCH_RESULTS);
          setDraftEditorialSuggestions([]);
        }
      }
    }, 180);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const qualityMap = getQualityMap();
  const intentProfile = useMemo(() => inferSearchIntent(deferredQuery), [deferredQuery]);
  const draftIntentProfile = useMemo(() => inferSearchIntent(query), [query]);
  const hasIdentityIntent = Boolean(
    intentProfile.flags?.transFriendly ||
      intentProfile.flags?.lesbianFriendly ||
      intentProfile.flags?.nonbinaryFriendly ||
      intentProfile.flags?.gayFriendly ||
      intentProfile.flags?.bisexualFriendly ||
      intentProfile.flags?.sapphicFriendly
  );
  const effectiveTypeFilter = typeFilter === "all" ? intentProfile.suggestedTypeFilter : typeFilter;
  const effectiveQualityFilter =
    qualityFilter === "all" ? intentProfile.suggestedQualityFilter : qualityFilter;
  const liveSuggestions = useMemo(() => {
    const generated = buildLiveSearchSuggestions({
        query,
        intentProfile: draftIntentProfile,
        entityResults: suggestionResults.all.map((item) => ({ ...item, href: getResultHref(item) })),
      });
    const combined = [...generated, ...draftEditorialSuggestions];
    const seen = new Set();
    return combined
      .filter((suggestion) => {
        const key = `${suggestion.href || normalizeValue(suggestion.query)}:${suggestion.typeFilter || "all"}:${suggestion.cityFilter || "all"}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 8);
  }, [draftEditorialSuggestions, draftIntentProfile, query, suggestionResults.all]);
  const isSuggestionsOpen =
    !isSuggestionsDismissed && query.trim().length >= 2 && liveSuggestions.length > 0;
  const activeSuggestionId =
    isSuggestionsOpen && activeSuggestionIndex >= 0
      ? `global-search-suggestion-${activeSuggestionIndex}`
      : undefined;

  const cityOptions = useMemo(() => {
    const configCities = Object.values(cityConfig)
      .map((city) => city.title?.replace(/^Queer\s+/i, "").trim())
      .filter(Boolean);
    const resultCities = results.all
      .map((item) => (item.type === "city" ? item.name : item.city || ""))
      .filter(Boolean);

    return ["all", ...new Set([...configCities, ...resultCities])].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [results.all]);

  const vibeOptions = useMemo(() => {
    const configVibeTags = Object.values(cityConfig)
      .map((city) => normalizeVibeTag(city.vibe || ""))
      .filter(Boolean);
    const resultVibeTags = results.all.flatMap((item) => resolveItemVibeTags(item));
    const keys = [...new Set([...configVibeTags, ...resultVibeTags])].sort((a, b) =>
      String(formatVibeTagLabel(a) || a).localeCompare(String(formatVibeTagLabel(b) || b))
    );
    return [
      { value: "all", label: "All vibes" },
      ...keys.map((key) => ({ value: key, label: formatVibeTagLabel(key) || key })),
    ];
  }, [results.all]);

  const filteredAll = useMemo(() => {
    if (intentProfile.flags?.nearby && !userLocation) return [];
    const list = results.all.filter((item) => {
      if (effectiveTypeFilter !== "all" && item.type !== effectiveTypeFilter) return false;

      if (cityFilter !== "all") {
        const itemCity = item.type === "city" ? item.name : item.city || "";
        if (normalizeValue(itemCity) !== normalizeValue(cityFilter)) return false;
      }

      if (vibeFilter !== "all") {
        const itemVibeTags = resolveItemVibeTags(item);
        if (!itemVibeTags.includes(vibeFilter)) return false;
      }

      if (
        effectiveQualityFilter !== "all" &&
        (item.type === "place" || item.type === "event" || item.type === "service")
      ) {
        const quality = getEntityQuality({
          targetType: item.type,
          targetId: item.id,
          entity: item,
          map: qualityMap,
        });
        const status = getQualityStatus(quality);
        const key = status.tone === "verified" ? "verified" : "unverified";

        if (key !== effectiveQualityFilter) return false;
      }

      if (effectiveQualityFilter !== "all" && (item.type === "city" || item.type === "guide")) return false;

      return true;
    });

    if (intentProfile.flags?.nearby && userLocation) {
      return list
        .map((item) => ({ ...item, distanceKm: distanceInKm(userLocation, item) }))
        .filter((item) => Number.isFinite(item.distanceKm))
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return list.sort((a, b) => b.score - a.score);
  }, [cityFilter, effectiveQualityFilter, effectiveTypeFilter, intentProfile.flags?.nearby, qualityMap, results.all, userLocation, vibeFilter]);

  const filteredResults = useMemo(() => {
    const cities = filteredAll.filter((item) => item.type === "city").slice(0, 12);
    const places = filteredAll.filter((item) => item.type === "place").slice(0, 24);
    const events = filteredAll.filter((item) => item.type === "event").slice(0, 24);
    const services = filteredAll.filter((item) => item.type === "service").slice(0, 24);
    const guides = filteredAll.filter((item) => item.type === "guide").slice(0, 12);

    return {
      cities,
      places,
      events,
      services,
      guides,
      all: [...cities, ...places, ...events, ...services, ...guides],
    };
  }, [filteredAll]);

  const topMatches = useMemo(() => filteredAll.slice(0, 3), [filteredAll]);
  const searchMapPoints = useMemo(() => {
    const points = filteredAll
      .slice(0, SEARCH_MAP_MAX_POINTS)
      .map((item) => {
        const lng = toFiniteNumber(item?.lng);
        const lat = toFiniteNumber(item?.lat);
        const cityCenter = resolveCityCenter(item?.city || item?.name || "");
        const resolvedLng = lng ?? cityCenter?.lng ?? null;
        const resolvedLat = lat ?? cityCenter?.lat ?? null;
        if (resolvedLng === null || resolvedLat === null) return null;
        return {
          id: `${item.type}-${item.id}`,
          lng: resolvedLng,
          lat: resolvedLat,
          type: item.type,
          city: String(item?.city || item?.name || "").trim(),
          title: String(item?.title || item?.name || "").trim(),
          score: Math.max(0, Math.round(Number(item?.score || 0))),
        };
      })
      .filter(Boolean);
    const normalizedQuery = normalizeValue(activeQuery);
    if (!normalizedQuery) return points;

    const prefixCityMatchPoints = points.filter((point) =>
      normalizeValue(point?.city || "").startsWith(normalizedQuery)
    );
    if (prefixCityMatchPoints.length > 0) return prefixCityMatchPoints;

    const detectedCityKey = normalizeValue(intentProfile?.detectedCity || "");
    if (detectedCityKey) {
      const detectedCityPoints = points.filter(
        (point) => normalizeValue(point?.city || "") === detectedCityKey
      );
      if (detectedCityPoints.length > 0) return detectedCityPoints;
    }

    const countryMatchedCityNames = new Set(
      filteredAll
        .filter((item) => {
          if (item?.type !== "city") return false;
          const country = normalizeValue(item?.country || "");
          return (
            country === normalizedQuery ||
            country.startsWith(`${normalizedQuery} `) ||
            country.includes(` ${normalizedQuery}`)
          );
        })
        .map((item) => normalizeValue(item?.name || item?.title || ""))
        .filter(Boolean)
    );

    if (countryMatchedCityNames.size === 0) return points;
    return points.filter((point) => countryMatchedCityNames.has(normalizeValue(point?.city || "")));
  }, [activeQuery, filteredAll, intentProfile.detectedCity]);
  const hotspotRows = useMemo(() => {
    const counts = searchMapPoints.reduce((acc, point) => {
      const key = String(point.city || "Global");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [searchMapPoints]);
  const shouldShowDesktopMap =
    isDesktopSplit && Boolean(activeQuery.trim()) && !isLoading && searchMapPoints.length > 0;
  const showSearchMap = Boolean(activeQuery.trim()) && searchMapPoints.length > 0;
  const shouldInitializeSearchMap =
    showSearchMap && !isLoading && (shouldShowDesktopMap || mobileView === "map");
  const searchMapFeatureCollection = useMemo(
    () => ({
      type: "FeatureCollection",
      features: searchMapPoints.map((point) => ({
        type: "Feature",
        properties: {
          id: point.id,
          type: point.type,
          title: point.title,
          city: point.city,
          score: point.score,
        },
        geometry: {
          type: "Point",
          coordinates: [point.lng, point.lat],
        },
      })),
    }),
    [searchMapPoints]
  );
  useEffect(() => {
    searchMapFeatureCollectionRef.current = searchMapFeatureCollection;
    searchMapPointsRef.current = searchMapPoints;
  }, [searchMapFeatureCollection, searchMapPoints]);
  const sectionOrder = useMemo(() => {
    const sections = [
      { key: "city", label: "Cities", tone: "cyan", items: filteredResults.cities },
      { key: "place", label: "Venues", tone: "rose", items: filteredResults.places },
      { key: "event", label: "Events", tone: "violet", items: filteredResults.events },
      { key: "service", label: "Services", tone: "emerald", items: filteredResults.services },
      { key: "guide", label: "Guides", tone: "amber", items: filteredResults.guides },
    ];

    return sections
      .filter((section) => section.items.length > 0)
      .sort((a, b) => Number(b.items?.[0]?.score || 0) - Number(a.items?.[0]?.score || 0));
  }, [
    filteredResults.cities,
    filteredResults.events,
    filteredResults.guides,
    filteredResults.places,
    filteredResults.services,
  ]);

  const activeFilterCount = [cityFilter !== "all", vibeFilter !== "all", qualityFilter !== "all"].filter(
    Boolean
  ).length;

  const openCityFromItem = useCallback((item) => {
    const cityValue = String(item?.city || item?.name || "").trim();
    if (!cityValue) return;
    router.push(cityPath(cityValue));
  }, [router]);

  const openResult = (item) => router.push(getResultHref(item));

  const scrollToResults = useCallback(() => {
    const target = resultsSectionRef.current;
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (!pendingResultsScrollRef.current) return;
    if (!activeQuery.trim()) return;

    pendingResultsScrollRef.current = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToResults();
      });
    });
  }, [activeQuery, isLoading, scrollToResults]);

  const submitSearch = (event) => {
    event.preventDefault();
    setIsSuggestionsDismissed(true);
    setActiveSuggestionIndex(-1);
    const submittedValue = new FormData(event.currentTarget).get("q");
    const nextQuery = String(submittedValue || query).trim();
    if (!nextQuery) return;
    setQuery(nextQuery);
    setCommittedQuery(nextQuery);
    setMobileView("list");
    if (!inferSearchIntent(nextQuery).flags.nearby) setUserLocation(null);
    rememberSearch(nextQuery);
    pendingResultsScrollRef.current = true;
    router.replace(`/search?q=${encodeURIComponent(nextQuery)}`, { scroll: false });
  };

  const applySuggestion = useCallback(
    (suggestion) => {
      if (suggestion?.href) {
        setIsSuggestionsDismissed(true);
        setActiveSuggestionIndex(-1);
        router.push(String(suggestion.href));
        return;
      }
      const nextQuery = String(suggestion?.query || "").trim();
      if (!nextQuery) return;
      setQuery(nextQuery);
      setCommittedQuery(nextQuery);
      setMobileView("list");
      if (!inferSearchIntent(nextQuery).flags.nearby) setUserLocation(null);
      setTypeFilter(String(suggestion?.typeFilter || "all"));
      setCityFilter(String(suggestion?.cityFilter || "all"));
      setVibeFilter("all");
      setQualityFilter(String(suggestion?.qualityFilter || "all"));
      setIsSuggestionsDismissed(true);
      setActiveSuggestionIndex(-1);
      rememberSearch(nextQuery);
      pendingResultsScrollRef.current = true;
      router.replace(`/search?q=${encodeURIComponent(nextQuery)}`, { scroll: false });
    },
    [rememberSearch, router]
  );

  const runQuickSearch = useCallback(
    ({ query: nextQuery = "", type = "all" } = {}) => {
      const cleanQuery = String(nextQuery).trim();
      if (!cleanQuery) return;
      setQuery(cleanQuery);
      setCommittedQuery(cleanQuery);
      setMobileView("list");
      setUserLocation(null);
      setTypeFilter(type);
      setCityFilter("all");
      setVibeFilter("all");
      setQualityFilter("all");
      setIsSuggestionsDismissed(true);
      rememberSearch(cleanQuery);
      pendingResultsScrollRef.current = true;
      router.replace(`/search?q=${encodeURIComponent(cleanQuery)}`, { scroll: false });
    },
    [rememberSearch, router]
  );

  const useNearbySearch = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }

    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(nextLocation);
        setLocationStatus("ready");
        setQuery("Near me");
        setCommittedQuery("Near me");
        setTypeFilter("all");
        setCityFilter("all");
        setVibeFilter("all");
        setQualityFilter("all");
        setMobileView("list");
        setIsSuggestionsDismissed(true);
        rememberSearch("Near me");
        pendingResultsScrollRef.current = true;
        router.replace("/search?q=near%20me", { scroll: false });
      },
      () => {
        setUserLocation(null);
        setLocationStatus("denied");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, [rememberSearch, router]);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
    const media = window.matchMedia("(min-width: 1280px)");
    const apply = () => setIsDesktopSplit(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!shouldInitializeSearchMap) {
      searchMapLoadedRef.current = false;
      if (searchMapRef.current) {
        searchMapRef.current.remove();
        searchMapRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const initSearchMap = async () => {
      try {
        const mapContainer = isDesktopSplit
          ? searchMapContainerRef.current
          : mobileSearchMapContainerRef.current;
        const mapboxgl = await loadMapboxGl();
        if (cancelled) return;
        const readiness = evaluateMapInitReadiness({
          mapboxgl,
          isMapboxStylesReady,
          mapboxToken,
          container: mapContainer,
          mapInstance: searchMapRef.current,
        });
        if (!readiness.ready) {
          if (readiness.reason === "token_missing") {
            setSearchMapError("Map token missing. Add NEXT_PUBLIC_MAPBOX_TOKEN to enable explore map.");
          } else if (readiness.reason === "webgl_unsupported") {
            setSearchMapError("WebGL not supported on this device.");
          }
          return;
        }

        setSearchMapError("");
        mapboxgl.accessToken = mapboxToken;
        const map = new mapboxgl.Map({
          container: mapContainer,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [12, 48],
          zoom: 1.35,
          attributionControl: false,
        });
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
        searchMapRef.current = map;
        searchMapboxRef.current = mapboxgl;

        map.on("load", () => {
          searchMapLoadedRef.current = true;
          if (!map.getSource(SEARCH_MAP_SOURCE_ID)) {
            map.addSource(SEARCH_MAP_SOURCE_ID, {
              type: "geojson",
              data: EMPTY_FEATURE_COLLECTION,
              cluster: true,
              clusterMaxZoom: 12,
              clusterRadius: 50,
            });
          }

          if (!map.getLayer(SEARCH_MAP_CLUSTER_LAYER_ID)) {
            map.addLayer({
              id: SEARCH_MAP_CLUSTER_LAYER_ID,
              type: "circle",
              source: SEARCH_MAP_SOURCE_ID,
              filter: ["has", "point_count"],
              paint: {
                "circle-color": [
                  "step",
                  ["get", "point_count"],
                  "#22d3ee",
                  12,
                  "#a78bfa",
                  28,
                  "#f472b6",
                ],
                "circle-radius": ["step", ["get", "point_count"], 14, 12, 18, 28, 24],
                "circle-opacity": 0.8,
              },
            });
          }

          if (!map.getLayer(SEARCH_MAP_CLUSTER_COUNT_LAYER_ID)) {
            map.addLayer({
              id: SEARCH_MAP_CLUSTER_COUNT_LAYER_ID,
              type: "symbol",
              source: SEARCH_MAP_SOURCE_ID,
              filter: ["has", "point_count"],
              layout: {
                "text-field": "{point_count_abbreviated}",
                "text-size": 12,
              },
              paint: {
                "text-color": "#f8fafc",
              },
            });
          }

          if (!map.getLayer(SEARCH_MAP_POINT_LAYER_ID)) {
            map.addLayer({
              id: SEARCH_MAP_POINT_LAYER_ID,
              type: "circle",
              source: SEARCH_MAP_SOURCE_ID,
              filter: ["!", ["has", "point_count"]],
              paint: {
                "circle-color": [
                  "match",
                  ["get", "type"],
                  "event",
                  "#c4b5fd",
                  "place",
                  "#fda4af",
                  "#67e8f9",
                ],
                "circle-radius": 5.6,
                "circle-stroke-color": "#f8fafc",
                "circle-stroke-width": 1,
                "circle-opacity": 0.88,
              },
            });
          }

          syncSearchMapResults(
            map,
            mapboxgl,
            searchMapFeatureCollectionRef.current,
            searchMapPointsRef.current
          );

          map.on("click", SEARCH_MAP_CLUSTER_LAYER_ID, (event) => {
            const feature = event?.features?.[0];
            const clusterId = feature?.properties?.cluster_id;
            const source = map.getSource(SEARCH_MAP_SOURCE_ID);
            if (!source || clusterId == null) return;
            source.getClusterExpansionZoom(clusterId, (error, zoom) => {
              if (error) return;
              map.easeTo({
                center: feature.geometry.coordinates,
                zoom,
              });
            });
          });

          map.on("click", SEARCH_MAP_POINT_LAYER_ID, (event) => {
            const feature = event?.features?.[0];
            if (!feature) return;
            const title = String(feature.properties?.title || "Result");
            const city = String(feature.properties?.city || "Global");
            new mapboxgl.Popup({ offset: 12, closeButton: false })
              .setLngLat(feature.geometry.coordinates)
              .setHTML(`<div style="font-size:12px;color:#e2e8f0"><strong>${title}</strong><br/>${city}</div>`)
              .addTo(map);
          });
        });
      } catch {
        setSearchMapError("Could not initialize explore map.");
      }
    };

    initSearchMap();

    return () => {
      cancelled = true;
    };
  }, [isDesktopSplit, isMapboxStylesReady, mapboxToken, shouldInitializeSearchMap]);

  useEffect(() => {
    const map = searchMapRef.current;
    const mapboxgl = searchMapboxRef.current;
    if (!map || !mapboxgl || !searchMapLoadedRef.current) return;
    syncSearchMapResults(map, mapboxgl, searchMapFeatureCollection, searchMapPoints);
  }, [searchMapFeatureCollection, searchMapPoints]);

  useEffect(
    () => () => {
      if (searchMapRef.current) {
        searchMapRef.current.remove();
        searchMapRef.current = null;
      }
    },
    []
  );

  return (
    <main className="qa-page relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_5%,rgba(236,72,153,0.10),transparent_24%),radial-gradient(circle_at_94%_22%,rgba(34,211,238,0.08),transparent_28%),linear-gradient(180deg,#070508_0%,#040506_48%,#050505_100%)] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute left-[-7rem] top-[30rem] h-72 w-72 rounded-full bg-fuchsia-500/[0.055] blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[-8rem] top-[52rem] h-80 w-80 rounded-full bg-cyan-400/[0.05] blur-3xl" />
      <div className="qa-shell relative z-10">
        <section
          aria-labelledby="global-search-heading"
          className="qa-panel relative mb-5 overflow-visible rounded-[24px] border border-fuchsia-100/24 bg-[radial-gradient(circle_at_5%_-8%,rgba(251,113,133,0.34),transparent_29%),radial-gradient(circle_at_54%_-25%,rgba(192,132,252,0.30),transparent_36%),radial-gradient(circle_at_100%_2%,rgba(34,211,238,0.25),transparent_35%),linear-gradient(145deg,rgba(35,15,40,0.99),rgba(8,10,24,0.99)_56%,rgba(4,24,31,0.99))] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.46),0_12px_50px_rgba(217,70,239,0.08),inset_0_1px_0_rgba(255,255,255,0.09)] sm:mb-6 sm:rounded-[30px] sm:p-6"
        >
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-pink-100 to-cyan-100/70" />
          <div aria-hidden="true" className="pointer-events-none absolute right-5 top-5 hidden items-center gap-1.5 text-white/55 sm:flex">
            <span className="h-2 w-2 rounded-full bg-pink-300 shadow-[0_0_16px_rgba(249,168,212,0.75)]" />
            <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_16px_rgba(196,181,253,0.7)]" />
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.7)]" />
          </div>
          <p className="qa-eyebrow inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 via-fuchsia-100 to-cyan-100 bg-clip-text text-transparent"><Sparkles size={12} className="text-pink-200" /> Search Queer Atlas</p>
          <h1 id="global-search-heading" className="qa-display mt-2 max-w-3xl bg-gradient-to-r from-white via-pink-50 to-cyan-100 bg-clip-text text-[1.8rem] font-semibold leading-[1.04] text-transparent sm:text-[2.7rem]">
            Find your way into queer life.
          </h1>
          <p className="qa-lead mt-2 max-w-3xl text-sm leading-6 text-white/72 sm:text-base">
            <span className="sm:hidden">Search cities, venues, events, services and guides — wherever you are.</span>
            <span className="hidden sm:inline">Search cities, venues, events, services and guides — from tonight&apos;s plans to the places worth crossing town for.</span>
          </p>
          <form onSubmit={submitSearch} role="search" aria-label="Global search form" className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
            <div className="relative flex-1">
              <label htmlFor={SEARCH_INPUT_ID} className="sr-only">
                Search for city, venue, event, or vibe
              </label>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-fuchsia-100/52" size={18} />
              <input
                id={SEARCH_INPUT_ID}
                name="q"
                type="search"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={isSuggestionsOpen}
                aria-controls={SEARCH_SUGGESTIONS_LIST_ID}
                aria-activedescendant={activeSuggestionId}
                aria-describedby={SEARCH_SUMMARY_STATUS_ID}
                value={query}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setQuery(nextValue);
                  if (!nextValue.trim()) {
                    setCommittedQuery("");
                    router.replace("/search", { scroll: false });
                  }
                  setIsSuggestionsDismissed(false);
                  setActiveSuggestionIndex(-1);
                }}
                onFocus={() => {
                  setIsSuggestionsDismissed(false);
                }}
                onKeyDown={(event) => {
                  if (!isSuggestionsOpen || liveSuggestions.length === 0) return;
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActiveSuggestionIndex((current) =>
                      current < liveSuggestions.length - 1 ? current + 1 : 0
                    );
                    return;
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveSuggestionIndex((current) =>
                      current <= 0 ? liveSuggestions.length - 1 : current - 1
                    );
                    return;
                  }
                  if (event.key === "Escape") {
                    setIsSuggestionsDismissed(true);
                    setActiveSuggestionIndex(-1);
                    return;
                  }
                  if (event.key === "Enter" && activeSuggestionIndex >= 0) {
                    event.preventDefault();
                    const selected = liveSuggestions[activeSuggestionIndex];
                    if (selected) applySuggestion(selected);
                  }
                }}
                placeholder="Try “drag tonight in Berlin” or a venue name"
                className="w-full rounded-2xl border border-fuchsia-100/24 bg-[linear-gradient(135deg,rgba(11,7,16,0.88),rgba(3,14,20,0.84))] py-3.5 pl-12 pr-4 text-[15px] shadow-[0_14px_40px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.055)] outline-none transition placeholder:text-white/38 focus:border-pink-200/68 focus:bg-black/72 focus:shadow-[0_0_0_3px_rgba(244,114,182,0.11),0_16px_45px_rgba(0,0,0,0.34)]"
              />
              {isSuggestionsOpen && (
                <ul
                  id={SEARCH_SUGGESTIONS_LIST_ID}
                  role="listbox"
                  aria-label="Live search suggestions"
                  className="absolute left-0 right-0 top-[calc(100%+0.55rem)] z-40 rounded-2xl border border-white/12 bg-[#09090bf5] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                >
                  {liveSuggestions.map((suggestion, index) => {
                    const isActive = index === activeSuggestionIndex;
                    return (
                      <li
                        key={suggestion.id}
                        id={`global-search-suggestion-${index}`}
                        role="option"
                        aria-selected={isActive}
                        tabIndex={-1}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          applySuggestion(suggestion);
                        }}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                          isActive
                            ? "bg-cyan-200/16 text-cyan-50"
                            : "text-white/84 hover:bg-white/8 hover:text-white"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate">{suggestion.label}</span>
                          {suggestion.description ? (
                            <span className="mt-0.5 block truncate text-[11px] text-white/48">{suggestion.description}</span>
                          ) : null}
                        </span>
                        <span className="rounded-full border border-white/15 bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/65">
                          {suggestion.typeFilter === "all" ? "Search" : getTypeLabel(suggestion.typeFilter)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <button type="submit" className="w-full rounded-2xl border border-white/42 bg-[linear-gradient(110deg,#d8b4fe_0%,#f9a8d4_38%,#fda4af_68%,#fed7aa_100%)] px-7 py-3.5 text-sm font-semibold text-[#210d22] shadow-[0_15px_42px_rgba(244,114,182,0.30),0_7px_24px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.82)] transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_18px_48px_rgba(244,114,182,0.38)] sm:w-auto">
              Search
            </button>
          </form>
          {!activeQuery.trim() ? (
          <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Popular searches">
            {QUICK_SEARCHES.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => runQuickSearch(item)}
                className="rounded-full border border-fuchsia-200/16 bg-[linear-gradient(135deg,rgba(217,70,239,0.08),rgba(139,92,246,0.06))] px-3 py-1.5 text-xs text-white/72 transition hover:border-fuchsia-200/34 hover:bg-fuchsia-200/12 hover:text-white"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={useNearbySearch}
              disabled={locationStatus === "requesting"}
              className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/28 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(16,185,129,0.08))] px-3 py-1.5 text-xs text-cyan-50 shadow-[0_8px_24px_rgba(34,211,238,0.08)] transition hover:border-cyan-100/46 hover:bg-cyan-200/18 disabled:cursor-wait disabled:opacity-60"
            >
              <LocateFixed size={13} />
              {locationStatus === "requesting" ? "Finding you…" : "Near me"}
            </button>
          </div>
          ) : null}
          {(locationStatus === "denied" || locationStatus === "unsupported") &&
            (!activeQuery.trim() || intentProfile.flags?.nearby) && (
            <p className="mt-2 text-xs text-amber-100/78">
              {locationStatus === "unsupported"
                ? "Location is not available in this browser. Search by city instead."
                : "Location was not shared. Search by city instead, or allow location and try again."}
            </p>
          )}
          {activeQuery.trim() ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
            <div className="flex flex-wrap gap-2" aria-label="Result type">
                {TYPE_FILTERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTypeFilter(item)}
                    aria-pressed={typeFilter === item}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      typeFilter === item
                        ? TYPE_FILTER_TONES[item]
                        : `${TYPE_FILTER_IDLE_TONES[item]} text-white/68 hover:text-white`
                    }`}
                  >
                    {item === "all" ? "All" : getTypeLabel(item, { plural: true })}
                  </button>
                ))}
            </div>
            <button
              type="button"
              onClick={() => setIsFiltersOpen((current) => !current)}
              aria-expanded={isFiltersOpen}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),rgba(139,92,246,0.08))] px-3 py-1.5 text-xs text-cyan-50/78 transition hover:border-cyan-200/36 hover:text-white"
            >
              <SlidersHorizontal size={14} />
              Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
              <ChevronDown size={13} className={`transition ${isFiltersOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
          ) : null}

          {activeQuery.trim() && (searchMeta.cityMatch === "corrected" || intentProfile.flags?.tonight || intentProfile.flags?.safe || hasIdentityIntent) ? (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-cyan-50/72" aria-live="polite">
              {searchMeta.cityMatch === "corrected" && searchMeta.city ? <span>Showing results for {searchMeta.city}.</span> : null}
              {intentProfile.flags?.tonight && searchMeta.city ? <span>Tonight follows local time in {searchMeta.city}.</span> : null}
              {(intentProfile.flags?.safe || hasIdentityIntent) ? <span>Available safety and inclusion context is included in the match.</span> : null}
            </div>
          ) : null}

          {activeQuery.trim() && isFiltersOpen && (
          <div className="mt-3 grid grid-cols-1 gap-2 rounded-2xl border border-violet-200/14 bg-[linear-gradient(135deg,rgba(50,25,70,0.26),rgba(3,17,24,0.42))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:grid-cols-3 sm:gap-3">

            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">City</p>
              <label htmlFor="search-city-filter" className="sr-only">
                Filter by city
              </label>
              <select
                id="search-city-filter"
                value={cityFilter}
                onChange={(event) => setCityFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm outline-none"
              >
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city === "all" ? "All cities" : city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Vibe</p>
              <label htmlFor="search-vibe-filter" className="sr-only">
                Filter by vibe
              </label>
              <select
                id="search-vibe-filter"
                value={vibeFilter}
                onChange={(event) => setVibeFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm outline-none"
              >
                {vibeOptions.map((vibe) => (
                  <option key={vibe.value} value={vibe.value}>
                    {vibe.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Information</p>
              <label htmlFor="search-quality-filter" className="sr-only">
                Filter by quality
              </label>
              <select
                id="search-quality-filter"
                value={qualityFilter}
                onChange={(event) => setQualityFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm outline-none"
              >
                {QUALITY_FILTERS.map((quality) => (
                  <option key={quality} value={quality}>
                    {quality === "all"
                      ? "All information"
                      : quality === "verified"
                        ? "Recently checked"
                        : "Needs a current check"}
                  </option>
                ))}
              </select>
            </div>
          </div>
          )}
          <p id={SEARCH_SUMMARY_STATUS_ID} role="status" aria-live="polite" className="sr-only">
            {filteredResults.all.length} matches, {filteredResults.cities.length} cities, {filteredResults.places.length} venues, {filteredResults.events.length} events, {filteredResults.services.length} services, {filteredResults.guides.length} guides
          </p>
          {isLoading && (
            <div className="mt-3 max-w-sm animate-pulse" aria-hidden="true">
              <div className="h-3 w-44 rounded-full bg-white/12" />
            </div>
          )}
          {loadError && (
            <div className="mt-2 rounded-xl border border-rose-300/20 bg-rose-300/8 px-3 py-2 text-xs text-rose-100">
              <p>{loadError}</p>
              <button
                type="button"
                onClick={() => setSearchRetryNonce((current) => current + 1)}
                className="mt-2 rounded-full border border-rose-200/25 bg-rose-200/10 px-3 py-1 text-[11px] text-rose-100 transition hover:border-rose-200/40"
              >
                Retry
              </button>
            </div>
          )}
        </section>

        {!activeQuery.trim() && recentSearches.length > 0 ? (
          <section aria-labelledby="recent-searches-heading" className="mb-5 flex flex-wrap items-center gap-2 px-1">
            <p id="recent-searches-heading" className="mr-1 text-[11px] uppercase tracking-[0.16em] text-white/44">
              Recent
            </p>
            {recentSearches.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => runQuickSearch({ query: item, type: "all" })}
                className="rounded-full border border-white/12 bg-white/[0.045] px-3 py-1.5 text-xs text-white/70 transition hover:border-cyan-200/28 hover:text-white"
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setRecentSearches([]);
                writeLocalJson(RECENT_SEARCHES_STORAGE_KEY, []);
              }}
              className="ml-auto px-2 py-1 text-[11px] text-white/42 transition hover:text-white/72"
            >
              Clear
            </button>
          </section>
        ) : null}

        {activeQuery.trim() && showSearchMap ? (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-violet-200/20 bg-[linear-gradient(120deg,rgba(236,72,153,0.10),rgba(139,92,246,0.11),rgba(6,182,212,0.10))] p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.055)] xl:hidden">
            <p className="pl-2 text-xs text-white/56">View results</p>
            <div className="grid grid-cols-2 rounded-xl border border-white/10 bg-black/35 p-1" aria-label="Result view">
              <button
                type="button"
                onClick={() => setMobileView("list")}
                aria-pressed={mobileView === "list"}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  mobileView === "list" ? "bg-fuchsia-200/16 text-fuchsia-50 shadow-sm" : "text-white/52"
                }`}
              >
                <List size={14} /> List
              </button>
              <button
                type="button"
                onClick={() => setMobileView("map")}
                aria-pressed={mobileView === "map"}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  mobileView === "map" ? "bg-cyan-200/18 text-cyan-50 shadow-sm" : "text-white/52"
                }`}
              >
                <Map size={14} /> Map
              </button>
            </div>
          </div>
        ) : null}

        {activeQuery.trim() && showSearchMap && mobileView === "map" ? (
          <section aria-labelledby="mobile-search-map-heading" className="mb-5 overflow-hidden rounded-[24px] border border-cyan-300/16 bg-[#080c12] xl:hidden">
            <div className="border-b border-white/10 px-4 py-3">
              <h2 id="mobile-search-map-heading" className="text-sm font-semibold text-white">Results on the map</h2>
              <p className="mt-1 text-xs text-white/58">Showing the locations that match this search.</p>
            </div>
            <div className="h-[min(62vh,32rem)] min-h-[22rem] w-full bg-black/40">
              <div ref={mobileSearchMapContainerRef} className="h-full w-full" />
            </div>
            {searchMapError ? <p className="border-t border-white/10 px-4 py-3 text-xs text-rose-200">{searchMapError}</p> : null}
          </section>
        ) : null}

        <div
          ref={resultsSectionRef}
          className={`grid items-start gap-6 ${showSearchMap ? "xl:grid-cols-[minmax(0,1fr)_24rem]" : "grid-cols-1"}`}
        >
          <div className={mobileView === "map" && showSearchMap ? "hidden xl:block" : ""}>
        {activeQuery.trim() && (
          <section aria-labelledby="search-results-heading" className="relative mb-4 overflow-hidden rounded-[20px] border border-violet-200/22 bg-[radial-gradient(circle_at_0%_0%,rgba(244,114,182,0.18),transparent_34%),radial-gradient(circle_at_100%_100%,rgba(34,211,238,0.10),transparent_32%),linear-gradient(145deg,rgba(24,15,34,0.96),rgba(5,15,22,0.98))] px-4 py-3 shadow-[0_18px_55px_rgba(0,0,0,0.27),inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div aria-hidden="true" className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-pink-300/55 via-violet-300/38 to-cyan-300/55" />
            <p className="text-[11px] uppercase tracking-[0.16em] text-pink-100/72">Your search</p>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
              <h2 id="search-results-heading" className="text-lg font-semibold text-white">
                Results for &ldquo;{activeQuery.trim()}&rdquo;
              </h2>
              <p className="text-xs text-white/72">
                {filteredResults.all.length} results · {filteredResults.cities.length} cities · {filteredResults.places.length} venues · {filteredResults.events.length} events · {filteredResults.services.length} services · {filteredResults.guides.length} guides
              </p>
            </div>
          </section>
        )}
        {!activeQuery.trim() && (
          <section className="qa-panel rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.95),rgba(10,10,10,0.99))] p-4 sm:rounded-[28px] sm:p-6">
            <EmptyState
              title="Start with a city, venue or plan."
              description="Search by name, choose what you’re looking for, or use Near me to explore queer places around you."
              primaryActionLabel="Browse cities"
              onPrimaryAction={() => router.push("/cities")}
            />
          </section>
        )}

        {activeQuery.trim() && isLoading && (
          <section className="qa-panel mb-6 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.95),rgba(10,10,10,0.99))] p-5">
            <p className="mb-4 text-xs uppercase tracking-[0.18em] text-white/45">Scanning atlas signal</p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <SearchResultSkeleton tone="cyan" />
              <SearchResultSkeleton tone="rose" />
              <SearchResultSkeleton tone="violet" />
              <SearchResultSkeleton tone="rose" />
              <SearchResultSkeleton tone="violet" />
              <SearchResultSkeleton tone="cyan" />
            </div>
          </section>
        )}

        {activeQuery.trim() && !isLoading && filteredResults.all.length === 0 && (
          <section className="qa-panel rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.95),rgba(10,10,10,0.99))] p-5 sm:rounded-[28px] sm:p-8">
            <EmptyState
              title={intentProfile.flags?.nearby && !userLocation ? "Share your location only when you’re ready." : "Nothing exact yet — let’s widen the search."}
              description={
                intentProfile.flags?.nearby && !userLocation
                  ? "Queer Atlas uses your position only to sort nearby results. You can search by city instead."
                  : activeFilterCount > 0 || typeFilter !== "all"
                    ? "Your search has filters applied. Remove them first, or try a broader route below."
                    : "Try a city, browse the atlas, or tell us what is missing."
              }
            >
              <div className="flex flex-wrap justify-center gap-2">
                {intentProfile.flags?.nearby && !userLocation ? (
                  <button
                    type="button"
                    onClick={useNearbySearch}
                    disabled={locationStatus === "requesting"}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-200/12 px-4 py-2 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-200/18 disabled:opacity-60"
                  >
                    <LocateFixed size={14} /> {locationStatus === "requesting" ? "Finding you…" : "Use my location"}
                  </button>
                ) : null}
                {activeFilterCount > 0 || typeFilter !== "all" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTypeFilter("all");
                      setCityFilter("all");
                      setVibeFilter("all");
                      setQualityFilter("all");
                    }}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/72 transition hover:border-white/25 hover:text-white"
                  >
                    Remove filters
                  </button>
                ) : null}
                {intentProfile.detectedCity ? (
                  <Link href={cityPath(intentProfile.detectedCity)} className="rounded-full border border-fuchsia-200/24 bg-fuchsia-200/10 px-4 py-2 text-xs font-semibold text-fuchsia-50 transition hover:bg-fuchsia-200/16">
                    Open {intentProfile.detectedCity}
                  </Link>
                ) : (
                  <Link href="/cities" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/72 transition hover:border-white/25 hover:text-white">
                    Browse cities
                  </Link>
                )}
                <Link href="/contribute" className="rounded-full border border-white/12 px-4 py-2 text-xs text-white/58 transition hover:text-white">
                  Add what’s missing
                </Link>
              </div>
            </EmptyState>
          </section>
        )}

        {activeQuery.trim() && !isLoading && topMatches.length > 0 && (
          <section aria-labelledby="search-top-matches-heading" className="mb-6 rounded-[28px] border border-cyan-100/22 bg-[radial-gradient(circle_at_100%_0%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_0%_15%,rgba(244,114,182,0.14),transparent_31%),radial-gradient(circle_at_56%_100%,rgba(139,92,246,0.10),transparent_34%),linear-gradient(160deg,rgba(10,33,43,0.84),rgba(10,7,16,0.99))] p-4 shadow-[0_24px_74px_rgba(0,0,0,0.32),0_12px_42px_rgba(34,211,238,0.05),inset_0_1px_0_rgba(255,255,255,0.065)] sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/70">A quick place to start</p>
                <h2 id="search-top-matches-heading" className="mt-1 text-lg font-semibold text-cyan-100">Best matches</h2>
              </div>
              <p className="hidden text-[11px] text-cyan-100/72 sm:block">Closest to what you searched for</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {topMatches.map((item, index) => {
                const isCity = item.type === "city";
                const tone = getTypeTheme(item.type);

                return (
                  <article
                    key={`top-${item.type}-${item.id}`}
                    className={`relative overflow-hidden rounded-2xl border p-4 text-left shadow-[0_16px_38px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.055)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_46px_rgba(0,0,0,0.30)] ${tone.shell}`}
                  >
                    <div aria-hidden="true" className={`pointer-events-none absolute -right-9 -top-9 h-28 w-28 rounded-full blur-3xl ${CARD_GLOW_TONES[index % CARD_GLOW_TONES.length]}`} />
                    <div className={`relative mb-3 h-1.5 w-20 rounded-full bg-gradient-to-r ${CARD_ACCENT_TONES[index % CARD_ACCENT_TONES.length]}`} />
                    <div className="flex items-center justify-between gap-3">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] ${tone.label}`}>
                        {getTypeLabel(item.type)}
                      </span>
                    </div>
                    <p className="mt-2 text-base font-semibold text-white">
                      {item.type === "city" ? item.title : item.name}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/50">
                      {item.type === "city"
                        ? item.country
                        : item.type === "guide"
                          ? item.kind || "Guide"
                          : `${item.city} · ${getTypeLabel(item.type)}`}
                    </p>
                    <p className={`mt-2 text-[11px] ${tone.text}`}>
                      {getMatchReason(item, activeQuery)}
                    </p>
                    {item.type !== "guide" ? (
                      <VibeTagChips entity={item} tone={tone.chipTone} className="mt-2" includeTypeFallback includeMixedFallback />
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Link
                        href={getResultHref(item)}
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${tone.action}`}
                      >
                        View {getTypeLabel(item.type).toLowerCase()}
                      </Link>
                      {item.type !== "city" && item.type !== "guide" && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openCityFromItem(item);
                          }}
                          className={PLAN_ACTION_CLASS}
                        >
                          Explore {item.city || "city"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {sectionOrder.map((section) => (
          <section
            key={section.key}
            aria-labelledby={`search-section-${section.key}-heading`}
            className={`mb-6 rounded-[28px] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-5 ${getTypeTheme(section.key).shell}`}
          >
            <h2
              id={`search-section-${section.key}-heading`}
              className={`mb-4 text-lg font-semibold ${getTypeTheme(section.key).text}`}
            >
              <span className="flex items-center justify-between gap-3">
                <span>{section.label}</span>
                <span className="rounded-full border border-white/14 bg-white/8 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/68">
                  {section.items.length} {section.items.length === 1 ? "result" : "results"}
                </span>
              </span>
            </h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {section.key === "city" &&
                section.items.map((city) => (
                  <Link
                    key={city.id}
                    href={getResultHref(city)}
                    className="rounded-2xl border border-cyan-200/14 bg-[linear-gradient(155deg,rgba(14,55,72,0.34),rgba(5,7,12,0.94))] p-3 text-left shadow-[0_14px_34px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:border-cyan-200/34 sm:p-4"
                  >
                    <div className="mb-2 h-1.5 w-16 rounded-full bg-gradient-to-r from-cyan-200 via-sky-200 to-transparent" />
                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">{city.country}</p>
                    <p className="mt-1 text-base font-semibold">{city.title}</p>
                    <p className="mt-1 text-[11px] text-cyan-100/80">{getMatchReason(city, activeQuery)}</p>
                    <VibeTagChips entity={city} tone="cyan" className="mt-2" includeMixedFallback />
                  </Link>
                ))}

              {section.key === "place" &&
                section.items.map((place, index) => {
                const qualityStatus = getQualityStatus(
                  getEntityQuality({
                    targetType: "place",
                    targetId: place.id,
                    entity: place,
                    map: qualityMap,
                  })
                );
                return (
                  <article
                    key={place.id}
                    className="relative overflow-hidden rounded-2xl border border-rose-300/22 bg-[radial-gradient(circle_at_100%_0%,rgba(244,114,182,0.13),transparent_38%),linear-gradient(160deg,rgba(76,21,53,0.42),rgba(8,8,13,0.98))] p-3 text-left shadow-[0_15px_36px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:border-rose-200/46 hover:shadow-[0_20px_44px_rgba(0,0,0,0.28)] sm:p-4"
                  >
                    <div aria-hidden="true" className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl ${CARD_GLOW_TONES[index % CARD_GLOW_TONES.length]}`} />
                    <div className={`relative mb-2 h-1.5 w-16 rounded-full bg-gradient-to-r ${CARD_ACCENT_TONES[index % CARD_ACCENT_TONES.length]}`} />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{place.name}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/45">{place.city} | {place.type}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] ${getQualityPillClass(qualityStatus.label)}`}>
                        {qualityStatus.label}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-rose-100/80">{getMatchReason(place, activeQuery)}</p>
                    {place.description ? (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/62">{place.description}</p>
                    ) : null}
                    <VibeTagChips entity={place} tone="rose" className="mt-2" includeTypeFallback includeMixedFallback />
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Link
                        href={getResultHref(place)}
                        className="rounded-full border border-rose-200/34 bg-rose-200/14 px-3 py-1 text-[11px] font-semibold text-rose-50 transition hover:border-rose-200/52 hover:bg-rose-200/22"
                      >
                        View venue
                      </Link>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openCityFromItem(place);
                        }}
                        className={PLAN_ACTION_CLASS}
                      >
                        Explore {place.city}
                      </button>
                    </div>
                  </article>
                );
              })}

              {section.key === "event" &&
                section.items.map((event) => {
                const qualityStatus = getQualityStatus(
                  getEntityQuality({
                    targetType: "event",
                    targetId: event.id,
                    entity: event,
                    map: qualityMap,
                  })
                );
                return (
                  <article
                    key={event.id}
                    className="rounded-2xl border border-violet-300/18 bg-[radial-gradient(circle_at_100%_0%,rgba(167,139,250,0.10),transparent_38%),linear-gradient(160deg,rgba(52,24,92,0.38),rgba(8,8,11,0.98))] p-3 text-left shadow-[0_14px_34px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:border-violet-200/40 sm:p-4"
                  >
                    <div className="mb-2 h-1.5 w-16 rounded-full bg-gradient-to-r from-violet-200 via-fuchsia-200 to-transparent" />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{event.name}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/45">{event.city} | Event</p>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] ${getQualityPillClass(qualityStatus.label)}`}>
                        {qualityStatus.label}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-violet-100/80">{getMatchReason(event, activeQuery)}</p>
                    {event.description ? (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/62">{event.description}</p>
                    ) : null}
                    <VibeTagChips entity={event} tone="violet" className="mt-2" includeMixedFallback />
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Link
                        href={getResultHref(event)}
                        className="rounded-full border border-violet-200/34 bg-violet-200/14 px-3 py-1 text-[11px] font-semibold text-violet-50 transition hover:border-violet-200/52 hover:bg-violet-200/22"
                      >
                        View event
                      </Link>
                      <button
                        type="button"
                        onClick={(itemEvent) => {
                          itemEvent.stopPropagation();
                          openCityFromItem(event);
                        }}
                        className={PLAN_ACTION_CLASS}
                      >
                        Explore {event.city}
                      </button>
                    </div>
                  </article>
                );
              })}

              {section.key === "service" &&
                section.items.map((service) => {
                  const qualityStatus = getQualityStatus(
                    getEntityQuality({
                      targetType: "service",
                      targetId: service.id,
                      entity: service,
                      map: qualityMap,
                    })
                  );
                  return (
                    <article
                      key={service.id}
                      className="rounded-2xl border border-emerald-300/18 bg-[radial-gradient(circle_at_100%_0%,rgba(52,211,153,0.10),transparent_38%),linear-gradient(160deg,rgba(18,76,60,0.38),rgba(8,8,11,0.98))] p-3 text-left shadow-[0_14px_34px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:border-emerald-200/40 sm:p-4"
                    >
                      <div className="mb-2 h-1.5 w-16 rounded-full bg-gradient-to-r from-emerald-200 via-cyan-200 to-transparent" />
                      <p className="text-sm font-semibold">{service.name}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-xs uppercase tracking-[0.16em] text-white/45">
                          {service.city} · {service.serviceType || "Service"}
                        </p>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] ${getQualityPillClass(qualityStatus.label)}`}>
                          {qualityStatus.label}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-emerald-100/80">{getMatchReason(service, activeQuery)}</p>
                      {service.description ? (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/62">{service.description}</p>
                      ) : null}
                      <VibeTagChips entity={service} tone="emerald" className="mt-2" includeTypeFallback />
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Link
                          href={getResultHref(service)}
                          className="rounded-full border border-emerald-200/34 bg-emerald-200/14 px-3 py-1 text-[11px] font-semibold text-emerald-50 transition hover:border-emerald-200/52 hover:bg-emerald-200/22"
                        >
                          View service
                        </Link>
                        <button type="button" onClick={() => openCityFromItem(service)} className={PLAN_ACTION_CLASS}>
                          Explore {service.city}
                        </button>
                      </div>
                    </article>
                  );
                })}

              {section.key === "guide" &&
                section.items.map((guide) => (
                  <Link
                    key={guide.id}
                    href={getResultHref(guide)}
                    className="rounded-2xl border border-amber-300/18 bg-[radial-gradient(circle_at_100%_0%,rgba(251,191,36,0.10),transparent_38%),linear-gradient(160deg,rgba(91,55,15,0.38),rgba(8,8,11,0.98))] p-3 text-left shadow-[0_14px_34px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:border-amber-200/40 sm:p-4"
                  >
                    <div className="mb-2 h-1.5 w-16 rounded-full bg-gradient-to-r from-amber-200 via-orange-200 to-transparent" />
                    <p className="text-[11px] uppercase tracking-[0.16em] text-amber-100/64">{guide.kind || "Guide"}</p>
                    <p className="mt-1 text-sm font-semibold">{guide.title}</p>
                    {guide.summary ? (
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-white/62">{guide.summary}</p>
                    ) : null}
                    <p className="mt-3 text-[11px] font-semibold text-amber-100">Read guide →</p>
                  </Link>
                ))}
            </div>
          </section>
        ))}
          </div>

          {showSearchMap ? (
          <aside className="hidden xl:block">
            <section aria-labelledby="search-map-heading" className="sticky top-6 overflow-hidden rounded-[28px] border border-cyan-200/20 bg-[radial-gradient(circle_at_100%_0%,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_0%_0%,rgba(139,92,246,0.12),transparent_32%),linear-gradient(165deg,rgba(10,29,43,0.96),rgba(5,7,14,0.99))] shadow-[0_28px_80px_rgba(0,0,0,0.46),inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="border-b border-white/10 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/75">Search map</p>
                <h3 id="search-map-heading" className="mt-1 text-base font-semibold text-white">See results on the map</h3>
                <p className="mt-2 text-xs text-white/62">
                  The map follows your current search and filters.
                </p>
              </div>
              <div className="h-[27rem] w-full bg-black/40">
                {shouldShowDesktopMap ? (
                  <div ref={searchMapContainerRef} className="h-full w-full" />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/60">
                    Search for a city or place to see matching locations.
                  </div>
                )}
              </div>
              <div className="border-t border-white/10 px-4 py-3">
                {searchMapError ? (
                  <p className="text-xs text-rose-200">{searchMapError}</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">Results by city</p>
                    <div className="space-y-1.5">
                      {hotspotRows.length > 0 ? (
                        hotspotRows.map((row) => (
                          <div key={row.city} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs">
                            <span className="text-white/78">{row.city}</span>
                            <span className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-cyan-100">
                              {row.count}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-white/55">No hotspots yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </aside>
          ) : null}
        </div>
      </div>
    </main>
  );
}




