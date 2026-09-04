"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Bookmark, CalendarDays, Clock3, MapPin, Sparkles } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import VibeTagChips from "@/components/ui/VibeTagChips";
import { formatCityLabel, formatEventDateLabel } from "@/features/events/eventDateUtils";

const SCOPE_OPTIONS = [
  { id: "tonight", label: "Tonight" },
  { id: "weekend", label: "This weekend" },
  { id: "month", label: "Next 30 days" },
];

function toLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateKey, days) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalDateKey(date);
}

function getUpcomingWeekendWindow(todayKey) {
  const today = new Date(`${todayKey}T12:00:00`);
  const dayOfWeek = today.getDay();
  if (dayOfWeek === 6) return { startKey: todayKey, endKey: addDays(todayKey, 1) };
  if (dayOfWeek === 0) return { startKey: todayKey, endKey: todayKey };
  const daysUntilSaturday = 6 - dayOfWeek;
  const startKey = addDays(todayKey, daysUntilSaturday);
  return { startKey, endKey: addDays(startKey, 1) };
}

function resolveEventStartDate(event = {}) {
  return String(event.startDate || event.start_date || event.date || "").slice(0, 10);
}

function eventStartsInWindow(event, startKey, endKey) {
  const startDate = resolveEventStartDate(event);
  if (!startDate) return false;
  return startDate >= startKey && startDate <= endKey;
}

function getTimingLabel(event, todayKey, weekendStartKey, weekendEndKey) {
  if (eventStartsInWindow(event, todayKey, todayKey)) return "Tonight";
  if (eventStartsInWindow(event, weekendStartKey, weekendEndKey)) return "This weekend";
  return "Next up";
}

