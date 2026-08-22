const SAFETY_AND_INCLUSION_INDICATORS = Object.freeze([
  Object.freeze({
    key: "legal-rights",
    label: "Legal rights",
    weight: 20,
    definition:
      "Current national, regional, and municipal protections covering criminalisation, discrimination, hate crime, family rights, gender recognition, intersex bodily integrity, civil-society space, and asylum.",
    permittedSources: Object.freeze(["A", "B"]),
  }),
  Object.freeze({
    key: "municipal-protection-services",
    label: "Municipal protection & services",
    weight: 10,
    definition:
      "Enforceable local protections, inclusive public services, community liaison, health access, and documented municipal support.",
    permittedSources: Object.freeze(["A", "B", "C"]),
  }),
  Object.freeze({
    key: "lived-safety",
    label: "Lived safety",
    weight: 12,
    definition:
      "Structured lived-experience measures with disclosed recruitment, sample size, field dates, demographic coverage, weighting, and uncertainty. Ordinary reviews cannot substitute for a city-level survey.",
    permittedSources: Object.freeze(["B", "E"]),
  }),
  Object.freeze({
    key: "practical-access",
    label: "Practical access",
    weight: 8,
    definition:
      "Recently verified venue welcome, transparent door and access policies, route usability, and practical fallback options. Unknown policies remain unknown.",
    permittedSources: Object.freeze(["C", "D", "E"]),
  }),
]);

const CULTURE_AND_COMMUNITY_INDICATORS = Object.freeze([
  Object.freeze({
    key: "nightlife-depth-diversity",
    label: "Nightlife depth & diversity",
    weight: 15,
    definition:
      "Verified year-round scene depth across distinct nightlife formats, using capped scale and density measures rather than uncapped raw counts.",
    permittedSources: Object.freeze(["C", "D", "E"]),
  }),
  Object.freeze({
    key: "community-infrastructure",
    label: "Community infrastructure",
    weight: 15,
    definition:
      "Year-round non-nightlife infrastructure including community organisations, health and support services, bookshops, cafés, cultural spaces, and meeting places.",
    permittedSources: Object.freeze(["A", "B", "C", "D"]),
  }),
  Object.freeze({
    key: "events-continuity",
    label: "Events & continuity",
    weight: 10,
    definition:
      "Verified recurring and current events across the observation window, balancing cultural continuity and variety instead of rewarding duplicate listings.",
    permittedSources: Object.freeze(["C", "D"]),
  }),
  Object.freeze({
    key: "representation-accessibility",
    label: "Representation & accessibility",
    weight: 10,
    definition:
      "Documented breadth of spaces and programmes serving different queer communities, with accessibility treated as a substantive measure rather than a venue-count bonus.",
    permittedSources: Object.freeze(["B", "C", "D", "E"]),
  }),
]);

