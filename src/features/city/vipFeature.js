export const PRIVATE_EVENT_TYPES = [
  { value: "afterparty", label: "Afterparty" },
  { value: "chill", label: "Chill" },
  { value: "private_party", label: "Private party" },
];

export const PRIVATE_EVENT_TYPE_LABELS = Object.fromEntries(
  PRIVATE_EVENT_TYPES.map((entry) => [entry.value, entry.label]),
);

export function formatDateTime(value) {
  if (!value) return "Time TBA";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Time TBA";
  return parsed.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getPrivateEventStatus(event = {}, now = Date.now()) {
  const startTs = new Date(event.start_at || event.startAt || "").getTime();
  const endTs = new Date(event.end_at || event.endAt || event.expires_at || event.expiresAt || "").getTime();

  if (Number.isFinite(startTs) && startTs > now) {
    return { key: "upcoming", label: "Starting soon" };
  }
  if (Number.isFinite(endTs) && endTs <= now) {
    return { key: "ended", label: "Ended" };
  }
  return { key: "live", label: "Live now" };
}

export function combineDateAndTime(dateValue = "", timeValue = "") {
  const datePart = String(dateValue || "").trim();
  const timePart = String(timeValue || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;
  if (!/^\d{2}:\d{2}$/.test(timePart)) return null;
  const parsed = new Date(`${datePart}T${timePart}:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function formatEndsIn(value, now = Date.now()) {
  const expiresTs = new Date(value || "").getTime();
  if (!Number.isFinite(expiresTs)) return "";
  const diffMs = expiresTs - now;
  if (diffMs <= 0) return "Ended";
  const totalMinutes = Math.max(1, Math.floor(diffMs / (60 * 1000)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `Ends in ${minutes}m`;
  if (hours >= 24) return `Ends in ${hours}h`;
  return `Ends in ${hours}h ${minutes}m`;
}

export function fallbackMemberAlias(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "Member";
  if (raw.includes("@")) return raw.split("@")[0] || "Member";
  if (raw.length <= 8) return raw;
  return `${raw.slice(0, 8)}...`;
}

export function arePrivateEventsEquivalent(nextRows = [], prevRows = []) {
  const next = Array.isArray(nextRows) ? nextRows : [];
  const prev = Array.isArray(prevRows) ? prevRows : [];
  if (next.length !== prev.length) return false;

  for (let index = 0; index < next.length; index += 1) {
    const a = next[index] || {};
    const b = prev[index] || {};
    if (String(a.id || "") !== String(b.id || "")) return false;
    if (String(a.status || "") !== String(b.status || "")) return false;
    if (String(a.updated_at || "") !== String(b.updated_at || "")) return false;
    if (String(a.expires_at || "") !== String(b.expires_at || "")) return false;
  }
  return true;
}

export function areStringMapsEqual(nextMap = {}, prevMap = {}) {
  const nextKeys = Object.keys(nextMap || {});
  const prevKeys = Object.keys(prevMap || {});
  if (nextKeys.length !== prevKeys.length) return false;
  for (const key of nextKeys) {
    if (String(nextMap[key] || "") !== String(prevMap[key] || "")) return false;
  }
  return true;
}

export function areRequestMapsEqual(nextMap = {}, prevMap = {}) {
  const nextKeys = Object.keys(nextMap || {});
  const prevKeys = Object.keys(prevMap || {});
  if (nextKeys.length !== prevKeys.length) return false;

  for (const key of nextKeys) {
    const nextRows = Array.isArray(nextMap[key]) ? nextMap[key] : [];
    const prevRows = Array.isArray(prevMap[key]) ? prevMap[key] : [];
    if (nextRows.length !== prevRows.length) return false;

    for (let idx = 0; idx < nextRows.length; idx += 1) {
      const a = nextRows[idx] || {};
      const b = prevRows[idx] || {};
      if (String(a.id || "") !== String(b.id || "")) return false;
      if (String(a.status || "") !== String(b.status || "")) return false;
      if (String(a.updated_at || a.created_at || "") !== String(b.updated_at || b.created_at || "")) return false;
    }
  }
  return true;
}
