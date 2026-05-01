"use client";

import SelectedEventActions from "@/components/city/SelectedEventActions";
import SelectedEventAdminControls from "@/components/city/SelectedEventAdminControls";
import SelectedEventLiveVibePanel from "@/components/city/SelectedEventLiveVibePanel";
import SelectedEventMetaCards from "@/components/city/SelectedEventMetaCards";
import SelectedEventSummary from "@/components/city/SelectedEventSummary";
import SelectedEventTrustSignals from "@/components/city/SelectedEventTrustSignals";

export default function SelectedEventPanel({
  selectedEvent,
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

  return (
    <div
      onWheel={onWheel}
      className="animate-panel-in fixed inset-x-0 bottom-0 z-40 max-h-[82vh] overflow-y-auto overscroll-contain rounded-t-[24px] border border-white/10 border-b-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.10),transparent_26%),linear-gradient(180deg,rgba(21,17,32,0.98),rgba(10,10,10,1))] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-[0_-20px_70px_rgba(0,0,0,0.45)] backdrop-blur lg:relative lg:inset-auto lg:w-[520px] lg:max-h-none lg:overflow-visible lg:overscroll-auto lg:rounded-none lg:border-b-0 lg:border-l lg:border-r-0 lg:border-t-0 lg:pb-6 lg:shadow-[-24px_0_80px_rgba(0,0,0,0.28)]"
    >
      <div className="pointer-events-none absolute right-[-60px] top-8 h-44 w-44 rounded-full bg-violet-400/14 blur-3xl" />
      <button
        className="sticky top-0 z-20 qa-cinematic-hover rounded-full border border-white/14 bg-[#111021]/90 px-4 py-2.5 text-sm text-white/80 backdrop-blur hover:border-white/25 hover:text-white"
        onClick={onClose}
      >
        Close
      </button>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <SelectedEventSummary
          selectedEvent={selectedEvent}
          cityLabel={cityLabel}
          cityName={cityName}
        />
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
