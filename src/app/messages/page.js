"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useActionToast } from "@/lib/useActionToast";
import { showActionFeedback } from "@/lib/actionFeedback";
import { readLocalJson, writeLocalJson, writeLocalValue } from "@/lib/storage";
import { cityHref, formatInviteTimeline, inviteStatusLabel } from "@/lib/vipInvites";
import ActionToast from "@/components/ui/ActionToast";
import EmptyState from "@/components/ui/EmptyState";
import PageOpeningState from "@/components/ui/PageOpeningState";

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

function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const vipPanelRef = useRef(null);
  const composePanelRef = useRef(null);
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
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [vipInviteRows, setVipInviteRows] = useState([]);
  const [isLoadingVipInvites, setIsLoadingVipInvites] = useState(false);
  const [vipInvitesWarning, setVipInvitesWarning] = useState("");
  const [vipFilter, setVipFilter] = useState("all");
  const [vipPanelCollapsed, setVipPanelCollapsed] = useState(true);
  const [vipRealtimeHealthy, setVipRealtimeHealthy] = useState(false);
  const [vipInvitesLoadedOnce, setVipInvitesLoadedOnce] = useState(false);
  const [composerTab, setComposerTab] = useState("friends");
  const [composerSearch, setComposerSearch] = useState("");
  const [composerWarning, setComposerWarning] = useState("");
  const [composerLoading, setComposerLoading] = useState(false);
  const [friendCandidates, setFriendCandidates] = useState([]);
  const [memberCandidates, setMemberCandidates] = useState([]);
  const [memberCandidateOffset, setMemberCandidateOffset] = useState(0);
  const [memberCandidatesHasMore, setMemberCandidatesHasMore] = useState(false);
  const [composerBusyByUserId, setComposerBusyByUserId] = useState({});
  const [hiddenThreadIds, setHiddenThreadIds] = useState([]);
  const [threadResetAtById, setThreadResetAtById] = useState({});

  const activeThread = useMemo(
    () => threads.find((thread) => String(thread.id) === String(activeThreadId)) || null,
    [threads, activeThreadId]
  );

  const activeOtherUserId = activeThread?.otherUserId || "";
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
    if (filter === "unread") {
      return threads.filter((thread) => Number(thread.unreadCount || 0) > 0);
    }
    if (filter === "active") {
      return threads.filter((thread) => isActiveNow(thread.presence));
    }
    return threads;
  }, [filter, threads]);

  useEffect(() => {
    if (!userId) {
      setHiddenThreadIds([]);
      return;
    }
    const stored = readLocalJson(hiddenThreadStorageKey, []);
    if (!Array.isArray(stored)) {
      setHiddenThreadIds([]);
      return;
    }
    const normalized = [...new Set(stored.map((value) => String(value || "").trim()).filter(Boolean))];
    setHiddenThreadIds(normalized);
  }, [hiddenThreadStorageKey, userId]);

  useEffect(() => {
    if (!userId) return;
    writeLocalJson(hiddenThreadStorageKey, hiddenThreadIds);
  }, [hiddenThreadIds, hiddenThreadStorageKey, userId]);

  useEffect(() => {
    if (!userId) {
      setThreadResetAtById({});
      return;
    }
    const stored = readLocalJson(threadResetStorageKey, {});
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
      setThreadResetAtById({});
      return;
    }
    const normalized = {};
    Object.entries(stored).forEach(([key, value]) => {
      const threadId = String(key || "").trim();
      const resetAt = Number(value || 0);
      if (!threadId || !Number.isFinite(resetAt) || resetAt <= 0) return;
      normalized[threadId] = resetAt;
    });
    setThreadResetAtById(normalized);
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

    if (nextUserId) setStartUserId(nextUserId);
    if (nextUserName) setStartUserName(nextUserName);
    setStartCompose(nextCompose);
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
        ? supabase.from("member_profiles").select("user_id, display_name").in("user_id", otherUserIds)
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
          lastMessage,
          unreadCount,
          presence,
          preview: String(lastMessage?.body || "No messages in this thread yet.").trim(),
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

    const query = String(searchTerm || "").trim().toLowerCase();
    const rows = (data || []).map((row) => ({
      userId: String(row.user_id || ""),
      displayName: String(row.display_name || "").trim() || "Member",
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
    const hasMore = normalized.length > MEMBER_PICKER_PAGE_SIZE;
    const visible = hasMore ? normalized.slice(0, MEMBER_PICKER_PAGE_SIZE) : normalized;

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
        return;
      }

      setIsLoadingMessages(true);
      const { data, error } = await supabase
        .from("qa_dm_messages")
        .select("id, thread_id, sender_id, body, created_at, read_at")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true })
        .limit(500);

      if (error) {
        if (isMissingTableError(error)) {
          setWarning("Messaging tables are not enabled yet. Run supabase/direct-messaging-v1.sql first.");
        } else {
          showToast("Could not load this thread right now.", { tone: "warn" });
        }
        setMessages([]);
        setIsLoadingMessages(false);
        return;
      }

      const resetAt = getThreadResetAt(threadId);
      const filteredRows = (data || []).filter((row) => {
        if (!resetAt) return true;
        const createdAtMs = new Date(row.created_at || 0).getTime();
        return !Number.isFinite(createdAtMs) || createdAtMs > resetAt;
      });
      setMessages(filteredRows.map(normalizeMessageRow));
      await markThreadRead(threadId);
      setIsLoadingMessages(false);
    },
    [getThreadResetAt, markThreadRead, showToast]
  );

  const handleSelectThread = useCallback((threadId) => {
    setActiveThreadId(threadId);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileThreadOpen(true);
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
      showToast("Conversation removed. New chat with this member will start from zero.", { tone: "ok", duration: 2600 });
    }
  }, [showToast]);

  const handleSend = useCallback(async () => {
    const body = draft.trim();
    if (!body || !activeThreadId || !userId || sending) return;

    setSending(true);
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
        showToast(error.message || "Could not send message right now.", { tone: "warn" });
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
            preview: String(sentMessage.body || "").trim() || thread.preview,
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
      setDirectComposeBody("");
      setStartUserId("");
      setStartUserName("");
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setMobileThreadOpen(true);
      }
      router.replace("/messages");
      showActionFeedback(showToast, "messageSent");
    } catch (error) {
      showToast(error?.message || "Could not send host message right now.", { tone: "warn" });
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
    setDirectComposeBody("");
    queueMicrotask(() => {
      composePanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
    if (!isReady || !isMember || !userId) return;
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
    isMember,
    isReady,
    loadFriendCandidates,
    loadMemberCandidates,
    userId,
  ]);

  useEffect(() => {
    if (!isReady) return;
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
    if (!isReady || !isMember || !startUserId || !userId || startCompose) return;
    queueMicrotask(() => {
      openOrCreateThreadForUser(startUserId);
    });
  }, [isReady, isMember, openOrCreateThreadForUser, startCompose, startUserId, userId]);

  useEffect(() => {
    if (!vipInvitesLoadedOnce) return;
    if (pendingHostActions > 0 && vipFilter === "all") {
      setVipFilter("host");
    }
    if (pendingHostActions > 0) {
      setVipPanelCollapsed(false);
    }
  }, [pendingHostActions, vipFilter, vipInvitesLoadedOnce]);

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
              preview: String(messageRow.body || "").trim() || thread.preview,
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
      <main className="qa-page min-h-screen bg-[#050505] text-white">
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
    <main className="qa-page min-h-screen bg-[#050505] text-white">
      <div className="qa-shell">
        <section className="qa-panel mb-6 rounded-[34px] border border-cyan-300/18 bg-[radial-gradient(circle_at_12%_8%,rgba(34,211,238,0.24),transparent_34%),radial-gradient(circle_at_88%_20%,rgba(244,114,182,0.2),transparent_34%),linear-gradient(150deg,rgba(10,38,52,0.98),rgba(10,10,10,1))] p-6 shadow-[0_44px_140px_rgba(0,0,0,0.56)] backdrop-blur-sm">
          <p className="qa-eyebrow text-cyan-100/75">Signal Inbox</p>
          <h1 className="qa-display qa-h1 mt-3 text-4xl font-bold text-white sm:text-5xl">Inbox</h1>
          <p className="qa-lead mt-4 max-w-3xl text-sm text-white/76">
            Email-style private inbox. Browse conversations on the left, read thread history on the right, and reply from one clean reading panel.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/14 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white/72">
              Pending host actions: {pendingHostActions}
            </span>
            <button
              type="button"
              onClick={() => {
                setVipFilter("host");
                setVipPanelCollapsed(false);
                queueMicrotask(() => {
                  vipPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                });
              }}
              className={`qa-action rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em] transition ${
                pendingHostActions > 0
                  ? "qa-attn-soft border-amber-200/42 bg-amber-200/20 text-amber-100 hover:border-amber-200/62"
                  : "border-white/14 bg-white/8 text-white/72 hover:border-white/28"
              }`}
            >
              Review requests
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="qa-card rounded-2xl border border-fuchsia-300/24 bg-fuchsia-300/[0.08] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-fuchsia-100/75">Unread</p>
              <p className="mt-2 text-3xl font-semibold text-white">{metrics.unread}</p>
            </div>
            <div className="qa-card rounded-2xl border border-cyan-300/24 bg-cyan-300/[0.08] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/75">Active friends</p>
              <p className="mt-2 text-3xl font-semibold text-white">{metrics.active}</p>
            </div>
            <div className="qa-card rounded-2xl border border-emerald-300/24 bg-emerald-300/[0.08] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-100/75">Threads</p>
              <p className="mt-2 text-3xl font-semibold text-white">{metrics.total}</p>
            </div>
          </div>

          {warning ? (
            <p className="mt-4 rounded-xl border border-amber-200/24 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
              {warning}
            </p>
          ) : null}
        </section>

        <section
          ref={vipPanelRef}
          className="qa-panel mb-6 rounded-[28px] border border-fuchsia-300/20 bg-[radial-gradient(circle_at_82%_4%,rgba(251,113,133,0.14),transparent_30%),linear-gradient(155deg,rgba(48,15,56,0.7),rgba(10,10,10,0.98))] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.4)] backdrop-blur-sm sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-fuchsia-100/72">VIP Invites</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Invite requests and decisions</h2>
              <p className="mt-1 text-[11px] text-white/58">{vipHostResponseSla}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVipPanelCollapsed((current) => !current)}
                className="qa-action rounded-full border border-white/16 bg-white/8 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-white/82 transition hover:border-white/30"
              >
                {vipPanelCollapsed ? "Expand" : "Collapse"}
              </button>
              <button
                type="button"
                onClick={() => loadVipInvites()}
                className="qa-action rounded-full border border-fuchsia-200/28 bg-fuchsia-200/12 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-fuchsia-100 transition hover:border-fuchsia-200/45"
              >
                Refresh
              </button>
            </div>
          </div>

          {!vipPanelCollapsed ? (
            <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {[
              { key: "all", label: "All", count: vipInviteCounts.all, tone: "border-white/24 bg-white/10 text-white" },
              { key: "requested", label: "Requested", count: vipInviteCounts.requested, tone: "border-amber-200/28 bg-amber-200/12 text-amber-100" },
              { key: "accepted", label: "Accepted", count: vipInviteCounts.accepted, tone: "border-emerald-200/28 bg-emerald-200/12 text-emerald-100" },
              { key: "host", label: "Host", count: vipInviteCounts.host, tone: "border-cyan-200/28 bg-cyan-200/12 text-cyan-100" },
              { key: "mine", label: "Mine", count: vipInviteCounts.mine, tone: "border-fuchsia-200/28 bg-fuchsia-200/12 text-fuchsia-100" },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setVipFilter(option.key)}
                className={`qa-action rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] transition ${
                  vipFilter === option.key
                    ? option.tone
                    : "border-white/12 bg-white/6 text-white/68 hover:border-white/24"
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>

          {vipInvitesWarning ? (
            <p className="mt-3 rounded-xl border border-amber-200/24 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
              {vipInvitesWarning}
            </p>
          ) : null}

          {isLoadingVipInvites ? (
            <div className="mt-3 space-y-2">
              {[0, 1].map((item) => (
                <div key={`vip-invite-skeleton-${item}`} className="h-20 rounded-2xl border border-white/10 bg-white/5" />
              ))}
            </div>
          ) : filteredVipInvites.length > 0 ? (
            <div className="mt-3 grid gap-2">
              {filteredVipInvites.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/12 bg-black/25 px-3 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">
                      {item.kind === "host_request" ? `${item.requesterAlias} requested access` : `Your request - ${item.hostAlias}`}
                    </p>
                    <span className="rounded-full border border-white/16 bg-white/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/80">
                      {inviteStatusLabel(item.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/68">
                    {item.title} - {item.city ? item.city.replace(/_/g, " ") : "City TBA"}{item.eventType ? ` - ${item.eventType.replace(/_/g, " ")}` : ""}
                  </p>
                  {item.message ? (
                    <p className="mt-1 line-clamp-1 text-xs text-white/58">{item.message}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] text-white/52">{timeAgo(item.decidedAt || item.createdAt)}</p>
                      <p className="text-[10px] text-white/42">{formatInviteTimeline({
                        requestedAt: item.createdAt,
                        decidedAt: item.decidedAt,
                        status: item.status,
                      })}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.kind === "host_request" &&
                      String(item.status || "").toLowerCase() === "requested" &&
                      item.requesterUserId ? (
                        <button
                          type="button"
                          onClick={() => openComposeWithUser(item.requesterUserId, item.requesterAlias)}
                          className="qa-action rounded-full border border-amber-200/30 bg-amber-200/14 px-2.5 py-1 text-[11px] text-amber-100 transition hover:border-amber-200/54"
                        >
                          Reply now
                        </button>
                      ) : null}
                      {item.kind === "my_request" &&
                      String(item.status || "").toLowerCase() === "accepted" &&
                      item.hostUserId ? (
                        <button
                          type="button"
                          onClick={() => openComposeWithUser(item.hostUserId, item.hostAlias)}
                          className="qa-action rounded-full border border-emerald-200/30 bg-emerald-200/14 px-2.5 py-1 text-[11px] text-emerald-100 transition hover:border-emerald-200/50"
                        >
                          Contact host
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => router.push(cityHref(item.city))}
                        className="qa-action rounded-full border border-cyan-200/26 bg-cyan-200/12 px-2.5 py-1 text-[11px] text-cyan-100 transition hover:border-cyan-200/45"
                      >
                        Open city
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-white/58">
              No VIP invite activity in this filter.
            </p>
          )}
            </>
          ) : (
            <p className="mt-3 text-xs text-white/58">
              VIP panel collapsed to keep conversations in focus.
            </p>
          )}
        </section>

        {startCompose && startUserId ? (
          <section
            ref={composePanelRef}
            className="qa-panel mb-6 rounded-[24px] border border-cyan-300/18 bg-[linear-gradient(155deg,rgba(15,52,67,0.58),rgba(10,10,10,0.96))] p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/75">Contact Host</p>
                <h2 className="mt-1 text-base font-semibold text-white">Message {startUserName || "Host"} directly</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStartCompose(false);
                  setDirectComposeBody("");
                  router.replace("/messages");
                }}
                className="qa-action rounded-full border border-white/14 bg-white/8 px-3 py-1 text-[11px] text-white/80"
              >
                Cancel
              </button>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <textarea
                value={directComposeBody}
                onChange={(event) => setDirectComposeBody(event.target.value)}
                placeholder={`Write your first message to ${startUserName || "the host"}`}
                className="min-h-[84px] w-full resize-y rounded-2xl border border-white/14 bg-black/35 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-200/44"
              />
              <button
                type="button"
                onClick={sendDirectComposeMessage}
                disabled={isDirectComposeSending || !directComposeBody.trim()}
                className="qa-action qa-action-strong h-fit rounded-xl bg-gradient-to-r from-cyan-200 via-sky-200 to-emerald-200 px-4 py-2 text-sm font-semibold text-black transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isDirectComposeSending ? "Sending..." : "Send to host"}
              </button>
            </div>
          </section>
        ) : null}

        <section className="qa-panel mb-6 rounded-[26px] border border-sky-300/18 bg-[radial-gradient(circle_at_10%_10%,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_90%_12%,rgba(45,212,191,0.14),transparent_30%),linear-gradient(145deg,rgba(11,31,49,0.92),rgba(10,10,10,0.98))] p-4 shadow-[0_24px_72px_rgba(0,0,0,0.38)] backdrop-blur-sm sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-sky-100/75">Start Conversation</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Message friends or discover new members</h2>
            </div>
            <div className="inline-flex rounded-full border border-white/14 bg-white/7 p-1">
              <button
                type="button"
                onClick={() => setComposerTab("friends")}
                className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.12em] transition ${
                  composerTab === "friends"
                    ? "border border-cyan-200/45 bg-cyan-200/22 text-cyan-100 shadow-[0_8px_20px_rgba(34,211,238,0.18)]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Friends
              </button>
              <button
                type="button"
                onClick={() => setComposerTab("members")}
                className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.12em] transition ${
                  composerTab === "members"
                    ? "border border-fuchsia-200/45 bg-fuchsia-200/22 text-fuchsia-100 shadow-[0_8px_20px_rgba(217,70,239,0.2)]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                All members
              </button>
            </div>
          </div>

          <div className="mt-3">
            <input
              value={composerSearch}
              onChange={(event) => setComposerSearch(event.target.value)}
              placeholder={composerTab === "friends" ? "Search your friends by name" : "Search members by name, city, title"}
              className="w-full rounded-xl border border-white/14 bg-black/35 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-200/40"
            />
            <p className="mt-2 text-[11px] text-white/55">
              {composerTab === "friends"
                ? "Friend-first inbox flow. Start from trusted circle."
                : "Discover new members and open a direct thread in one tap."}
            </p>
          </div>

          {composerWarning ? (
            <p className="mt-3 rounded-xl border border-amber-200/24 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
              {composerWarning}
            </p>
          ) : null}

          <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto pr-1">
            {composerLoading ? (
              [0, 1, 2].map((item) => (
                <div key={`composer-skeleton-${item}`} className="h-16 rounded-2xl border border-white/10 bg-white/5" />
              ))
            ) : composerTab === "friends" ? (
              friendCandidates.length > 0 ? (
                friendCandidates.map((candidate) => {
                  const existingThread = threadByOtherUserId.get(candidate.userId);
                  const busy = Boolean(composerBusyByUserId[candidate.userId]);
                  return (
                    <article key={`friend-${candidate.userId}`} className="rounded-2xl border border-white/12 bg-white/[0.03] px-3 py-2">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{candidate.displayName}</p>
                          <p className="mt-1 text-[11px] text-white/58">
                            {candidate.activeNow ? "Active now" : timeAgo(candidate.lastSeenAt)}
                            {candidate.unreadCount > 0 ? ` · ${candidate.unreadCount} unread` : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openThreadFromCandidate(candidate.userId)}
                          disabled={busy}
                          className="qa-action rounded-full border border-cyan-200/36 bg-cyan-200/18 px-3 py-1 text-[11px] font-semibold text-cyan-100 transition hover:border-cyan-200/54 disabled:opacity-60"
                        >
                          {busy ? "Opening..." : existingThread ? "Open thread" : "Message"}
                        </button>
                      </div>
                    </article>
                  );
                })
              ) : (
                <p className="rounded-2xl border border-dashed border-white/14 px-3 py-5 text-xs text-white/58">
                  No friends matched this search yet.
                </p>
              )
            ) : memberCandidates.length > 0 ? (
              memberCandidates.map((candidate) => {
                const existingThread = threadByOtherUserId.get(candidate.userId);
                const busy = Boolean(composerBusyByUserId[candidate.userId]);
                return (
                  <article key={`member-${candidate.userId}`} className="rounded-2xl border border-white/12 bg-white/[0.03] px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{candidate.displayName}</p>
                        <p className="mt-1 text-[11px] text-white/58">
                          {[candidate.homeCity, candidate.residentCountry].filter(Boolean).join(" · ") || "City not set"}
                        </p>
                        <p className="mt-1 text-[11px] text-white/52">
                          {candidate.isOnline ? "Active now" : timeAgo(candidate.lastSeenAt)}
                          {candidate.mutualCount > 0 ? ` · ${candidate.mutualCount} mutual` : ""}
                          {candidate.followsYou ? " · follows you" : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openThreadFromCandidate(candidate.userId)}
                        disabled={busy}
                        className="qa-action rounded-full border border-fuchsia-200/36 bg-fuchsia-200/18 px-3 py-1 text-[11px] font-semibold text-fuchsia-100 transition hover:border-fuchsia-200/54 disabled:opacity-60"
                      >
                        {busy ? "Opening..." : existingThread ? "Open thread" : "Message"}
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="rounded-2xl border border-dashed border-white/14 px-3 py-5 text-xs text-white/58">
                No members matched this search.
              </p>
            )}
          </div>

          {composerTab === "members" && memberCandidatesHasMore ? (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={loadMoreMemberCandidates}
                disabled={composerLoading}
                className="qa-action rounded-full border border-fuchsia-200/28 bg-fuchsia-200/12 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-fuchsia-100 transition hover:border-fuchsia-200/45 disabled:opacity-60"
              >
                {composerLoading ? "Loading..." : "Load more"}
              </button>
            </div>
          ) : null}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className={`${mobileThreadOpen ? "hidden lg:block" : "block"} qa-panel rounded-[30px] border border-cyan-300/16 bg-[radial-gradient(circle_at_10%_8%,rgba(34,211,238,0.14),transparent_34%),linear-gradient(180deg,rgba(9,32,44,0.7),rgba(10,10,10,0.99))] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">Conversations</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                className={`qa-action rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em] transition ${
                  filter === "all"
                    ? "border-cyan-200/50 bg-cyan-200/22 text-cyan-100"
                    : "border-white/12 bg-white/6 text-white/65 hover:border-white/24"
                }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("unread")}
                className={`qa-action rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em] transition ${
                  filter === "unread"
                    ? "border-fuchsia-200/50 bg-fuchsia-200/22 text-fuchsia-100"
                    : "border-white/12 bg-white/6 text-white/65 hover:border-white/24"
                }`}
                >
                  Unread
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("active")}
                className={`qa-action rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em] transition ${
                  filter === "active"
                    ? "border-emerald-200/50 bg-emerald-200/22 text-emerald-100"
                    : "border-white/12 bg-white/6 text-white/65 hover:border-white/24"
                }`}
                >
                  Active
                </button>
              </div>
            </div>

            {isLoadingThreads ? (
              <div className="space-y-3">
                {[0, 1, 2].map((item) => (
                  <div key={`inbox-skeleton-${item}`} className="qa-skeleton-card h-24 rounded-2xl border border-white/10 bg-white/5" />
                ))}
              </div>
            ) : filteredThreads.length > 0 ? (
              <div className="max-h-[64vh] space-y-2 overflow-y-auto pr-1">
                {filteredThreads.map((thread) => {
                  const selected = String(thread.id) === String(activeThreadId);
                  const active = isActiveNow(thread.presence);
                  return (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => handleSelectThread(thread.id)}
                      className={`qa-list-card w-full rounded-2xl border p-3 text-left transition ${
                        selected
                          ? "border-cyan-200/42 bg-cyan-200/16 shadow-[0_10px_30px_rgba(34,211,238,0.15)]"
                          : "border-white/10 bg-white/[0.03] hover:border-cyan-200/26 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`truncate text-sm ${thread.unreadCount > 0 ? "font-bold text-white" : "font-semibold text-white/92"}`}>
                          {thread.displayName}
                        </p>
                        <p className="text-[11px] text-white/45">{formatTime(thread.lastMessage?.createdAt || thread.lastMessageAt)}</p>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.85)]" : "bg-white/25"}`} />
                        <p className="text-[11px] text-white/55">{active ? "Active now" : timeAgo(thread.presence?.lastSeenAt)}</p>
                        {thread.unreadCount > 0 ? (
                          <span className="ml-auto rounded-full border border-fuchsia-200/35 bg-fuchsia-300 px-2 py-0.5 text-[10px] font-bold text-black">
                            {thread.unreadCount}
                          </span>
                        ) : null}
                      </div>
                      <p className={`mt-2 line-clamp-1 text-xs ${thread.unreadCount > 0 ? "font-medium text-white/85" : "text-white/60"}`}>
                        {thread.preview}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                tone="violet"
                title="No threads in this filter"
                description="Try another filter or start a new message from your friends list in Favorites."
                primaryActionLabel="Show all threads"
                onPrimaryAction={() => setFilter("all")}
              />
            )}
          </div>

          <div className={`${mobileThreadOpen ? "block" : "hidden lg:block"} qa-panel rounded-[30px] border border-fuchsia-300/16 bg-[radial-gradient(circle_at_88%_8%,rgba(244,114,182,0.15),transparent_34%),linear-gradient(180deg,rgba(42,14,38,0.5),rgba(10,10,10,0.99))] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm`}>
            {activeThread ? (
              <>
                <div className="mb-3 rounded-2xl border border-fuchsia-200/22 bg-fuchsia-200/[0.06] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">Subject</p>
                      <p className="mt-1 text-base font-semibold text-white">Conversation with {activeThread.displayName}</p>
                      <p className="mt-1 text-[11px] text-white/58">
                        {isActiveNow(activeThread.presence)
                          ? "Active now"
                          : `Last active ${timeAgo(activeThread.presence?.lastSeenAt)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMobileThreadOpen(false)}
                        className="qa-action rounded-full border border-white/14 bg-white/8 px-3 py-1 text-[11px] text-white/80 lg:hidden"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => removeThreadFromInbox(activeThread.id)}
                        className="qa-action rounded-full border border-rose-200/30 bg-rose-200/14 px-3 py-1 text-[11px] text-rose-100 transition hover:border-rose-200/50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div className="h-[52vh] overflow-y-auto rounded-2xl border border-white/12 bg-black/35 p-4">
                  {isLoadingMessages ? (
                    <p className="text-xs text-white/55">Loading thread...</p>
                  ) : messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.map((message) => {
                        const mine = String(message.senderId) === String(userId);
                        const senderLabel = mine ? "You" : activeThread.displayName;
                        return (
                          <div
                            key={message.id}
                            className={`rounded-2xl border px-4 py-3 text-sm ${
                              mine
                                ? "border-cyan-200/30 bg-gradient-to-r from-cyan-300/14 to-sky-300/10"
                                : "border-white/12 bg-white/8"
                            }`}
                          >
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">{senderLabel}</p>
                              <p className="text-[11px] text-white/55">{formatDateTime(message.createdAt)}</p>
                            </div>
                            <p className="whitespace-pre-wrap break-words leading-6 text-white/92">{message.body}</p>
                          </div>
                        );
                      })}
                      <div ref={messageEndRef} />
                    </div>
                  ) : (
                    <p className="text-xs text-white/55">No messages yet in this thread.</p>
                  )}
                </div>

                <form
                  className="mt-3 rounded-2xl border border-white/12 bg-black/28 p-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSend();
                  }}
                >
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-white/55">
                    Reply
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder={activeOtherUserId ? `Write email-style reply to ${activeThread.displayName}` : "Write a message"}
                      className="h-12 w-full resize-none rounded-xl border border-white/14 bg-black/40 px-3 py-2 text-sm outline-none transition focus:border-cyan-200/40"
                    />
                    <button
                      type="submit"
                      disabled={sending || !draft.trim()}
                      className="qa-action qa-action-strong rounded-xl bg-gradient-to-r from-cyan-200 via-sky-200 to-emerald-200 px-4 py-2 text-sm font-semibold text-black transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <EmptyState
                tone="amber"
                title="Select a thread"
                description="Choose a conversation from the inbox list to read and reply."
                primaryActionLabel="Open Favorites"
                onPrimaryAction={() => router.push("/favorites")}
              />
            )}
          </div>
        </section>
      </div>

      <ActionToast toast={toast} />
    </main>
  );
}



