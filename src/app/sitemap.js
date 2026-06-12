import { cityCoreConfig as cityConfig } from "@/lib/cityCore";
import { listCityClusterTopics } from "@/lib/seo/cityClusters";
import { listTopicHubs } from "@/lib/seo/topicHubs";
import { listSeoReports } from "@/lib/seo/reportsIndex";
import { seedEvents, seedPlaces } from "@/lib/seedContent";
import { bolognaSeedEvents, bolognaSeedPlaces } from "@/lib/seed/regions/bologna";
import { creteSeedEvents, creteSeedPlaces } from "@/lib/seed/regions/crete";
import { cyprusSeedEvents, cyprusSeedPlaces } from "@/lib/seed/regions/cyprus";
import { chiangMaiSeedEvents, chiangMaiSeedPlaces } from "@/lib/seed/regions/chiangMai";
import { kohSamuiSeedEvents, kohSamuiSeedPlaces } from "@/lib/seed/regions/kohSamui";
import { ljubljanaSeedEvents, ljubljanaSeedPlaces } from "@/lib/seed/regions/ljubljana";
import { marseilleSeedEvents, marseilleSeedPlaces } from "@/lib/seed/regions/marseille";
import { buildEventPath, buildVenuePath } from "@/lib/seo/entitySlug";
import { isIndexableTopicHub, isTier1CityTopic } from "@/lib/seo/indexingTier";

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
const indexableCitySet = new Set(Object.keys(cityConfig));

function resolveLastContentUpdate() {
  const value = process.env.SITEMAP_LASTMOD_ISO;
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function withLastModified(entry, lastModified) {
  return lastModified ? { ...entry, lastModified } : entry;
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

  const staticEntries = staticRoutes.map((route) => withLastModified({
    url: `${BASE_URL}${route}`,
    changeFrequency: route === "" || route === "/now" ? "daily" : "weekly",
    priority:
      route === ""
        ? 1
        : route === "/now"
          ? 0.95
          : route === "/cities" || route === "/events"
            ? 0.9
            : 0.75,
  }, lastContentUpdate));

  const cityEntries = Object.keys(cityConfig).map((city) => withLastModified({
    url: `${BASE_URL}/${city}`,
    changeFrequency: "weekly",
    priority: 0.9,
  }, lastContentUpdate));

  const clusterTopics = listCityClusterTopics().map((topic) => ({
    key: topic.key,
    intent: String(topic.intent || "").trim().toLowerCase(),
  }));
  const cityClusterEntries = Object.keys(cityConfig).flatMap((city) =>
    clusterTopics
      .filter((topic) => isTier1CityTopic(city, topic.key))
      .map((topic) => withLastModified({
        url: `${BASE_URL}/${city}/discover/${topic.key}`,
        changeFrequency: "weekly",
        priority: CLUSTER_INTENT_PRIORITY[topic.intent] || 0.8,
      }, lastContentUpdate)),
  );

  const topicHubEntries = listTopicHubs()
    .filter((hub) => isIndexableTopicHub(hub.key))
    .map((hub) => withLastModified({
      url: `${BASE_URL}/topics/${hub.key}`,
      changeFrequency: "weekly",
      priority: 0.86,
    }, lastContentUpdate));

  const reportEntries = listSeoReports().map((report) => ({
    url: `${BASE_URL}/reports/${report.slug}`,
    ...(report.updatedAt ? { lastModified: new Date(report.updatedAt) } : {}),
    changeFrequency: "weekly",
    priority: 0.83,
  }));

  const todayIso = new Date().toISOString().slice(0, 10);
  const eventEntityEntries = [...bolognaSeedEvents, ...creteSeedEvents, ...cyprusSeedEvents, ...chiangMaiSeedEvents, ...kohSamuiSeedEvents, ...ljubljanaSeedEvents, ...marseilleSeedEvents, ...seedEvents]
    .filter((event) => indexableCitySet.has(String(event?.city || "").trim().toLowerCase()))
    .filter((event) => String(event?.date || "").trim() >= todayIso)
    .slice(0, MAX_EVENT_ENTITY_ENTRIES)
    .map((event) => withLastModified({
      url: `${BASE_URL}${buildEventPath(event.city, event)}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }, lastContentUpdate));

  const venueEntityEntries = [...bolognaSeedPlaces, ...creteSeedPlaces, ...cyprusSeedPlaces, ...chiangMaiSeedPlaces, ...kohSamuiSeedPlaces, ...ljubljanaSeedPlaces, ...marseilleSeedPlaces, ...seedPlaces]
    .filter((place) => indexableCitySet.has(String(place?.city || "").trim().toLowerCase()))
    .filter((place) => String(place?.link || "").trim().length > 0)
    .slice(0, MAX_VENUE_ENTITY_ENTRIES)
    .map((place) => withLastModified({
      url: `${BASE_URL}${buildVenuePath(place.city, place)}`,
      changeFrequency: "monthly",
      priority: 0.65,
    }, lastContentUpdate));

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

