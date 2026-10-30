import Link from "next/link";
import { serializeJsonLd } from "@/lib/jsonLd";
import EditorialDisclosure from "@/components/editorial/EditorialDisclosure";
import { getPublishedEditorialRecord } from "@/lib/editorialData";
import { buildEditorialAuthorJsonLd, EDITORIAL_TEAM, GUIDE_EDITORIAL_META } from "@/lib/editorialTrust";
import { keywordOwnership } from "@/lib/seo/keywordOwnership";
import JourneyDeck from "@/components/seo/JourneyDeck";

export const metadata = {
  title: "LGBTQ+ Travel Guide 2026",
  description: "Plan LGBTQ+ travel with city context, inclusive places, current events, and practical safety-aware planning guidance.",
  keywords: [keywordOwnership.lgbtqGuide.primary, ...keywordOwnership.lgbtqGuide.secondary],
  alternates: { canonical: "/lgbtq-travel-guide" },
  openGraph: {
    title: "LGBTQ+ Travel Guide 2026 | Queer Atlas",
    description: "Find LGBTQ+-friendly cities, places, events, and practical travel context in one global guide.",
    url: "https://www.queeratlas.app/lgbtq-travel-guide",
    siteName: "Queer Atlas",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "LGBTQ+ Travel Guide 2026 | Queer Atlas",
    description: "Plan a more informed LGBTQ+ trip with city, venue, event, and safety context.",
  },
};

export const revalidate = 600;

const PLANNING_PILLARS = [
  ["Choose a city with context", "Compare visible queer life, local scene density, and the practical city information that matters before you commit."],
  ["Build a plan that can flex", "Start with a neighbourhood, save two or three places, then add date-specific events and a realistic backup."],
  ["Check close to departure", "Opening hours, event lineups, transport, entry rules, and local conditions can change. Recheck the details that affect your trip."],
];

const faqs = [
  ["What is the Queer Atlas LGBTQ+ Travel Guide?", "It is a practical starting point for LGBTQ+ travelers who want to compare cities, discover inclusive places, find current events, and plan with context."],
  ["Does a city guide guarantee that a place is safe or inclusive?", "No. Queer Atlas provides structured context and venue information, but conditions can change. Use current official travel advice and your own judgement alongside local information."],
  ["How do I plan a trip with Queer Atlas?", "Choose a city, explore its places and neighbourhood context, check dates in the events calendar, and save a backup option before you travel."],
];

