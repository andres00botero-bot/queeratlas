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
      className="qa-city-section qa-city-copy-left animate-cinematic-in relative mb-10 overflow-hidden rounded-[30px] border border-white/16 bg-[linear-gradient(145deg,rgba(255,79,163,0.12),rgba(251,191,36,0.08),rgba(14,15,22,0.96))] p-5 shadow-[0_24px_72px_rgba(91,33,182,0.18)] sm:p-6"
      style={{ animationDelay: "250ms" }}
    >
      <div className="mb-8">
        <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-amber-100/78">City guide</p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.01em] text-white">Essential guide</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-white/58">
              The fast read before you choose where to stay, go out, and move around.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-amber-200/20 bg-amber-200/[0.08] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-amber-100/86">
            {Array.isArray(config?.guide) ? config.guide.length : 0} tips
          </span>
        </div>
        <div className="mt-4 h-px w-full bg-[linear-gradient(90deg,#ffd166,#ff5fb7,#4de1ff,transparent)] opacity-70" />
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
                  card: "border-cyan-100/28 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(255,255,255,0.06))] hover:border-cyan-100/48 shadow-[0_18px_44px_rgba(34,211,238,0.10)]",
                  index: "text-cyan-50 border-cyan-100/34 bg-cyan-300/16",
                  label: "Overview",
                }
              : index % 4 === 1
                ? {
                    card: "border-fuchsia-100/28 bg-[linear-gradient(135deg,rgba(244,114,182,0.14),rgba(255,255,255,0.06))] hover:border-fuchsia-100/48 shadow-[0_18px_44px_rgba(217,70,239,0.10)]",
                    index: "text-fuchsia-50 border-fuchsia-100/34 bg-fuchsia-300/16",
                    label: "Area logic",
                  }
                : index % 4 === 2
                  ? {
                      card: "border-emerald-100/28 bg-[linear-gradient(135deg,rgba(52,211,153,0.13),rgba(255,255,255,0.06))] hover:border-emerald-100/48 shadow-[0_18px_44px_rgba(16,185,129,0.10)]",
                      index: "text-emerald-50 border-emerald-100/34 bg-emerald-300/16",
                      label: "Safety read",
                    }
                  : {
                      card: "border-amber-100/28 bg-[linear-gradient(135deg,rgba(251,191,36,0.14),rgba(255,255,255,0.06))] hover:border-amber-100/48 shadow-[0_18px_44px_rgba(251,191,36,0.10)]",
                      index: "text-amber-50 border-amber-100/34 bg-amber-300/16",
                      label: "Trip planning",
                    };
          return (
            <div
              key={`${item.title}-${index}`}
              className={`qa-cinematic-hover qa-city-card rounded-[22px] border p-5 transition sm:p-6 ${guideTone.card}`}
            >
              <div className="grid gap-5 md:grid-cols-[11rem_1fr] md:gap-7">
                <div className="min-w-0">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${guideTone.index}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-5 text-[10px] uppercase tracking-[0.16em] text-white/46">
                    {guideTone.label}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold leading-tight tracking-[-0.01em] text-white">
                    {item.title}
                  </h3>
                </div>

                <div>
                  <p className="qa-city-guide-copy text-[15px] leading-8 text-white/82 sm:text-base sm:leading-8">
                    {polishGuideText(item.text, {
                      sectionTitle: item.title,
                      cityName,
                      vibe: config.vibe,
                    })}
                  </p>

                  {item.extra && (
                    <p className="mt-4 text-xs uppercase tracking-[0.14em] text-white/42">{item.extra}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
