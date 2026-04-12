import Link from "next/link";

export const metadata = {
  title: "HBTQ Guide",
  description:
    "HBTQ guide for globala stader, queer venues, events och tryggare discovery med community-signal.",
  alternates: {
    canonical: "/hbtq-guide",
  },
};

const QUICK_LINKS = [
  { href: "/cities", label: "Alla stader" },
  { href: "/events", label: "Kommande events" },
  { href: "/search", label: "Sok venues" },
  { href: "/community", label: "Community stories" },
];

export default function HbtqGuidePage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_16%_10%,rgba(251,191,36,0.14),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(244,114,182,0.12),transparent_30%),linear-gradient(160deg,rgba(20,20,20,0.96),rgba(10,10,10,0.99))] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Sok Guide</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">HBTQ Guide: Platser, Events, Kultur</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/78 sm:text-[15px]">
            Queer Atlas ar en modern HBTQ guide for dig som vill hitta ratt vibe i nya stader. Upptack klubbar, barer,
            hotell och events med fokus pa energi, trygghet, community och verklig lokal signal.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {QUICK_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-amber-200/24 bg-amber-200/10 px-4 py-2 text-sm text-amber-100 transition hover:border-amber-200/40"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,22,22,0.94),rgba(10,10,10,0.98))] p-6">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Varfor denna HBTQ guide fungerar</h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-white/72">
            <li>Community-driven innehall som fokuserar pa kvalitet over brus.</li>
            <li>Vibe-first beskrivningar som forklarar kansla, crowd och energi.</li>
            <li>Global city discovery med tydlig navigering mellan venues och events.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}

