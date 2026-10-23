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
import { EMPTY_TRAFFIC_SUMMARY, fetchTrafficSummary } from "@/lib/trafficAnalytics";
import { resolveAdminAccess } from "@/lib/adminAccess";
import {
  listContentSubmissions,
  publishContentSubmission,
  updateContentSubmissionStatus,
} from "@/lib/contentSubmissions";
import PageOpeningState from "@/components/ui/PageOpeningState";
import { useActionToast } from "@/lib/useActionToast";
import ActionToast from "@/components/ui/ActionToast";
import AdminTrafficPanel from "@/components/admin/AdminTrafficPanel";
import AdminCityManager from "@/components/admin/AdminCityManager";
import AdminMembersPanel from "@/components/admin/AdminMembersPanel";
import AdminOperationsShell from "@/components/admin/AdminOperationsShell";
import { buildPublishedEntityIndexNowUrls } from "@/lib/seo/indexNow";
import { notifyIndexNowUrls } from "@/lib/seo/indexNowClient";


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

function parseCommunityIdeaText(value = "") {
  const raw = String(value || "").trim();
  const match = raw.match(/^\[([^\]]+)\]\s*(.*)$/);
  if (!match) {
    return {
      category: "Idea",
      body: raw,
    };
  }
  return {
    category: String(match[1] || "Idea").trim() || "Idea",
    body: String(match[2] || "").trim() || raw,
  };
}

function mapCommunityIdeaRow(row = {}) {
  const parsed = parseCommunityIdeaText(row.text);
  return {
    id: String(row.id || ""),
    rawText: String(row.text || ""),
    text: parsed.body,
    category: parsed.category,
    author: String(row.author || "Member").trim() || "Member",
    votes: Number(row.votes || 0),
    createdAt: row.created_at || "",
  };
}

export default function AdminPage() {
  const { user } = useAuth();
  return <AdminPageContent key={user?.id || "guest"} />;
}

