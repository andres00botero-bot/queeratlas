import { GLOBAL_QUEER_CITY_INDEX_PROGRAM } from "./globalQueerCityIndex.js";

export const GLOBAL_QUEER_CITY_REFERENCE_SOURCES = Object.freeze([
  Object.freeze({
    id: "un-wup-2025-cities",
    level: "A",
    publisher: "United Nations Department of Economic and Social Affairs, Population Division",
    title: "World Urbanization Prospects 2025 — Cities",
    url: "https://population.un.org/wup/downloads?tab=Cities",
    geographicCoverage: "Global",
    geographicLevel: "city",
    indicatorKeys: Object.freeze([]),
    reviewStatus: "candidate-sampling-frame",
    useConstraint: "Use table F21 and archive the exact file, checksum, extraction date, and 2025 DEGURBA population field used to generate the city panel.",
  }),
  Object.freeze({
    id: "unsd-m49-regions",
    level: "A",
    publisher: "United Nations Statistics Division",
    title: "M49 Standard — Geographic Regions",
    url: "https://unstats.un.org/unsd/methodology/m49/",
    geographicCoverage: "Global",
    geographicLevel: "country and region",
    indicatorKeys: Object.freeze([]),
    reviewStatus: "candidate-sampling-frame",
    useConstraint: "Archive the region mapping used for the edition and disclose the predefined split of the Americas.",
  }),
  Object.freeze({
    id: "ghsl-ucdb-r2024a",
    level: "A",
    publisher: "European Commission Joint Research Centre",
    title: "Global Human Settlement Layer Urban Centre Database R2024A",
    url: "https://human-settlement.emergency.copernicus.eu/ghs_ucdb_2024.php",
    geographicCoverage: "Global",
    geographicLevel: "urban centre",
    indicatorKeys: Object.freeze([]),
    reviewStatus: "candidate-boundary-frame",
    useConstraint: "Record the release, feature identifier, coordinate system, and any boundary crosswalk to the WUP city record.",
  }),
  Object.freeze({
    id: "ilga-world-laws-on-us",
    level: "B",
    publisher: "ILGA World",
    title: "Laws on Us and ILGA World Database",
    url: "https://ilga.org/laws-on-us-report/",
    geographicCoverage: "Global",
    geographicLevel: "country",
    indicatorKeys: Object.freeze(["legal-rights"]),
    reviewStatus: "candidate-requires-edition-check",
    useConstraint: "Use the edition current for the snapshot and preserve the cited category-level source date.",
  }),
  Object.freeze({
    id: "ilga-europe-rainbow-map",
    level: "B",
    publisher: "ILGA-Europe",
    title: "Rainbow Map and Index",
    url: "https://rainbowmap.ilga-europe.org/about",
    geographicCoverage: "Europe",
    geographicLevel: "country",
    indicatorKeys: Object.freeze(["legal-rights"]),
    reviewStatus: "candidate-regional-supplement",
    useConstraint: "Use as a transparent regional legal-policy supplement; do not extrapolate beyond covered jurisdictions.",
  }),
  Object.freeze({
    id: "fra-lgbtiq-survey-iii",
    level: "B",
    publisher: "European Union Agency for Fundamental Rights",
    title: "EU LGBTIQ Survey III",
    url: "https://fra.europa.eu/en/publication/2025/technical-report-eu-lgbtiq-survey-iii",
    geographicCoverage: "EU Member States and covered candidate countries",
    geographicLevel: "country",
    indicatorKeys: Object.freeze(["lived-safety"]),
    reviewStatus: "candidate-regional-supplement",
    useConstraint: "Retain the survey's self-selection, weighting, geography, and comparability limitations; never relabel country estimates as city estimates.",
  }),
  Object.freeze({
    id: "hrc-municipal-equality-index",
    level: "B",
    publisher: "Human Rights Campaign Foundation",
    title: "Municipal Equality Index",
    url: "https://www.hrc.org/resources/municipal-equality-index",
    geographicCoverage: "United States",
    geographicLevel: "municipality",
    indicatorKeys: Object.freeze(["municipal-protection-services", "legal-rights"]),
    reviewStatus: "candidate-regional-supplement",
    useConstraint: "Preserve the edition's city-selection and state-versus-local scoring rules; do not treat it as global coverage.",
  }),
  Object.freeze({
    id: "open-for-business-city-ratings",
    level: "B",
    publisher: "Open for Business",
    title: "City Ratings Methodology",
    url: "https://www.citiesreport.open-for-business.org/methodology",
    geographicCoverage: "Selected global cities",
    geographicLevel: "mixed country and city",
    indicatorKeys: Object.freeze(["legal-rights", "lived-safety"]),
    reviewStatus: "candidate-benchmark-only",
    useConstraint: "Use for benchmark and gap analysis unless the underlying indicator licence and city comparability are verified for reuse.",
  }),
  Object.freeze({
    id: "equaldex-equality-index",
    level: "B",
    publisher: "Equaldex",
    title: "Equality Index",
    url: "https://www.equaldex.com/equality-index",
    geographicCoverage: "Global with coverage gaps",
    geographicLevel: "country and territory",
    indicatorKeys: Object.freeze(["legal-rights", "lived-safety"]),
    reviewStatus: "candidate-cross-check-only",
    useConstraint: "Credit Equaldex, observe its API and reuse terms, disclose coverage and date gaps, and do not present a changing current score as historical movement.",
  }),
  Object.freeze({
    id: "williams-global-acceptance-index",
    level: "B",
    publisher: "Williams Institute at UCLA School of Law",
    title: "Global Acceptance Index",
    url: "https://williamsinstitute.law.ucla.edu/publications/global-acceptance-index-lgbt/",
    geographicCoverage: "175 countries and locations in the published study",
    geographicLevel: "country",
    indicatorKeys: Object.freeze(["lived-safety"]),
    reviewStatus: "candidate-longitudinal-benchmark",
    useConstraint: "Use as a longitudinal acceptance benchmark for its 1981–2020 study period; never label it as current city-level safety evidence.",
  }),
  Object.freeze({
    id: "ec-quality-of-life-european-cities-2023",
    level: "A",
    publisher: "European Commission",
    title: "Report on the Quality of Life in European Cities 2023",
    url: "https://ec.europa.eu/regional_policy/sources/reports/qol2023/2023_quality_life_european_cities_en.pdf",
    geographicCoverage: "83 covered European cities",
    geographicLevel: "city",
    indicatorKeys: Object.freeze(["lived-safety"]),
    reviewStatus: "candidate-city-supplement",
    useConstraint: "Use only for cities and questions present in the archived microdata or report; preserve survey uncertainty and do not extrapolate to uncovered cities.",
  }),
]);

