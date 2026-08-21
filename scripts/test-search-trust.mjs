import assert from "node:assert/strict";
import {
  buildAtlasSearchResults,
  hasSearchContentContamination,
  isEventCurrentOrUpcoming,
  isEventOnLocalDate,
  isPublishedForSearch,
  isVisibleInCatalogSearch,
} from "../src/lib/search.js";
import { inferSearchIntent } from "../src/lib/searchIntent.js";
import { buildLiveSearchSuggestions } from "../src/lib/searchSuggestions.js";
import { resolveSearchTimeZone } from "../src/lib/searchTimeZones.js";
import { mergeSeedPlaces } from "../src/lib/seedPlacesContent.js";
import { mergeSeedEvents } from "../src/lib/seedEventsContent.js";
import { cityCoreConfig } from "../src/lib/cityCore.js";

const nowTs = new Date("2026-08-20T12:00:00Z").getTime();

const currentDrag = {
  id: "drag-current",
  name: "Thursday Drag Cabaret",
  city: "Berlin",
  description: "A live drag show.",
  date: "2026-08-20",
  seo_indexable: true,
  seo_quality_status: "approved",
};
const irrelevantTechno = {
  id: "techno-current",
  name: "Techno Affairs",
  city: "Berlin",
  description: "Electronic festival and club night.",
  date: "2026-08-20",
  seo_indexable: true,
  seo_quality_status: "approved",
};
const expiredDrag = {
  ...currentDrag,
  id: "drag-expired",
  name: "Old Drag Show",
  date: "2026-08-19",
};
const contaminated = {
  ...currentDrag,
  id: "prompt-leak",
  description: "Du sa: i will give you the name of a venue. ChatGPT replied with copy.",
};

assert.equal(isEventCurrentOrUpcoming(expiredDrag, nowTs), false);
assert.equal(isEventCurrentOrUpcoming(currentDrag, nowTs), true);
assert.equal(isEventOnLocalDate(currentDrag, nowTs), true);
assert.equal(isEventCurrentOrUpcoming({ ...currentDrag, date: "" }, nowTs), false);
assert.equal(hasSearchContentContamination(contaminated), true);
assert.equal(isPublishedForSearch(contaminated, "event"), false);
assert.equal(isPublishedForSearch({ ...currentDrag, seo_indexable: false }, "event"), false);
assert.equal(isVisibleInCatalogSearch({ ...currentDrag, seo_indexable: false }, "event"), true);
assert.equal(
  isVisibleInCatalogSearch({ ...currentDrag, seo_quality_status: "needs_review" }, "event"),
  true
);
assert.equal(
  isPublishedForSearch({ ...currentDrag, seo_quality_status: "needs_review" }, "event"),
  false
);
assert.equal(
  isPublishedForSearch({ ...currentDrag, seo_quality_status: "rejected" }, "event"),
  false
);
assert.equal(inferSearchIntent("safe queer nightlife in Berlin").suggestedQualityFilter, "all");
assert.equal(inferSearchIntent("near me").flags.nearby, true);
assert.equal(inferSearchIntent("near me").suggestedTypeFilter, "all");
assert.equal(inferSearchIntent("queer bars in Berln").detectedCity, "Berlin");
assert.equal(inferSearchIntent("queer bars in Berln").cityMatch, "corrected");
assert.equal(inferSearchIntent("discotheque in Berlin").placeTypeLabels.includes("club"), true);
assert.equal(inferSearchIntent("trans-friendly Berlin").suggestedTypeFilter, "all");
assert.equal(resolveSearchTimeZone({ detectedCity: "Berlin", clientTimeZone: "America/New_York" }), "Europe/Berlin");

const utcDateBoundary = new Date("2026-08-21T00:30:00Z").getTime();
assert.equal(isEventOnLocalDate({ ...currentDrag, date: "2026-08-20" }, utcDateBoundary, "America/New_York"), true);
assert.equal(isEventOnLocalDate({ ...currentDrag, date: "2026-08-20" }, utcDateBoundary, "Europe/Berlin"), false);

const results = buildAtlasSearchResults({
  query: "drag shows tonight in Berlin",
  places: [],
  events: [irrelevantTechno, currentDrag, expiredDrag, contaminated],
  nowTs,
});

assert.deepEqual(results.events.map((event) => event.id), ["drag-current"]);

