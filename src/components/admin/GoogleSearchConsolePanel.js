"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

function number(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(Number(value || 0));
}
function percent(value) {
  return `${(Number(value || 0) * 100).toFixed(1)}%`;
}

function shortUrl(value) {
  try {
    const url = new URL(value);
    return `${url.pathname}${url.search}`;
  } catch {
    return String(value || "");
  }
}

export default function GoogleSearchConsolePanel({ session }) {
  const [status, setStatus] = useState(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const accessToken = String(session?.access_token || "");
  const request = useCallback(async (url, options = {}) => {
    if (!accessToken) throw new Error("Admin session expired. Sign in again.");
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Search Console request failed");
    return payload;
  }, [accessToken]);

  const loadStatus = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const payload = await request("/api/admin/google-search-console");
      setStatus(payload.status || null);
      setNotice("");
    } catch (error) {
      setNotice(error?.message || "Could not load Search Console status");
    } finally {
      setLoading(false);
    }
  }, [accessToken, request]);

  useEffect(() => {
    const timer = window.setTimeout(loadStatus, 0);
    return () => window.clearTimeout(timer);
  }, [loadStatus]);

  const connect = async () => {
    setBusy("connect");
    setNotice("");
    try {
      const payload = await request("/api/admin/google-search-console/connect", { method: "POST", body: "{}" });
      window.location.assign(payload.authorizationUrl);
    } catch (error) {
      setNotice(error?.message || "Could not start Google connection");
      setBusy("");
    }
  };

  const sync = async (inspectLimit = 0) => {
    setBusy(inspectLimit ? "inspect" : "sync");
    setNotice("");
    try {
      const payload = await request("/api/admin/google-search-console", {
        method: "POST",
        body: JSON.stringify({ inspectLimit }),
      });
      setStatus(payload.status || null);
      setNotice(inspectLimit ? `Google data synced and ${payload?.result?.inspections?.inspected || 0} URLs inspected.` : "Google Search Console data synced.");
    } catch (error) {
      setNotice(error?.message || "Could not sync Google Search Console");
    } finally {
      setBusy("");
    }
  };

  const summary = status?.summary || {};
  const totals = summary?.totals || {};
  const zeroClickPages = Array.isArray(summary?.zeroClickPages) ? summary.zeroClickPages : [];
  const overlappingQueries = Array.isArray(summary?.overlappingQueries) ? summary.overlappingQueries : [];
  const coverageRows = useMemo(() => Object.entries(status?.inspections?.coverage || {}).sort((a, b) => b[1] - a[1]), [status]);

  return (
    <section className="rounded-2xl border border-cyan-200/18 bg-[linear-gradient(135deg,rgba(34,211,238,0.07),rgba(217,70,239,0.045))] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/70">Google integration</p>
          <h2 className="mt-1 text-xl font-semibold">Search Console</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/66">
            Read-only search performance, sitemap status and sampled URL index inspections. Tokens remain encrypted server-side.
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${status?.connected ? "border-emerald-200/25 bg-emerald-200/10 text-emerald-100" : "border-amber-200/25 bg-amber-200/10 text-amber-100"}`}>
          {loading ? "Checking…" : status?.connected ? "Connected" : "Not connected"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {!status?.connected ? (
          <button type="button" onClick={connect} disabled={Boolean(busy) || loading} className="rounded-full border border-cyan-100/30 bg-cyan-200/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-50 disabled:opacity-50">
            {busy === "connect" ? "Opening Google…" : "Connect Google Search Console"}
          </button>
        ) : (
          <>
            <button type="button" onClick={() => sync(0)} disabled={Boolean(busy)} className="rounded-full border border-emerald-100/28 bg-emerald-200/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-50 disabled:opacity-50">
              {busy === "sync" ? "Syncing…" : "Sync performance + sitemaps"}
            </button>
            <button type="button" onClick={() => sync(100)} disabled={Boolean(busy)} className="rounded-full border border-fuchsia-100/25 bg-fuchsia-200/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-fuchsia-50 disabled:opacity-50">
              {busy === "inspect" ? "Inspecting…" : "Inspect next 100 URLs"}
            </button>
            <button type="button" onClick={loadStatus} disabled={Boolean(busy)} className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/72 disabled:opacity-50">Refresh</button>
          </>
        )}
      </div>

      {notice || status?.lastError ? <p className="mt-3 rounded-xl border border-amber-200/16 bg-amber-200/[0.06] px-3 py-2 text-xs text-amber-100">{notice || status.lastError}</p> : null}

      {status?.connected ? (
        <>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {[
              ["Clicks", number(totals.clicks)],
              ["Impressions", number(totals.impressions)],
              ["CTR", percent(totals.ctr)],
              ["Avg position", number(totals.position)],
              ["URLs inspected", number(status?.inspections?.inspected)],
              ["Indexed PASS", number(status?.inspections?.indexed)],
            ].map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="text-[10px] uppercase tracking-[0.12em] text-white/45">{label}</p><p className="mt-1 text-lg font-semibold text-white/90">{value}</p></div>)}
          </div>
          <p className="mt-3 text-xs text-white/45">Property: {status.siteUrl} · Period: {summary?.period?.startDate || "—"} to {summary?.period?.endDate || "—"} · Last sync: {status.lastSyncedAt ? new Date(status.lastSyncedAt).toLocaleString() : "Never"}</p>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <h3 className="text-sm font-semibold">Impressions without clicks</h3>
              <div className="mt-3 max-h-64 overflow-auto">
                {zeroClickPages.length ? zeroClickPages.slice(0, 15).map((row) => <div key={row.page} className="border-t border-white/8 py-2 first:border-0"><p className="truncate text-xs text-white/72" title={row.page}>{shortUrl(row.page)}</p><p className="mt-0.5 text-[10px] text-white/42">{number(row.impressions)} impressions · position {number(row.position)}</p></div>) : <p className="text-xs text-white/45">Sync data to populate this list.</p>}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <h3 className="text-sm font-semibold">Queries reaching multiple pages</h3>
              <div className="mt-3 max-h-64 overflow-auto">
                {overlappingQueries.length ? overlappingQueries.slice(0, 15).map((row) => <div key={row.query} className="border-t border-white/8 py-2 first:border-0"><p className="text-xs text-white/76">{row.query}</p><p className="mt-0.5 text-[10px] text-white/42">{row.pages.length} pages · {number(row.impressions)} impressions</p></div>) : <p className="text-xs text-white/45">Sync data to identify possible query-page overlap.</p>}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4"><h3 className="text-sm font-semibold">Google coverage states</h3><div className="mt-3 space-y-2">{coverageRows.length ? coverageRows.slice(0, 12).map(([label, count]) => <div key={label} className="flex items-center justify-between gap-3 text-xs"><span className="text-white/62">{label}</span><strong className="text-white/86">{count}</strong></div>) : <p className="text-xs text-white/45">No inspected URLs yet.</p>}</div></div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4"><h3 className="text-sm font-semibold">Submitted sitemaps</h3><div className="mt-3 space-y-2">{status.sitemaps?.length ? status.sitemaps.map((item) => <div key={item.path} className="border-t border-white/8 py-2 first:border-0"><p className="truncate text-xs text-white/68">{item.path}</p><p className="mt-0.5 text-[10px] text-white/42">{item.errors || 0} errors · {item.warnings || 0} warnings{item.is_pending ? " · pending" : ""}</p></div>) : <p className="text-xs text-white/45">No sitemap response stored yet.</p>}</div></div>
          </div>
        </>
      ) : null}
    </section>
  );
}
