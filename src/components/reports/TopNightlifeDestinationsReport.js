import Link from "next/link";
import { NIGHTLIFE_INDEX_2026 } from "@/lib/seo/nightlifeIndex2026";

const TONES = ["border-fuchsia-200/24 bg-fuchsia-200/[0.08]", "border-cyan-200/24 bg-cyan-200/[0.075]", "border-amber-200/24 bg-amber-200/[0.075]"];

function cityLabel(value = "") {
  return String(value).replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function TopNightlifeDestinationsReport() {
  const index = NIGHTLIFE_INDEX_2026;
  const visibleEntries = index.entries.slice(0, 10);
  const remainingEntries = index.entries.slice(10);
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-fuchsia-200/22 bg-[radial-gradient(circle_at_8%_0%,rgba(217,70,239,0.21),transparent_36%),radial-gradient(circle_at_92%_8%,rgba(34,211,238,0.17),transparent_38%),linear-gradient(145deg,rgba(48,18,64,0.8),rgba(8,29,43,0.94))] p-5 shadow-[0_24px_80px_rgba(10,8,32,0.25)] sm:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-fuchsia-100/72">Travel-facing edition · evidence model {index.methodologyVersion}</p>
        <h2 className="mt-2 max-w-3xl text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">25 nightlife destinations, ranked with every component visible</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62">The same frozen evidence model as the Queer Nightlife Index, translated into a destination shortlist. Scores combine scene depth, diversity, event momentum, practical venue intelligence, route readiness and community evidence.</p>
        <div className="mt-5 flex flex-wrap gap-2"><Link href="/api/reports/nightlife-index-2026" download className="rounded-full border border-fuchsia-200/28 bg-fuchsia-200/12 px-4 py-2.5 text-xs font-semibold text-fuchsia-50">Download CSV</Link><Link href="/reports/queer-nightlife-index-2026" className="rounded-full border border-cyan-200/24 bg-cyan-200/[0.09] px-4 py-2.5 text-xs font-semibold text-cyan-50">Read the full methodology</Link></div>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">{index.entries.slice(0, 3).map((entry, position) => <article key={entry.city} className={`rounded-[26px] border p-5 ${TONES[position]}`}><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/16 bg-white/[0.08] text-sm font-semibold">#{entry.rank}</span><p className="text-4xl font-semibold tracking-[-0.06em]">{entry.score}</p></div><Link href={`/${entry.city}`} className="mt-5 inline-block text-2xl font-semibold tracking-[-0.04em] hover:text-cyan-100">{cityLabel(entry.city)}</Link><p className="text-xs text-white/42">{entry.country}</p><p className="mt-4 text-xs leading-5 text-white/60">{entry.signal}</p><p className="mt-3 text-[10px] uppercase tracking-[0.11em] text-white/38">{entry.places} places · {entry.events} events · {entry.reviews} reviews</p></article>)}</section>

      <section className="overflow-hidden rounded-[30px] border border-violet-100/14 bg-[linear-gradient(160deg,rgba(139,92,246,0.055),rgba(8,13,25,0.94)_28%)]">
        <header className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(217,70,239,0.075),rgba(34,211,238,0.06))] px-5 py-5"><p className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-100/68">Full destination ranking</p><h2 className="mt-1 text-xl font-semibold">Top 25 LGBTQ nightlife destinations</h2><p className="mt-2 text-xs leading-5 text-white/46">Scores are evidence coverage at the 2026-08-11 snapshot—not a promise about personal fit or safety.</p></header>
        <div className="divide-y divide-white/[0.07]">{visibleEntries.map((entry) => <DestinationRow key={entry.city} entry={entry} components={index.components} />)}</div>
        <details className="group border-t border-white/10">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-white/78"><span><span className="block">View destinations #11–#25</span><span className="mt-1 block text-xs font-normal text-white/40">All scores and six components remain available</span></span><span className="flex h-9 w-9 items-center justify-center rounded-full border border-fuchsia-200/18 bg-fuchsia-200/[0.07] text-fuchsia-50 transition group-open:rotate-45">+</span></summary>
          <div className="divide-y divide-white/[0.07] border-t border-white/8">{remainingEntries.map((entry) => <DestinationRow key={entry.city} entry={entry} components={index.components} />)}</div>
        </details>
      </section>

      <section className="rounded-[28px] border border-amber-200/18 bg-amber-200/[0.055] p-5 sm:p-6"><p className="text-[10px] uppercase tracking-[0.18em] text-amber-100/66">Read responsibly</p><h2 className="mt-2 text-xl font-semibold">A shortlist backed by visible evidence</h2><p className="mt-3 text-sm leading-7 text-white/62">This list reuses the audited Nightlife Index snapshot; it does not introduce a second hidden ranking. Database depth differs by city, event calendars remain incomplete and nightlife strength is not the same as personal safety.</p></section>
    </div>
  );
}

function DestinationRow({ entry, components }) {
  return <article className="grid grid-cols-[44px_minmax(0,1fr)_62px] items-center gap-x-3 gap-y-3 px-4 py-4 transition hover:bg-white/[0.025] sm:px-5 lg:grid-cols-[58px_minmax(190px,1fr)_90px_1.4fr] lg:gap-4 lg:py-5"><span className="text-base font-semibold tabular-nums text-white/58 lg:text-xl lg:text-white/72">#{entry.rank}</span><div className="min-w-0"><Link href={`/${entry.city}`} className="font-semibold text-white hover:text-cyan-100">{cityLabel(entry.city)}</Link><p className="truncate text-[11px] text-white/38 lg:text-xs">{entry.country}</p><p className="mt-2 hidden text-xs leading-5 text-white/55 lg:block">{entry.signal}</p></div><div className="text-right lg:text-left"><p className="text-xl font-semibold text-cyan-100 lg:text-2xl">{entry.score}</p><p className="text-[8px] uppercase tracking-[0.1em] text-white/30 lg:text-[9px] lg:tracking-[0.13em]">score</p></div><div className="col-span-3 grid grid-cols-6 gap-1.5 lg:col-span-1 lg:gap-2">{components.map((component) => <div key={component.key} className="min-w-0 rounded-lg border border-white/8 bg-white/[0.03] px-1.5 py-1.5 text-center lg:rounded-xl lg:px-2 lg:py-2 lg:text-left"><p className="truncate text-[7px] uppercase tracking-[0.05em] text-white/32 lg:text-[8px] lg:tracking-[0.08em]">{component.label.split(" ")[0]}</p><p className="mt-0.5 text-[10px] font-semibold text-white/74 lg:mt-1 lg:text-xs">{entry.scores[component.key]}<span className="hidden text-white/30 lg:inline">/{component.weight}</span></p></div>)}</div></article>;
}
