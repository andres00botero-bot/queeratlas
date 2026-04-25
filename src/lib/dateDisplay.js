function parseDateInput(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatDateShort(value, { fallback = "Date TBA" } = {}) {
  const date = parseDateInput(value);
  if (!date) return fallback;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatDateLong(value, { fallback = "Date TBA" } = {}) {
  const date = parseDateInput(value);
  if (!date) return fallback;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value, { fallback = "Unknown time" } = {}) {
  const date = parseDateInput(value);
  if (!date) return fallback;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toDateInputValue(value) {
  const date = parseDateInput(value);
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

