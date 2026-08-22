import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { cityCoreConfig } from "../src/lib/cityCore.js";
import { mergeSeedPlaces } from "../src/lib/seedPlacesContent.js";

const args = new Set(process.argv.slice(2));
const cityArg = [...args].find((value) => value.startsWith("--city="));
const regionArg = [...args].find((value) => value.startsWith("--region="));
const limitArg = [...args].find((value) => value.startsWith("--limit="));
const originArg = [...args].find((value) => value.startsWith("--origin="));
const concurrencyArg = [...args].find((value) => value.startsWith("--concurrency="));
const cityFilter = cityArg ? cityArg.slice(7).trim().toLowerCase() : "";
const regionFilter = regionArg ? regionArg.slice(9).trim().toLowerCase() : "";
const limit = limitArg ? Number(limitArg.slice(8)) : Number.POSITIVE_INFINITY;
const origin = originArg ? originArg.slice(9).trim() : "http://localhost:3001";
const concurrency = Math.max(1, Math.min(12, concurrencyArg ? Number(concurrencyArg.slice(14)) : 8));
const apply = args.has("--apply");
const refreshManual = args.has("--refresh-manual");
const reportPath = path.join(process.cwd(), ".tmp", "place-coordinate-audit.json");
const cachePath = path.join(process.cwd(), ".tmp", "place-geocode-cache.json");
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : {};
const inFlight = new Map();
let cacheWritesPending = 0;

const EUROPE_COUNTRIES = new Set([
  "Albania", "Austria", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia",
  "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Georgia",
  "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Latvia", "Lithuania",
  "Malta", "Montenegro", "Netherlands", "Norway", "Poland", "Portugal", "Romania",
  "Russia", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland",
  "Turkey", "Ukraine", "United Kingdom",
]);

const LATIN_AMERICA_COUNTRIES = new Set([
  "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Costa Rica", "Cuba",
  "Dominican Republic", "Ecuador", "El Salvador", "Guatemala", "Honduras", "Mexico",
  "Nicaragua", "Panama", "Paraguay", "Peru", "Puerto Rico", "Uruguay", "Venezuela",
]);

const ASIA_COUNTRIES = new Set([
  "Cambodia", "China", "Hong Kong", "India", "Indonesia", "Israel", "Japan",
  "Lebanon", "Malaysia", "Philippines", "Singapore", "South Korea", "Taiwan",
  "Thailand", "Vietnam",
]);

const CANADA_COUNTRIES = new Set(["Canada"]);

const AFRICA_COUNTRIES = new Set([
  "Egypt", "Morocco", "Namibia", "South Africa",
]);

const OCEANIA_COUNTRIES = new Set(["Australia", "New Zealand"]);

function cityMatchesRegion(citySlug, region) {
  if (!region) return true;
  const country = cityCoreConfig[String(citySlug || "").toLowerCase()]?.country;
  if (region === "europe") return EUROPE_COUNTRIES.has(country);
  if (region === "latin-america" || region === "latin_america") return LATIN_AMERICA_COUNTRIES.has(country);
  if (region === "asia") return ASIA_COUNTRIES.has(country);
  if (region === "canada") return CANADA_COUNTRIES.has(country);
  if (region === "africa") return AFRICA_COUNTRIES.has(country);
  if (region === "oceania") return OCEANIA_COUNTRIES.has(country);
  throw new Error(`Unknown region: ${region}`);
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function numbers(value) {
  return normalize(value).match(/\b\d+[a-z]?\b/g) || [];
}

function words(value) {
  const ignored = new Set(["the", "de", "del", "la", "el", "and", "y", "street", "st", "road", "rd", "avenue", "av", "ave", "calle", "carrera", "cra"]);
  return normalize(value).split(" ").filter((word) => word.length >= 3 && !ignored.has(word) && !/^\d/.test(word));
}

function haversineKm(first, second) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const latDelta = toRadians(second.lat - first.lat);
  const lngDelta = toRadians(second.lng - first.lng);
  const a = Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(first.lat)) * Math.cos(toRadians(second.lat)) * Math.sin(lngDelta / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(a));
}

