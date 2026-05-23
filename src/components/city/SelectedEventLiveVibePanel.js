"use client";

import Image from "next/image";

export default function SelectedEventLiveVibePanel({
  LIVE_VIBE_OPTIONS,
  eventLiveVibeSignalKey,
  isSubmittingEventLiveVibe,
  eventLiveVibeSubmittingKey,
  eventLiveVibeJustSentKey,
  handleSubmitEventLiveVibe,
  isMember,
  eventLiveVibeSelectedOption,
}) {
  return (
    <div className="mt-3 rounded-2xl border border-fuchsia-200/18 bg-fuchsia-200/[0.07] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-fuchsia-100/80">Live vibe now</p>
        <span className="rounded-full border border-fuchsia-200/20 bg-fuchsia-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-fuchsia-100/80">
          Event check-in
        </span>
      </div>
      <p className="mt-1 text-sm text-fuchsia-50/95">
        Tap to update the room signal.
      </p>
      <div className="mt-3 flex items-start justify-center gap-5">
        {LIVE_VIBE_OPTIONS.map((option) => {
          const displayLabel =
            option.key === "packed"
              ? "I love it"
              : option.key === "dancing"
                ? "Crowded"
                : option.key === "dead"
                  ? "Quiet"
                  : "Off vibe";
          const isSelectedSignal = eventLiveVibeSignalKey === option.key;
          const isSubmittingSignal = isSubmittingEventLiveVibe && eventLiveVibeSubmittingKey === option.key;
          const isJustSentSignal = eventLiveVibeJustSentKey === option.key;
          return (
            <button
              key={`event-live-vibe-${option.key}`}
              type="button"
              disabled={isSubmittingEventLiveVibe}
              aria-pressed={isSelectedSignal}
              onClick={() => {
                handleSubmitEventLiveVibe(option.key);
              }}
              className={`qa-cinematic-hover group relative w-[5.35rem] rounded-2xl border border-white/18 bg-[linear-gradient(160deg,rgba(11,11,20,0.95),rgba(26,11,35,0.9))] p-1.5 text-xs transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isSelectedSignal
                  ? "ring-2 ring-fuchsia-300/55 shadow-[0_0_0_1px_rgba(255,255,255,0.24)_inset,0_14px_30px_rgba(217,70,239,0.28)]"
                  : "hover:border-fuchsia-200/38 hover:shadow-[0_10px_24px_rgba(99,102,241,0.2)]"
              } ${isJustSentSignal ? "scale-[1.03] shadow-[0_16px_34px_rgba(244,114,182,0.3)]" : ""}`}
            >
              <span className="relative block aspect-square overflow-hidden rounded-xl border border-white/14 bg-black/35">
                <Image
                  src={option.iconSrc}
                  alt={option.label}
                  fill
                  sizes="72px"
                  className="object-contain p-1 saturate-125 contrast-110"
                />
              </span>
              <span className="mt-1.5 block text-center text-[9px] font-medium tracking-[0.01em] text-white/88">
                {displayLabel}
              </span>
              <span className="sr-only">
                {isSubmittingSignal ? "Saving..." : isSelectedSignal ? "Your signal" : option.label}
              </span>
            </button>
          );
        })}
      </div>
      {isMember && eventLiveVibeSelectedOption && (
        <p className="mt-2 text-[11px] text-fuchsia-100/82">
          Your event signal: {eventLiveVibeSelectedOption.label}
        </p>
      )}
    </div>
  );
}
