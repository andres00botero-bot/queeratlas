import { supabase } from "@/lib/supabase";
import { inferTrafficCity, isTrackableTrafficPath, normalizeTrafficPath } from "@/lib/trafficCore";

const VISITOR_ID_KEY = "qa_visitor_id";
const SESSION_KEY = "qa_traffic_session_v2";
const LAST_EVENT_KEY = "qa_traffic_last_event_v2";
const LEGACY_VISIT_CACHE_KEY = "qa_visit_cache_v1";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const DUPLICATE_GUARD_MS = 1500;
const LEGACY_PAGE_SIZE = 1000;
const LEGACY_MAX_PAGES = 200;

export const EMPTY_TRAFFIC_SUMMARY = {
  ok: false,
  model: "none",
  dataQuality: "unavailable",
  missingTable: false,
  message: "",
  days: 30,
  timezone: "UTC",
  generatedAt: "",
  coverage: { firstEventAt: null, lastEventAt: null, storedPageviews: 0 },
  totals: {
    pageviews: 0,
    visitors: 0,
    sessions: 0,
    todayPageviews: 0,
    todayVisitors: 0,
    liveVisitors: 0,
    pagesPerSession: 0,
    bounceRate: 0,
    previousPageviews: 0,
    previousVisitors: 0,
    previousSessions: 0,
    previousPagesPerSession: 0,
    previousBounceRate: 0,
  },
  daily: [],
  topRoutes: [],
  topCities: [],
  topReferrers: [],
  topSources: [],
  devices: [],
  countries: [],
};

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeStorage(storageName = "localStorage") {
  if (typeof window === "undefined") return null;
  try {
    return window[storageName] || null;
  } catch {
    return null;
  }
}

function newUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (token) => {
    const random = Math.floor(Math.random() * 16);
    const value = token === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function isUuid(value = "") {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

function getVisitorId() {
  const storage = safeStorage("localStorage");
  if (!storage) return "";
  const existing = String(storage.getItem(VISITOR_ID_KEY) || "").trim();
  if (isUuid(existing)) return existing;
  const next = newUuid();
  storage.setItem(VISITOR_ID_KEY, next);
  return next;
}

function getSession() {
  const storage = safeStorage("localStorage");
  if (!storage) return { id: "", isNew: false };
  const now = Date.now();
  const current = safeParse(storage.getItem(SESSION_KEY), {});
  const currentId = String(current?.id || "");
  const lastActivity = Number(current?.lastActivity || 0);
  const isActive = isUuid(currentId) && now - lastActivity < SESSION_TIMEOUT_MS;
  const sessionId = isActive ? currentId : newUuid();
  storage.setItem(SESSION_KEY, JSON.stringify({ id: sessionId, lastActivity: now }));
  return { id: sessionId, isNew: !isActive };
}

function isImmediateDuplicate(route) {
  const storage = safeStorage("sessionStorage");
  if (!storage) return false;
  const now = Date.now();
  const previous = safeParse(storage.getItem(LAST_EVENT_KEY), {});
  storage.setItem(LAST_EVENT_KEY, JSON.stringify({ route, at: now }));
  return previous?.route === route && now - Number(previous?.at || 0) < DUPLICATE_GUARD_MS;
}

function shouldSkipEnvironment() {
  if (typeof window === "undefined") return true;
  const host = String(window.location?.hostname || "").toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".vercel.app")) return true;
  return navigator?.webdriver === true || navigator?.doNotTrack === "1";
}

function currentCampaign() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search || "");
  return {
    utmSource: String(params.get("utm_source") || "").slice(0, 160),
    utmMedium: String(params.get("utm_medium") || "").slice(0, 160),
    utmCampaign: String(params.get("utm_campaign") || "").slice(0, 200),
  };
}

