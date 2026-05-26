import Link from "next/link";
import { listTopicHubs } from "@/lib/seo/topicHubs";

export const metadata = {
  title: "Queer Topic Hubs 2026 | Queer Atlas",
  description:
    "Topical queer discovery hubs across nightlife, safety, events, cafes, and community-led route intelligence.",
  alternates: {
    canonical: "/topics",
  },
};

export default function TopicsIndexPage() {
  const hubs = listTopicHubs();

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[28px] border border-white/12 bg-white/[0.03] p-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/78">Topical Dominance Layer</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">Queer Topic Hubs</h1>
          <p className="mt-3 text-sm leading-7 text-white/82">
            Jump into high-intent global hubs and then move city-by-city through discover routes.
          </p>
        </section>

        <section className="rounded-[24px] border border-white/12 bg-white/[0.03] p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {hubs.map((hub) => (
              <Link
                key={hub.key}
                href={`/topics/${hub.key}`}
                className="rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white/84 transition hover:border-cyan-200/34 hover:text-white"
              >
                {hub.title}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
