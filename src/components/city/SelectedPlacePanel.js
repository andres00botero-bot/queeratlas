"use client";

import SelectedPlaceActions from "@/components/city/SelectedPlaceActions";
import SelectedPlaceAdminControls from "@/components/city/SelectedPlaceAdminControls";
import SelectedPlaceLiveVibePanel from "@/components/city/SelectedPlaceLiveVibePanel";
import SelectedPlaceReviewComposer from "@/components/city/SelectedPlaceReviewComposer";
import SelectedPlaceReviewsList from "@/components/city/SelectedPlaceReviewsList";
import SelectedPlaceSummary from "@/components/city/SelectedPlaceSummary";
import SelectedPlaceTrustSignals from "@/components/city/SelectedPlaceTrustSignals";

export default function SelectedPlacePanel({
  selectedPlace,
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
  selectedPlaceQuality,
  selectedPlaceQualityStatus,
  refreshEntityQuality,
  formatDate,
  trustedPlaceSavesCount,
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

  return (
    <div
      onWheel={onWheel}
      className="qa-city-panel-cq animate-panel-in fixed inset-x-0 bottom-0 z-40 max-h-[82vh] overflow-y-auto overscroll-contain rounded-t-[24px] border border-white/10 border-b-0 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.08),transparent_22%),linear-gradient(180deg,rgba(17,17,17,0.98),rgba(10,10,10,1))] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-[0_-20px_70px_rgba(0,0,0,0.45)] backdrop-blur lg:relative lg:inset-auto lg:w-[520px] lg:max-h-none lg:overflow-visible lg:overscroll-auto lg:rounded-none lg:border-b-0 lg:border-l lg:border-r-0 lg:border-t-0 lg:pb-6 lg:shadow-[-24px_0_80px_rgba(0,0,0,0.28)]"
    >
      <div className="pointer-events-none absolute right-[-60px] top-8 h-44 w-44 rounded-full bg-rose-400/10 blur-3xl" />
      <button
        type="button"
        aria-label="Close venue details"
        className="sticky top-0 z-20 qa-cinematic-hover rounded-full border border-white/14 bg-[#0e0e0e]/90 px-4 py-2.5 text-sm text-white/80 backdrop-blur hover:border-white/25 hover:text-white"
        onClick={onClose}
      >
        Close
      </button>
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <SelectedPlaceSummary
          selectedPlace={selectedPlace}
          cityName={cityName}
          typeLabels={typeLabels}
          selectedPlaceSafetySignal={selectedPlaceSafetySignal}
        />
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
        <SelectedPlaceTrustSignals
          selectedPlace={selectedPlace}
          selectedPlaceQuality={selectedPlaceQuality}
          selectedPlaceQualityStatus={selectedPlaceQualityStatus}
          refreshEntityQuality={refreshEntityQuality}
          formatDate={formatDate}
          trustedPlaceSavesCount={trustedPlaceSavesCount}
        />
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
      <SelectedPlaceActions
        selectedPlace={selectedPlace}
        handleReport={handleReport}
        toggleFavorite={toggleFavorite}
        favorites={favorites}
        isAdmin={isAdmin}
        handleAdminDeletePlace={handleAdminDeletePlace}
        isDeletingPlaceAdmin={isDeletingPlaceAdmin}
      />

      <SelectedPlaceReviewsList reviews={reviews} />

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
  );
}
