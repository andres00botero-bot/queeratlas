"use client";

import { useEffect, useState } from "react";
import { PenLine } from "lucide-react";
import SelectedPlaceActions from "@/components/city/SelectedPlaceActions";
import SelectedPlaceAdminControls from "@/components/city/SelectedPlaceAdminControls";
import SelectedPlaceLiveVibePanel from "@/components/city/SelectedPlaceLiveVibePanel";
import SelectedPlaceReviewComposer from "@/components/city/SelectedPlaceReviewComposer";
import SelectedPlaceReviewsList from "@/components/city/SelectedPlaceReviewsList";
import SelectedPlaceSummary from "@/components/city/SelectedPlaceSummary";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function SelectedPlacePanel({
  selectedPlace,
  inlineMode = false,
  onWheel,
  onClose,
  cityName,
  typeLabels,
  selectedPlaceSafetySignal,
  liveVibeSummary,
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
  showPlaceOnMap,
  handleReport,
  toggleFavorite,
  favorites,
  reviews,
  onReviewCtaOpened,
  onReviewStarted,
  reviewRequested = false,
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
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (reviewRequested) {
      setActiveTab("reviews");
      onReviewCtaOpened?.();
    }
  }, [onReviewCtaOpened, reviewRequested, selectedPlace?.id]);

  if (!selectedPlace) return null;
  const placeTypeLabel = typeLabels?.[selectedPlace.type] || t("city.venue", "Venue");
  const tabs = [
    { key: "overview", label: t("city.overview", "Overview") },
    { key: "reviews", label: t("city.writeReview", "Write a review") },
  ];
  const reviewCount = Number(selectedPlace.reviewCount || 0);
  const reviewCountLabel = reviewCount > 0 ? `${reviewCount}` : "";

  return (
    <div
      onWheel={onWheel}
      className={`qa-city-panel-cq qa-city-detail-sheet qa-city-detail-venue animate-panel-in border p-5 backdrop-blur sm:p-6 ${
        inlineMode
          ? "relative z-10 max-h-none overflow-visible rounded-[28px] shadow-[0_22px_68px_rgba(91,33,182,0.18)]"
          : "fixed inset-x-0 bottom-0 z-40 max-h-[82vh] overflow-y-auto overscroll-contain rounded-t-[28px] border-b-0 pb-[calc(7.25rem+env(safe-area-inset-bottom,0px))] shadow-[0_-24px_76px_rgba(91,33,182,0.25)] xl:inset-y-0 xl:right-0 xl:left-auto xl:max-h-none xl:w-[min(36rem,42vw)] xl:rounded-none xl:rounded-l-[30px] xl:border-b xl:border-r-0 xl:border-t-0 xl:pb-8 xl:shadow-[-30px_0_78px_rgba(91,33,182,0.28)]"
      }`}
    >
      <div className="qa-city-detail-header sticky top-0 z-20 -mx-2 mb-5 rounded-[22px] border px-3 py-3 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fuchsia-100/78">{placeTypeLabel}</p>
            <h2 className="truncate text-lg font-semibold tracking-[-0.01em] text-white">{selectedPlace.name}</h2>
          </div>
          <button
            type="button"
            aria-label={t("city.closeVenueDetails", "Close venue details")}
            className="qa-cinematic-hover rounded-full border border-white/24 bg-white/[0.10] px-3 py-2 text-xs text-white/86 hover:border-white/38 hover:bg-white/[0.14] hover:text-white"
            onClick={onClose}
          >
            {t("city.close", "Close")}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/14 bg-black/18 p-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                aria-pressed={isActive}
                className={`qa-action relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-xl px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-100 ${
                  tab.key === "reviews"
                    ? isActive
                      ? "qa-review-cta border border-fuchsia-50/80 text-white"
                      : "qa-review-cta border border-fuchsia-100/58 text-white"
                    : isActive
                      ? "border border-cyan-100/34 bg-[linear-gradient(135deg,rgba(34,211,238,0.22),rgba(244,114,182,0.16))] text-white shadow-[0_10px_26px_rgba(34,211,238,0.14)]"
                      : "text-white/58 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {tab.key === "reviews" ? (
                  <span
                    aria-hidden="true"
                    className="qa-review-cta-sheen pointer-events-none absolute inset-y-[-60%] left-[-26%] w-[22%] -skew-x-12"
                  />
                ) : null}
                {tab.key === "reviews" ? (
                  <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/18 bg-black/20 shadow-inner">
                    <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                ) : null}
                <span className="relative">{tab.label}</span>
                {tab.key === "reviews" && reviewCountLabel ? (
                  <span className="relative rounded-full border border-white/18 bg-black/18 px-1.5 py-0.5 text-[10px] text-white/78">{reviewCountLabel}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "overview" ? (
        <>
          <div className="qa-city-detail-surface rounded-[22px] border p-4">
            <SelectedPlaceSummary
              selectedPlace={selectedPlace}
              cityName={cityName}
              typeLabels={typeLabels}
              selectedPlaceSafetySignal={selectedPlaceSafetySignal}
              showPlaceOnMap={showPlaceOnMap}
              onOpenReviews={() => {
                setActiveTab("reviews");
                onReviewCtaOpened?.();
              }}
              liveSignal={
                <SelectedPlaceLiveVibePanel
                  liveVibeSummary={liveVibeSummary}
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
                />
              }
            />
          </div>

          <div className="qa-city-detail-surface mt-4 rounded-[22px] border p-4">
            <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-white/58">{t("city.actions", "Actions")}</p>
            <SelectedPlaceActions
              selectedPlace={selectedPlace}
              showPlaceOnMap={showPlaceOnMap}
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
                city={selectedPlace.city || cityName}
              />
            </div>
          ) : null}
        </>
      ) : null}

      {activeTab === "reviews" ? (
        <>
          <div className="qa-city-detail-surface rounded-[22px] border p-4">
            <p className="text-base font-semibold tracking-[0.01em] text-white">{t("city.reviews", "Reviews")}</p>
          </div>

          <div className="qa-city-detail-surface mt-4 rounded-[22px] border p-4">
            <SelectedPlaceReviewsList reviews={reviews} />
          </div>

          <div className="qa-city-detail-surface mt-4 rounded-[22px] border p-4">
            <p className="mb-3 text-xs font-semibold tracking-[0.06em] text-white/88">{t("city.writeReview", "Write a review")}</p>
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
              onStartReview={onReviewStarted}
              onSubmitReview={onSubmitReview}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
