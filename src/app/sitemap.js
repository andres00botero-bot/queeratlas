import { cityConfig } from "@/lib/cities";

const BASE_URL = "https://queeratlas.app";

export default function sitemap() {
  const now = new Date();
  const staticRoutes = [
    "",
    "/cities",
    "/events",
    "/now",
    "/search",
    "/terms",
    "/privacy",
    "/community-policy",
  ];

  const staticEntries = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/cities" || route === "/events" ? 0.9 : 0.75,
  }));

  const cityEntries = Object.keys(cityConfig).map((city) => ({
    url: `${BASE_URL}/${city}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticEntries, ...cityEntries];
}
