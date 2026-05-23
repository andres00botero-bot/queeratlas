"use client";

import Image from "next/image";

export default function SelectedPlaceLiveVibePanel({
  liveVibeSummary,
  liveVibeTableMissing,
  handleSubmitLiveVibe,
  isSubmittingLiveVibe,
  liveVibeMyActiveSignalKey,
  liveVibeSubmittingKey,
  liveVibeJustSentKey,
  LIVE_VIBE_OPTIONS,
  isMember,
  liveVibeSelectedOption,
  isLoadingLiveVibe,
  liveVibeError,
  liveVibeCooldownRemainingSec,
}) {
  return (
    <div className="mt-3 rounded-2xl border border-fuchsia-200/18 bg-fuchsia-200/[0.07] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-fuchsia-100/80">Live vibe now</p>
        <span className="rounded-full border border-fuchsia-200/20 bg-fuchsia-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-fuchsia-100/80">
          {liveVibeSummary.total} signal{liveVibeSummary.total === 1 ? "" : "s"} - 6h
        </span>
      </div>
      <p className="mt-1 text-sm text-fuchsia-50/95">Tap to update the room signal.</p>
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
          const isSelectedSignal = liveVibeMyActiveSignalKey === option.key;
          const isSubmittingSignal = isSubmittingLiveVibe && liveVibeSubmittingKey === option.key;
          const isJustSentSignal = liveVibeJustSentKey === option.key;
          return (
            <button
              key={`live-vibe-${option.key}`}
              type="button"
              disabled={isSubmittingLiveVibe || liveVibeTableMissing}
              aria-pressed={isSelectedSignal}
              onClick={() => {
                handleSubmitLiveVibe(option.key);
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
                {isSubmittingSignal ? "Sending..." : isSelectedSignal ? "Your signal" : option.label}
              </span>
            </button>
          );
        })}
      </div>
      {isMember && liveVibeSelectedOption && (
        <p className="mt-2 text-[11px] text-fuchsia-100/82">
          Your live signal: {liveVibeSelectedOption.label}
        </p>
      )}
      {isLoadingLiveVibe && (
        <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-fuchsia-100/65">Loading live vibe...</p>
      )}
      {!!liveVibeError && (
        <p className="mt-2 text-xs text-rose-100">{liveVibeError}</p>
      )}
      {liveVibeTableMissing && (
        <p className="mt-2 text-xs text-amber-100">
          Live vibe table is not activated yet. Run the SQL setup block first.
        </p>
      )}
      {liveVibeCooldownRemainingSec > 0 && (
        <p className="mt-1 text-[11px] text-cyan-100/85">
          Cooldown active: {liveVibeCooldownRemainingSec}s
        </p>
      )}
    </div>
  );
}
