import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { classifyCrawlerUserAgent } from "../src/lib/telemetry/crawlerSignals.js";
import {
  isTrustedSameOriginRequest,
  sanitizeTelemetryPath,
  sanitizeTelemetryTimestamp,
  sanitizeWebVitalPayload,
} from "../src/lib/telemetry/validation.js";

const google = classifyCrawlerUserAgent(
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
);
assert.equal(google?.key, "googlebot");
assert.equal(classifyCrawlerUserAgent("Mozilla/5.0 Chrome/125.0"), null);

assert.equal(sanitizeTelemetryPath("/now?secret=value#section"), "/now");
assert.equal(sanitizeTelemetryPath("events?city=berlin"), "/events");

const nowMs = Date.parse("2026-06-09T12:00:00.000Z");
assert.equal(
  sanitizeTelemetryTimestamp("2026-05-01T00:00:00.000Z", nowMs),
  "2026-06-09T12:00:00.000Z"
);

const sameOriginRequest = {
  headers: new Headers({
    origin: "http://127.0.0.1:3100",
    host: "127.0.0.1:3100",
    "sec-fetch-site": "same-origin",
  }),
  nextUrl: new URL("http://localhost:3100/api/telemetry/web-vitals"),
};
assert.equal(isTrustedSameOriginRequest(sameOriginRequest), true);

const valid = sanitizeWebVitalPayload(
  {
    id: "metric-1",
    name: "LCP",
    value: 1800,
    rating: "good",
    route: "/now?private=1",
    href: "https://www.queeratlas.app/now?private=1#feed",
    ts: "2026-06-09T11:59:00.000Z",
  },
  "https://www.queeratlas.app"
);
assert.equal(valid.ok, true);
assert.equal(valid.payload.route, "/now");
assert.equal(valid.payload.href, "https://www.queeratlas.app/now");

assert.equal(
  sanitizeWebVitalPayload(
    { id: "metric-2", name: "CLS", value: 99 },
    "https://www.queeratlas.app"
  ).error,
  "invalid-metric-value"
);
assert.equal(
  sanitizeWebVitalPayload(
    { id: "", name: "LCP", value: 1000 },
    "https://www.queeratlas.app"
  ).error,
  "missing-metric-id"
);

const serverClientSource = readFileSync("src/lib/telemetry/serverSupabase.js", "utf8");
assert.match(serverClientSource, /SUPABASE_SERVICE_ROLE_KEY/);
assert.doesNotMatch(
  serverClientSource.match(/getTelemetryServiceClient\(\)[\s\S]*?^}/m)?.[0] || "",
  /NEXT_PUBLIC_SUPABASE_(?:KEY|PUBLISHABLE_KEY|ANON_KEY)/
);

const telemetrySql = readFileSync("supabase/seo-telemetry-v1.sql", "utf8");
assert.match(telemetrySql, /security invoker/);
assert.match(telemetrySql, /from public, anon, authenticated/);
assert.match(telemetrySql, /to service_role/);
assert.doesNotMatch(telemetrySql, /create policy qa_seo_web_vitals_insert_public/);

const proxySource = readFileSync("src/proxy.js", "utf8");
assert.match(proxySource, /event\.waitUntil/);
assert.match(proxySource, /\(\?!api\//);

const snapshotSource = readFileSync("src/lib/telemetry/seoHealthSnapshot.js", "utf8");
assert.match(snapshotSource, /normalizeComparableUrl\(canonical\)/);
assert.match(snapshotSource, /latestDayAgeDays/);

console.log("[seo-telemetry] PASSED");
