import "server-only";
import { supabase } from "@/lib/supabase";
import { mergeSeedEventsAsync } from "@/lib/seedMerge";
import { normalizeEventRange } from "@/features/events/eventFormatUtils";
import { mapGlobalEventRow } from "@/features/events/eventViewUtils";
import { isUpcomingPublicEvent } from "@/features/events/eventScope";

export const PUBLIC_EVENTS_CACHE_TAG = "qa-public-events";


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
    .filter((event) => isUpcomingPublicEvent(event))
    .map(toCalendarEvent);
  const globalEvents = (globalResult.data || [])
    .map(mapGlobalEventRow)
    .filter((event) => isUpcomingPublicEvent(event))
    .map(toCalendarEvent);

  return {
    events,
    globalEvents,
    partialData: Boolean(eventsResult.error || globalResult.error),
  };
}

export async function fetchPublicEventData() {
  // The calendar's month and “today” labels are rendered in public HTML.
  // Keep this query uncached so crawlers and browsers start from the same
  // current event set rather than a stale ISR snapshot.
  return loadPublicEventData();
}