export const GLOBAL_QUEER_CITY_INDEX_PROGRAM = Object.freeze({
  workingTitle: "Global Queer Safety & Culture Index",
  slug: "global-queer-safety-culture-index",
  status: "methodology-development",
  baselineYear: 2026,
  methodologyVersion: "QA-GQCI-0.2",
  snapshotSchemaVersion: "QA-GQCI-SNAPSHOT-1.1",
  purpose:
    "Compare how well cities support safe, practical, and culturally rich queer life through a transparent, repeatable evidence model.",
  scoreArchitecture: Object.freeze({
    maximum: 100,
    formula: "2 × √(Safety & Inclusion points × Culture & Community points)",
    rationale:
      "The geometric aggregation limits compensation: cultural strength cannot fully erase weak safety and inclusion performance.",
    subindexes: Object.freeze([
      Object.freeze({
        key: "safety-and-inclusion",
        label: "Safety & Inclusion",
        maximum: 50,
        description: "Structural protection, lived experience, and practical access.",
        indicators: SAFETY_AND_INCLUSION_INDICATORS,
      }),
      Object.freeze({
        key: "culture-and-community",
        label: "Culture & Community",
        maximum: 50,
        description: "Nightlife, non-nightlife infrastructure, continuity, and representation.",
        indicators: CULTURE_AND_COMMUNITY_INDICATORS,
      }),
    ]),
  }),
  momentum: Object.freeze({
    scoreBearing: false,
    label: "Verified momentum",
    methodology: "Change is reported separately from the level score and requires compatible frozen snapshots plus a disclosed material-change threshold.",
    minimumComparableSnapshots: 2,
  }),
  publishingRhythm: Object.freeze([
    Object.freeze({
      label: "Annual flagship index",
      detail: "One frozen, fully documented city comparison with a stable edition URL and downloadable dataset.",
    }),
    Object.freeze({
      label: "Quarterly Queer City Pulse",
      detail: "Separate change analysis from comparable snapshots; momentum never changes the annual level score.",
    }),
  ]),
  evidenceConfidence: Object.freeze({
    scoreBearing: false,
    levels: Object.freeze(["high", "medium", "limited", "insufficient"]),
    description:
      "A separate disclosure of source recency, coverage, sample quality, and verification depth. Better Queer Atlas coverage cannot inflate a city's index score.",
  }),
  sourceHierarchy: Object.freeze([
    Object.freeze({ level: "A", label: "Primary public record", examples: "Legislation, regulation, municipal policy, official statistics, and court or authority records." }),
    Object.freeze({ level: "B", label: "Established research", examples: "Transparent datasets and research from recognised rights, academic, or public-interest institutions." }),
    Object.freeze({ level: "C", label: "Verified first-party source", examples: "Official venue, organisation, service, and event information with an observation date." }),
    Object.freeze({ level: "D", label: "Queer Atlas verification", examples: "Documented editorial checks with reviewer, date, evidence, and correction history." }),
    Object.freeze({ level: "E", label: "Structured community evidence", examples: "Member or survey evidence with collection method, sample size, recency, and limitations." }),
  ]),
  sourceRecordContract: Object.freeze([
    "source_id",
    "source_level",
    "publisher",
    "source_url",
    "published_at",
    "accessed_at",
    "observed_at",
    "geographic_level",
    "population_scope",
    "collection_method",
    "sample_size",
    "verification_status",
    "reviewer_id",
    "supersedes_source_id",
    "limitations",
  ]),
  comparisonFrame: Object.freeze({
    selectionRule:
      "The comparison panel and regional coverage are declared before scoring and cannot be based on Queer Atlas venue coverage.",
    geographicUnit:
      "Every city uses a published boundary definition and boundary version that remains fixed within an edition.",
    cohorts: Object.freeze(["large urban centres", "mid-size urban centres", "smaller cities and towns"]),
    reportingRule:
      "Cohort results are shown alongside any global table so that small destinations are not presented as directly equivalent to major metropolitan areas without context.",
    inauguralSamplingFrame: Object.freeze({
      status: "pre-registered-design",
      targetCities: 36,
      regions: Object.freeze([
        "Africa",
        "Asia",
        "Europe",
        "Latin America & the Caribbean",
        "Northern America",
        "Oceania",
      ]),
      cohortDefinitions: Object.freeze([
        Object.freeze({ key: "large", label: "Large urban centres", populationRule: "3,000,000 residents or more" }),
        Object.freeze({ key: "mid-size", label: "Mid-size urban centres", populationRule: "1,000,000 to 2,999,999 residents" }),
        Object.freeze({ key: "smaller", label: "Smaller cities and towns", populationRule: "50,000 to 999,999 residents" }),
      ]),
      allocation:
        "Two cities per region and population cohort: 6 regions × 3 cohorts × 2 cities. Empty strata are disclosed and are never silently moved to a better-covered region.",
      populationUniverse:
        "United Nations World Urbanization Prospects 2025, table F21, using the 2025 harmonised Degree of Urbanization city population.",
      regionStandard:
        "UN Statistics Division M49 regions and subregions; the Americas are split into Northern America and Latin America & the Caribbean before selection.",
      boundaryStandard:
        "Use the WUP 2025 harmonised Degree of Urbanization geometry or its linked GHSL urban-centre boundary, recording dataset release and feature identifier.",
      editionSeed: "QA-GQCI-2026-CITY-FRAME-01",
      seedRule:
        "For each stratum, hash editionSeed + ':' + region + ':' + cohort with SHA-256; convert the first eight hexadecimal characters to an unsigned integer and select integer modulo the number of eligible second-city candidates.",
      deterministicSelection: Object.freeze([
        "Create every region-by-cohort stratum from the frozen WUP universe before any Queer Atlas or outcome data are inspected.",
        "Rank eligible cities by 2025 population and retain the largest city per stratum as the anchor.",
        "Select the second city from the next four with the published SHA-256 seed rule, excluding a duplicate country where another eligible country exists.",
        "Freeze an ordered reserve list with the same rule. Replacement is allowed only for documented data insufficiency and must remain visible in the edition change log.",
      ]),
      exclusions: Object.freeze([
        "No selection based on Queer Atlas venue count, editorial preference, sponsor presence, expected score, or anticipated headline value.",
        "No city is excluded merely because its legal or lived-safety context is adverse; critical-risk rules govern reporting, not sample removal.",
        "A pilot may test collection tools on named cities, but pilot cities cannot be presented as the inaugural global ranking unless they qualify through this frozen frame.",
      ]),
      freezeRequirements: Object.freeze([
        "Archive the source file checksum, edition seed, generated strata, selected cities, reserves, boundary ids, and generation code.",
        "Publish the complete selected-city register before scoring begins.",
      ]),
    }),
  }),
  missingDataPolicy: Object.freeze({
    unknownIsZero: false,
    automaticReweighting: false,
    crossCityImputation: false,
    minimumIndicatorCoverage: 0.7,
    rule:
      "Unknown evidence is labelled unknown. An overall score is withheld when a critical indicator is missing or minimum coverage is not met; a partial city profile may still be published.",
  }),
  riskAndEligibilityRules: Object.freeze([
    "A current sourced legal context is required; criminalisation or documented state persecution triggers a critical-risk context label and exclusion from positive best-city headlines.",
    "City eligibility is determined by the declared comparison frame, not by a minimum number of Queer Atlas venues.",
    "A city without sufficient evidence is marked not rated rather than assigned a low score.",
    "Community evidence cannot establish law, general crime risk, or population-wide safety on its own.",
    "Commercial relationships, paid listings, and advertising cannot affect eligibility, indicators, weights, or rank.",
  ]),
  normalizationAndRobustness: Object.freeze({
    countTreatment: "Use capped scale and density measures with every cap, denominator, and transformation published per indicator.",
    outliers: "Publish the outlier rule and retain an audit value before any capping or transformation.",
    uncertainty: "Publish evidence coverage, survey uncertainty where available, and rank bands when model uncertainty makes exact order unstable.",
    sensitivityTests: Object.freeze([
      "Vary indicator weights within a declared range.",
      "Compare geometric and arithmetic aggregation.",
      "Test inclusion and exclusion of indicators with material missingness.",
      "Publish which cities move materially under plausible model choices.",
    ]),
  }),
  editorialIndependence: Object.freeze([
    "Publish funding, partnerships, affiliate relationships, and material conflicts.",
    "Freeze scoring rules before the edition is calculated.",
    "Record a human reviewer for high-impact evidence and prohibit unsupervised AI-derived score claims.",
    "Require an external methodology review before the first ranked edition.",
    "Publish corrections, appeals, and a dated change log without silently rewriting a frozen edition.",
  ]),
  snapshotContract: Object.freeze([
    "snapshot_id",
    "snapshot_at",
    "schema_version",
    "methodology_version",
    "comparison_cohort",
    "city_slug",
    "boundary_version",
    "source_window_start",
    "source_window_end",
    "indicator_values",
    "subindex_scores",
    "overall_score",
    "risk_context",
    "evidence_confidence",
    "evidence_coverage",
    "source_ids",
    "uncertainty",
    "limitations",
  ]),
  publicationGates: Object.freeze([
    "Publish the complete indicator dictionary, source hierarchy, transformations, missing-data rules, and limitations before the first league table.",
    "Freeze source data, boundary definitions, calculations, and methodology version for every edition.",
    "Pass sensitivity analysis and document an external methodology review before publishing ranks.",
    "Provide a stable report URL, citation text, source register, update history, and downloadable machine-readable data.",
    "Do not label a city safest, best, or fastest-growing beyond what the assessed sample and comparable snapshots substantiate.",
  ]),
});

export function getGlobalQueerCityIndexWeightTotal() {
  return GLOBAL_QUEER_CITY_INDEX_PROGRAM.scoreArchitecture.subindexes.reduce(
    (total, subindex) => total + subindex.indicators.reduce((subtotal, indicator) => subtotal + indicator.weight, 0),
    0
  );
}

export function getGlobalQueerCitySubindexWeightTotal(subindexKey = "") {
  const subindex = GLOBAL_QUEER_CITY_INDEX_PROGRAM.scoreArchitecture.subindexes.find(
    (entry) => entry.key === subindexKey
  );
  return subindex?.indicators.reduce((total, indicator) => total + indicator.weight, 0) || 0;
}