const strictVenueTypes = [
  { query: "Berlin sauna", expectedType: "sauna", wrongType: "cruise_club" },
  { query: "Berlin queer cafes", expectedType: "cafe", wrongType: "bar" },
  { query: "Berlin hotels", expectedType: "hotel", wrongType: "bar" },
  { query: "Berlin bars", expectedType: "bar", wrongType: "club" },
  { query: "Berlin clubs", expectedType: "club", wrongType: "bar" },
  { query: "Berlin restaurants", expectedType: "restaurant", wrongType: "cafe" },
  { query: "Berlin cinemas", expectedType: "cinema", wrongType: "gallery" },
  { query: "Berlin galleries", expectedType: "gallery", wrongType: "cinema" },
  { query: "Berlin cruise clubs", expectedType: "cruise_club", wrongType: "sauna" },
];

strictVenueTypes.forEach(({ query, expectedType, wrongType }) => {
  const strictResults = buildAtlasSearchResults({
    query,
    places: [
      {
        id: `correct-${expectedType}`,
        name: `Berlin ${expectedType}`,
        city: "Berlin",
        type: expectedType,
        description: `A dedicated ${expectedType} venue.`,
      },
      {
        id: `wrong-${wrongType}`,
        name: `${query} premium destination`,
        city: "Berlin",
        type: wrongType,
        description: `${query} ${query} ${query}`,
      },
    ],
    events: [],
    nowTs,
  });
  assert.deepEqual(strictResults.places.map((place) => place.id), [`correct-${expectedType}`]);
});

const broadNightlifeResults = buildAtlasSearchResults({
  query: "Berlin nightlife",
  places: [
    { id: "nightlife-bar", name: "Berlin Bar", city: "Berlin", type: "bar", description: "Nightlife bar." },
    { id: "nightlife-club", name: "Berlin Club", city: "Berlin", type: "club", description: "Nightlife club." },
  ],
  events: [],
  nowTs,
});
assert.deepEqual(new Set(broadNightlifeResults.places.map((place) => place.placeType)), new Set(["bar", "club"]));

const expandedResults = buildAtlasSearchResults({
  query: "queer support Berlin",
  places: [],
  events: [],
  services: [
    {
      id: "support-1",
      name: "Queer Support Berlin",
      city: "Berlin",
      type: "community_center",
      description: "Community support and legal referrals.",
      seo_indexable: true,
      seo_quality_status: "approved",
      verified: true,
    },
  ],
  guides: [
    {
      id: "guide-1",
      title: "Queer Safety Report",
      summary: "A methodology-led travel safety report.",
      href: "/reports/queer-safety",
      kind: "Editorial report",
    },
  ],
  nowTs,
});

assert.deepEqual(expandedResults.services.map((service) => service.id), ["support-1"]);
assert.equal(expandedResults.services[0].type, "service");
assert.equal(inferSearchIntent("queer support Berlin").suggestedTypeFilter, "service");
assert.equal(inferSearchIntent("queer safety ranking").suggestedTypeFilter, "guide");

const cityScopedResults = buildAtlasSearchResults({
  query: "queer support Berlin",
  places: [],
  events: [],
  services: [
    expandedResults.services[0],
    {
      id: "support-other-city",
      name: "Queer Support Paris",
      city: "Paris",
      type: "community_center",
      description: "Community support.",
      seo_indexable: true,
      seo_quality_status: "approved",
    },
  ],
  nowTs,
});
assert.deepEqual(cityScopedResults.services.map((service) => service.id), ["support-1"]);

const noisyCityScopedResults = buildAtlasSearchResults({
  query: "Berlin q",
  places: [
    { id: "berlin-noindex", name: "Der Boiler", city: "Berlin", type: "sauna", seo_indexable: false },
    { id: "stockholm-place", name: "Queer Q", city: "Stockholm", type: "bar" },
  ],
  events: [],
  nowTs,
});
assert.deepEqual(noisyCityScopedResults.places.map((place) => place.id), ["berlin-noindex"]);

const noindexCatalogResult = buildAtlasSearchResults({
  query: "Berlin sauna",
  places: [
    { id: "berlin-noindex", name: "Der Boiler", city: "Berlin", type: "sauna", seo_indexable: false },
  ],
  events: [],
  nowTs,
});
assert.deepEqual(noindexCatalogResult.places.map((place) => place.id), ["berlin-noindex"]);

const exactCityResults = buildAtlasSearchResults({
  query: "Berlin",
  places: [
    {
      id: "berlin-hotel",
      name: "Berlin Hotel",
      city: "Berlin",
      type: "hotel",
      description: "A Berlin hotel in central Berlin.",
    },
  ],
  events: [],
  nowTs,
});
assert.equal(exactCityResults.all[0].type, "city");

const directSuggestions = buildLiveSearchSuggestions({
  query: "queer sup",
  intentProfile: inferSearchIntent("queer sup"),
  entityResults: [
    {
      id: "support-1",
      name: "Queer Support Berlin",
      city: "Berlin",
      type: "service",
      href: "/berlin/services/queer-support--support-1",
    },
  ],
});
assert.equal(directSuggestions[0].direct, true);
assert.equal(directSuggestions[0].href, "/berlin/services/queer-support--support-1");

