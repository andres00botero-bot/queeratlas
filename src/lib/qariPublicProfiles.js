import { QARI_COUNTRY_PROFILES } from "./qariCountryProfiles2026.js";
import { QARI_V2_PUBLISHED_PROFILES } from "./qariV2PilotProfiles.js";

// QARI 2.0 replaces a 1.x profile only after it has passed the release gate.
export const QARI_PUBLIC_PROFILES = Object.freeze([
  ...new Map([
    ...QARI_COUNTRY_PROFILES,
    ...QARI_V2_PUBLISHED_PROFILES,
  ].map((profile) => [profile.destinationKey, profile])).values(),
]);

export function getPublicQariProfileForCountry(country = "") {
  const normalized = String(country || "").trim().toLowerCase();
  return QARI_PUBLIC_PROFILES.find((profile) => profile.country.toLowerCase() === normalized) || null;
}
