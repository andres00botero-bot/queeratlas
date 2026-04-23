export const keywordOwnership = {
  home: {
    path: "/",
    primary: "queer atlas",
    secondary: ["queer travel", "lgbtq travel"],
  },
  gayGuide: {
    path: "/gay-guide",
    primary: "gay travel guide",
    secondary: ["gay guide", "gay travel"],
  },
  queerGuide: {
    path: "/queer-guide",
    primary: "queer travel guide",
    secondary: ["queer travel", "lgbtq travel guide"],
  },
  hbtqGuide: {
    path: "/hbtq-guide",
    primary: "hbtq guide",
    secondary: ["hbtq travel", "hbtq stader"],
  },
  cities: {
    path: "/cities",
    primary: "gay travel cities",
    secondary: ["queer cities", "lgbtq city guides"],
  },
  events: {
    path: "/events",
    primary: "queer events",
    secondary: ["gay events", "lgbtq events"],
  },
};

export function getCityKeywordOwnership(cityName = "") {
  const normalizedCity = String(cityName || "").trim();
  return {
    primary: `gay bars in ${normalizedCity}`,
    secondary: [
      `queer nightlife ${normalizedCity}`,
      `lgbtq travel ${normalizedCity}`,
      `queer guide ${normalizedCity}`,
    ],
  };
}
