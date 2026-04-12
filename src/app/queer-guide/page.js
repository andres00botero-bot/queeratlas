import Link from "next/link";

export const metadata = {
  title: "Queer Guide",
  description:
    "Global queer guide to nightlife, culture, safety signal, and community-driven city discovery.",
  alternates: {
    canonical: "/queer-guide",
  },
};

const FEATURES = [
  {
    title: "Venue Intelligence",
    text: "Find bars, clubs, saunas, cruising spots, cafes, and hotels with vibe-first descriptions.",
  },
  {
    title: "Community Signal",
    text: "See what is active now, what needs refresh, and what queer travelers actually trust.",
  },
  {
    title: "Cross-City Planning",
    text: "Save favorites, compare cities, and build your route from first drink to final dance floor.",
  },
];

export default function QueerGuidePage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_14%_8%,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(167,139,250,0.12),transparent_30%),linear-gradient(160deg,rgba(20,20,20,0.96),rgba(10,10,10,0.99))] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Queer Atlas</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">Queer Guide for Global Discovery</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/78 sm:text-[15px]">
            This queer guide is built for travelers who want more than lists. Use Queer Atlas to understand the energy of
            each city, discover trusted places, follow event momentum, and navigate with culture-first confidence.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/cities" className="rounded-full border border-emerald-200/24 bg-emerald-200/10 px-4 py-2 text-sm text-emerald-100 transition hover:border-emerald-200/40">
              Browse queer cities
            </Link>
            <Link href="/community" className="rounded-full border border-violet-200/24 bg-violet-200/10 px-4 py-2 text-sm text-violet-100 transition hover:border-violet-200/40">
              Open community
            </Link>
            <Link href="/now" className="rounded-full border border-white/16 bg-white/6 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white">
              See what is happening now
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {FEATURES.map((item) => (
            <article key={item.title} className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-7 text-white/72">{item.text}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

