import { getVenueWelcomeEvidence } from "./safetyIndexModel.js";
import { hasCompleteVenueIntelligence, hasRouteReadyEvidence, isEligibleIndexEvent, isEligibleNightlifePlace } from "./nightlifeIndexModel.js";

const INFRASTRUCTURE_TYPES = new Set(["bar", "club", "sauna", "cruise_club", "cruising_area", "cafe", "restaurant", "cinema", "gallery"]);

const roundOne = (value) => Number(Number(value || 0).toFixed(1));
const hasNumericEvidence = (value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
const ratio = (count, total) => total > 0 ? count / total : 0;
const mean = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;

function normalizedCategory(parts, maximum) {
  const known = parts.filter((part) => part.available !== false);
  const possible = known.reduce((sum, part) => sum + part.weight, 0);
  const earned = known.reduce((sum, part) => sum + part.value, 0);
  return { score: roundOne(possible ? (earned / possible) * maximum : 0), knownWeight: possible };
}

export function scoreGlobalQueerCity({ city, country, countryEvidence, places = [], events = [], reviews = [], snapshotAt = "2026-08-22" }) {
  const infrastructurePlaces = places.filter((place) => INFRASTRUCTURE_TYPES.has(String(place?.type || "")) && place?.seo_indexable !== false);
  const nightlifePlaces = places.filter(isEligibleNightlifePlace);
  const placeIds = new Set(infrastructurePlaces.map((place) => String(place?.id || "")));
  const eligibleEvents = events.filter((event) => isEligibleIndexEvent(event, 2026));
  const eligibleReviews = reviews.filter((review) => placeIds.has(String(review?.place_id || "")) && Number(review?.rating) >= 1 && Number(review?.rating) <= 5);
  const safetyReviews = eligibleReviews.filter((review) => Number(review?.safety) >= 1 && Number(review?.safety) <= 5);
  const routeReadyCount = infrastructurePlaces.filter(hasRouteReadyEvidence).length;
  const intelligenceCount = infrastructurePlaces.filter(hasCompleteVenueIntelligence).length;
  const welcomeValues = infrastructurePlaces.map(getVenueWelcomeEvidence).filter((value) => value !== null);
  const doorPolicyCount = infrastructurePlaces.filter((place) => {
    const intel = place?.venue_intel || {};
    return Boolean(String(intel.dress_code || "").trim()) && Boolean(String(intel.staff_inclusivity || "").trim());
  }).length;

  // The published rating uses only the disclosed multi-source country pillars.
  // Atlas inventory and editorial coverage are observations, never score inputs.
  const hasUnifiedRights = hasNumericEvidence(countryEvidence?.legalComposite);
  const hasLivedExperience = hasNumericEvidence(countryEvidence?.livedComposite);
  const unifiedRights = hasUnifiedRights ? Number(countryEvidence.legalComposite) : null;
  const livedExperience = hasLivedExperience ? Number(countryEvidence.livedComposite) : null;
  const legal = { score: hasUnifiedRights ? roundOne(unifiedRights * 0.25) : null, knownWeight: hasUnifiedRights ? 25 : 0 };
  const practical = { score: hasLivedExperience ? roundOne(livedExperience * 0.25) : null, knownWeight: hasLivedExperience ? 25 : 0 };

  const infrastructureGroups = new Set(infrastructurePlaces.map((place) => {
    if (["bar", "club"].includes(place.type)) return "social-nightlife";
    if (["sauna", "cruise_club", "cruising_area"].includes(place.type)) return "sexual-wellness";
    if (["cafe", "restaurant"].includes(place.type)) return "daytime";
    return "culture";
  }));
  const infrastructure = normalizedCategory([
    { weight: 8, value: 8 * Math.sqrt(Math.min(infrastructurePlaces.length, 30) / 30) },
    { weight: 5, value: 5 * ratio(infrastructureGroups.size, 4) },
    { weight: 4, value: 4 * ratio(intelligenceCount, infrastructurePlaces.length), available: infrastructurePlaces.length > 0 },
    { weight: 3, value: 3 * ratio(routeReadyCount, infrastructurePlaces.length), available: infrastructurePlaces.length > 0 },
  ], 20);

  const culturePlaces = infrastructurePlaces.filter((place) => ["cafe", "restaurant", "cinema", "gallery"].includes(place.type));
  const culture = normalizedCategory([
    { weight: 6, value: 6 * Math.sqrt(Math.min(eligibleEvents.length, 20) / 20) },
    { weight: 3, value: 3 * Math.sqrt(Math.min(nightlifePlaces.length, 30) / 30) },
    { weight: 3, value: 3 * ratio(infrastructureGroups.size, 4) },
    { weight: 3, value: 3 * Math.sqrt(Math.min(culturePlaces.length, 8) / 8) },
  ], 15);

  const reviewAverage = mean(eligibleReviews.map((review) => Number(review.rating)));
  const bayesianRating = reviewAverage === null ? null : ((reviewAverage * eligibleReviews.length) + (3.8 * 5)) / (eligibleReviews.length + 5);
  const newestReviewAt = eligibleReviews.map((review) => Date.parse(review.created_at)).filter(Number.isFinite).sort((a, b) => b - a)[0] || null;
  const freshnessDays = newestReviewAt ? Math.max(0, (Date.parse(snapshotAt) - newestReviewAt) / 86400000) : null;
  const community = normalizedCategory([
    { weight: 6, value: 6 * ((bayesianRating - 1) / 4), available: bayesianRating !== null },
    { weight: 3, value: 3 * Math.min(1, eligibleReviews.length / Math.max(infrastructurePlaces.length, 1)), available: eligibleReviews.length > 0 },
    { weight: 4, value: 4 * ratio(welcomeValues.reduce((sum, value) => sum + value, 0), infrastructurePlaces.length), available: welcomeValues.length > 0 },
    { weight: 2, value: 2 * Math.max(0, 1 - freshnessDays / 365), available: freshnessDays !== null },
  ], 15);

  const safetyScore = hasUnifiedRights && hasLivedExperience ? roundOne(legal.score + practical.score) : null;
  const cultureScore = roundOne(infrastructure.score + culture.score + community.score);
  // Atlas culture coverage is currently incomplete and therefore remains an
  // observation only. It must not affect the published source rating or order.
  const sourceRating = safetyScore === null ? null : roundOne(safetyScore * 2);
  const legalRiskCap = unifiedRights < 20 ? 35 : unifiedRights < 40 ? 55 : 100;
  const safetyEvidenceCoverage = hasUnifiedRights && hasLivedExperience ? 100 : hasUnifiedRights || hasLivedExperience ? 50 : 0;
  const atlasEvidenceCoverage = roundOne(100 * (
    Math.min(1, infrastructurePlaces.length / 8) * 0.4
    + Math.min(1, (eligibleEvents.length + culturePlaces.length) / 6) * 0.3
    + Math.min(1, eligibleReviews.length / 5) * 0.3
  ));
  const evidenceCoverage = safetyEvidenceCoverage;
  const rankEligible = hasUnifiedRights && hasLivedExperience;

  return {
    city, country, overallScore: null, sourceRating, safetyScore, cultureScore, cultureScoreBearing: false, evidenceCoverage, safetyEvidenceCoverage, atlasEvidenceCoverage, rankEligible,
    confidence: rankEligible ? "externally-sourced" : "insufficient",
    categoryScores: { legal: legal.score, practical: practical.score, infrastructure: infrastructure.score, culture: culture.score, community: community.score },
    evidence: {
      legalComposite: hasUnifiedRights ? unifiedRights : null,
      livedComposite: hasLivedExperience ? livedExperience : null,
      sourceValues: countryEvidence?.values || {},
      legalSourceCount: countryEvidence?.legalInputs?.length || 0,
      livedSourceCount: countryEvidence?.livedInputs?.length || 0,
      legalSourceSpread: countryEvidence?.legalInputs?.length ? roundOne(Math.max(...countryEvidence.legalInputs.map((input) => input.value)) - Math.min(...countryEvidence.legalInputs.map((input) => input.value))) : null,
      livedSourceSpread: countryEvidence?.livedInputs?.length ? roundOne(Math.max(...countryEvidence.livedInputs.map((input) => input.value)) - Math.min(...countryEvidence.livedInputs.map((input) => input.value))) : null,
      places: infrastructurePlaces.length, nightlifePlaces: nightlifePlaces.length, culturePlaces: culturePlaces.length, events: eligibleEvents.length, reviews: eligibleReviews.length, safetyReviews: safetyReviews.length, welcomeRecords: welcomeValues.length, routeReadyPlaces: routeReadyCount, intelligenceCompletePlaces: intelligenceCount, doorPolicyPlaces: doorPolicyCount,
    },
    legalRiskCap,
  };
}

export function describeGlobalQueerCity(entry) {
  if (entry.safetyScore === null) return "Not rated: one or more comparable external score fields are unavailable for this national context.";
  const rights = entry.evidence.legalComposite;
  const lived = entry.evidence.livedComposite;
  const signedGap = roundOne(rights - lived);
  const gap = roundOne(Math.abs(signedGap));

  const spread = Math.max(entry.evidence.legalSourceSpread || 0, entry.evidence.livedSourceSpread || 0);
  const divergence = spread >= 25 ? " The underlying sources diverge materially, so this position should be read with added caution." : spread >= 15 ? " The source range shows some disagreement and is disclosed in the methodology." : " The contributing sources are comparatively consistent.";
  if (gap <= 4) return `Legal protection and lived acceptance are closely aligned.${divergence}`;
  if (signedGap >= 20) return `A ${gap}-point law-to-life gap holds this position back: formal protection is substantially stronger than lived acceptance.${divergence}`;
  if (signedGap >= 10) return `Legal protection leads lived acceptance by ${gap} points, revealing a meaningful implementation gap.${divergence}`;
  if (signedGap > 0) return `Legal protection leads lived acceptance by ${gap} points, while the two pillars remain relatively close.${divergence}`;
  if (signedGap <= -20) return `Lived acceptance leads legal protection by ${gap} points, signalling social resilience alongside a materially weaker legal framework.${divergence}`;
  if (signedGap <= -10) return `Lived acceptance is ${gap} points ahead of legal protection, making legal reform the clearer constraint.${divergence}`;
  return `Lived acceptance is ${gap} points ahead of legal protection; the pillars are otherwise relatively close.${divergence}`;
}
