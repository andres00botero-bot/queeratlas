export const TOPIC_HUBS = {
  nightlife: {
    key: "nightlife",
    title: "Queer Nightlife Guide",
    description:
      "Plan a queer night with clearer city context: where to start, what kind of room to expect, and how to keep a credible backup nearby.",
    eyebrow: "Queer Atlas nightlife field guide",
    decisionTitle: "Build a night that fits",
    decisionSteps: [
      "Choose a city route by the kind of night you want — bars, clubs, techno, rooftops, or sauna culture.",
      "Open the city guide before you go for neighbourhood context, venue details, and current event dates.",
      "Keep one lower-friction backup in the same area in case a door policy, queue, or schedule changes.",
    ],
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
    title: "LGBTQ+ Travel Safety Guide",
    description:
      "Plan with city-level rights context, local venue signal, and practical fallback choices — without treating any destination as risk-free.",
    eyebrow: "Queer Atlas practical travel guide",
    decisionTitle: "Plan with context, not assumptions",
    decisionSteps: [
      "Start with the city and country context, then use it to frame — not replace — your own current travel advice and judgement.",
      "Choose venues with clear, current information and save a second option before you leave your accommodation.",
      "Check event dates, transport, entry rules, and the latest local updates close to your visit.",
    ],
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
