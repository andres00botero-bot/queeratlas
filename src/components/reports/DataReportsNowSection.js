"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, Check, ChevronDown, Download, Link2, Search, Table2, X } from "lucide-react";
import { GLOBAL_QUEER_SAFETY_CULTURE_INDEX_2026, GLOBAL_QUEER_SAFETY_CULTURE_INDEX_META_2026 } from "@/lib/seo/globalQueerSafetyCultureIndex2026";

const INDEX_ROUTE = "/reports/global-queer-safety-culture-index-methodology";
const PAGE_SIZE = 30;
const SORT_OPTIONS = [
  { value: "overall", label: "Overall score" },
  { value: "legal", label: "Legal context" },
  { value: "lived", label: "Lived acceptance" },
  { value: "coverage", label: "Evidence coverage" },
  { value: "name", label: "City name" },
];
const COVERAGE_OPTIONS = [
  { value: "all", label: "All evidence levels" },
  { value: "complete", label: "100% coverage" },
  { value: "strong", label: "75%+ coverage" },
  { value: "ranked", label: "Ranked cities only" },
];
const ALL_COUNTRIES = [...new Set(GLOBAL_QUEER_SAFETY_CULTURE_INDEX_2026.map((entry) => entry.country))].sort((a, b) => a.localeCompare(b));

function numericValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatScore(value) {
  const number = numericValue(value);
  return number === null ? "—" : number.toFixed(1);
}

