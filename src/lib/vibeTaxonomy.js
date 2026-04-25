const DEFAULT_MAX_VIBE_TAGS = 3;

const STANDARD_VIBE_TAG_DEFS = [
  { key: "techno", label: "Techno", description: "Techno-forward dance energy." },
  { key: "pop", label: "Pop", description: "Pop-led crowd and music profile." },
  { key: "mixed", label: "Mixed", description: "Balanced multi-style profile." },
  { key: "electronic", label: "Electronic", description: "Broad electronic profile beyond strict techno." },
  { key: "men_only", label: "Men-only", description: "Men-only focused space." },
  { key: "after", label: "After", description: "Afterhours and day-party carryover." },
  { key: "chill", label: "Chill", description: "Low-pressure, relaxed energy." },
  { key: "cultural", label: "Cultural", description: "Culture-led or arts-led programming." },
  { key: "fetish", label: "Fetish", description: "Fetish and gear-forward context." },
  { key: "social", label: "Social", description: "Conversation-first social flow." },
  { key: "cozy", label: "Cozy", description: "Smaller, intimate comfort profile." },
  { key: "massive", label: "Massive", description: "Large-scale crowd density and throughput." },
  { key: "luxury", label: "Luxury", description: "Premium, high-finish positioning." },
  { key: "festival", label: "Festival", description: "Festival-scale format or seasonal mass events." },
  { key: "underground", label: "Underground", description: "Raw, alternative, or hidden-scene profile." },
  { key: "cruise", label: "Cruise", description: "Cruise and erotic-circuit alignment." },
  { key: "relax", label: "Relax", description: "Recovery, sauna, or rest-forward mode." },
  { key: "drag", label: "Drag", description: "Drag-first performance programming." },
  { key: "industrial", label: "Industrial", description: "Industrial or warehouse-coded atmosphere." },
];

export const STANDARD_VIBE_TAGS = Object.freeze(
  STANDARD_VIBE_TAG_DEFS.map((item) => Object.freeze({ ...item }))
);

const STANDARD_VIBE_TAG_SET = new Set(STANDARD_VIBE_TAGS.map((item) => item.key));
const STANDARD_VIBE_LABEL_BY_KEY = new Map(STANDARD_VIBE_TAGS.map((item) => [item.key, item.label]));

const VIBE_ALIAS_ENTRIES = [
  ["techno", "techno"],
  ["electro", "electronic"],
  ["electronic", "electronic"],
  ["edm", "electronic"],
  ["house", "electronic"],
  ["pop", "pop"],
  ["mainstream", "pop"],
  ["mixed", "mixed"],
  ["open format", "mixed"],
  ["men only", "men_only"],
  ["men-only", "men_only"],
  ["male only", "men_only"],
  ["after", "after"],
  ["afterhours", "after"],
  ["after hours", "after"],
  ["day party", "after"],
  ["dagsfester", "after"],
  ["chill", "chill"],
  ["chilled", "chill"],
  ["cultural", "cultural"],
  ["culture", "cultural"],
  ["fetish", "fetish"],
  ["kink", "fetish"],
  ["social", "social"],
  ["cozy", "cozy"],
  ["cosy", "cozy"],
  ["massive", "massive"],
  ["big room", "massive"],
  ["luxury", "luxury"],
  ["premium", "luxury"],
  ["festival", "festival"],
  ["fest", "festival"],
  ["underground", "underground"],
  ["raw", "underground"],
  ["cruise", "cruise"],
  ["cruising", "cruise"],
  ["men-only cruise", "cruise"],
  ["relax", "relax"],
  ["relaxed", "relax"],
  ["sauna", "relax"],
  ["drag", "drag"],
  ["industrial", "industrial"],
  ["warehouse", "industrial"],
];

const VIBE_ALIAS_MAP = new Map(
  VIBE_ALIAS_ENTRIES.map(([alias, key]) => [normalizeLooseToken(alias), key])
);

const LEGACY_INFERENCE_RULES = [
  { key: "drag", keywords: ["drag", "cabaret", "queen"] },
  { key: "fetish", keywords: ["fetish", "leather", "gear", "kink"] },
  { key: "cruise", keywords: ["cruise", "cruising", "darkroom"] },
  { key: "relax", keywords: ["sauna", "steam", "spa", "onsen", "wellness", "relax"] },
  { key: "techno", keywords: ["techno"] },
  { key: "electronic", keywords: ["electronic", "electro", "edm", "house"] },
  { key: "pop", keywords: ["pop", "mainstream"] },
  { key: "after", keywords: ["after", "afterhours", "after hours", "day party", "dagsfester"] },
  { key: "industrial", keywords: ["industrial", "warehouse"] },
  { key: "underground", keywords: ["underground", "raw", "renegade"] },
  { key: "massive", keywords: ["massive", "superclub", "big room", "large-scale"] },
  { key: "luxury", keywords: ["luxury", "premium", "upscale"] },
  { key: "festival", keywords: ["festival", "pride", "seasonal event"] },
  { key: "cozy", keywords: ["cozy", "cosy", "intimate", "small room"] },
  { key: "social", keywords: ["social", "community", "conversation", "meetup"] },
  { key: "cultural", keywords: ["culture", "cultural", "arts", "screening"] },
  { key: "chill", keywords: ["chill", "laid back", "soft", "calm"] },
];

