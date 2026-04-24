import { supabase } from "@/lib/supabase";
import { readLocalJson, writeLocalJson } from "@/lib/storage";
import { mergeSeedEventsAsync } from "@/lib/seedMerge";
import { normalizeEventRange } from "@/features/events/eventFormatUtils";
import { mapGlobalEventRow } from "@/features/events/eventViewUtils";

const LEGACY_GLOBAL_EVENTS_KEY = "qa_global_events";
const CITY_EVENT_SELECT_FIELDS =
  "id,name,city,date,start_date,end_date,location,address,vibe,description,link,lat,lng,created_at";
const CITY_EVENT_LEGACY_SELECT_FIELDS =
  "id,name,city,date,location,address,description,link,lat,lng,created_at";
const GLOBAL_EVENT_SELECT_FIELDS =
  "id,name,date,start_date,end_date,location,vibe,description,link,source,last_checked,created_at";
const GLOBAL_EVENT_LEGACY_SELECT_FIELDS =
  "id,name,date,location,description,link,created_at";

function isMissingColumnError(error) {
  if (!error) return false;
  const code = String(error.code || "");
  const message = String(error.message || "").toLowerCase();
  return code === "42703" || code === "PGRST204" || message.includes("column");
}

export async function fetchEventsData() {
  let queryResult = await supabase
    .from("events")
    .select(CITY_EVENT_SELECT_FIELDS)
    .order("date", { ascending: true });
  if (queryResult.error && isMissingColumnError(queryResult.error)) {
    queryResult = await supabase
      .from("events")
      .select(CITY_EVENT_LEGACY_SELECT_FIELDS)
      .order("date", { ascending: true });
  }

  const { data, error } = queryResult;

  return {
    data: (await mergeSeedEventsAsync(data || [])).map((event) => normalizeEventRange(event)),
    error,
  };
}

export async function fetchGlobalEventsData() {
  let queryResult = await supabase
    .from("global_events")
    .select(GLOBAL_EVENT_SELECT_FIELDS)
    .order("date", { ascending: true })
    .order("created_at", { ascending: false });
  if (queryResult.error && isMissingColumnError(queryResult.error)) {
    queryResult = await supabase
      .from("global_events")
      .select(GLOBAL_EVENT_LEGACY_SELECT_FIELDS)
      .order("date", { ascending: true })
      .order("created_at", { ascending: false });
  }

  const { data, error } = queryResult;

  return {
    data: (data || []).map(mapGlobalEventRow),
    error,
  };
}

export async function migrateLegacyGlobalEventsToSupabase() {
  const legacy = readLocalJson(LEGACY_GLOBAL_EVENTS_KEY, []);
  if (!Array.isArray(legacy) || legacy.length === 0) {
    return { migrated: false, data: null, error: null };
  }

  const payload = legacy
    .filter((item) => item?.name && item?.date && item?.location)
    .map((item) => ({
      name: item.name,
      date: item.date,
      location: item.location,
      description: item.description || null,
      link: item.link || null,
      source: item.source || null,
      last_checked: item.lastChecked || null,
    }));

  if (payload.length === 0) {
    writeLocalJson(LEGACY_GLOBAL_EVENTS_KEY, []);
    return { migrated: false, data: null, error: null };
  }

  const { error } = await supabase
    .from("global_events")
    .insert(payload);

  if (error) {
    return { migrated: false, data: null, error };
  }

  writeLocalJson(LEGACY_GLOBAL_EVENTS_KEY, []);
  const refreshed = await fetchGlobalEventsData();
  return {
    migrated: true,
    data: refreshed.error ? null : refreshed.data,
    error: refreshed.error || null,
  };
}
