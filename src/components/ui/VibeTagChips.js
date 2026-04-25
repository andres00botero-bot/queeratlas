"use client";

import { resolveVibeTagLabelsForEntity } from "@/lib/vibeDisplay";

const TONE_STYLE = {
  amber: "border-amber-200/24 bg-amber-200/12 text-amber-100",
  emerald: "border-emerald-200/24 bg-emerald-200/12 text-emerald-100",
  violet: "border-violet-200/24 bg-violet-200/12 text-violet-100",
  rose: "border-rose-200/24 bg-rose-200/12 text-rose-100",
  cyan: "border-cyan-200/24 bg-cyan-200/12 text-cyan-100",
  neutral: "border-white/14 bg-white/7 text-white/72",
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
          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${resolveToneClass(tone)}`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
