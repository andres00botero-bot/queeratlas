import { existsSync, readFileSync } from "node:fs";
import { cityCoreConfig } from "../src/lib/cityCore.js";
import { listCityClusterTopics } from "../src/lib/seo/cityClusters.js";
import { listTopicHubs } from "../src/lib/seo/topicHubs.js";

function fail(message) {
  console.error(`[internal-link-depth] FAILED: ${message}`);
  process.exit(1);
}

function read(path) {
  if (!existsSync(path)) fail(`Missing file: ${path}`);
  return readFileSync(path, "utf8");
}

const cityKeys = Object.keys(cityCoreConfig);
const clusterTopics = listCityClusterTopics().map((topic) => topic.key);
const featuredClusterTopics = clusterTopics.slice(0, 5);
const topicHubs = listTopicHubs();

const discoverRoutes = cityKeys.flatMap((city) =>
  clusterTopics.map((topic) => `/${city}/discover/${topic}`),
);

const inbound = new Map(discoverRoutes.map((route) => [route, 0]));

function addInbound(target) {
  if (!inbound.has(target)) return;
  inbound.set(target, (inbound.get(target) || 0) + 1);
}

// /cities and /now crawl subsets (first 12 cities) + topic hub pages.
const crawlSubsetCities = cityKeys.slice(0, 12);
for (const city of crawlSubsetCities) {
  for (const topic of clusterTopics) {
    addInbound(`/${city}/discover/${topic}`);
  }
}

// Topic hubs link to selected city/topic combinations.
for (const hub of topicHubs) {
  const hubCities = Array.isArray(hub.cities) ? hub.cities : [];
  const hubClusterKeys = Array.isArray(hub.clusterKeys)
    ? hub.clusterKeys
    : hub.clusterKey
      ? [hub.clusterKey]
      : [];
  for (const city of hubCities) {
    for (const topic of hubClusterKeys) {
      addInbound(`/${city}/discover/${topic}`);
    }
  }
}

// City page topic pills link to the featured discover routes for each city.
for (const city of cityKeys) {
  for (const topic of featuredClusterTopics) {
    addInbound(`/${city}/discover/${topic}`);
  }
}

// /topics must expose full crawl coverage for all discover routes.
const topicsPagePath = "src/app/topics/page.js";
const topicsPageSource = read(topicsPagePath);
if (!/Internal discover crawl links/.test(topicsPageSource)) {
  fail(`${topicsPagePath} is missing the discover crawl nav marker.`);
}
if (!/allDiscoverRoutes\.map\(/.test(topicsPageSource)) {
  fail(`${topicsPagePath} is missing allDiscoverRoutes crawl mapping.`);
}
for (const route of discoverRoutes) {
  addInbound(route);
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

for (const city of cityKeys) {
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
