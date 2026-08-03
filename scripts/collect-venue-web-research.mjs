import { createClient } from "@supabase/supabase-js";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const CACHE_PATH = ".tmp/venue-web-research.json";
const SOURCE_CACHE_PATH = ".tmp/venue-approved-source-cache.json";
const startAt = Number(process.argv.find((arg) => arg.startsWith("--start="))?.split("=")[1] || 0);
const endAt = Number(process.argv.find((arg) => arg.startsWith("--end="))?.split("=")[1] || Number.MAX_SAFE_INTEGER);
const refresh = process.argv.includes("--refresh");
const refreshWeak = process.argv.includes("--refresh-weak");
const workerCount = Number(process.argv.find((arg) => arg.startsWith("--workers="))?.split("=")[1] || 1);
const delayMs = Number(process.argv.find((arg) => arg.startsWith("--delay="))?.split("=")[1] || 1400);

function clean(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function decodeHtml(value = "") {
  return clean(String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ").replace(/&ndash;|&mdash;/gi, "–")
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number))));
}

function unwrapBingUrl(value = "") {
  try {
    const url = new URL(value);
    if (!url.hostname.includes("bing.com")) return url.toString();
    const encoded = url.searchParams.get("u");
    if (!encoded) return url.toString();
    const payload = encoded.replace(/^a1/, "");
    return Buffer.from(payload, "base64").toString("utf8") || url.toString();
  } catch { return value; }
}

function unwrapDuckUrl(value = "") {
  try {
    const url = new URL(value, "https://duckduckgo.com");
    return url.searchParams.get("uddg") || url.toString();
  } catch { return value; }
}

