import { supabase } from "@/lib/supabase";
import { mergeSeedEventsAsync } from "@/lib/seedMerge";
import { fetchPlacesForAtlas } from "@/lib/placesDataApi";
import { unstable_cache } from "next/cache";
import { buildEventIntelFallback } from "@/lib/intelFallbacks";
import { normalizeVenueIntel } from "@/lib/venueIntel";
import { cityCoreConfig } from "@/lib/cityCore";
import { fetchEventRows } from "@/features/events/fetchEventRows";
import { upcomingPublicEvents } from "@/features/events/eventScope";
import { getAtlasInventory } from "@/lib/atlasMetrics";
import { getPublishedNews } from "@/lib/publicNewsData";

const HOME_DATA_REVALIDATE_SECONDS = 60;
const INITIAL_EVENT_LIMIT = 80;
const INITIAL_PLACE_LIMIT = 120;

const FEATURED_VENUE_INTEL_KEYS = [
  "queueWait",
  "bestNights",
  "crowdMix",
  "dressCode",
  "staffInclusivity",
];

function pickFeaturedVenue(places = []) {
  const candidates = (Array.isArray(places) ? places : [])
    .map((place) => {
      const intel = normalizeVenueIntel(place);
      const knownTopics = FEATURED_VENUE_INTEL_KEYS.filter((key) => intel[key]?.length >= 24);
      const sourceCount = intel.sourceUrls.length;
      const reviewCount = Number(place?.reviewCount ?? place?.review_count ?? 0) || 0;
      const rating = Number(place?.avgRating ?? place?.avg_rating ?? 0) || 0;
      const textDepth = knownTopics.reduce((total, key) => total + intel[key].length, 0);

      return {
        place,
        knownTopics: knownTopics.length,
        score:
          knownTopics.length * 10000 +
          Math.min(sourceCount, 12) * 500 +
          Math.min(reviewCount, 100) * 20 +
          Math.round(rating * 10) +
          Math.min(textDepth, 1600),
      };
    })
    .filter((candidate) => candidate.knownTopics >= 3)
    .sort((a, b) => b.score - a.score || String(a.place?.name || "").localeCompare(String(b.place?.name || "")));

  const featured = candidates[0]?.place;
  if (!featured) return null;

  return pickFields(featured, [
    "id",
    "name",
    "city",
    "type",
    "vibe",
    "description",
    "location",
    "venue_intel",
    "reviewCount",
    "review_count",
    "avgRating",
    "avg_rating",
  ]);
}

function splitLegacyVibe(description = "") {
  const raw = String(description || "");
  const match = raw.match(/^\[Vibe:\s*([^\]]+)\]\s*(?:\n\n)?([\s\S]*)$/i);
  if (!match) {
    return {
      vibe: "",
      description: raw,
    };
  }

  return {
    vibe: String(match[1] || "").trim(),
    description: String(match[2] || "").trim(),
  };
}

export function mapGlobalEventForSearch(row = {}) {
  const parsed = splitLegacyVibe(row.description || "");
  const startDate = String(row.start_date || row.date || "").slice(0, 10);
  const endDate = String(row.end_date || row.start_date || row.date || "").slice(0, 10);

  const event = {
    id: `global-${String(row.id || "")}`,
    name: String(row.name || "").trim(),
    city: "Global",
    description: parsed.description || "",
    vibe: String(row.vibe || parsed.vibe || "").trim(),
    date: startDate,
    start_date: startDate,
    end_date: endDate || startDate,
    event_status: row.event_status || "scheduled",
    location: String(row.location || "").trim(),
    link: String(row.link || "").trim(),
    isGlobal: true,
  };
  return { ...event, event_intel: buildEventIntelFallback(event) };
}

