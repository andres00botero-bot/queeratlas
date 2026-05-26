import Link from "next/link";
import { keywordOwnership } from "@/lib/seo/keywordOwnership";

export const metadata = {
  title: "HBTQ Guide 2026 | Queer Atlas",
  description:
    "Global HBTQ guide for queer-friendly cities, LGBTQ events, safer nightlife, and trusted community signal.",
  keywords: [
    keywordOwnership.hbtqGuide.primary,
    ...keywordOwnership.hbtqGuide.secondary,
  ],
  alternates: {
    canonical: "/hbtq-guide",
    languages: {
      "en-US": "/gay-guide",
      en: "/queer-guide",
      "sv-SE": "/hbtq-guide",
      "x-default": "/queer-guide",
    },
  },
  openGraph: {
    title: "HBTQ Guide 2026 | Queer Atlas",
    description:
      "Find HBTQ-friendly cities, nightlife flow, events, and local community-backed travel signal.",
    url: "https://www.queeratlas.app/hbtq-guide",
    siteName: "Queer Atlas",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "HBTQ Guide 2026 | Queer Atlas",
    description:
      "HBTQ city discovery with queer-safe nightlife context, venues, and events.",
  },
};

const QUICK_LINKS = [
  { href: "/cities", label: "All cities", tone: "amber" },
  { href: "/events", label: "Upcoming events", tone: "rose" },
  { href: "/search", label: "Search venues", tone: "cyan" },
  { href: "/community", label: "Community stories", tone: "emerald" },
];

const WHY_IT_WORKS = [
  "Community-driven structure with less noise and more decision clarity.",
  "Vibe-first descriptions so users understand scene energy before arriving.",
  "Integrated city + venue + event flow for faster planning and better nights.",
  "Multi-city comparability so travelers can choose based on fit, not hype.",
];

const faqs = [
  {
    question: "What is the Queer Atlas HBTQ Guide?",
    answer:
      "It is a global HBTQ guide that combines city pages, venues, events, and social signal in one streamlined product.",
  },
  {
    question: "Can I find HBTQ-friendly places in each city?",
    answer:
      "Yes. Many city pages include bars, clubs, saunas, cafes, hotels, and event context, plus local vibe indicators.",
  },
  {
    question: "Is this useful for both travelers and locals?",
    answer:
      "Yes. Travelers use it for route planning, while locals use it to discover new places and monitor scene changes.",
  },
  {
    question: "How do I build a better plan with this guide?",
    answer:
      "Pick your city, save venues by vibe, overlay event dates, and use the planner flow to create a realistic sequence.",
  },
];

export default function HbtqGuidePage() {
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
      { "@type": "ListItem", position: 2, name: "HBTQ Guide", item: "https://www.queeratlas.app/hbtq-guide" },
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
        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_16%_10%,rgba(251,191,36,0.14),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(244,114,182,0.12),transparent_30%),linear-gradient(160deg,rgba(20,20,20,0.96),rgba(10,10,10,0.99))] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Nordic + Global Discovery Layer</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">HBTQ Guide: Places, Events, Culture</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/78 sm:text-[15px]">
            Queer Atlas is a modern HBTQ guide for people who care about fit, tone, and trust. Discover clubs, bars,
            hotels, and events with a structure built for real movement and better social outcomes.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {QUICK_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  item.tone === "amber"
                    ? "border-amber-200/24 bg-amber-200/10 text-amber-100 hover:border-amber-200/40"
                    : item.tone === "rose"
                      ? "border-rose-200/24 bg-rose-200/10 text-rose-100 hover:border-rose-200/40"
                      : item.tone === "cyan"
                        ? "border-cyan-200/24 bg-cyan-200/10 text-cyan-100 hover:border-cyan-200/40"
                        : "border-emerald-200/24 bg-emerald-200/10 text-emerald-100 hover:border-emerald-200/40"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,22,22,0.94),rgba(10,10,10,0.98))] p-6">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Why This HBTQ Guide Works</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-7 text-white/72 md:grid-cols-2">
            {WHY_IT_WORKS.map((item) => (
              <li key={item} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.94),rgba(10,10,10,0.98))] p-6">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Route Building Across Guides</h2>
          <p className="mt-2 text-sm leading-7 text-white/72">
            Use each guide page for a different intent, then merge them into one itinerary.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Link href="/gay-guide" className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 transition hover:border-white/28">
              <p className="text-sm font-semibold text-white/88">Gay Guide</p>
              <p className="mt-1 text-xs text-white/58">Nightlife-first routes and destination anchors.</p>
            </Link>
            <Link href="/queer-guide" className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 transition hover:border-white/28">
              <p className="text-sm font-semibold text-white/88">Queer Guide</p>
              <p className="mt-1 text-xs text-white/58">Context-rich planning and culture-aware flow.</p>
            </Link>
            <Link href="/favorites" className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 transition hover:border-white/28">
              <p className="text-sm font-semibold text-white/88">Favorites + Planner</p>
              <p className="mt-1 text-xs text-white/58">Turn discovery into a real sequence by date.</p>
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.94),rgba(10,10,10,0.98))] p-6">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">HBTQ Guide FAQ</h2>
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
