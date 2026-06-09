const ALLOWED_NAMES = new Set(["LCP", "INP", "CLS", "TTFB", "FCP"]);
const ALLOWED_RATINGS = new Set(["", "good", "needs-improvement", "poor"]);
const MAX_METRIC_VALUES = {
  LCP: 120000,
  INP: 60000,
  CLS: 10,
  TTFB: 120000,
  FCP: 120000,
};

export function sanitizeTelemetryPath(value = "/") {
  const raw = String(value || "/").trim();
  let pathname = raw;

  try {
    pathname = new URL(raw, "https://telemetry.invalid").pathname;
  } catch {
    pathname = raw.split(/[?#]/, 1)[0];
  }

  pathname = pathname.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 512);
  return pathname.startsWith("/") ? pathname || "/" : `/${pathname}`;
}

export function sanitizeTelemetryTimestamp(value, nowMs = Date.now()) {
  const parsed = Date.parse(String(value || ""));
  const oneDayAgo = nowMs - 24 * 60 * 60 * 1000;
  const fiveMinutesAhead = nowMs + 5 * 60 * 1000;
  if (Number.isNaN(parsed) || parsed < oneDayAgo || parsed > fiveMinutesAhead) {
    return new Date(nowMs).toISOString();
  }
  return new Date(parsed).toISOString();
}

export function sanitizeWebVitalPayload(payload = {}, requestOrigin = "") {
  const name = String(payload.name || "").toUpperCase().slice(0, 16);
  const id = String(payload.id || "").trim().slice(0, 128);
  const rating = String(payload.rating || "").toLowerCase().slice(0, 24);
  const value = Number(payload.value);

  if (!ALLOWED_NAMES.has(name)) {
    return { ok: false, error: "invalid-metric-name" };
  }
  if (!id) {
    return { ok: false, error: "missing-metric-id" };
  }
  if (!Number.isFinite(value) || value < 0 || value > MAX_METRIC_VALUES[name]) {
    return { ok: false, error: "invalid-metric-value" };
  }

  const route = sanitizeTelemetryPath(payload.route || "/");
  let href = "";
  try {
    const parsedHref = new URL(String(payload.href || ""), requestOrigin || "https://telemetry.invalid");
    if (!requestOrigin || parsedHref.origin === requestOrigin) {
      href = `${parsedHref.origin}${parsedHref.pathname}`.slice(0, 1024);
    }
  } catch {
    href = "";
  }

  return {
    ok: true,
    payload: {
      id,
      name,
      value,
      rating: ALLOWED_RATINGS.has(rating) ? rating : "",
      route,
      href,
      ts: sanitizeTelemetryTimestamp(payload.ts),
    },
  };
}

export function isTrustedSameOriginRequest(request) {
  const origin = String(request.headers.get("origin") || "").trim();
  const fetchSite = String(request.headers.get("sec-fetch-site") || "").trim().toLowerCase();
  const forwardedHost = String(request.headers.get("x-forwarded-host") || "").trim();
  const requestHost = String(request.headers.get("host") || "").trim();
  const forwardedProtocol = String(request.headers.get("x-forwarded-proto") || "").trim();
  const requestProtocol = String(request.nextUrl.protocol || "").replace(":", "");
  const expectedOrigins = new Set([
    request.nextUrl.origin,
    requestHost ? `${requestProtocol}://${requestHost}` : "",
    forwardedHost ? `${forwardedProtocol || requestProtocol}://${forwardedHost}` : "",
  ]);
  expectedOrigins.delete("");
  if (!origin || !expectedOrigins.has(origin)) return false;
  return !fetchSite || fetchSite === "same-origin";
}
