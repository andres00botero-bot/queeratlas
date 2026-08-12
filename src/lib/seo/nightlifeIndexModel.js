export const NIGHTLIFE_PLACE_TYPES = ["bar", "club", "sauna", "cruise_club", "cruising_area"];
export const NIGHTLIFE_TYPE_WEIGHTS = { bar: 4, club: 4, sauna: 2, cruise_club: 3, cruising_area: 2 };
export const REQUIRED_VENUE_INTEL_TOPICS = ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity"];

function roundOne(value) {
  return Number(Number(value || 0).toFixed(1));
}

function hasText(value) {
  return Boolean(String(value || "").trim());
}

function hasCoordinate(value) {
  return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
}

export function isEligibleNightlifePlace(place) {
  return NIGHTLIFE_PLACE_TYPES.includes(String(place?.type || "")) && place?.seo_indexable !== false;
}

export function isEligibleIndexEvent(event, year = 2026) {
  return event?.seo_indexable !== false && String(event?.start_date || event?.date || "").startsWith(String(year));
}

export function hasCompleteVenueIntelligence(place) {
  const intel = place?.venue_intel || {};
  return REQUIRED_VENUE_INTEL_TOPICS.every((topic) => hasText(intel?.[topic]))
    && Array.isArray(intel?.source_urls)
    && intel.source_urls.some(hasText);
}

export function hasRouteReadyEvidence(place) {
  return hasText(place?.hours)
    && hasText(place?.link)
    && hasCoordinate(place?.lat)
    && hasCoordinate(place?.lng);
}

export function scoreNightlifeCity({ city = "", places = [], events = [], reviews = [] } = {}) {
  const eligiblePlaces = places.filter(isEligibleNightlifePlace);
  const eligibleIds = new Set(eligiblePlaces.map((place) => String(place?.id || "")));
  const eligibleEvents = events.filter((event) => isEligibleIndexEvent(event, 2026));
  const eligibleReviews = reviews.filter((review) => {
    const rating = Number(review?.rating);
    return eligibleIds.has(String(review?.place_id || "")) && rating >= 1 && rating <= 5;
  });
  const placeCount = eligiblePlaces.length;

  if (placeCount < 5) return null;

  const depth = 30 * Math.sqrt(Math.min(placeCount, 40) / 40);
  const diversity = Object.entries(NIGHTLIFE_TYPE_WEIGHTS).reduce(
    (total, [type, weight]) => total + (eligiblePlaces.some((place) => place.type === type) ? weight : 0),
    0
  );
  const eventMomentum = 20 * Math.sqrt(Math.min(eligibleEvents.length, 20) / 20);
  const intelligence = (eligiblePlaces.filter(hasCompleteVenueIntelligence).length / placeCount) * 15;
  const route = (eligiblePlaces.filter(hasRouteReadyEvidence).length / placeCount) * 10;
  const community = Math.min(1, eligibleReviews.length / (placeCount * 1.5)) * 10;
  const scores = {
    depth: roundOne(depth),
    diversity: roundOne(diversity),
    events: roundOne(eventMomentum),
    intelligence: roundOne(intelligence),
    route: roundOne(route),
    community: roundOne(community),
  };

  return {
    city,
    score: roundOne(depth + diversity + eventMomentum + intelligence + route + community),
    places: placeCount,
    events: eligibleEvents.length,
    reviews: eligibleReviews.length,
    scores,
  };
}
