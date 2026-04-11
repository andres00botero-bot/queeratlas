const REPORTS_KEY = "qa_reports";
const BLOCKED_KEY = "qa_blocked_items";

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function getReports() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(REPORTS_KEY), []);
}

export function addReport({ targetType, targetId, city = "", title = "", reason = "" }) {
  if (typeof window === "undefined") return null;

  const report = {
    id: `report-${Date.now()}`,
    targetType,
    targetId: String(targetId),
    city,
    title,
    reason: reason || "No reason provided",
    status: "open",
    createdAt: new Date().toISOString(),
  };

  const current = getReports();
  window.localStorage.setItem(REPORTS_KEY, JSON.stringify([report, ...current]));
  return report;
}

export function saveReports(reports) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

export function getBlockedItems() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(BLOCKED_KEY), []);
}

export function saveBlockedItems(items) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BLOCKED_KEY, JSON.stringify(items));
}

export function blockItem({ targetType, targetId, title = "", city = "" }) {
  if (typeof window === "undefined") return null;

  const blocked = getBlockedItems();
  const target = String(targetId);
  const exists = blocked.some(
    (item) => item.targetType === targetType && String(item.targetId) === target
  );

  if (exists) return blocked.find(
    (item) => item.targetType === targetType && String(item.targetId) === target
  ) || null;

  const record = {
    id: `block-${Date.now()}`,
    targetType,
    targetId: target,
    title,
    city,
    blockedAt: new Date().toISOString(),
  };

  saveBlockedItems([record, ...blocked]);
  return record;
}

export function unblockItem({ targetType, targetId }) {
  if (typeof window === "undefined") return;

  const target = String(targetId);
  const blocked = getBlockedItems().filter(
    (item) => !(item.targetType === targetType && String(item.targetId) === target)
  );

  saveBlockedItems(blocked);
}
