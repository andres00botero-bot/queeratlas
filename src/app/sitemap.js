import { cityCoreConfig as cityConfig } from "@/lib/cityCore";
import { listCityClusterTopics } from "@/lib/seo/cityClusters";
import { listTopicHubs } from "@/lib/seo/topicHubs";
import { listSeoReports } from "@/lib/seo/reportsIndex";
import { seedEvents, seedPlaces } from "@/lib/seedContent";
import { buildEventPath, buildVenuePath } from "@/lib/seo/entitySlug";
import { isIndexableTopicHub, isTier1CityTopic, TIER1_CITY_SLUGS } from "@/lib/seo/indexingTier";

const BASE_URL = "https://www.queeratlas.app";
const MAX_EVENT_ENTITY_ENTRIES = 250;
const MAX_VENUE_ENTITY_ENTRIES = 250;
const CLUSTER_INTENT_PRIORITY = {
  events: 0.88,
  safety: 0.87,
  nightlife: 0.84,
  community: 0.82,
  daylife: 0.8,
};
const tier1CitySet = new Set(TIER1_CITY_SLUGS);

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
    })).filter((entry) => {
      const [, citySlug, , topicKey] = entry.url.replace(BASE_URL, "").split("/");
      return isTier1CityTopic(citySlug, topicKey);
    }),
  );

  const topicHubEntries = listTopicHubs().filter((hub) => isIndexableTopicHub(hub.key)).map((hub) => ({
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

  const todayIso = new Date().toISOString().slice(0, 10);
  const eventEntityEntries = seedEvents
    .filter((event) => tier1CitySet.has(String(event?.city || "").trim().toLowerCase()))
    .filter((event) => String(event?.date || "").trim() >= todayIso)
    .slice(0, MAX_EVENT_ENTITY_ENTRIES)
    .map((event) => ({
      url: `${BASE_URL}${buildEventPath(event.city, event)}`,
      lastModified: lastContentUpdate,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const venueEntityEntries = seedPlaces
    .filter((place) => tier1CitySet.has(String(place?.city || "").trim().toLowerCase()))
    .filter((place) => String(place?.link || "").trim().length > 0)
    .slice(0, MAX_VENUE_ENTITY_ENTRIES)
    .map((place) => ({
      url: `${BASE_URL}${buildVenuePath(place.city, place)}`,
      lastModified: lastContentUpdate,
      changeFrequency: "monthly",
      priority: 0.65,
    }));

  const deduped = new Map();
  for (const entry of [
    ...staticEntries,
    ...cityEntries,
    ...cityClusterEntries,
    ...topicHubEntries,
    ...reportEntries,
    ...eventEntityEntries,
    ...venueEntityEntries,
  ]) {
    deduped.set(entry.url, entry);
  }

  return [...deduped.values()];
}

