"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Compass,
  History,
  Map,
  Megaphone,
  Newspaper,
  Quote,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const DISCOVERY_ICONS = {
  Cities: Map,
  Events: CalendarDays,
  News: Newspaper,
  Collections: BookOpen,
};

const PULSE_ICONS = {
  "next-event": CalendarDays,
  "latest-news": Newspaper,
  "top-city": Map,
  "local-pick": Map,
};

const PARTICIPATION_ICONS = {
  Community: UsersRound,
  Contribute: Megaphone,
};

const EDITORIAL_PATHS = [
  { href: "/verification", label: "Verification", icon: ShieldCheck },
  { href: "/sources-and-reviews", label: "Sources & reviews", icon: Quote },
  { href: "/contributors", label: "Named contributors", icon: UsersRound },
  { href: "/corrections", label: "Corrections", icon: History },
];

function DiscoveryCard({ item }) {
  const Icon = DISCOVERY_ICONS[item.icon] || Compass;

  return (
    <button
      type="button"
      onClick={item.onClick}
      className={`qa-premium-card group relative min-h-[6.75rem] overflow-hidden rounded-[22px] border p-3.5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.3)] transition duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:min-h-[8rem] sm:p-4 ${item.surface}`}
    >
      <div className={`pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full blur-2xl transition duration-500 group-hover:scale-125 ${item.glow}`} />
      <div className={`absolute inset-x-5 top-0 h-px bg-gradient-to-r ${item.accentLine}`} />
      <div className="relative flex h-full min-h-[4.75rem] flex-col sm:min-h-[6rem]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="!text-left text-lg font-semibold leading-none tracking-[-0.025em] text-white sm:text-xl">{item.title}</h3>
            <p className="mt-2 hidden max-w-[13rem] !text-left text-[10px] leading-[1.45] text-white/62 sm:block sm:text-xs">
              <span>{item.description}</span>
            </p>
          </div>
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-[0_12px_30px_rgba(0,0,0,0.25)] sm:h-9 sm:w-9 ${item.iconSurface}`}>
          <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
          </span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className={`truncate text-[9px] font-semibold uppercase tracking-[0.13em] ${item.metricClass}`}>{item.metric}</span>
          <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/10 text-white/46 transition duration-300 group-hover:border-white/24 group-hover:bg-white/10 group-hover:text-white sm:flex">
            <ArrowUpRight size={12} aria-hidden="true" />
          </span>
        </div>
      </div>
    </button>
  );
}

function PulseCard({ item, featured = false }) {
  const Icon = PULSE_ICONS[item.key] || Activity;

  return (
    <button
      type="button"
      onClick={item.onClick}
      className={`qa-premium-card group relative w-full overflow-hidden rounded-[22px] border p-3.5 text-left shadow-[0_16px_42px_rgba(0,0,0,0.25)] transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45 sm:min-h-[9.25rem] sm:p-4 ${featured ? "col-span-2 min-h-[9.25rem] lg:col-span-1" : "min-h-[8.25rem]"} ${item.cardClass}`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.065] text-white/82">
              <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate !text-left text-[9px] font-semibold uppercase tracking-[0.16em] text-white/70">{item.subtitle}</p>
              {item.meta ? <p className="mt-0.5 truncate !text-left text-[10px] text-white/38">{item.meta}</p> : null}
            </div>
          </div>
          {item.badge ? (
            <span className={`${featured ? "inline-flex" : "hidden sm:inline-flex"} shrink-0 rounded-full border px-2 py-1 text-[8px] uppercase tracking-[0.11em] ${item.badgeClass}`}>
              {item.badge}
            </span>
          ) : null}
        </div>

        <p className="mt-3 line-clamp-2 !text-left text-sm font-semibold leading-5 tracking-[-0.01em] text-white sm:text-[15px]">
          {item.title}
        </p>
        <p className={`${featured ? "line-clamp-1" : "hidden sm:line-clamp-1"} mt-1 !text-left text-[11px] leading-4 text-white/48`}>
          {item.description}
        </p>

        <div className="mt-auto flex items-center justify-end pt-3">
          <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-white/48 transition group-hover:text-white/78">
            {item.ctaLabel} <ArrowUpRight size={11} aria-hidden="true" />
          </span>
        </div>
      </div>
    </button>
  );
}

function ParticipationStrip({ actions = [] }) {
  if (actions.length === 0) return null;

  return (
    <section id="home-participation" data-home-section="participation" className="qa-defer-render mt-8 scroll-mt-20">
      <div className="qa-premium-card relative overflow-hidden rounded-[28px] border border-rose-100/14 bg-[radial-gradient(circle_at_4%_10%,rgba(251,113,133,0.16),transparent_30%),radial-gradient(circle_at_93%_85%,rgba(45,212,191,0.13),transparent_31%),linear-gradient(135deg,rgba(43,20,43,0.97),rgba(13,22,32,0.98)_56%,rgba(13,27,31,0.98))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.3)] sm:p-5">
        <div className="pointer-events-none absolute -left-8 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-rose-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-6 bottom-0 h-24 w-24 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-rose-100/35 to-transparent" />

        <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(30rem,0.92fr)] lg:items-center">
            <div className="min-w-0 lg:border-l lg:border-rose-200/22 lg:pl-4">
              <p className="flex items-center gap-2 !text-left text-[9px] font-semibold uppercase tracking-[0.2em] text-rose-100/66">
                <span className="flex -space-x-1" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full border border-[#2b142b] bg-rose-300" />
                  <span className="h-2.5 w-2.5 rounded-full border border-[#2b142b] bg-violet-300" />
                  <span className="h-2.5 w-2.5 rounded-full border border-[#2b142b] bg-teal-300" />
                </span>
                Powered by lived experience
              </p>
              <h2 className="qa-display mt-2 !text-left text-2xl font-semibold tracking-[-0.035em] text-white sm:text-[2rem]">
                Make the atlas feel more like us.
              </h2>
              <p className="mt-2 hidden max-w-2xl !text-left text-[13px] leading-5 text-white/58 sm:block sm:text-sm">
                Share a story, add a place, or update what changed. Local knowledge is what keeps Queer Atlas useful.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {actions.map((item) => {
                const Icon = PARTICIPATION_ICONS[item.icon] || Compass;
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={item.onClick}
                    className={`group relative min-h-[5rem] overflow-hidden rounded-[20px] border p-2.5 text-left shadow-[0_14px_36px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 sm:p-3 ${item.cardClass}`}
                >
                  <span className={`pointer-events-none absolute -right-5 -top-7 h-16 w-16 rounded-full blur-2xl ${item.glowClass}`} />
                  <span className={`absolute inset-x-4 top-0 h-px bg-gradient-to-r ${item.lineClass}`} />
                  <div className="relative flex items-center gap-2.5">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-[0_10px_26px_rgba(0,0,0,0.22)] sm:h-9 sm:w-9 ${item.iconClass}`}>
                      <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block whitespace-nowrap text-[13px] font-semibold tracking-[-0.01em] text-white sm:text-sm">{item.title}</span>
                      <span className="mt-1 block whitespace-nowrap text-[8px] text-white/50 sm:hidden">{item.shortLabel}</span>
                      <span className="mt-1 hidden truncate text-[10px] text-white/52 sm:block">{item.label}</span>
                    </span>
                    <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/10 text-white/38 transition group-hover:border-white/22 group-hover:bg-white/9 group-hover:text-white/82 sm:flex">
                      <ArrowUpRight size={12} aria-hidden="true" />
                    </span>
                  </div>
                </button>
                );
              })}
            </div>
        </div>
      </div>
    </section>
  );
}

