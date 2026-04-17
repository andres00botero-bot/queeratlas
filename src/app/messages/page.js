"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useActionToast } from "@/lib/useActionToast";
import { writeLocalValue } from "@/lib/storage";
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

export default function MessagesPage() {
  const router = useRouter();
  const { isMember, isLoading: isAuthLoading, user } = useAuth();
  const { toast, showToast } = useActionToast();
  const messageEndRef = useRef(null);
  const activeThreadRef = useRef("");
  const [isReady, setIsReady] = useState(false);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [warning, setWarning] = useState("");
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [presenceByUserId, setPresenceByUserId] = useState({});
  const [startUserId, setStartUserId] = useState("");
  const [startUserName, setStartUserName] = useState("");
  const [filter, setFilter] = useState("all");
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);

  const activeThread = useMemo(
    () => threads.find((thread) => String(thread.id) === String(activeThreadId)) || null,
    [threads, activeThreadId]
  );

  const activeOtherUserId = activeThread?.otherUserId || "";

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

  const loadThreads = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingThreads(true);
    setWarning("");

    const { data: threadRows, error: threadError } = await supabase
      .from("qa_dm_threads")
      .select("id, user_a, user_b, created_at, updated_at, last_message_at")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
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
      const otherUserId = row.user_a === user.id ? row.user_b : row.user_a;
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
          .select("thread_id")
          .in("thread_id", threadIds)
          .neq("sender_id", user.id)
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
        unreadMap.set(threadId, (unreadMap.get(threadId) || 0) + 1);
      });

      (recentRows || []).forEach((row) => {
        const threadId = String(row.thread_id || "");
        if (!threadId || lastMessageMap.has(threadId)) return;
        lastMessageMap.set(threadId, {
          id: String(row.id),
          body: row.body || "",
          createdAt: row.created_at || null,
          senderId: row.sender_id ? String(row.sender_id) : "",
        });
      });
    }

    const mappedThreads = normalizedThreads
      .map((thread) => {
        const profile = profileMap.get(thread.otherUserId);
        const momentumMeta = friendMetaMap.get(thread.otherUserId);
        const presence =
          momentumMeta
            ? { isOnline: momentumMeta.isOnline, lastSeenAt: momentumMeta.lastSeenAt }
            : nextPresenceByUserId[thread.otherUserId] || { isOnline: false, lastSeenAt: null };

        const lastMessage = lastMessageMap.get(thread.id) || null;
        const unreadCount = unreadMap.get(thread.id) ?? momentumMeta?.unreadCount ?? 0;
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
      .sort((a, b) => b.sortTs - a.sortTs);

    setPresenceByUserId(nextPresenceByUserId);
    setThreads(mappedThreads);
    setActiveThreadId((current) => {
      if (current && mappedThreads.some((thread) => thread.id === current)) return current;
      return mappedThreads[0]?.id || "";
    });
    setIsLoadingThreads(false);
  }, [startUserId, startUserName, user?.id]);

  const markThreadRead = useCallback(
    async (threadId) => {
      if (!threadId || !user?.id) return;

      const { error: rpcError } = await supabase.rpc("qa_mark_thread_read", {
        target_thread_id: threadId,
      });

      if (rpcError && !isMissingTableError(rpcError)) {
        await Promise.all([
          supabase
            .from("qa_dm_messages")
            .update({ read_at: new Date().toISOString() })
            .eq("thread_id", threadId)
            .neq("sender_id", user.id)
            .is("read_at", null),
          supabase.from("qa_dm_thread_state").upsert(
            {
              thread_id: threadId,
              user_id: user.id,
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
    [user?.id]
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

      setMessages((data || []).map(normalizeMessageRow));
      await markThreadRead(threadId);
      setIsLoadingMessages(false);
    },
    [markThreadRead, showToast]
  );

  const handleSelectThread = useCallback((threadId) => {
    setActiveThreadId(threadId);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileThreadOpen(true);
    }
  }, []);

  const handleSend = useCallback(async () => {
    const body = draft.trim();
    if (!body || !activeThreadId || !user?.id || sending) return;

    setSending(true);
    const { error } = await supabase.from("qa_dm_messages").insert({
      thread_id: activeThreadId,
      sender_id: user.id,
      body,
    });

    if (error) {
      if (isMissingTableError(error)) {
        setWarning("Messaging tables are not enabled yet. Run supabase/direct-messaging-v1.sql first.");
      } else {
        showToast(error.message || "Could not send message right now.", { tone: "warn" });
      }
      setSending(false);
      return;
    }

    setDraft("");
    showToast("Message sent.", { tone: "ok", duration: 1200 });
    setSending(false);
  }, [activeThreadId, draft, sending, showToast, user?.id]);

  const openOrCreateThreadForUser = useCallback(
    async (targetUserId) => {
      const normalized = String(targetUserId || "").trim();
      if (!normalized || !user?.id || normalized === user.id) return;

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
        return;
      }

      const threadId = Array.isArray(data)
        ? String(data[0]?.thread_id || "")
        : String(data?.thread_id || "");

      if (!threadId) {
        showToast("Could not open this message thread right now.", { tone: "warn" });
        return;
      }

      await loadThreads();
      setActiveThreadId(threadId);
      setStartUserId("");
      setStartUserName("");
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setMobileThreadOpen(true);
      }
      router.replace("/messages");
    },
    [loadThreads, router, showToast, user?.id]
  );

  useEffect(() => {
    activeThreadRef.current = activeThreadId;
  }, [activeThreadId]);

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
      setIsReady(true);
    });
  }, [isAuthLoading, isMember, loadThreads, router]);

  useEffect(() => {
    if (!activeThreadId || !isReady) return;
    loadMessages(activeThreadId);
  }, [activeThreadId, isReady, loadMessages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search || "");
    setStartUserId(String(params.get("user") || "").trim());
    setStartUserName(String(params.get("name") || "").trim());
  }, []);

  useEffect(() => {
    if (!isReady || !isMember || !startUserId || !user?.id) return;
    openOrCreateThreadForUser(startUserId);
  }, [isReady, isMember, openOrCreateThreadForUser, startUserId, user?.id]);

  useEffect(() => {
    if (!user?.id || !isMember) return;

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
  }, [isMember, user?.id]);

  useEffect(() => {
    if (!user?.id || !isMember) return;

    const channel = supabase
      .channel(`qa-signal-inbox-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "qa_dm_messages" }, async (payload) => {
        const row = payload.new || {};
        const threadId = String(row.thread_id || "");
        if (!threadId) return;

        const messageRow = normalizeMessageRow(row);

        setThreads((current) => {
          if (!current.some((thread) => thread.id === threadId)) {
            queueMicrotask(loadThreads);
            return current;
          }

          const next = current.map((thread) => {
            if (thread.id !== threadId) return thread;
            const isIncoming = messageRow.senderId && messageRow.senderId !== user.id;
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
          if (messageRow.senderId && messageRow.senderId !== user.id) {
            await markThreadRead(threadId);
          }
        } else if (messageRow.senderId && messageRow.senderId !== user.id) {
          showToast("New message received.", { tone: "info", duration: 2600 });
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "qa_presence" }, (payload) => {
        const row = payload.new || {};
        const updatedUserId = String(row.user_id || "");
        if (!updatedUserId) return;

        setPresenceByUserId((current) => ({
          ...current,
          [updatedUserId]: {
            isOnline: Boolean(row.is_online),
            lastSeenAt: row.last_seen_at || null,
          },
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isMember, loadThreads, markThreadRead, showToast, user?.id]);

  useEffect(() => {
    setThreads((current) =>
      current.map((thread) => {
        const presence = presenceByUserId[thread.otherUserId];
        if (!presence) return thread;
        return {
          ...thread,
          presence,
        };
      })
    );
  }, [presenceByUserId]);

  if (!isReady || isAuthLoading) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <PageOpeningState
            title="Loading Signal Inbox"
            subtitle="Syncing your threads, unread signal, and active friends."
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 rounded-[34px] border border-cyan-300/16 bg-[radial-gradient(circle_at_10%_10%,rgba(34,211,238,0.22),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(244,114,182,0.2),transparent_30%),linear-gradient(145deg,rgba(10,34,48,0.98),rgba(10,10,10,1))] p-6 shadow-[0_36px_120px_rgba(0,0,0,0.46)]">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/75">Signal Inbox</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">Messages</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/76">
            Inbox-first private messaging. Review unread signal, see who is active now, and reply from one clean panel.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-fuchsia-300/24 bg-fuchsia-300/[0.08] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-fuchsia-100/75">Unread</p>
              <p className="mt-2 text-3xl font-semibold text-white">{metrics.unread}</p>
            </div>
            <div className="rounded-2xl border border-cyan-300/24 bg-cyan-300/[0.08] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/75">Active friends</p>
              <p className="mt-2 text-3xl font-semibold text-white">{metrics.active}</p>
            </div>
            <div className="rounded-2xl border border-emerald-300/24 bg-emerald-300/[0.08] px-4 py-3">
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

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className={`${mobileThreadOpen ? "hidden lg:block" : "block"} rounded-[30px] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(9,30,40,0.68),rgba(10,10,10,0.99))] p-4`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">Inbox</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em] transition ${
                    filter === "all"
                      ? "border-cyan-200/40 bg-cyan-200/16 text-cyan-100"
                      : "border-white/12 bg-white/6 text-white/65 hover:border-white/24"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("unread")}
                  className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em] transition ${
                    filter === "unread"
                      ? "border-fuchsia-200/40 bg-fuchsia-200/16 text-fuchsia-100"
                      : "border-white/12 bg-white/6 text-white/65 hover:border-white/24"
                  }`}
                >
                  Unread
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("active")}
                  className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em] transition ${
                    filter === "active"
                      ? "border-emerald-200/40 bg-emerald-200/16 text-emerald-100"
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
                  <div key={`inbox-skeleton-${item}`} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
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
                      className={`w-full rounded-2xl border p-3 text-left transition ${
                        selected
                          ? "border-cyan-200/42 bg-cyan-200/16 shadow-[0_10px_30px_rgba(34,211,238,0.15)]"
                          : "border-white/10 bg-white/[0.03] hover:border-cyan-200/26 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-white">{thread.displayName}</p>
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
                      <p className="mt-2 line-clamp-1 text-xs text-white/60">{thread.preview}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                tone="violet"
                title="No threads in this filter"
                description="Try another filter or start a message from your following list in Favorites."
              />
            )}
          </div>

          <div className={`${mobileThreadOpen ? "block" : "hidden lg:block"} rounded-[30px] border border-fuchsia-300/14 bg-[linear-gradient(180deg,rgba(42,14,38,0.46),rgba(10,10,10,0.99))] p-4`}>
            {activeThread ? (
              <>
                <div className="mb-3 rounded-2xl border border-fuchsia-200/22 bg-fuchsia-200/[0.06] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{activeThread.displayName}</p>
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
                        className="rounded-full border border-white/14 bg-white/8 px-3 py-1 text-[11px] text-white/80 lg:hidden"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled
                        className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] text-white/45"
                      >
                        Mute
                      </button>
                    </div>
                  </div>
                </div>

                <div className="h-[52vh] overflow-y-auto rounded-2xl border border-white/12 bg-black/35 p-4">
                  {isLoadingMessages ? (
                    <p className="text-xs text-white/55">Loading conversation...</p>
                  ) : messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.map((message) => {
                        const mine = String(message.senderId) === String(user?.id);
                        return (
                          <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[86%] rounded-2xl border px-3 py-2 text-sm ${
                                mine
                                  ? "border-cyan-200/30 bg-gradient-to-r from-cyan-300/24 to-sky-300/16 text-cyan-50"
                                  : "border-white/12 bg-white/10 text-white/92"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words leading-6">{message.body}</p>
                              <p className="mt-1 text-[10px] text-white/55">{formatDateTime(message.createdAt)}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messageEndRef} />
                    </div>
                  ) : (
                    <p className="text-xs text-white/55">No messages yet. Write the first message below.</p>
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
                    Write reply
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder={activeOtherUserId ? `Write to ${activeThread.displayName}` : "Write a message"}
                      className="h-12 w-full resize-none rounded-xl border border-white/14 bg-black/40 px-3 py-2 text-sm outline-none transition focus:border-cyan-200/40"
                    />
                    <button
                      type="submit"
                      disabled={sending || !draft.trim()}
                      className="rounded-xl bg-gradient-to-r from-cyan-200 via-sky-200 to-emerald-200 px-4 py-2 text-sm font-semibold text-black transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-55"
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
              />
            )}
          </div>
        </section>
      </div>

      <ActionToast toast={toast} />
    </main>
  );
}
