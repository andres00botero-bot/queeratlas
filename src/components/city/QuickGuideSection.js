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
      className="animate-cinematic-in mb-10 rounded-[32px] border border-amber-200/10 bg-[linear-gradient(180deg,rgba(30,26,18,0.82),rgba(12,12,12,0.98))] p-6 shadow-[0_18px_52px_rgba(251,191,36,0.05)]"
      style={{ animationDelay: "250ms" }}
    >
      <h2 className="sticky top-0 z-20 -mx-2 mb-4 border-b border-amber-200/10 bg-[#050505]/92 px-2 py-3 text-xl tracking-[0.02em] text-amber-100 backdrop-blur">
        Quick Guide
      </h2>
      {placesLoading && (
        <div className="mb-4 rounded-2xl border border-amber-200/10 bg-amber-200/[0.03] p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-amber-100/60">Loading guide signal</p>
          <SectionSkeleton tone="amber" rows={2} />
        </div>
      )}
      {placesLoadError && (
        <div className="mb-4 rounded-2xl border border-rose-300/20 bg-rose-300/8 px-4 py-3 text-sm text-rose-100">
          <p>{placesLoadError}</p>
          <button
            onClick={reloadPlaces}
            className="mt-3 rounded-full border border-rose-200/25 bg-rose-200/10 px-4 py-2 text-xs text-rose-100 transition hover:border-rose-200/40"
          >
            Retry
          </button>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {config.guide.map((item, index) => {
          const guideTone =
            index % 4 === 0
              ? {
                  card: "border-amber-200/20 bg-[linear-gradient(135deg,rgba(180,83,9,0.20),rgba(251,191,36,0.08),rgba(12,12,12,0.98))] hover:border-amber-200/34",
                  strip: "from-amber-300/90 via-orange-300/60 to-transparent",
                  type: "text-amber-100 border-amber-200/30 bg-amber-200/12",
                  vibe: "Night pulse",
                }
              : index % 4 === 1
                ? {
                    card: "border-cyan-200/18 bg-[linear-gradient(180deg,rgba(14,48,64,0.36),rgba(12,12,12,0.98))] hover:border-cyan-200/30",
                    strip: "from-cyan-300/90 via-sky-300/60 to-transparent",
                    type: "text-cyan-100 border-cyan-200/30 bg-cyan-200/12",
                    vibe: "Local rhythm",
                  }
                : index % 4 === 2
                  ? {
                      card: "border-violet-200/18 bg-[linear-gradient(180deg,rgba(47,28,78,0.34),rgba(12,12,12,0.98))] hover:border-violet-200/30",
                      strip: "from-violet-300/90 via-fuchsia-300/60 to-transparent",
                      type: "text-violet-100 border-violet-200/30 bg-violet-200/12",
                      vibe: "After-dark flow",
                    }
                  : {
                      card: "border-emerald-200/18 bg-[linear-gradient(180deg,rgba(16,70,52,0.34),rgba(12,12,12,0.98))] hover:border-emerald-200/30",
                      strip: "from-emerald-300/90 via-teal-300/60 to-transparent",
                      type: "text-emerald-100 border-emerald-200/30 bg-emerald-200/12",
                      vibe: "Soft start",
                    };
          return (
            <div
              key={`${item.title}-${index}`}
              className={`qa-cinematic-hover rounded-[24px] border p-5 ${guideTone.card} ${index === 0 ? "md:col-span-2" : ""}`}
            >
              <div className={`mb-4 h-1.5 w-28 rounded-full bg-gradient-to-r ${guideTone.strip}`} />
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className={`${index === 0 ? "text-xl md:text-2xl" : "text-lg"} font-semibold leading-tight tracking-[-0.01em] text-white`}>
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
                <p className={`${index === 0 ? "text-sm leading-7" : "text-sm leading-6"} text-white/68`}>
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
