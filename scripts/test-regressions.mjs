import {
  buildCheckinMarkerById,
  buildCheckinMarkers,
  resolveCheckinFocusCoordinates,
} from "../src/features/favorites/checkinMapGuards.js";
import { readFileSync } from "node:fs";
import { resolveEventOpenIntent } from "../src/features/events/eventOpenGuards.js";
import {
  isMissingPlacesWithStatsLocation,
  shouldFallbackFromPlacesWithStats,
} from "../src/lib/supabaseErrorGuards.js";
import {
  selectCityEventById,
  selectCityEventsAll,
  selectVisibleCityEvents,
} from "../src/features/city/cityEventGuards.js";
import { normalizeCityKey } from "../src/features/city/checkinFeature.js";
import { citySelectionPath } from "../src/lib/cityRouting.js";

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function testCheckinMarkersUseSafeMatching() {
  const savedPlaces = [
    { id: "p-1", city: "berlin", name: "Berghain", lat: 52.511, lng: 13.443, location: "Am Wriezener Bahnhof" },
    { id: "p-2", city: "berlin", name: "Berghain", lat: 52.5, lng: 13.5, location: "Another Address" },
    { id: "p-3", city: "berlin", name: "KitKatClub", lat: 52.513, lng: 13.42, location: "Kopenicker Strasse 76" },
  ];
  const checkins = [
    {
      id: "c-1",
      city: "berlin",
      label: "Berghain",
      address: "",
      placeId: "",
      eventId: "",
      lat: null,
      lng: null,
      checkedInAt: "2026-04-24T10:00:00.000Z",
    },
    {
      id: "c-2",
      city: "berlin",
      label: "Berghain",
      address: "Am Wriezener Bahnhof",
      placeId: "",
      eventId: "",
      lat: null,
      lng: null,
      checkedInAt: "2026-04-24T11:00:00.000Z",
    },
    {
      id: "c-3",
      city: "berlin",
      label: "KitKatClub",
      address: "",
      placeId: "p-3",
      eventId: "",
      lat: null,
      lng: null,
      checkedInAt: "2026-04-24T12:00:00.000Z",
    },
  ];

  const markers = buildCheckinMarkers({ checkins, savedPlaces, savedEvents: [] });
  assert(markers.length === 2, "checkin markers: ambiguous name match should not create marker");
  assert(
    markers.some((item) => String(item.id) === "c-2" && item.markerLat === 52.511 && item.markerLng === 13.443),
    "checkin markers: address-resolved marker must use the correct venue coordinates"
  );
  assert(
    markers.some((item) => String(item.id) === "c-3" && item.markerLat === 52.513 && item.markerLng === 13.42),
    "checkin markers: explicit placeId match must resolve marker coordinates"
  );
}

function testCheckinFocusUsesMarkerCoordinates() {
  const markers = [
    { id: "c-10", markerLat: 40.7424, markerLng: -73.9956 },
  ];
  const markerById = buildCheckinMarkerById(markers);
  const entry = { id: "c-10", markerLat: 1, markerLng: 1, lat: 2, lng: 2 };
  const target = resolveCheckinFocusCoordinates(entry, markerById);
  assert(Boolean(target), "checkin focus: target coordinates should resolve");
  assert(
    target?.lat === 40.7424 && target?.lng === -73.9956,
    "checkin focus: marker lookup must win over stale list coordinates"
  );
}

function testEventOpenIntent() {
  const globalIntent = resolveEventOpenIntent({ id: "g-1", isGlobal: true, city: "global" });
  assert(globalIntent.kind === "offgrid", "event open: global events must route to offgrid focus");

  const cityIntent = resolveEventOpenIntent({ id: "e-1", isGlobal: false, city: "new york" });
  assert(cityIntent.kind === "city", "event open: city events must route to city page");
  const path = citySelectionPath(cityIntent.city, { eventId: cityIntent.id });
  assert(path === "/new_york?eventId=e-1", "event open: city route should be normalized and stable");
}

function testCityEventSelectionUsesAllCityEventsForDeepLink() {
  const eventsData = [
    { id: "event-old", city: "berlin", isVisible: false },
    { id: "event-new", city: "berlin", isVisible: true },
    { id: "event-other", city: "madrid", isVisible: true },
  ];

  const cityEventsAll = selectCityEventsAll({
    eventsData,
    city: "berlin",
    blockedItems: [],
    normalizeCityKey,
  });
  const cityEventsVisible = selectVisibleCityEvents(cityEventsAll, (event) => event.isVisible !== false);
  const selected = selectCityEventById(cityEventsAll, "event-old");

  assert(cityEventsAll.length === 2, "city event selection: all city events should include non-visible matches");
  assert(cityEventsVisible.length === 1, "city event selection: visible list should still filter correctly");
  assert(selected?.id === "event-old", "city event selection: deep-link eventId must resolve from all city events");
}

function testFavoritesCheckinListsHaveStableScrollContainers() {
  const source = readFileSync(new URL("../src/app/favorites/page.js", import.meta.url), "utf8");

  assert(
    source.includes("className=\"qa-guides-scroll mt-3 h-[22rem] space-y-2 overflow-y-scroll pr-1 md:h-[26rem]\""),
    "favorites check-in list: primary list should keep explicit scroll container classes"
  );
  assert(
    source.includes("className=\"qa-guides-scroll mt-2 h-[18rem] space-y-2 overflow-y-scroll pr-1 md:h-[22rem]\""),
    "favorites check-in list: friends list should keep explicit scroll container classes"
  );
}

