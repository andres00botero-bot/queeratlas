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
  onStartReview,
  onSubmitReview,
}) {
  return (
    <div className="mt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-0">
      <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[#d7c0ff]/68">Write a review</p>
      {!isMember && (
        <div className="mb-5 border-y border-[#e7c67f]/18 py-4">
          <p className="text-sm text-[#f2d997]">
            Log in as member to add reviews and strengthen quality signal.
          </p>
          <button
            type="button"
            onClick={onJoinToReview}
            className="mt-3 rounded-full bg-[#e7c67f] px-4 py-2 text-xs font-semibold text-[#211b33] transition hover:bg-[#f2d997]"
          >
            Join to review
          </button>
        </div>
      )}
      <div className={`${!isMember || !canReviewSelectedPlace ? "hidden" : ""}`}>
        <fieldset className="mb-4">
          <legend className="mb-2 text-sm font-semibold text-white">Overall rating</legend>
          <div className="flex items-center gap-1" aria-label="Venue rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <label
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-200 ${
                (hoverRating || rating) >= star ? "text-[#e7c67f]" : "text-white/22"
              } ${isSubmittingReview ? "cursor-not-allowed opacity-60" : "hover:bg-white/8"}`}
            >
              <input
                type="radio"
                name="venue-rating"
                value={star}
                checked={rating === star}
                disabled={isSubmittingReview}
                onChange={() => {
                  setRating(star);
                  onStartReview?.();
                }}
                className="sr-only"
              />
              <Star className="h-5 w-5" fill="currentColor" />
              <span className="sr-only">{star} {star === 1 ? "star" : "stars"}</span>
            </label>
          ))}
          </div>
        </fieldset>
        <SafetyRatingSelector
          value={safetyRating}
          hoverValue={hoverSafetyRating}
          disabled={isSubmittingReview}
          onHoverStart={setHoverSafetyRating}
          onHoverEnd={() => setHoverSafetyRating(null)}
          onSelect={setSafetyRating}
        />
      </div>

      <div className={`${!isMember || !canReviewSelectedPlace ? "hidden" : ""}`}>
        <label htmlFor="venue-review-note" className="mb-2 block text-sm font-semibold text-white">Your review</label>
        <textarea
          id="venue-review-note"
          value={comment}
          disabled={isSubmittingReview}
          onFocus={onStartReview}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Write your review"
          className="mb-2 min-h-[118px] w-full border-b border-white/14 bg-transparent px-0 py-3 text-sm leading-6 text-white placeholder:text-white/38 focus:border-[#d7c0ff]/65 focus:outline-none"
        />
      </div>

      <button
        disabled={!isMember || !canReviewSelectedPlace || isSubmittingReview}
        onClick={onSubmitReview}
        className={`qa-cinematic-hover w-full rounded-full bg-[#e7c67f] py-3 font-semibold text-[#211b33] transition hover:bg-[#f2d997] disabled:cursor-not-allowed disabled:opacity-60 ${
          !isMember || !canReviewSelectedPlace ? "hidden" : ""
        }`}
      >
        {isSubmittingReview ? "Submitting..." : "Submit review"}
      </button>
    </div>
  );
}
