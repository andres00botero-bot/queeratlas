import { supabase } from "@/lib/supabase";
import { mergeVibeIntoDescription } from "@/features/events/eventFormatUtils";
import { buildVibeDualWriteFields, isMissingVibeTagsColumnError } from "@/lib/vibeTaxonomy";

function buildFallbackPayload(payload, error) {
  const errorText = `${error?.code || ""} ${error?.message || ""}`.toLowerCase();
  const missingVibeColumn =
    /\bvibe\b/.test(errorText) &&
    (errorText.includes("column") || errorText.includes("schema cache"));
  const missingVibeTagsColumn = isMissingVibeTagsColumnError(error);
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

  if (missingVibeTagsColumn) {
    delete fallbackPayload.vibe_tags;
  }

  if (missingStartOrEnd) {
    delete fallbackPayload.start_date;
    delete fallbackPayload.end_date;
  }

  return fallbackPayload;
}

export async function insertGlobalEventRecord(payload) {
  const vibeFields = buildVibeDualWriteFields({
    vibe: payload.vibe,
    vibeTags: payload.vibe_tags,
  });
  const withVibe = {
    ...payload,
    ...vibeFields,
  };

  const tryInsert = async (insertPayload) => (
    supabase.from("global_events").insert([insertPayload]).select("*").single()
  );

  let attempt = await tryInsert(withVibe);
  if (!attempt.error) return attempt;

  const fallbackPayload = buildFallbackPayload(payload, attempt.error);
  attempt = await tryInsert(fallbackPayload);
  return attempt;
}

export async function updateGlobalEventRecord(eventId, payload) {
  const vibeFields = buildVibeDualWriteFields({
    vibe: payload.vibe,
    vibeTags: payload.vibe_tags,
  });
  const withVibe = {
    ...payload,
    ...vibeFields,
  };

  const tryUpdate = async (updatePayload) => (
    supabase.from("global_events").update(updatePayload).eq("id", String(eventId)).select("*").single()
  );

  let attempt = await tryUpdate(withVibe);
  if (!attempt.error) return attempt;

  const fallbackPayload = buildFallbackPayload(payload, attempt.error);
  attempt = await tryUpdate(fallbackPayload);
  return attempt;
}
