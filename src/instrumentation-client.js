import * as Sentry from "@sentry/nextjs";

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

export function reportWebVitals(metric) {
  if (typeof window === "undefined") return;

  const payload = {
    id: String(metric?.id || ""),
    name: String(metric?.name || ""),
    value: Number(metric?.value || 0),
    rating: String(metric?.rating || ""),
    route: String(window.location?.pathname || ""),
    href: String(window.location?.href || ""),
    ts: new Date().toISOString(),
  };

  if (process.env.NODE_ENV !== "production") {
    console.info("[web-vitals]", JSON.stringify(payload));
  }
}
