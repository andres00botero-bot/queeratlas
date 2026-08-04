import {
  evaluateEventSeoQuality,
  evaluateServiceSeoQuality,
  evaluateVenueSeoQuality,
  excludeDuplicateEntityCopy,
} from "../src/lib/seo/entityIndexing.js";
import { buildSitemapIndexXml, buildUrlSetXml } from "../src/lib/seo/sitemapXml.js";
import { readFileSync } from "node:fs";

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const fiveFieldIntel = {
  source_urls: ["https://example.com/source"],
  research_status: "multi_source_summary",
};

const venue = {
  id: "venue-1",
  city: "berlin",
  name: "Example Venue",
  type: "bar",
  description: "A distinctive and sufficiently detailed venue description with practical local context that clearly exceeds the quality minimum.",
  link: "https://example.com/venue",
  location: "Berlin, Germany",
  venue_intel: {
    ...fiveFieldIntel,
    queue_wait: "Queues are usually shortest before the main late-evening arrival window.",
    best_nights: "Friday is the strongest regular night, while weekdays stay more conversational.",
    crowd_mix: "The room usually blends local regulars with a smaller group of city visitors.",
    dress_code: "Everyday expressive clothing works; special programmes may announce a theme.",
    staff_inclusivity: "Published policy and community feedback indicate an explicitly inclusive welcome.",
  },
};

assert(evaluateVenueSeoQuality(venue).indexable, "complete, sourced venue should be indexable");
assert(
  !evaluateVenueSeoQuality({ ...venue, venue_intel: {} }).indexable,
  "venue without practical intelligence must be noindex",
);

const event = {
  ...venue,
  id: "event-1",
  date: "2099-06-01",
  event_intel: {
    ...fiveFieldIntel,
    entry_wait: "Ticket checks can create a brief queue at the main arrival peak.",
    best_arrival: "Arrive within the first published ticket window for the smoothest entry.",
    crowd_mix: "The event draws local queer regulars alongside visitors in town for the weekend.",
    dress_code: "Dance-ready clothing works unless the promoter publishes a themed requirement.",
    host_inclusivity: "The organiser publishes an inclusive policy and moderated reports are reviewed.",
  },
};
assert(evaluateEventSeoQuality(event, "2099-01-01").indexable, "future sourced event should be indexable");
assert(!evaluateEventSeoQuality({ ...event, date: "2020-01-01" }, "2099-01-01").indexable, "expired event must be noindex");

const service = {
  ...venue,
  id: "service-1",
  provider_name: "Example Provider",
  service_intel: {
    ...fiveFieldIntel,
    booking_lead_time: "Book at least two days ahead for the broadest choice of appointment times.",
    best_time: "Earlier weekday appointments are usually calmer and easier to coordinate.",
    client_mix: "The service supports local LGBTQ clients as well as people visiting the city.",
    preparation: "Confirm the price, address, accessibility and cancellation policy before arrival.",
    provider_inclusivity: "The provider publishes an LGBTQ-inclusive service policy and contact route.",
  },
};
assert(evaluateServiceSeoQuality(service).indexable, "complete, sourced service should be indexable");
const entitySlugSource = readFileSync(new URL("../src/lib/seo/entitySlug.js", import.meta.url), "utf8");
assert(entitySlugSource.includes("/services/${slug}"), "service detail path should be canonical");

const duplicated = excludeDuplicateEntityCopy([
  venue,
  { ...venue, id: "venue-2", name: "Second Venue" },
]);
assert(duplicated.length === 0, "exact duplicate editorial descriptions must be excluded");

const urlSet = buildUrlSetXml([{ url: "https://www.queeratlas.app/a&b", lastModified: "2026-08-04" }]);
assert(urlSet.includes("a&amp;b") && urlSet.includes("<lastmod>"), "URL sitemap must escape XML and include verified lastmod");
const sitemapIndex = buildSitemapIndexXml(["/sitemap-venues.xml"]);
assert(sitemapIndex.includes("<sitemapindex") && sitemapIndex.includes("sitemap-venues.xml"), "root sitemap must be an index");

if (failures.length) {
  console.error("SEO phase 1 test failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("SEO phase 1 test passed.");
