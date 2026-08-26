"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Eye, EyeOff, X } from "lucide-react";

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-[18px] w-[18px]" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.715v2.258h2.909c1.702-1.567 2.684-3.876 2.684-6.614Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.181l-2.91-2.258c-.805.54-1.835.859-3.046.859-2.344 0-4.328-1.585-5.037-3.714H.956v2.332A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.963 10.706A5.412 5.412 0 0 1 3.682 9c0-.592.102-1.168.281-1.706V4.962H.956A9 9 0 0 0 0 9c0 1.452.347 2.827.956 4.038l3.007-2.332Z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.507.454 3.441 1.346l2.581-2.581C13.463.892 11.426 0 9 0A9 9 0 0 0 .956 4.962l3.007 2.332C4.672 5.165 6.656 3.58 9 3.58Z" />
    </svg>
  );
}

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
      : "Join Queer Atlas.";
  const modalDescription = authMode === "signin"
    ? "Sign in to continue to your saved places and community contributions."
    : authMode === "reset"
      ? "Set a secure password, then return to your Atlas."
      : "Add places and events, write reviews, and share local updates that help our community travel with more confidence.";
  const closeModal = useCallback((reason) => {
    trackKpiEvent("home_member_prompt_closed", {
      meta: { reason, mode: authMode },
    });
    setShowSignup(false);
  }, [authMode, setShowSignup, trackKpiEvent]);

  const handleGoogleAuth = async () => {
    setAuthMessage("");
    setAuthLoading(true);
    writeLocalValue("qa_post_login_target", safePostLoginTarget);
    const { error } = await signInWithGoogle();
    if (error) setAuthMessage(error.message);
    setAuthLoading(false);
  };

  const handlePasswordSignIn = async (event) => {
    event.preventDefault();
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
      trackKpiEvent("login_completed", { memberKey: emailInput.trim().toLowerCase() });
    }
    setAuthLoading(false);
  };

  const handleMagicLink = async () => {
    if (!emailInput.trim()) {
      setAuthMessage("Enter your email to receive a sign-in link.");
      return;
    }

    setAuthMessage("");
    setAuthLoading(true);
    writeLocalValue("qa_post_login_target", safePostLoginTarget);
    const { error } = await signInWithEmail(emailInput.trim());
    setAuthMessage(error ? error.message : "Sign-in link sent. Check your inbox.");
    setAuthLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!emailInput.trim()) {
      setAuthMessage("Enter your email first, then request a password reset.");
      return;
    }

    setAuthMessage("");
    setAuthLoading(true);
    const { error } = await resetPasswordForEmail(emailInput.trim());
    setAuthMessage(error ? (error.message || "Could not send password reset email.") : "Password reset email sent. Open the link, then set your new password.");
    setAuthLoading(false);
  };

  const handleCreateAccount = async (event) => {
    event.preventDefault();
    const email = signupForm.email.trim();
    const password = signupForm.password.trim();
    const profilePayload = {
      displayName: signupForm.displayName.trim(),
      pronouns: signupForm.pronouns.trim(),
      homeCity: signupForm.homeCity.trim(),
      residentCountry: signupForm.residentCountry.trim(),
    };

    if (!profilePayload.displayName || !email || !password) {
      setAuthMessage("Display name, email, and password are required.");
      return;
    }
    if (!isPasswordStrong(password)) {
      setAuthMessage("Use at least 6 characters, including one uppercase letter and one symbol.");
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
      setAuthMessage(result?.ok ? "Account ready. Welcome to Queer Atlas." : "Account created. Add more profile details in Your Atlas.");
      trackKpiEvent("signup_completed", { memberKey: email.toLowerCase() });
    } else {
      setPendingEmailConfirmation(email);
      localStorage.setItem(pendingSignupProfileKey, JSON.stringify({ ...profilePayload, email }));
      setAuthMessage("Account created. Confirm your email to activate your profile.");
      trackKpiEvent("signup_completed", { memberKey: email.toLowerCase() });
    }

    setSignupForm({ displayName: "", pronouns: "", homeCity: "", residentCountry: "", email: "", password: "", confirmPassword: "" });
    setAuthLoading(false);
  };

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
        className="relative max-h-[calc(100svh-2rem)] w-full max-w-md overflow-y-auto rounded-[28px] border border-white/12 bg-[radial-gradient(circle_at_10%_0%,rgba(244,114,182,0.12),transparent_30%),radial-gradient(circle_at_95%_100%,rgba(34,211,238,0.1),transparent_34%),linear-gradient(165deg,rgba(28,19,31,0.985),rgba(10,13,20,0.995)_58%)] p-5 shadow-[0_34px_120px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.08)] outline-none sm:rounded-[32px] sm:p-7"
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100/62">
            {authMode === "signup" ? "Free membership" : authMode === "signin" ? "Member access" : "Account security"}
          </p>
          <h2 id="home-auth-heading" className="qa-display mt-2 pr-9 text-[2rem] font-semibold tracking-[-0.035em] text-white">
            {modalHeading}
          </h2>
          <p id="home-auth-description" className="mt-2 max-w-[42ch] text-sm leading-[1.55] text-white/64">
            {modalDescription}
          </p>

          <div role="tablist" aria-label="Member access mode" className={`mt-5 grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-black/28 p-1 ${authMode === "reset" ? "hidden" : ""}`}>
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
              className={`min-h-10 rounded-xl px-3 text-sm font-semibold transition ${
                authMode === "signup" ? "bg-[linear-gradient(110deg,#ffd6e7,#ddd6fe)] text-[#2b162d] shadow-[0_8px_22px_rgba(244,114,182,0.14)]" : "bg-transparent text-white/58 hover:text-white"
              }`}
            >
              Create free account
            </button>
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
              className={`min-h-10 rounded-xl px-3 text-sm font-semibold transition ${
                authMode === "signin" ? "bg-white text-[#15151b] shadow-[0_8px_22px_rgba(0,0,0,0.2)]" : "bg-transparent text-white/58 hover:text-white"
              }`}
            >
              Sign in
            </button>
          </div>

          {authMode === "signin" ? (
            <div className="mt-5">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={authLoading}
                className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-2xl border border-[#747775] bg-white px-4 text-sm font-semibold text-[#1f1f1f] shadow-[0_10px_28px_rgba(0,0,0,0.2)] transition hover:bg-[#f7f7f7] disabled:cursor-wait disabled:opacity-65"
              >
                <GoogleMark />
                {authLoading ? "Opening..." : "Continue with Google"}
              </button>

              <div className="my-5 flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] uppercase tracking-[0.16em] text-white/38">or use email</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={handlePasswordSignIn} className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-white/72">Email</span>
                <input
                  id="signin-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  placeholder="you@email.com"
                  className="h-[52px] w-full rounded-2xl border border-white/14 bg-black/28 px-4 text-base text-white outline-none transition placeholder:text-white/30 focus:border-cyan-200/55 focus:ring-2 focus:ring-cyan-200/14"
                />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-white/72">Password</span>
                  <div className="relative">
                  <input
                    id="signin-password"
                    name="password"
                    autoComplete="current-password"
                    required
                    value={passwordInput}
                    onChange={(event) => setPasswordInput(event.target.value)}
                    type={showSigninPassword ? "text" : "password"}
                    placeholder="Password"
                    className="h-[52px] w-full rounded-2xl border border-white/14 bg-black/28 px-4 pr-12 text-base text-white outline-none transition placeholder:text-white/30 focus:border-cyan-200/55 focus:ring-2 focus:ring-cyan-200/14"
                  />
                  <button
                    type="button"
                    aria-label={showSigninPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowSigninPassword((current) => !current)}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-white/48 transition hover:bg-white/8 hover:text-white"
                  >
                    {showSigninPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                  </button>
                </div>
                </label>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="min-h-[52px] w-full rounded-2xl border border-cyan-100/60 bg-[linear-gradient(110deg,#a5f3fc,#c4b5fd_58%,#fbcfe8)] px-4 text-sm font-bold text-[#211527] shadow-[0_14px_34px_rgba(139,92,246,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(139,92,246,0.28)] disabled:cursor-wait disabled:opacity-65"
                >
                  {authLoading ? "Signing in..." : "Sign in"}
                </button>

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-1 text-xs">
                  <button type="button" onClick={handleMagicLink} disabled={authLoading} className="text-cyan-100/72 underline decoration-cyan-100/24 underline-offset-4 transition hover:text-cyan-50 disabled:opacity-50">Email me a sign-in link</button>
                  <span className="h-1 w-1 rounded-full bg-white/18" aria-hidden="true" />
                  <button type="button" onClick={handleForgotPassword} disabled={authLoading} className="text-white/54 underline decoration-white/16 underline-offset-4 transition hover:text-white disabled:opacity-50">Forgot password?</button>
                </div>
              </form>
            </div>
          ) : authMode === "signup" ? (
            <div className="mt-5">
              <button type="button" onClick={handleGoogleAuth} disabled={authLoading} className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-2xl border border-[#747775] bg-white px-4 text-sm font-semibold text-[#1f1f1f] shadow-[0_10px_28px_rgba(0,0,0,0.2)] transition hover:bg-[#f7f7f7] disabled:cursor-wait disabled:opacity-65">
                <GoogleMark />
                {authLoading ? "Opening..." : "Continue with Google"}
              </button>

              <div className="my-5 flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] uppercase tracking-[0.16em] text-white/38">or use email</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-white/72">Display name</span>
                  <input id="signup-display-name" name="display-name" autoComplete="nickname" required value={signupForm.displayName} onChange={(event) => setSignupForm((current) => ({ ...current, displayName: event.target.value }))} placeholder="How you’ll appear in Queer Atlas" className="h-[52px] w-full rounded-2xl border border-white/14 bg-black/28 px-4 text-base text-white outline-none transition placeholder:text-white/30 focus:border-fuchsia-200/55 focus:ring-2 focus:ring-fuchsia-200/14" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-white/72">Email</span>
                  <input id="signup-email" name="email" type="email" autoComplete="username" required value={signupForm.email} onChange={(event) => setSignupForm((current) => ({ ...current, email: event.target.value }))} placeholder="you@email.com" className="h-[52px] w-full rounded-2xl border border-white/14 bg-black/28 px-4 text-base text-white outline-none transition placeholder:text-white/30 focus:border-fuchsia-200/55 focus:ring-2 focus:ring-fuchsia-200/14" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-white/72">Password</span>
                  <div className="relative">
                    <input id="signup-password" name="new-password" autoComplete="new-password" required type={showSignupPassword ? "text" : "password"} value={signupForm.password} onChange={(event) => setSignupForm((current) => ({ ...current, password: event.target.value }))} placeholder="Choose a password" aria-describedby="signup-password-help" className="h-[52px] w-full rounded-2xl border border-white/14 bg-black/28 px-4 pr-12 text-base text-white outline-none transition placeholder:text-white/30 focus:border-fuchsia-200/55 focus:ring-2 focus:ring-fuchsia-200/14" />
                    <button type="button" aria-label={showSignupPassword ? "Hide chosen password" : "Show chosen password"} onClick={() => setShowSignupPassword((current) => !current)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-white/48 transition hover:bg-white/8 hover:text-white">
                      {showSignupPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                    </button>
                  </div>
                  <p id="signup-password-help" className={`mt-1.5 text-[11px] ${signupPasswordChecks.minLength && signupPasswordChecks.uppercase && signupPasswordChecks.symbol ? "text-emerald-200/78" : "text-white/42"}`}>
                    6+ characters, including one uppercase letter and one symbol.
                  </p>
                </label>

              <button
                type="submit"
                disabled={authLoading}
                className="min-h-[52px] w-full rounded-2xl border border-pink-100/70 bg-[linear-gradient(110deg,#ffd6e7,#ddd6fe_55%,#bae6fd)] px-4 text-sm font-bold text-[#2b162d] shadow-[0_14px_34px_rgba(244,114,182,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(244,114,182,0.28)] disabled:cursor-wait disabled:opacity-65"
              >
                {authLoading ? "Creating your account..." : "Create free account"}
              </button>
              </form>
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

          <p className="mt-5 text-center text-[11px] leading-5 text-white/38">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-white/70 underline underline-offset-2 transition hover:text-white">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-white/70 underline underline-offset-2 transition hover:text-white">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
