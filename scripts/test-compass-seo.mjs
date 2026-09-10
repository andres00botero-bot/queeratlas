import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isAllowedIndexNowUrl } from "../src/lib/seo/indexNow.js";
import { keywordOwnership } from "../src/lib/seo/keywordOwnership.js";

const pageSource = readFileSync("src/app/compass/page.js", "utf8");
const clientSource = readFileSync("src/app/compass/CompassClient.js", "utf8");
const homeSource = readFileSync("src/components/home/HomeDeferredSections.js", "utf8");
const termsSource = readFileSync("src/lib/compassTerms.js", "utf8");
const sitemapSource = readFileSync("src/lib/seo/sitemapEntries.js", "utf8");

assert.match(pageSource, /canonical:\s*["']\/compass["']/, "Compass needs a self-referencing canonical");
assert.match(pageSource, /index:\s*true/, "Compass must explicitly permit indexing");
assert.match(pageSource, /follow:\s*true/, "Compass must explicitly permit link following");
assert.match(pageSource, /DefinedTermSet/, "Compass needs glossary structured data");
assert.match(pageSource, /CollectionPage/, "Compass needs page-level structured data");
assert.match(pageSource, /BreadcrumbList/, "Compass needs breadcrumb structured data");
assert.match(clientSource, /<h1[^>]*>[\s\S]*What would you like to understand\?/, "Compass needs one visible descriptive H1");
assert.match(clientSource, /aria-label="Breadcrumb"/, "Compass needs visible breadcrumb navigation");
assert.match(homeSource, /href="\/compass"/, "Home must provide an internal link to Compass");
assert.match(termsSource, /sources:/, "Compass terms need visible source provenance");
assert.equal(keywordOwnership.compass.ownerPage, "/compass");
assert.equal(isAllowedIndexNowUrl("/compass"), true);

assert.match(sitemapSource, /["']\/compass["']/, "Compass must be present in the page sitemap");
assert.match(sitemapSource, /route === ["']\/compass["'] \? 0\.82/, "Compass needs its intended sitemap priority");

console.log("[compass-seo] PASSED");
