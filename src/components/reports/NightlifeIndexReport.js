import Link from "next/link";
import { NIGHTLIFE_INDEX_2026 } from "@/lib/seo/nightlifeIndex2026";

function cityLabel(value = "") {
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ScoreBar({ value, maximum }) {
  const share = maximum > 0 ? Math.min(100, (Number(value || 0) / maximum) * 100) : 0;
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300"
        style={{ width: `${share}%` }}
      />
    </div>
  );
}

const FINDINGS = [
  {
    label: "The lead",
    title: "Berlin leads Madrid by 1.1 points",
    body: "Madrid reaches both volume caps. Berlin wins the published score through stronger route, intelligence and community evidence.",
  },
  {
    label: "Documentation",
    title: "Amsterdam has complete intelligence coverage",
    body: "Every eligible nightlife place in the Amsterdam sample carries all five practical topics plus source evidence.",
  },
  {
    label: "Compact power",
    title: "Copenhagen converts a smaller scene into #8",
    body: "Sixteen eligible places are reinforced by all five scene formats and the maximum community-evidence score.",
  },
  {
    label: "Coverage gap",
    title: "New York's permanent scene outruns its event data",
    body: "Twenty-nine nightlife places produce major depth, but only two indexable 2026 events were present at snapshot time.",
  },
];

export default function NightlifeIndexReport() {
  const index = NIGHTLIFE_INDEX_2026;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-cyan-200/16 bg-[radial-gradient(circle_at_8%_0%,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_92%_12%,rgba(217,70,239,0.13),transparent_36%),rgba(255,255,255,0.025)] p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100/72">Published evidence snapshot</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">One score. Six visible components. No hidden editorial reorder.</h2>
            <p className="mt-3 text-sm leading-7 text-white/62">
              The index measures the nightlife information Queer Atlas can substantiate at snapshot time. It compares route-ready queer nightlife ecosystems; it does not claim to measure every venue operating in each city.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/api/reports/nightlife-index-2026"
              download
              className="rounded-full border border-cyan-200/30 bg-cyan-200/12 px-4 py-2 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-200/20"
            >
              Download CSV
            </Link>
            <Link
              href="/now/rankings"
              className="rounded-full border border-white/14 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/78 transition hover:bg-white/[0.09]"
            >
              Open live ranking view
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Cities tested", index.eligibility.cityCount],
            ["Nightlife places", index.eligibility.eligibleNightlifePlaces.toLocaleString("en")],
            ["2026 events", index.eligibility.eligibleEvents.toLocaleString("en")],
            ["Community reviews", index.eligibility.eligibleCommunityReviews.toLocaleString("en")],
          ].map(([label, value]) => (
            <article key={label} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4">
              <p className="text-[9px] uppercase tracking-[0.16em] text-white/42">{label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{value}</p>
            </article>
          ))}
        </div>
        <p className="mt-4 text-[11px] leading-5 text-white/42">
          Model {index.methodologyVersion} · Snapshot {index.snapshotAt} · Eligibility threshold: {index.eligibility.minimumNightlifePlaces}+ indexable nightlife places
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {FINDINGS.map((finding) => (
          <article key={finding.title} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-fuchsia-200/70">{finding.label}</p>
            <h3 className="mt-2 text-base font-semibold text-white">{finding.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/58">{finding.body}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025]">
        <div className="border-b border-white/10 px-5 py-5 sm:px-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-100/68">Full published table</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Top 25 queer nightlife ecosystems</h2>
          <p className="mt-2 text-xs leading-5 text-white/46">Scores are rounded to one decimal. Ties retain the underlying unrounded calculation order.</p>
        </div>

        <div className="divide-y divide-white/[0.07]">
          {index.entries.map((entry) => (
            <article key={entry.city} className="grid gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[52px_minmax(180px,1fr)_110px_1.65fr] lg:items-center">
              <div className="flex items-center justify-between lg:block">
                <p className="text-xl font-semibold tabular-nums text-white/82">#{entry.rank}</p>
                <p className="text-xl font-semibold tabular-nums text-cyan-100 lg:hidden">{entry.score}</p>
              </div>

              <div className="min-w-0">
                <Link href={`/${entry.city}`} className="text-base font-semibold text-white transition hover:text-cyan-100">
                  {cityLabel(entry.city)}
                </Link>
                <p className="mt-0.5 text-xs text-white/42">{entry.country}</p>
                <p className="mt-2 text-xs leading-5 text-white/56">{entry.signal}</p>
              </div>

              <div className="hidden lg:block">
                <p className="text-2xl font-semibold tabular-nums tracking-[-0.04em] text-cyan-100">{entry.score}</p>
                <p className="text-[9px] uppercase tracking-[0.14em] text-white/34">out of 100</p>
              </div>

              <div>
                <div className="grid grid-cols-3 gap-x-3 gap-y-3 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
                  {index.components.map((component) => (
                    <div key={component.key}>
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="truncate text-[9px] uppercase tracking-[0.08em] text-white/38">{component.label.split(" ")[0]}</span>
                        <span className="text-[10px] tabular-nums text-white/66">{entry.scores[component.key]}</span>
                      </div>
                      <div className="mt-1"><ScoreBar value={entry.scores[component.key]} maximum={component.weight} /></div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[10px] text-white/38">
                  {entry.places} nightlife places · {entry.events} events · {entry.reviews} reviews
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-violet-200/14 bg-[linear-gradient(145deg,rgba(124,58,237,0.09),rgba(5,5,8,0.96))] p-5 sm:p-7">
        <p className="text-[10px] uppercase tracking-[0.2em] text-violet-100/70">Methodology {index.methodologyVersion}</p>
        <h2 className="mt-2 text-xl font-semibold text-white">How the 100-point score is built</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {index.components.map((component) => (
            <article key={component.key} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-white">{component.label}</h3>
                <span className="rounded-full border border-violet-200/20 bg-violet-200/10 px-2 py-1 text-[10px] text-violet-100">{component.weight} pts</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-white/52">{component.definition}</p>
            </article>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-amber-200/15 bg-amber-200/[0.055] p-4 text-xs leading-6 text-amber-50/66">
          <strong className="text-amber-100">Read the ranking as evidence coverage, not an absolute truth about queer life.</strong> Database depth differs by city; event calendars remain incomplete; reviews are not representative surveys; and a high score does not equal personal safety. No legal-rights or crime score is included in this nightlife index.
        </div>
      </section>

      <section className="rounded-[24px] border border-fuchsia-200/14 bg-fuchsia-200/[0.045] p-5 sm:p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-fuchsia-100/68">Citation + press use</p>
        <p className="mt-3 text-sm leading-7 text-white/66">
          Suggested citation: <strong className="text-white">Queer Atlas, Queer Nightlife Index 2026, methodology {index.methodologyVersion}, snapshot {index.snapshotAt}.</strong> Editors may reuse individual scores and charts with attribution and a link to this report. The CSV contains every published score and evidence count.
        </p>
      </section>
    </div>
  );
}
