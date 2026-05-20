"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePlaces } from "@/lib/usePlaces";
import { mergeSeedEventsAsync } from "@/lib/seedMerge";
import { buildAtlasSearchResults } from "@/lib/search";
import { inferSearchIntent } from "@/lib/searchIntent";
import { buildLiveSearchSuggestions } from "@/lib/searchSuggestions";
import { cityCoreConfig as cityConfig } from "@/lib/cityCore";
import { useMapboxStylesheet } from "@/lib/useMapboxStylesheet";
import { evaluateMapInitReadiness } from "@/lib/mapInitGuard";
import { loadMapboxGl } from "@/lib/mapboxGlLoader";
import { getEntityQuality, getQualityMap, getQualityStatus } from "@/lib/quality";
import { cityPath, citySelectionPath } from "@/lib/cityRouting";
import { trackKpiEvent } from "@/lib/analytics";
import { formatVibeTagLabel, normalizeVibeTag } from "@/lib/vibeTaxonomy";
import { resolveVibeTagsForEntity } from "@/lib/vibeDisplay";
import VibeTagChips from "@/components/ui/VibeTagChips";
import EmptyState from "@/components/ui/EmptyState";

const TYPE_FILTERS = ["all", "city", "place", "event"];
const QUALITY_FILTERS = ["all", "verified", "needs_refresh", "unverified"];
const SEARCH_MAP_SOURCE_ID = "qa-search-source";
const SEARCH_MAP_CLUSTER_LAYER_ID = "qa-search-clusters";
const SEARCH_MAP_CLUSTER_COUNT_LAYER_ID = "qa-search-cluster-count";
const SEARCH_MAP_POINT_LAYER_ID = "qa-search-points";
const SEARCH_MAP_MAX_POINTS = 96;
const SEARCH_EVENT_SELECT_COLUMNS = [
  "id",
  "name",
  "city",
  "description",
  "link",
  "date",
  "start_date",
  "end_date",
  "location",
  "lat",
  "lng",
  "vibe",
  "vibe_tags",
].join(",");
const SEARCH_INPUT_ID = "global-search-input";
const SEARCH_SUGGESTIONS_LIST_ID = "global-search-suggestions-list";
const SEARCH_SUMMARY_STATUS_ID = "global-search-summary-status";
const PLAN_ACTION_CLASS =
  "rounded-full border border-cyan-200/30 bg-cyan-200/12 px-3 py-1 text-[11px] font-semibold text-cyan-50 transition hover:border-cyan-200/48 hover:bg-cyan-200/20";
