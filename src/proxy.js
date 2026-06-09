import { NextResponse } from "next/server";
import { classifyCrawlerUserAgent } from "@/lib/telemetry/crawlerSignals";

function shouldCaptureSeoTelemetry() {
  return process.env.QA_SEO_TELEMETRY === "1";
}

export function proxy(request, event) {
  const response = NextResponse.next();

  const telemetryKey = String(process.env.QA_SEO_TELEMETRY_KEY || "").trim();
  if (!shouldCaptureSeoTelemetry() || !telemetryKey) {
    return response;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return response;
  }

  const userAgent = String(request.headers.get("user-agent") || "");
  const crawler = classifyCrawlerUserAgent(userAgent);
  if (!crawler) {
    return response;
  }

  const payload = {
    ts: new Date().toISOString(),
    crawlerKey: crawler.key,
    crawlerLabel: crawler.label,
    path: request.nextUrl?.pathname || "/",
    host: request.nextUrl?.host || "",
    method: request.method || "GET",
  };

  response.headers.set("x-qa-crawler", crawler.key);
  console.info("[seo-crawler-hit]", JSON.stringify(payload));

  const telemetryUrl = new URL("/api/telemetry/crawler-hit", request.url);
  const capturePromise = fetch(telemetryUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-qa-telemetry-key": telemetryKey,
    },
    body: JSON.stringify({
      userAgent,
      path: payload.path,
      ts: payload.ts,
    }),
    cache: "no-store",
  }).catch(() => {});
  event.waitUntil(capturePromise);

  return response;
}

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:css|js|map|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2)$).*)",
  ],
};
