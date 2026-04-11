const QUALITY_KEY = "qa_quality_meta";
const STALE_DAYS = 120;

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function buildKey(targetType, targetId) {
  return `${targetType}:${String(targetId)}`;
}

export function getQualityMap() {
  if (typeof window === "undefined") return {};
  return safeParse(window.localStorage.getItem(QUALITY_KEY), {});
}

export function saveQualityMap(map) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUALITY_KEY, JSON.stringify(map));
}

export function upsertQuality({
  targetType,
  targetId,
  source = "",
  lastChecked = "",
  verified = false,
}) {
  if (typeof window === "undefined" || !targetType || !targetId) return null;

  const map = getQualityMap();
  const key = buildKey(targetType, targetId);
  const value = {
    targetType,
    targetId: String(targetId),
    source: source.trim(),
    lastChecked: lastChecked || "",
    verified: Boolean(verified),
    updatedAt: new Date().toISOString(),
  };

  map[key] = value;
  saveQualityMap(map);
  return value;
}

export function getEntityQuality({ targetType, targetId, entity = null, map = null }) {
  const qualityMap = map || getQualityMap();
  const key = buildKey(targetType, targetId);
  const fromMap = qualityMap[key];

  if (fromMap) return fromMap;

  return {
    targetType,
    targetId: String(targetId),
    source: entity?.source || "",
    lastChecked: entity?.lastChecked || "",
    verified: Boolean(entity?.verified),
    updatedAt: "",
  };
}

export function getQualityStatus(quality) {
  const lastCheckedDate = quality?.lastChecked ? new Date(quality.lastChecked) : null;
  const hasValidDate = Boolean(lastCheckedDate && !Number.isNaN(lastCheckedDate.getTime()));
  const staleCutoff = new Date();
  staleCutoff.setDate(staleCutoff.getDate() - STALE_DAYS);

  const stale = !hasValidDate || lastCheckedDate < staleCutoff;
  const verified = Boolean(quality?.verified);

  if (verified && !stale) {
    return {
      label: "Verified",
      tone: "verified",
      stale: false,
    };
  }

  if (stale) {
    return {
      label: "Needs refresh",
      tone: "stale",
      stale: true,
    };
  }

  return {
    label: "Unverified",
    tone: "neutral",
    stale: false,
  };
}
