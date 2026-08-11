import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { evaluateEventSeoQuality } from "../src/lib/seo/entityIndexing.js";

function source(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

const discoveryData = source("src/lib/seo/cityDiscoveryData.js");
assert.match(discoveryData, /\(rule\.keywords \|\| \[\]\)\.filter/);

const cityLayout = source("src/app/[city]/layout.js");
assert.match(cityLayout, /if \(!coreConfig\) notFound\(\)/);
assert.doesNotMatch(cityLayout, /cityConfig\.berlin/);

const nextConfig = source("next.config.mjs");
assert.match(nextConfig, /type: "host", value: "queeratlas\.app"/);
assert.match(nextConfig, /destination: "https:\/\/www\.queeratlas\.app\/:path\*"/);

for (const route of ["venues", "events", "services"]) {
  const detail = source(`src/app/[city]/${route}/[slug]/page.js`);
  assert.match(detail, /permanentRedirect\(canonicalPath\)/);
  assert.match(detail, /const find\w+ByParams = cache\(/);
}

const venueDetail = source("src/app/[city]/venues/[slug]/page.js");
assert.match(venueDetail, /filters: isDatabaseId \? \{ city, id: parsed\.id \} : \{ city \}/);
assert.doesNotMatch(venueDetail, /redirect\(buildVenueFallbackPath/);
assert.match(venueDetail, /const databaseDuplicate =/);
assert.match(venueDetail, /normalizedExternalIdentity\(row\?\.link\) === matchedOfficialIdentity/);

const eventDetail = source("src/app/[city]/events/[slug]/page.js");
assert.match(eventDetail, /\.from\("events"\)\.select\("\*"\)\.eq\("city", city\)/);

const serviceDetail = source("src/app/[city]/services/[slug]/page.js");
assert.match(serviceDetail, /\.from\("services"\)\.select\("\*"\)\.eq\("city", city\)/);

const authority = source("src/lib/seo/entityAuthority.js");
assert.doesNotMatch(authority, /SearchAction|search_term_string/);

const sitemapEntries = source("src/lib/seo/sitemapEntries.js");
assert.match(sitemapEntries, /function canonicalEntries/);
assert.match(sitemapEntries, /url\.origin === QA_SITE_URL/);
assert.match(sitemapEntries, /Boolean\(url\.search \|\| url\.hash\)/);

for (const detailPath of [
  "src/app/[city]/venues/[slug]/page.js",
  "src/app/[city]/events/[slug]/page.js",
  "src/app/[city]/services/[slug]/page.js",
]) {
  assert.doesNotMatch(source(detailPath), /href=\{`\/\$\{city\}\?(?:placeId|eventId|serviceId)=/);
}

const expiredEvent = evaluateEventSeoQuality({
  id: 1,
  city: "fireisland",
  name: "Past event",
  description: "A researched event description with enough detail to pass the minimum editorial description threshold for testing.",
  link: "https://example.com/event",
  end_date: "2020-01-01",
  seo_indexable: true,
  event_intel: {
    entry_wait: "A sufficiently detailed entry wait note.",
    best_arrival: "A sufficiently detailed arrival note.",
    crowd_mix: "A sufficiently detailed crowd mix note.",
    dress_code: "A sufficiently detailed dress code note.",
    host_inclusivity: "A sufficiently detailed inclusivity note.",
  },
});
assert.equal(expiredEvent.indexable, false);
assert.ok(expiredEvent.reasons.includes("expired-event"));

console.log("GSC indexing regression checks passed.");
