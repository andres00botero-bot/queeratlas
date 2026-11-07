import { readFileSync } from "node:fs";
import { cityPath } from "../src/lib/cityRouting.js";

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

assert(cityPath("Wroc_aw") === "/wroc-aw", "city URLs must use hyphens, never underscores");
assert(cityPath("Mexico City") === "/mexico-city", "city names must normalize to one canonical URL");

const helper = readFileSync(new URL("../src/lib/seo/pageMetadata.js", import.meta.url), "utf8");
assert(helper.includes("openGraph") && helper.includes("twitter") && helper.includes("images"), "metadata helper must define Open Graph, X/Twitter and an image together");

for (const route of ["../src/app/cities/layout.js", "../src/app/events/layout.js", "../src/app/now/[section]/page.js"]) {
  const source = readFileSync(new URL(route, import.meta.url), "utf8");
  assert(source.includes("createPageMetadata"), `${route} must use the shared metadata contract`);
  assert(!source.includes("keywords:"), `${route} must not emit obsolete meta keywords`);
}

const eventsPage = readFileSync(new URL("../src/app/events/page.js", import.meta.url), "utf8");
const eventSections = readFileSync(new URL("../src/app/events/[section]/page.js", import.meta.url), "utf8");
const eventClient = readFileSync(new URL("../src/app/events/EventsPageClient.js", import.meta.url), "utf8");
assert(eventsPage.includes('dynamic = "force-dynamic"') && eventsPage.includes("revalidate = 0"), "events root must render a fresh server snapshot");
assert(eventSections.includes('dynamic = "force-dynamic"') && eventSections.includes("revalidate = 0"), "event sections must render a fresh server snapshot");
assert(eventClient.includes("setCurrentDate(new Date())") && eventClient.includes("setSelectedDate(getLocalDateKey())"), "event client must refresh the calendar date after hydration");

if (failures.length) {
  console.error("Metadata and city-route test failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Metadata and city-route test passed.");
