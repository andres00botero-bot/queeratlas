import Link from "next/link";
import { notFound } from "next/navigation";
import EditorialDisclosure from "@/components/editorial/EditorialDisclosure";
import { ATLAS_COLLECTIONS, getAtlasCollectionBySlug } from "@/lib/atlasCollections";
import { cityCoreConfig } from "@/lib/cityCore";
import { getPublishedEditorialRecord } from "@/lib/editorialData";
import { buildEditorialAuthorJsonLd, EDITORIAL_TEAM, GUIDE_EDITORIAL_META } from "@/lib/editorialTrust";
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

const ACCENT_STYLES = {
  cyan: "from-cyan-300/22 via-sky-300/7 to-transparent text-cyan-100 border-cyan-200/22",
  amber: "from-amber-300/22 via-orange-300/7 to-transparent text-amber-100 border-amber-200/22",
  fuchsia: "from-fuchsia-300/22 via-pink-300/7 to-transparent text-fuchsia-100 border-fuchsia-200/22",
  rose: "from-rose-300/22 via-orange-300/7 to-transparent text-rose-100 border-rose-200/22",
  violet: "from-violet-300/22 via-fuchsia-300/7 to-transparent text-violet-100 border-violet-200/22",
  emerald: "from-emerald-300/22 via-cyan-300/7 to-transparent text-emerald-100 border-emerald-200/22",
};

