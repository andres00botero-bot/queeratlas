"use client";

const TONE_STYLES = {
  ok: "border-emerald-200/30 bg-emerald-200/12 text-emerald-100",
  warn: "border-amber-200/30 bg-amber-200/12 text-amber-100",
  info: "border-cyan-200/30 bg-cyan-200/12 text-cyan-100",
};

export default function ActionToast({ toast, position = "top-right" }) {
  if (!toast?.message) return null;

  const positionClass =
    position === "top-center"
      ? "left-1/2 top-6 -translate-x-1/2"
      : "right-6 top-6";

  return (
    <div className={`pointer-events-none fixed z-40 ${positionClass}`}>
      <div
        role="status"
        aria-live="polite"
        className={`rounded-xl border px-4 py-3 text-xs shadow-[0_20px_50px_rgba(0,0,0,0.35)] ${
          TONE_STYLES[toast.tone] || TONE_STYLES.info
        }`}
      >
        {toast.message}
      </div>
    </div>
  );
}
