"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpenText,
  MapPin,
  MessageCircleHeart,
  PenLine,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const VOICE_FILTERS = [
  { id: "all", label: "All voices" },
  { id: "story", label: "Member stories" },
  { id: "guide", label: "Local guides" },
  { id: "report", label: "Field reports" },
];

function voiceType(item = {}) {
  const id = String(item.id || "").toLowerCase();
  const source = String(item.sourceName || "").toLowerCase();
  if (id.startsWith("member-guide-") || source.includes("member guide")) return "guide";
  if (String(item.category || "").toLowerCase() === "rights_safety") return "report";
  return "story";
}

function voiceLabel(item = {}) {
  const type = voiceType(item);
  if (type === "guide") return "Local guide";
  if (type === "report") return "Field report";
  return "Member story";
}

function voiceAuthor(item = {}) {
  const source = String(item.sourceName || "Member").split("|")[0].trim();
  return source || "Atlas Member";
}

function cityLabel(value = "") {
  const raw = String(value || "Global").replaceAll("_", " ").trim();
  return raw.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function dateLabel(value = "") {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently published";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
}

function voiceBody(item = {}) {
  const summary = String(item.summary || "").trim();
  const body = String(item.whyItMatters || "").trim();
  return body && body !== summary ? body : "";
}

function readTime(item = {}) {
  const words = `${item.summary || ""} ${voiceBody(item)}`.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(2, Math.ceil(words / 180))} min read`;
}

function contentId(item = {}) {
  return `voice-content-${String(item.id || "item").replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function TypeMark({ item }) {
  const type = voiceType(item);
  const Icon = type === "guide" ? BookOpenText : type === "report" ? ShieldCheck : MessageCircleHeart;
  const classes = type === "guide" ? "text-violet-100" : type === "report" ? "text-amber-100" : "text-rose-100";

  return (
    <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] ${classes}`}>
      <Icon size={12} aria-hidden="true" />
      {voiceLabel(item)}
    </span>
  );
}

function VoiceMeta({ item, showDate = true }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] leading-4 text-white/42">
      <span className="font-semibold text-white/66">{voiceAuthor(item)}</span>
      <span aria-hidden="true">·</span>
      <span>{cityLabel(item.city)}</span>
      {showDate ? <><span aria-hidden="true">·</span><span>{dateLabel(item.date || item.createdAt)}</span></> : null}
      <span aria-hidden="true">·</span>
      <span>{readTime(item)}</span>
    </p>
  );
}

function ReadToggle({ item, expanded, onToggle, compact = false }) {
  if (!voiceBody(item)) return null;
  const noun = voiceType(item) === "guide" ? "guide" : voiceType(item) === "report" ? "report" : "story";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={contentId(item)}
      className={`qa-action inline-flex items-center gap-1.5 font-bold text-cyan-100 transition hover:text-white ${compact ? "text-[10px] uppercase tracking-[0.12em]" : "border-b border-cyan-100/35 pb-1 text-sm"}`}
    >
      {expanded ? "Close" : `Read ${noun}`}
      <ArrowUpRight size={compact ? 12 : 14} className={expanded ? "rotate-90" : ""} aria-hidden="true" />
    </button>
  );
}

function ExpandedVoice({ item, expanded }) {
  if (!expanded || !voiceBody(item)) return null;
  return (
    <div id={contentId(item)} className="mt-4 border-t border-white/10 pt-4">
      <p className="qa-copy-justify whitespace-pre-line text-sm leading-7 text-white/72">{voiceBody(item)}</p>
      <p className="mt-4 inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-100/62"><ShieldCheck size={12} aria-hidden="true" /> Reviewed before publication</p>
    </div>
  );
}

export default function VoicesEditorialPanel({
  items = [],
  isMember = false,
  composer = null,
  onComposeStory,
  onComposeGuide,
  onOpenCommunity,
  onDelete,
  canDelete,
}) {
  const [filter, setFilter] = useState("all");
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState([]);

  const cities = useMemo(() => [...new Set(items.map((item) => cityLabel(item.city)).filter(Boolean))].sort(), [items]);
  const counts = useMemo(() => ({
    all: items.length,
    story: items.filter((item) => voiceType(item) === "story").length,
    guide: items.filter((item) => voiceType(item) === "guide").length,
    report: items.filter((item) => voiceType(item) === "report").length,
  }), [items]);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== "all" && voiceType(item) !== filter) return false;
      if (city && cityLabel(item.city) !== city) return false;
      if (!normalizedQuery) return true;
      return `${item.title || ""} ${item.summary || ""} ${item.whyItMatters || ""} ${item.city || ""} ${item.sourceName || ""}`.toLowerCase().includes(normalizedQuery);
    });
  }, [city, filter, items, query]);

  const featured = visibleItems[0] || null;
  const secondary = visibleItems.slice(1, 3);
  const feed = visibleItems.slice(3);
  const hasActiveDiscovery = filter !== "all" || Boolean(city) || Boolean(query.trim());

  const toggleExpanded = (id) => {
    const key = String(id);
    setExpandedIds((current) => current.includes(key) ? current.filter((value) => value !== key) : [...current, key]);
  };

  const clearDiscovery = () => {
    setFilter("all");
    setCity("");
    setQuery("");
  };

  return (
    <div className="mt-5">
      <header className="relative overflow-hidden border-y border-white/10 py-7 sm:py-9">
        <div className="pointer-events-none absolute -left-24 top-0 h-52 w-52 rounded-full bg-fuchsia-300/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute right-[8%] top-0 h-40 w-40 rounded-full bg-cyan-300/8 blur-3xl" aria-hidden="true" />
        <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.23em] text-fuchsia-100/68">Member-authored · Editor reviewed</p>
            <h1 className="qa-display mt-3 text-4xl font-semibold leading-[0.96] tracking-[-0.05em] text-[#f7f4ee] sm:text-5xl lg:text-[3.5rem]">Voices from the Atlas</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-base sm:leading-7">First-person stories and practical local guides from queer people who know the place beyond the pin.</p>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.13em] text-white/34">Lived experience · Specific places · Reviewed before publication</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onComposeStory} className="qa-action inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f3eee5] px-5 text-xs font-bold text-[#0a0c11] transition hover:bg-white"><PenLine size={14} aria-hidden="true" /> {isMember ? "Write a story" : "Join to write"}</button>
            <button type="button" onClick={onComposeGuide} className="qa-action inline-flex min-h-11 items-center gap-2 rounded-full border border-violet-100/28 px-5 text-xs font-bold text-violet-50 transition hover:border-violet-100/52 hover:bg-violet-100/[0.07]"><BookOpenText size={14} aria-hidden="true" /> Create a guide</button>
          </div>
        </div>
        <dl className="relative mt-7 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/9 pt-4">
          {[["Stories", counts.story], ["Guides", counts.guide], ["Cities", cities.length]].map(([term, value]) => <div key={term} className="flex items-baseline gap-2"><dd className="text-lg font-bold text-white/86">{value}</dd><dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/36">{term}</dt></div>)}
        </dl>
      </header>

      {composer ? <div className="mt-5">{composer}</div> : null}

      <section aria-labelledby="voice-discovery-heading" className="border-b border-white/10 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100/56">Browse perspectives</p>
            <h2 id="voice-discovery-heading" className="sr-only">Find stories and guides</h2>
          </div>
          <p aria-live="polite" className="text-xs text-white/42">{visibleItems.length} {visibleItems.length === 1 ? "voice" : "voices"}</p>
        </div>
        <div className="mt-3 flex gap-5 overflow-x-auto border-b border-white/8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {VOICE_FILTERS.map((option) => {
            const active = filter === option.id;
            return <button key={option.id} type="button" onClick={() => setFilter(option.id)} aria-pressed={active} className={`qa-action relative min-h-11 shrink-0 pb-3 text-[10px] font-bold uppercase tracking-[0.12em] transition ${active ? "text-[#f7f4ee]" : "text-white/42 hover:text-white/72"}`}>{option.label}<span className="ml-1.5 text-white/30">{counts[option.id]}</span>{active ? <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-cyan-200 via-fuchsia-200 to-transparent" aria-hidden="true" /> : null}</button>;
          })}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_14rem_auto]">
          <label className="flex min-h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3">
            <Search size={14} className="text-cyan-100/58" aria-hidden="true" />
            <span className="sr-only">Search voices</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stories, guides or contributors" className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/30 sm:text-sm" />
          </label>
          <label className="flex min-h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 text-xs text-white/64">
            <MapPin size={14} className="text-fuchsia-100/58" aria-hidden="true" />
            <span className="sr-only">Filter by city</span>
            <select value={city} onChange={(event) => setCity(event.target.value)} className="min-w-0 flex-1 bg-transparent text-white outline-none [&>option]:bg-[#0b0e14]"><option value="">Everywhere</option>{cities.map((name) => <option key={name} value={name}>{name}</option>)}</select>
          </label>
          {hasActiveDiscovery ? <button type="button" onClick={clearDiscovery} className="qa-action min-h-12 rounded-xl border border-white/12 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white/58 transition hover:border-white/28 hover:text-white">Clear</button> : null}
        </div>
      </section>

      {featured ? (
        <section aria-labelledby="voices-featured-heading" className="pt-6">
          <h2 id="voices-featured-heading" className="sr-only">Featured community voices</h2>
          <div className="grid gap-5 xl:grid-cols-[1.16fr_0.84fr]">
            <article className="relative overflow-hidden rounded-[28px] border border-fuchsia-100/18 bg-[radial-gradient(circle_at_86%_6%,rgba(34,211,238,0.15),transparent_31%),radial-gradient(circle_at_4%_0%,rgba(244,114,182,0.18),transparent_36%),linear-gradient(145deg,rgba(35,18,42,0.97),rgba(8,17,24,0.99)_62%,rgba(7,8,12,1))] p-5 shadow-[0_28px_85px_rgba(0,0,0,0.24)] sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3"><TypeMark item={featured} /><span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/34">Editor&apos;s lead</span></div>
              <h3 className="mt-8 max-w-[23ch] text-3xl font-semibold leading-[1.06] tracking-[-0.04em] text-[#f7f4ee] sm:text-4xl">{featured.title}</h3>
              <p className="qa-copy-justify mt-4 max-w-2xl text-sm leading-7 text-white/68">{featured.summary}</p>
              <ExpandedVoice item={featured} expanded={expandedIds.includes(String(featured.id))} />
              <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-4"><VoiceMeta item={featured} /><ReadToggle item={featured} expanded={expandedIds.includes(String(featured.id))} onToggle={() => toggleExpanded(featured.id)} /></div>
            </article>

            <ul className="grid gap-0 border-y border-white/10 sm:grid-cols-2 xl:grid-cols-1">
              {secondary.map((item, index) => {
                const expanded = expandedIds.includes(String(item.id));
                return <li key={item.id} className={`${index > 0 ? "border-t sm:border-l sm:border-t-0 xl:border-l-0 xl:border-t" : ""} border-white/10`}><article className="flex h-full flex-col px-1 py-5 sm:px-5 xl:px-5"><div className="flex items-center justify-between gap-3"><TypeMark item={item} /><span className="text-[9px] uppercase tracking-[0.12em] text-white/34">{dateLabel(item.date || item.createdAt)}</span></div><h3 className="mt-4 text-xl font-semibold leading-snug tracking-[-0.025em] text-[#f7f4ee]">{item.title}</h3><p className="qa-copy-justify mt-3 line-clamp-3 text-sm leading-6 text-white/58">{item.summary}</p><ExpandedVoice item={item} expanded={expanded} /><div className="mt-auto flex items-end justify-between gap-3 pt-5"><VoiceMeta item={item} showDate={false} /><ReadToggle item={item} expanded={expanded} onToggle={() => toggleExpanded(item.id)} compact /></div></article></li>;
              })}
            </ul>
          </div>
        </section>
      ) : (
        <section className="border-b border-white/10 py-12 text-center">
          <BookOpenText className="mx-auto text-violet-100/58" size={26} aria-hidden="true" />
          <h3 className="mt-4 text-xl font-semibold text-white">No voices match this view yet.</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/52">Clear the filters or help shape the first story or guide in this part of the atlas.</p>
          {hasActiveDiscovery ? <button type="button" onClick={clearDiscovery} className="mt-5 rounded-full bg-[#f3eee5] px-4 py-2 text-xs font-bold text-[#0a0c11]">Clear filters</button> : null}
        </section>
      )}

      {feed.length > 0 ? (
        <section aria-labelledby="voices-latest-heading" className="pt-9">
          <div className="flex items-end justify-between gap-3 border-b border-white/10 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.19em] text-cyan-100/56">More perspectives</p><h2 id="voices-latest-heading" className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[#f7f4ee]">Latest from the community</h2></div><span className="text-xs text-white/36">{feed.length} more</span></div>
          <ul className="grid md:grid-cols-2 md:gap-x-7">
            {feed.map((item) => {
              const expanded = expandedIds.includes(String(item.id));
              return <li key={item.id} className="border-b border-white/9"><article className="flex h-full flex-col py-5"><div className="flex items-center justify-between gap-3"><TypeMark item={item} /><span className="text-[9px] uppercase tracking-[0.12em] text-white/32">{dateLabel(item.date || item.createdAt)}</span></div><h3 className="mt-3 text-lg font-semibold leading-snug text-[#f7f4ee]">{item.title}</h3><p className="qa-copy-justify mt-2 line-clamp-3 text-sm leading-6 text-white/56">{item.summary}</p><ExpandedVoice item={item} expanded={expanded} /><div className="mt-auto flex items-end justify-between gap-3 pt-4"><VoiceMeta item={item} showDate={false} /><ReadToggle item={item} expanded={expanded} onToggle={() => toggleExpanded(item.id)} compact /></div>{canDelete?.(item) ? <button type="button" onClick={() => onDelete?.(item.id)} className="mt-3 self-start text-[9px] font-semibold uppercase tracking-[0.12em] text-rose-100/52 hover:text-rose-100">Delete</button> : null}</article></li>;
            })}
          </ul>
        </section>
      ) : null}

      <section className="mt-9 flex flex-col gap-4 border-y border-white/10 bg-[linear-gradient(90deg,rgba(34,211,238,0.055),rgba(244,114,182,0.045),transparent)] py-6 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-100/62"><UsersRound size={13} aria-hidden="true" /> Continue into Community</p><h2 className="mt-2 text-xl font-semibold text-[#f7f4ee]">Meet the people behind the signal.</h2><p className="mt-1 text-sm text-white/50">Find members, rooms, jobs and live conversations.</p></div>
        <button type="button" onClick={onOpenCommunity} className="qa-action shrink-0 self-start border-b border-cyan-100/35 pb-1 text-sm font-bold text-cyan-100 transition hover:text-white sm:self-auto">Open Community <span aria-hidden="true">→</span></button>
      </section>
    </div>
  );
}
