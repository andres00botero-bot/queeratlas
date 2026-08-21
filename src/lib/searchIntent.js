import { cityCoreConfig as cityConfig } from "./cityCore.js";

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value = "") {
  return normalizeText(value)
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean);
}

function includesPhrase(haystack, pattern) {
  const normalizedPattern = normalizeText(pattern);
  if (!haystack || !normalizedPattern) return false;
  const escaped = normalizedPattern
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+/g, "\\s+");
  return new RegExp(`(^|\\s)${escaped}(?=\\s|$)`).test(haystack);
}

function includesAny(haystack, patterns = []) {
  return patterns.some((pattern) => includesPhrase(haystack, pattern));
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

function editDistance(left = "", right = "") {
  const a = normalizeText(left);
  const b = normalizeText(right);
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let row = 1; row <= a.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= b.length; column += 1) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (a[row - 1] === b[column - 1] ? 0 : 1)
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[b.length];
}

function detectFuzzyCity(tokens = []) {
  let best = null;
  CITY_ALIASES.forEach((candidate) => {
    const aliasTokens = candidate.alias.split(" ");
    if (candidate.alias.length < 4 || tokens.length < aliasTokens.length) return;
    for (let index = 0; index <= tokens.length - aliasTokens.length; index += 1) {
      const phrase = tokens.slice(index, index + aliasTokens.length).join(" ");
      if (phrase.length < 4) continue;
      const maxDistance = candidate.alias.length >= 9 ? 2 : 1;
      const distance = editDistance(phrase, candidate.alias);
      if (distance > maxDistance) continue;
      if (!best || distance < best.distance || (distance === best.distance && candidate.alias.length > best.alias.length)) {
        best = { ...candidate, distance };
      }
    }
  });
  return best;
}

const PLACE_TYPE_INTENTS = Object.freeze([
  {
    label: "sauna",
    types: ["sauna"],
    aliases: ["sauna", "saunas", "bathhouse", "bathhouses", "bath house", "bath houses"],
  },
  {
    label: "hotel",
    types: ["hotel"],
    aliases: ["hotel", "hotels", "hostel", "hostels", "accommodation"],
  },
  {
    label: "bar",
    types: ["bar"],
    aliases: ["bar", "bars", "pub", "pubs"],
  },
  {
    label: "club",
    types: ["club"],
    aliases: ["club", "clubs", "nightclub", "nightclubs", "dance club", "dance clubs", "discotheque", "discotheques", "disco"],
  },
  {
    label: "cafe",
    types: ["cafe"],
    aliases: ["cafe", "cafes", "coffee", "coffee shop", "coffee shops"],
  },
  {
    label: "restaurant",
    types: ["restaurant"],
    aliases: ["restaurant", "restaurants", "dining"],
  },
  {
    label: "cinema",
    types: ["cinema"],
    aliases: ["cinema", "cinemas", "movie theatre", "movie theatres", "arthouse cinema", "film theatre"],
  },
  {
    label: "gallery",
    types: ["gallery"],
    aliases: ["gallery", "galleries", "art gallery", "art galleries", "art space", "art spaces"],
  },
  {
    label: "cruise",
    types: ["cruise_club", "cruising_area"],
    aliases: ["cruise", "cruising", "cruise club", "cruise clubs", "cruising area", "cruising areas"],
  },
]);

