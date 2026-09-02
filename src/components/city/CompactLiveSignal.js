"use client";

import { useEffect, useState } from "react";
import { Activity, Check, ChevronDown } from "lucide-react";

const SIGNAL_LABELS = { dead: "Quiet", off_vibe: "Social", dancing: "Busy", packed: "Packed" };
const SIGNAL_ORDER = ["dead", "off_vibe", "dancing", "packed"];
const MIN_PUBLIC_SIGNALS = 3;

export default function CompactLiveSignal({
  context = "venue", summary = null, updatedLabel = "", activeSignalKey = "",
  submittingKey = "", justSentKey = "", options = [], onSubmit,
  isSubmitting = false, isMember = false, selectedOption = null,
  isLoading = false, error = "", isUnavailable = false, cooldownRemainingSec = 0,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const total = Number(summary?.total || 0);
  const hasPublicSignal = context === "venue" && total >= MIN_PUBLIC_SIGNALS;
  const topSignalKey = hasPublicSignal ? String(summary?.top?.[0]?.key || "") : "";
  const topSignalLabel = SIGNAL_LABELS[topSignalKey] || "Live activity";
  const selectedLabel = SIGNAL_LABELS[activeSignalKey] || selectedOption?.label || "";
  const orderedOptions = SIGNAL_ORDER.map((key) => options.find((option) => option.key === key)).filter(Boolean);

  useEffect(() => {
    if (!justSentKey) return;
    queueMicrotask(() => setIsExpanded(false));
  }, [justSentKey]);

  const statusText = justSentKey
    ? "Thanks — your update is live"
    : hasPublicSignal
    ? `${topSignalLabel} · ${total} recent signals`
    : context === "event"
      ? selectedLabel ? `Your update: ${selectedLabel}` : "Share how busy it feels"
      : "Not enough fresh signals";

  return (
    <div className="my-4 overflow-hidden rounded-[18px] border border-fuchsia-100/22 bg-[linear-gradient(135deg,rgba(244,114,182,0.11),rgba(34,211,238,0.07),rgba(255,255,255,0.045))]">
      <button type="button" onClick={() => setIsExpanded((current) => !current)} aria-expanded={isExpanded} className="qa-action flex w-full items-center gap-3 px-3.5 py-3 text-left">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${hasPublicSignal ? "border-emerald-200/32 bg-emerald-300/14 text-emerald-100" : "border-white/18 bg-white/[0.07] text-white/70"}`}>
          <Activity className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-fuchsia-100/72">Right now</span>
          <span className="mt-0.5 block truncate text-sm font-semibold text-white/90">{isLoading ? "Checking fresh signals…" : statusText}</span>
          {hasPublicSignal && updatedLabel ? <span className="mt-0.5 block text-[11px] text-white/52">{updatedLabel}</span> : null}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-cyan-50/76">
          {isExpanded ? "Close" : "Update"}
          <ChevronDown className={`h-4 w-4 transition ${isExpanded ? "rotate-180" : ""}`} aria-hidden="true" />
        </span>
      </button>

      {isExpanded ? (
        <div className="border-t border-white/10 px-3.5 pb-3.5 pt-3">
          <p className="text-xs leading-5 text-white/66">How busy does it feel right now?</p>
          <div className="mt-2.5 grid grid-cols-4 gap-1.5">
            {orderedOptions.map((option) => {
              const label = SIGNAL_LABELS[option.key] || option.label;
              const isSelected = activeSignalKey === option.key;
              const isSaving = isSubmitting && submittingKey === option.key;
              return (
                <button key={`compact-live-${context}-${option.key}`} type="button" disabled={isSubmitting || isUnavailable || cooldownRemainingSec > 0} aria-pressed={isSelected} onClick={() => onSubmit?.(option.key)} className={`qa-action min-w-0 rounded-xl border px-1.5 py-2.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${isSelected ? "border-fuchsia-100/52 bg-fuchsia-300/18 text-white ring-1 ring-fuchsia-200/36" : "border-white/14 bg-white/[0.055] text-white/76 hover:border-cyan-100/32 hover:text-white"}`}>
                  {isSaving ? "Saving…" : label}
                </button>
              );
            })}
          </div>
          {justSentKey ? (
            <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-100/88"><Check className="h-3.5 w-3.5" aria-hidden="true" /> Thanks — your signal is live.</p>
          ) : isMember && selectedLabel ? (
            <p className="mt-2.5 text-[11px] text-fuchsia-100/76">Your current signal: {selectedLabel}</p>
          ) : null}
          {cooldownRemainingSec > 0 ? <p className="mt-2 text-[11px] text-cyan-100/78">You can update again in {cooldownRemainingSec}s.</p> : null}
          {isUnavailable ? <p className="mt-2 text-[11px] text-amber-100/86">Live signals are temporarily unavailable.</p> : null}
          {error ? <p className="mt-2 text-[11px] text-rose-100">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
