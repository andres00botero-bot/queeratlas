import Link from "next/link";
import { GLOBAL_QUEER_SAFETY_CULTURE_INDEX_2026, GLOBAL_QUEER_SAFETY_CULTURE_INDEX_META_2026 } from "@/lib/seo/globalQueerSafetyCultureIndex2026";

const PODIUM_TONES = [
  "border-amber-200/35 bg-[linear-gradient(145deg,rgba(251,191,36,0.19),rgba(244,114,182,0.08))]",
  "border-cyan-100/28 bg-[linear-gradient(145deg,rgba(165,243,252,0.14),rgba(139,92,246,0.08))]",
  "border-rose-200/28 bg-[linear-gradient(145deg,rgba(253,164,175,0.14),rgba(251,146,60,0.06))]",
];

function Score({ label, value, maximum, tone = "text-white" }) {
  return <div className="min-w-0"><p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/42">{label}</p><p className={`mt-0.5 text-lg font-semibold tracking-[-0.035em] ${tone}`}>{value ?? "—"}{value !== null && value !== undefined && <span className="ml-0.5 text-[10px] text-white/30">/{maximum}</span>}</p></div>;
}

function SourceReferences({ sources = [] }) {
  return (
    <details className="group mt-2">
      <summary className="cursor-pointer list-none text-[9px] font-semibold uppercase tracking-[0.11em] text-cyan-100/55 transition hover:text-cyan-50">{sources.length} scored inputs <span aria-hidden="true" className="inline-block transition group-open:rotate-45">+</span></summary>
      <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Scored source inputs and values">{sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" title={source.role} className="rounded-full border border-white/12 bg-white/[0.045] px-2 py-1 text-[9px] font-semibold text-white/50 transition hover:border-cyan-100/30 hover:text-cyan-50">{source.label} · {source.value}</a>)}</div>
    </details>
  );
}

function CityRow({ entry, unranked = false }) {
  return (
    <article className="grid gap-3 border-b border-white/[0.075] px-4 py-4 last:border-b-0 md:grid-cols-[76px_minmax(150px,0.75fr)_86px_90px_90px_minmax(260px,1.55fr)] md:items-center">
      <div className="flex items-center justify-between md:block"><span className="text-sm font-semibold text-white/48">{unranked ? "NR" : `#${entry.rank}`}</span><span className="text-2xl font-semibold tracking-[-0.045em] text-white md:hidden">{entry.sourceRating ?? "—"}</span></div>
      <div><Link href={`/${entry.city}`} className="text-base font-semibold text-white/90 transition hover:text-cyan-100">{entry.cityName}</Link><p className="mt-0.5 text-[11px] text-white/40">{entry.country} · national multi-source context</p></div>
      <span className="hidden text-lg font-semibold text-white md:block">{entry.sourceRating ?? "—"}</span>
      <div className="grid grid-cols-2 gap-3 md:contents"><Score label="Legal mix" value={entry.evidence.legalComposite} maximum="100" tone="text-rose-100" /><Score label="Lived mix" value={entry.evidence.livedComposite} maximum="100" tone="text-cyan-100" /></div>
      <div><p className="text-xs leading-5 text-white/56">{unranked ? "Not Rated: a required external score field is unavailable or this destination is not a comparable city unit." : entry.summary}</p><SourceReferences sources={entry.sourceReferences} /></div>
    </article>
  );
}

