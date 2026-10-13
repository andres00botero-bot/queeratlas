import "server-only";
import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";
import { mergeSeedEventsAsync } from "@/lib/seedMerge";
import { normalizeEventRange } from "@/features/events/eventFormatUtils";
import { isEventStatusDiscoverable } from "@/features/events/eventStatus";
import { mapGlobalEventRow } from "@/features/events/eventViewUtils";

export const PUBLIC_EVENTS_CACHE_TAG = "qa-public-events";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isCurrentDiscoverableEvent(event, today = todayIso()) {
  const normalized = normalizeEventRange(event || {});
  const endDate = String(normalized.endDate || normalized.startDate || "");
  return Boolean(
    normalized.name &&
      normalized.startDate &&
      endDate >= today &&
      isEventStatusDiscoverable(normalized),
  );
}

function toCalendarEvent(event = {}) {
  const normalized = normalizeEventRange(event);
  return {
    id: normalized.id,
    name: normalized.name || "",
    city: normalized.city || "",
    date: normalized.date || "",
    start_date: normalized.startDate || "",
    end_date: normalized.endDate || "",
    location: normalized.location || "",
    vibe: normalized.vibe || "",
    vibe_tags: Array.isArray(normalized.vibe_tags) ? normalized.vibe_tags : [],
    description: normalized.description || "",
    link: normalized.link || "",
    ticket_url: normalized.ticket_url || normalized.ticketUrl || "",
    event_status: normalized.event_status || "scheduled",
    source: normalized.source || "",
    lastChecked: normalized.lastChecked || normalized.last_checked || "",
    isGlobal: Boolean(normalized.isGlobal),
  };
}

async function fetchAllEvents() {
  const pageSize = 1000;
  const rows = [];

  for (let from = 0; ; from += pageSize) {
    const result = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })
      .range(from, from + pageSize - 1);

    if (result.error || (result.data || []).length < pageSize) {
      return { data: [...rows, ...(result.data || [])], error: result.error };
    }

    rows.push(...result.data);
  }
}

async function loadPublicEventData() {
  const [eventsResult, globalResult] = await Promise.all([
    fetchAllEvents(),
    supabase.from("global_events").select("*").order("date", { ascending: true }).order("created_at", { ascending: false }),
  ]);

  const events = (await mergeSeedEventsAsync(eventsResult.data || []))
    .map((event) => normalizeEventRange(event))
    .filter((event) => isCurrentDiscoverableEvent(event))
    .map(toCalendarEvent);
  const globalEvents = (globalResult.data || [])
    .map(mapGlobalEventRow)
    .filter((event) => isCurrentDiscoverableEvent(event))
    .map(toCalendarEvent);

  return {
    events,
    globalEvents,
    partialData: Boolean(eventsResult.error || globalResult.error),
  };
}

const getCachedPublicEventData = unstable_cache(
  loadPublicEventData,
  ["qa-public-event-data-v2"],
  { revalidate: 60, tags: [PUBLIC_EVENTS_CACHE_TAG] },
);

export async function fetchPublicEventData() {
  return getCachedPublicEventData();
}
