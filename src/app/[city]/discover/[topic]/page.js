import Link from "next/link";
import { notFound } from "next/navigation";
import { cityCoreConfig } from "@/lib/cityCore";
import { cityNameFromConfig, normalizeCityKey } from "@/features/city/checkinFeature";
import { getCityKeywordOwnership } from "@/lib/seo/keywordOwnership";
import { getCityClusterTopic, listCityClusterTopics } from "@/lib/seo/cityClusters";

export const revalidate = 600;

function toAbsoluteUrl(path = "") {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://www.queeratlas.app";
  return `${String(baseUrl).replace(/\/+$/, "")}${path}`;
}

function buildCanonicalPath(city = "", topic = "") {
  return `/${city}/discover/${topic}`;
}

function buildClusterJsonLd({ city, cityName, topic, topicConfig }) {
  const canonicalPath = buildCanonicalPath(city, topic);
  const canonicalUrl = toAbsoluteUrl(canonicalPath);
  const related = [
    `/${city}`,
    `/${city}/events`,
    "/events",
    "/now",
  ].map((path) => toAbsoluteUrl(path));

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonicalUrl}#cluster`,
    name: `${topicConfig.title} ${cityName}`,
    url: canonicalUrl,
    about: topicConfig.keyphrases.map((phrase) => `${phrase} ${cityName}`),
    isPartOf: {
      "@type": "WebSite",
      name: "Queer Atlas",
      url: "https://www.queeratlas.app",
    },
    relatedLink: related,
  };
}

function buildBreadcrumbJsonLd({ city, cityName, topic, topicConfig }) {
  const canonicalPath = buildCanonicalPath(city, topic);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: toAbsoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Cities",
        item: toAbsoluteUrl("/cities"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cityName,
        item: toAbsoluteUrl(`/${city}`),
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${topicConfig.title} in ${cityName}`,
        item: toAbsoluteUrl(canonicalPath),
      },
    ],
  };
}

function buildRelatedTopicsItemListJsonLd({ city, cityName, relatedTopics = [] }) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Related ${cityName} queer topic guides`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: relatedTopics.length,
    itemListElement: relatedTopics.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: toAbsoluteUrl(buildCanonicalPath(city, entry.key)),
      name: `${entry.title} in ${cityName}`,
    })),
  };
}

function buildFaqJsonLd({ cityName, topicConfig }) {
  const questionBase = topicConfig?.title || "Queer city guide";
  const summary = String(topicConfig?.summary || "").trim();

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What does ${questionBase} in ${cityName} help with?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${questionBase} in ${cityName} helps you plan faster with practical route context, safer fallbacks, and local signal clarity.`,
        },
      },
      {
        "@type": "Question",
        name: `How is this ${cityName} guide different from a generic nightlife list?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${summary} This guide is structured for decision-making, not just listing venues.`,
        },
      },
      {
        "@type": "Question",
        name: `Can I use this guide for same-night planning in ${cityName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. The guide is built for high-intent planning with clear links to city, events, and related topic paths in ${cityName}.`,
        },
      },
    ],
  };
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const city = normalizeCityKey(resolved?.city || "");
  const topic = String(resolved?.topic || "").trim().toLowerCase();
  const config = cityCoreConfig[city] || null;
  const topicConfig = getCityClusterTopic(topic);

  if (!config || !topicConfig) {
    return {
      title: "Cluster Not Found | Queer Atlas",
      robots: { index: false, follow: false },
    };
  }

  const cityName = cityNameFromConfig(config, city);
  const canonical = buildCanonicalPath(city, topic);
  const ownership = getCityKeywordOwnership(cityName);
  const title = `${topicConfig.title} ${cityName} (2026) | Queer Atlas`;
  const description = `${topicConfig.summary} ${cityName} queer signal guide for 2026 with safer route context, vibe filters, and event-aware alternatives.`;

  return {
    title,
    description,
    keywords: [
      ...topicConfig.keyphrases.map((phrase) => `${phrase} ${cityName}`),
      ownership.primary,
      ...ownership.secondary.slice(0, 4),
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
    },
  };
}

export default async function CityClusterTopicPage({ params }) {
  const resolved = await params;
  const city = normalizeCityKey(resolved?.city || "");
  const topic = String(resolved?.topic || "").trim().toLowerCase();
  const config = cityCoreConfig[city] || null;
  const topicConfig = getCityClusterTopic(topic);

  if (!config || !topicConfig) {
    notFound();
  }

  const cityName = cityNameFromConfig(config, city);
  const canonicalPath = buildCanonicalPath(city, topic);
  const canonicalUrl = toAbsoluteUrl(canonicalPath);
  const relatedTopics = listCityClusterTopics().filter((entry) => entry.key !== topic).slice(0, 4);
  const clusterJsonLd = buildClusterJsonLd({ city, cityName, topic, topicConfig });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({ city, cityName, topic, topicConfig });
  const relatedTopicsItemListJsonLd = buildRelatedTopicsItemListJsonLd({ city, cityName, relatedTopics });
  const faqJsonLd = buildFaqJsonLd({ cityName, topicConfig });
  const graphJsonLd = [clusterJsonLd, breadcrumbJsonLd, relatedTopicsItemListJsonLd, faqJsonLd];

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphJsonLd) }}
      />
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-[28px] border border-white/12 bg-white/[0.03] p-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/78">City Cluster Guide</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{topicConfig.title} in {cityName}</h1>
          <p className="mt-3 text-sm leading-7 text-white/82">
            {topicConfig.summary} This page is tuned for high-intent local search in {cityName}, with
            practical decision points that reduce guesswork and improve safer queer city navigation.
          </p>
        </header>

        <section className="rounded-[24px] border border-white/12 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">What this cluster solves</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white/82">
            <li>Faster route planning for {topicConfig.intent} intent in {cityName}.</li>
            <li>Safer decision support with alternatives when the first stop is not a fit.</li>
            <li>Clear bridge from discovery to real-world movement with less friction.</li>
          </ul>
        </section>

        <section className="rounded-[24px] border border-white/12 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">Related cluster pages</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {relatedTopics.map((entry) => (
              <Link
                key={entry.key}
                href={buildCanonicalPath(city, entry.key)}
                className="rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white/84 transition hover:border-cyan-200/34 hover:text-white"
              >
                {entry.title} in {cityName}
              </Link>
            ))}
          </div>
        </section>

        <nav className="flex flex-wrap gap-2">
          <Link
            href={`/${city}`}
            className="rounded-full border border-white/16 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.12em] text-white/84"
          >
            Back to {cityName}
          </Link>
          <Link
            href={`/${city}?section=events`}
            className="rounded-full border border-fuchsia-200/26 bg-fuchsia-200/12 px-4 py-2 text-xs uppercase tracking-[0.12em] text-fuchsia-100"
          >
            Open Events in City
          </Link>
          <span className="rounded-full border border-white/12 bg-black/35 px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-white/52">
            canonical: {canonicalUrl}
          </span>
        </nav>
      </div>
    </main>
  );
}
