import assert from "node:assert/strict";
import { evaluateCityDiscoveryIndexability } from "../src/lib/seo/cityDiscoveryQuality.js";

function result({ sourceCount = 1, reviewCount = 0 } = {}) {
  return { exact: true, sourceCount, reviewCount };
}

assert.equal(evaluateCityDiscoveryIndexability({
  topic: "queer-bars",
  discovery: { exactCount: 3, results: [result(), result(), result()] },
}).indexable, true);

assert.equal(evaluateCityDiscoveryIndexability({
  topic: "queer-bars",
  discovery: { exactCount: 2, results: [result(), result()] },
}).indexable, false);

assert.equal(evaluateCityDiscoveryIndexability({
  topic: "events-tonight",
  discovery: { exactCount: 2, results: [result(), result()] },
}).indexable, true);

assert.equal(evaluateCityDiscoveryIndexability({
  topic: "safest-queer-bars",
  discovery: {
    exactCount: 3,
    results: [result({ sourceCount: 0 }), result({ sourceCount: 0 }), result({ sourceCount: 0 })],
  },
}).indexable, false);

assert.equal(evaluateCityDiscoveryIndexability({
  topic: "safest-queer-bars",
  discovery: {
    exactCount: 3,
    results: [result(), result({ reviewCount: 4, sourceCount: 0 }), result()],
  },
}).indexable, true);

console.log("[discovery-indexing] PASSED");
