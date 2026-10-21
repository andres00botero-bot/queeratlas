import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { auditDescription, planDescriptionChanges, readVenueDescriptions } from "./lib/venueDescriptionTone.mjs";

const apply = process.argv.includes("--apply");
const rollback = process.argv.includes("--rollback");
const manifest = JSON.parse(readFileSync(new URL("../docs/content/venue-description-tone-2026-10-21.json", import.meta.url), "utf8"));
for (const change of manifest.changes) {
  const issues = auditDescription(change.after, change.name);
  if (issues.terms.length || issues.emoji || change.after.length < 60) {
    throw new Error(`Invalid replacement for ${change.id}`);
  }
}
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const plan = planDescriptionChanges(manifest.changes, await readVenueDescriptions(db), rollback);
console.log(JSON.stringify({ mode: rollback ? "rollback" : "edit", apply, pending: plan.pending.length, alreadyApplied: plan.alreadyApplied, conflicts: plan.conflicts }));
if (plan.conflicts.length) throw new Error("Preflight conflicts: no writes started.");
if (!apply) process.exit(0);

let cursor = 0;
let completed = 0;
let failed = false;
const failures = [];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (!failed && cursor < plan.pending.length) {
    const { row, next } = plan.pending[cursor++];
    try {
      let query = db.from("places").update({ description: next, updated_at: new Date().toISOString() })
        .eq("id", row.id).eq("city", row.city).eq("name", row.name);
      // Timestamp guard also supports the unusually long malformed source copy,
      // which cannot safely be embedded in a PostgREST URL filter.
      query = row.updated_at == null ? query.is("updated_at", null) : query.eq("updated_at", row.updated_at);
      const { data, error } = await query.select("id,description");
      if (error) throw new Error(error.message);
      if (data?.length !== 1 || data[0].description !== next) throw new Error("Concurrent edit or failed read-back");
      completed += 1;
      if (completed % 100 === 0) console.log(`Updated ${completed}/${plan.pending.length}`);
    } catch (error) {
      failed = true;
      failures.push({ id: row.id, message: error.message });
    }
  }
}));
if (failures.length) {
  console.error(JSON.stringify({ completed, failures }));
  throw new Error("Update stopped; rerun dry-run to inspect current state. Previously applied rows are skipped.");
}
const verify = planDescriptionChanges(manifest.changes, await readVenueDescriptions(db), rollback);
if (verify.pending.length || verify.conflicts.length) throw new Error("Final verification did not match the manifest.");
console.log(JSON.stringify({ verified: verify.alreadyApplied, completed, mode: rollback ? "rollback" : "edit" }));
