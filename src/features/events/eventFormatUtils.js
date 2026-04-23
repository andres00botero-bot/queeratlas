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
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : "";
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