export const revalidate = 600;

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
          url: "/queer-atlas-logo.png",
          width: 1024,
          height: 1024,
          alt: collection.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${collection.title} | Queer Atlas`,
      description: formatCollectionDescription(collection),
      images: ["/queer-atlas-logo.png"],
    },
  };
}

export default async function AtlasCollectionDetailPage({ params }) {
  const { slug } = await params;
  const collection = getAtlasCollectionBySlug(slug);
  if (!collection) notFound();
  const researchScope = `${collection.methodology} The current collection reviews ${collection.items.length} named picks or routes across ${collection.cities.length} city references. Operating details and door policies should be confirmed before travel.`;
  const editorial = await getPublishedEditorialRecord(`collection:${collection.slug}`, {
    ...GUIDE_EDITORIAL_META.collection,
    researchScope,
    author: collection.author || EDITORIAL_TEAM,
    reviewer: collection.reviewer || null,
    publishedAt: collection.publishedAt || GUIDE_EDITORIAL_META.collection.publishedAt,
    updatedAt: collection.updatedAt || GUIDE_EDITORIAL_META.collection.updatedAt,
    sources: collection.sources || [],
    changeLog: collection.changeLog || GUIDE_EDITORIAL_META.collection.changeLog,
  });
  const relatedCollections = ATLAS_COLLECTIONS
    .filter((item) => item.id !== collection.id)
    .sort((left, right) => {
      const leftScore = left.filter === collection.filter ? 2 : left.tags.some((tag) => collection.tags.includes(tag)) ? 1 : 0;
      const rightScore = right.filter === collection.filter ? 2 : right.tags.some((tag) => collection.tags.includes(tag)) ? 1 : 0;
      return rightScore - leftScore;
    })
    .slice(0, 3);
  const accentStyle = ACCENT_STYLES[collection.accent] || ACCENT_STYLES.cyan;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${QA_SITE_URL}${collection.href}#article`,
        url: `${QA_SITE_URL}${collection.href}`,
        headline: collection.title,
        description: collection.summary,
        datePublished: editorial.publishedAt,
        dateModified: editorial.updatedAt,
        inLanguage: "en",
        isPartOf: { "@id": QA_WEBSITE_ID },
        publisher: {
          "@type": "Organization",
          "@id": QA_ORGANIZATION_ID,
          name: QA_ORGANIZATION_NAME,
          logo: { "@type": "ImageObject", url: QA_LOGO_URL },
        },
        author: buildEditorialAuthorJsonLd(editorial.author),
        ...(editorial.reviewer ? { reviewedBy: buildEditorialAuthorJsonLd(editorial.reviewer) } : {}),
        ...(editorial.sources.length > 0 ? { citation: editorial.sources.map((source) => source.url) } : {}),
        publishingPrinciples: `${QA_SITE_URL}/editorial-policy`,
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
              description: collection.itemNotes?.[index] || undefined,
            },
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: QA_SITE_URL },
          { "@type": "ListItem", position: 2, name: "Atlas Collections", item: `${QA_SITE_URL}/now/collections` },
          { "@type": "ListItem", position: 3, name: collection.title, item: `${QA_SITE_URL}${collection.href}` },
        ],
      },
    ],
  };

  return (
    <main className="qa-page min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_5%,rgba(34,211,238,0.12),transparent_26%),radial-gradient(circle_at_90%_8%,rgba(232,121,249,0.10),transparent_25%),linear-gradient(180deg,#04050a_0%,#080912_52%,#030305_100%)] px-4 py-6 text-white sm:px-6 sm:py-9">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/44 sm:text-xs">
          <Link href="/now/news" className="transition hover:text-white">Now</Link>
          <span>/</span>
          <Link href="/now/collections" className="transition hover:text-white">Atlas Collections</Link>
          <span>/</span>
          <span className="text-white/72">{collection.title}</span>
        </nav>

        <section className={`mt-5 overflow-hidden rounded-[28px] border bg-[#0d0f14] shadow-[0_30px_90px_rgba(0,0,0,0.34)] sm:rounded-[34px] ${accentStyle.split(" ").at(-1)}`}>
          <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
            <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-11">
              <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${accentStyle.split(" ").at(-2)}`}>{collection.eyebrow}</p>
              <h1 className="mt-4 max-w-3xl text-3xl font-black leading-[1.04] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.6rem]">{collection.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/64 sm:text-lg">{collection.summary}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {collection.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-white/52">{tag}</span>
                ))}
              </div>
            </div>

            <div className="relative min-h-64 overflow-hidden border-t border-white/8 bg-[radial-gradient(circle_at_70%_20%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_25%_75%,rgba(232,121,249,0.10),transparent_28%),#090b10] lg:min-h-[27rem] lg:border-l lg:border-t-0" aria-hidden="true">
              <div className="absolute -right-12 -top-14 h-64 w-64 rounded-full border border-white/10" />
              <div className="absolute right-8 top-8 h-36 w-36 rounded-full border border-white/10" />
              <div className="absolute bottom-0 left-0 right-0 grid grid-cols-7 opacity-40">
                {Array.from({ length: 14 }).map((_, index) => <span key={index} className="aspect-square border-r border-t border-white/8" />)}
              </div>
              <div className="absolute inset-x-6 top-6 flex justify-between text-[9px] uppercase tracking-[0.18em] text-white/42"><span>Atlas field edit</span><span>{collection.items.length} / {collection.cities.length}</span></div>
              <div className="absolute bottom-7 left-7 right-7 max-w-sm rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/36">The mood</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white/88">{collection.mood}</p>
                <p className="mt-3 text-xs leading-5 text-white/48">Best for {collection.bestFor.toLowerCase()}.</p>
              </div>
            </div>
          </div>

          <dl className="grid border-t border-white/8 sm:grid-cols-3">
            {[["Best for", collection.bestFor], ["Price", collection.price], ["Inside", `${collection.items.length} picks · ${collection.cities.length} cities`]].map(([term, value]) => (
              <div key={term} className="border-b border-white/8 px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/30">{term}</dt>
                <dd className="mt-1.5 text-xs leading-5 text-white/68">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-5 border-l border-fuchsia-200/34 py-1 pl-5 sm:pl-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-fuchsia-100/54">Why this edit exists</p>
          <p className="mt-2 max-w-4xl text-base leading-7 text-white/70 sm:text-lg">{collection.editorialNote}</p>
        </section>

        <EditorialDisclosure
          className="mt-5"
          author={editorial.author}
          reviewer={editorial.reviewer}
          publishedAt={editorial.publishedAt}
          updatedAt={editorial.updatedAt}
          researchScope={editorial.researchScope}
          changeLog={editorial.changeLog}
          sources={editorial.sources}
        />

        <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] p-4 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/66">The considered edit</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">The picks—and why they belong</h2>
            <ol className="mt-4 space-y-3">
              {collection.items.map((item, index) => {
                const city = collection.cities[index] || collection.cities[0] || "";
                const citySlug = formatCitySlug(city);
                const hasCity = Boolean(citySlug && cityCoreConfig[citySlug]);
                return (
                  <li key={`${collection.id}-${item}`} className="group rounded-[22px] border border-white/9 bg-black/22 p-4 transition hover:border-cyan-200/22 hover:bg-white/[0.045] sm:p-5">
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">#{index + 1}</p>
                        <h3 className="mt-2 text-xl font-bold tracking-[-0.025em] text-white">{item}</h3>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/42">{city || "Global"}</p>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62">{collection.itemNotes?.[index] || "Selected for its relevance to this collection and its usefulness within the wider city route."}</p>
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

          <aside className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,21,29,0.98),rgba(8,9,13,0.99))] p-5 lg:sticky lg:top-5 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/66">How to use this edit</p>
            <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">Context before checklist</h2>
            <p className="mt-3 text-sm leading-7 text-white/66">{collection.methodology}</p>
            <div className="mt-5 space-y-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/36">Last editorial update</p>
                <p className="mt-1 text-sm text-white/76">{collection.updated}</p>
              </div>
              <div className="rounded-2xl border border-amber-200/12 bg-amber-200/[0.045] p-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-amber-100/48">Before you go</p>
                <p className="mt-2 text-xs leading-5 text-white/58">Check the venue or organizer directly. Schedules, access, ticketing, and door context can change.</p>
              </div>
            </div>
            <Link href="/sources-and-reviews" className="mt-5 inline-flex text-xs font-semibold text-cyan-100/72 underline decoration-cyan-200/30 underline-offset-4 transition hover:text-cyan-50">Read our source and review policy</Link>
          </aside>
        </section>

        <section className="mt-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-100/60">Keep exploring</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">Related Atlas Collections</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {relatedCollections.map((item) => (
              <Link key={item.id} href={item.href} className="group rounded-[24px] border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-0.5 hover:border-fuchsia-200/24 hover:bg-white/[0.055]">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-fuchsia-100/58">{item.eyebrow}</p>
                <h3 className="mt-3 text-xl font-bold leading-tight tracking-[-0.03em] text-white">{item.title}</h3>
                <p className="mt-3 text-xs leading-5 text-white/52">{item.items.length} picks across {item.cities.length} city signals</p>
                <span className="mt-5 inline-flex text-xs font-bold text-white/70 transition group-hover:text-white">Open collection <span className="ml-2" aria-hidden="true">→</span></span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