export function inferSearchIntent(query = "") {
  const normalized = normalizeText(query);
  const tokens = tokenize(query);
  const hasQuery = normalized.length > 0;
  const rawMatchedPlaceTypes = PLACE_TYPE_INTENTS.filter((item) => includesAny(normalized, item.aliases));
  const matchedPlaceTypes = rawMatchedPlaceTypes.some((item) => item.label === "cruise")
    ? rawMatchedPlaceTypes.filter((item) => item.label === "cruise")
    : rawMatchedPlaceTypes;
  const placeTypes = [...new Set(matchedPlaceTypes.flatMap((item) => item.types))];
  const placeTypeLabels = [...new Set(matchedPlaceTypes.map((item) => item.label))];

  const flags = {
    nearby: includesAny(normalized, ["near me", "nearby", "close to me", "closest to me"]),
    nightlife: includesAny(normalized, ["nightlife", "bar", "bars", "club", "clubs", "party", "dance floor"]),
    cafes: includesAny(normalized, ["cafe", "cafes", "coffee", "coffee shop"]),
    safe: includesAny(normalized, ["safe", "safety", "secure", "trusted"]),
    drag: includesAny(normalized, ["drag", "cabaret"]),
    tonight: includesAny(normalized, ["tonight", "this evening", "tonite"]),
    quiet: includesAny(normalized, ["quiet", "calm", "chill", "low key", "low-key"]),
    transFriendly: includesAny(normalized, ["trans-friendly", "trans friendly", "trans", "transgender", "nonbinary"]),
    lesbianFriendly: includesAny(normalized, ["lesbian-friendly", "lesbian friendly", "lesbian"]),
    nonbinaryFriendly: includesAny(normalized, ["nonbinary", "non-binary", "genderqueer", "gender diverse"]),
    gayFriendly: includesAny(normalized, ["gay", "gay-friendly", "gay friendly"]),
    bisexualFriendly: includesAny(normalized, ["bisexual", "bi-friendly", "bi friendly"]),
    sapphicFriendly: includesAny(normalized, ["sapphic", "flinta", "wlw"]),
    travel: includesAny(normalized, ["travel", "trip", "guide", "destination", "destinations"]),
    community: includesAny(normalized, ["community", "meetup", "meetups", "social group", "group"]),
    events: includesAny(normalized, ["event", "events", "festival", "show", "shows", "pride"]),
    services: includesAny(normalized, [
      "service",
      "services",
      "support",
      "clinic",
      "healthcare",
      "health care",
      "legal help",
      "helpline",
      "organization",
      "organisation",
    ]),
    guides: includesAny(normalized, ["report", "reports", "ranking", "rankings", "index", "methodology"]),
  };

  let detectedCity = "";
  let cityMatch = "none";
  if (hasQuery) {
    for (const candidate of CITY_ALIASES) {
      const escaped = candidate.alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matcher = new RegExp(`(^|\\s)${escaped}(\\s|$)`);
      if (matcher.test(normalized)) {
        detectedCity = candidate.city;
        cityMatch = "exact";
        break;
      }
    }
  }
  if (!detectedCity && hasQuery) {
    const fuzzyCity = detectFuzzyCity(tokens);
    if (fuzzyCity) {
      detectedCity = fuzzyCity.city;
      cityMatch = "corrected";
    }
  }

  let suggestedTypeFilter = "all";
  if (flags.nearby) {
    suggestedTypeFilter = "all";
  } else if (flags.guides) {
    suggestedTypeFilter = "guide";
  } else if (flags.services) {
    suggestedTypeFilter = "service";
  } else if (flags.travel) {
    suggestedTypeFilter = "city";
  } else if (flags.events || flags.drag || flags.tonight || flags.community) {
    suggestedTypeFilter = "event";
  } else if (
    flags.safe ||
    flags.transFriendly ||
    flags.lesbianFriendly ||
    flags.nonbinaryFriendly ||
    flags.gayFriendly ||
    flags.bisexualFriendly ||
    flags.sapphicFriendly
  ) {
    suggestedTypeFilter = "all";
  } else if (
    placeTypes.length > 0 ||
    flags.nightlife ||
    flags.cafes ||
    flags.quiet ||
    flags.transFriendly
  ) {
    suggestedTypeFilter = "place";
  }

  // Editorial verification confirms that information was checked; it is not a
  // safety rating. Keep safety and identity intent separate from quality state.
  const suggestedQualityFilter = "all";

  const tags = [];
  if (flags.nearby) tags.push("nearby");
  if (flags.nightlife) tags.push("nightlife");
  if (flags.cafes) tags.push("cafes");
  if (flags.safe) tags.push("safe");
  if (flags.drag) tags.push("drag");
  if (flags.tonight) tags.push("tonight");
  if (flags.quiet) tags.push("quiet");
  if (flags.transFriendly) tags.push("trans-friendly");
  if (flags.lesbianFriendly) tags.push("lesbian-friendly");
  if (flags.nonbinaryFriendly) tags.push("nonbinary-friendly");
  if (flags.gayFriendly) tags.push("gay-friendly");
  if (flags.bisexualFriendly) tags.push("bisexual-friendly");
  if (flags.sapphicFriendly) tags.push("sapphic-friendly");
  if (flags.travel) tags.push("travel");
  if (flags.community) tags.push("community");
  if (flags.events) tags.push("events");
  if (flags.services) tags.push("services");
  if (flags.guides) tags.push("guides");
  placeTypeLabels.forEach((label) => {
    if (!tags.includes(label)) tags.push(label);
  });

  return {
    rawQuery: String(query || ""),
    normalizedQuery: normalized,
    tokens,
    flags,
    tags,
    placeTypes,
    placeTypeLabels,
    detectedCity,
    cityMatch,
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
    } ${entity?.city || ""} ${entity?.country || ""} ${JSON.stringify(
      entity?.venue_intel || entity?.service_intel || entity?.event_intel || {}
    )}`
  );

  let score = 0;

  if (intent.flags.nearby) {
    score += type === "place" || type === "service" ? 72 : -120;
  }

  if (intent.suggestedTypeFilter !== "all") {
    score += type === intent.suggestedTypeFilter ? 22 : -6;
  }

  if (intent.placeTypes?.length > 0) {
    const entityPlaceType = normalizeText(entity?.type || "").replace(/\s+/g, "_");
    if (type === "place") {
      score += intent.placeTypes.includes(entityPlaceType) ? 120 : -34;
    } else {
      score -= 80;
    }
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

  if (intent.flags.services) {
    if (type === "service") score += 38;
    if (includesAny(text, ["service", "support", "clinic", "health", "legal", "helpline"])) score += 16;
  }

  if (intent.flags.guides) {
    if (type === "guide") score += 38;
    if (includesAny(text, ["guide", "report", "ranking", "index", "methodology"])) score += 16;
  }

  if (
    intent.flags.safe ||
    intent.flags.transFriendly ||
    intent.flags.lesbianFriendly ||
    intent.flags.nonbinaryFriendly ||
    intent.flags.gayFriendly ||
    intent.flags.bisexualFriendly ||
    intent.flags.sapphicFriendly
  ) {
    if (type === "place" || type === "service") score += 8;
    if (intent.flags.safe && type === "guide") score += 24;
    if (includesAny(text, ["safe", "safer", "trusted", "inclusive", "friendly", "trans", "lesbian", "sapphic", "nonbinary", "non-binary", "bisexual", "flinta"])) score += 18;
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
    const entityCity = normalizeText(entity?.city || entity?.name || "");
    if (city && entityCity === city) {
      score += 42;
    } else if (city && entityCity.includes(city)) {
      score += 24;
    } else if (city && (type === "place" || type === "event")) {
      score -= 100;
    }
  }

  return score;
}
