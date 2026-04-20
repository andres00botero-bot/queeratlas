import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { seedPlaces } from "../src/lib/seedContent.js";

const DEFAULT_CITY_ALIASES = [
  "sofia",
  "toronto",
  "vancouver",
  "santiago",
  "bogota",
  "medellin",
  "san jose",
  "ecuador",
  "helsinki",
  "rejkiavik",
  "tel aviv",
  "tokyo",
  "malta",
  "guadalajara",
  "puerto vallarta",
  "lima",
  "san juan",
  "bucharest",
  "bratislava",
  "cape town",
  "seoul",
  "ibiza",
  "geneva",
  "zurich",
  "tajpej",
  "bangkok",
  "phuket",
  "istanbul",
  "edinburgh",
  "miami",
  "new york",
  "san francisco",
  "palm springs",
  "province town",
  "montevideo",
];

const CITY_ALIAS_MAP = {
  "new york": "new_york",
  "san francisco": "san_francisco",
  "palm springs": "palm_springs",
  "province town": "provincetown",
  provincetown: "provincetown",
  "puerto vallarta": "puerto_vallarta",
  "san juan": "san_juan",
  "san jose": "san_jose",
  ecuador: "quito",
  "cape town": "cape_town",
  "tel aviv": "tel_aviv",
  rejkiavik: "reykjavik",
  tajpej: "taipei",
};

const FALLBACK_CITY_CENTERS = {
  san_jose: { lat: 9.9281, lng: -84.0907 },
  bratislava: { lat: 48.1486, lng: 17.1077 },
  istanbul: { lat: 41.0082, lng: 28.9784 },
  provincetown: { lat: 42.0584, lng: -70.1786 },
};

const ALIASES = [
  "AtlasRaven",
  "NeonNomad",
  "VelvetFox",
  "QueerPilot",
  "MoonCircuit",
  "UrbanMermaid",
  "DiscoScholar",
  "NightCompass",
  "SoftChaos",
  "CityDrifter",
  "CrimsonEcho",
  "SilverVibe",
  "OrbitKid",
  "PrismRunner",
  "NocturnalMap",
  "LunarRiot",
  "HouseMuse",
  "StreetHalo",
  "GlowWalker",
  "MetroSiren",
  "BassBloom",
  "CloudFever",
  "ElectricFern",
  "VelourSignal",
];

const REVIEW_TEMPLATES = [
  "Great flow at %PLACE% in %CITY%. Friendly room and easy to meet people.",
  "%PLACE% surprised me in a good way. Music pacing worked and crowd felt respectful.",
  "Solid night at %PLACE%. Good energy without chaos, and staff were welcoming.",
  "Would return to %PLACE%. Crowd mix felt balanced and vibe stayed warm all night.",
  "Nice atmosphere at %PLACE% in %CITY%. Easy place to start a night and keep momentum.",
  "%PLACE% had strong community signal tonight. Not overhyped, just genuinely good.",
  "Loved the social energy at %PLACE%. It felt local, not just tourist-heavy.",
  "%PLACE% delivered a smooth night: good sound, good crowd, no unnecessary drama.",
  "Good first impression of %PLACE% in %CITY%. Comfortable room and clear vibe.",
  "At %PLACE% the room stayed active but still felt safe and manageable.",
  "Strong stop in %CITY%: %PLACE% had a welcoming crowd and fun floor energy.",
  "Great chemistry at %PLACE%. Easy to connect with people and keep the night moving.",
];

function sanitizePlaceType() {
  // Keep inserts resilient against strict DB type checks.
  return "bar";
}

