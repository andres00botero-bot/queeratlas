import { supabase } from "@/lib/supabase";
import { mergeVibeIntoDescription } from "@/features/events/eventFormatUtils";
import { buildVibeDualWriteFields, isMissingVibeTagsColumnError } from "@/lib/vibeTaxonomy";

export async function updateCityEventRecord(eventId, payload) {
  const vibeFields = buildVibeDualWriteFields({
    vibe: payload.vibe,
    vibeTags: payload.vibe_tags,
  });
  const withVibe = {
    ...payload,
    ...vibeFields,
  };

  const tryUpdate = async (updatePayload) => (
    supabase.from("events").update(updatePayload).eq("id", String(eventId)).select("*").single()
  );

  let attempt = await tryUpdate(withVibe);
  if (!attempt.error) return attempt;

  const errorText = `${attempt.error?.code || ""} ${attempt.error?.message || ""}`.toLowerCase();
  const missingVibeColumn =
    /\bvibe\b/.test(errorText) &&
    (errorText.includes("column") || errorText.includes("schema cache"));
  const missingVibeTagsColumn = isMissingVibeTagsColumnError(attempt.error);
  const missingStartOrEnd =
    (errorText.includes("start_date") || errorText.includes("end_date")) &&
    (errorText.includes("column") || errorText.includes("schema cache"));
  const missingTicketUrl =
    errorText.includes("ticket_url") &&
    (errorText.includes("column") || errorText.includes("schema cache"));

  let fallbackPayload = { ...payload };
  if (missingVibeColumn) {
    fallbackPayload = {
      ...fallbackPayload,
      description: mergeVibeIntoDescription(payload.vibe, payload.description),
    };
    delete fallbackPayload.vibe;
  }

  if (missingVibeTagsColumn) {
    delete fallbackPayload.vibe_tags;
  }

  if (missingStartOrEnd) {
    delete fallbackPayload.start_date;
    delete fallbackPayload.end_date;
  }

  if (missingTicketUrl) {
    delete fallbackPayload.ticket_url;
  }

  attempt = await tryUpdate(fallbackPayload);
  return attempt;
}
