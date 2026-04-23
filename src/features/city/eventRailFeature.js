export function formatDate(value) {
  if (!value) return "Date TBA";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function normalizeIsoDate(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const iso = raw.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : "";
}

export function normalizeEventRange(event = {}) {
  const startDate = normalizeIsoDate(event.startDate || event.start_date || event.date);
  const endDateRaw = normalizeIsoDate(event.endDate || event.end_date || event.date);
  const endDate = endDateRaw && endDateRaw >= startDate ? endDateRaw : startDate;
  return {
    ...event,
    startDate,
    endDate: endDate || startDate,
    date: startDate,
  };
}

export function formatEventDateLabel(event = {}) {
  const normalized = normalizeEventRange(event);
  if (!normalized.startDate) return "Date TBA";
  if (!normalized.endDate || normalized.endDate === normalized.startDate) {
    return formatDate(normalized.startDate);
  }

  const start = new Date(normalized.startDate);
  const end = new Date(normalized.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return formatDate(normalized.startDate);
  }

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameMonth) {
    return `${start.getDate()}-${end.getDate()} ${start.toLocaleDateString("en-GB", { month: "short" })} ${start.getFullYear()}`;
  }

  if (sameYear) {
    return `${start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}-${end.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ${start.getFullYear()}`;
  }

  return `${start.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}-${end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
}

export function isEventVisibleOnCityPage(event) {
  const normalized = normalizeEventRange(event || {});
  if (!normalized.startDate) return false;

  const parsedEnd = new Date(normalized.endDate || normalized.startDate);
  if (Number.isNaN(parsedEnd.getTime())) return true;
  const endOfDay = new Date(parsedEnd.getFullYear(), parsedEnd.getMonth(), parsedEnd.getDate(), 23, 59, 59, 999);
  return endOfDay.getTime() >= Date.now();
}
