export default function FavoritesSignalDashboard({
  weeklyDigest,
  showSignalDeck = false,
  onToggleSignalDeck,
}) {
  return (
    <section className="qa-premium-card mt-6 rounded-[30px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_80%_15%,rgba(244,114,182,0.09),transparent_28%),linear-gradient(180deg,rgba(10,26,36,0.95),rgba(10,10,10,0.99))] p-4 shadow-[0_36px_108px_rgba(0,0,0,0.46)] sm:rounded-[32px] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/75">Atlas insights</p>
          <h2 className="qa-h2 mt-2 bg-gradient-to-r from-cyan-100 via-white to-fuchsia-100 bg-clip-text text-xl font-semibold tracking-[-0.02em] text-transparent sm:text-2xl">
            Signal dashboard
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/56">
            Keep the page clean: core tools stay open, deeper community signal stays one tap away.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100/85">
            Week {weeklyDigest.weekLabel}
          </span>
          <button
            type="button"
            onClick={onToggleSignalDeck}
            className="qa-action qa-action-strong rounded-full border border-fuchsia-200/24 bg-fuchsia-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-fuchsia-100 transition hover:border-fuchsia-200/40"
          >
            {showSignalDeck ? "Hide deep signal" : "Open deep signal"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="qa-premium-card rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-3 shadow-[0_16px_36px_rgba(0,0,0,0.28)]">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Network saves (7d)</p>
          <p className="mt-1 text-2xl font-semibold text-white">{weeklyDigest.followingThisWeekCount}</p>
        </div>
        <div className="qa-premium-card rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-3 shadow-[0_16px_36px_rgba(0,0,0,0.28)]">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Upcoming in your cities</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {weeklyDigest.upcomingInSavedCities.length}
          </p>
        </div>
        <div className="qa-premium-card rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-3 shadow-[0_16px_36px_rgba(0,0,0,0.28)]">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Cities to reach baseline</p>
          <p className="mt-1 text-2xl font-semibold text-white">{weeklyDigest.newCityTarget}</p>
        </div>
      </div>
    </section>
  );
}
