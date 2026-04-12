"use client";

const TONE_STYLES = {
  violet:
    "border-violet-200/14 bg-[linear-gradient(180deg,rgba(109,40,217,0.14),rgba(10,10,10,0.9))]",
  emerald:
    "border-emerald-200/14 bg-[linear-gradient(180deg,rgba(16,185,129,0.14),rgba(10,10,10,0.9))]",
  amber:
    "border-amber-200/14 bg-[linear-gradient(180deg,rgba(251,191,36,0.14),rgba(10,10,10,0.9))]",
};

export default function PageOpeningState({
  title = "Opening atlas...",
  subtitle = "Loading your member signal.",
  tone = "violet",
}) {
  const style = TONE_STYLES[tone] || TONE_STYLES.violet;

  return (
    <div className={`w-full max-w-xl rounded-[30px] border p-6 ${style}`}>
      <p className="text-xs uppercase tracking-[0.22em] text-white/52">{title}</p>
      <p className="mt-2 text-sm text-white/68">{subtitle}</p>
      <div className="mt-5 animate-pulse space-y-3" aria-hidden="true">
        <div className="h-4 w-44 rounded-full bg-white/14" />
        <div className="h-8 w-60 rounded-full bg-white/12" />
        <div className="h-3 w-full rounded-full bg-white/8" />
        <div className="h-3 w-5/6 rounded-full bg-white/8" />
      </div>
    </div>
  );
}
