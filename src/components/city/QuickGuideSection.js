"use client";

import SectionSkeleton from "@/components/city/SectionSkeleton";
import { polishGuideText } from "@/features/city/liveVibeFeature";

export default function QuickGuideSection({
  sectionRef,
  cityName,
  config,
  placesLoading,
  placesLoadError,
  reloadPlaces,
}) {
  return (
    <div
      ref={sectionRef}
      className="qa-city-section animate-cinematic-in relative mb-10 overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,1))] p-6 text-justify shadow-[0_24px_82px_rgba(0,0,0,0.34)]"
      style={{ animationDelay: "250ms" }}
    >
      <div className="pointer-events-none absolute -left-16 top-8 h-52 w-52 rounded-full bg-cyan-300/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-52 w-52 rounded-full bg-fuchsia-300/8 blur-3xl" />
      <div className="mb-7">
        <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-white/50">Guide Lane</p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-[-0.015em] text-white">Quick Guide</h2>
          <span className="inline-flex items-center rounded-full border border-amber-200/24 bg-amber-200/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-amber-100/90">
            {Array.isArray(config?.guide) ? config.guide.length : 0} tips
          </span>
        </div>
        <div className="mt-3 h-px w-full bg-gradient-to-r from-amber-200/35 via-white/10 to-transparent" />
      </div>
      {placesLoading && (
        <div className="mb-4 rounded-2xl border border-amber-200/10 bg-amber-200/[0.03] p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-amber-100/60">Curated city guide</p>
          <SectionSkeleton tone="amber" rows={2} />
        </div>
      )}
      {placesLoadError && (
        <div className="mb-4 rounded-2xl border border-rose-300/20 bg-rose-300/8 px-4 py-3 text-sm text-rose-100">
          <p>{placesLoadError}</p>
          <button
            onClick={reloadPlaces}
            className="qa-action qa-city-cta-tertiary mt-3 rounded-full border border-rose-200/25 bg-rose-200/10 px-4 py-2 text-xs text-rose-100 transition hover:border-rose-200/40"
          >
            Retry
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4">
        {config.guide.map((item, index) => {
          const guideTone =
            index % 4 === 0
              ? {
                  card: "border-cyan-200/18 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,1))] hover:border-cyan-200/30 shadow-[0_24px_80px_rgba(56,189,248,0.14)]",
                  strip: "from-amber-300/90 via-orange-300/60 to-transparent",
                  type: "text-cyan-100 border-cyan-200/30 bg-cyan-200/12",
                  vibe: "Night pulse",
                }
              : index % 4 === 1
                ? {
                    card: "border-fuchsia-200/18 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,1))] hover:border-fuchsia-200/30 shadow-[0_24px_80px_rgba(217,70,239,0.12)]",
                    strip: "from-cyan-300/90 via-sky-300/60 to-transparent",
                    type: "text-fuchsia-100 border-fuchsia-200/30 bg-fuchsia-200/12",
                    vibe: "Local rhythm",
                  }
                : index % 4 === 2
                  ? {
                      card: "border-emerald-200/18 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,1))] hover:border-emerald-200/30 shadow-[0_24px_80px_rgba(45,212,191,0.12)]",
                      strip: "from-violet-300/90 via-fuchsia-300/60 to-transparent",
                      type: "text-emerald-100 border-emerald-200/30 bg-emerald-200/12",
                      vibe: "After-dark flow",
                    }
                  : {
                      card: "border-amber-200/18 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,1))] hover:border-amber-200/30 shadow-[0_24px_80px_rgba(251,191,36,0.12)]",
                      strip: "from-emerald-300/90 via-teal-300/60 to-transparent",
                      type: "text-amber-100 border-amber-200/30 bg-amber-200/12",
                      vibe: "Soft start",
                    };
          return (
            <div
              key={`${item.title}-${index}`}
              className={`qa-cinematic-hover qa-city-card rounded-[24px] border p-5 ${guideTone.card}`}
            >
              <div className={`mb-4 h-1.5 w-28 rounded-full bg-gradient-to-r ${guideTone.strip}`} />
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold leading-tight tracking-[-0.01em] text-white">
                    {item.title}
                  </h3>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${guideTone.type}`}>
                      Guide
                    </span>
                    <span className="rounded-full border border-white/12 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/72">
                      {guideTone.vibe}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/24 p-4">
                <p className="qa-copy-justify text-sm leading-7 text-white/78">
                  {polishGuideText(item.text, {
                    sectionTitle: item.title,
                    cityName,
                    vibe: config.vibe,
                  })}
                </p>
              </div>

              {item.extra && (
                <p className="mt-4 text-xs uppercase tracking-[0.14em] text-white/42">{item.extra}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
