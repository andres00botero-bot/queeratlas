import { BOOKING_AFFILIATE_PHASE_ONE } from "@/lib/bookingAffiliatePhaseOne";

const BOOKING_CJ_CLICK_BASE = "https://www.jdoqocy.com/click-101928789-15734870";

const bookingDeepLinksByPlaceId = Object.fromEntries(
  BOOKING_AFFILIATE_PHASE_ONE
    .filter((candidate) => ["active_pilot", "approved_for_local_pilot"].includes(candidate.matchStatus))
    .map((candidate) => [candidate.placeId, candidate.bookingUrl]),
);

export function getBookingAffiliateLink(place) {
  if (!place || String(place.type || "").toLowerCase() !== "hotel") return "";

  const destination = bookingDeepLinksByPlaceId[String(place.id)];
  if (!destination) return "";

  return `${BOOKING_CJ_CLICK_BASE}?url=${encodeURIComponent(destination)}`;
}
