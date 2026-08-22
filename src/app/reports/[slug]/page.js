import Link from "next/link";
import { notFound } from "next/navigation";
import EditorialDisclosure from "@/components/editorial/EditorialDisclosure";
import { getPublishedEditorialRecord } from "@/lib/editorialData";
import { buildEditorialAuthorJsonLd, EDITORIAL_TEAM } from "@/lib/editorialTrust";
import { getSeoReport, listSeoReports } from "@/lib/seo/reportsIndex";
import { QA_ORGANIZATION_ID, QA_SITE_URL, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";
import { NIGHTLIFE_INDEX_2026 } from "@/lib/seo/nightlifeIndex2026";
import { SAFETY_INDEX_2026 } from "@/lib/seo/safetyIndex2026";
import { GLOBAL_QUEER_SAFETY_CULTURE_INDEX_META_2026 } from "@/lib/seo/globalQueerSafetyCultureIndex2026";
import NightlifeIndexReport from "@/components/reports/NightlifeIndexReport";
import SafetyIndexReport from "@/components/reports/SafetyIndexReport";
import GlobalQueerCityIndexMethodologyReport from "@/components/reports/GlobalQueerCityIndexMethodologyReport";

const REPORT_THEMES = Object.freeze({
  nightlife: {
    hero: "border-fuchsia-200/24 bg-[radial-gradient(circle_at_88%_0%,rgba(217,70,239,0.22),transparent_34%),radial-gradient(circle_at_8%_100%,rgba(34,211,238,0.16),transparent_38%),linear-gradient(135deg,#261437_0%,#101a35_54%,#102e36_100%)]",
    eyebrow: "text-fuchsia-100/76",
    accent: "text-cyan-100",
    soft: "border-fuchsia-200/16 bg-fuchsia-200/[0.055]",
  },
  safety: {
    hero: "border-emerald-200/24 bg-[radial-gradient(circle_at_88%_0%,rgba(52,211,153,0.2),transparent_34%),radial-gradient(circle_at_8%_100%,rgba(34,211,238,0.15),transparent_38%),linear-gradient(135deg,#102e2a_0%,#12253a_54%,#17233a_100%)]",
    eyebrow: "text-emerald-100/76",
    accent: "text-emerald-100",
    soft: "border-emerald-200/16 bg-emerald-200/[0.055]",
  },
  events: {
    hero: "border-amber-200/24 bg-[radial-gradient(circle_at_88%_0%,rgba(251,191,36,0.2),transparent_34%),radial-gradient(circle_at_8%_100%,rgba(244,114,182,0.17),transparent_38%),linear-gradient(135deg,#392116_0%,#35203b_54%,#182b40_100%)]",
    eyebrow: "text-amber-100/78",
    accent: "text-amber-100",
    soft: "border-amber-200/16 bg-amber-200/[0.055]",
  },
  research: {
    hero: "border-violet-200/24 bg-[radial-gradient(circle_at_88%_0%,rgba(167,139,250,0.22),transparent_34%),radial-gradient(circle_at_8%_100%,rgba(45,212,191,0.14),transparent_38%),linear-gradient(135deg,#271a42_0%,#172946_54%,#163638_100%)]",
    eyebrow: "text-violet-100/78",
    accent: "text-violet-100",
    soft: "border-violet-200/16 bg-violet-200/[0.055]",
  },
});

function toAbsoluteUrl(path = "") {
  return `${QA_SITE_URL}${path}`;
}

function buildCanonical(slug = "") {
  return `/reports/${slug}`;
}

export const revalidate = 600;

export function generateStaticParams() {
  return listSeoReports().map((report) => ({ slug: report.slug }));
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const slug = String(resolved?.slug || "").trim().toLowerCase();
  const report = getSeoReport(slug);

  if (!report) {
    return {
      title: "Report Not Found",
      robots: { index: false, follow: false },
    };
  }

  const canonical = buildCanonical(report.slug);
  const title = report.reportType === "methodology"
    ? "Global Queer Safety & Culture Index 2026 | Methodology"
    : report.title;
  const description = report.summary;
  const ogTitle = String(report.socialMeta?.ogTitle || title).trim();
  const ogDescription = String(report.socialMeta?.ogDescription || description).trim();

  return {
    title,
    description,
    keywords: [...report.keyphrases, "queer atlas report", "LGBTQ report 2026"],
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: toAbsoluteUrl(canonical),
      type: "article",
      siteName: "Queer Atlas",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
    },
  };
}

