import { cityConfig } from "@/lib/cities";

const BASE_URL = "https://queeratlas.app";

export default function sitemap() {
  const now = new Date();
  const staticRoutes = [
    "",
    "/cities",
    "/events",
    "/now",
    "/community",
    "/contribute",
    "/favorites",
    "/search",
    "/terms",
    "/privacy",
    "/community-policy",
  ];

  const staticEntries = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  const cityEntries = Object.keys(cityConfig).map((city) => ({
    url: `${BASE_URL}/${city}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticEntries, ...cityEntries];
}
