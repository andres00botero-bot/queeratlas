"use client";

import {
  Activity,
  Clock3,
  Eye,
  Globe2,
  Laptop,
  Minus,
  MousePointer2,
  Radio,
  Route,
  Smartphone,
  Tablet,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

const RANGE_OPTIONS = [7, 30, 90];
const numberFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

function formatNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? numberFormatter.format(number) : "0";
}

function formatDateTime(value) {
  if (!value) return "No v2 events yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function percentageDelta(current, previous) {
  const currentValue = Number(current || 0);
  const previousValue = Number(previous || 0);
  if (previousValue <= 0) return currentValue > 0 ? null : 0;
  return ((currentValue - previousValue) / previousValue) * 100;
}

function DeltaBadge({ current, previous, inverse = false }) {
  const delta = percentageDelta(current, previous);
  if (delta === null) {
    return <span className="text-[10px] uppercase tracking-[0.12em] text-white/42">new data</span>;
  }
  const isPositive = delta > 0;
  const isNeutral = Math.abs(delta) < 0.05;
  const good = inverse ? delta < 0 : delta > 0;
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${isNeutral ? "text-white/48" : good ? "text-emerald-300" : "text-rose-300"}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {isNeutral ? "0%" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`}
    </span>
  );
}

function MetricCard({ icon: Icon, label, value, note, current, previous, tone = "cyan", unavailable = false }) {
  const tones = {
    cyan: "from-cyan-300/16 via-sky-300/7 text-cyan-100 border-cyan-200/18",
    fuchsia: "from-fuchsia-300/16 via-rose-300/7 text-fuchsia-100 border-fuchsia-200/18",
    violet: "from-violet-300/16 via-indigo-300/7 text-violet-100 border-violet-200/18",
    emerald: "from-emerald-300/16 via-teal-300/7 text-emerald-100 border-emerald-200/18",
  };
  return (
    <article className={`relative overflow-hidden rounded-[22px] border bg-gradient-to-br ${tones[tone]} to-transparent p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-5`}>
      <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-current opacity-[0.05] blur-2xl" />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/52">{label}</p>
        <span className="rounded-xl border border-white/10 bg-black/25 p-2"><Icon className="h-4 w-4" aria-hidden="true" /></span>
      </div>
      <p className="mt-4 text-[2rem] font-semibold tracking-[-0.04em] text-white sm:text-[2.4rem]">
        {unavailable ? "—" : formatNumber(value)}
      </p>
      <div className="mt-2 flex min-h-5 items-center justify-between gap-2">
        <span className="text-[11px] text-white/44">{note}</span>
        {!unavailable && previous !== undefined ? <DeltaBadge current={current ?? value} previous={previous} /> : null}
      </div>
    </article>
  );
}

function fillDaily(rows = [], days = 30) {
  const map = new Map(rows.map((row) => [String(row?.day || "").slice(0, 10), row]));
  const result = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - offset);
    const day = date.toISOString().slice(0, 10);
    result.push({ day, pageviews: 0, visitors: 0, sessions: 0, ...(map.get(day) || {}) });
  }
  return result;
}

function TrafficTrendChart({ rows = [], days = 30, legacy = false }) {
  const daily = fillDaily(rows, days);
  const width = 900;
  const height = 260;
  const paddingX = 24;
  const paddingTop = 24;
  const paddingBottom = 34;
  const chartHeight = height - paddingTop - paddingBottom;
  const maxValue = Math.max(1, ...daily.map((row) => Number(row.pageviews || 0)));
  const step = daily.length > 1 ? (width - paddingX * 2) / (daily.length - 1) : 0;
  const points = daily.map((row, index) => {
    const x = paddingX + index * step;
    const y = paddingTop + chartHeight - (Number(row.pageviews || 0) / maxValue) * chartHeight;
    return { x, y, ...row };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${paddingX},${paddingTop + chartHeight} ${line} ${width - paddingX},${paddingTop + chartHeight}`;
  const labelIndexes = new Set([0, Math.floor((daily.length - 1) / 2), daily.length - 1]);

  return (
    <div className="mt-5 overflow-hidden rounded-[22px] border border-white/10 bg-black/25 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-sm font-semibold text-white">Daily signal</p>
          <p className="mt-0.5 text-[11px] text-white/42">{legacy ? "Unique browser–route combinations" : "Recorded pageviews, UTC"}</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-cyan-100/70">
          <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.8)]" /> pageviews
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-auto w-full" role="img" aria-label={`Traffic trend for the last ${days} days`}>
        <defs>
          <linearGradient id="qaTrafficArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="qaTrafficLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="55%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#f0abfc" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((position) => (
          <line key={position} x1={paddingX} x2={width - paddingX} y1={paddingTop + chartHeight * position} y2={paddingTop + chartHeight * position} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        ))}
        <polygon points={area} fill="url(#qaTrafficArea)" />
        <polyline points={line} fill="none" stroke="url(#qaTrafficLine)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => (
          <g key={point.day}>
            <circle cx={point.x} cy={point.y} r={daily.length <= 30 ? 4 : 2.5} fill="#050505" stroke="#a5f3fc" strokeWidth="2" />
            {labelIndexes.has(index) ? (
              <text x={point.x} y={height - 8} textAnchor={index === 0 ? "start" : index === daily.length - 1 ? "end" : "middle"} fill="rgba(255,255,255,0.42)" fontSize="15">
                {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${point.day}T00:00:00Z`))}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
}

function RankedList({ title, icon: Icon, rows = [], labelKey, emptyText, tone = "cyan", valueKey = "pageviews", metricLabel = "views" }) {
  const max = Math.max(1, ...rows.map((row) => Number(row?.[valueKey] || 0)));
  const barClass = tone === "fuchsia" ? "from-fuchsia-400/55 to-rose-300/20" : tone === "violet" ? "from-violet-400/55 to-indigo-300/20" : "from-cyan-400/55 to-sky-300/20";
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-white/68"><Icon className="h-4 w-4" aria-hidden="true" /></span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="mt-4 space-y-3">
        {rows.length ? rows.slice(0, 8).map((row, index) => {
          const label = String(row?.[labelKey] || "Unknown");
          const metricValue = Number(row?.[valueKey] || 0);
          return (
            <div key={`${label}-${index}`}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="min-w-0 truncate text-white/76" title={label}>{index + 1}. {label}</span>
                <span className="shrink-0 tabular-nums text-white/52">{formatNumber(metricValue)} {metricLabel} <span className="hidden text-white/30 sm:inline">· {formatNumber(row?.visitors)} visitors</span></span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className={`h-full rounded-full bg-gradient-to-r ${barClass}`} style={{ width: `${Math.max(4, (metricValue / max) * 100)}%` }} />
              </div>
            </div>
          );
        }) : <p className="py-6 text-center text-xs text-white/38">{emptyText}</p>}
      </div>
    </article>
  );
}

function getDeviceIcon(device) {
  if (device === "mobile") return Smartphone;
  if (device === "tablet") return Tablet;
  return Laptop;
}

function DeviceBreakdown({ rows = [] }) {
  const total = rows.reduce((sum, row) => sum + Number(row?.pageviews || 0), 0);
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4 sm:p-5">
      <p className="text-sm font-semibold text-white">Device mix</p>
      <div className="mt-4 space-y-3">
        {rows.length ? rows.map((row) => {
          const Icon = getDeviceIcon(row.device);
          const share = total ? (Number(row.pageviews || 0) / total) * 100 : 0;
          return (
            <div key={row.device} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
              <Icon className="h-4 w-4 text-cyan-100/65" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2 text-xs"><span className="capitalize text-white/72">{row.device}</span><span className="tabular-nums text-white/48">{share.toFixed(1)}%</span></div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300/70 to-fuchsia-300/50" style={{ width: `${share}%` }} /></div>
              </div>
            </div>
          );
        }) : <p className="py-6 text-center text-xs text-white/38">Available after Traffic v2 starts collecting.</p>}
      </div>
    </article>
  );
}

export default function AdminTrafficPanel({ summary, loading = false, days = 30, onDaysChange }) {
  const traffic = summary || {};
  const totals = traffic?.totals || {};
  const legacy = traffic?.model === "legacy-v1";
  const ready = Boolean(traffic?.ok);

  return (
    <section className="relative mb-8 overflow-hidden rounded-[30px] border border-cyan-200/14 bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.13),transparent_30%),radial-gradient(circle_at_88%_6%,rgba(217,70,239,0.12),transparent_32%),linear-gradient(180deg,rgba(8,20,32,0.98),rgba(5,5,8,0.99))] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.38)] sm:p-6 lg:p-7">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
      <header className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100/72">Traffic intelligence</p>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${legacy ? "border-amber-200/22 bg-amber-200/8 text-amber-100" : ready ? "border-emerald-200/22 bg-emerald-200/8 text-emerald-100" : "border-white/12 bg-white/5 text-white/48"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${legacy ? "bg-amber-300" : ready ? "bg-emerald-300 animate-pulse" : "bg-white/30"}`} />
              {legacy ? "Legacy signal" : ready ? "First-party live" : "Setup needed"}
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">See how the Atlas is actually moving.</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
            {legacy
              ? "Historical telemetry is directional: one identified browser per route and UTC day. Traffic v2 adds real pageviews, sessions, acquisition and geography without pretending browsers equal people."
              : "Privacy-conscious first-party pageviews, 30-minute sessions, route performance and acquisition context. Admin and private routes are excluded automatically."}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <div className="inline-flex rounded-2xl border border-white/10 bg-black/30 p-1">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onDaysChange?.(option)}
                disabled={loading}
                aria-pressed={days === option}
                aria-label={`Show traffic for the last ${option} days`}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition sm:px-4 ${days === option ? "bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.14)]" : "text-white/52 hover:bg-white/7 hover:text-white"}`}
              >
                {option}d
              </button>
            ))}
          </div>
          <p className="px-1 text-[10px] text-white/36">UTC · refreshed {formatDateTime(traffic?.generatedAt)}</p>
        </div>
      </header>

      {!ready ? (
        <div className="mt-6 rounded-[22px] border border-amber-200/20 bg-amber-200/[0.07] p-5">
          <p className="text-sm font-semibold text-amber-100">Traffic v2 is not connected yet</p>
          <p className="mt-2 text-xs leading-6 text-amber-50/64">Run <code className="rounded bg-black/30 px-1.5 py-1 text-amber-100">supabase/traffic-analytics-v2.sql</code>. Until then the dashboard will use the legacy table when available.</p>
          {traffic?.message ? <p className="mt-2 text-[11px] text-amber-100/48">{traffic.message}</p> : null}
        </div>
      ) : (
        <div className={`mt-6 transition-opacity ${loading ? "opacity-45" : "opacity-100"}`} aria-busy={loading}>
          {legacy ? (
            <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200/18 bg-amber-200/[0.06] px-4 py-3 text-xs leading-5 text-amber-50/68">
              <Activity className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" aria-hidden="true" />
              <p><strong className="text-amber-100">Do not read these as exact pageviews.</strong> Repeat views of the same route on the same day are missing, sessions are unavailable, and historic admin traffic may be included.</p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <MetricCard icon={Eye} label={legacy ? "Unique route visits" : "Pageviews"} value={totals.pageviews} current={totals.pageviews} previous={totals.previousPageviews} note={`${days}-day window`} tone="cyan" />
            <MetricCard icon={Users} label="Identified browsers" value={totals.visitors} current={totals.visitors} previous={totals.previousVisitors} note="Not individual people" tone="fuchsia" />
            <MetricCard icon={Clock3} label="Sessions" value={totals.sessions} current={totals.sessions} previous={totals.previousSessions} note="30 min inactivity" tone="violet" unavailable={legacy} />
            <MetricCard icon={Radio} label="Live now" value={totals.liveVisitors} note="Last 5 minutes" tone="emerald" unavailable={legacy} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Today", value: legacy ? totals.todayPageviews : `${formatNumber(totals.todayPageviews)} views`, sub: `${formatNumber(totals.todayVisitors)} browsers` },
              { label: "Pages / session", value: legacy ? "—" : formatNumber(totals.pagesPerSession), sub: "Average depth" },
              { label: "Single-page sessions", value: legacy ? "—" : `${formatNumber(totals.bounceRate)}%`, sub: "Context, not a verdict" },
              { label: "Stored since", value: traffic?.coverage?.firstEventAt ? formatDateTime(traffic.coverage.firstEventAt) : "Starting now", sub: `${formatNumber(traffic?.coverage?.storedPageviews)} stored signals` },
            ].map((item) => (
              <article key={item.label} className="rounded-2xl border border-white/8 bg-black/20 px-3.5 py-3.5 sm:px-4">
                <p className="text-[9px] uppercase tracking-[0.16em] text-white/38">{item.label}</p>
                <p className="mt-1.5 truncate text-sm font-semibold text-white/84 sm:text-base">{item.value}</p>
                <p className="mt-1 text-[10px] text-white/34">{item.sub}</p>
              </article>
            ))}
          </div>

          <TrafficTrendChart rows={traffic.daily} days={days} legacy={legacy} />

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <RankedList title="Top routes" icon={Route} rows={traffic.topRoutes || []} labelKey="route" emptyText="No route traffic in this period." />
            <RankedList title="City demand" icon={Globe2} rows={traffic.topCities || []} labelKey="city" emptyText="No city-level traffic in this period." tone="fuchsia" />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <RankedList title="Acquisition sources" icon={MousePointer2} rows={traffic.topSources || []} labelKey="source" valueKey="sessions" metricLabel="sessions" emptyText="Available after Traffic v2 starts collecting." tone="violet" />
            <RankedList title="Landing referrers" icon={Activity} rows={traffic.topReferrers || []} labelKey="referrer" valueKey="sessions" metricLabel="sessions" emptyText="Available after Traffic v2 starts collecting." />
            <DeviceBreakdown rows={traffic.devices || []} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <RankedList title="Country signal" icon={Globe2} rows={traffic.countries || []} labelKey="country" emptyText="Country data appears on Vercel production traffic." tone="fuchsia" />
            <div className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-4 text-[10px] leading-5 text-white/38 lg:max-w-xs">
              <p className="font-semibold uppercase tracking-[0.14em] text-white/52">Metric definitions</p>
              <p className="mt-2"><strong className="text-white/60">Browser</strong> = one pseudonymous local browser ID.</p>
              <p><strong className="text-white/60">Session</strong> = activity grouped until 30 minutes of inactivity.</p>
              <p><strong className="text-white/60">Pageview</strong> = one accepted public route render. Bots, previews and admin routes are filtered.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
