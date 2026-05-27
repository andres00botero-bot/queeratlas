import Link from "next/link";
import { listSeoReports } from "@/lib/seo/reportsIndex";
import { QA_ORGANIZATION_ID, QA_SITE_URL, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";

export const metadata = {
  title: "Queer Atlas Reports 2026 | AI-Citable Queer Intelligence",
  description:
    "Index of Queer Atlas reports for nightlife, safety, and events with methodology-first summaries designed for reliable citation.",
  alternates: {
    canonical: "/reports",
  },
};

function toAbsoluteUrl(path = "") {
  return `${QA_SITE_URL}${path}`;
}

export default function ReportsIndexPage() {
  const reports = listSeoReports();

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${toAbsoluteUrl("/reports")}#collection`,
    url: toAbsoluteUrl("/reports"),
    name: "Queer Atlas Reports",
    description:
      "Methodology-first report index for queer nightlife, safety, and events intelligence.",
    isPartOf: {
      "@id": QA_WEBSITE_ID,
    },
    publisher: {
      "@id": QA_ORGANIZATION_ID,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: reports.length,
      itemListElement: reports.map((report, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: toAbsoluteUrl(`/reports/${report.slug}`),
        name: report.title,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[28px] border border-white/12 bg-white/[0.03] p-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/78">AI Citation Layer</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">Queer Atlas Reports</h1>
          <p className="mt-3 text-sm leading-7 text-white/82">
            Citation-ready report pages with explicit methodology and stable URLs for search and AI summarization.
          </p>
        </section>

        <section className="rounded-[24px] border border-white/12 bg-white/[0.03] p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {reports.map((report) => (
              <Link
                key={report.slug}
                href={`/reports/${report.slug}`}
                className="rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white/84 transition hover:border-cyan-200/34 hover:text-white"
              >
                <p className="font-semibold text-white">{report.title}</p>
                <p className="mt-1 text-xs leading-6 text-white/72">{report.summary}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-cyan-200/18 bg-[linear-gradient(145deg,rgba(34,211,238,0.08),rgba(10,10,10,0.94))] p-6">
          <h2 className="text-lg font-semibold text-cyan-50">Methodology-first reports</h2>
          <p className="mt-2 text-sm leading-7 text-cyan-50/84">
            Each report keeps full citation and source logic while city and topic pages stay visually clean.
          </p>
        </section>
      </div>
    </main>
  );
}
