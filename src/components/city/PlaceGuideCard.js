"use client";

import { ChevronRight, MapPin } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function PlaceGuideCard({
  place,
  index,
  isFocusMode,
  selectedPlaceId,
  hoveredPlaceId,
  openPlace,
  setHoveredPlaceId,
  typeLabels,
  cityName,
}) {
  const { t } = useLocale();
  const isSelected = String(selectedPlaceId) === String(place.id);
  const isHovered = String(hoveredPlaceId) === String(place.id);
  const typeLabel = typeLabels[place.type] || t("city.place", "Place");
  const location = String(place.location || "").trim() || cityName;
  const rating = Number(place.avgRating);
  const summary = [
    typeLabel,
    Number.isFinite(rating) ? t("city.rating", "Rating {rating}").replace("{rating}", rating.toFixed(1)) : null,
  ].filter(Boolean).join(" · ");

  return (
    <div
      onClick={() => openPlace(place)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={t("city.openPlaceDetails", "Open place details for {place}").replace("{place}", place.name)}
      onMouseEnter={() => setHoveredPlaceId(String(place.id))}
      onMouseLeave={() => setHoveredPlaceId(null)}
      onKeyDown={(keyEvent) => {
        if (keyEvent.key === "Enter" || keyEvent.key === " ") {
          keyEvent.preventDefault();
          openPlace(place);
        }
      }}
      className={`qa-cinematic-hover qa-city-card qa-city-content-card qa-venue-list-card group relative cursor-pointer py-4 pl-0 pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7c0ff]/70 focus-visible:ring-inset sm:py-5 ${
        isFocusMode && !isSelected ? "opacity-60 saturate-75" : ""
      } ${isHovered ? "is-hovered" : ""}`}
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <span className="hidden w-8 shrink-0 text-right text-[11px] font-semibold tabular-nums tracking-[0.14em] text-[#d7c0ff]/58 sm:block">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1 text-left">
          <h3 className="truncate text-[16px] font-semibold leading-6 tracking-[-0.012em] text-[#f7f2f7] sm:text-[17px]">
            {place.name}
          </h3>
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-[12px] leading-5 text-[#bdb3c2]">
            <span className="shrink-0">{summary}</span>
            <span className="text-white/42">·</span>
            <MapPin className="h-3 w-3 shrink-0 text-[#d7c0ff]/70" aria-hidden="true" />
            <span className="truncate">{location}</span>
          </p>
        </div>
        <ChevronRight
          className={`h-5 w-5 shrink-0 transition ${isSelected ? "text-[#e7c67f]" : "text-white/32 group-hover:translate-x-0.5 group-hover:text-[#d7c0ff]"}`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
