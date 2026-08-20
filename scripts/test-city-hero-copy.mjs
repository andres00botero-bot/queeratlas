import assert from "node:assert/strict";
import { CITY_HERO_COPY, getCityHeroCopy } from "../src/features/city/cityHeroCopy.js";
import { cityConfig } from "../src/lib/cities.js";
import { cityCoreConfig } from "../src/lib/cityCore.js";

const FIELD_NAMES = ["hook", "status", "crowd"];
const MIN_LENGTH = 38;
const MAX_LENGTH = 126;
const INTRO_MIN_WORDS = 20;
const INTRO_MAX_WORDS = 38;
const INTRO_BANNED_PHRASES = [
  "route-first guide",
  "live community signal",
  "trusted venues",
  "queer nightlife, trusted venues",
];

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
const seenIntros = new Map();
let introCount = 0;

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

  const intro = String(cityCopy.intro || "").trim();
  if (!intro) continue;

  const normalizedIntro = normalize(intro);
  const wordCount = intro.split(/\s+/).filter(Boolean).length;
  const cityName = String(cityCoreConfig[cityKey]?.title || cityKey)
    .replace(/^Queer\s+/i, "")
    .trim();

  assert.ok(
    wordCount >= INTRO_MIN_WORDS && wordCount <= INTRO_MAX_WORDS,
    `${cityKey}.intro must contain ${INTRO_MIN_WORDS}-${INTRO_MAX_WORDS} words; found ${wordCount}.`,
  );
  assert.ok(
    !normalizedIntro.startsWith(normalize(cityName)),
    `${cityKey}.intro must open with an experience, not the city name.`,
  );
  for (const phrase of INTRO_BANNED_PHRASES) {
    assert.ok(
      !normalizedIntro.includes(normalize(phrase)),
      `${cityKey}.intro contains the retired template phrase "${phrase}".`,
    );
  }
  for (const fieldName of FIELD_NAMES) {
    assert.notEqual(
      normalizedIntro,
      normalize(cityCopy[fieldName]),
      `${cityKey}.intro duplicates its ${fieldName} card.`,
    );
  }
  assert.ok(!seenIntros.has(normalizedIntro), `${cityKey}.intro duplicates ${seenIntros.get(normalizedIntro)}.`);

  seenIntros.set(normalizedIntro, `${cityKey}.intro`);
  introCount += 1;
}

console.log(
  `City hero copy verified: ${cityKeys.length} cities, ${cityKeys.length * FIELD_NAMES.length} unique cards, ${introCount}/${cityKeys.length} individual intros complete.`,
);
