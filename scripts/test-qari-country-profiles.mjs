import assert from "node:assert/strict";
import fs from "node:fs";
import { cityCoreConfig } from "../src/lib/cityCore.js";
import { calculateQari } from "../src/lib/qari.js";
import { QARI_COUNTRY_PROFILES, QARI_GENERATED_COUNTRY_PROFILES } from "../src/lib/qariCountryProfiles2026.js";
import { QARI_PILOT_PROFILES } from "../src/lib/qariPilotProfiles.js";

const atlasCountries = [...new Set(Object.values(cityCoreConfig).map((city) => city.country))].sort();
assert.equal(atlasCountries.length, 81);
assert.equal(QARI_GENERATED_COUNTRY_PROFILES.length, 73);
assert.equal(QARI_COUNTRY_PROFILES.length, 81);
assert.equal(new Set(QARI_COUNTRY_PROFILES.map((profile) => profile.destinationKey)).size, 81);
assert.deepEqual(QARI_COUNTRY_PROFILES.map((profile) => profile.country).sort(), atlasCountries);

for (const profile of QARI_COUNTRY_PROFILES) {
  assert.equal(profile.score, calculateQari(profile), `${profile.country}: formula mismatch`);
  assert.ok(profile.summary.length >= 40, `${profile.country}: summary too short`);
  assert.ok(["high", "medium"].includes(profile.confidence), `${profile.country}: unpublished confidence`);
  assert.deepEqual(
    new Set(profile.sources.map((source) => source.axis)),
    new Set(["legal", "social", "digital"]),
    `${profile.country}: incomplete axis sourcing`,
  );
  for (const source of profile.sources) {
    assert.match(source.url, /^https:\/\//, `${profile.country}: non-HTTPS source`);
  }
}

for (const pilot of QARI_PILOT_PROFILES) {
  const expanded = QARI_COUNTRY_PROFILES.find((profile) => profile.country === pilot.country);
  assert.equal(expanded?.score, pilot.score, `${pilot.country}: pilot score changed`);
  assert.equal(expanded?.methodologyVersion, "1.0", `${pilot.country}: pilot methodology changed`);
}

const sql = fs.readFileSync(new URL("../supabase/qari-country-profiles-2026.sql", import.meta.url), "utf8");
assert.match(sql, /Expected after the Phase 0\/1 pilot plus this expansion: 81 published profiles/);
for (const profile of QARI_GENERATED_COUNTRY_PROFILES) {
  assert.ok(sql.includes(`'${profile.destinationKey}'`), `${profile.country}: missing from SQL`);
}

console.log("QARI 81-country expansion checks passed.");
