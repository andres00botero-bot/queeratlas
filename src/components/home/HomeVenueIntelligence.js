import Link from "next/link";
import { ArrowUpRight, ChartNoAxesCombined, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { citySelectionPath } from "@/lib/cityRouting";
import { normalizeVenueIntel } from "@/lib/venueIntel";

function formatLabel(value = "") {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function firstUsefulSentence(value = "", limit = 165) {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  const firstSentence = text.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || text;
  if (firstSentence.length <= limit) return firstSentence;
  const shortened = firstSentence.slice(0, limit + 1).replace(/\s+\S*$/, "").replace(/[,:;\s]+$/, "");
  return `${shortened}…`;
}

const QARI_COLORS = ["#3b82f6", "#22c55e", "#facc15", "#fb923c", "#ef4444"];

const INDEX_LINKS = [
  { href: "/reports/queer-nightlife-index-2026", label: "Nightlife" },
  { href: "/reports/global-queer-event-report-2026", label: "Events" },
  { href: "/reports/safest-queer-cities-2026", label: "Safety" },
];

export default function HomeVenueIntelligence({ venue, onOpen, onContextOpen }) {
  const intelligence = normalizeVenueIntel(venue);
  const venueHref = citySelectionPath(venue?.city, { placeId: venue?.id });
  const proof = firstUsefulSentence(intelligence.queueWait || intelligence.bestNights || intelligence.crowdMix);
  const hasVenueExample = Boolean(venue?.name && proof);

  return (
    <section id="venue-intelligence" data-home-section="venue_intelligence" className="mt-1 scroll-mt-5">
      <div className="qa-atlas-section relative overflow-hidden rounded-[26px] border border-white/12 bg-[radial-gradient(circle_at_0%_0%,rgba(244,114,182,0.15),transparent_26%),radial-gradient(circle_at_100%_4%,rgba(34,211,238,0.13),transparent_27%),radial-gradient(circle_at_52%_100%,rgba(139,92,246,0.12),transparent_34%),linear-gradient(145deg,rgba(18,13,29,0.99),rgba(7,13,22,0.99)_52%,rgba(9,8,18,0.99))] p-3.5 shadow-[0_26px_76px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.07)] ring-1 ring-inset ring-fuchsia-100/[0.045] sm:p-5">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/28 to-transparent" />

        <header className="relative z-10 flex flex-col gap-2 border-b border-white/9 pb-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pb-4">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-fuchsia-100/78">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-fuchsia-300 via-violet-300 to-cyan-200 shadow-[0_0_13px_rgba(244,114,182,0.72)]" />
              How Queer Atlas builds trust
            </p>
            <h2 className="qa-display mt-1.5 text-[1.55rem] font-semibold leading-none tracking-[-0.035em] text-white sm:text-[1.85rem]">
              Evidence at every scale.
            </h2>
          </div>
          <div className="flex items-center justify-between gap-3 sm:block">
            <p className="hidden max-w-xl text-[12px] leading-5 text-white/68 sm:block sm:text-right">
              From what happens at the door to the wider context surrounding a destination.
            </p>
            <span className="shrink-0 rounded-full border border-white/14 bg-white/[0.05] px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/66 sm:hidden">
              Swipe 3 layers →
            </span>
          </div>
        </header>

        <div className="qa-trust-rail relative z-10 mt-3 grid snap-x snap-mandatory grid-flow-col auto-cols-[86%] gap-2.5 overflow-x-auto overscroll-x-contain pb-1 lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-3 lg:gap-0 lg:overflow-visible lg:pb-0">
          <article className="group relative flex min-w-0 snap-start flex-col overflow-hidden rounded-[20px] border border-fuchsia-100/15 bg-[radial-gradient(circle_at_0%_0%,rgba(244,114,182,0.12),transparent_32%),linear-gradient(155deg,rgba(255,255,255,0.065),rgba(255,255,255,0.022))] p-3.5 lg:rounded-r-none lg:border-r-0 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-fuchsia-100/70">01 · Venue level</p>
              <MapPin size={14} className="text-fuchsia-100/44" aria-hidden="true" />
            </div>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-white">Venue Intelligence</h3>
            <p className="mt-1 hidden text-[13px] leading-5 text-white/70 sm:block">
              Queue patterns, best nights, crowd, practical dress code and inclusion—distilled from trusted sources, reviews and local knowledge.
            </p>

            <div className="mt-2.5 rounded-[15px] border border-white/10 bg-black/18 p-2.5 sm:mt-3">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-cyan-50/78">
                <Sparkles size={10} aria-hidden="true" />
                {hasVenueExample ? `${venue.name} · ${formatLabel(venue.city)}` : "Inside a venue profile"}
              </p>
              <p className="mt-1.5 line-clamp-2 text-[12px] leading-[1.2rem] text-white/84">
                {hasVenueExample ? proof : "See practical, source-backed context before choosing where to go."}
              </p>
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 pt-3">
              <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-white/58 sm:text-[10px]">
                {intelligence.sourceUrls.length > 0 ? `${intelligence.sourceUrls.length} sources checked` : "Evidence checked"}
              </span>
              <Link
                href={hasVenueExample ? venueHref : "/cities"}
                onClick={onOpen}
                className="inline-flex min-h-11 items-center gap-1 text-[11px] font-semibold text-cyan-50/86 transition hover:text-white sm:min-h-0 sm:text-[12px]"
              >
                {hasVenueExample ? "Open venue" : "Explore venues"} <ArrowUpRight size={11} aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="group relative flex min-w-0 snap-start flex-col overflow-hidden rounded-[20px] border border-cyan-100/15 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.10),transparent_34%),linear-gradient(155deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-3.5 lg:rounded-none lg:border-r-0 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-100/70">02 · Country context</p>
              <ShieldCheck size={14} className="text-cyan-100/44" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-white">
                <span className="sm:hidden">QARI</span>
                <span className="hidden sm:inline">What is QARI?</span>
              </h3>
              <span className="flex items-center gap-1" aria-hidden="true">
                {QARI_COLORS.map((color) => (
                  <span key={color} className="h-2 w-2 rounded-full shadow-[0_0_9px_currentColor]" style={{ backgroundColor: color, color }} />
                ))}
              </span>
            </div>
            <p className="mt-1 hidden text-[13px] leading-5 text-white/70 sm:block">
              QARI, the Queer Atlas Risk Index, combines legal risk, social reality, and digital and enforcement risk into a transparent country-level travel signal.
            </p>

            <div className="mt-3 grid grid-cols-3 gap-1.5" aria-label="QARI score weights">
              {[
                ["Legal", "35%", "border-blue-200/16 bg-blue-300/[0.07] text-blue-100/70"],
                ["Social", "40%", "border-emerald-200/16 bg-emerald-300/[0.07] text-emerald-100/70"],
                ["Digital", "25%", "border-amber-200/16 bg-amber-300/[0.07] text-amber-100/70"],
              ].map(([label, value, tone]) => (
                <div key={label} className={`rounded-[13px] border px-2 py-2 ${tone}`}>
                  <p className="text-[9px] font-medium uppercase tracking-[0.1em] opacity-85">{label}</p>
                  <p className="mt-0.5 text-[15px] font-semibold tabular-nums">{value}</p>
                </div>
              ))}
            </div>

            <p className="mt-2.5 rounded-xl border border-white/12 bg-white/[0.045] px-2.5 py-2 text-center text-[13px] font-semibold leading-5 tracking-[0.02em] text-white/84 sm:hidden" aria-label="Queer Atlas Risk Index">
              <span className="text-[13px] font-bold text-cyan-200">Q</span>ueer{" "}
              <span className="text-[13px] font-bold text-emerald-200">A</span>tlas{" "}
              <span className="text-[13px] font-bold text-amber-200">R</span>isk{" "}
              <span className="text-[13px] font-bold text-rose-200">I</span>ndex
            </p>

            <Link
              href="/cities"
              onClick={() => onContextOpen?.("/cities")}
              className="mt-auto flex min-h-11 items-center justify-between gap-2 pt-3 text-[11px] font-semibold text-cyan-50/86 transition hover:text-white sm:min-h-0 sm:text-[12px]"
            >
              Explore the QARI world map <ArrowUpRight size={11} aria-hidden="true" />
            </Link>
          </article>

          <article className="group relative flex min-w-0 snap-start flex-col overflow-hidden rounded-[20px] border border-violet-100/15 bg-[radial-gradient(circle_at_100%_0%,rgba(167,139,250,0.13),transparent_34%),linear-gradient(155deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-3.5 lg:rounded-l-none sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-100/70">03 · Global research</p>
              <ChartNoAxesCombined size={14} className="text-violet-100/44" aria-hidden="true" />
            </div>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-white">Queer Atlas Indexes</h3>
            <p className="mt-1 hidden text-[13px] leading-5 text-white/70 sm:block">
              Compare cities and destinations through transparent, source-backed global research.
            </p>

            <Link
              href="/reports/global-queer-safety-culture-index-methodology"
              onClick={() => onContextOpen?.("/reports/global-queer-safety-culture-index-methodology")}
              className="mt-3 rounded-[15px] border border-violet-100/16 bg-violet-100/[0.07] p-2.5 transition hover:border-violet-100/30 hover:bg-violet-100/[0.10]"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="text-[12px] font-semibold leading-[1.1rem] text-violet-50/92">Global Queer Safety &amp; Culture Index 2026</span>
                <ArrowUpRight size={11} className="mt-0.5 shrink-0 text-violet-100/44" aria-hidden="true" />
              </span>
              <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.09em] text-violet-100/68">Legal protection 50% · Lived acceptance 50%</span>
            </Link>

            <nav aria-label="More Queer Atlas indexes" className="mt-2 flex flex-wrap gap-1">
              {INDEX_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onContextOpen?.(item.href)}
                  className="inline-flex min-h-9 items-center rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-white/70 transition hover:border-white/24 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/now/data"
              onClick={() => onContextOpen?.("/now/data")}
              className="mt-auto flex min-h-11 items-center justify-between gap-2 pt-3 text-[11px] font-semibold text-violet-50/84 transition hover:text-white sm:min-h-0 sm:text-[12px]"
            >
              View all indexes &amp; reports <ArrowUpRight size={11} aria-hidden="true" />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
