export const EVENT_STATUS = Object.freeze({
  SCHEDULED: "scheduled",
  RESCHEDULED: "rescheduled",
  POSTPONED: "postponed",
  CANCELLED: "cancelled",
  MOVED_ONLINE: "moved_online",
  DATE_TBA: "date_tba",
});

export const EVENT_STATUS_OPTIONS = Object.freeze([
  { value: EVENT_STATUS.SCHEDULED, label: "Scheduled" },
  { value: EVENT_STATUS.RESCHEDULED, label: "Rescheduled" },
  { value: EVENT_STATUS.POSTPONED, label: "Postponed" },
  { value: EVENT_STATUS.CANCELLED, label: "Cancelled" },
  { value: EVENT_STATUS.MOVED_ONLINE, label: "Moved online" },
  { value: EVENT_STATUS.DATE_TBA, label: "Date TBA" },
]);

const STATUS_ALIASES = new Map([
  ["", EVENT_STATUS.SCHEDULED],
  ["active", EVENT_STATUS.SCHEDULED],
  ["approved", EVENT_STATUS.SCHEDULED],
  ["published", EVENT_STATUS.SCHEDULED],
  ["scheduled", EVENT_STATUS.SCHEDULED],
  ["rescheduled", EVENT_STATUS.RESCHEDULED],
  ["postponed", EVENT_STATUS.POSTPONED],
  ["cancelled", EVENT_STATUS.CANCELLED],
  ["canceled", EVENT_STATUS.CANCELLED],
  ["moved_online", EVENT_STATUS.MOVED_ONLINE],
  ["movedonline", EVENT_STATUS.MOVED_ONLINE],
  ["online", EVENT_STATUS.MOVED_ONLINE],
  ["date_tba", EVENT_STATUS.DATE_TBA],
  ["tba", EVENT_STATUS.DATE_TBA],
  ["to_be_announced", EVENT_STATUS.DATE_TBA],
]);

const SCHEMA_STATUS_BY_EVENT_STATUS = Object.freeze({
  [EVENT_STATUS.SCHEDULED]: "https://schema.org/EventScheduled",
  [EVENT_STATUS.RESCHEDULED]: "https://schema.org/EventRescheduled",
  [EVENT_STATUS.POSTPONED]: "https://schema.org/EventPostponed",
  [EVENT_STATUS.CANCELLED]: "https://schema.org/EventCancelled",
  [EVENT_STATUS.MOVED_ONLINE]: "https://schema.org/EventMovedOnline",
  [EVENT_STATUS.DATE_TBA]: "https://schema.org/EventPostponed",
});

function normalizeStatusToken(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export function normalizeEventStatus(valueOrEvent = "", { hasDate } = {}) {
  const isEvent = valueOrEvent && typeof valueOrEvent === "object" && !Array.isArray(valueOrEvent);
  const rawValue = isEvent
    ? valueOrEvent.event_status ?? valueOrEvent.eventStatus ?? ""
    : valueOrEvent;
  const normalized = STATUS_ALIASES.get(normalizeStatusToken(rawValue)) || EVENT_STATUS.SCHEDULED;
  const eventHasDate = typeof hasDate === "boolean"
    ? hasDate
    : isEvent
      ? Boolean(valueOrEvent.start_date || valueOrEvent.startDate || valueOrEvent.date)
      : true;

  return eventHasDate ? normalized : EVENT_STATUS.DATE_TBA;
}

export function eventStatusLabel(valueOrEvent = "", options) {
  const status = normalizeEventStatus(valueOrEvent, options);
  return EVENT_STATUS_OPTIONS.find((option) => option.value === status)?.label || "Scheduled";
}

export function eventStatusSchemaUrl(valueOrEvent = "", options) {
  return SCHEMA_STATUS_BY_EVENT_STATUS[normalizeEventStatus(valueOrEvent, options)];
}

export function isEventStatusDiscoverable(valueOrEvent = "", options) {
  const status = normalizeEventStatus(valueOrEvent, options);
  return [EVENT_STATUS.SCHEDULED, EVENT_STATUS.RESCHEDULED, EVENT_STATUS.MOVED_ONLINE].includes(status);
}

export function isEventStatusIndexable(valueOrEvent = "", options) {
  return isEventStatusDiscoverable(valueOrEvent, options);
}
