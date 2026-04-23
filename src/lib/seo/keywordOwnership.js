export const keywordOwnership = {
  home: {
    path: "/",
    primary: "queer atlas",
    secondary: ["queer travel", "lgbtq travel"],
    searchIntent: "brand discovery",
    ownerPage: "/",
  },
  gayGuide: {
    path: "/gay-guide",
    primary: "gay travel guide",
    secondary: ["gay guide", "gay travel"],
    searchIntent: "informational travel guide",
    ownerPage: "/gay-guide",
  },
  queerGuide: {
    path: "/queer-guide",
    primary: "queer travel guide",
    secondary: ["queer travel", "lgbtq travel guide"],
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
    secondary: ["queer cities", "lgbtq city guides"],
    searchIntent: "category discovery",
    ownerPage: "/cities",
  },
  events: {
    path: "/events",
    primary: "queer events",
    secondary: ["gay events", "lgbtq events"],
    searchIntent: "time-based discovery",
    ownerPage: "/events",
  },
};

export function getCityKeywordOwnership(cityName = "") {
  const normalizedCity = String(cityName || "").trim();
  return {
    primary: `gay bars in ${normalizedCity}`,
    secondary: [
      `gay clubs ${normalizedCity}`,
      `queer bars ${normalizedCity}`,
      `lgbt nightlife ${normalizedCity}`,
      `gay sauna ${normalizedCity}`,
      `queer events ${normalizedCity}`,
    ],
    searchIntent: "local nightlife and venue discovery",
    ownerPage: "/[city]",
  };
}
