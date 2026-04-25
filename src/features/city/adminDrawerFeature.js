import { normalizeEventRange } from "@/features/city/eventRailFeature";
import { inferVibeTagsFromLegacyVibe, normalizeVibeTags } from "@/lib/vibeTaxonomy";

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

export function buildPlaceAdminDraft(place) {
  const vibeValue = String(place?.vibe || "");
  const vibeTags = normalizeVibeTags(
    Array.isArray(place?.vibe_tags) && place.vibe_tags.length > 0
      ? place.vibe_tags
      : inferVibeTagsFromLegacyVibe(vibeValue),
    { max: 3 }
  );
  return {
    name: String(place?.name || ""),
    type: String(place?.type || "bar"),
    description: String(place?.description || ""),
    vibe: vibeValue,
    vibe_tags: vibeTags,
    location: String(place?.location || ""),
    hours: String(place?.hours || ""),
    link: String(place?.link || ""),
  };
}

export function buildEventAdminDraft(event) {
  const normalized = normalizeEventRange(event || {});
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
    vibe: vibeValue,
    vibe_tags: vibeTags,
    description: String(event?.description || ""),
    link: String(event?.link || ""),
  };
}
