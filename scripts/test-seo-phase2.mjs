import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const requiredTrustRoutes = [
  "about",
  "editorial-policy",
  "verification",
  "sources-and-reviews",
  "community-policy",
  "corrections",
  "contributors",
  "contact",
];

const failures = [];

for (const route of requiredTrustRoutes) {
  const routeFile = `src/app/${route}/page.js`;
  if (!fs.existsSync(path.join(root, routeFile))) {
    failures.push(`Missing trust route: /${route}`);
  }
}

const sitemap = read("src/lib/seo/sitemapEntries.js");
for (const route of requiredTrustRoutes) {
  if (!sitemap.includes(`"/${route}"`)) {
    failures.push(`Trust route missing from sitemap entries: /${route}`);
  }
}

const editorialTargets = [
  "src/app/gay-guide/page.js",
  "src/app/queer-guide/page.js",
  "src/app/hbtq-guide/page.js",
  "src/app/reports/[slug]/page.js",
  "src/app/now/collections/[slug]/page.js",
  "src/app/[city]/discover/[topic]/page.js",
];

for (const target of editorialTargets) {
  const source = read(target);
  if (!source.includes("EditorialDisclosure")) failures.push(`Missing editorial disclosure: ${target}`);
  if (!source.includes("datePublished")) failures.push(`Missing datePublished schema: ${target}`);
  if (!source.includes("dateModified")) failures.push(`Missing dateModified schema: ${target}`);
  if (!source.includes("author")) failures.push(`Missing author schema: ${target}`);
}

const authority = read("src/lib/seo/entityAuthority.js");
for (const marker of ["contactPoint", "publishingPrinciples", "correctionsPolicy"]) {
  if (!authority.includes(marker)) failures.push(`Organization schema missing ${marker}`);
}

const editorialMigration = read("supabase/editorial-system-v1.sql");
for (const table of [
  "qa_editorial_people",
  "qa_editorial_entries",
  "qa_editorial_sources",
  "qa_editorial_revisions",
]) {
  if (!editorialMigration.includes(`create table if not exists public.${table}`)) {
    failures.push(`Editorial migration missing table: ${table}`);
  }
  if (!editorialMigration.includes(`alter table public.${table} enable row level security`)) {
    failures.push(`Editorial migration missing RLS: ${table}`);
  }
}

if (!fs.existsSync(path.join(root, "src/app/admin/editorial/page.js"))) {
  failures.push("Missing editorial admin route");
}

const editorialData = read("src/lib/editorialData.js");
if (!editorialData.includes("getPublishedEditorialRecord")) {
  failures.push("Missing public editorial data resolver");
}

if (failures.length > 0) {
  console.error("SEO phase 2 trust test failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("SEO phase 2 trust test passed.");
