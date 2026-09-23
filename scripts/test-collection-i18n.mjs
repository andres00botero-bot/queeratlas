import assert from "node:assert/strict";
import fs from "node:fs";
import { SPANISH_COLLECTIONS, getLocalizedAtlasCollection, getSpanishCollectionSearchTerms } from "../src/lib/atlasCollectionTranslations.js";

const files = [
  "src/lib/atlasCollections.js",
  "src/lib/atlasCollectionsExpansion.js",
  "src/lib/atlasCollectionsExpansionMore.js",
  "src/lib/atlasCollectionsExpansionSeasonal.js",
  "src/lib/atlasCollectionsGrowth.js",
  "src/lib/atlasCollectionsAudience.js",
];
const slugs = files.flatMap((file) => [...fs.readFileSync(file, "utf8").matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]));

assert.equal(new Set(slugs).size, slugs.length, "Collection slugs must be unique.");
assert.deepEqual(Object.keys(SPANISH_COLLECTIONS).sort(), [...slugs].sort(), "Every premium collection needs a Spanish localization record.");

for (const slug of slugs) {
  const localized = getLocalizedAtlasCollection({ slug, title: "English title", items: ["Example pick"] }, "es");
  for (const field of ["title", "summary", "methodology", "bestFor", "mood", "price", "editorialNote"]) {
    assert.ok(String(localized[field] || "").trim(), `${slug}.${field} must be localized.`);
  }
  assert.ok(localized.itemNotes.length > 0, `${slug} must have Spanish pick notes.`);
  assert.match(localized.itemNotes[0], /Selección editorial|[áéíóúñ]/i, `${slug} pick note must be Spanish.`);
  assert.ok(getSpanishCollectionSearchTerms({ slug, title: localized.title }).length >= 3, `${slug} needs a Spanish search-intent mapping.`);
}

console.log(`Collection i18n passed: ${slugs.length}/${slugs.length} premium collections localized in Spanish.`);
