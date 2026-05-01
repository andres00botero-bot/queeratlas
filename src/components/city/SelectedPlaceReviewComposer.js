"use client";

import { Star } from "lucide-react";
import SafetyRatingSelector from "@/components/city/SafetyRatingSelector";

export default function SelectedPlaceReviewComposer({
  isMember,
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
  return (
    <div className="mt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-0">
      <p className="mb-2 text-xs uppercase tracking-[0.16em] text-white/45">Add your review</p>
      {!isMember && (
        <div className="mb-3 rounded-2xl border border-amber-300/20 bg-amber-200/10 p-3">
          <p className="text-sm text-amber-100">
            Log in as member to add reviews and strengthen quality signal.
          </p>
          <button
            type="button"
            onClick={onJoinToReview}
            className="mt-3 rounded-full border border-amber-200/28 bg-amber-200/14 px-4 py-2 text-xs text-amber-100 transition hover:border-amber-200/45"
          >
            Join to review
          </button>
        </div>
      )}
      <div className={`${!isMember || !canReviewSelectedPlace ? "hidden" : ""}`}>
        <p className="mb-1 text-[11px] uppercase tracking-[0.14em] text-white/55">Venue rating</p>
        <div className="mb-3 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={isSubmittingReview}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => setRating(star)}
              aria-label={`Set rating to ${star} star${star > 1 ? "s" : ""}`}
              aria-pressed={rating === star}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
                (hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-600"
              } ${isSubmittingReview ? "opacity-60" : "hover:bg-white/8"}`}
            >
              <Star className="h-5 w-5" fill="currentColor" />
            </button>
          ))}
        </div>
        <SafetyRatingSelector
          value={safetyRating}
          hoverValue={hoverSafetyRating}
          disabled={isSubmittingReview}
          onHoverStart={setHoverSafetyRating}
          onHoverEnd={() => setHoverSafetyRating(null)}
          onSelect={setSafetyRating}
        />
      </div>

      <textarea
        value={comment}
        disabled={!isMember || !canReviewSelectedPlace || isSubmittingReview}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Share vibe, safety, crowd energy, music, and what to expect."
        className={`mb-2 min-h-[110px] w-full rounded-2xl border border-white/10 bg-black/40 p-3 ${
          !isMember || !canReviewSelectedPlace ? "hidden" : ""
        }`}
      />

      <button
        disabled={!isMember || !canReviewSelectedPlace || isSubmittingReview}
        onClick={onSubmitReview}
        className={`qa-cinematic-hover w-full rounded-2xl bg-white py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60 ${
          !isMember || !canReviewSelectedPlace ? "hidden" : ""
        }`}
      >
        {isSubmittingReview ? "Submitting..." : "Submit review"}
      </button>
    </div>
  );
}
