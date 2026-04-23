import Link from "next/link";
import { keywordOwnership } from "@/lib/seo/keywordOwnership";

export const metadata = {
  title: "Queer Travel Guide",
  description:
    "Queer travel guide to nightlife, culture, safety signal, and community-driven city discovery.",
  keywords: [
    keywordOwnership.queerGuide.primary,
    ...keywordOwnership.queerGuide.secondary,
  ],
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
  const faqs = [
    {
      question: "How is this queer guide different from a normal city list?",
      answer:
        "It focuses on vibe, community signal, and nightlife behavior, not only addresses and categories.",
    },
    {
      question: "Does Queer Atlas include safety and rights context?",
      answer:
        "Yes. The guide combines local scene notes, quality signal, and world news context to support better decisions.",
    },
    {
      question: "Can I use this queer guide for trip planning?",
      answer:
        "Yes. You can discover cities, save venues, track events, and use community content to shape your route.",
    },
  ];

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

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-8 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
