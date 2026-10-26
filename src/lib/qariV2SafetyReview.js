import { QARI_V2_LEVEL_RANK } from "./qariV2.js";
import { cityCoreConfig } from "./cityCore.js";

const REQUIRED_HIGH_RISK_CHECKS = Object.freeze([
  "guideCopyReviewed",
  "translationsReviewed",
  "venueAccessReviewed",
  "searchAndSeoReviewed",
]);

export const QARI_V2_SAFETY_REVIEWS = Object.freeze({
  "country:nicaragua": {
    reviewedAt: "2026-10-26",
    cities: {
      managua: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true },
    },
  },
  "country:vietnam": {
    reviewedAt: "2026-10-26",
    cities: {
      hanoi: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true },
      ho_chi_minh: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true },
    },
  },
  "country:serbia": {
    reviewedAt: "2026-10-26",
    cities: {
      belgrade: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true },
    },
  },
  "country:ukraine": {
    reviewedAt: "2026-10-26",
    cities: {
      kyiv: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true },
    },
  },
  "country:morocco": {
    reviewedAt: "2026-10-26",
    cities: {
      marrakech: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true },
    },
  },
  "country:indonesia": {
    reviewedAt: "2026-10-26",
    cities: {
      bali: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true },
      jakarta: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true },
    },
  },
  "country:china": {
    reviewedAt: "2026-10-26",
    cities: {
      beijing: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true },
      shanghai: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true },
    },
  },
  "country:egypt": {
    reviewedAt: "2026-10-26",
    cities: {
      cairo: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true },
    },
  },
  "country:malaysia": {
    reviewedAt: "2026-10-26",
    cities: {
      kuala_lumpur: {
        guideCopyReviewed: true,
        translationsReviewed: true,
        venueAccessReviewed: true,
        searchAndSeoReviewed: true,
      },
    },
  },
  "country:turkey": {
    reviewedAt: "2026-10-26",
    cities: {
      istanbul: {
        guideCopyReviewed: true,
        translationsReviewed: true,
        venueAccessReviewed: true,
        searchAndSeoReviewed: true,
      },
    },
  },
  "country:kazakhstan": {
    reviewedAt: "2026-10-26",
    cities: {
      almaty: {
        guideCopyReviewed: true,
        translationsReviewed: true,
        venueAccessReviewed: true,
        searchAndSeoReviewed: true,
      },
    },
  },
  "country:russia": {
    reviewedAt: "2026-10-26",
    cities: {
      moscow: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true },
      saint_petersburg: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true },
    },
  },
  "country:lebanon": {
    reviewedAt: "2026-10-26",
    cities: {
      beirut: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true },
    },
  },
  "country:sri-lanka": {
    reviewedAt: "2026-10-26",
    cities: {
      colombo: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true },
    },
  },
  "country:armenia": {
    reviewedAt: "2026-10-26",
    cities: {
      yerevan: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true },
    },
  },
  "country:guatemala": {
    reviewedAt: "2026-10-26",
    cities: {
      guatemala_city: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true },
    },
  },
  "country:venezuela": {
    reviewedAt: "2026-10-26",
    cities: { caracas: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true } },
  },
  "country:bosnia-and-herzegovina": {
    reviewedAt: "2026-10-26",
    cities: { sarajevo: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true } },
  },
  "country:honduras": {
    reviewedAt: "2026-10-26",
    cities: { tegucigalpa: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true } },
  },
  "country:georgia": {
    reviewedAt: "2026-10-26",
    cities: { tbilisi: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true } },
  },
  "country:hungary": {
    reviewedAt: "2026-10-26",
    cities: {
      budapest: { guideCopyReviewed: true, translationsReviewed: true, venueAccessReviewed: true, searchAndSeoReviewed: true },
    },
  },
});

// Backward-compatible export for callers created during the initial cohort.
export const QARI_V2_PILOT_SAFETY_REVIEWS = QARI_V2_SAFETY_REVIEWS;

export function evaluateQariV2SafetyReview(profile, review = {}) {
  const needsFullReview = QARI_V2_LEVEL_RANK[profile?.level] >= QARI_V2_LEVEL_RANK.high;
  const cities = Object.entries(review.cities || {});
  const expectedCityKeys = Object.entries(cityCoreConfig)
    .filter(([, city]) => String(city.country || "").toLowerCase() === String(profile?.country || "").toLowerCase())
    .map(([cityKey]) => cityKey);
  const missing = cities.flatMap(([cityKey, checks]) => (
    (needsFullReview ? REQUIRED_HIGH_RISK_CHECKS : ["guideCopyReviewed"])
      .filter((check) => !checks[check])
      .map((check) => `${cityKey}:${check}`)
  ));

  // A country-only QARI page has no city guide or venue surface to review. It can
  // be public when its evidence is ready; catalog cities still require all checks.
  if (needsFullReview && expectedCityKeys.length > 0 && cities.length === 0) missing.push("country:citySafetyReview");
  if (needsFullReview && !review.reviewedAt) missing.push("country:reviewedAt");
  if (needsFullReview && expectedCityKeys.length > 0) {
    const reviewedCityKeys = new Set(cities.map(([cityKey]) => cityKey));
    expectedCityKeys.filter((cityKey) => !reviewedCityKeys.has(cityKey)).forEach((cityKey) => missing.push(`${cityKey}:citySafetyReview`));
  }

  return {
    readyForPublicQariV2: missing.length === 0,
    requiresFullReview: needsFullReview,
    missing,
  };
}
