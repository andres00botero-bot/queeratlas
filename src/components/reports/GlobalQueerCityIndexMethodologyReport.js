import Link from "next/link";
import GlobalQueerSafetyCultureRanking from "@/components/reports/GlobalQueerSafetyCultureRanking";
import { GLOBAL_QUEER_SAFETY_CULTURE_INDEX_META_2026 } from "@/lib/seo/globalQueerSafetyCultureIndex2026";

const CATEGORIES = [
  { name: "Legal protection", points: "50%", tone: "border-rose-100/20 bg-rose-100/[0.055]", items: ["F&M Unified Rights 2024", "Equaldex Legal Rights snapshot", "ILGA-Europe 2026 where covered", "Mean of available legal inputs", "Minimum two sources"] },
  { name: "Lived acceptance", points: "50%", tone: "border-cyan-100/20 bg-cyan-100/[0.055]", items: ["F&M Lived Experience 2024", "Equaldex Public Opinion snapshot", "Williams GAI 2017–2020", "GAI converted from 0–10 to 0–100", "Minimum two sources"] },
];

export default function GlobalQueerCityIndexMethodologyReport() {
  const meta = GLOBAL_QUEER_SAFETY_CULTURE_INDEX_META_2026;
  return (
    <div className="space-y-5">
      <article className="relative isolate overflow-hidden rounded-[34px] border border-fuchsia-100/22 bg-[linear-gradient(135deg,#57234f_0%,#2b315d_50%,#15535b_100%)] p-5 shadow-[0_32px_100px_rgba(13,10,31,0.42)] sm:p-8 lg:p-10">
        <div aria-hidden="true" className="absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full bg-cyan-200/18 blur-3xl" />
        <div className="grid gap-7 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div><span className="rounded-full border border-lime-100/24 bg-lime-100/12 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-lime-50">2026 multi-source index · method QA-GQSCI-3.0</span><h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-5xl lg:text-[3.6rem]">Global Queer Safety <span className="text-cyan-100">&amp; Culture Index</span></h1><p className="mt-5 max-w-2xl text-base leading-7 text-white/74">The index triangulates published legal protection, public opinion, lived experience and long-term acceptance data into one traceable national context score.</p></div>
          <div className="rounded-[26px] border border-white/18 bg-[#10162a]/42 p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/46">Published scope</p><p className="mt-3 text-3xl font-semibold text-white">{meta.rankedCities} ranked cities</p><p className="mt-1 text-sm text-white/50">All {meta.atlasCities} Atlas destinations remain visible.</p><p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-white/48">Every ranked entry requires at least two legal and two lived-acceptance inputs. Islands and regions remain visible without being forced into the city ranking.</p></div>
        </div>
      </article>

      <GlobalQueerSafetyCultureRanking />

      <section aria-labelledby="method-heading" className="rounded-[28px] border border-white/12 bg-white/[0.025] p-5 sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-100/58">Published source method</p><h2 id="method-heading" className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">Two balanced pillars. Multiple scored sources.</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">{CATEGORIES.map((category) => <article key={category.name} className={`rounded-[22px] border p-4 ${category.tone}`}><div className="flex items-start justify-between gap-3"><h3 className="text-sm font-semibold text-white">{category.name}</h3><span className="text-2xl font-semibold text-white">{category.points}</span></div><ul className="mt-4 space-y-2 text-[11px] leading-4 text-white/52">{category.items.map((item) => <li key={item}>• {item}</li>)}</ul></article>)}</div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-[22px] border border-rose-100/18 bg-rose-100/[0.05] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-rose-100/65">Triangulation</p><h2 className="mt-2 text-sm font-semibold text-white">No single publisher controls the result</h2><p className="mt-1 text-xs leading-5 text-white/48">Each pillar is calculated from at least two disclosed datasets, and every underlying value can be opened from the ranking.</p></article>
        <article className="rounded-[22px] border border-cyan-100/18 bg-cyan-100/[0.05] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-100/65">Source disagreement</p><h2 className="mt-2 text-sm font-semibold text-white">Divergence is shown, not hidden</h2><p className="mt-1 text-xs leading-5 text-white/48">The city reading flags material differences between contributing source values instead of smoothing away uncertainty.</p></article>
        <article className="rounded-[22px] border border-lime-100/18 bg-lime-100/[0.05] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-lime-100/65">Reader protection</p><h2 className="mt-2 text-sm font-semibold text-white">National context is labelled as national</h2><p className="mt-1 text-xs leading-5 text-white/48">The table does not turn a country survey into a neighbourhood-level guarantee or a hidden city-culture score.</p></article>
      </section>

      <section className="rounded-[26px] border border-white/12 bg-white/[0.025] p-5"><h2 className="text-lg font-semibold text-white">Sources and limits</h2><p className="mt-2 text-xs leading-5 text-white/50">The score is 50% legal protection and 50% lived acceptance. Each pillar is the mean of its available disclosed inputs, with a minimum of two. ILGA-Europe contributes only inside its geographic coverage. Williams GAI is converted from 0–10 to 0–100 and clearly retained as a 2017–2020 longitudinal measure. Results describe national context and must not be read as neighbourhood-level guarantees.</p><div className="mt-4 flex flex-wrap gap-2"><Link href="https://www.fandmglobalbarometers.org/gbur-results/" target="_blank" rel="noreferrer" className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-xs text-white/65">F&amp;M Global Barometers ↗</Link><Link href="https://www.equaldex.com/equality-index" target="_blank" rel="noreferrer" className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-xs text-white/65">Equaldex ↗</Link><Link href="https://www.ilga-europe.org/report/rainbow-map-2026/" target="_blank" rel="noreferrer" className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-xs text-white/65">ILGA-Europe 2026 ↗</Link><Link href="https://williamsinstitute.law.ucla.edu/publications/global-acceptance-index-lgbt/" target="_blank" rel="noreferrer" className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-xs text-white/65">Williams GAI ↗</Link><Link href="https://ilga.org/laws-on-us-report/" target="_blank" rel="noreferrer" className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-xs text-white/65">ILGA World definitions ↗</Link></div></section>
    </div>
  );
}
