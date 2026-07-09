"use client";

export default function CitySignalSummaryBar({
  cityPlacesCount,
  cityEventCount,
  cityServiceCount,
  activeCitySection,
}) {
  return (
    <div className="mb-6 rounded-[20px] border border-white/18 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),rgba(255,79,163,0.08),rgba(34,211,238,0.08))] p-3 shadow-[0_12px_34px_rgba(91,33,182,0.12)] backdrop-blur">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-cyan-100/32 bg-cyan-300/14 px-3 py-1 text-cyan-50">
          {cityPlacesCount} venues
        </span>
        <span className="rounded-full border border-fuchsia-100/32 bg-fuchsia-300/14 px-3 py-1 text-fuchsia-50">
          {cityEventCount} events
        </span>
        <span className="rounded-full border border-emerald-100/32 bg-emerald-300/14 px-3 py-1 text-emerald-50">
          {cityServiceCount} services
        </span>
        <span className="rounded-full border border-white/22 bg-white/12 px-3 py-1 text-white/82">
          Viewing: {activeCitySection}
        </span>
      </div>
    </div>
  );
}