export default function GlobalQueerSafetyCultureRanking() {
  const ranked = GLOBAL_QUEER_SAFETY_CULTURE_INDEX_2026.filter((entry) => entry.rankEligible);
  const unranked = GLOBAL_QUEER_SAFETY_CULTURE_INDEX_2026.filter((entry) => !entry.rankEligible);
  const podium = ranked.slice(0, 3);
  const visibleRankedCount = 30;
  const remainingRankedCount = Math.max(0, ranked.length - visibleRankedCount);
  const remainingDestinationCount = remainingRankedCount + unranked.length;

  return (
    <section id="ranking" aria-labelledby="ranking-heading" className="rounded-[30px] border border-white/14 bg-[linear-gradient(155deg,rgba(255,255,255,0.07),rgba(255,255,255,0.018))] p-4 shadow-[0_22px_70px_rgba(5,8,25,0.2)] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.19em] text-cyan-100/70">Queer Atlas Index · multi-source edition · 2026</p><h2 id="ranking-heading" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">Safety &amp; Inclusion Context</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Legal protection 50%: F&amp;M, Equaldex and ILGA-Europe where covered. Lived acceptance 50%: F&amp;M, Equaldex and Williams GAI. Every displayed input is traceable from its city row.</p></div>
        <div className="rounded-full border border-white/13 bg-black/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">{ranked.length} ranked · all {GLOBAL_QUEER_SAFETY_CULTURE_INDEX_META_2026.atlasCities} shown</div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        {podium.map((entry, index) => {
          const positionLabel = `Context position #${entry.rank}`;
          return (
            <article key={entry.city} className={`rounded-[25px] border p-5 ${PODIUM_TONES[index]}`}>
              <div className="flex items-start justify-between gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-white/10 text-sm font-semibold text-white">#{entry.rank}</span><div className="text-right"><p className="text-4xl font-semibold tracking-[-0.065em] text-white">{entry.sourceRating}</p><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/42">Source rating</p></div></div>
              <Link href={`/${entry.city}`} className="mt-5 inline-block text-2xl font-semibold tracking-[-0.04em] text-white transition hover:text-cyan-100">{entry.cityName}</Link>
              <p className="mt-0.5 text-xs font-medium text-white/48">{entry.country} · {positionLabel}</p>
              <p className="mt-4 min-h-[3.5rem] text-xs leading-5 text-white/62">{entry.summary}</p>
              <SourceReferences sources={entry.sourceReferences} />
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/12 pt-4"><Score label="Legal mix" value={entry.evidence.legalComposite} maximum="100" tone="text-rose-100" /><Score label="Lived mix" value={entry.evidence.livedComposite} maximum="100" tone="text-cyan-100" /></div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 overflow-hidden rounded-[24px] border border-white/11 bg-black/10">
        <div className="hidden grid-cols-[76px_minmax(150px,0.75fr)_86px_90px_90px_minmax(260px,1.55fr)] gap-3 border-b border-white/10 px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/38 md:grid"><span>Rank</span><span>Atlas city</span><span>Index score</span><span>Legal mix</span><span>Lived mix</span><span>Why this position</span></div>
        {ranked.slice(3, 30).map((entry) => <CityRow key={entry.city} entry={entry} />)}
      </div>

      <details className="group mt-4 overflow-hidden rounded-[24px] border border-violet-100/16 bg-violet-100/[0.035]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 sm:px-5"><span><span className="block text-sm font-semibold text-white/88">View remaining {remainingDestinationCount} destinations</span><span className="mt-1 block text-xs text-white/44">{remainingRankedCount} additional ranked city rows, plus {unranked.length} regional destinations outside the city ranking</span></span><span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/13 bg-white/[0.06] text-white/60 transition group-open:rotate-45">+</span></summary>
        <div className="border-t border-white/10">
          {ranked.slice(30).map((entry) => <CityRow key={entry.city} entry={entry} />)}
          {unranked.length > 0 && <div className="border-y border-amber-100/14 bg-amber-100/[0.045] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-50/68">Not ordinally ranked · insufficient comparable evidence or not a city unit</div>}
          {unranked.map((entry) => <CityRow key={entry.city} entry={entry} unranked />)}
        </div>
      </details>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1"><p className="max-w-3xl text-[11px] leading-5 text-white/42">{GLOBAL_QUEER_SAFETY_CULTURE_INDEX_META_2026.limitation}</p><Link href="/reports/global-queer-safety-culture-index-methodology" className="text-xs font-semibold text-cyan-100/76 transition hover:text-cyan-50">How we scored it →</Link></div>
    </section>
  );
}
