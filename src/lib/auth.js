"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getMemberProfile, saveMemberProfile } from "@/lib/memberProfile";
import { captureOperationalError } from "@/lib/monitoring";
import { resolveAdminAccess } from "@/lib/adminAccess";

const AuthContext = createContext(null);
const ALLOWED_POST_LOGIN_PREFIXES = ["/"];
const MEMBER_AVATAR_BUCKET = "member-avatars";
const MAX_MEMBER_AVATAR_BYTES = 5 * 1024 * 1024;

function isFileLikeAvatar(value) {
  return typeof File !== "undefined" && value instanceof File;
}

function safeAvatarPath(userId, fileType = "") {
  const normalizedUserId = String(userId || "").trim();
  const mimeType = String(fileType || "").toLowerCase();
  let ext = "jpg";
  if (mimeType.includes("png")) ext = "png";
  if (mimeType.includes("webp")) ext = "webp";
  if (mimeType.includes("gif")) ext = "gif";
  return `${normalizedUserId}/avatar.${ext}`;
}

function isDataUrl(value) {
  return /^data:/i.test(String(value || ""));
}

function isMissingProfileExtrasColumnError(error) {
  const code = String(error?.code || "").toUpperCase();
  const message = String(error?.message || "").toLowerCase();
  if (code !== "42703" && code !== "PGRST204") return false;
  return (
    message.includes("about") ||
    message.includes("visibility") ||
    message.includes("birthday") ||
    message.includes("vibe") ||
    message.includes("phone") ||
    message.includes("contact_email")
  );
}

function getMemberName(user) {
  if (!user) return "Explorer";

  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "Member"
  );
}

function consumePostLoginTarget() {
  if (typeof window === "undefined") return "";

  const raw = (localStorage.getItem("qa_post_login_target") || "").trim();
  if (!raw) return "";
  localStorage.removeItem("qa_post_login_target");

  if (
    raw === "/favorites" ||
    raw === "/favorites/" ||
    raw.startsWith("/favorites?")
  ) {
    return "/";
  }

  const allowed = ALLOWED_POST_LOGIN_PREFIXES.some(
    (prefix) => raw === prefix || raw.startsWith(`${prefix}?`)
  );

  return allowed ? raw : "/";
}

