"use client";

import { useEffect, useId } from "react";
import { Star } from "lucide-react";
import SafetyRatingSelector from "@/components/city/SafetyRatingSelector";

export default function SelectedPlaceReviewComposer({
  place, copy, isMember,
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
  const noteId = useId();
  const draftKey = "venue-review-login:" + place.id;
  useEffect(() => {
    if (!isMember) return;
    try {
      const saved = sessionStorage.getItem(draftKey);
      if (!saved) return;
      const draft = JSON.parse(saved);
      setComment(draft.comment);
      setRating(draft.rating);
      setSafetyRating(draft.safetyRating);
      sessionStorage.removeItem(draftKey);
    } catch { /* Storage may be unavailable in private browsing. */ }
  }, [draftKey, isMember, setComment, setRating, setSafetyRating]);

  function join() {
    try { sessionStorage.setItem(draftKey, JSON.stringify({ comment, rating, safetyRating })); } catch { /* Sign-in still works. */ }
    onJoinToReview();
  }

  return (
    <div className="space-y-4">
      <div>
        <fieldset className="mb-4">
          <legend className="mb-2 text-sm font-semibold text-white">{copy.rating} {rating > 0 && <span>· {rating}/5</span>}</legend>
          <div className="flex items-center gap-1" >
          {[1, 2, 3, 4, 5].map((star) => (
            <label
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl transition focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-200 ${
                (hoverRating || rating) >= star ? "text-[#e7c67f]" : "text-white/55"
              } ${isSubmittingReview ? "cursor-not-allowed opacity-60" : "hover:bg-white/8"}`}
            >
              <input
                type="radio"
                name={noteId}
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
              <span className="sr-only">{star}/5</span>
            </label>
          ))}
          </div>
        </fieldset>
        <SafetyRatingSelector label={copy.safety} name={noteId + "-safety"}
          value={safetyRating}
          hoverValue={hoverSafetyRating}
          disabled={isSubmittingReview}
          onHoverStart={setHoverSafetyRating}
          onHoverEnd={() => setHoverSafetyRating(null)}
          onSelect={setSafetyRating}
        />

      </div>

      <div>
        <label htmlFor={noteId} className="mb-2 block text-sm font-semibold text-white">{copy[place.type === "hotel" ? "hotel" : place.type === "club" ? "club" : "prompt"]}</label>
        <textarea
          id={noteId}
          required
          value={comment}
          disabled={isSubmittingReview}

          onChange={(event) => { setComment(event.target.value); onStartReview?.(); }}
          placeholder={copy.hint}
          className="min-h-28 w-full rounded-xl border border-white bg-[#fff9f3] px-4 py-3 text-base leading-6 text-[#251c2c] placeholder:text-[#655d67] focus:outline-2 focus:outline-offset-2 focus:outline-cyan-200"
        />
      </div>

      <button type="button" disabled={!canReviewSelectedPlace || isSubmittingReview} onClick={isMember ? onSubmitReview : join} className="min-h-11 w-full rounded-full bg-[#e7c67f] px-4 font-semibold text-[#211b33] disabled:opacity-60">
        {isSubmittingReview ? "…" : isMember ? copy.post : copy.join}
      </button>
    </div>
  );
}
