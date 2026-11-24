import { normalizeVenueIntelSourceUrls } from "@/lib/venueIntel";

const HOTEL_FACT_KEYS = [
  ["check_in_check_out", "checkInCheckOut"],
  ["guest_policy", "guestPolicy"],
  ["transport", "transport"],
  ["breakfast", "breakfast"],
  ["facilities", "facilities"],
  ["accessibility", "accessibility"],
];

function clean(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function hotelIntelSource(place = {}) {
  const value = place?.hotel_intel || place?.venue_intel || {};
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function isArrivalDepartureText(value = "") {
  const text = clean(value).toLowerCase();
  return /check[ -]?in|check[ -]?out|arrival|departure|reception/.test(text);
}

/**
 * Normalises hotel-specific facts without treating generic venue copy as hotel
 * policy. New data can use `hotel_intel`; legacy records may expose only a
 * clearly labelled arrival/departure string in `hours`.
 */
export function getHotelIntel(place = {}) {
  if (clean(place?.type).toLowerCase() !== "hotel") return null;

  const source = hotelIntelSource(place);
  const facts = HOTEL_FACT_KEYS.map(([snakeKey, camelKey]) => ({
    key: camelKey,
    value: clean(source[snakeKey] ?? source[camelKey]),
  })).filter((item) => item.value);

  if (!facts.some((item) => item.key === "checkInCheckOut") && isArrivalDepartureText(place?.hours)) {
    facts.unshift({ key: "checkInCheckOut", value: clean(place.hours) });
  }

  const sourceUrls = normalizeVenueIntelSourceUrls(source.source_urls ?? source.sourceUrls);
  const checkedAt = clean(source.updated_at ?? source.updatedAt ?? place.updated_at);

  return { facts, sourceUrls, checkedAt };
}

export function hasHotelIntel(place = {}) {
  return Boolean(getHotelIntel(place)?.facts?.length);
}
