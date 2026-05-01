"use client";

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
  showLiveVibeMomentum,
  setShowLiveVibeMomentum,
  liveVibeMemberMomentum,
  liveVibeStreakNudge,
}) {
  return (
    <div className="mt-3 rounded-2xl border border-fuchsia-200/18 bg-fuchsia-200/[0.07] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-fuchsia-100/80">Live vibe now</p>
        <span className="rounded-full border border-fuchsia-200/20 bg-fuchsia-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-fuchsia-100/80">
          {liveVibeSummary.total} signal{liveVibeSummary.total === 1 ? "" : "s"} - 6h
        </span>
      </div>
      <p className="mt-1 text-sm text-fuchsia-50/95">{liveVibeHeadline}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${liveVibePulse.className}`}
        >
          {liveVibePulse.label}
        </span>
        {liveVibeConsensus > 0 && (
          <span className="rounded-full border border-white/18 bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/80">
            {liveVibeConsensus}% consensus
          </span>
        )}
        <span className="text-[10px] uppercase tracking-[0.12em] text-fuchsia-100/68">
          {liveVibePulse.hint}
        </span>
      </div>
      {liveVibeUpdatedLabel && (
        <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-fuchsia-100/70">
          {liveVibeUpdatedLabel}
        </p>
      )}
      {liveVibeSummary.total === 0 && !liveVibeTableMissing && (
        <button
          type="button"
          onClick={() => handleSubmitLiveVibe("packed")}
          disabled={isSubmittingLiveVibe}
          className="mt-2 rounded-full border border-fuchsia-200/28 bg-fuchsia-200/12 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-fuchsia-100 transition hover:border-fuchsia-200/48 disabled:opacity-60"
        >
          Be first now
        </button>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {LIVE_VIBE_OPTIONS.map((option) => {
          const count = liveVibeSummary.countsByKey?.[option.key] || 0;
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
              className={`qa-cinematic-hover rounded-xl border px-3 py-2 text-left text-xs transition disabled:cursor-not-allowed disabled:opacity-60 ${option.buttonClass} ${
                isSelectedSignal ? "ring-2 ring-white/35 shadow-[0_0_0_1px_rgba(255,255,255,0.22)_inset]" : ""
              } ${isJustSentSignal ? "scale-[1.02] shadow-[0_10px_28px_rgba(244,114,182,0.25)]" : ""}`}
            >
              <span className="block text-sm font-semibold">
                {option.emoji} {option.label}
              </span>
              <span className="mt-0.5 block text-[10px] uppercase tracking-[0.12em] opacity-85">
                {isSubmittingSignal
                  ? "Sending..."
                  : isSelectedSignal
                    ? "Your signal"
                    : `${count} tap${count === 1 ? "" : "s"}`}
              </span>
            </button>
          );
        })}
      </div>
      {isMember && liveVibeSelectedOption && (
        <p className="mt-2 text-[11px] text-fuchsia-100/82">
          Your live signal: {liveVibeSelectedOption.emoji} {liveVibeSelectedOption.label}
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
      <p className="mt-2 text-[11px] text-fuchsia-100/76">
        One tap updates the room signal for everyone right now.
      </p>
      {liveVibeCooldownRemainingSec > 0 && (
        <p className="mt-1 text-[11px] text-cyan-100/85">
          Cooldown active: {liveVibeCooldownRemainingSec}s
        </p>
      )}
      {isMember && (
        <div className="mt-2 rounded-xl border border-white/12 bg-white/[0.05] p-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/62">Your momentum</p>
            <button
              type="button"
              onClick={() => setShowLiveVibeMomentum((value) => !value)}
              className="rounded-full border border-white/16 bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/78 transition hover:border-white/28"
            >
              {showLiveVibeMomentum ? "Hide" : "Show"}
            </button>
          </div>
          {showLiveVibeMomentum && (
            <>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-white/82">
                <span className="rounded-full border border-white/14 bg-white/8 px-2 py-0.5">
                  {liveVibeMemberMomentum.streakDays}d streak
                </span>
                <span className="rounded-full border border-white/14 bg-white/8 px-2 py-0.5">
                  {liveVibeMemberMomentum.weekTaps} taps / 7d
                </span>
                <span className="rounded-full border border-white/14 bg-white/8 px-2 py-0.5">
                  {liveVibeMemberMomentum.todayTapped ? "Tapped today" : "No tap today"}
                </span>
                {liveVibeMemberMomentum.lastTapLabel && (
                  <span className="text-white/64">Last: {liveVibeMemberMomentum.lastTapLabel}</span>
                )}
              </div>
              {liveVibeStreakNudge && (
                <p
                  className={`mt-1.5 text-[11px] ${
                    liveVibeMemberMomentum.todayTapped ? "text-emerald-100/85" : "text-amber-100/88"
                  }`}
                >
                  {liveVibeStreakNudge}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
