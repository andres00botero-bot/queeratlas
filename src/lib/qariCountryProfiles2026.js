import countryProfilesSnapshot from "./qariCountryProfiles2026.json" with { type: "json" };
import { normalizeQariProfile } from "./qari.js";
import { QARI_PILOT_PROFILES } from "./qariPilotProfiles.js";
import { QARI_CURRENT_SITUATION_PROFILES } from "./qariCurrentSituationProfiles.js";

export const QARI_GENERATED_COUNTRY_PROFILES = Object.freeze(
  countryProfilesSnapshot.profiles.map((profile) => normalizeQariProfile(profile)).filter(Boolean),
);

export const QARI_COUNTRY_PROFILES = Object.freeze([
  ...new Map([
    ...QARI_GENERATED_COUNTRY_PROFILES,
    ...QARI_PILOT_PROFILES,
    ...QARI_CURRENT_SITUATION_PROFILES,
  ].map((profile) => [profile.destinationKey, profile])).values(),
]);

export function getQariProfileForCountry(country = "") {
  const normalized = String(country || "").trim().toLowerCase();
  return QARI_COUNTRY_PROFILES.find((profile) => profile.country.toLowerCase() === normalized) || null;
}
