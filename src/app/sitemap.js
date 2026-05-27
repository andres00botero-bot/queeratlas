import { cityCoreConfig as cityConfig } from "@/lib/cityCore";
import { listCityClusterTopics } from "@/lib/seo/cityClusters";
import { listTopicHubs } from "@/lib/seo/topicHubs";
import { listSeoReports } from "@/lib/seo/reportsIndex";

const BASE_URL = "https://www.queeratlas.app";
const CLUSTER_INTENT_PRIORITY = {
  events: 0.88,
  safety: 0.87,
  nightlife: 0.84,
  community: 0.82,
  daylife: 0.8,
};

function resolveLastContentUpdate() {
  const candidates = [
    process.env.SITEMAP_LASTMOD_ISO,
    process.env.VERCEL_GIT_COMMIT_DATE,
  ];

  for (const value of candidates) {
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }

  return new Date();
}

export default function sitemap() {
  const lastContentUpdate = resolveLastContentUpdate();

  const staticRoutes = [
    "",
    "/cities",
    "/events",
    "/now",
    "/gay-guide",
    "/queer-guide",
    "/hbtq-guide",
    "/topics",
    "/reports",
    "/terms",
    "/privacy",
    "/community-policy",
  ];

  const staticEntries = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: lastContentUpdate,
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
    lastModified: lastContentUpdate,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const clusterTopics = listCityClusterTopics().map((topic) => ({
    key: topic.key,
    intent: String(topic.intent || "").trim().toLowerCase(),
  }));
  const cityClusterEntries = Object.keys(cityConfig).flatMap((city) =>
    clusterTopics.map((topic) => ({
      url: `${BASE_URL}/${city}/discover/${topic.key}`,
      lastModified: lastContentUpdate,
      changeFrequency: "weekly",
      priority: CLUSTER_INTENT_PRIORITY[topic.intent] || 0.8,
    })),
  );

  const topicHubEntries = listTopicHubs().map((hub) => ({
    url: `${BASE_URL}/topics/${hub.key}`,
    lastModified: lastContentUpdate,
    changeFrequency: "weekly",
    priority: 0.86,
  }));

  const reportEntries = listSeoReports().map((report) => ({
    url: `${BASE_URL}/reports/${report.slug}`,
    lastModified: new Date(report.updatedAt || lastContentUpdate),
    changeFrequency: "weekly",
    priority: 0.83,
  }));

  return [...staticEntries, ...cityEntries, ...cityClusterEntries, ...topicHubEntries, ...reportEntries];
}

