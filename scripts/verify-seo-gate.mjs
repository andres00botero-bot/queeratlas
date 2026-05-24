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
ensureContains(rootLayout, /"@type":\s*"WebSite"/, `${rootLayoutPath}: missing WebSite JSON-LD`, failures);

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
  const canonicalRequired = filePath !== "src/app/community-policy/page.js";
  if (canonicalRequired) {
    ensureContains(source, /alternates:\s*{[\s\S]*canonical:/, `${filePath}: missing canonical`, failures);
  }
}

const cityLayoutPath = "src/app/[city]/layout.js";
const cityLayout = read(cityLayoutPath);
ensureContains(cityLayout, /generateMetadata\s*\(/, `${cityLayoutPath}: missing generateMetadata`, failures);
ensureContains(cityLayout, /title:/, `${cityLayoutPath}: missing title in generateMetadata`, failures);
ensureContains(cityLayout, /description:/, `${cityLayoutPath}: missing description in generateMetadata`, failures);
ensureContains(cityLayout, /alternates:\s*{[\s\S]*canonical/, `${cityLayoutPath}: missing canonical in generateMetadata`, failures);

const sitemapPath = "src/app/sitemap.js";
const sitemapSource = read(sitemapPath);
ensureContains(sitemapSource, /const staticRoutes\s*=\s*\[/, `${sitemapPath}: missing staticRoutes`, failures);
for (const route of ["/cities", "/events", "/now", "/gay-guide", "/queer-guide", "/hbtq-guide"]) {
  const escaped = route.replace("/", "\\/");
  ensureContains(
    sitemapSource,
    new RegExp(`"${escaped}"`),
    `${sitemapPath}: indexed route ${route} missing from sitemap`,
    failures
  );
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
