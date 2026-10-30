import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const today = new Date().toISOString().slice(0, 10);
const rows = {
  places: [
    { id: 1, name: "One", city: "new-york", type: "bar", seo_indexable: true },
    { id: 2, name: "One", city: "new_york", type: "bar", seo_indexable: true },
    { id: 3, name: "Hidden", city: "berlin", type: "bar", seo_indexable: false },
    { id: 4, name: "Two", city: "berlin", type: "sauna", seo_quality_status: "approved" },
  ],
  events: [
    { id: 1, name: "Future", city: "berlin", date: today, event_status: "scheduled" },
    { id: 2, name: "Cancelled", city: "berlin", date: today, event_status: "cancelled" },
    { id: 3, name: "Old", city: "berlin", date: "2001-01-01", event_status: "scheduled" },
  ],
  services: [{ id: 1, name: "Service", city: "new_york", type: "service" }],
};
const calls = [];
globalThis.__cityCountsTest = {
  supabase: { from(table) { return { select(fields) { return { order() { return { range: async () => {
    calls.push({ table, fields }); return { data: rows[table], error: null };
  } }; } }; } }; } },
  mergeSeedEventsAsync: async (events) => [...events, { id: "seed", name: "Seed", city: "new_york", date: today }],
  normalizeCityKey: (value = "") => String(value || "").toLowerCase().replace(/[-\s]+/g, "_").replace(/_+/g, "_").trim(),
  isUpcomingPublishedEvent: (event) => (event.end_date || event.start_date || event.date || "") >= today && event.event_status !== "cancelled",
  uniquePublishedEntities: (entities) => {
    const seen = new Set();
    return entities.filter((row) => {
      if (!row.id || !row.name || !row.city || row.seo_indexable === false) return false;
      const key = [row.city, row.name, row.type].map((value) => String(value || "").toLowerCase()).join("::");
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  },
};
let source = await readFile(new URL("../src/lib/server/cityEntityCounts.js", import.meta.url), "utf8");
source = source.replace('import "server-only";', "")
  .replace('import { supabase } from "@/lib/supabase";', "const { supabase } = globalThis.__cityCountsTest;")
  .replace('import { mergeSeedEventsAsync } from "@/lib/seedMerge";', "const { mergeSeedEventsAsync } = globalThis.__cityCountsTest;")
  .replace('import { normalizeCityKey } from "@/features/city/checkinFeature";', "const { normalizeCityKey } = globalThis.__cityCountsTest;")
  .replace('import { isUpcomingPublishedEvent, uniquePublishedEntities } from "@/lib/publicInventory";', "const { isUpcomingPublishedEvent, uniquePublishedEntities } = globalThis.__cityCountsTest;");
const { getCityEntityCounts } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const [berlin, newYork] = await Promise.all([getCityEntityCounts("berlin"), getCityEntityCounts("new_york")]);
assert.deepEqual(berlin, { venues: 1, events: 1, services: 0 });
assert.deepEqual(newYork, { venues: 2, events: 1, services: 1 });
assert.equal(calls.length, 3, "Concurrent requests must share one load");
assert.ok(calls.every(({ fields }) => fields !== "*"), "Counters request only their required fields");
console.log("City counts: publication, duplicate rules, seed events, dates and shared loading passed.");
