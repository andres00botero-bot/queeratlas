import { listCityRegistry } from "@/lib/server/cityRegistry";
import { listCityClusterTopics } from "@/lib/seo/cityClusters";
import { buildEventPath, buildServicePath, buildVenuePath } from "@/lib/seo/entitySlug";
import { resolveEntityLastModified } from "@/lib/seo/entityIndexing";
import { loadSeoEntityInventory } from "@/lib/seo/entityInventory";
import {
  selectCityDiscoveryResults,
} from "@/lib/seo/cityDiscoveryData";
import { evaluateCityDiscoveryIndexability } from "@/lib/seo/cityDiscoveryQuality";
import { listSeoReports } from "@/lib/seo/reportsIndex";
import { listTopicHubs } from "@/lib/seo/topicHubs";
import {
  evaluateTopicHubIndexability,
  loadIndexableTopicHubRoutes,
} from "@/lib/seo/topicHubRoutes";
import { QA_SITE_URL } from "@/lib/seo/sitemapXml";
import { normalizeCitySlug } from "@/lib/seo/entitySlug";
import { ATLAS_COLLECTIONS } from "@/lib/atlasCollections";
import { supabase } from "@/lib/supabase";

const CLUSTER_INTENT_PRIORITY = {
  events: 0.88,
  safety: 0.87,
  nightlife: 0.84,
  community: 0.82,
  daylife: 0.8,
};

function newestDate(rows = []) {
  let newest = null;
  for (const row of rows) {
    const date = resolveEntityLastModified(row);
    if (date && (!newest || date > newest)) newest = date;
  }
  return newest;
}

function entryWithDate(entry, date) {
  return date ? { ...entry, lastModified: date } : entry;
}

function canonicalEntries(entries = []) {
  const seen = new Set();
  return entries.filter((entry) => {
    try {
      const url = new URL(String(entry?.url || ""));
      const isCanonicalOrigin = url.origin === QA_SITE_URL;
      const hasVariantSuffix = Boolean(url.search || url.hash);
      if (!isCanonicalOrigin || hasVariantSuffix || seen.has(url.href)) return false;
      seen.add(url.href);
      return true;
    } catch {
      return false;
    }
  });
}

