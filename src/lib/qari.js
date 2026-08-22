export const QARI_METHODOLOGY_VERSION = "1.0";

export const QARI_WEIGHTS = Object.freeze({
  legal: 0.35,
  social: 0.4,
  digital: 0.25,
});

export const QARI_MAP_PALETTE = Object.freeze({
  open: { label: "Lower risk", color: "#3b82f6", showInLegend: true },
  steady: { label: "Lower context", color: "#22c55e", showInLegend: true },
  watch: { label: "Moderate", color: "#facc15", showInLegend: true },
  caution: { label: "High risk", color: "#fb923c", showInLegend: true },
  restricted: { label: "Extreme high risk", color: "#ef4444", showInLegend: true },
  unknown: { label: "Pending", color: "#64748b", showInLegend: false },
});

export const QARI_TIERS = Object.freeze({
  lower: {
    ...QARI_MAP_PALETTE.open,
    shortLabel: "Lower",
    min: 0,
    max: 20,
    mapTier: "open",
  },
  lowerContext: {
    ...QARI_MAP_PALETTE.steady,
    shortLabel: "Lower context",
    min: 21,
    max: 40,
    mapTier: "steady",
  },
  moderate: {
    ...QARI_MAP_PALETTE.watch,
    shortLabel: "Moderate",
    min: 41,
    max: 60,
    mapTier: "watch",
  },
  high: {
    ...QARI_MAP_PALETTE.caution,
    shortLabel: "High",
    min: 61,
    max: 80,
    mapTier: "caution",
  },
  extreme: {
    ...QARI_MAP_PALETTE.restricted,
    shortLabel: "Extreme",
    min: 81,
    max: 100,
    mapTier: "restricted",
  },
  unknown: {
    ...QARI_MAP_PALETTE.unknown,
    shortLabel: "Pending",
    min: null,
    max: null,
    mapTier: "unknown",
  },
});

export const QARI_RISK_FLOORS = Object.freeze({
  death_penalty: 90,
  active_criminalisation: 80,
  trans_criminalisation: 80,
  de_facto_criminalisation: 72,
  systematic_app_entrapment: 68,
});

export function clampQariAxis(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.min(100, Math.max(0, Math.round(number)));
}

export function calculateQari({ legalRisk, socialRisk, digitalRisk, riskFloor = 0 } = {}) {
  const legal = clampQariAxis(legalRisk);
  const social = clampQariAxis(socialRisk);
  const digital = clampQariAxis(digitalRisk);
  if ([legal, social, digital].some((value) => value === null)) return null;

  const weighted = Math.round(
    legal * QARI_WEIGHTS.legal +
      social * QARI_WEIGHTS.social +
      digital * QARI_WEIGHTS.digital,
  );

  return Math.max(weighted, clampQariAxis(riskFloor) || 0);
}

export function getQariTier(score) {
  const normalized = clampQariAxis(score);
  if (normalized === null) return { key: "unknown", ...QARI_TIERS.unknown };
  if (normalized <= 20) return { key: "lower", ...QARI_TIERS.lower };
  if (normalized <= 40) return { key: "lowerContext", ...QARI_TIERS.lowerContext };
  if (normalized <= 60) return { key: "moderate", ...QARI_TIERS.moderate };
  if (normalized <= 80) return { key: "high", ...QARI_TIERS.high };
  return { key: "extreme", ...QARI_TIERS.extreme };
}

export function normalizeQariProfile(profile = {}) {
  if (!profile || typeof profile !== "object") return null;

  const legalRisk = clampQariAxis(profile.legal_risk ?? profile.legalRisk);
  const socialRisk = clampQariAxis(profile.social_risk ?? profile.socialRisk);
  const digitalRisk = clampQariAxis(profile.digital_risk ?? profile.digitalRisk);
  const riskFloor = clampQariAxis(profile.risk_floor ?? profile.riskFloor) || 0;
  const calculatedScore = calculateQari({ legalRisk, socialRisk, digitalRisk, riskFloor });
  if (calculatedScore === null) return null;

  const storedScore = clampQariAxis(profile.qari_score ?? profile.qariScore);
  const score = storedScore === calculatedScore ? storedScore : calculatedScore;

  return {
    ...profile,
    destinationKey: String(profile.destination_key || profile.destinationKey || "").trim(),
    scopeType: String(profile.scope_type || profile.scopeType || "country").trim(),
    country: String(profile.country || "").trim(),
    cityKey: String(profile.city_key || profile.cityKey || "").trim(),
    legalRisk,
    socialRisk,
    digitalRisk,
    riskFloor,
    score,
    tier: getQariTier(score),
    confidence: String(profile.confidence || "medium").trim().toLowerCase(),
    summary: String(profile.summary || "").trim(),
    methodologyVersion: String(
      profile.methodology_version || profile.methodologyVersion || QARI_METHODOLOGY_VERSION,
    ).trim(),
    reviewedAt: profile.reviewed_at || profile.reviewedAt || null,
    sources: Array.isArray(profile.sources) ? profile.sources : [],
  };
}

export function qariMapTier(profile) {
  return normalizeQariProfile(profile)?.tier?.mapTier || "unknown";
}
