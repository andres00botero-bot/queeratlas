export function splitLegacyVibe(description = "") {
  const raw = String(description || "");
  const match = raw.match(/^\[Vibe:\s*([^\]]+)\]\s*(?:\n\n)?([\s\S]*)$/i);
  if (!match) {
    return {
      vibe: "",
      description: raw,
    };
  }

  return {
    vibe: String(match[1] || "").trim(),
    description: String(match[2] || "").trim(),
  };
}

export function mergeVibeIntoDescription(vibe = "", description = "") {
  const cleanVibe = String(vibe || "").trim();
  const cleanDescription = String(description || "").trim();
  if (!cleanVibe) return cleanDescription || null;
  return `[Vibe: ${cleanVibe}]${cleanDescription ? `\n\n${cleanDescription}` : ""}`;
}

export function normalizeIsoDate(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const iso = raw.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;

  const yearFirst = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (yearFirst) {
    const y = Number(yearFirst[1]);
    const m = Number(yearFirst[2]);
    const d = Number(yearFirst[3]);
    if (y >= 1900 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }

  const slashYearFirst = raw.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (slashYearFirst) {
    const y = Number(slashYearFirst[1]);
    const m = Number(slashYearFirst[2]);
    const d = Number(slashYearFirst[3]);
    if (y >= 1900 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
  }

  return "";
}

export function normalizeEventRange(event = {}) {
  const startDate = normalizeIsoDate(event.startDate || event.start_date || event.date);
  const endDateRaw = normalizeIsoDate(event.endDate || event.end_date || event.date);
  const endDate = endDateRaw && endDateRaw >= startDate ? endDateRaw : startDate;

  return {
    ...event,
    startDate,
    endDate,
    // Backward-compatible key still used in some views/components.
    date: startDate,
  };
}
