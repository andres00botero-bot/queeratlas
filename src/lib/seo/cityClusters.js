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
    title: "Best Queer Clubs",
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

// Editorial French terminology for indexable discovery routes. Keep these as
// search-intent copy, not literal word-for-word translations of the English.
const FRENCH_CITY_CLUSTER_TOPICS = Object.freeze({
  "queer-techno-clubs": { title: "Clubs techno queer", summary: "Une sélection de clubs techno queer pour organiser la nuit, comprendre l’entrée et choisir l’ambiance qui vous convient.", keyphrases: ["clubs techno queer", "soirées techno LGBTQ+", "scène électronique queer"] },
  "safest-queer-bars": { title: "Bars queer : repères pratiques", summary: "Des bars queer choisis avec des repères concrets de quartier, d’accès et de parcours — sans jamais promettre une sécurité absolue.", keyphrases: ["bars queer accueillants", "bars LGBTQ+", "sorties queer en sécurité"] },
  "lesbian-nightlife": { title: "Sorties lesbiennes et sapphiques", summary: "Des repères pour trouver des soirées lesbiennes, sapphiques et portées par des femmes, des premiers verres aux temps forts de la nuit.", keyphrases: ["sorties lesbiennes", "bars sapphiques", "soirées queer femmes"] },
  "queer-cafes": { title: "Cafés queer et lieux de journée", summary: "Des lieux queer ou accueillants pour se retrouver, préparer sa soirée et découvrir la ville sans pression.", keyphrases: ["cafés queer", "cafés LGBTQ+", "lieux queer en journée"] },
  "events-tonight": { title: "Événements LGBTQ+ ce soir", summary: "Des événements à vérifier pour ce soir, avec des repères rapides sur les horaires, les lieux et les alternatives utiles.", keyphrases: ["événements LGBTQ+ ce soir", "soirées gay ce soir", "sorties queer ce soir"] },
  "queer-bars": { title: "Guide des bars queer", summary: "Des bars queer sélectionnés pour démarrer la soirée, choisir l’ambiance et construire un itinéraire plus fluide.", keyphrases: ["meilleurs bars queer", "guide des bars gay", "bars LGBTQ+"] },
  "queer-clubs": { title: "Guide des clubs queer", summary: "Des clubs queer sélectionnés pour lire le rythme de la nuit, l’ambiance et les options de repli.", keyphrases: ["clubs queer", "clubs gay", "vie nocturne LGBTQ+"] },
  "queer-hotels": { title: "Hébergements accueillants pour les personnes queer", summary: "Des hébergements sélectionnés selon leur emplacement, l’accès aux quartiers vivants et leur utilité pour un séjour queer.", keyphrases: ["hôtels queer friendly", "hôtels LGBTQ+", "hébergement gay friendly"] },
  "queer-events-this-week": { title: "Événements LGBTQ+ cette semaine", summary: "Des événements à venir pour organiser les dates, l’énergie de la ville et les bons déplacements pendant la semaine.", keyphrases: ["événements LGBTQ+ cette semaine", "soirées gay cette semaine", "agenda queer"] },
  "queer-safe-areas": { title: "Quartiers queer : repères de déplacement", summary: "Des repères de quartier pour organiser ses déplacements avec davantage de contexte, d’alternatives et de prudence.", keyphrases: ["quartiers queer", "quartiers LGBTQ+", "zones accueillantes LGBTQ+"] },
  "queer-rooftop-bars": { title: "Bars rooftop queer", summary: "Des rooftops et terrasses où prolonger la soirée, avec des repères de programme, de quartier et d’alternatives proches.", keyphrases: ["rooftops queer", "bars rooftop gay", "terrasses LGBTQ+"] },
  "gay-sauna-guide": { title: "Guide des saunas gay", summary: "Des saunas gay sélectionnés avec des repères concrets sur l’accès, les horaires et le contexte du quartier.", keyphrases: ["guide sauna gay", "sauna gay", "sauna LGBTQ+"] },
  "queer-friendly-coworking": { title: "Coworking accueillant pour les personnes queer", summary: "Des espaces de travail et lieux de journée utiles pour travailler, se retrouver et garder un lien avec la vie locale.", keyphrases: ["coworking queer friendly", "coworking LGBTQ+", "espace de travail gay friendly"] },
  "underground-queer-nightlife": { title: "Vie nocturne queer alternative", summary: "Des pistes pour découvrir une vie nocturne queer plus alternative, en tenant compte du programme, de la musique et du contexte réel.", keyphrases: ["vie nocturne queer alternative", "clubs gay underground", "scène queer alternative"] },
  "queer-travel-safety": { title: "Conseils de voyage queer", summary: "Des repères pratiques pour préparer un déplacement queer avec davantage de contexte local, d’options et de prudence.", keyphrases: ["sécurité voyage LGBTQ+", "voyage queer", "conseils voyage gay"] },
  "drag-shows-tonight": { title: "Shows drag ce soir", summary: "Des shows drag et scènes de performance à vérifier pour ce soir, avec les horaires et alternatives à portée de main.", keyphrases: ["drag show ce soir", "événements drag LGBTQ+", "spectacle drag"] },
});

export function getCityClusterTopic(topic = "") {
  const key = String(topic || "").trim().toLowerCase();
  return CITY_CLUSTER_TOPICS[key] || null;
}

export function getLocalizedCityClusterTopic(topic = "", locale = "en") {
  const key = String(topic || "").trim().toLowerCase();
  const base = CITY_CLUSTER_TOPICS[key];
  if (!base) return null;
  if (String(locale || "").toLowerCase().split("-")[0] !== "fr") return base;
  return { ...base, ...(FRENCH_CITY_CLUSTER_TOPICS[key] || {}) };
}

export function listCityClusterTopics() {
  return Object.keys(CITY_CLUSTER_TOPICS).map((key) => ({
    key,
    ...CITY_CLUSTER_TOPICS[key],
  }));
}

export function listLocalizedCityClusterTopics(locale = "en") {
  return Object.keys(CITY_CLUSTER_TOPICS).map((key) => getLocalizedCityClusterTopic(key, locale));
}
