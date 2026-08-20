import { existsSync, readFileSync } from "node:fs";

function fail(message) {
  console.error(`[internal-link-depth] FAILED: ${message}`);
  process.exit(1);
}

function read(path) {
  if (!existsSync(path)) fail(`Missing file: ${path}`);
  return readFileSync(path, "utf8");
}

const topicsIndexSource = read("src/app/topics/page.js");
if (/allDiscoverRoutes|Internal discover crawl links/.test(topicsIndexSource)) {
  fail("src/app/topics/page.js still contains hidden bulk discover links.");
}

const topicRouteSource = read("src/lib/seo/topicHubRoutes.js");
if (!/hub\?\.cities/.test(topicRouteSource)) {
  fail("Topic hubs do not use their editorially configured city lists.");
}
if (!/evaluateCityDiscoveryIndexability/.test(topicRouteSource)) {
  fail("Topic hub routes are not filtered by live Discovery quality.");
}

const topicPageSource = read("src/app/topics/[topic]/page.js");
if (!/loadIndexableTopicHubRoutes/.test(topicPageSource)) {
  fail("Topic pages are not using the shared indexable route inventory.");
}

const discoveryPageSource = read("src/app/[city]/discover/[topic]/page.js");
if (!/evaluateCityDiscoveryIndexability/.test(discoveryPageSource)) {
  fail("Discovery metadata is not using the content quality gate.");
}

const discoveryDataSource = read("src/lib/seo/cityDiscoveryData.js");
if (!/dateMode === "tonight-preferred" && kind !== "event"/.test(discoveryDataSource)) {
  fail("Drag venues can still be treated as confirmed drag events tonight.");
}
if (/isTier1CityTopic/.test(discoveryPageSource)) {
  fail("Discovery metadata still depends on the legacy static city tier.");
}

const sitemapSource = read("src/lib/seo/sitemapEntries.js");
if (!/evaluateCityDiscoveryIndexability/.test(sitemapSource)) {
  fail("The page sitemap is not aligned with Discovery metadata quality.");
}
if (!/loadIndexableTopicHubRoutes/.test(sitemapSource)) {
  fail("The page sitemap is not aligned with topic hub route quality.");
}

console.log("[internal-link-depth] PASSED", {
  discoveryGate: "content-based",
  topicCities: "editorial-config",
  sitemapAlignment: true,
});
