const PRIVATE_TRAFFIC_ROOTS = new Set(["admin", "api", "contribute", "favorites", "messages"]);
const NON_PAGE_ROOTS = new Set([
  "_next",
  "favicon.ico",
  "icons",
  "manifest.webmanifest",
  "monitoring",
  "robots.txt",
  "sitemap.xml",
  "sitemap-events.xml",
  "sitemap-pages.xml",
  "sitemap-services.xml",
  "sitemap-venues.xml",
]);

export function normalizeTrafficPath(pathname = "/") {
  const raw = String(pathname || "/").trim();
  if (!raw) return "/";
  const withoutQuery = raw.split("?")[0].split("#")[0];
  const normalized = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  const cleaned = normalized.replace(/\/{2,}/g, "/").replace(/\/$/, "");
  return cleaned || "/";
}

export function isTrackableTrafficPath(pathname = "/") {
  const route = normalizeTrafficPath(pathname);
  const root = route.split("/").filter(Boolean)[0] || "";
  if (!root) return true;
  return !PRIVATE_TRAFFIC_ROOTS.has(root) && !NON_PAGE_ROOTS.has(root);
}

export function inferTrafficCity(pathname = "/", validCities = null) {
  const root = normalizeTrafficPath(pathname).split("/").filter(Boolean)[0] || "";
  if (!root || !/^[a-z_]+$/.test(root)) return "";
  if (validCities instanceof Set) return validCities.has(root) ? root : "";
  return "";
}

export function normalizeTrafficReferrer(value = "") {
  try {
    const url = new URL(String(value || ""));
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (!host || host === "queeratlas.app" || host.endsWith(".queeratlas.app")) return "internal";
    return host.slice(0, 160);
  } catch {
    return "";
  }
}

export function inferTrafficDevice(userAgent = "") {
  const value = String(userAgent || "").toLowerCase();
  if (/ipad|tablet|kindle|silk/.test(value)) return "tablet";
  if (/mobi|iphone|ipod|android/.test(value)) return "mobile";
  return value ? "desktop" : "unknown";
}

export function isLikelyTrafficBot(userAgent = "") {
  return /bot|crawler|spider|headless|lighthouse|pagespeed|preview|facebookexternalhit|slurp|bingpreview|uptimerobot/i.test(
    String(userAgent || ""),
  );
}
