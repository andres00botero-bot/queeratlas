"use client";

import { Shield } from "lucide-react";
import { getEntityQuality, getQualityStatus } from "@/lib/quality";
import VibeTagChips from "@/components/ui/VibeTagChips";
import { qualityPillClass, normalizeExternalUrl } from "@/features/city/adminDrawerFeature";
import { polishVenueDescription } from "@/features/city/liveVibeFeature";
import { getSafetyToneClass } from "@/lib/placeSafetySignals";
import { getDisplayedSafetyShields, getSafetyIconToneClass } from "@/features/city/placeSafetyUi";

export default function PlaceGuideCard({
  place,
  index,
  groupLabel,
  isFocusMode,
  selectedPlaceId,
  hoveredPlaceId,
  openPlace,
  setHoveredPlaceId,
  toggleFavorite,
  favorites,
  typeStyles,
  typeLabels,
  qualityMap,
  refreshEntityQuality,
  formatDate,
  cityName,
  safetySignal,
}) {
  const style = typeStyles[place.type] || typeStyles.bar;
  const isSelected = String(selectedPlaceId) === String(place.id);
  const isHovered = String(hoveredPlaceId) === String(place.id);
  const quality = getEntityQuality({
    targetType: "place",
    targetId: place.id,
    entity: place,
    map: qualityMap,
  });
  const qualityStatus = getQualityStatus(quality);
  const isFavorite = favorites.includes(String(place.id));
  const venueDescription = polishVenueDescription(place, cityName, typeLabels);

  return (
    <div
      onClick={() => openPlace(place)}
      role="button"
      tabIndex={0}
      aria-label={`Open place details for ${place.name}`}
      onMouseEnter={() => setHoveredPlaceId(String(place.id))}
      onMouseLeave={() => setHoveredPlaceId(null)}
      onKeyDown={(keyEvent) => {
        if (keyEvent.key === "Enter" || keyEvent.key === " ") {
          keyEvent.preventDefault();
          openPlace(place);
        }
      }}
      style={{ animationDelay: `${Math.min(index * 45, 280)}ms` }}
      className={`qa-cinematic-hover qa-city-card animate-rise-in relative cursor-pointer overflow-hidden rounded-[24px] border p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45 ${
        index === 0 ? "md:col-span-2" : ""
      } ${
        isFocusMode && !isSelected ? "opacity-60 saturate-75" : ""
      } ${
        isSelected
          ? style.selected
          : `${style.card} hover:border-white/16`
      } ${
        isHovered
          ? "border-white/30 shadow-[0_20px_58px_rgba(255,255,255,0.12)]"
          : ""
      }`}
    >
      <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
      <div className={`mb-5 h-1.5 w-36 rounded-full bg-gradient-to-r ${style.line}`} />
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className={`${index === 0 ? "text-xl md:text-[1.65rem]" : "text-lg"} font-semibold leading-tight tracking-[-0.015em] text-white`}>{place.name}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border border-white/16 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${style.label}`}>
              {typeLabels[place.type] || "Place"}
            </span>
            <VibeTagChips entity={place} tone="cyan" className="" includeTypeFallback includeMixedFallback />
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            onClick={(event) => {
              event.stopPropagation();
              toggleFavorite(place.id);
            }}
            className={`qa-action ${isFavorite ? "qa-city-cta-primary" : "qa-city-cta-secondary"} rounded-full border px-3 py-1 text-xs transition ${
              isFavorite
                ? "border-pink-300/36 bg-gradient-to-r from-pink-300/20 to-fuchsia-300/16 text-pink-100"
                : "border-white/14 bg-white/5 text-white/72 hover:border-pink-300/25 hover:text-pink-100"
            }`}
            aria-label={isFavorite ? `Remove ${place.name} from favorites` : `Save ${place.name} to favorites`}
            aria-pressed={isFavorite}
          >
            {isFavorite ? "Saved" : "Save"}
          </button>

          <span className={`rounded-full border border-white/14 bg-black/45 px-3 py-1 text-xs font-semibold ${style.label}`}>
            Rating {place.avgRating?.toFixed(1) || "-"}
          </span>
          {safetySignal && Number(safetySignal.safetyReviewCount || 0) > 0 && (
            <span
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${getSafetyToneClass(safetySignal.tone)}`}
              aria-label={`Safety ${getDisplayedSafetyShields(safetySignal)} out of 5`}
            >
              <Shield
                className={`h-3.5 w-3.5 ${getSafetyIconToneClass(safetySignal.tone)}`}
                fill="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              />
              {getDisplayedSafetyShields(safetySignal)}/5
            </span>
          )}
        </div>
      </div>

      {venueDescription && (
        <div className="mb-4 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(0,0,0,0.34),rgba(0,0,0,0.52))] p-4">
          <p className={`${index === 0 ? "line-clamp-4 text-sm leading-7" : "line-clamp-3 text-sm leading-6"} text-white/68`}>
            {venueDescription}
          </p>
        </div>
      )}

      <div className="mb-4 rounded-2xl border border-cyan-200/14 bg-cyan-200/[0.07] p-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/75">Opening Hours</p>
        <p className="mt-1 text-xs leading-6 text-cyan-50/90">
          {String(place.hours || "").trim() || "Hours vary by night. Check official channels before going."}
        </p>
      </div>
      {place.link && (
        <div className="mb-4">
          <a
            href={normalizeExternalUrl(place.link)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="qa-action qa-city-cta-secondary inline-flex items-center rounded-full border border-cyan-200/18 bg-cyan-200/[0.08] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/34"
          >
            Official Link
          </a>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
          {place.reviewCount || 0} reviews
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={(clickEvent) =>
              refreshEntityQuality(
                { targetType: "place", targetId: place.id, fallbackSource: "" },
                clickEvent
              )
            }
            className={`rounded-full border px-2.5 py-1 text-[11px] transition hover:opacity-90 ${qualityPillClass(qualityStatus.tone)}`}
            aria-label={`Update quality status for place ${place.name}`}
          >
            {qualityStatus.label}
          </button>
          <span>{groupLabel}</span>
        </div>
      </div>
      {quality.lastChecked && (
        <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-white/50">
          Checked {formatDate(quality.lastChecked)}
        </p>
      )}
    </div>
  );
}
