import { normalizeEventRange, normalizeIsoDate } from "@/features/events/eventFormatUtils";

export function formatDateLabel(value) {
  if (!value) return "Date TBA";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatEventDateLabel(event = {}) {
  const normalized = normalizeEventRange(event);
  if (!normalized.startDate) return "Date TBA";
  if (!normalized.endDate || normalized.endDate === normalized.startDate) {
    return formatDateLabel(normalized.startDate);
  }

  const start = new Date(normalized.startDate);
  const end = new Date(normalized.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return formatDateLabel(normalized.startDate);
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

export function eventOverlapsDate(event = {}, targetDate = "") {
  const normalized = normalizeEventRange(event);
  const date = normalizeIsoDate(targetDate);
  if (!normalized.startDate || !date) return false;
  return date >= normalized.startDate && date <= (normalized.endDate || normalized.startDate);
}

export function eventOverlapsMonth(event = {}, year, month) {
  const normalized = normalizeEventRange(event);
  if (!normalized.startDate) return false;
  const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const monthEnd = `${year}-${String(month + 1).padStart(2, "0")}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, "0")}`;
  const end = normalized.endDate || normalized.startDate;
  return normalized.startDate <= monthEnd && end >= monthStart;
}

export function formatCityLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) return "City";
  if (raw.toLowerCase() === "global") return "Global";

  return raw
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function normalizeCityKey(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "other";
  return raw.replace(/[\s-]+/g, "_");
}