function testFavoritesUsesPlacesFallbackLoader() {
  const source = readFileSync(new URL("../src/app/favorites/page.js", import.meta.url), "utf8");
  assert(
    source.includes('import { fetchPlacesForAtlas } from "@/lib/placesDataApi";'),
    "favorites places loader: page should import fetchPlacesForAtlas"
  );
  assert(
    source.includes("fetchPlacesForAtlas()"),
    "favorites places loader: page should load places through fetchPlacesForAtlas"
  );
}

function testAdminAndContributeUsePlacesFallbackLoader() {
  const adminSource = readFileSync(new URL("../src/app/admin/page.js", import.meta.url), "utf8");
  const contributeSource = readFileSync(new URL("../src/app/contribute/page.js", import.meta.url), "utf8");

  assert(
    adminSource.includes('import { fetchPlacesQueryWithFallback } from "@/lib/placesDataApi";'),
    "admin places loader: page should import fetchPlacesQueryWithFallback"
  );
  assert(
    adminSource.includes("fetchPlacesQueryWithFallback({"),
    "admin places loader: page should use fetchPlacesQueryWithFallback"
  );

  assert(
    contributeSource.includes('import { fetchPlacesQueryWithFallback } from "@/lib/placesDataApi";'),
    "contribute places loader: page should import fetchPlacesQueryWithFallback"
  );
  assert(
    contributeSource.includes("fetchPlacesQueryWithFallback({"),
    "contribute places loader: page should use fetchPlacesQueryWithFallback"
  );
}

function testUsePlacesUsesFallbackLoader() {
  const usePlacesSource = readFileSync(new URL("../src/lib/usePlaces.js", import.meta.url), "utf8");
  assert(
    usePlacesSource.includes('import { fetchPlacesQueryWithFallback } from "./placesDataApi";'),
    "usePlaces loader: hook should import fetchPlacesQueryWithFallback"
  );
  assert(
    usePlacesSource.includes("fetchPlacesQueryWithFallback({"),
    "usePlaces loader: hook should use fetchPlacesQueryWithFallback"
  );
}

function testPlacesWithStatsMissingLocationGuard() {
  const directError = {
    code: "42703",
    message: "column places_with_stats.location does not exist",
  };
  assert(
    isMissingPlacesWithStatsLocation(directError) === true,
    "places_with_stats guard: direct 42703 missing location should be detected"
  );

  const jsonWrappedError = {
    code: "",
    message:
      "{\"message\":\"column places_with_stats.location does not exist\",\"code\":\"42703\",\"details\":\"\",\"hint\":\"\"}",
  };
  assert(
    isMissingPlacesWithStatsLocation(jsonWrappedError) === true,
    "places_with_stats guard: JSON-wrapped missing location should be detected"
  );

  const unrelatedError = {
    code: "42P01",
    message: "relation places_with_stats does not exist",
  };
  assert(
    isMissingPlacesWithStatsLocation(unrelatedError) === false,
    "places_with_stats guard: unrelated errors must not be treated as missing location"
  );

  const missingViewError = {
    code: "42P01",
    message: "relation places_with_stats does not exist",
  };
  assert(
    shouldFallbackFromPlacesWithStats(missingViewError) === true,
    "places_with_stats guard: missing view errors should trigger fallback"
  );
}

function testNowNewsAdminControls() {
  const source = readFileSync(new URL("../src/app/now/page.js", import.meta.url), "utf8");
  assert(
    source.includes('const rpcRes = await supabase.rpc("qa_is_admin");'),
    "now news admin: now page should resolve admin state via qa_is_admin rpc"
  );
  assert(
    source.includes("openEditNewsComposer(item);"),
    "now news admin: admin cards should support opening edit composer"
  );
  assert(
    source.includes('? "Update news"'),
    "now news admin: composer should support update mode"
  );
}

function testNowRankingAdminControls() {
  const source = readFileSync(new URL("../src/app/now/page.js", import.meta.url), "utf8");
  assert(
    source.includes("moveRankingDraftItem"),
    "now ranking admin: ranking editor should support moving rows"
  );
  assert(
    source.includes("Ranking save blocked. Every position from #1 to #15 must have a city."),
    "now ranking admin: ranking editor should validate empty city slots"
  );
  assert(
    source.includes("Duplicate cities found"),
    "now ranking admin: ranking editor should validate duplicate cities"
  );
}

function testPlacesAtlasNormalizesRatingFields() {
  const source = readFileSync(new URL("../src/lib/placesDataApi.js", import.meta.url), "utf8");
  assert(
    source.includes("reviewCount,"),
    "places atlas stats: data layer should expose reviewCount on place rows"
  );
  assert(
    source.includes("avgRating,"),
    "places atlas stats: data layer should expose avgRating on place rows"
  );
  assert(
    source.includes('.from("reviews")'),
    "places atlas stats: data layer should query reviews for fallback rating stats"
  );
}

function run() {
  testCheckinMarkersUseSafeMatching();
  testCheckinFocusUsesMarkerCoordinates();
  testEventOpenIntent();
  testCityEventSelectionUsesAllCityEventsForDeepLink();
  testFavoritesCheckinListsHaveStableScrollContainers();
  testFavoritesUsesPlacesFallbackLoader();
  testAdminAndContributeUsePlacesFallbackLoader();
  testUsePlacesUsesFallbackLoader();
  testPlacesWithStatsMissingLocationGuard();
  testNowNewsAdminControls();
  testNowRankingAdminControls();
  testPlacesAtlasNormalizesRatingFields();

  if (failures.length > 0) {
    console.error("Regression test failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log("Regression test passed.");
}

run();
