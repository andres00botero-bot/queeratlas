"use client";

import SafetyShields from "@/components/city/SafetyShields";
import { getMemberTitleMeta } from "@/lib/communityRanking";

export default function SelectedPlaceReviewsList({ reviews = [] }) {
  if (reviews.length === 0) {
    return (
      <div className="border-b border-white/[0.08] py-8 text-left">
        <p className="text-sm font-semibold text-[#f7f2f7]">No reviews yet.</p>
        <p className="mt-1 text-sm text-[#bdb3c2]">Be the first to share what the visit felt like.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/[0.08]">
      {reviews.map((review) => {
        const titleMeta = getMemberTitleMeta(review.memberTitle);
        return (
          <article key={review.id} className="py-5 first:pt-4">
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
                <p className="text-xs font-semibold text-[#e7c67f]">{review.rating}/5</p>
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
            <p className="mt-2 text-sm leading-6 text-white/76">{review.comment}</p>
          </article>
        );
      })}
    </div>
  );
}
