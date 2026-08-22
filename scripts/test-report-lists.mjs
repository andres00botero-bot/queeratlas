import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { GLOBAL_QUEER_EVENT_REPORT_2026 } from "../src/lib/seo/globalQueerEventReport2026.js";
import { NIGHTLIFE_INDEX_2026 } from "../src/lib/seo/nightlifeIndex2026.js";

const eventReport = GLOBAL_QUEER_EVENT_REPORT_2026;
assert.equal(eventReport.scope.indexedEvents, eventReport.entries.reduce((sum, entry) => sum + entry.events, 0), "event total must reproduce from city rows");
assert.equal(eventReport.scope.atlasCitiesWithEvents, eventReport.entries.length, "event city count must match published rows");
assert(eventReport.entries.length > 30, "event report must contain a substantial global city list");
assert(eventReport.entries.every((entry, index) => entry.rank === index + 1), "event positions must be unique and consecutive");
assert(new Set(eventReport.entries.map((entry) => entry.rank)).size === eventReport.entries.length, "event rank numbers must not repeat");
assert.equal(NIGHTLIFE_INDEX_2026.entries.length, 25, "destination report must publish the full Top 25");
assert(NIGHTLIFE_INDEX_2026.entries.every((entry) => NIGHTLIFE_INDEX_2026.components.every((component) => Number.isFinite(entry.scores[component.key]))), "every nightlife destination must expose all six components");

const pageSource = readFileSync(new URL("../src/app/reports/[slug]/page.js", import.meta.url), "utf8");
assert(pageSource.includes("<GlobalQueerEventReport />"), "event report slug must render its real list component");
assert(pageSource.includes("<TopNightlifeDestinationsReport />"), "nightlife destination slug must render its real list component");

const eventComponent = readFileSync(new URL("../src/components/reports/GlobalQueerEventReport.js", import.meta.url), "utf8");
const nightlifeComponent = readFileSync(new URL("../src/components/reports/TopNightlifeDestinationsReport.js", import.meta.url), "utf8");
assert(eventComponent.includes("View remaining") && eventComponent.includes("Download CSV"), "event report must expose the full list and data download");
assert(nightlifeComponent.includes("Top 25 LGBTQ nightlife destinations") && nightlifeComponent.includes("entry.scores[component.key]"), "nightlife report must expose the full ranking and component values");

console.log("Report list checks passed.");
