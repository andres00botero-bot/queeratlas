import Link from "next/link";
import { ATLAS_COLLECTIONS, ATLAS_COLLECTION_FILTERS } from "@/lib/atlasCollections";
import { QA_ORGANIZATION_ID, QA_SITE_URL, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";

export const metadata = {
  title: "Atlas Collections | Curated Queer Travel, Nightlife & Culture",
  description: "Explore editorially curated queer travel collections for LGBTQ nightlife, beaches, lesbian spaces, drag, cafes, and solo-friendly city routes.",
  keywords: ["queer travel collections", "best LGBTQ nightlife", "queer city recommendations", "lesbian bars Europe", "queer beaches Europe", "solo queer travel"],
  alternates: { canonical: "/now/collections" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Atlas Collections | Queer Atlas",
    description: "Queer places, moods, and nights selected for how they actually feel.",
    url: "/now/collections",
    type: "website",
  },
};

const COLLECTION_STYLES = {
  cyan: { art: "from-cyan-300/20 via-sky-400/8 to-transparent", line: "bg-cyan-200/60", dot: "bg-cyan-200", text: "text-cyan-100", button: "group-hover:text-cyan-100" },
  amber: { art: "from-amber-300/20 via-orange-400/8 to-transparent", line: "bg-amber-200/60", dot: "bg-amber-200", text: "text-amber-100", button: "group-hover:text-amber-100" },
  fuchsia: { art: "from-fuchsia-300/18 via-pink-400/8 to-transparent", line: "bg-fuchsia-200/60", dot: "bg-fuchsia-200", text: "text-fuchsia-100", button: "group-hover:text-fuchsia-100" },
  rose: { art: "from-rose-300/18 via-orange-400/8 to-transparent", line: "bg-rose-200/60", dot: "bg-rose-200", text: "text-rose-100", button: "group-hover:text-rose-100" },
  violet: { art: "from-violet-300/20 via-fuchsia-400/8 to-transparent", line: "bg-violet-200/60", dot: "bg-violet-200", text: "text-violet-100", button: "group-hover:text-violet-100" },
  emerald: { art: "from-emerald-300/18 via-cyan-400/8 to-transparent", line: "bg-emerald-200/60", dot: "bg-emerald-200", text: "text-emerald-100", button: "group-hover:text-emerald-100" },
};

function buildFilterHref(filter, query) {
  const params = new URLSearchParams();
  if (filter && filter !== "all") params.set("type", filter);
  if (query) params.set("q", query);
  const value = params.toString();
  return value ? `/now/collections?${value}` : "/now/collections";
}

function CollectionArtwork({ collection, index, compact = false }) {
  const style = COLLECTION_STYLES[collection.accent] || COLLECTION_STYLES.cyan;
  return (
    <div className={`relative overflow-hidden bg-[linear-gradient(145deg,#12151d,#08090d)] ${compact ? "h-44" : "min-h-72"}`} aria-hidden="true">
      <div className={`absolute inset-0 bg-gradient-to-br ${style.art}`} />
      <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border border-white/10" />
      <div className="absolute -right-2 -top-6 h-36 w-36 rounded-full border border-white/10" />
      <div className="absolute bottom-0 left-0 right-0 grid grid-cols-6 opacity-40">
        {Array.from({ length: 12 }).map((_, itemIndex) => (
          <span key={itemIndex} className="aspect-square border-r border-t border-white/8" />
        ))}
      </div>
      <div className="absolute inset-x-5 top-5 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.2em] text-white/48">
        <span>Queer Atlas / Edit {String(index + 1).padStart(2, "0")}</span>
        <span>{collection.cities.length} cities</span>
      </div>
      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
        <div>
          <span className={`block h-1.5 w-1.5 rounded-full ${style.dot}`} />
          <span className={`mt-3 block h-px w-16 ${style.line}`} />
        </div>
        <span className="max-w-36 text-right text-[10px] font-medium uppercase leading-4 tracking-[0.16em] text-white/54">{collection.mood}</span>
      </div>
    </div>
  );
}

export default async function AtlasCollectionsIndexPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const activeFilter = String(resolvedParams?.type || "all").trim().toLowerCase();
  const query = String(resolvedParams?.q || "").trim();
  const normalizedQuery = query.toLowerCase();
  const validFilter = ATLAS_COLLECTION_FILTERS.some((filter) => filter.id === activeFilter) ? activeFilter : "all";
  const activeFilterLabel = ATLAS_COLLECTION_FILTERS.find((filter) => filter.id === validFilter)?.label || "All collections";

  const visibleCollections = ATLAS_COLLECTIONS.filter((collection) => {
    if (validFilter !== "all" && collection.filter !== validFilter) return false;
    if (!normalizedQuery) return true;
    return [collection.title, collection.summary, collection.bestFor, collection.mood, ...collection.tags, ...collection.cities, ...collection.items]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  const uniqueCities = new Set(ATLAS_COLLECTIONS.flatMap((collection) => collection.cities)).size;
  const totalPicks = ATLAS_COLLECTIONS.reduce((total, collection) => total + collection.items.length, 0);
  const hasActiveDiscovery = validFilter !== "all" || Boolean(query);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${QA_SITE_URL}/now/collections`,
        url: `${QA_SITE_URL}/now/collections`,
        name: "Atlas Collections",
        description: "Editorially curated queer travel collections for nightlife, beaches, lesbian spaces, drag, cafes, and solo travel.",
        isPartOf: { "@id": QA_WEBSITE_ID },
        publisher: { "@id": QA_ORGANIZATION_ID },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: ATLAS_COLLECTIONS.length,
          itemListElement: ATLAS_COLLECTIONS.map((collection, index) => ({ "@type": "ListItem", position: index + 1, url: `${QA_SITE_URL}${collection.href}`, name: collection.title })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: QA_SITE_URL },
          { "@type": "ListItem", position: 2, name: "Now", item: `${QA_SITE_URL}/now/news` },
          { "@type": "ListItem", position: 3, name: "Atlas Collections", item: `${QA_SITE_URL}/now/collections` },
        ],
      },
    ],
  };

  return (
    <main className="qa-page min-h-screen bg-[#06070a] px-4 py-6 text-white sm:px-6 sm:py-9">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42 sm:text-xs">
          <Link href="/now/news" className="transition hover:text-white">Now</Link>
          <span aria-hidden="true">/</span>
          <span className="text-white/68">Atlas Collections</span>
        </nav>

        <section className="mt-5 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,#11141c,#090a0e)] shadow-[0_30px_90px_rgba(0,0,0,0.34)] sm:rounded-[34px]">
          <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
            <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-11">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-100/66">Queer Atlas editorial</p>
              <h1 className="mt-4 max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl lg:text-[3.6rem]">
                Atlas Collections
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/64 sm:text-lg">
                Curated ways into a city: the right dance floor, a softer first night, a beach with a real social rhythm, or a room built around performance.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a href="#discover-collections" className="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-xs font-bold uppercase tracking-[0.11em] text-black transition hover:bg-cyan-50">
                  Explore the edits
                </a>
                <Link href="/sources-and-reviews" className="inline-flex min-h-11 items-center px-2 text-xs font-semibold text-white/58 transition hover:text-white">
                  How we choose places
                </Link>
              </div>
              <p className="mt-8 text-[10px] uppercase tracking-[0.14em] text-white/34">
                {ATLAS_COLLECTIONS.length} edits &nbsp;·&nbsp; {uniqueCities} city signals &nbsp;·&nbsp; {totalPicks} considered picks
              </p>
            </div>

            <div className="relative hidden min-h-[25rem] border-l border-white/8 bg-[radial-gradient(circle_at_70%_20%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_25%_75%,rgba(232,121,249,0.10),transparent_28%),#0a0c11] lg:block" aria-hidden="true">
              <div className="absolute left-[16%] top-[16%] w-[58%] rotate-[-7deg] rounded-2xl border border-white/12 bg-[#11141b] p-4 shadow-[0_28px_70px_rgba(0,0,0,0.48)]">
                <div className="h-24 rounded-xl bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(255,255,255,0.02))]" />
                <div className="mt-4 h-2 w-20 rounded-full bg-white/18" />
                <div className="mt-2 h-2 w-36 rounded-full bg-white/8" />
              </div>
              <div className="absolute bottom-[13%] right-[12%] w-[58%] rotate-[5deg] rounded-2xl border border-white/12 bg-[#15121a] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
                <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.18em] text-white/42"><span>Field note</span><span>06 / 26</span></div>
                <div className="mt-5 h-px bg-gradient-to-r from-fuchsia-200/60 to-transparent" />
                <p className="mt-5 text-xl font-semibold leading-tight tracking-[-0.03em] text-white/86">Chosen for how the place fits the night.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="discover-collections" className="scroll-mt-5 pt-10">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/58">Find your way in</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">What kind of trip are you planning?</h2>
            <p className="mt-3 text-sm leading-6 text-white/52">Choose one theme or search by city, mood, venue, or kind of night.</p>
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-[#0d0f14] p-3 sm:p-4">
            <form action="/now/collections" className="flex flex-col gap-2 sm:flex-row">
              {validFilter !== "all" && <input type="hidden" name="type" value={validFilter} />}
              <label htmlFor="collection-search" className="sr-only">Search Atlas Collections</label>
              <input id="collection-search" name="q" type="search" defaultValue={query} placeholder="Try Berlin, beaches, solo travel, drag..." className="min-h-12 min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-200/32" />
              <button type="submit" className="min-h-12 rounded-2xl bg-white px-6 text-xs font-bold uppercase tracking-[0.1em] text-black transition hover:bg-cyan-50">Search collections</button>
            </form>
            <div aria-label="Collection filters" className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {ATLAS_COLLECTION_FILTERS.map((filter) => {
                const isActive = validFilter === filter.id;
                return (
                  <Link key={filter.id} href={buildFilterHref(filter.id, query)} aria-current={isActive ? "page" : undefined} className={`shrink-0 rounded-full border px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition ${isActive ? "border-white/34 bg-white/12 text-white" : "border-white/9 text-white/48 hover:border-white/20 hover:text-white/76"}`}>
                    {filter.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex min-h-8 flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-white/48">
              {visibleCollections.length} {visibleCollections.length === 1 ? "collection" : "collections"}
              {validFilter !== "all" ? ` in ${activeFilterLabel}` : ""}
              {query ? ` matching “${query}”` : ""}
            </p>
            {hasActiveDiscovery && <Link href="/now/collections#discover-collections" className="text-xs font-semibold text-cyan-100/68 transition hover:text-cyan-50">Clear filters</Link>}
          </div>

          {visibleCollections.length > 0 ? (
            <ul className="mt-4 grid gap-5 md:grid-cols-2">
              {visibleCollections.map((collection) => {
                const originalIndex = ATLAS_COLLECTIONS.findIndex((item) => item.id === collection.id);
                const style = COLLECTION_STYLES[collection.accent] || COLLECTION_STYLES.cyan;
                return (
                  <li key={collection.id}>
                    <article className="group h-full overflow-hidden rounded-[26px] border border-white/10 bg-[#0d0f14] transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
                      <CollectionArtwork collection={collection} index={originalIndex} compact />
                      <div className="flex min-h-[20rem] flex-col p-5 sm:p-6">
                        <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${style.text}`}>{collection.eyebrow}</p>
                        <h3 className="mt-3 text-2xl font-bold leading-tight tracking-[-0.035em] text-white">{collection.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-white/58">{collection.summary}</p>
                        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/8 pt-4">
                          <div>
                            <dt className="text-[9px] uppercase tracking-[0.12em] text-white/32">Best for</dt>
                            <dd className="mt-1 text-xs leading-5 text-white/70">{collection.bestFor}</dd>
                          </div>
                          <div>
                            <dt className="text-[9px] uppercase tracking-[0.12em] text-white/32">Inside</dt>
                            <dd className="mt-1 text-xs leading-5 text-white/70">{collection.items.length} picks · {collection.cities.length} cities</dd>
                          </div>
                        </dl>
                        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                          <p className="text-[10px] uppercase tracking-[0.1em] text-white/30">Updated {collection.updated}</p>
                          <Link href={collection.href} className={`shrink-0 text-xs font-bold text-white/74 transition ${style.button}`} aria-label={`Open ${collection.title}`}>
                            View edit <span className="ml-1" aria-hidden="true">→</span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-4 rounded-[24px] border border-white/10 bg-[#0d0f14] p-8 text-center">
              <h3 className="text-xl font-bold text-white">No exact match yet</h3>
              <p className="mt-2 text-sm text-white/50">Try a broader mood, city, or collection type.</p>
              <Link href="/now/collections#discover-collections" className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold text-black">Reset discovery</Link>
            </div>
          )}
        </section>

        <footer className="mt-12 flex flex-col gap-4 border-t border-white/9 py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-xs leading-5 text-white/40">Every edit separates dedicated queer spaces from recurring events and records when the selection was last reviewed.</p>
          <div className="flex gap-4 text-xs font-semibold text-white/54">
            <Link href="/editorial-policy" className="hover:text-white">Editorial policy</Link>
            <Link href="/sources-and-reviews" className="hover:text-white">Sources & reviews</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
