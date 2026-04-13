"use client";

import { useMemo, useState } from "react";

const VIBES = [
  { value: "soft", label: "Soft" },
  { value: "social", label: "Social" },
  { value: "wild", label: "Wild" },
  { value: "dark", label: "Dark" },
  { value: "mixed", label: "Mixed" },
];

const BUDGETS = [
  { value: "low", label: "Low" },
  { value: "balanced", label: "Balanced" },
  { value: "treat", label: "Treat" },
];

const HORIZONS = [
  { value: "tonight", label: "Tonight" },
  { value: "weekend", label: "Weekend" },
  { value: "three_days", label: "3 Days" },
];

function normalize(value = "") {
  return String(value || "").trim().toLowerCase();
}

function seededShuffle(items = []) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function dayLabel(index, horizon) {
  if (horizon === "tonight") return "Tonight";
  return `Day ${index + 1}`;
}

function chooseFromPool(pool, usedIds, fallback = null) {
  const available = pool.filter((item) => !usedIds.has(String(item.id)));
  if (available.length === 0) return fallback;
  return available[Math.floor(Math.random() * available.length)];
}

function mapStop(item, stopType, slotLabel, time, reason) {
  if (!item) return null;
  return {
    key: `${stopType}-${item.id}-${slotLabel}-${time}`,
    id: item.id,
    itemType: stopType,
    name: item.name,
    city: item.city,
    slotLabel,
    time,
    reason,
    description: item.description || "",
  };
}

function buildItinerary({ city, places, events, vibe, horizon, soloSafe }) {
  const placeRows = places.filter((row) => normalize(row.city) === normalize(city));
  const eventRows = events.filter((row) => normalize(row.city) === normalize(city));

  const cafes = placeRows.filter((p) => p.type === "cafe");
  const bars = placeRows.filter((p) => p.type === "bar");
  const clubs = placeRows.filter((p) => p.type === "club");
  const saunas = placeRows.filter((p) => p.type === "sauna");
  const chill = placeRows.filter((p) => ["cafe", "bar", "hotel"].includes(p.type));
  const dark = placeRows.filter((p) => ["sauna", "cruise_club", "club"].includes(p.type));
  const safeLean = placeRows.filter((p) => ["cafe", "bar"].includes(p.type));

  const daysCount = horizon === "tonight" ? 1 : horizon === "weekend" ? 2 : 3;
  const used = new Set();

  return Array.from({ length: daysCount }).map((_, dayIndex) => {
    const stops = [];

    if (dayIndex === 0) {
      const landingPool = soloSafe ? [...safeLean, ...cafes, ...bars] : [...cafes, ...bars, ...safeLean];
      const introPool = vibe === "soft" ? [...bars, ...cafes] : [...bars, ...clubs, ...eventRows];
      const s1 = chooseFromPool(landingPool, used);
      if (s1) used.add(String(s1.id));
      const s2 = chooseFromPool(introPool, used);
      if (s2) used.add(String(s2.id));

      stops.push(
        mapStop(s1, "place", "Soft landing", "18:30", "Easy entry to read local energy."),
        mapStop(s2, s2 && eventRows.some((e) => String(e.id) === String(s2.id)) ? "event" : "place", "Intro signal", "21:30", "Warm social momentum before peak.")
      );
    } else if (dayIndex === 1 || daysCount === 1) {
      const warmPool = vibe === "dark" ? [...dark, ...bars] : [...bars, ...clubs];
      const peakPool = [...eventRows, ...clubs, ...(vibe === "dark" ? dark : [])];
      const latePool = vibe === "soft" ? [...bars, ...chill] : [...clubs, ...bars, ...saunas];

      const s1 = chooseFromPool(warmPool, used);
      if (s1) used.add(String(s1.id));
      const s2 = chooseFromPool(peakPool, used);
      if (s2) used.add(String(s2.id));
      const s3 = chooseFromPool(latePool, used);
      if (s3) used.add(String(s3.id));

      stops.push(
        mapStop(s1, "place", "Warmup", "20:30", "Set baseline before the rush."),
        mapStop(s2, s2 && eventRows.some((e) => String(e.id) === String(s2.id)) ? "event" : "place", "Peak", "01:00", "Core nightlife pressure point."),
        mapStop(s3, "place", "Late drift", "03:00", "Post-peak continuation with lower friction.")
      );
    } else {
      const recoveryPool = [...chill, ...cafes, ...bars];
      const s1 = chooseFromPool(recoveryPool, used);
      if (s1) used.add(String(s1.id));
      const s2 = chooseFromPool(recoveryPool, used);
      if (s2) used.add(String(s2.id));

      stops.push(
        mapStop(s1, "place", "Recovery", "11:30", "Slow restart and social reset."),
        mapStop(s2, "place", "Golden hour", "16:00", "Chill close to the trip arc.")
      );
    }

    return {
      dayKey: `${city}-${dayIndex}`,
      dayLabel: dayLabel(dayIndex, horizon),
      stops: stops.filter(Boolean),
    };
  });
}

