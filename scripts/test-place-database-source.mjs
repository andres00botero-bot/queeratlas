import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { mergeSeedPlaces } from "../src/lib/seedPlacesContent.js";

function source(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

const runtimePlaceSources = [
  "src/lib/usePlaces.js",
  "src/lib/placesDataApi.js",
  "src/lib/server/searchEngine.js",
  "src/lib/seo/entityInventory.js",
  "src/lib/seo/cityDiscoveryData.js",
  "src/app/contribute/page.js",
  "src/app/[city]/venues/[slug]/page.js",
];

for (const path of runtimePlaceSources) {
  assert.doesNotMatch(
    source(path),
    /mergeSeedPlaces|mergeSeedPlacesAsync|seedPlacesContent/,
    `${path} must use public.places as its only venue source`,
  );
}

const cityPage = source("src/app/[city]/page.js");
assert.match(cityPage, /String\(place\.legacy_seed_id \|\| ""\) === String\(placeId\)/);
assert.match(cityPage, /\.delete\(\)[\s\S]*\.select\("id"\)[\s\S]*\.maybeSingle\(\)/);
assert.match(cityPage, /if \(!deleted\?\.id\)/);

const migration = source("supabase/seed-places-to-database-v3.sql");
const delimiter = "$qa_seed_places$";
const payloadStart = migration.indexOf(delimiter);
const payloadEnd = migration.indexOf(delimiter, payloadStart + delimiter.length);
assert.ok(payloadStart >= 0 && payloadEnd > payloadStart, "migration must contain its seed JSON payload");

const payload = JSON.parse(migration.slice(payloadStart + delimiter.length, payloadEnd));
const effectiveSeeds = mergeSeedPlaces([]);
assert.equal(payload.length, effectiveSeeds.length);
assert.equal(new Set(payload.map((place) => place.legacy_seed_id)).size, payload.length);
assert.ok(payload.every((place) => place.legacy_seed_id.startsWith("seed-place-")));
assert.ok(payload.some((place) => place.legacy_seed_id === "seed-place-miami-haulover"));
assert.ok(
  payload.every((place) => !place.vibe_tags.includes("service")),
  "service must never be migrated as a public.places vibe tag",
);
assert.deepEqual(
  payload.find((place) => place.legacy_seed_id === "seed-place-prague-klub21")?.vibe_tags,
  ["mixed"],
);

assert.match(migration, /add column if not exists legacy_seed_id text/);
assert.match(migration, /array_remove\(vibe_tags, 'service'\)/);
assert.match(migration, /Revision: v3-single-block/);
assert.match(migration, /when unique_violation then/);
assert.doesNotMatch(migration, /create temporary table qa_seed_place_migration/);
assert.doesNotMatch(migration, /create unlogged table public\.qa_seed_place_migration/);
assert.doesNotMatch(migration, /qa_seed_place_migration/);
assert.match(migration, /from jsonb_to_recordset\(seed_payload\)/);
assert.match(migration, /Existing database rows win/);
assert.match(migration, /if not exists \(/);
assert.match(migration, /on conflict do nothing/);

console.log(`Place database-source checks passed. migratedVenues=${payload.length}`);
