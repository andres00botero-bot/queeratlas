export default function FavoritesForYouPanel({
  recommendationMode = "balanced",
  setRecommendationMode,
  forYouRecommendations = [],
  onOpenRecommendation,
  onSaveRecommendation,
}) {
  return (
    <section className="mb-6 rounded-[30px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_30%),radial-gradient(circle_at_92%_12%,rgba(244,114,182,0.06),transparent_28%),linear-gradient(180deg,rgba(16,16,18,0.92),rgba(10,10,10,0.99))] p-4 shadow-[0_34px_94px_rgba(0,0,0,0.48)] sm:rounded-[32px] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/70">For you</p>
          <h2 className="qa-title mt-2 bg-gradient-to-r from-cyan-100 via-white to-fuchsia-100 bg-clip-text text-xl font-semibold tracking-[-0.02em] text-transparent sm:text-2xl">
            Next best signal
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/56">
            Personalized picks from your saved vibe, city history, and trusted network.
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/24 p-2">
        <button
          type="button"
          onClick={() => setRecommendationMode?.("safe")}
          className={`qa-action rounded-full border px-3 py-1 text-xs uppercase tracking-[0.12em] transition ${
            recommendationMode === "safe"
              ? "border-white/32 bg-white/12 text-white"
              : "border-white/12 bg-white/6 text-white/65 hover:border-white/24"
          }`}
        >
          Safe mode
        </button>
        <button
          type="button"
          onClick={() => setRecommendationMode?.("balanced")}
          className={`qa-action rounded-full border px-3 py-1 text-xs uppercase tracking-[0.12em] transition ${
            recommendationMode === "balanced"
              ? "border-cyan-200/40 bg-cyan-200/16 text-cyan-100"
              : "border-white/12 bg-white/6 text-white/65 hover:border-white/24"
          }`}
        >
          Balanced
        </button>
        <button
          type="button"
          onClick={() => setRecommendationMode?.("peak")}
          className={`qa-action rounded-full border px-3 py-1 text-xs uppercase tracking-[0.12em] transition ${
            recommendationMode === "peak"
              ? "border-fuchsia-200/40 bg-fuchsia-200/16 text-fuchsia-100"
              : "border-white/12 bg-white/6 text-white/65 hover:border-white/24"
          }`}
        >
          Peak mode
        </button>
      </div>
      <p className="mb-4 text-xs text-white/52">
        Mode changes how the engine weights trust, timing, and venue energy.
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {forYouRecommendations.length > 0 ? (
          forYouRecommendations.map((item) => (
            <article
              key={`for-you-${item.kind}-${item.id}`}
              className="rounded-[24px] border border-white/12 bg-[radial-gradient(circle_at_12%_8%,rgba(56,189,248,0.08),transparent_34%),linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] p-4 shadow-[0_20px_52px_rgba(0,0,0,0.34)]"
            >
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/46">
                {item.city || "City"} - {item.kind}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">{item.name}</h3>
              <p className="mt-1 text-xs text-cyan-100/75">{item.subtitle}</p>
              <p className="mt-3 min-h-[36px] text-xs leading-5 text-white/60">{item.reason}</p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenRecommendation?.(item)}
                  className="qa-action rounded-full border border-white/16 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white/88 transition hover:-translate-y-[1px] hover:border-white/30"
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => onSaveRecommendation?.(item)}
                  className="qa-action qa-action-strong rounded-full border border-cyan-200/26 bg-cyan-200/14 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:-translate-y-[1px] hover:border-cyan-200/44"
                >
                  Save
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-8 text-sm text-white/42 md:col-span-2 xl:col-span-3">
            Save more places and follow members to unlock stronger personal recommendations.
          </div>
        )}
      </div>
    </section>
  );
}
