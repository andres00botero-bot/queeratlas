"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Bookmark, MapPinned, MessageCircle, X } from "lucide-react";

const MEMBER_BENEFITS = [
  { label: "Save & plan", icon: Bookmark },
  { label: "Ask locals", icon: MessageCircle },
  { label: "Shape the atlas", icon: MapPinned },
];

function evaluatePasswordStrength(password) {
  const value = String(password || "");
  return {
    minLength: value.length >= 6,
    uppercase: /[A-Z]/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
  };
}

function isPasswordStrong(password) {
  const checks = evaluatePasswordStrength(password);
  return checks.minLength && checks.uppercase && checks.symbol;
}

export default function HomeAuthModal({
  showSignup,
  setShowSignup,
  authMode,
  setAuthMode,
  authMessage,
  setAuthMessage,
  authLoading,
  setAuthLoading,
  emailInput,
  setEmailInput,
  passwordInput,
  setPasswordInput,
  showSigninPassword,
  setShowSigninPassword,
  pendingEmailConfirmation,
  setPendingEmailConfirmation,
  resetPasswordInput,
  setResetPasswordInput,
  resetPasswordConfirmInput,
  setResetPasswordConfirmInput,
  showSignupPassword,
  setShowSignupPassword,
  showSignupConfirmPassword,
  setShowSignupConfirmPassword,
  showResetPassword,
  setShowResetPassword,
  showResetConfirmPassword,
  setShowResetConfirmPassword,
  signupForm,
  setSignupForm,
  signInWithGoogle,
  signInWithEmail,
  signInWithPassword,
  signUpWithPassword,
  resetPasswordForEmail,
  updatePassword,
  updateMemberProfile,
  trackKpiEvent,
  writeLocalValue,
  postLoginTarget = "/",
  pendingSignupProfileKey,
}) {
  const dialogRef = useRef(null);
  const needsEmailConfirmation =
    Boolean(pendingEmailConfirmation) || authMessage.toLowerCase().includes("confirm your email");
  const isPasswordResetNotice = authMessage.toLowerCase().includes("password reset email sent");
  const signupPasswordChecks = evaluatePasswordStrength(signupForm.password);
  const safePostLoginTarget = String(postLoginTarget || "/").startsWith("/")
    ? String(postLoginTarget || "/")
    : "/";
  const modalHeading = authMode === "reset"
    ? "Choose a new password."
    : authMode === "signin"
      ? "Welcome back."
      : "Make the atlas yours.";
  const modalDescription = authMode === "signin"
    ? "Pick up your saved places, plans, and community."
    : authMode === "reset"
      ? "Set a secure password, then return to your Atlas."
      : "Save places, build trips, ask locals, and help keep the queer map current.";
  const closeModal = useCallback((reason) => {
    trackKpiEvent("home_member_prompt_closed", {
      meta: { reason, mode: authMode },
    });
    setShowSignup(false);
  }, [authMode, setShowSignup, trackKpiEvent]);

  useEffect(() => {
    if (!showSignup || typeof document === "undefined") return undefined;

    const previousActiveElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frameId = window.requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal("escape");
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = [...dialogRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], summary'
      )].filter((element) => element.getAttribute("aria-hidden") !== "true");
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frameId);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousActiveElement instanceof HTMLElement) previousActiveElement.focus();
    };
  }, [closeModal, showSignup]);

  if (!showSignup) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 sm:px-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={() => closeModal("backdrop")}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-auth-heading"
        aria-describedby="home-auth-description"
        tabIndex={-1}
        className="relative max-h-[calc(100svh-2rem)] w-full max-w-lg overflow-y-auto rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(21,21,21,0.97),rgba(10,10,10,0.99))] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.55)] outline-none sm:rounded-[32px] sm:p-8"
      >
        <div className="pointer-events-none absolute left-0 top-0 h-40 w-40 rounded-full bg-rose-400/12 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

        <button
          type="button"
          aria-label="Close member access"
          onClick={() => closeModal("close_button")}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-black/25 text-white/58 transition hover:border-white/24 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
        >
          <X size={16} aria-hidden="true" />
        </button>

        <div className="relative">
          <p className="text-xs uppercase tracking-[0.28em] text-white/40">
            Free member access
          </p>
          <h2 id="home-auth-heading" className="mt-3 pr-9 text-3xl font-semibold text-white">
            {modalHeading}
          </h2>
          <p id="home-auth-description" className="mt-3 text-sm leading-6 text-white/62">
            {modalDescription}
          </p>

          {authMode !== "reset" ? (
            <div className="mt-4 grid grid-cols-3 gap-2" aria-label="Member benefits">
              {MEMBER_BENEFITS.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div key={benefit.label} className="flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/9 bg-white/[0.04] px-2 py-2 text-center">
                    <Icon size={15} strokeWidth={1.8} className="text-cyan-100/70" aria-hidden="true" />
                    <span className="text-[9px] font-medium leading-3 text-white/58 sm:text-[10px]">{benefit.label}</span>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div role="tablist" aria-label="Member access mode" className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/30 p-1.5">
            <button
              type="button"
              role="tab"
              aria-selected={authMode === "signin"}
              onClick={() => {
                trackKpiEvent("home_member_mode_selected", { meta: { mode: "signin" } });
                setAuthMode("signin");
                setAuthMessage("");
                setResetPasswordInput("");
                setResetPasswordConfirmInput("");
              }}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                authMode === "signin" ? "bg-white text-black" : "bg-transparent text-white/70 hover:text-white"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authMode === "signup"}
              onClick={() => {
                trackKpiEvent("home_member_mode_selected", { meta: { mode: "signup" } });
                setAuthMode("signup");
                setAuthMessage("");
                setResetPasswordInput("");
                setResetPasswordConfirmInput("");
              }}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                authMode === "signup" ? "bg-white text-black" : "bg-transparent text-white/70 hover:text-white"
              }`}
            >
              Create account
            </button>
          </div>

          {authMode === "signin" ? (
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={async () => {
                  setAuthMessage("");
                  setAuthLoading(true);
                  writeLocalValue("qa_post_login_target", safePostLoginTarget);
                  const { error } = await signInWithGoogle();
                  if (error) setAuthMessage(error.message);
                  setAuthLoading(false);
                }}
                disabled={authLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-white via-rose-100 to-orange-100 py-3 font-semibold text-black transition hover:opacity-95"
              >
                {authLoading ? "Opening..." : "Continue with Google"}
              </button>
              <p className="px-1 text-xs leading-5 text-white/60">
                Google sign-in only uses basic account identity (openid, email, profile).{" "}
                <Link href="/privacy" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                  Privacy Policy
                </Link>
                .
              </p>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <input
                  type="email"
                  aria-label="Email address"
                  autoComplete="email"
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  placeholder="you@email.com"
                  className="mb-2 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                />
                <div className="mb-2 flex gap-2">
                  <input
                    aria-label="Password"
                    autoComplete="current-password"
                    value={passwordInput}
                    onChange={(event) => setPasswordInput(event.target.value)}
                    type={showSigninPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                  />
                  <button
                    type="button"
                    aria-label={showSigninPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowSigninPassword((current) => !current)}
                    className="rounded-xl border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-white/24 hover:text-white"
                  >
                    {showSigninPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!emailInput.trim() || !passwordInput.trim()) {
                      setAuthMessage("Enter both email and password.");
                      return;
                    }

                    setAuthMessage("");
                    setAuthLoading(true);
                    writeLocalValue("qa_post_login_target", safePostLoginTarget);
                    const { error } = await signInWithPassword(emailInput.trim(), passwordInput);
                    if (error) {
                      setAuthMessage(error.message);
                    } else {
                      setAuthMessage("Signed in. Redirecting...");
                      trackKpiEvent("login_completed", {
                        memberKey: emailInput.trim().toLowerCase(),
                      });
                    }
                    setAuthLoading(false);
                  }}
                  disabled={authLoading}
                  className="w-full rounded-xl border border-white/15 bg-white/10 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  {authLoading ? "Signing in..." : "Sign in with email + password"}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (!emailInput.trim()) {
                      setAuthMessage("Enter your email to receive a magic link.");
                      return;
                    }

                    setAuthMessage("");
                    setAuthLoading(true);
                    writeLocalValue("qa_post_login_target", safePostLoginTarget);
                    const { error } = await signInWithEmail(emailInput.trim());
                    if (error) {
                      setAuthMessage(error.message);
                    } else {
                      setAuthMessage("Magic link sent. Check your inbox.");
                    }
                    setAuthLoading(false);
                  }}
                  disabled={authLoading}
                  className="mt-2 w-full rounded-xl border border-white/12 bg-black/20 py-2 text-xs font-semibold tracking-[0.08em] text-white/75 transition hover:border-white/24 hover:text-white"
                >
                  {authLoading ? "Sending..." : "Send magic link instead"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!emailInput.trim()) {
                      setAuthMessage("Enter your email first, then request password reset.");
                      return;
                    }
                    setAuthMessage("");
                    setAuthLoading(true);
                    const { error } = await resetPasswordForEmail(emailInput.trim());
                    if (error) {
                      setAuthMessage(error.message || "Could not send password reset email.");
                    } else {
                      setAuthMessage("Password reset email sent. Open the link, then set your new password.");
                    }
                    setAuthLoading(false);
                  }}
                  disabled={authLoading}
                  className="mt-2 w-full rounded-xl border border-amber-200/26 bg-amber-200/12 py-2 text-xs font-semibold tracking-[0.08em] text-amber-100 transition hover:border-amber-200/44 hover:bg-amber-200/18 disabled:opacity-70"
                >
                  {authLoading ? "Sending..." : "Forgot password?"}
                </button>
              </div>
            </div>
          ) : authMode === "signup" ? (
            <div className="mt-6 rounded-2xl border border-fuchsia-200/18 bg-[linear-gradient(180deg,rgba(244,114,182,0.08),rgba(0,0,0,0.22))] p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.14em] text-fuchsia-100/85">Build your member identity</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <input aria-label="Display name" autoComplete="nickname" value={signupForm.displayName} onChange={(event) => setSignupForm((current) => ({ ...current, displayName: event.target.value }))} placeholder="Display name" className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30" />
                <input aria-label="Home city, optional" autoComplete="address-level2" value={signupForm.homeCity} onChange={(event) => setSignupForm((current) => ({ ...current, homeCity: event.target.value }))} placeholder="Home city (optional)" className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30" />
                <input type="email" aria-label="Email address" autoComplete="email" value={signupForm.email} onChange={(event) => setSignupForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30 sm:col-span-2" />
                <div className="flex gap-2">
                  <input aria-label="Choose password" autoComplete="new-password" type={showSignupPassword ? "text" : "password"} value={signupForm.password} onChange={(event) => setSignupForm((current) => ({ ...current, password: event.target.value }))} placeholder="Choose password" className="w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30" />
                  <button type="button" aria-label={showSignupPassword ? "Hide chosen password" : "Show chosen password"} onClick={() => setShowSignupPassword((current) => !current)} className="rounded-xl border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-white/24 hover:text-white">{showSignupPassword ? "Hide" : "Show"}</button>
                </div>
                <div className="flex gap-2">
                  <input aria-label="Confirm password" autoComplete="new-password" type={showSignupConfirmPassword ? "text" : "password"} value={signupForm.confirmPassword} onChange={(event) => setSignupForm((current) => ({ ...current, confirmPassword: event.target.value }))} placeholder="Confirm password" className="w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30" />
                  <button type="button" aria-label={showSignupConfirmPassword ? "Hide confirmed password" : "Show confirmed password"} onClick={() => setShowSignupConfirmPassword((current) => !current)} className="rounded-xl border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-white/24 hover:text-white">{showSignupConfirmPassword ? "Hide" : "Show"}</button>
                </div>
              </div>
              <details className="mt-3 rounded-xl border border-white/9 bg-black/20 px-3 py-2.5">
                <summary className="cursor-pointer text-[10px] uppercase tracking-[0.12em] text-white/52">
                  Optional profile details
                </summary>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <input aria-label="Pronouns, optional" autoComplete="off" value={signupForm.pronouns} onChange={(event) => setSignupForm((current) => ({ ...current, pronouns: event.target.value }))} placeholder="Pronouns" className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30" />
                  <input aria-label="Country, optional" autoComplete="country-name" value={signupForm.residentCountry} onChange={(event) => setSignupForm((current) => ({ ...current, residentCountry: event.target.value }))} placeholder="Country" className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30" />
                </div>
              </details>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.08em] text-white/70">
                <span className={`rounded-full border px-2.5 py-1 ${signupPasswordChecks.minLength ? "border-emerald-300/40 bg-emerald-300/14 text-emerald-100" : "border-white/15 bg-white/8 text-white/65"}`}>6+ chars</span>
                <span className={`rounded-full border px-2.5 py-1 ${signupPasswordChecks.uppercase ? "border-emerald-300/40 bg-emerald-300/14 text-emerald-100" : "border-white/15 bg-white/8 text-white/65"}`}>Uppercase</span>
                <span className={`rounded-full border px-2.5 py-1 ${signupPasswordChecks.symbol ? "border-emerald-300/40 bg-emerald-300/14 text-emerald-100" : "border-white/15 bg-white/8 text-white/65"}`}>Symbol</span>
              </div>

              <button
                type="button"
                onClick={async () => {
                  const email = signupForm.email.trim();
                  const password = signupForm.password.trim();
                  const confirmPassword = signupForm.confirmPassword.trim();
                  const profilePayload = {
                    displayName: signupForm.displayName.trim(),
                    pronouns: signupForm.pronouns.trim(),
                    homeCity: signupForm.homeCity.trim(),
                    residentCountry: signupForm.residentCountry.trim(),
                  };

                  if (!profilePayload.displayName || !email || !password) {
                    setAuthMessage("Name, email, and password are required.");
                    return;
                  }
                  if (!isPasswordStrong(password)) {
                    setAuthMessage("Use a stronger password: at least 6 characters, one uppercase letter, and one symbol.");
                    return;
                  }
                  if (password !== confirmPassword) {
                    setAuthMessage("Passwords do not match.");
                    return;
                  }

                  setAuthMessage("");
                  setAuthLoading(true);
                  writeLocalValue("qa_post_login_target", safePostLoginTarget);
                  const { data, error } = await signUpWithPassword(email, password);
                  if (error) {
                    setAuthMessage(error.message);
                    setPendingEmailConfirmation("");
                    setAuthLoading(false);
                    return;
                  }

                  if (data?.session) {
                    setPendingEmailConfirmation("");
                    const result = await updateMemberProfile(profilePayload);
                    if (result?.ok) {
                      setAuthMessage("Account ready. Welcome to Queer Atlas.");
                    } else {
                      setAuthMessage("Account created. Profile can be edited in Your Atlas.");
                    }
                    trackKpiEvent("signup_completed", {
                      memberKey: email.toLowerCase(),
                    });
                  } else {
                    setPendingEmailConfirmation(email);
                    localStorage.setItem(
                      pendingSignupProfileKey,
                      JSON.stringify({ ...profilePayload, email })
                    );
                    setAuthMessage("Account created. Confirm your email to activate your profile.");
                    trackKpiEvent("signup_completed", {
                      memberKey: email.toLowerCase(),
                    });
                  }

                  setSignupForm({ displayName: "", pronouns: "", homeCity: "", residentCountry: "", email: "", password: "", confirmPassword: "" });
                  setAuthLoading(false);
                }}
                disabled={authLoading}
                className="mt-3 w-full rounded-xl border border-fuchsia-200/22 bg-fuchsia-200/12 py-2.5 text-sm font-semibold text-fuchsia-100 transition hover:border-fuchsia-200/38 hover:bg-fuchsia-200/18"
              >
                {authLoading ? "Creating..." : "Create my free account"}
              </button>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-cyan-200/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.09),rgba(0,0,0,0.26))] p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.14em] text-cyan-100/90">Reset password</p>
              <div className="mb-2 flex gap-2">
                <input aria-label="New password" autoComplete="new-password" type={showResetPassword ? "text" : "password"} value={resetPasswordInput} onChange={(event) => setResetPasswordInput(event.target.value)} placeholder="New password" className="w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30" />
                <button type="button" aria-label={showResetPassword ? "Hide new password" : "Show new password"} onClick={() => setShowResetPassword((current) => !current)} className="rounded-xl border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-white/24 hover:text-white">{showResetPassword ? "Hide" : "Show"}</button>
              </div>
              <div className="flex gap-2">
                <input aria-label="Confirm new password" autoComplete="new-password" type={showResetConfirmPassword ? "text" : "password"} value={resetPasswordConfirmInput} onChange={(event) => setResetPasswordConfirmInput(event.target.value)} placeholder="Confirm new password" className="w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30" />
                <button type="button" aria-label={showResetConfirmPassword ? "Hide confirmed new password" : "Show confirmed new password"} onClick={() => setShowResetConfirmPassword((current) => !current)} className="rounded-xl border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-white/24 hover:text-white">{showResetConfirmPassword ? "Hide" : "Show"}</button>
              </div>
              <p className="mt-2 text-[11px] text-white/65">Use at least 6 characters, one uppercase letter, and one symbol.</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!isPasswordStrong(resetPasswordInput)) {
                      setAuthMessage("Use a stronger password: at least 6 characters, one uppercase letter, and one symbol.");
                      return;
                    }
                    if (resetPasswordInput !== resetPasswordConfirmInput) {
                      setAuthMessage("Passwords do not match.");
                      return;
                    }
                    setAuthMessage("");
                    setAuthLoading(true);
                    const { error } = await updatePassword(resetPasswordInput);
                    if (error) {
                      setAuthMessage(error.message || "Could not update password.");
                    } else {
                      setAuthMode("signin");
                      setResetPasswordInput("");
                      setResetPasswordConfirmInput("");
                      setAuthMessage("Password updated. You can sign in now.");
                      if (typeof window !== "undefined" && window.location.hash) {
                        window.history.replaceState({}, "", window.location.pathname + window.location.search);
                      }
                    }
                    setAuthLoading(false);
                  }}
                  disabled={authLoading}
                  className="flex-1 rounded-xl border border-cyan-200/34 bg-cyan-200/16 py-2.5 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/54 hover:bg-cyan-200/24 disabled:opacity-70"
                >
                  {authLoading ? "Updating..." : "Update password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setResetPasswordInput("");
                    setResetPasswordConfirmInput("");
                    setAuthMessage("");
                  }}
                  className="rounded-xl border border-white/12 bg-white/8 px-3 py-2.5 text-xs font-semibold text-white/80 transition hover:border-white/24 hover:text-white"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {authMessage && (
            <div
              role="status"
              aria-live="polite"
              className={`mt-4 rounded-xl border px-3 py-2 text-xs ${
                isPasswordResetNotice
                  ? "animate-pulse border-cyan-300/50 bg-cyan-300/16 text-cyan-100"
                  : needsEmailConfirmation
                  ? "animate-pulse border-amber-300/45 bg-amber-300/15 text-amber-100"
                  : "border-white/10 bg-white/5 text-white/75"
              }`}
            >
              {authMessage}
            </div>
          )}
          {needsEmailConfirmation && (
            <div className="mt-2 rounded-xl border border-amber-200/25 bg-amber-200/10 px-3 py-2 text-[11px] text-amber-100/90">
              <p>Check inbox + spam in 1-2 minutes, then confirm the link.</p>
              {pendingEmailConfirmation && (
                <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-amber-100/80">
                  After confirming the email link, sign in from this screen.
                </p>
              )}
              {pendingEmailConfirmation && (
                <button
                  type="button"
                  onClick={async () => {
                    setAuthLoading(true);
                    const { error } = await signInWithEmail(pendingEmailConfirmation);
                    if (error) {
                      setAuthMessage(error.message);
                    } else {
                      setAuthMessage("New confirmation email sent. Check inbox + spam.");
                    }
                    setAuthLoading(false);
                  }}
                  disabled={authLoading}
                  className="mt-2 rounded-full border border-amber-100/35 bg-amber-100/15 px-3 py-1 text-[10px] font-semibold tracking-[0.08em] text-amber-50 transition hover:bg-amber-100/22 disabled:opacity-70"
                >
                  {authLoading ? "Sending..." : "Resend confirmation"}
                </button>
              )}
            </div>
          )}

          <p className="mt-5 text-xs leading-6 text-white/36">
            By signing in or creating an account, you agree to our{" "}
            <Link href="/terms" className="text-white/70 underline underline-offset-2 transition hover:text-white">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-white/70 underline underline-offset-2 transition hover:text-white">
              Privacy Policy
            </Link>
            .
          </p>

          <button
            type="button"
            onClick={() => closeModal("maybe_later")}
            className="mt-4 text-sm text-white/46 transition hover:text-white/75"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
