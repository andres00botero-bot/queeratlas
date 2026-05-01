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
  buildVibeDualWriteFields,
  STANDARD_VIBE_TAGS,
  formatVibeTagLabel,
  inferVibeTagsFromLegacyVibe,
  isMissingVibeTagsColumnError,
  normalizeVibeTag,
  normalizeVibeTags,
  primaryVibeFromTags,
  validateVibeTags,
} from "../src/lib/vibeTaxonomy.js";
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
    source.includes('import { resolveAdminAccess } from "@/lib/adminAccess";'),
    "now news admin: now page should use shared admin access helper"
  );
  assert(
    source.includes("openEditNewsComposer(item);"),
    "now news admin: admin cards should support opening edit composer"
  );
  assert(
    source.includes('? "Update news"'),
    "now news admin: composer should support update mode"
  );
  assert(
    source.includes("item.createdAt || item.date"),
    "now news admin: admin news cards should display createdAt before date for consistency"
  );
  assert(
    source.includes("adminForm.date || preservedEditDate"),
    "now news admin: editing should preserve existing article date when date input is empty"
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

function testSharedAdminAccessResolverUsage() {
  const resolverSource = readFileSync(new URL("../src/lib/adminAccess.js", import.meta.url), "utf8");
  const homeSource = readFileSync(new URL("../src/app/page.js", import.meta.url), "utf8");
  const contributeSource = readFileSync(new URL("../src/app/contribute/page.js", import.meta.url), "utf8");
  const eventsSource = readFileSync(new URL("../src/app/events/page.js", import.meta.url), "utf8");
  const communitySource = readFileSync(new URL("../src/app/community/page.js", import.meta.url), "utf8");
  const citySource = readFileSync(new URL("../src/app/[city]/page.js", import.meta.url), "utf8");
  const adminSource = readFileSync(new URL("../src/app/admin/page.js", import.meta.url), "utf8");

  assert(
    resolverSource.includes('client.rpc("qa_is_admin")'),
    "admin resolver: shared helper should check qa_is_admin first"
  );
  assert(
    resolverSource.includes('.from("qa_admin_users")'),
    "admin resolver: shared helper should include qa_admin_users fallback"
  );
  assert(
    homeSource.includes('import { resolveAdminAccess } from "@/lib/adminAccess";'),
    "admin resolver: home page should use shared admin access helper"
  );
  assert(
    contributeSource.includes('import { resolveAdminAccess } from "@/lib/adminAccess";'),
    "admin resolver: contribute page should use shared admin access helper"
  );
  assert(
    eventsSource.includes('import { resolveAdminAccess } from "@/lib/adminAccess";'),
    "admin resolver: events page should use shared admin access helper"
  );
  assert(
    communitySource.includes('import { resolveAdminAccess } from "@/lib/adminAccess";'),
    "admin resolver: community page should use shared admin access helper"
  );
  assert(
    citySource.includes('import { resolveAdminAccess } from "@/lib/adminAccess";'),
    "admin resolver: city page should use shared admin access helper"
  );
  assert(
    adminSource.includes('import { resolveAdminAccess } from "@/lib/adminAccess";'),
    "admin resolver: admin page should use shared admin access helper"
  );
}

function testSharedDateDisplayUsage() {
  const dateDisplaySource = readFileSync(new URL("../src/lib/dateDisplay.js", import.meta.url), "utf8");
  const nowSource = readFileSync(new URL("../src/app/now/page.js", import.meta.url), "utf8");
  const homeSource = readFileSync(new URL("../src/app/page.js", import.meta.url), "utf8");
  const eventDateSource = readFileSync(new URL("../src/features/events/eventDateUtils.js", import.meta.url), "utf8");
  const cityEventDateSource = readFileSync(new URL("../src/features/city/eventRailFeature.js", import.meta.url), "utf8");
  const favoritesDateSource = readFileSync(new URL("../src/features/favorites/favoritesPageUtils.js", import.meta.url), "utf8");

  assert(
    dateDisplaySource.includes("export function formatDateShort"),
    "date display: shared utility should export formatDateShort"
  );
  assert(
    dateDisplaySource.includes("export function formatDateLong"),
    "date display: shared utility should export formatDateLong"
  );
  assert(
    nowSource.includes('import { formatDateShort, toDateInputValue } from "@/lib/dateDisplay";'),
    "date display: now page should use shared date utility"
  );
  assert(
    homeSource.includes('import { formatDateShort } from "@/lib/dateDisplay";'),
    "date display: home page should use shared date utility"
  );
  assert(
    eventDateSource.includes("dateDisplay"),
    "date display: event date utils should use shared date utility"
  );
  assert(
    cityEventDateSource.includes("dateDisplay"),
    "date display: city event rail should use shared date utility"
  );
  assert(
    favoritesDateSource.includes("dateDisplay"),
    "date display: favorites utils should use shared date utility"
  );
}

function testVibeTaxonomyContract() {
  const expectedVibes = [
    "techno",
    "pop",
    "mixed",
    "electronic",
    "men_only",
    "after",
    "chill",
    "cultural",
    "fetish",
    "social",
    "cozy",
    "massive",
    "luxury",
    "festival",
    "underground",
    "cruise",
    "relax",
    "drag",
    "industrial",
    "service",
  ];

  const definedKeys = STANDARD_VIBE_TAGS.map((item) => item.key);
  assert(
    definedKeys.length === expectedVibes.length,
    "vibe taxonomy: should expose the full standardized vibe list"
  );
  assert(
    expectedVibes.every((key) => definedKeys.includes(key)),
    "vibe taxonomy: standardized vibe keys should match expected set"
  );

  assert(
    normalizeVibeTag("Men-only") === "men_only",
    "vibe taxonomy: Men-only alias should normalize correctly"
  );
  assert(
    normalizeVibeTag("afterhours") === "after",
    "vibe taxonomy: afterhours alias should normalize correctly"
  );

  const normalized = normalizeVibeTags(["Techno", "techno", "POP", "Afterhours", "unknown"], { max: 3 });
  assert(
    JSON.stringify(normalized) === JSON.stringify(["techno", "pop", "after"]),
    "vibe taxonomy: normalization should dedupe, canonicalize, and enforce max=3"
  );

  const validation = validateVibeTags(["Techno", "Pop", "afterhours", "underground"], { max: 3 });
  assert(
    validation.isValid === false && validation.errors.some((item) => item.includes("maximum of 3")),
    "vibe taxonomy: validation should block more than three selected tags"
  );

  const legacy = inferVibeTagsFromLegacyVibe("Leather warehouse afterhours night with drag show", { max: 3 });
  assert(
    legacy.length > 0 && legacy.includes("fetish"),
    "vibe taxonomy: legacy inference should detect fetish-related keywords"
  );

  assert(
    primaryVibeFromTags(["Pop", "Techno"]) === "pop",
    "vibe taxonomy: primary vibe should resolve from normalized tag order"
  );
  assert(
    formatVibeTagLabel("men_only") === "Men-only",
    "vibe taxonomy: label formatter should return canonical display label"
  );

  const dualWriteFields = buildVibeDualWriteFields({ vibe: "afterhours techno" });
  assert(
    Array.isArray(dualWriteFields.vibe_tags) && dualWriteFields.vibe_tags.length > 0,
    "vibe taxonomy: dual-write fields should infer vibe_tags from legacy vibe text"
  );

  const wrappedMissingColumn = {
    message:
      "{\"message\":\"column events.vibe_tags does not exist\",\"code\":\"42703\",\"details\":\"\",\"hint\":\"\"}",
  };
  assert(
    isMissingVibeTagsColumnError(wrappedMissingColumn) === true,
    "vibe taxonomy: missing vibe_tags column should be detected from wrapped errors"
  );
}

function testVibeTagsDualWriteWiring() {
  const cityEventsApiSource = readFileSync(new URL("../src/features/events/eventCityApiUtils.js", import.meta.url), "utf8");
  const globalEventsApiSource = readFileSync(new URL("../src/features/events/eventGlobalApiUtils.js", import.meta.url), "utf8");
  const usePlacesSource = readFileSync(new URL("../src/lib/usePlaces.js", import.meta.url), "utf8");
  const cityPageSource = readFileSync(new URL("../src/app/[city]/page.js", import.meta.url), "utf8");
  const addEventInlineFormSource = readFileSync(new URL("../src/components/city/AddEventInlineForm.js", import.meta.url), "utf8");
  const eventsPageSource = readFileSync(new URL("../src/app/events/page.js", import.meta.url), "utf8");
  const cityEventEditModalSource = readFileSync(new URL("../src/components/events/CityEventEditModal.js", import.meta.url), "utf8");
  const globalEventFormSource = readFileSync(new URL("../src/components/events/GlobalEventForm.js", import.meta.url), "utf8");
  const globalFormUtilsSource = readFileSync(new URL("../src/features/events/eventGlobalFormUtils.js", import.meta.url), "utf8");
  const migrationSource = readFileSync(new URL("../supabase/vibe-tags-v1.sql", import.meta.url), "utf8");
  const backfillSource = readFileSync(new URL("../supabase/vibe-tags-backfill-v1.sql", import.meta.url), "utf8");

  assert(
    cityEventsApiSource.includes("buildVibeDualWriteFields") &&
      cityEventsApiSource.includes("vibe_tags"),
    "vibe dual-write wiring: city events API should write vibe_tags with fallback helper"
  );
  assert(
    globalEventsApiSource.includes("buildVibeDualWriteFields") &&
      globalEventsApiSource.includes("vibe_tags"),
    "vibe dual-write wiring: global events API should write vibe_tags with fallback helper"
  );
  assert(
    usePlacesSource.includes("buildVibeDualWriteFields") &&
      usePlacesSource.includes("isMissingVibeTagsColumnError"),
    "vibe dual-write wiring: places data hook should dual-write and fallback on missing vibe_tags"
  );
  assert(
    cityPageSource.includes("vibeTags: normalizeVibeTags(eventVibeTags") &&
      cityPageSource.includes("vibeTags: normalizeVibeTags(eventAdminDraft.vibe_tags") &&
      (
        cityPageSource.includes("<VibeTagPicker")
        || addEventInlineFormSource.includes("<VibeTagPicker")
      ),
    "vibe dual-write wiring: city page should bind standardized vibe tag state in event flows"
  );
  assert(
    eventsPageSource.includes("vibe_tags: normalizeVibeTags(cityEditDraft.vibe_tags") &&
      eventsPageSource.includes("inferVibeTagsFromLegacyVibe"),
    "vibe dual-write wiring: events page city edit flow should preserve and write vibe_tags"
  );
  assert(
    cityEventEditModalSource.includes("<VibeTagPicker") &&
      globalEventFormSource.includes("<VibeTagPicker"),
    "vibe dual-write wiring: city/global event forms should render standardized vibe picker UI"
  );
  assert(
    globalFormUtilsSource.includes("vibe_tags: []") &&
      globalFormUtilsSource.includes("vibeTags: globalForm.vibe_tags"),
    "vibe dual-write wiring: global form helpers should carry vibe_tags through state and payload"
  );
  assert(
    migrationSource.includes("add column if not exists vibe_tags text[]") &&
      migrationSource.includes("qa_events_vibe_tags_allowed"),
    "vibe dual-write wiring: migration should add vibe_tags columns and whitelist constraints"
  );
  assert(
    backfillSource.includes("create or replace function public.qa_infer_vibe_tags") &&
      backfillSource.includes("update public.places") &&
      backfillSource.includes("update public.events") &&
      backfillSource.includes("update public.global_events"),
    "vibe dual-write wiring: backfill migration should infer and populate vibe_tags for existing rows"
  );
}

function testContributeAndSearchUseStandardizedVibeTags() {
  const contributeSource = readFileSync(new URL("../src/app/contribute/page.js", import.meta.url), "utf8");
  const searchPageSource = readFileSync(new URL("../src/app/search/page.js", import.meta.url), "utf8");
  const searchLibSource = readFileSync(new URL("../src/lib/search.js", import.meta.url), "utf8");

  assert(
    contributeSource.includes('import VibeTagPicker from "@/components/ui/VibeTagPicker";') &&
      contributeSource.includes("vibe_tags: []"),
    "vibe standardization: contribute page should expose vibe_tags state and picker UI"
  );
  assert(
    contributeSource.includes("buildVibeDualWriteFields") &&
      contributeSource.includes("isMissingVibeTagsColumnError"),
    "vibe standardization: contribute event submit should dual-write vibe_tags with fallback handling"
  );
  assert(
    searchPageSource.includes("resolveItemVibeTags") &&
      searchPageSource.includes("itemVibeTags.includes(vibeFilter)"),
    "vibe standardization: search page should filter by normalized vibe tags"
  );
  assert(
    searchLibSource.includes("resolveEntityVibeTags") &&
      searchLibSource.includes("vibe_tags: placeVibeTags") &&
      searchLibSource.includes("vibe_tags: eventVibeTags"),
    "vibe standardization: search index builder should rank and return normalized vibe tags"
  );
}

function testVibeTagChipsRenderingWiring() {
  const vibeDisplaySource = readFileSync(new URL("../src/lib/vibeDisplay.js", import.meta.url), "utf8");
  const vibeTagChipsSource = readFileSync(new URL("../src/components/ui/VibeTagChips.js", import.meta.url), "utf8");
  const searchPageSource = readFileSync(new URL("../src/app/search/page.js", import.meta.url), "utf8");
  const nowPageSource = readFileSync(new URL("../src/app/now/page.js", import.meta.url), "utf8");
  const cityPageSource = readFileSync(new URL("../src/app/[city]/page.js", import.meta.url), "utf8");
  const cityEventsRailSource = readFileSync(new URL("../src/components/city/CityEventsRailSection.js", import.meta.url), "utf8");
  const placeGuideCardSource = readFileSync(new URL("../src/components/city/PlaceGuideCard.js", import.meta.url), "utf8");
  const savedPlacesPanelSource = readFileSync(new URL("../src/components/favorites/SavedPlacesPanel.js", import.meta.url), "utf8");
  const savedEventsPanelSource = readFileSync(new URL("../src/components/favorites/SavedEventsPanel.js", import.meta.url), "utf8");

  assert(
    vibeDisplaySource.includes("resolveVibeTagsForEntity") &&
      vibeDisplaySource.includes("resolvePrimaryVibeLabel"),
    "vibe chips: display helper should expose normalized vibe tag and label resolvers"
  );
  assert(
    vibeTagChipsSource.includes("resolveVibeTagLabelsForEntity") &&
      vibeTagChipsSource.includes("includeMixedFallback"),
    "vibe chips: shared chip component should render normalized labels with fallback options"
  );
  assert(
    searchPageSource.includes('import VibeTagChips from "@/components/ui/VibeTagChips";') &&
      searchPageSource.includes("<VibeTagChips"),
    "vibe chips: search page should render vibe chips"
  );
  assert(
    nowPageSource.includes('import VibeTagChips from "@/components/ui/VibeTagChips";') &&
      nowPageSource.includes("<VibeTagChips"),
    "vibe chips: now page should render vibe chips for trending places"
  );
  assert(
    (
      cityPageSource.includes("<VibeTagChips")
      || cityEventsRailSource.includes("<VibeTagChips")
    ) &&
      (
        cityPageSource.includes("<VibeTagChips")
        || placeGuideCardSource.includes("<VibeTagChips")
      ),
    "vibe chips: city experience should render vibe chips for both events and places"
  );
  assert(
    savedPlacesPanelSource.includes("<VibeTagChips") &&
      savedEventsPanelSource.includes("<VibeTagChips"),
    "vibe chips: favorites panels should render vibe chips"
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
  testSharedAdminAccessResolverUsage();
  testSharedDateDisplayUsage();
  testVibeTaxonomyContract();
  testVibeTagsDualWriteWiring();
  testContributeAndSearchUseStandardizedVibeTags();
  testVibeTagChipsRenderingWiring();

  if (failures.length > 0) {
    console.error("Regression test failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log("Regression test passed.");
}

run();
