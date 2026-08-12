import { hasRouteReadyEvidence, isEligibleNightlifePlace } from "./nightlifeIndexModel.js";

export const SAFETY_INDEX_MINIMUM_PLACES = 8;
export const SAFETY_COMPONENT_WEIGHTS = {
  legal: 20,
  rights: 25,
  safety: 15,
  evidence: 10,
  welcome: 15,
  route: 10,
  fallback: 5,
};

const LEVEL_VALUES = { good: 1, mixed: 0.5, risk: 0 };
const RELATIONS_VALUES = { legal: 1, restricted: 0.35, criminalized: 0 };
const UNION_VALUES = { marriage: 1, civil_union_or_partnership: 0.5, no_protection: 0 };
const GENDER_VALUES = { available: 1, restricted: 0.5, impossible: 0 };
const DISCRIMINATION_VALUES = { full_coverage: 1, partial_coverage: 0.5, limited_or_none: 0, unknown: 0 };
const CONFIDENCE_VALUES = { high: 1, medium: 0.65, low: 0.25 };
const POSITIVE_STAFF_SIGNAL = /\b(?:friendly|welcoming|warm|helpful|inclusive|kind|attentive|professional|safe space|all genders|consent|awareness|respect)\b/i;
const CAUTION_STAFF_SIGNAL = /\b(?:rude|abrupt|dismissive|transphob|homophob|discriminat|unsafe|unhelpful|service problem|loses people|uneven|inconsistent|varies by visit|mixed staff feedback)\b/i;
const UNSUPPORTED_EVIDENCE_STATUSES = new Set(["", "not_published", "profile_summary"]);

function roundOne(value) {
  return Number(Number(value || 0).toFixed(1));
}

function valueFrom(map, value) {
  return map[String(value || "").trim().toLowerCase()] ?? 0;
}

function sourceCount(profile = {}) {
  return [profile.source_legal_url, profile.source_rights_url, profile.source_safety_url]
    .filter((value) => Boolean(String(value || "").trim())).length;
}

export function normalizeSafetyCountry(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function hasEligibleRightsProfile(profile = {}) {
  return Boolean(profile?.country)
    && sourceCount(profile) >= 2
    && [profile.legal_level, profile.rights_level, profile.safety_level]
      .some((value) => ["good", "mixed", "risk"].includes(String(value || "").toLowerCase()));
}

export function getVenueWelcomeEvidence(place = {}) {
  const intel = place?.venue_intel || {};
  const topicEvidence = intel?.topic_evidence?.staff_inclusivity || {};
  const status = String(topicEvidence?.status || "").trim().toLowerCase();
  const urls = Array.isArray(topicEvidence?.source_urls) ? topicEvidence.source_urls : [];
  const hasSource = urls.some((value) => Boolean(String(value || "").trim()));
  if (!hasSource || UNSUPPORTED_EVIDENCE_STATUSES.has(status)) return null;

  const text = String(intel?.staff_inclusivity || "").trim();
  const positive = POSITIVE_STAFF_SIGNAL.test(text);
  const caution = CAUTION_STAFF_SIGNAL.test(text);
  if (positive && caution) return 0.4;
  if (caution) return 0;
  if (positive) return 1;
  return 0.55;
}

export function scoreSafetyCity({ city = "", country = "", profile = null, places = [] } = {}) {
  if (!hasEligibleRightsProfile(profile)) return null;
  const eligiblePlaces = places.filter(isEligibleNightlifePlace);
  const placeCount = eligiblePlaces.length;
  if (placeCount < SAFETY_INDEX_MINIMUM_PLACES) return null;

  const legal = SAFETY_COMPONENT_WEIGHTS.legal * (
    0.4 * valueFrom(LEVEL_VALUES, profile.legal_level)
    + 0.6 * valueFrom(RELATIONS_VALUES, profile.same_sex_relations_status)
  );
  const rights = SAFETY_COMPONENT_WEIGHTS.rights * (
    0.4 * valueFrom(LEVEL_VALUES, profile.rights_level)
    + 0.24 * valueFrom(UNION_VALUES, profile.union_status)
    + 0.16 * valueFrom(GENDER_VALUES, profile.legal_gender_recognition_status)
    + 0.2 * valueFrom(DISCRIMINATION_VALUES, profile.anti_discrimination_status)
  );
  const safety = SAFETY_COMPONENT_WEIGHTS.safety * valueFrom(LEVEL_VALUES, profile.safety_level);
  const evidence = 4 * valueFrom(CONFIDENCE_VALUES, profile.confidence)
    + 6 * (sourceCount(profile) / 3);
  const welcomeValues = eligiblePlaces.map(getVenueWelcomeEvidence).filter((value) => value !== null);
  const welcome = SAFETY_COMPONENT_WEIGHTS.welcome * (
    welcomeValues.reduce((sum, value) => sum + value, 0) / placeCount
  );
  const route = SAFETY_COMPONENT_WEIGHTS.route * (
    eligiblePlaces.filter(hasRouteReadyEvidence).length / placeCount
  );
  const fallback = SAFETY_COMPONENT_WEIGHTS.fallback * Math.sqrt(Math.min(placeCount, 20) / 20);
  const rawScores = { legal, rights, safety, evidence, welcome, route, fallback };

  return {
    city,
    country,
    score: roundOne(Object.values(rawScores).reduce((sum, value) => sum + value, 0)),
    places: placeCount,
    welcomeEvidence: welcomeValues.length,
    routeReadyPlaces: eligiblePlaces.filter(hasRouteReadyEvidence).length,
    sourceCount: sourceCount(profile),
    confidence: String(profile.confidence || "low").toLowerCase(),
    scores: Object.fromEntries(Object.entries(rawScores).map(([key, value]) => [key, roundOne(value)])),
  };
}
