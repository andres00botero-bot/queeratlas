"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cityConfig } from "@/lib/cities";
import { usePlaces } from "@/lib/usePlaces";
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
    section: "border-amber-300/14 bg-[radial-gradient(circle_at_10%_16%,rgba(251,191,36,0.16),transparent_24%),radial-gradient(circle_at_84%_14%,rgba(45,212,191,0.10),transparent_28%),linear-gradient(180deg,rgba(20,20,20,0.96),rgba(10,10,10,0.99))]",
    chip: "border-amber-200/18 bg-amber-200/[0.08] text-amber-100/78",
    divider: "from-amber-300/22",
    card: "bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.09),transparent_24%),radial-gradient(circle_at_92%_16%,rgba(45,212,191,0.08),transparent_28%),linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))]",
    hover: "hover:border-amber-200/24 hover:shadow-[0_24px_75px_rgba(251,191,36,0.16),0_18px_45px_rgba(45,212,191,0.10)]",
    pill: "border-amber-200/16 bg-amber-200/[0.08] text-amber-100/76",
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
    section: "border-emerald-300/14 bg-[radial-gradient(circle_at_12%_16%,rgba(52,211,153,0.14),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(59,130,246,0.10),transparent_30%),linear-gradient(180deg,rgba(20,20,20,0.96),rgba(10,10,10,0.99))]",
    chip: "border-emerald-200/18 bg-emerald-200/[0.08] text-emerald-100/80",
    divider: "from-emerald-300/24",
    card: "bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.09),transparent_24%),radial-gradient(circle_at_92%_16%,rgba(59,130,246,0.08),transparent_28%),linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))]",
    hover: "hover:border-emerald-200/24 hover:shadow-[0_24px_75px_rgba(52,211,153,0.16),0_18px_45px_rgba(59,130,246,0.10)]",
    pill: "border-emerald-200/16 bg-emerald-200/[0.08] text-emerald-100/76",
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
  Netherlands: ["Netherlands", "The Netherlands"],
};

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

