"use client";

import AmbassadorLink from "@/components/ambassador/AmbassadorLink";
import { ArrowUpRight, MapPin } from "lucide-react";
import VibeTagChips from "@/components/ui/VibeTagChips";
import { getEntityAddressLabel, normalizeExternalUrl } from "@/features/city/adminDrawerFeature";
import { polishVenueDescription } from "@/features/city/liveVibeFeature";
import { getDisplayedSafetyShields, shouldShowLegacyVibe } from "@/features/city/placeSafetyUi";
import { getSafetyToneClass } from "@/lib/placeSafetySignals";
import VenuePracticalIntel from "@/components/city/VenuePracticalIntel";
import HotelKnowBeforeYouGo from "@/components/city/HotelKnowBeforeYouGo";
import OfficialExternalLink from "@/components/ui/OfficialExternalLink";
import SelectedEntityMiniMap from "@/components/city/SelectedEntityMiniMap";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { trackKpiEvent } from "@/lib/analytics";
import { getBookingAffiliateLink } from "@/lib/bookingAffiliate";

export default function SelectedPlaceSummary({
  selectedPlace,
  cityName,
  typeLabels,
  selectedPlaceSafetySignal,
  showPlaceOnMap,
  onOpenReviews,
}) {
  const { t } = useLocale();
  if (!selectedPlace) return null;
  const addressLabel = getEntityAddressLabel(selectedPlace);
  const bookingHref = getBookingAffiliateLink(selectedPlace);
  const reviewCount = Number(selectedPlace.reviewCount || 0);
  const hasHours = Boolean(String(selectedPlace.hours || "").trim());
  const isHotel = String(selectedPlace.type || "").toLowerCase() === "hotel";

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#bdb3c2]">
        <span>{selectedPlace.city || cityName}</span>
        <span className="text-[#d7c0ff]/66">·</span>
        <span className="text-[#d7c0ff]">{typeLabels[selectedPlace.type] || t("city.place", "Place")}</span>
        <button type="button" onClick={onOpenReviews} className="ml-auto normal-case tracking-normal text-[#d7c0ff] hover:text-[#e4d6ff]">
          {reviewCount > 0
            ? `${selectedPlace.avgRating ? `${Number(selectedPlace.avgRating).toFixed(1)} · ` : ""}${reviewCount} ${t("city.reviews", "reviews")}`
            : t("city.reviews", "Reviews")}
        </button>
      </div>
      <AmbassadorLink kind="venue" entity={selectedPlace} />
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
        {!isHotel && (!bookingHref || hasHours) ? (
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#d7c0ff]/72">{t("city.openingHoursLabel", "Opening Hours")}</p>
            <p className="mt-1 text-sm leading-6 text-white/78">
              {hasHours ? String(selectedPlace.hours).trim() : t("city.hoursVary", "Hours vary by night. Check official channels before going.")}
            </p>
          </div>
        ) : null}
      </div>
      {polishVenueDescription(selectedPlace, cityName, typeLabels) && (
        <p className="my-5 text-[15px] leading-7 text-white/76">{polishVenueDescription(selectedPlace, cityName, typeLabels)}</p>
      )}
      {isHotel ? <HotelKnowBeforeYouGo place={selectedPlace} t={t} className="mt-6" /> : null}
      {bookingHref ? (
        <section className="my-6 rounded-2xl border border-[#e7c67f]/24 bg-[#e7c67f]/[0.07] p-4" aria-label={t("city.bookingOptions", "Booking options")}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f2d997]/80">{t("city.bookThisStay", "Book this stay")}</p>
          <p className="mt-1 text-sm leading-6 text-white/76">
            {t("city.bookingAvailabilityHint", "Check current prices and availability on Booking.com.")}
          </p>
          <a
            href={bookingHref}
            target="_blank"
            rel="sponsored noopener noreferrer"
            onClick={() => {
              trackKpiEvent("booking_affiliate_clicked", {
                city: String(selectedPlace.city || cityName || ""),
                targetType: "place",
                targetId: String(selectedPlace.id),
                meta: { partner: "booking", placement: "venue_detail" },
              });
            }}
            className="qa-action mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#e7c67f] px-4 text-sm font-semibold text-[#211b33] transition hover:bg-[#f2d997] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e7c67f]/70 sm:inline-flex sm:w-auto"
            style={{ minHeight: 44 }}
            aria-label={t("city.checkAvailabilityAt", "Check availability for {place} on Booking.com").replace("{place}", selectedPlace.name)}
          >
            {t("city.checkAvailabilityOnBooking", "Check availability on Booking.com")}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <p className="mt-2 text-[11px] leading-4 text-white/48">
            {t("city.bookingAffiliateDisclosure", "Via Booking.com · Queer Atlas may earn a commission at no extra cost to you.")}
          </p>
        </section>
      ) : null}
      <SelectedEntityMiniMap entity={selectedPlace} kind="venue" onExpand={showPlaceOnMap} />
      {!isHotel && !bookingHref ? <VenuePracticalIntel place={selectedPlace} compact /> : null}
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
