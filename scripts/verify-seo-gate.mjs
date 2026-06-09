import { readFileSync, existsSync } from "node:fs";

function read(path) {
  if (!existsSync(path)) {
    throw new Error(`Missing file: ${path}`);
  }
  return readFileSync(path, "utf8");
}

function ensureContains(source, pattern, message, failures) {
  if (!pattern.test(source)) {
    failures.push(message);
  }
}

const failures = [];

const rootLayoutPath = "src/app/layout.js";
const rootLayout = read(rootLayoutPath);
ensureContains(rootLayout, /export const metadata\s*=\s*{/, `${rootLayoutPath}: missing metadata export`, failures);
ensureContains(rootLayout, /title:\s*{/, `${rootLayoutPath}: missing title metadata`, failures);
ensureContains(rootLayout, /description:/, `${rootLayoutPath}: missing description metadata`, failures);
ensureContains(rootLayout, /alternates:\s*{[\s\S]*canonical:/, `${rootLayoutPath}: missing canonical metadata`, failures);
ensureContains(rootLayout, /robots:\s*{/, `${rootLayoutPath}: missing robots metadata`, failures);
const hasInlineWebSiteJsonLd = /"@type":\s*"WebSite"/.test(rootLayout);
const usesPrimaryEntityGraph = /buildPrimaryEntityGraph\s*\(/.test(rootLayout);
if (!hasInlineWebSiteJsonLd) {
  if (!usesPrimaryEntityGraph) {
    failures.push(`${rootLayoutPath}: missing WebSite JSON-LD`);
  } else {
    const entityAuthorityPath = "src/lib/seo/entityAuthority.js";
    const entityAuthoritySource = read(entityAuthorityPath);
    ensureContains(
      entityAuthoritySource,
      /"@type":\s*"WebSite"/,
      `${entityAuthorityPath}: missing WebSite entity`,
      failures
    );
    ensureContains(
      entityAuthoritySource,
      /"@type":\s*"SearchAction"/,
      `${entityAuthorityPath}: missing SearchAction for WebSite`,
      failures
    );
  }
}

const indexedRouteFiles = [
  "src/app/cities/layout.js",
  "src/app/events/layout.js",
  "src/app/now/layout.js",
  "src/app/search/layout.js",
  "src/app/gay-guide/page.js",
  "src/app/queer-guide/page.js",
  "src/app/hbtq-guide/page.js",
  "src/app/terms/page.js",
  "src/app/privacy/page.js",
  "src/app/community-policy/page.js",
];

for (const filePath of indexedRouteFiles) {
  const source = read(filePath);
  ensureContains(
    source,
    /(export const metadata\s*=\s*{)|(generateMetadata\s*\()/,
    `${filePath}: missing metadata definition`,
    failures
  );
  ensureContains(source, /title:/, `${filePath}: missing title`, failures);
  ensureContains(source, /description:/, `${filePath}: missing description`, failures);
  ensureContains(source, /alternates:\s*{[\s\S]*canonical:/, `${filePath}: missing canonical`, failures);
}

const guideMetadataChecks = [
  ["src/app/gay-guide/page.js", "Gay Travel Guide 2026"],
  ["src/app/queer-guide/page.js", "Queer Travel Guide 2026"],
  ["src/app/hbtq-guide/page.js", "HBTQ Guide 2026"],
];
for (const [filePath, expectedTitle] of guideMetadataChecks) {
  const source = read(filePath);
  ensureContains(
    source,
    new RegExp(`title:\\s*"${expectedTitle}"`),
    `${filePath}: HTML title must rely on the root brand template`,
    failures
  );
  if (/languages:\s*{/.test(source)) {
    failures.push(`${filePath}: hreflang must not map non-localized guide pages`);
  }
}

const reportsIndexSource = read("src/app/reports/page.js");
ensureContains(
  reportsIndexSource,
  /title:\s*"Queer Reports 2026: Nightlife, Safety & Events"/,
  "src/app/reports/page.js: missing concise non-duplicated title",
  failures
);
const reportDetailSource = read("src/app/reports/[slug]/page.js");
ensureContains(
  reportDetailSource,
  /const title = report\.title/,
  "src/app/reports/[slug]/page.js: report title must rely on the root brand template",
  failures
);

const topicsIndexSource = read("src/app/topics/page.js");
ensureContains(
  topicsIndexSource,
  /title:\s*"Queer Topic Hubs 2026"/,
  "src/app/topics/page.js: missing concise non-duplicated title",
  failures
);
const topicDetailSource = read("src/app/topics/[topic]/page.js");
ensureContains(
  topicDetailSource,
  /const title = `\$\{hub\.title\} 2026`/,
  "src/app/topics/[topic]/page.js: topic title must rely on the root brand template",
  failures
);

const cityLayoutPath = "src/app/[city]/layout.js";
const cityLayout = read(cityLayoutPath);
ensureContains(cityLayout, /generateMetadata\s*\(/, `${cityLayoutPath}: missing generateMetadata`, failures);
ensureContains(cityLayout, /title:/, `${cityLayoutPath}: missing title in generateMetadata`, failures);
ensureContains(cityLayout, /description:/, `${cityLayoutPath}: missing description in generateMetadata`, failures);
ensureContains(cityLayout, /alternates:\s*{[\s\S]*canonical/, `${cityLayoutPath}: missing canonical in generateMetadata`, failures);
ensureContains(
  cityLayout,
  /Guide 2026: Bars, Events & Safety/,
  `${cityLayoutPath}: city title template is missing or too verbose`,
  failures
);

const sitemapPath = "src/app/sitemap.js";
const sitemapSource = read(sitemapPath);
ensureContains(sitemapSource, /const staticRoutes\s*=\s*\[/, `${sitemapPath}: missing staticRoutes`, failures);
ensureContains(
  sitemapSource,
  /\.filter\(\(topic\)\s*=>\s*isTier1CityTopic\(city,\s*topic\.key\)\)/,
  `${sitemapPath}: city topic routes must be limited by the indexing tier`,
  failures
);
ensureContains(
  sitemapSource,
  /if\s*\(!value\)\s*return null/,
  `${sitemapPath}: lastmod must be omitted when no verified content date exists`,
  failures
);
if (/function resolveLastContentUpdate\(\)[\s\S]*?return new Date\(\)/.test(sitemapSource)) {
  failures.push(`${sitemapPath}: lastmod must not default to the deployment date`);
}
for (const route of ["/cities", "/events", "/now", "/gay-guide", "/queer-guide", "/hbtq-guide"]) {
  const escaped = route.replace("/", "\\/");
  ensureContains(
    sitemapSource,
    new RegExp(`"${escaped}"`),
    `${sitemapPath}: indexed route ${route} missing from sitemap`,
    failures
  );
}

const cityTopicPath = "src/app/[city]/discover/[topic]/page.js";
const cityTopicSource = read(cityTopicPath);
ensureContains(
  cityTopicSource,
  /const tierReady = isTier1CityTopic\(city,\s*topic\)/,
  `${cityTopicPath}: missing city topic indexing tier check`,
  failures
);
ensureContains(
  cityTopicSource,
  /const shouldIndex = qualityReady && tierReady/,
  `${cityTopicPath}: indexability must require both content quality and tier eligibility`,
  failures
);
ensureContains(
  cityTopicSource,
  /const title = `\$\{topicConfig\.title\} in \$\{cityName\} \(2026\) \| Queer Atlas`/,
  `${cityTopicPath}: city topic title must use the concise title template`,
  failures
);

const homeClientPath = "src/components/home/HomePageClient.js";
const homeClientSource = read(homeClientPath);
ensureContains(
  homeClientSource,
  /across 130\+ cities/,
  `${homeClientPath}: city coverage claim must match the configured inventory`,
  failures
);
if (/across 300\+ cities/.test(homeClientSource)) {
  failures.push(`${homeClientPath}: outdated 300+ cities claim`);
}

const robotsPath = "src/app/robots.js";
const robotsSource = read(robotsPath);
ensureContains(robotsSource, /allow:\s*"\/"/, `${robotsPath}: missing allow "/"`, failures);
ensureContains(robotsSource, /sitemap:/, `${robotsPath}: missing sitemap entry`, failures);

const structuredDataChecks = [
  {
    path: "src/app/[city]/page.js",
    regex: /CitySeoScaffold|CityJsonLdScripts/,
    message: "src/app/[city]/page.js: missing city SEO scaffold usage",
  },
  {
    path: "src/app/now/page.js",
    regex: /application\/ld\+json/,
    message: "src/app/now/page.js: missing JSON-LD script tag",
  },
  {
    path: "src/app/gay-guide/page.js",
    regex: /application\/ld\+json/,
    message: "src/app/gay-guide/page.js: missing JSON-LD script tag",
  },
  {
    path: "src/app/queer-guide/page.js",
    regex: /application\/ld\+json/,
    message: "src/app/queer-guide/page.js: missing JSON-LD script tag",
  },
  {
    path: "src/app/hbtq-guide/page.js",
    regex: /application\/ld\+json/,
    message: "src/app/hbtq-guide/page.js: missing JSON-LD script tag",
  },
];

for (const check of structuredDataChecks) {
  const source = read(check.path);
  ensureContains(source, check.regex, check.message, failures);
}

if (failures.length > 0) {
  console.error("[seo-gate] FAILED");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("[seo-gate] PASSED");
