"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import {
  blockItem,
  getBlockedItems,
  getReports,
  saveBlockedItems,
  saveReports,
  syncModerationFromCloud,
} from "@/lib/moderation";
import PageOpeningState from "@/components/ui/PageOpeningState";
import { useActionToast } from "@/lib/useActionToast";
import ActionToast from "@/components/ui/ActionToast";

function timeAgo(value) {
  if (!value) return "Recently";
  const diffHours = Math.round((new Date() - new Date(value)) / 3600000);
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

function formatTitle(value = "") {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function AdminPage() {
  const router = useRouter();
  const { isMember, isLoading: isAuthLoading, user, memberName } = useAuth();
  const { toast, showToast } = useActionToast();

  const [isReady, setIsReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [stats, setStats] = useState({
    places: 0,
    events: 0,
    globalEvents: 0,
    openReports: 0,
    blockedItems: 0,
  });
  const [reports, setReports] = useState([]);
  const [blockedItems, setBlockedItems] = useState([]);
  const [warning, setWarning] = useState("");
  const [busyMap, setBusyMap] = useState({});

  const loadAdminState = useCallback(async () => {
    setWarning("");

    const [placesRes, eventsRes, globalEventsRes, moderationRes] = await Promise.all([
      supabase.from("places_with_stats").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("global_events").select("*", { count: "exact", head: true }),
      syncModerationFromCloud(),
    ]);

    const reportsRows = moderationRes?.reports || getReports();
    const blockedRows = moderationRes?.blockedItems || getBlockedItems();

    setReports(reportsRows);
    setBlockedItems(blockedRows);
    setStats({
      places: Number(placesRes.count || 0),
      events: Number(eventsRes.count || 0),
      globalEvents: Number(globalEventsRes.count || 0),
      openReports: reportsRows.filter((item) => String(item.status || "open") === "open").length,
      blockedItems: blockedRows.length,
    });

    if (moderationRes?.warning) {
      setWarning(moderationRes.warning);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isMember) {
      localStorage.setItem("qa_redirect", "/admin");
      localStorage.setItem("qa_post_login_target", "/admin");
      router.replace("/?join=true");
      setIsReady(true);
      return;
    }

    queueMicrotask(async () => {
      let adminAccess = false;
      try {
        const rpcRes = await supabase.rpc("qa_is_admin");
        adminAccess = Boolean(rpcRes.data);
      } catch {
        const email = String(user?.email || "").trim().toLowerCase();
        const { data, error } = await supabase
          .from("qa_admin_users")
          .select("email")
          .eq("email", email)
          .maybeSingle();
        adminAccess = !error && Boolean(data);
      }

      setIsAdmin(adminAccess);
      setAdminChecked(true);

      if (!adminAccess) {
        setIsReady(true);
        return;
      }

      await loadAdminState();
      setIsReady(true);
    });
  }, [isAuthLoading, isMember, loadAdminState, router, user?.email]);

  const openReports = useMemo(
    () => reports.filter((item) => String(item.status || "open") === "open"),
    [reports]
  );

  const setReportStatus = async (reportId, status) => {
    const targetId = String(reportId);
    setBusyMap((current) => ({ ...current, [targetId]: true }));
    try {
      const nextReports = reports.map((report) => {
        if (String(report.id) !== targetId) return report;
        return {
          ...report,
          status,
          resolvedAt: status === "resolved" ? new Date().toISOString() : null,
        };
      });
      setReports(nextReports);
      saveReports(nextReports);
      showToast(status === "resolved" ? "Report resolved." : "Report reopened.", {
        tone: "ok",
        duration: 1900,
      });
      await loadAdminState();
    } finally {
      setBusyMap((current) => ({ ...current, [targetId]: false }));
    }
  };

  const blockFromReport = async (report) => {
    if (!report) return;
    const targetId = String(report.id);
    setBusyMap((current) => ({ ...current, [targetId]: true }));
    try {
      blockItem({
        targetType: report.targetType,
        targetId: report.targetId,
        title: report.title,
        city: report.city,
      });
      const nextReports = reports.map((entry) => {
        if (String(entry.id) !== String(report.id)) return entry;
        return {
          ...entry,
          status: "resolved",
          resolvedAt: new Date().toISOString(),
        };
      });
      setReports(nextReports);
      saveReports(nextReports);
      showToast("Item blocked and report resolved.", { tone: "ok", duration: 2200 });
      await loadAdminState();
    } finally {
      setBusyMap((current) => ({ ...current, [targetId]: false }));
    }
  };

  const removeBlockedItem = async (itemId) => {
    const targetId = String(itemId);
    setBusyMap((current) => ({ ...current, [targetId]: true }));
    try {
      const next = blockedItems.filter((item) => String(item.id) !== targetId);
      setBlockedItems(next);
      saveBlockedItems(next);
      showToast("Blocked item removed.", { tone: "info", duration: 2000 });
      await loadAdminState();
    } finally {
      setBusyMap((current) => ({ ...current, [targetId]: false }));
    }
  };

  if (!isReady || !adminChecked) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <PageOpeningState
          title="Opening Admin Command Center..."
          subtitle="Checking admin access and syncing moderation state."
          tone="cyan"
        />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-xl rounded-3xl border border-rose-300/20 bg-rose-300/8 p-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-rose-100/80">Access denied</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">Admin only area</h1>
          <p className="mt-3 text-sm leading-6 text-white/70">
            This workspace is only available to verified admin accounts.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-5 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-white/85 transition hover:border-white/30"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#0f172a_0%,#050505_40%,#040404_100%)] px-6 py-8 text-white">
      <ActionToast toast={toast} />
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 overflow-hidden rounded-[34px] border border-cyan-300/16 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_80%_16%,rgba(167,139,250,0.14),transparent_28%),linear-gradient(135deg,rgba(17,24,39,0.95),rgba(10,10,10,0.99))] p-8 shadow-[0_34px_110px_rgba(0,0,0,0.40)]">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/80">Admin</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
            Command Center
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">
            Moderate reports, manage blocked items, and keep atlas quality stable from one place.
          </p>
          <p className="mt-3 text-xs text-cyan-100/70">
            Logged in as {memberName || user?.email || "Admin"}
          </p>
          {warning && (
            <div className="mt-4 inline-flex rounded-xl border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
              {warning}
            </div>
          )}
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-3xl border border-cyan-200/18 bg-cyan-200/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Places</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.places}</p>
          </article>
          <article className="rounded-3xl border border-violet-200/18 bg-violet-200/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-violet-100/75">Events</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.events}</p>
          </article>
          <article className="rounded-3xl border border-fuchsia-200/18 bg-fuchsia-200/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-100/75">Off-grid events</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.globalEvents}</p>
          </article>
          <article className="rounded-3xl border border-amber-200/18 bg-amber-200/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-100/75">Open reports</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.openReports}</p>
          </article>
          <article className="rounded-3xl border border-rose-200/18 bg-rose-200/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-rose-100/75">Blocked items</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.blockedItems}</p>
          </article>
        </section>

        <section className="mb-8 rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Workflow shortcuts</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Jump to admin surfaces</h2>
            </div>
            <button
              type="button"
              onClick={loadAdminState}
              className="rounded-full border border-cyan-200/25 bg-cyan-200/10 px-4 py-2 text-xs uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40"
            >
              Refresh
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={() => router.push("/contribute")}
              className="rounded-2xl border border-fuchsia-200/18 bg-fuchsia-200/10 p-4 text-left transition hover:border-fuchsia-200/35"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-fuchsia-100/75">Contribute</p>
              <p className="mt-1 text-sm font-semibold text-white">Quality queue & needs refresh</p>
            </button>
            <button
              type="button"
              onClick={() => router.push("/now")}
              className="rounded-2xl border border-cyan-200/18 bg-cyan-200/10 p-4 text-left transition hover:border-cyan-200/35"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-cyan-100/75">Queer world news</p>
              <p className="mt-1 text-sm font-semibold text-white">Publish and curate world feed</p>
            </button>
            <button
              type="button"
              onClick={() => router.push("/community")}
              className="rounded-2xl border border-emerald-200/18 bg-emerald-200/10 p-4 text-left transition hover:border-emerald-200/35"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-emerald-100/75">Community</p>
              <p className="mt-1 text-sm font-semibold text-white">Topics, safety reports, moderation</p>
            </button>
          </div>
        </section>

        <section className="mb-8 rounded-[30px] border border-amber-300/16 bg-[linear-gradient(180deg,rgba(45,31,10,0.85),rgba(10,10,10,0.98))] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-100/80">Safety inbox</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Open reports</h2>
            </div>
            <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs text-amber-100">
              {openReports.length} open
            </span>
          </div>
          <div className="space-y-3">
            {openReports.length > 0 ? (
              openReports.map((report) => (
                <article
                  key={report.id}
                  className="rounded-2xl border border-white/12 bg-black/25 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
                        {formatTitle(report.targetType)} · {report.city || "Global"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {report.title || "Reported content"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/70">{report.reason}</p>
                      <p className="mt-2 text-xs text-white/45">{timeAgo(report.createdAt)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={Boolean(busyMap[String(report.id)])}
                        onClick={() => blockFromReport(report)}
                        className="rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40 disabled:opacity-60"
                      >
                        Block
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(busyMap[String(report.id)])}
                        onClick={() => setReportStatus(report.id, "resolved")}
                        className="rounded-full border border-emerald-200/24 bg-emerald-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-200/40 disabled:opacity-60"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/14 px-4 py-8 text-sm text-white/55">
                No open reports right now.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[30px] border border-rose-300/16 bg-[linear-gradient(180deg,rgba(56,18,31,0.82),rgba(10,10,10,0.98))] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-rose-100/80">Blocklist</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Blocked items</h2>
            </div>
            <span className="rounded-full border border-rose-200/20 bg-rose-200/10 px-3 py-1 text-xs text-rose-100">
              {blockedItems.length} items
            </span>
          </div>
          <div className="space-y-3">
            {blockedItems.length > 0 ? (
              blockedItems.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/12 bg-black/25 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
                        {formatTitle(item.targetType)} · {item.city || "Global"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {item.title || "Blocked content"}
                      </p>
                      <p className="mt-2 text-xs text-white/45">Blocked {timeAgo(item.blockedAt)}</p>
                    </div>
                    <button
                      type="button"
                      disabled={Boolean(busyMap[String(item.id)])}
                      onClick={() => removeBlockedItem(item.id)}
                      className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40 disabled:opacity-60"
                    >
                      Unblock
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/14 px-4 py-8 text-sm text-white/55">
                Nothing blocked right now.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
