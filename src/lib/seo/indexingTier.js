export const TIER1_CITY_SLUGS = [
  "berlin",
  "new_york",
  "madrid",
  "bangkok",
  "tokyo",
  "mexico_city",
  "barcelona",
  "lisbon",
  "sao_paulo",
  "toronto",
];

export const TIER1_TOPIC_KEYS = [
  "queer-techno-clubs",
  "safest-queer-bars",
  "lesbian-nightlife",
  "queer-cafes",
  "events-tonight",
  "queer-rooftop-bars",
  "gay-sauna-guide",
  "queer-friendly-coworking",
  "drag-shows-tonight",
  "queer-travel-safety",
];

export const INDEXABLE_TOPIC_HUB_KEYS = [
  "nightlife",
  "safety",
  "events",
  "cafes",
  "community",
];

const tier1CitySet = new Set(TIER1_CITY_SLUGS);
const tier1TopicSet = new Set(TIER1_TOPIC_KEYS);
const indexableTopicHubSet = new Set(INDEXABLE_TOPIC_HUB_KEYS);

export function isTier1CityTopic(city = "", topic = "") {
  const cityKey = String(city || "").trim().toLowerCase();
  const topicKey = String(topic || "").trim().toLowerCase();
  return tier1CitySet.has(cityKey) && tier1TopicSet.has(topicKey);
}

export function isIndexableTopicHub(topic = "") {
  const key = String(topic || "").trim().toLowerCase();
  return indexableTopicHubSet.has(key);
}
