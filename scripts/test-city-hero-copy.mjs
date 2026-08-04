import assert from "node:assert/strict";
import { CITY_HERO_COPY, getCityHeroCopy } from "../src/features/city/cityHeroCopy.js";
import { cityConfig } from "../src/lib/cities.js";
import { cityCoreConfig } from "../src/lib/cityCore.js";

const FIELD_NAMES = ["hook", "status", "crowd"];
const MIN_LENGTH = 38;
const MAX_LENGTH = 125;

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const cityKeys = Object.keys(cityCoreConfig);
const copyKeys = Object.keys(CITY_HERO_COPY);

assert.deepEqual(copyKeys.sort(), cityKeys.sort(), "Every registered city must have one explicit hero-copy entry.");

const seenCopy = new Map();

for (const cityKey of cityKeys) {
  const cityCopy = getCityHeroCopy(cityKey);
  assert.ok(cityCopy, `Missing city hero copy for ${cityKey}.`);

  const guideSentences = (cityConfig[cityKey]?.guide || [])
    .flatMap((section) => String(section?.text || "").split(/(?<=[.!?])\s+/))
    .map(normalize)
    .filter(Boolean);

  for (const fieldName of FIELD_NAMES) {
    const value = String(cityCopy[fieldName] || "").trim();
    const normalizedValue = normalize(value);

    assert.ok(value.length >= MIN_LENGTH, `${cityKey}.${fieldName} is too short to be useful.`);
    assert.ok(value.length <= MAX_LENGTH, `${cityKey}.${fieldName} is too long for the premium card.`);
    assert.ok(!guideSentences.includes(normalizedValue), `${cityKey}.${fieldName} repeats a sentence from its city guide.`);
    assert.ok(!seenCopy.has(normalizedValue), `${cityKey}.${fieldName} duplicates ${seenCopy.get(normalizedValue)}.`);

    seenCopy.set(normalizedValue, `${cityKey}.${fieldName}`);
  }
}

console.log(`City hero copy verified: ${cityKeys.length} cities, ${cityKeys.length * FIELD_NAMES.length} unique fields.`);
