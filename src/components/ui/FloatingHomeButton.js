"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function FloatingHomeButton() {
  const pathname = usePathname();
  const { isMember, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const isHome = pathname === "/";
  const isMessages = pathname === "/messages";

  useEffect(() => {
    if (!isMember || !user?.id) {
      setUnreadCount(0);
      return;
    }

    let active = true;

    const refreshUnread = async () => {
      const { data, error } = await supabase.rpc("qa_get_unread_dm_count");
      if (!active || error) return;
      setUnreadCount(Number(data || 0));
    };

    refreshUnread();
    const timer = setInterval(refreshUnread, 30000);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refreshUnread();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isMember, user?.id]);

  if (isHome) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[90] flex items-center gap-2 sm:bottom-6 sm:right-6">
      {isMember && !isMessages ? (
        <Link
          href="/messages"
          aria-label="Open Messages"
          className="relative inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-[linear-gradient(135deg,rgba(34,211,238,0.22),rgba(59,130,246,0.2),rgba(10,10,10,0.92))] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_44px_rgba(34,211,238,0.32)] backdrop-blur transition hover:scale-[1.02] hover:border-cyan-100/45 hover:shadow-[0_18px_55px_rgba(34,211,238,0.40)]"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          <span>Messages</span>
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 rounded-full border border-fuchsia-200/35 bg-fuchsia-300 px-1.5 py-0.5 text-[10px] font-bold text-black">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Link>
      ) : null}

      <Link
        href="/"
        aria-label="Back to Home"
        className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200/30 bg-[linear-gradient(135deg,rgba(236,72,153,0.22),rgba(99,102,241,0.2),rgba(10,10,10,0.92))] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_44px_rgba(217,70,239,0.35)] backdrop-blur transition hover:scale-[1.02] hover:border-fuchsia-100/45 hover:shadow-[0_18px_55px_rgba(192,38,211,0.42)]"
      >
        <Home className="h-4 w-4" aria-hidden="true" />
        <span>Home</span>
      </Link>
    </div>
  );
}
