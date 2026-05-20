import assert from "node:assert/strict";
import { inferSearchIntent } from "../src/lib/searchIntent.js";
import { buildLiveSearchSuggestions } from "../src/lib/searchSuggestions.js";

function labels(list) {
  return list.map((item) => item.label);
}

{
  const query = "Ber";
  const intent = inferSearchIntent(query);
  const suggestions = buildLiveSearchSuggestions({ query, intentProfile: intent, max: 7 });
  const allLabels = labels(suggestions);
  assert(allLabels.includes("Berlin nightlife tonight"), "Ber: should include Berlin nightlife tonight");
  assert(allLabels.includes("Berlin queer cafés"), "Ber: should include Berlin queer cafés");
  assert(allLabels.includes("Berlin safe hotels"), "Ber: should include Berlin safe hotels");
  assert(allLabels.includes("Trending in Berlin"), "Ber: should include Trending in Berlin");
}

{
  const query = "drag";
  const intent = inferSearchIntent(query);
  const suggestions = buildLiveSearchSuggestions({ query, intentProfile: intent, max: 7 });
  const allLabels = labels(suggestions);
  assert(allLabels.includes("Drag shows tonight"), "drag: should include Drag shows tonight");
}

{
  const query = "safe queer";
  const intent = inferSearchIntent(query);
  const suggestions = buildLiveSearchSuggestions({ query, intentProfile: intent, max: 7 });
  const allLabels = labels(suggestions);
  assert(allLabels.includes("Verified safe queer spaces"), "safe: should include verified safe suggestion");
}

{
  const query = "x";
  const intent = inferSearchIntent(query);
  const suggestions = buildLiveSearchSuggestions({ query, intentProfile: intent, max: 7 });
  assert.equal(suggestions.length, 0, "single-char query should not open suggestions");
}

console.log("search-suggestions: 4/4 checks passed");

