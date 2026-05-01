"use client";

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
        Tap a live vibe and save a check-in automatically for this event.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {LIVE_VIBE_OPTIONS.map((option) => {
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
              className={`qa-cinematic-hover rounded-xl border px-3 py-2 text-left text-xs transition disabled:cursor-not-allowed disabled:opacity-60 ${option.buttonClass} ${
                isSelectedSignal ? "ring-2 ring-white/35 shadow-[0_0_0_1px_rgba(255,255,255,0.22)_inset]" : ""
              } ${isJustSentSignal ? "scale-[1.02] shadow-[0_10px_28px_rgba(244,114,182,0.25)]" : ""}`}
            >
              <span className="block text-sm font-semibold">
                {option.emoji} {option.label}
              </span>
              <span className="mt-0.5 block text-[10px] uppercase tracking-[0.12em] opacity-85">
                {isSubmittingSignal ? "Saving..." : isSelectedSignal ? "Your signal" : "Tap now"}
              </span>
            </button>
          );
        })}
      </div>
      {isMember && eventLiveVibeSelectedOption && (
        <p className="mt-2 text-[11px] text-fuchsia-100/82">
          Your event signal: {eventLiveVibeSelectedOption.emoji} {eventLiveVibeSelectedOption.label}
        </p>
      )}
    </div>
  );
}