export default function TripPlannerV2({
  plannerCities = [],
  places = [],
  events = [],
  onOpenStop,
  onSavePlan,
}) {
  const [city, setCity] = useState(plannerCities[0] || "");
  const [horizon, setHorizon] = useState("three_days");
  const [vibe, setVibe] = useState("mixed");
  const [budget, setBudget] = useState("balanced");
  const [energy, setEnergy] = useState(70);
  const [soloSafe, setSoloSafe] = useState(false);
  const [itinerary, setItinerary] = useState([]);
  const [locks, setLocks] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const canBuild = Boolean(city);

  const cityPlacesCount = useMemo(
    () => places.filter((p) => normalize(p.city) === normalize(city)).length,
    [city, places]
  );

  const cityEventsCount = useMemo(
    () => events.filter((e) => normalize(e.city) === normalize(city)).length,
    [city, events]
  );

  const generate = () => {
    if (!canBuild) return;
    const next = buildItinerary({ city, places, events, vibe, horizon, soloSafe });
    setItinerary(next);
    setLocks({});
  };

  const shuffleUnlocked = () => {
    if (!itinerary.length) return;
    const fresh = buildItinerary({ city, places, events, vibe, horizon, soloSafe });
    const merged = itinerary.map((day, dayIdx) => {
      const freshDay = fresh[dayIdx] || { ...day, stops: [] };
      const nextStops = freshDay.stops.map((stop, stopIdx) => {
        const lockKey = `${dayIdx}-${stopIdx}`;
        if (locks[lockKey] && day.stops[stopIdx]) return day.stops[stopIdx];
        return stop;
      });
      return { ...freshDay, stops: nextStops };
    });
    setItinerary(merged);
  };

  const toggleLock = (dayIdx, stopIdx) => {
    const key = `${dayIdx}-${stopIdx}`;
    setLocks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const energyLabel = energy < 35 ? "Low pulse" : energy < 70 ? "Balanced" : "Peak hunt";

  const handleSave = async () => {
    if (!onSavePlan || itinerary.length === 0 || isSaving) return;
    setIsSaving(true);
    try {
      const saved = await onSavePlan({
        city,
        horizon,
        vibe,
        budget,
        energy,
        soloSafe,
        itinerary,
      });
      if (saved) {
        setItinerary([]);
        setLocks({});
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-6 rounded-[28px] border border-fuchsia-200/16 bg-[radial-gradient(circle_at_top_left,rgba(217,70,239,0.16),transparent_30%),linear-gradient(180deg,rgba(28,14,36,0.95),rgba(10,10,10,0.98))] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-fuchsia-200/78">Trip Planner V2 (beta)</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Spotify-like flow for queer nights</h3>
        </div>
        <div className="rounded-full border border-fuchsia-200/16 bg-fuchsia-200/10 px-3 py-1 text-xs text-fuchsia-100">
          {cityPlacesCount} places · {cityEventsCount} events
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/12 bg-black/25 p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">City</p>
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
          >
            {plannerCities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/25 p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Horizon</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {HORIZONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setHorizon(item.value)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  horizon === item.value
                    ? "border-fuchsia-200/36 bg-fuchsia-200/16 text-fuchsia-100"
                    : "border-white/12 bg-white/6 text-white/65"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/25 p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Vibe</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {VIBES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setVibe(item.value)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  vibe === item.value
                    ? "border-cyan-200/36 bg-cyan-200/16 text-cyan-100"
                    : "border-white/12 bg-white/6 text-white/65"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/25 p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Budget</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {BUDGETS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setBudget(item.value)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  budget === item.value
                    ? "border-amber-200/36 bg-amber-200/16 text-amber-100"
                    : "border-white/12 bg-white/6 text-white/65"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/25 p-3 md:col-span-2 xl:col-span-1">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Energy</p>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={energy}
            onChange={(event) => setEnergy(Number(event.target.value))}
            className="mt-2 w-full"
          />
          <p className="mt-1 text-xs text-white/60">{energyLabel}</p>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/25 p-3 md:col-span-2 xl:col-span-1">
          <label className="inline-flex items-center gap-2 text-sm text-white/78">
            <input
              type="checkbox"
              checked={soloSafe}
              onChange={(event) => setSoloSafe(event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-black/30"
            />
            Solo-safe mode
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={!canBuild}
          className="rounded-full bg-gradient-to-r from-fuchsia-200 via-pink-200 to-cyan-200 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
        >
          Build itinerary
        </button>
        <button
          type="button"
          onClick={shuffleUnlocked}
          disabled={itinerary.length === 0}
          className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white/75 disabled:opacity-60"
        >
          Shuffle unlocked
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={itinerary.length === 0 || isSaving}
          className="rounded-full border border-emerald-200/26 bg-emerald-200/12 px-4 py-2 text-sm text-emerald-100 disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save plan"}
        </button>
      </div>

      {itinerary.length > 0 && (
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {itinerary.map((day, dayIdx) => (
            <article key={day.dayKey} className="rounded-2xl border border-white/12 bg-white/[0.04] p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-white/56">{day.dayLabel}</p>
              <div className="mt-3 space-y-2">
                {day.stops.length === 0 && (
                  <p className="text-xs text-white/52">No matched stops. Try another vibe/city.</p>
                )}
                {day.stops.map((stop, stopIdx) => {
                  const lockKey = `${dayIdx}-${stopIdx}`;
                  const isLocked = Boolean(locks[lockKey]);
                  return (
                    <div key={stop.key} className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                            {stop.time} · {stop.slotLabel}
                          </p>
                          <p className="mt-1 text-sm font-medium text-white">{stop.name}</p>
                          <p className="mt-1 text-xs text-white/55">{stop.reason}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleLock(dayIdx, stopIdx)}
                          className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${
                            isLocked
                              ? "border-amber-200/35 bg-amber-200/18 text-amber-100"
                              : "border-white/12 bg-white/6 text-white/65"
                          }`}
                        >
                          {isLocked ? "Locked" : "Lock"}
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-white/45 capitalize">{stop.itemType}</span>
                        <button
                          type="button"
                          onClick={() => onOpenStop?.(stop)}
                          className="rounded-full border border-cyan-200/18 bg-cyan-200/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-100"
                        >
                          Open on map
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
