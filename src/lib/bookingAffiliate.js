const BOOKING_CJ_CLICK_BASE = "https://www.jdoqocy.com/click-101928789-15734870";

const bookingDeepLinksByPlaceId = {
  "84": "https://www.booking.com/hotel/de/axel-berlin.en-gb.html",
};

export function getBookingAffiliateLink(place) {
  if (!place || String(place.type || "").toLowerCase() !== "hotel") return "";

  const destination = bookingDeepLinksByPlaceId[String(place.id)];
  if (!destination) return "";

  return `${BOOKING_CJ_CLICK_BASE}?url=${encodeURIComponent(destination)}`;
}
