import { readFileSync } from "node:fs";
import { SAFETY_INDEX_2026, isEvidenceBackedSafetyYear } from "../src/lib/seo/safetyIndex2026.js";

const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const index = SAFETY_INDEX_2026;

assert(index.methodologyVersion === "QA-SR-1.0", "methodology version must be frozen");
assert(index.entries.length === 25, "published edition must contain Top 25");
assert(index.components.reduce((sum, item) => sum + item.weight, 0) === 100, "component weights must total 100");
assert(index.entries[0]?.city === "lisbon" && index.entries[0]?.score === 94.6, "Lisbon must lead the snapshot");
assert(index.entries[1]?.city === "buenos_aires" && index.entries[1]?.score === 94.2, "Buenos Aires must rank second");
assert(new Set(index.entries.map((entry) => entry.city)).size === index.entries.length, "cities must be unique");
assert(index.entries.every((entry, position) => entry.rank === position + 1), "ranks must be sequential");
assert(index.entries.every((entry) => entry.score >= 0 && entry.score <= 100), "scores must remain within 0-100");
assert(index.entries.every((entry) => Math.abs(Object.values(entry.scores).reduce((sum, value) => sum + value, 0) - entry.score) <= 0.2), "rounded components must reconcile with total scores");
assert(isEvidenceBackedSafetyYear(2026) && !isEvidenceBackedSafetyYear(2025), "only 2026 safety ranking is evidence locked");
assert(index.eligibility.populatedSafetyReviewsExcluded === 4, "thin safety-review sample must remain disclosed and excluded");

const nowSource = readFileSync(new URL("../src/app/now/page.js", import.meta.url), "utf8");
const reportSource = readFileSync(new URL("../src/app/reports/[slug]/page.js", import.meta.url), "utf8");
const csvSource = readFileSync(new URL("../src/app/api/reports/safety-index-2026/route.js", import.meta.url), "utf8");
const componentSource = readFileSync(new URL("../src/components/reports/SafetyIndexReport.js", import.meta.url), "utf8");

assert(nowSource.includes("SAFETY_INDEX_2026_ENTRIES.slice(0, NOW_RANKING_LIMIT)"), "Now must use the safety evidence snapshot");
assert(nowSource.includes("The published 2026 safety evidence snapshot is locked"), "manual safety reorder must be blocked");
assert(reportSource.includes("<SafetyIndexReport />"), "safety report component must render");
assert(reportSource.includes("evidenceIndex.components.map"), "safety report must publish Dataset variables");
assert(csvSource.includes("Content-Disposition"), "safety CSV must be downloadable");
assert(componentSource.includes("Four safety ratings were excluded"), "review exclusion must be visible");
assert(componentSource.includes("not a crime index") && componentSource.includes("not a universal"), "safety limitations must be prominent");

if (failures.length) {
  console.error("Safety index checks failed:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log("Safety index evidence checks passed.");
