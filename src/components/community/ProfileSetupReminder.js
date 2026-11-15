"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, ShieldCheck, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { PRIVACY_CHANGED, privacyCall } from "@/lib/memberPrivacy";

const REMINDER_DELAY_MS = 7 * 24 * 60 * 60 * 1000;

function dismissalKey(userId) {
  return `qa_profile_setup_reminder_dismissed:${userId}`;
}

function isDismissed(userId) {
  if (!userId || typeof window === "undefined") return false;
  const dismissedAt = Number(window.localStorage.getItem(dismissalKey(userId)) || 0);
  return Number.isFinite(dismissedAt) && dismissedAt + REMINDER_DELAY_MS > Date.now();
}

export default function ProfileSetupReminder() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const userId = user?.id || "";
  const [needsSetup, setNeedsSetup] = useState(false);
  const [dismissedForUserId, setDismissedForUserId] = useState("");

  const refresh = useCallback(async () => {
    if (!userId || isDismissed(userId)) {
      setNeedsSetup(false);
      return;
    }

    try {
      const state = await privacyCall("state");
      setNeedsSetup(!state?.profile?.joined_at && !state?.profile?.deletion_requested_at);
    } catch {
      // A reminder should never interrupt the product when privacy state is unavailable.
      setNeedsSetup(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isLoading || !userId) return;

    queueMicrotask(() => void refresh());
    window.addEventListener(PRIVACY_CHANGED, refresh);
    return () => window.removeEventListener(PRIVACY_CHANGED, refresh);
  }, [isLoading, refresh, userId]);

  if (!userId || !needsSetup || dismissedForUserId === userId || pathname === "/privacy-settings" || pathname.startsWith("/admin")) {
    return null;
  }

  const dismiss = () => {
    window.localStorage.setItem(dismissalKey(userId), String(Date.now()));
    setDismissedForUserId(userId);
  };

  return (
    <aside
      aria-label="Complete your member profile"
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-xl rounded-[24px] border border-cyan-100/25 bg-[#101827]/[0.98] p-4 text-[#F5F1E8] shadow-[0_24px_80px_rgba(0,0,0,.52)] backdrop-blur-xl sm:bottom-5 sm:p-5"
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-white/55 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
        aria-label="Remind me later"
      >
        <X size={17} aria-hidden="true" />
      </button>
      <div className="pr-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/72">Your membership</p>
        <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-white">Complete your member profile</h2>
        <p className="mt-2 text-sm leading-6 text-white/68">
          Choose an alias and decide exactly what, if anything, other members can see. Your profile stays private by default.
        </p>
      </div>
      <ul className="mt-3 grid gap-1.5 text-xs leading-5 text-white/70 sm:grid-cols-2">
        {[
          "Save places and build trip plans",
          "Share live venue and event updates",
          "Use community and member features",
          "Control privacy, visibility and contact settings",
        ].map((benefit) => (
          <li key={benefit} className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-cyan-200" aria-hidden="true" />{benefit}</li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href="/privacy-settings?onboarding=1"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#80D4C4] px-4 text-sm font-semibold text-[#0B1220] transition hover:bg-[#A4E6D8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
        >
          Complete profile
        </Link>
        <button type="button" onClick={dismiss} className="min-h-11 px-2 text-sm font-semibold text-cyan-100/82 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">
          Maybe later
        </button>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-white/48"><ShieldCheck size={14} aria-hidden="true" />Private by default</span>
      </div>
    </aside>
  );
}
