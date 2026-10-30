import { serializeJsonLd } from "@/lib/jsonLd";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTopicHub, listTopicHubs } from "@/lib/seo/topicHubs";
import { QA_ORGANIZATION_ID, QA_SITE_URL, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";
import {
  evaluateTopicHubIndexability,
  loadIndexableTopicHubRoutes,
} from "@/lib/seo/topicHubRoutes";
import { normalizeLocale } from "@/lib/i18n/locales";
import { localePath, localizedAlternates, localizedOpenGraphUrl } from "@/lib/seo/localizedSeo";
import JourneyDeck from "@/components/seo/JourneyDeck";

function toAbsoluteUrl(path = "", locale) {
  return `${QA_SITE_URL}${localePath(path, locale)}`;
}

function buildTopicPath(topic = "") {
  return `/topics/${topic}`;
}

export function generateStaticParams() {
  return listTopicHubs().map((hub) => ({ topic: hub.key }));
}

export async function generateMetadata({ params }) {
  const locale = normalizeLocale((await headers()).get("x-qa-locale"));
  const resolved = await params;
  const topic = String(resolved?.topic || "").trim().toLowerCase();
  const hub = getTopicHub(topic);

  if (!hub) {
    return {
      title: "Topic Hub Not Found",
      robots: { index: false, follow: false },
    };
  }

  const canonical = buildTopicPath(hub.key);
  const cityClusterRoutes = await loadIndexableTopicHubRoutes(hub.key);
  const quality = evaluateTopicHubIndexability({ hub, routes: cityClusterRoutes });
  const title = `${hub.title} 2026`;
  const description = `${hub.description} Compare city-by-city discover routes, safety context, and social signal in one topical hub.`;

  return {
    title,
    description,
    alternates: localizedAlternates(canonical, locale),
    openGraph: {
      title,
      description,
      url: localizedOpenGraphUrl(canonical, locale),
      siteName: "Queer Atlas",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: quality.indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

function buildTopicHubFaqEntries({ hub, cityCount, routeCount }) {
  return [
    {
      question: `What does ${hub.title} help me decide?`,
      answer: `${hub.title} helps you compare city-level routes for the same intent so you can decide where to go with less friction and stronger context.`,
    },
    {
      question: "How broad is this topic hub coverage?",
      answer: `This hub currently covers ${cityCount} cities and ${routeCount} city-topic routes to support high-intent planning with reproducible route paths.`,
    },
    {
      question: `How should I use ${hub.title} with events and city pages?`,
      answer: "Open a city cluster from this hub, validate current events in that city, then finalize your route with saved places and one backup option.",
    },
    {
      question: "Are these routes static lists or live planning paths?",
      answer: "These hubs are planning paths designed to bridge topical intent with city-level discover routes and practical next actions.",
    },
    {
      question: "What is the best fallback method when first route choices fail?",
      answer: "Keep one backup route in the same city zone, then re-check timing and crowd signal before switching to avoid route breakdown.",
    },
    {
      question: "Can this hub be cited for AI/search summaries?",
      answer: "Yes. Cite the exact topic hub URL plus the specific city-route URL used for the claim, and reference freshness from the Now layer when relevant.",
    },
  ];
}

function buildTopicHubFaqJsonLd({ faqEntries = [] }) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}

export default async function TopicHubPage({ params }) {
  const locale = normalizeLocale((await headers()).get("x-qa-locale"));
  const resolved = await params;
  const topic = String(resolved?.topic || "").trim().toLowerCase();
  const hub = getTopicHub(topic);

  if (!hub) notFound();

  const canonical = buildTopicPath(hub.key);
  const cityClusterRoutes = await loadIndexableTopicHubRoutes(hub.key);
  const selectedCitiesCount = new Set(cityClusterRoutes.map((route) => route.city)).size;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${toAbsoluteUrl(canonical, locale)}#collection`,
    url: toAbsoluteUrl(canonical, locale),
    name: hub.title,
    description: hub.description,
    isPartOf: {
      "@id": QA_WEBSITE_ID,
    },
    publisher: {
      "@id": QA_ORGANIZATION_ID,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: cityClusterRoutes.length,
      itemListElement: cityClusterRoutes.map((route, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: toAbsoluteUrl(route.href, locale),
        name: route.label,
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: toAbsoluteUrl("/", locale) },
      { "@type": "ListItem", position: 2, name: "Topics", item: toAbsoluteUrl("/topics", locale) },
      { "@type": "ListItem", position: 3, name: hub.title, item: toAbsoluteUrl(canonical, locale) },
    ],
  };

  const faqEntries = buildTopicHubFaqEntries({
    hub,
    cityCount: selectedCitiesCount,
    routeCount: cityClusterRoutes.length,
  });
  const faqJsonLd = buildTopicHubFaqJsonLd({ faqEntries });
  const decisionSteps = hub.decisionSteps || [
    "Choose a city route that matches the planning question you need to answer.",
    "Check the city guide and current events before making a final plan.",
    "Save a practical backup option in the same city area.",
  ];

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="relative overflow-hidden rounded-[30px] border border-cyan-100/16 bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_88%_15%,rgba(244,114,182,0.13),transparent_30%),linear-gradient(145deg,rgba(19,23,33,0.98),rgba(6,7,12,0.99))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-100/40 to-transparent" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/78">{hub.eyebrow || "Queer Atlas discovery guide"}</p>
          <h1 className="qa-display mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">{hub.title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/78 sm:text-base">{hub.description}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/72">
            <span className="rounded-full border border-white/16 bg-white/[0.06] px-3 py-1.5">{selectedCitiesCount} cities to compare</span>
            <span className="rounded-full border border-white/16 bg-white/[0.06] px-3 py-1.5">{cityClusterRoutes.length} live route paths</span>
            <Link href="/events" className="rounded-full border border-cyan-100/28 bg-cyan-100/[0.09] px-3 py-1.5 text-cyan-50 transition hover:border-cyan-100/45">Check events</Link>
          </div>
        </section>

        <section className="rounded-[26px] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fuchsia-100/68">Make the next decision easier</p>
          <h2 className="qa-display mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">{hub.decisionTitle || "Plan with practical context"}</h2>
          <ol className="mt-5 grid gap-3 md:grid-cols-3">
            {decisionSteps.map((step, index) => (
              <li key={step} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/76">
                <span className="mb-3 grid h-7 w-7 place-items-center rounded-full border border-fuchsia-100/26 bg-fuchsia-100/[0.08] text-xs font-semibold text-fuchsia-50">0{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <JourneyDeck
          title={hub.key === "safety" ? "Make a more informed travel plan" : "Turn a night out into a workable plan"}
          intro={hub.key === "safety" ? "Move from country context to a city, current updates, and places you can verify close to your trip." : "Move from nightlife intent to a city, current events, and a practical fallback."}
          cards={hub.key === "safety"
            ? [
                { href: "/qari", kicker: "Country context", title: "Open the QARI map", description: "Read published risk context and source-led country detail.", accent: "amber" },
                { href: "/cities", kicker: "Choose a city", title: "Compare LGBTQ-Friendly Cities", description: "Explore city-level scene and planning information.", accent: "cyan" },
                { href: "/now", kicker: "Stay current", title: "Read the latest Atlas updates", description: "Use current news and policy context alongside your own checks.", accent: "violet" },
              ]
            : [
                { href: "/cities", kicker: "Choose a city", title: "Open a city nightlife guide", description: "Start with neighbourhood context, places, and local scene signal.", accent: "cyan" },
                { href: "/events", kicker: "Choose a date", title: "Find events and Pride dates", description: "Add what is happening now or next to your route.", accent: "fuchsia" },
                { href: "/gay-guide", kicker: "Go deeper", title: "Build a gay travel route", description: "Use city, venue, and event context for a fuller trip plan.", accent: "amber" },
              ]}
        />

        <section className="rounded-[24px] border border-cyan-200/18 bg-[linear-gradient(145deg,rgba(34,211,238,0.08),rgba(10,10,10,0.94))] p-6">
          <h2 className="text-lg font-semibold text-cyan-50">What this guide can — and cannot — tell you</h2>
          <p className="mt-2 text-sm leading-7 text-cyan-50/84">
            This guide maps {cityClusterRoutes.length} city-topic routes across {selectedCitiesCount} cities. It helps you find a useful starting point; availability, entry rules, safety conditions, and event details can change. For source standards, open reports; for current updates, use <Link href="/now" className="underline decoration-cyan-200/50 underline-offset-2">Now</Link>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link href="/community-policy" className="rounded-full border border-white/20 bg-white/8 px-3 py-1 text-white/84 transition hover:border-white/34 hover:text-white">
              Moderation policy
            </Link>
            <Link href="/topics" className="rounded-full border border-cyan-200/28 bg-cyan-200/12 px-3 py-1 text-cyan-50 transition hover:border-cyan-100/45">
              All topic hubs
            </Link>
            <Link href="/reports" className="rounded-full border border-fuchsia-200/28 bg-fuchsia-200/12 px-3 py-1 text-fuchsia-100 transition hover:border-fuchsia-100/45">
              Open reports
            </Link>
          </div>
        </section>

        <section className="rounded-[24px] border border-white/12 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">City Cluster Routes</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {cityClusterRoutes.map((route) => (
              <Link
                key={`${route.city}-${route.clusterKey}`}
                href={route.href}
                className="rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white/84 transition hover:border-cyan-200/34 hover:text-white"
              >
                {route.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-white/12 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">FAQ</h2>
          <div className="mt-3 space-y-4">
            {faqEntries.map((entry) => (
              <article key={entry.question} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                <h3 className="text-sm font-semibold text-white">{entry.question}</h3>
                <p className="mt-1 text-sm leading-7 text-white/80">{entry.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <nav className="flex flex-wrap gap-2">
          <Link
            href="/cities"
            className="rounded-full border border-white/16 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.12em] text-white/84"
          >
            Back to Cities
          </Link>
          <Link
            href="/events"
            className="rounded-full border border-fuchsia-200/26 bg-fuchsia-200/12 px-4 py-2 text-xs uppercase tracking-[0.12em] text-fuchsia-100"
          >
            Open Events
          </Link>
        </nav>
      </div>
    </main>
  );
}
