import { existsSync, readFileSync } from "node:fs";
import { listCityClusterTopics } from "../src/lib/seo/cityClusters.js";
import { listTopicHubs } from "../src/lib/seo/topicHubs.js";
import {
  isIndexableTopicHub,
  isTier1CityTopic,
  TIER1_CITY_SLUGS,
} from "../src/lib/seo/indexingTier.js";

function fail(message) {
  console.error(`[internal-link-depth] FAILED: ${message}`);
  process.exit(1);
}

function read(path) {
  if (!existsSync(path)) fail(`Missing file: ${path}`);
  return readFileSync(path, "utf8");
}

const clusterTopics = listCityClusterTopics().map((topic) => topic.key);
const topicHubs = listTopicHubs().filter((hub) => isIndexableTopicHub(hub.key));

const discoverRoutes = TIER1_CITY_SLUGS.flatMap((city) =>
  clusterTopics
    .filter((topic) => isTier1CityTopic(city, topic))
    .map((topic) => `/${city}/discover/${topic}`),
);

const inbound = new Map(discoverRoutes.map((route) => [route, 0]));

function addInbound(target) {
  if (!inbound.has(target)) return;
  inbound.set(target, (inbound.get(target) || 0) + 1);
}

// Topic hubs visibly link to every indexable city/topic combination.
for (const hub of topicHubs) {
  const hubClusterKeys = Array.isArray(hub.clusterKeys)
    ? hub.clusterKeys
    : hub.clusterKey
      ? [hub.clusterKey]
      : [];
  for (const city of TIER1_CITY_SLUGS) {
    for (const topic of hubClusterKeys) {
      if (isTier1CityTopic(city, topic)) {
        addInbound(`/${city}/discover/${topic}`);
      }
    }
  }
}

// City page topic pills link to the featured discover routes for each city.
for (const city of TIER1_CITY_SLUGS) {
  const featuredClusterTopics = clusterTopics
    .filter((topic) => isTier1CityTopic(city, topic))
    .slice(0, 5);
  for (const topic of featuredClusterTopics) {
    addInbound(`/${city}/discover/${topic}`);
  }
}

// Coverage must come from visible topic hub cards, not a hidden bulk-link block.
const topicsPagePath = "src/app/topics/page.js";
const topicsPageSource = read(topicsPagePath);
if (/allDiscoverRoutes|Internal discover crawl links/.test(topicsPageSource)) {
  fail(`${topicsPagePath} still contains hidden bulk discover links.`);
}
const topicHubPagePath = "src/app/topics/[topic]/page.js";
const topicHubPageSource = read(topicHubPagePath);
if (!/TIER1_CITY_SLUGS/.test(topicHubPageSource) || !/isTier1CityTopic/.test(topicHubPageSource)) {
  fail(`${topicHubPagePath} is not aligned with the indexable city-topic tier.`);
}

const orphanRoutes = [];
const weakPriorityRoutes = [];
let strong = 0;
let medium = 0;
let low = 0;

for (const [route, count] of inbound.entries()) {
  if (count <= 0) orphanRoutes.push(route);
  else if (count >= 3) strong += 1;
  else if (count === 2) medium += 1;
  else low += 1;
}

for (const city of TIER1_CITY_SLUGS) {
  const featuredClusterTopics = clusterTopics
    .filter((topic) => isTier1CityTopic(city, topic))
    .slice(0, 5);
  for (const topic of featuredClusterTopics) {
    const route = `/${city}/discover/${topic}`;
    const count = inbound.get(route) || 0;
    if (count < 2) {
      weakPriorityRoutes.push({ route, count });
    }
  }
}

const coverage = ((discoverRoutes.length - orphanRoutes.length) / discoverRoutes.length) * 100;
console.log("[internal-link-depth] summary", {
  discoverRouteCount: discoverRoutes.length,
  strong,
  medium,
  low,
  orphanCount: orphanRoutes.length,
  weakPriorityRouteCount: weakPriorityRoutes.length,
  coveragePct: Number(coverage.toFixed(2)),
});

if (orphanRoutes.length > 0) {
  console.error("[internal-link-depth] orphan routes (first 20):");
  for (const route of orphanRoutes.slice(0, 20)) {
    console.error(`- ${route}`);
  }
  process.exit(1);
}

if (weakPriorityRoutes.length > 0) {
  console.error("[internal-link-depth] weak priority routes (first 20):");
  for (const item of weakPriorityRoutes.slice(0, 20)) {
    console.error(`- ${item.route} (inbound=${item.count}, expected>=2)`);
  }
  process.exit(1);
}

console.log("[internal-link-depth] PASSED");
