import { normalizeEventRange, normalizeIsoDate } from "@/features/events/eventFormatUtils";
import { buildVibeDualWriteFields, inferVibeTagsFromLegacyVibe, normalizeVibeTags } from "@/lib/vibeTaxonomy";

export const EMPTY_GLOBAL_FORM = {
  name: "",
  startDate: "",
  endDate: "",
  location: "",
  vibe: "",
  vibe_tags: [],
  description: "",
  link: "",
  ticket_url: "",
  source: "",
  lastChecked: "",
};

export function buildGlobalFormFromEvent(event = {}) {
  const normalized = normalizeEventRange(event || {});
  const vibeLabel = String(event?.vibe || "");
  const vibeTags = normalizeVibeTags(
    Array.isArray(event?.vibe_tags) && event.vibe_tags.length > 0
      ? event.vibe_tags
      : inferVibeTagsFromLegacyVibe(vibeLabel),
    { max: 3 }
  );
  return {
    name: String(event?.name || ""),
    startDate: String(normalized.startDate || ""),
    endDate: String(normalized.endDate || ""),
    location: String(event?.location || ""),
    vibe: vibeLabel,
    vibe_tags: vibeTags,
    description: String(event?.description || ""),
    link: String(event?.link || ""),
    ticket_url: String(event?.ticket_url || event?.ticketUrl || ""),
    source: String(event?.source || ""),
    lastChecked: String(event?.lastChecked || ""),
  };
}

export function buildGlobalEventPayloadFromForm(globalForm = {}) {
  const startDate = normalizeIsoDate(globalForm.startDate);
  const endDateCandidate = normalizeIsoDate(globalForm.endDate);
  const endDate = endDateCandidate && endDateCandidate >= startDate ? endDateCandidate : startDate;
  const vibeFields = buildVibeDualWriteFields({
    vibe: globalForm.vibe,
    vibeTags: globalForm.vibe_tags,
  });

  return {
    startDate,
    endDateCandidate,
    endDate,
    payload: {
      name: globalForm.name,
      date: startDate,
      start_date: startDate,
      end_date: endDate || startDate,
      location: globalForm.location,
      ...vibeFields,
      description: globalForm.description || null,
      link: globalForm.link || null,
      ticket_url: String(globalForm.ticket_url || "").trim() || null,
      source: globalForm.source || null,
      last_checked: globalForm.lastChecked || null,
    },
  };
}
