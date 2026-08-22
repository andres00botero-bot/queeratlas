import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  GLOBAL_QUEER_CITY_INDEX_PROGRAM,
  getGlobalQueerCityIndexWeightTotal,
  getGlobalQueerCitySubindexWeightTotal,
} from "../src/lib/seo/globalQueerCityIndex.js";
import {
  GLOBAL_QUEER_CITY_REFERENCE_SOURCES,
  validateGlobalQueerCitySourceRecord,
} from "../src/lib/seo/globalQueerCitySourceCatalog.js";
import { getFmgbCountryEvidence } from "../src/lib/seo/globalQueerCountryEvidence2026.js";
import { getGlobalQueerMultiSourceEvidence } from "../src/lib/seo/globalQueerMultiSourceEvidence2026.js";

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const program = GLOBAL_QUEER_CITY_INDEX_PROGRAM;
const rankingSnapshot = JSON.parse(readFileSync(new URL("../src/lib/seo/globalQueerSafetyCultureIndex2026.json", import.meta.url), "utf8"));
const ranking = rankingSnapshot.entries;
const frame = JSON.parse(readFileSync(new URL("../src/lib/seo/globalQueerCityFrame2026.json", import.meta.url), "utf8"));
const boundaries = JSON.parse(readFileSync(new URL("../src/lib/seo/globalQueerCityBoundaries2026.json", import.meta.url), "utf8"));
assert(program.status === "methodology-development", "the index must remain marked as in development");
assert(program.methodologyVersion === "QA-GQCI-0.2", "the reviewed methodology draft must be versioned");
assert(program.snapshotSchemaVersion === "QA-GQCI-SNAPSHOT-1.1", "the expanded snapshot contract must be versioned");
assert(getGlobalQueerCityIndexWeightTotal() === 100, "score-bearing indicator weights must total 100");
assert(getGlobalQueerCitySubindexWeightTotal("safety-and-inclusion") === 50, "Safety & Inclusion must total 50 points");
assert(getGlobalQueerCitySubindexWeightTotal("culture-and-community") === 50, "Culture & Community must total 50 points");
assert(program.evidenceConfidence.scoreBearing === false, "evidence confidence must not inflate city scores");
assert(program.momentum.scoreBearing === false && program.momentum.minimumComparableSnapshots === 2, "momentum must stay separate and require comparable snapshots");
assert(program.missingDataPolicy.unknownIsZero === false, "unknown evidence must never become zero");
assert(program.missingDataPolicy.automaticReweighting === false, "missing indicators must not trigger hidden reweighting");
assert(program.missingDataPolicy.crossCityImputation === false, "city evidence must not be imputed from other cities");
assert(program.sourceHierarchy.map((source) => source.level).join("") === "ABCDE", "the public source hierarchy must contain levels A-E");
assert(program.comparisonFrame.selectionRule.includes("cannot be based on Queer Atlas venue coverage"), "city selection must be independent of Atlas coverage");
assert(program.comparisonFrame.inauguralSamplingFrame.targetCities === 36, "the inaugural frame must contain 36 city slots");
assert(program.comparisonFrame.inauguralSamplingFrame.regions.length === 6, "the inaugural frame must balance six regions");
assert(program.comparisonFrame.inauguralSamplingFrame.cohortDefinitions.length === 3, "the inaugural frame must use three population cohorts");
assert(program.comparisonFrame.inauguralSamplingFrame.deterministicSelection.some((rule) => rule.includes("SHA-256")), "second-city selection must be reproducible");
assert(program.comparisonFrame.inauguralSamplingFrame.editionSeed === "QA-GQCI-2026-CITY-FRAME-01", "the selection seed must be frozen before scoring");
assert(program.comparisonFrame.inauguralSamplingFrame.seedRule.includes("first eight hexadecimal characters"), "the seed-to-city rule must be exact");
assert(program.comparisonFrame.inauguralSamplingFrame.exclusions.some((rule) => rule.includes("venue count")), "Atlas coverage must not influence the city sample");
assert(program.comparisonFrame.inauguralSamplingFrame.freezeRequirements.some((rule) => rule.includes("before scoring")), "the city register must freeze before scoring");
assert(program.riskAndEligibilityRules.some((rule) => rule.includes("criminalisation")), "critical legal risk must affect editorial eligibility");
assert(program.normalizationAndRobustness.sensitivityTests.length >= 4, "the methodology must require robustness tests");
assert(program.editorialIndependence.some((rule) => rule.includes("external methodology review")), "external review must gate the first ranking");
assert(program.snapshotContract.includes("snapshot_at"), "snapshots must carry a frozen timestamp");
assert(program.snapshotContract.includes("boundary_version"), "snapshots must freeze city boundaries");
assert(program.snapshotContract.includes("source_ids"), "snapshots must trace their source records");
assert(program.snapshotContract.includes("uncertainty"), "snapshots must disclose uncertainty");
assert(program.snapshotContract.includes("limitations"), "snapshots must disclose limitations");
assert(program.publicationGates.some((gate) => gate.includes("fastest-growing")), "growth claims must require comparable snapshots");
assert(ranking.length === 174, "the Atlas edition must show every published Queer Atlas destination");
assert(rankingSnapshot.schemaVersion === "QA-GQSCI-3.0", "the multi-source published snapshot must use the versioned 3.0 schema");
assert(rankingSnapshot.scope.atlasCities === 174 && rankingSnapshot.scope.rankedCities === 159, "the snapshot scope must distinguish ranked cities from visible regional destinations");
const rankedCities = ranking.filter((entry) => entry.rankEligible);
assert(rankedCities[0].city === "reykjavik" && rankedCities[0].sourceRating === 90.8, "the highest published context must reproduce from the multi-source values");
assert(rankedCities.every((entry) => entry.safetyEvidenceCoverage === 100 && entry.overallScore === null && entry.cultureScoreBearing === false), "every sourced context must have both external sources and no Atlas-derived overall score");
assert(rankedCities.every((entry, index) => entry.rank === index + 1), "every ranked city must have one unique consecutive position");
assert(new Set(rankedCities.map((entry) => entry.rank)).size === rankedCities.length, "rank numbers must never be duplicated");
assert(rankedCities.every((entry, index) => index === 0 || rankedCities[index - 1].sourceRating >= entry.sourceRating), "source contexts must be sorted by the external rating");
assert(rankedCities.every((entry) => !entry.summary.includes("F&M 2024") && entry.sourceReferences.some((source) => source.id === "equaldex-legal") && entry.sourceReferences.some((source) => source.id === "equaldex-opinion") && entry.sourceReferences.some((source) => source.id === "williams-gai")), "each reading must expose the scored multi-source inputs rather than repeat one publisher");
assert(rankingSnapshot.weights.legalProtection === 50 && rankingSnapshot.weights.livedAcceptance === 50 && !Object.hasOwn(rankingSnapshot.weights, "atlasContent"), "published weights must contain only the two actual score pillars");
assert(getFmgbCountryEvidence("Sweden").unifiedRights === 95 && getFmgbCountryEvidence("Sweden").livedExperience === 77, "Sweden must use the published F&M 2024 country evidence");
assert(getFmgbCountryEvidence("Colombia").unifiedRights === 80 && getFmgbCountryEvidence("Colombia").livedExperience === 53, "Colombia must use the published F&M 2024 country evidence");
assert(rankingSnapshot.sources.some((source) => source.publisher === "ILGA World" && source.role.includes("definitions")), "ILGA World must be disclosed as legal definition and audit context without inventing a global score");
const swedenMultiSource = getGlobalQueerMultiSourceEvidence("Sweden");
assert(swedenMultiSource.legalComposite === 82.7 && swedenMultiSource.livedComposite === 77.9 && swedenMultiSource.sourceReferences.length === 6, "Sweden must reproduce from F&M, Equaldex, ILGA-Europe and Williams GAI inputs");
const stockholm = ranking.find((entry) => entry.city === "stockholm");
const bogota = ranking.find((entry) => entry.city === "bogota");
assert(stockholm.safetyScore > bogota.safetyScore && stockholm.rank < bogota.rank, "the complete model must preserve Sweden's stronger sourced safety context instead of rewarding Atlas data quantity");

