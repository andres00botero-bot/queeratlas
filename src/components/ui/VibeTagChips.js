"use client";

import { resolveVibeTagLabelsForEntity } from "@/lib/vibeDisplay";

const TONE_STYLE = {
  amber: "border-amber-200/38 bg-amber-200/22 text-amber-50",
  emerald: "border-emerald-200/38 bg-emerald-200/22 text-emerald-50",
  violet: "border-violet-200/38 bg-violet-200/22 text-violet-50",
  rose: "border-rose-200/38 bg-rose-200/22 text-rose-50",
  cyan: "border-cyan-200/38 bg-cyan-200/22 text-cyan-50",
  neutral: "border-white/24 bg-white/14 text-white/90",
};

function resolveToneClass(tone) {
  return TONE_STYLE[tone] || TONE_STYLE.neutral;
}

export default function VibeTagChips({
  entity = {},
  tone = "neutral",
  className = "",
  max = 3,
  includeTypeFallback = false,
  includeMixedFallback = false,
}) {
  const labels = resolveVibeTagLabelsForEntity(entity, {
    max,
    includeTypeFallback,
    includeMixedFallback,
  });

  if (labels.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`.trim()}>
      {labels.map((label) => (
        <span
          key={`${String(entity?.id || entity?.name || "entity")}-vibe-${label}`}
          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${resolveToneClass(tone)}`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
