import Link from "next/link";
import { cityCoreConfig } from "@/lib/cityCore";
import { listCityClusterTopics } from "@/lib/seo/cityClusters";
import { listTopicHubs } from "@/lib/seo/topicHubs";
import { QA_SITE_URL } from "@/lib/seo/entityAuthority";
import { isIndexableTopicHub, isTier1CityTopic } from "@/lib/seo/indexingTier";

export const metadata = {
  title: "Queer Topic Hubs 2026",
  description:
    "Topical queer discovery hubs across nightlife, safety, events, cafes, and community-led route intelligence.",
  alternates: {
    canonical: "/topics",
  },
};

export default function TopicsIndexPage() {
  const hubs = listTopicHubs().filter((hub) => isIndexableTopicHub(hub.key));
  const cityKeys = Object.keys(cityCoreConfig);
  const clusterTopics = listCityClusterTopics();
  const allDiscoverRoutes = cityKeys.flatMap((city) =>
    clusterTopics.map((topic) => ({
      city,
      topic: topic.key,
      href: `/${city}/discover/${topic.key}`,
    })).filter((route) => isTier1CityTopic(route.city, route.topic)),
  );
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${QA_SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Topics", item: `${QA_SITE_URL}/topics` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What are Queer Topic Hubs on Queer Atlas?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Topic hubs group high-intent queer discovery paths across multiple cities so you can compare routes faster.",
        },
      },
      {
        "@type": "Question",
        name: "How do topic hubs connect to city guides?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Each topic hub links directly to city-level discover pages so you can move from global topic intent to local route decisions.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use topic hubs for trip planning this week?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Start in a topic hub, open city cluster routes, then combine with events and saved places for same-week planning.",
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6">
      <nav aria-label="Internal discover crawl links" className="sr-only">
        <Link href="/topics">topics</Link>
        {hubs.map((hub) => (
          <Link key={`topics-crawl-hub-${hub.key}`} href={`/topics/${hub.key}`}>
            {hub.key}
          </Link>
        ))}
        {allDiscoverRoutes.map((route) => (
          <Link key={`topics-crawl-discover-${route.city}-${route.topic}`} href={route.href}>
            {route.city} {route.topic}
          </Link>
        ))}
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[28px] border border-white/12 bg-white/[0.03] p-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/78">Topical Dominance Layer</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">Queer Topic Hubs</h1>
          <p className="mt-3 text-sm leading-7 text-white/82">
            Jump into high-intent global hubs and then move city-by-city through discover routes.
          </p>
        </section>

        <section className="rounded-[24px] border border-white/12 bg-white/[0.03] p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {hubs.map((hub) => (
              <Link
                key={hub.key}
                href={`/topics/${hub.key}`}
                className="rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white/84 transition hover:border-cyan-200/34 hover:text-white"
              >
                {hub.title}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-cyan-200/18 bg-[linear-gradient(145deg,rgba(34,211,238,0.08),rgba(10,10,10,0.94))] p-6">
          <h2 className="text-lg font-semibold text-cyan-50">Methodology access</h2>
          <p className="mt-2 text-sm leading-7 text-cyan-50/84">
            Keep this hub clean while using reports for full citation and source methodology details.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link href="/community-policy" className="rounded-full border border-white/20 bg-white/8 px-3 py-1 text-white/84 transition hover:border-white/34 hover:text-white">
              Moderation policy
            </Link>
            <Link href="/cities" className="rounded-full border border-cyan-200/28 bg-cyan-200/12 px-3 py-1 text-cyan-50 transition hover:border-cyan-100/45">
              City evidence routes
            </Link>
            <Link href="/reports" className="rounded-full border border-fuchsia-200/28 bg-fuchsia-200/12 px-3 py-1 text-fuchsia-100 transition hover:border-fuchsia-100/45">
              Open reports
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
