export const metadata = {
  title: "Terms",
  description: "Queer Atlas terms and acceptable use.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,24,24,0.96),rgba(10,10,10,0.99))] p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">Legal</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">Terms of Use</h1>

        <div className="mt-6 space-y-5 text-sm leading-7 text-white/72">
          <p>
            By using Queer Atlas, you agree to use the platform respectfully, lawfully, and in ways that protect community safety.
          </p>
          <p>
            You are responsible for your own decisions, routes, and in-person interactions. Venue information can change quickly, and we cannot guarantee real-time accuracy at every moment.
          </p>
          <p>
            Harassment, hate speech, threats, doxxing, impersonation, spam, and malicious misuse are not allowed. We may remove content or restrict access when needed to protect community trust.
          </p>
          <p>
            User-contributed stories, guides, and suggestions may be moderated. Repeated harmful behavior can result in account restrictions or removal.
          </p>
          <p>
            These terms may be updated as the platform evolves. Continued use means you accept the current version.
          </p>
        </div>
      </div>
    </main>
  );
}
