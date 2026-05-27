import Link from "next/link";
import { notFound } from "next/navigation";
import { cityCoreConfig } from "@/lib/cityCore";
import { getTopicHub, listTopicHubs } from "@/lib/seo/topicHubs";
import { QA_ORGANIZATION_ID, QA_SITE_URL, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";
import { humanizeCityKey, humanizeTopicKey, listCitationRules, listSourceTaxonomy } from "@/lib/seo/entityConsistency";

function toAbsoluteUrl(path = "") {
  return `${QA_SITE_URL}${path}`;
}

function buildTopicPath(topic = "") {
  return `/topics/${topic}`;
}

export function generateStaticParams() {
  return listTopicHubs().map((hub) => ({ topic: hub.key }));
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const topic = String(resolved?.topic || "").trim().toLowerCase();
  const hub = getTopicHub(topic);

  if (!hub) {
    return {
      title: "Topic Hub Not Found | Queer Atlas",
      robots: { index: false, follow: false },
    };
  }

  const canonical = buildTopicPath(hub.key);
  const title = `${hub.title} 2026 | Queer Atlas`;
  const description = `${hub.description} Compare city-by-city discover routes, safety context, and social signal in one topical hub.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: toAbsoluteUrl(canonical),
      siteName: "Queer Atlas",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
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
  const resolved = await params;
  const topic = String(resolved?.topic || "").trim().toLowerCase();
  const hub = getTopicHub(topic);

  if (!hub) notFound();

  const canonical = buildTopicPath(hub.key);
  const selectedCities = hub.cities.filter((city) => cityCoreConfig[city]);
  const sourceTaxonomy = listSourceTaxonomy();
  const citationRules = listCitationRules();
  const clusterKeys = Array.isArray(hub.clusterKeys) && hub.clusterKeys.length > 0
    ? hub.clusterKeys
    : hub.clusterKey
      ? [hub.clusterKey]
      : [];
  const cityClusterRoutes = selectedCities.flatMap((city) =>
    clusterKeys.map((clusterKey) => ({
      city,
      clusterKey,
      href: `/${city}/discover/${clusterKey}`,
      label: `${humanizeCityKey(city)} - ${humanizeTopicKey(clusterKey)}`,
    })),
  );

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${toAbsoluteUrl(canonical)}#collection`,
    url: toAbsoluteUrl(canonical),
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
        url: toAbsoluteUrl(route.href),
        name: `${hub.title} in ${humanizeCityKey(route.city)} - ${humanizeTopicKey(route.clusterKey)}`,
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${QA_SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Topics", item: `${QA_SITE_URL}/topics` },
      { "@type": "ListItem", position: 3, name: hub.title, item: toAbsoluteUrl(canonical) },
    ],
  };

  const faqEntries = buildTopicHubFaqEntries({
    hub,
    cityCount: selectedCities.length,
    routeCount: cityClusterRoutes.length,
  });
  const faqJsonLd = buildTopicHubFaqJsonLd({ faqEntries });

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[28px] border border-white/12 bg-white/[0.03] p-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/78">Topical Dominance Hub</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{hub.title}</h1>
          <p className="mt-3 text-sm leading-7 text-white/82">{hub.description}</p>
        </section>

        <section className="rounded-[24px] border border-cyan-200/18 bg-[linear-gradient(145deg,rgba(34,211,238,0.08),rgba(10,10,10,0.94))] p-6">
          <h2 className="text-lg font-semibold text-cyan-50">Evidence and freshness for this hub</h2>
          <p className="mt-2 text-sm leading-7 text-cyan-50/84">
            This hub currently maps {cityClusterRoutes.length} city-topic routes across {selectedCities.length} cities.
            Use route-level pages as the canonical decision layer, then validate timing and momentum in <Link href="/now" className="underline decoration-cyan-200/50 underline-offset-2">Now</Link> before publishing or sharing.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-cyan-50/82">
            {sourceTaxonomy.map((item) => (
              <li key={item.key}>
                <span className="font-semibold text-cyan-50">{item.label}</span>: {item.description}
              </li>
            ))}
            {citationRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link href="/community-policy" className="rounded-full border border-white/20 bg-white/8 px-3 py-1 text-white/84 transition hover:border-white/34 hover:text-white">
              Moderation policy
            </Link>
            <Link href="/topics" className="rounded-full border border-cyan-200/28 bg-cyan-200/12 px-3 py-1 text-cyan-50 transition hover:border-cyan-100/45">
              All topic hubs
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
                {hub.title} in {humanizeCityKey(route.city)} - {humanizeTopicKey(route.clusterKey)}
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
