import assert from "node:assert/strict";
import fs from "node:fs";
import { addQariV2Months, assessQariV2, createQariV2Profile, getQariV2Rule, QARI_V2_METHODOLOGY_VERSION } from "../src/lib/qariV2.js";
import { QARI_V2_PILOT_PROFILES, QARI_V2_PUBLISHED_PROFILES } from "../src/lib/qariV2PilotProfiles.js";
import { QARI_PUBLIC_PROFILES } from "../src/lib/qariPublicProfiles.js";
import { evaluateQariV2SafetyReview, QARI_V2_PILOT_SAFETY_REVIEWS } from "../src/lib/qariV2SafetyReview.js";
import { isVenueAccessRestricted } from "../src/lib/venueAccessPolicy.js";

assert.equal(QARI_V2_METHODOLOGY_VERSION, "2.0-2026");
assert.equal(addQariV2Months("2026-10-26"), "2027-04-26");
assert.equal(addQariV2Months("2026-08-31"), "2027-02-28");
assert.equal(getQariV2Rule("L-03")?.level, "high");
assert.equal(getQariV2Rule("L-08")?.level, "moderate");
assert.equal(getQariV2Rule("L-09")?.level, "moderate");

const malaysia = assessQariV2({
  reviewedAt: "2026-10-26",
  findings: [
    { ruleCode: "L-02", evidenceGrade: "A" },
    { ruleCode: "R-02", evidenceGrade: "B" },
  ],
  evidenceAvailability: { legal: "good", stateRepression: "good", digitalExposure: "limited", socialCivil: "limited" },
});
assert.equal(malaysia.level, "extreme");
assert.equal(malaysia.dimensions.legal.level, "high");
assert.equal(malaysia.dimensions.stateRepression.level, "extreme");
assert.equal(malaysia.nextReviewAt, "2027-04-26");

const kazakhstan = assessQariV2({
  findings: [{ ruleCode: "L-03", evidenceGrade: "A" }],
  evidenceAvailability: { legal: "good", stateRepression: "unknown", digitalExposure: "limited", socialCivil: "limited" },
});
assert.equal(kazakhstan.level, "high");
assert.equal(kazakhstan.dimensions.stateRepression.unknown, true);

const insufficientEvidence = assessQariV2({
  findings: [{ ruleCode: "R-02", evidenceGrade: "C" }],
  evidenceAvailability: { stateRepression: "unknown" },
});
assert.equal(insufficientEvidence.level, null);
assert.equal(insufficientEvidence.isUnknown, true);
assert.equal(insufficientEvidence.monitorFindings[0]?.reason, "insufficient_evidence");
const verifiedLowerLegal = assessQariV2({
  lowerDimensionEvidence: { legal: { evidenceGrade: "A", sourceLabel: "Official legal source", sourceUrl: "https://example.org/legal" } },
  evidenceAvailability: { legal: "good", stateRepression: "unknown" },
});
assert.equal(verifiedLowerLegal.level, "lower");
assert.equal(verifiedLowerLegal.isUnknown, false);
assert.equal(verifiedLowerLegal.dimensions.legal.lowerEvidence?.sourceLabel, "Official legal source");
assert.equal(verifiedLowerLegal.dimensions.stateRepression.unknown, true);
assert.equal(createQariV2Profile({
  destinationKey: "country:test", country: "Test", summary: "A source trail is required for any rule that can change a QARI 2.0 profile.",
  findings: [{ ruleCode: "L-02", evidenceGrade: "A" }], evidenceAvailability: { legal: "good" }, reviewedAt: "2026-10-26",
}), null);

const migration = fs.readFileSync(new URL("../supabase/qari-v2-2026.sql", import.meta.url), "utf8");
assert.match(migration, /state_repression_level/);
assert.match(migration, /digital_exposure_level/);
assert.match(migration, /next_review_at/);
assert.doesNotMatch(migration, /qari_score/);
const cityLayout = fs.readFileSync(new URL("../src/app/[city]/layout.js", import.meta.url), "utf8");
assert.match(cityLayout, /isVenueAccessRestricted/);
assert.match(cityLayout, /venueAccessRestricted \? false/);
assert.equal(isVenueAccessRestricted("beirut"), true);
assert.equal(isVenueAccessRestricted("cairo"), true);
assert.equal(isVenueAccessRestricted("colombo"), true);
assert.equal(isVenueAccessRestricted("yerevan"), true);
assert.equal(isVenueAccessRestricted("guatemala_city"), true);
assert.equal(isVenueAccessRestricted("jakarta"), true);
assert.equal(isVenueAccessRestricted("bali"), true);
assert.equal(isVenueAccessRestricted("marrakech"), true);
assert.equal(isVenueAccessRestricted("budapest"), false);
assert.equal(isVenueAccessRestricted("caracas"), false);
assert.equal(isVenueAccessRestricted("sarajevo"), false);
assert.equal(isVenueAccessRestricted("tbilisi"), false);

