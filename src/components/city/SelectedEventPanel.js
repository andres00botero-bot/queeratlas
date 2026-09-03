"use client";

import Link from "next/link";
import SelectedEventActions from "@/components/city/SelectedEventActions";
import SelectedEventAdminControls from "@/components/city/SelectedEventAdminControls";
import SelectedEventLiveVibePanel from "@/components/city/SelectedEventLiveVibePanel";
import SelectedEventMetaCards from "@/components/city/SelectedEventMetaCards";
import SelectedEventSummary from "@/components/city/SelectedEventSummary";
import SelectedEventTrustSignals from "@/components/city/SelectedEventTrustSignals";
import { buildEventPath } from "@/lib/seo/entitySlug";

export default function SelectedEventPanel({
  selectedEvent,
  inlineMode = false,
  onWheel,
  onClose,
  cityLabel,
  cityName,
  liveVibeOptions,
  eventLiveVibeSignalKey,
  isSubmittingEventLiveVibe,
  eventLiveVibeSubmittingKey,
  eventLiveVibeJustSentKey,
  handleSubmitEventLiveVibe,
  isMember,
  eventLiveVibeSelectedOption,
  selectedEventQuality,
  formatDate,
  selectedEventQualityStatus,
  refreshEntityQuality,
  canRefreshQuality,
  trustedEventSavesCount,
  isAdmin,
  eventAdminOpen,
  onToggleEventAdmin,
  eventAdminDraft,
  setEventAdminDraft,
  handleAdminSaveEventAddressOnly,
  isSavingEventAddressOnly,
  handleAdminSaveEvent,
  isSavingEventAdmin,
  handleAdminDeleteEvent,
  isDeletingEventAdmin,
  favorites,
  toggleFavorite,
  showEventOnMap,
  handleReport,
}) {
  if (!selectedEvent) return null;
  const canonicalEventHref = buildEventPath(selectedEvent.city || cityName || cityLabel, selectedEvent);

  return (
    <div
      onWheel={onWheel}
      className={`qa-city-panel-cq qa-city-detail-sheet qa-city-detail-event animate-panel-in border p-5 backdrop-blur sm:p-6 ${
        inlineMode
          ? "relative z-10 max-h-none overflow-visible rounded-[24px] shadow-[0_18px_56px_rgba(0,0,0,0.34)]"
          : "fixed inset-x-0 bottom-0 z-40 max-h-[82vh] overflow-y-auto overscroll-contain rounded-t-[24px] border-b-0 pb-[calc(7.25rem+env(safe-area-inset-bottom))] shadow-[0_-20px_70px_rgba(0,0,0,0.45)]"
      }`}
    >
      <div className="pointer-events-none absolute right-[-60px] top-8 h-44 w-44 rounded-full bg-violet-400/14 blur-3xl" />
      <div className="qa-city-detail-header sticky top-0 z-20 flex items-center justify-between gap-3 rounded-[22px] border px-4 py-3 backdrop-blur-xl">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#cbbcff]">Event</p>
          <p className="truncate text-sm font-semibold text-white/92">{selectedEvent.name}</p>
        </div>
        <button type="button" aria-label="Close event details" className="qa-cinematic-hover rounded-full border border-white/14 bg-white/[0.06] px-3 py-2 text-xs text-white/76 hover:border-white/28 hover:text-white" onClick={onClose}>Close</button>
      </div>

      <div className="qa-city-detail-surface mt-4 rounded-[22px] border p-4">
        <SelectedEventSummary
          selectedEvent={selectedEvent}
          cityLabel={cityLabel}
          cityName={cityName}
          showEventOnMap={showEventOnMap}
          liveSignal={
            <SelectedEventLiveVibePanel
              LIVE_VIBE_OPTIONS={liveVibeOptions}
              eventLiveVibeSignalKey={eventLiveVibeSignalKey}
              isSubmittingEventLiveVibe={isSubmittingEventLiveVibe}
              eventLiveVibeSubmittingKey={eventLiveVibeSubmittingKey}
              eventLiveVibeJustSentKey={eventLiveVibeJustSentKey}
              handleSubmitEventLiveVibe={handleSubmitEventLiveVibe}
              isMember={isMember}
              eventLiveVibeSelectedOption={eventLiveVibeSelectedOption}
            />
          }
        />
        <div className="mt-2 text-xs leading-5 text-white/56">
          <Link
            href={canonicalEventHref}
            className="underline decoration-white/35 underline-offset-2 transition hover:text-white/86 hover:decoration-white/60"
          >
            Open canonical event page
          </Link>
        </div>
        <SelectedEventMetaCards
          selectedEvent={selectedEvent}
          selectedEventQuality={selectedEventQuality}
          formatDate={formatDate}
        />
        <SelectedEventTrustSignals
          selectedEvent={selectedEvent}
          selectedEventQuality={selectedEventQuality}
          selectedEventQualityStatus={selectedEventQualityStatus}
          refreshEntityQuality={refreshEntityQuality}
          canRefreshQuality={canRefreshQuality}
          trustedEventSavesCount={trustedEventSavesCount}
        />
        <SelectedEventAdminControls
          isAdmin={isAdmin}
          isOpen={eventAdminOpen}
          onToggleOpen={onToggleEventAdmin}
          draft={eventAdminDraft}
          setDraft={setEventAdminDraft}
          onSaveAddressOnly={handleAdminSaveEventAddressOnly}
          isSavingAddressOnly={isSavingEventAddressOnly}
          onSave={handleAdminSaveEvent}
          isSaving={isSavingEventAdmin}
          onDelete={handleAdminDeleteEvent}
          isDeleting={isDeletingEventAdmin}
          city={selectedEvent.city || cityName || cityLabel}
        />
      </div>

      <SelectedEventActions
        selectedEvent={selectedEvent}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        showEventOnMap={showEventOnMap}
        isAdmin={isAdmin}
        isDeletingEventAdmin={isDeletingEventAdmin}
        handleAdminDeleteEvent={handleAdminDeleteEvent}
        handleReport={handleReport}
      />
    </div>
  );
}
