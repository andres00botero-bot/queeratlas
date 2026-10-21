import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auditDescription, planDescriptionChanges } from "./lib/venueDescriptionTone.mjs";

const manifest = JSON.parse(readFileSync(new URL("../docs/content/venue-description-tone-2026-10-21.json", import.meta.url), "utf8"));
assert.equal(new Set(manifest.changes.map((row) => row.id)).size, manifest.changes.length);
for (const row of manifest.changes) {
  assert.deepEqual(auditDescription(row.after, row.name), { terms: [], emoji: false }, `Copy issue in ${row.id}`);
  assert.ok(row.after.length >= 60 && row.after !== row.before);
  assert.doesNotMatch(row.after, /Du sa:|AI-svar|Konversation i AI|Chat only in english|You will get the name/i);
}
for (const emoji of ["🇩🇪", "🏳️‍🌈", "🧖🏽‍♂️", "1️⃣", "✨"]) assert.equal(auditDescription(emoji).emoji, true);
assert.deepEqual(auditDescription("Café with LGBTQ+ and FLINTA* events, €5 entry and 1970s décor."), { terms: [], emoji: false });
assert.deepEqual(auditDescription("Iconic Bar is a venue.", "Iconic Bar"), { terms: [], emoji: false });
assert.deepEqual(auditDescription("Iconic Bar is legendary.", "Iconic Bar").terms, ["legendary"]);
const change = { id: 37, name: "K6", city: "berlin", before: "old", after: "new" };
const row = { id: 37, name: "K6", city: "berlin", description: "old", updated_at: "2026-10-21" };
assert.equal(planDescriptionChanges([change], [row]).pending.length, 1);
assert.equal(planDescriptionChanges([change], [{ ...row, description: "new" }]).alreadyApplied, 1);
assert.equal(planDescriptionChanges([change], [{ ...row, description: "someone else's edit" }]).conflicts.length, 1);
assert.equal(planDescriptionChanges([change], [{ ...row, name: "Different venue" }]).conflicts.length, 1);
assert.equal(planDescriptionChanges([change], []).conflicts.length, 1);
assert.equal(planDescriptionChanges([change], [{ ...row, description: "new" }], true).pending[0].next, "old");
assert.throws(() => planDescriptionChanges([change, change], [row]), /Duplicate/);
console.log(`Venue tone checks passed for ${manifest.changes.length} replacements, emoji detection and conflict/rollback handling.`);
