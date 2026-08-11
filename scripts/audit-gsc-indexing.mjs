import { createClient } from "@supabase/supabase-js";
import {
  evaluateEventSeoQuality,
  evaluateVenueSeoQuality,
} from "../src/lib/seo/entityIndexing.js";
import { mergeSeedEvents } from "../src/lib/seedEventsContent.js";
import { mergeSeedPlaces } from "../src/lib/seedPlacesContent.js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const key =
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

if (!url || !key) {
  throw new Error("Missing Supabase environment variables. Run with node --env-file=.env.local.");
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const legacyVenueSignals = ["albus", "eagle", "beaux", "capitol hill", "silver cloud"];
const legacySeedIds = new Set([
  "seed-place-amsterdam-albus-hotel",
  "seed-place-london-eagle-london",
  "seed-place-sanfran-beaux",
  "seed-place-seattle-capitol-hill-corridor",
  "seed-place-seattle-silvercloud",
]);

function normalizedUrl(value = "") {
  try {
    const parsed = new URL(String(value));
    return `${parsed.hostname.replace(/^www\./, "")}${parsed.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return "";
  }
}

const [{ data: venueIds, error: venueIdError }, { data: legacyVenues, error: legacyVenueError }, { data: events, error: eventError }] =
  await Promise.all([
    supabase.from("places").select("*").in("id", [430, 973]),
    supabase.from("places").select("*").in("city", ["amsterdam", "london", "san_francisco", "seattle"]),
    supabase.from("events").select("*").ilike("name", "%Pines Party 2026%"),
  ]);

const queryErrors = [venueIdError, legacyVenueError, eventError].filter(Boolean);
if (queryErrors.length > 0) {
  throw new AggregateError(queryErrors, "GSC entity audit could not read Supabase.");
}

const legacyVenueCandidates = (legacyVenues || []).filter((row) => {
  const name = String(row?.name || "").toLowerCase();
  return legacyVenueSignals.some((signal) => name.includes(signal));
});
const places = [...(venueIds || []), ...legacyVenueCandidates].filter(
  (row, index, rows) => rows.findIndex((candidate) => String(candidate.id) === String(row.id)) === index,
);
const legacySeedResolution = mergeSeedPlaces([])
  .filter((row) => legacySeedIds.has(String(row?.id || "")))
  .map((seed) => {
    const seedUrl = normalizedUrl(seed?.link);
    const match = (legacyVenues || []).find((row) =>
      String(row?.city || "") === String(seed?.city || "") &&
      seedUrl && normalizedUrl(row?.link) === seedUrl
    );
    return {
      seedId: seed.id,
      city: seed.city,
      name: seed.name,
      officialUrl: seed.link || null,
      quality: evaluateVenueSeoQuality(seed),
      databaseMatch: match ? { id: match.id, name: match.name, link: match.link || null } : null,
    };
  });

console.log(JSON.stringify({
  places: places.map((row) => ({
    id: row.id,
    city: row.city,
    name: row.name,
    quality: evaluateVenueSeoQuality(row),
    canonicalId: String(row.id),
  })),
  legacySeedResolution,
  events: [...(events || []), ...mergeSeedEvents([]).filter((row) => String(row?.name || "").includes("Pines Party 2026"))]
    .filter((row, index, rows) => rows.findIndex((candidate) => String(candidate.id) === String(row.id)) === index)
    .map((row) => ({
    id: row.id,
    city: row.city,
    name: row.name,
    endDate: row.end_date || row.endDate || row.start_date || row.startDate || row.date || null,
    quality: evaluateEventSeoQuality(row),
  })),
}, null, 2));
