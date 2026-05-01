"use client";

export default function CityQuickNavigation({
  onGoEvents,
  onGoGuide,
  onGoServices,
  onGoVenues,
}) {
  return (
    <div
      className="animate-cinematic-in mb-8 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_14px_44px_rgba(0,0,0,0.22)]"
      style={{ animationDelay: "170ms" }}
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Quick Navigation</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={onGoEvents}
          className="qa-cinematic-hover rounded-2xl border border-cyan-200/16 bg-cyan-200/[0.06] px-4 py-3 text-left text-sm text-cyan-100 hover:border-cyan-200/32"
        >
          <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-100/75">Jump To</p>
          <p className="mt-1 font-semibold">Events</p>
        </button>
        <button
          type="button"
          onClick={onGoGuide}
          className="qa-cinematic-hover rounded-2xl border border-cyan-200/16 bg-cyan-200/[0.06] px-4 py-3 text-left text-sm text-cyan-100 hover:border-cyan-200/32"
        >
          <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-100/75">Jump To</p>
          <p className="mt-1 font-semibold">Quick Guide</p>
        </button>
        <button
          type="button"
          onClick={onGoServices}
          className="qa-cinematic-hover rounded-2xl border border-cyan-200/16 bg-cyan-200/[0.06] px-4 py-3 text-left text-sm text-cyan-100 hover:border-cyan-200/32"
        >
          <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-100/75">Jump To</p>
          <p className="mt-1 font-semibold">Services</p>
        </button>
        <button
          type="button"
          onClick={onGoVenues}
          className="qa-cinematic-hover rounded-2xl border border-cyan-200/16 bg-cyan-200/[0.06] px-4 py-3 text-left text-sm text-cyan-100 hover:border-cyan-200/32"
        >
          <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-100/75">Jump To</p>
          <p className="mt-1 font-semibold">Venues</p>
        </button>
      </div>
    </div>
  );
}