export async function getPageSitemapEntries() {
  const [inventory, newsResponse, registryCities] = await Promise.all([
    loadSeoEntityInventory(),
    supabase
      .from("qa_world_news")
      .select("id,date,created_at")
      .order("created_at", { ascending: false }),
    listCityRegistry({ indexableOnly: true }),
  ]);
  const cityKeys = registryCities.map((city) => city.key);
  const allEntities = [...inventory.venues, ...inventory.events, ...inventory.services];
  const cityDates = new Map();
  for (const city of cityKeys) {
    cityDates.set(city, newestDate(allEntities.filter((row) => normalizeCitySlug(row?.city) === city)));
  }

  const staticRoutes = [
    "",
    "/cities",
    "/events",
    "/events/calendar",
    "/events/off-grid",
    "/now",
    "/now/news",
    "/now/rankings",
    "/now/data",
    "/now/collections",
    "/now/voices",
    "/now/happening-soon",
    "/gay-guide",
    "/queer-guide",
    "/hbtq-guide",
    "/topics",
    "/reports",
    "/terms",
    "/privacy",
    "/community-policy",
    "/about",
    "/editorial-policy",
    "/verification",
    "/sources-and-reviews",
    "/corrections",
    "/contributors",
    "/contact",
  ];

  const staticEntries = staticRoutes.map((route) => ({
    url: `${QA_SITE_URL}${route}`,
    changeFrequency: route === "" || route === "/now/news" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/now/news" ? 0.95 : ["/cities", "/events/calendar"].includes(route) ? 0.9 : 0.75,
  }));

  const cityEntries = cityKeys.map((city) => entryWithDate({
    url: `${QA_SITE_URL}/${city}`,
    changeFrequency: "weekly",
    priority: 0.9,
  }, cityDates.get(city)));

  const clusterTopics = listCityClusterTopics().map((topic) => ({
    key: topic.key,
    intent: String(topic.intent || "").trim().toLowerCase(),
  }));
  const todayIso = new Date().toISOString().slice(0, 10);
  const cityClusterEntries = cityKeys.flatMap((city) => {
    const places = inventory.venues.filter((row) => normalizeCitySlug(row?.city) === city);
    const events = inventory.events.filter((row) => normalizeCitySlug(row?.city) === city);
    const services = inventory.services.filter((row) => normalizeCitySlug(row?.city) === city);

    return clusterTopics.flatMap((topic) => {
      const discovery = selectCityDiscoveryResults({
        city,
        topic: topic.key,
        places,
        events,
        services,
        todayIso,
      });
      const quality = evaluateCityDiscoveryIndexability({ topic: topic.key, discovery });
      if (!quality.indexable) return [];
      return [entryWithDate({
        url: `${QA_SITE_URL}/${city}/discover/${topic.key}`,
        changeFrequency: "weekly",
        priority: CLUSTER_INTENT_PRIORITY[topic.intent] || 0.8,
      }, cityDates.get(city))];
    });
  });

  const topicHubEntries = (await Promise.all(listTopicHubs().map(async (hub) => {
    const routes = await loadIndexableTopicHubRoutes(hub.key);
    const quality = evaluateTopicHubIndexability({ hub, routes });
    if (!quality.indexable) return null;
    return {
      url: `${QA_SITE_URL}/topics/${hub.key}`,
      changeFrequency: "weekly",
      priority: 0.86,
    };
  }))).filter(Boolean);

  const reportEntries = listSeoReports().map((report) => ({
    url: `${QA_SITE_URL}/reports/${report.slug}`,
    ...(report.updatedAt ? { lastModified: new Date(report.updatedAt) } : {}),
    changeFrequency: "monthly",
    priority: 0.83,
  }));

  const collectionEntries = ATLAS_COLLECTIONS.map((collection) => ({
    url: `${QA_SITE_URL}${collection.href}`,
    ...(collection.updatedAt ? { lastModified: new Date(collection.updatedAt) } : {}),
    changeFrequency: "monthly",
    priority: 0.82,
  }));

  const newsArticleEntries = (newsResponse?.error ? [] : newsResponse?.data || []).map((article) =>
    entryWithDate(
      {
        url: `${QA_SITE_URL}/now/news/${encodeURIComponent(String(article.id))}`,
        changeFrequency: "monthly",
        priority: 0.8,
      },
      article.created_at || article.date ? new Date(article.created_at || article.date) : null
    )
  );

  return canonicalEntries([
    ...staticEntries,
    ...cityEntries,
    ...cityClusterEntries,
    ...topicHubEntries,
    ...reportEntries,
    ...collectionEntries,
    ...newsArticleEntries,
  ]);
}

export async function getVenueSitemapEntries() {
  const [{ venues }, registryCities] = await Promise.all([
    loadSeoEntityInventory(),
    listCityRegistry({ indexableOnly: true }),
  ]);
  const indexableCities = new Set(registryCities.map((city) => city.key));
  return canonicalEntries(venues.filter((venue) => indexableCities.has(normalizeCitySlug(venue?.city))).map((venue) => entryWithDate({
    url: `${QA_SITE_URL}${buildVenuePath(venue.city, venue)}`,
    changeFrequency: "monthly",
    priority: 0.72,
  }, resolveEntityLastModified(venue))));
}

export async function getEventSitemapEntries() {
  const [{ events }, registryCities] = await Promise.all([
    loadSeoEntityInventory(),
    listCityRegistry({ indexableOnly: true }),
  ]);
  const indexableCities = new Set(registryCities.map((city) => city.key));
  return canonicalEntries(events.filter((event) => indexableCities.has(normalizeCitySlug(event?.city))).map((event) => entryWithDate({
    url: `${QA_SITE_URL}${buildEventPath(event.city, event)}`,
    changeFrequency: "daily",
    priority: 0.76,
  }, resolveEntityLastModified(event))));
}

export async function getServiceSitemapEntries() {
  const [{ services }, registryCities] = await Promise.all([
    loadSeoEntityInventory(),
    listCityRegistry({ indexableOnly: true }),
  ]);
  const indexableCities = new Set(registryCities.map((city) => city.key));
  return canonicalEntries(services.filter((service) => indexableCities.has(normalizeCitySlug(service?.city))).map((service) => entryWithDate({
    url: `${QA_SITE_URL}${buildServicePath(service.city, service)}`,
    changeFrequency: "monthly",
    priority: 0.68,
  }, resolveEntityLastModified(service))));
}
