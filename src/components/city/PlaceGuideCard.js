"use client";

import { ArrowUpRight, ChevronRight, MapPin } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { trackKpiEvent } from "@/lib/analytics";
import { getBookingAffiliateLink } from "@/lib/bookingAffiliate";

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
  const bookingHref = getBookingAffiliateLink(place);
  const isHotel = String(place.type || "").toLowerCase() === "hotel";

  return (
    <article
      onMouseEnter={() => setHoveredPlaceId(String(place.id))}
      onMouseLeave={() => setHoveredPlaceId(null)}
      className={`qa-cinematic-hover qa-city-card qa-city-content-card qa-venue-list-card group relative cursor-pointer py-4 pl-0 pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7c0ff]/70 focus-visible:ring-inset sm:py-5 ${
        isFocusMode && !isSelected ? "opacity-60 saturate-75" : ""
      } ${isHovered ? "is-hovered" : ""}`}
    >
      <button
        type="button"
        onClick={() => openPlace(place)}
        aria-pressed={isSelected}
        aria-label={t("city.openPlaceDetails", "Open place details for {place}").replace("{place}", place.name)}
        className="qa-action flex w-full min-w-0 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7c0ff]/70 focus-visible:ring-inset sm:gap-4"
      >
        {!isHotel ? (
          <span className="hidden w-8 shrink-0 text-right text-[11px] font-semibold tabular-nums tracking-[0.14em] text-[#d7c0ff]/58 sm:block">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}
        <div className="min-w-0 flex-1 text-left">
          <h3 className="truncate text-[16px] font-semibold leading-6 tracking-[-0.012em] text-[#f7f2f7] sm:text-[17px]">
            {place.name}
          </h3>
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-[12px] leading-5 text-[#bdb3c2]">
            {!isHotel ? <><span className="shrink-0">{typeLabel}</span><span className="text-white/42">·</span></> : null}
            <MapPin className="h-3 w-3 shrink-0 text-[#d7c0ff]/70" aria-hidden="true" />
            <span className="truncate">{location}</span>
          </p>
        </div>
        <ChevronRight
          className={`h-5 w-5 shrink-0 transition ${isSelected ? "text-[#e7c67f]" : "text-white/32 group-hover:translate-x-0.5 group-hover:text-[#d7c0ff]"}`}
          aria-hidden="true"
        />
      </button>

      {bookingHref ? (
        <div className={`ml-0 mt-3 border-t border-white/[0.08] pt-3 ${isHotel ? "sm:ml-0" : "sm:ml-11"}`}>
          <a
            href={bookingHref}
            target="_blank"
            rel="sponsored noopener noreferrer"
            onClick={() => {
              trackKpiEvent("booking_affiliate_clicked", {
                city: String(place.city || cityName || ""),
                targetType: "place",
                targetId: String(place.id),
                meta: { partner: "booking", placement: "venue_card" },
              });
            }}
            className="qa-action inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#e7c67f]/42 bg-[#e7c67f]/10 px-3.5 text-xs font-semibold text-[#f2d997] transition hover:border-[#e7c67f]/70 hover:bg-[#e7c67f]/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e7c67f]/70"
            aria-label={t("city.checkAvailabilityAt", "Check availability for {place} on Booking.com").replace("{place}", place.name)}
          >
            {t("city.checkRatesOnBooking", "Check rates on Booking.com")}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <p className="mt-1.5 text-[10px] leading-4 text-white/42">
            {t("city.bookingAffiliateDisclosure", "Via Booking.com · Queer Atlas may earn a commission at no extra cost to you.")}
          </p>
        </div>
      ) : null}
    </article>
  );
}
