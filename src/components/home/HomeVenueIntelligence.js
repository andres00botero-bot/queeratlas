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
      <div className="relative py-3 sm:py-5 lg:pb-7 lg:pt-2">
        <header className="relative z-10 flex flex-col gap-2 border-b border-white/9 pb-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pb-4 lg:items-center lg:border-white/12 lg:pb-6">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-fuchsia-100/78">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-fuchsia-300 via-violet-300 to-cyan-200 shadow-[0_0_13px_rgba(244,114,182,0.72)]" />
              How Queer Atlas builds trust
            </p>
            <h2 className="qa-display mt-1.5 text-[1.55rem] font-semibold leading-none tracking-[-0.035em] text-white sm:text-[1.85rem] lg:mt-2 lg:whitespace-nowrap lg:text-[2.05rem] lg:tracking-[-0.045em] xl:text-[2.35rem]">
              Evidence at every scale.
            </h2>
          </div>
          <div className="flex items-center justify-between gap-3 sm:block">
            <span className="shrink-0 rounded-full border border-white/14 bg-white/[0.05] px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/66 sm:hidden">
              Swipe 3 layers →
            </span>
          </div>
        </header>

        <div className="qa-trust-rail relative z-10 mt-3 grid snap-x snap-mandatory grid-flow-col auto-cols-[86%] gap-2.5 overflow-x-auto overscroll-x-contain pb-1 lg:mt-5 lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-[1fr_1fr_1.08fr] lg:gap-3 lg:overflow-visible lg:pb-0">
          <article className="group relative flex min-w-0 snap-start flex-col overflow-hidden rounded-[20px] border border-fuchsia-100/15 bg-[radial-gradient(circle_at_0%_0%,rgba(244,114,182,0.12),transparent_32%),linear-gradient(155deg,rgba(255,255,255,0.065),rgba(255,255,255,0.022))] p-3.5 sm:p-4 lg:rounded-[24px] lg:border-fuchsia-100/20 lg:bg-[radial-gradient(circle_at_0%_0%,rgba(244,114,182,0.11),transparent_34%),linear-gradient(155deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] lg:p-5 lg:shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
            <div className="pointer-events-none absolute inset-x-8 top-0 hidden h-px bg-gradient-to-r from-transparent via-fuchsia-100/65 to-transparent lg:block" aria-hidden="true" />
            <div className="flex items-center justify-between gap-3">
              <p className="relative z-10 text-[9px] font-semibold uppercase tracking-[0.16em] text-fuchsia-100/70 lg:rounded-full lg:border lg:border-fuchsia-100/18 lg:bg-[#17101f] lg:px-2.5 lg:py-1.5 lg:text-[10px] lg:text-fuchsia-50/82">01 · Venue level</p>
              <MapPin size={14} className="text-fuchsia-100/44" aria-hidden="true" />
            </div>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-white lg:mt-5 lg:text-[1.35rem]">Venue Intelligence</h3>
            <p className="mt-1 hidden text-[13px] leading-5 text-white/70 sm:block lg:mt-2 lg:text-[14px] lg:leading-6 lg:text-white/76">
              Queue patterns, best nights, crowd, practical dress code and inclusion—distilled from trusted sources, reviews and local knowledge.
            </p>

            <div className="mt-2.5 rounded-[15px] border border-white/10 bg-black/18 p-2.5 sm:mt-3 lg:mt-5 lg:rounded-[18px] lg:border-white/12 lg:bg-black/22 lg:p-3.5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-cyan-50/78">
                <Sparkles size={10} aria-hidden="true" />
                {hasVenueExample ? `${venue.name} · ${formatLabel(venue.city)}` : "Inside a venue profile"}
              </p>
              <p className="mt-1.5 line-clamp-2 text-[12px] leading-[1.2rem] text-white/84 lg:mt-2 lg:text-[13px] lg:leading-[1.35rem] lg:text-white/88">
                {hasVenueExample ? proof : "See practical, source-backed context before choosing where to go."}
              </p>
            </div>

            <div className="mt-auto flex items-start pt-3">
              <Link
                href={hasVenueExample ? venueHref : "/cities"}
                onClick={onOpen}
                className="inline-flex min-h-11 items-center justify-between gap-1 text-[11px] font-semibold text-cyan-50/86 transition hover:text-white sm:min-h-0 sm:text-[12px] lg:h-10 lg:min-h-10 lg:whitespace-nowrap lg:justify-center lg:self-start lg:rounded-full lg:border lg:border-fuchsia-100/22 lg:bg-fuchsia-100/[0.08] lg:px-3.5 lg:text-[12px] lg:text-white lg:hover:border-fuchsia-100/38 lg:hover:bg-fuchsia-100/[0.13]"
              >
                <span className="lg:hidden">{hasVenueExample ? "Open venue" : "Explore venues"}</span>
                <span className="hidden lg:inline xl:hidden">{hasVenueExample ? "View evidence" : "Explore evidence"}</span>
                <span className="hidden xl:inline">{hasVenueExample ? "View venue evidence" : "Explore venue evidence"}</span>
                <ArrowUpRight size={11} aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="group relative flex min-w-0 snap-start flex-col overflow-hidden rounded-[20px] border border-cyan-100/15 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.10),transparent_34%),linear-gradient(155deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-3.5 sm:p-4 lg:rounded-[24px] lg:border-cyan-100/20 lg:bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.10),transparent_36%),linear-gradient(155deg,rgba(255,255,255,0.07),rgba(255,255,255,0.022))] lg:p-5 lg:shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
            <div className="pointer-events-none absolute inset-x-8 top-0 hidden h-px bg-gradient-to-r from-transparent via-cyan-100/65 to-transparent lg:block" aria-hidden="true" />
            <div className="flex items-center justify-between gap-3">
              <p className="relative z-10 text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-100/70 lg:rounded-full lg:border lg:border-cyan-100/18 lg:bg-[#0d1820] lg:px-2.5 lg:py-1.5 lg:text-[10px] lg:text-cyan-50/82">02 · Country context</p>
              <ShieldCheck size={14} className="text-cyan-100/44" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 lg:mt-5">
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-white lg:text-[1.35rem]">
                <span className="text-sky-200 sm:hidden">QARI</span>
                <span className="hidden sm:inline">What is QARI?</span>
              </h3>
              <span className="flex items-center gap-1" aria-hidden="true">
                {QARI_COLORS.map((color) => (
                  <span key={color} className="h-2 w-2 rounded-full shadow-[0_0_9px_currentColor]" style={{ backgroundColor: color, color }} />
                ))}
              </span>
            </div>
            <p className="mt-1 hidden text-[13px] leading-5 text-white/70 sm:block lg:mt-2 lg:text-[14px] lg:leading-6 lg:text-white/76">
              QARI, the Queer Atlas Risk Index, combines legal risk, social reality, and digital and enforcement risk into a transparent country-level travel signal.
            </p>

            <div className="mt-3 grid grid-cols-3 gap-1.5 lg:mt-5 lg:gap-2" aria-label="QARI score weights">
              {[
                ["Legal", "35%", "border-blue-200/16 bg-blue-300/[0.07] text-blue-100/70"],
                ["Social", "40%", "border-emerald-200/16 bg-emerald-300/[0.07] text-emerald-100/70"],
                ["Digital", "25%", "border-amber-200/16 bg-amber-300/[0.07] text-amber-100/70"],
              ].map(([label, value, tone]) => (
                <div key={label} className={`rounded-[13px] border px-2 py-2 lg:rounded-[16px] lg:px-3 lg:py-3 ${tone}`}>
                  <p className="text-[9px] font-medium uppercase tracking-[0.1em] opacity-85 lg:text-[10px]">{label}</p>
                  <p className="mt-0.5 text-[15px] font-semibold tabular-nums lg:mt-1 lg:text-[18px]">{value}</p>
                </div>
              ))}
            </div>

            <p className="mt-2.5 rounded-xl border border-white/12 bg-white/[0.045] px-2.5 py-2 text-center text-[13px] font-semibold leading-5 tracking-[0.02em] text-white/84 sm:hidden" aria-label="Queer Atlas Risk Index">
              <span className="text-[13px] font-bold text-sky-200">Q</span>ueer{" "}
              <span className="text-[13px] font-bold text-sky-200">A</span>tlas{" "}
              <span className="text-[13px] font-bold text-sky-200">R</span>isk{" "}
              <span className="text-[13px] font-bold text-sky-200">I</span>ndex
            </p>

            <Link
              href="/cities"
              onClick={() => onContextOpen?.("/cities")}
              className="mt-auto flex min-h-11 items-center justify-between gap-2 pt-3 text-[11px] font-semibold text-cyan-50/86 transition hover:text-white sm:min-h-0 sm:text-[12px] lg:mt-auto lg:h-10 lg:min-h-10 lg:whitespace-nowrap lg:justify-center lg:self-start lg:rounded-full lg:border lg:border-cyan-100/24 lg:bg-cyan-100/[0.09] lg:px-3.5 lg:py-0 lg:text-white lg:hover:border-cyan-100/40 lg:hover:bg-cyan-100/[0.14]"
            >
              Explore the QARI world map <ArrowUpRight size={11} aria-hidden="true" />
            </Link>
          </article>

          <article className="group relative flex min-w-0 snap-start flex-col overflow-hidden rounded-[20px] border border-violet-100/15 bg-[radial-gradient(circle_at_100%_0%,rgba(167,139,250,0.13),transparent_34%),linear-gradient(155deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-3.5 sm:p-4 lg:rounded-[24px] lg:border-violet-100/30 lg:bg-[radial-gradient(circle_at_100%_0%,rgba(167,139,250,0.20),transparent_38%),linear-gradient(155deg,rgba(139,92,246,0.12),rgba(255,255,255,0.03))] lg:p-5 lg:shadow-[0_22px_55px_rgba(76,29,149,0.20)]">
            <div className="pointer-events-none absolute inset-x-8 top-0 hidden h-px bg-gradient-to-r from-transparent via-violet-100/75 to-transparent lg:block" aria-hidden="true" />
            <div className="flex items-center justify-between gap-3">
              <p className="relative z-10 text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-100/70 lg:rounded-full lg:border lg:border-violet-100/24 lg:bg-[#171226] lg:px-2.5 lg:py-1.5 lg:text-[10px] lg:text-violet-50/88">03 · Global research</p>
              <ChartNoAxesCombined size={14} className="text-violet-100/44" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 lg:mt-5 lg:flex-col lg:items-start lg:gap-2 xl:flex-row xl:items-center xl:gap-3">
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-white lg:text-[1.35rem]">Queer Atlas Indexes</h3>
              <span className="hidden rounded-full border border-violet-100/28 bg-violet-100/[0.10] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-violet-50/90 lg:inline-flex">Flagship 2026</span>
            </div>
            <p className="mt-1 hidden text-[13px] leading-5 text-white/70 sm:block lg:mt-2 lg:text-[14px] lg:leading-6 lg:text-white/78">
              Compare cities and destinations through transparent, source-backed global research.
            </p>

            <Link
              href="/reports/global-queer-safety-culture-index-methodology"
              onClick={() => onContextOpen?.("/reports/global-queer-safety-culture-index-methodology")}
              className="mt-3 rounded-[15px] border border-violet-100/16 bg-violet-100/[0.07] p-2.5 transition hover:border-violet-100/30 hover:bg-violet-100/[0.10] lg:mt-5 lg:rounded-[18px] lg:border-amber-100/34 lg:bg-[linear-gradient(135deg,rgba(251,191,36,0.16),rgba(244,114,182,0.13)_52%,rgba(34,211,238,0.08))] lg:p-3.5 lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_30px_rgba(251,191,36,0.07)] lg:hover:border-amber-100/52 lg:hover:brightness-110"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="text-[12px] font-semibold leading-[1.1rem] text-violet-50/92 lg:text-[14px] lg:leading-5 lg:text-amber-50">Global Queer Safety &amp; Culture Index 2026</span>
                <ArrowUpRight size={11} className="mt-0.5 shrink-0 text-violet-100/44" aria-hidden="true" />
              </span>
              <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.09em] text-violet-100/68 lg:mt-2 lg:text-[10px] lg:text-amber-50/76">Legal protection 50% · Lived acceptance 50%</span>
            </Link>

            <nav aria-label="More Queer Atlas indexes" className="mt-2 flex flex-wrap gap-1 lg:hidden">
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
              className="mt-auto flex min-h-11 items-center justify-between gap-2 pt-3 text-[11px] font-semibold text-violet-50/84 transition hover:text-white sm:min-h-0 sm:text-[12px] lg:mt-auto lg:h-10 lg:min-h-10 lg:whitespace-nowrap lg:justify-center lg:self-start lg:rounded-full lg:border lg:border-amber-100/42 lg:bg-[linear-gradient(135deg,rgba(251,191,36,0.25),rgba(244,114,182,0.20))] lg:px-3.5 lg:py-0 lg:text-amber-50 lg:shadow-[0_10px_28px_rgba(251,191,36,0.10)] lg:hover:border-amber-50/65 lg:hover:brightness-110"
            >
              <span className="lg:hidden">View all indexes &amp; reports</span>
              <span className="hidden lg:inline">Open flagship index</span>
              <ArrowUpRight size={11} aria-hidden="true" />
            </Link>
          </article>
        </div>

      </div>
    </section>
  );
}
