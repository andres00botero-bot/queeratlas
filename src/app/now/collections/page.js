import Link from "next/link";
import NowSectionNav from "@/components/now/NowSectionNav";
import { ATLAS_COLLECTIONS, ATLAS_COLLECTION_FILTERS } from "@/lib/atlasCollections";
import { QA_ORGANIZATION_ID, QA_SITE_URL, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";

export const metadata = {
  title: "Atlas Collections | Best Queer Travel, Stays, Events & Culture",
  description: "Explore researched LGBTQ+ travel collections for queer-owned stays, honeymoons, affordable city breaks, sapphic travel, events, wellness, food, nightlife, and beaches.",
  keywords: ["queer travel collections", "best LGBTQ honeymoon destinations", "queer owned hotels", "affordable LGBTQ city breaks", "sapphic travel destinations", "gay bear weeks", "queer wellness retreats", "LGBTQ owned restaurants"],
  alternates: { canonical: "/now/collections" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Atlas Collections | Queer Atlas",
    description: "Queer places, stays, events, and city routes selected for how they actually work as a trip.",
    url: "/now/collections",
    type: "website",
  },
};

const NOW_SECTIONS = [
  { id: "mixed", label: "News", href: "/now/news" },
  { id: "voices", label: "Voices", href: "/now/voices" },
  { id: "rankings", label: "Rankings", href: "/now/rankings" },
  { id: "data", label: "Data & Reports", href: "/now/data" },
  { id: "collections", label: "Atlas Collections", href: "/now/collections" },
];

const PRIMARY_FILTER_IDS = new Set(["all", "nightlife", "beach", "women", "solo", "events"]);

const COLLECTION_STYLES = {
  cyan: { wash: "from-cyan-300/24 via-sky-300/8 to-transparent", line: "from-cyan-200 via-sky-300 to-transparent", label: "text-cyan-100", border: "hover:border-cyan-100/34" },
  amber: { wash: "from-amber-300/24 via-orange-300/8 to-transparent", line: "from-amber-200 via-orange-300 to-transparent", label: "text-amber-100", border: "hover:border-amber-100/34" },
  fuchsia: { wash: "from-fuchsia-300/22 via-pink-300/8 to-transparent", line: "from-fuchsia-200 via-pink-300 to-transparent", label: "text-fuchsia-100", border: "hover:border-fuchsia-100/34" },
  rose: { wash: "from-rose-300/22 via-orange-300/8 to-transparent", line: "from-rose-200 via-orange-300 to-transparent", label: "text-rose-100", border: "hover:border-rose-100/34" },
  violet: { wash: "from-violet-300/23 via-fuchsia-300/8 to-transparent", line: "from-violet-200 via-fuchsia-300 to-transparent", label: "text-violet-100", border: "hover:border-violet-100/34" },
  emerald: { wash: "from-emerald-300/22 via-teal-300/8 to-transparent", line: "from-emerald-200 via-teal-300 to-transparent", label: "text-emerald-100", border: "hover:border-emerald-100/34" },
};

function buildDiscoveryHref({ filter = "all", query = "", sort = "curated" }) {
  const params = new URLSearchParams();
  if (filter && filter !== "all") params.set("type", filter);
  if (query) params.set("q", query);
  if (sort && sort !== "curated") params.set("sort", sort);
  const value = params.toString();
  return value ? `/now/collections?${value}#discover-collections` : "/now/collections#discover-collections";
}

function collectionTimestamp(collection) {
  const timestamp = Date.parse(collection.updatedAt || collection.updated || "");
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function CollectionCover({ collection, index, lead = false }) {
  const style = COLLECTION_STYLES[collection.accent] || COLLECTION_STYLES.cyan;
  const cityLine = collection.cities.slice(0, lead ? 4 : 3).join(" · ");

  return (
    <div className={`relative overflow-hidden border-b border-white/10 bg-[#0b0e15] ${lead ? "min-h-64 sm:min-h-72" : "min-h-40"}`} aria-hidden="true">
      <div className={`absolute inset-0 bg-gradient-to-br ${style.wash}`} />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.24)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.24)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
      <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full border border-white/10" />
      <div className="absolute right-8 top-8 h-28 w-28 rounded-full border border-white/10" />
      <div className="absolute inset-x-5 top-4 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.18em] text-white/48 sm:inset-x-6">
        <span>Atlas field edit</span>
        <span>{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="absolute inset-x-5 bottom-5 sm:inset-x-6">
        <div className={`h-px w-24 bg-gradient-to-r ${style.line}`} />
        <p className="mt-3 max-w-[85%] text-[10px] font-medium uppercase leading-4 tracking-[0.14em] text-white/58">{cityLine}</p>
      </div>
    </div>
  );
}

function CollectionCard({ collection, index }) {
  const style = COLLECTION_STYLES[collection.accent] || COLLECTION_STYLES.cyan;

  return (
    <article className={`group flex h-full flex-col overflow-hidden rounded-[24px] border border-white/11 bg-[linear-gradient(180deg,rgba(15,18,27,0.98),rgba(8,10,15,0.99))] shadow-[0_18px_55px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_75px_rgba(0,0,0,0.30)] ${style.border}`}>
      <CollectionCover collection={collection} index={index} />
      <div className="flex flex-1 flex-col p-5">
        <p className={`text-[10px] font-bold uppercase tracking-[0.17em] ${style.label}`}>{collection.eyebrow}</p>
        <h3 className="mt-2 text-[1.32rem] font-bold leading-[1.12] tracking-[-0.035em] text-[#f7f4ee]">{collection.title}</h3>
        <p className="mt-3 line-clamp-3 text-[13px] leading-5 text-white/58">{collection.summary}</p>
        <dl className="mt-5 grid grid-cols-2 gap-x-4 border-y border-white/9 py-3">
          <div>
            <dt className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/34">Inside</dt>
            <dd className="mt-1 text-xs text-white/72">{collection.items.length} picks</dd>
          </div>
          <div>
            <dt className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/34">Verified</dt>
            <dd className="mt-1 text-xs text-white/72">{collection.updated}</dd>
          </div>
        </dl>
        <div className="mt-auto flex items-end justify-between gap-4 pt-4">
          <p className="line-clamp-2 text-[11px] leading-4 text-white/42">Best for {collection.bestFor.toLowerCase()}</p>
          <Link href={collection.href} className={`shrink-0 border-b border-current/35 pb-1 text-sm font-bold transition hover:border-current ${style.label}`} aria-label={`Open ${collection.title}`}>
            Open edit <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function AtlasCollectionsIndexPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const activeFilter = String(resolvedParams?.type || "all").trim().toLowerCase();
  const query = String(resolvedParams?.q || "").trim();
  const normalizedQuery = query.toLowerCase();
  const requestedSort = String(resolvedParams?.sort || "curated").trim().toLowerCase();
  const validFilter = ATLAS_COLLECTION_FILTERS.some((filter) => filter.id === activeFilter) ? activeFilter : "all";
  const validSort = ["curated", "verified", "az"].includes(requestedSort) ? requestedSort : "curated";
  const activeFilterLabel = ATLAS_COLLECTION_FILTERS.find((filter) => filter.id === validFilter)?.label || "All collections";

  const visibleCollections = ATLAS_COLLECTIONS
    .filter((collection) => {
      if (validFilter !== "all" && collection.filter !== validFilter) return false;
      if (!normalizedQuery) return true;
      return [collection.title, collection.summary, collection.bestFor, collection.mood, ...collection.tags, ...collection.cities, ...collection.items].join(" ").toLowerCase().includes(normalizedQuery);
    })
    .sort((left, right) => {
      if (validSort === "verified") return collectionTimestamp(right) - collectionTimestamp(left);
      if (validSort === "az") return left.title.localeCompare(right.title);
      return ATLAS_COLLECTIONS.indexOf(left) - ATLAS_COLLECTIONS.indexOf(right);
    });

  const uniqueCities = new Set(ATLAS_COLLECTIONS.flatMap((collection) => collection.cities)).size;
  const totalPicks = ATLAS_COLLECTIONS.reduce((total, collection) => total + collection.items.length, 0);
  const hasActiveDiscovery = validFilter !== "all" || Boolean(query) || validSort !== "curated";
  const leadCollection = visibleCollections[0] || null;
  const remainingCollections = visibleCollections.slice(1);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${QA_SITE_URL}/now/collections`,
        url: `${QA_SITE_URL}/now/collections`,
        name: "Atlas Collections",
        description: "Editorially researched queer travel collections for stays, events, culture, nightlife, beaches, and solo travel.",
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
    <main className="qa-page min-h-screen bg-[radial-gradient(circle_at_7%_0%,rgba(45,212,191,0.09),transparent_25%),radial-gradient(circle_at_91%_3%,rgba(251,191,36,0.07),transparent_24%),linear-gradient(180deg,#07090e_0%,#090b11_48%,#06070a_100%)] px-4 py-6 text-white sm:px-6 sm:py-9">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38 sm:text-xs">
          <Link href="/now/news" className="transition hover:text-white">Now</Link>
          <span aria-hidden="true">/</span>
          <span className="text-white/64">Atlas Collections</span>
        </nav>

        <header className="relative mt-5 overflow-hidden border-y border-white/10 py-7 sm:py-9">
          <div className="pointer-events-none absolute -left-28 top-0 h-52 w-52 rounded-full bg-emerald-300/9 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-100/66">Queer Atlas field desk</p>
              <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.045em] text-[#f7f4ee] sm:text-5xl">Atlas Collections</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-base sm:leading-7">Researched routes for the kind of trip you actually want—from a softer first night to a serious dance floor.</p>
            </div>
            <dl className="flex flex-wrap gap-x-7 gap-y-3 border-l-0 border-white/10 lg:border-l lg:pl-7">
              {[["Edits", ATLAS_COLLECTIONS.length], ["City signals", uniqueCities], ["Picks", totalPicks]].map(([term, value]) => (
                <div key={term}>
                  <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/34">{term}</dt>
                  <dd className="mt-1 text-lg font-bold text-white/86">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        <NowSectionNav sections={NOW_SECTIONS} activeId="collections" className="mt-4" />

        <section id="discover-collections" className="scroll-mt-24 pt-6 sm:scroll-mt-8 sm:pt-8" aria-labelledby="collections-discovery-heading">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-100/58">Browse the field desk</p>
              <h2 id="collections-discovery-heading" className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#f7f4ee] sm:text-3xl">Find an edit for this trip</h2>
            </div>
            <p aria-live="polite" className="text-xs text-white/46">{visibleCollections.length} {visibleCollections.length === 1 ? "collection" : "collections"}{validFilter !== "all" ? ` · ${activeFilterLabel}` : ""}{query ? ` · “${query}”` : ""}</p>
          </div>

          <form action="/now/collections" className="mt-5 grid gap-2 border-y border-white/9 py-4 sm:grid-cols-[minmax(0,1fr)_11rem_auto] sm:items-center">
            {validFilter !== "all" && <input type="hidden" name="type" value={validFilter} />}
            <label htmlFor="collection-search" className="sr-only">Search Atlas Collections</label>
            <input id="collection-search" name="q" type="search" defaultValue={query} placeholder="Search a city, place, or kind of trip" className="min-h-12 w-full rounded-xl border border-white/11 bg-white/[0.045] px-4 text-base text-white outline-none placeholder:text-white/30 focus:border-cyan-100/38 focus:ring-2 focus:ring-cyan-100/10 sm:text-sm" />
            <label htmlFor="collection-sort" className="sr-only">Sort collections</label>
            <select id="collection-sort" name="sort" defaultValue={validSort} className="min-h-12 rounded-xl border border-white/11 bg-[#10131b] px-3 text-sm text-white/74 outline-none focus:border-cyan-100/38">
              <option value="curated">Curated order</option>
              <option value="verified">Recently verified</option>
              <option value="az">A–Z</option>
            </select>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button type="submit" className={`${hasActiveDiscovery ? "" : "col-span-2"} min-h-12 rounded-xl bg-[#f3eee5] px-5 text-xs font-bold uppercase tracking-[0.1em] text-[#0a0c11] transition hover:bg-white sm:col-span-1`}>Apply</button>
              {hasActiveDiscovery && <Link href="/now/collections#discover-collections" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/13 px-4 text-xs font-bold uppercase tracking-[0.1em] text-white/62 transition hover:border-white/28 hover:text-white">Clear</Link>}
            </div>
          </form>

          <div aria-label="Primary collection filters" className="mt-3 flex touch-pan-x gap-2 overflow-x-auto overscroll-x-contain pb-1 pr-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {ATLAS_COLLECTION_FILTERS.filter((filter) => PRIMARY_FILTER_IDS.has(filter.id)).map((filter) => {
              const isActive = validFilter === filter.id;
              return <Link key={filter.id} href={buildDiscoveryHref({ filter: filter.id, query, sort: validSort })} aria-current={isActive ? "page" : undefined} className={`shrink-0 rounded-full border px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition ${isActive ? "border-emerald-100/36 bg-emerald-100/12 text-emerald-50" : "border-white/9 text-white/46 hover:border-white/20 hover:text-white/76"}`}>{filter.label}</Link>;
            })}
          </div>

          <details className="group mt-2 sm:hidden">
            <summary className="inline-flex min-h-10 cursor-pointer list-none items-center text-[10px] font-bold uppercase tracking-[0.12em] text-white/48 transition hover:text-white/76">More filters <span className="ml-2 transition group-open:rotate-45" aria-hidden="true">+</span></summary>
            <div className="flex flex-wrap gap-2 pb-2">
              {ATLAS_COLLECTION_FILTERS.filter((filter) => !PRIMARY_FILTER_IDS.has(filter.id)).map((filter) => <Link key={filter.id} href={buildDiscoveryHref({ filter: filter.id, query, sort: validSort })} aria-current={validFilter === filter.id ? "page" : undefined} className={`rounded-full border px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] ${validFilter === filter.id ? "border-amber-100/38 bg-amber-100/10 text-amber-50" : "border-white/9 text-white/48"}`}>{filter.label}</Link>)}
            </div>
          </details>

          <div className="mt-2 hidden flex-wrap gap-2 sm:flex" aria-label="More collection filters">
            {ATLAS_COLLECTION_FILTERS.filter((filter) => !PRIMARY_FILTER_IDS.has(filter.id)).map((filter) => <Link key={filter.id} href={buildDiscoveryHref({ filter: filter.id, query, sort: validSort })} aria-current={validFilter === filter.id ? "page" : undefined} className={`rounded-full border px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition ${validFilter === filter.id ? "border-amber-100/38 bg-amber-100/10 text-amber-50" : "border-white/9 text-white/40 hover:border-white/20 hover:text-white/70"}`}>{filter.label}</Link>)}
          </div>

          {leadCollection ? (
            <>
              <article className="mt-6 overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(145deg,rgba(18,22,31,0.99),rgba(9,11,17,1))] shadow-[0_28px_90px_rgba(0,0,0,0.28)] lg:grid lg:grid-cols-[0.86fr_1.14fr]">
                <CollectionCover collection={leadCollection} index={ATLAS_COLLECTIONS.indexOf(leadCollection)} lead />
                <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-9">
                  <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em]"><span className="text-emerald-100/76">Lead edit</span><span className="text-white/20">/</span><span className="text-white/42">{leadCollection.items.length} picks · {leadCollection.cities.length} cities</span></div>
                  <h3 className="mt-3 max-w-2xl text-3xl font-black leading-[1.04] tracking-[-0.045em] text-[#f7f4ee] sm:text-4xl">{leadCollection.title}</h3>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-white/64 sm:text-base sm:leading-7">{leadCollection.summary}</p>
                  <p className="mt-5 border-l border-amber-100/36 pl-4 text-sm italic leading-6 text-white/52">{leadCollection.editorialNote || `Best for ${leadCollection.bestFor.toLowerCase()}.`}</p>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/9 pt-5">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-white/38">Verified {leadCollection.updated}</p>
                    <Link href={leadCollection.href} className="inline-flex min-h-11 items-center rounded-full bg-[#f3eee5] px-5 text-xs font-bold uppercase tracking-[0.1em] text-[#0a0c11] transition hover:bg-white">Open the edit <span className="ml-2" aria-hidden="true">→</span></Link>
                  </div>
                </div>
              </article>

              {remainingCollections.length > 0 && <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{remainingCollections.map((collection) => <li key={collection.id}><CollectionCard collection={collection} index={ATLAS_COLLECTIONS.indexOf(collection)} /></li>)}</ul>}
            </>
          ) : (
            <div className="mt-7 border-y border-white/10 py-12 text-center">
              <h3 className="text-xl font-bold text-white">No exact match yet</h3>
              <p className="mt-2 text-sm text-white/50">Try a broader city, place, or kind of trip.</p>
              <Link href="/now/collections#discover-collections" className="mt-5 inline-flex rounded-full bg-[#f3eee5] px-4 py-2 text-xs font-bold text-[#0a0c11]">Reset discovery</Link>
            </div>
          )}
        </section>

        <footer className="mt-12 flex flex-col gap-4 border-t border-white/9 py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-xs leading-5 text-white/40">Every edit distinguishes dedicated queer spaces from recurring events and records when its selections were last reviewed.</p>
          <div className="flex gap-4 text-xs font-semibold text-white/54">
            <Link href="/editorial-policy" className="hover:text-white">Editorial policy</Link>
            <Link href="/sources-and-reviews" className="hover:text-white">Sources & reviews</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
