const SAFETY_TOPICS = new Set([
  "safest-queer-bars",
  "queer-safe-areas",
  "queer-travel-safety",
]);

const EVENT_TOPICS = new Set([
  "events-tonight",
  "queer-events-this-week",
]);

export function evaluateCityDiscoveryIndexability({ topic = "", discovery = {} } = {}) {
  const exactResults = (Array.isArray(discovery?.results) ? discovery.results : []).filter((result) => result?.exact);
  const minimumExactMatches = EVENT_TOPICS.has(topic) ? 2 : 3;
  const reasons = [];

  if (Number(discovery?.exactCount || 0) < minimumExactMatches) reasons.push("insufficient-exact-matches");
  if (exactResults.length < minimumExactMatches) reasons.push("insufficient-published-results");
  if (SAFETY_TOPICS.has(topic)) {
    const evidencedResults = exactResults.filter(
      (result) => Number(result?.sourceCount || 0) > 0 || Number(result?.reviewCount || 0) >= 3,
    );
    if (evidencedResults.length < minimumExactMatches) reasons.push("insufficient-safety-evidence");
  }

  return {
    indexable: reasons.length === 0,
    reasons,
    minimumExactMatches,
  };
}
