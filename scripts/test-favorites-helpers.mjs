import assert from "node:assert/strict";

import {
  addFavoriteLocalState,
  computeMissingFavorites,
  mergeFavoriteIds,
  removeFavoriteLocalState,
  removePlanLocalState,
} from "../src/features/favorites/logic/favoritesMutations.js";
import {
  buildBlockedLookup,
  mergeTrustMembersWithProfileRows,
  normalizeCheckins,
  normalizeFollowingTargetIds,
} from "../src/features/favorites/logic/favoritesNetwork.js";
import {
  computeFollowingProfiles,
} from "../src/features/favorites/logic/favoritesInsights.js";
import {
  hasProfileFormChanges,
  resolveGreetingByHour,
  resolveMemberDisplayName,
} from "../src/features/favorites/logic/favoritesProfile.js";
import {
  buildNextCheckin,
  mergeSavedCheckinIntoList,
  resolveDirectPlaceDbId,
} from "../src/features/favorites/logic/favoritesCheckins.js";

function testFavoritesMutations() {
  const removed = removeFavoriteLocalState({
    favorites: ["1", "2"],
    added: [{ id: "1" }, { id: "2" }],
    favoriteId: "2",
  });
  assert.deepEqual(removed.favorites, ["1"]);
  assert.deepEqual(removed.added, [{ id: "1" }]);

  const added = addFavoriteLocalState({
    favorites: ["1"],
    added: [{ id: "1", date: "2026-01-01T00:00:00.000Z" }],
    favoriteId: "2",
    nowIso: "2026-01-02T00:00:00.000Z",
  });
  assert.equal(added.alreadySaved, false);
  assert.deepEqual(added.favorites, ["1", "2"]);
  assert.equal(added.added[0].id, "2");

  const missing = computeMissingFavorites({
    localFavoriteIds: ["1", "2", "3"],
    remoteFavoriteIds: ["1"],
  });
  assert.deepEqual(missing, ["2", "3"]);
  assert.deepEqual(mergeFavoriteIds(["1", "2"], ["2", "3"]), ["1", "2", "3"]);

  const removedPlan = removePlanLocalState({
    plans: [{ id: "a" }, { id: "b" }],
    expandedPlanId: "b",
    planId: "b",
  });
  assert.deepEqual(removedPlan.plans, [{ id: "a" }]);
  assert.equal(removedPlan.expandedPlanId, null);
}

function testFavoritesNetwork() {
  const blocked = buildBlockedLookup([
    { targetType: "place", targetId: 1 },
    { targetType: "event", targetId: 2 },
  ]);
  assert(blocked.places.has("1"));
  assert(blocked.events.has("2"));
  assert.deepEqual(normalizeFollowingTargetIds(["a", "a", "", "b"]), ["a", "b"]);

  const normalized = normalizeCheckins(
    [
      { checked_in_at: "2026-01-01T00:00:00.000Z", label: "Old" },
      { checked_in_at: "2026-01-02T00:00:00.000Z", label: "New" },
    ],
    (row) => ({ label: row.label, checkedInAt: row.checked_in_at })
  );
  assert.equal(normalized[0].label, "New");

  const mergedMembers = mergeTrustMembersWithProfileRows({
    leaderboardMembers: [{ user_id: "a", display_name: "Member", avatar_url: "" }],
    followedProfileRows: [{ user_id: "a", display_name: "Alex", avatar_path: "avatars/a.jpg" }],
  });
  assert.equal(mergedMembers[0].display_name, "Alex");
  assert.equal(mergedMembers[0].avatar_path, "avatars/a.jpg");

  const followingProfiles = computeFollowingProfiles({
    followingUserIds: ["a"],
    networkMembers: mergedMembers,
  });
  assert.equal(followingProfiles[0].avatar_path, "avatars/a.jpg");
}

function testFavoritesProfile() {
  assert.equal(resolveGreetingByHour(8), "Good morning");
  assert.equal(resolveGreetingByHour(14), "Good afternoon");
  assert.equal(resolveGreetingByHour(22), "Good evening");
  assert.equal(resolveMemberDisplayName("  "), "Explorer");
  assert.equal(resolveMemberDisplayName(" Alex "), "Alex");
  assert.equal(
    hasProfileFormChanges(
      { displayName: "A", pronouns: "he", homeCity: "X", residentCountry: "Y" },
      { displayName: "A", pronouns: "he", homeCity: "X", residentCountry: "Y" }
    ),
    false
  );
}

function testFavoritesCheckins() {
  assert.equal(resolveDirectPlaceDbId("123"), 123);
  assert.equal(resolveDirectPlaceDbId("seed-place-1"), null);

  const next = buildNextCheckin({
    payload: { city: "Berlin", label: "Lab", placeId: "1" },
    resolvedCoords: { lat: 52.5, lng: 13.4 },
    isEditing: false,
    nowIso: "2026-01-02T00:00:00.000Z",
  });
  assert.equal(next.city, "Berlin");
  assert.equal(next.lat, 52.5);

  const merged = mergeSavedCheckinIntoList({
    current: [{ id: "1" }, { id: "2" }],
    savedRow: { id: "3" },
    isEditing: false,
    limit: 3,
  });
  assert.deepEqual(merged.map((item) => item.id), ["3", "1", "2"]);
}

function run() {
  testFavoritesMutations();
  testFavoritesNetwork();
  testFavoritesProfile();
  testFavoritesCheckins();
  console.log("Favorites helper tests passed.");
}

try {
  run();
} catch (error) {
  console.error("Favorites helper tests failed:");
  console.error(error?.message || error);
  process.exit(1);
}
