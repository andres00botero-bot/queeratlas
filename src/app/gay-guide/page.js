import Link from "next/link";

export const metadata = {
  title: "Gay Guide",
  description:
    "Global gay guide for cities, nightlife, events, and trusted queer travel signal in one atlas.",
  alternates: {
    canonical: "/gay-guide",
  },
};

const CITY_HIGHLIGHTS = [
  { slug: "berlin", label: "Berlin" },
  { slug: "madrid", label: "Madrid" },
  { slug: "new_york", label: "New York" },
  { slug: "sao_paulo", label: "Sao Paulo" },
  { slug: "bangkok", label: "Bangkok" },
  { slug: "sydney", label: "Sydney" },
];

export default function GayGuidePage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_10%_10%,rgba(244,114,182,0.12),transparent_28%),radial-gradient(circle_at_90%_14%,rgba(34,211,238,0.12),transparent_30%),linear-gradient(160deg,rgba(20,20,20,0.96),rgba(10,10,10,0.99))] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Global Discovery</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">Gay Guide: Cities, Venues, Events</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/78 sm:text-[15px]">
            Queer Atlas is a global gay guide built for real nightlife, real culture, and real community signal. Discover
            top gay neighborhoods, clubs, bars, saunas, cruising areas, and events city by city, then save your route and
            move with confidence.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/cities" className="rounded-full border border-fuchsia-200/24 bg-fuchsia-200/10 px-4 py-2 text-sm text-fuchsia-100 transition hover:border-fuchsia-200/40">
              Explore all cities
            </Link>
            <Link href="/events" className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-4 py-2 text-sm text-cyan-100 transition hover:border-cyan-200/40">
              Open global events
            </Link>
            <Link href="/search" className="rounded-full border border-white/16 bg-white/6 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white">
              Search venues now
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,22,22,0.94),rgba(10,10,10,0.98))] p-6">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Top Gay Travel Cities Right Now</h2>
          <p className="mt-2 text-sm leading-7 text-white/70">
            Start with high-signal cities where queer life is visible, social, and easy to enter.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CITY_HIGHLIGHTS.map((city) => (
              <Link
                key={city.slug}
                href={`/${city.slug}`}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/82 transition hover:border-white/24 hover:bg-white/[0.07]"
              >
                Queer {city.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