const EMPTY_FEATURE_COLLECTION = { type: "FeatureCollection", features: [] };
function normalizeValue(value) {
  return String(value || "").trim().toLowerCase();
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

function getMatchReason(item = {}, query = "") {
  const needle = normalizeValue(query);
  const name = normalizeValue(getItemDisplayName(item));
  if (!needle || !name) return "Matched by relevance";
  if (name === needle) return "Exact name match";
  if (name.startsWith(needle)) return "Name starts with your query";
  if (name.includes(` ${needle}`)) return "Strong word-level match";
  if (name.includes(needle)) return "Name contains your query";
  return "Matched by city, vibe, and quality signal";
}

function getQualityPillClass(label = "") {
  if (label === "Verified") return "border-emerald-200/24 bg-emerald-200/12 text-emerald-100";
  if (label === "Needs refresh") return "border-amber-200/24 bg-amber-200/12 text-amber-100";
  return "border-white/14 bg-white/6 text-white/65";
}

function getTypeTheme(type = "") {
  if (type === "event") {
    return {
      shell: "border-violet-300/18 bg-[linear-gradient(155deg,rgba(72,38,122,0.34),rgba(10,10,10,0.98))] hover:border-violet-200/40",
      label: "border-violet-200/34 bg-violet-200/14 text-violet-50",
      accent: "bg-gradient-to-r from-violet-200 via-fuchsia-200 to-transparent",
      text: "text-violet-100/82",
      chipTone: "violet",
    };
  }
  if (type === "place") {
    return {
      shell: "border-rose-300/18 bg-[linear-gradient(155deg,rgba(104,32,72,0.34),rgba(10,10,10,0.98))] hover:border-rose-200/40",
      label: "border-rose-200/34 bg-rose-200/14 text-rose-50",
      accent: "bg-gradient-to-r from-rose-200 via-fuchsia-200 to-transparent",
      text: "text-rose-100/82",
      chipTone: "rose",
    };
  }
  return {
    shell: "border-cyan-300/18 bg-[linear-gradient(155deg,rgba(24,74,104,0.34),rgba(10,10,10,0.98))] hover:border-cyan-200/40",
    label: "border-cyan-200/34 bg-cyan-200/14 text-cyan-50",
    accent: "bg-gradient-to-r from-cyan-200 via-sky-200 to-transparent",
    text: "text-cyan-100/82",
    chipTone: "cyan",
  };
}

function toFiniteNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
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
  const [query, setQuery] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search || "");
    return String(params.get("q") || "");
  });
  const [events, setEvents] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [vibeFilter, setVibeFilter] = useState("all");
  const [qualityFilter, setQualityFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSuggestionsDismissed, setIsSuggestionsDismissed] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [searchMapError, setSearchMapError] = useState("");
  const [isDesktopSplit, setIsDesktopSplit] = useState(false);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const isMapboxStylesReady = useMapboxStylesheet();
  const searchMapContainerRef = useRef(null);
  const searchMapRef = useRef(null);
  const searchMapboxRef = useRef(null);
  const searchMapLoadedRef = useRef(false);
  const resultsSectionRef = useRef(null);
  const pendingResultsScrollRef = useRef(false);
  const { places } = usePlaces();
  const activeQuery = hasHydrated ? query : "";
  const deferredQuery = useDeferredValue(activeQuery);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    const { data, error } = await supabase
      .from("events")
      .select(SEARCH_EVENT_SELECT_COLUMNS)
      .order("date", { ascending: true });

    if (error) {
      setLoadError("Search index is partially unavailable.");
    }

    setEvents(await mergeSeedEventsAsync(data || []));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchEvents();
    });
  }, [fetchEvents]);

  useEffect(() => {
    if (!deferredQuery.trim()) return;
    trackKpiEvent("search_opened", {
      targetType: "search",
      targetId: deferredQuery.trim().toLowerCase(),
    });
  }, [deferredQuery]);

  const qualityMap = getQualityMap();
  const intentProfile = useMemo(() => inferSearchIntent(deferredQuery), [deferredQuery]);
  const liveSuggestions = useMemo(
    () => buildLiveSearchSuggestions({ query, intentProfile }),
    [intentProfile, query]
  );
  const isSuggestionsOpen =
    !isSuggestionsDismissed && query.trim().length >= 2 && liveSuggestions.length > 0;
  const activeSuggestionId =
    isSuggestionsOpen && activeSuggestionIndex >= 0
      ? `global-search-suggestion-${activeSuggestionIndex}`
      : undefined;
  const effectiveTypeFilter = typeFilter === "all" ? intentProfile.suggestedTypeFilter : typeFilter;
  const effectiveQualityFilter =
    qualityFilter === "all" ? intentProfile.suggestedQualityFilter : qualityFilter;
  const rankingPreferredCity =
    cityFilter === "all" ? String(intentProfile.detectedCity || "") : cityFilter;

  const results = useMemo(
    () =>
      buildAtlasSearchResults({
        query: deferredQuery,
        places,
        events,
        cityLimit: 50,
        placeLimit: 180,
        eventLimit: 180,
        qualityMap,
        preferredCity: rankingPreferredCity,
        intentProfile,
      }),
    [deferredQuery, events, intentProfile, places, qualityMap, rankingPreferredCity]
  );

  const cityOptions = useMemo(() => {
    const configCities = Object.values(cityConfig)
      .map((city) => city.title?.replace(/^Queer\s+/i, "").trim())
      .filter(Boolean);
    const placeCities = places.map((item) => item.city || "").filter(Boolean);
    const eventCities = events.map((item) => item.city || "").filter(Boolean);

    return ["all", ...new Set([...configCities, ...placeCities, ...eventCities])].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [events, places]);

  const vibeOptions = useMemo(() => {
    const configVibeTags = Object.values(cityConfig)
      .map((city) => normalizeVibeTag(city.vibe || ""))
      .filter(Boolean);
    const placeVibeTags = places.flatMap((item) => resolveItemVibeTags(item));
    const eventVibeTags = events.flatMap((item) => resolveItemVibeTags(item));
    const keys = [...new Set([...configVibeTags, ...placeVibeTags, ...eventVibeTags])].sort((a, b) =>
      String(formatVibeTagLabel(a) || a).localeCompare(String(formatVibeTagLabel(b) || b))
    );
    return [
      { value: "all", label: "All vibes" },
      ...keys.map((key) => ({ value: key, label: formatVibeTagLabel(key) || key })),
    ];
  }, [events, places]);

  const filteredAll = useMemo(() => {
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

      if (effectiveQualityFilter !== "all" && (item.type === "place" || item.type === "event")) {
        const quality = getEntityQuality({
          targetType: item.type,
          targetId: item.id,
          entity: item,
          map: qualityMap,
        });
        const status = getQualityStatus(quality);
        const key =
          status.label === "Needs refresh"
            ? "needs_refresh"
            : status.label.toLowerCase();

        if (key !== effectiveQualityFilter) return false;
      }

      if (effectiveQualityFilter !== "all" && item.type === "city") return false;

      return true;
    });

    return list.sort((a, b) => b.score - a.score);
  }, [cityFilter, effectiveQualityFilter, effectiveTypeFilter, qualityMap, results.all, vibeFilter]);

  const filteredResults = useMemo(() => {
    const cities = filteredAll.filter((item) => item.type === "city").slice(0, 12);
    const places = filteredAll.filter((item) => item.type === "place").slice(0, 24);
    const events = filteredAll.filter((item) => item.type === "event").slice(0, 24);

    return {
      cities,
      places,
      events,
      all: [...cities, ...places, ...events],
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
  }, [activeQuery, filteredAll, intentProfile?.detectedCity]);
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
  const sectionOrder = useMemo(() => {
    const sections = [
      { key: "city", label: "Cities", tone: "cyan", items: filteredResults.cities },
      { key: "place", label: "Places", tone: "rose", items: filteredResults.places },
      { key: "event", label: "Events", tone: "violet", items: filteredResults.events },
    ];

    return sections
      .filter((section) => section.items.length > 0)
      .sort((a, b) => Number(b.items?.[0]?.score || 0) - Number(a.items?.[0]?.score || 0));
  }, [filteredResults.cities, filteredResults.events, filteredResults.places]);

  const openCityFromItem = useCallback((item) => {
    const cityValue = String(item?.city || item?.name || "").trim();
    if (!cityValue) return;
    router.push(cityPath(cityValue));
  }, [router]);

  const openResult = (item) => {
    if (item.type === "city") {
      router.push(cityPath(item.key || item.id));
      return;
    }

    if (item.type === "place") {
      router.push(citySelectionPath(item.city, { placeId: item.id }));
      return;
    }

    router.push(citySelectionPath(item.city, { eventId: item.id }));
  };

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
    const nextQuery = query.trim();
    if (!nextQuery) return;
    pendingResultsScrollRef.current = true;
    router.replace(`/search?q=${encodeURIComponent(nextQuery)}`, { scroll: false });
  };

  const applySuggestion = useCallback(
    (suggestion) => {
      const nextQuery = String(suggestion?.query || "").trim();
      if (!nextQuery) return;
      setQuery(nextQuery);
      setTypeFilter(String(suggestion?.typeFilter || "all"));
      setCityFilter(String(suggestion?.cityFilter || "all"));
      setVibeFilter("all");
      setQualityFilter(String(suggestion?.qualityFilter || "all"));
      setIsSuggestionsDismissed(true);
      setActiveSuggestionIndex(-1);
      pendingResultsScrollRef.current = true;
      router.replace(`/search?q=${encodeURIComponent(nextQuery)}`, { scroll: false });
    },
    [router]
  );
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
    const media = window.matchMedia("(min-width: 1280px)");
    const apply = () => setIsDesktopSplit(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!shouldShowDesktopMap) {
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
        const mapboxgl = await loadMapboxGl();
        if (cancelled) return;
        const readiness = evaluateMapInitReadiness({
          mapboxgl,
          isMapboxStylesReady,
          mapboxToken,
          container: searchMapContainerRef.current,
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
          container: searchMapContainerRef.current,
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
            const title = String(feature.properties?.title || "Signal");
            const city = String(feature.properties?.city || "Global");
            const signal = String(feature.properties?.score || "");
            new mapboxgl.Popup({ offset: 12, closeButton: false })
              .setLngLat(feature.geometry.coordinates)
              .setHTML(`<div style="font-size:12px;color:#e2e8f0"><strong>${title}</strong><br/>${city} | Signal ${signal}</div>`)
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
  }, [isMapboxStylesReady, mapboxToken, shouldShowDesktopMap]);

  useEffect(() => {
    const map = searchMapRef.current;
    const mapboxgl = searchMapboxRef.current;
    if (!map || !mapboxgl || !searchMapLoadedRef.current) return;
    const source = map.getSource(SEARCH_MAP_SOURCE_ID);
    if (!source) return;
    source.setData(searchMapFeatureCollection);
    if (searchMapPoints.length === 0) return;
    if (searchMapPoints.length === 1) {
      const point = searchMapPoints[0];
      map.easeTo({ center: [point.lng, point.lat], zoom: 10, duration: 700 });
      return;
    }
    const bounds = new mapboxgl.LngLatBounds();
    searchMapPoints.forEach((point) => {
      bounds.extend([point.lng, point.lat]);
    });
    map.fitBounds(bounds, { padding: 48, maxZoom: 11.8, duration: 750 });
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
    <main className="qa-page min-h-screen bg-[#050505] text-white">
      <div className="qa-shell">
        <section
          aria-labelledby="global-search-heading"
          className="qa-panel mb-8 rounded-[32px] border border-white/10 bg-cover bg-center bg-no-repeat p-7"
          style={{
            backgroundImage:
              "linear-gradient(160deg, rgba(6,6,8,0.38), rgba(6,6,8,0.56)), radial-gradient(circle at top left, rgba(244,114,182,0.1), transparent 26%), radial-gradient(circle at 80% 16%, rgba(59,130,246,0.1), transparent 24%), url('/images/explore-global-search.png')",
          }}
        >
          <p className="qa-eyebrow text-white/45">Global search</p>
          <h1 id="global-search-heading" className="qa-display qa-h1 mt-3 text-4xl font-semibold">What are you looking for today?</h1>
          <p className="qa-lead mt-3 max-w-3xl text-white/72">
            Find trusted queer spaces and live city energy in seconds.
          </p>
          <form onSubmit={submitSearch} role="search" aria-label="Global search form" className="mt-5 flex gap-3">
            <div className="relative flex-1">
              <label htmlFor={SEARCH_INPUT_ID} className="sr-only">
                Search for city, venue, event, or vibe
              </label>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} />
              <input
                id={SEARCH_INPUT_ID}
                type="search"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={isSuggestionsOpen}
                aria-controls={SEARCH_SUGGESTIONS_LIST_ID}
                aria-activedescendant={activeSuggestionId}
                aria-describedby={SEARCH_SUMMARY_STATUS_ID}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
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
                placeholder="Search city, venue, event, vibe"
                className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pl-12 pr-4 outline-none focus:border-fuchsia-300/40"
              />
              {isSuggestionsOpen && (
                <ul
                  id={SEARCH_SUGGESTIONS_LIST_ID}
                  role="listbox"
                  aria-label="Live search suggestions"
                  className="absolute left-0 right-0 top-[calc(100%+0.55rem)] z-40 rounded-2xl border border-white/12 bg-[#09090be8] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur"
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
                        <span>{suggestion.label}</span>
                        <span className="rounded-full border border-white/15 bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/65">
                          {suggestion.typeFilter || "all"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <button type="submit" className="rounded-2xl bg-gradient-to-r from-fuchsia-300 via-pink-300 to-orange-200 px-5 py-3 text-sm font-semibold text-black">
              Search
            </button>
          </form>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Type</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {TYPE_FILTERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTypeFilter(item)}
                    aria-pressed={typeFilter === item}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      typeFilter === item
                        ? "border-fuchsia-300/28 bg-fuchsia-300/12 text-fuchsia-100"
                        : "border-white/12 bg-white/5 text-white/65 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {item === "all" ? "All" : item === "city" ? "Cities" : `${item[0].toUpperCase()}${item.slice(1)}s`}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
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

            <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
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

            <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Quality</p>
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
                      ? "All quality"
                      : quality === "needs_refresh"
                        ? "Needs refresh"
                        : quality[0].toUpperCase() + quality.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-3 text-xs text-white/70">
            Try: &ldquo;safe queer nightlife in Berlin&rdquo;, &ldquo;drag shows tonight&rdquo;, &ldquo;quiet queer places&rdquo;
          </p>
          <p id={SEARCH_SUMMARY_STATUS_ID} role="status" aria-live="polite" className="sr-only">
            {filteredResults.all.length} matches, {filteredResults.cities.length} cities, {filteredResults.places.length} places, {filteredResults.events.length} events
          </p>
          {activeQuery.trim() && intentProfile.hasIntent && (
            <div className="mt-3 rounded-xl border border-cyan-200/20 bg-cyan-200/8 px-3 py-2 text-xs text-cyan-100/88">
              <p>
                Intent: {intentProfile.tags.length > 0 ? intentProfile.tags.join(", ") : "general"} | Mode: {effectiveTypeFilter}
                {intentProfile.detectedCity ? ` | City: ${intentProfile.detectedCity}` : ""}
                {effectiveQualityFilter !== "all" ? ` | Quality: ${effectiveQualityFilter}` : ""}
              </p>
            </div>
          )}
          {isLoading && (
            <div className="mt-3 max-w-sm animate-pulse" aria-hidden="true">
              <div className="h-3 w-44 rounded-full bg-white/12" />
            </div>
          )}
          {loadError && (
            <div className="mt-2 rounded-xl border border-rose-300/20 bg-rose-300/8 px-3 py-2 text-xs text-rose-100">
              <p>{loadError}</p>
              <button
                onClick={fetchEvents}
                className="mt-2 rounded-full border border-rose-200/25 bg-rose-200/10 px-3 py-1 text-[11px] text-rose-100 transition hover:border-rose-200/40"
              >
                Retry
              </button>
            </div>
          )}
        </section>

        <div ref={resultsSectionRef} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div>
        {activeQuery.trim() && (
          <section aria-labelledby="search-results-heading" className="mb-4 rounded-[20px] border border-white/12 bg-[linear-gradient(160deg,rgba(14,14,18,0.84),rgba(8,8,12,0.96))] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/56">Results</p>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
              <h2 id="search-results-heading" className="text-lg font-semibold text-white">
                Results for &ldquo;{activeQuery.trim()}&rdquo;
              </h2>
              <p className="text-xs text-white/72">
                {filteredResults.all.length} matches | {filteredResults.cities.length} cities | {filteredResults.places.length} places | {filteredResults.events.length} events
              </p>
            </div>
          </section>
        )}
        {!activeQuery.trim() && (
          <section className="qa-panel rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.95),rgba(10,10,10,0.99))] p-8">
            <EmptyState
              title="Start with a city, venue name, event title, or vibe keyword."
              description="Search across cities, places, and events in one move."
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
          <section className="qa-panel rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.95),rgba(10,10,10,0.99))] p-8">
            <EmptyState
              title="No matches yet for this query."
              description="Try broader words or reset filters."
            >
              <button
                onClick={() => {
                  setTypeFilter("all");
                  setCityFilter("all");
                  setVibeFilter("all");
                  setQualityFilter("all");
                }}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-white/25 hover:text-white"
              >
                Clear filters
              </button>
            </EmptyState>
          </section>
        )}

        {activeQuery.trim() && !isLoading && topMatches.length > 0 && (
          <section aria-labelledby="search-top-matches-heading" className="mb-6 rounded-[28px] border border-cyan-300/12 bg-[linear-gradient(180deg,rgba(18,39,56,0.52),rgba(10,10,10,0.98))] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/70">Discovery lane</p>
                <h2 id="search-top-matches-heading" className="mt-1 text-lg font-semibold text-cyan-100">Top matches</h2>
              </div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/78">Highest relevance right now</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {topMatches.map((item) => {
                const isCity = item.type === "city";
                const tone = getTypeTheme(item.type);

                return (
                  <article
                    key={`top-${item.type}-${item.id}`}
                    className={`rounded-2xl border p-4 text-left transition ${tone.shell}`}
                  >
                    <div className={`mb-3 h-1.5 w-20 rounded-full ${tone.accent}`} />
                    <div className="flex items-center justify-between gap-3">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] ${tone.label}`}>
                        {item.type === "city" ? "City" : item.type === "place" ? "Place" : "Event"}
                      </span>
                      <span className="rounded-full border border-white/14 bg-white/8 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/72">
                        Signal {Math.max(0, Math.round(Number(item.score || 0)))}
                      </span>
                    </div>
                    <p className="mt-2 text-base font-semibold text-white">
                      {item.type === "city" ? item.title : item.name}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/50">
                      {item.type === "city" ? item.country : `${item.city} | ${item.type === "event" ? "Event" : (item.type || "Place")}`}
                    </p>
                    <p className={`mt-2 text-[11px] ${tone.text}`}>
                      {getMatchReason(item, query)}
                    </p>
                    <VibeTagChips entity={item} tone={tone.chipTone} className="mt-2" includeTypeFallback includeMixedFallback />
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openResult(item);
                        }}
                        className="rounded-full border border-cyan-200/34 bg-cyan-200/14 px-3 py-1 text-[11px] font-semibold text-cyan-50 transition hover:border-cyan-200/52 hover:bg-cyan-200/22"
                      >
                        Open
                      </button>
                      {item.type !== "city" && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openCityFromItem(item);
                          }}
                          className={PLAN_ACTION_CLASS}
                        >
                          Plan tonight
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
            className={`mb-6 rounded-[28px] p-4 sm:p-5 ${
              section.key === "city"
                ? "border border-cyan-300/12 bg-[linear-gradient(180deg,rgba(14,37,52,0.60),rgba(10,10,10,0.98))]"
                : section.key === "place"
                  ? "border border-rose-300/12 bg-[linear-gradient(180deg,rgba(56,20,40,0.58),rgba(10,10,10,0.98))]"
                  : "border border-violet-300/12 bg-[linear-gradient(180deg,rgba(43,26,74,0.58),rgba(10,10,10,0.98))]"
            }`}
          >
            <h2
              id={`search-section-${section.key}-heading`}
              className={`mb-4 text-lg font-semibold ${
                section.key === "city"
                  ? "text-cyan-100"
                  : section.key === "place"
                    ? "text-rose-100"
                    : "text-violet-100"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span>{section.label}</span>
                <span className="rounded-full border border-white/14 bg-white/8 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/68">
                  {section.items.length} live
                </span>
              </span>
            </h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {section.key === "city" &&
                section.items.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => openResult(city)}
                    className="rounded-2xl border border-white/10 bg-black/35 p-3 sm:p-4 text-left transition hover:border-cyan-200/30"
                  >
                    <div className="mb-2 h-1.5 w-16 rounded-full bg-gradient-to-r from-cyan-200 via-sky-200 to-transparent" />
                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">{city.country}</p>
                    <p className="mt-1 text-base font-semibold">{city.title}</p>
                    <p className="mt-1 text-[11px] text-cyan-100/80">{getMatchReason(city, query)}</p>
                    <VibeTagChips entity={city} tone="cyan" className="mt-2" includeMixedFallback />
                  </button>
                ))}

              {section.key === "place" &&
                section.items.map((place) => {
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
                    className="rounded-2xl border border-rose-300/16 bg-[linear-gradient(160deg,rgba(64,20,44,0.34),rgba(10,10,10,0.98))] p-3 sm:p-4 text-left transition hover:border-rose-200/34"
                  >
                    <div className="mb-2 h-1.5 w-16 rounded-full bg-gradient-to-r from-rose-200 via-fuchsia-200 to-transparent" />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{place.name}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/45">{place.city} | {place.type}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] ${getQualityPillClass(qualityStatus.label)}`}>
                        {qualityStatus.label}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-rose-100/80">{getMatchReason(place, query)}</p>
                    {place.description ? (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/62">{place.description}</p>
                    ) : null}
                    <VibeTagChips entity={place} tone="rose" className="mt-2" includeTypeFallback includeMixedFallback />
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openResult(place);
                        }}
                        className="rounded-full border border-rose-200/34 bg-rose-200/14 px-3 py-1 text-[11px] font-semibold text-rose-50 transition hover:border-rose-200/52 hover:bg-rose-200/22"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openCityFromItem(place);
                        }}
                        className={PLAN_ACTION_CLASS}
                      >
                        Plan tonight
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
                    className="rounded-2xl border border-violet-300/16 bg-[linear-gradient(160deg,rgba(48,22,86,0.34),rgba(10,10,10,0.98))] p-3 sm:p-4 text-left transition hover:border-violet-200/34"
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
                    <p className="mt-1 text-[11px] text-violet-100/80">{getMatchReason(event, query)}</p>
                    {event.description ? (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/62">{event.description}</p>
                    ) : null}
                    <VibeTagChips entity={event} tone="violet" className="mt-2" includeMixedFallback />
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={(itemEvent) => {
                          itemEvent.stopPropagation();
                          openResult(event);
                        }}
                        className="rounded-full border border-violet-200/34 bg-violet-200/14 px-3 py-1 text-[11px] font-semibold text-violet-50 transition hover:border-violet-200/52 hover:bg-violet-200/22"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={(itemEvent) => {
                          itemEvent.stopPropagation();
                          openCityFromItem(event);
                        }}
                        className={PLAN_ACTION_CLASS}
                      >
                        Plan tonight
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
          </div>

          <aside className="hidden xl:block">
            <section aria-labelledby="search-map-heading" className="sticky top-6 overflow-hidden rounded-[28px] border border-cyan-300/16 bg-[linear-gradient(180deg,rgba(12,26,40,0.9),rgba(6,8,14,0.98))] shadow-[0_28px_80px_rgba(0,0,0,0.42)]">
              <div className="border-b border-white/10 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/75">Live activity map</p>
                <h3 id="search-map-heading" className="mt-1 text-base font-semibold text-white">Explore signal hotspots</h3>
                <p className="mt-2 text-xs text-white/62">
                  Clusters update from current filters and intent.
                </p>
              </div>
              <div className="h-[27rem] w-full bg-black/40">
                {shouldShowDesktopMap ? (
                  <div ref={searchMapContainerRef} className="h-full w-full" />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/60">
                    Type a query to unlock map discovery.
                  </div>
                )}
              </div>
              <div className="border-t border-white/10 px-4 py-3">
                {searchMapError ? (
                  <p className="text-xs text-rose-200">{searchMapError}</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">Hotspots now</p>
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
        </div>
      </div>
    </main>
  );
}