export default async function LgbtqTravelGuidePage() {
  const editorial = await getPublishedEditorialRecord("guide:lgbtq-travel-guide", {
    ...GUIDE_EDITORIAL_META.hbtqGuide,
    author: EDITORIAL_TEAM,
  });
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": "https://www.queeratlas.app/lgbtq-travel-guide#article",
    headline: "LGBTQ+ Travel Guide 2026",
    url: "https://www.queeratlas.app/lgbtq-travel-guide",
    datePublished: editorial.publishedAt,
    dateModified: editorial.updatedAt,
    author: buildEditorialAuthorJsonLd(editorial.author),
    ...(editorial.reviewer ? { reviewedBy: buildEditorialAuthorJsonLd(editorial.reviewer) } : {}),
    ...(editorial.sources.length ? { citation: editorial.sources.map((source) => source.url) } : {}),
    publisher: { "@id": "https://www.queeratlas.app/#organization" },
    publishingPrinciples: "https://www.queeratlas.app/editorial-policy",
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
  };

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[32px] border border-emerald-100/16 bg-[radial-gradient(circle_at_10%_0%,rgba(52,211,153,0.16),transparent_32%),radial-gradient(circle_at_88%_16%,rgba(167,139,250,0.16),transparent_30%),linear-gradient(145deg,rgba(18,24,27,0.98),rgba(8,8,12,0.99))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:p-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-100/76">Queer Atlas travel intelligence</p>
          <h1 className="qa-display mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-white sm:text-6xl">LGBTQ+ Travel Guide</h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">A grounded way to choose an LGBTQ+-friendly destination, understand local context, and make a plan that works beyond a generic list of places.</p>
          <div className="mt-7 flex flex-wrap gap-2">
            <Link href="/cities" className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-50">Explore LGBTQ-Friendly Cities</Link>
            <Link href="/events" className="rounded-full border border-emerald-100/30 bg-emerald-100/[0.10] px-4 py-2.5 text-sm font-semibold text-emerald-50 transition hover:border-emerald-100/50">LGBTQ+ Events & Pride Calendar</Link>
            <Link href="/topics/safety" className="rounded-full border border-white/18 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:border-white/32">Travel safety context</Link>
          </div>
        </section>

        <EditorialDisclosure className="mt-5" author={editorial.author} reviewer={editorial.reviewer} publishedAt={editorial.publishedAt} updatedAt={editorial.updatedAt} researchScope={editorial.researchScope} changeLog={editorial.changeLog} sources={editorial.sources} />

        <JourneyDeck
          className="mt-8"
          title="Start with the question behind your trip"
          intro="Choose a path instead of wading through a generic destination list. Each route opens the relevant live Atlas layer."
          cards={[
            { href: "/cities", kicker: "Choose a destination", title: "Compare LGBTQ-Friendly Cities", description: "Start with city context, local places, and current scene signal.", accent: "cyan" },
            { href: "/events", kicker: "Choose the moment", title: "Find Events & Pride Dates", description: "Use the calendar to anchor a trip around what is genuinely happening.", accent: "fuchsia" },
            { href: "/topics/safety", kicker: "Plan with context", title: "Read Travel Safety Context", description: "Use country and city information without treating it as a promise of safety.", accent: "amber" },
          ]}
        />

        <section className="mt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-100/72">A better trip starts with better questions</p>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {PLANNING_PILLARS.map(([title, text], index) => <article key={title} className="rounded-[24px] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.018))] p-5"><span className="grid h-8 w-8 place-items-center rounded-full border border-fuchsia-100/28 bg-fuchsia-100/[0.09] text-xs font-semibold text-fuchsia-50">0{index + 1}</span><h2 className="mt-4 text-lg font-semibold text-white">{title}</h2><p className="mt-2 text-sm leading-7 text-white/70">{text}</p></article>)}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-cyan-100/16 bg-[linear-gradient(145deg,rgba(34,211,238,0.09),rgba(8,10,14,0.98))] p-6 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/76">Go deeper, where it matters</p>
          <h2 className="qa-display mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">Choose your planning path</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/gay-guide" className="rounded-2xl border border-white/12 bg-black/20 p-4 transition hover:border-cyan-100/34"><strong className="block text-sm text-white">Gay Travel Guide</strong><span className="mt-1 block text-xs leading-5 text-white/60">Nightlife-first routes and venue discovery.</span></Link>
            <Link href="/topics/nightlife" className="rounded-2xl border border-white/12 bg-black/20 p-4 transition hover:border-cyan-100/34"><strong className="block text-sm text-white">Queer Nightlife</strong><span className="mt-1 block text-xs leading-5 text-white/60">Plan a night by city, vibe, and practical fallback.</span></Link>
            <Link href="/topics/safety" className="rounded-2xl border border-white/12 bg-black/20 p-4 transition hover:border-cyan-100/34"><strong className="block text-sm text-white">Travel Safety</strong><span className="mt-1 block text-xs leading-5 text-white/60">Use current context before you go.</span></Link>
            <Link href="/dictionary" className="rounded-2xl border border-white/12 bg-black/20 p-4 transition hover:border-cyan-100/34"><strong className="block text-sm text-white">Queer Dictionary</strong><span className="mt-1 block text-xs leading-5 text-white/60">Clear language and community context.</span></Link>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-white/12 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">LGBTQ+ Travel Guide FAQ</h2>
          <div className="mt-4 space-y-3">{faqs.map(([question, answer]) => <article key={question} className="rounded-2xl border border-white/10 bg-black/20 p-4"><h3 className="text-sm font-semibold text-white">{question}</h3><p className="mt-2 text-sm leading-7 text-white/72">{answer}</p></article>)}</div>
        </section>
      </div>
    </main>
  );
}
