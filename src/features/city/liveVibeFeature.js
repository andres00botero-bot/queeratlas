import { getCityHeroCopy } from "@/features/city/cityHeroCopy";

export const LIVE_VIBE_COOLDOWN_MS = 30 * 1000;

export { getCityHeroCopy };

export function polishGuideText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

export function polishVenueDescription(place) {
  return String(place?.description || "").replace(/\s+/g, " ").trim();
}

export function polishEventDescription(event) {
  return String(event?.description || "").replace(/\s+/g, " ").trim();
}