function readDotEnvLocal(cwd) {
  const envPath = path.join(cwd, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function normalizeCityKey(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[-\s]+/g, "_")
    .replace(/_+/g, "_")
    .trim();
}

function normalizeTextKey(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hashString(input = "") {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function toCanonicalCity(alias) {
  const normalized = normalizeCityKey(alias);
  return CITY_ALIAS_MAP[normalized] || normalized;
}

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function loadPlacesForCities(supabase, cities) {
  if (cities.length === 0) return [];
  const { data, error } = await supabase
    .from("places")
    .select("id,name,city,type,lat,lng,description,vibe,hours,link")
    .in("city", cities);
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

async function loadReviewCountsForPlaces(supabase, placeIds) {
  const counts = new Map();
  if (placeIds.length === 0) return counts;

  for (const idsChunk of chunkArray(placeIds, 500)) {
    const { data, error } = await supabase
      .from("reviews")
      .select("place_id")
      .in("place_id", idsChunk);
    if (error) throw error;
    for (const row of data || []) {
      const key = String(row.place_id);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return counts;
}

async function insertInChunks(supabase, table, rows, size = 200) {
  let inserted = 0;
  for (const chunk of chunkArray(rows, size)) {
    const { error } = await supabase.from(table).insert(chunk);
    if (error) throw error;
    inserted += chunk.length;
  }
  return inserted;
}

function pickAlias(seed) {
  return ALIASES[seed % ALIASES.length];
}

function buildReviewComment(place, seed) {
  const template = REVIEW_TEMPLATES[seed % REVIEW_TEMPLATES.length];
  const cityLabel = String(place.city || "").replace(/_/g, " ");
  const body = template
    .replaceAll("%PLACE%", String(place.name || "this venue"))
    .replaceAll("%CITY%", cityLabel);
  return `[${pickAlias(seed)}] ${body}`;
}

function buildFallbackPlacesForCity(city) {
  const center = FALLBACK_CITY_CENTERS[city];
  if (!center) return [];
  const cityLabel = city.replace(/_/g, " ");
  return [
    {
      name: `${cityLabel} Queer Hub`,
      type: "bar",
      city,
      lat: center.lat,
      lng: center.lng,
      description: `Community anchor venue in ${cityLabel}.`,
      vibe: "Community spot",
      hours: "Hours vary by night.",
      link: "",
    },
    {
      name: `${cityLabel} Night Social`,
      type: "bar",
      city,
      lat: center.lat + 0.01,
      lng: center.lng + 0.01,
      description: `Late-night social venue in ${cityLabel}.`,
      vibe: "Nightlife",
      hours: "Hours vary by night.",
      link: "",
    },
  ];
}

async function main() {
  const cwd = process.cwd();
  readDotEnvLocal(cwd);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment/.env.local.");
  }

  const inputCities = process.argv.slice(2).length
    ? process.argv.slice(2)
    : DEFAULT_CITY_ALIASES;

  const requestedCanonicalCities = [...new Set(inputCities.map(toCanonicalCity))];
  const availableSeedCities = new Set(seedPlaces.map((place) => normalizeCityKey(place.city)));
  const targetCities = requestedCanonicalCities.filter(
    (city) => availableSeedCities.has(city) || FALLBACK_CITY_CENTERS[city],
  );

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const existingPlaces = await loadPlacesForCities(supabase, targetCities);
  const existingKeys = new Set(
    existingPlaces.map((place) => `${normalizeCityKey(place.city)}::${normalizeTextKey(place.name)}`),
  );

  const seedCandidates = seedPlaces.filter((place) => targetCities.includes(normalizeCityKey(place.city)));
  const newPlaces = [];

  for (const seed of seedCandidates) {
    const key = `${normalizeCityKey(seed.city)}::${normalizeTextKey(seed.name)}`;
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);
    newPlaces.push({
      name: seed.name,
      type: sanitizePlaceType(seed.type),
      city: normalizeCityKey(seed.city),
      lat: seed.lat ?? null,
      lng: seed.lng ?? null,
      description: seed.description || "",
      vibe: seed.vibe || "Community spot",
      hours: seed.hours || "",
      link: seed.link || "",
    });
  }

  for (const city of targetCities) {
    const cityHasAny = existingPlaces.some((place) => normalizeCityKey(place.city) === city);
    const cityHasSeed = seedCandidates.some((place) => normalizeCityKey(place.city) === city);
    if (cityHasAny || cityHasSeed) continue;
    const fallbackPlaces = buildFallbackPlacesForCity(city);
    for (const place of fallbackPlaces) {
      const key = `${normalizeCityKey(place.city)}::${normalizeTextKey(place.name)}`;
      if (existingKeys.has(key)) continue;
      existingKeys.add(key);
      newPlaces.push(place);
    }
  }

  const insertedPlaces = await insertInChunks(supabase, "places", newPlaces, 200);
  const allPlaces = await loadPlacesForCities(supabase, targetCities);

  const placeIds = allPlaces.map((place) => place.id);
  const reviewCounts = await loadReviewCountsForPlaces(supabase, placeIds);

  const reviewRows = [];
  for (const place of allPlaces) {
    const currentCount = reviewCounts.get(String(place.id)) || 0;
    if (currentCount > 0) continue;
    const baseSeed = hashString(`${place.city}:${place.name}:${place.id}`);
    const amount = 2 + (baseSeed % 3); // 2..4
    for (let i = 0; i < amount; i += 1) {
      const seed = baseSeed + i * 17;
      const ratingRoll = seed % 10;
      const rating = ratingRoll < 5 ? 5 : ratingRoll < 9 ? 4 : 3;
      reviewRows.push({
        place_id: place.id,
        rating,
        comment: buildReviewComment(place, seed),
      });
    }
  }

  const insertedReviews = await insertInChunks(supabase, "reviews", reviewRows, 500);

  console.log(
    JSON.stringify(
      {
        requestedCities: inputCities.length,
        canonicalTargetCities: targetCities.length,
        insertedPlaces,
        seededReviews: insertedReviews,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("seed-city-reviews failed:", error?.message || error);
  process.exit(1);
});
