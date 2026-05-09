const PROFILE_KEY = "qa_member_profile";

const defaultProfile = {
  displayName: "",
  pronouns: "",
  homeCity: "",
  residentCountry: "",
  about: "",
  visibility: "members",
  birthday: "",
  vibe: "",
  phone: "",
  contactEmail: "",
  avatarUrl: "",
  avatarPath: "",
  avatarVersion: 1,
  trustedContributor: false,
  updatedAt: "",
};

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj || {}, key);
}

function pickStringField(profile, current, key) {
  if (hasOwn(profile, key)) {
    return String(profile?.[key] || "").trim();
  }
  return String(current?.[key] || "").trim();
}

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
    about: parsed.about || "",
    visibility: parsed.visibility || "members",
    birthday: parsed.birthday || "",
    vibe: parsed.vibe || "",
    phone: parsed.phone || "",
    contactEmail: parsed.contactEmail || "",
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
  const nextVisibility = hasOwn(profile, "visibility")
    ? String(profile?.visibility || "members")
    : String(current?.visibility || "members");
  const normalized = {
    displayName: pickStringField(profile, current, "displayName"),
    pronouns: pickStringField(profile, current, "pronouns"),
    homeCity: pickStringField(profile, current, "homeCity"),
    residentCountry: pickStringField(profile, current, "residentCountry"),
    about: pickStringField(profile, current, "about"),
    visibility: ["friends", "members", "public"].includes(nextVisibility) ? nextVisibility : "members",
    birthday: pickStringField(profile, current, "birthday"),
    vibe: pickStringField(profile, current, "vibe"),
    phone: pickStringField(profile, current, "phone"),
    contactEmail: pickStringField(profile, current, "contactEmail"),
    avatarUrl: pickStringField(profile, current, "avatarUrl"),
    avatarPath: pickStringField(profile, current, "avatarPath"),
    avatarVersion:
      Number(hasOwn(profile, "avatarVersion") ? profile?.avatarVersion : current?.avatarVersion || 1) || 1,
    trustedContributor:
      typeof profile?.trustedContributor === "boolean"
        ? profile.trustedContributor
        : Boolean(current?.trustedContributor),
    updatedAt: profile?.updatedAt || new Date().toISOString(),
  };
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(normalized));
}
