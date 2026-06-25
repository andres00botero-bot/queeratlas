import Link from "next/link";
import { notFound } from "next/navigation";
import { ATLAS_COLLECTIONS, getAtlasCollectionBySlug } from "@/lib/atlasCollections";
import { cityCoreConfig } from "@/lib/cityCore";
import {
  QA_LOGO_URL,
  QA_ORGANIZATION_ID,
  QA_ORGANIZATION_NAME,
  QA_SITE_URL,
  QA_WEBSITE_ID,
} from "@/lib/seo/entityAuthority";

function formatCitySlug(value = "") {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
}

function formatCollectionDescription(collection) {
  return String(collection?.summary || "").replace(/\s+/g, " ").trim().slice(0, 155);
}

export function generateStaticParams() {
  return ATLAS_COLLECTIONS.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const collection = getAtlasCollectionBySlug(slug);
  if (!collection) return {};

  return {
    title: `${collection.title} | Queer Atlas`,
    description: formatCollectionDescription(collection),
    alternates: {
      canonical: collection.href,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${collection.title} | Queer Atlas`,
      description: formatCollectionDescription(collection),
      url: collection.href,
      type: "article",
      images: [
        {
          url: "/queer-atlas-heart-logo-progress.png",
          width: 1200,
          height: 630,
          alt: collection.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${collection.title} | Queer Atlas`,
      description: formatCollectionDescription(collection),
      images: ["/queer-atlas-heart-logo-progress.png"],
    },
  };
}

export default async function AtlasCollectionDetailPage({ params }) {
  const { slug } = await params;
  const collection = getAtlasCollectionBySlug(slug);
  if (!collection) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${QA_SITE_URL}${collection.href}`,
    url: `${QA_SITE_URL}${collection.href}`,
    headline: collection.title,
    description: collection.summary,
    dateModified: "2026-06-25",
    inLanguage: "en",
    isPartOf: {
      "@id": QA_WEBSITE_ID,
    },
    publisher: {
      "@type": "Organization",
      "@id": QA_ORGANIZATION_ID,
      name: QA_ORGANIZATION_NAME,
      logo: {
        "@type": "ImageObject",
        url: QA_LOGO_URL,
      },
    },
    mainEntity: {
      "@type": "ItemList",
      name: collection.title,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: collection.items.length,
      itemListElement: collection.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item,
        item: {
          "@type": "Place",
          name: item,
          address: collection.cities[index] || collection.cities[0] || "Global",
        },
      })),
    },
  };

  return (
    <main className="qa-page min-h-screen bg-[radial-gradient(circle_at_12%_8%,rgba(125,211,252,0.12),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(216,180,254,0.10),transparent_28%),linear-gradient(180deg,#05070d_0%,#080912_52%,#040406_100%)] px-4 py-8 text-white sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.16em] text-white/52">
          <Link href="/now" className="transition hover:text-white">Now</Link>
          <span>/</span>
          <Link href="/now/collections" className="transition hover:text-white">Atlas Collections</Link>
        </div>

        <section className="mt-5 overflow-hidden rounded-[30px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.14),transparent_32%),radial-gradient(circle_at_88%_0%,rgba(216,180,254,0.10),transparent_30%),linear-gradient(180deg,rgba(13,18,29,0.96),rgba(8,10,15,0.98))] p-6 shadow-[0_34px_120px_rgba(2,6,23,0.42)] sm:p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/76">{collection.eyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl">
            {collection.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">{collection.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {collection.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/12 bg-white/[0.045] px-3 py-1.5 text-[11px] text-white/68">
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/72">The picks</p>
            <ol className="mt-4 space-y-3">
              {collection.items.map((item, index) => {
                const city = collection.cities[index] || collection.cities[0] || "";
                const citySlug = formatCitySlug(city);
                const hasCity = Boolean(citySlug && cityCoreConfig[citySlug]);
                return (
                  <li key={`${collection.id}-${item}`} className="rounded-2xl border border-white/10 bg-black/24 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">#{index + 1}</p>
                        <h2 className="mt-2 text-lg font-semibold text-white">{item}</h2>
                        <p className="mt-1 text-sm text-white/58">{city || "Global"}</p>
                      </div>
                      {hasCity && (
                        <Link href={`/${citySlug}`} className="rounded-full border border-cyan-200/26 bg-cyan-200/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-100/48">
                          City guide
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <aside className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/72">Why this list exists</p>
            <p className="mt-3 text-sm leading-7 text-white/70">{collection.methodology}</p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-white/44">Updated</p>
              <p className="mt-1 text-sm text-white/72">June 2026</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
