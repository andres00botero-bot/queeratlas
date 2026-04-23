import { supabase } from "@/lib/supabase";
import { mergeVibeIntoDescription } from "@/features/events/eventFormatUtils";

export async function updateCityEventRecord(eventId, payload) {
  const withVibe = {
    ...payload,
    vibe: payload.vibe || null,
  };

  const tryUpdate = async (updatePayload) => (
    supabase.from("events").update(updatePayload).eq("id", String(eventId)).select("*").single()
  );

  let attempt = await tryUpdate(withVibe);
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
  return attempt;
}
