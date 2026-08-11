import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  inferTrafficCity,
  inferTrafficDevice,
  isLikelyTrafficBot,
  isTrackableTrafficPath,
  normalizeTrafficPath,
  normalizeTrafficReferrer,
} from "../src/lib/trafficCore.js";

assert.equal(normalizeTrafficPath("paris//venues/test?utm_source=x#details"), "/paris/venues/test");
assert.equal(normalizeTrafficPath("/"), "/");
assert.equal(isTrackableTrafficPath("/admin"), false);
assert.equal(isTrackableTrafficPath("/api/health"), false);
assert.equal(isTrackableTrafficPath("/paris"), true);
assert.equal(isTrackableTrafficPath("/community"), true);
assert.equal(inferTrafficCity("/paris/venues/example", new Set(["paris"])), "paris");
assert.equal(inferTrafficCity("/about", new Set(["paris"])), "");
assert.equal(normalizeTrafficReferrer("https://www.queeratlas.app/paris"), "internal");
assert.equal(normalizeTrafficReferrer("https://www.google.com/search?q=queer"), "google.com");
assert.equal(inferTrafficDevice("Mozilla/5.0 (iPhone; Mobile)"), "mobile");
assert.equal(inferTrafficDevice("Mozilla/5.0 (iPad)"), "tablet");
assert.equal(inferTrafficDevice("Mozilla/5.0 (Windows NT 10.0)"), "desktop");
assert.equal(isLikelyTrafficBot("Googlebot/2.1"), true);
assert.equal(isLikelyTrafficBot("Mozilla/5.0 Safari/537.36"), false);

const sql = readFileSync(new URL("../supabase/traffic-analytics-v2.sql", import.meta.url), "utf8");
assert.match(sql, /create table if not exists public\.qa_traffic_pageviews/);
assert.match(sql, /security definer/);
assert.match(sql, /if not public\.qa_is_admin\(\)/);
assert.match(sql, /count\(distinct session_id\)/);
assert.match(sql, /grant execute on function public\.qa_admin_traffic_summary\(integer\) to authenticated/);
assert.match(sql, /revoke all on table public\.qa_traffic_pageviews from anon, authenticated/);

const tracker = readFileSync(new URL("../src/lib/trafficAnalytics.js", import.meta.url), "utf8");
assert.match(tracker, /SESSION_TIMEOUT_MS = 30 \* 60 \* 1000/);
assert.match(tracker, /\.vercel\.app/);
assert.match(tracker, /navigator\?\.doNotTrack === "1"/);
assert.match(tracker, /qa_admin_traffic_summary/);
assert.match(tracker, /fetchAllLegacyRows/);

const api = readFileSync(new URL("../src/app/api/traffic/page-view/route.js", import.meta.url), "utf8");
assert.match(api, /traffic_page_view_start/);
assert.match(api, /isLikelyTrafficBot/);
assert.match(api, /qa_record_page_view/);

const panel = readFileSync(new URL("../src/components/admin/AdminTrafficPanel.js", import.meta.url), "utf8");
assert.match(panel, /Traffic intelligence/);
assert.match(panel, /Identified browsers/);
assert.match(panel, /30 min inactivity/);
assert.match(panel, /Do not read these as exact pageviews/);

console.log("Traffic analytics v2 checks passed.");
