/**
 * Phase-one research queue. These are identity-checked Booking.com destination
 * URLs, not public affiliate links. Keep candidates out of bookingAffiliate.js
 * until a human has rechecked the property match in CJ and approved activation.
 */
export const BOOKING_AFFILIATE_PHASE_ONE = [
  {
    placeId: "84",
    city: "berlin",
    hotelName: "Axel Hotel Berlin",
    bookingUrl: "https://www.booking.com/hotel/de/axel-berlin.en-gb.html",
    matchStatus: "active_pilot",
    checkedAt: "2026-11-24",
  },
  {
    placeId: "85",
    city: "berlin",
    hotelName: "ArtHotel Connection",
    bookingUrl: "https://www.booking.com/hotel/de/arthotel-connection-gay.en-gb.html",
    matchStatus: "approved_for_local_pilot",
    checkedAt: "2026-11-24",
  },
  {
    placeId: "2441",
    city: "barcelona",
    hotelName: "Axel Hotel Barcelona",
    bookingUrl: "https://www.booking.com/hotel/es/hotelaxelbarcelona.en-gb.html",
    matchStatus: "approved_for_local_pilot",
    checkedAt: "2026-11-24",
  },
  {
    placeId: "2387",
    city: "barcelona",
    hotelName: "TWO Hotel Barcelona by Axel",
    bookingUrl: "https://www.booking.com/hotel/es/two-barcelona-by-axel.en-gb.html",
    matchStatus: "approved_for_local_pilot",
    checkedAt: "2026-11-24",
  },
  {
    placeId: "3573",
    city: "barcelona",
    hotelName: "Hotel Soho Barcelona",
    bookingUrl: "https://www.booking.com/hotel/es/soho.en-gb.html",
    matchStatus: "approved_for_local_pilot",
    checkedAt: "2026-11-24",
  },
  {
    placeId: "5746",
    city: "amsterdam",
    hotelName: "Hotel Casa Amsterdam",
    bookingUrl: "https://www.booking.com/hotel/nl/casa-400.en-gb.html",
    matchStatus: "approved_for_local_pilot",
    checkedAt: "2026-11-24",
  },
  {
    placeId: "5742",
    city: "amsterdam",
    hotelName: "Zoku Amsterdam",
    bookingUrl: "https://www.booking.com/hotel/nl/zoku-amsterdam.en-gb.html",
    matchStatus: "approved_for_local_pilot",
    checkedAt: "2026-11-24",
  },
  {
    placeId: "5750",
    city: "amsterdam",
    hotelName: "The Hoxton, Amsterdam",
    bookingUrl: "https://www.booking.com/hotel/nl/the-hoxton-amsterdam.en-gb.html",
    matchStatus: "approved_for_local_pilot",
    checkedAt: "2026-11-24",
  },
  {
    placeId: "3360",
    city: "london",
    hotelName: "The Soho Hotel",
    bookingUrl: "https://www.booking.com/hotel/gb/the-soho.en-gb.html",
    matchStatus: "approved_for_local_pilot",
    checkedAt: "2026-11-24",
  },
  {
    placeId: "3361",
    city: "london",
    hotelName: "Hazlitt's",
    bookingUrl: "https://www.booking.com/hotel/gb/hazlittshotel.en-gb.html",
    matchStatus: "approved_for_local_pilot",
    checkedAt: "2026-11-24",
  },
  {
    placeId: "1852",
    city: "london",
    hotelName: "The Z Hotel Soho",
    bookingUrl: "https://www.booking.com/hotel/gb/the-z-hotels-soho.en-gb.html",
    matchStatus: "approved_for_local_pilot",
    checkedAt: "2026-11-24",
  },
];

export const BOOKING_AFFILIATE_PHASE_ONE_READY_FOR_CJ_REVIEW = BOOKING_AFFILIATE_PHASE_ONE.filter(
  (candidate) => candidate.matchStatus === "approved_for_local_pilot",
);
