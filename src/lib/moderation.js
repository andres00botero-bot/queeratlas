import { supabase } from "@/lib/supabase";

const REPORTS_KEY = "qa_reports";
const BLOCKED_KEY = "qa_blocked_items";
const REPORTS_TABLE = "qa_reports";
const BLOCKED_TABLE = "qa_blocked_items";
const BLOCKED_UPDATED_EVENT = "qa:blocked-updated";
const REPORTS_UPDATED_EVENT = "qa:reports-updated";

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function isMissingTableError(error) {
  if (!error) return false;
  const code = String(error.code || "");
  const message = String(error.message || "").toLowerCase();
  return code === "42P01" || code === "PGRST205" || message.includes("does not exist");
}

function isPermissionError(error) {
  if (!error) return false;
  const code = String(error.code || "");
  const message = String(error.message || "").toLowerCase();
  return code === "42501" || message.includes("permission denied");
}

function emitModerationEvent(eventName) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(eventName));
}

function writeReportsLocal(reports) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  emitModerationEvent(REPORTS_UPDATED_EVENT);
}

function writeBlockedLocal(items) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BLOCKED_KEY, JSON.stringify(items));
  emitModerationEvent(BLOCKED_UPDATED_EVENT);
}

function mapReportRow(row) {
  return {
    id: String(row.id),
    targetType: row.target_type || "",
    targetId: String(row.target_id || ""),
    city: row.city || "",
    title: row.title || "",
    reason: row.reason || "No reason provided",
    status: row.status || "open",
    createdAt: row.created_at || new Date().toISOString(),
    resolvedAt: row.resolved_at || null,
  };
}

function mapBlockedRow(row) {
  return {
    id: String(row.id),
    targetType: row.target_type || "",
    targetId: String(row.target_id || ""),
    title: row.title || "",
    city: row.city || "",
    blockedAt: row.blocked_at || new Date().toISOString(),
  };
}

async function getCurrentMemberEmail() {
  const { data } = await supabase.auth.getUser();
  return String(data?.user?.email || "").trim().toLowerCase();
}

export function getReports() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(REPORTS_KEY), []);
}

export function getBlockedItems() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(BLOCKED_KEY), []);
}

export async function syncBlockedItemsFromCloud() {
  const localBlocked = getBlockedItems();
  const blockedRes = await supabase
    .from(BLOCKED_TABLE)
    .select("*")
    .order("blocked_at", { ascending: false });

  if (isMissingTableError(blockedRes.error)) {
    return {
      blockedItems: localBlocked,
      warning: "Moderation cloud sync unavailable right now.",
    };
  }

  if (isPermissionError(blockedRes.error)) {
    return {
      blockedItems: localBlocked,
      warning: "",
    };
  }

  if (blockedRes.error) {
    return {
      blockedItems: localBlocked,
      warning: "Could not sync moderation from cloud. Using local backup.",
    };
  }

  const blockedItems = (blockedRes.data || []).map(mapBlockedRow);
  writeBlockedLocal(blockedItems);

  return { blockedItems, warning: "" };
}

