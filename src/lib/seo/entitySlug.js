import { cityPath } from "@/lib/cityRouting";
import { normalizeCityKey } from "@/features/city/checkinFeature";

export function slugifyEntityName(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildEntitySlug(name = "", id = "") {
  const nameSlug = slugifyEntityName(name) || "venue";
  const normalizedId = String(id || "").trim();
  if (!normalizedId) return nameSlug;
  return `${nameSlug}--${normalizedId}`;
}

export function parseEntitySlug(slug = "") {
  const raw = String(slug || "").trim();
  if (!raw) return { nameSlug: "", id: "" };
  const dividerIndex = raw.lastIndexOf("--");
  if (dividerIndex === -1) return { nameSlug: raw, id: "" };
  return {
    nameSlug: raw.slice(0, dividerIndex).trim(),
    id: raw.slice(dividerIndex + 2).trim(),
  };
}

export function normalizeCitySlug(value = "") {
  return normalizeCityKey(String(value || ""));
}

export function buildVenuePath(city = "", place = {}) {
  const normalizedCity = normalizeCitySlug(city || place?.city || "");
  const basePath = cityPath(normalizedCity, "");
  const slug = buildEntitySlug(place?.name, place?.id);
  if (!basePath || !slug) return "/cities";
  return `${basePath}/venues/${slug}`;
}

export function placeMatchesSlug(place = {}, slug = "") {
  const { nameSlug, id } = parseEntitySlug(slug);
  if (!nameSlug && !id) return false;

  if (id && String(place?.id || "") === id) {
    return true;
  }

  const placeNameSlug = slugifyEntityName(place?.name || "");
  return Boolean(placeNameSlug && nameSlug && placeNameSlug === nameSlug);
}

export function buildEventPath(city = "", event = {}) {
  const normalizedCity = normalizeCitySlug(city || event?.city || "");
  const basePath = cityPath(normalizedCity, "");
  const slug = buildEntitySlug(event?.name, event?.id);
  if (!basePath || !slug) return "/cities";
  return `${basePath}/events/${slug}`;
}

export function eventMatchesSlug(event = {}, slug = "") {
  const { nameSlug, id } = parseEntitySlug(slug);
  if (!nameSlug && !id) return false;

  if (id && String(event?.id || "") === id) {
    return true;
  }

  const eventNameSlug = slugifyEntityName(event?.name || "");
  return Boolean(eventNameSlug && nameSlug && eventNameSlug === nameSlug);
}
