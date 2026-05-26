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

export default async function TopicHubPage({ params }) {
  const resolved = await params;
  const topic = String(resolved?.topic || "").trim().toLowerCase();
  const hub = getTopicHub(topic);

  if (!hub) notFound();

  const canonical = buildTopicPath(hub.key);
  const selectedCities = hub.cities.filter((city) => cityCoreConfig[city]);

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
      numberOfItems: selectedCities.length,
      itemListElement: selectedCities.map((city, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: toAbsoluteUrl(`/${city}/discover/${hub.clusterKey}`),
        name: `${hub.title} in ${humanizeCity(city)}`,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[28px] border border-white/12 bg-white/[0.03] p-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/78">Topical Dominance Hub</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{hub.title}</h1>
          <p className="mt-3 text-sm leading-7 text-white/82">{hub.description}</p>
        </section>

        <section className="rounded-[24px] border border-white/12 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">City Cluster Routes</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {selectedCities.map((city) => (
              <Link
                key={city}
                href={`/${city}/discover/${hub.clusterKey}`}
                className="rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white/84 transition hover:border-cyan-200/34 hover:text-white"
              >
                {hub.title} in {humanizeCity(city)}
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
