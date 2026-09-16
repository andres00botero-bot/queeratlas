"use client";

export default function CityQueerAreas({ cityName, areas = [], onFocusArea }) {
  if (!Array.isArray(areas) || areas.length === 0) return null;

  return (
    <section
      aria-labelledby="city-queer-areas-title"
      className="qa-city-section qa-city-content-section qa-city-tone-guide mb-6 rounded-[28px] border p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fuchsia-100/70">City orientation</p>
          <h2 id="city-queer-areas-title" className="mt-2 text-2xl font-semibold tracking-[-0.01em] text-white">Queer areas in {cityName}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/64">
            Tap an area to zoom in. The map’s colour glow shows the concentration of published Atlas venues, events and community listings—not people, live activity or an official boundary.
          </p>
        </div>
        <span className="rounded-full border border-fuchsia-200/20 bg-fuchsia-200/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/85">
          {cityName} pilot
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {areas.map((area) => (
          <article key={area.id} className="rounded-2xl border border-white/[0.10] bg-black/15 p-4 transition hover:border-fuchsia-200/30 hover:bg-white/[0.045]">
            <button
              type="button"
              onClick={() => onFocusArea?.(area)}
              className="qa-action group w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-100/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#15101a]"
              aria-label={`Zoom to ${area.name} on the map`}
            >
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-fuchsia-100/68">{area.type}</p>
                    <h3 className="mt-1 text-base font-semibold text-white">{area.name}</h3>
                  </div>
                  <span className="rounded-full border border-fuchsia-200/28 bg-fuchsia-200/[0.10] px-3 py-2 text-xs font-semibold text-fuchsia-50 transition group-hover:border-fuchsia-100/55 group-hover:bg-fuchsia-200/[0.17]">
                    Explore on map
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/72">{area.summary}</p>
                <p className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs leading-5 text-white/58">
                  <span className="font-semibold text-white/76">Best for: </span>{area.bestFor}
                </p>
                <p className="mt-2 text-xs leading-5 text-white/52">{area.practicalNote}</p>
              </div>
            </button>
            <a
              href={area.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-xs font-medium text-cyan-100/80 underline decoration-cyan-100/30 underline-offset-4 transition hover:text-cyan-50"
            >
              Source: {area.sourceLabel}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
