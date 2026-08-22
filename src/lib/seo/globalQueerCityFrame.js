import frame2026 from "./globalQueerCityFrame2026.json";
import boundaries2026 from "./globalQueerCityBoundaries2026.json";

export const GLOBAL_QUEER_CITY_FRAME_2026 = frame2026;
export const GLOBAL_QUEER_CITY_BOUNDARIES_2026 = boundaries2026;

export function getGlobalQueerCityFrameSummary(frame = GLOBAL_QUEER_CITY_FRAME_2026) {
  return Object.freeze({
    strata: frame.strata.length,
    selectedCities: frame.strata.reduce((total, stratum) => total + stratum.selected.length, 0),
    reserveEntries: frame.strata.reduce((total, stratum) => total + stratum.reserves.length, 0),
    regions: new Set(frame.strata.map((stratum) => stratum.region)).size,
    cohorts: new Set(frame.strata.map((stratum) => stratum.cohort)).size,
  });
}

export function getGlobalQueerCityFrameSelections(frame = GLOBAL_QUEER_CITY_FRAME_2026) {
  return frame.strata.flatMap((stratum) => stratum.selected);
}

export function getGlobalQueerCityBoundarySummary(boundaries = GLOBAL_QUEER_CITY_BOUNDARIES_2026) {
  return Object.freeze({
    total: boundaries.cities.length,
    verified: boundaries.cities.filter((city) => city.boundaryStatus === "verified").length,
    qualityFlags: boundaries.cities.reduce((total, city) => total + city.dataQualityFlags.length, 0),
    status: boundaries.status,
  });
}