assert(frame.status === "generated-pending-source-and-boundary-review", "the generated frame must remain unpublished until boundary review");
assert(frame.seed === program.comparisonFrame.inauguralSamplingFrame.editionSeed, "the frame must use the frozen edition seed");
assert(frame.source.sha256 === "3a96030d87aec6c1c50f658d5321067d6345e1ab936c5d2854524f972caa75c0", "the frame must identify the exact WUP workbook bytes");
assert(frame.strata.length === 18, "the generated frame must contain every region-by-cohort stratum");
const frameSelections = frame.strata.flatMap((stratum) => stratum.selected);
assert(frameSelections.length === 36, "the generated frame must select 36 city records");
assert(new Set(frameSelections.map((city) => city.cityCode)).size === 36, "selected WUP city codes must be unique");
for (const stratum of frame.strata) {
  const candidates = [...stratum.selected, ...stratum.reserves].sort((left, right) => left.candidateRank - right.candidateRank);
  const digest = createHash("sha256").update(`${frame.seed}:${stratum.region}:${stratum.cohort}`).digest("hex");
  assert(stratum.seedDigest === digest, `${stratum.region}/${stratum.cohort} must preserve the exact seed digest`);
  assert(stratum.selected.length === 2, `${stratum.region}/${stratum.cohort} must select two cities`);
  assert(stratum.selected[0].candidateRank === 1, `${stratum.region}/${stratum.cohort} must retain its population anchor`);
  const differentCountryCandidates = candidates.slice(1).filter((city) => city.iso3 !== candidates[0].iso3);
  const secondPool = differentCountryCandidates.length ? differentCountryCandidates : candidates.slice(1);
  const expectedSecond = secondPool[Number.parseInt(digest.slice(0, 8), 16) % secondPool.length];
  assert(stratum.selected[1].cityCode === expectedSecond.cityCode, `${stratum.region}/${stratum.cohort} must reproduce its seeded second selection`);
}
assert(boundaries.status === "boundary-verified-pre-scoring", "the boundary crosswalk must remain explicitly pre-scoring");
assert(boundaries.cities.length === 36, "every selected city must have a boundary crosswalk record");
assert(boundaries.cities.every((city) => city.boundaryStatus === "verified"), "every selected city must pass boundary identity checks");
assert(boundaries.cities.every((city) => city.boundaryId && city.boundaryVersion), "every selected city must retain a versioned GHSL boundary id");
assert(boundaries.cities.every((city) => city.centroidDistanceKm <= boundaries.qualityRules.centroidToleranceKm), "every selected city centroid must pass the disclosed tolerance");