const nearbyResults = buildAtlasSearchResults({
  query: "near me",
  places: [
    { id: "near-1", name: "Nearby Venue", city: "Berlin", type: "bar", lat: 52.51, lng: 13.4 },
    { id: "missing-coordinates", name: "Unknown Position", city: "Berlin", type: "bar" },
  ],
  events: [currentDrag],
  services: [
    {
      id: "near-service",
      name: "Nearby Support",
      city: "Berlin",
      type: "community_center",
      lat: 52.52,
      lng: 13.41,
      seo_indexable: true,
      seo_quality_status: "approved",
    },
  ],
  nowTs,
});
assert.deepEqual(nearbyResults.places.map((place) => place.id), ["near-1"]);
assert.deepEqual(nearbyResults.services.map((service) => service.id), ["near-service"]);
assert.equal(nearbyResults.events.length, 0);

const databaseCatalogFixtures = [
  { id: 900001, name: "Database Berlin Bar", city: "berlin", type: "bar", description: "Existing database venue." },
  { id: 900002, name: "Database Berlin Cafe", city: "berlin", type: "cafe", description: "Existing database venue." },
  { id: 900003, name: "Database Berlin Club", city: "berlin", type: "club", description: "Existing database venue." },
  { id: 900004, name: "Database Berlin Cinema", city: "berlin", type: "cinema", description: "Existing database venue." },
  { id: 900005, name: "Database Berlin Cruise Club", city: "berlin", type: "cruise_club", description: "Existing database venue." },
  { id: 900006, name: "Database Berlin Gallery", city: "berlin", type: "gallery", description: "Existing database venue." },
  { id: 900007, name: "Database Berlin Hotel", city: "berlin", type: "hotel", description: "Existing database venue." },
  { id: 900008, name: "Database Berlin Restaurant", city: "berlin", type: "restaurant", description: "Existing database venue." },
  { id: 900009, name: "Database Berlin Sauna", city: "berlin", type: "sauna", description: "Existing database venue." },
];
const fullSeedPlaces = mergeSeedPlaces(databaseCatalogFixtures).filter((place) => isPublishedForSearch(place, "place"));
const fullSeedEvents = mergeSeedEvents([]);
assert.equal(fullSeedPlaces.some((place) => place.name === "Der Boiler" && place.type === "sauna"), true);
assert.equal(fullSeedEvents.length > 0, true);

const venueSearchGroups = [
  { query: "bars", types: ["bar"] },
  { query: "cafes", types: ["cafe"] },
  { query: "clubs", types: ["club"] },
  { query: "cinemas", types: ["cinema"] },
  { query: "cruise clubs", types: ["cruise_club", "cruising_area"] },
  { query: "galleries", types: ["gallery"] },
  { query: "hotels", types: ["hotel"] },
  { query: "restaurants", types: ["restaurant"] },
  { query: "saunas", types: ["sauna"] },
];

let auditedCityCategorySearches = 0;
Object.entries(cityCoreConfig).forEach(([cityKey, city]) => {
  const cityPlaces = fullSeedPlaces.filter(
    (place) => String(place.city || "").replace(/[_-]+/g, " ").toLowerCase() === cityKey.replace(/[_-]+/g, " ").toLowerCase()
  );
  const cityName = String(city?.title || cityKey).replace(/^Queer\s+/i, "").trim();

  venueSearchGroups.forEach(({ query, types }) => {
    const expectedIds = new Set(
      cityPlaces.filter((place) => types.includes(String(place.type || ""))).map((place) => String(place.id))
    );
    if (expectedIds.size === 0) return;

    auditedCityCategorySearches += 1;
    const categoryResults = buildAtlasSearchResults({
      query: `${cityName} ${query}`,
      places: fullSeedPlaces,
      events: [],
      nowTs,
      placeLimit: fullSeedPlaces.length,
    });
    assert.equal(categoryResults.places.length > 0, true, `${cityName} ${query} should return exact venues`);
    categoryResults.places.forEach((place) => {
      assert.equal(types.includes(place.placeType), true, `${cityName} ${query} returned ${place.placeType}`);
      assert.equal(expectedIds.has(String(place.id)), true, `${cityName} ${query} returned a venue from the wrong city`);
    });
    assert.deepEqual(
      new Set(categoryResults.places.map((place) => String(place.id))),
      expectedIds,
      `${cityName} ${query} did not return the complete category`,
    );
  });
});
assert.equal(auditedCityCategorySearches > 250, true);

console.log(`Search trust tests passed (${auditedCityCategorySearches} city/category corpus searches audited).`);
