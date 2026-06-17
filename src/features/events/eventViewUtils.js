import { normalizeEventRange, splitLegacyVibe } from "@/features/events/eventFormatUtils";
import { inferVibeTagsFromLegacyVibe, normalizeVibeTags } from "@/lib/vibeTaxonomy";

export function qualityPillClass(tone) {
  if (tone === "verified") {
    return "border-emerald-200/24 bg-emerald-200/12 text-emerald-100";
  }

  if (tone === "stale") {
    return "border-amber-200/24 bg-amber-200/12 text-amber-100";
  }

  if (tone === "community") {
    return "border-cyan-200/24 bg-cyan-200/12 text-cyan-100";
  }

  return "border-white/16 bg-white/7 text-white/70";
}

export function mapGlobalEventRow(row) {
  const parsed = splitLegacyVibe(row.description || "");
  const vibeValue = String(row.vibe || parsed.vibe || "").trim();
  const vibeTags = normalizeVibeTags(
    Array.isArray(row?.vibe_tags) && row.vibe_tags.length > 0
      ? row.vibe_tags
      : inferVibeTagsFromLegacyVibe(vibeValue),
    { max: 3 }
  );
  return normalizeEventRange({
    id: String(row.id),
    name: row.name || "",
    date: row.start_date || row.date || "",
    start_date: row.start_date || row.date || "",
    end_date: row.end_date || row.start_date || row.date || "",
    location: row.location || "",
    vibe: vibeValue,
    vibe_tags: vibeTags,
    description: parsed.description || "",
    link: row.link || "",
    ticket_url: row.ticket_url || "",
    source: row.source || "",
    lastChecked: row.last_checked || "",
    city: "Global",
    isGlobal: true,
  });
}
