import { normalizeEventRange } from "./eventFormatUtils.js";
import { isEventStatusDiscoverable } from "./eventStatus.js";

export function eventEndDate(event = {}) {
  const normalized = normalizeEventRange(event);
  return String(normalized.endDate || normalized.startDate || "").slice(0, 10);
}

/** Events that may be shown and counted in public discovery surfaces. */
export function isUpcomingPublicEvent(event = {}, today = new Date().toISOString().slice(0, 10)) {
  const normalized = normalizeEventRange(event);
  const endDate = eventEndDate(normalized);
  return Boolean(
    normalized.name && normalized.city && /^\d{4}-\d{2}-\d{2}$/.test(endDate) &&
    endDate >= today && isEventStatusDiscoverable(normalized),
  );
}

export function upcomingPublicEvents(events = [], today) {
  return (Array.isArray(events) ? events : []).filter((event) => isUpcomingPublicEvent(event, today));
}
