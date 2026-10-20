"use client";

import EventPulseEmptyState from "@/components/city/EventPulseEmptyState";
import SectionSkeleton from "@/components/city/SectionSkeleton";
import { normalizeEventRange } from "@/features/city/eventRailFeature";
import { polishEventDescription } from "@/features/city/liveVibeFeature";
import { ChevronRight } from "lucide-react";

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
  return (
    <div className="qa-event-agenda space-y-0 py-1">
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
          aria-pressed={String(selectedEvent?.id) === String(featuredEvent.id)}
          aria-label={`Open event details for ${featuredEvent.name}`}
          onMouseEnter={() => setHoveredEventId(String(featuredEvent.id))}
          onMouseLeave={() => setHoveredEventId(null)}
          onKeyDown={(keyEvent) => {
            if (keyEvent.key === "Enter" || keyEvent.key === " ") {
              keyEvent.preventDefault();
              openEvent(featuredEvent);
            }
          }}
          className={`qa-event-ticket qa-cinematic-hover qa-city-card qa-city-content-card animate-rise-in relative cursor-pointer overflow-hidden rounded-[20px] border p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a47c]/55 ${
            String(hoveredEventId) === String(featuredEvent.id)
              ? "border-violet-200/45 shadow-[0_24px_70px_rgba(139,92,246,0.22)]"
              : ""
          } ${
            isFocusMode && String(selectedEvent?.id) !== String(featuredEvent.id)
              ? "opacity-55 saturate-75"
              : ""
          }`}
        >
          <div className="mb-4 h-px w-full bg-[linear-gradient(90deg,rgba(232,164,124,.8),transparent)]" />
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-fuchsia-100/74">
                Coming up next
              </p>
              <h3 className="text-xl font-semibold leading-tight tracking-[-0.01em] text-white">
                {featuredEvent.name}
              </h3>
            </div>
            {normalizeEventRange(featuredEvent).startDate ? (
              <span className="qa-event-ticket-date shrink-0 self-start sm:self-auto">
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
          {remainingEvents.map((event) => {
            return (
            <div
              key={event.id}
              onClick={() => openEvent(event)}
              role="button"
              tabIndex={0}
              aria-pressed={String(selectedEvent?.id) === String(event.id)}
              aria-label={`Open event details for ${event.name}`}
              onMouseEnter={() => setHoveredEventId(String(event.id))}
              onMouseLeave={() => setHoveredEventId(null)}
              onKeyDown={(keyEvent) => {
                if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                  keyEvent.preventDefault();
                  openEvent(event);
                }
              }}
              className={`qa-event-ticket group qa-cinematic-hover animate-rise-in relative cursor-pointer overflow-hidden border p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a47c]/55 sm:p-5 ${
                String(selectedEvent?.id) === String(event.id)
                  ? "is-selected"
                  : `hover:border-white/36 ${
                    isFocusMode ? "opacity-55 saturate-75" : ""
                  }`
              } ${
                String(hoveredEventId) === String(event.id)
                  ? "border-violet-200/40 shadow-[0_14px_36px_rgba(139,92,246,0.14)]"
                  : ""
              }`}
            >
              <div className="flex items-start gap-3">
                {normalizeEventRange(event).startDate ? (
                  <span className="qa-event-ticket-date shrink-0">{formatEventDateLabel(event)}</span>
                ) : null}
                <div className="min-w-0 flex-1">
                <div className="min-w-0">
                  <p className="text-base font-semibold leading-tight tracking-[-0.01em] text-white">
                    {event.name}
                  </p>
                </div>
                <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[#e8a47c] transition group-hover:translate-x-0.5" aria-hidden="true" />
                </div>
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
