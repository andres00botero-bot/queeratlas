"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { resolveAdminAccess } from "@/lib/adminAccess";
import { cityCoreConfig as cityConfig } from "@/lib/cityCore";
import { distanceKmBetween } from "@/lib/nearby";
import { buildRightsSnapshotFromProfile, getCityRightsSignals } from "@/lib/cityRightsSignals";
import { evaluateMapInitReadiness, shouldTriggerMapFallback } from "@/lib/mapInitGuard";
import { loadMapboxGl } from "@/lib/mapboxGlLoader";
import { useMapboxStylesheet } from "@/lib/useMapboxStylesheet";
import { usePlaces } from "@/lib/usePlaces";
import { normalizeCityKey } from "@/features/city/checkinFeature";
import { fetchEventsData } from "@/features/events/eventDataApi";
import { isEventVisibleOnCityPage } from "@/features/city/eventRailFeature";
import { useCountryRightsProfiles } from "@/lib/useCountryRightsProfiles";
import { useQariProfiles } from "@/lib/useQariProfiles";
import { QARI_MAP_PALETTE } from "@/lib/qari";
import { listCityClusterTopics } from "@/lib/seo/cityClusters";
import { listTopicHubs } from "@/lib/seo/topicHubs";
import {
  isIndexableTopicHub,
  TIER1_CITY_SLUGS,
  TIER1_TOPIC_KEYS,
} from "@/lib/seo/indexingTier";
import CityRightsSignals from "@/components/cities/CityRightsSignals";
import CountryRightsAdminEditor from "@/components/cities/CountryRightsAdminEditor";
import EmptyState from "@/components/ui/EmptyState";
import BrandMark from "@/components/ui/BrandMark";

const COUNTRY_TONES = [
  {
    section: "border-violet-200/[0.10] bg-[radial-gradient(circle_at_8%_4%,rgba(167,139,250,0.085),transparent_30%),linear-gradient(180deg,rgba(17,18,25,0.97),rgba(9,10,15,0.99))]",
    divider: "from-violet-200/22",
    card: "bg-[radial-gradient(circle_at_8%_0%,rgba(167,139,250,0.07),transparent_30%),linear-gradient(155deg,rgba(255,255,255,0.052),rgba(255,255,255,0.018))]",
    hover: "hover:border-violet-200/22 hover:shadow-[0_25px_72px_rgba(76,56,130,0.18),0_16px_42px_rgba(0,0,0,0.28)]",
    primary: "text-violet-100/90",
    secondary: "text-sky-100/78",
    titleHover: "group-hover:text-violet-50",
    line: "from-violet-200/72 via-sky-200/35",
    arrow: "text-violet-100/68",
  },
  {
    section: "border-teal-100/[0.09] bg-[radial-gradient(circle_at_10%_5%,rgba(94,234,212,0.07),transparent_31%),linear-gradient(180deg,rgba(15,20,23,0.97),rgba(8,11,14,0.99))]",
    divider: "from-teal-100/20",
    card: "bg-[radial-gradient(circle_at_8%_0%,rgba(94,234,212,0.055),transparent_30%),linear-gradient(155deg,rgba(255,255,255,0.05),rgba(255,255,255,0.016))]",
    hover: "hover:border-teal-100/20 hover:shadow-[0_25px_72px_rgba(31,92,87,0.17),0_16px_42px_rgba(0,0,0,0.28)]",
    primary: "text-teal-50/88",
    secondary: "text-violet-100/76",
    titleHover: "group-hover:text-teal-50",
    line: "from-teal-100/68 via-violet-200/32",
    arrow: "text-teal-50/66",
  },
  {
    section: "border-rose-100/[0.09] bg-[radial-gradient(circle_at_9%_4%,rgba(251,207,232,0.065),transparent_30%),linear-gradient(180deg,rgba(21,17,22,0.97),rgba(11,9,14,0.99))]",
    divider: "from-rose-100/20",
    card: "bg-[radial-gradient(circle_at_8%_0%,rgba(251,207,232,0.05),transparent_30%),linear-gradient(155deg,rgba(255,255,255,0.05),rgba(255,255,255,0.016))]",
    hover: "hover:border-rose-100/20 hover:shadow-[0_25px_72px_rgba(105,55,82,0.16),0_16px_42px_rgba(0,0,0,0.28)]",
    primary: "text-rose-50/88",
    secondary: "text-indigo-100/76",
    titleHover: "group-hover:text-rose-50",
    line: "from-rose-100/68 via-indigo-200/32",
    arrow: "text-rose-50/66",
  },
  {
    section: "border-indigo-100/[0.09] bg-[radial-gradient(circle_at_9%_4%,rgba(165,180,252,0.065),transparent_31%),linear-gradient(180deg,rgba(16,18,25,0.97),rgba(8,10,15,0.99))]",
    divider: "from-indigo-100/20",
    card: "bg-[radial-gradient(circle_at_8%_0%,rgba(165,180,252,0.055),transparent_30%),linear-gradient(155deg,rgba(255,255,255,0.05),rgba(255,255,255,0.016))]",
    hover: "hover:border-indigo-100/20 hover:shadow-[0_25px_72px_rgba(51,65,120,0.17),0_16px_42px_rgba(0,0,0,0.28)]",
    primary: "text-indigo-50/88",
    secondary: "text-cyan-100/74",
    titleHover: "group-hover:text-indigo-50",
    line: "from-indigo-100/68 via-cyan-200/30",
    arrow: "text-indigo-50/66",
  },
];

const REGION_COUNTRIES = {
  Europe: new Set(["Albania", "Austria", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Georgia", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Latvia", "Lithuania", "Malta", "Montenegro", "Netherlands", "Norway", "Poland", "Portugal", "Romania", "Russia", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Turkey", "Ukraine", "United Kingdom"]),
  "North & Central America": new Set(["Canada", "Costa Rica", "Cuba", "Dominican Republic", "El Salvador", "Guatemala", "Honduras", "Mexico", "Nicaragua", "Panama", "Puerto Rico", "United States"]),
  "South America": new Set(["Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Paraguay", "Peru", "Uruguay", "Venezuela"]),
  Africa: new Set(["Egypt", "Morocco", "Namibia", "South Africa"]),
  Asia: new Set(["Cambodia", "China", "Hong Kong", "India", "Indonesia", "Israel", "Japan", "Lebanon", "Malaysia", "Philippines", "Singapore", "South Korea", "Taiwan", "Thailand", "Vietnam"]),
  Oceania: new Set(["Australia", "New Zealand"]),
};
const REGION_OPTIONS = ["All regions", ...Object.keys(REGION_COUNTRIES)];

function getCityRegion(country = "") {
  return Object.entries(REGION_COUNTRIES).find(([, countries]) => countries.has(country))?.[0] || "Other";
}

function getCountryTone(country) {
  const value = String(country || "other");
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 100000;
  }

  return COUNTRY_TONES[Math.abs(hash) % COUNTRY_TONES.length];
}

const MAPBOX_COUNTRY_ALIASES = {
  "United States": ["United States", "United States of America", "USA"],
  "United Kingdom": ["United Kingdom", "UK", "Great Britain"],
  "Czech Republic": ["Czech Republic", "Czechia"],
  "Bosnia and Herzegovina": ["Bosnia and Herzegovina", "Bosnia & Herzegovina", "Bosnia-Herzegovina"],
  Netherlands: ["Netherlands", "The Netherlands"],
};
const MAPBOX_COUNTRY_CLICK_OVERRIDES = [
  {
    country: "Taiwan",
    bounds: {
      west: 119.2,
      south: 21.7,
      east: 122.2,
      north: 25.5,
    },
  },
];
const MAP_RISK_PALETTE = QARI_MAP_PALETTE;
const MAP_RISK_TIER_OVERRIDES = {
  Egypt: "restricted",
  Honduras: "restricted",
  Namibia: "caution",
};
const LAST_EXPLORED_CITY_KEY = "qa_last_explored_city";
const BACK_RESTORE_CITY_KEY = "qa_back_restore_city";
const CITIES_CANONICAL_URL = "https://www.queeratlas.app/cities";
const CITY_NAME_COLLATOR = new Intl.Collator("en", {
  sensitivity: "base",
  numeric: true,
});

function subscribeLastExploredCity(callback) {
  if (typeof window === "undefined") return () => {};

  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
  };
}

