import { readFileSync } from "node:fs";
import {
  buildCheckinMarkerById,
  buildCheckinMarkers,
  resolveCheckinFocusCoordinates,
} from "../src/features/favorites/checkinMapGuards.js";
import { resolveEventOpenIntent } from "../src/features/events/eventOpenGuards.js";
import { citySelectionPath } from "../src/lib/cityRouting.js";

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function readSource(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

function testFavoritesCheckinFlow() {
  const savedPlaces = [
    { id: "p-1", city: "berlin", name: "Berghain", lat: 52.511, lng: 13.443, location: "Am Wriezener Bahnhof" },
    { id: "p-2", city: "madrid", name: "My Pleasure", lat: 40.4515, lng: -3.69484, location: "C. de Sánchez Pacheco 72" },
  ];
  const savedEvents = [
    { id: "e-1", city: "berlin", name: "Queer Night", lat: 52.513, lng: 13.42, location: "Kopenicker Strasse 76" },
  ];
  const checkins = [
    {
      id: "c-1",
      city: "berlin",
      label: "Berghain",
      address: "Am Wriezener Bahnhof",
      placeId: "p-1",
      eventId: "",
      lat: null,
      lng: null,
      checkedInAt: "2026-04-25T18:00:00.000Z",
    },
    {
      id: "c-2",
      city: "berlin",
      label: "Queer Night",
      address: "Kopenicker Strasse 76",
      placeId: "",
      eventId: "e-1",
      lat: null,
      lng: null,
      checkedInAt: "2026-04-25T19:00:00.000Z",
    },
  ];

  const markers = buildCheckinMarkers({ checkins, savedPlaces, savedEvents });
  assert(markers.length === 2, "favorites check-ins: marker list should be ready directly from saved check-ins");
  assert(
    markers.some((item) => String(item.id) === "c-1" && item.markerLat === 52.511 && item.markerLng === 13.443),
    "favorites check-ins: place-based check-in should resolve to venue coordinates"
  );
  assert(
    markers.some((item) => String(item.id) === "c-2" && item.markerLat === 52.513 && item.markerLng === 13.42),
    "favorites check-ins: event-based check-in should resolve to event coordinates"
  );

  const markerById = buildCheckinMarkerById(markers);
  const focused = resolveCheckinFocusCoordinates({ id: "c-1" }, markerById);
  assert(Boolean(focused), "favorites check-ins: focused check-in should resolve map coordinates");
  assert(
    focused?.lat === 52.511 && focused?.lng === 13.443,
    "favorites check-ins: focused marker should use resolved marker coordinates"
  );
}

function testFavoritesMapWiring() {
  const source = readSource("src/app/favorites/page.js");
  assert(
    source.includes("const interactiveCheckinPoints = useMemo(() => {"),
    "favorites map wiring: interactive marker collection should exist"
  );
  assert(
    source.includes("const mine = checkinMarkers.map"),
    "favorites map wiring: own check-in markers should be included"
  );
  assert(
    source.includes("const friends = followingCheckinMarkers.map"),
    "favorites map wiring: friend check-in markers should be included"
  );
  assert(
    source.includes("if (!interactiveCheckinPoints.length) {"),
    "favorites map wiring: map effect should handle marker rendering state directly"
  );
  assert(
    source.includes("interactiveCheckinPoints, selectedCheckinId"),
    "favorites map wiring: map rendering effect should react to marker list and selected check-in"
  );
}

function testEventsOpenFlow() {
  const offgrid = resolveEventOpenIntent({ id: "off-1", isGlobal: true, city: "global" });
  assert(offgrid.kind === "offgrid", "events flow: global events should open off-grid section intent");

  const cityIntent = resolveEventOpenIntent({ id: "e-city", isGlobal: false, city: "new york" });
  assert(cityIntent.kind === "city", "events flow: city events should resolve city intent");
  const cityPath = citySelectionPath(cityIntent.city, { eventId: cityIntent.id });
  assert(cityPath === "/new_york?eventId=e-city", "events flow: city intent should deep-link to selected event");

  const noIntent = resolveEventOpenIntent({ id: "", isGlobal: false, city: "berlin" });
  assert(noIntent.kind === "none", "events flow: missing id should not produce open intent");

  const source = readSource("src/app/events/page.js");
  const openEventBlock = source.match(/const openEvent = \(event\) => \{[\s\S]*?\n  \};/);
  assert(Boolean(openEventBlock), "events flow: openEvent handler should exist");
  if (openEventBlock) {
    assert(
      !/event\.link|window\.open|location\.href/.test(openEventBlock[0]),
      "events flow: openEvent handler should not bypass to official link automatically"
    );
    assert(
      openEventBlock[0].includes("router.push(citySelectionPath(intent.city, { eventId: intent.id }))"),
      "events flow: openEvent handler should route city events to city deep-link"
    );
  }
}

function testNowAdminFlowWiring() {
  const source = readSource("src/app/now/page.js");
  assert(
    source.includes("openEditNewsComposer"),
    "now admin flow: news edit entry point should exist"
  );
  assert(
    source.includes('? "Update news"') && source.includes(': "Publish news"'),
    "now admin flow: composer should support both create and update labels"
  );
  assert(
    source.includes("adminForm.date || preservedEditDate"),
    "now admin flow: editing should preserve existing publish date when date field is unchanged"
  );
  assert(
    source.includes("moveRankingDraftItem") && source.includes("saveRankingDraft"),
    "now admin flow: ranking editor controls should remain available"
  );
}

function run() {
  testFavoritesCheckinFlow();
  testFavoritesMapWiring();
  testEventsOpenFlow();
  testNowAdminFlowWiring();

  if (failures.length > 0) {
    console.error("E2E smoke test failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log("E2E smoke test passed.");
}

run();
