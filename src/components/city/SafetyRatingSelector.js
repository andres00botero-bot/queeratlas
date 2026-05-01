"use client";

import { Shield } from "lucide-react";

export default function SafetyRatingSelector({
  value = 4,
  hoverValue = null,
  disabled = false,
  onHoverStart,
  onHoverEnd,
  onSelect,
}) {
  const activeValue = Number(hoverValue || value || 0);
  return (
    <div>
      <p className="mb-1 text-[11px] uppercase tracking-[0.14em] text-white/55">Safety feeling</p>
      <div className="mb-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((step) => (
          <button
            key={`safety-${step}`}
            type="button"
            disabled={disabled}
            onMouseEnter={() => onHoverStart?.(step)}
            onMouseLeave={() => onHoverEnd?.()}
            onClick={() => onSelect?.(step)}
            aria-label={`Set safety to ${step} shield${step > 1 ? "s" : ""}`}
            aria-pressed={value === step}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
              disabled ? "opacity-60" : "hover:bg-white/8"
            }`}
          >
            <Shield
              className={`h-5 w-5 ${activeValue >= step ? "text-cyan-300" : "text-white/30"}`}
              fill={activeValue >= step ? "currentColor" : "none"}
              strokeWidth={2.1}
            />
          </button>
        ))}
        <span className="ml-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-cyan-100">
          {value}/5
        </span>
      </div>
    </div>
  );
}
