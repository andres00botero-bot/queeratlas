const PROFILE_KEY = "qa_member_profile";

const defaultProfile = {
  displayName: "",
  pronouns: "",
  homeCity: "",
  residentCountry: "",
  avatarUrl: "",
  avatarPath: "",
  avatarVersion: 1,
  trustedContributor: false,
  updatedAt: "",
};

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function getMemberProfile() {
  if (typeof window === "undefined") return defaultProfile;
  const parsed = safeParse(window.localStorage.getItem(PROFILE_KEY), defaultProfile);
  return {
    displayName: parsed.displayName || "",
    pronouns: parsed.pronouns || "",
    homeCity: parsed.homeCity || "",
    residentCountry: parsed.residentCountry || "",
    avatarUrl: parsed.avatarUrl || "",
    avatarPath: parsed.avatarPath || "",
    avatarVersion: Number(parsed.avatarVersion || 1) || 1,
    trustedContributor: Boolean(parsed.trustedContributor),
    updatedAt: parsed.updatedAt || "",
  };
}

export function saveMemberProfile(profile) {
  if (typeof window === "undefined") return;
  const current = safeParse(window.localStorage.getItem(PROFILE_KEY), defaultProfile);
  const normalized = {
    displayName: profile?.displayName?.trim?.() || "",
    pronouns: profile?.pronouns?.trim?.() || "",
    homeCity: profile?.homeCity?.trim?.() || "",
    residentCountry: profile?.residentCountry?.trim?.() || "",
    avatarUrl: String(profile?.avatarUrl || "").trim(),
    avatarPath: String(profile?.avatarPath || "").trim(),
    avatarVersion: Number(profile?.avatarVersion || current?.avatarVersion || 1) || 1,
    trustedContributor:
      typeof profile?.trustedContributor === "boolean"
        ? profile.trustedContributor
        : Boolean(current?.trustedContributor),
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(normalized));
}