function getUtcDay(offsetDays = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function isMissingRelationError(error) {
  const code = String(error?.code || "").toUpperCase();
  const text = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`.toLowerCase();
  return code === "42P01" || code === "PGRST205" || (text.includes("relation") && text.includes("does not exist"));
}

function isMissingTrafficSummaryRpc(error) {
  const code = String(error?.code || "").toUpperCase();
  const text = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return code === "42883" || code === "PGRST202" || text.includes("qa_admin_traffic_summary");
}

function markLegacyVisit(route) {
  const storage = safeStorage("localStorage");
  if (!storage) return false;
  const day = getUtcDay();
  const cache = safeParse(storage.getItem(LEGACY_VISIT_CACHE_KEY), {});
  const dayList = Array.isArray(cache[day]) ? cache[day] : [];
  if (dayList.includes(route)) return false;
  const next = { ...cache, [day]: [...dayList, route] };
  const recentDays = Object.keys(next).sort().slice(-8);
  const trimmed = Object.fromEntries(recentDays.map((key) => [key, next[key]]));
  storage.setItem(LEGACY_VISIT_CACHE_KEY, JSON.stringify(trimmed));
  return true;
}

async function trackLegacyPageVisit(route, visitorId) {
  if (!markLegacyVisit(route)) return { ok: true, skipped: "already-tracked-legacy" };
  const { error } = await supabase.from("qa_page_visits").upsert({
    visit_date: getUtcDay(),
    route,
    city: inferTrafficCity(route) || null,
    visitor_id: visitorId,
    last_seen_at: new Date().toISOString(),
  }, { onConflict: "visit_date,route,visitor_id" });
  return error ? { ok: false, error } : { ok: true, legacy: true };
}

export async function trackPageVisit({ pathname = "/" } = {}) {
  if (typeof window === "undefined") return { ok: false, skipped: "ssr" };
  const route = normalizeTrafficPath(pathname);
  if (!isTrackableTrafficPath(route)) return { ok: true, skipped: "private-route" };
  if (shouldSkipEnvironment()) return { ok: true, skipped: "privacy-or-non-production" };
  if (isImmediateDuplicate(route)) return { ok: true, skipped: "immediate-duplicate" };

  const visitorId = getVisitorId();
  const session = getSession();
  const sessionId = session.id;
  if (!visitorId || !sessionId) return { ok: false, skipped: "storage-unavailable" };

  const response = await fetch("/api/traffic/page-view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      eventId: newUuid(),
      route,
      visitorId,
      sessionId,
      referrer: session.isNew ? document.referrer || "" : window.location.origin,
      language: navigator.language || "",
      ...currentCampaign(),
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (response.status === 503 && result?.setupRequired) {
    return trackLegacyPageVisit(route, visitorId);
  }
  return response.ok ? { ok: true, ...result } : { ok: false, message: result?.message || "Tracking failed." };
}

function rangeStart(days, previous = false) {
  const offset = previous ? -(days * 2 - 1) : -(days - 1);
  return getUtcDay(offset);
}

function legacyWindow(rows, days, previous = false) {
  const start = rangeStart(days, previous);
  const end = previous ? rangeStart(days, false) : "9999-12-31";
  return rows.filter((row) => {
    const day = String(row?.visit_date || "");
    return day >= start && day < end;
  });
}

function legacyTotals(rows) {
  return {
    pageviews: rows.length,
    visitors: new Set(rows.map((row) => String(row?.visitor_id || "")).filter(Boolean)).size,
  };
}

function rankLegacy(rows, key, label) {
  const grouped = new Map();
  for (const row of rows) {
    const value = String(row?.[key] || "").trim();
    if (!value) continue;
    const current = grouped.get(value) || { views: 0, visitors: new Set() };
    current.views += 1;
    if (row?.visitor_id) current.visitors.add(String(row.visitor_id));
    grouped.set(value, current);
  }
  return [...grouped.entries()]
    .map(([value, stats]) => ({ [label]: value, pageviews: stats.views, visitors: stats.visitors.size }))
    .sort((a, b) => b.pageviews - a.pageviews)
    .slice(0, 12);
}

async function fetchAllLegacyRows(sinceKey) {
  const rows = [];
  for (let page = 0; page < LEGACY_MAX_PAGES; page += 1) {
    const from = page * LEGACY_PAGE_SIZE;
    const { data, error } = await supabase
      .from("qa_page_visits")
      .select("visit_date,route,city,visitor_id,last_seen_at,created_at")
      .gte("visit_date", sinceKey)
      .order("visit_date", { ascending: true })
      .range(from, from + LEGACY_PAGE_SIZE - 1);
    if (error) return { rows, error };
    rows.push(...(data || []));
    if ((data || []).length < LEGACY_PAGE_SIZE) break;
  }
  return { rows, error: null };
}

async function fetchLegacyTrafficSummary(days) {
  const { rows: rawRows, error } = await fetchAllLegacyRows(rangeStart(days, true));
  if (error) {
    return {
      ...EMPTY_TRAFFIC_SUMMARY,
      missingTable: isMissingRelationError(error),
      message: isMissingRelationError(error)
        ? "Traffic tables are not installed. Run supabase/traffic-analytics-v2.sql."
        : String(error.message || "Could not load traffic summary."),
    };
  }

  const rows = rawRows.filter((row) => isTrackableTrafficPath(row?.route));
  const current = legacyWindow(rows, days);
  const previous = legacyWindow(rows, days, true);
  const currentTotals = legacyTotals(current);
  const previousTotals = legacyTotals(previous);
  const todayRows = current.filter((row) => String(row?.visit_date || "") === getUtcDay());
  const byDay = new Map();
  for (const row of current) {
    const day = String(row?.visit_date || "");
    const value = byDay.get(day) || { pageviews: 0, visitors: new Set() };
    value.pageviews += 1;
    if (row?.visitor_id) value.visitors.add(String(row.visitor_id));
    byDay.set(day, value);
  }

  return {
    ...EMPTY_TRAFFIC_SUMMARY,
    ok: true,
    model: "legacy-v1",
    dataQuality: "unique-route-visits-only",
    message: "Legacy telemetry counts one browser + route per UTC day. Repeat views and sessions are unavailable.",
    days,
    generatedAt: new Date().toISOString(),
    coverage: {
      firstEventAt: rows[0]?.created_at || rows[0]?.visit_date || null,
      lastEventAt: rows.at(-1)?.last_seen_at || rows.at(-1)?.visit_date || null,
      storedPageviews: rows.length,
    },
    totals: {
      ...EMPTY_TRAFFIC_SUMMARY.totals,
      pageviews: currentTotals.pageviews,
      visitors: currentTotals.visitors,
      todayPageviews: todayRows.length,
      todayVisitors: legacyTotals(todayRows).visitors,
      previousPageviews: previousTotals.pageviews,
      previousVisitors: previousTotals.visitors,
    },
    daily: [...byDay.entries()].map(([day, value]) => ({
      day,
      pageviews: value.pageviews,
      visitors: value.visitors.size,
      sessions: 0,
    })),
    topRoutes: rankLegacy(current, "route", "route"),
    topCities: rankLegacy(current, "city", "city"),
  };
}

export async function fetchTrafficSummary(days = 30) {
  const safeDays = Math.min(90, Math.max(1, Number(days) || 30));
  const { data, error } = await supabase.rpc("qa_admin_traffic_summary", { p_days: safeDays });
  if (!error && data && typeof data === "object") {
    return { ...EMPTY_TRAFFIC_SUMMARY, ...data, ok: true, days: safeDays };
  }
  if (error && !isMissingTrafficSummaryRpc(error)) {
    return { ...EMPTY_TRAFFIC_SUMMARY, message: String(error.message || "Could not load traffic summary.") };
  }
  return fetchLegacyTrafficSummary(safeDays);
}
