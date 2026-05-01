"use client";

import SafetyShields from "@/components/city/SafetyShields";
import { getMemberTitleMeta } from "@/lib/communityRanking";

export default function SelectedPlaceReviewsList({ reviews = [] }) {
  return (
    <div className="mt-4 space-y-2">
      {reviews.map((review) => {
        const titleMeta = getMemberTitleMeta(review.memberTitle);
        return (
          <div key={review.id} className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-white/85">{review.authorName || "Member"}</p>
                {review.memberTitle && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${titleMeta.className}`}
                  >
                    <span>{titleMeta.icon}</span>
                    {titleMeta.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs uppercase tracking-[0.14em] text-yellow-300/90">Rating {review.rating}/5</p>
                {Number(review?.safety) > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200/24 bg-cyan-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-cyan-100">
                    <SafetyShields
                      value={Number(review.safety)}
                      activeClassName="text-cyan-100"
                      inactiveClassName="text-white/30"
                    />
                    Safety
                  </span>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-200">{review.comment}</p>
          </div>
        );
      })}
    </div>
  );
}
