import Link from "next/link";
import { listSeoReports } from "@/lib/seo/reportsIndex";
import { QA_ORGANIZATION_ID, QA_SITE_URL, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";

const REPORT_CARD_TONES = [
  "border-fuchsia-200/22 bg-[linear-gradient(145deg,rgba(244,114,182,0.1),rgba(139,92,246,0.045))] hover:border-fuchsia-100/42",
  "border-cyan-200/22 bg-[linear-gradient(145deg,rgba(34,211,238,0.1),rgba(139,92,246,0.045))] hover:border-cyan-100/42",
  "border-emerald-200/22 bg-[linear-gradient(145deg,rgba(52,211,153,0.1),rgba(34,211,238,0.04))] hover:border-emerald-100/42",
  "border-amber-200/22 bg-[linear-gradient(145deg,rgba(251,191,36,0.1),rgba(244,114,182,0.04))] hover:border-amber-100/42",
  "border-violet-200/22 bg-[linear-gradient(145deg,rgba(167,139,250,0.11),rgba(45,212,191,0.04))] hover:border-violet-100/42",
];

export const metadata = {
  title: "Queer Reports 2026: Nightlife, Safety & Events",
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_-10%,rgba(91,33,182,0.12),transparent_34%),#050505] px-4 py-8 text-white sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="relative isolate overflow-hidden rounded-[36px] border border-violet-100/22 bg-[radial-gradient(circle_at_85%_0%,rgba(244,114,182,0.22),transparent_34%),radial-gradient(circle_at_12%_100%,rgba(34,211,238,0.18),transparent_38%),linear-gradient(135deg,#3a1e4d_0%,#202d55_52%,#16454b_100%)] p-6 shadow-[0_32px_100px_rgba(8,5,24,0.38)] sm:p-9 lg:p-11">
          <Link href="/now/data" className="inline-flex min-h-11 items-center rounded-full border border-white/22 bg-white/[0.1] px-4 py-2.5 text-xs font-semibold text-white/86 transition hover:-translate-y-0.5 hover:bg-white/[0.16]">← Data &amp; Reports</Link>
          <div className="mt-7 flex flex-wrap items-center gap-2"><span className="rounded-full border border-white/18 bg-white/[0.1] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.17em] text-cyan-50">Queer Atlas Intelligence</span><span className="rounded-full border border-lime-100/20 bg-lime-100/[0.09] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-lime-50/80">{reports.length} published reports</span></div>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-5xl lg:text-6xl">Queer data, made <span className="text-cyan-100">useful.</span></h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
            Citation-ready report pages with explicit methodology and stable URLs for search and AI summarization.
          </p>
        </section>

        <section className="rounded-[30px] border border-white/12 bg-white/[0.025] p-4 sm:p-6">
          <div className="mb-5 px-1"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-100/58">The library</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Indexes, rankings &amp; field reports</h2></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {reports.map((report, index) => (
              <Link
                key={report.slug}
                href={`/reports/${report.slug}`}
                className={`group relative overflow-hidden rounded-[24px] border p-5 text-sm text-white/84 transition hover:-translate-y-0.5 hover:text-white ${REPORT_CARD_TONES[index % REPORT_CARD_TONES.length]}`}
              >
                <div className="flex items-start justify-between gap-4"><span className="rounded-full border border-white/13 bg-black/15 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-white/52">{report.intent || report.reportType || "report"}</span><span aria-hidden="true" className="text-lg text-white/34 transition group-hover:translate-x-1 group-hover:text-white/78">→</span></div>
                <p className="mt-5 text-lg font-semibold leading-6 tracking-[-0.02em] text-white">{report.title}</p>
                <p className="mt-2 text-xs leading-6 text-white/58">{report.summary}</p>
                <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.13em] text-white/34">Updated {report.updatedAt}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-cyan-200/18 bg-[radial-gradient(circle_at_90%_0%,rgba(34,211,238,0.12),transparent_34%),linear-gradient(145deg,rgba(139,92,246,0.08),rgba(10,20,28,0.94))] p-6 sm:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/60">Trust layer</p><h2 className="mt-2 text-xl font-semibold text-cyan-50">Methodology first. Claims second.</h2>
          <p className="mt-2 text-sm leading-7 text-cyan-50/84">
            Each report keeps full citation and source logic while city and topic pages stay visually clean.
          </p>
        </section>
      </div>
    </main>
  );
}
