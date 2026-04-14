const KPI_EVENTS_KEY = "qa_kpi_events";
const MAX_KPI_EVENTS = 4000;

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function readEvents() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(KPI_EVENTS_KEY), []);
}

function writeEvents(rows) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KPI_EVENTS_KEY, JSON.stringify(rows));
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
}

export function getKpiSummary(days = 7) {
  const safeDays = Number.isFinite(Number(days)) ? Number(days) : 7;
  const since = Date.now() - safeDays * 24 * 60 * 60 * 1000;
  const events = readEvents().filter((item) => {
    const ts = new Date(item.createdAt || "").getTime();
    return Number.isFinite(ts) && ts >= since;
  });

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
    rangeDays: safeDays,
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
    lastEventAt: events.length > 0 ? events[events.length - 1].createdAt : "",
  };
}
