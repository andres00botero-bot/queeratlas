"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { resolveAdminAccess } from "@/lib/adminAccess";
import { cityCoreConfig as cityConfig } from "@/lib/cityCore";
import { buildRightsSnapshotFromProfile, getCityRightsSignals } from "@/lib/cityRightsSignals";
import { evaluateMapInitReadiness, shouldTriggerMapFallback } from "@/lib/mapInitGuard";
import { loadMapboxGl } from "@/lib/mapboxGlLoader";
import { useMapboxStylesheet } from "@/lib/useMapboxStylesheet";
import { usePlaces } from "@/lib/usePlaces";
import { useCountryRightsProfiles } from "@/lib/useCountryRightsProfiles";
import { listCityClusterTopics } from "@/lib/seo/cityClusters";
import { listTopicHubs } from "@/lib/seo/topicHubs";
import {
  isIndexableTopicHub,
  TIER1_CITY_SLUGS,
  TIER1_TOPIC_KEYS,
} from "@/lib/seo/indexingTier";
import CityRightsSignals from "@/components/cities/CityRightsSignals";
import CountryRightsAdminEditor from "@/components/cities/CountryRightsAdminEditor";
import CitiesSeoClusterPanel from "@/components/cities/CitiesSeoClusterPanel";
import EmptyState from "@/components/ui/EmptyState";

