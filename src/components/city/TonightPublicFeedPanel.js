"use client";

import EventPulseEmptyState from "@/components/city/EventPulseEmptyState";
import SectionSkeleton from "@/components/city/SectionSkeleton";
import { normalizeEventRange } from "@/features/city/eventRailFeature";
import { polishEventDescription } from "@/features/city/liveVibeFeature";

export default function TonightPublicFeedPanel({
  eventsLoadError,
  fetchEvents,
  eventsLoading,
  featuredEvent,
  openEvent,
  setHoveredEventId,
  hoveredEventId,
  isFocusMode,
  selectedEvent,
  formatEventDateLabel,
  city,
  cityName,
  remainingEvents,
  isMember,
  openEventContribution,
  redirectToJoin,
}) {
  const eventTones = [
    {
      card: "border-fuchsia-100/28 bg-[linear-gradient(135deg,rgba(244,114,182,0.18),rgba(139,92,246,0.10),rgba(255,255,255,0.07))]",
      rail: "from-fuchsia-300 to-pink-200",
      badge: "border-fuchsia-100/28 bg-fuchsia-300/16 text-fuchsia-50",
      label: "Featured pulse",
    },
    {
      card: "border-cyan-100/26 bg-[linear-gradient(135deg,rgba(34,211,238,0.15),rgba(59,130,246,0.10),rgba(255,255,255,0.07))]",
      rail: "from-cyan-300 to-sky-200",
      badge: "border-cyan-100/28 bg-cyan-300/16 text-cyan-50",
      label: "City night",
    },
    {
      card: "border-amber-100/26 bg-[linear-gradient(135deg,rgba(251,191,36,0.15),rgba(244,114,182,0.08),rgba(255,255,255,0.07))]",
      rail: "from-amber-200 to-orange-200",
      badge: "border-amber-100/28 bg-amber-300/16 text-amber-50",
      label: "Social pick",
    },
    {
      card: "border-emerald-100/26 bg-[linear-gradient(135deg,rgba(52,211,153,0.13),rgba(34,211,238,0.08),rgba(255,255,255,0.07))]",
      rail: "from-emerald-300 to-teal-200",
      badge: "border-emerald-100/28 bg-emerald-300/16 text-emerald-50",
      label: "Local signal",
    },
  ];

  return (
    <div className="space-y-3 rounded-[24px] border border-white/16 bg-[linear-gradient(145deg,rgba(244,114,182,0.12),rgba(139,92,246,0.10),rgba(255,255,255,0.06))] p-4 shadow-[0_18px_48px_rgba(217,70,239,0.12)] sm:p-5">
      {eventsLoadError ? (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-300/8 px-4 py-3 text-sm text-rose-100">
          <p>{eventsLoadError}</p>
          <button
            onClick={fetchEvents}
            className="qa-action qa-city-cta-tertiary mt-3 rounded-full border border-rose-200/25 bg-rose-200/10 px-4 py-2 text-xs text-rose-100 transition hover:border-rose-200/40"
          >
            Retry
          </button>
        </div>
      ) : null}

      {eventsLoading ? (
        <div className="rounded-2xl border border-violet-200/10 bg-violet-200/[0.03] p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-violet-100/60">Upcoming queer events</p>
          <SectionSkeleton tone="violet" rows={2} />
        </div>
      ) : null}

      {featuredEvent ? (
        <div
          onClick={() => openEvent(featuredEvent)}
          role="button"
          tabIndex={0}
          aria-label={`Open event details for ${featuredEvent.name}`}
          onMouseEnter={() => setHoveredEventId(String(featuredEvent.id))}
          onMouseLeave={() => setHoveredEventId(null)}
          onKeyDown={(keyEvent) => {
            if (keyEvent.key === "Enter" || keyEvent.key === " ") {
              keyEvent.preventDefault();
              openEvent(featuredEvent);
            }
          }}
          className={`qa-cinematic-hover animate-rise-in relative cursor-pointer overflow-hidden rounded-[24px] border border-fuchsia-100/30 bg-[linear-gradient(135deg,rgba(244,114,182,0.22),rgba(139,92,246,0.14),rgba(255,255,255,0.08))] p-5 shadow-[0_18px_46px_rgba(217,70,239,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200/45 ${
            String(hoveredEventId) === String(featuredEvent.id)
              ? "border-violet-200/45 shadow-[0_24px_70px_rgba(139,92,246,0.22)]"
              : ""
          } ${
            isFocusMode && String(selectedEvent?.id) !== String(featuredEvent.id)
              ? "opacity-55 saturate-75"
              : ""
          }`}
        >
          <div className="mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-fuchsia-300 via-pink-200 to-amber-200" />
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-fuchsia-100/74">
                Featured event
              </p>
              <h3 className="text-xl font-semibold leading-tight tracking-[-0.01em] text-white">
                {featuredEvent.name}
              </h3>
            </div>
            {normalizeEventRange(featuredEvent).startDate ? (
              <span className="shrink-0 self-start rounded-full border border-violet-200/24 bg-violet-200/14 px-3 py-1 text-xs text-violet-50 sm:self-auto">
                {formatEventDateLabel(featuredEvent)}
              </span>
            ) : null}
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-white/72">
            {polishEventDescription(featuredEvent, cityName)}
          </p>
        </div>
      ) : null}

      {!eventsLoading ? (
        <div className="space-y-3">
          {remainingEvents.map((event, index) => {
            const tone = eventTones[index % eventTones.length];
            return (
            <div
              key={event.id}
              onClick={() => openEvent(event)}
              role="button"
              tabIndex={0}
              aria-label={`Open event details for ${event.name}`}
              onMouseEnter={() => setHoveredEventId(String(event.id))}
              onMouseLeave={() => setHoveredEventId(null)}
              onKeyDown={(keyEvent) => {
                if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                  keyEvent.preventDefault();
                  openEvent(event);
                }
              }}
              className={`qa-cinematic-hover animate-rise-in relative cursor-pointer overflow-hidden rounded-[22px] border p-4 shadow-[0_14px_34px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200/45 sm:p-5 ${
                String(selectedEvent?.id) === String(event.id)
                  ? "border-violet-100/42 bg-violet-300/[0.16]"
                  : `${tone.card} hover:border-white/36 ${
                    isFocusMode ? "opacity-55 saturate-75" : ""
                  }`
              } ${
                String(hoveredEventId) === String(event.id)
                  ? "border-violet-200/40 shadow-[0_14px_36px_rgba(139,92,246,0.14)]"
                  : ""
              }`}
            >
              <div className={`mb-4 h-1.5 w-20 rounded-full bg-gradient-to-r ${tone.rail}`} />
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/54">
                    {tone.label}
                  </p>
                  <p className="text-base font-semibold leading-tight tracking-[-0.01em] text-white">
                    {event.name}
                  </p>
                </div>
                {normalizeEventRange(event).startDate ? (
                  <span className={`shrink-0 self-start rounded-full border px-3 py-1 text-xs sm:self-auto ${tone.badge}`}>
                    {formatEventDateLabel(event)}
                  </span>
                ) : null}
              </div>
              <p className="line-clamp-2 text-sm leading-6 text-white/74">
                {polishEventDescription(event, cityName)}
              </p>
            </div>
            );
          })}
        </div>
      ) : null}

      {!eventsLoading && !featuredEvent && remainingEvents.length === 0 ? (
        <EventPulseEmptyState
          isMember={isMember}
          onPublishFirstEvent={() => {
            openEventContribution();
          }}
          onJoinToPublish={() => {
            redirectToJoin();
          }}
        />
      ) : null}
    </div>
  );
}
