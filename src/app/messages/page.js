"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Ellipsis,
  Inbox,
  MapPin,
  MessageCircleMore,
  Plus,
  Search,
  Send,
  ShieldAlert,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useActionToast } from "@/lib/useActionToast";
import { showActionFeedback } from "@/lib/actionFeedback";
import { resolveAdminAccess } from "@/lib/adminAccess";
import { readLocalJson, writeLocalJson, writeLocalValue } from "@/lib/storage";
import { cityHref, formatInviteTimeline, inviteStatusLabel } from "@/lib/vipInvites";
import { addReport } from "@/lib/moderation";
import ActionToast from "@/components/ui/ActionToast";
import EmptyState from "@/components/ui/EmptyState";
import PageOpeningState from "@/components/ui/PageOpeningState";
import MessageAvatar from "@/components/messaging/MessageAvatar";
import MessageBubble from "@/components/messaging/MessageBubble";
const MEMBER_AVATAR_BUCKET = "member-avatars";

function isMissingTableError(error) {
  if (!error) return false;
  const code = String(error.code || "");
  const message = String(error.message || "").toLowerCase();
  return code === "42P01" || code === "PGRST205" || message.includes("does not exist");
}

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dateKey(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function threadActivityLabel(message, currentUserId, unreadCount = 0) {
  if (!message) return "No messages yet";
  if (String(message.senderId || "") === String(currentUserId || "")) return "You sent a message";
  return Number(unreadCount || 0) > 0 ? "New message" : "Last message received";
}

function formatMessageDay(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dateKey(date) === dateKey(today)) return "Today";
  if (dateKey(date) === dateKey(yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: date.getFullYear() === today.getFullYear() ? undefined : "numeric" });
}

