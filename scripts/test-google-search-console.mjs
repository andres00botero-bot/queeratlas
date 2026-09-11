import assert from "node:assert/strict";
import { mapSearchAnalyticsRows, summarizeSearchPerformance } from "../src/lib/googleSearchConsole/shared.js";

const pages = mapSearchAnalyticsRows([
  { keys: ["https://www.queeratlas.app/berlin"], clicks: 0, impressions: 50, ctr: 0, position: 9 },
  { keys: ["https://www.queeratlas.app/madrid"], clicks: 4, impressions: 40, ctr: 0.1, position: 5 },
], ["page"]);
const queryPages = mapSearchAnalyticsRows([
  { keys: ["queer berlin", "https://www.queeratlas.app/berlin"], clicks: 2, impressions: 20 },
  { keys: ["queer berlin", "https://www.queeratlas.app/cities"], clicks: 0, impressions: 10 },
], ["query", "page"]);
const summary = summarizeSearchPerformance({
  totalRow: { clicks: 4, impressions: 90, ctr: 4 / 90, position: 7 },
  pageRows: pages,
  queryPageRows: queryPages,
});

assert.equal(summary.zeroClickPages[0].page, "https://www.queeratlas.app/berlin");
assert.equal(summary.overlappingQueries[0].query, "queer berlin");
assert.equal(summary.overlappingQueries[0].pages.length, 2);
assert.equal(summary.totals.impressions, 90);
console.log("Google Search Console aggregation checks passed.");
