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
  Sparkles,
  UsersRound,
} from "lucide-react";

const VOICE_FILTERS = [
  { id: "all", label: "Featured" },
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

function readTime(item = {}) {
  const words = `${item.summary || ""} ${item.whyItMatters || ""}`.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(2, Math.ceil(words / 180))} min read`;
}

function TypeMark({ item, compact = false }) {
  const type = voiceType(item);
  const Icon = type === "guide" ? BookOpenText : type === "report" ? ShieldCheck : MessageCircleHeart;
  const classes = type === "guide"
    ? "border-violet-200/24 bg-violet-200/10 text-violet-50"
    : type === "report"
      ? "border-amber-200/24 bg-amber-200/10 text-amber-50"
      : "border-rose-200/24 bg-rose-200/10 text-rose-50";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-[0.14em] ${compact ? "px-2.5 py-1 text-[9px]" : "px-3 py-1.5 text-[10px]"} ${classes}`}>
      <Icon size={compact ? 11 : 12} aria-hidden="true" />
      {voiceLabel(item)}
    </span>
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
      return `${item.title || ""} ${item.summary || ""} ${item.whyItMatters || ""} ${item.city || ""} ${item.sourceName || ""}`
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [city, filter, items, query]);

  const featured = visibleItems[0] || null;
  const secondary = visibleItems.slice(1, 3);
  const feed = visibleItems.slice(3);

  const toggleExpanded = (id) => {
    const key = String(id);
    setExpandedIds((current) => current.includes(key) ? current.filter((value) => value !== key) : [...current, key]);
  };

  return (
    <div className="mt-8 space-y-5">
      <section className="qa-premium-card relative overflow-hidden rounded-[34px] border border-fuchsia-200/18 bg-[radial-gradient(circle_at_6%_0%,rgba(244,114,182,0.19),transparent_30%),radial-gradient(circle_at_90%_4%,rgba(56,189,248,0.16),transparent_32%),radial-gradient(circle_at_50%_110%,rgba(139,92,246,0.15),transparent_38%),linear-gradient(155deg,rgba(28,14,40,0.98),rgba(8,17,25,0.98)_52%,rgba(7,7,10,1))] p-4 shadow-[0_36px_120px_rgba(0,0,0,0.42),0_18px_70px_rgba(217,70,239,0.1)] sm:p-7">
        <div className="pointer-events-none absolute inset-0 opacity-[0.1] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:54px_54px]" />
        <div className="relative">
          <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-100/20 bg-fuchsia-200/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-fuchsia-50/86">
                <Sparkles size={12} aria-hidden="true" /> First-person queer intelligence
              </div>
              <h2 className="qa-display mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.045em] text-white sm:text-5xl">
                Stories worth carrying with you.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/64 sm:text-base">
                Stories, practical guides and lived experience from queer people around the world — reviewed before publication.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onComposeStory} className="qa-action qa-cta-primary inline-flex items-center gap-2 rounded-full border border-rose-100/38 bg-rose-200/14 px-4 py-2.5 text-xs font-semibold text-rose-50 transition hover:border-rose-100/62 hover:bg-rose-200/20">
                <PenLine size={14} aria-hidden="true" /> {isMember ? "Write a story" : "Join to write"}
              </button>
              <button type="button" onClick={onComposeGuide} className="qa-action inline-flex items-center gap-2 rounded-full border border-violet-100/30 bg-violet-200/10 px-4 py-2.5 text-xs font-semibold text-violet-50 transition hover:border-violet-100/52 hover:bg-violet-200/17">
                <BookOpenText size={14} aria-hidden="true" /> Create a guide
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:max-w-xl">
            <div className="rounded-2xl border border-white/10 bg-black/22 px-3 py-3"><p className="text-xl font-semibold text-white">{counts.story}</p><p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-rose-100/56">Stories</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/22 px-3 py-3"><p className="text-xl font-semibold text-white">{counts.guide}</p><p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-violet-100/56">Guides</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/22 px-3 py-3"><p className="text-xl font-semibold text-white">{cities.length}</p><p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-cyan-100/56">Cities</p></div>
          </div>
        </div>
      </section>

      {composer}

      <section aria-label="Voice discovery controls" className="qa-premium-card rounded-[26px] border border-white/10 bg-[linear-gradient(145deg,rgba(17,21,29,0.96),rgba(8,8,11,0.98))] p-3 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {VOICE_FILTERS.map((option) => (
            <button key={option.id} type="button" onClick={() => setFilter(option.id)} aria-pressed={filter === option.id} className={`qa-action shrink-0 rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${filter === option.id ? "border-cyan-100/40 bg-[linear-gradient(110deg,rgba(34,211,238,0.18),rgba(217,70,239,0.16))] text-white" : "border-white/9 bg-white/[0.035] text-white/52 hover:border-white/18 hover:text-white/78"}`}>
              {option.label} <span className="ml-1 text-white/36">{counts[option.id]}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_13rem]">
          <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/22 px-3 py-2.5">
            <Search size={14} className="text-cyan-100/58" aria-hidden="true" />
            <span className="sr-only">Search voices</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stories, guides or contributors" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
          </label>
          <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/22 px-3 py-2.5 text-xs text-white/64">
            <MapPin size={14} className="text-fuchsia-100/58" aria-hidden="true" />
            <span className="sr-only">Filter by city</span>
            <select value={city} onChange={(event) => setCity(event.target.value)} className="min-w-0 flex-1 bg-transparent text-white outline-none [&>option]:bg-[#0b0e14]">
              <option value="">Everywhere</option>
              {cities.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
        </div>
      </section>

      {featured ? (
        <section aria-label="Featured community voices" className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
          <article className="qa-premium-card relative min-h-[350px] overflow-hidden rounded-[32px] border border-fuchsia-200/18 bg-[radial-gradient(circle_at_78%_8%,rgba(34,211,238,0.17),transparent_34%),radial-gradient(circle_at_8%_6%,rgba(244,114,182,0.2),transparent_38%),linear-gradient(145deg,rgba(50,20,59,0.94),rgba(8,22,31,0.98)_62%,rgba(7,8,12,1))] p-5 shadow-[0_30px_90px_rgba(217,70,239,0.12)] sm:p-8">
            <div className="relative flex h-full flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2"><TypeMark item={featured} /><span className="text-[10px] uppercase tracking-[0.14em] text-white/42">Editor&apos;s lead</span></div>
              <div className="mt-10">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-white/50"><MapPin size={13} aria-hidden="true" /> {cityLabel(featured.city)} <span className="text-white/20">•</span> {dateLabel(featured.date || featured.createdAt)}</p>
                <h3 className="mt-3 max-w-[22ch] text-2xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-4xl">{featured.title}</h3>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">{featured.summary}</p>
                {expandedIds.includes(String(featured.id)) && featured.whyItMatters ? <p className="mt-3 max-w-2xl border-l border-fuchsia-100/28 pl-4 text-sm leading-7 text-white/64">{featured.whyItMatters}</p> : null}
              </div>
              <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-8">
                <div><p className="text-sm font-semibold text-white">{voiceAuthor(featured)}</p><p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/40">Reviewed by Queer Atlas · {readTime(featured)}</p></div>
                <button type="button" onClick={() => toggleExpanded(featured.id)} className="qa-action inline-flex items-center gap-2 rounded-full border border-cyan-100/30 bg-cyan-200/10 px-4 py-2 text-xs text-cyan-50 transition hover:border-cyan-100/52">{expandedIds.includes(String(featured.id)) ? "Close" : voiceType(featured) === "guide" ? "Read guide" : "Read story"}<ArrowUpRight size={13} aria-hidden="true" /></button>
              </div>
            </div>
          </article>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {secondary.map((item) => (
              <article key={item.id} className="qa-premium-card rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.065),rgba(255,255,255,0.025))] p-5 transition hover:-translate-y-0.5 hover:border-cyan-100/24">
                <div className="flex items-center justify-between gap-2"><TypeMark item={item} compact /><span className="text-[9px] uppercase tracking-[0.13em] text-white/38">{cityLabel(item.city)}</span></div>
                <h3 className="mt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-white">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/60">{item.summary}</p>
                {expandedIds.includes(String(item.id)) && item.whyItMatters ? <p className="mt-3 border-t border-white/8 pt-3 text-sm leading-6 text-white/62">{item.whyItMatters}</p> : null}
                <div className="mt-5 flex items-center justify-between gap-2"><span className="text-[10px] text-white/42">{voiceAuthor(item)} · {readTime(item)}</span><button type="button" onClick={() => toggleExpanded(item.id)} className="qa-action rounded-full border border-white/12 bg-white/[0.045] px-3 py-1.5 text-[10px] text-white/68">{expandedIds.includes(String(item.id)) ? "Close" : "Read"}</button></div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="qa-premium-card rounded-[30px] border border-dashed border-white/14 bg-white/[0.025] px-5 py-12 text-center">
          <BookOpenText className="mx-auto text-violet-100/58" size={26} aria-hidden="true" />
          <h3 className="mt-4 text-xl font-semibold text-white">No voices match this view yet.</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/52">Clear the filters or help shape the first story or guide in this part of the atlas.</p>
        </section>
      )}

      {feed.length > 0 ? (
        <section aria-labelledby="voices-latest-heading" className="qa-premium-card rounded-[30px] border border-white/10 bg-[linear-gradient(160deg,rgba(14,17,24,0.98),rgba(7,8,11,1))] p-4 sm:p-6">
          <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[0.2em] text-cyan-100/62">More perspectives</p><h3 id="voices-latest-heading" className="mt-2 text-2xl font-semibold text-white">Latest from the community</h3></div><span className="text-xs text-white/38">{feed.length} more</span></div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {feed.map((item) => (
              <article key={item.id} className="rounded-[24px] border border-white/9 bg-white/[0.035] p-4 transition hover:border-fuchsia-100/22 hover:bg-white/[0.055]">
                <div className="flex items-center justify-between gap-2"><TypeMark item={item} compact /><span className="text-[9px] uppercase tracking-[0.12em] text-white/36">{dateLabel(item.date || item.createdAt)}</span></div>
                <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-white/58">{item.summary}</p>
                <div className="mt-4 flex items-center justify-between gap-2"><span className="text-[10px] text-white/40">{cityLabel(item.city)} · {voiceAuthor(item)}</span><button type="button" onClick={() => toggleExpanded(item.id)} className="qa-action text-[10px] uppercase tracking-[0.12em] text-cyan-100/68 hover:text-cyan-50">{expandedIds.includes(String(item.id)) ? "Close" : "Read"}</button></div>
                {expandedIds.includes(String(item.id)) && item.whyItMatters ? <p className="mt-3 border-t border-white/8 pt-3 text-sm leading-6 text-white/62">{item.whyItMatters}</p> : null}
                {canDelete?.(item) ? <button type="button" onClick={() => onDelete?.(item.id)} className="mt-3 text-[10px] uppercase tracking-[0.12em] text-rose-100/54 hover:text-rose-100">Delete</button> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="qa-premium-card flex flex-col gap-4 rounded-[28px] border border-cyan-200/14 bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.12),transparent_32%),linear-gradient(145deg,rgba(8,24,31,0.96),rgba(8,9,13,1))] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/68"><UsersRound size={13} aria-hidden="true" /> The member hub</p><h3 className="mt-2 text-xl font-semibold text-white">Want to meet the people behind the signal?</h3><p className="mt-1 text-sm text-white/54">Find members, jobs and live conversations inside Community.</p></div>
        <button type="button" onClick={onOpenCommunity} className="qa-action shrink-0 rounded-full border border-cyan-100/28 bg-cyan-200/10 px-4 py-2.5 text-xs font-semibold text-cyan-50 transition hover:border-cyan-100/50">Open Community</button>
      </section>
    </div>
  );
}
