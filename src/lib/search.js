import { cityConfig } from "@/lib/cities";

function scoreMatch(text, query) {
  if (!text) return 0;
  const value = text.toLowerCase();
  if (value === query) return 140;
  if (value.startsWith(query)) return 100;
  if (value.includes(` ${query}`)) return 80;
  if (value.includes(query)) return 55;
  return 0;
}

function aggregateScore(parts, query) {
  return parts.reduce((sum, part) => sum + scoreMatch(part, query), 0);
}

export function buildAtlasSearchResults({ query, places, events, cityLimit = 5, placeLimit = 6, eventLimit = 6 }) {
  const normalized = query?.trim().toLowerCase();

  if (!normalized) {
    return { cities: [], places: [], events: [], all: [] };
  }

  const cityResults = Object.entries(cityConfig)
    .map(([key, city]) => {
      const score = aggregateScore(
        [key, city.title, city.country, city.vibe],
        normalized
      );
      return {
        id: key,
        key,
        name: city.title.replace("Queer ", ""),
        title: city.title,
        country: city.country || "",
        vibe: city.vibe || "",
        type: "city",
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, cityLimit);

  const placeResults = places
    .map((place) => {
      const score = aggregateScore(
        [place.name, place.city, place.vibe, place.type],
        normalized
      );
      return { ...place, type: "place", score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, placeLimit);

  const eventResults = events
    .map((event) => {
      const score = aggregateScore(
        [event.name, event.city, event.description],
        normalized
      );
      return { ...event, type: "event", score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, eventLimit);

  return {
    cities: cityResults,
    places: placeResults,
    events: eventResults,
    all: [...cityResults, ...placeResults, ...eventResults].sort((a, b) => b.score - a.score),
  };
}
