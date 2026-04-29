import { readFileSync } from "node:fs";
import {
  buildCheckinMarkerById,
  buildCheckinMarkers,
  resolveCheckinFocusCoordinates,
} from "../src/features/favorites/checkinMapGuards.js";

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function readSource(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

function testMapMarkersRenderFromSavedData() {
  const savedPlaces = [
    { id: "p-1", city: "berlin", name: "Berghain", lat: 52.511, lng: 13.443, location: "Am Wriezener Bahnhof" },
    { id: "p-2", city: "madrid", name: "My Pleasure", lat: 40.4515, lng: -3.69484, location: "C. de Sanchez Pacheco 72" },
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
  assert(markers.length === 2, "favorites baseline: check-ins should produce map markers directly");
  assert(
    markers.some((item) => String(item.id) === "c-1" && item.markerLat === 52.511 && item.markerLng === 13.443),
    "favorites baseline: place check-in marker should resolve correctly"
  );
  assert(
    markers.some((item) => String(item.id) === "c-2" && item.markerLat === 52.513 && item.markerLng === 13.42),
    "favorites baseline: event check-in marker should resolve correctly"
  );

  const markerById = buildCheckinMarkerById(markers);
  const focused = resolveCheckinFocusCoordinates({ id: "c-1" }, markerById);
  assert(Boolean(focused), "favorites baseline: focused check-in should resolve map coordinates");
}

function testFavoritesPageWiring() {
  const source = readSource("src/app/favorites/page.js");

  assert(
    source.includes("import mapboxgl from \"mapbox-gl\";"),
    "favorites baseline: page should use stable mapbox-gl import path"
  );
  assert(
    source.includes("const loadCheckins = useCallback(async () => {"),
    "favorites baseline: check-in loader should exist"
  );
  assert(
    source.includes(".from(\"qa_member_checkins\")") && source.includes(".update(writePayload)") && source.includes(".insert([writePayload])"),
    "favorites baseline: check-in create/edit persistence flow should exist"
  );
  assert(
    source.includes(".from(\"qa_member_checkins\")") && source.includes(".delete()"),
    "favorites baseline: check-in delete flow should exist"
  );
  assert(
    source.includes("const saveV2Plan = async (payload) => {") && source.includes("const removePlan = async (planId) => {"),
    "favorites baseline: planner save/remove handlers should exist"
  );
  assert(
    source.includes("<TripPlannerV2") && source.includes("onSavePlan={saveV2Plan}"),
    "favorites baseline: trip planner should be connected to save handler"
  );
  assert(
    source.includes("<SavedPlacesPanel") && source.includes("onOpenPlace") && source.includes("onQuickCheckin") && source.includes("onRemoveFavorite"),
    "favorites baseline: saved places panel should have open/check-in/remove actions"
  );
  assert(
    source.includes("<SavedEventsPanel") && source.includes("onOpenEvent") && source.includes("onQuickCheckin") && source.includes("onRemoveFavorite"),
    "favorites baseline: saved events panel should have open/check-in/remove actions"
  );
  assert(
    source.includes("const loadTrustNetwork = useCallback(async () => {") && source.includes("const toggleFollowMember = async (targetUserId) => {"),
    "favorites baseline: trust network refresh and follow/unfollow actions should exist"
  );
}

function run() {
  testMapMarkersRenderFromSavedData();
  testFavoritesPageWiring();

  if (failures.length > 0) {
    console.error("Favorites baseline test failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log("Favorites baseline test passed.");
}

run();
