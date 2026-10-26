import { QARI_PUBLIC_PROFILES } from "./qariPublicProfiles.js";

export function qariCountrySlug(country = "") {
  return String(country || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function qariCountryPath(country = "") {
  const slug = qariCountrySlug(country);
  return slug ? `/qari/${slug}` : "/qari";
}

export function getQariProfileBySlug(slug = "") {
  const normalized = qariCountrySlug(slug);
  return QARI_PUBLIC_PROFILES.find((profile) => qariCountrySlug(profile.country) === normalized) || null;
}
