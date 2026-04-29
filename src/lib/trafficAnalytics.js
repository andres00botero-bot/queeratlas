import { supabase } from "@/lib/supabase";

const VISITOR_ID_KEY = "qa_visitor_id";
const VISIT_CACHE_KEY = "qa_visit_cache_v1";

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function normalizePathname(pathname = "/") {
  const raw = String(pathname || "/").trim();
  if (!raw) return "/";
  const [withoutQuery] = raw.split("?");
  const [withoutHash] = withoutQuery.split("#");
  const cleaned = withoutHash.startsWith("/") ? withoutHash : `/${withoutHash}`;
  return cleaned.replace(/\/{2,}/g, "/");
}

function inferCityFromPath(pathname = "/") {
  const parts = normalizePathname(pathname).split("/").filter(Boolean);
  if (parts.length === 0) return "";
  const candidate = String(parts[0] || "").toLowerCase().trim();
  if (!candidate) return "";
  if (!/^[a-z_]+$/.test(candidate)) return "";

  const staticRoots = new Set([
    "admin",
    "api",
    "cities",
    "community",
    "community-policy",
    "contribute",
    "events",
    "favorites",
    "gay-guide",
    "hbtq-guide",
    "messages",
    "now",
    "privacy",
    "queer-guide",
    "search",
    "terms",
  ]);

  return staticRoots.has(candidate) ? "" : candidate;
}

function getVisitorId() {
  if (typeof window === "undefined") return "";
  const existing = String(window.localStorage.getItem(VISITOR_ID_KEY) || "").trim();
  if (existing) return existing;

  const next =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  window.localStorage.setItem(VISITOR_ID_KEY, next);
  return next;
}

function markAndCheckVisit(pathname) {
  if (typeof window === "undefined") return false;
  const day = getTodayKey();
  const route = normalizePathname(pathname);
  const cache = safeParse(window.localStorage.getItem(VISIT_CACHE_KEY), {});
  const dayList = Array.isArray(cache[day]) ? cache[day] : [];
  if (dayList.includes(route)) return false;

  const nextDayList = [...dayList, route];
  const nextCache = { ...cache, [day]: nextDayList };

  // Keep only a short rolling window to cap localStorage usage.
  const recentDays = Object.keys(nextCache).sort().slice(-8);
  const trimmed = recentDays.reduce((acc, key) => {
    acc[key] = Array.isArray(nextCache[key]) ? nextCache[key] : [];
    return acc;
  }, {});

  window.localStorage.setItem(VISIT_CACHE_KEY, JSON.stringify(trimmed));
  return true;
}

function isMissingRelationError(error) {
  if (!error) return false;
  const code = String(error.code || "").toUpperCase();
  const text = `${error.message || ""} ${error.details || ""} ${error.hint || ""}`.toLowerCase();
  return code === "42P01" || text.includes("relation") && text.includes("does not exist");
}

export async function trackPageVisit({ pathname = "/", userId = "" } = {}) {
  if (typeof window === "undefined") return { ok: false, skipped: "ssr" };
  const route = normalizePathname(pathname);
  if (!route) return { ok: false, skipped: "empty-route" };

  const shouldTrackNow = markAndCheckVisit(route);
  if (!shouldTrackNow) return { ok: true, skipped: "already-tracked-today" };

  const visitorId = getVisitorId();
  if (!visitorId) return { ok: false, skipped: "no-visitor-id" };

  const payload = {
    visit_date: getTodayKey(),
    route,
    city: inferCityFromPath(route) || null,
    visitor_id: visitorId,
    user_id: String(userId || "").trim() || null,
    last_seen_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("qa_page_visits")
    .upsert(payload, { onConflict: "visit_date,route,visitor_id" });

  if (error) {
    if (isMissingRelationError(error)) {
      return { ok: false, skipped: "missing-table" };
    }
    return { ok: false, error };
  }

  return { ok: true };
}

export async function fetchTrafficSummary(days = 30) {
  const safeDays = Math.min(90, Math.max(1, Number(days) || 30));
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - (safeDays - 1));
  const sinceKey = sinceDate.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("qa_page_visits")
    .select("visit_date,route,city,visitor_id")
    .gte("visit_date", sinceKey)
    .order("visit_date", { ascending: true })
    .limit(50000);

  if (error) {
    if (isMissingRelationError(error)) {
      return {
        ok: false,
        missingTable: true,
        message: "Traffic table not found. Run supabase/traffic-visitors-v1.sql first.",
      };
    }
    return {
      ok: false,
      missingTable: false,
      message: String(error.message || "Could not load traffic summary."),
    };
  }

  const rows = Array.isArray(data) ? data : [];
  const nowDay = getTodayKey();
  const weekSince = new Date();
  weekSince.setDate(weekSince.getDate() - 6);
  const weekKey = weekSince.toISOString().slice(0, 10);

  const uniqueVisitors30 = new Set(rows.map((row) => String(row.visitor_id || "")).filter(Boolean)).size;
  const rows7 = rows.filter((row) => String(row.visit_date || "") >= weekKey);
  const uniqueVisitors7 = new Set(rows7.map((row) => String(row.visitor_id || "")).filter(Boolean)).size;
  const rowsToday = rows.filter((row) => String(row.visit_date || "") === nowDay);
  const uniqueVisitorsToday = new Set(
    rowsToday.map((row) => String(row.visitor_id || "")).filter(Boolean)
  ).size;

  const byRoute = {};
  const byCity = {};
  const byDayVisits = {};
  const byDayVisitors = {};

  rows.forEach((row) => {
    const route = String(row.route || "").trim();
    const city = String(row.city || "").trim();
    const day = String(row.visit_date || "").trim();
    const visitor = String(row.visitor_id || "").trim();

    if (route) byRoute[route] = (byRoute[route] || 0) + 1;
    if (city) byCity[city] = (byCity[city] || 0) + 1;
    if (day) {
      byDayVisits[day] = (byDayVisits[day] || 0) + 1;
      if (!byDayVisitors[day]) byDayVisitors[day] = new Set();
      if (visitor) byDayVisitors[day].add(visitor);
    }
  });

  const topRoutes = Object.entries(byRoute)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([route, visits]) => ({ route, visits }));

  const topCities = Object.entries(byCity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([city, visits]) => ({ city, visits }));

  const daily = Object.keys(byDayVisits)
    .sort()
    .map((day) => ({
      day,
      visits: byDayVisits[day] || 0,
      visitors: byDayVisitors[day] ? byDayVisitors[day].size : 0,
    }));

  return {
    ok: true,
    days: safeDays,
    totals: {
      visits30: rows.length,
      visitors30: uniqueVisitors30,
      visits7: rows7.length,
      visitors7: uniqueVisitors7,
      visitsToday: rowsToday.length,
      visitorsToday: uniqueVisitorsToday,
    },
    topRoutes,
    topCities,
    daily,
  };
}
