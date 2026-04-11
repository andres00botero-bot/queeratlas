"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { mergeSeedEvents, mergeSeedPlaces } from "@/lib/seedContent";
import EmptyState from "@/components/ui/EmptyState";

function formatDate(value) {
  if (!value) return "Date TBA";
  const date = new Date(value);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function isThisWeek(value, now) {
  const date = new Date(value);
  const end = new Date(now);
  end.setDate(now.getDate() + 7);
  return date >= now && date <= end;
}

export default function NowPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState(null);
  const [places, setPlaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedCity, setSelectedCity] = useState("all");
  const [loadError, setLoadError] = useState("");

  const loadPulseData = useCallback(async () => {
    const now = new Date();
    setToday(now);
    setLoadError("");
    setReady(false);

    const [{ data: eventsData, error: eventsError }, { data: placesData, error: placesError }] = await Promise.all([
      supabase.from("events").select("*").order("date", { ascending: true }),
      supabase.from("places_with_stats").select("*"),
    ]);

    if (eventsError || placesError) {
      setLoadError("Live pulse could not fully load. Showing available data.");
    }

    setEvents(mergeSeedEvents(eventsData || []));
    setPlaces(mergeSeedPlaces(placesData || []));
    setReady(true);
  }, []);

  useEffect(() => {
    queueMicrotask(async () => {
      await loadPulseData();
    });
  }, [loadPulseData]);

  if (!ready || !today) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <p className="text-sm text-gray-400">Loading live queer pulse...</p>
      </main>
    );
  }

  const cityOptions = [...new Set(events.concat(places).map((item) => item.city?.toLowerCase()).filter(Boolean))]
    .sort();

  const filteredEvents =
    selectedCity === "all"
      ? events
      : events.filter((event) => event.city?.toLowerCase() === selectedCity);

  const filteredPlaces =
    selectedCity === "all"
      ? places
      : places.filter((place) => place.city?.toLowerCase() === selectedCity);

  const upcomingEvents = filteredEvents.filter((event) => event.date && new Date(event.date) >= today);
  const tonightEvents = upcomingEvents.slice(0, 4);
  const thisWeekEvents = upcomingEvents.filter((event) => isThisWeek(event.date, today)).slice(0, 6);
  const trendingPlaces = [...filteredPlaces]
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 6);

  const cityMomentum = Object.values(
    filteredPlaces.reduce((acc, place) => {
      const city = place.city || "Unknown";
      if (!acc[city]) {
        acc[city] = { city, reviews: 0, places: 0 };
      }
      acc[city].reviews += place.reviewCount || 0;
      acc[city].places += 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[32px] border border-orange-300/15 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(239,68,68,0.14),transparent_28%),linear-gradient(135deg,rgba(67,20,7,0.92),rgba(10,10,10,0.98),rgba(120,53,15,0.88))] p-8 shadow-[0_30px_120px_rgba(251,146,60,0.08)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.35em] text-orange-200/90">Live Discovery</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">Now</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-200">
                A live snapshot of where queer energy is building right now: tonight,
                this week, and across the cities with the strongest momentum.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Focus city</p>
              <select
                value={selectedCity}
                onChange={(event) => setSelectedCity(event.target.value)}
                className="mt-3 w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm outline-none focus:border-orange-300"
              >
                <option value="all">All cities</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city.charAt(0).toUpperCase() + city.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {loadError && (
            <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-rose-300/20 bg-rose-300/8 px-3 py-2 text-xs text-rose-100">
              <span>{loadError}</span>
              <button
                onClick={loadPulseData}
                className="rounded-full border border-rose-200/25 bg-rose-200/10 px-3 py-1 text-[11px] text-rose-100 transition hover:border-rose-200/40"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[28px] border border-orange-300/15 bg-[linear-gradient(180deg,rgba(44,20,10,0.95),rgba(10,10,10,1))] p-6 shadow-[0_24px_80px_rgba(249,115,22,0.08)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-orange-200">Happening Soon</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Tonight and next up</h2>
              </div>
              <button
                onClick={() => router.push("/events")}
                className="rounded-full border border-orange-300/30 bg-orange-300/8 px-4 py-2 text-xs text-orange-100 transition hover:border-orange-200 hover:bg-orange-300/15"
              >
                Open all events
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {tonightEvents.map((event) => (
                <div
                  key={event.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/${event.city?.toLowerCase()}?eventId=${event.id}`)}
                  onKeyDown={(keyEvent) => {
                    if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                      keyEvent.preventDefault();
                      router.push(`/${event.city?.toLowerCase()}?eventId=${event.id}`);
                    }
                  }}
                  className="cursor-pointer rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(64,29,12,0.82),rgba(11,11,11,0.96))] p-5 transition hover:-translate-y-[1px] hover:border-orange-200/35 hover:shadow-[0_20px_50px_rgba(251,146,60,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200/45"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-orange-200/80">{event.city || "City"} | {formatDate(event.date)}</p>
                    <span className="rounded-full border border-orange-200/15 bg-orange-200/10 px-3 py-1 text-xs text-orange-100">Live now</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">{event.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-300">
                    {event.description || "Community event with live momentum right now."}
                  </p>
                </div>
              ))}

              {tonightEvents.length === 0 && (
                <EmptyState
                  title="No upcoming events in this view yet."
                  description="Switch city filter or jump to full events list."
                  className="md:col-span-2"
                >
                  <button
                    onClick={() => {
                      setSelectedCity("all");
                      router.push("/events");
                    }}
                    className="rounded-full border border-orange-300/25 bg-orange-300/10 px-4 py-2 text-xs text-orange-100 transition hover:border-orange-200 hover:bg-orange-300/15"
                  >
                    Open global events
                  </button>
                </EmptyState>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-yellow-300/15 bg-[linear-gradient(180deg,rgba(54,36,10,0.95),rgba(10,10,10,1))] p-6 shadow-[0_24px_80px_rgba(250,204,21,0.07)]">
            <p className="text-xs uppercase tracking-[0.25em] text-yellow-200">Momentum</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Cities with signal</h2>

            <div className="mt-5 space-y-3">
              {cityMomentum.map((city) => (
                <button
                  key={city.city}
                  onClick={() => router.push(`/${city.city.toLowerCase()}`)}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(57,43,13,0.8),rgba(11,11,11,0.96))] px-4 py-4 text-left transition hover:border-yellow-200/30"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{city.city}</p>
                    <p className="mt-1 text-xs text-gray-400">{city.places} places | {city.reviews} reviews</p>
                  </div>
                  <span className="rounded-full bg-yellow-200/10 px-3 py-1 text-xs text-yellow-100">Hot</span>
                </button>
              ))}
              {cityMomentum.length === 0 && (
                <EmptyState
                  title="No city momentum in this filter yet."
                  description="Try broadening to all cities for more signal."
                  className="px-4 py-8"
                >
                  {selectedCity !== "all" && (
                    <button
                      onClick={() => setSelectedCity("all")}
                      className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-white/25 hover:text-white"
                    >
                      Show all cities
                    </button>
                  )}
                </EmptyState>
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[28px] border border-pink-300/15 bg-[linear-gradient(180deg,rgba(55,16,31,0.94),rgba(10,10,10,1))] p-6 shadow-[0_24px_80px_rgba(244,114,182,0.08)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-pink-200">This Week</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Build your next move</h2>
            </div>
            <button
              onClick={() => router.push("/favorites")}
              className="rounded-full border border-pink-300/30 bg-pink-300/8 px-4 py-2 text-xs text-pink-100 transition hover:border-pink-200 hover:bg-pink-300/15"
            >
              Open favorites
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-pink-200/80">Events this week</p>
              <p className="mt-3 text-4xl font-semibold text-white">{thisWeekEvents.length}</p>
              <p className="mt-2 text-sm text-gray-400">Time-based queer culture you can act on now.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-pink-200/80">Trending places</p>
              <p className="mt-3 text-4xl font-semibold text-white">{trendingPlaces.length}</p>
              <p className="mt-2 text-sm text-gray-400">Places with the strongest review gravity in this view.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-pink-200/80">Active cities</p>
              <p className="mt-3 text-4xl font-semibold text-white">{cityMomentum.length}</p>
              <p className="mt-2 text-sm text-gray-400">Places where signal is currently strongest.</p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-emerald-300/15 bg-[linear-gradient(180deg,rgba(8,39,32,0.94),rgba(10,10,10,1))] p-6 shadow-[0_24px_80px_rgba(16,185,129,0.08)]">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Discovery Engine</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Places with pull</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {trendingPlaces.map((place) => (
              <div
                key={place.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/${place.city?.toLowerCase()}?placeId=${place.id}`)}
                onKeyDown={(keyEvent) => {
                  if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                    keyEvent.preventDefault();
                    router.push(`/${place.city?.toLowerCase()}?placeId=${place.id}`);
                  }
                }}
                className="cursor-pointer rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(10,43,33,0.76),rgba(11,11,11,0.96))] p-4 transition hover:-translate-y-[1px] hover:border-emerald-200/30 hover:shadow-[0_20px_50px_rgba(16,185,129,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/45"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">{place.city}</p>
                  <p className="text-xs text-gray-400">★ {place.avgRating?.toFixed(1) || "-"}</p>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-white">{place.name}</h3>
                <p className="mt-2 text-sm text-emerald-100/80">{place.vibe || place.type || "Queer signal"}</p>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {place.description || "A place drawing real community attention right now."}
                </p>
              </div>
            ))}
            {trendingPlaces.length === 0 && (
              <EmptyState
                title="No places with momentum in this view yet."
                description="Try another city filter or check back after new reviews."
                className="md:col-span-2 xl:col-span-3 px-4 py-8"
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
