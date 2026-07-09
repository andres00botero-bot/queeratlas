"use client";

import Link from "next/link";
import { ArrowUpRight, ExternalLink, MapPin, MousePointerClick, Shield } from "lucide-react";
import { getEntityQuality, getQualityStatus } from "@/lib/quality";
import VibeTagChips from "@/components/ui/VibeTagChips";
import { qualityPillClass, normalizeExternalUrl } from "@/features/city/adminDrawerFeature";
import { polishVenueDescription } from "@/features/city/liveVibeFeature";
import { getSafetyToneClass } from "@/lib/placeSafetySignals";
import { getDisplayedSafetyShields, getSafetyIconToneClass } from "@/features/city/placeSafetyUi";
import { buildVenuePath } from "@/lib/seo/entitySlug";

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
  canRefreshQuality,
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
  const detailPath = buildVenuePath(place?.city || cityName, place);

  return (
    <div
      onClick={() => openPlace(place)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
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
      className={`qa-cinematic-hover qa-city-card qa-city-copy-left animate-rise-in relative cursor-pointer overflow-hidden rounded-[22px] border p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45 sm:p-5 ${
        isFocusMode && !isSelected ? "opacity-60 saturate-75" : ""
      } ${
        isSelected
          ? `${style.selected} ring-1 ring-cyan-200/45`
          : `${style.card} hover:border-white/16`
      } ${
        isHovered
          ? "border-white/30 shadow-[0_20px_58px_rgba(255,255,255,0.12)]"
          : ""
      } bg-white/[0.065] shadow-[0_18px_46px_rgba(91,33,182,0.10)]`}
    >
      <div className={`mb-4 h-1.5 w-28 rounded-full bg-gradient-to-r ${style.line} shadow-[0_0_22px_rgba(255,255,255,0.18)]`} />
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-tight tracking-[-0.015em] text-white">{place.name}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border border-white/14 bg-white/[0.055] px-3 py-1 text-[11px] uppercase tracking-[0.15em] ${style.label}`}>
              {typeLabels[place.type] || "Place"}
            </span>
            {isSelected && (
              <span className="rounded-full border border-cyan-200/35 bg-cyan-200/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                Selected
              </span>
            )}
            <VibeTagChips entity={place} tone="cyan" className="" includeTypeFallback includeMixedFallback />
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openPlace(place);
            }}
            className="qa-action qa-action-strong inline-flex items-center gap-2 rounded-full border border-fuchsia-100/48 bg-[linear-gradient(135deg,rgba(244,114,182,0.30),rgba(139,92,246,0.22),rgba(34,211,238,0.16))] px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.15em] text-white shadow-[0_14px_34px_rgba(244,114,182,0.20)] transition hover:border-fuchsia-100/70 hover:shadow-[0_18px_42px_rgba(244,114,182,0.28)]"
          >
            <MousePointerClick className="h-3.5 w-3.5" aria-hidden="true" />
            Open
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
        <div className="mb-4 rounded-2xl border border-white/12 bg-white/[0.055] p-3.5">
          <p className={`${index === 0 ? "line-clamp-4 text-sm leading-7" : "line-clamp-3 text-sm leading-7"} text-white/72`}>
            {venueDescription}
          </p>
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 gap-2.5">
        <div className="rounded-2xl border border-cyan-100/20 bg-cyan-300/[0.08] p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-50/70">Opening hours</p>
          <p className="mt-1 text-xs leading-6 text-white/84">
            {String(place.hours || "").trim() || "Hours vary by night. Check official channels before going."}
          </p>
        </div>
        <div className="flex items-start gap-2.5 rounded-2xl border border-fuchsia-100/18 bg-fuchsia-300/[0.07] px-3 py-2.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-100" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.16em] text-fuchsia-50/68">Location</p>
            <p className="mt-0.5 line-clamp-1 text-xs leading-5 text-white/82">
            {String(place.location || "").trim() || cityName}
            </p>
          </div>
        </div>
      </div>
      {place.link && (
        <div className="mb-3">
          <a
            href={normalizeExternalUrl(place.link)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="qa-action qa-action-strong inline-flex items-center gap-2 rounded-full border border-cyan-100/42 bg-[linear-gradient(135deg,rgba(34,211,238,0.24),rgba(244,114,182,0.16),rgba(255,255,255,0.09))] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_12px_30px_rgba(34,211,238,0.14)] transition hover:border-cyan-100/64 hover:shadow-[0_16px_38px_rgba(34,211,238,0.20)]"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Official link
          </a>
        </div>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toggleFavorite(place.id);
          }}
          className={`qa-action inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
            isFavorite
              ? "border-pink-100/52 bg-[linear-gradient(135deg,rgba(244,114,182,0.26),rgba(168,85,247,0.18))] text-pink-50 shadow-[0_12px_30px_rgba(244,114,182,0.18)]"
              : "border-amber-100/36 bg-[linear-gradient(135deg,rgba(251,191,36,0.18),rgba(244,114,182,0.12))] text-amber-50 hover:border-amber-100/58 hover:bg-amber-200/[0.16]"
          }`}
          aria-label={isFavorite ? `Remove ${place.name} from favorites` : `Save ${place.name} to favorites`}
          aria-pressed={isFavorite}
        >
          {isFavorite ? "Saved" : "Save place"}
        </button>
        <Link
          href={detailPath}
          onClick={(event) => event.stopPropagation()}
          className="qa-action inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] uppercase tracking-[0.13em] text-white/54 transition hover:border-white/20 hover:text-white/78"
          aria-label={`Open dedicated venue page for ${place.name}`}
        >
          Details
          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
          {place.reviewCount || 0} reviews
        </span>
        <div className="flex items-center gap-2">
          {canRefreshQuality ? (
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
          ) : (
            <span className={`rounded-full border px-2.5 py-1 text-[11px] ${qualityPillClass(qualityStatus.tone)}`}>
              {qualityStatus.label}
            </span>
          )}
          <span className="text-white/55">{groupLabel}</span>
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
