import Link from "next/link";
import { GLOBAL_QUEER_EVENT_REPORT_2026 } from "@/lib/seo/globalQueerEventReport2026";

const PODIUM_TONES = [
  "border-fuchsia-200/25 bg-fuchsia-200/[0.08]",
  "border-cyan-200/25 bg-cyan-200/[0.075]",
  "border-amber-200/25 bg-amber-200/[0.075]",
];

function EventRow({ entry }) {
  return (
    <article className="grid grid-cols-[44px_minmax(0,1fr)_58px] items-center gap-x-3 gap-y-2 px-4 py-3.5 transition hover:bg-white/[0.025] md:grid-cols-[62px_minmax(170px,1fr)_90px_100px_120px_minmax(170px,0.9fr)] md:gap-3 md:py-4 sm:px-5">
      <span className="text-base font-semibold tabular-nums text-white/58 md:text-lg md:text-white/70">#{entry.rank}</span>
      <div className="min-w-0">
        <Link href={`/${entry.city}`} className="font-semibold text-white transition hover:text-cyan-100">{entry.cityName}</Link>
        <p className="truncate text-[11px] text-white/38 md:text-xs">{entry.country}</p>
      </div>
      <div className="text-right md:text-left"><p className="text-xl font-semibold tabular-nums text-fuchsia-100">{entry.events}</p><p className="text-[8px] uppercase tracking-[0.1em] text-white/30 md:text-[9px]">events</p></div>
      <div className="col-start-2 flex items-center gap-2 md:col-auto md:block"><p className="text-xs font-semibold text-white/68 md:text-sm md:text-white/78">{entry.activeMonths} months</p><p className="hidden text-[9px] uppercase tracking-[0.12em] text-white/34 md:block">active calendar</p><span className="h-1 w-1 rounded-full bg-white/20 md:hidden" /><p className="text-xs font-semibold text-cyan-100/72 md:hidden">{entry.routeReadyEvents}/{entry.events} routed</p></div>
      <div className="hidden md:block"><p className="text-sm font-semibold text-cyan-100/82">{entry.routeReadyEvents}/{entry.events}</p><p className="text-[9px] uppercase tracking-[0.12em] text-white/34">route ready</p></div>
      <p className="hidden text-xs leading-5 text-white/48 md:block">{entry.firstEventDate} → {entry.lastEventDate}</p>
    </article>
  );
}

export default function GlobalQueerEventReport() {
  const report = GLOBAL_QUEER_EVENT_REPORT_2026;
  const top = report.entries.slice(0, 3);
  const visible = report.entries.slice(3, 15);
  const remaining = report.entries.slice(15);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-fuchsia-200/22 bg-[radial-gradient(circle_at_8%_0%,rgba(244,114,182,0.2),transparent_35%),radial-gradient(circle_at_92%_8%,rgba(34,211,238,0.18),transparent_38%),linear-gradient(145deg,rgba(54,20,62,0.78),rgba(8,30,44,0.92))] p-5 shadow-[0_24px_80px_rgba(10,8,32,0.25)] sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-fuchsia-100/72">Published 2026 event inventory</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">Where Queer Atlas documents the deepest event calendars</h2>
            <p className="mt-3 text-sm leading-7 text-white/62">A transparent count of indexable 2026 events by Atlas city. This list measures documented calendar depth—not the total size or quality of a city&apos;s queer community.</p>
          </div>
          <Link href="/api/reports/global-queer-event-report-2026" download className="w-fit rounded-full border border-fuchsia-200/30 bg-fuchsia-200/12 px-4 py-2.5 text-xs font-semibold text-fuchsia-50 transition hover:bg-fuchsia-200/20">Download CSV</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[["Indexed events", report.scope.indexedEvents], ["Cities represented", report.scope.atlasCitiesWithEvents], ["Route-ready events", report.scope.routeReadyEvents], ["Snapshot", report.snapshotAt.slice(0, 10)]].map(([label, value], index) => (
            <article key={label} className={`rounded-[20px] border p-4 ${PODIUM_TONES[index % PODIUM_TONES.length]}`}><p className="text-[9px] uppercase tracking-[0.15em] text-white/40">{label}</p><p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{value}</p></article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        {top.map((entry, index) => (
          <article key={entry.city} className={`rounded-[26px] border p-5 ${PODIUM_TONES[index]}`}>
            <div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/16 bg-white/[0.08] text-sm font-semibold">#{entry.rank}</span><div className="text-right"><p className="text-4xl font-semibold tracking-[-0.06em]">{entry.events}</p><p className="text-[9px] uppercase tracking-[0.14em] text-white/38">indexed events</p></div></div>
            <Link href={`/${entry.city}`} className="mt-5 inline-block text-2xl font-semibold tracking-[-0.04em] transition hover:text-cyan-100">{entry.cityName}</Link>
            <p className="text-xs text-white/42">{entry.country}</p>
            <p className="mt-4 text-xs leading-5 text-white/58">Active across {entry.activeMonths} months · {entry.routeReadyEvents} events have both a source link and map coordinates.</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-[30px] border border-violet-100/14 bg-[linear-gradient(160deg,rgba(139,92,246,0.055),rgba(8,13,25,0.94)_28%)]">
        <header className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(244,114,182,0.08),rgba(34,211,238,0.06))] px-5 py-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-100/68">Global city list</p><h2 className="mt-1 text-xl font-semibold">Documented 2026 event calendars</h2><p className="mt-2 text-xs leading-5 text-white/46">Unique positions use event count, active months, route-ready count and city name—in that disclosed order.</p>
        </header>
        <div className="hidden grid-cols-[62px_minmax(170px,1fr)_90px_100px_120px_minmax(170px,0.9fr)] gap-3 border-b border-white/8 px-5 py-3 text-[9px] uppercase tracking-[0.12em] text-white/35 md:grid"><span>Rank</span><span>City</span><span>Events</span><span>Months</span><span>Route ready</span><span>Calendar span</span></div>
        <div className="divide-y divide-white/[0.07]">{visible.map((entry) => <EventRow key={entry.city} entry={entry} />)}</div>
        {remaining.length > 0 ? <details className="group border-t border-white/10"><summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-white/76"><span>View remaining {remaining.length} cities</span><span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] transition group-open:rotate-45">+</span></summary><div className="divide-y divide-white/[0.07] border-t border-white/8">{remaining.map((entry) => <EventRow key={entry.city} entry={entry} />)}</div></details> : null}
      </section>

      <section className="rounded-[28px] border border-amber-200/18 bg-amber-200/[0.055] p-5 sm:p-6"><p className="text-[10px] uppercase tracking-[0.18em] text-amber-100/66">Methodology {report.methodologyVersion}</p><h2 className="mt-2 text-xl font-semibold">What this list does—and does not claim</h2><p className="mt-3 text-sm leading-7 text-white/62">{report.ordering} {report.limitation}</p></section>
    </div>
  );
}
