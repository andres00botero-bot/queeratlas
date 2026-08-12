export const NIGHTLIFE_INDEX_2026 = {
  slug: "queer-nightlife-index-2026",
  year: 2026,
  methodologyVersion: "QA-NI-1.0",
  snapshotAt: "2026-08-11",
  temporalCoverage: "2026-01-01/2026-12-31",
  observationWindow: "2026-01-01 to 2026-12-31 scheduled inventory, captured 2026-08-11",
  eligibility: {
    minimumNightlifePlaces: 5,
    cityCount: 118,
    allPlacesReviewed: 1802,
    eligibleNightlifePlaces: 1352,
    eligibleEvents: 498,
    eligibleCommunityReviews: 1465,
  },
  components: [
    {
      key: "depth",
      label: "Nightlife depth",
      weight: 30,
      definition: "30 × √(eligible nightlife places ÷ 40), capped at 30. Eligible formats are bars, clubs, saunas, cruise clubs and cruising areas not explicitly excluded from indexing.",
    },
    {
      key: "diversity",
      label: "Scene diversity",
      weight: 15,
      definition: "Format-presence points: bar 4, club 4, cruise club 3, sauna 2 and cruising area 2; maximum 15.",
    },
    {
      key: "events",
      label: "Event momentum",
      weight: 20,
      definition: "20 × √(eligible 2026 events ÷ 20), capped at 20. Start date is used first, with the general event date as fallback.",
    },
    {
      key: "intelligence",
      label: "Venue intelligence",
      weight: 15,
      definition: "15 × the share of eligible places with queue, best-night, crowd, dress-code and staff-inclusivity text plus at least one source URL.",
    },
    {
      key: "route",
      label: "Route readiness",
      weight: 10,
      definition: "10 × the share of eligible places with valid coordinates, opening-hours context and an official or booking link.",
    },
    {
      key: "community",
      label: "Community evidence",
      weight: 10,
      definition: "10 × min(valid attached reviews ÷ (eligible places × 1.5), 1). Only ratings from 1 to 5 attached to eligible nightlife places count.",
    },
  ],
  entries: [
    { rank: 1, city: "berlin", country: "Germany", score: 91.9, places: 35, events: 13, reviews: 48, scores: { depth: 28.1, diversity: 15, events: 16.1, intelligence: 14.1, route: 9.4, community: 9.1 }, signal: "Deep five-format nightlife, strong event coverage and unusually complete route evidence." },
    { rank: 2, city: "madrid", country: "Spain", score: 90.8, places: 40, events: 20, reviews: 43, scores: { depth: 30, diversity: 15, events: 20, intelligence: 11.6, route: 7, community: 7.2 }, signal: "The only leading city to reach both the nightlife-depth and event-momentum caps." },
    { rank: 3, city: "amsterdam", country: "Netherlands", score: 84.3, places: 24, events: 14, reviews: 20, scores: { depth: 23.2, diversity: 15, events: 16.7, intelligence: 15, route: 8.8, community: 5.6 }, signal: "Perfect venue-intelligence coverage combines with broad formats and strong event momentum." },
    { rank: 4, city: "london", country: "United Kingdom", score: 84.2, places: 24, events: 18, reviews: 21, scores: { depth: 23.2, diversity: 13, events: 19, intelligence: 13.1, route: 10, community: 5.8 }, signal: "Perfect route readiness and eighteen indexed events produce a balanced high score." },
    { rank: 5, city: "barcelona", country: "Spain", score: 83.4, places: 25, events: 15, reviews: 27, scores: { depth: 23.7, diversity: 13, events: 17.3, intelligence: 15, route: 7.2, community: 7.2 }, signal: "High club-and-bar density with complete intelligence coverage and a busy event calendar." },
    { rank: 6, city: "san_francisco", country: "United States", score: 82.9, places: 26, events: 11, reviews: 30, scores: { depth: 24.2, diversity: 15, events: 14.8, intelligence: 12.7, route: 8.5, community: 7.7 }, signal: "A broad, review-supported nightlife network with dependable route-level information." },
    { rank: 7, city: "montreal", country: "Canada", score: 79.8, places: 23, events: 13, reviews: 13, scores: { depth: 22.7, diversity: 15, events: 16.1, intelligence: 14.3, route: 7.8, community: 3.8 }, signal: "Full scene-format range and strong events lift a well-documented nightlife ecosystem." },
    { rank: 8, city: "copenhagen", country: "Denmark", score: 76.5, places: 16, events: 6, reviews: 26, scores: { depth: 19, diversity: 15, events: 11, intelligence: 14.1, route: 7.5, community: 10 }, signal: "A smaller scene overperforms through complete format range and exceptional review evidence." },
    { rank: 9, city: "bogota", country: "Colombia", score: 74.1, places: 23, events: 6, reviews: 17, scores: { depth: 22.7, diversity: 15, events: 11, intelligence: 13, route: 7.4, community: 4.9 }, signal: "Large five-format nightlife coverage gives Bogotá the strongest Latin American result." },
    { rank: 10, city: "new_york", country: "United States", score: 73.5, places: 29, events: 2, reviews: 29, scores: { depth: 25.5, diversity: 15, events: 6.3, intelligence: 12.4, route: 7.6, community: 6.7 }, signal: "Exceptional permanent scene depth is held back by limited indexed 2026 event coverage." },
    { rank: 11, city: "brighton", country: "United Kingdom", score: 71.5, places: 12, events: 6, reviews: 22, scores: { depth: 16.4, diversity: 12, events: 11, intelligence: 13.8, route: 8.3, community: 10 }, signal: "Compact scale is offset by strong community evidence and highly usable venue information." },
    { rank: 12, city: "manchester", country: "United Kingdom", score: 70.7, places: 12, events: 6, reviews: 26, scores: { depth: 16.4, diversity: 15, events: 11, intelligence: 12.5, route: 5.8, community: 10 }, signal: "Full format diversity and saturated community evidence anchor Manchester's result." },
    { rank: 13, city: "brussels", country: "Belgium", score: 69.9, places: 11, events: 7, reviews: 21, scores: { depth: 15.7, diversity: 11, events: 11.8, intelligence: 12.3, route: 9.1, community: 10 }, signal: "A compact scene scores through event activity, route usability and dense review evidence." },
    { rank: 14, city: "athens", country: "Greece", score: 69.5, places: 15, events: 2, reviews: 19, scores: { depth: 18.4, diversity: 15, events: 6.3, intelligence: 14, route: 7.3, community: 8.4 }, signal: "Broad scene formats and strong intelligence compensate for a lighter indexed event year." },
    { rank: 15, city: "provincetown", country: "United States", score: 69.3, places: 12, events: 19, reviews: 28, scores: { depth: 16.4, diversity: 15, events: 19.5, intelligence: 5, route: 3.3, community: 10 }, signal: "The strongest event momentum in the Top 25 meets clear gaps in route and intelligence data." },
    { rank: 16, city: "chicago", country: "United States", score: 69.1, places: 14, events: 7, reviews: 14, scores: { depth: 17.7, diversity: 10, events: 11.8, intelligence: 12.9, route: 10, community: 6.7 }, signal: "Perfect route readiness and solid events support a more concentrated format mix." },
    { rank: 17, city: "lisbon", country: "Portugal", score: 69, places: 17, events: 6, reviews: 3, scores: { depth: 19.6, diversity: 15, events: 11, intelligence: 14.1, route: 8.2, community: 1.2 }, signal: "Strong scene breadth and documentation contrast with limited community review coverage." },
    { rank: 18, city: "torremolinos", country: "Spain", score: 68.7, places: 23, events: 4, reviews: 25, scores: { depth: 22.7, diversity: 15, events: 8.9, intelligence: 9.1, route: 5.7, community: 7.2 }, signal: "Substantial resort-scene depth leads despite weaker practical-data completeness." },
    { rank: 19, city: "vancouver", country: "Canada", score: 68.6, places: 9, events: 7, reviews: 18, scores: { depth: 14.2, diversity: 12, events: 11.8, intelligence: 11.7, route: 8.9, community: 10 }, signal: "A small but review-rich scene performs through events and reliable route information." },
    { rank: 20, city: "rio_de_janeiro", country: "Brazil", score: 68.1, places: 13, events: 4, reviews: 19, scores: { depth: 17.1, diversity: 15, events: 8.9, intelligence: 10.4, route: 6.9, community: 9.7 }, signal: "Full scene diversity and strong community evidence carry Rio's distributed nightlife." },
    { rank: 21, city: "taipei", country: "Taiwan", score: 67.8, places: 24, events: 5, reviews: 25, scores: { depth: 23.2, diversity: 12, events: 10, intelligence: 9.4, route: 6.3, community: 6.9 }, signal: "Large nightlife depth leads the score while practical coverage remains uneven." },
    { rank: 22, city: "buenos_aires", country: "Argentina", score: 67.8, places: 12, events: 1, reviews: 14, scores: { depth: 16.4, diversity: 15, events: 4.5, intelligence: 15, route: 9.2, community: 7.8 }, signal: "Perfect intelligence coverage and excellent route data offset sparse indexed events." },
    { rank: 23, city: "cologne", country: "Germany", score: 67.8, places: 12, events: 7, reviews: 19, scores: { depth: 16.4, diversity: 10, events: 11.8, intelligence: 11.3, route: 8.3, community: 10 }, signal: "Event momentum and community evidence outweigh a narrower indexed format range." },
    { rank: 24, city: "stockholm", country: "Sweden", score: 67.3, places: 10, events: 2, reviews: 21, scores: { depth: 15, diversity: 11, events: 6.3, intelligence: 15, route: 10, community: 10 }, signal: "Perfect intelligence, route and community components lift a compact permanent scene." },
    { rank: 25, city: "frankfurt", country: "Germany", score: 66.9, places: 9, events: 6, reviews: 6, scores: { depth: 14.2, diversity: 15, events: 11, intelligence: 13.3, route: 8.9, community: 4.4 }, signal: "Full format range and dependable practical data support a smaller nightlife footprint." },
  ],
};

export const NIGHTLIFE_INDEX_2026_ENTRIES = NIGHTLIFE_INDEX_2026.entries;

export function getNightlifeIndexEntry(city = "") {
  const normalized = String(city || "").trim().toLowerCase().replaceAll("-", "_");
  return NIGHTLIFE_INDEX_2026_ENTRIES.find((entry) => entry.city === normalized) || null;
}

export function isEvidenceBackedRankingYear(year) {
  return Number(year) === NIGHTLIFE_INDEX_2026.year;
}
