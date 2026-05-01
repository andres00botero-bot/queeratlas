import Link from "next/link";
import { keywordOwnership } from "@/lib/seo/keywordOwnership";

export const metadata = {
  title: "Gay Travel Guide 2026 | Queer Atlas",
  description:
    "Plan smarter queer travel with a global gay guide for nightlife, events, hotels, and neighborhood signal across top cities.",
  keywords: [
    keywordOwnership.gayGuide.primary,
    ...keywordOwnership.gayGuide.secondary,
  ],
  alternates: {
    canonical: "/gay-guide",
  },
  openGraph: {
    title: "Gay Travel Guide 2026 | Queer Atlas",
    description:
      "Global gay travel guide for city discovery, nightlife mapping, events, and community-backed venue signal.",
    url: "https://www.queeratlas.app/gay-guide",
    siteName: "Queer Atlas",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gay Travel Guide 2026 | Queer Atlas",
    description:
      "Find gay-friendly cities, venues, events, and real-time community signal in one global guide.",
  },
};

const CITY_HIGHLIGHTS = [
  { slug: "berlin", label: "Berlin", note: "techno gravity + leather history" },
  { slug: "madrid", label: "Madrid", note: "late pride momentum + huge street social" },
  { slug: "new_york", label: "New York", note: "dense venue mix across borough energy" },
  { slug: "sao_paulo", label: "Sao Paulo", note: "massive scale + all-night crossover flow" },
  { slug: "bangkok", label: "Bangkok", note: "Silom nightlife lanes + sauna network" },
  { slug: "sydney", label: "Sydney", note: "harbour lifestyle + iconic queer nightlife" },
];

const TRAVEL_STACK = [
  "Start with city guide context: neighborhood pulse, safety tone, and scene density.",
  "Build a nightly arc: warm-up cafe or bar, 1 to 2 core venues, then late options.",
  "Overlay events by date window so your itinerary aligns with real crowd momentum.",
  "Save fallback venues in each category to avoid dead nights or closed doors.",
];

const faqs = [
  {
    question: "What is Queer Atlas Gay Guide?",
    answer:
      "It is a global gay travel guide focused on nightlife clarity, local context, and community-updated venue signal instead of generic tourist lists.",
  },
  {
    question: "What can I discover in each city guide?",
    answer:
      "You can browse bars, clubs, saunas, hotels, cruising areas, events, and scene-ready tips in one place, with vibe tags and opening-hour context.",
  },
  {
    question: "How should I use the guide for a real trip?",
    answer:
      "Open your target city first, save places by vibe, check date-matching events, and build a route that starts social and peaks at late-night venues.",
  },
  {
    question: "Is this guide only for major capitals?",
    answer:
      "No. Queer Atlas includes flagship capitals and rising regional scenes so travelers can discover both iconic hubs and newer nightlife signals.",
  },
];

export default function GayGuidePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.queeratlas.app/" },
      { "@type": "ListItem", position: 2, name: "Gay Guide", item: "https://www.queeratlas.app/gay-guide" },
    ],
  };

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-8 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="mx-auto max-w-6xl">
        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_10%_10%,rgba(244,114,182,0.12),transparent_28%),radial-gradient(circle_at_90%_14%,rgba(34,211,238,0.12),transparent_30%),linear-gradient(160deg,rgba(20,20,20,0.96),rgba(10,10,10,0.99))] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Global Gay Travel Intelligence</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">Gay Guide: Cities, Venues, Events</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/78 sm:text-[15px]">
            Queer Atlas is a city-first gay guide for nightlife travelers who want signal, not noise. Compare cities,
            locate trusted venues, map event weekends, and move through each destination with culture-aware confidence.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/cities" className="rounded-full border border-fuchsia-200/24 bg-fuchsia-200/10 px-4 py-2 text-sm text-fuchsia-100 transition hover:border-fuchsia-200/40">
              Explore all cities
            </Link>
            <Link href="/events" className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-4 py-2 text-sm text-cyan-100 transition hover:border-cyan-200/40">
              Open global events
            </Link>
            <Link href="/favorites" className="rounded-full border border-white/16 bg-white/6 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white">
              Build my travel stack
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
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-white/24 hover:bg-white/[0.07]"
              >
                <p className="text-sm font-semibold text-white/88">Queer {city.label}</p>
                <p className="mt-1 text-xs text-white/58">{city.note}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.94),rgba(10,10,10,0.98))] p-6">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">How To Plan With This Gay Guide</h2>
          <ol className="mt-3 space-y-2 text-sm leading-7 text-white/72">
            {TRAVEL_STACK.map((step) => (
              <li key={step} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/64">
            <Link href="/queer-guide" className="rounded-full border border-white/14 bg-white/6 px-3 py-1 transition hover:border-white/30 hover:text-white">
              Compare with queer guide
            </Link>
            <Link href="/hbtq-guide" className="rounded-full border border-white/14 bg-white/6 px-3 py-1 transition hover:border-white/30 hover:text-white">
              Read HBTQ guide
            </Link>
            <Link href="/now" className="rounded-full border border-white/14 bg-white/6 px-3 py-1 transition hover:border-white/30 hover:text-white">
              Live world news signal
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.94),rgba(10,10,10,0.98))] p-6">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Gay Guide FAQ</h2>
          <div className="mt-4 space-y-3">
            {faqs.map((item) => (
              <article key={item.question} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <h3 className="text-sm font-semibold text-white/92">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-white/72">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
