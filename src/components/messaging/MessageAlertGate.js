"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useActionToast } from "@/lib/useActionToast";
import ActionToast from "@/components/ui/ActionToast";

const STORAGE_PREFIX = "qa_unread_dm_alert_seen";

export default function MessageAlertGate() {
  const { isMember, user, isLoading } = useAuth();
  const { toast, showToast } = useActionToast();

  useEffect(() => {
    if (isLoading || !isMember || !user?.id) return;

    let active = true;
    const key = `${STORAGE_PREFIX}:${user.id}`;

    const checkUnread = async () => {
      const { data, error } = await supabase.rpc("qa_get_unread_dm_count");
      if (!active || error) return;

      const unread = Number(data || 0);
      if (unread <= 0) return;

      const seen = sessionStorage.getItem(key);
      if (seen) return;

      sessionStorage.setItem(key, "1");
      showToast(
        unread === 1
          ? "You have 1 new message. Open Messages to reply."
          : `You have ${unread} new messages. Open Messages to reply.`,
        { tone: "info", duration: 3200 }
      );
    };

    checkUnread();
    return () => {
      active = false;
    };
  }, [isLoading, isMember, showToast, user?.id]);

  return <ActionToast toast={toast} position="top-center" />;
}
