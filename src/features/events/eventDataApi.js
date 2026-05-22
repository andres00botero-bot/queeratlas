import { supabase } from "@/lib/supabase";
import { readLocalJson, writeLocalJson } from "@/lib/storage";
import { mergeSeedEventsAsync } from "@/lib/seedMerge";
import { normalizeEventRange } from "@/features/events/eventFormatUtils";
import { mapGlobalEventRow } from "@/features/events/eventViewUtils";

const LEGACY_GLOBAL_EVENTS_KEY = "qa_global_events";

export function splitGlobalEventsByExpiry(rows = [], todayIso = "") {
  const today = String(todayIso || "").trim();
  if (!today) {
    return {
      active: Array.isArray(rows) ? rows : [],
      expiredIds: [],
    };
  }

  const active = [];
  const expiredIds = [];
  for (const row of Array.isArray(rows) ? rows : []) {
    const normalized = normalizeEventRange(mapGlobalEventRow(row));
    const endDate = String(normalized.endDate || normalized.startDate || "").trim();
    const id = String(normalized.id || row?.id || "").trim();
    if (endDate && endDate < today && id) {
      expiredIds.push(id);
      continue;
    }
    active.push(row);
  }

  return { active, expiredIds };
}

export async function fetchEventsData() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  return {
    data: (await mergeSeedEventsAsync(data || [])).map((event) => normalizeEventRange(event)),
    error,
  };
}

export async function fetchGlobalEventsData() {
  const { data, error } = await supabase
    .from("global_events")
    .select("*")
    .order("date", { ascending: true })
    .order("created_at", { ascending: false });

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