function timeAgo(value) {
  if (!value) return "Recently";
  const diffMinutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

function isActiveNow(presence) {
  if (!presence?.isOnline || !presence?.lastSeenAt) return false;
  return new Date(presence.lastSeenAt).getTime() >= Date.now() - 2 * 60 * 1000;
}

function displayNameFor(profile, fallback = "Member") {
  const raw = String(profile?.display_name || "").trim();
  return raw || fallback;
}

function resolveAvatarUrlFromProfile(profileLike) {
  const direct = String(profileLike?.avatar_url || profileLike?.avatarUrl || "").trim();
  if (direct) return direct;
  const path = String(profileLike?.avatar_path || profileLike?.avatarPath || "").trim();
  if (!path) return "";
  return supabase.storage.from(MEMBER_AVATAR_BUCKET).getPublicUrl(path)?.data?.publicUrl || "";
}

function areVipInviteRowsEquivalent(nextRows = [], prevRows = []) {
  const next = Array.isArray(nextRows) ? nextRows : [];
  const prev = Array.isArray(prevRows) ? prevRows : [];
  if (next.length !== prev.length) return false;
  for (let index = 0; index < next.length; index += 1) {
    const a = next[index] || {};
    const b = prev[index] || {};
    if (String(a.id || "") !== String(b.id || "")) return false;
    if (String(a.status || "") !== String(b.status || "")) return false;
    if (String(a.kind || "") !== String(b.kind || "")) return false;
    if (String(a.createdAt || "") !== String(b.createdAt || "")) return false;
    if (String(a.decidedAt || "") !== String(b.decidedAt || "")) return false;
    if (String(a.title || "") !== String(b.title || "")) return false;
    if (String(a.city || "") !== String(b.city || "")) return false;
  }
  return true;
}

function normalizeMessageRow(row) {
  return {
    id: String(row.id),
    threadId: String(row.thread_id),
    senderId: row.sender_id ? String(row.sender_id) : "",
    body: row.body || "",
    createdAt: row.created_at || null,
    readAt: row.read_at || null,
  };
}

const MEMBER_PICKER_PAGE_SIZE = 16;

function normalizeMemberPickerRow(row) {
  return {
    userId: String(row?.user_id || ""),
    displayName: String(row?.display_name || "Member").trim() || "Member",
    homeCity: String(row?.home_city || "").trim(),
    residentCountry: String(row?.resident_country || "").trim(),
    trustedContributor: Boolean(row?.trusted_contributor),
    avatarUrl: String(row?.avatar_url || "").trim(),
    isOnline: Boolean(row?.is_online),
    lastSeenAt: row?.last_seen_at || null,
    isFollowing: Boolean(row?.is_following),
    followsYou: Boolean(row?.follows_you),
    mutualCount: Number(row?.mutual_count || 0),
  };
}

export default function MessagesPage() {
  const router = useRouter();
  const { isMember, isLoading: isAuthLoading, user } = useAuth();
  const userId = String(user?.id || "");
  const { toast, showToast } = useActionToast();
  const messageEndRef = useRef(null);
  const activeThreadRef = useRef("");
  const composePanelRef = useRef(null);
  const threadHeadingRef = useRef(null);
  const composerInputRef = useRef(null);
  const shouldScrollToEndRef = useRef(true);
  const [isReady, setIsReady] = useState(false);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [warning, setWarning] = useState("");
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [startUserId, setStartUserId] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search || "");
    return String(params.get("user") || "").trim();
  });
  const [startUserName, setStartUserName] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search || "");
    return String(params.get("name") || "").trim();
  });
  const [startCompose, setStartCompose] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search || "");
    return String(params.get("compose") || "").trim() === "1";
  });
  const [directComposeBody, setDirectComposeBody] = useState("");
  const [isDirectComposeSending, setIsDirectComposeSending] = useState(false);
  const [filter, setFilter] = useState("all");
  const [conversationSearch, setConversationSearch] = useState("");
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [vipInviteRows, setVipInviteRows] = useState([]);
  const [isLoadingVipInvites, setIsLoadingVipInvites] = useState(false);
  const [vipInvitesWarning, setVipInvitesWarning] = useState("");
  const [vipFilter, setVipFilter] = useState("all");
  const [vipPanelCollapsed, setVipPanelCollapsed] = useState(true);
  const [vipRealtimeHealthy, setVipRealtimeHealthy] = useState(false);
  const [vipInvitesLoadedOnce, setVipInvitesLoadedOnce] = useState(false);
  const [isAdminModerator, setIsAdminModerator] = useState(false);
  const [pendingSubmissionCount, setPendingSubmissionCount] = useState(0);
  const [composerTab, setComposerTab] = useState("friends");
  const [composerSearch, setComposerSearch] = useState("");
  const [composerWarning, setComposerWarning] = useState("");
  const [composerLoading, setComposerLoading] = useState(false);
  const [friendCandidates, setFriendCandidates] = useState([]);
  const [memberCandidates, setMemberCandidates] = useState([]);
  const [memberCandidateOffset, setMemberCandidateOffset] = useState(0);
  const [memberCandidatesHasMore, setMemberCandidatesHasMore] = useState(false);
  const [composerBusyByUserId, setComposerBusyByUserId] = useState({});
  const [composeOpen, setComposeOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search || "");
    return String(params.get("compose") || "").trim() === "1";
  });
  const [threadMenuOpen, setThreadMenuOpen] = useState(false);
  const [activeThreadBlocked, setActiveThreadBlocked] = useState(false);
  const [isUpdatingBlock, setIsUpdatingBlock] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState("Harassment or hateful conduct");
  const [reportDetails, setReportDetails] = useState("");
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [recentlyHiddenThread, setRecentlyHiddenThread] = useState(null);
  const [hiddenThreadIds, setHiddenThreadIds] = useState([]);
  const [threadResetAtById, setThreadResetAtById] = useState({});

  const activeThread = useMemo(
    () => threads.find((thread) => String(thread.id) === String(activeThreadId)) || null,
    [threads, activeThreadId]
  );

  const activeOtherUserId = activeThread?.otherUserId || "";
  const lastOwnMessageId = useMemo(
    () => [...messages].reverse().find((message) => String(message.senderId) === userId)?.id || "",
    [messages, userId]
  );
  const hiddenThreadStorageKey = useMemo(
    () => `qa_hidden_dm_threads_${userId || "guest"}`,
    [userId]
  );
  const threadResetStorageKey = useMemo(
    () => `qa_dm_thread_reset_at_${userId || "guest"}`,
    [userId]
  );

  const metrics = useMemo(() => {
    const unread = threads.reduce((sum, thread) => sum + Number(thread.unreadCount || 0), 0);
    const active = threads.filter((thread) => isActiveNow(thread.presence)).length;
    return {
      unread,
      active,
      total: threads.length,
    };
  }, [threads]);

  const filteredThreads = useMemo(() => {
    const query = conversationSearch.trim().toLowerCase();
    return threads.filter((thread) => {
      if (filter === "unread" && Number(thread.unreadCount || 0) <= 0) return false;
      if (filter === "active" && !isActiveNow(thread.presence)) return false;
      if (!query) return true;
      return String(thread.displayName || "").toLowerCase().includes(query);
    });
  }, [conversationSearch, filter, threads]);

  useEffect(() => {
    if (!userId) {
      queueMicrotask(() => {
        setHiddenThreadIds([]);
      });
      return;
    }
    const stored = readLocalJson(hiddenThreadStorageKey, []);
    if (!Array.isArray(stored)) {
      queueMicrotask(() => {
        setHiddenThreadIds([]);
      });
      return;
    }
    const normalized = [...new Set(stored.map((value) => String(value || "").trim()).filter(Boolean))];
    queueMicrotask(() => {
      setHiddenThreadIds(normalized);
    });
  }, [hiddenThreadStorageKey, userId]);

  useEffect(() => {
    if (!userId) return;
    writeLocalJson(hiddenThreadStorageKey, hiddenThreadIds);
  }, [hiddenThreadIds, hiddenThreadStorageKey, userId]);

  useEffect(() => {
    if (!userId) {
      queueMicrotask(() => {
        setThreadResetAtById({});
      });
      return;
    }
    const stored = readLocalJson(threadResetStorageKey, {});
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
      queueMicrotask(() => {
        setThreadResetAtById({});
      });
      return;
    }
    const normalized = {};
    Object.entries(stored).forEach(([key, value]) => {
      const threadId = String(key || "").trim();
      const resetAt = Number(value || 0);
      if (!threadId || !Number.isFinite(resetAt) || resetAt <= 0) return;
      normalized[threadId] = resetAt;
    });
    queueMicrotask(() => {
      setThreadResetAtById(normalized);
    });
  }, [threadResetStorageKey, userId]);

  useEffect(() => {
    if (!userId) return;
    writeLocalJson(threadResetStorageKey, threadResetAtById);
  }, [threadResetAtById, threadResetStorageKey, userId]);

  const threadByOtherUserId = useMemo(() => {
    const next = new Map();
    threads.forEach((thread) => {
      if (!thread?.otherUserId) return;
      next.set(String(thread.otherUserId), thread);
    });
    return next;
  }, [threads]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search || "");
    const nextUserId = String(params.get("user") || "").trim();
    const nextUserName = String(params.get("name") || "").trim();
    const nextCompose = String(params.get("compose") || "").trim() === "1";

    queueMicrotask(() => {
      if (nextUserId) setStartUserId(nextUserId);
      if (nextUserName) setStartUserName(nextUserName);
      setStartCompose(nextCompose);
      setComposeOpen(nextCompose);
    });
  }, []);

  const vipInviteCounts = useMemo(() => {
    const rows = Array.isArray(vipInviteRows) ? vipInviteRows : [];
    return {
      all: rows.length,
      requested: rows.filter((row) => String(row.status || "").toLowerCase() === "requested").length,
      accepted: rows.filter((row) => String(row.status || "").toLowerCase() === "accepted").length,
      host: rows.filter((row) => String(row.kind || "") === "host_request").length,
      mine: rows.filter((row) => String(row.kind || "") === "my_request").length,
    };
  }, [vipInviteRows]);

  const pendingHostActions = useMemo(
    () =>
      (vipInviteRows || []).filter(
        (row) => row.kind === "host_request" && String(row.status || "").toLowerCase() === "requested"
      ).length,
    [vipInviteRows]
  );

  const filteredVipInvites = useMemo(() => {
    const rows = Array.isArray(vipInviteRows) ? vipInviteRows : [];
    if (vipFilter === "requested") {
      return rows.filter((row) => String(row.status || "").toLowerCase() === "requested");
    }
    if (vipFilter === "accepted") {
      return rows.filter((row) => String(row.status || "").toLowerCase() === "accepted");
    }
    if (vipFilter === "host") {
      return rows.filter((row) => String(row.kind || "") === "host_request");
    }
    if (vipFilter === "mine") {
      return rows.filter((row) => String(row.kind || "") === "my_request");
    }
    return rows;
  }, [vipFilter, vipInviteRows]);

  const vipHostResponseSla = useMemo(() => {
    const responded = (vipInviteRows || [])
      .filter((row) => row.kind === "host_request")
      .map((row) => Number(row.responseMinutes || 0))
      .filter((value) => Number.isFinite(value) && value > 0);

    if (responded.length === 0) return "No response data yet";
    const avgMinutes = Math.round(responded.reduce((sum, value) => sum + value, 0) / responded.length);
    if (avgMinutes < 60) return `Avg host response: ~${avgMinutes}m`;
    const hours = (avgMinutes / 60).toFixed(1);
    return `Avg host response: ~${hours}h`;
  }, [vipInviteRows]);

  const getThreadResetAt = useCallback((threadId) => {
    const key = String(threadId || "").trim();
    if (!key) return 0;
    const value = Number(threadResetAtById[key] || 0);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }, [threadResetAtById]);

  const loadThreads = useCallback(async () => {
    if (!userId) return;

    setIsLoadingThreads(true);
    setWarning("");

    const { data: threadRows, error: threadError } = await supabase
      .from("qa_dm_threads")
      .select("id, user_a, user_b, created_at, updated_at, last_message_at")
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (threadError) {
      if (isMissingTableError(threadError)) {
        setWarning("Messaging tables are not enabled yet. Run supabase/direct-messaging-v1.sql first.");
      } else {
        setWarning("Could not load message threads right now.");
      }
      setThreads([]);
      setIsLoadingThreads(false);
      return;
    }

    const normalizedThreads = (threadRows || []).map((row) => {
      const otherUserId = row.user_a === userId ? row.user_b : row.user_a;
      return {
        id: String(row.id),
        otherUserId: String(otherUserId || ""),
        createdAt: row.created_at || null,
        updatedAt: row.updated_at || null,
        lastMessageAt: row.last_message_at || row.updated_at || row.created_at || null,
      };
    });

    const otherUserIds = [...new Set(normalizedThreads.map((row) => row.otherUserId).filter(Boolean))];
    const threadIds = normalizedThreads.map((row) => row.id);

    const profileMap = new Map();
    const friendMetaMap = new Map();
    const unreadMap = new Map();
    const lastMessageMap = new Map();
    const nextPresenceByUserId = {};

    const [{ data: friendMomentumRows }, { data: profileRows }, { data: presenceRows }] = await Promise.all([
      supabase.rpc("qa_get_friend_momentum", { friend_limit: 200 }),
      otherUserIds.length > 0
        ? supabase.from("member_profiles").select("user_id, display_name, trusted_contributor, avatar_url, avatar_path").in("user_id", otherUserIds)
        : Promise.resolve({ data: [] }),
      otherUserIds.length > 0
        ? supabase.from("qa_presence").select("user_id, is_online, last_seen_at").in("user_id", otherUserIds)
        : Promise.resolve({ data: [] }),
    ]);

    (friendMomentumRows || []).forEach((row) => {
      const friendId = String(row.user_id || "");
      if (!friendId) return;
      friendMetaMap.set(friendId, {
        displayName: String(row.display_name || "").trim(),
        avatarUrl: String(row.avatar_url || "").trim(),
        unreadCount: Number(row.unread_count || 0),
        isOnline: Boolean(row.is_online),
        lastSeenAt: row.last_seen_at || null,
      });
    });

    (profileRows || []).forEach((row) => {
      profileMap.set(String(row.user_id), row);
    });

    (presenceRows || []).forEach((row) => {
      nextPresenceByUserId[String(row.user_id)] = {
        isOnline: Boolean(row.is_online),
        lastSeenAt: row.last_seen_at || null,
      };
    });

    if (threadIds.length > 0) {
      const [{ data: unreadRows }, { data: recentRows }] = await Promise.all([
        supabase
          .from("qa_dm_messages")
          .select("thread_id, created_at")
          .in("thread_id", threadIds)
          .neq("sender_id", userId)
          .is("read_at", null),
        supabase
          .from("qa_dm_messages")
          .select("id, thread_id, sender_id, body, created_at")
          .in("thread_id", threadIds)
          .order("created_at", { ascending: false })
          .limit(500),
      ]);

      (unreadRows || []).forEach((row) => {
        const threadId = String(row.thread_id || "");
        if (!threadId) return;
        const resetAt = getThreadResetAt(threadId);
        const createdAtMs = new Date(row.created_at || 0).getTime();
        if (resetAt > 0 && Number.isFinite(createdAtMs) && createdAtMs <= resetAt) return;
        unreadMap.set(threadId, (unreadMap.get(threadId) || 0) + 1);
      });

      (recentRows || []).forEach((row) => {
        const threadId = String(row.thread_id || "");
        if (!threadId || lastMessageMap.has(threadId)) return;
        const resetAt = getThreadResetAt(threadId);
        const createdAtMs = new Date(row.created_at || 0).getTime();
        if (resetAt > 0 && Number.isFinite(createdAtMs) && createdAtMs <= resetAt) return;
        lastMessageMap.set(threadId, {
          id: String(row.id),
          body: row.body || "",
          createdAt: row.created_at || null,
          senderId: row.sender_id ? String(row.sender_id) : "",
        });
      });
    }

    const hiddenSet = new Set(hiddenThreadIds.map((value) => String(value || "")));
    const mappedThreads = normalizedThreads
      .map((thread) => {
        const profile = profileMap.get(thread.otherUserId);
        const momentumMeta = friendMetaMap.get(thread.otherUserId);
        const presence =
          momentumMeta
            ? { isOnline: momentumMeta.isOnline, lastSeenAt: momentumMeta.lastSeenAt }
            : nextPresenceByUserId[thread.otherUserId] || { isOnline: false, lastSeenAt: null };

        const lastMessage = lastMessageMap.get(thread.id) || null;
        const resetAt = getThreadResetAt(thread.id);
        const unreadCount = unreadMap.has(thread.id)
          ? Number(unreadMap.get(thread.id) || 0)
          : (resetAt > 0 ? 0 : Number(momentumMeta?.unreadCount || 0));
        const hintedName = thread.otherUserId === startUserId ? String(startUserName || "").trim() : "";
        const displayName =
          momentumMeta?.displayName ||
          displayNameFor(profile, hintedName || "Member");

        return {
          ...thread,
          displayName,
          avatarUrl: momentumMeta?.avatarUrl || resolveAvatarUrlFromProfile(profile),
          trustedContributor: Boolean(profile?.trusted_contributor),
          lastMessage,
          unreadCount,
          presence,
          preview: threadActivityLabel(lastMessage, userId, unreadCount),
          sortTs: new Date(lastMessage?.createdAt || thread.lastMessageAt || thread.updatedAt || thread.createdAt || 0).getTime(),
        };
      })
      .filter((thread) => !hiddenSet.has(String(thread.id)))
      .sort((a, b) => b.sortTs - a.sortTs);

    setThreads(mappedThreads);
    setActiveThreadId((current) => {
      if (current && mappedThreads.some((thread) => thread.id === current)) return current;
      return mappedThreads[0]?.id || "";
    });
    setIsLoadingThreads(false);
  }, [getThreadResetAt, hiddenThreadIds, startUserId, startUserName, userId]);

  const loadVipInvites = useCallback(async ({ silent = false } = {}) => {
    if (!userId) {
      setVipInviteRows([]);
      setVipInvitesWarning("");
      return;
    }

    if (!silent && !vipInvitesLoadedOnce) {
      setIsLoadingVipInvites(true);
    }
    setVipInvitesWarning("");

    const eventFields = "id,city,title,event_type,host_alias,host_user_id,start_at,expires_at,status,approx_area";
    const { data: hostedEvents, error: hostedEventsError } = await supabase
      .from("qa_private_events")
      .select(eventFields)
      .eq("host_user_id", userId)
      .order("start_at", { ascending: false })
      .limit(80);

    if (hostedEventsError) {
      if (isMissingTableError(hostedEventsError)) {
        setVipInvitesWarning("VIP invites are not enabled yet.");
      } else {
        setVipInvitesWarning("Could not load VIP invites right now.");
      }
      setVipInviteRows([]);
      setIsLoadingVipInvites(false);
      return;
    }

    const hostedMap = new Map(
      (hostedEvents || []).map((event) => [String(event.id), event]),
    );
    const hostedEventIds = (hostedEvents || []).map((event) => String(event.id)).filter(Boolean);

    const [{ data: myInviteRows, error: myInviteError }, { data: hostInviteRows, error: hostInviteError }] = await Promise.all([
      supabase
        .from("qa_private_event_invites")
        .select("id,event_id,status,message,created_at,updated_at,requester_user_id")
        .eq("requester_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(120),
      hostedEventIds.length > 0
        ? supabase
          .from("qa_private_event_invites")
          .select("id,event_id,status,message,created_at,updated_at,requester_user_id")
          .in("event_id", hostedEventIds)
          .order("created_at", { ascending: false })
          .limit(200)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (myInviteError || hostInviteError) {
      const candidateError = myInviteError || hostInviteError;
      if (isMissingTableError(candidateError)) {
        setVipInvitesWarning("VIP invites are not enabled yet.");
      } else {
        setVipInvitesWarning("Could not load VIP invites right now.");
      }
      setVipInviteRows([]);
      setIsLoadingVipInvites(false);
      return;
    }

    const requestedEventIds = [...new Set((myInviteRows || [])
      .map((row) => String(row.event_id || "").trim())
      .filter(Boolean))];

    const missingRequestedEventIds = requestedEventIds.filter((eventId) => !hostedMap.has(eventId));
    if (missingRequestedEventIds.length > 0) {
      const { data: requestedEvents } = await supabase
        .from("qa_private_events")
        .select(eventFields)
        .in("id", missingRequestedEventIds)
        .limit(120);

      for (const event of requestedEvents || []) {
        hostedMap.set(String(event.id), event);
      }
    }

    const requesterIds = [...new Set((hostInviteRows || [])
      .map((row) => String(row.requester_user_id || "").trim())
      .filter(Boolean))];
    const requesterAliasMap = new Map();
    if (requesterIds.length > 0) {
      const { data: requesterProfiles } = await supabase
        .from("member_profiles")
        .select("user_id,display_name")
        .in("user_id", requesterIds);

      for (const profile of requesterProfiles || []) {
        const key = String(profile.user_id || "").trim();
        if (!key) continue;
        requesterAliasMap.set(key, String(profile.display_name || "").trim() || "Member");
      }
    }

    const myRows = (myInviteRows || []).map((row) => {
      const event = hostedMap.get(String(row.event_id || "")) || {};
      return {
        id: `mine-${row.id}`,
        kind: "my_request",
        city: String(event.city || "").trim(),
        title: String(event.title || "Private event").trim(),
        eventType: String(event.event_type || "").trim(),
        hostAlias: String(event.host_alias || "Host").trim() || "Host",
        hostUserId: String(event.host_user_id || "").trim(),
        status: String(row.status || "requested"),
        message: String(row.message || "").trim(),
        createdAt: row.created_at || null,
        decidedAt: row.updated_at || null,
        responseMinutes: row.updated_at && row.created_at
          ? Math.max(0, Math.round((new Date(row.updated_at).getTime() - new Date(row.created_at).getTime()) / 60000))
          : 0,
      };
    });

    const hostRows = (hostInviteRows || []).map((row) => {
      const event = hostedMap.get(String(row.event_id || "")) || {};
      const requesterId = String(row.requester_user_id || "").trim();
      const requesterAlias = requesterAliasMap.get(requesterId)
        || (requesterId ? `${requesterId.slice(0, 8)}...` : "Member");
      return {
        id: `host-${row.id}`,
        kind: "host_request",
        city: String(event.city || "").trim(),
        title: String(event.title || "Private event").trim(),
        eventType: String(event.event_type || "").trim(),
        requesterAlias,
        requesterUserId: requesterId,
        status: String(row.status || "requested"),
        message: String(row.message || "").trim(),
        createdAt: row.created_at || null,
        decidedAt: row.updated_at || null,
        responseMinutes: row.updated_at && row.created_at
          ? Math.max(0, Math.round((new Date(row.updated_at).getTime() - new Date(row.created_at).getTime()) / 60000))
          : 0,
      };
    });

    const merged = [...myRows, ...hostRows].sort((a, b) => {
      const aTs = new Date(a.decidedAt || a.createdAt || 0).getTime();
      const bTs = new Date(b.decidedAt || b.createdAt || 0).getTime();
      return bTs - aTs;
    });

    const trimmed = merged.slice(0, 24);
    setVipInviteRows((current) => (
      areVipInviteRowsEquivalent(trimmed, current) ? current : trimmed
    ));
    setVipInvitesLoadedOnce(true);
    setIsLoadingVipInvites(false);
  }, [userId, vipInvitesLoadedOnce]);

  const loadPendingSubmissionAlerts = useCallback(async () => {
    if (!userId || !isMember) {
      setIsAdminModerator(false);
      setPendingSubmissionCount(0);
      return;
    }

    const adminAccess = await resolveAdminAccess({ email: user?.email || "" });
    const isAdmin = Boolean(adminAccess?.isAdmin);
    setIsAdminModerator(isAdmin);

    if (!isAdmin) {
      setPendingSubmissionCount(0);
      return;
    }

    const { count, error: countError } = await supabase
      .from("qa_content_submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    if (countError) {
      setPendingSubmissionCount(0);
      return;
    }

    setPendingSubmissionCount(Number(count || 0));
  }, [isMember, user?.email, userId]);

  const loadFriendCandidates = useCallback(async (searchTerm = "") => {
    if (!userId || !isMember) {
      setFriendCandidates([]);
      return;
    }

    const { data, error } = await supabase.rpc("qa_get_friend_momentum", { friend_limit: 120 });
    if (error) {
      if (isMissingTableError(error)) {
        setComposerWarning("Friend network is not enabled yet.");
      } else {
        setComposerWarning("Could not load friend network right now.");
      }
      setFriendCandidates([]);
      return;
    }

    const trustedByUserId = new Map();
    const friendUserIds = [...new Set((data || [])
      .map((row) => String(row.user_id || "").trim())
      .filter(Boolean))];
    if (friendUserIds.length > 0) {
      const { data: profileRows } = await supabase
        .from("member_profiles")
        .select("user_id,trusted_contributor,avatar_url,avatar_path")
        .in("user_id", friendUserIds);
      const avatarByUserId = new Map();
      (profileRows || []).forEach((profile) => {
        const profileUserId = String(profile?.user_id || "").trim();
        if (!profileUserId) return;
        trustedByUserId.set(profileUserId, Boolean(profile?.trusted_contributor));
        avatarByUserId.set(profileUserId, resolveAvatarUrlFromProfile(profile));
      });
      const query = String(searchTerm || "").trim().toLowerCase();
      const rows = (data || []).map((row) => {
        const candidateUserId = String(row.user_id || "").trim();
        return {
          userId: String(row.user_id || ""),
          displayName: String(row.display_name || "").trim() || "Member",
          trustedContributor: Boolean(trustedByUserId.get(candidateUserId)),
          avatarUrl: String(row.avatar_url || "").trim() || String(avatarByUserId.get(candidateUserId) || "").trim(),
          isOnline: Boolean(row.is_online),
          activeNow: Boolean(row.active_now),
          lastSeenAt: row.last_seen_at || null,
          latestMessageAt: row.latest_message_at || null,
          unreadCount: Number(row.unread_count || 0),
        };
      });

      const filtered = !query
        ? rows
        : rows.filter((row) => row.displayName.toLowerCase().includes(query));

      setFriendCandidates(filtered);
      return;
    }

    const query = String(searchTerm || "").trim().toLowerCase();
    const rows = (data || []).map((row) => ({
      userId: String(row.user_id || ""),
      displayName: String(row.display_name || "").trim() || "Member",
      trustedContributor: false,
      avatarUrl: String(row.avatar_url || "").trim(),
      isOnline: Boolean(row.is_online),
      activeNow: Boolean(row.active_now),
      lastSeenAt: row.last_seen_at || null,
      latestMessageAt: row.latest_message_at || null,
      unreadCount: Number(row.unread_count || 0),
    }));

    const filtered = !query
      ? rows
      : rows.filter((row) => row.displayName.toLowerCase().includes(query));

    setFriendCandidates(filtered);
  }, [isMember, userId]);

  const loadMemberCandidates = useCallback(async ({
    searchTerm = "",
    offset = 0,
    append = false,
  } = {}) => {
    if (!userId || !isMember) {
      setMemberCandidates([]);
      setMemberCandidateOffset(0);
      setMemberCandidatesHasMore(false);
      return;
    }

    const safeOffset = Math.max(0, Number(offset || 0));
    const requestLimit = MEMBER_PICKER_PAGE_SIZE + 1;

    const { data, error } = await supabase.rpc("qa_search_members", {
      search_query: String(searchTerm || "").trim(),
      city_filter: "",
      sort_mode: "best",
      friends_only: false,
      result_limit: requestLimit,
      result_offset: safeOffset,
    });

    if (error) {
      if (isMissingTableError(error)) {
        setComposerWarning("Member discovery backend is not enabled yet.");
      } else {
        setComposerWarning("Could not search members right now.");
      }
      if (!append) {
        setMemberCandidates([]);
        setMemberCandidateOffset(0);
        setMemberCandidatesHasMore(false);
      }
      return;
    }

    const normalized = (data || []).map(normalizeMemberPickerRow);
    const candidateUserIds = normalized.map((row) => String(row.userId || "").trim()).filter(Boolean);
    let avatarByUserId = new Map();
    if (candidateUserIds.length > 0) {
      const { data: profileRows } = await supabase
        .from("member_profiles")
        .select("user_id,avatar_url,avatar_path")
        .in("user_id", candidateUserIds);
      avatarByUserId = new Map(
        (profileRows || []).map((profile) => [
          String(profile.user_id || "").trim(),
          resolveAvatarUrlFromProfile(profile),
        ])
      );
    }
    const withAvatars = normalized.map((row) => ({
      ...row,
      avatarUrl: row.avatarUrl || String(avatarByUserId.get(String(row.userId || "").trim()) || "").trim(),
    }));
    const hasMore = withAvatars.length > MEMBER_PICKER_PAGE_SIZE;
    const visible = hasMore ? withAvatars.slice(0, MEMBER_PICKER_PAGE_SIZE) : withAvatars;

    setMemberCandidateOffset(safeOffset);
    setMemberCandidatesHasMore(hasMore);
    setMemberCandidates((current) => {
      if (!append) return visible;
      const seen = new Set(current.map((row) => row.userId));
      const merged = [...current];
      visible.forEach((row) => {
        if (!row.userId || seen.has(row.userId)) return;
        seen.add(row.userId);
        merged.push(row);
      });
      return merged;
    });
  }, [isMember, userId]);

  const markThreadRead = useCallback(
    async (threadId) => {
      if (!threadId || !userId) return;

      const { error: rpcError } = await supabase.rpc("qa_mark_thread_read", {
        target_thread_id: threadId,
      });

      if (rpcError && !isMissingTableError(rpcError)) {
        await Promise.all([
          supabase
            .from("qa_dm_messages")
            .update({ read_at: new Date().toISOString() })
            .eq("thread_id", threadId)
            .neq("sender_id", userId)
            .is("read_at", null),
          supabase.from("qa_dm_thread_state").upsert(
            {
              thread_id: threadId,
              user_id: userId,
              last_read_at: new Date().toISOString(),
            },
            { onConflict: "thread_id,user_id" }
          ),
        ]);
      }

      setThreads((current) =>
        current.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                unreadCount: 0,
              }
            : thread
        )
      );
    },
    [userId]
  );

  const loadMessages = useCallback(
    async (threadId) => {
      if (!threadId) {
        setMessages([]);
        setHasOlderMessages(false);
        setActiveThreadBlocked(false);
        return;
      }

      setIsLoadingMessages(true);
      const [{ data, error }, { data: stateRow, error: stateError }] = await Promise.all([
        supabase
          .from("qa_dm_messages")
          .select("id, thread_id, sender_id, body, created_at, read_at")
          .eq("thread_id", threadId)
          .order("created_at", { ascending: false })
          .limit(51),
        supabase
          .from("qa_dm_thread_state")
          .select("blocked")
          .eq("thread_id", threadId)
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

      if (error) {
        if (isMissingTableError(error)) {
          setWarning("Messaging tables are not enabled yet. Run supabase/direct-messaging-v1.sql first.");
        } else {
          showToast("Could not load this thread right now.", { tone: "warn" });
        }
        setMessages([]);
        setHasOlderMessages(false);
        setIsLoadingMessages(false);
        return;
      }

      const resetAt = getThreadResetAt(threadId);
      const visibleRows = (data || []).slice(0, 50).reverse();
      const filteredRows = visibleRows.filter((row) => {
        if (!resetAt) return true;
        const createdAtMs = new Date(row.created_at || 0).getTime();
        return !Number.isFinite(createdAtMs) || createdAtMs > resetAt;
      });
      setMessages(filteredRows.map(normalizeMessageRow));
      setHasOlderMessages((data || []).length > 50 && !resetAt);
      setActiveThreadBlocked(stateError ? false : Boolean(stateRow?.blocked));
      await markThreadRead(threadId);
      setIsLoadingMessages(false);
    },
    [getThreadResetAt, markThreadRead, showToast, userId]
  );

  const loadOlderMessages = useCallback(async () => {
    if (!activeThreadId || !hasOlderMessages || isLoadingOlderMessages || messages.length === 0) return;
    const oldestCreatedAt = messages[0]?.createdAt;
    if (!oldestCreatedAt) return;
    shouldScrollToEndRef.current = false;
    setIsLoadingOlderMessages(true);
    const { data, error } = await supabase
      .from("qa_dm_messages")
      .select("id, thread_id, sender_id, body, created_at, read_at")
      .eq("thread_id", activeThreadId)
      .lt("created_at", oldestCreatedAt)
      .order("created_at", { ascending: false })
      .limit(51);

    if (error) {
      showToast("Could not load older messages right now.", { tone: "warn" });
      setIsLoadingOlderMessages(false);
      return;
    }

    const olderRows = (data || []).slice(0, 50).reverse().map(normalizeMessageRow);
    setMessages((current) => [...olderRows, ...current]);
    setHasOlderMessages((data || []).length > 50);
    setIsLoadingOlderMessages(false);
  }, [activeThreadId, hasOlderMessages, isLoadingOlderMessages, messages, showToast]);

  const openNewMessage = useCallback(() => {
    setStartUserId("");
    setStartUserName("");
    setStartCompose(false);
    setDirectComposeBody("");
    setComposerSearch("");
    setComposerTab("friends");
    setComposeOpen(true);
    queueMicrotask(() => composerInputRef.current?.focus());
  }, []);

  const closeCompose = useCallback(() => {
    setComposeOpen(false);
    setStartCompose(false);
    setStartUserId("");
    setStartUserName("");
    setDirectComposeBody("");
    router.replace("/messages");
  }, [router]);

  const toggleBlockActiveMember = useCallback(async () => {
    if (!activeThreadId || !userId || isUpdatingBlock) return;
    const nextBlocked = !activeThreadBlocked;
    setIsUpdatingBlock(true);
    const { error } = await supabase.from("qa_dm_thread_state").upsert({
      thread_id: activeThreadId,
      user_id: userId,
      blocked: nextBlocked,
      updated_at: new Date().toISOString(),
    }, { onConflict: "thread_id,user_id" });

    if (error) {
      showToast("Could not update this member right now.", { tone: "warn" });
    } else {
      setActiveThreadBlocked(nextBlocked);
      setThreadMenuOpen(false);
      showToast(nextBlocked ? "Member blocked. They can no longer message you." : "Member unblocked.", { tone: "ok" });
    }
    setIsUpdatingBlock(false);
  }, [activeThreadBlocked, activeThreadId, isUpdatingBlock, showToast, userId]);

  const submitReport = useCallback(async () => {
    if (!reportTarget?.id) return;
    addReport({
      targetType: reportTarget.type === "message" ? "direct-message" : "direct-message-member",
      targetId: reportTarget.id,
      title: reportTarget.title || "Private message report",
      reason: reportReason,
      message: reportDetails,
    });
    if (reportTarget.type === "message") {
      await supabase
        .from("qa_dm_messages")
        .update({ reported_at: new Date().toISOString() })
        .eq("id", reportTarget.id);
    }
    setReportTarget(null);
    setReportDetails("");
    setThreadMenuOpen(false);
    showToast("Report sent to the moderation queue.", { tone: "ok" });
  }, [reportDetails, reportReason, reportTarget, showToast]);

  const handleSelectThread = useCallback((threadId) => {
    setActiveThreadId(threadId);
    setActiveThreadBlocked(false);
    setThreadMenuOpen(false);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileThreadOpen(true);
      queueMicrotask(() => threadHeadingRef.current?.focus());
    }
  }, []);

  const removeThreadFromInbox = useCallback((threadId, options = {}) => {
    const targetThreadId = String(threadId || "").trim();
    if (!targetThreadId) return;
    const { silent = false } = options;

    setHiddenThreadIds((current) => {
      if (current.includes(targetThreadId)) return current;
      return [...current, targetThreadId];
    });
    setThreadResetAtById((current) => ({
      ...current,
      [targetThreadId]: Date.now(),
    }));

    setThreads((current) => {
      const hiddenThread = current.find((thread) => String(thread.id) === targetThreadId) || null;
      if (hiddenThread) setRecentlyHiddenThread(hiddenThread);
      const next = current.filter((thread) => String(thread.id) !== targetThreadId);
      if (String(activeThreadRef.current) === targetThreadId) {
        const nextActive = next[0]?.id || "";
        setActiveThreadId(nextActive);
        setMessages([]);
        if (!nextActive) {
          setMobileThreadOpen(false);
        }
      }
      return next;
    });

    if (!silent) {
      showToast("Conversation hidden. It returns when a new message arrives.", { tone: "ok", duration: 2600 });
    }
  }, [showToast]);

  const undoHideThread = useCallback(() => {
    const hiddenThread = recentlyHiddenThread;
    if (!hiddenThread?.id) return;
    setHiddenThreadIds((current) => current.filter((id) => String(id) !== String(hiddenThread.id)));
    setThreadResetAtById((current) => {
      const next = { ...current };
      delete next[String(hiddenThread.id)];
      return next;
    });
    setThreads((current) => {
      if (current.some((thread) => String(thread.id) === String(hiddenThread.id))) return current;
      return [...current, hiddenThread].sort((a, b) => b.sortTs - a.sortTs);
    });
    setActiveThreadId(String(hiddenThread.id));
    setRecentlyHiddenThread(null);
    showToast("Conversation restored.", { tone: "ok" });
  }, [recentlyHiddenThread, showToast]);

  const handleSend = useCallback(async () => {
    const body = draft.trim();
    if (!body || !activeThreadId || !userId || sending) return;

    setSending(true);
    shouldScrollToEndRef.current = true;
    const { data, error } = await supabase
      .from("qa_dm_messages")
      .insert({
        thread_id: activeThreadId,
        sender_id: userId,
        body,
      })
      .select("id, thread_id, sender_id, body, created_at, read_at")
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        setWarning("Messaging tables are not enabled yet. Run supabase/direct-messaging-v1.sql first.");
      } else {
        const message = String(error.message || "").toLowerCase();
        showToast(
          message.includes("policy") || message.includes("not allowed") || message.includes("qa_dm_can_send")
            ? "You can’t message this member right now."
            : (error.message || "Could not send message right now."),
          { tone: "warn" }
        );
      }
      setSending(false);
      return;
    }

    const sentMessage = normalizeMessageRow(data || {});
    if (sentMessage?.id) {
      setMessages((current) => {
        if (current.some((item) => String(item.id) === String(sentMessage.id))) return current;
        return [...current, sentMessage];
      });
      setThreads((current) => {
        const next = current.map((thread) => {
          if (String(thread.id) !== String(activeThreadId)) return thread;
          return {
            ...thread,
            lastMessageAt: sentMessage.createdAt || thread.lastMessageAt,
            lastMessage: {
              id: sentMessage.id,
              body: sentMessage.body,
              createdAt: sentMessage.createdAt,
              senderId: sentMessage.senderId,
            },
            preview: "You sent a message",
            sortTs: new Date(sentMessage.createdAt || thread.lastMessageAt || 0).getTime(),
          };
        });
        return [...next].sort((a, b) => b.sortTs - a.sortTs);
      });
    }

    setDraft("");
    showActionFeedback(showToast, "messageSent");
    setSending(false);
  }, [activeThreadId, draft, sending, showToast, userId]);

  const getOrCreateThreadForUser = useCallback(
    async (targetUserId) => {
      const normalized = String(targetUserId || "").trim();
      if (!normalized || !userId || normalized === userId) return "";

      const { data, error } = await supabase.rpc("qa_get_or_create_dm_thread", {
        target_user_id: normalized,
      });

      if (error) {
        if (isMissingTableError(error)) {
          setWarning("Messaging tables are not enabled yet. Run supabase/direct-messaging-v1.sql first.");
        } else {
          setWarning(error.message || "Could not open this message thread right now.");
          showToast(error.message || "Could not open this message thread right now.", { tone: "warn" });
        }
        return "";
      }

      const threadId = Array.isArray(data)
        ? String(data[0]?.thread_id || "")
        : String(data?.thread_id || "");

      if (!threadId) {
        showToast("Could not open this message thread right now.", { tone: "warn" });
        return "";
      }

      return threadId;
    },
    [showToast, userId]
  );

  const openOrCreateThreadForUser = useCallback(
    async (targetUserId) => {
      const threadId = await getOrCreateThreadForUser(targetUserId);
      if (!threadId) return;

      setHiddenThreadIds((current) => current.filter((id) => String(id) !== String(threadId)));
      await loadThreads();
      setActiveThreadId(threadId);
      setStartUserId("");
      setStartUserName("");
      setStartCompose(false);
      setComposeOpen(false);
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setMobileThreadOpen(true);
      }
      router.replace("/messages");
    },
    [getOrCreateThreadForUser, loadThreads, router]
  );

  const sendDirectComposeMessage = useCallback(async () => {
    const targetUserId = String(startUserId || "").trim();
    const body = String(directComposeBody || "").trim();
    if (!targetUserId || !body || !userId || isDirectComposeSending) return;

    setIsDirectComposeSending(true);
    try {
      const threadId = await getOrCreateThreadForUser(targetUserId);
      if (!threadId) return;

      const { error } = await supabase.from("qa_dm_messages").insert({
        thread_id: threadId,
        sender_id: userId,
        body,
      });
      if (error) throw error;

      setHiddenThreadIds((current) => current.filter((id) => String(id) !== String(threadId)));
      await loadThreads();
      setActiveThreadId(threadId);
      setStartCompose(false);
      setComposeOpen(false);
      setDirectComposeBody("");
      setStartUserId("");
      setStartUserName("");
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setMobileThreadOpen(true);
      }
      router.replace("/messages");
      showActionFeedback(showToast, "messageSent");
    } catch (error) {
      const message = String(error?.message || "").toLowerCase();
      showToast(
        message.includes("policy") || message.includes("not allowed") || message.includes("qa_dm_can_send")
          ? "You can’t message this member right now."
          : (error?.message || "Could not send host message right now."),
        { tone: "warn" }
      );
    } finally {
      setIsDirectComposeSending(false);
    }
  }, [
    directComposeBody,
    getOrCreateThreadForUser,
    isDirectComposeSending,
    loadThreads,
    router,
    showToast,
    startUserId,
    userId,
  ]);

  const openComposeWithUser = useCallback((targetUserId, targetName = "Member") => {
    const normalizedUserId = String(targetUserId || "").trim();
    if (!normalizedUserId) return;
    setStartUserId(normalizedUserId);
    setStartUserName(String(targetName || "Member").trim() || "Member");
    setStartCompose(true);
    setComposeOpen(true);
    setDirectComposeBody("");
    queueMicrotask(() => composerInputRef.current?.focus());
  }, []);

  const openThreadFromCandidate = useCallback(async (candidateUserId) => {
    const targetUserId = String(candidateUserId || "").trim();
    if (!targetUserId || targetUserId === userId) return;
    if (composerBusyByUserId[targetUserId]) return;

    setComposerBusyByUserId((current) => ({ ...current, [targetUserId]: true }));
    try {
      await openOrCreateThreadForUser(targetUserId);
      setFilter("all");
      setMobileThreadOpen(true);
      setComposeOpen(false);
    } finally {
      setComposerBusyByUserId((current) => ({ ...current, [targetUserId]: false }));
    }
  }, [composerBusyByUserId, openOrCreateThreadForUser, userId]);

  const loadMoreMemberCandidates = useCallback(async () => {
    if (composerLoading || !memberCandidatesHasMore || composerTab !== "members") return;
    const nextOffset = memberCandidateOffset + MEMBER_PICKER_PAGE_SIZE;
    setComposerLoading(true);
    await loadMemberCandidates({
      searchTerm: composerSearch,
      offset: nextOffset,
      append: true,
    });
    setComposerLoading(false);
  }, [
    composerLoading,
    memberCandidatesHasMore,
    composerTab,
    memberCandidateOffset,
    loadMemberCandidates,
    composerSearch,
  ]);

  useEffect(() => {
    activeThreadRef.current = activeThreadId;
  }, [activeThreadId]);

  useEffect(() => {
    if (!isReady || !isMember || !userId || !composeOpen || startCompose) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      queueMicrotask(async () => {
        if (cancelled) return;
        setComposerLoading(true);
        setComposerWarning("");

        if (composerTab === "friends") {
          await loadFriendCandidates(composerSearch);
          if (!cancelled) {
            setMemberCandidates([]);
            setMemberCandidateOffset(0);
            setMemberCandidatesHasMore(false);
          }
        } else {
          await loadMemberCandidates({
            searchTerm: composerSearch,
            offset: 0,
            append: false,
          });
        }

        if (!cancelled) setComposerLoading(false);
      });
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    composerSearch,
    composerTab,
    composeOpen,
    isMember,
    isReady,
    loadFriendCandidates,
    loadMemberCandidates,
    startCompose,
    userId,
  ]);

  useEffect(() => {
    if (!isReady) return;
    if (!shouldScrollToEndRef.current) {
      shouldScrollToEndRef.current = true;
      return;
    }
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isReady]);

  useEffect(() => {
    if (isAuthLoading) return;

    queueMicrotask(async () => {
      if (!isMember) {
        writeLocalValue("qa_post_login_target", "/messages");
        router.replace("/?join=true");
        setIsReady(true);
        return;
      }

      await loadThreads();
      await loadVipInvites();
      setIsReady(true);
    });
  }, [isAuthLoading, isMember, loadThreads, loadVipInvites, router]);

  useEffect(() => {
    if (!activeThreadId || !isReady) return;
    queueMicrotask(() => {
      loadMessages(activeThreadId);
    });
  }, [activeThreadId, isReady, loadMessages]);

  useEffect(() => {
    if (!isReady || !isMember || !userId) return undefined;
    if (vipRealtimeHealthy) return undefined;

    const timer = setInterval(() => {
      loadVipInvites({ silent: true });
    }, 45000);

    return () => clearInterval(timer);
  }, [isMember, isReady, loadVipInvites, userId, vipRealtimeHealthy]);

  useEffect(() => {
    if (!isReady || !isMember || !userId) return undefined;

    const channel = supabase
      .channel(`qa-vip-invites-inbox-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "qa_private_event_invites" }, () => {
        loadVipInvites({ silent: true });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "qa_private_events" }, () => {
        loadVipInvites({ silent: true });
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setVipRealtimeHealthy(true);
          loadVipInvites({ silent: true });
          return;
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setVipRealtimeHealthy(false);
        }
      });

    return () => {
      setVipRealtimeHealthy(false);
      supabase.removeChannel(channel);
    };
  }, [isMember, isReady, loadVipInvites, userId]);

  useEffect(() => {
    if (!isReady || !isMember || !userId) return undefined;

    queueMicrotask(() => {
      loadPendingSubmissionAlerts();
    });
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        loadPendingSubmissionAlerts({ silent: true });
      }
    };

    const channel = supabase
      .channel(`qa-inbox-submission-alerts-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "qa_content_submissions" }, () => {
        loadPendingSubmissionAlerts({ silent: true });
      })
      .subscribe();

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channel);
    };
  }, [isMember, isReady, loadPendingSubmissionAlerts, userId]);

  useEffect(() => {
    if (!isReady || !isMember || !startUserId || !userId || startCompose) return;
    queueMicrotask(() => {
      openOrCreateThreadForUser(startUserId);
    });
  }, [isReady, isMember, openOrCreateThreadForUser, startCompose, startUserId, userId]);

  useEffect(() => {
    if (!vipInvitesLoadedOnce) return;
    queueMicrotask(() => {
      if (pendingHostActions > 0 && vipFilter === "all") {
        setVipFilter("host");
      }
    });
  }, [pendingHostActions, vipFilter, vipInvitesLoadedOnce]);

  useEffect(() => {
    if (!composeOpen && !reportTarget && vipPanelCollapsed) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (reportTarget) {
        setReportTarget(null);
        return;
      }
      if (!vipPanelCollapsed) {
        setVipPanelCollapsed(true);
        return;
      }
      if (composeOpen) closeCompose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeCompose, composeOpen, reportTarget, vipPanelCollapsed]);

  useEffect(() => {
    if (!composeOpen) return;
    const timer = window.setTimeout(() => composerInputRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [composeOpen, startCompose]);

  useEffect(() => {
    if (!mobileThreadOpen || !activeThreadId) return;
    const timer = window.setTimeout(() => threadHeadingRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [activeThreadId, mobileThreadOpen]);

  useEffect(() => {
    if (!userId || !isMember) return;

    let cancelled = false;
    const heartbeat = async () => {
      const { error } = await supabase.rpc("qa_upsert_presence");
      if (error && !cancelled && !isMissingTableError(error)) {
        // Presence failure should not block inbox usage.
      }
    };

    heartbeat();
    const timer = setInterval(heartbeat, 45000);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        heartbeat();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isMember, userId]);

  useEffect(() => {
    if (!userId || !isMember) return;

    const channel = supabase
      .channel(`qa-signal-inbox-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "qa_dm_messages" }, async (payload) => {
        const row = payload.new || {};
        const threadId = String(row.thread_id || "");
        if (!threadId) return;
        const resetAt = getThreadResetAt(threadId);
        const createdAtMs = new Date(row.created_at || 0).getTime();
        if (resetAt > 0 && Number.isFinite(createdAtMs) && createdAtMs <= resetAt) {
          return;
        }

        const messageRow = normalizeMessageRow(row);

        setThreads((current) => {
          if (!current.some((thread) => thread.id === threadId)) {
            const isIncomingHidden =
              messageRow.senderId &&
              messageRow.senderId !== userId &&
              hiddenThreadIds.includes(threadId);
            if (isIncomingHidden) {
              setHiddenThreadIds((currentHidden) =>
                currentHidden.filter((id) => String(id) !== threadId)
              );
            }
            queueMicrotask(loadThreads);
            return current;
          }

          const next = current.map((thread) => {
            if (thread.id !== threadId) return thread;
            const isIncoming = messageRow.senderId && messageRow.senderId !== userId;
            const unreadCount =
              isIncoming && activeThreadRef.current !== threadId
                ? (thread.unreadCount || 0) + 1
                : thread.unreadCount || 0;

            return {
              ...thread,
              lastMessageAt: messageRow.createdAt || thread.lastMessageAt,
              lastMessage: {
                id: messageRow.id,
                body: messageRow.body,
                createdAt: messageRow.createdAt,
                senderId: messageRow.senderId,
              },
              preview: threadActivityLabel(messageRow, userId, unreadCount),
              unreadCount,
              sortTs: new Date(messageRow.createdAt || thread.lastMessageAt || 0).getTime(),
            };
          });

          return [...next].sort((a, b) => b.sortTs - a.sortTs);
        });

        if (activeThreadRef.current === threadId) {
          setMessages((current) => {
            if (current.some((item) => String(item.id) === messageRow.id)) return current;
            return [...current, messageRow];
          });
          if (messageRow.senderId && messageRow.senderId !== userId) {
            await markThreadRead(threadId);
          }
        } else if (messageRow.senderId && messageRow.senderId !== userId) {
          showToast("New message received.", { tone: "info", duration: 2600 });
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "qa_dm_messages" }, (payload) => {
        const row = payload.new || {};
        const messageId = String(row.id || "");
        const threadId = String(row.thread_id || "");
        if (!messageId || threadId !== activeThreadRef.current) return;
        setMessages((current) => current.map((message) => (
          String(message.id) === messageId ? normalizeMessageRow(row) : message
        )));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "qa_presence" }, (payload) => {
        const row = payload.new || {};
        const updatedUserId = String(row.user_id || "");
        if (!updatedUserId) return;

        const nextPresence = {
          isOnline: Boolean(row.is_online),
          lastSeenAt: row.last_seen_at || null,
        };
        setThreads((current) =>
          current.map((thread) =>
            thread.otherUserId === updatedUserId
              ? { ...thread, presence: nextPresence }
              : thread
          )
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [getThreadResetAt, hiddenThreadIds, isMember, loadThreads, markThreadRead, showToast, userId]);

  if (!isReady || isAuthLoading) {
    return (
      <main className="qa-page min-h-screen bg-[#050505] pb-10 text-white md:pb-20">
        <div className="qa-shell">
          <PageOpeningState
            title="Loading Signal Inbox"
            subtitle="Syncing your threads, unread signal, and active friends."
          />
        </div>
      </main>
    );
  }

  return (
    <main className="qa-page min-h-screen bg-[#050505] pb-24 text-white md:pb-20">
      <div className="qa-shell">
        <header className="mb-4 flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="qa-eyebrow text-cyan-100/65">Private member space</p>
            <div className="mt-2 flex items-center gap-3">
              <h1 className="qa-display text-3xl font-bold tracking-[-0.035em] text-[#f7f3ee] sm:text-4xl">Messages</h1>
              {metrics.unread > 0 ? (
                <span className="rounded-full bg-fuchsia-300 px-2.5 py-1 text-[11px] font-bold text-[#160914]">
                  {metrics.unread} unread
                </span>
              ) : null}
            </div>
            <p className="mt-2 max-w-xl text-sm text-white/58">Your conversations, requests and local connections in one quiet place.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isAdminModerator && pendingSubmissionCount > 0 ? (
              <button type="button" onClick={() => router.push("/admin")} className="qa-action min-h-11 rounded-full border border-amber-200/24 bg-amber-200/[0.08] px-4 text-xs font-semibold text-amber-100">
                {pendingSubmissionCount} moderation item{pendingSubmissionCount === 1 ? "" : "s"}
              </button>
            ) : null}
            <button type="button" onClick={openNewMessage} className="qa-action qa-action-strong inline-flex min-h-11 items-center gap-2 rounded-full bg-[#d8f7fb] px-5 text-sm font-bold text-[#071015] shadow-[0_12px_30px_rgba(103,232,249,0.16)] transition hover:bg-white">
              <Plus className="h-4 w-4" aria-hidden="true" /> New message
            </button>
          </div>
        </header>

        {recentlyHiddenThread ? (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-cyan-200/18 bg-cyan-200/[0.06] px-4 py-2.5 text-sm text-white/72">
            <span>Conversation with {recentlyHiddenThread.displayName} hidden.</span>
            <button type="button" onClick={undoHideThread} className="qa-action min-h-9 rounded-full px-3 font-semibold text-cyan-100 hover:bg-cyan-100/10">Undo</button>
          </div>
        ) : null}

        {warning ? (
          <p role="status" className="mb-3 rounded-2xl border border-amber-200/16 bg-amber-200/[0.06] px-4 py-3 text-sm text-amber-100/78">
            {warning}
          </p>
        ) : null}

        <section className="grid min-h-[68vh] overflow-hidden rounded-[28px] border border-white/12 bg-[#080b10] shadow-[0_34px_100px_rgba(0,0,0,0.5)] lg:h-[calc(100dvh-12.5rem)] lg:min-h-[620px] lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className={`${mobileThreadOpen ? "hidden lg:flex" : "flex"} min-h-[68vh] flex-col bg-[#0d131b] lg:min-h-0 lg:border-r lg:border-white/10`}>
            <div className="border-b border-white/10 p-4 pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">Conversations</p>
                  <p className="mt-1 text-xs text-white/46">{metrics.total} total · {metrics.active} active</p>
                </div>
                <button type="button" onClick={openNewMessage} aria-label="Start a new message" className="qa-action inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-100/18 bg-cyan-100/[0.08] text-cyan-100 transition hover:bg-cyan-100/14">
                  <MessageCircleMore className="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
              </div>
              <label className="relative mt-3 block">
                <span className="sr-only">Search conversations</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/34" aria-hidden="true" />
                <input value={conversationSearch} onChange={(event) => setConversationSearch(event.target.value)} placeholder="Search conversations" className="min-h-11 w-full rounded-xl border border-white/10 bg-black/25 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/34 focus:border-cyan-200/32 focus:ring-2 focus:ring-cyan-200/10" />
              </label>
              <div className="mt-3 flex items-center gap-1 rounded-xl bg-black/20 p-1">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                className={`qa-action min-h-9 flex-1 rounded-lg px-2 text-[11px] font-semibold transition ${
                  filter === "all"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/48 hover:text-white/78"
                }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("unread")}
                className={`qa-action min-h-9 flex-1 rounded-lg px-2 text-[11px] font-semibold transition ${
                  filter === "unread"
                    ? "bg-fuchsia-200/12 text-fuchsia-100 shadow-sm"
                    : "text-white/48 hover:text-white/78"
                }`}
                >
                  Unread
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("active")}
                className={`qa-action min-h-9 flex-1 rounded-lg px-2 text-[11px] font-semibold transition ${
                  filter === "active"
                    ? "bg-emerald-200/10 text-emerald-100 shadow-sm"
                    : "text-white/48 hover:text-white/78"
                }`}
                >
                  Active
                </button>
              </div>
            </div>

            {(vipInviteCounts.all > 0 || isLoadingVipInvites) ? (
              <button type="button" onClick={() => setVipPanelCollapsed(false)} className="qa-action mx-3 mt-3 flex min-h-12 items-center gap-3 rounded-xl border border-fuchsia-200/12 bg-fuchsia-200/[0.055] px-3 text-left transition hover:border-fuchsia-200/25 hover:bg-fuchsia-200/[0.08]">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fuchsia-200/10 text-fuchsia-100"><UsersRound className="h-4 w-4" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-white/88">Requests</span>
                  <span className="block truncate text-[11px] text-white/45">VIP invitations and host replies</span>
                </span>
                {pendingHostActions > 0 ? <span className="rounded-full bg-fuchsia-300 px-2 py-0.5 text-[10px] font-bold text-black">{pendingHostActions}</span> : null}
                <ChevronRight className="h-4 w-4 text-white/34" aria-hidden="true" />
              </button>
            ) : null}

            {isLoadingThreads ? (
              <div className="space-y-2 p-3">
                {[0, 1, 2].map((item) => (
                  <div key={`inbox-skeleton-${item}`} className="qa-skeleton-card h-24 rounded-2xl border border-white/10 bg-white/5" />
                ))}
              </div>
            ) : filteredThreads.length > 0 ? (
              <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3 pt-2">
                {filteredThreads.map((thread) => {
                  const selected = String(thread.id) === String(activeThreadId);
                  const active = isActiveNow(thread.presence);
                  return (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => handleSelectThread(thread.id)}
                      className={`qa-list-card group w-full rounded-xl border px-3 py-3 text-left transition ${
                        selected
                          ? "border-cyan-100/20 bg-cyan-100/[0.09] shadow-[inset_3px_0_0_rgba(165,243,252,0.72)]"
                          : "border-transparent hover:border-white/8 hover:bg-white/[0.045]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <MessageAvatar name={thread.displayName} src={thread.avatarUrl} active={active} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`min-w-0 flex-1 truncate text-sm ${thread.unreadCount > 0 ? "font-bold text-white" : "font-semibold text-white/88"}`}>{thread.displayName}</p>
                            <time className="shrink-0 text-[10px] text-white/38">{formatTime(thread.lastMessage?.createdAt || thread.lastMessageAt)}</time>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <p className={`min-w-0 flex-1 truncate text-xs ${thread.unreadCount > 0 ? "font-medium text-white/76" : "text-white/45"}`}>{thread.preview}</p>
                            {thread.unreadCount > 0 ? <span className="min-w-5 rounded-full bg-fuchsia-300 px-1.5 py-0.5 text-center text-[10px] font-bold text-[#160914]">{thread.unreadCount}</span> : null}
                          </div>
                          {thread.trustedContributor ? <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-cyan-100/54">Trusted contributor</p> : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                tone="violet"
                title={threads.length === 0 ? "Your inbox is ready" : "No conversations match"}
                description={threads.length === 0 ? "Start with a friend or find another Queer Atlas member." : "Try another search or show every conversation."}
                primaryActionLabel={threads.length === 0 ? "Start a message" : "Show all"}
                onPrimaryAction={threads.length === 0 ? openNewMessage : () => { setConversationSearch(""); setFilter("all"); }}
              />
            )}
          </div>

          <div className={`${mobileThreadOpen ? "flex" : "hidden lg:flex"} min-h-[68vh] min-w-0 flex-col bg-[radial-gradient(circle_at_88%_0%,rgba(192,132,252,0.055),transparent_34%),#080b10] lg:min-h-0`}>
            {activeThread ? (
              <>
                <div className="relative border-b border-white/10 bg-white/[0.018] px-3 py-3 sm:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <button type="button" onClick={() => setMobileThreadOpen(false)} aria-label="Back to conversations" className="qa-action inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/68 hover:bg-white/8 lg:hidden">
                        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <MessageAvatar name={activeThread.displayName} src={activeThread.avatarUrl} active={isActiveNow(activeThread.presence)} size="lg" statusBorderClassName="border-[#080b10]" />
                      <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 ref={threadHeadingRef} tabIndex={-1} className="truncate text-base font-semibold text-[#f7f3ee] outline-none sm:text-lg">{activeThread.displayName}</h2>
                        {activeThread.trustedContributor && (
                          <span className="rounded-full border border-cyan-200/18 bg-cyan-200/[0.07] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-cyan-100/74">
                            Trusted
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-white/58">
                        {isActiveNow(activeThread.presence)
                          ? "Active now"
                          : `Last active ${timeAgo(activeThread.presence?.lastSeenAt)}`}
                      </p>
                    </div>
                    </div>
                    <div className="relative flex items-center gap-2">
                      <button type="button" onClick={() => setThreadMenuOpen((current) => !current)} aria-label={`Conversation options for ${activeThread.displayName}`} aria-expanded={threadMenuOpen} className="qa-action inline-flex h-11 w-11 items-center justify-center rounded-full text-white/60 transition hover:bg-white/8 hover:text-white">
                        <Ellipsis className="h-5 w-5" aria-hidden="true" />
                      </button>
                      {threadMenuOpen ? (
                        <div className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-2xl border border-white/12 bg-[#151921] p-1.5 text-sm shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                          <button type="button" onClick={() => setReportTarget({ type: "member", id: activeThread.otherUserId, title: activeThread.displayName })} className="qa-action flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-white/72 hover:bg-white/7 hover:text-white"><ShieldAlert className="h-4 w-4" aria-hidden="true" /> Report member</button>
                          <button type="button" onClick={toggleBlockActiveMember} disabled={isUpdatingBlock} className="qa-action flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-rose-100/78 hover:bg-rose-100/[0.07] hover:text-rose-100"><X className="h-4 w-4" aria-hidden="true" /> {activeThreadBlocked ? "Unblock member" : "Block member"}</button>
                          <button type="button" onClick={() => { setThreadMenuOpen(false); removeThreadFromInbox(activeThread.id); }} className="qa-action flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-white/58 hover:bg-white/7 hover:text-white"><Inbox className="h-4 w-4" aria-hidden="true" /> Hide conversation</button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div role="log" aria-label={`Conversation with ${activeThread.displayName}`} aria-live="polite" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5 sm:px-6">
                  {isLoadingMessages ? (
                    <div className="mx-auto mt-10 max-w-sm space-y-3" aria-label="Loading conversation">
                      <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-white/5" />
                      <div className="ml-auto h-16 w-3/4 animate-pulse rounded-2xl bg-cyan-100/[0.06]" />
                      <div className="h-10 w-1/2 animate-pulse rounded-2xl bg-white/5" />
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="mx-auto max-w-3xl">
                      {hasOlderMessages ? (
                        <div className="mb-5 flex justify-center">
                          <button type="button" onClick={loadOlderMessages} disabled={isLoadingOlderMessages} className="qa-action min-h-10 rounded-full border border-white/10 bg-white/[0.035] px-4 text-xs font-semibold text-white/58 hover:border-white/20 hover:text-white disabled:opacity-50">{isLoadingOlderMessages ? "Loading…" : "Load older messages"}</button>
                        </div>
                      ) : null}
                      {messages.map((message, index) => {
                        const mine = String(message.senderId) === String(userId);
                        const previous = messages[index - 1];
                        const next = messages[index + 1];
                        const startsDay = !previous || dateKey(previous.createdAt) !== dateKey(message.createdAt);
                        const previousMine = previous ? String(previous.senderId) === String(userId) : null;
                        const nextMine = next ? String(next.senderId) === String(userId) : null;
                        const beginsGroup = startsDay || previousMine !== mine;
                        const endsGroup = !next || dateKey(next.createdAt) !== dateKey(message.createdAt) || nextMine !== mine;
                        const isLastOwn = mine && String(message.id) === String(lastOwnMessageId);
                        return (
                          <MessageBubble
                            key={message.id}
                            message={message}
                            mine={mine}
                            startsDay={startsDay}
                            dayLabel={formatMessageDay(message.createdAt)}
                            beginsGroup={beginsGroup}
                            endsGroup={endsGroup}
                            isLastOwn={isLastOwn}
                            timeLabel={formatTime(message.createdAt)}
                            senderName={activeThread.displayName}
                            onReport={() => setReportTarget({ type: "message", id: message.id, title: `Message from ${activeThread.displayName}` })}
                          />
                        );
                      })}
                      <div ref={messageEndRef} />
                    </div>
                  ) : (
                    <div className="mx-auto mt-16 max-w-sm text-center">
                      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-cyan-100/12 bg-cyan-100/[0.055] text-cyan-100/70"><MessageCircleMore className="h-6 w-6" aria-hidden="true" /></div>
                      <h3 className="mt-4 text-lg font-semibold text-[#f7f3ee]">Start something kind</h3>
                      <p className="mt-2 text-sm leading-6 text-white/45">This is the beginning of your conversation with {activeThread.displayName}.</p>
                    </div>
                  )}
                </div>

                <form
                  className="border-t border-white/10 bg-[#0b0e13]/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSend();
                  }}
                >
                  {activeThreadBlocked ? (
                    <div className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-rose-200/14 bg-rose-200/[0.055] px-4">
                      <p className="text-sm text-rose-100/72">You blocked {activeThread.displayName}. They cannot message you.</p>
                      <button type="button" onClick={toggleBlockActiveMember} disabled={isUpdatingBlock} className="qa-action min-h-10 shrink-0 rounded-full px-3 text-xs font-semibold text-rose-100 hover:bg-rose-100/10">Unblock</button>
                    </div>
                  ) : (
                  <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-[22px] border border-white/12 bg-white/[0.045] p-2 pl-4 focus-within:border-cyan-100/24 focus-within:ring-2 focus-within:ring-cyan-100/[0.06]">
                    <label htmlFor="message-reply" className="sr-only">Message {activeThread.displayName}</label>
                    <textarea
                      id="message-reply"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          handleSend();
                        }
                      }}
                      maxLength={2000}
                      rows={1}
                      placeholder={activeOtherUserId ? `Message ${activeThread.displayName}` : "Write a message"}
                      className="max-h-32 min-h-10 w-full resize-y bg-transparent py-2 text-sm leading-6 text-white outline-none placeholder:text-white/32"
                    />
                    <button
                      type="submit"
                      disabled={sending || !draft.trim()}
                      aria-label="Send message"
                      className="qa-action qa-action-strong inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d8f7fb] text-[#071015] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Send className="h-[18px] w-[18px]" aria-hidden="true" />
                    </button>
                  </div>
                  )}
                </form>
              </>
            ) : (
              <EmptyState
                tone="amber"
                title="Select a thread"
                description="Choose a conversation or start a new private message."
                primaryActionLabel="New message"
                onPrimaryAction={openNewMessage}
              />
            )}
          </div>
        </section>
      </div>

      {composeOpen ? (
        <div className="fixed inset-0 z-[80] flex justify-end bg-black/68 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCompose(); }}>
          <section ref={composePanelRef} role="dialog" aria-modal="true" aria-labelledby="new-message-title" className="flex h-full w-full max-w-[520px] flex-col border-l border-white/12 bg-[#0d1118] shadow-[-30px_0_90px_rgba(0,0,0,0.55)]">
            <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100/54">Private connection</p>
                <h2 id="new-message-title" className="mt-1 text-xl font-semibold text-[#f7f3ee]">{startCompose && startUserId ? `Message ${startUserName || "member"}` : "New message"}</h2>
              </div>
              <button type="button" onClick={closeCompose} aria-label="Close new message" className="qa-action inline-flex h-11 w-11 items-center justify-center rounded-full text-white/56 hover:bg-white/8 hover:text-white"><X className="h-5 w-5" aria-hidden="true" /></button>
            </header>

            {startCompose && startUserId ? (
              <div className="flex flex-1 flex-col p-5">
                <div className="rounded-2xl border border-cyan-100/12 bg-cyan-100/[0.045] p-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-cyan-100/10 text-cyan-100"><UserRound className="h-5 w-5" aria-hidden="true" /></span>
                    <div><p className="font-semibold text-white">{startUserName || "Member"}</p><p className="mt-0.5 text-xs text-white/42">Your first message starts a private thread.</p></div>
                  </div>
                </div>
                <label htmlFor="direct-compose" className="mt-6 text-xs font-semibold text-white/64">Your message</label>
                <textarea ref={composerInputRef} id="direct-compose" value={directComposeBody} onChange={(event) => setDirectComposeBody(event.target.value)} maxLength={2000} placeholder="Write a friendly introduction…" className="mt-2 min-h-40 resize-y rounded-2xl border border-white/12 bg-black/25 p-4 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:border-cyan-100/28 focus:ring-2 focus:ring-cyan-100/[0.06]" />
                <div className="mt-3 flex items-center justify-between gap-3"><p className="text-[11px] text-white/34">{directComposeBody.length}/2000</p><button type="button" onClick={sendDirectComposeMessage} disabled={isDirectComposeSending || !directComposeBody.trim()} className="qa-action qa-action-strong inline-flex min-h-11 items-center gap-2 rounded-full bg-[#d8f7fb] px-5 text-sm font-bold text-[#071015] hover:bg-white disabled:opacity-40"><Send className="h-4 w-4" aria-hidden="true" />{isDirectComposeSending ? "Sending…" : "Send message"}</button></div>
              </div>
            ) : (
              <>
                <div className="border-b border-white/10 p-4 sm:p-5">
                  <div className="grid grid-cols-2 rounded-xl bg-black/25 p-1">
                    <button type="button" onClick={() => setComposerTab("friends")} className={`qa-action min-h-10 rounded-lg text-xs font-semibold ${composerTab === "friends" ? "bg-white/10 text-white" : "text-white/46 hover:text-white"}`}>Friends</button>
                    <button type="button" onClick={() => setComposerTab("members")} className={`qa-action min-h-10 rounded-lg text-xs font-semibold ${composerTab === "members" ? "bg-white/10 text-white" : "text-white/46 hover:text-white"}`}>Members</button>
                  </div>
                  <label className="relative mt-3 block"><span className="sr-only">Search {composerTab}</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/34" aria-hidden="true" /><input ref={composerInputRef} value={composerSearch} onChange={(event) => setComposerSearch(event.target.value)} placeholder={composerTab === "friends" ? "Search your friends" : "Search name, city or country"} className="min-h-12 w-full rounded-xl border border-white/11 bg-black/25 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/32 focus:border-cyan-100/28" /></label>
                  {composerWarning ? <p className="mt-2 text-xs text-amber-100/70">{composerWarning}</p> : null}
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
                  {composerLoading ? (
                    <div className="space-y-2">{[0, 1, 2, 3].map((item) => <div key={item} className="h-[68px] animate-pulse rounded-2xl bg-white/[0.045]" />)}</div>
                  ) : (composerTab === "friends" ? friendCandidates : memberCandidates).length > 0 ? (
                    <div className="space-y-1">
                      {(composerTab === "friends" ? friendCandidates : memberCandidates).map((candidate) => {
                        const busy = Boolean(composerBusyByUserId[candidate.userId]);
                        const existingThread = threadByOtherUserId.get(candidate.userId);
                        return (
                          <button key={candidate.userId} type="button" onClick={() => openThreadFromCandidate(candidate.userId)} disabled={busy} className="qa-action group flex min-h-[68px] w-full items-center gap-3 rounded-2xl border border-transparent px-3 text-left transition hover:border-white/9 hover:bg-white/[0.045] disabled:opacity-50">
                            <MessageAvatar name={candidate.displayName} src={candidate.avatarUrl} active={Boolean(candidate.activeNow || candidate.isOnline)} ringClassName="border-white/12" statusBorderClassName="border-[#0d1118]" />
                            <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-sm font-semibold text-white/88">{candidate.displayName}</span>{candidate.trustedContributor ? <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-cyan-100/56">Trusted</span> : null}</span><span className="mt-1 block truncate text-xs text-white/42">{composerTab === "friends" ? (candidate.activeNow ? "Active now" : timeAgo(candidate.lastSeenAt)) : ([candidate.homeCity, candidate.residentCountry].filter(Boolean).join(" · ") || "Member")}</span></span>
                            <span className="text-xs font-semibold text-cyan-100/65">{busy ? "Opening…" : existingThread ? "Open" : "Message"}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-14 text-center"><UsersRound className="mx-auto h-7 w-7 text-white/24" aria-hidden="true" /><p className="mt-3 text-sm font-semibold text-white/68">No matches yet</p><p className="mt-1 text-xs leading-5 text-white/38">Try another name{composerTab === "members" ? ", city or country" : ""}.</p></div>
                  )}
                  {composerTab === "members" && memberCandidatesHasMore ? <div className="mt-3 flex justify-center"><button type="button" onClick={loadMoreMemberCandidates} disabled={composerLoading} className="qa-action min-h-10 rounded-full border border-white/10 px-4 text-xs font-semibold text-white/58 hover:text-white">Load more</button></div> : null}
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}

      {!vipPanelCollapsed ? (
        <div className="fixed inset-0 z-[80] flex justify-end bg-black/68 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setVipPanelCollapsed(true); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="requests-title" className="flex h-full w-full max-w-[560px] flex-col border-l border-white/12 bg-[#111019] shadow-[-30px_0_90px_rgba(0,0,0,0.55)]">
            <header className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-fuchsia-100/52">Private events</p><h2 id="requests-title" className="mt-1 text-xl font-semibold text-[#f7f3ee]">Requests</h2><p className="mt-1 text-xs text-white/40">{vipHostResponseSla}</p></div><button type="button" onClick={() => setVipPanelCollapsed(true)} aria-label="Close requests" className="qa-action inline-flex h-11 w-11 items-center justify-center rounded-full text-white/56 hover:bg-white/8 hover:text-white"><X className="h-5 w-5" aria-hidden="true" /></button></header>
            <div className="flex flex-wrap gap-1.5 border-b border-white/10 px-4 py-3">{[{ key: "all", label: "All", count: vipInviteCounts.all }, { key: "requested", label: "Pending", count: vipInviteCounts.requested }, { key: "accepted", label: "Accepted", count: vipInviteCounts.accepted }, { key: "host", label: "Hosting", count: vipInviteCounts.host }, { key: "mine", label: "Mine", count: vipInviteCounts.mine }].map((option) => <button key={option.key} type="button" onClick={() => setVipFilter(option.key)} className={`qa-action min-h-9 rounded-full px-3 text-[11px] font-semibold ${vipFilter === option.key ? "bg-fuchsia-100/12 text-fuchsia-100" : "text-white/44 hover:bg-white/5 hover:text-white"}`}>{option.label} · {option.count}</button>)}</div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {vipInvitesWarning ? <p className="mb-3 rounded-xl border border-amber-100/14 bg-amber-100/[0.06] p-3 text-xs text-amber-100/72">{vipInvitesWarning}</p> : null}
              {isLoadingVipInvites ? <div className="space-y-2">{[0, 1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-white/[0.045]" />)}</div> : filteredVipInvites.length > 0 ? <div className="space-y-2">{filteredVipInvites.map((item) => <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.028] p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-semibold text-white/88">{item.kind === "host_request" ? `${item.requesterAlias} requested access` : item.title}</h3><p className="mt-1 text-xs leading-5 text-white/48">{item.kind === "host_request" ? item.title : `Hosted by ${item.hostAlias}`}{item.city ? ` · ${item.city.replace(/_/g, " ")}` : ""}</p></div><span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/56">{inviteStatusLabel(item.status)}</span></div>{item.message ? <p className="mt-3 text-sm leading-6 text-white/62">{item.message}</p> : null}<div className="mt-3 flex flex-wrap items-center gap-2"><span className="mr-auto text-[10px] text-white/30">{formatInviteTimeline({ requestedAt: item.createdAt, decidedAt: item.decidedAt, status: item.status })}</span>{item.kind === "host_request" && item.requesterUserId ? <button type="button" onClick={() => { setVipPanelCollapsed(true); openComposeWithUser(item.requesterUserId, item.requesterAlias); }} className="qa-action min-h-9 rounded-full bg-cyan-100/10 px-3 text-xs font-semibold text-cyan-100">Reply</button> : null}{item.kind === "my_request" && String(item.status).toLowerCase() === "accepted" && item.hostUserId ? <button type="button" onClick={() => { setVipPanelCollapsed(true); openComposeWithUser(item.hostUserId, item.hostAlias); }} className="qa-action min-h-9 rounded-full bg-cyan-100/10 px-3 text-xs font-semibold text-cyan-100">Contact host</button> : null}<button type="button" onClick={() => router.push(cityHref(item.city))} className="qa-action inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-white/52 hover:bg-white/6 hover:text-white"><MapPin className="h-3.5 w-3.5" aria-hidden="true" /> City</button></div></article>)}</div> : <div className="py-16 text-center"><UsersRound className="mx-auto h-7 w-7 text-white/22" aria-hidden="true" /><p className="mt-3 text-sm font-semibold text-white/64">No requests here</p><p className="mt-1 text-xs text-white/36">New invite activity will appear in this space.</p></div>}
            </div>
          </section>
        </div>
      ) : null}

      {reportTarget ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/74 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReportTarget(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="report-title" className="w-full max-w-md rounded-[26px] border border-white/12 bg-[#151820] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.7)]">
            <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-100/54">Community safety</p><h2 id="report-title" className="mt-1 text-xl font-semibold text-[#f7f3ee]">Report {reportTarget.type === "message" ? "message" : "member"}</h2></div><button type="button" onClick={() => setReportTarget(null)} aria-label="Close report" className="qa-action inline-flex h-10 w-10 items-center justify-center rounded-full text-white/48 hover:bg-white/7 hover:text-white"><X className="h-5 w-5" aria-hidden="true" /></button></div>
            <label htmlFor="report-reason" className="mt-5 block text-xs font-semibold text-white/64">Reason</label><select id="report-reason" value={reportReason} onChange={(event) => setReportReason(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-white/12 bg-black/28 px-3 text-sm text-white outline-none focus:border-rose-100/28"><option>Harassment or hateful conduct</option><option>Sexual content without consent</option><option>Spam or scam</option><option>Threats or safety concern</option><option>Other</option></select>
            <label htmlFor="report-details" className="mt-4 block text-xs font-semibold text-white/64">Details <span className="font-normal text-white/34">(optional)</span></label><textarea id="report-details" value={reportDetails} onChange={(event) => setReportDetails(event.target.value.slice(0, 1000))} placeholder="Tell the moderation team what happened…" className="mt-2 min-h-28 w-full resize-y rounded-xl border border-white/12 bg-black/28 p-3 text-sm leading-6 text-white outline-none placeholder:text-white/28 focus:border-rose-100/28" />
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setReportTarget(null)} className="qa-action min-h-11 rounded-full px-4 text-sm font-semibold text-white/52 hover:bg-white/6 hover:text-white">Cancel</button><button type="button" onClick={submitReport} className="qa-action min-h-11 rounded-full bg-rose-100 px-5 text-sm font-bold text-[#1a090d] hover:bg-white">Send report</button></div>
          </section>
        </div>
      ) : null}

      <ActionToast toast={toast} />
    </main>
  );
}

