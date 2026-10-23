export const PRIVACY_VERSION = 1;
export const PROFILE_AUDIENCES = ["hidden", "contacts", "community"];

export function normalizeSharedProfile(value = {}) {
  const text = (key, limit) => String(value?.[key] || "").trim().slice(0, limit);
  return {
    audience: PROFILE_AUDIENCES.includes(value.audience) ? value.audience : "hidden",
    alias: text("alias", 40),
    bio: text("bio", 160),
    discovery_city: text("discovery_city", 80),
    shared_pronouns: text("shared_pronouns", 40),
    share_city: value.share_city === true,
    share_pronouns: value.share_pronouns === true,
    // Photos require a separate explicit choice, never an OAuth/profile default.
    share_avatar: value.share_avatar === true,
  };
}

export function sharedProfilePreview(value = {}) {
  const profile = normalizeSharedProfile(value);
  return {
    alias: profile.alias,
    bio: profile.bio,
    discovery_city: profile.share_city ? profile.discovery_city : "",
    shared_pronouns: profile.share_pronouns ? profile.shared_pronouns : "",
    share_avatar: profile.share_avatar,
  };
}

export function validSharedAlias(alias = "") {
  const value = String(alias).trim();
  return value.length >= 2 && value.length <= 40 && !/[\u0000-\u001f@]/.test(String(alias));
}
