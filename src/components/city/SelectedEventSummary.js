"use client";

import VibeTagChips from "@/components/ui/VibeTagChips";
import { getEntityAddressLabel } from "@/features/city/adminDrawerFeature";
import { formatEventDateLabel, normalizeEventRange } from "@/features/city/eventRailFeature";
import { polishEventDescription } from "@/features/city/liveVibeFeature";

export default function SelectedEventSummary({
  selectedEvent,
  cityLabel = "",
  cityName = "",
}) {
  if (!selectedEvent) return null;

  return (
    <>
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-violet-200/20 bg-violet-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-violet-100">
          {selectedEvent.city || cityLabel}
        </span>
        <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/70">
          Community event
        </span>
        {normalizeEventRange(selectedEvent).startDate && (
          <span className="rounded-full border border-violet-200/24 bg-violet-200/12 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-violet-100">
            {formatEventDateLabel(selectedEvent)}
          </span>
        )}
      </div>
      <h2 className="mb-2 text-2xl font-bold tracking-[-0.02em]">{selectedEvent.name}</h2>
      <VibeTagChips entity={selectedEvent} tone="amber" className="mb-2" includeMixedFallback />
      <p className="mb-2 text-xs uppercase tracking-[0.14em] text-white/60">
        Address: {getEntityAddressLabel(selectedEvent)}
      </p>
      <div className="mb-3 h-1.5 w-24 rounded-full bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-200" />
      {polishEventDescription(selectedEvent, cityName) && (
        <div className="mb-1 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="mb-1 text-xs uppercase tracking-[0.16em] text-white/45">About event</p>
          <p className="text-sm leading-relaxed text-white/68">{polishEventDescription(selectedEvent, cityName)}</p>
        </div>
      )}
    </>
  );
}
