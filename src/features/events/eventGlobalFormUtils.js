import { normalizeEventRange, normalizeIsoDate } from "@/features/events/eventFormatUtils";

export const EMPTY_GLOBAL_FORM = {
  name: "",
  startDate: "",
  endDate: "",
  location: "",
  vibe: "",
  description: "",
  link: "",
  source: "",
  lastChecked: "",
};

export function buildGlobalFormFromEvent(event = {}) {
  const normalized = normalizeEventRange(event || {});
  return {
    name: String(event?.name || ""),
    startDate: String(normalized.startDate || ""),
    endDate: String(normalized.endDate || ""),
    location: String(event?.location || ""),
    vibe: String(event?.vibe || ""),
    description: String(event?.description || ""),
    link: String(event?.link || ""),
    source: String(event?.source || ""),
    lastChecked: String(event?.lastChecked || ""),
  };
}

export function buildGlobalEventPayloadFromForm(globalForm = {}) {
  const startDate = normalizeIsoDate(globalForm.startDate);
  const endDateCandidate = normalizeIsoDate(globalForm.endDate);
  const endDate = endDateCandidate && endDateCandidate >= startDate ? endDateCandidate : startDate;

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
      vibe: globalForm.vibe || null,
      description: globalForm.description || null,
      link: globalForm.link || null,
      source: globalForm.source || null,
      last_checked: globalForm.lastChecked || null,
    },
  };
}
