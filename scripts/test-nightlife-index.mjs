import { readFileSync } from "node:fs";
import { NIGHTLIFE_INDEX_2026, isEvidenceBackedRankingYear } from "../src/lib/seo/nightlifeIndex2026.js";

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const index = NIGHTLIFE_INDEX_2026;
assert(index.methodologyVersion === "QA-NI-1.0", "methodology version must be frozen");
assert(index.entries.length === 25, "published edition must contain Top 25");
assert(index.components.reduce((sum, item) => sum + item.weight, 0) === 100, "component weights must total 100");
assert(index.entries[0]?.city === "berlin" && index.entries[0]?.score === 91.9, "Berlin must lead the published snapshot");
assert(index.entries[1]?.city === "madrid" && index.entries[1]?.score === 90.8, "Madrid must rank second in the published snapshot");
assert(new Set(index.entries.map((entry) => entry.city)).size === index.entries.length, "cities must be unique");
assert(index.entries.every((entry, position) => entry.rank === position + 1), "ranks must be sequential");
assert(index.entries.every((entry) => entry.score >= 0 && entry.score <= 100), "scores must stay within 0-100");
assert(index.entries.every((entry) => Math.abs(Object.values(entry.scores).reduce((sum, value) => sum + value, 0) - entry.score) <= 0.2), "rounded component totals must reconcile with total scores");
assert(isEvidenceBackedRankingYear(2026) && !isEvidenceBackedRankingYear(2025), "only the 2026 ranking is evidence locked");

const nowSource = readFileSync(new URL("../src/app/now/page.js", import.meta.url), "utf8");
const reportSource = readFileSync(new URL("../src/app/reports/[slug]/page.js", import.meta.url), "utf8");
const csvSource = readFileSync(new URL("../src/app/api/reports/nightlife-index-2026/route.js", import.meta.url), "utf8");
const reportComponent = readFileSync(new URL("../src/components/reports/NightlifeIndexReport.js", import.meta.url), "utf8");

assert(nowSource.includes("NIGHTLIFE_INDEX_2026_ENTRIES.slice(0, NOW_RANKING_LIMIT)"), "Now must use the published evidence snapshot");
assert(nowSource.includes("The published 2026 evidence snapshot is locked"), "manual 2026 reordering must be blocked");
assert(reportSource.includes('"@type": "Dataset"'), "report must publish Dataset structured data");
assert(reportSource.includes("<NightlifeIndexReport />"), "flagship report component must render");
assert(csvSource.includes("Content-Disposition"), "CSV route must be downloadable");
assert(reportComponent.includes("Full published table") && reportComponent.includes("Download CSV"), "report must expose ranking and data download");
assert(reportComponent.includes("does not claim to measure every venue"), "report must disclose coverage limitations");

if (failures.length) {
  console.error("Nightlife index checks failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Nightlife index evidence checks passed.");