const SOURCE_LEVELS = new Set(GLOBAL_QUEER_CITY_INDEX_PROGRAM.sourceHierarchy.map((source) => source.level));
const INDICATOR_SOURCE_LEVELS = new Map(
  GLOBAL_QUEER_CITY_INDEX_PROGRAM.scoreArchitecture.subindexes.flatMap((subindex) =>
    subindex.indicators.map((indicator) => [indicator.key, new Set(indicator.permittedSources)])
  )
);

function hasValue(value) {
  return Boolean(String(value ?? "").trim());
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

export function validateGlobalQueerCitySourceRecord(record = {}, indicatorKey = "") {
  const errors = [];
  const requiredTextFields = [
    "source_id",
    "source_level",
    "publisher",
    "source_url",
    "accessed_at",
    "observed_at",
    "geographic_level",
    "verification_status",
    "limitations",
  ];

  for (const field of requiredTextFields) {
    if (!hasValue(record[field])) errors.push(`${field} is required`);
  }

  if (hasValue(record.source_level) && !SOURCE_LEVELS.has(record.source_level)) {
    errors.push("source_level must be A, B, C, D, or E");
  }

  for (const field of ["accessed_at", "observed_at"]) {
    if (hasValue(record[field]) && !isIsoDate(record[field])) errors.push(`${field} must use YYYY-MM-DD`);
  }

  if (hasValue(record.source_url)) {
    try {
      const url = new URL(record.source_url);
      if (!['http:', 'https:'].includes(url.protocol)) errors.push("source_url must use HTTP or HTTPS");
    } catch {
      errors.push("source_url must be a valid URL");
    }
  }

  if (record.source_level === "D" && !hasValue(record.reviewer_id)) {
    errors.push("reviewer_id is required for Queer Atlas verification");
  }

  if (record.source_level === "E") {
    if (!hasValue(record.collection_method)) errors.push("collection_method is required for structured community evidence");
    if (!Number.isInteger(record.sample_size) || record.sample_size < 1) errors.push("sample_size must be a positive integer for structured community evidence");
  }

  if (indicatorKey) {
    const permittedLevels = INDICATOR_SOURCE_LEVELS.get(indicatorKey);
    if (!permittedLevels) {
      errors.push("indicatorKey is not part of methodology QA-GQCI-0.2");
    } else if (hasValue(record.source_level) && !permittedLevels.has(record.source_level)) {
      errors.push(`source level ${record.source_level} is not permitted for ${indicatorKey}`);
    }
  }

  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}