function parseNewsTimestamp(value) {
  const timestamp = Date.parse(value || "");
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getEventEndTimestamp(event = {}) {
  const value = event.end_date || event.endDate || event.date || event.start_date || event.startDate || "";
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function prioritizeInitialEvents(events = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  return [...events].sort((a, b) => {
    const aTimestamp = getEventEndTimestamp(a);
    const bTimestamp = getEventEndTimestamp(b);
    const aCurrentOrUpcoming = aTimestamp >= todayTimestamp;
    const bCurrentOrUpcoming = bTimestamp >= todayTimestamp;

    if (aCurrentOrUpcoming !== bCurrentOrUpcoming) return aCurrentOrUpcoming ? -1 : 1;
    if (aCurrentOrUpcoming) return aTimestamp - bTimestamp;
    return bTimestamp - aTimestamp;
  });
}

function compareNewsRecency(a, b) {
  const byCreatedAt =
    parseNewsTimestamp(b.createdAt || b.created_at) - parseNewsTimestamp(a.createdAt || a.created_at);
  if (byCreatedAt !== 0) return byCreatedAt;

  const byDate = parseNewsTimestamp(b.date) - parseNewsTimestamp(a.date);
  if (byDate !== 0) return byDate;

  return String(b.id || "").localeCompare(String(a.id || ""));
}

export async function fetchHomeDataPayload() {
  const [eventsRes, globalRes, placesRes, newsRes, atlasInventory] = await Promise.all([
    fetchEventRows(supabase),
    supabase
      .from("global_events")
      .select("*")
      .order("date", { ascending: true })
      .order("created_at", { ascending: false }),
    fetchPlacesForAtlas(),
    getPublishedNews(),
    getAtlasInventory(),
  ]);

  const mergedEvents = await mergeSeedEventsAsync(eventsRes?.data || []);
  const globalEvents = Array.isArray(globalRes?.data)
    ? globalRes.data.map(mapGlobalEventForSearch).filter((event) => event.name)
    : [];

  const events = upcomingPublicEvents([...mergedEvents, ...globalEvents]);
  const places = Array.isArray(placesRes?.data) ? placesRes.data : [];
  const worldNews = Array.isArray(newsRes?.items) ? newsRes.items : [];
  const featuredVenue = pickFeaturedVenue(places);
  const metrics = {
    ...atlasInventory.metrics,
    events: events.length,
  };
  const partialData = Boolean(
    eventsRes?.error ||
      globalRes?.error ||
      placesRes?.error ||
      !newsRes?.available
  );

  return {
    events,
    places,
    featuredVenue,
    worldNews,
    worldNewsFallback: !newsRes?.available,
    metrics,
    partialData,
  };
}

function pickFields(row, fields) {
  return fields.reduce((result, field) => {
    if (row?.[field] !== undefined) result[field] = row[field];
    return result;
  }, {});
}

function buildInitialHomeData(payload) {
  const events = prioritizeInitialEvents(Array.isArray(payload?.events) ? payload.events : []);
  const places = Array.isArray(payload?.places) ? payload.places : [];
  const worldNews = Array.isArray(payload?.worldNews) ? payload.worldNews : [];
  const worldNewsFallback = Boolean(payload?.worldNewsFallback);
  const featuredVenue = payload?.featuredVenue || pickFeaturedVenue(places);
  const metrics = payload?.metrics && typeof payload.metrics === "object"
    ? payload.metrics
    : {
        countries: new Set(Object.values(cityCoreConfig).map((city) => city?.country).filter(Boolean)).size,
        cities: new Set(places.map((place) => place?.city).filter(Boolean)).size,
        places: places.length,
        events: events.length,
      };

  return {
    events: events.slice(0, INITIAL_EVENT_LIMIT).map((event) =>
      pickFields(event, [
        "id",
        "name",
        "city",
        "date",
        "start_date",
        "startDate",
        "end_date",
        "vibe",
        "vibe_tags",
        "isGlobal",
        "event_intel",
      ])
    ),
    places: places.slice(0, INITIAL_PLACE_LIMIT).map((place) =>
      pickFields(place, [
        "id",
        "name",
        "city",
        "type",
        "vibe",
        "vibe_tags",
        "reviewCount",
        "review_count",
        "avgRating",
        "avg_rating",
      ])
    ),
    featuredVenue,
    worldNews: [...worldNews].sort(compareNewsRecency).slice(0, 3),
    worldNewsFallback,
    metrics,
    partialData: Boolean(payload?.partialData),
    complete: false,
  };
}

const fetchCachedInitialHomeData = unstable_cache(
  async () => buildInitialHomeData(await fetchHomeDataPayload()),
  ["qa-home-initial-data-v2"],
  {
    revalidate: HOME_DATA_REVALIDATE_SECONDS,
    tags: ["qa-home-data"],
  }
);

export async function fetchInitialHomeDataPayload() {
  return fetchCachedInitialHomeData();
}