function formatSnapshotDate(value) {
  const [year, month, day] = String(value || "").slice(0, 10).split("-");
  if (!year || !month || !day) return "Unknown";
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(day)} ${monthNames[Number(month) - 1]} ${year}`;
}

function scoreFor(entry, metric) {
  if (metric === "legal") return numericValue(entry.evidence?.legalComposite);
  if (metric === "lived") return numericValue(entry.evidence?.livedComposite);
  return numericValue(entry.sourceRating);
}

function metricLabel(metric) {
  if (metric === "legal") return "Legal context";
  if (metric === "lived") return "Lived acceptance";
  return "Overall score";
}

function coverageTone(value) {
  if (value >= 100) return "border-emerald-200/25 bg-emerald-200/8 text-emerald-100";
  if (value >= 75) return "border-cyan-200/24 bg-cyan-200/8 text-cyan-100";
  return "border-amber-200/24 bg-amber-200/8 text-amber-100";
}

function SourceDetails({ entry, compact = false }) {
  const sources = entry.sourceReferences || [];
  return (
    <details className="group">
      <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-cyan-100/62 transition hover:text-cyan-50 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60">
        {sources.length} source inputs
        <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 transition group-open:rotate-180" />
      </summary>
      <div className={`${compact ? "mt-1" : "mt-2"} flex flex-wrap gap-1.5`}>
        {sources.map((source) => (
          <a key={source.id} href={source.url} target="_blank" rel="noreferrer" title={source.role} className="rounded-full border border-white/12 bg-white/[0.035] px-2.5 py-1.5 text-[10px] text-white/55 transition hover:border-cyan-100/30 hover:text-cyan-50">
            {source.label} · {source.value}
          </a>
        ))}
      </div>
    </details>
  );
}

function CompareButton({ entry, selected, onToggle }) {
  return (
    <button type="button" aria-pressed={selected} onClick={() => onToggle(entry.city)} className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60 ${selected ? "border-cyan-100/42 bg-cyan-100/14 text-cyan-50" : "border-white/12 bg-white/[0.025] text-white/48 hover:border-white/24 hover:text-white/78"}`}>
      <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${selected ? "border-cyan-100 bg-cyan-100 text-[#071017]" : "border-white/25"}`}>
        {selected ? <Check aria-hidden="true" className="h-3 w-3" /> : null}
      </span>
      Compare
    </button>
  );
}

export default function DataReportsNowSection({ initialQuery = {} }) {
  const initialCountry = ALL_COUNTRIES.includes(initialQuery.country) ? initialQuery.country : "all";
  const initialMetric = ["overall", "legal", "lived"].includes(initialQuery.metric) ? initialQuery.metric : "overall";
  const initialSort = SORT_OPTIONS.some((option) => option.value === initialQuery.sort) ? initialQuery.sort : "overall";
  const initialCoverage = COVERAGE_OPTIONS.some((option) => option.value === initialQuery.coverage) ? initialQuery.coverage : "all";
  const initialView = ["table", "bars"].includes(initialQuery.view) ? initialQuery.view : "table";
  const [search, setSearch] = useState(String(initialQuery.q || "").slice(0, 120));
  const [country, setCountry] = useState(initialCountry);
  const [metric, setMetric] = useState(initialMetric);
  const [sort, setSort] = useState(initialSort);
  const [coverage, setCoverage] = useState(initialCoverage);
  const [view, setView] = useState(initialView);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [compareIds, setCompareIds] = useState([]);
  const [notice, setNotice] = useState("");

  const rankedEntries = useMemo(() => GLOBAL_QUEER_SAFETY_CULTURE_INDEX_2026.filter((entry) => entry.rankEligible), []);
  const insights = useMemo(() => {
    const highestLegal = [...rankedEntries].sort((a, b) => (b.evidence?.legalComposite || 0) - (a.evidence?.legalComposite || 0))[0];
    const highestLived = [...rankedEntries].sort((a, b) => (b.evidence?.livedComposite || 0) - (a.evidence?.livedComposite || 0))[0];
    const widestGap = [...rankedEntries].sort((a, b) => Math.abs((b.evidence?.legalComposite || 0) - (b.evidence?.livedComposite || 0)) - Math.abs((a.evidence?.legalComposite || 0) - (a.evidence?.livedComposite || 0)))[0];
    return [
      { label: "Highest legal context", city: highestLegal.cityName, slug: highestLegal.city, value: formatScore(highestLegal.evidence?.legalComposite), tone: "text-rose-100" },
      { label: "Highest lived acceptance", city: highestLived.cityName, slug: highestLived.city, value: formatScore(highestLived.evidence?.livedComposite), tone: "text-cyan-100" },
      { label: "Widest legal–lived gap", city: widestGap.cityName, slug: widestGap.city, value: formatScore(Math.abs(widestGap.evidence.legalComposite - widestGap.evidence.livedComposite)), tone: "text-amber-100" },
    ];
  }, [rankedEntries]);

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const next = GLOBAL_QUEER_SAFETY_CULTURE_INDEX_2026.filter((entry) => {
      if (query && !`${entry.cityName} ${entry.country}`.toLocaleLowerCase().includes(query)) return false;
      if (country !== "all" && entry.country !== country) return false;
      const evidenceCoverage = Number(entry.evidenceCoverage || 0);
      if (coverage === "complete" && evidenceCoverage < 100) return false;
      if (coverage === "strong" && evidenceCoverage < 75) return false;
      if (coverage === "ranked" && !entry.rankEligible) return false;
      return true;
    });
    next.sort((a, b) => {
      if (sort === "name") return a.cityName.localeCompare(b.cityName);
      if (sort === "coverage") return Number(b.evidenceCoverage || 0) - Number(a.evidenceCoverage || 0) || a.cityName.localeCompare(b.cityName);
      const aValue = scoreFor(a, sort);
      const bValue = scoreFor(b, sort);
      if (aValue === null && bValue === null) return a.cityName.localeCompare(b.cityName);
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      return bValue - aValue || a.cityName.localeCompare(b.cityName);
    });
    return next;
  }, [country, coverage, search, sort]);

  const visibleEntries = filteredEntries.slice(0, visibleCount);
  const compareEntries = compareIds.map((id) => GLOBAL_QUEER_SAFETY_CULTURE_INDEX_2026.find((entry) => entry.city === id)).filter(Boolean);

  function toggleCompare(id) {
    setNotice("");
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) {
        setNotice("You can compare up to three destinations at a time.");
        return current;
      }
      return [...current, id];
    });
  }

  function clearFilters() {
    setSearch("");
    setCountry("all");
    setMetric("overall");
    setSort("overall");
    setCoverage("all");
    setVisibleCount(PAGE_SIZE);
    setNotice("");
  }

  function buildSharedUrl() {
    const url = new URL(window.location.href);
    url.search = "";
    if (search.trim()) url.searchParams.set("q", search.trim());
    if (country !== "all") url.searchParams.set("country", country);
    if (metric !== "overall") url.searchParams.set("metric", metric);
    if (coverage !== "all") url.searchParams.set("coverage", coverage);
    if (sort !== "overall") url.searchParams.set("sort", sort);
    if (view !== "table") url.searchParams.set("view", view);
    return url.toString();
  }

  async function shareView() {
    const url = buildSharedUrl();
    window.history.replaceState({}, "", url);
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Link to this data view copied.");
    } catch {
      setNotice("The filters are now saved in the page URL.");
    }
  }

  function downloadCsv() {
    const escapeCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const header = ["Rank", "City", "Country", "Overall score", "Legal context", "Lived acceptance", "Evidence coverage", "Rank eligible"];
    const rows = filteredEntries.map((entry) => [entry.rankEligible ? entry.rank : "NR", entry.cityName, entry.country, entry.sourceRating ?? "", entry.evidence?.legalComposite ?? "", entry.evidence?.livedComposite ?? "", entry.evidenceCoverage ?? "", entry.rankEligible ? "Yes" : "No"]);
    const csv = [header, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "queer-atlas-safety-inclusion-2026.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const hasFilters = Boolean(search.trim()) || country !== "all" || coverage !== "all" || sort !== "overall" || metric !== "overall";

  return (
    <section id="data-reports" aria-labelledby="atlas-data-heading" className="space-y-8">
      <header className="relative overflow-hidden border-b border-white/12 px-1 pb-7 pt-4 sm:pb-9 sm:pt-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-fuchsia-300/8 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-4xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-100/68">Queer Atlas · Evidence desk</p>
            <h1 id="atlas-data-heading" className="qa-display mt-3 text-[clamp(2.65rem,5.5vw,5.6rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-[#f7f4ee]">Atlas Data<span className="text-cyan-100">.</span></h1>
            <p className="mt-4 max-w-[65ch] text-sm leading-6 text-white/60 sm:text-base sm:leading-7">Compare the published legal and lived-acceptance context behind Queer Atlas destinations — with every scored input visible.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/42 lg:max-w-sm lg:justify-end lg:text-right">
            <span>{GLOBAL_QUEER_SAFETY_CULTURE_INDEX_META_2026.atlasCities} destinations</span>
            <span>{GLOBAL_QUEER_SAFETY_CULTURE_INDEX_META_2026.countriesAndTerritories} countries &amp; territories</span>
            <span>Snapshot {formatSnapshotDate(GLOBAL_QUEER_SAFETY_CULTURE_INDEX_META_2026.publishedAt)}</span>
          </div>
        </div>
      </header>

      <section aria-label="Key findings" className="grid border-y border-white/10 sm:grid-cols-3">
        {insights.map((insight, index) => (
          <div key={insight.label} className={`px-1 py-5 sm:px-5 ${index > 0 ? "border-t border-white/10 sm:border-l sm:border-t-0" : ""}`}>
            <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-white/38">{insight.label}</p>
            <div className="mt-2 flex items-end justify-between gap-4"><Link href={`/${insight.slug}`} className="text-base font-semibold text-white/82 transition hover:text-white">{insight.city}</Link><span className={`text-2xl font-semibold tracking-[-0.05em] ${insight.tone}`}>{insight.value}</span></div>
          </div>
        ))}
      </section>

      <section aria-labelledby="explorer-heading">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.19em] text-cyan-100/65">2026 index explorer</p><h2 id="explorer-heading" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">Explore the evidence</h2></div>
          <div className="flex items-center gap-2 self-start lg:self-auto" role="group" aria-label="Choose data view">
            {[{ id: "table", label: "Table", icon: Table2 }, { id: "bars", label: "Bars", icon: BarChart3 }].map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return <button key={item.id} type="button" aria-pressed={active} onClick={() => { setView(item.id); setVisibleCount(PAGE_SIZE); }} className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60 ${active ? "border-cyan-100/38 bg-cyan-100/12 text-cyan-50" : "border-white/12 bg-white/[0.025] text-white/50 hover:border-white/24 hover:text-white/80"}`}><Icon aria-hidden="true" className="h-4 w-4" />{item.label}</button>;
            })}
          </div>
        </div>

        <div className="grid gap-3 border-b border-white/10 py-5 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.35fr)_repeat(4,minmax(150px,0.7fr))]">
          <label className="relative block md:col-span-2 xl:col-span-1"><span className="sr-only">Search city or country</span><Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(PAGE_SIZE); }} placeholder="Search city or country" className="min-h-12 w-full rounded-2xl border border-white/13 bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-100/42 focus:bg-white/[0.055]" /></label>
          <label><span className="sr-only">Country</span><select value={country} onChange={(event) => { setCountry(event.target.value); setVisibleCount(PAGE_SIZE); }} className="min-h-12 w-full rounded-2xl border border-white/13 bg-[#0b0d14] px-3 text-xs font-semibold text-white/72 outline-none focus:border-cyan-100/42"><option value="all">All countries</option>{ALL_COUNTRIES.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
          <label><span className="sr-only">Score dimension</span><select value={metric} onChange={(event) => { setMetric(event.target.value); setVisibleCount(PAGE_SIZE); }} className="min-h-12 w-full rounded-2xl border border-white/13 bg-[#0b0d14] px-3 text-xs font-semibold text-white/72 outline-none focus:border-cyan-100/42"><option value="overall">Overall score</option><option value="legal">Legal context</option><option value="lived">Lived acceptance</option></select></label>
          <label><span className="sr-only">Evidence coverage</span><select value={coverage} onChange={(event) => { setCoverage(event.target.value); setVisibleCount(PAGE_SIZE); }} className="min-h-12 w-full rounded-2xl border border-white/13 bg-[#0b0d14] px-3 text-xs font-semibold text-white/72 outline-none focus:border-cyan-100/42">{COVERAGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label><span className="sr-only">Sort destinations</span><select value={sort} onChange={(event) => { setSort(event.target.value); setVisibleCount(PAGE_SIZE); }} className="min-h-12 w-full rounded-2xl border border-white/13 bg-[#0b0d14] px-3 text-xs font-semibold text-white/72 outline-none focus:border-cyan-100/42">{SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>Sort: {option.label}</option>)}</select></label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="text-xs text-white/45"><span className="font-semibold text-white/78">{filteredEntries.length}</span> destinations · showing {metricLabel(metric).toLocaleLowerCase()}</p>
          <div className="flex flex-wrap gap-2">
            {hasFilters ? <button type="button" onClick={clearFilters} className="inline-flex min-h-10 items-center gap-1.5 px-2 text-xs font-semibold text-white/46 transition hover:text-white"><X aria-hidden="true" className="h-3.5 w-3.5" />Clear</button> : null}
            <button type="button" onClick={shareView} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/12 px-3 py-2 text-xs font-semibold text-white/58 transition hover:border-white/24 hover:text-white"><Link2 aria-hidden="true" className="h-3.5 w-3.5" />Share view</button>
            <button type="button" onClick={downloadCsv} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-cyan-100/24 bg-cyan-100/8 px-3 py-2 text-xs font-semibold text-cyan-50/82 transition hover:border-cyan-100/42 hover:bg-cyan-100/12"><Download aria-hidden="true" className="h-3.5 w-3.5" />Download CSV</button>
          </div>
        </div>
        {notice ? <p role="status" className="mb-4 text-xs text-cyan-100/78">{notice}</p> : null}

        {compareEntries.length ? (
          <section aria-labelledby="comparison-heading" className="mb-6 border-y border-cyan-100/18 bg-cyan-100/[0.035] py-4">
            <div className="mb-3 flex items-center justify-between gap-4 px-3 sm:px-4"><h3 id="comparison-heading" className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-50/78">Compare destinations</h3><button type="button" onClick={() => setCompareIds([])} className="min-h-9 text-xs font-semibold text-white/45 transition hover:text-white">Clear comparison</button></div>
            <div className="grid gap-px bg-white/10 sm:grid-cols-3">
              {compareEntries.map((entry) => <article key={entry.city} className="bg-[#080b12] px-4 py-4"><div className="flex items-start justify-between gap-3"><div><Link href={`/${entry.city}`} className="font-semibold text-white transition hover:text-cyan-100">{entry.cityName}</Link><p className="mt-0.5 text-[11px] text-white/38">{entry.country}</p></div><button type="button" aria-label={`Remove ${entry.cityName} from comparison`} onClick={() => toggleCompare(entry.city)} className="flex h-9 w-9 items-center justify-center rounded-full text-white/38 transition hover:bg-white/8 hover:text-white"><X aria-hidden="true" className="h-4 w-4" /></button></div><div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/8 pt-3 text-center"><div><p className="text-[9px] uppercase tracking-[0.12em] text-white/32">Overall</p><p className="mt-1 text-lg font-semibold text-white">{formatScore(entry.sourceRating)}</p></div><div><p className="text-[9px] uppercase tracking-[0.12em] text-white/32">Legal</p><p className="mt-1 text-lg font-semibold text-rose-100">{formatScore(entry.evidence?.legalComposite)}</p></div><div><p className="text-[9px] uppercase tracking-[0.12em] text-white/32">Lived</p><p className="mt-1 text-lg font-semibold text-cyan-100">{formatScore(entry.evidence?.livedComposite)}</p></div></div></article>)}
            </div>
          </section>
        ) : null}

        {filteredEntries.length === 0 ? <div className="border-y border-white/10 py-14 text-center"><p className="text-lg font-semibold text-white/82">No destinations match these filters.</p><button type="button" onClick={clearFilters} className="mt-4 min-h-11 rounded-full border border-cyan-100/28 bg-cyan-100/8 px-4 py-2 text-xs font-semibold text-cyan-50">Clear filters</button></div> : view === "bars" ? (
          <div className="border-t border-white/10">
            {visibleEntries.map((entry) => { const value = scoreFor(entry, metric); const selected = compareIds.includes(entry.city); return <article key={entry.city} className="grid gap-3 border-b border-white/[0.075] py-4 md:grid-cols-[52px_minmax(150px,0.55fr)_minmax(260px,1fr)_110px] md:items-center"><span className="text-xs font-semibold text-white/35">{entry.rankEligible ? `#${entry.rank}` : "NR"}</span><div><Link href={`/${entry.city}`} className="font-semibold text-white/88 transition hover:text-cyan-100">{entry.cityName}</Link><p className="mt-0.5 text-[11px] text-white/38">{entry.country}</p></div><div className="flex items-center gap-3"><div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300/65 via-sky-200/80 to-fuchsia-200/75" style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }} /></div><span className="w-10 text-right text-sm font-semibold text-white">{formatScore(value)}</span></div><div className="md:justify-self-end"><CompareButton entry={entry} selected={selected} onToggle={toggleCompare} /></div></article>; })}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto border-t border-white/10 md:block">
              <table className="w-full min-w-[920px] border-collapse text-left">
                <caption className="sr-only">Queer Atlas Safety and Inclusion Context 2026, filtered and sorted by the selected controls</caption>
                <thead><tr className="border-b border-white/10 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35"><th scope="col" className="w-16 px-3 py-3">Rank</th><th scope="col" className="px-3 py-3">Destination</th><th scope="col" className="px-3 py-3 text-right">Overall</th><th scope="col" className="px-3 py-3 text-right">Legal</th><th scope="col" className="px-3 py-3 text-right">Lived</th><th scope="col" className="px-3 py-3">Coverage</th><th scope="col" className="px-3 py-3 text-right">Compare</th></tr></thead>
                <tbody>{visibleEntries.map((entry) => { const selected = compareIds.includes(entry.city); return <tr key={entry.city} className="border-b border-white/[0.075] align-top transition hover:bg-white/[0.025]"><td className="px-3 py-4 text-sm font-semibold text-white/38">{entry.rankEligible ? `#${entry.rank}` : "NR"}</td><th scope="row" className="px-3 py-4 font-normal"><Link href={`/${entry.city}`} className="font-semibold text-white/88 transition hover:text-cyan-100">{entry.cityName}</Link><p className="mt-0.5 text-[11px] text-white/38">{entry.country} · national context</p><div className="mt-1"><SourceDetails entry={entry} compact /></div></th><td className="px-3 py-4 text-right text-base font-semibold text-white">{formatScore(entry.sourceRating)}</td><td className="px-3 py-4 text-right text-base font-semibold text-rose-100">{formatScore(entry.evidence?.legalComposite)}</td><td className="px-3 py-4 text-right text-base font-semibold text-cyan-100">{formatScore(entry.evidence?.livedComposite)}</td><td className="px-3 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${coverageTone(entry.evidenceCoverage)}`}>{entry.evidenceCoverage}%</span></td><td className="px-3 py-4 text-right"><CompareButton entry={entry} selected={selected} onToggle={toggleCompare} /></td></tr>; })}</tbody>
              </table>
            </div>
            <div className="border-t border-white/10 md:hidden">
              {visibleEntries.map((entry) => { const selected = compareIds.includes(entry.city); return <article key={entry.city} className="border-b border-white/[0.075] py-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/32">{entry.rankEligible ? `Rank ${entry.rank}` : "Not ranked"}</p><Link href={`/${entry.city}`} className="mt-1 block text-lg font-semibold text-white/90">{entry.cityName}</Link><p className="mt-0.5 text-xs text-white/38">{entry.country} · national context</p></div><div className="text-right"><p className="text-3xl font-semibold tracking-[-0.055em] text-white">{formatScore(entry.sourceRating)}</p><p className="text-[9px] uppercase tracking-[0.12em] text-white/30">Overall</p></div></div><div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-center"><div className="bg-[#090c13] px-2 py-3"><p className="text-[9px] uppercase tracking-[0.11em] text-white/32">Legal</p><p className="mt-1 font-semibold text-rose-100">{formatScore(entry.evidence?.legalComposite)}</p></div><div className="bg-[#090c13] px-2 py-3"><p className="text-[9px] uppercase tracking-[0.11em] text-white/32">Lived</p><p className="mt-1 font-semibold text-cyan-100">{formatScore(entry.evidence?.livedComposite)}</p></div><div className="bg-[#090c13] px-2 py-3"><p className="text-[9px] uppercase tracking-[0.11em] text-white/32">Coverage</p><p className="mt-1 font-semibold text-emerald-100">{entry.evidenceCoverage}%</p></div></div><div className="mt-3 flex items-center justify-between gap-3"><SourceDetails entry={entry} compact /><CompareButton entry={entry} selected={selected} onToggle={toggleCompare} /></div></article>; })}
            </div>
          </>
        )}
        {visibleCount < filteredEntries.length ? <div className="flex justify-center border-b border-white/10 py-6"><button type="button" onClick={() => setVisibleCount((current) => current + PAGE_SIZE)} className="min-h-12 rounded-full border border-white/16 bg-white/[0.035] px-5 py-3 text-xs font-semibold text-white/68 transition hover:border-cyan-100/30 hover:text-white">Show {Math.min(PAGE_SIZE, filteredEntries.length - visibleCount)} more destinations</button></div> : null}
      </section>

      <footer className="grid gap-5 border-t border-white/10 pt-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="max-w-4xl"><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-amber-100/65">Read this index carefully</p><p className="mt-2 text-xs leading-5 text-white/45">{GLOBAL_QUEER_SAFETY_CULTURE_INDEX_META_2026.limitation}</p></div>
        <div className="flex flex-wrap gap-2"><Link href={INDEX_ROUTE} className="inline-flex min-h-11 items-center rounded-full border border-cyan-100/24 bg-cyan-100/8 px-4 py-2 text-xs font-semibold text-cyan-50 transition hover:border-cyan-100/40">Methodology &amp; sources</Link><Link href="/reports" className="inline-flex min-h-11 items-center rounded-full border border-white/12 px-4 py-2 text-xs font-semibold text-white/58 transition hover:border-white/24 hover:text-white">All reports</Link></div>
      </footer>
    </section>
  );
}
