export const queryLandingMap = {
  globalIntent: {
    landing: "/",
    queries: [
      "lgbtq travel",
      "gay travel",
      "queer travel",
      "queer vibe",
      "inclusive nightlife",
    ],
  },
  guideIntent: {
    landing: "/gay-guide",
    queries: [
      "gay travel guide",
      "queer traveler guide",
      "queer friendly places",
      "gay bars near me",
    ],
  },
  queerSafetyIntent: {
    landing: "/queer-guide",
    queries: [
      "safe queer nightlife",
      "queer safe spaces",
      "lgbtq travel safety",
      "lgbtq safety map",
    ],
  },
  citiesIntent: {
    landing: "/cities",
    queries: [
      "gay friendly cities",
      "safest cities for gay travelers",
      "lgbtq friendly countries",
    ],
  },
  eventsIntent: {
    landing: "/events",
    queries: [
      "lgbtq events",
      "lgbtq nightlife",
      "inclusive nightlife events",
    ],
  },
  nowIntent: {
    landing: "/now",
    queries: [
      "is berlin safe for lgbtq",
      "safe queer nightlife",
      "lgbtq travel safety",
    ],
  },
};

export function getCityQuerySuggestions(city = "") {
  const cityName = String(city || "").trim();
  if (!cityName) return [];
  return [
    `queer nightlife ${cityName}`,
    `best gay bars ${cityName}`,
    `lgbtq events ${cityName}`,
    `techno clubs ${cityName} queer`,
    `lesbian bars ${cityName}`,
    `queer friendly cafes ${cityName}`,
    `queer rooftop bars ${cityName}`,
    `gay sauna guide ${cityName}`,
    `queer friendly coworking ${cityName}`,
    `underground queer nightlife ${cityName}`,
    `drag shows tonight ${cityName}`,
    `is ${cityName} safe for lgbtq`,
  ];
}
