const VENUE_INTEL_FIELDS = [
  ["queue_wait", "queueWait"],
  ["best_nights", "bestNights"],
  ["crowd_mix", "crowdMix"],
  ["dress_code", "dressCode"],
  ["staff_inclusivity", "staffInclusivity"],
];

const EVIDENCE_STATUSES = new Set(["verified", "verified_policy", "community_signal", "profile_summary", "source_summary", "multi_source_summary", "review_consensus", "not_published", "source_unavailable"]);

function cleanText(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 320);
}

function cleanStatus(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 80);
}

export function normalizeVenueIntelSourceUrls(value = []) {
  const candidates = Array.isArray(value)
    ? value
    : String(value || "").split(/[\r\n,]+/);
  const uniqueUrls = new Set();

  for (const candidate of candidates) {
    const raw = String(candidate || "").trim();
    if (!raw || raw.length > 2048) continue;

    try {
      const url = new URL(raw);
      if (!["http:", "https:"].includes(url.protocol)) continue;
      uniqueUrls.add(url.toString());
    } catch {
      // Ignore incomplete or non-web sources instead of storing unsafe links.
    }

    if (uniqueUrls.size >= 12) break;
  }

  return [...uniqueUrls];
}

function resolveIntelSource(value = {}) {
  const nested = value?.venue_intel;
  return nested && typeof nested === "object" && !Array.isArray(nested) ? nested : value || {};
}

export function normalizeVenueIntel(value = {}) {
  const source = resolveIntelSource(value);
  const normalized = {};

  for (const [snakeKey, camelKey] of VENUE_INTEL_FIELDS) {
    normalized[camelKey] = cleanText(source?.[snakeKey] ?? source?.[camelKey]);
  }

  normalized.updatedAt = cleanText(source?.updated_at ?? source?.updatedAt);
  normalized.sourceUrls = normalizeVenueIntelSourceUrls(source?.source_urls ?? source?.sourceUrls);
  normalized.researchStatus = cleanStatus(source?.research_status ?? source?.researchStatus);
  const topicEvidence = source?.topic_evidence ?? source?.topicEvidence;
  normalized.topicEvidence = {};
  if (topicEvidence && typeof topicEvidence === "object" && !Array.isArray(topicEvidence)) {
    for (const [snakeKey, camelKey] of VENUE_INTEL_FIELDS) {
      const item = topicEvidence?.[snakeKey] ?? topicEvidence?.[camelKey];
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const status = cleanStatus(item.status).toLowerCase();
      normalized.topicEvidence[camelKey] = {
        status: EVIDENCE_STATUSES.has(status) ? status : "",
        sourceUrls: normalizeVenueIntelSourceUrls(item.source_urls ?? item.sourceUrls),
        checkedAt: cleanText(item.checked_at ?? item.checkedAt),
        sourceExcerpt: cleanText(item.source_excerpt ?? item.sourceExcerpt),
      };
    }
  }
  return normalized;
}

export function buildVenueIntelPayload(value = {}) {
  const source = resolveIntelSource(value);
  const payload = {};

  for (const [snakeKey, camelKey] of VENUE_INTEL_FIELDS) {
    const text = cleanText(source?.[snakeKey] ?? source?.[camelKey]);
    if (text) payload[snakeKey] = text;
  }

  const sourceUrls = normalizeVenueIntelSourceUrls(source?.source_urls ?? source?.sourceUrls);
  const researchStatus = cleanStatus(source?.research_status ?? source?.researchStatus);
  if (sourceUrls.length > 0) payload.source_urls = sourceUrls;
  if (researchStatus) payload.research_status = researchStatus;

  return payload;
}

export function hasVenueIntel(value = {}) {
  const normalized = normalizeVenueIntel(value);
  return VENUE_INTEL_FIELDS.some(([, camelKey]) => Boolean(normalized[camelKey]));
}

export function getVenueIntelLabels(type = "") {
  const normalizedType = String(type || "").trim().toLowerCase();

  if (normalizedType === "hotel") {
    return {
      queueWait: "Check-in wait",
      bestNights: "Best time to stay",
      crowdMix: "Guest mix",
      dressCode: "Dress expectations",
      staffInclusivity: "Staff inclusion",
    };
  }

  if (["cafe", "restaurant"].includes(normalizedType)) {
    return {
      queueWait: "Typical wait",
      bestNights: "Best time to visit",
      crowdMix: "Locals vs visitors",
      dressCode: "What people wear",
      staffInclusivity: "Staff inclusion",
    };
  }

  if (["cruising_area", "cruise_club"].includes(normalizedType)) {
    return {
      queueWait: "Best arrival window",
      bestNights: "Busiest time",
      crowdMix: "Locals vs visitors",
      dressCode: "What to bring or wear",
      staffInclusivity: "Safety and inclusion",
    };
  }

  return {
    queueWait: "Typical queue",
    bestNights: "Best night",
    crowdMix: "Locals vs visitors",
    dressCode: "Dress code in practice",
    staffInclusivity: "Staff inclusion",
  };
}
