export default function CityQualityModal({
  open,
  qualityModal,
  setQualityModal,
  trustActions,
  onClose,
  onSubmit,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[92] overflow-y-auto bg-black/70 px-4 py-4 backdrop-blur-sm sm:py-6">
      <div className="flex min-h-full items-center justify-center">
        <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-cyan-200/22 bg-[linear-gradient(165deg,rgba(7,38,44,0.9),rgba(11,11,11,0.98))] shadow-[0_28px_120px_rgba(0,0,0,0.58)]">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/75">Trust status</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Update quality</h3>
          </div>
          <div className="space-y-4 px-5 py-5">
            <div className="grid gap-2 sm:grid-cols-3">
              {trustActions.map((item) => {
                const active = qualityModal.action === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setQualityModal((current) => ({ ...current, action: item.value }))}
                    className={`rounded-2xl border px-3 py-2 text-sm transition ${
                      active
                        ? "border-cyan-200/42 bg-cyan-200/18 text-cyan-50"
                        : "border-white/12 bg-white/[0.03] text-white/82 hover:border-white/24"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-white/58" htmlFor="city-quality-source">
                Source note (optional)
              </label>
              <input
                id="city-quality-source"
                value={qualityModal.sourceInput}
                onChange={(event) => setQualityModal((current) => ({ ...current, sourceInput: event.target.value }))}
                placeholder="Official URL/name or internal verification note"
                className="mt-2 w-full rounded-2xl border border-white/14 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-200/45"
              />
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
              className="rounded-full border border-cyan-200/34 bg-cyan-200/16 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/55"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