assert.equal(QARI_V2_PILOT_PROFILES.length, 86);
assert.ok(QARI_V2_PILOT_PROFILES.every((profile) => profile.isPublished));
assert.equal(QARI_V2_PUBLISHED_PROFILES.length, 86);
assert.ok(QARI_V2_PUBLISHED_PROFILES.every((profile) => profile.isQariV2 && profile.scopeType === "country"));
assert.ok(["China", "Egypt", "Indonesia", "Malaysia", "Morocco", "Turkey", "Kazakhstan", "Russia", "Lebanon", "Sri Lanka", "Armenia", "Guatemala", "Venezuela", "Bosnia and Herzegovina", "Honduras", "Georgia", "Hungary", "Bulgaria", "El Salvador", "Slovakia", "Romania", "Japan", "South Korea", "Poland", "Ukraine", "Serbia", "Cyprus", "Italy", "Latvia", "Lithuania", "Albania", "Croatia", "Czech Republic", "Montenegro", "Estonia", "Singapore", "Namibia", "Hong Kong", "India", "Bolivia", "Panama", "Peru", "Cambodia", "Dominican Republic", "Paraguay", "Philippines", "Puerto Rico", "Vietnam", "Mongolia", "Israel", "Nepal", "Nicaragua", "Austria", "Belgium", "Denmark", "Finland", "France", "Germany", "Greece", "Ireland", "Malta", "Netherlands", "Portugal", "Slovenia", "Spain", "Sweden", "Argentina", "Australia", "Brazil", "Canada", "Chile", "Colombia", "Costa Rica", "Cuba", "Ecuador", "Iceland", "Mexico", "New Zealand", "Norway", "South Africa", "Switzerland", "Taiwan", "Thailand", "United Kingdom", "United States", "Uruguay"].every((country) => QARI_PUBLIC_PROFILES.find((profile) => profile.country === country)?.isQariV2));
const malaysiaPilot = QARI_V2_PILOT_PROFILES.find((profile) => profile.country === "Malaysia");
const turkeyPilot = QARI_V2_PILOT_PROFILES.find((profile) => profile.country === "Turkey");
const kazakhstanPilot = QARI_V2_PILOT_PROFILES.find((profile) => profile.country === "Kazakhstan");
assert.equal(malaysiaPilot?.level, "extreme");
assert.equal(turkeyPilot?.dimensions.digitalExposure.level, "high");
assert.equal(kazakhstanPilot?.dimensions.stateRepression.unknown, true);
assert.ok(QARI_V2_PILOT_PROFILES.flatMap((profile) => profile.eligibleFindings).every((finding) => /^https:\/\//.test(finding.sourceUrl)));
const malaysiaSafetyReview = evaluateQariV2SafetyReview(malaysiaPilot, QARI_V2_PILOT_SAFETY_REVIEWS[malaysiaPilot.destinationKey]);
const turkeySafetyReview = evaluateQariV2SafetyReview(turkeyPilot, QARI_V2_PILOT_SAFETY_REVIEWS[turkeyPilot.destinationKey]);
const kazakhstanSafetyReview = evaluateQariV2SafetyReview(kazakhstanPilot, QARI_V2_PILOT_SAFETY_REVIEWS[kazakhstanPilot.destinationKey]);
assert.equal(malaysiaSafetyReview.readyForPublicQariV2, true);
assert.equal(turkeySafetyReview.readyForPublicQariV2, true);
assert.equal(kazakhstanSafetyReview.readyForPublicQariV2, true);
const russiaPilot = QARI_V2_PILOT_PROFILES.find((profile) => profile.country === "Russia");
const russiaSafetyReview = evaluateQariV2SafetyReview(russiaPilot, QARI_V2_PILOT_SAFETY_REVIEWS[russiaPilot.destinationKey]);
assert.equal(russiaSafetyReview.readyForPublicQariV2, true);
const lebanonPilot = QARI_V2_PILOT_PROFILES.find((profile) => profile.country === "Lebanon");
const sriLankaPilot = QARI_V2_PILOT_PROFILES.find((profile) => profile.country === "Sri Lanka");
assert.equal(evaluateQariV2SafetyReview(lebanonPilot, QARI_V2_PILOT_SAFETY_REVIEWS[lebanonPilot.destinationKey]).readyForPublicQariV2, true);
assert.equal(evaluateQariV2SafetyReview(sriLankaPilot, QARI_V2_PILOT_SAFETY_REVIEWS[sriLankaPilot.destinationKey]).readyForPublicQariV2, true);
const armeniaPilot = QARI_V2_PILOT_PROFILES.find((profile) => profile.country === "Armenia");
assert.equal(evaluateQariV2SafetyReview(armeniaPilot, QARI_V2_PILOT_SAFETY_REVIEWS[armeniaPilot.destinationKey]).readyForPublicQariV2, true);
const guatemalaPilot = QARI_V2_PILOT_PROFILES.find((profile) => profile.country === "Guatemala");
assert.equal(evaluateQariV2SafetyReview(guatemalaPilot, QARI_V2_PILOT_SAFETY_REVIEWS[guatemalaPilot.destinationKey]).readyForPublicQariV2, true);
const countryOnlyHighProfile = createQariV2Profile({
  destinationKey: "country:country-only-test",
  country: "Country-only Test",
  summary: "A country-only QARI page has no city or venue directory surface to release.",
  findings: [{ ruleCode: "L-02", evidenceGrade: "A", sourceUrl: "https://example.org/law" }],
  evidenceAvailability: { legal: "good" },
  reviewedAt: "2026-10-26",
});
assert.equal(evaluateQariV2SafetyReview(countryOnlyHighProfile).readyForPublicQariV2, true);

console.log("QARI 2.0 rule engine checks passed.");
