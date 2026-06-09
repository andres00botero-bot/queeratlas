"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { resolveAdminAccess } from "@/lib/adminAccess";
import {
  clearWebVitalSamples,
  readWebVitalSamples,
  summarizeWebVitalSamples,
} from "@/lib/telemetry/webVitalsStore";

const CORE_WEB_VITAL_TARGETS = {
  lcpP75: { label: "LCP p75", good: 2500, unit: "ms" },
  inpP75: { label: "INP p75", good: 200, unit: "ms" },
  clsP75: { label: "CLS p75", good: 0.1, unit: "" },
};

function formatMetric(value, unit = "") {
  if (value === null || value === undefined) return "-";
  if (unit === "ms") return `${Math.round(value)} ms`;
  if (unit === "") return `${Number(value).toFixed(3)}`;
  return `${value} ${unit}`.trim();
}

function evaluateMetric(value, threshold, lowerIsBetter = true) {
  if (value === null || value === undefined) return "no-data";
  if (lowerIsBetter) {
    return value <= threshold ? "good" : "needs-work";
  }
  return value >= threshold ? "good" : "needs-work";
}

function isMissingTableError(error) {
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  return (
    code === "42p01" ||
    code === "pgrst205" ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}

function getDateDaysAgo(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function summarizeDbDailyVitals(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { rows: [], latestDay: "" };
  }

  const latestDay = String(rows[0]?.day || "");
  const todayRows = rows.filter((row) => String(row.day || "") === latestDay);
  const mapByRoute = new Map();

  for (const row of todayRows) {
    const route = String(row.route || "/");
    if (!mapByRoute.has(route)) {
      mapByRoute.set(route, {
        route,
        samples: 0,
        lcpP75: null,
        inpP75: null,
        clsP75: null,
        ttfbP75: null,
        fcpP75: null,
      });
    }

    const current = mapByRoute.get(route);
    const metricName = String(row.metric_name || "").toUpperCase();
    const metricValue = row.p75 === null || row.p75 === undefined ? null : Number(row.p75);
    const sampleValue = Number(row.samples || 0);
    current.samples += Number.isFinite(sampleValue) ? sampleValue : 0;

    if (metricName === "LCP") current.lcpP75 = metricValue;
    if (metricName === "INP") current.inpP75 = metricValue;
    if (metricName === "CLS") current.clsP75 = metricValue;
    if (metricName === "TTFB") current.ttfbP75 = metricValue;
    if (metricName === "FCP") current.fcpP75 = metricValue;
  }

  return {
    rows: [...mapByRoute.values()].sort((a, b) => b.samples - a.samples),
    latestDay,
  };
}

export default function SeoObservabilityPage() {
  const router = useRouter();
  const { user, session, isLoading: isAuthLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const [localSamples, setLocalSamples] = useState(() => readWebVitalSamples());
  const [lastLoadedAt, setLastLoadedAt] = useState(() => new Date().toISOString());

  const [dbSummaryRows, setDbSummaryRows] = useState([]);
  const [dbLatestDay, setDbLatestDay] = useState("");
  const [crawlerRows, setCrawlerRows] = useState([]);
  const [snapshotLatest, setSnapshotLatest] = useState(null);
  const [snapshotChecks, setSnapshotChecks] = useState([]);
  const [snapshotHistory, setSnapshotHistory] = useState([]);
  const [snapshotNotice, setSnapshotNotice] = useState("");
  const [dbNotice, setDbNotice] = useState("");
  const [dbReady, setDbReady] = useState(false);
  const [creatingSnapshot, setCreatingSnapshot] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkAccess() {
      if (!user?.email) {
        if (active) {
          setIsAdmin(false);
          setCheckingAccess(false);
        }
        return;
      }
      const { isAdmin: nextIsAdmin } = await resolveAdminAccess({ email: user.email });
      if (!active) return;
      setIsAdmin(Boolean(nextIsAdmin));
      setCheckingAccess(false);
    }
    checkAccess();
    return () => {
      active = false;
    };
  }, [user?.email]);

  const refreshLocalSnapshot = useCallback(() => {
    setLocalSamples(readWebVitalSamples());
    setLastLoadedAt(new Date().toISOString());
  }, []);

  const loadDbTelemetry = useCallback(async () => {
    if (!isAdmin) return;

    const fromDay = getDateDaysAgo(30);
    setDbNotice("");
    setDbReady(false);

    const [{ data: dailyRows, error: dailyError }, { data: crawlerData, error: crawlerError }] =
      await Promise.all([
        supabase
          .from("qa_seo_web_vitals_daily")
          .select("day,route,metric_name,samples,p75")
          .gte("day", fromDay)
          .order("day", { ascending: false })
          .limit(5000),
        supabase
          .from("qa_seo_crawler_hits_daily")
          .select("day,crawler_key,path,hits,last_seen_at")
          .gte("day", fromDay)
          .order("day", { ascending: false })
          .order("hits", { ascending: false })
          .limit(200),
      ]);

    if (dailyError || crawlerError) {
      const error = dailyError || crawlerError;
      if (isMissingTableError(error)) {
        setDbNotice("Telemetry tables are not deployed yet. Run supabase/seo-telemetry-v1.sql.");
      } else {
        setDbNotice(error?.message || "Could not load telemetry from Supabase.");
      }
      setDbSummaryRows([]);
      setCrawlerRows([]);
      setDbReady(false);
      return;
    }

    const summary = summarizeDbDailyVitals(dailyRows || []);
    setDbSummaryRows(summary.rows);
    setDbLatestDay(summary.latestDay);
    setCrawlerRows(Array.isArray(crawlerData) ? crawlerData : []);
    setDbReady(true);
  }, [isAdmin]);

  const loadSeoSnapshots = useCallback(async () => {
    if (!isAdmin) return;
    setSnapshotNotice("");

    const { data: snapshots, error: snapshotsError } = await supabase
      .from("qa_seo_health_snapshots")
      .select("id,status_summary,checks_passed,checks_warn,checks_failed,snapshot_meta,created_at")
      .order("created_at", { ascending: false })
      .limit(6);

    if (snapshotsError) {
      if (isMissingTableError(snapshotsError)) {
        setSnapshotNotice("SEO snapshot tables are not deployed yet. Run supabase/seo-health-snapshot-v1.sql.");
      } else {
        setSnapshotNotice(snapshotsError?.message || "Could not load SEO health snapshots.");
      }
      setSnapshotLatest(null);
      setSnapshotChecks([]);
      setSnapshotHistory([]);
      return;
    }

    const history = Array.isArray(snapshots) ? snapshots : [];
    const latest = history[0] || null;
    setSnapshotLatest(latest);
    setSnapshotHistory(history);

    if (!latest?.id) {
      setSnapshotChecks([]);
      setSnapshotNotice("No SEO snapshots recorded yet. Use admin API to create first snapshot.");
      return;
    }

    const { data: checksData, error: checksError } = await supabase
      .from("qa_seo_health_snapshot_checks")
      .select("check_key,status,score,evidence,recommendation,created_at")
      .eq("snapshot_id", latest.id)
      .order("check_key", { ascending: true });

    if (checksError) {
      setSnapshotChecks([]);
      setSnapshotNotice(checksError?.message || "Could not load snapshot checks.");
      return;
    }

    setSnapshotChecks(Array.isArray(checksData) ? checksData : []);
  }, [isAdmin]);

  const createSeoSnapshot = useCallback(async () => {
    if (!isAdmin || creatingSnapshot) return;
    setCreatingSnapshot(true);
    setSnapshotNotice("");

    try {
      let accessToken = String(session?.access_token || "");
      if (!accessToken) {
        const { data } = await supabase.auth.getSession();
        accessToken = String(data?.session?.access_token || "");
      }
      if (!accessToken) {
        setSnapshotNotice("Your admin session expired. Sign in again to create a snapshot.");
        return;
      }

      const response = await fetch("/api/admin/seo-health-snapshot", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) {
        setSnapshotNotice(result?.error || "Could not create SEO health snapshot.");
        return;
      }

      await Promise.all([loadSeoSnapshots(), loadDbTelemetry()]);
      setLastLoadedAt(new Date().toISOString());
    } catch {
      setSnapshotNotice("Could not create SEO health snapshot.");
    } finally {
      setCreatingSnapshot(false);
    }
  }, [
    creatingSnapshot,
    isAdmin,
    loadDbTelemetry,
    loadSeoSnapshots,
    session,
  ]);

  useEffect(() => {
    if (!isAdmin) return;
    const timer = window.setTimeout(() => {
      loadDbTelemetry();
      loadSeoSnapshots();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isAdmin, loadDbTelemetry, loadSeoSnapshots]);

  const localSummary = useMemo(() => summarizeWebVitalSamples(localSamples), [localSamples]);
  const summaryRows = dbReady ? dbSummaryRows : localSummary;
  const routeCount = summaryRows.length;
  const sampleCount = dbReady
    ? summaryRows.reduce((total, row) => total + Number(row.samples || 0), 0)
    : localSamples.length;

  if (isAuthLoading || checkingAccess) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-8 text-white">
        <p className="text-sm text-white/72">Checking admin access...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-8 text-white">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/15 bg-white/[0.04] p-6">
          <h1 className="text-2xl font-semibold">Admin Only</h1>
          <p className="mt-2 text-sm text-white/75">
            SEO observability dashboard is restricted to admin accounts.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-5 rounded-full border border-white/20 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10"
          >
            Back to home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-2xl border border-white/12 bg-white/[0.03] p-5">
          <h1 className="text-2xl font-semibold tracking-tight">SEO Observability Baseline</h1>
          <p className="mt-2 text-sm text-white/75">
            Source: {dbReady ? `Supabase daily telemetry (${dbLatestDay || "latest day"})` : "Local fallback snapshot"}.
            Client beacons use <code>/api/telemetry/web-vitals</code> when telemetry flag is enabled.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={createSeoSnapshot}
              disabled={creatingSnapshot}
              className="rounded-full border border-emerald-200/30 bg-emerald-200/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100 disabled:opacity-55"
            >
              {creatingSnapshot ? "Creating..." : "Create health snapshot"}
            </button>
            <button
              type="button"
              onClick={() => {
                refreshLocalSnapshot();
                loadDbTelemetry();
                loadSeoSnapshots();
              }}
              className="rounded-full border border-cyan-200/30 bg-cyan-200/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100"
            >
              Refresh data
            </button>
            <button
              type="button"
              onClick={() => {
                clearWebVitalSamples();
                refreshLocalSnapshot();
              }}
              className="rounded-full border border-rose-200/30 bg-rose-200/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-rose-100"
            >
              Clear Local Samples
            </button>
            <span className="text-xs text-white/60">
              Routes tracked: {routeCount} | Samples: {sampleCount}
            </span>
            <span className="text-xs text-white/50">Loaded: {new Date(lastLoadedAt).toLocaleString()}</span>
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-full border border-white/16 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/78"
            >
              Back to admin
            </button>
          </div>
          {dbNotice ? (
            <p className="mt-3 text-xs text-amber-300">{dbNotice}</p>
          ) : null}
        </header>

        <section className="rounded-2xl border border-white/12 bg-white/[0.03] p-5">
          <h2 className="text-lg font-semibold">Core Web Vitals by Route (p75)</h2>
          <p className="mt-1 text-xs text-white/62">
            Targets: LCP &lt;= 2500ms, INP &lt;= 200ms, CLS &lt;= 0.1.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-white/58">
                <tr>
                  <th className="px-3 py-2">Route</th>
                  <th className="px-3 py-2">Samples</th>
                  <th className="px-3 py-2">LCP p75</th>
                  <th className="px-3 py-2">INP p75</th>
                  <th className="px-3 py-2">CLS p75</th>
                  <th className="px-3 py-2">TTFB p75</th>
                  <th className="px-3 py-2">FCP p75</th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-white/55" colSpan={7}>
                      No vitals captured yet. Visit /, /cities, /events, /now, /search and a city page.
                    </td>
                  </tr>
                ) : (
                  summaryRows.map((row) => {
                    const lcpStatus = evaluateMetric(row.lcpP75, CORE_WEB_VITAL_TARGETS.lcpP75.good);
                    const inpStatus = evaluateMetric(row.inpP75, CORE_WEB_VITAL_TARGETS.inpP75.good);
                    const clsStatus = evaluateMetric(row.clsP75, CORE_WEB_VITAL_TARGETS.clsP75.good);
                    return (
                      <tr key={row.route} className="border-t border-white/8">
                        <td className="px-3 py-3 font-medium text-white/90">{row.route}</td>
                        <td className="px-3 py-3 text-white/80">{row.samples}</td>
                        <td className={`px-3 py-3 ${lcpStatus === "good" ? "text-emerald-300" : "text-amber-300"}`}>
                          {formatMetric(row.lcpP75, "ms")}
                        </td>
                        <td className={`px-3 py-3 ${inpStatus === "good" ? "text-emerald-300" : "text-amber-300"}`}>
                          {formatMetric(row.inpP75, "ms")}
                        </td>
                        <td className={`px-3 py-3 ${clsStatus === "good" ? "text-emerald-300" : "text-amber-300"}`}>
                          {formatMetric(row.clsP75)}
                        </td>
                        <td className="px-3 py-3 text-white/80">{formatMetric(row.ttfbP75, "ms")}</td>
                        <td className="px-3 py-3 text-white/80">{formatMetric(row.fcpP75, "ms")}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-white/12 bg-white/[0.03] p-5">
          <h2 className="text-lg font-semibold">Crawler User-Agent Hits (Daily)</h2>
          <p className="mt-1 text-sm text-white/72">
            Captured via proxy when <code>QA_SEO_TELEMETRY=1</code>. These are observed crawler
            user-agent signals and should not be treated as independently verified bot identity.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-white/58">
                <tr>
                  <th className="px-3 py-2">Day</th>
                  <th className="px-3 py-2">Crawler</th>
                  <th className="px-3 py-2">Path</th>
                  <th className="px-3 py-2">Hits</th>
                  <th className="px-3 py-2">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {crawlerRows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-white/55" colSpan={5}>
                      No crawler user-agent telemetry captured yet.
                    </td>
                  </tr>
                ) : (
                  crawlerRows.map((row, index) => (
                    <tr key={`${row.day}-${row.crawler_key}-${row.path}-${index}`} className="border-t border-white/8">
                      <td className="px-3 py-3 text-white/90">{row.day}</td>
                      <td className="px-3 py-3 text-cyan-100">{row.crawler_key}</td>
                      <td className="px-3 py-3 text-white/80">{row.path}</td>
                      <td className="px-3 py-3 text-white/85">{row.hits}</td>
                      <td className="px-3 py-3 text-white/65">
                        {row.last_seen_at ? new Date(row.last_seen_at).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-white/12 bg-white/[0.03] p-5">
          <h2 className="text-lg font-semibold">SEO Health Snapshot (PASS/WARN/FAIL)</h2>
          <p className="mt-1 text-sm text-white/72">
            Snapshot history is stored in Supabase and summarizes sitemap, canonical, robots, CWV, crawler activity and indexability checks.
          </p>
          {snapshotNotice ? (
            <p className="mt-2 text-xs text-amber-300">{snapshotNotice}</p>
          ) : null}

          {snapshotLatest ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-4">
              <p className="text-sm text-white/85">
                Latest:{" "}
                <span className="font-semibold uppercase tracking-[0.08em] text-cyan-100">
                  {snapshotLatest.status_summary}
                </span>{" "}
                | pass {snapshotLatest.checks_passed} | warn {snapshotLatest.checks_warn} | fail {snapshotLatest.checks_failed}
              </p>
              <p className="mt-1 text-xs text-white/55">
                Created: {snapshotLatest.created_at ? new Date(snapshotLatest.created_at).toLocaleString() : "-"}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/55">No snapshot recorded yet.</p>
          )}

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-white/58">
                <tr>
                  <th className="px-3 py-2">Check</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {snapshotChecks.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-white/55" colSpan={4}>
                      No check rows available.
                    </td>
                  </tr>
                ) : (
                  snapshotChecks.map((check, index) => (
                    <tr key={`${check.check_key}-${index}`} className="border-t border-white/8">
                      <td className="px-3 py-3 text-white/90">{check.check_key}</td>
                      <td
                        className={`px-3 py-3 font-semibold uppercase tracking-[0.08em] ${
                          check.status === "pass"
                            ? "text-emerald-300"
                            : check.status === "warn"
                              ? "text-amber-300"
                              : "text-rose-300"
                        }`}
                      >
                        {check.status}
                      </td>
                      <td className="px-3 py-3 text-white/75">{check.score}</td>
                      <td className="px-3 py-3 text-white/70">{check.recommendation}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {snapshotHistory.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.12em] text-white/55">Recent Snapshot Runs</p>
              <div className="mt-2 space-y-1.5 text-xs text-white/68">
                {snapshotHistory.map((entry, index) => (
                  <p key={`${entry.id}-${index}`}>
                    {entry.created_at ? new Date(entry.created_at).toLocaleString() : "-"} |{" "}
                    <span className="uppercase">{entry.status_summary}</span> | pass {entry.checks_passed} warn {entry.checks_warn} fail {entry.checks_failed}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
