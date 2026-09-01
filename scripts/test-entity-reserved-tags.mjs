import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildPlaceVibeDualWriteFields,
  buildServiceVibeDualWriteFields,
} from "../src/lib/vibeTaxonomy.js";
import {
  buildVenueJumpGroups,
  selectVisiblePlaceGroups,
} from "../src/features/city/venueGroupUtils.js";

function source(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

assert.deepEqual(buildServiceVibeDualWriteFields({ vibe: "" }), {
  vibe: "Service",
  vibe_tags: ["service"],
});
assert.deepEqual(buildPlaceVibeDualWriteFields({ type: "store", vibe: "" }), {
  vibe: "Store",
  vibe_tags: ["store"],
});
assert.deepEqual(
  buildPlaceVibeDualWriteFields({ type: "bar", vibeTags: ["service", "store", "chill"] }).vibe_tags,
  ["chill"],
);

assert.doesNotMatch(source("src/components/city/AddServiceInlineForm.js"), /VibeTagPicker/);
assert.doesNotMatch(source("src/components/city/SelectedServiceAdminControls.js"), /VibeTagPicker/);
assert.match(source("src/components/ui/VibeTagPicker.js"), /excludeTags = \["service", "store"\]/);
assert.match(source("src/components/city/AddPlaceInlineForm.js"), /type !== "store"/);
assert.match(source("src/components/city/AddPlaceInlineForm.js"), /excludeTags=\{\["service", "store"\]\}/);
assert.match(source("src/features/city/cityPageConstants.js"), /value: "store", label: "Stores"/);
assert.match(
  source("src/components/city/CityQuickNavigation.js"),
  /key: "store", label: "Stores", value: "store"/,
);
const emptyStoreGroup = { value: "store", label: "Stores", items: [] };
const populatedBarGroup = { value: "bar", label: "Bars", items: [{ id: 1 }] };
assert.deepEqual(buildVenueJumpGroups([populatedBarGroup, emptyStoreGroup]), [
  { value: "bar", label: "Bars", count: 1 },
  { value: "store", label: "Stores", count: 0 },
]);
assert.deepEqual(selectVisiblePlaceGroups([populatedBarGroup, emptyStoreGroup], ["store"]), [emptyStoreGroup]);

const migration = source("supabase/service-store-tags-v1.sql");
assert.match(migration, /new\.vibe_tags := array\['service'\]::text\[\]/);
assert.match(migration, /new\.vibe_tags := array\['store'\]::text\[\]/);
assert.match(migration, /type = 'store' and vibe_tags = array\['store'\]::text\[\]/);

console.log("Reserved service/store tag checks passed.");
