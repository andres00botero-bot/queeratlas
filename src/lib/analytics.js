import { supabase } from "@/lib/supabase";

const KPI_EVENTS_KEY = "qa_kpi_events";
const KPI_EVENTS_TABLE = "qa_kpi_events";
const MAX_KPI_EVENTS = 4000;

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function createEmptySummary(rangeDays) {
  return {
    rangeDays,
    totalEvents: 0,
    activeMembers: 0,
    counts: {
      loginCompleted: 0,
      signupCompleted: 0,
      favoriteSaved: 0,
      planSaved: 0,
      reviewSubmitted: 0,
      placeAdded: 0,
      eventAdded: 0,
      reportSubmitted: 0,
      searchOpened: 0,
    },
    topCities: [],
    lastEventAt: "",
  };
}

function readEvents() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(KPI_EVENTS_KEY), []);
}

function writeEvents(rows) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KPI_EVENTS_KEY, JSON.stringify(rows));
}

function normalizeEventRow(row) {
  return {
    id: String(row?.id || ""),
    name: String(row?.name || ""),
    createdAt: String(row?.createdAt || row?.created_at || ""),
    city: String(row?.city || ""),
    targetType: String(row?.targetType || row?.target_type || ""),
    targetId: String(row?.targetId || row?.target_id || ""),
    memberKey: String(row?.memberKey || row?.member_key || ""),
    meta: row?.meta && typeof row.meta === "object" ? row.meta : {},
  };
}

function summarizeEvents(rows = [], rangeDays = 7) {
  const safeRange = Number.isFinite(Number(rangeDays)) ? Number(rangeDays) : 7;
  const since = Date.now() - safeRange * 24 * 60 * 60 * 1000;
  const normalizedRows = Array.isArray(rows) ? rows.map(normalizeEventRow) : [];
  const events = normalizedRows.filter((item) => {
    const ts = new Date(item.createdAt || "").getTime();
    return Number.isFinite(ts) && ts >= since;
  });

  if (events.length === 0) {
    return createEmptySummary(safeRange);
  }

  const counts = events.reduce((acc, item) => {
    const key = String(item.name || "unknown");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const activeMembers = new Set(
    events.map((item) => String(item.memberKey || "").trim()).filter(Boolean)
  ).size;

  const citySignal = events.reduce((acc, item) => {
    const city = String(item.city || "").trim();
    if (!city) return acc;
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  const topCities = Object.entries(citySignal)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([city, count]) => ({ city, count }));

  return {
    rangeDays: safeRange,
    totalEvents: events.length,
    activeMembers,
    counts: {
      loginCompleted: Number(counts.login_completed || 0),
      signupCompleted: Number(counts.signup_completed || 0),
      favoriteSaved: Number(counts.favorite_saved || 0),
      planSaved: Number(counts.plan_saved || 0),
      reviewSubmitted: Number(counts.review_submitted || 0),
      placeAdded: Number(counts.place_added || 0),
      eventAdded: Number(counts.event_added || 0),
      reportSubmitted: Number(counts.report_submitted || 0),
      searchOpened: Number(counts.search_opened || 0),
    },
    topCities,
    lastEventAt: events[events.length - 1].createdAt,
  };
}

function isMissingTableError(error) {
  if (!error) return false;
  const code = String(error.code || "");
  const message = String(error.message || "").toLowerCase();
  return code === "42P01" || code === "PGRST205" || message.includes("does not exist");
}

function isPermissionError(error) {
  if (!error) return false;
  const code = String(error.code || "");
  const message = String(error.message || "").toLowerCase();
  return code === "42501" || message.includes("permission denied");
}

export function trackKpiEvent(name, payload = {}) {
  if (typeof window === "undefined" || !name) return;

  const next = {
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `kpi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: String(name),
    createdAt: new Date().toISOString(),
    city: String(payload.city || ""),
    targetType: String(payload.targetType || ""),
    targetId: String(payload.targetId || ""),
    memberKey: String(payload.memberKey || ""),
    meta: payload.meta && typeof payload.meta === "object" ? payload.meta : {},
  };

  const existing = readEvents();
  const merged = [...existing, next].slice(-MAX_KPI_EVENTS);
  writeEvents(merged);

  queueMicrotask(async () => {
    try {
      await supabase.from(KPI_EVENTS_TABLE).insert({
        name: next.name,
        city: next.city || null,
        target_type: next.targetType || null,
        target_id: next.targetId || null,
        member_key: next.memberKey || null,
        meta: next.meta,
        client_created_at: next.createdAt,
      });
    } catch {
      // Local buffer already contains the event.
    }
  });
}

export function getInitialKpiSummary(days = 7) {
  return summarizeEvents(readEvents(), days);
}

export async function getKpiSummary(days = 7) {
  const safeDays = Number.isFinite(Number(days)) ? Number(days) : 7;
  const localSummary = summarizeEvents(readEvents(), safeDays);

  try {
    const sinceIso = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from(KPI_EVENTS_TABLE)
      .select("id,name,created_at,city,target_type,target_id,member_key,meta,client_created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: true })
      .limit(MAX_KPI_EVENTS);

    if (error) {
      if (isMissingTableError(error) || isPermissionError(error)) {
        return localSummary;
      }
      return localSummary;
    }

    if (!Array.isArray(data) || data.length === 0) {
      return localSummary;
    }

    const cloudRows = data.map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: row.client_created_at || row.created_at,
      city: row.city,
      targetType: row.target_type,
      targetId: row.target_id,
      memberKey: row.member_key,
      meta: row.meta,
    }));
    return summarizeEvents(cloudRows, safeDays);
  } catch {
    return localSummary;
  }
}
