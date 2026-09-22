const SPANISH_SPEAKING_COUNTRY_CODES = new Set([
  "AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "ES", "GQ", "GT",
  "HN", "MX", "NI", "PA", "PE", "PR", "PY", "SV", "UY", "VE",
]);

export function defaultsToSpanishByCountry(countryCode) {
  return SPANISH_SPEAKING_COUNTRY_CODES.has(String(countryCode || "").trim().toUpperCase());
}

