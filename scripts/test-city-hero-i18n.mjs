import assert from "node:assert/strict";
import { getCityHeroCopy } from "../src/features/city/cityHeroCopy.js";
import { cityCoreConfig } from "../src/lib/cityCore.js";

assert.match(getCityHeroCopy("madrid", "en").hook, /Terrace warmth/);
assert.match(getCityHeroCopy("madrid", "es").hook, /terrazas/);
assert.match(getCityHeroCopy("madrid", "es-ES").intro, /Chueca/);
const untranslated = [];
for (const city of Object.keys(cityCoreConfig)) {
  const english = getCityHeroCopy(city, "en");
  const spanish = getCityHeroCopy(city, "es");
  assert.ok(spanish, `Missing Spanish hero copy for ${city}.`);
  for (const field of ["hook", "status", "crowd", "intro"]) {
    assert.ok(String(spanish[field] || "").trim(), `Missing ${field} for Spanish ${city} hero.`);
    if (String(spanish[field]).trim() === String(english?.[field] || "").trim()) untranslated.push(`${city}.${field}`);
  }
}
assert.deepEqual(untranslated, [], `English hero fallback found: ${untranslated.join(", ")}`);

console.log(`city hero i18n test passed: ${Object.keys(cityCoreConfig).length} Spanish city heroes covered.`);
