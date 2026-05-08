"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getMemberProfile, saveMemberProfile } from "@/lib/memberProfile";
import { captureOperationalError } from "@/lib/monitoring";
import { resolveAdminAccess } from "@/lib/adminAccess";

const AuthContext = createContext(null);
const ALLOWED_POST_LOGIN_PREFIXES = ["/"];

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

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [memberProfile, setMemberProfile] = useState(() => getMemberProfile());
  const [isAdminUser, setIsAdminUser] = useState(false);

  const loadRemoteMemberProfile = async (userId) => {
    if (!userId) return getMemberProfile();

    const { data, error } = await supabase
      .from("member_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return getMemberProfile();
    }

    return {
      displayName: data.display_name || "",
      pronouns: data.pronouns || "",
      homeCity: data.home_city || "",
      residentCountry: data.resident_country || "",
      avatarUrl: data.avatar_url || "",
      trustedContributor: Boolean(data.trusted_contributor),
      updatedAt: data.updated_at || "",
    };
  };

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
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
        setMemberProfile(getMemberProfile());
      }
      setIsLoading(false);

      if (data.session?.user) {
        const target = consumePostLoginTarget();
        if (target) {
          const current = `${window.location.pathname}${window.location.search}`;
          if (current !== target) {
            window.location.replace(target);
          }
        }
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
        setMemberProfile(getMemberProfile());
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
      try {
        return await supabase.auth.signOut();
      } catch (error) {
        captureOperationalError("logout_fail", error, {
          flow: "signout",
        });
        return { error };
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

        const { error } = await supabase
          .from("member_profiles")
          .upsert(
            {
              user_id: user.id,
              display_name: isAdminUser ? "Admin" : (localProfile.displayName || null),
              pronouns: localProfile.pronouns || null,
              home_city: localProfile.homeCity || null,
              resident_country: localProfile.residentCountry || null,
              avatar_url: localProfile.avatarUrl || null,
            },
            { onConflict: "user_id" }
          );

        if (error) {
          return { ok: false, error };
        }

        const remoteProfile = await loadRemoteMemberProfile(user.id);
        saveMemberProfile(remoteProfile);
        setMemberProfile(remoteProfile);
        return { ok: true };
      },
      updateMemberAvatar: async (avatarUrl) => {
        const normalizedAvatar = String(avatarUrl || "").trim();
        const nextLocalProfile = {
          ...getMemberProfile(),
          displayName: isAdminUser ? "Admin" : (memberProfile?.displayName || ""),
          avatarUrl: normalizedAvatar,
        };
        saveMemberProfile(nextLocalProfile);
        setMemberProfile(nextLocalProfile);

        if (!user?.id) return { ok: false };

        const payload = {
          user_id: user.id,
          avatar_url: normalizedAvatar || null,
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
        return { ok: true };
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
