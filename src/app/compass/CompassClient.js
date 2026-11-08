"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  Check,
  Compass,
  ExternalLink,
  Search,
} from "lucide-react";
import { COMPASS_CATEGORIES, COMPASS_TERMS } from "@/lib/compassTerms";

const TERM_TONES = {
  identity: {
    card: "border-violet-200/18 bg-[radial-gradient(circle_at_100%_0%,rgba(139,92,246,0.20),transparent_55%),linear-gradient(145deg,rgba(39,27,68,0.92),rgba(18,20,39,0.96))] hover:border-violet-200/48 hover:bg-[#302153]",
    active: "border-violet-200/60 bg-[radial-gradient(circle_at_92%_8%,rgba(196,181,253,0.27),transparent_45%),linear-gradient(145deg,rgba(91,61,161,0.82),rgba(37,28,69,0.98))] ring-1 ring-violet-200/30",
    marker: "bg-violet-200 shadow-[0_0_16px_rgba(196,181,253,0.72)]",
    label: "text-violet-100/82",
    detail: "border-violet-200/32 bg-[radial-gradient(circle_at_92%_2%,rgba(139,92,246,0.28),transparent_38%),linear-gradient(165deg,rgba(45,30,78,0.99),rgba(16,18,39,0.99))]",
    badge: "border-violet-200/40 bg-violet-200/[0.16] text-violet-50",
    check: "text-violet-200/88",
  },
  language: {
    card: "border-cyan-200/18 bg-[radial-gradient(circle_at_100%_0%,rgba(34,211,238,0.19),transparent_55%),linear-gradient(145deg,rgba(20,51,65,0.92),rgba(18,20,39,0.96))] hover:border-cyan-200/48 hover:bg-[#153d4c]",
    active: "border-cyan-200/60 bg-[radial-gradient(circle_at_92%_8%,rgba(103,232,249,0.24),transparent_45%),linear-gradient(145deg,rgba(23,111,125,0.80),rgba(18,53,66,0.98))] ring-1 ring-cyan-200/30",
    marker: "bg-cyan-200 shadow-[0_0_16px_rgba(103,232,249,0.72)]",
    label: "text-cyan-100/82",
    detail: "border-cyan-200/32 bg-[radial-gradient(circle_at_92%_2%,rgba(34,211,238,0.24),transparent_38%),linear-gradient(165deg,rgba(18,59,70,0.99),rgba(16,18,39,0.99))]",
    badge: "border-cyan-200/40 bg-cyan-200/[0.16] text-cyan-50",
    check: "text-cyan-200/88",
  },
  community: {
    card: "border-rose-200/18 bg-[radial-gradient(circle_at_100%_0%,rgba(244,114,182,0.20),transparent_55%),linear-gradient(145deg,rgba(65,25,57,0.92),rgba(22,19,37,0.96))] hover:border-rose-200/48 hover:bg-[#4c1f41]",
    active: "border-rose-200/60 bg-[radial-gradient(circle_at_92%_8%,rgba(251,207,232,0.22),transparent_45%),linear-gradient(145deg,rgba(133,47,97,0.82),rgba(66,26,57,0.98))] ring-1 ring-rose-200/30",
    marker: "bg-rose-200 shadow-[0_0_16px_rgba(251,113,133,0.68)]",
    label: "text-rose-100/82",
    detail: "border-rose-200/32 bg-[radial-gradient(circle_at_92%_2%,rgba(244,114,182,0.24),transparent_38%),linear-gradient(165deg,rgba(73,27,62,0.99),rgba(16,18,39,0.99))]",
    badge: "border-rose-200/40 bg-rose-200/[0.16] text-rose-50",
    check: "text-rose-200/88",
  },
  allyship: {
    card: "border-emerald-200/18 bg-[radial-gradient(circle_at_100%_0%,rgba(52,211,153,0.18),transparent_55%),linear-gradient(145deg,rgba(20,57,50,0.92),rgba(18,20,39,0.96))] hover:border-emerald-200/48 hover:bg-[#17443a]",
    active: "border-emerald-200/58 bg-[radial-gradient(circle_at_92%_8%,rgba(110,231,183,0.22),transparent_45%),linear-gradient(145deg,rgba(25,112,86,0.80),rgba(18,58,49,0.98))] ring-1 ring-emerald-200/30",
    marker: "bg-emerald-200 shadow-[0_0_16px_rgba(110,231,183,0.68)]",
    label: "text-emerald-100/82",
    detail: "border-emerald-200/32 bg-[radial-gradient(circle_at_92%_2%,rgba(52,211,153,0.23),transparent_38%),linear-gradient(165deg,rgba(18,63,52,0.99),rgba(16,18,39,0.99))]",
    badge: "border-emerald-200/40 bg-emerald-200/[0.16] text-emerald-50",
    check: "text-emerald-200/88",
  },
};

