import { cityCoreConfig as cityConfig } from "./cityCore.js";

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value = "") {
  return normalizeText(value)
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean);
}

function includesAny(haystack, patterns = []) {
  return patterns.some((pattern) => haystack.includes(pattern));
}

function buildCityAliases() {
  const aliases = [];
  Object.entries(cityConfig || {}).forEach(([key, city]) => {
    const title = String(city?.title || "").replace(/^queer\s+/i, "").trim();
    const cityName = normalizeText(title);
    const keyAlias = normalizeText(String(key || "").replaceAll("_", " "));
    if (cityName) aliases.push({ alias: cityName, city: title || key });
    if (keyAlias && keyAlias !== cityName) aliases.push({ alias: keyAlias, city: title || key });
  });
  return aliases.sort((a, b) => b.alias.length - a.alias.length);
}

const CITY_ALIASES = buildCityAliases();

export function inferSearchIntent(query = "") {
  const normalized = normalizeText(query);
  const tokens = tokenize(query);
  const hasQuery = normalized.length > 0;

  const flags = {
    nightlife: includesAny(normalized, ["nightlife", "bar", "bars", "club", "clubs", "party", "dance floor"]),
    cafes: includesAny(normalized, ["cafe", "cafes", "coffee", "coffee shop"]),
    safe: includesAny(normalized, ["safe", "safety", "secure", "trusted"]),
    drag: includesAny(normalized, ["drag", "cabaret"]),
    tonight: includesAny(normalized, ["tonight", "this evening", "tonite"]),
    quiet: includesAny(normalized, ["quiet", "calm", "chill", "low key", "low-key"]),
    transFriendly: includesAny(normalized, ["trans-friendly", "trans friendly", "trans", "transgender", "nonbinary"]),
    lesbianFriendly: includesAny(normalized, ["lesbian-friendly", "lesbian friendly", "lesbian"]),
    travel: includesAny(normalized, ["travel", "trip", "guide", "destination", "destinations"]),
    community: includesAny(normalized, ["community", "meetup", "meetups", "social group", "group"]),
    events: includesAny(normalized, ["event", "events", "festival", "show", "shows", "pride"]),
  };

  let detectedCity = "";
  if (hasQuery) {
    for (const candidate of CITY_ALIASES) {
      const escaped = candidate.alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matcher = new RegExp(`(^|\\s)${escaped}(\\s|$)`);
      if (matcher.test(normalized)) {
        detectedCity = candidate.city;
        break;
      }
    }
  }

  let suggestedTypeFilter = "all";
  if (flags.travel) {
    suggestedTypeFilter = "city";
  } else if (flags.events || flags.drag || flags.tonight || flags.community) {
    suggestedTypeFilter = "event";
  } else if (flags.nightlife || flags.cafes || flags.safe || flags.quiet || flags.transFriendly || flags.lesbianFriendly) {
    suggestedTypeFilter = "place";
  }

  const suggestedQualityFilter = flags.safe || flags.transFriendly ? "verified" : "all";

  const tags = [];
  if (flags.nightlife) tags.push("nightlife");
  if (flags.cafes) tags.push("cafes");
  if (flags.safe) tags.push("safe");
  if (flags.drag) tags.push("drag");
  if (flags.tonight) tags.push("tonight");
  if (flags.quiet) tags.push("quiet");
  if (flags.transFriendly) tags.push("trans-friendly");
  if (flags.lesbianFriendly) tags.push("lesbian-friendly");
  if (flags.travel) tags.push("travel");
  if (flags.community) tags.push("community");
  if (flags.events) tags.push("events");

  return {
    rawQuery: String(query || ""),
    normalizedQuery: normalized,
    tokens,
    flags,
    tags,
    detectedCity,
    suggestedTypeFilter,
    suggestedQualityFilter,
    hasIntent: tags.length > 0 || Boolean(detectedCity),
  };
}

export function getIntentSignalBoost({ targetType = "", entity = {}, intent = null }) {
  if (!intent?.hasIntent) return 0;
  const type = String(targetType || "").toLowerCase();
  const text = normalizeText(
    `${entity?.name || ""} ${entity?.title || ""} ${entity?.type || ""} ${entity?.description || ""} ${
      entity?.vibe || ""
    } ${entity?.city || ""} ${entity?.country || ""}`
  );

  let score = 0;

  if (intent.suggestedTypeFilter !== "all") {
    score += type === intent.suggestedTypeFilter ? 22 : -6;
  }

  if (intent.flags.tonight) {
    score += type === "event" ? 26 : -2;
  }

  if (intent.flags.nightlife) {
    if (type === "place" || type === "event") score += 10;
    if (includesAny(text, ["nightlife", "bar", "club", "party"])) score += 12;
  }

  if (intent.flags.cafes) {
    if (type === "place") score += 10;
    if (includesAny(text, ["cafe", "cafes", "coffee"])) score += 14;
  }

  if (intent.flags.drag) {
    if (type === "event") score += 12;
    if (includesAny(text, ["drag", "cabaret"])) score += 16;
  }

  if (intent.flags.community) {
    if (type === "event") score += 10;
    if (includesAny(text, ["community", "meetup", "collective", "workshop"])) score += 12;
  }

  if (intent.flags.safe || intent.flags.transFriendly || intent.flags.lesbianFriendly) {
    if (type === "place") score += 8;
    if (includesAny(text, ["safe", "safer", "trusted", "inclusive", "friendly", "trans", "lesbian"])) score += 14;
  }

  if (intent.flags.quiet) {
    if (includesAny(text, ["quiet", "calm", "lounge", "chill", "low-key", "wine"])) score += 12;
    if (includesAny(text, ["party", "festival", "crowded"])) score -= 8;
  }

  if (intent.flags.travel && type === "city") {
    score += 18;
  }

  if (intent.detectedCity) {
    const city = normalizeText(intent.detectedCity);
    if (city && normalizeText(entity?.city || entity?.name || "").includes(city)) {
      score += 14;
    }
  }

  return score;
}
