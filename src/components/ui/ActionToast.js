"use client";

const TONE_STYLES = {
  ok: {
    shell: "border-emerald-200/32 bg-[linear-gradient(180deg,rgba(16,185,129,0.2),rgba(6,20,16,0.92))] text-emerald-100",
    chip: "border-emerald-200/30 bg-emerald-200/14 text-emerald-50",
    label: "Saved",
  },
  warn: {
    shell: "border-amber-200/32 bg-[linear-gradient(180deg,rgba(251,191,36,0.2),rgba(24,18,8,0.92))] text-amber-100",
    chip: "border-amber-200/30 bg-amber-200/14 text-amber-50",
    label: "Needs action",
  },
  info: {
    shell: "border-cyan-200/32 bg-[linear-gradient(180deg,rgba(34,211,238,0.2),rgba(7,18,24,0.92))] text-cyan-100",
    chip: "border-cyan-200/30 bg-cyan-200/14 text-cyan-50",
    label: "Update",
  },
};

export default function ActionToast({ toast, position = "top-right" }) {
  if (!toast?.message) return null;
  const tone = TONE_STYLES[toast.tone] || TONE_STYLES.info;

  const positionClass =
    position === "top-center"
      ? "left-1/2 top-6 -translate-x-1/2"
      : "bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:top-6 sm:translate-x-0";

  return (
    <div className={`pointer-events-none fixed z-[70] ${positionClass}`}>
      <div
        role="status"
        aria-live="polite"
        className={`max-w-[92vw] animate-[fadeIn_.22s_ease] rounded-3xl border px-4 py-3 text-xs shadow-[0_30px_70px_rgba(0,0,0,0.48)] backdrop-blur ${tone.shell}`}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${tone.chip}`}>
            {tone.label}
          </span>
          <span className="text-[10px] uppercase tracking-[0.14em] text-white/55">Queer Atlas</span>
        </div>
        <p className="text-xs leading-relaxed">{toast.message}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/25">
          <div className="h-full w-full origin-left animate-[toastBar_2.2s_linear_forwards] bg-white/45" />
        </div>
      </div>
    </div>
  );
}
