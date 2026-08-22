import { writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { cityCoreConfig } from "../src/lib/cityCore.js";

const PAGE_SIZE = 1000;
const REPORT_YEAR = 2026;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) throw new Error("Supabase URL/key missing. Run with --env-file=.env.local.");

const client = createClient(url, key, { auth: { persistSession: false } });

async function fetchAllEvents() {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await client.from("events").select("*").range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if ((data || []).length < PAGE_SIZE) return rows;
  }
}

function eventDate(event) {
  return String(event?.start_date || event?.date || "").slice(0, 10);
}

function hasText(value) {
  return Boolean(String(value || "").trim());
}

function hasCoordinate(value) {
  return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
}

function cityLabel(city = "") {
  return String(city).replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const allEvents = await fetchAllEvents();
const eligibleEvents = allEvents.filter((event) => {
  const city = String(event?.city || "").trim().toLowerCase();
  return event?.seo_indexable !== false
    && eventDate(event).startsWith(String(REPORT_YEAR))
    && Boolean(cityCoreConfig[city]);
});

const grouped = Map.groupBy(eligibleEvents, (event) => String(event.city).trim().toLowerCase());
const entries = [...grouped.entries()].map(([city, events]) => {
  const dates = events.map(eventDate).filter(Boolean).sort();
  const activeMonths = new Set(dates.map((date) => date.slice(0, 7))).size;
  const linkedEvents = events.filter((event) => hasText(event?.link)).length;
  const locatedEvents = events.filter((event) => hasCoordinate(event?.lat) && hasCoordinate(event?.lng)).length;
  const routeReadyEvents = events.filter((event) => hasText(event?.link) && hasCoordinate(event?.lat) && hasCoordinate(event?.lng)).length;
  return {
    rank: null,
    city,
    cityName: cityLabel(city),
    country: cityCoreConfig[city].country,
    events: events.length,
    activeMonths,
    linkedEvents,
    locatedEvents,
    routeReadyEvents,
    linkedShare: Math.round((linkedEvents / events.length) * 100),
    routeReadyShare: Math.round((routeReadyEvents / events.length) * 100),
    firstEventDate: dates[0],
    lastEventDate: dates.at(-1),
  };
}).sort((left, right) => right.events - left.events
  || right.activeMonths - left.activeMonths
  || right.routeReadyEvents - left.routeReadyEvents
  || left.city.localeCompare(right.city));

entries.forEach((entry, index) => {
  entry.rank = index + 1;
});

const snapshot = {
  schemaVersion: "QA-GER-1.0",
  methodologyVersion: "QA-GER-1.0",
  year: REPORT_YEAR,
  snapshotAt: new Date().toISOString(),
  temporalCoverage: "2026-01-01/2026-12-31",
  scope: {
    indexedEvents: eligibleEvents.length,
    atlasCitiesWithEvents: entries.length,
    routeReadyEvents: entries.reduce((sum, entry) => sum + entry.routeReadyEvents, 0),
    linkedEvents: entries.reduce((sum, entry) => sum + entry.linkedEvents, 0),
  },
  ordering: "Descending indexed 2026 event count; ties use active months, route-ready event count, then city name.",
  limitation: "This is a transparent report on events documented in Queer Atlas at snapshot time, not a complete census of every queer event operating worldwide.",
  entries,
};

await writeFile(
  new URL("../src/lib/seo/globalQueerEventReport2026.json", import.meta.url),
  `${JSON.stringify(snapshot, null, 2)}\n`,
  "utf8"
);

console.log(JSON.stringify({ output: "src/lib/seo/globalQueerEventReport2026.json", ...snapshot.scope, top10: entries.slice(0, 10) }, null, 2));
