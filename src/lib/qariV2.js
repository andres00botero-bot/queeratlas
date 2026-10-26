export const QARI_V2_METHODOLOGY_VERSION = "2.0-2026";
export const QARI_V2_REVIEW_INTERVAL_MONTHS = 6;

export const QARI_V2_LEVELS = Object.freeze(["lower", "moderate", "high", "extreme"]);
export const QARI_V2_LEVEL_RANK = Object.freeze({ lower: 0, moderate: 1, high: 2, extreme: 3 });
export const QARI_V2_DIMENSIONS = Object.freeze(["legal", "stateRepression", "digitalExposure", "socialCivil"]);
export const QARI_V2_EVIDENCE_GRADES = Object.freeze(["A", "B", "C"]);
export const QARI_V2_EVIDENCE_AVAILABILITY = Object.freeze(["good", "limited", "opaque", "unknown"]);
export const QARI_V2_TRENDS = Object.freeze(["improving", "stable", "deteriorating", "insufficient_new_evidence"]);
export const QARI_V2_TIER_DETAILS = Object.freeze({
  lower: { label: "Lower risk", mapTier: "open", color: "#3b82f6" },
  moderate: { label: "Moderate", mapTier: "watch", color: "#facc15" },
  high: { label: "High risk", mapTier: "caution", color: "#fb923c" },
  extreme: { label: "Extreme high risk", mapTier: "restricted", color: "#ef4444" },
});

// Rules determine a minimum level for one dimension. They do not generate a
// faux-precise country score and must be backed by evidence grade A or B.
export const QARI_V2_RULES = Object.freeze([
  { code: "L-01", dimension: "legal", level: "extreme", label: "Death penalty prescribed or legally possible", minimumEvidenceGrade: "A" },
  { code: "L-02", dimension: "legal", level: "high", label: "Active custodial criminalisation of consensual same-sex conduct", minimumEvidenceGrade: "A" },
  { code: "L-03", dimension: "legal", level: "high", label: "General restriction on LGBTIQ+ expression in media, online or public life", minimumEvidenceGrade: "A" },
  { code: "L-04", dimension: "legal", level: "moderate", label: "Restricted expression rule limited to education, minors or a defined setting", minimumEvidenceGrade: "A" },
  { code: "L-05", dimension: "legal", level: "high", label: "Restriction on LGBTIQ+ association, registration, assembly or Pride", minimumEvidenceGrade: "A" },
  { code: "L-06", dimension: "legal", level: "extreme", label: "Criminal liability for LGBTIQ+ organising, participation or advocacy", minimumEvidenceGrade: "A" },
  { code: "L-07", dimension: "legal", level: "high", label: "De facto criminalisation through morality, debauchery or comparable provisions", minimumEvidenceGrade: "A" },
  { code: "L-08", dimension: "legal", level: "moderate", label: "Statutory exclusion of same-sex families or legal gender recognition", minimumEvidenceGrade: "A" },
  { code: "L-09", dimension: "legal", level: "moderate", label: "Specific statutory restriction on gender-affirming healthcare", minimumEvidenceGrade: "A" },
  { code: "R-01", dimension: "stateRepression", level: "high", label: "Documented targeted raid, detention or prosecution by state authorities", minimumEvidenceGrade: "B" },
  { code: "R-02", dimension: "stateRepression", level: "extreme", label: "Coordinated or repeated state action targeting LGBTIQ+ people, spaces or organisations", minimumEvidenceGrade: "B" },
  { code: "R-03", dimension: "stateRepression", level: "extreme", label: "Systematic state persecution, organised targeting or mass detention", minimumEvidenceGrade: "A" },
  { code: "D-01", dimension: "digitalExposure", level: "high", label: "Documented state use of apps or social media for LGBTIQ+ entrapment", minimumEvidenceGrade: "B" },
  { code: "D-02", dimension: "digitalExposure", level: "high", label: "Documented state blocking of LGBTIQ+ websites, accounts or information", minimumEvidenceGrade: "B" },
  { code: "D-03", dimension: "digitalExposure", level: "high", label: "Documented seizure or use of private digital material in LGBTIQ+ cases", minimumEvidenceGrade: "B" },
  { code: "D-04", dimension: "digitalExposure", level: "moderate", label: "Specific legal or technical capacity for digital censorship of LGBTIQ+ expression", minimumEvidenceGrade: "A" },
  { code: "S-01", dimension: "socialCivil", level: "high", label: "Current credible evidence of widespread anti-LGBTIQ+ violence or harassment", minimumEvidenceGrade: "B" },
  { code: "S-02", dimension: "socialCivil", level: "high", label: "LGBTIQ+ people lack practical access to reporting, protection or civil-society support", minimumEvidenceGrade: "B" },
]);

const ruleByCode = new Map(QARI_V2_RULES.map((rule) => [rule.code, rule]));

function normalizeLevel(value) {
  return QARI_V2_LEVELS.includes(value) ? value : "lower";
}

function gradeRank(value) {
  return ({ A: 3, B: 2, C: 1 })[String(value || "").toUpperCase()] || 0;
}

function eligibleFinding(finding) {
  const rule = ruleByCode.get(finding?.ruleCode);
  if (!rule) return { eligible: false, reason: "unknown_rule", rule: null };
  if (gradeRank(finding.evidenceGrade) < gradeRank(rule.minimumEvidenceGrade)) {
    return { eligible: false, reason: "insufficient_evidence", rule };
  }
  return { eligible: true, reason: "", rule };
}

