import assert from "node:assert/strict";
import {
  buildAtlasSearchResults,
  hasSearchContentContamination,
  isEventCurrentOrUpcoming,
  isEventOnLocalDate,
  isPublishedForSearch,
} from "../src/lib/search.js";
import { inferSearchIntent } from "../src/lib/searchIntent.js";
import { buildLiveSearchSuggestions } from "../src/lib/searchSuggestions.js";
import { resolveSearchTimeZone } from "../src/lib/searchTimeZones.js";

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

console.log("Search trust tests passed.");
