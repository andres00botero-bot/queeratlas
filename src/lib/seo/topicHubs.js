export const TOPIC_HUBS = {
  nightlife: {
    key: "nightlife",
    title: "Queer Nightlife Hubs",
    description:
      "Global nightlife-focused queer route intelligence across major cities with high-signal cluster links.",
    clusterKeys: [
      "queer-techno-clubs",
      "queer-bars",
      "queer-clubs",
      "queer-rooftop-bars",
      "underground-queer-nightlife",
      "gay-sauna-guide",
    ],
    cities: ["berlin", "madrid", "new_york", "sao_paulo", "bangkok", "barcelona", "tokyo", "london"],
  },
  safety: {
    key: "safety",
    title: "Safest Queer Bars Hubs",
    description:
      "Safety-first city routing hubs with practical fallback choices and lower-friction venue paths.",
    clusterKeys: ["safest-queer-bars", "queer-safe-areas", "queer-travel-safety"],
    cities: ["copenhagen", "amsterdam", "toronto", "lisbon", "sydney", "san_francisco", "paris", "new_york"],
  },
  events: {
    key: "events",
    title: "LGBTQ Events Tonight Hubs",
    description:
      "Tonight-first planning hubs that connect event intent across major cities with cluster-level discover paths.",
    clusterKeys: ["events-tonight", "queer-events-this-week", "drag-shows-tonight"],
    cities: ["new_york", "madrid", "berlin", "mexico_city", "sao_paulo", "sydney", "bangkok", "tokyo"],
  },
  cafes: {
    key: "cafes",
    title: "Queer Cafes Hubs",
    description:
      "Daytime social discovery hubs for queer cafes and low-friction community starts across key cities.",
    clusterKeys: ["queer-cafes", "queer-hotels", "queer-friendly-coworking"],
    cities: ["lisbon", "barcelona", "amsterdam", "paris", "london", "copenhagen", "berlin", "toronto"],
  },
  community: {
    key: "community",
    title: "Lesbian Nightlife Hubs",
    description:
      "Community-led lesbian and sapphic nightlife discovery hubs with stronger social-fit route context.",
    clusterKeys: ["lesbian-nightlife", "queer-bars"],
    cities: ["berlin", "new_york", "madrid", "barcelona", "london", "paris", "sao_paulo", "melbourne"],
  },
};

export function listTopicHubs() {
  return Object.keys(TOPIC_HUBS).map((key) => ({ ...TOPIC_HUBS[key] }));
}

export function getTopicHub(key = "") {
  const normalized = String(key || "").trim().toLowerCase();
  return TOPIC_HUBS[normalized] || null;
}
