const CHECKIN_LOOKBACK_HOURS = 72;
const INCIDENT_LOOKBACK_DAYS = 45;
const LIVE_SIGNAL_LOOKBACK_HOURS = 24;

function toMs(value) {
  const timestamp = new Date(value || "").getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function timeDecayWeight(ageMs, halfLifeHours) {
  if (!Number.isFinite(ageMs) || ageMs < 0) return 0;
  const halfLifeMs = halfLifeHours * 60 * 60 * 1000;
  if (!Number.isFinite(halfLifeMs) || halfLifeMs <= 0) return 0;
  return Math.pow(0.5, ageMs / halfLifeMs);
}

function normalizePlaceId(value) {
  return String(value || "").trim();
}

function makeBaseSignal() {
  return {
    score: 62,
    shields: 3,
    label: "Low data",
    tone: "neutral",
    confidence: "low",
    recentCheckins: 0,
    welcomingSignals: 0,
    openIncidents: 0,
    safetyReviewAvg: null,
    safetyReviewCount: 0,
    lastUpdatedMs: null,
    details: {
      checkinBoost: 0,
      welcomingBoost: 0,
      incidentPenalty: 0,
      safetyReviewBoost: 0,
      dataPoints: 0,
    },
  };
}

function classifySignal(score, dataPoints) {
  if (dataPoints < 2) {
    return {
      label: "Low data",
      tone: "neutral",
      confidence: "low",
    };
  }
  if (score >= 78) {
    return {
      label: "Safe now",
      tone: "safe",
      confidence: "high",
    };
  }
  if (score >= 58) {
    return {
      label: "Mixed",
      tone: "mixed",
      confidence: "medium",
    };
  }
  return {
    label: "Caution",
    tone: "risk",
    confidence: "medium",
  };
}

export function getSafetyToneClass(tone = "neutral") {
  if (tone === "safe") {
    return "border-emerald-200/24 bg-emerald-200/10 text-emerald-100";
  }
  if (tone === "mixed") {
    return "border-amber-200/24 bg-amber-200/10 text-amber-100";
  }
  if (tone === "risk") {
    return "border-rose-200/24 bg-rose-200/10 text-rose-100";
  }
  return "border-white/16 bg-white/8 text-white/78";
}

export function formatSafetyShields(count = 0) {
  const safeCount = clamp(Number(count) || 0, 1, 5);
  return "🛡".repeat(safeCount);
}

export function buildPlaceSafetySignalMap({
  places = [],
  checkins = [],
  reports = [],
  liveSignals = [],
  reviewSafety = [],
  nowTs = Date.now(),
} = {}) {
  const placeIds = new Set(
    (Array.isArray(places) ? places : [])
      .map((place) => normalizePlaceId(place?.id))
      .filter(Boolean),
  );

  const map = Object.fromEntries(
    [...placeIds].map((placeId) => [placeId, makeBaseSignal()]),
  );

  const checkinCutoffMs = nowTs - CHECKIN_LOOKBACK_HOURS * 60 * 60 * 1000;
  const incidentCutoffMs = nowTs - INCIDENT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
  const liveCutoffMs = nowTs - LIVE_SIGNAL_LOOKBACK_HOURS * 60 * 60 * 1000;

  for (const row of Array.isArray(checkins) ? checkins : []) {
    const placeId = normalizePlaceId(row?.place_id);
    if (!placeIds.has(placeId)) continue;
    const checkedAtMs = toMs(row?.checked_in_at);
    if (!checkedAtMs || checkedAtMs < checkinCutoffMs) continue;

    const ageMs = Math.max(0, nowTs - checkedAtMs);
    const weight = timeDecayWeight(ageMs, 18);
    const signal = map[placeId];
    signal.recentCheckins += 1;
    signal.details.checkinBoost += 4.2 * weight;
    signal.details.dataPoints += 1;
    signal.lastUpdatedMs = Math.max(signal.lastUpdatedMs || 0, checkedAtMs);
  }

  for (const row of Array.isArray(liveSignals) ? liveSignals : []) {
    const placeId = normalizePlaceId(row?.place_id);
    if (!placeIds.has(placeId)) continue;
    const createdAtMs = toMs(row?.created_at);
    if (!createdAtMs || createdAtMs < liveCutoffMs) continue;

    const signalKey = String(row?.signal_key || "").trim();
    const ageMs = Math.max(0, nowTs - createdAtMs);
    const weight = timeDecayWeight(ageMs, 8);
    const signal = map[placeId];

    if (signalKey === "dancing" || signalKey === "packed") {
      signal.welcomingSignals += 1;
      signal.details.welcomingBoost += 2.7 * weight;
      signal.details.dataPoints += 1;
    } else if (signalKey === "off_vibe") {
      signal.details.incidentPenalty += 2.2 * weight;
      signal.details.dataPoints += 1;
    }

    signal.lastUpdatedMs = Math.max(signal.lastUpdatedMs || 0, createdAtMs);
  }

  for (const row of Array.isArray(reports) ? reports : []) {
    const placeId = normalizePlaceId(row?.target_id ?? row?.targetId);
    if (!placeIds.has(placeId)) continue;

    const createdAtMs = toMs(row?.created_at ?? row?.createdAt);
    if (!createdAtMs || createdAtMs < incidentCutoffMs) continue;

    const status = String(row?.status || "open").trim().toLowerCase();
    const unresolved = status !== "resolved" && status !== "closed";
    const ageMs = Math.max(0, nowTs - createdAtMs);
    const weight = timeDecayWeight(ageMs, unresolved ? 72 : 28);
    const signal = map[placeId];

    signal.openIncidents += unresolved ? 1 : 0;
    signal.details.incidentPenalty += unresolved ? 9.5 * weight : 2.8 * weight;
    signal.details.dataPoints += unresolved ? 2 : 1;
    signal.lastUpdatedMs = Math.max(signal.lastUpdatedMs || 0, createdAtMs);
  }

  for (const row of Array.isArray(reviewSafety) ? reviewSafety : []) {
    const placeId = normalizePlaceId(row?.place_id);
    if (!placeIds.has(placeId)) continue;
    const safetyRaw = Number(row?.safety);
    if (!Number.isFinite(safetyRaw) || safetyRaw <= 0) continue;
    const safety = clamp(Math.round(safetyRaw), 1, 5);
    const createdAtMs = toMs(row?.created_at);
    const ageMs = Number.isFinite(createdAtMs) ? Math.max(0, nowTs - createdAtMs) : 0;
    const weight = timeDecayWeight(ageMs, 240);
    const signal = map[placeId];

    signal.safetyReviewCount += 1;
    if (!Number.isFinite(signal.safetyReviewAvg) || signal.safetyReviewAvg === null) {
      signal.safetyReviewAvg = safety;
    } else {
      const nextCount = signal.safetyReviewCount;
      signal.safetyReviewAvg =
        ((signal.safetyReviewAvg * (nextCount - 1)) + safety) / nextCount;
    }
    signal.details.safetyReviewBoost += (safety - 3) * 4.5 * Math.max(weight, 0.35);
    signal.details.dataPoints += 1;
    if (createdAtMs) {
      signal.lastUpdatedMs = Math.max(signal.lastUpdatedMs || 0, createdAtMs);
    }
  }

  for (const placeId of placeIds) {
    const signal = map[placeId];
    const scoreRaw =
      58 +
      signal.details.checkinBoost +
      signal.details.welcomingBoost -
      signal.details.incidentPenalty +
      signal.details.safetyReviewBoost;
    const score = Math.round(clamp(scoreRaw, 0, 100));
    const shields = clamp(Math.round(score / 20), 1, 5);
    const classification = classifySignal(score, signal.details.dataPoints);

    map[placeId] = {
      ...signal,
      score,
      shields,
      label: classification.label,
      tone: classification.tone,
      confidence: classification.confidence,
      safetyReviewAvg:
        Number.isFinite(signal.safetyReviewAvg) && signal.safetyReviewAvg !== null
          ? Number(signal.safetyReviewAvg.toFixed(1))
          : null,
    };
  }

  return map;
}
