"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useActionToast } from "@/lib/useActionToast";
import ActionToast from "@/components/ui/ActionToast";

const STORAGE_PREFIX = "qa_unread_dm_alert_seen";

export default function MessageAlertGate() {
  const { isMember, user, isLoading } = useAuth();
  const { toast, showToast } = useActionToast();
  const previousUnread = useRef(null);

  useEffect(() => {
    if (isLoading || !isMember || !user?.id) return;

    let active = true;
    const key = `${STORAGE_PREFIX}:${user.id}`;

    const checkUnread = async () => {
      const { data, error } = await supabase.rpc("qa_get_unread_dm_count");
      if (!active || error) return;

      const unread = Number(data || 0);
      if (unread <= 0) return;

      const hasNewMessage = previousUnread.current !== null && unread > previousUnread.current;
      previousUnread.current = unread;
      const seen = sessionStorage.getItem(key);
      if (!hasNewMessage && seen) return;
      sessionStorage.setItem(key, "1");
      window.dispatchEvent(new CustomEvent("qa:messages-changed", { detail: { unread } }));
      if (hasNewMessage && document.visibilityState === "visible" && typeof navigator.vibrate === "function") navigator.vibrate([70, 45, 70]);
      showToast(
        unread === 1
          ? "You have 1 new message. Open Messages to reply."
          : `You have ${unread} new messages. Open Messages to reply.`,
        { tone: "info", duration: 3200 }
      );
    };

    checkUnread();
    const channel = supabase
      .channel(`qa-message-alerts-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "qa_dm_messages" }, checkUnread)
      .on("postgres_changes", { event: "*", schema: "public", table: "qa_dm_thread_state", filter: `user_id=eq.${user.id}` }, checkUnread)
      .subscribe();
    const poll = window.setInterval(checkUnread, 12000);
    const onVisible = () => { if (document.visibilityState === "visible") checkUnread(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channel);
    };
  }, [isLoading, isMember, showToast, user?.id]);

  return <ActionToast toast={toast} position="top-center" />;
}
