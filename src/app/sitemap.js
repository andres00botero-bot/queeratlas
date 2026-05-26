import { cityCoreConfig as cityConfig } from "@/lib/cityCore";
import { listCityClusterTopics } from "@/lib/seo/cityClusters";

const BASE_URL = "https://www.queeratlas.app";
const LAST_CONTENT_UPDATE = new Date("2026-05-19T00:00:00.000Z");

export default function sitemap() {
  const staticRoutes = [
    "",
    "/cities",
    "/events",
    "/now",
    "/gay-guide",
    "/queer-guide",
    "/hbtq-guide",
    "/terms",
    "/privacy",
    "/community-policy",
  ];

  const staticEntries = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: LAST_CONTENT_UPDATE,
    changeFrequency: route === "" || route === "/now" ? "daily" : "weekly",
    priority:
      route === ""
        ? 1
        : route === "/now"
          ? 0.95
          : route === "/cities" || route === "/events"
            ? 0.9
            : 0.75,
  }));

  const cityEntries = Object.keys(cityConfig).map((city) => ({
    url: `${BASE_URL}/${city}`,
    lastModified: LAST_CONTENT_UPDATE,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const clusterTopics = listCityClusterTopics().map((topic) => topic.key);
  const cityClusterEntries = Object.keys(cityConfig).flatMap((city) =>
    clusterTopics.map((topic) => ({
      url: `${BASE_URL}/${city}/discover/${topic}`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "weekly",
      priority: 0.8,
    })),
  );

  return [...staticEntries, ...cityEntries, ...cityClusterEntries];
}

