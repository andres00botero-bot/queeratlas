import equaldexSnapshot from "./equaldexCountryEvidence2026.json" with { type: "json" };
import { FMGB_GBPI_2024_URL, FMGB_GBUR_2024_URL, getFmgbCountryEvidence } from "./globalQueerCountryEvidence2026.js";

export const WILLIAMS_GAI_2021_URL = "https://williamsinstitute.law.ucla.edu/publications/global-acceptance-index-lgbt/";
export const ILGA_EUROPE_2026_URL = "https://www.ilga-europe.org/report/rainbow-map-2026/";

const GAI_2017_2020 = Object.freeze({
  Albania: 2.65, Argentina: 7.07, Australia: 8.03, Austria: 7.2, Belgium: 7.95, Bolivia: 5.24,
  "Bosnia and Herzegovina": 2.87, Brazil: 7.22, Bulgaria: 4.19, Cambodia: 4.96, Canada: 9.02,
  Chile: 6.83, China: 3.69, Colombia: 6.1, "Costa Rica": 6.35, Croatia: 5.05, Cuba: 5.8,
  Cyprus: 5.16, "Czech Republic": 5.87, Denmark: 8.69, "Dominican Republic": 4.98, Ecuador: 5.47,
  Egypt: 2.48, "El Salvador": 5.22, Estonia: 5.25, Finland: 7.96, France: 7.73, Georgia: 2.94,
  Germany: 7.73, Greece: 5.44, Guatemala: 4.71, Honduras: 5.15, "Hong Kong": 6.38, Hungary: 5.08,
  Iceland: 9.78, India: 5.28, Indonesia: 2.79, Ireland: 8.41, Israel: 5.69, Italy: 6.94,
  Japan: 5.26, Latvia: 4.42, Lebanon: 3.63, Lithuania: 4.38, Malaysia: 3.48, Malta: 8.01,
  Mexico: 6.5, Montenegro: 3.53, Morocco: 3.39, Namibia: 4.93, Netherlands: 9.46,
  "New Zealand": 8.23, Nicaragua: 5.57, Norway: 9.38, Panama: 5.28, Paraguay: 4.74, Peru: 5.15,
  Philippines: 6.06, Poland: 5.15, Portugal: 6.87, "Puerto Rico": 7.52, Romania: 4.1,
  Russia: 3.28, Serbia: 3.71, Singapore: 5.86, Slovakia: 4.82, Slovenia: 6.21,
  "South Africa": 6.01, "South Korea": 4.53, Spain: 8.77, Sweden: 9.18, Switzerland: 8,
  Taiwan: 5.74, Thailand: 5.81, Turkey: 3.94, Ukraine: 2.91, "United Kingdom": 8.34,
  "United States": 7.42, Uruguay: 7.9, Venezuela: 5.51, Vietnam: 4.99,
});

const ILGA_EUROPE_2026 = Object.freeze({
  Spain: 89, Malta: 88, Iceland: 86, Belgium: 85, Denmark: 85, Finland: 70, Germany: 70,
  Norway: 69, Sweden: 68, Greece: 68, Portugal: 67, Netherlands: 64, Ireland: 61, France: 60,
  Austria: 55, Slovenia: 54, Montenegro: 53, Croatia: 51, Switzerland: 50, Estonia: 46,
  "United Kingdom": 44, "Czech Republic": 42, Albania: 41, "Bosnia and Herzegovina": 37,
  Serbia: 34, Cyprus: 34, Latvia: 30, Slovakia: 25, Italy: 24, Lithuania: 24, Hungary: 23,
  Poland: 22, Bulgaria: 20, Ukraine: 19, Romania: 19, Georgia: 12, Turkey: 5, Russia: 2,
});

const equaldexByCountry = new Map(equaldexSnapshot.records.map((record) => [record.country, record]));
const isNumber = (value) => value !== null && value !== undefined && Number.isFinite(Number(value));
const roundOne = (value) => Number(value.toFixed(1));
const average = (values) => roundOne(values.reduce((sum, value) => sum + value, 0) / values.length);

export function getGlobalQueerMultiSourceEvidence(country = "") {
  const fmgb = getFmgbCountryEvidence(country);
  const equaldex = equaldexByCountry.get(country) || {};
  const ilgaEurope = ILGA_EUROPE_2026[country] ?? null;
  const gai = GAI_2017_2020[country] ?? null;

  const legalInputs = [
    isNumber(fmgb.unifiedRights) && { id: "fmgb-rights", value: Number(fmgb.unifiedRights), label: "F&M Unified Rights", role: "Legal input", url: FMGB_GBUR_2024_URL },
    isNumber(equaldex.legal) && { id: "equaldex-legal", value: Number(equaldex.legal), label: "Equaldex Legal", role: "Legal input", url: equaldex.url },
    isNumber(ilgaEurope) && { id: "ilga-europe", value: Number(ilgaEurope), label: "ILGA-Europe 2026", role: "Regional legal input", url: ILGA_EUROPE_2026_URL },
  ].filter(Boolean);
  const livedInputs = [
    isNumber(fmgb.livedExperience) && { id: "fmgb-lived", value: Number(fmgb.livedExperience), label: "F&M Lived", role: "Lived-experience input", url: FMGB_GBPI_2024_URL },
    isNumber(equaldex.opinion) && { id: "equaldex-opinion", value: Number(equaldex.opinion), label: "Equaldex Opinion", role: "Public-opinion input", url: equaldex.url },
    isNumber(gai) && { id: "williams-gai", value: roundOne(Number(gai) * 10), rawValue: Number(gai), label: "Williams GAI", role: "Acceptance input", url: WILLIAMS_GAI_2021_URL },
  ].filter(Boolean);

  const legalComposite = legalInputs.length >= 2 ? average(legalInputs.map((input) => input.value)) : null;
  const livedComposite = livedInputs.length >= 2 ? average(livedInputs.map((input) => input.value)) : null;
  const sourceReferences = [...legalInputs, ...livedInputs].map(({ id, label, role, url, value, rawValue }) => ({ id, label, role, url, value, rawValue }));

  return Object.freeze({
    country,
    legalComposite,
    livedComposite,
    sourceReferences: Object.freeze(sourceReferences),
    legalInputs: Object.freeze(legalInputs),
    livedInputs: Object.freeze(livedInputs),
    values: Object.freeze({
      fmgbUnifiedRights: fmgb.unifiedRights,
      fmgbLivedExperience: fmgb.livedExperience,
      equaldexLegal: equaldex.legal ?? null,
      equaldexOpinion: equaldex.opinion ?? null,
      ilgaEurope2026: ilgaEurope,
      williamsGai2017_2020: gai,
    }),
  });
}

export const GLOBAL_QUEER_MULTI_SOURCE_DATASETS_2026 = Object.freeze({
  equaldex: equaldexSnapshot,
  gai: GAI_2017_2020,
  ilgaEurope: ILGA_EUROPE_2026,
});
