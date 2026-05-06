"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, Home, MapPinned, MessageCircle, Star, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { resolveAdminAccess } from "@/lib/adminAccess";
import { supabase } from "@/lib/supabase";

function isMissingTableError(error) {
  if (!error) return false;
  const code = String(error.code || "").toUpperCase();
  const message = String(error.message || "").toLowerCase();
  return code === "42P01" || code === "PGRST205" || message.includes("does not exist");
}

export default function FloatingHomeButton() {
  const pathname = usePathname();
  const { isMember, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [vipRequestCount, setVipRequestCount] = useState(0);
  const [pendingSubmissionCount, setPendingSubmissionCount] = useState(0);

  useEffect(() => {
    if (!isMember || !user?.id) {
      return;
    }

    let active = true;

    const refreshUnread = async () => {
      const { data, error } = await supabase.rpc("qa_get_unread_dm_count");
      if (!active || error) return;
      setUnreadCount(Number(data || 0));
    };

    const refreshVipRequests = async () => {
      const { data: hostedRows, error: hostedError } = await supabase
        .from("qa_private_events")
        .select("id")
        .eq("host_user_id", user.id)
        .eq("status", "active")
        .limit(200);

      if (!active || hostedError) return;

      const hostedIds = (hostedRows || []).map((row) => String(row.id || "")).filter(Boolean);
      if (hostedIds.length === 0) {
        setVipRequestCount(0);
        return;
      }

      const { count, error: invitesError } = await supabase
        .from("qa_private_event_invites")
        .select("id", { count: "exact", head: true })
        .in("event_id", hostedIds)
        .eq("status", "requested");

      if (!active || invitesError) return;
      setVipRequestCount(Number(count || 0));
    };

    const refreshPendingSubmissions = async () => {
      const { isAdmin } = await resolveAdminAccess({ email: user?.email || "" });
      if (!active) return;

      if (!isAdmin) {
        setPendingSubmissionCount(0);
        return;
      }

      const { count, error } = await supabase
        .from("qa_content_submissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      if (!active) return;
      if (error) {
        if (isMissingTableError(error)) {
          setPendingSubmissionCount(0);
        }
        return;
      }

      setPendingSubmissionCount(Number(count || 0));
    };

    refreshUnread();
    refreshVipRequests();
    refreshPendingSubmissions();
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refreshUnread();
        refreshVipRequests();
        refreshPendingSubmissions();
      }
    };

    const channel = supabase
      .channel(`qa-floating-unread-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "qa_dm_messages" }, () => {
        refreshUnread();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "qa_private_event_invites" }, () => {
        refreshVipRequests();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "qa_private_events" }, () => {
        refreshVipRequests();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "qa_content_submissions" }, () => {
        refreshPendingSubmissions();
      })
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "qa_dm_thread_state",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refreshUnread();
        }
      )
      .subscribe();

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channel);
    };
  }, [isMember, user?.email, user?.id]);

  const messageSignalCount =
    unreadCount > 0
      ? unreadCount
      : vipRequestCount > 0
        ? vipRequestCount
        : pendingSubmissionCount > 0
          ? pendingSubmissionCount
          : 0;
  const messageSignalCountLabel = messageSignalCount > 99 ? "99+" : String(messageSignalCount);
  const messageSignalTone =
    unreadCount > 0 ? "fuchsia" : vipRequestCount > 0 ? "cyan" : pendingSubmissionCount > 0 ? "amber" : "none";
  const messageSignalLayers = [unreadCount > 0, vipRequestCount > 0, pendingSubmissionCount > 0].filter(Boolean)
    .length;

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      accent: "fuchsia",
    },
    {
      href: "/favorites",
      label: "Your Atlas",
      icon: Star,
      accent: "amber",
    },
    {
      href: "/events",
      label: "Events",
      icon: CalendarDays,
      accent: "cyan",
    },
    {
      href: "/cities",
      label: "Cities",
      icon: MapPinned,
      accent: "emerald",
    },
    ...(isMember
      ? [
          {
            href: "/community",
            label: "Community",
            icon: Users,
            accent: "violet",
          },
          {
            href: "/messages",
            label: "Messages",
            icon: MessageCircle,
            accent: "sky",
          },
        ]
      : []),
  ];

  return (
    <div className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[90] -translate-x-1/2 md:bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] md:left-auto md:translate-x-0 md:right-[calc(1.25rem+env(safe-area-inset-right,0px))]">
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_40%_50%,rgba(56,189,248,0.22),rgba(244,114,182,0.16),transparent_72%)] blur-xl" />
      <nav
        aria-label="Quick navigation"
        className="relative flex items-center gap-1.5 rounded-full border border-white/26 bg-[linear-gradient(135deg,rgba(10,13,20,0.96),rgba(18,20,30,0.95),rgba(10,10,10,0.99))] px-2 py-2 shadow-[0_24px_64px_rgba(2,6,20,0.62),0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-xl max-[390px]:gap-1 max-[390px]:px-1.5 max-[390px]:py-1.5"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-1 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
        />
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              title={item.label}
              className={`group relative inline-flex h-11 w-11 items-center justify-center rounded-full border transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/65 focus-visible:ring-offset-2 focus-visible:ring-offset-black max-[390px]:h-10 max-[390px]:w-10 ${
                isActive
                  ? "border-white/46 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),rgba(255,255,255,0.08),rgba(10,10,10,0.86))] text-white shadow-[0_12px_34px_rgba(0,0,0,0.44)]"
                  : "border-white/16 bg-white/[0.05] text-white/78 hover:-translate-y-[1px] hover:border-white/30 hover:bg-white/[0.1]"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] ${
                  isActive
                    ? item.accent === "fuchsia"
                      ? "text-fuchsia-100 drop-shadow-[0_0_12px_rgba(244,114,182,0.8)]"
                      : item.accent === "amber"
                        ? "text-amber-100 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                        : item.accent === "cyan"
                          ? "text-cyan-100 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                          : item.accent === "emerald"
                            ? "text-emerald-100 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                            : item.accent === "violet"
                              ? "text-violet-100 drop-shadow-[0_0_12px_rgba(167,139,250,0.8)]"
                              : "text-sky-100 drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]"
                    : "text-white/84"
                }`}
                aria-hidden="true"
              />
              <span className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-white/20 bg-black/85 px-2 py-1 text-[10px] font-medium text-white/90 shadow-[0_8px_24px_rgba(2,6,23,0.45)] md:block md:opacity-0 md:transition md:duration-150 md:group-hover:opacity-100">
                {item.label}
              </span>
              {isActive ? (
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-1 h-1.5 w-1.5 rounded-full ${
                    item.accent === "fuchsia"
                      ? "bg-fuchsia-200 shadow-[0_0_12px_rgba(244,114,182,0.95)]"
                      : item.accent === "amber"
                        ? "bg-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.95)]"
                        : item.accent === "cyan"
                          ? "bg-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.95)]"
                          : item.accent === "emerald"
                            ? "bg-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.95)]"
                            : item.accent === "violet"
                              ? "bg-violet-200 shadow-[0_0_12px_rgba(167,139,250,0.95)]"
                              : "bg-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.95)]"
                  }`}
                />
              ) : null}
              {item.href === "/messages" && messageSignalCount > 0 ? (
                <span
                  className={`absolute -right-1 -top-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-black ${
                    messageSignalTone === "fuchsia"
                      ? "border border-fuchsia-200/35 bg-fuchsia-300"
                      : messageSignalTone === "cyan"
                        ? "border border-cyan-200/35 bg-cyan-300"
                        : "border border-amber-200/35 bg-amber-300"
                  }`}
                >
                  {messageSignalCountLabel}
                </span>
              ) : null}
              {item.href === "/messages" && messageSignalLayers > 1 ? (
                <span
                  className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border border-cyan-100/60 bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.85)]"
                  aria-hidden="true"
                />
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
