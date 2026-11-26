"use client";

import { useEffect, useRef, useState } from "react";
import { venueReviews } from "@/lib/i18n/venueReviews";
import { PenLine } from "lucide-react";
import SelectedPlaceActions from "@/components/city/SelectedPlaceActions";
import SelectedPlaceAdminControls from "@/components/city/SelectedPlaceAdminControls";
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
  isMember,
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
  const { t, locale } = useLocale();
  const copy = venueReviews[locale];
  const reviewPanel = useRef(null);
  const [reviewComposerOpen, setReviewComposerOpen] = useState(false);

  useEffect(() => {
    if (reviewRequested) {
      const timer = window.setTimeout(() => {
        setReviewComposerOpen(true);
      }, 0);
      onReviewCtaOpened?.();
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [onReviewCtaOpened, reviewRequested, selectedPlace?.id]);

  if (!selectedPlace) return null;
  const placeTypeLabel = typeLabels?.[selectedPlace.type] || t("city.venue", "Venue");
  const reviewCount = Number(selectedPlace.reviewCount || 0);
  const averageRating = Number(selectedPlace.avgRating ?? selectedPlace.avg_rating);
  const reviewSummary = Number.isFinite(averageRating) && averageRating > 0
    ? `${averageRating.toFixed(1)} / 5 · ${reviewCount} ${t("city.reviews", "reviews")}`
    : reviewCount ? `${reviewCount} ${t("city.reviews", "reviews")}` : t("city.noReviewsYet", "No reviews yet");

  return (
    <div
      onWheel={onWheel}
      className={`qa-city-panel-cq qa-city-detail-sheet qa-city-detail-venue qa-venue-detail animate-panel-in border p-5 backdrop-blur sm:p-6 ${
        inlineMode
          ? "relative z-10 max-h-none overflow-visible rounded-[28px] shadow-[0_22px_68px_rgba(91,33,182,0.18)]"
          : "fixed inset-x-0 bottom-0 z-40 max-h-[82vh] overflow-y-auto overscroll-contain rounded-t-[28px] border-b-0 pb-[calc(7.25rem+env(safe-area-inset-bottom,0px))] shadow-[0_-24px_76px_rgba(91,33,182,0.25)] xl:inset-y-0 xl:right-0 xl:left-auto xl:max-h-none xl:w-[min(36rem,42vw)] xl:rounded-none xl:rounded-l-[30px] xl:border-b xl:border-r-0 xl:border-t-0 xl:pb-8 xl:shadow-[-30px_0_78px_rgba(91,33,182,0.28)]"
      }`}
    >
      <div className="sticky top-0 z-20 -mx-5 mb-6 border-b border-white/[0.08] bg-[#181426]/95 px-5 pb-3 pt-1 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d7c0ff]/72">{placeTypeLabel}</p>
            <h2 className="truncate text-xl font-semibold tracking-[-0.02em] text-[#f7f2f7]">{selectedPlace.name}</h2>
          </div>
          <button
            type="button"
            aria-label={t("city.closeVenueDetails", "Close venue details")}
            className="qa-cinematic-hover rounded-full px-2 py-2 text-xs text-white/62 hover:bg-white/[0.07] hover:text-white"
            onClick={onClose}
          >
            {t("city.close", "Close")}
          </button>
        </div>
      </div>

      <SelectedPlaceSummary
              selectedPlace={selectedPlace}
              cityName={cityName}
              typeLabels={typeLabels}
              selectedPlaceSafetySignal={selectedPlaceSafetySignal}
              reviews={reviews}
              showPlaceOnMap={showPlaceOnMap}
              onOpenReviews={() => {
                setReviewComposerOpen(true);
                reviewPanel.current?.scrollIntoView({ block: "start" });
                onReviewCtaOpened?.();
              }}
      />

      <section ref={reviewPanel} className="mt-7 scroll-mt-20 rounded-3xl border border-[#bd9ee8]/55 bg-gradient-to-br from-[#513966] to-[#332a48] p-4 shadow-lg sm:p-6" aria-label={t("city.reviews", "Reviews")}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold tracking-[0.01em] text-[#f7f2f7]">{t("city.reviews", "Reviews")}</p>
            <p className="mt-1 text-xs text-[#bdb3c2]">{reviewCount ? reviewSummary : copy.invite}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setReviewComposerOpen(!reviewComposerOpen);
              if (!reviewComposerOpen) onReviewCtaOpened?.();
            }}
            aria-expanded={reviewComposerOpen}
            className={`qa-action inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold ${reviewComposerOpen ? "text-white underline" : "bg-[#e7c67f] text-[#211b33] hover:bg-[#f2d997]"}` }
          >
            <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
            {reviewComposerOpen ? t("city.cancel", "Cancel") : reviewCount ? t("city.writeReview", "Write a review") : copy.first}
          </button>
        </div>
        {reviewComposerOpen ? (
          <div className="mt-6 border-t border-white/[0.08] pt-5">
            <SelectedPlaceReviewComposer
              key={selectedPlace.id}
              place={selectedPlace}
              copy={copy}
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
        ) : null}
        {reviews?.length > 0 && <SelectedPlaceReviewsList key={selectedPlace.id} reviews={reviews} />}
      </section>

      <div className="mt-7 border-t border-white/[0.08] pt-5">
            <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-[#d7c0ff]/68">{t("city.actions", "Actions")}</p>
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
            <div className="mt-7 border-t border-amber-100/18 pt-5">
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
    </div>
  );
}
