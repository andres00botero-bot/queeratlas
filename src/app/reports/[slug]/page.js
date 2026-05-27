import Link from "next/link";
import { notFound } from "next/navigation";
import { getSeoReport, listSeoReports } from "@/lib/seo/reportsIndex";
import { QA_ORGANIZATION_ID, QA_SITE_URL, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";

function toAbsoluteUrl(path = "") {
  return `${QA_SITE_URL}${path}`;
}

function buildCanonical(slug = "") {
  return `/reports/${slug}`;
}

export function generateStaticParams() {
  return listSeoReports().map((report) => ({ slug: report.slug }));
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const slug = String(resolved?.slug || "").trim().toLowerCase();
  const report = getSeoReport(slug);

  if (!report) {
    return {
      title: "Report Not Found | Queer Atlas",
      robots: { index: false, follow: false },
    };
  }

  const canonical = buildCanonical(report.slug);
  const title = `${report.title} | Queer Atlas`;
  const description = report.summary;

  return {
    title,
    description,
    keywords: [...report.keyphrases, "queer atlas report", "LGBTQ report 2026"],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: toAbsoluteUrl(canonical),
      type: "article",
      siteName: "Queer Atlas",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function buildFaqEntries(report) {
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

  const canonical = buildCanonical(report.slug);
  const canonicalUrl = toAbsoluteUrl(canonical);
  const faqEntries = buildFaqEntries(report);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Report",
    "@id": `${canonicalUrl}#report`,
    headline: report.title,
    description: report.summary,
    url: canonicalUrl,
    datePublished: report.publishedAt,
    dateModified: report.updatedAt,
    isPartOf: {
      "@id": QA_WEBSITE_ID,
    },
    publisher: {
      "@id": QA_ORGANIZATION_ID,
    },
    about: report.keyphrases,
  };

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-[28px] border border-white/12 bg-white/[0.03] p-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/78">Citable Report</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">{report.title}</h1>
          <p className="mt-3 text-sm leading-7 text-white/82">{report.summary}</p>
          <p className="mt-2 text-xs text-white/60">
            Published {report.publishedAt} | Updated {report.updatedAt}
          </p>
        </header>

        <section className="rounded-[24px] border border-white/12 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">Methodology</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-white/82">
            {report.methodology.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="rounded-[24px] border border-white/12 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">FAQ</h2>
          <div className="mt-3 space-y-4">
            {faqEntries.map((entry) => (
              <article key={entry.q} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                <h3 className="text-sm font-semibold text-white">{entry.q}</h3>
                <p className="mt-1 text-sm leading-7 text-white/80">{entry.a}</p>
              </article>
            ))}
          </div>
        </section>

        <nav className="flex flex-wrap gap-2">
          <Link
            href="/reports"
            className="rounded-full border border-white/16 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.12em] text-white/84"
          >
            All reports
          </Link>
          <Link
            href="/topics"
            className="rounded-full border border-cyan-200/28 bg-cyan-200/12 px-4 py-2 text-xs uppercase tracking-[0.12em] text-cyan-50"
          >
            Topic hubs
          </Link>
        </nav>
      </div>
    </main>
  );
}
