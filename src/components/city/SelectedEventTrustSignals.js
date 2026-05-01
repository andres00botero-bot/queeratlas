"use client";

import { qualityPillClass } from "@/features/city/adminDrawerFeature";

export default function SelectedEventTrustSignals({
  selectedEvent,
  selectedEventQuality,
  selectedEventQualityStatus,
  refreshEntityQuality,
  trustedEventSavesCount,
}) {
  return (
    <>
      {selectedEventQuality && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={(clickEvent) =>
              refreshEntityQuality(
                {
                  targetType: "event",
                  targetId: selectedEvent.id,
                  fallbackSource: selectedEventQuality.source || selectedEvent.link || "",
                },
                clickEvent
              )
            }
            className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] transition hover:opacity-90 ${qualityPillClass(selectedEventQualityStatus?.tone || "community")}`}
          >
            {selectedEventQualityStatus?.label || "Community"}
          </button>
        </div>
      )}
      {trustedEventSavesCount > 0 && (
        <div className="mt-2 inline-flex items-center rounded-full border border-emerald-200/24 bg-emerald-200/[0.10] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-emerald-100">
          Saved by {trustedEventSavesCount} trusted member{trustedEventSavesCount > 1 ? "s" : ""}
        </div>
      )}
    </>
  );
}
