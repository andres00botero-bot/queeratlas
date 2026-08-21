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
  cyan: { text: "text-cyan-100", border: "border-cyan-200/28" },
  amber: { text: "text-amber-100", border: "border-amber-200/28" },
  fuchsia: { text: "text-fuchsia-100", border: "border-fuchsia-200/28" },
  rose: { text: "text-rose-100", border: "border-rose-200/28" },
  violet: { text: "text-violet-100", border: "border-violet-200/28" },
  emerald: { text: "text-emerald-100", border: "border-emerald-200/28" },
};

const RELATED_CARD_STYLES = [
  {
    card: "border-emerald-100/20 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.16),transparent_34%),linear-gradient(145deg,rgba(18,47,48,0.96),rgba(17,25,38,0.98))] hover:border-emerald-100/38",
    eyebrow: "text-emerald-100/78",
    action: "text-emerald-50",
  },
  {
    card: "border-amber-100/20 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.15),transparent_34%),linear-gradient(145deg,rgba(52,40,25,0.96),rgba(28,25,35,0.98))] hover:border-amber-100/38",
    eyebrow: "text-amber-100/78",
    action: "text-amber-50",
  },
  {
    card: "border-sky-100/20 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.17),transparent_34%),linear-gradient(145deg,rgba(20,43,62,0.96),rgba(20,25,42,0.98))] hover:border-sky-100/38",
    eyebrow: "text-sky-100/78",
    action: "text-sky-50",
  },
];

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
    <main className="qa-page min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_3%,rgba(103,232,249,0.20),transparent_28%),radial-gradient(circle_at_92%_5%,rgba(244,114,182,0.16),transparent_26%),radial-gradient(circle_at_58%_48%,rgba(167,139,250,0.09),transparent_34%),linear-gradient(180deg,#0a1020_0%,#101225_48%,#080b16_100%)] px-4 py-6 text-white sm:px-6 sm:py-9">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/44 sm:text-xs">
          <Link href="/now/news" className="transition hover:text-white">Now</Link>
          <span>/</span>
          <Link href="/now/collections" className="transition hover:text-white">Atlas Collections</Link>
          <span>/</span>
          <span className="text-white/72">{collection.title}</span>
        </nav>

        <section className={`relative mt-5 overflow-hidden rounded-[28px] border bg-[linear-gradient(145deg,#1c3a3c,#37342b_56%,#262a3c)] shadow-[0_30px_90px_rgba(0,0,0,0.24),0_0_0_1px_rgba(255,255,255,0.035)] sm:rounded-[34px] ${accentStyle.border}`}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(110,231,183,0.23),transparent_39%),radial-gradient(circle_at_88%_16%,rgba(253,230,138,0.18),transparent_37%)]" aria-hidden="true" />
          <div className="relative grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-8">
              <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${accentStyle.text}`}>{collection.eyebrow}</p>
              <h1 className="mt-3 max-w-3xl text-3xl font-black leading-[1.03] tracking-[-0.04em] text-white sm:text-4xl lg:text-[3rem]">{collection.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/76 sm:text-base sm:leading-7">{collection.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {collection.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/16 bg-white/[0.06] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-white/68">{tag}</span>
                ))}
              </div>
            </div>

            <div className="relative min-h-52 overflow-hidden border-t border-emerald-100/14 bg-[radial-gradient(circle_at_72%_18%,rgba(110,231,183,0.36),transparent_33%),radial-gradient(circle_at_24%_78%,rgba(253,230,138,0.25),transparent_35%),linear-gradient(145deg,#224846,#554530_58%,#293249)] lg:min-h-[20rem] lg:border-l lg:border-t-0" aria-hidden="true">
              <div className="absolute -right-12 -top-14 h-64 w-64 rounded-full border border-white/10" />
              <div className="absolute right-8 top-8 h-36 w-36 rounded-full border border-white/10" />
              <div className="absolute bottom-0 left-0 right-0 grid grid-cols-7 opacity-40">
                {Array.from({ length: 14 }).map((_, index) => <span key={index} className="aspect-square border-r border-t border-white/8" />)}
              </div>
              <div className="absolute inset-x-6 top-6 flex justify-between text-[9px] uppercase tracking-[0.18em] text-white/42"><span>Atlas field edit</span><span>{collection.items.length} / {collection.cities.length}</span></div>
              <div className="absolute bottom-5 left-5 right-5 max-w-sm rounded-2xl border border-amber-100/20 bg-[#1a2c31]/80 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-sm">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-amber-100/62">The mood</p>
                <p className="mt-1.5 text-xl font-semibold tracking-[-0.03em] text-white/92">{collection.mood}</p>
                <p className="mt-2 text-xs leading-5 text-white/60">Best for {collection.bestFor.toLowerCase()}.</p>
              </div>
            </div>
          </div>

          <dl className="relative grid border-t border-white/10 bg-white/[0.025] sm:grid-cols-3">
            {[["Best for", collection.bestFor], ["Price", collection.price], ["Inside", `${collection.items.length} picks · ${collection.cities.length} cities`]].map(([term, value]) => (
              <div key={term} className="border-b border-white/10 px-5 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/42">{term}</dt>
                <dd className="mt-1 text-xs leading-5 text-white/76">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="rounded-[28px] border border-violet-100/20 bg-[radial-gradient(circle_at_8%_0%,rgba(103,232,249,0.14),transparent_30%),radial-gradient(circle_at_100%_8%,rgba(244,114,182,0.12),transparent_32%),linear-gradient(180deg,rgba(28,39,61,0.98),rgba(20,20,39,0.99))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.20)] sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${accentStyle.text}`}>The considered edit</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">The picks—and why they belong</h2>
              </div>
              <span className="rounded-full border border-fuchsia-100/22 bg-fuchsia-100/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-fuchsia-50/82">
                {collection.items.length} curated picks
              </span>
            </div>
            <ol className="mt-4 space-y-3">
              {collection.items.map((item, index) => {
                const city = collection.cities[index] || collection.cities[0] || "";
                const citySlug = formatCitySlug(city);
                const hasCity = Boolean(citySlug && cityCoreConfig[citySlug]);
                return (
                  <li key={`${collection.id}-${item}`} className="group rounded-[22px] border border-white/14 bg-[radial-gradient(circle_at_100%_0%,rgba(244,114,182,0.10),transparent_28%),linear-gradient(145deg,rgba(255,255,255,0.09),rgba(255,255,255,0.025))] p-4 shadow-[0_12px_35px_rgba(0,0,0,0.10)] transition hover:-translate-y-0.5 hover:border-fuchsia-100/32 hover:bg-white/[0.10] sm:p-5">
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
                      <div className="min-w-0">
                        <p className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-white/16 bg-white/[0.07] px-2 text-xs font-bold uppercase tracking-[0.12em] ${accentStyle.text}`}>#{index + 1}</p>
                        <h3 className="mt-2.5 text-xl font-bold tracking-[-0.025em] text-white">{item}</h3>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/52">{city || "Global"}</p>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72">{collection.itemNotes?.[index] || "Selected for its relevance to this collection and its usefulness within the wider city route."}</p>
                      </div>
                      {hasCity && (
                        <Link href={`/${citySlug}`} className="group/city inline-flex items-center gap-2 rounded-full border border-fuchsia-100/38 bg-[linear-gradient(135deg,rgba(244,114,182,0.24),rgba(167,139,250,0.22))] px-3.5 py-2 text-xs font-bold text-fuchsia-50 shadow-[0_10px_26px_rgba(217,70,239,0.13)] transition hover:-translate-y-0.5 hover:border-fuchsia-50/65 hover:brightness-110">
                          <span>City guide</span>
                          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[10px] transition-transform group-hover/city:translate-x-0.5 group-hover/city:-translate-y-0.5" aria-hidden="true">↗</span>
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="space-y-5 lg:sticky lg:top-5">
            <aside className="rounded-[28px] border border-fuchsia-100/18 bg-[radial-gradient(circle_at_top_right,rgba(244,114,182,0.16),transparent_34%),linear-gradient(180deg,rgba(40,29,53,0.98),rgba(20,23,39,0.99))] p-5 shadow-[0_24px_65px_rgba(0,0,0,0.18)] sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-100/78">How to use this edit</p>
              <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">Context before checklist</h2>
              <p className="mt-3 text-sm leading-7 text-white/74">{collection.methodology}</p>
              <div className="mt-5 space-y-2">
                <div className="rounded-2xl border border-violet-100/16 bg-violet-100/[0.07] p-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-violet-100/62">Last editorial update</p>
                  <p className="mt-1 text-sm text-white/84">{collection.updated}</p>
                </div>
                <div className="rounded-2xl border border-amber-100/18 bg-amber-100/[0.07] p-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-amber-100/68">Before you go</p>
                  <p className="mt-2 text-xs leading-5 text-white/68">Check the venue or organizer directly. Schedules, access, ticketing, and door context can change.</p>
                </div>
              </div>
              <Link href="/sources-and-reviews" className="mt-5 inline-flex text-xs font-semibold text-cyan-50/82 underline decoration-cyan-200/40 underline-offset-4 transition hover:text-white">Read our source and review policy</Link>
            </aside>

            <EditorialDisclosure
              compact
              author={editorial.author}
              reviewer={editorial.reviewer}
              publishedAt={editorial.publishedAt}
              updatedAt={editorial.updatedAt}
              researchScope={editorial.researchScope}
              changeLog={editorial.changeLog}
              sources={editorial.sources}
            />
          </div>
        </section>

        <section className="mt-9">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-100/76">Keep exploring</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">Related Atlas Collections</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {relatedCollections.map((item, index) => {
              const relatedStyle = RELATED_CARD_STYLES[index % RELATED_CARD_STYLES.length];
              return (
                <Link key={item.id} href={item.href} className={`group rounded-[24px] border p-5 shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:brightness-110 ${relatedStyle.card}`}>
                  <p className={`text-[9px] font-bold uppercase tracking-[0.18em] ${relatedStyle.eyebrow}`}>{item.eyebrow}</p>
                  <h3 className="mt-3 text-xl font-bold leading-tight tracking-[-0.03em] text-white">{item.title}</h3>
                  <p className="mt-3 text-xs leading-5 text-white/58">{item.items.length} picks across {item.cities.length} city signals</p>
                  <span className={`mt-5 inline-flex text-xs font-bold transition group-hover:text-white ${relatedStyle.action}`}>Open collection <span className="ml-2" aria-hidden="true">→</span></span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
