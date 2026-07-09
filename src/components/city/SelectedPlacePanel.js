"use client";

import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState("overview");

  if (!selectedPlace) return null;
  const placeTypeLabel = typeLabels?.[selectedPlace.type] || "Venue";
  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "live", label: "Live Signal" },
    { key: "reviews", label: "Reviews" },
  ];
  const reviewCount = Number(selectedPlace.reviewCount || 0);
  const reviewCountLabel = reviewCount > 0 ? `${reviewCount}` : "";

  return (
    <div
      onWheel={onWheel}
      className={`qa-city-panel-cq animate-panel-in border border-white/16 bg-[linear-gradient(145deg,rgba(244,114,182,0.14),rgba(34,211,238,0.08),rgba(12,10,18,0.98))] p-5 backdrop-blur sm:p-6 ${
        inlineMode
          ? "relative z-10 max-h-none overflow-visible rounded-[28px] shadow-[0_22px_68px_rgba(91,33,182,0.18)]"
          : "fixed inset-x-0 bottom-0 z-40 max-h-[82vh] overflow-y-auto overscroll-contain rounded-t-[28px] border-b-0 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-[0_-24px_76px_rgba(91,33,182,0.25)] xl:inset-y-0 xl:right-0 xl:left-auto xl:max-h-none xl:w-[min(36rem,42vw)] xl:rounded-none xl:rounded-l-[30px] xl:border-b xl:border-r-0 xl:border-t-0 xl:pb-8 xl:shadow-[-30px_0_78px_rgba(91,33,182,0.28)]"
      }`}
    >
      <div className="sticky top-0 z-20 -mx-2 mb-5 rounded-[24px] border border-white/20 bg-[linear-gradient(135deg,rgba(38,16,48,0.98),rgba(20,35,48,0.98),rgba(28,13,34,0.98))] px-3 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.34)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fuchsia-100/78">{placeTypeLabel}</p>
            <h2 className="truncate text-lg font-semibold tracking-[-0.01em] text-white">{selectedPlace.name}</h2>
          </div>
          <button
            type="button"
            aria-label="Close venue details"
            className="qa-cinematic-hover rounded-full border border-white/24 bg-white/[0.10] px-3 py-2 text-xs text-white/86 hover:border-white/38 hover:bg-white/[0.14] hover:text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-full border border-white/14 bg-black/18 p-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                aria-pressed={isActive}
                className={`qa-action rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                  isActive
                    ? "border border-cyan-100/34 bg-[linear-gradient(135deg,rgba(34,211,238,0.22),rgba(244,114,182,0.16))] text-white shadow-[0_10px_26px_rgba(34,211,238,0.14)]"
                    : "text-white/58 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {tab.label}
                {tab.key === "reviews" && reviewCountLabel ? (
                  <span className="ml-1 text-white/60">{reviewCountLabel}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "overview" ? (
        <>
          <div className="rounded-[24px] border border-white/16 bg-white/[0.075] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.12)]">
            <SelectedPlaceSummary
              selectedPlace={selectedPlace}
              cityName={cityName}
              typeLabels={typeLabels}
              selectedPlaceSafetySignal={selectedPlaceSafetySignal}
            />
          </div>

          <div className="mt-4 rounded-[24px] border border-white/14 bg-white/[0.055] p-4">
            <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-white/58">Actions</p>
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

          {isAdmin ? (
            <div className="mt-4 rounded-[24px] border border-amber-100/24 bg-[linear-gradient(135deg,rgba(251,191,36,0.13),rgba(244,114,182,0.08),rgba(255,255,255,0.06))] p-4 shadow-[0_16px_42px_rgba(251,191,36,0.10)]">
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
          ) : null}
        </>
      ) : null}

      {activeTab === "live" ? (
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
      ) : null}

      {activeTab === "reviews" ? (
        <>
          <div className="rounded-[24px] border border-cyan-100/24 bg-[linear-gradient(135deg,rgba(34,211,238,0.13),rgba(244,114,182,0.08),rgba(255,255,255,0.06))] p-4 shadow-[0_16px_42px_rgba(34,211,238,0.10)]">
            <p className="text-base font-semibold tracking-[0.01em] text-white">Reviews</p>
            <p className="mt-1 text-xs leading-5 text-cyan-50/78">Community ratings and notes for this venue.</p>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/14 bg-white/[0.055] p-4">
            <SelectedPlaceReviewsList reviews={reviews} />
          </div>

          <div className="mt-4 rounded-[24px] border border-white/14 bg-white/[0.055] p-4">
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
        </>
      ) : null}
    </div>
  );
}
