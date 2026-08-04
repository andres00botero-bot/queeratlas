const BLOCKED_QUALITY_STATUSES = new Set(["hold", "rejected", "blocked", "draft"]);
const WEAK_RESEARCH_STATUSES = new Set([
  "generated_practical_fallback",
  "not_published",
  "source_unavailable",
]);

const INTEL_FIELDS = {
  venue: [
    ["queue_wait", "queueWait"],
    ["best_nights", "bestNights"],
    ["crowd_mix", "crowdMix"],
    ["dress_code", "dressCode"],
    ["staff_inclusivity", "staffInclusivity"],
  ],
  event: [
    ["entry_wait", "entryWait"],
    ["best_arrival", "bestArrival"],
    ["crowd_mix", "crowdMix"],
    ["dress_code", "dressCode"],
    ["host_inclusivity", "hostInclusivity"],
  ],
  service: [
    ["booking_lead_time", "bookingLeadTime"],
    ["best_time", "bestTime"],
    ["client_mix", "clientMix"],
    ["preparation", "preparation"],
    ["provider_inclusivity", "providerInclusivity"],
  ],
};

function cleanText(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function isHttpUrl(value = "") {
  try {
    return ["http:", "https:"].includes(new URL(cleanText(value)).protocol);
  } catch {
    return false;
  }
}

function resolveIntel(entity = {}, kind = "venue") {
  const nestedKey = kind === "venue" ? "venue_intel" : `${kind}_intel`;
  const nested = entity?.[nestedKey];
  return nested && typeof nested === "object" && !Array.isArray(nested) ? nested : {};
}

function countMeaningfulIntel(entity = {}, kind = "venue") {
  const intel = resolveIntel(entity, kind);
  return (INTEL_FIELDS[kind] || []).filter(([snakeKey, camelKey]) => {
    const value = cleanText(intel?.[snakeKey] ?? intel?.[camelKey]);
    return value.length >= 24;
  }).length;
}

function resolveSourceUrls(entity = {}, kind = "venue") {
  const intel = resolveIntel(entity, kind);
  const candidates = [
    ...(Array.isArray(intel?.source_urls) ? intel.source_urls : []),
    ...(Array.isArray(intel?.sourceUrls) ? intel.sourceUrls : []),
  ];
  return [...new Set(candidates.filter(isHttpUrl).map((value) => cleanText(value)))];
}

function isExplicitlyBlocked(entity = {}) {
  if (entity?.seo_indexable === false) return true;
  const qualityStatus = cleanText(entity?.seo_quality_status).toLowerCase();
  return BLOCKED_QUALITY_STATUSES.has(qualityStatus);
}

function isResearchBacked(entity = {}, kind = "venue") {
  const intel = resolveIntel(entity, kind);
  const researchStatus = cleanText(intel?.research_status ?? intel?.researchStatus).toLowerCase();
  if (WEAK_RESEARCH_STATUSES.has(researchStatus)) return false;

  const qualityStatus = cleanText(entity?.seo_quality_status).toLowerCase();
  const explicitlyApproved = entity?.seo_indexable === true || qualityStatus === "approved";
  const verified = entity?.verified === true;
  return explicitlyApproved || verified || resolveSourceUrls(entity, kind).length > 0;
}

function resolvePrimaryLink(entity = {}, kind = "venue") {
  if (kind === "event") {
    return entity?.link || entity?.ticket_url || entity?.ticketUrl || "";
  }
  if (kind === "service") {
    return entity?.link || entity?.booking_link || entity?.bookingLink || "";
  }
  return entity?.link || entity?.website || entity?.url || "";
}

function baseQuality(entity = {}, kind = "venue", minimumDescriptionLength = 90) {
  const reasons = [];
  const description = cleanText(entity?.description);

  if (isExplicitlyBlocked(entity)) reasons.push("editorial-block");
  if (!cleanText(entity?.id)) reasons.push("missing-id");
  if (!cleanText(entity?.name)) reasons.push("missing-name");
  if (!cleanText(entity?.city)) reasons.push("missing-city");
  if (description.length < minimumDescriptionLength) reasons.push("thin-description");
  if (!isHttpUrl(resolvePrimaryLink(entity, kind))) reasons.push("missing-source-link");
  if (countMeaningfulIntel(entity, kind) < 5) reasons.push("incomplete-intelligence");
  if (!isResearchBacked(entity, kind)) reasons.push("unverified-intelligence");

  return { indexable: reasons.length === 0, reasons };
}

export function evaluateVenueSeoQuality(entity = {}) {
  const result = baseQuality(entity, "venue", 90);
  const hasLocation = cleanText(entity?.location).length >= 4;
  const hasCoordinates = Number.isFinite(Number(entity?.lat)) && Number.isFinite(Number(entity?.lng));
  if (!cleanText(entity?.type)) result.reasons.push("missing-type");
  if (!hasLocation && !hasCoordinates) result.reasons.push("missing-location");
  return { ...result, indexable: result.reasons.length === 0 };
}

export function resolveEventEndDate(entity = {}) {
  return cleanText(
    entity?.end_date || entity?.endDate || entity?.start_date || entity?.startDate || entity?.date,
  ).slice(0, 10);
}

export function evaluateEventSeoQuality(entity = {}, todayIso = new Date().toISOString().slice(0, 10)) {
  const result = baseQuality(entity, "event", 80);
  const endDate = resolveEventEndDate(entity);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) result.reasons.push("missing-date");
  else if (endDate < todayIso) result.reasons.push("expired-event");
  return { ...result, indexable: result.reasons.length === 0 };
}

export function evaluateServiceSeoQuality(entity = {}) {
  const result = baseQuality(entity, "service", 90);
  if (!cleanText(entity?.type)) result.reasons.push("missing-type");
  if (!cleanText(entity?.location) && !cleanText(entity?.provider_name)) {
    result.reasons.push("missing-provider-context");
  }
  return { ...result, indexable: result.reasons.length === 0 };
}

export function resolveEntityLastModified(entity = {}) {
  const candidates = [
    entity?.updated_at,
    entity?.updatedAt,
    entity?.lastChecked,
    entity?.last_checked,
    entity?.created_at,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const date = new Date(candidate);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
}

export function descriptionFingerprint(entity = {}) {
  return cleanText(entity?.description)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function excludeDuplicateEntityCopy(rows = []) {
  const counts = new Map();
  for (const row of rows) {
    const fingerprint = descriptionFingerprint(row);
    if (fingerprint.length < 80) continue;
    counts.set(fingerprint, (counts.get(fingerprint) || 0) + 1);
  }

  return rows.filter((row) => {
    const fingerprint = descriptionFingerprint(row);
    return !fingerprint || (counts.get(fingerprint) || 0) <= 1;
  });
}
