import { getCityHeroCopy } from "@/features/city/cityHeroCopy";

export const LIVE_VIBE_COOLDOWN_MS = 30 * 1000;

export { getCityHeroCopy };

export function polishGuideText(text, { sectionTitle = "", cityName = "this city", vibe = "" } = {}) {
  const clean = String(text || "").trim();
  if (!clean) return "";
  if (clean.length >= 340) return clean;

  const key = String(sectionTitle).toLowerCase();
  const additions = {
    about: `${cityName} rewards travelers who mix curiosity with intention: start with one iconic lane, then follow community signal into the rooms locals actually return to.`,
    districts: `The best version of ${cityName} is usually route-based, not random: pick one anchor zone, then move out in layers as the energy builds.`,
    safety: `Treat pacing as part of safety, especially on big nights: charged phone, clear route, and one trusted fallback always make the night better.`,
    nightlife: `Use a two-phase flow for stronger nights: social warm-up first, then commit to one room with real pull instead of chasing every option.`,
    cost: `Spend for position and vibe, save on everything else. In ${cityName}, location and timing usually matter more than flashy upgrades.`,
  };

  const generic = `${cityName} has ${vibe || "strong"} queer momentum, and the best experiences usually come from layered choices instead of rushed checklists.`;
  const addition = additions[key] || generic;
  return `${clean} ${addition}`;
}

export function polishVenueDescription(place, cityName = "this city", typeLabels = {}) {
  const existing = String(place?.description || "").trim();
  if (existing.length >= 240) return existing;

  const typeLabel = typeLabels[place?.type] || "venue";
  const vibeText = place?.vibe ? `${place.vibe}` : `distinct ${typeLabel.toLowerCase()} energy`;

  if (!existing) {
    return `${place?.name || "This venue"} is a community-facing ${typeLabel.toLowerCase()} in ${cityName} with ${vibeText}. It works best as a strong stop in your night route, especially when you want social momentum with local signal instead of generic tourist flow.`;
  }

  return `${existing} In ${cityName}, this spot stands out for ${vibeText} and works best when you use it as a deliberate part of your route, not just a random pass-through.`;
}

export function polishEventDescription(event, cityName = "this city") {
  const existing = String(event?.description || "").trim();
  if (existing.length >= 220) return existing;

  if (!existing) {
    return `${event?.name || "This event"} is part of ${cityName}'s live queer pulse and is best treated as a momentum anchor for your night: start social, arrive with intention, and let the crowd chemistry do the rest.`;
  }

  return `${existing} Expect a mixed crowd, strong community energy, and the kind of night that lands best when you arrive early enough to catch the room build.`;
}