function TrustSupportStrip({ onAction, contactSlot }) {
  return (
    <section id="home-editorial-trust" data-home-section="editorial_trust" className="qa-defer-render mt-8 scroll-mt-20" aria-label="Queer Atlas trust and support">
      <div className="qa-premium-card relative overflow-hidden rounded-[28px] border border-cyan-100/12 bg-[radial-gradient(circle_at_4%_5%,rgba(34,211,238,0.13),transparent_30%),radial-gradient(circle_at_96%_92%,rgba(232,121,249,0.12),transparent_31%),linear-gradient(145deg,rgba(9,19,25,0.98),rgba(14,10,22,0.98))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.3)] sm:p-5">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/34 to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent lg:block" />

        <div className="relative grid gap-5 lg:grid-cols-2 lg:gap-10">
          <div className="min-w-0 lg:pr-2">
            <p className="flex items-center gap-2 !text-left text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-100/60">
              <ClipboardCheck size={13} strokeWidth={1.8} aria-hidden="true" />
              Editorial standards
            </p>
            <h2 className="qa-display mt-2 !text-left text-2xl font-semibold tracking-[-0.035em] text-white sm:text-[1.75rem]">
              How we verify what you see.
            </h2>
            <p className="mt-2 hidden max-w-xl !text-left text-[13px] leading-5 text-white/54 sm:block sm:text-sm">
              See how we check places, use reviews, credit contributors and record corrections.
            </p>
            <nav aria-label="Queer Atlas editorial standards" className="mt-3 grid grid-cols-2 overflow-hidden rounded-[20px] border border-cyan-100/14 bg-black/10 sm:mt-4">
              {EDITORIAL_PATHS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onAction?.(item.href)}
                    className="group relative flex min-h-[3.75rem] items-center gap-2 border-b border-r border-white/8 px-2.5 py-2.5 text-left transition duration-300 even:border-r-0 hover:bg-cyan-100/[0.06] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300/45 sm:min-h-[4.5rem] sm:gap-2.5 sm:px-3 sm:py-3 [&:nth-last-child(-n+2)]:border-b-0"
                  >
                    <Icon size={14} strokeWidth={1.8} className="shrink-0 text-cyan-100/48 transition group-hover:text-cyan-100" aria-hidden="true" />
                    <span className="min-w-0 flex-1 text-[10px] font-medium leading-4 text-white/66 transition group-hover:text-cyan-50 sm:text-[11px]">
                      {item.label}
                    </span>
                    <ArrowUpRight size={11} className="shrink-0 text-white/26 transition group-hover:text-white/68" aria-hidden="true" />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="min-w-0 border-t border-white/9 pt-5 lg:border-l-0 lg:border-t-0 lg:pl-2 lg:pt-0">
            {contactSlot}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomeDeferredSections({
  discoveryCards = [],
  livePulseCards = [],
  localContext = null,
  onLocalCityChange,
  participationActions = [],
  onEditorialAction,
  contactSlot = null,
}) {
  return (
    <>
      <section id="home-discovery" data-home-section="discovery" className="qa-defer-render mt-8 scroll-mt-20">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_8%_0%,rgba(91,119,255,0.12),transparent_31%),radial-gradient(circle_at_94%_12%,rgba(217,70,239,0.1),transparent_28%),linear-gradient(155deg,rgba(14,17,29,0.96),rgba(8,10,18,0.98))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-5">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/24 to-transparent" />
          <div className="relative mb-4 sm:flex sm:items-end sm:justify-between sm:gap-6">
            <p className="mb-2 !text-left text-[9px] font-semibold uppercase tracking-[0.2em] text-sky-100/58 sm:mb-1.5">Explore Queer Atlas</p>
            <h2 className="qa-display mt-2 !text-left text-2xl font-semibold tracking-[-0.03em] text-white sm:text-[2rem]">
              What do you want to find?
            </h2>
          </div>
          <div className="relative grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            {discoveryCards.map((item) => (
              <DiscoveryCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      {livePulseCards.length > 0 ? (
        <section data-home-section="live" className="qa-defer-render mt-8">
          <div className="qa-atlas-section">
            <div className="mb-4">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 !text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/66">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(125,211,252,0.75)]" />
                  Live now
                </p>
                {localContext?.cityOptions?.length ? (
                  <label className="flex shrink-0 items-center gap-2 rounded-full border border-white/11 bg-black/20 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.12em] text-white/38">
                    <span className="hidden sm:inline">Local focus</span>
                    <select
                      aria-label="Choose local city"
                      value={localContext.city || ""}
                      onChange={(event) => onLocalCityChange?.(event.target.value)}
                      className="max-w-[8.5rem] bg-transparent text-[10px] font-semibold normal-case tracking-normal text-white/76 outline-none sm:max-w-[11rem]"
                    >
                      {localContext.cityOptions.map((city) => (
                        <option key={city} value={city} className="bg-[#111118] text-white">
                          {String(city).replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
              <h2 className="qa-display mt-2 !text-left text-2xl font-semibold tracking-[-0.03em] text-white sm:text-[2rem]">
                Happening across the atlas
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {livePulseCards.map((item, index) => (
                <PulseCard key={item.key} item={item} featured={index === 0} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ParticipationStrip actions={participationActions} />

      <TrustSupportStrip onAction={onEditorialAction} contactSlot={contactSlot} />

      <section className="qa-defer-render mt-7 pb-24 sm:mt-10 sm:pb-4">
        <div className="hidden rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-3.5 opacity-75 sm:block">
          <div className="mx-auto flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/45">
            <span className="mr-1 uppercase tracking-[0.18em] text-white/32">Discover paths</span>
            <Link href="/gay-guide" className="rounded-full border border-fuchsia-200/14 bg-fuchsia-200/[0.05] px-2.5 py-1 text-fuchsia-100/70 transition hover:border-fuchsia-200/30 hover:text-fuchsia-100">Gay Guide</Link>
            <Link href="/queer-guide" className="rounded-full border border-cyan-200/14 bg-cyan-200/[0.05] px-2.5 py-1 text-cyan-100/70 transition hover:border-cyan-200/30 hover:text-cyan-100">Queer Guide</Link>
            <Link href="/hbtq-guide" className="rounded-full border border-amber-200/14 bg-amber-200/[0.05] px-2.5 py-1 text-amber-100/70 transition hover:border-amber-200/30 hover:text-amber-100">HBTQ Guide</Link>
            <Link href="/topics/nightlife" className="rounded-full border border-cyan-200/14 bg-cyan-200/[0.05] px-2.5 py-1 text-cyan-100/70 transition hover:border-cyan-200/30 hover:text-cyan-100">Nightlife hub</Link>
            <Link href="/topics/safety" className="rounded-full border border-cyan-200/14 bg-cyan-200/[0.05] px-2.5 py-1 text-cyan-100/70 transition hover:border-cyan-200/30 hover:text-cyan-100">Safety hub</Link>
            <Link href="/berlin/discover/queer-techno-clubs" className="rounded-full border border-white/14 bg-white/[0.04] px-2.5 py-1 text-white/70 transition hover:border-white/24 hover:text-white/90">Berlin techno</Link>
            <Link href="/new_york/discover/events-tonight" className="rounded-full border border-white/14 bg-white/[0.04] px-2.5 py-1 text-white/70 transition hover:border-white/24 hover:text-white/90">New York tonight</Link>
            <Link href="/bangkok/discover/queer-cafes" className="rounded-full border border-white/14 bg-white/[0.04] px-2.5 py-1 text-white/70 transition hover:border-white/24 hover:text-white/90">Bangkok cafes</Link>
            <Link href="/madrid/discover/lesbian-nightlife" className="rounded-full border border-white/14 bg-white/[0.04] px-2.5 py-1 text-white/70 transition hover:border-white/24 hover:text-white/90">Madrid community</Link>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] text-white/45">
          <Link href="/about" className="underline underline-offset-2 transition hover:text-white">About</Link>
          <span className="text-white/25">|</span>
          <Link href="/editorial-policy" className="underline underline-offset-2 transition hover:text-white">Editorial standards</Link>
          <span className="text-white/25">|</span>
          <Link href="/corrections" className="underline underline-offset-2 transition hover:text-white">Corrections</Link>
          <span className="text-white/25">|</span>
          <Link href="/contact" className="underline underline-offset-2 transition hover:text-white">Contact & press</Link>
          <span className="text-white/25">|</span>
          <Link href="/privacy" className="underline underline-offset-2 transition hover:text-white">Privacy Policy</Link>
          <span className="text-white/25">|</span>
          <Link href="/terms" className="underline underline-offset-2 transition hover:text-white">Terms</Link>
        </div>
      </section>
    </>
  );
}