export async function syncModerationFromCloud(options = {}) {
  const includeReports = options.includeReports !== false;
  const localReports = getReports();
  const localBlocked = getBlockedItems();
  const blockedSync = await syncBlockedItemsFromCloud();
  const blockedItems = blockedSync.blockedItems || localBlocked;

  if (!includeReports) {
    return {
      reports: localReports,
      blockedItems,
      warning: blockedSync.warning || "",
    };
  }

  const reportsRes = await supabase
    .from(REPORTS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (isMissingTableError(reportsRes.error)) {
    return {
      reports: localReports,
      blockedItems,
      warning: "Moderation cloud sync unavailable right now.",
    };
  }

  if (isPermissionError(reportsRes.error)) {
    return {
      reports: localReports,
      blockedItems,
      warning: blockedSync.warning || "",
    };
  }

  if (reportsRes.error) {
    return {
      reports: localReports,
      blockedItems,
      warning: "Could not sync moderation from cloud. Using local backup.",
    };
  }

  const reports = (reportsRes.data || []).map(mapReportRow);
  writeReportsLocal(reports);

  return { reports, blockedItems, warning: blockedSync.warning || "" };
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
  writeReportsLocal([report, ...current]);

  queueMicrotask(async () => {
    const createdByEmail = await getCurrentMemberEmail();
    try {
      await supabase.from(REPORTS_TABLE).insert({
        id: report.id,
        target_type: report.targetType,
        target_id: report.targetId,
        city: report.city || null,
        title: report.title || null,
        reason: report.reason,
        status: report.status,
        created_by_email: createdByEmail || null,
      });
    } catch {
      // local fallback stays active when cloud write fails
    }
  });

  return report;
}

export function saveReports(reports) {
  if (typeof window === "undefined") return;
  writeReportsLocal(reports);

  queueMicrotask(async () => {
    const createdByEmail = await getCurrentMemberEmail();
    const payload = reports.map((report) => ({
      id: String(report.id),
      target_type: report.targetType || "",
      target_id: String(report.targetId || ""),
      city: report.city || null,
      title: report.title || null,
      reason: report.reason || "No reason provided",
      status: report.status || "open",
      created_by_email: createdByEmail || null,
      resolved_at: report.resolvedAt || null,
    }));

    if (payload.length === 0) return;
    try {
      await supabase.from(REPORTS_TABLE).upsert(payload, { onConflict: "id" });
    } catch {
      // local fallback stays active when cloud write fails
    }
  });
}

export async function removeReport(reportId) {
  if (typeof window === "undefined") return [];
  const next = getReports().filter((report) => String(report.id) !== String(reportId));
  writeReportsLocal(next);

  try {
    await supabase.from(REPORTS_TABLE).delete().eq("id", String(reportId));
  } catch {
    // local fallback stays active when cloud write fails
  }

  return next;
}

export function saveBlockedItems(items) {
  if (typeof window === "undefined") return;
  writeBlockedLocal(items);

  queueMicrotask(async () => {
    const payload = items.map((item) => ({
      id: String(item.id),
      target_type: item.targetType || "",
      target_id: String(item.targetId || ""),
      title: item.title || null,
      city: item.city || null,
      blocked_at: item.blockedAt || new Date().toISOString(),
    }));

    if (payload.length === 0) return;
    try {
      await supabase.from(BLOCKED_TABLE).upsert(payload, { onConflict: "id" });
    } catch {
      // local fallback stays active when cloud write fails
    }
  });
}

export function blockItem({ targetType, targetId, title = "", city = "" }) {
  if (typeof window === "undefined") return null;

  const blocked = getBlockedItems();
  const target = String(targetId);
  const exists = blocked.some(
    (item) => item.targetType === targetType && String(item.targetId) === target
  );

  if (exists) {
    return blocked.find(
      (item) => item.targetType === targetType && String(item.targetId) === target
    ) || null;
  }

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

  writeBlockedLocal(blocked);

  queueMicrotask(async () => {
    try {
      await supabase
        .from(BLOCKED_TABLE)
        .delete()
        .eq("target_type", targetType)
        .eq("target_id", target);
    } catch {
      // local fallback stays active when cloud write fails
    }
  });
}

export function subscribeBlockedItems(onChange) {
  if (typeof window === "undefined") return () => {};

  const handleEvent = () => {
    onChange(getBlockedItems());
  };

  const handleStorage = (event) => {
    if (!event || event.key === BLOCKED_KEY) {
      onChange(getBlockedItems());
    }
  };

  window.addEventListener(BLOCKED_UPDATED_EVENT, handleEvent);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(BLOCKED_UPDATED_EVENT, handleEvent);
    window.removeEventListener("storage", handleStorage);
  };
}
