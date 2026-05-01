import { normalizeVibeTag, normalizeVibeTags } from "@/lib/vibeTaxonomy";

export function getSafetyIconToneClass(tone = "neutral") {
  if (tone === "safe") return "text-emerald-300";
  if (tone === "mixed") return "text-amber-300";
  if (tone === "risk") return "text-rose-300";
  return "text-cyan-200";
}

export function getDisplayedSafetyShields(signal) {
  if (!signal) return 0;
  const reviewCount = Number(signal.safetyReviewCount || 0);
  const reviewAvg = Number(signal.safetyReviewAvg || 0);
  const base = reviewCount > 0 && Number.isFinite(reviewAvg) ? reviewAvg : Number(signal.shields || 0);
  return Math.max(1, Math.min(5, Math.round(base)));
}

export function shouldShowLegacyVibe(entity) {
  if (!Boolean(entity?.legacy_vibe_user_set)) return false;

  const legacyRaw = String(entity?.vibe || "").trim();
  if (!legacyRaw) return false;

  const normalizedLegacy = normalizeVibeTag(legacyRaw);
  const tags = normalizeVibeTags(entity?.vibe_tags, { max: 8 });
  if (normalizedLegacy && tags.includes(normalizedLegacy)) return false;

  const legacyLabel = legacyRaw.replaceAll("_", " ").trim().toLowerCase();
  const tagLabels = tags.map((tag) => String(tag || "").replaceAll("_", " ").trim().toLowerCase());
  if (tagLabels.includes(legacyLabel)) return false;

  return true;
}
