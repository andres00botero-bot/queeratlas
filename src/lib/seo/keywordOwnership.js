export const keywordOwnership = {
  home: {
    path: "/",
    primary: "queer atlas",
    secondary: [
      "queer travel",
      "lgbtq travel",
      "gay travel",
      "queer vibe",
      "inclusive nightlife",
    ],
    searchIntent: "brand discovery",
    ownerPage: "/",
  },
  gayGuide: {
    path: "/gay-guide",
    primary: "gay travel guide",
    secondary: [
      "gay guide",
      "gay travel",
      "queer traveler guide",
      "queer friendly places",
    ],
    searchIntent: "informational travel guide",
    ownerPage: "/gay-guide",
  },
  queerGuide: {
    path: "/queer-guide",
    primary: "queer travel guide",
    secondary: [
      "queer travel",
      "lgbtq travel guide",
      "safe queer nightlife",
      "queer safe spaces",
    ],
    searchIntent: "informational travel guide",
    ownerPage: "/queer-guide",
  },
  hbtqGuide: {
    path: "/hbtq-guide",
    primary: "hbtq guide",
    secondary: ["hbtq travel", "hbtq stader"],
    searchIntent: "regional-language guide intent",
    ownerPage: "/hbtq-guide",
  },
  cities: {
    path: "/cities",
    primary: "gay travel cities",
    secondary: [
      "queer cities",
      "lgbtq city guides",
      "gay friendly cities",
      "safest cities for gay travelers",
      "lgbtq friendly countries",
    ],
    searchIntent: "category discovery",
    ownerPage: "/cities",
  },
  events: {
    path: "/events",
    primary: "queer events",
    secondary: [
      "gay events",
      "lgbtq events",
      "lgbtq nightlife",
      "inclusive nightlife events",
    ],
    searchIntent: "time-based discovery",
    ownerPage: "/events",
  },
};

export function getCityKeywordOwnership(cityName = "") {
  const normalizedCity = String(cityName || "").trim();
  return {
    primary: `queer nightlife ${normalizedCity}`,
    secondary: [
      `best gay bars ${normalizedCity}`,
      `lgbtq events ${normalizedCity}`,
      `techno clubs ${normalizedCity} queer`,
      `lesbian bars ${normalizedCity}`,
      `queer friendly cafes ${normalizedCity}`,
      `gay clubs ${normalizedCity}`,
      `queer bars ${normalizedCity}`,
      `lgbt nightlife ${normalizedCity}`,
      `gay sauna ${normalizedCity}`,
      `queer events ${normalizedCity}`,
      `is ${normalizedCity} safe for lgbtq`,
    ],
    searchIntent: "local nightlife and venue discovery",
    ownerPage: "/[city]",
  };
}
