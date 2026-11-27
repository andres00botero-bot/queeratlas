"use client";

import VenueGallery from "@/components/ambassador/VenueGallery";
import AmbassadorLink from "@/components/ambassador/AmbassadorLink";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import VibeTagChips from "@/components/ui/VibeTagChips";
import { getEntityAddressLabel, normalizeExternalUrl } from "@/features/city/adminDrawerFeature";
import { polishVenueDescription } from "@/features/city/liveVibeFeature";
import SafetyShields from "@/components/city/SafetyShields";
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
  reviews = [],
  showPlaceOnMap,
  onOpenReviews,
}) {
  const { t, locale } = useLocale();
  if (!selectedPlace) return null;
  const addressLabel = getEntityAddressLabel(selectedPlace);
  const bookingHref = getBookingAffiliateLink(selectedPlace);
  const reviewCount = Number(selectedPlace.reviewCount || 0);
  const rating = Number(selectedPlace.avgRating ?? selectedPlace.avg_rating);
  const scores = (reviews || []).map(review => Number(review.safety)).filter(value => value >= 1 && value <= 5);
  const safetyCount = scores.length || Number(selectedPlaceSafetySignal?.safetyReviewCount || 0);
  const safety = scores.length ? scores.reduce((total, value) => total + value, 0) / scores.length : Number(selectedPlaceSafetySignal?.safetyReviewAvg);
  const hasSafety = safetyCount > 0 && safety > 0;
  const formatScore = value => value.toLocaleString(locale, { maximumFractionDigits: 1 });
  const hasHours = Boolean(String(selectedPlace.hours || "").trim());
  const isHotel = String(selectedPlace.type || "").toLowerCase() === "hotel";

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#bdb3c2]">
        <span>{selectedPlace.city || cityName}</span>
        <span className="text-[#d7c0ff]/66">·</span>
        <span className="text-[#d7c0ff]">{typeLabels[selectedPlace.type] || t("city.place", "Place")}</span>
        <button type="button" onClick={onOpenReviews} className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 rounded-lg text-sm normal-case tracking-normal hover:bg-white/5 focus-visible:outline-cyan-200 sm:ml-auto">
          {reviewCount > 0 && rating > 0 && <span className="inline-flex items-center gap-1 text-[#e7c67f]">
            <span className="sr-only">{t("city.reviews", "Reviews")} </span>
            {[1, 2, 3, 4, 5].map(n => <Star key={n} aria-hidden="true" size={14} fill={n <= Math.round(rating) ? "currentColor" : "none"} />)}
            {formatScore(rating)}/5
          </span>}
          {hasSafety && <span className="inline-flex items-center gap-1 text-cyan-200">
            <span className="sr-only">{t("city.safety", "Safety")} </span>
            <SafetyShields value={Math.round(safety)} activeClassName="text-cyan-200" inactiveClassName="text-white/45" />
            {formatScore(safety)}/5
          </span>}
          <span className="text-[#d7c0ff] underline underline-offset-4">{t("city.reviews", "Reviews")} · {reviewCount}</span>
        </button>
      </div>
      <AmbassadorLink kind="venue" entity={selectedPlace} />
      <VenueGallery venue={selectedPlace} />
      <VibeTagChips entity={selectedPlace} tone="cyan" className="mb-4" showLegacy includeTypeFallback includeMixedFallback />
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
      {hasSafety && (
        <p className="mt-2 text-[11px] text-white/60">
          {t("city.safetyReviewsBasedOn", "Based on {count} member safety review{suffix}.")
            .replace("{count}", safetyCount)
            .replace("{suffix}", safetyCount === 1 ? "" : "s")}
        </p>
      )}
    </>
  );
}
