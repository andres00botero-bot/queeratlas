"use client";

import SelectedPlaceActions from "@/components/city/SelectedPlaceActions";
import SelectedPlaceAdminControls from "@/components/city/SelectedPlaceAdminControls";
import SelectedPlaceLiveVibePanel from "@/components/city/SelectedPlaceLiveVibePanel";
import SelectedPlaceReviewComposer from "@/components/city/SelectedPlaceReviewComposer";
import SelectedPlaceReviewsList from "@/components/city/SelectedPlaceReviewsList";
import SelectedPlaceSummary from "@/components/city/SelectedPlaceSummary";

export default function SelectedPlacePanel({
  selectedPlace,
  inlineMode = false,
  onWheel,
  onClose,
  cityName,
  typeLabels,
  selectedPlaceSafetySignal,
  liveVibeSummary,
  liveVibeHeadline,
  liveVibePulse,
  liveVibeConsensus,
  liveVibeUpdatedLabel,
  liveVibeTableMissing,
  handleSubmitLiveVibe,
  isSubmittingLiveVibe,
  liveVibeMyActiveSignalKey,
  liveVibeSubmittingKey,
  liveVibeJustSentKey,
  liveVibeOptions,
  isMember,
  liveVibeSelectedOption,
  isLoadingLiveVibe,
  liveVibeError,
  liveVibeCooldownRemainingSec,
  showLiveVibeMomentum,
  setShowLiveVibeMomentum,
  liveVibeMemberMomentum,
  liveVibeStreakNudge,
  isAdmin,
  placeAdminOpen,
  onTogglePlaceAdmin,
  placeAdminDraft,
  setPlaceAdminDraft,
  handleAdminSavePlaceAddressOnly,
  isSavingPlaceAddressOnly,
  handleAdminSavePlace,
  isSavingPlaceAdmin,
  handleAdminDeletePlace,
  isDeletingPlaceAdmin,
  placeTypes,
  handleReport,
  toggleFavorite,
  favorites,
  reviews,
  canReviewSelectedPlace,
  isSubmittingReview,
  onJoinToReview,
  rating,
  hoverRating,
  setHoverRating,
  setRating,
  safetyRating,
  hoverSafetyRating,
  setHoverSafetyRating,
  setSafetyRating,
  comment,
  setComment,
  onSubmitReview,
}) {
  if (!selectedPlace) return null;
  const placeTypeLabel = typeLabels?.[selectedPlace.type] || "Venue";

  return (
    <div
      onWheel={onWheel}
      className={`qa-city-panel-cq animate-panel-in border border-white/10 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.08),transparent_22%),linear-gradient(180deg,rgba(17,17,17,0.98),rgba(10,10,10,1))] p-6 backdrop-blur ${
        inlineMode
          ? "relative z-10 max-h-none overflow-visible rounded-[24px] shadow-[0_18px_56px_rgba(0,0,0,0.34)]"
          : "fixed inset-x-0 bottom-0 z-40 max-h-[82vh] overflow-y-auto overscroll-contain rounded-t-[24px] border-b-0 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-[0_-20px_70px_rgba(0,0,0,0.45)] xl:inset-y-0 xl:right-0 xl:left-auto xl:max-h-none xl:w-[min(36rem,42vw)] xl:rounded-none xl:rounded-l-[28px] xl:border-b xl:border-r-0 xl:border-t-0 xl:pb-8 xl:shadow-[-28px_0_72px_rgba(0,0,0,0.52)]"
      }`}
    >
      <div className="pointer-events-none absolute right-[-60px] top-8 h-44 w-44 rounded-full bg-rose-400/10 blur-3xl" />
      <div className="sticky top-0 z-20 -mx-2 mb-4 rounded-2xl border border-white/10 bg-[#0e0e0e]/92 px-3 py-3 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">{placeTypeLabel}</p>
            <h2 className="truncate text-base font-semibold tracking-[-0.01em] text-white">{selectedPlace.name}</h2>
          </div>
          <button
            type="button"
            aria-label="Close venue details"
            className="qa-cinematic-hover rounded-full border border-white/14 bg-[#0e0e0e]/90 px-3 py-2 text-xs text-white/80 hover:border-white/25 hover:text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-white/55">Overview</p>
        <SelectedPlaceSummary
          selectedPlace={selectedPlace}
          cityName={cityName}
          typeLabels={typeLabels}
          selectedPlaceSafetySignal={selectedPlaceSafetySignal}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-white/55">Actions</p>
        <SelectedPlaceActions
          selectedPlace={selectedPlace}
          handleReport={handleReport}
          toggleFavorite={toggleFavorite}
          favorites={favorites}
          isAdmin={isAdmin}
          handleAdminDeletePlace={handleAdminDeletePlace}
          isDeletingPlaceAdmin={isDeletingPlaceAdmin}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-white/55">Live Signal</p>
        <SelectedPlaceLiveVibePanel
          liveVibeSummary={liveVibeSummary}
          liveVibeHeadline={liveVibeHeadline}
          liveVibePulse={liveVibePulse}
          liveVibeConsensus={liveVibeConsensus}
          liveVibeUpdatedLabel={liveVibeUpdatedLabel}
          liveVibeTableMissing={liveVibeTableMissing}
          handleSubmitLiveVibe={handleSubmitLiveVibe}
          isSubmittingLiveVibe={isSubmittingLiveVibe}
          liveVibeMyActiveSignalKey={liveVibeMyActiveSignalKey}
          liveVibeSubmittingKey={liveVibeSubmittingKey}
          liveVibeJustSentKey={liveVibeJustSentKey}
          LIVE_VIBE_OPTIONS={liveVibeOptions}
          isMember={isMember}
          liveVibeSelectedOption={liveVibeSelectedOption}
          isLoadingLiveVibe={isLoadingLiveVibe}
          liveVibeError={liveVibeError}
          liveVibeCooldownRemainingSec={liveVibeCooldownRemainingSec}
          showLiveVibeMomentum={showLiveVibeMomentum}
          setShowLiveVibeMomentum={setShowLiveVibeMomentum}
          liveVibeMemberMomentum={liveVibeMemberMomentum}
          liveVibeStreakNudge={liveVibeStreakNudge}
        />
      </div>

      {isAdmin ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <SelectedPlaceAdminControls
            isAdmin={isAdmin}
            isOpen={placeAdminOpen}
            onToggleOpen={onTogglePlaceAdmin}
            draft={placeAdminDraft}
            setDraft={setPlaceAdminDraft}
            onSaveAddressOnly={handleAdminSavePlaceAddressOnly}
            isSavingAddressOnly={isSavingPlaceAddressOnly}
            onSave={handleAdminSavePlace}
            isSaving={isSavingPlaceAdmin}
            onDelete={handleAdminDeletePlace}
            isDeleting={isDeletingPlaceAdmin}
            placeTypes={placeTypes}
          />
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-cyan-200/22 bg-[linear-gradient(140deg,rgba(34,211,238,0.12),rgba(9,12,24,0.92))] p-4">
          <p className="text-base font-semibold tracking-[0.04em] text-cyan-100">Reviews</p>
          <p className="mt-1 text-xs text-cyan-50/78">Community ratings and notes for this venue.</p>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <SelectedPlaceReviewsList reviews={reviews} />
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <p className="mb-3 text-xs font-semibold tracking-[0.06em] text-white/88">Write a review</p>
        <SelectedPlaceReviewComposer
          isMember={isMember}
          canReviewSelectedPlace={canReviewSelectedPlace}
          isSubmittingReview={isSubmittingReview}
          onJoinToReview={onJoinToReview}
          rating={rating}
          hoverRating={hoverRating}
          setHoverRating={setHoverRating}
          setRating={setRating}
          safetyRating={safetyRating}
          hoverSafetyRating={hoverSafetyRating}
          setHoverSafetyRating={setHoverSafetyRating}
          setSafetyRating={setSafetyRating}
          comment={comment}
          setComment={setComment}
          onSubmitReview={onSubmitReview}
        />
      </div>
    </div>
  );
}
