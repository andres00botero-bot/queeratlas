import assert from "node:assert/strict";
import { calculateQari, getQariTier, QARI_RISK_FLOORS } from "../src/lib/qari.js";
import { QARI_PILOT_PROFILES } from "../src/lib/qariPilotProfiles.js";

assert.equal(calculateQari({ legalRisk: 12, socialRisk: 18, digitalRisk: 8 }), 13);
assert.equal(
  calculateQari({ legalRisk: 20, socialRisk: 20, digitalRisk: 20, riskFloor: QARI_RISK_FLOORS.de_facto_criminalisation }),
  72,
);
assert.equal(getQariTier(20).key, "lower");
assert.equal(getQariTier(21).key, "lowerContext");
assert.equal(getQariTier(40).key, "lowerContext");
assert.equal(getQariTier(41).key, "moderate");
assert.equal(getQariTier(60).key, "moderate");
assert.equal(getQariTier(61).key, "high");
assert.equal(getQariTier(80).key, "high");
assert.equal(getQariTier(81).key, "extreme");
assert.equal(getQariTier(null).key, "unknown");

assert.equal(QARI_PILOT_PROFILES.length, 8);
assert.equal(new Set(QARI_PILOT_PROFILES.map((profile) => profile.destinationKey)).size, 8);
const germany = QARI_PILOT_PROFILES.find((profile) => profile.country === "Germany");
assert.equal(germany?.score, 16);
assert.equal(germany?.tier.key, "lower");

for (const profile of QARI_PILOT_PROFILES) {
  assert.equal(profile.score, calculateQari(profile), `${profile.country}: score must match the published formula`);
  assert.ok(profile.summary.length >= 40, `${profile.country}: summary is too short`);
  assert.equal(profile.sources.length, 3, `${profile.country}: each axis needs a source`);
  assert.deepEqual(
    new Set(profile.sources.map((source) => source.axis)),
    new Set(["legal", "social", "digital"]),
    `${profile.country}: legal, social and digital sources are required`,
  );
}

console.log("QARI Phase 0 + Phase 1 checks passed.");
