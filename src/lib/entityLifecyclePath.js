export function normalizeLifecyclePath(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "/";
  try {
    const parsed = new URL(raw, "https://www.queeratlas.app");
    const path = parsed.pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "");
    return path || "/";
  } catch {
    const path = `/${raw}`.replace(/\/{2,}/g, "/").replace(/\/$/, "");
    return path || "/";
  }
}
