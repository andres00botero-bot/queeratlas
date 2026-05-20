import assert from "node:assert/strict";
import { inferSearchIntent } from "../src/lib/searchIntent.js";

const CASES = [
  {
    query: "safe queer nightlife in Berlin",
    expect: { type: "place", city: "Berlin", tags: ["safe", "nightlife"] },
  },
  {
    query: "lesbian friendly cafés in Tokyo",
    expect: { type: "place", city: "Tokyo", tags: ["cafes", "lesbian-friendly"] },
  },
  {
    query: "drag shows tonight",
    expect: { type: "event", tags: ["drag", "tonight"] },
  },
  {
    query: "quiet queer places",
    expect: { type: "place", tags: ["quiet"] },
  },
  {
    query: "best trans-friendly spaces",
    expect: { type: "place", tags: ["trans-friendly"], quality: "verified" },
  },
  {
    query: "Berlin queer cafés",
    expect: { type: "place", city: "Berlin", tags: ["cafes"] },
  },
  {
    query: "community meetups this evening in Madrid",
    expect: { type: "event", city: "Madrid", tags: ["community"] },
  },
  {
    query: "travel guides for Lisbon",
    expect: { type: "city", city: "Lisbon", tags: ["travel"] },
  },
  {
    query: "events in Paris",
    expect: { type: "event", city: "Paris", tags: ["events"] },
  },
  {
    query: "queer bars",
    expect: { type: "place", tags: ["nightlife"] },
  },
  {
    query: "safe hotels in Amsterdam",
    expect: { type: "place", city: "Amsterdam", tags: ["safe"], quality: "verified" },
  },
  {
    query: "clubs in New York",
    expect: { type: "place", city: "New York", tags: ["nightlife"] },
  },
  {
    query: "pride festival in Sao Paulo",
    expect: { type: "event", city: "Sao Paulo", tags: ["events"] },
  },
  {
    query: "trans community in Toronto",
    expect: { type: "event", city: "Toronto", tags: ["trans-friendly", "community"] },
  },
  {
    query: "chill queer lounge",
    expect: { type: "place", tags: ["quiet"] },
  },
];

let passed = 0;
for (const testCase of CASES) {
  const result = inferSearchIntent(testCase.query);

  assert.equal(result.suggestedTypeFilter, testCase.expect.type, `type mismatch for "${testCase.query}"`);

  if (testCase.expect.city) {
    assert.equal(result.detectedCity, testCase.expect.city, `city mismatch for "${testCase.query}"`);
  }

  if (testCase.expect.quality) {
    assert.equal(
      result.suggestedQualityFilter,
      testCase.expect.quality,
      `quality mismatch for "${testCase.query}"`
    );
  }

  for (const tag of testCase.expect.tags || []) {
    assert(
      result.tags.includes(tag),
      `missing tag "${tag}" for "${testCase.query}". got [${result.tags.join(", ")}]`
    );
  }

  passed += 1;
}

console.log(`search-intent: ${passed}/${CASES.length} cases passed`);