function normalizeLooseToken(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitVibeInput(input) {
  if (Array.isArray(input)) return input;
  if (typeof input === "string") return input.split(/[|,;/]+/g);
  if (input == null) return [];
  return [String(input)];
}

function safeParseJson(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

export function normalizeVibeTag(value) {
  const normalized = normalizeLooseToken(value);
  if (!normalized) return "";

  if (STANDARD_VIBE_TAG_SET.has(normalized)) {
    return normalized;
  }

  return VIBE_ALIAS_MAP.get(normalized) || "";
}

export function normalizeVibeTags(input, options = {}) {
  const max = Number(options.max || DEFAULT_MAX_VIBE_TAGS);
  const tokens = splitVibeInput(input);
  const out = [];
  const seen = new Set();

  for (const token of tokens) {
    const normalizedTag = normalizeVibeTag(token);
    if (!normalizedTag) continue;
    if (seen.has(normalizedTag)) continue;
    seen.add(normalizedTag);
    out.push(normalizedTag);
    if (max > 0 && out.length >= max) break;
  }

  return out;
}

export function validateVibeTags(input, options = {}) {
  const max = Number(options.max || DEFAULT_MAX_VIBE_TAGS);
  const allowEmpty = options.allowEmpty !== false;
  const originalTokens = splitVibeInput(input)
    .map((item) => String(item || "").trim())
    .filter(Boolean);
  const normalizedTags = normalizeVibeTags(originalTokens, { max });
  const normalizedTagSet = new Set(normalizedTags);
  const unknownTokens = originalTokens.filter((token) => {
    const normalized = normalizeVibeTag(token);
    return Boolean(token) && !normalized;
  });
  const uniqueCandidateCount = new Set(
    originalTokens
      .map((token) => normalizeVibeTag(token))
      .filter(Boolean)
  ).size;

  const errors = [];
  if (!allowEmpty && normalizedTags.length === 0) {
    errors.push("At least one vibe tag is required.");
  }
  if (max > 0 && uniqueCandidateCount > max) {
    errors.push(`A maximum of ${max} vibe tags is allowed.`);
  }
  if (unknownTokens.length > 0) {
    errors.push(`Unknown vibe tags: ${unknownTokens.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    unknownTokens,
    normalizedTags,
    normalizedTagSet,
  };
}

export function inferVibeTagsFromLegacyVibe(value, options = {}) {
  const max = Number(options.max || DEFAULT_MAX_VIBE_TAGS);
  const text = normalizeLooseToken(value);
  if (!text) return [];

  const direct = normalizeVibeTags(text, { max });
  if (direct.length > 0) return direct;

  const inferred = [];
  const seen = new Set();
  for (const rule of LEGACY_INFERENCE_RULES) {
    if (rule.key === "mixed") continue;
    const matched = rule.keywords.some((keyword) => text.includes(normalizeLooseToken(keyword)));
    if (!matched) continue;
    if (seen.has(rule.key)) continue;
    seen.add(rule.key);
    inferred.push(rule.key);
    if (max > 0 && inferred.length >= max) break;
  }

  if (inferred.length === 0 && STANDARD_VIBE_TAG_SET.has("mixed")) {
    return ["mixed"];
  }
  return inferred;
}

export function primaryVibeFromTags(tags, fallback = "mixed") {
  const normalized = normalizeVibeTags(tags, { max: 1 });
  if (normalized.length > 0) return normalized[0];
  return normalizeVibeTag(fallback) || "mixed";
}

export function formatVibeTagLabel(tag) {
  const normalized = normalizeVibeTag(tag);
  if (!normalized) return "";
  return STANDARD_VIBE_LABEL_BY_KEY.get(normalized) || normalized;
}

export function buildVibeDualWriteFields({ vibe = "", vibeTags = [] } = {}) {
  const trimmedVibe = String(vibe || "").trim();
  const sourceTags =
    Array.isArray(vibeTags) && vibeTags.length > 0
      ? vibeTags
      : inferVibeTagsFromLegacyVibe(trimmedVibe, { max: DEFAULT_MAX_VIBE_TAGS });
  const normalizedTags = normalizeVibeTags(sourceTags, { max: DEFAULT_MAX_VIBE_TAGS });
  const fallbackVibe = normalizedTags.length > 0 ? formatVibeTagLabel(normalizedTags[0]) : "";
  return {
    vibe: trimmedVibe || fallbackVibe || null,
    vibe_tags: normalizedTags,
  };
}

export function isMissingVibeTagsColumnError(error) {
  const code = String(error?.code || "").trim().toUpperCase();
  const messageParts = [
    String(error?.message || ""),
    String(error?.details || ""),
    String(error?.hint || ""),
  ];
  const parsedMessage = safeParseJson(error?.message);
  if (parsedMessage && typeof parsedMessage === "object") {
    messageParts.push(
      String(parsedMessage.message || ""),
      String(parsedMessage.details || ""),
      String(parsedMessage.hint || "")
    );
  }
  const message = messageParts.join(" ").toLowerCase();
  const mentionsVibeTags = message.includes("vibe_tags");
  if (!mentionsVibeTags) return false;

  return (
    code === "42703" ||
    code === "PGRST204" ||
    message.includes("does not exist") ||
    message.includes("column") ||
    message.includes("schema cache")
  );
}
