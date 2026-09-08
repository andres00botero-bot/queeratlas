import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  EVENT_STATUS,
  eventStatusSchemaUrl,
  isEventStatusDiscoverable,
  normalizeEventStatus,
} from "../src/features/events/eventStatus.js";
import { normalizeEventRange } from "../src/features/events/eventFormatUtils.js";
import { normalizeLifecyclePath } from "../src/lib/entityLifecyclePath.js";

const sourceFiles = [
  "src/lib/seedPlacesContent.js",
  "src/lib/seedEventsContent.js",
];
const mojibakePattern = /(?:Ã.|Â.|â[€™œ“”–—]|\uFFFD)/u;

for (const file of sourceFiles) {
  const content = readFileSync(file, "utf8");
  assert.doesNotMatch(content, mojibakePattern, `${file} contains mojibake`);
}

assert.equal(normalizeEventStatus("canceled"), EVENT_STATUS.CANCELLED);
assert.equal(normalizeEventStatus({ start_date: "", event_status: "scheduled" }), EVENT_STATUS.DATE_TBA);
assert.equal(isEventStatusDiscoverable("scheduled"), true);
assert.equal(isEventStatusDiscoverable("postponed"), false);
assert.equal(eventStatusSchemaUrl("moved_online"), "https://schema.org/EventMovedOnline");

const normalizedEvent = normalizeEventRange({
  date: "2026-09-07",
  end_date: "2026-09-08",
  event_status: "rescheduled",
});
assert.equal(normalizedEvent.startDate, "2026-09-07");
assert.equal(normalizedEvent.endDate, "2026-09-08");
assert.equal(normalizedEvent.eventStatus, EVENT_STATUS.RESCHEDULED);

assert.equal(normalizeLifecyclePath("https://www.queeratlas.app/berlin/venues/example?x=1"), "/berlin/venues/example");
assert.equal(normalizeLifecyclePath("berlin//venues/example/"), "/berlin/venues/example");

const config = readFileSync("next.config.mjs", "utf8");
for (const header of [
  "Content-Security-Policy",
  "Permissions-Policy",
  "Referrer-Policy",
  "X-Content-Type-Options",
  "X-Frame-Options",
]) {
  assert.match(config, new RegExp(header), `next.config.mjs is missing ${header}`);
}
assert.doesNotMatch(config, /type:\s*["']host["']/, "host redirect belongs in Vercel domain settings");

const lifecycleSql = readFileSync("supabase/entity-url-lifecycle-v1.sql", "utf8");
assert.match(lifecycleSql, /lifecycle_status in \('redirected', 'gone'\)/);
assert.match(lifecycleSql, /enable row level security/);

const statusSql = readFileSync("supabase/event-status-model-v2.sql", "utf8");
assert.match(statusSql, /events_event_status_check/);
assert.match(statusSql, /global_events_event_status_check/);
assert.doesNotMatch(statusSql, /coalesce\(start_date, date\)/i);
assert.match(statusSql, /btrim\(start_date::text\)/i);
assert.match(statusSql, /btrim\(date::text\)/i);

const contentRepairSql = readFileSync("supabase/content-integrity-repair-v1.sql", "utf8");
assert.match(contentRepairSql, /Bärenhöhle/);
assert.match(contentRepairSql, /event\. It is/);

console.log("[stability-foundation] PASSED");
