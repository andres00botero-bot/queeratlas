import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const path = new URL("../src/lib/placesDataApi.js", import.meta.url);
let source = await readFile(path, "utf8");
source = source.replace('import { supabase } from "./supabase";', "const supabase = null;")
  .replace('import { shouldFallbackFromPlacesWithStats } from "./supabaseErrorGuards";', "const shouldFallbackFromPlacesWithStats = () => false;");
const { fetchPlacesForAtlasMetrics } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

const rows = Array.from({ length: 1001 }, (_, index) => ({ id: index + 1, name: `Place ${index}`, city: "berlin", seo_indexable: index !== 0, seo_quality_status: "approved" }));
function client({ missingColumns = false } = {}) {
  const calls = [];
  return {
    calls,
    from(table) {
      assert.equal(table, "places", "Counters must not request review data");
      return { select(fields) { return { range: async (from, to) => {
        calls.push({ fields, from, to });
        if (missingColumns && fields.includes("seo_indexable")) return { error: { code: "42703", message: "column places.seo_indexable does not exist" } };
        return { data: rows.slice(from, to + 1), error: null };
      } }; } };
    },
  };
}
const normal = client();
const result = await fetchPlacesForAtlasMetrics({ client: normal });
assert.equal(result.data.length, 1001);
assert.equal(normal.calls.length, 2, "Every page must be fetched");
assert.equal(normal.calls[0].fields, "id, name, city, seo_indexable, seo_quality_status");
const legacy = client({ missingColumns: true });
const fallback = await fetchPlacesForAtlasMetrics({ client: legacy });
assert.equal(fallback.data.length, 1001);
assert.equal(legacy.calls[1].fields, "id, name, city", "Legacy databases retain the existing fallback behavior");
console.log("Atlas metrics fetch: full pagination, minimal fields and legacy fallback passed.");
