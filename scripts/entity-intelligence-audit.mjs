import { createClient } from "@supabase/supabase-js";
import { mergeSeedEvents } from "../src/lib/seedEventsContent.js";
import { buildEventIntelFallback } from "../src/lib/intelFallbacks.js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const specs = {
  places: {
    select: "id,name,city,type,link,venue_intel",
    intelKey: "venue_intel",
    required: ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity"],
  },
  events: {
    select: "id,name,city,date,link,event_intel",
    intelKey: "event_intel",
    required: ["entry_wait", "best_arrival", "crowd_mix", "dress_code", "host_inclusivity"],
  },
  services: {
    select: "id,name,city,type,link,booking_link,service_intel",
    intelKey: "service_intel",
    required: ["booking_lead_time", "best_time", "client_mix", "preparation", "provider_inclusivity"],
  },
};

async function fetchAll(table, select) {
  const rows = [];
  for (let start = 0; ; start += 1000) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .order("id", { ascending: true })
      .range(start, start + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

function summarize(rows, spec) {
  const missing = rows.filter((row) => spec.required.some((key) => !String(row?.[spec.intelKey]?.[key] || "").trim()));
  const empty = rows.filter((row) => !row?.[spec.intelKey] || Object.keys(row[spec.intelKey]).length === 0);
  const missingByField = Object.fromEntries(spec.required.map((key) => [
    key,
    rows.filter((row) => !String(row?.[spec.intelKey]?.[key] || "").trim()).length,
  ]));
  return {
    total: rows.length,
    complete: rows.length - missing.length,
    incomplete: missing.length,
    empty: empty.length,
    missing_by_field: missingByField,
    sample_incomplete: missing.slice(0, 12).map((row) => ({ id: row.id, name: row.name, city: row.city })),
  };
}

const [places, events, services, globalEvents] = await Promise.all([
  fetchAll("places", specs.places.select),
  fetchAll("events", specs.events.select),
  fetchAll("services", specs.services.select),
  fetchAll("global_events", "*"),
]);
const appEvents = mergeSeedEvents(events);
const appGlobalEvents = globalEvents.map((event) => ({ ...event, event_intel: buildEventIntelFallback(event) }));
const globalIntelProbe = await supabase.from("global_events").select("id,event_intel").limit(1);

console.log(JSON.stringify({
  database: {
    places: summarize(places, specs.places),
    events: summarize(events, specs.events),
    services: summarize(services, specs.services),
    global_events: summarize(globalEvents, specs.events),
  },
  app_merged_events: summarize(appEvents, specs.events),
  app_global_events: summarize(appGlobalEvents, specs.events),
  global_events_has_event_intel_column: !globalIntelProbe.error,
  seed_only_events: appEvents.length - events.length,
}, null, 2));
