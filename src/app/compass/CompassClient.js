"use client";

import { useMemo, useRef, useState } from "react";
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
    card: "border-violet-200/14 bg-[radial-gradient(circle_at_100%_0%,rgba(167,139,250,0.105),transparent_48%),rgba(255,255,255,0.024)] hover:border-violet-200/30",
    active: "border-violet-200/42 bg-violet-200/[0.085] ring-1 ring-violet-200/18",
    marker: "bg-violet-300 shadow-[0_0_15px_rgba(196,181,253,0.55)]",
    label: "text-violet-100/58",
    detail: "border-violet-200/18 bg-[radial-gradient(circle_at_92%_2%,rgba(167,139,250,0.16),transparent_34%),linear-gradient(165deg,rgba(29,22,36,0.98),rgba(13,11,17,0.99))]",
    badge: "border-violet-200/24 bg-violet-200/[0.09] text-violet-100/90",
    check: "text-violet-200/88",
  },
  language: {
    card: "border-cyan-200/14 bg-[radial-gradient(circle_at_100%_0%,rgba(34,211,238,0.095),transparent_48%),rgba(255,255,255,0.024)] hover:border-cyan-200/30",
    active: "border-cyan-200/42 bg-cyan-200/[0.08] ring-1 ring-cyan-200/18",
    marker: "bg-cyan-300 shadow-[0_0_15px_rgba(103,232,249,0.55)]",
    label: "text-cyan-100/58",
    detail: "border-cyan-200/18 bg-[radial-gradient(circle_at_92%_2%,rgba(34,211,238,0.145),transparent_34%),linear-gradient(165deg,rgba(17,28,33,0.98),rgba(11,13,17,0.99))]",
    badge: "border-cyan-200/24 bg-cyan-200/[0.08] text-cyan-100/90",
    check: "text-cyan-200/88",
  },
  community: {
    card: "border-rose-200/14 bg-[radial-gradient(circle_at_100%_0%,rgba(244,114,182,0.09),transparent_48%),rgba(255,255,255,0.024)] hover:border-rose-200/30",
    active: "border-rose-200/40 bg-rose-200/[0.075] ring-1 ring-rose-200/18",
    marker: "bg-rose-300 shadow-[0_0_15px_rgba(249,168,212,0.5)]",
    label: "text-rose-100/58",
    detail: "border-rose-200/18 bg-[radial-gradient(circle_at_92%_2%,rgba(244,114,182,0.135),transparent_34%),linear-gradient(165deg,rgba(32,19,29,0.98),rgba(14,11,16,0.99))]",
    badge: "border-rose-200/24 bg-rose-200/[0.08] text-rose-100/90",
    check: "text-rose-200/88",
  },
  allyship: {
    card: "border-emerald-200/14 bg-[radial-gradient(circle_at_100%_0%,rgba(52,211,153,0.09),transparent_48%),rgba(255,255,255,0.024)] hover:border-emerald-200/30",
    active: "border-emerald-200/40 bg-emerald-200/[0.075] ring-1 ring-emerald-200/18",
    marker: "bg-emerald-300 shadow-[0_0_15px_rgba(110,231,183,0.5)]",
    label: "text-emerald-100/58",
    detail: "border-emerald-200/18 bg-[radial-gradient(circle_at_92%_2%,rgba(52,211,153,0.13),transparent_34%),linear-gradient(165deg,rgba(17,29,27,0.98),rgba(11,14,15,0.99))]",
    badge: "border-emerald-200/24 bg-emerald-200/[0.08] text-emerald-100/90",
    check: "text-emerald-200/88",
  },
};

const CATEGORY_BUTTON_STYLES = {
  all: "border-white/28 bg-white/[0.09] text-white",
  identity: "border-violet-200/38 bg-violet-200/[0.11] text-violet-50",
  language: "border-cyan-200/38 bg-cyan-200/[0.1] text-cyan-50",
  community: "border-rose-200/38 bg-rose-200/[0.1] text-rose-50",
  allyship: "border-emerald-200/38 bg-emerald-200/[0.1] text-emerald-50",
};

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

