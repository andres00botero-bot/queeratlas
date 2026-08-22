import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { cityCoreConfig } from "../src/lib/cityCore.js";
import { mergeSeedPlaces } from "../src/lib/seedPlacesContent.js";
import { describeGlobalQueerCity, scoreGlobalQueerCity } from "../src/lib/seo/globalQueerSafetyCultureModel.js";
import { FMGB_GBPI_2024_URL, FMGB_GBUR_2024_URL } from "../src/lib/seo/globalQueerCountryEvidence2026.js";
import { ILGA_EUROPE_2026_URL, WILLIAMS_GAI_2021_URL, getGlobalQueerMultiSourceEvidence } from "../src/lib/seo/globalQueerMultiSourceEvidence2026.js";

const PAGE_SIZE = 1000;
const NON_CITY_DESTINATIONS = new Set(["albania", "algarve", "bali", "crete", "cyprus", "fireisland", "gran_canaria", "ibiza", "koh_samui", "mallorca", "malta", "montenegro", "mykonos", "santorini", "tenerife"]);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("Supabase URL/key missing. Run with --env-file=.env.local.");
const client = createClient(url, key, { auth: { persistSession: false } });

async function fetchAll(table, select) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await client.from(table).select(select).range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if ((data || []).length < PAGE_SIZE) return rows;
  }
}

const [places, events, reviews] = await Promise.all([
  fetchAll("places", "id,city,type,hours,link,lat,lng,venue_intel,seo_indexable"),
  fetchAll("events", "id,city,date,start_date,seo_indexable"),
  fetchAll("reviews", "place_id,rating,safety,created_at,created_by"),
]);
const normalizedDatabasePlaces = places.map((place) => ({
  ...place,
  city: String(place?.city || "") === "hong-kong" ? "hong_kong" : String(place?.city || ""),
}));
const effectivePlaces = mergeSeedPlaces(normalizedDatabasePlaces);
const placesByCity = Map.groupBy(effectivePlaces, (row) => String(row?.city || ""));
const eventsByCity = Map.groupBy(events, (row) => String(row?.city || ""));
const reviewsByPlace = Map.groupBy(reviews, (row) => String(row?.place_id || ""));

const entries = Object.entries(cityCoreConfig).map(([city, config]) => {
  const countryEvidence = getGlobalQueerMultiSourceEvidence(config.country);
  if (countryEvidence.legalInputs.length < 2 || countryEvidence.livedInputs.length < 2) throw new Error(`Insufficient multi-source evidence for ${config.country}`);
  const cityPlaces = placesByCity.get(city) || [];
  const cityReviews = cityPlaces.flatMap((place) => reviewsByPlace.get(String(place?.id || "")) || []);
  const score = scoreGlobalQueerCity({
    city,
    country: config.country,
    countryEvidence,
    places: cityPlaces,
    events: eventsByCity.get(city) || [],
    reviews: cityReviews,
  });
  if (NON_CITY_DESTINATIONS.has(city)) score.rankEligible = false;
  return {
    ...score,
    cityName: String(config.title || city).replace(/^Queer\s+/i, ""),
    countryEvidence: { legalComposite: countryEvidence.legalComposite, livedComposite: countryEvidence.livedComposite, values: countryEvidence.values },
    summary: describeGlobalQueerCity(score),
    sourceReferences: countryEvidence.sourceReferences,
  };
}).sort((left, right) => Number(right.rankEligible) - Number(left.rankEligible) || (right.sourceRating ?? -1) - (left.sourceRating ?? -1) || left.city.localeCompare(right.city));
let ordinalRank = 0;
for (const entry of entries) {
  if (!entry.rankEligible) {
    entry.rank = null;
    continue;
  }
  ordinalRank += 1;
  entry.rank = ordinalRank;
}

const snapshot = {
  schemaVersion: "QA-GQSCI-3.0",
  methodologyVersion: "QA-GQSCI-3.0",
  snapshotAt: new Date().toISOString(),
  year: 2026,
  scope: { atlasCities: Object.keys(cityCoreConfig).length, rankedCities: entries.filter((entry) => entry.rankEligible).length, ratedButNotRankedCities: entries.filter((entry) => !entry.rankEligible).length, countriesAndTerritories: new Set(Object.values(cityCoreConfig).map((city) => city.country)).size },
  sources: [
    { publisher: "F&M Global Barometers", dataset: "Unified LGBT Rights (GBUR)", url: FMGB_GBUR_2024_URL, edition: 2024, role: "score-bearing legal input" },
    { publisher: "F&M Global Barometers", dataset: "LGBTQI+ Perception Index (GBPI)", url: FMGB_GBPI_2024_URL, edition: 2024, role: "score-bearing lived-experience input where published" },
    { publisher: "Equaldex", dataset: "Equality Index — Legal Rights and Public Opinion", url: "https://www.equaldex.com/equality-index", snapshot: "2026-08-22", role: "score-bearing legal and public-opinion inputs with country-level credit links" },
    { publisher: "Williams Institute", dataset: "Global Acceptance Index", url: WILLIAMS_GAI_2021_URL, period: "2017–2020", role: "score-bearing longitudinal acceptance input, converted from 0–10 to 0–100" },
    { publisher: "ILGA-Europe", dataset: "Rainbow Map and Index", url: ILGA_EUROPE_2026_URL, edition: 2026, role: "score-bearing regional legal input for covered European jurisdictions" },
    { publisher: "ILGA World", dataset: "Laws on Us", url: "https://ilga.org/laws-on-us-report/", role: "legal definitions and audit context; not added as a synthetic score because no global 0–100 country score is published" },
  ],
  weights: { legalProtection: 50, livedAcceptance: 50, withinPillarRule: "unweighted mean of available disclosed source inputs; minimum two independent published inputs per pillar", publishedRating: "50% multi-source legal composite + 50% multi-source lived-acceptance composite" },
  eligibility: { minimumLegalSources: 2, minimumLivedSources: 2, comparisonUnit: "city or municipality; destination regions and islands remain visible but unranked" },
  limitation: "The 2026 edition ranks national Safety & Inclusion context attached to Atlas cities, not neighbourhood-level guarantees. ILGA-Europe applies only to its covered jurisdictions; Williams GAI is a longitudinal 2017–2020 acceptance input and is labelled accordingly. Source counts and disagreement ranges are disclosed for every entry.",
  entries,
};

writeFileSync(new URL("../src/lib/seo/globalQueerSafetyCultureIndex2026.json", import.meta.url), `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(JSON.stringify({ output: "src/lib/seo/globalQueerSafetyCultureIndex2026.json", ...snapshot.scope, top10: entries.filter((entry) => entry.rankEligible).slice(0, 10).map(({ rank, city, sourceRating }) => ({ rank, city, sourceRating })) }, null, 2));