function clearLocalAuthState() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("qa_redirect");
  localStorage.removeItem("qa_post_login_target");

  try {
    const storageKey = String(supabase?.auth?.storageKey || "").trim();
    if (storageKey) {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}-code-verifier`);
    }
  } catch {
    // Redirect state is still cleared when the auth client is unavailable.
  }
}

function localProfileWithoutAvatar() {
  const local = getMemberProfile();
  return {
    ...local,
    avatarUrl: "",
    avatarPath: "",
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [memberProfile, setMemberProfile] = useState(() => localProfileWithoutAvatar());
  const [isAdminUser, setIsAdminUser] = useState(false);

  const loadRemoteMemberProfile = async (userId) => {
    if (!userId) return localProfileWithoutAvatar();

    const { data, error } = await supabase
      .from("member_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return localProfileWithoutAvatar();
    }

    const avatarPath = String(data.avatar_path || "").trim();
    const fallbackPublicAvatarUrl = avatarPath
      ? supabase.storage.from(MEMBER_AVATAR_BUCKET).getPublicUrl(avatarPath)?.data?.publicUrl || ""
      : "";
    return {
      displayName: data.display_name || "",
      pronouns: data.pronouns || "",
      homeCity: data.home_city || "",
      residentCountry: data.resident_country || "",
      about: data.about || "",
      visibility: ["friends", "members", "public"].includes(String(data.visibility || "members"))
        ? String(data.visibility || "members")
        : "members",
      birthday: data.birthday || "",
      vibe: data.vibe || "",
      phone: data.phone || "",
      contactEmail: data.contact_email || "",
      avatarUrl: data.avatar_url || fallbackPublicAvatarUrl || "",
      avatarPath,
      avatarVersion: Number(data.avatar_version || 1) || 1,
      trustedContributor: Boolean(data.trusted_contributor),
      updatedAt: data.updated_at || "",
    };
  };

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(data.session || null);
        setUser(data.session?.user || null);
        if (data.session?.user?.id) {
          const profile = await loadRemoteMemberProfile(data.session.user.id);
          if (mounted) {
            saveMemberProfile(profile);
            setMemberProfile(profile);
          }
        } else {
          setMemberProfile(localProfileWithoutAvatar());
        }

        if (data.session?.user) {
          const target = consumePostLoginTarget();
          if (target) {
            const current = `${window.location.pathname}${window.location.search}`;
            if (current !== target) {
              window.location.replace(target);
            }
          }
        }
      } catch (error) {
        captureOperationalError("auth_hydration_fail", error, {
          flow: "initial_session",
        });
        if (mounted) {
          setSession(null);
          setUser(null);
          setMemberProfile(localProfileWithoutAvatar());
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    hydrate();

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession || null);
      setUser(nextSession?.user || null);
      if (nextSession?.user?.id) {
        queueMicrotask(async () => {
          const profile = await loadRemoteMemberProfile(nextSession.user.id);
          saveMemberProfile(profile);
          setMemberProfile(profile);
        });
      } else {
        setMemberProfile(localProfileWithoutAvatar());
      }
      setIsLoading(false);

      if (nextSession?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        const target = consumePostLoginTarget();
        if (target) {
          const current = `${window.location.pathname}${window.location.search}`;
          if (current !== target) {
            window.location.replace(target);
          }
        }
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    queueMicrotask(async () => {
      if (!user?.id || !user?.email) {
        if (active) setIsAdminUser(false);
        return;
      }

      const access = await resolveAdminAccess({ email: user.email });
      if (!active) return;
      setIsAdminUser(Boolean(access?.isAdmin));
    });

    return () => {
      active = false;
    };
  }, [user?.email, user?.id]);

  useEffect(() => {
    let active = true;
    if (!isAdminUser || !user?.id) return () => { active = false; };

    queueMicrotask(async () => {
      const currentDisplay = String(memberProfile?.displayName || "").trim();
      if (currentDisplay === "Admin") return;
      const { error } = await supabase
        .from("member_profiles")
        .upsert(
          {
            user_id: user.id,
            display_name: "Admin",
          },
          { onConflict: "user_id" }
        );

      if (!active || error) return;
      const remoteProfile = await loadRemoteMemberProfile(user.id);
      if (!active) return;
      saveMemberProfile(remoteProfile);
      setMemberProfile(remoteProfile);
    });

    return () => {
      active = false;
    };
  }, [isAdminUser, memberProfile?.displayName, user?.id]);

  const value = useMemo(() => {
    const effectiveMemberProfile = isAdminUser
      ? { ...(memberProfile || {}), displayName: "Admin" }
      : memberProfile;
    const computedMemberName = isAdminUser
      ? "Admin"
      : effectiveMemberProfile.displayName || getMemberName(user);

    const signInWithGoogle = async () => {
      try {
        const result = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: window.location.origin },
        });
        if (result?.error) {
          captureOperationalError("login_fail", result.error, {
            provider: "google",
            flow: "oauth",
          });
        }
        return result;
      } catch (error) {
        captureOperationalError("login_fail", error, {
          provider: "google",
          flow: "oauth",
        });
        return { data: null, error };
      }
    };

    const signInWithEmail = async (email) => {
      try {
        const result = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin },
        });
        if (result?.error) {
          captureOperationalError("login_fail", result.error, {
            provider: "email",
            flow: "otp",
          });
        }
        return result;
      } catch (error) {
        captureOperationalError("login_fail", error, {
          provider: "email",
          flow: "otp",
        });
        return { data: null, error };
      }
    };

    const signInWithPassword = async (email, password, options = {}) => {
      try {
        const result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (result?.error && !options?.silent) {
          captureOperationalError("login_fail", result.error, {
            provider: "email",
            flow: "password_sign_in",
          });
        }
        return result;
      } catch (error) {
        if (!options?.silent) {
          captureOperationalError("login_fail", error, {
            provider: "email",
            flow: "password_sign_in",
          });
        }
        return { data: null, error };
      }
    };

    const signUpWithPassword = async (email, password) => {
      try {
        const result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (result?.error) {
          captureOperationalError("login_fail", result.error, {
            provider: "email",
            flow: "password_sign_up",
          });
        }
        return result;
      } catch (error) {
        captureOperationalError("login_fail", error, {
          provider: "email",
          flow: "password_sign_up",
        });
        return { data: null, error };
      }
    };

    const resetPasswordForEmail = async (email) => {
      try {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const result = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: origin ? `${origin}/` : undefined,
        });
        if (result?.error) {
          captureOperationalError("password_reset_request_fail", result.error, {
            provider: "email",
            flow: "password_reset_request",
          });
        }
        return result;
      } catch (error) {
        captureOperationalError("password_reset_request_fail", error, {
          provider: "email",
          flow: "password_reset_request",
        });
        return { data: null, error };
      }
    };

    const updatePassword = async (password) => {
      try {
        const result = await supabase.auth.updateUser({
          password,
        });
        if (result?.error) {
          captureOperationalError("password_update_fail", result.error, {
            provider: "email",
            flow: "password_update",
          });
        }
        return result;
      } catch (error) {
        captureOperationalError("password_update_fail", error, {
          provider: "email",
          flow: "password_update",
        });
        return { data: null, error };
      }
    };

    const signOut = async () => {
      clearLocalAuthState();

      try {
        const result = await supabase.auth.signOut({ scope: "local" });
        if (result?.error) {
          captureOperationalError("logout_fail", result.error, {
            flow: "signout",
            recoveredLocally: true,
          });
          clearLocalAuthState();
        }

        setSession(null);
        setUser(null);
        setIsAdminUser(false);
        setMemberProfile(localProfileWithoutAvatar());

        return {
          error: null,
          recoveredLocally: Boolean(result?.error),
        };
      } catch (error) {
        captureOperationalError("logout_fail", error, {
          flow: "signout",
          recoveredLocally: true,
        });
        clearLocalAuthState();
        setSession(null);
        setUser(null);
        setIsAdminUser(false);
        setMemberProfile(localProfileWithoutAvatar());
        return { error: null, recoveredLocally: true };
      }
    };

    return {
      session,
      user,
      isLoading,
      isMember: Boolean(user),
      memberName: computedMemberName,
      memberProfile: effectiveMemberProfile,
      updateMemberProfile: async (nextProfile) => {
        saveMemberProfile(nextProfile);
        const localProfile = getMemberProfile();
        setMemberProfile(localProfile);

        if (!user?.id) return { ok: false };

        const fullPayload = {
          user_id: user.id,
          display_name: isAdminUser ? "Admin" : (localProfile.displayName || null),
          pronouns: localProfile.pronouns || null,
          home_city: localProfile.homeCity || null,
          resident_country: localProfile.residentCountry || null,
          about: localProfile.about || null,
          visibility: ["friends", "members", "public"].includes(String(localProfile.visibility || "members"))
            ? String(localProfile.visibility || "members")
            : "members",
          birthday: localProfile.birthday || null,
          vibe: localProfile.vibe || null,
          phone: localProfile.phone || null,
          contact_email: localProfile.contactEmail || null,
          avatar_url: isDataUrl(localProfile.avatarUrl) ? null : (localProfile.avatarUrl || null),
          avatar_path: localProfile.avatarPath || null,
        };

        let degradedMissingExtrasColumns = false;
        let { error } = await supabase
          .from("member_profiles")
          .upsert(fullPayload, { onConflict: "user_id" });

        if (error && isMissingProfileExtrasColumnError(error)) {
          degradedMissingExtrasColumns = true;
          const legacyPayload = {
            user_id: user.id,
            display_name: isAdminUser ? "Admin" : (localProfile.displayName || null),
            pronouns: localProfile.pronouns || null,
            home_city: localProfile.homeCity || null,
            resident_country: localProfile.residentCountry || null,
            avatar_url: isDataUrl(localProfile.avatarUrl) ? null : (localProfile.avatarUrl || null),
            avatar_path: localProfile.avatarPath || null,
          };
          const retryRes = await supabase.from("member_profiles").upsert(legacyPayload, { onConflict: "user_id" });
          error = retryRes.error || null;
        }

        if (error) {
          return { ok: false, error };
        }

        const remoteProfile = await loadRemoteMemberProfile(user.id);
        saveMemberProfile(remoteProfile);
        setMemberProfile(remoteProfile);
        return { ok: !degradedMissingExtrasColumns, degradedMissingExtrasColumns };
      },
      updateMemberAvatar: async (avatarInput) => {
        const localSnapshot = getMemberProfile();
        const isFileInput = isFileLikeAvatar(avatarInput);
        const normalizedAvatar = isFileInput ? "" : String(avatarInput || "").trim();

        let uploadedAvatarUrl = normalizedAvatar;
        let uploadedAvatarPath = "";

        if (isFileInput) {
          const avatarFile = avatarInput;
          if (!String(avatarFile?.type || "").startsWith("image/")) {
            return { ok: false, error: new Error("invalid_avatar_file_type") };
          }
          if (Number(avatarFile?.size || 0) > MAX_MEMBER_AVATAR_BYTES) {
            return { ok: false, error: new Error("avatar_file_too_large") };
          }
          if (!user?.id) return { ok: false };

          const path = safeAvatarPath(user.id, avatarFile.type);
          const uploadRes = await supabase.storage
            .from(MEMBER_AVATAR_BUCKET)
            .upload(path, avatarFile, {
              upsert: true,
              cacheControl: "3600",
              contentType: avatarFile.type || "image/jpeg",
            });

          if (uploadRes.error) {
            return { ok: false, error: uploadRes.error };
          }

          uploadedAvatarPath = path;
          uploadedAvatarUrl =
            supabase.storage.from(MEMBER_AVATAR_BUCKET).getPublicUrl(path)?.data?.publicUrl || "";
          if (!uploadedAvatarUrl) {
            return { ok: false, error: new Error("avatar_public_url_unavailable") };
          }
        }

        if (!user?.id) return { ok: false };

        const payload = {
          user_id: user.id,
          avatar_url: uploadedAvatarUrl || null,
          avatar_path: uploadedAvatarPath || localSnapshot.avatarPath || null,
        };
        if (isAdminUser) {
          payload.display_name = "Admin";
        }

        const { error } = await supabase
          .from("member_profiles")
          .upsert(payload, { onConflict: "user_id" });

        if (error) {
          return { ok: false, error };
        }

        const remoteProfile = await loadRemoteMemberProfile(user.id);
        saveMemberProfile(remoteProfile);
        setMemberProfile(remoteProfile);
        return { ok: true, avatarUrl: remoteProfile?.avatarUrl || uploadedAvatarUrl || "" };
      },
      signInWithGoogle,
      signInWithEmail,
      signInWithPassword,
      signUpWithPassword,
      resetPasswordForEmail,
      updatePassword,
      signOut,
    };
  }, [isAdminUser, isLoading, memberProfile, session, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
