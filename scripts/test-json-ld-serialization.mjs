import assert from "node:assert/strict";
import { serializeJsonLd } from "../src/lib/jsonLd.js";

const payload = {
  name: '</script><script>alert("unsafe")</script>',
  separator: "before\u2028after\u2029done",
};
const result = serializeJsonLd(payload);

assert.equal(result.includes("</script>"), false, "Serialized JSON-LD must not close its script element.");
assert.equal(result.includes("<script>"), false, "Serialized JSON-LD must not contain HTML tags.");
assert.deepEqual(JSON.parse(result), payload, "Serialized JSON-LD must remain valid JSON.");

console.log("JSON-LD serialization safety test passed.");
