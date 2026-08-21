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
  cyan: { art: "from-cyan-300/28 via-sky-400/10 to-transparent", line: "bg-cyan-200/75", dot: "bg-cyan-200", text: "text-cyan-100", card: "border-cyan-200/14 bg-[linear-gradient(180deg,rgba(10,24,31,0.98),rgba(8,10,15,0.99))] hover:border-cyan-200/30", link: "text-cyan-50 decoration-cyan-200/40" },
  amber: { art: "from-amber-300/26 via-orange-400/10 to-transparent", line: "bg-amber-200/75", dot: "bg-amber-200", text: "text-amber-100", card: "border-amber-200/14 bg-[linear-gradient(180deg,rgba(28,21,12,0.98),rgba(10,10,13,0.99))] hover:border-amber-200/30", link: "text-amber-50 decoration-amber-200/40" },
  fuchsia: { art: "from-fuchsia-300/25 via-pink-400/10 to-transparent", line: "bg-fuchsia-200/75", dot: "bg-fuchsia-200", text: "text-fuchsia-100", card: "border-fuchsia-200/14 bg-[linear-gradient(180deg,rgba(28,13,29,0.98),rgba(10,9,14,0.99))] hover:border-fuchsia-200/30", link: "text-fuchsia-50 decoration-fuchsia-200/40" },
  rose: { art: "from-rose-300/25 via-orange-400/10 to-transparent", line: "bg-rose-200/75", dot: "bg-rose-200", text: "text-rose-100", card: "border-rose-200/14 bg-[linear-gradient(180deg,rgba(29,14,20,0.98),rgba(11,9,12,0.99))] hover:border-rose-200/30", link: "text-rose-50 decoration-rose-200/40" },
  violet: { art: "from-violet-300/27 via-fuchsia-400/10 to-transparent", line: "bg-violet-200/75", dot: "bg-violet-200", text: "text-violet-100", card: "border-violet-200/14 bg-[linear-gradient(180deg,rgba(22,16,34,0.98),rgba(9,9,14,0.99))] hover:border-violet-200/30", link: "text-violet-50 decoration-violet-200/40" },
  emerald: { art: "from-emerald-300/25 via-cyan-400/10 to-transparent", line: "bg-emerald-200/75", dot: "bg-emerald-200", text: "text-emerald-100", card: "border-emerald-200/14 bg-[linear-gradient(180deg,rgba(10,27,24,0.98),rgba(8,11,13,0.99))] hover:border-emerald-200/30", link: "text-emerald-50 decoration-emerald-200/40" },
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
    <div className={`relative overflow-hidden bg-[linear-gradient(145deg,#1b2a3f,#0e1520)] ${compact ? "h-28" : "min-h-72"}`} aria-hidden="true">
      <div className={`absolute inset-0 bg-gradient-to-br ${style.art}`} />
      <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border border-white/10" />
      <div className="absolute -right-2 -top-6 h-36 w-36 rounded-full border border-white/10" />
      <div className="absolute bottom-0 left-0 right-0 grid grid-cols-6 opacity-40">
        {Array.from({ length: 12 }).map((_, itemIndex) => (
          <span key={itemIndex} className="aspect-square border-r border-t border-white/8" />
        ))}
      </div>
      <div className="absolute inset-x-4 top-3 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.2em] text-white/52">
        <span>Queer Atlas / Edit {String(index + 1).padStart(2, "0")}</span>
        <span>{collection.cities.length} cities</span>
      </div>
      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-4">
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
    <main className="qa-page min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(56,189,248,0.10),transparent_28%),radial-gradient(circle_at_88%_4%,rgba(192,132,252,0.08),transparent_25%),linear-gradient(180deg,#05070b_0%,#080a10_48%,#050609_100%)] px-4 py-6 text-white sm:px-6 sm:py-9">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42 sm:text-xs">
          <Link href="/now/news" className="transition hover:text-white">Now</Link>
          <span aria-hidden="true">/</span>
          <span className="text-white/68">Atlas Collections</span>
        </nav>

        <section className="mt-5 overflow-hidden rounded-[28px] border border-cyan-100/22 bg-[radial-gradient(circle_at_12%_18%,rgba(103,232,249,0.22),transparent_40%),radial-gradient(circle_at_88%_14%,rgba(192,132,252,0.17),transparent_38%),linear-gradient(145deg,#1d334a,#17263a_56%,#291a34)] shadow-[0_30px_90px_rgba(0,0,0,0.30),0_0_0_1px_rgba(255,255,255,0.035)] sm:rounded-[34px]">
          <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
            <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-11">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-100/66">Queer Atlas editorial</p>
              <h1 className="mt-4 max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl lg:text-[3.6rem]">
                Atlas Collections
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/72 sm:text-lg">
                Curated ways into a city: the right dance floor, a softer first night, a beach with a real social rhythm, or a room built around performance.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a href="#discover-collections" className="inline-flex min-h-11 items-center rounded-full border border-cyan-100/70 bg-cyan-100 px-5 text-xs font-bold uppercase tracking-[0.11em] text-slate-950 shadow-[0_10px_28px_rgba(103,232,249,0.16)] transition hover:border-white hover:bg-white">
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

            <div className="relative hidden min-h-[25rem] border-l border-cyan-100/18 bg-[radial-gradient(circle_at_72%_18%,rgba(103,232,249,0.38),transparent_33%),radial-gradient(circle_at_24%_78%,rgba(216,180,254,0.30),transparent_35%),linear-gradient(145deg,#1b3a55,#352043_58%,#172432)] lg:block" aria-hidden="true">
              <div className="absolute left-[16%] top-[16%] w-[58%] rotate-[-7deg] rounded-2xl border border-cyan-100/28 bg-[linear-gradient(145deg,#203a52,#17283b)] p-4 shadow-[0_28px_70px_rgba(0,0,0,0.38),0_0_44px_rgba(34,211,238,0.14)]">
                <div className="h-24 rounded-xl bg-[linear-gradient(135deg,rgba(103,232,249,0.34),rgba(129,140,248,0.14),rgba(255,255,255,0.04))]" />
                <div className="mt-4 h-2 w-20 rounded-full bg-white/18" />
                <div className="mt-2 h-2 w-36 rounded-full bg-white/8" />
              </div>
              <div className="absolute bottom-[13%] right-[12%] w-[58%] rotate-[5deg] rounded-2xl border border-fuchsia-100/28 bg-[linear-gradient(145deg,#3a2546,#241a31)] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.42),0_0_46px_rgba(217,70,239,0.14)]">
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

          <div className="mt-6 rounded-[24px] border border-cyan-100/10 bg-[linear-gradient(145deg,rgba(14,20,29,0.98),rgba(11,12,18,0.99))] p-3 shadow-[0_18px_55px_rgba(0,0,0,0.20)] sm:p-4">
            <form action="/now/collections" className="flex flex-col gap-2 sm:flex-row">
              {validFilter !== "all" && <input type="hidden" name="type" value={validFilter} />}
              <label htmlFor="collection-search" className="sr-only">Search Atlas Collections</label>
              <input id="collection-search" name="q" type="search" defaultValue={query} placeholder="Try Berlin, beaches, solo travel, drag..." className="min-h-12 min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-200/32" />
              <button type="submit" className="min-h-12 rounded-2xl border border-cyan-100/60 bg-cyan-100 px-6 text-xs font-bold uppercase tracking-[0.1em] text-slate-950 transition hover:border-white hover:bg-white">Search collections</button>
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
                    <article className={`group h-full overflow-hidden rounded-[26px] border transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_80px_rgba(0,0,0,0.34)] ${style.card}`}>
                      <CollectionArtwork collection={collection} index={originalIndex} compact />
                      <div className="flex flex-col p-4">
                        <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${style.text}`}>{collection.eyebrow}</p>
                        <h3 className="mt-2 text-xl font-bold leading-tight tracking-[-0.035em] text-white sm:text-[1.35rem]">{collection.title}</h3>
                        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-white/62">{collection.summary}</p>
                        <p className="mt-3 border-t border-white/9 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/48">
                          {collection.items.length} picks <span className="mx-1.5 text-white/22">·</span> {collection.cities.length} cities
                        </p>
                        <div className="mt-auto flex items-end justify-between gap-4 pt-3">
                          <p className="text-[10px] uppercase tracking-[0.1em] text-white/36">Updated {collection.updated}</p>
                          <Link href={collection.href} className={`group/edit inline-flex shrink-0 items-center gap-2 border-b pb-1 text-sm font-bold underline-offset-4 transition hover:border-white/70 hover:text-white ${style.link}`} aria-label={`Open ${collection.title}`}>
                            <span>View edit</span>
                            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current/30 text-[11px] transition-transform duration-200 group-hover/edit:translate-x-0.5" aria-hidden="true">→</span>
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
