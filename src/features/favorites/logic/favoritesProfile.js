export function hasProfileSeedData(profile) {
  return Boolean(
    profile &&
      (profile.displayName || profile.pronouns || profile.homeCity || profile.residentCountry)
  );
}

export function selectStoredProfile({ memberProfile, fallbackProfile }) {
  return hasProfileSeedData(memberProfile) ? memberProfile : fallbackProfile;
}

export function buildProfileFormState({
  storedProfile = {},
  authMemberName = "",
  fallbackName = "",
}) {
  return {
    displayName: storedProfile.displayName || authMemberName || fallbackName,
    pronouns: storedProfile.pronouns || "",
    homeCity: storedProfile.homeCity || "",
    residentCountry: storedProfile.residentCountry || "",
  };
}

export function hasProfileFormChanges(profileForm = {}, memberProfile = {}) {
  return (
    String(profileForm.displayName || "").trim() !== String(memberProfile.displayName || "").trim() ||
    String(profileForm.pronouns || "").trim() !== String(memberProfile.pronouns || "").trim() ||
    String(profileForm.homeCity || "").trim() !== String(memberProfile.homeCity || "").trim() ||
    String(profileForm.residentCountry || "").trim() !==
      String(memberProfile.residentCountry || "").trim()
  );
}

export function resolveGreetingByHour(hour = new Date().getHours()) {
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

export function resolveMemberDisplayName(memberName = "") {
  return String(memberName || "").trim() || "Explorer";
}
