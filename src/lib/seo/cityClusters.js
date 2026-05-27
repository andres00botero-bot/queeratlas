export const CITY_CLUSTER_TOPICS = {
  "queer-techno-clubs": {
    title: "Best Queer Techno Clubs",
    intent: "nightlife",
    summary:
      "Late-night queer techno flow with route-safe sequencing, entry expectations, and crowd-shape guidance.",
    keyphrases: [
      "best queer techno clubs",
      "queer techno nightlife",
      "LGBTQ electronic scene",
    ],
  },
  "safest-queer-bars": {
    title: "Safest Queer Bars",
    intent: "safety",
    summary:
      "Safety-first bar picks with practical route notes, neighborhood signals, and lower-friction social entries.",
    keyphrases: [
      "safest queer bars",
      "safe gay bars",
      "LGBTQ safe nightlife",
    ],
  },
  "lesbian-nightlife": {
    title: "Lesbian Nightlife Guide",
    intent: "community",
    summary:
      "Community-led nightlife pointers for lesbian and sapphic social flow, from soft starts to peak venues.",
    keyphrases: [
      "lesbian nightlife",
      "sapphic bars",
      "queer women nightlife",
    ],
  },
  "queer-cafes": {
    title: "Queer Cafes & Social Day Spots",
    intent: "daylife",
    summary:
      "Low-pressure daytime queer social spaces for meetups, pre-night planning, and community-friendly routines.",
    keyphrases: [
      "queer cafes",
      "LGBTQ friendly cafes",
      "gay friendly coffee spots",
    ],
  },
  "events-tonight": {
    title: "LGBTQ Events Tonight",
    intent: "events",
    summary:
      "Tonight-first event navigation with fast signal checks, time windows, and fallback route options.",
    keyphrases: [
      "LGBTQ events tonight",
      "gay events tonight",
      "queer nightlife events",
    ],
  },
  "queer-bars": {
    title: "Best Queer Bars Guide",
    intent: "nightlife",
    summary:
      "Bar-first queer planning with social entry points, crowd-fit guidance, and smoother route sequencing.",
    keyphrases: [
      "best queer bars",
      "gay bars guide",
      "LGBTQ bar scene",
    ],
  },
  "queer-clubs": {
    title: "Queer Clubs Guide",
    intent: "nightlife",
    summary:
      "Late-night queer club mapping with peak-time flow, scene density context, and practical fallback choices.",
    keyphrases: [
      "queer clubs",
      "gay clubs nightlife",
      "LGBTQ club scene",
    ],
  },
  "queer-hotels": {
    title: "Queer-Friendly Hotels Guide",
    intent: "daylife",
    summary:
      "Stay-first planning for queer-friendly hotels with location fit, social access, and nightlife adjacency in mind.",
    keyphrases: [
      "queer friendly hotels",
      "gay friendly hotels",
      "LGBTQ travel stay guide",
    ],
  },
  "queer-events-this-week": {
    title: "LGBTQ Events This Week",
    intent: "events",
    summary:
      "Week-ahead event planning to align dates, city momentum, and route choices across active queer scenes.",
    keyphrases: [
      "LGBTQ events this week",
      "gay events this week",
      "queer weekly events",
    ],
  },
  "queer-safe-areas": {
    title: "Queer Safe Areas Guide",
    intent: "safety",
    summary:
      "Area-first safety routing with neighborhood confidence cues, lower-friction movement, and fallback zone logic.",
    keyphrases: [
      "queer safe areas",
      "LGBTQ safe neighborhoods",
      "gay safe area guide",
    ],
  },
  "queer-rooftop-bars": {
    title: "Queer Rooftop Bars Guide",
    intent: "nightlife",
    summary:
      "Rooftop-first queer nightlife planning with skyline social flow, peak-hour timing, and easy fallback sequencing.",
    keyphrases: [
      "queer rooftop bars",
      "gay rooftop bars",
      "LGBTQ rooftop nightlife",
    ],
  },
  "gay-sauna-guide": {
    title: "Gay Sauna Guide",
    intent: "nightlife",
    summary:
      "Clearer sauna planning with entry expectations, timing windows, and route context for safer same-night choices.",
    keyphrases: [
      "gay sauna guide",
      "gay sauna",
      "LGBTQ sauna guide",
    ],
  },
  "queer-friendly-coworking": {
    title: "Queer-Friendly Coworking Guide",
    intent: "daylife",
    summary:
      "Daytime productivity and community-fit coworking picks with low-friction location logic and social spillover context.",
    keyphrases: [
      "queer friendly coworking",
      "LGBTQ coworking",
      "gay friendly coworking spaces",
    ],
  },
  "underground-queer-nightlife": {
    title: "Underground Queer Nightlife Guide",
    intent: "nightlife",
    summary:
      "Underground-first nightlife mapping with late-hour flow, stronger scene fit, and practical backup paths.",
    keyphrases: [
      "underground queer nightlife",
      "underground gay clubs",
      "queer underground scene",
    ],
  },
  "queer-travel-safety": {
    title: "Queer Travel Safety Guide",
    intent: "safety",
    summary:
      "Travel-safety routing with area confidence signals, lower-friction movement, and fallback planning by city.",
    keyphrases: [
      "queer travel safety",
      "LGBTQ travel safety",
      "is it safe for LGBTQ travelers",
    ],
  },
  "drag-shows-tonight": {
    title: "Drag Shows Tonight Guide",
    intent: "events",
    summary:
      "Tonight-first drag discovery with timing-led choices, venue sequencing, and event-night backup options.",
    keyphrases: [
      "drag shows tonight",
      "LGBTQ drag events",
      "gay drag show guide",
    ],
  },
};

export function getCityClusterTopic(topic = "") {
  const key = String(topic || "").trim().toLowerCase();
  return CITY_CLUSTER_TOPICS[key] || null;
}

export function listCityClusterTopics() {
  return Object.keys(CITY_CLUSTER_TOPICS).map((key) => ({
    key,
    ...CITY_CLUSTER_TOPICS[key],
  }));
}
