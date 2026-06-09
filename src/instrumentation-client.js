import * as Sentry from "@sentry/nextjs";
import { appendWebVitalSample } from "@/lib/telemetry/webVitalsStore";

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

export function reportWebVitals(metric) {
  if (typeof window === "undefined") return;

  const payload = {
    id: String(metric?.id || ""),
    name: String(metric?.name || ""),
    value: Number(metric?.value || 0),
    rating: String(metric?.rating || ""),
    route: String(window.location?.pathname || ""),
    href: `${window.location?.origin || ""}${window.location?.pathname || ""}`,
    ts: new Date().toISOString(),
  };

  appendWebVitalSample(payload);

  if (process.env.NEXT_PUBLIC_ENABLE_SEO_TELEMETRY === "1" && typeof navigator !== "undefined") {
    try {
      const body = JSON.stringify(payload);
      if (typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon("/api/telemetry/web-vitals", body);
      } else {
        fetch("/api/telemetry/web-vitals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Keep vitals collection best-effort and silent.
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[web-vitals]", JSON.stringify(payload));
  }
}
