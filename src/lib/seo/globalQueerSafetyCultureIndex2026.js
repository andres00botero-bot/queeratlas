import snapshot from "./globalQueerSafetyCultureIndex2026.json" with { type: "json" };

export const GLOBAL_QUEER_SAFETY_CULTURE_INDEX_2026 = snapshot.entries;

export const GLOBAL_QUEER_SAFETY_CULTURE_INDEX_META_2026 = {
  title: "Global Queer Safety & Culture Index 2026",
  edition: "2026 Atlas edition",
  publishedAt: snapshot.snapshotAt,
  atlasCities: snapshot.scope.atlasCities,
  rankedCities: snapshot.scope.rankedCities,
  ratedButNotRankedCities: snapshot.scope.ratedButNotRankedCities,
  countriesAndTerritories: snapshot.scope.countriesAndTerritories,
  formula: snapshot.weights.overall,
  limitation: snapshot.limitation,
  sources: snapshot.sources,
};