function buildFaqEntries(report) {
  if (report.reportType === "methodology") {
    return [
      {
        q: `What is ${report.title}?`,
        a: "It is Queer Atlas's published 2026 multi-source ranking and methodology for comparing national queer safety and inclusion context across Atlas cities.",
      },
      {
        q: "Does this page rank cities?",
        a: "Yes. It ranks 159 city units using national multi-source context. Fifteen island and regional destinations remain visible outside the city ranking.",
      },
      {
        q: "How is the score calculated?",
        a: "The score combines a 50% legal-protection pillar and a 50% lived-acceptance pillar. Each pillar requires at least two disclosed published inputs.",
      },
    ];
  }
  return [
    {
      q: `What is ${report.title}?`,
      a: `${report.title} is a methodology-first Queer Atlas report designed for route-level planning and citation-ready city comparison.`,
    },
    {
      q: "How should this report be cited?",
      a: "Cite the exact report URL and include supporting city/topic route links used for conclusions.",
    },
    {
      q: "Is this legal or medical advice?",
      a: "No. This report is operational nightlife and travel-routing intelligence, not legal or medical advice.",
    },
  ];
}

export default async function ReportDetailPage({ params }) {
  const resolved = await params;
  const slug = String(resolved?.slug || "").trim().toLowerCase();
  const report = getSeoReport(slug);

  if (!report) notFound();

  const isNightlifeIndex = report.slug === NIGHTLIFE_INDEX_2026.slug;
  const isSafetyIndex = report.slug === SAFETY_INDEX_2026.slug;
  const isGlobalMethodology = report.reportType === "methodology";
  const evidenceIndex = isNightlifeIndex ? NIGHTLIFE_INDEX_2026 : isSafetyIndex ? SAFETY_INDEX_2026 : null;
  const theme = REPORT_THEMES[report.intent] || REPORT_THEMES.research;
  const storedEditorial = await getPublishedEditorialRecord(`report:${report.slug}`, {
    publishedAt: report.publishedAt,
    updatedAt: report.updatedAt,
    researchScope: report.researchScope,
    changeLog: report.changeLog,
    author: EDITORIAL_TEAM,
  });
  const editorial = evidenceIndex
    ? {
        ...storedEditorial,
        updatedAt: report.updatedAt,
        researchScope: report.researchScope,
        changeLog: report.changeLog,
      }
    : storedEditorial;
  const citationUrls = [...new Set([
    ...(Array.isArray(report.citations) ? report.citations : []),
    ...editorial.sources.map((source) => source.url),
  ].filter(Boolean))];

  const canonical = buildCanonical(report.slug);
  const canonicalUrl = toAbsoluteUrl(canonical);
  const faqEntries = buildFaqEntries(report);
  const snippetCards = [
    { key: "reddit", label: "Reddit", body: report.creatorSnippets?.reddit || "" },
    { key: "tiktok", label: "TikTok", body: report.creatorSnippets?.tiktok || "" },
    { key: "instagram", label: "Instagram", body: report.creatorSnippets?.instagram || "" },
  ].filter((item) => item.body);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Report",
    "@id": `${canonicalUrl}#report`,
    headline: report.title,
    description: report.summary,
    url: canonicalUrl,
    datePublished: editorial.publishedAt,
    dateModified: editorial.updatedAt,
    isPartOf: {
      "@id": QA_WEBSITE_ID,
    },
    publisher: {
      "@id": QA_ORGANIZATION_ID,
    },
    author: buildEditorialAuthorJsonLd(editorial.author),
    ...(editorial.reviewer ? { reviewedBy: buildEditorialAuthorJsonLd(editorial.reviewer) } : {}),
    ...(citationUrls.length > 0 ? { citation: citationUrls } : {}),
    publishingPrinciples: `${QA_SITE_URL}/editorial-policy`,
    about: report.keyphrases,
    ...(evidenceIndex || isGlobalMethodology ? { mainEntity: { "@id": `${canonicalUrl}#dataset` } } : {}),
  };

  const datasetJsonLd = isGlobalMethodology
    ? {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "@id": `${canonicalUrl}#dataset`,
        name: "Global Queer Safety & Culture Index 2026",
        description: report.summary,
        url: canonicalUrl,
        creator: { "@id": QA_ORGANIZATION_ID },
        publisher: { "@id": QA_ORGANIZATION_ID },
        datePublished: editorial.publishedAt,
        dateModified: editorial.updatedAt,
        measurementTechnique: "QA-GQSCI-3.0 multi-source composite index",
        spatialCoverage: `${GLOBAL_QUEER_SAFETY_CULTURE_INDEX_META_2026.countriesAndTerritories} countries and territories represented by ${GLOBAL_QUEER_SAFETY_CULTURE_INDEX_META_2026.atlasCities} Queer Atlas destinations`,
        variableMeasured: [
          {
            "@type": "PropertyValue",
            name: "Legal protection",
            description: "A 50% composite of available F&M Unified Rights, Equaldex Legal Rights and ILGA-Europe inputs, requiring at least two sources.",
            maxValue: 50,
          },
          {
            "@type": "PropertyValue",
            name: "Lived acceptance",
            description: "A 50% composite of available F&M Lived Experience, Equaldex Public Opinion and Williams Global Acceptance Index inputs, requiring at least two sources.",
            maxValue: 50,
          },
        ],
        license: `${QA_SITE_URL}/terms`,
        isAccessibleForFree: true,
      }
    : evidenceIndex
    ? {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "@id": `${canonicalUrl}#dataset`,
        name: report.title,
        description: report.summary,
        url: canonicalUrl,
        creator: { "@id": QA_ORGANIZATION_ID },
        publisher: { "@id": QA_ORGANIZATION_ID },
        datePublished: editorial.publishedAt,
        dateModified: editorial.updatedAt,
        temporalCoverage: evidenceIndex.temporalCoverage,
        measurementTechnique: evidenceIndex.methodologyVersion,
        variableMeasured: evidenceIndex.components.map((component) => ({
          "@type": "PropertyValue",
          name: component.label,
          description: component.definition,
          maxValue: component.weight,
        })),
        distribution: {
          "@type": "DataDownload",
          encodingFormat: "text/csv",
          contentUrl: `${QA_SITE_URL}${isNightlifeIndex ? "/api/reports/nightlife-index-2026" : "/api/reports/safety-index-2026"}`,
        },
        license: `${QA_SITE_URL}/terms`,
        isAccessibleForFree: true,
      }
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${QA_SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Reports", item: `${QA_SITE_URL}/reports` },
      { "@type": "ListItem", position: 3, name: report.title, item: canonicalUrl },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries.map((entry) => ({
      "@type": "Question",
      name: entry.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.a,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      {datasetJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} /> : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className={`mx-auto space-y-6 ${evidenceIndex || isGlobalMethodology ? "max-w-6xl" : "max-w-4xl"}`}>
        <nav aria-label="Report navigation" className="flex flex-wrap items-center gap-2">
          <Link href="/now/data" className="inline-flex min-h-11 items-center rounded-full border border-cyan-100/24 bg-cyan-100/[0.09] px-4 py-2.5 text-xs font-semibold text-cyan-50 shadow-[0_10px_28px_rgba(34,211,238,0.08)] transition hover:-translate-y-0.5 hover:border-cyan-100/42 hover:bg-cyan-100/[0.15]">← Data &amp; Reports</Link>
          <Link href="/reports" className="inline-flex min-h-11 items-center rounded-full border border-white/18 bg-white/[0.06] px-4 py-2.5 text-xs font-semibold text-white/82 transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.11]">All reports</Link>
        </nav>
        {!isGlobalMethodology ? <header className={`relative isolate overflow-hidden rounded-[34px] border p-6 shadow-[0_28px_90px_rgba(3,5,18,0.32)] sm:p-8 lg:p-10 ${theme.hero}`}>
          <div aria-hidden="true" className="absolute -right-16 -top-24 -z-10 h-64 w-64 rounded-full bg-white/[0.07] blur-3xl" />
          <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border border-white/16 bg-white/[0.09] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.17em] ${theme.eyebrow}`}>Queer Atlas report · 2026</span><span className="rounded-full border border-lime-100/18 bg-lime-100/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-lime-50/76">Published data</span></div>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">{report.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/72 sm:text-lg sm:leading-8">{report.summary}</p>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/12 pt-5 text-[10px] font-semibold uppercase tracking-[0.13em] text-white/42"><span>Published {editorial.publishedAt}</span><span>Updated {editorial.updatedAt}</span><span className={theme.accent}>Stable report URL</span></div>
        </header> : null}

        {!isGlobalMethodology ? <EditorialDisclosure
          author={editorial.author}
          reviewer={editorial.reviewer}
          publishedAt={editorial.publishedAt}
          updatedAt={editorial.updatedAt}
          researchScope={editorial.researchScope}
          changeLog={editorial.changeLog}
          sources={editorial.sources}
        /> : null}

        {isNightlifeIndex ? (
          <NightlifeIndexReport />
        ) : isSafetyIndex ? (
          <SafetyIndexReport />
        ) : isGlobalMethodology ? (
          <GlobalQueerCityIndexMethodologyReport />
        ) : (
          <section className={`rounded-[28px] border p-5 sm:p-6 ${theme.soft}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${theme.eyebrow}`}>Transparent by design</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">How this report is built</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">{report.methodology.map((item, index) => <article key={item} className="rounded-[20px] border border-white/11 bg-black/20 p-4"><span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/14 bg-white/[0.07] text-xs font-semibold text-white/76">{index + 1}</span><p className="mt-3 text-sm leading-6 text-white/66">{item}</p></article>)}</div>
          </section>
        )}

        {!isGlobalMethodology ? <section className="rounded-[28px] border border-cyan-100/14 bg-[linear-gradient(145deg,rgba(34,211,238,0.055),rgba(139,92,246,0.035))] p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/58">Reader notes</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">Questions, answered clearly</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {faqEntries.map((entry) => (
              <article key={entry.q} className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-4">
                <h3 className="text-sm font-semibold text-white">{entry.q}</h3>
                <p className="mt-1 text-sm leading-7 text-white/80">{entry.a}</p>
              </article>
            ))}
          </div>
        </section> : null}

        {snippetCards.length > 0 ? (
          <section className="relative isolate overflow-hidden rounded-[28px] border border-fuchsia-200/18 bg-[radial-gradient(circle_at_90%_0%,rgba(244,114,182,0.14),transparent_36%),linear-gradient(145deg,rgba(126,34,206,0.13),rgba(10,20,35,0.94))] p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fuchsia-100/62">Ready to cite</p><h2 className="mt-2 text-xl font-semibold text-fuchsia-50">Press &amp; social excerpts</h2>
            <p className="mt-2 text-sm leading-7 text-fuchsia-50/82">
              Copy-ready excerpts for social publishing. Keep the report URL in your post when possible.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {snippetCards.map((item) => (
                <article
                  key={item.key}
                  className="rounded-[20px] border border-white/11 bg-white/[0.045] px-4 py-4"
                >
                  <p className="text-[11px] uppercase tracking-[0.14em] text-fuchsia-200/85">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/82">{item.body}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {!isGlobalMethodology ? <nav className="flex flex-wrap gap-2 border-t border-white/8 pt-2">
          <Link
            href="/reports"
            className="rounded-full border border-white/18 bg-white/[0.055] px-4 py-2.5 text-xs font-semibold text-white/84 transition hover:-translate-y-0.5 hover:bg-white/[0.1]"
          >
            All reports
          </Link>
          <Link
            href="/topics"
            className="rounded-full border border-cyan-200/28 bg-cyan-200/12 px-4 py-2.5 text-xs font-semibold text-cyan-50 transition hover:-translate-y-0.5 hover:bg-cyan-200/18"
          >
            Topic hubs
          </Link>
        </nav> : null}
      </div>
    </main>
  );
}
