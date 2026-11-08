import { readFileSync } from "node:fs";
import { cityPath } from "../src/lib/cityRouting.js";
import { COMPASS_TERMS } from "../src/lib/compassTerms.js";

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

const citiesClient = readFileSync(new URL("../src/app/cities/CitiesPageClient.js", import.meta.url), "utf8");
const discoveryResults = readFileSync(new URL("../src/components/city/CityDiscoveryResults.js", import.meta.url), "utf8");
const homeClient = readFileSync(new URL("../src/components/home/HomePageClient.js", import.meta.url), "utf8");
const cityPage = readFileSync(new URL("../src/app/[city]/page.js", import.meta.url), "utf8");
const cityDirectory = readFileSync(new URL("../src/app/[city]/directory/page.js", import.meta.url), "utf8");
const dictionaryClient = readFileSync(new URL("../src/app/compass/CompassClient.js", import.meta.url), "utf8");
assert(!citiesClient.includes('aria-label="Internal city links"'), "cities page must not emit a hidden cluster-navigation block");
assert(citiesClient.includes("cityPath(cityKey)"), "cities structured data must use canonical city URLs");
assert(!discoveryResults.includes("narrative?.intro"), "discover results must not repeat the page introduction");
assert(homeClient.includes('t("home.latestStories", "latest stories")'), "homepage news count must describe the latest displayed stories");
assert(cityPage.includes("CityIndexableContent") && cityPage.includes("loadCitySearchPreview"), "city pages must server-render a quality-filtered venue and event preview");
assert(cityDirectory.includes("PAGE_SIZE = 24") && cityDirectory.includes("evaluateVenueSeoQuality"), "venue directories must paginate quality-filtered venue guides");
assert(cityDirectory.includes("index: false, follow: true"), "directory pages after page one must be crawlable but not indexable");
assert(dictionaryClient.includes("overflow-x-hidden") && !dictionaryClient.includes("min-h-screen overflow-hidden"), "dictionary must not disable sticky positioning with a scrolling ancestor");
assert(dictionaryClient.includes("lg:overflow-y-auto") && dictionaryClient.includes("Dictionary entries"), "dictionary entry list must scroll independently on desktop");
assert(dictionaryClient.includes("mobilePickerOpen") && dictionaryClient.includes("Browse all terms A–Z") && dictionaryClient.includes("dictionary-mobile-picker"), "mobile dictionary must offer an explicit A–Z term picker");
assert(dictionaryClient.includes("What would you like to explore?") && dictionaryClient.includes("Start with these terms"), "mobile dictionary must guide first-time visitors before showing a definition");
const requiredDictionaryTerms = ["Consent", "Homophobia", "Gender dysphoria", "Gender incongruence", "Sex characteristics", "Gender binary", "Bigender", "Demigender", "Demiromantic", "Gender euphoria"];
assert(requiredDictionaryTerms.every((name) => COMPASS_TERMS.some((term) => term.name === name)), "dictionary must include the core terminology expansion");
assert(COMPASS_TERMS.every((term) => term.reviewedOn && term.sources?.length && term.nuance && term.actions?.length), "every dictionary term must show a review date, sources, nuance and practical guidance");
assert(COMPASS_TERMS.every((term) => (term.related || []).every((label) => COMPASS_TERMS.some((candidate) => candidate.name === label || candidate.aliases?.includes(label)))), "dictionary related-term links must resolve to dictionary entries");

if (failures.length) {
  console.error("Metadata and city-route test failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Metadata and city-route test passed.");
