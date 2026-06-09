"use client";

import { getEntityQuality, getQualityStatus } from "@/lib/quality";
import EventPulseEmptyState from "@/components/city/EventPulseEmptyState";
import SectionSkeleton from "@/components/city/SectionSkeleton";
import VibeTagChips from "@/components/ui/VibeTagChips";
import { qualityPillClass } from "@/features/city/adminDrawerFeature";
import { normalizeEventRange } from "@/features/city/eventRailFeature";
import { polishEventDescription } from "@/features/city/liveVibeFeature";

export default function CityEventsRailSection({
  sectionRef,
  guideSectionRef,
  eventsLoadError,
  fetchEvents,
  eventsLoading,
  featuredEvent,
  qualityMap,
  openEvent,
  setHoveredEventId,
  hoveredEventId,
  isFocusMode,
  selectedEvent,
  formatEventDateLabel,
  city,
  cityName,
  refreshEntityQuality,
  canRefreshQuality,
  formatDate,
  remainingEvents,
  isMember,
  scrollToSection,
  openEventContribution,
  redirectToJoin,
}) {
  return (
    <div
      ref={sectionRef}
      className="hidden qa-city-section animate-cinematic-in relative mb-10 overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,1))] p-6 shadow-[0_24px_82px_rgba(0,0,0,0.34)]"
      style={{ animationDelay: "210ms" }}
    >
      <div className="pointer-events-none absolute -left-16 top-8 h-52 w-52 rounded-full bg-cyan-300/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-52 w-52 rounded-full bg-fuchsia-300/8 blur-3xl" />
      <h2 className="sticky top-[66px] z-10 -mx-2 mb-4 border-b border-white/10 bg-[#050505]/92 px-2 py-3 text-xl tracking-[0.02em] text-white backdrop-blur">
        Events
      </h2>
      {eventsLoadError && (
        <div className="mb-4 rounded-2xl border border-rose-300/20 bg-rose-300/8 px-4 py-3 text-sm text-rose-100">
          <p>{eventsLoadError}</p>
          <button
            onClick={fetchEvents}
            className="qa-action qa-city-cta-tertiary mt-3 rounded-full border border-rose-200/25 bg-rose-200/10 px-4 py-2 text-xs text-rose-100 transition hover:border-rose-200/40"
          >
            Retry
          </button>
        </div>
      )}
      {eventsLoading && (
        <div className="mb-4 rounded-2xl border border-violet-200/10 bg-violet-200/[0.03] p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-violet-100/60">Curated event calendar</p>
          <SectionSkeleton tone="violet" rows={2} />
        </div>
      )}

      {featuredEvent && (
        (() => {
          const featuredEventQuality = getEntityQuality({
            targetType: "event",
            targetId: featuredEvent.id,
            entity: featuredEvent,
            map: qualityMap,
          });
          const featuredEventQualityStatus = getQualityStatus(featuredEventQuality);

          return (
            <div className="mb-4">
              <h3 className="mb-2 text-sm text-purple-400">Featured upcoming</h3>
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
                className={`qa-cinematic-hover qa-city-card animate-rise-in relative cursor-pointer overflow-hidden rounded-[24px] border border-violet-300/16 bg-[linear-gradient(130deg,rgba(109,40,217,0.36),rgba(244,114,182,0.14),rgba(16,16,16,0.96))] p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200/45 ${
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
                  <h3 className="text-lg font-semibold leading-tight text-white">
                    {featuredEvent.name}
                  </h3>
                  {normalizeEventRange(featuredEvent).startDate && (
                    <span className="shrink-0 self-start rounded bg-purple-500 px-2 py-1 text-xs text-black sm:self-auto">
                      {formatEventDateLabel(featuredEvent)}
                    </span>
                  )}
                </div>
                <p className="mb-2 line-clamp-2 text-sm leading-6 text-white/72">
                  {polishEventDescription(featuredEvent, cityName)}
                </p>
                <VibeTagChips entity={featuredEvent} tone="amber" className="mb-2" includeMixedFallback />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-purple-200/90">Next notable event in this city</p>
                  {canRefreshQuality ? (
                    <button
                      onClick={(clickEvent) =>
                        refreshEntityQuality(
                          { targetType: "event", targetId: featuredEvent.id, fallbackSource: featuredEvent.link || "" },
                          clickEvent
                        )
                      }
                      className={`rounded-full border px-2 py-0.5 text-[10px] transition hover:opacity-90 ${qualityPillClass(featuredEventQualityStatus.tone)}`}
                      aria-label={`Update quality status for event ${featuredEvent.name}`}
                    >
                      {featuredEventQualityStatus.label}
                    </button>
                  ) : (
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] ${qualityPillClass(featuredEventQualityStatus.tone)}`}>
                      {featuredEventQualityStatus.label}
                    </span>
                  )}
                </div>
                {featuredEventQuality.lastChecked && (
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/50">
                    Checked {formatDate(featuredEventQuality.lastChecked)}
                  </p>
                )}
                <div className="mt-3 h-1.5 w-28 rounded-full bg-gradient-to-r from-violet-300 via-fuchsia-300 to-orange-200" />
              </div>
            </div>
          );
        })()
      )}

      {remainingEvents.map((event) => (
        (() => {
          const quality = getEntityQuality({
            targetType: "event",
            targetId: event.id,
            entity: event,
            map: qualityMap,
          });
          const qualityStatus = getQualityStatus(quality);

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
              className={`qa-cinematic-hover qa-city-card animate-rise-in mb-3 cursor-pointer rounded-[24px] border p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200/45 ${
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
                <p className="font-semibold leading-tight text-white">
                  {event.name}
                </p>
                {normalizeEventRange(event).startDate && (
                  <span className="shrink-0 self-start rounded bg-purple-500 px-2 py-1 text-xs text-black sm:self-auto">
                    {formatEventDateLabel(event)}
                  </span>
                )}
              </div>
              <p className="mb-2 line-clamp-2 text-sm leading-6 text-white/70">
                {polishEventDescription(event, cityName)}
              </p>
              <VibeTagChips entity={event} tone="amber" className="mb-2" includeMixedFallback />
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-purple-400">Community event</p>
                {canRefreshQuality ? (
                  <button
                    onClick={(clickEvent) =>
                      refreshEntityQuality(
                        { targetType: "event", targetId: event.id, fallbackSource: event.link || "" },
                        clickEvent
                      )
                    }
                    className={`rounded-full border px-2 py-0.5 text-[10px] transition hover:opacity-90 ${qualityPillClass(qualityStatus.tone)}`}
                    aria-label={`Update quality status for event ${event.name}`}
                  >
                    {qualityStatus.label}
                  </button>
                ) : (
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] ${qualityPillClass(qualityStatus.tone)}`}>
                    {qualityStatus.label}
                  </span>
                )}
              </div>
              {quality.lastChecked && (
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/50">
                  Checked {formatDate(quality.lastChecked)}
                </p>
              )}
            </div>
          );
        })()
      ))}

      {!eventsLoading && !featuredEvent && remainingEvents.length === 0 && (
        <EventPulseEmptyState
          isMember={isMember}
          secondaryActionLabel="Open guide lane"
          onSecondaryAction={() => scrollToSection(guideSectionRef)}
          onPublishFirstEvent={() => {
            openEventContribution();
          }}
          onJoinToPublish={() => {
            redirectToJoin();
          }}
        />
      )}
    </div>
  );
}
