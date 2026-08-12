import { createClient } from "@supabase/supabase-js";
import { cityConfig } from "../src/lib/cities.js";
import { SAFETY_INDEX_2026 } from "../src/lib/seo/safetyIndex2026.js";
import { normalizeSafetyCountry, scoreSafetyCity } from "../src/lib/seo/safetyIndexModel.js";

const PAGE_SIZE = 1000;
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

const [profiles, places, reviews] = await Promise.all([
  fetchAll("qa_country_rights_profiles", "country,legal_level,rights_level,safety_level,same_sex_relations_status,union_status,legal_gender_recognition_status,anti_discrimination_status,confidence,source_legal_url,source_rights_url,source_safety_url"),
  fetchAll("places", "id,city,type,hours,link,lat,lng,venue_intel,seo_indexable"),
  fetchAll("reviews", "place_id,safety"),
]);
const profilesByCountry = new Map(profiles.map((profile) => [normalizeSafetyCountry(profile.country), profile]));
const placesByCity = Map.groupBy(places, (place) => String(place.city || ""));
const scores = Object.entries(cityConfig).flatMap(([city, config]) => {
  const score = scoreSafetyCity({ city, country: config.country, profile: profilesByCountry.get(normalizeSafetyCountry(config.country)), places: placesByCity.get(city) || [] });
  return score ? [score] : [];
}).sort((a, b) => b.score - a.score || b.places - a.places || a.city.localeCompare(b.city));

const mismatches = SAFETY_INDEX_2026.entries.flatMap((entry, index) => {
  const current = scores[index];
  const problems = [];
  if (!current || current.city !== entry.city) problems.push(`rank ${index + 1}: expected ${entry.city}, got ${current?.city || "missing"}`);
  if (current && current.score !== entry.score) problems.push(`${entry.city}: expected score ${entry.score}, got ${current.score}`);
  if (current && ["places", "welcomeEvidence", "routeReadyPlaces", "sourceCount", "confidence"].some((keyName) => current[keyName] !== entry[keyName])) problems.push(`${entry.city}: evidence counts changed`);
  if (current && Object.keys(entry.scores).some((keyName) => current.scores[keyName] !== entry.scores[keyName])) problems.push(`${entry.city}: component scores changed`);
  return problems;
});
const universe = {
  allPlaces: places.length,
  countryProfiles: profiles.length,
  eligibleCities: scores.length,
  eligibleNightlifePlaces: scores.reduce((sum, entry) => sum + entry.places, 0),
  venueWelcomeEvidence: scores.reduce((sum, entry) => sum + entry.welcomeEvidence, 0),
  routeReadyPlaces: scores.reduce((sum, entry) => sum + entry.routeReadyPlaces, 0),
  populatedSafetyReviewsExcluded: reviews.filter((review) => review.safety != null).length,
};
for (const [keyName, current] of Object.entries(universe)) {
  const publishedKey = keyName === "eligibleCities" ? "cityCount" : keyName === "allPlaces" ? "allPlacesReviewed" : keyName;
  if (SAFETY_INDEX_2026.eligibility[publishedKey] !== current) mismatches.push(`${keyName} universe changed`);
}

console.log(JSON.stringify({
  methodologyVersion: SAFETY_INDEX_2026.methodologyVersion,
  snapshotAt: SAFETY_INDEX_2026.snapshotAt,
  currentUniverse: universe,
  publishedTop25MatchesCurrentData: mismatches.length === 0,
  mismatches,
  currentTop25: scores.slice(0, 25),
}, null, 2));
if (mismatches.length > 0) process.exitCode = 2;
