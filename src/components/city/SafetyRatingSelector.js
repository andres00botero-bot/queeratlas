"use client";

import { Shield } from "lucide-react";

export default function SafetyRatingSelector({
  value = 0,
  hoverValue = null,
  disabled = false,
  onHoverStart,
  onHoverEnd,
  onSelect,
}) {
  const activeValue = Number(hoverValue || value || 0);
  return (
    <fieldset className="mb-4">
      <legend className="mb-2 text-sm font-semibold text-white">Safety rating <span className="font-normal text-white/55">Optional</span></legend>
      <div className="mb-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((step) => (
          <label
            key={`safety-${step}`}
            onMouseEnter={() => onHoverStart?.(step)}
            onMouseLeave={() => onHoverEnd?.()}
            className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition focus-within:outline-none focus-within:ring-2 focus-within:ring-cyan-100 ${
              disabled ? "cursor-not-allowed opacity-60" : "hover:bg-white/8"
            }`}
          >
            <input
              type="radio"
              name="venue-safety-rating"
              value={step}
              checked={value === step}
              disabled={disabled}
              onChange={() => onSelect?.(step)}
              className="sr-only"
            />
            <Shield
              className={`h-5 w-5 ${activeValue >= step ? "text-cyan-300" : "text-white/30"}`}
              fill={activeValue >= step ? "currentColor" : "none"}
              strokeWidth={2.1}
            />
            <span className="sr-only">{step} {step === 1 ? "shield" : "shields"}</span>
          </label>
        ))}
        <span className="ml-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-cyan-100">
          {value > 0 ? `${value}/5` : "Not rated"}
        </span>
      </div>
    </fieldset>
  );
}
