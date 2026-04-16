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
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">Privacy</h1>

        <div className="mt-6 space-y-5 text-sm leading-7 text-white/72">
          <p>
            Queer Atlas is built to minimize unnecessary personal data. We use authentication data to provide member access and basic profile identity.
          </p>
          <p>
            Community content, favorites, and profile fields may be stored to deliver core product features. Some data may be stored locally in your browser.
          </p>
          <p>
            We do not sell your personal data. We process data to operate the app, improve quality, and keep community spaces safer.
          </p>
          <p>
            If you report content, report details may be reviewed for moderation and safety enforcement.
          </p>
          <p>
            You can request deletion or correction of your personal account data by contacting the Queer Atlas team.
          </p>
        </div>
      </div>
    </main>
  );
}
