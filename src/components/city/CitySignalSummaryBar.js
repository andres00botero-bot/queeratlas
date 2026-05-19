"use client";

export default function CitySignalSummaryBar({
  cityPlacesCount,
  cityEventCount,
  cityServiceCount,
  activeCitySection,
}) {
  return (
    <div className="mb-6 rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3 shadow-[0_12px_34px_rgba(0,0,0,0.22)]">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1 text-cyan-100">
          {cityPlacesCount} venues
        </span>
        <span className="rounded-full border border-fuchsia-200/24 bg-fuchsia-200/10 px-3 py-1 text-fuchsia-100">
          {cityEventCount} events
        </span>
        <span className="rounded-full border border-emerald-200/24 bg-emerald-200/10 px-3 py-1 text-emerald-100">
          {cityServiceCount} services
        </span>
        <span className="rounded-full border border-white/16 bg-white/8 px-3 py-1 text-white/80">
          Active section: {activeCitySection}
        </span>
      </div>
    </div>
  );
}
