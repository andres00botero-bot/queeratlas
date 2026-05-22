"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { citySelectionPath } from "@/lib/cityRouting";
import { fetchPlacesQueryWithFallback } from "@/lib/placesDataApi";
import { fetchServicesQuery } from "@/lib/servicesDataApi";
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
import { getKpiSummary } from "@/lib/analytics";
import { fetchTrafficSummary } from "@/lib/trafficAnalytics";
import { resolveAdminAccess } from "@/lib/adminAccess";
import {
  listContentSubmissions,
  publishContentSubmission,
  updateContentSubmissionStatus,
} from "@/lib/contentSubmissions";
import {
  buildVibeDualWriteFields,
  isMissingVibeTagsColumnError,
  normalizeVibeTags,
} from "@/lib/vibeTaxonomy";
import PageOpeningState from "@/components/ui/PageOpeningState";
import { useActionToast } from "@/lib/useActionToast";
import ActionToast from "@/components/ui/ActionToast";
import VibeTagPicker from "@/components/ui/VibeTagPicker";
import VibeTagChips from "@/components/ui/VibeTagChips";

const MEMBER_AVATAR_BUCKET = "member-avatars";
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

function formatPercent(part, total) {
  const numerator = Number(part || 0);
  const denominator = Number(total || 0);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return "0%";
  return `${Math.round((numerator / denominator) * 100)}%`;
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
  const [places, setPlaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [services, setServices] = useState([]);
  const [globalEvents, setGlobalEvents] = useState([]);
  const [qualityMap, setQualityMap] = useState({});
  const [fixedLog, setFixedLog] = useState(() => readLocalJson(FIXED_LOG_KEY, {}));
  const [queueCityFilter, setQueueCityFilter] = useState("all");
  const [queueTypeFilter, setQueueTypeFilter] = useState("all");
  const [queueEntityFilter, setQueueEntityFilter] = useState("all");
  const [selectedReportIds, setSelectedReportIds] = useState([]);
  const [selectedQueueKeys, setSelectedQueueKeys] = useState([]);
  const [selectedVibeKeys, setSelectedVibeKeys] = useState([]);
  const [vibeDraftTags, setVibeDraftTags] = useState([]);
  const [vibeEntityFilter, setVibeEntityFilter] = useState("all");
  const [vibeCityFilter, setVibeCityFilter] = useState("all");
  const [vibeStatusFilter, setVibeStatusFilter] = useState("all");
  const [latestVibeMigrationRun, setLatestVibeMigrationRun] = useState(null);
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
  const [kpiSummary, setKpiSummary] = useState(() => getKpiSummary(7));
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
      const [placesCountRes, eventsCountRes, servicesCountRes, globalEventsRes, moderationRes, placesRes, eventsRes, servicesRes, globalListRes, contactThreadsRes] =
        await Promise.all([
        fetchPlacesQueryWithFallback({ select: "*", options: { count: "exact", head: true } }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        fetchServicesQuery({ select: "id", options: { count: "exact", head: true } }),
        supabase.from("global_events").select("*", { count: "exact", head: true }),
        syncModerationFromCloud(),
        fetchPlacesQueryWithFallback({ select: "id,name,city,type,vibe,vibe_tags" }),
        supabase.from("events").select("id,name,city,date,vibe,vibe_tags"),
        fetchServicesQuery({ select: "id,name,city,type,vibe,vibe_tags" }),
        supabase.from("global_events").select("id,name,city,date,vibe,vibe_tags"),
        supabase
          .from("contact_threads")
          .select("id,created_at,updated_at,status,priority,category,subject,message,is_anonymous,sender_name,sender_email,user_id,city_context,page_context")
          .order("created_at", { ascending: false })
          .limit(120),
      ]);

      const reportsRows = moderationRes?.reports || getReports();
      const blockedRows = moderationRes?.blockedItems || getBlockedItems();
      const placesRows = Array.isArray(placesRes.data) ? placesRes.data : [];
      const eventsRows = Array.isArray(eventsRes.data) ? eventsRes.data : [];
      const servicesRows = Array.isArray(servicesRes.data) ? servicesRes.data : [];
      const globalRows = Array.isArray(globalListRes.data) ? globalListRes.data : [];
      const contactRows = Array.isArray(contactThreadsRes?.data) ? contactThreadsRes.data : [];
      const contactWarning =
        contactThreadsRes?.error &&
        !isMissingRelationError(contactThreadsRes.error)
          ? `Contact inbox unavailable: ${formatDbError(contactThreadsRes.error)}`
          : "";
      let migrationRunWarning = "";
      let nextLatestRun = null;
      const trafficRes = await fetchTrafficSummary(30);

      const latestRunRes = await supabase
        .from("qa_vibe_migration_runs")
        .select("run_id,status,created_at,staged_at,applied_at,reverted_at,updated_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestRunRes.error && !isMissingRelationError(latestRunRes.error)) {
        migrationRunWarning = `Vibe migration run status unavailable: ${formatDbError(
          latestRunRes.error
        )}`;
      } else {
        nextLatestRun = latestRunRes.data || null;
      }

      setReports(reportsRows);
      setBlockedItems(blockedRows);
      setPlaces(placesRows);
      setEvents(eventsRows);
      setServices(servicesRows);
      setGlobalEvents(globalRows);
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
      setLatestVibeMigrationRun(nextLatestRun);
      setQualityMap(getQualityMap());
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

      if (moderationRes?.warning || migrationRunWarning || (!trafficRes.ok && trafficRes.message) || contactWarning) {
        setWarning(
          [moderationRes?.warning, migrationRunWarning, !trafficRes.ok ? trafficRes.message : "", contactWarning]
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
    if (isAuthLoading) return;
    if (!isMember) {
      localStorage.setItem("qa_redirect", "/admin");
      localStorage.setItem("qa_post_login_target", "/admin");
      router.replace("/?join=true");
      queueMicrotask(() => {
        setIsReady(true);
      });
      return;
    }

    queueMicrotask(async () => {
      const { isAdmin: adminAccess } = await resolveAdminAccess({
        email: user?.email,
      });

      setIsAdmin(adminAccess);
      setAdminChecked(true);

      if (!adminAccess) {
        setIsReady(true);
        return;
      }

      await loadAdminState();
      await loadMemberDirectory();
      setIsReady(true);
    });
  }, [isAuthLoading, isMember, loadAdminState, loadMemberDirectory, router, user?.email]);

  const openReports = useMemo(
    () => reports.filter((item) => String(item.status || "open") === "open"),
    [reports]
  );
  const openContactThreads = useMemo(
    () => contactThreads.filter((item) => item.status !== "resolved" && item.status !== "closed"),
    [contactThreads]
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
    queueMicrotask(() => {
      setKpiSummary(getKpiSummary(7));
    });
    const timer = window.setInterval(() => {
      setKpiSummary(getKpiSummary(7));
    }, 30000);
    return () => window.clearInterval(timer);
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

    const serviceItems = services.map((item) => {
      const quality = getEntityQuality({
        targetType: "service",
        targetId: item.id,
        entity: item,
        map: qualityMap,
      });
      const qualityStatus = getQualityStatus(quality);
      return {
        key: `service:${item.id}`,
        targetType: "service",
        targetId: String(item.id),
        city: String(item.city || ""),
        type: String(item.type || "service"),
        name: item.name || "Service",
        quality,
        qualityStatus,
      };
    });

    return [...placeItems, ...eventItems, ...serviceItems]
      .filter((item) => item.qualityStatus.stale)
      .sort((a, b) => {
        const aFixed = isWithinDays(fixedLog[a.key], 7) ? 1 : 0;
        const bFixed = isWithinDays(fixedLog[b.key], 7) ? 1 : 0;
        if (aFixed !== bFixed) return aFixed - bFixed;
        return String(a.city).localeCompare(String(b.city));
      });
  }, [events, fixedLog, places, qualityMap, services]);

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

  const vibeQueue = useMemo(() => {
    const placeItems = places.map((item) => ({
      key: `place:${item.id}`,
      targetType: "place",
      targetId: String(item.id),
      city: String(item.city || ""),
      type: String(item.type || ""),
      name: item.name || "Place",
      vibe: String(item.vibe || ""),
      vibe_tags: normalizeVibeTags(item.vibe_tags, { max: 3 }),
    }));

    const eventItems = events.map((item) => ({
      key: `event:${item.id}`,
      targetType: "event",
      targetId: String(item.id),
      city: String(item.city || ""),
      type: "event",
      name: item.name || "Event",
      vibe: String(item.vibe || ""),
      vibe_tags: normalizeVibeTags(item.vibe_tags, { max: 3 }),
    }));

    const serviceItems = services.map((item) => ({
      key: `service:${item.id}`,
      targetType: "service",
      targetId: String(item.id),
      city: String(item.city || ""),
      type: String(item.type || "service"),
      name: item.name || "Service",
      vibe: String(item.vibe || ""),
      vibe_tags: normalizeVibeTags(item.vibe_tags, { max: 3 }),
    }));

    const globalEventItems = globalEvents.map((item) => ({
      key: `global_event:${item.id}`,
      targetType: "global_event",
      targetId: String(item.id),
      city: String(item.city || ""),
      type: "off-grid event",
      name: item.name || "Off-grid event",
      vibe: String(item.vibe || ""),
      vibe_tags: normalizeVibeTags(item.vibe_tags, { max: 3 }),
    }));

    return [...placeItems, ...eventItems, ...serviceItems, ...globalEventItems].sort((a, b) => {
      const cityCompare = String(a.city || "").localeCompare(String(b.city || ""));
      if (cityCompare !== 0) return cityCompare;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  }, [events, globalEvents, places, services]);

  const vibeCityOptions = useMemo(
    () =>
      [...new Set(vibeQueue.map((item) => item.city).filter(Boolean))].sort((a, b) =>
        String(a).localeCompare(String(b))
      ),
    [vibeQueue]
  );

  const filteredVibeQueue = useMemo(() => {
    const filtered = vibeQueue.filter((item) => {
      const cityOk = vibeCityFilter === "all" || item.city === vibeCityFilter;
      const entityOk = vibeEntityFilter === "all" || item.targetType === vibeEntityFilter;
      const statusOk =
        vibeStatusFilter === "all" ||
        (vibeStatusFilter === "missing" && item.vibe_tags.length === 0) ||
        (vibeStatusFilter === "tagged" && item.vibe_tags.length > 0);
      return cityOk && entityOk && statusOk;
    });

    if (vibeStatusFilter !== "all") return filtered;

    return filtered.slice().sort((a, b) => {
      const aMissing = a.vibe_tags.length === 0 ? 1 : 0;
      const bMissing = b.vibe_tags.length === 0 ? 1 : 0;
      if (aMissing !== bMissing) return bMissing - aMissing;

      const cityCompare = String(a.city || "").localeCompare(String(b.city || ""));
      if (cityCompare !== 0) return cityCompare;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  }, [vibeCityFilter, vibeEntityFilter, vibeQueue, vibeStatusFilter]);

  const filteredMissingVibeQueue = useMemo(
    () => filteredVibeQueue.filter((item) => item.vibe_tags.length === 0),
    [filteredVibeQueue]
  );
  const missingVibeRowsForCsv = useMemo(
    () =>
      filteredMissingVibeQueue.map((item) => ({
        key: item.key,
        target_type: item.targetType,
        target_id: item.targetId,
        city: item.city || "",
        entity_type: item.type || "",
        name: item.name || "",
        legacy_vibe: item.vibe || "",
      })),
    [filteredMissingVibeQueue]
  );
  const legacyVibeRowsForCsv = useMemo(
    () =>
      filteredVibeQueue
        .filter((item) => String(item.vibe || "").trim() !== "")
        .map((item) => {
          const legacyMappedTags = normalizeVibeTags([item.vibe], { max: 3 });
          return {
            key: item.key,
            target_type: item.targetType,
            target_id: item.targetId,
            city: item.city || "",
            entity_type: item.type || "",
            name: item.name || "",
            legacy_vibe: item.vibe || "",
            current_vibe_tags: Array.isArray(item.vibe_tags) ? item.vibe_tags.join("|") : "",
            legacy_maps_to_tags: legacyMappedTags.join("|"),
            needs_manual_review: legacyMappedTags.length === 0 ? "yes" : "no",
          };
        }),
    [filteredVibeQueue]
  );

  const vibeCoverageCards = useMemo(() => {
    const buildCard = (key, label, rows) => {
      const total = Array.isArray(rows) ? rows.length : 0;
      const tagged = (Array.isArray(rows) ? rows : []).filter(
        (row) => normalizeVibeTags(row?.vibe_tags, { max: 3 }).length > 0
      ).length;
      const missing = Math.max(total - tagged, 0);
      return {
        key,
        label,
        total,
        tagged,
        missing,
        percentLabel: formatPercent(tagged, total),
      };
    };

    const cards = [
      buildCard("places", "Places", places),
      buildCard("events", "City events", events),
      buildCard("services", "Services", services),
      buildCard("global_events", "Off-grid events", globalEvents),
    ];

    const totals = cards.reduce(
      (acc, card) => ({
        total: acc.total + card.total,
        tagged: acc.tagged + card.tagged,
        missing: acc.missing + card.missing,
      }),
      { total: 0, tagged: 0, missing: 0 }
    );

    return {
      cards,
      totals: {
        ...totals,
        percentLabel: formatPercent(totals.tagged, totals.total),
      },
    };
  }, [events, globalEvents, places, services]);

  const vibeMigrationHealth = useMemo(() => {
    const missing = Number(vibeCoverageCards?.totals?.missing || 0);
    const allClear = missing === 0;
    return {
      allClear,
      label: allClear ? "Migration healthy" : "Migration needs attention",
      detail: allClear
        ? "No rows are missing vibe tags."
        : `${missing} row${missing === 1 ? "" : "s"} still missing tags.`,
      toneClass: allClear
        ? "border-emerald-200/20 bg-emerald-200/10 text-emerald-100"
        : "border-amber-200/24 bg-amber-200/12 text-amber-100",
    };
  }, [vibeCoverageCards]);

  const vibeMigrationRunSummary = useMemo(() => {
    if (!latestVibeMigrationRun) {
      return {
        label: "No run metadata",
        detail: "No migration run found yet in this environment.",
        toneClass: "border-white/12 bg-black/25 text-white/85",
      };
    }

    const status = String(latestVibeMigrationRun.status || "unknown").toLowerCase();
    const statusLabel =
      status === "completed" || status === "applied"
        ? "Applied"
        : status === "staged"
          ? "Staged"
          : status === "reverted"
            ? "Reverted"
            : "Created";

    const toneClass =
      status === "completed" || status === "applied"
        ? "border-emerald-200/20 bg-emerald-200/10 text-emerald-100"
        : status === "staged"
          ? "border-cyan-200/20 bg-cyan-200/10 text-cyan-100"
          : status === "reverted"
            ? "border-amber-200/24 bg-amber-200/12 text-amber-100"
            : "border-white/12 bg-black/25 text-white/85";

    const updatedAt =
      latestVibeMigrationRun.updated_at ||
      latestVibeMigrationRun.applied_at ||
      latestVibeMigrationRun.staged_at ||
      latestVibeMigrationRun.created_at;

    return {
      label: `Latest run: ${statusLabel}`,
      detail: `${latestVibeMigrationRun.run_id || "unknown"}  |  ${timeAgo(updatedAt)}`,
      toneClass,
    };
  }, [latestVibeMigrationRun]);

  useEffect(() => {
    const allowed = new Set(filteredRefreshQueue.map((item) => String(item.key)));
    queueMicrotask(() => {
      setSelectedQueueKeys((current) => current.filter((key) => allowed.has(String(key))));
    });
  }, [filteredRefreshQueue]);

  useEffect(() => {
    const allowed = new Set(filteredVibeQueue.map((item) => String(item.key)));
    queueMicrotask(() => {
      setSelectedVibeKeys((current) => current.filter((key) => allowed.has(String(key))));
    });
  }, [filteredVibeQueue]);

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

      appendAuditLog("member_trusted_toggle", `${userId} -> ${nextValue ? "trusted" : "standard"}`);
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

  const toggleVibeSelection = (queueKey) => {
    const key = String(queueKey);
    setSelectedVibeKeys((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  };

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

      appendAuditLog(
        "submission_approved",
        `${String(submission.entity_type || "item")}:${String(submission.id)}`
      );
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
      appendAuditLog(
        "submission_rejected",
        `${String(submission.entity_type || "item")}:${String(submission.id)}`
      );
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
    if (item.targetType === "event") {
      router.push(citySelectionPath(item.city, { eventId: item.targetId }));
      return;
    }
    if (item.targetType === "service") {
      router.push(citySelectionPath(item.city, { extraParams: { serviceId: item.targetId } }));
      return;
    }
    router.push(citySelectionPath(item.city, { placeId: item.targetId }));
  };

  const openVibeItem = (item) => {
    if (!item?.targetType || !item?.targetId) return;
    if (item.targetType === "global_event") {
      router.push(`/events?offgridEventId=global-${encodeURIComponent(String(item.targetId))}`);
      return;
    }
    openQueueItem(item);
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

      if (item.targetType === "global_event") {
        const { error } = await supabase.from("global_events").delete().eq("id", String(item.targetId));
        if (error) {
          if (!silent) {
            showToast(`Could not delete off-grid event: ${formatDbError(error)}`, { tone: "warn", duration: 2600 });
          }
          return { deleted: 0, skipped: 0, failed: 1 };
        }
        appendAuditLog("queue_delete", `global_event:${item.targetId}`);
        if (!silent) {
          showToast("Off-grid event deleted.", { tone: "ok", duration: 1800 });
          await loadAdminState();
        }
        return { deleted: 1, skipped: 0, failed: 0 };
      }

      if (item.targetType === "service") {
        const numericServiceId = Number(item.targetId);
        if (!Number.isFinite(numericServiceId)) {
          if (!silent) {
            showToast("Seeded service cannot be deleted. Use Hide instead.", { tone: "info", duration: 2600 });
          }
          return { deleted: 0, skipped: 1, failed: 0 };
        }

        const { error } = await supabase.from("services").delete().eq("id", numericServiceId);
        if (error) {
          if (!silent) {
            showToast(`Could not delete service: ${formatDbError(error)}`, { tone: "warn", duration: 2600 });
          }
          return { deleted: 0, skipped: 0, failed: 1 };
        }

        appendAuditLog("queue_delete", `service:${item.targetId}`);
        if (!silent) {
          showToast("Service deleted.", { tone: "ok", duration: 1800 });
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

  const updateEntityVibeTags = async (item, nextTags) => {
    if (!item?.targetType || !item?.targetId) {
      return { error: { message: "Missing target metadata." } };
    }

    const tableMap = {
      place: "places",
      event: "events",
      service: "services",
      global_event: "global_events",
    };
    const tableName = tableMap[item.targetType];
    if (!tableName) {
      return { error: { message: "Unsupported target type." } };
    }

    const normalizedTags = normalizeVibeTags(nextTags, { max: 3 });
    const vibeFields = buildVibeDualWriteFields({
      vibe: item.vibe,
      vibeTags: normalizedTags,
    });

    const targetIdValue =
      (item.targetType === "place" || item.targetType === "service") &&
      Number.isFinite(Number(item.targetId))
        ? Number(item.targetId)
        : String(item.targetId);

    const tryUpdate = async (payload) =>
      supabase.from(tableName).update(payload).eq("id", targetIdValue).select("id,vibe,vibe_tags").single();

    let attempt = await tryUpdate(vibeFields);
    if (!attempt.error) return attempt;

    const errorText = `${attempt.error?.code || ""} ${attempt.error?.message || ""}`.toLowerCase();
    const missingVibeColumn =
      /\bvibe\b/.test(errorText) &&
      (errorText.includes("column") || errorText.includes("schema cache"));
    const missingVibeTagsColumn = isMissingVibeTagsColumnError(attempt.error);

    if (!missingVibeColumn && !missingVibeTagsColumn) return attempt;

    const fallbackPayload = { ...vibeFields };
    if (missingVibeColumn) delete fallbackPayload.vibe;
    if (missingVibeTagsColumn) delete fallbackPayload.vibe_tags;
    if (Object.keys(fallbackPayload).length === 0) return attempt;

    attempt = await tryUpdate(fallbackPayload);
    return attempt;
  };

  const runBulkApplyVibeTags = async (selectedItems, actionName, context = {}) => {
    const normalizedTags = normalizeVibeTags(vibeDraftTags, { max: 3 });
    if (normalizedTags.length === 0) {
      showToast("Pick at least one vibe tag.", { tone: "info", duration: 1700 });
      return;
    }

    if (selectedItems.length === 0) {
      showToast("No matching items for current filters.", { tone: "info", duration: 1800 });
      return;
    }

    const busyKey = "bulk-vibe-apply";
    setBusyMap((current) => ({ ...current, [busyKey]: true }));
    let updated = 0;
    let failed = 0;

    try {
      for (const item of selectedItems) {
        const result = await updateEntityVibeTags(item, normalizedTags);
        if (result?.error) {
          failed += 1;
          continue;
        }
        updated += 1;
      }

      const entityFilterLabel = context.entityFilter || "all";
      const cityFilterLabel = context.cityFilter || "all";
      const statusFilterLabel = context.statusFilter || "all";
      const modeLabel = context.mode || "selected";
      const detail = [
        `mode=${modeLabel}`,
        `tags=[${normalizedTags.join(",")}]`,
        `filters(entity=${entityFilterLabel},city=${cityFilterLabel},status=${statusFilterLabel})`,
        `targeted=${selectedItems.length}`,
        `updated=${updated}`,
        `failed=${failed}`,
      ].join(" | ");
      appendAuditLog(actionName, detail);
      if (failed > 0) {
        showToast(`Updated ${updated}. Failed ${failed}.`, { tone: "warn", duration: 2600 });
      } else {
        showToast(`Updated ${updated} item${updated === 1 ? "" : "s"} vibe tags.`, {
          tone: "ok",
          duration: 2200,
        });
      }
      setSelectedVibeKeys([]);
      await loadAdminState();
    } finally {
      setBusyMap((current) => ({ ...current, [busyKey]: false }));
    }
  };

  const bulkApplyVibeTags = async () => {
    if (selectedVibeKeys.length === 0) {
      showToast("Select items first.", { tone: "info", duration: 1700 });
      return;
    }
    const selectedSet = new Set(selectedVibeKeys.map(String));
    const selectedItems = filteredVibeQueue.filter((item) => selectedSet.has(String(item.key)));
    await runBulkApplyVibeTags(selectedItems, "bulk_vibe_tags_set", {
      mode: "selected",
      entityFilter: vibeEntityFilter,
      cityFilter: vibeCityFilter,
      statusFilter: vibeStatusFilter,
    });
  };

  const bulkApplyVibeTagsToMissingVisible = async () => {
    if (filteredMissingVibeQueue.length === 0) {
      showToast("No missing-tag rows in current filter.", { tone: "info", duration: 1800 });
      return;
    }
    await runBulkApplyVibeTags(filteredMissingVibeQueue, "bulk_vibe_tags_set_missing_visible", {
      mode: "missing_visible",
      entityFilter: vibeEntityFilter,
      cityFilter: vibeCityFilter,
      statusFilter: vibeStatusFilter,
    });
  };

  const focusMissingVibeCoverage = () => {
    setVibeEntityFilter("all");
    setVibeCityFilter("all");
    setVibeStatusFilter("missing");
    setSelectedVibeKeys([]);
    showToast("Filtered to rows missing vibe tags.", { tone: "info", duration: 1700 });
  };

  const exportMissingVibeRowsCsv = () => {
    if (missingVibeRowsForCsv.length === 0) {
      showToast("No missing-tag rows in current filter.", { tone: "info", duration: 1700 });
      return;
    }
    exportCsv(missingVibeRowsForCsv, `vibe-missing-rows-${Date.now()}.csv`);
  };

  const exportLegacyVibeRowsCsv = () => {
    if (legacyVibeRowsForCsv.length === 0) {
      showToast("No legacy vibe rows in current filter.", { tone: "info", duration: 1700 });
      return;
    }
    exportCsv(legacyVibeRowsForCsv, `vibe-legacy-review-${Date.now()}.csv`);
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
                plans: {kpiSummary.counts.planSaved}  |  reviews: {kpiSummary.counts.reviewSubmitted}
              </p>
            </article>
            <article className="rounded-2xl border border-white/12 bg-white/6 p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Contributions</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {kpiSummary.counts.placeAdded + kpiSummary.counts.eventAdded + kpiSummary.counts.serviceAdded}
              </p>
              <p className="mt-1 text-[11px] text-white/45">
                places: {kpiSummary.counts.placeAdded}  |  events: {kpiSummary.counts.eventAdded}  |  services: {kpiSummary.counts.serviceAdded}
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

        <section className="mb-8 rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Workflow shortcuts</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Jump to admin surfaces</h2>
            </div>
            <button
              type="button"
              onClick={async () => {
                await loadAdminState();
                await loadMemberDirectory();
              }}
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
                <p className="mt-1">Auth -&gt; Providers -&gt; Email enabled</p>
                <p>Auth -&gt; URL Configuration -&gt; Site URL = your live URL</p>
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
              <option value="all">Places + events + services</option>
              <option value="place">Places only</option>
              <option value="event">Events only</option>
              <option value="service">Services only</option>
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
                          {formatTitle(item.targetType)}  |  {item.city || "Global"}  |  {formatTitle(item.type)}
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

        <section className="mb-8 rounded-[30px] border border-emerald-300/16 bg-[linear-gradient(180deg,rgba(6,42,30,0.84),rgba(10,10,10,0.98))] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">Taxonomy ops</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Bulk vibe tags</h2>
              <p className="mt-1 text-xs text-white/60">
                Standardize vibe tags across places, services, city events, and off-grid events.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1 text-xs text-emerald-100">
                {filteredVibeQueue.length} items
              </span>
              <button
                type="button"
                onClick={focusMissingVibeCoverage}
                disabled={vibeCoverageCards.totals.missing === 0}
                className="rounded-full border border-amber-200/24 bg-amber-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-amber-100 transition hover:border-amber-200/40 disabled:opacity-60"
              >
                Missing tags: {vibeCoverageCards.totals.missing}
              </button>
            </div>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <article className={`rounded-2xl border p-3 ${vibeMigrationRunSummary.toneClass}`}>
              <p className="text-[11px] uppercase tracking-[0.14em] opacity-85">Latest run</p>
              <p className="mt-1 text-lg font-semibold text-white">{vibeMigrationRunSummary.label}</p>
              <p className="mt-1 text-[11px] text-white/75">{vibeMigrationRunSummary.detail}</p>
            </article>
            <article className={`rounded-2xl border p-3 ${vibeMigrationHealth.toneClass}`}>
              <p className="text-[11px] uppercase tracking-[0.14em] opacity-85">Migration health</p>
              <p className="mt-1 text-lg font-semibold text-white">{vibeMigrationHealth.label}</p>
              <p className="mt-1 text-[11px] text-white/75">{vibeMigrationHealth.detail}</p>
            </article>
            <article className="rounded-2xl border border-emerald-200/20 bg-emerald-200/10 p-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-100/80">Total coverage</p>
              <p className="mt-1 text-lg font-semibold text-white">{vibeCoverageCards.totals.percentLabel}</p>
              <p className="mt-1 text-[11px] text-white/65">
                tagged {vibeCoverageCards.totals.tagged}/{vibeCoverageCards.totals.total}
              </p>
            </article>
            {vibeCoverageCards.cards.map((card) => (
              <article key={`vibe-kpi-${card.key}`} className="rounded-2xl border border-white/12 bg-black/25 p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">{card.label}</p>
                <p className="mt-1 text-lg font-semibold text-white">{card.percentLabel}</p>
                <p className="mt-1 text-[11px] text-white/60">
                  missing {card.missing} of {card.total}
                </p>
              </article>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <article className="rounded-2xl border border-white/12 bg-black/25 p-4">
              <VibeTagPicker
                value={vibeDraftTags}
                onChange={setVibeDraftTags}
                title="Vibe tags to apply"
                hint="Pick up to 3 tags, then apply to selected rows."
                tone="emerald"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={bulkApplyVibeTags}
                  disabled={selectedVibeKeys.length === 0 || Boolean(busyMap["bulk-vibe-apply"])}
                  className="rounded-full border border-emerald-200/24 bg-emerald-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-200/40 disabled:opacity-60"
                >
                  {busyMap["bulk-vibe-apply"] ? "Applying..." : `Apply to selected (${selectedVibeKeys.length})`}
                </button>
                <button
                  type="button"
                  onClick={bulkApplyVibeTagsToMissingVisible}
                  disabled={filteredMissingVibeQueue.length === 0 || Boolean(busyMap["bulk-vibe-apply"])}
                  className="rounded-full border border-amber-200/24 bg-amber-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-amber-100 transition hover:border-amber-200/40 disabled:opacity-60"
                >
                  {busyMap["bulk-vibe-apply"]
                    ? "Applying..."
                    : `Tag missing in view (${filteredMissingVibeQueue.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVibeKeys(filteredVibeQueue.map((item) => String(item.key)))}
                  disabled={filteredVibeQueue.length === 0}
                  className="rounded-full border border-white/16 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white/78 transition hover:border-white/30 disabled:opacity-60"
                >
                  Select visible
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVibeKeys([])}
                  disabled={selectedVibeKeys.length === 0}
                  className="rounded-full border border-white/16 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white/78 transition hover:border-white/30 disabled:opacity-60"
                >
                  Clear selection
                </button>
                <button
                  type="button"
                  onClick={exportMissingVibeRowsCsv}
                  disabled={missingVibeRowsForCsv.length === 0}
                  className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40 disabled:opacity-60"
                >
                  Export missing CSV ({missingVibeRowsForCsv.length})
                </button>
                <button
                  type="button"
                  onClick={exportLegacyVibeRowsCsv}
                  disabled={legacyVibeRowsForCsv.length === 0}
                  className="rounded-full border border-violet-200/24 bg-violet-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-violet-100 transition hover:border-violet-200/40 disabled:opacity-60"
                >
                  Export legacy CSV ({legacyVibeRowsForCsv.length})
                </button>
              </div>
            </article>

            <article className="rounded-2xl border border-white/12 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-white/60">Filters</p>
              <div className="mt-3 grid gap-2">
                <select
                  value={vibeEntityFilter}
                  onChange={(event) => setVibeEntityFilter(event.target.value)}
                  className="rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="all">All entity types</option>
                  <option value="place">Places</option>
                  <option value="event">City events</option>
                  <option value="service">Services</option>
                  <option value="global_event">Off-grid events</option>
                </select>
                <select
                  value={vibeCityFilter}
                  onChange={(event) => setVibeCityFilter(event.target.value)}
                  className="rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="all">All cities</option>
                  {vibeCityOptions.map((city) => (
                    <option key={`vibe-city-${city}`} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <select
                  value={vibeStatusFilter}
                  onChange={(event) => setVibeStatusFilter(event.target.value)}
                  className="rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="all">Tagged + missing</option>
                  <option value="missing">Missing tags only</option>
                  <option value="tagged">Tagged only</option>
                </select>
              </div>
            </article>
          </div>

          <div className="mt-4 max-h-[460px] space-y-3 overflow-y-auto pr-1">
            {filteredVibeQueue.length > 0 ? (
              filteredVibeQueue.map((item) => (
                <article key={item.key} className="rounded-2xl border border-white/12 bg-black/25 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <label className="mb-2 inline-flex cursor-pointer items-center gap-2 text-[11px] text-white/60">
                        <input
                          type="checkbox"
                          checked={selectedVibeKeys.includes(String(item.key))}
                          onChange={() => toggleVibeSelection(item.key)}
                          className="h-3.5 w-3.5 rounded border-white/25 bg-black/40"
                        />
                        Select
                      </label>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
                        {formatTitle(item.targetType)}  |  {item.city || "Global"}  |  {formatTitle(item.type)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">{item.name}</p>
                      <VibeTagChips
                        entity={item}
                        tone="emerald"
                        className="mt-2"
                        includeTypeFallback={false}
                        includeMixedFallback={false}
                      />
                      {item.vibe_tags.length === 0 && (
                        <span className="mt-2 inline-flex rounded-full border border-amber-200/24 bg-amber-200/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-amber-100">
                          No tags
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openVibeItem(item)}
                        className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40"
                      >
                        Open item
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/14 px-4 py-8 text-sm text-white/55">
                No rows found for current vibe filters.
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
                    {entry.actor}  |  {timeAgo(entry.createdAt)}
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