function parseDuckResults(html = "") {
  const source = String(html);
  const starts = [...source.matchAll(/<div class="result results_links/gi)].map((match) => match.index);
  const blocks = starts.map((start, index) => source.slice(start, starts[index + 1] || source.length));
  const results = [];
  for (const block of blocks) {
    const anchor = block.match(/<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!anchor) continue;
    const snippet = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i)
      || block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/div>/i);
    const url = unwrapDuckUrl(anchor[1].replaceAll("&amp;", "&"));
    const title = decodeHtml(anchor[2]);
    if (!/^https?:\/\//i.test(url) || !title) continue;
    results.push({ url, title, snippet: decodeHtml(snippet?.[1] || "") });
    if (results.length >= 10) break;
  }
  return results;
}

function parseResults(html = "") {
  const source = String(html);
  const starts = [...source.matchAll(/<li class="b_algo"/gi)].map((match) => match.index);
  const blocks = starts.map((start, index) => source.slice(start, starts[index + 1] || source.indexOf("</ol>", start)));
  const results = [];
  for (const block of blocks) {
    const anchor = block.match(/<h2[^>]*>\s*<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i)
      || block.match(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!anchor) continue;
    const paragraph = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const url = unwrapBingUrl(anchor[1].replaceAll("&amp;", "&"));
    const title = decodeHtml(anchor[2]);
    const snippet = decodeHtml(paragraph?.[1] || "");
    if (!/^https?:\/\//i.test(url) || !title) continue;
    if (/microsoft|bing\.com/i.test(new URL(url).hostname)) continue;
    results.push({ url, title, snippet });
    if (results.length >= 8) break;
  }
  return results;
}

async function fetchAll(table, select, order = "id") {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from(table).select(select).order(order).range(offset, offset + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

async function loadCache() {
  try { return JSON.parse(await readFile(CACHE_PATH, "utf8")); } catch { return {}; }
}

async function saveCache(cache) {
  await mkdir(".tmp", { recursive: true });
  await writeFile(CACHE_PATH, JSON.stringify(cache), "utf8");
}

function searchName(value = "") {
  return clean(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, " ");
}

function normalize(value = "") {
  return searchName(value).toLowerCase().trim();
}

function relevantResult(result, place) {
  const combined = normalize(`${result.title} ${result.snippet} ${result.url}`);
  const generic = new Set(["the", "bar", "club", "hotel", "cafe", "sauna", "restaurant", "party", "beach", "lounge", "pub"]);
  const tokens = normalize(place.name).split(" ").filter((token) => token.length >= 3 && !generic.has(token));
  if (!tokens.length) return false;
  const matched = tokens.filter((token) => combined.includes(token));
  const nameStrong = matched.length >= Math.min(2, tokens.length) || normalize(place.name).length >= 6 && combined.includes(normalize(place.name));
  return nameStrong && (combined.includes(normalize(place.city)) || /\bgay\b|\bqueer\b|\blgbt|tripadvisor|wanderlog|travelgay|gaycities|timeout/i.test(combined));
}

function savedSourceMatches(url, place, sourceCache) {
  const combined = normalize(`${url} ${sourceCache[url]?.text || ""}`);
  const generic = new Set(["the", "bar", "club", "hotel", "cafe", "sauna", "restaurant"]);
  const tokens = normalize(place.name).split(" ").filter((token) => token.length >= 4 && !generic.has(token));
  return tokens.length > 0 && tokens.some((token) => combined.includes(token));
}

async function searchQuery(query) {
  const duckUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(duckUrl, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "Mozilla/5.0" },
    });
    const html = await response.text();
    const duckResults = response.ok ? parseDuckResults(html) : [];
    if (duckResults.length) return { status: response.status, results: duckResults };
    clearTimeout(timeout);
    const bingController = new AbortController();
    const bingTimeout = setTimeout(() => bingController.abort(), 5500);
    const bingResponse = await fetch(`https://www.bing.com/search?q=${encodeURIComponent(query)}&setlang=en-US`, {
      redirect: "follow",
      signal: bingController.signal,
      headers: { "user-agent": "Mozilla/5.0" },
    });
    const bingHtml = await bingResponse.text();
    clearTimeout(bingTimeout);
    const results = bingResponse.ok ? parseResults(bingHtml) : [];
    return {
      status: bingResponse.status,
      results,
      ...(process.argv.includes("--debug") ? {
        html_length: bingHtml.length,
        algo_count: (bingHtml.match(/b_algo/g) || []).length,
        first_heading: decodeHtml(bingHtml.match(/<h2[^>]*>[\s\S]*?<\/h2>/i)?.[0] || ""),
      } : {}),
    };
  } catch (error) {
    return { status: 0, error: error?.name || "fetch_error", results: [] };
  } finally { clearTimeout(timeout); }
}

async function searchVenue(place) {
  const city = searchName(place.city.replaceAll("_", " "));
  const name = clean(place.name).replace(/["“”]/g, "");
  const queries = [
    `"${name}" ${city} gay reviews queue dress code staff`,
  ];
  const searches = await Promise.all(queries.map(searchQuery));
  const results = [...new Map(searches.flatMap((item) => item.results || []).map((item) => [item.url, item])).values()].slice(0, 12);
  return {
    queries,
    fetched_at: new Date().toISOString(),
    status: searches.every((item) => item.status === 200) ? 200 : Math.max(...searches.map((item) => item.status || 0)),
    results,
    ...(searches.some((item) => item.error) ? { errors: searches.map((item) => item.error).filter(Boolean) } : {}),
  };
}

const places = await fetchAll("places", "id,name,city,type,link,description,vibe,hours,venue_intel");
const selected = places.slice(startAt, Math.min(endAt, places.length));
const cache = await loadCache();
let sourceCache = {};
try { sourceCache = JSON.parse(await readFile(SOURCE_CACHE_PATH, "utf8")); } catch { /* optional cache */ }
const hasSavedSource = (place) => [...new Set([place.link, ...(place.venue_intel?.source_urls || [])].filter(Boolean))].some((url) => savedSourceMatches(url, place, sourceCache));
const hasRelevantWeb = (place) => (cache[String(place.id)]?.results || []).some((result) => relevantResult(result, place));
const pending = selected.filter((place) => refreshWeak
  ? !hasSavedSource(place) && !hasRelevantWeb(place) && !cache[String(place.id)]?.weak_attempted_at
  : refresh || !cache[String(place.id)]);

console.log(JSON.stringify({ total_places: places.length, selected: selected.length, cached: selected.length - pending.length, pending: pending.length }));
if (process.argv.includes("--count-only")) process.exit(0);
let cursor = 0;
let completed = 0;
async function worker() {
  while (cursor < pending.length) {
    const place = pending[cursor++];
    const research = await searchVenue(place);
    const weakAttempt = refreshWeak ? { weak_attempted_at: new Date().toISOString(), weak_status: research.status } : {};
    cache[String(place.id)] = research.results.length || !cache[String(place.id)]
      ? { ...research, ...weakAttempt }
      : { ...cache[String(place.id)], ...weakAttempt };
    completed += 1;
    if (completed % 25 === 0 || completed === pending.length) {
      console.log(`web research ${completed}/${pending.length}`);
      await saveCache(cache);
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

await Promise.all(Array.from({ length: Math.max(1, workerCount) }, worker));
await saveCache(cache);

const selectedResearch = selected.map((place) => cache[String(place.id)] || { results: [] });
const withResults = selectedResearch.filter((item) => item.results?.length);
const resultCount = selectedResearch.reduce((sum, item) => sum + (item.results?.length || 0), 0);
console.log(JSON.stringify({ researched: selectedResearch.length, with_results: withResults.length, without_results: selectedResearch.length - withResults.length, result_count: resultCount, sample: selected.slice(0, 5).map((place) => ({ id: place.id, name: place.name, research: cache[String(place.id)] })) }, null, 2));
