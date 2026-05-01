"use client";

import VibeTagChips from "@/components/ui/VibeTagChips";
import { getEntityAddressLabel, normalizeExternalUrl } from "@/features/city/adminDrawerFeature";
import { polishVenueDescription } from "@/features/city/liveVibeFeature";
import { getDisplayedSafetyShields, shouldShowLegacyVibe } from "@/features/city/placeSafetyUi";
import { getSafetyToneClass } from "@/lib/placeSafetySignals";

export default function SelectedPlaceSummary({
  selectedPlace,
  cityName,
  typeLabels,
  selectedPlaceSafetySignal,
}) {
  if (!selectedPlace) return null;

  return (
    <>
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-cyan-100">
          {selectedPlace.city || cityName}
        </span>
        <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/70">
          {typeLabels[selectedPlace.type] || "Place"}
        </span>
      </div>
      <h2 className="mb-2 text-2xl font-bold tracking-[-0.02em]">{selectedPlace.name}</h2>
      <VibeTagChips
        entity={selectedPlace}
        tone="cyan"
        className="mb-2"
        includeTypeFallback
        includeMixedFallback
      />
      {shouldShowLegacyVibe(selectedPlace) && (
        <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-cyan-100/72">
          Legacy vibe: {String(selectedPlace.vibe || "").trim()}
        </p>
      )}
      <p className="mb-2 text-xs uppercase tracking-[0.14em] text-white/60">
        Address: {getEntityAddressLabel(selectedPlace)}
      </p>
      <div className="mb-3 h-1.5 w-24 rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-fuchsia-300" />
      {polishVenueDescription(selectedPlace, cityName, typeLabels) && (
        <div className="mb-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-sm leading-relaxed text-white/68">{polishVenueDescription(selectedPlace, cityName, typeLabels)}</p>
        </div>
      )}
      <div className="mb-2 rounded-xl border border-cyan-200/14 bg-cyan-200/[0.07] p-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/75">Opening Hours</p>
        <p className="mt-1 text-xs leading-6 text-cyan-50/90">
          {String(selectedPlace.hours || "").trim() || "Hours vary by night. Check official channels before going."}
        </p>
      </div>
      {selectedPlace.link && (
        <a
          href={normalizeExternalUrl(selectedPlace.link)}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 inline-flex items-center rounded-full border border-cyan-200/18 bg-cyan-200/[0.08] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/34"
        >
          Official Link
        </a>
      )}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Rating</p>
          <p className="mt-1 text-sm text-white/84">{selectedPlace.avgRating?.toFixed(1) || "-"}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Reviews</p>
          <p className="mt-1 text-sm text-white/84">{selectedPlace.reviewCount || 0}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Safety reviews</p>
          {selectedPlaceSafetySignal && Number(selectedPlaceSafetySignal.safetyReviewCount || 0) > 0 ? (
            <p className={`mt-1 inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-sm ${getSafetyToneClass(selectedPlaceSafetySignal.tone)}`}>
              {getDisplayedSafetyShields(selectedPlaceSafetySignal)}/5
            </p>
          ) : (
            <p className="mt-1 text-sm text-white/84">-</p>
          )}
        </div>
      </div>
      {selectedPlaceSafetySignal && Number(selectedPlaceSafetySignal.safetyReviewCount || 0) > 0 && (
        <p className="mt-2 text-[11px] text-white/60">
          Based on {selectedPlaceSafetySignal.safetyReviewCount} member safety review{selectedPlaceSafetySignal.safetyReviewCount === 1 ? "" : "s"}.
        </p>
      )}
    </>
  );
}