function AdminPageContent() {
  const router = useRouter();
  const { isMember, isLoading: isAuthLoading, user, memberName, session } = useAuth();
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
    unreadComments: 0,
  });
  const [reports, setReports] = useState([]);
  const [blockedItems, setBlockedItems] = useState([]);
  const [selectedReportIds, setSelectedReportIds] = useState([]);
  const [reportQuery, setReportQuery] = useState("");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");
  const [blockedQuery, setBlockedQuery] = useState("");
  const [blockedTypeFilter, setBlockedTypeFilter] = useState("all");
  const [warning, setWarning] = useState("");
  const [busyMap, setBusyMap] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState("");
  const [trafficSummary, setTrafficSummary] = useState(EMPTY_TRAFFIC_SUMMARY);
  const [trafficDays, setTrafficDays] = useState(30);
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [isLoadingPendingSubmissions, setIsLoadingPendingSubmissions] = useState(false);
  const [submissionQuery, setSubmissionQuery] = useState("");
  const [submissionTypeFilter, setSubmissionTypeFilter] = useState("all");
  const [submissionSyncNotice, setSubmissionSyncNotice] = useState("");
  const [isProcessingSubmissionId, setIsProcessingSubmissionId] = useState("");
  const [contactThreads, setContactThreads] = useState([]);
  const [contactQuery, setContactQuery] = useState("");
  const [contactView, setContactView] = useState("open");
  const [communityIdeas, setCommunityIdeas] = useState([]);
  const [communityIdeasNotice, setCommunityIdeasNotice] = useState("");
  const [ideaQuery, setIdeaQuery] = useState("");
  const [ideaSort, setIdeaSort] = useState("votes");
  const [newsComments, setNewsComments] = useState([]);
  const [newsCommentsNotice, setNewsCommentsNotice] = useState("");
  const [commentQuery, setCommentQuery] = useState("");
  const [commentView, setCommentView] = useState("unread");

  const loadAdminState = useCallback(async () => {
    setIsRefreshing(true);
    setWarning("");
    setCommunityIdeasNotice("");
    try {
      const [
        placesCountRes,
        eventsCountRes,
        servicesCountRes,
        globalEventsRes,
        moderationRes,
        contactThreadsRes,
        communityIdeasRes,
        newsCommentsRes,
      ] =
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
          supabase
            .from("community_ideas")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(160),
          supabase
            .from("qa_news_comments")
            .select("id,article_id,author_id,author_display_name,author_avatar_url,body,status,created_at,admin_seen_at,qa_world_news(title)")
            .order("created_at", { ascending: false })
            .limit(150),
        ]);

      const reportsRows = moderationRes?.reports || getReports();
      const blockedRows = moderationRes?.blockedItems || getBlockedItems();
      const contactRows = Array.isArray(contactThreadsRes?.data) ? contactThreadsRes.data : [];
      const contactWarning =
        contactThreadsRes?.error &&
        !isMissingRelationError(contactThreadsRes.error)
          ? `Contact inbox unavailable: ${formatDbError(contactThreadsRes.error)}`
          : "";
      const ideaRows = Array.isArray(communityIdeasRes?.data) ? communityIdeasRes.data : [];
      const ideasWarning =
        communityIdeasRes?.error &&
        !isMissingRelationError(communityIdeasRes.error)
          ? `Improve Atlas inbox unavailable: ${formatDbError(communityIdeasRes.error)}`
          : "";
      const commentRows = Array.isArray(newsCommentsRes?.data) ? newsCommentsRes.data : [];
      const commentsWarning =
        newsCommentsRes?.error && !isMissingRelationError(newsCommentsRes.error)
          ? `News comments unavailable: ${formatDbError(newsCommentsRes.error)}`
          : "";
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
      setCommunityIdeas(ideaRows.map(mapCommunityIdeaRow));
      setNewsComments(
        commentRows.map((row) => ({
          id: String(row.id || ""),
          articleId: String(row.article_id || ""),
          articleTitle: String(row.qa_world_news?.title || "News article"),
          authorId: String(row.author_id || ""),
          authorName: String(row.author_display_name || "Member").trim() || "Member",
          authorAvatarUrl: String(row.author_avatar_url || ""),
          body: String(row.body || ""),
          status: String(row.status || "published"),
          createdAt: row.created_at || "",
          adminSeenAt: row.admin_seen_at || "",
        }))
      );
      setNewsCommentsNotice(
        newsCommentsRes?.error
          ? isMissingRelationError(newsCommentsRes.error)
            ? "News comments are not configured yet. Run supabase/news-comments-v1.sql."
            : "Could not load news comments right now."
          : ""
      );
      if (communityIdeasRes?.error) {
        setCommunityIdeasNotice(
          isMissingRelationError(communityIdeasRes.error)
            ? "Improve Atlas inbox is not configured yet. The community_ideas table was not found."
            : "Could not load Improve Atlas ideas right now."
        );
      }
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
        unreadComments: commentRows.filter((item) => !item.admin_seen_at).length,
      });
      if (moderationRes?.warning || contactWarning || ideasWarning || commentsWarning) {
        setWarning(
          [moderationRes?.warning, contactWarning, ideasWarning, commentsWarning]
            .filter(Boolean)
            .join(" ")
        );
      }

      setLastSyncedAt(new Date().toISOString());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const loadTrafficData = useCallback(async (days = 30) => {
    const safeDays = [7, 30, 90].includes(Number(days)) ? Number(days) : 30;
    setTrafficLoading(true);
    try {
      const result = await fetchTrafficSummary(safeDays);
      setTrafficSummary(result);
      setTrafficDays(safeDays);
    } finally {
      setTrafficLoading(false);
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

  const markNewsCommentRead = useCallback(async (commentId) => {
    const id = String(commentId || "").trim();
    if (!id || !user?.id) return;
    const busyKey = `news-comment:${id}`;
    setBusyMap((current) => ({ ...current, [busyKey]: true }));
    const seenAt = new Date().toISOString();
    const { error } = await supabase
      .from("qa_news_comments")
      .update({ admin_seen_at: seenAt, admin_seen_by: user.id })
      .eq("id", id);
    if (error) {
      showToast(error.message || "Could not mark comment as read.", { tone: "warn", duration: 2400 });
    } else {
      setNewsComments((current) => current.map((comment) => comment.id === id ? { ...comment, adminSeenAt: seenAt } : comment));
      setStats((current) => ({ ...current, unreadComments: Math.max(0, Number(current.unreadComments || 0) - 1) }));
    }
    setBusyMap((current) => ({ ...current, [busyKey]: false }));
  }, [showToast, user]);

  const removeNewsComment = useCallback(async (comment) => {
    const id = String(comment?.id || "").trim();
    if (!id || !user?.id || comment?.status === "removed") return;
    if (!window.confirm("Remove this comment from the public article? Its text will be replaced and the action is permanent.")) return;
    const busyKey = `news-comment:${id}`;
    setBusyMap((current) => ({ ...current, [busyKey]: true }));
    const nowIso = new Date().toISOString();
    const wasUnread = !comment.adminSeenAt;
    const { error } = await supabase
      .from("qa_news_comments")
      .update({
        body: "Comment removed by Queer Atlas",
        status: "removed",
        removed_at: nowIso,
        removed_by: user.id,
        admin_seen_at: nowIso,
        admin_seen_by: user.id,
      })
      .eq("id", id);
    if (error) {
      showToast(error.message || "Could not remove comment.", { tone: "warn", duration: 2400 });
    } else {
      setNewsComments((current) => current.map((item) => item.id === id ? { ...item, body: "Comment removed by Queer Atlas", status: "removed", adminSeenAt: nowIso } : item));
      if (wasUnread) {
        setStats((current) => ({ ...current, unreadComments: Math.max(0, Number(current.unreadComments || 0) - 1) }));
      }
      showToast("Comment removed from the article.", { tone: "ok", duration: 1900 });
    }
    setBusyMap((current) => ({ ...current, [busyKey]: false }));
  }, [showToast, user]);

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

        await Promise.all([loadAdminState(), loadTrafficData(30)]);
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
  }, [isAuthLoading, isMember, loadAdminState, loadTrafficData, router, user?.email]);

  const openReports = useMemo(
    () => reports.filter((item) => String(item.status || "open") === "open"),
    [reports]
  );
  const safetyReports = useMemo(() => {
    const query = reportQuery.trim().toLowerCase();
    return openReports
      .filter((report) => reportTypeFilter === "all" || String(report.targetType || "").toLowerCase() === reportTypeFilter)
      .filter((report) => !query || [report.title, report.reason, report.message, report.city, report.targetType].join(" ").toLowerCase().includes(query))
      .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));
  }, [openReports, reportQuery, reportTypeFilter]);
  const visiblePendingSubmissions = useMemo(() => {
    const query = submissionQuery.trim().toLowerCase();
    return pendingSubmissions.filter((submission) => {
      const payload = submission?.payload && typeof submission.payload === "object" ? submission.payload : {};
      const type = String(submission?.entity_type || "item").toLowerCase();
      return (submissionTypeFilter === "all" || type === submissionTypeFilter) && (!query || [submission?.title, payload?.name, payload?.description, submission?.city, submission?.submitted_by_name].join(" ").toLowerCase().includes(query));
    });
  }, [pendingSubmissions, submissionQuery, submissionTypeFilter]);
  const openContactThreads = useMemo(
    () => contactThreads.filter((item) => item.status !== "resolved" && item.status !== "closed"),
    [contactThreads]
  );
  const visibleContactThreads = useMemo(() => {
    const query = contactQuery.trim().toLowerCase();
    return contactThreads.filter((thread) => {
      const viewMatch = contactView === "all" || contactView === "open" && thread.status !== "resolved" && thread.status !== "closed" || contactView === "urgent" && (thread.priority === "urgent" || thread.priority === "high") || contactView === "review" && thread.status === "in_review";
      return viewMatch && (!query || [thread.subject, thread.message, thread.senderName, thread.senderEmail, thread.cityContext, thread.category].join(" ").toLowerCase().includes(query));
    });
  }, [contactQuery, contactThreads, contactView]);
  const visibleCommunityIdeas = useMemo(() => {
    const query = ideaQuery.trim().toLowerCase();
    return communityIdeas.filter((idea) => !query || [idea.text, idea.author, idea.category].join(" ").toLowerCase().includes(query)).sort((a, b) => ideaSort === "newest" ? new Date(b.createdAt || 0) - new Date(a.createdAt || 0) : Number(b.votes || 0) - Number(a.votes || 0));
  }, [communityIdeas, ideaQuery, ideaSort]);
  const visibleNewsComments = useMemo(() => {
    const query = commentQuery.trim().toLowerCase();
    return newsComments.filter((comment) => {
      const viewMatch = commentView === "all" || commentView === "unread" && !comment.adminSeenAt || commentView === "published" && comment.status !== "removed" || commentView === "removed" && comment.status === "removed";
      return viewMatch && (!query || [comment.authorName, comment.articleTitle, comment.body].join(" ").toLowerCase().includes(query));
    });
  }, [commentQuery, commentView, newsComments]);
  const visibleBlockedItems = useMemo(() => {
    const query = blockedQuery.trim().toLowerCase();
    return blockedItems.filter((item) => (blockedTypeFilter === "all" || String(item.targetType || "").toLowerCase() === blockedTypeFilter) && (!query || [item.title, item.city, item.targetType, item.targetId].join(" ").toLowerCase().includes(query))).sort((left, right) => new Date(right.blockedAt || 0) - new Date(left.blockedAt || 0));
  }, [blockedItems, blockedQuery, blockedTypeFilter]);

  const toggleReportSelection = (reportId) => {
    const key = String(reportId);
    setSelectedReportIds((current) =>
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

      const indexNowUrls = buildPublishedEntityIndexNowUrls(
        submission.entity_type,
        publishRes.data || submission.payload || {},
        submission
      );
      let accessToken = String(session?.access_token || "");
      if (!accessToken) {
        const { data } = await supabase.auth.getSession();
        accessToken = String(data?.session?.access_token || "");
      }
      void notifyIndexNowUrls({
        urls: indexNowUrls,
        accessToken,
        source: "admin-publish",
      });

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

  const deleteCommunityIdea = async (ideaId) => {
    const id = String(ideaId || "").trim();
    if (!id) return;
    if (!window.confirm("Delete this community idea permanently? This cannot be undone.")) return;
    const busyKey = `idea:${id}`;
    setBusyMap((current) => ({ ...current, [busyKey]: true }));
    try {
      const { error } = await supabase.from("community_ideas").delete().eq("id", id);
      if (error) {
        showToast(error.message || "Could not delete idea.", { tone: "warn", duration: 2400 });
        return;
      }
      setCommunityIdeas((current) => current.filter((idea) => idea.id !== id));
      showToast("Improve Atlas idea deleted.", { tone: "ok", duration: 1900 });
    } finally {
      setBusyMap((current) => ({ ...current, [busyKey]: false }));
    }
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
    if (!window.confirm("Delete this report permanently? This cannot be undone.")) return;
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
    if (!window.confirm("Restore this item to public availability? Re-check its safety and accuracy before reopening it.")) return;
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
    if (!window.confirm(`Delete ${selectedReports.length} selected report${selectedReports.length === 1 ? "" : "s"} permanently? This cannot be undone.`)) return;
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
      <AdminOperationsShell counts={{ reports: openReports.length, submissions: pendingSubmissions.length, comments: stats.unreadComments }} refreshing={isRefreshing} onRefresh={async () => { window.dispatchEvent(new Event("qa:admin-members-refresh")); await Promise.all([loadAdminState(), loadTrafficData(trafficDays), refreshPendingSubmissions()]); }}>
        <section id="today" className="mb-8 scroll-mt-5 overflow-hidden rounded-[34px] border border-cyan-300/16 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_80%_16%,rgba(167,139,250,0.14),transparent_28%),linear-gradient(135deg,rgba(17,24,39,0.95),rgba(10,10,10,0.99))] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.40)] sm:p-8">
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
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/admin/editorial")}
                className="rounded-full border border-fuchsia-200/25 bg-fuchsia-200/10 px-4 py-2 text-xs uppercase tracking-[0.12em] text-fuchsia-100 transition hover:border-fuchsia-200/40"
              >
                Editorial studio
              </button>
              <button
                type="button"
                onClick={async () => {
                  window.dispatchEvent(new Event("qa:admin-members-refresh"));
                  await Promise.all([loadAdminState(), loadTrafficData(trafficDays), refreshPendingSubmissions()]);
                }}
                disabled={isRefreshing}
                className="rounded-full border border-cyan-200/25 bg-cyan-200/10 px-4 py-2 text-xs uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40 disabled:opacity-60"
              >
                {isRefreshing ? "Refreshing..." : "Refresh dashboard"}
              </button>
            </div>
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

        <section aria-label="Today's priorities" className="mb-8 grid gap-3 md:grid-cols-3">
          <a href="#safety" className="rounded-2xl border border-rose-200/18 bg-rose-200/[0.07] p-4 transition hover:border-rose-200/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-100/72">Act first</p><p className="mt-2 text-2xl font-semibold tabular-nums text-white">{openReports.length}</p><p className="mt-1 text-xs text-white/60">Open safety reports need a decision.</p></a>
          <a href="#submissions" className="rounded-2xl border border-amber-200/18 bg-amber-200/[0.07] p-4 transition hover:border-amber-200/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-100/72">Publish safely</p><p className="mt-2 text-2xl font-semibold tabular-nums text-white">{pendingSubmissions.length}</p><p className="mt-1 text-xs text-white/60">Member contributions await verification.</p></a>
          <a href="#community" className="rounded-2xl border border-cyan-200/18 bg-cyan-200/[0.07] p-4 transition hover:border-cyan-200/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100/72">Listen & improve</p><p className="mt-2 text-2xl font-semibold tabular-nums text-white">{openContactThreads.length + stats.unreadComments}</p><p className="mt-1 text-xs text-white/60">Open contact cases and unread discussion.</p></a>
        </section>

        <div id="data-quality" className="scroll-mt-5"><AdminCityManager /></div>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
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
          <article className="rounded-3xl border border-fuchsia-200/18 bg-fuchsia-200/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-100/75">New comments</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.unreadComments}</p>
          </article>
        </section>

        <section className="mb-8 rounded-[30px] border border-fuchsia-300/16 bg-[radial-gradient(circle_at_top_left,rgba(217,70,239,0.12),transparent_28%),linear-gradient(180deg,rgba(37,14,43,0.86),rgba(10,10,10,0.98))] p-6 shadow-[0_24px_80px_rgba(217,70,239,0.07)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-100/80">Discussion moderation</p>
              <h2 className="mt-1 text-xl font-semibold text-white">News conversation desk</h2>
              <p className="mt-2 text-sm text-white/62">Triage new public discussion, retain its context, and act only when a comment needs intervention.</p>
            </div>
            <span className="rounded-full border border-fuchsia-200/24 bg-fuchsia-200/10 px-3 py-1 text-xs text-fuchsia-100">
              {stats.unreadComments} unread
            </span>
          </div>

          {newsCommentsNotice ? (
            <div className="mb-3 rounded-xl border border-amber-200/22 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">{newsCommentsNotice}</div>
          ) : null}

          <div className="mb-4 rounded-2xl border border-white/9 bg-black/20 p-3 sm:p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <label><span className="sr-only">Search discussion</span><input value={commentQuery} onChange={(event) => setCommentQuery(event.target.value)} placeholder="Search author, article or comment…" className="min-h-11 w-full rounded-xl border border-white/12 bg-black/30 px-4 text-sm text-white placeholder:text-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200" /></label>
              <p className="self-center text-xs text-white/50"><strong className="text-white">{visibleNewsComments.length}</strong> conversations in view</p>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{[["unread", "Needs review"], ["published", "Public"], ["removed", "Removed"], ["all", "All discussion"]].map(([value, label]) => <button key={value} type="button" onClick={() => setCommentView(value)} aria-pressed={commentView === value} className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${commentView === value ? "border-fuchsia-200/45 bg-fuchsia-200/[.14] text-fuchsia-100" : "border-white/10 bg-white/[.03] text-white/55 hover:border-white/24"}`}>{label}</button>)}</div>
          </div>

          <div className="space-y-3">
            {visibleNewsComments.length > 0 ? visibleNewsComments.map((comment) => {
              const unread = !comment.adminSeenAt;
              const removed = comment.status === "removed";
              const busyKey = `news-comment:${comment.id}`;
              return (
                <article key={comment.id} className={`rounded-2xl border p-4 ${unread ? "border-fuchsia-200/30 bg-fuchsia-200/[0.08]" : "border-white/10 bg-black/25"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {unread ? <span className="rounded-full border border-fuchsia-200/25 bg-fuchsia-200/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-fuchsia-100">New</span> : null}
                        <span className="text-sm font-semibold text-white">{comment.authorName}</span>
                        <span className="text-xs text-white/42">{timeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.12em] text-cyan-100/68">On: {comment.articleTitle}</p>
                      <p className={`mt-3 whitespace-pre-line break-words text-sm leading-6 ${removed ? "italic text-white/42" : "text-white/78"}`}>
                        {removed ? "Comment removed by Queer Atlas" : comment.body}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => router.push(`/now/news/${encodeURIComponent(comment.articleId)}`)} className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/42">Open article</button>
                      {unread ? <button type="button" disabled={Boolean(busyMap[busyKey])} onClick={() => markNewsCommentRead(comment.id)} className="rounded-full border border-white/16 bg-white/8 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-white/76 transition hover:border-white/30 disabled:opacity-55">Mark as read</button> : null}
                      {!removed ? <button type="button" disabled={Boolean(busyMap[busyKey])} onClick={() => removeNewsComment(comment)} className="rounded-full border border-rose-200/25 bg-rose-200/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/42 disabled:opacity-55">Remove</button> : null}
                    </div>
                  </div>
                </article>
              );
            }) : (
              <div className="rounded-2xl border border-dashed border-white/14 px-4 py-8 text-center text-sm text-white/52">No conversations match this view. Clear a filter or search to continue.</div>
            )}
          </div>
        </section>

        <div id="traffic" className="scroll-mt-5"><AdminTrafficPanel summary={trafficSummary} loading={trafficLoading} days={trafficDays} onDaysChange={loadTrafficData} /></div>

        <div id="members" className="scroll-mt-5"><AdminMembersPanel /></div>

        <section id="submissions" className="mb-8 scroll-mt-5 overflow-hidden rounded-[30px] border border-indigo-300/16 bg-[radial-gradient(circle_at_96%_0%,rgba(129,140,248,.17),transparent_34%),linear-gradient(155deg,#151535,#070811)] p-4 shadow-[0_24px_80px_rgba(0,0,0,.30)] sm:p-6">
          <div className="mb-5 flex flex-col gap-4 border-b border-white/8 pb-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-100/68">Publishing review</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-.03em] text-white">Content review queue</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Verify the place, event, service or story before it becomes part of the public Atlas.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-indigo-200/24 bg-indigo-200/[.10] px-3 py-1 text-xs font-semibold text-indigo-100">
                {pendingSubmissions.length} waiting
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

          <div className="mb-4 rounded-2xl border border-white/9 bg-black/20 p-3 sm:p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <label><span className="sr-only">Search submissions</span><input value={submissionQuery} onChange={(event) => setSubmissionQuery(event.target.value)} placeholder="Search title, description, city or contributor…" className="min-h-11 w-full rounded-xl border border-white/12 bg-black/30 px-4 text-sm text-white placeholder:text-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-200" /></label>
              <p className="self-center text-xs text-white/50"><strong className="text-white">{visiblePendingSubmissions.length}</strong> shown for review</p>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{[["all", "All entries"], ["place", "Venues"], ["event", "Events"], ["service", "Services"], ["voice", "Voices"]].map(([value, label]) => <button key={value} type="button" onClick={() => setSubmissionTypeFilter(value)} aria-pressed={submissionTypeFilter === value} className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${submissionTypeFilter === value ? "border-indigo-200/45 bg-indigo-200/[.14] text-indigo-100" : "border-white/10 bg-white/[.03] text-white/55 hover:border-white/24"}`}>{label}</button>)}</div>
          </div>

          {isLoadingPendingSubmissions ? (
            <div className="rounded-2xl border border-dashed border-white/14 px-4 py-8 text-sm text-white/55">
              Loading pending submissions...
            </div>
          ) : pendingSubmissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/14 px-4 py-10 text-center text-sm text-white/55">
              The queue is clear. New member submissions will appear here.
            </div>
          ) : (
            <div className="grid gap-3 xl:grid-cols-2">
              {visiblePendingSubmissions.map((submission) => {
                const payload = submission?.payload && typeof submission.payload === "object" ? submission.payload : {};
                const statusBusy = isProcessingSubmissionId === String(submission.id);
                const submissionName = String(submission?.title || payload?.name || "Untitled");

                return (
                  <article key={submission.id} className="group rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-indigo-200/30 hover:bg-indigo-200/[.045]">
                    <div className="flex items-center justify-between gap-2">
                      <p className="rounded-full border border-indigo-200/20 bg-indigo-200/[.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-100">
                        {String(submission.entity_type || "item")} · {formatCityLabel(String(submission.city || "global"))}
                      </p>
                      <p className="text-xs text-white/45">{timeAgo(submission.created_at)}</p>
                    </div>
                    <p className="mt-3 text-base font-semibold text-white">{submissionName}</p>
                    <p className="mt-2 text-xs text-white/65">
                      by {String(submission.submitted_by_name || submission.submitted_by_email || "Member")}
                      {submission.is_trusted_contributor ? " | trusted" : ""}
                    </p>
                    {payload?.description ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/70">{String(payload.description)}</p>
                    ) : null}
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/8 pt-3">
                      <p className="text-[10px] leading-4 text-white/38">{payload?.description ? "Description included" : "No description supplied"} · {submission.is_trusted_contributor ? "Trusted contributor" : "Standard contributor"}</p>
                      <div className="flex flex-wrap gap-2">
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
                    </div>
                  </article>
                );
              })}
              {visiblePendingSubmissions.length === 0 ? <div className="rounded-2xl border border-dashed border-white/14 px-4 py-10 text-center text-sm text-white/55 xl:col-span-2">No submissions match this view. Clear search or filters to continue.</div> : null}
            </div>
          )}
        </section>

        <section id="community" className="mb-8 scroll-mt-5 overflow-hidden rounded-[30px] border border-amber-300/16 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,.14),transparent_28%),linear-gradient(155deg,#261b08,#080706)] p-4 shadow-[0_24px_80px_rgba(0,0,0,.28)] sm:p-6">
          <div className="mb-5 flex flex-col gap-4 border-b border-white/8 pb-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/70">Product signal desk</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-.03em] text-white">Community improvement backlog</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Turn member feedback into prioritised product signals without losing the original community context.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs text-amber-100">
                {communityIdeas.length} ideas
              </span>
              <span className="rounded-full border border-white/14 bg-white/8 px-3 py-1 text-xs text-white/72">
                Top vote: {communityIdeas.reduce((max, idea) => Math.max(max, Number(idea.votes || 0)), 0)}
              </span>
              <button
                type="button"
                onClick={() =>
                  exportCsv(
                    communityIdeas.map((idea) => ({
                      id: idea.id,
                      category: idea.category,
                      text: idea.text,
                      author: idea.author,
                      votes: idea.votes,
                      created_at: idea.createdAt,
                    })),
                    "qa-improve-atlas-ideas.csv"
                  )
                }
                className="rounded-full border border-white/16 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white/78 transition hover:border-amber-200/35 hover:text-amber-100"
              >
                Export CSV
              </button>
            </div>
          </div>

          {communityIdeasNotice ? (
            <div className="mb-3 rounded-xl border border-amber-200/24 bg-amber-200/12 px-3 py-2 text-xs text-amber-100">
              {communityIdeasNotice}
            </div>
          ) : null}

          <div className="mb-4 grid gap-3 rounded-2xl border border-white/9 bg-black/20 p-3 sm:grid-cols-[1fr_auto]"><label><span className="sr-only">Search community ideas</span><input value={ideaQuery} onChange={(event) => setIdeaQuery(event.target.value)} placeholder="Search idea, contributor or category…" className="min-h-11 w-full rounded-xl border border-white/12 bg-black/30 px-4 text-sm text-white placeholder:text-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200" /></label><label className="flex items-center gap-2 text-xs text-white/50">Prioritise <select value={ideaSort} onChange={(event) => setIdeaSort(event.target.value)} className="min-h-11 rounded-xl border border-white/12 bg-black/30 px-3 text-sm text-white"><option value="votes">Most voted</option><option value="newest">Newest first</option></select></label></div>

          <div className="grid gap-3 lg:grid-cols-2">
            {visibleCommunityIdeas.length > 0 ? (
              visibleCommunityIdeas.map((idea) => {
                const busyKey = `idea:${idea.id}`;
                return (
                  <article key={idea.id} className="rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-amber-200/32 hover:bg-amber-200/[.055]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-amber-200/24 bg-amber-200/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-amber-100">
                            {idea.category}
                          </span>
                          <span className="rounded-full border border-white/14 bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/70">
                            {idea.votes} votes
                          </span>
                        </div>
                        <p className="text-sm leading-6 text-white/82">{idea.text || "No idea text provided."}</p>
                        <p className="mt-2 text-xs text-white/55">
                          {idea.author} | {timeAgo(idea.createdAt)}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={Boolean(busyMap[busyKey])}
                        onClick={() => deleteCommunityIdea(idea.id)}
                        className="rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40 disabled:opacity-60"
                      >
                        {busyMap[busyKey] ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-white/14 px-4 py-8 text-sm text-white/55 lg:col-span-2">
                {communityIdeas.length ? "No ideas match this search." : "No Improve Atlas ideas yet. Member suggestions will appear here."}
              </div>
            )}
          </div>
        </section>

        <section id="safety" className="mb-8 scroll-mt-5 overflow-hidden rounded-[30px] border border-rose-300/18 bg-[radial-gradient(circle_at_4%_0%,rgba(251,113,133,.14),transparent_32%),linear-gradient(155deg,#221016,#09070a)] p-4 shadow-[0_26px_86px_rgba(0,0,0,.30)] sm:p-6">
          <div className="mb-5 flex flex-col gap-4 border-b border-white/8 pb-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-100/70">Incident command</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-.03em] text-white">Safety & moderation queue</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Triage reports by risk, hide unsafe content fast, then leave a clear resolved state.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-rose-200/24 bg-rose-200/[.10] px-3 py-1 text-xs font-semibold text-rose-100">
                {openReports.length} open incidents
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
          <div className="mb-4 rounded-2xl border border-white/9 bg-black/20 p-3 sm:p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <label><span className="sr-only">Search safety reports</span><input value={reportQuery} onChange={(event) => setReportQuery(event.target.value)} placeholder="Search report, city, reason or reported content…" className="min-h-11 w-full rounded-xl border border-white/12 bg-black/30 px-4 text-sm text-white placeholder:text-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200" /></label>
              <div className="flex items-center gap-2 text-xs text-white/50"><span>Showing</span><strong className="text-white">{safetyReports.length}</strong><span>of {openReports.length}</span></div>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{[["all", "All"], ["place", "Venues"], ["event", "Events"], ["service", "Services"], ["comment", "Comments"]].map(([value, label]) => <button key={value} type="button" onClick={() => setReportTypeFilter(value)} aria-pressed={reportTypeFilter === value} className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${reportTypeFilter === value ? "border-rose-200/45 bg-rose-200/[.14] text-rose-100" : "border-white/10 bg-white/[.03] text-white/55 hover:border-white/24"}`}>{label}</button>)}</div>
          </div>
          {selectedReportIds.length > 0 ? <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200/22 bg-rose-200/[.08] px-4 py-3"><p className="text-sm font-semibold text-rose-50">{selectedReportIds.length} incident{selectedReportIds.length === 1 ? "" : "s"} selected</p><p className="text-xs text-rose-100/68">Resolve is reversible in the queue; hide and delete change public safety state.</p></div> : null}
          <div className="grid gap-3 xl:grid-cols-2">
            {safetyReports.length > 0 ? (
              safetyReports.map((report) => (
                <article
                  key={report.id}
                  className={`rounded-2xl border p-4 transition ${selectedReportIds.includes(String(report.id)) ? "border-rose-200/38 bg-rose-200/[.08]" : "border-white/10 bg-black/25 hover:border-white/22"}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <label className="mb-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/9 bg-white/[.03] px-2 py-1 text-[10px] font-semibold uppercase tracking-[.1em] text-white/60">
                        <input
                          type="checkbox"
                          checked={selectedReportIds.includes(String(report.id))}
                          onChange={() => toggleReportSelection(report.id)}
                          className="h-3.5 w-3.5 rounded border-white/25 bg-black/40"
                        />
                        Select
                      </label>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-100/68">
                        {formatTitle(report.targetType)}  |  {report.city || "Global"}
                      </p>
                      <p className="mt-1 text-base font-semibold text-white">
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
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
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
              <div className="rounded-2xl border border-dashed border-white/14 px-4 py-10 text-center text-sm text-white/55 xl:col-span-2">
                {openReports.length ? "No incidents match this view. Clear search or filters to see the queue." : "No open reports right now. This queue is clear."}
              </div>
            )}
          </div>
        </section>

        <section className="mb-8 overflow-hidden rounded-[30px] border border-cyan-300/16 bg-[radial-gradient(circle_at_96%_0%,rgba(34,211,238,.14),transparent_32%),linear-gradient(155deg,#071d2b,#06080d)] p-4 shadow-[0_24px_80px_rgba(0,0,0,.28)] sm:p-6">
          <div className="mb-5 flex flex-col gap-4 border-b border-white/8 pb-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/70">Community care desk</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-.03em] text-white">Contact & support signals</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Prioritise sensitive issues, move active cases into review, then resolve with a visible status trail.</p>
            </div>
            <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              {openContactThreads.length} open
            </span>
          </div>
          <div className="mb-4 rounded-2xl border border-white/9 bg-black/20 p-3 sm:p-4"><div className="grid gap-3 lg:grid-cols-[1fr_auto]"><label><span className="sr-only">Search contact cases</span><input value={contactQuery} onChange={(event) => setContactQuery(event.target.value)} placeholder="Search subject, message, person, city or category…" className="min-h-11 w-full rounded-xl border border-white/12 bg-black/30 px-4 text-sm text-white placeholder:text-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200" /></label><p className="self-center text-xs text-white/50"><strong className="text-white">{visibleContactThreads.length}</strong> cases in view</p></div><div className="mt-3 flex gap-2 overflow-x-auto pb-1">{[["open", "Open"], ["urgent", "High priority"], ["review", "In review"], ["all", "All cases"]].map(([value, label]) => <button key={value} type="button" onClick={() => setContactView(value)} aria-pressed={contactView === value} className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${contactView === value ? "border-cyan-200/45 bg-cyan-200/[.14] text-cyan-100" : "border-white/10 bg-white/[.03] text-white/55"}`}>{label}</button>)}</div></div>
          <div className="grid gap-3 xl:grid-cols-2">
            {visibleContactThreads.length > 0 ? (
              visibleContactThreads.map((thread) => (
                <article key={thread.id} className={`rounded-2xl border p-4 transition ${thread.priority === "urgent" ? "border-rose-200/28 bg-rose-200/[.07]" : thread.priority === "high" ? "border-amber-200/20 bg-amber-200/[.045]" : "border-white/10 bg-black/25 hover:border-cyan-200/24"}`}>
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
                      <p className="text-base font-semibold text-white">{thread.subject || "Contact message"}</p>
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
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
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
              <div className="rounded-2xl border border-dashed border-white/14 px-4 py-10 text-center text-sm text-white/55 xl:col-span-2">
                {contactThreads.length ? "No contact cases match this view." : "No contact threads yet. New messages will appear here."}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[30px] border border-rose-300/16 bg-[radial-gradient(circle_at_92%_0%,rgba(251,113,133,.13),transparent_30%),linear-gradient(180deg,rgba(56,18,31,0.82),rgba(10,10,10,0.98))] p-4 shadow-[0_24px_80px_rgba(0,0,0,.28)] sm:p-6">
          <div className="mb-5 flex flex-col gap-3 border-b border-white/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-100/80">Safety control</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-.03em] text-white">Restricted content register</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">A live recovery register for emergency hides. Restore only after confirming that the content is safe, accurate and ready for public access.</p>
            </div>
            <span className="rounded-full border border-rose-200/20 bg-rose-200/10 px-3 py-1 text-xs text-rose-100">
              {blockedItems.length} items
            </span>
          </div>
          <div className="mb-4 rounded-2xl border border-white/9 bg-black/20 p-3 sm:p-4"><div className="grid gap-3 lg:grid-cols-[1fr_auto]"><label><span className="sr-only">Search restricted content</span><input value={blockedQuery} onChange={(event) => setBlockedQuery(event.target.value)} placeholder="Search title, city, type or record ID…" className="min-h-11 w-full rounded-xl border border-white/12 bg-black/30 px-4 text-sm text-white placeholder:text-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200" /></label><p className="self-center text-xs text-white/50"><strong className="text-white">{visibleBlockedItems.length}</strong> records in view</p></div><div className="mt-3 flex gap-2 overflow-x-auto pb-1">{[["all", "All records"], ["place", "Places"], ["event", "Events"], ["service", "Services"], ["comment", "Comments"]].map(([value, label]) => <button key={value} type="button" onClick={() => setBlockedTypeFilter(value)} aria-pressed={blockedTypeFilter === value} className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${blockedTypeFilter === value ? "border-rose-200/45 bg-rose-200/[.14] text-rose-100" : "border-white/10 bg-white/[.03] text-white/55 hover:border-white/24"}`}>{label}</button>)}</div></div>
          <div className="space-y-3">
            {visibleBlockedItems.length > 0 ? (
              visibleBlockedItems.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/12 bg-black/25 p-4 transition hover:border-rose-200/28 hover:bg-rose-200/[.045]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
                        {formatTitle(item.targetType)}  |  {item.city || "Global"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {item.title || "Blocked content"}
                      </p>
                      <p className="mt-2 text-xs text-white/45">Restricted {timeAgo(item.blockedAt)} <span className="px-1 text-white/25">·</span> ID {String(item.targetId || item.id).slice(0, 12)}</p>
                    </div>
                    <button
                      type="button"
                      disabled={Boolean(busyMap[String(item.id)])}
                      onClick={() => removeBlockedItem(item.id)}
                      className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40 disabled:opacity-60"
                    >
                      Restore after review
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/14 px-4 py-8 text-sm text-white/55">
                {blockedItems.length ? "No restricted content matches this view." : "Nothing restricted right now. Emergency hides will be recorded here."}
              </div>
            )}
          </div>
        </section>
      </AdminOperationsShell>
    </main>
  );
}





