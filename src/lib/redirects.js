const APP_ORIGIN = "https://www.queeratlas.app";

export function sanitizePostLoginTarget(rawValue, fallback = "") {
  const raw = String(rawValue || "").trim();
  if (!raw) return fallback;

  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\"))
    return fallback;

  if (raw.includes("\n") || raw.includes("\r")) return fallback;

  try {
    const parsed = new URL(raw, APP_ORIGIN);
    if (parsed.origin !== APP_ORIGIN) return fallback;
    if (!parsed.pathname.startsWith("/")) return fallback;
    if (parsed.pathname.startsWith("/api")) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
