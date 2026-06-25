import Link from "next/link";
import { ATLAS_COLLECTIONS, ATLAS_COLLECTION_FILTERS } from "@/lib/atlasCollections";
import {
  QA_ORGANIZATION_ID,
  QA_SITE_URL,
  QA_WEBSITE_ID,
} from "@/lib/seo/entityAuthority";

export const metadata = {
  title: "Atlas Collections | Curated Queer Travel Lists",
  description:
    "Curated Queer Atlas collections for LGBTQ nightlife, queer beaches, lesbian bars, drag venues, hidden cafes, and solo-friendly routes.",
  alternates: {
    canonical: "/now/collections",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AtlasCollectionsIndexPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${QA_SITE_URL}/now/collections`,
    url: `${QA_SITE_URL}/now/collections`,
    name: "Atlas Collections",
    description:
      "Curated Queer Atlas collections for LGBTQ nightlife, queer beaches, lesbian bars, drag venues, hidden cafes, and solo-friendly routes.",
    isPartOf: {
      "@id": QA_WEBSITE_ID,
    },
    publisher: {
      "@id": QA_ORGANIZATION_ID,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: ATLAS_COLLECTIONS.map((collection, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${QA_SITE_URL}${collection.href}`,
        name: collection.title,
      })),
    },
  };

  return (
    <main className="qa-page min-h-screen bg-[radial-gradient(circle_at_12%_8%,rgba(125,211,252,0.12),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(216,180,254,0.10),transparent_28%),linear-gradient(180deg,#05070d_0%,#080912_52%,#040406_100%)] px-4 py-8 text-white sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-7xl">
        <Link href="/now" className="text-xs uppercase tracking-[0.18em] text-amber-100/70 transition hover:text-amber-50">
          Back to Now
        </Link>
        <section className="mt-5 rounded-[30px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.14),transparent_32%),linear-gradient(180deg,rgba(13,18,29,0.96),rgba(8,10,15,0.98))] p-6 shadow-[0_34px_120px_rgba(2,6,23,0.42)] sm:p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/76">Atlas Collections</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl">
            Curated queer travel lists
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
            Hand-picked lists for nights out, beach days, drag rooms, lesbian bars, hidden cafes, and first-night routes.
          </p>
        </section>

        <div className="mt-6 flex flex-wrap gap-2">
          {ATLAS_COLLECTION_FILTERS.map((filter) => (
            <span key={filter.id} className="rounded-full border border-white/12 bg-white/[0.045] px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-white/64">
              {filter.label}
            </span>
          ))}
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ATLAS_COLLECTIONS.map((collection) => (
            <article key={collection.id} className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-[1px] hover:border-cyan-200/26 hover:shadow-[0_24px_70px_rgba(34,211,238,0.08)]">
              <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-100/70">{collection.eyebrow}</p>
              <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-white">{collection.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/68">{collection.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {collection.tags.map((tag) => (
                  <span key={`${collection.id}-${tag}`} className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-white/62">
                    {tag}
                  </span>
                ))}
              </div>
              <Link href={collection.href} className="mt-5 inline-flex rounded-full border border-cyan-200/26 bg-cyan-200/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-100/48 hover:bg-cyan-200/16">
                View collection
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
