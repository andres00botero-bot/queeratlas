const SPANISH_SPEAKING_COUNTRY_CODES = new Set([
  "AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "ES", "GQ", "GT",
  "HN", "MX", "NI", "PA", "PE", "PR", "PY", "SV", "UY", "VE",
]);

// DACH visitors should receive a language they can use immediately. Belgium,
// Luxembourg and South Tyrol are deliberately not included: country-level
// routing there would be too coarse and can override the visitor's language.
const GERMAN_SPEAKING_COUNTRY_CODES = new Set(["AT", "CH", "DE", "LI"]);
// France and Monaco have a clear country-level French default. Other
// multilingual countries are intentionally handled by Accept-Language first.
const FRENCH_SPEAKING_COUNTRY_CODES = new Set(["FR", "MC"]);

export function defaultsToSpanishByCountry(countryCode) {
  return SPANISH_SPEAKING_COUNTRY_CODES.has(String(countryCode || "").trim().toUpperCase());
}

export function defaultsToGermanByCountry(countryCode) {
  return GERMAN_SPEAKING_COUNTRY_CODES.has(String(countryCode || "").trim().toUpperCase());
}

export function defaultsToFrenchByCountry(countryCode) {
  return FRENCH_SPEAKING_COUNTRY_CODES.has(String(countryCode || "").trim().toUpperCase());
}

