"use client";

import Image from "next/image";

export default function SelectedPlaceLiveVibePanel({
  liveVibeSummary,
  liveVibeHeadline,
  liveVibePulse,
  liveVibeConsensus,
  liveVibeUpdatedLabel,
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
  const getSignalText = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (typeof value === "object") {
      return String(value.label || value.hint || "").trim();
    }
    return "";
  };
  const headlineText = getSignalText(liveVibeHeadline) || "How does it feel right now?";
  const pulseText =
    getSignalText(liveVibePulse) ||
    getSignalText(liveVibeConsensus) ||
    "Tap one signal to help others read the room.";

  return (
    <div className="rounded-[28px] border border-fuchsia-100/24 bg-[linear-gradient(145deg,rgba(244,114,182,0.18),rgba(139,92,246,0.12),rgba(34,211,238,0.08),rgba(255,255,255,0.06))] p-5 shadow-[0_22px_62px_rgba(217,70,239,0.16)]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-fuchsia-100/78">Live Signal</p>
          <h3 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-white">
            {headlineText}
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/70">
            {pulseText}
          </p>
        </div>
        <span className="rounded-full border border-fuchsia-100/28 bg-fuchsia-300/14 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-fuchsia-50">
          {liveVibeSummary.total} signal{liveVibeSummary.total === 1 ? "" : "s"} / 6h
        </span>
      </div>
      {liveVibeUpdatedLabel ? (
        <p className="mb-4 rounded-full border border-white/14 bg-white/[0.07] px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-white/66">
          Updated {liveVibeUpdatedLabel}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
              className={`qa-cinematic-hover group relative rounded-[22px] border border-white/18 bg-white/[0.075] p-2.5 text-xs shadow-[0_14px_34px_rgba(0,0,0,0.12)] transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isSelectedSignal
                  ? "border-fuchsia-100/58 bg-fuchsia-300/18 ring-2 ring-fuchsia-300/55 shadow-[0_0_0_1px_rgba(255,255,255,0.24)_inset,0_16px_34px_rgba(217,70,239,0.24)]"
                  : "hover:border-fuchsia-100/42 hover:bg-white/[0.11] hover:shadow-[0_14px_30px_rgba(99,102,241,0.18)]"
              } ${isJustSentSignal ? "scale-[1.03] shadow-[0_16px_34px_rgba(244,114,182,0.3)]" : ""}`}
            >
              <span className="relative block aspect-square overflow-hidden rounded-2xl border border-white/18 bg-black/26">
                <Image
                  src={option.iconSrc}
                  alt={option.label}
                  fill
                  sizes="72px"
                  className="object-contain p-2 saturate-125 contrast-110"
                />
              </span>
              <span className="mt-2 block text-center text-[11px] font-semibold tracking-[0.01em] text-white/90">
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
        <p className="mt-4 rounded-2xl border border-fuchsia-100/22 bg-fuchsia-300/[0.10] px-3 py-2 text-[12px] text-fuchsia-50/88">
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