export default function CitiesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [mapError, setMapError] = useState("");
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const mapboxMissing = !mapboxToken;
  const countrySectionRefs = useRef({});
  const countryMapContainerRef = useRef(null);
  const countryMapRef = useRef(null);
  const { places, isLoading } = usePlaces();

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

    map.setPaintProperty("qa-countries-fill", "fill-color", [
      "case",
      ["in", countryNameExpression, ["literal", selectedNames]],
      "#fb7185",
      ["in", countryNameExpression, ["literal", supportedNames]],
      "#22d3ee",
      "#111111",
    ]);

    map.setPaintProperty("qa-countries-fill", "fill-opacity", [
      "case",
      ["in", countryNameExpression, ["literal", selectedNames]],
      0.48,
      ["in", countryNameExpression, ["literal", supportedNames]],
      0.2,
      0.08,
    ]);
  }, [availableCountries]);

  useEffect(() => {
    if (!countryMapContainerRef.current || countryMapRef.current) return;
    if (!mapboxToken) return;

    const hasWebGlSupport =
      typeof mapboxgl.supported === "function"
        ? mapboxgl.supported({ failIfMajorPerformanceCaveat: false })
        : true;

    if (!hasWebGlSupport) {
      queueMicrotask(() => {
        setMapError("World map is unavailable in this browser or device (WebGL not supported).");
      });
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    let map;
    try {
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
    } catch (error) {
      console.warn("Map initialization skipped:", error);
      queueMicrotask(() => {
        setMapError("Could not start world map on this device right now.");
      });
      return;
    }

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
      scrollToCountrySection(matchedCountry);
    });

    map.on("error", () => {
      setMapError("Could not load world map right now.");
    });

    return () => {
      map.remove();
      countryMapRef.current = null;
    };
  }, [availableCountries, mapboxToken, scrollToCountrySection, selectedCountry, updateCountryMapStyles]);

  useEffect(() => {
    updateCountryMapStyles(selectedCountry);
  }, [selectedCountry, updateCountryMapStyles]);

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
      .sort((a, b) => {
        if ((b.reviewCount || 0) !== (a.reviewCount || 0)) {
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        }

        return a.title.localeCompare(b.title);
      });
  }, [allCities, query, selectedCountry]);

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

  const visibleCountries = Object.keys(groupedCities).sort();
  const totalCities = Object.keys(cityConfig).length;
  const totalCountries = countries.length - 1;
  const totalPlaces = places.length;

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-8 text-white">
      <div className="relative mx-auto max-w-7xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.08),transparent_20%),radial-gradient(circle_at_76%_14%,rgba(96,165,250,0.08),transparent_20%),radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.06),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%)]" />

        <section className="relative mb-8 overflow-hidden rounded-[36px] border border-amber-300/10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.10),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(45,212,191,0.10),transparent_24%),linear-gradient(135deg,rgba(29,23,18,0.98),rgba(10,10,10,0.99),rgba(19,24,27,0.97))] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
          <div className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              Global discovery
            </p>
            <h1 className="mt-4 text-5xl font-bold tracking-[-0.04em] text-white sm:text-6xl">
              Cities
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              Browse queer cities by country, scan signal quickly, and jump straight
              into the local atlas. Built to scale globally without turning into chaos.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-amber-200/10 bg-amber-200/[0.06] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Cities</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalCities}</p>
            </div>
            <div className="rounded-3xl border border-sky-200/10 bg-sky-200/[0.05] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Countries</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalCountries}</p>
            </div>
            <div className="rounded-3xl border border-emerald-200/10 bg-emerald-200/[0.05] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Places</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalPlaces}</p>
            </div>
          </div>
        </section>

        <section className="relative mb-8 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.96),rgba(10,10,10,0.99))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
          <div className="mb-5 overflow-hidden rounded-[28px] border border-cyan-200/16 bg-[radial-gradient(circle_at_20%_12%,rgba(34,211,238,0.15),transparent_34%),radial-gradient(circle_at_86%_14%,rgba(244,114,182,0.12),transparent_34%),linear-gradient(180deg,rgba(10,10,10,0.88),rgba(8,8,8,0.96))]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/72">
                Interactive country filter
              </p>
              <button
                onClick={() => setSelectedCountry("All")}
                className="rounded-full border border-white/16 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/70 transition hover:border-white/24 hover:text-white"
              >
                Show all
              </button>
            </div>
            <div ref={countryMapContainerRef} className="h-[320px] w-full" />
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
                className="mt-3 w-full rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-4 py-4 text-sm outline-none transition focus:border-fuchsia-300/35"
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-white/38">
                Country filter
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {countries.map((country) => {
                  const active = selectedCountry === country;

                  return (
                    <button
                      key={country}
                      onClick={() => {
                        setSelectedCountry(country);
                        scrollToCountrySection(country);
                      }}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        active
                          ? "border-fuchsia-300/28 bg-fuchsia-300/12 text-white shadow-[0_10px_30px_rgba(217,70,239,0.10)]"
                          : "border-white/8 bg-white/4 text-white/58 hover:border-white/14 hover:text-white/80"
                      }`}
                    >
                      {country}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="relative space-y-8">
          {isLoading && (
            <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.99))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
              <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/45">Loading city signal</p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`city-skeleton-${index}`}
                    className="animate-pulse rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5"
                    aria-hidden="true"
                  >
                    <div className="h-3 w-20 rounded-full bg-white/14" />
                    <div className="mt-3 h-6 w-32 rounded-full bg-white/12" />
                    <div className="mt-5 h-3 w-full rounded-full bg-white/8" />
                    <div className="mt-2 h-3 w-5/6 rounded-full bg-white/8" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {!isLoading && visibleCountries.length === 0 && (
            <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.99))] p-10 text-center shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
              <EmptyState
                title="No cities match this filter yet."
                description="Try resetting search and country to reopen the atlas."
              >
                <button
                  onClick={() => {
                    setQuery("");
                    setSelectedCountry("All");
                  }}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-white/25 hover:text-white"
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
                  className={`rounded-[32px] border p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] ${tone.section}`}
                >
                  <div className="mb-6 flex items-center gap-4">
                    <div className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.24em] ${tone.chip}`}>
                      {country}
                    </div>
                    <div className={`h-px flex-1 bg-gradient-to-r ${tone.divider} to-transparent`} />
                    <div className="text-xs text-white/38">
                      {groupedCities[country].length} cities
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {groupedCities[country].map((city) => (
                      <button
                        key={city.key}
                        onClick={() => router.push(`/${city.key}`)}
                        className={`group relative overflow-hidden rounded-[28px] border border-white/12 p-5 text-left transition duration-300 hover:-translate-y-[4px] active:translate-y-0 ${tone.card} ${tone.hover}`}
                      >
                        <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/8 opacity-0 blur-3xl transition duration-300 group-hover:opacity-100" />
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
                            {city.placeCount} places
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
                              Reviews
                            </p>
                            <p className="mt-2 text-lg font-semibold text-white/96">
                              {city.reviewCount}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-white/36">
                            Signal
                          </p>
                          <p className="mt-2 text-sm capitalize text-white/68">
                            {String(city.vibe || "mixed").replaceAll("_", " ")} atmosphere
                          </p>
                          <p className="mt-2 text-sm text-white/52">
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
      </div>
    </main>
  );
}
