import { seedEvents, seedPlaces } from "../src/lib/seedContent.js";

function normalize(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function inRange(value, min, max) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function collectDuplicates(rows, keyBuilder) {
  const seen = new Map();
  const duplicates = [];
  rows.forEach((row) => {
    const key = keyBuilder(row);
    if (!key) return;
    if (seen.has(key)) {
      duplicates.push({ key, firstId: seen.get(key), duplicateId: row.id });
      return;
    }
    seen.set(key, row.id);
  });
  return duplicates;
}

const placeNameDuplicates = collectDuplicates(
  seedPlaces,
  (row) => `${normalize(row.city)}::${normalize(row.name)}`
);
const eventNameDuplicates = collectDuplicates(
  seedEvents,
  (row) => `${normalize(row.city)}::${normalize(row.name)}`
);
const placeIdDuplicates = collectDuplicates(seedPlaces, (row) => String(row.id || ""));
const eventIdDuplicates = collectDuplicates(seedEvents, (row) => String(row.id || ""));

const placeFieldIssues = [];
for (const place of seedPlaces) {
  if (!String(place.id || "").trim()) placeFieldIssues.push(`place missing id: ${place.name || "unknown"}`);
  if (!String(place.city || "").trim()) placeFieldIssues.push(`place missing city: ${place.id}`);
  if (!String(place.name || "").trim()) placeFieldIssues.push(`place missing name: ${place.id}`);
  if (!String(place.type || "").trim()) placeFieldIssues.push(`place missing type: ${place.id}`);
  const lat = Number(place.lat);
  const lng = Number(place.lng);
  if (!inRange(lat, -90, 90) || !inRange(lng, -180, 180)) {
    placeFieldIssues.push(`place invalid coordinates: ${place.id} (${place.lat}, ${place.lng})`);
  }
}

const eventFieldIssues = [];
for (const event of seedEvents) {
  if (!String(event.id || "").trim()) eventFieldIssues.push(`event missing id: ${event.name || "unknown"}`);
  if (!String(event.city || "").trim()) eventFieldIssues.push(`event missing city: ${event.id}`);
  if (!String(event.name || "").trim()) eventFieldIssues.push(`event missing name: ${event.id}`);
  const lat = Number(event.lat);
  const lng = Number(event.lng);
  if (!inRange(lat, -90, 90) || !inRange(lng, -180, 180)) {
    eventFieldIssues.push(`event invalid coordinates: ${event.id} (${event.lat}, ${event.lng})`);
  }
}

const citiesInPlaces = new Set(seedPlaces.map((row) => normalize(row.city)).filter(Boolean));
const cityCoverageIssues = [];
for (const city of new Set(seedEvents.map((row) => normalize(row.city)).filter(Boolean))) {
  if (!citiesInPlaces.has(city)) {
    cityCoverageIssues.push(`events exist but no places seeded for city: ${city}`);
  }
}

const issues = [
  ...placeNameDuplicates.map((row) => `duplicate place name key ${row.key} (${row.firstId} / ${row.duplicateId})`),
  ...eventNameDuplicates.map((row) => `duplicate event name key ${row.key} (${row.firstId} / ${row.duplicateId})`),
  ...placeIdDuplicates.map((row) => `duplicate place id ${row.key} (${row.firstId} / ${row.duplicateId})`),
  ...eventIdDuplicates.map((row) => `duplicate event id ${row.key} (${row.firstId} / ${row.duplicateId})`),
  ...placeFieldIssues,
  ...eventFieldIssues,
  ...cityCoverageIssues,
];

if (issues.length > 0) {
  console.error(`Seed validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 200)) {
    console.error(`- ${issue}`);
  }
  if (issues.length > 200) {
    console.error(`...and ${issues.length - 200} more`);
  }
  process.exit(1);
}

console.log(
  `Seed validation passed. places=${seedPlaces.length}, events=${seedEvents.length}, cities=${citiesInPlaces.size}`
);