function CompassTermDetail({ term, detailRef }) {
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
          <span className="text-[10px] uppercase tracking-[0.13em] text-white/38">Reviewed · Sep 2026</span>
        </div>
        <h2 className="qa-display mt-5 text-4xl font-semibold tracking-[-0.045em] text-[#fff8fc] sm:text-5xl">
          {term.name}
        </h2>
        <p className="mt-2 text-xs leading-5 text-white/42">Also found as: {term.aliases.join(" · ")}</p>
        <p className="mt-5 text-[16px] leading-7 text-[#f7edf4] sm:text-[17px]">{term.summary}</p>
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
            {term.related.map((label) => (
              <span key={label} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] text-white/58">{label}</span>
            ))}
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
  const detailRef = useRef(null);
  const libraryRef = useRef(null);
  const emptyRef = useRef(null);

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

  function selectTerm(slug) {
    setSelectedSlug(slug);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      window.setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        detailRef.current?.focus({ preventScroll: true });
      }, 30);
    }
  }

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
      window.setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        detailRef.current?.focus({ preventScroll: true });
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
    <main className="min-h-screen overflow-hidden bg-[#08070b] pb-28 text-white sm:pb-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[46rem] bg-[radial-gradient(circle_at_10%_3%,rgba(139,92,246,0.17),transparent_31%),radial-gradient(circle_at_88%_3%,rgba(45,212,191,0.14),transparent_30%),radial-gradient(circle_at_52%_22%,rgba(244,114,182,0.055),transparent_29%)]" />

      <div className="qa-shell relative">
        <header className="pt-5 sm:pt-10">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/34">
            <Link href="/" className="transition hover:text-white/68">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-white/58">Queer Compass</span>
          </nav>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/66">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-100/16 bg-cyan-100/[0.06] text-cyan-100/75">
              <Compass size={16} strokeWidth={1.8} aria-hidden="true" />
            </span>
            Queer Compass · Learn without judgement
          </div>
          <h1 className="qa-display mt-6 max-w-4xl text-[2.75rem] font-semibold leading-[0.94] tracking-[-0.055em] text-[#fff8fc] sm:text-6xl lg:text-7xl">
            What would you like to understand?
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
            className="mt-7 flex min-h-14 max-w-3xl items-center gap-1.5 rounded-[20px] border border-cyan-100/22 bg-[linear-gradient(145deg,rgba(24,28,35,0.96),rgba(15,13,19,0.98))] p-1.5 pl-4 shadow-[0_18px_54px_rgba(0,0,0,0.28),0_0_42px_rgba(45,212,191,0.045)] focus-within:border-cyan-100/42 focus-within:ring-2 focus-within:ring-cyan-300/20"
          >
            <label className="flex min-w-0 flex-1 items-center gap-3">
              <Search size={18} className="shrink-0 text-cyan-100/68" aria-hidden="true" />
              <span className="sr-only">Search the Queer Compass</span>
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

          <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter Compass by theme">
            {COMPASS_CATEGORIES.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={category === item.key}
                onClick={() => updateCategory(item.key)}
                className={`rounded-full border px-3.5 py-2 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45 ${category === item.key ? CATEGORY_BUTTON_STYLES[item.key] : "border-white/10 bg-white/[0.025] text-white/48 hover:border-white/22 hover:text-white/78"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(22rem,0.78fr)] lg:items-start">
            <div className="grid gap-3 sm:grid-cols-2">
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
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/44">Try another spelling or clear your search. Compass will grow through careful review, not automatic bulk publishing.</p>
                  <button type="button" onClick={() => { setQuery(""); setCategory("all"); }} className="mt-4 rounded-full border border-white/14 px-4 py-2 text-xs text-white/62 transition hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45">Clear search</button>
                </div>
              ) : null}
            </div>

            <div className="lg:sticky lg:top-6">
              {selectedTerm ? <CompassTermDetail term={selectedTerm} detailRef={detailRef} /> : null}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[25px] border border-white/10 bg-[linear-gradient(145deg,rgba(19,16,23,0.96),rgba(11,11,15,0.98))] p-5 sm:p-7">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100/58">Language keeps moving</p>
              <h2 className="qa-display mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">A guide, never a verdict.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Meanings can vary between people, cultures and regions. Queer Compass uses named sources, visible review dates and plain language — while each person keeps the right to define themself.</p>
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
