"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function CityQueerAreas({ cityName, areas = [], onFocusArea, regionalGuideNote = "" }) {
  const { t } = useLocale();
  const [selectedAreaId, setSelectedAreaId] = useState("");
  if (!Array.isArray(areas) || areas.length === 0) return null;

  const selectArea = (area) => {
    setSelectedAreaId(area.id);
    onFocusArea?.(area);
  };

  return (
    <section aria-labelledby="city-queer-areas-title" className="mb-8 border-t border-white/[0.12] pt-5 sm:pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/48">{t("city.mapIndex", "Map index")}</p>
          <h2 id="city-queer-areas-title" className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-[1.75rem]">
            {t("city.queerAreasIn", "Queer areas in {city}").replace("{city}", cityName)}
          </h2>
        </div>
        <p className="max-w-xs text-xs leading-5 text-white/52 sm:text-right">
          {t("city.queerAreasShortDescription", "Choose an area to focus the map.")}
        </p>
      </div>

      {regionalGuideNote ? (
        <p className="mt-4 max-w-3xl border-l-2 border-[#d8b678]/60 pl-3 text-sm leading-6 text-white/66">{regionalGuideNote}</p>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-[18px] border border-cyan-100/[0.12] bg-[#0c1921]/92 shadow-[0_18px_48px_rgba(3,12,18,0.32)]">
        {areas.map((area, index) => {
          const isSelected = selectedAreaId === area.id;
          return (
            <article
              key={area.id}
              className={`relative border-l-[3px] border-b border-white/[0.08] last:border-b-0 ${isSelected ? "bg-white/[0.055]" : "hover:bg-white/[0.03]"}`}
              style={{ borderLeftColor: area.color }}
            >
              <div className="flex items-stretch">
                <button
                  type="button"
                  onClick={() => selectArea(area)}
                  className="qa-action group grid min-w-0 flex-1 grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 px-4 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70 sm:grid-cols-[2.75rem_minmax(0,1fr)_auto] sm:items-center sm:gap-x-4 sm:px-5"
                  aria-label={t("city.zoomToArea", "Zoom to {area} on the map").replace("{area}", area.name)}
                >
                  <span
                    className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-semibold sm:mt-0"
                    style={{ borderColor: area.color, color: area.color, backgroundColor: `${area.color}16` }}
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: area.color }}>{area.type}</span>
                    <span className="mt-1 block text-base font-semibold tracking-[-0.01em] text-white sm:text-lg">{area.name}</span>
                    <span className="mt-1 block text-sm leading-5 text-white/62">{area.bestFor}</span>
                  </span>
                  <span className="col-start-2 mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/48 transition group-hover:text-white/82 sm:col-start-3 sm:mt-0">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: area.color }} aria-hidden="true" />
                    {t("city.exploreOnMap", "Explore on map")}
                    <span className="text-base leading-none" aria-hidden="true">↗</span>
                  </span>
                </button>
                <a
                  href={area.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="qa-action flex w-11 shrink-0 items-center justify-center border-l border-white/[0.08] text-white/38 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
                  aria-label={`${t("city.source", "Source:")} ${area.sourceLabel}`}
                  title={`${t("city.source", "Source:")} ${area.sourceLabel}`}
                >
                  <span className="text-base" aria-hidden="true">i</span>
                </a>
              </div>
              {isSelected ? (
                <p className="animate-rise-in border-t border-white/[0.08] px-4 py-3 text-sm leading-6 text-white/72 sm:px-5">
                  {area.summary} <span className="text-white/48">{area.practicalNote}</span>
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