const allIndicators = program.scoreArchitecture.subindexes.flatMap((subindex) => subindex.indicators);
assert(allIndicators.find((indicator) => indicator.key === "lived-safety")?.definition.includes("Ordinary reviews cannot substitute"), "ordinary reviews must not stand in for lived-safety surveys");
assert(allIndicators.find((indicator) => indicator.key === "practical-access")?.definition.includes("Unknown policies remain unknown"), "unknown door policies must remain unknown");

assert(GLOBAL_QUEER_CITY_REFERENCE_SOURCES.length >= 5, "the methodology must publish a reference-source review catalog");
assert(new Set(GLOBAL_QUEER_CITY_REFERENCE_SOURCES.map((source) => source.id)).size === GLOBAL_QUEER_CITY_REFERENCE_SOURCES.length, "reference-source ids must be unique");
assert(GLOBAL_QUEER_CITY_REFERENCE_SOURCES.every((source) => source.reviewStatus.startsWith("candidate")), "reference sources must not be silently treated as approved baseline evidence");

const validLegalSource = validateGlobalQueerCitySourceRecord({
  source_id: "law-1",
  source_level: "A",
  publisher: "Public authority",
  source_url: "https://example.gov/law",
  accessed_at: "2026-08-22",
  observed_at: "2026-08-22",
  geographic_level: "country",
  verification_status: "reviewed",
  limitations: "Scope is limited to the cited jurisdiction.",
}, "legal-rights");
assert(validLegalSource.valid, "a complete primary legal source must validate");

