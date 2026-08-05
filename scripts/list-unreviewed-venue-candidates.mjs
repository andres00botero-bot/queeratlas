import { readdir, readFile } from "node:fs/promises";

const migrationFiles = (await readdir("supabase"))
  .filter((file) => /^venue-intelligence-(?:global-|berlin-)?reviewed-batch\d+-v\d+\.sql$/i.test(file));

const reviewedIds = new Set();
for (const file of migrationFiles) {
  const sql = await readFile(`supabase/${file}`, "utf8");
  for (const match of sql.matchAll(/\((\d+)::bigint,\s*jsonb_build_object\(/g)) {
    reviewedIds.add(Number(match[1]));
  }
}

const research = JSON.parse(await readFile(".tmp/venue-web-research.json", "utf8"));
const args = process.argv.slice(2);
const limitArg = args.find((value) => value.startsWith("--limit="));
const minimumSourcesArg = args.find((value) => value.startsWith("--min-sources="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : Number.POSITIVE_INFINITY;
const minimumSources = minimumSourcesArg ? Number(minimumSourcesArg.split("=")[1]) : 0;
const cityFilter = args
  .filter((value) => !value.startsWith("--"))
  .map((value) => value.toLowerCase());
const candidates = [];

for (const [rawId, evidence] of Object.entries(research)) {
  const id = Number(rawId);
  if (!Number.isFinite(id) || reviewedIds.has(id)) continue;

  const firstQuery = evidence?.queries?.[0] || "";
  const match = firstQuery.match(/^"([^"]+)"\s+(.+?)\s+(?:gay\s+)?reviews\b/i);
  if (!match) continue;

  const [, name, city] = match;
  if (cityFilter.length && !cityFilter.some((filter) => city.toLowerCase().includes(filter))) continue;

  const results = Array.isArray(evidence.results) ? evidence.results : [];
  const sourceCount = new Set(results.map((result) => result?.url).filter(Boolean)).size;
  if (sourceCount < minimumSources) continue;
  candidates.push({
    id,
    name,
    city,
    sources: sourceCount,
    fetched_at: evidence.fetched_at || null,
  });
}

candidates.sort((a, b) => b.sources - a.sources || a.city.localeCompare(b.city) || a.name.localeCompare(b.name));

const selectedCandidates = candidates.slice(0, Number.isFinite(limit) ? limit : candidates.length);

console.log(JSON.stringify({
  reviewed_ids: reviewedIds.size,
  unreviewed_candidates: candidates.length,
  candidates: selectedCandidates,
}, null, 2));