function getLastExploredCitySnapshot() {
  if (typeof window === "undefined") return "";
  try {
    return String(localStorage.getItem(LAST_EXPLORED_CITY_KEY) || "")
      .trim()
      .toLowerCase();
  } catch {
    return "";
  }
}

function normalizeCountry(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeCitySearchText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getCountryMapboxNames(country) {
  const aliases = MAPBOX_COUNTRY_ALIASES[country] || [];
  return [country, ...aliases];
}

function getSupportedMapboxNames(countries) {
  const unique = new Set();
  countries.forEach((country) => {
    getCountryMapboxNames(country).forEach((name) => unique.add(name));
  });
  return Array.from(unique);
}

function resolveMapboxCountryToAppCountry(mapboxName, countries) {
  const normalized = normalizeCountry(mapboxName);
  if (!normalized) return null;

  for (const country of countries) {
    const normalizedAliases = getCountryMapboxNames(country).map((name) => normalizeCountry(name));
    if (normalizedAliases.includes(normalized)) {
      return country;
    }
  }

  return null;
}

function resolveCoordinateOverrideCountry(lngLat, countries) {
  if (!lngLat) return null;
  const countrySet = new Set(countries);
  const lng = Number(lngLat.lng);
  const lat = Number(lngLat.lat);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;

  const match = MAPBOX_COUNTRY_CLICK_OVERRIDES.find((item) => {
    if (!countrySet.has(item.country)) return false;
    const bounds = item.bounds;
    return lng >= bounds.west && lng <= bounds.east && lat >= bounds.south && lat <= bounds.north;
  });

  return match?.country || null;
}

function normalizeStatusToken(value = "") {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
}

function normalizeSafetyLevel(value = "") {
  const level = normalizeStatusToken(value);
  if (level === "good" || level === "mixed" || level === "risk") return level;
  return "unknown";
}

function normalizeRelationsStatus(value = "") {
  const token = normalizeStatusToken(value);
  if (token === "legal" || token === "restricted" || token === "criminalized") return token;
  return "unknown";
}

function normalizeProtectionStatus(value = "") {
  const token = normalizeStatusToken(value);
  if (token === "full_coverage" || token === "partial_coverage" || token === "limited_or_none") return token;
  return "unknown";
}

function deriveMapRiskTier(profile, snapshot) {
  const legalLevel = normalizeStatusToken(profile?.legal_level || snapshot?.legal?.level || "unknown");
  const rightsLevel = normalizeStatusToken(profile?.rights_level || snapshot?.rights?.level || "unknown");
  const safetyLevel = normalizeSafetyLevel(profile?.safety_level || snapshot?.safety?.level || "unknown");
  const relationsStatus = normalizeRelationsStatus(profile?.same_sex_relations_status || "unknown");
  const protectionStatus = normalizeProtectionStatus(profile?.anti_discrimination_status || "unknown");

  if (relationsStatus === "criminalized") return "restricted";
  if (relationsStatus === "restricted") return "caution";

  if (safetyLevel === "risk" && rightsLevel === "risk") return "caution";
  if (legalLevel === "risk" && rightsLevel === "risk") return "caution";

  if (safetyLevel === "risk") return "watch";
  if (rightsLevel === "risk") return "watch";
  if (protectionStatus === "limited_or_none") return "watch";

  if (legalLevel === "good" && rightsLevel === "good" && safetyLevel === "good") return "open";
  if (legalLevel === "good" && (rightsLevel === "mixed" || safetyLevel === "mixed")) return "steady";
  if (legalLevel === "mixed" && rightsLevel === "mixed" && safetyLevel === "mixed") return "watch";

  if (legalLevel === "unknown" && rightsLevel === "unknown" && safetyLevel === "unknown") return "unknown";
  if (legalLevel === "unknown" || rightsLevel === "unknown" || safetyLevel === "unknown") return "watch";

  return "steady";
}

function createCountryRightsDraft(country, profile = null) {
  return {
    country: String(country || ""),
    legal_level: String(profile?.legal_level || "unknown"),
    rights_level: String(profile?.rights_level || "unknown"),
    safety_level: String(profile?.safety_level || "unknown"),
    same_sex_relations_status: String(profile?.same_sex_relations_status || "unknown"),
    union_status: String(profile?.union_status || "unknown"),
    legal_gender_recognition_status: String(profile?.legal_gender_recognition_status || "unknown"),
    anti_discrimination_status: String(profile?.anti_discrimination_status || "unknown"),
    what_this_means: String(profile?.what_this_means || "").trim(),
    confidence: String(profile?.confidence || "low"),
    source_legal_url: String(profile?.source_legal_url || "").trim(),
    source_rights_url: String(profile?.source_rights_url || "").trim(),
    source_safety_url: String(profile?.source_safety_url || "").trim(),
    needs_manual_review: Boolean(profile?.needs_manual_review),
  };
}

export default function CitiesPage() {
  const router = useRouter();
  const { user, isMember, isLoading: isAuthLoading } = useAuth();
  const isMapboxStylesReady = useMapboxStylesheet();
  const [query, setQuery] = useState("");
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All regions");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [mapError, setMapError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingCountry, setEditingCountry] = useState("");
  const [countryEditorDraft, setCountryEditorDraft] = useState(null);
  const [isSavingCountryProfile, setIsSavingCountryProfile] = useState(false);
  const [countryEditorError, setCountryEditorError] = useState("");
  const [countryEditorSuccess, setCountryEditorSuccess] = useState("");
  const [expandedSafetyCountry, setExpandedSafetyCountry] = useState("");
  const [registryConfig, setRegistryConfig] = useState(cityConfig);
  const [eventsData, setEventsData] = useState([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const mapboxMissing = !mapboxToken;
  const countrySectionRefs = useRef({});
  const cityCardRefs = useRef({});
  const lastCityAutoFocusRef = useRef("");
  const citySearchRef = useRef(null);
  const countryMapContainerRef = useRef(null);
  const countryMapRef = useRef(null);
  const { places, isLoading } = usePlaces();
  const {
    profiles: countryRightsProfiles,
    isLoading: isCountryRightsLoading,
    loadError: countryRightsLoadError,
    refresh: refreshCountryRightsProfiles,
  } = useCountryRightsProfiles();
  const { byCountry: qariProfilesByCountry } = useQariProfiles();

  useEffect(() => {
    let active = true;
    fetch("/api/cities/registry")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("City registry unavailable")))
      .then((payload) => {
        if (!active || !Array.isArray(payload?.cities)) return;
        const next = Object.fromEntries(payload.cities.map((city) => [city.key, city]));
        if (Object.keys(next).length) setRegistryConfig(next);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;

    const loadEvents = async () => {
      setIsEventsLoading(true);
      try {
        const { data } = await fetchEventsData();
        if (active) setEventsData(Array.isArray(data) ? data : []);
      } catch {
        if (active) setEventsData([]);
      } finally {
        if (active) setIsEventsLoading(false);
      }
    };

    loadEvents();
    const channel = supabase
      .channel("realtime-cities-events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        loadEvents,
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);
  const lastExploredCity = useSyncExternalStore(
    subscribeLastExploredCity,
    getLastExploredCitySnapshot,
    () => "",
  );
  const backRestoreCity = useMemo(() => {
    if (typeof window === "undefined") return "";

    try {
      return String(window.history?.state?.[BACK_RESTORE_CITY_KEY] || "")
        .trim()
        .toLowerCase();
    } catch {
      return "";
    }
  }, []);

  const scrollToCountrySection = useCallback((country) => {
    if (!country || country === "All") return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        countrySectionRefs.current[country]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  }, []);

  const countries = useMemo(() => {
    return ["All", ...new Set(Object.values(registryConfig).map((city) => city.country || "Other"))].sort();
  }, [registryConfig]);
  const availableCountries = useMemo(() => countries.filter((country) => country !== "All"), [countries]);
  const countriesForSelectedRegion = useMemo(
    () => selectedRegion === "All regions"
      ? availableCountries
      : availableCountries.filter((country) => REGION_COUNTRIES[selectedRegion]?.has(country)),
    [availableCountries, selectedRegion],
  );

  const updateCountryMapStyles = useCallback((selected) => {
    const map = countryMapRef.current;
    if (!map || !map.getLayer("qa-countries-fill")) return;

    const supportedNames = getSupportedMapboxNames(availableCountries);
    const selectedNames = selected === "All" ? [] : getCountryMapboxNames(selected);
    const countryNameExpression = ["coalesce", ["get", "name_en"], ["get", "name"], ["get", "name_long"], ""];
    const dbByCountry = new Map();
    (Array.isArray(countryRightsProfiles) ? countryRightsProfiles : [])
      .filter((profile) => profile?.country)
      .forEach((profile) => {
        const key = normalizeCountry(profile.country);
        if (!key) return;
        const existing = dbByCountry.get(key);
        if (!existing || String(profile.updated_at || "") > String(existing.updated_at || "")) {
          dbByCountry.set(key, profile);
        }
      });
    const openNames = [];
    const steadyNames = [];
    const watchNames = [];
    const cautionNames = [];
    const restrictedNames = [];
    const unknownNames = [];

    availableCountries.forEach((country) => {
      const fromDb = buildRightsSnapshotFromProfile(dbByCountry.get(normalizeCountry(country)));
      const snapshot = fromDb || getCityRightsSignals({ country });
      const profile = dbByCountry.get(normalizeCountry(country));
      const qariProfile = qariProfilesByCountry[normalizeCountry(country)] || null;
      const tier = getMapRiskTier(country, profile, snapshot, qariProfile);
      const aliases = getCountryMapboxNames(country);
      if (tier === "open") {
        openNames.push(...aliases);
        return;
      }
      if (tier === "steady") {
        steadyNames.push(...aliases);
        return;
      }
      if (tier === "watch") {
        watchNames.push(...aliases);
        return;
      }
      if (tier === "caution") {
        cautionNames.push(...aliases);
        return;
      }
      if (tier === "restricted") {
        restrictedNames.push(...aliases);
        return;
      }
      unknownNames.push(...aliases);
    });

    map.setPaintProperty("qa-countries-fill", "fill-color", [
      "case",
      ["in", countryNameExpression, ["literal", restrictedNames]],
      MAP_RISK_PALETTE.restricted.color,
      ["in", countryNameExpression, ["literal", cautionNames]],
      MAP_RISK_PALETTE.caution.color,
      ["in", countryNameExpression, ["literal", watchNames]],
      MAP_RISK_PALETTE.watch.color,
      ["in", countryNameExpression, ["literal", steadyNames]],
      MAP_RISK_PALETTE.steady.color,
      ["in", countryNameExpression, ["literal", openNames]],
      MAP_RISK_PALETTE.open.color,
      ["in", countryNameExpression, ["literal", unknownNames]],
      MAP_RISK_PALETTE.unknown.color,
      "#111111",
    ]);

    map.setPaintProperty("qa-countries-fill", "fill-opacity", [
      "case",
      ["in", countryNameExpression, ["literal", selectedNames]],
      0.5,
      ["in", countryNameExpression, ["literal", supportedNames]],
      0.27,
      0.08,
    ]);

    if (map.getLayer("qa-countries-selected-line")) {
      map.setFilter("qa-countries-selected-line", [
        "in",
        countryNameExpression,
        ["literal", selectedNames],
      ]);
    }
  }, [availableCountries, countryRightsProfiles, qariProfilesByCountry]);

  useEffect(() => {
    let isCancelled = false;
    let map;
    (async () => {
      try {
        const mapboxgl = await loadMapboxGl();
        if (isCancelled) return;

        const readiness = evaluateMapInitReadiness({
          mapboxgl,
          isMapboxStylesReady,
          mapboxToken,
          container: countryMapContainerRef.current,
          mapInstance: countryMapRef.current,
          requireWebGl: true,
        });
        if (!readiness.ready) {
          if (shouldTriggerMapFallback(readiness.reason)) {
            queueMicrotask(() => {
              setMapError("World map is unavailable in this browser or device (WebGL not supported).");
            });
          }
          return;
        }

        mapboxgl.accessToken = mapboxToken;
        map = new mapboxgl.Map({
          container: countryMapContainerRef.current,
          style: "mapbox://styles/mapbox/dark-v11",
          projection: "mercator",
          center: [8, 20],
          zoom: 0.85,
          minZoom: 0.7,
          maxZoom: 3.3,
          renderWorldCopies: false,
          maxBounds: [
            [-180, -85],
            [180, 85],
          ],
          antialias: true,
          attributionControl: false,
        });

        countryMapRef.current = map;

        map.on("load", () => {
          const styleLayers = map.getStyle().layers || [];
          const firstSymbolLayerId = styleLayers.find((layer) => layer.type === "symbol")?.id;

          styleLayers
            .filter((layer) => layer.type === "symbol" && /country.*label|label.*country/i.test(layer.id))
            .forEach((layer) => {
              map.setPaintProperty(layer.id, "text-color", "rgba(210,226,234,0.78)");
              map.setPaintProperty(layer.id, "text-halo-color", "rgba(4,9,15,0.92)");
              map.setPaintProperty(layer.id, "text-halo-width", 1.15);
              map.setPaintProperty(layer.id, "text-halo-blur", 0.45);
              map.setLayoutProperty(layer.id, "text-font", ["DIN Pro Regular", "Arial Unicode MS Regular"]);
              map.setLayoutProperty(layer.id, "text-letter-spacing", 0.035);
            });

          if (!map.getSource("qa-country-boundaries")) {
            map.addSource("qa-country-boundaries", {
              type: "vector",
              url: "mapbox://mapbox.country-boundaries-v1",
            });
          }

          map.addLayer(
            {
              id: "qa-countries-fill",
              type: "fill",
              source: "qa-country-boundaries",
              "source-layer": "country_boundaries",
              paint: {
                "fill-color": "#111111",
                "fill-opacity": 0.12,
              },
            },
            firstSymbolLayerId,
          );

          map.addLayer(
            {
              id: "qa-countries-line",
              type: "line",
              source: "qa-country-boundaries",
              "source-layer": "country_boundaries",
              paint: {
                "line-color": "rgba(207,225,235,0.22)",
                "line-width": ["interpolate", ["linear"], ["zoom"], 0.7, 0.35, 3.3, 0.8],
              },
            },
            firstSymbolLayerId,
          );

          map.addLayer({
            id: "qa-countries-selected-line",
            type: "line",
            source: "qa-country-boundaries",
            "source-layer": "country_boundaries",
            filter: ["==", ["coalesce", ["get", "name_en"], ["get", "name"], ["get", "name_long"], ""], ""],
            paint: {
              "line-color": "rgba(207,250,254,0.96)",
              "line-width": ["interpolate", ["linear"], ["zoom"], 0.7, 1.15, 3.3, 2.1],
              "line-blur": 0.25,
            },
          });

          updateCountryMapStyles(selectedCountry);
        });

        map.on("mouseenter", "qa-countries-fill", () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "qa-countries-fill", () => {
          map.getCanvas().style.cursor = "";
        });

        map.on("click", "qa-countries-fill", (event) => {
          const feature = event.features?.[0];
          const rawCountry = feature?.properties?.name_en || feature?.properties?.name || feature?.properties?.name_long;
          const matchedCountry =
            resolveCoordinateOverrideCountry(event.lngLat, availableCountries) ||
            resolveMapboxCountryToAppCountry(rawCountry, availableCountries);

          if (!matchedCountry) {
            return;
          }

          if (selectedCountry === matchedCountry) {
            setSelectedCountry("All");
            setSelectedRegion("All regions");
          } else {
            setSelectedCountry(matchedCountry);
            setSelectedRegion(getCityRegion(matchedCountry));
            scrollToCountrySection(matchedCountry);
          }
        });

        map.on("error", () => {
          setMapError("Could not load world map right now.");
        });
      } catch (error) {
        console.warn("Map initialization skipped:", error);
        if (!isCancelled) {
          queueMicrotask(() => {
            setMapError("Could not start world map on this device right now.");
          });
        }
      }
    })();

    return () => {
      isCancelled = true;
      if (map) {
        map.remove();
      }
      countryMapRef.current = null;
    };
  }, [availableCountries, isMapboxStylesReady, mapboxToken, scrollToCountrySection, selectedCountry, updateCountryMapStyles]);

  useEffect(() => {
    updateCountryMapStyles(selectedCountry);
  }, [selectedCountry, updateCountryMapStyles]);

  useEffect(() => {
    if (!searchSuggestionsOpen) return undefined;

    const handleClickOutside = (event) => {
      if (citySearchRef.current?.contains(event.target)) return;
      setSearchSuggestionsOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setSearchSuggestionsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [searchSuggestionsOpen]);

  const allCities = useMemo(() => {
    const placesByCity = places.reduce((acc, place) => {
      const cityKey = normalizeCityKey(place?.city || "");
      if (!cityKey) return acc;
      if (!acc.has(cityKey)) acc.set(cityKey, []);
      acc.get(cityKey).push(place);
      return acc;
    }, new Map());
    const eventsByCity = eventsData.reduce((acc, event) => {
      if (!isEventVisibleOnCityPage(event)) return acc;
      const cityKey = normalizeCityKey(event?.city || "");
      if (!cityKey) return acc;
      acc.set(cityKey, (acc.get(cityKey) || 0) + 1);
      return acc;
    }, new Map());

    return Object.entries(registryConfig).map(([key, city]) => {
      const cityPlaces = placesByCity.get(normalizeCityKey(key)) || [];
      const reviewCount = cityPlaces.reduce(
        (sum, place) => sum + (place.reviewCount || 0),
        0
      );
      const topPlace = cityPlaces
        .slice()
        .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))[0];

      return {
        key,
        ...city,
        region: getCityRegion(city.country),
        placeCount: cityPlaces.length,
        eventCount: eventsByCity.get(normalizeCityKey(key)) || 0,
        reviewCount,
        topPlace: topPlace?.name || null,
      };
    });
  }, [eventsData, places, registryConfig]);

  const citySearchSuggestions = useMemo(() => {
    const search = normalizeCitySearchText(query);
    if (!search) return [];

    return allCities
      .map((city) => {
        const cityName = String(city.title || "").replace(/^Queer\s+/i, "");
        const cityText = normalizeCitySearchText(cityName);
        const countryText = normalizeCitySearchText(city.country);
        const matches = cityText.includes(search) || countryText.includes(search);
        const priority = cityText === search ? 0 : cityText.startsWith(search) ? 1 : countryText.startsWith(search) ? 2 : 3;
        return { city, cityName, matches, priority };
      })
      .filter((item) => item.matches)
      .sort((left, right) => left.priority - right.priority || CITY_NAME_COLLATOR.compare(left.cityName, right.cityName))
      .slice(0, 7);
  }, [allCities, query]);

  const countrySearchSuggestions = useMemo(() => {
    const search = normalizeCitySearchText(query);
    if (!search) return [];

    return availableCountries
      .map((country) => {
        const countryText = normalizeCitySearchText(country);
        return {
          country,
          cityCount: allCities.filter((city) => city.country === country).length,
          matches: countryText.includes(search),
          priority: countryText === search ? 0 : countryText.startsWith(search) ? 1 : 2,
        };
      })
      .filter((item) => item.matches)
      .sort((left, right) => left.priority - right.priority || left.country.localeCompare(right.country))
      .slice(0, 4);
  }, [allCities, availableCountries, query]);

  const filteredCities = useMemo(() => {
    return allCities
      .filter((city) => {
        if (selectedRegion !== "All regions" && city.region !== selectedRegion) return false;
        if (selectedCountry !== "All" && city.country !== selectedCountry) return false;

        if (!query) return true;

        const search = normalizeCitySearchText(query);
        return (
          normalizeCitySearchText(city.title).includes(search) ||
          normalizeCitySearchText(city.country).includes(search)
        );
      })
      .sort((a, b) => CITY_NAME_COLLATOR.compare(a.title, b.title));
  }, [allCities, query, selectedCountry, selectedRegion]);

  const lastExploredCityRecord = useMemo(
    () => allCities.find((city) => city.key === lastExploredCity) || null,
    [allCities, lastExploredCity],
  );

  const openNearestCity = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Location is not available in this browser.");
      return;
    }

    if (isLocating) return;

    setIsLocating(true);
    setLocationError("");

    const openCityFromPosition = ({ coords }) => {
      const nearestCity = allCities
        .map((city) => {
          const [lng, lat] = Array.isArray(city.center) ? city.center : [];
          return {
            city,
            distance: distanceKmBetween(
              { lat: coords.latitude, lng: coords.longitude },
              { lat, lng },
            ),
          };
        })
        .filter((item) => Number.isFinite(item.distance))
        .sort((left, right) => left.distance - right.distance)[0]?.city;

      setIsLocating(false);
      if (!nearestCity) {
        setLocationError("We could not match your location to an Atlas city.");
        return;
      }
      router.push(`/${nearestCity.key}`);
    };

    const showLocationError = (error) => {
      setIsLocating(false);
      if (error?.code === 1) {
        setLocationError("Allow location access to find your nearest Atlas city.");
      } else if (error?.code === 3) {
        setLocationError("Finding your position took too long. Try again with Wi-Fi or GPS enabled.");
      } else {
        setLocationError("Your current position could not be found. Try again.");
      }
    };

    navigator.geolocation.getCurrentPosition(
      openCityFromPosition,
      (firstError) => {
        if (firstError?.code === 1) {
          showLocationError(firstError);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          openCityFromPosition,
          showLocationError,
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, [allCities, isLocating, router]);

  const groupedCities = useMemo(() => {
    return filteredCities.reduce((acc, city) => {
      const country = city.country || "Other";
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(city);
      return acc;
    }, {});
  }, [filteredCities]);

  const countryRightsSnapshots = useMemo(() => {
    const dbByCountry = new Map();
    (Array.isArray(countryRightsProfiles) ? countryRightsProfiles : [])
      .filter((profile) => profile?.country)
      .forEach((profile) => {
        const normalizedKey = normalizeCountry(profile.country);
        if (!normalizedKey) return;
        const existing = dbByCountry.get(normalizedKey);
        if (!existing || String(profile.updated_at || "") > String(existing.updated_at || "")) {
          dbByCountry.set(normalizedKey, profile);
        }
      });

    const hasMeaningfulLevels = (snapshot) => {
      if (!snapshot) return false;
      const levels = [snapshot.legal?.level, snapshot.rights?.level, snapshot.safety?.level];
      return levels.some((level) => level && level !== "unknown");
    };

    const entries = availableCountries.map((country) => [
      country,
      (() => {
        const fromDb = buildRightsSnapshotFromProfile(dbByCountry.get(normalizeCountry(country)));
        if (hasMeaningfulLevels(fromDb)) return fromDb;
        return getCityRightsSignals({ country });
      })(),
    ]);
    return Object.fromEntries(entries);
  }, [availableCountries, countryRightsProfiles]);

  const countryRightsProfilesByCountry = useMemo(() => {
    const map = {};
    (Array.isArray(countryRightsProfiles) ? countryRightsProfiles : [])
      .filter((profile) => profile?.country)
      .forEach((profile) => {
        const normalizedKey = normalizeCountry(profile.country);
        if (!normalizedKey) return;
        const existing = map[normalizedKey];
        if (!existing || String(profile.updated_at || "") > String(existing.updated_at || "")) {
          map[normalizedKey] = profile;
        }
      });
    return map;
  }, [countryRightsProfiles]);

  const countryRightsEmptyStateWarning =
    !isCountryRightsLoading &&
    !countryRightsLoadError &&
    (!Array.isArray(countryRightsProfiles) || countryRightsProfiles.length === 0);

  const visibleCountries = Object.keys(groupedCities).sort();
  const crawlPathCities = useMemo(
    () => TIER1_CITY_SLUGS.filter((cityKey) => Boolean(registryConfig[cityKey])),
    [registryConfig]
  );
  const crawlClusterTopics = useMemo(
    () => TIER1_TOPIC_KEYS.filter((topicKey) => Boolean(listCityClusterTopics().find((topic) => topic.key === topicKey))),
    []
  );
  const crawlClusterCities = useMemo(() => crawlPathCities.slice(0, 12), [crawlPathCities]);
  const topicHubKeys = useMemo(
    () => listTopicHubs().map((hub) => hub.key).filter((key) => isIndexableTopicHub(key)),
    []
  );
  const totalCities = Object.keys(registryConfig).length;
  const totalCountries = countries.length - 1;
  const totalPlaces = places.length;
  const visibleCityCount = filteredCities.length;
  useEffect(() => {
    if (isAuthLoading) return;

    if (!isMember || !user?.email) {
      queueMicrotask(() => {
        setIsAdmin(false);
      });
      return;
    }

    let active = true;
    (async () => {
      const result = await resolveAdminAccess({ email: user.email });
      if (!active) return;
      setIsAdmin(Boolean(result?.isAdmin));
    })();

    return () => {
      active = false;
    };
  }, [isAuthLoading, isMember, user?.email]);

  const openCountryEditor = useCallback(
    (country) => {
      const profile = countryRightsProfilesByCountry[normalizeCountry(country)] || null;
      setEditingCountry(country);
      setCountryEditorDraft(createCountryRightsDraft(country, profile));
      setCountryEditorError("");
      setCountryEditorSuccess("");
    },
    [countryRightsProfilesByCountry],
  );

  const closeCountryEditor = useCallback(() => {
    setEditingCountry("");
    setCountryEditorDraft(null);
    setCountryEditorError("");
    setCountryEditorSuccess("");
  }, []);

  const saveCountryEditor = useCallback(async () => {
    if (!isAdmin || !countryEditorDraft?.country) return;

    setIsSavingCountryProfile(true);
    setCountryEditorError("");
    setCountryEditorSuccess("");

    try {
      const payload = {
        country: String(countryEditorDraft.country),
        legal_level: normalizeStatusToken(countryEditorDraft.legal_level),
        rights_level: normalizeStatusToken(countryEditorDraft.rights_level),
        safety_level: normalizeStatusToken(countryEditorDraft.safety_level),
        same_sex_relations_status: normalizeStatusToken(countryEditorDraft.same_sex_relations_status),
        union_status: normalizeStatusToken(countryEditorDraft.union_status),
        legal_gender_recognition_status: normalizeStatusToken(countryEditorDraft.legal_gender_recognition_status),
        anti_discrimination_status: normalizeStatusToken(countryEditorDraft.anti_discrimination_status),
        what_this_means: String(countryEditorDraft.what_this_means || "").trim(),
        confidence: normalizeStatusToken(countryEditorDraft.confidence),
        source_legal_url: String(countryEditorDraft.source_legal_url || "").trim() || null,
        source_rights_url: String(countryEditorDraft.source_rights_url || "").trim() || null,
        source_safety_url: String(countryEditorDraft.source_safety_url || "").trim() || null,
        needs_manual_review: Boolean(countryEditorDraft.needs_manual_review),
        source_checked_at: new Date().toISOString().slice(0, 10),
      };

      const { error } = await supabase
        .from("qa_country_rights_profiles")
        .upsert(payload, { onConflict: "country" });

      if (error) {
        setCountryEditorError(String(error.message || "Could not save country rights profile."));
        return;
      }

      setCountryEditorSuccess("Country rights profile saved.");
      await refreshCountryRightsProfiles();
    } catch (error) {
      setCountryEditorError(String(error?.message || "Could not save country rights profile."));
    } finally {
      setIsSavingCountryProfile(false);
    }
  }, [countryEditorDraft, isAdmin, refreshCountryRightsProfiles]);

  useEffect(() => {
    if (!backRestoreCity || typeof window === "undefined") return;

    try {
      const historyState = window.history?.state;
      const nextState =
        historyState && typeof historyState === "object"
          ? { ...historyState }
          : {};
      delete nextState[BACK_RESTORE_CITY_KEY];
      window.history.replaceState(nextState, "", window.location.href);
    } catch {
      // Ignore history/state restrictions.
    }
  }, [backRestoreCity]);

  useEffect(() => {
    if (!backRestoreCity || isLoading) return;
    if (lastCityAutoFocusRef.current === backRestoreCity) return;
    if (!filteredCities.some((city) => city.key === backRestoreCity)) return;

    const target = cityCardRefs.current[backRestoreCity];
    if (!target) return;

    lastCityAutoFocusRef.current = backRestoreCity;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }, [backRestoreCity, filteredCities, isLoading]);

  const citiesSeoJsonLd = useMemo(() => {
    const cityItems = crawlPathCities.slice(0, 24).map((cityKey, index) => {
      const cityTitle = String(
        registryConfig?.[cityKey]?.title ||
          cityKey.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
      );
      return {
        "@type": "ListItem",
        position: index + 1,
        url: `https://www.queeratlas.app/${cityKey}`,
        name: cityTitle,
      };
    });

    return [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.queeratlas.app/" },
          { "@type": "ListItem", position: 2, name: "Cities", item: CITIES_CANONICAL_URL },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${CITIES_CANONICAL_URL}#collection`,
        url: CITIES_CANONICAL_URL,
        name: "Gay Friendly Cities & LGBTQ Safety Map 2026",
        description:
          "Compare queer city safety context, nightlife signal, and trusted local routes in one city-by-city atlas.",
        mainEntity: {
          "@type": "ItemList",
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          numberOfItems: cityItems.length,
          itemListElement: cityItems,
        },
      },
    ];
  }, [crawlPathCities, registryConfig]);

  return (
    <main className="qa-page min-h-screen bg-[#050505] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(citiesSeoJsonLd) }}
      />
      <nav aria-label="Internal city links" className="sr-only">
        <Link href="/cities">Cities</Link>
        <Link href="/events">Events</Link>
        <Link href="/now">Now</Link>
        <Link href="/topics">Topics</Link>
        <Link href="/gay-guide">Gay Travel Guide</Link>
        <Link href="/queer-guide">Queer Travel Guide</Link>
        {topicHubKeys.map((topicKey) => (
          <Link key={`crawl-topic-hub-${topicKey}`} href={`/topics/${topicKey}`}>
            {topicKey}
          </Link>
        ))}
        {crawlPathCities.map((cityKey) => (
          <Link key={`crawl-city-${cityKey}`} href={`/${cityKey}`}>
            {cityKey}
          </Link>
        ))}
        {crawlClusterCities.flatMap((cityKey) =>
          crawlClusterTopics.map((topicKey) => (
            <Link key={`crawl-city-cluster-${cityKey}-${topicKey}`} href={`/${cityKey}/discover/${topicKey}`}>
              {cityKey} {topicKey}
            </Link>
          ))
        )}
      </nav>
      <div className="qa-shell relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.08),transparent_20%),radial-gradient(circle_at_76%_14%,rgba(96,165,250,0.08),transparent_20%),radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.06),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="pointer-events-none absolute -left-14 top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 top-20 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />

        <section className="qa-panel relative mb-5 overflow-hidden rounded-[26px] border border-white/[0.09] bg-[#0b0d15] px-5 py-7 shadow-[0_28px_90px_rgba(0,0,0,0.34)] sm:mb-8 sm:rounded-[36px] sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute inset-0">
            <Image
              src="/city-assets/queer-atlas-global-city-network-hero.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-70"
              style={{ objectPosition: "center 42%" }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,9,15,0.97)_0%,rgba(7,9,15,0.86)_48%,rgba(7,9,15,0.52)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,15,0.12),rgba(7,9,15,0.74)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-200/28 to-transparent" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-100/62 sm:text-xs">
              Explore the queer world
            </p>
            <h1 className="qa-display mt-3 inline-flex items-center gap-3 text-[2.5rem] font-semibold leading-none tracking-[-0.045em] text-white sm:mt-4 sm:gap-4 sm:text-6xl">
              <BrandMark iconOnly className="h-9 w-9 shrink-0 sm:h-14 sm:w-14" />
              Cities
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/64 sm:mt-5 sm:text-base sm:leading-7">
              Find the places, scenes and local signal that fit your trip.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:items-start">
              <label htmlFor="hero-city-search" className="sr-only">Search city or country</label>
              <div ref={citySearchRef} className="group min-w-0 flex-1">
                <div className="relative">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/38 transition group-focus-within:text-cyan-100/80"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.8-3.8" />
                  </svg>
                  <input
                    id="hero-city-search"
                    value={query}
                    onFocus={() => setSearchSuggestionsOpen(true)}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setSearchSuggestionsOpen(true);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") setSearchSuggestionsOpen(false);
                    }}
                    placeholder="Search city or country"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={searchSuggestionsOpen && Boolean(query.trim())}
                    aria-controls="city-search-suggestions"
                    className="min-h-13 w-full rounded-[18px] border border-white/14 bg-black/34 py-3.5 pl-12 pr-11 text-base text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] outline-none backdrop-blur-md transition placeholder:text-white/38 hover:border-white/22 focus:border-cyan-200/50 focus:ring-2 focus:ring-cyan-200/14"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setSearchSuggestionsOpen(false);
                      }}
                      aria-label="Clear city search"
                      className="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-lg text-white/42 transition hover:bg-white/10 hover:text-white"
                    >
                      ×
                    </button>
                  ) : null}
                </div>

                {searchSuggestionsOpen && query.trim() ? (
                  <div
                    id="city-search-suggestions"
                    role="listbox"
                    aria-label="Matching Atlas cities"
                    className="mt-2 overflow-hidden rounded-[18px] border border-white/14 bg-[#111521]/96 p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.46)] backdrop-blur-xl"
                  >
                    {countrySearchSuggestions.length || citySearchSuggestions.length ? (
                      <>
                        {countrySearchSuggestions.length ? (
                          <div role="group" aria-label="Matching countries">
                            <p className="px-3.5 pb-1.5 pt-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/34">Countries</p>
                            {countrySearchSuggestions.map(({ country, cityCount }) => (
                              <button
                                key={`country-search-${country}`}
                                type="button"
                                role="option"
                                aria-selected={selectedCountry === country}
                                onClick={() => {
                                  setSelectedRegion(getCityRegion(country));
                                  setSelectedCountry(country);
                                  setSearchSuggestionsOpen(false);
                                  scrollToCountrySection(country);
                                }}
                                className="group/result flex min-h-14 w-full items-center justify-between gap-4 rounded-[14px] px-3.5 py-2.5 text-left transition hover:bg-white/[0.075] focus-visible:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-200/40"
                              >
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-semibold text-white group-hover/result:text-cyan-50">{country}</span>
                                  <span className="mt-0.5 block text-xs text-white/46">Browse the country collection</span>
                                </span>
                                <span className="flex shrink-0 items-center gap-2 text-[10px] text-white/42">
                                  <span>{cityCount} {cityCount === 1 ? "city" : "cities"}</span>
                                  <span aria-hidden="true" className="text-cyan-100/70">↓</span>
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : null}

                        {citySearchSuggestions.length ? (
                          <div role="group" aria-label="Matching cities" className={countrySearchSuggestions.length ? "mt-1 border-t border-white/[0.07] pt-1" : ""}>
                            <p className="px-3.5 pb-1.5 pt-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/34">Cities</p>
                            {citySearchSuggestions.map(({ city, cityName }) => (
                              <Link
                                key={`city-search-${city.key}`}
                                href={`/${city.key}`}
                                role="option"
                                aria-selected="false"
                                onClick={() => setSearchSuggestionsOpen(false)}
                                className="group/result flex min-h-14 items-center justify-between gap-4 rounded-[14px] px-3.5 py-2.5 text-left transition hover:bg-white/[0.075] focus-visible:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-200/40"
                              >
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-semibold text-white group-hover/result:text-cyan-50">{cityName}</span>
                                  <span className="mt-0.5 block truncate text-xs capitalize text-white/46">{city.country} · {String(city.vibe || "mixed").replaceAll("_", " ")}</span>
                                </span>
                                <span className="flex shrink-0 items-center gap-2 text-[10px] text-white/42">
                                  <span>{city.placeCount} places</span>
                                  <span aria-hidden="true" className="text-cyan-100/70">→</span>
                                </span>
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <p className="px-3.5 py-4 text-sm text-white/52">No Atlas cities or countries match “{query.trim()}”.</p>
                    )}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={openNearestCity}
                disabled={isLocating}
                className="qa-action min-h-13 shrink-0 rounded-[18px] border border-cyan-200/24 bg-cyan-200/[0.09] px-5 text-sm font-semibold text-cyan-50 transition hover:border-cyan-100/42 hover:bg-cyan-200/[0.14] disabled:cursor-wait disabled:opacity-60 sm:hidden"
              >
                {isLocating ? "Finding city…" : "Near me"}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-[11px] text-white/44 sm:text-xs">
              <span><strong className="font-semibold tabular-nums text-white/78">{totalCities}</strong> cities</span>
              <span aria-hidden="true" className="text-white/20">·</span>
              <span><strong className="font-semibold tabular-nums text-white/78">{totalCountries}</strong> countries</span>
              <span aria-hidden="true" className="text-white/20">·</span>
              <span><strong className="font-semibold tabular-nums text-white/78">{isLoading ? "—" : totalPlaces}</strong> places</span>
              {(query || selectedCountry !== "All") ? (
                <>
                  <span aria-hidden="true" className="text-white/20">·</span>
                  <span className="text-cyan-100/72">{visibleCityCount} shown</span>
                </>
              ) : null}
              <button
                type="button"
                onClick={openNearestCity}
                disabled={isLocating}
                className="ml-1 hidden items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.055] px-3 py-1.5 font-medium text-white/66 transition hover:border-cyan-200/28 hover:bg-cyan-200/[0.08] hover:text-white disabled:cursor-wait disabled:opacity-55 sm:inline-flex"
              >
                <span aria-hidden="true" className="text-cyan-100/72">⌖</span>
                {isLocating ? "Locating…" : "My position"}
              </button>
              {lastExploredCityRecord && (
                <button
                  type="button"
                  onClick={() => router.push(`/${lastExploredCityRecord.key}`)}
                  className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.055] px-3 py-1.5 font-medium text-white/66 transition hover:border-white/24 hover:bg-white/[0.09] hover:text-white"
                >
                  Continue {lastExploredCityRecord.title.replace(/^Queer\s+/i, "")}
                  <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
            {locationError ? (
              <p role="status" className="mt-3 text-xs text-amber-100/78">{locationError}</p>
            ) : null}
          </div>
        </section>

        <section className="relative mb-8 overflow-hidden rounded-[24px] border border-cyan-100/[0.09] bg-[#090b10] shadow-[0_26px_90px_rgba(0,0,0,0.36),0_0_0_1px_rgba(255,255,255,0.018)] sm:rounded-[32px]">
          <div className="overflow-hidden bg-[radial-gradient(circle_at_20%_12%,rgba(34,211,238,0.12),transparent_34%),radial-gradient(circle_at_86%_14%,rgba(244,114,182,0.10),transparent_34%),linear-gradient(180deg,rgba(10,10,10,0.88),rgba(8,8,8,0.96))]">
            <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b border-white/[0.07] bg-[#0a0d13]/88 px-4 py-3 sm:px-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-cyan-100/65">
                  Safety atlas
                </p>
                <p className="mt-0.5 hidden text-[11px] text-white/35 sm:block">Select a country to explore its cities</p>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {Object.entries(MAP_RISK_PALETTE)
                  .filter(([, item]) => item.showInLegend)
                  .map(([key, item]) => (
                  <span
                    key={`map-safety-${key}`}
                    className="inline-flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.1em] text-white/52"
                  >
                    <span className="h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: item.color, color: item.color }} />
                    {item.label}
                  </span>
                  ))}
              </div>
            </div>
            <div className="relative">
              <div ref={countryMapContainerRef} className="h-[340px] w-full sm:h-[400px]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-14 bg-gradient-to-b from-[#070a10]/38 to-transparent" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-20 bg-gradient-to-t from-[#07090e]/52 to-transparent" aria-hidden="true" />
              <div className="absolute bottom-3 right-3 z-10 flex flex-col items-end gap-2 sm:bottom-4 sm:right-4 sm:flex-row">
                <label className="relative w-40 sm:w-48">
                  <span className="sr-only">Filter cities by region</span>
                  <select
                    value={selectedRegion}
                    onChange={(event) => {
                      const nextRegion = event.target.value;
                      setSelectedRegion(nextRegion);
                      if (selectedCountry !== "All" && nextRegion !== "All regions" && !REGION_COUNTRIES[nextRegion]?.has(selectedCountry)) {
                        setSelectedCountry("All");
                      }
                    }}
                    className="min-h-11 w-full appearance-none rounded-[14px] border border-white/18 bg-[#0b0e16]/92 px-3.5 pr-8 text-xs font-medium text-white shadow-[0_12px_34px_rgba(0,0,0,0.38)] outline-none backdrop-blur-xl transition hover:border-white/30 focus:border-cyan-200/50 focus:ring-2 focus:ring-cyan-200/16"
                  >
                    {REGION_OPTIONS.map((region) => <option key={region} value={region} className="bg-[#111218]">{region}</option>)}
                  </select>
                  <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/45">⌄</span>
                </label>

                <label className="relative w-40 sm:w-48">
                  <span className="sr-only">Filter cities by country</span>
                  <select
                    value={selectedCountry}
                    onChange={(event) => {
                      const nextCountry = event.target.value;
                      setSelectedCountry(nextCountry);
                      if (nextCountry !== "All") setSelectedRegion(getCityRegion(nextCountry));
                      if (nextCountry !== "All") scrollToCountrySection(nextCountry);
                    }}
                    className="min-h-11 w-full appearance-none rounded-[14px] border border-white/18 bg-[#0b0e16]/92 px-3.5 pr-8 text-xs font-medium text-white shadow-[0_12px_34px_rgba(0,0,0,0.38)] outline-none backdrop-blur-xl transition hover:border-white/30 focus:border-cyan-200/50 focus:ring-2 focus:ring-cyan-200/16"
                  >
                    <option value="All" className="bg-[#111218]">All countries</option>
                    {countriesForSelectedRegion.map((country) => <option key={country} value={country} className="bg-[#111218]">{country}</option>)}
                  </select>
                  <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/45">⌄</span>
                </label>
              </div>
            </div>
            {(mapboxMissing || mapError) && (
              <p className="border-t border-white/10 px-4 py-3 text-sm text-amber-100/85">
                {mapboxMissing
                  ? "Mapbox token missing. Add NEXT_PUBLIC_MAPBOX_TOKEN to enable world map filter."
                  : mapError}
              </p>
            )}
          </div>

        </section>

        <div className="relative space-y-8">
          {isLoading && (
            <section className="qa-premium-card rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.99))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
              <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/45">Loading city signal</p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`city-skeleton-${index}`}
                    className="qa-skeleton-card rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5"
                    aria-hidden="true"
                  >
                    <div className="qa-skeleton-card h-3 w-20 rounded-full" />
                    <div className="qa-skeleton-card mt-3 h-6 w-32 rounded-full" />
                    <div className="qa-skeleton-card mt-5 h-3 w-full rounded-full" />
                    <div className="qa-skeleton-card mt-2 h-3 w-5/6 rounded-full" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {!isLoading && visibleCountries.length === 0 && (
            <section className="qa-premium-card rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.99))] p-10 text-center shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
              <EmptyState
                title="No cities match this filter yet."
                description="Try resetting search and country to reopen the atlas."
              >
                <button
                  onClick={() => {
                    setQuery("");
                    setSelectedCountry("All");
                  }}
                  className="qa-action rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-white/25 hover:text-white"
                >
                  Reset filters
                </button>
              </EmptyState>
            </section>
          )}

          {!isLoading && visibleCountries.map((country) => (
            (() => {
              const tone = getCountryTone(country);
              const countryHeadingId = `country-${String(country).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
              const countryCityCount = groupedCities[country].length;

              return (
                <section
                  key={country}
                  aria-labelledby={countryHeadingId}
                  ref={(node) => {
                    if (node) {
                      countrySectionRefs.current[country] = node;
                    } else {
                      delete countrySectionRefs.current[country];
                    }
                  }}
                  className={`qa-premium-card rounded-[32px] border p-4 shadow-[0_28px_98px_rgba(0,0,0,0.34)] sm:p-6 ${tone.section}`}
                >
                  <div className="mb-6 flex items-end gap-4 border-b border-white/[0.09] pb-5 sm:gap-6">
                    <div className="min-w-0 shrink-0">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/38 sm:text-[10px]">
                        Country
                      </p>
                      <h2
                        id={countryHeadingId}
                        className="mt-1 text-[1.65rem] font-semibold leading-none tracking-[-0.035em] text-white sm:text-[2rem]"
                      >
                        {country}
                      </h2>
                    </div>
                    <div className={`mb-1.5 hidden h-px flex-1 bg-gradient-to-r ${tone.divider} via-white/[0.07] to-transparent sm:block`} />
                    <p className="mb-0.5 ml-auto shrink-0 text-right text-[10px] uppercase tracking-[0.16em] text-white/42 sm:mb-1">
                      <span className="mr-1.5 font-semibold tabular-nums text-white/72">{countryCityCount}</span>
                      {countryCityCount === 1 ? "city" : "cities"}
                    </p>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => openCountryEditor(country)}
                        className="rounded-full border border-cyan-200/28 bg-cyan-300/12 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-100/88 transition hover:border-cyan-200/45 hover:text-white"
                      >
                        Edit rights
                      </button>
                    )}
                  </div>

                  <div className="mb-5">
                    <CityRightsSignals
                      snapshot={countryRightsSnapshots[country]}
                      qariProfile={qariProfilesByCountry[normalizeCountry(country)] || null}
                      country={country}
                      riskTier={getMapRiskTier(
                        country,
                        countryRightsProfilesByCountry[normalizeCountry(country)],
                        countryRightsSnapshots[country],
                        qariProfilesByCountry[normalizeCountry(country)] || null,
                      )}
                      expanded={expandedSafetyCountry === country}
                      onToggle={() => setExpandedSafetyCountry((current) => current === country ? "" : country)}
                    />
                    {countryRightsLoadError ? (
                      <p className="mt-2 text-[11px] text-rose-200/85">
                        Could not load live country rights data from Supabase. Showing fallback signals.
                      </p>
                    ) : countryRightsEmptyStateWarning ? (
                      <p className="mt-2 text-[11px] text-amber-200/85">
                        No country rights rows are visible to this client role in Supabase. Check RLS SELECT policy for
                        qa_country_rights_profiles.
                      </p>
                    ) : null}
                  </div>
                  {isAdmin && editingCountry === country && (
                    <CountryRightsAdminEditor
                      country={country}
                      draft={countryEditorDraft}
                      setDraft={setCountryEditorDraft}
                      isSaving={isSavingCountryProfile}
                      onSave={saveCountryEditor}
                      onCancel={closeCountryEditor}
                      saveError={countryEditorError}
                      saveSuccess={countryEditorSuccess}
                    />
                  )}

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {groupedCities[country].map((city, cityIndex) => (
                      <button
                        key={city.key}
                        ref={(node) => {
                          if (node) {
                            cityCardRefs.current[city.key] = node;
                          } else {
                            delete cityCardRefs.current[city.key];
                          }
                        }}
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            try {
                              const currentState = window.history?.state;
                              const nextState =
                                currentState && typeof currentState === "object"
                                  ? { ...currentState }
                                  : {};
                              nextState[BACK_RESTORE_CITY_KEY] = city.key;
                              window.history.replaceState(nextState, "", window.location.href);
                            } catch {
                              // Ignore history/state restrictions.
                            }
                          }

                          router.push(`/${city.key}`);
                        }}
                        className={`group qa-premium-card relative overflow-hidden rounded-[28px] border border-white/12 px-5 py-5 text-left transition duration-300 hover:-translate-y-[3px] active:translate-y-0 sm:px-6 sm:py-6 ${tone.card} ${tone.hover} ${
                          city.key === lastExploredCity
                            ? "ring-1 ring-white/28 shadow-[0_28px_92px_rgba(0,0,0,0.34),0_0_38px_rgba(186,230,253,0.07)]"
                            : ""
                        }`}
                      >
                        <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/8 opacity-0 blur-3xl transition duration-300 group-hover:opacity-100" />
                        <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-gradient-to-br from-white/7 via-transparent to-transparent" />
                        <div className="relative flex min-h-full flex-col">
                          <div className="flex items-start justify-between gap-5">
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                                {city.country}
                              </p>
                              <h3 className={`mt-2 truncate text-[1.55rem] font-semibold tracking-[-0.035em] text-white transition duration-300 ${tone.titleHover}`}>
                                {city.title}
                              </h3>
                            </div>
                            <span className="mt-0.5 shrink-0 text-[10px] font-medium tabular-nums tracking-[0.14em] text-white/28">
                              {String(cityIndex + 1).padStart(2, "0")}
                            </span>
                          </div>

                          <div className="mt-6 flex items-end gap-7 border-b border-white/[0.09] pb-5">
                            <div>
                              <p className={`text-xl font-semibold tabular-nums leading-none ${tone.primary}`}>
                                {isLoading ? "—" : city.placeCount}
                              </p>
                              <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.17em] text-white/34">Places</p>
                            </div>
                            <div className="h-8 w-px bg-white/[0.09]" aria-hidden="true" />
                            <div>
                              <p className={`text-xl font-semibold tabular-nums leading-none ${tone.secondary}`}>
                                {isEventsLoading ? "—" : city.eventCount}
                              </p>
                              <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.17em] text-white/34">Events</p>
                            </div>
                          </div>

                          <div className="mt-4 min-h-[3.25rem]">
                            <p className="qa-clamp-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">
                              {String(city.vibe || "mixed").replaceAll("_", " ")} atmosphere
                            </p>
                            <p className="qa-clamp-1 mt-1.5 text-sm text-white/57">
                              {city.topPlace
                                ? `Known for ${city.topPlace}`
                                : "Ready for more local discoveries"}
                            </p>
                          </div>

                          <div className="mt-5 flex items-center justify-between pt-1">
                            <div className={`h-px w-14 bg-gradient-to-r ${tone.line} to-transparent transition-all duration-300 group-hover:w-24`} />
                            <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-white/42 transition group-hover:text-white/78">
                              Explore
                              <span aria-hidden="true" className={`${tone.arrow} transition-transform duration-300 group-hover:translate-x-1`}>→</span>
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })()
          ))}
        </div>

      </div>
    </main>
  );
}

function getMapRiskTier(country, profile, snapshot, qariProfile = null) {
  if (qariProfile?.tier?.mapTier) return qariProfile.tier.mapTier;
  return MAP_RISK_TIER_OVERRIDES[country] || deriveMapRiskTier(profile, snapshot);
}

