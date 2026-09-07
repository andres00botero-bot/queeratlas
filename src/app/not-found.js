import Link from "next/link";

export const metadata = {
  title: "Page Not Found | Queer Atlas",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#050608] px-4 py-16 text-white sm:px-6">
      <section className="mx-auto max-w-2xl border-y border-white/12 py-12 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100/70">Atlas update</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">This place has moved on.</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/66">
          The page may have been renamed, merged, closed, or removed after verification. Explore the current Atlas instead of relying on an outdated listing.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/cities" className="inline-flex min-h-11 items-center rounded-full bg-cyan-100 px-5 text-sm font-semibold text-[#061016]">
            Explore cities
          </Link>
          <Link href="/events/calendar" className="inline-flex min-h-11 items-center rounded-full border border-white/18 px-5 text-sm font-semibold text-white/82">
            Find current events
          </Link>
        </div>
      </section>
    </main>
  );
}
