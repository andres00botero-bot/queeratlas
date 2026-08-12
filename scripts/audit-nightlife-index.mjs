import { createClient } from "@supabase/supabase-js";
import { NIGHTLIFE_INDEX_2026 } from "../src/lib/seo/nightlifeIndex2026.js";
import { isEligibleIndexEvent, isEligibleNightlifePlace, scoreNightlifeCity } from "../src/lib/seo/nightlifeIndexModel.js";

const PAGE_SIZE = 1000;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error("Supabase URL/key missing. Run with --env-file=.env.local.");
}

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
  fetchAll("reviews", "place_id,rating"),
]);

const placesByCity = Map.groupBy(places, (row) => String(row?.city || ""));
const eventsByCity = Map.groupBy(events, (row) => String(row?.city || ""));
const reviewsByPlace = Map.groupBy(reviews, (row) => String(row?.place_id || ""));
const scores = [];

for (const [city, cityPlaces] of placesByCity) {
  if (!city) continue;
  const cityReviews = cityPlaces.flatMap((place) => reviewsByPlace.get(String(place?.id || "")) || []);
  const score = scoreNightlifeCity({ city, places: cityPlaces, events: eventsByCity.get(city) || [], reviews: cityReviews });
  if (score) scores.push(score);
}

scores.sort((a, b) => b.score - a.score || b.places - a.places || a.city.localeCompare(b.city));
const published = NIGHTLIFE_INDEX_2026.entries;
const eligibleNightlifePlaces = places.filter(isEligibleNightlifePlace);
const eligiblePlaceIds = new Set(eligibleNightlifePlaces.map((place) => String(place?.id || "")));
const eligibleReviews = reviews.filter((review) => {
  const rating = Number(review?.rating);
  return eligiblePlaceIds.has(String(review?.place_id || "")) && rating >= 1 && rating <= 5;
});
const mismatches = published.flatMap((entry, index) => {
  const current = scores[index];
  const problems = [];
  if (!current || current.city !== entry.city) problems.push(`rank ${index + 1}: expected ${entry.city}, got ${current?.city || "missing"}`);
  if (current && current.score !== entry.score) problems.push(`${entry.city}: expected score ${entry.score}, got ${current.score}`);
  if (current && ["places", "events", "reviews"].some((keyName) => current[keyName] !== entry[keyName])) {
    problems.push(`${entry.city}: evidence counts changed`);
  }
  return problems;
});
if (eligibleNightlifePlaces.length !== NIGHTLIFE_INDEX_2026.eligibility.eligibleNightlifePlaces) mismatches.push("eligible nightlife-place universe changed");
if (events.filter((event) => isEligibleIndexEvent(event, 2026)).length !== NIGHTLIFE_INDEX_2026.eligibility.eligibleEvents) mismatches.push("eligible event universe changed");
if (eligibleReviews.length !== NIGHTLIFE_INDEX_2026.eligibility.eligibleCommunityReviews) mismatches.push("eligible review universe changed");
if (scores.length !== NIGHTLIFE_INDEX_2026.eligibility.cityCount) mismatches.push("eligible city universe changed");

const summary = {
  methodologyVersion: NIGHTLIFE_INDEX_2026.methodologyVersion,
  snapshotAt: NIGHTLIFE_INDEX_2026.snapshotAt,
  currentUniverse: {
    allPlaces: places.length,
    eligibleNightlifePlaces: eligibleNightlifePlaces.length,
    eligible2026Events: events.filter((event) => isEligibleIndexEvent(event, 2026)).length,
    eligibleCommunityReviews: eligibleReviews.length,
    eligibleCities: scores.length,
  },
  publishedTop25MatchesCurrentData: mismatches.length === 0,
  mismatches,
  currentTop25: scores.slice(0, 25).map(({ city, score, places: placeCount, events: eventCount, reviews: reviewCount, scores: componentScores }) => ({
    city,
    score,
    places: placeCount,
    events: eventCount,
    reviews: reviewCount,
    scores: componentScores,
  })),
};

console.log(JSON.stringify(summary, null, 2));
if (mismatches.length > 0) process.exitCode = 2;