const COUNTRY_TONES = [
  {
    section: "border-fuchsia-300/14 bg-[radial-gradient(circle_at_12%_14%,rgba(244,114,182,0.14),transparent_26%),radial-gradient(circle_at_86%_18%,rgba(59,130,246,0.11),transparent_30%),linear-gradient(180deg,rgba(20,20,20,0.96),rgba(10,10,10,0.99))]",
    chip: "border-fuchsia-200/18 bg-fuchsia-200/[0.08] text-fuchsia-100/78",
    divider: "from-fuchsia-300/22",
    card: "bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.09),transparent_24%),radial-gradient(circle_at_92%_16%,rgba(96,165,250,0.08),transparent_28%),linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))]",
    hover: "hover:border-fuchsia-200/24 hover:shadow-[0_24px_75px_rgba(217,70,239,0.18),0_18px_45px_rgba(14,165,233,0.12)]",
    pill: "border-fuchsia-200/16 bg-fuchsia-200/[0.08] text-fuchsia-100/76",
  },
  {
    section: "border-cyan-300/14 bg-[radial-gradient(circle_at_16%_14%,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(168,85,247,0.12),transparent_30%),linear-gradient(180deg,rgba(20,20,20,0.96),rgba(10,10,10,0.99))]",
    chip: "border-cyan-200/18 bg-cyan-200/[0.08] text-cyan-100/80",
    divider: "from-cyan-300/24",
    card: "bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.09),transparent_24%),radial-gradient(circle_at_92%_16%,rgba(168,85,247,0.08),transparent_28%),linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))]",
    hover: "hover:border-cyan-200/24 hover:shadow-[0_24px_75px_rgba(34,211,238,0.15),0_18px_45px_rgba(168,85,247,0.12)]",
    pill: "border-cyan-200/16 bg-cyan-200/[0.08] text-cyan-100/76",
  },
  {
    section: "border-fuchsia-300/14 bg-[radial-gradient(circle_at_12%_16%,rgba(244,114,182,0.13),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(34,211,238,0.10),transparent_30%),linear-gradient(180deg,rgba(20,20,20,0.96),rgba(10,10,10,0.99))]",
    chip: "border-fuchsia-200/18 bg-fuchsia-200/[0.08] text-fuchsia-100/80",
    divider: "from-fuchsia-300/24",
    card: "bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.09),transparent_24%),radial-gradient(circle_at_92%_16%,rgba(34,211,238,0.08),transparent_28%),linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))]",
    hover: "hover:border-fuchsia-200/24 hover:shadow-[0_24px_75px_rgba(244,114,182,0.16),0_18px_45px_rgba(34,211,238,0.10)]",
    pill: "border-fuchsia-200/16 bg-fuchsia-200/[0.08] text-fuchsia-100/76",
  },
];

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
const MAP_RISK_PALETTE = {
  open: { label: "Open", color: "#3b82f6" },
  steady: { label: "Steady", color: "#22c55e" },
  watch: { label: "Watch", color: "#facc15" },
  caution: { label: "Caution", color: "#f472b6" },
  restricted: { label: "Restricted", color: "#dc2626" },
  unknown: { label: "Unknown", color: "#64748b" },
};
const LAST_EXPLORED_CITY_KEY = "qa_last_explored_city";
const BACK_RESTORE_CITY_KEY = "qa_back_restore_city";
const CITIES_METRICS_DAILY_CACHE_KEY = "qa_cities_metrics_daily_v1";
const CITIES_CANONICAL_URL = "https://www.queeratlas.app/cities";
const CITY_NAME_COLLATOR = new Intl.Collator("en", {
  sensitivity: "base",
  numeric: true,
});

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [countryPickerQuery, setCountryPickerQuery] = useState("");
  const [mapError, setMapError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingCountry, setEditingCountry] = useState("");
  const [countryEditorDraft, setCountryEditorDraft] = useState(null);
  const [isSavingCountryProfile, setIsSavingCountryProfile] = useState(false);
  const [countryEditorError, setCountryEditorError] = useState("");
  const [countryEditorSuccess, setCountryEditorSuccess] = useState("");
  const [dailyMetricsSnapshot, setDailyMetricsSnapshot] = useState(null);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const mapboxMissing = !mapboxToken;
  const countrySectionRefs = useRef({});
  const cityCardRefs = useRef({});
  const lastCityAutoFocusRef = useRef("");
  const countryPickerRef = useRef(null);
  const countryMapContainerRef = useRef(null);
  const countryMapRef = useRef(null);
  const { places, isLoading } = usePlaces();
  const {
    profiles: countryRightsProfiles,
    isLoading: isCountryRightsLoading,
    loadError: countryRightsLoadError,
    refresh: refreshCountryRightsProfiles,
  } = useCountryRightsProfiles();
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
    return ["All", ...new Set(Object.values(cityConfig).map((city) => city.country || "Other"))].sort();
  }, []);
  const availableCountries = useMemo(() => countries.filter((country) => country !== "All"), [countries]);

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
      const tier = deriveMapRiskTier(profile, snapshot);
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
  }, [availableCountries, countryRightsProfiles]);

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
          attributionControl: false,
        });

        countryMapRef.current = map;

        map.on("load", () => {
          if (!map.getSource("qa-country-boundaries")) {
            map.addSource("qa-country-boundaries", {
              type: "vector",
              url: "mapbox://mapbox.country-boundaries-v1",
            });
          }

          map.addLayer({
            id: "qa-countries-fill",
            type: "fill",
            source: "qa-country-boundaries",
            "source-layer": "country_boundaries",
            paint: {
              "fill-color": "#111111",
              "fill-opacity": 0.12,
            },
          });

          map.addLayer({
            id: "qa-countries-line",
            type: "line",
            source: "qa-country-boundaries",
            "source-layer": "country_boundaries",
            paint: {
              "line-color": "rgba(255,255,255,0.24)",
              "line-width": 0.45,
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
          const matchedCountry = resolveMapboxCountryToAppCountry(rawCountry, availableCountries);

          if (!matchedCountry) {
            return;
          }

          setSelectedCountry(matchedCountry);
          setCountryPickerOpen(false);
          setCountryPickerQuery("");
          scrollToCountrySection(matchedCountry);
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
    if (!countryPickerOpen) return undefined;

    const handleClickOutside = (event) => {
      if (!countryPickerRef.current) return;
      if (countryPickerRef.current.contains(event.target)) return;
      setCountryPickerOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      setCountryPickerOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [countryPickerOpen]);

  const allCities = useMemo(() => {
    return Object.entries(cityConfig).map(([key, city]) => {
      const cityPlaces = places.filter((place) => place.city?.toLowerCase() === key);
      const reviewCount = cityPlaces.reduce(
        (sum, place) => sum + (place.reviewCount || 0),
        0
      );
      const avgRating =
        cityPlaces.reduce((sum, place) => sum + (place.avgRating || 0), 0) /
        (cityPlaces.length || 1);
      const topPlace = cityPlaces
        .slice()
        .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))[0];

      return {
        key,
        ...city,
        placeCount: cityPlaces.length,
        reviewCount,
        avgRating: cityPlaces.length ? avgRating : null,
        topPlace: topPlace?.name || null,
      };
    });
  }, [places]);

  const filteredCities = useMemo(() => {
    return allCities
      .filter((city) => {
        if (selectedCountry !== "All" && city.country !== selectedCountry) return false;

        if (!query) return true;

        const search = query.toLowerCase();
        return (
          city.title.toLowerCase().includes(search) ||
          city.country?.toLowerCase().includes(search) ||
          city.vibe?.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => CITY_NAME_COLLATOR.compare(a.title, b.title));
  }, [allCities, query, selectedCountry]);

  const lastExploredCityRecord = useMemo(
    () => allCities.find((city) => city.key === lastExploredCity) || null,
    [allCities, lastExploredCity],
  );

  const countryStats = useMemo(() => {
    const stats = allCities.reduce((acc, city) => {
      const country = city.country || "Other";
      if (!acc[country]) {
        acc[country] = { cityCount: 0, reviewCount: 0 };
      }
      acc[country].cityCount += 1;
      acc[country].reviewCount += Number(city.reviewCount || 0);
      return acc;
    }, {});

    return availableCountries
      .map((country) => ({
        country,
        cityCount: stats[country]?.cityCount || 0,
        reviewCount: stats[country]?.reviewCount || 0,
      }))
      .sort((a, b) => {
        if (b.cityCount !== a.cityCount) return b.cityCount - a.cityCount;
        if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
        return a.country.localeCompare(b.country);
      });
  }, [allCities, availableCountries]);

  const topCountries = useMemo(() => countryStats.slice(0, 7), [countryStats]);

  const filteredCountryOptions = useMemo(() => {
    const search = String(countryPickerQuery || "").trim().toLowerCase();
    const withAll = [{ country: "All", cityCount: allCities.length, reviewCount: places.length }, ...countryStats];
    if (!search) return withAll;
    return withAll.filter((item) => item.country.toLowerCase().includes(search));
  }, [allCities.length, countryPickerQuery, countryStats, places.length]);

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
    () => TIER1_CITY_SLUGS.filter((cityKey) => Boolean(cityConfig[cityKey])),
    []
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
  const totalCities = Object.keys(cityConfig).length;
  const totalCountries = countries.length - 1;
  const totalPlaces = places.length;
  const visibleCityCount = filteredCities.length;
  const activeFilterLabel = selectedCountry === "All" ? "All countries" : selectedCountry;
  const filterModeLabel = query ? "Search + country filter" : "Country filter";
  const metricsForCards = useMemo(
    () => ({
      cities:
        Number.isFinite(Number(dailyMetricsSnapshot?.cities))
          ? Number(dailyMetricsSnapshot.cities)
          : totalCities,
      countries:
        Number.isFinite(Number(dailyMetricsSnapshot?.countries))
          ? Number(dailyMetricsSnapshot.countries)
          : totalCountries,
      places:
        Number.isFinite(Number(dailyMetricsSnapshot?.places))
          ? Number(dailyMetricsSnapshot.places)
          : totalPlaces,
    }),
    [dailyMetricsSnapshot, totalCities, totalCountries, totalPlaces]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(CITIES_METRICS_DAILY_CACHE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (String(parsed?.dateKey || "") !== getLocalDateKey()) return;
      queueMicrotask(() => {
        setDailyMetricsSnapshot({
          dateKey: String(parsed.dateKey),
          cities: Number(parsed.cities) || 0,
          countries: Number(parsed.countries) || 0,
          places: Number(parsed.places) || 0,
        });
      });
    } catch {
      // Ignore cache parse/storage issues.
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const dateKey = getLocalDateKey();
    queueMicrotask(() => {
      setDailyMetricsSnapshot((current) => {
        if (String(current?.dateKey || "") === dateKey) {
          return current;
        }

        const nextSnapshot = {
          dateKey,
          cities: Number(totalCities) || 0,
          countries: Number(totalCountries) || 0,
          places: Number(totalPlaces) || 0,
        };

        try {
          localStorage.setItem(CITIES_METRICS_DAILY_CACHE_KEY, JSON.stringify(nextSnapshot));
        } catch {
          // Ignore storage write issues.
        }

        return nextSnapshot;
      });
    });
  }, [isLoading, totalCities, totalCountries, totalPlaces]);

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
        cityConfig?.[cityKey]?.title ||
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
  }, [crawlPathCities]);

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

        <section className="qa-panel qa-premium-card relative mb-8 overflow-hidden rounded-[36px] border border-amber-300/10 bg-[#0f0618] p-8 shadow-[0_36px_126px_rgba(0,0,0,0.42)]">
          <div className="pointer-events-none absolute inset-0">
            <Image
              src="/city-assets/cities-hero-network-v2.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "center 38%" }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,6,18,0.42),rgba(11,6,18,0.70)_56%,rgba(11,6,18,0.9)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(251,191,36,0.16),transparent_28%),radial-gradient(circle_at_84%_20%,rgba(244,114,182,0.15),transparent_26%)]" />
          </div>
          <div className="relative z-10 max-w-4xl">
            <p className="qa-eyebrow text-white/45">
              Live Discovery + Atlas Signal
            </p>
            <h1 className="qa-display qa-h1 mt-4 bg-gradient-to-r from-cyan-100 via-white to-fuchsia-100 bg-clip-text text-5xl font-bold text-transparent sm:text-6xl">
              Cities Atlas
            </h1>
            <p className="qa-lead mt-5 max-w-2xl text-base text-white/62">
              Browse queer cities by country, scan signal quickly, and jump straight
              into the local atlas. Built to scale globally without turning into chaos.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-200/18 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-cyan-100/85">
                {filterModeLabel}
              </span>
              <span className="rounded-full border border-fuchsia-200/18 bg-fuchsia-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-fuchsia-100/85">
                {activeFilterLabel}
              </span>
              <span className="rounded-full border border-white/14 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/72">
                {visibleCityCount} visible
              </span>
              {lastExploredCityRecord && (
                <button
                  type="button"
                  onClick={() => router.push(`/${lastExploredCityRecord.key}`)}
                  className="rounded-full border border-emerald-200/22 bg-emerald-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-emerald-100/86 transition hover:border-emerald-200/36 hover:text-white"
                >
                  Last explored: {lastExploredCityRecord.title}
                </button>
              )}
            </div>
          </div>

          <div className="relative z-10 mt-7 grid gap-3 sm:grid-cols-3">
            <div className="qa-card qa-premium-card rounded-2xl border border-fuchsia-200/10 bg-fuchsia-200/[0.06] p-4 shadow-[0_14px_30px_rgba(236,72,153,0.14),0_8px_20px_rgba(0,0,0,0.24)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Cities</p>
              <p className="mt-2 text-2xl font-semibold text-white">{metricsForCards.cities}</p>
            </div>
            <div className="qa-card qa-premium-card rounded-2xl border border-cyan-200/10 bg-cyan-200/[0.05] p-4 shadow-[0_14px_30px_rgba(6,182,212,0.14),0_8px_20px_rgba(0,0,0,0.24)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Countries</p>
              <p className="mt-2 text-2xl font-semibold text-white">{metricsForCards.countries}</p>
            </div>
            <div className="qa-card qa-premium-card rounded-2xl border border-cyan-200/10 bg-cyan-200/[0.05] p-4 shadow-[0_14px_30px_rgba(34,197,94,0.13),0_8px_20px_rgba(0,0,0,0.24)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Places</p>
              <p className="mt-2 text-2xl font-semibold text-white">{metricsForCards.places}</p>
            </div>
          </div>

        </section>

        <section className="qa-panel qa-premium-card relative mb-8 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.96),rgba(10,10,10,0.99))] p-6 shadow-[0_30px_104px_rgba(0,0,0,0.34)]">
          <div className="mb-5 overflow-hidden rounded-[28px] border border-cyan-200/16 bg-[radial-gradient(circle_at_20%_12%,rgba(34,211,238,0.15),transparent_34%),radial-gradient(circle_at_86%_14%,rgba(244,114,182,0.12),transparent_34%),linear-gradient(180deg,rgba(10,10,10,0.88),rgba(8,8,8,0.96))]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/72">
                Interactive country filter
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {Object.entries(MAP_RISK_PALETTE).map(([key, item]) => (
                  <span
                    key={`map-safety-${key}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/14 bg-black/30 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white/75"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.label}
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  setSelectedCountry("All");
                  setCountryPickerOpen(false);
                  setCountryPickerQuery("");
                }}
                className="qa-action rounded-full border border-white/16 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/70 transition hover:border-white/24 hover:text-white"
              >
                Show all
              </button>
            </div>
            <div ref={countryMapContainerRef} className="h-[320px] w-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />
            {(mapboxMissing || mapError) && (
              <p className="border-t border-white/10 px-4 py-3 text-sm text-amber-100/85">
                {mapboxMissing
                  ? "Mapbox token missing. Add NEXT_PUBLIC_MAPBOX_TOKEN to enable world map filter."
                  : mapError}
              </p>
            )}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-white/38">
                Search atlas
              </p>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search city, country, or vibe"
                className="mt-3 w-full rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-4 py-4 text-sm outline-none transition focus:border-fuchsia-300/35 focus:ring-2 focus:ring-fuchsia-300/20"
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-white/38">
                Country filter
              </p>
              <div className="mt-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {topCountries.map((item) => {
                    const active = selectedCountry === item.country;
                    return (
                      <button
                        key={`top-country-${item.country}`}
                        onClick={() => {
                          setSelectedCountry(item.country);
                          setCountryPickerOpen(false);
                          setCountryPickerQuery("");
                          scrollToCountrySection(item.country);
                        }}
                        className={`qa-action rounded-full border px-3 py-1.5 text-xs transition ${
                          active
                            ? "border-fuchsia-300/36 bg-fuchsia-300/14 text-white shadow-[0_16px_42px_rgba(217,70,239,0.16)]"
                            : "border-white/10 bg-white/6 text-white/70 hover:border-white/22 hover:text-white"
                        }`}
                      >
                        {item.country}
                      </button>
                    );
                  })}
                </div>
                <div ref={countryPickerRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setCountryPickerOpen((current) => !current)}
                    className="qa-action flex w-full items-center justify-between rounded-2xl border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-4 py-3 text-left text-sm text-white/84 transition hover:border-cyan-200/32"
                  >
                    <span className="truncate">
                      {selectedCountry === "All" ? "All countries" : selectedCountry}
                    </span>
                    <span className="text-white/55">{countryPickerOpen ? "Close" : "Choose"}</span>
                  </button>

                  {countryPickerOpen && (
                    <div className="mt-2 w-full overflow-hidden rounded-2xl border border-white/12 bg-[#101015]/95 shadow-[0_28px_84px_rgba(0,0,0,0.45)] backdrop-blur">
                      <div className="border-b border-white/10 p-2.5">
                        <input
                          value={countryPickerQuery}
                          onChange={(event) => setCountryPickerQuery(event.target.value)}
                          placeholder="Search country"
                          className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/18"
                        />
                      </div>
                      <div className="max-h-80 overflow-y-auto p-2">
                        {filteredCountryOptions.map((item) => {
                          const active = selectedCountry === item.country;
                          return (
                            <button
                              key={`country-option-${item.country}`}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(item.country);
                                setCountryPickerOpen(false);
                                setCountryPickerQuery("");
                                scrollToCountrySection(item.country);
                              }}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                                active
                                  ? "bg-fuchsia-300/16 text-white"
                                  : "text-white/78 hover:bg-white/8 hover:text-white"
                              }`}
                            >
                              <span>{item.country === "All" ? "All countries" : item.country}</span>
                              <span className="text-[11px] uppercase tracking-[0.12em] text-white/45">
                                {item.cityCount} cities
                              </span>
                            </button>
                          );
                        })}
                        {filteredCountryOptions.length === 0 && (
                          <p className="px-3 py-2 text-sm text-white/52">No country match.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                    setCountryPickerOpen(false);
                    setCountryPickerQuery("");
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

              return (
                <section
                  key={country}
                  ref={(node) => {
                    if (node) {
                      countrySectionRefs.current[country] = node;
                    } else {
                      delete countrySectionRefs.current[country];
                    }
                  }}
                  className={`qa-premium-card rounded-[32px] border p-6 shadow-[0_28px_98px_rgba(0,0,0,0.34)] ${tone.section}`}
                >
                  <div className="mb-6 flex items-center gap-4">
                    <div className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.24em] ${tone.chip}`}>
                      {country}
                    </div>
                    <div className={`h-px flex-1 bg-gradient-to-r ${tone.divider} to-transparent`} />
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

                  <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-3">
                    <CityRightsSignals snapshot={countryRightsSnapshots[country]} />
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
                        className={`group qa-premium-card relative overflow-hidden rounded-[28px] border border-white/12 p-5 text-left transition duration-300 hover:-translate-y-[4px] active:translate-y-0 ${tone.card} ${tone.hover} ${
                          city.key === lastExploredCity
                            ? "ring-1 ring-emerald-300/45 shadow-[0_28px_92px_rgba(16,185,129,0.22)]"
                            : ""
                        }`}
                      >
                        <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/8 opacity-0 blur-3xl transition duration-300 group-hover:opacity-100" />
                        <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-gradient-to-br from-white/7 via-transparent to-transparent" />
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-white/34">
                              {city.country}
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white drop-shadow-[0_4px_22px_rgba(255,255,255,0.07)] transition group-hover:translate-x-[2px]">
                              {city.title}
                            </h2>
                          </div>

                          <div className={`rounded-full border px-3 py-1 text-xs transition group-hover:scale-[1.03] ${tone.pill}`}>
                            #{cityIndex + 1}
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-amber-200/12 bg-amber-200/[0.06] p-3">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/34">
                              Avg rating
                            </p>
                            <p className="mt-2 text-lg font-semibold text-white/96">
                              {city.avgRating ? city.avgRating.toFixed(1) : "-"}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-cyan-200/12 bg-cyan-200/[0.06] p-3">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/34">
                              Places
                            </p>
                            <p className="mt-2 text-lg font-semibold text-white/96">
                              {city.placeCount}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-white/36">
                            Signal
                          </p>
                          <p className="qa-clamp-2 mt-2 text-sm capitalize text-white/68">
                            {String(city.vibe || "mixed").replaceAll("_", " ")} atmosphere
                          </p>
                          <p className="qa-clamp-2 mt-2 text-sm text-white/52">
                            {city.topPlace
                              ? `Top place: ${city.topPlace}`
                              : "This city is ready for more local signal."}
                          </p>
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                          <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-amber-200 via-fuchsia-300 to-cyan-300 opacity-85 transition-all duration-300 group-hover:w-36" />
                          <span className="text-[11px] uppercase tracking-[0.18em] text-white/40 transition group-hover:text-white/72">
                            Open
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })()
          ))}
        </div>

        <CitiesSeoClusterPanel
          cityKeys={crawlPathCities}
          topicHubKeys={topicHubKeys}
          crawlClusterCities={crawlClusterCities}
          crawlClusterTopics={crawlClusterTopics}
        />
      </div>
    </main>
  );
}