const invalidCommunitySource = validateGlobalQueerCitySourceRecord({
  source_id: "community-1",
  source_level: "E",
  publisher: "Queer Atlas members",
  source_url: "https://www.queeratlas.app/",
  accessed_at: "2026-08-22",
  observed_at: "2026-08-22",
  geographic_level: "city",
  verification_status: "unreviewed",
  limitations: "Self-selected sample.",
}, "lived-safety");
assert(!invalidCommunitySource.valid && invalidCommunitySource.errors.some((error) => error.includes("sample_size")), "community evidence must disclose collection method and sample size");

const invalidLegalLevel = validateGlobalQueerCitySourceRecord({ ...{
  source_id: "venue-claim-1",
  source_level: "C",
  publisher: "Venue",
  source_url: "https://example.com/venue",
  accessed_at: "2026-08-22",
  observed_at: "2026-08-22",
  geographic_level: "venue",
  verification_status: "reviewed",
  limitations: "First-party statement only.",
}}, "legal-rights");
assert(!invalidLegalLevel.valid, "a venue source must not establish legal-rights scoring");

const nowSource = readFileSync(new URL("../src/app/now/page.js", import.meta.url), "utf8");
const sectionSource = readFileSync(new URL("../src/app/now/[section]/page.js", import.meta.url), "utf8");
const componentSource = readFileSync(new URL("../src/components/reports/DataReportsNowSection.js", import.meta.url), "utf8");
const sitemapSource = readFileSync(new URL("../src/lib/seo/sitemapEntries.js", import.meta.url), "utf8");
const reportsIndexSource = readFileSync(new URL("../src/lib/seo/reportsIndex.js", import.meta.url), "utf8");
const reportPageSource = readFileSync(new URL("../src/app/reports/[slug]/page.js", import.meta.url), "utf8");
const methodologyReportSource = readFileSync(new URL("../src/components/reports/GlobalQueerCityIndexMethodologyReport.js", import.meta.url), "utf8");

assert(nowSource.includes('href: "/now/data"'), "Now navigation must expose Data & Reports");
assert(nowSource.includes("<DataReportsNowSection />"), "the Data & Reports section must render");
assert(nowSource.includes('title: "Queer Data & Reports"'), "the Data section must have a matching visible hero title");
assert(nowSource.includes("if ((!ready || !today) && !isDataSection)"), "static research content must render without waiting for client data");
assert(sectionSource.includes('title: "Global Queer Safety & Culture Index 2026 | Queer Atlas"'), "the flagship section needs index-first SEO metadata");
assert(componentSource.includes("Global Queer Safety"), "the flagship index must lead the Data & Reports page");
assert(componentSource.includes("Flagship index · 2026"), "the flagship status must be immediately visible");
assert(componentSource.includes("See the 2026 ranking"), "the flagship page must lead readers directly to the ranking");
assert(componentSource.includes("<GlobalQueerSafetyCultureRanking />"), "the flagship page must render the actual index results");
assert(componentSource.includes("What the index measures"), "the score architecture must be easy to find");
assert(componentSource.includes("Other Queer Atlas indexes &amp; reports"), "supporting reports must be visually secondary");
assert(componentSource.includes('const INDEX_ROUTE = "/reports/global-queer-safety-culture-index-methodology"'), "the discovery page must link to the canonical methodology report");
assert(sitemapSource.includes('"/now/data"'), "the Data & Reports discovery URL must be in the sitemap");
assert(reportsIndexSource.includes('slug: "global-queer-safety-culture-index-methodology"'), "the canonical methodology report must be registered");
assert(reportsIndexSource.includes("ranks 159 city units"), "the report scope must distinguish ranked cities from visible regional destinations");
assert(reportPageSource.includes("<GlobalQueerCityIndexMethodologyReport />"), "the canonical report must render its dedicated methodology component");
assert(methodologyReportSource.includes("2026 multi-source index · method QA-GQSCI-3.0"), "the public report must identify the multi-source edition and method");
assert(methodologyReportSource.includes("Legal protection") && methodologyReportSource.includes("Lived acceptance") && !methodologyReportSource.includes("Queer Atlas observations"), "the public score panel must show only the two real score pillars");
assert(methodologyReportSource.includes("minimum of two"), "the public methodology must explain the minimum evidence rule");
assert(methodologyReportSource.includes("No single publisher controls the result"), "the public methodology must explain source triangulation");

if (failures.length) {
  console.error("Global queer index checks failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Global queer index foundation checks passed.");
