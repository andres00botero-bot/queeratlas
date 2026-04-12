"use client";

const TONE_STYLES = {
  violet:
    "border-violet-200/16 bg-[radial-gradient(circle_at_12%_10%,rgba(196,181,253,0.18),transparent_32%),linear-gradient(180deg,rgba(109,40,217,0.16),rgba(10,10,10,0.92))]",
  emerald:
    "border-emerald-200/16 bg-[radial-gradient(circle_at_12%_10%,rgba(110,231,183,0.18),transparent_32%),linear-gradient(180deg,rgba(16,185,129,0.16),rgba(10,10,10,0.92))]",
  amber:
    "border-amber-200/16 bg-[radial-gradient(circle_at_12%_10%,rgba(253,230,138,0.2),transparent_32%),linear-gradient(180deg,rgba(251,191,36,0.16),rgba(10,10,10,0.92))]",
};

export default function PageOpeningState({
  title = "Opening atlas...",
  subtitle = "Loading your member signal.",
  tone = "violet",
}) {
  const style = TONE_STYLES[tone] || TONE_STYLES.violet;

  return (
    <div className={`w-full max-w-xl rounded-[32px] border p-6 shadow-[0_28px_80px_rgba(0,0,0,0.36)] ${style}`}>
      <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-fuchsia-300/80 via-orange-300/80 to-cyan-300/80" />
      <p className="text-xs uppercase tracking-[0.22em] text-white/52">{title}</p>
      <p className="mt-2 text-sm text-white/72">{subtitle}</p>
      <div className="mt-5 animate-pulse space-y-3" aria-hidden="true">
        <div className="h-4 w-44 rounded-full bg-white/14" />
        <div className="h-8 w-60 rounded-full bg-white/12" />
        <div className="h-3 w-full rounded-full bg-white/8" />
        <div className="h-3 w-5/6 rounded-full bg-white/8" />
      </div>
    </div>
  );
}
