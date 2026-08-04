import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenCheck,
  Check,
  FileClock,
  Fingerprint,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { QA_ORGANIZATION_ID, QA_SITE_URL, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";
import { EDITORIAL_LAUNCH_DATE, TRUST_NAV_ITEMS, getTrustPage } from "@/lib/editorialTrust";

const ACCENTS = {
  cyan: {
    glow: "from-cyan-300/24 via-sky-300/12 to-transparent",
    eyebrow: "text-cyan-100",
    border: "border-cyan-200/24",
    surface: "bg-cyan-200/[0.07]",
    icon: "text-cyan-100",
  },
  fuchsia: {
    glow: "from-fuchsia-300/24 via-violet-300/12 to-transparent",
    eyebrow: "text-fuchsia-100",
    border: "border-fuchsia-200/24",
    surface: "bg-fuchsia-200/[0.07]",
    icon: "text-fuchsia-100",
  },
  emerald: {
    glow: "from-emerald-300/22 via-cyan-300/10 to-transparent",
    eyebrow: "text-emerald-100",
    border: "border-emerald-200/24",
    surface: "bg-emerald-200/[0.07]",
    icon: "text-emerald-100",
  },
  amber: {
    glow: "from-amber-200/24 via-rose-300/10 to-transparent",
    eyebrow: "text-amber-100",
    border: "border-amber-200/24",
    surface: "bg-amber-200/[0.07]",
    icon: "text-amber-100",
  },
  rose: {
    glow: "from-rose-300/24 via-fuchsia-300/10 to-transparent",
    eyebrow: "text-rose-100",
    border: "border-rose-200/24",
    surface: "bg-rose-200/[0.07]",
    icon: "text-rose-100",
  },
  violet: {
    glow: "from-violet-300/24 via-cyan-300/10 to-transparent",
    eyebrow: "text-violet-100",
    border: "border-violet-200/24",
    surface: "bg-violet-200/[0.07]",
    icon: "text-violet-100",
  },
};

function buildPageJsonLd(page) {
  const pageUrl = `${QA_SITE_URL}${page.href}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: page.eyebrow,
      headline: page.title,
      description: page.description,
      datePublished: EDITORIAL_LAUNCH_DATE,
      dateModified: EDITORIAL_LAUNCH_DATE,
      inLanguage: "en",
      isPartOf: { "@id": QA_WEBSITE_ID },
      publisher: { "@id": QA_ORGANIZATION_ID },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${QA_SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Trust center", item: `${QA_SITE_URL}/about` },
        { "@type": "ListItem", position: 3, name: page.eyebrow, item: pageUrl },
      ],
    },
  ];
}

export default function TrustPage({ pageKey, children = null }) {
  const page = getTrustPage(pageKey);
  if (!page) return null;

  const accent = ACCENTS[page.accent] || ACCENTS.cyan;
  const jsonLd = buildPageJsonLd(page);

  return (
    <main className="qa-page min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_12%_2%,rgba(34,211,238,0.11),transparent_25%),radial-gradient(circle_at_88%_6%,rgba(244,114,182,0.10),transparent_25%),linear-gradient(180deg,#03040a_0%,#080812_48%,#040406_100%)] px-4 py-7 text-white sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/48">
          <Link href="/" className="transition hover:text-white">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/about" className="transition hover:text-white">Trust center</Link>
        </div>

        <nav aria-label="Editorial trust pages" className="-mx-4 mt-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <div className="flex min-w-max gap-2">
            {TRUST_NAV_ITEMS.map((item) => {
              const active = item.key === pageKey;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`qa-action rounded-full border px-3.5 py-2 text-xs transition ${
                    active
                      ? `${accent.border} ${accent.surface} ${accent.eyebrow}`
                      : "border-white/12 bg-white/[0.045] text-white/64 hover:border-white/26 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <header className="relative mt-4 overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(155deg,rgba(19,23,36,0.96),rgba(8,8,13,0.99))] p-5 shadow-[0_36px_110px_rgba(0,0,0,0.48)] sm:rounded-[36px] sm:p-9">
          <div className={`pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-br ${accent.glow} blur-3xl`} />
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10 bg-white/[0.025]" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <div className={`inline-flex items-center gap-2 rounded-full border ${accent.border} ${accent.surface} px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${accent.eyebrow}`}>
                <Sparkles size={12} aria-hidden="true" />
                {page.eyebrow}
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
                {page.title}
              </h1>
              <p className="mt-5 max-w-3xl text-[15px] leading-7 text-white/76 sm:text-base sm:leading-8">
                {page.intro}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
              {page.highlights.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3 backdrop-blur sm:px-4">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-white/42 sm:text-[10px]">{item.label}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-white/84 sm:text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
          <div className="space-y-4">
            {page.sections.map((section, index) => (
              <section
                id={section.id}
                key={`${pageKey}-${section.title}`}
                className="qa-premium-card scroll-mt-24 rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.24)] sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${accent.border} ${accent.surface} ${accent.icon}`}>
                    {index % 3 === 0 ? <ShieldCheck size={17} aria-hidden="true" /> : index % 3 === 1 ? <BookOpenCheck size={17} aria-hidden="true" /> : <Fingerprint size={17} aria-hidden="true" />}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold tracking-[-0.02em] text-white">{section.title}</h2>
                    {section.body ? <p className="mt-3 text-sm leading-7 text-white/72">{section.body}</p> : null}
                  </div>
                </div>

                {section.bullets?.length ? (
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2.5 rounded-2xl border border-white/8 bg-black/20 px-3.5 py-3 text-sm leading-6 text-white/70">
                        <Check size={15} className={`mt-1 shrink-0 ${accent.icon}`} aria-hidden="true" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {section.note ? (
                  <div className={`mt-4 rounded-2xl border ${accent.border} ${accent.surface} px-4 py-3 text-sm leading-6 text-white/76`}>
                    {section.note}
                  </div>
                ) : null}
              </section>
            ))}

            {children}
          </div>

          <aside className="space-y-3 lg:sticky lg:top-6">
            <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,22,32,0.95),rgba(8,8,12,0.98))] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.28)]">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${accent.border} ${accent.surface} ${accent.icon}`}>
                <FileClock size={18} aria-hidden="true" />
              </div>
              <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-white/42">Policy status</p>
              <p className="mt-1 text-sm font-semibold text-white/88">Published 4 August 2026</p>
              <p className="mt-2 text-xs leading-6 text-white/58">
                Material updates will be recorded through the Queer Atlas corrections standard.
              </p>
              <Link href="/corrections" className={`qa-action mt-4 inline-flex items-center gap-2 rounded-full border ${accent.border} ${accent.surface} px-3 py-2 text-xs ${accent.eyebrow}`}>
                Report an issue <ArrowUpRight size={13} aria-hidden="true" />
              </Link>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/42">Editorial desk</p>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Questions about a source, update, or press request can be routed through one contact desk.
              </p>
              <Link href="/contact" className="qa-action mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white/88 transition hover:text-white">
                Contact Queer Atlas <ArrowUpRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
