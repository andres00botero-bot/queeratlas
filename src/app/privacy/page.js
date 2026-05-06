export const metadata = {
  title: "Privacy",
  description: "Queer Atlas privacy overview.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,24,24,0.96),rgba(10,10,10,0.99))] p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">Legal</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">Privacy Policy</h1>
        <p className="mt-2 text-sm text-white/60">Last updated: April 21, 2026</p>

        <div className="mt-6 space-y-5 text-sm leading-7 text-white/78">
          <p>
            Queer Atlas is built to minimize unnecessary personal data. We use account and profile data to provide member access,
            saved content, community features, and core product functionality.
          </p>
          <p>
            We do not sell personal data. We process data to operate the app, improve reliability, and enforce community safety rules.
          </p>
        </div>

        <section className="mt-8 space-y-4 rounded-2xl border border-cyan-200/20 bg-cyan-500/[0.06] p-5">
          <h2 className="text-lg font-semibold text-white">Google User Data (OAuth) Disclosure</h2>
          <p className="text-sm leading-7 text-white/78">
            When you choose <span className="font-semibold text-white">Continue with Google</span>, Queer Atlas uses Google OAuth only
            for authentication and basic account identity.
          </p>

          <div className="space-y-3 text-sm leading-7 text-white/78">
            <p>
              <span className="font-semibold text-white">Data accessed:</span> basic Google account identity from standard OAuth scopes
              (<span className="font-mono text-white">openid</span>, <span className="font-mono text-white">email</span>,{" "}
              <span className="font-mono text-white">profile</span>). This may include your email address and basic profile name fields.
            </p>
            <p>
              <span className="font-semibold text-white">Data usage:</span> we use this data only to create/sign in your account,
              maintain your authenticated session, and display basic profile identity inside Queer Atlas.
            </p>
            <p>
              <span className="font-semibold text-white">Data storage:</span> account/session data is stored via Supabase Auth and related
              app profile records needed for product features.
            </p>
            <p>
              <span className="font-semibold text-white">Data sharing:</span> we do not sell Google user data. Data is processed only by
              infrastructure/services required to run Queer Atlas (for example authentication, hosting, and monitoring providers).
            </p>
            <p>
              <span className="font-semibold text-white">What we do not access:</span> Queer Atlas does not request or access Gmail,
              Google Drive, Google Calendar, Google Contacts, or other restricted Google API data.
            </p>
          </div>
        </section>

        <section className="mt-8 space-y-4 text-sm leading-7 text-white/78">
          <h2 className="text-lg font-semibold text-white">Community and Account Data</h2>
          <p>
            Community posts, favorites, check-ins, and profile fields may be stored to deliver core app features. Some non-sensitive
            runtime data may also be stored locally in your browser.
          </p>
          <p>
            If you report content, report details may be reviewed for moderation and safety enforcement.
          </p>
          <p>
            You can request deletion or correction of your account data by contacting the Queer Atlas team.
          </p>
          <p>
            Contact:{" "}
            <a className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200" href="mailto:admin@queeratlas.app">
              admin@queeratlas.app
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