function addressScore(place, suggestion) {
  const query = String(place.location || "").trim();
  const candidate = String(suggestion.address || "");
  const queryNumbers = numbers(query);
  const candidateNumbers = new Set(numbers(candidate));
  const queryWords = words(query);
  const candidateWords = new Set(words(candidate));
  const matchingWords = queryWords.filter((word) => candidateWords.has(word)).length;
  const wordCoverage = queryWords.length ? matchingWords / queryWords.length : 0;
  const numberMatch = queryNumbers.length > 0 && queryNumbers.every((value) => candidateNumbers.has(value));
  const exactPoiName = suggestion.featureType === "poi" && normalize(suggestion.name) === normalize(place.name);
  let score = wordCoverage * 5;
  if (numberMatch) score += 8;
  if (suggestion.featureType === "address") score += 2;
  if (exactPoiName) score += 8;
  return { exactPoiName, numberMatch, score, wordCoverage };
}

async function fetchReverseConfirmation(place) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN || "";
  const lat = Number(place.lat);
  const lng = Number(place.lng);
  if (!token || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`);
  url.searchParams.set("types", "address,poi");
  url.searchParams.set("limit", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("access_token", token);
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) return null;
  const payload = await response.json();
  const queryNumbers = numbers(place.location);

  for (const feature of payload.features || []) {
    const address = String(feature.place_name || feature.text || "").trim();
    const suggestion = {
      address,
      featureType: String(feature.place_type?.[0] || ""),
      name: String(feature.text || ""),
    };
    const match = addressScore(place, suggestion);
    const numberedAddressMatch = queryNumbers.length > 0 && match.numberMatch && match.wordCoverage >= 0.15;
    if (!match.exactPoiName && !numberedAddressMatch) continue;
    return {
      candidate: {
        address,
        lat,
        lng,
        source: "mapbox-reverse-current-validation",
      },
      score: Number(match.score.toFixed(2)),
    };
  }
  return null;
}

async function fetchAllPlaces(supabase) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("places")
      .select("id,name,city,type,location,lat,lng,description,hours,link,vibe")
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...(data || []));
    if ((data || []).length < 1000) return rows;
  }
}

function cacheKey(place) {
  return `${String(place.city || "").toLowerCase()}|${normalize(place.location || place.name)}`;
}

function persistCache() {
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, `${JSON.stringify(cache)}\n`, "utf8");
  cacheWritesPending = 0;
}

async function fetchCandidate(place) {
  const context = cityCoreConfig[String(place.city || "").toLowerCase()];
  if (!context) return { reason: "unknown-city" };
  const query = String(place.location || "").trim() || `${place.name}, ${context.title.replace(/^Queer\s+/i, "")}`;
  const sessionToken = randomUUID();
  const params = new URLSearchParams({ city: place.city, q: query, sessionToken });
  const response = await fetch(`${origin}/api/geocode/suggest?${params}`);
  if (!response.ok) return { reason: `suggest-http-${response.status}` };
  const payload = await response.json();
  const ranked = (payload.suggestions || [])
    .map((suggestion) => ({ suggestion, ...addressScore(place, suggestion) }))
    .sort((a, b) => b.score - a.score);
  let best = ranked[0];
  if (!best) return { reason: "no-result" };
  const hasAddress = Boolean(String(place.location || "").trim());
  let highConfidence = hasAddress
    ? (best.numberMatch && best.wordCoverage >= 0.15 && best.score >= 9) || best.exactPoiName
    : best.exactPoiName;

  // A vague or stale address often resolves to a street centroid. Before sending
  // it to manual review, try the venue name and only accept an exact POI-name hit.
  if (!highConfidence) {
    const nameQuery = `${place.name}, ${context.title.replace(/^Queer\s+/i, "")}`;
    if (normalize(nameQuery) !== normalize(query)) {
      const nameParams = new URLSearchParams({ city: place.city, q: nameQuery, sessionToken });
      const nameResponse = await fetch(`${origin}/api/geocode/suggest?${nameParams}`);
      if (nameResponse.ok) {
        const namePayload = await nameResponse.json();
        const exactPoi = (namePayload.suggestions || [])
          .map((suggestion) => ({ suggestion, ...addressScore(place, suggestion) }))
          .find((entry) => entry.exactPoiName);
        if (exactPoi) {
          best = exactPoi;
          highConfidence = true;
        }
      }
    }
  }
  if (!highConfidence) {
    const reverseConfirmation = await fetchReverseConfirmation(place);
    if (reverseConfirmation) return reverseConfirmation;
    return { reason: "ambiguous", topSuggestion: best.suggestion, score: Number(best.score.toFixed(2)) };
  }

  if (best.suggestion.provider === "mapbox-geocoding-v6") {
    return {
      candidate: {
        address: best.suggestion.address,
        lat: Number(best.suggestion.lat),
        lng: Number(best.suggestion.lng),
        source: best.suggestion.provider,
      },
      score: Number(best.score.toFixed(2)),
    };
  }

  const retrieveParams = new URLSearchParams({
    city: place.city,
    id: best.suggestion.id,
    sessionToken,
  });
  const retrieveResponse = await fetch(`${origin}/api/geocode/retrieve?${retrieveParams}`);
  const retrieved = await retrieveResponse.json().catch(() => ({}));
  if (!retrieveResponse.ok) return { reason: retrieved.error || `retrieve-http-${retrieveResponse.status}` };
  return {
    candidate: {
      address: retrieved.address,
      lat: Number(retrieved.lat),
      lng: Number(retrieved.lng),
      source: retrieved.source,
    },
    score: Number(best.score.toFixed(2)),
  };
}

async function findCandidate(place) {
  const key = cacheKey(place);
  if (Object.hasOwn(cache, key)) return cache[key];
  if (inFlight.has(key)) return inFlight.get(key);
  const pending = fetchCandidate(place)
    .then((result) => {
      cache[key] = result;
      cacheWritesPending += 1;
      if (cacheWritesPending >= 50) persistCache();
      return result;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, pending);
  return pending;
}

async function runPool(items, worker, size) {
  const results = new Array(items.length);
  let cursor = 0;
  async function runWorker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
      if ((index + 1) % 100 === 0) console.log(`Audited ${index + 1}/${items.length}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, () => runWorker()));
  return results;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Missing Supabase environment variables.");
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const databasePlaces = await fetchAllPlaces(supabase);
  const databaseIds = new Set(databasePlaces.map((place) => String(place.id)));
  let visiblePlaces = mergeSeedPlaces(databasePlaces);
  if (cityFilter) visiblePlaces = visiblePlaces.filter((place) => String(place.city).toLowerCase() === cityFilter);
  if (regionFilter) visiblePlaces = visiblePlaces.filter((place) => cityMatchesRegion(place.city, regionFilter));
  visiblePlaces = visiblePlaces.slice(0, Number.isFinite(limit) ? limit : visiblePlaces.length);

  if (refreshManual && fs.existsSync(reportPath)) {
    const previousReport = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    const manualKeys = new Set(
      (previousReport.rows || [])
        .filter((row) => row.status === "manual")
        .map((row) => `${String(row.city || "").toLowerCase()}|${normalize(row.current?.address || row.name)}`),
    );
    for (const key of manualKeys) delete cache[key];
  }

  const report = {
    generatedAt: new Date().toISOString(),
    origin,
    scope: { city: cityFilter || "all", region: regionFilter || null, count: visiblePlaces.length },
    summary: { verified: 0, fixes: 0, manual: 0, failed: 0, applied: 0 },
    rows: [],
  };

  const rows = await runPool(visiblePlaces, async (place) => {
    const current = { lat: Number(place.lat), lng: Number(place.lng) };
    try {
      const result = await findCandidate(place);
      if (!result.candidate) {
        report.summary.manual += 1;
        return {
          id: place.id,
          name: place.name,
          city: place.city,
          inventorySource: databaseIds.has(String(place.id)) ? "database" : "seed",
          status: "manual",
          current: { address: place.location || null, ...current },
          ...result,
        };
      } else {
        const distanceMeters = Math.round(haversineKm(current, result.candidate) * 1000);
        const status = distanceMeters <= 75 ? "verified" : "fix";
        report.summary[status === "fix" ? "fixes" : "verified"] += 1;
        const row = {
          id: place.id,
          name: place.name,
          city: place.city,
          inventorySource: databaseIds.has(String(place.id)) ? "database" : "seed",
          status,
          score: result.score,
          distanceMeters,
          current: { address: place.location || null, ...current },
          candidate: result.candidate,
        };
        if (apply && status === "fix" && row.inventorySource === "database") {
          const { error } = await supabase
            .from("places")
            .update({ lat: result.candidate.lat, lng: result.candidate.lng })
            .eq("id", place.id)
            .eq("city", place.city)
            .eq("name", place.name);
          if (error) throw error;
          row.applied = true;
          report.summary.applied += 1;
        }
        return row;
      }
    } catch (error) {
      report.summary.failed += 1;
      return { id: place.id, name: place.name, city: place.city, status: "failed", error: error.message };
    }
  }, concurrency);
  report.rows.push(...rows);

  if (cacheWritesPending > 0) persistCache();
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ reportPath, ...report.summary }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
