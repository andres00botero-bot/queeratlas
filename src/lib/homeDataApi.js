import { supabase } from "@/lib/supabase";
import { mergeSeedEventsAsync } from "@/lib/seedMerge";
import { fetchPlacesForAtlas } from "@/lib/placesDataApi";
import { EDITORIAL_PULSE_ITEMS, PULSE_CATEGORIES } from "@/lib/pulse";

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

function mapGlobalEventForSearch(row = {}) {
  const parsed = splitLegacyVibe(row.description || "");
  const startDate = String(row.start_date || row.date || "").slice(0, 10);
  const endDate = String(row.end_date || row.start_date || row.date || "").slice(0, 10);

  return {
    id: `global-${String(row.id || "")}`,
    name: String(row.name || "").trim(),
    city: "Global",
    description: parsed.description || "",
    vibe: String(row.vibe || parsed.vibe || "").trim(),
    date: startDate,
    start_date: startDate,
    end_date: endDate || startDate,
    location: String(row.location || "").trim(),
    link: String(row.link || "").trim(),
    isGlobal: true,
  };
}

function parseNewsTimestamp(value) {
  const timestamp = Date.parse(value || "");
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function compareNewsRecency(a, b) {
  const byCreatedAt =
    parseNewsTimestamp(b.createdAt || b.created_at) - parseNewsTimestamp(a.createdAt || a.created_at);
  if (byCreatedAt !== 0) return byCreatedAt;

  const byDate = parseNewsTimestamp(b.date) - parseNewsTimestamp(a.date);
  if (byDate !== 0) return byDate;

  return String(b.id || "").localeCompare(String(a.id || ""));
}

async function fetchWorldNews() {
  const { data, error } = await supabase
    .from("qa_world_news")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return {
      data: [...EDITORIAL_PULSE_ITEMS].sort(compareNewsRecency),
      partialData: true,
    };
  }

  const withCategoryLabel = (data || []).map((item) => ({
    ...item,
    createdAt: item.created_at || "",
    categoryLabel: PULSE_CATEGORIES.find((option) => option.key === item.category)?.label || "News",
  }));

  const merged = [...withCategoryLabel, ...EDITORIAL_PULSE_ITEMS].reduce((acc, item) => {
    const key = String(item.id || `${item.title}-${item.date}`);
    if (!acc.some((existing) => String(existing.id || `${existing.title}-${existing.date}`) === key)) {
      acc.push(item);
    }
    return acc;
  }, []);

  return { data: merged.sort(compareNewsRecency), partialData: false };
}

export async function fetchHomeDataPayload() {
  const [eventsRes, globalRes, placesRes, newsRes] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true }),
    supabase
      .from("global_events")
      .select("*")
      .order("date", { ascending: true })
      .order("created_at", { ascending: false }),
    fetchPlacesForAtlas(),
    fetchWorldNews(),
  ]);

  const mergedEvents = await mergeSeedEventsAsync(eventsRes?.data || []);
  const globalEvents = Array.isArray(globalRes?.data)
    ? globalRes.data.map(mapGlobalEventForSearch).filter((event) => event.name)
    : [];

  const events = [...mergedEvents, ...globalEvents];
  const places = Array.isArray(placesRes?.data) ? placesRes.data : [];
  const worldNews = Array.isArray(newsRes?.data) ? newsRes.data : [];
  const partialData = Boolean(
    eventsRes?.error ||
      globalRes?.error ||
      placesRes?.error ||
      newsRes?.partialData
  );

  return {
    events,
    places,
    worldNews,
    partialData,
  };
}
