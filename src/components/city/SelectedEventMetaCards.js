"use client";

export default function SelectedEventMetaCards({
  selectedEvent,
  selectedEventQuality,
  formatDate,
}) {
  if (!(selectedEventQuality?.lastChecked || selectedEventQuality?.source)) {
    return null;
  }

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {selectedEventQuality?.lastChecked && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Last checked</p>
          <p className="mt-1 text-xs text-white/78">{formatDate(selectedEventQuality.lastChecked)}</p>
        </div>
      )}
      {selectedEventQuality?.source && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 sm:col-span-2">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Source note</p>
          <p className="mt-1 text-xs text-white/78 line-clamp-2">{selectedEventQuality.source}</p>
        </div>
      )}
    </div>
  );
}
