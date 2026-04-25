import {
  formatVibeTagLabel,
  inferVibeTagsFromLegacyVibe,
  normalizeVibeTag,
  normalizeVibeTags,
} from "@/lib/vibeTaxonomy";

const TYPE_FALLBACK_TAG = {
  sauna: "relax",
  spa: "relax",
  cruise_club: "cruise",
  cruising_area: "cruise",
  cafe: "cozy",
  restaurant: "social",
  hotel: "luxury",
};

export function resolveTypeFallbackTag(type = "") {
  const normalizedType = String(type || "").trim().toLowerCase();
  return TYPE_FALLBACK_TAG[normalizedType] || "";
}

export function resolveVibeTagsForEntity(entity = {}, options = {}) {
  const max = Number(options.max || 3);
  const includeTypeFallback = options.includeTypeFallback === true;
  const includeMixedFallback = options.includeMixedFallback === true;

  let tags = normalizeVibeTags(Array.isArray(entity?.vibe_tags) ? entity.vibe_tags : [], { max });

  if (tags.length === 0) {
    tags = normalizeVibeTags(inferVibeTagsFromLegacyVibe(entity?.vibe || "", { max }), { max });
  }

  if (tags.length === 0 && includeTypeFallback) {
    const typeFallbackTag = resolveTypeFallbackTag(entity?.type);
    if (typeFallbackTag) {
      tags = normalizeVibeTags([typeFallbackTag], { max });
    }
  }

  if (tags.length === 0 && includeMixedFallback) {
    tags = ["mixed"];
  }

  return normalizeVibeTags(tags, { max });
}

export function resolveVibeTagLabelsForEntity(entity = {}, options = {}) {
  return resolveVibeTagsForEntity(entity, options)
    .map((tag) => formatVibeTagLabel(tag))
    .filter(Boolean);
}

export function resolvePrimaryVibeKey(entity = {}, options = {}) {
  const tags = resolveVibeTagsForEntity(entity, options);
  if (tags.length > 0) return tags[0];

  const fromLegacy = normalizeVibeTag(entity?.vibe || "");
  if (fromLegacy) return fromLegacy;

  if (options.includeTypeFallback) {
    return resolveTypeFallbackTag(entity?.type) || "";
  }

  return "";
}

export function resolvePrimaryVibeLabel(entity = {}, options = {}) {
  const labels = resolveVibeTagLabelsForEntity(entity, options);
  if (labels.length > 0) return labels[0];

  const legacy = String(entity?.vibe || "").trim();
  if (legacy) return legacy.replaceAll("_", " ");

  if (options.includeTypeFallback) {
    const typeFallbackKey = resolveTypeFallbackTag(entity?.type);
    if (typeFallbackKey) {
      return formatVibeTagLabel(typeFallbackKey) || typeFallbackKey;
    }
  }

  const fallback = String(options.fallback || "").trim();
  return fallback;
}
