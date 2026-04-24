import { supabase } from "@/lib/supabase";
import { mergeVibeIntoDescription } from "@/features/events/eventFormatUtils";

const CITY_EVENT_SELECT_FIELDS =
  "id,name,city,date,start_date,end_date,location,address,vibe,description,link,lat,lng,created_at";
const CITY_EVENT_LEGACY_SELECT_FIELDS =
  "id,name,city,date,location,address,description,link,lat,lng,created_at";

function isMissingColumnError(error) {
  if (!error) return false;
  const code = String(error.code || "");
  const message = String(error.message || "").toLowerCase();
  return code === "42703" || code === "PGRST204" || message.includes("column");
}

export async function updateCityEventRecord(eventId, payload) {
  const withVibe = {
    ...payload,
    vibe: payload.vibe || null,
  };

  const tryUpdate = async (updatePayload, selectFields = CITY_EVENT_SELECT_FIELDS) => (
    supabase.from("events").update(updatePayload).eq("id", String(eventId)).select(selectFields).single()
  );

  let attempt = await tryUpdate(withVibe);
  if (attempt.error && isMissingColumnError(attempt.error)) {
    attempt = await tryUpdate(withVibe, CITY_EVENT_LEGACY_SELECT_FIELDS);
  }
  if (!attempt.error) return attempt;

  const errorText = `${attempt.error?.code || ""} ${attempt.error?.message || ""}`.toLowerCase();
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

  attempt = await tryUpdate(fallbackPayload);
  if (attempt.error && isMissingColumnError(attempt.error)) {
    attempt = await tryUpdate(fallbackPayload, CITY_EVENT_LEGACY_SELECT_FIELDS);
  }
  return attempt;
}
