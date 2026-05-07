"use client";

import { qualityPillClass } from "@/features/city/adminDrawerFeature";

export default function SelectedPlaceTrustSignals({
  selectedPlace,
  selectedPlaceQuality,
  selectedPlaceQualityStatus,
  refreshEntityQuality,
  canRefreshQuality,
  formatDate,
  trustedPlaceSavesCount,
}) {
  return (
    <>
      {selectedPlaceQuality && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {canRefreshQuality ? (
            <button
              onClick={(clickEvent) =>
                refreshEntityQuality(
                  { targetType: "place", targetId: selectedPlace.id, fallbackSource: selectedPlaceQuality.source || "" },
                  clickEvent
                )
              }
              className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] transition hover:opacity-90 ${qualityPillClass(selectedPlaceQualityStatus?.tone || "community")}`}
            >
              {selectedPlaceQualityStatus?.label || "Community"}
            </button>
          ) : (
            <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] ${qualityPillClass(selectedPlaceQualityStatus?.tone || "community")}`}>
              {selectedPlaceQualityStatus?.label || "Community"}
            </span>
          )}
          {selectedPlaceQuality.lastChecked && (
            <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/70">
              Checked {formatDate(selectedPlaceQuality.lastChecked)}
            </span>
          )}
          {selectedPlaceQuality.source && (
            <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/70">
              Source added
            </span>
          )}
        </div>
      )}
      {trustedPlaceSavesCount > 0 && (
        <div className="mt-2 inline-flex items-center rounded-full border border-emerald-200/24 bg-emerald-200/[0.10] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-emerald-100">
          Saved by {trustedPlaceSavesCount} trusted member{trustedPlaceSavesCount > 1 ? "s" : ""}
        </div>
      )}
    </>
  );
}
