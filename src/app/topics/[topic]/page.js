import Link from "next/link";
import { notFound } from "next/navigation";
import { cityCoreConfig } from "@/lib/cityCore";
import { getTopicHub, listTopicHubs } from "@/lib/seo/topicHubs";
import { QA_ORGANIZATION_ID, QA_SITE_URL, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";

function toAbsoluteUrl(path = "") {
  return `${QA_SITE_URL}${path}`;
}

function humanizeCity(value = "") {
  return String(value || "")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

function buildTopicHubFaqJsonLd({ hub, cityCount, routeCount }) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What does ${hub.title} help me decide?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${hub.title} helps you compare city-level routes for the same intent so you can decide where to go with less friction.`,
        },
      },
      {
        "@type": "Question",
        name: `How broad is this topic hub coverage?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `This hub currently covers ${cityCount} cities and ${routeCount} city-topic routes to support high-intent planning.`,
        },
      },
      {
        "@type": "Question",
        name: `How should I use ${hub.title} with events and city pages?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Open a city cluster from this hub, validate current events in that city, then finalize your route with saved places.",
        },
      },
      {
        "@type": "Question",
        name: "Are these routes static lists or live planning paths?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "These hubs are planning paths designed to bridge topical intent with city-level discover routes and practical next actions.",
        },
      },
      {
        "@type": "Question",
        name: "What is the best fallback method when first route choices fail?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Keep one backup route in the same city zone, then re-check timing and crowd signal before switching.",
        },
      },
      {
        "@type": "Question",
        name: "Can this hub be cited for AI/search summaries?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Cite the exact topic hub URL plus the specific city-route URL used for the claim, and reference freshness from the Now layer when relevant.",
        },
      },
    ],
  };
}

export default async function TopicHubPage({ params }) {
  const resolved = await params;
  const topic = String(resolved?.topic || "").trim().toLowerCase();
  const hub = getTopicHub(topic);

  if (!hub) notFound();

  const canonical = buildTopicPath(hub.key);
  const selectedCities = hub.cities.filter((city) => cityCoreConfig[city]);
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
      label: `${humanizeCity(city)} - ${clusterKey.replaceAll("-", " ")}`,
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
        name: `${hub.title} in ${humanizeCity(route.city)} - ${route.clusterKey.replaceAll("-", " ")}`,
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

  const faqJsonLd = buildTopicHubFaqJsonLd({
    hub,
    cityCount: selectedCities.length,
    routeCount: cityClusterRoutes.length,
  });

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
            <li>Official sources: organizer or venue links from route-level pages.</li>
            <li>Community sources: moderated member signal with quality controls.</li>
            <li>Operational rule: cite page URL + city + route intent for reproducible context.</li>
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
                {hub.title} in {humanizeCity(route.city)} - {route.clusterKey.replaceAll("-", " ")}
              </Link>
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
