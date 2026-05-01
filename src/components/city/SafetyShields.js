"use client";

import { Shield } from "lucide-react";

export default function SafetyShields({
  value = 0,
  className = "",
  activeClassName = "",
  inactiveClassName = "",
}) {
  const safeValue = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap ${className}`.trim()}>
      {[1, 2, 3, 4, 5].map((step) => {
        const active = safeValue >= step;
        return (
          <Shield
            key={`safety-shield-${step}`}
            className={`h-3.5 w-3.5 ${active ? activeClassName : inactiveClassName}`.trim()}
            strokeWidth={2.1}
            fill={active ? "currentColor" : "none"}
            aria-hidden="true"
          />
        );
      })}
    </span>
  );
}
