"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { getEntityQuality, getQualityMap, getQualityStatus, upsertQuality } from "@/lib/quality";
import {
  blockItem,
  getBlockedItems,
  getReports,
  removeReport,
  saveBlockedItems,
  saveReports,
  syncModerationFromCloud,
} from "@/lib/moderation";
import { readLocalJson, writeLocalJson } from "@/lib/storage";
import { getInitialKpiSummary, getKpiSummary } from "@/lib/analytics";
import PageOpeningState from "@/components/ui/PageOpeningState";
import { useActionToast } from "@/lib/useActionToast";
import ActionToast from "@/components/ui/ActionToast";

const FIXED_LOG_KEY = "qa_admin_fixed_log";
const AUDIT_LOG_KEY = "qa_admin_audit_log";
const ROUTINE_KEY = "qa_admin_weekly_routine";

function timeAgo(value) {
  if (!value) return "Recently";
  const diffHours = Math.round((new Date() - new Date(value)) / 3600000);
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

function formatTitle(value = "") {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isWithinDays(value, days) {
  if (!value) return false;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  const diff = Date.now() - parsed.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function toCsv(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escapeCell = (value) => {
    const text = String(value ?? "");
    const escaped = text.replace(/"/g, '""');
    return `"${escaped}"`;
  };
  const body = rows.map((row) => headers.map((key) => escapeCell(row[key])).join(","));
  return [headers.join(","), ...body].join("\n");
}

function formatDbError(error) {
  if (!error) return "Unknown error";
  const message = String(error.message || error.details || error.hint || "").trim();
  if (!message) return "Unknown error";
  return message;
}

export default function AdminPage() {
  const router = useRouter();
  const { isMember, isLoading: isAuthLoading, user, memberName } = useAuth();
  const { toast, showToast } = useActionToast();

  const [isReady, setIsReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [stats, setStats] = useState({
    places: 0,
    events: 0,
    globalEvents: 0,
    openReports: 0,
    blockedItems: 0,
  });
  const [reports, setReports] = useState([]);
  const [blockedItems, setBlockedItems] = useState([]);
  const [places, setPlaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [qualityMap, setQualityMap] = useState({});
  const [fixedLog, setFixedLog] = useState(() => readLocalJson(FIXED_LOG_KEY, {}));
  const [queueCityFilter, setQueueCityFilter] = useState("all");
  const [queueTypeFilter, setQueueTypeFilter] = useState("all");
  const [queueEntityFilter, setQueueEntityFilter] = useState("all");
  const [selectedReportIds, setSelectedReportIds] = useState([]);
  const [selectedQueueKeys, setSelectedQueueKeys] = useState([]);
  const [auditLog, setAuditLog] = useState(() => readLocalJson(AUDIT_LOG_KEY, []));
  const [weeklyRoutine, setWeeklyRoutine] = useState(() =>
    readLocalJson(ROUTINE_KEY, {
      queuePassDoneAt: "",
      newsPassDoneAt: "",
      linksPassDoneAt: "",
    })
  );
  const [warning, setWarning] = useState("");
  const [busyMap, setBusyMap] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState("");
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagRanAt, setDiagRanAt] = useState("");
  const [diagRows, setDiagRows] = useState([]);
  const [diagTestEmail, setDiagTestEmail] = useState("");
  const [diagMailState, setDiagMailState] = useState("");
  const [kpiSummary, setKpiSummary] = useState(() => getInitialKpiSummary(7));

  const loadAdminState = useCallback(async () => {
    setIsRefreshing(true);
    setWarning("");
    try {
      const [placesCountRes, eventsCountRes, globalEventsRes, moderationRes, placesRes, eventsRes] = await Promise.all([
        supabase.from("places_with_stats").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("global_events").select("*", { count: "exact", head: true }),
        syncModerationFromCloud(),
        supabase.from("places_with_stats").select("id,name,city,type"),
        supabase.from("events").select("id,name,city,date"),
      ]);

      const reportsRows = moderationRes?.reports || getReports();
      const blockedRows = moderationRes?.blockedItems || getBlockedItems();
      const placesRows = Array.isArray(placesRes.data) ? placesRes.data : [];
      const eventsRows = Array.isArray(eventsRes.data) ? eventsRes.data : [];

      setReports(reportsRows);
      setBlockedItems(blockedRows);
      setPlaces(placesRows);
      setEvents(eventsRows);
      setQualityMap(getQualityMap());
      setSelectedReportIds((current) =>
        current.filter((id) => reportsRows.some((row) => String(row.id) === String(id)))
      );
      setStats({
        places: Number(placesCountRes.count || 0),
        events: Number(eventsCountRes.count || 0),
        globalEvents: Number(globalEventsRes.count || 0),
        openReports: reportsRows.filter((item) => String(item.status || "open") === "open").length,
        blockedItems: blockedRows.length,
      });

      if (moderationRes?.warning) {
        setWarning(moderationRes.warning);
      }

      setLastSyncedAt(new Date().toISOString());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isMember) {
      localStorage.setItem("qa_redirect", "/admin");
      localStorage.setItem("qa_post_login_target", "/admin");
      router.replace("/?join=true");
      setIsReady(true);
      return;
    }

    queueMicrotask(async () => {
      let adminAccess = false;
      try {
        const rpcRes = await supabase.rpc("qa_is_admin");
        adminAccess = Boolean(rpcRes.data);
      } catch {
        const email = String(user?.email || "").trim().toLowerCase();
        const { data, error } = await supabase
          .from("qa_admin_users")
          .select("email")
          .eq("email", email)
          .maybeSingle();
        adminAccess = !error && Boolean(data);
      }

      setIsAdmin(adminAccess);
      setAdminChecked(true);

      if (!adminAccess) {
        setIsReady(true);
        return;
      }

      await loadAdminState();
      setIsReady(true);
    });
  }, [isAuthLoading, isMember, loadAdminState, router, user?.email]);

  const openReports = useMemo(
    () => reports.filter((item) => String(item.status || "open") === "open"),
    [reports]
  );

  useEffect(() => {
    writeLocalJson(FIXED_LOG_KEY, fixedLog || {});
  }, [fixedLog]);

  useEffect(() => {
    writeLocalJson(AUDIT_LOG_KEY, auditLog || []);
  }, [auditLog]);

  useEffect(() => {
    writeLocalJson(ROUTINE_KEY, weeklyRoutine || {});
  }, [weeklyRoutine]);

  useEffect(() => {
    let active = true;
    const refreshKpi = async () => {
      const nextSummary = await getKpiSummary(7);
      if (active) {
        setKpiSummary(nextSummary);
      }
    };

    refreshKpi();
    const timer = window.setInterval(() => {
      refreshKpi();
    }, 30000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const refreshQueue = useMemo(() => {
    const placeItems = places.map((item) => {
      const quality = getEntityQuality({
        targetType: "place",
        targetId: item.id,
        entity: item,
        map: qualityMap,
      });
      const qualityStatus = getQualityStatus(quality);
      return {
        key: `place:${item.id}`,
        targetType: "place",
        targetId: String(item.id),
        city: String(item.city || ""),
        type: String(item.type || ""),
        name: item.name || "Place",
        quality,
        qualityStatus,
      };
    });

    const eventItems = events.map((item) => {
      const quality = getEntityQuality({
        targetType: "event",
        targetId: item.id,
        entity: item,
        map: qualityMap,
      });
      const qualityStatus = getQualityStatus(quality);
      return {
        key: `event:${item.id}`,
        targetType: "event",
        targetId: String(item.id),
        city: String(item.city || ""),
        type: "event",
        name: item.name || "Event",
        quality,
        qualityStatus,
      };
    });

    return [...placeItems, ...eventItems]
      .filter((item) => item.qualityStatus.stale)
      .sort((a, b) => {
        const aFixed = isWithinDays(fixedLog[a.key], 7) ? 1 : 0;
        const bFixed = isWithinDays(fixedLog[b.key], 7) ? 1 : 0;
        if (aFixed !== bFixed) return aFixed - bFixed;
        return String(a.city).localeCompare(String(b.city));
      });
  }, [events, fixedLog, places, qualityMap]);

  const queueCityOptions = useMemo(
    () =>
      [...new Set(refreshQueue.map((item) => item.city).filter(Boolean))].sort((a, b) =>
        String(a).localeCompare(String(b))
      ),
    [refreshQueue]
  );

  const queueTypeOptions = useMemo(
    () =>
      [...new Set(refreshQueue.map((item) => item.type).filter(Boolean))].sort((a, b) =>
        String(a).localeCompare(String(b))
      ),
    [refreshQueue]
  );

  const filteredRefreshQueue = useMemo(() => {
    return refreshQueue.filter((item) => {
      const cityOk = queueCityFilter === "all" || item.city === queueCityFilter;
      const typeOk = queueTypeFilter === "all" || item.type === queueTypeFilter;
      const entityOk = queueEntityFilter === "all" || item.targetType === queueEntityFilter;
      return cityOk && typeOk && entityOk;
    });
  }, [queueCityFilter, queueEntityFilter, queueTypeFilter, refreshQueue]);
  const firstStaleQueueItem = useMemo(() => filteredRefreshQueue[0] || null, [filteredRefreshQueue]);
  const firstOpenReport = useMemo(() => openReports[0] || null, [openReports]);

  useEffect(() => {
    const allowed = new Set(filteredRefreshQueue.map((item) => String(item.key)));
    setSelectedQueueKeys((current) => current.filter((key) => allowed.has(String(key))));
  }, [filteredRefreshQueue]);

  const appendAuditLog = (action, detail = "") => {
    const actor = String(memberName || user?.email || "admin");
    setAuditLog((current) => [
      {
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        action,
        detail,
        actor,
        createdAt: new Date().toISOString(),
      },
      ...(Array.isArray(current) ? current : []),
    ].slice(0, 150));
  };

  const toggleReportSelection = (reportId) => {
    const key = String(reportId);
    setSelectedReportIds((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  };

  const toggleQueueSelection = (queueKey) => {
    const key = String(queueKey);
    setSelectedQueueKeys((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  };

  const exportCsv = (rows, fileName) => {
    const csv = toCsv(rows);
    if (!csv) {
      showToast("No data to export.", { tone: "info", duration: 1600 });
      return;
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    appendAuditLog("export_csv", fileName);
    showToast("CSV exported.", { tone: "ok", duration: 1600 });
  };

  const setReportStatus = async (reportId, status) => {
    const targetId = String(reportId);
    setBusyMap((current) => ({ ...current, [targetId]: true }));
    try {
      const nextReports = reports.map((report) => {
        if (String(report.id) !== targetId) return report;
        return {
          ...report,
          status,
          resolvedAt: status === "resolved" ? new Date().toISOString() : null,
        };
      });
      setReports(nextReports);
      saveReports(nextReports);
      appendAuditLog("report_status", `${targetId} -> ${status}`);
      showToast(status === "resolved" ? "Report resolved." : "Report reopened.", {
        tone: "ok",
        duration: 1900,
      });
      await loadAdminState();
    } finally {
      setBusyMap((current) => ({ ...current, [targetId]: false }));
    }
  };

  const blockFromReport = async (report) => {
    if (!report) return;
    const targetId = String(report.id);
    setBusyMap((current) => ({ ...current, [targetId]: true }));
    try {
      blockItem({
        targetType: report.targetType,
        targetId: report.targetId,
        title: report.title,
        city: report.city,
      });
      const nextReports = reports.map((entry) => {
        if (String(entry.id) !== String(report.id)) return entry;
        return {
          ...entry,
          status: "resolved",
          resolvedAt: new Date().toISOString(),
        };
      });
      setReports(nextReports);
      saveReports(nextReports);
      appendAuditLog("report_block", `${report.targetType}:${report.targetId}`);
      showToast("Item hidden and report resolved.", { tone: "ok", duration: 2200 });
      await loadAdminState();
    } finally {
      setBusyMap((current) => ({ ...current, [targetId]: false }));
    }
  };

  const deleteReportItem = async (report) => {
    if (!report?.id) return;
    const targetId = String(report.id);
    setBusyMap((current) => ({ ...current, [targetId]: true }));
    try {
      await removeReport(targetId);
      setReports((current) => current.filter((entry) => String(entry.id) !== targetId));
      setSelectedReportIds((current) => current.filter((id) => String(id) !== targetId));
      appendAuditLog("report_delete", targetId);
      showToast("Report deleted.", { tone: "ok", duration: 1800 });
      await loadAdminState();
    } finally {
      setBusyMap((current) => ({ ...current, [targetId]: false }));
    }
  };

  const removeBlockedItem = async (itemId) => {
    const targetId = String(itemId);
    setBusyMap((current) => ({ ...current, [targetId]: true }));
    try {
      const next = blockedItems.filter((item) => String(item.id) !== targetId);
      setBlockedItems(next);
      saveBlockedItems(next);
      appendAuditLog("unblock_item", targetId);
      showToast("Blocked item removed.", { tone: "info", duration: 2000 });
      await loadAdminState();
    } finally {
      setBusyMap((current) => ({ ...current, [targetId]: false }));
    }
  };

  const openQueueItem = (item) => {
    if (!item?.city || !item?.targetId) return;
    const slug = String(item.city).toLowerCase();
    if (item.targetType === "event") {
      router.push(`/${slug}?eventId=${item.targetId}`);
      return;
    }
    router.push(`/${slug}?placeId=${item.targetId}`);
  };

  const quickVerifyFirstStale = () => {
    if (!firstStaleQueueItem) {
      showToast("Queue is already clean.", { tone: "info", duration: 1700 });
      return;
    }
    markQueueItemFixed(firstStaleQueueItem);
  };

  const quickHideFirstReport = async () => {
    if (!firstOpenReport) {
      showToast("No open reports right now.", { tone: "info", duration: 1700 });
      return;
    }
    await blockFromReport(firstOpenReport);
  };

  const quickResolveFirstReport = async () => {
    if (!firstOpenReport) {
      showToast("No open reports right now.", { tone: "info", duration: 1700 });
      return;
    }
    await setReportStatus(firstOpenReport.id, "resolved");
  };

  const markQueueItemFixed = (item) => {
    if (!item?.targetType || !item?.targetId) return;
    upsertQuality({
      targetType: item.targetType,
      targetId: item.targetId,
      source: "Admin command center",
      lastChecked: new Date().toISOString().slice(0, 10),
      verified: true,
    });

    setQualityMap(getQualityMap());
    setFixedLog((current) => ({
      ...(current || {}),
      [item.key]: new Date().toISOString(),
    }));
    appendAuditLog("queue_fixed", `${item.targetType}:${item.targetId}`);
    showToast("Marked as fixed this week.", { tone: "ok", duration: 1800 });
  };

  const hideQueueItem = async (item) => {
    if (!item?.targetType || !item?.targetId) return;
    const busyKey = `queue-hide-${item.key}`;
    setBusyMap((current) => ({ ...current, [busyKey]: true }));
    try {
      blockItem({
        targetType: item.targetType,
        targetId: item.targetId,
        title: item.name || "",
        city: item.city || "",
      });
      appendAuditLog("queue_hide", `${item.targetType}:${item.targetId}`);
      showToast("Item hidden from atlas.", { tone: "ok", duration: 2000 });
      await loadAdminState();
    } finally {
      setBusyMap((current) => ({ ...current, [busyKey]: false }));
    }
  };

  const deleteQueueItem = async (item, { silent = false } = {}) => {
    if (!item?.targetType || !item?.targetId) return { deleted: 0, skipped: 0, failed: 0 };
    const busyKey = `queue-delete-${item.key}`;
    setBusyMap((current) => ({ ...current, [busyKey]: true }));
    try {
      if (item.targetType === "event") {
        const { error } = await supabase.from("events").delete().eq("id", String(item.targetId));
        if (error) {
          if (!silent) {
            showToast(`Could not delete event: ${formatDbError(error)}`, { tone: "warn", duration: 2600 });
          }
          return { deleted: 0, skipped: 0, failed: 1 };
        }
        appendAuditLog("queue_delete", `event:${item.targetId}`);
        if (!silent) {
          showToast("Event deleted.", { tone: "ok", duration: 1800 });
          await loadAdminState();
        }
        return { deleted: 1, skipped: 0, failed: 0 };
      }

      const numericPlaceId = Number(item.targetId);
      if (!Number.isFinite(numericPlaceId)) {
        if (!silent) {
          showToast("Seeded place cannot be deleted. Use Hide instead.", { tone: "info", duration: 2600 });
        }
        return { deleted: 0, skipped: 1, failed: 0 };
      }

      const { error } = await supabase.from("places").delete().eq("id", numericPlaceId);
      if (error) {
        if (!silent) {
          showToast(`Could not delete place: ${formatDbError(error)}`, { tone: "warn", duration: 2600 });
        }
        return { deleted: 0, skipped: 0, failed: 1 };
      }

      appendAuditLog("queue_delete", `place:${item.targetId}`);
      if (!silent) {
        showToast("Place deleted.", { tone: "ok", duration: 1800 });
        await loadAdminState();
      }
      return { deleted: 1, skipped: 0, failed: 0 };
    } finally {
      setBusyMap((current) => ({ ...current, [busyKey]: false }));
    }
  };

  const bulkResolveSelectedReports = () => {
    if (selectedReportIds.length === 0) return;
    const selectedSet = new Set(selectedReportIds.map(String));
    const nextReports = reports.map((report) =>
      selectedSet.has(String(report.id))
        ? { ...report, status: "resolved", resolvedAt: new Date().toISOString() }
        : report
    );
    setReports(nextReports);
    saveReports(nextReports);
    appendAuditLog("bulk_resolve_reports", `${selectedReportIds.length} reports`);
    setSelectedReportIds([]);
    showToast("Selected reports resolved.", { tone: "ok", duration: 1900 });
  };

  const bulkEmergencyHideSelected = () => {
    if (selectedReportIds.length === 0) return;
    const selectedSet = new Set(selectedReportIds.map(String));
    const selectedReports = reports.filter((report) => selectedSet.has(String(report.id)));

    selectedReports.forEach((report) => {
      blockItem({
        targetType: report.targetType,
        targetId: report.targetId,
        title: report.title,
        city: report.city,
      });
    });

    const nextReports = reports.map((report) =>
      selectedSet.has(String(report.id))
        ? { ...report, status: "resolved", resolvedAt: new Date().toISOString() }
        : report
    );
    setReports(nextReports);
    saveReports(nextReports);
    appendAuditLog("bulk_emergency_hide", `${selectedReports.length} reports`);
    setSelectedReportIds([]);
    showToast("Emergency hide applied to selected reports.", { tone: "ok", duration: 2200 });
    queueMicrotask(async () => {
      await loadAdminState();
    });
  };

  const bulkDeleteSelectedReports = async () => {
    if (selectedReportIds.length === 0) return;
    const selectedSet = new Set(selectedReportIds.map(String));
    const selectedReports = reports.filter((report) => selectedSet.has(String(report.id)));
    for (const report of selectedReports) {
      await removeReport(String(report.id));
    }
    setReports((current) => current.filter((report) => !selectedSet.has(String(report.id))));
    setSelectedReportIds([]);
    appendAuditLog("bulk_delete_reports", `${selectedReports.length} reports`);
    showToast(`Deleted ${selectedReports.length} report${selectedReports.length === 1 ? "" : "s"}.`, {
      tone: "ok",
      duration: 2100,
    });
    await loadAdminState();
  };

  const bulkMarkQueueFixed = () => {
    if (selectedQueueKeys.length === 0) return;
    const selectedSet = new Set(selectedQueueKeys.map(String));
    const selectedItems = filteredRefreshQueue.filter((item) => selectedSet.has(String(item.key)));
    const nowIso = new Date().toISOString();
    selectedItems.forEach((item) => {
      upsertQuality({
        targetType: item.targetType,
        targetId: item.targetId,
        source: "Admin command center (bulk)",
        lastChecked: nowIso.slice(0, 10),
        verified: true,
      });
    });
    setQualityMap(getQualityMap());
    setFixedLog((current) => {
      const next = { ...(current || {}) };
      selectedItems.forEach((item) => {
        next[item.key] = nowIso;
      });
      return next;
    });
    appendAuditLog("bulk_queue_fixed", `${selectedItems.length} items`);
    setSelectedQueueKeys([]);
    showToast("Selected queue items marked fixed.", { tone: "ok", duration: 2100 });
  };

  const bulkHideQueueSelected = async () => {
    if (selectedQueueKeys.length === 0) return;
    const selectedSet = new Set(selectedQueueKeys.map(String));
    const selectedItems = filteredRefreshQueue.filter((item) => selectedSet.has(String(item.key)));
    selectedItems.forEach((item) => {
      blockItem({
        targetType: item.targetType,
        targetId: item.targetId,
        title: item.name || "",
        city: item.city || "",
      });
    });
    appendAuditLog("bulk_queue_hide", `${selectedItems.length} items`);
    setSelectedQueueKeys([]);
    showToast(`Hidden ${selectedItems.length} item${selectedItems.length === 1 ? "" : "s"}.`, {
      tone: "ok",
      duration: 2200,
    });
    await loadAdminState();
  };

  const bulkDeleteQueueSelected = async () => {
    if (selectedQueueKeys.length === 0) return;
    const selectedSet = new Set(selectedQueueKeys.map(String));
    const selectedItems = filteredRefreshQueue.filter((item) => selectedSet.has(String(item.key)));
    let deleted = 0;
    let skipped = 0;
    let failed = 0;
    for (const item of selectedItems) {
      const result = await deleteQueueItem(item, { silent: true });
      deleted += Number(result.deleted || 0);
      skipped += Number(result.skipped || 0);
      failed += Number(result.failed || 0);
    }
    setSelectedQueueKeys([]);
    appendAuditLog("bulk_queue_delete", `${deleted} deleted, ${skipped} skipped, ${failed} failed`);
    if (failed > 0) {
      showToast(`Deleted ${deleted}. Skipped ${skipped}. Failed ${failed}.`, { tone: "warn", duration: 2800 });
    } else {
      showToast(`Deleted ${deleted}. Skipped ${skipped}.`, { tone: "ok", duration: 2300 });
    }
    await loadAdminState();
  };

  const markRoutineDone = (key) => {
    const labelMap = {
      queuePassDoneAt: "Queue pass completed",
      newsPassDoneAt: "News pass completed",
      linksPassDoneAt: "Dead-link pass completed",
    };
    setWeeklyRoutine((current) => ({
      ...(current || {}),
      [key]: new Date().toISOString(),
    }));
    appendAuditLog("weekly_routine", labelMap[key] || key);
    showToast(labelMap[key] || "Routine step completed.", { tone: "ok", duration: 1800 });
  };

  const runAuthDiagnostics = useCallback(async () => {
    setDiagLoading(true);
    setDiagMailState("");
    const rows = [];

    const pushRow = (label, status, detail) => {
      rows.push({ label, status, detail });
    };

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    pushRow(
      "Current origin",
      origin.startsWith("https://") ? "ok" : "warn",
      origin || "Unknown origin"
    );

    const supabaseUrl = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
    pushRow(
      "Supabase URL",
      supabaseUrl ? "ok" : "fail",
      supabaseUrl || "Missing NEXT_PUBLIC_SUPABASE_URL"
    );

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        pushRow("Auth session", "fail", error.message || "Could not read session");
      } else if (data?.session?.user?.email) {
        pushRow("Auth session", "ok", `Signed in as ${data.session.user.email}`);
      } else {
        pushRow("Auth session", "warn", "No active session");
      }
    } catch (error) {
      pushRow("Auth session", "fail", error?.message || "Session check failed");
    }

    try {
      const rpcRes = await supabase.rpc("qa_is_admin");
      pushRow(
        "Admin role RPC",
        rpcRes?.data ? "ok" : "warn",
        rpcRes?.data ? "qa_is_admin = true" : "qa_is_admin = false"
      );
    } catch (error) {
      pushRow("Admin role RPC", "fail", error?.message || "RPC failed");
    }

    try {
      const { error } = await supabase.from("qa_admin_users").select("email").limit(1);
      pushRow(
        "Admin table read",
        error ? "warn" : "ok",
        error ? error.message || "Read failed" : "Readable"
      );
    } catch (error) {
      pushRow("Admin table read", "warn", error?.message || "Read failed");
    }

    try {
      const { error } = await supabase.from("member_profiles").select("user_id").limit(1);
      pushRow(
        "Member profile table",
        error ? "warn" : "ok",
        error ? error.message || "Read failed" : "Readable"
      );
    } catch (error) {
      pushRow("Member profile table", "warn", error?.message || "Read failed");
    }

    try {
      const countRes = await supabase
        .from("qa_member_checkins")
        .select("id", { count: "exact", head: true });
      if (countRes.error) {
        pushRow("Check-ins table", "fail", countRes.error.message || "Read failed");
      } else {
        pushRow("Check-ins table", "ok", `Reachable. Rows: ${Number(countRes.count || 0)}`);
      }
    } catch (error) {
      pushRow("Check-ins table", "fail", error?.message || "Read failed");
    }

    try {
      const schemaProbe = await supabase
        .from("qa_member_checkins")
        .select("id,country,checked_in_at")
        .order("checked_in_at", { ascending: false })
        .limit(1);
      if (schemaProbe.error) {
        pushRow("Check-ins schema", "warn", schemaProbe.error.message || "Could not verify columns");
      } else {
        pushRow("Check-ins schema", "ok", "country + checked_in_at columns readable");
      }
    } catch (error) {
      pushRow("Check-ins schema", "warn", error?.message || "Could not verify columns");
    }

    pushRow(
      "Confirm-email route",
      "info",
      `Expected redirect/origin should include: ${origin || "your-site-origin"}`
    );

    setDiagRows(rows);
    setDiagRanAt(new Date().toISOString());
    setDiagLoading(false);
  }, []);

  const sendDiagnosticEmail = useCallback(async () => {
    const email = String(diagTestEmail || "").trim();
    if (!email) {
      setDiagMailState("Enter an email first.");
      return;
    }
    setDiagLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        setDiagMailState(`Email send failed: ${error.message || "Unknown error"}`);
      } else {
        setDiagMailState("Diagnostic email sent. Check inbox + spam.");
      }
    } catch (error) {
      setDiagMailState(`Email send failed: ${error?.message || "Unknown error"}`);
    } finally {
      setDiagLoading(false);
    }
  }, [diagTestEmail]);

  if (!isReady || !adminChecked) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <PageOpeningState
          title="Opening Admin Command Center..."
          subtitle="Checking admin access and syncing moderation state."
          tone="cyan"
        />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-xl rounded-3xl border border-rose-300/20 bg-rose-300/8 p-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-rose-100/80">Access denied</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">Admin only area</h1>
          <p className="mt-3 text-sm leading-6 text-white/70">
            This workspace is only available to verified admin accounts.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-5 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-white/85 transition hover:border-white/30"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#0f172a_0%,#050505_40%,#040404_100%)] px-6 py-8 text-white">
      <ActionToast toast={toast} />
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 overflow-hidden rounded-[34px] border border-cyan-300/16 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_80%_16%,rgba(167,139,250,0.14),transparent_28%),linear-gradient(135deg,rgba(17,24,39,0.95),rgba(10,10,10,0.99))] p-8 shadow-[0_34px_110px_rgba(0,0,0,0.40)]">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/80">Admin</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
            Command Center
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">
            Moderate reports, manage blocked items, and keep atlas quality stable from one place.
          </p>
          <p className="mt-3 text-xs text-cyan-100/70">
            Logged in as {memberName || user?.email || "Admin"}
          </p>
          {lastSyncedAt && (
            <p className="mt-2 text-[11px] text-cyan-100/62">
              Last synced {timeAgo(lastSyncedAt)}
            </p>
          )}
          {warning && (
            <div className="mt-4 inline-flex rounded-xl border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
              {warning}
            </div>
          )}
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-3xl border border-cyan-200/18 bg-cyan-200/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Places</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.places}</p>
          </article>
          <article className="rounded-3xl border border-violet-200/18 bg-violet-200/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-violet-100/75">Events</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.events}</p>
          </article>
          <article className="rounded-3xl border border-fuchsia-200/18 bg-fuchsia-200/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-100/75">Off-grid events</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.globalEvents}</p>
          </article>
          <article className="rounded-3xl border border-amber-200/18 bg-amber-200/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-100/75">Open reports</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.openReports}</p>
          </article>
          <article className="rounded-3xl border border-rose-200/18 bg-rose-200/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-rose-100/75">Blocked items</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.blockedItems}</p>
          </article>
        </section>

        <section className="mb-8 rounded-[30px] border border-emerald-300/14 bg-[linear-gradient(180deg,rgba(7,42,34,0.82),rgba(10,10,10,0.98))] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/75">Growth loop</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Launch KPI snapshot (7 days)</h2>
              <p className="mt-1 text-xs text-white/60">
                Fast pulse on acquisition, activation, contribution, and return intent.
              </p>
            </div>
            <span className="rounded-full border border-emerald-200/22 bg-emerald-200/10 px-3 py-1 text-xs text-emerald-100">
              {kpiSummary.totalEvents} tracked actions
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-white/12 bg-white/6 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Signup</p>
              <p className="mt-2 text-2xl font-semibold text-white">{kpiSummary.counts.signupCompleted}</p>
              <p className="mt-1 text-[11px] text-white/45">logins: {kpiSummary.counts.loginCompleted}</p>
            </article>
            <article className="rounded-2xl border border-white/12 bg-white/6 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Saves</p>
              <p className="mt-2 text-2xl font-semibold text-white">{kpiSummary.counts.favoriteSaved}</p>
              <p className="mt-1 text-[11px] text-white/45">search opens: {kpiSummary.counts.searchOpened}</p>
            </article>
            <article className="rounded-2xl border border-white/12 bg-white/6 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Plans + reviews</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {kpiSummary.counts.planSaved + kpiSummary.counts.reviewSubmitted}
              </p>
              <p className="mt-1 text-[11px] text-white/45">
                plans: {kpiSummary.counts.planSaved} · reviews: {kpiSummary.counts.reviewSubmitted}
              </p>
            </article>
            <article className="rounded-2xl border border-white/12 bg-white/6 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Contributions</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {kpiSummary.counts.placeAdded + kpiSummary.counts.eventAdded}
              </p>
              <p className="mt-1 text-[11px] text-white/45">
                places: {kpiSummary.counts.placeAdded} · events: {kpiSummary.counts.eventAdded}
              </p>
            </article>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/62">
            <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1">
              Active members: {kpiSummary.activeMembers}
            </span>
            {(kpiSummary.topCities || []).map((entry) => (
              <span key={`kpi-city-${entry.city}`} className="rounded-full border border-emerald-200/18 bg-emerald-200/10 px-3 py-1 text-emerald-100">
                {entry.city}: {entry.count}
              </span>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Workflow shortcuts</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Jump to admin surfaces</h2>
            </div>
            <button
              type="button"
              onClick={loadAdminState}
              disabled={isRefreshing}
              className="rounded-full border border-cyan-200/25 bg-cyan-200/10 px-4 py-2 text-xs uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={() => router.push("/contribute")}
              className="rounded-2xl border border-fuchsia-200/18 bg-fuchsia-200/10 p-4 text-left transition hover:border-fuchsia-200/35"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-fuchsia-100/75">Contribute</p>
              <p className="mt-1 text-sm font-semibold text-white">Quality queue & needs refresh</p>
            </button>
            <button
              type="button"
              onClick={() => router.push("/now")}
              className="rounded-2xl border border-cyan-200/18 bg-cyan-200/10 p-4 text-left transition hover:border-cyan-200/35"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-cyan-100/75">Queer world news</p>
              <p className="mt-1 text-sm font-semibold text-white">Publish and curate world feed</p>
            </button>
            <button
              type="button"
              onClick={() => router.push("/community")}
              className="rounded-2xl border border-emerald-200/18 bg-emerald-200/10 p-4 text-left transition hover:border-emerald-200/35"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-emerald-100/75">Community</p>
              <p className="mt-1 text-sm font-semibold text-white">Topics, safety reports, moderation</p>
            </button>
          </div>
        </section>

        <section className="mb-8 rounded-[30px] border border-violet-300/16 bg-[linear-gradient(180deg,rgba(30,16,51,0.86),rgba(10,10,10,0.98))] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-violet-100/75">Quick actions</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Fast moderation moves</h2>
            </div>
            <span className="rounded-full border border-violet-200/22 bg-violet-200/10 px-3 py-1 text-xs text-violet-100">
              One-click triage
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={quickVerifyFirstStale}
              className="rounded-2xl border border-emerald-200/24 bg-emerald-200/10 p-4 text-left transition hover:border-emerald-200/40"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-emerald-100/75">Queue</p>
              <p className="mt-1 text-sm font-semibold text-white">Verify first stale item</p>
              <p className="mt-1 text-xs text-white/60">{firstStaleQueueItem ? firstStaleQueueItem.name : "No stale items"}</p>
            </button>
            <button
              type="button"
              onClick={quickResolveFirstReport}
              className="rounded-2xl border border-cyan-200/24 bg-cyan-200/10 p-4 text-left transition hover:border-cyan-200/40"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-cyan-100/75">Reports</p>
              <p className="mt-1 text-sm font-semibold text-white">Resolve first open report</p>
              <p className="mt-1 text-xs text-white/60">{firstOpenReport ? firstOpenReport.title || "Reported item" : "No open reports"}</p>
            </button>
            <button
              type="button"
              onClick={quickHideFirstReport}
              className="rounded-2xl border border-rose-200/24 bg-rose-200/10 p-4 text-left transition hover:border-rose-200/40"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-rose-100/75">Safety</p>
              <p className="mt-1 text-sm font-semibold text-white">Hide first open report target</p>
              <p className="mt-1 text-xs text-white/60">{firstOpenReport ? firstOpenReport.reason : "No open reports"}</p>
            </button>
          </div>
        </section>

        <section className="mb-8 rounded-[30px] border border-cyan-300/16 bg-[linear-gradient(180deg,rgba(7,28,44,0.84),rgba(10,10,10,0.98))] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Auth diagnostics</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Email delivery + login checks</h2>
              <p className="mt-1 text-xs text-white/60">
                Fast troubleshooting when users don&apos;t receive confirmation emails.
              </p>
            </div>
            <button
              type="button"
              onClick={runAuthDiagnostics}
              disabled={diagLoading}
              className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-4 py-2 text-xs uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40 disabled:opacity-60"
            >
              {diagLoading ? "Running..." : "Run diagnostics"}
            </button>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="rounded-2xl border border-white/12 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-white/60">Live checks</p>
              {diagRanAt ? (
                <p className="mt-1 text-[11px] text-white/45">Last run {timeAgo(diagRanAt)}</p>
              ) : (
                <p className="mt-1 text-[11px] text-white/45">Run diagnostics to populate status.</p>
              )}
              <div className="mt-3 space-y-2">
                {(diagRows.length > 0 ? diagRows : []).map((row, index) => {
                  const toneClass =
                    row.status === "ok"
                      ? "border-emerald-200/22 bg-emerald-200/10 text-emerald-100"
                      : row.status === "fail"
                        ? "border-rose-200/22 bg-rose-200/10 text-rose-100"
                        : row.status === "warn"
                          ? "border-amber-200/22 bg-amber-200/10 text-amber-100"
                          : "border-cyan-200/22 bg-cyan-200/10 text-cyan-100";
                  return (
                    <div key={`diag-row-${index}`} className={`rounded-xl border px-3 py-2 text-xs ${toneClass}`}>
                      <p className="font-semibold">{row.label}</p>
                      <p className="mt-1 opacity-90">{row.detail}</p>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="rounded-2xl border border-white/12 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-white/60">Send test email</p>
              <p className="mt-1 text-[11px] text-white/50">
                Sends a Supabase OTP/magic-link email using your current project settings.
              </p>
              <input
                value={diagTestEmail}
                onChange={(event) => setDiagTestEmail(event.target.value)}
                placeholder="test@email.com"
                className="mt-3 w-full rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none"
              />
              <button
                type="button"
                onClick={sendDiagnosticEmail}
                disabled={diagLoading}
                className="mt-3 rounded-full border border-cyan-200/24 bg-cyan-200/10 px-4 py-2 text-xs uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40 disabled:opacity-60"
              >
                {diagLoading ? "Sending..." : "Send test email"}
              </button>
              {diagMailState && (
                <p className="mt-3 rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/80">
                  {diagMailState}
                </p>
              )}

              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] leading-5 text-white/70">
                Check in Supabase:
                <p className="mt-1">Auth → Providers → Email enabled</p>
                <p>Auth → URL Configuration → Site URL = your live URL</p>
                <p>Redirect URLs include live URL + localhost for dev</p>
                <p>Auth logs for SMTP/rate-limit errors</p>
              </div>
            </article>
          </div>
        </section>

        <section className="mb-8 rounded-[30px] border border-fuchsia-300/16 bg-[linear-gradient(180deg,rgba(63,18,73,0.72),rgba(10,10,10,0.98))] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-100/80">Cross-city quality queue</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Needs refresh</h2>
              <p className="mt-1 text-xs text-white/60">
                Worklist across all cities. Open item, verify source, then mark fixed.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-fuchsia-200/20 bg-fuchsia-200/10 px-3 py-1 text-xs text-fuchsia-100">
                {filteredRefreshQueue.length} items
              </span>
              <button
                type="button"
                onClick={() =>
                  exportCsv(
                    filteredRefreshQueue.map((item) => ({
                      entity: item.targetType,
                      city: item.city,
                      type: item.type,
                      name: item.name,
                      last_checked: item.quality?.lastChecked || "",
                      status: item.qualityStatus?.label || "",
                    })),
                    "qa-needs-refresh-queue.csv"
                  )
                }
                className="rounded-full border border-white/16 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white/78 transition hover:border-white/30"
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={bulkMarkQueueFixed}
                disabled={selectedQueueKeys.length === 0}
                className="rounded-full border border-emerald-200/24 bg-emerald-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-200/40 disabled:opacity-60"
              >
                Verify selected ({selectedQueueKeys.length})
              </button>
              <button
                type="button"
                onClick={bulkHideQueueSelected}
                disabled={selectedQueueKeys.length === 0}
                className="rounded-full border border-amber-200/24 bg-amber-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-amber-100 transition hover:border-amber-200/40 disabled:opacity-60"
              >
                Hide selected ({selectedQueueKeys.length})
              </button>
              <button
                type="button"
                onClick={bulkDeleteQueueSelected}
                disabled={selectedQueueKeys.length === 0}
                className="rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40 disabled:opacity-60"
              >
                Delete selected ({selectedQueueKeys.length})
              </button>
            </div>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <select
              value={queueCityFilter}
              onChange={(event) => setQueueCityFilter(event.target.value)}
              className="rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="all">All cities</option>
              {queueCityOptions.map((city) => (
                <option key={`queue-city-${city}`} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <select
              value={queueTypeFilter}
              onChange={(event) => setQueueTypeFilter(event.target.value)}
              className="rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="all">All types</option>
              {queueTypeOptions.map((type) => (
                <option key={`queue-type-${type}`} value={type}>
                  {formatTitle(type)}
                </option>
              ))}
            </select>
            <select
              value={queueEntityFilter}
              onChange={(event) => setQueueEntityFilter(event.target.value)}
              className="rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="all">Places + events</option>
              <option value="place">Places only</option>
              <option value="event">Events only</option>
            </select>
          </div>

          <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1">
            {filteredRefreshQueue.length > 0 ? (
              filteredRefreshQueue.map((item) => {
                const fixedThisWeek = isWithinDays(fixedLog[item.key], 7);
                return (
                  <article key={item.key} className="rounded-2xl border border-white/12 bg-black/25 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <label className="mb-2 inline-flex cursor-pointer items-center gap-2 text-[11px] text-white/60">
                          <input
                            type="checkbox"
                            checked={selectedQueueKeys.includes(String(item.key))}
                            onChange={() => toggleQueueSelection(item.key)}
                            className="h-3.5 w-3.5 rounded border-white/25 bg-black/40"
                          />
                          Select
                        </label>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
                          {formatTitle(item.targetType)} · {item.city || "Global"} · {formatTitle(item.type)}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">{item.name}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-amber-200/22 bg-amber-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-amber-100">
                            {item.qualityStatus.label}
                          </span>
                          {fixedThisWeek && (
                            <span className="rounded-full border border-emerald-200/22 bg-emerald-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-emerald-100">
                              Fixed this week
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-white/45">
                          Last checked: {item.quality?.lastChecked || "Not set"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openQueueItem(item)}
                          className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40"
                        >
                          Open item
                        </button>
                        <button
                          type="button"
                          onClick={() => markQueueItemFixed(item)}
                          className="rounded-full border border-emerald-200/24 bg-emerald-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-200/40"
                        >
                          Verify
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(busyMap[`queue-hide-${item.key}`])}
                          onClick={() => hideQueueItem(item)}
                          className="rounded-full border border-amber-200/24 bg-amber-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-amber-100 transition hover:border-amber-200/40 disabled:opacity-60"
                        >
                          Hide
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(busyMap[`queue-delete-${item.key}`])}
                          onClick={() => deleteQueueItem(item)}
                          className="rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-white/14 px-4 py-8 text-sm text-white/55">
                Queue is clear for current filters.
              </div>
            )}
          </div>
        </section>

        <section className="mb-8 rounded-[30px] border border-amber-300/16 bg-[linear-gradient(180deg,rgba(45,31,10,0.85),rgba(10,10,10,0.98))] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-100/80">Safety inbox</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Open reports</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs text-amber-100">
                {openReports.length} open
              </span>
              <button
                type="button"
                onClick={() =>
                  exportCsv(
                    openReports.map((item) => ({
                      id: item.id,
                      target_type: item.targetType,
                      target_id: item.targetId,
                      city: item.city,
                      title: item.title,
                      reason: item.reason,
                      message: item.message || "",
                      created_at: item.createdAt,
                    })),
                    "qa-open-reports.csv"
                  )
                }
                className="rounded-full border border-white/16 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white/78 transition hover:border-white/30"
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={bulkResolveSelectedReports}
                disabled={selectedReportIds.length === 0}
                className="rounded-full border border-emerald-200/24 bg-emerald-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-200/40 disabled:opacity-60"
              >
                Resolve selected ({selectedReportIds.length})
              </button>
              <button
                type="button"
                onClick={bulkEmergencyHideSelected}
                disabled={selectedReportIds.length === 0}
                className="rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40 disabled:opacity-60"
              >
                Hide selected
              </button>
              <button
                type="button"
                onClick={bulkDeleteSelectedReports}
                disabled={selectedReportIds.length === 0}
                className="rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40 disabled:opacity-60"
              >
                Delete selected
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {openReports.length > 0 ? (
              openReports.map((report) => (
                <article
                  key={report.id}
                  className="rounded-2xl border border-white/12 bg-black/25 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <label className="mb-2 inline-flex cursor-pointer items-center gap-2 text-[11px] text-white/60">
                        <input
                          type="checkbox"
                          checked={selectedReportIds.includes(String(report.id))}
                          onChange={() => toggleReportSelection(report.id)}
                          className="h-3.5 w-3.5 rounded border-white/25 bg-black/40"
                        />
                        Select
                      </label>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
                        {formatTitle(report.targetType)} · {report.city || "Global"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {report.title || "Reported content"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/78">{report.reason}</p>
                      {report.message && (
                        <div className="mt-2 rounded-xl border border-rose-200/20 bg-rose-200/8 px-3 py-2 text-sm leading-6 text-rose-50/92">
                          {report.message}
                        </div>
                      )}
                      <p className="mt-2 text-xs text-white/45">{timeAgo(report.createdAt)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={Boolean(busyMap[String(report.id)])}
                          onClick={() => blockFromReport(report)}
                          className="rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40 disabled:opacity-60"
                        >
                          Hide
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(busyMap[String(report.id)])}
                          onClick={() => deleteReportItem(report)}
                          className="rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40 disabled:opacity-60"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(busyMap[String(report.id)])}
                          onClick={() => setReportStatus(report.id, "resolved")}
                        className="rounded-full border border-emerald-200/24 bg-emerald-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-200/40 disabled:opacity-60"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/14 px-4 py-8 text-sm text-white/55">
                No open reports right now.
              </div>
            )}
          </div>
        </section>

        <section className="mb-8 rounded-[30px] border border-cyan-300/16 bg-[linear-gradient(180deg,rgba(8,38,45,0.82),rgba(10,10,10,0.98))] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Growth ops</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Weekly routine</h2>
            </div>
            <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100">
              Keep atlas quality high
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <article className="rounded-2xl border border-white/12 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-white/60">Queue pass</p>
              <p className="mt-2 text-sm text-white/80">
                {weeklyRoutine.queuePassDoneAt ? `Done ${timeAgo(weeklyRoutine.queuePassDoneAt)}` : "Pending this week"}
              </p>
              <button
                type="button"
                onClick={() => markRoutineDone("queuePassDoneAt")}
                className="mt-3 rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40"
              >
                Mark done
              </button>
            </article>
            <article className="rounded-2xl border border-white/12 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-white/60">News pass</p>
              <p className="mt-2 text-sm text-white/80">
                {weeklyRoutine.newsPassDoneAt ? `Done ${timeAgo(weeklyRoutine.newsPassDoneAt)}` : "Pending this week"}
              </p>
              <button
                type="button"
                onClick={() => markRoutineDone("newsPassDoneAt")}
                className="mt-3 rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40"
              >
                Mark done
              </button>
            </article>
            <article className="rounded-2xl border border-white/12 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-white/60">Dead-link pass</p>
              <p className="mt-2 text-sm text-white/80">
                {weeklyRoutine.linksPassDoneAt ? `Done ${timeAgo(weeklyRoutine.linksPassDoneAt)}` : "Pending this week"}
              </p>
              <button
                type="button"
                onClick={() => markRoutineDone("linksPassDoneAt")}
                className="mt-3 rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40"
              >
                Mark done
              </button>
            </article>
          </div>
        </section>

        <section className="mb-8 rounded-[30px] border border-violet-300/16 bg-[linear-gradient(180deg,rgba(37,18,56,0.82),rgba(10,10,10,0.98))] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-violet-100/80">Governance</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Audit log</h2>
            </div>
            <span className="rounded-full border border-violet-200/20 bg-violet-200/10 px-3 py-1 text-xs text-violet-100">
              {auditLog.length} entries
            </span>
          </div>
          <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
            {auditLog.length > 0 ? (
              auditLog.map((entry) => (
                <article key={entry.id} className="rounded-xl border border-white/12 bg-black/25 px-3 py-2">
                  <p className="text-xs uppercase tracking-[0.12em] text-violet-100/75">{entry.action}</p>
                  <p className="mt-1 text-sm text-white/82">{entry.detail || "No detail"}</p>
                  <p className="mt-1 text-[11px] text-white/50">
                    {entry.actor} · {timeAgo(entry.createdAt)}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/14 px-4 py-8 text-sm text-white/55">
                No actions logged yet.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[30px] border border-rose-300/16 bg-[linear-gradient(180deg,rgba(56,18,31,0.82),rgba(10,10,10,0.98))] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-rose-100/80">Blocklist</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Blocked items</h2>
            </div>
            <span className="rounded-full border border-rose-200/20 bg-rose-200/10 px-3 py-1 text-xs text-rose-100">
              {blockedItems.length} items
            </span>
          </div>
          <div className="space-y-3">
            {blockedItems.length > 0 ? (
              blockedItems.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/12 bg-black/25 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
                        {formatTitle(item.targetType)} · {item.city || "Global"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {item.title || "Blocked content"}
                      </p>
                      <p className="mt-2 text-xs text-white/45">Blocked {timeAgo(item.blockedAt)}</p>
                    </div>
                    <button
                      type="button"
                      disabled={Boolean(busyMap[String(item.id)])}
                      onClick={() => removeBlockedItem(item.id)}
                      className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40 disabled:opacity-60"
                    >
                      Unblock
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/14 px-4 py-8 text-sm text-white/55">
                Nothing blocked right now.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
