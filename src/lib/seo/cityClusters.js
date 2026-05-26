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

