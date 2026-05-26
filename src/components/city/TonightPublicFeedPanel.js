"use client";

import Link from "next/link";
import EventPulseEmptyState from "@/components/city/EventPulseEmptyState";
import SectionSkeleton from "@/components/city/SectionSkeleton";
import { normalizeEventRange } from "@/features/city/eventRailFeature";
import { polishEventDescription } from "@/features/city/liveVibeFeature";
import { buildEventPath } from "@/lib/seo/entitySlug";

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
    <div className="space-y-3 rounded-[24px] border border-violet-300/12 bg-[linear-gradient(180deg,rgba(38,30,60,0.58),rgba(15,15,15,0.96))] p-5 text-justify">
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
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-violet-100/60">Loading events</p>
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
          className={`qa-cinematic-hover animate-rise-in relative cursor-pointer overflow-hidden rounded-[24px] border border-violet-300/16 bg-[linear-gradient(130deg,rgba(109,40,217,0.36),rgba(244,114,182,0.14),rgba(16,16,16,0.96))] p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200/45 ${
            String(hoveredEventId) === String(featuredEvent.id)
              ? "border-violet-200/45 shadow-[0_24px_70px_rgba(139,92,246,0.22)]"
              : ""
          } ${
            isFocusMode && String(selectedEvent?.id) !== String(featuredEvent.id)
              ? "opacity-55 saturate-75"
              : ""
          }`}
        >
          <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-violet-300/18 blur-3xl" />
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold leading-tight">{featuredEvent.name}</h3>
            {normalizeEventRange(featuredEvent).startDate ? (
              <span className="shrink-0 self-start rounded bg-purple-500 px-2 py-1 text-xs text-black sm:self-auto">
                {formatEventDateLabel(featuredEvent)}
              </span>
            ) : null}
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-white/72">
            {polishEventDescription(featuredEvent, cityName)}
          </p>
          <div className="mt-2">
            <Link
              href={buildEventPath(city || cityName, featuredEvent)}
              onClick={(clickEvent) => {
                clickEvent.stopPropagation();
              }}
              className="inline-flex rounded-full border border-fuchsia-200/26 bg-fuchsia-200/12 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-fuchsia-100 hover:border-fuchsia-200/40"
            >
              Event page
            </Link>
          </div>
        </div>
      ) : null}

      {!eventsLoading ? (
        <div className="space-y-3">
          {remainingEvents.map((event) => (
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
              className={`qa-cinematic-hover animate-rise-in cursor-pointer rounded-[20px] border p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200/45 ${
                String(selectedEvent?.id) === String(event.id)
                  ? "border-violet-200/24 bg-[linear-gradient(180deg,rgba(90,35,170,0.35),rgba(15,15,15,0.96))]"
                  : `border-violet-300/12 bg-[linear-gradient(180deg,rgba(34,24,46,0.82),rgba(15,15,15,0.96))] hover:border-violet-200/22 ${
                    isFocusMode ? "opacity-55 saturate-75" : ""
                  }`
              } ${
                String(hoveredEventId) === String(event.id)
                  ? "border-violet-200/45 shadow-[0_18px_48px_rgba(139,92,246,0.18)]"
                  : ""
              }`}
            >
              <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-semibold leading-tight">{event.name}</h3>
                {normalizeEventRange(event).startDate ? (
                  <span className="shrink-0 self-start rounded bg-purple-500 px-2 py-1 text-xs text-black sm:self-auto">
                    {formatEventDateLabel(event)}
                  </span>
                ) : null}
              </div>
              <p className="line-clamp-2 text-sm leading-6 text-white/70">
                {polishEventDescription(event, cityName)}
              </p>
              <div className="mt-2">
                <Link
                  href={buildEventPath(city || cityName, event)}
                  onClick={(clickEvent) => {
                    clickEvent.stopPropagation();
                  }}
                  className="inline-flex rounded-full border border-fuchsia-200/26 bg-fuchsia-200/12 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-fuchsia-100 hover:border-fuchsia-200/40"
                >
                  Event page
                </Link>
              </div>
            </div>
          ))}
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
