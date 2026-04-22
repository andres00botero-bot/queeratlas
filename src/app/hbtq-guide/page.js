import Link from "next/link";

export const metadata = {
  title: "HBTQ Guide",
  description:
    "Global HBTQ guide for cities, queer venues, events, and safer discovery powered by community signal.",
  alternates: {
    canonical: "/hbtq-guide",
  },
};

const QUICK_LINKS = [
  { href: "/cities", label: "All cities" },
  { href: "/events", label: "Upcoming events" },
  { href: "/search", label: "Search venues" },
  { href: "/community", label: "Community stories" },
];

export default function HbtqGuidePage() {
  const faqs = [
    {
      question: "What is the Queer Atlas HBTQ Guide?",
      answer:
        "It is a global HBTQ guide for cities, venues, events, and community signal in one platform.",
    },
    {
      question: "Can I find HBTQ-friendly places in each city?",
      answer:
        "Yes. City pages organize bars, clubs, saunas, cruising spots, cafes, hotels, and events when data is available.",
    },
    {
      question: "Is this good for travel planning?",
      answer:
        "Yes. You can compare cities, discover vibe, follow events, and build a smarter queer travel route.",
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
        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_16%_10%,rgba(251,191,36,0.14),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(244,114,182,0.12),transparent_30%),linear-gradient(160deg,rgba(20,20,20,0.96),rgba(10,10,10,0.99))] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Search Guide</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">HBTQ Guide: Places, Events, Culture</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/78 sm:text-[15px]">
            Queer Atlas is a modern HBTQ guide for people who want the right vibe in new cities. Discover clubs, bars,
            hotels, and events with a focus on energy, safety, community, and real local signal.
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
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Why this HBTQ guide works</h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-white/72">
            <li>Community-driven content focused on quality over noise.</li>
            <li>Vibe-first descriptions that explain crowd and energy quickly.</li>
            <li>Global city discovery with clear navigation between venues and events.</li>
          </ul>
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