export function getQariV2Rule(ruleCode) {
  return ruleByCode.get(ruleCode) || null;
}

export function addQariV2Months(dateValue, months = QARI_V2_REVIEW_INTERVAL_MONTHS) {
  const date = new Date(`${String(dateValue).slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString().slice(0, 10);
}

function eligibleLowerDimensionEvidence(lowerDimensionEvidence = {}) {
  return QARI_V2_DIMENSIONS.flatMap((dimension) => {
    const evidence = lowerDimensionEvidence?.[dimension];
    if (!evidence || !String(evidence.sourceLabel || "").trim() || !/^https:\/\//.test(String(evidence.sourceUrl || ""))) return [];
    if (gradeRank(evidence.evidenceGrade) < gradeRank("A")) return [];
    return [{ dimension, ...evidence }];
  });
}

export function assessQariV2({ findings = [], lowerDimensionEvidence = {}, evidenceAvailability = {}, reviewedAt = null } = {}) {
  const eligible = [];
  const monitor = [];
  const confirmedLower = eligibleLowerDimensionEvidence(lowerDimensionEvidence);

  for (const finding of findings) {
    const result = eligibleFinding(finding);
    if (result.eligible) eligible.push({ ...finding, rule: result.rule });
    else monitor.push({ ...finding, reason: result.reason, rule: result.rule });
  }

  const dimensions = Object.fromEntries(QARI_V2_DIMENSIONS.map((dimension) => {
    const matches = eligible.filter((finding) => finding.rule.dimension === dimension);
    const level = matches.reduce((highest, finding) => (
      QARI_V2_LEVEL_RANK[finding.rule.level] > QARI_V2_LEVEL_RANK[highest] ? finding.rule.level : highest
    ), "lower");
    const availability = QARI_V2_EVIDENCE_AVAILABILITY.includes(evidenceAvailability[dimension])
      ? evidenceAvailability[dimension]
      : "unknown";
    const lowerEvidence = confirmedLower.find((item) => item.dimension === dimension);
    return [dimension, {
      level,
      availability,
      triggeredRules: matches.map((finding) => finding.rule.code),
      lowerEvidence: lowerEvidence || null,
      unknown: matches.length === 0 && !lowerEvidence && availability === "unknown",
    }];
  }));

  const highestLevel = Object.values(dimensions).reduce((highest, dimension) => (
    QARI_V2_LEVEL_RANK[dimension.level] > QARI_V2_LEVEL_RANK[highest] ? dimension.level : highest
  ), "lower");
  const elevatedDimensionCount = Object.values(dimensions)
    .filter((dimension) => QARI_V2_LEVEL_RANK[dimension.level] >= QARI_V2_LEVEL_RANK.high).length;

  return {
    methodologyVersion: QARI_V2_METHODOLOGY_VERSION,
    // An empty evidence record is unknown. A source-verified lower dimension
    // is distinct from both unknown and an inferred lower-risk assessment.
    level: eligible.length === 0 && confirmedLower.length === 0 ? null : highestLevel,
    isUnknown: eligible.length === 0 && confirmedLower.length === 0,
    elevatedDimensionCount,
    dimensions,
    eligibleFindings: eligible,
    lowerDimensionEvidence: confirmedLower,
    monitorFindings: monitor,
    reviewedAt,
    nextReviewAt: reviewedAt ? addQariV2Months(reviewedAt) : null,
  };
}

export function createQariV2Profile({
  destinationKey,
  country,
  summary,
  trend = "insufficient_new_evidence",
  reviewedAt,
  findings = [],
  lowerDimensionEvidence = {},
  evidenceAvailability = {},
  isPublished = false,
} = {}) {
  const assessment = assessQariV2({ findings, lowerDimensionEvidence, evidenceAvailability, reviewedAt });
  if (!String(destinationKey || "").trim() || !String(country || "").trim()) return null;
  if (!String(summary || "").trim() || !QARI_V2_TRENDS.includes(trend)) return null;
  if (assessment.isUnknown) return null;
  if (assessment.eligibleFindings.some((finding) => (
    !String(finding.sourceLabel || "").trim()
    || !/^https:\/\//.test(String(finding.sourceUrl || ""))
  ))) return null;

  return {
    destinationKey: String(destinationKey).trim(),
    scopeType: "country",
    country: String(country).trim(),
    summary: String(summary).trim(),
    trend,
    isPublished: Boolean(isPublished),
    ...assessment,
  };
}

export function toPublicQariV2Profile(profile) {
  if (!profile?.isPublished || !profile?.level || !QARI_V2_TIER_DETAILS[profile.level]) return null;
  return {
    ...profile,
    isQariV2: true,
    tier: { key: profile.level, ...QARI_V2_TIER_DETAILS[profile.level] },
    sources: profile.eligibleFindings.map((finding) => ({
      axis: finding.rule.dimension,
      label: finding.sourceLabel,
      url: finding.sourceUrl,
    })).concat(profile.lowerDimensionEvidence.map((evidence) => ({
      axis: evidence.dimension,
      label: evidence.sourceLabel,
      url: evidence.sourceUrl,
    }))),
  };
}
