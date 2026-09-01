import { normalizeEventRange } from "@/features/city/eventRailFeature";
import {
  inferVibeTagsFromLegacyVibe,
  normalizePlaceVibeTags,
  normalizeVibeTags,
} from "@/lib/vibeTaxonomy";
import { normalizeVenueIntel } from "@/lib/venueIntel";
import { normalizeEventIntel, normalizeServiceIntel } from "@/lib/entityIntel";

export function normalizeExternalUrl(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

export function qualityPillClass(tone) {
  if (tone === "verified") {
    return "border-emerald-200/24 bg-emerald-200/12 text-emerald-100";
  }

  if (tone === "stale") {
    return "border-amber-200/24 bg-amber-200/12 text-amber-100";
  }

  if (tone === "community") {
    return "border-cyan-200/24 bg-cyan-200/12 text-cyan-100";
  }

  return "border-white/16 bg-white/7 text-white/70";
}

export function getEntityAddressLabel(entity) {
  const directAddress = String(entity?.location || entity?.address || "").trim();
  if (directAddress) return directAddress;

  const lat = Number(entity?.lat);
  const lng = Number(entity?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)} (map coordinates)`;
  }

  return "Address not available yet.";
}

function normalizeOptionalCoordinate(value) {
  if (value === null || value === undefined || value === "") return null;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
}

export function buildPlaceAdminDraft(place) {
  const vibeValue = String(place?.vibe || "");
  const placeType = String(place?.type || "bar");
  const venueIntel = normalizeVenueIntel(place || {});
  const vibeTags = placeType === "store"
    ? ["store"]
    : normalizePlaceVibeTags(
      Array.isArray(place?.vibe_tags) && place.vibe_tags.length > 0
        ? place.vibe_tags
        : inferVibeTagsFromLegacyVibe(vibeValue),
      { max: 3 }
    );
  return {
    name: String(place?.name || ""),
    type: placeType,
    description: String(place?.description || ""),
    vibe: vibeValue,
    vibe_tags: vibeTags,
    location: String(place?.location || ""),
    lat: normalizeOptionalCoordinate(place?.lat),
    lng: normalizeOptionalCoordinate(place?.lng),
    location_source: "saved",
    hours: String(place?.hours || ""),
    link: String(place?.link || ""),
    queue_wait: venueIntel.queueWait,
    best_nights: venueIntel.bestNights,
    crowd_mix: venueIntel.crowdMix,
    dress_code: venueIntel.dressCode,
    staff_inclusivity: venueIntel.staffInclusivity,
    source_urls: venueIntel.sourceUrls.join("\n"),
    research_status: venueIntel.researchStatus,
  };
}

export function buildEventAdminDraft(event) {
  const normalized = normalizeEventRange(event || {});
  const eventIntel = normalizeEventIntel(event || {});
  const vibeValue = String(event?.vibe || "");
  const vibeTags = normalizeVibeTags(
    Array.isArray(event?.vibe_tags) && event.vibe_tags.length > 0
      ? event.vibe_tags
      : inferVibeTagsFromLegacyVibe(vibeValue),
    { max: 3 }
  );
  return {
    name: String(event?.name || ""),
    startDate: String(normalized.startDate || ""),
    endDate: String(normalized.endDate || ""),
    location: String(event?.location || ""),
    lat: normalizeOptionalCoordinate(event?.lat),
    lng: normalizeOptionalCoordinate(event?.lng),
    location_source: "saved",
    vibe: vibeValue,
    vibe_tags: vibeTags,
    description: String(event?.description || ""),
    link: String(event?.link || ""),
    ticket_url: String(event?.ticket_url || event?.ticketUrl || ""),
    entry_wait: eventIntel.entryWait,
    best_arrival: eventIntel.bestArrival,
    crowd_mix: eventIntel.crowdMix,
    dress_code: eventIntel.dressCode,
    host_inclusivity: eventIntel.hostInclusivity,
  };
}

export function buildServiceAdminDraft(service) {
  const serviceIntel = normalizeServiceIntel(service || {});
  const vibeValue = String(service?.vibe || "");
  const vibeTags = ["service"];

  return {
    name: String(service?.name || ""),
    type: String(service?.type || "other"),
    provider_name: String(service?.provider_name || ""),
    contact: String(service?.contact || ""),
    booking_link: String(service?.booking_link || ""),
    description: String(service?.description || ""),
    hours: String(service?.hours || ""),
    link: String(service?.link || ""),
    price_tier: String(service?.price_tier || ""),
    location: String(service?.location || ""),
    lat: normalizeOptionalCoordinate(service?.lat),
    lng: normalizeOptionalCoordinate(service?.lng),
    location_source: "saved",
    vibe: vibeValue,
    vibe_tags: vibeTags,
    source: String(service?.source || ""),
    lastChecked: String(service?.lastChecked || ""),
    booking_lead_time: serviceIntel.bookingLeadTime,
    best_time: serviceIntel.bestTime,
    client_mix: serviceIntel.clientMix,
    preparation: serviceIntel.preparation,
    provider_inclusivity: serviceIntel.providerInclusivity,
  };
}
