"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, Home, MapPinned, MessageCircle, Star, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function FloatingHomeButton() {
  const pathname = usePathname();
  const { isMember, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [vipRequestCount, setVipRequestCount] = useState(0);

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

    refreshUnread();
    refreshVipRequests();
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refreshUnread();
        refreshVipRequests();
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
  }, [isMember, user?.id]);

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      idleClass:
        "border-slate-200/18 bg-slate-100/6 text-slate-100/88 hover:border-slate-100/34 hover:bg-slate-100/12",
      activeClass:
        "border-fuchsia-200/65 bg-[linear-gradient(135deg,rgba(244,114,182,0.30),rgba(99,102,241,0.28),rgba(10,10,10,0.96))] shadow-[0_10px_30px_rgba(217,70,239,0.36)]",
    },
    {
      href: "/favorites",
      label: "Your Atlas",
      icon: Star,
      idleClass:
        "border-amber-200/20 bg-amber-100/7 text-amber-100/90 hover:border-amber-100/40 hover:bg-amber-100/15",
      activeClass:
        "border-amber-200/65 bg-[linear-gradient(135deg,rgba(251,191,36,0.30),rgba(249,115,22,0.24),rgba(10,10,10,0.96))] shadow-[0_10px_30px_rgba(251,191,36,0.30)]",
    },
    {
      href: "/events",
      label: "Events",
      icon: CalendarDays,
      idleClass:
        "border-cyan-200/20 bg-cyan-100/7 text-cyan-100/90 hover:border-cyan-100/40 hover:bg-cyan-100/15",
      activeClass:
        "border-cyan-200/65 bg-[linear-gradient(135deg,rgba(34,211,238,0.30),rgba(59,130,246,0.28),rgba(10,10,10,0.96))] shadow-[0_10px_30px_rgba(34,211,238,0.34)]",
    },
    {
      href: "/cities",
      label: "Cities",
      icon: MapPinned,
      idleClass:
        "border-emerald-200/20 bg-emerald-100/7 text-emerald-100/90 hover:border-emerald-100/40 hover:bg-emerald-100/15",
      activeClass:
        "border-emerald-200/65 bg-[linear-gradient(135deg,rgba(16,185,129,0.32),rgba(6,182,212,0.26),rgba(10,10,10,0.96))] shadow-[0_10px_30px_rgba(16,185,129,0.30)]",
    },
    ...(isMember
      ? [
          {
            href: "/community",
            label: "Community",
            icon: Users,
            idleClass:
              "border-violet-200/20 bg-violet-100/7 text-violet-100/90 hover:border-violet-100/40 hover:bg-violet-100/16",
            activeClass:
              "border-violet-200/65 bg-[linear-gradient(135deg,rgba(167,139,250,0.30),rgba(244,114,182,0.24),rgba(10,10,10,0.96))] shadow-[0_10px_30px_rgba(167,139,250,0.34)]",
          },
          {
            href: "/messages",
            label: "Messages",
            icon: MessageCircle,
            idleClass:
              "border-sky-200/20 bg-sky-100/7 text-sky-100/90 hover:border-sky-100/40 hover:bg-sky-100/15",
            activeClass:
              "border-sky-200/65 bg-[linear-gradient(135deg,rgba(56,189,248,0.32),rgba(99,102,241,0.24),rgba(10,10,10,0.96))] shadow-[0_10px_30px_rgba(56,189,248,0.34)]",
          },
        ]
      : []),
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[90] sm:bottom-6 sm:right-6">
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.22),rgba(56,189,248,0.14),transparent_72%)] blur-xl" />
      <nav
        aria-label="Quick navigation"
        className="relative flex items-center gap-1.5 rounded-full border border-white/20 bg-[linear-gradient(135deg,rgba(7,10,18,0.92),rgba(24,24,38,0.9),rgba(10,10,10,0.95))] px-2 py-2 shadow-[0_16px_50px_rgba(3,7,18,0.52)] backdrop-blur-xl"
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
              className={`group relative inline-flex h-11 w-11 items-center justify-center rounded-full border transition duration-200 ${
                isActive
                  ? item.activeClass
                  : `${item.idleClass} hover:-translate-y-[1px]`
              }`}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              <span className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-white/20 bg-black/85 px-2 py-1 text-[10px] font-medium text-white/90 shadow-[0_8px_24px_rgba(2,6,23,0.45)] md:block md:opacity-0 md:transition md:duration-150 md:group-hover:opacity-100">
                {item.label}
              </span>
              {isActive ? (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.85)]"
                />
              ) : null}
              {item.href === "/messages" && unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 rounded-full border border-fuchsia-200/35 bg-fuchsia-300 px-1.5 py-0.5 text-[10px] font-bold text-black">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
              {item.href === "/messages" && unreadCount <= 0 && vipRequestCount > 0 ? (
                <span className="absolute -right-1 -top-1 rounded-full border border-cyan-200/35 bg-cyan-300 px-1.5 py-0.5 text-[10px] font-bold text-black">
                  {vipRequestCount > 99 ? "99+" : vipRequestCount}
                </span>
              ) : null}
              {item.href === "/messages" && unreadCount > 0 && vipRequestCount > 0 ? (
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
