export default function EventReportModal({
  open,
  draft,
  setDraft,
  reasons,
  onClose,
  onSubmit,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[91] overflow-y-auto bg-black/70 px-4 py-4 backdrop-blur-sm sm:py-6">
      <div className="flex min-h-full items-center justify-center">
        <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-rose-200/22 bg-[linear-gradient(165deg,rgba(64,18,38,0.88),rgba(11,11,11,0.98))] shadow-[0_28px_120px_rgba(0,0,0,0.58)]">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-rose-100/75">Safety report</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Report event</h3>
            <p className="mt-1 line-clamp-1 text-sm text-white/70">{draft.title}</p>
          </div>

          <div className="max-h-[65vh] space-y-4 overflow-y-auto px-5 py-5 sm:max-h-[70vh]">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/58">Reason</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {reasons.map((item) => {
                  const active = draft.reasonKey === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setDraft((current) => ({ ...current, reasonKey: item.value }))}
                      className={`rounded-2xl border px-3 py-2 text-left transition ${
                        active
                          ? "border-rose-200/42 bg-rose-200/16 text-rose-50 shadow-[0_8px_28px_rgba(244,63,94,0.18)]"
                          : "border-white/12 bg-white/[0.03] text-white/82 hover:border-white/24"
                      }`}
                    >
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="mt-1 text-xs text-white/60">{item.helper}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-white/58" htmlFor="event-report-details">
                What is wrong?
              </label>
              <textarea
                id="event-report-details"
                value={draft.details}
                onChange={(event) => setDraft((current) => ({ ...current, details: event.target.value }))}
                placeholder="Example: wrong date, broken link, inaccurate location, or safety concern around venue access..."
                className="mt-2 min-h-[116px] w-full rounded-2xl border border-white/14 bg-black/40 px-3 py-3 text-sm leading-6 text-white outline-none focus:border-rose-200/45"
              />
              <p className="mt-2 text-xs text-white/52">This note goes directly to admin moderation inbox.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/16 bg-white/7 px-4 py-2 text-sm text-white/78 transition hover:border-white/30"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="rounded-full border border-rose-200/34 bg-rose-200/16 px-4 py-2 text-sm font-semibold text-rose-50 transition hover:border-rose-200/55"
            >
              Send report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
