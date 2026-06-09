import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildIndexNowPayload,
  buildPublishedEntityIndexNowUrls,
  filterIndexNowUrls,
  INDEXNOW_KEY,
  INDEXNOW_KEY_LOCATION,
  isAllowedIndexNowUrl,
  isValidIndexNowKey,
  normalizeIndexNowUrl,
} from "../src/lib/seo/indexNow.js";

assert.equal(isValidIndexNowKey(INDEXNOW_KEY), true);
assert.equal(isValidIndexNowKey("short"), false);
assert.equal(
  INDEXNOW_KEY_LOCATION,
  "https://www.queeratlas.app/259be8ea0ee343c1b2d47469936b2fd9.txt"
);

assert.equal(normalizeIndexNowUrl("/now"), "https://www.queeratlas.app/now");
assert.equal(normalizeIndexNowUrl("https://www.queeratlas.app/now/"), "https://www.queeratlas.app/now");
assert.equal(normalizeIndexNowUrl("https://queeratlas.app/now"), "");
assert.equal(normalizeIndexNowUrl("/now?member=1"), "");

assert.equal(isAllowedIndexNowUrl("/berlin"), true);
assert.equal(isAllowedIndexNowUrl("/berlin/discover/queer-techno-clubs"), true);
assert.equal(isAllowedIndexNowUrl("/paris/discover/queer-techno-clubs"), false);
assert.equal(isAllowedIndexNowUrl("/topics/nightlife"), true);
assert.equal(isAllowedIndexNowUrl("/topics/not-a-topic"), false);
assert.equal(isAllowedIndexNowUrl("/admin"), false);
assert.equal(isAllowedIndexNowUrl("/api/admin/indexnow"), false);

const filtered = filterIndexNowUrls([
  "/now",
  "/now",
  "/admin",
  "https://example.com/now",
]);
assert.deepEqual(filtered.accepted, ["https://www.queeratlas.app/now"]);
assert.equal(filtered.rejected.length, 2);

const eventUrls = buildPublishedEntityIndexNowUrls(
  "event",
  { id: "event-1", name: "Pride Night", city: "Berlin" },
  {}
);
assert.deepEqual(eventUrls, [
  "https://www.queeratlas.app/events",
  "https://www.queeratlas.app/berlin",
  "https://www.queeratlas.app/berlin/events/pride-night--event-1",
]);

const payload = buildIndexNowPayload(INDEXNOW_KEY, eventUrls);
assert.equal(payload.host, "www.queeratlas.app");
assert.equal(payload.keyLocation, INDEXNOW_KEY_LOCATION);
assert.deepEqual(payload.urlList, eventUrls);

const routeSource = readFileSync("src/app/api/admin/indexnow/route.js", "utf8");
assert.match(routeSource, /hasAuthorizedSeoAdminRequest/);
assert.match(routeSource, /DEDUPE_WINDOW_MS = 5 \* 60 \* 1000/);
assert.match(routeSource, /AbortSignal\.timeout\(8000\)/);

const sqlSource = readFileSync("supabase/indexnow-submissions-v1.sql", "utf8");
assert.match(sqlSource, /enable row level security/);
assert.match(sqlSource, /qa_is_admin\(\)/);
assert.match(sqlSource, /to service_role/);
assert.doesNotMatch(sqlSource, /for insert\s+to authenticated/i);

const publicKeyFile = readFileSync(`public/${INDEXNOW_KEY}.txt`, "utf8").trim();
assert.equal(publicKeyFile, INDEXNOW_KEY);

console.log("[indexnow] PASSED");
