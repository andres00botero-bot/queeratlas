"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePlaces } from "@/lib/usePlaces";
import { mergeSeedEventsAsync } from "@/lib/seedMerge";
import { buildAtlasSearchResults } from "@/lib/search";
import { cityConfig } from "@/lib/cities";
import { useAuth } from "@/lib/auth";
import { getEntityQuality, getQualityMap, getQualityStatus } from "@/lib/quality";
import { cityPath, citySelectionPath } from "@/lib/cityRouting";
import { readLocalJson, writeLocalJson, writeLocalValue } from "@/lib/storage";
import { trackKpiEvent } from "@/lib/analytics";
import EmptyState from "@/components/ui/EmptyState";

const TYPE_FILTERS = ["all", "city", "place", "event"];
const QUALITY_FILTERS = ["all", "verified", "needs_refresh", "unverified"];

function normalizeValue(value) {
  return String(value || "").trim().toLowerCase();
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
  const [query, setQuery] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  });
  const [events, setEvents] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [vibeFilter, setVibeFilter] = useState("all");
  const [qualityFilter, setQualityFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [favorites, setFavorites] = useState(() => {
    if (typeof window === "undefined") return [];
    return readLocalJson("qa_favorites", []);
  });
  const { places } = usePlaces();
  const { isMember } = useAuth();
  const deferredQuery = useDeferredValue(query);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    const { data, error } = await supabase
      .from("events")
      .select("*")
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

  const results = useMemo(
    () =>
      buildAtlasSearchResults({
        query: deferredQuery,
        places,
        events,
        cityLimit: 50,
        placeLimit: 300,
        eventLimit: 300,
        favoriteIds: favorites,
        qualityMap,
        preferredCity: cityFilter === "all" ? "" : cityFilter,
      }),
    [cityFilter, deferredQuery, events, favorites, places, qualityMap]
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
    const configVibes = Object.values(cityConfig).map((city) => city.vibe || "").filter(Boolean);
    const placeVibes = places.map((item) => item.vibe || item.type || "").filter(Boolean);
    const eventVibes = events.map((item) => item.vibe || "").filter(Boolean);

    const vibes = [...configVibes, ...placeVibes, ...eventVibes]
      .map((item) => String(item || "").trim())
      .filter(Boolean);

    return ["all", ...new Set(vibes)].sort((a, b) => a.localeCompare(b));
  }, [events, places]);

  const filteredAll = useMemo(() => {
    const list = results.all.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;

      if (cityFilter !== "all") {
        const itemCity = item.type === "city" ? item.name : item.city || "";
        if (normalizeValue(itemCity) !== normalizeValue(cityFilter)) return false;
      }

      if (vibeFilter !== "all") {
        const itemVibe = item.vibe || item.type || "";
        if (normalizeValue(itemVibe) !== normalizeValue(vibeFilter)) return false;
      }

      if (qualityFilter !== "all" && (item.type === "place" || item.type === "event")) {
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

        if (key !== qualityFilter) return false;
      }

      if (qualityFilter !== "all" && item.type === "city") return false;

      return true;
    });

    return list.sort((a, b) => b.score - a.score);
  }, [cityFilter, qualityFilter, qualityMap, results.all, typeFilter, vibeFilter]);

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

  const toggleFavorite = (id) => {
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter((entry) => entry !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    writeLocalJson("qa_favorites", updated);
    if (!favorites.includes(id)) {
      trackKpiEvent("favorite_saved", {
        targetType: String(id).startsWith("event-") ? "event" : "place",
        targetId: String(id),
      });
    }
  };

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

  const submitSearch = (event) => {
    event.preventDefault();
    router.replace(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <main className="qa-page min-h-screen bg-[#050505] text-white">
      <div className="qa-shell">
        <section className="qa-panel mb-8 rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.08),transparent_20%),radial-gradient(circle_at_80%_16%,rgba(59,130,246,0.08),transparent_20%),linear-gradient(160deg,rgba(22,22,22,0.96),rgba(10,10,10,0.99))] p-7">
          <p className="qa-eyebrow text-white/45">Global search</p>
          <h1 className="qa-display qa-h1 mt-3 text-4xl font-semibold">Find signal instantly</h1>
          <form onSubmit={submitSearch} className="mt-5 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search city, venue, event, vibe"
                className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pl-12 pr-4 outline-none focus:border-fuchsia-300/40"
              />
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
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      typeFilter === item
                        ? "border-fuchsia-300/28 bg-fuchsia-300/12 text-fuchsia-100"
                        : "border-white/12 bg-white/5 text-white/65 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {item === "all" ? "All" : `${item[0].toUpperCase()}${item.slice(1)}s`}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">City</p>
              <select
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
              <select
                value={vibeFilter}
                onChange={(event) => setVibeFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm outline-none"
              >
                {vibeOptions.map((vibe) => (
                  <option key={vibe} value={vibe}>
                    {vibe === "all" ? "All vibes" : vibe}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Quality</p>
              <select
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
          <p className="mt-4 text-xs text-white/45">
            {filteredResults.all.length} matches | {filteredResults.cities.length} cities | {filteredResults.places.length} places | {filteredResults.events.length} events
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
                onClick={fetchEvents}
                className="mt-2 rounded-full border border-rose-200/25 bg-rose-200/10 px-3 py-1 text-[11px] text-rose-100 transition hover:border-rose-200/40"
              >
                Retry
              </button>
            </div>
          )}
        </section>

        {!query.trim() && (
          <section className="qa-panel rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.95),rgba(10,10,10,0.99))] p-8">
            <EmptyState
              title="Start with a city, venue name, event title, or vibe keyword."
              description="Search across cities, places, and events in one move."
              primaryActionLabel="Browse cities"
              onPrimaryAction={() => router.push("/cities")}
            />
          </section>
        )}

        {query.trim() && isLoading && (
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

        {query.trim() && !isLoading && filteredResults.all.length === 0 && (
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

        {filteredResults.cities.length > 0 && (
          <section className="mb-6 rounded-[28px] border border-cyan-300/12 bg-[linear-gradient(180deg,rgba(14,37,52,0.60),rgba(10,10,10,0.98))] p-5">
            <h2 className="mb-4 text-lg font-semibold text-cyan-100">Cities</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredResults.cities.map((city) => (
                <button key={city.id} onClick={() => openResult(city)} className="rounded-2xl border border-white/10 bg-black/35 p-4 text-left transition hover:border-cyan-200/30">
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">{city.country}</p>
                  <p className="mt-2 text-base font-semibold">{city.title}</p>
                  <p className="mt-2 text-xs text-white/45">Vibe: {city.vibe || "mixed"}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {filteredResults.places.length > 0 && (
          <section className="mb-6 rounded-[28px] border border-rose-300/12 bg-[linear-gradient(180deg,rgba(56,20,40,0.58),rgba(10,10,10,0.98))] p-5">
            <h2 className="mb-4 text-lg font-semibold text-rose-100">Places</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredResults.places.map((place) => {
                const favoriteId = String(place.id);
                const saved = favorites.includes(favoriteId);
                const qualityStatus = getQualityStatus(
                  getEntityQuality({
                    targetType: "place",
                    targetId: place.id,
                    entity: place,
                    map: qualityMap,
                  })
                );
                return (
                  <div
                    key={place.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openResult(place)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        openResult(place);
                      }
                    }}
                    className="cursor-pointer rounded-2xl border border-white/10 bg-black/35 p-4 text-left transition hover:border-rose-200/30"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{place.name}</p>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          if (!isMember) {
                            writeLocalValue("qa_redirect", `/search?q=${encodeURIComponent(query.trim())}`);
                            writeLocalValue("qa_post_login_target", `/search?q=${encodeURIComponent(query.trim())}`);
                            router.push("/?join=true");
                            return;
                          }
                          toggleFavorite(favoriteId);
                        }}
                        className={`rounded-full border px-3 py-1 text-xs ${saved ? "border-rose-300/25 bg-rose-300/10 text-rose-100" : "border-white/12 bg-white/5 text-white/65"}`}
                      >
                        {saved ? "Saved" : "Save"}
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/45">{place.city} | {place.type}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] ${
                        qualityStatus.label === "Verified"
                          ? "border-emerald-200/24 bg-emerald-200/12 text-emerald-100"
                          : qualityStatus.label === "Needs refresh"
                            ? "border-amber-200/24 bg-amber-200/12 text-amber-100"
                            : "border-white/14 bg-white/6 text-white/65"
                      }`}>
                        {qualityStatus.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {filteredResults.events.length > 0 && (
          <section className="rounded-[28px] border border-violet-300/12 bg-[linear-gradient(180deg,rgba(43,26,74,0.58),rgba(10,10,10,0.98))] p-5">
            <h2 className="mb-4 text-lg font-semibold text-violet-100">Events</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredResults.events.map((event) => {
                const favoriteId = `event-${event.id}`;
                const saved = favorites.includes(favoriteId);
                const qualityStatus = getQualityStatus(
                  getEntityQuality({
                    targetType: "event",
                    targetId: event.id,
                    entity: event,
                    map: qualityMap,
                  })
                );
                return (
                  <div
                    key={event.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openResult(event)}
                    onKeyDown={(itemEvent) => {
                      if (itemEvent.key === "Enter") {
                        openResult(event);
                      }
                    }}
                    className="cursor-pointer rounded-2xl border border-white/10 bg-black/35 p-4 text-left transition hover:border-violet-200/30"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{event.name}</p>
                      <button
                        onClick={(itemEvent) => {
                          itemEvent.stopPropagation();
                          if (!isMember) {
                            writeLocalValue("qa_redirect", `/search?q=${encodeURIComponent(query.trim())}`);
                            writeLocalValue("qa_post_login_target", `/search?q=${encodeURIComponent(query.trim())}`);
                            router.push("/?join=true");
                            return;
                          }
                          toggleFavorite(favoriteId);
                        }}
                        className={`rounded-full border px-3 py-1 text-xs ${saved ? "border-rose-300/25 bg-rose-300/10 text-rose-100" : "border-white/12 bg-white/5 text-white/65"}`}
                      >
                        {saved ? "Saved" : "Save"}
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/45">{event.city} | Event</p>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] ${
                        qualityStatus.label === "Verified"
                          ? "border-emerald-200/24 bg-emerald-200/12 text-emerald-100"
                          : qualityStatus.label === "Needs refresh"
                            ? "border-amber-200/24 bg-amber-200/12 text-amber-100"
                            : "border-white/14 bg-white/6 text-white/65"
                      }`}>
                        {qualityStatus.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