function getEventDayParts(event) {
  const startDate = resolveEventStartDate(event);
  if (!startDate) return { day: "—", month: "Soon" };
  const parsed = new Date(`${startDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return { day: "—", month: "Soon" };
  return {
    day: new Intl.DateTimeFormat("en", { day: "2-digit" }).format(parsed),
    month: new Intl.DateTimeFormat("en", { month: "short" }).format(parsed),
  };
}

function eventKey(event) {
  return `${event?.isGlobal ? "global" : "city"}-${String(event?.id || "")}`;
}

export default function HappeningSoonPanel({
  events = [],
  isLoading = false,
  initialScope = "month",
  onOpenEvent,
  onOpenCalendar,
  onSaveEvent,
  isSaved,
}) {
  const [scope, setScope] = useState(() => (["tonight", "weekend", "month"].includes(initialScope) ? initialScope : "month"));
  const [selectedCity, setSelectedCity] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);
  const todayKey = useMemo(() => toLocalDateKey(), []);
  const weekendWindow = useMemo(() => getUpcomingWeekendWindow(todayKey), [todayKey]);
  const monthEndKey = useMemo(() => addDays(todayKey, 30), [todayKey]);

  const upcoming = useMemo(() => {
    return (events || [])
      .filter((event) => eventStartsInWindow(event, todayKey, monthEndKey))
      .sort((a, b) => {
        const byDate = resolveEventStartDate(a).localeCompare(resolveEventStartDate(b));
        if (byDate !== 0) return byDate;
        return String(a?.name || "").localeCompare(String(b?.name || ""));
      });
  }, [events, monthEndKey, todayKey]);

  const scopeCounts = useMemo(() => ({
    tonight: upcoming.filter((event) => eventStartsInWindow(event, todayKey, todayKey)).length,
    weekend: upcoming.filter((event) => eventStartsInWindow(event, weekendWindow.startKey, weekendWindow.endKey)).length,
    month: upcoming.length,
  }), [todayKey, upcoming, weekendWindow]);

  const cityOptions = useMemo(() => {
    const counts = new Map();
    upcoming.forEach((event) => {
      const city = formatCityLabel(event?.city || "Global");
      counts.set(city, (counts.get(city) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [upcoming]);

  const scopedEvents = useMemo(() => {
    const scopeStart = scope === "weekend" ? weekendWindow.startKey : todayKey;
    const scopeEnd = scope === "tonight" ? todayKey : scope === "weekend" ? weekendWindow.endKey : monthEndKey;
    return upcoming.filter((event) => {
      if (!eventStartsInWindow(event, scopeStart, scopeEnd)) return false;
      if (!selectedCity) return true;
      return formatCityLabel(event?.city || "Global") === selectedCity;
    });
  }, [monthEndKey, scope, selectedCity, todayKey, upcoming, weekendWindow]);

  const featuredEvent = scopedEvents[0] || null;
  const remainingEvents = scopedEvents.slice(1);
  const visibleEvents = remainingEvents.slice(0, visibleCount);
  const activeCityCount = useMemo(
    () => new Set(upcoming.map((event) => formatCityLabel(event?.city || "Global"))).size,
    [upcoming]
  );

  const chooseScope = (nextScope) => {
    setScope(nextScope);
    if (nextScope !== "month" && scopeCounts[nextScope] === 0) setSelectedCity("");
    setVisibleCount(5);
  };

  const chooseCity = (nextCity) => {
    setSelectedCity(nextCity);
    setVisibleCount(5);
  };

  const renderSaveButton = (event, featured = false) => (
    <button
      type="button"
      onClick={(clickEvent) => onSaveEvent?.(event, clickEvent)}
      className={`qa-action inline-flex items-center justify-center gap-2 rounded-full border transition ${
        featured
          ? "border-white/16 bg-black/22 px-4 py-2 text-xs text-white/78 hover:border-fuchsia-100/40 hover:text-white"
          : "border-white/12 bg-white/[0.045] px-3 py-1.5 text-[11px] text-white/68 hover:border-cyan-100/32 hover:text-white"
      }`}
    >
      <Bookmark size={featured ? 14 : 12} fill={isSaved?.(event) ? "currentColor" : "none"} />
      {isSaved?.(event) ? "Saved" : "Save"}
    </button>
  );

  return (
    <section
      data-events-section-id="happening"
      aria-labelledby="happening-soon-title"
      className="qa-premium-card relative mt-8 overflow-hidden rounded-[30px] border border-fuchsia-200/16 bg-[radial-gradient(circle_at_8%_0%,rgba(217,70,239,0.12),transparent_30%),radial-gradient(circle_at_90%_0%,rgba(34,211,238,0.10),transparent_32%),linear-gradient(160deg,rgba(18,14,25,0.98),rgba(8,14,20,0.98)_50%,rgba(7,8,11,1))] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.38)] sm:p-6"
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-200/34 to-transparent" />

      <div className="relative">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-100/18 bg-fuchsia-200/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-fuchsia-50/84">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-300 opacity-45 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-200" />
              </span>
              Live event pulse
            </div>
            <h2 id="happening-soon-title" className="qa-display mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              Tonight, this weekend, what&apos;s next.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
              A time-first view of the strongest upcoming queer signals across the atlas.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[390px]">
            <div className="rounded-2xl border border-fuchsia-200/16 bg-fuchsia-200/[0.07] px-3 py-3 text-center">
              <p className="text-xl font-semibold text-white">{scopeCounts.tonight}</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.17em] text-fuchsia-100/56">Tonight</p>
            </div>
            <div className="rounded-2xl border border-cyan-200/16 bg-cyan-200/[0.055] px-3 py-3 text-center">
              <p className="text-xl font-semibold text-white">{scopeCounts.weekend}</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.17em] text-cyan-100/56">Weekend</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/[0.045] px-3 py-3 text-center">
              <p className="text-xl font-semibold text-white">{activeCityCount}</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.17em] text-white/48">Cities</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-[22px] border border-white/10 bg-black/20 p-2.5 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Event time range">
            {SCOPE_OPTIONS.map((option) => {
              const isActive = scope === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => chooseScope(option.id)}
                  className={`qa-action rounded-2xl border px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition sm:px-5 ${
                    isActive
                      ? "border-cyan-100/46 bg-[linear-gradient(135deg,rgba(34,211,238,0.2),rgba(217,70,239,0.18))] text-white shadow-[0_10px_28px_rgba(34,211,238,0.12)]"
                      : "border-white/8 bg-white/[0.035] text-white/54 hover:border-white/18 hover:text-white/82"
                  }`}
                >
                  {option.label} <span className="ml-1 text-white/38">{scopeCounts[option.id]}</span>
                </button>
              );
            })}
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-white/48">
            <MapPin size={14} className="text-cyan-100/68" />
            <span className="hidden sm:inline">City</span>
            <select
              value={selectedCity}
              onChange={(event) => chooseCity(String(event.target.value || ""))}
              className="min-w-0 flex-1 bg-transparent text-xs normal-case tracking-normal text-white outline-none [&>option]:bg-[#0b0f16]"
            >
              <option value="">Everywhere</option>
              {cityOptions.map((city) => (
                <option key={city.label} value={city.label}>{city.label} ({city.count})</option>
              ))}
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="h-[270px] animate-pulse rounded-[24px] border border-white/10 bg-white/[0.045]" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="h-[148px] animate-pulse rounded-3xl border border-white/10 bg-white/[0.035]" />
              <div className="h-[148px] animate-pulse rounded-3xl border border-white/10 bg-white/[0.035]" />
            </div>
          </div>
        ) : featuredEvent ? (
          <>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <article className="group relative min-h-[270px] overflow-hidden rounded-[24px] border border-fuchsia-100/20 bg-[radial-gradient(circle_at_84%_8%,rgba(34,211,238,0.13),transparent_34%),linear-gradient(145deg,rgba(43,23,52,0.88),rgba(9,22,31,0.96)_64%,rgba(8,9,13,1))] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.3)] sm:p-6">
                <div className="pointer-events-none absolute right-[-8%] top-[-12%] h-52 w-52 rounded-full border border-cyan-200/14 shadow-[0_0_70px_rgba(34,211,238,0.12)]" />
                <div className="relative flex h-full flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-black/24 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/68">
                      <Sparkles size={12} className="text-fuchsia-100" /> Featured signal
                    </span>
                    <span className="rounded-full border border-cyan-100/22 bg-cyan-200/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-cyan-50">
                      {getTimingLabel(featuredEvent, todayKey, weekendWindow.startKey, weekendWindow.endKey)}
                    </span>
                  </div>

                  <div className="mt-6">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/54">
                      <MapPin size={13} /> {formatCityLabel(featuredEvent.city || "Global")}
                      <span className="text-white/22">•</span>
                      <CalendarDays size={13} /> {formatEventDateLabel(featuredEvent)}
                    </p>
                    <h3 className="mt-3 max-w-[22ch] text-2xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-3xl">
                      {featuredEvent.name}
                    </h3>
                    <VibeTagChips entity={featuredEvent} tone="fuchsia" className="mt-3" includeMixedFallback />
                    <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-6 text-white/64">
                      {featuredEvent.description || "A high-signal queer event coming up across the atlas."}
                    </p>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
                    <button
                      type="button"
                      onClick={() => onOpenEvent?.(featuredEvent)}
                      className="qa-action qa-cta-primary inline-flex items-center gap-2 rounded-full border border-cyan-100/42 bg-[linear-gradient(110deg,rgba(34,211,238,0.28),rgba(217,70,239,0.24))] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_12px_34px_rgba(34,211,238,0.13)] transition hover:border-white/54"
                    >
                      Open event <ArrowRight size={14} />
                    </button>
                    {renderSaveButton(featuredEvent, true)}
                  </div>
                </div>
              </article>

              <div className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {visibleEvents.map((event) => {
                  const parts = getEventDayParts(event);
                  return (
                    <article key={eventKey(event)} className="rounded-[20px] border border-white/[0.09] bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:border-cyan-100/24 hover:bg-white/[0.055]">
                      <div className="flex gap-4">
                        <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-fuchsia-100/16 bg-fuchsia-200/[0.075]">
                          <span className="text-xl font-semibold text-white">{parts.day}</span>
                          <span className="text-[9px] uppercase tracking-[0.16em] text-fuchsia-100/58">{parts.month}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[10px] uppercase tracking-[0.16em] text-cyan-100/58">
                              {formatCityLabel(event.city || "Global")}
                            </p>
                            <span className="shrink-0 text-[9px] uppercase tracking-[0.13em] text-white/38">
                              {getTimingLabel(event, todayKey, weekendWindow.startKey, weekendWindow.endKey)}
                            </span>
                          </div>
                          <h3 className="mt-1.5 text-base font-semibold leading-snug text-white">{event.name}</h3>
                          <VibeTagChips entity={event} tone="amber" className="mt-2" includeMixedFallback />
                        </div>
                      </div>

                      <p className="mt-3 line-clamp-2 border-t border-white/8 pt-3 text-sm leading-6 text-white/52">
                        {event.description || "Upcoming queer event with useful community signal."}
                      </p>

                      <div className="mt-3 flex items-center justify-end gap-2 border-t border-white/8 pt-3">
                        <div className="flex items-center gap-2">
                          {renderSaveButton(event)}
                          <button
                            type="button"
                            onClick={() => onOpenEvent?.(event)}
                            className="qa-action inline-flex items-center gap-1.5 rounded-full border border-cyan-100/18 bg-cyan-200/[0.07] px-3 py-1.5 text-[11px] text-cyan-50 transition hover:border-cyan-100/38"
                          >
                            Open <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="inline-flex items-center gap-2 text-xs text-white/46">
                <Clock3 size={14} className="text-cyan-100/54" />
                Showing {Math.min(scopedEvents.length, visibleCount + 1)} of {scopedEvents.length} events in this pulse.
              </p>
              <div className="flex items-center gap-2">
                {remainingEvents.length > visibleCount && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((current) => current + 5)}
                    className="qa-action rounded-full border border-white/14 bg-white/[0.05] px-4 py-2 text-xs text-white/72 transition hover:border-white/28 hover:text-white"
                  >
                    Show more
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenCalendar}
                  className="qa-action rounded-full border border-fuchsia-100/22 bg-fuchsia-200/[0.08] px-4 py-2 text-xs text-fuchsia-50 transition hover:border-fuchsia-100/42"
                >
                  Open full calendar
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="No events in this time window."
            description="Try the next 30 days, clear the city filter, or browse the full calendar."
            className="mt-5 px-5 py-10"
          >
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setScope("month");
                  setSelectedCity("");
                }}
                className="qa-action rounded-full border border-cyan-100/22 bg-cyan-200/[0.08] px-4 py-2 text-xs text-cyan-50"
              >
                Show next 30 days
              </button>
              <button
                type="button"
                onClick={onOpenCalendar}
                className="qa-action rounded-full border border-white/14 bg-white/[0.05] px-4 py-2 text-xs text-white/72"
              >
                Open calendar
              </button>
            </div>
          </EmptyState>
        )}
      </div>
    </section>
  );
}
