"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { fetchPlacesQueryWithFallback } from "@/lib/placesDataApi";
import { fetchServicesQuery } from "@/lib/servicesDataApi";
import {
  blockItem,
  getBlockedItems,
  getReports,
  removeReport,
  saveBlockedItems,
  saveReports,
  syncModerationFromCloud,
} from "@/lib/moderation";
import { fetchTrafficSummary } from "@/lib/trafficAnalytics";
import { resolveAdminAccess } from "@/lib/adminAccess";
import {
  listContentSubmissions,
  publishContentSubmission,
  updateContentSubmissionStatus,
} from "@/lib/contentSubmissions";
import PageOpeningState from "@/components/ui/PageOpeningState";
import { useActionToast } from "@/lib/useActionToast";
import ActionToast from "@/components/ui/ActionToast";

const MEMBER_AVATAR_BUCKET = "member-avatars";

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

function formatCityLabel(city = "") {
  return String(city || "")
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isMissingRelationError(error) {
  if (!error) return false;
  const code = String(error.code || "").toUpperCase();
  const text = `${error.message || ""} ${error.details || ""} ${error.hint || ""}`.toLowerCase();
  return code === "42P01" || text.includes("relation") && text.includes("does not exist");
}

function isMissingColumnError(error, columnName = "") {
  const needle = String(columnName || "").trim().toLowerCase();
  if (!needle) return false;
  const text = `${error?.code || ""} ${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return (text.includes("column") || text.includes("schema cache")) && text.includes(needle);
}

function resolveAvatarUrlFromProfile(profileLike) {
  const direct = String(profileLike?.avatar_url || "").trim();
  if (direct) return direct;
  const path = String(profileLike?.avatar_path || "").trim();
  if (!path) return "";
  return supabase.storage.from(MEMBER_AVATAR_BUCKET).getPublicUrl(path)?.data?.publicUrl || "";
}

function formatContactCategory(value = "") {
  const map = {
    bug_report: "Bug report",
    safety_concern: "Safety concern",
    venue_event_correction: "Venue/Event correction",
    general_feedback: "General feedback",
    business_inquiry: "Business inquiry",
  };
  return map[String(value || "").trim()] || formatTitle(value);
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
    services: 0,
    globalEvents: 0,
    openReports: 0,
    blockedItems: 0,
  });
  const [reports, setReports] = useState([]);
  const [blockedItems, setBlockedItems] = useState([]);
  const [selectedReportIds, setSelectedReportIds] = useState([]);
  const [warning, setWarning] = useState("");
  const [busyMap, setBusyMap] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState("");
  const [trafficSummary, setTrafficSummary] = useState({
    ok: false,
    missingTable: false,
    message: "",
    days: 30,
    totals: {
      visits30: 0,
      visitors30: 0,
      visits7: 0,
      visitors7: 0,
      visitsToday: 0,
      visitorsToday: 0,
    },
    topRoutes: [],
    topCities: [],
    daily: [],
  });
  const [memberDirectory, setMemberDirectory] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberDirectoryLoading, setMemberDirectoryLoading] = useState(false);
  const [memberDirectoryNotice, setMemberDirectoryNotice] = useState("");
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [isLoadingPendingSubmissions, setIsLoadingPendingSubmissions] = useState(false);
  const [submissionSyncNotice, setSubmissionSyncNotice] = useState("");
  const [isProcessingSubmissionId, setIsProcessingSubmissionId] = useState("");
  const [contactThreads, setContactThreads] = useState([]);

  const loadAdminState = useCallback(async () => {
    setIsRefreshing(true);
    setWarning("");
    try {
      const [placesCountRes, eventsCountRes, servicesCountRes, globalEventsRes, moderationRes, contactThreadsRes] =
        await Promise.all([
          fetchPlacesQueryWithFallback({ select: "*", options: { count: "exact", head: true } }),
          supabase.from("events").select("*", { count: "exact", head: true }),
          fetchServicesQuery({ select: "id", options: { count: "exact", head: true } }),
          supabase.from("global_events").select("*", { count: "exact", head: true }),
          syncModerationFromCloud(),
          supabase
            .from("contact_threads")
            .select("id,created_at,updated_at,status,priority,category,subject,message,is_anonymous,sender_name,sender_email,user_id,city_context,page_context")
            .order("created_at", { ascending: false })
            .limit(120),
        ]);

      const reportsRows = moderationRes?.reports || getReports();
      const blockedRows = moderationRes?.blockedItems || getBlockedItems();
      const contactRows = Array.isArray(contactThreadsRes?.data) ? contactThreadsRes.data : [];
      const contactWarning =
        contactThreadsRes?.error &&
        !isMissingRelationError(contactThreadsRes.error)
          ? `Contact inbox unavailable: ${formatDbError(contactThreadsRes.error)}`
          : "";
      const trafficRes = await fetchTrafficSummary(30);

      setReports(reportsRows);
      setBlockedItems(blockedRows);
      setContactThreads(
        contactRows.map((row) => ({
          id: String(row.id || ""),
          createdAt: row.created_at || "",
          updatedAt: row.updated_at || "",
          status: String(row.status || "new"),
          priority: String(row.priority || "normal"),
          category: String(row.category || ""),
          subject: String(row.subject || ""),
          message: String(row.message || ""),
          isAnonymous: Boolean(row.is_anonymous),
          senderName: String(row.sender_name || ""),
          senderEmail: String(row.sender_email || ""),
          userId: String(row.user_id || ""),
          cityContext: String(row.city_context || ""),
          pageContext: String(row.page_context || ""),
        }))
      );
      setSelectedReportIds((current) =>
        current.filter((id) => reportsRows.some((row) => String(row.id) === String(id)))
      );
      setStats({
        places: Number(placesCountRes?.count || 0),
        events: Number(eventsCountRes.count || 0),
        services: Number(servicesCountRes?.count || 0),
        globalEvents: Number(globalEventsRes.count || 0),
        openReports: reportsRows.filter((item) => String(item.status || "open") === "open").length,
        blockedItems: blockedRows.length,
      });
      setTrafficSummary(trafficRes);

      if (moderationRes?.warning || (!trafficRes.ok && trafficRes.message) || contactWarning) {
        setWarning(
          [moderationRes?.warning, !trafficRes.ok ? trafficRes.message : "", contactWarning]
            .filter(Boolean)
            .join(" ")
        );
      }

      setLastSyncedAt(new Date().toISOString());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const updateContactThread = useCallback(
    async (threadId, patch, okMessage = "Contact thread updated.") => {
      const id = String(threadId || "").trim();
      if (!id) return;
      setBusyMap((current) => ({ ...current, [`contact:${id}`]: true }));
      try {
        const { data, error } = await supabase
          .from("contact_threads")
          .update(patch)
          .eq("id", id)
          .select("id,updated_at,status,priority")
          .single();
        if (error) {
          showToast(error.message || "Could not update contact thread.", { tone: "warn", duration: 2400 });
          return;
        }
        setContactThreads((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: String(data?.status || item.status),
                  priority: String(data?.priority || item.priority),
                  updatedAt: String(data?.updated_at || item.updatedAt),
                }
              : item
          )
        );
        showToast(okMessage, { tone: "ok", duration: 1800 });
      } finally {
        setBusyMap((current) => ({ ...current, [`contact:${id}`]: false }));
      }
    },
    [showToast]
  );

  const loadMemberDirectory = useCallback(async () => {
    setMemberDirectoryLoading(true);
    setMemberDirectoryNotice("");
    try {
      let response = await supabase
        .from("member_profiles")
        .select("user_id,display_name,home_city,resident_country,trusted_contributor,avatar_url,avatar_path,updated_at")
        .order("updated_at", { ascending: false })
        .limit(250);

      if (response.error && isMissingColumnError(response.error, "trusted_contributor")) {
        response = await supabase
          .from("member_profiles")
          .select("user_id,display_name,home_city,resident_country,avatar_url,avatar_path,updated_at")
          .order("updated_at", { ascending: false })
          .limit(250);
      }

      if (response.error) {
        setMemberDirectory([]);
        setMemberDirectoryNotice(response.error.message || "Could not load members.");
        return;
      }

      const rows = Array.isArray(response.data) ? response.data : [];
      setMemberDirectory(
        rows.map((row) => ({
          user_id: String(row.user_id || ""),
          display_name: String(row.display_name || "").trim(),
          home_city: String(row.home_city || "").trim(),
          resident_country: String(row.resident_country || "").trim(),
          trusted_contributor: Boolean(row.trusted_contributor),
          avatar_url: resolveAvatarUrlFromProfile(row),
          updated_at: row.updated_at || "",
        }))
      );
    } catch (error) {
      setMemberDirectory([]);
      setMemberDirectoryNotice(error?.message || "Could not load members.");
    } finally {
      setMemberDirectoryLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    if (isAuthLoading) return;
    if (!isMember) {
      localStorage.setItem("qa_redirect", "/admin");
      localStorage.setItem("qa_post_login_target", "/admin");
      queueMicrotask(() => {
        if (!active) return;
        setIsAdmin(false);
        setAdminChecked(true);
        setIsReady(true);
      });
      router.replace("/?join=true");
      return () => {
        active = false;
      };
    }

    queueMicrotask(async () => {
      try {
        const { isAdmin: adminAccess } = await resolveAdminAccess({
          email: user?.email,
        });
        if (!active) return;

        setIsAdmin(adminAccess);
        setAdminChecked(true);
        setIsReady(true);

        if (!adminAccess) return;

        await Promise.all([loadAdminState(), loadMemberDirectory()]);
      } catch (error) {
        if (!active) return;
        setWarning(`Admin data could not be loaded: ${formatDbError(error)}`);
      } finally {
        if (active) {
          setAdminChecked(true);
          setIsReady(true);
        }
      }
    });

    return () => {
      active = false;
    };
  }, [isAuthLoading, isMember, loadAdminState, loadMemberDirectory, router, user?.email]);

  const openReports = useMemo(
    () => reports.filter((item) => String(item.status || "open") === "open"),
    [reports]
  );
  const openContactThreads = useMemo(
    () => contactThreads.filter((item) => item.status !== "resolved" && item.status !== "closed"),
    [contactThreads]
  );

  const toggleReportSelection = (reportId) => {
    const key = String(reportId);
    setSelectedReportIds((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  };

  const toggleTrustedContributor = async (profileRow) => {
    const userId = String(profileRow?.user_id || "");
    if (!userId) return;
    const busyKey = `trusted-toggle-${userId}`;
    setBusyMap((current) => ({ ...current, [busyKey]: true }));
    try {
      const nextValue = !Boolean(profileRow?.trusted_contributor);
      const { error } = await supabase
        .from("member_profiles")
        .update({ trusted_contributor: nextValue })
        .eq("user_id", userId);

      if (error) {
        showToast(error.message || "Could not update trusted contributor.", { tone: "warn", duration: 2400 });
        return;
      }

      setMemberDirectory((current) =>
        current.map((row) =>
          String(row.user_id) === userId
            ? { ...row, trusted_contributor: nextValue, updated_at: new Date().toISOString() }
            : row
        )
      );

      showToast(nextValue ? "Trusted contributor enabled." : "Trusted contributor removed.", {
        tone: "ok",
        duration: 2100,
      });
    } finally {
      setBusyMap((current) => ({ ...current, [busyKey]: false }));
    }
  };

  const filteredMemberDirectory = useMemo(() => {
    const query = String(memberSearch || "").trim().toLowerCase();
    if (!query) return memberDirectory;
    return memberDirectory.filter((row) => {
      const haystack = [
        row.display_name,
        row.home_city,
        row.resident_country,
        row.user_id,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [memberDirectory, memberSearch]);

  const refreshPendingSubmissions = useCallback(async () => {
    if (!isAdmin) {
      setPendingSubmissions([]);
      setSubmissionSyncNotice("");
      return;
    }

    setIsLoadingPendingSubmissions(true);
    const result = await listContentSubmissions({ status: "pending", limit: 120 });
    if (result.tableMissing) {
      setPendingSubmissions([]);
      setSubmissionSyncNotice("Submission queue is not configured yet. Run supabase/content-submissions-v1.sql.");
      setIsLoadingPendingSubmissions(false);
      return;
    }
    if (result.error) {
      setPendingSubmissions([]);
      setSubmissionSyncNotice("Could not load pending submissions right now.");
      setIsLoadingPendingSubmissions(false);
      return;
    }
    setPendingSubmissions(result.data || []);
    setSubmissionSyncNotice("");
    setIsLoadingPendingSubmissions(false);
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      queueMicrotask(() => {
        setPendingSubmissions([]);
        setSubmissionSyncNotice("");
      });
      return;
    }
    queueMicrotask(() => {
      refreshPendingSubmissions();
    });
  }, [isAdmin, refreshPendingSubmissions]);

  const approvePendingSubmission = async (submission) => {
    if (!isAdmin || !submission?.id) return;
    setIsProcessingSubmissionId(String(submission.id));
    try {
      const publishRes = await publishContentSubmission({
        submission,
        reviewer: { id: user?.id, email: user?.email },
      });

      if (publishRes.tableMissing) {
        showToast("Target table is missing in Supabase for this submission.", {
          tone: "warn",
          duration: 2600,
        });
        return;
      }
      if (publishRes.error) {
        showToast(publishRes.error.message || "Could not publish submission.", {
          tone: "warn",
          duration: 2600,
        });
        return;
      }

      showToast("Submission approved and published.", { tone: "ok", duration: 2200 });
      await refreshPendingSubmissions();
      await loadAdminState();
    } finally {
      setIsProcessingSubmissionId("");
    }
  };

  const rejectPendingSubmission = async (submission) => {
    if (!isAdmin || !submission?.id) return;
    setIsProcessingSubmissionId(String(submission.id));
    try {
      const result = await updateContentSubmissionStatus({
        submissionId: submission.id,
        status: "rejected",
        reviewer: { id: user?.id, email: user?.email },
      });
      if (result.tableMissing) {
        showToast("Moderation queue is not configured yet.", { tone: "warn", duration: 2600 });
        return;
      }
      if (result.error) {
        showToast(result.error.message || "Could not reject submission.", { tone: "warn", duration: 2600 });
        return;
      }
      showToast("Submission rejected.", { tone: "info", duration: 2200 });
      await refreshPendingSubmissions();
    } finally {
      setIsProcessingSubmissionId("");
    }
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
      showToast("Blocked item removed.", { tone: "info", duration: 2000 });
      await loadAdminState();
    } finally {
      setBusyMap((current) => ({ ...current, [targetId]: false }));
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
    showToast(`Deleted ${selectedReports.length} report${selectedReports.length === 1 ? "" : "s"}.`, {
      tone: "ok",
      duration: 2100,
    });
    await loadAdminState();
  };

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
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-cyan-100/70">
              Logged in as {memberName || user?.email || "Admin"}
            </p>
            <button
              type="button"
              onClick={async () => {
                await Promise.all([loadAdminState(), loadMemberDirectory(), refreshPendingSubmissions()]);
              }}
              disabled={isRefreshing}
              className="rounded-full border border-cyan-200/25 bg-cyan-200/10 px-4 py-2 text-xs uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40 disabled:opacity-60"
            >
              {isRefreshing ? "Refreshing..." : "Refresh dashboard"}
            </button>
          </div>
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

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <article className="rounded-3xl border border-cyan-200/18 bg-cyan-200/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Places</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.places}</p>
          </article>
          <article className="rounded-3xl border border-violet-200/18 bg-violet-200/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-violet-100/75">Events</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.events}</p>
          </article>
          <article className="rounded-3xl border border-emerald-200/18 bg-emerald-200/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/75">Services</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.services}</p>
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

        <section className="mb-8 rounded-[30px] border border-sky-300/16 bg-[linear-gradient(180deg,rgba(10,32,56,0.82),rgba(10,10,10,0.98))] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sky-100/80">Traffic</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Visitor snapshot (30 days)</h2>
              <p className="mt-1 text-xs text-white/60">
                Approximate unique visitors and page visits from first-party route telemetry.
              </p>
            </div>
            <span className="rounded-full border border-sky-200/22 bg-sky-200/10 px-3 py-1 text-xs text-sky-100">
              {trafficSummary.ok ? `${trafficSummary.totals.visitors30} visitors` : "Not configured"}
            </span>
          </div>

          {trafficSummary.ok ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <article className="rounded-2xl border border-white/12 bg-white/6 p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Today</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{trafficSummary.totals.visitorsToday}</p>
                  <p className="mt-1 text-[11px] text-white/45">visits: {trafficSummary.totals.visitsToday}</p>
                </article>
                <article className="rounded-2xl border border-white/12 bg-white/6 p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">7 days</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{trafficSummary.totals.visitors7}</p>
                  <p className="mt-1 text-[11px] text-white/45">visits: {trafficSummary.totals.visits7}</p>
                </article>
                <article className="rounded-2xl border border-white/12 bg-white/6 p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">30 days</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{trafficSummary.totals.visitors30}</p>
                  <p className="mt-1 text-[11px] text-white/45">visits: {trafficSummary.totals.visits30}</p>
                </article>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <article className="rounded-2xl border border-white/12 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/60">Top cities</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {trafficSummary.topCities.length > 0 ? (
                      trafficSummary.topCities.map((entry) => (
                        <span
                          key={`traffic-city-${entry.city}`}
                          className="rounded-full border border-sky-200/20 bg-sky-200/10 px-3 py-1 text-xs text-sky-100"
                        >
                          {entry.city}: {entry.visits}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-white/52">No city-level traffic yet.</span>
                    )}
                  </div>
                </article>

                <article className="rounded-2xl border border-white/12 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/60">Top routes</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {trafficSummary.topRoutes.length > 0 ? (
                      trafficSummary.topRoutes.map((entry) => (
                        <span
                          key={`traffic-route-${entry.route}`}
                          className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs text-white/82"
                        >
                          {entry.route}: {entry.visits}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-white/52">No route traffic yet.</span>
                    )}
                  </div>
                </article>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-amber-200/20 bg-amber-200/10 px-4 py-3 text-sm text-amber-100/90">
              Traffic data is not configured yet. Run <code>supabase/traffic-visitors-v1.sql</code> to enable visitor reporting in admin.
            </div>
          )}
        </section>

        <section className="mb-8 rounded-[30px] border border-indigo-300/16 bg-[linear-gradient(180deg,rgba(24,20,54,0.88),rgba(10,10,10,0.98))] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-indigo-100/78">Member access</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Trusted contributors</h2>
              <p className="mt-1 text-xs text-white/62">
                Toggle publishing privileges for vetted members.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-indigo-200/22 bg-indigo-200/10 px-3 py-1 text-xs text-indigo-100">
                Members: {memberDirectory.length}
              </span>
              <button
                type="button"
                onClick={loadMemberDirectory}
                className="rounded-full border border-white/14 bg-white/8 px-3 py-1 text-xs text-white/80 transition hover:border-indigo-200/35 hover:text-indigo-100"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/12 bg-black/25 p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <input
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="Search by name, city, country or user id..."
                className="w-full rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none md:max-w-md"
              />
              <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs text-white/72">
                Showing {filteredMemberDirectory.length}
              </span>
            </div>

            {memberDirectoryNotice && (
              <div className="mb-3 rounded-xl border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
                {memberDirectoryNotice}
              </div>
            )}

            {memberDirectoryLoading ? (
              <div className="rounded-xl border border-dashed border-white/12 px-4 py-6 text-sm text-white/58">
                Loading member directory...
              </div>
            ) : filteredMemberDirectory.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/12 px-4 py-6 text-sm text-white/58">
                No members match current search.
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-[#101320] text-xs uppercase tracking-[0.12em] text-white/55">
                    <tr>
                      <th className="px-3 py-2">Member</th>
                      <th className="px-3 py-2">City</th>
                      <th className="px-3 py-2">Country</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMemberDirectory.map((row) => {
                      const busyKey = `trusted-toggle-${row.user_id}`;
                      const isBusy = Boolean(busyMap[busyKey]);
                      const trusted = Boolean(row.trusted_contributor);
                      return (
                        <tr key={`member-row-${row.user_id}`} className="border-t border-white/8">
                          <td className="px-3 py-2">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/16 bg-white/8 text-[11px] font-semibold text-white/82">
                                {row.avatar_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={row.avatar_url} alt={row.display_name || "Member"} className="h-full w-full object-cover" />
                                ) : (
                                  (String(row.display_name || "Member")
                                    .split(/\s+/)
                                    .filter(Boolean)
                                    .slice(0, 2)
                                    .map((part) => part.charAt(0).toUpperCase())
                                    .join("") || "M")
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-white">{row.display_name || "Member"}</p>
                                <p className="truncate text-[11px] text-white/48">{row.user_id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-white/78">{row.home_city || "-"}</td>
                          <td className="px-3 py-2 text-white/78">{row.resident_country || "-"}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`rounded-full border px-2 py-1 text-[11px] ${
                                trusted
                                  ? "border-cyan-200/26 bg-cyan-200/12 text-cyan-100"
                                  : "border-white/16 bg-white/8 text-white/70"
                              }`}
                            >
                              {trusted ? "Trusted" : "Standard"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => toggleTrustedContributor(row)}
                              disabled={isBusy}
                              className={`rounded-full border px-3 py-1 text-xs transition ${
                                trusted
                                  ? "border-rose-200/24 bg-rose-200/10 text-rose-100 hover:border-rose-200/38"
                                  : "border-emerald-200/24 bg-emerald-200/10 text-emerald-100 hover:border-emerald-200/38"
                              } disabled:opacity-60`}
                            >
                              {isBusy ? "Saving..." : trusted ? "Remove trusted" : "Make trusted"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="mb-8 rounded-[30px] border border-indigo-300/16 bg-[linear-gradient(180deg,rgba(24,22,58,0.82),rgba(10,10,10,0.98))] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-100/80">Moderation Queue</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Pending member entries</h2>
              <p className="mt-2 text-sm text-white/65">
                Approve or reject member-added venues, events, services, and Voices stories before they go live.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-indigo-200/20 bg-indigo-200/10 px-3 py-1 text-xs text-indigo-100">
                Pending: {pendingSubmissions.length}
              </span>
              <button
                type="button"
                onClick={refreshPendingSubmissions}
                className="rounded-full border border-white/16 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white/78 transition hover:border-indigo-200/35 hover:text-indigo-100"
              >
                Refresh
              </button>
            </div>
          </div>

          {submissionSyncNotice ? (
            <div className="mb-3 rounded-xl border border-amber-200/24 bg-amber-200/12 px-3 py-2 text-xs text-amber-100">
              {submissionSyncNotice}
            </div>
          ) : null}

          {isLoadingPendingSubmissions ? (
            <div className="rounded-2xl border border-dashed border-white/14 px-4 py-8 text-sm text-white/55">
              Loading pending submissions...
            </div>
          ) : pendingSubmissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/14 px-4 py-8 text-sm text-white/55">
              No pending submissions right now.
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {pendingSubmissions.map((submission) => {
                const payload = submission?.payload && typeof submission.payload === "object" ? submission.payload : {};
                const statusBusy = isProcessingSubmissionId === String(submission.id);
                const submissionName = String(submission?.title || payload?.name || "Untitled");

                return (
                  <article key={submission.id} className="rounded-2xl border border-white/12 bg-black/25 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
                        {String(submission.entity_type || "item")} | {formatCityLabel(String(submission.city || "global"))}
                      </p>
                      <p className="text-xs text-white/45">{timeAgo(submission.created_at)}</p>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-white">{submissionName}</p>
                    <p className="mt-2 text-xs text-white/65">
                      by {String(submission.submitted_by_name || submission.submitted_by_email || "Member")}
                      {submission.is_trusted_contributor ? " | trusted" : ""}
                    </p>
                    {payload?.description ? (
                      <p className="mt-2 line-clamp-3 text-sm text-white/70">{String(payload.description)}</p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => approvePendingSubmission(submission)}
                        disabled={statusBusy}
                        className="rounded-full border border-emerald-200/26 bg-emerald-200/12 px-3 py-1 text-xs text-emerald-100 transition hover:border-emerald-200/45 disabled:opacity-60"
                      >
                        {statusBusy ? "Working..." : "Approve & publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectPendingSubmission(submission)}
                        disabled={statusBusy}
                        className="rounded-full border border-rose-200/26 bg-rose-200/12 px-3 py-1 text-xs text-rose-100 transition hover:border-rose-200/45 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
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
                        {formatTitle(report.targetType)}  |  {report.city || "Global"}
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

        <section className="mb-8 rounded-[30px] border border-cyan-300/16 bg-[linear-gradient(180deg,rgba(7,32,52,0.84),rgba(10,10,10,0.98))] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Contact inbox</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Home contact threads</h2>
            </div>
            <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100">
              {openContactThreads.length} open
            </span>
          </div>
          <div className="space-y-3">
            {contactThreads.length > 0 ? (
              contactThreads.map((thread) => (
                <article key={thread.id} className="rounded-2xl border border-white/12 bg-black/25 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/14 bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/75">
                          {formatContactCategory(thread.category)}
                        </span>
                        <span className="rounded-full border border-white/14 bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/70">
                          {thread.status}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${
                            thread.priority === "urgent"
                              ? "border-rose-200/30 bg-rose-200/12 text-rose-100"
                              : thread.priority === "high"
                                ? "border-amber-200/30 bg-amber-200/12 text-amber-100"
                                : "border-white/14 bg-white/6 text-white/70"
                          }`}
                        >
                          {thread.priority}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white">{thread.subject || "Contact message"}</p>
                      <p className="mt-2 text-sm leading-6 text-white/80">{thread.message}</p>
                      <p className="mt-2 text-xs text-white/55">
                        From{" "}
                        {thread.isAnonymous
                          ? "Anonymous"
                          : thread.senderName || thread.senderEmail || thread.userId || "Unknown"}
                        {thread.senderEmail ? ` | ${thread.senderEmail}` : ""}
                        {thread.cityContext ? ` | ${formatCityLabel(thread.cityContext)}` : ""}
                        {thread.pageContext ? ` | ${thread.pageContext}` : ""}
                      </p>
                      <p className="mt-1 text-[11px] text-white/45">
                        Created {timeAgo(thread.createdAt)} | Updated {timeAgo(thread.updatedAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={Boolean(busyMap[`contact:${thread.id}`])}
                        onClick={() =>
                          updateContactThread(
                            thread.id,
                            { status: "in_review" },
                            "Contact thread moved to in review."
                          )
                        }
                        className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40 disabled:opacity-60"
                      >
                        In review
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(busyMap[`contact:${thread.id}`])}
                        onClick={() =>
                          updateContactThread(
                            thread.id,
                            { priority: "high" },
                            "Priority set to high."
                          )
                        }
                        className="rounded-full border border-amber-200/24 bg-amber-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-amber-100 transition hover:border-amber-200/40 disabled:opacity-60"
                      >
                        High priority
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(busyMap[`contact:${thread.id}`])}
                        onClick={() =>
                          updateContactThread(
                            thread.id,
                            { status: "resolved" },
                            "Contact thread resolved."
                          )
                        }
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
                No contact threads yet. Messages from Home Contact Us will appear here.
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
                        {formatTitle(item.targetType)}  |  {item.city || "Global"}
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





