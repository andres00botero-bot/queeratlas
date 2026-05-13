import Link from "next/link";
import { keywordOwnership } from "@/lib/seo/keywordOwnership";

export const metadata = {
  title: "Queer Travel Guide 2026 | Queer Atlas",
  description:
    "Queer traveler guide with LGBTQ travel safety context, queer safe spaces, and inclusive nightlife discovery.",
  keywords: [
    keywordOwnership.queerGuide.primary,
    ...keywordOwnership.queerGuide.secondary,
  ],
  alternates: {
    canonical: "/queer-guide",
  },
  openGraph: {
    title: "Queer Travel Guide 2026 | Queer Atlas",
    description:
      "Discover queer-safe spaces, inclusive nightlife, and city-level LGBTQ safety context.",
    url: "https://www.queeratlas.app/queer-guide",
    siteName: "Queer Atlas",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Queer Travel Guide 2026 | Queer Atlas",
    description:
      "Queer travel with safer nightlife context, events, and community-backed city discovery.",
  },
};

const FEATURES = [
  {
    title: "Venue Intelligence",
    text: "Find bars, clubs, saunas, cruising spots, cafes, hotels, and private services through vibe-first descriptions.",
  },
  {
    title: "Community Signal",
    text: "Track what is active now, where energy is moving, and where members are currently checking in.",
  },
  {
    title: "Culture + Context",
    text: "Use rights, safety, and social context before you plan a night, not after a bad surprise.",
  },
];

const PLANNING_AXES = [
  "Identity fit: choose venues that match your social comfort and expression style.",
  "Time fit: align opening hours and event windows to avoid dead transitions.",
  "Location fit: chain nearby neighborhoods to reduce transport friction.",
  "Energy fit: start softer, then move toward your desired late-night intensity.",
];

const faqs = [
  {
    question: "How is this queer guide different from a normal city list?",
    answer:
      "It prioritizes vibe clarity, community signal, and cultural context so people can make better decisions, faster.",
  },
  {
    question: "Does Queer Atlas include safety and rights context?",
    answer:
      "Yes. The platform combines city scene intelligence with world news and local signal to support informed planning.",
  },
  {
    question: "Can I use this queer guide for trip planning?",
    answer:
      "Yes. Save favorites, check date-matching events, and build route logic from first meetup to final venue.",
  },
  {
    question: "Is this page relevant for locals too?",
    answer:
      "Absolutely. Locals use it to monitor scene shifts, discover new venues, and contribute fresh signal back to the city.",
  },
];

export default function QueerGuidePage() {
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
      { "@type": "ListItem", position: 2, name: "Queer Guide", item: "https://www.queeratlas.app/queer-guide" },
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
        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_14%_8%,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(167,139,250,0.12),transparent_30%),linear-gradient(160deg,rgba(20,20,20,0.96),rgba(10,10,10,0.99))] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Queer Atlas Editorial Guide</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">Queer Guide for Global Discovery</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/78 sm:text-[15px]">
            This queer guide is built for travelers and locals who want clear scene intelligence. Understand city energy,
            discover trusted places, track event momentum, and move with community context instead of algorithm noise.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/cities" className="rounded-full border border-emerald-200/24 bg-emerald-200/10 px-4 py-2 text-sm text-emerald-100 transition hover:border-emerald-200/40">
              Browse queer cities
            </Link>
            <Link href="/community" className="rounded-full border border-violet-200/24 bg-violet-200/10 px-4 py-2 text-sm text-violet-100 transition hover:border-violet-200/40">
              Open community
            </Link>
            <Link href="/messages" className="rounded-full border border-white/16 bg-white/6 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white">
              Open inbox signal
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

        <section className="mt-8 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.94),rgba(10,10,10,0.98))] p-6">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Four Axes For Better Queer Trip Decisions</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-7 text-white/72 md:grid-cols-2">
            {PLANNING_AXES.map((item) => (
              <li key={item} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/64">
            <Link href="/gay-guide" className="rounded-full border border-white/14 bg-white/6 px-3 py-1 transition hover:border-white/30 hover:text-white">
              Compare gay guide
            </Link>
            <Link href="/hbtq-guide" className="rounded-full border border-white/14 bg-white/6 px-3 py-1 transition hover:border-white/30 hover:text-white">
              Compare HBTQ guide
            </Link>
            <Link href="/now" className="rounded-full border border-white/14 bg-white/6 px-3 py-1 transition hover:border-white/30 hover:text-white">
              Read world news
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.94),rgba(10,10,10,0.98))] p-6">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Queer Guide FAQ</h2>
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
