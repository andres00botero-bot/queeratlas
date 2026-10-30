import assert from "node:assert/strict";
import { buildAtlasSearchResults } from "../src/lib/search.js";
import { getIntentEvidenceBits, getIntentSignalBoost, inferSearchIntent } from "../src/lib/searchIntent.js";

const venues = [
  { id: "1", name: "Harbour", city: "berlin", type: "bar", description: "An evening venue", vibe: "social", venue_intel: { crowd_mix: "trans inclusive community", best_nights: "drag cabaret party", source_urls: ["https://example.invalid"] } },
  { id: "2", name: "Garden", city: "berlin", type: "cafe", description: "A place for coffee", venue_intel: { crowd_mix: "quiet low-key lounge", staff: "friendly support" } },
  { id: "3", name: "Night", city: "madrid", type: "club", description: "An electronic dancefloor", venue_intel: { hours: "crowded nightlife party", audience: "sapphic flinta" } },
];
const compact = venues.map((venue) => {
  const result = { ...venue, home_intent_evidence: getIntentEvidenceBits(venue) };
  delete result.venue_intel;
  return result;
});
const queries = ["drag berlin", "trans friendly bar berlin", "quiet cafe berlin", "queer nightlife madrid", "community", "safe", "lesbian", "coffee", "support"];
for (const query of queries) {
  const intent = inferSearchIntent(query);
  for (let index = 0; index < venues.length; index += 1) {
    assert.equal(getIntentSignalBoost({ targetType: "place", entity: compact[index], intent }), getIntentSignalBoost({ targetType: "place", entity: venues[index], intent }), `${query} must retain intent score`);
  }
  const options = { query, events: [], places: venues, placeLimit: 10 };
  const original = buildAtlasSearchResults(options).all.map(({ id, score }) => ({ id, score }));
  const projected = buildAtlasSearchResults({ ...options, places: compact }).all.map(({ id, score }) => ({ id, score }));
  assert.deepEqual(projected, original, `${query} must retain ranking`);
}
assert.ok(Buffer.byteLength(JSON.stringify(compact)) < Buffer.byteLength(JSON.stringify(venues)));
console.log("Home search: compact venue evidence preserves intent scores and rankings.");
