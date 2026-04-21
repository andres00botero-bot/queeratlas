"use client";

const TONE_STYLES = {
  neutral:
    "border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(10,10,10,0.5))]",
  violet:
    "border-violet-200/22 bg-[linear-gradient(180deg,rgba(167,139,250,0.13),rgba(10,10,10,0.58))]",
  emerald:
    "border-emerald-200/22 bg-[linear-gradient(180deg,rgba(16,185,129,0.14),rgba(10,10,10,0.58))]",
  amber:
    "border-amber-200/22 bg-[linear-gradient(180deg,rgba(251,191,36,0.14),rgba(10,10,10,0.58))]",
};

export default function EmptyState({
  title,
  description,
  children,
  className = "",
  tone = "neutral",
  primaryActionLabel = "",
  onPrimaryAction,
}) {
  const style = TONE_STYLES[tone] || TONE_STYLES.neutral;
  const showPrimaryAction = Boolean(primaryActionLabel && typeof onPrimaryAction === "function");

  return (
    <div
      className={`qa-elev-2 rounded-3xl border border-dashed px-6 py-10 text-center backdrop-blur ${style} ${className}`}
    >
      <div className="mx-auto mb-4 h-2 w-20 rounded-full bg-gradient-to-r from-fuchsia-300/65 via-orange-300/60 to-cyan-300/60" />
      <p className="qa-h3 text-sm font-medium tracking-[0.01em] text-white/75">{title}</p>
      {description && <p className="qa-clamp-3 mx-auto mt-2 max-w-2xl text-xs text-white/52">{description}</p>}
      {showPrimaryAction ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onPrimaryAction}
            className="qa-action qa-action-strong rounded-full border border-white/16 bg-white/8 px-4 py-2 text-xs font-semibold text-white transition hover:border-white/26"
          >
            {primaryActionLabel}
          </button>
        </div>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
