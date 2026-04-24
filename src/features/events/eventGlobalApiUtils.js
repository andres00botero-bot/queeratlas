import { supabase } from "@/lib/supabase";
import { mergeVibeIntoDescription } from "@/features/events/eventFormatUtils";

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

function buildFallbackPayload(payload, error) {
  const errorText = `${error?.code || ""} ${error?.message || ""}`.toLowerCase();
  const missingVibeColumn =
    errorText.includes("vibe") &&
    (errorText.includes("column") || errorText.includes("schema cache"));
  const missingStartOrEnd =
    (errorText.includes("start_date") || errorText.includes("end_date")) &&
    (errorText.includes("column") || errorText.includes("schema cache"));

  let fallbackPayload = { ...payload };
  if (missingVibeColumn) {
    fallbackPayload = {
      ...fallbackPayload,
      description: mergeVibeIntoDescription(payload.vibe, payload.description),
    };
    delete fallbackPayload.vibe;
  }

  if (missingStartOrEnd) {
    delete fallbackPayload.start_date;
    delete fallbackPayload.end_date;
  }

  return fallbackPayload;
}

export async function insertGlobalEventRecord(payload) {
  const withVibe = {
    ...payload,
    vibe: payload.vibe || null,
  };

  const tryInsert = async (insertPayload, selectFields = GLOBAL_EVENT_SELECT_FIELDS) => (
    supabase.from("global_events").insert([insertPayload]).select(selectFields).single()
  );

  let attempt = await tryInsert(withVibe);
  if (attempt.error && isMissingColumnError(attempt.error)) {
    attempt = await tryInsert(withVibe, GLOBAL_EVENT_LEGACY_SELECT_FIELDS);
  }
  if (!attempt.error) return attempt;

  const fallbackPayload = buildFallbackPayload(payload, attempt.error);
  attempt = await tryInsert(fallbackPayload);
  if (attempt.error && isMissingColumnError(attempt.error)) {
    attempt = await tryInsert(fallbackPayload, GLOBAL_EVENT_LEGACY_SELECT_FIELDS);
  }
  return attempt;
}

export async function updateGlobalEventRecord(eventId, payload) {
  const withVibe = {
    ...payload,
    vibe: payload.vibe || null,
  };

  const tryUpdate = async (updatePayload, selectFields = GLOBAL_EVENT_SELECT_FIELDS) => (
    supabase.from("global_events").update(updatePayload).eq("id", String(eventId)).select(selectFields).single()
  );

  let attempt = await tryUpdate(withVibe);
  if (attempt.error && isMissingColumnError(attempt.error)) {
    attempt = await tryUpdate(withVibe, GLOBAL_EVENT_LEGACY_SELECT_FIELDS);
  }
  if (!attempt.error) return attempt;

  const fallbackPayload = buildFallbackPayload(payload, attempt.error);
  attempt = await tryUpdate(fallbackPayload);
  if (attempt.error && isMissingColumnError(attempt.error)) {
    attempt = await tryUpdate(fallbackPayload, GLOBAL_EVENT_LEGACY_SELECT_FIELDS);
  }
  return attempt;
}
