"use client";

import { ExternalLink, MapPin } from "lucide-react";
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
  const addressLabel = getEntityAddressLabel(selectedPlace);

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-cyan-100/28 bg-cyan-300/14 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-cyan-50">
          {selectedPlace.city || cityName}
        </span>
        <span className="rounded-full border border-fuchsia-100/24 bg-fuchsia-300/12 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-fuchsia-50">
          {typeLabels[selectedPlace.type] || "Place"}
        </span>
      </div>
      <h2 className="mb-3 text-3xl font-bold leading-tight tracking-[-0.025em] text-white">{selectedPlace.name}</h2>
      <VibeTagChips
        entity={selectedPlace}
        tone="cyan"
        className="mb-3"
        includeTypeFallback
        includeMixedFallback
      />
      {shouldShowLegacyVibe(selectedPlace) && (
        <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-cyan-100/72">
          Legacy vibe: {String(selectedPlace.vibe || "").trim()}
        </p>
      )}
      <div className="mb-4 h-1.5 w-28 rounded-full bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-amber-200 shadow-[0_0_22px_rgba(34,211,238,0.22)]" />
      <div className="mb-4 flex items-start gap-3 rounded-[20px] border border-cyan-100/26 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(255,255,255,0.06))] p-4 shadow-[0_14px_34px_rgba(34,211,238,0.08)]">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-100/28 bg-cyan-300/14 text-cyan-50">
          <MapPin className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-50/68">Address</p>
          <p className="mt-1 text-sm leading-6 text-white/90">{addressLabel}</p>
        </div>
      </div>
      {polishVenueDescription(selectedPlace, cityName, typeLabels) && (
        <div className="mb-4 rounded-[20px] border border-white/14 bg-white/[0.065] p-4">
          <p className="text-[15px] leading-7 text-white/78">{polishVenueDescription(selectedPlace, cityName, typeLabels)}</p>
        </div>
      )}
      <div className="mb-4 rounded-[20px] border border-amber-100/22 bg-amber-300/[0.08] p-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-amber-50/72">Opening Hours</p>
        <p className="mt-1 text-sm leading-6 text-white/86">
          {String(selectedPlace.hours || "").trim() || "Hours vary by night. Check official channels before going."}
        </p>
      </div>
      {selectedPlace.link && (
        <a
          href={normalizeExternalUrl(selectedPlace.link)}
          target="_blank"
          rel="noopener noreferrer"
          className="qa-action qa-action-strong mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-100/42 bg-[linear-gradient(135deg,rgba(34,211,238,0.24),rgba(244,114,182,0.16),rgba(255,255,255,0.09))] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_12px_30px_rgba(34,211,238,0.14)] transition hover:border-cyan-100/64"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          Official Link
        </a>
      )}
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-white/14 bg-white/[0.065] px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/48">Rating</p>
          <p className="mt-1 text-base font-semibold text-white">{selectedPlace.avgRating?.toFixed(1) || "-"}</p>
        </div>
        <div className="rounded-2xl border border-white/14 bg-white/[0.065] px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/48">Reviews</p>
          <p className="mt-1 text-base font-semibold text-white">{selectedPlace.reviewCount || 0}</p>
        </div>
        <div className="rounded-2xl border border-white/14 bg-white/[0.065] px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/48">Safety</p>
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
