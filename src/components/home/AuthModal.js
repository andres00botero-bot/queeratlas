"use client";

import Link from "next/link";

export default function AuthModal({
  show,
  onClose,
  authMode,
  onAuthModeChange,
  authLoading,
  authMessage,
  needsEmailConfirmation,
  emailInput,
  onEmailInputChange,
  passwordInput,
  onPasswordInputChange,
  signupForm,
  onSignupFieldChange,
  pendingEmailConfirmation,
  onGoogleSignIn,
  onPasswordSignIn,
  onMagicLinkSignIn,
  onCreateAccount,
  onResendConfirmation,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6">
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(21,21,21,0.97),rgba(10,10,10,0.99))] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute left-0 top-0 h-40 w-40 rounded-full bg-rose-400/12 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative">
          <p className="text-xs uppercase tracking-[0.28em] text-white/40">
            Member access
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Join Queer Atlas
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/62">
            Unlock community, contribution, and the deeper layer of queer discovery.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/30 p-1.5">
            <button
              type="button"
              onClick={() => onAuthModeChange("signin")}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                authMode === "signin" ? "bg-white text-black" : "bg-transparent text-white/70 hover:text-white"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => onAuthModeChange("signup")}
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
                onClick={onGoogleSignIn}
                disabled={authLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-white via-rose-100 to-orange-100 py-3 font-semibold text-black transition hover:opacity-95"
              >
                {authLoading ? "Opening..." : "Continue with Google"}
              </button>
              <p className="px-1 text-xs leading-5 text-white/60">
                Google sign-in only uses basic account identity (openid, email, profile) for authentication.
                {" "}
                <Link href="/privacy" prefetch={false} className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                  Privacy Policy
                </Link>
                .
              </p>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <input
                  value={emailInput}
                  onChange={(event) => onEmailInputChange(event.target.value)}
                  placeholder="you@email.com"
                  className="mb-2 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                />
                <input
                  value={passwordInput}
                  onChange={(event) => onPasswordInputChange(event.target.value)}
                  type="password"
                  placeholder="Password"
                  className="mb-2 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                />
                <button
                  onClick={onPasswordSignIn}
                  disabled={authLoading}
                  className="w-full rounded-xl border border-white/15 bg-white/10 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  {authLoading ? "Signing in..." : "Sign in with email + password"}
                </button>

                <button
                  onClick={onMagicLinkSignIn}
                  disabled={authLoading}
                  className="mt-2 w-full rounded-xl border border-white/12 bg-black/20 py-2 text-xs font-semibold tracking-[0.08em] text-white/75 transition hover:border-white/24 hover:text-white"
                >
                  {authLoading ? "Sending..." : "Send magic link instead"}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-fuchsia-200/18 bg-[linear-gradient(180deg,rgba(244,114,182,0.08),rgba(0,0,0,0.22))] p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.14em] text-fuchsia-100/85">Build your member identity</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={signupForm.displayName}
                  onChange={(event) => onSignupFieldChange("displayName", event.target.value)}
                  placeholder="Display name"
                  className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                />
                <input
                  value={signupForm.pronouns}
                  onChange={(event) => onSignupFieldChange("pronouns", event.target.value)}
                  placeholder="Pronouns (optional)"
                  className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                />
                <input
                  value={signupForm.homeCity}
                  onChange={(event) => onSignupFieldChange("homeCity", event.target.value)}
                  placeholder="Home city"
                  className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                />
                <input
                  value={signupForm.residentCountry}
                  onChange={(event) => onSignupFieldChange("residentCountry", event.target.value)}
                  placeholder="Country"
                  className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                />
                <input
                  value={signupForm.email}
                  onChange={(event) => onSignupFieldChange("email", event.target.value)}
                  placeholder="Email"
                  className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30 sm:col-span-2"
                />
                <input
                  type="password"
                  value={signupForm.password}
                  onChange={(event) => onSignupFieldChange("password", event.target.value)}
                  placeholder="Choose password"
                  className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                />
                <input
                  type="password"
                  value={signupForm.confirmPassword}
                  onChange={(event) => onSignupFieldChange("confirmPassword", event.target.value)}
                  placeholder="Confirm password"
                  className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                />
              </div>

              <button
                onClick={onCreateAccount}
                disabled={authLoading}
                className="mt-3 w-full rounded-xl border border-fuchsia-200/22 bg-fuchsia-200/12 py-2.5 text-sm font-semibold text-fuchsia-100 transition hover:border-fuchsia-200/38 hover:bg-fuchsia-200/18"
              >
                {authLoading ? "Creating..." : "Create account"}
              </button>
            </div>
          )}

          {authMessage && (
            <div
              className={`mt-4 rounded-xl border px-3 py-2 text-xs ${
                needsEmailConfirmation
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
                  Auto-check active on this screen. After confirmation on phone, this tab signs in automatically.
                </p>
              )}
              {pendingEmailConfirmation && (
                <button
                  type="button"
                  onClick={onResendConfirmation}
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
            <Link href="/terms" prefetch={false} className="text-white/70 underline underline-offset-2 transition hover:text-white">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" prefetch={false} className="text-white/70 underline underline-offset-2 transition hover:text-white">
              Privacy Policy
            </Link>
            .
          </p>

          <button
            onClick={onClose}
            className="mt-4 text-sm text-white/46 transition hover:text-white/75"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
