import { normalizeCityKey } from "@/features/city/checkinFeature";

export const SERVICE_PRICE_TIER_OPTIONS = ["", "$", "$$", "$$$", "$$$$"];

export function normalizeServiceImageUrls(input, max = 8) {
  const urls = Array.isArray(input) ? input : [];
  const out = [];
  const seen = new Set();

  for (const rawValue of urls) {
    const value = String(rawValue || "").trim();
    if (!value || !/^https?:\/\//i.test(value)) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
    if (out.length >= max) break;
  }

  return out;
}

export function resolveCityFromPathname(pathname = "") {
  const firstSegment = String(pathname || "")
    .split("?")[0]
    .split("/")
    .filter(Boolean)[0];
  if (!firstSegment) return "";

  try {
    return normalizeCityKey(decodeURIComponent(firstSegment));
  } catch {
    return normalizeCityKey(firstSegment);
  }
}