const CATEGORY_BUTTON_STYLES = {
  all: "border-white/46 bg-white/[0.14] text-white shadow-[0_6px_18px_rgba(0,0,0,0.16)]",
  identity: "border-violet-200/60 bg-violet-300/[0.20] text-violet-50 shadow-[0_6px_18px_rgba(124,92,246,0.18)]",
  language: "border-cyan-200/60 bg-cyan-300/[0.18] text-cyan-50 shadow-[0_6px_18px_rgba(34,211,238,0.16)]",
  community: "border-rose-200/60 bg-rose-300/[0.18] text-rose-50 shadow-[0_6px_18px_rgba(244,114,182,0.16)]",
  allyship: "border-emerald-200/60 bg-emerald-300/[0.18] text-emerald-50 shadow-[0_6px_18px_rgba(52,211,153,0.16)]",
};

const MOBILE_STARTER_SLUGS = ["queer", "pronouns", "non-binary", "transgender", "lgbtqia", "coming-out"];

function normalizeSearch(value) {
  return String(value || "")
    .toLocaleLowerCase("en")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function findBestSearchMatch(value) {
  const query = normalizeSearch(value);
  if (!query) return null;

  const exactName = COMPASS_TERMS.find((term) => normalizeSearch(term.name) === query);
  if (exactName) return exactName;

  const exactAlias = COMPASS_TERMS.find((term) =>
    term.aliases.some((alias) => normalizeSearch(alias) === query),
  );
  if (exactAlias) return exactAlias;

  const nameOrAliasStart = COMPASS_TERMS.find((term) =>
    [term.name, ...term.aliases].some((label) => normalizeSearch(label).startsWith(query)),
  );
  if (nameOrAliasStart) return nameOrAliasStart;

  return COMPASS_TERMS.find((term) => {
    const haystack = normalizeSearch([
      term.name,
      term.aliases.join(" "),
      term.type,
      term.summary,
      term.nuance,
    ].join(" "));
    return haystack.includes(query);
  }) || null;
}

function findRelatedTerm(label) {
  const normalizedLabel = normalizeSearch(label);
  return COMPASS_TERMS.find((term) =>
    [term.name, ...term.aliases].some((value) => normalizeSearch(value) === normalizedLabel),
  ) || null;
}

function CompassTermDetail({ term, detailRef, onSelectRelated }) {
  const tone = TERM_TONES[term.category] || TERM_TONES.identity;

  return (
    <article
      ref={detailRef}
      id={`term-${term.slug}`}
      tabIndex={-1}
      className={`scroll-mt-24 overflow-hidden rounded-[28px] border shadow-[0_28px_72px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.06)] outline-none ${tone.detail}`}
    >
      <div className="border-b border-white/10 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${tone.badge}`}>
            {term.type}
          </span>
          <span className="text-[10px] uppercase tracking-[0.13em] text-white/38">Reviewed · {term.reviewedOn || "Sep 2026"}</span>
        </div>
        <h2 className="qa-display mt-5 text-4xl font-semibold tracking-[-0.045em] text-[#fff8fc] sm:text-5xl">
          {term.name}
        </h2>
        <p className="mt-2 text-xs leading-5 text-white/42">Also found as: {term.aliases.join(" · ")}</p>
        <p className="mt-5 text-[16px] leading-7 text-[#fff7ed]/90 sm:text-[17px]">{term.summary}</p>
      </div>

      <div className="space-y-6 p-5 sm:p-7">
        <section aria-labelledby={`nuance-${term.slug}`} className="rounded-2xl border-l-[3px] border-amber-200/65 bg-amber-200/[0.055] px-4 py-4">
          <h3 id={`nuance-${term.slug}`} className="text-[10px] font-semibold uppercase tracking-[0.17em] text-amber-100/78">
            Context matters
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/65">{term.nuance}</p>
        </section>

        <section aria-labelledby={`respect-${term.slug}`}>
          <h3 id={`respect-${term.slug}`} className="text-sm font-semibold text-white/88">Show respect in practice</h3>
          <ul className="mt-3 space-y-2.5">
            {term.actions.map((action) => (
              <li key={action} className="flex gap-2.5 text-sm leading-6 text-white/62">
                <Check size={15} className={`mt-1 shrink-0 ${tone.check}`} strokeWidth={2.2} aria-hidden="true" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </section>

        {term.pronounGuide ? (
          <section aria-labelledby={`pronoun-guide-${term.slug}`} className="rounded-[22px] border border-cyan-100/14 bg-cyan-100/[0.035] p-4 sm:p-5">
            <h3 id={`pronoun-guide-${term.slug}`} className="text-base font-semibold text-cyan-50">Common English pronoun patterns</h3>
            <p className="mt-2 text-xs leading-5 text-white/52">{term.pronounGuide.intro}</p>
            <div className="mt-4 grid gap-2.5">
              {term.pronounGuide.sets.map((item) => (
                <article key={item.label} className="rounded-2xl border border-white/9 bg-black/15 p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="text-sm font-semibold text-cyan-50/90">{item.label}</h4>
                    <span className="text-[10px] text-white/38">{item.forms}</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-white/56">{item.example}</p>
                </article>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-white/9 pt-4">
              {term.pronounGuide.notes.map((note) => (
                <p key={note} className="text-xs leading-5 text-white/54">{note}</p>
              ))}
            </div>
          </section>
        ) : null}

        <section aria-labelledby={`related-${term.slug}`}>
          <h3 id={`related-${term.slug}`} className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">Related language</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {term.related.map((label) => {
              const relatedTerm = findRelatedTerm(label);
              return relatedTerm ? (
                <button
                  key={label}
                  type="button"
                  onClick={() => onSelectRelated(relatedTerm.slug)}
                  className="rounded-full border border-cyan-100/18 bg-cyan-100/[0.045] px-3 py-1.5 text-[11px] text-cyan-50/75 transition hover:border-cyan-100/35 hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
                >
                  {label}
                </button>
              ) : <span key={label} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] text-white/58">{label}</span>;
            })}
          </div>
        </section>

        <section aria-labelledby={`sources-${term.slug}`} className="border-t border-white/10 pt-5">
          <h3 id={`sources-${term.slug}`} className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">Sources & review</h3>
          <div className="mt-3 space-y-2">
            {term.sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2 text-xs leading-5 text-cyan-100/68 underline decoration-cyan-100/25 underline-offset-4 transition hover:text-cyan-50 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
              >
                <ExternalLink size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                {source.label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}

export default function CompassClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedSlug, setSelectedSlug] = useState("flinta");
  const [mobilePickerOpen, setMobilePickerOpen] = useState(false);
  const [mobileHasSelectedTerm, setMobileHasSelectedTerm] = useState(false);
  const detailRef = useRef(null);
  const mobileDetailRef = useRef(null);
  const mobileListRef = useRef(null);
  const [detailHeight, setDetailHeight] = useState(0);
  const libraryRef = useRef(null);
  const emptyRef = useRef(null);

  useEffect(() => {
    const detail = detailRef.current;
    if (!detail) return undefined;

    const updateHeight = () => setDetailHeight(Math.ceil(detail.getBoundingClientRect().height));
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(detail);
    return () => observer.disconnect();
  }, [selectedSlug]);

  function selectTerm(slug) {
    setSelectedSlug(slug);
    setMobileHasSelectedTerm(true);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      window.setTimeout(() => {
        mobileDetailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        mobileDetailRef.current?.focus({ preventScroll: true });
      }, 30);
    }
  }

  function selectRelatedTerm(slug) {
    setCategory("all");
    setQuery("");
    selectTerm(slug);
  }

  const filteredTerms = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    return COMPASS_TERMS.filter((term) => {
      if (category !== "all" && term.category !== category) return false;
      if (!normalizedQuery) return true;

      const haystack = normalizeSearch([
        term.name,
        term.aliases.join(" "),
        term.type,
        term.summary,
        term.nuance,
      ].join(" "));
      return haystack.includes(normalizedQuery);
    });
  }, [category, query]);

  const selectedTerm = filteredTerms.find((term) => term.slug === selectedSlug) || filteredTerms[0] || null;
  const starterTerms = MOBILE_STARTER_SLUGS.map((slug) => COMPASS_TERMS.find((term) => term.slug === slug)).filter(Boolean);
  const mobileTermGroups = useMemo(() => filteredTerms.reduce((groups, term) => {
    const letter = String(term.name || "#").charAt(0).toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(term);
    return groups;
  }, {}), [filteredTerms]);
  const mobileLetters = Object.keys(mobileTermGroups).sort();


  function updateSearch(value) {
    setQuery(value);
    setCategory("all");
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    if (!normalizeSearch(query)) {
      window.setTimeout(() => {
        libraryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        libraryRef.current?.focus?.({ preventScroll: true });
      }, 30);
      return;
    }

    const match = findBestSearchMatch(query);
    setCategory("all");

    if (match) {
      setSelectedSlug(match.slug);
      setMobileHasSelectedTerm(true);
      window.setTimeout(() => {
        const target = window.matchMedia("(max-width: 1023px)").matches ? mobileDetailRef.current : detailRef.current;
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
        target?.focus({ preventScroll: true });
      }, 30);
      return;
    }

    window.setTimeout(() => {
      emptyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      emptyRef.current?.focus({ preventScroll: true });
    }, 30);
  }

  function updateCategory(nextCategory) {
    setCategory(nextCategory);
    setQuery("");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0b1022] pb-28 text-white sm:pb-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[46rem] bg-[radial-gradient(circle_at_12%_3%,rgba(124,92,246,0.28),transparent_31%),radial-gradient(circle_at_88%_4%,rgba(34,211,238,0.20),transparent_30%),radial-gradient(circle_at_52%_22%,rgba(244,114,182,0.12),transparent_29%),linear-gradient(180deg,rgba(29,20,64,0.62),transparent_68%)]" />

      <div className="qa-shell relative">
        <header className="pt-5 sm:pt-10">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/34">
            <Link href="/" className="transition hover:text-white/68">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-white/58">Queer Dictionary</span>
          </nav>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/66">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-100/16 bg-cyan-100/[0.06] text-cyan-100/75">
              <Compass size={16} strokeWidth={1.8} aria-hidden="true" />
            </span>
            Queer Dictionary · Learn without judgement
          </div>
          <h1 className="qa-display mt-6 max-w-4xl text-[2.75rem] font-semibold leading-[0.94] tracking-[-0.055em] text-[#fff9f0] sm:text-6xl lg:text-7xl">
            Queer Dictionary
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
            Clear, caring explanations of identities, language and community context — with sources, nuance and practical ways to show respect.
          </p>
          <div className="mt-5 flex items-center gap-2" aria-hidden="true">
            <span className="h-1.5 w-8 rounded-full bg-violet-300/75" />
            <span className="h-1.5 w-5 rounded-full bg-cyan-300/75" />
            <span className="h-1.5 w-3 rounded-full bg-rose-300/75" />
            <span className="h-1.5 w-2 rounded-full bg-amber-300/75" />
          </div>

          <form
            role="search"
            onSubmit={handleSearchSubmit}
            className="mt-7 flex min-h-14 max-w-3xl items-center gap-1.5 rounded-[20px] border border-cyan-100/18 bg-[linear-gradient(145deg,rgba(27,31,48,0.96),rgba(18,19,32,0.98))] p-1.5 pl-4 shadow-[0_18px_54px_rgba(0,0,0,0.28),0_0_42px_rgba(45,212,191,0.035)] focus-within:border-cyan-100/42 focus-within:ring-2 focus-within:ring-cyan-300/20"
          >
            <label className="flex min-w-0 flex-1 items-center gap-3">
              <Search size={18} className="shrink-0 text-cyan-100/68" aria-hidden="true" />
              <span className="sr-only">Search the Queer Dictionary</span>
              <input
                type="search"
                value={query}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Try “FLINTA”, “pronouns” or “non-binary”"
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/32 sm:text-[15px]"
              />
            </label>
            {query ? (
              <button type="button" onClick={() => setQuery("")} className="rounded-full px-2 py-2 text-[9px] uppercase tracking-[0.1em] text-white/42 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45 sm:text-[10px]">
                Clear
              </button>
            ) : null}
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-[14px] bg-cyan-100 px-3.5 py-3 text-xs font-semibold text-[#071115] shadow-[0_8px_24px_rgba(103,232,249,0.16)] transition hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70 sm:px-4"
            >
              Search <ArrowUpRight size={13} aria-hidden="true" />
            </button>
          </form>
          <p className="mt-2 max-w-3xl text-right text-[10px] text-white/28">Your search stays in this browser and is not sent to analytics.</p>
        </header>

        <section ref={libraryRef} className="mt-12 scroll-mt-24" aria-labelledby="compass-library-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/55">The living library</p>
              <h2 id="compass-library-heading" className="qa-display mt-2 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">Explore words & context</h2>
            </div>
            <p role="status" aria-live="polite" className="text-xs text-white/38">{filteredTerms.length} {filteredTerms.length === 1 ? "entry" : "entries"}</p>
          </div>

          <div className="mt-5 hidden flex-wrap gap-2 lg:flex" aria-label="Filter Queer Dictionary by theme">
            {COMPASS_CATEGORIES.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={category === item.key}
                onClick={() => updateCategory(item.key)}
                className={`rounded-full border px-3.5 py-2 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45 ${category === item.key ? CATEGORY_BUTTON_STYLES[item.key] : "border-white/[0.18] bg-[#151b33]/75 text-white/68 shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:border-white/38 hover:bg-[#1d2545] hover:text-white"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-6 lg:hidden">
            {!mobileHasSelectedTerm ? (
              <div className="rounded-[24px] border border-white/12 bg-[linear-gradient(145deg,rgba(29,32,61,0.94),rgba(17,19,38,0.98))] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-cyan-100/70">Start exploring</p>
                <h3 className="qa-display mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#fff9f0]">What would you like to explore?</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">Choose a theme, start with a familiar word, or browse the full dictionary from A to Z.</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {COMPASS_CATEGORIES.filter((item) => item.key !== "all").map((item) => (
                    <button key={item.key} type="button" onClick={() => { updateCategory(item.key); setMobilePickerOpen(true); }} className={`rounded-2xl border px-3 py-3 text-left text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45 ${CATEGORY_BUTTON_STYLES[item.key]}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/48">Start with these terms</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {starterTerms.map((term) => (
                      <button key={term.slug} type="button" onClick={() => selectTerm(term.slug)} className="rounded-xl border border-white/14 bg-white/[0.04] px-3 py-2.5 text-left text-xs font-medium text-white/82 transition hover:border-cyan-100/38 hover:bg-cyan-100/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45">{term.name}</button>
                    ))}
                  </div>
                </div>
                <button type="button" aria-expanded={mobilePickerOpen} aria-controls="dictionary-mobile-picker" onClick={() => { setCategory("all"); setQuery(""); setMobilePickerOpen(true); }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-100/34 bg-cyan-100/[0.12] px-4 py-3 text-xs font-semibold text-cyan-50 transition hover:border-cyan-100/56 hover:bg-cyan-100/[0.18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45">Browse all terms A–Z <ArrowUpRight size={14} aria-hidden="true" /></button>
              </div>
            ) : (
              <>
                <button type="button" onClick={() => { setMobileHasSelectedTerm(false); setCategory("all"); setQuery(""); }} className="inline-flex items-center gap-2 text-sm font-medium text-cyan-100/86 underline decoration-cyan-100/35 underline-offset-4 transition hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45">← Explore another term</button>
                {selectedTerm ? <div className="mt-4"><CompassTermDetail term={selectedTerm} detailRef={mobileDetailRef} onSelectRelated={selectRelatedTerm} /></div> : null}
                <button type="button" onClick={() => { setCategory("all"); setQuery(""); setMobilePickerOpen(true); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-100/28 bg-cyan-100/[0.08] px-4 py-3 text-xs font-semibold text-cyan-50 transition hover:border-cyan-100/50 hover:bg-cyan-100/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45">Browse all terms A–Z <ArrowUpRight size={14} aria-hidden="true" /></button>
              </>
            )}
          </div>

          <div
            className="mt-6 hidden gap-6 lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(22rem,0.78fr)] lg:items-start"
            style={{ "--dictionary-detail-height": detailHeight ? `${detailHeight}px` : "calc(100dvh - 3rem)" }}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:max-h-[var(--dictionary-detail-height)] lg:overflow-y-auto lg:overscroll-contain lg:pr-3" aria-label="Dictionary entries">
              {filteredTerms.map((term) => {
                const active = selectedTerm.slug === term.slug;
                const tone = TERM_TONES[term.category] || TERM_TONES.identity;
                return (
                  <button
                    key={term.slug}
                    type="button"
                    onClick={() => selectTerm(term.slug)}
                    aria-pressed={active}
                    className={`group relative min-h-[9.5rem] overflow-hidden rounded-[21px] border p-4 text-left shadow-[0_14px_38px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45 ${active ? tone.active : tone.card}`}
                  >
                    <span className={`flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.14em] ${tone.label}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${tone.marker}`} aria-hidden="true" />
                      {term.type}
                    </span>
                    <span className="mt-3 flex items-start justify-between gap-3">
                      <span className="text-lg font-semibold tracking-[-0.025em] text-white/90">{term.name}</span>
                      <ArrowUpRight size={15} className="mt-1 shrink-0 text-white/28 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-100/75" aria-hidden="true" />
                    </span>
                    <span className="mt-2 line-clamp-3 block text-xs leading-5 text-white/48">{term.summary}</span>
                  </button>
                );
              })}

              {filteredTerms.length === 0 ? (
                <div ref={emptyRef} tabIndex={-1} className="sm:col-span-2 scroll-mt-24 rounded-[22px] border border-dashed border-white/14 bg-white/[0.02] p-7 text-center outline-none">
                  <BookOpenText size={22} className="mx-auto text-white/34" aria-hidden="true" />
                  <h3 className="mt-3 text-base font-semibold text-white/80">No matching entry yet</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/44">Try another spelling or clear your search. The dictionary will grow through careful review, not automatic bulk publishing.</p>
                  <button type="button" onClick={() => { setQuery(""); setCategory("all"); }} className="mt-4 rounded-full border border-white/14 px-4 py-2 text-xs text-white/62 transition hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45">Clear search</button>
                </div>
              ) : null}
            </div>

            <div className="lg:sticky lg:top-6">
              {selectedTerm ? <CompassTermDetail term={selectedTerm} detailRef={detailRef} onSelectRelated={selectRelatedTerm} /> : null}
            </div>
          </div>

          {mobilePickerOpen ? (
            <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-labelledby="dictionary-mobile-picker-title">
              <button type="button" aria-label="Close term picker" onClick={() => setMobilePickerOpen(false)} className="absolute inset-0 bg-[#050710]/78 backdrop-blur-sm" />
              <section id="dictionary-mobile-picker" className="absolute inset-x-0 bottom-0 max-h-[78dvh] overflow-hidden rounded-t-[28px] border-t border-cyan-100/24 bg-[#10172c] shadow-[0_-20px_70px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-100/66">Queer Dictionary</p>
                    <h3 id="dictionary-mobile-picker-title" className="mt-1 text-lg font-semibold text-[#fff9f0]">All terms A–Z</h3>
                  </div>
                  <button type="button" onClick={() => setMobilePickerOpen(false)} className="rounded-full border border-white/16 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70 transition hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45">Close</button>
                </div>
                <div className="border-b border-white/10 px-4 py-3">
                  <label className="flex items-center gap-2 rounded-xl border border-cyan-100/20 bg-black/20 px-3 py-2.5">
                    <Search size={15} className="shrink-0 text-cyan-100/72" aria-hidden="true" />
                    <span className="sr-only">Search dictionary terms</span>
                    <input type="search" value={query} onChange={(event) => updateSearch(event.target.value)} placeholder="Search terms" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35" />
                  </label>
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Filter terms by theme">
                    {COMPASS_CATEGORIES.map((item) => (
                      <button key={item.key} type="button" aria-pressed={category === item.key} onClick={() => updateCategory(item.key)} className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-medium transition ${category === item.key ? CATEGORY_BUTTON_STYLES[item.key] : "border-white/18 bg-white/[0.035] text-white/68"}`}>{item.label}</button>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1" aria-label="Jump to letter">
                    {mobileLetters.map((letter) => (
                      <button key={letter} type="button" onClick={() => mobileListRef.current?.querySelector(`[data-letter="${letter}"]`)?.scrollIntoView({ block: "start" })} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/14 bg-white/[0.04] text-xs font-semibold text-cyan-50 transition hover:border-cyan-100/44 hover:bg-cyan-100/[0.10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45">{letter}</button>
                    ))}
                  </div>
                </div>
                <div ref={mobileListRef} className="max-h-[calc(78dvh-14.5rem)] overflow-y-auto overscroll-contain p-3">
                  {mobileLetters.map((letter) => (
                    <section key={letter} data-letter={letter} className="scroll-mt-2">
                      <h4 className="sticky top-0 z-10 -mx-3 border-y border-white/8 bg-[#10172c]/95 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100/72 backdrop-blur">{letter}</h4>
                      <div className="pt-2">
                        {mobileTermGroups[letter].map((term) => {
                          const active = selectedTerm?.slug === term.slug;
                          const tone = TERM_TONES[term.category] || TERM_TONES.identity;
                          return (
                            <button
                              key={term.slug}
                              type="button"
                              onClick={() => { setMobilePickerOpen(false); selectTerm(term.slug); }}
                              aria-pressed={active}
                              className={`mb-2 flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45 ${active ? tone.active : "border-white/10 bg-white/[0.035] text-white/78 hover:border-white/24"}`}
                            >
                              <span className={`h-2 w-2 shrink-0 rounded-full ${tone.marker}`} aria-hidden="true" />
                              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{term.name}</span><span className={`mt-0.5 block text-[10px] uppercase tracking-[0.12em] ${tone.label}`}>{term.type}</span></span>
                              <ArrowUpRight size={15} className="shrink-0 text-white/38" aria-hidden="true" />
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                  {filteredTerms.length === 0 ? <p className="px-3 py-8 text-center text-sm text-white/56">No terms match these filters yet.</p> : null}
                </div>
              </section>
            </div>
          ) : null}
        </section>

        <section className="mt-10 rounded-[25px] border border-fuchsia-100/18 bg-[linear-gradient(145deg,rgba(63,31,68,0.94),rgba(19,29,52,0.98))] p-5 shadow-[0_22px_54px_rgba(0,0,0,0.2)] sm:p-7">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100/58">Language keeps moving</p>
              <h2 className="qa-display mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">A guide, never a verdict.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Meanings can vary between people, cultures and regions. Queer Dictionary uses named sources, visible review dates and plain language — while each person keeps the right to define themself.</p>
            </div>
            <Link href="/corrections" className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-100/22 bg-amber-100/[0.06] px-4 py-2.5 text-xs font-semibold text-amber-50/78 transition hover:border-amber-100/40 hover:text-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/45">
              Suggest a correction <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
