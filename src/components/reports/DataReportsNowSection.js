import Link from "next/link";
import GlobalQueerSafetyCultureRanking from "@/components/reports/GlobalQueerSafetyCultureRanking";
import { listSeoReports } from "@/lib/seo/reportsIndex";
import { GLOBAL_QUEER_SAFETY_CULTURE_INDEX_2026, GLOBAL_QUEER_SAFETY_CULTURE_INDEX_META_2026 } from "@/lib/seo/globalQueerSafetyCultureIndex2026";

const REPORT_ACCENTS = [
  "border-fuchsia-200/20 bg-fuchsia-200/[0.07] hover:border-fuchsia-200/42",
  "border-cyan-200/20 bg-cyan-200/[0.07] hover:border-cyan-200/42",
  "border-amber-200/20 bg-amber-200/[0.07] hover:border-amber-200/42",
  "border-violet-200/20 bg-violet-200/[0.07] hover:border-violet-200/42",
];

const INDEX_ROUTE = "/reports/global-queer-safety-culture-index-methodology";
const SCORE_CATEGORIES = [
  ["Legal protection", "50%", "The mean of F&M Unified Rights, Equaldex Legal Rights and ILGA-Europe 2026 where that regional index applies.", "border-rose-100/20 bg-rose-100/[0.055]"],
  ["Lived acceptance", "50%", "The mean of F&M Lived Experience, Equaldex Public Opinion and the Williams Global Acceptance Index.", "border-cyan-100/20 bg-cyan-100/[0.055]"],
];

export default function DataReportsNowSection() {
  const leader = GLOBAL_QUEER_SAFETY_CULTURE_INDEX_2026.find((entry) => entry.rankEligible);
  const supportingReports = listSeoReports()
    .filter((report) => report.slug !== "global-queer-safety-culture-index-methodology")
    .slice(0, 4);

  return (
    <section id="data-reports" aria-labelledby="global-index-heading" className="space-y-5">
      <article className="relative isolate overflow-hidden rounded-[34px] border border-fuchsia-100/22 bg-[linear-gradient(135deg,#54234f_0%,#25395d_48%,#17515a_100%)] p-5 shadow-[0_32px_100px_rgba(13,10,31,0.42)] sm:p-8 lg:p-10">
        <div aria-hidden="true" className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-cyan-200/18 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-28 left-[18%] -z-10 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(310px,0.75fr)] lg:items-center">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/22 bg-white/12 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90">Flagship index · 2026</span>
              <span className="rounded-full border border-lime-100/26 bg-lime-100/12 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-lime-50">2026 results published</span>
            </div>
            <h1 id="global-index-heading" className="mt-5 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-5xl lg:text-[3.55rem]">
              Global Queer Safety <span className="text-cyan-100">&amp; Culture Index</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/76 sm:text-lg sm:leading-8">
              One global view of where queer life is protected, practical, visible, and culturally alive.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="#ranking" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 bg-white px-5 py-3 text-sm font-semibold text-[#35213f] shadow-[0_12px_34px_rgba(255,255,255,0.16)] transition hover:-translate-y-0.5 hover:bg-cyan-50">
                See the 2026 ranking
                <span aria-hidden="true" className="ml-2">→</span>
              </Link>
              <Link href={INDEX_ROUTE} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/24 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/16">
                Methodology &amp; progress
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/18 bg-[#11162a]/42 p-4 shadow-[0_24px_70px_rgba(7,9,24,0.3)] backdrop-blur-md sm:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/68">Highest external context rating · 2026 table</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-white">{leader.cityName}</p>
            <p className="mt-1 text-sm text-white/55">{leader.country}</p>
            <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/12 pt-5">
              <div><p className="text-4xl font-semibold tracking-[-0.06em] text-white">{leader.sourceRating}</p><p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/42">Multi-source score</p></div>
              <div className="text-right"><p className="text-sm font-semibold text-rose-100">{leader.evidence.legalComposite}/100 Legal</p><p className="mt-1 text-sm font-semibold text-cyan-100">{leader.evidence.livedComposite}/100 Lived</p></div>
            </div>
            <p className="mt-4 text-xs leading-5 text-white/58">This position combines multiple published legal and lived-acceptance sources. It remains national context attached to an Atlas city.</p>
          </div>
        </div>
      </article>

      <GlobalQueerSafetyCultureRanking />

      <section aria-labelledby="measures-heading" className="rounded-[28px] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/46">The score</p>
            <h3 id="measures-heading" className="mt-2 text-xl font-semibold tracking-[-0.025em] text-white">What the index measures</h3>
          </div>
          <Link href={INDEX_ROUTE} className="text-xs font-semibold text-cyan-100/76 transition hover:text-cyan-50">See methodology →</Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {SCORE_CATEGORIES.map(([label, maximum, description, tone]) => (
            <article key={label} className={`rounded-[22px] border p-4 ${tone}`}><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-white">{label}</p><span className="text-2xl font-semibold tracking-[-0.05em] text-white">{maximum}</span></div><p className="mt-3 text-xs leading-5 text-white/48">{description}</p></article>
          ))}
        </div>
      </section>

      <section aria-labelledby="other-reports-heading" className="rounded-[28px] border border-white/12 bg-white/[0.025] p-5 sm:p-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-100/60">Published now</p>
          <h3 id="other-reports-heading" className="mt-2 text-xl font-semibold tracking-[-0.025em] text-white">Other Queer Atlas indexes &amp; reports</h3>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {supportingReports.map((report, index) => (
            <Link key={report.slug} href={`/reports/${report.slug}`} className={`group rounded-[22px] border p-4 transition hover:-translate-y-0.5 ${REPORT_ACCENTS[index]}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold leading-5 text-white/90 group-hover:text-white">{report.title}</p>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-white/48">{report.summary}</p>
                </div>
                <span aria-hidden="true" className="text-white/38 transition group-hover:translate-x-0.5 group-hover:text-white/76">→</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <p className="max-w-2xl text-xs leading-5 text-white/42">Methods, source registers, corrections, and limitations remain available for transparency without competing with the main index.</p>
          <Link href="/reports" className="inline-flex min-h-10 items-center rounded-full border border-violet-100/24 bg-violet-100/10 px-4 py-2 text-xs font-semibold text-violet-50 transition hover:bg-violet-100/16">All reports</Link>
        </div>
      </section>
    </section>
  );
}
