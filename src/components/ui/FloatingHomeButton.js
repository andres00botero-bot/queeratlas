"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, Home, MapPinned, MessageCircle, Star } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function FloatingHomeButton() {
  const pathname = usePathname();
  const { isMember, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

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

    refreshUnread();
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refreshUnread();
      }
    };

    const channel = supabase
      .channel(`qa-floating-unread-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "qa_dm_messages" }, () => {
        refreshUnread();
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
      activeClass:
        "border-fuchsia-200/65 bg-[linear-gradient(135deg,rgba(244,114,182,0.30),rgba(99,102,241,0.28),rgba(10,10,10,0.96))] shadow-[0_10px_30px_rgba(217,70,239,0.36)]",
    },
    {
      href: "/favorites",
      label: "Your Atlas",
      icon: Star,
      activeClass:
        "border-amber-200/65 bg-[linear-gradient(135deg,rgba(251,191,36,0.30),rgba(249,115,22,0.24),rgba(10,10,10,0.96))] shadow-[0_10px_30px_rgba(251,191,36,0.30)]",
    },
    {
      href: "/events",
      label: "Events",
      icon: CalendarDays,
      activeClass:
        "border-cyan-200/65 bg-[linear-gradient(135deg,rgba(34,211,238,0.30),rgba(59,130,246,0.28),rgba(10,10,10,0.96))] shadow-[0_10px_30px_rgba(34,211,238,0.34)]",
    },
    {
      href: "/cities",
      label: "Cities",
      icon: MapPinned,
      activeClass:
        "border-emerald-200/65 bg-[linear-gradient(135deg,rgba(16,185,129,0.32),rgba(6,182,212,0.26),rgba(10,10,10,0.96))] shadow-[0_10px_30px_rgba(16,185,129,0.30)]",
    },
    ...(isMember
      ? [
          {
            href: "/messages",
            label: "Messages",
            icon: MessageCircle,
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
              className={`group relative inline-flex h-10 w-10 items-center justify-center rounded-full border text-white transition duration-200 ${
                isActive
                  ? item.activeClass
                  : "border-white/15 bg-white/5 hover:-translate-y-[1px] hover:border-white/35 hover:bg-white/12"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
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
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
