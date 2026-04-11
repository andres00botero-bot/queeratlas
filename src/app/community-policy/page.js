export const metadata = {
  title: "Community Policy",
  description: "Queer Atlas community and reporting policy.",
};

export default function CommunityPolicyPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,24,24,0.96),rgba(10,10,10,0.99))] p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">Safety</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">Community Policy & Reporting</h1>

        <div className="mt-6 space-y-5 text-sm leading-7 text-white/72">
          <p>
            Queer Atlas exists for safety, direction, belonging, and community signal. Keep contributions honest, relevant, and respectful.
          </p>
          <p>
            Not allowed: hate speech, harassment, slurs, threats, non-consensual sexual content, doxxing, spam, fraudulent venue/event claims, and targeted abuse.
          </p>
          <p>
            Reporting: use the in-app Report action on stories, guides, messages, ideas, venues, or events. Include a short reason so moderators can act quickly.
          </p>
          <p>
            Moderation actions can include warning, content removal, visibility restriction, or account limitation for repeated or severe violations.
          </p>
          <p>
            Safety note: always confirm details before visiting venues or events, and prioritize consent, situational awareness, and personal safety in all interactions.
          </p>
        </div>
      </div>
    </main>
  );
}
