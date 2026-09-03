"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, LocateFixed, MapPin, Navigation, RefreshCw } from "lucide-react";
import { citySelectionPath } from "@/lib/cityRouting";
import { formatNearbyDistance } from "@/lib/nearby";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "venue", label: "Venues" },
  { id: "event", label: "Events" },
];

function formatCategory(value = "") {
  return String(value || "Venue")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatEventDate(item = {}) {
  const value = item.startDate || item.date;
  if (!value) return "Upcoming event";
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Upcoming event";
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(date);
}

function resultHref(item = {}) {
  if (item.entityType === "event") return citySelectionPath(item.city, { eventId: item.id });
  return citySelectionPath(item.city, { placeId: item.id });
}

export default function NearbyPageClient() {
  const [status, setStatus] = useState("idle");
  const [results, setResults] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [accuracy, setAccuracy] = useState(null);

  const filteredResults = useMemo(
    () => (activeFilter === "all" ? results : results.filter((item) => item.entityType === activeFilter)),
    [activeFilter, results]
  );

  const findNearby = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      setMessage("Location is not available in this browser.");
      return;
    }

    setStatus("locating");
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setAccuracy(Number(position.coords.accuracy) || null);
        setStatus("loading");
        try {
          const response = await fetch("/api/nearby", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            cache: "no-store",
            body: JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          });
          const payload = await response.json();
          if (!response.ok) throw new Error(payload?.error || "Nearby search failed.");
          const nextResults = Array.isArray(payload?.results) ? payload.results : [];
          setResults(nextResults);
          setStatus(nextResults.length > 0 ? "ready" : "empty");
        } catch (error) {
          setResults([]);
          setStatus("error");
          setMessage(error?.message || "Nearby search failed.");
        }
      },
      (error) => {
        setStatus("error");
        if (error?.code === 1) {
          setMessage("Location was not shared. Allow location access and try again.");
        } else if (error?.code === 3) {
          setMessage("Finding your location took too long. Try again outdoors or with Wi-Fi enabled.");
        } else {
          setMessage("Your current location could not be found. Try again.");
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const isBusy = status === "locating" || status === "loading";

  return (
    <main className="qa-page min-h-screen bg-[radial-gradient(circle_at_12%_4%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_90%_22%,rgba(244,114,182,0.10),transparent_30%),linear-gradient(180deg,#07080d,#050506_55%,#030304)] pb-32 text-white">
      <div className="qa-shell mx-auto max-w-2xl px-3 pt-4 sm:px-5 sm:pt-8">
        <section className="overflow-hidden rounded-[26px] border border-cyan-100/22 bg-[linear-gradient(145deg,rgba(17,31,43,0.96),rgba(17,12,27,0.98)_58%,rgba(7,8,11,0.99))] p-5 shadow-[0_26px_80px_rgba(0,0,0,0.44)]">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-100/82">
            <Navigation size={13} aria-hidden="true" /> Nearby
          </p>
          <h1 className="mt-2 text-[2rem] font-semibold leading-none tracking-[-0.04em]">Queer places near you.</h1>
          <p className="mt-3 text-sm leading-6 text-white/66">
            Find the closest venues and upcoming events. Your location is used for this search only and is not saved.
          </p>
          <button
            type="button"
            onClick={findNearby}
            disabled={isBusy}
            className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-cyan-100/44 bg-[linear-gradient(115deg,#a5f3fc,#c4b5fd_52%,#f9a8d4)] px-5 text-sm font-bold text-[#101018] shadow-[0_16px_42px_rgba(34,211,238,0.20)] transition hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
          >
            {isBusy ? <RefreshCw size={18} className="animate-spin" aria-hidden="true" /> : <LocateFixed size={18} aria-hidden="true" />}
            {status === "locating" ? "Finding your location…" : status === "loading" ? "Finding nearby places…" : results.length > 0 ? "Update my location" : "Find near me"}
          </button>
        </section>

        {status === "ready" ? (
          <section className="mt-4" aria-labelledby="nearby-results-heading">
            <div className="flex items-end justify-between gap-3 px-1">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/42">Closest first</p>
                <h2 id="nearby-results-heading" className="mt-1 text-xl font-semibold">{results.length} nearby</h2>
              </div>
              {accuracy ? <p className="text-right text-[11px] text-white/40">Accuracy ≈ {Math.round(accuracy)} m</p> : null}
            </div>

            <div className="mt-3 flex gap-2" aria-label="Filter nearby results">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={activeFilter === filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`min-h-11 flex-1 rounded-xl border px-3 text-xs font-semibold transition ${
                    activeFilter === filter.id
                      ? "border-cyan-100/48 bg-cyan-100/14 text-cyan-50"
                      : "border-white/12 bg-white/[0.045] text-white/64"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="mt-3 space-y-2.5">
              {filteredResults.map((item) => {
                const isEvent = item.entityType === "event";
                const Icon = isEvent ? CalendarDays : MapPin;
                return (
                  <article
                    key={`${item.entityType}-${item.id}`}
                    className="group rounded-[20px] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.20)] transition hover:border-cyan-100/34 hover:bg-white/[0.085]"
                  >
                    <Link href={resultHref(item)} className="grid min-h-[78px] grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/60">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isEvent ? "border-violet-200/24 bg-violet-200/12 text-violet-100" : "border-cyan-200/24 bg-cyan-200/12 text-cyan-100"}`}><Icon size={19} aria-hidden="true" /></span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="truncate text-[15px] font-semibold text-white">{item.name}</span>
                          <span className="rounded-full border border-white/10 bg-white/[0.055] px-2 py-0.5 text-[10px] font-semibold text-white/56">{isEvent ? "Event" : formatCategory(item.category)}</span>
                        </span>
                        <span className="mt-1 block truncate text-xs text-white/48">{isEvent ? `${formatEventDate(item)} · ` : ""}{item.location || formatCategory(item.city)}</span>
                        <span className="mt-1 block text-[11px] font-medium text-white/36">{formatCategory(item.city)}</span>
                      </span>
                      <span className="flex flex-col items-end gap-2 pl-1"><span className="whitespace-nowrap text-sm font-bold tabular-nums text-cyan-100">{formatNearbyDistance(item.distanceKm)}</span><ArrowRight size={17} className="text-white/38 transition group-hover:translate-x-0.5 group-hover:text-cyan-100" aria-hidden="true" /></span>
                    </Link>
                    <Link href={`/favorites?trip_add_type=${isEvent ? "event" : "place"}&trip_add_id=${encodeURIComponent(String(item.id))}&trip_add_city=${encodeURIComponent(String(item.city || ""))}`} className="mt-2 flex min-h-10 w-full items-center justify-center rounded-full border border-fuchsia-200/22 bg-fuchsia-200/8 px-3 text-xs font-semibold text-fuchsia-100 transition hover:border-fuchsia-200/40 hover:bg-fuchsia-200/14">+ Add to trip</Link>
                  </article>
                );
              })}
            </div>

            {filteredResults.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/58">No {activeFilter === "event" ? "events" : "venues"} found nearby.</p>
            ) : null}
          </section>
        ) : null}

        {status === "empty" ? (
          <section className="mt-4 rounded-[22px] border border-white/12 bg-white/[0.045] p-5 text-center">
            <MapPin className="mx-auto text-white/40" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-semibold">Nothing nearby yet</h2>
            <p className="mt-1 text-sm leading-6 text-white/54">No venues or upcoming events were found within 50 km.</p>
            <Link href="/search" className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-white/16 px-4 text-sm font-semibold text-white/76">Search by city</Link>
          </section>
        ) : null}

        {status === "error" ? (
          <section role="alert" className="mt-4 rounded-[22px] border border-amber-200/18 bg-amber-200/[0.055] p-5">
            <h2 className="text-base font-semibold text-amber-50">Location unavailable</h2>
            <p className="mt-1 text-sm leading-6 text-white/60">{message}</p>
            <Link href="/search" className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-white/16 px-4 text-sm font-semibold text-white/76">Search by city instead</Link>
          </section>
        ) : null}
      </div>
    </main>
  );
}
