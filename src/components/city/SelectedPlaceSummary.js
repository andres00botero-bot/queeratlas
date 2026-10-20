"use client";

import { MapPin } from "lucide-react";
import VibeTagChips from "@/components/ui/VibeTagChips";
import { getEntityAddressLabel, normalizeExternalUrl } from "@/features/city/adminDrawerFeature";
import { polishVenueDescription } from "@/features/city/liveVibeFeature";
import { getDisplayedSafetyShields, shouldShowLegacyVibe } from "@/features/city/placeSafetyUi";
import { getSafetyToneClass } from "@/lib/placeSafetySignals";
import VenuePracticalIntel from "@/components/city/VenuePracticalIntel";
import OfficialExternalLink from "@/components/ui/OfficialExternalLink";
import SelectedEntityMiniMap from "@/components/city/SelectedEntityMiniMap";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function SelectedPlaceSummary({
  selectedPlace,
  cityName,
  typeLabels,
  selectedPlaceSafetySignal,
  showPlaceOnMap,
  onOpenReviews,
  liveSignal = null,
}) {
  const { t } = useLocale();
  if (!selectedPlace) return null;
  const addressLabel = getEntityAddressLabel(selectedPlace);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#bdb3c2]">
        <span>{selectedPlace.city || cityName}</span>
        <span className="text-[#d7c0ff]/66">·</span>
        <span className="text-[#d7c0ff]">{typeLabels[selectedPlace.type] || t("city.place", "Place")}</span>
        <button type="button" onClick={onOpenReviews} className="ml-auto normal-case tracking-normal text-[#d7c0ff] hover:text-[#e4d6ff]">
          {selectedPlace.avgRating ? `${Number(selectedPlace.avgRating).toFixed(1)} · ` : ""}{selectedPlace.reviewCount || 0} {t("city.reviews", "reviews")}
        </button>
      </div>
      <VibeTagChips entity={selectedPlace} tone="cyan" className="mb-4" includeTypeFallback includeMixedFallback />
      {shouldShowLegacyVibe(selectedPlace) && (
        <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-cyan-100/72">
          {t("city.legacyVibe", "Legacy vibe:")} {String(selectedPlace.vibe || "").trim()}
        </p>
      )}
      <div className="border-y border-white/[0.08] py-4">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#d7c0ff]" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d7c0ff]/72">{t("city.address", "Address")}</p>
            <p className="mt-1 text-sm leading-6 text-white/86">{addressLabel}</p>
          </div>
        </div>
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#d7c0ff]/72">{t("city.openingHoursLabel", "Opening Hours")}</p>
          <p className="mt-1 text-sm leading-6 text-white/78">
            {String(selectedPlace.hours || "").trim() || t("city.hoursVary", "Hours vary by night. Check official channels before going.")}
          </p>
        </div>
      </div>
      {polishVenueDescription(selectedPlace, cityName, typeLabels) && (
        <p className="my-5 text-[15px] leading-7 text-white/76">{polishVenueDescription(selectedPlace, cityName, typeLabels)}</p>
      )}
      <SelectedEntityMiniMap entity={selectedPlace} kind="venue" onExpand={showPlaceOnMap} />
      <VenuePracticalIntel place={selectedPlace} compact />
      {liveSignal}
      {selectedPlace.link && (
        <OfficialExternalLink
          href={normalizeExternalUrl(selectedPlace.link)}
          kind="venue"
          className="mb-5 mt-8"
        />
      )}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.08] pt-4">
        <button type="button" onClick={onOpenReviews} className="text-sm font-semibold text-[#d7c0ff] transition hover:text-[#e4d6ff]">
          {t("city.reviews", "Reviews")} · {selectedPlace.reviewCount || 0}
        </button>
        <div className="flex items-center gap-2 text-sm text-white/68">
          <span className="text-[10px] uppercase tracking-[0.16em] text-white/44">{t("city.safety", "Safety")}</span>
          {selectedPlaceSafetySignal && Number(selectedPlaceSafetySignal.safetyReviewCount || 0) > 0 ? (
            <p className={`mt-1 inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-sm ${getSafetyToneClass(selectedPlaceSafetySignal.tone)}`}>
              {getDisplayedSafetyShields(selectedPlaceSafetySignal)}/5
            </p>
          ) : (
            <span className="text-white/70">-</span>
          )}
        </div>
      </div>
      {selectedPlaceSafetySignal && Number(selectedPlaceSafetySignal.safetyReviewCount || 0) > 0 && (
        <p className="mt-2 text-[11px] text-white/60">
          {t("city.safetyReviewsBasedOn", "Based on {count} member safety review{suffix}.")
            .replace("{count}", selectedPlaceSafetySignal.safetyReviewCount)
            .replace("{suffix}", selectedPlaceSafetySignal.safetyReviewCount === 1 ? "" : "s")}
        </p>
      )}
    </>
  );
}
