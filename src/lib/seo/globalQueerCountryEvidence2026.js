export const FMGB_GBUR_2024_URL = "https://www.fandmglobalbarometers.org/gbur-results/";
export const FMGB_GBPI_2024_URL = "https://www.fandmglobalbarometers.org/gbpi-results/";

// Published country scores copied from the official F&M result tables. Keep this
// register versioned: a new edition must never silently rewrite an old snapshot.
const GBUR_2024 = Object.freeze({
  Albania: 73, Argentina: 76, Australia: 83, Austria: 90, Belgium: 93, Bolivia: 90,
  "Bosnia and Herzegovina": 61, Brazil: 90, Bulgaria: 59, Cambodia: 51, Canada: 90,
  Chile: 78, China: 29, Colombia: 80, "Costa Rica": 92, Croatia: 85, Cuba: 78,
  Cyprus: 68, Czechia: 73, Denmark: 95, "Dominican Republic": 34, Ecuador: 83,
  Egypt: 20, "El Salvador": 41, Estonia: 80, Finland: 88, France: 88, Georgia: 66,
  Germany: 88, Greece: 80, Guatemala: 29, Honduras: 61, "Hong Kong, China": 56,
  Hungary: 76, Iceland: 95, India: 54, Indonesia: 12, Ireland: 78, Israel: 68,
  Italy: 56, Japan: 51, Latvia: 61, Lebanon: 15, Lithuania: 63, Malaysia: 12,
  Malta: 95, Mexico: 63, Montenegro: 83, Morocco: 15, Namibia: 29, Netherlands: 85,
  "New Zealand": 85, Nicaragua: 29, Norway: 95, Panama: 44, Paraguay: 37, Peru: 71,
  Philippines: 46, Poland: 54, Portugal: 95, Romania: 59, Russia: 17, Serbia: 73,
  Singapore: 59, Slovakia: 73, Slovenia: 80, "South Africa": 80, "South Korea": 49,
  Spain: 93, Sweden: 95, Switzerland: 88, Taiwan: 76, Thailand: 63, "Türkiye": 22,
  Ukraine: 68, "United Kingdom": 85, "United States": 78, Uruguay: 93,
  Venezuela: 51, Vietnam: 51,
});

const GBPI_2024 = Object.freeze({
  Albania: 36, Argentina: 66, Australia: 70, Austria: 71, Belgium: 65, Bolivia: 51,
  Brazil: 51, Bulgaria: 43, Canada: 71, Chile: 62, China: 53, Colombia: 53,
  "Costa Rica": 65, Croatia: 55, Cyprus: 56, Czechia: 61, Denmark: 76,
  "Dominican Republic": 47, Ecuador: 51, Egypt: 20, "El Salvador": 41, Estonia: 69,
  Finland: 76, France: 63, Georgia: 37, Germany: 68, Greece: 56, Guatemala: 43,
  Honduras: 39, "Hong Kong, China": 68, Hungary: 59, Iceland: 80, India: 41,
  Indonesia: 38, Ireland: 68, Israel: 71, Italy: 59, Japan: 73, Latvia: 56,
  Lebanon: 32, Lithuania: 55, Malaysia: 41, Malta: 76, Mexico: 56, Morocco: 26,
  Namibia: 37, Netherlands: 72, "New Zealand": 73, Nicaragua: 51, Norway: 78,
  Panama: 54, Paraguay: 48, Peru: 50, Philippines: 60, Poland: 60, Portugal: 67,
  Romania: 50, Russia: 33, Serbia: 42, Singapore: 61, Slovakia: 47, Slovenia: 64,
  "South Africa": 60, "South Korea": 40, Spain: 70, Sweden: 77, Switzerland: 73,
  Taiwan: 76, Thailand: 72, "Türkiye": 35, Ukraine: 47, "United Kingdom": 69,
  "United States": 58, Uruguay: 69, Venezuela: 52, Vietnam: 62,
});

const COUNTRY_ALIASES = Object.freeze({
  "Czech Republic": "Czechia",
  "Hong Kong": "Hong Kong, China",
  Turkey: "Türkiye",
});

export function getFmgbCountryEvidence(country = "") {
  const sourceCountry = COUNTRY_ALIASES[country] || country;
  const inheritedFrom = country === "Puerto Rico" ? "United States" : null;
  const lookupCountry = inheritedFrom || sourceCountry;
  return Object.freeze({
    country,
    sourceCountry: lookupCountry,
    inheritedFrom,
    unifiedRights: GBUR_2024[lookupCountry] ?? null,
    livedExperience: inheritedFrom ? null : (GBPI_2024[lookupCountry] ?? null),
    year: 2024,
  });
}

export const FMGB_GBUR_2024 = GBUR_2024;
export const FMGB_GBPI_2024 = GBPI_2024;
